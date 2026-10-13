# RAP service design and advanced behavior

Use this segment for deeper follow-up questions. Connect each feature to a concrete requirement and explain its limits. Release-specific BDL syntax and UI behavior must be checked against the employer's ABAP and SAPUI5 versions.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## ADV-01 How do pessimistic locks and ETags complement each other?

**Level:** Core

**Short answer:** A lock stops conflicting processing while it is held. An ETag lets a write request check whether the data has changed since the client read it. They solve different problems and are often needed together. RAP declares the relevant lock and version handling in behavior. Draft scenarios also need total-ETag handling for relevant changes to active data.

**Reasoning and example:** Ana and Ben read order 4704 at quantity 2 with ETag V1. Ana saves quantity 3, producing ETag V2. Ben tries to save quantity 4 with his older V1. The If-Match check rejects that stale update, leaving quantity 3 intact. Ben must refresh and decide whether quantity 4 is still the change he wants. The ETag did not reserve the order while he was reading it.

A pessimistic lock addresses conflicting processing during the period it is held. Draft editing and changes to active data require the matching draft lock and total-ETag design. Test stale updates and draft resume behavior separately. A lock is temporary coordination; an ETag is a version check, and neither is an audit log.

**Avoid this mistake:** Locking and logging are different concepts; an ETag is not a log and does not reserve the object.

**Read and verify this answer:**

- [SAP draft concept](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/understanding-the-draft-concept) - Check which RAP behavior is supported by the target release and the client that calls it.

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

## ADV-02 What is the difference between global and instance authorization in RAP, and where do DCL and prechecks fit?

**Level:** Advanced

**Short answer:** Global authorization asks: may this user perform Update in general? Instance authorization asks: may this user update this particular record? Here, instance means a business-object record, not an ABAP class instance. DCL controls which rows a read returns. A precheck can reject incoming values before they enter the transactional buffer.

**Reasoning and example:** A user may change projects in Company Code 1000, but not 2000. The global check permits Update as an operation. The instance check permits project A in 1000 and rejects project B in 2000. A global pass is not permission to change every project.

The BDEF can declare authorization master ( global, instance ). get_global_authorizations receives requested_authorizations without record keys. get_instance_authorizations also receives keys and returns decisions identified by %tky. AUTHORITY-CHECK with BUKRS DUMMY ignores that field; the instance check instead supplies the existing project's CompanyCode.

Instance authorization checks existing data, not the new values submitted by the current request. For Create, or an Update that changes CompanyCode, check the proposed value in a precheck when that boundary needs protection. Otherwise, being allowed to edit a project in 1000 could be mistaken for permission to move it to 2000. CDS DCL remains responsible for read filtering.

Feature control has another job: availability under business rules. A closed project may be uneditable even for an authorized user. Test both an unauthorized user on an editable project and an authorized user on a closed project through the service, not only through disabled buttons.

**Avoid this mistake:** Global authorization, instance authorization, DCL, prechecks and feature control solve different problems. A global pass or disabled button does not secure every record or incoming value.

**Read and verify this answer:**

- [SAP: Authorization definition and prechecks](https://help.sap.com/docs/abap-cloud/abap-rap/2a26db5640364b46b843dca786c495d1.html?version=s4_hana) - Global checks are independent of an instance; instance checks use existing instance data; prechecks inspect incoming values.
- [SAP Learning: implementing authority checks](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Use CDS access control for reads and RAP authorization for operations. Instance checks do not replace a check of new input values.

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

**Short answer:** Where the behavior syntax supports it, authorization: none exempts that action from its RAP authorization checks. It does not make the whole service anonymous. Service authentication and checks inside called APIs can still apply. Use this only when the action's security design justifies the exemption. Do not add it simply to make an authorization error disappear.

**Reasoning and example:** Consider an action whose result is intentionally available to every authenticated user of that service and needs no object-specific permission. Its design may justify an explicit RAP authorization exemption. Document what data it reads or changes and why access at the service boundary is enough for that action.

If the action calls another API, that API may still check its own permissions and reject the call. Conversely, exempting a sensitive approval action can remove a necessary protection even when login is still required. Test with a user who can access the service but should not perform privileged work. Verify the exact syntax and supported action contract on the target release.

**Avoid this mistake:** Do not propose it as a universal fix for authorization errors or expose a sensitive action by accident.

**Read and verify this answer:**

- [SAP Learning on authorization](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Check which RAP behavior is supported by the target release and the client that calls it.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## ADV-04 Instance static and factory actions?

**Level:** Core

**Short answer:** An instance action works on an existing identified object, such as approving one request. A static action does not need an existing instance as its input target. A factory action creates instances and returns the required creation mapping. Choose the type that matches the business operation. Their input, result, and identity rules are different.

**Reasoning and example:** Approve needs a request to approve, so it is an instance action. A calculation preview may be a static action when it uses supplied input without needing an existing request. CopyRequest may be a factory action because its purpose is to create a new request and tell the caller which object was created.

Check the generated handler signature and return the result and mappings that the chosen action type requires. Returning $self from an ordinary instance action does not turn it into a factory action. Likewise, static describes how the RAP action is used; it is not permission to ignore the RAP transaction or treat the handler like an unrelated static utility method.

**Avoid this mistake:** Static does not mean a static ABAP method that can ignore RAP identity and response contracts.

**Read and verify this answer:**

- [SAP action definitions](https://help.sap.com/docs/abap-cloud/abap-rap/action-definition) - Check which RAP behavior is supported by the target release and the client that calls it.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## ADV-05 How do action parameters and results work?

**Level:** Advanced

**Short answer:** An action's behavior definition describes its input and result. A CDS abstract entity can define a structured input such as a comment and date. The generated handler receives that input and must return the declared result and response information. Result cardinality and instance binding matter. A UI can offer a parameter dialog only where the consumer supports it.

**Reasoning and example:** Suppose Submit accepts an approval comment. Define that parameter shape, declare it on the action, and use the generated handler signature to read it. The abstract entity describes the input fields; it does not itself contain or implement the action. The handler still carries out the business step under RAP's rules.

A different action, CalculatePreview, may return estimated totals without saving a new object. Its result type and cardinality should describe that outcome clearly. Test missing or invalid parameters and inspect what the caller actually receives. Do not assume that defining parameters guarantees the same input dialog in every client; metadata and consumer support determine the user experience.

A handler can receive several requested keys. Process all of them, collect failures and messages, and build the declared result for the successful requests. For an instance action returning [1] $self, the result identifies each successful source instance and places its returned entity data in %param. Updating a row and filling result are separate responsibilities; neither proves that the later save succeeded.

**Avoid this mistake:** Parameters are not defined by putting an action inside an abstract entity.

**Read and verify this answer:**

- [SAP action definitions](https://help.sap.com/docs/abap-cloud/abap-rap/action-definition) - Check which RAP behavior is supported by the target release and the client that calls it.

<details>
<summary>Visual: RAP hook responsibilities</summary>

![RAP hook responsibilities](../visuals/rap-hook-choices.svg)

Read each card as a separate design question; this is not an execution sequence.

**Explain it:** Where would you derive a total, reject an invalid input and implement Submit?

**Limit:** Check scenario and release support; do not rely on an undocumented ordering of independent hooks.

</details>

## ADV-06 What is augmentation and how does it differ from additional save?

**Level:** Advanced

**Short answer:** Augmentation changes or adds supported input at a RAP projection boundary before the underlying business object handles it. It helps adapt a particular consumer's input. Additional save performs extra persistence-related work in a suitable managed save scenario. These mechanisms run for different reasons. Neither is a general hook for arbitrary work before every save.

**Reasoning and example:** A specialized projection may accept input that needs to be translated into fields understood by the shared business object. A supported augmentation can make that translation so the underlying behavior receives the right changes. Check the projection's supported modifying operations and keep the core business rules in the appropriate underlying implementation.

Writing an audit record alongside the managed object's persisted changes is a different concern. It may require an additional-save design that follows the transaction rules. Putting it into augmentation just because that code runs during a modification confuses input handling with saving. Similarly, a virtual display field does not become persistent simply because an augmentation exists; design its supported data flow explicitly.

**Avoid this mistake:** Augmentation is not a generic before-save hook for copying every virtual element into a table.

**Read and verify this answer:**

- [SAP operation augmentation](https://help.sap.com/docs/abap-cloud/abap-rap/operation-augmentation) - Check which RAP behavior is supported by the target release and the client that calls it.

<details>
<summary>Visual: Augmentation versus additional save</summary>

![Augmentation versus additional save](../visuals/rap-augmentation-additional-save.svg)

Locate the input transformation and persistence supplement on the same conceptual timeline.

**Explain it:** Why would writing an audit row not make augmentation the right save hook?

**Limit:** The arrow is conceptual; availability, supported fields and trigger details depend on the target RAP release.

</details>

## ADV-07 What are side effects in a RAP UI?

**Level:** Advanced

**Short answer:** Side-effect metadata tells a supported UI what to read again after a change or action. For example, changing quantity may require refreshing the total and available actions. The backend must still calculate the correct values. Side effects only coordinate refreshes. Support depends on the backend release, service metadata, and SAPUI5 consumer.

**Reasoning and example:** The user changes an item's quantity from 2 to 3 at a unit price of 15 EUR. A backend determination changes the draft total from 30 EUR to 45 EUR, but the screen may still show 30 EUR until it reads that value again. Suitable side-effect metadata tells the UI that the quantity change affects the total and, where supported, related messages or permissions.

Check the actual network requests and displayed result after both field edits and actions, including draft processing. If the backend total is wrong, adding a refresh cannot fix the calculation. If the backend is correct but the UI stays stale, inspect the metadata and client support. A non-UI API caller does not automatically perform these extra reads just because the metadata exists.

**Avoid this mistake:** A side-effect declaration does not implement the calculation or force all non-UI consumers to issue extra reads.

**Read and verify this answer:**

- [SAP RAP side effects](https://help.sap.com/docs/abap-cloud/abap-rap/side-effects) - Check which field change or action triggers a refresh and what should be reread. Verify that the actual UI supports it.

<details>
<summary>Visual: Side effects and stale UI diagnosis</summary>

![Side effects and stale UI diagnosis](../visuals/rap-side-effect-diagnosis.svg)

Use the observed backend value to choose the next debugging branch.

**Explain it:** What request proves that the consumer refreshed the calculated total?

**Limit:** Consumer and metadata support are release-dependent; a valid backend side effect is not proof that every client processes it.

</details>

## ADV-08 State messages versus transition messages?

**Level:** Advanced

**Short answer:** A state message describes a problem in an object's current data, such as a missing required date. In supported draft scenarios it can remain until the state is checked again. A transition message describes the current operation or request. Attach messages to the correct instance, field, and state area. Clear old state messages when they no longer apply.

**Reasoning and example:** A user saves a draft without a delivery date. A state message can keep the date marked as invalid while the user continues editing. When the date is corrected and the relevant check runs again, handle the state area properly so the old error disappears. Otherwise the screen can show an error for data that is now valid.

A one-time message such as Submission completed belongs to the operation, not to a permanent invalid state. Test repeat edits, correction of errors, and a fresh request to avoid stale messages. Also remember that a message and rejection are different jobs: putting an error in REPORTED does not by itself guarantee that RAP rejects the save.

**Avoid this mistake:** Every error should not be stored as a persistent state message, and REPORTED alone does not block saving.

**Read and verify this answer:**

- [SAP RAP state messages](https://help.sap.com/docs/abap-cloud/abap-rap/state-messages) - Compare messages about the current object state with messages about one operation. Check which instance each message belongs to and how old state messages are cleared.

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

**Short answer:** A service definition chooses which entities and names are exposed. A service binding chooses the protocol and service type, such as OData V4 UI or Web API. UI services support relevant UI behavior; Web APIs serve programmatic consumers. Creating these objects is only part of delivery. Authorization, publication, communication setup, and deployment must also be handled.

**Reasoning and example:** Start with the caller: is it a Fiori elements app or an external integration? Expose the needed entities, choose a suitable binding, then inspect the generated metadata and exercise the actual operations. A service that reads correctly in an ADT preview has not yet proved that the production consumer can authenticate or call it.

Follow the target environment's deployment and communication setup, and test permissions with the intended user or communication identity. Confirm that transported objects and the real endpoint behave as expected. A CDS modeling annotation such as VDM.viewType: #COMPOSITE does not create or activate a binding. Model classification and service delivery are separate responsibilities.

**Avoid this mistake:** VDM.viewType: #COMPOSITE neither creates nor activates a service binding.

**Read and verify this answer:**

- [SAP service binding documentation](https://help.sap.com/docs/abap-cloud/abap-rap/service-binding) - Check which RAP behavior is supported by the target release and the client that calls it.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## ADV-10 What must a custom query provider implement?

**Level:** Advanced

**Short answer:** A custom query provider must answer what the caller actually asked for. That includes supported filters, sorting, paging, selected fields, and count, while enforcing permissions. A count request and a data request can arrive independently. Count the authorized, filtered result before paging. Treat zero rows requested differently from PAGE_SIZE_UNLIMITED, and use a stable sort order.

**Reasoning and example:** Lea asks for open orders in organization A, sorted by CreatedAt, skipping one and taking two. Of 12 source orders, four match both her permission and filter: 101, 104, 108 and 110. Use OrderID to break equal CreatedAt values. The page contains 104 and 108, while the total count remains 4. Keep that ordering stable so rows do not move unpredictably between pages. If a remote source is involved, map errors and account for its paging and consistency limits.

Test a count-only request separately; it must not depend on entering a branch that fetches data. Also test an empty page and a page size of zero. Zero means no rows, not an unrestricted read. Compare it explicitly with IF_RAP_QUERY_PAGING=>PAGE_SIZE_UNLIMITED. Handle unsupported options deliberately instead of silently returning a plausible but incorrect list.

**Avoid this mistake:** Returning any internal table is not a correct implementation of IF_RAP_QUERY_PROVIDER.

**Read and verify this answer:**

- [SAP: Implementing an Unmanaged Query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-unmanaged-query) - Check which query requests the target release supports. Test bulk reads and caching separately to prove their results are correct and their performance is acceptable.
- [SAP: Requesting and Setting Data or Count](https://help.sap.com/docs/abap-cloud/abap-rap/requesting-and-setting-data-or-count-in-unmanaged-query) - Handle requests for rows and requests for a count independently. Apply the same permissions and filters to both, and test a request that asks only for the count.
- [SAP: Interface IF_RAP_QUERY_PAGING](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/c9e191cc92e54ca2bfec677037780c03.html?locale=en-us) - Check offset, zero rows requested, and PAGE_SIZE_UNLIMITED separately. This interface does not by itself freeze the dataset across several requests.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ADV-11 How do RAP business events differ from ABAP Objects events?

**Level:** Advanced

**Short answer:** ABAP Objects events use handlers within ABAP execution. RAP business events describe business occurrences using RAP's event rules. Local and remote consumption have their own supported lifecycle. Sending events outside the system also needs configured infrastructure and a publication design tied to the transaction. Consumers should be prepared for retries and duplicate delivery rather than assuming exactly one arrival.

**Reasoning and example:** A request is submitted successfully, and another system needs to start follow-up work. Publish the business event through the supported transactional mechanism so the external process does not act on a change that later rolls back. A local callback during processing is not proof that the business change has been durably saved.

At the consumer, use the event's business identity and a suitable duplicate-handling design. If the same submission event is delivered again after a retry, it should not create a second approval task. Verify the supported ordering and delivery behavior instead of assuming it. Locally consumed RAP events also should not all be described as ordinary synchronous SET HANDLER callbacks.

**Avoid this mistake:** Do not collapse every locally consumed RAP event into synchronous SET HANDLER semantics or promise universal ordering.

**Read and verify this answer:**

- [SAP: Develop Business Events](https://help.sap.com/docs/btp/fc4c71aa50014fd1b43721701471913d/e23776500eb8463f957134e682b76fba.html?version=202310.002) - Check how the target release defines, publishes, and consumes RAP events. Verify the messaging infrastructure and its delivery and retry guarantees separately.

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

## ADV-12 How do you extend an existing RAP BO safely?

**Level:** Advanced

**Short answer:** First check what the business object officially allows you to extend on your system's release. Then use those supported extension points to add the field or behavior. Follow the change through storage, CDS, projection, service, and any UI metadata. Check permissions and saving too. Being able to see or edit an object's source does not mean SAP supports extending it.

**Reasoning and example:** Suppose the business wants an Approval Reference field on an existing request. Check the object's extension documentation first: can you add a stored field, expose it through the service, and add any needed rule? If one part is unsupported, adding only a CDS field will not deliver a working feature.

After implementing the supported changes, enter a value, save the request, and reopen it. Confirm the value is stored and returned by the service. Test invalid values, restricted users, and the normal process without the new field. Existing consumers must keep working. Extension support depends on the particular business object and release, so do not copy assumptions from a different RAP example.

**Avoid this mistake:** Being able to create a CDS extension does not prove every BO behavior or API contract is extensible.

**Read and verify this answer:**

- [SAP: RAP Extensibility Enablement](https://help.sap.com/docs/ABAP_Cloud/abap-rap/rap-extensibility-enablement) - Check that each layer you need to change is explicitly enabled and released for that kind of extension on the target release.

## ADV-13 How do static and dynamic feature controls differ?

**Level:** Advanced

**Short answer:** Static restrictions are declared in the behavior definition, such as a readonly field. Dynamic feature controls decide availability from current context, such as making approved requests uneditable. They describe business availability, not who has permission. Check the controls supported for the operation and release. For one operation, choose global or instance feature control; do not declare both.

**Reasoning and example:** A generated UUID should not be freely edited by the caller, so a static readonly declaration fits. The request description may be editable while the request is open but readonly after approval, which needs a state-dependent rule. Use the applicable generated feature-control handler to express the supported restriction.

Now test an API call as well as the screen. Permission checks must still prevent an unauthorized user from changing an otherwise editable request. Also validate the business data: mandatory field metadata is not a complete substitute for backend consistency rules. Keeping static restrictions, dynamic availability, authorization, and validation separate makes it easier to explain why a request was rejected.

Compare static field controls: readonly prevents consumer writes; readonly:update permits supplying the field on create but prevents later consumer updates; mandatory declares a required input for supporting consumers. Do not rely on a UI required marker alone to reject invalid persistence: implement the necessary backend validation. Dynamic features may make an operation unavailable for the current business state; authorization independently decides whether the caller is allowed.

**Avoid this mistake:** A dynamic UI state does not prove security, and mandatory metadata does not replace all backend business validations.

**Read and verify this answer:**

- [SAP feature control](https://help.sap.com/docs/abap-cloud/abap-rap/feature-control) - Check which RAP behavior is supported by the target release and the client that calls it.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## ADV-14 What is a normal RAP function, and when should you use it instead of an action?

**Level:** Advanced

**Short answer:** A RAP function returns data or a calculation without changing the business object. Use it to preview an order total, for example. It runs in a FOR READ handler and returns the value in result. It must not update the buffer, save data or trigger a business side effect. Use an action when the operation should change business state.

**Reasoning and example:** Suppose an order has Quantity 3 and UnitPrice 10. A PreviewTotal function reads the current values through EML and returns Amount 30. The caller sees the calculation, but the order is not changed or saved. If the user changes Quantity to 4 in the same transaction, a new preview can return 40. Read the transactional state rather than assuming the database already contains that edit.

A normal instance function receives the selected instance keys. Its result links each input %tky to the calculated %param. Return a result for each successful input and a FAILED response for a rejected one. A static function is the variant that does not require an existing instance; it uses request correlation such as %cid. Static does not mean background processing.

Declare the function in the BDEF and expose it with use function in the projection when the service needs it. Read-only does not mean public: configure and test the applicable authorization and feature controls. A function must not send an approval email, call a remote posting operation or create new state messages. Check result types, cardinalities, binding and client support on the target release. This RAP function is not an ABAP function module.

**Avoid this mistake:** Do not implement a preview by changing the BO and then trying to undo it. A function returns a result; a determination changes derived BO data, and an action can perform a business change.

**Read and verify this answer:**

- [SAP: RAP function definition](https://help.sap.com/docs/abap-cloud/abap-rap/function-definition) - Read-only behavior, instance versus static, authorization and result support.
- [SAP: FOR READ handler method](https://help.sap.com/docs/abap-cloud/abap-keyword/for-read-rap-handler-method) - FOR FUNCTION input, result and FAILED/REPORTED response contracts.

## ADV-15 How does a default function suggest values for RAP action parameters?

**Level:** Advanced

**Short answer:** A default values function proposes initial input for an action dialog. It does not execute the action. For example, opening ApplyDiscount can suggest 10 percent for a large order and 5 percent for a small one. The user can edit the suggestion. When the action is finally called, validate the submitted value again.

**Reasoning and example:** Attach a default function to the action declaration, for example GetDefaultsForApplyDiscount. Its name follows the GetDefaultsFor convention. RAP derives its input and result types from the operation; generate the handler in ADT rather than inventing a separate parameter contract. For an instance action, preserve each input %tky and fill the suggested parameter fields in %param. If a projection exposes the action, expose the default function there too.

Example: order A totals 1200 EUR and order B totals 200 EUR. A simple teaching rule suggests DiscountPercent 10 for A and 5 for B. The default function reads both orders and returns those suggestions; it does not change either order. A user then enters 80 instead of 10. The action must check its allowed discount range and permissions and reject 80 if the rule forbids it.

The supporting UI requests the default values before execution. A direct API caller can supply different input or skip the default request, so defaults are not an enforcement mechanism. A default can also become outdated before the action runs. Test multiple selected instances, missing keys, a cancelled dialog and invalid submitted values. Check backend release, OData binding and Fiori elements support rather than assuming every client opens the same dialog.

**Avoid this mistake:** Do not confuse an input suggestion with a saved field value, determination or validation. Opening or cancelling the dialog must not perform the action.

**Read and verify this answer:**

- [SAP: defaulting input parameters for operations](https://help.sap.com/docs/abap-cloud/abap-rap/defaulting-input-parameters-for-operations) - Default function declaration and handler. Check availability in the target release.
- [SAP sample: default values functions for Fiori elements](https://github.com/SAP-samples/abap-platform-fiori-feature-showcase/blob/main/01_general_features.md#default-values-function) - Shows BDEF, projection exposure and filling %param.

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
