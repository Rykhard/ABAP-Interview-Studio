# RAP service design and advanced behavior

Use this segment for deeper follow-up questions. Connect each feature to a concrete requirement and explain its limits. Release-specific BDL syntax and UI behavior must be checked against the employer's ABAP and SAPUI5 versions.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## ADV-01 How do pessimistic locks and ETags complement each other?

**Level:** Core

**Short answer:** A pessimistic lock prevents conflicting processing for a time. An ETag detects whether the version a client read is still current when it writes. RAP defines lock ownership and optimistic concurrency through behavior. Draft scenarios also need total-ETag handling for relevant active-data changes.

**Example and follow-up:** Two users read a request. After one saves, the other's stale If-Match must not silently overwrite it. A draft lock and an active-data version check solve different parts of this problem.

**Avoid this mistake:** Locking and logging are different concepts; an ETag is not a log and does not reserve the object.

**Read and verify this answer:**

- [SAP draft concept](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/understanding-the-draft-concept) - Check the supported RAP behavior and consumer/version contract.

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

## ADV-02 Global authorization instance authorization or feature control?

**Level:** Advanced

**Short answer:** Global authorization checks permissions independent of a specific instance. Instance authorization considers an instance's context. Feature control enables operations or fields according to business state. UI availability and feature control help consumers, but authorization must enforce who may perform the operation.

**Example and follow-up:** A submitted request may be readonly for everyone as a feature rule; approval may additionally require the assigned approver's authority. Test a direct API request as well as the disabled UI button.

**Avoid this mistake:** Hiding or disabling a button is not an authorization check.

**Read and verify this answer:**

- [SAP Learning on authorization](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Check the supported RAP behavior and consumer/version contract.

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

## ADV-03 What does authorization none on an action mean?

**Level:** Advanced

**Short answer:** Where supported, authorization: none exempts that action from the RAP authorization checks specified for it. It does not remove authentication at the service boundary or every authorization check in downstream code. Use it only with a deliberate security model and the exact supported behavior syntax.

**Example and follow-up:** An action that needs no object-specific authorization may still operate through an authenticated service and call another API that performs its own checks. Document why the exemption is justified.

**Avoid this mistake:** Do not propose it as a universal fix for authorization errors or expose a sensitive action by accident.

**Read and verify this answer:**

- [SAP Learning on authorization](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Check the supported RAP behavior and consumer/version contract.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## ADV-04 Instance static and factory actions?

**Level:** Core

**Short answer:** An instance action operates on identified instances. A static action belongs to the entity without requiring an existing instance. A factory action creates instances and returns the appropriate creation mapping. Their inputs, results and identity handling differ, so choose according to the business operation.

**Example and follow-up:** Approve acts on a request, CalculatePreview may be static, and CopyRequest can be a factory action. A normal instance action returning $self is not automatically a factory action.

**Avoid this mistake:** Static does not mean a static ABAP method that can ignore RAP identity and response contracts.

**Read and verify this answer:**

- [SAP action definitions](https://help.sap.com/docs/abap-cloud/abap-rap/action-definition) - Check the supported RAP behavior and consumer/version contract.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## ADV-05 How do action parameters and results work?

**Level:** Advanced

**Short answer:** Define a supported parameter and result shape in the behavior contract, often using a CDS abstract entity for structured input. Implement the generated handler signature and populate the requested result and response structures correctly. Cardinality and binding to instances are part of the contract.

**Example and follow-up:** Submit may accept a comment; CalculatePreview may return totals without persisting an object. The UI may generate a dialog from the parameter metadata, subject to consumer support.

**Avoid this mistake:** Parameters are not defined by putting an action inside an abstract entity.

**Read and verify this answer:**

- [SAP action definitions](https://help.sap.com/docs/abap-cloud/abap-rap/action-definition) - Check the supported RAP behavior and consumer/version contract.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## ADV-06 What is augmentation and how does it differ from additional save?

**Level:** Advanced

**Short answer:** Augmentation adapts supported modifying operations at a RAP projection boundary, allowing projection-specific input to be enriched or translated. Additional save adds persistence-related work alongside a managed save scenario. They run for different purposes and are not interchangeable hooks.

**Example and follow-up:** A projection may transform consumer-specific input into changes understood by the underlying BO. Audit records associated with managed persistence may instead need an additional-save design compatible with the transaction.

**Avoid this mistake:** Augmentation is not a generic before-save hook for copying every virtual element into a table.

**Read and verify this answer:**

- [SAP operation augmentation](https://help.sap.com/docs/abap-cloud/abap-rap/operation-augmentation) - Check the supported RAP behavior and consumer/version contract.

<details>
<summary>Visual: Augmentation versus additional save</summary>

![Augmentation versus additional save](../visuals/rap-augmentation-additional-save.svg)

Locate the input transformation and persistence supplement on the same conceptual timeline.

**Explain it:** Why would writing an audit row not make augmentation the right save hook?

**Limit:** The arrow is conceptual; availability, supported fields and trigger details depend on the target RAP release.

</details>

## ADV-07 What are side effects in a RAP UI?

**Level:** Advanced

**Short answer:** Side-effect metadata tells a capable consumer which values, messages or permissions to refresh after a relevant change or action. The backend must still compute correct results; the metadata coordinates refresh behavior. Backend release, service metadata and SAPUI5 support determine which declarations are available.

**Example and follow-up:** After changing quantity, refresh total amount and action availability. Verify network requests and the displayed values, especially after an action result or draft update.

**Avoid this mistake:** A side-effect declaration does not implement the calculation or force all non-UI consumers to issue extra reads.

**Read and verify this answer:**

- [SAP RAP side effects](https://help.sap.com/docs/abap-cloud/abap-rap/side-effects) - Read the field/action trigger and refresh-target contract; verify the actual UI consumer support.

<details>
<summary>Visual: Side effects and stale UI diagnosis</summary>

![Side effects and stale UI diagnosis](../visuals/rap-side-effect-diagnosis.svg)

Use the observed backend value to choose the next debugging branch.

**Explain it:** What request proves that the consumer refreshed the calculated total?

**Limit:** Consumer and metadata support are release-dependent; a valid backend side effect is not proof that every client processes it.

</details>

## ADV-08 State messages versus transition messages?

**Level:** Advanced

**Short answer:** A state message describes an invalid state of an instance and may persist in a supported draft scenario until revalidated. A transition message relates to the current operation or request. Use the appropriate state area and instance or field references and clear obsolete state correctly.

**Example and follow-up:** A missing mandatory date can remain highlighted while editing a draft. A successful one-time submission notification should not reappear forever as a stale state error.

**Avoid this mistake:** Every error should not be stored as a persistent state message, and REPORTED alone does not block saving.

**Read and verify this answer:**

- [SAP RAP state messages](https://help.sap.com/docs/abap-cloud/abap-rap/state-messages) - Compare persistent state-related messages with transition messages, instance identity and message invalidation.

<details>
<summary>Visual: Draft lifecycle</summary>

![Draft lifecycle](../visuals/draft-lifecycle.svg)

Follow edit, activate and discard for an existing active object, then explain how a new-object draft differs.

**Explain it:** What remains after discarding an edit draft? What if activation fails?

**Limit:** Schematic state transitions; draft actions and supported flows depend on the BO and consumer.

</details>

<details>
<summary>Visual: RAP message lifecycle and correction</summary>

![RAP message lifecycle and correction](../visuals/rap-message-lifecycle.svg)

Follow the same child through an error and correction instead of treating a message as timeless text.

**Explain it:** Which identity and state area would you inspect when the old error remains?

**Limit:** Message lifetime and permitted state-message scenarios depend on active/draft and the supported operation contract.

</details>

## ADV-09 Service definition versus binding and UI versus Web API?

**Level:** Core

**Short answer:** A service definition selects exposed entities and names. A binding attaches a protocol and service type, such as OData V4 UI or Web API. UI services support relevant UI semantics; Web APIs target programmatic consumers. Activation, local publication, authorization and deployment are separate concerns.

**Example and follow-up:** Choose the consumer first, then inspect generated metadata and test the actual endpoint. A local ADT preview is useful, but transport and production communication setup still need validation.

**Avoid this mistake:** VDM.viewType: #COMPOSITE neither creates nor activates a service binding.

**Read and verify this answer:**

- [SAP service binding documentation](https://help.sap.com/docs/abap-cloud/abap-rap/service-binding) - Check the supported RAP behavior and consumer/version contract.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## ADV-10 What must a custom query provider implement?

**Level:** Advanced

**Short answer:** A provider supplies data according to the requested query contract, including applicable filtering, ordering, paging, selected elements and total count. It should process only requested information and preserve authorization. Unsupported query options must be handled deliberately. Remote sources add latency, consistency and error-mapping concerns.

**Example and follow-up:** Handle data and total-count requests independently: a count-only request must not depend on a data-request branch. Compute count over the same authorized, filtered result before paging, and use deterministic ordering for data. A zero page size requests no rows; distinguish it from IF_RAP_QUERY_PAGING=>PAGE_SIZE_UNLIMITED. Do not accidentally translate zero into an unrestricted SQL read. Test count-only, empty-page and unlimited requests as well as ordinary pages.

**Avoid this mistake:** Returning any internal table is not a correct implementation of IF_RAP_QUERY_PROVIDER.

**Read and verify this answer:**

- [SAP: Implementing an Unmanaged Query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-unmanaged-query) - Check the supported request contract and target release. Scenario-specific bulk access and caching decisions still need their own correctness and performance evidence.
- [SAP: Requesting and Setting Data or Count](https://help.sap.com/docs/abap-cloud/abap-rap/requesting-and-setting-data-or-count-in-unmanaged-query) - Handle data and count requests independently. Apply the same authorization and filtering to both; test count-only requests.
- [SAP: Interface IF_RAP_QUERY_PAGING](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/c9e191cc92e54ca2bfec677037780c03.html?locale=en-us) - Distinguish offset, zero page size and PAGE_SIZE_UNLIMITED. The paging interface does not itself provide a cross-request snapshot.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ADV-11 How do RAP business events differ from ABAP Objects events?

**Level:** Advanced

**Short answer:** ABAP Objects events use event handlers within the ABAP execution context. RAP business events describe business occurrences under RAP's event contract; supported local or remote consumption has its own lifecycle. Remote enterprise events require configured infrastructure and transactional publication, with retry and idempotency designed explicitly.

**Example and follow-up:** Use an integration event after a request is durably submitted. A remote consumer should tolerate duplicate delivery and should not approve a request merely because it received an uncommitted local callback.

**Avoid this mistake:** Do not collapse every locally consumed RAP event into synchronous SET HANDLER semantics or promise universal ordering.

**Read and verify this answer:**

- [SAP: Develop Business Events](https://help.sap.com/docs/btp/fc4c71aa50014fd1b43721701471913d/e23776500eb8463f957134e682b76fba.html?version=202310.002) - Release-specific RAP event documentation. Check the event definition, publication and supported consumption contract on the target release; infrastructure and delivery semantics need separate verification.

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

## ADV-12 How do you extend an existing RAP BO safely?

**Level:** Advanced

**Short answer:** Inspect its released extension contract and supported extension points before adding fields or behavior. Check model, projection, metadata, authorization, save and service implications. Extension support depends on the BO and release; an accessible source object is not necessarily released for extension.

**Example and follow-up:** For an extra approval reference, verify persistence extension, exposure, validation, update behavior and consumer compatibility end to end. Test the standard flow without the new field as well.

**Avoid this mistake:** Being able to create a CDS extension does not prove every BO behavior or API contract is extensible.

**Read and verify this answer:**

- [SAP: RAP Extensibility Enablement](https://help.sap.com/docs/ABAP_Cloud/abap-rap/rap-extensibility-enablement) - Verify explicit extensibility enablement and the released extension contract for each affected layer on the target release.

## ADV-13 How do static and dynamic feature controls differ?

**Level:** Advanced

**Short answer:** Static restrictions are declared in the behavior definition, for example a readonly or mandatory field. Dynamic controls determine supported operation or field availability from global or instance context. They express business availability, while authorization remains separate. Check which controls the operation and target release support.

**Example and follow-up:** An approved request may dynamically forbid editing. A generated UUID may be statically readonly. Global and instance feature control cannot both be declared for the same operation; choose the applicable contract and implement its generated handler.

**Avoid this mistake:** A dynamic UI state does not prove security, and mandatory metadata does not replace all backend business validations.

**Read and verify this answer:**

- [SAP feature control](https://help.sap.com/docs/abap-cloud/abap-rap/feature-control) - Check the supported RAP behavior and consumer/version contract.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## Official references

- [SAP Learning on authorization](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks)
- [SAP service binding documentation](https://help.sap.com/docs/abap-cloud/abap-rap/service-binding)
- [SAP draft concept](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/understanding-the-draft-concept)
- [SAP RAP documentation](https://help.sap.com/docs/abap-cloud/abap-rap)
- [SAP operation augmentation](https://help.sap.com/docs/abap-cloud/abap-rap/operation-augmentation)
- [SAP action definitions](https://help.sap.com/docs/abap-cloud/abap-rap/action-definition)
- [SAP feature control](https://help.sap.com/docs/abap-cloud/abap-rap/feature-control)
- [SAP RAP side effects](https://help.sap.com/docs/abap-cloud/abap-rap/side-effects)
- [SAP RAP state messages](https://help.sap.com/docs/abap-cloud/abap-rap/state-messages)
