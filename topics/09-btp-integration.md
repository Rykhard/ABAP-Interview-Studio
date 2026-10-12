# BTP and cloud integration for ABAP developers

Focus on what an ABAP developer must design, configure or troubleshoot. Separate the ABAP development model from its hosting location, and distinguish Cloud Foundry app mechanics from the managed ABAP environment.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## BTP-01 What is BTP and how is ABAP Cloud different?

**Level:** Core

**Short answer:** SAP BTP provides services for building apps, connecting systems and handling data. ABAP Cloud is a way of developing ABAP with allowed language features and released APIs. You can use that model in BTP ABAP environment and supported S/4HANA systems. BTP is therefore a platform; ABAP Cloud describes how you develop.

**Reasoning and example:** A team wants a supplier portal separate from its ERP system. It might build the ABAP part in BTP ABAP environment and call a released ERP API. Another team needs a field and validation close to an S/4HANA document. It might use ABAP Cloud directly in that supported S/4HANA system instead.

Both teams follow ABAP Cloud rules, but their applications run in different places. That difference matters for latency, identity and transactions. BTP ABAP environment is a managed ABAP system with its own development and delivery tools. It is not a regular Cloud Foundry application that you deploy with cf push.

**Avoid this mistake:** Do not call BTP ABAP simply a normal application container deployed with cf push.

**Read and verify this answer:**

- [SAP ABAP Cloud FAQ](https://pages.community.sap.com/topics/abap/abap-cloud-faq) - Check where the app runs, which user it calls as and how it connects.

<details>
<summary>Visual: Extension placement decision</summary>

![Extension placement decision](../visuals/extensibility-decision.svg)

Start from the business need and transaction boundary before choosing an extension location.

**Explain it:** When would local transactional consistency favor an on-stack extension?

**Limit:** Placement does not establish Clean Core level or availability in a specific edition.

</details>

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## BTP-02 How do global accounts subaccounts entitlements and spaces relate?

**Level:** Core

**Short answer:** A global account is the top-level place for managing your BTP use. Subaccounts separate applications and administration, for example by region or environment. Entitlements say which services and quotas you can use. For Cloud Foundry apps, organizations and spaces organize deployment. These layers have different jobs, so I check them separately when something cannot be created.

**Reasoning and example:** A developer wants to create a service in a test subaccount but cannot find the required plan. I check whether the global account has that entitlement and whether enough quota was assigned to the subaccount. I also check that the service is available in the selected region and that the developer has the necessary role.

If it is a Cloud Foundry application, I then check its organization and space. I do not apply that same space-based procedure to every BTP service. An entitlement permits consumption; it does not mean a running service instance already exists. The actual creation steps depend on the selected service and account setup.

**Avoid this mistake:** An entitlement is not a runtime container, and every BTP service does not require the same CF-space workflow.

**Read and verify this answer:**

- [SAP BTP documentation](https://help.sap.com/docs/btp) - This is a documentation starting point, not proof of every statement. Find the named feature for your target release. The example decision and test plan are original study guidance.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## BTP-03 What is the difference between IaaS PaaS and SaaS?

**Level:** Core

**Short answer:** The difference is how much you operate yourself. With IaaS, you receive infrastructure and manage more of the software above it. With PaaS, the provider runs an application platform and you build on it. With SaaS, you use an existing application. In each case, I check who manages security, configuration and data.

**Reasoning and example:** Imagine a business needs an approval solution. With infrastructure services, its team may have to manage the operating system and application runtime before building the solution. A managed application platform removes much of that runtime work, but the team still develops and maintains its own approval code. A ready-made business application supplies the business capability itself.

A managed ABAP environment is a useful platform example: developers work within the available ABAP services and rules. They still own their custom application's behavior and access setup. SAP HANA Cloud is a managed database service, so I would not describe it as a finished business application simply because it is delivered as a service.

**Avoid this mistake:** SAP HANA Cloud is a managed database service, not a generic example of a finished business SaaS application.

**Read and verify this answer:**

- [SAP BTP documentation](https://help.sap.com/docs/btp) - This is a documentation starting point, not proof of every statement. Find the named feature for your target release. The example decision and test plan are original study guidance.

## BTP-04 What are a service instance binding and service key?

**Level:** Core

**Short answer:** A service instance is a service resource you have created. A binding connects an application to that resource and gives it the required connection information. A service key supplies credentials for a supported external-client use case. These are different objects; creating a binding does not always create a separate service key.

**Reasoning and example:** Suppose a Cloud Foundry app needs a database service. I create the supported service instance and bind the app to it. The app reads the supplied connection settings rather than keeping a password in source code. In Cloud Foundry, this information is commonly available through VCAP_SERVICES, though other delivery methods exist.

An external tool may instead need a service key if that service supports the use case. I protect and rotate those credentials too. When a binding changes, I check whether the app needs a restart or restage to use the new settings. A local default-env.json file is a development convention, not the universal way Cloud Foundry delivers credentials.

**Avoid this mistake:** default-env.json is a local development convention, not the universal Cloud Foundry credential transport.

**Read and verify this answer:**

- [Cloud Foundry service bindings](https://docs.cloudfoundry.org/devguide/services/application-binding.html) - Check where the app runs, which user it calls as and how it connects.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## BTP-05 What do containers buildpacks droplets and routes do?

**Level:** Advanced

**Short answer:** In Cloud Foundry, a buildpack prepares an app with the runtime it needs. Staging produces a runnable package called a droplet. Containers run isolated app instances, and routes send requests to them. One app can have several instances. Reliability still depends on those instances and the services they need, not just on having a container.

**Reasoning and example:** A Java app is staged with a suitable buildpack, which prepares the runtime and application package. Two app instances then run that package. A route lets users reach the app without knowing which instance handles their request. If one instance fails, the design needs enough healthy capacity and working dependencies to keep serving users.

During blue-green deployment, traffic moves from the old version to the new one. I still check database compatibility and what happens to requests already running on the old version. Changing a route does not repair an incompatible database change. A container is also not the same as a full virtual machine.

**Avoid this mistake:** A container is not a standalone virtual machine, and one application does not always mean exactly one container.

**Read and verify this answer:**

- [Cloud Foundry: how applications are staged](https://docs.cloudfoundry.org/devguide/deploy-apps/how-applications-are-staged.html) - Explains Cloud Foundry buildpacks, staging and droplets. Managed ABAP environment uses a different deployment model. The page could not be retrieved during the earlier review; use official documentation navigation if this link has moved.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## BTP-06 What do destinations and Cloud Connector solve?

**Level:** Core

**Short answer:** A destination stores connection and authentication settings for a service call. Cloud Connector allows configured cloud access to selected on-premise resources. Together they help an app reach the backend without putting passwords in code. I still check the caller's permissions and the API's release status. Connectivity alone does not make an internal SAP API supported.

**Reasoning and example:** A BTP app needs to read orders from an on-premise system. I check the destination, the configured Cloud Connector connection and the specific resource exposed through it. Then I verify the certificate or token and the user's backend permissions. A connection can be technically available while the business request is still forbidden.

When troubleshooting, I locate the failing step instead of changing all settings at once. Cloud Connector exposes configured resources; it is not an unrestricted opening into the entire company network. I also confirm that the chosen order API is allowed for this extension. A successful request to an internal endpoint is not proof that SAP supports that use.

**Avoid this mistake:** Cloud Connector is not simply an unrestricted inbound opening of the entire corporate network.

**Read and verify this answer:**

- [SAP BTP documentation](https://help.sap.com/docs/btp) - This is a documentation starting point, not proof of every statement. Find the named feature for your target release. The example decision and test plan are original study guidance.

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

## BTP-07 How do remote transactions differ from local RAP transactions?

**Level:** Advanced

**Short answer:** A remote API usually saves data in a separate transaction. If my local RAP transaction rolls back, the remote system may still keep its change. I therefore plan how to find the original result, retry safely and handle partial success. A timeout means the outcome may be unknown; it does not prove the remote operation failed.

**Reasoning and example:** Our app asks a remote payment service to create a payment. The service creates it, but the response is lost. If we simply send a new creation request, we may pay twice. I use the service's documented idempotency mechanism, meaning the same request identifier reuses the original business effect, or query the payment by a stable reference.

The local app keeps a recoverable pending or uncertain status until it knows the result. If one side succeeds and the other cannot complete, a supported cancellation or other compensating business step may be needed. Calling HTTP inside a RAP action does not make the two systems share one rollback.

**Avoid this mistake:** Calling HTTP inside an action does not make the remote change part of the local RAP database transaction.

**Read and verify this answer:**

- [SAP BTP documentation](https://help.sap.com/docs/btp) - This is a documentation starting point, not proof of every statement. Find the named feature for your target release. The example decision and test plan are original study guidance.

<details>
<summary>Visual: OData batch envelope and atomic groups</summary>

![OData batch envelope and atomic groups](../visuals/odata-batch-envelope.svg)

The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.

**Explain it:** If a later independent group fails, must an earlier successful group be rolled back?

**Limit:** Conceptual grouping, not an exact multipart or JSON batch payload.

</details>

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

## BTP-08 What makes event-driven integration reliable?

**Level:** Advanced

**Short answer:** Reliable event handling assumes messages can be delayed or delivered again. I publish events in a way that matches committed business data and use durable delivery when needed. The consumer remembers a stable event or business identifier so repeating a message does not repeat the effect. I also define retries and how failed messages reach an operator.

**Reasoning and example:** An order submission should start one approval workflow. If an event is delivered twice, the consumer checks the request and event identifiers and finds the workflow already started. It must not create another process just because the transport delivered another copy. The publication mechanism must also avoid announcing a submission that later rolls back.

I test a temporary outage, a duplicate delivery and a message that repeatedly fails. After bounded retries, the failed message needs a visible recovery path, such as a dead-letter queue where supported. Ordering and retention depend on the configured broker and protocol. I do not promise global ordering or exactly-once business processing without proving the complete design.

**Avoid this mistake:** Do not promise exactly-once end-to-end processing or global ordering without a specific proven design.

**Read and verify this answer:**

- [SAP BTP documentation](https://help.sap.com/docs/btp) - This is a documentation starting point, not proof of every statement. Find the named feature for your target release. The example decision and test plan are original study guidance.

<details>
<summary>Visual: Local and remote transaction boundaries</summary>

![Local and remote transaction boundaries](../visuals/remote-transaction-boundary.svg)

The remote commit belongs to another system, so local failure needs an explicit recovery strategy.

**Explain it:** What should happen if the remote side succeeds but the response is lost?

**Limit:** This explains distributed consistency, not a particular messaging product guarantee.

</details>

<details>
<summary>Visual: Duplicate events and stale approvals</summary>

![Duplicate events and stale approvals](../visuals/event-idempotency.svg)

The event identity and current business state decide whether to apply, ignore or reject the request.

**Explain it:** Two consumers process the same event simultaneously: what prevents a double effect?

**Limit:** Exact transactional deduplication mechanisms depend on the chosen infrastructure.

</details>

## BTP-09 Which tools matter to an ABAP developer on BTP?

**Level:** Core

**Short answer:** I use ADT in Eclipse for ABAP development. Fiori tools support UI development, while the BTP cockpit and service tools manage accounts, access and connections. The correct tool depends on where the application runs. For ABAP work, I should be able to find a released API, run checks and tests, and investigate a failed service call.

**Reasoning and example:** To build an ABAP extension, I first connect ADT to the intended ABAP system. I check available APIs and their release status there, then develop and test the service. If the project includes a Fiori app, I use supported Fiori tooling for that UI rather than assuming the ABAP deployment also deploys every frontend artifact.

For a connection failure, I may need the BTP cockpit or a service-specific monitor to inspect roles, destinations or communication setup. I verify tool versions against the target system. Older diagrams showing only Neo and Cloud Foundry, or the historical SAP Cloud Platform name, do not fully describe today's BTP services.

**Avoid this mistake:** The historical name SAP Cloud Platform and a Neo-versus-CF-only diagram are not a complete current BTP model.

**Read and verify this answer:**

- [SAP ABAP Cloud FAQ](https://pages.community.sap.com/topics/abap/abap-cloud-faq) - Check where the app runs, which user it calls as and how it connects.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## BTP-10 How would you secure and operate a side-by-side extension?

**Level:** Advanced

**Short answer:** I secure both the extension and its calls to other systems. Users and technical identities get only the permissions they need, and credentials stay outside source code. I monitor failures and response times, with a clear owner for recovery. Production readiness also includes safe deployment, API compatibility and a tested way to recover data or service availability.

**Reasoning and example:** A supplier portal works in development, but production needs more than a successful API call. I check which identity reads each supplier's data, how credentials are stored and revoked, and whether logs hide sensitive fields. Test and production use separate configuration so a test request cannot accidentally post a production order.

For an outage, the operator needs a request identifier, a visible status and instructions for safe retry. I also define who owns failures in the ERP API and who owns portal failures. Before changing a dependency, we test compatibility. Backup and recovery procedures must fit the actual services rather than rely on an assumed platform guarantee.

**Avoid this mistake:** Successful connectivity from a developer machine is not evidence of secure production operation.

**Read and verify this answer:**

- [SAP BTP documentation](https://help.sap.com/docs/btp) - This is a documentation starting point, not proof of every statement. Find the named feature for your target release. The example decision and test plan are original study guidance.

<details>
<summary>Visual: BTP account and runtime map</summary>

![BTP account and runtime map](../visuals/btp-account-runtime.svg)

Read the nesting as an organizational example, then distinguish the application, service instance and credentials.

**Explain it:** How is a service instance different from a binding or service key?

**Limit:** Schematic Cloud Foundry route; other BTP environments have different runtime structures.

</details>

## Official references

- [SAP ABAP Cloud FAQ](https://pages.community.sap.com/topics/abap/abap-cloud-faq)
- [Cloud Foundry service bindings](https://docs.cloudfoundry.org/devguide/services/application-binding.html)
- [Cloud Foundry environment variables](https://docs.cloudfoundry.org/devguide/deploy-apps/environment-variable.html)
- [SAP BTP documentation](https://help.sap.com/docs/btp)
- [Cloud Foundry: how applications are staged](https://docs.cloudfoundry.org/devguide/deploy-apps/how-applications-are-staged.html)
