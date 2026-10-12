# Senior Clean Core governance and tradeoffs

Clean Core decisions require evidence about dependencies, supported extension contracts, business impact, and ownership. These scenarios use A-D as extensibility classifications while keeping API release contracts and ATC severities separate. A senior answer should make uncertainty visible, defend a practical decision, and define how the organization will detect and reduce the remaining risk.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## GOV-01 A project claims Level A because its frontend uses RAP. How would you assess the extension?

**Level:** Senior

**Short answer:** Check the whole extension, including wrappers and the SAP objects they call. RAP and Fiori do not decide the Clean Core level. A depends on released contracts; B uses classified classic options; C uses internals; D uses non-recommended dependencies or techniques. Record the actual classification for each path on the target system. Do not call a mixed solution entirely Level A.

**Reasoning and example:** A RAP handler calls a custom wrapper, which then calls an internal SAP class. Looking only at the handler's released custom interface misses the underlying dependency. Assess the consumer and wrapper separately where appropriate, but include both in the delivered solution's dependency record. A customer namespace does not erase the risk.

Link each finding to the business capability it affects and the person responsible for maintaining it. Confirm the applicable API state, classification, and ATC result for the same source version. A passing UI test shows that a tested interaction worked, not that every call underneath uses Level A interfaces. State clearly what is included in any classification claim.

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

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

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

**Short answer:** These are two different naming systems. C0 means Extend, C1 means Use System-Internally, and C2 means Use as Remote API. They are release-contract purposes, not Clean Core levels A to D. Check the object's visibility for the intended caller too. A C1 release does not by itself authorize remote exposure or classify the dependency as Level C.

**Reasoning and example:** A locally released class may be suitable for an on-stack application without being a remote API. If you build a custom remote service over it, you become the provider of a new interface. You must define authentication, business permissions, errors, transaction behavior, and how callers can rely on future versions.

The local API has not magically changed to C2, and your service does not inherit guarantees that its provider never made. Inspect API-state properties and documentation for the exact supported use. Keep the separate questions clear: what release purpose is allowed, who may consume it, and what Clean Core classification applies to the implementation's actual dependencies?

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

- [SAP release contracts, visibility, and API lifecycle states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

<details>
<summary>Visual: Release contracts versus Clean Core levels</summary>

![Release contracts versus Clean Core levels](../visuals/senior-contracts-versus-levels.svg)

The two tables are separate classification axes. C1 identifies a local-use contract, while Level C identifies internal-object exposure in the Clean Core assessment context.

**Explain it:** What else must you verify after finding a C1 release flag, and why does a wrapper not erase the underlying exposure?

**Limit:** These are the three contracts requested for this comparison, not the complete release-contract catalogue. Exact object classification, extension technology, target edition, and ATC scope remain decisive.

</details>

## GOV-03 A team wraps an internal SAP function module and releases the wrapper. Has the technical debt disappeared?

**Level:** Senior

**Short answer:** No. A wrapper can protect callers from some changes, but the underlying SAP dependency still has its original release status and upgrade risk. Record both the wrapper's public promise and its implementation dependency. Where allowed, give it an owner, regression tests, and a replacement plan. A useful wrapper hides unstable details; merely renaming the same internal interface adds little protection.

**Reasoning and example:** If the wrapper exposes the internal function module's structures unchanged, a provider change can still spread to every caller. A smaller request and result designed around the business need can contain more of that change inside the wrapper. Test those promised inputs, outcomes, and failures rather than only checking that the call returns.

A wrapper over a classified classic API can fall within the applicable Level B guidance. Wrapping an internal object does not make it a designated classic API. Keep the target-release assessment visible and define when a released replacement should be adopted. Your own release flag is a promise you maintain, not a way to change SAP's classification of its underlying object.

**Avoid this mistake:** A customer release flag does not turn an unreleased SAP dependency into a released SAP API or erase its classification.

**Interviewer follow-ups:**

- Which unstable details must stay behind the wrapper?
- Who replaces the dependency when a released alternative becomes available?

**Strong answer criteria:**

- Records the underlying dependency risk
- Provides a small stable interface
- Names who replaces the dependency

**Verification evidence:** A wrapper dependency record, contract tests, an owner, and a documented replacement trigger with the current target-release assessment.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

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

**Short answer:** Make the exception specific: business need, exact finding, source scope, target edition, alternatives, risk owner, and supporting tests. Give it an expiry or review trigger and a realistic fix plan. An ATC exemption changes how a finding is handled. It does not make forbidden code legal or turn the dependency into Level A. The release decision must accept the remaining risk explicitly.

**Reasoning and example:** An approved exception covers one read-only adapter. A later change adds a write through another internal call. That new risk must not silently inherit the old approval. Tie the exception to the relevant objects and finding category, rerun checks after changes, and revisit it when the provider or target release changes.

Keep security and transaction defects visible as separate decisions; they are not automatically accepted by a Clean Core waiver. State which tests reduce the risk and who will replace the dependency. An indefinite blanket exemption makes future changes hard to assess. A bounded exception lets the team deliver a justified need while preserving a clear limit on what was actually accepted.

**Avoid this mistake:** An approved exemption is not a reclassification to Level A and must not become a general permission to bypass ABAP Cloud restrictions.

**Interviewer follow-ups:**

- What event invalidates this exception?
- How do you prevent the approved scope from growing unnoticed?

**Strong answer criteria:**

- Limits what the exception covers and how long it lasts
- Names who accepts and owns the risk
- Distinguishes exempting a finding from permission to use an API

**Verification evidence:** An exception record linked to the exact ATC finding, source revision, release target, regression evidence, owner, and expiry or review trigger.

**Read and verify this answer:**

- [SAP ATC configuration and transport-release governance](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/set-up-add-on-development) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-05 A Level B solution works in Private Edition. Can the same approval justify deploying it in Public Edition?

**Level:** Senior

**Short answer:** No. A Level B decision does not override Public Edition's supported APIs, language rules, or extension options. Reassess the business need for that target using configuration, key-user tools, developer extensibility, and supported remote integration. Identify what cannot move and compare a supported redesign with keeping the current deployment. Even Level A does not guarantee identical capabilities across editions.

**Reasoning and example:** A Private Edition app uses a classic enhancement or SAP GUI-dependent component. It may have a justified role there but no supported equivalent in the proposed Public Edition scope. Moving its screen to BTP does not make an unavailable backend operation suddenly callable. Test the required business operation against actual target APIs.

Separate the parts that can be reused from those needing redesign. Record each missing capability and its effect on the process, then let the business compare alternatives with evidence. Prior approval of a dependency in one landscape is not permission in another. Classification helps assess risk; product availability and technical restrictions still determine which solution can be built.

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

- [SAP extensibility options by environment and language version](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

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

**Short answer:** Prioritize by actual use, business importance, dependency risk, target-upgrade changes, and effort. Validate unused-code candidates before retiring them. Investigate high-impact non-recommended or changed internal paths early, and give remaining work owners and acceptance criteria. Do not rank only by object count or execution frequency. One critical posting dependency may matter more than hundreds of small utilities.

**Reasoning and example:** A year-end report has no executions in a three-month trace. Deleting it based on that trace alone can cause an outage at closing time. An emergency posting tool may run only once a year and still be essential when it is needed. Combine usage evidence with process-owner confirmation and the limits of the observation period.

Then compare target-upgrade changes with business impact and replacement cost. A daily financial dependency that changes in the target release may deserve urgent attention, while an unaffected lower-risk utility can wait. Record why each item has its priority and how success will be tested. A large findings count is not yet a useful remediation plan.

**Avoid this mistake:** Do not equate low execution frequency with low business importance or treat every finding as equal remediation work.

**Interviewer follow-ups:**

- How would you avoid retiring seasonal functionality?
- What makes one Level C dependency more urgent than another?

**Strong answer criteria:**

- Combines usage with business importance
- Uses evidence about changes in the target release
- Prioritizes work with clear owners

**Verification evidence:** A ranked remediation portfolio with usage-window limitations, business-owner decisions, dependency impact, estimated effort, and target-release tests.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## GOV-07 No released API supports a required business operation. What would your escalation contain?

**Level:** Senior

**Short answer:** Describe the business operation you need, the target product and release, and why existing supported options do not meet it. Include transaction behavior, permissions, expected volume, and failure needs. Provide a small reproducible example where helpful. Ask for a supported capability rather than simply a table release. Meanwhile, choose an explicit interim process, scope change, or permitted governed alternative.

**Reasoning and example:** Instead of saying release this table, explain that the application must close a document with the right validations, permissions, and failure response. Show which APIs and extension points were checked and the exact operation each cannot provide. That gives the provider a requirement it can act on without committing to your proposed internal implementation.

The project still needs a plan while the request is assessed. It may delay this feature, adjust the process, or use an edition-appropriate temporary exception with a retirement condition. Opening an API-gap ticket does not authorize direct table access, and it does not guarantee a delivery date. Keep the gap visible rather than hiding it inside a workaround.

**Avoid this mistake:** An API-gap ticket does not authorize direct table access or promise that the requested API will arrive by the project's deadline.

**Interviewer follow-ups:**

- What evidence shows that existing APIs really do not fit?
- How do you keep delivery moving without hiding the gap?

**Strong answer criteria:**

- Requests a supported business operation
- Explains why supported alternatives do not fit
- Defines what the project will do while waiting

**Verification evidence:** A clear API-gap record with searches for the target release, required operation and failure behavior, a reproducible example, and the chosen interim scope.

**Read and verify this answer:**

- [SAP extensibility options by environment and language version](https://help.sap.com/docs/abap-cloud/abap-cloud/extensibility) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

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

**Short answer:** Separate the business result that must be preserved from the old screen or implementation. Demonstrate how standard configuration and supported extensions meet that result, including exception cases. Keep legal and contractual requirements explicit. Compare the ongoing cost of each retained customization with its value. Let the business owner decide using concrete behavior, cost, and risk rather than slogans.

**Reasoning and example:** The old approval screen combines several steps that standard applications separate. The real control may be that the requester cannot approve their own request and that every decision is recorded. Rebuilding the exact screen through internal hooks may add upgrade risk without improving either control. Walk through those requirements with the process owner.

Include unusual cases such as withdrawal, delegation, and rejected approvals so standard functionality is not accepted on a happy-path demo alone. Where a real requirement is missing, compare a supported extension or process adjustment with preserving the deviation. Fit-to-standard should help make that tradeoff visible, not dismiss a legitimate need or assume visual parity is the only measure of success.

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

- [SAP Clean Core dimensions beyond extensions](https://learning.sap.com/courses/exploring-sap-cloud-erp/utilizing-the-clean-core-strategy-and-extensibility-tools_e566204e-1bd6-4fa2-9c54-ed61ceaf98ae) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

## GOV-09 Your team wants to release a custom API used by three other teams. What must be ready before setting its release state?

**Level:** Senior

**Short answer:** Before release, define the API's supported inputs, outcomes, errors, transaction behavior, and permissions. Give it an owner willing to maintain compatibility. Keep stable types and behavior public and private storage details private. Capture a delivered baseline and set compatibility, deprecation, and successor rules. If the API is still experimental, coordinated component access may fit better than a premature stability promise.

**Reasoning and example:** Three teams already call a pricing API. Removing an optional field or changing rounding may look like cleanup to the provider but break one caller's business result. Keep a snapshot of what was delivered and use the applicable compatibility checks for detectable technical changes. Consumer tests cover meanings and outcomes that a signature comparison cannot prove.

Do not replace the old baseline just to silence a genuine incompatibility finding. Plan how current users migrate when a breaking change is needed, and communicate support periods. Supported access permission can enable internal collaboration, but releasing a stable API is a stronger ongoing commitment. Set the release state only when the provider is prepared to meet that commitment.

**Avoid this mistake:** Releasing an API is a provider commitment; broad access permission is not equivalent to a stable contract.

**Interviewer follow-ups:**

- Which changes can be detected statically and which need consumer tests?
- How would you deprecate the API without breaking current users?

**Strong answer criteria:**

- Defines what the API owner must maintain
- Keeps a trustworthy record of the delivered interface
- Checks both technical compatibility and business behavior

**Verification evidence:** An API specification, owner and consumer list, prior-delivery snapshot, compatibility results, and consumer-contract test evidence.

**Read and verify this answer:**

- [SAP release contracts, visibility, and API lifecycle states](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.
- [SAP software component dependencies and compatibility snapshots](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/software-component-dependencies) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

## GOV-10 The direct dependency scan is clean, but an upgrade still breaks the extension. What could the governance model be missing?

**Level:** Senior

**Short answer:** Check what the scan did not cover: indirect calls, dynamic selection, configured implementations, remote interfaces, and data assumptions. Verify its package scope, check version, and classification data too. Connect static findings with a dependency map and process tests. Clean direct references are useful evidence, but they do not prove that every runtime path will survive an upgrade.

**Reasoning and example:** A custom facade chooses an internal implementation from configuration, so scanning only its direct references misses the actual dependency. A remote service can also change independently of the ABAP transport. Include these paths in the map and assign owners who can explain and test them.

Another upgrade failure may come from data behavior: a query expected one text row, but changed data now gives several and doubles a total. No forbidden direct call is needed for that defect. Rehearse representative configured processes on the target upgrade and document what the checks and tests covered. A green result is meaningful only within that stated scope; it is not proof that all hidden assumptions are safe.

**Avoid this mistake:** A green direct-reference check is not proof that the whole solution has no unsupported or semantically fragile dependencies.

**Interviewer follow-ups:**

- How would you discover configuration-driven dependencies?
- Which runtime paths must the upgrade rehearsal cover?

**Strong answer criteria:**

- Looks for indirect, dynamic, and configured dependencies
- Checks whether the scan covered the needed objects
- Tests complete business processes

**Verification evidence:** An expanded dependency graph, documented scan scope and tool versions, and upgrade regression evidence covering configured runtime paths.

**Read and verify this answer:**

- [SAP software component relations and consistency checks](https://help.sap.com/docs/ABAP_PLATFORM_NEW/c238d694b825421f940829321ffa326a/e9bd731abe1b424d8e6f25f47a2868a8.html) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

## GOV-11 How would you enforce Clean Core in delivery without blocking every legacy transport immediately?

**Level:** Senior

**Short answer:** Record existing findings as a clear baseline and prevent new unapproved risk. Use checks appropriate to the target environment for language, APIs, extension techniques, compatibility, security, and correctness. Keep existing exceptions bounded and prioritize their fixes. Make the gate's scope and thresholds reproducible. Give developers feedback early enough to fix issues before release day.

**Reasoning and example:** A layout change to a legacy report should not automatically demand an unplanned rewrite of the whole application. It also must not quietly introduce a new internal write dependency. Compare the current findings with the accepted baseline, then review new findings and any change that makes an existing exception riskier.

Store the check variant, versions, priorities, scope, and exception policy so teams cannot redefine green by weakening checks. Protect and review policy changes. Plan remediation for existing exposure with named owners instead of suppressing it forever. The baseline explains known risk; it is not permission to add unlimited new debt, and transport-blocking priorities are a configured team policy rather than universal ATC behavior.

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

- [SAP ATC configuration and transport-release governance](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/set-up-add-on-development) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-12 A vendor upgrade changes an object used by an approved Level C extension. How do you organize the response?

**Level:** Senior

**Short answer:** Reassess the exception for the new vendor release. Find affected callers and processes, reproduce the failure, and compare old and new behavior. Check whether a suitable released replacement now exists. If the internal dependency remains justified, adapt its isolated boundary and test the full affected process. Coordinate vendor and custom delivery, including rollback or business recovery where data changes are involved.

**Reasoning and example:** An internal object's signature is unchanged, but its defaulting or validation now behaves differently. A syntax-only repair cannot show whether postings, permissions, messages, and resulting document states still meet the business need. In another case, activation fails because a type changed; fixing that type still needs behavioral regression tests.

Use the actual upgraded environment and record both vendor and custom source versions. Compare representative successful and rejected transactions, and investigate whether the defect depends on specific data. If a supported successor now covers the need, revisit keeping the exception at all. Last year's approval or successful upgrade is evidence about the previous situation, not a guarantee for this release.

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

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

<details>
<summary>Visual: Exception governance and review lifecycle</summary>

![Exception governance and review lifecycle](../visuals/senior-exception-lifecycle.svg)

A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.

**Explain it:** Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?

**Limit:** EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.

</details>

## GOV-13 What would a credible two-year custom-code modernization roadmap look like?

**Level:** Senior

**Short answer:** Build the roadmap around business capabilities and reduced maintenance risk. Retire confirmed unused functions, replace important risky dependencies, and use supported ABAP Cloud options for suitable new work. Valuable classic code can remain under clear governance. Give each phase owners, measurable outcomes, and operational acceptance. Reserve capacity for upgrades and API changes instead of promising a full RAP rewrite by a date.

**Reasoning and example:** One phase removes an unused interface after confirming business ownership. Another replaces internal reads with a released query. A third redesigns a critical posting path. These changes need different tests and deliver different benefits, so counting converted classes gives a poor picture of progress.

For each phase, say what risk or cost will decrease and how that will be demonstrated. Examples include fewer unsupported write paths, a successful target-upgrade rehearsal, or lower effort to adapt a shared interface. Budget for integration and operational acceptance, not only new screens. A roadmap can support gradual coexistence while still setting clear retirement goals for temporary bridges and unnecessary dependencies.

**Avoid this mistake:** Modernization is not measured reliably by RAP object count or by replacing all classic code regardless of business value.

**Interviewer follow-ups:**

- What quarterly outcome would demonstrate reduced upgrade risk?
- How do you fund remediation that has no visible new UI feature?

**Strong answer criteria:**

- Prioritizes outcomes for business capabilities
- Keeps justified classic and modern code working together
- Measures the reduction in maintenance and upgrade risk

**Verification evidence:** A capability-based roadmap with owners, usage decisions, target dependency reductions, migration acceptance criteria, and budgeted upgrade work.

**Read and verify this answer:**

- [SAP Clean Core dimensions beyond extensions](https://learning.sap.com/courses/exploring-sap-cloud-erp/utilizing-the-clean-core-strategy-and-extensibility-tools_e566204e-1bd6-4fa2-9c54-ed61ceaf98ae) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

## GOV-14 A classified classic API meets the need, while a released API covers only half the operation. Would you accept Level B?

**Level:** Senior

**Short answer:** Yes, where the target permits it, a verified Level B API can be a reasonable choice. Compare the complete supported operation with the partial released alternative, including permissions, transaction safety, and maintenance. Verify the whole dependency path and state the B dependency honestly. Keep a reason to reassess later. This choice does not override Public Edition or restricted ABAP Cloud access rules.

**Reasoning and example:** The released API supports only part of the posting operation. Completing the rest with direct table updates may be less safe than using a properly classified classic API that performs the full transaction. Test the actual business result, required fields, rejection paths, and authorization rather than choosing a label without considering completeness.

Check the exact object's classification and extension technique; the name BAPI does not prove Level B. If the consumer uses a restricted language version, verify the allowed access design separately. Record why the decision fits this target and what successor or upgrade change would trigger review. Accepting B can be a responsible documented choice, but should never be presented as direct unrestricted Cloud access or an entirely A solution.

**Avoid this mistake:** Not every old API is Level B, and a Level B assessment does not make it directly callable from restricted ABAP Cloud code.

**Interviewer follow-ups:**

- What makes the exact API qualify as classic rather than internal?
- What would cause you to revisit this decision after an upgrade?

**Strong answer criteria:**

- Supports the Level B choice with exact evidence
- Preserves the complete business transaction
- Respects product and language restrictions

**Verification evidence:** Specific object-classification evidence, a complete operation test, a comparison with released alternatives, and a scheduled reassessment trigger.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

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

**Short answer:** First prove that no suitable supported read meets the need and that the target allows the proposed use. If C is accepted, isolate the internal dependency, limit what callers depend on, and name its owner. Set a review trigger and replacement plan. Read-only reduces some write risks but still has confidentiality, result-correctness, and upgrade risks. Test those explicitly.

**Reasoning and example:** An internal view changes a join after an upgrade. The report still activates but now returns duplicate rows and a wrong business total. Another change could broaden returned data for a restricted user. A test that merely executes the SELECT successfully misses both problems.

Capture representative expected totals, row identities, filters, and denied-access results. Recheck them on the target release and use available SAP change information as supporting evidence, not a complete guarantee. Keep the exception tied to this precise dependency and purpose, with a date or event that forces review. A justified internal read is not blanket approval for other internal objects or non-recommended Level D techniques.

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

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

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

**Short answer:** Assess each path separately on the actual target. The released query may support A use, the classified classic BAPI introduces B, the internal class introduces C, and a non-recommended modification can introduce D. Do not average them into one reassuring score. Link each to business use, ownership, and alternatives, then prioritize fixes using impact as well as classification.

**Reasoning and example:** The modification may sit in an old unused path, while the internal class is called during daily financial posting. Both dependencies belong in the factual assessment, but those usage differences affect what to fix first. Confirm historical and seasonal use with the process owner before deciding to remove anything.

For a replacement, test the full intended operation and its errors, not just successful activation. Keep the classification evidence, target version, owner, and business impact beside each finding. A single letter for the entire solution can hide these facts. Classification describes the exposure; remediation priority also needs use, criticality, available alternatives, and the cost of changing the business process safely.

**Avoid this mistake:** A single letter for a mixed solution can hide scope; classification and remediation priority are related but are not the same decision.

**Interviewer follow-ups:**

- Which capability would you remediate first and why?
- What evidence is required before removing the modification?

**Strong answer criteria:**

- Classifies each dependency instead of averaging grades
- Separates classification from fix priority
- Uses business importance and actual usage

**Verification evidence:** A scoped assessment table linking each dependency to classification evidence, process impact, usage, ownership, and a justified remediation decision.

**Read and verify this answer:**

- [SAP Clean Core levels, classic APIs, wrappers, and edition boundaries](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

<details>
<summary>Visual: Clean Core levels A-D</summary>

![Clean Core levels A-D](../visuals/clean-core-levels.svg)

Read each level as a classification of the actual SAP dependency or extension technology.

**Explain it:** Which configured Clean Core finding priority corresponds to levels B, C and D?

**Limit:** This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.

</details>

## GOV-17 The sponsor says Clean Core is a developer concern and rejects funding for integration monitoring and data cleanup. How would you negotiate?

**Level:** Senior

**Short answer:** Explain the business failures that monitoring and data quality prevent. Clean Core includes more than extension code: poor master data, unsupported integrations, and unmanaged process variants also make change difficult. Propose a small set of owned controls with clear outcomes and costs. Phase improvements where reasonable. Make any deferred business risk and its operating owner explicit.

**Reasoning and example:** An order API is properly released, but invalid customer mappings make messages fail repeatedly. Nobody owns the queue, so business orders remain incomplete even though the code uses supported interfaces. Another wrapper or ATC exception will not repair the mapping or ensure someone retries failed work.

Agree who maintains mappings, responds to alerts, reconciles results, and prioritizes cleanup. Use a concrete incident or realistic failure scenario to compare the cost of controls with the cost of unprocessed business work. Define measurable service expectations and distinguish essential controls from improvements that can wait. A good extensibility grade does not certify data quality, secure integration, or effective day-to-day operation.

**Avoid this mistake:** A strong extensibility classification does not certify clean data, standard processes, secure integrations, or effective operations.

**Interviewer follow-ups:**

- Which control delivers the highest near-term business value?
- Who is accountable when an interface remains technically successful but business processing is incomplete?

**Strong answer criteria:**

- Connects monitoring and data controls to business results
- Proposes a practical phased plan
- Names business and operational owners

**Verification evidence:** A responsibility matrix, costed minimum control plan, measurable operational targets, and documented acceptance of deferred risks.

**Read and verify this answer:**

- [SAP Clean Core dimensions beyond extensions](https://learning.sap.com/courses/exploring-sap-cloud-erp/utilizing-the-clean-core-strategy-and-extensibility-tools_e566204e-1bd6-4fa2-9c54-ed61ceaf98ae) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

## GOV-18 An interview panel shows an A-D chart with ATC priorities. What would you clarify before treating it as a release gate?

**Level:** Senior

**Short answer:** Explain that the A-D priority mapping belongs to particular Clean Core checks. Ask which variant, checks, classification data, object scope, and target release produced the results. Other ATC priorities can describe security or performance issues instead. Define what the release gate proves, which exemptions remain, and which runtime tests are still needed. Save enough run information to repeat the assessment.

**Reasoning and example:** One project has fewer findings because its variant omitted an enhancement check or used different classification data. Comparing the raw count with another project can therefore reward missing checks rather than safer code. Store the configuration, source version, scope, and exemptions so the comparison is like for like.

Even matching static checks do not prove that a posting transaction behaves correctly. Add the relevant runtime evidence and distinguish a resolved dependency from a finding that was merely exempted. Do not treat every priority 1 as Level D or every priority 2 as C across all ATC checks. Absence of findings also does not prove complete Level A coverage when assessment scope is incomplete.

**Avoid this mistake:** Do not interpret every priority 1 finding as Level D, every priority 2 as Level C, or absence of findings as proof of complete Level A coverage.

**Interviewer follow-ups:**

- What would you store so this assessment can be reproduced?
- How would you distinguish an exempted finding from a resolved dependency?

**Strong answer criteria:**

- Explains which check gives the priority mapping
- Records enough information to repeat the assessment
- Distinguishes static checks from runtime tests

**Verification evidence:** The exact ATC variant and check configuration, classification/version information, source and scope identifiers, exemptions, and complementary runtime validation results.

**Read and verify this answer:**

- [SAP ADT release notes: ABAP_CLEAN_CORE_READINESS check variant](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-eclipse-release-notes/release-notes-of-abap-development-tools-for-eclipse-3-58) - Check three things separately: the dependency classification, its supported released use, and who approves and maintains any exception.

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
