# Study topic map

The studio groups questions by subject. Core, Advanced and Senior levels stay inside each topic. Source documents keep their stable module names for printable exports.

## ABAP Cloud architecture

18 questions. Choose extension placement, API boundaries, components and identity for the target landscape.

### Placement & business boundaries

| Question | Level |
| --- | --- |
| [CLOUD-01 - A new approval extension needs immediate document validation and an external supplier portal. Would you put everything on-stack or on BTP?](../topics/16-cloud-architecture-senior.md#cloud-01-a-new-approval-extension-needs-immediate-document-validation-and-an-external-supplier-portal-would-you-put-everything-on-stack-or-on-btp) | Senior |
| [CLOUD-02 - A stakeholder says ABAP Cloud means moving the existing application to SAP BTP ABAP environment. How would you correct the proposal?](../topics/16-cloud-architecture-senior.md#cloud-02-a-stakeholder-says-abap-cloud-means-moving-the-existing-application-to-sap-btp-abap-environment-how-would-you-correct-the-proposal) | Senior |
| [CLOUD-07 - Should a request, its approval history, and an external purchase order be one RAP business object?](../topics/16-cloud-architecture-senior.md#cloud-07-should-a-request-its-approval-history-and-an-external-purchase-order-be-one-rap-business-object) | Senior |
| [CLOUD-09 - A business team requests a new field, a rule, and a custom app. How do you decide between configuration, key-user, and developer extensibility?](../topics/16-cloud-architecture-senior.md#cloud-09-a-business-team-requests-a-new-field-a-rule-and-a-custom-app-how-do-you-decide-between-configuration-key-user-and-developer-extensibility) | Senior |
| [CLOUD-12 - A large classic application cannot be replaced in one release. How would you introduce ABAP Cloud without creating two inconsistent applications?](../topics/16-cloud-architecture-senior.md#cloud-12-a-large-classic-application-cannot-be-replaced-in-one-release-how-would-you-introduce-abap-cloud-without-creating-two-inconsistent-applications) | Senior |
| [CLOUD-14 - A released BAdI exists, but it runs after the point where the requirement must reject a transaction. Is it still the right extension?](../topics/16-cloud-architecture-senior.md#cloud-14-a-released-badi-exists-but-it-runs-after-the-point-where-the-requirement-must-reject-a-transaction-is-it-still-the-right-extension) | Senior |

### API selection & contracts

| Question | Level |
| --- | --- |
| [CLOUD-03 - A developer proposes dynamic calls to an unreleased SAP class because static ABAP Cloud checks reject it. What do you do?](../topics/16-cloud-architecture-senior.md#cloud-03-a-developer-proposes-dynamic-calls-to-an-unreleased-sap-class-because-static-abap-cloud-checks-reject-it-what-do-you-do) | Senior |
| [CLOUD-05 - The same business capability is exposed through a local released API and a remote service. Which should an on-stack application consume?](../topics/16-cloud-architecture-senior.md#cloud-05-the-same-business-capability-is-exposed-through-a-local-released-api-and-a-remote-service-which-should-an-on-stack-application-consume) | Senior |
| [CLOUD-10 - Can you expose the same RAP projection to a Fiori UI and long-lived external consumers?](../topics/16-cloud-architecture-senior.md#cloud-10-can-you-expose-the-same-rap-projection-to-a-fiori-ui-and-long-lived-external-consumers) | Senior |
| [CLOUD-11 - A released CDS view contains all required fields. Why might it still be unsuitable for implementing a business command?](../topics/16-cloud-architecture-senior.md#cloud-11-a-released-cds-view-contains-all-required-fields-why-might-it-still-be-unsuitable-for-implementing-a-business-command) | Senior |
| [CLOUD-13 - A shared custom API is widely used but has no named owner. What would you change before accepting another dependency on it?](../topics/16-cloud-architecture-senior.md#cloud-13-a-shared-custom-api-is-widely-used-but-has-no-named-owner-what-would-you-change-before-accepting-another-dependency-on-it) | Senior |
| [CLOUD-17 - A released dependency is deprecated but still works. How do you decide when and how to replace it?](../topics/16-cloud-architecture-senior.md#cloud-17-a-released-dependency-is-deprecated-but-still-works-how-do-you-decide-when-and-how-to-replace-it) | Senior |

### Components & lifecycle

| Question | Level |
| --- | --- |
| [CLOUD-04 - Two teams want independent releases but share pricing helpers and persistence types. How would you structure packages and software components?](../topics/16-cloud-architecture-senior.md#cloud-04-two-teams-want-independent-releases-but-share-pricing-helpers-and-persistence-types-how-would-you-structure-packages-and-software-components) | Senior |
| [CLOUD-06 - A CDS object compiles in the development system but fails after delivery to an older supported release. How would you prevent recurrence?](../topics/16-cloud-architecture-senior.md#cloud-06-a-cds-object-compiles-in-the-development-system-but-fails-after-delivery-to-an-older-supported-release-how-would-you-prevent-recurrence) | Senior |
| [CLOUD-15 - Your domain classes depend on Gateway messages, SQL row types, and HTTP clients. How would you improve the architecture without a wholesale rewrite?](../topics/16-cloud-architecture-senior.md#cloud-15-your-domain-classes-depend-on-gateway-messages-sql-row-types-and-http-clients-how-would-you-improve-the-architecture-without-a-wholesale-rewrite) | Senior |
| [CLOUD-18 - What would you require before approving a senior team's ABAP Cloud architecture for production?](../topics/16-cloud-architecture-senior.md#cloud-18-what-would-you-require-before-approving-a-senior-teams-abap-cloud-architecture-for-production) | Senior |

### Isolation & identity

| Question | Level |
| --- | --- |
| [CLOUD-08 - A partner wants one ABAP solution to serve several customers. What isolation questions must be answered before calling it multitenant?](../topics/16-cloud-architecture-senior.md#cloud-08-a-partner-wants-one-abap-solution-to-serve-several-customers-what-isolation-questions-must-be-answered-before-calling-it-multitenant) | Senior |
| [CLOUD-16 - A side-by-side service needs to act for users and also run scheduled reconciliation. Would you use one technical identity for both?](../topics/16-cloud-architecture-senior.md#cloud-16-a-side-by-side-service-needs-to-act-for-users-and-also-run-scheduled-reconciliation-would-you-use-one-technical-identity-for-both) | Senior |

## RAP business objects

56 questions. Model behavior and reason through transactional state, consumer contracts and failure.

### Model, implementation & exposure

| Question | Level |
| --- | --- |
| [RAP-01 - What are the building blocks of a RAP application?](../topics/05-rap-foundations.md#rap-01-what-are-the-building-blocks-of-a-rap-application) | Core |
| [RAP-02 - How do you choose managed versus unmanaged RAP?](../topics/05-rap-foundations.md#rap-02-how-do-you-choose-managed-versus-unmanaged-rap) | Core |
| [RAP-14 - How does persistent field mapping work?](../topics/05-rap-foundations.md#rap-14-how-does-persistent-field-mapping-work) | Core |
| [ADV-09 - Service definition versus binding and UI versus Web API?](../topics/06-rap-advanced.md#adv-09-service-definition-versus-binding-and-ui-versus-web-api) | Core |
| [ADV-10 - What must a custom query provider implement?](../topics/06-rap-advanced.md#adv-10-what-must-a-custom-query-provider-implement) | Advanced |
| [ADV-12 - How do you extend an existing RAP BO safely?](../topics/06-rap-advanced.md#adv-12-how-do-you-extend-an-existing-rap-bo-safely) | Advanced |
| [SRAP-01 - A new approval app has custom persistence, while its posting step must reuse an existing transactional API. Which RAP implementation type would you choose?](../topics/17-rap-transactions-senior.md#srap-01-a-new-approval-app-has-custom-persistence-while-its-posting-step-must-reuse-an-existing-transactional-api-which-rap-implementation-type-would-you-choose) | Senior |
| [SRAP-16 - An older RAP BO works without strict mode. The team wants to release it for cloud consumption by adding strict(2). Is that sufficient?](../topics/17-rap-transactions-senior.md#srap-16-an-older-rap-bo-works-without-strict-mode-the-team-wants-to-release-it-for-cloud-consumption-by-adding-strict2-is-that-sufficient) | Senior |
| [SRAP-22 - Your team finds a useful SAP RAP base BO in ADT, but only a narrower BO interface is released. Which layer should your application consume?](../topics/17-rap-transactions-senior.md#srap-22-your-team-finds-a-useful-sap-rap-base-bo-in-adt-but-only-a-narrower-bo-interface-is-released-which-layer-should-your-application-consume) | Senior |

### Transactions & save ownership

| Question | Level |
| --- | --- |
| [RAP-03 - What is the transactional buffer?](../topics/05-rap-foundations.md#rap-03-what-is-the-transactional-buffer) | Core |
| [RAP-04 - Where may COMMIT ENTITIES be called?](../topics/05-rap-foundations.md#rap-04-where-may-commit-entities-be-called) | Core |
| [RAP-05 - What are the steps of the RAP save sequence, and where is the point of no return?](../topics/05-rap-foundations.md#rap-05-what-are-the-steps-of-the-rap-save-sequence-and-where-is-the-point-of-no-return) | Advanced |
| [RAP-15 - Can you call a BAPI from RAP, and what happens if it executes COMMIT?](../topics/05-rap-foundations.md#rap-15-can-you-call-a-bapi-from-rap-and-what-happens-if-it-executes-commit) | Advanced |
| [RAP-17 - Do BRFplus, bgPF or bgRFC make an internally committing BAPI safe in RAP?](../topics/05-rap-foundations.md#rap-17-do-brfplus-bgpf-or-bgrfc-make-an-internally-committing-bapi-safe-in-rap) | Advanced |
| [SRAP-02 - An audit record must be saved with every managed order change. Should you use a determination, additional save, or unmanaged save?](../topics/17-rap-transactions-senior.md#srap-02-an-audit-record-must-be-saved-with-every-managed-order-change-should-you-use-a-determination-additional-save-or-unmanaged-save) | Senior |
| [SRAP-03 - A developer puts ordinary business validation in SAVE because the final data is available there. What would you change?](../topics/17-rap-transactions-senior.md#srap-03-a-developer-puts-ordinary-business-validation-in-save-because-the-final-data-is-available-there-what-would-you-change) | Senior |
| [SRAP-04 - One action updates two local RAP BOs and then calls a remote payment service. Can the whole action be atomic?](../topics/17-rap-transactions-senior.md#srap-04-one-action-updates-two-local-rap-bos-and-then-calls-a-remote-payment-service-can-the-whole-action-be-atomic) | Senior |
| [SRAP-15 - A legacy function module issues COMMIT WORK internally. Can you make it safe by wrapping it in a RAP action?](../topics/17-rap-transactions-senior.md#srap-15-a-legacy-function-module-issues-commit-work-internally-can-you-make-it-safe-by-wrapping-it-in-a-rap-action) | Senior |
| [SRAP-17 - An unmanaged BO passes isolated tests but a second request reads leftovers after an earlier save rejection. Where do you look?](../topics/17-rap-transactions-senior.md#srap-17-an-unmanaged-bo-passes-isolated-tests-but-a-second-request-reads-leftovers-after-an-earlier-save-rejection-where-do-you-look) | Senior |
| [SRAP-20 - In a mass approval request, one instance fails. Must all other approvals be rolled back?](../topics/17-rap-transactions-senior.md#srap-20-in-a-mass-approval-request-one-instance-fails-must-all-other-approvals-be-rolled-back) | Senior |

### EML, responses & numbering

| Question | Level |
| --- | --- |
| [RAP-07 - How do FAILED REPORTED and MAPPED differ?](../topics/05-rap-foundations.md#rap-07-how-do-failed-reported-and-mapped-differ) | Core |
| [RAP-08 - What is EML and when do you use it instead of SQL?](../topics/05-rap-foundations.md#rap-08-what-is-eml-and-when-do-you-use-it-instead-of-sql) | Core |
| [RAP-10 - What do %cid %cid_ref %tky and %pid mean?](../topics/05-rap-foundations.md#rap-10-what-do-cid-cid_ref-tky-and-pid-mean) | Core |
| [RAP-11 - Early numbering versus late numbering?](../topics/05-rap-foundations.md#rap-11-early-numbering-versus-late-numbering) | Advanced |
| [SRAP-05 - A bulk EML update contains 200 instances, including missing keys and unauthorized changes. How do you report and process the result?](../topics/17-rap-transactions-senior.md#srap-05-a-bulk-eml-update-contains-200-instances-including-missing-keys-and-unauthorized-changes-how-do-you-report-and-process-the-result) | Senior |
| [SRAP-06 - An API consumer sends an empty comment to clear it, but the previous text remains. What do you investigate?](../topics/17-rap-transactions-senior.md#srap-06-an-api-consumer-sends-an-empty-comment-to-clear-it-but-the-previous-text-remains-what-do-you-investigate) | Senior |
| [SRAP-07 - You must create three new orders with items in one EML request before final order numbers exist. How do you correlate the tree?](../topics/17-rap-transactions-senior.md#srap-07-you-must-create-three-new-orders-with-items-in-one-eml-request-before-final-order-numbers-exist-how-do-you-correlate-the-tree) | Senior |
| [SRAP-08 - A posting API returns the final document number only when called. How would you integrate numbering without publishing incorrect keys?](../topics/17-rap-transactions-senior.md#srap-08-a-posting-api-returns-the-final-document-number-only-when-called-how-would-you-integrate-numbering-without-publishing-incorrect-keys) | Senior |

### Rules, actions & augmentation

| Question | Level |
| --- | --- |
| [RAP-06 - Determination validation action or precheck?](../topics/05-rap-foundations.md#rap-06-determination-validation-action-or-precheck) | Core |
| [ADV-04 - Instance static and factory actions?](../topics/06-rap-advanced.md#adv-04-instance-static-and-factory-actions) | Core |
| [RAP-13 - Can you rely on determination and validation order?](../topics/05-rap-foundations.md#rap-13-can-you-rely-on-determination-and-validation-order) | Advanced |
| [RAP-16 - How do you group a multi-select Fiori action into one changeset with InvocationGrouping?](../topics/05-rap-foundations.md#rap-16-how-do-you-group-a-multi-select-fiori-action-into-one-changeset-with-invocationgrouping) | Advanced |
| [ADV-05 - How do action parameters and results work?](../topics/06-rap-advanced.md#adv-05-how-do-action-parameters-and-results-work) | Advanced |
| [ADV-06 - What is augmentation and how does it differ from additional save?](../topics/06-rap-advanced.md#adv-06-what-is-augmentation-and-how-does-it-differ-from-additional-save) | Advanced |
| [ADV-14 - What is a normal RAP function, and when should you use it instead of an action?](../topics/06-rap-advanced.md#adv-14-what-is-a-normal-rap-function-and-when-should-you-use-it-instead-of-an-action) | Advanced |
| [ADV-15 - How does a default function suggest values for RAP action parameters?](../topics/06-rap-advanced.md#adv-15-how-does-a-default-function-suggest-values-for-rap-action-parameters) | Advanced |
| [SRAP-11 - Two determinations calculate discount and total. Production results depend on which one executes first. How would you redesign them?](../topics/17-rap-transactions-senior.md#srap-11-two-determinations-calculate-discount-and-total-production-results-depend-on-which-one-executes-first-how-would-you-redesign-them) | Senior |
| [SRAP-13 - A CopyOrder action creates an order, but the UI stays on the source and the consumer cannot identify the copy. How do you review the action contract?](../topics/17-rap-transactions-senior.md#srap-13-a-copyorder-action-creates-an-order-but-the-ui-stays-on-the-source-and-the-consumer-cannot-identify-the-copy-how-do-you-review-the-action-contract) | Senior |
| [SRAP-14 - A projection accepts a convenience field that must enrich an underlying create. Why might augmentation fit, and what are its boundaries?](../topics/17-rap-transactions-senior.md#srap-14-a-projection-accepts-a-convenience-field-that-must-enrich-an-underlying-create-why-might-augmentation-fit-and-what-are-its-boundaries) | Senior |
| [SRAP-19 - A credit-limit check runs successfully on a draft, but active data is later saved through another consumer with an invalid amount. What is missing?](../topics/17-rap-transactions-senior.md#srap-19-a-credit-limit-check-runs-successfully-on-a-draft-but-active-data-is-later-saved-through-another-consumer-with-an-invalid-amount-what-is-missing) | Senior |

### Draft, concurrency & access

| Question | Level |
| --- | --- |
| [RAP-12 - What problem does draft solve?](../topics/05-rap-foundations.md#rap-12-what-problem-does-draft-solve) | Core |
| [ADV-01 - How do pessimistic locks and ETags complement each other?](../topics/06-rap-advanced.md#adv-01-how-do-pessimistic-locks-and-etags-complement-each-other) | Core |
| [RAP-09 - What does IN LOCAL MODE mean?](../topics/05-rap-foundations.md#rap-09-what-does-in-local-mode-mean) | Advanced |
| [ADV-02 - What is the difference between global and instance authorization in RAP, and where do DCL and prechecks fit?](../topics/06-rap-advanced.md#adv-02-what-is-the-difference-between-global-and-instance-authorization-in-rap-and-where-do-dcl-and-prechecks-fit) | Advanced |
| [ADV-03 - What does authorization none on an action mean?](../topics/06-rap-advanced.md#adv-03-what-does-authorization-none-on-an-action-mean) | Advanced |
| [ADV-13 - How do static and dynamic feature controls differ?](../topics/06-rap-advanced.md#adv-13-how-do-static-and-dynamic-feature-controls-differ) | Advanced |
| [SRAP-09 - A user saves a draft, closes the browser, returns, and presses Activate. What state transitions and failures would you explain?](../topics/17-rap-transactions-senior.md#srap-09-a-user-saves-a-draft-closes-the-browser-returns-and-presses-activate-what-state-transitions-and-failures-would-you-explain) | Senior |
| [SRAP-10 - A draft lock expires, another process changes an active child, and the first user resumes editing. How do you prevent silent loss of the child change?](../topics/17-rap-transactions-senior.md#srap-10-a-draft-lock-expires-another-process-changes-an-active-child-and-the-first-user-resumes-editing-how-do-you-prevent-silent-loss-of-the-child-change) | Senior |
| [SRAP-12 - A request changes CompanyCode to an unauthorized value and also makes its dates inconsistent. Would you use prechecks or validations?](../topics/17-rap-transactions-senior.md#srap-12-a-request-changes-companycode-to-an-unauthorized-value-and-also-makes-its-dates-inconsistent-would-you-use-prechecks-or-validations) | Senior |
| [SRAP-23 - Two requests execute Submit for the same order, and one client retries after a timeout. How do you prevent duplicate business effects?](../topics/17-rap-transactions-senior.md#srap-23-two-requests-execute-submit-for-the-same-order-and-one-client-retries-after-a-timeout-how-do-you-prevent-duplicate-business-effects) | Senior |

### Messages, side effects & events

| Question | Level |
| --- | --- |
| [ADV-07 - What are side effects in a RAP UI?](../topics/06-rap-advanced.md#adv-07-what-are-side-effects-in-a-rap-ui) | Advanced |
| [ADV-08 - State messages versus transition messages?](../topics/06-rap-advanced.md#adv-08-state-messages-versus-transition-messages) | Advanced |
| [ADV-11 - How do RAP business events differ from ABAP Objects events?](../topics/06-rap-advanced.md#adv-11-how-do-rap-business-events-differ-from-abap-objects-events) | Advanced |
| [SRAP-18 - An Approved event should trigger an external workflow. Why is calling its HTTP endpoint from an on-save determination unreliable?](../topics/17-rap-transactions-senior.md#srap-18-an-approved-event-should-trigger-an-external-workflow-why-is-calling-its-http-endpoint-from-an-on-save-determination-unreliable) | Senior |
| [SRAP-21 - After a quantity change, the backend total is correct but the Fiori page displays the old value. Is this a transaction bug?](../topics/17-rap-transactions-senior.md#srap-21-after-a-quantity-change-the-backend-total-is-correct-but-the-fiori-page-displays-the-old-value-is-this-a-transaction-bug) | Senior |
| [SRAP-24 - A validation reports the right error once, but the message remains after correction or appears on the wrong child. How would you debug it?](../topics/17-rap-transactions-senior.md#srap-24-a-validation-reports-the-right-error-once-but-the-message-remains-after-correction-or-appears-on-the-wrong-child-how-would-you-debug-it) | Senior |

## Clean Core & extensibility

36 questions. Classify dependencies and choose supported APIs, extension options and bounded exceptions.

### Levels & ATC interpretation

| Question | Level |
| --- | --- |
| [CORE-01 - What is Clean Core in a practical ABAP answer?](../topics/08-clean-core.md#core-01-what-is-clean-core-in-a-practical-abap-answer) | Core |
| [CORE-02 - What are Clean Core levels A B C and D?](../topics/08-clean-core.md#core-02-what-are-clean-core-levels-a-b-c-and-d) | Core |
| [CORE-03 - How do the levels map to ATC messages?](../topics/08-clean-core.md#core-03-how-do-the-levels-map-to-atc-messages) | Core |
| [CORE-06 - What belongs to Level D and what would you do first?](../topics/08-clean-core.md#core-06-what-belongs-to-level-d-and-what-would-you-do-first) | Core |
| [CORE-07 - Are A through D the same as the old three tiers?](../topics/08-clean-core.md#core-07-are-a-through-d-the-same-as-the-old-three-tiers) | Core |
| [CORE-17 - Is Clean ABAP the same thing as Clean Core?](../topics/08-clean-core.md#core-17-is-clean-abap-the-same-thing-as-clean-core) | Core |
| [CORE-04 - Why is a classic API Level B rather than Level A?](../topics/08-clean-core.md#core-04-why-is-a-classic-api-level-b-rather-than-level-a) | Advanced |
| [CORE-05 - What does responsible Level C use look like?](../topics/08-clean-core.md#core-05-what-does-responsible-level-c-use-look-like) | Advanced |
| [CORE-14 - Can a solution using both A and B dependencies be called entirely A?](../topics/08-clean-core.md#core-14-can-a-solution-using-both-a-and-b-dependencies-be-called-entirely-a) | Advanced |
| [GOV-01 - A project claims Level A because its frontend uses RAP. How would you assess the extension?](../topics/20-clean-core-senior.md#gov-01-a-project-claims-level-a-because-its-frontend-uses-rap-how-would-you-assess-the-extension) | Senior |
| [GOV-16 - How would you assess a solution that uses a released CDS query, a classified classic BAPI, an internal class, and a modification?](../topics/20-clean-core-senior.md#gov-16-how-would-you-assess-a-solution-that-uses-a-released-cds-query-a-classified-classic-bapi-an-internal-class-and-a-modification) | Senior |
| [GOV-18 - An interview panel shows an A-D chart with ATC priorities. What would you clarify before treating it as a release gate?](../topics/20-clean-core-senior.md#gov-18-an-interview-panel-shows-an-a-d-chart-with-atc-priorities-what-would-you-clarify-before-treating-it-as-a-release-gate) | Senior |

### Released APIs & dependency chains

| Question | Level |
| --- | --- |
| [CORE-08 - Does wrapping an unreleased SAP API make it Level A?](../topics/08-clean-core.md#core-08-does-wrapping-an-unreleased-sap-api-make-it-level-a) | Advanced |
| [CORE-12 - What are release contracts C0 C1 and C2?](../topics/08-clean-core.md#core-12-what-are-release-contracts-c0-c1-and-c2) | Advanced |
| [CORE-13 - Where do you find Classic API, Not Recommended and noAPI classifications, and how do you verify an API choice?](../topics/08-clean-core.md#core-13-where-do-you-find-classic-api-not-recommended-and-noapi-classifications-and-how-do-you-verify-an-api-choice) | Advanced |
| [GOV-02 - An API is released with C1. A team assumes that means Clean Core Level C and permission to expose it remotely. How do you respond?](../topics/20-clean-core-senior.md#gov-02-an-api-is-released-with-c1-a-team-assumes-that-means-clean-core-level-c-and-permission-to-expose-it-remotely-how-do-you-respond) | Senior |
| [GOV-03 - A team wraps an internal SAP function module and releases the wrapper. Has the technical debt disappeared?](../topics/20-clean-core-senior.md#gov-03-a-team-wraps-an-internal-sap-function-module-and-releases-the-wrapper-has-the-technical-debt-disappeared) | Senior |
| [GOV-09 - Your team wants to release a custom API used by three other teams. What must be ready before setting its release state?](../topics/20-clean-core-senior.md#gov-09-your-team-wants-to-release-a-custom-api-used-by-three-other-teams-what-must-be-ready-before-setting-its-release-state) | Senior |
| [GOV-10 - The direct dependency scan is clean, but an upgrade still breaks the extension. What could the governance model be missing?](../topics/20-clean-core-senior.md#gov-10-the-direct-dependency-scan-is-clean-but-an-upgrade-still-breaks-the-extension-what-could-the-governance-model-be-missing) | Senior |

### Extension choices & API gaps

| Question | Level |
| --- | --- |
| [CORE-09 - How do public private and on-premise editions change the answer?](../topics/08-clean-core.md#core-09-how-do-public-private-and-on-premise-editions-change-the-answer) | Core |
| [CORE-10 - How do you choose key-user on-stack and side-by-side extensibility?](../topics/08-clean-core.md#core-10-how-do-you-choose-key-user-on-stack-and-side-by-side-extensibility) | Core |
| [CORE-15 - What if no released API covers the business requirement?](../topics/08-clean-core.md#core-15-what-if-no-released-api-covers-the-business-requirement) | Core |
| [CORE-11 - Why is side-by-side not automatically Clean Core?](../topics/08-clean-core.md#core-11-why-is-side-by-side-not-automatically-clean-core) | Advanced |
| [GOV-05 - A Level B solution works in Private Edition. Can the same approval justify deploying it in Public Edition?](../topics/20-clean-core-senior.md#gov-05-a-level-b-solution-works-in-private-edition-can-the-same-approval-justify-deploying-it-in-public-edition) | Senior |
| [GOV-07 - No released API supports a required business operation. What would your escalation contain?](../topics/20-clean-core-senior.md#gov-07-no-released-api-supports-a-required-business-operation-what-would-your-escalation-contain) | Senior |
| [GOV-08 - The business asks to reproduce a heavily customized legacy process exactly. How do you challenge that without dismissing the requirement?](../topics/20-clean-core-senior.md#gov-08-the-business-asks-to-reproduce-a-heavily-customized-legacy-process-exactly-how-do-you-challenge-that-without-dismissing-the-requirement) | Senior |
| [GOV-14 - A classified classic API meets the need, while a released API covers only half the operation. Would you accept Level B?](../topics/20-clean-core-senior.md#gov-14-a-classified-classic-api-meets-the-need-while-a-released-api-covers-only-half-the-operation-would-you-accept-level-b) | Senior |

### Exceptions & delivery governance

| Question | Level |
| --- | --- |
| [CORE-16 - What would your Clean Core governance pipeline contain?](../topics/08-clean-core.md#core-16-what-would-your-clean-core-governance-pipeline-contain) | Advanced |
| [GOV-04 - An urgent release needs an ATC exemption for an internal dependency. What makes the exception governable?](../topics/20-clean-core-senior.md#gov-04-an-urgent-release-needs-an-atc-exemption-for-an-internal-dependency-what-makes-the-exception-governable) | Senior |
| [GOV-11 - How would you enforce Clean Core in delivery without blocking every legacy transport immediately?](../topics/20-clean-core-senior.md#gov-11-how-would-you-enforce-clean-core-in-delivery-without-blocking-every-legacy-transport-immediately) | Senior |
| [GOV-12 - A vendor upgrade changes an object used by an approved Level C extension. How do you organize the response?](../topics/20-clean-core-senior.md#gov-12-a-vendor-upgrade-changes-an-object-used-by-an-approved-level-c-extension-how-do-you-organize-the-response) | Senior |
| [GOV-15 - A required report uses an internal read object with no current replacement. Would you accept Level C, and under what conditions?](../topics/20-clean-core-senior.md#gov-15-a-required-report-uses-an-internal-read-object-with-no-current-replacement-would-you-accept-level-c-and-under-what-conditions) | Senior |

### Modernization & upgrade planning

| Question | Level |
| --- | --- |
| [CORE-18 - How would you modernize a large custom-code portfolio?](../topics/08-clean-core.md#core-18-how-would-you-modernize-a-large-custom-code-portfolio) | Advanced |
| [GOV-06 - You have thousands of custom objects and a limited upgrade budget. How would you prioritize remediation?](../topics/20-clean-core-senior.md#gov-06-you-have-thousands-of-custom-objects-and-a-limited-upgrade-budget-how-would-you-prioritize-remediation) | Senior |
| [GOV-13 - What would a credible two-year custom-code modernization roadmap look like?](../topics/20-clean-core-senior.md#gov-13-what-would-a-credible-two-year-custom-code-modernization-roadmap-look-like) | Senior |
| [GOV-17 - The sponsor says Clean Core is a developer concern and rejects funding for integration monitoring and data cleanup. How would you negotiate?](../topics/20-clean-core-senior.md#gov-17-the-sponsor-says-clean-core-is-a-developer-concern-and-rejects-funding-for-integration-monitoring-and-data-cleanup-how-would-you-negotiate) | Senior |

## CDS modeling & security

30 questions. Build correct identities, relationships and query semantics while protecting every consumption path.

### Entities, keys & relationships

| Question | Level |
| --- | --- |
| [CDS-01 - What does ABAP CDS add to a SQL query?](../topics/04-cds-data-modeling.md#cds-01-what-does-abap-cds-add-to-a-sql-query) | Core |
| [CDS-02 - What is the difference between a classic CDS view and a CDS view entity?](../topics/04-cds-data-modeling.md#cds-02-what-is-the-difference-between-a-classic-cds-view-and-a-cds-view-entity) | Core |
| [CDS-03 - Association or join and how do you select cardinality?](../topics/04-cds-data-modeling.md#cds-03-association-or-join-and-how-do-you-select-cardinality) | Core |
| [CDS-04 - Association versus composition in RAP?](../topics/04-cds-data-modeling.md#cds-04-association-versus-composition-in-rap) | Core |
| [CDS-05 - What do interface composite consumption and projection mean?](../topics/04-cds-data-modeling.md#cds-05-what-do-interface-composite-consumption-and-projection-mean) | Core |
| [CDS-11 - How do CDS keys and database keys relate?](../topics/04-cds-data-modeling.md#cds-11-how-do-cds-keys-and-database-keys-relate) | Core |
| [MODEL-06 - Adding a language-dependent text association doubles order totals. Would DISTINCT be a good fix?](../topics/18-cds-security-senior.md#model-06-adding-a-language-dependent-text-association-doubles-order-totals-would-distinct-be-a-good-fix) | Senior |
| [MODEL-10 - Two rows in a service share the declared CDS key after a join. Why is this more than a display issue?](../topics/18-cds-security-senior.md#model-10-two-rows-in-a-service-share-the-declared-cds-key-after-a-join-why-is-this-more-than-a-display-issue) | Senior |

### Projections, annotations & evolution

| Question | Level |
| --- | --- |
| [CDS-08 - Where do UI annotations and value helps belong?](../topics/04-cds-data-modeling.md#cds-08-where-do-ui-annotations-and-value-helps-belong) | Core |
| [CDS-12 - Is a maintenance view a RAP view and how are defaults supplied?](../topics/04-cds-data-modeling.md#cds-12-is-a-maintenance-view-a-rap-view-and-how-are-defaults-supplied) | Core |
| [MODEL-08 - A transactional projection needs a calculated field that its provider contract does not permit. How do you redesign it?](../topics/18-cds-security-senior.md#model-08-a-transactional-projection-needs-a-calculated-field-that-its-provider-contract-does-not-permit-how-do-you-redesign-it) | Senior |
| [MODEL-17 - A released entity gains a new field that is expensive and sensitive. Is an additive change automatically safe?](../topics/18-cds-security-senior.md#model-17-a-released-entity-gains-a-new-field-that-is-expensive-and-sensitive-is-an-additive-change-automatically-safe) | Senior |

### DCL & authorization boundaries

| Question | Level |
| --- | --- |
| [CDS-07 - Does DCL on a base view automatically protect every higher view?](../topics/04-cds-data-modeling.md#cds-07-does-dcl-on-a-base-view-automatically-protect-every-higher-view) | Core |
| [MODEL-01 - A new consumption entity exposes orders outside the user's sales organization. The base CDS has DCL. What do you investigate?](../topics/18-cds-security-senior.md#model-01-a-new-consumption-entity-exposes-orders-outside-the-users-sales-organization-the-base-cds-has-dcl-what-do-you-investigate) | Senior |
| [MODEL-02 - An approver may update organization A. Can an update move an order from A to B using only existing-instance authorization?](../topics/18-cds-security-senior.md#model-02-an-approver-may-update-organization-a-can-an-update-move-an-order-from-a-to-b-using-only-existing-instance-authorization) | Senior |
| [MODEL-11 - A value help reveals customer names that the order list hides. Where should the fix live?](../topics/18-cds-security-senior.md#model-11-a-value-help-reveals-customer-names-that-the-order-list-hides-where-should-the-fix-live) | Senior |
| [MODEL-12 - A batch job asks to use privileged EML because normal authorization rejects it. How do you evaluate the request?](../topics/18-cds-security-senior.md#model-12-a-batch-job-asks-to-use-privileged-eml-because-normal-authorization-rejects-it-how-do-you-evaluate-the-request) | Senior |
| [MODEL-13 - A developer uses IN LOCAL MODE in a helper to avoid feature checks. What makes the helper safe or unsafe?](../topics/18-cds-security-senior.md#model-13-a-developer-uses-in-local-mode-in-a-helper-to-avoid-feature-checks-what-makes-the-helper-safe-or-unsafe) | Senior |
| [MODEL-14 - A CDS unit test passes, but the same entity leaks data for a restricted user. What may the test be missing?](../topics/18-cds-security-senior.md#model-14-a-cds-unit-test-passes-but-the-same-entity-leaks-data-for-a-restricted-user-what-may-the-test-be-missing) | Senior |
| [MODEL-15 - An integration user can access all tenants or clients through a custom read provider. What boundaries must be reviewed?](../topics/18-cds-security-senior.md#model-15-an-integration-user-can-access-all-tenants-or-clients-through-a-custom-read-provider-what-boundaries-must-be-reviewed) | Senior |
| [MODEL-16 - A projection hides an operation, but another consumer can still call the base BO. Is hiding sufficient?](../topics/18-cds-security-senior.md#model-16-a-projection-hides-an-operation-but-another-consumer-can-still-call-the-base-bo-is-hiding-sufficient) | Senior |

### Custom queries & virtual elements

| Question | Level |
| --- | --- |
| [CDS-06 - What are CDS abstract and custom entities?](../topics/04-cds-data-modeling.md#cds-06-what-are-cds-abstract-and-custom-entities) | Advanced |
| [CDS-09 - What is a virtual element and what are its limits?](../topics/04-cds-data-modeling.md#cds-09-what-is-a-virtual-element-and-what-are-its-limits) | Advanced |
| [MODEL-03 - A custom query returns only authorized rows but an unrestricted total count. Is it secure?](../topics/18-cds-security-senior.md#model-03-a-custom-query-returns-only-authorized-rows-but-an-unrestricted-total-count-is-it-secure) | Senior |
| [MODEL-04 - A query-provider filter cannot be converted to simple ranges. A developer catches the exception and returns everything. What is the correction?](../topics/18-cds-security-senior.md#model-04-a-query-provider-filter-cannot-be-converted-to-simple-ranges-a-developer-catches-the-exception-and-returns-everything-what-is-the-correction) | Senior |
| [MODEL-05 - A paged custom entity repeats some rows after an insertion. How would you make the contract predictable?](../topics/18-cds-security-senior.md#model-05-a-paged-custom-entity-repeats-some-rows-after-an-insertion-how-would-you-make-the-contract-predictable) | Senior |
| [MODEL-09 - The business wants to sort a million-row list by a virtual element computed through a remote call. What would you propose?](../topics/18-cds-security-senior.md#model-09-the-business-wants-to-sort-a-million-row-list-by-a-virtual-element-computed-through-a-remote-call-what-would-you-propose) | Senior |

### Analytics, amounts & aggregation

| Question | Level |
| --- | --- |
| [CDS-10 - How do analytical CDS models differ from transactional models?](../topics/04-cds-data-modeling.md#cds-10-how-do-analytical-cds-models-differ-from-transactional-models) | Advanced |
| [MODEL-07 - A CDS report sums 100 EUR and 100 USD into 200. What should the model and service do?](../topics/18-cds-security-senior.md#model-07-a-cds-report-sums-100-eur-and-100-usd-into-200-what-should-the-model-and-service-do) | Senior |
| [MODEL-18 - An analytical requirement is added to a transactional BO. Would you put every aggregate into its projection?](../topics/18-cds-security-senior.md#model-18-an-analytical-requirement-is-added-to-a-transactional-bo-would-you-put-every-aggregate-into-its-projection) | Senior |

## ABAP, OO & patterns

71 questions. Predict language behavior and design clear contracts, lifetimes and replaceable collaborators.

### Language & values

| Question | Level |
| --- | --- |
| [ABAP-04 - How do a work area, field symbol, and data reference differ?](../topics/01-abap-foundations.md#abap-04-how-do-a-work-area-field-symbol-and-data-reference-differ) | Core |
| [ABAP-05 - What is the difference between a domain, data element, structure, and table type?](../topics/01-abap-foundations.md#abap-05-what-is-the-difference-between-a-domain-data-element-structure-and-table-type) | Core |
| [ABAP-06 - How do a foreign key, check table, and value table differ in classic DDIC?](../topics/01-abap-foundations.md#abap-06-how-do-a-foreign-key-check-table-and-value-table-differ-in-classic-ddic) | Core |
| [ABAP-10 - How do you choose and propagate class-based exceptions?](../topics/01-abap-foundations.md#abap-10-how-do-you-choose-and-propagate-class-based-exceptions) | Core |
| [ABAP-12 - How do you handle amounts, quantities, dates, and timestamps correctly?](../topics/01-abap-foundations.md#abap-12-how-do-you-handle-amounts-quantities-dates-and-timestamps-correctly) | Core |
| [ABAP-14 - How would you investigate an ABAP failure without changing production behavior?](../topics/01-abap-foundations.md#abap-14-how-would-you-investigate-an-abap-failure-without-changing-production-behavior) | Core |
| [ABAP-07 - How do you explain an SAP LUW versus a database LUW?](../topics/01-abap-foundations.md#abap-07-how-do-you-explain-an-sap-luw-versus-a-database-luw) | Advanced |
| [ABAP-08 - Who should issue COMMIT WORK, and what does AND WAIT guarantee?](../topics/01-abap-foundations.md#abap-08-who-should-issue-commit-work-and-what-does-and-wait-guarantee) | Advanced |
| [ABAP-09 - Why do SAP enqueue locks exist in addition to database locks?](../topics/01-abap-foundations.md#abap-09-why-do-sap-enqueue-locks-exist-in-addition-to-database-locks) | Advanced |
| [ABAP-13 - When would you use RTTI, RTTC, or dynamic ABAP?](../topics/01-abap-foundations.md#abap-13-when-would-you-use-rtti-rttc-or-dynamic-abap) | Advanced |
| [BASE-04 - A dynamic ASSIGN fails, but IS ASSIGNED is still true. How can the program update the wrong field?](../topics/21-abap-foundations-deep.md#base-04-a-dynamic-assign-fails-but-is-assigned-is-still-true-how-can-the-program-update-the-wrong-field) | Advanced |
| [BASE-05 - A READ TABLE fails, yet a later IF sy-subrc = 0 takes the success branch. What do you inspect?](../topics/21-abap-foundations-deep.md#base-05-a-read-table-fails-yet-a-later-if-sy-subrc--0-takes-the-success-branch-what-do-you-inspect) | Advanced |
| [BASE-06 - An import must reject precision loss rather than silently round or truncate. Where does EXACT help?](../topics/21-abap-foundations-deep.md#base-06-an-import-must-reject-precision-loss-rather-than-silently-round-or-truncate-where-does-exact-help) | Advanced |
| [BASE-14 - An optional limit parameter is omitted in one call and explicitly set to zero in another. How can a method distinguish them?](../topics/21-abap-foundations-deep.md#base-14-an-optional-limit-parameter-is-omitted-in-one-call-and-explicitly-set-to-zero-in-another-how-can-a-method-distinguish-them) | Advanced |
| [BASE-01 - What changes when a method receives a CHANGING parameter by value instead of by reference?](../topics/21-abap-foundations-deep.md#base-01-what-changes-when-a-method-receives-a-changing-parameter-by-value-instead-of-by-reference) | Senior |
| [BASE-02 - A copied structure contains a string, a nested table, and an object reference. Is it an independent snapshot?](../topics/21-abap-foundations-deep.md#base-02-a-copied-structure-contains-a-string-a-nested-table-and-an-object-reference-is-it-an-independent-snapshot) | Senior |
| [BASE-07 - Two invoice totals differ by one cent although both use decimal types. How do you diagnose rounding?](../topics/21-abap-foundations-deep.md#base-07-two-invoice-totals-differ-by-one-cent-although-both-use-decimal-types-how-do-you-diagnose-rounding) | Senior |
| [BASE-12 - A report accepts a filter value and a sort-column name. Is escaping quotes sufficient for safe SQL?](../topics/21-abap-foundations-deep.md#base-12-a-report-accepts-a-filter-value-and-a-sort-column-name-is-escaping-quotes-sufficient-for-safe-sql) | Senior |
| [BASE-13 - A resource release is placed only in CLEANUP. Why can it remain unreleased after success?](../topics/21-abap-foundations-deep.md#base-13-a-resource-release-is-placed-only-in-cleanup-why-can-it-remain-unreleased-after-success) | Senior |

### Tables & expressions

| Question | Level |
| --- | --- |
| [ABAP-01 - How do you choose between standard, sorted, and hashed internal tables?](../topics/01-abap-foundations.md#abap-01-how-do-you-choose-between-standard-sorted-and-hashed-internal-tables) | Core |
| [ABAP-02 - What are primary, secondary, default, and empty internal table keys?](../topics/01-abap-foundations.md#abap-02-what-are-primary-secondary-default-and-empty-internal-table-keys) | Core |
| [ABAP-03 - When is BINARY SEARCH correct, and how do table expressions handle missing rows?](../topics/01-abap-foundations.md#abap-03-when-is-binary-search-correct-and-how-do-table-expressions-handle-missing-rows) | Core |
| [ABAP-11 - Which modern ABAP expressions are useful, and when should you avoid them?](../topics/01-abap-foundations.md#abap-11-which-modern-abap-expressions-are-useful-and-when-should-you-avoid-them) | Core |
| [BASE-03 - A large temporary internal table is no longer needed. When would you choose CLEAR or FREE?](../topics/21-abap-foundations-deep.md#base-03-a-large-temporary-internal-table-is-no-longer-needed-when-would-you-choose-clear-or-free) | Advanced |
| [BASE-08 - Why can replacing MOVE-CORRESPONDING with CORRESPONDING erase an existing structure field?](../topics/21-abap-foundations-deep.md#base-08-why-can-replacing-move-corresponding-with-corresponding-erase-an-existing-structure-field) | Advanced |
| [BASE-09 - Unsorted orders must be processed once per customer with their member rows. How does GROUP BY change the loop?](../topics/21-abap-foundations-deep.md#base-09-unsorted-orders-must-be-processed-once-per-customer-with-their-member-rows-how-does-group-by-change-the-loop) | Advanced |
| [BASE-10 - A FILTER expression is proposed for a standard table with an empty primary key. Is that enough?](../topics/21-abap-foundations-deep.md#base-10-a-filter-expression-is-proposed-for-a-standard-table-with-an-empty-primary-key-is-that-enough) | Advanced |
| [BASE-11 - A REDUCE expression calculates a maximum, but all-negative input returns zero. What went wrong?](../topics/21-abap-foundations-deep.md#base-11-a-reduce-expression-calculates-a-maximum-but-all-negative-input-returns-zero-what-went-wrong) | Advanced |
| [BASE-15 - A single-line INSERT INTO TABLE hits an existing unique primary key. Does it update the existing row?](../topics/21-abap-foundations-deep.md#base-15-a-single-line-insert-into-table-hits-an-existing-unique-primary-key-does-it-update-the-existing-row) | Advanced |
| [BASE-16 - An authorization helper returns an empty range table. Why is WHERE field IN range unsafe as the only access restriction?](../topics/21-abap-foundations-deep.md#base-16-an-authorization-helper-returns-an-empty-range-table-why-is-where-field-in-range-unsafe-as-the-only-access-restriction) | Senior |

### OO contracts

| Question | Level |
| --- | --- |
| [OO-01 - Explain abstraction, encapsulation, inheritance, and polymorphism with one example.](../topics/02-oo-clean-abap.md#oo-01-explain-abstraction-encapsulation-inheritance-and-polymorphism-with-one-example) | Core |
| [OO-02 - What can an ABAP interface contain, and when would you use one?](../topics/02-oo-clean-abap.md#oo-02-what-can-an-abap-interface-contain-and-when-would-you-use-one) | Core |
| [OO-03 - How do ABSTRACT and FINAL affect classes and methods?](../topics/02-oo-clean-abap.md#oo-03-how-do-abstract-and-final-affect-classes-and-methods) | Core |
| [OO-04 - How do upcasting and downcasting work in ABAP Objects?](../topics/02-oo-clean-abap.md#oo-04-how-do-upcasting-and-downcasting-work-in-abap-objects) | Core |
| [OO-05 - What is the difference between instance and static methods and constructors?](../topics/02-oo-clean-abap.md#oo-05-what-is-the-difference-between-instance-and-static-methods-and-constructors) | Core |
| [OO-06 - When do you prefer composition over inheritance?](../topics/02-oo-clean-abap.md#oo-06-when-do-you-prefer-composition-over-inheritance) | Core |
| [OO-07 - How do dependency injection and dependency inversion differ?](../topics/02-oo-clean-abap.md#oo-07-how-do-dependency-injection-and-dependency-inversion-differ) | Core |
| [OO-13 - What would you change first in a difficult legacy ABAP method?](../topics/02-oo-clean-abap.md#oo-13-what-would-you-change-first-in-a-difficult-legacy-abap-method) | Core |
| [OO-14 - How do you make an OO design testable, and what should ABAP Unit assert?](../topics/02-oo-clean-abap.md#oo-14-how-do-you-make-an-oo-design-testable-and-what-should-abap-unit-assert) | Core |
| [OO-17 - Two NEW calls create two objects. How often do constructor and class_constructor run, and in what order?](../topics/02-oo-clean-abap.md#oo-17-two-new-calls-create-two-objects-how-often-do-constructor-and-class_constructor-run-and-in-what-order) | Core |
| [OO-08 - How would you apply SOLID without overengineering?](../topics/02-oo-clean-abap.md#oo-08-how-would-you-apply-solid-without-overengineering) | Advanced |
| [OODEEP-04 - A subclass needs a different implementation and an extra mandatory input for an inherited method. Can REDEFINITION add it?](../topics/22-oo-contracts-deep.md#oodeep-04-a-subclass-needs-a-different-implementation-and-an-extra-mandatory-input-for-an-inherited-method-can-redefinition-add-it) | Advanced |
| [OODEEP-05 - A local test class needs access to private state. What does granting friendship expose, and what does it not imply?](../topics/22-oo-contracts-deep.md#oodeep-05-a-local-test-class-needs-access-to-private-state-what-does-granting-friendship-expose-and-what-does-it-not-imply) | Advanced |
| [OODEEP-01 - A method named reserve returns a reservation ID. Which promises must be explicit beyond its parameter types?](../topics/22-oo-contracts-deep.md#oodeep-01-a-method-named-reserve-returns-a-reservation-id-which-promises-must-be-explicit-beyond-its-parameter-types) | Senior |
| [OODEEP-02 - A new price-provider implementation rejects quantities below ten although the interface accepts any positive quantity. Is it a valid substitute?](../topics/22-oo-contracts-deep.md#oodeep-02-a-new-price-provider-implementation-rejects-quantities-below-ten-although-the-interface-accepts-any-positive-quantity-is-it-a-valid-substitute) | Senior |
| [OODEEP-03 - Two unrelated services share a capability and some validation code. Should their callers depend on an abstract superclass?](../topics/22-oo-contracts-deep.md#oodeep-03-two-unrelated-services-share-a-capability-and-some-validation-code-should-their-callers-depend-on-an-abstract-superclass) | Senior |
| [OODEEP-06 - Two references point to one resource-owning object. Does clearing one reference close the resource or destroy the object?](../topics/22-oo-contracts-deep.md#oodeep-06-two-references-point-to-one-resource-owning-object-does-clearing-one-reference-close-the-resource-or-destroy-the-object) | Senior |
| [OODEEP-07 - An object can be created with a missing repository and fails much later on its first business call. What would you change?](../topics/22-oo-contracts-deep.md#oodeep-07-an-object-can-be-created-with-a-missing-repository-and-fails-much-later-on-its-first-business-call-what-would-you-change) | Senior |
| [OODEEP-08 - A test passes alone but fails after another test changes CLASS-DATA. Why does NEW not reliably isolate it?](../topics/22-oo-contracts-deep.md#oodeep-08-a-test-passes-alone-but-fails-after-another-test-changes-class-data-why-does-new-not-reliably-isolate-it) | Senior |
| [OODEEP-09 - A repository raises a low-level exception. Should a business service catch CX_ROOT and return an empty result?](../topics/22-oo-contracts-deep.md#oodeep-09-a-repository-raises-a-low-level-exception-should-a-business-service-catch-cx_root-and-return-an-empty-result) | Senior |
| [OODEEP-10 - A getter returns a reference to a mutable internal collection. Has private visibility protected the object's invariants?](../topics/22-oo-contracts-deep.md#oodeep-10-a-getter-returns-a-reference-to-a-mutable-internal-collection-has-private-visibility-protected-the-objects-invariants) | Senior |
| [OODEEP-11 - A widely used provider interface needs an optional new capability. How do you avoid forcing unrelated implementations into fake behavior?](../topics/22-oo-contracts-deep.md#oodeep-11-a-widely-used-provider-interface-needs-an-optional-new-capability-how-do-you-avoid-forcing-unrelated-implementations-into-fake-behavior) | Senior |
| [OODEEP-12 - An OO unit test mocks calculate_total and then asserts the mocked total. What behavior has it proved?](../topics/22-oo-contracts-deep.md#oodeep-12-an-oo-unit-test-mocks-calculate_total-and-then-asserts-the-mocked-total-what-behavior-has-it-proved) | Senior |

### Patterns

| Question | Level |
| --- | --- |
| [OO-15 - How does MVC separate responsibilities?](../topics/02-oo-clean-abap.md#oo-15-how-does-mvc-separate-responsibilities) | Core |
| [OO-16 - Singleton, Factory or Facade: how do you choose with a simple example?](../topics/02-oo-clean-abap.md#oo-16-singleton-factory-or-facade-how-do-you-choose-with-a-simple-example) | Core |
| [OO-09 - What is a Factory, when do you use it, and how does it work with Strategy?](../topics/02-oo-clean-abap.md#oo-09-what-is-a-factory-when-do-you-use-it-and-how-does-it-work-with-strategy) | Advanced |
| [OO-10 - What is a Facade, when is it useful, and how does it differ from Adapter?](../topics/02-oo-clean-abap.md#oo-10-what-is-a-facade-when-is-it-useful-and-how-does-it-differ-from-adapter) | Advanced |
| [OO-11 - What is Singleton in ABAP, how do you implement it, and when would you use it?](../topics/02-oo-clean-abap.md#oo-11-what-is-singleton-in-abap-how-do-you-implement-it-and-when-would-you-use-it) | Advanced |
| [OO-12 - How do ABAP OO events differ from durable business events?](../topics/02-oo-clean-abap.md#oo-12-how-do-abap-oo-events-differ-from-durable-business-events) | Advanced |
| [PAT-01 - Approval rules vary by country, while the application workflow should remain stable. Strategy or Template Method?](../topics/23-design-patterns-practice.md#pat-01-approval-rules-vary-by-country-while-the-application-workflow-should-remain-stable-strategy-or-template-method) | Senior |
| [PAT-02 - A posting integration needs matching serializer and sender implementations for each provider. Is one static factory sufficient?](../topics/23-design-patterns-practice.md#pat-02-a-posting-integration-needs-matching-serializer-and-sender-implementations-for-each-provider-is-one-static-factory-sufficient) | Senior |
| [PAT-03 - A legacy posting API has awkward parameters and a three-step prepare/check/post sequence. Would you build an Adapter, a Facade, or both?](../topics/23-design-patterns-practice.md#pat-03-a-legacy-posting-api-has-awkward-parameters-and-a-three-step-preparecheckpost-sequence-would-you-build-an-adapter-a-facade-or-both) | Senior |
| [PAT-04 - You want timing, diagnostic logging and retries around an outbound service. Would stacked Decorators be safe?](../topics/23-design-patterns-practice.md#pat-04-you-want-timing-diagnostic-logging-and-retries-around-an-outbound-service-would-stacked-decorators-be-safe) | Senior |
| [PAT-05 - Three handlers can route a request to an approver. The first matching rule should win. How would you implement and test Chain of Responsibility?](../topics/23-design-patterns-practice.md#pat-05-three-handlers-can-route-a-request-to-an-approver-the-first-matching-rule-should-win-how-would-you-implement-and-test-chain-of-responsibility) | Senior |
| [PAT-06 - A local ABAP event updates an ALV, and the team proposes another handler to start an external workflow. What boundary has changed?](../topics/23-design-patterns-practice.md#pat-06-a-local-abap-event-updates-an-alv-and-the-team-proposes-another-handler-to-start-an-external-workflow-what-boundary-has-changed) | Senior |
| [PAT-07 - A command object represents Submit and can be queued or retried. Does using Command make execution idempotent or undoable?](../topics/23-design-patterns-practice.md#pat-07-a-command-object-represents-submit-and-can-be-queued-or-retried-does-using-command-make-execution-idempotent-or-undoable) | Senior |
| [PAT-08 - A repository interface improves testability, but its RAP implementation reads managed persistence directly. What can go wrong?](../topics/23-design-patterns-practice.md#pat-08-a-repository-interface-improves-testability-but-its-rap-implementation-reads-managed-persistence-directly-what-can-go-wrong) | Senior |
| [PAT-09 - A singleton caches the current approver and makes tests pass alone but fail as a suite. How do you redesign its lifetime?](../topics/23-design-patterns-practice.md#pat-09-a-singleton-caches-the-current-approver-and-makes-tests-pass-alone-but-fail-as-a-suite-how-do-you-redesign-its-lifetime) | Senior |
| [PAT-10 - A service obtains every dependency from a global factory inside its methods. How would you introduce dependency injection without building a framework?](../topics/23-design-patterns-practice.md#pat-10-a-service-obtains-every-dependency-from-a-global-factory-inside-its-methods-how-would-you-introduce-dependency-injection-without-building-a-framework) | Senior |
| [PAT-11 - A small report has one stable calculation. A reviewer requests Strategy, Abstract Factory and Repository 'for clean architecture'. How do you respond?](../topics/23-design-patterns-practice.md#pat-11-a-small-report-has-one-stable-calculation-a-reviewer-requests-strategy-abstract-factory-and-repository-for-clean-architecture-how-do-you-respond) | Senior |
| [PAT-12 - A factory selects country approval Strategies from configuration. How do you keep that combination safe, explainable and testable?](../topics/23-design-patterns-practice.md#pat-12-a-factory-selects-country-approval-strategies-from-configuration-how-do-you-keep-that-combination-safe-explainable-and-testable) | Senior |

## SQL & HANA performance

17 questions. Preserve result semantics, select a database implementation and measure actual cost.

### Selection, joins & result semantics

| Question | Level |
| --- | --- |
| [SQL-02 - What is the empty-table trap in FOR ALL ENTRIES?](../topics/03-sql-performance.md#sql-02-what-is-the-empty-table-trap-in-for-all-entries) | Core |
| [SQL-03 - When would you use a join instead of FOR ALL ENTRIES?](../topics/03-sql-performance.md#sql-03-when-would-you-use-a-join-instead-of-for-all-entries) | Core |
| [SQL-06 - How do GROUP BY, WHERE, and HAVING work together?](../topics/03-sql-performance.md#sql-06-how-do-group-by-where-and-having-work-together) | Core |
| [SQL-08 - Does SELECT SINGLE return a predictable first row?](../topics/03-sql-performance.md#sql-08-does-select-single-return-a-predictable-first-row) | Core |
| [SQL-04 - How can a LEFT OUTER JOIN accidentally behave like an inner join?](../topics/03-sql-performance.md#sql-04-how-can-a-left-outer-join-accidentally-behave-like-an-inner-join) | Advanced |
| [SQL-05 - What is the difference between SQL NULL and an ABAP initial value?](../topics/03-sql-performance.md#sql-05-what-is-the-difference-between-sql-null-and-an-abap-initial-value) | Advanced |
| [SQL-07 - What do cardinality and uniqueness mean for join correctness?](../topics/03-sql-performance.md#sql-07-what-do-cardinality-and-uniqueness-mean-for-join-correctness) | Advanced |

### Measurement, buffering & data design

| Question | Level |
| --- | --- |
| [SQL-09 - What do you optimize first in a slow data selection?](../topics/03-sql-performance.md#sql-09-what-do-you-optimize-first-in-a-slow-data-selection) | Core |
| [SQL-13 - What are normalization and denormalization, and how do they affect ABAP design?](../topics/03-sql-performance.md#sql-13-what-are-normalization-and-denormalization-and-how-do-they-affect-abap-design) | Core |
| [SQL-10 - How do ST05, SAT, SQL Monitor, and database plans complement each other?](../topics/03-sql-performance.md#sql-10-how-do-st05-sat-sql-monitor-and-database-plans-complement-each-other) | Advanced |
| [SQL-11 - Does SAP HANA remove the need for indexes and performance tuning?](../topics/03-sql-performance.md#sql-11-does-sap-hana-remove-the-need-for-indexes-and-performance-tuning) | Advanced |
| [SQL-12 - When is table buffering appropriate?](../topics/03-sql-performance.md#sql-12-when-is-table-buffering-appropriate) | Advanced |

### CDS, AMDP & pushdown

| Question | Level |
| --- | --- |
| [SQL-01 - How do ABAP SQL, Native SQL, CDS, and AMDP differ?](../topics/03-sql-performance.md#sql-01-how-do-abap-sql-native-sql-cds-and-amdp-differ) | Core |
| [SQL-14 - When is AMDP justified, and what risks must you address?](../topics/03-sql-performance.md#sql-14-when-is-amdp-justified-and-what-risks-must-you-address) | Advanced |
| [SQL-15 - AMDP procedure or CDS table function: what is the difference, and when would you use each?](../topics/03-sql-performance.md#sql-15-amdp-procedure-or-cds-table-function-what-is-the-difference-and-when-would-you-use-each) | Advanced |
| [SQLX-01 - A CDS table function joins client-dependent purchasing data in SQLScript, writes a helper table, and assumes the outer CDS DCL protects every internal read. Would you approve it?](../topics/24-delivery-and-hana-decisions.md#sqlx-01-a-cds-table-function-joins-client-dependent-purchasing-data-in-sqlscript-writes-a-helper-table-and-assumes-the-outer-cds-dcl-protects-every-internal-read-would-you-approve-it) | Senior |
| [SQLX-02 - A report transfers one million item rows to ABAP to calculate totals. A rewrite uses AMDP but doubles amounts after a text join. Which implementation would you recommend?](../topics/24-delivery-and-hana-decisions.md#sqlx-02-a-report-transfers-one-million-item-rows-to-abap-to-calculate-totals-a-rewrite-uses-amdp-but-doubles-amounts-after-a-text-join-which-implementation-would-you-recommend) | Senior |

## Protocols & integration

60 questions. Connect systems with explicit payload, security, transaction and recovery contracts.

### HTTP, REST & formats

| Question | Level |
| --- | --- |
| [HTTP-01 - What is the difference between HTTP, REST, OData and a payload format?](../topics/13-http-rest-formats.md#http-01-what-is-the-difference-between-http-rest-odata-and-a-payload-format) | Core |
| [HTTP-02 - What is inside an HTTP request and response?](../topics/13-http-rest-formats.md#http-02-what-is-inside-an-http-request-and-response) | Core |
| [HTTP-03 - How do GET, POST, PUT, PATCH and DELETE differ?](../topics/13-http-rest-formats.md#http-03-how-do-get-post-put-patch-and-delete-differ) | Core |
| [HTTP-05 - Which HTTP statuses should an ABAP API developer explain?](../topics/13-http-rest-formats.md#http-05-which-http-statuses-should-an-abap-api-developer-explain) | Core |
| [HTTP-06 - How do Accept and Content-Type differ?](../topics/13-http-rest-formats.md#http-06-how-do-accept-and-content-type-differ) | Core |
| [HTTP-07 - What must you preserve when mapping JSON to ABAP?](../topics/13-http-rest-formats.md#http-07-what-must-you-preserve-when-mapping-json-to-abap) | Core |
| [HTTP-08 - What XML concepts matter in an integration interview?](../topics/13-http-rest-formats.md#http-08-what-xml-concepts-matter-in-an-integration-interview) | Core |
| [HTTP-11 - How do authentication, authorization, CORS and CSRF differ?](../topics/13-http-rest-formats.md#http-11-how-do-authentication-authorization-cors-and-csrf-differ) | Core |
| [HTTP-04 - What do safe and idempotent mean, and how do they affect retries?](../topics/13-http-rest-formats.md#http-04-what-do-safe-and-idempotent-mean-and-how-do-they-affect-retries) | Advanced |
| [HTTP-09 - How do you choose ABAP JSON and XML processing tools?](../topics/13-http-rest-formats.md#http-09-how-do-you-choose-abap-json-and-xml-processing-tools) | Advanced |
| [HTTP-10 - How would you implement and troubleshoot an outbound HTTP call in ABAP?](../topics/13-http-rest-formats.md#http-10-how-would-you-implement-and-troubleshoot-an-outbound-http-call-in-abap) | Advanced |
| [HTTP-12 - How would you test an HTTP integration contract?](../topics/13-http-rest-formats.md#http-12-how-would-you-test-an-http-integration-contract) | Advanced |
| [HTTP-13 - How do you send a GET request with released ABAP HTTP APIs?](../topics/13-http-rest-formats.md#http-13-how-do-you-send-a-get-request-with-released-abap-http-apis) | Advanced |
| [HTTP-14 - How do you change remote data safely with PATCH or POST from ABAP?](../topics/13-http-rest-formats.md#http-14-how-do-you-change-remote-data-safely-with-patch-or-post-from-abap) | Advanced |

### OData & Fiori

| Question | Level |
| --- | --- |
| [ODATA-01 - OData V2 vs V4: what really changes, and what are the benefits of each?](../topics/07-odata-fiori.md#odata-01-odata-v2-vs-v4-what-really-changes-and-what-are-the-benefits-of-each) | Core |
| [ODATA-02 - What does $metadata describe?](../topics/07-odata-fiori.md#odata-02-what-does-metadata-describe) | Core |
| [ODATA-03 - What are the main query options?](../topics/07-odata-fiori.md#odata-03-what-are-the-main-query-options) | Core |
| [ODATA-05 - What is the difference between actions and functions?](../topics/07-odata-fiori.md#odata-05-what-is-the-difference-between-actions-and-functions) | Core |
| [ODATA-06 - How do ETags prevent lost updates?](../topics/07-odata-fiori.md#odata-06-how-do-etags-prevent-lost-updates) | Core |
| [ODATA-08 - What are MPC_EXT and DPC_EXT in classic Gateway?](../topics/07-odata-fiori.md#odata-08-what-are-mpc_ext-and-dpc_ext-in-classic-gateway) | Core |
| [ODATA-09 - How do authentication authorization and CSRF differ?](../topics/07-odata-fiori.md#odata-09-how-do-authentication-authorization-and-csrf-differ) | Core |
| [ODATA-04 - How do paging and total count work in V2 and V4?](../topics/07-odata-fiori.md#odata-04-how-do-paging-and-total-count-work-in-v2-and-v4) | Advanced |
| [ODATA-07 - Is a batch request one database transaction?](../topics/07-odata-fiori.md#odata-07-is-a-batch-request-one-database-transaction) | Advanced |
| [ODATA-10 - How do you design dates media and errors?](../topics/07-odata-fiori.md#odata-10-how-do-you-design-dates-media-and-errors) | Advanced |
| [ODATA-11 - How do you troubleshoot a slow or failing Fiori request?](../topics/07-odata-fiori.md#odata-11-how-do-you-troubleshoot-a-slow-or-failing-fiori-request) | Advanced |
| [ODATA-12 - How do you evolve an existing API safely?](../topics/07-odata-fiori.md#odata-12-how-do-you-evolve-an-existing-api-safely) | Advanced |

### RFC, BAPI & jobs

| Question | Level |
| --- | --- |
| [RFC-01 - How does a function module differ from an ABAP method?](../topics/14-rfc-background.md#rfc-01-how-does-a-function-module-differ-from-an-abap-method) | Core |
| [RFC-02 - How do synchronous, asynchronous, transactional, queued, and background RFC differ?](../topics/14-rfc-background.md#rfc-02-how-do-synchronous-asynchronous-transactional-queued-and-background-rfc-differ) | Core |
| [RFC-03 - What is the difference between a BAPI and an RFC-enabled function module?](../topics/14-rfc-background.md#rfc-03-what-is-the-difference-between-a-bapi-and-an-rfc-enabled-function-module) | Core |
| [RFC-10 - How do you schedule and troubleshoot a classic background job?](../topics/14-rfc-background.md#rfc-10-how-do-you-schedule-and-troubleshoot-a-classic-background-job) | Core |
| [RFC-11 - How do application jobs differ from classic report scheduling in ABAP Cloud?](../topics/14-rfc-background.md#rfc-11-how-do-application-jobs-differ-from-classic-report-scheduling-in-abap-cloud) | Core |
| [RFC-04 - When should BAPI_TRANSACTION_COMMIT or BAPI_TRANSACTION_ROLLBACK be called, and what does WAIT mean?](../topics/14-rfc-background.md#rfc-04-when-should-bapi_transaction_commit-or-bapi_transaction_rollback-be-called-and-what-does-wait-mean) | Advanced |
| [RFC-05 - Does a remote call participate in the caller's local SAP LUW?](../topics/14-rfc-background.md#rfc-05-does-a-remote-call-participate-in-the-callers-local-sap-luw) | Advanced |
| [RFC-06 - How would you collect results from CALL FUNCTION STARTING NEW TASK?](../topics/14-rfc-background.md#rfc-06-how-would-you-collect-results-from-call-function-starting-new-task) | Advanced |
| [RFC-07 - How do you prevent parallel RFC processing from exhausting resources?](../topics/14-rfc-background.md#rfc-07-how-do-you-prevent-parallel-rfc-processing-from-exhausting-resources) | Advanced |
| [RFC-08 - Why are WAIT and implicit database commits important in parallel processing?](../topics/14-rfc-background.md#rfc-08-why-are-wait-and-implicit-database-commits-important-in-parallel-processing) | Advanced |
| [RFC-09 - How would you design parallel workers that can be restarted safely?](../topics/14-rfc-background.md#rfc-09-how-would-you-design-parallel-workers-that-can-be-restarted-safely) | Advanced |
| [RFC-12 - Which operational and security checks make RFC or job processing production-ready?](../topics/14-rfc-background.md#rfc-12-which-operational-and-security-checks-make-rfc-or-job-processing-production-ready) | Advanced |

### IDoc & AIF

| Question | Level |
| --- | --- |
| [INTF-01 - What does an IDoc contain, and how do message type, basic type, and extension differ?](../topics/15-idoc-aif.md#intf-01-what-does-an-idoc-contain-and-how-do-message-type-basic-type-and-extension-differ) | Core |
| [INTF-02 - What do ALE distribution models, partner profiles, ports, and process codes do?](../topics/15-idoc-aif.md#intf-02-what-do-ale-distribution-models-partner-profiles-ports-and-process-codes-do) | Core |
| [INTF-03 - Walk through outbound and inbound IDoc processing.](../topics/15-idoc-aif.md#intf-03-walk-through-outbound-and-inbound-idoc-processing) | Core |
| [INTF-04 - How do you interpret common IDoc statuses without overstating success?](../topics/15-idoc-aif.md#intf-04-how-do-you-interpret-common-idoc-statuses-without-overstating-success) | Core |
| [INTF-05 - How would you investigate an IDoc that is missing or has failed?](../topics/15-idoc-aif.md#intf-05-how-would-you-investigate-an-idoc-that-is-missing-or-has-failed) | Core |
| [INTF-07 - What is SAP Application Interface Framework, and what is it not?](../topics/15-idoc-aif.md#intf-07-what-is-sap-application-interface-framework-and-what-is-it-not) | Core |
| [INTF-11 - When would you use OData, IDoc, or AIF?](../topics/15-idoc-aif.md#intf-11-when-would-you-use-odata-idoc-or-aif) | Core |
| [INTF-06 - How do you reprocess an IDoc without creating duplicate business documents?](../topics/15-idoc-aif.md#intf-06-how-do-you-reprocess-an-idoc-without-creating-duplicate-business-documents) | Advanced |
| [INTF-08 - How do AIF structure mappings, value mappings, checks, and actions work together?](../topics/15-idoc-aif.md#intf-08-how-do-aif-structure-mappings-value-mappings-checks-and-actions-work-together) | Advanced |
| [INTF-09 - How would you configure useful and secure AIF monitoring?](../topics/15-idoc-aif.md#intf-09-how-would-you-configure-useful-and-secure-aif-monitoring) | Advanced |
| [INTF-10 - What must you establish before resubmitting or editing a message in AIF?](../topics/15-idoc-aif.md#intf-10-what-must-you-establish-before-resubmitting-or-editing-a-message-in-aif) | Advanced |
| [INTF-12 - What security and end-to-end tests would you require for an IDoc or AIF interface?](../topics/15-idoc-aif.md#intf-12-what-security-and-end-to-end-tests-would-you-require-for-an-idoc-or-aif-interface) | Advanced |

### BTP services & connectivity

| Question | Level |
| --- | --- |
| [BTP-01 - What is BTP and how is ABAP Cloud different?](../topics/09-btp-integration.md#btp-01-what-is-btp-and-how-is-abap-cloud-different) | Core |
| [BTP-02 - How do global accounts subaccounts entitlements and spaces relate?](../topics/09-btp-integration.md#btp-02-how-do-global-accounts-subaccounts-entitlements-and-spaces-relate) | Core |
| [BTP-03 - What is the difference between IaaS PaaS and SaaS?](../topics/09-btp-integration.md#btp-03-what-is-the-difference-between-iaas-paas-and-saas) | Core |
| [BTP-04 - What are a service instance binding and service key?](../topics/09-btp-integration.md#btp-04-what-are-a-service-instance-binding-and-service-key) | Core |
| [BTP-06 - What do destinations and Cloud Connector solve?](../topics/09-btp-integration.md#btp-06-what-do-destinations-and-cloud-connector-solve) | Core |
| [BTP-09 - Which tools matter to an ABAP developer on BTP?](../topics/09-btp-integration.md#btp-09-which-tools-matter-to-an-abap-developer-on-btp) | Core |
| [BTP-05 - What do containers buildpacks droplets and routes do?](../topics/09-btp-integration.md#btp-05-what-do-containers-buildpacks-droplets-and-routes-do) | Advanced |
| [BTP-07 - How do remote transactions differ from local RAP transactions?](../topics/09-btp-integration.md#btp-07-how-do-remote-transactions-differ-from-local-rap-transactions) | Advanced |
| [BTP-08 - What makes event-driven integration reliable?](../topics/09-btp-integration.md#btp-08-what-makes-event-driven-integration-reliable) | Advanced |
| [BTP-10 - How would you secure and operate a side-by-side extension?](../topics/09-btp-integration.md#btp-10-how-would-you-secure-and-operate-a-side-by-side-extension) | Advanced |

## Testing, delivery & operations

29 questions. Turn design claims into test evidence, traceable delivery and recoverable production behavior.

### Test design & doubles

| Question | Level |
| --- | --- |
| [TEST-01 - What makes a useful ABAP Unit test?](../topics/11-testing-security.md#test-01-what-makes-a-useful-abap-unit-test) | Core |
| [TEST-02 - How does dependency injection help?](../topics/11-testing-security.md#test-02-how-does-dependency-injection-help) | Core |
| [TEST-10 - How should you describe tests you have not run?](../topics/11-testing-security.md#test-10-how-should-you-describe-tests-you-have-not-run) | Core |
| [TEST-03 - How would you test a RAP business object?](../topics/11-testing-security.md#test-03-how-would-you-test-a-rap-business-object) | Advanced |
| [TEST-04 - How do SQL and CDS test doubles help?](../topics/11-testing-security.md#test-04-how-do-sql-and-cds-test-doubles-help) | Advanced |
| [OPS-01 - How would you test a Submit action without replacing the business object you are supposed to verify?](../topics/19-cloud-production-senior.md#ops-01-how-would-you-test-a-submit-action-without-replacing-the-business-object-you-are-supposed-to-verify) | Senior |
| [OPS-02 - When would SQL doubles, CDS doubles and RAP BO doubles give misleading confidence?](../topics/19-cloud-production-senior.md#ops-02-when-would-sql-doubles-cds-doubles-and-rap-bo-doubles-give-misleading-confidence) | Senior |
| [OPS-03 - A bulk EML action processes ten requests and rejects two. What should its test assert?](../topics/19-cloud-production-senior.md#ops-03-a-bulk-eml-action-processes-ten-requests-and-rejects-two-what-should-its-test-assert) | Senior |
| [OPS-04 - A draft test passes when run alone but fails after another test. What would you inspect?](../topics/19-cloud-production-senior.md#ops-04-a-draft-test-passes-when-run-alone-but-fails-after-another-test-what-would-you-inspect) | Senior |
| [OPS-15 - A team advertises 95% coverage while never asserting FAILED or persisted state. How would you improve it?](../topics/19-cloud-production-senior.md#ops-15-a-team-advertises-95-coverage-while-never-asserting-failed-or-persisted-state-how-would-you-improve-it) | Senior |
| [OPS-18 - How would you communicate senior readiness when you can review code locally but cannot run SAP checks?](../topics/19-cloud-production-senior.md#ops-18-how-would-you-communicate-senior-readiness-when-you-can-review-code-locally-but-cannot-run-sap-checks) | Senior |

### Security & concurrency tests

| Question | Level |
| --- | --- |
| [TEST-06 - What security tests would you include?](../topics/11-testing-security.md#test-06-what-security-tests-would-you-include) | Core |
| [TEST-07 - How do you test concurrency and rollback?](../topics/11-testing-security.md#test-07-how-do-you-test-concurrency-and-rollback) | Advanced |
| [OPS-05 - How do you prove optimistic concurrency rather than merely calling the same update twice?](../topics/19-cloud-production-senior.md#ops-05-how-do-you-prove-optimistic-concurrency-rather-than-merely-calling-the-same-update-twice) | Senior |

### Diagnosis, performance & recovery

| Question | Level |
| --- | --- |
| [TEST-09 - How would you investigate a production defect?](../topics/11-testing-security.md#test-09-how-would-you-investigate-a-production-defect) | Advanced |
| [OPS-06 - Fiori still displays an old total after a successful action. How do you separate UI refresh from backend correctness?](../topics/19-cloud-production-senior.md#ops-06-fiori-still-displays-an-old-total-after-a-successful-action-how-do-you-separate-ui-refresh-from-backend-correctness) | Senior |
| [OPS-07 - A RAP list becomes slow after enabling count and expanding children. What do you measure first?](../topics/19-cloud-production-senior.md#ops-07-a-rap-list-becomes-slow-after-enabling-count-and-expanding-children-what-do-you-measure-first) | Senior |
| [OPS-08 - A custom entity calls a remote API once for every returned row. How would you remove the N+1 pattern?](../topics/19-cloud-production-senior.md#ops-08-a-custom-entity-calls-a-remote-api-once-for-every-returned-row-how-would-you-remove-the-n1-pattern) | Senior |
| [OPS-11 - A remote approval succeeded, but the RAP caller timed out. How should an operator recover?](../topics/19-cloud-production-senior.md#ops-11-a-remote-approval-succeeded-but-the-rap-caller-timed-out-how-should-an-operator-recover) | Senior |
| [OPS-12 - A failed save leaves no business record, but support still needs diagnostics. How would you log it safely?](../topics/19-cloud-production-senior.md#ops-12-a-failed-save-leaves-no-business-record-but-support-still-needs-diagnostics-how-would-you-log-it-safely) | Senior |
| [OPS-13 - A production incident starts after a release. How do you contain it without making the data worse?](../topics/19-cloud-production-senior.md#ops-13-a-production-incident-starts-after-a-release-how-do-you-contain-it-without-making-the-data-worse) | Senior |
| [OPS-17 - A cloud job processes 500,000 records and times out. How would you redesign it?](../topics/19-cloud-production-senior.md#ops-17-a-cloud-job-processes-500000-records-and-times-out-how-would-you-redesign-it) | Senior |

### Delivery, compatibility & release evidence

| Question | Level |
| --- | --- |
| [TEST-05 - What does ATC cover and what remains outside it?](../topics/11-testing-security.md#test-05-what-does-atc-cover-and-what-remains-outside-it) | Core |
| [TEST-08 - What would you include in a transport and deployment handoff?](../topics/11-testing-security.md#test-08-what-would-you-include-in-a-transport-and-deployment-handoff) | Core |
| [OPS-09 - A service works in development but fails after transport. What evidence should the handoff have included?](../topics/19-cloud-production-senior.md#ops-09-a-service-works-in-development-but-fails-after-transport-what-evidence-should-the-handoff-have-included) | Senior |
| [OPS-10 - How would you evolve a released RAP service when an action needs a new mandatory input?](../topics/19-cloud-production-senior.md#ops-10-how-would-you-evolve-a-released-rap-service-when-an-action-needs-a-new-mandatory-input) | Senior |
| [OPS-14 - What belongs in a RAP release gate beyond a passing ATC run?](../topics/19-cloud-production-senior.md#ops-14-what-belongs-in-a-rap-release-gate-beyond-a-passing-atc-run) | Senior |
| [OPS-16 - How would you prepare an extension for a platform upgrade?](../topics/19-cloud-production-senior.md#ops-16-how-would-you-prepare-an-extension-for-a-platform-upgrade) | Senior |
| [DELIV-01 - A pull request passes local linting and its ABAP sources are pushed with abapGit. The team calls the cloud feature deployed. What evidence and delivery steps are missing?](../topics/24-delivery-and-hana-decisions.md#deliv-01-a-pull-request-passes-local-linting-and-its-abap-sources-are-pushed-with-abapgit-the-team-calls-the-cloud-feature-deployed-what-evidence-and-delivery-steps-are-missing) | Senior |

## Enhancements & workflow

15 questions. Scope classic deliverables and connect extension mechanisms, migration and approval processing.

### Scoping, interfaces & migration

| Question | Level |
| --- | --- |
| [RICEFW-01 - What does RICEFW mean, and how would you scope a deliverable?](../topics/10-ricefw-workflow.md#ricefw-01-what-does-ricefw-mean-and-how-would-you-scope-a-deliverable) | Core |
| [RICEFW-02 - How do you choose between a standard API, IDoc, migration tooling, and BDC?](../topics/10-ricefw-workflow.md#ricefw-02-how-do-you-choose-between-a-standard-api-idoc-migration-tooling-and-bdc) | Core |
| [RICEFW-06 - How would you troubleshoot a failed IDoc in a classic system?](../topics/10-ricefw-workflow.md#ricefw-06-how-would-you-troubleshoot-a-failed-idoc-in-a-classic-system) | Core |
| [RICEFW-05 - How would you design a reliable interface?](../topics/10-ricefw-workflow.md#ricefw-05-how-would-you-design-a-reliable-interface) | Advanced |
| [RICEFW-07 - What makes a data conversion safe and supportable?](../topics/10-ricefw-workflow.md#ricefw-07-what-makes-a-data-conversion-safe-and-supportable) | Advanced |
| [RICEFW-15 - Which S/4HANA changes can affect existing ABAP developments?](../topics/10-ricefw-workflow.md#ricefw-15-which-s4hana-changes-can-affect-existing-abap-developments) | Advanced |

### Enhancements & forms

| Question | Level |
| --- | --- |
| [RICEFW-03 - How do BAdIs, customer exits, and user exits differ?](../topics/10-ricefw-workflow.md#ricefw-03-how-do-badis-customer-exits-and-user-exits-differ) | Core |
| [RICEFW-04 - What is the difference between implicit and explicit enhancement options?](../topics/10-ricefw-workflow.md#ricefw-04-what-is-the-difference-between-implicit-and-explicit-enhancement-options) | Core |
| [RICEFW-08 - How do you choose between SAPscript, Smart Forms, and Adobe output forms?](../topics/10-ricefw-workflow.md#ricefw-08-how-do-you-choose-between-sapscript-smart-forms-and-adobe-output-forms) | Core |

### Workflow & approval lifecycle

| Question | Level |
| --- | --- |
| [RICEFW-09 - How do classic Workflow, Flexible Workflow, and SAP Build Process Automation differ?](../topics/10-ricefw-workflow.md#ricefw-09-how-do-classic-workflow-flexible-workflow-and-sap-build-process-automation-differ) | Core |
| [RICEFW-10 - What are a workflow container, task, work item, and agent?](../topics/10-ricefw-workflow.md#ricefw-10-what-are-a-workflow-container-task-work-item-and-agent) | Core |
| [RICEFW-11 - How should a RAP submit action start an approval process reliably?](../topics/10-ricefw-workflow.md#ricefw-11-how-should-a-rap-submit-action-start-an-approval-process-reliably) | Advanced |
| [RICEFW-12 - How do you handle duplicate events, stale approvals, and callback retries?](../topics/10-ricefw-workflow.md#ricefw-12-how-do-you-handle-duplicate-events-stale-approvals-and-callback-retries) | Advanced |
| [RICEFW-13 - How would you diagnose a workflow that did not start or is stuck?](../topics/10-ricefw-workflow.md#ricefw-13-how-would-you-diagnose-a-workflow-that-did-not-start-or-is-stuck) | Advanced |
| [RICEFW-14 - How would you test a workflow or enhancement end to end?](../topics/10-ricefw-workflow.md#ricefw-14-how-would-you-test-a-workflow-or-enhancement-end-to-end) | Advanced |

## Interview stories & judgment

6 questions. Explain your own work, defend decisions and identify the evidence or context still missing.

### Project stories & results

| Question | Level |
| --- | --- |
| [STORY-01 - How would you introduce yourself for an ABAP role?](../topics/12-interview-stories.md#story-01-how-would-you-introduce-yourself-for-an-abap-role) | Core |
| [STORY-02 - How do you explain a project you owned?](../topics/12-interview-stories.md#story-02-how-do-you-explain-a-project-you-owned) | Core |
| [STORY-04 - How do you discuss a performance improvement?](../topics/12-interview-stories.md#story-04-how-do-you-discuss-a-performance-improvement) | Core |

### Decisions & interviewer questions

| Question | Level |
| --- | --- |
| [STORY-06 - What should you ask the interviewer?](../topics/12-interview-stories.md#story-06-what-should-you-ask-the-interviewer) | Core |
| [STORY-03 - How do you answer a question when the SAP release is unknown?](../topics/12-interview-stories.md#story-03-how-do-you-answer-a-question-when-the-sap-release-is-unknown) | Advanced |
| [STORY-05 - How would you defend an architecture trade-off?](../topics/12-interview-stories.md#story-05-how-would-you-defend-an-architecture-trade-off) | Advanced |
