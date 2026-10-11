# ABAP quick revision

Use these questions for the final review. For deeper context, follow the question ID in the complete topic guide.

## CLOUD-01 A new approval extension needs immediate document validation and an external supplier portal. Would you put everything on-stack or on BTP?

**Level:** Senior

**Short answer:** I would split only where the business and transaction boundaries justify it. Validation that must reject the core document belongs at a supported on-stack extension point when available. The supplier portal may fit side-by-side because its users, scaling, and release lifecycle differ. I would define released remote contracts and tolerate explicit asynchronous states between the two. The decision depends on available APIs, latency, identity, operational ownership, and failure recovery, not a blanket preference for BTP.

**Example and follow-up:** If the portal calls a remote service during the core save, a supplier-network outage could block all internal posting. Separating a committed submission from later supplier interaction avoids that coupling, but requires visible pending and failed states, retry correlation, and a business rule for withdrawal after submission.

**Avoid this mistake:** Deploying side-by-side does not make synchronous cross-system validation atomic or automatically clean-core compliant.

**Interviewer follow-ups:**

- Which invariant must be enforced before the core commit?
- How does the user recover when the portal accepts a request but the core is unavailable?

**Strong answer criteria:**

- Separates business and runtime boundaries
- Names latency and lifecycle tradeoffs
- Defines partial-failure recovery

**Verification evidence:** An architecture decision record, target API availability checks, and a failure-sequence test showing pending, retry, and withdrawal outcomes.

**Read and verify this answer:**

- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility) - Use this contract as evidence for the architecture decision; verify availability on the target product.

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

**Short answer:** I would separate the development model from the runtime. ABAP Cloud combines restricted language versions, released dependencies, modern tooling, and programming models such as RAP; it is available in supported S/4HANA environments as well as SAP BTP ABAP environment. Moving code to BTP changes data locality, connectivity, operations, and available business APIs. I would first identify the required product capabilities and choose deployment deliberately, then assess the application's compatibility with that environment.

**Example and follow-up:** A class that reads local sales data in an S/4HANA system cannot assume the same application tables or local APIs exist in a BTP ABAP system. A remote service, data replication, or a different ownership model may be necessary even if the ABAP language syntax is valid.

**Avoid this mistake:** Cloud-compatible syntax does not establish identical application content, API availability, or deployment portability.

**Interviewer follow-ups:**

- Which dependencies become remote after the move?
- What target-system evidence would you require before estimating migration?

**Strong answer criteria:**

- Distinguishes model from runtime
- Identifies lost data locality
- Checks product-specific capabilities

**Verification evidence:** A target capability matrix mapping each dependency to its supported local or remote equivalent and a tested integration spike.

**Read and verify this answer:**

- [SAP ABAP Cloud development model](https://help.sap.com/docs/abap-cloud/abap-cloud-background-concepts-and-overview/abap-cloud-development-model) - Use this contract as evidence for the architecture decision; verify availability on the target product.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## CLOUD-04 Two teams want independent releases but share pricing helpers and persistence types. How would you structure packages and software components?

**Level:** Senior

**Short answer:** I would identify which shared capabilities can carry a stable contract and which require coordinated releases. Packages organize implementation and access boundaries; software components also define lifecycle and delivery dependencies. A stable pricing interface can belong to a reuse component, while private persistence types should remain with their owner. Where supported, component relations permit targeted internal access, but they are not a substitute for a compatibility commitment. I would avoid cycles and make import order explicit.

**Example and follow-up:** If both teams depend on each other's database row types, an allegedly independent release may require simultaneous activation everywhere. Replacing those types with a narrow request/result contract reduces coupling. If the contract is not stable yet, a coordinated release may be more honest than promising independence through extra components.

**Avoid this mistake:** More software components do not create independent lifecycles when their dependencies still require lockstep delivery.

**Interviewer follow-ups:**

- When would you choose a component relation instead of a C1 API?
- How would an incompatible dependency removal be detected?

**Strong answer criteria:**

- Models dependency direction
- Distinguishes access permission from stability
- Aligns boundaries with delivery reality

**Verification evidence:** A dependency graph without cycles, explicit component relations, a transport/import sequence, and compatibility checks against the prior delivered API snapshot.

**Read and verify this answer:**

- [SAP software component dependencies and API snapshots](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-component-dependencies) - Use this contract as evidence for the architecture decision; verify availability on the target product.
- [SAP software component organization and lifecycle boundaries](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-components) - Use this contract as evidence for the architecture decision; verify availability on the target product.

## CLOUD-18 What would you require before approving a senior team's ABAP Cloud architecture for production?

**Level:** Senior

**Short answer:** I would require evidence for the main business invariants and nonfunctional risks, not only a component diagram. That includes transaction ownership, authorization, release-compatible dependencies, realistic workload behavior, observability, recovery, data retention, and deployment sequencing. Each consequential assumption needs an owner and a validation result. I would permit proportionate residual risk with explicit operational controls, while distinguishing a prototype, a locally tested implementation, and a solution proven on the intended runtime.

**Example and follow-up:** A successful Fiori demo with mocked data does not establish real RAP authorization, lock handling, or remote error recovery. A useful readiness review walks through one concurrent update, one dependency outage, one failed deployment, and one recovery drill, with evidence tied to the actual release candidate.

**Avoid this mistake:** A clean syntax check, green ATC run, or attractive diagram is not an end-to-end production-readiness certificate.

**Interviewer follow-ups:**

- Which risk would you prove first with a technical spike?
- What evidence would make you delay the release despite a successful demo?

**Strong answer criteria:**

- Prioritizes consequential risks
- Requires runtime-linked evidence
- Defines operational ownership and recovery

**Verification evidence:** A release-readiness dossier with targeted load, security, transaction, deployment, and recovery results for the exact candidate revision.

**Read and verify this answer:**

- [SAP extension architecture guidance](https://help.sap.com/docs/sap-btp-guidance-framework/extension-architecture-guide/getting-started-with-extensibility) - Use this contract as evidence for the architecture decision; verify availability on the target product.

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

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

## MODEL-01 A new consumption entity exposes orders outside the user's sales organization. The base CDS has DCL. What do you investigate?

**Level:** Senior

**Short answer:** Trace the actual read entry point and its access control, including associations and alternative services. A protected base entity does not automatically confer equivalent protection on every higher entity. Define or inherit the intended restrictions through supported DCL constructs and mappings for the consumed entity. Keep operation authorization separate. The fix must preserve both authorized records and deliberate exceptions, rather than hiding the problem with a UI filter.

**Example and follow-up:** Create two organizations with otherwise identical orders and use a restricted identity. Compare direct base consumption, the exposed projection and association navigation. Include count and value help: leaking a key or aggregate is still a data disclosure even when the main list looks correct.

**Avoid this mistake:** Do not add #CHECK and assume it creates a missing rule.

**Interviewer follow-ups:**

- Which entry point actually evaluated DCL?
- How would a field rename affect inherited restrictions?

**Strong answer criteria:**

- Traces the exposed read path
- Defines restrictions at the correct boundary
- Tests negative and positive identities

**Verification evidence:** Capture the real service responses for two organizational scopes, including navigation and counts.

**Read and verify this answer:**

- [SAP Learning: authority checks and DCL](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

## MODEL-02 An approver may update organization A. Can an update move an order from A to B using only existing-instance authorization?

**Level:** Senior

**Short answer:** Authorization on the current instance can establish permission for its existing state, but that does not automatically approve the proposed target values. Treat the incoming organization change as a separate policy decision. Use supported prechecks and business validation/operation checks at appropriate points, with explicit handling of create and update. Derivations must not silently introduce a target scope that the caller was never allowed to choose.

**Example and follow-up:** An order starts in A, so an existing-instance check succeeds. The payload proposes B. Test permitted A-to-A changes, forbidden A-to-B changes, initial values and batch requests. Ensure internal local-mode updates occur behind a verified public operation and still preserve business consistency.

**Avoid this mistake:** Do not equate authorization for the current object with authorization for any future object state.

**Interviewer follow-ups:**

- What is checked for creation?
- What happens if a determination changes the organization?

**Strong answer criteria:**

- Separates current and proposed state
- Checks the public mutation boundary
- Considers derived and bulk changes

**Verification evidence:** Demonstrate a rejected cross-scope update through the actual service with no unauthorized persisted change.

**Read and verify this answer:**

- [SAP RAP authorization control](https://help.sap.com/docs/abap-cloud/abap-rap/authorization-control) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

<details>
<summary>Visual: Existing and proposed state authorization</summary>

![Existing and proposed state authorization](../visuals/senior-proposed-state-authorization.svg)

Editing the current A instance and moving it into B are different authorization decisions. Partial input must be interpreted with existing state without treating omitted fields as explicit clears.

**Explain it:** Which state does each check inspect, and what happens if a determination changes the target scope?

**Limit:** A policy example, not a universal company-code rule. Implement through the target RAP scenario's supported hooks; prechecks do not replace the complete authorization model.

</details>

## MODEL-03 A custom query returns only authorized rows but an unrestricted total count. Is it secure?

**Level:** Senior

**Short answer:** No. Authorization must constrain the logical result before both counting and paging. A custom query provider owns the supported request semantics and cannot assume database-managed protections automatically cover remote or manually assembled data. Build one consistent authorized predicate and use it for data and count. Do not load all remote records into memory merely to hide unauthorized rows after an unrestricted count or aggregation.

**Example and follow-up:** The caller may see five permitted orders while count reveals 900 hidden orders. Test zero-access users, count-only requests, filters, ordering and navigation. If the provider cannot securely support a requested aggregate or filter, reject it under a documented contract instead of returning a misleading result.

**Avoid this mistake:** Filtering only the displayed page leaves count, aggregates and existence checks exposed.

**Interviewer follow-ups:**

- How do you handle count-only requests?
- What if the remote API cannot apply your authorization predicate?

**Strong answer criteria:**

- Uses one authorized result definition
- Protects count and aggregates
- Rejects unsupported semantics explicitly

**Verification evidence:** Use restricted identities and compare authorized data, count and aggregate responses over the same fixture.

**Read and verify this answer:**

- [SAP: Requesting and Setting Data or Count](https://help.sap.com/docs/abap-cloud/abap-rap/requesting-and-setting-data-or-count-in-unmanaged-query) - Handle data and count requests independently. Apply the same authorization and filtering to both; test count-only requests.

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

## MODEL-04 A query-provider filter cannot be converted to simple ranges. A developer catches the exception and returns everything. What is the correction?

**Level:** Senior

**Short answer:** Preserve the requested Boolean semantics or reject the unsupported filter clearly. Range conversion is not a universal representation of arbitrary nested AND/OR expressions and functions. Use a supported expression representation or another safe translation strategy appropriate to the provider. Combine user filters with mandatory authorization predicates independently, so a parsing failure cannot remove either restriction. Validate dynamic identifiers and values through supported APIs.

**Example and follow-up:** Consider (region=A AND amount>100) OR (region=B AND urgent=true). Flattening this into independent region and amount ranges changes the result. Build fixtures that distinguish the intended expression from the flattened one, and include an unsupported-function request.

**Avoid this mistake:** A swallowed filter exception must not become an unrestricted selection.

**Interviewer follow-ups:**

- Can the backend express the same predicate?
- How do mandatory authorization filters survive translation failure?

**Strong answer criteria:**

- Preserves AND/OR grouping
- Separates mandatory restrictions
- Returns an explicit unsupported-request outcome

**Verification evidence:** Compare expected row sets for nested filters and prove failure never broadens authorized access.

**Read and verify this answer:**

- [SAP: Implementing Filtering in an Unmanaged Query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-filtering-in-unmanaged-query) - Check supported filter representations and conversion limitations. Unsupported input must not remove required user or authorization restrictions.

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

## MODEL-14 A CDS unit test passes, but the same entity leaks data for a restricted user. What may the test be missing?

**Level:** Senior

**Short answer:** Inspect the test environment and access-control configuration. A test focused on relational logic with CDS doubles may intentionally isolate or disable access control; it is not automatically an authorization test. Enable the supported access-control testing mechanism with meaningful role data where available, and add real service tests under restricted identities. Keep query-correctness evidence separate from security evidence.

**Example and follow-up:** One test proves the join returns three rows. Add fixtures for no authorization and two distinct scopes, then ensure the test actually evaluates DCL. A final service test also verifies binding, identity propagation and the real consumed entity.

**Avoid this mistake:** A green database-double test does not prove deployed authorization.

**Interviewer follow-ups:**

- Is DCL enabled in the test environment?
- Which real identity is used by the service?

**Strong answer criteria:**

- Inspects double behavior
- Adds denied and scoped authorization cases
- Separates unit and deployed evidence

**Verification evidence:** Show test configuration plus restricted-user service results; do not infer one from the other.

**Read and verify this answer:**

- [SAP CDS access-control tests](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-visual-studio-code/writing-test-for-cds-entity-with-access-control) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

<details>
<summary>Visual: Real behavior under test and dependency doubles</summary>

![Real behavior under test and dependency doubles](../visuals/senior-real-cut-evidence.svg)

Two deliberately different inputs exercise the real Submit rule while a separate limit-provider dependency is controlled. Assertions inspect state and response identity, not only execution coverage.

**Explain it:** If the account-assignment rejection is removed, which test fails? What evidence remains missing after these tests pass?

**Limit:** The fixture is conceptual and not an executed ABAP Unit result. Framework double support and persistence setup depend on the target release and test boundary.

</details>

## OPS-01 How would you test a Submit action without replacing the business object you are supposed to verify?

**Level:** Senior

**Short answer:** Keep the Submit implementation and its relevant BO behavior real. Isolate true dependencies such as database tables, external service adapters or other BOs using the appropriate supported doubles. Drive the operation through a meaningful boundary, often EML, and assert state changes, failures and messages. A double of the very action under test would prove the configured double response rather than the business rule.

**Example and follow-up:** A purchase request can be submitted only when every item has an account assignment. Test a valid request and a missing assignment, including persisted outcome after the supported save boundary. If another BO supplies a limit, double that dependency and vary its response.

**Avoid this mistake:** Do not label a test of a mocked Submit response as a test of Submit.

**Interviewer follow-ups:**

- Which behavior remains real?
- How do you prove rejected data was not persisted?

**Strong answer criteria:**

- Defines the unit/contract under test
- Doubles only dependencies
- Asserts state plus response semantics

**Verification evidence:** Show the dependency diagram and a failing test when the real Submit check is deliberately broken.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the framework contract to design the proposed evidence; no runtime result is claimed here.

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

## OPS-05 How do you prove optimistic concurrency rather than merely calling the same update twice?

**Level:** Senior

**Short answer:** Use independent consumers or sessions that read the same initial version, then perform conflicting updates in a controlled order. Assert that the first permitted write succeeds and the stale second precondition is rejected without lost data. For draft, separately test the exclusive-lock and total-ETag situations. A sequential test that rereads after every update never exercises a stale writer.

**Example and follow-up:** Alice and Ben read the same entity instance with its entity ETag. Alice updates that instance successfully; Ben submits an update to that same instance using the stale ETag and must not overwrite it. Separately test child-only active changes against the configured draft total ETag when resuming an expired draft lock. Keep entity-level conditional update and draft-resume concurrency assertions distinct.

**Avoid this mistake:** Two updates in one shared transaction are not a realistic two-user concurrency test.

**Interviewer follow-ups:**

- How do you control the interleaving?
- Which field protects the whole draft object?

**Strong answer criteria:**

- Uses independent contexts
- Creates a deliberately stale request
- Asserts unchanged data after rejection

**Verification evidence:** Capture request versions, responses and final values for the orchestrated conflicting sessions.

**Read and verify this answer:**

- [SAP total ETag and draft concurrency](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f5e8548c241b43ab82bceec030b5dc9a.html) - Use the framework contract to design the proposed evidence; no runtime result is claimed here.

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

## OPS-11 A remote approval succeeded, but the RAP caller timed out. How should an operator recover?

**Level:** Senior

**Short answer:** Treat the outcome as uncertain until reconciled using stable correlation. Do not blindly resubmit a non-idempotent business action. Identify which system owns each committed effect and use the documented status query, idempotency contract or compensation process. Preserve a durable recovery record and route unresolved cases to an owner. A local rollback cannot erase a remote commit.

**Example and follow-up:** The remote workflow created an approval instance, but its response was lost. A retry should find or reuse that instance rather than create another. Include a later duplicate callback and an approval referring to an outdated local version.

**Avoid this mistake:** A timeout is not evidence that the other system performed no work.

**Interviewer follow-ups:**

- What is the stable correlation key?
- Who resolves an outcome that cannot be queried?

**Strong answer criteria:**

- Separates unknown from failed outcome
- Reconciles before unsafe retry
- Handles duplicate and stale callbacks

**Verification evidence:** Simulate lost responses and verify one intended business effect plus a visible recoverable status.

**Read and verify this answer:**

- [SAP RAP business-object contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract) - Use the framework contract to design the proposed evidence; no runtime result is claimed here.

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

## OPS-14 What belongs in a RAP release gate beyond a passing ATC run?

**Level:** Senior

**Short answer:** Combine static findings with contract and behavior tests, relevant authorization cases, concurrency and rollback checks, representative performance evidence, dependency/API compatibility and target configuration readiness. Scale the gate to the changed risks. ATC can identify configured code issues but does not prove all business invariants or real integration behavior. Record unexecuted checks explicitly rather than converting missing evidence into a pass.

**Example and follow-up:** A change touches an action signature and an approval event. Required evidence differs from a label-only UI change: include old consumer compatibility, duplicate delivery and negative authorization. Tie each check to the relevant source revision and environment.

**Avoid this mistake:** A universal checklist is not a substitute for checking the risks actually changed.

**Interviewer follow-ups:**

- Which new failure mode did this change introduce?
- Which result is pending rather than passed?

**Strong answer criteria:**

- Builds a risk-based gate
- Separates static and runtime evidence
- Records versions and pending checks

**Verification evidence:** Present a concise release matrix linking changed behavior to executed results, owners and remaining risks.

**Read and verify this answer:**

- [SAP RAP test frameworks and boundaries](https://help.sap.com/docs/abap-cloud/abap-rap/used-frameworks-and-tools) - Use the framework contract to design the proposed evidence; no runtime result is claimed here.
- [SAP RAP feature and release overview](https://help.sap.com/docs/abap-cloud/abap-rap/what-s-new) - Use the framework contract to design the proposed evidence; no runtime result is claimed here.

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

## GOV-01 A project claims Level A because its frontend uses RAP. How would you assess the extension?

**Level:** Senior

**Short answer:** I would define the assessment scope and inspect the actual dependency and extension paths, including adapters and called custom code. Level A relies on released contracts and the relevant supported development approach; Level B uses classified classic APIs, Level C internal objects, and Level D non-recommended dependencies or techniques. RAP or a Fiori frontend does not determine the classification alone. I would record object-level evidence and avoid presenting a mixed solution as uniformly Level A.

**Example and follow-up:** A RAP handler may call a customer wrapper that ultimately invokes an internal SAP object. The consumer boundary and wrapper can require separate assessment, but the delivery still contains that exposure. A useful report links each finding to the affected business capability and responsible owner, rather than counting only visible service artifacts.

**Avoid this mistake:** RAP, BTP deployment, a customer namespace, or a green UI test is not proof that every underlying dependency is Level A.

**Interviewer follow-ups:**

- What exactly is included in the claimed Level A scope?
- How would you find dependencies hidden behind customer adapters?

**Strong answer criteria:**

- Defines scope before classification
- Traces indirect dependencies
- Separates framework choice from API evidence

**Verification evidence:** An object-level dependency inventory with target-system release/classification evidence and the applicable ATC result for the same revision.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

<details>
<summary>Visual: Release contracts versus Clean Core levels</summary>

![Release contracts versus Clean Core levels](../visuals/senior-contracts-versus-levels.svg)

The two tables are separate classification axes. C1 identifies a local-use contract, while Level C identifies internal-object exposure in the Clean Core assessment context.

**Explain it:** What else must you verify after finding a C1 release flag, and why does a wrapper not erase the underlying exposure?

**Limit:** These are the three contracts requested for this comparison, not the complete release-contract catalogue. Exact object classification, extension technology, target edition, and ATC scope remain decisive.

</details>

## GOV-02 An API is released with C1. A team assumes that means Clean Core Level C and permission to expose it remotely. How do you respond?

**Level:** Senior

**Short answer:** I would separate the naming systems. C0 is the Extend release contract, C1 is Use System-Internally, and C2 is Use as Remote API; these are purposes and stability contracts, not Clean Core A-D categories. A C1 release must also have the appropriate visibility for its consumer. Remote exposure needs a supported remote contract and communication design. I would inspect the object's API state and documented use rather than infer permissions from the letter C.

**Example and follow-up:** A local released class can support an on-stack application without being a remote API itself. Building a custom remote service around it creates a new owned contract with authentication, authorization, error semantics, and lifecycle obligations. It does not magically convert the underlying object to C2 or inherit every provider guarantee.

**Avoid this mistake:** C0/C1/C2 and Clean Core A/B/C/D are different classifications; release for one purpose does not release every possible usage.

**Interviewer follow-ups:**

- Which visibility must the API expose for this caller?
- What responsibilities arise if you build a custom remote service over a local API?

**Strong answer criteria:**

- Names contracts accurately
- Checks purpose and visibility
- Recognizes new provider responsibilities

**Verification evidence:** ADT API-state properties, provider documentation, and a consumer design showing local use or an explicitly owned remote contract.

**Read and verify this answer:**

- [SAP release contracts, visibility, and API lifecycle states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Release contracts versus Clean Core levels</summary>

![Release contracts versus Clean Core levels](../visuals/senior-contracts-versus-levels.svg)

The two tables are separate classification axes. C1 identifies a local-use contract, while Level C identifies internal-object exposure in the Clean Core assessment context.

**Explain it:** What else must you verify after finding a C1 release flag, and why does a wrapper not erase the underlying exposure?

**Limit:** These are the three contracts requested for this comparison, not the complete release-contract catalogue. Exact object classification, extension technology, target edition, and ATC scope remain decisive.

</details>

## GOV-04 An urgent release needs an ATC exemption for an internal dependency. What makes the exception governable?

**Level:** Senior

**Short answer:** I would require a specific business need, exact finding and source scope, target edition, alternatives considered, risk owner, and compensating verification. The exception should have an expiry or review trigger and a funded remediation path, not an indefinite blanket waiver. An ATC exemption changes handling of a finding; it does not make unsupported syntax legal, change SAP's API contract, or establish business correctness. The release decision must explicitly accept the residual exposure.

**Example and follow-up:** An exception for one read-only adapter should not silently cover additional write calls introduced later. Tie it to the relevant objects and finding category, rerun checks after changes, and require review when the target release or provider changes. Security and transactional defects need their own assessment rather than being bundled into a clean-core waiver.

**Avoid this mistake:** An approved exemption is not a reclassification to Level A and must not become a general permission to bypass ABAP Cloud restrictions.

**Interviewer follow-ups:**

- What event invalidates this exception?
- How do you prevent the approved scope from growing unnoticed?

**Strong answer criteria:**

- Bounds scope and lifetime
- Names accountable risk ownership
- Separates exemption from technical permission

**Verification evidence:** An exception record linked to the exact ATC finding, source revision, release target, regression evidence, owner, and expiry or review trigger.

**Read and verify this answer:**

- [SAP ATC configuration and transport-release governance](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/set-up-add-on-development) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-10 The direct dependency scan is clean, but an upgrade still breaks the extension. What could the governance model be missing?

**Level:** Senior

**Short answer:** I would inspect indirect custom dependencies, dynamic calls, configuration-selected implementations, remote contracts, and data assumptions outside the scanned scope. A scan can also miss relevant objects if its package selection, check version, or classification data is incomplete. I would connect findings to a dependency graph and process-level tests, recording evidence limitations. Clean direct references are useful, but they do not establish that every runtime path or semantic assumption is protected against the target change.

**Example and follow-up:** A custom facade may select an internal implementation through configuration, or a remote service may change independently of the ABAP transport. Another failure can come from expecting one text row where new data produces several. The graph must include configuration and integration edges, with accountable owners and representative runtime coverage.

**Avoid this mistake:** A green direct-reference check is not proof that the whole solution has no unsupported or semantically fragile dependencies.

**Interviewer follow-ups:**

- How would you discover configuration-driven dependencies?
- Which runtime paths must the upgrade rehearsal cover?

**Strong answer criteria:**

- Explores indirect and dynamic edges
- Questions scan completeness
- Adds process-level verification

**Verification evidence:** An expanded dependency graph, documented scan scope and tool versions, and upgrade regression evidence covering configured runtime paths.

**Read and verify this answer:**

- [SAP software component relations and consistency checks](https://help.sap.com/docs/ABAP_PLATFORM_NEW/c238d694b825421f940829321ffa326a/e9bd731abe1b424d8e6f25f47a2868a8.html) - Check classification, release scope and governance separately.

## GOV-18 An interview panel shows an A-D chart with ATC priorities. What would you clarify before treating it as a release gate?

**Level:** Senior

**Short answer:** I would explain the chart's intended check context, then ask which variant, check implementations, priorities, classification data, object scope, and target release produced the findings. A mapping used by an API-usage check is not a universal meaning of every ATC priority. Other findings can concern security, correctness, or performance. A clean-core gate should preserve that distinction and state what a pass proves, what exemptions exist, and which runtime evidence remains necessary.

**Example and follow-up:** Two projects can show different findings because one omitted an enhancement check or used older classification data, not because its code is cleaner. Even a matching configuration cannot prove business transaction correctness. Save the run metadata and compare like-for-like scopes before using counts or severity trends in a management dashboard.

**Avoid this mistake:** Do not interpret every priority 1 finding as Level D, every priority 2 as Level C, or absence of findings as proof of complete Level A coverage.

**Interviewer follow-ups:**

- What would you store so this assessment can be reproduced?
- How would you distinguish an exempted finding from a resolved dependency?

**Strong answer criteria:**

- Qualifies severity mapping by check
- Requires reproducible assessment scope
- Separates static findings from runtime proof

**Verification evidence:** The exact ATC variant and check configuration, classification/version information, source and scope identifiers, exemptions, and complementary runtime validation results.

**Read and verify this answer:**

- [SAP ADT release notes: ABAP_CLEAN_CORE_READINESS check variant](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-eclipse-release-notes/release-notes-of-abap-development-tools-for-eclipse-3-58) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

<details>
<summary>Visual: Release contracts versus Clean Core levels</summary>

![Release contracts versus Clean Core levels](../visuals/senior-contracts-versus-levels.svg)

The two tables are separate classification axes. C1 identifies a local-use contract, while Level C identifies internal-object exposure in the Clean Core assessment context.

**Explain it:** What else must you verify after finding a C1 release flag, and why does a wrapper not erase the underlying exposure?

**Limit:** These are the three contracts requested for this comparison, not the complete release-contract catalogue. Exact object classification, extension technology, target edition, and ATC scope remain decisive.

</details>

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## ABAP-01 How do you choose between standard, sorted, and hashed internal tables?

**Level:** Core

**Short answer:** I choose from the access pattern. A standard table suits indexed access and sequential processing. A sorted table maintains key order and supports efficient key and range access. A hashed table suits repeated complete-key lookup and requires a unique primary key. I also consider write volume, memory, and secondary keys before choosing.

**Example and follow-up:** For an order import, lt_orders can be a standard table when input order matters. A hashed lookup by unique order ID avoids repeated linear scans. A sorted table by customer and order ID supports processing each customer's contiguous group.

**Avoid this mistake:** A hashed primary key is unique; that does not mean every field value must be unique or that arbitrary partial-key searches are constant time.

**Read and verify this answer:**

- [SAP internal table reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: Internal table lookup</summary>

![Internal table lookup](../visuals/classic-internal-table-lookup.svg)

A free-key linear search, an ordered lookup, and a complete hashed-key lookup find the same record through different access paths.

**Explain it:** What changes if I need all rows in a key range, or preserve input order?

**Limit:** A standard table can use secondary keys; a hash lookup requires a suitable complete key. Hash storage and probe order are schematic, not SAP implementation guarantees.

</details>

## ABAP-07 How do you explain an SAP LUW versus a database LUW?

**Level:** Advanced

**Short answer:** A database LUW is the database transaction completed by a database commit or rollback. An SAP LUW groups a business change across application processing, potentially spanning multiple database LUWs in classic dialog processing. The application coordinates consistency using appropriate persistence, update mechanisms, and logical locks. The transaction owner decides when the business operation is complete.

**Example and follow-up:** In a classic document change, user interaction can span dialog steps. Holding ordinary database locks across that entire interaction is unsuitable, so the application uses SAP enqueue locks and a defined save process. RAP instead provides a framework-controlled transaction and save sequence.

**Avoid this mistake:** A database commit caused by a work-process boundary is not permission to split a business operation into independently committed fragments.

**Read and verify this answer:**

- [SAP LUW reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/17_SAP_LUW.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: SAP LUW and database LUW</summary>

![SAP LUW and database LUW](../visuals/classic-sap-database-luw.svg)

Several database transactions can serve a single classic SAP business transaction. The illustrated early database transactions only read; coordinated persistence happens at the end.

**Explain it:** Who owns the commit, and why does a database lock not protect a long user interaction?

**Limit:** The final save may use update processing in another context. Lock scope and transfer rules vary; the line is conceptual ownership, not a universal enqueue lifetime. Do not apply classic COMMIT WORK patterns inside RAP handlers.

</details>

## ABAP-08 Who should issue COMMIT WORK, and what does AND WAIT guarantee?

**Level:** Advanced

**Short answer:** The transaction owner should commit, rather than a reusable helper committing unexpectedly. In classic update-task processing, COMMIT WORK triggers registered update processing. AND WAIT waits for high-priority update completion: sy-subrc is 0 on success and 4 if that update fails. Without AND WAIT, COMMIT WORK sets sy-subrc to 0 without reporting the asynchronous update outcome. Neither form guarantees that every asynchronous follow-up in the landscape has completed successfully.

**Example and follow-up:** A reusable posting service called within a larger business operation must respect the caller's transaction contract. In RAP behavior code I do not insert COMMIT WORK or BAPI_TRANSACTION_COMMIT; framework restrictions and the actual legacy API's commit behavior must be checked.

**Avoid this mistake:** COMMIT WORK AND WAIT is not a distributed transaction guarantee and does not authorize commits inside RAP handlers.

**Read and verify this answer:**

- [SAP LUW reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/17_SAP_LUW.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.
- [SAP: COMMIT WORK and update result](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcommit.htm?file=abapcommit.htm%2F1000) - Classic ABAP reference for AND WAIT and sy-subrc. It does not authorize COMMIT WORK inside RAP behavior implementations.

<details>
<summary>Visual: SAP LUW and database LUW</summary>

![SAP LUW and database LUW](../visuals/classic-sap-database-luw.svg)

Several database transactions can serve a single classic SAP business transaction. The illustrated early database transactions only read; coordinated persistence happens at the end.

**Explain it:** Who owns the commit, and why does a database lock not protect a long user interaction?

**Limit:** The final save may use update processing in another context. Lock scope and transfer rules vary; the line is conceptual ownership, not a universal enqueue lifetime. Do not apply classic COMMIT WORK patterns inside RAP handlers.

</details>

## OO-02 What can an ABAP interface contain, and when would you use one?

**Level:** Core

**Short answer:** An ABAP interface defines a contract implemented by classes. It can declare methods and other components such as types, constants, attributes, and events; it is not limited to abstract methods. I normally keep behavioral interfaces narrow so callers depend on the capability they need and tests can supply a substitute implementation.

**Example and follow-up:** A price-provider interface can expose a calculation operation without publishing database access. Two implementations need not be similar classes overall; sharing the required business contract is enough. Ordinary interfaces and specialized BAdI interfaces have different restrictions.

**Avoid this mistake:** An interface is not an abstract class, and a collection of similarly named methods alone does not establish a meaningful common contract.

**Read and verify this answer:**

- [SAP interfaces and implementation semantics](https://help.sap.com/saphelp_snc70/helpdata/EN/c3/225b6254f411d194a60000e8353423/content.htm) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

<details>
<summary>Visual: OO interfaces and dependency injection</summary>

![OO interfaces and dependency injection](../visuals/classic-oo-plug-contract.svg)

The service depends on a repository contract. Production and test implementations fit the same socket; the composition boundary supplies the appropriate collaborator.

**Explain it:** Which object chooses the implementation, and what does a double-based test fail to prove?

**Limit:** The plug is a design metaphor, not a SAP connector or code signature. Injection does not itself guarantee a good abstraction or production integration.

</details>

## OO-03 How do ABSTRACT and FINAL affect classes and methods?

**Level:** Core

**Short answer:** An abstract class cannot be instantiated directly and may provide shared implementation. It does not have to contain an abstract method. An abstract method has no implementation there and must be implemented before a concrete subclass can be instantiated. FINAL prevents further subclassing for a class, or further redefinition for a method.

**Example and follow-up:** An abstract document processor could implement logging while requiring a concrete processing step. If no supported specialization is intended, a final class communicates that choice. Marking a class final does not stop it implementing interfaces or receiving collaborators.

**Avoid this mistake:** Do not import another language's virtual keyword or method-overloading rules into ABAP; use ABAP's actual redefinition and signature rules.

**Read and verify this answer:**

- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

## OO-07 How do dependency injection and dependency inversion differ?

**Level:** Core

**Short answer:** Dependency inversion is a design principle: business policy should depend on suitable abstractions rather than concrete infrastructure details. Dependency injection is a way to supply a collaborator from outside, commonly through a constructor. Together they make dependencies visible and replaceable, but injection alone does not guarantee a useful abstraction or a good responsibility split.

**Example and follow-up:** An approval service receives a repository interface. Production composition supplies a database implementation; an ABAP Unit test supplies a controlled double. The service should not immediately instantiate its own concrete repository and ignore the injected dependency.

**Avoid this mistake:** Injecting a concrete class everywhere may aid construction while still leaving the business layer tightly coupled to infrastructure.

**Read and verify this answer:**

- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

<details>
<summary>Visual: OO interfaces and dependency injection</summary>

![OO interfaces and dependency injection](../visuals/classic-oo-plug-contract.svg)

The service depends on a repository contract. Production and test implementations fit the same socket; the composition boundary supplies the appropriate collaborator.

**Explain it:** Which object chooses the implementation, and what does a double-based test fail to prove?

**Limit:** The plug is a design metaphor, not a SAP connector or code signature. Injection does not itself guarantee a good abstraction or production integration.

</details>

## SQL-02 What is the empty-table trap in FOR ALL ENTRIES?

**Level:** Core

**Short answer:** If the driver internal table is empty, FOR ALL ENTRIES can cause the WHERE condition to be ignored and read all rows in scope. I guard the selection with a nonempty check and define the empty-input result explicitly. I also consider duplicate driver values, result duplicate elimination, and whether a join expresses the requirement better.

**Example and follow-up:** For lt_customer_ids, an empty input should usually produce an empty result rather than all customers. Deduplicating repeated driver keys can reduce work. Because duplicate result rows are eliminated, omitting distinguishing columns may collapse records the application intended to keep separate.

**Avoid this mistake:** An empty FAE driver does not mean no rows; a separate filter in the same WHERE clause is not a safe replacement for the guard.

**Read and verify this answer:**

- [SAP FOR ALL ENTRIES selection semantics](https://help.sap.com/saphelp_em900/helpdata/en/fc/eb3a1f358411d1829f0000e829fbfe/content.htm) - Verify the database access semantics and measure on the target system before choosing an optimization.

## SQL-04 How can a LEFT OUTER JOIN accidentally behave like an inner join?

**Level:** Advanced

**Short answer:** A left outer join preserves unmatched left rows and supplies NULL for the missing right side. A WHERE condition requiring a right-side value can reject those unmatched rows. If the condition belongs to matching, I put it in ON; if it is intended to filter the final result, WHERE may be correct.

**Example and follow-up:** To list every order with its optional English description, the language condition often belongs in ON. Putting description-language equals English in WHERE can remove orders with no matching description. The intended business result determines placement, not a mechanical rule.

**Avoid this mistake:** Moving conditions between ON and WHERE is not always semantics-preserving for outer joins.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.

<details>
<summary>Visual: SQL join multiplication</summary>

![SQL join multiplication](../visuals/classic-sql-join-grain.svg)

Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.

**Explain it:** What is one row of this result supposed to represent? Where should a language filter go for optional text?

**Limit:** This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.

</details>

## SQL-10 How do ST05, SAT, SQL Monitor, and database plans complement each other?

**Level:** Advanced

**Short answer:** ST05 helps inspect traced database access for a scoped execution. SAT shows ABAP runtime distribution and call behavior. SQL Monitor helps find important SQL across a broader workload. A database execution plan explains how the database processes a statement. I select the tool according to whether the bottleneck is database work, ABAP processing, or call volume.

**Example and follow-up:** For a slow report, identify the expensive processing segment, trace a representative run, and compare executions, rows, and time. In cloud editions the available tools and permissions differ; use the supported ADT or monitoring equivalent for that environment.

**Avoid this mistake:** The slowest individual SQL statement may not be the largest total cost if another cheap statement is executed thousands of times.

**Read and verify this answer:**

- [SAP analyzing SQL statements in ADT](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/analyzing-sql-statements) - Cloud-tool reference for SQL investigation; classic ST05/SAT access depends on the target landscape.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## CDS-03 Association or join and how do you select cardinality?

**Level:** Core

**Short answer:** An association models a reusable relationship; a path expression can cause a join when the relationship is consumed. A join explicitly combines sources in the current query. Cardinality must describe the actual data relationship and ON condition. Wrong to-one assumptions can produce incorrect or optimizer-dependent results.

**Example and follow-up:** For a flight-to-carrier association, an ON condition matching the carrier key can justify a to-one target cardinality if the data satisfies it. The flight's own identity is a separate question: it may require carrier, connection and flight date. Adding a date to the flight key does not establish the carrier relationship's cardinality. Test duplicate and missing target rows.

**Avoid this mistake:** Associations are not automatically faster than joins and do not enforce referential integrity.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: CDS links and ownership</summary>

![CDS links and ownership](../visuals/cds-relationships.svg)

Items belong to the order BO; a partner reference crosses to an independently managed object.

**Explain it:** What breaks if a declared to-one relationship actually returns two partners?

**Limit:** Composition semantics and generated operations still require the corresponding RAP model.

</details>

## CDS-07 Does DCL on a base view automatically protect every higher view?

**Level:** Core

**Short answer:** No. Read authorization must be designed for each externally accessed CDS entity. A higher view can use its own access control with inherited conditions where supported. Merely adding AccessControl.authorizationCheck: #CHECK does not invent an access rule. RAP operation authorization is a separate concern.

**Example and follow-up:** Test the projection used by the actual service with users from different company codes. Inspect the effective DCL and inheritance mapping, not just a protected lower-layer view.

**Avoid this mistake:** DCL on one layer does not automatically secure an arbitrary view-on-view stack.

**Read and verify this answer:**

- [SAP Learning on DCL inheritance](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

## CDS-11 How do CDS keys and database keys relate?

**Level:** Core

**Short answer:** A CDS key communicates entity identity to consumers but does not automatically enforce uniqueness in the query result. Database keys enforce uniqueness in persistence. Joins, missing key elements and aggregations can change result uniqueness. RAP and OData need stable, truly unique entity identities.

**Example and follow-up:** If SFLIGHT rows differ by CARRID, CONNID and FLDATE, exposing only the first two as identity can merge or confuse rows in a client. Include the full business-relevant identity.

**Avoid this mistake:** Marking an element key does not remove duplicate rows.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: CDS links and ownership</summary>

![CDS links and ownership](../visuals/cds-relationships.svg)

Items belong to the order BO; a partner reference crosses to an independently managed object.

**Explain it:** What breaks if a declared to-one relationship actually returns two partners?

**Limit:** Composition semantics and generated operations still require the corresponding RAP model.

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

## ODATA-01 When would you choose OData V4 rather than V2?

**Level:** Core

**Short answer:** Prefer V4 for new supported transactional RAP services, while checking the actual Fiori elements or integration consumer and backend release. Keep V2 where required by an existing contract or consumer. V4 has first-class actions and functions and different protocol details; it is not simply a faster V2 switch.

**Example and follow-up:** Draft, determinations and validations are RAP capabilities rather than exclusive V4 features. Verify draft and non-draft support for the specific UI template and SAPUI5 version.

**Avoid this mistake:** Neither RAP nor draft automatically implies that V2 is impossible; Gateway is not exclusively V2.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.
- [SAP Learning on UI service bindings](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-an-odata-ui-service) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

## ODATA-04 How do paging and total count work in V2 and V4?

**Level:** Advanced

**Short answer:** Apply filtering before count and paging, and ensure a stable order. V2 commonly uses $inlinecount=allpages, while V4 uses $count=true for an inline total; the /$count resource returns a count. Server-driven paging can return a next link that clients should follow.

**Example and follow-up:** A total of 500 with a page of 20 is valid. Returning 20 as the total because only 20 rows were fetched breaks page navigation. Concurrent changes may still affect offset-based paging.

**Avoid this mistake:** Do not invent one generic SET_COUNT method for every Gateway implementation; use the actual response contract.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ODATA-07 Is a batch request one database transaction?

**Level:** Advanced

**Short answer:** Not necessarily. A batch groups HTTP operations; it is not automatically one atomic transaction. Multipart batch formats use changesets for atomic change operations. OData 4.01 JSON batch uses atomicity groups. These mechanisms depend on protocol version and provider support; read operations and separate groups can have different outcomes. Deep create describes creating a related structure and requires backend support for a coherent transaction.

**Example and follow-up:** For an order and items, test a failing child and verify that the intended atomic group does not partially persist. Inspect each inner response even when the outer batch request succeeds. Check the service's protocol version and provider capabilities; a V4 endpoint does not automatically support every V4.01 batching feature.

**Avoid this mistake:** HTTP 200 for a batch does not mean every operation inside it succeeded.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.
- [OASIS OData 4.01 JSON Format: Batch Requests](https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html) - See JSON batch atomicityGroup semantics. Verify that the SAP provider supports this protocol version and batch format.

<details>
<summary>Visual: OData batch envelope and atomic groups</summary>

![OData batch envelope and atomic groups](../visuals/odata-batch-envelope.svg)

The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.

**Explain it:** If a later independent group fails, must an earlier successful group be rolled back?

**Limit:** Conceptual grouping, not an exact multipart or JSON batch payload.

</details>

## CORE-02 What are Clean Core levels A B C and D?

**Level:** Core

**Short answer:** A uses released SAP interfaces and extension points with their supported contracts. B uses SAP-designated classic APIs and supported classic extension options. C depends on internal SAP objects with upgrade risk. D uses explicitly non-recommended objects or techniques. Always classify actual dependencies and technology in the applicable product context.

**Example and follow-up:** Use A where feasible, consider B for justified classic scenarios, manage C with explicit risk ownership and monitoring, and prioritize remediation of D.

**Avoid this mistake:** A familiar API is not automatically B, and every unreleased object is not automatically D.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-03 How do the levels map to ATC messages?

**Level:** Core

**Short answer:** In the configured Clean Core usage checks, A produces no corresponding finding, B is priority 3 information, C is priority 2 warning and D is priority 1 error. This is the Clean Core mapping, not a universal interpretation of every ATC result from security or performance checks.

**Example and follow-up:** Confirm the check variant, check implementation, classification data and target release before interpreting a result. A system with missing checks can appear green without proving compliance.

**Avoid this mistake:** No ATC findings does not prove that the entire application is secure, correct or fully Level A.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## CORE-08 Does wrapping an unreleased SAP API make it Level A?

**Level:** Advanced

**Short answer:** A released custom wrapper can provide a controlled interface to a consumer where the platform permits it. Its implementation still has the classification and upgrade risk of the underlying dependency. Evaluate both consumer contract and implementation chain, and retire the wrapper when an appropriate supported alternative exists.

**Example and follow-up:** A wrapper around a nominated classic API can retain a B implementation dependency even when the calling ABAP Cloud code sees a released custom contract.

**Avoid this mistake:** A wrapper is not a mechanism for laundering an internal or prohibited dependency into an entirely Level A solution.

**Read and verify this answer:**

- [SAP Clean Core ATC levels and setup](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## CORE-10 How do you choose key-user on-stack and side-by-side extensibility?

**Level:** Core

**Short answer:** Choose key-user tools for supported business-context adaptations. Choose on-stack developer extensibility when close access to released data and transactional integration is required. Choose side-by-side for a more independent application lifecycle or cross-system process, using supported remote interfaces and explicit distributed consistency.

**Example and follow-up:** An additional field with a supported business context may fit key-user tools. A synchronous local validation may fit a released BAdI. A cross-system approval portal may fit BTP.

**Avoid this mistake:** These are placement and development choices, not automatic A-D grades or fixed implementation times.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## CORE-15 What if no released API covers the business requirement?

**Level:** Core

**Short answer:** Recheck standard functionality and supported extension points, confirm the target release, and evaluate another placement or process design. In a landscape allowing classic development, inspect designated classic APIs and govern any remaining internal dependency. Request a supported API through the appropriate SAP channel when needed.

**Example and follow-up:** Document the missing operation, alternatives rejected, risk owner and exit criteria. A temporary exception should have an explicit review point when a successor appears.

**Avoid this mistake:** Do not immediately choose a modification, and do not assume public edition permits a classic workaround.

**Read and verify this answer:**

- [SAP Clean Core best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Verify actual dependency classification and target-edition restrictions.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## BTP-04 What are a service instance binding and service key?

**Level:** Core

**Short answer:** A service instance is a provisioned service resource. A binding connects an application to that instance and supplies connection material. A service key provides credentials for a supported external client use case. A binding does not universally mean that a separately managed service-key artifact was created.

**Example and follow-up:** In Cloud Foundry, binding data is commonly provided through VCAP_SERVICES; other delivery methods exist. Restart or restage as required by the platform and application to consume changes.

**Avoid this mistake:** default-env.json is a local development convention, not the universal Cloud Foundry credential transport.

**Read and verify this answer:**

- [Cloud Foundry service bindings](https://docs.cloudfoundry.org/devguide/services/application-binding.html) - Check the target runtime, identity and connectivity context.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## BTP-07 How do remote transactions differ from local RAP transactions?

**Level:** Advanced

**Short answer:** A remote API call generally has a separate transaction boundary. A local rollback does not automatically undo a remote commit. Design orchestration with idempotency, explicit statuses, retries and compensation where needed. Do not assume distributed ACID behavior merely because both systems use SAP technology.

**Example and follow-up:** If payment creation succeeds remotely but the local response times out, retry with a stable idempotency key or reconcile before creating another payment.

**Avoid this mistake:** Calling HTTP inside an action does not make the remote change part of the local RAP database transaction.

**Read and verify this answer:**

- [SAP BTP documentation](https://help.sap.com/docs/btp) - Documentation navigation starting point, not direct evidence for every statement. Find the named feature and target release; the scenario decision and verification plan are original analysis.

<details>
<summary>Visual: OData batch envelope and atomic groups</summary>

![OData batch envelope and atomic groups](../visuals/odata-batch-envelope.svg)

The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.

**Explain it:** If a later independent group fails, must an earlier successful group be rolled back?

**Limit:** Conceptual grouping, not an exact multipart or JSON batch payload.

</details>

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

## RICEFW-11 How should a RAP submit action start an approval process reliably?

**Level:** Advanced

**Short answer:** The action should validate the requested transition and update the business object through its transaction contract. Starting an external process must be coordinated with successful persistence using supported event or integration mechanisms. I design correlation, retries, and idempotency so rollback does not leave an orphan approval and duplicate delivery does not create duplicate workflows.

**Example and follow-up:** A conceptual flow is Draft or Created to Submitted, committed event delivery, workflow creation, then an authorized approval callback. Actual draft activation is a separate RAP operation unless the application explicitly orchestrates it. Available event mechanisms depend on release and deployment.

**Avoid this mistake:** Calling an external workflow endpoint before save succeeds can start approval for a document that never committed.

**Read and verify this answer:**

- [SAP flexible workflow scenario and configuration concepts](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0e602d466b99490187fcbb30d1dc897c/10e7e36908184328aab7d5007d9ecb13.html) - Classic-platform background; verify supported alternatives in the target edition.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

<details>
<summary>Visual: Draft lifecycle</summary>

![Draft lifecycle](../visuals/draft-lifecycle.svg)

Follow edit, activate and discard for an existing active object, then explain how a new-object draft differs.

**Explain it:** What remains after discarding an edit draft? What if activation fails?

**Limit:** Schematic state transitions; draft actions and supported flows depend on the BO and consumer.

</details>

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

## RICEFW-15 Which S/4HANA changes can affect existing ABAP developments?

**Level:** Advanced

**Short answer:** Check target-release simplification items and custom-code findings before changing the application. Relevant areas include inventory data modeling around MATDOC, the Universal Journal around ACDOCA, Business Partner and CVI, and application-specific output and transaction changes. Compatibility mechanisms and migration prerequisites vary; do not infer behavior from a table name alone.

**Example and follow-up:** Inventory direct reads, writes and called transactions, then verify each affected business process. Business Partner integration does not mean every customer and supplier table has simply vanished. Compare functional results and performance on the actual target release.

**Avoid this mistake:** Replacing a legacy table name with MATDOC or ACDOCA mechanically is not a migration strategy.

**Read and verify this answer:**

- [SAP S/4HANA 2025 upgrade guide](https://help.sap.com/doc/760ce610a2af4174a329d2d8315378e2) - Classic-platform background; verify supported alternatives in the target edition.

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

## HTTP-01 What is the difference between HTTP, REST, OData and a payload format?

**Level:** Core

**Short answer:** HTTP supplies request/response semantics. REST is an architectural style with constraints such as stateless interactions and a uniform interface. OData specifies conventions for data services. JSON and XML represent data; neither makes an endpoint RESTful.

**Example and follow-up:** Explain four separate choices for an order API: transport semantics, architectural constraints, service conventions, and representation. In REST, stateless means each request carries the context needed to understand it, not that business data cannot persist.

**Avoid this mistake:** Do not use REST, HTTP and JSON as interchangeable names.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [REST constraints: Fielding dissertation](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: HTTP request and response anatomy</summary>

![HTTP request and response anatomy](../visuals/http-message-anatomy.svg)

Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.

**Explain it:** Which header describes the returned body, and which requests a response format?

**Limit:** A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.

</details>

## HTTP-04 What do safe and idempotent mean, and how do they affect retries?

**Level:** Advanced

**Short answer:** Safe methods have read-oriented requested semantics. Idempotency concerns the intended effect of repeated identical requests, not identical response codes. PUT and DELETE are idempotent by their HTTP semantics; POST and PATCH need specific application guarantees for safe repetition.

**Example and follow-up:** After a timeout on CreateOrder, the client may not know whether the server committed. Use a documented idempotency mechanism or query a stable business correlation before retrying. Repeated DELETE can return different statuses while the final resource state remains absent.

**Avoid this mistake:** Do not blindly retry a potentially committed business creation because the response was lost.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [PATCH method: IETF RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

## HTTP-07 What must you preserve when mapping JSON to ABAP?

**Level:** Core

**Short answer:** JSON supports objects, arrays, strings, numbers, booleans and null. Preserve the API contract for property names, missing versus null values, number precision and ordered array entries. Do not depend on object member ordering or duplicate member names.

**Example and follow-up:** Model an identifier such as "0004711" as a string. Decide deliberately whether a monetary value is represented as a decimal number or a string under the contract; retain currency and precision. Standard JSON has no native date type, comments, NaN or Infinity.

**Avoid this mistake:** Do not coerce every missing or null property into the same initial ABAP value without considering update semantics.

**Read and verify this answer:**

- [JSON format: IETF RFC 8259](https://www.rfc-editor.org/rfc/rfc8259) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [SAP JSON transformations](https://help.sap.com/docs/abap-cloud/abap-keyword/json-transformations-abencall_trafo_json_abexa) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

<details>
<summary>Visual: EML update intent: absent versus clear</summary>

![EML update intent: absent versus clear](../visuals/senior-control-presence.svg)

The first two requests carry the same initial ABAP value but differ in update intent. The field control decides whether the old comment is preserved or explicitly cleared.

**Explain it:** How would you preserve Amount while clearing Comment, and how could an adapter lose that distinction?

**Limit:** This is a worked mapping example. Actual generated EML types, UPDATE FIELDS syntax, protocol nullability, and business validation remain authoritative.

</details>

## HTTP-08 What XML concepts matter in an integration interview?

**Level:** Core

**Short answer:** XML is a structured representation with elements, attributes and nested content. Well-formedness checks syntax; schema validation checks additional declared constraints. A namespace is identified by its namespace URI. An element or attribute's expanded name combines its namespace name, if any, with its local name; the chosen prefix spelling is only an alias.

**Example and follow-up:** Two partners can use different prefixes for the same namespace, so parse by expanded name. A default namespace applies to unprefixed element names, not unprefixed attribute names. An empty element, an absent element and an explicit schema-defined nil value may differ. Escaping, encoding and parser security settings belong to the implementation contract.

**Avoid this mistake:** Do not process arbitrary XML with string splitting or assume that well-formed XML is business-valid.

**Read and verify this answer:**

- [XML specification: W3C](https://www.w3.org/TR/xml/) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [SAP sXML parsing](https://help.sap.com/docs/abap-cloud/abap-keyword/sxml-parsing) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [W3C Namespaces in XML](https://www.w3.org/TR/xml-names/) - Sections 2.1 and 6.2 distinguish namespace identity, expanded names and default namespace behavior for elements and attributes.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

## RFC-02 How do synchronous, asynchronous, transactional, queued, and background RFC differ?

**Level:** Core

**Short answer:** Synchronous RFC waits for the response. Asynchronous RFC lets the caller continue and optionally collect results through callbacks. Transactional RFC registers calls and parameters in the current SAP LUW; COMMIT WORK triggers processing of the registered unit rather than each call running immediately. Queued RFC adds sequencing through configured queues. Background RFC supports transactional and queued units with its own infrastructure. Their documented delivery guarantees apply to those units, not automatically to an entire distributed business process.

**Example and follow-up:** A tRFC registration does not prove completed remote processing. ROLLBACK WORK removes the current registrations; after commit, temporary unavailability is handled through retry. sRFC and aRFC lack that durable retry model. tRFC and bgRFC type T provide documented Exactly Once unit semantics; qRFC and bgRFC type Q add ordering within the configured dependency scope. bgRFC is the successor technology; choose what the target environment permits and let the runtime own the unit's transaction. Separate business submissions can still duplicate an order.

**Avoid this mistake:** STARTING NEW TASK is not durable background messaging, and queued processing does not imply one global order across unrelated queues.

**Read and verify this answer:**

- [SAP RFC variants and their quality-of-service scope](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm) - Classic runtime contract unless the source explicitly describes a cloud application job.
- [SAP: CALL FUNCTION IN BACKGROUND TASK](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/8f/53b67ad30be445b0ccc968d69bc6ff/content.htm) - Classic tRFC registration, COMMIT WORK and ROLLBACK WORK semantics. Registration is not confirmation of remote execution.
- [SAP: CALL FUNCTION IN BACKGROUND UNIT](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcall_function_background_unit.htm) - Classic bgRFC unit contract and successor technology. Check target-environment availability; this is not permission to commit inside RAP handlers.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

## RFC-04 When should BAPI_TRANSACTION_COMMIT or BAPI_TRANSACTION_ROLLBACK be called, and what does WAIT mean?

**Level:** Advanced

**Short answer:** The owner of a BAPI transaction decides whether to commit after evaluating the complete return contract or roll back after a failure. For remote calls, transaction control must reach the correct remote context. WAIT requests synchronous high-priority update completion; it does not wait for every downstream workflow, interface, or lower-priority activity. I verify exceptions in the specific BAPI documentation.

**Example and follow-up:** A successful transport response is not enough: inspect all relevant business return messages and the commit result. Some documented legacy BAPIs commit internally. In RAP behavior implementations, inserting BAPI_TRANSACTION_COMMIT is not a valid way to bypass framework transaction restrictions.

**Avoid this mistake:** An empty RETURN table is not the only possible success condition, and a local COMMIT WORK does not commit an unrelated remote BAPI context.

**Read and verify this answer:**

- [SAP BAPI transaction model and documented exceptions](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm) - Classic runtime contract unless the source explicitly describes a cloud application job.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

## RFC-07 How do you prevent parallel RFC processing from exhausting resources?

**Level:** Advanced

**Short answer:** In classic parallel processing I use DESTINATION IN GROUP with an appropriate RFC server group, bound the number of outstanding tasks, and size work packages deliberately. SPBT_INITIALIZE can help inspect available resources, but availability changes. I handle RESOURCE_FAILURE with bounded retry or throttling and measure whether parallelism actually helps the workload.

**Example and follow-up:** RZ12 defines relevant RFC groups in classic systems. A batch coordinator may dispatch aRFC workers to dialog work processes; its own background status does not mean every worker is a background work process. Avoid spawning one task for every tiny row.

**Avoid this mistake:** A resource count is a snapshot, not a reservation; hard-coded maximum concurrency can overload the system or increase lock contention.

**Read and verify this answer:**

- [SAP parallel processing, callbacks, and resource groups](https://help.sap.com/docs/ABAP_PLATFORM_NEW/7bfe8cdcfbb040dcb6702dada8c3e2f0/4d909309eba36e73e10000000a15822b.html) - Classic runtime contract unless the source explicitly describes a cloud application job.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## RFC-10 How do you schedule and troubleshoot a classic background job?

**Level:** Core

**Short answer:** In a classic system I define job steps, program variants, execution identity, and start conditions, commonly through SM36. I monitor status, step details, job log, and spool through SM37, then correlate application logs, dumps, and external dependencies. Before repeating a failed job, I establish which business effects already committed and whether the input selection is stable.

**Example and follow-up:** A periodic posting job needs an overlap rule, a defined selection window, and monitoring for missed runs. Scheduled, released, ready, active, finished, and canceled describe different execution states. A technically finished job may still have logged rejected business records.

**Avoid this mistake:** SM37 Finished is not proof that every business record succeeded, and canceling a job does not reverse its earlier commits.

**Read and verify this answer:**

- [SAP classic background scheduling and monitoring](https://help.sap.com/saphelp_em700_ehp01/helpdata/en/48/baab96ca960611e10000000a42189b/content.htm) - Classic runtime contract unless the source explicitly describes a cloud application job.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## INTF-01 What does an IDoc contain, and how do message type, basic type, and extension differ?

**Level:** Core

**Short answer:** An IDoc contains a control record identifying routing and message characteristics, data records holding segment payloads, and status records documenting processing. The message type expresses business meaning. The basic type defines the standard segment structure, while an extension adds supported customer segments. These concepts must agree with sender, receiver, and application processing capabilities.

**Example and follow-up:** For an order-related message, the control record describes what is being sent and which structure applies. Adding a custom segment requires compatible generation, interpretation, and mapping; declaring an extension alone does not populate or process its values.

**Avoid this mistake:** The message type is not the same as the basic type, and the IDoc document number is not automatically the target business document number.

**Read and verify this answer:**

- [SAP IDoc control record, message type, basic type, and extension](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/78/2177f051ce11d189570000e829fbbd/content.htm) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-07 What is SAP Application Interface Framework, and what is it not?

**Level:** Core

**Short answer:** AIF provides configurable interface processing, monitoring, and error-handling capabilities so technical and business users can investigate messages in a meaningful context. Depending on the scenario, it can organize mappings, checks, actions, and recovery. It does not replace the underlying transport or automatically monitor every interface. Availability, delivered content, and custom-development usage rights must be verified.

**Example and follow-up:** SAP distinguishes full custom-interface use from limited runtime rights supplied with particular products. Seeing an AIF monitor in a system does not establish permission to build arbitrary custom AIF interfaces. Confirm the target product's current scope and the customer's entitlement before proposing that implementation.

**Avoid this mistake:** AIF is not a substitute for RFC, IDoc, OData, or middleware, and its presence does not establish unrestricted licensing or identical cloud capabilities.

**Read and verify this answer:**

- [SAP AIF monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html) - Verify the owning interface configuration and business outcome, not only technical message status.
- [SAP AIF licensing and limited runtime usage distinction](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK/2af43ee5f65347c0bedf7901497ad5d1/0742ccdcf7ca41919972b5349ce018fa.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-11 When would you use OData, IDoc, or AIF?

**Level:** Core

**Short answer:** OData is an HTTP-based service protocol useful for supported queries and business operations, including UI and system integration. IDoc provides structured messages and established asynchronous application integration scenarios. AIF adds processing and operational capabilities around supported interfaces. They address different concerns and can coexist; I choose the business contract and delivery model before selecting monitoring.

**Example and follow-up:** A UI reading current request status may use OData while an established partner sends order messages as IDocs. AIF can support operational error handling where the integration is configured for it. Replacing one technology solely because another is newer ignores available contracts and recovery needs.

**Avoid this mistake:** AIF is not a third wire protocol, OData is not limited to UI use, and IDoc is not restricted to batch-only dispatch.

**Read and verify this answer:**

- [SAP AIF monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## BASE-01 What changes when a method receives a CHANGING parameter by value instead of by reference?

**Level:** Senior

**Short answer:** By reference, the formal parameter aliases the caller's data, so allowed writes affect it immediately. With VALUE, a local value is changed and copied back on normal completion. An exception leaving the method prevents that normal copy-back. This difference affects error guarantees, but it does not undo database writes or changes made through referenced objects.

**Example and follow-up:** Suppose a method changes a plain integer from 10 to 20 and then raises a class-based exception. A reference CHANGING parameter can leave 20 visible to the caller; a value-result parameter retains the caller's 10. Test both failure and success paths before changing an established signature.

**Avoid this mistake:** Pass-by-value is not a transaction rollback and does not clone objects behind reference parameters.

**Interviewer follow-ups:**

- How would this change with an object reference parameter?
- Can an IMPORTING reference variable still expose a mutable object?

**Strong answer criteria:**

- Separates parameter direction from transfer mode
- Explains exceptional copy-back behavior
- Identifies external side effects

**Verification evidence:** A small method-call test showing caller values after normal return and exception.

**Read and verify this answer:**

- [SAP: Pass by value](https://help.sap.com/docs/abap-cloud/abap-keyword/pass-by-value) - Formal parameters are local copies; parameter direction controls transfer.

<details>
<summary>Visual: Parameter values after exceptional exit</summary>

![Parameter values after exceptional exit](../visuals/deep-parameter-paths.svg)

Compare the same assignment under two transfer modes. The final caller value is visible evidence of the difference.

**Explain it:** Which result changes if the method returns normally? What changes if the parameter holds an object reference?

**Limit:** This assumes a plain integer, value-result passing, and no additional side effects.

</details>

## BASE-04 A dynamic ASSIGN fails, but IS ASSIGNED is still true. How can the program update the wrong field?

**Level:** Advanced

**Short answer:** A failed dynamic assignment can leave the field symbol pointing at its previous target. IS ASSIGNED then says only that some assignment exists, not that the latest lookup succeeded. I check the statement's result immediately and avoid using the alias after failure. On a supporting release, ELSE UNASSIGN makes the failure state explicit; otherwise I unassign before attempting the lookup.

**Example and follow-up:** A mapper assigns component PRICE successfully, then requests nonexistent component PRCIE. If it tests only IS ASSIGNED, a subsequent write may overwrite PRICE. A regression test must include a successful lookup followed by an invalid one using the same field symbol.

**Avoid this mistake:** An assigned field symbol is not evidence that the most recent dynamic ASSIGN succeeded.

**Read and verify this answer:**

- [SAP: ASSIGN, ELSE UNASSIGN](https://help.sap.com/docs/abap-cloud/abap-keyword/assign-else-unassign) - Failed assignments may preserve an earlier alias unless explicitly unassigned.

<details>
<summary>Visual: Stale aliases and overwritten return codes</summary>

![Stale aliases and overwritten return codes](../visuals/deep-stale-results.svg)

The first sequence can write to the previous target. The second takes a success branch for a different operation than the programmer intended.

**Explain it:** Which test requires a successful operation before the failure to expose the defect?

**Limit:** Only statements documented to set sy-subrc replace it. Assignment failure behavior depends on the exact form and additions.

</details>

## BASE-06 An import must reject precision loss rather than silently round or truncate. Where does EXACT help?

**Level:** Advanced

**Short answer:** EXACT requests a lossless assignment or calculation and raises an appropriate exception when the requested result cannot be represented without loss. CONV applies ordinary conversion rules and is not equivalent validation. I place the check at a typed boundary, translate conversion failures into useful input feedback, and still validate domain rules such as permitted signs, identifiers, and currency.

**Example and follow-up:** Converting a runtime text longer than a fixed character target can otherwise discard characters. For a two-decimal packed result, EXACT can reject a calculation such as one divided by three. That is useful when rounding is forbidden; when rounding is required, make the business rounding step explicit instead.

**Avoid this mistake:** EXACT does not prove that a technically representable value is an allowed business value.

**Read and verify this answer:**

- [SAP: EXACT examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/05_Constructor_Expressions.md#exact) - Official executable illustrations of lossless assignments and calculations.

<details>
<summary>Visual: Conversion, rounding, and reduction counterexamples</summary>

![Conversion, rounding, and reduction counterexamples](../visuals/deep-numeric-boundaries.svg)

A lost character, a one-cent difference, and a false maximum reveal three unrelated errors that concise syntax can hide.

**Explain it:** Which expected results change with a different rounding mode, and which are independent of rounding?

**Limit:** Half-up and two decimals are explicit exercise assumptions, not a universal currency rule. MAX notation is explanatory.

</details>

## BASE-12 A report accepts a filter value and a sort-column name. Is escaping quotes sufficient for safe SQL?

**Level:** Senior

**Short answer:** No. Data values and SQL identifiers are different inputs. I bind values through host variables in static ABAP SQL where possible. For configurable identifiers or dynamic clauses, I restrict them to a server-controlled allowlist and validate the supported syntax. Escaping a string value cannot authorize a table name, column name, operator, or an entire user-supplied WHERE fragment.

**Example and follow-up:** A search value containing an apostrophe should remain a value. A sort request is mapped from an accepted business option to a known column; arbitrary SQL text is rejected. Authorization predicates are built independently and cannot be removed by user filter or ordering choices.

**Avoid this mistake:** Input that is safely quoted as a literal is not therefore safe as SQL syntax or an authorized data access.

**Interviewer follow-ups:**

- How would you test an input that is valid syntax but unauthorized?
- Which parts of the SQL shape can remain completely static?

**Strong answer criteria:**

- Separates values and identifiers
- Uses explicit allowed SQL shapes
- Preserves authorization predicates

**Verification evidence:** Negative tests for quoted values, forbidden columns, injected operators, and unauthorized records.

**Read and verify this answer:**

- [SAP: Prevent SQL injection](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/86dbe289f813483abd78de6a52458bff/36e78557e0f6a96be10000000a4450e5.html) - Prefer static SQL; validate and escape dynamic content using supported facilities.

<details>
<summary>Visual: Two input kinds and two safe handling paths</summary>

![Two input kinds and two safe handling paths](../visuals/deep-sql-inputs.svg)

The apostrophe is intentionally harmless data on the left. The sort request on the right selects a predefined identifier rather than supplying executable SQL.

**Explain it:** Why would quoting the sort option as a literal fail to solve identifier validation?

**Limit:** Conceptual SQL boundary; available dynamic-programming helpers and API release status depend on the target environment.

</details>

## BASE-16 An authorization helper returns an empty range table. Why is WHERE field IN range unsafe as the only access restriction?

**Level:** Senior

**Short answer:** An initial selection range represents no restriction for IN, so it must not be used to encode 'the user may see nothing.' I define empty authorization results separately and return no rows or reject the operation before querying. Nonempty ranges combine inclusion and exclusion rules; their semantics differ from a plain list whose empty membership set would match nothing.

**Example and follow-up:** If a user has no permitted plants, the application must not execute an otherwise unrestricted read with an empty plant range. Keep optional user filters separate from mandatory authorization constraints. Test no permissions as well as one permitted plant and exclusions.

**Avoid this mistake:** An empty ABAP selection range is not the same as an SQL list containing zero allowed values.

**Interviewer follow-ups:**

- How do you distinguish an optional filter from mandatory authorization?
- What result do you expect from a range containing only exclusions?

**Strong answer criteria:**

- Recognizes initial-range semantics
- Fails closed for no permissions
- Separates user filtering from security

**Verification evidence:** A denied-user test proves zero data and zero aggregate leakage with an empty authorization result.

**Read and verify this answer:**

- [SAP: Comparison with selection tables](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENLOGEXP_SELECT_OPTION.html) - Defines inclusion/exclusion semantics and the initial selection-table case.

<details>
<summary>Visual: Duplicate insertion and empty authorization boundaries</summary>

![Duplicate insertion and empty authorization boundaries](../visuals/deep-duplicates-ranges.svg)

A duplicate unique key preserves the original row for the specified insertion form. An initial selection range has a very different meaning from an empty list of permissions.

**Explain it:** How would you distinguish identical duplicates from conflicting ones, and prove a user with no plants sees nothing?

**Limit:** Single-line INSERT INTO TABLE with a unique primary key; other insertion and key-conflict forms need their own documented handling.

</details>

## OODEEP-01 A method named reserve returns a reservation ID. Which promises must be explicit beyond its parameter types?

**Level:** Senior

**Short answer:** I define accepted inputs, the observable success result, allowed state changes, and failure behavior. The caller needs to know whether the reservation is merely buffered or durable, whether repetition is safe, and who owns transaction completion. Those promises belong in the contract and its tests. A matching signature alone cannot tell another developer whether combining two operations is safe.

**Example and follow-up:** One implementation returns an ID before save; another commits immediately. Both compile against the same interface but are not interchangeable for a caller that reserves two items atomically. Document the intended boundary in ABAP Doc and test failure of the second item against the first one's state.

**Avoid this mistake:** RETURNING an identifier does not itself promise committed persistence, and a method name cannot replace a transaction contract.

**Interviewer follow-ups:**

- What state is allowed after reserve raises an exception?
- What is the result when the same business request is retried?

**Strong answer criteria:**

- Defines success and failure state
- States transaction ownership
- Defines repeat-call semantics

**Verification evidence:** Contract tests plus documentation covering buffered success, persistence boundary, and repeated requests.

**Read and verify this answer:**

- [SAP Learning: Documenting ABAP code](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/documenting-abap-code_ad565c7e-6ac5-4a49-95e2-e4c33268dac6) - ABAP Doc documents methods, parameters, and exceptions; the scenario applies this to behavioral contracts.

<details>
<summary>Visual: A concrete counterexample to substitutability</summary>

![A concrete counterexample to substitutability](../visuals/deep-substitution-dispatch.svg)

A valid quantity-one call exposes a behavioral violation invisible in matching parameter types. The lower table separates redefinition from a genuinely new capability.

**Explain it:** Would downcasting every caller to Provider B repair the contract? What else besides accepted inputs must agree?

**Limit:** Hypothetical contract; a narrower published domain would lead to a different assessment. No executable interface is implied.

</details>

## OODEEP-09 A repository raises a low-level exception. Should a business service catch CX_ROOT and return an empty result?

**Level:** Senior

**Short answer:** Usually not: an empty result can turn technical failure into a false business fact. I catch failures at a boundary that can recover or translate them into the service's declared meaning. When wrapping an exception, I preserve the original through previous so diagnosis remains possible. Expected absence, business rejection, and technical failure need distinguishable outcomes.

**Example and follow-up:** A pricing repository connection failure must not look like 'no price exists' and trigger a free item. Translate the unavailable dependency into a meaningful service error while retaining its cause. Test not-found separately from unavailable, and ensure failure does not leave a misleading success result.

**Avoid this mistake:** Broad catch-and-default handling is not resilience when it changes an unknown outcome into valid-looking data.

**Interviewer follow-ups:**

- When is catching CX_ROOT justified at an application boundary?
- What information belongs in user feedback versus technical diagnostics?

**Strong answer criteria:**

- Keeps absence distinct from failure
- Translates at an abstraction boundary
- Preserves causal exception

**Verification evidence:** Tests assert distinct not-found and technical-failure paths, including the previous exception chain.

**Read and verify this answer:**

- [SAP Learning: Working with exception classes](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/working-with-exception-classes_acd9568c-be4e-445a-a454-14c6f2cfcd2e) - Exception propagation and previous preserve a technical cause during translation.

<details>
<summary>Visual: Exceptional exits and preserved causes</summary>

![Exceptional exits and preserved causes](../visuals/deep-cleanup-cause.svg)

The table names three exit paths that require separate reasoning. The exception chain carries the lower-level diagnosis through a meaningful service-level failure.

**Explain it:** Which path would a test of only propagated exceptions miss?

**Limit:** Simplified non-resumable scenarios; exact nesting and handlers determine CLEANUP execution. Resource ownership remains application-specific.

</details>

## PAT-01 Approval rules vary by country, while the application workflow should remain stable. Strategy or Template Method?

**Level:** Senior

**Short answer:** Prefer an injected Strategy when approval calculation is the variation and the caller should select or replace it without changing its own class hierarchy. Template Method fits a deliberately stable algorithm skeleton with controlled subclass extension steps. Here, I would keep workflow coordination separate from country rules and pass explicit context to the selected rule. Inheritance becomes justified only if its protected extension contract and lifecycle are genuinely stable requirements.

**Example and follow-up:** A country rule should return a decision rather than commit, send email or modify hidden global state. Test the same coordinator with several rule implementations. If countries also vary the process sequence, revisit the workflow model instead of adding increasingly powerful hooks that subclasses can use to violate invariants.

**Avoid this mistake:** Choosing inheritance solely to share code, or allowing a rule implementation to take over transaction ownership.

**Interviewer follow-ups:**

- Which variation changes at runtime rather than through subclassing?
- How would you prevent a new rule from changing the workflow's transaction boundary?

**Strong answer criteria:**

- Separates algorithm variation from coordination
- Defends composition versus inheritance contextually
- Keeps rules substitutable and independently testable

**Verification evidence:** Run identical coordinator contract tests with two country rules and a test double; assert decision and side-effect boundaries.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Strategy](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#strategy) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP ABAP pattern examples: Template Method](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#template-method) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.

<details>
<summary>Visual: Strategy versus Template Method in approval rules</summary>

![Strategy versus Template Method in approval rules](../visuals/patterns-strategy-template.svg)

The same 700 EUR request receives different policy decisions through the same Strategy contract. Template Method instead fixes a call skeleton and exposes deliberate subclass steps.

**Explain it:** Which part varies, who selects it, and which object keeps transaction ownership?

**Limit:** Conceptual pattern comparison, not executable ABAP or a universal approval rule. Framework-owned construction may require a supported delegation seam.

</details>

## PAT-03 A legacy posting API has awkward parameters and a three-step prepare/check/post sequence. Would you build an Adapter, a Facade, or both?

**Level:** Senior

**Short answer:** Use an Adapter to translate the application's posting contract into the legacy API's types, identities and error representation. A Facade can expose a coherent business operation over the three underlying steps. They may coexist, but their boundaries must preserve authorization, failure information and transaction ownership. Neither pattern makes an unreleased API eligible for ABAP Cloud use or removes a nested commit. I would reject a superficially clean wrapper that hides those constraints.

**Example and follow-up:** Separate mapping tests from orchestration tests. For example, verify that a zero amount remains explicit, API warnings do not become unconditional success, and a failed check prevents posting. Expose an uncertain remote outcome distinctly from a definitive rejection so callers can reconcile instead of duplicating work.

**Avoid this mistake:** Treating any wrapper as both a supported API and a transaction adapter without inspecting its dependencies.

**Interviewer follow-ups:**

- Which errors belong to the domain contract and which retain technical detail?
- What evidence would make the legacy API unsuitable despite a neat interface?

**Strong answer criteria:**

- Separates contract translation from subsystem orchestration
- Preserves transactional and release constraints
- Tests meaningful error and value mapping

**Verification evidence:** Trace all three steps with injected failures and inspect dependency release state; assert no hidden commit or swallowed business rejection.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Adapter](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#adapter) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP ABAP pattern examples: Facade](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#facade) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.

<details>
<summary>Visual: Adapter, Facade and Decorator with observable outcomes</summary>

![Adapter, Facade and Decorator with observable outcomes](../visuals/patterns-adapter-facade-decorator.svg)

Mapping, orchestration and added behavior are different responsibilities. The lower example shows why wrapper order changes whether a log records one logical call or two attempts.

**Explain it:** Where would you translate an explicit clear, stop after a failed check, and record retry attempts?

**Limit:** The retry example is deliberately an eligible read. Write retries need the actual idempotency and uncertainty contract; no pattern automatically supplies it.

</details>

## PAT-08 A repository interface improves testability, but its RAP implementation reads managed persistence directly. What can go wrong?

**Level:** Senior

**Short answer:** The seam may be useful while the implementation is transactionally incorrect. A direct table read can miss creates, updates and deletes still in the RAP buffer. Define whether the repository contract means persisted state or the current transactional view; for transaction-sensitive BO logic, use the appropriate EML behavior access. Do not add a generic repository that writes managed tables and bypasses RAP checks. Test doubles must reproduce the relevant contract, not merely return convenient rows.

**Example and follow-up:** A reporting query and a validation inside a modify flow can legitimately need different read semantics. Give those contracts distinct names or responsibilities. Test an update followed by a read before save, plus create and delete cases; an isolated unit test alone will not reveal a wrong persistence shortcut.

**Avoid this mistake:** Equating a mockable interface with correct behavior or recreating RAP's transactional buffer in a second general-purpose cache.

**Interviewer follow-ups:**

- Which caller actually needs persisted rather than buffered state?
- What integration test would fail if the repository used SELECT instead of EML?

**Strong answer criteria:**

- Defines explicit read semantics
- Respects RAP ownership and buffer visibility
- Combines seam tests with real integration evidence

**Verification evidence:** Compare unsaved create/update/delete reads through the adapter with the BO contract, then run rollback and save paths on the target system.

**Read and verify this answer:**

- [SAP ABAP pattern examples: data-access isolation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#data-access-object-dao) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP RAP implementation contract](https://help.sap.com/docs/abap-cloud/abap-rap/general-rap-bo-implementation-contract) - Defines transaction rules; Repository is a scenario abstraction, not a claim that SAP requires this pattern.

<details>
<summary>Visual: Repository read semantics and proportional abstraction</summary>

![Repository read semantics and proportional abstraction](../visuals/patterns-repository-contract.svg)

A direct persistence read returns 100 while the transaction already sees 120. The repository seam is valuable only if its real implementation honors the state contract required by the caller.

**Explain it:** Which integration test catches a mockable repository that reads the wrong state, and when is no new abstraction needed?

**Limit:** Conceptual read semantics rather than an SQL isolation guarantee. The specific BO, EML operation, authorization and target release remain authoritative.

</details>

## PAT-09 A singleton caches the current approver and makes tests pass alone but fail as a suite. How do you redesign its lifetime?

**Level:** Senior

**Short answer:** I would remove request-specific mutable state from the singleton and make dependencies explicit. A conventional ABAP singleton is scoped to its internal session, not to all users or the whole landscape, and its lifetime can exceed one test or business operation. Prefer a freshly constructed, context-aware service or a cache with explicit key, scope and invalidation. If a shared instance is justified, specify immutability or cleanup rules and provide deterministic substitution in tests.

**Example and follow-up:** Caching the 'current user' implicitly is particularly dangerous for reusable jobs or delegated processing. Passing business context into the operation makes the dependency visible. A reset method can stabilize legacy tests temporarily, but it does not repair a production lifetime that is inconsistent with the data being cached.

**Avoid this mistake:** Claiming singleton means one system-wide instance or solving hidden state solely by forcing test order.

**Interviewer follow-ups:**

- What exact lifetime is required by the cached value?
- How would two simulated users in one test expose the defect?

**Strong answer criteria:**

- Scopes singleton state accurately
- Removes hidden request context
- Distinguishes test cleanup from production correctness

**Verification evidence:** Run tests in multiple orders and reuse one session across different users or contexts; assert no stale decisions and deterministic dependency replacement.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Singleton](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#singleton) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP Clean ABAP: state lifetime](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#dont-mix-stateful-and-stateless-in-the-same-class) - Supports the stated design or testability principle; concrete scenario decisions are contextual recommendations.

<details>
<summary>Visual: Observer delivery and hidden singleton state</summary>

![Observer delivery and hidden singleton state](../visuals/patterns-observer-lifetime.svg)

A registered local handler can update an ALV, while an external process needs transactional publication and durable processing evidence. Session-shared mutable state is a separate source of repeated-test failures.

**Explain it:** Which facts survive a process restart, and which request-specific values must not be cached implicitly?

**Limit:** The lower path describes required responsibilities, not an automatic feature of ABAP Objects events. Verify the chosen event infrastructure and service lifetime.

</details>

## SQLX-01 A CDS table function joins client-dependent purchasing data in SQLScript, writes a helper table, and assumes the outer CDS DCL protects every internal read. Would you approve it?

**Level:** Senior

**Short answer:** No. For the documented CDS table-function contract, the AMDP database function is read-only, uses SQLScript on HANA and must satisfy the applicable client-safety rules. I would remove the write and review every source, join and client boundary rather than trust an outer annotation. Client isolation and business authorization are separate concerns: establish protection at the supported consumption path and do not assume SQLScript reproduces ABAP SQL or CDS access-control behavior automatically. Confirm target-release and language-version eligibility first.

**Example and follow-up:** Use two clients containing the same business key and two users with different purchasing scopes. Verify that results, aggregates and error behavior cannot expose foreign data. Check the declared return types and result grain as well as the USING dependencies. Prefer a supported CDS or ABAP SQL expression if it already meets the requirement; a table function adds a database-specific contract.

**Avoid this mistake:** Treating every AMDP method as read-only, or treating this read-only table-function constraint as permission to read any SAP table. General AMDP capabilities and eligible dependencies are separate.

**Interviewer follow-ups:**

- How would a cross-client join contaminate an aggregate even if the final rows are later filtered?
- What evidence shows that both client isolation and the consumer's business authorization are enforced?

**Strong answer criteria:**

- Distinguishes table-function restrictions from general AMDP capabilities
- Reviews client safety and authorization as separate boundaries
- Verifies target support, dependencies and result contract

**Verification evidence:** Activate against the intended release, inspect dependencies and trace the real consumption path; test overlapping keys across clients and allowed/denied purchasing scopes.

**Read and verify this answer:**

- [SAP CDS table functions: SQLScript, read-only and client safety](https://help.sap.com/docs/ABAP_PLATFORM_NEW/67e4075c942e43d4a9f6f891a8dafcf4/ed4c5fc6d3fd43ebb355f12aa1e73757.html) - Primary reference reviewed in the 2025 FPS01 documentation; verify the corresponding contract on the actual target.
- [SAP ABAP data models and access-control concepts](https://help.sap.com/docs/abap-cloud/abap-data-models/learn) - Separates CDS data-model and authorization concepts; the client/authorization test fixture is original analysis.

<details>
<summary>Visual: HANA pushdown: result grain and table-function review</summary>

![HANA pushdown: result grain and table-function review](../visuals/hana-grain-review.svg)

A two-language text join duplicates both item amounts. Repair the relationship before accepting a performance rewrite, then verify security, client isolation and the chosen implementation contract.

**Explain it:** Why would DISTINCT or dividing by two be an unreliable repair, and what metrics would justify pushdown?

**Limit:** Illustrative data, not a benchmark. Read-only here refers to the cited CDS table-function scenario, not every AMDP method; check target rules and consumption-path security.

</details>

## DELIV-01 A pull request passes local linting and its ABAP sources are pushed with abapGit. The team calls the cloud feature deployed. What evidence and delivery steps are missing?

**Level:** Senior

**Short answer:** Git records source history; abapGit transfers supported development objects. Neither statement proves target activation or productive delivery. Establish the product-specific lifecycle route, software component and dependency order; BTP ABAP environment can use supported transport/gCTS or add-on delivery scenarios, while other ABAP Cloud environments have their own routes. Tie the source revision to target syntax/activation, ATC, meaningful ABAP Unit and integration results, then verify the imported revision, service access and configuration in the intended system.

**Example and follow-up:** A CI result must name what actually ran and where: local lint is not SAP activation, and mocked tests do not prove runtime authorization. Include dependency versions, transport or delivery identifiers, import evidence, communication setup and recovery ownership. Keep technical identities and secrets out of Git. A source export can support review without representing a complete deployable application.

**Avoid this mistake:** Equating an abapGit push with a transport release, treating gCTS and abapGit as interchangeable names, or applying one BTP delivery route to every ABAP Cloud product.

**Interviewer follow-ups:**

- How would you prove the tested source revision is the one imported into the target?
- Which prerequisites can make an active service fail after an otherwise successful import?

**Strong answer criteria:**

- Separates source control, source transfer and runtime delivery
- Chooses a lifecycle route for the actual product
- Requires traceable target checks and operational readiness

**Verification evidence:** Record commit, component/dependency versions and delivery IDs; retain target activation/ATC/test/import logs and a service smoke test with an authorized and a denied identity.

**Read and verify this answer:**

- [SAP: working with abapGit](https://help.sap.com/docs/btp/sap-business-technology-platform/working-with-abapgit?ai=true) - Describes source transfer, supported-object restrictions and activation after import; source transfer is distinct from deployment evidence.
- [SAP BTP ABAP environment: delivery via add-on or gCTS](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/delivery-via-add-on-or-gcts?locale=en-US) - Documents these BTP ABAP environment delivery options and their checks; do not generalize the scenario to every ABAP Cloud edition.

<details>
<summary>Visual: Source transfer, delivery and verified runtime evidence</summary>

![Source transfer, delivery and verified runtime evidence](../visuals/delivery-source-runtime-evidence.svg)

Four evidence layers answer different questions. A release links the reviewed and tested revision to an actual imported state, then verifies the target consumer and configuration.

**Explain it:** Which artifact proves what was imported, and what can fail after a successful import?

**Limit:** REV-42, D-17 and TST are fictional identifiers. The table is an evidence checklist, not a mandatory sequence requiring abapGit in every transport landscape.

</details>
