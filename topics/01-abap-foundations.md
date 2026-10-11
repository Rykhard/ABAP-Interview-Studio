# ABAP foundations

Practice explaining data structures and transactional correctness before discussing frameworks. These answers distinguish internal memory, database persistence, and application locks. Classic update-task examples apply to supported Standard ABAP environments; ABAP Cloud and RAP impose additional API and transaction restrictions.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

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

## ABAP-02 What are primary, secondary, default, and empty internal table keys?

**Level:** Core

**Short answer:** The primary key belongs to the table definition. Secondary keys add alternative sorted or hashed access paths, with memory and maintenance costs. The default key is derived from the row type and may omit fields I expected to matter. For an index-oriented standard table without key semantics, I explicitly use an empty key.

**Example and follow-up:** A standard table can preserve arrival order and still expose a sorted secondary key for customer access. I name the secondary key in the access when needed, and measure whether its repeated-read benefit justifies the overhead of frequent inserts or changes.

**Avoid this mistake:** An internal table key is not a database index, and an empty key does not remove the standard table's index.

**Read and verify this answer:**

- [SAP internal table reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: Internal table lookup</summary>

![Internal table lookup](../visuals/classic-internal-table-lookup.svg)

A free-key linear search, an ordered lookup, and a complete hashed-key lookup find the same record through different access paths.

**Explain it:** What changes if I need all rows in a key range, or preserve input order?

**Limit:** A standard table can use secondary keys; a hash lookup requires a suitable complete key. Hash storage and probe order are schematic, not SAP implementation guarantees.

</details>

## ABAP-03 When is BINARY SEARCH correct, and how do table expressions handle missing rows?

**Level:** Core

**Short answer:** Binary search on a standard table requires ascending order compatible with the search fields. If code can break that order, a sorted table is safer. A table expression normally raises CX_SY_ITAB_LINE_NOT_FOUND for a missing row. I use line_exists for existence only, or handle absence explicitly when retrieving data.

**Example and follow-up:** If absence means an optional description, VALUE with OPTIONAL may be appropriate. If an order must exist, returning an initial structure would hide a defect. When I need the row, I avoid an existence check followed by a second identical lookup.

**Avoid this mistake:** Adding BINARY SEARCH to an unsorted table can return incorrect results; modern table-expression syntax does not automatically optimize an unsuitable key.

**Read and verify this answer:**

- [SAP internal table reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: Internal table lookup</summary>

![Internal table lookup](../visuals/classic-internal-table-lookup.svg)

A free-key linear search, an ordered lookup, and a complete hashed-key lookup find the same record through different access paths.

**Explain it:** What changes if I need all rows in a key range, or preserve input order?

**Limit:** A standard table can use secondary keys; a hash lookup requires a suitable complete key. Hash storage and probe order are schematic, not SAP implementation guarantees.

</details>

## ABAP-04 How do a work area, field symbol, and data reference differ?

**Level:** Core

**Short answer:** Reading into a work area normally gives me a value to process independently. A field symbol aliases an assigned data object, so changing a table line through it changes that line directly. A data reference stores a reference to a data object and is dereferenced explicitly. I choose the mechanism for clarity and required mutation.

**Example and follow-up:** LOOP AT lt_orders ASSIGNING FIELD-SYMBOL(<ls_order>) is useful for changing non-key attributes in place. With INTO ls_order, changing ls_order alone does not update the table. I check assignment or binding before accessing optional aliases and references.

**Avoid this mistake:** Do not change protected table-key components through an alias; key restrictions depend on table category and the access in progress.

**Read and verify this answer:**

- [SAP internal table reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.
- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

## ABAP-05 What is the difference between a domain, data element, structure, and table type?

**Level:** Core

**Short answer:** A domain describes technical value properties such as type, length, and possible fixed values. A data element adds semantic meaning, field labels, and documentation. A structure groups components without defining persistent storage. A table type describes an internal table's row type, category, and keys. A database table is a separate persistence object.

**Example and follow-up:** Two fields can share a technical domain while using different data elements because their business meanings and labels differ. A reusable table type might describe a collection of request items, but declaring that type does not create database records.

**Avoid this mistake:** A DDIC structure is not a database table, and domain fixed values are not a universal substitute for application validation.

**Read and verify this answer:**

- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: DDIC technical and semantic layers</summary>

![DDIC technical and semantic layers](../visuals/classic-ddic-layers.svg)

A ten-character domain acts like a technical mold; data elements give two fields different business meanings, and table columns hold values.

**Explain it:** Which layer supplies field labels, and which object actually persists records?

**Limit:** The picture simplifies DDIC typing and does not imply that domain values or a value table enforce every database write.

</details>

## ABAP-06 How do a foreign key, check table, and value table differ in classic DDIC?

**Level:** Core

**Short answer:** A foreign key models a relationship between fields and a check table. It supports Dictionary semantics and applicable input checks, but I do not assume it creates a database-enforced constraint. A domain's value table is a proposal for defining such a relationship; defining the value table alone does not install the full check.

**Example and follow-up:** A country field can reference the country customizing table through a defined foreign-key relationship. An arbitrary programmatic database write must still preserve business validity. I also distinguish a foreign key from a secondary database index, which is an access structure.

**Avoid this mistake:** Foreign key does not mean secondary key or secondary index, and a value table alone does not guarantee valid database content.

**Read and verify this answer:**

- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: DDIC technical and semantic layers</summary>

![DDIC technical and semantic layers](../visuals/classic-ddic-layers.svg)

A ten-character domain acts like a technical mold; data elements give two fields different business meanings, and table columns hold values.

**Explain it:** Which layer supplies field labels, and which object actually persists records?

**Limit:** The picture simplifies DDIC typing and does not imply that domain values or a value table enforce every database write.

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

## ABAP-09 Why do SAP enqueue locks exist in addition to database locks?

**Level:** Advanced

**Short answer:** SAP enqueue locks express logical ownership of a business object across application processing. Database locks protect database operations within database transactions. Applications cooperating on the same object must use a consistent enqueue protocol, handle conflicts, and release or transfer ownership at the correct point. Lock scope and update ownership matter in classic transactions.

**Example and follow-up:** For a document edit, acquire the appropriate object lock, read consistent state, validate, and save under the intended transaction protocol. Handle user cancellation and error paths as carefully as success. Classic diagnosis can include SM12; cloud applications use supported tooling and APIs.

**Avoid this mistake:** An enqueue lock does not physically prevent unrelated SQL code from updating a table if that code ignores the locking protocol.

**Read and verify this answer:**

- [SAP LUW reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/17_SAP_LUW.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: SAP LUW and database LUW</summary>

![SAP LUW and database LUW](../visuals/classic-sap-database-luw.svg)

Several database transactions can serve a single classic SAP business transaction. The illustrated early database transactions only read; coordinated persistence happens at the end.

**Explain it:** Who owns the commit, and why does a database lock not protect a long user interaction?

**Limit:** The final save may use update processing in another context. Lock scope and transfer rules vary; the line is conceptual ownership, not a universal enqueue lifetime. Do not apply classic COMMIT WORK patterns inside RAP handlers.

</details>

## ABAP-10 How do you choose and propagate class-based exceptions?

**Level:** Core

**Short answer:** I use CX_STATIC_CHECK for an explicit recoverable failure contract, CX_DYNAMIC_CHECK when the API intentionally relies on runtime propagation rules, and CX_NO_CHECK for failures that should propagate implicitly. I catch where I can recover or translate meaningfully. When wrapping a dependency failure, I preserve its original exception through PREVIOUS.

**Example and follow-up:** A repository failure might become an application-specific document-read exception while retaining the technical cause. I do not add an empty CATCH merely to satisfy a signature, and I do not replace an established framework error contract without considering its caller.

**Avoid this mistake:** NO_CHECK does not mean an exception cannot be caught; DYNAMIC_CHECK does not mean it can cross any procedure interface without declaration.

**Read and verify this answer:**

- [SAP exception category and propagation rules](https://help.sap.com/saphelp_snc70/helpdata/EN/97/16934258a5c76ae10000000a155106/content.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

## ABAP-11 Which modern ABAP expressions are useful, and when should you avoid them?

**Level:** Core

**Short answer:** Inline declarations, VALUE, CORRESPONDING, COND, CONV, and string templates can make intent clearer and reduce temporary variables. I use them when the supported release and language version allow them. A deeply nested expression that hides branching or expensive work is harder to debug, so I prefer named intermediate steps when they explain the business logic.

**Example and follow-up:** CORRESPONDING maps components by name unless explicit mapping changes that behavior. CONV converts a value; it does not validate every business rule. A short expression for selecting a default is useful, while a dense REDUCE replacing several unrelated calculations may be less readable.

**Avoid this mistake:** Modern expression syntax is not synonymous with ABAP SQL and does not automatically improve runtime performance.

**Read and verify this answer:**

- [SAP internal table reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.
- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

## ABAP-12 How do you handle amounts, quantities, dates, and timestamps correctly?

**Level:** Core

**Short answer:** I keep amounts with currency and quantities with their unit, using suitable decimal types and the application's conversion rules. I distinguish a date from a timestamp and preserve time-zone context when converting instants for users. Formatting is a presentation concern; calculations and interfaces need stable semantics, precision, and documented rounding behavior.

**Example and follow-up:** Adding 100 EUR to 100 USD without conversion produces a meaningless total. A deadline stored as an instant can cross a local date boundary for another user. Test currency decimal differences, daylight-saving transitions, and rounding at the intended business boundary.

**Avoid this mistake:** A numeric field alone does not explain its currency or unit, and a local date-time string is not an unambiguous global instant.

**Read and verify this answer:**

- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

## ABAP-13 When would you use RTTI, RTTC, or dynamic ABAP?

**Level:** Advanced

**Short answer:** RTTI inspects runtime type information; RTTC creates type descriptions used to construct data objects dynamically. They are valuable for generic frameworks whose structure is genuinely unknown beforehand. For normal business logic I prefer static types, because they make contracts, navigation, checks, and maintenance easier. Dynamic names and selections also require explicit validation.

**Example and follow-up:** A configurable export framework may need to inspect component metadata and construct a selected output shape. An ordinary invoice service with a stable schema normally does not. Validate allowed fields rather than turning arbitrary user text into dynamic SQL fragments.

**Avoid this mistake:** Dynamic programming is not inherently more reusable, and escaping values alone does not validate arbitrary dynamic SQL identifiers or syntax.

**Read and verify this answer:**

- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

## ABAP-14 How would you investigate an ABAP failure without changing production behavior?

**Level:** Core

**Short answer:** I start with the exact operation, inputs, time, user, and system context, then correlate application logs, error details, and a dump if one exists. I reproduce with controlled data and inspect the failing call path. A fix should address the cause and preserve authorization, locking, and transaction boundaries, with a focused regression scenario.

**Example and follow-up:** In classic systems ST22 can identify a dump and its call stack; debugging or tracing must use appropriate permissions and scope. A background or update failure may run under a different user and execution context from the original dialog request.

**Avoid this mistake:** Suppressing an exception or granting broad authorization may hide the symptom while leaving the defect and data-integrity risk intact.

**Read and verify this answer:**

- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm) - Check the language and runtime semantics; classic examples do not establish ABAP Cloud API availability.

## Official references

- [SAP internal table reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md)
- [SAP LUW reference and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/17_SAP_LUW.md)
- [SAP exception category and propagation rules](https://help.sap.com/saphelp_snc70/helpdata/EN/97/16934258a5c76ae10000000a155106/content.htm)
- [SAP ABAP Keyword Documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm)
