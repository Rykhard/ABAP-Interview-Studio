# Testing security and delivery

Strong candidates explain how they know a solution works. Distinguish isolated unit tests, database or CDS tests, BO integration tests and real UI or service tests. State precisely which environment and behavior each result covers.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## TEST-01 What makes a useful ABAP Unit test?

**Level:** Core

**Short answer:** A useful test checks a real rule with known inputs and a clear expected result. It should behave the same each time and not depend on another test or shared production data. I cover errors and limits as well as success. A test that only creates an object or reaches a line of code says little about whether the business behavior is correct.

**Reasoning and example:** For a date-range validator, I prepare a valid range, equal start and end dates, and an end date before the start. The expected result follows the actual business rule: equal dates might be allowed or rejected, so I make that decision explicit. The test name describes the rule that would be broken.

I keep the validator real and control any outside dependency, such as the current date. A failing assertion should explain which result was wrong. High coverage is useful for finding untested areas, but a test can execute every line without checking the right outcome. I therefore review the cases and assertions, not only the percentage.

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

**Short answer:** Dependency injection means giving an object the helpers it needs instead of letting it create all of them internally. A test can supply a fake repository, clock or service client. Production supplies the real one through the same interface. This makes failures and timing predictable in tests. I keep the behavior I am testing real, rather than mocking it away.

**Reasoning and example:** A retry policy may retry an idempotent remote lookup once. In a unit test, I supply a client that returns a timeout on its first call and customer C20 on its second. A controlled clock or delay seam avoids waiting real minutes. The test checks the actual policy: which failures it retries, how many attempts it allows and what result it returns.

Another case returns a business rejection that should not be retried. A third returns two timeouts: the policy must stop after two calls, request only one delay and return the final failure. If I replaced the retry policy itself with a mock, I would only prove my mock setup. The interface should describe the few operations the policy needs; copying a huge client interface makes both the design and test unnecessarily complicated.

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

**Short answer:** I test the real RAP business object with controlled data, using suitable EML tests where supported. I check successful changes, rejected changes, messages and what is saved. I also cover authorization and conflicting edits at the appropriate test level. Service and UI tests cover different behavior. Available RAP test frameworks depend on the target release.

**Reasoning and example:** For a Submit action, I create a request in the required initial state and call the real behavior. I check the resulting state and the FAILED and REPORTED responses. I verify persistence only after the intended save, because a change in the transaction buffer is not yet a committed database record.

A second test submits an invalid request and checks that it is rejected without an unintended saved change. Separate tests cover the service protocol and real user permissions. A mocked Fiori success screen or a double replacing the BO cannot prove the implementation works. I state which dependencies were controlled and which real integration paths were actually executed.

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

**Short answer:** SQL and CDS test doubles replace supported database dependencies with test-controlled data. That lets a test run with known rows instead of changing production-like tables. I use the framework suited to the component and configure its dependencies carefully. I also clean up the test environment. These tests do not prove real database performance, network behavior or the complete authorization setup.

**Reasoning and example:** For a CDS total, I load a small fixture with two currencies, an order without a matching text and one record that could match several joined rows. Then I check the expected totals and ensure no extra rows appear. This exposes model errors more clearly than testing against whatever data happens to be in a shared system.

The setup must cover the dependencies the tested component actually reads. An incorrect double configuration can test a different situation from production. After each test, the environment must be reset or destroyed appropriately. I still use real-system checks for the execution plan, deployed access control and integration behavior; a passing double-based test is not a HANA benchmark.

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

**Short answer:** ATC runs the static checks configured for the system and check variant. It can find code problems and check supported API or enhancement usage. A pass means those checks found no blocking issue; it does not prove every business case works. Unit tests, security tests and deployment checks are still needed. I record exemptions and the target release used for the checks.

**Reasoning and example:** A new RAP service may pass syntax and activation but still return the wrong total. It may also pass unit tests while using an API forbidden by the target rules. ATC and runtime tests answer different questions, so I keep their results separate in the handoff instead of summarizing everything as tested.

I record the ATC variant and review any exemptions, including their reason and owner. If the target release changes, I recheck which rules and API classifications apply. An empty finding list is useful evidence, but it is not proof of complete Clean Core compliance, correct authorization for every user or a successful end-to-end business process.

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

**Short answer:** I test what a user may do and what they must be prevented from doing. That includes direct API reads and actions, not only visible buttons. I check realistic roles, company or organizational limits, bulk requests and sensitive fields. Login, CDS access control and operation authorization are separate checks. Error messages must also avoid revealing data the user may not see.

**Reasoning and example:** A user assigned to company A should see A records and be unable to read B records by editing a URL. I also try an action using a known B record key, because hiding B in a list does not prove that the action is protected. A mixed bulk request should behave according to the documented authorization rules.

I test with restricted users as well as an administrator. The UI may hide fields or disable buttons for convenience, but a client can still call the backend directly. I inspect error details too: a rejection must not return another company's sensitive data. These checks make the actual security boundary visible.

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

**Short answer:** I use separate consumers to reproduce conflicting changes. One saves first, then the other tries to save an older version. I check the expected ETag and lock behavior. I also trigger a failure and inspect whether unintended partial data remains. Remote calls need separate retry and recovery tests, because rolling back the local database cannot undo every external effect.

**Reasoning and example:** Two clients read the same document version. Client A changes and saves it. Client B then sends a change with its older ETag, and the service should reject it where that concurrency check applies. I inspect both the response and stored document, rather than assume an error message guarantees the state stayed correct.

For rollback, I fail a child operation inside the intended atomic group and check the related records. A separate scenario makes a remote call time out after the remote system may have acted. That case needs reconciliation or safe retry logic; a local rollback alone cannot tell me whether the remote work happened.

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

**Short answer:** A useful handoff says what must be moved, configured and checked in the target system. I include object dependencies, roles, service setup and required communication settings. I record the source revision, target version, checks actually run and checks still pending. I also explain recovery if deployment fails. A successful transport import is only one part of making the application usable.

**Reasoning and example:** For a RAP service, I check that the data model, behavior, DCL, metadata and service dependencies arrive together. If a UI is involved, its deployment and roles must also be ready. A missing authorization or endpoint setup can leave a technically imported application unusable. I list these steps with an owner and expected result.

After import, the team should open the real endpoint with a representative user and run the agreed business flow. Local publication in the development system does not prove publication or configuration elsewhere. The handoff identifies the tested revision and a recovery approach, so support can tell what changed and what to do if the rollout is incomplete.

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

**Short answer:** I collect the exact symptom, affected users, time, inputs and deployed revision. Then I use authorized logs, dumps and traces to narrow down the cause. I reproduce safely and test a focused fix against the failing case. I separate code problems from configuration and data problems. Until evidence confirms the cause, I describe my explanation as a hypothesis.

**Reasoning and example:** A user reports occasional duplicate documents. I compare request identifiers, retries, timeouts and commit points to see whether the same operation was executed twice. A UI delay might hide the symptom without fixing a retry after a network failure. I avoid exposing sensitive payloads while collecting enough evidence to follow the request.

Once the sequence is understood, I add a regression case that reproduces it and verify the expected outcome after the change. I also check the ordinary success path and any duplicate-recovery behavior. The rollout record should distinguish confirmed findings from open questions, so the next person does not treat an attractive but untested explanation as the root cause.

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

**Short answer:** I say exactly what I checked and what I did not run. Prepared test cases are not passing test results. I name the source revision, environment and observed outcome for actual runs. If I only reviewed local files, I say that clearly and list the SAP checks still needed. This makes the handoff useful and avoids giving false confidence.

**Reasoning and example:** An honest handoff might say: I reviewed revision [revision] and prepared EML cases for valid submission, missing data and rejected authorization. I have not run them in SAP yet. Activation, ABAP Unit and ATC must still be executed in [target system]. The placeholders must be replaced with the real revision and environment.

If local JSON or frontend checks passed, I list those as their own results. They can prove file structure or browser behavior, but they cannot prove SAP activation or a real RAP save. I include the exact next action and expected result so another developer can finish validation without guessing which evidence is still missing.

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
