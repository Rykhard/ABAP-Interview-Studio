# IDoc, ALE, AIF, and interface operations

Follow an integration message from business intent through routing, validation, posting, and recovery. IDoc is a structured message and processing technology; AIF supplies interface processing and operational capabilities for configured scenarios rather than replacing the transport. Classic transaction examples apply only where available; AIF capabilities, installed content, and usage rights depend on the product and contract.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## INTF-01 What does an IDoc contain, and how do message type, basic type, and extension differ?

**Level:** Core

**Short answer:** An IDoc contains a control record identifying routing and message characteristics, data records holding segment payloads, and status records documenting processing. The message type expresses business meaning. The basic type defines the standard segment structure, while an extension adds supported customer segments. These concepts must agree with sender, receiver, and application processing capabilities.

**Example and follow-up:** For an order-related message, the control record describes what is being sent and which structure applies. Adding a custom segment requires compatible generation, interpretation, and mapping; declaring an extension alone does not populate or process its values.

**Avoid this mistake:** The message type is not the same as the basic type, and the IDoc document number is not automatically the target business document number.

**Read and verify this answer:**

- [SAP IDoc control record, message type, basic type, and extension](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/78/2177f051ce11d189570000e829fbbd/content.htm) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-02 What do ALE distribution models, partner profiles, ports, and process codes do?

**Level:** Core

**Short answer:** ALE models describe configured distribution relationships. Partner profiles specify how particular partners and messages are processed; ports describe technical communication endpoints or mechanisms. Inbound process codes select the relevant processing implementation. I trace these settings together with logical-system identities and destination configuration rather than assuming a correctly formatted IDoc will automatically reach the right application.

**Example and follow-up:** Classic investigation may inspect WE20 partner profiles, WE21 ports, and an applicable BD64 distribution model. Not every scenario uses the same model-driven routing. A partner is a logical or business identity; a port and an RFC destination describe different technical configuration roles.

**Avoid this mistake:** A successful connection test proves neither correct partner-profile matching nor that the selected inbound process can post the payload.

**Read and verify this answer:**

- [SAP IDoc partner and port configuration](https://help.sap.com/saphelp_em92/helpdata/en/ab/de498318194eedab42bca77226ebc3/content.htm) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-03 Walk through outbound and inbound IDoc processing.

**Level:** Core

**Short answer:** Outbound processing starts from an application trigger, constructs the message, determines its recipient, and dispatches it through the configured port. Inbound processing receives the IDoc, checks routing and syntax, selects the application processor, and records its outcome. Immediate versus collected or background processing changes when each stage happens, so I monitor the full chain.

**Example and follow-up:** An outbound trigger may come from application output, change pointers, or an explicit application API, depending on the scenario. A received IDoc can exist in the receiver before business posting occurs. Sender and receiver logs must be correlated rather than assumed to share one identifier.

**Avoid this mistake:** Creation, dispatch, receipt, and business posting are separate milestones; success at one does not establish success at all later stages.

**Read and verify this answer:**

- [SAP IDoc partner and port configuration](https://help.sap.com/saphelp_em92/helpdata/en/ab/de498318194eedab42bca77226ebc3/content.htm) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-04 How do you interpret common IDoc statuses without overstating success?

**Level:** Core

**Short answer:** I interpret status with direction, history, and detailed application messages. Common inbound statuses include 51 for an application posting error, 53 for an application document posted, and 64 for readiness to transfer to the application. Outbound status 03 means data was passed to the port; it does not prove successful business posting in the receiver.

**Example and follow-up:** Outbound 30 commonly means ready for dispatch. An inbound 53 is still evidence about that configured processing step, not every downstream business process. Check linked document references and scenario-specific acknowledgments when the requirement is end-to-end confirmation.

**Avoid this mistake:** Do not treat every low-numbered status as failure or map an outbound success code directly to an inbound business success guarantee.

**Read and verify this answer:**

- [SAP IDoc communication status and application outcome](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-05 How would you investigate an IDoc that is missing or has failed?

**Level:** Core

**Short answer:** I start with sender, receiver, message type, business key, and time, then locate the IDoc and inspect its control data, segments, and status history. I separate generation, routing, transport, syntax, and application failures. Classic tools such as WE02 or WE05 support inspection; communication and application monitors explain failures beyond the IDoc record itself.

**Example and follow-up:** If the sender shows dispatch but the receiver has no IDoc, investigate the technical channel and relevant RFC or middleware queue. If the receiver has status 51, inspect the application error, master data, mapping, and authorizations before changing connectivity settings.

**Avoid this mistake:** Repeatedly testing a destination will not fix an application validation error, and an empty IDoc search may simply use the wrong partner or time range.

**Read and verify this answer:**

- [SAP IDoc partner and port configuration](https://help.sap.com/saphelp_em92/helpdata/en/ab/de498318194eedab42bca77226ebc3/content.htm) - Verify the owning interface configuration and business outcome, not only technical message status.
- [SAP IDoc communication status and application outcome](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-06 How do you reprocess an IDoc without creating duplicate business documents?

**Level:** Advanced

**Short answer:** I identify and correct the root cause, confirm whether any business effect already occurred, and choose the supported reprocessing path for that status and scenario. I preserve correlation and audit history and verify the result after retry. Duplicate prevention should use a stable business identity or application contract, not only an assumption about the technical message number.

**Example and follow-up:** BD87 supports classic status-based reprocessing where appropriate. Recreating a message or using a test copy can produce a new technical identity and bypass duplicate protection tied only to the original one. A partial or uncertain outcome needs reconciliation before another posting attempt.

**Avoid this mistake:** Changing a status to look successful, or creating another IDoc blindly, does not repair the original error and may duplicate its business effect.

**Read and verify this answer:**

- [SAP IDoc communication status and application outcome](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-07 What is SAP Application Interface Framework, and what is it not?

**Level:** Core

**Short answer:** AIF provides configurable interface processing, monitoring, and error-handling capabilities so technical and business users can investigate messages in a meaningful context. Depending on the scenario, it can organize mappings, checks, actions, and recovery. It does not replace the underlying transport or automatically monitor every interface. Availability, delivered content, and custom-development usage rights must be verified.

**Example and follow-up:** SAP distinguishes full custom-interface use from limited runtime rights supplied with particular products. Seeing an AIF monitor in a system does not establish permission to build arbitrary custom AIF interfaces. Confirm the target product's current scope and the customer's entitlement before proposing that implementation.

**Avoid this mistake:** AIF is not a substitute for RFC, IDoc, OData, or middleware, and its presence does not establish unrestricted licensing or identical cloud capabilities.

**Read and verify this answer:**

- [SAP AIF monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html) - Verify the owning interface configuration and business outcome, not only technical message status.
- [SAP AIF licensing and limited runtime usage distinction](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK/2af43ee5f65347c0bedf7901497ad5d1/0742ccdcf7ca41919972b5349ce018fa.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-08 How do AIF structure mappings, value mappings, checks, and actions work together?

**Level:** Advanced

**Short answer:** Structure mapping transforms the message shape, while value mapping translates business codes between representations. Checks validate applicable conditions, and actions perform configured processing such as calling application logic. I separate these responsibilities, version their contracts, and preserve useful error context. The actual execution sequence and underlying engine depend on the configured interface.

**Example and follow-up:** An external company code may map to an internal company code, then be checked before an application posting action. A missing mapping should identify the source value and responsible owner. An action must respect the application's commit, authorization, and duplicate-handling rules.

**Avoid this mistake:** Passing AIF checks does not replace the target application's business validation, and arbitrary commits inside processing actions can break coordinated recovery.

**Read and verify this answer:**

- [SAP AIF monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html) - Verify the owning interface configuration and business outcome, not only technical message status.
- [SAP AIF: Interface Creation](https://help.sap.com/docs/ABAP_PLATFORM_NEW/4db1676c3f114f119b500bd80ccd944d/f0d1b60ff43c45efad71398b1214db04.html?locale=en-US&state=PRODUCTION&version=202110.latest) - Release-specific reference for structure mappings, value mappings, checks and actions. Verify the configured interface and processing engine.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-09 How would you configure useful and secure AIF monitoring?

**Level:** Advanced

**Short answer:** I expose meaningful business keys for searching, assign responsibility and alerts to the correct recipients, and provide enough context to distinguish mapping, validation, and technical failures. Authorization must separate viewing, editing, restarting, and canceling messages. In classic AIF, controls can be scoped by namespace, interface, version, and activity; applicable field restrictions must also be considered.

**Example and follow-up:** A business operator may need to inspect a failed cost-center mapping but should not automatically receive access to every payload or permission to edit amounts. Transactions such as /AIF/IFMON and /AIF/ERR are relevant where installed; cloud monitoring uses its supported apps and roles.

**Avoid this mistake:** Recipient assignment or visibility in a monitor is not a replacement for authorization, and broad payload access can expose sensitive business information.

**Read and verify this answer:**

- [SAP AIF error-handling authorization](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK/2af43ee5f65347c0bedf7901497ad5d1/15191356b594612de10000000a441470.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-10 What must you establish before resubmitting or editing a message in AIF?

**Level:** Advanced

**Short answer:** I establish which engine owns the message, what processing already succeeded, which fields may be corrected, and what the configured restart operation actually repeats. After correcting the cause, an authorized resubmission must follow that ownership and preserve the audit trail. I do not assume every AIF interface persists or restarts data in exactly the same way.

**Example and follow-up:** An interface using underlying IDoc processing and an interface using AIF-controlled actions can have different restart behavior. Avoid concurrent retries from both the underlying technical monitor and AIF. Verify the target document and message status after a retry, especially following a timeout.

**Avoid this mistake:** AIF resubmission does not roll back an earlier committed document and is not automatically equivalent to creating a new business request.

**Read and verify this answer:**

- [SAP AIF monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-11 When would you use OData, IDoc, or AIF?

**Level:** Core

**Short answer:** OData is an HTTP-based service protocol useful for supported queries and business operations, including UI and system integration. IDoc provides structured messages and established asynchronous application integration scenarios. AIF adds processing and operational capabilities around supported interfaces. They address different concerns and can coexist; I choose the business contract and delivery model before selecting monitoring.

**Example and follow-up:** A UI reading current request status may use OData while an established partner sends order messages as IDocs. AIF can support operational error handling where the integration is configured for it. Replacing one technology solely because another is newer ignores available contracts and recovery needs.

**Avoid this mistake:** AIF is not a third wire protocol, OData is not limited to UI use, and IDoc is not restricted to batch-only dispatch.

**Read and verify this answer:**

- [SAP AIF monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## INTF-12 What security and end-to-end tests would you require for an IDoc or AIF interface?

**Level:** Advanced

**Short answer:** I test identity, technical and business authorization, allowed data scope, validation, and safe logging, then exercise the full path to the target business effect. Recovery tests cover duplicates, malformed segments, missing mappings, unavailable targets, ordering dependencies, and partial or uncertain outcomes. Reconciliation must compare business counts and values, not only green monitor statuses.

**Example and follow-up:** Use controlled test data to replay a request after a simulated lost response and confirm that it does not create another document. Also test an unauthorized operator attempting payload changes or resubmission. Keep monitoring evidence linked to the business key, interface version, and execution time.

**Avoid this mistake:** A mock transport or successful technical acknowledgment does not verify the real receiver's persistence, authorization, duplicate handling, or operational recovery.

**Read and verify this answer:**

- [SAP AIF error-handling authorization](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK/2af43ee5f65347c0bedf7901497ad5d1/15191356b594612de10000000a441470.html) - Verify the owning interface configuration and business outcome, not only technical message status.

<details>
<summary>Visual: IDoc processing and AIF operations</summary>

![IDoc processing and AIF operations](../visuals/idoc-aif-lifecycle.svg)

Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.

**Explain it:** Before restarting an error, how would you check whether a document already exists?

**Limit:** Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.

</details>

## Official references

- [SAP IDoc control record, message type, basic type, and extension](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/78/2177f051ce11d189570000e829fbbd/content.htm)
- [SAP IDoc partner and port configuration](https://help.sap.com/saphelp_em92/helpdata/en/ab/de498318194eedab42bca77226ebc3/content.htm)
- [SAP IDoc communication status and application outcome](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html)
- [SAP AIF monitoring and error handling](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/19d48293097f4a2589433856b034dfa5/0e8f002ea0894c51bd957168699669c5.html)
- [SAP AIF error-handling authorization](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK/2af43ee5f65347c0bedf7901497ad5d1/15191356b594612de10000000a441470.html)
- [SAP AIF licensing and limited runtime usage distinction](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK/2af43ee5f65347c0bedf7901497ad5d1/0742ccdcf7ca41919972b5349ce018fa.html)
