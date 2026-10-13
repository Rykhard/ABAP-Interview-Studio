# ABAP SQL, HANA, and performance

Start with correct result semantics, then measure execution cost. Be ready to explain row multiplication, empty selection drivers, NULL values, and transaction-sensitive buffering before recommending a faster query. HANA-specific techniques and tool availability depend on the target edition and release.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## SQL-01 How do ABAP SQL, Native SQL, CDS, and AMDP differ?

**Level:** Core

**Short answer:** ABAP SQL is the usual way to read and change database data from ABAP. CDS defines reusable data models and queries. Native SQL uses database-specific SQL, so the developer must handle more details. AMDP manages HANA database procedures and functions written in SQLScript through ABAP classes. I start with the simplest supported option and check client, authorization and release rules.

**Reasoning and example:** A report needs totals for one company and month. ABAP SQL may express the whole selection and sum clearly. CDS becomes useful when the same data model should be reused by several consumers. Neither requirement automatically needs a database procedure.

If a necessary calculation cannot be expressed well in supported ABAP SQL or CDS, I consider AMDP and measure the result. I also check which dependencies are allowed in the target environment. Writing SQLScript inside an ABAP-managed method does not turn it into ABAP SQL. In particular, direct table reads must not be assumed to apply the access control of a CDS entity that would otherwise protect those records.

ADBC is an ABAP API for Native SQL, useful when a permitted database-specific operation cannot be expressed through ABAP SQL. It does not add ABAP SQL client handling: a client-dependent table needs the correct explicit client restriction. Bind data values, allowlist any configurable identifiers, and perform the required authorization checks. Native SQL also does not inherit a CDS entity's DCL just because it reads the same tables. ABAP Cloud requires the language and released APIs allowed in the target environment.

**Avoid this mistake:** ABAP syntax around an AMDP method does not turn its SQLScript body into ABAP SQL or automatically apply CDS access control.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.
- [SAP AMDP use and selection guidance](https://help.sap.com/docs/abap-cloud/abap-integration-connectivity/example-amdp-procedure-implementations) - Check what the query returns and measure it in the target system before choosing a performance change.
- [SAP: client handling guidelines](https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENCLIENT_HANDLING_GUIDL.html) - Native SQL requires explicit client handling; database access and business authorization are separate concerns.

## SQL-02 What is the empty-table trap in FOR ALL ENTRIES?

**Level:** Core

**Short answer:** An empty FOR ALL ENTRIES driver is dangerous: the WHERE condition is ignored, so the query can read all rows in scope. I check that the driver is not empty before selecting. I also decide how duplicates should be handled. FOR ALL ENTRIES removes duplicate result rows, which can matter when selected columns do not uniquely identify records.

**Reasoning and example:** A report receives a list of customer IDs and should read their orders. If the list is empty, I normally return an empty result without running the selection. Adding another condition in the same WHERE clause is not a replacement for that guard: the empty-driver rule still applies.

I can remove repeated driver keys to reduce unnecessary work, but I separately check the output. Two different orders may have the same selected customer and amount. If I omit the order identity, result duplicate elimination can collapse those rows. I test empty input, repeated IDs and distinct records with equal displayed values before deciding the query is correct.

**Avoid this mistake:** An empty FAE driver does not mean no rows; a separate filter in the same WHERE clause is not a safe replacement for the guard.

**Read and verify this answer:**

- [SAP FOR ALL ENTRIES selection semantics](https://help.sap.com/saphelp_em900/helpdata/en/fc/eb3a1f358411d1829f0000e829fbfe/content.htm) - Check what the query returns and measure it in the target system before choosing a performance change.

## SQL-03 When would you use a join instead of FOR ALL ENTRIES?

**Level:** Core

**Short answer:** A join is useful when related database rows can be selected together with clear matching rules. FOR ALL ENTRIES can fit when the driver data already exists in ABAP. Neither is always faster. They can return different duplicates and row counts, so I check the required result first. Then I compare database work, transferred data and performance with realistic inputs.

**Reasoning and example:** An order-to-item join produces a row for each matching item. That is useful when the report needs the item details, but it repeats order fields. If the report only needs orders that have an item meeting a condition, an EXISTS selection may describe the requirement more clearly than joining and removing duplicates afterward.

FOR ALL ENTRIES also has its own duplicate elimination and empty-driver behavior. Replacing it with a join requires tests for those differences, not just a runtime comparison. I include large customers, customers with no matching items and repeated driver values. A faster statement is only an improvement if it still produces the business result the caller expects.

**Avoid this mistake:** Replacing FAE with a join can change duplicates and row counts even when the new query runs faster.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.
- [SAP FOR ALL ENTRIES selection semantics](https://help.sap.com/saphelp_em900/helpdata/en/fc/eb3a1f358411d1829f0000e829fbfe/content.htm) - Check what the query returns and measure it in the target system before choosing a performance change.

## SQL-04 How can a LEFT OUTER JOIN accidentally behave like an inner join?

**Level:** Advanced

**Short answer:** A LEFT OUTER JOIN keeps left-side rows even when no right-side row matches. The missing right side contains SQL NULL values. A WHERE condition demanding a right-side value can remove those rows again. I put a condition in ON when it defines which right rows may match. I use WHERE when I really want to filter the final result.

**Reasoning and example:** The report must show every order, with an English description where available. I join the description using the order key and language condition in ON. An order without English text remains in the list, with no matching description. The user can still see that the order exists.

If I put the right-side language condition in WHERE instead, the unmatched row does not meet it and disappears. The report now hides some orders, even though the SQL still says LEFT OUTER JOIN. I test an order with English text, one with only another language and one with no text. That makes the intended behavior visible before tuning the query.

**Avoid this mistake:** Moving conditions between ON and WHERE is not always semantics-preserving for outer joins.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.

<details>
<summary>Visual: SQL join multiplication</summary>

![SQL join multiplication](../visuals/classic-sql-join-grain.svg)

Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.

**Explain it:** What is one row of this result supposed to represent? Where should a language filter go for optional text?

**Limit:** This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.

</details>

## SQL-05 What is the difference between SQL NULL and an ABAP initial value?

**Level:** Advanced

**Short answer:** SQL NULL means a value is missing or unknown. An ABAP initial value is a real value, such as zero or blank. Comparing something with NULL does not behave like comparing it with zero. I use IS NULL to check for NULL and COALESCE when a replacement is intended. Supported null indicators can preserve the distinction when reading into ABAP.

**Reasoning and example:** A left outer join reads orders and optional payments. One order has a payment of zero; another has no payment row. Those are different facts, but a plain transfer into an ABAP amount field can make both look like zero. I preserve the missing-row information if the report needs to distinguish them.

For example, I can include a suitable existence indicator or use supported null handling rather than guessing from the amount. COALESCE replaces NULL with a chosen value, but that deliberately loses the distinction unless I keep it elsewhere. It does not replace an ordinary stored zero or blank. I test both cases so missing data is not shown as a confirmed amount.

**Avoid this mistake:** COALESCE replaces NULL, not every initial or blank value, and WHERE column = NULL is not a correct null test.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.

## SQL-06 How do GROUP BY, WHERE, and HAVING work together?

**Level:** Core

**Short answer:** WHERE filters the rows before grouping. GROUP BY collects rows with the same chosen fields, and functions such as SUM calculate a result for each group. HAVING filters the resulting groups. I let the database do this work when it is appropriate. I still check currencies and joins, because a fast sum can be wrong if it adds incompatible or repeated amounts.

**Reasoning and example:** To show monthly sales totals above a threshold, I first use WHERE to select the month. I group by company and currency so euros and dollars remain separate. SUM calculates each total, and HAVING keeps only groups above the required threshold. The application receives a small result instead of every sales row.

Before trusting it, I check any join added to the query. If one sales item matches three partner rows, its amount may be counted three times. A small fixture with one known item and several partners reveals that error. The right fix is to model the required rows correctly, not simply to accept the database total because aggregation ran successfully.

**Avoid this mistake:** Database aggregation is not automatically correct if different currencies are mixed or joins multiply the rows being aggregated.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.

<details>
<summary>Visual: SQL join multiplication</summary>

![SQL join multiplication](../visuals/classic-sql-join-grain.svg)

Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.

**Explain it:** What is one row of this result supposed to represent? Where should a language filter go for optional text?

**Limit:** This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.

</details>

## SQL-07 What do cardinality and uniqueness mean for join correctness?

**Level:** Advanced

**Short answer:** Cardinality describes how many matches a relationship can have: none, one or many. The actual join fields and data decide which rows are returned. Missing key fields can multiply rows or join unrelated records. I check the complete identity and test missing and multiple matches. A CDS key or a to-one declaration does not repair incorrect data or matching logic.

**Reasoning and example:** A document number may be unique only together with company code and year. Joining by number alone can connect an item to a different document with the same number. Text tables introduce another common issue: one record can have several languages, so omitting language can multiply the result.

I prepare test data with the same number in different years and with several text languages. Then I compare the returned rows with the intended matches. DISTINCT may hide duplicated output rows, but it does not correct a wrong selected description or an inflated sum. I fix the join condition and only declare cardinality that the model and data actually support.

**Avoid this mistake:** DISTINCT can conceal an incomplete join condition while leaving aggregates or selected attributes logically wrong.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.

<details>
<summary>Visual: SQL join multiplication</summary>

![SQL join multiplication](../visuals/classic-sql-join-grain.svg)

Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.

**Explain it:** What is one row of this result supposed to represent? Where should a language filter go for optional text?

**Limit:** This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.

</details>

<details>
<summary>Visual: CDS links and ownership</summary>

![CDS links and ownership](../visuals/cds-relationships.svg)

Items belong to the order BO; a partner reference crosses to an independently managed object.

**Explain it:** What breaks if a declared to-one relationship actually returns two partners?

**Limit:** Composition semantics and generated operations still require the corresponding RAP model.

</details>

## SQL-08 Does SELECT SINGLE return a predictable first row?

**Level:** Core

**Short answer:** SELECT SINGLE does not mean the latest, smallest or first business record. It is suitable when the conditions identify one required row, or when any match is acceptable. If several rows match and their order matters, I use a supported limited query with ORDER BY. I include a unique tie-breaker so equal sort values still give a predictable result.

**Reasoning and example:** A status table contains several events for one order. Reading one matching row without ordering can return an old event. If I need the latest status, I sort by event time and a unique sequence or ID, then limit the result to one row using supported syntax.

The unique extra sort field matters when two events have the same timestamp. Without it, either tied row may be chosen. I test those equal timestamps and an order with no events. I do not rely on the row that happened to be returned in development: a changed index, execution plan or data distribution can change that result without any change to the ABAP statement.

**Avoid this mistake:** The primary key definition or a convenient current execution plan is not an implicit ORDER BY guarantee.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.

## SQL-09 What do you optimize first in a slow data selection?

**Level:** Core

**Short answer:** I first confirm the correct result and measure a repeatable slow case. Then I look for too many rows, unnecessary columns, repeated queries and joins that create extra work. Reducing database calls and data transfer often helps more than changing ABAP syntax. I measure each change with realistic data and verify that permissions and business results stay correct.

**Reasoning and example:** A report loops over thousands of items and issues one SELECT for each item. Even a fast individual query can become expensive when called thousands of times. Reading the required data together can reduce those round trips, provided the new query preserves the intended matching and authorization rules.

I compare total runtime, number of calls and transferred rows before and after the change. I also test missing records and a large customer whose data is much less evenly distributed than the development sample. Selecting every column or returning an unlimited result can still waste memory after the repeated calls are removed. The goal is less necessary work, supported by measurements.

There is no universal sequence such as indexes first, then CDS, then AMDP. Start with the measured bottleneck: ABAP work, database work, transfer, locks or a remote dependency. Choose a change that removes that cost and preserves behavior. Pushdown is useful when appropriate set processing belongs near the data, not merely because the target database is HANA.

**Avoid this mistake:** A query that is fast on ten development rows may be unsuitable for millions of production rows or a different key distribution.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.
- [SAP HANA secondary indexes](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-performance-guide-for-developers/3441acf7dcf64e169ba94121acaf2350.html) - Check what the query returns and measure it in the target system before choosing a performance change.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## SQL-10 Which tools help locate ABAP, database, and memory performance problems?

**Level:** Advanced

**Short answer:** Start with the slow business request and locate where its time or memory goes. Where available, ST03N/STAD help identify costly workloads or requests, SAT traces ABAP execution, and ST05 traces SQL. ST12 combines relevant traces. SQL Monitor helps prioritize SQL across a wider workload; a database plan explains one statement. Memory analysis needs its own evidence.

**Reasoning and example:** A report is slow, but the longest individual SQL statement may not dominate total time. Use workload/request statistics to choose a representative case, then trace it. Compare call count, transferred rows and total time: a short statement called thousands of times may be the real problem. SQLM can collect a broader SQL profile; SWLT can combine runtime evidence and static findings where supported. Its low monitoring overhead is not zero or a guarantee for every workload: scope collection and permissions appropriately.

For a memory dump, inspect ST22 and compare Memory Inspector snapshots at comparable phases. Look for growing internal tables, retained copies and objects. A database execution plan instead helps explain scans, joins, sorts and large database intermediates. Change one measured bottleneck, then verify the same result, runtime and peak memory again.

Tool access depends on the deployment. Do not promise classic transactions in every ABAP Cloud environment. Use supported ADT profiling/SQL analysis and the available monitoring apps. In SAP BTP ABAP environment, administrator SQL tracing can be started through Capture Request Statistics; detailed trace evaluation uses the Technical Monitoring Cockpit. The exact role, release and tool entry point must be checked.

**Avoid this mistake:** The slowest individual SQL statement may not be the largest total cost if another cheap statement is executed thousands of times.

**Read and verify this answer:**

- [SAP analyzing SQL statements in ADT](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/analyzing-sql-statements) - Cloud-tool reference for SQL investigation; classic ST05/SAT access depends on the target landscape.
- [SAP BTP ABAP environment: tracing SQL activities](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/tracing-sql-activities-for-administrators) - Cloud tool entry points and administrator role requirements.
- [SAP SQL Monitor](https://help.sap.com/docs/SAP_NETWEAVER_740/a24970c68fcf4770a64bf9a78e3719e2/f1be2e59f44d448180703d6a497ec1e2.html) - Understand workload collection and monitoring overhead.
- [SAP Memory Inspector concepts](https://help.sap.com/docs/ABAP_PLATFORM_NEW/ba879a6e2ea04d9bb94c7ccd7cdac446/8884fb5269d34838a1f119b41dcdbc57.html) - Snapshots describe retained memory of the ABAP internal session.
- [SAP analysis tools overview](https://help.sap.com/docs/SUPPORT_CONTENT/srm/3362937177.html?locale=en-US&q=SLG1&state=PRODUCTION&version=1.0) - Classic tools apply only where available and authorized.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## SQL-11 Does SAP HANA remove the need for indexes and performance tuning?

**Level:** Advanced

**Short answer:** HANA still needs performance analysis. Its storage and processing are fast, but a query can still read too much data or create huge intermediate results. A secondary index may help a particular lookup, while costing memory and extra update work. I decide from the actual table, workload and execution plan. I do not add indexes just because another database used them.

**Reasoning and example:** A service repeatedly finds a tiny number of records using the same combination of attributes. I inspect how HANA executes that selection and whether a supported secondary index could help. I compare the lookup gain with memory use and the effect on inserts and updates, because the workload includes writes too.

For a query that legitimately reads much of a column, the same index may offer little benefit. I also avoid describing every primary key as a SQL Server-style clustered index that defines physical row order. HANA has its own storage and index structures. Query correctness and explicit ORDER BY remain necessary regardless of which access path the optimizer selects.

**Avoid this mistake:** Do not say HANA needs no indexes or that every primary key is a clustered index with a predictable physical row order.

**Read and verify this answer:**

- [SAP HANA secondary indexes](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-performance-guide-for-developers/3441acf7dcf64e169ba94121acaf2350.html) - Check what the query returns and measure it in the target system before choosing a performance change.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## SQL-12 When is table buffering appropriate?

**Level:** Advanced

**Short answer:** The ABAP table buffer can help with small, rarely changing tables that are read often in supported ways. It is a poor default for constantly changing business data or reads that need immediate freshness across servers. I check the table setting and the actual SQL form, because some statements bypass the buffer. This buffer is separate from HANA caches and internal tables.

**Reasoning and example:** A small customizing table is read for nearly every document, while its values change only occasionally. Buffering may reduce repeated database access if the table and its reads qualify. I inspect both the configuration and the query forms instead of assuming the buffered setting benefits every SELECT.

An order status that changes continuously has different needs. A buffered value on another application server may not immediately reflect a change, so it may be unsuitable for a decision requiring the latest state. I test the expected consistency and workload before choosing buffering. An internal table used by one ABAP session is another mechanism again; it does not provide shared buffer synchronization.

**Avoid this mistake:** Buffering is not universally faster, and reading buffered data does not guarantee immediate visibility of every change across application servers.

**Read and verify this answer:**

- [SAP table buffering and synchronization](https://help.sap.com/saphelp_gbt10/helpdata/EN/44/ed4afdc85b67d6e10000000a155369/content.htm?no_cache=true) - Explains application-server buffers, loading and synchronization. Check target-release buffering eligibility and statement behavior.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## SQL-13 What are normalization and denormalization, and how do they affect ABAP design?

**Level:** Core

**Short answer:** Normalization stores facts where they belong so one change does not require repairing many copies. First normal form avoids repeating groups; second removes dependence on only part of a candidate key; third removes unsuitable indirect dependencies between non-key facts. Denormalization deliberately stores extra copies or calculated results. I use it for a clear need and define how those copies stay correct.

**Reasoning and example:** If a customer current address is copied onto every order and all copies are meant to stay current, an address change becomes difficult: some rows may be missed. Keeping that current fact with the customer avoids the repeated update. The order can refer to the customer when it needs the latest address.

An issued invoice may instead need the address exactly as it was when issued. Keeping that historical snapshot is an intentional business rule, not automatically a design error. I clarify which meaning is required before removing duplication. Similarly, a stored total may improve a measured read problem, but it needs a clear update rule so the total cannot silently become stale.

**Avoid this mistake:** NoSQL is not automatically faster or better for large data, and normalization is not a rule against all intentionally stored business snapshots.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Check what the query returns and measure it in the target system before choosing a performance change.

## SQL-14 When is AMDP justified, and what risks must you address?

**Level:** Advanced

**Short answer:** I consider AMDP when a required HANA operation is difficult to express with supported ABAP SQL or CDS, or measurements justify keeping a large calculation in the database. I check release support, dependencies, client handling and authorization. The team also needs SQLScript skills and suitable tests. AMDP should solve a real problem, not be a default replacement for a simple SELECT.

**Reasoning and example:** A complex analytical calculation repeatedly transfers a large dataset to ABAP and back. After trying simpler supported SQL and CDS options, I may compare an AMDP implementation that keeps the calculation on HANA. I measure the full operation and compare the actual result, including empty data and unusual values.

I also inspect access rules. Reading an underlying table inside database logic does not automatically enforce the DCL attached to a CDS entity used elsewhere. Transaction ownership still matters: the procedure must not introduce an independent commit into the application operation. A short filtered selection normally gains little from an extra SQLScript layer and may become harder to maintain.

In ABAP for Cloud Development, AMDP procedures must be read-only and client-safe, with permitted dependencies. Standard ABAP has broader procedure options. CDS table functions remain read-only. Check the exact language version and release before reusing an example; AMDP does not allow its own COMMIT or ROLLBACK.

**Avoid this mistake:** AMDP is not a universal performance upgrade, and an AMDP method should not introduce an independent commit into an application transaction.

**Read and verify this answer:**

- [SAP AMDP use and selection guidance](https://help.sap.com/docs/abap-cloud/abap-integration-connectivity/example-amdp-procedure-implementations) - Check what the query returns and measure it in the target system before choosing a performance change.
- [SAP: AMDP language versions and restrictions](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/12_AMDP.md) - Distinguish Standard ABAP from ABAP for Cloud Development.

## SQL-15 AMDP procedure or CDS table function: what is the difference, and when would you use each?

**Level:** Advanced

**Short answer:** An AMDP procedure runs SQLScript on HANA and is called from ABAP as a method with input and output parameters. A CDS table function exposes a table-shaped result that ABAP SQL and other CDS entities can read. Its implementation is an AMDP database function. Choose a procedure for an operation your ABAP code calls; choose a CDS table function when a calculation must be a reusable query source. Try supported ABAP SQL or CDS first.

**Reasoning and example:** For example, an ABAP report passes rows to a multi-stage allocation calculation and receives the calculated rows back. A procedure can fit that calling style. If several CDS consumers need the calculated rows in further joins or filters, a CDS table function may fit better. These are design examples, not proof that SQLScript is faster; first check whether the target release already supports the calculation in ordinary SQL or CDS.

The declarations differ. A procedure uses IMPORTING/EXPORTING or CHANGING parameters passed by VALUE; it has no RETURNING parameter. A CDS table function declares its parameters and result columns in DEFINE TABLE FUNCTION. A public static method declared FOR TABLE FUNCTION implements that contract with BY DATABASE FUNCTION and OPTIONS READ-ONLY. Read the CDS entity with SELECT; do not call its implementation as an ordinary ABAP method. An AMDP table function intended only for other AMDP methods is another variant and is not directly callable from ABAP.

A CDS table function cannot write a helper table. ABAP for Cloud Development also restricts AMDP procedures to read-only, client-safe access and permitted dependencies. Standard ABAP allows broader procedure capabilities, but not an independent COMMIT inside AMDP. Check client handling, authorization, numeric types and empty results explicitly. The small code examples show the different contracts using a trivial calculation; that calculation itself does not require AMDP.

READ-ONLY is not a third kind of AMDP; it restricts database changes. In Code, switch between three parts: a procedure with its ABAP call, the CDS table-function definition, and its implementation with a SELECT consumer. The procedure adds 40 and 60 to produce 100; the table function filters rows by an amount threshold.

**Avoid this mistake:** AMDP is the framework, not a synonym for procedure. Not every AMDP function is a CDS table function, and read-only code is not automatically authorized or client-safe.

**Read and verify this answer:**

- [SAP: AMDP procedures, functions and ABAP Cloud restrictions](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/12_AMDP.md) - Compare procedure parameters, table-function variants and client-safety requirements for the target release.
- [SAP: CDS table functions](https://help.sap.com/docs/ABAP_PLATFORM_NEW/67e4075c942e43d4a9f6f891a8dafcf4/ed4c5fc6d3fd43ebb355f12aa1e73757.html) - The CDS contract defines the returned columns; the AMDP database function implements the query.

## SQL-16 What do window functions do in ABAP SQL, and when are they useful?

**Level:** Core

**Short answer:** A window function calculates a value across related result rows while keeping each detail row. Use it for a customer total beside each sale, a running total, or a rank. GROUP BY instead combines rows into one result per group. OVER defines the window; PARTITION BY separates groups, window ORDER BY orders calculations, and a frame selects which rows contribute.

**Reasoning and example:** Customer A has three sales with quantities 100, 100 and 50. SUM( quantity ) OVER( PARTITION BY customer_id ) adds 250 beside each of the three rows. GROUP BY customer_id with SUM returns just one row for A. A running ROWS frame ordered by the unique sale ID instead produces 100, 200, 250. Its final value matches the partition total, but the earlier values answer a different question.

For descending quantity, RANK gives 1, 1, 3 and DENSE_RANK gives 1, 1, 2. ROW_NUMBER gives a separate position to each row; add sale_id as a tie-breaker if that position must be repeatable. Do not add this unique tie-breaker to RANK when equal quantities should share a rank. The final SELECT ORDER BY controls displayed row order separately from the window ORDER BY.

WHERE filters the input before the window calculation. To rank first and then keep only selected ranks, use a supported outer query or CTE instead of expecting a window alias to be available in the same WHERE. Check the ABAP release and permitted data source; ABAP SQL support does not prove that the same syntax is available in an ABAP CDS definition. A window can avoid extra ABAP aggregation loops, but it still needs measured database cost, especially for sorting and large partitions.

**Avoid this mistake:** Do not replace GROUP BY with a window without checking the required row count, and do not leave tie ordering or a running-total frame implicit.

**Read and verify this answer:**

- [SAP ABAP SQL: window expressions and worked examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md#window-expressions) - ABAP SQL syntax; check the supported functions and additions in your target release.
- [SAP ABAP Keyword Documentation: window functions](https://help.sap.com/docs/abap-cloud/abap-keyword/window-function) - Use the ABAP SQL documentation, not a HANA SQLScript syntax assumption.

## SQL-17 A large report still runs out of memory with PACKAGE SIZE. What do you check?

**Level:** Advanced

**Short answer:** PACKAGE SIZE limits rows delivered to the target table per iteration; it does not guarantee bounded total memory. Check whether the program appends every package elsewhere, retains copies or references, or builds a large final result. With FOR ALL ENTRIES, the result can first be materialized in an internal system table, so small packages are not a reliable memory guard.

**Reasoning and example:** Suppose the report reads 1,000 rows per package but appends each package to lt_all. After a million source rows, lt_all still contains a million rows. Instead, process the current package and keep only the output actually needed: a bounded aggregate, streamed output, or an explicitly designed persisted result. A growing output table, cache, log or deep object graph can defeat an otherwise small package.

Start from the dump or failing phase: use ST22 where available, then compare memory snapshots before and after representative processing steps. Find which internal tables or retained objects grow. Distinguish ABAP session memory from expensive database intermediates; a database plan and an ABAP memory snapshot answer different questions. Select fewer columns and rows, avoid retained duplicates, then measure peak memory and runtime on realistic volumes.

Use INTO TABLE for the current package; APPENDING TABLE keeps adding rows. Do not COMMIT while a SELECT loop still needs its open cursor. If processing needs commits between chunks, design separate restartable reads with a stable continuation key and explicit consistency/transaction rules. Simply adding PACKAGE SIZE is not that design. FOR ALL ENTRIES requires particular care because packaging its target can happen after the full matching result is collected internally.

**Avoid this mistake:** A small package count is not proof of small peak memory. Inspect retained data, database work and the selection variant.

**Read and verify this answer:**

- [SAP ABAP SQL: SELECT INTO and PACKAGE SIZE](https://help.sap.com/docs/abap-cloud/abap-keyword/select-into-appending) - Read the PACKAGE SIZE restrictions, including FOR ALL ENTRIES and INTO versus APPENDING.
- [SAP Memory Inspector: compare memory snapshots](https://help.sap.com/docs/ABAP_PLATFORM_NEW/ba879a6e2ea04d9bb94c7ccd7cdac446/49255f4629ac16b7e10000000a42189d.html?version=latest) - Inspect retained ABAP memory in comparable program phases; tool availability depends on the environment.
- [SAP ABAP COMMIT WORK and open cursors](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcommit.htm?file=abapcommit.htm%2F1000) - COMMIT WORK closes database cursors; a later fetch from that cursor can fail.

## Official references

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)
- [SAP FOR ALL ENTRIES selection semantics](https://help.sap.com/saphelp_em900/helpdata/en/fc/eb3a1f358411d1829f0000e829fbfe/content.htm)
- [SAP HANA secondary indexes](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-performance-guide-for-developers/3441acf7dcf64e169ba94121acaf2350.html)
- [SAP AMDP use and selection guidance](https://help.sap.com/docs/abap-cloud/abap-integration-connectivity/example-amdp-procedure-implementations)
- [SAP analyzing SQL statements in ADT](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/analyzing-sql-statements)
