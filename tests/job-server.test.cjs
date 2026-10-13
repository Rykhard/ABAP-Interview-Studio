const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const modules = Promise.all([import('../server/job-matching.mjs'), import('../server/job-service.mjs')]);
const catalog = [
  { id: 'RAP-01', title: 'How does RAP save an order?', title_ru: 'Как RAP сохраняет заказ?', topic: 'RAP', section: 'Transactions', level: 'core' },
  { id: 'ABAP-01', title: 'When do you use hashed internal tables?', title_ru: 'Когда использовать хешированные таблицы?', topic: 'ABAP', section: 'Tables', level: 'core' },
  { id: 'AUTH-01', title: 'How do authorization checks protect data?', title_ru: 'Как проверять полномочия?', topic: 'Security', section: 'Authorization', level: 'core' }
];
const input = { description: 'We require RAP development and transaction handling. Authorization checks are preferred.', count: 5, language: 'en' };
const match = { id: 'RAP-01', requirement_evidence: 'RAP development', relevance_reason: 'Explains the requested RAP transaction behavior.', requirement_type: 'required' };
function request(body = input, extraHeaders = {}) {
  return new Request('https://studio.example/api/prepare-job', { method: 'POST', headers: { Origin: 'https://studio.example', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...extraHeaders }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(fs.readFileSync(path.join(__dirname, '../server/migrations/0001_job_guard.sql'), 'utf8'));
  return { sqlite, prepare(sql) { return { bind(...args) { return { async first() { return sqlite.prepare(sql).get(...args); }, async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } }; } }; } }; } };
}
function environment(db, run = async () => ({ response: { matches: [match] } })) {
  return { JOB_PREP_ENABLED: 'true', JOB_RATE_SECRET: 'test-secret-'.repeat(4), JOB_DB: db, AI: { run } };
}

test('public quota reflects reservations and usage exposes only valid provider token counts', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close());
  const handler = service.createJobHandler(catalog, { log: () => {} });
  const env = environment(db, async () => ({ response: { matches: [match] }, usage: { prompt_tokens: 200, completion_tokens: -3, total_tokens: '240', secret: 'private' } }));
  const get = () => handler(new Request('https://studio.example/api/prepare-job'), env);
  assert.equal((await (await get()).json()).quota.remaining, 8);
  const result = await (await handler(request(), env)).json();
  assert.deepEqual(result.usage, { prompt_tokens: 200 });
  assert.equal(result.quota.remaining, 7); assert.equal(result.quota.used, 1);
  assert.match(result.quota.resetAt, /T00:00:00\.000Z$/);
  assert.equal((await (await get()).json()).quota.remaining, 7);
  env.AI.run = async () => { throw new Error('provider failure'); };
  const failed = await (await handler(request(), env)).json();
  assert.equal(failed.quota.remaining, 6); assert.equal(failed.usage, undefined);
});

test('strict input and output validation rejects coercion, extra fields, invented evidence and duplicate IDs/keys', async () => {
  const [matching] = await modules;
  assert.deepEqual(matching.words('constructor __proto__'), ['constructor', '__proto__']);
  assert.deepEqual(matching.validateInput(input), input);
  for (const invalid of [{ ...input, count: '5' }, { ...input, count: 11 }, { ...input, language: 'de' }, { ...input, description: 'short' }, { ...input, description: 'я'.repeat(6000) }, { ...input, catalog }]) assert.throws(() => matching.validateInput(invalid));
  assert.deepEqual(matching.validateMatches({ matches: [match] }, input, catalog), { matches: [match] });
  for (const invalid of [{ matches: [match, match] }, { matches: [{ ...match, id: 'UNKNOWN' }] }, { matches: [{ ...match, requirement_evidence: 'RAP skills' }] }, { matches: [{ ...match, extra: true }] }, { matches: [], coverage: 1 }]) assert.throws(() => matching.validateMatches(invalid, input, catalog));
  for (const text of ['{"matches":[],"matches":[]}', '{"matches":[{"id":"x","id":"y"}]}', '```json\n{}\n```', '{} trailing', '{"x":NaN}', '{"x":1,}', '{"x":01}']) assert.throws(() => matching.parseStrictJSON(text));
  assert.deepEqual(matching.parseStrictJSON('{"x":"escaped \\" quote","array":[1,true,null]}'), { x: 'escaped " quote', array: [1, true, null] });
});

test('retrieval supports Russian titles and bounds complete prompts conservatively', async () => {
  const [matching] = await modules;
  assert.equal(matching.retrieveCandidates(catalog, 'Нужна проверка полномочий')[0].id, 'AUTH-01');
  assert.deepEqual(matching.retrieveCandidates(catalog, 'We need a chef cooking pastries daily'), []);
  const large = Array.from({ length: 200 }, (_, index) => ({ ...catalog[0], id: `RAP-${index}`, title: `RAP transaction ${'detail '.repeat(100)}` }));
  const built = matching.buildInference(large, input);
  assert.ok(built.candidates.length > 0 && built.candidates.length < 60);
  assert.ok(built.contextUpperBound <= 24000);
  assert.equal(built.request.temperature, 0);
  assert.equal(built.request.stream, false);
  assert.equal(built.request.max_tokens, 2300);
  assert.deepEqual(built.request.response_format.json_schema.properties.matches.items.properties.id.enum, built.candidates.map(item => item.id));
});

test('catalog indexing runs once before requests and cached question snapshots stay immutable', async () => {
  const [matching, service] = await modules; let reads = 0;
  const source = [{ ...catalog[0], get title() { reads++; return catalog[0].title; } }];
  service.createJobHandler(source, { log: () => {} });
  const startupReads = reads; assert.ok(startupReads > 0);
  for (let index = 0; index < 20; index++) matching.buildInference(source, input);
  assert.equal(reads, startupReads);
  const first = matching.retrieveCandidates(source, input.description)[0];
  assert.ok(Object.isFrozen(first));
  assert.equal(first.title, catalog[0].title);
});

test('evidence schema offers bounded exact excerpts without rewriting language or punctuation', async () => {
  const [matching] = await modules;
  const description = 'Required: RAP development; diagnose stale ETags.\nPreferred experience\nCDS view entities are useful but not required.\nОбязательно: проверять global и instance authorization в RAP.';
  const built = matching.buildInference(catalog, { ...input, description });
  const evidence = built.request.response_format.json_schema.properties.matches.items.properties.requirement_evidence.enum;
  assert.ok(evidence.includes('Required: RAP development;'));
  assert.ok(evidence.includes('CDS view entities are useful but not required.'));
  assert.ok(evidence.includes('Обязательно: проверять global и instance authorization в RAP.'));
  assert.ok(evidence.every(excerpt => description.includes(excerpt) && excerpt.length <= 300));
  assert.equal(JSON.parse(built.request.messages[1].content).job_description, description);
  assert.deepEqual(JSON.parse(built.request.messages[1].content).evidence_excerpts, evidence);
  const long = 'RAP ' + 'long responsibility requiring authorization checks '.repeat(100);
  const choices = matching.evidenceChoices(long, catalog);
  assert.ok(choices.length > 0);
  assert.ok(choices.every(excerpt => long.includes(excerpt) && excerpt.length >= 3 && excerpt.length <= 300));
  assert.ok(choices.reduce((sum, excerpt) => sum + Buffer.byteLength(JSON.stringify(excerpt)), 0) <= 4000);
});

test('feature is disabled without complete server configuration and rejects cross-origin/oversized/invalid requests before inference', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close()); let calls = 0;
  const env = environment(db, async () => { calls++; return { response: { matches: [] } }; }); const handler = service.createJobHandler(catalog);
  assert.equal((await (await handler(request(), {})).json()).error.code, 'disabled');
  for (const req of [request(input, { Origin: 'https://attacker.example' }), request('x'.repeat(17000)), request('{"description":"bad json"'), request(input, { 'Content-Type': 'text/plain' })]) assert.equal((await (await handler(req, env)).json()).error.code, 'invalid_input');
  assert.equal(calls, 0);
  assert.equal((await handler(request(), env)).headers.get('Cache-Control'), 'no-store');
  assert.equal(calls, 1);
  const rows = db.sqlite.prepare('SELECT * FROM job_requests').all();
  assert.equal(rows.length, 1); assert.equal(rows[0].client_hash.length, 64); assert.equal(rows[0].lease_until, 0);
  assert.ok(!JSON.stringify(rows).includes('192.0.2.1')); assert.ok(!JSON.stringify(rows).includes(input.description));
});

test('invalid requests spend no database quota and every response has restrictive headers', async () => {
  const [, service] = await modules; let databaseCalls = 0;
  const db = { prepare() { databaseCalls++; throw new Error('Database must not be touched'); } };
  const env = environment(db, async () => { throw new Error('AI must not be called'); });
  const handler = service.createJobHandler(catalog, { log: () => {} });
  const cases = [
    [request(input, { Origin: 'https://attacker.example' }), 400],
    [request(input, { 'Sec-Fetch-Site': 'cross-site' }), 400],
    [request('x'.repeat(17000)), 400],
    [request('{"description":"broken'), 400],
    [request(input, { 'Content-Type': 'text/plain' }), 400],
    [new Request('https://studio.example/api/prepare-job', { method: 'OPTIONS' }), 405]
  ];
  for (const [req, status] of cases) {
    const result = await handler(req, env);
    assert.equal(result.status, status);
    assert.equal(result.headers.get('Cache-Control'), 'no-store');
    assert.equal(result.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(result.headers.get('Referrer-Policy'), 'no-referrer');
    assert.match(result.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
    assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
  }
  assert.equal(databaseCalls, 0);
});

test('provider errors never expose secrets or job descriptions in responses and logs', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close());
  const secretMarker = 'synthetic-provider-secret-for-leak-test'; const logs = [];
  const handler = service.createJobHandler(catalog, { log: entry => logs.push(entry) });
  const env = environment(db, async () => { throw new Error(`${secretMarker}: ${input.description}`); });
  const result = await handler(request(), env);
  assert.equal(result.status, 503);
  const output = await result.text();
  assert.deepEqual(JSON.parse(output).error, { code: 'unavailable' });
  for (const captured of [output, JSON.stringify(logs)]) {
    assert.ok(!captured.includes(secretMarker));
    assert.ok(!captured.includes(input.description));
    assert.ok(!captured.includes(env.JOB_RATE_SECRET));
    assert.ok(!captured.includes('192.0.2.1'));
  }
});

test('retrieval preserves a short separate requirement alongside a dense topic', async () => {
  const [matching] = await modules;
  const canonical = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/catalog.json'), 'utf8'));
  const description = 'Обязательно: разработка RAP business objects, EML READ ENTITIES и MODIFY ENTITIES. Нужен опыт обработки FAILED и REPORTED. Желательно: использование ABAP Unit.';
  const built = matching.buildInference(canonical, { description, count: 3, language: 'ru' });
  const ids = new Set(built.candidates.map(item => item.id));
  for (const id of ['RAP-07', 'RAP-08', 'TEST-01']) assert.ok(ids.has(id), `${id} is available to the model`);
  assert.ok(built.candidates.length <= 60);
  assert.ok(built.contextUpperBound <= matching.LIMITS.contextTokens);
});

test('concurrent duplicate requests consume only one reservation and one model call', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close()); let calls = 0; let release;
  const env = environment(db, () => { calls++; return new Promise(resolve => { release = resolve; }); }); const handler = service.createJobHandler(catalog);
  const first = handler(request(), env);
  while (!release) await new Promise(resolve => setImmediate(resolve));
  const second = await handler(request(), env);
  assert.equal((await second.json()).error.code, 'busy'); assert.equal(calls, 1);
  release({ response: { matches: [match] } }); assert.equal((await first).status, 200);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS total FROM job_requests').get().total, 1);
});

test('atomic SQLite guard keeps the daily cap but allows more than three sequential client requests', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close()); let calls = 0;
  const handler = service.createJobHandler(catalog); const env = environment(db, async () => { calls++; return { response: { matches: [] } }; });
  for (let index = 0; index < 4; index++) assert.equal((await handler(request(), env)).status, 200);
  const results = await Promise.all(Array.from({ length: 12 }, (_, index) => handler(request(input, { 'CF-Connecting-IP': `192.0.2.${index + 10}` }), env)));
  assert.equal(results.filter(result => result.status === 200).length, 4); assert.equal(calls, 8);
  const status = await handler(new Request('https://studio.example/api/prepare-job'), env);
  const body = await status.json(); assert.equal(body.error.code, 'daily_limit'); assert.match(body.error.retryAt, /T00:00:00\.000Z$/);
});

test('provider daily exhaustion opens shared circuit; capacity and invalid output remain distinct', async t => {
  const [, service] = await modules;
  for (const [provider, expected] of [
    [async () => { throw Object.assign(new Error('Account limited'), { code: 3036 }); }, 'daily_limit'],
    [async () => { throw Object.assign(new Error('Capacity'), { code: 3040 }); }, 'unavailable'],
    [async () => ({ response: '```json\n{"matches":[]}\n```' }), 'invalid_output'],
    [async () => ({ response: { matches: [{ ...match, requirement_evidence: 'Invented requirement' }] } }), 'invalid_output']
  ]) {
    const db = database(); t.after(() => db.sqlite.close()); let calls = 0;
    const handler = service.createJobHandler(catalog); const env = environment(db, async () => { calls++; return provider(); });
    assert.equal((await (await handler(request(), env)).json()).error.code, expected);
    if (expected === 'daily_limit') { assert.equal((await (await handler(request(input, { 'CF-Connecting-IP': '192.0.2.99' }), env)).json()).error.code, 'daily_limit'); assert.equal(calls, 1); }
    assert.equal(db.sqlite.prepare('SELECT lease_until FROM job_requests').get().lease_until, 0);
  }
});

test('local timeout keeps bounded lease and reservation while provider may still run', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close());
  const handler = service.createJobHandler(catalog, { timeoutMs: 5 }); const env = environment(db, () => new Promise(() => {}));
  assert.equal((await (await handler(request(), env)).json()).error.code, 'timeout');
  assert.ok(db.sqlite.prepare('SELECT lease_until FROM job_requests').get().lease_until > Date.now());
  assert.equal((await (await handler(request(), env)).json()).error.code, 'busy');
});

test('inflight lease survives the UTC daily reset without imposing an hourly client limit', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close());
  let time = Date.parse('2026-10-13T23:59:58Z'); let release;
  const handler = service.createJobHandler(catalog, { now: () => time, log: () => {} });
  const env = environment(db, () => new Promise(resolve => { release = resolve; }));
  const first = handler(request(), env);
  while (!release) await new Promise(resolve => setImmediate(resolve));
  time += 3000;
  assert.equal((await (await handler(request(), env)).json()).error.code, 'busy');
  release({ response: { matches: [] } }); await first;
  env.AI.run = async () => ({ response: { matches: [] } });
  for (let index = 0; index < 2; index++) assert.equal((await handler(request(), env)).status, 200);
  assert.equal((await handler(request(), env)).status, 200);
});

test('body deadline is bounded and operational telemetry excludes private content and provider details', async t => {
  const [, service] = await modules; const db = database(); t.after(() => db.sqlite.close()); const logs = [];
  const handler = service.createJobHandler(catalog, { bodyTimeoutMs: 5, log: entry => logs.push(entry) });
  const env = environment(db, async () => ({ response: { matches: [match] }, usage: { total_tokens: 500, prompt_tokens: 400, completion_tokens: 100, secret: input.description } }));
  const slow = new Request('https://studio.example/api/prepare-job', { method: 'POST', duplex: 'half', headers: { Origin: 'https://studio.example', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' }, body: new ReadableStream({ start() {} }) });
  assert.equal((await (await handler(slow, env)).json()).error.code, 'timeout');
  assert.equal((await handler(request(), env)).status, 200);
  assert.equal(logs[1].matchCount, 1); assert.equal(logs[1].usage.total_tokens, 500);
  for (const privateValue of [input.description, '192.0.2.1', env.JOB_RATE_SECRET, match.relevance_reason]) assert.ok(!JSON.stringify(logs).includes(privateValue));
  assert.deepEqual(Object.keys(logs[1]).sort(), ['candidateCount', 'event', 'latencyMs', 'matchCount', 'status', 'usage']);
});
