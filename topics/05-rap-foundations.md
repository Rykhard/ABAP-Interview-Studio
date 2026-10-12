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

## RAP-05 How do you explain the RAP save sequence?

**Level:** Advanced

**Short answer:** RAP first collects changes, then tries to save them together. During early save processing, it finishes calculations and checks whether the changes are valid. Later, it performs configured numbering and writes the data. Normal late-save processing expects business checks to have passed. Some documented BAPI integration variants can report late failures, but their release support and rules must be checked.

**Reasoning and example:** Think of saving an order with several items. A known invalid delivery date should be caught while RAP can still reject the change normally. Final document numbering and database writes happen later. This keeps avoidable business errors away from the stage intended to complete a consistent transaction.

When a legacy API is involved, check which parts only validate and which parts actually write. Do not assume all RAP implementations use the same saver methods, or that every business object has additional save. If the API can still fail during persistence, verify whether a documented failure-capable saver fits this exact scenario and release. Do not invent your own late error-handling contract.

**Avoid this mistake:** Do not present a memorized list of saver methods as universally identical for managed and unmanaged BOs.

**Read and verify this answer:**

- [SAP RAP BO contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Check the RAP implementation type and what is allowed at this point in the transaction.
- [SAP BAPI consumption in RAP: late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US) - Check the RAP implementation type and what is allowed at this point in the transaction.

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

**Reasoning and example:** Create a header and two items in one request. The header may not yet have its final document number. Give its creation a content ID, then refer to that ID when creating the items by association. RAP can connect them without requiring the caller to guess a final key.

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

**Reasoning and example:** A user starts a travel request, enters a destination, and closes the browser before adding dates. A draft-enabled app can keep that incomplete version so the user can resume later. Other business processing should continue to distinguish this unfinished draft from an active request.

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

## RAP-15 What should be checked before wrapping a BAPI in RAP?

**Level:** Advanced

**Short answer:** First check whether the BAPI is allowed in the target system and whether it fits RAP's transaction rules. Find out how it validates, locks, checks permissions, writes, uses update tasks, and commits. Choose a RAP implementation option that matches that behavior. Map failures and messages correctly. A wrapper changes the calling interface, not what the BAPI does inside.

**Reasoning and example:** A BAPI that commits inside local RAP processing violates RAP's runtime rules and may cause a runtime error. Moving it to a separate transaction does not preserve atomicity: that transaction can commit a document that local RAP rollback cannot undo. Check the real API's writes, locks, and commit behavior before selecting the integration pattern.

Authorization needs equal care. Some BAPI checks conflict with restrictions in particular RAP phases. Use the documented authorization-context pattern with RAP authorization handlers where supported. The permission decision must still happen at the allowed operation boundary. Suppressing a repeated check during validation or late save must never remove the user's actual permission check. Test rejection and recovery paths, not just successful creation.

**Avoid this mistake:** A wrapper changes the interface; it does not erase the underlying API's transaction behavior or Clean Core classification.

**Read and verify this answer:**

- [SAP BAPI consumption in RAP: late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US) - Check the RAP implementation type and what is allowed at this point in the transaction.
- [SAP BAPI consumption in RAP: Authorizations](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-authorizations) - Read the authorization-context pattern together with RAP authorization handling. If a repeated check must be suppressed in a restricted phase, the real permission check must still happen at the allowed boundary.

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

## Official references

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options)
- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects)
- [SAP Learning on numbering and determinations](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/setting-values-using-numbering-and-determinations)
- [SAP Learning on draft](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/understanding-the-draft-concept)
- [SAP RAP BO contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract)
- [SAP RAP determinations and unmanaged scope](https://help.sap.com/docs/abap-cloud/abap-rap/determinations)
- [SAP RAP late-numbering mapping](https://help.sap.com/docs/abap-cloud/abap-rap/adjust-numbers)
- [SAP BAPI consumption in RAP: late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US)
