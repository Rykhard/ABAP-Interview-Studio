# RAP foundations and transactions

Start with the business-object boundary and transaction owner. Explain how the consumer changes the transactional buffer, how business rules run, and when the framework persists the result. These distinctions prevent the most serious mistakes in the original notes.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## RAP-01 What are the building blocks of a RAP application?

**Level:** Core

**Short answer:** Persistence and CDS describe the data and BO composition. The behavior definition declares operations and rules; behavior implementation supplies application logic. Projections tailor the model and behavior. A service definition exposes entities, and a service binding chooses the protocol and service type. DCL and UI metadata complete relevant concerns.

**Example and follow-up:** Trace one Submit request from Fiori through the service and projection to the BO action, transactional buffer and save sequence. Distinguish generated framework operations from business logic you implement.

**Avoid this mistake:** Behavior is not implemented by the service definition, and a binding alone does not make the endpoint production-ready.

**Read and verify this answer:**

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options) - Check the exact RAP implementation scenario and transaction phase.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## RAP-02 How do you choose managed versus unmanaged RAP?

**Level:** Core

**Short answer:** Managed RAP supplies the transactional buffer and standard persistence handling for a suitable data model. Unmanaged RAP lets existing business logic supply interaction and save implementations while still obeying RAP's transaction contract. Managed with unmanaged save keeps managed interaction but delegates persistence. Choose by ownership of behavior and persistence, not application age alone.

**Example and follow-up:** A new request app with simple owned tables is a managed candidate. A proven transaction-consistent legacy API may justify unmanaged save. Inspect the API's commit behavior before integrating it.

**Avoid this mistake:** Unmanaged does not permit arbitrary COMMIT WORK or database changes anywhere in a handler.

**Read and verify this answer:**

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options) - Check the exact RAP implementation scenario and transaction phase.

<details>
<summary>Visual: RAP implementation ownership matrix</summary>

![RAP implementation ownership matrix](../visuals/rap-save-ownership-matrix.svg)

Trace the same request through three implementation choices and name the owner of each responsibility.

**Explain it:** Which part stays managed when only the save implementation is replaced?

**Limit:** Conceptual comparison; specific saver variants and failure support depend on release and scenario.

</details>

## RAP-03 What is the transactional buffer?

**Level:** Core

**Short answer:** It holds the current BO state and uncommitted changes for the RAP transaction. EML operates through business behavior and can see buffered state. Direct SQL reads persistence and can therefore miss unsaved changes. Managed and unmanaged implementations differ in who implements buffer management.

**Example and follow-up:** After changing an item quantity, a determination should calculate totals from the transaction's current state, not just a database snapshot that excludes the change.

**Avoid this mistake:** The buffer is not a durable draft store and does not survive arbitrary stateless HTTP requests.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the exact RAP implementation scenario and transaction phase.

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

**Short answer:** An external ABAP EML consumer can use COMMIT ENTITIES to trigger the save sequence. Inside a RAP behavior implementation, the framework owns commit and rollback. Do not call COMMIT ENTITIES or COMMIT WORK in actions, validations, determinations or saver methods; violating the contract can cause a runtime error.

**Example and follow-up:** A standalone consumer collects modification responses, checks failures and commits at the transaction boundary. An OData consumer lets the RAP request framework manage that boundary.

**Avoid this mistake:** Moving the commit from validation into SAVE or CANCEL does not make it valid.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the exact RAP implementation scenario and transaction phase.
- [SAP RAP BO contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Check the exact RAP implementation scenario and transaction phase.

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

**Short answer:** The interaction phase processes operations against the transactional buffer. The save sequence finalizes and checks the transaction, performs configured numbering, and persists changes. Detect predictable business failures during early save checks. Ordinary late-save processing assumes a consistent transaction; documented failure-capable saver variants for specific BAPI integration scenarios are an exception whose availability and contract must be verified for the target release.

**Example and follow-up:** For a legacy API, separate validation from actual persistence and verify that the API fits RAP's save contract. Additional save is a scenario-specific hook, not a universal stage every BO implements.

**Avoid this mistake:** Do not present a memorized list of saver methods as universally identical for managed and unmanaged BOs.

**Read and verify this answer:**

- [SAP RAP BO contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Check the exact RAP implementation scenario and transaction phase.
- [SAP BAPI consumption in RAP: late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US) - Check the exact RAP implementation scenario and transaction phase.

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

**Short answer:** A determination derives data automatically from declared triggers. A validation checks consistency and can reject saving. An action is an explicitly invoked business operation. A precheck rejects unsuitable incoming modifications before they enter the transactional buffer. Choose based on timing and responsibility.

**Example and follow-up:** Default currency in a determination; reject an invalid date range in a validation; submit a request through an action; reject an unauthorized proposed field value in a suitable precheck. In unmanaged scenarios, BDEF determinations and validations apply to draft instances; active-instance consistency is implemented in the appropriate unmanaged handlers and save checks.

**Avoid this mistake:** An action is not simply another name for a CRUD event, and validations should not modify business data.

**Read and verify this answer:**

- [SAP Learning on numbering and determinations](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/setting-values-using-numbering-and-determinations) - Check the exact RAP implementation scenario and transaction phase.
- [SAP RAP determinations and unmanaged scope](https://help.sap.com/docs/abap-cloud/abap-rap/determinations) - Check the exact RAP implementation scenario and transaction phase.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## RAP-07 How do FAILED REPORTED and MAPPED differ?

**Level:** Core

**Short answer:** FAILED identifies instances or operations that failed. REPORTED carries messages and their context, including severity and field references. MAPPED returns identity mappings where the operation contract supports them, for example creation. A message alone does not necessarily reject the operation.

**Example and follow-up:** For a rejected validation, populate the failed instance and a useful reported message. For a successful create, preserve the correlation between the consumer's content ID and the created identity.

**Avoid this mistake:** Error severity in REPORTED is not a substitute for FAILED; determinations do not expose FAILED.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the exact RAP implementation scenario and transaction phase.

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

**Short answer:** Entity Manipulation Language is ABAP's typed interface to RAP business objects. READ and MODIFY ENTITIES access BO behavior and transactional state, including supported actions and associations. SQL accesses a database result and does not execute the BO's transactional contract. Use EML when consuming business operations.

**Example and follow-up:** Updating a table directly can skip validations, authorization and lock handling. A report that invokes Submit should call the exposed BO action and process both interaction and save responses.

**Avoid this mistake:** EML does not mean that every read is automatically the best performance choice; use the correct semantic interface.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the exact RAP implementation scenario and transaction phase.

<details>
<summary>Visual: RAP buffer with a concrete value change</summary>

![RAP buffer with a concrete value change](../visuals/rap-buffer-example.svg)

During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.

**Explain it:** Why can a direct SQL read be the wrong way to read the BO during modification?

**Limit:** Simplified single-record example, not a promise about a particular SQL isolation level.

</details>

## RAP-09 What does IN LOCAL MODE mean?

**Level:** Advanced

**Short answer:** It is intended for internal consumption of a BO within its own behavior implementation. Depending on the EML operation it bypasses controls such as authorization, feature control and prechecks so internal logic can maintain its own state. It remains part of the RAP transaction and does not bypass the BO contract.

**Example and follow-up:** A determination may update a calculated readonly field through internal EML. Keep that logic behind the public operation's checks and review cross-BO calls separately.

**Avoid this mistake:** It is not a general-purpose option for external callers to disable security on any BO.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the exact RAP implementation scenario and transaction phase.

## RAP-10 What do %cid %cid_ref %tky and %pid mean?

**Level:** Core

**Short answer:** %cid correlates a created instance within a request. %cid_ref refers to a related creation by that content ID. %tky is the transactional key, including the relevant identity context such as draft state. %pid is a preliminary identifier used in late-numbering scenarios. They have different lifetimes and purposes.

**Example and follow-up:** When creating a header and items, correlate the parent creation for create-by-association. In handlers, return the supplied transactional identity rather than reconstructing only a subset of key fields. Late numbering in ADJUST_NUMBERS maps preliminary identification in %pre to the final %key.

**Avoid this mistake:** %tky means transactional key, not temporary key; %cid is not a persisted business document number.

**Read and verify this answer:**

- [SAP Learning on EML and transaction ownership](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects) - Check the exact RAP implementation scenario and transaction phase.

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

**Short answer:** Early numbering supplies the final key during interaction, either by the consumer or implementation as supported. Late numbering assigns final identifiers late in save, after preliminary identity has been used. Managed UUID numbering is a common technical-key option. Business numbering and technical identity may be separate requirements.

**Example and follow-up:** Late numbering can reduce numbers consumed by rejected transactions. A legally gap-free document sequence still needs a suitable number-range design, transaction guarantees and handling of failures and cancellations.

**Avoid this mistake:** Late numbering alone does not guarantee a gap-free sequence, and SELECT MAX plus one is unsafe under concurrency.

**Read and verify this answer:**

- [SAP Learning on numbering and determinations](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/setting-values-using-numbering-and-determinations) - Check the exact RAP implementation scenario and transaction phase.
- [SAP RAP late-numbering mapping](https://help.sap.com/docs/abap-cloud/abap-rap/adjust-numbers) - Check the exact RAP implementation scenario and transaction phase.

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

**Short answer:** Draft persists an incomplete editing state across stateless requests and interruptions, separately from active business data. The framework provides a draft lifecycle with operations such as Edit, Activate, Discard and Resume; Prepare can run designated checks and determinations. Draft and active identities must be distinguished.

**Example and follow-up:** A user can return to a partly completed request. Activation transfers valid draft changes into active processing, while the request's save sequence still completes the transaction.

**Avoid this mistake:** Every BO is not automatically draft-enabled, and a custom Submit action is not automatically draft activation.

**Read and verify this answer:**

- [SAP Learning on draft](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/understanding-the-draft-concept) - Check the exact RAP implementation scenario and transaction phase.

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

**Short answer:** Do not create hidden dependencies on an arbitrary order among independent determinations or validations. Model trigger conditions and explicit business dependencies; make derivations consistent and safe to repeat. Framework phase ordering exists, but that is different from a promise about a specific handler order.

**Example and follow-up:** If total calculation depends on currency conversion, put the dependent calculation in a coherent operation or derive both from stable current data. Test repeated updates and cycles.

**Avoid this mistake:** Calling the order random is imprecise; the important point is that an unsupported ordering assumption is unsafe.

**Read and verify this answer:**

- [SAP RAP determinations and unmanaged scope](https://help.sap.com/docs/abap-cloud/abap-rap/determinations) - Check the exact RAP implementation scenario and transaction phase.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## RAP-14 How does persistent field mapping work?

**Level:** Core

**Short answer:** Behavior mapping associates CDS element names with persistence fields when names differ. It is a structural correspondence used by the selected persistence implementation. It does not transform data arbitrarily or replace semantic modeling. Projections and operation-derived types also have their own identity and naming contracts.

**Example and follow-up:** A CDS element RequestUUID may map to request_uuid in the table. Currency conversion belongs in supported business or query logic, not in a field-name mapping declaration.

**Avoid this mistake:** Mapping is not a database join or a universal value-conversion mechanism.

**Read and verify this answer:**

- [SAP Learning on behavior implementation options](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/exploring-the-behavior-implementation-options) - Check the exact RAP implementation scenario and transaction phase.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## RAP-15 What should be checked before wrapping a BAPI in RAP?

**Level:** Advanced

**Short answer:** Check API availability and release classification, transaction consistency, locks, validation and save separation, update-task behavior, authorization checks and any implicit or explicit commit. Then choose a compatible RAP implementation scenario and map messages and failures. A callable function module is not automatically a valid RAP save implementation.

**Example and follow-up:** Prototype failure and rollback behavior with the real API. Verify that a later failure cannot leave the external document committed while the RAP transaction reports failure. For BAPI authorization checks that conflict with phase restrictions, use the supported authorization-context pattern together with RAP authorization handlers. Perform the actual authorization decision at the allowed operation boundary; disabling a repeated check in validation or late save must not remove the underlying protection.

**Avoid this mistake:** A wrapper changes the interface; it does not erase the underlying API's transaction behavior or Clean Core classification.

**Read and verify this answer:**

- [SAP BAPI consumption in RAP: late numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US) - Check the exact RAP implementation scenario and transaction phase.
- [SAP BAPI consumption in RAP: Authorizations](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-authorizations) - Check the documented authorization-context pattern and RAP authorization handler together. Suppressing a phase-restricted check must not remove the actual permission decision.

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
