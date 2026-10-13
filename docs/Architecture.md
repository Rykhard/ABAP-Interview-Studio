# Architecture and maintenance

## Runtime

The studio is a static, offline-first application. It has no application server,
runtime npm dependency, login service or remote progress database. The same
generated `START_HERE.html` works over HTTPS and directly through `file://`.
Question IDs are durable keys for bookmarks, progress, routing and translations.

| Layer | Source of truth | Responsibility |
| --- | --- | --- |
| Curriculum | `content/`, `quiz/`, `examples/`, `lessons/`, `visuals/` | Authored teaching records and primary references |
| Learning design | `curriculum/learning.json`, `scripts/studio-learning.js` | Independent learning levels, optional ordered paths, prerequisites and checkpoints |
| Translation | `locales/ru/` | Reviewed text; preserve technical IDs and code |
| Data access | `scripts/studio-data.js` | Parse each embedded payload once, select locale by reference, index question associations |
| Navigation/state | `scripts/studio.js`, `studio-calm.js`, `studio-language.js` | Routes, filters, saved preferences and session handoff |
| Features | `studio-search.js`, `studio-reading.js`, `studio-code.js`, `studio-lessons.js`, `studio-scenes.js`, `studio-quiz.js` | Search, learning formats and practice |
| Presentation | `study-template.html`, CSS files, `studio-motion.js` | Semantic controls, responsive layout and reduced-motion support |
| Compilation | `scripts/build_web.py` | Validate translations and assemble the portable document |
| Publication | `scripts/publication.py` | Validate allowlist/links, copy assets, hash manifest and deterministic ZIP |

Source JavaScript fragments are composed at build time in a deliberate order.
They are not independently loadable ES modules. Data helpers precede locale
selection, which precedes feature initialization. Source-expression localization
still compiles an EN and RU branch; syntax checks cover both branches. Changing
that localization system is a separate migration, not a prerequisite for these
performance improvements.

## Performance decisions

- Embedded JSON uses compact serialization and escapes `<` before insertion.
- The data cache avoids repeated parse/stringify cycles during locale selection.
- Diagram data is parsed when a diagram is first needed. It remains embedded for
  offline use; this defers CPU work rather than eliminating its download bytes.
- The search index is built on the first nonempty search, then reused.
- Code and visual associations are indexed once by question ID rather than
  scanning all records on each rendered answer.
- Motion updates existing scene objects and respects `prefers-reduced-motion`.
- Tests budget portable HTML at 5.1 MB raw and 1 MB gzip. These are regression
  limits, not a promise about page speed on every device.

The current payload still includes both languages and all diagram sources.
If curriculum growth exceeds the budget, introduce a separate hosted loader with
versioned assets while preserving the portable artifact. Avoid adding asynchronous
network dependencies to `file://` mode incidentally.

## Build and publication boundary

`python scripts/build_site.py` builds the web artifact using the Python standard
library. Full PDF/Anki regeneration is separate: `python scripts/build.py` needs
the pinned dependencies in `requirements.txt`. Generated exports remain committed
because offline downloads are a product feature. Do not edit generated HTML or
study guides as their source.

The packager is importable without side effects. It rejects escaped source and
destination paths, missing local links, hidden publication files and unexpected
files in `dist`. It does not delete unexpected user files. The manifest records
every published asset hash. With identical input bytes and the same Python/zlib
toolchain, ZIP metadata and ordering are deterministic. PDF regeneration has its
own toolchain and metadata; byte-identical PDFs are not claimed.

## Remaining technical debt

The client still has shared feature state, dense legacy source formatting and CSS
overrides accumulated during design iterations. A future feature should extract
the state it owns behind a small interface and consolidate the CSS it touches.
Do not reformat or replace the entire app without behavior coverage. Source-text
localization is guarded against stale replacements but remains more fragile than
explicit message keys; a gradual message-key migration is the preferred next
architectural step. These limitations are documented, not represented as fixed.
