# Senior ABAP Cloud interview study plan

The main route is ABAP Cloud, RAP and Clean Core: 154 questions, including 96 senior scenarios. Allocate about 70% of preparation time to this track and 30% to supporting ABAP and integration. Use the topic library to understand each answer with its pictures, then switch to the separate practice mode to recall it without reading ahead.

## Start with a senior diagnostic

Try CLOUD-01, CLOUD-04, SRAP-03, SRAP-08, SRAP-12, MODEL-01, MODEL-04, MODEL-14, OPS-05, OPS-11, GOV-02 and GOV-10. For each, explain the constraint, decision, rejected alternative and verification evidence. Score 0 for missing, 1 for partial, 2 for correct with an example, and 3 for a defensible trade-off with evidence. The two follow-up probes test whether your explanation survives a changed constraint.

A correct definition alone is not a senior answer. Mark a question ready only after explaining its failure boundary and a meaningful test. Review weak questions after one day, three days and one week. The browser records self-assessment; Anki supplies scheduled repetition if desired.

## Use the web studio

Open `START_HERE.html`. Learn starts with the complete topic catalog. Select a topic or Browse all questions. Topic icons, a breadcrumb and the sidebar show your current subject. Filter this view by text or ID narrows the current selection; topic/subtopic filters and the naturally sorted question index provide other ways to browse. All difficulty levels stay together without badges on question cards.

Show all answers and Questions only display a check and dark background on the selected option. Your display preference is remembered locally. Open or close individual answers as needed; a mixture of open and closed answers is labeled Custom view. Compact source links sit directly beneath each question. Diagrams have a captioned preview and numbered switcher; Enlarge diagram opens zoom, the original file and PNG download. Senior criteria and probes expand under Go deeper.

Use Search all topics and questions, or Ctrl+K / Cmd+K, to search all 329 questions, answers, examples and source titles. This search ignores scoped topic, difficulty and practice filters. A result opens the question with controls to return to the results or view it in its topic. Browser Back and Forward follow your navigation.

Practice uses one session builder and defaults to Interview practice across all questions and levels. Choose a subject, All questions / New questions / Retry mistakes, and a session of 5, 10, 20 or all available questions. More settings contains optional difficulty and search filters. New means no attempt in the selected format; retry uses the latest incorrect quiz attempt or spoken self-rating of 0 or 1.

Interview practice covers all 329 questions: explain the answer aloud, reveal the model answer, then give yourself a score of 0-3. Multiple-choice quiz covers the 104 questions with authored choices and explains all four options after you submit. For RAP, the coverage is 52 interview questions and 25 multiple-choice questions. The format cards make this distinction visible before you start. Quiz XP and spoken readiness are tracked separately; no microphone recording or automatic spoken grading is used.

During a session, global search and opening a question preserve the session in memory. Resume practice returns to the same fixed question list and current position. This works within the same page; reload does not preserve an unfinished session.

Skip for now leaves the question unattempted. Finish session shows results for answers submitted so far. Results separate mistakes or weak self-ratings from questions not attempted; quiz accuracy uses submitted answers only. Retry unsuccessful answers, practice the unattempted questions, or choose New session. Practice these questions transfers a library selection into Interview practice. Pictures and references appear with the relevant model answers and quiz feedback. Downloads & progress contains optional PDFs, Anki decks and progress import/export. Export progress before moving browsers. See the [usability and content review](../review/Usability_Content_Review.md) for the revision and verification record.

## A daily hour

1. Recall weak questions for 10 minutes.
2. Study one Cloud segment and its visuals for 20 minutes.
3. Work through a senior scenario without the model answer for 15 minutes.
4. Take a 10-minute self-check, naming the evidence you would collect.
5. Record the weakest IDs and one unresolved release-specific assumption for 5 minutes.

## If the interview is in 48 hours

| Session | Work | Evidence of readiness |
| --- | --- | --- |
| Day 1 morning | Cloud architecture 16 and Clean Core 08/20 | Defend extension placement, API contracts and a bounded exception |
| Day 1 afternoon | RAP 05/06/17 | Trace buffer, save, numbering, draft, concurrency and failure recovery |
| Day 1 evening | CDS/security 04/18 | Diagnose a DCL leak, unsupported filter and wrong count |
| Day 2 morning | Production 19 and weak foundations | Design meaningful tests and an uncertain-remote-outcome recovery |
| Day 2 afternoon | Senior mock: 75 minutes plus review | Score all six cases and repair the lowest dimensions |
| Final review | Quick revision and truthful project stories | Give a 90-second decision with an example and evidence |

## Seven day route

| Day | Main work | Practice |
| --- | --- | --- |
| 1 | 16 Cloud architecture; 08 Clean Core baseline | Placement, runtime versus model, C0/C1/C2 versus A-D |
| 2 | 05 RAP foundations; first half of 17 | Transaction/save ownership, bulk EML and field presence |
| 3 | 06 advanced RAP; remaining 17 | Draft resume, entity/total ETags, cross-BO constraints |
| 4 | 04 CDS; 18 security and queries | Proposed-state checks, DCL entry point, count/paging/filter |
| 5 | 19 operations; 20 governance | Real BO tests, incidents, compatibility and exception retirement |
| 6 | Foundations 01/21, OO 02/22, patterns 23; integration by diagnostic need | HTTP/REST/JSON/XML, OData, RFC/BAPI/LUWs/jobs, IDoc/AIF |
| 7 | Six-case senior mock; 12 real project stories | Repair weak answers and explain two personal trade-offs |

## Fourteen day route

| Days | Focus | Output |
| --- | --- | --- |
| 1–2 | Cloud architecture and Clean Core levels | Capability matrix and extension decision |
| 3–5 | RAP foundations and senior transactions | Save/concurrency drawings and three failure tests |
| 6–7 | CDS, authorization and custom queries | Security matrix and query-contract test cases |
| 8–9 | Production, testing and performance | Evidence plan and incident recovery walk-through |
| 10 | Clean Core governance | Bounded exception and upgrade/retirement plan |
| 11–12 | Foundations 21, OO 22, patterns 23 and delivery/HANA 24 | Trace value/reference behavior, defend a pattern and verify integration recovery |
| 13 | Senior mock without notes | Six scored cases and weakest three competencies |
| 14 | Weak cards, quick revision and project stories | Two-minute truthful examples with measured outcomes |

Revisit earlier mistakes on days 4, 8 and 12. Read baseline modules when the senior scenario exposes a gap; do not replace missing foundations with memorized architecture phrases.

## Rehearse truthful project stories

Prepare a two-minute story for a delivered feature, a production defect, a performance improvement, a difficult integration and a design trade-off. For each, record the business context, your role, constraint, decision, verification and outcome. Use your actual projects and measurements. Clearly distinguish a learning exercise from production delivery.

## Import the flashcards

Import `flashcards/ABAP_Interview_Anki.tsv` into Anki as UTF-8, tab-separated text. The file has no header row. Map column 1 to Front, column 2 to Back and column 3 to Tags; enable HTML in fields. Use a Basic note type. Question IDs are included in the front so updates can be matched. The HTML Study Desk also works without Anki: download the repository and open `START_HERE.html` locally.

## Release context to clarify

Before discussing a concrete implementation, establish SAP edition, release and support package, ABAP language version, API release status, consumer and SAPUI5 version. Classic transactions in the guide are examples for landscapes where those tools are available. The date of this study pack is not a claim that every feature exists on every target system.

## Learn with visual explanations

In START_HERE.html, open a question's answer to see its linked visual previews. Select a numbered diagram and use Enlarge diagram to inspect it without leaving the question. Interview practice reveals diagrams with the model answer; Multiple-choice quiz makes them available under Full explanation & diagrams after checking. The [GitHub gallery](../visuals/README.md) and [printable atlas](../pdf/ABAP_Visual_Atlas.pdf) remain available for browsing the full collection; the app's Downloads & progress menu links to both.

For each picture, first describe what is happening without reading the caption. Answer its recall prompt, then state where the analogy or model stops being accurate. Redraw one example from memory: a join result, a stale ETag update, the RAP artifact stack or the Clean Core levels. Reopen the related questions to check the explanation.

## Illustrated Anki deck

Use `flashcards/ABAP_Interview_Illustrated_Anki.tsv` for the same complete question set with images. Copy the PNG files from `flashcards/media/` directly into your Anki profile's `collection.media` directory, preserving filenames. Import with Front / Back / Tags mapping and HTML enabled. Do not add a media subdirectory.

Choose one deck for the first import. Both use identical front fields, so use Anki's matching/update options when replacing an existing deck. Check the import preview and verify that `RAP-12` displays its images.

Reference: [Anki text and media import manual](https://docs.ankiweb.net/manual/importing/text-files).

## Focused senior Anki deck

Use `flashcards/ABAP_Cloud_Senior_Anki.tsv` for only the 96 senior scenarios. It includes follow-up probes, strong-answer criteria and verification evidence. It is a subset of both full decks and uses the same front fields; choose one initial import or use Anki matching/update options.

## Focused foundations and pattern route

Start with BASE-01/02/04/06/12/13/16, OODEEP-01/03/06/09/12 and PAT-01/03/04/06/08/09/12. Predict the worked example before reading it. For each pattern, name the variation or failure boundary it solves and the simpler alternative you rejected. Complete a challenge, explain all three distractors, then repeat the same decision aloud without options. Read [the quiz guide](Challenge_Quiz.md) and [current market coverage](../review/Market_Research.md) to choose remaining gaps.
