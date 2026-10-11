# Practical ABAP design patterns and trade-offs

Use patterns to explain a concrete design decision, not to recite a catalog. These original senior scenarios build on OO-09 through OO-12 and distinguish pattern mechanics from RAP transaction, API-release and security contracts. SAP's pattern examples are exploratory demonstrations, not production templates. Verify syntax and dependencies on the target release. Recommendations below are contextual analysis, not claims that SAP mandates a particular application architecture.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

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

## PAT-02 A posting integration needs matching serializer and sender implementations for each provider. Is one static factory sufficient?

**Level:** Senior

**Short answer:** A simple factory can centralize selection for a small fixed set of implementations. Abstract Factory becomes useful when callers must obtain a compatible family, such as a provider-specific serializer and sender, without mixing families. Factory Method instead delegates creation through a subclass-overridable creation operation. I would choose the smallest construction design that protects the actual compatibility rule, rather than calling every method returning an object the Factory Method pattern.

**Example and follow-up:** For two stable providers, an explicit factory returning a validated pair may suffice. If multiple related products evolve independently, a provider-factory interface can make their compatibility visible. Fail clearly for unknown configuration and test family consistency; silently selecting a default provider can post to the wrong destination.

**Avoid this mistake:** Confusing a static creation helper with inheritance-based Factory Method or introducing an Abstract Factory for one trivial object.

**Interviewer follow-ups:**

- What concrete invalid combination must construction prevent?
- When would adding a creator subclass be better than changing a configuration map?

**Strong answer criteria:**

- Distinguishes three creation approaches
- Names a real product-family invariant
- Includes invalid configuration and evolution costs

**Verification evidence:** Test each supported provider family and an unknown provider; verify no serializer/sender cross-pairing can be constructed.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Abstract Factory](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#abstract-factory) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP Factory Method pattern](https://help.sap.com/docs/SUPPORT_CONTENT/abapobjects/3353524416.html) - Supports subclass-controlled creation; the simple-factory comparison is explanatory analysis.

<details>
<summary>Visual: Three factory choices and a concrete family constraint</summary>

![Three factory choices and a concrete family constraint](../visuals/patterns-factory-families.svg)

The family boundary prevents an A serializer from being combined accidentally with a B sender. The table distinguishes a simple choice from subclass creation and related-product creation.

**Explain it:** What invalid combination does this factory prevent, and when would a simple factory be enough?

**Limit:** Provider compatibility is a fictional fixture. Pattern names do not grant API release eligibility, security or transaction guarantees.

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

## PAT-04 You want timing, diagnostic logging and retries around an outbound service. Would stacked Decorators be safe?

**Level:** Senior

**Short answer:** Decorators can add behavior around the same service interface without creating subclasses for every combination. I would make order explicit and preserve the wrapped contract, especially exceptions, authorization context and return values. Retrying is not a harmless decoration: it requires operation-specific idempotency and classification of uncertain outcomes. I would enable retries only where the service contract supports them, and decide whether timing and logging describe each attempt or the overall logical operation.

**Example and follow-up:** A logging decorator outside a retry decorator records one logical call; inside it, it can observe individual attempts. Both can be useful if correlated clearly. Redact sensitive payloads and ensure diagnostic failure does not silently change a successful business result unless the required audit contract explicitly demands that behavior.

**Avoid this mistake:** Adding automatic retries to every POST or assuming decorator order cannot change observable behavior.

**Interviewer follow-ups:**

- Which wrapper should count attempts and which should measure total latency?
- How does a timeout after remote success affect the retry policy?

**Strong answer criteria:**

- Preserves the component interface contract
- Reasons about wrapper ordering
- Separates retries from idempotency guarantees

**Verification evidence:** Test wrapper orders, a transient read failure, uncertain write completion and logging failure; inspect returned outcome and number of remote effects.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Decorator](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#decorator) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP Clean ABAP: explicit failure flow](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#focus-on-the-happy-path-or-error-handling-but-not-both) - Supports the stated design or testability principle; concrete scenario decisions are contextual recommendations.

<details>
<summary>Visual: Adapter, Facade and Decorator with observable outcomes</summary>

![Adapter, Facade and Decorator with observable outcomes](../visuals/patterns-adapter-facade-decorator.svg)

Mapping, orchestration and added behavior are different responsibilities. The lower example shows why wrapper order changes whether a log records one logical call or two attempts.

**Explain it:** Where would you translate an explicit clear, stop after a failed check, and record retry attempts?

**Limit:** The retry example is deliberately an eligible read. Write retries need the actual idempotency and uncertainty contract; no pattern automatically supplies it.

</details>

## PAT-05 Three handlers can route a request to an approver. The first matching rule should win. How would you implement and test Chain of Responsibility?

**Level:** Senior

**Short answer:** Model the decision contract explicitly: handled, not applicable and failed are different outcomes. An ordered Chain of Responsibility fits first-match routing when each handler can accept the request or pass it onward. Validate configuration order and define the no-match outcome. If the business instead needs every validation result, use an explicit validation pipeline or collection rather than stopping at the first successful handler and assuming the rest of the checks ran.

**Example and follow-up:** Put the most specific route ahead of a general fallback only when that precedence is intended. Avoid hidden database writes in a routing handler; return a decision that the transaction coordinator applies. Log the rule identity so support can explain why the request reached a particular approver.

**Avoid this mistake:** Treating an exception as 'not applicable', or confusing first-match routing with execute-all validation.

**Interviewer follow-ups:**

- What happens when two handlers match?
- How is a configuration error different from a valid request with no applicable route?

**Strong answer criteria:**

- Defines routing outcomes and precedence
- Distinguishes chain from validation pipeline
- Keeps decisions explainable and side effects controlled

**Verification evidence:** Test overlapping rules, no match, handler failure and reordered configuration; assert exactly which handlers execute and which route is chosen.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Chain of Responsibility](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#chain-of-responsibility) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.

<details>
<summary>Visual: First-match routing and idempotent command execution</summary>

![First-match routing and idempotent command execution](../visuals/patterns-chain-command.svg)

The 700 EUR fixture passes the team-lead rule and stops at the manager rule. The selected operation then needs its own durable identity to handle duplicate delivery safely.

**Explain it:** What changes if all rules must run, and what must a repeated SUBMIT-42 return?

**Limit:** Routing thresholds and command identity are fictional. The actual business transition, persistence and compensation contracts must be designed separately.

</details>

## PAT-06 A local ABAP event updates an ALV, and the team proposes another handler to start an external workflow. What boundary has changed?

**Level:** Senior

**Short answer:** The local Observer arrangement is suitable for notifying listeners in the current execution context. Starting a durable external workflow introduces commit, delivery, retry and recovery requirements that an ordinary ABAP Objects event does not supply. I would keep local display notification separate from a committed business transition and use an appropriate transactional publication mechanism for the integration. Multiple listeners also require an explicit policy for exceptions and lifecycle registration.

**Example and follow-up:** Registering multiple listener instances, failing to deregister obsolete listeners, or retaining state across tests can produce surprising local notifications. For the workflow, duplicate delivery and delayed events require durable consumer correlation and state checks. Do not infer asynchronous durability merely because the publisher does not directly name the receiving class.

**Avoid this mistake:** Assuming SET HANDLER creates a durable subscription or that Observer guarantees exactly-once business effects.

**Interviewer follow-ups:**

- Which part of the design survives an application-server restart?
- What if one local listener fails after another already changed its state?

**Strong answer criteria:**

- Distinguishes in-process notification from durable messaging
- Coordinates external effects with committed state
- Defines listener and consumer failure handling

**Verification evidence:** Test local listener registration separately from rejected save, duplicate event and delayed workflow delivery cases.

**Read and verify this answer:**

- [SAP Observer pattern](https://help.sap.com/docs/SUPPORT_CONTENT/abapobjects/3353524082.html) - Describes ABAP event-based observation; it does not claim durable messaging.
- [SAP RAP business events](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/0b925bc556d4491aad395b21ec2566ff.html) - Supports the separate RAP business-event mechanism and its lifecycle.

<details>
<summary>Visual: Observer delivery and hidden singleton state</summary>

![Observer delivery and hidden singleton state](../visuals/patterns-observer-lifetime.svg)

A registered local handler can update an ALV, while an external process needs transactional publication and durable processing evidence. Session-shared mutable state is a separate source of repeated-test failures.

**Explain it:** Which facts survive a process restart, and which request-specific values must not be cached implicitly?

**Limit:** The lower path describes required responsibilities, not an automatic feature of ABAP Objects events. Verify the chosen event infrastructure and service lifetime.

</details>

## PAT-07 A command object represents Submit and can be queued or retried. Does using Command make execution idempotent or undoable?

**Level:** Senior

**Short answer:** No. Command packages an operation and its inputs; durability, authorization, idempotency and compensation are additional contracts. I would assign a stable business operation identity, decide how it is stored with the state transition, and define responses to repeated execution or conflicting payload reuse. An undo method is only meaningful where a valid inverse exists. A posted document may require a compensating business operation rather than deletion or an in-memory rollback.

**Example and follow-up:** A command held only in memory is not a reliable job queue. When persistence is required, store a versioned data contract and reconstruct an eligible executor; do not treat an arbitrary object reference as a durable payload. Recheck the relevant authorization and business state at execution time.

**Avoid this mistake:** Assuming execute can safely run twice or that every business command has an exact inverse.

**Interviewer follow-ups:**

- What result should a retry return after the first response was lost?
- How would you evolve a persisted command payload across application releases?

**Strong answer criteria:**

- Separates encapsulation from execution guarantees
- Defines durable identity and replay behavior
- Uses compensation where reversal is not exact

**Verification evidence:** Simulate duplicate execution, conflicting payload reuse, lost response and executor upgrade; assert one effective transition and traceable recovery.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Command](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#command) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP LUWs in ABAP](https://help.sap.com/docs/abap-cloud/abap-concepts/luws-in-abap) - Provides the transaction boundary; command replay and compensation are design decisions in this scenario.

<details>
<summary>Visual: First-match routing and idempotent command execution</summary>

![First-match routing and idempotent command execution](../visuals/patterns-chain-command.svg)

The 700 EUR fixture passes the team-lead rule and stops at the manager rule. The selected operation then needs its own durable identity to handle duplicate delivery safely.

**Explain it:** What changes if all rules must run, and what must a repeated SUBMIT-42 return?

**Limit:** Routing thresholds and command identity are fictional. The actual business transition, persistence and compensation contracts must be designed separately.

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

## PAT-10 A service obtains every dependency from a global factory inside its methods. How would you introduce dependency injection without building a framework?

**Level:** Senior

**Short answer:** At a composition root near the application boundary, construct the service with its required interface-typed dependencies. Keep wiring separate from business decisions so tests can provide controlled collaborators and new dependencies are visible. A factory can help build a complicated dependency graph, but repeated global lookup inside domain methods hides that graph. Start with straightforward constructor injection for required services; do not introduce a container when explicit construction remains readable.

**Example and follow-up:** Framework-owned classes may constrain construction, so create a small delegated application service or use a supported seam instead of inventing framework constructor parameters. Ensure test setup cannot accidentally fall back to a live posting client. Use integration tests to verify production wiring separately from pure decision tests.

**Avoid this mistake:** Replacing one hidden global singleton with a service locator and calling the result fully decoupled.

**Interviewer follow-ups:**

- Which object owns construction in a framework-created RAP handler?
- How would a newly added dependency become visible to existing tests?

**Strong answer criteria:**

- Separates composition from domain logic
- Uses explicit dependencies with framework awareness
- Verifies production wiring and safe test substitution

**Verification evidence:** Instantiate the application service with doubles, assert no live dependency access, and test the production factory's intended object graph independently.

**Read and verify this answer:**

- [SAP Clean ABAP: dependency injection](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-dependency-inversion-to-inject-test-doubles) - Supports the stated design or testability principle; concrete scenario decisions are contextual recommendations.
- [SAP ABAP test isolation examples](https://github.com/SAP-samples/abap-test-isolation-examples) - Provides primary examples of isolation techniques; select tools supported on the target release.

<details>
<summary>Visual: Strategy versus Template Method in approval rules</summary>

![Strategy versus Template Method in approval rules](../visuals/patterns-strategy-template.svg)

The same 700 EUR request receives different policy decisions through the same Strategy contract. Template Method instead fixes a call skeleton and exposes deliberate subclass steps.

**Explain it:** Which part varies, who selects it, and which object keeps transaction ownership?

**Limit:** Conceptual pattern comparison, not executable ABAP or a universal approval rule. Framework-owned construction may require a supported delegation seam.

</details>

<details>
<summary>Visual: Repository read semantics and proportional abstraction</summary>

![Repository read semantics and proportional abstraction](../visuals/patterns-repository-contract.svg)

A direct persistence read returns 100 while the transaction already sees 120. The repository seam is valuable only if its real implementation honors the state contract required by the caller.

**Explain it:** Which integration test catches a mockable repository that reads the wrong state, and when is no new abstraction needed?

**Limit:** Conceptual read semantics rather than an SQL isolation guarantee. The specific BO, EML operation, authorization and target release remain authoritative.

</details>

## PAT-11 A small report has one stable calculation. A reviewer requests Strategy, Abstract Factory and Repository 'for clean architecture'. How do you respond?

**Level:** Senior

**Short answer:** I would ask which real variation, dependency boundary or testing obstacle each abstraction resolves. A small named method with explicit inputs can be the better current design. Add a seam where an external dependency obstructs meaningful tests, and introduce polymorphism when distinct behaviors actually need independent evolution. Pattern count is not a quality metric. I would preserve readability and leave a concrete refactoring trigger instead of building speculative extension layers.

**Example and follow-up:** For example, a pure tax-base calculation with one supported rule can remain a function-like method with boundary tests. A remote rate source may deserve an interface now because it fails independently. If a second rule later appears, extract a Strategy without pretending the initial absence of one was a design defect.

**Avoid this mistake:** Equating more classes with greater maintainability or rejecting all patterns because the current implementation is short.

**Interviewer follow-ups:**

- Which expected change would justify the next abstraction?
- What testing benefit can you demonstrate before adding another interface?

**Strong answer criteria:**

- Connects abstraction to a concrete force
- Balances simplicity with testable external boundaries
- Defines an observable refactoring trigger

**Verification evidence:** Compare change scope and tests for the current design and proposed abstraction; retain only boundaries with a demonstrated maintenance or testing benefit.

**Read and verify this answer:**

- [SAP Clean ABAP: abstraction level](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#descend-one-level-of-abstraction) - Supports the stated design or testability principle; concrete scenario decisions are contextual recommendations.
- [SAP Clean ABAP: focused responsibilities](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#keep-methods-small) - Supports the stated design or testability principle; concrete scenario decisions are contextual recommendations.

<details>
<summary>Visual: Three factory choices and a concrete family constraint</summary>

![Three factory choices and a concrete family constraint](../visuals/patterns-factory-families.svg)

The family boundary prevents an A serializer from being combined accidentally with a B sender. The table distinguishes a simple choice from subclass creation and related-product creation.

**Explain it:** What invalid combination does this factory prevent, and when would a simple factory be enough?

**Limit:** Provider compatibility is a fictional fixture. Pattern names do not grant API release eligibility, security or transaction guarantees.

</details>

<details>
<summary>Visual: Repository read semantics and proportional abstraction</summary>

![Repository read semantics and proportional abstraction](../visuals/patterns-repository-contract.svg)

A direct persistence read returns 100 while the transaction already sees 120. The repository seam is valuable only if its real implementation honors the state contract required by the caller.

**Explain it:** Which integration test catches a mockable repository that reads the wrong state, and when is no new abstraction needed?

**Limit:** Conceptual read semantics rather than an SQL isolation guarantee. The specific BO, EML operation, authorization and target release remain authoritative.

</details>

## PAT-12 A factory selects country approval Strategies from configuration. How do you keep that combination safe, explainable and testable?

**Level:** Senior

**Short answer:** Use a small explicit mapping from supported configuration values to eligible Strategy implementations, then inject the selected strategy into the coordinator. Validate missing and unsupported configuration instead of silently defaulting to a permissive rule. Keep strategy selection separate from its business decision and preserve a common result contract. If dynamic construction is used, it still needs controlled class selection and release-compatible dependencies; it is not a way around ABAP Cloud API restrictions.

**Example and follow-up:** Record which policy version produced the decision when business audit requires it. Test selection independently from each rule and run a common contract suite across strategies. Configuration changes must not make an in-flight approval unpredictably switch policy; decide whether it uses current policy or a recorded policy version.

**Avoid this mistake:** Allowing arbitrary class names from untrusted input or implementing a 'default approve' path when configuration lookup fails.

**Interviewer follow-ups:**

- What should happen to a pending request after the configured policy changes?
- Which tests distinguish factory-selection failure from a correct rule rejecting the request?

**Strong answer criteria:**

- Separates selection and execution
- Fails safely on configuration errors
- Defines versioned policy and common contracts

**Verification evidence:** Test supported and unknown countries, policy changes during pending approvals and identical contract assertions against every Strategy.

**Read and verify this answer:**

- [SAP ABAP pattern examples: Strategy](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#strategy) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.
- [SAP ABAP pattern examples: object creation alternatives](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#factory-method) - Primary SAP demonstration of the mechanism; the interview scenario and trade-off analysis here are original. Examples require target-release review and are not production templates.

<details>
<summary>Visual: Strategy versus Template Method in approval rules</summary>

![Strategy versus Template Method in approval rules](../visuals/patterns-strategy-template.svg)

The same 700 EUR request receives different policy decisions through the same Strategy contract. Template Method instead fixes a call skeleton and exposes deliberate subclass steps.

**Explain it:** Which part varies, who selects it, and which object keeps transaction ownership?

**Limit:** Conceptual pattern comparison, not executable ABAP or a universal approval rule. Framework-owned construction may require a supported delegation seam.

</details>

<details>
<summary>Visual: Three factory choices and a concrete family constraint</summary>

![Three factory choices and a concrete family constraint](../visuals/patterns-factory-families.svg)

The family boundary prevents an A serializer from being combined accidentally with a B sender. The table distinguishes a simple choice from subclass creation and related-product creation.

**Explain it:** What invalid combination does this factory prevent, and when would a simple factory be enough?

**Limit:** Provider compatibility is a fictional fixture. Pattern names do not grant API release eligibility, security or transaction guarantees.

</details>

## Official references

- [SAP ABAP pattern examples: Strategy](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#strategy)
- [SAP ABAP pattern examples: Template Method](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#template-method)
- [SAP ABAP pattern examples: Abstract Factory](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#abstract-factory)
- [SAP Factory Method pattern](https://help.sap.com/docs/SUPPORT_CONTENT/abapobjects/3353524416.html)
- [SAP ABAP pattern examples: Adapter](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#adapter)
- [SAP ABAP pattern examples: Facade](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#facade)
- [SAP ABAP pattern examples: Decorator](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#decorator)
- [SAP Clean ABAP: explicit failure flow](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#focus-on-the-happy-path-or-error-handling-but-not-both)
- [SAP ABAP pattern examples: Chain of Responsibility](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#chain-of-responsibility)
- [SAP Observer pattern](https://help.sap.com/docs/SUPPORT_CONTENT/abapobjects/3353524082.html)
- [SAP RAP business events](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/0b925bc556d4491aad395b21ec2566ff.html)
- [SAP ABAP pattern examples: Command](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#command)
- [SAP LUWs in ABAP](https://help.sap.com/docs/abap-cloud/abap-concepts/luws-in-abap)
- [SAP ABAP pattern examples: data-access isolation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#data-access-object-dao)
- [SAP RAP implementation contract](https://help.sap.com/docs/abap-cloud/abap-rap/general-rap-bo-implementation-contract)
- [SAP ABAP pattern examples: Singleton](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#singleton)
- [SAP Clean ABAP: state lifetime](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#dont-mix-stateful-and-stateless-in-the-same-class)
- [SAP Clean ABAP: dependency injection](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-dependency-inversion-to-inject-test-doubles)
- [SAP ABAP test isolation examples](https://github.com/SAP-samples/abap-test-isolation-examples)
- [SAP Clean ABAP: abstraction level](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#descend-one-level-of-abstraction)
- [SAP Clean ABAP: focused responsibilities](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#keep-methods-small)
- [SAP ABAP pattern examples: object creation alternatives](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#factory-method)
