# ABAP SQL, HANA, and performance

Start with correct result semantics, then measure execution cost. Be ready to explain row multiplication, empty selection drivers, NULL values, and transaction-sensitive buffering before recommending a faster query. HANA-specific techniques and tool availability depend on the target edition and release.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## SQL-01 How do ABAP SQL, Native SQL, CDS, and AMDP differ?

**Level:** Core

**Short answer:** ABAP SQL provides database access integrated with ABAP types and supported platform semantics. CDS defines reusable data models with additional semantics. Native SQL exposes database-specific capabilities with more responsibility on the developer. AMDP manages database procedures through ABAP repository objects, commonly using SQLScript on HANA. I choose the simplest supported option that meets the requirement.

**Example and follow-up:** A filtered aggregate usually needs ABAP SQL or CDS, not a database procedure. A complex HANA-specific operation may justify AMDP after measurement. Release availability, client handling, authorization, and dependency release status must be checked for the chosen path.

**Avoid this mistake:** ABAP syntax around an AMDP method does not turn its SQLScript body into ABAP SQL or automatically apply CDS access control.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.
- [SAP AMDP use and selection guidance](https://help.sap.com/docs/abap-cloud/abap-integration-connectivity/example-amdp-procedure-implementations) - Verify the database access semantics and measure on the target system before choosing an optimization.

## SQL-02 What is the empty-table trap in FOR ALL ENTRIES?

**Level:** Core

**Short answer:** If the driver internal table is empty, FOR ALL ENTRIES can cause the WHERE condition to be ignored and read all rows in scope. I guard the selection with a nonempty check and define the empty-input result explicitly. I also consider duplicate driver values, result duplicate elimination, and whether a join expresses the requirement better.

**Example and follow-up:** For lt_customer_ids, an empty input should usually produce an empty result rather than all customers. Deduplicating repeated driver keys can reduce work. Because duplicate result rows are eliminated, omitting distinguishing columns may collapse records the application intended to keep separate.

**Avoid this mistake:** An empty FAE driver does not mean no rows; a separate filter in the same WHERE clause is not a safe replacement for the guard.

**Read and verify this answer:**

- [SAP FOR ALL ENTRIES selection semantics](https://help.sap.com/saphelp_em900/helpdata/en/fc/eb3a1f358411d1829f0000e829fbfe/content.htm) - Verify the database access semantics and measure on the target system before choosing an optimization.

## SQL-03 When would you use a join instead of FOR ALL ENTRIES?

**Level:** Core

**Short answer:** I favor a join when related database sources and their matching rules can be expressed clearly in one set-based operation. FOR ALL ENTRIES can be useful when driver data already exists in ABAP and the release or access constraints support it. Neither is universally faster; I compare semantics, transferred rows, buffering, and the measured execution plan.

**Example and follow-up:** An order-to-item join naturally returns one row per matching item, while FAE may eliminate duplicates. If the caller needs orders only, EXISTS or a suitable projection may express the requirement more directly. Benchmark realistic volumes, including sparse and skewed keys.

**Avoid this mistake:** Replacing FAE with a join can change duplicates and row counts even when the new query runs faster.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.
- [SAP FOR ALL ENTRIES selection semantics](https://help.sap.com/saphelp_em900/helpdata/en/fc/eb3a1f358411d1829f0000e829fbfe/content.htm) - Verify the database access semantics and measure on the target system before choosing an optimization.

## SQL-04 How can a LEFT OUTER JOIN accidentally behave like an inner join?

**Level:** Advanced

**Short answer:** A left outer join preserves unmatched left rows and supplies NULL for the missing right side. A WHERE condition requiring a right-side value can reject those unmatched rows. If the condition belongs to matching, I put it in ON; if it is intended to filter the final result, WHERE may be correct.

**Example and follow-up:** To list every order with its optional English description, the language condition often belongs in ON. Putting description-language equals English in WHERE can remove orders with no matching description. The intended business result determines placement, not a mechanical rule.

**Avoid this mistake:** Moving conditions between ON and WHERE is not always semantics-preserving for outer joins.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.

<details>
<summary>Visual: SQL join multiplication</summary>

![SQL join multiplication](../visuals/classic-sql-join-grain.svg)

Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.

**Explain it:** What is one row of this result supposed to represent? Where should a language filter go for optional text?

**Limit:** This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.

</details>

## SQL-05 What is the difference between SQL NULL and an ABAP initial value?

**Level:** Advanced

**Short answer:** NULL represents missing or unknown SQL information; an ABAP initial value is a defined value for its type. SQL predicates use three-valued logic, so comparison to NULL does not behave like comparison to zero or an empty string. I use IS NULL, COALESCE, or supported null indicators when the distinction matters.

**Example and follow-up:** After an outer join, a missing amount and a real zero amount are different business facts. Plain transfer into an ABAP field can make both appear initial unless the query or result handling preserves the distinction deliberately.

**Avoid this mistake:** COALESCE replaces NULL, not every initial or blank value, and WHERE column = NULL is not a correct null test.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.

## SQL-06 How do GROUP BY, WHERE, and HAVING work together?

**Level:** Core

**Short answer:** WHERE selects input rows before grouping. GROUP BY defines the groups, and aggregate expressions calculate a result per group. HAVING filters those groups using group-level conditions. I push suitable filtering and aggregation to the database while preserving currency, unit, and join semantics, rather than moving a large raw dataset to ABAP unnecessarily.

**Example and follow-up:** For sales totals by company and currency, first restrict the posting period, group by company and currency, then apply a threshold to each total. Joining items to several partners before summing may multiply each item amount and produce an inflated total.

**Avoid this mistake:** Database aggregation is not automatically correct if different currencies are mixed or joins multiply the rows being aggregated.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.

<details>
<summary>Visual: SQL join multiplication</summary>

![SQL join multiplication](../visuals/classic-sql-join-grain.svg)

Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.

**Explain it:** What is one row of this result supposed to represent? Where should a language filter go for optional text?

**Limit:** This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.

</details>

## SQL-07 What do cardinality and uniqueness mean for join correctness?

**Level:** Advanced

**Short answer:** Cardinality describes how many matching rows a relationship can produce. The complete join condition and actual data determine the result. Incorrect to-one assumptions can hide multiplication or mislead optimization. I verify keys and optionality and test missing and multiple matches. A declared CDS key or association cardinality alone does not repair inconsistent data.

**Example and follow-up:** Joining a document only by its number can be wrong if company code or year also belongs to its identity. Language-dependent text and time-dependent validity records are common sources of unexpected extra rows. Test those dimensions explicitly.

**Avoid this mistake:** DISTINCT can conceal an incomplete join condition while leaving aggregates or selected attributes logically wrong.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.

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

**Short answer:** SELECT SINGLE is suitable when the conditions identify the required single record or any matching record is genuinely sufficient. Without unique conditions it does not define a business ordering. If I need the latest or highest-priority record, I use a supported limited selection with an explicit deterministic ORDER BY and a tie-breaker.

**Example and follow-up:** For the latest status, order by the event timestamp and a unique sequence identifier before limiting to one row. A query without ordering may return a different matching row after an index, plan, or data distribution changes.

**Avoid this mistake:** The primary key definition or a convenient current execution plan is not an implicit ORDER BY guarantee.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.

## SQL-09 What do you optimize first in a slow data selection?

**Level:** Core

**Short answer:** I first establish the correct result and a reproducible baseline. Then I inspect unnecessary rows and columns, repeated calls, missing filters, costly joins, and excessive round trips. I prefer reducing work at the data source before micro-optimizing ABAP expressions. Each change is measured with representative data and checked for unchanged business semantics.

**Example and follow-up:** A loop issuing one SELECT for each of thousands of items may spend time on repeated database calls. A set-based fetch can help, but it must preserve authorization and transaction consistency. Fetching every column or an unbounded result can dominate memory and transfer cost.

**Avoid this mistake:** A query that is fast on ten development rows may be unsuitable for millions of production rows or a different key distribution.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.
- [SAP HANA secondary indexes](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-performance-guide-for-developers/3441acf7dcf64e169ba94121acaf2350.html) - Verify the database access semantics and measure on the target system before choosing an optimization.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## SQL-10 How do ST05, SAT, SQL Monitor, and database plans complement each other?

**Level:** Advanced

**Short answer:** ST05 helps inspect traced database access for a scoped execution. SAT shows ABAP runtime distribution and call behavior. SQL Monitor helps find important SQL across a broader workload. A database execution plan explains how the database processes a statement. I select the tool according to whether the bottleneck is database work, ABAP processing, or call volume.

**Example and follow-up:** For a slow report, identify the expensive processing segment, trace a representative run, and compare executions, rows, and time. In cloud editions the available tools and permissions differ; use the supported ADT or monitoring equivalent for that environment.

**Avoid this mistake:** The slowest individual SQL statement may not be the largest total cost if another cheap statement is executed thousands of times.

**Read and verify this answer:**

- [SAP analyzing SQL statements in ADT](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/analyzing-sql-statements) - Cloud-tool reference for SQL investigation; classic ST05/SAT access depends on the target landscape.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## SQL-11 Does SAP HANA remove the need for indexes and performance tuning?

**Level:** Advanced

**Short answer:** No. HANA's column storage, compression, and execution engine change the tradeoffs, but large scans, poor selectivity, row multiplication, and expensive intermediate results still matter. Secondary indexes can help specific access patterns and also consume memory and maintenance effort. I evaluate the actual table organization, workload, and execution evidence before proposing an index.

**Example and follow-up:** A selective lookup repeatedly filtering the same attribute combination may benefit from a supported secondary index. That is different from assuming a SQL Server-style clustered index controls physical row ordering. HANA column-store index structures have their own documented behavior.

**Avoid this mistake:** Do not say HANA needs no indexes or that every primary key is a clustered index with a predictable physical row order.

**Read and verify this answer:**

- [SAP HANA secondary indexes](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-performance-guide-for-developers/3441acf7dcf64e169ba94121acaf2350.html) - Verify the database access semantics and measure on the target system before choosing an optimization.

<details>
<summary>Visual: Performance diagnosis</summary>

![Performance diagnosis](../visuals/classic-performance-instruments.svg)

Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.

**Explain it:** Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?

**Limit:** No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.

</details>

## SQL-12 When is table buffering appropriate?

**Level:** Advanced

**Short answer:** Buffering can benefit small, relatively stable data read frequently through access patterns supported by the ABAP table buffer. It is usually unsuitable for highly volatile transactional data or requirements needing immediate cross-instance freshness. I check the table's buffering configuration and statement behavior, because some query forms bypass the buffer and buffering changes consistency tradeoffs.

**Example and follow-up:** A small customizing table may be a candidate after checking change frequency and access. An order status updated continuously is different. The ABAP table buffer is separate from HANA caches and internal tables held by an individual application session.

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

**Short answer:** Normalization organizes relational data around dependencies to reduce update, insert, and delete anomalies. First normal form avoids repeating groups; second removes partial dependency on a candidate key; third addresses unsuitable transitive dependencies of non-key attributes. Denormalization deliberately duplicates or precomputes data for a measured need and requires an explicit consistency strategy.

**Example and follow-up:** Keeping a customer's current address on every order row creates update problems if those copies are intended to remain synchronized. An immutable address snapshot on a historical invoice can instead be a deliberate business requirement. Clarify the semantics before calling duplication a defect.

**Avoid this mistake:** NoSQL is not automatically faster or better for large data, and normalization is not a rule against all intentionally stored business snapshots.

**Read and verify this answer:**

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Verify the database access semantics and measure on the target system before choosing an optimization.

## SQL-14 When is AMDP justified, and what risks must you address?

**Level:** Advanced

**Short answer:** I consider AMDP when supported ABAP SQL or CDS cannot express a necessary database-specific operation well, or measurement shows that keeping a substantial calculation on HANA avoids repeated large transfers. I account for SQLScript skills, testability, dependencies, client and authorization handling, and the release's restrictions. Database pushdown must preserve business correctness, not just reduce ABAP code.

**Example and follow-up:** A complex analytical calculation may justify an AMDP or CDS table function after simpler options are evaluated. A plain filtered SELECT normally does not. Database logic must not assume that selecting underlying tables automatically enforces the DCL of a CDS entity.

**Avoid this mistake:** AMDP is not a universal performance upgrade, and an AMDP method should not introduce an independent commit into an application transaction.

**Read and verify this answer:**

- [SAP AMDP use and selection guidance](https://help.sap.com/docs/abap-cloud/abap-integration-connectivity/example-amdp-procedure-implementations) - Verify the database access semantics and measure on the target system before choosing an optimization.

## Official references

- [SAP ABAP SQL examples and semantics](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)
- [SAP FOR ALL ENTRIES selection semantics](https://help.sap.com/saphelp_em900/helpdata/en/fc/eb3a1f358411d1829f0000e829fbfe/content.htm)
- [SAP HANA secondary indexes](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-performance-guide-for-developers/3441acf7dcf64e169ba94121acaf2350.html)
- [SAP AMDP use and selection guidance](https://help.sap.com/docs/abap-cloud/abap-integration-connectivity/example-amdp-procedure-implementations)
- [SAP analyzing SQL statements in ADT](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/analyzing-sql-statements)
