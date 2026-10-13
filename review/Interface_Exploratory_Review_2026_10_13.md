# Interface exploratory review - 13 October 2026

Baseline: 186ceb6. Tested the production app, then repeated the failing journeys
against the local candidate. Browser actions were chosen interactively from the
rendered interface, separately from the automated regression suite.

Environment: Windows Chrome, isolated browser context, desktop viewport
1440 x 960 and mobile viewport 390 x 844. Mobile checks emulate screen size;
they are not physical-device Safari or Android tests. No real learner progress
was changed. Teaching answers were not technically re-audited in this pass.

## Findings fixed

1. **Hidden catalog level and misleading totals.** Choosing Learn the basics and
   returning to All topics retained Core, hid the filter and still reported 338
   questions. The home now names the active level, offers Show all levels and
   counts the questions and topics actually displayed. Suggested starting IDs
   also belong to the matching selection.
2. **Next/previous left the selected collection.** A saved question opened a
   section-sized navigation sequence, even when the saved collection contained
   only one item. The same problem affected text-filtered lists. Navigation now
   retains the rendered list's IDs and order, including cross-topic bookmarks,
   through language switching. An explicit learning path still owns its sequence.

## Exploratory journeys executed

| Journey | Result |
| --- | --- |
| Home -> basics -> topic -> home -> reset level | Reproduced finding 1; passed after fix in EN/RU |
| Recommended route -> next -> prerequisite -> browser Back | Passed |
| Route -> saved library -> open question | Left the route correctly |
| Saved questions from two topics -> next/previous -> return | Reproduced finding 2; passed after fix |
| Text filter with no results -> reset | Passed; useful empty state and full catalog restored |
| Reading preferences -> 21 px -> focus mode -> Escape | Passed; dialog closed and keyboard focus returned |
| Dark theme -> RU -> mobile viewport | Passed; theme, reading format and preferences retained |
| Code variant -> copy -> enlarged view -> Escape | Passed; selected variant and copy confirmation visible |
| Guided lesson -> second step -> change language | Passed; active step retained |
| Global search -> ArrowDown/Enter -> result -> return to results | Passed; query retained |
| Quiz -> answer -> search/read -> resume -> finish early | Passed; answer retained, one mistake and four unattempted kept distinct |
| Mobile screenshots of code dialog and filtered catalog | Readable, no horizontal page overflow |

## Regression protection

Four new browser tests cover EN/RU catalog totals/reset, saved collection
navigation across languages, and text-filtered next/previous. The learning-path
suite continues to verify authored route order, prerequisites and checkpoints.

Local validation: all 15 browser tests passed after fixes; Python tests,
JavaScript syntax checks, Node tests and the content validator passed. Production
publication and CI are verified separately at delivery. Screenshots and detailed
execution notes are retained in the ignored task workspace.
