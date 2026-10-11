# Modern ABAP interviews: evidence and coverage

Research completed on 11 October 2026, after implementing the foundations, patterns and quiz expansion. This is a targeted preparation review, not a statistical survey. ABAP Cloud, RAP and Clean Core remain the main track; strong ABAP reasoning and credible delivery examples support it.

## Method and evidence limits

Searches combined `SAP ABAP developer`, `senior`, `RAP`, `Clean Core`, `interview experience`, `ABAP OO` and employer-domain filters. Four directly accessible employer advertisements were coded below. Two candidate accounts and two interviewer accounts were read separately. Search results were opened, duplicate job IDs were not counted twice, and preparation requests were not treated as completed interviews. This selection deliberately targets modern ABAP and therefore cannot estimate the proportion of all ABAP jobs requiring RAP.

A vacancy establishes what an employer advertises, not what its interviewer actually asks. Anonymous reports are self-reported, geographically concentrated and often concern junior/mid-level candidates. They corroborate possible question styles, not a guaranteed senior syllabus. Relative Reddit dates vary with cached rendering; access date is recorded without inventing exact interview dates. Technical questions link to documentation separately; navigation-only references are labeled, and scenario decisions are identified as original analysis.

## Current employer sample

| ID | Source and publication context | Explicit preparation signals |
| --- | --- | --- |
| J1 | [Capgemini Senior S/4HANA Backend Developer, Belgium](https://careers.capgemini.com/job/Diegem-Senior-SAP-S4HANA-Backend-Developer/1432309733/), ref. 546608, posted 30 September 2026 | ABAP OO, RAP, CDS, OData, BTP/CAP extensions, SAP/non-SAP integration, Clean Core, design decisions and estimates |
| J2 | [Capgemini ABAP RAP Lead, India](https://careers.capgemini.com/job/Bangalore-SAP-ABAP-RAP-Lead/1410768533/), ref. 511708, posted 27 September 2026 | Nine-plus years, RAP/CDS/VDM, OO, OData/REST, SQLScript/HANA optimization, Clean Core, code review, delivery, mentoring, IDoc/BAPI and classic forms |
| J3 | [NBCUniversal Senior Software Engineer, SAP ABAP](https://jobs.smartrecruiters.com/NBCUniversal3/744000146516019-senior-software-engineer-sap-abap-), publication date not exposed in retrieved body | RAP, CDS/OData, AMDP, released APIs, Clean Core classifications and ATC; classic ECC integration, debugging, workflow, classes/methods and finance-domain delivery |
| J4 | [TeamWork Full Stack and Integration Developer](https://jobs.smartrecruiters.com/TeamworkCorporate/744000135438970-developpeur-sap-full-stack-integration-h-f-), publication date not exposed in retrieved body | ABAP OO and design patterns, RAP/CAP, OData, released APIs, Clean Core, Fiori/UI5, BTP connectivity and integration; product maintainability and classic enhancements |

Within this selected four-ad sample, all four explicitly mention RAP, CDS/OData, Clean Core and OO or classes/methods. Two explicitly name HANA/SQLScript or AMDP depth (J2/J3); one explicitly names design patterns (J4); three retain classic enhancement/integration technologies (J2/J3/J4). These are counts of observed text in this sample, not interview probabilities. Broader terms do not imply an employer rejects a skill it did not list.

Additional specialist listings were not pooled into those counts. [SAP's retail AI/mobile developer listing](https://jobs.sap.com/job/Walldorf-AI-Native-Senior-Developer-%28fmd%29-%28AI-%26-Mobile-Products%29-69190/1384460533/) adds MDK, mobile synchronization, Git/CI/CD and AI integration; it is a wider specialist role. Another SAP disconnected-operations result redirected to the general jobs page on opening, so it was excluded from the coded sample. AI, MDK, deep CAP and functional BRIM expertise should be added when the actual job description demands them, not assumed mandatory for every ABAP backend role.

## What people report being asked

| ID | First-hand evidence | Observed scope and limits |
| --- | --- | --- |
| I1 | [ABAP RAP interview: candidate's update and interviewer replies](https://www.reddit.com/r/abap/comments/1j43lkz/abap_rap_interview/) | A candidate with three years describes approximately one hour, including projects, tables/views/joins, OO/interfaces, forms, module pools, CDS associations/cardinality, OData and RAP; they recall only six or seven RAP questions. A separate interviewer in the same thread describes entity modeling, behavior definitions, ETags, draft and writing EML for a scenario. These are different accounts within one thread, not independent statistical samples. |
| I2 | [Interview Experience - Mixed Feelings](https://www.reddit.com/r/abap/comments/1qy8029/interview_experience_mixed_feelings/) | Candidate reports about one hour covering RICEFW, DDIC, reports, interfaces, exits/BAdIs, modern syntax, debugging, function modules, forms and basic HANA. The role included support possibilities; it is not evidence of a pure senior Cloud interview. |
| I3 | [Interviewer account: company-switch questions](https://www.reddit.com/r/abap/comments/1kze4nv/sap_abap_interviews_experience_questions_for/) | An interviewer describes showing an application sketch and asking a backend candidate to propose RAP entities and behavior and explain why. The example recalls an earlier project rather than claiming a recent standardized question list. It supports architecture reasoning and honest project discussion. |

A further [Accenture fresher thread](https://www.reddit.com/r/accenture_india/comments/1uijbfe/final_interview_of_custom_software_engineer_at/) contains a claimed recent interview mentioning internal tables, DDIC, CDS and AMDP, but that reply also promotes a preparation service. It is excluded from the core evidence and from counts. Commercial question banks, undated lists and requests for future-interview advice do not establish actual question frequency.

## How much to prepare

The only directly reported completed-round durations retained here are about one hour in I1 and I2. Only I1 gives an approximate RAP question count. This is insufficient to infer a standard duration, total question count, number of rounds or senior topic percentages. An hour containing many small classic questions differs substantially from an hour exploring one transaction-design scenario.

For this user's senior modern-stack target, the following is an **authored 75-minute rehearsal**, not a market statistic:

| Time | Exercise | Expected depth |
| --- | --- | --- |
| 5 minutes | One truthful project story | Context, personal responsibility, constraint and evidence |
| 30 minutes | Two connected RAP/Cloud scenarios | Model, transaction ownership, security, concurrency, failure and release constraints |
| 15 minutes | Two foundations/OO/pattern decisions | Predict behavior, reject a plausible wrong answer and justify the design |
| 15 minutes | One HANA and one integration/operations problem | Correctness before optimization; recovery after uncertain outcomes |
| 10 minutes | Changed constraints and reverse questions | Explain what would change and what you must verify in the target landscape |

Aim to defend roughly 8-10 connected decisions in that rehearsal, not recite a large answer list. Allocate approximately 70% of study time to the primary Cloud track because that is the requested role focus. Adjust the split after receiving a specific vacancy and interview format.

## Coverage comparison and changes

| Competency | Before this revision | Action and question IDs |
| --- | --- | --- |
| Value versus reference semantics and modern ABAP traps | Broad foundations, limited edge-case reasoning | Added BASE-01 through BASE-16: aliasing, value-result parameters, stale assignment/system fields, exact conversion, rounding, merge/presence, grouping, key contracts, SQL input safety, cleanup and empty ranges |
| OO contracts and testable design | OO definitions and Clean ABAP overview | Added OODEEP-01 through OODEEP-12: substitution, interface/abstract choice, dispatch, friendship, construction, lifecycle, exception translation, static state and test boundaries |
| Practical design patterns | A few broad pattern questions | Added PAT-01 through PAT-12: Strategy/Template Method, factories, Adapter/Facade/Decorator, chain, Observer, Command, repository boundaries, singleton lifetime, composition and dependency injection |
| RAP entity/behavior reasoning, EML, draft and failure | Already extensive in modules 04/05/06/08/16/17/18/19/20 | Retained 154 primary questions, including 96 senior scenarios; added 40 curated RAP/CDS/Clean Core quizzes and eight focused RAP visuals |
| CDS/HANA/AMDP implementation decisions | SQL-01/12 explained when to choose AMDP, but lacked a concrete table-function review | Added SQLX-01 and SQLX-02 in module 24: client-safe read-only function contract and measured pushdown with result-grain validation |
| Git, transport and release evidence | OPS-09/10 and governance covered compatibility and delivery broadly | Added DELIV-01 in module 24: source exchange versus supported delivery, target import evidence and quality gates |
| HTTP/REST/JSON/XML, OData and uncertain integration outcomes | Present in 07/13, plus senior recovery scenarios | Retained; selected questions now have explained-choice challenges and all technical answers have reference links |
| RFC/BAPI, parallel work, LUWs/jobs, IDoc/AIF | Present in 14/15 and supporting workbook | Retained, with scenario visuals and per-question sources; legacy availability remains edition-specific |
| Personal experience, performance diagnosis and senior judgment | Stories and six-case senior mock already present | Retained spoken recall and evidence criteria; quiz XP remains independent of readiness |

This revision adds 43 canonical questions and 103 curated challenges. All 43 new questions have at least one meaningful linked visual and per-question primary references. The primary Cloud track remains the largest coherent curriculum group. The foundations expansion does not require adding repetitive RAP questions solely to change a percentage.

## Remaining role-specific depth

The pack does not claim exhaustive coverage of classic screen programming, every forms tool, every business module, full freestyle UI5 implementation, Integration Suite administration, CAP implementation, mobile development or AI engineering. The interview accounts show that classic tooling can still appear: use module 10 to discuss scope and support boundaries, and rehearse a real example if those tools are on the vacancy. For a pure Cloud role, explain why an older technique is unavailable or inappropriate rather than pretending hands-on experience.

For a named vacancy, annotate each required skill as delivered in production, practiced in a sandbox, understood conceptually or not yet studied. Then choose the relevant question IDs and source pages. This is more reliable preparation than treating any online list as a guaranteed interview script.
