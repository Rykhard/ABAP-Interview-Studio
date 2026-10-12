# Clean Core levels and extensibility

Clean Core interviews test architectural judgment, not just memorization of A through D. Explain the target edition, actual API and extension technology, upgrade risk and governance. The levels complement the choice of key-user, on-stack or side-by-side extensibility.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## CORE-01 What is Clean Core in a practical ABAP answer?

**Level:** Core

**Short answer:** Clean Core means extending SAP through supported interfaces so custom changes are easier to keep working during upgrades. First check whether standard configuration already meets the need. When code is needed, choose suitable APIs and extension points, and track any exceptions. Custom code can still exist. Clean Core also covers areas such as business processes, data, and integration.

**Reasoning and example:** The business needs an extra approval check. First see whether standard configuration supports it. If not, look for a supported extension point at the moment when the check must run. Record which API or extension contract you rely on and test the approval process when the SAP system is upgraded.

In an interview, explain that decision using a real requirement and its outcome. Saying that all custom code should disappear does not explain how the requirement is met. Neither moving the code to BTP nor making its classes neat automatically removes dependence on SAP internals. The useful result is a supported extension whose behavior and upgrade responsibility are clear.

**Avoid this mistake:** Clean Core is not the same as Clean ABAP, zero custom code or moving everything to BTP.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-02 What are Clean Core levels A B C and D?

**Level:** Core

**Short answer:** The levels describe which SAP dependencies and extension techniques custom code uses. A uses released APIs and extension points under their supported contracts. B uses SAP-designated classic APIs and supported classic options. C uses SAP internals that may change. D uses explicitly non-recommended objects or techniques. Check the actual classification for the product and use involved.

**Reasoning and example:** Imagine four ways to meet a requirement. A released API that supports the operation is the preferred A path. A designated classic API may provide a justified B path in a landscape where classic development is allowed. Calling an internal object introduces C risk, while an explicitly non-recommended technique belongs to D.

The response should match the risk: prefer A where suitable, assess B, give C a named owner and replacement plan, and prioritize fixing D. Do not classify by familiarity or naming. A function module everyone has used for years is not automatically B, and an unreleased object is not automatically D. Look up the actual dependency and supported operation.

**Avoid this mistake:** A familiar API is not automatically B, and every unreleased object is not automatically D.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-03 How do the levels map to ATC messages?

**Level:** Core

**Short answer:** For the configured Clean Core usage checks, A has no corresponding finding. B gives priority 3 information, C gives a priority 2 warning, and D gives a priority 1 error. This mapping applies to those checks. Other ATC checks may use priorities for different problems. A green run is useful only when the right checks and classification data actually ran.

**Reasoning and example:** A team sees no Clean Core findings after an ATC run and calls the application Level A. Before accepting that, check the variant, check implementation, classification data, and target release. If the relevant usage check was not included, silence says nothing about those dependencies.

When a priority 2 finding appears, inspect the object and the relevant Clean Core classification rather than treating the number as a universal description of every ATC issue. A security finding with the same priority needs its own interpretation. Use the findings to guide dependency review, and test the application separately for correctness and security. Clean Core classification is not a complete application quality certificate.

**Avoid this mistake:** No ATC findings does not prove that the entire application is secure, correct or fully Level A.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-04 Why is a classic API Level B rather than Level A?

**Level:** Advanced

**Short answer:** A classic API can be designated by SAP for supported classic use without being released for ABAP Cloud use. That is why it can be Level B rather than A. The Clean Core classification and the ABAP language version's access rules are related but different. Check the exact object and allowed use; a BAPI name alone proves neither.

**Reasoning and example:** A private-edition extension needs a function module that SAP designates as a classic API. That designation may make it a reasonable B dependency in an allowed classic implementation. It does not mean an ABAP for Cloud Development class can call it directly, or that public-edition developer extensibility permits the same design.

Check both questions separately: what is the dependency's classification, and what may this consumer use? Inspect the actual API state, classification data, product, and operation. If a permitted wrapper design is needed, account for its underlying dependency too. Calling an interface established or public in conversation is not the same as proving it has the required release contract.

**Avoid this mistake:** Do not describe all classic APIs as public-cloud-ready or as formally C1-released.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.
- [SAP Cloudification Repository](https://github.com/SAP/abap-atc-cr-cv-s4hc) - Look up the actual dependency classification and check what the target edition permits.

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

**Short answer:** Using Level C means accepting a dependency on SAP internals that may change. First explain why a supported alternative does not meet the need. Isolate the dependency, name its owner, test the affected process, and plan its replacement. Recheck it when SAP changes or releases alternatives. Your product restrictions and exception policy still decide whether the use is allowed.

**Reasoning and example:** Suppose an important report needs information that no suitable supported API currently exposes. In a landscape where the proposed internal read is permitted, keep it behind a small, clear interface so the rest of the app does not depend directly on that internal object. Record why the exception exists and which business process depends on it.

During an upgrade, test that process and inspect changes to the dependency and its classification. If SAP later offers a suitable API, revisit the exception and replace the internal read where feasible. A signed exception does not freeze SAP's implementation or make the risk disappear. C is a managed risk decision, not unrestricted permission to call anything.

**Avoid this mistake:** C is not an unlimited permission to call anything, nor is it the same risk category as a modification.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.

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

**Short answer:** Level D covers explicitly non-recommended objects or techniques, including problematic modifications and unsupported direct changes to SAP business data. Confirm the exact classification and operation first. Then replace the risky path with a supported business API or extension point. Start with active, high-impact writes and modifications. Use tests and a staged rollout so the replacement preserves the business process.

**Reasoning and example:** A custom report directly updates an SAP document table and seems to work. The standard business transaction may also update related records, enforce permissions, lock the document, and create change history. The single table update can leave those other parts inconsistent even when the changed field looks correct on screen.

Find the supported API or extension point for the business operation and compare its outcome with the required process. Build regression tests around the full document, not just that one column. Introduce the replacement carefully and monitor the result. Successful execution in a development system is evidence that SQL ran, not evidence that the business transaction is supported or complete.

**Avoid this mistake:** The fact that a direct update works in development does not establish a supported business transaction.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-07 Are A through D the same as the old three tiers?

**Level:** Core

**Short answer:** No. The earlier three-tier model described ABAP Cloud development, API enablement through wrappers, and classic extensions. Levels A to D classify the actual dependencies and techniques in more detail. They are especially useful when discussing private-edition and on-premise custom code. A tier number does not translate directly into a Clean Core level.

**Reasoning and example:** A classic extension may use a SAP-designated classic API and qualify at B for that dependency. Calling it tier 3 does not automatically make it C. Likewise, a wrapper used to enable an ABAP Cloud consumer can still contain an internal C dependency or a non-recommended D technique.

When reviewing the solution, trace what it really calls and how it extends SAP. Use the applicable current classification instead of converting an old architecture diagram mechanically into grades. You can still explain the three tiers as background for why wrappers exist, but keep placement and dependency assessment distinct. That produces a more useful answer than memorizing tier 1 equals A and so on.

**Avoid this mistake:** Do not map tier 1 to A, tier 2 to B and tier 3 to C mechanically.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-08 Does wrapping an unreleased SAP API make it Level A?

**Level:** Advanced

**Short answer:** No. A released custom wrapper can give its callers a controlled interface where the platform allows that design. The wrapper still calls the underlying SAP object, with that object's classification and upgrade risk. Review the full call chain. Releasing your own interface does not make an internal or non-recommended SAP dependency become Level A.

**Reasoning and example:** An ABAP Cloud class calls a released custom wrapper, and the wrapper calls a nominated classic API. The consumer now has a clear custom contract, but the wrapper implementation still has the B dependency. If the classic API changes, someone must still maintain that wrapper and test its callers.

The same reasoning applies to an internal C dependency or a D technique: hiding it behind one method does not remove it. Record the dependency, owner, and replacement condition. If a suitable released SAP API becomes available, assess moving to it and retiring the wrapper. The wrapper's useful job is to control and isolate access, not to change the facts about the code underneath.

**Avoid this mistake:** A wrapper is not a mechanism for laundering an internal or prohibited dependency into an entirely Level A solution.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-09 How do public private and on-premise editions change the answer?

**Level:** Core

**Short answer:** Start with the SAP edition and release. Public-edition developer extensibility uses supported ABAP Cloud features and released contracts. Private edition and on-premise can also allow classic development, depending on release. Levels A to D help assess those dependencies. They do not allow forbidden objects or language features in a restricted environment. ABAP Cloud is not limited to BTP.

**Reasoning and example:** Two teams may ask for the same extra validation but work in different landscapes. One uses public edition; the other has a private-edition system with existing classic extensions. The permitted implementation options can differ even when the business requirement is identical. Check available APIs, extension points, and language-version rules before proposing a solution.

For the private-edition team, a classic option may be available but still need a dependency and risk assessment. For the public-edition team, calling it Level B or an approved exception does not unlock a classic technique the environment forbids. Explain both support and suitability. Where the code runs alone is not enough to identify its development model or its Clean Core level.

**Avoid this mistake:** Private cloud does not mean that every classic customization is recommended, and ABAP Cloud does not mean only BTP.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.
- [SAP ABAP Cloud FAQ](https://pages.community.sap.com/topics/abap/abap-cloud-faq) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-10 How do you choose key-user on-stack and side-by-side extensibility?

**Level:** Core

**Short answer:** Choose the simplest supported option that meets the business need. Key-user tools fit supported field and process adaptations. On-stack developer extensibility fits logic that needs close access to local business data or the transaction. Side-by-side fits a more independent app or cross-system process. Use supported remote interfaces and plan how separate systems recover when one fails.

**Reasoning and example:** An extra field may already be supported by a key-user business context, so writing a new application adds little value. A validation that must reject the current document before it saves may fit a released local BAdI. A supplier portal used across several systems may fit a separate BTP application with its own release cycle.

Compare the required timing, users, data, and failure behavior. A remote portal cannot automatically share the local document's database transaction, so define pending and failed states where needed. These are placement choices, not automatic Clean Core grades. Each chosen implementation still needs a review of the APIs and extension technologies it actually uses.

**Avoid this mistake:** These are placement and development choices, not automatic A-D grades or fixed implementation times.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## CORE-11 Why is side-by-side not automatically Clean Core?

**Level:** Advanced

**Short answer:** Running outside SAP does not remove dependence on SAP. An external app can still use unsupported endpoints, read internal tables, or copy fragile business rules. Clean integration needs supported contracts, security, versioning, monitoring, and clear failure handling. BTP can help separate application lifecycles, but the quality of the integration still decides how safely the systems can change.

**Reasoning and example:** A portal on BTP reads data through an undocumented endpoint that changes during an SAP upgrade. The portal is outside the ERP system, but its unsupported dependency still breaks it. Moving the code changed its location without making the interface stable. A supported business API provides a clearer contract to build and test against.

If the portal also consumes events, handle retries without creating duplicate business actions and monitor failures. Test changes to the API and business meaning before upgrades. Independent deployment is useful only within the limits of the agreed integration contract. Copying SAP's core business logic into the portal may introduce another source of maintenance and consistency problems.

**Avoid this mistake:** Moving custom code out of the ERP server does not erase coupling.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

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

**Short answer:** C0 is a release contract for extension. C1 is for use within the system, and C2 is for remote use. Check the exact object's release state, contract, and allowed visibility before using it. These contracts say how an object may be consumed. They do not grant business permissions or promise that every operation you need exists.

**Reasoning and example:** You find a CDS entity that is released for local ABAP use. That can support a local read, but it does not automatically give an external application an HTTP endpoint. A remote API needs the appropriate remote contract and service setup. The reverse also matters: a published remote API does not necessarily release its internal ABAP implementation class for local callers.

For an extension, inspect whether the object actually permits the required kind of extension under the relevant contract. A public class definition or a familiar I_ name is not enough evidence. Then check business authorization separately, because a supported API can still reject a caller who is not allowed to perform the operation.

**Avoid this mistake:** A public class or an I_ CDS name is not proof of a released API contract.

**Read and verify this answer:**

- [SAP API release contracts](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis?locale=en-us) - Look up the actual dependency classification and check what the target edition permits.

## CORE-13 How do you verify an API choice rather than guess?

**Level:** Advanced

**Short answer:** Look up the exact API and the operation you need in official documentation. Check its API state and allowed use in the target system. Use applicable Cloudification Repository data and SAP technology guidance for classification. Then run the relevant maintained ATC checks on actual usage. A familiar name or successful syntax check is not enough evidence of supported use.

**Reasoning and example:** The requirement is to change a purchase document. A search finds a released CDS view with a matching business name, but that view may only support reading. Confirm that the proposed interface supports the write operation, the needed fields, and the target product version before committing to the design.

Inspect release visibility in the repository and note any restrictions or recommended successor. Use ATC to check the code's actual dependencies with current classification data. A proof of concept can then verify the required behavior. Keeping these steps separate avoids a common mistake: treating the existence of an object as proof that every intended way of using it is supported.

**Avoid this mistake:** A search result, object prefix or successful syntax check alone does not establish support for the intended usage.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-14 Can a solution using both A and B dependencies be called entirely A?

**Level:** Advanced

**Short answer:** No. If the solution depends on a Level B interface, that dependency is still part of the solution. You can report an A-compatible consumer and a B wrapper separately, but the whole chain is not entirely A. Keep object-level findings visible. A large percentage of A objects must not hide one critical higher-risk dependency.

**Reasoning and example:** An application has many classes using released interfaces and one wrapper calling a designated classic API. Reporting only the classes in the consumer layer makes the result look cleaner than the actual system. Include the wrapper and explain which business operation depends on it and what maintenance risk remains.

Prioritize by business impact as well as counts. One unsupported write path used for every payment can matter more than many low-impact read findings. Show both the distribution and the critical dependencies, then choose remediation based on exposure, replacement options, and cost. Averaging grades or counting only the top layer does not explain whether the important business process will survive an upgrade.

**Avoid this mistake:** Percentages of Level A objects should not hide one critical D write path.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-15 What if no released API covers the business requirement?

**Level:** Core

**Short answer:** First recheck standard features, configuration, and supported extension points on the target release. Consider a different process or placement if it meets the requirement. Where classic development is allowed, assess designated classic APIs and any remaining internal dependency under the exception policy. Request a supported API when needed. Do not assume a classic workaround is possible in public edition.

**Reasoning and example:** A team cannot find a released API for a required write. Confirm the exact missing operation before declaring an API gap: a standard process or released extension point may achieve it another way. Compare alternatives with the business, including whether immediate completion is truly required or a different workflow would work.

If an allowed temporary exception remains necessary, record its owner, rejected alternatives, test coverage, and replacement condition. Review it when SAP offers a successor. Do not start with a modification simply because it is technically convenient. And in a restricted environment, an exception document cannot enable a forbidden technique; the design must still fit what that product supports.

**Avoid this mistake:** Do not immediately choose a modification, and do not assume public edition permits a classic workaround.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

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

**Short answer:** Use ATC checks that match the system and include API usage, extension technologies, security, and code quality as appropriate. Review findings instead of hiding them. Give exceptions an owner and a date or condition for review. Track fixes and rerun checks for upgrades. Combine the automated results with architecture review and real business-process regression tests.

**Reasoning and example:** A transport contains a new internal API call. The pipeline should identify it with the relevant check and route it for a decision under the team's policy. Some findings may block delivery, while a justified exception may be accepted with a clear owner and follow-up date. Store that decision rather than disabling the whole check.

Before an upgrade, update the relevant check and classification information and rerun the affected process tests. A previously accepted dependency may now have a supported replacement or a changed risk. The priority number helps triage work, but it does not tell you the full business impact. Runtime evidence and responsibility for the exception remain necessary.

**Avoid this mistake:** A priority number alone is not a complete technical-debt decision or a substitute for runtime tests.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Look up the actual dependency classification and check what the target edition permits.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-17 Is Clean ABAP the same thing as Clean Core?

**Level:** Core

**Short answer:** Clean ABAP is about code that people can understand, change, and test. Clean Core is about supported extension choices and dependencies that are easier to maintain across SAP changes. They help each other but measure different things. A well-written class can still depend on SAP internals. Renaming variables does not change that dependency's Clean Core level.

**Reasoning and example:** Review a custom approval class in two passes. First ask how it connects to SAP: does it use supported APIs and extension points, or directly modify an internal table? That determines the extension and upgrade concern. Then review its responsibilities, naming, interfaces, errors, and tests to judge how maintainable the implementation is.

You might find an easy-to-read class with a dangerous write dependency, or a supported API used through confusing, untested code. Each needs a different improvement. Replacing the unsupported write helps Clean Core; separating responsibilities and adding meaningful tests helps Clean ABAP. A strong interview answer explains both changes and why one does not automatically solve the other.

**Avoid this mistake:** Refactoring variable names does not change the Clean Core level of an unsupported dependency.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

## CORE-18 How would you modernize a large custom-code portfolio?

**Level:** Advanced

**Short answer:** Start by finding which custom code is actually used and valuable. Confirm and retire genuinely unused parts, then classify dependencies in active code. Fix the most important risky paths first and adopt suitable supported APIs step by step. Measure business regressions and upgrade effort. Do not rebuild every classic report in RAP just to make the technology look uniform.

**Reasoning and example:** A portfolio contains hundreds of reports, but a small number handle critical daily work. Confirm usage and ownership before deleting anything. Pick one important active dependency, such as an unsupported business-table write, and document the current business outcome. Replace it behind a clear interface and test the entire affected process.

Roll out the change with evidence that users can still complete their work, then repeat for the next priority. Some reports may remain perfectly suitable as reports, while a transactional application may benefit from RAP. The modernization decision should follow business value and risk. An automatic conversion promise hides the need to understand existing behavior, integrations, and exception cases.

**Avoid this mistake:** RAP is not a mandatory replacement for every report, interface or classic application.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Look up the actual dependency classification and check what the target edition permits.

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
