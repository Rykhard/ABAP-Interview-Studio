# Practical OO: contracts, state, and substitutability

Work through these decisions after the OO fundamentals. The emphasis is on observable promises: valid state, compatible substitutes, honest failure, ownership, and useful tests. Design recommendations are applications of the cited language rules and SAP guidance, not claims that the compiler enforces a complete business contract.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## OODEEP-01 A method named reserve returns a reservation ID. Which promises must be explicit beyond its parameter types?

**Level:** Senior

**Short answer:** I explain what inputs are accepted, what success means and what can change before a failure. The caller also needs to know whether the reservation is already saved, whether repeating the call is safe and who commits. Parameter types cannot answer those questions. I document these rules and test them so another implementation cannot quietly change the caller's expectations.

**Reasoning and example:** A caller needs to reserve two items together. The first implementation returns an ID but leaves saving to the caller. A replacement implementation returns an ID and commits immediately. Both can have the same ABAP signature, yet the second leaves the first reservation saved if reserving the second item fails.

I therefore state whether reserve only prepares the change or makes it permanent. I also define repeated calls, invalid inputs and error results in ABAP Doc or the relevant API documentation. Tests include failure on the second item and inspect the first item afterward. Returning an ID is useful, but it is not proof that a save has happened or that rollback remains possible.

**Avoid this mistake:** RETURNING an identifier does not itself promise committed persistence, and a method name cannot replace a transaction contract.

**Interviewer follow-ups:**

- What state is allowed after reserve raises an exception?
- What is the result when the same business request is retried?

**Strong answer criteria:**

- Defines the state after success and failure
- States who commits
- Defines what repeated calls do

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

## OODEEP-02 A new price-provider implementation rejects quantities below ten although the interface accepts any positive quantity. Is it a valid substitute?

**Level:** Senior

**Short answer:** No, because callers are allowed to request any positive quantity. Refusing quantities below ten adds a new restriction and breaks valid callers. The replacement must keep the original promise, or expose its narrower capability separately. I compare errors and side effects as well as successful results. Implementing the same ABAP interface proves compatible types, not compatible behavior.

**Reasoning and example:** A checkout calls the price-provider interface for one unit. The existing provider returns a quote, as documented. A new bulk provider rejects that request because its own minimum is ten. The program activates, but the checkout now fails for an input it was always allowed to send.

I can keep the shared behavior, choose the provider only through an explicit bulk-specific capability, or change the shared API through a planned migration. I do not hide the new restriction behind the old interface. A common test suite should run the same accepted-input, result and failure cases against each implementation. That checks the promises a caller relies on, rather than merely whether both classes compile.

**Avoid this mistake:** Implementing an interface or passing a cast check proves type compatibility, not behavioral substitutability.

**Interviewer follow-ups:**

- Can a substitute silently return a different currency?
- Which common tests would run against every provider?

**Strong answer criteria:**

- Identifies the new restriction on valid inputs
- Checks results, errors and other changes
- Runs the same behavior tests for each provider

**Verification evidence:** A contract suite exercises minimum positive quantity, currency, failures, and repeat calls for both providers.

**Read and verify this answer:**

- [SAP Learning: Using interfaces](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/using-interfaces_e45af9bb-46e5-457b-88ef-d5ad6b0d38d7) - Interface references provide the common call surface for different implementations.

<details>
<summary>Visual: A concrete counterexample to substitutability</summary>

![A concrete counterexample to substitutability](../visuals/deep-substitution-dispatch.svg)

A valid quantity-one call exposes a behavioral violation invisible in matching parameter types. The lower table separates redefinition from a genuinely new capability.

**Explain it:** Would downcasting every caller to Provider B repair the contract? What else besides accepted inputs must agree?

**Limit:** Hypothetical contract; a narrower published domain would lead to a different assessment. No executable interface is implied.

</details>

## OODEEP-03 Two unrelated services share a capability and some validation code. Should their callers depend on an abstract superclass?

**Level:** Senior

**Short answer:** I would use an interface for the shared capability and a helper object for shared validation. That lets unrelated services reuse what they need without pretending they belong to one class family. An abstract superclass is useful when there is a real shared process and deliberate specialization. Similar code alone is not enough reason, especially because an ABAP class has only one superclass.

**Reasoning and example:** A document exporter and a notification sender both support cancellation, but their work is otherwise unrelated. A small cancellation interface lets a coordinator call either one. If both need the same cancellation policy, they can each use a policy object without inheriting all of one another's shared setup.

By contrast, a family of parsers may genuinely share a fixed sequence with a few defined steps implemented by subclasses. An abstract base class could fit that situation. I ask what the caller needs and what implementation is actually reusable before choosing. Putting shared code into a base class is convenient initially, but a forced hierarchy can make later independent changes much harder.

**Avoid this mistake:** An abstract superclass is not automatically a better contract because it can carry reusable implementation.

**Interviewer follow-ups:**

- Which invariant would the superclass enforce?
- How would the design accommodate a class already inheriting from a framework base?

**Strong answer criteria:**

- Separates what callers need from shared implementation code
- Checks whether a subclass really is a valid kind of its base
- Allows unrelated behaviors to change separately

**Verification evidence:** A responsibility sketch shows the caller's minimal interface and the owner of shared validation.

**Read and verify this answer:**

- [SAP Learning: Defining interfaces](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/defining-interfaces_ab3c7c07-bb66-424b-ba06-6cfa7cc39439) - Interfaces support common capabilities across unrelated classes and restrict the client's view.

<details>
<summary>Visual: A concrete counterexample to substitutability</summary>

![A concrete counterexample to substitutability](../visuals/deep-substitution-dispatch.svg)

A valid quantity-one call exposes a behavioral violation invisible in matching parameter types. The lower table separates redefinition from a genuinely new capability.

**Explain it:** Would downcasting every caller to Provider B repair the contract? What else besides accepted inputs must agree?

**Limit:** Hypothetical contract; a narrower published domain would lead to a different assessment. No executable interface is implied.

</details>

## OODEEP-04 A subclass needs a different implementation and an extra mandatory input for an inherited method. Can REDEFINITION add it?

**Level:** Advanced

**Short answer:** No. REDEFINITION changes an eligible inherited instance method implementation while keeping its interface. It cannot add a new mandatory parameter. ABAP does not solve this with same-name methods having different signatures. If the new input changes what the operation means, I design a separate operation or a deliberate API change. Existing base-type callers must still work as promised.

**Reasoning and example:** A base method formats a document using its declared inputs. A specialized formatter now needs an extra profile. I cannot simply add that profile to the redefined method signature. A separately named operation may be clearer, or a required profile can be supplied during valid object setup if that still fits the original method rules.

The important test is a caller holding only the base reference. It must not suddenly need a downcast and a hidden setup call to use an operation that previously worked. I check successful results, errors and initialization together. Even adding an optional parameter elsewhere does not automatically make a changed behavior compatible; the caller's expectations still need review.

**Avoid this mistake:** Redefinition is not method overloading, and optional parameters do not automatically make every behavioral change compatible.

**Read and verify this answer:**

- [SAP: Extending a subclass](https://help.sap.com/saphelp_em900/helpdata/en/2f/8bbf7bbb4111d2958600a0c94260a5/content.htm?no_cache=true) - Redefinition preserves the inherited method signature and applies to eligible instance methods.
- [SAP: ABAP Doc class example and method uniqueness](https://help.sap.com/docs/SAP_NETWEAVER_740/468a97775123488ab3345a0c48cadd8f/f6fba4c6e1cb49c7b355319ac9c8d1cd.html) - The ABAP Doc example explicitly distinguishes ABAP's lack of method overloading from JavaDoc.

<details>
<summary>Visual: A concrete counterexample to substitutability</summary>

![A concrete counterexample to substitutability](../visuals/deep-substitution-dispatch.svg)

A valid quantity-one call exposes a behavioral violation invisible in matching parameter types. The lower table separates redefinition from a genuinely new capability.

**Explain it:** Would downcasting every caller to Provider B repair the contract? What else besides accepted inputs must agree?

**Limit:** Hypothetical contract; a narrower published domain would lead to a different assessment. No executable interface is implied.

</details>

## OODEEP-05 A local test class needs access to private state. What does granting friendship expose, and what does it not imply?

**Level:** Advanced

**Short answer:** Friendship allows access to the granting class's private and protected components. It goes one way; the granting class does not automatically gain the same access back. A superclass friend is not automatically a friend of its subclasses, while subclasses of a friend can gain access. I keep the grant narrow and prefer testing public behavior when that is enough.

**Reasoning and example:** A local test class needs a legacy seam that cannot yet be reached through the public API. Granting friendship to that focused final test class can be narrower than making production attributes public. The test can then access the granting class's internals without opening them to every ordinary caller.

I still inspect who receives the permission. Granting friendship to a broadly implemented interface can give access to its implementing classes, which is much wider than one test class. The inheritance directions matter too: a friend class and a subclass of the class granting friendship are different situations. I do not reduce the rule to friendship is inherited or is never inherited; I check the actual classes involved.

**Avoid this mistake:** Do not summarize friendship as simply inherited or not inherited; the direction and which class is subclassed matter.

**Read and verify this answer:**

- [SAP: Friendship between classes](https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abenfriends.htm?from=20423&from_column=20423) - Friendship is unilateral; distinguishes friends' subclasses from subclasses of the granting class.

<details>
<summary>Visual: Construction invariants and meaningful test boundaries</summary>

![Construction invariants and meaningful test boundaries](../visuals/deep-construction-test.svg)

Invalid dependencies are rejected before use. In the successful test, the input price is controlled but the discount rule itself executes.

**Explain it:** What defect should make the assertion fail, and which private access is actually necessary?

**Limit:** The 10-percent discount is an illustrative fixture, not an application rule. Friendship details and real integration require separate checks.

</details>

## OODEEP-06 Two references point to one resource-owning object. Does clearing one reference close the resource or destroy the object?

**Level:** Senior

**Short answer:** Clearing one reference only clears that variable. If another reference still points to the object, the object remains reachable. Memory cleanup is also different from closing a connection or releasing a business lock. For resources that must be released promptly, I define an explicit owner and close or release operation. I run it on the required success and error paths.

**Reasoning and example:** A coordinator and a cache both refer to one session object. Clearing the coordinator reference leaves the cache reference usable, so it cannot guarantee that the session resource was closed. Even when an object later becomes unreachable, relying on garbage collection is not a precise business-resource release plan.

If the coordinator owns the resource, an explicit close operation may be appropriate. Other holders then need a defined response if they try to use it after closure. If the coordinator merely borrowed it, closing it may break the real owner. I test both ownership and failure paths instead of assuming CLEAR on a reference provides object destruction or lock release.

**Avoid this mistake:** Reference clearing is not an object-level close operation and must not be used as a lock-release guarantee.

**Interviewer follow-ups:**

- Who may close a shared or borrowed object?
- What should a second close or a call after close do?

**Strong answer criteria:**

- Separates object reachability from timely resource release
- Identifies who owns or borrows the resource
- Defines behavior after close

**Verification evidence:** Tests cover multiple aliases, explicit close, repeated close, and use after closure.

**Read and verify this answer:**

- [SAP: Initializations](https://help.sap.com/docs/abap-cloud/abap-keyword/initializations) - Initializing a reference is distinct from the garbage collector deleting an unreachable object.

<details>
<summary>Visual: Value components versus a shared referent</summary>

![Value components versus a shared referent](../visuals/deep-alias-snapshot.svg)

Two structure values own independent string values but lead to the same pricing object. The arrow targets explain why a getter can expose mutable state.

**Explain it:** Which change affects only ls_copy, and which change affects an object visible through both?

**Limit:** Conceptual object identity, not physical memory addresses or a particular sharing optimization.

</details>

## OODEEP-07 An object can be created with a missing repository and fails much later on its first business call. What would you change?

**Level:** Senior

**Short answer:** I would require the repository when creating the service and reject an invalid reference immediately. That avoids an object that looks usable but fails later because setup was forgotten. Constructor injection makes required helpers visible. A factory can coordinate more complex creation. I still check the reference explicitly; declaring a constructor parameter does not guarantee the caller passed a bound object.

**Reasoning and example:** An approval service currently has a public empty constructor and a later set_repository call. One caller forgets that setter, and approve fails far away from the mistake. Requiring the repository and policy during creation makes the missing setup visible at the point where the object is built.

I validate the required references and return a meaningful construction failure where appropriate. I do not need to perform every remote call in the constructor. If opening an external session is a separate step, I define that lifecycle clearly and test calls before and after opening. The goal is a predictable usable state, not heavy hidden initialization that surprises callers.

**Avoid this mistake:** Constructor injection does not validate an initial reference automatically, and heavy I/O is not required for good initialization.

**Interviewer follow-ups:**

- When would a factory improve error handling over constructor work?
- How do you prevent this object escaping before setup succeeds?

**Strong answer criteria:**

- Defines what a usable new object requires
- Rejects missing dependencies at creation
- Separates setup from later business operations

**Verification evidence:** Creation tests prove invalid dependencies fail immediately and valid instances need no undocumented setup call.

**Read and verify this answer:**

- [SAP Learning: Encapsulation and consistency](https://learning.sap.com/courses/basic-abap-programming/using-encapsulation-to-ensure-consistency_e3780ce0-2ba3-4d03-a09f-15ac109b0c03) - Constructors establish initial state and can report construction failure.

<details>
<summary>Visual: Construction invariants and meaningful test boundaries</summary>

![Construction invariants and meaningful test boundaries](../visuals/deep-construction-test.svg)

Invalid dependencies are rejected before use. In the successful test, the input price is controlled but the discount rule itself executes.

**Explain it:** What defect should make the assertion fail, and which private access is actually necessary?

**Limit:** The 10-percent discount is an illustrative fixture, not an application rule. Friendship details and real integration require separate checks.

</details>

## OODEEP-08 A test passes alone but fails after another test changes CLASS-DATA. Why does NEW not reliably isolate it?

**Level:** Senior

**Short answer:** NEW creates a new instance, but it does not reset CLASS-DATA. That class-level state can be shared by instances in the same internal session and can remain after a test finishes. I remove unnecessary shared mutable state or provide a controlled reset. If a cache is required, I define its keys and refresh rules. It is not automatically synchronized across servers.

**Reasoning and example:** The first test loads a policy into a static cache. The second prepares different policy data and creates a new service, but the service still reads the old class-level cache. The second test fails only when run after the first, which is a sign that test state is leaking.

An injected provider created for each test can remove that unwanted sharing. If production genuinely needs caching, I test cache invalidation and all relevant context in the key, such as the intended user or organizational scope. A reset can help isolate legacy tests, but it does not fix an incorrect production cache lifetime. Changing test order only hides the problem.

**Avoid this mistake:** CLASS-DATA is not per instance, but it is also not a globally synchronized cache across application servers.

**Interviewer follow-ups:**

- Does a class constructor rerun for every NEW?
- Which context must appear in a security-sensitive cache key?

**Strong answer criteria:**

- Explains how long class-level data remains
- Does not assume NEW resets shared test state
- Defines cache keys, lifetime and refresh rules

**Verification evidence:** The suite passes individually, together, and with varied order without stale shared state.

**Read and verify this answer:**

- [SAP: CLASS-METHODS](https://help.sap.com/docs/abap-cloud/abap-keyword/class-methods) - Static members and initialization have class semantics, separate from instance state.

<details>
<summary>Visual: Three distinct state and memory lifetimes</summary>

![Three distinct state and memory lifetimes](../visuals/deep-memory-lifetime.svg)

Empty row slots and the initial allocation are deliberately drawn separately. A new object does not imply a new internal session or empty class cache.

**Explain it:** Why can recreating a service leave a test-order failure unchanged?

**Limit:** Allocation diagram is qualitative; measure actual ABAP memory and cache lifetime in the target context.

</details>

## OODEEP-09 A repository raises a low-level exception. Should a business service catch CX_ROOT and return an empty result?

**Level:** Senior

**Short answer:** Usually no. Returning an empty result can make a technical failure look like a valid not-found result. I catch the failure where I can recover or turn it into a meaningful service error. If I wrap the exception, I keep PREVIOUS so the original cause remains available. Missing data, a rejected business request and an unavailable dependency should remain distinguishable.

**Reasoning and example:** A pricing repository cannot be reached. If the service catches CX_ROOT and returns an empty price, the caller might assume no price exists and apply a default such as zero. A network problem has now become an apparently valid business result, which is more dangerous than a clear error.

I define separate handling for a confirmed missing price and a failed attempt to read the price. The service can expose a useful unavailable message while preserving the low-level cause for diagnosis. Tests simulate both cases and verify that neither accidentally produces a successful free item. A broad catch can be appropriate at a final error-handling point, but not as permission to invent success data.

**Avoid this mistake:** Broad catch-and-default handling is not resilience when it changes an unknown outcome into valid-looking data.

**Interviewer follow-ups:**

- When is catching CX_ROOT justified at an application boundary?
- What information belongs in user feedback versus technical diagnostics?

**Strong answer criteria:**

- Keeps missing data different from a failed read
- Converts errors into useful service-level meaning
- Retains the original exception cause

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

## OODEEP-10 A getter returns a reference to a mutable internal collection. Has private visibility protected the object's invariants?

**Level:** Senior

**Short answer:** No. Private storage is not protected if a getter returns a reference that lets callers change the same data directly. I decide whether the getter returns an independent value, read access or intentionally shared state. Business changes should normally go through methods that check the rules. Returning a table value removes that table alias, but object references inside its rows can still be shared.

**Reasoning and example:** A cart add_item method rejects negative quantities. Its get_items method returns a writable reference to the real internal item table. A caller uses that reference to insert a negative quantity, bypassing add_item completely. The attribute is private, but the cart can still enter a state its own rules forbid.

Returning a suitable value copy can prevent direct changes to that table. I still inspect row components: a copied object reference points to the same object, so it may expose another way to change internal state. Alternatively, I offer the specific read operations callers need. Tests should try the exposed access paths, not only check that the attribute declaration says PRIVATE.

**Avoid this mistake:** A copied reference is not a copied referent; changing the static view alone does not create immutable state.

**Interviewer follow-ups:**

- Does returning a table value solve reference components inside its rows?
- Which mutation should remain an operation of the owning object?

**Strong answer criteria:**

- Finds how a reference can bypass validation
- Defines who may change the data
- Checks object references inside copied rows

**Verification evidence:** Attempted external mutation cannot bypass the owner's quantity rule or alter a promised snapshot.

**Read and verify this answer:**

- [SAP: Assignment rules for reference variables](https://help.sap.com/docs/abap-cloud/abap-keyword/assignment-rules-for-reference-variables) - Reference assignment preserves the same object; static views do not clone mutable state.

<details>
<summary>Visual: Value components versus a shared referent</summary>

![Value components versus a shared referent](../visuals/deep-alias-snapshot.svg)

Two structure values own independent string values but lead to the same pricing object. The arrow targets explain why a getter can expose mutable state.

**Explain it:** Which change affects only ls_copy, and which change affects an object visible through both?

**Limit:** Conceptual object identity, not physical memory addresses or a particular sharing optimization.

</details>

## OODEEP-11 A widely used provider interface needs an optional new capability. How do you avoid forcing unrelated implementations into fake behavior?

**Level:** Senior

**Short answer:** I would consider a separate interface for the optional capability. Providers that really support it can implement it, while existing callers keep using the original interface. Adding a method affects implementers even if old callers never use it. If the main interface must change, I plan the meaning and rollout. Returning fake success is not a valid way to pretend support.

**Reasoning and example:** A price-provider interface is widely used, and a new caller needs simulation. One external provider cannot simulate. Adding simulate to every provider and having that one return an empty successful result hides the limitation and can mislead the caller.

A separate simulation capability lets setup code choose a suitable provider or report that the capability is unavailable. Ordinary pricing callers need not change. I test supported and unsupported selection as well as the simulation itself. A no-op implementation is acceptable only if doing nothing truly meets the documented rule. Interface evolution requires checking both sides: existing callers and every class that must implement the new operation.

**Avoid this mistake:** Adding a method is not automatically harmless merely because existing callers do not invoke it.

**Interviewer follow-ups:**

- How will existing implementers activate after the interface change?
- When would a separate version be clearer than optional capability discovery?

**Strong answer criteria:**

- Checks effects on callers and implementing classes
- Does not return fake success for unsupported work
- Plans rollout and explicit unsupported-capability handling

**Verification evidence:** An implementation inventory and compatibility tests cover old clients and providers without simulation.

**Read and verify this answer:**

- [SAP: Interfaces in ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md#interfaces) - Interface components and implementation syntax underpin capability evolution.

<details>
<summary>Visual: A concrete counterexample to substitutability</summary>

![A concrete counterexample to substitutability](../visuals/deep-substitution-dispatch.svg)

A valid quantity-one call exposes a behavioral violation invisible in matching parameter types. The lower table separates redefinition from a genuinely new capability.

**Explain it:** Would downcasting every caller to Provider B repair the contract? What else besides accepted inputs must agree?

**Limit:** Hypothetical contract; a narrower published domain would lead to a different assessment. No executable interface is implied.

</details>

## OODEEP-12 An OO unit test mocks calculate_total and then asserts the mocked total. What behavior has it proved?

**Level:** Senior

**Short answer:** It mainly proves that the mock returns the value configured by the test. It does not prove the real total calculation. To test calculation, I keep calculate_total real and replace outside inputs such as a price source. A different test may mock the calculator when it is testing checkout coordination. The important question is which real behavior the test claims to verify.

**Reasoning and example:** For a discount rule, the test supplies known prices and calls the real calculation with quantities below, at and above the threshold. It asserts totals derived from the business rule. If the calculation method itself is mocked to return 90 and the test checks 90, a broken implementation could still pass unchanged.

A checkout test has another purpose: it may verify that a total is requested before posting or that a calculation error prevents posting. There, a calculator double can be appropriate. I name the subject and expected behavior clearly so reviewers can tell these cases apart. High coverage or many mocks alone cannot establish useful test evidence.

**Avoid this mistake:** The same component can be a real subject in one test and a doubled dependency in another; coverage alone does not settle test quality.

**Interviewer follow-ups:**

- Which defect should make this test fail?
- What real integration evidence remains necessary after a double-based unit test?

**Strong answer criteria:**

- Names the real behavior being tested
- Replaces dependencies rather than the tested rule
- Derives expected results independently from the implementation

**Verification evidence:** A deliberately changed business rule makes its calculation test fail, while orchestration tests remain separately meaningful.

**Read and verify this answer:**

- [SAP: Adding test doubles](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/add-test-doubles) - Doubles isolate dependencies; the application scenario distinguishes a dependency from the behavior being tested.

<details>
<summary>Visual: Construction invariants and meaningful test boundaries</summary>

![Construction invariants and meaningful test boundaries](../visuals/deep-construction-test.svg)

Invalid dependencies are rejected before use. In the successful test, the input price is controlled but the discount rule itself executes.

**Explain it:** What defect should make the assertion fail, and which private access is actually necessary?

**Limit:** The 10-percent discount is an illustrative fixture, not an application rule. Friendship details and real integration require separate checks.

</details>

## Official references

- [SAP Learning: Documenting ABAP code](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/documenting-abap-code_ad565c7e-6ac5-4a49-95e2-e4c33268dac6)
- [SAP Learning: Using interfaces](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/using-interfaces_e45af9bb-46e5-457b-88ef-d5ad6b0d38d7)
- [SAP Learning: Defining interfaces](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/defining-interfaces_ab3c7c07-bb66-424b-ba06-6cfa7cc39439)
- [SAP: Extending a subclass](https://help.sap.com/saphelp_em900/helpdata/en/2f/8bbf7bbb4111d2958600a0c94260a5/content.htm?no_cache=true)
- [SAP: ABAP Doc class example and method uniqueness](https://help.sap.com/docs/SAP_NETWEAVER_740/468a97775123488ab3345a0c48cadd8f/f6fba4c6e1cb49c7b355319ac9c8d1cd.html)
- [SAP: Friendship between classes](https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abenfriends.htm?from=20423&from_column=20423)
- [SAP: Initializations](https://help.sap.com/docs/abap-cloud/abap-keyword/initializations)
- [SAP Learning: Encapsulation and consistency](https://learning.sap.com/courses/basic-abap-programming/using-encapsulation-to-ensure-consistency_e3780ce0-2ba3-4d03-a09f-15ac109b0c03)
- [SAP: CLASS-METHODS](https://help.sap.com/docs/abap-cloud/abap-keyword/class-methods)
- [SAP Learning: Working with exception classes](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/working-with-exception-classes_acd9568c-be4e-445a-a454-14c6f2cfcd2e)
- [SAP: Assignment rules for reference variables](https://help.sap.com/docs/abap-cloud/abap-keyword/assignment-rules-for-reference-variables)
- [SAP: Interfaces in ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md#interfaces)
- [SAP: Adding test doubles](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/add-test-doubles)
