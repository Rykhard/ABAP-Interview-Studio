# ABAP Cloud: senior RAP transactions and behavior design

The main interview track: explain a decision, trace its failure paths, and name the evidence that would prove it. These original scenarios extend the supplied RAP notes beyond terminology. They are practice scenarios, not a measured ranking of interview frequency. The target product, ABAP release, language version, BO implementation type and consumer are intentionally unspecified: establish them before promising syntax or runtime support. Read each short answer aloud, then defend it against both follow-up probes.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## SRAP-01 A new approval app has custom persistence, while its posting step must reuse an existing transactional API. Which RAP implementation type would you choose?

**Level:** Senior

**Short answer:** I would separate approval persistence from the posting boundary before selecting an implementation type. Managed RAP is my starting point for new custom tables. Managed with unmanaged save fits when RAP can own interaction buffering but an eligible API must own persistence. Fully unmanaged is justified when interaction behavior itself must adapt an existing transactional model. I would inspect the API's buffering, numbering, locks, authorizations and commit behavior; the label BAPI alone does not establish compatibility.

**Example and follow-up:** The decision record would compare one normal request and one failing request through each boundary. If posting is remote, a local managed BO plus asynchronous orchestration may be more honest than claiming one atomic save. Additional save extends managed persistence; it is not a replacement for the persistence owner.

**Avoid this mistake:** Choosing unmanaged merely because the application is complex, or assuming managed with unmanaged save removes RAP transaction rules.

**Interviewer follow-ups:**

- What concrete API property would rule out a synchronous RAP adapter?
- Which implementation responsibilities would your choice leave with the framework?

**Strong answer criteria:**

- Chooses from persistence and interaction ownership
- Inspects the actual API rather than its name
- Separates remote orchestration from local atomicity

**Verification evidence:** Prepare a decision table and trace a create, failed update and rollback against the selected API on the target release.

**Read and verify this answer:**

- [SAP: Save options](https://help.sap.com/docs/btp/fc4c71aa50014fd1b43721701471913d/11e2c9d9a2c8420f88d1cf2d6c015c2b.html?version=202310.002) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

<details>
<summary>Visual: RAP implementation ownership matrix</summary>

![RAP implementation ownership matrix](../visuals/rap-save-ownership-matrix.svg)

Trace the same request through three implementation choices and name the owner of each responsibility.

**Explain it:** Which part stays managed when only the save implementation is replaced?

**Limit:** Conceptual comparison; specific saver variants and failure support depend on release and scenario.

</details>

## SRAP-02 An audit record must be saved with every managed order change. Should you use a determination, additional save, or unmanaged save?

**Level:** Senior

**Short answer:** I would clarify whether this is a transactional business audit or operational logging. For a business audit that must accompany managed persistence, additional save is a candidate: managed save remains responsible for the order while the supported save extension records the audit without committing independently. I would not replace persistence with unmanaged save just for logging. A determination derives BO state; it should not emit a durable saved-change record while the transaction can still be rejected.

**Example and follow-up:** Audit design needs actor, operation, relevant values and a correlation key. Changed-field input may differ from a full before-and-after image; verify the save contract and any supported full-data option rather than assuming every field is supplied. Decide separately how technical failure diagnostics survive a business rollback.

**Avoid this mistake:** Writing the audit in another LUW and claiming it is guaranteed to match the order, or updating managed order tables directly from additional save.

**Interviewer follow-ups:**

- How do you obtain a trustworthy before-image?
- Should an audit failure reject the transaction, and in which phase can you detect predictable errors?

**Strong answer criteria:**

- Distinguishes business audit from diagnostics
- Preserves managed persistence and commit ownership
- Checks available change-image semantics

**Verification evidence:** Test successful create/update/delete and rejected save; compare order and audit persistence, including explicitly cleared fields.

**Read and verify this answer:**

- [SAP: Save options](https://help.sap.com/docs/btp/fc4c71aa50014fd1b43721701471913d/11e2c9d9a2c8420f88d1cf2d6c015c2b.html?version=202310.002) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

<details>
<summary>Visual: RAP implementation ownership matrix</summary>

![RAP implementation ownership matrix](../visuals/rap-save-ownership-matrix.svg)

Trace the same request through three implementation choices and name the owner of each responsibility.

**Explain it:** Which part stays managed when only the save implementation is replaced?

**Limit:** Conceptual comparison; specific saver variants and failure support depend on release and scenario.

</details>

<details>
<summary>Visual: Augmentation versus additional save</summary>

![Augmentation versus additional save](../visuals/rap-augmentation-additional-save.svg)

Locate the input transformation and persistence supplement on the same conceptual timeline.

**Explain it:** Why would writing an audit row not make augmentation the right save hook?

**Limit:** The arrow is conceptual; availability, supported fields and trigger details depend on the target RAP release.

</details>

## SRAP-03 A developer puts ordinary business validation in SAVE because the final data is available there. What would you change?

**Level:** Senior

**Short answer:** I would move predictable business rejection into the supported early checks, after required derivations and before the point of no return. The late save phase is designed to persist an already consistent transaction, not to provide routine interactive validation. A reported error alone is not a general rollback mechanism. I would also avoid the opposite absolute: SAP documents failure-capable saver support for specific BAPI integration scenarios, which must be verified against the actual release and saver contract.

**Example and follow-up:** For an invalid approval limit, reject before persistence and return a keyed business message. An unexpected database or infrastructure failure is a separate technical recovery case. A supported late-failure adapter must not be used to defer checks that can reasonably run earlier or to justify independently committed side effects.

**Avoid this mistake:** Saying either 'all errors can be returned from SAVE' or 'no supported late-save failure mechanism exists anywhere'.

**Interviewer follow-ups:**

- Where do final derivations belong relative to final consistency checks?
- What evidence would justify using a failure-capable saver here?

**Strong answer criteria:**

- Places predictable rejection before late save
- Separates business and technical failures
- Qualifies documented BAPI exceptions precisely

**Verification evidence:** Trace the save phases for invalid input and inspect the generated saver signature and SAP guidance for the installed release.

**Read and verify this answer:**

- [SAP: General RAP BO implementation contract](https://help.sap.com/docs/abap-cloud/abap-rap/general-rap-bo-implementation-contract) - Read the relevant operation/phase contract and verify target-release support.
- [SAP: BAPI consumption, late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US&state=PRODUCTION&version=sap_cross_product_abap) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## SRAP-04 One action updates two local RAP BOs and then calls a remote payment service. Can the whole action be atomic?

**Level:** Senior

**Short answer:** Two compatible local RAP BOs can participate in the same RAP-controlled SAP LUW, with the transaction owner controlling the final save. An ordinary remote HTTP call is outside that local atomic boundary. If payment succeeds and local save fails, rollback cannot undo the remote effect. I would model a durable pending state and reliable asynchronous delivery, or an explicit compensating process, and define retry, reconciliation and customer-visible status rather than promise distributed atomicity.

**Example and follow-up:** For two local BOs, verify cross-BO phase restrictions and consume supported behavior interfaces; do not commit each BO separately. For payment, store a stable business correlation key and record the remote outcome. A timeout is an unknown result until reconciliation establishes whether the remote operation actually completed.

**Avoid this mistake:** Assuming that calling HTTP inside an action enrolls the remote system in the SAP database transaction.

**Interviewer follow-ups:**

- What happens after a payment timeout followed by a retry?
- How would you recover after local commit succeeds but event delivery is delayed?

**Strong answer criteria:**

- Draws the local transaction boundary
- Models uncertain remote outcomes
- Designs idempotency and reconciliation

**Verification evidence:** Fault-inject before and after each local save and remote response boundary; verify that every persisted state has a documented recovery path.

**Read and verify this answer:**

- [SAP: General RAP BO implementation contract](https://help.sap.com/docs/abap-cloud/abap-rap/general-rap-bo-implementation-contract) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

<details>
<summary>Visual: Remote commit and uncertain local outcome</summary>

![Remote commit and uncertain local outcome](../visuals/senior-remote-uncertainty.svg)

The local application durably records intent before separately owned delivery. The remote payment commits, but its reply is lost; recovery must identify the existing effect through REQ-42.

**Explain it:** How do you distinguish an unprocessed request from a committed payment whose response never arrived?

**Limit:** The delivery and idempotency mechanisms are design requirements, not automatic guarantees from HTTP or RAP. This example does not claim distributed atomicity.

</details>

## SRAP-05 A bulk EML update contains 200 instances, including missing keys and unauthorized changes. How do you report and process the result?

**Level:** Senior

**Short answer:** I would process the full input set using the operation's derived types and preserve instance correlation. FAILED identifies rejected operations or instances; REPORTED carries associated messages and can also contain non-error information. MAPPED serves creation or key-correlation contracts, not a universal success list. I would collect responses from nested calls without losing earlier failures, avoid returning success for unprocessed rows, and distinguish interaction results from the subsequent save outcome and the consumer's atomicity policy.

**Example and follow-up:** I would bulk-read required transaction state and validate the applicable set instead of executing a database query per row. Mixed failures require a deliberate consumer decision: reject the logical request or proceed with eligible work where the contract permits. Count reconciliation must include missing, rejected and successfully handled inputs.

**Avoid this mistake:** Checking only the first input row, treating every REPORTED entry as failure, or declaring the operation committed after MODIFY ENTITIES.

**Interviewer follow-ups:**

- How would you associate a child error with its root request?
- What do you check again after the external consumer issues COMMIT ENTITIES?

**Strong answer criteria:**

- Handles all inputs and aggregates responses
- Separates response roles and transaction phases
- Avoids row-by-row dependency access

**Verification evidence:** Run a mixed-input EML test with multiple distinct failures; assert key/message correlation, processed counts and final database state.

**Read and verify this answer:**

- [SAP: Entity Manipulation Language](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: FAILED, REPORTED, and MAPPED in a worked create</summary>

![FAILED, REPORTED, and MAPPED in a worked create](../visuals/senior-response-channels.svg)

Three input identities produce separate rejection, message, and key-correlation information. A message on C3 does not itself reject that input, and assigned keys do not prove durable persistence.

**Explain it:** What must the consumer inspect after this interaction, and what happens if the later save fails?

**Limit:** Conceptual response contents, not executable EML. Available fields and correlation depend on the operation and BO; save and atomicity semantics must be tested separately.

</details>

## SRAP-06 An API consumer sends an empty comment to clear it, but the previous text remains. What do you investigate?

**Level:** Senior

**Short answer:** I would distinguish an explicitly supplied initial value from an omitted field. EML update intent is conveyed by the field list or the corresponding %control component; an initial value without update intent may correctly leave existing data unchanged. I would trace the incoming payload, protocol-to-EML conversion, adapter mapping and any determination that restores a default. Fixing this by marking every field as supplied risks clearing unrelated fields that the caller intentionally omitted.

**Example and follow-up:** A partial update with only Comment should preserve Amount and Currency. A legacy adapter may additionally require its own change indicators, mapped from RAP control information. The same distinction matters for zero, false and blank dates according to the field's domain and business rules, not just character strings.

**Avoid this mistake:** Using IS INITIAL to mean 'not provided' for every update field, or blindly setting all control flags on.

**Interviewer follow-ups:**

- How would you represent 'leave unchanged' versus 'set to zero'?
- Where can a defaulting determination accidentally undo the requested clear?

**Strong answer criteria:**

- Separates presence from value
- Preserves partial-update semantics
- Traces control mapping through adapters

**Verification evidence:** Test omitted Comment, explicit empty Comment and nonempty Comment while asserting that all untouched fields remain unchanged.

**Read and verify this answer:**

- [SAP: Entity Manipulation Language](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: EML update intent: absent versus clear</summary>

![EML update intent: absent versus clear](../visuals/senior-control-presence.svg)

The first two requests carry the same initial ABAP value but differ in update intent. The field control decides whether the old comment is preserved or explicitly cleared.

**Explain it:** How would you preserve Amount while clearing Comment, and how could an adapter lose that distinction?

**Limit:** This is a worked mapping example. Actual generated EML types, UPDATE FIELDS syntax, protocol nullability, and business validation remain authoritative.

</details>

## SRAP-07 You must create three new orders with items in one EML request before final order numbers exist. How do you correlate the tree?

**Level:** Senior

**Short answer:** I would give creates unique request content IDs and connect create-by-association input to its newly created parent using the supported %cid_ref correlation. Each child create also needs its own appropriate identity and response mapping. I would use the BDEF-derived types, retain draft and preliminary-key context, and read MAPPED by identifiers rather than by table position. Content IDs are request correlation values; they are not persisted business keys or reusable retry tokens.

**Example and follow-up:** Consider one invalid item under the second order while the first and third are valid. The error must identify the right child and parent regardless of input ordering. Later key assignment must preserve the original relationship, and the external consumer must decide the desired all-or-nothing behavior at its transaction boundary.

**Avoid this mistake:** Assigning a fake database key to a new parent, correlating by row index, or confusing %cid with %pid.

**Interviewer follow-ups:**

- What changes if the BO uses draft and late numbering?
- How do you correlate an error when the final parent key is still unavailable?

**Strong answer criteria:**

- Uses content-ID correlation for deep create
- Keeps transactional identity intact
- Tests mixed parent/child failures

**Verification evidence:** Execute a reordered multi-parent deep-create case with one failed child and verify associations, mappings and error paths before and after save.

**Read and verify this answer:**

- [SAP: Entity Manipulation Language](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: EML identity tags</summary>

![EML identity tags](../visuals/eml-identity-tags.svg)

Content IDs connect entries within a request. Transactional and preliminary identities address other lifecycle needs.

**Explain it:** How can a new item refer to a newly created order before the final order number exists?

**Limit:** Generated EML types and available components are authoritative for the specific BO.

</details>

<details>
<summary>Visual: FAILED, REPORTED, and MAPPED in a worked create</summary>

![FAILED, REPORTED, and MAPPED in a worked create](../visuals/senior-response-channels.svg)

Three input identities produce separate rejection, message, and key-correlation information. A message on C3 does not itself reject that input, and assigned keys do not prove durable persistence.

**Explain it:** What must the consumer inspect after this interaction, and what happens if the later save fails?

**Limit:** Conceptual response contents, not executable EML. Available fields and correlation depend on the operation and BO; save and atomicity semantics must be tested separately.

</details>

<details>
<summary>Visual: RAP identity and numbering timeline</summary>

![RAP identity and numbering timeline](../visuals/rap-numbering-timeline.svg)

Compare when the identity becomes final and when persistence is confirmed.

**Explain it:** What must an external EML consumer inspect after MODIFY and after COMMIT?

**Limit:** Illustrative numbering paths; exact %pid/%pre mapping and conversion syntax are release/scenario-specific.

</details>

## SRAP-08 A posting API returns the final document number only when called. How would you integrate numbering without publishing incorrect keys?

**Level:** Senior

**Short answer:** I would assess the documented late-numbering integration pattern and maintain preliminary identities until the save sequence assigns final keys. The adjustment response must correlate the preliminary identity in %pre with the final %key; consumers must not assume an earlier key is final. SAP's BAPI guidance places a numbering create call in ADJUST_NUMBERS and describes a failure-capable saver for that scenario. I would verify availability, API release status and failure semantics before choosing that design.

**Example and follow-up:** Number allocation and external publication are different responsibilities. Do not send an email or remote event containing a supposedly committed number during an earlier phase. Late numbering does not by itself guarantee gap-free legal numbering; number-range configuration, rollback behavior and the posting API's own contract determine that requirement. For the documented failure-capable late-save scenario, if late save fails, COMMIT ENTITIES returns sy-subrc 8; an external EML consumer must issue ROLLBACK ENTITIES before continuing. Verify target-release support; this does not authorize a commit or rollback inside the behavior implementation.

**Avoid this mistake:** Using SELECT MAX plus one, dropping preliminary correlation, or assuming ordinary ADJUST_NUMBERS accepts recoverable business failures without a supported special contract.

**Interviewer follow-ups:**

- How does the external EML consumer obtain the final key?
- What must be demonstrated if the business insists on gap-free numbering?

**Strong answer criteria:**

- Separates preliminary and final identities
- Qualifies the BAPI saver exception
- Does not promise gap-free numbers from RAP alone

**Verification evidence:** Create several documents concurrently, include a failing API call, and verify final key conversion, associations and number-allocation behavior.

**Read and verify this answer:**

- [SAP: BAPI consumption, late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US&state=PRODUCTION&version=sap_cross_product_abap) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: EML identity tags</summary>

![EML identity tags](../visuals/eml-identity-tags.svg)

Content IDs connect entries within a request. Transactional and preliminary identities address other lifecycle needs.

**Explain it:** How can a new item refer to a newly created order before the final order number exists?

**Limit:** Generated EML types and available components are authoritative for the specific BO.

</details>

<details>
<summary>Visual: RAP identity and numbering timeline</summary>

![RAP identity and numbering timeline](../visuals/rap-numbering-timeline.svg)

Compare when the identity becomes final and when persistence is confirmed.

**Explain it:** What must an external EML consumer inspect after MODIFY and after COMMIT?

**Limit:** Illustrative numbering paths; exact %pid/%pre mapping and conversion syntax are release/scenario-specific.

</details>

## SRAP-09 A user saves a draft, closes the browser, returns, and presses Activate. What state transitions and failures would you explain?

**Level:** Senior

**Short answer:** A persisted draft survives the individual request but is not yet the active business object. For a new draft, activation leads to active creation; for an edit draft, it applies changes to the active instance through the applicable runtime contract. Prepare runs the assigned consistency work, while activation and final save still need to succeed. Discard abandons the draft; discarding an edit draft must not delete its existing active counterpart. Business Submit is a separate modeled action.

**Example and follow-up:** I would clarify which UI operation the interviewer calls 'save': a draft PATCH, draft activation and business submission can have different meanings. A failed validation should retain a correctable editing experience. Draft persistence and message behavior must be tested through the intended consumer, including a fresh browser session.

**Avoid this mistake:** Treating draft persistence as a final business commit or implementing Submit by directly updating draft tables.

**Interviewer follow-ups:**

- Which checks must still protect an API that writes active instances directly?
- What remains after discarding an edit draft versus a new draft?

**Strong answer criteria:**

- Distinguishes draft, activation and business status
- Explains both new and edit drafts
- Preserves a recoverable validation experience

**Verification evidence:** Test new/edit draft creation, browser reopen, failed Prepare, successful activation and both discard variants; inspect active and draft results.

**Read and verify this answer:**

- [SAP: Draft runtime](https://help.sap.com/docs/abap-cloud/abap-rap/draft-runtime) - Read the relevant operation/phase contract and verify target-release support.

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

## SRAP-10 A draft lock expires, another process changes an active child, and the first user resumes editing. How do you prevent silent loss of the child change?

**Level:** Senior

**Short answer:** I would check the composition's locking model and total-ETag maintenance across all relevant active changes, including children. After the exclusive draft lock expires, resume must detect whether active BO state changed using the total ETag before editing continues under renewed protection. An entity ETag used for a normal request is a related but different guard. If a child-changing path does not advance the required aggregate version, the draft conflict check can miss the change.

**Example and follow-up:** In an unmanaged implementation, version and lock responsibilities require explicit implementation evidence. Direct writes to persistence can bypass the intended maintenance entirely. The desired outcome for stale resume is an understandable conflict and recovery path, not silently copying the old draft over newly changed active data.

**Avoid this mistake:** Checking only the root's own business fields or assuming an expired lock means the stored draft is automatically current.

**Interviewer follow-ups:**

- Which timestamp should change after a child-only modification?
- How do you distinguish stale If-Match handling from draft resume protection?

**Strong answer criteria:**

- Separates ordinary and total ETags
- Includes child and alternative update paths
- Defines a stale-draft recovery experience

**Verification evidence:** Use two sessions, expire the draft lock, change only an active child, then resume and verify the conflict and unchanged active data.

**Read and verify this answer:**

- [SAP RAP total ETag](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f5e8548c241b43ab82bceec030b5dc9a.html) - Read the total-ETag protection when a draft lock expires; keep this separate from an entity update ETag.

<details>
<summary>Visual: Draft lifecycle</summary>

![Draft lifecycle](../visuals/draft-lifecycle.svg)

Follow edit, activate and discard for an existing active object, then explain how a new-object draft differs.

**Explain it:** What remains after discarding an edit draft? What if activation fails?

**Limit:** Schematic state transitions; draft actions and supported flows depend on the BO and consumer.

</details>

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

## SRAP-11 Two determinations calculate discount and total. Production results depend on which one executes first. How would you redesign them?

**Level:** Senior

**Short answer:** I would remove the dependency on unspecified execution order and repeated invocation. Derive the result from authoritative transaction state through a coherent calculation routine, with triggers covering every relevant input. Repeating the same calculation under unchanged conditions must not accumulate discounts or create extra children. If determinations update fields that trigger other rules, I would make those dependencies convergent and avoid cycles. For fully unmanaged active behavior, I would first verify that the proposed determination mechanism is supported.

**Example and follow-up:** Changing Quantity and Discount together should produce the same total as changing them in separate requests. A rule that subtracts a discount from the already discounted amount fails this test. I would calculate from base values, update only required derived values and keep external communication out of the derivation.

**Avoid this mistake:** Depending on declaration order, using a session flag to run once, or sending a notification each time the determination runs.

**Interviewer follow-ups:**

- What happens when activation reuses already executed consistency work?
- How would you detect and prevent a determination-trigger cycle?

**Strong answer criteria:**

- Requires idempotent calculations
- Avoids order assumptions
- Covers trigger dependencies and implementation restrictions

**Verification evidence:** Test combined and separate field changes, repeated evaluation, draft activation and create-then-delete in one transaction; compare final values.

**Read and verify this answer:**

- [SAP: Determinations](https://help.sap.com/docs/ABAP_Cloud/c22b59d4c9314104b4a448f3d30ee2e3/6edb0438d3e14d18b3c403c406fbe209.html?version=sap_btp) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## SRAP-12 A request changes CompanyCode to an unauthorized value and also makes its dates inconsistent. Would you use prechecks or validations?

**Level:** Senior

**Short answer:** I would separate the incoming-change decision from final-state consistency. A supported precheck can inspect requested values before they enter the transactional buffer, for example to reject a disallowed target context. A validation protects the resulting business state at its defined trigger time, such as the valid date interval. Neither replaces the complete RAP authorization model. I would merge partial input with relevant existing state when necessary and avoid assuming that every field is present in the request.

**Example and follow-up:** The original and target company may require different authorization considerations. The date rule should still hold for another consumer that reaches the same supported operation path. For unmanaged active instances, use the appropriate handler or save consistency mechanism instead of assuming BDEF draft validations protect active persistence automatically.

**Avoid this mistake:** Treating prechecks as a global security bypass or believing a UI mandatory marker enforces all backend invariants.

**Interviewer follow-ups:**

- Which state does the precheck see before the update is applied?
- How would the rule behave for a partial update that omits both dates?

**Strong answer criteria:**

- Separates incoming intent from final state
- Keeps authorization explicit
- Accounts for partial updates and unmanaged restrictions

**Verification evidence:** Verify that a denied target context is rejected by the precheck before entering the transactional buffer. Separately verify that inconsistent dates are rejected by validation and cannot be persisted; test correction and successful retry through EML and the service.

**Read and verify this answer:**

- [SAP RAP operation prechecks](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f6e3880b641649b1b8247486579a1c9b.html) - Verify that prechecks inspect incoming changes before buffering; validations reject inconsistent saved outcomes at their supported phase.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

<details>
<summary>Visual: EML update intent: absent versus clear</summary>

![EML update intent: absent versus clear](../visuals/senior-control-presence.svg)

The first two requests carry the same initial ABAP value but differ in update intent. The field control decides whether the old comment is preserved or explicitly cleared.

**Explain it:** How would you preserve Amount while clearing Comment, and how could an adapter lose that distinction?

**Limit:** This is a worked mapping example. Actual generated EML types, UPDATE FIELDS syntax, protocol nullability, and business validation remain authoritative.

</details>

<details>
<summary>Visual: Existing and proposed state authorization</summary>

![Existing and proposed state authorization](../visuals/senior-proposed-state-authorization.svg)

Editing the current A instance and moving it into B are different authorization decisions. Partial input must be interpreted with existing state without treating omitted fields as explicit clears.

**Explain it:** Which state does each check inspect, and what happens if a determination changes the target scope?

**Limit:** A policy example, not a universal company-code rule. Implement through the target RAP scenario's supported hooks; prechecks do not replace the complete authorization model.

</details>

## SRAP-13 A CopyOrder action creates an order, but the UI stays on the source and the consumer cannot identify the copy. How do you review the action contract?

**Level:** Senior

**Short answer:** I would inspect whether the operation should be an instance factory action and whether its creation mapping preserves the caller's content ID. A normal action returning $self describes a different result contract. For an ordinary action with a declared result, the implementation must populate the correct result structure and cardinality. For a factory action, creation identification uses MAPPED rather than an ordinary result parameter. I would check supported cardinalities and actual UI navigation behavior on the target release.

**Example and follow-up:** Copying also needs a field policy: generate new identity, reset approval state, omit audit ownership and decide which children are copied. Do not infer business copy semantics from a whole-structure assignment. A correctly returned key cannot compensate for copied status or authorization data that should never have been reused.

**Avoid this mistake:** Assuming all factory-action cardinalities are identical on every release or solving wrong result mapping with a hard-coded UI redirect.

**Interviewer follow-ups:**

- What changes if one source must create several target objects?
- Which source fields and children must never be copied automatically?

**Strong answer criteria:**

- Chooses factory versus ordinary action deliberately
- Preserves request-to-created-instance mapping
- Defines copy semantics and release-dependent consumer behavior

**Verification evidence:** Call the action through EML and the UI with multiple inputs; verify mappings, new identities, reset fields and navigation to the correct instance.

**Read and verify this answer:**

- [SAP: Action definition](https://help.sap.com/docs/abap-cloud/abap-rap/action-definition) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: EML identity tags</summary>

![EML identity tags](../visuals/eml-identity-tags.svg)

Content IDs connect entries within a request. Transactional and preliminary identities address other lifecycle needs.

**Explain it:** How can a new item refer to a newly created order before the final order number exists?

**Limit:** Generated EML types and available components are authoritative for the specific BO.

</details>

## SRAP-14 A projection accepts a convenience field that must enrich an underlying create. Why might augmentation fit, and what are its boundaries?

**Level:** Senior

**Short answer:** Augmentation can translate supported projection-specific modify input into compatible underlying BO operations. I would preserve the original request's supplied values and relate any generated input to its originating request using the supported correlation mechanism. It is not an unrestricted hook for overwriting caller intent or an additional-save implementation. I would inspect permitted operations, control information and response behavior in the target release, because an augmenting EML call does not behave like an arbitrary synchronous modify call.

**Example and follow-up:** For a requested display-language text, the projection may add a corresponding text creation while the base BO remains reusable. The main risks are conflicting supplied fields, duplicate content IDs and an error that loses its original request context. Persistent invariants must remain protected in the underlying BO for other consumers.

**Avoid this mistake:** Using augmentation to bypass base validations or expecting an unrestricted local result from an augmenting operation.

**Interviewer follow-ups:**

- What if the caller already supplied the field your augmentation wants to set?
- How is a generated child operation related back to the original request?

**Strong answer criteria:**

- Keeps augmentation at the projection input boundary
- Preserves supplied-field and correlation semantics
- Retains reusable base invariants

**Verification evidence:** Test absent/present convenience fields, conflicting underlying input, multi-instance requests and generated-operation failures with the supported augmentation API.

**Read and verify this answer:**

- [SAP: Operation augmentation](https://help.sap.com/docs/abap-cloud/abap-rap/operation-augmentation) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: Augmentation versus additional save</summary>

![Augmentation versus additional save](../visuals/rap-augmentation-additional-save.svg)

Locate the input transformation and persistence supplement on the same conceptual timeline.

**Explain it:** Why would writing an audit row not make augmentation the right save hook?

**Limit:** The arrow is conceptual; availability, supported fields and trigger details depend on the target RAP release.

</details>

## SRAP-15 A legacy function module issues COMMIT WORK internally. Can you make it safe by wrapping it in a RAP action?

**Level:** Senior

**Short answer:** A wrapper does not remove the commit or transfer transaction ownership. I would inspect the full call chain and seek a released API with compatible buffering and save behavior, or separate the operation into an explicitly asynchronous process with its own transaction. Moving the same committing call to a saver is not sufficient. If a supported classic API integration is possible, its specific release, language-version allowance, authorization and save-phase rules must be established before implementation.

**Example and follow-up:** The damaging case is a local order change followed by an internal legacy commit and then a later validation failure. The business sees a rejected request, yet some effects may already be durable. RFC indirection does not restore atomicity; it creates another boundary that needs state, retry and reconciliation design.

**Avoid this mistake:** Hiding the commit in a wrapper, disabling runtime checks, or calling a separate task while continuing to promise one LUW.

**Interviewer follow-ups:**

- How would you discover an implicit commit several calls below the adapter?
- What business states would an asynchronous replacement expose?

**Strong answer criteria:**

- Preserves RAP transaction ownership
- Audits nested and implicit transaction effects
- Offers a viable alternative integration boundary

**Verification evidence:** Review the dependency call graph and trace successful and rejected requests; document the first durable effect and the actual transaction owner.

**Read and verify this answer:**

- [SAP: General RAP BO implementation contract](https://help.sap.com/docs/abap-cloud/abap-rap/general-rap-bo-implementation-contract) - Read the relevant operation/phase contract and verify target-release support.
- [SAP: BAPI consumption, late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US&state=PRODUCTION&version=sap_cross_product_abap) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

## SRAP-16 An older RAP BO works without strict mode. The team wants to release it for cloud consumption by adding strict(2). Is that sufficient?

**Level:** Senior

**Short answer:** No. Strict mode introduces modeling and implementation requirements; enabling it can expose previously implicit behavior and incompatible derived-type usage. I would assess base and projection definitions together, make supported behavior explicit and review locks, authorizations, ETags and composition associations. API release also needs an intentional stable consumption contract and eligible dependencies. A successful syntax check is necessary evidence, but it does not demonstrate consumer compatibility, secure operation or a released API lifecycle.

**Example and follow-up:** I would capture existing service metadata and consumer tests before changing the model. The target product may support a different feature set from current cross-product documentation. A release plan should identify allowed future changes and the separate consumption or extension contracts, with regression cases for existing EML and OData clients.

**Avoid this mistake:** Treating strict(2) as a clean-core grade or API-release switch, or enabling it only on one layer and ignoring resulting contract changes.

**Interviewer follow-ups:**

- Which implicit behavior could disappear when strict mode is enabled?
- What would you freeze in a released BO interface rather than in the base implementation?

**Strong answer criteria:**

- Separates strict checks from API release
- Reviews all affected layers
- Plans compatibility and consumer regression evidence

**Verification evidence:** Record before/after metadata, activate the full dependency set, run ATC and execute representative old consumer calls on the target release.

**Read and verify this answer:**

- [SAP: Strict mode implementation requirements](https://help.sap.com/docs/abap-cloud/abap-rap/strict-mode-implementation-requirements) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## SRAP-17 An unmanaged BO passes isolated tests but a second request reads leftovers after an earlier save rejection. Where do you look?

**Level:** Senior

**Short answer:** I would inspect the lifetime of its custom transactional buffer and cleanup paths, including rejected early save and explicit rollback by an external transaction owner. Reads must combine persistent data with the current transaction's changes, not stale static state. CLEANUP and CLEANUP_FINALIZE have different lifecycle purposes; early-save cleanup may need to undo finalize-derived work while preserving the correct state for continued interaction. I would define these semantics explicitly instead of clearing every structure indiscriminately.

**Example and follow-up:** A static internal table is not automatically a valid cache just because RAP calls it from one behavior pool. Reuse of an internal session can reveal stale entries or counters. Test a failed transaction followed by a clean one and verify creates, updates, deletes, numbering maps and temporary dependency data independently.

**Avoid this mistake:** Implementing cleanup only after success or deleting all user changes after an early-save rejection without understanding the retry contract.

**Interviewer follow-ups:**

- Which data was created during FINALIZE rather than during user interaction?
- How would an in-transaction READ differ from a direct SELECT after an unsaved update?

**Strong answer criteria:**

- Scopes state to a transaction
- Distinguishes lifecycle cleanup responsibilities
- Preserves correct read-your-writes and retry behavior

**Verification evidence:** Run failure-then-success, rollback-then-read and repeated-save sequences within a reused session; assert no stale buffer entries or leaked temporary identifiers.

**Read and verify this answer:**

- [SAP: Cleanup after early save failure](https://help.sap.com/docs/abap-cloud/abap-rap/f030096abe1d41f9ac7549f0290b9c09.html) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

## SRAP-18 An Approved event should trigger an external workflow. Why is calling its HTTP endpoint from an on-save determination unreliable?

**Level:** Senior

**Short answer:** The determination can run before the business transaction is durable and may be repeated. A remote HTTP effect cannot be rolled back with the local RAP buffer. I would use the supported RAP business-event and publication infrastructure, or another explicitly designed transactional delivery mechanism, and define the event as a fact about a committed transition. Broker delivery, consumer processing and business completion remain separate stages; consumers need idempotency and operational recovery rather than an assumption of exactly-once execution.

**Example and follow-up:** The event payload should contain a stable identity and enough version or transition context to reject stale work. A retry of the same event must not start a second approval workflow. Monitoring should connect producer transaction, event publication, delivery attempts and the consumer's recorded processing outcome without exposing unnecessary business data.

**Avoid this mistake:** Equating a successful HTTP response or a raised in-process event with durable, exactly-once end-to-end workflow execution.

**Interviewer follow-ups:**

- How would you recover an event that is delivered after the order is cancelled?
- What identifier prevents duplicate workflow creation?

**Strong answer criteria:**

- Separates transaction commit from remote effects
- Designs idempotent and version-aware consumers
- Names publication and processing observability

**Verification evidence:** Test rejected save, publisher outage, duplicate delivery and stale delivery; verify no workflow for rejected data and one effective workflow per transition.

**Read and verify this answer:**

- [SAP: Business events](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/0b925bc556d4491aad395b21ec2566ff.html) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

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

## SRAP-19 A credit-limit check runs successfully on a draft, but active data is later saved through another consumer with an invalid amount. What is missing?

**Level:** Senior

**Short answer:** The invariant must be enforced at every supported write path, not only in a convenient draft interaction. I would inspect validation triggers, Prepare assignment, active-instance processing and the implementation type. A managed validation can protect the final state through its supported save behavior; fully unmanaged active persistence needs its appropriate consistency implementation. I would also determine whether the check depends on concurrently changing credit usage and therefore requires a concurrency strategy beyond a one-time remote or database read.

**Example and follow-up:** A successful earlier check is evidence about that earlier state, not a reservation of available credit. Two orders can each pass against the same balance and exceed it together. The design may need an authoritative reservation operation, suitable locking or a business process accepting deferred rejection, depending on the actual credit service.

**Avoid this mistake:** Duplicating the check only in the UI or assuming validation alone eliminates a cross-transaction race.

**Interviewer follow-ups:**

- What prevents two parallel orders from consuming the same available credit?
- Which direct active-instance consumer tests would you add?

**Strong answer criteria:**

- Protects the invariant across consumers
- Accounts for unmanaged active behavior
- Recognizes time-of-check versus time-of-use risk

**Verification evidence:** Exercise draft activation and direct active writes, then run two competing transactions whose combined amount exceeds the limit.

**Read and verify this answer:**

- [SAP: Validations](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/171e26c36cca42699976887b4c8a83bf.html) - Check validation triggers, draft Prepare and the managed/unmanaged distinction. The credit-reservation and concurrency strategy is scenario analysis, not a guarantee provided by validation alone.

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## SRAP-20 In a mass approval request, one instance fails. Must all other approvals be rolled back?

**Level:** Senior

**Short answer:** I would first identify the business requirement and exact transaction boundary: an EML interaction, the surrounding SAP LUW, an OData changeset or atomicity group, and an entire batch are different scopes. Per-instance failures during interaction do not by themselves define the final policy for all other inputs. The transaction owner must inspect responses and apply the required commit or rollback behavior. Backend action design must preserve invariants and report every affected instance consistently.

**Example and follow-up:** If the business requires one approval package to succeed together, model and test that unit explicitly. If independent approvals may succeed separately, partition requests intentionally and expose per-item outcomes. Do not infer persistence from the HTTP envelope or from a successful response for an operation before the relevant save boundary.

**Avoid this mistake:** Claiming that any FAILED entry universally rolls back every request, or that every OData batch is one atomic transaction.

**Interviewer follow-ups:**

- How does your answer change for separate atomicity groups?
- What must an external EML consumer do after a partial interaction failure?

**Strong answer criteria:**

- Names the actual atomic unit
- Separates interaction responses from save outcome
- Aligns transaction policy with business requirements

**Verification evidence:** Test a mixed-success action via EML and the actual OData request shape; inspect persisted state after both intended commit and rollback paths.

**Read and verify this answer:**

- [SAP: Entity Manipulation Language](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: OData batch envelope and atomic groups</summary>

![OData batch envelope and atomic groups](../visuals/odata-batch-envelope.svg)

The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.

**Explain it:** If a later independent group fails, must an earlier successful group be rolled back?

**Limit:** Conceptual grouping, not an exact multipart or JSON batch payload.

</details>

<details>
<summary>Visual: FAILED, REPORTED, and MAPPED in a worked create</summary>

![FAILED, REPORTED, and MAPPED in a worked create](../visuals/senior-response-channels.svg)

Three input identities produce separate rejection, message, and key-correlation information. A message on C3 does not itself reject that input, and assigned keys do not prove durable persistence.

**Explain it:** What must the consumer inspect after this interaction, and what happens if the later save fails?

**Limit:** Conceptual response contents, not executable EML. Available fields and correlation depend on the operation and BO; save and atomicity semantics must be tested separately.

</details>

## SRAP-21 After a quantity change, the backend total is correct but the Fiori page displays the old value. Is this a transaction bug?

**Level:** Senior

**Short answer:** I would separate calculation correctness from client refresh. First read the relevant transactional state through the correct draft or active context and verify the determination. Then inspect action results, side-effect declarations, service metadata and actual client requests. A supported side effect tells the consumer which dependent values or permissions to refresh; it does not calculate the total or create a commit boundary. The answer may be a UI refresh contract defect rather than incorrect persistence.

**Example and follow-up:** I would reproduce without the UI through EML or the service, then compare the browser's network trace. Refreshing the entire page can conceal a missing dependency but adds cost and may lose editing context. Child changes, totals and action availability often need a deliberately scoped refresh rather than a global reread.

**Avoid this mistake:** Adding COMMIT WORK to make the UI update or treating a side-effect declaration as a substitute for a backend determination.

**Interviewer follow-ups:**

- What if the total is correct only after activation?
- Which refresh targets and requests would you expect after an item quantity change?

**Strong answer criteria:**

- Diagnoses backend state and client state separately
- Preserves transaction ownership
- Validates metadata against real consumer behavior

**Verification evidence:** Compare EML/service values with browser requests before and after the change; verify draft context, refreshed totals and request volume.

**Read and verify this answer:**

- [SAP RAP side effects](https://help.sap.com/docs/abap-cloud/abap-rap/side-effects) - Read the field/action trigger and refresh-target contract; verify the actual UI consumer support.

<details>
<summary>Visual: Side effects and stale UI diagnosis</summary>

![Side effects and stale UI diagnosis](../visuals/rap-side-effect-diagnosis.svg)

Use the observed backend value to choose the next debugging branch.

**Explain it:** What request proves that the consumer refreshed the calculated total?

**Limit:** Consumer and metadata support are release-dependent; a valid backend side effect is not proof that every client processes it.

</details>

## SRAP-22 Your team finds a useful SAP RAP base BO in ADT, but only a narrower BO interface is released. Which layer should your application consume?

**Level:** Senior

**Short answer:** I would consume the released interface with the required visibility and contract, and design within the operations it exposes. Source visibility or a callable-looking base object is not a supported consumption promise. The BO interface provides a stable boundary while the provider retains freedom to change internals. If an operation is missing, I would look for another released API, request the capability or redesign the process rather than bypass the interface with table updates or unreleased behavior access.

**Example and follow-up:** A BO interface is not an arbitrary OO interface with a custom handler: it exposes a supported subset of the underlying RAP BO. I would check whether draft operations, fields, associations and actions needed by this consumer are included, as well as authorization and version-dependent restrictions on cross-component use.

**Avoid this mistake:** Calling the base BO because it activates today, or equating C1 consumption permission with permission to extend every underlying artifact.

**Interviewer follow-ups:**

- What does the interface protect when the provider changes its persistence model?
- How would you handle a required operation absent from the released interface?

**Strong answer criteria:**

- Uses the released consumption boundary
- Separates consumption and extension contracts
- Checks capability gaps before implementation

**Verification evidence:** Record API state and visibility in the target system; compile and test the consumer using only exposed fields, associations and operations.

**Read and verify this answer:**

- [SAP: Business object interface](https://help.sap.com/docs/ABAP_Cloud/abap-rap/business-object-interface) - Read the relevant operation/phase contract and verify target-release support.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## SRAP-23 Two requests execute Submit for the same order, and one client retries after a timeout. How do you prevent duplicate business effects?

**Level:** Senior

**Short answer:** I would define Submit as an explicit state transition with a concurrency policy and a durable notion of the business operation. Locking and version checks prevent conflicting updates, but a later retry still needs a defined outcome when the order is already submitted. I would either return the original effective result or reject the repeated transition consistently, and use stable idempotency correlation for downstream work. A disabled UI button is neither concurrency control nor duplicate-effect protection.

**Example and follow-up:** Checking status before acquiring suitable protection leaves a race: both requests can observe Open. The transition and its durable follow-up intent must be coordinated. If a caller supplies an idempotency key, scope it by operation and relevant business context, detect incompatible payload reuse, and define retention and lookup behavior.

**Avoid this mistake:** Relying on a singleton flag, browser debounce, or request-local %cid as a durable cross-request idempotency key.

**Interviewer follow-ups:**

- What response should the retry receive if the first call committed but its response was lost?
- How do you handle the same idempotency key with different parameters?

**Strong answer criteria:**

- Coordinates state transition and concurrency
- Defines retry outcomes explicitly
- Prevents duplicate downstream effects durably

**Verification evidence:** Run simultaneous Submit calls and replay after a simulated lost response; verify one effective transition and one intended downstream operation.

**Read and verify this answer:**

- [SAP: General RAP BO implementation contract](https://help.sap.com/docs/abap-cloud/abap-rap/general-rap-bo-implementation-contract) - Read the relevant operation/phase contract and verify target-release support.
- [SAP: Business events](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/0b925bc556d4491aad395b21ec2566ff.html) - Read the relevant operation/phase contract and verify target-release support.

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

## SRAP-24 A validation reports the right error once, but the message remains after correction or appears on the wrong child. How would you debug it?

**Level:** Senior

**Short answer:** I would inspect instance identity, field markers, parent paths and state-area handling in REPORTED, plus the corresponding FAILED entry where rejection is required. State messages represent current invalid state and need correct invalidation and revalidation; transition messages describe a particular operation. I would trace which validation triggers fire after correction and whether the UI is reading the right draft instance. An accurate message text cannot compensate for a wrong transactional key or stale state area.

**Example and follow-up:** For an item delivery-date error, revalidate the affected item and clear the prior state appropriately before reporting the current result. Include a case where the item is deleted or moved out of the failing condition. Avoid blanket deletion of all messages, which can remove unrelated errors owned by other checks.

**Avoid this mistake:** Appending error text on every call without resetting its state area, or assuming REPORTED alone rejects a save.

**Interviewer follow-ups:**

- Which message should survive a round trip and which should not?
- How would you preserve an unrelated validation's error while clearing this one?

**Strong answer criteria:**

- Correlates messages to transactional identity and fields
- Manages state areas without erasing unrelated state
- Separates messaging from operation rejection

**Verification evidence:** Test invalid-to-valid-to-invalid edits on two children, child deletion and activation; assert message paths, stale-message removal and correct save rejection.

**Read and verify this answer:**

- [SAP RAP state messages](https://help.sap.com/docs/abap-cloud/abap-rap/state-messages) - Compare persistent state-related messages with transition messages, instance identity and message invalidation.

<details>
<summary>Visual: RAP message lifecycle and correction</summary>

![RAP message lifecycle and correction](../visuals/rap-message-lifecycle.svg)

Follow the same child through an error and correction instead of treating a message as timeless text.

**Explain it:** Which identity and state area would you inspect when the old error remains?

**Limit:** Message lifetime and permitted state-message scenarios depend on active/draft and the supported operation contract.

</details>

## Official references

- [SAP: General RAP BO implementation contract](https://help.sap.com/docs/abap-cloud/abap-rap/general-rap-bo-implementation-contract)
- [SAP: Save options](https://help.sap.com/docs/btp/fc4c71aa50014fd1b43721701471913d/11e2c9d9a2c8420f88d1cf2d6c015c2b.html?version=202310.002)
- [SAP: BAPI consumption, late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US&state=PRODUCTION&version=sap_cross_product_abap)
- [SAP: Entity Manipulation Language](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml)
- [SAP: Draft runtime](https://help.sap.com/docs/abap-cloud/abap-rap/draft-runtime)
- [SAP: Determinations](https://help.sap.com/docs/ABAP_Cloud/c22b59d4c9314104b4a448f3d30ee2e3/6edb0438d3e14d18b3c403c406fbe209.html?version=sap_btp)
- [SAP: Action definition](https://help.sap.com/docs/abap-cloud/abap-rap/action-definition)
- [SAP: Operation augmentation](https://help.sap.com/docs/abap-cloud/abap-rap/operation-augmentation)
- [SAP: Strict mode implementation requirements](https://help.sap.com/docs/abap-cloud/abap-rap/strict-mode-implementation-requirements)
- [SAP: Business object interface](https://help.sap.com/docs/ABAP_Cloud/abap-rap/business-object-interface)
- [SAP: Business events](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/0b925bc556d4491aad395b21ec2566ff.html)
- [SAP: Cleanup after early save failure](https://help.sap.com/docs/abap-cloud/abap-rap/f030096abe1d41f9ac7549f0290b9c09.html)
- [SAP RAP total ETag](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f5e8548c241b43ab82bceec030b5dc9a.html)
- [SAP RAP operation prechecks](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f6e3880b641649b1b8247486579a1c9b.html)
- [SAP RAP side effects](https://help.sap.com/docs/abap-cloud/abap-rap/side-effects)
- [SAP RAP state messages](https://help.sap.com/docs/abap-cloud/abap-rap/state-messages)
