# Practical ABAP: values, expressions, and failure paths

Use these worked scenarios after the basic language questions. They test the consequences of parameter passing, aliasing, partial updates, and failure handling rather than syntax recall alone. Modern additions require a supporting target release and language version; examples are teaching scenarios, not executed SAP evidence.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## BASE-01 What changes when a method receives a CHANGING parameter by value instead of by reference?

**Level:** Senior

**Short answer:** By reference, the method works on the caller's data directly. With VALUE on a CHANGING parameter, it works on a local value and copies it back when the method finishes normally. If an exception leaves the method, that normal copy-back does not happen. This can protect the caller's value, but it does not roll back database writes or changes to shared objects.

**Reasoning and example:** Start with a plain integer containing 10. A method changes its CHANGING parameter to 20 and then raises an exception that leaves the method. With reference passing, the caller can already see 20. With value passing, the caller retains 10 because the local result was not copied back. On normal completion, both forms can return the changed value.

That difference is important when changing an existing method signature. Tests must cover both successful completion and escaping exceptions. If the value contains an object reference, changing the referenced object is a separate effect: the copy still points to that object. VALUE is not a general undo mechanism for everything the method does.

**Avoid this mistake:** Pass-by-value is not a transaction rollback and does not clone objects behind reference parameters.

**Interviewer follow-ups:**

- How would this change with an object reference parameter?
- Can an IMPORTING reference variable still expose a mutable object?

**Strong answer criteria:**

- Separates input/output direction from value/reference passing
- Explains when a local value is copied back
- Identifies effects on the database and shared objects

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

## BASE-02 A copied structure contains a string, a nested table, and an object reference. Is it an independent snapshot?

**Level:** Senior

**Short answer:** Not completely. The copied string and nested internal table behave as independent values when changed. A copied object reference still points to the same object. Changing that object through either structure can therefore affect what the other sees. For a true snapshot, I decide how to handle every mutable referenced object instead of assuming ordinary assignment clones it.

**Reasoning and example:** Suppose ls_request contains a note, an item table and a reference to a pricing object. I copy it to keep a before-change version. Editing the copied note or item values does not change the original value components. But calling a setter on the copied pricing reference changes the same pricing object used by the original structure.

If the snapshot must preserve the old price, I store the calculated price as a value, use an immutable object or implement a deliberate copy of the required object state. A full clone needs rules for shared identities and cycles. Runtime memory-sharing optimizations do not change these value-versus-reference rules; a deep ABAP type is not automatically a deep object clone.

**Avoid this mistake:** A deep ABAP type is not a promise that ordinary assignment recursively clones the entire object graph.

**Interviewer follow-ups:**

- Which components need copying for an audit snapshot?
- How would you test sharing without inspecting memory addresses?

**Strong answer criteria:**

- Separates copied values from copied references
- Explains why both references still point to one object
- Defines what a snapshot must preserve

**Verification evidence:** Mutation tests for a copied string, nested row, and referenced object's attribute.

**Read and verify this answer:**

- [SAP: Sharing between dynamic data objects](https://help.sap.com/docs/abap-cloud/abap-keyword/sharing-between-dynamic-data-objects?locale=en-US&state=PRODUCTION&version=latest) - Distinguishes copying reference values from internal sharing of strings and tables.

<details>
<summary>Visual: Value components versus a shared referent</summary>

![Value components versus a shared referent](../visuals/deep-alias-snapshot.svg)

Two structure values own independent string values but lead to the same pricing object. The arrow targets explain why a getter can expose mutable state.

**Explain it:** Which change affects only ls_copy, and which change affects an object visible through both?

**Limit:** Conceptual object identity, not physical memory addresses or a particular sharing optimization.

</details>

## BASE-03 A large temporary internal table is no longer needed. When would you choose CLEAR or FREE?

**Level:** Advanced

**Short answer:** For an internal table without a header line, CLEAR and FREE both remove the rows. CLEAR keeps the initial memory allocation available; FREE releases that allocation too. I use CLEAR when I expect to refill the table soon, and FREE when it is finished for now. Neither removes the variable declaration or guarantees that the operating system immediately shows lower process memory.

**Reasoning and example:** A package loop fills a small work table, processes it and starts the next package. CLEAR is often a sensible reset because the table will be used again. Repeatedly freeing and allocating it may add unnecessary work. After a one-off large reconciliation, FREE may be appropriate when the table will no longer be needed.

I distinguish memory used by current rows from memory retained for future use, and measure in the relevant ABAP session. CLEAR does not promise to retain every byte the table ever needed. FREE also does not destroy an object that another reference still reaches. A single process-memory number cannot explain all of those separate lifetimes.

**Avoid this mistake:** Do not claim CLEAR retains every byte ever allocated, or that FREE destroys referenced objects still reachable elsewhere.

**Read and verify this answer:**

- [SAP: CLEAR](https://help.sap.com/docs/abap-cloud/abap-keyword/clear?locale=en-US&state=PRODUCTION&version=latest) - CLEAR releases table rows but retains the initial memory requirement; FREE releases that too.

<details>
<summary>Visual: Three distinct state and memory lifetimes</summary>

![Three distinct state and memory lifetimes](../visuals/deep-memory-lifetime.svg)

Empty row slots and the initial allocation are deliberately drawn separately. A new object does not imply a new internal session or empty class cache.

**Explain it:** Why can recreating a service leave a test-order failure unchanged?

**Limit:** Allocation diagram is qualitative; measure actual ABAP memory and cache lifetime in the target context.

</details>

## BASE-04 A dynamic ASSIGN fails, but IS ASSIGNED is still true. How can the program update the wrong field?

**Level:** Advanced

**Short answer:** The field symbol may still point to the previous successful target after a failed dynamic ASSIGN. IS ASSIGNED only says it points somewhere; it does not prove the latest lookup worked. I check the ASSIGN result immediately. Where supported, ELSE UNASSIGN makes failure clear. Otherwise I unassign before the lookup and handle failure before writing through the field symbol.

**Reasoning and example:** A generic mapper first assigns component PRICE and writes an amount. It then tries the misspelled component PRCIE using the same field symbol. If that lookup fails but the old assignment remains, checking only IS ASSIGNED can allow the next write to change PRICE again. The program has updated a real field, but the wrong one.

I test the sequence of one successful lookup followed by one failed lookup. An isolated failure test can miss the stale assignment. The mapper should reject the unknown component or follow a clearly defined skip rule, and it must not write through the old alias. I verify release support before using ELSE UNASSIGN syntax.

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

## BASE-05 A READ TABLE fails, yet a later IF sy-subrc = 0 takes the success branch. What do you inspect?

**Level:** Advanced

**Short answer:** sy-subrc holds the result of the most recent statement that set it. It is not permanently attached to READ TABLE. Another statement between the read and the IF may have replaced the value. I check it immediately or save it in a named variable. Table expressions have their own exception or predicate behavior, so I do not assume they work like READ TABLE.

**Reasoning and example:** A READ TABLE does not find an order. Before checking the result, the program uses FIND to prepare a log message, and FIND succeeds. The later IF sy-subrc = 0 now checks the FIND result, so it enters the success branch even though the order lookup failed.

I move the decision directly after the read or preserve the read result before doing other work. The regression case includes a missing order and successful log preparation, because that is the sequence that caused the bug. Not every statement changes sy-subrc, so I inspect the actual intervening statements rather than guess. A modern table expression must be handled according to its documented missing-row behavior.

**Avoid this mistake:** Not every statement resets sy-subrc, and a table expression is not a drop-in sy-subrc-producing READ TABLE.

**Read and verify this answer:**

- [SAP: SY-SUBRC](https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353523632.html) - Return values belong to particular statements and can be replaced by later statements.

<details>
<summary>Visual: Stale aliases and overwritten return codes</summary>

![Stale aliases and overwritten return codes](../visuals/deep-stale-results.svg)

The first sequence can write to the previous target. The second takes a success branch for a different operation than the programmer intended.

**Explain it:** Which test requires a successful operation before the failure to expose the defect?

**Limit:** Only statements documented to set sy-subrc replace it. Assignment failure behavior depends on the exact form and additions.

</details>

## BASE-06 An import must reject precision loss rather than silently round or truncate. Where does EXACT help?

**Level:** Advanced

**Short answer:** EXACT checks that an assignment or calculation can produce its target value without losing information. It raises an appropriate exception when that is impossible. CONV uses normal conversion rules and is not the same check. I catch conversion failures at the input boundary and explain them to the caller. I still validate business rules, because an exact value can still be forbidden.

**Reasoning and example:** An import receives a text value longer than the fixed-length target field. A normal conversion may discard characters, while a lossless conversion can reject that input. For a packed result with two decimals, a calculation such as one divided by three cannot be represented exactly, so EXACT is useful if rounding is prohibited.

If the business actually requires rounding, I apply the agreed rounding rule explicitly instead of treating every inexact result as invalid. I also check rules such as a positive amount, a known currency or an allowed identifier. EXACT can detect loss of technical information; it cannot decide whether a perfectly representable negative amount is acceptable for this document.

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

## BASE-07 Two invoice totals differ by one cent although both use decimal types. How do you diagnose rounding?

**Level:** Senior

**Short answer:** I check where rounding happens, which rounding mode is required and the precision of intermediate values. Rounding each line and then adding can differ from adding first and rounding the total. Decimal types do not decide that business rule for me. I keep the currency context and write tests for values near the rounding boundary.

**Reasoning and example:** Assume the agreed rule is half-up rounding to two decimals. Two positive line results are each 0.005. If each line is rounded first, each becomes 0.01 and the total is 0.02. If I add the precise values first, the sum is 0.010 and rounds to 0.01. Both calculations follow their chosen order, but only the specified order is correct for the document.

I compare the implementation with that rule, including intermediate assignments that may already round a value. I test multiple small lines, negative amounts where allowed and currency-specific requirements. Changing the display to two decimals or choosing decfloat34 does not by itself settle when or how the business wants rounding.

**Avoid this mistake:** Choosing decfloat34 or formatting two decimals does not settle the business rounding policy.

**Interviewer follow-ups:**

- How do negative half-way values affect the selected mode?
- Where is currency conversion applied relative to tax rounding?

**Strong answer criteria:**

- Checks precision at each calculation step
- States when and how rounding occurs
- Keeps the correct currency and conversion rules

**Verification evidence:** Worked positive/negative boundary examples with independently calculated expected totals.

**Read and verify this answer:**

- [SAP: Rounding function ROUND](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDEC_FLOATING_POINT_ROUND.html) - Decimal places, precision, and explicit rounding modes are distinct choices.

<details>
<summary>Visual: Conversion, rounding, and reduction counterexamples</summary>

![Conversion, rounding, and reduction counterexamples](../visuals/deep-numeric-boundaries.svg)

A lost character, a one-cent difference, and a false maximum reveal three unrelated errors that concise syntax can hide.

**Explain it:** Which expected results change with a different rounding mode, and which are independent of rounding?

**Limit:** Half-up and two decimals are explicit exercise assumptions, not a universal currency rule. MAX notation is explanatory.

</details>

## BASE-08 Why can replacing MOVE-CORRESPONDING with CORRESPONDING erase an existing structure field?

**Level:** Advanced

**Short answer:** Plain CORRESPONDING builds a new result. Fields missing from the source therefore become initial in that result. MOVE-CORRESPONDING between structures keeps unmatched fields already in the target. A CORRESPONDING expression with BASE can start from existing values, but matching source fields still overwrite them, even with initial values. I choose the form based on the intended update behavior.

**Reasoning and example:** The existing request has status Approved and a note. The incoming structure contains only a new note. MOVE-CORRESPONDING updates the note and leaves the status. Assigning a plain CORRESPONDING result replaces the whole target with a new value, so the unmatched status becomes initial. Supplying the existing structure as BASE preserves that unmatched status.

Now consider a source type that also contains status, but with a blank value. Status matches by name, so it can overwrite the BASE value with blank. BASE is not an automatic ignore-empty or PATCH rule. If an API must distinguish an omitted field from an explicitly cleared field, I define and test field-presence handling separately.

**Avoid this mistake:** BASE preserves unmatched components; it does not mean ignore every initial source value or implement PATCH automatically.

**Read and verify this answer:**

- [SAP: Working with structures](https://help.sap.com/docs/abap-cloud/abap-concepts/working-with-structures?locale=en-US) - Compares MOVE-CORRESPONDING with CORRESPONDING and BASE.

<details>
<summary>Visual: Three mapping cases and two presence cases</summary>

![Three mapping cases and two presence cases](../visuals/deep-presence-merge.svg)

The matching initial status overwrites BASE just as a populated status does. A separate parameter table shows why zero cannot encode omission.

**Explain it:** Which source needs a presence flag when the source type always contains status?

**Limit:** Structure mapping example; internal-table BASE preserves rows under different construction semantics.

</details>

## BASE-09 Unsorted orders must be processed once per customer with their member rows. How does GROUP BY change the loop?

**Level:** Advanced

**Short answer:** LOOP AT with GROUP BY collects rows with equal group keys even when they are not adjacent. The outer loop then runs once per group. LOOP AT GROUP can process that group's members. This avoids relying on the input being sorted for traditional control-level processing. I still define the required group and member order rather than assume grouping provides the business sort order.

**Reasoning and example:** The input customer sequence is A, B, A. Grouping by customer creates two groups, and both A orders belong together despite being separated in the input. The group loop runs twice. Inside the A group, a member loop can calculate its total or process each of its orders.

I use an explicit group key when it makes the code easier to follow. If I request WITHOUT MEMBERS because only distinct customers are needed, I cannot later loop over the missing group members. This processing happens on an internal table in ABAP memory, not as database aggregation. If the output must be customer-sorted, I express and test that ordering instead of relying on encounter order.

**Avoid this mistake:** Grouping an internal table is not database aggregation, and its default group order is not automatically business sort order.

**Read and verify this answer:**

- [SAP: LOOP AT itab, GROUP BY](https://help.sap.com/docs/abap-cloud/abap-keyword/loop-at-itab-group-by?locale=en-US&state=PRODUCTION&version=latest) - Grouping and group iteration are separate phases; prior sorting is not required.

<details>
<summary>Visual: Unsorted group membership and explicit filter keys</summary>

![Unsorted group membership and explicit filter keys](../visuals/deep-group-filter.svg)

Arrows bring nonadjacent A rows into one group. The grouping total is computed from members, not read from the representative row.

**Explain it:** What changes with WITHOUT MEMBERS, and why is an arbitrary OR predicate not automatically a basic FILTER condition?

**Limit:** Source rows and totals are illustrative; no measured performance advantage is asserted.

</details>

## BASE-10 A FILTER expression is proposed for a standard table with an empty primary key. Is that enough?

**Level:** Advanced

**Short answer:** An empty primary key alone is not enough for the basic FILTER form. It needs a suitable sorted or hashed key. A standard table can work if it has a suitable secondary key selected with USING KEY. The condition must also follow the chosen key rules. For an arbitrary condition, a FOR expression or a normal loop may be clearer.

**Reasoning and example:** A standard table keeps orders in arrival order but also has a sorted secondary key starting with customer. A key-based FILTER can use that secondary key to select a customer according to the supported predicate rules. The table does not need to lose its arrival-order use just to gain another access path.

A condition combining unrelated fields with a complex OR is a different problem. I do not force it into FILTER just because the syntax looks shorter. A straightforward loop or suitable FOR expression can express the intended rule more clearly. I check the actual key definition and target-release syntax, then measure if performance matters; the keyword alone does not prove a faster implementation.

**Avoid this mistake:** FILTER is not a general-purpose synonym for every WHERE expression supported by LOOP or FOR.

**Read and verify this answer:**

- [SAP: FILTER, basic form](https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abenconstructor_expr_filter_basic.htm) - Defines sorted/hash key requirements and supported predicate forms.

<details>
<summary>Visual: Unsorted group membership and explicit filter keys</summary>

![Unsorted group membership and explicit filter keys](../visuals/deep-group-filter.svg)

Arrows bring nonadjacent A rows into one group. The grouping total is computed from members, not read from the representative row.

**Explain it:** What changes with WITHOUT MEMBERS, and why is an arbitrary OR predicate not automatically a basic FILTER condition?

**Limit:** Source rows and totals are illustrative; no measured performance advantage is asserted.

</details>

## BASE-11 A REDUCE expression calculates a maximum, but all-negative input returns zero. What went wrong?

**Level:** Advanced

**Short answer:** The initial accumulator value is wrong for this input. Starting a maximum at zero makes zero a candidate, even if every real value is negative. I start from a valid member or represent no result explicitly. I also define what empty input means. REDUCE makes the loop concise, but it does not choose the correct starting value or numeric type for me.

**Reasoning and example:** For values -8 and -3, the maximum is -3. An accumulator initialized to zero stays at zero because neither input is larger. The result looks like a valid number but does not occur in the input and is not its maximum. Initializing from a valid first member avoids that invented candidate.

An empty table needs a separate decision: perhaps return an optional result, or raise a meaningful exception if at least one value is required. I test empty, all-negative, mixed and single-value inputs. I also check intermediate type limits and rounding. A reviewer should be able to see initialization, comparison and update clearly; if the expression hides them, I use a named step or loop.

**Avoid this mistake:** REDUCE does not supply mathematically correct initial values or empty-set semantics on the developer's behalf.

**Read and verify this answer:**

- [SAP: Table reductions, structured result](https://help.sap.com/docs/abap-cloud/abap-keyword/itab-table-reductions-structured-result) - Shows explicit initialization and iterative accumulator updates.

<details>
<summary>Visual: Conversion, rounding, and reduction counterexamples</summary>

![Conversion, rounding, and reduction counterexamples](../visuals/deep-numeric-boundaries.svg)

A lost character, a one-cent difference, and a false maximum reveal three unrelated errors that concise syntax can hide.

**Explain it:** Which expected results change with a different rounding mode, and which are independent of rounding?

**Limit:** Half-up and two decimals are explicit exercise assumptions, not a universal currency rule. MAX notation is explanatory.

</details>

## BASE-12 A report accepts a filter value and a sort-column name. Is escaping quotes sufficient for safe SQL?

**Level:** Senior

**Short answer:** No. A filter value and a column name are different kinds of input. I pass values through host variables in static ABAP SQL where possible. For a configurable column or dynamic clause, I map approved choices to known SQL elements and reject anything else. Escaping quotes in a value does not make arbitrary SQL text safe or authorized.

**Reasoning and example:** A customer name containing an apostrophe should be treated as a value, not assembled into executable SQL text. A requested sort option is different: I map an accepted choice such as newest to a known timestamp column and direction. I do not accept any string and insert it as ORDER BY syntax.

Mandatory authorization restrictions are built separately from optional user filters. The user must not be able to remove them by changing a filter or sort parameter. I test unknown columns, invalid directions and inputs containing SQL-like text, as well as ordinary names. Safe quoting protects one kind of value; it does not approve table names, operators, whole conditions or access to restricted data.

**Avoid this mistake:** Input that is safely quoted as a literal is not therefore safe as SQL syntax or an authorized data access.

**Interviewer follow-ups:**

- How would you test an input that is valid syntax but unauthorized?
- Which parts of the SQL shape can remain completely static?

**Strong answer criteria:**

- Separates data values from SQL names and syntax
- Maps choices to explicitly allowed SQL elements
- Keeps mandatory authorization conditions in place

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

## BASE-13 A resource release is placed only in CLEANUP. Why can it remain unreleased after success?

**Level:** Senior

**Short answer:** CLEANUP is not a finally block that runs after every TRY. It is used during the relevant exception propagation to an outer handler. It does not run just because normal processing reaches ENDTRY. I arrange release on success and on the required error paths. I also check who owns the resource so I do not release framework-owned locks too early.

**Reasoning and example:** A method opens an application-owned temporary handle and processes data successfully. If release exists only in CLEANUP, reaching ENDTRY normally leaves that handle open. An exception caught inside the same TRY also does not make CLEANUP a universal after-CATCH step. I therefore make the successful release and exceptional release paths explicit.

I test normal completion, a locally handled exception and an exception that leaves for an outer handler. Release can fail too, so I handle that without hiding the original error or letting an exception escape CLEANUP. The same reasoning applies to lock ownership: cleanup must respect the intended lifetime, not remove a framework lock while the business transaction still needs it.

**Avoid this mistake:** Do not assume CLEANUP automatically runs after a CATCH in the same TRY, or release framework-owned locks prematurely.

**Interviewer follow-ups:**

- What changes when the exception is caught inside the same TRY?
- Who owns release when a caller supplied the resource?

**Strong answer criteria:**

- Explains why CLEANUP is not a general finally block
- Tests successful and failed execution
- Releases only resources owned by this code

**Verification evidence:** Instrumented resource tests show one correct release on every intended exit.

**Read and verify this answer:**

- [SAP: Exception system response](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENEXCEPTIONS_SYSTEM_RESPONSE.html) - Explains stack unwinding and when CLEANUP blocks run or do not run.

<details>
<summary>Visual: Exceptional exits and preserved causes</summary>

![Exceptional exits and preserved causes](../visuals/deep-cleanup-cause.svg)

The table names three exit paths that require separate reasoning. The exception chain carries the lower-level diagnosis through a meaningful service-level failure.

**Explain it:** Which path would a test of only propagated exceptions miss?

**Limit:** Simplified non-resumable scenarios; exact nesting and handlers determine CLEANUP execution. Resource ownership remains application-specific.

</details>

## BASE-14 An optional limit parameter is omitted in one call and explicitly set to zero in another. How can a method distinguish them?

**Level:** Advanced

**Short answer:** IS SUPPLIED checks whether the caller passed the parameter. IS INITIAL checks its value. Those are different: an omitted parameter and an explicit zero can both contain zero. I use presence only when omission has a defined meaning in the API. A wrapper must preserve that meaning, because forwarding its own initial variable makes the downstream parameter supplied.

**Reasoning and example:** A helper treats an omitted limit as use the configured default, while a supplied zero means return no rows. Checking IS INITIAL cannot distinguish these calls. IS SUPPLIED can, so the helper first decides which meaning the caller requested and then applies the value rule.

A wrapper introduces another risk. If it always forwards its own optional parameter variable, the next method sees a supplied argument even when the original caller omitted it. I test the direct calls and the wrapper path, and forward conditionally or pass explicit presence information where appropriate. OPTIONAL permits omission; it does not automatically carry that omission through every later method call.

**Avoid this mistake:** OPTIONAL does not automatically preserve absent-versus-present semantics across another method boundary.

**Read and verify this answer:**

- [SAP: IS SUPPLIED](https://help.sap.com/docs/abap-cloud/abap-keyword/rel-exp-is-supplied) - Presence of an actual argument is independent of its initial value.

<details>
<summary>Visual: Three mapping cases and two presence cases</summary>

![Three mapping cases and two presence cases](../visuals/deep-presence-merge.svg)

The matching initial status overwrites BASE just as a populated status does. A separate parameter table shows why zero cannot encode omission.

**Explain it:** Which source needs a presence flag when the source type always contains status?

**Limit:** Structure mapping example; internal-table BASE preserves rows under different construction semantics.

</details>

## BASE-15 A single-line INSERT INTO TABLE hits an existing unique primary key. Does it update the existing row?

**Level:** Advanced

**Short answer:** No. In this single-row internal-table INSERT case, a duplicate unique primary key prevents insertion and is reported through sy-subrc. The existing row is not updated. I decide whether duplicates should be rejected, merged or replaced and implement that decision explicitly. Other insertion forms and secondary-key conflicts can behave differently, so I do not generalize this return-code rule.

**Reasoning and example:** An import contains order 7 twice, first with amount 100 and then with amount 200. Inserting both into a hashed table with a unique order key does not replace 100 with 200 automatically. If the program ignores the failed insertion, it may silently keep the first row and hide conflicting input.

I define the import rule before coding. Identical duplicates might be acceptable, in which case I compare the relevant values. Conflicting duplicates should produce a useful error with the order and input position, unless a deliberate replacement rule exists. I check sy-subrc immediately for this operation and test both cases. Uniqueness prevents duplicate keys; it does not explain which business value should win.

**Avoid this mistake:** Uniqueness enforcement is not a complete deduplication policy, and INSERT is not an automatic upsert.

**Read and verify this answer:**

- [SAP: Populating internal tables](https://help.sap.com/docs/abap-cloud/abap-concepts/populating-internal-tables) - Single-line insertion with duplicate unique primary key returns sy-subrc 4.

<details>
<summary>Visual: Duplicate insertion and empty authorization boundaries</summary>

![Duplicate insertion and empty authorization boundaries](../visuals/deep-duplicates-ranges.svg)

A duplicate unique key preserves the original row for the specified insertion form. An initial selection range has a very different meaning from an empty list of permissions.

**Explain it:** How would you distinguish identical duplicates from conflicting ones, and prove a user with no plants sees nothing?

**Limit:** Single-line INSERT INTO TABLE with a unique primary key; other insertion and key-conflict forms need their own documented handling.

</details>

## BASE-16 An authorization helper returns an empty range table. Why is WHERE field IN range unsafe as the only access restriction?

**Level:** Senior

**Short answer:** An empty ABAP selection range means no restriction for IN. It does not mean the user is allowed no values. If an authorization lookup returns no allowed plants, I return no data or reject the request before querying. I keep mandatory access restrictions separate from optional user filters. Nonempty ranges also have inclusion and exclusion rules, not just list membership.

**Reasoning and example:** A user has no permission for any plant. The helper returns an empty range, and a query uses WHERE plant IN that range as its only access check. The initial range does not narrow the selection, so the query can expose records the user should never see. The program must handle the no-permission result explicitly first.

I test a user with no allowed plants, one allowed plant and relevant exclusions. I also test that adding or omitting a user search filter cannot remove the mandatory restriction. An empty optional filter may correctly mean show all permitted data; an empty authorization result means no permitted data. They must not share an ambiguous representation without an explicit check.

**Avoid this mistake:** An empty ABAP selection range is not the same as an SQL list containing zero allowed values.

**Interviewer follow-ups:**

- How do you distinguish an optional filter from mandatory authorization?
- What result do you expect from a range containing only exclusions?

**Strong answer criteria:**

- Explains why an empty range does not restrict IN
- Returns no data when there are no permissions
- Separates optional search filters from required access checks

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

## Official references

- [SAP: Pass by value](https://help.sap.com/docs/abap-cloud/abap-keyword/pass-by-value)
- [SAP: Sharing between dynamic data objects](https://help.sap.com/docs/abap-cloud/abap-keyword/sharing-between-dynamic-data-objects?locale=en-US&state=PRODUCTION&version=latest)
- [SAP: CLEAR](https://help.sap.com/docs/abap-cloud/abap-keyword/clear?locale=en-US&state=PRODUCTION&version=latest)
- [SAP: ASSIGN, ELSE UNASSIGN](https://help.sap.com/docs/abap-cloud/abap-keyword/assign-else-unassign)
- [SAP: SY-SUBRC](https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353523632.html)
- [SAP: EXACT examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/05_Constructor_Expressions.md#exact)
- [SAP: Rounding function ROUND](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDEC_FLOATING_POINT_ROUND.html)
- [SAP: Working with structures](https://help.sap.com/docs/abap-cloud/abap-concepts/working-with-structures?locale=en-US)
- [SAP: LOOP AT itab, GROUP BY](https://help.sap.com/docs/abap-cloud/abap-keyword/loop-at-itab-group-by?locale=en-US&state=PRODUCTION&version=latest)
- [SAP: FILTER, basic form](https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abenconstructor_expr_filter_basic.htm)
- [SAP: Table reductions, structured result](https://help.sap.com/docs/abap-cloud/abap-keyword/itab-table-reductions-structured-result)
- [SAP: Prevent SQL injection](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/86dbe289f813483abd78de6a52458bff/36e78557e0f6a96be10000000a4450e5.html)
- [SAP: Exception system response](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENEXCEPTIONS_SYSTEM_RESPONSE.html)
- [SAP: IS SUPPLIED](https://help.sap.com/docs/abap-cloud/abap-keyword/rel-exp-is-supplied)
- [SAP: Populating internal tables](https://help.sap.com/docs/abap-cloud/abap-concepts/populating-internal-tables)
- [SAP: Comparison with selection tables](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENLOGEXP_SELECT_OPTION.html)
