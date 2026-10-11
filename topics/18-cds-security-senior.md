# Senior CDS, query contracts and security

Diagnose data leaks, identity defects and query errors through the actual consumer boundary. Preserve business semantics, authorization and supported contracts when redesigning the model.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## MODEL-01 A new consumption entity exposes orders outside the user's sales organization. The base CDS has DCL. What do you investigate?

**Level:** Senior

**Short answer:** Trace the actual read entry point and its access control, including associations and alternative services. A protected base entity does not automatically confer equivalent protection on every higher entity. Define or inherit the intended restrictions through supported DCL constructs and mappings for the consumed entity. Keep operation authorization separate. The fix must preserve both authorized records and deliberate exceptions, rather than hiding the problem with a UI filter.

**Example and follow-up:** Create two organizations with otherwise identical orders and use a restricted identity. Compare direct base consumption, the exposed projection and association navigation. Include count and value help: leaking a key or aggregate is still a data disclosure even when the main list looks correct.

**Avoid this mistake:** Do not add #CHECK and assume it creates a missing rule.

**Interviewer follow-ups:**

- Which entry point actually evaluated DCL?
- How would a field rename affect inherited restrictions?

**Strong answer criteria:**

- Traces the exposed read path
- Defines restrictions at the correct boundary
- Tests negative and positive identities

**Verification evidence:** Capture the real service responses for two organizational scopes, including navigation and counts.

**Read and verify this answer:**

- [SAP Learning: authority checks and DCL](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

## MODEL-02 An approver may update organization A. Can an update move an order from A to B using only existing-instance authorization?

**Level:** Senior

**Short answer:** Authorization on the current instance can establish permission for its existing state, but that does not automatically approve the proposed target values. Treat the incoming organization change as a separate policy decision. Use supported prechecks and business validation/operation checks at appropriate points, with explicit handling of create and update. Derivations must not silently introduce a target scope that the caller was never allowed to choose.

**Example and follow-up:** An order starts in A, so an existing-instance check succeeds. The payload proposes B. Test permitted A-to-A changes, forbidden A-to-B changes, initial values and batch requests. Ensure internal local-mode updates occur behind a verified public operation and still preserve business consistency.

**Avoid this mistake:** Do not equate authorization for the current object with authorization for any future object state.

**Interviewer follow-ups:**

- What is checked for creation?
- What happens if a determination changes the organization?

**Strong answer criteria:**

- Separates current and proposed state
- Checks the public mutation boundary
- Considers derived and bulk changes

**Verification evidence:** Demonstrate a rejected cross-scope update through the actual service with no unauthorized persisted change.

**Read and verify this answer:**

- [SAP RAP authorization control](https://help.sap.com/docs/abap-cloud/abap-rap/authorization-control) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

<details>
<summary>Visual: Existing and proposed state authorization</summary>

![Existing and proposed state authorization](../visuals/senior-proposed-state-authorization.svg)

Editing the current A instance and moving it into B are different authorization decisions. Partial input must be interpreted with existing state without treating omitted fields as explicit clears.

**Explain it:** Which state does each check inspect, and what happens if a determination changes the target scope?

**Limit:** A policy example, not a universal company-code rule. Implement through the target RAP scenario's supported hooks; prechecks do not replace the complete authorization model.

</details>

## MODEL-03 A custom query returns only authorized rows but an unrestricted total count. Is it secure?

**Level:** Senior

**Short answer:** No. Authorization must constrain the logical result before both counting and paging. A custom query provider owns the supported request semantics and cannot assume database-managed protections automatically cover remote or manually assembled data. Build one consistent authorized predicate and use it for data and count. Do not load all remote records into memory merely to hide unauthorized rows after an unrestricted count or aggregation.

**Example and follow-up:** The caller may see five permitted orders while count reveals 900 hidden orders. Test zero-access users, count-only requests, filters, ordering and navigation. If the provider cannot securely support a requested aggregate or filter, reject it under a documented contract instead of returning a misleading result.

**Avoid this mistake:** Filtering only the displayed page leaves count, aggregates and existence checks exposed.

**Interviewer follow-ups:**

- How do you handle count-only requests?
- What if the remote API cannot apply your authorization predicate?

**Strong answer criteria:**

- Uses one authorized result definition
- Protects count and aggregates
- Rejects unsupported semantics explicitly

**Verification evidence:** Use restricted identities and compare authorized data, count and aggregate responses over the same fixture.

**Read and verify this answer:**

- [SAP: Requesting and Setting Data or Count](https://help.sap.com/docs/abap-cloud/abap-rap/requesting-and-setting-data-or-count-in-unmanaged-query) - Handle data and count requests independently. Apply the same authorization and filtering to both; test count-only requests.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

<details>
<summary>Visual: Secure custom-query filtering, count, and page</summary>

![Secure custom-query filtering, count, and page](../visuals/senior-query-secure-pipeline.svg)

The same authorized logical set contains IDs 2, 4, and 6. Counting it returns three; skipping one and taking two returns IDs 4 and 6 without revealing hidden B rows.

**Explain it:** What should a count-only request return, and what should happen if the filter cannot be represented safely?

**Limit:** The drawing specifies semantics, not a mandatory physical execution plan. A remote/custom provider must preserve equivalent authorization, filtering, count, and ordering behavior.

</details>

## MODEL-04 A query-provider filter cannot be converted to simple ranges. A developer catches the exception and returns everything. What is the correction?

**Level:** Senior

**Short answer:** Preserve the requested Boolean semantics or reject the unsupported filter clearly. Range conversion is not a universal representation of arbitrary nested AND/OR expressions and functions. Use a supported expression representation or another safe translation strategy appropriate to the provider. Combine user filters with mandatory authorization predicates independently, so a parsing failure cannot remove either restriction. Validate dynamic identifiers and values through supported APIs.

**Example and follow-up:** Consider (region=A AND amount>100) OR (region=B AND urgent=true). Flattening this into independent region and amount ranges changes the result. Build fixtures that distinguish the intended expression from the flattened one, and include an unsupported-function request.

**Avoid this mistake:** A swallowed filter exception must not become an unrestricted selection.

**Interviewer follow-ups:**

- Can the backend express the same predicate?
- How do mandatory authorization filters survive translation failure?

**Strong answer criteria:**

- Preserves AND/OR grouping
- Separates mandatory restrictions
- Returns an explicit unsupported-request outcome

**Verification evidence:** Compare expected row sets for nested filters and prove failure never broadens authorized access.

**Read and verify this answer:**

- [SAP: Implementing Filtering in an Unmanaged Query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-filtering-in-unmanaged-query) - Check supported filter representations and conversion limitations. Unsupported input must not remove required user or authorization restrictions.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

<details>
<summary>Visual: Secure custom-query filtering, count, and page</summary>

![Secure custom-query filtering, count, and page](../visuals/senior-query-secure-pipeline.svg)

The same authorized logical set contains IDs 2, 4, and 6. Counting it returns three; skipping one and taking two returns IDs 4 and 6 without revealing hidden B rows.

**Explain it:** What should a count-only request return, and what should happen if the filter cannot be represented safely?

**Limit:** The drawing specifies semantics, not a mandatory physical execution plan. A remote/custom provider must preserve equivalent authorization, filtering, count, and ordering behavior.

</details>

## MODEL-05 A paged custom entity repeats some rows after an insertion. How would you make the contract predictable?

**Level:** Senior

**Short answer:** Start with deterministic ordering that includes a unique tie-breaker; sorting only by a nonunique date is insufficient. Then distinguish deterministic order from snapshot consistency: concurrent inserts can still shift offset pages. Choose the supported continuation or consistency mechanism, or document the weaker browsing behavior if a snapshot is unnecessary. For an export requiring completeness, design a stable extraction boundary rather than assuming UI paging is a reliable bulk-transfer protocol.

**Example and follow-up:** Twenty orders share a creation date. A new order is inserted between page requests. Test tied values, reverse sorting, deleted rows, empty pages and a count change. State whether the product requires an interactive current list or a reproducible export.

**Avoid this mistake:** Adding ORDER BY alone does not guarantee a frozen dataset across requests.

**Interviewer follow-ups:**

- What is the tie-breaker?
- Does the use case require a snapshot or just stable ordering?

**Strong answer criteria:**

- Separates ordering from consistency
- Chooses a contract for concurrent changes
- Tests page boundaries with duplicate sort values

**Verification evidence:** Run successive requests while inserting and deleting records and verify the documented paging behavior.

**Read and verify this answer:**

- [SAP: Interface IF_RAP_QUERY_PAGING](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/c9e191cc92e54ca2bfec677037780c03.html?locale=en-us) - Distinguish offset, zero page size and PAGE_SIZE_UNLIMITED. The paging interface does not itself provide a cross-request snapshot.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

<details>
<summary>Visual: Secure custom-query filtering, count, and page</summary>

![Secure custom-query filtering, count, and page](../visuals/senior-query-secure-pipeline.svg)

The same authorized logical set contains IDs 2, 4, and 6. Counting it returns three; skipping one and taking two returns IDs 4 and 6 without revealing hidden B rows.

**Explain it:** What should a count-only request return, and what should happen if the filter cannot be represented safely?

**Limit:** The drawing specifies semantics, not a mandatory physical execution plan. A remote/custom provider must preserve equivalent authorization, filtering, count, and ordering behavior.

</details>

## MODEL-06 Adding a language-dependent text association doubles order totals. Would DISTINCT be a good fix?

**Level:** Senior

**Short answer:** First identify the grain of the result and the actual join multiplicity. Check language, validity and other conditions that make the text association to-one or to-many. Declared cardinality is not data cleanup and can mislead optimization when false. Repair the relationship or aggregate at the correct grain before exposing the measure. DISTINCT can mask the symptom while retaining incorrect totals or discarding legitimate detail.

**Example and follow-up:** One order worth 100 EUR joins two text rows and contributes 200 EUR to a sum. Add overlapping validity periods to the fixture as well as two languages. Verify both the detailed entity and the consuming analytical or list result.

**Avoid this mistake:** Do not fix an incorrect join by simply declaring a to-one cardinality.

**Interviewer follow-ups:**

- What is one row supposed to represent?
- Which data condition establishes uniqueness?

**Strong answer criteria:**

- Defines result grain
- Proves association multiplicity
- Checks the downstream measure

**Verification evidence:** Show expected rows and totals for multiple texts, missing texts and overlapping validity intervals.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

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

## MODEL-07 A CDS report sums 100 EUR and 100 USD into 200. What should the model and service do?

**Level:** Senior

**Short answer:** Preserve amount/currency and quantity/unit semantics throughout the model. A sum is meaningful only within compatible units or after an explicitly defined conversion. Decide the target currency, rate type, date and rounding policy with the business owner. An annotation communicates semantics but does not, by itself, perform a correct conversion or make arbitrary aggregation valid. Verify how the actual analytical or transactional consumer interprets the exposed fields.

**Example and follow-up:** Provide mixed currencies, a missing exchange rate and a value requiring rounding. A summary can group by currency or apply approved conversion, but must not silently combine incomparable values. Keep original values available where reconciliation requires them.

**Avoid this mistake:** Do not confuse semantic annotations with conversion logic.

**Interviewer follow-ups:**

- Which date determines the rate?
- At which stage is rounding applied?

**Strong answer criteria:**

- Maintains unit semantics
- Names the business conversion policy
- Reconciles rounded and original values

**Verification evidence:** Compare expected totals for same-currency, mixed-currency and missing-rate fixtures.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## MODEL-08 A transactional projection needs a calculated field that its provider contract does not permit. How do you redesign it?

**Level:** Senior

**Short answer:** Check the exact projection/provider-contract restrictions in the target release. Place permitted calculations in an appropriate underlying data model, expose a suitable read model, or use a supported virtual-element mechanism when its limitations fit. Do not turn a transactional projection into an arbitrary join solely to satisfy the UI. Preserve stable identity, behavior mapping, authorization and update semantics across the chosen design.

**Example and follow-up:** The UI requests a derived risk band and wants to filter by it. A transient calculation may display correctly but fail server-side filtering. Decide whether the risk belongs in persistent business state, a database expression or a read-only enrichment, and test that consumer requirement.

**Avoid this mistake:** A field that displays in preview is not proof of a supported filterable transactional contract.

**Interviewer follow-ups:**

- Does the field participate in filtering or ordering?
- Who owns recalculation when source data changes?

**Strong answer criteria:**

- Checks the provider contract
- Preserves transactional identity
- Designs for consumer query semantics

**Verification evidence:** Exercise read, filter, order and update against the intended binding on the target release.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## MODEL-09 The business wants to sort a million-row list by a virtual element computed through a remote call. What would you propose?

**Level:** Senior

**Short answer:** Challenge the requested access pattern before implementing row-by-row enrichment. A virtual element does not automatically support efficient database sorting, filtering or aggregation. Consider a permitted persistent read model with refresh rules, a supported pushdown calculation, or a bounded enrichment where sorting is not required. State freshness, failure and reconciliation requirements. Avoid moving an unbounded database workload into ABAP or remote calls.

**Example and follow-up:** A risk score depends on a remote provider. Define how stale it may be and what the UI shows when the provider is unavailable. Compare query latency and result correctness with representative volumes; a fast demo using ten rows does not establish scalability.

**Avoid this mistake:** Do not claim that adding a virtual element automatically pushes its logic to HANA.

**Interviewer follow-ups:**

- What freshness is acceptable?
- How many remote calls occur for one page and its count?

**Strong answer criteria:**

- Identifies unsupported query operations
- Controls remote-call volume
- Makes freshness and failure explicit

**Verification evidence:** Measure request count, rows transferred and latency with a realistic dataset and a failing remote dependency.

**Read and verify this answer:**

- [SAP RAP: implementing sorting of virtual elements](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-sorting-of-virtual-elements) - Explains transformation of supported virtual-element sort requests before retrieval. Verify projection, protocol, interface release and consumer restrictions on the target release.

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## MODEL-10 Two rows in a service share the declared CDS key after a join. Why is this more than a display issue?

**Level:** Senior

**Short answer:** Consumer identity must uniquely and stably distinguish each exposed instance. Declaring an element as key does not make a nonunique SQL result unique. Duplicate identities can corrupt navigation, client caching, selection and mutation targeting. Correct the data grain, join or composite key while assessing compatibility for existing consumers. If the current public identity is wrong, plan an explicit API transition rather than silently changing key meaning.

**Example and follow-up:** An order-item service exposes only OrderId as key. Two items appear with the same identity and the UI targets the wrong item. Test read-by-key and navigation, not merely row count. Include repeated reads in different orders to reveal unstable client behavior.

**Avoid this mistake:** Do not hide duplicate-key rows with client-side deduplication.

**Interviewer follow-ups:**

- Can the public key change compatibly?
- Is the entity a business object instance or an aggregate?

**Strong answer criteria:**

- Proves key uniqueness at exposed grain
- Explains consumer consequences
- Plans compatible identity evolution

**Verification evidence:** Validate uniqueness, stable canonical URLs and correct read/update targeting for multiple child records.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

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

## MODEL-11 A value help reveals customer names that the order list hides. Where should the fix live?

**Level:** Senior

**Short answer:** Treat the value-help entity and its text/navigation paths as separately consumed data contracts. Apply the required access restrictions and validate actual user identity and context. UI annotations can connect a value help but do not establish its authorization. Ensure the selected value is still validated at the write boundary because clients can submit a value without using the UI chooser.

**Example and follow-up:** A restricted user opens customer search and learns names outside their organization. Test direct access to the value-help service, search/count behavior and a forged customer value in an order update. The read restriction and business consistency check solve related but distinct problems.

**Avoid this mistake:** Hiding the value-help control is not a backend security fix.

**Interviewer follow-ups:**

- Can the entity be consumed directly?
- What checks a value submitted outside Fiori?

**Strong answer criteria:**

- Protects auxiliary data exposure
- Checks direct service access
- Validates proposed business references

**Verification evidence:** Execute denied-user searches and direct payload changes using allowed and forbidden customer keys.

**Read and verify this answer:**

- [SAP Learning: authority checks and DCL](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## MODEL-12 A batch job asks to use privileged EML because normal authorization rejects it. How do you evaluate the request?

**Level:** Senior

**Short answer:** First establish the job identity, its legitimate business scope and whether normal authorization can represent that scope. Privileged access is a provider-enabled contract with specific bypass behavior, not a generic workaround. Review the defined authorization contexts, exposed entry points and caller trust boundary. If privilege is justified, narrowly encapsulate it, preserve remaining business checks and produce auditable evidence of who requested which effect.

**Example and follow-up:** A repair job should reconcile one approved organizational scope, not become an unrestricted posting API. Test both the approved job path and attempts to reach the helper from an ordinary consumer. Confirm which checks are bypassed in the actual provider contract.

**Avoid this mistake:** Do not assume PRIVILEGED, IN LOCAL MODE and a technical user are equivalent.

**Interviewer follow-ups:**

- Which authorization context is disabled?
- Why cannot ordinary scoped authorization satisfy the requirement?

**Strong answer criteria:**

- Requires a provider-supported privilege contract
- Limits the trusted entry point
- Retains business checks and auditability

**Verification evidence:** Review privilege configuration and demonstrate allowed repair plus rejected unauthorized invocation.

**Read and verify this answer:**

- [SAP EML local and privileged modes](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## MODEL-13 A developer uses IN LOCAL MODE in a helper to avoid feature checks. What makes the helper safe or unsafe?

**Level:** Senior

**Short answer:** Locate the helper within its own BO implementation and trace every public operation that can reach it. Local mode supports internal state maintenance and bypasses defined checks depending on the operation; it does not authorize arbitrary external business requests or erase transactional constraints. Ensure public inputs have already been checked and that internal changes preserve invariants. Review cross-BO calls under their own contracts.

**Example and follow-up:** A determination legitimately updates a derived readonly amount. The same helper becomes unsafe if a public action forwards arbitrary caller values to it. Test that the derived field cannot be controlled indirectly through a newly added action parameter.

**Avoid this mistake:** Do not fix missing authorization by routing all work through local mode.

**Interviewer follow-ups:**

- Which controls does this specific operation bypass?
- Can a caller influence the supposedly derived values?

**Strong answer criteria:**

- Traces trust from public input
- Confines internal state changes
- Distinguishes own-BO and cross-BO access

**Verification evidence:** Use adversarial action inputs and verify that only approved derivations reach readonly or protected fields.

**Read and verify this answer:**

- [SAP EML local and privileged modes](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

<details>
<summary>Visual: Existing and proposed state authorization</summary>

![Existing and proposed state authorization](../visuals/senior-proposed-state-authorization.svg)

Editing the current A instance and moving it into B are different authorization decisions. Partial input must be interpreted with existing state without treating omitted fields as explicit clears.

**Explain it:** Which state does each check inspect, and what happens if a determination changes the target scope?

**Limit:** A policy example, not a universal company-code rule. Implement through the target RAP scenario's supported hooks; prechecks do not replace the complete authorization model.

</details>

## MODEL-14 A CDS unit test passes, but the same entity leaks data for a restricted user. What may the test be missing?

**Level:** Senior

**Short answer:** Inspect the test environment and access-control configuration. A test focused on relational logic with CDS doubles may intentionally isolate or disable access control; it is not automatically an authorization test. Enable the supported access-control testing mechanism with meaningful role data where available, and add real service tests under restricted identities. Keep query-correctness evidence separate from security evidence.

**Example and follow-up:** One test proves the join returns three rows. Add fixtures for no authorization and two distinct scopes, then ensure the test actually evaluates DCL. A final service test also verifies binding, identity propagation and the real consumed entity.

**Avoid this mistake:** A green database-double test does not prove deployed authorization.

**Interviewer follow-ups:**

- Is DCL enabled in the test environment?
- Which real identity is used by the service?

**Strong answer criteria:**

- Inspects double behavior
- Adds denied and scoped authorization cases
- Separates unit and deployed evidence

**Verification evidence:** Show test configuration plus restricted-user service results; do not infer one from the other.

**Read and verify this answer:**

- [SAP CDS access-control tests](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-visual-studio-code/writing-test-for-cds-entity-with-access-control) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

<details>
<summary>Visual: Real behavior under test and dependency doubles</summary>

![Real behavior under test and dependency doubles](../visuals/senior-real-cut-evidence.svg)

Two deliberately different inputs exercise the real Submit rule while a separate limit-provider dependency is controlled. Assertions inspect state and response identity, not only execution coverage.

**Explain it:** If the account-assignment rejection is removed, which test fails? What evidence remains missing after these tests pass?

**Limit:** The fixture is conceptual and not an executed ABAP Unit result. Framework double support and persistence setup depend on the target release and test boundary.

</details>

## MODEL-15 An integration user can access all tenants or clients through a custom read provider. What boundaries must be reviewed?

**Level:** Senior

**Short answer:** Separate technical client handling, tenant isolation, business authorization and remote credentials. Standard data-access behavior does not automatically protect arbitrary remote calls or custom assembled datasets. Avoid accepting unrestricted client/tenant selectors from untrusted request input. Use supported tenant-aware access and configuration, enforce business scope and test identity propagation. The exact tenant model differs by environment and must be established explicitly.

**Example and follow-up:** A provider forwards an incoming company or tenant parameter to a privileged remote destination. Even if the local CDS looks restricted, the remote response may cross the intended boundary. Test two scopes with overlapping business IDs and inspect both request construction and returned data.

**Avoid this mistake:** Do not treat a client field, a destination name or authentication alone as complete tenant isolation.

**Interviewer follow-ups:**

- Who controls the remote tenant selector?
- Which identity does the remote system evaluate?

**Strong answer criteria:**

- Separates technical and business scope
- Constrains untrusted selectors
- Checks end-to-end identity propagation

**Verification evidence:** Run cross-scope negative tests and review the permitted communication configuration without exposing secrets.

**Read and verify this answer:**

- [SAP RAP authorization control](https://help.sap.com/docs/abap-cloud/abap-rap/authorization-control) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

## MODEL-16 A projection hides an operation, but another consumer can still call the base BO. Is hiding sufficient?

**Level:** Senior

**Short answer:** Projection restrictions define a consumer-facing operation surface, not a universal revocation of the underlying capability. Review who can consume the base BO or another released interface, and enforce security at the appropriate behavior boundary. Keep public API release, package visibility and operation authorization aligned. Feature control can improve availability feedback but cannot replace authorization for alternative entry points.

**Example and follow-up:** A UI projection excludes Delete while a background consumer uses a broader local BO interface. Decide whether that capability is intentional for the background role. Test direct access to every supported mutation path using an unauthorized identity.

**Avoid this mistake:** Do not use the UI service shape as the only security policy.

**Interviewer follow-ups:**

- Which consumers are permitted to use the base contract?
- Where does the decisive permission check execute?

**Strong answer criteria:**

- Inventories alternate entry points
- Separates surface restriction from permission
- Tests local and remote consumers

**Verification evidence:** Provide a consumer/operation/identity matrix and evidence of denied mutation through each exposed path.

**Read and verify this answer:**

- [SAP BO interfaces](https://help.sap.com/docs/abap-cloud/abap-rap/business-object-interface) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

<details>
<summary>Visual: Existing and proposed state authorization</summary>

![Existing and proposed state authorization](../visuals/senior-proposed-state-authorization.svg)

Editing the current A instance and moving it into B are different authorization decisions. Partial input must be interpreted with existing state without treating omitted fields as explicit clears.

**Explain it:** Which state does each check inspect, and what happens if a determination changes the target scope?

**Limit:** A policy example, not a universal company-code rule. Implement through the target RAP scenario's supported hooks; prechecks do not replace the complete authorization model.

</details>

## MODEL-17 A released entity gains a new field that is expensive and sensitive. Is an additive change automatically safe?

**Level:** Senior

**Short answer:** Not necessarily. Check default projection, serialization, authorization, query cost and consumers that interpret metadata or request broad selections. Preserve compatibility while deciding whether the field belongs in the same public contract or a more restricted projection. Avoid unexpected remote enrichment or large payload growth on existing list requests. Verify the relevant release contract and supported evolution rules before shipping.

**Example and follow-up:** A new personal-data field is included by broad selects and exports. Another computed field adds one remote call per row. Existing callers did not change, but privacy and latency did. Test default reads, explicit selection, metadata-driven UIs and restricted identities.

**Avoid this mistake:** Do not assess compatibility using only whether old source code still compiles.

**Interviewer follow-ups:**

- Does an existing broad select expose it?
- How does it affect authorization and request cost?

**Strong answer criteria:**

- Assesses semantic and operational compatibility
- Controls default exposure
- Tests unchanged consumers

**Verification evidence:** Compare old/new payloads, access results and latency for representative existing requests.

**Read and verify this answer:**

- [SAP BO interfaces](https://help.sap.com/docs/abap-cloud/abap-rap/business-object-interface) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

## MODEL-18 An analytical requirement is added to a transactional BO. Would you put every aggregate into its projection?

**Level:** Senior

**Short answer:** Choose a read model appropriate to the analytical grain and consumer rather than distorting transactional identity and behavior. Reuse trustworthy underlying semantics where suitable, then define aggregation, currency, authorization and freshness deliberately. Keep transactional mutations on the BO contract. A separate analytical model may be justified, but avoid duplicating business rules without an ownership and consistency plan.

**Example and follow-up:** An approval object needs both item editing and monthly spend by organization. The monthly aggregate is not the same entity identity as an editable item. Compare whether live calculation meets latency or whether a reconciled read model is necessary.

**Avoid this mistake:** Do not make an aggregate writable merely because its source is a transactional BO.

**Interviewer follow-ups:**

- What is the aggregate grain?
- How are authorization and currency preserved across the models?

**Strong answer criteria:**

- Separates transaction and analytical identity
- Reuses semantics intentionally
- Defines freshness and reconciliation

**Verification evidence:** Reconcile grouped totals to authorized transactional fixtures and validate the intended analytical consumer.

**Read and verify this answer:**

- [SAP analytical projection modeling](https://learning.sap.com/courses/developing-analytical-models-with-cds-based-analytical-projection-views/describing-the-role-of-a-cds-analytical-projection-view) - Verify the actual consumption path and include denied-user, filtering and boundary tests.

<details>
<summary>Visual: SQL join multiplication</summary>

![SQL join multiplication](../visuals/classic-sql-join-grain.svg)

Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.

**Explain it:** What is one row of this result supposed to represent? Where should a language filter go for optional text?

**Limit:** This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.

</details>

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## Official references

- [SAP RAP authorization control](https://help.sap.com/docs/abap-cloud/abap-rap/authorization-control)
- [SAP Learning: authority checks and DCL](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks)
- [SAP EML local and privileged modes](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml)
- [SAP CDS access-control tests](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-visual-studio-code/writing-test-for-cds-entity-with-access-control)
- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e)
- [SAP BO interfaces](https://help.sap.com/docs/abap-cloud/abap-rap/business-object-interface)
- [SAP custom-entity application example](https://learning.sap.com/courses/expanding-sap-s-4hana-using-key-user-side-by-side-extensibility/application-example)
- [SAP analytical projection modeling](https://learning.sap.com/courses/developing-analytical-models-with-cds-based-analytical-projection-views/describing-the-role-of-a-cds-analytical-projection-view)
- [SAP RAP: implementing sorting of virtual elements](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-sorting-of-virtual-elements)
