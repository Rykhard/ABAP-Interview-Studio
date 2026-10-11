# Validation evidence

## Public packaging checks, 11 October 2026

- `scripts/validate.py`: passed with no errors; 329 questions, 103 challenges and all five PDF exports checked.
- `scripts/build_site.py`: passed; 256 publication files, about 44.2 MiB total; largest asset about 8.4 MiB.
- Canonical content, quiz data, PDFs, visuals and flashcards: byte-identical to the reviewed local baseline.
- Embedded executable JavaScript: `node --check` passed. JSON data blocks were checked as data rather than executable scripts.
- Local HTTP preview: the CLOUD-01 deep link rendered its answer, references and loaded diagram without a page error.

The public repository preserves the reviewed study content: 329 questions, 103 multiple-choice challenges, 68 teaching visuals, 10 topics and 41 subtopics. The deployment preparation changes packaging and documentation rather than technical answers.

Run `python scripts/validate.py` with the dependencies in `requirements.txt` installed to check canonical IDs, question references, quiz option contracts, generated web data, Anki exports, PDF bounds and local links. Run `python scripts/build_site.py` to check the deployment allowlist, local links and Cloudflare asset limits using only the Python standard library.

The prior local application review exercised global search, answer visibility states, topic navigation, practice continuity and progress import/export. These checks establish browser behavior, not SAP runtime correctness. Proposed SAP exercises still require execution in an appropriate SAP environment.

Deployment-specific checks and the publishing procedure are described in [Deployment](../docs/Deployment.md). A successful local build alone does not establish that production is deployed or reachable.
