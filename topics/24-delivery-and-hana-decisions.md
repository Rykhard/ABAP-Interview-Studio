# Supporting skills: HANA decisions and source-to-release delivery

Three focused senior code-review decisions complement the main ABAP Cloud track: choose database implementation from semantics and evidence, protect client and authorization boundaries, and distinguish source history from tested runtime delivery. The fixtures are original; target product and release remain required inputs.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## SQLX-01 A CDS table function joins client-dependent purchasing data in SQLScript, writes a helper table, and assumes the outer CDS DCL protects every internal read. Would you approve it?

**Level:** Senior

**Short answer:** No. A CDS table function's AMDP database function must be read-only under its documented rules. I remove the write and check every source and join for correct client handling. Business authorization is a separate check: an outer CDS rule does not automatically protect every internal SQLScript read. I also verify target support and allowed dependencies.

**Reasoning and example:** Two clients contain purchase order 4711. If a SQLScript join matches only the order number, it can combine records from both clients and produce the wrong total or expose data. Filtering the final rows may not undo a total already contaminated by that join. I check client handling in the actual sources and joins, then test overlapping keys.

I separately test users with different purchasing permissions through the real supported read path. SQLScript does not automatically reproduce ABAP SQL or CDS access checks. I also review return types, intended rows and USING dependencies. If supported CDS or ABAP SQL already solves the task, it may be simpler. General AMDP capabilities are broader than this read-only table-function case.

**Avoid this mistake:** The read-only rule here applies to the CDS table function, not every AMDP method. It also does not grant permission to read any SAP table.

**Interviewer follow-ups:**

- How can joining data from two clients produce a wrong total even if final rows are filtered?
- Which tests prove both client separation and the user's purchasing permissions?

**Strong answer criteria:**

- Distinguishes CDS table-function rules from general AMDP capabilities
- Checks client separation and user permissions independently
- Verifies target support, sources and returned results

**Verification evidence:** Activate on the target release and inspect the real read path. Test overlapping keys across clients and users with allowed and denied purchasing access.

**Read and verify this answer:**

- [SAP CDS table functions: SQLScript, read-only and client safety](https://help.sap.com/docs/ABAP_PLATFORM_NEW/67e4075c942e43d4a9f6f891a8dafcf4/ed4c5fc6d3fd43ebb355f12aa1e73757.html) - This source was reviewed for 2025 FPS01. Verify the same feature and rules in your actual target release.
- [SAP ABAP data models and access-control concepts](https://help.sap.com/docs/abap-cloud/abap-data-models/learn) - Explains CDS models and authorization separately. The example tests across clients and user permissions are original study guidance.

<details>
<summary>Visual: HANA pushdown: result grain and table-function review</summary>

![HANA pushdown: result grain and table-function review](../visuals/hana-grain-review.svg)

A two-language text join duplicates both item amounts. Repair the relationship before accepting a performance rewrite, then verify security, client isolation and the chosen implementation contract.

**Explain it:** Why would DISTINCT or dividing by two be an unreliable repair, and what metrics would justify pushdown?

**Limit:** Illustrative data, not a benchmark. Read-only here refers to the cited CDS table-function scenario, not every AMDP method; check target rules and consumption-path security.

</details>

## SQLX-02 A report transfers one million item rows to ABAP to calculate totals. A rewrite uses AMDP but doubles amounts after a text join. Which implementation would you recommend?

**Level:** Senior

**Short answer:** I fix the wrong total before comparing speed. Then I try a supported ABAP SQL or CDS aggregation and use AMDP only if its extra capabilities are needed. The database should filter and total suitable data before sending it to ABAP. I preserve currencies, permissions and correct joins, and measure the full request rather than assume SQLScript is faster.

**Reasoning and example:** Order 4711 has two items: 40 EUR and 60 EUR. Its total should be 100 EUR. If each item joins to two language texts, the joined result has four rows and totals 200 EUR. I fix the relationship or aggregation order according to the required result. DISTINCT or dividing by two merely hides the current symptom.

Only after proving the totals do I compare alternatives using realistic data. I test missing texts, duplicate texts, different currencies and null values. Traces should show database work, transferred rows and end-to-end time. Returning fewer rows can reduce transfer, but it does not by itself prove that the database did less work.

**Avoid this mistake:** Do not hide a wrong join with DISTINCT or a fixed division factor. HANA being available is not a reason by itself to choose AMDP.

**Interviewer follow-ups:**

- Which measurements distinguish too much data transfer from expensive database work?
- How would you test several currencies, missing texts and duplicate texts?

**Strong answer criteria:**

- Proves the totals are correct before accepting faster code
- Uses the simplest supported database calculation that fits
- Measures database work, transferred rows and total time

**Verification evidence:** Use data with known totals and realistic larger datasets. Compare results, duplicated rows, SQL trace records and full request timings.

**Read and verify this answer:**

- [SAP Learning: code pushdown with ABAP SQL and CDS](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/implementing-sql-expressions-in-cds-views_a9962c08-c5df-46a6-ba30-a74acf5c86b2) - Explains SQL/CDS expressions run in the database. The implementation comparison and numeric example are original study guidance.
- [SAP SQL trace analysis](https://help.sap.com/docs/ABAP_PLATFORM_NEW/6d9d967c861d4f78b5b90a4fe9b7d2e7/fcee1d4c512b48c281593c862858e983.html) - Explains how to inspect runtime, accessed records and the database plan. Interpret measurements for the system you actually tested.

<details>
<summary>Visual: HANA pushdown: result grain and table-function review</summary>

![HANA pushdown: result grain and table-function review](../visuals/hana-grain-review.svg)

A two-language text join duplicates both item amounts. Repair the relationship before accepting a performance rewrite, then verify security, client isolation and the chosen implementation contract.

**Explain it:** Why would DISTINCT or dividing by two be an unreliable repair, and what metrics would justify pushdown?

**Limit:** Illustrative data, not a benchmark. Read-only here refers to the cited CDS table-function scenario, not every AMDP method; check target rules and consumption-path security.

</details>

## DELIV-01 A pull request passes local linting and its ABAP sources are pushed with abapGit. The team calls the cloud feature deployed. What evidence and delivery steps are missing?

**Level:** Senior

**Short answer:** Git stores source history, and abapGit transfers supported development objects. Neither proves that the feature is deployed and usable. I choose the delivery route supported by the actual ABAP product, then verify the target version, activation, tests and configuration. A real service check must show that the intended user can work and a denied user cannot.

**Reasoning and example:** A pull request passes local lint, but the target system may still reject an object during activation or lack a required dependency. I link the source revision to the component versions, delivery identifiers and target import evidence. For BTP ABAP environment, supported transport/gCTS or add-on scenarios may apply; other ABAP Cloud products have their own delivery routes.

The target checks include syntax, activation, ATC, meaningful ABAP Unit tests and relevant integration tests. I also verify service access, communication setup and recovery ownership. Local lint is not SAP activation, and mocks do not prove real permissions. Technical identities and secrets stay out of Git. A source export alone is not a complete application deployment.

**Avoid this mistake:** An abapGit push is not a transport release, and gCTS is not another name for abapGit. Delivery routes differ across ABAP Cloud products.

**Interviewer follow-ups:**

- How do you prove the target received the same source revision that was tested?
- Which missing configuration can break an active service after a successful import?

**Strong answer criteria:**

- Separates Git history, source transfer and deployment
- Chooses the delivery route for the actual product
- Requires target-system results and working configuration

**Verification evidence:** Record the commit, component and dependency versions, and delivery IDs. Keep target activation, ATC, test and import logs plus real allowed-user and denied-user service checks.

**Read and verify this answer:**

- [SAP: working with abapGit](https://help.sap.com/docs/btp/sap-business-technology-platform/working-with-abapgit?ai=true) - Explains source transfer, supported object types and activation after import. Transferring source alone does not prove deployment.
- [SAP BTP ABAP environment: delivery via add-on or gCTS](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/delivery-via-add-on-or-gcts?locale=en-US) - Explains these BTP ABAP environment delivery options and checks. Other ABAP Cloud products may use different routes.

<details>
<summary>Visual: Source transfer, delivery and verified runtime evidence</summary>

![Source transfer, delivery and verified runtime evidence](../visuals/delivery-source-runtime-evidence.svg)

Four evidence layers answer different questions. A release links the reviewed and tested revision to an actual imported state, then verifies the target consumer and configuration.

**Explain it:** Which artifact proves what was imported, and what can fail after a successful import?

**Limit:** REV-42, D-17 and TST are fictional identifiers. The table is an evidence checklist, not a mandatory sequence requiring abapGit in every transport landscape.

</details>

## Official references

- [SAP CDS table functions: SQLScript, read-only and client safety](https://help.sap.com/docs/ABAP_PLATFORM_NEW/67e4075c942e43d4a9f6f891a8dafcf4/ed4c5fc6d3fd43ebb355f12aa1e73757.html)
- [SAP ABAP data models and access-control concepts](https://help.sap.com/docs/abap-cloud/abap-data-models/learn)
- [SAP Learning: code pushdown with ABAP SQL and CDS](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/implementing-sql-expressions-in-cds-views_a9962c08-c5df-46a6-ba30-a74acf5c86b2)
- [SAP SQL trace analysis](https://help.sap.com/docs/ABAP_PLATFORM_NEW/6d9d967c861d4f78b5b90a4fe9b7d2e7/fcee1d4c512b48c281593c862858e983.html)
- [SAP: working with abapGit](https://help.sap.com/docs/btp/sap-business-technology-platform/working-with-abapgit?ai=true)
- [SAP BTP ABAP environment: delivery via add-on or gCTS](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/delivery-via-add-on-or-gcts?locale=en-US)
