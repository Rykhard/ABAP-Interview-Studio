# OData Gateway and Fiori integration

Separate the OData protocol from SAP implementation technologies. Practice explaining a request, its transaction boundary and the returned metadata or error. Keep legacy Gateway knowledge while choosing supported modern bindings for new services.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## ODATA-01 When would you choose OData V4 rather than V2?

**Level:** Core

**Short answer:** Prefer V4 for new supported transactional RAP services, while checking the actual Fiori elements or integration consumer and backend release. Keep V2 where required by an existing contract or consumer. V4 has first-class actions and functions and different protocol details; it is not simply a faster V2 switch.

**Example and follow-up:** Draft, determinations and validations are RAP capabilities rather than exclusive V4 features. Verify draft and non-draft support for the specific UI template and SAPUI5 version.

**Avoid this mistake:** Neither RAP nor draft automatically implies that V2 is impossible; Gateway is not exclusively V2.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.
- [SAP Learning on UI service bindings](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-an-odata-ui-service) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

## ODATA-02 What does $metadata describe?

**Level:** Core

**Short answer:** It describes the service contract: entity types, properties, keys, relationships, operations and relevant annotations. Clients use it to understand types and available operations. Metadata is separate from instance data, and the actual endpoint must be checked after model or binding changes.

**Example and follow-up:** A missing action button may result from an unexposed projection action, missing metadata or UI support. Inspect the contract before debugging the handler implementation.

**Avoid this mistake:** A database field is not automatically visible in the service just because it exists in persistence.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

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

**Short answer:** $select restricts properties, $filter restricts rows, $orderby sorts, $top and $skip page, and $expand includes related entities. Count and search syntax and support differ by protocol and service. A provider must apply options consistently and avoid returning unnecessarily large payloads.

**Example and follow-up:** Request a small field set, a selective filter and a stable key-based order. Use free-text $search only where the service exposes and implements that capability.

**Avoid this mistake:** The existence of an OData option in the standard does not guarantee that every SAP service implements it.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ODATA-04 How do paging and total count work in V2 and V4?

**Level:** Advanced

**Short answer:** Apply filtering before count and paging, and ensure a stable order. V2 commonly uses $inlinecount=allpages, while V4 uses $count=true for an inline total; the /$count resource returns a count. Server-driven paging can return a next link that clients should follow.

**Example and follow-up:** A total of 500 with a page of 20 is valid. Returning 20 as the total because only 20 rows were fetched breaks page navigation. Concurrent changes may still affect offset-based paging.

**Avoid this mistake:** Do not invent one generic SET_COUNT method for every Gateway implementation; use the actual response contract.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ODATA-05 What is the difference between actions and functions?

**Level:** Core

**Short answer:** In V4 a function is side-effect-free in the protocol sense and is used for retrieval or calculation. An action may have side effects and is invoked with POST. Operations can be bound to an entity or collection or be unbound. V2 exposes operation patterns through function imports.

**Example and follow-up:** Get a calculated preview through a function when the supported service contract fits. Submit a request with an action that checks the business transition.

**Avoid this mistake:** An HTTP GET should not create or approve business documents.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

## ODATA-06 How do ETags prevent lost updates?

**Level:** Core

**Short answer:** A service returns a version token. The client supplies If-Match with a modifying request, and the service checks whether the current version matches. A stale token normally produces HTTP 412. The client should reload or resolve the conflict instead of silently overwriting newer changes.

**Example and follow-up:** Test with two clients reading the same version, then updating sequentially. In RAP, configure the relevant ETag fields and update semantics correctly.

**Avoid this mistake:** If-Match with a wildcard can defeat the intended stale-version protection; timestamps alone do not secure authorization.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

<details>
<summary>Visual: Two editors and one version: an illustrated story</summary>

![Two editors and one version: an illustrated story](../visuals/etag-story-illustration.png)

Alice and Ben read version 7. Alice updates successfully, producing version 8. Ben must not overwrite that newer state using the stale version 7 precondition.

**Explain it:** Why should the client refresh and resolve the conflict instead of blindly retrying its old payload?

**Limit:** Version numbers are illustrative. Real ETags are opaque validators; a failed If-Match precondition commonly returns HTTP 412. This is optimistic concurrency, not a pessimistic lock.

</details>

## ODATA-07 Is a batch request one database transaction?

**Level:** Advanced

**Short answer:** Not necessarily. A batch groups HTTP operations; it is not automatically one atomic transaction. Multipart batch formats use changesets for atomic change operations. OData 4.01 JSON batch uses atomicity groups. These mechanisms depend on protocol version and provider support; read operations and separate groups can have different outcomes. Deep create describes creating a related structure and requires backend support for a coherent transaction.

**Example and follow-up:** For an order and items, test a failing child and verify that the intended atomic group does not partially persist. Inspect each inner response even when the outer batch request succeeds. Check the service's protocol version and provider capabilities; a V4 endpoint does not automatically support every V4.01 batching feature.

**Avoid this mistake:** HTTP 200 for a batch does not mean every operation inside it succeeded.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.
- [OASIS OData 4.01 JSON Format: Batch Requests](https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html) - See JSON batch atomicityGroup semantics. Verify that the SAP provider supports this protocol version and batch format.

<details>
<summary>Visual: OData batch envelope and atomic groups</summary>

![OData batch envelope and atomic groups](../visuals/odata-batch-envelope.svg)

The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.

**Explain it:** If a later independent group fails, must an earlier successful group be rolled back?

**Limit:** Conceptual grouping, not an exact multipart or JSON batch payload.

</details>

## ODATA-08 What are MPC_EXT and DPC_EXT in classic Gateway?

**Level:** Core

**Short answer:** The model-provider extension class extends the service model and metadata. The data-provider extension class implements or redefines runtime data operations and business error handling. Generated base classes should not host customer changes. This is a classic Gateway development approach, distinct from RAP behavior implementation.

**Example and follow-up:** In a SEGW service, trace GET_ENTITYSET for collection retrieval and CREATE_ENTITY or a deep-create implementation for writes. Keep reusable domain logic outside the provider adapter where feasible.

**Avoid this mistake:** Putting every rule directly in DPC_EXT makes testing and reuse harder; MPC_EXT is not intrinsically unimportant.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

## ODATA-09 How do authentication authorization and CSRF differ?

**Level:** Core

**Short answer:** Authentication establishes the caller. Authorization controls what that caller may access or change. CSRF protection mitigates unwanted requests using a user's browser session. SAP Gateway write flows commonly require a fetched CSRF token and matching session context; exact requirements depend on the endpoint and authentication flow.

**Example and follow-up:** For a 403, inspect whether the failure is a missing token, service permission or business authorization. Never fix it by indiscriminately removing checks.

**Avoid this mistake:** CSRF is not a universal OData-standard requirement and a valid token does not grant business permission.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

<details>
<summary>Visual: Identity, authorization and feature control</summary>

![Identity, authorization and feature control](../visuals/security-three-gates.svg)

Treat identity, business permission and contextual availability as separate checks.

**Explain it:** If Submit is disabled in Fiori, what happens when someone calls the service directly?

**Limit:** Static operation characteristics differ from dynamic instance/global feature checks.

</details>

## ODATA-10 How do you design dates media and errors?

**Level:** Advanced

**Short answer:** Preserve the service's protocol-specific date and timestamp types and timezone meaning. Media streams require the appropriate binary endpoints, content type and content handling. Errors need suitable HTTP status, stable codes and useful messages without exposing internals. Classic Gateway and RAP use different implementation contracts.

**Example and follow-up:** Use a date for a date-only business value and a timezone-aware instant for a recorded event. In Gateway use its exception and message-container APIs; in RAP use FAILED and REPORTED appropriately.

**Avoid this mistake:** Edm.Date is a V4 type; do not assume identical date serialization in V2.

**Read and verify this answer:**

- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

## ODATA-11 How do you troubleshoot a slow or failing Fiori request?

**Level:** Advanced

**Short answer:** Capture the failing network request and response, user, timestamp and correlation information. Check service metadata and relevant Gateway or application logs, then trace SQL and ABAP work in an authorized test context. Separate UI rendering, network payload, backend processing and authorization failures.

**Example and follow-up:** A huge $expand can dominate response time even if each SQL statement is fast. Measure request duration, row counts and payload size before changing the model.

**Avoid this mistake:** A working ADT preview does not prove a deployed app's routing, identity, metadata cache and backend authorization are correct.

**Read and verify this answer:**

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

<details>
<summary>Visual: Filtering, paging and total count</summary>

![Filtering, paging and total count](../visuals/query-page-count.svg)

Count and paging answer different questions. Stable ordering matters when the client requests successive pages.

**Explain it:** For this example, what count belongs beside a page of five records?

**Limit:** Provider-side execution order may be optimized while preserving request semantics.

</details>

## ODATA-12 How do you evolve an existing API safely?

**Level:** Advanced

**Short answer:** Treat keys, names, types, operation semantics and error behavior as consumer contracts. Prefer compatible additions where consumers tolerate them, and version breaking changes. Test old consumers and publish a transition plan. A parallel RAP service may coexist with a legacy Gateway service during modernization.

**Example and follow-up:** Renaming a field or changing a key can break saved UI state and integrations. Inventory consumers and retire the old contract only after migration evidence.

**Avoid this mistake:** Building a new RAP service does not automatically migrate an existing V2 client or preserve its semantics.

**Read and verify this answer:**

- [SAP Learning on UI service bindings](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-an-odata-ui-service) - Check protocol version and SAP provider support; the protocol specification does not guarantee implementation support.

## Official references

- [SAP Learning on OData](https://learning.sap.com/courses/building-odata-services-with-sap-gateway/explaining-open-data-protocol-odata-)
- [SAP Learning on UI service bindings](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-an-odata-ui-service)
- [OASIS OData V4 protocol](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html)
