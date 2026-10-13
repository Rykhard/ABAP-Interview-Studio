# Prepare for a job

This optional feature selects existing interview questions for a pasted job description. It does not write questions, grade a candidate, infer seniority, or assess missing skills. Review each reason and exact evidence quotation before starting interview practice. A preview does not change filters, ratings or an existing session; applying the selection explicitly replaces the current session.

The ordinary static/offline studio does not depend on AI. The optional dialog reports service unavailability on a static host or local file. EN/RU labels, errors and question titles are supported. Technical identifiers remain unchanged.

## Runtime and publication boundary

The existing Cloudflare Pages Git build remains `python scripts/build_site.py`, with `dist` as the asset directory. Root `functions/api/prepare-job.js` adds a Pages Function; Cloudflare compiles this separately from the static assets. `_routes.json` invokes Functions only for `/api/prepare-job`. The server catalog is generated from the canonical question titles, translations, topic placement and learning level. Answer bodies, source files and server credentials are not public assets.

The portable `dist.zip` is **static only**. Uploading that archive through the dashboard does not install the Function, bindings or database. A Git-integrated Pages deployment or correctly configured Wrangler deployment is required for the optional service. Production enablement requires a verified free Workers plan and authorized deployment; billing changes and paid upgrades are outside this feature's scope.

## Configuration before enabling

1. Keep `JOB_PREP_ENABLED=false` until the following setup and preview checks are complete. Missing bindings or a missing secret fail closed with a localized disabled message.
2. Create a D1 database for the guard and bind it as `JOB_DB`. Apply `server/migrations/0001_job_guard.sql` to the intended database. Preview and production should use separate databases and secrets.
3. Add a Workers AI binding named `AI` to the Pages environment. No REST API token is required in the application. Do not add an API token to browser code or build variables.
4. Add `JOB_RATE_SECRET` as a Pages **secret**, using at least 32 random characters. It HMACs the connecting IP to prevent overlapping requests. Do not use the AI token as this secret.
5. Set `JOB_AI_MODEL` to `@cf/meta/llama-3.3-70b-instruct-fp8-fast` and `JOB_DAILY_LIMIT` to a value from 1 to 50 (default 50). Set `JOB_PREP_ENABLED=true` only for an authorized environment after validation.
6. Verify the account's actual plan and Workers AI usage in the Cloudflare dashboard. This code does not change billing, select a paid fallback, or upgrade a plan. Other applications may consume the same account allowance. The local guard is not an account-wide billing control.

`wrangler.example.jsonc` is secret-free and disabled. Its database ID is a placeholder: it is **not** an active production configuration. Set bindings through the Pages dashboard, or copy it to ignored `wrangler.local.jsonc` and replace the database ID. A binding/configuration change requires an authorized redeployment before it affects the hosted site.

## Local development and checks

Use Node 22.13 or newer and the pinned development dependencies:

```text
npm ci --ignore-scripts
python scripts/build_site.py
npm run check:syntax
npm test
python -m unittest discover -s tests -p "test_*.py"
npm run eval:job
npm run check:pages
npm run test:browser
```

The default tests use synthetic fixtures and mock inference. Server guard tests execute the real SQL against SQLite; browser tests exercise the existing session flow. Neither establishes live model quality or production Cloudflare performance.

To exercise the Pages runtime with the feature disabled, run `npx wrangler pages dev dist --port 8795`. For an explicitly authorized AI integration test, configure the local AI and D1 bindings using the example, apply the migration locally, and supply `JOB_RATE_SECRET` through ignored `.dev.vars`. Workers AI bindings call the real service even during local development and consume account usage. Never enable real inference for unattended browser tests. Do not commit `.dev.vars`, `.env`, API tokens, or local Wrangler credentials.

## Limits and errors

The server accepts only JSON `{description, count, language}`: 30-6,000 trimmed characters, at most 10,000 UTF-8 bytes, count 1-60 or `null`, and `en` or `ru`. The default is a **preparation plan**, with the count switch off. Broad roles aim for 40-50 complementary questions; at most 60 are returned, and narrow roles should receive fewer rather than filler. An explicit numeric count remains a ceiling. Closing the dialog restores automatic selection. The server considers up to 96 eligible candidates from the complete canonical library, retaining explicit skill anchors and balancing sections and required/preferred scope. Long descriptions can reduce the shortlist to fit the conservative 24,000-token context bound. One submit makes one AI call with temperature zero and a JSON schema; there are no automatic retries. Output allowance is 2,300-4,500 tokens. The server deadline is 70 seconds; the browser waits up to 80 seconds. The in-flight lease and free-plan quota protections remain unchanged.

Each AI attempt reserves one shared D1 slot atomically, including failed or timed-out attempts. The default and maximum daily cap is 50 attempts for the whole site, not per visitor. Existing deployments must also set the production `JOB_DAILY_LIMIT` to `50`; changing the default does not override an explicit environment value. There is no application hourly client limit. An active 90-second lease blocks overlapping submissions; a local inference timeout retains the lease because aborting the browser does not prove that the provider stopped. IP sharing can therefore affect simultaneous requests behind the same network. Provider throttling can still return a rate-limit response.

## Assistant, collections and usage

The bilingual AI question assistant is available in the top toolbar, including during practice. Its card-and-spark icon animates on interaction and while a POST is pending. A separate indeterminate progress bar remains visible during inference; no percentage or invented processing stages are shown. Reduced-motion preferences disable both animations.

Results are grouped by canonical topic, with required skills before preferred skills and Core before Applied/Advanced within each priority. Every result carries a server-derived `relationship`: `direct` or `foundation`. Foundation cards explicitly describe preparation for a named skill rather than a separate employer requirement. Legacy responses without this additive field remain readable during deployment. This relationship is displayed in the preview; saved collections retain questions only. Users can save all checked questions under an editable title in **My collections**, available in the sidebar. Collections contain only title, up to 60 canonical question IDs and creation time in local storage. They do not contain job text, quotations or AI reasons and do not synchronize between browsers. **Study collection** opens the main learning screen with every question grouped by topic/subtopic, using the existing question-list/all-answers control. Question navigation, browser history, reload and language changes retain collection scope. Practice remains a secondary action, for all questions or one topic. Renaming, deletion and immediate undo remain available. Storage failures remain visible and do not claim success.

GET and POST responses expose a snapshot of the shared application allowance and UTC reset time. Successful POST responses expose only nonnegative safe-integer token counts actually returned by the provider. Unknown counts stay unknown. The UI distinguishes these per-request tokens from remaining site requests. Account-wide daily Neuron usage and remaining provider allocation belong in the owner's Cloudflare Workers AI dashboard; the public frontend has no management credential and does not fabricate a daily token balance.

The guard's daily cap and verified Cloudflare error 3036 both produce `daily_limit`, a UTC-midnight reset timestamp, and a localized warning that ordinary practice remains available. A shared circuit prevents further inference that day after a provider daily-quota error. Capacity error 3040, ordinary rate limits, timeouts, disabled configuration and malformed output have separate recoverable states. The UI formats a known retry timestamp in the visitor's local time. It does not estimate remaining Neurons from the number of requests.

Cloudflare currently documents 10,000 free Neurons per account/day and reset at 00:00 UTC. Model costs vary with input and output; 50 reserved calls is an application abuse ceiling, not a promise that 50 calls fit the free allocation. On 2026-10-13, the configured model costs 26,668 Neurons per million input tokens and 204,805 per million output tokens. A measured small production call (2,991 input and 184 output tokens) costs approximately 117.45 Neurons: 50 similar calls would use approximately 5,872 Neurons. Larger selections can exhaust the provider allocation sooner; other account usage also shares that allocation. The provider exhaustion circuit stops subsequent attempts until UTC midnight. This change does not enable Workers Paid or prepaid credits. Changing the model requires reviewing its context window, cost, JSON Schema support and evaluations before enablement.

## Retrieval and model contract

The model has a 24,000-token context window. Deterministic retrieval ranks the entire canonical catalog using shared English/Russian title and topic terms weighted by inverse document frequency. Title matches receive more weight than topic metadata, basic English plurals are normalized, and explicit skill anchors reserve concise Core candidates before narrative text can crowd them out. It also ranks comma-separated clauses within each evidence excerpt and preserves leading candidates per excerpt in rounds, then fills remaining places by overall score. This prevents a dense RAP requirement from crowding a separate short ABAP Unit requirement out of the shortlist. It retains at most 96 candidates, with stable ID tie-breaking. The immutable catalog index is prepared once, rather than tokenizing all titles on each request. This is a lexical shortlist, not a semantic embedding system: synonyms and requirements described without recognizable terminology can be missed.

Before inference, lower-ranked candidates are removed until the UTF-8 byte upper bound for the serialized input/schema, plus 1,024 tokens of template reserve and the selected output allowance, fits the context. Titles are not cut mid-sentence, and the submitted description is not silently truncated. The prompt sends compact [canonical ID, English title] pairs, not answer bodies or repeated topic metadata; Russian titles participate in retrieval. The response schema enumerates only shortlisted question/evidence pairs. The public API returns exact quotations, requirement_type and the additive relationship field; the internal wire format is not exposed to the frontend.

Evidence choices are exact source excerpts split at sentence, line or semicolon boundaries, with long spans split at an existing word boundary into at most 300 characters. They are sent as numbered [index, priority, exact text] entries in the user message, so the model can read them. The server builds direct question/evidence pairs using term overlap and technology checks. A separate foundation rule permits Core/Applied prerequisites of explicitly named ABAP, RAP, CDS and other supported skills, without implying adjacent technologies. Broad technology matches are labelled foundations. Up to two supporting excerpts per candidate retain their heading-derived priority. This is a bounded lexical teaching heuristic, not a proof of semantic relevance. The internal response selects an enumerated id@index pair instead of generating a quotation or priority. The server rejects unsupported pairs and extra keys, restores the exact source excerpt, derives Required/Preferred from recognized headings and inline labels, and applies the normal public-output validation. This conservative lexical eligibility check can miss paraphrases; it is not a full semantic verifier. Unknown heading variants and mixed requirements can still need manual review. Standalone Required/Preferred/Nice-to-have headings are excluded from evidence but retained in the full job text to preserve scope. The evidence list has a 4,000-byte budget; for unusually long descriptions, catalog-relevant excerpts take priority and retain source order. The complete job text remains available to the model for optional-skill scope and exclusions. This restriction can miss a useful excerpt; it does not make an incomplete selection a complete assessment.

Server validation rejects extra fields, unknown/duplicate IDs, too many matches, malformed or duplicate-key JSON, overlong text and quotations that are not contiguous literal substrings of the description. Output is never reconstructed or repaired. Reasons and evidence are rendered as text. A valid quotation does **not** prove semantic relevance or immunity to prompt injection; user review and model evaluation remain necessary. The explicit requested count is a maximum. Automatic preparation uses 40-50 as a soft planning target, with relevance and concept diversity taking precedence. Prompt rules explicitly distinguish logistics from IDoc, generic ABAP from MVC, and optional named technologies from mandatory generic duties. These rules reduce unsupported inferences but do not establish semantic correctness; user review remains necessary.

## Reproducible model evaluation

`evals/job-preparation.json` contains synthetic specific-match, exclusion, no-match, optional-skill, embedded-instruction, realistic longer-vacancy and bilingual cases. `npm run eval:job` checks shortlist recall without credentials or model calls. Expected IDs are evaluation assertions, never application matching rules.

For a live evaluation, securely supply `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the process environment, then explicitly run:

```text
node scripts/evaluate-job.mjs --live --case specific-rap-en
node scripts/evaluate-job.mjs --live --max-requests 7
```

The runner stops on a provider error, limits calls, uses exactly the production prompt/schema/validation, and writes an ignored report under `tasks/job-preparation/`. It records model ID, prompt/catalog hashes, candidate recall, canonical selected IDs, evidence/reasons for public synthetic fixtures, latency and numeric token usage. Failed synthetic model outputs are retained there for contract diagnosis. It never records credentials or provider error bodies. Review each match manually for relevance, correct optional/required classification, and language quality; passing ID assertions alone is insufficient. Do not put real vacancies or personal information in committed fixtures.

## Historical validation of the initial matching version (13 October 2026)

The final live run is preserved in `evals/job-preparation-results.json` with seven synthetic cases, exact prompt/catalog hashes and original model selections. All seven returned structurally valid, literal-evidence results; six met the strict expected-ID assertions. In the longer vacancy, the model chose PAT-10 for dependency injection instead of the fixture's TEST-01/TEST-02/OO-07 group. Independent review of the canonical answer accepted PAT-10 as relevant: it explicitly discusses testing real logic with injected doubles. The original automated failure remains recorded rather than being rewritten as a pass.

Human review also found redundant Factory/Facade coverage in one selection and a preferred question before a required one in another. The preview now groups required matches before preferences. Redundant selections remain a model limitation that users can remove during review. No complete-coverage or general prompt-injection-resistance claim follows from these seven cases. The first evaluation exposed rejected outputs and weak/empty selections; stronger prompts and constrained source excerpts improved the subsequent samples, without establishing universal reliability.

Final live latency ranged from 1.0 to 14.1 seconds; reported usage across seven calls was 23,720 input and 1,471 output tokens. These are observations for synthetic requests, not a service-level or price guarantee. Live evaluation calls use the provider REST API directly and consume the account's allowance; they do not exercise the deployed D1 guard.

Local validation passed the 43-test browser suite, 14 Node tests (including 11 server tests), 11 Python tests, seven retrieval-recall fixtures, source/generated syntax checks, content validation and the Wrangler Pages compilation. The latest job-specific browser checks additionally cover required-before-preferred presentation. Manual browser inspection covered desktop RU and mobile dark-mode quota messaging. A real local Pages runtime returned the expected disabled JSON response. Production bindings, remote D1 integration, production CPU measurements and deployment have not been performed.

## Privacy, disablement and rollback

### Security boundaries

The deployed application uses an `AI` binding, not a Cloudflare management API token. Never place a management token in Pages build variables, browser assets, source control, or application logs. Deployment credentials should be account-scoped, short-lived and revoked when no longer needed. A credential shared in a conversation should be rotated before long-term use.

Malformed and cross-origin POST requests are rejected before any D1 query. Function responses independently apply `no-store`, `nosniff`, a restrictive content security policy and `no-referrer`; static Pages header rules do not cover Functions. Provider error bodies are not returned or logged. Model output is validated and rendered as text, never executable HTML.

This is a public endpoint. Origin checks prevent cross-origin browser submissions but do not authenticate callers or stop scripts that spoof headers. The atomic site-wide cap bounds AI attempts even across many IP addresses; it cannot prevent an attacker from exhausting the shared allowance. D1 and Workers requests can still reach their free-plan limits. Keep the account on the free Workers plan so exhaustion fails rather than enabling paid overage. App counters alone are not a billing guarantee. Ordinary static learning does not depend on this endpoint.

Before production enablement, verify Pages and D1 permissions, the actual account subscription, separate preview/production bindings, and a synthetic end-to-end request. A successful local test does not establish that these production controls are configured.

Descriptions, reasons and evidence live only in browser/request memory; closing the dialog clears its draft and preview. They are not added to local storage, history or D1. Starting practice retains only selected canonical IDs and the session source/title. The description is sent to Cloudflare Workers AI only on explicit submission; consult Cloudflare's data-usage terms before handling sensitive information.

D1 stores random reservation IDs, HMAC client pseudonyms, timestamps, day buckets, leases and daily quota blocks. Operational logs contain only status, latency, match/candidate counts and bounded numeric usage. There is no application prompt/error-body logging. Rows older than two days are deleted on a later eligible POST; D1 does not automatically expire them, so an idle/disabled installation may retain those pseudonymous records longer. If strict time-based retention is required, configure an authorized scheduled cleanup separately.

To disable, set `JOB_PREP_ENABLED=false` in the target environment and apply it through the approved Pages deployment workflow. Static learning and existing practice remain available. To remove retained guard data after disablement, run `DELETE FROM job_requests; DELETE FROM job_daily_blocks;` against the explicitly verified database. This resets limits; do not run it while the feature is enabled. Removing the optional endpoint/bindings and rebuilding the static app is the full rollback. Stable question IDs and stored practice ratings are unchanged.

## Official references

- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Workers AI model and context window](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)
- [Workers AI JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Workers AI pricing and daily reset](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Workers AI error codes](https://developers.cloudflare.com/workers-ai/platform/errors/)
- [Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/)
