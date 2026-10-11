# OO design and Clean ABAP

Explain object orientation through responsibilities, replaceable dependencies, and observable behavior. Memorized definitions become useful when you can name a concrete tradeoff. The examples are hypothetical design exercises, not claims about personal project experience; project naming conventions are separate from the SAP language.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## OO-01 Explain abstraction, encapsulation, inheritance, and polymorphism with one example.

**Level:** Core

**Short answer:** For a delivery service, abstraction exposes a send operation while hiding transport details. Encapsulation protects its internal state and invariants. Inheritance can specialize a genuine base contract. Polymorphism lets the caller invoke send through an interface while different implementations deliver by different channels. These ideas help changes stay local to the responsible component.

**Example and follow-up:** A notification coordinator can receive an email sender or a test sender through the same interface. The coordinator should not inspect the concrete class to decide how to send; doing that would weaken the polymorphic design.

**Avoid this mistake:** Encapsulation means protecting valid behavior and state, not merely generating getters and setters for every attribute.

**Read and verify this answer:**

- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

<details>
<summary>Visual: OO interfaces and dependency injection</summary>

![OO interfaces and dependency injection](../visuals/classic-oo-plug-contract.svg)

The service depends on a repository contract. Production and test implementations fit the same socket; the composition boundary supplies the appropriate collaborator.

**Explain it:** Which object chooses the implementation, and what does a double-based test fail to prove?

**Limit:** The plug is a design metaphor, not a SAP connector or code signature. Injection does not itself guarantee a good abstraction or production integration.

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

## OO-04 How do upcasting and downcasting work in ABAP Objects?

**Level:** Core

**Short answer:** Upcasting views an object through a compatible superclass or interface reference and preserves the same object. Downcasting requests a more specific compatible type and can fail at runtime if the actual object does not support it. I use a type check or handle CX_SY_MOVE_CAST_ERROR when a downcast is genuinely necessary.

**Example and follow-up:** A reference typed to a payment interface can point to a card implementation. Converting it back to the card type does not create a new card object. Frequent downcasts often indicate the interface is missing a required capability or the caller knows too much.

**Avoid this mistake:** Casting a reference changes the accessible static view, not the object's dynamic type or stored data.

**Read and verify this answer:**

- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

## OO-05 What is the difference between instance and static methods and constructors?

**Level:** Core

**Short answer:** An instance method acts on an object and can access its instance state. A static method belongs to the class and has no implicit current instance. The instance constructor initializes a newly created object. The class constructor initializes class-level state when the runtime first requires it in the internal session; I avoid unpredictable heavy work there.

**Example and follow-up:** A class can contain static and instance methods together. Restricting creation or declaring a class abstract affects instantiation; merely adding CLASS-METHODS does not. Constructor injection makes mandatory dependencies visible before business methods are called.

**Avoid this mistake:** ABAP does not make a class uninstantiable simply because it has static methods, and class data is not automatically shared system-wide.

**Read and verify this answer:**

- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

## OO-06 When do you prefer composition over inheritance?

**Level:** Core

**Short answer:** I prefer composition when behavior varies independently or I want to replace a dependency without coupling classes to a hierarchy. Inheritance is appropriate when the subclass really preserves the base contract and specialization is intentional. Composition makes ownership and collaboration explicit and avoids a deep hierarchy used only to share a few helper methods.

**Example and follow-up:** A report service can contain a repository, an authorization policy, and a formatter. Different implementations can be supplied independently. Making every report inherit from a large superclass may entangle unrelated persistence, output, and authorization decisions.

**Avoid this mistake:** Code reuse alone is weak justification for inheritance; a subclass that violates caller expectations is not a sound substitute.

**Read and verify this answer:**

- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.
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

## OO-08 How would you apply SOLID without overengineering?

**Level:** Advanced

**Short answer:** I use SOLID as questions about change. Does each component have a coherent responsibility? Can variation be added without repeatedly editing central logic? Do substitutes preserve expectations? Are interfaces small enough for their clients? Do business rules depend on abstractions? I introduce structure to solve an observed need, not to maximize the number of classes.

**Example and follow-up:** Separating tax calculation from database retrieval can support focused tests and independent changes. Creating an interface for a tiny stable helper with no substitution need may add little value. Discuss one concrete change scenario rather than reciting five slogans.

**Avoid this mistake:** Single responsibility does not mean one method per class, and open/closed does not mean existing code must never be changed.

**Read and verify this answer:**

- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

## OO-09 When are Strategy and Factory useful?

**Level:** Advanced

**Short answer:** Strategy packages interchangeable behavior behind a common contract, such as choosing a pricing rule. A factory centralizes construction when callers should not know concrete classes or setup details. They often work together: configuration selects a strategy that a factory creates. A simple static creation helper is not automatically the inheritance-based Factory Method pattern.

**Example and follow-up:** For domestic and export pricing, the coordinator receives a pricing strategy. The composition boundary decides which implementation is appropriate. If only one simple construction path exists, direct construction outside the business logic may be clearer than an elaborate factory hierarchy.

**Avoid this mistake:** Do not call every method that returns an object Factory Method without distinguishing a simple factory from the formal pattern.

**Read and verify this answer:**

- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.
- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

## OO-10 What do Adapter and Facade solve in SAP integration code?

**Level:** Advanced

**Short answer:** An adapter translates one contract into another, allowing a client to use an existing service through its preferred interface. A facade offers a simpler operation over a subsystem with several steps. For a legacy posting API, either pattern can isolate mapping and error translation while keeping its transaction, authorization, and release limitations visible.

**Example and follow-up:** A posting facade might coordinate validation and mapping; an adapter can translate an application's request into a legacy function module's structures. The caller still needs to know whether persistence is synchronous and who owns commit and rollback.

**Avoid this mistake:** Wrapping an unreleased SAP object does not by itself make that underlying dependency released, cloud compliant, or clean-core Level A.

**Read and verify this answer:**

- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

<details>
<summary>Visual: OO interfaces and dependency injection</summary>

![OO interfaces and dependency injection](../visuals/classic-oo-plug-contract.svg)

The service depends on a repository contract. Production and test implementations fit the same socket; the composition boundary supplies the appropriate collaborator.

**Explain it:** Which object chooses the implementation, and what does a double-based test fail to prove?

**Limit:** The plug is a design metaphor, not a SAP connector or code signature. Injection does not itself guarantee a good abstraction or production integration.

</details>

<details>
<summary>Visual: Clean Core wrapper dependency</summary>

![Clean Core wrapper dependency](../visuals/clean-core-wrapper.svg)

Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.

**Explain it:** What evidence would let you accept a classic SAP dependency responsibly?

**Limit:** A governance review must consider technology restrictions, classifications and lifecycle risk.

</details>

## OO-11 What are the limitations of Singleton in ABAP?

**Level:** Advanced

**Short answer:** A conventional singleton restricts construction and returns a stored instance through a class-level accessor. Its scope is normally the ABAP internal session, not the whole SAP landscape. It can introduce hidden dependencies, persistent mutable test state, and difficult substitution. I use it only when that lifetime and access model are deliberate requirements.

**Example and follow-up:** A configuration cache might need invalidation when customizing changes. A singleton that retains yesterday's assumptions or leaks state between tests becomes a correctness problem. Often an explicitly constructed shared service with an injected interface gives clearer ownership.

**Avoid this mistake:** A singleton does not synchronize business updates across sessions, work processes, application servers, or users.

**Read and verify this answer:**

- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

## OO-12 How do ABAP OO events differ from durable business events?

**Level:** Advanced

**Short answer:** An ABAP OO event notifies registered handlers in the current runtime context and can decouple a publisher from listeners. A durable business event used for workflow or external integration needs a separate delivery mechanism, transaction coordination, monitoring, and retry design. Similar terminology does not mean a local event provides durable asynchronous messaging.

**Example and follow-up:** An ALV interaction can raise an event handled by a controller registered with SET HANDLER. Starting an external approval process after a document save requires the supported business-event or integration mechanism, including handling duplicates and failures.

**Avoid this mistake:** RAISE EVENT by itself does not persist a message or guarantee workflow creation after a commit.

**Read and verify this answer:**

- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

## OO-13 What would you change first in a difficult legacy ABAP method?

**Level:** Core

**Short answer:** I first identify its observable behavior, callers, and transaction responsibilities. Then I make small, reviewable improvements such as naming unclear concepts, separating a calculation from I/O, and removing repeated logic. I add focused tests around risky behavior before larger restructuring. Preserving the established contract matters more than turning every statement into modern syntax.

**Example and follow-up:** A safe extraction might isolate discount calculation while keeping posting and commit behavior unchanged. In this project, new tables use lt_, structures ls_, and constants co_; these are team preferences, not mandatory ABAP syntax or universal Clean ABAP rules.

**Avoid this mistake:** A broad stylistic rewrite without behavior evidence can introduce regressions and make review harder, even if the result looks more modern.

**Read and verify this answer:**

- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

## OO-14 How do you make an OO design testable, and what should ABAP Unit assert?

**Level:** Core

**Short answer:** I separate business decisions from database, clock, authorization, and external-service access through appropriate seams. Tests exercise observable behavior with controlled inputs and meaningful assertions. I cover boundaries, failures, and interactions that matter to the contract. Coverage helps identify untested areas, but it does not prove that assertions are correct or that real integration works.

**Example and follow-up:** For an approval policy, test below, at, and above a threshold, plus a missing approver. A repository double can simulate not-found and technical failure. Separate integration checks must verify the real persistence and authorization behavior in the target system.

**Avoid this mistake:** A test that only asserts that a method returned, or mirrors its implementation step by step, provides weak evidence.

**Read and verify this answer:**

- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md) - Compare the language contract with the Clean ABAP design guidance. Project conventions can differ from style recommendations.

<details>
<summary>Visual: OO interfaces and dependency injection</summary>

![OO interfaces and dependency injection](../visuals/classic-oo-plug-contract.svg)

The service depends on a repository contract. Production and test implementations fit the same socket; the composition boundary supplies the appropriate collaborator.

**Explain it:** Which object chooses the implementation, and what does a double-based test fail to prove?

**Limit:** The plug is a design metaphor, not a SAP connector or code signature. Injection does not itself guarantee a good abstraction or production integration.

</details>

<details>
<summary>Visual: Testing scope and evidence</summary>

![Testing scope and evidence](../visuals/test-evidence-pyramid.svg)

The widening base suggests many focused checks, but there is no mandatory numerical ratio.

**Explain it:** Which risk remains after an ABAP Unit test with doubles passes?

**Limit:** Conceptual coverage map, not a count of tests actually run in SAP.

</details>

## OO-15 How does MVC separate responsibilities?

**Level:** Core

**Short answer:** The Model represents application data and relevant behavior. The View presents information and collects interaction. The Controller interprets user interaction and coordinates model and view changes. Frameworks implement the pattern differently; MVC is a responsibility split, not a fixed network sequence that every application follows.

**Example and follow-up:** In SAPUI5, a controller can handle a button press while a bound model supplies view data. Backend business rules still belong in the appropriate service or BO, not only in the browser controller.

**Avoid this mistake:** MVC does not mean copying all backend business logic into the UI controller or assuming the view must always be manually rebuilt.

**Read and verify this answer:**

- [SAPUI5: Use the MVC Concept](https://help.sap.com/docs/SAPUI5/b2f662dd9d7a4ec680056733050b4d34/07afcf400eb344c2916e4eb3a400ff7b.html?version=1.148) - SAPUI5 example of the responsibility split. Select the documentation version matching the target application; MVC does not relocate backend business rules into the browser.

## Official references

- [SAP Clean ABAP style guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md)
- [SAP ABAP object orientation examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)
- [SAP interfaces and implementation semantics](https://help.sap.com/saphelp_snc70/helpdata/EN/c3/225b6254f411d194a60000e8353423/content.htm)
