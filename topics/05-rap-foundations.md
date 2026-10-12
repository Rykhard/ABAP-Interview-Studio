# RAP foundations and transactions

Start with the business-object boundary and transaction owner. Explain how the consumer changes the transactional buffer, how business rules run, and when the framework persists the result. These distinctions prevent the most serious mistakes in the original notes.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## RAP-01 What are the building blocks of a RAP application?

**Level:** Core

**Short answer:** A RAP app has a data model, business rules, and a service. Tables store the data, and CDS describes what that data means. The behavior definition says what users can do; ABAP handlers add your business logic. Projections choose what a particular app exposes. The service definition and binding make those entities available through a chosen protocol.

**Reasoning and example:** Imagine a purchase-request app with a Submit button. CDS describes the request and its items. The behavior definition declares Submit, and its handler checks or changes the request as the operation requires. The transaction first holds those changes in memory. The RAP save sequence then writes valid changes to the database.

The projection exposes the fields and operations this app needs. The service definition selects the entities, while the binding chooses, for example, an OData service type. Read-access rules and UI annotations handle other concerns. Keeping these jobs separate makes it easier to find where a missing field, failed operation, or incorrect screen comes from.

**Avoid this mistake:** Behavior is not implemented by the service definition, and a binding alone does not make the endpoint production-ready.

**Read and verify this answer:**

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## RAP-02 How do you choose managed versus unmanaged RAP?

**Level:** Core

**Short answer:** Use managed RAP when the framework can handle your object's changes and database writes. Use unmanaged RAP when your implementation must handle those jobs, often because an existing business API already owns them. Managed RAP with unmanaged save is a middle option: RAP handles changes, and your code handles persistence. In every option, RAP still controls the transaction.

**Reasoning and example:** For a new travel-request app with your own tables, managed RAP usually avoids writing basic create, update, and delete handling yourself. You can focus on rules such as checking travel dates. For an existing application, a business API may already update several related tables correctly. Reusing it may justify unmanaged save or a fully unmanaged implementation.

Before choosing, check whether that API commits by itself, uses update tasks, or requires its own locks. A commit inside local RAP processing violates its runtime rules and may be rejected. Moving the call to a separate transaction creates another problem: it can save independently, and a later local rollback cannot undo it. Choose based on the API's behavior, not the application's age.

**Avoid this mistake:** Unmanaged does not permit arbitrary COMMIT WORK or database changes anywhere in a handler.

**Read and verify this answer:**

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP implementation ownership matrix</summary>

![RAP implementation ownership matrix](../visuals/rap-save-ownership-matrix.svg)

Trace the same request through three implementation choices and name the owner of each responsibility.

**Explain it:** Which part stays managed when only the save implementation is replaced?

**Limit:** Conceptual comparison; specific saver variants and failure support depend on release and scenario.

</details>

## RAP-03 What is the transactional buffer?

**Level:** Core

**Short answer:** The transactional buffer is the transaction's working copy of a business object. It includes changes that have not yet been saved. EML can read this current state through the business object. A direct database SELECT may still see the old saved values. Managed RAP supplies buffer handling; an unmanaged implementation must provide the required handling.

**Reasoning and example:** Suppose an order item has quantity 2 in the database. The user changes it to 5, and RAP must recalculate the order total before saving. Reading the item through the business object lets the calculation use the pending quantity of 5. Reading only the database can give 2 and produce an outdated total.

After a successful save, the database contains the new state. Until then, the buffer belongs to this transaction. It is not a place to keep unfinished work across unrelated HTTP requests. Draft provides separate persistent storage for that use case. This distinction helps explain why a correct database query can still be wrong inside a business rule.

**Avoid this mistake:** The buffer is not a durable draft store and does not survive arbitrary stateless HTTP requests.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

<details>
<summary>Visual: Three storage lifetimes: an illustrated analogy</summary>

![Three storage lifetimes: an illustrated analogy](../visuals/draft-storage-illustration.png)

The desk represents the current transactional buffer; the draft cabinet represents persistent work across requests; the shared archive represents saved active data.

**Explain it:** Which of the three can survive several HTTP requests without becoming active business data?

**Limit:** An analogy, not literal SAP storage architecture or a mandatory three-stage pipeline. A new draft may have no active instance. Active business records may still be updated.

</details>

## RAP-04 Where may COMMIT ENTITIES be called?

**Level:** Core

**Short answer:** Call COMMIT ENTITIES from an external ABAP program that owns an EML transaction. Inside a RAP handler or saver, let the framework finish the transaction. Do not call COMMIT ENTITIES or COMMIT WORK there. This rule also applies to actions, validations, and determinations. The OData request framework owns the save boundary for its requests.

**Reasoning and example:** A standalone ABAP program creates a request and its items with EML. It checks the modification responses, then calls COMMIT ENTITIES at the point where the complete business change should be saved. It must also check the save responses, because accepting a modification does not prove that saving succeeded.

Now put the same creation logic inside a RAP action. The action may make permitted changes, but it must not commit them itself. The framework still has other rules and changes to process. An early commit could split what should be one transaction, and violating the RAP contract can cause a runtime error. Moving the commit into a saver method does not fix that.

**Avoid this mistake:** Moving the commit from validation into SAVE or CANCEL does not make it valid.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the RAP implementation type and what is allowed at this point in the transaction.
- [SAP RAP BO contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

## RAP-05 What are the steps of the RAP save sequence, and where is the point of no return?

**Level:** Advanced

**Short answer:** RAP saves changes in this order: FINALIZE finishes calculations, CHECK_BEFORE_SAVE checks the data, ADJUST_NUMBERS assigns final keys when late numbering is used, SAVE writes the data, and CLEANUP clears the buffer. The point of no return comes after CHECK_BEFORE_SAVE has passed for every involved business object. Remember it as: calculate, check, number, write, clear.

**Reasoning and example:** 1. FINALIZE - finish the data. For an order, calculate the total from its items. In a managed BO, relevant on-save determinations do this work; in an unmanaged BO, use the corresponding saver method. This is the last phase for permitted changes to the transactional buffer. Ordinary EML MODIFY requests after FINALIZE cause runtime errors; the ban does not start at the beginning of FINALIZE.

2. CHECK_BEFORE_SAVE - make the final business checks. For example, reject an order whose delivery date is invalid. Managed BOs use validations; unmanaged BOs implement the corresponding saver check. Only when every involved BO passes do we cross the point of no return. A failed check stops the save before late numbering and persistence.

3. ADJUST_NUMBERS - assign final keys for late numbering. Our new order now receives document number 4711. Early numbering has already assigned the key, so it does not need this late assignment. Receiving a number does not yet prove that the database commit succeeded.

4. SAVE - write the changes. With normal managed save, RAP writes the BO data. With additional save, RAP still writes it, and your save_modified method adds work such as an audit row. With managed interaction plus with unmanaged save, your save_modified method replaces managed persistence. A fully unmanaged BO instead implements save in its local saver class. SAVE is the phase name; it does not mean every scenario uses a method named save.

5. CLEANUP - clear transaction-local buffers when the LUW finishes, including after rollback. This prevents old working data from leaking into the next transaction. CLEANUP_FINALIZE is a separate early-failure hook when FINALIZE or CHECK_BEFORE_SAVE fails in an involved BO; it can undo work done during finalization. It is not the last step of a successful save, and you should not assume every rejected save automatically discards all user input.

Example: two order items cost 40 and 60. FINALIZE calculates 100. CHECK_BEFORE_SAVE detects a bad delivery date, so the save stops: no late document number and no persisted order. With a valid date, late numbering can assign 4711 and persistence writes the order and items. The transaction owner completes the commit; cleanup then removes the working data. A handler or saver must not issue its own commit.

Senior detail: the point of no return means ordinary business checks must already have passed. It does not mean a database outage is impossible. SAP also documents a special failure-capable saver, CL_ABAP_BEHAVIOR_SAVER_FAILED, for supported cases such as BAPI integration. Check the exact scenario and release rather than treating that exception as permission to move normal validation into late save.

**Avoid this mistake:** Do not ban all EML changes inside FINALIZE, put normal validation after the point of no return, or confuse save_modified in a managed BO with the save method of a fully unmanaged BO. CLEANUP_FINALIZE belongs to the early-failure path.

**Read and verify this answer:**

- [SAP: Save Sequence Runtime](https://help.sap.com/docs/abap-cloud/abap-rap/save-sequence-runtime) - Phase order, the last buffer-change phase, the point of no return and early failure handling.
- [SAP: Save options](https://help.sap.com/docs/abap-cloud/abap-rap/save) - Managed persistence, additional save and replacement persistence are different choices.
- [SAP: Implementing Additional Save](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-additional-save) - The save_modified hook supplements managed persistence and receives change information.
- [SAP: TYPE REQUEST FOR](https://help.sap.com/docs/abap-cloud/abap-keyword/type-request-for) - Both managed BO save extensions use save_modified with create, update and delete inputs.
- [SAP: CLEANUP_FINALIZE](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f030096abe1d41f9ac7549f0290b9c09.html?locale=en-US) - CLEANUP_FINALIZE is an early-failure hook; the buffer lifecycle differs from normal end-of-LUW cleanup.
- [SAP: BAPI integration and late numbering](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US&state=PRODUCTION&version=sap_cross_product_abap) - Special BAPI integration can need a failure-capable saver. Verify product and release support.

<details>
<summary>Visual: RAP save sequence and early failure path</summary>

![RAP save sequence and early failure path](../visuals/rap-save-sequence.svg)

Follow one order from total calculation to buffer cleanup. The orange branch stops a rejected save before late numbering and persistence.

**Explain it:** Where is the last buffer-change phase, and when is the point of no return reached?

**Limit:** Simplified phase flow, not a trace of every runtime call. Managed and unmanaged implementation hooks differ; special late-failure support is scenario- and release-dependent.

</details>

<details>
<summary>Visual: Save options: who writes the data and which method runs?</summary>

![Save options: who writes the data and which method runs?](../visuals/rap-save-methods.svg)

Compare four persistence choices. Both save extensions of managed BOs use save_modified; a fully unmanaged BO uses save.

**Explain it:** Why is with unmanaged save not the same implementation as a fully unmanaged BO?

**Limit:** Conceptual ownership comparison. The complete BDEF, change-image options and saver signatures depend on the scenario and release.

</details>

## RAP-06 Determination validation action or precheck?

**Level:** Core

**Short answer:** Use a determination to fill or calculate values automatically. Use a validation to check whether data is acceptable for saving. Use an action for an operation a caller explicitly requests, such as Submit. Use a precheck to reject an incoming change before it enters the buffer. Choose by what must happen and when, rather than putting every rule in one handler.

**Reasoning and example:** In a request app, a determination can fill the default currency. A validation can reject an end date that is before the start date. Submit is an action because the user deliberately asks for a business step. A suitable precheck can reject a proposed field value before the update is accepted into the transaction.

A validation should report a problem, not silently repair the data. Also check the implementation type: in unmanaged RAP, declared determinations and validations apply to draft instances. For active instances, the appropriate unmanaged operation handlers and save checks must enforce consistency. Copying a managed example without that distinction can leave invalid active data unchecked.

**Avoid this mistake:** An action is not simply another name for a CRUD event, and validations should not modify business data.

**Read and verify this answer:**

- [SAP Learning on numbering and determinations](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/setting-values-using-numbering-and-determinations) - Check the RAP implementation type and what is allowed at this point in the transaction.
- [SAP RAP determinations and unmanaged scope](https://help.sap.com/docs/abap-cloud/abap-rap/determinations) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## RAP-07 How do FAILED REPORTED and MAPPED differ?

**Level:** Core

**Short answer:** FAILED says which instance or operation was rejected. REPORTED carries messages, including their severity and the field or instance they concern. MAPPED links a caller's creation identifier to the created object's identity where the operation supports it. These structures do different jobs. An error message in REPORTED alone does not necessarily make an operation fail.

**Reasoning and example:** A user saves two requests, and one has an invalid delivery date. A validation must identify the rejected request in FAILED and explain the problem in REPORTED. Adding a field reference lets the UI point to the date the user should fix. Reporting only an error-looking message is not a reliable way to reject the save.

For a successful create, the caller may have used a content ID before a final identity was available. MAPPED allows the caller to connect that input to the new object. Always use the response parameters actually provided by the handler contract. For example, a determination does not provide FAILED, so it is not a substitute for a rejecting validation.

**Avoid this mistake:** Error severity in REPORTED is not a substitute for FAILED; determinations do not expose FAILED.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: EML identity tags</summary>

![EML identity tags](../visuals/eml-identity-tags.svg)

Content IDs connect entries within a request. Transactional and preliminary identities address other lifecycle needs.

**Explain it:** How can a new item refer to a newly created order before the final order number exists?

**Limit:** Generated EML types and available components are authoritative for the specific BO.

</details>

<details>
<summary>Visual: RAP message lifecycle and correction</summary>

![RAP message lifecycle and correction](../visuals/rap-message-lifecycle.svg)

Follow the same child through an error and correction instead of treating a message as timeless text.

**Explain it:** Which identity and state area would you inspect when the old error remains?

**Limit:** Message lifetime and permitted state-message scenarios depend on active/draft and the supported operation contract.

</details>

## RAP-08 What is EML and when do you use it instead of SQL?

**Level:** Core

**Short answer:** EML lets ABAP code work with a RAP business object through its operations. READ ENTITIES reads its transactional state; MODIFY ENTITIES requests changes or actions. SQL reads or changes database data directly. It does not run the object's business behavior. Use EML when you need the business operation, and choose a suitable query interface when you only need database results.

**Reasoning and example:** Suppose a background program must submit an expense request. Updating its status column with SQL may skip checks, locks, and authorization handling that belong to Submit. Calling the exposed action through EML uses the business object's defined behavior and returns operation responses that the program must inspect.

The program also needs to handle the eventual save result. A successful action response is not proof of a completed commit. For a read-only report, a suitable CDS or SQL query may be the clearer and faster choice. EML is useful because it follows business behavior, not because every EML read is automatically faster than SQL.

**Avoid this mistake:** EML does not mean that every read is automatically the best performance choice; use the correct semantic interface.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

## RAP-09 What does IN LOCAL MODE mean?

**Level:** Advanced

**Short answer:** IN LOCAL MODE is for a business object's own internal EML calls. Depending on the operation, it skips checks such as authorization, feature control, and prechecks so internal logic can maintain the object. It does not create a separate transaction or allow forbidden save behavior. It is not a general way for external callers to turn off another object's security.

**Reasoning and example:** A request total is readonly to users because the application calculates it. A determination inside that business object may need to update the total after an item changes. An internal EML update in local mode allows this kind of controlled maintenance even though a normal external update of the field is restricted.

The public operation still needs its proper permission checks and business rules. Review what the internal code changes and why it is trusted. A call to a different business object needs its own supported access contract; do not treat local mode as a reusable security bypass. The changes still belong to RAP's transaction and must follow its save rules.

**Avoid this mistake:** It is not a general-purpose option for external callers to disable security on any BO.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the RAP implementation type and what is allowed at this point in the transaction.

## RAP-10 What do %cid %cid_ref %tky and %pid mean?

**Level:** Core

**Short answer:** These fields identify objects at different stages of a RAP request. %cid labels a new instance, and %cid_ref refers to that creation, for example when adding its items. %tky is the transactional key, including relevant context such as draft state. %pid is a preliminary identifier for late numbering. None of these names means they are interchangeable.

**Reasoning and example:** Create a header and one item in one request. The header may not yet have its final document number. Give its creation a content ID, then refer to that ID when creating the item by association. RAP can connect them without requiring the caller to guess a final key.

Inside handlers, use the supplied transactional identity when returning results or messages. Rebuilding a key from only the document number can lose draft context. For late numbering, ADJUST_NUMBERS maps the preliminary identification in %pre to the final %key. A content ID belongs to request correlation; it is not a business number to store and show forever.

**Avoid this mistake:** %tky means transactional key, not temporary key; %cid is not a persisted business document number.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the RAP implementation type and what is allowed at this point in the transaction.

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

## RAP-11 Early numbering versus late numbering?

**Level:** Advanced

**Short answer:** Early numbering gives an instance its final key during interaction. Late numbering keeps a preliminary identity and assigns the final key late in saving. A technical UUID and a business document number can be separate fields with different rules. Late numbering can avoid consuming numbers for some rejected changes. It does not, by itself, promise a gap-free business sequence.

**Reasoning and example:** A new request can receive a UUID immediately so its items have a stable technical parent. The business may want the visible approval number only when the request is accepted. That number can follow a separate supported numbering design rather than being used as the only technical identity.

Now consider two users saving at the same time. Reading the highest number and adding one can give both users the same result. Use suitable number-range and transaction handling instead. If the business requires no gaps, also examine failed saves, cancellations, and the exact numbering guarantees. Choosing late numbering is only one part of that design, not proof that every possible gap has disappeared.

**Avoid this mistake:** Late numbering alone does not guarantee a gap-free sequence, and SELECT MAX plus one is unsafe under concurrency.

**Read and verify this answer:**

- [SAP Learning on numbering and determinations](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/setting-values-using-numbering-and-determinations) - Check the RAP implementation type and what is allowed at this point in the transaction.
- [SAP RAP late-numbering mapping](https://help.sap.com/docs/abap-cloud/abap-rap/adjust-numbers) - Check the RAP implementation type and what is allowed at this point in the transaction.

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

## RAP-12 What problem does draft solve?

**Level:** Core

**Short answer:** Draft saves unfinished editing work separately from active business data. It lets a user continue across HTTP requests or return after an interruption. RAP provides operations such as Edit, Resume, Activate, and Discard; Prepare can run selected checks and calculations. Activation moves valid draft changes into active processing. The request still needs its save sequence to finish.

**Reasoning and example:** Maya edits order 4703 from 80 EUR to 120 EUR and closes the browser. The draft keeps her unfinished 120 EUR edit, while active business data stays at 80 EUR. When she returns, activation rejects 120 EUR because this example permits at most 100 EUR. She corrects the draft to 90 EUR; only successful activation and save make 90 EUR the active value.

When the user activates it, required checks can reject missing or invalid data. Successful activation is part of the processing that produces active data; it does not authorize a custom handler to commit on its own. Keep draft and active identities clear in reads, messages, and actions. A custom Submit action may represent a separate business step and is not automatically the same as draft activation.

**Avoid this mistake:** Every BO is not automatically draft-enabled, and a custom Submit action is not automatically draft activation.

**Read and verify this answer:**

- [SAP Learning on draft](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/understanding-the-draft-concept) - Check the RAP implementation type and what is allowed at this point in the transaction.

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

## RAP-13 Can you rely on determination and validation order?

**Level:** Advanced

**Short answer:** Do not make one independent determination depend on another running first unless the framework contract guarantees it. Calculate related values together or make their dependency explicit. Derivations should give a consistent result when repeated. RAP does have defined processing phases. That does not mean every handler inside a phase has an order you may rely on.

**Reasoning and example:** Suppose one determination converts an amount into the display currency and another calculates the total. If the total assumes conversion has already run, a later change may leave an incorrect result. A clearer design calculates both from the same current source values, or puts the dependent steps into one suitable operation.

Test more than the first create. Change the quantity twice, change the currency, and repeat the same update. The final total should remain correct and the handlers should not keep triggering each other unnecessarily. The issue is not that all RAP ordering is random. The issue is relying on an execution order that the documented contract never promised.

**Avoid this mistake:** Calling the order random is imprecise; the important point is that an unsupported ordering assumption is unsafe.

**Read and verify this answer:**

- [SAP RAP determinations and unmanaged scope](https://help.sap.com/docs/abap-cloud/abap-rap/determinations) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## RAP-14 How does persistent field mapping work?

**Level:** Core

**Short answer:** Field mapping tells RAP which persistence field belongs to a CDS element when their names differ. For example, RequestUUID can map to the table field request_uuid. The mapping connects names for the selected persistence implementation. It does not calculate new values or join tables. Business calculations and conversions need their own supported logic.

**Reasoning and example:** Your table uses request_uuid, but the CDS model exposes the clearer element name RequestUUID. The behavior mapping connects those names so persistence handling can read and write the intended field. Check every relevant field rather than assuming similarly named elements map themselves in every scenario.

Now imagine the screen shows amounts in another currency. Mapping Amount to a table column will not perform the currency conversion. That belongs in appropriate calculation or query logic. Projections and generated EML types also have their own names and identity fields, so use the correct type at each boundary. A field-name mapping does not remove those distinctions.

**Avoid this mistake:** Mapping is not a database join or a universal value-conversion mechanism.

**Read and verify this answer:**

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options) - Check the RAP implementation type and what is allowed at this point in the transaction.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## RAP-15 Can you call a BAPI from RAP, and what happens if it executes COMMIT?

**Level:** Advanced

**Short answer:** Some BAPIs can be used in RAP; some cannot. A BAPI does not always execute its own COMMIT. Check the specific API. A local COMMIT WORK or BAPI_TRANSACTION_COMMIT inside RAP handler or saver code breaks RAP transaction ownership and can cause a runtime error. Moving that call to unmanaged save or save_modified does not make the COMMIT legal.

**Reasoning and example:** First inspect what the BAPI actually does: validation, authorization, locks, direct database writes, update tasks and internal COMMIT. Also check whether the API is permitted in the target ABAP language version. A released API is not automatically usable in every RAP phase.

For a compatible legacy API, an action can collect the intent in the transactional buffer. The documented save integration performs the actual write later. In a managed BO with unmanaged save, save_modified replaces managed persistence; with additional save it supplements managed persistence. A fully unmanaged BO normally uses its saver save method. These are different options, not permission to end the LUW yourself. RAP owns the final commit.

Example: an action requests an update through a suitable BAPI. Validate predictable errors before the point of no return, retain the request in the buffer, call the API in the documented late-save exit, map its responses correctly, and let RAP finish the transaction. For supported create scenarios with late numbering, SAP documents BAPI use in ADJUST_NUMBERS; check the exact release and failure-handling contract.

If the BAPI inevitably commits internally, do not paste it into save_modified or hide it behind a wrapper. Look for a suitable API or redesign the process around an explicit asynchronous boundary. That changes when the business operation completes and needs visible pending/failed states. BRFplus is a rules engine, not a transaction workaround; see RAP-17. Keep the real permission check at the supported authorization boundary and use the documented authorization-context pattern where needed.

**Avoid this mistake:** Unmanaged means you implement more of the behavior or persistence. It does not mean unrestricted COMMIT. A wrapper, BRFplus call or RFC destination cannot magically preserve one atomic LUW.

**Read and verify this answer:**

- [SAP BAPI consumption in RAP: late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US) - Check the RAP implementation type and what is allowed at this point in the transaction.
- [SAP BAPI consumption in RAP: Authorizations](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-authorizations) - Read the authorization-context pattern together with RAP authorization handling. If a repeated check must be suppressed in a restricted phase, the real permission check must still happen at the allowed boundary.
- [SAP: RAP action with integrated BAPI business logic](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/implementing-rap-action-with-integrated-bapi-business-logic) - Compare collecting action intent with calling the compatible BAPI in late save.
- [SAP exercise RAP640: implement unmanaged save](https://github.com/SAP-samples/abap-platform-rap640/blob/main/exercises/ex4/README.md) - Hands-on example of a managed BO with unmanaged save; inspect the prerequisites before adapting it.
- [SAP: Transaction Model for Developing BAPIs](https://help.sap.com/docs/PRODUCT_ID/fe1c8e016c551014ba0ec92da35a91ee/4d5b102ba1483d8fe10000000a42189e.html) - BAPIs generally leave transaction control to the caller; documented historical exceptions exist. Inspect the actual API.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

## RAP-16 How do you group a multi-select Fiori action into one changeset with InvocationGrouping?

**Level:** Advanced

**Short answer:** For a supported Fiori elements action, set invocationGrouping: #CHANGE_SET on its @UI.lineItem action annotation. The default #ISOLATED allows separate changesets for the selected instances. Both can still travel inside one HTTP $batch request. $batch is the envelope; a changeset is the atomic group inside it. Check the generated metadata and the actual network request.

**Reasoning and example:** Imagine selecting orders A, B and C and pressing Approve. B is invalid. With separate changesets, A and C may succeed while B fails. With one shared changeset, the intended result is all-or-nothing: B failing prevents A and C from being committed in that group.

Put the annotation on the action entry in a CDS metadata extension. Keep type: #FOR_ACTION and the correct dataAction name. In OData metadata, verify UI.InvocationGrouping uses UI.OperationGroupingType/ChangeSet. Then inspect the browser Network tab: seeing /$batch alone is not proof that there is one shared changeset. Test one deliberately invalid selected order and check persisted data.

This configures how the supporting UI invokes the action; it does not combine arbitrary requests from every client or promise one ABAP handler call. The handler must accept multiple keys correctly. A freestyle SAPUI5 client also needs the appropriate OData model group/submission configuration. Remote side effects that already committed cannot be undone by a local changeset rollback.

**Avoid this mistake:** Do not equate #ISOLATED with no $batch, or #CHANGE_SET with automatic atomicity across remote systems. Verify the Fiori elements/OData version and service behavior.

**Read and verify this answer:**

- [SAP: UI.lineItem.invocationGrouping](https://help.sap.com/docs/abap-cloud/abap-keyword/ui-lineitem-invocationgrouping?locale=en-US) - Annotation values, default and intended multi-instance grouping.
- [SAPUI5: action invocation grouping](https://help.sap.com/docs/SAPUI5/fbdf2b2c05364a829185721c6ce5daa0/cbf16c599f2d4b8796e3702f7d4aae6c.html) - Distinguish a batch request from the changesets carried inside it.

## RAP-17 Do BRFplus, bgPF or bgRFC make an internally committing BAPI safe in RAP?

**Level:** Advanced

**Short answer:** BRFplus evaluates business rules; it does not fix a BAPI commit problem. bgPF is a background framework. Where supported, its uncontrolled operation variant can run logic that needs its own COMMIT. That work runs separately from the original RAP save, so it is not one immediate all-or-nothing transaction. Choose this only if the business process can accept a later result, retries and possible failure. An ordinary bgRFC unit still forbids COMMIT inside it.

**Reasoning and example:** Example: saving an order should start slow follow-up processing. With a supported bgPF integration, register the background work at the allowed point in RAP save so it becomes eligible after the initiating transaction succeeds. The user can see Pending, then Completed or Failed. Design retries, duplicate protection, monitoring and recovery. If the later work fails, the already committed order is not automatically rolled back.

Distinguish ordinary bgRFC units from the explicit bgPF uncontrolled operation contract. SAP provides IF_BGMC_OP_SINGLE_TX_UNCONTR and set_operation_tx_uncontrolled for the latter; its sample names COMMIT WORK as a use case. Check availability and restrictions in your target system. This does not allow COMMIT in the original RAP handler or saver. Intermediate commits in later processing can leave partial results, so retrying must not create duplicates.

BRFplus might decide which approval rule applies. It does not schedule background work or repair RAP transaction consistency. If someone says use BRF+ for the BAPI commit problem, clarify whether they meant bgPF or bgRFC, then review that design on its own merits.

**Avoid this mistake:** Do not confuse BRFplus with bgPF, or a bgPF uncontrolled operation with an ordinary bgRFC unit. A supported background COMMIT does not make it atomic with the original RAP save.

**Read and verify this answer:**

- [SAP: BRFplus business rules](https://help.sap.com/docs/SAP_S4HANA_CLOUD/8b78ae42ec1c4b75937806fcd4fd7d1c/9a6b67ce7c26446483af079719edf679.html) - BRFplus defines and evaluates business rules.
- [SAP: Background Processing Framework](https://help.sap.com/docs/SAP_S4HANA_CLOUD/6aa39f1ac05441e5a23f484f31e477e7/0ad13bd0fafb46f08d3f5174d5fd01f9.html) - bgPF supports reliable asynchronous processing on top of bgRFC.
- [SAP: CALL FUNCTION IN BACKGROUND UNIT](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcall_function_background_unit.htm) - Read transaction restrictions inside a bgRFC unit.
- [SAP: Controlled SAP LUW](https://help.sap.com/docs/abap-cloud/abap-concepts/controlled-sap-luw) - RAP uses the controlled transaction model. Check the chosen bgPF operation variant separately.
- [SAP: bgPF controlled and uncontrolled operation variants](https://help.sap.com/docs/ABAP_PLATFORM_NEW/8132142fd1a144a59303663a03a7c2d4/54886371defd410498df76d2c980c9ab.html) - The trace documentation lists both operation interfaces; use the target release documentation for their full contracts.
- [SAP sample: bgPF controlled and uncontrolled execution](https://github.com/SAP-samples/abap-platform-bgpf-appl-log-events-side-effects/blob/main/src/zbgpfcl_calc_inventory_006.clas.abap) - The sample distinguishes the operation interfaces and illustrates registration with set_operation_tx_uncontrolled. Verify the target release and error/retry contract.

## Official references

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options)
- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects)
- [SAP Learning on numbering and determinations](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/setting-values-using-numbering-and-determinations)
- [SAP Learning on draft](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/understanding-the-draft-concept)
- [SAP RAP BO contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract)
- [SAP RAP determinations and unmanaged scope](https://help.sap.com/docs/abap-cloud/abap-rap/determinations)
- [SAP RAP late-numbering mapping](https://help.sap.com/docs/abap-cloud/abap-rap/adjust-numbers)
- [SAP BAPI consumption in RAP: late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US)
