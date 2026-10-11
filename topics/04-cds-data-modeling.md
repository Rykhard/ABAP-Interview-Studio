# CDS data modeling

Explain the data model before discussing annotations. A strong answer connects entity identity, association cardinality, authorization and the intended consumer. Distinguish a reusable CDS model from a transactional RAP projection and from an analytical query.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## CDS-01 What does ABAP CDS add to a SQL query?

**Level:** Core

**Short answer:** CDS defines reusable, semantically enriched data models in the ABAP repository. A model can describe elements, associations, annotations and access control, and can serve different consumers. SQL computes the result; CDS also supplies a stable model contract. Transactional behavior is added separately through RAP.

**Example and follow-up:** For a sales-order list, expose keys, customer associations, currency semantics and authorized rows once. Several consumers can use that model without each recreating the joins.

**Avoid this mistake:** A CDS definition does not automatically implement create, update and delete operations.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

## CDS-02 What is the difference between a classic CDS view and a CDS view entity?

**Level:** Core

**Short answer:** A classic define view creates a CDS entity plus a separately named DDIC SQL view using AbapCatalog.sqlViewName. A define view entity avoids that separate DDIC SQL-view artifact and is the preferred choice for new supported scenarios. Choose according to the target release and consumer compatibility.

**Example and follow-up:** During migration, inventory consumers that refer directly to the generated SQL-view name. Changing the source definition is not sufficient if those consumers still depend on the old object.

**Avoid this mistake:** Do not copy AbapCatalog.sqlViewName into a view entity or assume all older systems support view entities.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

## CDS-03 Association or join and how do you select cardinality?

**Level:** Core

**Short answer:** An association models a reusable relationship; a path expression can cause a join when the relationship is consumed. A join explicitly combines sources in the current query. Cardinality must describe the actual data relationship and ON condition. Wrong to-one assumptions can produce incorrect or optimizer-dependent results.

**Example and follow-up:** For a flight-to-carrier association, an ON condition matching the carrier key can justify a to-one target cardinality if the data satisfies it. The flight's own identity is a separate question: it may require carrier, connection and flight date. Adding a date to the flight key does not establish the carrier relationship's cardinality. Test duplicate and missing target rows.

**Avoid this mistake:** Associations are not automatically faster than joins and do not enforce referential integrity.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: CDS links and ownership</summary>

![CDS links and ownership](../visuals/cds-relationships.svg)

Items belong to the order BO; a partner reference crosses to an independently managed object.

**Explain it:** What breaks if a declared to-one relationship actually returns two partners?

**Limit:** Composition semantics and generated operations still require the corresponding RAP model.

</details>

## CDS-04 Association versus composition in RAP?

**Level:** Core

**Short answer:** An association represents a relationship. A composition describes ownership within a RAP business-object tree, such as order and items. The root defines the aggregate boundary, with dependent locking and authorization where modeled. Exposed projections redirect associations and compositions to the corresponding projected entities.

**Example and follow-up:** An item cannot be treated as an unrelated aggregate just because it has its own table. Explain create-by-association and what happens when the parent is deleted.

**Avoid this mistake:** Not every foreign key should become a composition; lifecycle ownership is the deciding factor.

**Read and verify this answer:**

- [SAP Learning on compositions](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-compositions-in-odata-ui-services) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: CDS links and ownership</summary>

![CDS links and ownership](../visuals/cds-relationships.svg)

Items belong to the order BO; a partner reference crosses to an independently managed object.

**Explain it:** What breaks if a declared to-one relationship actually returns two partners?

**Limit:** Composition semantics and generated operations still require the corresponding RAP model.

</details>

## CDS-05 What do interface composite consumption and projection mean?

**Level:** Core

**Short answer:** Interface and consumption names describe modeling roles, while VDM basic, composite and consumption annotations describe a virtual data model convention. A RAP projection adapts one underlying entity for a use case under its provider contract. These labels are not interchangeable and do not themselves publish a service.

**Example and follow-up:** Keep reusable business semantics below the consumer projection. Expose only needed fields and operations, and redirect associations consistently. Avoid adding layers whose only purpose is a naming pattern.

**Avoid this mistake:** A VDM composite annotation is neither a prerequisite for service binding nor permission to perform arbitrary joins in a RAP projection.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## CDS-06 What are CDS abstract and custom entities?

**Level:** Advanced

**Short answer:** An abstract entity describes a structured type without a database result, often for action parameters, results or events. A custom entity represents a query model whose data is supplied by an ABAP implementation instead of a generated SQL query. Neither is an object-oriented abstract superclass.

**Example and follow-up:** A Submit action may accept an abstract entity containing a comment. A custom query provider may assemble data from a remote service and must handle requested filters, paging and count.

**Avoid this mistake:** Do not describe an abstract entity as a BO that other CDS entities inherit and persist.

**Read and verify this answer:**

- [SAP CDS abstract entities](https://help.sap.com/docs/abap-cloud/abap-data-models/cds-abstract-entities) - Check the entity type, provider contract and target-release restrictions.

## CDS-07 Does DCL on a base view automatically protect every higher view?

**Level:** Core

**Short answer:** No. Read authorization must be designed for each externally accessed CDS entity. A higher view can use its own access control with inherited conditions where supported. Merely adding AccessControl.authorizationCheck: #CHECK does not invent an access rule. RAP operation authorization is a separate concern.

**Example and follow-up:** Test the projection used by the actual service with users from different company codes. Inspect the effective DCL and inheritance mapping, not just a protected lower-layer view.

**Avoid this mistake:** DCL on one layer does not automatically secure an arbitrary view-on-view stack.

**Read and verify this answer:**

- [SAP Learning on DCL inheritance](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: CDS security boundaries</summary>

![CDS security boundaries](../visuals/cds-security-boundaries.svg)

Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.

**Explain it:** Which two tests prove that an exposed service rejects unauthorized access?

**Limit:** Authorization behavior depends on the access path and supported DCL inheritance mechanisms.

</details>

## CDS-08 Where do UI annotations and value helps belong?

**Level:** Core

**Short answer:** Use metadata extensions for supported UI and consumption annotations when the model permits extensions. Keep core data semantics, such as amount and currency relationships, in the data model. Check annotation eligibility, layer precedence and release support rather than moving every annotation mechanically.

**Example and follow-up:** A Fiori elements list can use line-item annotations and a currency-aware amount. A value help supports selection, but the backend must still validate submitted values and authorizations.

**Avoid this mistake:** UI.hidden and a value help are not security or data-integrity controls.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: RAP contract stack</summary>

![RAP contract stack](../visuals/rap-contract-stack.svg)

Read from the client down to storage, then explain what each artifact contributes.

**Explain it:** Where would you restrict the exposed operation set?

**Limit:** Conceptual layers; the exact artifact set depends on the scenario and release.

</details>

## CDS-09 What is a virtual element and what are its limits?

**Level:** Advanced

**Short answer:** A virtual element is calculated in the application layer for a supported query scenario, commonly through a SADL calculation exit. It does not become a database column. Filtering, sorting and requesting the element need explicit supported handling and may differ by service and release.

**Example and follow-up:** A display-only status text derived from an external source may fit. A field needed for efficient database filtering usually belongs in SQL/CDS or persistence instead. Fetch only needed calculation inputs.

**Avoid this mistake:** requestAtLeast is a UI request hint, not a universal guarantee that every consumer calculates a virtual element.

**Read and verify this answer:**

- [SAP RAP: implementing sorting of virtual elements](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-sorting-of-virtual-elements) - Explains transformation of supported virtual-element sort requests before retrieval. Verify projection, protocol, interface release and consumer restrictions on the target release.

<details>
<summary>Visual: Calculation placement and query semantics</summary>

![Calculation placement and query semantics](../visuals/rap-query-calculation-placement.svg)

Use the requirement to decide where a value must exist before filtering, ordering or aggregation.

**Explain it:** Why can a correct calculation still yield a wrong page of results?

**Limit:** Architecture alternatives, not a promise that all listed options are supported by each projection/custom provider.

</details>

## CDS-10 How do analytical CDS models differ from transactional models?

**Level:** Advanced

**Short answer:** Analytical models organize measures and dimensions, often around a cube and an analytical query or analytical projection. Transactional RAP models focus on identifiable instances and business operations. Aggregations must respect units, currencies and the query engine. One model is not automatically suitable for both purposes.

**Example and follow-up:** Never sum EUR and USD amounts without the intended conversion or grouping. Confirm which analytical features the chosen protocol and consuming application actually execute.

**Avoid this mistake:** A VDM annotation or an OData $apply request alone does not guarantee correct analytical semantics.

**Read and verify this answer:**

- [SAP analytical projection views](https://learning.sap.com/courses/developing-analytical-models-with-cds-based-analytical-projection-views/describing-the-role-of-a-cds-analytical-projection-view) - Check the entity type, provider contract and target-release restrictions.

## CDS-11 How do CDS keys and database keys relate?

**Level:** Core

**Short answer:** A CDS key communicates entity identity to consumers but does not automatically enforce uniqueness in the query result. Database keys enforce uniqueness in persistence. Joins, missing key elements and aggregations can change result uniqueness. RAP and OData need stable, truly unique entity identities.

**Example and follow-up:** If SFLIGHT rows differ by CARRID, CONNID and FLDATE, exposing only the first two as identity can merge or confuse rows in a client. Include the full business-relevant identity.

**Avoid this mistake:** Marking an element key does not remove duplicate rows.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.

<details>
<summary>Visual: CDS links and ownership</summary>

![CDS links and ownership](../visuals/cds-relationships.svg)

Items belong to the order BO; a partner reference crosses to an independently managed object.

**Explain it:** What breaks if a declared to-one relationship actually returns two partners?

**Limit:** Composition semantics and generated operations still require the corresponding RAP model.

</details>

## CDS-12 Is a maintenance view a RAP view and how are defaults supplied?

**Level:** Core

**Short answer:** A classic DDIC maintenance view belongs to table/view maintenance, often with generated maintenance dialogs. A RAP application uses a CDS model and behavior instead. RAP defaults may be implemented with determinations or supported defaulting functions; field visibility depends on the chosen UI and metadata.

**Example and follow-up:** First clarify whether the interviewer means SM30 maintenance or a Fiori RAP maintenance app. Then explain the appropriate maintenance events or RAP behavior mechanism.

**Avoid this mistake:** Metadata.ignore and Metadata.defaultValue are not generic annotations that implement maintenance behavior.

**Read and verify this answer:**

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e) - Check the entity type, provider contract and target-release restrictions.
- [SAP Learning on DCL inheritance](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks) - Check the entity type, provider contract and target-release restrictions.

## Official references

- [SAP Learning on CDS concepts](https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/exploring-abap-core-data-services_f6b58d1f-ca51-461b-8355-aef95aa3864e)
- [SAP Learning on DCL inheritance](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks)
- [SAP Learning on compositions](https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-compositions-in-odata-ui-services)
- [SAP analytical projection views](https://learning.sap.com/courses/developing-analytical-models-with-cds-based-analytical-projection-views/describing-the-role-of-a-cds-analytical-projection-view)
- [SAP CDS abstract entities](https://help.sap.com/docs/abap-cloud/abap-data-models/cds-abstract-entities)
- [SAP RAP: implementing sorting of virtual elements](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-sorting-of-virtual-elements)
