# Testing security and delivery

Strong candidates explain how they know a solution works. Distinguish isolated unit tests, database or CDS tests, BO integration tests and real UI or service tests. State precisely which environment and behavior each result covers.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## TEST-01 What makes a useful ABAP Unit test?

**Level:** Core

**Short answer:** Test observable behavior with controlled inputs and explicit expected results. Keep tests deterministic, isolated and understandable. Replace external dependencies at deliberate boundaries rather than relying on shared production data. Include relevant negative and boundary cases, not just successful construction or trivial getters.

**Example and follow-up:** For a date validator, test a valid interval, equal dates and an invalid interval. Name the test after the business rule so a failure explains what broke.

**Avoid this mistake:** High statement coverage alone does not prove that assertions or business cases are meaningful.

**Read and verify this answer:**

- [SAP ABAP Unit documentation](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/abap-unit) - Verify what the test or check proves, and which runtime behavior still needs separate evidence.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## TEST-02 How does dependency injection help?

**Level:** Core

**Short answer:** An object receives collaborators through a defined interface instead of creating all dependencies internally. Tests can supply a fake repository, clock or service client, while production supplies the real implementation. The interface should express the required behavior, not merely reproduce a large concrete class.

**Example and follow-up:** A retry policy can be tested with a client that returns a timeout followed by success, without calling a live service or waiting real minutes.

**Avoid this mistake:** Mocking everything, including the object being tested, removes the behavior the test should verify.

**Read and verify this answer:**

- [SAP Clean ABAP testing guidance](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Verify what the test or check proves, and which runtime behavior still needs separate evidence.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## TEST-03 How would you test a RAP business object?

**Level:** Advanced

**Short answer:** Use suitable EML-driven tests to exercise the real BO behavior with controlled persistence and dependencies. Cover allowed and rejected operations, response messages, save failures, authorization and concurrency where appropriate. Add service-level tests for protocol behavior and UI tests for user flows. Framework availability depends on the target release.

**Example and follow-up:** A Submit test checks final state, FAILED and REPORTED, and persistence only after the intended save. A separate test confirms that an invalid request does not persist.

**Avoid this mistake:** A mock Fiori success or a doubled BO does not establish that the real RAP implementation works.

**Read and verify this answer:**

- [SAP RAP documentation](https://help.sap.com/docs/abap-cloud/abap-rap) - Documentation navigation starting point, not direct evidence for every statement. Find the named feature and target release; the scenario decision and verification plan are original analysis.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## TEST-04 How do SQL and CDS test doubles help?

**Level:** Advanced

**Short answer:** SQL and CDS test-double frameworks isolate supported database dependencies and allow deterministic fixtures. Choose the framework matching the component under test, configure dependencies accurately and clean up the environment. They do not automatically cover authorization, network protocols or real database performance.

**Example and follow-up:** For a CDS aggregation, insert a small dataset with multiple currencies and duplicate join targets to expose modeling errors. Verify both expected rows and absence of unwanted rows.

**Avoid this mistake:** Passing a double-based test is not a HANA execution-plan benchmark.

**Read and verify this answer:**

- [SAP ABAP Unit documentation](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/abap-unit) - Verify what the test or check proves, and which runtime behavior still needs separate evidence.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## TEST-05 What does ATC cover and what remains outside it?

**Level:** Core

**Short answer:** ATC performs configured static quality checks and can govern supported API and enhancement usage. Its findings depend on check variants and available components. Runtime correctness, business acceptance, deployment and full security still need other evidence. Review exemptions and update checks for target releases.

**Example and follow-up:** Keep syntax and activation checks, unit tests, ATC and end-to-end acceptance as separate results so each failure has a clear owner and meaning.

**Avoid this mistake:** Do not say that an ATC pass proves an application is error-free or fully Clean Core compliant.

**Read and verify this answer:**

- [SAP RAP documentation](https://help.sap.com/docs/abap-cloud/abap-rap) - Documentation navigation starting point, not direct evidence for every statement. Find the named feature and target release; the scenario decision and verification plan are original analysis.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## TEST-06 What security tests would you include?

**Level:** Core

**Short answer:** Test both permitted and forbidden reads and operations with realistic user roles and organizational scopes. Check direct API calls, mass operations and hidden fields, not only the UI. Verify authentication, DCL and behavior authorization separately and inspect error messages for unintended data exposure.

**Example and follow-up:** A user from company code A must not retrieve B's records by changing a URL or use an action on B's known key.

**Avoid this mistake:** Feature control, UI.hidden and disabled buttons are not sufficient security boundaries.

**Read and verify this answer:**

- [SAP Learning on RAP authorization](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Verify what the test or check proves, and which runtime behavior still needs separate evidence.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## TEST-07 How do you test concurrency and rollback?

**Level:** Advanced

**Short answer:** Reproduce conflicting edits with independent consumers and verify stale-version rejection and lock behavior. Inject an expected failure before persistence and confirm no unintended partial result. For remote dependencies test timeout, retry and compensation separately because local rollback cannot undo all external effects.

**Example and follow-up:** Read the same ETag twice, save from one client and submit the other write. Then simulate a failed child operation within the intended atomic group.

**Avoid this mistake:** Sequential happy-path tests cannot establish concurrency safety.

**Read and verify this answer:**

- [SAP RAP documentation](https://help.sap.com/docs/abap-cloud/abap-rap) - Documentation navigation starting point, not direct evidence for every statement. Find the named feature and target release; the scenario decision and verification plan are original analysis.

<details>
<summary>Visual: OData batch envelope and atomic groups</summary>

![OData batch envelope and atomic groups](../visuals/odata-batch-envelope.svg)

The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.

**Explain it:** If a later independent group fails, must an earlier successful group be rolled back?

**Limit:** Conceptual grouping, not an exact multipart or JSON batch payload.

</details>

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

<details>
<summary>Visual: Two editors and one version: an illustrated story</summary>

![Two editors and one version: an illustrated story](../visuals/etag-story-illustration.png)

Alice and Ben read version 7. Alice updates successfully, producing version 8. Ben must not overwrite that newer state using the stale version 7 precondition.

**Explain it:** Why should the client refresh and resolve the conflict instead of blindly retrying its old payload?

**Limit:** Version numbers are illustrative. Real ETags are opaque validators; a failed If-Match precondition commonly returns HTTP 412. This is optimistic concurrency, not a pessimistic lock.

</details>

## TEST-08 What would you include in a transport and deployment handoff?

**Level:** Core

**Short answer:** Identify repository objects, dependencies, configuration, authorization and service activation or communication steps. State target versions, checks executed and pending acceptance. Preserve the deployed source revision and rollback or recovery approach. A transport import is one step in delivery rather than the complete user experience.

**Example and follow-up:** For a RAP service, include DCL, behavior, metadata and binding dependencies plus the UI deployment and role setup. Verify the actual production-like endpoint after import.

**Avoid this mistake:** Local binding publication or a successful source copy is not proof of cross-system deployment.

**Read and verify this answer:**

- [SAP RAP documentation](https://help.sap.com/docs/abap-cloud/abap-rap) - Documentation navigation starting point, not direct evidence for every statement. Find the named feature and target release; the scenario decision and verification plan are original analysis.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## TEST-09 How would you investigate a production defect?

**Level:** Advanced

**Short answer:** Capture the symptom, scope, timing, affected revision and reproducible input. Use authorized logs, dumps and traces to isolate the failing layer, preserving sensitive data. Reproduce safely, add a regression case, implement the smallest sound fix and compare behavior before rollout.

**Example and follow-up:** For an intermittent duplicate document, examine retries and transaction boundaries rather than immediately adding a UI delay. Distinguish a code defect from configuration or data issues.

**Avoid this mistake:** A plausible explanation without evidence should not be presented as a confirmed root cause.

**Read and verify this answer:**

- [SAP RAP documentation](https://help.sap.com/docs/abap-cloud/abap-rap) - Documentation navigation starting point, not direct evidence for every statement. Find the named feature and target release; the scenario decision and verification plan are original analysis.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## TEST-10 How should you describe tests you have not run?

**Level:** Core

**Short answer:** Separate prepared test cases from executed results. State the environment, revision, actual outcome and remaining validation. If you only inspected source locally, say so. This makes the handoff actionable and shows engineering judgment rather than overstating confidence.

**Example and follow-up:** A sample answer can say: I prepared EML scenarios and reviewed the source; activation, ABAP Unit and ATC still need the target SAP system.

**Avoid this mistake:** Never claim a passing SAP syntax check, measured coverage or successful activation without an actual run.

**Read and verify this answer:**

- [SAP ABAP Unit documentation](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/abap-unit) - Verify what the test or check proves, and which runtime behavior still needs separate evidence.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

<details>
<summary>Visual: Explain decisions with evidence</summary>

![Explain decisions with evidence](../visuals/interview-evidence-story.svg)

Practice a 60-second version first, then expand the mechanism and evidence when prompted.

**Explain it:** Can you name the decision, trade-off and evidence without inventing metrics?

**Limit:** A rehearsal structure, not a scripted personal history or a substitute for technical depth.

</details>

## Official references

- [SAP Clean ABAP testing guidance](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md)
- [SAP Learning on RAP authorization](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks)
- [SAP RAP documentation](https://help.sap.com/docs/abap-cloud/abap-rap)
- [SAP ABAP Unit documentation](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/abap-unit)
