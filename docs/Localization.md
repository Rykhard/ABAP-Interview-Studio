# English and Russian learning

Use the EN/RU buttons in the app bar. The preference is stored in this browser; an explicit `?lang=en` or `?lang=ru` URL takes precedence. Both language packs are included in the offline HTML. No translation service or account is required.

The Russian pack covers the interface, topic tree, questions, answers, examples, warnings, interview follow-ups, reference notes, multiple-choice options and their explanations, code walkthroughs, guided lessons, and diagram captions. Technical identifiers, ABAP/CDS source excerpts, command names, URLs and stable content IDs remain unchanged.

All 68 vector diagrams have selectable EN/RU text and respond to the selected theme. Two original raster illustrations are presented as responsive, bilingual text cards in the app. Every visualization has a full textual explanation available below it. The viewer can download a standalone SVG in the current language and theme. Original raster artwork, printable PDFs, Markdown handbooks and Anki exports remain English. Documentation links open the publisher's pages, whose language depends on the publisher.

Changing language keeps the current question, filters, selected study format, diagram selection, lesson/code step, saved questions and ongoing practice session. Scores and progress share stable IDs across languages. The switch saves an in-page snapshot before reloading the same URL; this does not add general session recovery after closing a tab. Search accepts English and Russian question text in either interface language.

Reading preferences provide a global Explanation/Code default. Questions without code use Explanation; a question-specific Step by step choice is retained. Selecting a new global default clears older Explanation/Code overrides. Diagram previews open in the existing zoomable viewer.

## Maintaining translations

English content is the canonical structure. The matching resources are under `locales/ru`: question modules, topic metadata, examples, lessons, quizzes, visual metadata and UI phrases. Update both languages when content changes. Keep code, IDs, answer keys, URLs and numeric line references identical.

`scripts/localization.py` validates field shape, record counts, stable technical values and basic encoding/prose coverage. The build fails on incomplete or structurally mismatched translations. `ui.json` contains authored presentation phrases; `source.json` contains reviewed replacements for dynamic UI expressions and Russian plural forms. These are not machine translations. Changing a source expression requires updating its exact localized counterpart.

Run the normal build and validation, then verify both languages in the browser. Check reading, global search, code steps, guided lessons, quiz choices and feedback, keyboard focus, narrow screens and both themes. Structural validation cannot replace editorial or technical review.

Diagram labels and long descriptions are maintained in `locales/ru/diagram-labels`; accessible replacements for raster illustrations are in `visuals/accessible-stories.json`. The compiler verifies every English source label against its SVG, including ordering and duplicate labels. It embeds sanitized SVG in the offline page and generates locale/theme downloads under `assets/localized-diagrams`. Update the exact source label and its translation together. Check text fitting after changing either language. Each inline instance gets unique accessibility and clipping IDs.
