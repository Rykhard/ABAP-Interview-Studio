# Senior CDS, query contracts and security

Diagnose data leaks, identity defects and query errors through the actual consumer boundary. Preserve business semantics, authorization and supported contracts when redesigning the model.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## MODEL-01 A new consumption entity exposes orders outside the user's sales organization. The base CDS has DCL. What do you investigate?

**Level:** Senior

**Short answer:** Trace the entity that the service actually reads and its access rules. DCL on the base view does not automatically protect every higher view or navigation path. Define the required restrictions, using supported inheritance and mappings where appropriate. Test both allowed and denied data. A UI filter or #CHECK annotation alone cannot create the missing security rule.

**Reasoning and example:** Create similar orders in sales organizations A and B, then use an identity allowed only for A. Compare direct base reads, the exposed projection, and association navigation. This reveals where the intended restriction stops being applied, rather than assuming the layer with DCL secures all later layers.

Include counts, value helps, and alternative service paths. A hidden organization's key or count can still disclose information even when its rows are absent from the main list. Preserve legitimate access and any deliberate documented exceptions while fixing the rule. Keep RAP update and action permissions separate: proving which rows a user can read does not prove which operations that user may perform.

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

- [SAP Learning: authority checks and DCL](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

## MODEL-02 An approver may update organization A. Can an update move an order from A to B using only existing-instance authorization?

**Level:** Senior

**Short answer:** Permission to update an order in A does not automatically allow moving it into B. Check both the current object and the proposed target values at the appropriate operation boundary. Supported prechecks can help reject disallowed input before it enters the buffer. Cover creates, updates, and derived changes. Keep the complete authorization and business validation design, not just the existing-instance check.

**Reasoning and example:** An approver can edit an order in organization A, so the check against its current state succeeds. The update payload changes Organization to B, which the user is not allowed to choose. Without a target-value check, permission for A becomes an unintended route into B.

Test A-to-A changes, denied A-to-B changes, initial values, and several inputs in one request. If a determination derives the organization, that result must also remain within the intended rules. Internal local-mode updates should sit behind a properly checked public operation, not provide an indirect way to submit forbidden values. Creation needs its own checks because there is no existing instance whose authorization settles the question.

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

- [SAP RAP authorization control](https://help.sap.com/docs/abap-cloud/abap-rap/authorization-control) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** No. The count must describe the same authorized, filtered result as the returned rows, before paging. A custom provider cannot assume remote or manually assembled data is protected automatically by database access control. Apply the same restrictions to data, count, and supported aggregates. If an operation cannot be answered securely and correctly, reject it clearly instead of returning misleading information.

**Reasoning and example:** A user can see five permitted orders, but the service returns a total count of 900 including hidden orders. The list has filtered the rows, yet the count still reveals information. Use one consistent definition of the permitted result before calculating its count or selecting a page. Do not simply fetch everything remotely and hide only the displayed rows.

Test a user with no access, a count-only request, filters, ordering, and any navigation or aggregation the service supports. A count-only request must still apply permissions even when no rows are requested. If the remote source cannot support the required secure selection, choose a suitable safe implementation or explicitly reject the unsupported request.

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

- [SAP: Requesting and Setting Data or Count](https://help.sap.com/docs/abap-cloud/abap-rap/requesting-and-setting-data-or-count-in-unmanaged-query) - Handle requests for rows and requests for a count independently. Apply the same permissions and filters to both, and test a request that asks only for the count.

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

**Short answer:** Do not turn a filter-conversion failure into an unrestricted read. Preserve the original AND/OR grouping using a supported expression representation or another safe translation. If the provider cannot support the filter, reject it clearly. Keep mandatory authorization restrictions separate from user filters so neither disappears on an error. Handle dynamic field names and values through supported safe APIs.

**Reasoning and example:** The filter means either region A with amount above 100, or region B with Urgent true. Converting that into separate region and amount ranges can change which records match. A request that should return selected urgent B records may instead return too much or hide legitimate matches.

Create test rows that distinguish the original grouped expression from the simplified one. Include an unsupported function and verify that its failure returns the documented error rather than all records. Authorization restrictions must remain in force regardless of filter parsing. If the backend cannot express the requested condition faithfully, an explicit unsupported-request response is safer and more useful than a successful-looking incorrect dataset.

**Avoid this mistake:** A swallowed filter exception must not become an unrestricted selection.

**Interviewer follow-ups:**

- Can the backend express the same predicate?
- How do mandatory authorization filters survive translation failure?

**Strong answer criteria:**

- Preserves AND/OR grouping
- Keeps mandatory access rules in force
- Clearly rejects unsupported requests

**Verification evidence:** Compare expected row sets for nested filters and prove failure never broadens authorized access.

**Read and verify this answer:**

- [SAP: Implementing Filtering in an Unmanaged Query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-filtering-in-unmanaged-query) - Check which filter expressions can be translated correctly. An unsupported filter must not cause the provider to drop the requested filter or required access restrictions.

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

**Short answer:** Use a deterministic sort order with a unique tie-breaker. Then decide what consistency the caller needs across pages. Stable ordering does not freeze the data: an insertion can still shift offset-based pages. Use a supported continuation or snapshot approach where required, or document the weaker behavior of a live list. A complete export needs stronger planning than ordinary UI browsing.

**Reasoning and example:** Twenty orders share the same creation date. Sorting only by that date leaves their relative order unclear, so add an appropriate unique key as a tie-breaker. Now insert an order between page requests: even with that stable order, an offset can move and cause a repeated or missed row. These are two different problems.

Clarify whether the screen should show a changing current list or the caller needs a reproducible extraction. Test equal sort values, descending order, insertions, deletions, empty pages, and changing counts. Choose a supported mechanism that meets the requirement and state its limits. Adding ORDER BY fixes ambiguous ordering, but cannot alone promise a frozen dataset across separate requests.

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

- [SAP: Interface IF_RAP_QUERY_PAGING](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/c9e191cc92e54ca2bfec677037780c03.html?locale=en-us) - Check offset, zero rows requested, and PAGE_SIZE_UNLIMITED separately. This interface does not by itself freeze the dataset across several requests.

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

**Short answer:** Find out what one result row should represent and why the join produces more than one matching text. Check language, validity dates, and any other condition needed for uniqueness. Fix that relationship or aggregate at the correct level. DISTINCT may hide rows without fixing totals. Declaring to-one cardinality does not make duplicate matches disappear.

**Reasoning and example:** An order for 100 EUR joins to two language texts. The resulting query now contains two copies of the order amount, so a later sum becomes 200 EUR. The problem is the relationship's actual multiplicity, not simply the appearance of repeated labels. A false to-one declaration can also mislead query optimization.

Use fixtures with two languages, missing texts, and overlapping validity periods. Decide which text should apply and express the supported condition, or separate text retrieval from aggregation where appropriate. Check both detailed rows and the consuming total. DISTINCT can discard legitimate detail or leave the incorrect aggregate in place, so demonstrate the intended row identity and amount after the real fix.

**Avoid this mistake:** Do not fix an incorrect join by simply declaring a to-one cardinality.

**Interviewer follow-ups:**

- What should one result row represent?
- Which condition ensures that only one related row matches?

**Strong answer criteria:**

- Defines what one result row means
- Checks how many related rows actually match
- Verifies totals in the consuming query

**Verification evidence:** Show expected rows and totals for multiple texts, missing texts and overlapping validity intervals.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** Do not add amounts in different currencies as though they were the same unit. Group totals by currency or perform an agreed conversion first. Define the target currency, rate type, date, and rounding rule with the business. Preserve the currency and unit links in the model. An annotation describes those links; it does not automatically perform conversion.

**Reasoning and example:** A report contains 100 EUR and 100 USD. Showing 200 without a currency policy gives a misleading total. The business may want separate currency totals, or a total in EUR using a specified exchange-rate date. Those are different valid requirements and should be chosen deliberately.

Test mixed currencies, a missing rate, and values that require rounding. Check whether rounding happens per item or after aggregation, because totals can differ. Keep original values where reconciliation needs them and inspect how the real analytical or transactional consumer interprets the fields. The same principle applies to quantities with different units. A correctly annotated amount still needs correctly designed calculation behavior.

**Avoid this mistake:** Do not confuse semantic annotations with conversion logic.

**Interviewer follow-ups:**

- Which date determines the rate?
- At which stage is rounding applied?

**Strong answer criteria:**

- Keeps amounts and quantities linked to their currency or unit
- Explains the agreed conversion rules
- Reconciles rounded results with original values

**Verification evidence:** Compare expected totals for same-currency, mixed-currency and missing-rate fixtures.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## MODEL-08 A transactional projection needs a calculated field that its provider contract does not permit. How do you redesign it?

**Level:** Senior

**Short answer:** Check what the projection's provider contract allows on the target release. Put the calculation in a suitable underlying model, a separate read model, or a supported virtual element if its limits fit. Preserve stable identity, permissions, and update behavior. Do not force arbitrary joins into a transactional projection just for display. Test filtering and sorting as well as reading the field.

**Reasoning and example:** The UI asks for a calculated risk band and wants to filter orders by it. An ABAP-calculated display value might look correct for the current page but not support the required server-side filter. Decide where that value belongs: stored business state, a database expression, or a read-only enrichment with clearly limited query support.

Identify who recalculates it when source data changes. Then test read, filter, order, and update through the intended binding on the actual release. The transactional entity must still identify the right object and preserve behavior mapping and authorization. A field appearing in a preview proves display in that path, not a complete supported query-and-update design for every consumer.

**Avoid this mistake:** A field that displays in preview is not proof of a supported filterable transactional contract.

**Interviewer follow-ups:**

- Does the field participate in filtering or ordering?
- Who owns recalculation when source data changes?

**Strong answer criteria:**

- Checks what the projection allows
- Preserves correct object identity
- Supports the filtering and sorting the consumer needs

**Verification evidence:** Exercise read, filter, order and update against the intended binding on the target release.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** Do not calculate a million remote scores row by row just to sort a list. A virtual element does not automatically support efficient database sorting or filtering. Consider a suitable stored read model with refresh rules, a supported database calculation, or limited enrichment without global sorting. Agree how fresh results must be and how failures appear. Measure with realistic data.

**Reasoning and example:** A remote provider supplies each customer's risk score. Sorting all orders by that score may require far more work than displaying scores for one small page. Ten demo rows hide the cost of remote calls, data transfer, and rebuilding the result before paging. Virtual-element logic does not automatically move to HANA.

Ask whether scores can be stored and refreshed under an agreed policy, or whether users can work with a bounded result instead. Define what happens when the provider is unavailable and how stale values are marked or reconciled. Measure latency, calls, and transferred rows for both data and count requests. Choose a design that makes the sort correct at the required scale, not merely visually convincing.

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

- [SAP RAP: implementing sorting of virtual elements](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-sorting-of-virtual-elements) - Explains supported ways to translate sorting by a virtual element before reading the data. Check support for the projection, protocol, released interface, and actual client on the target release.

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## MODEL-10 Two rows in a service share the declared CDS key after a join. Why is this more than a display issue?

**Level:** Senior

**Short answer:** A service key must identify exactly one exposed instance and stay stable. Declaring CDS fields as key does not force a joined query to be unique. Duplicate identities can break navigation, caching, selection, and updates. Fix the query or key design and assess existing consumers. If a public key's meaning must change, plan an explicit API transition.

**Reasoning and example:** An order-item entity exposes only OrderId as its key. Two items in the same order therefore look like the same resource to the client. The list may show rows, but opening or updating one can target the wrong item. Client-side deduplication hides the symptom while losing legitimate data.

Test multiple items with read-by-key, navigation, stable URLs, and update targeting. Repeat reads in different orders to expose cache or selection confusion. Determine whether one row should represent an item or an aggregate, then choose the matching identity and query. If callers already rely on the incorrect public key, coordinate a migration instead of silently changing what an existing URL means.

**Avoid this mistake:** Do not hide duplicate-key rows with client-side deduplication.

**Interviewer follow-ups:**

- Can the public key change compatibly?
- Is the entity a business object instance or an aggregate?

**Strong answer criteria:**

- Proves one exposed key identifies one result row
- Explains the effect on callers
- Plans how callers move to a corrected identity

**Verification evidence:** Validate uniqueness, stable canonical URLs and correct read/update targeting for multiple child records.

**Read and verify this answer:**

- [SAP CDS modeling course](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** Protect the value-help entity and its text and navigation paths as read entry points in their own right. Linking it from a protected order list does not automatically restrict it. Test direct service access with the actual user context. Also validate selected values when writing an order. Clients can submit a customer key without ever opening the picker.

**Reasoning and example:** A restricted user cannot see another organization's orders but can search its customer names in the value help. The auxiliary search is leaking information even though the main list looks correct. Check its access rules, text associations, search results, and counts using the same restricted identity. Hiding the picker does not protect direct requests.

Then send an update containing a forbidden customer key directly to the service. The write path must reject it under the required business and permission rules even if the search now hides it correctly. Read restrictions stop disclosure; write checks stop an invalid or unauthorized reference being saved. Both are necessary because the UI is only one possible consumer.

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

- [SAP Learning: authority checks and DCL](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** First check the job's legitimate scope and whether normal permissions can represent it. Privileged EML requires a provider-supported privilege design; it is not a generic fix for rejected calls. Verify exactly which checks it bypasses and which trusted callers may reach it. Keep business checks and auditability. PRIVILEGED, IN LOCAL MODE, and a technical user are different mechanisms.

**Reasoning and example:** A repair job is authorized to reconcile one organization. Giving it a broadly callable privileged helper could accidentally let normal consumers perform unrestricted posting. Review the provider's authorization contexts and enabled privileged entry points, then expose only the narrow operation the job actually needs.

Test the approved repair and a denied attempt from an ordinary caller. Record who requested the repair and which business records it affected. If ordinary scoped authorization can meet the requirement, prefer that simpler model. If privilege is justified, document the precise bypass behavior on this provider and release. The fact that a background identity is technical does not by itself explain or authorize every bypass.

**Avoid this mistake:** Do not assume PRIVILEGED, IN LOCAL MODE and a technical user are equivalent.

**Interviewer follow-ups:**

- Which authorization context is disabled?
- Why cannot ordinary scoped authorization satisfy the requirement?

**Strong answer criteria:**

- Requires the provider to support the requested privilege
- Limits who can call the trusted operation
- Keeps business checks and an audit trail

**Verification evidence:** Review privilege configuration and demonstrate allowed repair plus rejected unauthorized invocation.

**Read and verify this answer:**

- [SAP EML local and privileged modes](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## MODEL-13 A developer uses IN LOCAL MODE in a helper to avoid feature checks. What makes the helper safe or unsafe?

**Level:** Senior

**Short answer:** Check that the helper belongs to the object's own behavior implementation and trace every public operation that reaches it. Local mode can skip defined checks for internal maintenance, depending on the operation. It does not approve arbitrary user input or remove RAP transaction rules. Validate public inputs first, preserve business rules internally, and assess calls to other objects separately.

**Reasoning and example:** A determination calculates a readonly total from approved input and updates it through internal EML. That can be a valid use of local mode. Now a new public action accepts a Total parameter and passes it directly to the same helper. The helper has become an indirect way for callers to overwrite a field they could not normally change.

Test those action inputs and examine which controls the specific local-mode operation bypasses. Keep caller-controlled values separate from trusted derived values, and verify the public operation's permission and input checks. A helper's name does not make it safe. Its safety depends on how it is reached, what values it accepts, and which changes it can make.

**Avoid this mistake:** Do not fix missing authorization by routing all work through local mode.

**Interviewer follow-ups:**

- Which controls does this specific operation bypass?
- Can a caller influence the supposedly derived values?

**Strong answer criteria:**

- Traces user input to the internal update
- Limits internal changes to their intended purpose
- Distinguishes own-object and other-object calls

**Verification evidence:** Use adversarial action inputs and verify that only approved derivations reach readonly or protected fields.

**Read and verify this answer:**

- [SAP EML local and privileged modes](https://help.sap.com/docs/abap-cloud/abap-rap/entity-manipulation-language-eml) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** Check whether the test actually evaluates access control. CDS doubles used to test joins may isolate or disable DCL, so a passing query test is not automatically a security test. Use supported access-control test setup with meaningful permission data where available. Add real service tests with restricted identities. Keep query correctness and deployed authorization evidence separate.

**Reasoning and example:** A unit test proves that a join returns three expected rows from fixture data. That is useful, but it says nothing about whether a user should see all three. Add cases for no access and two different organizational scopes, and inspect the test configuration to confirm that DCL is enabled and exercised.

Finally call the real service with restricted users. That checks the consumed entity, binding, and identity propagation that the isolated test may not cover. Capture positive cases too, so a fix does not simply block everyone. A green double-based test and a passing restricted-user service test prove different things; neither result should be inferred from the other.

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

- [SAP CDS access-control tests](https://help.sap.com/docs/abap-cloud/abap-development-tools-for-visual-studio-code/writing-test-for-cds-entity-with-access-control) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** Review client handling, tenant isolation, business permissions, and remote credentials separately. Local CDS restrictions do not automatically protect data assembled through custom or remote calls. Do not trust an unrestricted tenant selector from request input. Use the environment's supported tenant-aware configuration and check the identity seen downstream. The correct isolation model depends on the actual runtime.

**Reasoning and example:** The caller supplies a tenant or company parameter, and a custom provider forwards it through a remote connection with broad privileges. The remote response may contain another customer's records even if the local CDS model appears restricted. Inspect who controls that selector and how it is checked before building the remote request.

Test two scopes that share the same document numbers. Verify request construction, remote identity, and returned data so matching business IDs do not hide a cross-scope leak. Review permitted communication configuration without exposing credentials. A client field, destination name, or successful login covers only part of the chain. The whole path must preserve the intended tenant and business access boundaries.

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

- [SAP RAP authorization control](https://help.sap.com/docs/abap-cloud/abap-rap/authorization-control) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

## MODEL-16 A projection hides an operation, but another consumer can still call the base BO. Is hiding sufficient?

**Level:** Senior

**Short answer:** Hiding an operation in one projection limits that consumer's interface, not every possible caller. Check who can use the base object or another released interface. Enforce the required permissions in the appropriate behavior implementation and align release visibility and package access. Feature control can explain availability, but alternative entry points still need authorization. Review every supported change path.

**Reasoning and example:** The Fiori projection omits Delete, while a background program uses a broader local interface that includes it. That may be intentional for a controlled cleanup job, but the job's permission must be explicit. The missing UI button does not prove an ordinary user cannot delete through another supported route.

Build a simple list of consumers, operations, and allowed identities. Test unauthorized delete attempts through each exposed mutation path, including local and remote consumers where applicable. Check where the decisive permission decision occurs and whether base access is properly limited. Fixing only the UI service shape leaves a gap whenever a different caller can reach the underlying operation.

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

- [SAP BO interfaces](https://help.sap.com/docs/abap-cloud/abap-rap/business-object-interface) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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

**Short answer:** An added field can still change security, cost, or behavior for existing consumers. Check default reads, broad selections, serialization, metadata-driven clients, and permissions. A sensitive or expensive field may belong in a more restricted interface. Verify the release contract's evolution rules and test unchanged callers. Old code still compiling is not enough to prove the addition is safe.

**Reasoning and example:** A new personal-data field appears automatically in a broad select or export. No caller changed, yet users now receive information that needs a different access decision. Another added field calculates remotely for every returned row, making an existing list much slower. Both are compatibility concerns beyond the ABAP signature.

Compare old and new payloads, permission results, and latency for representative requests. Test explicit field selection, default selection, and UIs that build screens from metadata. Decide whether the field should be exposed separately, selected only when needed, or protected differently under supported mechanisms. Keep existing consumers' expectations in view before describing an additive change as harmless.

**Avoid this mistake:** Do not assess compatibility using only whether old source code still compiles.

**Interviewer follow-ups:**

- Does an existing broad select expose it?
- How does it affect authorization and request cost?

**Strong answer criteria:**

- Checks changes in meaning, access, and runtime cost
- Controls what existing reads expose by default
- Tests existing callers without changing them

**Verification evidence:** Compare old/new payloads, access results and latency for representative existing requests.

**Read and verify this answer:**

- [SAP BO interfaces](https://help.sap.com/docs/abap-cloud/abap-rap/business-object-interface) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

## MODEL-18 An analytical requirement is added to a transactional BO. Would you put every aggregate into its projection?

**Level:** Senior

**Short answer:** Choose an analytical read model that represents the required totals and groups. Do not distort an editable object's identity to fit every aggregate. Reuse reliable data meanings where possible, but define aggregation, currency, permissions, and freshness explicitly. Keep changes on the transactional object's supported operations. A separate read model needs ownership and consistency rules, not duplicated business logic nobody maintains.

**Reasoning and example:** An approval app edits individual items, while management wants monthly spend by organization. One monthly total is not the same kind of entity as one editable item. Treating both as a single transactional projection can make keys, permissions, and behavior confusing. Build a read model that clearly represents the monthly grouping instead.

Reconcile its totals with authorized transactional fixtures, including mixed currencies and late changes. Decide whether a live query meets response-time needs or whether a refreshed read model needs a defined delay and reconciliation process. Keep shared rules owned and consistent across the models. The fact that an aggregate comes from writable business data does not make the aggregate itself a sensible writable object.

**Avoid this mistake:** Do not make an aggregate writable merely because its source is a transactional BO.

**Interviewer follow-ups:**

- What should one aggregate row represent?
- How do both models preserve permissions and currency meaning?

**Strong answer criteria:**

- Distinguishes editable objects from grouped results
- Reuses data meanings deliberately
- Defines freshness and reconciliation

**Verification evidence:** Reconcile grouped totals to authorized transactional fixtures and validate the intended analytical consumer.

**Read and verify this answer:**

- [SAP analytical projection modeling](https://learning.sap.com/courses/developing-analytical-models-with-cds-based-analytical-projection-views/describing-the-role-of-a-cds-analytical-projection-view) - Test the entity and service callers actually use. Include denied users, filters, and attempts to cross the allowed access boundary.

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
