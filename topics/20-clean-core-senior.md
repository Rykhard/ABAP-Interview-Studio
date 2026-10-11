# Senior Clean Core governance and tradeoffs

Clean Core decisions require evidence about dependencies, supported extension contracts, business impact, and ownership. These scenarios use A-D as extensibility classifications while keeping API release contracts and ATC severities separate. A senior answer should make uncertainty visible, defend a practical decision, and define how the organization will detect and reduce the remaining risk.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

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

## GOV-03 A team wraps an internal SAP function module and releases the wrapper. Has the technical debt disappeared?

**Level:** Senior

**Short answer:** No. A wrapper can isolate callers, translate contracts, and create a replaceable boundary, but it does not change the release status or upgrade exposure of its underlying dependency. I would record both the consumer's contract and the wrapper's implementation risk. Where classic boundaries are allowed, the wrapper needs an owner, regression tests, target-release assessment, and an exit plan. I would also question whether the wrapper adds useful isolation or merely renames the same unstable interface.

**Example and follow-up:** If the wrapper publishes the internal function's structures unchanged, a provider change can still propagate directly to every consumer. A narrower application contract can contain that change. SAP's current level guidance includes wrappers over classified classic APIs in Level B scope; wrapping an internal object does not make that dependency classified classic.

**Avoid this mistake:** A customer release flag does not turn an unreleased SAP dependency into a released SAP API or erase its classification.

**Interviewer follow-ups:**

- Which unstable details must stay behind the wrapper?
- Who replaces the dependency when a released alternative becomes available?

**Strong answer criteria:**

- Tracks underlying exposure
- Designs a narrow stable boundary
- Assigns replacement ownership

**Verification evidence:** A wrapper dependency record, contract tests, an owner, and a documented replacement trigger with the current target-release assessment.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

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

## GOV-05 A Level B solution works in Private Edition. Can the same approval justify deploying it in Public Edition?

**Level:** Senior

**Short answer:** No. Clean Core classification does not override the target product's available development model, APIs, or extension mechanisms. I would reassess the requirement against Public Edition's supported configuration, key-user and developer extensibility, and remote integration options. A classified classic API acceptable in a private-edition context may not be available there. The governance record should describe that portability gap openly and compare a supported redesign with retaining the current deployment for a justified business reason.

**Example and follow-up:** A classic enhancement or SAP GUI-dependent component may have a stable role in an existing private-edition application but no permitted equivalent in the proposed public-cloud scope. Moving only its UI to BTP does not restore access to an unavailable backend API. Validate the actual business operation end to end.

**Avoid this mistake:** Level B is not a universal deployment permission, and Level A design does not guarantee identical API coverage across editions.

**Interviewer follow-ups:**

- Which part of the solution is genuinely portable?
- What evidence would justify keeping a private-edition dependency?

**Strong answer criteria:**

- Checks target-edition constraints
- Separates classification from portability
- Offers supported redesign options

**Verification evidence:** An edition capability comparison with verified target APIs, extension points, and a documented functional gap for each nonportable component.

**Read and verify this answer:**

- [SAP extensibility options by environment and language version](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility) - Check classification, release scope and governance separately.

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

## GOV-06 You have thousands of custom objects and a limited upgrade budget. How would you prioritize remediation?

**Level:** Senior

**Short answer:** I would combine usage evidence, business criticality, dependency classification, known target-release changes, and remediation effort. Unused objects may be retirement candidates after validating completeness of the observation window. High-impact Level D or changed internal dependencies usually warrant early investigation, while stable low-risk dependencies can follow a planned backlog. Object counts alone are misleading: one heavily used posting dependency can matter more than hundreds of harmless utilities. Each prioritized item needs an owner and acceptance criteria.

**Example and follow-up:** A year-end report can look unused during a three-month trace window. Deleting it based only on that sample would create a business outage. Conversely, a rarely executed emergency posting tool may still have high operational criticality. Combine telemetry with process-owner confirmation and target-upgrade impact analysis.

**Avoid this mistake:** Do not equate low execution frequency with low business importance or treat every finding as equal remediation work.

**Interviewer follow-ups:**

- How would you avoid retiring seasonal functionality?
- What makes one Level C dependency more urgent than another?

**Strong answer criteria:**

- Combines usage and business impact
- Uses target-release change evidence
- Prioritizes actionable owned work

**Verification evidence:** A ranked remediation portfolio with usage-window limitations, business-owner decisions, dependency impact, estimated effort, and target-release tests.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## GOV-07 No released API supports a required business operation. What would your escalation contain?

**Level:** Senior

**Short answer:** I would describe the business outcome, target product and release, required operation and transaction semantics, expected volume, and the precise missing capability. I would document searched APIs and extension points, explain why standard configuration or a remote alternative does not fit, and provide a minimal reproducible example where useful. The escalation should support an actionable provider decision while the project evaluates a bounded process change, delayed scope, or an edition-appropriate governed alternative.

**Example and follow-up:** Saying 'please release this table' may prescribe a fragile implementation rather than explain the need. A request for a supported command to close a document, including authorization, validation, and failure semantics, gives the provider a clearer requirement. Any interim workaround still needs its own risk and retirement record.

**Avoid this mistake:** An API-gap ticket does not authorize direct table access or promise that the requested API will arrive by the project's deadline.

**Interviewer follow-ups:**

- What evidence shows that existing APIs really do not fit?
- How do you keep delivery moving without hiding the gap?

**Strong answer criteria:**

- Escalates a business capability
- Documents rejected supported alternatives
- Defines an explicit interim plan

**Verification evidence:** A capability-gap dossier with release-specific API searches, required semantics, a reproducible scenario, and a decision on interim scope.

**Read and verify this answer:**

- [SAP extensibility options by environment and language version](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility) - Check classification, release scope and governance separately.

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

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-08 The business asks to reproduce a heavily customized legacy process exactly. How do you challenge that without dismissing the requirement?

**Level:** Senior

**Short answer:** I would separate mandatory business outcomes from historical implementation choices, then demonstrate how standard configuration and supported extensions meet each outcome. Legal, contractual, and differentiating requirements deserve explicit evidence; familiar screen sequences alone may not. I would quantify the cost of preserving deviations, including upgrade tests and operations, and compare a smaller supported extension or process adjustment. The business owner should decide with concrete examples of retained value, changed behavior, and residual risk.

**Example and follow-up:** A legacy approval screen might combine fields that standard applications split across steps, while the actual control requirement is segregation of duties and an auditable decision. Recreating the old screen through internal hooks can add risk without preserving additional value. A process walkthrough should expose exceptions, not only the happy path.

**Avoid this mistake:** Fit-to-standard is not a slogan for refusing real requirements, and exact visual parity is not always the real business invariant.

**Interviewer follow-ups:**

- Which requirement is mandatory and who can prove it?
- What exception case could invalidate the proposed standard process?

**Strong answer criteria:**

- Separates outcomes from historical design
- Uses concrete process demonstrations
- Makes cost and ownership visible

**Verification evidence:** A fit-gap matrix with business-owner acceptance, exception-path demonstrations, and lifecycle cost estimates for retained deviations.

**Read and verify this answer:**

- [SAP Clean Core dimensions beyond extensions](https://learning.sap.com/courses/exploring-sap-cloud-erp/utilizing-the-clean-core-strategy-and-extensibility-tools_e566204e-1bd6-4fa2-9c54-ed61ceaf98ae) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## GOV-09 Your team wants to release a custom API used by three other teams. What must be ready before setting its release state?

**Level:** Senior

**Short answer:** I would require a deliberate public surface, supported use cases, error and transaction semantics, authorization expectations, and a named owner prepared to maintain compatibility. Consumers need stable types and behavior, not leaked persistence details. I would capture a delivered API baseline, configure applicable compatibility checks, and define deprecation and successor policies. If the interface is still experimental and coordinated internal reuse is sufficient, a supported component-access arrangement may be more honest than a premature stability promise.

**Example and follow-up:** Removing an optional field or changing a rounding rule can break a consumer even if the developer considers it cleanup. Compatibility snapshots help detect relevant technical changes, while consumer tests protect business semantics. Do not regenerate the baseline merely to silence findings from an incompatible change to a delivered contract.

**Avoid this mistake:** Releasing an API is a provider commitment; broad access permission is not equivalent to a stable contract.

**Interviewer follow-ups:**

- Which changes can be detected statically and which need consumer tests?
- How would you deprecate the API without breaking current users?

**Strong answer criteria:**

- Defines provider obligations
- Protects delivered baselines
- Combines technical and semantic checks

**Verification evidence:** An API specification, owner and consumer list, prior-delivery snapshot, compatibility results, and consumer-contract test evidence.

**Read and verify this answer:**

- [SAP release contracts, visibility, and API lifecycle states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Check classification, release scope and governance separately.
- [SAP software component dependencies and compatibility snapshots](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-component-dependencies) - Check classification, release scope and governance separately.

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

## GOV-11 How would you enforce Clean Core in delivery without blocking every legacy transport immediately?

**Level:** Senior

**Short answer:** I would establish a trustworthy baseline, prevent new unapproved exposure, and prioritize remediation of existing risk through owned work. Gates should use the applicable language checks, API and enhancement checks, compatibility checks, and security or correctness tests for the target environment. Existing exceptions need bounded review rather than silent suppression. I would record the variant, priorities, scope, and baseline policy so a green gate has a reproducible meaning and developers receive feedback before release day.

**Example and follow-up:** A transport that changes a legacy report's layout should not automatically trigger an unplanned rewrite of the entire application, but it also must not introduce a new internal write dependency unnoticed. Separate unchanged baseline exposure from new findings, then require review when an edit changes the risk of an existing exception.

**Avoid this mistake:** A baseline is not approval for unlimited new debt, and transport blocking thresholds are configured policy rather than a universal property of every ATC check.

**Interviewer follow-ups:**

- What happens when a touched legacy dependency becomes riskier?
- How do you stop teams from weakening the shared check variant?

**Strong answer criteria:**

- Distinguishes baseline from new risk
- Uses reproducible early gates
- Governs exception and policy changes

**Verification evidence:** A versioned gate policy, representative pass/fail cases, a protected check-configuration record, and a baseline-to-current findings comparison.

**Read and verify this answer:**

- [SAP ATC configuration and transport-release governance](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/set-up-add-on-development) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-12 A vendor upgrade changes an object used by an approved Level C extension. How do you organize the response?

**Level:** Senior

**Short answer:** I would identify affected consumers and business processes, compare the old and new provider behavior, and determine whether a released alternative now exists. The approved exception should trigger reassessment for this target release. I would reproduce the failure in an upgrade environment, adapt the isolated boundary if still justified, and run focused integration and regression tests. Delivery must coordinate vendor and customer changes, with rollback or business recovery defined for persistence or contract changes.

**Example and follow-up:** An internal object's unchanged signature can conceal different defaulting or validation behavior. Conversely, an activation failure may reveal a straightforward type change. Both require more than a syntax fix: test postings, authorizations, messages, and affected data transitions against the intended business outcome, using the actual upgraded system revision.

**Avoid this mistake:** A previous exception or successful prior upgrade does not prove compatibility with the next vendor release.

**Interviewer follow-ups:**

- How do you distinguish an API change from a data-dependent defect?
- Would you keep the exception if a suitable released successor is now available?

**Strong answer criteria:**

- Reassesses release-specific exposure
- Tests semantic behavior
- Coordinates recovery and replacement

**Verification evidence:** A target-upgrade impact record, reproduced failure, reviewed boundary change, and process regression results tied to both vendor and custom revisions.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-13 What would a credible two-year custom-code modernization roadmap look like?

**Level:** Senior

**Short answer:** I would organize the roadmap by business capability and lifecycle risk, with early retirement of confirmed unused functionality and focused replacement of high-exposure dependencies. New development should follow supported ABAP Cloud contracts where suitable, while valuable classic capabilities can coexist under explicit governance. Each phase needs measurable outcomes, owners, dependencies, and operational acceptance. The roadmap must reserve capacity for API changes and upgrades rather than promise that every object will be rewritten in RAP by a fixed date.

**Example and follow-up:** One phase might remove an unused interface, another replace internal reads with a released query, and another redesign a transaction that owns an unstable posting path. These changes produce different benefits and require different tests. Counting converted classes alone can reward cosmetic work while leaving the highest-risk dependency untouched.

**Avoid this mistake:** Modernization is not measured reliably by RAP object count or by replacing all classic code regardless of business value.

**Interviewer follow-ups:**

- What quarterly outcome would demonstrate reduced upgrade risk?
- How do you fund remediation that has no visible new UI feature?

**Strong answer criteria:**

- Prioritizes capability outcomes
- Preserves justified coexistence
- Uses measurable risk reduction

**Verification evidence:** A capability-based roadmap with owners, usage decisions, target dependency reductions, migration acceptance criteria, and budgeted upgrade work.

**Read and verify this answer:**

- [SAP Clean Core dimensions beyond extensions](https://learning.sap.com/courses/exploring-sap-cloud-erp/utilizing-the-clean-core-strategy-and-extensibility-tools_e566204e-1bd6-4fa2-9c54-ed61ceaf98ae) - Check classification, release scope and governance separately.

## GOV-14 A classified classic API meets the need, while a released API covers only half the operation. Would you accept Level B?

**Level:** Senior

**Short answer:** In a target environment that permits the classic approach, I would compare the supported business completeness and lifecycle risk of both options. A properly classified Level B API can be a defensible choice; it is not automatically a defect to rewrite. I would verify that the complete dependency path and extension technique qualify, avoid misleading Level A claims, and preserve a migration option. The decision must not override Public Edition or ABAP Cloud language restrictions.

**Example and follow-up:** Splitting one business operation across an incomplete released API and direct table updates can be worse than using a complete classified classic business API. The comparison should include transaction integrity, supported fields, authorization, maintainability, and future product direction. Confirm classification of the specific object instead of generalizing from the word BAPI.

**Avoid this mistake:** Not every old API is Level B, and a Level B assessment does not make it directly callable from restricted ABAP Cloud code.

**Interviewer follow-ups:**

- What makes the exact API qualify as classic rather than internal?
- What would cause you to revisit this decision after an upgrade?

**Strong answer criteria:**

- Makes an evidence-based B decision
- Preserves transaction completeness
- Respects target and language constraints

**Verification evidence:** Specific object-classification evidence, a complete operation test, a comparison with released alternatives, and a scheduled reassessment trigger.

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
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## GOV-15 A required report uses an internal read object with no current replacement. Would you accept Level C, and under what conditions?

**Level:** Senior

**Short answer:** I would first verify the actual gap, data semantics, authorization, and deployment constraints. If a permitted Level C dependency remains necessary, I would isolate its use, limit the public contract, record the target-release exposure, and assign an owner for provider changes and replacement. Read-only access lowers some transaction risks but does not eliminate confidentiality, correctness, or upgrade risk. Acceptance should be specific, time-bounded or trigger-bound, and supported by representative result and authorization tests.

**Example and follow-up:** An internal view may change filtering or joins without causing a syntax error, yielding duplicate rows or exposing unintended data. A regression fixture should check business totals, row identity, and denied access, not merely successful execution. Where release-specific change information is available, use it as an input rather than a complete compatibility guarantee.

**Avoid this mistake:** Read-only does not mean risk-free, and Level C is not a blanket exemption for all internal objects or non-recommended Level D techniques.

**Interviewer follow-ups:**

- What result change could escape an activation check?
- Which precise event forces this exception back into review?

**Strong answer criteria:**

- Treats read semantics as consequential
- Isolates and owns exposure
- Defines focused compatibility evidence

**Verification evidence:** A bounded exception with dependency classification, authorization and result baselines, target-upgrade checks, and replacement-review triggers.

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
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-16 How would you assess a solution that uses a released CDS query, a classified classic BAPI, an internal class, and a modification?

**Level:** Senior

**Short answer:** I would assess the four paths separately and confirm their actual usage and applicable classifications on the target system. The released query can support Level A use when consumed under the right contract; the classified classic API introduces Level B scope, the internal dependency Level C scope, and a non-recommended modification can introduce Level D exposure. I would not average these into a reassuring score. I would identify affected capabilities, alternatives, criticality, and the highest-risk remediation first.

**Example and follow-up:** The modification may be in an unused historical path, while the internal class supports daily financial posting. Both facts matter to sequencing, but neither changes the factual dependency record. Removal requires usage validation and process-owner approval; replacing a dependency requires proving the same intended business operation and error behavior.

**Avoid this mistake:** A single letter for a mixed solution can hide scope; classification and remediation priority are related but are not the same decision.

**Interviewer follow-ups:**

- Which capability would you remediate first and why?
- What evidence is required before removing the modification?

**Strong answer criteria:**

- Classifies paths rather than averages
- Separates exposure from priority
- Uses business and usage evidence

**Verification evidence:** A scoped assessment table linking each dependency to classification evidence, process impact, usage, ownership, and a justified remediation decision.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check classification, release scope and governance separately.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## GOV-17 The sponsor says Clean Core is a developer concern and rejects funding for integration monitoring and data cleanup. How would you negotiate?

**Level:** Senior

**Short answer:** I would connect the proposal to operational and business outcomes: failed interfaces, unreliable master data, unsupported software, and complex process variants can prevent safe upgrades even when custom code is well structured. Clean Core includes more than extension code. I would present concrete incidents or scenario costs, propose a minimum owned control set, and distinguish mandatory controls from improvements that can be phased. The sponsor should explicitly decide which residual business risks remain and who operates them.

**Example and follow-up:** A technically released order API still fails repeatedly when customer mappings are invalid and nobody owns the error queue. Developers cannot solve that through an ATC exemption or another wrapper. A practical agreement assigns mapping ownership, alert response, reconciliation, and cleanup priorities with measurable service expectations.

**Avoid this mistake:** A strong extensibility classification does not certify clean data, standard processes, secure integrations, or effective operations.

**Interviewer follow-ups:**

- Which control delivers the highest near-term business value?
- Who is accountable when an interface remains technically successful but business processing is incomplete?

**Strong answer criteria:**

- Connects non-code controls to outcomes
- Negotiates proportional phased scope
- Assigns business and operational ownership

**Verification evidence:** A responsibility matrix, costed minimum control plan, measurable operational targets, and documented acceptance of deferred risks.

**Read and verify this answer:**

- [SAP Clean Core dimensions beyond extensions](https://learning.sap.com/courses/exploring-sap-cloud-erp/utilizing-the-clean-core-strategy-and-extensibility-tools_e566204e-1bd6-4fa2-9c54-ed61ceaf98ae) - Check classification, release scope and governance separately.

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

## Official references

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487)
- [SAP release contracts, visibility, and API lifecycle states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis)
- [SAP software component dependencies and compatibility snapshots](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-component-dependencies)
- [SAP software component relations and consistency checks](https://help.sap.com/docs/ABAP_PLATFORM_NEW/c238d694b825421f940829321ffa326a/e9bd731abe1b424d8e6f25f47a2868a8.html)
- [SAP ATC configuration and transport-release governance](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/set-up-add-on-development)
- [SAP ADT release notes: ABAP_CLEAN_CORE_READINESS check variant](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-eclipse-release-notes/release-notes-of-abap-development-tools-for-eclipse-3-58)
- [SAP extensibility options by environment and language version](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility)
- [SAP Clean Core dimensions beyond extensions](https://learning.sap.com/courses/exploring-sap-cloud-erp/utilizing-the-clean-core-strategy-and-extensibility-tools_e566204e-1bd6-4fa2-9c54-ed61ceaf98ae)
