# Architecture review — 13 October 2026

Baseline: `904987baada9667f27f4f4f3be3f16671fd0dcc2`.
Scope: client initialization/data access, publication tooling, repository checks
and development workflow. SAP teaching content and question IDs are unchanged.

## Findings and corrections

| Finding | Correction | Evidence |
| --- | --- | --- |
| Data parsed repeatedly; RU selection serialized records back into DOM and parsed them again | Shared cached data access; locale selection replaces references | Cache identity test, EN/RU browser flows and active quiz language switch |
| Entire diagram catalog and search index prepared on catalog load | Defer diagram parsing and search indexing until first use | Browser cache assertion and search regression tests |
| Every answer rescans example and visual collections | Build question association maps once | Code/diagram rendering and selection browser tests |
| Deployment script executes at import and mixes packaging with build invocation | Importable publication module, small CLI entry point | Isolated packaging tests |
| ZIP timestamps vary on repeated builds | Fixed ordering, permissions and archive timestamps | Byte equality test with identical inputs |
| Validator scans dependency and working directories | Validate the explicit publication set | Full validator passes with node_modules installed |
| Browser regressions existed only in ignored working folders | Committed tests and GitHub Actions workflow | Six browser flows, three Node tests, six Python tests |
| Dependency upgrades and editing conventions are implicit | npm lockfile, pinned direct Python dependencies, EditorConfig and development guide | Fresh install and documented toolchain |

## Local performance sample

Chrome on the same Windows workstation, local HTTP, EN catalog, six navigations
before and after; discard the first navigation for the warm median. JSON.parse
instrumentation counted inputs longer than 1,000 characters in both runs.

| Measurement | Baseline | Updated |
| --- | ---: | ---: |
| Characters parsed from large JSON inputs at startup | 4,726,108 | 2,252,581 |
| Large JSON.parse calls at startup | 10 | 8 |
| Warm median DOMContentLoaded | 331.8 ms | 208.6 ms |
| Portable HTML bytes | 5,096,641 | 5,046,640 |

This sample supports reduced initialization work. It is not a Lighthouse score,
Core Web Vitals field data or a guarantee for mobile devices or cold networks.
Both languages and diagram sources remain embedded for offline use, so network
payload reduction is small. Reproduce a diagnostic with `node tests/benchmark.cjs`
after building `dist`; keep browser, hardware and test conditions consistent.

## Remaining work and boundaries

- Shared client state and source-string localization remain. Prefer incremental
  feature interfaces and explicit translation keys when those areas next change.
- CSS still contains layered overrides. Consolidate one component at a time under
  visual tests rather than applying a repo-wide rewrite.
- A separate hosted asset loader would reduce initial transfer further, but needs
  its own cache/versioning and offline compatibility design.
- CI is a visible check, not an enforced merge policy. Cloudflare builds main
  independently. Branch protection must be configured separately to require CI.
- Full PDF builds are not claimed byte-reproducible. Packaging identical existing
  assets is deterministic with the same Python/zlib toolchain.

See [Architecture](../docs/Architecture.md) and [Development](../docs/Development.md).
