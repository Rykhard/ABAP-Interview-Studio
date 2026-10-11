# Clean Core levels and extensibility

Clean Core interviews test architectural judgment, not just memorization of A through D. Explain the target edition, actual API and extension technology, upgrade risk and governance. The levels complement the choice of key-user, on-stack or side-by-side extensibility.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## CORE-01 What is Clean Core in a practical ABAP answer?

**Level:** Core

**Short answer:** Keep extensions decoupled from SAP internals through supported contracts so business changes and upgrades remain manageable. Start with fit-to-standard, use suitable released interfaces and extension points, and govern exceptions and lifecycle costs. Extensibility is one dimension of Clean Core alongside concerns such as processes, data and integration.

**Example and follow-up:** Explain a business requirement, why standard configuration was insufficient, which extension boundary you chose, and how you test upgrades. This is stronger than saying that all custom code must disappear.

**Avoid this mistake:** Clean Core is not the same as Clean ABAP, zero custom code or moving everything to BTP.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-02 What are Clean Core levels A B C and D?

**Level:** Core

**Short answer:** A uses released SAP interfaces and extension points with their supported contracts. B uses SAP-designated classic APIs and supported classic extension options. C depends on internal SAP objects with upgrade risk. D uses explicitly non-recommended objects or techniques. Always classify actual dependencies and technology in the applicable product context.

**Example and follow-up:** Use A where feasible, consider B for justified classic scenarios, manage C with explicit risk ownership and monitoring, and prioritize remediation of D.

**Avoid this mistake:** A familiar API is not automatically B, and every unreleased object is not automatically D.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-03 How do the levels map to ATC messages?

**Level:** Core

**Short answer:** In the configured Clean Core usage checks, A produces no corresponding finding, B is priority 3 information, C is priority 2 warning and D is priority 1 error. This is the Clean Core mapping, not a universal interpretation of every ATC result from security or performance checks.

**Example and follow-up:** Confirm the check variant, check implementation, classification data and target release before interpreting a result. A system with missing checks can appear green without proving compliance.

**Avoid this mistake:** No ATC findings does not prove that the entire application is secure, correct or fully Level A.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-04 Why is a classic API Level B rather than Level A?

**Level:** Advanced

**Short answer:** SAP may designate an established interface for classic use without releasing it under the ABAP Cloud contract. That nomination supports a lower-risk classic extension path, but it does not grant unrestricted consumption from ABAP for Cloud Development. Classification and language-version permissions are related but distinct.

**Example and follow-up:** Look up the exact object and applicable use in SAP's classification data. A function module name beginning BAPI is not enough evidence.

**Avoid this mistake:** Do not describe all classic APIs as public-cloud-ready or as formally C1-released.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.
- [SAP Cloudification Repository](https://github.com/SAP/abap-atc-cr-cv-s4hc) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-05 What does responsible Level C use look like?

**Level:** Advanced

**Short answer:** Level C acknowledges dependence on internals that may change. Identify the missing supported alternative, isolate the dependency, assign ownership, track SAP changes and test affected processes during upgrades. Keep a replacement plan. Organizational exception policy and the target product still govern whether the use is acceptable.

**Example and follow-up:** A required internal read with no suitable alternative should have a named owner and regression coverage. Reassess when SAP releases a successor or changes the classification.

**Avoid this mistake:** C is not an unlimited permission to call anything, nor is it the same risk category as a modification.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-06 What belongs to Level D and what would you do first?

**Level:** Core

**Short answer:** Explicitly non-recommended objects and techniques, including problematic modifications or unsupported direct changes to SAP persistence, represent the highest-risk category. Confirm the actual classification and operation. Replace dangerous write paths or modifications with supported APIs or extension points, using regression tests and a staged rollout.

**Example and follow-up:** For a direct UPDATE of an SAP business table, find the released or supported business API that performs checks and dependent updates rather than reproducing only the table assignment.

**Avoid this mistake:** The fact that a direct update works in development does not establish a supported business transaction.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-07 Are A through D the same as the old three tiers?

**Level:** Core

**Short answer:** No. The earlier model organized ABAP Cloud development, API enablement through wrappers and classic extensions into tiers. The newer levels classify dependency and technology choices more granularly, particularly for private edition and on-premise landscapes. Keep tiers as historical context, not the main current grading scheme.

**Example and follow-up:** A classic extension can qualify at B rather than being dismissed solely for using classic ABAP. A wrapper can still contain a C or D dependency.

**Avoid this mistake:** Do not map tier 1 to A, tier 2 to B and tier 3 to C mechanically.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-08 Does wrapping an unreleased SAP API make it Level A?

**Level:** Advanced

**Short answer:** A released custom wrapper can provide a controlled interface to a consumer where the platform permits it. Its implementation still has the classification and upgrade risk of the underlying dependency. Evaluate both consumer contract and implementation chain, and retire the wrapper when an appropriate supported alternative exists.

**Example and follow-up:** A wrapper around a nominated classic API can retain a B implementation dependency even when the calling ABAP Cloud code sees a released custom contract.

**Avoid this mistake:** A wrapper is not a mechanism for laundering an internal or prohibited dependency into an entirely Level A solution.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-09 How do public private and on-premise editions change the answer?

**Level:** Core

**Short answer:** Public-edition developer extensibility uses the supported ABAP Cloud model and released contracts. Private edition and on-premise support broader classic scenarios alongside ABAP Cloud, depending on release. The A-D model helps govern those existing dependencies; it does not unlock forbidden language or objects in a restricted environment.

**Example and follow-up:** Start an interview architecture answer by asking which edition and release are in scope. ABAP Cloud is available beyond public cloud and BTP, so location alone is not the development model.

**Avoid this mistake:** Private cloud does not mean that every classic customization is recommended, and ABAP Cloud does not mean only BTP.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.
- [SAP ABAP Cloud FAQ](https://pages.community.sap.com/topics/abap/abap-cloud-faq) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-10 How do you choose key-user on-stack and side-by-side extensibility?

**Level:** Core

**Short answer:** Choose key-user tools for supported business-context adaptations. Choose on-stack developer extensibility when close access to released data and transactional integration is required. Choose side-by-side for a more independent application lifecycle or cross-system process, using supported remote interfaces and explicit distributed consistency.

**Example and follow-up:** An additional field with a supported business context may fit key-user tools. A synchronous local validation may fit a released BAdI. A cross-system approval portal may fit BTP.

**Avoid this mistake:** These are placement and development choices, not automatic A-D grades or fixed implementation times.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## CORE-11 Why is side-by-side not automatically Clean Core?

**Level:** Advanced

**Short answer:** An external application still depends on its integration contracts. Unsupported table access, fragile endpoints or duplicated core business logic can retain upgrade and lifecycle risk even when the code runs on BTP. Decoupling also requires security, observability, versioning and consistency design.

**Example and follow-up:** A remote extension using a stable business API and idempotent events can evolve independently within that contract. It still needs regression tests when the API or business semantics change.

**Avoid this mistake:** Moving custom code out of the ERP server does not erase coupling.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-12 What are release contracts C0 C1 and C2?

**Level:** Advanced

**Short answer:** In the ABAP release-contract vocabulary, C0 concerns extension, C1 system-internal use and C2 remote use. Check release state, contract and use visibility for the exact object and scenario. A contract describes supported consumption; it does not replace business authorization or establish that every needed operation is available.

**Example and follow-up:** An object suitable for local ABAP consumption is not automatically a remote API. Conversely an HTTP API does not necessarily expose a released local ABAP implementation class.

**Avoid this mistake:** A public class or an I_ CDS name is not proof of a released API contract.

**Read and verify this answer:**

- [SAP API release contracts](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis?locale=en-us) - Verify actual dependency classification and target-edition restrictions.

## CORE-13 How do you verify an API choice rather than guess?

**Level:** Advanced

**Short answer:** Check official API discovery and documentation, the target repository's API state and release visibility, and SAP's applicable Cloudification Repository and technology guidance. Confirm the required operation and product version. Use ATC against maintained classification data to validate actual usage.

**Example and follow-up:** Verify a proposed write operation, not merely the existence of a similarly named read CDS view. Record the successor and any restrictions alongside the architecture decision.

**Avoid this mistake:** A search result, object prefix or successful syntax check alone does not establish support for the intended usage.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-14 Can a solution using both A and B dependencies be called entirely A?

**Level:** Advanced

**Short answer:** No. The lower-grade dependency matters when assessing the containing development and its upgrade risk. Preserve object-level findings and dependency context rather than averaging them away. An A-compliant consumer and a B wrapper are useful separate facts, but they do not remove the B dependency from the solution.

**Example and follow-up:** Report the distribution of findings and critical dependencies. Prioritize remediation by business impact, exposure and cost, not only the number of objects.

**Avoid this mistake:** Percentages of Level A objects should not hide one critical D write path.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-15 What if no released API covers the business requirement?

**Level:** Core

**Short answer:** Recheck standard functionality and supported extension points, confirm the target release, and evaluate another placement or process design. In a landscape allowing classic development, inspect designated classic APIs and govern any remaining internal dependency. Request a supported API through the appropriate SAP channel when needed.

**Example and follow-up:** Document the missing operation, alternatives rejected, risk owner and exit criteria. A temporary exception should have an explicit review point when a successor appears.

**Avoid this mistake:** Do not immediately choose a modification, and do not assume public edition permits a classic workaround.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-16 What would your Clean Core governance pipeline contain?

**Level:** Advanced

**Short answer:** Maintain a system-specific ATC variant with API-usage and enhancement-technology checks plus appropriate quality and security checks. Review findings, own exceptions with expiry or review conditions, and track remediation. Recheck against target-upgrade information and real regression tests. Automated checks support architecture judgment.

**Example and follow-up:** A transport policy may block selected priorities while allowing reviewed exceptions. Explain how exemptions are approved and revisited rather than silently suppressing all findings.

**Avoid this mistake:** A priority number alone is not a complete technical-debt decision or a substitute for runtime tests.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-17 Is Clean ABAP the same thing as Clean Core?

**Level:** Core

**Short answer:** Clean ABAP concerns understandable and maintainable implementation: naming, responsibilities, interfaces, error handling and tests. Clean Core concerns extension boundaries, supported dependencies and lifecycle stability. They reinforce one another, but a beautifully written class can still modify SAP internals and create high upgrade risk.

**Example and follow-up:** Review a class twice: first its dependencies and extension mechanism, then its code quality and tests. Both dimensions belong in a strong interview example.

**Avoid this mistake:** Refactoring variable names does not change the Clean Core level of an unsupported dependency.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

## CORE-18 How would you modernize a large custom-code portfolio?

**Level:** Advanced

**Short answer:** Start with usage and business value, retire genuinely unused code after validation, then classify dependencies and address the highest-risk active objects. Adopt supported APIs and suitable extension patterns incrementally. Measure regressions and upgrade effort, and avoid rebuilding every classic report solely for stylistic uniformity.

**Example and follow-up:** Select one important D dependency, establish baseline behavior, replace it behind a clear interface and verify the end-to-end process. Repeat with evidence rather than promising a universal automatic conversion.

**Avoid this mistake:** RAP is not a mandatory replacement for every report, interface or classic application.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## Official references

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487)
- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad)
- [SAP Cloudification Repository](https://github.com/SAP/abap-atc-cr-cv-s4hc)
- [SAP ABAP Cloud FAQ](https://pages.community.sap.com/topics/abap/abap-cloud-faq)
- [SAP TechEd Clean Core exercise](https://github.com/SAP-samples/teched2025-DT260/blob/main/exercises/ex3/README.md)
- [SAP API release contracts](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis?locale=en-us)
