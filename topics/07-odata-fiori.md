# OData Gateway and Fiori integration

Separate the OData protocol from SAP implementation technologies. Practice explaining a request, its transaction boundary and the returned metadata or error. Keep legacy Gateway knowledge while choosing supported modern bindings for new services.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## ODATA-01 When would you choose OData V4 rather than V2?

**Level:** Core

**Short answer:** For a new RAP service, I start with OData V4 if the backend and client support it. I keep V2 when an existing app or integration needs it. The choice affects request formats and supported operations, so it needs testing. Switching to V4 alone does not make an application faster.

**Reasoning and example:** Suppose we are building a new Fiori elements app for purchase requests. I check the backend release, the SAPUI5 version and the chosen page template before selecting a V4 binding. I then test the operations the app needs, including actions and draft editing if used.

An older partner application might only understand V2. I would keep its working endpoint during migration rather than force a protocol change with the new UI. Draft, validations and determinations belong to RAP; they are not exclusive V4 features. Support still depends on the particular service and consumer, so a successful V4 demo does not answer every compatibility question.

**Avoid this mistake:** RAP and draft are not exclusive to V4, and Gateway is not exclusive to V2. Check the actual supported combination.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.
- [SAP Learning on UI service bindings](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-an-odata-ui-service) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

## ODATA-02 What does $metadata describe?

**Level:** Core

**Short answer:** $metadata tells a client what the service offers. It lists fields, their types, keys, relationships and available operations. It describes the shape of the API, rather than the actual orders or customers. When a field or action is missing in an app, I check this document first.

**Reasoning and example:** Imagine adding an Approve action to a RAP business object, but no button appears in Fiori. First, I open the metadata of the endpoint the app actually calls. If the action is absent, I check whether the projection and service expose it. Debugging the action handler would not help yet because the client cannot see that action.

If the action is present, I next check the UI annotations, template support and the metadata used by the running app. The same approach works for a missing field. Adding a database column does not automatically add a property to the public service.

**Avoid this mistake:** A database field is not automatically visible in the service just because it exists in persistence.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

<details>
<summary>Visual: HTTP request and response anatomy</summary>

![HTTP request and response anatomy](../visuals/http-message-anatomy.svg)

Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.

**Explain it:** Which header describes the returned body, and which requests a response format?

**Limit:** A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.

</details>

## ODATA-03 What are the main query options?

**Level:** Core

**Short answer:** OData query options tell the service which data the client needs. $filter chooses rows, $select chooses fields and $orderby sorts them. $top and $skip request a page, while $expand includes related data. I check which options the service supports and keep the request as small as the use case allows.

**Reasoning and example:** For a list of open orders, I request only the order number, customer and amount. I filter for open status and use a stable order, such as order number, before requesting the first page. This avoids sending full orders with every item when the screen only needs a short list.

If the user opens one order, I can request its items separately or use a supported $expand. Free-text $search is useful only when that service implements it. Count and search details also differ by protocol version. An option appearing in the OData standard does not mean an individual SAP endpoint accepts it.

**Avoid this mistake:** The existence of an OData option in the standard does not guarantee that every SAP service implements it.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ODATA-04 How do paging and total count work in V2 and V4?

**Level:** Advanced

**Short answer:** The total count tells the client how many rows match the filter, not how many fit on one page. Filter first, then count and page with a stable order. V2 commonly uses $inlinecount=allpages; V4 uses $count=true for an inline count. When the server returns a next link, the client should follow it.

**Reasoning and example:** A filter finds 500 open orders, but the screen displays 20 at a time. The response can correctly contain 20 orders and a total of 500. Returning 20 as the total would make the screen think there are no more pages. The /$count resource is another way to request a count.

Sorting matters too. Without a stable order, rows may move between pages even when the underlying data has not changed. Concurrent inserts or deletes can still affect offset paging. In a custom provider, I use the actual response API for that framework; I do not assume every Gateway implementation has the same method for setting the count.

**Avoid this mistake:** Use the response API of the actual provider. Do not assume every Gateway implementation has one generic SET_COUNT method.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ODATA-05 What is the difference between actions and functions?

**Level:** Core

**Short answer:** In OData V4, a function reads or calculates a result without requesting a business change. An action can change business data and is called with POST. An operation can belong to a particular entity, a collection, or neither. V2 uses function imports for its operation patterns, so I check the version before explaining the endpoint.

**Reasoning and example:** Consider a request with a calculated delivery estimate and a Submit button. A supported function could return the estimate without saving or approving anything. Submit is an action because it moves the request to a new business state. The action must check whether that transition is allowed.

A bound action might operate on request 4711, while an unbound operation is not attached to a specific entity. These choices are part of the service definition and client contract. I do not implement approval behind GET: a read can be repeated by clients or infrastructure, and it should not unexpectedly approve a document.

**Avoid this mistake:** An HTTP GET should not create or approve business documents.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

## ODATA-06 How do ETags prevent lost updates?

**Level:** Core

**Short answer:** An ETag is a version token for the data a client read. The client sends it back in If-Match when changing that data. If someone else has changed the version, the service normally rejects the request with HTTP 412. The user can then reload and resolve the conflict instead of losing the other person's changes.

**Reasoning and example:** Alice and Ben both read order 4711 with the same ETag. Alice changes the amount and saves, so the server now has a new version. Ben then sends his old ETag with a change to that same order. The service should reject Ben's stale update instead of silently overwriting Alice's work.

I test this with independent clients and inspect both the response and saved data. In RAP, the configured ETag field must change when the relevant data changes. Sending If-Match with a wildcard removes the specific version comparison. An ETag also does not replace authorization: Ben still needs permission to change the order.

**Avoid this mistake:** An If-Match wildcard can skip the intended version comparison. A timestamp also does not give a user permission to update.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

<details>
<summary>Visual: Two editors and one version: an illustrated story</summary>

![Two editors and one version: an illustrated story](../visuals/etag-story-illustration.png)

Alice and Ben read version 7. Alice updates successfully, producing version 8. Ben must not overwrite that newer state using the stale version 7 precondition.

**Explain it:** Why should the client refresh and resolve the conflict instead of blindly retrying its old payload?

**Limit:** Version numbers are illustrative. Real ETags are opaque validators; a failed If-Match precondition commonly returns HTTP 412. This is optimistic concurrency, not a pessimistic lock.

</details>

## ODATA-07 Is a batch request one database transaction?

**Level:** Advanced

**Short answer:** A batch is an envelope containing several requests. It does not automatically make them one transaction. Changesets provide atomic groups in multipart batches; OData 4.01 JSON batch has atomicity groups. I check what the service supports and inspect every inner result. An outer success response does not mean every operation succeeded.

**Reasoning and example:** Suppose a batch contains an order creation and an unrelated address change. These may belong to different groups and finish differently. If creating an order and its items must succeed together, the requests need the supported atomic grouping, or a supported deep-create operation for that structure. Deep create still needs correct backend transaction handling.

I test an invalid item and verify that the intended group leaves no partly created order. I also test a failure in a separate group and inspect each inner response. A service called V4 does not automatically implement every V4.01 JSON batch feature, so I verify its actual protocol and provider capabilities.

**Avoid this mistake:** HTTP 200 for a batch does not mean every operation inside it succeeded.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.
- [OASIS OData 4.01 JSON Format: Batch Requests](https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html) - Explains atomicityGroup in JSON batch. Check that the SAP service supports this protocol version and format.

<details>
<summary>Visual: OData batch envelope and atomic groups</summary>

![OData batch envelope and atomic groups](../visuals/odata-batch-envelope.svg)

The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.

**Explain it:** If a later independent group fails, must an earlier successful group be rolled back?

**Limit:** Conceptual grouping, not an exact multipart or JSON batch payload.

</details>

## ODATA-08 What are MPC_EXT and DPC_EXT in classic Gateway?

**Level:** Core

**Short answer:** In classic Gateway, MPC_EXT describes or extends the service model. DPC_EXT handles data requests and their errors. Customer changes belong in these extension classes rather than generated base classes. I keep reusable business rules in separate classes where practical. RAP uses a different model, with behavior implementations instead of this classic provider structure.

**Reasoning and example:** In a SEGW service, a list request may reach GET_ENTITYSET in DPC_EXT. I use that method to read the requested collection and map the result to the service response. CREATE_ENTITY, or the relevant deep-create implementation, handles an incoming creation request. Model changes and metadata belong on the model-provider side.

For a pricing rule used by several entry points, I put the calculation in a separate class and call it from the provider. This lets tests check the rule without building an HTTP request each time. It also reduces duplicated logic. I still test the provider itself for request mapping and correct business error responses.

**Avoid this mistake:** Putting all business rules in DPC_EXT makes them harder to reuse and test. MPC_EXT still matters when the model needs extending.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

## ODATA-09 How do authentication authorization and CSRF differ?

**Level:** Core

**Short answer:** Authentication tells the system who is calling. Authorization decides what that caller may do. CSRF protection helps stop unwanted requests that misuse a browser's logged-in session. Gateway writes commonly need a fetched CSRF token and the matching session. I check the endpoint's authentication flow because the exact requirements can differ.

**Reasoning and example:** An app reads an order successfully but gets 403 when saving. I inspect the error first. A missing CSRF token, missing service permission and a denied business action need different fixes, even if they use the same HTTP status. For a token problem, I check how the client fetched the token and kept the required session context.

If the user lacks approval permission, fetching another token will not help. The backend must still deny that action. CSRF protection is not a universal requirement imposed by the OData standard itself, and a valid token never grants the user access to a business operation.

**Avoid this mistake:** CSRF is not a universal OData-standard requirement and a valid token does not grant business permission.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## ODATA-10 How do you design dates media and errors?

**Level:** Advanced

**Short answer:** I use the service's documented types for dates and timestamps, with a clear time-zone meaning. Files need the supported binary endpoint and correct content type. Errors should tell the client what failed without exposing secrets or internal details. I follow the actual Gateway or RAP error model because their implementation APIs are different.

**Reasoning and example:** An invoice date such as 12 October is a calendar date; converting it between time zones should not turn it into the previous day. An event timestamp represents a point in time and needs the agreed time-zone handling. V4 has Edm.Date, but V2 does not use the same date representation. I test both against the actual consumer.

For an invoice PDF, I verify the binary content, media type and download behavior. For a rejected update, I use Gateway's supported exception and message facilities, or RAP FAILED and REPORTED as required. The response should identify the problem clearly while keeping credentials and implementation details out.

**Avoid this mistake:** Edm.Date is a V4 type; do not assume identical date serialization in V2.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

## ODATA-11 How do you troubleshoot a slow or failing Fiori request?

**Level:** Advanced

**Short answer:** I start with the exact failing or slow request from the browser. Then I check its response, service metadata and backend logs. For performance, I measure network size, backend time and database work before changing code. I also repeat the request with the affected user's permissions, because a developer preview may use a different setup.

**Reasoning and example:** A Fiori list takes eight seconds to open. The network trace shows that it requests every order together with all items through $expand. Each database statement may be reasonably fast, but the combined result is huge. I compare a small page request with the expanded request and measure row counts, payload size and total time.

If the request fails instead, I keep the timestamp and correlation ID to find the matching server log. I check routing, identity, authorization and metadata before blaming the UI. Traces belong in an authorized test context. A working ADT preview does not prove that the deployed app reaches the same endpoint under the same user.

**Avoid this mistake:** A working ADT preview does not prove a deployed app's routing, identity, metadata cache and backend authorization are correct.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ODATA-12 How do you evolve an existing API safely?

**Level:** Advanced

**Short answer:** I treat an API as an agreement with every app that uses it. Changing keys, field names, types or action behavior can break those apps. I prefer additions that existing clients can tolerate and use a new version for breaking changes. Before retiring an old endpoint, I test the old clients and confirm they have moved.

**Reasoning and example:** Suppose an existing integration reads a field named CustomerNumber. Renaming it to BusinessPartner might make the new model clearer, but the old client still sends and reads the original name. Saved UI state or generated client code can also depend on that field. I identify these consumers before changing the public contract.

A separate RAP service can run alongside a classic Gateway service while consumers migrate. I document the new behavior, test both contracts and track actual use of the old endpoint. Even an added field needs compatibility checks for strict clients. Creating a new RAP service does not automatically update a V2 consumer or preserve every old business rule.

**Avoid this mistake:** A new RAP service does not automatically update an old V2 client or preserve every behavior that client relies on.

**Read and verify this answer:**

- [SAP Learning on UI service bindings](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-an-odata-ui-service) - Check the protocol version and what the SAP service actually supports. A feature in the standard is not automatically available in every service.

## Official references

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-)
- [SAP Learning on UI service bindings](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-an-odata-ui-service)
- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html)
