import { DEFAULT_MODEL, LIMITS, buildInference, decodeMatches, prepareCatalog, parseStrictJSON, validateInput } from './job-matching.mjs';

export const RESERVE_SQL = `INSERT INTO job_requests(id, client_hash, day, created_at, lease_until)
SELECT ?, ?, ?, ?, ?
WHERE NOT EXISTS (SELECT 1 FROM job_daily_blocks WHERE day = ?)
AND (SELECT COUNT(*) FROM job_requests WHERE day = ?) < ?
AND NOT EXISTS (SELECT 1 FROM job_requests WHERE client_hash = ? AND lease_until > ?)`;
const DAY = 86400000;
const leaseDuration = 90000;
export const dailyReset = now => new Date(Math.floor(now / DAY) * DAY + DAY).toISOString();
const dayKey = now => new Date(now).toISOString().slice(0, 10);
// An application abuse ceiling, not a guarantee of remaining provider capacity.
// The Free-plan provider quota and shared exhaustion circuit remain authoritative.
const dailyCap = env => Math.min(50, Math.max(1, Number.parseInt(env.JOB_DAILY_LIMIT, 10) || 50));
function response(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
function failure(code, retryAt, quota) {
  const status = { disabled: 503, invalid_input: 400, context_limit: 422, rate_limited: 429, daily_limit: 429, busy: 409, timeout: 504, invalid_output: 502, unavailable: 503 }[code] || 503;
  const result = response({ error: { code, ...(retryAt ? { retryAt } : {}) }, ...(quota ? { quota } : {}) }, status);
  if (retryAt) result.headers.set('Retry-After', new Date(retryAt).toUTCString());
  return result;
}
export function providerFailure(error) {
  // Never forward provider messages: they can include request content or details.
  const text = `${error?.code || ''} ${error?.message || ''} ${JSON.stringify(error?.errors || [])}`;
  if (/\b3036\b/.test(text) || /used up your daily free allocation of 10,000 neurons/i.test(text)) return 'daily_limit';
  if (/\b300[78]\b/.test(text)) return 'timeout';
  if (/\b3040\b/.test(text)) return 'unavailable';
  if (error?.status === 429 || error?.statusCode === 429) return 'rate_limited';
  return 'unavailable';
}
async function readBody(request, timeoutMs) {
  const declared = Number(request.headers.get('Content-Length'));
  if (declared > LIMITS.bodyBytes) throw new Error('invalid_input');
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '') || !request.body) throw new Error('invalid_input');
  const reader = request.body.getReader(); const chunks = []; let size = 0;
  let timer;
  const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('body_timeout')), timeoutMs); });
  try {
    for (;;) {
      const { value, done } = await Promise.race([reader.read(), deadline]); if (done) break;
      size += value.byteLength;
      if (size > LIMITS.bodyBytes) throw new Error('invalid_input');
      chunks.push(value);
    }
  } finally { clearTimeout(timer); void reader.cancel().catch(() => {}); reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return validateInput(parseStrictJSON(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
}
async function clientHash(request, secret) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip || ip.length > 64) throw new Error('unavailable');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  // A stable pseudonym prevents overlapping requests across midnight.
  // An eligible POST deletes rows older than two days; there is no automatic SQL
  // expiration. No raw address or job text is stored.
  const hash = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
async function readQuota(db, day, cap, started) {
  const state = await db.prepare('SELECT (SELECT COUNT(*) FROM job_requests WHERE day = ?) AS used, (SELECT COUNT(*) FROM job_daily_blocks WHERE day = ?) AS blocked').bind(day, day).first();
  return { limit: cap, used: Number(state.used), remaining: state.blocked ? 0 : Math.max(0, cap - Number(state.used)), resetAt: dailyReset(started), providerBlocked: !!state.blocked };
}
export function createJobHandler(catalog, { timeoutMs = 25000, bodyTimeoutMs = 5000, now = Date.now, log = entry => console.info(JSON.stringify(entry)) } = {}) {
  prepareCatalog(catalog);
  async function handleJob(request, env, metrics) {
    if (!['GET', 'POST'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, POST', 'Cache-Control': 'no-store' } });
    if (env.JOB_PREP_ENABLED !== 'true' || !env.AI?.run || !env.JOB_DB?.prepare || typeof env.JOB_RATE_SECRET !== 'string' || env.JOB_RATE_SECRET.length < 32) return failure('disabled');
    const started = now(); const day = dayKey(started); const db = env.JOB_DB;
    let reservation; let retainLease = false;
    try {
      let input;
      if (request.method === 'POST') {
        // Reject malformed and cross-origin traffic before spending D1 quota.
        // Origin validation is a browser boundary, not bot authentication.
        if (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return failure('invalid_input');
        try { input = await readBody(request, bodyTimeoutMs); } catch (error) { return failure(error?.message === 'body_timeout' ? 'timeout' : 'invalid_input'); }
      }
      let quota = await readQuota(db, day, dailyCap(env), started);
      if (!quota.remaining) return failure('daily_limit', quota.resetAt, quota);
      if (request.method === 'GET') return response({ available: true, quota });
      const inference = buildInference(catalog, input);
      metrics.candidateCount = inference.candidates.length;
      if (inference.contextLimited) return failure('context_limit');
      // An unrelated description can be answered deterministically without spending AI quota.
      if (!inference.candidates.length) return response({ matches: [], quota });
      const client = await clientHash(request, env.JOB_RATE_SECRET);
      const id = crypto.randomUUID();
      await db.prepare('DELETE FROM job_requests WHERE created_at < ?').bind(started - 2 * DAY).run();
      await db.prepare('DELETE FROM job_daily_blocks WHERE day < ?').bind(dayKey(started - 2 * DAY)).run();
      const inserted = await db.prepare(RESERVE_SQL).bind(id, client, day, started, started + leaseDuration, day, day, dailyCap(env), client, started).run();
      if (!inserted.meta?.changes) {
        quota = await readQuota(db, day, dailyCap(env), started);
        if (!quota.remaining) return failure('daily_limit', quota.resetAt, quota);
        const state = await db.prepare('SELECT MAX(lease_until) AS lease FROM job_requests WHERE client_hash = ?').bind(client).first();
        return failure('busy', new Date(Math.max(started + 1000, state.lease || 0)).toISOString(), quota);
      }
      reservation = id;
      quota = await readQuota(db, day, dailyCap(env), started);
      let timer; let result;
      try {
        result = await Promise.race([
          env.AI.run(env.JOB_AI_MODEL || DEFAULT_MODEL, inference.request),
          new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('local_deadline')), timeoutMs); })
        ]);
      } catch (error) {
        if (error?.message === 'local_deadline') { retainLease = true; return failure('timeout', undefined, quota); }
        const code = providerFailure(error);
        if (code === 'daily_limit') {
          await db.prepare('INSERT OR IGNORE INTO job_daily_blocks(day) VALUES (?)').bind(day).run();
          return failure(code, dailyReset(started), { ...quota, remaining: 0, providerBlocked: true });
        }
        return failure(code, code === 'rate_limited' ? new Date(started + 60000).toISOString() : undefined, quota);
      } finally { clearTimeout(timer); }
      try {
        if (result?.usage && typeof result.usage === 'object') {
          const usage = Object.fromEntries(['prompt_tokens', 'completion_tokens', 'total_tokens'].filter(key => Number.isSafeInteger(result.usage[key]) && result.usage[key] >= 0).map(key => [key, result.usage[key]]));
          if (Object.keys(usage).length) metrics.usage = usage;
        }
        const data = typeof result?.response === 'string' ? parseStrictJSON(result.response) : result?.response;
        const validated = decodeMatches(data, input, inference);
        metrics.matchCount = validated.matches.length;
        return response({ ...validated, quota, ...(metrics.usage ? { usage: metrics.usage } : {}) });
      } catch { return failure('invalid_output', undefined, quota); }
    } catch { return failure('unavailable'); }
    finally {
      if (reservation && !retainLease) {
        try { await db.prepare('UPDATE job_requests SET lease_until = 0 WHERE id = ?').bind(reservation).run(); } catch { /* Fail closed: the bounded lease expires automatically. */ }
      }
    }
  }
  return async (request, env) => {
    const started = now(); const metrics = {};
    const result = await handleJob(request, env, metrics);
    // Static Pages _headers rules do not apply to Function responses.
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    result.headers.set('Referrer-Policy', 'no-referrer');
    try { log({ event: 'job_preparation', latencyMs: Math.max(0, now() - started), status: result.status, ...metrics }); } catch { /* Telemetry cannot affect the user response. */ }
    return result;
  };
}
