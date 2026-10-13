# Core development mechanisms

Build reliable checks, tests and data flows with small examples. Shared Objects guidance is specific to classic Standard ABAP; verify the release and API contract before using any excerpt.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## DEVCORE-01 How do roles, authorization objects and AUTHORITY-CHECK work together?

**Level:** Core

**Short answer:** An administrator assigns roles that give a user the required authorizations. An authorization object groups the fields to check, such as activity and company. AUTHORITY-CHECK compares the requested values with the current user's authorizations. Check sy-subrc immediately: zero means success; any other result must stop the protected operation. The statement reports the result; your code must enforce it.

**Reasoning and example:** A user may display orders in company 1000 but cannot change them. Checking ACTVT 02 and BUKRS 1000 against the application authorization object fails for that user. The application must then reject the change before it writes anything. Checking display activity 03 would answer the wrong question.

The object and its fields must already exist and match the application security design. Read the organizational value from trusted data, not an unchecked client claim. Do not run another statement that changes sy-subrc before evaluating it. Test an allowed user and a denied user; a hidden button is not the check.

In classic AS ABAP, an administrator maintains authorizations in PFCG roles and generates authorization profiles for assigned users. SAP BTP ABAP environment uses IAM apps, business catalogs and business roles with appropriate restrictions. Administration depends on the product; PFCG is not a universal Cloud setup screen. A role named Approver does not by itself prove that the required field values are present.

In RAP, separately check service access, read restrictions through CDS DCL and operation permissions through global/instance authorization. These layers complement one another. An accessible Fiori tile does not automatically grant every order, and an allowed read does not permit Submit. ADV-02 and TEST-06 explain those boundaries further.

**Avoid this mistake:** AUTHORITY-CHECK only reports its result. Ignoring a nonzero sy-subrc leaves the protected operation open.

**Read and verify this answer:**

- [SAP Learning: AUTHORITY-CHECK](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/using-the-authority-check-statement_a60b8989-12c1-4764-89b2-e168feae035d) - Explains the object fields, immediate sy-subrc evaluation and the application responsibility to deny access. The custom object in the example is an explicit prerequisite.
- [SAP Learning: roles and authorization profiles](https://learning.sap.com/courses/technical-implementation-and-operation-i-of-sap-s-4hana-and-sap-business-suite/maintaining-user-authorizations-with-roles-and-profiles) - Classic AS ABAP role administration; not a universal cloud procedure.
- [SAP BTP ABAP environment: authorization basics](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/authorization-basics) - Business-user IAM apps, catalogs, roles and restrictions; read and operation checks remain distinct.

## DEVCORE-02 When are ABAP Shared Objects useful, and how do you access them safely?

**Level:** Advanced

**Short answer:** In classic ABAP, Shared Objects can hold reusable objects in shared memory on an application server. They are useful for a read-heavy cache, not as a durable work queue. Define the area in SHMA, attach with the required access mode, and detach correctly. Plan rebuilding and invalidation so readers do not rely on stale data.

**Reasoning and example:** Suppose many sessions read the same tax configuration on server A. ATTACH_FOR_READ accesses an available area version. ATTACH_FOR_WRITE creates a new version; ATTACH_FOR_UPDATE copies the active version when versioning is enabled, or attaches to the active version without versioning. Release read handles with DETACH; finish changes using DETACH_COMMIT or discard them with DETACH_ROLLBACK. Handle missing versions and lock conflicts.

If configuration changes from version 4 to 5, readers need an invalidation and rebuild policy. Server B does not automatically share server A's memory contents. Restart or invalidation must not lose the only record of pending business work. DETACH_COMMIT concerns the area handle; it is not a general database COMMIT substitute, and transactional areas have additional rules. This is classic Standard ABAP guidance, not a promise of ABAP Cloud API availability.

**Avoid this mistake:** A cache is replaceable. Do not use application-server shared memory as the only durable record of messages or unfinished transactions.

**Read and verify this answer:**

- [SAP: Access to shared object area instances](https://help.sap.com/saphelp_ewm900/helpdata/en/4a/024f8fa216088ee10000000a421937/content.htm) - Describes read, write and update attachment and detachment. Versioning and transactional-area settings affect the lifecycle.
- [SAP: Shared Objects example](https://help.sap.com/docs/SAP_NETWEAVER_731_BW_ABAP/82df8bac7dc8428bbc4c733e0de4ba60/4a0128aea23736eae10000000a421937.html) - Shows SHMA, the area root and a minimal create/read lifecycle in classic ABAP. Verify the target release and server scope.
- [SAP: Shared Objects introduction](https://help.sap.com/saphelp_gbt10/helpdata/en/4a/0150f7a23736eae10000000a421937/content.htm?no_cache=true) - Defines shared memory on one application server and shared-memory-enabled classes.

## DEVCORE-03 How do you page through changed records without skipping equal timestamps?

**Level:** Advanced

**Short answer:** Use a stable order with a tie-breaker, such as changed_at plus a unique ID. Continue after the last complete pair, not after the timestamp alone. Limit each page and keep a fixed upper boundary for the run. This avoids one common paging gap, but timestamps alone do not guarantee a complete or consistent delta feed.

**Reasoning and example:** Orders 7 and 9 both changed at 09:00; order 10 changed at 09:01. If a page ends at (09:00, 7), the next page must include (09:00, 9), then (09:01, 10). A condition changed_at > 09:00 would lose order 9. Use the same pair in the continuation condition and ORDER BY, and advance the extraction checkpoint after the page and continuation are durably staged atomically, or after downstream confirmation when no durable stage exists. Track staged delivery separately.

A transaction can receive a timestamp before it commits and become visible after the reader has passed that position. Rows may also change between pages. A fixed upper time does not create a database snapshot or capture deletions. For reliable extraction, prefer a supported delta or change-log contract; otherwise define overlap, deduplication, deletion handling and reconciliation from the source guarantees. The accompanying example illustrates ordering on fixed in-memory data only.

**Avoid this mistake:** A timestamp plus ID fixes ties, not late commits. Do not describe keyset paging alone as exactly-once delivery or a consistent snapshot.

**Read and verify this answer:**

- [SAP: ABAP SQL selection and ordering](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md) - Documents ordered selection and row limits. The continuation example and late-commit analysis are a design exercise, not a documented universal SAP delta API.

## DEVCORE-04 When do setup, class_setup and teardown run in ABAP Unit?

**Level:** Core

**Short answer:** setup runs before each test method; teardown runs afterwards. class_setup runs once before the class tests, and class_teardown once after them. Use setup for fresh mutable test data. Keep tests independent of execution order. RISK LEVEL HARMLESS describes the intended risk; it does not turn unsafe code into a sandbox.

**Reasoning and example:** Two tests check a total calculator. setup creates a new input table containing 40 and 60 before each test. One test expects 100. The other clears its input and expects 0. Because each gets fresh data, running the empty-input test first must not break the total test.

Use class_setup for an expensive shared test environment when appropriate, then reset its mutable data in setup. Destroy that environment in class_teardown and release per-test resources in teardown. The example needs no external cleanup because it only uses local memory. A real database write or remote call still needs deliberate isolation; the HARMLESS label does not intercept it.

**Avoid this mistake:** Do not make one test prepare data for another. Shared mutable fixtures and unsafe dependencies remain problems even with RISK LEVEL HARMLESS.

**Read and verify this answer:**

- [SAP: ABAP Unit fixtures and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/14_ABAP_Unit_Tests.md) - Describes the lifecycle methods and test isolation. The small total calculator is an original teaching fixture.
- [SAP: Test attributes](https://help.sap.com/saphelp_gbt10/helpdata/EN/49/25667929ac16b7e10000000a42189d/content.htm?no_cache=true) - Risk declarations control which tests may run; they are not an automatic isolation mechanism.

## DEVCORE-05 How do logs, metrics and traces help explain a failing request?

**Level:** Core

**Short answer:** Logs describe individual events. Metrics summarize measurements, such as request counts and duration. Traces connect the stages of one request across components. Use them together: a metric reveals a pattern, a trace locates a slow stage, and a log explains a specific failure. Correlation IDs connect evidence without recording entire business payloads.

**Reasoning and example:** Request Q7 reads the database quickly, then its HTTP call times out and retries once. A log records the timeout and correlation ID. A retry counter increases by one. A trace with database and HTTP spans shows where the time went. Together they distinguish a slow remote dependency from slow SQL.

Keep metric dimensions bounded, such as operation and outcome; avoid a new series for every request ID. Put suitable IDs in logs or traces instead, with access controls and redaction. Distinguish event time from the time telemetry was observed or collected: delayed delivery must not make yesterday's failure look like today's new event.

**Avoid this mistake:** Logging every payload creates noise and can expose secrets. A request ID is useful for correlation but usually a poor metric dimension.

**Read and verify this answer:**

- [OpenTelemetry: Signals](https://opentelemetry.io/docs/concepts/signals/) - Defines the roles of logs, metrics and traces. The ABAP request scenario is an original example, independent of a particular monitoring product.
- [OpenTelemetry: Metrics](https://opentelemetry.io/docs/concepts/signals/metrics/) - Explains aggregated measurements and attributes; choose bounded dimensions for application metrics.
- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/) - Explains spans and the request path; actual tracing support depends on the system instrumentation.
- [OpenTelemetry: Log timestamps](https://opentelemetry.io/docs/specs/otel/logs/data-model/) - Distinguishes the event Timestamp from ObservedTimestamp.

## Official references

- [SAP Learning: AUTHORITY-CHECK](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/using-the-authority-check-statement_a60b8989-12c1-4764-89b2-e168feae035d)
- [SAP: Access to shared object area instances](https://help.sap.com/saphelp_ewm900/helpdata/en/4a/024f8fa216088ee10000000a421937/content.htm)
- [SAP: Shared Objects example](https://help.sap.com/docs/SAP_NETWEAVER_731_BW_ABAP/82df8bac7dc8428bbc4c733e0de4ba60/4a0128aea23736eae10000000a421937.html)
- [SAP: ABAP SQL selection and ordering](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)
- [SAP: ABAP Unit fixtures and examples](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/14_ABAP_Unit_Tests.md)
- [SAP: Test attributes](https://help.sap.com/saphelp_gbt10/helpdata/EN/49/25667929ac16b7e10000000a42189d/content.htm?no_cache=true)
- [OpenTelemetry: Signals](https://opentelemetry.io/docs/concepts/signals/)
- [OpenTelemetry: Metrics](https://opentelemetry.io/docs/concepts/signals/metrics/)
- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [SAP: Shared Objects introduction](https://help.sap.com/saphelp_gbt10/helpdata/en/4a/0150f7a23736eae10000000a421937/content.htm?no_cache=true)
- [OpenTelemetry: Log timestamps](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
- [SAP Learning: roles and authorization profiles](https://learning.sap.com/courses/technical-implementation-and-operation-i-of-sap-s-4hana-and-sap-business-suite/maintaining-user-authorizations-with-roles-and-profiles)
- [SAP BTP ABAP environment: authorization basics](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/authorization-basics)
