# ABAP interview practice workbook

Solve each exercise before opening the suggested answer. The scenarios are hypothetical interview exercises. Code fragments illustrate reasoning and are not activated SAP repository objects. Validate exact syntax, dependencies and release compatibility in a target SAP system before using a fragment in an application.

## Exercise 1 Choose an internal table

You receive 100,000 unique order IDs. For each of 40,000 incoming messages, you must find the order by its complete ID. In another report you must process all orders for each customer in customer order. Choose a table category and explain the trade-offs.

### Model answer

For repeated complete unique-key lookups, consider a hashed table with the order ID as unique key. For grouped ordered processing, use a sorted table with a suitable leading customer key or a standard table with a named sorted secondary key. Account for writes, memory, key-maintenance cost and whether input order must be preserved. Do not describe partial hashed-key access as constant time.

### Follow-up

What changes when duplicate order IDs are permitted or only a partial key is known? Explain how you would handle a missing row without hiding a business error. Review ABAP-01 through ABAP-04.

## Exercise 2 Find the data-access defect

An import selects details with FOR ALL ENTRIES using an internal table of selected document IDs. The selection table can be empty. The developer also assumes duplicate result rows will be preserved.

### Model answer

Guard against an empty driver before issuing the query; otherwise the FOR ALL ENTRIES condition can be ignored and a much larger result retrieved. Consider whether a join, range or another supported query better expresses the requirement. FOR ALL ENTRIES also removes duplicate result rows, so the projected columns and intended multiplicity matter. Deduplicate a driver only when that preserves the intended semantics and reduces redundant work.

### Follow-up

Do not promise that a join is always faster. Compare result equivalence, transferred rows, execution count and representative timings. Review the SQL segment.

## Exercise 3 Correct a CDS identity

A flight entity exposes CARRID and CONNID as its only keys while reading SFLIGHT. It associates to SCARR using the carrier ID, declares a to-many relationship and projects `_Carrier.name`. The client occasionally confuses different departure dates.

### Model answer

Include FLDATE in the identity because departures can share carrier and connection but differ by date. Verify the actual SCARR element, CARRNAME, rather than a guessed `name` element. Model the carrier relationship with truthful to-one cardinality according to the ON condition and completeness of data. Do not claim a CDS key enforces database uniqueness. For a new supported model prefer a view entity; omit the legacy SQL-view-name annotation.

### Follow-up

Test multiple dates, a missing carrier and unexpected duplicate target rows. Decide DCL at the actual consumed entity. Review CDS-02, CDS-03, CDS-07 and CDS-11. This replaces the malformed illustrative CDS snippet in the original PDF rather than offering it as a ready-to-activate object.

## Exercise 4 Repair RAP transaction ownership

A proposed action changes a request, attempts COMMIT ENTITIES, then would invoke a remote workflow. That nested commit violates the RAP runtime contract. The design also needs to reject invalid date ranges before persistence. The developer proposes moving the commit into the saver.

### Model answer

Remove the independent commit from the behavior implementation. The RAP framework owns transaction completion; moving it to a saver does not fix the violation. Derive data through appropriate behavior, reject invalid instances before persistence, and coordinate workflow publication with committed state through a supported transactional mechanism. The external EML consumer, if present, checks modification responses and owns the outer COMMIT ENTITIES.

### Follow-up

Test invalid dates, a save failure and duplicate event delivery. A remote workflow call is not rolled back by the local database. Review RAP-04, RAP-05, BTP-07 and RICEFW-11.

## Exercise 5 Read an EML response

A validation returns an error message in REPORTED but does not fill FAILED. A determination tries to fill FAILED. A create handler returns only the database key and loses the caller's content ID.

### Model answer

The validation needs to identify the rejected instance in FAILED and return the contextual message in REPORTED. Determinations do not expose FAILED; design expected rejection in an appropriate validation, precheck or action. Creation mapping must preserve the required correlation, including %cid where the contract requires it. Return the correct transactional identity in instance-related responses, including draft or preliminary context where applicable.

### Follow-up

Explain %cid, %cid_ref, %tky and %pid without calling %tky a temporary key. For late numbering discuss preliminary-to-final mapping in ADJUST_NUMBERS. Review RAP-07 and RAP-10.

## Exercise 6 Secure an approval action

An app hides the Approve button for ordinary users. Its DCL filters one base CDS entity, but the service uses a projection without its own access control. An ordinary user can call the action URL directly.

### Model answer

Implement the appropriate operation authorization for approval and keep business-state availability in feature control. Establish read authorization on the consumed projection, using supported DCL inheritance where appropriate. Check service access, instance scope and downstream APIs separately. Test direct requests and known keys as well as the UI. A value help or hidden field does not protect the data.

### Follow-up

Would authorization: none or IN LOCAL MODE fix the bug? No: those deliberately bypass relevant checks in their defined contexts and require justification. Review CDS-07, ADV-02 and TEST-06.

## Exercise 7 Classify Clean Core dependencies

Classify these hypothetical cases. Assume the stated release or nomination is verified for the target system; do not infer it from a name.

| Case | Model classification and reasoning |
| --- | --- |
| ABAP Cloud extension using the appropriate released SAP APIs and released extension points | A for those dependencies and technologies |
| Classic code calling an API SAP has nominated as classic | B for that dependency |
| Read access to an internal SAP object that is neither released nor nominated and is not explicitly prohibited | C with upgrade risk and governance |
| Unsupported direct write to an SAP business table | D risk; replace with the supported business operation |
| Released custom wrapper calling a nominated classic API | The consumer sees a released custom contract; the underlying implementation still carries B dependency |
| BTP app using an unsupported private endpoint | Placement does not establish compliance; classify the actual dependency and remedy it |

### Follow-up

State the ATC mapping: A no corresponding usage finding, B priority 3, C priority 2, D priority 1. Explain why an ordinary security error in ATC is a different dimension. Review CORE-02 through CORE-16.

## Exercise 8 Diagnose a failed batch and stale update

An OData batch returns HTTP 200 but one inner response is 412. The UI reports success and the developer retries with If-Match set to a wildcard.

### Model answer

Inspect all inner responses and identify the atomic group. HTTP 412 indicates a failed precondition, commonly a stale ETag. Reload current state and resolve the conflict instead of automatically overwriting a newer version. Verify whether sibling operations rolled back under the supported changeset or atomicity-group semantics. A wildcard is not a sound default repair for lost-update protection.

### Follow-up

Explain why one batch can contain separate transaction scopes and why a CSRF token does not replace an ETag. Review ODATA-06 through ODATA-09.

## Exercise 9 Build a reliable approval flow

A committed request event is delivered twice. Approval later arrives after the requester has withdrawn the document. The callback times out after the backend accepted it.

### Model answer

Use correlation and idempotency to avoid duplicate workflow creation. Validate current status, request version and actor on every decision. Reject a stale approval of a withdrawn request. A repeated callback for an already accepted decision should return a stable outcome; a timeout means the result may be uncertain, so reconcile before retrying an irreversible operation. Monitor failed deliveries and provide controlled recovery.

### Follow-up

Draw the boundary between the local RAP transaction, event delivery, external workflow and callback transaction. Review RICEFW-11 through RICEFW-14 and BTP-08.

## Exercise 10 Explain and test a refactoring

A report method selects data, calculates discounts, writes a file and commits the transaction. It uses a singleton for the current date and a nested SELECT in every item loop. What would you do first?

### Model answer

Establish existing behavior, callers and transaction ownership. Separate the pure calculation from data and I/O dependencies and inject a clock where it improves deterministic tests. Measure database execution count before redesigning the read path. Keep commit with the appropriate transaction owner and preserve required output semantics. Add focused regression cases and change incrementally rather than rewriting every statement.

### Follow-up

Test discount boundaries, missing data, file failure and rollback behavior. Report which tests were actually run and which need the target system. Review OO-07, OO-13, TEST-01 and TEST-10.

## Exercise 11 Recover from an uncertain HTTP result

Your ABAP caller sends a create-order request with JSON. The service commits the order, but the connection times out before the response arrives. The retry job proposes sending the same request again with no correlation identifier.

### Model answer

Treat the outcome as unknown, not as a proven failure. Determine whether the contract supports an idempotency key or a query by stable business correlation. Reconcile the result before retrying a non-idempotent creation. Validate Content-Type, response status and error payload independently. Preserve identifiers such as leading-zero customer numbers and distinguish missing fields, null and empty values.

### Follow-up

What if the service returns 202? Explain how completion is observed. Explain why converting the JSON body to XML is a contract change, not just a header change. Review HTTP-01 through HTTP-12 and BTP-07.

## Exercise 12 Make a parallel background job restartable

A classic background job sends three independent work partitions through aRFC. Worker A commits, B fails and C is still running when the coordinator times out. An operator wants to rerun the whole job.

### Model answer

Identify each partition and its actual business outcome. Do not assume that rollback in the coordinator undoes worker A. Collect callbacks and RFC exceptions, persist checkpoints under an explicit transaction design, and handle ambiguous outcomes through reconciliation. Bound parallelism by available resources and avoid overlapping locked records. Retry only safe unfinished units. Verify the effect of WAIT and task processing on the database LUW for the chosen implementation.

### Follow-up

Distinguish the job scheduler from parallel execution. Explain the roles of SM36/SM37 in a classic landscape and application-job templates in supported cloud scenarios. State why job status and business item success are separate evidence. Review RFC-05 through RFC-12.

## Exercise 13 Diagnose an IDoc or AIF error before resubmission

An inbound integration reports a mapping or application error. The business user sees the message in a configured AIF monitor. A similar earlier message already created a business document. An operator proposes repeated resubmission until the status turns green.

### Model answer

Correlate the message, external business key and existing document. Inspect the original IDoc control/data/status records and the configured AIF processing/error context. Correct the root cause with the proper authorization, then use the owning reprocessing mechanism. Preserve audit evidence and protect against a duplicate business effect or a stale-state overwrite. AIF is not a new transport that replaces all IDoc or OData behavior.

### Follow-up

Explain how the diagnosis changes for transport hand-off versus application posting failure. Distinguish OData service semantics, IDoc asynchronous message processing and AIF monitoring/error handling. Review INTF-01 through INTF-12.

## A 60 minute mock interview

| Time | Interviewer prompt | What a strong response includes |
| --- | --- | --- |
| 0 to 5 minutes | Introduce yourself and one real project | Your actual role, constraint and outcome |
| 5 to 12 minutes | Choose table types and explain a missing lookup | Key semantics, mutation and error handling |
| 12 to 20 minutes | Diagnose a slow report | Evidence, SQL volume, access pattern and correctness |
| 20 to 32 minutes | Design a request BO with draft and approval | Composition, transaction owner, messages and concurrency |
| 32 to 40 minutes | Explain Clean Core levels and a missing API | Target edition, classification, options and governance |
| 40 to 48 minutes | Discuss an OData or workflow failure | Protocol, retries, atomicity and security |
| 48 to 55 minutes | Explain testing and deployment | Real evidence, negative tests, dependencies and limits |
| 55 to 60 minutes | Ask questions about the role | Landscape, ownership, quality process and expectations |

## Score the interview

Score eight technical responses from 0 to 3. A 0 is wrong or missing; 1 is a definition with important gaps; 2 is correct with an example; 3 adds a relevant trade-off, failure mode and validation approach. Treat the score as a self-assessment rather than a hiring prediction. Choose the three weakest topics and repeat different questions from them tomorrow.

## Personal story worksheet

For each of five real examples, write: business problem; my responsibility; constraints; options considered; decision; testing evidence; result; what I learned. Use this for a delivered feature, a defect, a performance problem, an integration and a disagreement about design. Use only outcomes and measurements that actually occurred.
