# Window functions, memory and estimation coverage

Reviewed on 13 October 2026 against baseline `a83b1c442a8a085d9b803ac5d82e3f2fb2ba3e75`.

## Requested topics

| Request | Existing coverage | Decision |
| --- | --- | --- |
| Window functions in ABAP | SQL-14/15 discuss pushdown and AMDP, without window semantics | Add SQL-16 (Core): detail rows versus GROUP BY, partitions, explicit running frame and ranking ties. Three selectable ABAP SQL excerpts use one four-row fixture. |
| ABAP table types | ABAP-01/02/03/05 explain STANDARD, SORTED, HASHED, keys, access and DDIC types; ABAP-01 already has three selectable examples | Retain the existing questions rather than duplicate them. |
| Authorization concept | DEVCORE-01, ADV-02, CDS/DCL and TEST-06 cover checks and RAP boundaries | Expand DEVCORE-01 with roles, authorization objects, requested field values and enforced check results; distinguish classic PFCG from BTP IAM. |
| Estimation techniques | STORY questions address project decisions without a dedicated estimation method | Add STORY-07 (Applied): analogy, bottom-up, three-point uncertainty and relative sizing, with a clearly illustrative four-person-day breakdown. |

All new and expanded question prose, code explanations and quiz feedback have EN/RU versions. ABAP identifiers remain unchanged.

## Attached performance article

The attachment was treated as a list of claims to check, not as an authoritative source or text to reproduce.

Existing SQL-02/03/09–15, ABAP-01–04, BASE-02/03, OODEEP-06, RFC-07/09, OPS-17 and DEVCORE-03 already cover most of its selection, table-access, buffering, pushdown and background-processing themes.

- SQL-09/10 now emphasize measuring the actual bottleneck before choosing an optimization. ABAP runtime, SQL workload, individual database plans and retained ABAP memory require different evidence.
- New SQL-17 (Applied) explains why small `PACKAGE SIZE` values do not guarantee bounded memory. Its two-package example retains only the current package and one scalar. It explicitly notes that database `SUM` is preferable for a real pure-total requirement.
- SQL-17 distinguishes `INTO TABLE` from accumulating `APPENDING TABLE`, retained output/copies, FAE materialization and open-cursor boundaries. OPS-17 now states that moving work to background does not itself reduce memory.
- ABAP Cloud is a development model available in supported products; it does not prohibit all own tables. Permitted own objects and released dependencies must be distinguished.
- Cloud analysis is not exclusively an ADT screen: supported workflows can use ADT, browser analysis and administrator Fiori/TMC tooling. Availability is product-, release- and permission-dependent.
- No universal optimization order, fixed percentage gain, zero-overhead tracing claim or automatic memory-leak diagnosis was adopted.
- ST05 HTTP tracing must not be dismissed universally: SAP documents it for some products. Check the actual environment before describing available trace types.

## Primary references

- [SAP ABAP SQL cheat sheet and window examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md).
- [SAP 7.52 PACKAGE SIZE semantics and FAE restrictions](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapinto_clause.htm). This readable version documents materialization before package delivery; the current keyword reference is also linked in the question.
- [SAP ABAP Cloud language and permitted objects](https://help.sap.com/docs/abap-cloud/abap-cloud/abap-language).
- [SAP SQL analysis workflow](https://help.sap.com/docs/btp/sap-business-technology-platform/analyzing-sql-statements-of-your-application) and [administrator tracing](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/tracing-sql-activities-for-administrators).
- [SAP Memory Inspector concepts](https://help.sap.com/docs/ABAP_PLATFORM_NEW/ba879a6e2ea04d9bb94c7ccd7cdac446/8884fb5269d34838a1f119b41dcdbc57.html).
- [SAP authorization basics](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/authorization-basics).
- [SAP Activate release planning](https://learning.sap.com/courses/discovering-sap-activate-agile-project-delivery/analyzing-release-planning_d23953f4-0805-4eb6-8711-f723d8d84954), [PMI scheduling standard](https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/practice-standard-scheduling.pdf?rev=eed9ee4249bf49df8b40fc2c54bb8000&v=c7ca2721-8c26-4e07-ba47-069d0987bc0c) and [Scrum.org on story points](https://www.scrum.org/resources/blog/story-points-estimate-or-not-estimate).

## Validation boundary

Independent static review covers new SQL code, fixture arithmetic, bilingual parity, authorization and estimation claims. One teaching improvement from review changes the package size to two so the four-row fixture demonstrates more than one iteration.

ABAP snippets are teaching excerpts with explicit custom-table prerequisites and release assumptions. No SAP activation, ATC, ABAP Unit execution or production performance result is claimed.

Executed checks: content/build validation (353 questions, 108 code examples, 123 quizzes, 28 lessons), JavaScript syntax, three Node tests, nine Python tests and all 19 browser scenarios. Two catalog-count scenarios initially reached the preceding deployment folder during its rebuild; both passed after the build completed. EN/RU browser inspection checked all three window-example variants, the two-package example, estimation and authorization cards, plus mobile overflow. The portable HTML remains within the repository's raw and gzip size budgets.
