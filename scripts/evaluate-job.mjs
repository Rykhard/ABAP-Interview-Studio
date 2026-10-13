// Offline retrieval evaluation by default; live inference requires explicit flags.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInference, DEFAULT_MODEL, parseStrictJSON, validateMatches } from '../server/job-matching.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixtures = JSON.parse(await readFile(resolve(root, 'evals/job-preparation.json'), 'utf8'));
const catalog = JSON.parse(await readFile(resolve(root, 'server/catalog.json'), 'utf8'));
const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const live = args.includes('--live');
const selected = option('--case') ? fixtures.filter(item => item.name === option('--case')) : fixtures;
if (!selected.length) throw new Error('No matching evaluation fixture');
const maxRequests = Number(option('--max-requests') || 1);
if (!Number.isInteger(maxRequests) || maxRequests < 1 || maxRequests > 8) throw new Error('Maximum live requests must be between 1 and 8');
if (live && selected.length > maxRequests) throw new Error('Select a case or explicitly authorize --max-requests (at most 8)');
const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const model = process.env.JOB_AI_MODEL || DEFAULT_MODEL;
if (live && (!token || !/^[a-f0-9]{32}$/i.test(account || ''))) throw new Error('Supply Cloudflare credentials through the process environment');
const report = { mode: live ? 'live' : 'retrieval-only', model, timestamp: new Date().toISOString(),
  catalogSha256: createHash('sha256').update(JSON.stringify(catalog)).digest('hex'), cases: [] };
let failures = 0;
for (const fixture of selected) {
  const input = { description: fixture.description, count: fixture.count, language: fixture.language };
  const built = buildInference(catalog, input);
  const candidateIds = built.candidates.map(item => item.id);
  const missingCandidates = (fixture.must_include || []).filter(id => !candidateIds.includes(id));
  const missingGroups = (fixture.must_include_any || []).filter(group => !group.some(id => candidateIds.includes(id)));
  const row = { name: fixture.name, candidateCount: candidateIds.length, contextUpperBound: built.contextUpperBound,
    missingCandidates, missingGroups, promptSha256: createHash('sha256').update(JSON.stringify(built.request)).digest('hex') };
  if (missingCandidates.length || missingGroups.length || built.contextLimited) failures++;
  if (live && built.request) {
    const started = Date.now();
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(built.request), signal: AbortSignal.timeout(35000)
      });
      const body = await response.json();
      row.latencyMs = Date.now() - started;
      if (!response.ok || body.success === false) {
        // Provider messages can contain input. Only record numeric codes.
        row.httpStatus = response.status;
        row.providerCodes = (body.errors || []).map(item => item.code).filter(Number.isFinite);
        row.result = 'provider-error'; report.cases.push(row); failures++; break;
      }
      const result = body.result;
      let validated;
      try {
        validated = validateMatches(typeof result?.response === 'string' ? parseStrictJSON(result.response) : result?.response, input, built.candidates);
      } catch {
        // Only committed synthetic fixtures reach this runner. Keep failed model
        // text in the ignored evaluation report for manual contract diagnosis.
        row.syntheticInvalidResponse = result?.response;
        throw new Error('invalid_output');
      }
      row.matches = validated.matches;
      row.usage = Object.fromEntries(Object.entries(result.usage || {}).filter(([key, value]) => ['prompt_tokens', 'completion_tokens', 'total_tokens'].includes(key) && Number.isFinite(value)));
      const ids = row.matches.map(item => item.id);
      row.missingMatches = (fixture.must_include || []).filter(id => !ids.includes(id));
      row.missingMatchGroups = (fixture.must_include_any || []).filter(group => !group.some(id => ids.includes(id)));
      row.forbiddenMatches = ids.filter(id => (fixture.forbidden_prefixes || []).some(prefix => id.startsWith(prefix)));
      row.incorrectPreference = row.matches.filter(item => (fixture.preferred_prefixes || []).some(prefix => item.id.startsWith(prefix)) && item.requirement_type !== 'preferred').map(item => item.id);
      row.unsupportedEvidence = row.matches.filter(item => fixture.evidence_must_include?.[item.id] && !item.requirement_evidence.toLowerCase().includes(fixture.evidence_must_include[item.id].toLowerCase())).map(item => item.id);
      row.passed = !row.missingMatches.length && !row.missingMatchGroups.length && !row.forbiddenMatches.length && !row.incorrectPreference.length && !row.unsupportedEvidence.length && (!fixture.expect_empty || !ids.length);
      if (!row.passed) failures++;
    } catch (error) {
      row.result = error.message === 'invalid_output' ? 'invalid-output' : 'network-error';
      row.passed = false; row.latencyMs = Date.now() - started; failures++;
    }
  } else if (live) {
    row.matches = []; row.passed = !!fixture.expect_empty; if (!row.passed) failures++;
  }
  report.cases.push(row);
  console.log(JSON.stringify({ name: row.name, candidates: row.candidateCount, contextUpperBound: row.contextUpperBound, passed: row.passed ?? (!missingCandidates.length && !missingGroups.length), result: row.result }));
}
report.failures = failures;
const destination = resolve(root, option('--output') || 'tasks/job-preparation/evaluation.json');
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(report, null, 2) + '\n');
console.log(`Evaluation mode: ${report.mode}; cases: ${report.cases.length}; failures: ${failures}. Human semantic review is still required.`);
process.exitCode = failures ? 1 : 0;
