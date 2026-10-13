# Senior RAP testing, performance and production

Defend the evidence behind a cloud service: observable behavior, failure recovery, real consumer security, measured performance and reliable delivery. All scenarios are hypothetical; no SAP execution is implied.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## OPS-01 How would you test a Submit action without replacing the business object you are supposed to verify?

**Level:** Senior

**Short answer:** I run the real Submit action and keep the business rules I want to test. I replace only outside dependencies, such as another service or business object, with suitable test doubles. Then I call the action, often through EML, and check its results, errors and saved state. Mocking Submit itself would not test Submit.

**Reasoning and example:** A purchase request may be submitted only when every item has an account assignment. I create one valid request and another with an assignment missing. Both tests execute the real Submit implementation. I check that the valid request reaches the intended state and that the invalid one is rejected with the correct message.

If a different business object supplies a spending limit, I can replace that dependency with a supported double and choose its returned limit. That keeps this test focused on Submit. I also verify the saved outcome through the test framework's supported save boundary. A predefined successful response from a fake Submit would prove none of these rules.

**Avoid this mistake:** Do not label a test of a mocked Submit response as a test of Submit.

**Interviewer follow-ups:**

- Which real business rule must this test execute?
- Which outside dependency can be replaced without replacing that rule?

**Strong answer criteria:**

- Names the real behavior being tested
- Replaces only outside dependencies
- Checks the result, errors and saved state

**Verification evidence:** Show the dependencies and a test that fails when the real Submit check is deliberately broken.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

<details>
<summary>Visual: Real behavior under test and dependency doubles</summary>

![Real behavior under test and dependency doubles](../visuals/senior-real-cut-evidence.svg)

Two deliberately different inputs exercise the real Submit rule while a separate limit-provider dependency is controlled. Assertions inspect state and response identity, not only execution coverage.

**Explain it:** If the account-assignment rejection is removed, which test fails? What evidence remains missing after these tests pass?

**Limit:** The fixture is conceptual and not an executed ABAP Unit result. Framework double support and persistence setup depend on the target release and test boundary.

</details>

## OPS-02 When would SQL doubles, CDS doubles and RAP BO doubles give misleading confidence?

**Level:** Senior

**Short answer:** Test doubles replace particular dependencies; they do not prove the whole application works. SQL doubles help isolate database access, CDS doubles help test CDS logic, and RAP BO doubles can replace another object's EML behavior. I choose the double for the rule being tested. Real persistence, permissions and service behavior still need suitable integration checks.

**Reasoning and example:** A pricing calculation reads a table. A SQL double can supply controlled prices so the test checks the calculation without depending on production data. That test does not prove an external action is still compatible. Likewise, a fake EML error response can test how a consumer handles failure, but it does not test the provider that would produce the real error.

I state what each test actually executes and replaces. A generic BO buffer double does not run arbitrary custom provider logic, and access-control behavior needs explicit checks. Focused integration tests then cover the real save, authorization and service path. A more advanced-looking double does not automatically supply stronger evidence.

**Avoid this mistake:** A more sophisticated double does not automatically provide broader integration evidence.

**Interviewer follow-ups:**

- Which behavior is replaced by the double?
- Which important behavior still needs a real integration test?

**Strong answer criteria:**

- Chooses doubles for the dependency being replaced
- Explains what the test does not execute
- Checks the real integration separately

**Verification evidence:** Record what each test covers, then verify one relevant path through the real provider and service.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.
- [SAP transactional buffer double support](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/transactional-buffer-double-support) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

<details>
<summary>Visual: Real behavior under test and dependency doubles</summary>

![Real behavior under test and dependency doubles](../visuals/senior-real-cut-evidence.svg)

Two deliberately different inputs exercise the real Submit rule while a separate limit-provider dependency is controlled. Assertions inspect state and response identity, not only execution coverage.

**Explain it:** If the account-assignment rejection is removed, which test fails? What evidence remains missing after these tests pass?

**Limit:** The fixture is conceptual and not an executed ABAP Unit result. Framework double support and persistence setup depend on the target release and test boundary.

</details>

## OPS-03 A bulk EML action processes ten requests and rejects two. What should its test assert?

**Level:** Senior

**Short answer:** I check which specific requests succeeded or failed, using their identities rather than row positions. I verify FAILED entries, message targets and the resulting data. I also test whether the chosen operation should allow partial success or require everything to succeed together. A successful interaction is not enough if saving later rejects the change.

**Reasoning and example:** I send ten requests with deliberately nonsequential keys. Two have different invalid values. The test checks that exactly those identities appear as failed, that each message points to the right request and that valid requests receive the intended treatment. Reordering inputs helps reveal code that accidentally matches results by row number.

Next, I test a failure during save after the interaction step appeared successful. The consumer must not report that object as permanently completed. I inspect buffered and saved state according to the supported test boundary. The expected all-or-nothing or partial-result rule must be defined first; counting ten messages cannot tell me whether ten operations were handled correctly.

**Avoid this mistake:** Ten messages do not prove ten correct results. Match outcomes to the actual request identities.

**Interviewer follow-ups:**

- Must all requests succeed together, or is partial success allowed here?
- How will the test detect a failure that happens only during save?

**Strong answer criteria:**

- Matches every result to its input identity
- Checks interaction results and saved data separately
- Tests the intended all-or-nothing or partial-success rule

**Verification evidence:** Show which requests should succeed or fail, where their messages point and which rows remain after each failure case.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: FAILED, REPORTED, and MAPPED in a worked create</summary>

![FAILED, REPORTED, and MAPPED in a worked create](../visuals/senior-response-channels.svg)

Three input identities produce separate rejection, message, and key-correlation information. A message on C3 does not itself reject that input, and assigned keys do not prove durable persistence.

**Explain it:** What must the consumer inspect after this interaction, and what happens if the later save fails?

**Limit:** Conceptual response contents, not executable EML. Available fields and correlation depend on the operation and BO; save and atomicity semantics must be tested separately.

</details>

<details>
<summary>Visual: Real behavior under test and dependency doubles</summary>

![Real behavior under test and dependency doubles](../visuals/senior-real-cut-evidence.svg)

Two deliberately different inputs exercise the real Submit rule while a separate limit-provider dependency is controlled. Assertions inspect state and response identity, not only execution coverage.

**Explain it:** If the account-assignment rejection is removed, which test fails? What evidence remains missing after these tests pass?

**Limit:** The fixture is conceptual and not an executed ABAP Unit result. Framework double support and persistence setup depend on the target release and test boundary.

</details>

## OPS-04 A draft test passes when run alone but fails after another test. What would you inspect?

**Level:** Senior

**Short answer:** I look for state left behind by the earlier test. That can include draft or active data, transaction buffers, locks and configured test-double responses. Each test should set up its own state and clean up through supported test mechanisms. I do not add random commits to hide the problem, because that can change what the test proves.

**Reasoning and example:** Two tests use request 4711. The first leaves a draft or a configured double response behind, while the second assumes a clean active request. Running the second alone works; running the pair fails. I run them in the opposite order and inspect setup and teardown to find the shared state.

Distinct fixture keys can help confirm the cause, but the final fix should still manage the test environment correctly. I check active and draft identities separately, release supported resources and reset doubles as required. A fixture for an active instance is not automatically a valid draft fixture. An order-dependent pass is weak evidence of correct draft behavior.

**Avoid this mistake:** A test that depends on execution order is unreliable evidence for draft behavior.

**Interviewer follow-ups:**

- Are active and draft transactional keys distinct?
- Which setup/teardown resource is shared?

**Strong answer criteria:**

- Distinguishes active and draft identities
- Resets the test resources correctly
- Proves tests do not depend on their order

**Verification evidence:** Run the tests separately, in both orders and in the suite. Keep results showing they behave consistently.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Draft lifecycle</summary>

![Draft lifecycle](../visuals/draft-lifecycle.svg)

Follow edit, activate and discard for an existing active object, then explain how a new-object draft differs.

**Explain it:** What remains after discarding an edit draft? What if activation fails?

**Limit:** Schematic state transitions; draft actions and supported flows depend on the BO and consumer.

</details>

<details>
<summary>Visual: Three storage lifetimes: an illustrated analogy</summary>

![Three storage lifetimes: an illustrated analogy](../visuals/draft-storage-illustration.png)

The desk represents the current transactional buffer; the draft cabinet represents persistent work across requests; the shared archive represents saved active data.

**Explain it:** Which of the three can survive several HTTP requests without becoming active business data?

**Limit:** An analogy, not literal SAP storage architecture or a mandatory three-stage pipeline. A new draft may have no active instance. Active business records may still be updated.

</details>

## OPS-05 How do you prove optimistic concurrency rather than merely calling the same update twice?

**Level:** Senior

**Short answer:** I use two independent clients that read the same version before either saves. The first update should succeed; the second should be rejected when it sends the old ETag. I check that the first user's data remains intact. Draft locks and the draft total ETag need separate tests because they protect different parts of the editing flow.

**Reasoning and example:** Alice and Ben both read one entity instance and keep its ETag. Alice changes it and saves. Ben then updates that same instance with his old token. The expected result is a stale-version rejection, not an overwrite. If Ben rereads first, he gets the new token and the test no longer exercises a stale writer.

For draft, I separately test editing while an exclusive lock is valid and resuming after it expires. A child-only change to active data should be considered by the configured draft total ETag check. That is different from the entity-level If-Match test. Two updates inside one shared transaction do not reproduce two users with independent versions.

**Avoid this mistake:** Two updates in one shared transaction are not a realistic two-user concurrency test.

**Interviewer follow-ups:**

- Which token protects this entity update?
- What separate case should the draft total ETag test cover?

**Strong answer criteria:**

- Uses independent clients or sessions
- Sends an intentionally old version token
- Checks that rejected updates leave data intact

**Verification evidence:** Record each client version, request, response and final value from the controlled two-user test.

**Read and verify this answer:**

- [SAP total ETag and draft concurrency](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f5e8548c241b43ab82bceec030b5dc9a.html) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Two ETag boundaries</summary>

![Two ETag boundaries](../visuals/rap-two-etag-boundaries.svg)

The left side tests a conditional entity update; the right tests the active-state basis of a resumed draft.

**Explain it:** Why does testing one entity ETag not prove the draft total-ETag implementation?

**Limit:** ETags are opaque. Verify lock expiry, relevant child changes and generated behavior on the actual system.

</details>

<details>
<summary>Visual: Two editors and one version: an illustrated story</summary>

![Two editors and one version: an illustrated story](../visuals/etag-story-illustration.png)

Alice and Ben read version 7. Alice updates successfully, producing version 8. Ben must not overwrite that newer state using the stale version 7 precondition.

**Explain it:** Why should the client refresh and resolve the conflict instead of blindly retrying its old payload?

**Limit:** Version numbers are illustrative. Real ETags are opaque validators; a failed If-Match precondition commonly returns HTTP 412. This is optimistic concurrency, not a pessimistic lock.

</details>

## OPS-06 Fiori still displays an old total after a successful action. How do you separate UI refresh from backend correctness?

**Level:** Senior

**Short answer:** I first read the business object again to see whether the server saved the right value. If the value is wrong there, I investigate the backend calculation. If it is right, I check what the UI refreshes after the action. The action result, side effects and deployed metadata must tell the client what changed.

**Reasoning and example:** An item quantity changes and the server recalculates the order total, but the original Fiori screen still shows the old amount. I compare a direct read, a new UI session and the original session's network requests. If both fresh reads show the correct total, the likely problem is that the original screen did not request the changed field.

I inspect the supported side-effect declaration and action result, then test a targeted refresh with the actual deployed metadata. I do not add a second total calculation in the browser to hide a backend problem. Another commit or a full-page reload may mask the symptom without fixing the missing refresh behavior.

**Avoid this mistake:** A page reload workaround does not explain whether the backend or refresh contract was defective.

**Interviewer follow-ups:**

- What does a fresh service read return?
- Which request should refresh the affected property?

**Strong answer criteria:**

- Checks the value actually held by the backend
- Inspects metadata and network requests
- Keeps the business calculation on the server

**Verification evidence:** Record the action and later reads, showing values before and after in the actual app.

**Read and verify this answer:**

- [SAP RAP side effects](https://help.sap.com/docs/abap-cloud/abap-rap/side-effects) - Check which field or action triggers a refresh, what gets refreshed and whether the actual UI supports it.

<details>
<summary>Visual: Side effects and stale UI diagnosis</summary>

![Side effects and stale UI diagnosis](../visuals/rap-side-effect-diagnosis.svg)

Use the observed backend value to choose the next debugging branch.

**Explain it:** What request proves that the consumer refreshed the calculated total?

**Limit:** Consumer and metadata support are release-dependent; a valid backend side effect is not proof that every client processes it.

</details>

## OPS-07 A RAP list becomes slow after enabling count and expanding children. What do you measure first?

**Level:** Senior

**Short answer:** I measure where the request spends its time: selecting rows, counting, loading children or doing extra ABAP and remote work. I use representative data and the affected user's permissions. Then I change the largest proven cost and repeat the same test. I preserve filtering, count correctness and access checks while reducing unnecessary work.

**Reasoning and example:** A page shows only 20 orders, but its count scans millions of allowed records and its expansion loads many child items. I compare a page-only request, a request with count and one with expansion. Traces show database time, application time, rows and any remote calls, so I can see which addition causes the delay.

I repeat the measurement with a restricted user because authorization filtering can change the database work. If expansion is the issue, the consumer may not need every child on the first screen. If count dominates, changing a small handler calculation will do little. I compare before and after using the same parameters and volume.

**Avoid this mistake:** Do not optimize the shortest visible SELECT before finding the dominant request cost.

**Interviewer follow-ups:**

- Is count more expensive than the page?
- What changes for an authorization-restricted user?

**Strong answer criteria:**

- Measures the separate parts of the request
- Uses realistic data and user permissions
- Keeps correct results and access checks while improving speed

**Verification evidence:** Keep comparable before-and-after traces showing total time, rows and calls.

**Read and verify this answer:**

- [SAP SQL analysis in ADT](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/analyzing-sql-statements) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

<details>
<summary>Visual: Secure custom-query filtering, count, and page</summary>

![Secure custom-query filtering, count, and page](../visuals/senior-query-secure-pipeline.svg)

The same authorized logical set contains IDs 2, 4, and 6. Counting it returns three; skipping one and taking two returns IDs 4 and 6 without revealing hidden B rows.

**Explain it:** What should a count-only request return, and what should happen if the filter cannot be represented safely?

**Limit:** The drawing specifies semantics, not a mandatory physical execution plan. A remote/custom provider must preserve equivalent authorization, filtering, count, and ordering behavior.

</details>

## OPS-08 A custom entity calls a remote API once for every returned row. How would you remove the N+1 pattern?

**Level:** Senior

**Short answer:** I look for a supported bulk request instead of one remote call per row. I fetch only the references needed for the current result and limit request size. A cache is an option only with clear freshness and access rules. I still handle missing results, throttling and partial failures rather than hide them behind a faster response.

**Reasoning and example:** A page reads 50 orders and then calls a remote service once for each supplier. Together with the original read, that is 51 calls. A supported bulk endpoint may fetch the needed supplier references in one request. I remove duplicate keys and keep the batch within the service's limits instead of downloading every supplier.

The bulk response may still contain missing references or individual errors. I test those cases and rate limits, not just the reduced call count. If caching is needed, I define how long values remain valid and which user or tenant may reuse them. A shared cache must not expose one customer's data to another.

**Avoid this mistake:** An unbounded cache can trade latency for stale or cross-user data leakage.

**Interviewer follow-ups:**

- What is the maximum request size?
- How are partial remote failures represented?

**Strong answer criteria:**

- Uses bulk requests with size limits
- Defines cache freshness and who may reuse data
- Handles missing results and rate limits

**Verification evidence:** Measure remote calls and transferred rows, including tests for missing data and rate limits.

**Read and verify this answer:**

- [SAP: Implementing an Unmanaged Query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-unmanaged-query) - Check the supported request options and target release. Test bulk reads and caching for correct results, access control and speed in your own scenario.

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## OPS-09 A service works in development but fails after transport. What evidence should the handoff have included?

**Level:** Senior

**Short answer:** A transport moves code, but the service may also need configuration, roles, communication setup and frontend deployment. I verify the active version and dependencies in the target system. The handoff should name these requirements and their owners. A working development preview or successful import does not prove that the real production user can use the service.

**Reasoning and example:** The RAP behavior activates after import, but an action fails because the destination or communication arrangement is missing. In another system, the endpoint exists but the intended user's role does not grant access. These are different failures from a defect in the business calculation, so I inspect the actual target setup before changing code.

The handoff should list the code and non-code prerequisites, installation order and a small end-to-end check. I verify the imported revision, service exposure, communication settings and consuming identity. Each item needs a responsible person and an observed result. Publishing a binding locally in development does not establish a usable production endpoint.

**Avoid this mistake:** A successful transport import does not prove that the service works for its real users.

**Interviewer follow-ups:**

- Which required items are configuration rather than source?
- Who verifies the real consuming identity?

**Strong answer criteria:**

- Lists code and required configuration separately
- Checks the version and setup in the target
- Names who owns each operating requirement

**Verification evidence:** Record actual endpoint, role, communication and service-test results in the target readiness checklist.

**Read and verify this answer:**

- [SAP RAP service binding](https://help.sap.com/docs/abap-cloud/abap-rap/service-binding) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## OPS-10 How would you evolve a released RAP service when an action needs a new mandatory input?

**Level:** Senior

**Short answer:** A new required parameter can break every existing caller that does not send it. I check whether a valid optional value or default can preserve old behavior. If not, I plan a new operation or version and a controlled migration. The change must meet the real business rule while giving consumers an explicit path to update.

**Reasoning and example:** An approval action now needs a legal justification. Old clients have no field for it. Supplying an empty default would keep calls running but might violate the new requirement, so technical compatibility alone is not enough. I agree a supported transition that respects when the new business rule must take effect.

That may involve a successor action, an announced retirement date and updates to both UI and integration clients. I test generated clients, metadata-driven screens and direct API consumers separately. I track actual use of the old operation before retiring it where the policy permits a transition. Successful server activation does not prove that existing requests still work.

**Avoid this mistake:** A changed action can activate successfully while still breaking existing callers.

**Interviewer follow-ups:**

- Is a default legally/business valid?
- How do you know which consumers still use the old contract?

**Strong answer criteria:**

- Explains why old callers may break
- Plans a clear migration
- Tests existing consumers

**Verification evidence:** Run old and new client tests, and track use of the old operation before retiring it.

**Read and verify this answer:**

- [SAP RAP service binding](https://help.sap.com/docs/abap-cloud/abap-rap/service-binding) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## OPS-11 A remote approval succeeded, but the RAP caller timed out. How should an operator recover?

**Level:** Senior

**Short answer:** A timeout leaves the result unknown until I check it. I use the request's stable reference to find the remote approval before submitting again. If it exists, recovery should reuse that result. If it cannot be determined, the case needs a visible status and an owner. Local rollback cannot erase an approval already committed remotely.

**Reasoning and example:** The remote workflow creates approval 9001, but its response never reaches the RAP caller. A new creation request could start approval 9002 for the same submission. I query by the original reference or use the service's documented idempotency rule so a retry returns or reuses the first result. The local app records the resolved workflow link.

If the remote outcome cannot be queried, I keep a durable recovery record and use the agreed operator or compensation procedure. I also test a late duplicate callback and a callback for a request version that has since changed. A delayed response must not approve stale local data or repeat an already completed decision.

**Avoid this mistake:** A timeout is not evidence that the other system performed no work.

**Interviewer follow-ups:**

- Which stable reference identifies the original request?
- Who investigates when the remote outcome cannot be queried?

**Strong answer criteria:**

- Distinguishes unknown from failed
- Finds the original result before unsafe retry
- Handles duplicate and outdated callbacks

**Verification evidence:** Simulate a lost response. Verify one intended business effect and a visible status from which recovery is possible.

**Read and verify this answer:**

- [SAP RAP business-object contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

<details>
<summary>Visual: Remote commit and uncertain local outcome</summary>

![Remote commit and uncertain local outcome](../visuals/senior-remote-uncertainty.svg)

The local application durably records intent before separately owned delivery. The remote payment commits, but its reply is lost; recovery must identify the existing effect through REQ-42.

**Explain it:** How do you distinguish an unprocessed request from a committed payment whose response never arrived?

**Limit:** The delivery and idempotency mechanisms are design requirements, not automatic guarantees from HTTP or RAP. This example does not claim distributed atomicity.

</details>

## OPS-12 A failed save leaves no business record, but support still needs diagnostics. How would you log it safely?

**Level:** Senior

**Short answer:** I separate business audit records from technical diagnostics and user messages. A log written inside a rolled-back transaction may disappear too. I use supported monitoring for diagnostics that must survive, rather than add a commit inside RAP behavior code. Logs should identify the failed request without exposing secrets or claiming that a rejected business change succeeded.

**Reasoning and example:** An order fails validation. FAILED identifies the rejection and REPORTED supplies the relevant message, but no order is saved. Support still needs to connect that user error to the failed request. I use the available service or application monitoring facilities with their documented save and privacy behavior for that diagnostic purpose.

A business audit entry saying 'order submitted' has a different meaning and should accompany a successful business transition, not survive a rejected submission as a false fact. I test success and rollback and inspect which records remain. Adding COMMIT WORK in a handler just to keep a log would break RAP's ownership of transaction completion.

**Avoid this mistake:** Do not add COMMIT WORK inside a handler just to preserve a log entry.

**Interviewer follow-ups:**

- Should this record remain after rollback?
- Does it describe a technical failure or a completed business event?

**Strong answer criteria:**

- Separates business audit from technical diagnostics
- Lets RAP control transaction completion
- Keeps sensitive values out of logs

**Verification evidence:** Test success and rollback, then inspect which supported messages and logs remain.

**Read and verify this answer:**

- [SAP RAP business-object contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

## OPS-13 A production incident starts after a release. How do you contain it without making the data worse?

**Level:** Senior

**Short answer:** I first limit the harmful processing through authorized operational controls and preserve the evidence. Then I identify the affected records and what has already committed. I choose a code fix, rollback or replay only after understanding those effects. Reverting code does not reverse business data, and replaying a backlog can repeat the damage.

**Reasoning and example:** A new Submit implementation starts duplicate remote approvals. I stop the affected scheduled initiation through the authorized control and record the release, request references and time window. Then I compare local requests with the remote approvals to find what was already created. Simply deploying the old code would not remove those duplicates.

After fixing duplicate handling, I test recovery on a controlled sample and reconcile existing approvals using supported business procedures. Only then do I resume the backlog, watching error counts and the rate of processing. The recovery plan needs a clear condition for resuming and an owner for unresolved records. Replaying everything before the fix could create even more approvals.

**Avoid this mistake:** Do not rerun the whole backlog while the duplicate-creation defect remains active.

**Interviewer follow-ups:**

- Which business changes have already been saved?
- What result proves processing can safely resume?

**Strong answer criteria:**

- Stops harmful work before replaying it
- Repairs code and business data separately
- Defines when processing can safely resume

**Verification evidence:** Keep an incident timeline, a list of checked affected records and the result of a controlled replay after the fix.

**Read and verify this answer:**

- [SAP RAP business-object contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

## OPS-14 What belongs in a RAP release gate beyond a passing ATC run?

**Level:** Senior

**Short answer:** ATC is one check, not proof that the feature works. I also test the business rules, failures, permissions and integrations affected by the change. Changes involving saves or concurrency need matching rollback and conflict tests. I record the version and environment for each result, and clearly mark anything not run rather than count it as passed.

**Reasoning and example:** A release changes an action parameter and publishes a new approval event. I test existing callers against the new action, verify the event after a successful save and check duplicate delivery. I also test a user who must not submit. These checks address the risks of this change; they are more useful than repeating an unrelated checklist.

For a label-only adjustment, the required evidence would be much smaller. For this release, I also verify relevant performance, dependency compatibility and target configuration. ATC can find issues covered by its configured checks, but it cannot prove every business rule or external connection. The release record should show executed results, pending checks and their owners.

**Avoid this mistake:** Choose tests for the failure risks this change creates; a generic checklist alone is not enough.

**Interviewer follow-ups:**

- Which new failure mode did this change introduce?
- Which result is pending rather than passed?

**Strong answer criteria:**

- Chooses checks for the risks of this change
- Separates source checks from runtime tests
- Records tested versions and pending checks

**Verification evidence:** Link each changed behavior to actual test results, responsible people and remaining risks.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.
- [SAP RAP feature and release overview](https://help.sap.com/docs/abap-cloud/abap-rap/what-s-new) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## OPS-15 A team advertises 95% coverage while never asserting FAILED or persisted state. How would you improve it?

**Level:** Senior

**Short answer:** Coverage tells me which statements ran, not whether the results were correct. I add checks that fail when an important business rule is broken. For RAP, that can include rejected identities, messages, saved state and unwanted side effects. I then use coverage to find remaining gaps instead of adding meaningless code or repeating happy-path calls.

**Reasoning and example:** A test executes a validation for a missing account assignment and reports high coverage. However, it never checks FAILED, the message target or whether the invalid request can be saved. If I temporarily remove the rejection and the test still passes, it does not prove the validation works. I strengthen those assertions and restore the implementation.

I apply the same idea to successful processing: the test must check the expected state and absence of unintended changes. Coverage remains useful for locating paths we never executed, but the percentage is not the acceptance criterion by itself. A smaller set of failure-sensitive tests can provide stronger evidence than many calls without meaningful checks.

**Avoid this mistake:** High statement coverage can still miss a broken business rule.

**Interviewer follow-ups:**

- Would the test fail if the business check were removed?
- Which business rule matters more than increasing the coverage percentage?

**Strong answer criteria:**

- Checks meaningful outcomes
- Uses tests that fail when the rule is broken
- Does not treat coverage as proof of correctness

**Verification evidence:** Demonstrate a test failing when rejection or saving is deliberately broken, then restore the code.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.
- [SAP transactional buffer double support](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/transactional-buffer-double-support) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

<details>
<summary>Visual: Real behavior under test and dependency doubles</summary>

![Real behavior under test and dependency doubles](../visuals/senior-real-cut-evidence.svg)

Two deliberately different inputs exercise the real Submit rule while a separate limit-provider dependency is controlled. Assertions inspect state and response identity, not only execution coverage.

**Explain it:** If the account-assignment rejection is removed, which test fails? What evidence remains missing after these tests pass?

**Limit:** The fixture is conceptual and not an executed ABAP Unit result. Framework double support and persistence setup depend on the target release and test boundary.

</details>

## OPS-16 How would you prepare an extension for a platform upgrade?

**Level:** Senior

**Short answer:** I list the APIs and extension points the application actually uses, then check what changes in the target release. I prioritize important business flows and known exceptions. Tests run against a representative target system and include affected consumers, permissions and behavior. Released APIs reduce some upgrade risk, but they do not remove the need to test our application.

**Reasoning and example:** An extension calls a classic dependency through a wrapper and also exposes a released service to another system. I give each dependency an owner and check its target-release status, including any deprecation or successor. A wrapper does not make an underlying upgrade risk disappear. Existing external clients need testing against the upgraded service too.

I then run focused regression tests for the affected metadata, draft behavior, authorization, performance and configuration. If an API must be replaced, the plan includes moving consumers before retiring the old path. Last year's ATC result is not evidence for this year's target release. I retain the tested versions and actual results for the important flows.

**Avoid this mistake:** Do not treat last year's clean ATC report as evidence for the new target release.

**Interviewer follow-ups:**

- Which dependencies create the biggest upgrade risk?
- Does the application assume behavior the API documentation does not promise?

**Strong answer criteria:**

- Lists actual API and extension dependencies
- Tests risks for the target release
- Assigns owners for exceptions and deprecated APIs

**Verification evidence:** Record target versions, dependency classifications and regression results for the most important flows.

**Read and verify this answer:**

- [SAP RAP feature and release overview](https://help.sap.com/docs/abap-cloud/abap-rap/what-s-new) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## OPS-17 A cloud job processes 500,000 records and times out. How would you redesign it?

**Level:** Senior

**Short answer:** I split the work into limited-size packages that can restart safely. Each package has stable record IDs, a clear commit boundary and recorded progress. I use background or application-job features supported by the target system and limit parallel work. Recovery checks what actually completed, including changes that may have saved just before the job failed.

**Reasoning and example:** A pricing job finishes 20 packages and crashes during the next. On restart, it should not blindly repeat the completed work. I use recorded progress plus stable business references to distinguish completed, failed, pending and uncertain results. I also check whether a user edited a record after the original calculation so recovery does not overwrite newer data.

A critical test crashes between the business update and checkpoint handling. The design must detect the existing effect or repeat it safely; a checkpoint alone may not prove exactly-once execution. I tune package size and concurrency against database locks and remote limits. Moving one huge loop into a background job does not solve its restart problem.

Moving a job to background avoids a dialog waiting limit; it does not make an unbounded selection or retained internal table use less memory. Reduce the selected population and retained data, or design bounded, restartable processing. See SQL-17 for package lifetime and memory checks.

**Avoid this mistake:** Moving a huge synchronous loop into a background job does not solve its transaction or restart design.

**Interviewer follow-ups:**

- What is one package that can recover independently?
- How does recovery avoid overwriting newer user changes?

**Strong answer criteria:**

- Limits package size and competing work
- Defines how to find completed work after a crash
- Uses supported cloud job features

**Verification evidence:** Simulate a failure inside a package, then verify restart, resource limits and final business totals.

**Read and verify this answer:**

- [SAP application job catalog and template](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-job-catalog-entry-and-job-template-in-adt) - Check how supported jobs run, then split the work into limited-size packages with clear restart points.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## OPS-18 How would you communicate senior readiness when you can review code locally but cannot run SAP checks?

**Level:** Senior

**Short answer:** I say clearly what I reviewed, what I prepared and what I actually ran. Local review can find defects and produce useful tests, but it cannot prove SAP activation or real runtime behavior. I provide exact target-system steps and expected results. Missing evidence stays pending; I do not replace it with a guessed pass or unrelated performance number.

**Reasoning and example:** For a RAP approval change, I can review the source and prepare tests for a valid submission, a denied user and a rejected save. I can also provide a two-session concurrency scenario and a service smoke test. The handoff states which source revision to transfer, which roles are needed and what each result should show.

The person with target access then runs syntax and activation checks, ATC and the relevant tests, returning logs tied to that revision and environment. Until then, prepared test code is not an executed result. A UI running against mocks also does not prove integration with RAP. Clear limits make the evidence more useful, not less credible.

**Avoid this mistake:** Do not present prepared test code or a mocked UI as successful SAP integration.

**Interviewer follow-ups:**

- Which claim can you prove now?
- What exact target result would close the remaining risk?

**Strong answer criteria:**

- Clearly separates prepared and executed work
- Provides runnable steps and expected results
- Links results to the source revision and environment

**Verification evidence:** List prepared, executed and pending checks, with expected outcomes and the person responsible for each.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the documented framework rules to design these checks. These examples are proposed tests, not claimed SAP runtime results.

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

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools)
- [SAP transactional buffer double support](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/transactional-buffer-double-support)
- [SAP CDS access-control testing](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-visual-studio-code/writing-test-for-cds-entity-with-access-control)
- [SAP SQL analysis in ADT](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/analyzing-sql-statements)
- [SAP RAP service binding](https://help.sap.com/docs/abap-cloud/abap-rap/service-binding)
- [SAP RAP feature and release overview](https://help.sap.com/docs/abap-cloud/abap-rap/what-s-new)
- [SAP RAP business-object contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract)
- [SAP total ETag and draft concurrency](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f5e8548c241b43ab82bceec030b5dc9a.html)
- [SAP RAP side effects](https://help.sap.com/docs/abap-cloud/abap-rap/side-effects)
- [SAP application job catalog and template](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-job-catalog-entry-and-job-template-in-adt)
