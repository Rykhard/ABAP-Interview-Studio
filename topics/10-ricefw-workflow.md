# RICEFW, enhancements, and workflow

Use this segment to connect classic delivery skills with current S/4HANA extension choices. Explain the business contract, operational recovery, and edition constraints before naming a transaction or framework. Classic SAP GUI transactions below are diagnostic examples for environments where they exist, not public-cloud instructions.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## RICEFW-01 What does RICEFW mean, and how would you scope a deliverable?

**Level:** Core

**Short answer:** RICEFW groups work into Reports, Interfaces, Conversions, Enhancements, Forms and Workflows. I still need a clear business result before estimating any of them. I ask what data is involved, who uses it and what happens on failure. I also check the target system, supported options and who will operate the solution.

**Reasoning and example:** A request says 'build one supplier conversion.' That sounds small, but it hides several jobs: cleaning source data, mapping fields, checking mandatory values, loading through a supported interface and proving the right suppliers were created. I clarify duplicate rules and expected volume before giving an estimate.

I also define acceptance checks, such as matching supplier counts and recording every rejected row. The cutover plan needs an owner and a safe restart procedure. If standard migration functionality already meets these needs, custom code may be unnecessary. The RICEFW label helps organize delivery; it does not select the technology or tell us the true effort.

**Avoid this mistake:** RICEFW is a delivery classification, not a requirement to build custom code when standard functionality already fits.

**Read and verify this answer:**

- [SAP migration cockpit: objects, mapping, simulation and monitoring](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/29193bf0ebdd4583930b2176cb993268/2f0dbe4111214bcf9b2d57eca26f0525.html) - Provides background for the migration example. The planning questions are original study guidance, not a prescribed SAP checklist. Check the product edition and supported migration object.

## RICEFW-02 How do you choose between a standard API, IDoc, migration tooling, and BDC?

**Level:** Core

**Short answer:** I choose the supported business interface that fits the task and target system. A one-time migration may suit migration tooling; ongoing integration may suit an API or IDoc. BDC can be a classic-system fallback, but screen changes make it fragile. I check required fields, volume and recovery instead of choosing by name alone.

**Reasoning and example:** For a one-time supplier migration, I first check the delivered migration objects and supported fields. If they cover the requirement, building a permanent custom interface may add needless maintenance. For a continuing partner feed, I compare the available APIs or IDoc scenarios and how they report and recover from individual errors.

BDC drives screens, so its suitability depends on the screen flow and configuration. It is not a general ABAP Cloud option. A BAPI may also lack a required field or be unavailable for direct cloud development. I verify release status and Clean Core classification individually; the word BAPI does not automatically mean Level B or suitability for mass loading.

**Avoid this mistake:** Check each BAPI's classification and supported use. Its name alone proves neither Clean Core Level B nor suitability for mass loading.

**Read and verify this answer:**

- [SAP migration cockpit: objects, mapping, simulation and monitoring](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/29193bf0ebdd4583930b2176cb993268/2f0dbe4111214bcf9b2d57eca26f0525.html) - Provides background for the migration example. The planning questions are original study guidance, not a prescribed SAP checklist. Check the product edition and supported migration object.
- [SAP IDoc control record, message type, basic type, and extension](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/78/2177f051ce11d189570000e829fbbd/content.htm) - Describes the IDoc structure. The example compares possible choices; it does not rank one technology as best for every integration.

## RICEFW-03 How do BAdIs, customer exits, and user exits differ?

**Level:** Core

**Short answer:** A BAdI is an object-oriented extension interface. Classic customer exits can add function, screen or menu behavior through enhancement projects. User exit often means an older application-specific routine. I check the actual extension's timing and allowed use. A BAdI is only suitable if it supports the needed change in the target release.

**Reasoning and example:** Suppose an order must reject an invalid reference before saving. I look for a supported extension that runs early enough and can report that error. An extension that runs only after posting would not solve the requirement, even if its name sounds relevant. For a BAdI, I also inspect whether filters or multiple implementations are supported by its definition.

In classic systems, SMOD describes customer-enhancement components and CMOD manages their projects. Some SD routines named USEREXIT use another older mechanism. These names are not interchangeable. A released BAdI is a good choice when it fits, but being a BAdI alone does not prove ABAP Cloud availability or eliminate upgrade testing.

**Avoid this mistake:** CMOD/SMOD exits and routines named USEREXIT are not the same mechanism. Filters and multiple implementations depend on the BAdI definition.

**Read and verify this answer:**

- [SAP explicit and implicit enhancement options](https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/fb/e3d8403e37762ae10000000a155106/content.htm) - Describes classic systems. Check which alternatives your target product supports.

## RICEFW-04 What is the difference between implicit and explicit enhancement options?

**Level:** Core

**Short answer:** Explicit enhancement options are places deliberately marked for extensions. Implicit options exist at predefined positions without a marker there. An enhancement point adds code; an enhancement section can replace the defined section's implementation. These are extension mechanisms. Explicit enhancement does not automatically mean editing SAP's original source directly.

**Reasoning and example:** A standard program contains an explicit enhancement point after a calculation. A customer implementation can add permitted logic at that point. An implicit option may instead be available at a predefined location, such as a procedure boundary, without a dedicated enhancement marker in that location. I inspect the actual option and surrounding behavior before using either.

An enhancement spot organizes explicit options; an enhancement implementation contains the customer logic. Replacing an enhancement section deserves extra care because it can remove standard processing the application needs. These classic mechanisms are also different from released ABAP Cloud extension contracts. I check target support instead of assuming every available editor option is an approved extension.

**Avoid this mistake:** Explicit enhancement does not simply mean modifying SAP source. Source modification is a separate technique.

**Read and verify this answer:**

- [SAP explicit and implicit enhancement options](https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/fb/e3d8403e37762ae10000000a155106/content.htm) - Describes classic systems. Check which alternatives your target product supports.

## RICEFW-05 How would you design a reliable interface?

**Level:** Advanced

**Short answer:** I define what the message means, who may send it and how success or failure is reported. Synchronous calls fit immediate answers; asynchronous processing can let systems work at different times. Both need clear duplicate and recovery rules. I choose the protocol after understanding these needs, including what to do when the outcome is unknown.

**Reasoning and example:** An interface posts an invoice, but the sender times out before receiving the result. The receiver may already have saved it. I use a stable request reference and a documented way to query or reuse the original result before retrying. Otherwise, a temporary network problem can become a duplicate invoice.

A temporary outage may justify delayed retries. An invalid company code needs correction instead of repeated automatic posting attempts. I record correlation information so support can follow the same request through both systems. Whether the interface uses OData, SOAP or IDoc, a transport acknowledgment or accepted message is not proof that the business document was posted.

**Avoid this mistake:** A delivered or accepted message does not prove that the receiver posted the business document.

**Read and verify this answer:**

- [SAP IDoc communication status and application outcome](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html) - Separates message delivery from the business result. The retry and recovery example is original study guidance; follow the actual interface rules.

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

## RICEFW-06 How would you troubleshoot a failed IDoc in a classic system?

**Level:** Core

**Short answer:** I find the IDoc for the business request and read its control data, segments and status history. The detailed error usually shows whether the problem is routing, mapping, master data, permissions or posting logic. I fix that cause before retrying. I also check for an existing business document so recovery does not post it twice.

**Reasoning and example:** A supplier-order IDoc has an application error because a material is unknown. In a classic system, WE02 or WE05 can show the IDoc and its messages. I inspect the incoming material value and its mapping, then correct the master data or mapping through the approved process. Changing a destination would not fix that particular error.

If the IDoc never reached application processing, partner profiles, ports, process codes or communication logs may be the right next check. Where appropriate and authorized, BD87 supports reprocessing. After retry, I inspect the linked business result. Repeated retries or a manual status change can hide the original problem and may create duplicate effects.

**Avoid this mistake:** Changing a status or repeatedly reprocessing without checking business effects can hide the cause or create duplicates.

**Read and verify this answer:**

- [SAP IDoc control and message structure](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/78/2177f051ce11d189570000e829fbbd/content.htm) - Read the IDoc control and message structure, then check the partner and processing settings of the actual interface.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## RICEFW-07 What makes a data conversion safe and supportable?

**Level:** Advanced

**Short answer:** I separate cleaning and checking the data from loading it. Every source record needs a stable identity, a visible result and a safe restart rule. I use supported business interfaces and reconcile business totals after loading. Trial runs reveal bad data and realistic runtime. The cutover plan must also say who stops, restarts or repairs the load.

**Reasoning and example:** A document migration loads 10,000 source records. Matching that count is not enough: some documents may have wrong currencies, values or relationships. I reconcile counts and amounts by company and currency, and keep rejected records separate from accepted records whose follow-up work is still pending. Trial loads help discover these problems before cutover.

If one package fails, the rerun must skip or safely identify documents already posted. Stable source references help link the source to the actual business results. I also plan load order, data freezes and recovery ownership. Direct table updates may bypass application rules, so a technically completed write is not evidence of a correct migration.

**Avoid this mistake:** A completed load can still contain wrong totals, relationships or business states. Check those results separately.

**Read and verify this answer:**

- [SAP migration cockpit: objects, mapping, simulation and monitoring](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/29193bf0ebdd4583930b2176cb993268/2f0dbe4111214bcf9b2d57eca26f0525.html) - Provides background for the migration example. The planning questions are original study guidance, not a prescribed SAP checklist. Check the product edition and supported migration object.

## RICEFW-08 How do you choose between SAPscript, Smart Forms, and Adobe output forms?

**Level:** Core

**Short answer:** I start with the output framework supported by the business application. Existing systems may use SAPscript or Smart Forms; other scenarios use Adobe-based forms with the required rendering setup. S/4HANA does not use one universal output solution for everything. I check document needs, languages and delivery channels before choosing or replacing a form technology.

**Reasoning and example:** An invoice PDF looks correct in one test, but that proves only part of the output process. I separately check how the application decides to generate it, how data reaches the form, how the layout renders and how the result reaches the customer. Email routing or spool processing can fail even when the PDF itself is fine.

My test set includes long item lists, page breaks, totals, several languages, fonts, attachments and reprints. I also verify the application's actual output framework before proposing a BRF+ or Adobe change. An Adobe output form need not be interactive, and not every S/4HANA application follows the same framework or migration path.

**Avoid this mistake:** All S/4HANA output is not automatically BRF+ plus Adobe, and an output form need not be an interactive form.

**Read and verify this answer:**

- [SAP S/4HANA output control and framework coexistence](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/21aead0c98bd4755abdacd91c99e3393/d736578415a340cba84b944798a699b5.html) - Describes classic systems. Check which alternatives your target product supports.

## RICEFW-09 How do classic Workflow, Flexible Workflow, and SAP Build Process Automation differ?

**Level:** Core

**Short answer:** Classic SAP Business Workflow models processes in the ABAP system. Flexible Workflow offers configurable approval scenarios using SAP workflow concepts. SAP Build Process Automation runs on BTP and supports automation across systems. I first check the delivered business scenario, then choose the option that fits its approval rules, integrations and operating needs.

**Reasoning and example:** For purchase approval, I first inspect the supported Flexible Workflow scenario and its available start conditions, steps and extensions. It may already cover the business requirement without a custom process. A cross-system approval involving several applications may instead need a BTP-based solution, depending on available connectors and requirements.

These options are not automatic substitutes for each other. Flexible Workflow builds on SAP workflow concepts, and its features vary by business scenario. A custom RAP Submit action also does not create a complete approval process by itself. We still need process creation, approver selection, decisions, callbacks, permissions and a way to handle failures.

**Avoid this mistake:** Flexible Workflow uses SAP workflow concepts, and available features depend on the business scenario.

**Read and verify this answer:**

- [SAP workflow solution overview](https://help.sap.com/docs/ABAP_PLATFORM_NEW/a602ff71a47c441bb3000504ec938fea/fc563415ab87456293406ad0775ad5ae.html) - Describes classic systems. Check which alternatives your target product supports.
- [SAP flexible workflow scenario and configuration concepts](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0e602d466b99490187fcbb30d1dc897c/10e7e36908184328aab7d5007d9ecb13.html) - Describes classic systems. Check which alternatives your target product supports.

## RICEFW-10 What are a workflow container, task, work item, and agent?

**Level:** Core

**Short answer:** A workflow container holds the process data. Bindings pass that data between workflow components. A task defines work; a work item is one running instance of that task. Agent determination finds the person who should do it. The process also needs a clear response when nobody can act or a decision cannot be completed.

**Reasoning and example:** A request for 5,000 EUR starts an approval workflow. The container might carry the request ID and the information needed to choose an approver. Bindings pass the relevant values to the approval task. The created work item is the actual item the selected approver handles; the task is its reusable definition.

I avoid copying every field if that would leave the workflow using stale business data. I also test the case where no valid approver is found and define an error or fallback route. An email notification is only a notification, not the work item itself. Being selected as an agent does not remove the need for business authorization.

**Avoid this mistake:** A notification email is not the work item itself, and being selected as an agent does not replace business authorization checks.

**Read and verify this answer:**

- [SAP workflow solution overview](https://help.sap.com/docs/ABAP_PLATFORM_NEW/a602ff71a47c441bb3000504ec938fea/fc563415ab87456293406ad0775ad5ae.html) - Describes classic systems. Check which alternatives your target product supports.

## RICEFW-11 How should a RAP submit action start an approval process reliably?

**Level:** Advanced

**Short answer:** Submit should check the request and change its state through RAP's transaction rules. The external approval process should start in a way coordinated with a successful save. I use the supported event or integration mechanism for that release. Stable identifiers and duplicate handling stop retries from starting several workflows for the same submission.

**Reasoning and example:** A request moves from Created to Submitted. Only after that change is successfully committed should the integration create its external approval process using the supported mechanism. If save fails, we must not leave an approval waiting for a request that never became submitted. If delivery is repeated, the receiver should find the existing process rather than create another.

I link the request version and workflow instance so an authorized callback can later update the correct state. Draft activation is a separate RAP operation unless the application explicitly coordinates it with submission. I verify the target's event capabilities instead of assuming one universal implementation. Calling a workflow endpoint before save completes is not a reliable substitute.

**Avoid this mistake:** Calling an external workflow endpoint before save succeeds can start approval for a document that never committed.

**Read and verify this answer:**

- [SAP flexible workflow scenario and configuration concepts](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0e602d466b99490187fcbb30d1dc897c/10e7e36908184328aab7d5007d9ecb13.html) - Describes classic systems. Check which alternatives your target product supports.

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

## RICEFW-12 How do you handle duplicate events, stale approvals, and callback retries?

**Level:** Advanced

**Short answer:** I assume events and callbacks can arrive more than once. The receiver checks a stable event or process identifier before repeating work. An approval also checks the current request version, state and caller permissions. An old decision must not approve a changed or withdrawn request. Repeated successful callbacks should have a stable, safe result.

**Reasoning and example:** A manager receives approval for version one of a request. Before the manager answers, the requester withdraws it or changes a material detail. When the old approval arrives, the callback compares the stored workflow link and request version with the current record. It rejects or handles the stale decision according to the business rule instead of approving the new data.

A retry of a decision already applied should return a safe result without applying the effect twice. I retain an audit trail and test deadline escalation racing with the original approver. A queue or HTTP success response alone does not provide exactly-once business behavior; the application must enforce the intended transitions.

**Avoid this mistake:** A queue or HTTP success response does not automatically prevent duplicate business effects.

**Read and verify this answer:**

- [SAP flexible workflow scenario and configuration concepts](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0e602d466b99490187fcbb30d1dc897c/10e7e36908184328aab7d5007d9ecb13.html) - Describes classic systems. Check which alternatives your target product supports.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

## RICEFW-13 How would you diagnose a workflow that did not start or is stuck?

**Level:** Advanced

**Short answer:** I find the step where progress stopped: the business save, event delivery, start condition, workflow creation, approver selection or callback. Then I inspect the data and logs for that step. Classic and cloud systems provide different administration tools. I do not assume a missing inbox item means the workflow never started.

**Reasoning and example:** A request is submitted but nobody sees an approval. First, I confirm that submission actually committed. Then I check whether an event was sent and whether the start conditions selected the intended workflow. If a workflow exists, I inspect its context and agent determination. An existing work item with no recipient needs a different fix from a missing start event.

In classic systems, SWEL can show recorded events when tracing is enabled, and SWI1 can help inspect work items and logs. Cloud scenarios use their supported monitors. No SWEL entry proves little if tracing was off. A session breakpoint may also miss background processing that runs under another user.

**Avoid this mistake:** An absent trace entry proves little if tracing was disabled, and a session breakpoint may not catch background processing under another user.

**Read and verify this answer:**

- [SAP workflow solution overview](https://help.sap.com/docs/ABAP_PLATFORM_NEW/a602ff71a47c441bb3000504ec938fea/fc563415ab87456293406ad0775ad5ae.html) - Describes classic systems. Check which alternatives your target product supports.

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

## RICEFW-14 How would you test a workflow or enhancement end to end?

**Level:** Advanced

**Short answer:** I test the full business result, including failures and recovery. For workflow, that means approvals, missing approvers, substitutions, deadlines, duplicate callbacks and stale decisions. For an enhancement, I check when it runs and what it does to the surrounding transaction. Unit tests help, but real integration tests must prove actual delivery, permissions and saved state.

**Reasoning and example:** A request is submitted, then changed before the manager answers. My test sends the old approval and checks that it cannot silently approve the new request version. I inspect the current business state and audit history, not just the inbox message. Other cases cover a missing approver and a failed callback that is safely retried.

For an enhancement, I test a normal save and a rejected save to check its timing and transaction effects. A mock endpoint is useful for checking request contents and simulated errors. It does not prove the real system's identity setup, event delivery or callback behavior. I record which checks used real integration and which used doubles.

**Avoid this mistake:** A unit-test pass or inbox screenshot does not prove real permissions, saved data or successful process completion.

**Read and verify this answer:**

- [SAP flexible workflow scenario and configuration concepts](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0e602d466b99490187fcbb30d1dc897c/10e7e36908184328aab7d5007d9ecb13.html) - Describes classic systems. Check which alternatives your target product supports.

<details>
<summary>Visual: RAP transaction and workflow boundary</summary>

![RAP transaction and workflow boundary](../visuals/rap-transaction.svg)

Separate the local transaction from event delivery and the later workflow callback.

**Explain it:** What is lost if a handler calls a committing legacy API?

**Limit:** Exact RAP save methods and supported event infrastructure depend on scenario and release.

</details>

## RICEFW-15 Which S/4HANA changes can affect existing ABAP developments?

**Level:** Advanced

**Short answer:** I check the simplification information and custom-code findings for the target S/4HANA release. Important areas can include MATDOC, ACDOCA, Business Partner and changed output or transactions. I trace how the existing application uses the affected objects. Replacing a table name mechanically is not enough; the business meaning and supported access may have changed.

**Reasoning and example:** A report reads inventory data directly from old tables. Before changing it, I list its reads, writes and called transactions and check the target release's recommended access. I compare the old report's intended result with the new data model, then test totals, filters and runtime using representative business cases.

The same care applies to finance and Business Partner changes. Business Partner integration does not mean every customer and supplier table simply disappeared. Compatibility mechanisms and migration prerequisites vary. I use release-specific findings and functional tests to decide the change, rather than assume that replacing a reference with MATDOC or ACDOCA preserves the original behavior.

**Avoid this mistake:** Replacing a legacy table name with MATDOC or ACDOCA mechanically is not a migration strategy.

**Read and verify this answer:**

- [SAP S/4HANA 2025 upgrade guide](https://help.sap.com/doc/760ce610a2af4174a329d2d8315378e2) - Describes classic systems. Check which alternatives your target product supports.

## Official references

- [SAP explicit and implicit enhancement options](https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/fb/e3d8403e37762ae10000000a155106/content.htm)
- [SAP S/4HANA output control and framework coexistence](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/21aead0c98bd4755abdacd91c99e3393/d736578415a340cba84b944798a699b5.html)
- [SAP workflow solution overview](https://help.sap.com/docs/ABAP_PLATFORM_NEW/a602ff71a47c441bb3000504ec938fea/fc563415ab87456293406ad0775ad5ae.html)
- [SAP flexible workflow scenario and configuration concepts](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0e602d466b99490187fcbb30d1dc897c/10e7e36908184328aab7d5007d9ecb13.html)
- [SAP S/4HANA 2025 upgrade guide](https://help.sap.com/doc/760ce610a2af4174a329d2d8315378e2)
- [SAP migration cockpit: objects, mapping, simulation and monitoring](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/29193bf0ebdd4583930b2176cb993268/2f0dbe4111214bcf9b2d57eca26f0525.html)
- [SAP IDoc control record, message type, basic type, and extension](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/78/2177f051ce11d189570000e829fbbd/content.htm)
- [SAP IDoc communication status and application outcome](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html)
