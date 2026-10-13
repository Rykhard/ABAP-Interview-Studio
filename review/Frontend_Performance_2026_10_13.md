# Sidebar and frontend performance review

Baseline: `43617ec3c6872a1b23ff49ff885827ed4e8f7bb1`.

## Changes

- Subtopic buttons use separate title and count grid columns. Long EN/RU labels wrap without moving counts or overlapping them. Numeric glyphs use tabular spacing.
- Practice filter sizing applies to direct horizontal fields. Previously the descendant selector assigned a 200px flex basis to the level select inside a vertical wrapper, turning the intended width into height. The wrapper now participates in horizontal sizing and nested selects keep their intrinsic control height.
- The sidebar compares generated output before replacing DOM or reading layout. Unchanged navigation retains its controls, focus and scroll position during main-content updates.
- Startup loads the destination route once. Malformed or unknown fragments fall back to a usable view.
- All-answer browsing initially renders 20 cards, with an explicit load-more control and shown/total count. The question list, practice selection and Previous/Next sequence still use the full filtered set. Returning beyond a loaded boundary extends the visible batch; language switching preserves the loaded window.
- Question, learning-path and prerequisite links intercept only unmodified primary clicks. Ctrl/Cmd-click retains native link behavior.

## Evidence and limits

An independent read-only audit inspected the frontend modules, build pipeline and publication checks. It confirmed cached JSON parsing, lazy search indexing, passive/frame-throttled scrolling, reduced-motion support and an explicit publication allowlist. No accumulating event-listener leak was found.

The all-answer view previously produced 30,192 DOM elements in the local headless Chrome diagnostic. Its initial batched view produces 2,087 elements (20 cards), about 93% fewer. This structural reduction avoids generating hundreds of hidden answer/code/lesson controls at once. Explicitly loading every batch can still reach the original total.

Timing observations are diagnostic, not a production or mobile benchmark: the baseline audit measured approximately 969–1,320 ms for rendering plus forced layout. An initial batched run measured 457 ms while other checks were active. These runs are not a controlled field-performance comparison; no percentage speedup is claimed.

No framework, runtime dependency or background network request was added. Existing portable HTML raw/gzip budgets remain enforced.

## Validation

Browser regression coverage includes EN/RU desktop/mobile count alignment, wrapped labels, stable sidebar nodes, malformed routes, native modified links, full question navigation across answer-batch boundaries, return navigation and locale restoration. Existing search, saved questions, practice, offline and reduced-motion scenarios remain in the suite.

Independent boundary inspection confirmed 20 initial cards, navigation to question 21 out of 353, a return view containing that question, preserved batches after switching to RU, correct focus after loading more and zero page errors.
