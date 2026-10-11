# HTTP, REST, JSON and XML

Explain the protocol, architectural style and payload independently. Practice concrete requests, payload edge cases and ABAP integration failure handling.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## HTTP-01 What is the difference between HTTP, REST, OData and a payload format?

**Level:** Core

**Short answer:** HTTP supplies request/response semantics. REST is an architectural style with constraints such as stateless interactions and a uniform interface. OData specifies conventions for data services. JSON and XML represent data; neither makes an endpoint RESTful.

**Example and follow-up:** Explain four separate choices for an order API: transport semantics, architectural constraints, service conventions, and representation. In REST, stateless means each request carries the context needed to understand it, not that business data cannot persist.

**Avoid this mistake:** Do not use REST, HTTP and JSON as interchangeable names.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [REST constraints: Fielding dissertation](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: HTTP request and response anatomy</summary>

![HTTP request and response anatomy](../visuals/http-message-anatomy.svg)

Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.

**Explain it:** Which header describes the returned body, and which requests a response format?

**Limit:** A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.

</details>

## HTTP-02 What is inside an HTTP request and response?

**Level:** Core

**Short answer:** A request identifies a method and target, carries headers, and may contain a body. A response carries a status, headers and optional content. HTTPS adds transport protection; the business contract still determines what the operation means.

**Example and follow-up:** For an order update, inspect the target resource, method, credentials, Content-Type, conditional headers, body and resulting status. The familiar HTTP/1.1 text layout is a teaching model; HTTP/2 and HTTP/3 frame messages differently.

**Avoid this mistake:** A successful TCP/TLS connection does not prove that the business request succeeded.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: HTTP request and response anatomy</summary>

![HTTP request and response anatomy](../visuals/http-message-anatomy.svg)

Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.

**Explain it:** Which header describes the returned body, and which requests a response format?

**Limit:** A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.

</details>

## HTTP-03 How do GET, POST, PUT, PATCH and DELETE differ?

**Level:** Core

**Short answer:** GET retrieves a representation. POST submits content for resource-specific processing. PUT creates or replaces the state of the identified target under its contract. PATCH applies a described modification. DELETE requests removal of the target resource association.

**Example and follow-up:** For a partial update, inspect the accepted patch document or service-specific update contract. An omitted field, an explicit null and an empty string can mean different things. PATCH is not inherently idempotent; a particular patch can be designed to be.

**Avoid this mistake:** Do not treat PUT as an arbitrary partial update or assume that every POST creates exactly one row.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [PATCH method: IETF RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html) - Defines PATCH, including its relationship to PUT and the conditions under which a patch can be idempotent.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

## HTTP-04 What do safe and idempotent mean, and how do they affect retries?

**Level:** Advanced

**Short answer:** Safe methods have read-oriented requested semantics. Idempotency concerns the intended effect of repeated identical requests, not identical response codes. PUT and DELETE are idempotent by their HTTP semantics; POST and PATCH need specific application guarantees for safe repetition.

**Example and follow-up:** After a timeout on CreateOrder, the client may not know whether the server committed. Use a documented idempotency mechanism or query a stable business correlation before retrying. Repeated DELETE can return different statuses while the final resource state remains absent.

**Avoid this mistake:** Do not blindly retry a potentially committed business creation because the response was lost.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [PATCH method: IETF RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

## HTTP-05 Which HTTP statuses should an ABAP API developer explain?

**Level:** Core

**Short answer:** Distinguish 200 success, 201 creation, 202 accepted but not completed, and 204 success without response content. Typical failures include 400 invalid request, 401 missing or invalid authentication, 403 refusal, 404 unavailable resource, 409 conflict, 412 failed precondition and 415 unsupported media type.

**Example and follow-up:** A 429 or 503 can justify a bounded delayed retry under the service contract, sometimes using Retry-After. A 500 needs diagnosis. Record a correlation identifier and inspect the business error payload without exposing credentials. For asynchronous 202, explain how the caller learns the eventual outcome.

**Avoid this mistake:** HTTP 200 on a batch envelope does not prove every contained operation succeeded.

**Read and verify this answer:**

- [HTTP status reference: MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: HTTP request and response anatomy</summary>

![HTTP request and response anatomy](../visuals/http-message-anatomy.svg)

Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.

**Explain it:** Which header describes the returned body, and which requests a response format?

**Limit:** A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.

</details>

## HTTP-06 How do Accept and Content-Type differ?

**Level:** Core

**Short answer:** Content-Type describes the representation actually carried in a message. Accept states which response media types the client can handle. They are separate from authentication and from the URL of the resource.

**Example and follow-up:** A client can send application/json and request an application/json response. A server can reject unsupported request content with 415 or an unacceptable response representation with 406. Always inspect the actual response type before deserializing an error page as business JSON.

**Avoid this mistake:** Changing Content-Type does not convert an XML body into JSON.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: HTTP request and response anatomy</summary>

![HTTP request and response anatomy](../visuals/http-message-anatomy.svg)

Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.

**Explain it:** Which header describes the returned body, and which requests a response format?

**Limit:** A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.

</details>

## HTTP-07 What must you preserve when mapping JSON to ABAP?

**Level:** Core

**Short answer:** JSON supports objects, arrays, strings, numbers, booleans and null. Preserve the API contract for property names, missing versus null values, number precision and ordered array entries. Do not depend on object member ordering or duplicate member names.

**Example and follow-up:** Model an identifier such as "0004711" as a string. Decide deliberately whether a monetary value is represented as a decimal number or a string under the contract; retain currency and precision. Standard JSON has no native date type, comments, NaN or Infinity.

**Avoid this mistake:** Do not coerce every missing or null property into the same initial ABAP value without considering update semantics.

**Read and verify this answer:**

- [JSON format: IETF RFC 8259](https://www.rfc-editor.org/rfc/rfc8259) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [SAP JSON transformations](https://help.sap.com/docs/abap-cloud/abap-keyword/json-transformations-abencall_trafo_json_abexa) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

<details>
<summary>Visual: EML update intent: absent versus clear</summary>

![EML update intent: absent versus clear](../visuals/senior-control-presence.svg)

The first two requests carry the same initial ABAP value but differ in update intent. The field control decides whether the old comment is preserved or explicitly cleared.

**Explain it:** How would you preserve Amount while clearing Comment, and how could an adapter lose that distinction?

**Limit:** This is a worked mapping example. Actual generated EML types, UPDATE FIELDS syntax, protocol nullability, and business validation remain authoritative.

</details>

## HTTP-08 What XML concepts matter in an integration interview?

**Level:** Core

**Short answer:** XML is a structured representation with elements, attributes and nested content. Well-formedness checks syntax; schema validation checks additional declared constraints. A namespace is identified by its namespace URI. An element or attribute's expanded name combines its namespace name, if any, with its local name; the chosen prefix spelling is only an alias.

**Example and follow-up:** Two partners can use different prefixes for the same namespace, so parse by expanded name. A default namespace applies to unprefixed element names, not unprefixed attribute names. An empty element, an absent element and an explicit schema-defined nil value may differ. Escaping, encoding and parser security settings belong to the implementation contract.

**Avoid this mistake:** Do not process arbitrary XML with string splitting or assume that well-formed XML is business-valid.

**Read and verify this answer:**

- [XML specification: W3C](https://www.w3.org/TR/xml/) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [SAP sXML parsing](https://help.sap.com/docs/abap-cloud/abap-keyword/sxml-parsing) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.
- [W3C Namespaces in XML](https://www.w3.org/TR/xml-names/) - Sections 2.1 and 6.2 distinguish namespace identity, expanded names and default namespace behavior for elements and attributes.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

## HTTP-09 How do you choose ABAP JSON and XML processing tools?

**Level:** Advanced

**Short answer:** Choose a serializer/parser or transformation supported and released in the target environment. CALL TRANSFORMATION, the sXML interfaces and applicable JSON libraries solve different mapping and streaming needs. Verify naming rules, types and error handling with representative payloads.

**Example and follow-up:** The identity transformation uses canonical ABAP representations such as asXML/asJSON; that is not automatically the same shape as an arbitrary partner API. For a large XML stream, compare a serial parser with a full DOM approach. Avoid manual concatenation of unescaped values.

**Avoid this mistake:** Do not promise that a familiar on-premise helper class is released for ABAP Cloud.

**Read and verify this answer:**

- [SAP JSON transformations](https://help.sap.com/docs/abap-cloud/abap-keyword/json-transformations-abencall_trafo_json_abexa) - SAP transformation/parsing background. Verify API release eligibility in ADT for the target ABAP language version; documentation presence alone is not a release guarantee.
- [SAP sXML parsing](https://help.sap.com/docs/abap-cloud/abap-keyword/sxml-parsing) - SAP transformation/parsing background. Verify API release eligibility in ADT for the target ABAP language version; documentation presence alone is not a release guarantee.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

<details>
<summary>Visual: EML update intent: absent versus clear</summary>

![EML update intent: absent versus clear](../visuals/senior-control-presence.svg)

The first two requests carry the same initial ABAP value but differ in update intent. The field control decides whether the old comment is preserved or explicitly cleared.

**Explain it:** How would you preserve Amount while clearing Comment, and how could an adapter lose that distinction?

**Limit:** This is a worked mapping example. Actual generated EML types, UPDATE FIELDS syntax, protocol nullability, and business validation remain authoritative.

</details>

## HTTP-10 How would you implement and troubleshoot an outbound HTTP call in ABAP?

**Level:** Advanced

**Short answer:** Use the permitted destination and HTTP client APIs, configure credentials outside source, send the contractually correct request, handle transport exceptions and HTTP failures separately, then deserialize and validate the response. Apply timeouts and an explicit retry policy.

**Example and follow-up:** In a suitable ABAP Cloud environment, released HTTP destination/client APIs and communication configuration establish the boundary; classic landscapes may use other client APIs. Diagnose DNS, TLS trust, destination, authentication, headers, payload and application logs in order. Redact secrets and sensitive business data.

**Avoid this mistake:** Do not hard-code a password, suppress all exceptions, or assume a remote call shares the local rollback.

**Read and verify this answer:**

- [SAP ABAP integration and connectivity](https://help.sap.com/doc/92f2c1b209a243639a63769070b0dd58/s4hana_cloud/en-US/6e28a25c7dcd4aa395328b1784736547.pdf) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: HTTP request and response anatomy</summary>

![HTTP request and response anatomy](../visuals/http-message-anatomy.svg)

Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.

**Explain it:** Which header describes the returned body, and which requests a response format?

**Limit:** A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.

</details>

## HTTP-11 How do authentication, authorization, CORS and CSRF differ?

**Level:** Core

**Short answer:** Authentication establishes identity and authorization governs permitted actions. CORS is a browser-enforced cross-origin access mechanism. CSRF defenses address forged requests in relevant credential-bearing browser flows. These mechanisms solve different problems.

**Example and follow-up:** An HTTP call working in an ABAP backend but failing in a browser can involve CORS or preflight handling. Conversely, allowing an origin does not authorize its users to approve orders. Never fix a CORS issue by removing business authorization checks.

**Avoid this mistake:** CORS is not a general server-to-server firewall or a replacement for authentication.

**Read and verify this answer:**

- [CORS: MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

## HTTP-12 How would you test an HTTP integration contract?

**Level:** Advanced

**Short answer:** Test both structure and behavior: valid payload, malformed input, missing/null fields, precision, time zones, unexpected content type, business errors, expired credentials, timeouts, duplicate requests and concurrency. Include the real destination and authorization setup in integration tests.

**Example and follow-up:** Use a controlled double for deterministic error cases, then a target-system check for actual TLS, identity, serialization and service behavior. A creation timeout test should verify that retry does not create a second business document. Preserve a redacted request, correlation and outcome as evidence.

**Avoid this mistake:** A serializer round-trip test alone does not prove that the partner accepts your representation.

**Read and verify this answer:**

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) - Use the protocol or format contract to verify semantics independently of the ABAP implementation.

<details>
<summary>Visual: JSON and XML: values and mapping</summary>

![JSON and XML: values and mapping](../visuals/json-xml-values.svg)

These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.

**Explain it:** What could go wrong if an ABAP mapper converts the identifier to an integer?

**Limit:** XML namespace/schema rules and JSON API types must be defined by the actual interface contract.

</details>

## Official references

- [HTTP semantics: IETF RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [PATCH method: IETF RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html)
- [HTTP status reference: MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [JSON format: IETF RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)
- [XML specification: W3C](https://www.w3.org/TR/xml/)
- [REST constraints: Fielding dissertation](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [CORS: MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [SAP JSON transformations](https://help.sap.com/docs/abap-cloud/abap-keyword/json-transformations-abencall_trafo_json_abexa)
- [SAP sXML parsing](https://help.sap.com/docs/abap-cloud/abap-keyword/sxml-parsing)
- [SAP ABAP integration and connectivity](https://help.sap.com/doc/92f2c1b209a243639a63769070b0dd58/s4hana_cloud/en-US/6e28a25c7dcd4aa395328b1784736547.pdf)
