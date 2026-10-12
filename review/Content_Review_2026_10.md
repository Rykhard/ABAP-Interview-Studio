# Content and reading review — October 2026

This update follows the bilingual release at `50415d5`. The review covered all 332 existing questions, their linked teaching code, and the authored step-by-step lessons. Six new questions were added in both English and Russian. This was a source and documentation review, not execution in an SAP system.

## Corrections and additions

- Corrected the CDS extension example: `@EndUserText.label` belongs on the added element, not the unsupported `EXTEND VIEW ENTITY` header.
- Corrected the false-cardinality lesson. A false to-one declaration can cause undefined or selection-dependent results; the lesson no longer promises exactly two rows and a specific total after that declaration.
- Matched the local-mode write question to a derived-value write example instead of a read-only excerpt.
- Clarified the distinction between Standard ABAP AMDP capabilities and ABAP Cloud restrictions.
- Added STANDARD and SORTED internal-table examples beside the existing HASHED example. Each demonstrates its actual access pattern.
- Added OO-17: `constructor` versus `class_constructor`, with object and internal-session lifetimes.
- Added SQL-15: AMDP procedures versus CDS table functions, with separate declaration and implementation excerpts.
- Added ADV-14: ordinary RAP read/calculation functions, contrasted with modifying actions.
- Added ADV-15: default functions for action parameters, including a six-step dialog and validation scenario. Defaults are suggestions, not saved changes or a substitute for validation.
- Added HTTP-13/14: outbound calls through released HTTP client APIs, configured destinations, GET, PATCH, status handling, ETag, CSRF and cleanup. The API paths and business payloads are explicitly fictional teaching fixtures.
- Added six multiple-choice checks with explanations for every option, in both languages.

The preceding bilingual release already expanded Singleton, Factory and Facade explanations, added InvocationGrouping, and corrected BAPI/COMMIT, BRFplus, bgPF and bgRFC distinctions. Those changes remain part of the current curriculum.

## Reading changes

Explanation now uses a compact diagram preview that opens in the zoomable viewer. Where a question has several diagrams, a selector shows one at a time. Reading preferences provide a global Explanation/Code default; questions without code fall back to Explanation. Step by step remains local to each question. Language switching preserves the selected diagram along with the question and learning state.

## Evidence and limits

The new questions, thirteen new code examples, six quizzes and affected RAP lessons received an independent source review. Structural checks verify linked question IDs, paired English/Russian code, answer keys and highlight ranges. The normal build additionally checks localization coverage, topic ownership, generated content and local asset links. Browser checks cover the language switch, practice state, example selection, guided steps, both themes and narrow screens.

The snippets state their custom object/type prerequisites. They are teaching excerpts, not complete activated applications. SAP activation, syntax checks, ATC, ABAP Unit, database execution and real outbound service calls were not performed. Target product, release, language version, service binding and communication setup must be checked before transferring a snippet into a real application. Documentation review does not certify every example for every SAP release.

Existing diagram artwork and downloadable study exports retain English text. Browser explanations, captions, code walkthroughs and lessons have Russian counterparts; technical identifiers remain unchanged. The primary documentation is linked directly from each relevant question and example.
