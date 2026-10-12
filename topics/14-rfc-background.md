# Function modules, RFC, BAPI, parallel processing, and jobs

Separate the callable unit, the communication mechanism, and the business transaction. Classic RFC and job transactions remain important interview topics, but their statements and APIs are not automatically available in ABAP Cloud. Explain ownership, restart behavior, and observable outcomes before promising reliability or faster processing.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## RFC-01 How does a function module differ from an ABAP method?

**Level:** Core

**Short answer:** A function module is a procedure in a function group; modules in that group can share state. A method belongs to a class or interface and fits object-oriented design. I usually put new business rules in testable classes. Existing function modules can remain as required API or framework entry points and call those classes.

**Reasoning and example:** An integration already calls a function module to calculate an order charge. I can keep that public interface and move the calculation into a class with clear inputs and outputs. The function module then passes the request to the class and returns the result. Existing callers keep working, while unit tests can exercise the calculation directly.

I still check the function module's actual attributes. A normal function module is not automatically remote-enabled or an update module; those are different execution models. Moving code into a method also does not make it stateless, remotely callable or released for ABAP Cloud. Those properties need their own design and checks.

**Avoid this mistake:** A method is not automatically stateless, remotely callable or released for ABAP Cloud.

**Read and verify this answer:**

- [SAP RFC variants and their quality-of-service scope](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

## RFC-02 How do synchronous, asynchronous, transactional, queued, and background RFC differ?

**Level:** Core

**Short answer:** sRFC waits for a reply; aRFC lets the caller continue and collect results later. tRFC records a unit for processing after commit, with durable retry. qRFC adds ordering through queues, while bgRFC supports transactional and queued units with newer infrastructure. I choose by response, retry and ordering needs, within the target system's supported options.

**Reasoning and example:** A tRFC call is first registered in the current SAP LUW. COMMIT WORK triggers processing of that registered unit; ROLLBACK WORK removes the current registrations. The registration itself is not proof that the receiver has finished. sRFC and aRFC do not provide that same durable retry model.

The documented unit guarantees are Exactly Once for tRFC and bgRFC type T, with ordering in the configured scope for qRFC and bgRFC type Q. That does not guarantee one business effect across an entire distributed process: two separate submissions may still create two orders. bgRFC is the successor technology. I let the runtime manage the unit's transaction and do not assume unrelated queues share one global order.

**Avoid this mistake:** STARTING NEW TASK does not provide durable message retry. Separate queues do not automatically have one shared processing order.

**Read and verify this answer:**

- [SAP RFC variants and their quality-of-service scope](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.
- [SAP: CALL FUNCTION IN BACKGROUND TASK](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/8f/53b67ad30be445b0ccc968d69bc6ff/content.htm) - Explains classic tRFC registration and what COMMIT WORK and ROLLBACK WORK do. Registering a call does not prove it ran remotely.
- [SAP: CALL FUNCTION IN BACKGROUND UNIT](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcall_function_background_unit.htm) - Explains classic bgRFC units and its role as the successor technology. Check target availability; these rules do not permit commits inside RAP handlers.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

## RFC-03 What is the difference between a BAPI and an RFC-enabled function module?

**Level:** Core

**Short answer:** RFC is a mechanism for calling remote-enabled function modules. A BAPI is a business API, traditionally implemented by such a module for a business object or interface. A remote-enabled module is not automatically a BAPI. I check the particular API's business rules, return messages, transaction handling and release status before using it.

**Reasoning and example:** A classic integration may call a BAPI to create a sales order. The BAPI defines the business input, supported behavior and returned messages; RFC provides the remote call mechanism. A custom remote-enabled utility function has the mechanism too, but that alone does not give it a BAPI business contract.

Release status is another separate question. A BAPI supported in a classic integration may not be released for direct ABAP Cloud use. A modern released business API may use HTTP or OData instead of a classic BAPI. I therefore check the target development model and Clean Core classification rather than infer them from the name or remote-enabled flag.

**Avoid this mistake:** Remote-enabled, BAPI, released API and Clean Core Level A mean different things. Verify each relevant property.

**Read and verify this answer:**

- [SAP BAPI transaction model and documented exceptions](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

## RFC-04 When should BAPI_TRANSACTION_COMMIT or BAPI_TRANSACTION_ROLLBACK be called, and what does WAIT mean?

**Level:** Advanced

**Short answer:** The code that owns the BAPI transaction decides when to commit or roll back after checking the business results. For a remote BAPI, transaction control must reach the correct remote context. WAIT requests completion of high-priority updates; it does not wait for every later workflow or interface. I also check the specific BAPI's documented exceptions.

**Reasoning and example:** A client calls two BAPIs that are meant to form one transaction. It checks their relevant return messages and exceptions before asking the correct transaction context to commit. If the operation fails, it follows the documented rollback path. A local COMMIT WORK is not a way to commit an unrelated remote session.

After BAPI_TRANSACTION_COMMIT with WAIT, I check the commit result as well. Downstream messages, lower-priority work or workflows may still be pending. Some documented legacy BAPIs commit internally, so I verify the actual API behavior before combining calls. Inside RAP behavior code, inserting this commit function is not a permitted shortcut around framework transaction ownership.

**Avoid this mistake:** Check the BAPI's actual success rules and return messages. Local COMMIT WORK cannot commit an unrelated remote BAPI context.

**Read and verify this answer:**

- [SAP BAPI transaction model and documented exceptions](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

## RFC-05 Does a remote call participate in the caller's local SAP LUW?

**Level:** Advanced

**Short answer:** I do not assume that the caller and remote system share one rollback. Remote execution has its own context, and each side's transaction owner must be clear. Calls that must share a remote transaction need the correct session handling. If the remote side has already committed, local rollback cannot undo it; recovery needs an explicit business step.

**Reasoning and example:** A program remotely creates a document, then fails while recording its local reference. If the remote document was committed, rolling back the caller leaves that document in place. The program must find it using a stable reference and either complete the local record or use a supported cancellation process. Sending another creation request may duplicate it.

For two remote BAPI calls intended to commit together, I use the connector's supported transaction context and send transaction control to that context. Reusing a destination name alone is not a complete session design. An aRFC worker also cannot simply inherit the caller's uncommitted transaction buffer or memory.

**Avoid this mistake:** ROLLBACK WORK in the caller cannot undo an already committed remote business document or external side effect.

**Read and verify this answer:**

- [SAP RFC variants and their quality-of-service scope](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.
- [SAP BAPI transaction model and documented exceptions](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

## RFC-06 How would you collect results from CALL FUNCTION STARTING NEW TASK?

**Level:** Advanced

**Short answer:** I start each aRFC call with a task ID and an end-of-task callback. In the callback, RECEIVE RESULTS FROM FUNCTION collects the result and handles communication or system errors. I track which tasks started, completed, failed or timed out. Starting a task successfully only proves dispatch, not that its business work succeeded.

**Reasoning and example:** A coordinator splits 300 records into three packages and launches three remote-enabled function calls with STARTING NEW TASK. Each task ID points back to its package. CALLING or PERFORMING ON END OF TASK registers the callback, which uses RECEIVE RESULTS FROM FUNCTION to collect the output and record the outcome.

Package three may finish before package one, so I never match results by arrival order. The caller must stay alive and allow callbacks to run, using an appropriate bounded wait where needed. I also handle tasks that never return in time. The usual synchronous IMPORTING pattern is not how an aRFC caller receives its eventual results.

**Avoid this mistake:** An immediate successful dispatch does not mean business success, and the normal synchronous IMPORTING pattern does not collect an aRFC result.

**Read and verify this answer:**

- [SAP parallel processing, callbacks, and resource groups](https://help.sap.com/docs/ABAP_PLATFORM_NEW/7bfe8cdcfbb040dcb6702dada8c3e2f0/4d909309eba36e73e10000000a15822b.html) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## RFC-07 How do you prevent parallel RFC processing from exhausting resources?

**Level:** Advanced

**Short answer:** I limit how many tasks can run at once and give each task a useful-sized package. In classic ABAP, DESTINATION IN GROUP can use a configured RFC server group. Resource availability can change, so I handle RESOURCE_FAILURE and reduce or delay dispatch. I measure the result: more parallel tasks can increase waiting and make the job slower.

**Reasoning and example:** A report needs to process 100,000 independent records. Starting one task per record wastes resources. I choose packages large enough to justify call overhead, use the agreed RFC group and cap outstanding tasks. RZ12 defines the relevant groups in classic systems, and SPBT_INITIALIZE can help inspect currently available resources.

That resource count is only a snapshot, not a reservation. If dispatch fails because capacity disappeared, the coordinator must throttle or retry within a limit. I also measure locks and database load. A background coordinator may start aRFC workers in dialog work processes, so its own job type does not mean every worker uses a background process.

**Avoid this mistake:** A resource count is a snapshot, not a reservation; hard-coded maximum concurrency can overload the system or increase lock contention.

**Read and verify this answer:**

- [SAP parallel processing, callbacks, and resource groups](https://help.sap.com/docs/ABAP_PLATFORM_NEW/7bfe8cdcfbb040dcb6702dada8c3e2f0/4d909309eba36e73e10000000a15822b.html) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## RFC-08 Why are WAIT and implicit database commits important in parallel processing?

**Level:** Advanced

**Short answer:** WAIT is not always a harmless pause. Classic WAIT can cause a database commit, so I avoid placing it around unfinished writes or an open database cursor without checking the exact rules. RFC boundaries can matter too. A database commit does not mean every update task or remote business operation has completed successfully.

**Reasoning and example:** A coordinator writes some rows and then waits for parallel workers. If that wait causes an unexpected database boundary, the program may save part of its work earlier than intended. An open database cursor can also be affected. I therefore design the commit boundaries before dispatch and waiting instead of relying on timing to make the program work.

Workers should receive self-contained input rather than depend on the caller's pending writes or transaction buffer. COMMIT WORK AND WAIT, WAIT UNTIL and collecting an aRFC callback solve different problems. I check the exact statement and framework context; neither 'RFC never commits' nor 'every RFC commits the whole business transaction' is a safe general rule.

**Avoid this mistake:** Neither 'RFC never commits' nor 'every RFC commits the whole business transaction' is a safe rule; statement, context, and framework restrictions matter.

**Read and verify this answer:**

- [SAP WAIT UNTIL and database commit implications](https://help.sap.com/saphelp_em900/helpdata/en/48/9b958a1786062de10000000a42189d/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## RFC-09 How would you design parallel workers that can be restarted safely?

**Level:** Advanced

**Short answer:** Each worker needs a clear package, transaction boundary and restart rule. I use stable business keys so a retry can find work already completed. Different workers should avoid changing the same locked object at the same time. After a timeout, I check the actual business result rather than assume the package failed and run everything again.

**Reasoning and example:** Six workers process six packages. Five report success and the sixth times out. Restarting all six could repeat work that already committed. I record completed, pending and uncertain outcomes and use stable references to locate each package's business documents. Independent worker commits mean the overall job can be partly complete.

There is a harder case: the sixth worker saved its document but failed before recording completion. A package status alone cannot prove that nothing happened. Recovery must check the business effect or use a documented idempotent operation. I also test two packages that accidentally contain the same object, because lock contention can remove the benefit of parallel processing.

**Avoid this mistake:** Separately committed workers are not one all-or-nothing transaction. Extra workers can also make lock contention worse.

**Read and verify this answer:**

- [SAP parallel processing, callbacks, and resource groups](https://help.sap.com/docs/ABAP_PLATFORM_NEW/7bfe8cdcfbb040dcb6702dada8c3e2f0/4d909309eba36e73e10000000a15822b.html) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.
- [SAP classic background scheduling and monitoring](https://help.sap.com/saphelp_em700_ehp01/helpdata/en/48/baab96ca960611e10000000a42189b/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## RFC-10 How do you schedule and troubleshoot a classic background job?

**Level:** Core

**Short answer:** In a classic system, I schedule job steps, variants, user and start conditions, commonly in SM36. In SM37, I inspect status, job log, steps and spool. I then follow application errors or dumps. Before restarting a canceled job, I check what it already saved; cancellation does not undo earlier commits.

**Reasoning and example:** A nightly posting job is canceled halfway through its input. I inspect the job log and application records to find the last confirmed business results. The rerun must use a stable selection and avoid posting the completed records again. If the job is periodic, I also check whether the next run could overlap with recovery.

Job states such as scheduled, released, ready, active, finished and canceled describe execution progress. Finished only means the job completed technically; the report may still have rejected individual business records. I reconcile accepted and failed records and define who handles missed runs, authorization errors and unavailable external systems.

**Avoid this mistake:** SM37 Finished is not proof that every business record succeeded, and canceling a job does not reverse its earlier commits.

**Read and verify this answer:**

- [SAP classic background scheduling and monitoring](https://help.sap.com/saphelp_em700_ehp01/helpdata/en/48/baab96ca960611e10000000a42189b/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## RFC-11 How do application jobs differ from classic report scheduling in ABAP Cloud?

**Level:** Core

**Short answer:** Application jobs use the execution framework supported by the target product. A catalog entry connects executable logic with parameter metadata; a template provides scheduling defaults. Users operate jobs through supported apps or APIs. I check the actual interfaces and permissions rather than copy a classic report-scheduling pattern into ABAP Cloud.

**Reasoning and example:** A cloud application needs a nightly cleanup for completed requests. I implement the supported executable class and connect it to the appropriate job catalog entry. A template can supply the usual retention period, while another template uses a different business selection. The scheduler still needs permission to run the job and process the selected data.

I verify how the class, catalog, template and Application Jobs app fit together on the target release. I do not assume JOB_OPEN, SUBMIT or an interface signature from another release is available. Application jobs also exist in supported on-premise products, so the concept is not limited to cloud systems.

**Avoid this mistake:** Do not copy an unreleased JOB_OPEN or SUBMIT pattern into ABAP Cloud, or assume an interface signature from a different release.

**Read and verify this answer:**

- [SAP application job implementation, catalog entries, and templates](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-job-catalog-entry-and-job-template-in-adt) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## RFC-12 Which operational and security checks make RFC or job processing production-ready?

**Level:** Advanced

**Short answer:** I check who calls the RFC or runs the job, what they may do and how connections are secured. Operators need useful logs, alerts and a safe recovery procedure. Tests include outages, duplicate requests, locks, bad input and timeouts. A scheduling or transport acknowledgment is only one step; I verify the final business result too.

**Reasoning and example:** A queued posting stops because the receiver is unavailable. An operator needs to find the affected business requests, understand whether anything was posted and restart only through the supported recovery path. In classic systems, relevant tools can include SM58 for tRFC, SMQ1 or SMQ2 for queues and SBGRFCMON for bgRFC.

I test both temporary technical failures and permanent business errors using realistic volumes. The technical user should have only the required access, and operators should not receive unrestricted payload-editing rights just to inspect failures. RFC authorization does not replace application authorization. Durable queues also need monitoring; persistence alone does not guarantee that someone resolves a stuck message.

**Avoid this mistake:** RFC permission does not replace business permission. A durable queue still needs someone to monitor and recover failures.

**Read and verify this answer:**

- [SAP RFC variants and their quality-of-service scope](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.
- [SAP classic background scheduling and monitoring](https://help.sap.com/saphelp_em700_ehp01/helpdata/en/48/baab96ca960611e10000000a42189b/content.htm) - These are classic ABAP runtime rules unless the source specifically describes a cloud application job.

<details>
<summary>Visual: RFC modes and guarantee boundaries</summary>

![RFC modes and guarantee boundaries](../visuals/rfc-mode-comparison.svg)

Compare the caller behavior and delivery unit, then name the monitoring and retry owner.

**Explain it:** Why does an asynchronous call not automatically become a durable queued transaction?

**Limit:** Classic terminology; API release, runtime availability and transaction rules must be checked for the target.

</details>

<details>
<summary>Visual: Parallel processing inside a job</summary>

![Parallel processing inside a job](../visuals/parallel-job-workers.svg)

A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.

**Explain it:** If worker B fails after A commits, what is safe to retry?

**Limit:** Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.

</details>

## Official references

- [SAP RFC variants and their quality-of-service scope](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm)
- [SAP BAPI transaction model and documented exceptions](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm)
- [SAP parallel processing, callbacks, and resource groups](https://help.sap.com/docs/ABAP_PLATFORM_NEW/7bfe8cdcfbb040dcb6702dada8c3e2f0/4d909309eba36e73e10000000a15822b.html)
- [SAP WAIT UNTIL and database commit implications](https://help.sap.com/saphelp_em900/helpdata/en/48/9b958a1786062de10000000a42189d/content.htm)
- [SAP classic background scheduling and monitoring](https://help.sap.com/saphelp_em700_ehp01/helpdata/en/48/baab96ca960611e10000000a42189b/content.htm)
- [SAP application job implementation, catalog entries, and templates](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-job-catalog-entry-and-job-template-in-adt)
