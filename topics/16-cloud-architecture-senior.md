# Senior ABAP Cloud architecture decisions

Treat each question as a design review: state the business invariant, choose a boundary, explain the rejected alternative, and name the evidence that would validate the decision. ABAP Cloud is the main development model here; deployment, API scope, and operational constraints still differ across SAP products. These scenarios demand decisions and verification rather than memorized framework definitions.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## CLOUD-01 A new approval extension needs immediate document validation and an external supplier portal. Would you put everything on-stack or on BTP?

**Level:** Senior

**Short answer:** Keep the document check where it can reject the document before saving, using a supported local extension point. The supplier portal can be a separate BTP app if its users and release cycle justify that. Connect them through released remote interfaces. Make pending and failed steps visible. Choose based on timing, APIs, permissions, and recovery rather than putting everything in one place.

**Reasoning and example:** Suppose every internal posting waits for a live response from the supplier portal. A network outage can now stop all postings, even when the core document itself is valid. If the business permits it, save a valid submission locally and let the portal interaction happen afterward through a reliable integration process.

The user then needs to see whether the request is waiting, accepted, or failed. Track retries with a stable request identity and decide what withdrawal means after submission. Some rules must still reject the local document immediately, so keep those at a suitable supported local point. A separate application does not make remote work part of the same database transaction.

**Avoid this mistake:** Deploying side-by-side does not make synchronous cross-system validation atomic or automatically clean-core compliant.

**Interviewer follow-ups:**

- Which business rule must be checked before the core document is committed?
- How does the user recover when the portal accepts a request but the core system is unavailable?

**Strong answer criteria:**

- Explains which business steps run in which system
- Compares response time and independent release needs
- Explains recovery when only part of the process succeeds

**Verification evidence:** An architecture decision record, target API availability checks, and a failure-sequence test showing pending, retry, and withdrawal outcomes.

**Read and verify this answer:**

- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

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

## CLOUD-02 A stakeholder says ABAP Cloud means moving the existing application to SAP BTP ABAP environment. How would you correct the proposal?

**Level:** Senior

**Short answer:** ABAP Cloud is a development model, not just a place to run code. It uses restricted language versions, released APIs, and models such as RAP on supported S/4HANA systems and SAP BTP ABAP environment. Moving to BTP is a separate decision. Check the data, business APIs, connectivity, and operational responsibilities available there before promising that an existing app will move unchanged.

**Reasoning and example:** A class currently reads sales data through a local S/4HANA interface. In a BTP ABAP system, the same business data and local interface may not exist. The new application might need a remote service, a supported replication design, or a different owner for that information. Valid ABAP syntax alone does not solve that difference.

List the application's dependencies and map each to an available target capability. Try the most important integration with realistic input before estimating the move. This separates two questions: can the code follow ABAP Cloud's rules, and is the proposed runtime the right place for the application? Both need evidence, even though they are often discussed together.

**Avoid this mistake:** Cloud-compatible syntax does not establish identical application content, API availability, or deployment portability.

**Interviewer follow-ups:**

- Which dependencies become remote after the move?
- What target-system evidence would you require before estimating migration?

**Strong answer criteria:**

- Distinguishes model from runtime
- Identifies lost data locality
- Checks product-specific capabilities

**Verification evidence:** A list of target-system capabilities mapping each dependency to a supported local or remote replacement, plus a tested integration example.

**Read and verify this answer:**

- [SAP ABAP Cloud development model](https://help.sap.com/docs/abap-cloud/abap-cloud-background-concepts-and-overview/abap-cloud-development-model) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## CLOUD-03 A developer proposes dynamic calls to an unreleased SAP class because static ABAP Cloud checks reject it. What do you do?

**Level:** Senior

**Short answer:** Do not hide an unsupported dependency behind a dynamic call. Check the object's actual release state and look for a released alternative, supported extension point, or remote API on the target version. Revisit standard functionality if needed. An allowed classic boundary may be an option in a suitable private-edition landscape. It must be explicit and governed, not disguised as ABAP Cloud compliance.

**Reasoning and example:** A dynamically named class call may escape a superficial scan but still fail after an upgrade. The language or runtime may also reject it. Demonstrating that the call worked once does not prove that SAP supports the dependency or will keep its behavior stable.

Write down the exact capability that is missing and test supported alternatives with representative input. Where a classic exception is permitted, isolate it, identify its risk and owner, and keep the implementation within the product's actual rules. Public-edition restrictions do not disappear because another landscape allows classic development. An ATC suppression changes what is reported; it does not create a release contract for the object.

**Avoid this mistake:** An ATC suppression or dynamic name does not create a supported API contract.

**Interviewer follow-ups:**

- What options remain in Public Edition when no released extension exists?
- How would you track an API gap without blocking unrelated delivery?

**Strong answer criteria:**

- Rejects hidden dependency bypass
- Verifies target-specific alternatives
- Separates private-edition exceptions from public-cloud rules

**Verification evidence:** ADT API-state evidence, a documented capability gap, and a decision record showing supported alternatives and any approved bounded exception.

**Read and verify this answer:**

- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CLOUD-04 Two teams want independent releases but share pricing helpers and persistence types. How would you structure packages and software components?

**Level:** Senior

**Short answer:** Give shared code a clear owner and a small, stable interface. Packages organize code and access; software components also affect delivery and lifecycle dependencies. Keep private database types with their owning component. Avoid circular dependencies and define delivery order. Supported component relations can allow targeted access, but access permission alone does not promise that an interface will stay compatible.

**Reasoning and example:** Two teams say they can release independently, but each uses the other's database row types. A field change can then require both components to activate together. Replacing those types with a narrow pricing request and result reduces the number of changes that callers must follow. The shared pricing capability also needs an owner and compatibility tests.

If that interface is still changing frequently, coordinated releases may be the honest choice for now. Creating more components does not itself remove the dependency. Document the direction of calls, permitted component access, and import order. Check that a provider change still supports previously delivered consumers before describing the components as independently releasable.

**Avoid this mistake:** More software components do not create independent lifecycles when their dependencies still require lockstep delivery.

**Interviewer follow-ups:**

- When would you choose a component relation instead of a C1 API?
- How would an incompatible dependency removal be detected?

**Strong answer criteria:**

- Shows which component depends on which
- Distinguishes permission to call an interface from a promise of compatibility
- Matches component boundaries to how releases actually work

**Verification evidence:** A dependency graph without cycles, explicit component relations, a transport/import sequence, and compatibility checks against the prior delivered API snapshot.

**Read and verify this answer:**

- [SAP software component dependencies and API snapshots](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-component-dependencies) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.
- [SAP software component organization and lifecycle boundaries](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-components) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

## CLOUD-05 The same business capability is exposed through a local released API and a remote service. Which should an on-stack application consume?

**Level:** Senior

**Short answer:** Compare what the two APIs actually do. A suitable local API avoids network calls and may fit the supported local transaction. A remote API has its own identity, failures, and transaction boundary. They may expose different operations despite similar names. Choose the contract that fits permissions, timing, and saving; do not assume local and remote access are interchangeable.

**Reasoning and example:** Calling the same SAP system through HTTP from a save routine can open another session. That session may compete for locks or commit separately, which makes a simple-looking self-call difficult to reason about. Check whether a suitable released local operation can be used in the required RAP phase instead.

On the other hand, a local read interface does not replace a remote command just because both concern purchase orders. Compare the operation, authorization, and failure behavior, then test concurrent use. A C1 local-use contract and a C2 remote-use contract authorize different kinds of consumption. If the caller may later move to BTP, keep that future network boundary in mind without pretending it already has local transaction guarantees.

**Avoid this mistake:** C1 local consumption and C2 remote consumption are different purposes; one release contract does not authorize the other.

**Interviewer follow-ups:**

- Can the chosen local command participate in this RAP save phase?
- What changes if the consumer moves to BTP next year?

**Strong answer criteria:**

- Compares full contracts
- Recognizes self-call transaction risks
- Plans a replaceable consumption boundary

**Verification evidence:** Documented local and remote API contracts plus a transaction and authorization test for the chosen consumption path.

**Read and verify this answer:**

- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

<details>
<summary>Visual: Release contracts versus Clean Core levels</summary>

![Release contracts versus Clean Core levels](../visuals/senior-contracts-versus-levels.svg)

The two tables are separate classification axes. C1 identifies a local-use contract, while Level C identifies internal-object exposure in the Clean Core assessment context.

**Explain it:** What else must you verify after finding a C1 release flag, and why does a wrapper not erase the underlying exposure?

**Limit:** These are the three contracts requested for this comparison, not the complete release-contract catalogue. Exact object classification, extension technology, target edition, and ATC scope remain decisive.

</details>

## CLOUD-06 A CDS object compiles in the development system but fails after delivery to an older supported release. How would you prevent recurrence?

**Level:** Senior

**Short answer:** Define the products and releases the application supports before choosing features. Check CDS syntax, provider contracts, bindings, language rules, and released APIs on those targets. Test the lowest supported release. When a feature is unavailable, choose a compatible design, raise the minimum supported version explicitly, or maintain a separate variant. Activation on the development system proves only that system works.

**Reasoning and example:** A developer copies a projection example from current documentation. It activates locally, but an older delivery target does not support its provider contract. The transport fails before anyone can test the screen. Checking only the ABAP class would not have caught the CDS and service dependency.

Build a small compatibility test containing the related CDS, behavior, and service artifacts and execute a representative request on the lowest target. Record which features and API releases are available there. Keep broadly reusable business contracts separate from newer delivery features where that helps. Do not silently change the supported release promise after development; the design and support policy need to agree.

**Avoid this mistake:** An object being active in development does not prove compatibility with every product edition or supported transport target.

**Interviewer follow-ups:**

- Where would you document the minimum feature level?
- Which differences justify a versioned implementation rather than a shared code path?

**Strong answer criteria:**

- Sets a concrete support matrix
- Tests the lowest supported release
- Includes dependent repository artifacts

**Verification evidence:** A versioned compatibility matrix, target activation evidence, and service tests tied to the exact supported release and delivery revision.

**Read and verify this answer:**

- [SAP ABAP Cloud development model](https://help.sap.com/docs/abap-cloud/abap-cloud-background-concepts-and-overview/abap-cloud-development-model) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.
- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## CLOUD-07 Should a request, its approval history, and an external purchase order be one RAP business object?

**Level:** Senior

**Short answer:** Put data in one RAP business object when it has shared ownership, lifecycle, and rules that must hold in one transaction. Request items may belong to their request. Approval history may need separate retention rules. An external purchase order has another owner and transaction, so usually reference it through an API. Screen layout alone should not decide the composition tree.

**Reasoning and example:** Deleting a request should not accidentally remove approval evidence that the business must retain. It also cannot safely cascade a database deletion into another system's purchase order as if both were local rows. Define cancellation, retention, and external failure outcomes before drawing the composition hierarchy.

The opposite mistake is separating request lines that must be checked and locked together. That can make a simple total rule difficult to enforce consistently. Write down which facts must always agree at save time and who owns each piece of data. Keep tightly related local data together where appropriate, and use an explicit workflow or reconciliation process for relationships that cross system boundaries.

**Avoid this mistake:** A composition relationship is not a convenient visual grouping and cannot provide atomicity across an external system.

**Interviewer follow-ups:**

- Which business rule requires the changes to commit together?
- How do retention and cancellation rules affect which entities belong in the composition?

**Strong answer criteria:**

- Starts with the business rules that must always hold
- Identifies data ownership and retention needs
- Explains how separate systems stay consistent

**Verification evidence:** A list of business rules, allowed states and transitions, and reasons for the composition design, with deletion, cancellation, and remote-posting failure tests.

**Read and verify this answer:**

- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: CDS links and ownership</summary>

![CDS links and ownership](../visuals/cds-relationships.svg)

Items belong to the order BO; a partner reference crosses to an independently managed object.

**Explain it:** What breaks if a declared to-one relationship actually returns two partners?

**Limit:** Composition semantics and generated operations still require the corresponding RAP model.

</details>

## CLOUD-08 A partner wants one ABAP solution to serve several customers. What isolation questions must be answered before calling it multitenant?

**Level:** Senior

**Short answer:** First verify the runtime's supported multitenancy model. Separate each customer's data and access across storage, configuration, caches, jobs, logs, and outbound connections. Automatic client handling covers only part of this. Define onboarding, upgrades, and offboarding too. Prove the boundary with tests where one tenant tries to read or affect another; a tenant column alone is not enough.

**Reasoning and example:** Two customers both have document number 100. If a shared cache uses only that number as its key, it may return the wrong customer's result where the runtime scope allows reuse. Database queries can be correctly restricted while the cache still leaks information. An outbound connection selected from the wrong tenant context can cause a similar problem.

Use the supported tenant context throughout the design and separate provider administration from customer permissions. Test background jobs and resources that live longer than one request. During offboarding, confirm that access and the intended data are removed without affecting another customer. Calling the solution multitenant requires this broader isolation evidence, not only a successful two-client database query.

**Avoid this mistake:** Adding a tenant field or relying on automatic client filtering alone does not establish complete multitenancy isolation.

**Interviewer follow-ups:**

- Which caches or jobs outlive one request?
- How do you prove offboarding removes access without damaging another tenant?

**Strong answer criteria:**

- Covers non-database isolation paths
- Uses supported tenant context
- Includes tenant lifecycle operations

**Verification evidence:** A tenant-boundary threat model, two-tenant negative integration tests, and an onboarding/offboarding runbook validated in the target runtime.

**Read and verify this answer:**

- [SAP ABAP development and multitenancy guidance](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/abap-development) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## CLOUD-09 A business team requests a new field, a rule, and a custom app. How do you decide between configuration, key-user, and developer extensibility?

**Level:** Senior

**Short answer:** Break the request into the field, rule, and application needs. Check standard configuration first, then supported key-user options. Use developer extensibility for requirements those options cannot meet safely. Verify where the field must appear and when the rule must run. Keep meaning, permissions, transport, and ownership consistent across the chosen mechanisms instead of rebuilding everything in custom code.

**Reasoning and example:** The new field must appear in a standard form, an API, and analytics. A supported key-user business context may already provide those publication paths. Creating a field in a separate custom table does not automatically connect it to them. Try the exact propagation on the target system before choosing the implementation.

The rule may fit a supported key-user hook if its data and execution limits match. Complex orchestration might need developer code instead. Assign an owner for changes to business-maintained rules and test their permissions and transport behavior. The right choice follows the requirement; key-user tooling is not inherently less serious, and developer tooling is not a reason to duplicate existing configuration.

**Avoid this mistake:** Key-user extensibility is not inherently less serious engineering, and developer extensibility is not a reason to duplicate standard configuration.

**Interviewer follow-ups:**

- Who owns a rule that business users can change?
- How will the field reach the required integration and output artifacts?

**Strong answer criteria:**

- Checks standard options for each part of the requirement
- Checks where the field appears and what the extension hook allows
- Names who maintains and delivers each extension

**Verification evidence:** A requirement-to-extension matrix and a target-system demonstration of field propagation, rule authorization, and transport behavior.

**Read and verify this answer:**

- [SAP extensibility approaches and target environments](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## CLOUD-10 Can you expose the same RAP projection to a Fiori UI and long-lived external consumers?

**Level:** Senior

**Short answer:** Reuse the business model where it makes sense, but protect external consumers from routine UI changes. A Fiori UI may need draft and feature controls; an integration needs a stable API, paging, retry rules, and communication setup. Separate projections or services can support those different needs. Check the available binding features and test both consumers against the same business rules.

**Reasoning and example:** A UI team removes a property it no longer displays. If a nightly integration uses the same uncontrolled service contract, that harmless screen change can break the job. A draft-based editing process may also be a poor fit for an external command that expects a final posting result.

Define which fields and operations each consumer can rely on, and keep shared business checks in the common implementation where appropriate. Record service metadata and run compatibility tests before changes. For a breaking external change, provide an explicit version or migration path and deprecation policy. Generating an OData endpoint for a UI is not the same as committing to a durable external API contract.

**Avoid this mistake:** An OData endpoint generated for a UI is not automatically a released, durable integration contract for external systems.

**Interviewer follow-ups:**

- Which behavior should be shared and which should be projected differently?
- How would you introduce a breaking external-contract change?

**Strong answer criteria:**

- Separates consumer contracts
- Preserves shared business rules
- Addresses external API lifecycle

**Verification evidence:** Service metadata baselines, UI and integration contract tests, and documented compatibility and deprecation rules.

**Read and verify this answer:**

- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

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

## CLOUD-11 A released CDS view contains all required fields. Why might it still be unsuitable for implementing a business command?

**Level:** Senior

**Short answer:** A released read view lets you read data; it does not automatically let you change that business object. Find the supported command API and check its permissions, locks, validation, and save rules. Do not update underlying tables because their fields are visible in a query. If no suitable command exists, revisit the process or record an API gap.

**Reasoning and example:** A view exposes a purchase order's approval status. Updating that status directly in the database may appear to approve the order, while skipping change history, outputs, follow-on checks, or related state. The field is part of a larger business operation, not simply a value that any reader may change.

Use a supported command and test both acceptance and rejection. Also consider a change made after your initial read: the command needs the correct concurrency handling rather than trusting an earlier status forever. If the released interface does not provide the required command, document that limitation. A useful read model cannot grant write ownership over its provider's persistence.

**Avoid this mistake:** A released read API does not release its underlying tables for mutation or guarantee that its fields form a write contract.

**Interviewer follow-ups:**

- How would you handle a query result that becomes stale before the command?
- What evidence distinguishes a supported command from a database shortcut?

**Strong answer criteria:**

- Separates query and command semantics
- Preserves provider ownership
- Handles stale reads and concurrency

**Verification evidence:** The command API's release and behavior documentation, plus concurrent-change and validation-failure tests.

**Read and verify this answer:**

- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

## CLOUD-12 A large classic application cannot be replaced in one release. How would you introduce ABAP Cloud without creating two inconsistent applications?

**Level:** Senior

**Short answer:** Move one clear business capability at a time and keep one authoritative owner for each business state. Define how old and new callers are routed, how identifiers stay consistent, and how results are reconciled. A governed classic boundary may support coexistence in a suitable landscape. Avoid uncontrolled writes from both paths. Give the temporary bridge explicit retirement criteria.

**Reasoning and example:** The old report and the new RAP app both update the same document through different rules. Users can now reach states that one application accepts and the other rejects. A safer first step may change the screen or read path while both versions still use the same approved posting owner.

Plan when write ownership changes, how traffic is routed, and how you can reverse the cutover if needed. Compare results and reconcile records before retiring the old path. Set a measurable condition for removing the temporary adapter so it does not become an ownerless permanent platform. A RAP screen alone does not prove that the legacy posting transaction behind it now follows ABAP Cloud rules.

**Avoid this mistake:** Using RAP for the new UI does not by itself modernize or validate the legacy posting transaction behind it.

**Interviewer follow-ups:**

- Which system owns writes during each transition phase?
- What objective condition lets you remove the bridge?

**Strong answer criteria:**

- Defines one authoritative writer
- Plans coexistence and cutover
- Sets retirement criteria

**Verification evidence:** A phased ownership map, routing and rollback plan, reconciliation results, and an explicit bridge-removal milestone.

**Read and verify this answer:**

- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

## CLOUD-13 A shared custom API is widely used but has no named owner. What would you change before accepting another dependency on it?

**Level:** Senior

**Short answer:** Name an owner before adding more consumers. That owner must maintain the API's meaning, compatibility, security, operations, and support policy. Find existing callers and record current behavior. Choose an appropriate release or component-access mechanism and explain the limits to users of the API. A technically callable object is not a reliable shared service without those responsibilities.

**Reasoning and example:** A shared pricing helper changes its rounding rule without changing a parameter. Every caller still compiles, but invoice totals now differ. The API owner needs to treat that as a behavior change and assess it with consumers, not declare compatibility because the ABAP signature stayed the same.

Capture examples for amounts, units, exceptions, and transaction assumptions, then use them as regression checks. Inventory remote or external consumers too; a local where-used list may not show them all. Set a change-notification and support process. If no team can sustain that responsibility, do not advertise the helper as independently reusable infrastructure merely by making it public or setting a release flag.

**Avoid this mistake:** Public visibility or a C1 release flag does not replace accountable ownership and semantic compatibility testing.

**Interviewer follow-ups:**

- Who approves a behavioral change without a signature change?
- How do you discover consumers outside the local where-used list?

**Strong answer criteria:**

- Names who maintains the API promise
- Tests behavior as well as signatures
- Finds the real consumers

**Verification evidence:** An API owner record, consumer inventory, support policy, and executable consumer-contract examples tied to a released baseline.

**Read and verify this answer:**

- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## CLOUD-14 A released BAdI exists, but it runs after the point where the requirement must reject a transaction. Is it still the right extension?

**Level:** Senior

**Short answer:** A released extension point can still run at the wrong time for your rule. Check when it executes, what data it sees, what it may change, and how it can reject work. If the rule must prevent saving, use a supported point that can do that. Otherwise revise the process; reporting an error after commit cannot undo the document.

**Reasoning and example:** The business says that an invalid approval reference must prevent document creation. You find a released notification BAdI that runs after saving. Raising a message there cannot turn the already committed creation into a rejected save. A later reversal is a separate business operation, with its own history and possible downstream effects.

Map the actual transaction phases and inspect the extension contract before choosing the hook. Test invalid input, rollback, and update failure on the target system. If no suitable preventive hook exists, discuss another supported design with the business. A familiar method name or released status proves neither the required timing nor permission to change the transaction's outcome.

**Avoid this mistake:** A released extension point can still be the wrong place for a particular business rule.

**Interviewer follow-ups:**

- What data and modifications does the BAdI contract actually permit?
- Would compensating after save meet the same business requirement?

**Strong answer criteria:**

- Checks hook timing and permissions
- Distinguishes prevention from compensation
- Validates behavior with failures

**Verification evidence:** A transaction-phase map, the extension-point contract, and a target-system test proving when rejection or follow-up occurs.

**Read and verify this answer:**

- [SAP extensibility approaches and target environments](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## CLOUD-15 Your domain classes depend on Gateway messages, SQL row types, and HTTP clients. How would you improve the architecture without a wholesale rewrite?

**Level:** Senior

**Short answer:** Extract one business decision behind a small, clear input and result. Keep HTTP, database, and framework-specific mapping in adapters around it. Preserve existing callers and transaction ownership while making the change. This lets you test the rule without rebuilding the whole application. Adding wrapper classes helps only if the business logic actually stops depending on infrastructure details.

**Reasoning and example:** An eligibility calculation currently reads an HTTP request and creates Gateway messages directly. Let it instead receive the needed business values and return an eligibility decision with a clear reason. An adapter can translate that result into RAP messages or an integration response. Persistence and communication remain separate collaborators rather than hidden work inside the rule.

Before extracting it, capture cases for rounding, missing data, and failures so existing behavior stays protected. Move one responsibility at a time and rerun the real integration acceptance tests. Do not move commits or change the caller's transaction expectations accidentally. A new class per framework object adds little value if every supposedly reusable method still exposes framework types.

**Avoid this mistake:** Wrapping every framework call in another class adds layers without isolating business policy if framework types still dominate the contract.

**Interviewer follow-ups:**

- Which extraction has the lowest transaction risk?
- What should remain in the RAP behavior implementation?

**Strong answer criteria:**

- Separates one clear business responsibility
- Preserves callers and transaction ownership
- Tests observable behavior before and after the change

**Verification evidence:** A bounded before/after dependency map and passing business-policy tests plus unchanged integration acceptance results.

**Read and verify this answer:**

- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: OO interfaces and dependency injection</summary>

![OO interfaces and dependency injection](../visuals/classic-oo-plug-contract.svg)

The service depends on a repository contract. Production and test implementations fit the same socket; the composition boundary supplies the appropriate collaborator.

**Explain it:** Which object chooses the implementation, and what does a double-based test fail to prove?

**Limit:** The plug is a design metaphor, not a SAP connector or code signature. Injection does not itself guarantee a good abstraction or production integration.

</details>

## CLOUD-16 A side-by-side service needs to act for users and also run scheduled reconciliation. Would you use one technical identity for both?

**Level:** Senior

**Short answer:** Treat user requests and unattended jobs as different access needs. Choose supported communication scenarios, authentication, and permissions for each. Use separate identities or scopes when required by those needs. Record who initiated a business action and plan credential rotation and tenant selection. One broad technical identity can give interactive users more access than they should have.

**Reasoning and example:** A reconciliation job may legitimately read documents across many business areas. A person using the portal should see only their permitted documents. If the portal forwards every request using the job's broad identity without the required authorization design, the UI can accidentally expose that wider access to every user.

Using a person's short-lived credentials for a nightly job creates a different problem: the job may stop when those credentials expire. Define the supported user-delegation and machine-to-machine flows separately. Test denied access, audit attribution, rotation, and tenant offboarding. Successful authentication proves which identity connected; it does not prove that the requested operation or tenant is allowed for that identity.

**Avoid this mistake:** Authentication success proves identity, not permission for the requested business operation or tenant.

**Interviewer follow-ups:**

- Where is the initiating user recorded when a technical identity performs the command?
- What happens during credential rotation or tenant offboarding?

**Strong answer criteria:**

- Separates user and machine access
- Preserves business authorization
- Plans identity lifecycle and audit

**Verification evidence:** A communication and authorization matrix with negative access tests, audit examples, and a credential-rotation test.

**Read and verify this answer:**

- [SAP communication arrangements and scenarios](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/communication-arrangements) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

## CLOUD-17 A released dependency is deprecated but still works. How do you decide when and how to replace it?

**Level:** Senior

**Short answer:** Deprecated means an API should be replaced according to its lifecycle guidance, not necessarily that it has already stopped working. Check the successor, support limits, affected callers, and supported target releases. Compare behavior as well as names and parameters. Plan tests, rollout, and monitoring before switching. Avoid adding unnecessary new dependencies on an API already scheduled for replacement.

**Reasoning and example:** A successor serves the same business purpose but returns different keys and uses another paging model. A mechanical method-name replacement may miss records or duplicate work. It might also change permissions or return a pending result where the old API completed synchronously. Test those differences with representative consumers and failure cases.

Check whether the successor exists on the lowest supported release. If not, the transition may require a deliberate compatibility path or a support-policy decision. Roll out with clear success measures and a supported way to reverse the change if needed. Keep old and new behavior visible until migration is complete, then remove the old dependency and its maintenance burden.

**Avoid this mistake:** A release contract does not mean an API never evolves, and deprecation is different from decommissioning.

**Interviewer follow-ups:**

- What if the successor is unavailable on your lowest supported release?
- Which semantic differences would block a direct replacement?

**Strong answer criteria:**

- Distinguishes deprecated from removed
- Checks the replacement behavior and target availability
- Plans migration with measurable results

**Verification evidence:** A dependency lifecycle register, old/new contract comparison, and regression results across the supported release matrix.

**Read and verify this answer:**

- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: RAP release and consumption gates</summary>

![RAP release and consumption gates](../visuals/rap-release-gates.svg)

Review eligibility, behavior and delivery as separate evidence gates.

**Explain it:** Which gate would catch an API-compatible change that breaks deployment configuration?

**Limit:** A teaching checklist; exact release contracts, component visibility and delivery tools depend on the product.

</details>

## CLOUD-18 What would you require before approving a senior team's ABAP Cloud architecture for production?

**Level:** Senior

**Short answer:** Require evidence that the main business rules, permissions, transaction boundaries, and recovery paths work on the intended runtime. Check released dependencies, realistic workload, monitoring, retention, and deployment order. Give important assumptions an owner and a test result. Distinguish a prototype from a production-tested solution. Remaining risk can be accepted deliberately, with practical controls and clear responsibility.

**Reasoning and example:** A Fiori demo using mocked data looks convincing, but it cannot prove real RAP locking or permissions. Walk through a concurrent update, a dependency outage, a failed deployment, and a recovery exercise on the relevant environment. Link each result to the actual release candidate so old evidence is not mistaken for proof of new code.

Focus effort on failures that would harm the business rather than collecting diagrams alone. Confirm who monitors failures, who can retry safely, and how data remains consistent during recovery. A green syntax check or ATC run supports the review but cannot replace these checks. Production approval should state what was demonstrated and which controlled risks remain.

**Avoid this mistake:** A clean syntax check, green ATC run, or attractive diagram is not an end-to-end production-readiness certificate.

**Interviewer follow-ups:**

- Which risk would you prove first with a technical spike?
- What evidence would make you delay the release despite a successful demo?

**Strong answer criteria:**

- Tests the risks with the greatest consequences first
- Links evidence to the real runtime and source version
- Defines who operates the app and how it recovers

**Verification evidence:** A release review for the exact source version, including focused workload, permission, transaction, deployment, and recovery test results.

**Read and verify this answer:**

- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility) - Use the documented rules to check the design choice. Confirm that the required option exists on the target product.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## Official references

- [SAP ABAP Cloud development model](https://help.sap.com/docs/abap-cloud/abap-cloud-background-concepts-and-overview/abap-cloud-development-model)
- [SAP extensibility approaches and target environments](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility)
- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility)
- [SAP released APIs, contracts, visibility, and states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis)
- [SAP software component dependencies and API snapshots](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-component-dependencies)
- [SAP software component organization and lifecycle boundaries](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-components)
- [SAP communication arrangements and scenarios](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/communication-arrangements)
- [SAP ABAP development and multitenancy guidance](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/abap-development)
