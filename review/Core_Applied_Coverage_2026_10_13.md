# Core and Applied curriculum coverage review

Baseline: `972b9d1`, 338 questions, including 56 in RAP. Reviewed on 13 October
2026. This is a coverage review and a targeted technical review of changed
material, not a claim that every existing excerpt was executed in SAP.

## Method and sources

The 180 supplied interview prompts were compared with existing answers, details,
code examples and lessons. At baseline, 120 were covered, 34 partly covered,
15 represented gaps and 11 were outside this general developer curriculum.
Several prompts describe one missing skill, so they do not need separate cards.
The ten supplied RAP prompts were already covered. RAP additions instead address
missing beginner operations found through comparison with these public resources:

- [SAP Learning: building transactional RAP apps](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model)
  provides the sequence from a business object through basic operations, draft
  and composition to integration and extension.
- [SAP RAP100 practical exercises](https://github.com/SAP-samples/abap-platform-rap100)
  connect concepts to a working managed application and EML exercises.
- [Acquiring Core ABAP Skills](https://learning.sap.com/learning-journeys/acquiring-core-abap-skills)
  supplies the wider foundation, including language, OO, data access and CDS.
- SAP Help and keyword documentation resolve individual implementation contracts.
  Exact links accompany each changed answer and example in the app.

These are learning and exercise resources, not a copied interview question bank.
Questions and examples added to the studio are authored for this curriculum.
No certification dumps or paywalled answer collections were used. Older classic
SAP documentation is explicitly scoped; it does not establish ABAP Cloud API
availability. The older RAP workshop repository points to the current RAP100
repository above. A search result alone was not treated as a valid source when
the linked page returned a not-found response.

## RAP coverage and teaching order

Keep Core and Applied separate by the task, not by the novelty of a keyword.
Core explains a bounded mechanism; Applied asks the learner to implement or
diagnose it. The first route remains eight questions. It now includes the first
managed CRUD example before business rules and saving. The library contains the
broader material; the route is not a complete mastery checklist.

| Capability | First explanation | Application or diagnosis |
| --- | --- | --- |
| Artifacts and operation ownership | RAP-01, RAP-18 | RAP-02, SRAP-01 |
| Persistence field mapping | RAP-14 | RAP-18 |
| Root and child lifecycle | CDS-04, RAP-19 | SRAP-07 |
| Transactional buffer and EML | RAP-03, RAP-08 | RAP-18, RAP-21 |
| Derived EML types and update intent | RAP-22 | SRAP-06 |
| Responses and creation correlation | RAP-07, RAP-10 | SRAP-05, SRAP-07 |
| Technical keys and numbering | RAP-11 | SRAP-08 |
| Rules, validation and prechecks | RAP-06 | RAP-13, SRAP-12 |
| Save sequence and transaction owner | RAP-04, RAP-05 | SRAP-02, RAP-15 |
| Actions, parameters and functions | ADV-04, ADV-05, ADV-14 | ADV-15, RAP-16 |
| Determine action and Prepare | RAP-24 | SRAP-19 |
| Draft concept and enablement | RAP-12 | RAP-23, SRAP-09 |
| Locks and version checks | ADV-01 | SRAP-10 |
| Read and operation authorization | CDS-07, DEVCORE-01 | ADV-02, MODEL-02 |
| Field and operation feature control | ADV-13 | RAP-20 |
| Projection, service and missing capabilities | ADV-09 | RAP-20 |
| Messages, refresh and events | ADV-07, ADV-08 | SRAP-21, SRAP-24 |
| Test the real BO and its boundaries | TEST-03, DEVCORE-04 | OPS-01, OPS-03 |

The first-explanation column is an entry point, not a promise that every listed
question is classified Core. Some contracts require an Applied task even when
they are essential development knowledge.

## Selected additions

Seven RAP questions cover managed CRUD, owned child behavior, missing service
operations, read-by-association, derived EML types, draft enablement and determine
actions. Existing overview, EML, numbering, action-result and feature-control
answers receive focused improvements rather than new duplicates.

Five cross-topic questions consolidate the remaining priority gaps:

- DEVCORE-01: authorization object, activity, organization and immediate handling
  of `AUTHORITY-CHECK` results.
- DEVCORE-02: classic Shared Objects, area access, application-server scope,
  invalidation and the difference from durable work storage.
- DEVCORE-03: bounded keyset continuation with equal timestamps and an explicit
  warning that this does not create a complete delta or snapshot contract.
- DEVCORE-04: per-test versus per-class ABAP Unit fixtures and why `HARMLESS`
  is not a technical sandbox.
- DEVCORE-05: logs, metrics and traces on one failing request, with bounded metric
  dimensions and separate event/observation times.

Small omissions are repaired in existing questions: `line_exists` system fields,
adjacent duplicate removal, lock scope, Native SQL client handling, HTTP 413,
bounded retries with jitter, configurable-target SSRF and atomic work claiming.

## Deliberate exclusions

Employer-specific motivation, product architecture, Splunk HEC administration and
vendor runbooks remain outside the app. Builder, specialist SLT replication,
queue-schema migration and detailed RCA templates remain optional future work.
Their absence is recorded; they are not represented as essential RAP gaps.
Existing factory, facade, singleton, RFC, IDoc, HTTP and SQL questions already
cover most supplied prompts. Repeating them with a collector-specific noun would
increase the catalog without improving the foundation.

## Presentation and verification scope

Each new item has EN/RU answers, a concrete example, a pitfall, a learning level
and primary references. Code and a step lesson are included when they explain an
actual operation. Conceptual questions may use a compact textual example instead
of an unrelated diagram. This follows the existing learning-design policy.

Content/localization validation checks structure and relationships. Browser
checks verify presentation and navigation. Neither establishes SAP activation,
ATC results, API availability on a particular release or real BO execution.
Use the linked practical exercises in a suitable SAP system for that evidence.

## Delivered scope and checks

The catalog now contains 350 questions: 93 Core, 173 Applied and 84 Advanced.
RAP has 63 questions. This revision adds 12 questions, 13 worked-code variants,
seven multiple-choice challenges and one guided lesson, with matching Russian
content. There are 104 code examples, 121 challenges and 28 lessons overall.

Independent static review covered the changed answers, all new code, lesson and
quiz contracts, and EN/RU agreement. Review corrections clarified Shared Objects
versioning and extraction checkpoints with durable staging. Manual lesson review
also separated the failed-save scenario's state labels from the successful run,
so the transition does not imply that rollback removes a committed order.

The full build, content/localization validation, JavaScript syntax checks,
nine Python tests, three Node tests and 15 browser tests passed. Manual checks
covered new RAP code variants, lesson navigation with language switching,
four-option quiz feedback, authorization and keyset examples, including a
390-pixel viewport. These are frontend and static-content checks, not SAP runs.

The bilingual offline page measures about 5.25 MB uncompressed and 1.033 MB gzip,
up from 5.10 MB / 0.984 MB before this expansion. Bounded payload budgets are now
5.40 MB / 1.07 MB to allow modest content headroom. A local six-load diagnostic
measured a warm median of 367 ms versus 369 ms at baseline; this is not a field
performance score or a guarantee for other devices.
