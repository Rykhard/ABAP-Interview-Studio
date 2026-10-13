# Guided process lessons

In the app, choose Step by step below a supported question. Each step updates the highlighted process stage and the example state. Values illustrate a scenario; this is not a live SAP execution.

Explanation keeps the reading view with a compact diagram preview. Code shows a worked excerpt beside the explanation. Set your default in Reading preferences; Step by step remains a local choice. These views share the same question, sources and saved progress.

## Three orders: compare Isolated and ChangeSet

A and C can be approved. B has an invalid delivery date. Compare two independent runs from the same initial data.

**Learn:** Separate the HTTP batch envelope from the changeset rollback boundary.

Questions: [RAP-16](https://abap-interview-studio.pages.dev/#q-RAP-16)

### 1. Select A, B and C

Select all three and press Approve. No database result exists yet.

- **Order A:** Not approved
- **Order B:** Not approved
- **Order C:** Not approved

One UI selection does not define one transaction.

### 2. Run 1: isolated groups

With #ISOLATED, each order has its own changeset. They can still share one $batch envelope.

- **Order A:** Own changeset
- **Order B:** Own changeset
- **Order C:** Own changeset

One HTTP request can carry independent outcomes.

### 3. B fails; A and C succeed

The date check rejects B. Its failure does not require rollback of the two independent successful changesets.

- **Order A:** Approved
- **Order B:** Rejected
- **Order C:** Approved

Partial success is possible with independent changesets.

### 4. Run 2: start again, one group

Reset to the original unsaved data and use #CHANGE_SET. The three actions now belong to one changeset in this supported scenario.

- **Order A:** Shared changeset
- **Order B:** Shared changeset
- **Order C:** Shared changeset

The rollback boundary now includes all three orders.

### 5. One rejection stops the group

B fails again. None of the approvals from this shared changeset is committed. Correct B or choose a different intended grouping.

- **Order A:** Not approved
- **Order B:** Rejected
- **Order C:** Not approved

Verify persisted data, not just a successful HTTP response for the batch envelope.

**Remember:** $batch groups transport. A changeset groups the atomic local outcome.

**Scope:** Illustrative supported Fiori elements service, not a live SAP execution. Actual request layout depends on the client and service version. Remote commits are outside this rollback boundary.

**Sources:**

- [SAP: invocationGrouping](https://help.sap.com/docs/abap-cloud/abap-keyword/ui-lineitem-invocationgrouping?locale=en-US)

## Save an order and its items together

A classic order editor must save order 4701 with two items. An email will be handled separately after the save.

**Learn:** Follow the business save from validation to the confirmed update result.

Questions: [ABAP-07](https://abap-interview-studio.pages.dev/#q-ABAP-07), [ABAP-08](https://abap-interview-studio.pages.dev/#q-ABAP-08)

### 1. Check the whole order

The editor checks the header and both items before saving. Its working copy contains two valid items, while no order has been posted yet.

- **Order 4701:** Working copy
- **Items:** 2 validated
- **Update request:** Not registered
- **Email:** Not started

A valid working copy is not a saved document.

### 2. Register the required changes

The save helper registers the header and item changes as high-priority update work for this SAP LUW. It returns control without issuing its own commit.

- **Order 4701:** Not yet posted
- **Items:** 2 queued
- **Update request:** Registered, not executed
- **Email:** Not started

Registration records work to run when the owner saves.

### 3. Let the owner commit

The caller responsible for the complete order issues COMMIT WORK AND WAIT. This starts the registered update and waits for the high-priority update result.

- **Order 4701:** Save in progress
- **Items:** 2 in update request
- **Update request:** V1 executing
- **Email:** Not started

The transaction owner chooses the save boundary.

### 4. Confirm the update result

In this successful run, the V1 update saves the header and both items in its database transaction. The caller receives sy-subrc 0; a failed synchronous update would require error handling instead of a success message.

- **Order 4701:** Posted
- **Items:** 2 saved
- **Update request:** V1 complete; sy-subrc 0
- **Email:** Not started

Confirm the update result before reporting the save as successful.

### 5. Track the email separately

The application now shows the order as saved and hands the email to its separate delivery process. AND WAIT did not wait for that process or for every background job.

- **Order 4701:** Posted
- **Items:** 2 saved
- **Update request:** V1 complete
- **Email:** Queued, delivery unconfirmed

Saving the order and delivering the email are separate outcomes.

**Remember:** Keep required changes under one save owner and name exactly which result has been confirmed.

**Scope:** This is a classic Standard ABAP update-task example, with all required persistence in the V1 request. RAP owns its save sequence; do not insert COMMIT WORK into RAP behavior handlers. Separate direct database writes or remote commits would require a different analysis.

**Sources:**

- [SAP: COMMIT WORK and synchronous update result](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcommit.htm?file=abapcommit.htm%2F1000)
- [SAP: SAP LUW and update bundling](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/17_SAP_LUW.md)

## Two users try to edit the same order

Alice and Ben both need to change order 4701. This classic editor uses a dialog-owned SAP lock and explicitly releases it when editing is canceled.

**Learn:** See how a business lock prevents cooperating editors from overwriting each other.

Questions: [ABAP-09](https://abap-interview-studio.pages.dev/#q-ABAP-09)

### 1. Alice obtains the lock

Alice requests the lock for the complete identity of order 4701 before reading data for change. The lock service accepts the request because no conflicting editor owns it.

- **Lock owner:** Alice; dialog scope
- **Saved quantity:** 10 EA
- **Alice's edit:** Not loaded
- **Ben's access:** Not requested

Acquire the agreed lock before preparing a change.

### 2. Alice changes her working copy

Alice reads quantity 10 EA and enters 12 EA. Her screen change does not yet change the saved quantity.

- **Lock owner:** Alice; dialog scope
- **Saved quantity:** 10 EA
- **Alice's edit:** 12 EA, unsaved
- **Ben's access:** Not requested

The lock protects an edit that can span user interaction.

### 3. Ben receives a conflict

Ben requests the same change lock and receives a conflict. His application does not continue with an unlocked update; it reports that another edit is in progress.

- **Lock owner:** Alice; dialog scope
- **Saved quantity:** 10 EA
- **Alice's edit:** 12 EA, unsaved
- **Ben's access:** Change blocked

The second writer must respect the locking agreement.

### 4. Alice cancels cleanly

Alice cancels, so the application discards 12 EA and explicitly releases her dialog-owned lock. It does not assume that a rollback alone releases every possible lock scope.

- **Lock owner:** None
- **Saved quantity:** 10 EA
- **Alice's edit:** Discarded
- **Ben's access:** Can retry

Cancellation needs both state cleanup and the correct lock cleanup.

### 5. Ben retries and reads again

Ben obtains the now-free lock and reads the current quantity of 10 EA. His new working copy starts from saved data, not a value kept from a failed edit attempt.

- **Lock owner:** Ben; dialog scope
- **Saved quantity:** 10 EA
- **Alice's edit:** Discarded
- **Ben's access:** Editing fresh 10 EA

Retry the protected read as well as the lock request.

**Remember:** An SAP lock coordinates writers; a complete edit flow also handles conflict, cancel, and fresh reads.

**Scope:** The example assumes classic dialog ownership equivalent to _SCOPE 1. Update ownership and mixed scopes have different transfer and release behavior. Locks do not physically stop SQL writers that ignore the protocol; cloud applications require supported locking APIs.

**Sources:**

- [SAP: Lock ownership and _SCOPE values](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/47/daadf638793c85e10000000a42189c/content.htm)
- [SAP: SAP lock concept in the SAP LUW](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/17_SAP_LUW.md#concepts-related-to-the-sap-luw)

## A remote order survives a local failure

A caller creates an order in a second SAP system under external reference EXT-81. The remote order saves successfully, but the caller then fails to store its local link.

**Learn:** Separate the remote save from local recovery.

Questions: [RFC-04](https://abap-interview-studio.pages.dev/#q-RFC-04), [RFC-05](https://abap-interview-studio.pages.dev/#q-RFC-05)

### 1. Send a stable reference

The caller sends EXT-81 to the documented order API in the remote context. It has no uncommitted local business writes at this point, avoiding an assumption that the RFC preserves a local database transaction.

- **Reference:** EXT-81
- **Remote order:** Not created
- **Local link:** Absent
- **Recovery:** Not needed

Record a reference that can later identify the remote result.

### 2. Check the BAPI result

The remote BAPI accepts the request and prepares order 90081. The caller checks its documented return messages before asking that same remote transaction context to save.

- **Reference:** EXT-81
- **Remote order:** 90081 prepared, not confirmed saved
- **Local link:** Absent
- **Recovery:** Not needed

An accepted BAPI call is not itself the commit confirmation.

### 3. Commit in the remote context

The caller invokes the documented transaction commit with WAIT in the correct remote context and checks the result. In this run the remote save is confirmed for order 90081.

- **Reference:** EXT-81
- **Remote order:** 90081 committed
- **Local link:** Absent
- **Recovery:** Not needed

The remote system now owns a durable business result.

### 4. The local link fails

The caller tries to store EXT-81 to 90081 in a new local transaction, but the local write fails. Rolling back that local transaction leaves the remote order in place.

- **Reference:** EXT-81
- **Remote order:** 90081 still committed
- **Local link:** Rolled back; absent
- **Recovery:** Required

Local rollback cannot undo a completed remote commit.

### 5. Repair the missing link

Recovery queries the remote result by EXT-81 and confirms that 90081 already exists. It writes the missing local link instead of creating another order; a business cancellation would be a separate operation if required.

- **Reference:** EXT-81
- **Remote order:** One order: 90081
- **Local link:** EXT-81 -> 90081 saved
- **Recovery:** Reconciled

Recover from the observed business state, not by replaying creation blindly.

**Remember:** Identify each transaction owner and design recovery across the boundary between them.

**Scope:** The chosen BAPI must support the assumed caller-controlled transaction, remote context handling, and reference lookup. Some legacy BAPIs commit internally. WAIT confirms the relevant update work, not every remote follow-up; this is not a RAP handler recipe.

**Sources:**

- [SAP: BAPI transaction model and documented exceptions](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm)
- [SAP: SAP LUW and implicit database commits](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/17_SAP_LUW.md#terms)

## Restart only the unfinished worker package

A nightly job splits six invoices into three independent packages of two. One worker commits its invoices but its completion reply never reaches the coordinator.

**Learn:** Recover a partly completed run without posting invoices twice.

Questions: [RFC-06](https://abap-interview-studio.pages.dev/#q-RFC-06), [RFC-09](https://abap-interview-studio.pages.dev/#q-RFC-09), [RFC-10](https://abap-interview-studio.pages.dev/#q-RFC-10)

### 1. Give each package a stable identity

The job creates packages P1, P2, and P3 with non-overlapping invoice references. Each worker owns its package transaction, and the coordinator allows only two workers at a time.

- **P1:** Invoices A/B pending
- **P2:** Invoices C/D pending
- **P3:** Invoices E/F pending
- **Confirmed invoices:** 0 of 6

Stable package and business identities make recovery possible.

### 2. Start two workers

The coordinator dispatches P1 and P2 with distinct task names. Successful dispatch means the work started; the coordinator still needs each completion reply and business result.

- **P1:** Running
- **P2:** Running
- **P3:** Waiting for a slot
- **Confirmed invoices:** 0 of 6

Started is different from finished and saved.

### 3. Keep an uncertain result uncertain

P1 reports two committed invoices, while P2's reply is lost after its own commit. The coordinator stops this run before dispatching P3 and records P2 as uncertain, rather than assuming its invoices were rolled back.

- **P1:** Complete: A/B saved
- **P2:** Unknown to coordinator
- **P3:** Not started
- **Confirmed invoices:** 2 of 6

A missing reply does not prove missing business effects.

### 4. Reconcile before restarting

Recovery looks up C and D by their stable invoice references and finds both saved. It marks P2 complete and selects only P3 for restart, while preventing an overlapping scheduled run.

- **P1:** Complete; skip
- **P2:** C/D found; skip
- **P3:** Selected for restart
- **Confirmed invoices:** 4 of 6

The restart set follows the reconciled business results.

### 5. Finish the remaining package

The restarted worker saves E and F and returns a checked result. The coordinator reconciles six unique invoice references with six documents before closing the run.

- **P1:** 2 saved; no replay
- **P2:** 2 saved; no replay
- **P3:** 2 saved on restart
- **Confirmed invoices:** 6 of 6; no duplicates

A complete run is established by business reconciliation, not a job status alone.

**Remember:** Separately committed workers need separate outcomes and a restart rule for uncertain work.

**Scope:** This is a proposed application recovery design around classic asynchronous RFC, not an automatic RFC guarantee. Verify callback handling, resource limits, locking, and duplicate protection for the real API. Cloud application jobs use their own supported framework and APIs.

**Sources:**

- [SAP: Implementing parallel processing and collecting replies](https://help.sap.com/saphelp_snc700_ehp04/helpdata/en/4d/909309eba36e73e10000000a15822b/content.htm)
- [SAP: Classic background scheduling and monitoring](https://help.sap.com/saphelp_em700_ehp01/helpdata/en/48/baab96ca960611e10000000a42189b/content.htm)

## Repair an inbound IDoc posting failure

An inbound order IDoc carries external reference BUY-208. The sender handed it to its port, but the receiver cannot post because the customer is not extended to the required sales area.

**Learn:** Trace the message to the receiver, fix the cause, and verify one business document.

Questions: [INTF-04](https://abap-interview-studio.pages.dev/#q-INTF-04), [INTF-05](https://abap-interview-studio.pages.dev/#q-INTF-05), [INTF-06](https://abap-interview-studio.pages.dev/#q-INTF-06)

### 1. Follow the sender's reference

The sender reports outbound status 03 for its message. That confirms handoff to the port, so support uses the correlation information to find the receiving IDoc rather than declaring the order posted.

- **Sender status:** 03: passed to port
- **Receiver status:** Not checked
- **Customer setup:** Not checked
- **Order BUY-208:** Not confirmed

A transport milestone is not an application posting result.

### 2. Read the inbound error

The receiver has IDoc 800208 in status 51. Its detailed message identifies missing customer sales-area data, so the investigation moves to the application data rather than repeating transport.

- **Sender status:** 03: passed to port
- **Receiver status:** 800208: 51 posting error
- **Customer setup:** Sales area missing
- **Order BUY-208:** Not confirmed

Read the status detail to find the failing business step.

### 3. Correct and check existing effects

The responsible team supplies the required customer data through its approved process. Support checks BUY-208 and confirms that no order already exists, then records the original message identity for recovery.

- **Sender status:** 03: passed to port
- **Receiver status:** 800208: 51 awaiting retry
- **Customer setup:** Sales area available
- **Order BUY-208:** Lookup confirms absent

Fix the cause and establish the business state before replay.

### 4. Reprocess the original message

An authorized operator uses the supported reprocessing path for IDoc 800208, such as BD87 where appropriate. The operator does not send a new test copy or change the status merely to make it look successful.

- **Sender status:** 03: passed to port
- **Receiver status:** 800208: retry running
- **Customer setup:** Sales area available
- **Order BUY-208:** Creation being checked

Keep recovery attached to the original history and reference.

### 5. Verify posting and the linked order

The receiving IDoc reaches status 53 and its application link points to order 47208. Support confirms that BUY-208 identifies exactly this order and checks any required later process separately.

- **Sender status:** 03: passed to port
- **Receiver status:** 800208: 53 posted
- **Customer setup:** Sales area available
- **Order BUY-208:** One order: 47208

Close the incident with both message and business evidence.

**Remember:** Diagnose at the receiver and reprocess from known business state, preserving the original audit trail.

**Scope:** Status meanings here refer to common classic IDoc processing. The supported restart action and duplicate checks depend on message type, process code, application, release, and authorizations. Status 53 does not prove every downstream business step is complete.

**Sources:**

- [SAP: Check communication at sender and receiver](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html)
- [SAP: ALE inbound processing and IDoc status records](https://help.sap.com/docs/SUPPORT_CONTENT/abapconn/3354079745.html?locale=en-US)

## Map and validate an invoice before the AIF action

A configured AIF inbound interface receives invoice INV-42 for company EXT01. Its mapping has no entry for that company, so its validation blocks the posting action.

**Learn:** Separate data mapping, validation, posting, and controlled restart.

Questions: [INTF-08](https://abap-interview-studio.pages.dev/#q-INTF-08), [INTF-10](https://abap-interview-studio.pages.dev/#q-INTF-10)

### 1. Identify the input and interface

The message contains invoice INV-42, company EXT01, and amount 120 EUR. Support identifies the interface version and confirms that this example uses AIF-controlled mapping, checks, and a posting action.

- **Company mapping:** EXT01 -> not evaluated
- **Validation:** Not run
- **Posting action:** Not called
- **INV-42:** No document confirmed

Establish the processing configuration before interpreting the monitor.

### 2. Map the structure and company code

Structure mapping places the invoice fields into the target structure. The value lookup finds no approved translation for EXT01, leaving company code unresolved for the next check.

- **Company mapping:** EXT01 -> missing mapping
- **Validation:** Ready to check
- **Posting action:** Not called
- **INV-42:** No document confirmed

Correct field placement does not guarantee a valid business value.

### 3. Stop before the action

The configured check rejects an unresolved company code. The monitor identifies the mapping problem, and this processing path does not call the posting action.

- **Company mapping:** EXT01 -> missing mapping
- **Validation:** Failed: company unresolved
- **Posting action:** Blocked by check
- **INV-42:** No action executed

A useful check makes the failure actionable before posting.

### 4. Correct and retry the mapped input

The mapping owner approves EXT01 to 1000, and support confirms no prior target document exists. A controlled retry in the owning engine reruns the required mapping and checks; the posting action then receives company 1000 and amount 120 EUR.

- **Company mapping:** EXT01 -> 1000
- **Validation:** Passed on retry
- **Posting action:** Called with corrected data
- **INV-42:** Result pending

Restart only after knowing what the retry will repeat.

### 5. Verify the application result

The action reports a saved document 190042, which support checks against INV-42 and 120 EUR. The monitor retains the earlier error and the later successful processing history.

- **Company mapping:** EXT01 -> 1000
- **Validation:** Passed on retry
- **Posting action:** Document confirmed
- **INV-42:** 190042; 120 EUR; one document

A successful retry needs an application result and preserved history.

**Remember:** Use each AIF component for its own job and verify the business effect after recovery.

**Scope:** This sequence is the stated interface configuration, not a universal AIF execution order. Checks can occur in several places, and underlying engines may own restart. AIF does not automatically guarantee exactly-once posting or reverse an earlier commit; verify release availability and the action's transaction contract.

**Sources:**

- [SAP AIF: Interface creation, mappings, checks, and actions](https://help.sap.com/docs/ABAP_PLATFORM_BW4HANA/4db1676c3f114f119b500bd80ccd944d/f0d1b60ff43c45efad71398b1214db04.html)
- [SAP AIF: Monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html)

## Retry an order request after losing its response

An API client sends a POST to create an order. This example API explicitly supports request key REQ-17, binds it to the request payload, and stores the completed result with the business change.

**Learn:** Distinguish a network timeout from a failed business operation.

Questions: [HTTP-04](https://abap-interview-studio.pages.dev/#q-HTTP-04), [HTTP-10](https://abap-interview-studio.pages.dev/#q-HTTP-10), [HTTP-12](https://abap-interview-studio.pages.dev/#q-HTTP-12)

### 1. Send one identified request

The client sends REQ-17 with customer C20 and two items. It retains that key and the same payload for any permitted retry under the API's documented contract.

- **Request key:** REQ-17
- **Client outcome:** Waiting
- **Server orders:** 0
- **Stored result:** None

The retry identity belongs to the business request, not each network attempt.

### 2. The server commits the order

The server creates order 6017 and records the completed result for REQ-17. Its implementation protects the same key against concurrent duplicate creation as part of the stated API contract.

- **Request key:** REQ-17
- **Client outcome:** Waiting
- **Server orders:** 1: order 6017
- **Stored result:** REQ-17 -> 6017

The business change can finish before the client knows it.

### 3. The response is lost

The connection fails before the client receives the success response. The client records an unknown outcome; it cannot infer that the server rolled back.

- **Request key:** REQ-17
- **Client outcome:** Timeout; outcome unknown
- **Server orders:** 1: order 6017
- **Stored result:** REQ-17 -> 6017

A timeout is evidence about communication, not proof of failed posting.

### 4. Retry under the explicit contract

Within the API's supported retry window, the client resends the same key and unchanged payload. The server finds the completed result and returns order 6017 without creating another order.

- **Request key:** REQ-17 reused
- **Client outcome:** Retry response received
- **Server orders:** Still 1: order 6017
- **Stored result:** Existing result reused

Safe recovery depends on the API's duplicate-handling contract.

### 5. Confirm one business effect

The client stores order 6017 as the result of its original request. A contract test would also try simultaneous retries and a changed payload with the same key, checking that the documented rejection or reuse rules hold.

- **Request key:** REQ-17 complete
- **Client outcome:** Order 6017 confirmed
- **Server orders:** 1 total
- **Stored result:** Linked to original request

Count business effects, not just successful HTTP responses.

**Remember:** Retry a non-idempotent method only when the operation's contract or reliable result lookup makes the retry safe.

**Scope:** REQ-17 and its storage rules are an example API design, not a universal HTTP header or guarantee. POST is not inherently idempotent. Verify key scope, retention, payload matching, concurrent requests, and atomic result storage for the actual service.

**Sources:**

- [IETF RFC 9110: Idempotent methods and automatic retry](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)

## Keep missing, null, and zero distinct in a patch

A customer API uses JSON Merge Patch. Customer 0004711 has phone +48-555-0100, discount 5, and city Warsaw; the request removes the phone, sets discount to zero, and omits city.

**Learn:** Preserve field presence before mapping patch data into ABAP values.

Questions: [HTTP-03](https://abap-interview-studio.pages.dev/#q-HTTP-03), [HTTP-07](https://abap-interview-studio.pages.dev/#q-HTTP-07)

### 1. Read the patch contract

The request declares application/merge-patch+json and supplies phone as null and discount as 0. City is absent from the request, and the customer identifier remains the string 0004711.

- **Phone:** Saved: +48-555-0100
- **Discount:** Saved: 5
- **City:** Saved: Warsaw
- **Change intent:** Not decoded

The media type and API contract determine patch meaning.

### 2. Capture presence and value separately

The parser records that phone is present with null, discount is present with numeric zero, and city is not present. It does this before a simple ABAP structure could collapse different inputs into initial values.

- **Phone:** Input present; null
- **Discount:** Input present; 0
- **City:** Input absent
- **Change intent:** Three distinct cases

Presence is part of the update data.

### 3. Build explicit change instructions

Under JSON Merge Patch, phone null requests removal of that member and discount 0 requests the value zero. The API's adapter maps phone removal to clearing the optional stored phone, while no instruction changes city.

- **Phone:** Remove optional phone
- **Discount:** Set to 0
- **City:** Leave unchanged
- **Change intent:** Ready for validation

Do not treat zero as missing or null as an ordinary unchanged value.

### 4. Apply the validated patch

The application accepts removal of this optional phone and allows a zero discount. It changes those two fields under its normal save rules and retains the existing city.

- **Phone:** Cleared
- **Discount:** Saved: 0
- **City:** Saved: Warsaw
- **Change intent:** 2 changes applied

Only the requested, valid changes reach persistence.

### 5. Check all three outcomes

The readback representation omits phone, shows discount 0, and still shows Warsaw for customer 0004711. These separate assertions would catch a mapper that clears omitted fields or ignores explicit zero.

- **Phone:** Member absent in readback
- **Discount:** Readback: 0
- **City:** Readback: Warsaw
- **Change intent:** All 3 expectations met

Test changed fields and deliberately unchanged fields.

**Remember:** Decode the patch contract first, then map presence and value into explicit business changes.

**Scope:** These null rules are specifically JSON Merge Patch, not every PATCH API or OData service. The optional phone storage and readback behavior are stated choices for this example. Required fields, nullable fields, arrays, and concurrency checks need their own contract tests.

**Sources:**

- [IETF RFC 7396: JSON Merge Patch processing rules](https://www.rfc-editor.org/rfc/rfc7396.html#section-2)
- [IETF RFC 8259: JSON values, strings, numbers, and null](https://www.rfc-editor.org/rfc/rfc8259.html)

## Change an approval rule without changing the workflow

An approval service handles an order for 8,000 EUR. In this example, country DE requires a manager above 5,000 EUR, while country FR requires a manager above 10,000 EUR.

**Learn:** Keep the varying decision inside a supplied Strategy and the process inside the coordinator.

Questions: [PAT-01](https://abap-interview-studio.pages.dev/#q-PAT-01), [OO-09](https://abap-interview-studio.pages.dev/#q-OO-09), [OO-07](https://abap-interview-studio.pages.dev/#q-OO-07)

### 1. Supply the country rule

Application setup selects the DE rule and gives it to the approval service through an interface. The service receives a required collaborator rather than looking up a global factory during every decision.

- **Order:** DE; 8,000 EUR
- **Supplied rule:** DE: manager above 5,000
- **Decision:** Not evaluated
- **Workflow:** Not advanced

Make the varying dependency visible at construction.

### 2. Keep coordination in one place

The real approval service checks that the request contains the data required by its contract. It then passes the amount and country context to the supplied rule without letting that rule save or send messages.

- **Order:** DE; 8,000 EUR; valid
- **Supplied rule:** DE rule ready
- **Decision:** Requested
- **Workflow:** Waiting for decision

A replaceable rule should not take over the workflow.

### 3. Evaluate the selected policy

The DE rule compares 8,000 with its example threshold of 5,000 and returns manager approval required. It makes no database commit and creates no workflow item.

- **Order:** DE; 8,000 EUR
- **Supplied rule:** 8,000 > 5,000
- **Decision:** Manager required
- **Workflow:** Still not advanced

The Strategy returns a decision with a narrow contract.

### 4. Apply the decision through the coordinator

The service turns that decision into the next application state: awaiting manager approval. The surrounding application keeps responsibility for its save and any durable workflow handoff.

- **Order:** DE; 8,000 EUR
- **Supplied rule:** DE rule complete
- **Decision:** Manager required
- **Workflow:** Awaiting manager; save owned by caller

The same coordinator applies decisions from different rules.

### 5. Try a second country as a separate case

A separate test constructs the same service with the FR rule and an FR order for 8,000 EUR. The result is no manager required because 8,000 is below 10,000; the coordinator still follows the same contract and owns the next step.

- **Order:** New case: FR; 8,000 EUR
- **Supplied rule:** FR: manager above 10,000
- **Decision:** Manager not required
- **Workflow:** Eligible for next normal step

Replace the policy while keeping the coordination contract stable.

**Remember:** Use Strategy for a rule that varies, and dependency injection to supply that rule explicitly.

**Scope:** The country thresholds are invented teaching rules, not legal or SAP standard policies. This is a plain application service; framework-created objects may require a delegated service or supported seam instead of custom constructor parameters. Strategy alone does not make workflow delivery durable.

**Sources:**

- [SAP: Strategy design pattern examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/34_OO_Design_Patterns.md#strategy)
- [SAP Clean ABAP: Dependency inversion for test doubles](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-dependency-inversion-to-inject-test-doubles)

## Find why a joined sales total doubled

A sales report should total October items by company and currency. Company 1000 has two EUR items worth 100 and 50, but adding a multilingual product-text join makes the report show 300 EUR.

**Learn:** Check the rows feeding an aggregate before trusting the total.

Questions: [SQL-06](https://abap-interview-studio.pages.dev/#q-SQL-06), [SQL-07](https://abap-interview-studio.pages.dev/#q-SQL-07)

### 1. Establish the intended item set

The October filter selects item A for 100 EUR and item B for 50 EUR, both in company 1000. The expected total from those two business items is 150 EUR.

- **Business items:** A: 100; B: 50 EUR
- **Rows to sum:** 2
- **Total:** Expected 150 EUR
- **Text language:** EN requested

Use a small, known fixture to define the correct answer.

### 2. Expose the extra text matches

The first join matches product identity but omits text language. Each item finds an EN text and a DE text, so the result now has four rows even though there are still only two business items.

- **Business items:** Still A and B
- **Rows to sum:** 4: A/EN, A/DE, B/EN, B/DE
- **Total:** Input amounts repeated
- **Text language:** EN and DE matched

A join can multiply the rows before aggregation.

### 3. Observe the wrong aggregate

GROUP BY company and currency sums 100 plus 100 plus 50 plus 50. A HAVING condition above 200 now keeps this group, even though the true business total should not pass that threshold.

- **Business items:** 2 unique items
- **Rows to sum:** 4
- **Total:** Wrong: 300 EUR
- **Text language:** Missing from join condition

A valid SQL aggregate can answer the wrong business question.

### 4. Correct the relationship

The query now joins by the full product-text identity including requested language EN, using a left join to retain items without text. The fixture and source key confirm at most one EN text per product; the language condition belongs in the join condition so missing text does not remove an item.

- **Business items:** A and B retained
- **Rows to sum:** 2
- **Total:** 100 + 50 EUR
- **Text language:** EN in join condition

Repair the match conditions rather than hiding repeated rows with DISTINCT.

### 5. Recheck sum and group filter

The corrected group totals 150 EUR and is excluded by HAVING above 200. Further fixtures cover a missing EN text and a second currency, with currencies kept in separate groups.

- **Business items:** 2 included before grouping
- **Rows to sum:** 2
- **Total:** Correct: 150 EUR
- **Group above 200:** No; excluded

Check row counts, amounts, currencies, and the final filter together.

**Remember:** WHERE selects rows, joins determine their multiplicity, and GROUP BY and HAVING operate on that resulting set.

**Scope:** The tables and values are a teaching fixture. Actual keys, client handling, language fallback, currencies, and authorizations must be checked against the real model. This correctness example makes no performance measurement claim.

**Sources:**

- [SAP: ABAP SQL joins, aggregate expressions, and grouping](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)

## Test the retry policy, not its mock

A service may retry an idempotent remote lookup once after a temporary timeout. A business rejection must be returned immediately; neither test may reach a live server or actually wait.

**Learn:** Arrange controlled dependencies, run the real policy, and assert its observable behavior.

Questions: [TEST-02](https://abap-interview-studio.pages.dev/#q-TEST-02), [TEST-01](https://abap-interview-studio.pages.dev/#q-TEST-01), [OO-14](https://abap-interview-studio.pages.dev/#q-OO-14)

### 1. Arrange a timeout followed by success

The test supplies a client double that returns a temporary timeout on call one and customer C20 on call two. A delay double records waiting requests without sleeping, while the retry policy itself remains real.

- **Client calls:** 0
- **Client script:** Timeout, then C20
- **Delay requests:** 0
- **Policy result:** Not run

Replace outside effects while preserving the behavior under test.

### 2. Act through the public operation

The test calls the real lookup operation once. The policy handles the first timeout, requests its configured delay, and makes its one permitted retry.

- **Client calls:** 2
- **Client script:** Both responses consumed
- **Delay requests:** 1; no real sleep
- **Policy result:** Customer C20

One test invocation exercises the real retry decision.

### 3. Assert the successful retry

The test expects customer C20, exactly two client calls, and one delay request. Those assertions would fail if the policy returned an empty customer, never retried, or made an extra call.

- **Client calls:** Expected 2; observed 2
- **Client script:** No third call allowed
- **Delay requests:** Expected 1; observed 1
- **Policy result:** Expected C20; observed C20

Assertions should expose a broken rule, not just record that code ran.

### 4. Arrange a fresh rejection case

A separate test uses fresh objects and a client that returns a business rejection. The real policy must surface that rejection after one call, with no delay and no retry.

- **Client calls:** New case: 1
- **Client script:** Business rejection only
- **Delay requests:** 0
- **Policy result:** Rejection preserved

A failure that should not retry is part of the contract too.

### 5. Prove that retrying stops

A third, separate test returns a timeout on both permitted calls. Assert exactly two client calls, one delay, and the final timeout returned to the caller. A policy that keeps retrying would fail this case even if the success case passed.

- **Client calls:** New case: exactly 2; a third call fails the test
- **Client script:** Timeout, then another timeout
- **Delay requests:** Exactly 1
- **Policy result:** Final timeout preserved; no customer returned

Repeated failure is the case that proves the retry limit.

### 6. Describe exactly what is proved

If implemented and run, these isolated tests can prove the specified policy decisions against doubles. This lesson is a prepared scenario, so the handoff must still request an actual ABAP Unit run and a separate check of production client wiring and remote behavior.

- **Client calls:** Checked by proposed assertions
- **Client script:** Controlled test responses
- **Delay requests:** No real waiting proposed
- **Policy result:** Prepared cases; not executed here

Keep prepared tests, actual runs, and integration evidence distinct.

**Remember:** A useful unit test makes a real decision under controlled conditions and checks the behavior that matters.

**Scope:** This example uses an idempotent lookup; do not copy its retry rule to an arbitrary write operation. The displayed observations illustrate the expected successful test trace, not an executed ABAP Unit result. Test-double frameworks and seams depend on the target release.

**Sources:**

- [SAP Clean ABAP: Testing and dependency isolation](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#testing)
- [SAP: ABAP Unit](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/abap-unit)

## Follow one order through the save sequence

Order request P1 contains two items costing 40 EUR and 60 EUR. Its delivery date is valid. Follow this successful save; an invalid date would stop it at the check step.

**Learn:** Place derivation, validation, numbering, persistence and cleanup on the correct side of the save boundary.

Questions: [RAP-05](https://abap-interview-studio.pages.dev/#q-RAP-05), [SRAP-03](https://abap-interview-studio.pages.dev/#q-SRAP-03)

### 1. Finish the calculations

FINALIZE calculates 100 EUR from the two pending item amounts, 40 EUR and 60 EUR. This is the final phase for ordinary changes to the transactional data.

- **Total:** 100 EUR
- **Business check:** Not yet complete
- **Order number:** Preliminary P1
- **Database:** No new order

Calculate before the final consistency check.

### 2. Check the finished values

CHECK_BEFORE_SAVE validates the delivery date. It is valid in this run. An invalid date would stop the early save before a final document number or database write, returning a message so the user can correct it.

- **Total:** 100 EUR
- **Business check:** Passed: delivery date valid
- **Order number:** Preliminary P1
- **Database:** No new order

Predictable business errors belong before late save.

### 3. Cross the shared boundary

All business objects in this transaction have passed their early checks. The point of no return is reached; ordinary late saving now assumes consistent input.

- **Total:** 100 EUR
- **Business check:** All participating BOs passed
- **Order number:** Preliminary P1
- **Database:** No new order

One object's passing check alone is insufficient.

### 4. Assign the final number

The late-numbered order receives number 4711 in ADJUST_NUMBERS. The mapping connects preliminary identity P1 to 4711; this is numbering, not another opportunity to change the amount.

- **Total:** 100 EUR
- **Business check:** Passed
- **Order number:** 4711
- **Database:** No new order

Late numbering follows the point of no return.

### 5. Write and commit the order

SAVE writes order 4711 and its items. The runtime or external transaction owner completes the commit; a handler must not issue its own commit.

- **Total:** 100 EUR
- **Business check:** Passed
- **Order number:** 4711
- **Database:** 4711 committed at 100 EUR

Persistence and commit remain under transaction control.

### 6. Reset transaction state

CLEANUP resets the transactional buffer for the completed transaction. Early-save failure has a separate CLEANUP_FINALIZE hook to undo relevant early-save work; it is not the success path shown here.

- **Total:** Persisted: 100 EUR
- **Buffer:** Cleared
- **Order number:** 4711
- **Database:** 4711 committed at 100 EUR

Do not carry pending state into the next transaction.

**Remember:** FINALIZE -> CHECK_BEFORE_SAVE -> point of no return -> ADJUST_NUMBERS when needed -> SAVE -> CLEANUP.

**Scope:** Illustrative successful standard save, not a runtime trace. SAP documents special failure-capable saver behavior for certain BAPI integrations; verify the target release and generated contract before applying that exception.

**Sources:**

- [SAP: Save sequence runtime](https://help.sap.com/docs/abap-cloud/abap-rap/save-sequence-runtime)
- [SAP: Cleanup after early-save failure](https://help.sap.com/docs/abap-cloud/abap-rap/f030096abe1d41f9ac7549f0290b9c09.html)
- [SAP: BAPI numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence)

## Stop an invalid order before it is saved

The same two items cost 40 EUR and 60 EUR, but the requested delivery date is in the past. Follow the rejected save.

**Learn:** See why a failed early check must prevent late numbering and persistence.

Questions: [RAP-05](https://abap-interview-studio.pages.dev/#q-RAP-05), [SRAP-03](https://abap-interview-studio.pages.dev/#q-SRAP-03)

### 1. Calculate the total

FINALIZE finishes the calculation: 40 + 60 = 100 EUR. The order still has preliminary identity P1; nothing has been saved.

- **Requested total:** 100 EUR
- **Delivery date:** Not checked
- **Final number:** Not assigned
- **Database:** No new order

A calculated amount does not mean a saved order.

### 2. Reject the invalid date

CHECK_BEFORE_SAVE finds that the delivery date is in the past. The failed instance and its message are returned. The transaction does not cross the point of no return.

- **Requested total:** 100 EUR
- **Delivery date:** Rejected: date in the past
- **Final number:** Not assigned
- **Database:** No new order

ADJUST_NUMBERS and SAVE are not executed for this rejected save.

### 3. Undo early-save work where needed

After an early-save failure, CLEANUP_FINALIZE handles the relevant early-save cleanup. For example, a saver can revoke temporary changes made in FINALIZE. This is not the successful CLEANUP path.

- **Requested total:** 100 EUR
- **Delivery date:** Still invalid
- **Final number:** Not assigned
- **Database:** Unchanged; no 4711

Do not show the user a successful save or a final order number.

### 4. Correct the date and try again

The user chooses a future delivery date and submits another save request. The corrected request must pass the save sequence again; it cannot jump straight to SAVE. Buffer retention depends on the consumer and transaction handling.

- **Requested total:** 100 EUR
- **Delivery date:** Corrected; check pending
- **Final number:** Not assigned
- **Database:** Still unchanged

Choose the successful example above to follow the valid request through late numbering and saving.

**Remember:** Reject, clean up relevant early-save work, correct, retry. A failed check never becomes a successful save.

**Scope:** Illustrative ordinary early-save rejection, not a live SAP trace. The exact buffer and retry behavior depends on the consumer. Special failure-capable BAPI saver contracts are outside this example.

**Sources:**

- [SAP: Save sequence runtime](https://help.sap.com/docs/abap-cloud/abap-rap/save-sequence-runtime)
- [SAP: Cleanup after early-save failure](https://help.sap.com/docs/abap-cloud/abap-rap/f030096abe1d41f9ac7549f0290b9c09.html)
- [SAP: BAPI numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence)

## Separate accepted changes from committed changes

An external EML consumer updates quantities for orders 101, 102 and 999. Order 999 does not exist, and the agreed batch policy permits eligible orders to continue.

**Learn:** Read pending values correctly and interpret FAILED, REPORTED and MAPPED without claiming an early commit.

Questions: [RAP-03](https://abap-interview-studio.pages.dev/#q-RAP-03), [RAP-07](https://abap-interview-studio.pages.dev/#q-RAP-07), [SRAP-05](https://abap-interview-studio.pages.dev/#q-SRAP-05)

### 1. Receive all three inputs

The caller asks to change 101 from 1 to 2 and 102 from 2 to 3. It also sends an update for missing key 999.

- **Inputs:** 101: 2; 102: 3; 999: 1
- **Pending updates:** 0
- **FAILED:** Not evaluated
- **Database:** 101: 1; 102: 2

Every input needs an accountable outcome.

### 2. Accept eligible changes into the buffer

The behavior accepts the two existing orders and rejects 999. A transactional EML read can see the pending quantities; SQL against persistence still sees 1 and 2.

- **Inputs:** 3 processed
- **Pending updates:** 101: 2; 102: 3
- **FAILED:** 999: missing
- **Database:** 101: 1; 102: 2

The buffer holds the current transaction's working state.

### 3. Interpret the response roles

FAILED identifies 999. REPORTED contains its error plus an informational message for 101; MAPPED is empty because this update creates no identity mapping.

- **FAILED:** 999
- **REPORTED:** 999 error; 101 information
- **MAPPED:** Empty
- **Database:** 101: 1; 102: 2

A message is not automatically a failure, and MAPPED is not a success list.

### 4. Apply the caller's commit policy

The external consumer chooses to save the two eligible updates and inspects the save response. In this worked example the save checks pass and the commit succeeds.

- **FAILED:** Interaction: 999; save: none
- **Pending updates:** 0 after cleanup
- **Committed updates:** 101 and 102
- **Database:** 101: 2; 102: 3

Only the successful save establishes persistence.

**Remember:** MODIFY acceptance, response interpretation and successful commit are separate checkpoints.

**Scope:** Illustrative non-draft batch with an explicitly chosen partial-processing policy. Actual change-set atomicity, operation contracts and consumer policy can require rollback of the entire business unit.

**Sources:**

- [SAP: Entity Manipulation Language](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml)
- [SAP: Commit responses](https://help.sap.com/docs/abap-cloud/abap-keyword/commit-entities-response-of-long-form)

## Keep a new parent and child linked before numbering

One request creates an order and its item before the final order number exists. The BO uses late numbering.

**Learn:** Distinguish request content IDs, transactional identity and the final business key.

Questions: [RAP-10](https://abap-interview-studio.pages.dev/#q-RAP-10), [RAP-11](https://abap-interview-studio.pages.dev/#q-RAP-11), [SRAP-07](https://abap-interview-studio.pages.dev/#q-SRAP-07)

### 1. Link the create operations

The new order has content ID H1, and its new item has I1. The item uses %cid_ref H1 to identify the parent create in this request.

- **Parent content ID:** H1
- **Child content ID:** I1 -> parent H1
- **Preliminary identity:** Not assigned yet
- **Final order:** Unknown

Content IDs correlate operations within the request.

### 2. Retain transactional identities

The create response associates H1 with preliminary identity P1 in this illustrative BO. Later transactional operations retain the generated %tky components rather than inventing a final order number.

- **Parent content ID:** H1
- **Child relation:** Item remains under P1
- **Preliminary identity:** P1 available
- **Final order:** Unknown

A pending instance can be addressed before its final key exists.

### 3. Map preliminary to final identity

After successful early-save checks, ADJUST_NUMBERS maps P1 to order 4702. The implementation preserves the parent-child relationship using the actual BDEF-derived mapping contract.

- **Parent content ID:** H1
- **Child relation:** Item belongs to 4702
- **Preliminary identity:** P1 -> 4702
- **Final order:** 4702 assigned

Late numbering needs a complete identity mapping.

### 4. Return the saved identity

The transaction saves successfully and the external consumer obtains the final key using the supported commit/key-conversion contract. It can now address order 4702; it must not treat H1 as a persistent key.

- **Parent content ID:** H1 was request-local
- **Child relation:** 4702 / item 10 saved
- **Preliminary identity:** Resolved
- **Final order:** 4702 committed

Publish the final identity after successful saving.

**Remember:** Use %cid/%cid_ref for create correlation, retain %tky for pending work, and resolve late keys through the supported mapping contract.

**Scope:** P1 is a readable placeholder, not a proposed ABAP type or universal %pid value. Generated identity components vary with draft and numbering settings; this lesson does not implement a BAPI adapter.

**Sources:**

- [SAP: ADJUST_NUMBERS](https://help.sap.com/docs/abap-cloud/abap-rap/adjust-numbers)
- [SAP: EML examples and derived identities](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/08_EML_ABAP_for_RAP.md)

## Persist unfinished work without changing the active order

Maya edits active order 4703 from 80 EUR to 120 EUR. The business limit is 100 EUR, and she closes and later reopens the application.

**Learn:** Trace draft persistence, failed activation, correction and successful activation.

Questions: [RAP-12](https://abap-interview-studio.pages.dev/#q-RAP-12), [SRAP-09](https://abap-interview-studio.pages.dev/#q-SRAP-09)

### 1. Create an edit draft

Editing copies the active state into Maya's draft. The active order remains available at its committed amount.

- **Active amount:** 80 EUR
- **Draft amount:** 80 EUR
- **Draft owner:** Maya
- **Activation:** Not requested

Draft and active are distinct instances.

### 2. Save the unfinished draft

Maya enters 120 EUR and the draft change is persisted. Closing the browser does not turn this draft into active business data.

- **Active amount:** 80 EUR
- **Draft amount:** 120 EUR persisted
- **Draft owner:** Maya
- **Activation:** Not requested

A durable draft is still unfinished work.

### 3. Reject activation of the invalid draft

Maya returns and requests activation; relevant prepare/validation processing detects 120 EUR above the limit. A field-linked state message explains the problem and active data stays at 80 EUR.

- **Active amount:** 80 EUR
- **Draft amount:** 120 EUR
- **State message:** Amount exceeds 100 EUR
- **Activation:** Rejected

Validation can protect active data while preserving editable work.

### 4. Correct the same draft

Maya reduces the amount to 90 EUR and the relevant validation state is refreshed. In this example no active data changed while she was away, so draft concurrency checks also succeed.

- **Active amount:** 80 EUR
- **Draft amount:** 90 EUR
- **State message:** Amount error cleared
- **Activation:** Ready for retry

Correction must update both values and validation feedback.

### 5. Activate and save successfully

The valid draft is activated and the active save succeeds. The draft is removed by the framework and 90 EUR becomes the committed business value.

- **Active amount:** 90 EUR committed
- **Draft amount:** No remaining draft
- **State message:** None
- **Activation:** Successful

Only successful activation and saving replace active state.

**Remember:** Draft persistence protects unfinished work; successful activation makes the corrected values active.

**Scope:** Illustrative managed exclusive draft. Exact prepare execution, validation reuse, draft retention and lock timing depend on the release and BO configuration; applications must not directly edit draft tables.

**Sources:**

- [SAP: Draft runtime](https://help.sap.com/docs/abap-cloud/abap-rap/draft-runtime)
- [SAP: Implementing validations](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-validations)
- [SAP: State messages](https://help.sap.com/docs/abap-cloud/abap-rap/state-messages)

## Reject a stale update from a second browser

Ana and Ben read order 4704 at quantity 2 with the same ETag. Ana saves first; Ben then submits his older view.

**Learn:** Demonstrate optimistic concurrency with two independently obtained versions.

Questions: [ADV-01](https://abap-interview-studio.pages.dev/#q-ADV-01), [OPS-05](https://abap-interview-studio.pages.dev/#q-OPS-05)

### 1. Give both clients the same starting version

Ana and Ben independently read quantity 2 and ETag V1. V1 is a symbolic version token, not an integer the clients calculate.

- **Server:** Quantity 2 / V1
- **Ana:** Quantity 2 / V1
- **Ben:** Quantity 2 / V1
- **Conflict:** None

Concurrency starts with the version each client actually read.

### 2. Accept Ana's current update

Ana requests quantity 3 with the current ETag. The server accepts and saves it, producing a new ETag V2.

- **Server:** Quantity 3 / V2
- **Ana:** Quantity 3 / V2
- **Ben:** Quantity 2 / V1
- **Conflict:** None

A saved change invalidates older version tokens.

### 3. Reject Ben's stale condition

Ben requests quantity 4 using V1 in the conditional request. The ETag check detects that V1 no longer matches V2 and the server leaves quantity 3 intact.

- **Server:** Quantity 3 / V2
- **Ana:** Quantity 3 / V2
- **Ben:** Quantity 4 requested with V1
- **Conflict:** Stale update rejected

A stale client must not silently overwrite a newer save.

### 4. Refresh before making a new decision

Ben reads quantity 3 and V2, then deliberately chooses quantity 4 using that current version. The successful retry produces V3; it is a new informed change, not blind resubmission.

- **Server:** Quantity 4 / V3
- **Ana:** Still displays quantity 3 / V2
- **Ben:** Quantity 4 / V3
- **Conflict:** Resolved by refresh and retry

Locks coordinate current work; ETags detect outdated client state.

**Remember:** A meaningful stale-update test uses two clients or retained independent versions, then asserts the rejected write changed nothing.

**Scope:** Illustrative conditional OData updates with correctly maintained entity ETags. Exact HTTP responses and lock behavior depend on the service; V1-V3 are display labels, not literal SAP ETag values.

**Sources:**

- [SAP: Optimistic concurrency control](https://help.sap.com/docs/abap-cloud/abap-rap/optimistic-concurrency-control)

## Detect a child change before resuming a draft

Maya leaves an edit draft of order 4705 open. After its exclusive lock expires, a background process changes an active item.

**Learn:** Explain why the whole BO needs a total ETag in addition to an ordinary entity ETag.

Questions: [SRAP-10](https://abap-interview-studio.pages.dev/#q-SRAP-10)

### 1. Record the active version when editing

The active order and its edit draft correspond to total ETag T1. Item 10 has quantity 2 and Maya changes a draft comment.

- **Active item:** 10: quantity 2
- **Active total ETag:** T1
- **Draft basis:** T1; comment edited
- **Lock:** Exclusive

The draft remembers the active BO version it was based on.

### 2. Allow the exclusive lock to expire

Maya stops editing and the configured lock period passes. Her draft remains, but another authorized process can now change the active BO.

- **Active item:** 10: quantity 2
- **Active total ETag:** T1
- **Draft basis:** T1; comment edited
- **Lock:** Expired

A persistent draft does not imply an indefinite exclusive lock.

### 3. Change an active child

The background process saves item 10 with quantity 3. Correct total-ETag handling advances the root's whole-BO version to T2 even though Maya edited a header field.

- **Active item:** 10: quantity 3
- **Active total ETag:** T2
- **Draft basis:** Still T1
- **Lock:** No Maya exclusive lock

A child change must count as a BO change.

### 4. Refuse a stale resume

When Maya resumes, the runtime compares the draft's T1 with active T2. The mismatch prevents resuming this stale draft as though nothing changed; the app must guide recovery from current data.

- **Active item:** 10: quantity 3
- **Active total ETag:** T2
- **Draft basis:** T1 conflicts with T2
- **Resume:** Rejected for stale active state

Total ETag closes the gap left by an expired draft lock.

**Remember:** Entity ETags protect client updates; a total ETag protects draft transitions against changes anywhere in the BO.

**Scope:** Illustrative exclusive edit draft with a child entity. Automatic total-ETag maintenance needs the documented managed prerequisites; unmanaged implementations must fulfill their own maintenance contract.

**Sources:**

- [SAP: Total ETag](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/f5e8548c241b43ab82bceec030b5dc9a.html)
- [SAP: Draft runtime](https://help.sap.com/docs/abap-cloud/abap-rap/draft-runtime)

## Refresh a total that the backend already calculated

A Fiori draft page shows quantity 2, unit price 15 EUR and total 30 EUR. The user changes quantity to 3.

**Learn:** Separate calculation correctness from the consumer's refresh contract.

Questions: [ADV-07](https://abap-interview-studio.pages.dev/#q-ADV-07), [SRAP-21](https://abap-interview-studio.pages.dev/#q-SRAP-21), [OPS-06](https://abap-interview-studio.pages.dev/#q-OPS-06)

### 1. Change the source field

The user enters quantity 3 and the page sends the update. Until the response and dependent read complete, the displayed total can still be 30 EUR.

- **UI quantity:** 3
- **Backend quantity:** Update pending
- **Backend total:** 30 EUR before update
- **UI total:** 30 EUR

A changed input does not itself refresh every dependent field.

### 2. Verify the backend result

The determination processes quantity 3 and derives 45 EUR in the draft. A backend read confirms 45 EUR, while the page still displays 30 EUR.

- **UI quantity:** 3
- **Backend quantity:** 3
- **Backend total:** 45 EUR
- **UI total:** 30 EUR

This symptom points to refresh behavior after calculation.

### 3. Express the dependency to the consumer

The service's supported side-effect metadata says Quantity affects Total. In this corrected configuration, the consumer schedules a read of Total after the source change.

- **UI quantity:** 3
- **Backend total:** 45 EUR
- **Refresh target:** Total requested
- **UI total:** 30 EUR while read pending

Side effects describe which dependent values to reload.

### 4. Display the returned value

The read returns 45 EUR and the page updates Total. The calculation remains backend logic, and the side effect does not imply that the draft has been activated.

- **UI quantity:** 3
- **Backend total:** 45 EUR
- **UI total:** 45 EUR
- **Active persistence:** Unchanged by this refresh

A refreshed screen and a committed business change are different outcomes.

**Remember:** First verify the backend value, then trace side-effect metadata, the dependent request and the displayed response.

**Scope:** Illustrative managed draft Fiori flow. Side-effect syntax, projection exposure and consumer support must match the backend, OData and SAPUI5 versions; the states are not a browser recording.

**Sources:**

- [SAP: RAP side effect](https://help.sap.com/docs/abap-cloud/abap-keyword/rap-side-effect)
- [SAP: Defining an OData service](https://help.sap.com/docs/abap-cloud/abap-rap/defining-odata-service?version=s4hana_cloud)

## Page and count the same authorized result set

A custom query has 12 orders. User Lea may read organization A; six orders belong to A, and four of those are open: 101, 104, 108 and 110.

**Learn:** Apply authorization and filtering before counting and paging, with a predictable order.

Questions: [ADV-10](https://abap-interview-studio.pages.dev/#q-ADV-10), [MODEL-03](https://abap-interview-studio.pages.dev/#q-MODEL-03), [MODEL-05](https://abap-interview-studio.pages.dev/#q-MODEL-05)

### 1. Read the full query request

Lea requests open orders sorted by CreatedAt, skipping one and taking two, with a total count. The provider records the data and count requirements separately.

- **Raw rows:** 12
- **User scope:** Organization A
- **Filter:** Status = Open
- **Page:** Skip 1, take 2

A custom provider owns the requested query behavior.

### 2. Form the authorized filtered set

The provider enforces Lea's organization scope and the open-status filter. The resulting set is 101, 104, 108 and 110; unauthorized rows cannot contribute to either data or count.

- **Raw rows:** 12
- **Visible matching rows:** 4
- **Matching IDs:** 101, 104, 108, 110
- **Page:** Not sliced yet

Use the same restriction for every response component.

### 3. Use deterministic ordering

Orders 104 and 108 have the same CreatedAt value. The effective order includes OrderID as a unique tie-breaker, yielding 101, 104, 108, 110 consistently for this unchanged dataset.

- **Visible matching rows:** 4
- **Order:** CreatedAt, then OrderID
- **Ordered IDs:** 101, 104, 108, 110
- **Page:** Not sliced yet

Equal sort values need a stable tie-breaker.

### 4. Return only the requested slice

Skipping 101 and taking two returns 104 and 108. The provider does not call these two rows the entire matching population.

- **Visible matching rows:** 4
- **Returned IDs:** 104, 108
- **Returned rows:** 2
- **Offset:** 1

Page length and total count answer different questions.

### 5. Return the matching count

The count response is 4 under the same authorization and filter. For a count-only request the provider can omit retrieving the page data while retaining those restrictions.

- **Visible matching rows:** 4
- **Returned IDs:** 104, 108
- **Returned rows:** 2
- **Total count:** 4

Neither 12 raw rows nor 2 page rows is the correct count.

**Remember:** Authorize and filter the set, order it deterministically, slice the data and count the unsliced matching set.

**Scope:** Illustrative fixed dataset, not a snapshot guarantee across requests. Concurrent inserts can shift offset pages; verify the source's consistency model, supported filters and paging API on the target release.

**Sources:**

- [SAP: Implementing an unmanaged query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-unmanaged-query)
- [SAP: Data and count requests](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/edb412d5647f457289f745c8be1b660d.html)
- [SAP: Access control](https://help.sap.com/docs/abap-cloud/abap-data-models/cds-authorization-concept)

## Find the extra rows behind a doubled total

Order 4710 has amount 100 EUR. Its status has an English and a German text, and a report joins both texts using only the status key.

**Learn:** Repair the relationship's real uniqueness instead of hiding duplicated business rows.

Questions: [CDS-03](https://abap-interview-studio.pages.dev/#q-CDS-03), [MODEL-06](https://abap-interview-studio.pages.dev/#q-MODEL-06), [MODEL-10](https://abap-interview-studio.pages.dev/#q-MODEL-10)

### 1. Establish the business grain

The order source contains one row for 4710 and an amount of 100 EUR. The intended report grain is one row per order in the requested language.

- **Order rows:** 1
- **Texts:** English and German
- **Report amount:** 100 EUR before join
- **Expected grain:** One row per order

Decide what one result row represents.

### 2. Observe the row multiplication

Joining on the status alone matches two texts. The result now contains 4710 twice, once per language; summing its amount yields 200 EUR.

- **Order rows:** 2 after join
- **Texts:** English and German matched
- **Report amount:** 200 EUR
- **Declared order key:** 4710 repeated

Joining a to-many target can repeat the source measure.

### 3. Reject a cosmetic cardinality fix

Declaring to-one does not repair the two matching texts. A false cardinality can mislead the optimizer, so the returned rows and total are no longer a reliable prediction. DISTINCT also cannot merge rows whose selected language or text differs. Fix the relationship first.

- **Order rows:** Not reliable
- **Cause:** Language omitted from match
- **Report amount:** Not reliable
- **Proposed shortcut:** Rejected

Cardinality describes the data; it does not enforce uniqueness.

### 4. Make the match fit the grain

The corrected relationship includes the requested English language, and the text key is unique for status plus language. The report returns one order row and its amount returns to 100 EUR.

- **Order rows:** 1
- **Texts:** English only
- **Report amount:** 100 EUR
- **Declared order key:** 4710 unique

Fix the join condition and verify the actual target uniqueness.

**Remember:** Trace row counts at each relationship before changing aggregation or adding DISTINCT.

**Scope:** Illustrative text table with uniqueness on status and language. Real text models may also require validity, client or other keys; missing-text behavior depends on inner versus outer join semantics.

**Sources:**

- [SAP: CDS cardinality](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCDS_CARDINALITY_V2.html)
- [SAP: CDS cardinality and incorrect declarations](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCDS_CARDINALITY_V2.html)

## Protect the entity the user actually reads

The base order view restricts users to their sales organization. A newly exposed consumption view and its customer value help accidentally show organization B to a user authorized only for A.

**Learn:** Trace each read entry point and preserve authorization across the exposed model.

Questions: [CDS-07](https://abap-interview-studio.pages.dev/#q-CDS-07), [MODEL-01](https://abap-interview-studio.pages.dev/#q-MODEL-01), [MODEL-11](https://abap-interview-studio.pages.dev/#q-MODEL-11)

### 1. Check the protected base entity

A normal read of the base entity as user Lea returns order A1 only. The source data also contains B1, which Lea is not allowed to see.

- **Identity:** Lea: organization A
- **Base result:** A1
- **Exposed result:** Not tested
- **Value help:** Not tested

A passing base read proves only that access path.

### 2. Test the new exposed entity

Reading the consumption entity returns A1 and B1 in this broken setup. The base DCL is not automatically applied just because another CDS entity selects from the base.

- **Identity:** Lea: organization A
- **Base result:** A1
- **Exposed result:** A1 and B1: leak
- **Value help:** Not tested

A view stack is not an automatic authorization stack.

### 3. Protect the consumption path

The developer adds the applicable access rule, using supported DCL inheritance and field mappings where appropriate. Lea's direct service read now returns only A1.

- **Identity:** Lea: organization A
- **Base result:** A1
- **Exposed result:** A1
- **Value help:** Not tested

The exposed entity needs effective read protection.

### 4. Check the value help independently

The customer value help still reveals customer B-Customer until its own read path is protected. After the correction, Lea sees only the authorized A-Customer choice.

- **Identity:** Lea: organization A
- **Exposed result:** A1
- **Value help:** A-Customer only
- **Second leak:** Closed

A secured order list does not automatically secure its helpers.

### 5. Verify with distinct identities

A separate organization-B test identity sees B1 and B-Customer, while Lea still sees only A data. Tests call the real service and value-help paths without privileged bypass.

- **Lea order result:** A1
- **Lea value help:** A-Customer
- **B-user order result:** B1
- **B-user value help:** B-Customer

Check both permitted access and denied cross-organization access.

**Remember:** Protect every actual read entry point, including the exposed entity and value helps; read protection does not replace RAP write authorization.

**Scope:** Illustrative ordinary CDS read paths. Supported inheritance syntax varies with entity type and release; analytical, privileged and custom-query paths need their own documented authorization treatment.

**Sources:**

- [SAP: CDS authorization concept](https://help.sap.com/docs/abap-cloud/abap-data-models/cds-authorization-concept)
- [SAP: DCL inheritance replacement](https://help.sap.com/docs/abap-cloud/abap-keyword/cds-dcl-define-role-replacing)
- [SAP: Implementing authority checks](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks)

## Inspect what a released wrapper actually depends on

A private-edition extension calls the team's released posting wrapper. The wrapper still calls an internal SAP function with no evidenced release contract or suitable classification.

**Learn:** Evaluate the full dependency and intended API use before claiming Clean Core compliance.

Questions: [CORE-08](https://abap-interview-studio.pages.dev/#q-CORE-08), [CORE-13](https://abap-interview-studio.pages.dev/#q-CORE-13), [GOV-03](https://abap-interview-studio.pages.dev/#q-GOV-03)

### 1. Record the current claim

The team labels the extension Level A because its application calls a released custom wrapper. That label has not yet examined the wrapper's SAP dependency.

- **App dependency:** Custom posting wrapper
- **Wrapper release:** Team released
- **SAP dependency:** Not inspected
- **Assessment:** Level A claimed, unverified

A public custom interface is only the start of the review.

### 2. Follow the call to its SAP dependency

The call graph reveals an internal SAP function behind the wrapper. Releasing the wrapper does not grant that function a SAP stability contract or erase its upgrade risk.

- **App dependency:** Custom posting wrapper
- **Wrapper release:** Unchanged
- **SAP dependency:** Internal function identified
- **Assessment:** Level A claim unsupported

Encapsulation does not change the underlying dependency's status.

### 3. Evaluate a real alternative

For this hypothetical target, repository evidence identifies a released local API with C1 and suitable visibility. The team also checks that its posting operation, authorization and transaction behavior meet the requirement.

- **Candidate:** Released local posting API
- **Contract:** C1: local use
- **Fit:** Operation and LUW reviewed
- **Assessment:** Replacement candidate accepted

Release purpose and business suitability are separate checks.

### 4. Replace the dependency and retest

The wrapper is adapted to the suitable released API. A successful post, rejected post and rollback scenario are checked against the new dependency before removing the internal call.

- **App dependency:** Same custom interface
- **SAP dependency:** Released local API
- **Internal call:** Removed in this scenario
- **Verification:** Success, rejection, rollback checked

A dependency change still needs behavior evidence.

### 5. Keep the evidence with the decision

The record identifies the target release, API release state, contract, visibility, dependency scan and test revision. C1 is a use contract, not Clean Core Level C and not a remote API release.

- **API evidence:** Target-specific record stored
- **Dependency assessment:** Internal dependency removed
- **Contract meaning:** C1 local; C2 remote
- **Remaining review:** Whole extension and delivery checks

Assess the full solution rather than promoting one wrapper in isolation.

**Remember:** Trace transitive dependencies, verify released use on the target and test the business contract; a wrapper alone cannot upgrade an internal API's status.

**Scope:** Hypothetical API names and successful checks are scenario facts, not evidence for a real system. Where no suitable released API exists, assess edition-specific options and an owned exception; do not assume every classic BAPI is Level B.

**Sources:**

- [SAP: Clean Core extensibility best practices](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/explaining-extensibility-model-best-practices_e290f382-800e-40ef-a203-85a13115f487)
- [SAP: Released APIs and release contracts](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/released-apis)
- [SAP: Finding released APIs](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/finding-released-apis-and-deprecated-objects)

## Start an external workflow from a committed approval

Approving order 4720 must start an external workflow. The first approval attempt fails validation; a corrected retry succeeds while event delivery is temporarily delayed.

**Learn:** Separate RAP event raising in late save from asynchronous delivery after commit and duplicate-safe consumption.

Questions: [ADV-11](https://abap-interview-studio.pages.dev/#q-ADV-11), [SRAP-18](https://abap-interview-studio.pages.dev/#q-SRAP-18), [SRAP-04](https://abap-interview-studio.pages.dev/#q-SRAP-04)

### 1. Reject the first attempt before external work

The first approval fails its credit check. Calling the workflow endpoint from a determination could have started work for an approval that never saved, so this design performs no such call.

- **Order:** Pending approval
- **Save:** Rejected by credit check
- **Event:** No committed event
- **Workflow:** Not started

Early calculations must not announce a completed business change.

### 2. Retry and raise the event in supported late save

After correction, the approval passes its checks. In the supported save implementation, the BO raises Approved with order 4720 and business reference APPROVAL-4720-1.

- **Order:** Approved in pending save
- **Save:** Late save running
- **Event:** Raised through RAP
- **Workflow:** Not started

Raising a RAP business event occurs within the save lifecycle.

### 3. Commit the local approval

The local transaction commits successfully. Event infrastructure now has the committed notification for asynchronous delivery; the external workflow has its own transaction and outcome.

- **Order:** Approved and committed
- **Save:** Successful
- **Event:** Awaiting delivery
- **Workflow:** Not started

A local commit cannot atomically complete a remote workflow.

### 4. Recover delayed delivery

The configured event channel is temporarily unavailable, then delivery resumes through its supported retry mechanism. Operations monitor the pending event instead of repeating the approval action.

- **Order:** Approved and committed
- **Event:** Delivered after retry
- **Reference:** APPROVAL-4720-1
- **Workflow:** Request received

Delivery recovery should not create another approval.

### 5. Make repeated consumption harmless

The workflow consumer records APPROVAL-4720-1 together with its workflow result. In this example a repeated notification finds that record and acknowledges it without creating another workflow.

- **Order:** Approved and committed
- **Notifications:** 2 received
- **Reference:** APPROVAL-4720-1 already processed
- **Workflow:** Exactly 1 created in this example

Design and test deduplication; do not assume exactly-once delivery.

**Remember:** Raise the event through supported RAP saving, let committed work be delivered asynchronously, and make the consumer safe to retry.

**Scope:** Illustrative event-enabled design with a configured reliable channel and a consumer that atomically records deduplication with its result. Event bindings, delivery guarantees, retries and monitoring must be verified for the target setup; no remote call was executed.

**Sources:**

- [SAP: RAP business events](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/0b925bc556d4491aad395b21ec2566ff.html)
- [SAP: Raising and handling business events](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/raising-and-handling-business-events)
- [SAP: Expose a RAP business event](https://developers.sap.com/tutorials/abap-environment-expose-rap-business-events)

## From a suggested discount to a checked action

Order 4720 totals 1200 EUR. The UI supports action parameter defaults. This example suggests 10 percent and allows actual discounts from 0 to 20 percent.

**Learn:** See when a suggestion is returned, when input is checked and when business data actually changes.

Questions: [ADV-15](https://abap-interview-studio.pages.dev/#q-ADV-15)

### 1. Open ApplyDiscount

The user opens the action dialog. The supporting UI requests GetDefaultsForApplyDiscount; it has not executed ApplyDiscount.

- **Dialog input:** Waiting for defaults
- **Order in buffer:** 1200 EUR
- **Saved order:** 1200 EUR

Opening a dialog must not apply the discount.

### 2. Return the suggested 10 percent

The default function reads 1200 EUR and returns DiscountPercent 10. Only the dialog receives a value.

- **Dialog input:** 10 percent suggested
- **Order in buffer:** 1200 EUR
- **Saved order:** 1200 EUR

The business object remains unchanged.

### 3. Replace the suggestion with 80

The user enters 80. The earlier suggestion does not prevent different input. A direct API caller could submit the same value without asking for defaults.

- **Dialog input:** 80 percent entered
- **Order in buffer:** 1200 EUR
- **Saved order:** 1200 EUR

A suggestion is not a validation rule.

### 4. Reject the actual action input

ApplyDiscount receives 80 and checks the example policy of 0 to 20 percent. It rejects the input with a message and makes no order change.

- **Dialog input:** 80 rejected; message shown
- **Order in buffer:** 1200 EUR
- **Saved order:** 1200 EUR

The action protects its own input, independently of defaulting.

### 5. Submit a valid 10 percent

The user enters 10 and executes the action again. After its permission and business checks pass, the action applies the discount in the transactional buffer.

- **Dialog input:** 10 accepted
- **Order in buffer:** 1080 EUR pending save
- **Saved order:** 1200 EUR

Successful interaction is not yet a committed result.

### 6. Complete the save

The save sequence succeeds and the framework or external transaction owner completes the transaction. The saved amount is now 1080 EUR.

- **Dialog input:** Dialog completed
- **Order in buffer:** Transaction completed
- **Saved order:** 1080 EUR

The default function did not save anything; the later action and save did.

**Remember:** A default function suggests. The action checks and changes. A successful save makes the change permanent.

**Scope:** Illustrative supported Fiori elements flow, not a live SAP trace. Real discount policy, currency rounding, authorization, concurrency and client support must be verified. A direct caller can skip defaulting.

**Sources:**

- [SAP: defaulting action input parameters](https://help.sap.com/docs/abap-cloud/abap-rap/defaulting-input-parameters-for-operations)
