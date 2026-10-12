# Worked code examples

Read these excerpts alongside their linked questions in the app. Select a step there to highlight the important lines. These are teaching fragments with stated prerequisites, not complete activated SAP applications.

## Give the business rule business values

The eligibility calculation can run without an HTTP request, database row or RAP message object.

Questions: [CLOUD-15](https://abap-interview-studio.pages.dev/#q-CLOUD-15)

**Where this belongs:** Method body of your own policy class. amount and minimum are importing decfloat34 values; blocked is an importing abap_bool; result is the returning abap_bool. The caller supplies values and translates the result into its UI or service response.

```abap
METHOD is_eligible.
  result = xsdbool(
    amount >= minimum
    AND blocked = abap_false ).
ENDMETHOD.
```

**Read it step by step:**

1. **Calculate one business decision** (lines 2, 3, 4): The method compares the amount and blocked flag. It does not read an HTTP request, issue SQL or build a framework message.
2. **Return a simple result** (lines 2): The caller receives abap_true or abap_false. A RAP adapter can report the decision without making the policy class depend on RAP response types.

**What happens:** For amount 500, minimum 300 and blocked = abap_false, the result is true. A unit test can check that rule without an HTTP server or a database.

**Scope:** A deliberately small policy, not a complete approval process or authorization check. Keep permission checks, currency rules, meaningful rejection reasons and transaction ownership in the complete design. No SAP execution is claimed.

**Primary references:**

- [SAP Clean ABAP: methods and testability](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md)

## The wrapper still calls a dependency

Renaming a call or converting its result does not change the release status of the API behind it.

Questions: [CORE-08](https://abap-interview-studio.pages.dev/#q-CORE-08), [GOV-03](https://abap-interview-studio.pages.dev/#q-GOV-03)

**Where this belongs:** Method body of a custom wrapper in a classic component on a system that permits this design. dependency is a bound object with a declared read_order method; order_id and result use your custom public types. Assume the implementation behind dependency was checked and still uses an unreleased SAP object. No particular SAP API is invented here.

```abap
METHOD read_order.
  DATA(ls_order) = dependency->read_order(
    order_id = order_id ).
  result = CORRESPONDING #( ls_order ).
ENDMETHOD.
```

**Read it step by step:**

1. **Follow the actual call** (lines 2, 3): This is the next dependency to inspect. Releasing the custom wrapper for its callers does not release the SAP object used underneath.
2. **Separate mapping from classification** (lines 4): Mapping into your own result type can protect callers from some interface changes. It cannot remove the implementation's original dependency or upgrade risk.

**What happens:** The caller sees a small custom interface, but the dependency still needs its real classification, an owner, tests and a replacement plan. The whole chain has not become Level A.

**Scope:** Illustrative wrapper body with prerequisite types and methods, not a workaround for restricted ABAP Cloud or Public Edition. Inspect actual SAP calls and configured implementations; this fragment alone cannot establish a Clean Core level.

**Primary references:**

- [SAP Learning: Clean Core checks and release contracts](https://learning.sap.com/courses/practicing-clean-core-extensibility-for-sap-s-4hana-cloud/creating-tier-2-cloud-apis_a75bf2cd-815c-42bb-8d3b-2bba4931ecad)

## One key, one order

Choose a table that matches the lookup you need.

Questions: [ABAP-01](https://abap-interview-studio.pages.dev/#q-ABAP-01), [ABAP-02](https://abap-interview-studio.pages.dev/#q-ABAP-02)

**Where this belongs:** Self-contained method-body fragment. Fixture values describe an in-memory example, not database orders.

```abap
TYPES: BEGIN OF ty_order,
         order_id TYPE i,
         amount   TYPE i,
       END OF ty_order.
DATA lt_orders TYPE HASHED TABLE OF ty_order
  WITH UNIQUE KEY order_id.
lt_orders = VALUE #( ( order_id = 7 amount = 100 )
                     ( order_id = 9 amount = 200 ) ).
DATA(ls_order) = lt_orders[ order_id = 9 ].
```

**Read it step by step:**

1. **Define the lookup** (lines 1, 2, 3, 4, 5, 6): The complete unique key is order_id. The hashed table is designed for this exact-key access.
2. **Read order 9** (lines 7, 8, 9): The result is the row with amount 200. No manual sorting or numeric row position is needed.

**What happens:** Order 9 is found by its identity. A standard table with an empty key would express a different access choice.

**Scope:** This example guarantees the row exists. Handle missing keys in real code; a hashed key is not a range-search index.

**Primary references:**

- [SAP: Internal tables](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md)

## Missing row: expected or an error?

A lookup that may miss needs an explicit decision.

Questions: [ABAP-03](https://abap-interview-studio.pages.dev/#q-ABAP-03)

**Where this belongs:** Self-contained method-body fragment. This example treats absence as expected and represents it as an unbound reference.

```abap
TYPES: BEGIN OF ty_order,
         order_id TYPE i,
         amount   TYPE i,
       END OF ty_order.
DATA lt_orders TYPE HASHED TABLE OF ty_order
  WITH UNIQUE KEY order_id.
INSERT VALUE #( order_id = 7 amount = 100 )
  INTO TABLE lt_orders.
DATA(order_ref) = REF #( lt_orders[ order_id = 9 ]
                        OPTIONAL ).
DATA(found) = xsdbool( order_ref IS BOUND ).
```

**Read it step by step:**

1. **Only order 7 exists** (lines 7, 8): There is deliberately no order 9 in the table.
2. **Keep absence visible** (lines 9, 10, 11): REF with OPTIONAL produces an unbound reference for the missing row. found is false.

**What happens:** A plain lt_orders[ order_id = 9 ] would raise CX_SY_ITAB_LINE_NOT_FOUND. This form avoids confusing a missing row with a real row containing initial values.

**Scope:** Use OPTIONAL only when absence is an allowed outcome. If the order is required, report or handle the missing-row error instead.

**Primary references:**

- [SAP: Internal tables](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md)
- [SAP: Default values for table expressions](https://help.sap.com/docs/abap-cloud/abap-keyword/table-exp-default)

## A copy and a direct row change

Watch which assignment actually changes the table.

Questions: [ABAP-04](https://abap-interview-studio.pages.dev/#q-ABAP-04), [BASE-05](https://abap-interview-studio.pages.dev/#q-BASE-05)

**Where this belongs:** Self-contained method-body fragment. Both reads succeed because fixture row 1 exists.

```abap
TYPES: BEGIN OF ty_order,
         amount TYPE i,
       END OF ty_order.
DATA lt_orders TYPE STANDARD TABLE OF ty_order
  WITH EMPTY KEY.
lt_orders = VALUE #( ( amount = 100 ) ).
READ TABLE lt_orders INDEX 1 INTO DATA(ls_order).
IF sy-subrc = 0.
  ls_order-amount = 200.
ENDIF.
READ TABLE lt_orders INDEX 1
  ASSIGNING FIELD-SYMBOL(<ls_order>).
IF sy-subrc = 0.
  <ls_order>-amount = 300.
ENDIF.
```

**Read it step by step:**

1. **Change the copy** (lines 7, 8, 9, 10): INTO copies the row. Setting ls_order to 200 leaves the table amount at 100.
2. **Change the actual row** (lines 11, 12, 13, 14, 15): ASSIGNING points to the row. The table amount becomes 300. Each sy-subrc is checked immediately after its read.

**What happens:** The work area ends at 200, while the table row ends at 300. A later statement must not overwrite sy-subrc before its result is checked.

**Scope:** Field symbols are aliases, not independent snapshots. Do not modify sorted or hashed primary key fields through them.

**Primary references:**

- [SAP: Internal tables](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md)

## Keep an unmatched field during mapping

BASE decides whether the new structure starts with existing values.

Questions: [ABAP-11](https://abap-interview-studio.pages.dev/#q-ABAP-11), [BASE-08](https://abap-interview-studio.pages.dev/#q-BASE-08)

**Where this belongs:** Self-contained method-body fragment with small local structures. Text literals are fixture data.

```abap
TYPES: BEGIN OF ty_request,
         status TYPE string,
         note   TYPE string,
       END OF ty_request.
TYPES: BEGIN OF ty_change,
         note TYPE string,
       END OF ty_change.
DATA(ls_old) = VALUE ty_request(
  status = `Approved` note = `Old note` ).
DATA(ls_change) = VALUE ty_change( note = `New note` ).
DATA(ls_plain) = CORRESPONDING ty_request( ls_change ).
DATA(ls_kept) = CORRESPONDING ty_request(
  BASE ( ls_old ) ls_change ).
```

**Read it step by step:**

1. **Start with approved data** (lines 8, 9, 10): The input change has a note field but no status field.
2. **Build from initial values** (lines 11): ls_plain gets the new note and an empty status.
3. **Build from the old value** (lines 12, 13): ls_kept keeps Approved and receives the new note.

**What happens:** The same source produces different status values. BASE preserves unmatched fields; it does not mean ignore initial source values.

**Scope:** If the source type also contained status, that matching field would overwrite the old status even when blank. API PATCH needs explicit field-presence rules.

**Primary references:**

- [SAP: Constructor expressions](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/05_Constructor_Expressions.md)

## Reject lost characters at the input boundary

An identifier must fit; silently cutting it changes its meaning.

Questions: [BASE-06](https://abap-interview-studio.pages.dev/#q-BASE-06)

**Where this belongs:** Self-contained method-body fragment. The four-character string is intentional test input.

```abap
TYPES ty_code TYPE c LENGTH 3.
DATA(input) = `ABCD`.
DATA(ordinary) = CONV ty_code( input ).
DATA rejected TYPE abap_bool.
TRY.
    DATA(lossless) = EXACT ty_code( input ).
  CATCH cx_sy_conversion_data_loss.
    rejected = abap_true.
ENDTRY.
```

**Read it step by step:**

1. **Normal conversion** (lines 1, 2, 3): The target has room for three characters. Normal conversion keeps ABC.
2. **Require an exact value** (lines 5, 6, 7, 8, 9): EXACT rejects the nonblank character loss. The catch marks this input as rejected.

**What happens:** The program can report invalid input instead of storing a different identifier. Technical exactness is checked before business validation.

**Scope:** The sample records rejection only. A real import must return a useful field-level error and also validate permitted values.

**Primary references:**

- [SAP: Constructor expressions](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/05_Constructor_Expressions.md)

## A local change is copied back only on success

The VALUE addition changes what an escaping exception leaves in the caller.

Questions: [BASE-01](https://abap-interview-studio.pages.dev/#q-BASE-01)

**Where this belongs:** Excerpts from one local class: first the public declaration, then its implementation method. Define lcx_rejected as a CX_STATIC_CHECK subclass. A caller starts amount at 10 and catches lcx_rejected.

```abap
METHODS change_amount
  CHANGING VALUE(amount) TYPE i
  RAISING lcx_rejected.

METHOD change_amount.
  amount = 20.
  RAISE EXCEPTION TYPE lcx_rejected.
ENDMETHOD.
```

**Read it step by step:**

1. **Declare value passing** (lines 1, 2, 3): The method works on its own amount value. Without VALUE, CHANGING defaults to reference passing.
2. **Exit with an exception** (lines 5, 6, 7, 8): The local amount becomes 20, but the method does not complete normally, so it is not copied back.

**What happens:** The caller keeps 10 with this VALUE signature. With reference passing, the same assignment would already have changed the caller value to 20.

**Scope:** This protects the plain value only. It does not undo database writes or changes to an object reached through a copied reference.

**Primary references:**

- [SAP: Method parameter passing](https://help.sap.com/docs/abap-cloud/abap-keyword/methods-parameters)

## Do not write through yesterday's field symbol

A failed dynamic lookup must not leave a usable old target.

Questions: [BASE-04](https://abap-interview-studio.pages.dev/#q-BASE-04)

**Where this belongs:** Self-contained method-body fragment. The misspelled component name is intentional test input. UNASSIGN avoids depending on newer ELSE UNASSIGN syntax.

```abap
DATA: BEGIN OF ls_order,
        amount TYPE i VALUE 100,
      END OF ls_order.
FIELD-SYMBOLS <amount> TYPE any.
ASSIGN COMPONENT 'AMOUNT' OF STRUCTURE ls_order
  TO <amount>.
UNASSIGN <amount>.
ASSIGN COMPONENT 'AMUONT' OF STRUCTURE ls_order
  TO <amount>.
IF sy-subrc = 0.
  <amount> = 200.
ENDIF.
```

**Read it step by step:**

1. **Clear the earlier binding** (lines 5, 6, 7): The first lookup succeeds. UNASSIGN deliberately removes that old target.
2. **Check the new lookup** (lines 8, 9, 10, 11, 12): AMUONT does not exist. sy-subrc is not zero, so the code cannot write through the old AMOUNT binding.

**What happens:** ls_order-amount stays 100. Checking only IS ASSIGNED without clearing the old binding could update the wrong field after a failed lookup.

**Scope:** The sample skips the invalid input to show the effect. A real mapper should report it or apply an explicitly documented skip rule.

**Primary references:**

- [SAP: Assignment failure and ELSE UNASSIGN](https://help.sap.com/docs/abap-cloud/abap-keyword/news-for-abap-release-7-89)

## Omitted is different from zero

The caller may deliberately ask for no rows.

Questions: [BASE-14](https://abap-interview-studio.pages.dev/#q-BASE-14)

**Where this belongs:** Excerpts from one local class: public declaration and matching implementation. effective is a returning integer; this method only chooses a limit and does not execute a query.

```abap
METHODS choose_limit
  IMPORTING requested TYPE i OPTIONAL
  RETURNING VALUE(effective) TYPE i.

METHOD choose_limit.
  CONSTANTS co_default_limit TYPE i VALUE 20.
  IF requested IS SUPPLIED.
    effective = requested.
  ELSE.
    effective = co_default_limit.
  ENDIF.
ENDMETHOD.
```

**Read it step by step:**

1. **Allow omission** (lines 1, 2, 3): OPTIONAL lets the caller omit requested.
2. **Test presence, not value** (lines 6, 7, 8, 9, 10, 11): choose_limit( ) returns 20. choose_limit( requested = 0 ) returns 0 because the argument was supplied.

**What happens:** The two calls keep their different meaning. Checking IS INITIAL would incorrectly treat an explicit zero as omission.

**Scope:** A wrapper that always forwards requested loses omission information. Also handle zero before any query syntax where zero might mean unlimited rows; validate negative input separately.

**Primary references:**

- [SAP: Optional method parameters](https://help.sap.com/docs/abap-cloud/abap-keyword/methods-parameters)
- [SAP: ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)

## A duplicate INSERT is not an update

The first order value does not silently become the second.

Questions: [BASE-15](https://abap-interview-studio.pages.dev/#q-BASE-15)

**Where this belongs:** Self-contained method-body fragment. This is single-row INSERT into an internal table with a unique primary key.

```abap
TYPES: BEGIN OF ty_order,
         order_id TYPE i,
         amount   TYPE i,
       END OF ty_order.
DATA lt_orders TYPE HASHED TABLE OF ty_order
  WITH UNIQUE KEY order_id.
INSERT VALUE #( order_id = 7 amount = 100 )
  INTO TABLE lt_orders.
INSERT VALUE #( order_id = 7 amount = 200 )
  INTO TABLE lt_orders.
DATA(duplicate) = xsdbool( sy-subrc = 4 ).
DATA(ls_kept) = lt_orders[ order_id = 7 ].
```

**Read it step by step:**

1. **Insert the first row** (lines 7, 8): Order 7 gets amount 100.
2. **Try the same key again** (lines 9, 10, 11, 12): The second INSERT fails with sy-subrc 4. The existing row still contains 100; duplicate is true.

**What happens:** The unique key prevents two rows, but it does not choose whether conflicting import values should be rejected or replaced.

**Scope:** This return-code behavior describes this single-row primary-key case. Other insertion forms and secondary-key violations can raise exceptions.

**Primary references:**

- [SAP: Internal tables](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md)

## Group rows even when they are apart

Customer 1 appears twice, with customer 2 between its orders.

Questions: [BASE-09](https://abap-interview-studio.pages.dev/#q-BASE-09)

**Where this belongs:** Self-contained method-body fragment. The grouped loop calculates a per-customer total in memory; inspect total during each outer-loop iteration.

```abap
TYPES: BEGIN OF ty_order,
         customer TYPE i,
         amount   TYPE i,
       END OF ty_order.
DATA lt_orders TYPE STANDARD TABLE OF ty_order
  WITH EMPTY KEY.
lt_orders = VALUE #( ( customer = 1 amount = 10 )
                     ( customer = 2 amount = 20 )
                     ( customer = 1 amount = 30 ) ).
LOOP AT lt_orders INTO DATA(ls_order)
  GROUP BY ls_order-customer INTO DATA(customer).
  DATA(total) = 0.
  LOOP AT GROUP customer INTO DATA(ls_member).
    total += ls_member-amount.
  ENDLOOP.
ENDLOOP.
```

**Read it step by step:**

1. **Notice the unsorted input** (lines 7, 8, 9): The customer sequence is 1, 2, 1. Related rows are not adjacent.
2. **Visit each group and its members** (lines 10, 11, 12, 13, 14, 15, 16): The outer loop runs twice. The member loop totals 40 for customer 1 and 20 for customer 2.

**What happens:** GROUP BY finds both customer 1 rows without a preceding SORT. This is different from relying on adjacent control-level groups.

**Scope:** This is ABAP memory processing. If only database totals are required, consider a supported SQL aggregation instead. Define output order separately.

**Primary references:**

- [SAP: Internal tables](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md)

## An empty driver must not become a full read

The guard is part of correctness, not just a speed trick.

Questions: [SQL-02](https://abap-interview-studio.pages.dev/#q-SQL-02), [SQL-03](https://abap-interview-studio.pages.dev/#q-SQL-03)

**Where this belongs:** Method-body fragment. Own fixture table zt_demo_order has key order_id and amount. lt_ids is an already-populated internal table whose row structure has order_id with the same type as the database field. lt_orders is a compatible result table.

```abap
CLEAR lt_orders.
IF lt_ids IS NOT INITIAL.
  SELECT order_id, amount
    FROM zt_demo_order
    FOR ALL ENTRIES IN @lt_ids
    WHERE order_id = @lt_ids-order_id
    INTO TABLE @lt_orders.
ENDIF.
```

**Read it step by step:**

1. **Handle no requested IDs** (lines 1, 2): The output is empty and the database statement is skipped when lt_ids is empty.
2. **Read the requested orders** (lines 3, 4, 5, 6, 7): For a nonempty driver, the query matches order_id against its values.

**What happens:** An empty request returns no orders. Without the guard, FOR ALL ENTRIES ignores its WHERE condition for an empty driver and can read all rows in scope.

**Scope:** FOR ALL ENTRIES removes duplicate result rows. Keep the identity columns needed by the result and compare a join using actual result and performance requirements. Fixture tables are not SAP APIs.

**Primary references:**

- [SAP: ABAP SQL](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)
- [SAP: FOR ALL ENTRIES behavior](https://help.sap.com/docs/SUPPORT_CONTENT/abap/3353526117.html)

## Keep an order even without an English text

Put the language rule where text rows are matched.

Questions: [SQL-04](https://abap-interview-studio.pages.dev/#q-SQL-04), [SQL-05](https://abap-interview-studio.pages.dev/#q-SQL-05), [SQL-07](https://abap-interview-studio.pages.dev/#q-SQL-07)

**Where this belongs:** Method-body fragment. Own fixture tables: zt_demo_order has unique order_id; zt_demo_text has unique (order_id, language), plus description. language is CHAR 1. No extra business authorization is shown.

```abap
CONSTANTS co_english TYPE c LENGTH 1 VALUE 'E'.
SELECT o~order_id, t~description
  FROM zt_demo_order AS o
  LEFT OUTER JOIN zt_demo_text AS t
    ON t~order_id = o~order_id
   AND t~language = @co_english
  INTO TABLE @DATA(lt_orders).
```

**Read it step by step:**

1. **Choose right-side matches** (lines 3, 4, 5, 6): An English text matches if it exists. Its language condition belongs to ON here.
2. **Keep every left-side row** (lines 2, 3, 4, 5, 6, 7): An order without an English text still appears. A WHERE t~language = co_english would remove it.

**What happens:** Orders stay visible even without translated text. The stated unique text key also prevents several English rows from multiplying each order.

**Scope:** The missing description is SQL NULL before transfer. Without null indicators, its ABAP target becomes initial, so this result alone cannot distinguish missing text from a stored empty description.

**Primary references:**

- [SAP: ABAP SQL](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)
- [SAP: Left outer join](https://help.sap.com/docs/abap-cloud/abap-keyword/left-outer-join)

## Send totals instead of every item

Filter first, sum matching rows, then keep the required groups.

Questions: [SQL-06](https://abap-interview-studio.pages.dev/#q-SQL-06), [SQL-09](https://abap-interview-studio.pages.dev/#q-SQL-09), [SQLX-02](https://abap-interview-studio.pages.dev/#q-SQLX-02)

**Where this belongs:** Method-body fragment. Own fixture table zt_demo_item contains company, currency, amount and is_cancelled. amount is an exact decimal type; amounts within each currency use the same unit convention. minimum_total is deliberately zero for the example.

```abap
DATA minimum_total TYPE decfloat34 VALUE 0.
SELECT company, currency, SUM( amount ) AS total
  FROM zt_demo_item
  WHERE is_cancelled = @abap_false
  GROUP BY company, currency
  HAVING SUM( amount ) > @minimum_total
  INTO TABLE @DATA(lt_totals).
```

**Read it step by step:**

1. **Remove cancelled items** (lines 3, 4): WHERE acts on individual rows before they enter the totals.
2. **Keep currency groups separate** (lines 2, 3, 4, 5): The database calculates one total per company and currency instead of sending every item.
3. **Filter the totals** (lines 6, 7): HAVING keeps only groups whose calculated total is positive.

**What happens:** The output contains summarized rows with their currencies. There is no text join here that could multiply an item before summing it.

**Scope:** Currency grouping prevents mixing unlike currencies; it does not perform conversion. Real authorization, numeric range, decimal handling and measured query cost still need validation.

**Primary references:**

- [SAP: ABAP SQL](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)

## Latest requires an explicit order

A one-row limit does not choose what latest means.

Questions: [SQL-08](https://abap-interview-studio.pages.dev/#q-SQL-08)

**Where this belongs:** Method-body fragment. Own fixture table zt_demo_order has unique numeric order_id, customer_id and changed_at timestamp. customer_id is the method input. No matching row leaves lt_latest empty.

```abap
SELECT order_id, changed_at
  FROM zt_demo_order
  WHERE customer_id = @customer_id
  ORDER BY changed_at DESCENDING, order_id DESCENDING
  INTO TABLE @DATA(lt_latest)
  UP TO 1 ROWS.
```

**Read it step by step:**

1. **Choose the relevant customer** (lines 1, 2, 3): The conditions may match many orders, so SELECT SINGLE would not express the latest one.
2. **Define the winning row** (lines 4, 5, 6): Sort by newest timestamp, then by order_id to break ties, and return at most one row.

**What happens:** The latest timestamp wins. If two timestamps are equal, the larger order ID wins according to this explicit example rule.

**Scope:** The tie-breaker is a chosen business rule, not a property of SELECT SINGLE. Validate authorization and an appropriate query plan for the real source.

**Primary references:**

- [SAP: ABAP SQL](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)

## No allowed plants means no data

Do not let an empty permission result become an unrestricted filter.

Questions: [BASE-16](https://abap-interview-studio.pages.dev/#q-BASE-16), [TEST-06](https://abap-interview-studio.pages.dev/#q-TEST-06)

**Where this belongs:** Method-body fragment. A trusted authorization helper already supplied lt_allowed_plants as positive include-EQ range rows. lt_orders is the output. Own fixture table zt_demo_order contains order_id and plant.

```abap
CLEAR lt_orders.
IF lt_allowed_plants IS INITIAL.
  RETURN.
ENDIF.
SELECT order_id, plant
  FROM zt_demo_order
  WHERE plant IN @lt_allowed_plants
  INTO TABLE @lt_orders.
```

**Read it step by step:**

1. **Stop when permission is empty** (lines 1, 2, 3, 4): The method returns an empty result before running SQL.
2. **Apply mandatory permission** (lines 5, 6, 7, 8): Only a nonempty set of allowed plants reaches the query. Optional user filters must not replace this restriction.

**What happens:** A user with no allowed plants receives no rows. Directly using an initial range in IN would instead impose no restriction.

**Scope:** This is a guard, not a complete authorization implementation. The helper must return actual permitted values; test denied API access as well as UI behavior. Exclusion-only ranges require their own policy.

**Primary references:**

- [SAP: ABAP SQL](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md)

## Call the rule through one interface

The coordinator asks what the rule decides, without choosing its calculation.

Questions: [OO-01](https://abap-interview-studio.pages.dev/#q-OO-01), [OO-02](https://abap-interview-studio.pages.dev/#q-OO-02), [OO-09](https://abap-interview-studio.pages.dev/#q-OO-09), [PAT-01](https://abap-interview-studio.pages.dev/#q-PAT-01)

**Where this belongs:** Local-interface declaration followed by an excerpt inside a coordinator method. strategy is a bound reference to an implementing class, and amount is an input. Each implementation decides its own rule without committing or sending messages.

```abap
INTERFACE lif_approval.
  METHODS needs_manager
    IMPORTING amount TYPE decfloat34
    RETURNING VALUE(required) TYPE abap_bool.
ENDINTERFACE.

DATA rule TYPE REF TO lif_approval.
rule = strategy.
DATA(requires_manager) = rule->needs_manager(
  amount = amount ).
```

**Read it step by step:**

1. **Agree on one operation** (lines 1, 2, 3, 4, 5): Every strategy accepts an amount and returns whether a manager is required.
2. **Use the selected implementation** (lines 7, 8, 9, 10): The same call reaches the actual strategy object. The coordinator does not branch on country here.

**What happens:** Changing the rule object changes the decision logic while the coordinator call stays the same. That is Strategy through interface polymorphism.

**Scope:** The snippet defines the interface and call, not complete country rules. Test each implementation against the shared promises and keep workflow side effects in the coordinator.

**Primary references:**

- [SAP: ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)

## Require the helper when creating the service

Give the service its dependency once, then use that exact object.

Questions: [OO-06](https://abap-interview-studio.pages.dev/#q-OO-06), [OO-07](https://abap-interview-studio.pages.dev/#q-OO-07), [TEST-02](https://abap-interview-studio.pages.dev/#q-TEST-02), [PAT-10](https://abap-interview-studio.pages.dev/#q-PAT-10), [OODEEP-07](https://abap-interview-studio.pages.dev/#q-OODEEP-07)

**Where this belongs:** Constructor implementation excerpt. The class declares constructor IMPORTING repository TYPE REF TO lif_repository RAISING lcx_configuration, and a private repository attribute of that interface type. lcx_configuration is an application CX_STATIC_CHECK subclass.

```abap
METHOD constructor.
  IF repository IS NOT BOUND.
    RAISE EXCEPTION TYPE lcx_configuration.
  ENDIF.
  me->repository = repository.
ENDMETHOD.
```

**Read it step by step:**

1. **Reject missing setup early** (lines 1, 2, 3, 4): A typed reference can still be initial. This check prevents creating a service that fails much later.
2. **Keep the supplied helper** (lines 5, 6): Production supplies a real repository; tests supply a controlled implementation of the same interface.

**What happens:** The constructor makes the dependency visible and valid. The service no longer needs a hidden global factory lookup in each business method.

**Scope:** This is an application-owned class. Do not add unsupported constructor parameters to framework-created RAP handlers; delegate to a suitable service or use supported seams.

**Primary references:**

- [SAP: ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)
- [SAP: ABAP Unit tests](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/14_ABAP_Unit_Tests.md)

## Configuration chooses from known rules

An unknown country must not fall back to approval.

Questions: [OO-09](https://abap-interview-studio.pages.dev/#q-OO-09), [PAT-12](https://abap-interview-studio.pages.dev/#q-PAT-12)

**Where this belongs:** Factory method excerpt. get_rule imports a two-character country value through a named character type, returns rule TYPE REF TO lif_approval, and raises lcx_configuration. Both local rule classes implement lif_approval and have no required constructor parameters.

```abap
METHOD get_rule.
  CONSTANTS co_poland TYPE c LENGTH 2 VALUE 'PL'.
  CONSTANTS co_germany TYPE c LENGTH 2 VALUE 'DE'.
  CASE country.
    WHEN co_poland.
      rule = NEW lcl_polish_rule( ).
    WHEN co_germany.
      rule = NEW lcl_german_rule( ).
    WHEN OTHERS.
      RAISE EXCEPTION TYPE lcx_configuration.
  ENDCASE.
ENDMETHOD.
```

**Read it step by step:**

1. **Map supported choices** (lines 2, 3, 4, 5, 6, 7, 8): The factory creates one of two known implementations of the same interface.
2. **Fail unsupported setup** (lines 9, 10): Blank or unknown configuration produces an error instead of silently picking a permissive rule.

**What happens:** Test PL, DE and an unknown value separately from the approval calculations. This is a simple factory; it is not automatically the formal Factory Method pattern.

**Scope:** Class and exception names are local teaching fixtures, not SAP APIs. Real configuration may also need a policy version and an audit record of the chosen rule.

**Primary references:**

- [SAP: ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)

## Translate one interface into another

The caller uses business-friendly fields; the adapter handles the old format.

Questions: [OO-10](https://abap-interview-studio.pages.dev/#q-OO-10), [PAT-03](https://abap-interview-studio.pages.dev/#q-PAT-03)

**Where this belongs:** Implementation of lif_payment~post. Its inputs are amount TYPE decfloat34 and a three-character currency value declared through a named character type; returning result is TYPE i. Bound legacy has execute IMPORTING ls_request TYPE ty_legacy_request RETURNING VALUE(result) TYPE i. ty_legacy_request has gross_value and curr_key matching those inputs.

```abap
METHOD lif_payment~post.
  DATA(ls_request) = VALUE ty_legacy_request(
    gross_value = amount
    curr_key = currency ).
  result = legacy->execute( ls_request = ls_request ).
ENDMETHOD.
```

**Read it step by step:**

1. **Translate the request** (lines 1, 2, 3, 4): The public amount and currency become the names expected by the legacy dependency. An explicit zero is copied too.
2. **Delegate one operation** (lines 5, 6): The adapter calls the dependency and returns its result. The application caller need not know gross_value or curr_key.

**What happens:** This illustrates Adapter field mapping. A Facade would separately coordinate a larger prepare/check/post sequence.

**Scope:** legacy is a local illustrative interface, not a named SAP API. Real wrappers must also translate errors and preserve authorization and transaction ownership; wrapping cannot remove an internal commit or release an API.

**Primary references:**

- [SAP: ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)

## Add one behavior around the same call

A decorator forwards the real call while adding a small behavior of its own.

Questions: [PAT-04](https://abap-interview-studio.pages.dev/#q-PAT-04), [OO-06](https://abap-interview-studio.pages.dev/#q-OO-06)

**Where this belongs:** Implementation excerpt. This class implements lif_sender with send IMPORTING payload TYPE string RETURNING VALUE(response) TYPE string. inner is a required, bound lif_sender reference supplied through its constructor. attempts is a private integer attribute initialized to zero. The class also declares METHODS get_attempts RETURNING VALUE(count) TYPE i.

```abap
METHOD lif_sender~send.
  attempts += 1.
  response = inner->send( payload = payload ).
ENDMETHOD.

METHOD get_attempts.
  count = attempts.
ENDMETHOD.
```

**Read it step by step:**

1. **Wrap without replacing** (lines 1, 2, 3, 4): The decorator counts the attempt and forwards exactly once. The inner result and escaping exception are not turned into fake success.
2. **Observe the added behavior** (lines 6, 7, 8): get_attempts returns count TYPE i. The counter includes failed calls because it increments before delegation.

**What happens:** One wrapper invocation adds one attempt. Placing this inside or outside a retry wrapper would count attempts or logical operations differently.

**Scope:** The counter lives only in this object. It is neither durable logging nor a retry policy. Retrying a remote write needs explicit duplicate and unknown-outcome handling.

**Primary references:**

- [SAP: ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)

## Keep the original failure when translating it

Unavailable data must not become a successful empty result.

Questions: [ABAP-10](https://abap-interview-studio.pages.dev/#q-ABAP-10), [OODEEP-09](https://abap-interview-studio.pages.dev/#q-OODEEP-09)

**Where this belongs:** Method excerpt. repository is a bound local interface reference whose read_price( ) returns decfloat34 and raises lcx_repository. This get_price method returns price TYPE decfloat34 and declares RAISING lcx_price_unavailable. Both exceptions are application CX_STATIC_CHECK subclasses with the inherited PREVIOUS constructor parameter.

```abap
METHOD get_price.
  TRY.
      price = repository->read_price( ).
    CATCH lcx_repository INTO DATA(cause).
      RAISE EXCEPTION TYPE lcx_price_unavailable
        EXPORTING previous = cause.
  ENDTRY.
ENDMETHOD.
```

**Read it step by step:**

1. **Catch the failure you understand** (lines 2, 3, 4): Only the declared repository failure is translated here. It is not a successful no-price result.
2. **Preserve the cause** (lines 5, 6): The business-facing exception keeps the original exception in PREVIOUS for diagnosis.

**What happens:** The caller receives a clear unavailable failure instead of a zero price. Support can inspect why the repository failed.

**Scope:** The custom exception classes and signatures are prerequisites, not delivered SAP objects. Real user-facing messages should be translatable and must not expose sensitive technical details.

**Primary references:**

- [SAP: ABAP Objects](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md)

## Test the rule itself at its boundary

A threshold test must call the real calculation.

Questions: [TEST-01](https://abap-interview-studio.pages.dev/#q-TEST-01), [OO-14](https://abap-interview-studio.pages.dev/#q-OO-14), [OODEEP-12](https://abap-interview-studio.pages.dev/#q-OODEEP-12), [PAT-11](https://abap-interview-studio.pages.dev/#q-PAT-11)

**Where this belongs:** Two method excerpts in separate class implementations. lcl_discount declares CLASS-METHODS percent IMPORTING quantity TYPE i RETURNING VALUE(result) TYPE i. The local test class declares METHODS threshold FOR TESTING. The teaching rule is 10 percent from quantity 10, otherwise zero.

```abap
METHOD percent.
  result = COND #( WHEN quantity >= 10
                   THEN 10 ELSE 0 ).
ENDMETHOD.

METHOD threshold.
  cl_abap_unit_assert=>assert_equals(
    act = lcl_discount=>percent( quantity = 9 )
    exp = 0 ).
  cl_abap_unit_assert=>assert_equals(
    act = lcl_discount=>percent( quantity = 10 )
    exp = 10 ).
  cl_abap_unit_assert=>assert_equals(
    act = lcl_discount=>percent( quantity = 11 )
    exp = 10 ).
ENDMETHOD.
```

**Read it step by step:**

1. **Keep production behavior real** (lines 1, 2, 3, 4): The discount decision uses the actual quantity comparison. No mock replaces it.
2. **Check both sides and the boundary** (lines 6, 7, 8, 9, 10, 11, 12, 13, 14, 15): Quantities 9, 10 and 11 check below, exactly at and above the threshold with independently chosen expectations.

**What happens:** Changing >= to > would fail the quantity-10 assertion. A mocked percent result would not detect that bug.

**Scope:** This illustrates test source, not an executed SAP test. Add the class definitions and required ABAP Unit attributes; validate invalid-input rules separately. No coverage percentage is claimed.

**Primary references:**

- [SAP: ABAP Unit tests](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/14_ABAP_Unit_Tests.md)

## FILTER needs an appropriate access key

A standard table can keep arrival order and offer a sorted secondary key.

Questions: [BASE-10](https://abap-interview-studio.pages.dev/#q-BASE-10), [ABAP-02](https://abap-interview-studio.pages.dev/#q-ABAP-02)

**Where this belongs:** Self-contained method-body fragment. The key customer_key is explicit and matches the equality condition.

```abap
TYPES: BEGIN OF ty_order,
         customer TYPE i,
         amount   TYPE i,
       END OF ty_order.
TYPES ty_orders TYPE STANDARD TABLE OF ty_order
  WITH EMPTY KEY
  WITH NON-UNIQUE SORTED KEY customer_key
    COMPONENTS customer.
DATA(lt_orders) = VALUE ty_orders(
  ( customer = 2 amount = 10 )
  ( customer = 1 amount = 20 )
  ( customer = 2 amount = 30 ) ).
DATA(lt_selected) = FILTER #(
  lt_orders USING KEY customer_key WHERE customer = 2 ).
```

**Read it step by step:**

1. **Provide the key** (lines 5, 6, 7, 8): EMPTY KEY does not support this basic FILTER access by itself. The secondary sorted key does.
2. **Choose that key explicitly** (lines 9, 10, 11, 12, 13, 14): USING KEY customer_key selects both customer 2 rows, with amounts 10 and 30.

**What happens:** The result contains the two matching rows. A suitable secondary key enables this FILTER form on a standard table.

**Scope:** Keys consume memory and maintenance work. For a condition that does not fit the key rules, prefer a clear loop or FOR expression. Check syntax support on the target release.

**Primary references:**

- [SAP: Internal tables](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md)
- [SAP: Constructor expressions](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/05_Constructor_Expressions.md)

## Do not invent zero as the maximum

An all-negative input exposes the wrong starting value.

Questions: [BASE-11](https://abap-interview-studio.pages.dev/#q-BASE-11), [ABAP-11](https://abap-interview-studio.pages.dev/#q-ABAP-11)

**Where this belongs:** Self-contained method-body fragment. The fixture has at least one row. has_maximum explicitly represents whether any result exists.

```abap
TYPES ty_values TYPE STANDARD TABLE OF i
  WITH EMPTY KEY.
DATA(lt_values) = VALUE ty_values( ( -8 ) ( -3 ) ).
DATA maximum TYPE i.
DATA(has_maximum) = xsdbool( lt_values IS NOT INITIAL ).
IF has_maximum = abap_true.
  maximum = REDUCE i(
    INIT best = lt_values[ 1 ]
    FOR number IN lt_values
    NEXT best = COND #(
      WHEN number > best THEN number ELSE best ) ).
ENDIF.
```

**Read it step by step:**

1. **Handle no result separately** (lines 3, 4, 5, 6): The guard prevents reading row 1 of an empty table. has_maximum distinguishes no value from an actual zero.
2. **Start with a real candidate** (lines 7, 8, 9, 10, 11): The accumulator starts at -8, then becomes -3. Starting at zero would incorrectly keep zero.

**What happens:** The maximum is -3. The syntax is concise, but the initial value and empty-input policy still determine correctness.

**Scope:** Test empty, single-row, all-negative and mixed data. If the caller requires a value, reject empty input instead of relying on a separate presence flag.

**Primary references:**

- [SAP: Constructor expressions](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/05_Constructor_Expressions.md)

## Read a request from top to bottom

The first line says what to do. Headers describe the message. The body carries the data.

Questions: [HTTP-01](https://abap-interview-studio.pages.dev/#q-HTTP-01), [HTTP-02](https://abap-interview-studio.pages.dev/#q-HTTP-02), [HTTP-05](https://abap-interview-studio.pages.dev/#q-HTTP-05), [HTTP-06](https://abap-interview-studio.pages.dev/#q-HTTP-06)

**Where this belongs:** Illustrative HTTPS exchange with a fictional /orders endpoint. Authentication headers are omitted for readability; lengths count the ASCII body bytes without a trailing newline.

```http
POST /orders HTTP/1.1
Host: api.example.com
Accept: application/json
Content-Type: application/json
Content-Length: 32

{"customer":"C100","quantity":2}

HTTP/1.1 201 Created
Location: /orders/4711
Content-Type: application/json
Content-Length: 29

{"id":"4711","status":"Open"}
```

**Read it step by step:**

1. **Send the order** (lines 1, 3, 4, 7): POST asks the server to create an order. Content-Type describes our JSON body; Accept asks for a JSON reply.
2. **Read the result** (lines 9, 10, 14): 201 says a resource was created. Location points to it, and the response body gives its ID.

**What happens:** The caller receives order 4711. A 202 response instead would mean accepted for processing, so the caller would still need the eventual result.

**Scope:** HTTP does not make this endpoint OData. Its URL, payload and error rules belong to the particular API.

**Primary references:**

- [IETF: HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

## Repeat a replacement, not an increment

Sending the same desired state twice should not add two more items.

Questions: [HTTP-03](https://abap-interview-studio.pages.dev/#q-HTTP-03), [HTTP-04](https://abap-interview-studio.pages.dev/#q-HTTP-04), [HTTP-12](https://abap-interview-studio.pages.dev/#q-HTTP-12)

**Where this belongs:** Fictional REST endpoint where PUT replaces the complete quantity resource. Two separate identical requests are shown.

```http
PUT /orders/4711/quantity HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 11

{"value":2}

PUT /orders/4711/quantity HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 11

{"value":2}
```

**Read it step by step:**

1. **Set the desired value** (lines 1, 6): The request says quantity is 2, not increase quantity by 2.
2. **Retry the same request** (lines 8, 13): After either one or two accepted requests, the intended quantity is still 2.

**What happens:** The operation is idempotent even if the first reply is 201 and the second is 200 or 204.

**Scope:** A retry can still race with another user. Use the API concurrency rule where needed. POST and PATCH are not automatically safe to retry.

**Primary references:**

- [IETF: Idempotent methods](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)

## See a stale version get rejected

A version token lets the server notice that someone else changed the order.

Questions: [ODATA-06](https://abap-interview-studio.pages.dev/#q-ODATA-06), [OPS-05](https://abap-interview-studio.pages.dev/#q-OPS-05)

**Where this belongs:** OData V4 example. Another user has already changed order 4711 from version v1 to v2. The client below still sends v1.

```http
PATCH /Orders(4711) HTTP/1.1
Host: api.example.com
If-Match: W/"v1"
Content-Type: application/json
Content-Length: 28

{"Note":"Deliver on Friday"}

HTTP/1.1 412 Precondition Failed
Content-Length: 0
```

**Read it step by step:**

1. **Send the version you read** (lines 3): If-Match carries the earlier ETag returned by this OData service.
2. **Reject the stale update** (lines 9): The service detects the mismatch. It must not overwrite the newer order with this stale request.

**What happens:** The client reloads the order and lets the user reconcile changes before sending a new update.

**Scope:** The weak ETag shown follows OData concurrency rules. Generic HTTP If-Match uses strong comparison. Do not replace the token with * merely to bypass a conflict.

**Primary references:**

- [OASIS: OData conditional requests](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html#_Header_If-Match)
- [IETF: If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1)

## Keep a code, a number and null different

These values may look similar on screen, but they carry different information.

Questions: [HTTP-07](https://abap-interview-studio.pages.dev/#q-HTTP-07)

**Where this belongs:** Original JSON fixture for a fictional order API. The API defines null as clear the note and an omitted note as leave it unchanged.

```json
{
  "customerId": "0000123",
  "quantity": 0,
  "approved": false,
  "note": null,
  "amount": "12.30",
  "currency": "EUR"
}
```

**Read it step by step:**

1. **Preserve the types** (lines 2, 3, 4): The customer ID is text with leading zeros. Zero is a number and false is a boolean; neither means missing.
2. **Preserve field presence** (lines 5): This message explicitly contains note: null. A mapper that drops presence cannot distinguish clearing the note from leaving it alone.
3. **Follow the amount contract** (lines 6, 7): This API uses decimal text plus currency. Convert using the declared precision, not a binary floating-point guess.

**What happens:** Your ABAP mapping can preserve both the typed value and whether the sender supplied it.

**Scope:** JSON itself does not define update semantics or a decimal-money type. The clear/unchanged and amount rules above are fictional API rules, not universal JSON rules.

**Primary references:**

- [IETF: JSON data interchange format](https://www.rfc-editor.org/rfc/rfc8259.html)

## Read names, attributes and escaped text

The namespace identifies what an element means. Its prefix is only a short label.

Questions: [HTTP-08](https://abap-interview-studio.pages.dev/#q-HTTP-08)

**Where this belongs:** Well-formed fictional order document. It is an explanation of XML, not an SAP interface schema.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ord:Order xmlns:ord="urn:example:orders:v1"
           id="4711">
  <ord:Customer>0000123</ord:Customer>
  <ord:Note>A &amp; B &lt;priority&gt;</ord:Note>
  <ord:Amount currency="EUR">12.30</ord:Amount>
</ord:Order>
```

**Read it step by step:**

1. **Resolve the namespace** (lines 2, 4): ord:Customer belongs to urn:example:orders:v1. Changing ord to a different prefix does not change its meaning if the URI stays the same.
2. **Read text and attributes** (lines 5, 6): The note means A & B <priority>. Currency is an attribute on Amount, not part of its numeric text.

**What happens:** A namespace-aware parser reads the intended customer, note and amount without confusing text with markup.

**Scope:** Well-formed XML is not proof that it matches the business schema. Configure safe parsing and validate required fields separately.

**Primary references:**

- [W3C: Namespaces in XML](https://www.w3.org/TR/xml-names/)

## Serialize an ABAP value and read it back

Use a serializer when you need XML, instead of joining strings and escaping characters yourself.

Questions: [HTTP-09](https://abap-interview-studio.pages.dev/#q-HTTP-09)

**Where this belongs:** ABAP method-body excerpt using the built-in identity transformation. Local demonstration values; no custom objects. Target language-version support must be checked.

```abap
CONSTANTS co_note TYPE string VALUE `A & B`.
DATA note TYPE string VALUE co_note.
DATA xml TYPE xstring.
DATA restored_note TYPE string.

CALL TRANSFORMATION id
  SOURCE note = note
  RESULT XML xml.

CALL TRANSFORMATION id
  SOURCE XML xml
  RESULT note = restored_note.
```

**Read it step by step:**

1. **Serialize the value** (lines 6, 7, 8): The transformation writes SAP canonical asXML and escapes the ampersand correctly.
2. **Read that format back** (lines 10, 11, 12): The same root binding, note, restores the original text into restored_note.

**What happens:** restored_note contains A & B. XML is the transport representation; it does not alter the note.

**Scope:** Identity transformation produces asXML, not an arbitrary partner schema. Use a suitable transformation for the partner format and handle CX_TRANSFORMATION_ERROR at the caller. Illustrative, not SAP-executed.

**Primary references:**

- [SAP: CALL TRANSFORMATION](https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abapcall_transformation.htm)

## Ask for two fields and a small page

The URL tells the service which rows and fields the list needs.

Questions: [ODATA-03](https://abap-interview-studio.pages.dev/#q-ODATA-03), [OPS-07](https://abap-interview-studio.pages.dev/#q-OPS-07)

**Where this belongs:** Fictional OData V4 Orders entity set with numeric key ID. Each request is separate; the second adds total count for comparison.

```http
GET /Orders?$select=ID,Total&$top=20 HTTP/1.1
Host: api.example.com
Accept: application/json

GET /Orders?$select=ID,Total&$top=20&$count=true HTTP/1.1
Host: api.example.com
Accept: application/json
```

**Read it step by step:**

1. **Limit the list payload** (lines 1): $select asks for ID and Total. $top asks for at most 20 rows, not every order.
2. **Notice the extra work** (lines 5): The second request keeps the same fields and page limit, then adds the count of matching rows. Measuring that extra work can explain a slow list.

**What happens:** You can compare response size and backend timings with and without count before blaming the network or Fiori.

**Scope:** This short URL omits filters and ordering. A real paged list needs stable ordering, and the service must support the requested options. $top does not itself prove the database read is cheap.

**Primary references:**

- [OASIS: OData query options](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html)

## Filter by status and sort by a stable key

A filter chooses rows. Ordering makes their sequence predictable.

Questions: [ODATA-03](https://abap-interview-studio.pages.dev/#q-ODATA-03), [ODATA-04](https://abap-interview-studio.pages.dev/#q-ODATA-04)

**Where this belongs:** Fictional OData V4 Orders model: Status is text and ID is a unique numeric key. The request uses URI-encoded spaces.

```http
GET /Orders?$filter=Status%20eq%20%27Open%27 HTTP/1.1
Host: api.example.com
Accept: application/json

GET /Orders?$orderby=ID&$skip=20&$top=20 HTTP/1.1
Host: api.example.com
Accept: application/json
```

**Read it step by step:**

1. **Select matching rows** (lines 1): The decoded filter is Status eq 'Open'. This request asks the server for open orders.
2. **Request the next offset page** (lines 5): The second, separate request sorts all orders by ID, skips 20, and asks for the next 20.

**What happens:** You can explain which part changes the result set and which part changes the returned page.

**Scope:** The two requests deliberately isolate two options; combine them for a filtered paged list. Offset paging can shift when data changes. Follow a supplied nextLink for server-driven paging.

**Primary references:**

- [OASIS: OData query options](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html)

## Follow nextLink instead of guessing a URL

A page can be smaller than the total result. The server may tell you exactly where to continue.

Questions: [ODATA-04](https://abap-interview-studio.pages.dev/#q-ODATA-04)

**Where this belongs:** Illustrative OData V4 JSON response to a request that asked for count. The dataset has three matching orders and the server returned the first two.

```json
{
  "@odata.context": "$metadata#Orders",
  "@odata.count": 3,
  "value": [
    {"ID": 4711},
    {"ID": 4712}
  ],
  "@odata.nextLink": "Orders?$skiptoken=abc123"
}
```

**Read it step by step:**

1. **Separate total from page size** (lines 3, 4, 5, 6): The total is 3, but value contains only 2 orders.
2. **Continue using the supplied link** (lines 8): Resolve this relative link against the service URL and follow it. Treat the skip token as opaque.

**What happens:** The client obtains the remaining order without inventing the server paging token.

**Scope:** V2 uses different count and next-link conventions. The nextLink is not a promise of a frozen snapshot while other users change data.

**Primary references:**

- [OASIS: OData server-driven paging](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html)

## Group two writes in one atomicity group

Being in one batch envelope is different from being in one all-or-nothing group.

Questions: [ODATA-07](https://abap-interview-studio.pages.dev/#q-ODATA-07)

**Where this belongs:** OData 4.01 JSON batch request body for fictional Orders. Send it to $batch only if the SAP service explicitly supports JSON batch in this version.

```json
{
  "requests": [
    {
      "id": "1", "atomicityGroup": "g1",
      "method": "PATCH", "url": "Orders(4711)",
      "headers": {"content-type": "application/json"},
      "body": {"Note": "First"}
    },
    {
      "id": "2", "atomicityGroup": "g1",
      "method": "PATCH", "url": "Orders(4712)",
      "headers": {"content-type": "application/json"},
      "body": {"Note": "Second"}
    }
  ]
}
```

**Read it step by step:**

1. **Share one group** (lines 4, 10): Both writes belong to g1. If one fails, this group must not leave the other write committed.
2. **Keep the envelope separate** (lines 5, 11): The two URLs target different orders. Other requests in the batch need not share this transaction boundary.

**What happens:** The client checks each batch response and the group outcome instead of reading only the outer HTTP status.

**Scope:** Not a universal RAP wire format. Many SAP services use multipart batch change sets instead. Authentication, CSRF and required If-Match headers must be added according to the actual service.

**Primary references:**

- [OASIS: JSON batch requests](https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_BatchRequests)

## Read the model behind the payload

Metadata tells a client the key and field types before it reads an order.

Questions: [ODATA-02](https://abap-interview-studio.pages.dev/#q-ODATA-02), [ODATA-12](https://abap-interview-studio.pages.dev/#q-ODATA-12)

**Where this belongs:** Valid XML CSDL Schema excerpt from a fictional OData V4 $metadata document. The outer edmx document and EntityContainer are omitted.

```xml
<Schema Namespace="Demo"
 xmlns="http://docs.oasis-open.org/odata/ns/edm">
  <EntityType Name="Order">
    <Key><PropertyRef Name="ID"/></Key>
    <Property Name="ID" Type="Edm.Int32"
              Nullable="false"/>
    <Property Name="Note" Type="Edm.String"
              MaxLength="80"/>
  </EntityType>
</Schema>
```

**Read it step by step:**

1. **Find the identity** (lines 4, 5, 6): ID is the key, is an integer, and cannot be null.
2. **Read the field contract** (lines 7, 8): Note is text with a maximum length of 80. A client can use that limit when collecting input.

**What happens:** Changing ID to a different type or reducing Note to 20 characters can break an existing client.

**Scope:** This excerpt does not list permissions, behavior or every capability. Read the full metadata and annotations, then verify actual service behavior.

**Primary references:**

- [OASIS: OData CSDL](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part3-csdl/odata-v4.0-errata03-os-part3-csdl-complete.html)

## Compare a read function with a write action

A function answers a question. An action can change business state.

Questions: [ODATA-05](https://abap-interview-studio.pages.dev/#q-ODATA-05)

**Where this belongs:** Two separate calls to a fictional OData V4 service. Its metadata declares bound function Demo.CalculateTax and action Demo.Submit.

```http
GET /Orders(4711)/Demo.CalculateTax() HTTP/1.1
Host: api.example.com
Accept: application/json

POST /Orders(4711)/Demo.Submit HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 2

{}
```

**Read it step by step:**

1. **Read a calculation** (lines 1): The function returns a tax calculation without changing business state.
2. **Request a state change** (lines 5, 10): The action asks the service to submit the order. The empty object means this fictional action has no additional parameters.

**What happens:** A client must treat the submit call as a business operation with possible validation, authorization and concurrency failures.

**Scope:** These names are not SAP-delivered APIs. Use the actual service metadata, required headers and action parameters. GET must not be used for a hidden posting operation.

**Primary references:**

- [OASIS: Actions and functions](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html)

## Separate transport failure from business data

An RFC call can fail before you get a business result.

Questions: [RFC-01](https://abap-interview-studio.pages.dev/#q-RFC-01), [RFC-03](https://abap-interview-studio.pages.dev/#q-RFC-03), [RFC-12](https://abap-interview-studio.pages.dev/#q-RFC-12)

**Where this belongs:** Classic ABAP method-body excerpt. Custom remote-enabled Z_GET_ORDER imports IV_ID and exports ES_ORDER. destination, order_id and typed ls_order already exist. The custom FM has no application exceptions in this illustration.

```abap
DATA rfc_message TYPE c LENGTH 255.
CALL FUNCTION 'Z_GET_ORDER'
  DESTINATION destination
  EXPORTING iv_id = order_id
  IMPORTING es_order = ls_order
  EXCEPTIONS
    system_failure = 1 MESSAGE rfc_message
    communication_failure = 2 MESSAGE rfc_message.
DATA(rfc_result) = sy-subrc.
IF rfc_result <> 0.
  RETURN.
ENDIF.
```

**Read it step by step:**

1. **Call a remote-enabled function** (lines 2, 3, 4, 5): The destination chooses the connection. Inputs go to the function; outputs come back to the caller.
2. **Capture transport failure immediately** (lines 7, 8, 9): Preserve sy-subrc before another statement changes it. The caller cannot treat this branch as a valid order response.

**What happens:** A successful transport call still needs the business-result checks defined by Z_GET_ORDER. Being RFC-enabled alone does not make it a released BAPI.

**Scope:** RETURN only illustrates stopping the success path. Production code must report the captured failure and validate authorizations. Custom FM/types are prerequisites; classic RFC usage is not assumed released for ABAP Cloud. Not SAP-executed.

**Primary references:**

- [SAP: RFC variants](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm)
- [SAP: BAPI transaction model](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm)

## Let the outer BAPI caller decide the transaction

Check the BAPI result first. Only its transaction owner decides whether to commit.

Questions: [RFC-04](https://abap-interview-studio.pages.dev/#q-RFC-04), [RFC-05](https://abap-interview-studio.pages.dev/#q-RFC-05)

**Where this belongs:** Classic caller excerpt after a successful local BAPI call. has_business_error was derived from the BAPI-specific RETURN rules. The caller owns this LUW; it is not a RAP handler.

```abap
CONSTANTS co_error_types TYPE c LENGTH 3 VALUE 'AEX'.
DATA ls_commit_return TYPE bapiret2.
IF has_business_error = abap_true.
  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
  RETURN.
ENDIF.

CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
  EXPORTING wait = abap_true
  IMPORTING return = ls_commit_return.

IF ls_commit_return-type CA co_error_types.
  RETURN.
ENDIF.
```

**Read it step by step:**

1. **Stop on the business error** (lines 3, 4, 5): The caller rolls back instead of posting merely because the BAPI call returned normally.
2. **Commit and inspect its result** (lines 8, 9, 10): WAIT requests synchronous completion of relevant update processing. The commit result is separate from the earlier BAPI result.

**What happens:** The caller can distinguish a rejected business request from a failed commit, and report each correctly.

**Scope:** Failure branches here stop only; add real error reporting. WAIT does not wait for every workflow or remote system. For remote BAPIs, commit must run in the same remote transaction context, not locally. Check API-specific exceptions. Classic API; not permission to commit in RAP. Not SAP-executed.

**Primary references:**

- [SAP: BAPI transaction model](https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/4d/5b102ba1483d8fe10000000a42189e/content.htm)

## Collect a worker result in its callback

Starting the task and receiving its result happen at different times.

Questions: [RFC-06](https://abap-interview-studio.pages.dev/#q-RFC-06), [RFC-07](https://abap-interview-studio.pages.dev/#q-RFC-07)

**Where this belongs:** Classic ABAP class excerpts. Custom remote FM Z_CALCULATE_PACKAGE exports EV_TOTAL. on_end has one importing character-like task_name parameter; task_id, callback_done, result_code and total are class attributes. The caller permits only a bounded number of active tasks.

```abap
CALL FUNCTION 'Z_CALCULATE_PACKAGE'
  STARTING NEW TASK task_id
  DESTINATION IN GROUP DEFAULT
  CALLING on_end ON END OF TASK
  EXCEPTIONS
    resource_failure = 1
    communication_failure = 2
    system_failure = 3.
DATA(start_result) = sy-subrc.

METHOD on_end.
  RECEIVE RESULTS FROM FUNCTION 'Z_CALCULATE_PACKAGE'
    IMPORTING ev_total = total
    EXCEPTIONS
      communication_failure = 1
      system_failure = 2.
  result_code = sy-subrc.
  callback_done = abap_true.
ENDMETHOD.
```

**Read it step by step:**

1. **Dispatch without assuming success** (lines 2, 3, 4, 6, 9): A resource failure means the worker did not start. Use bounded retry/backoff rather than flooding the group with more tasks.
2. **Collect the completed task** (lines 12, 17, 18): RECEIVE obtains the result or failure. Mark the callback received even on error, then use result_code to decide whether the work succeeded.

**What happens:** The coordinator tracks start_result separately from result_code and matches each callback task_name to its package.

**Scope:** Two excerpts, not a complete class. Production code needs per-task storage, start-error handling, timeout and safe retries. Callback completion is not proof of a committed business result. Classic ABAP; not assumed Cloud-released. Not SAP-executed.

**Primary references:**

- [SAP: Implementing parallel processing](https://help.sap.com/saphelp_ewm900/helpdata/en/4d/909309eba36e73e10000000a15822b/content.htm)

## See why WAIT belongs outside unfinished writes

A waiting coordinator must be designed around database boundaries.

Questions: [RFC-08](https://abap-interview-studio.pages.dev/#q-RFC-08)

**Where this belongs:** Classic method-body excerpt. No pending database writes or open cursor are allowed here. callbacks_received is maintained by aRFC callbacks; tasks_started counts only successfully dispatched tasks.

```abap
CONSTANTS co_timeout_seconds TYPE i VALUE 10.

WAIT UNTIL callbacks_received = tasks_started
  UP TO co_timeout_seconds SECONDS.
DATA(wait_result) = sy-subrc.

IF callbacks_received < tasks_started.
  RETURN.
ENDIF.
```

**Read it step by step:**

1. **Use a bounded wait** (lines 3, 4, 5): The caller gives callbacks time to arrive and keeps the wait result. It does not wait forever.
2. **Treat missing callbacks explicitly** (lines 7, 8): Some tasks may still be running. This path needs recovery or an operator-visible incomplete result, not a success message.

**What happens:** The coordinator checks each collected worker result after the wait; receiving every callback is different from every worker succeeding.

**Scope:** Classic WAIT can trigger a database commit. It is not COMMIT WORK AND WAIT and does not prove all business work finished. RETURN stands for an incomplete-outcome handoff. Not a RAP-handler pattern; not SAP-executed.

**Primary references:**

- [SAP: WAIT UNTIL](https://help.sap.com/saphelp_em900/helpdata/en/48/9b958a1786062de10000000a42189d/content.htm)

## Open, add a step, then release a job

Creating the job header alone does not schedule useful work.

Questions: [RFC-10](https://abap-interview-studio.pages.dev/#q-RFC-10)

**Where this belongs:** Classic method-body excerpt. job_name is TYPE tbtcjob-jobname, job_count is TYPE tbtcjob-jobcount, released is TYPE c LENGTH 1. Custom report Z_RECONCILE is a background-safe report with no mandatory selection parameters.

```abap
CALL FUNCTION 'JOB_OPEN'
  EXPORTING jobname = job_name
  IMPORTING jobcount = job_count
  EXCEPTIONS OTHERS = 1.
IF sy-subrc <> 0.
  RETURN.
ENDIF.
SUBMIT z_reconcile
  VIA JOB job_name NUMBER job_count AND RETURN.
IF sy-subrc <> 0.
  RETURN.
ENDIF.
CALL FUNCTION 'JOB_CLOSE'
  EXPORTING jobname = job_name
            jobcount = job_count
            strtimmed = abap_true
  IMPORTING job_was_released = released
  EXCEPTIONS OTHERS = 1.
DATA(close_result) = sy-subrc.
```

**Read it step by step:**

1. **Create the header and step** (lines 1, 3, 8, 9): Keep both job name and job count. SUBMIT adds the report as a step of that specific job.
2. **Request release and inspect it** (lines 13, 16, 17, 19): An immediate start request still depends on release authorization and available processing resources.

**What happens:** Use close_result and released to report scheduling status, then use the same job identity to inspect SM37, the log and the business totals.

**Scope:** Production code must report each error and handle a partially built job; the excerpt stops the failed path only. Finished job status does not prove every record posted. Classic scheduler APIs are not the ABAP Cloud application-job API. Not SAP-executed.

**Primary references:**

- [SAP: Background processing function modules](https://help.sap.com/doc/saphelp_snc70/7.0/en-US/4d/906689eba36e73e10000000a15822b/content.htm)

## Distinguish the envelope from the order data

Control fields describe the interface. Segments carry the actual business values.

Questions: [INTF-01](https://abap-interview-studio.pages.dev/#q-INTF-01), [INTF-02](https://abap-interview-studio.pages.dev/#q-INTF-02), [INTF-03](https://abap-interview-studio.pages.dev/#q-INTF-03), [RICEFW-02](https://abap-interview-studio.pages.dev/#q-RICEFW-02)

**Where this belongs:** Teaching-only reduced XML representation of a custom IDoc. ZORDERS01, ZORDER and Z1ORDER are fictional custom definitions; this is not a complete generated IDoc XML schema.

```xml
<ZORDERS01>
  <IDOC BEGIN="1">
    <EDI_DC40 SEGMENT="1">
      <IDOCTYP>ZORDERS01</IDOCTYP>
      <MESTYP>ZORDER</MESTYP>
      <SNDPRN>PARTNER_A</SNDPRN>
      <RCVPRN>ERP_100</RCVPRN>
    </EDI_DC40>
    <Z1ORDER SEGMENT="1">
      <EXTERNAL_ID>PO-0071</EXTERNAL_ID>
      <CUSTOMER>0000123</CUSTOMER>
    </Z1ORDER>
  </IDOC>
</ZORDERS01>
```

**Read it step by step:**

1. **Read the control information** (lines 4, 5, 6, 7): The basic type describes the segment structure; message type describes the business message. Sender and receiver help select processing configuration.
2. **Read the business data** (lines 9, 10, 11): The order segment supplies the external order ID and customer. These values must still pass application checks.

**What happens:** A wrong receiver or missing partner profile is a routing/configuration problem; an unknown customer is a business-data problem.

**Scope:** Real control records have additional required fields and generated schemas. Ports, partner profiles and process codes are configuration, not created by this payload. No live IDoc was generated.

**Primary references:**

- [SAP: IDoc control record and structure](https://help.sap.com/saphelp_snc700_ehp01/helpdata/en/78/2177f051ce11d189570000e829fbbd/content.htm)

## Separate sent, failed and posted evidence

An outbound success status does not tell you that the receiving system posted an order.

Questions: [INTF-04](https://abap-interview-studio.pages.dev/#q-INTF-04), [INTF-05](https://abap-interview-studio.pages.dev/#q-INTF-05), [RICEFW-06](https://abap-interview-studio.pages.dev/#q-RICEFW-06)

**Where this belongs:** Original diagnostic note in JSON, not an SAP wire format or API. The source and receiver have different local IDoc numbers.

```json
{
  "businessKey": "PARTNER_A/PO-0071",
  "outbound": {
    "system": "SOURCE", "idoc": "0000000000000101",
    "status": "03"
  },
  "inbound": {
    "system": "ERP", "idoc": "0000000000000822",
    "status": "51", "error": "Customer not found"
  },
  "applicationDocument": null
}
```

**Read it step by step:**

1. **Check the sending side** (lines 3, 4, 5): Status 03 says data passed to the port. It does not prove that ERP created an order.
2. **Find the receiving business failure** (lines 7, 8, 9, 11): The receiver has status 51 and no confirmed application document. Investigate its detailed status messages before retrying.

**What happens:** Support links both technical messages using the business reference and repairs the customer data or mapping before controlled reprocessing.

**Scope:** These are common classic status meanings; use detailed messages and actual application evidence. An empty field in a support note is not proof that no document exists. No real customer or IDoc is represented.

**Primary references:**

- [SAP: IDoc communication status and application outcome](https://help.sap.com/docs/ERP_HCM/d9cb82c153454334bee3e640fc0b311e/058ce0535e56424de10000000a174cb4.html)

## See structure mapping and value mapping separately

One mapping moves a field. Another translates the value inside it.

Questions: [INTF-08](https://abap-interview-studio.pages.dev/#q-INTF-08), [INTF-10](https://abap-interview-studio.pages.dev/#q-INTF-10)

**Where this belongs:** Original input/expected-output test fixture for a fictional AIF interface. This is not AIF configuration syntax; configure the real interface engine and mappings separately.

```json
{
  "incoming": {
    "company": "EXT01",
    "orderRef": "PO-0071"
  },
  "expectedTarget": {
    "companyCode": "1000",
    "externalOrderId": "PO-0071"
  },
  "unmappedCompany": "EXT99",
  "expectedOnUnmapped": "Reject before posting"
}
```

**Read it step by step:**

1. **Translate the company value** (lines 3, 7): The maintained mapping converts EXT01 to 1000. A missing EXT99 mapping must have a defined error path.
2. **Move the reference field** (lines 4, 8): Structure mapping puts orderRef into externalOrderId without changing the reference itself.
3. **Test the rejection path** (lines 10, 11): A failed mapping must not quietly post to a guessed default company code.

**What happens:** The operator can identify the source value that needs a mapping fix, then reprocess according to the interface recovery rules.

**Scope:** Actual AIF processing order depends on its configured engine. Posting still requires business authorization, duplicate protection and correct transaction ownership.

**Primary references:**

- [SAP: AIF interface creation](https://help.sap.com/docs/ABAP_PLATFORM_NEW/4db1676c3f114f119b500bd80ccd944d/f0d1b60ff43c45efad71398b1214db04.html)

## Keep delivery ID and business version separate

A new delivery does not necessarily mean a new business command.

Questions: [BTP-08](https://abap-interview-studio.pages.dev/#q-BTP-08), [RICEFW-12](https://abap-interview-studio.pages.dev/#q-RICEFW-12), [INTF-06](https://abap-interview-studio.pages.dev/#q-INTF-06), [OPS-11](https://abap-interview-studio.pages.dev/#q-OPS-11)

**Where this belongs:** Original delivery fixture for a fictional approval integration. The same order version was delivered twice with different technical delivery IDs.

```json
[
  {
    "deliveryId": "delivery-901",
    "source": "ERP", "orderId": "4711",
    "version": 3, "event": "Submitted"
  },
  {
    "deliveryId": "delivery-902",
    "source": "ERP", "orderId": "4711",
    "version": 3, "event": "Submitted"
  }
]
```

**Read it step by step:**

1. **Notice the two deliveries** (lines 3, 8): Technical delivery IDs differ. Deduplicating only by that ID would allow both to start an approval.
2. **Match the business operation** (lines 4, 5, 9, 10): Source, order, version and event identify the same submission in this example. Store the accepted operation durably with its outcome.

**What happens:** The consumer returns the known approval result for the repeated submission instead of creating a second approval.

**Scope:** The example key is application-specific. The duplicate check and business effect need a concurrency-safe design; a check followed by an unprotected insert is not enough. For a timed-out remote call, query its known result before replaying.

**Primary references:**

- [SAP: RAP business-object contract](https://help.sap.com/docs/abap-cloud/abap-rap/rap-business-object-contract)
- [SAP: RFC quality-of-service scope](https://help.sap.com/saphelp_em900/helpdata/en/48/99b53cee2b73e7e10000000a42189b/content.htm)

## Let a BAdI select the implementation

The application calls a defined extension point, rather than editing the standard implementation.

Questions: [RICEFW-03](https://abap-interview-studio.pages.dev/#q-RICEFW-03)

**Where this belongs:** Custom single-use, new-style BAdI illustration. ZBADI_ORDER_CHECK has a COUNTRY filter and interface method CHECK importing IS_ORDER and exporting EV_ALLOWED. order_check is typed REF TO zbadi_order_check; ls_order and allowed match that interface. A fallback implementation is configured.

```abap
CONSTANTS co_country TYPE c LENGTH 2 VALUE 'PL'.

GET BADI order_check
  FILTERS country = co_country.

CALL BADI order_check->check
  EXPORTING is_order = ls_order
  IMPORTING ev_allowed = allowed.
```

**Read it step by step:**

1. **Select through the extension definition** (lines 3, 4): GET BADI uses the filter value to resolve the configured implementation or its fallback.
2. **Call the agreed method** (lines 6, 7, 8): The host supplies an order and receives the decision through the BAdI interface, without knowing the implementation class.

**What happens:** A different implementation can support another country while the caller continues to use the same interface.

**Scope:** All Z objects and signatures above are fictional prerequisites. Production code needs the actual BAdI exception and multiplicity rules. A visible BAdI is not automatically released for ABAP Cloud or safe at every transaction point. Not SAP-executed.

**Primary references:**

- [SAP: Object plug-ins and BAdIs](https://help.sap.com/docs/SAP_NETWEAVER_AS_ABAP_FOR_SOH_740/7bfe8cdcfbb040dcb6702dada8c3e2f0/a085408fd34b496798872ae307c0adb2.html)
- [SAP: Single-use and multiple-use BAdIs](https://help.sap.com/saphelp_autoid2007/helpdata/en/e4/5c3642eca5033be10000000a1550b0/content.htm)

## Execute a request and inspect the reply

A configured destination provides the connection. Your code still has to inspect the HTTP response.

Questions: [HTTP-10](https://abap-interview-studio.pages.dev/#q-HTTP-10), [BTP-06](https://abap-interview-studio.pages.dev/#q-BTP-06)

**Where this belongs:** Method-body excerpt for a target supporting these released HTTP interfaces. destination is an already resolved IF_HTTP_DESTINATION from the target-supported communication/destination setup. The enclosing method declares CX_WEB_HTTP_CLIENT_ERROR and CX_WEB_MESSAGE_ERROR.

```abap
DATA(client) =
  cl_web_http_client_manager=>create_by_http_destination(
    i_destination = destination ).

DATA(response) = client->execute(
  i_method = if_web_http_client=>get ).
DATA(ls_status) = response->get_status( ).
DATA(response_text) = response->get_text( ).
client->close( ).

IF ls_status-code < 200 OR ls_status-code >= 300.
  RETURN.
ENDIF.
```

**Read it step by step:**

1. **Use the configured destination** (lines 1, 2, 3): The client uses the endpoint and connection setup already resolved by the application. Do not put passwords into the source.
2. **Separate transport from HTTP outcome** (lines 5, 6, 7, 8): The call can raise a client exception. If it returns a response, inspect its status before treating the body as business data.
3. **Close and route the failure** (lines 9, 11, 12): The successful execution path closes the connection. Non-2xx responses go to an error-handling path, not the JSON success parser.

**What happens:** A received 401, 403 or 500 is handled as an HTTP result; a connection exception is handled by the enclosing boundary.

**Scope:** RETURN is only the teaching stop point: add error mapping, timeouts and cleanup on exception paths. Verify release status and destination creation for the actual edition. A destination does not itself install Cloud Connector or grant business permission. Not SAP-executed.

**Primary references:**

- [SAP: HTTP client usage](https://help.sap.com/docs/abap-cloud/abap-integration-connectivity/setting-http-logon-popup-policy)
- [SAP: Integration and connectivity](https://help.sap.com/doc/92f2c1b209a243639a63769070b0dd58/s4hana_cloud/en-US/6e28a25c7dcd4aa395328b1784736547.pdf)
- [SAP sample: HTTP response and message errors](https://github.com/SAP-samples/abap-oo-basics/blob/main/src/zcl_obj_xml_test.clas.abap)

## Let RAP save the order

This behavior definition gives a custom order standard create and update operations.

Questions: [RAP-01](https://abap-interview-studio.pages.dev/#q-RAP-01), [RAP-02](https://abap-interview-studio.pages.dev/#q-RAP-02), [RAP-11](https://abap-interview-studio.pages.dev/#q-RAP-11), [RAP-14](https://abap-interview-studio.pages.dev/#q-RAP-14)

**Where this belongs:** Base behavior definition for an existing custom root CDS entity ZI_Order and table zorder. OrderUUID is a RAW(16) key; Comment is its business field. The generated global authorization handler must implement the application permissions.

```abap
managed implementation in class zbp_i_order unique;
strict ( 2 );
define behavior for ZI_Order alias Order
persistent table zorder
lock master
authorization master ( global )
{
  create;
  update;
  field ( numbering : managed, readonly ) OrderUUID;
  mapping for zorder
  {
    OrderUUID = order_uuid;
    Comment = order_comment;
  }
}
```

**Read it step by step:**

1. **RAP owns persistence** (lines 1, 4): Managed RAP buffers changes and writes them to zorder during a successful save. You do not write the CRUD SQL yourself.
2. **A technical key appears automatically** (lines 10): RAP generates the UUID during create. This is managed early numbering, not a final business document number assigned by a posting API.
3. **Match CDS names to table columns** (lines 11, 13, 14): Comment in the business object is stored in order_comment. Mapping connects the two names.

**What happens:** Creating an order gives it a UUID; a successful save stores Comment in the mapped database column.

**Scope:** Teaching BDEF fragment, not a deployable BO. Strict-mode requirements, complete field mapping, authorization and service exposure must be completed for the target release.

**Primary references:**

- [SAP sample: managed behavior, numbering and mapping](https://github.com/SAP-samples/abap-platform-rap-opensap/blob/main/week3/unit2.md)

## Read the user's unsaved value

EML reads the order that RAP is currently working on, including buffered changes.

Questions: [RAP-03](https://abap-interview-studio.pages.dev/#q-RAP-03), [RAP-08](https://abap-interview-studio.pages.dev/#q-RAP-08), [RAP-09](https://abap-interview-studio.pages.dev/#q-RAP-09), [MODEL-13](https://abap-interview-studio.pages.dev/#q-MODEL-13)

**Where this belongs:** Inside a handler of custom BO ZI_Order. Its generated keys parameter contains transactional keys; Order is the BDEF alias. This fragment reads data only.

```abap
READ ENTITIES OF zi_order IN LOCAL MODE
  ENTITY Order
  FIELDS ( Comment )
  WITH CORRESPONDING #( keys )
  RESULT DATA(lt_orders)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

**Read it step by step:**

1. **Read the buffer** (lines 1, 3, 5): If Comment was changed from Old to New in this transaction, this read can return New before the database is saved.
2. **Keep the right instance** (lines 1, 4): The incoming transactional key keeps draft identity when present. Local mode is allowed here because the code belongs to this BO's own implementation.
3. **Check failed reads** (lines 6, 7): Not every requested key must produce a result row. Use the failure and message responses when continuing the surrounding handler.

**What happens:** The next business rule uses the newly entered comment instead of an older database value.

**Scope:** Local mode bypasses specified BO access checks; it is not an authorization workaround for an external consumer. Response handling is outside this small read fragment.

**Primary references:**

- [SAP: EML READ](https://help.sap.com/docs/abap-cloud/abap-rap/read)

## An empty value can be an intentional update

The control flag tells RAP to clear Comment instead of leaving it unchanged.

Questions: [SRAP-06](https://abap-interview-studio.pages.dev/#q-SRAP-06), [RAP-08](https://abap-interview-studio.pages.dev/#q-RAP-08)

**Where this belongs:** External EML consumer of non-draft custom BO ZI_Order, alias Order. order_uuid holds an existing UUID and Comment permits an empty value. The caller owns the later save decision.

```abap
MODIFY ENTITIES OF zi_order
  ENTITY Order
  UPDATE FROM VALUE #(
    ( OrderUUID = order_uuid
      Comment = ''
      %control-Comment = if_abap_behv=>mk-on ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

**Read it step by step:**

1. **Clear, do not ignore** (lines 5, 6): An empty Comment plus mk-on means replace the old text with an empty value. An initial field without its control flag means it was not supplied.
2. **Modification is not a save** (lines 7, 8): First inspect failures and messages. A successful modify only updates the RAP transaction; the external caller still needs a save decision.

**What happens:** If the update and later save succeed, the old comment disappears.

**Scope:** Use the full transactional identity for draft or late-numbering scenarios. UPDATE FIELDS ( Comment ) WITH is another way to identify the intended field.

**Primary references:**

- [SAP samples: EML update fields and control](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/08_EML_ABAP_for_RAP.md)

## Save from the outer caller

An external EML caller can save accepted changes; a RAP handler cannot commit them itself.

Questions: [RAP-04](https://abap-interview-studio.pages.dev/#q-RAP-04), [RAP-05](https://abap-interview-studio.pages.dev/#q-RAP-05), [SRAP-15](https://abap-interview-studio.pages.dev/#q-SRAP-15), [SRAP-20](https://abap-interview-studio.pages.dev/#q-SRAP-20)

**Where this belongs:** An external ABAP method after modifying custom BO ZI_Order. ls_failed is the preceding modify response. This example chooses to abandon the whole local transaction if any modification failed.

```abap
IF ls_failed IS NOT INITIAL.
  ROLLBACK ENTITIES.
  RETURN.
ENDIF.
COMMIT ENTITIES RESPONSE OF zi_order
  FAILED DATA(ls_save_failed)
  REPORTED DATA(ls_save_reported).
DATA(save_subrc) = sy-subrc.
IF save_subrc <> 0.
  ROLLBACK ENTITIES.
ENDIF.
```

**Read it step by step:**

1. **Choose the batch policy** (lines 1, 2, 3): This caller abandons all buffered changes after a failed modify. RAP does not make this the only possible policy for every mass operation.
2. **Save has its own result** (lines 5, 6, 7, 8): A modify can succeed and the save can still fail. Keep the save return code and responses instead of reporting success too early.
3. **This caller gives up after save failure** (lines 9, 10): Rollback clears the failed local transaction. For the supported late-save failure case with return code 8, rollback is required before continuing.

**What happens:** Only a successful commit is treated as a completed local save; unsuccessful transactions are abandoned.

**Scope:** Never paste this into a RAP handler or saver. Show the captured messages in the real caller. Rollback does not undo an independently committed remote request.

**Primary references:**

- [SAP: COMMIT ENTITIES response](https://help.sap.com/docs/abap-cloud/abap-keyword/commit-entities-response-of-long-form)
- [SAP: LUWs and late-save failure](https://help.sap.com/docs/abap-cloud/abap-concepts/luws-in-abap)

## Connect a new item to its new order

A temporary request label links the child to its parent before the caller knows the generated key.

Questions: [RAP-10](https://abap-interview-studio.pages.dev/#q-RAP-10), [SRAP-07](https://abap-interview-studio.pages.dev/#q-SRAP-07), [RAP-07](https://abap-interview-studio.pages.dev/#q-RAP-07)

**Where this belongs:** External consumer of non-draft managed BO ZI_Order with alias Order and create-enabled composition _Items. Both order and item have managed UUID keys; only Comment and Quantity are required business fields in this small model.

```abap
CONSTANTS co_order_cid TYPE abp_behv_cid VALUE 'O1'.
CONSTANTS co_item_cid TYPE abp_behv_cid VALUE 'I1'.
MODIFY ENTITIES OF zi_order
  ENTITY Order
  CREATE FIELDS ( Comment )
  WITH VALUE #( ( %cid = co_order_cid Comment = '' ) )
  CREATE BY \_Items FIELDS ( Quantity )
  WITH VALUE #(
    ( %cid_ref = co_order_cid
      %target = VALUE #(
        ( %cid = co_item_cid Quantity = 2 ) ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

**Read it step by step:**

1. **O1 means this new parent** (lines 1, 6, 9): The child's %cid_ref points to the parent's %cid within this request. O1 is not a database key.
2. **Create through the composition** (lines 7, 10, 11): CREATE BY _Items creates an item under that order. The item gets its own request label I1.
3. **Map labels to returned keys** (lines 12, 13, 14): MAPPED connects successful creates to their generated identities. FAILED identifies rejected operations and REPORTED carries messages.

**What happens:** One request creates an order and its quantity-2 item in the RAP buffer with the correct parent-child relationship.

**Scope:** Inspect all responses before deciding to save. Draft creates need draft identity; late numbering adds preliminary-key handling not shown here.

**Primary references:**

- [SAP samples: EML content IDs and create by association](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/08_EML_ABAP_for_RAP.md)

## Tell RAP when to check the dates

A validation belongs in the behavior definition so every relevant save path runs the rule.

Questions: [RAP-06](https://abap-interview-studio.pages.dev/#q-RAP-06), [RAP-13](https://abap-interview-studio.pages.dev/#q-RAP-13), [SRAP-03](https://abap-interview-studio.pages.dev/#q-SRAP-03), [SRAP-19](https://abap-interview-studio.pages.dev/#q-SRAP-19)

**Where this belongs:** Fragment inside the entity body of a managed, draft-enabled Order BDEF. BeginDate and EndDate exist. The generated validateDates handler implements the date check.

```abap
validation validateDates on save
{
  create;
  field BeginDate, EndDate;
}
draft determine action Prepare
{
  validation validateDates;
}
```

**Read it step by step:**

1. **Cover creation and both inputs** (lines 1, 3, 4): The rule is triggered for a newly created order and changes to either date. It is not just a check in one screen's button handler.
2. **Include draft preparation** (lines 6, 8): Prepare includes the validation for draft preparation. The on-save rule still matters for applicable active-data save paths.

**What happens:** An order with EndDate before BeginDate can be rejected by its validation before it is persisted.

**Scope:** Merge into the existing Prepare declaration rather than adding a second one. Do not depend on a fixed execution order or on a rule running only once.

**Primary references:**

- [SAP sample: validation and draft Prepare](https://github.com/SAP-samples/abap-platform-rap120/blob/main/exercises/ex04/README.md)
- [SAP: determination and validation modeling](https://help.sap.com/docs/abap-cloud/abap-rap/determination-and-validation-modelling?locale=en-US)

## Reject the order and explain the reason

FAILED stops the invalid instance; REPORTED tells the user what to fix.

Questions: [RAP-06](https://abap-interview-studio.pages.dev/#q-RAP-06), [RAP-07](https://abap-interview-studio.pages.dev/#q-RAP-07), [ADV-08](https://abap-interview-studio.pages.dev/#q-ADV-08), [SRAP-24](https://abap-interview-studio.pages.dev/#q-SRAP-24)

**Where this belongs:** Inside Order's validateDates handler, after an EML read of BeginDate and EndDate into lt_orders. The named constants co_state_dates, co_message_id and co_bad_dates identify a state area and a translatable message-class error.

```abap
LOOP AT lt_orders INTO DATA(ls_order).
  APPEND VALUE #(
    %tky = ls_order-%tky
    %state_area = co_state_dates ) TO reported-order.
  IF ls_order-EndDate < ls_order-BeginDate.
    APPEND VALUE #( %tky = ls_order-%tky )
      TO failed-order.
    APPEND VALUE #(
      %tky = ls_order-%tky
      %state_area = co_state_dates
      %element-EndDate = if_abap_behv=>mk-on
      %msg = new_message(
        id = co_message_id
        number = co_bad_dates
        severity = if_abap_behv_message=>severity-error ) )
      TO reported-order.
  ENDIF.
ENDLOOP.
```

**Read it step by step:**

1. **Clear the previous check result** (lines 2, 3, 4): The empty state-area entry invalidates the old date message for this instance before the rule is evaluated again.
2. **Reject this instance** (lines 5, 6, 7): When the end date is too early, the transactional key is added to FAILED. An error message alone is not the rejection.
3. **Point to the field to fix** (lines 9, 10, 11, 12, 16): The reported error is attached to this order and its EndDate field. After correction, the old state message is cleared and no replacement error is added.

**What happens:** The invalid order cannot be saved, and the user sees a date error on the correct order; correcting the dates clears it on revalidation.

**Scope:** Draft-enabled root example. Include this validation in Prepare. Child errors also need the appropriate path to their parent; initial dates need a separate rule if they are forbidden.

**Primary references:**

- [SAP: implementing validations](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-validations)
- [SAP: generic message implementation](https://help.sap.com/docs/ABAP_Cloud/abap-rap/generic-message-implementation)

## Recalculate instead of adding twice

A determination should produce the same total when RAP runs it again with the same inputs.

Questions: [RAP-06](https://abap-interview-studio.pages.dev/#q-RAP-06), [RAP-13](https://abap-interview-studio.pages.dev/#q-RAP-13), [SRAP-11](https://abap-interview-studio.pages.dev/#q-SRAP-11)

**Where this belongs:** Inside an Order determination of custom managed BO ZI_Order. The BDEF triggers it on create and changes to Quantity or UnitPrice. Total is derived and read-only to external consumers; numeric fields use suitable decimal types.

```abap
READ ENTITIES OF zi_order IN LOCAL MODE
  ENTITY Order
  FIELDS ( Quantity UnitPrice )
  WITH CORRESPONDING #( keys )
  RESULT DATA(lt_orders).
MODIFY ENTITIES OF zi_order IN LOCAL MODE
  ENTITY Order
  UPDATE FIELDS ( Total )
  WITH VALUE #( FOR ls_order IN lt_orders
    ( %tky = ls_order-%tky
      Total = ls_order-Quantity * ls_order-UnitPrice ) )
  REPORTED DATA(ls_reported).
APPEND LINES OF ls_reported-order TO reported-order.
```

**Read it step by step:**

1. **Read the current inputs** (lines 1, 3, 5): Use the transaction's current quantity and price, including unsaved edits.
2. **Replace the total** (lines 8, 10, 11): Quantity 3 and price 10 produce Total 30 every time. Adding 30 to the old total would incorrectly produce 60 on a second run.

**What happens:** The buffered Total becomes 30 for quantity 3 and unit price 10, regardless of repeated execution with those inputs.

**Scope:** Focused formula fragment; production code needs currency rounding and response handling appropriate to the actual BO. Determinations have no FAILED output and do not replace rejecting validations.

**Primary references:**

- [SAP: determination and validation modeling](https://help.sap.com/docs/abap-cloud/abap-rap/determination-and-validation-modelling?locale=en-US)

## Return the changed order from an action

Changing an order and returning the action result are two separate steps.

Questions: [ADV-04](https://abap-interview-studio.pages.dev/#q-ADV-04), [ADV-05](https://abap-interview-studio.pages.dev/#q-ADV-05)

**Where this belongs:** Tail of an instance action handler for Order with BDEF declaration action Approve result [1] $self. The preceding update has already succeeded for lt_successful_keys, a table of transactional keys; failures and messages have already been collected.

```abap
READ ENTITIES OF zi_order IN LOCAL MODE
  ENTITY Order
  ALL FIELDS
  WITH CORRESPONDING #( lt_successful_keys )
  RESULT DATA(lt_orders)
  FAILED DATA(ls_read_failed)
  REPORTED DATA(ls_read_reported).
result = VALUE #( FOR ls_order IN lt_orders
  ( %tky = ls_order-%tky
    %param = ls_order ) ).
```

**Read it step by step:**

1. **Read the changed data** (lines 3, 4, 5): Read the successful instances from the transaction after changing their status. Do not return the old input rows as the result.
2. **Fill the declared result** (lines 8, 9, 10): %tky identifies the action's instance and %param contains its returned order data for the declared $self result.

**What happens:** A successful Approve result contains the newly approved order data instead of an empty response.

**Scope:** Only the result-building step is shown; merge read failures/messages into the surrounding action responses. A copy or factory action needs its own declared create/result contract; this instance-action fragment does not implement CopyOrder.

**Primary references:**

- [SAP sample: instance actions and $self results](https://github.com/SAP-samples/abap-platform-rap-opensap/blob/main/week3/unit6.md)

## Choose which operations the service exposes

A projection reuses selected behavior from the underlying business object.

Questions: [RAP-01](https://abap-interview-studio.pages.dev/#q-RAP-01), [ADV-09](https://abap-interview-studio.pages.dev/#q-ADV-09), [CDS-05](https://abap-interview-studio.pages.dev/#q-CDS-05), [MODEL-16](https://abap-interview-studio.pages.dev/#q-MODEL-16)

**Where this belongs:** Projection behavior for custom CDS projection ZC_Order over ZI_Order. The underlying behavior already defines create, update and Approve; both behaviors use strict mode 2. This is a non-draft example.

```abap
projection;
strict ( 2 );
define behavior for ZC_Order alias Order
{
  use create;
  use update;
  use action Approve;
}
```

**Read it step by step:**

1. **This is the consumer-facing layer** (lines 1, 3): ZC_Order projects the underlying order BO. It does not implement a second database save.
2. **Expose selected operations** (lines 5, 6, 7): The consumer gets create, update and Approve from the base behavior. An operation missing from the underlying behavior cannot be invented by writing use here.

**What happens:** The projected BO offers these selected operations to its consumers.

**Scope:** A projection is not automatically a released SAP BO interface. Check the actual object's release contract before cross-component or SAP API consumption.

**Primary references:**

- [SAP: projection behavior definition](https://help.sap.com/docs/abap-cloud/abap-rap/projecting-behavior?locale=en-US)

## Give the entity its service name

The service definition selects entities; the service binding supplies the protocol.

Questions: [RAP-01](https://abap-interview-studio.pages.dev/#q-RAP-01), [ADV-09](https://abap-interview-studio.pages.dev/#q-ADV-09)

**Where this belongs:** Service definition ZUI_Order for an existing custom transactional projection ZC_Order. Create the appropriate service binding as a separate ADT repository object.

```sql
@EndUserText.label: 'Order service'
define service ZUI_Order
{
  expose ZC_Order as Orders;
}
```

**Read it step by step:**

1. **Publish this entity shape** (lines 2, 4): The service includes ZC_Order under the external entity name Orders.
2. **No OData version appears here** (lines 1, 2, 3, 4, 5): OData V4 UI or Web API is selected in a service binding, not in this definition. Activation of this source alone does not create a usable endpoint.

**What happens:** A matching published binding can expose the Orders entity with its projected fields and supported behavior.

**Scope:** Service access, binding publication, communication setup and UI annotations are separate tasks; available binding types depend on the target product and release.

**Primary references:**

- [SAP: service definition](https://help.sap.com/docs/abap-cloud/abap-keyword/cds-sdl-define-service)
- [SAP: service binding](https://help.sap.com/docs/abap-cloud/abap-rap/service-binding)

## Two timestamps protect two different checks

The entity ETag checks stale updates; the total ETag protects draft transitions against active changes.

Questions: [RAP-12](https://abap-interview-studio.pages.dev/#q-RAP-12), [ADV-01](https://abap-interview-studio.pages.dev/#q-ADV-01), [SRAP-09](https://abap-interview-studio.pages.dev/#q-SRAP-09), [SRAP-10](https://abap-interview-studio.pages.dev/#q-SRAP-10)

**Where this belongs:** Selected declarations from a managed draft Order BDEF. The full BDEF already has with draft, its persistent table, operations and readonly fields. zorder_d is a generated draft table; both timestamp fields have the proper CDS administrative annotations.

```abap
draft table zorder_d
etag master LocalLastChangedAt
lock master total etag LastChangedAt

// Inside the Order entity body:
draft action Edit;
draft action Activate optimized;
draft action Discard;
draft action Resume;
draft determine action Prepare;
```

**Read it step by step:**

1. **Check this entity version** (lines 2): LocalLastChangedAt supports the consumer's optimistic update check for the entity.
2. **Detect relevant active BO changes** (lines 3): LastChangedAt is the total ETag. If the active BO changed while a draft lock was no longer protecting it, a stale draft must not silently replace that newer state.
3. **Separate draft work from active data** (lines 6, 7, 8, 9): Edit starts draft editing, Activate attempts the active save, Discard drops draft work and Resume continues editing an existing draft.

**What happens:** A stale client or stale draft can be rejected instead of overwriting a newer active change.

**Scope:** Two insertion regions are shown, not a complete BDEF. Keep child lock dependencies and timestamp maintenance correct; include relevant validations in the existing Prepare declaration.

**Primary references:**

- [SAP: optimistic concurrency control](https://help.sap.com/docs/abap-cloud/abap-rap/optimistic-concurrency-control)
- [SAP sample: draft and ETag declarations](https://github.com/SAP-samples/abap-platform-rap120/blob/main/exercises/ex04/README.md)

## Tell the UI to reload Total

A side effect refreshes a value on the screen after another value changes.

Questions: [ADV-07](https://abap-interview-studio.pages.dev/#q-ADV-07), [SRAP-21](https://abap-interview-studio.pages.dev/#q-SRAP-21)

**Where this belongs:** First block: inside the base Order BDEF entity body. Final line: inside its projection BDEF entity body. Quantity and Total exist; a backend determination already recalculates Total.

```abap
// Base behavior: what must be reloaded?
side effects
{
  field Quantity affects field Total;
}

// Projection behavior: expose that rule.
use side effects;
```

**Read it step by step:**

1. **A UI refresh dependency** (lines 2, 4): When the user changes Quantity, the UI is told that Total should be read again.
2. **Expose it to the consumer** (lines 8): The projection reuses the base side-effect rules so a supporting consumer can receive them.

**What happens:** After Quantity changes from 2 to 3, a supporting Fiori consumer reloads the backend Total and displays the new value.

**Scope:** This does not calculate Total, save data or replace authorization. Verify RAP side-effect support and the generated metadata for the target binding and UI.

**Primary references:**

- [SAP: RAP side effect syntax](https://help.sap.com/docs/abap-cloud/abap-keyword/rap-side-effect?locale=en-US&state=PRODUCTION&version=latest)

## Items belong to the order's composition tree

A composition models the child entities that belong to one business object.

Questions: [RAP-01](https://abap-interview-studio.pages.dev/#q-RAP-01), [SRAP-07](https://abap-interview-studio.pages.dev/#q-SRAP-07), [CDS-04](https://abap-interview-studio.pages.dev/#q-CDS-04)

**Where this belongs:** Root CDS entity for custom table zorder. ZI_OrderItem already declares an association to parent ZI_Order as _Order, with its parent UUID join. Activate the dependent CDS definitions together.

```sql
define root view entity ZI_Order
  as select from zorder
  composition [0..*] of ZI_OrderItem as _Items
{
  key order_uuid as OrderUUID,
      order_comment as Comment,
      _Items
}
```

**Read it step by step:**

1. **One root, several children** (lines 1, 3): An order can own zero or more item instances in its BO tree. The child needs a matching association back to the parent.
2. **Expose the navigation** (lines 7): Including _Items in the element list makes the composition available in the CDS model. The BDEF separately enables create-by-association and defines lock and authorization dependencies.

**What happens:** The model has an Order-to-Items composition that RAP behavior can use for parent-child operations.

**Scope:** Composition syntax alone does not provide an entire transactional BO, cross-system atomicity or the required access-control design.

**Primary references:**

- [SAP sample: parent and child composition model](https://github.com/SAP-samples/abap-platform-rap-opensap/blob/main/week2/unit3.md)

## Return an authorization decision for Update

The authorization handler decides whether the caller may request an operation.

Questions: [ADV-02](https://abap-interview-studio.pages.dev/#q-ADV-02)

**Where this belongs:** Inside Order's generated get_global_authorizations handler; its BDEF declares authorization master ( global ). update_allowed is an abap_bool already obtained from the application's real authorization check, not from a UI flag.

```abap
IF requested_authorizations-%update =
   if_abap_behv=>mk-on.
  result-%update = COND #(
    WHEN update_allowed = abap_true
    THEN if_abap_behv=>auth-allowed
    ELSE if_abap_behv=>auth-unauthorized ).
ENDIF.
```

**Read it step by step:**

1. **Answer the requested operation** (lines 1, 2): The framework asks for Update authorization. Only fill this decision when it was requested.
2. **Allow or deny explicitly** (lines 3, 4, 5, 6): The result uses RAP's authorization constants. A disabled button is not this server-side permission decision.

**What happens:** A caller without update permission receives an unauthorized decision even if it bypasses the screen.

**Scope:** The real authority check, draft Edit and other requested operations must be implemented too. An action declared authorization:none is not protected by simply filling this Update result.

**Primary references:**

- [SAP samples: RAP global and instance authorization](https://github.com/SAP-samples/abap-cheat-sheets/blob/main/25_Authorization_Checks.md)

## Return the total count before cutting the page

The total count describes all matching rows, while the data response contains only the requested page.

Questions: [ADV-10](https://abap-interview-studio.pages.dev/#q-ADV-10), [MODEL-03](https://abap-interview-studio.pages.dev/#q-MODEL-03), [MODEL-05](https://abap-interview-studio.pages.dev/#q-MODEL-05)

**Where this belongs:** Inside IF_RAP_QUERY_PROVIDER~SELECT for a small in-memory demonstration. lt_all is a standard table of the query result type, already filtered, authorized and sorted exactly as requested, with a unique tie-breaker. lt_page has the same table type.

```abap
IF io_request->is_total_numb_of_rec_requested( ).
  io_response->set_total_number_of_records( lines( lt_all ) ).
ENDIF.
IF io_request->is_data_requested( ).
  DATA(paging) = io_request->get_paging( ).
  DATA(page_size) = paging->get_page_size( ).
  DATA(offset) = paging->get_offset( ).
  CLEAR lt_page.
  LOOP AT lt_all INTO DATA(ls_row).
    IF sy-tabix <= offset.
      CONTINUE.
    ENDIF.
    IF page_size <> if_rap_query_paging=>page_size_unlimited
       AND lines( lt_page ) >= page_size.
      EXIT.
    ENDIF.
    APPEND ls_row TO lt_page.
  ENDLOOP.
  io_response->set_data( lt_page ).
ENDIF.
```

**Read it step by step:**

1. **Count the full authorized result** (lines 1, 2): Lea can read matching orders 101, 104, 108 and 110. Return count 4 even when she requests only two rows.
2. **Apply skip and top** (lines 10, 11, 13, 14, 15): Skip the requested offset, then stop at the page size. Size zero returns no data; the unlimited constant does not impose a size limit.
3. **Send just this page** (lines 19): With skip 1 and top 2, return orders 104 and 108 from that same authorized and consistently ordered result.

**What happens:** The page contains orders 104 and 108; the total count remains 4.

**Scope:** This teaches response shaping, not a complete query provider. Apply filters, authorization, requested sorting, search and supported aggregation before paging; push work to the data source for large result sets.

**Primary references:**

- [SAP: implementing an unmanaged query](https://help.sap.com/docs/abap-cloud/abap-rap/implementing-unmanaged-query)
- [SAP: IF_RAP_QUERY_PAGING](https://help.sap.com/docs/ABAP_PLATFORM_NEW/fc4c71aa50014fd1b43721701471913d/c9e191cc92e54ca2bfec677037780c03.html?locale=en-us)

## Expose one new field through an allowed extension

Adding a field to the consumer projection is one step of extending a business object.

Questions: [ADV-12](https://abap-interview-studio.pages.dev/#q-ADV-12)

**Where this belongs:** A CDS view-entity extension for your own ZC_Order projection over ZI_Order. Your table and base entity already contain ApprovalReference, persistence mapping is maintained, and ZC_Order permits this extension in the target release. This is not an SAP standard BO.

```sql
@EndUserText.label: 'Order approval reference'
extend view entity ZC_Order with
{
  ApprovalReference
}
```

**Read it step by step:**

1. **Extend the permitted layer** (lines 2): The extension adds to the existing projection. Before writing it, verify that this exact entity is allowed to be extended.
2. **Expose an existing base field** (lines 4): ApprovalReference already exists below the projection. This line makes it part of the projection's field list; it does not create a table column or implement a validation.

**What happens:** After activating compatible objects, the projection includes ApprovalReference. Verify the field in service metadata, then test read, update and save through the real service.

**Scope:** For an SAP BO, use only its released extension points and supported names. Also check persistence, BDEF extension support, field permissions, validation, UI metadata and old consumers; this snippet alone does not prove end-to-end extensibility.

**Primary references:**

- [SAP: RAP extensibility enablement](https://help.sap.com/docs/abap-cloud/abap-rap/rap-extensibility-enablement)
- [SAP: extending CDS projection views](https://help.sap.com/docs/abap-cloud/abap-keyword/abap-cds-projection-views)

## A late number is assigned during save

Late numbering tells RAP that the final business key is not available during the initial create.

Questions: [RAP-11](https://abap-interview-studio.pages.dev/#q-RAP-11), [SRAP-08](https://abap-interview-studio.pages.dev/#q-SRAP-08)

**Where this belongs:** Selected regions of a custom managed Order BDEF using business document number OrderNumber as its key, assigned by ADJUST_NUMBERS during save. The behavior implementation includes the required ADJUST_NUMBERS saver logic. This alternative model is separate from the UUID-numbered examples.

```abap
// In the Order entity header:
late numbering

// Inside the Order entity body:
create;
field ( readonly ) OrderNumber;
```

**Read it step by step:**

1. **Declare the timing** (lines 2): New instances use preliminary identity until the save sequence assigns their final key. The saver must map preliminary identity to the actual returned number.
2. **Do not ask the caller to invent the key** (lines 5, 6): The consumer creates an order without supplying OrderNumber. It must not treat a temporary label as the final posting number.

**What happens:** The model can represent a newly created order before its final document number is known.

**Scope:** Declaration only: it does not implement ADJUST_NUMBERS or make a self-committing API safe. Draft requires suitable preliminary-key modeling; BAPI integration and late-save failure support depend on the target release.

**Primary references:**

- [SAP sample: late-numbering declarations](https://github.com/SAP-samples/abap-platform-rap110/blob/main/exercises/ex03/README.md)
- [SAP: BAPI numbering and save sequence](https://help.sap.com/docs/abap-cloud/developer-guide-from-classic-abap-to-abap-cloud/bapi-consumption-in-rap-late-numbering-and-save-sequence?locale=en-US&state=PRODUCTION&version=sap_cross_product_abap)

## Keep an amount beside its currency

A number such as 100 is not a complete monetary amount until its currency is known.

Questions: [CDS-01](https://abap-interview-studio.pages.dev/#q-CDS-01), [MODEL-07](https://abap-interview-studio.pages.dev/#q-MODEL-07)

**Where this belongs:** Custom CDS view entity over zorder, with a suitable amount column total_amount and currency column currency_code. This is a data-model fragment, not an analytical query.

```sql
define view entity ZI_OrderAmount
  as select from zorder
{
  key order_uuid as OrderUUID,
      currency_code as CurrencyCode,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      total_amount as TotalAmount
}
```

**Read it step by step:**

1. **Name the currency field** (lines 5, 6, 7): The annotation links TotalAmount to CurrencyCode in the same entity. A consumer can distinguish 100 EUR from 100 USD.
2. **This is meaning, not conversion** (lines 6): The annotation does not convert USD to EUR. Group by currency or perform an explicitly defined conversion before combining mixed-currency amounts.

**What happens:** The service can describe an amount together with its currency instead of presenting an unexplained number.

**Scope:** Do not assume a plain SQL SUM respects currency semantics automatically. Conversion requires the intended rate type, rate date, target currency and error policy.

**Primary references:**

- [SAP: amount and currency semantics in CDS](https://help.sap.com/docs/abap-cloud/abap-rap/defining-data-model-in-cds-views)

## Join only the text language you need

A complete text join avoids turning one order into several language rows.

Questions: [CDS-03](https://abap-interview-studio.pages.dev/#q-CDS-03), [CDS-11](https://abap-interview-studio.pages.dev/#q-CDS-11), [MODEL-06](https://abap-interview-studio.pages.dev/#q-MODEL-06), [MODEL-10](https://abap-interview-studio.pages.dev/#q-MODEL-10)

**Where this belongs:** Custom zorder has one row per order_uuid and a status column. ZI_StatusText has a genuine unique key of Status plus Language and a Description field; its Language uses the session language format.

```sql
define view entity ZI_OrderText
  as select from zorder as Orders
  association [0..1] to ZI_StatusText as _Text
    on Orders.status = _Text.Status
    and _Text.Language = $session.system_language
{
  key Orders.order_uuid as OrderUUID,
      Orders.status as Status,
      _Text.Description as StatusText
}
```

**Read it step by step:**

1. **Match both parts of the text key** (lines 4, 5): Matching only Status could find English, German and French rows. The language condition selects the current language.
2. **Cardinality must match real data** (lines 3, 7, 9): With at most one text row per status and language, selecting StatusText preserves one row per order. Writing [0..1] or key does not remove duplicate data.

**What happens:** An order with status texts in EN and DE still appears once when its text is selected for one language.

**Scope:** Missing text can remain empty; fallback-language logic is separate. Verify all key dimensions and the actual source uniqueness rather than using DISTINCT to hide an incomplete join.

**Primary references:**

- [SAP sample: text association with session language](https://github.com/SAP-samples/abap-partner-reference-application/blob/main/src/zpra_mf_service/zpra_mf_i_visit_status_vh.ddls.asddls)

## Put display hints in the metadata extension

UI annotations describe how a field is displayed without changing how the order is saved.

Questions: [CDS-08](https://abap-interview-studio.pages.dev/#q-CDS-08)

**Where this belongs:** Metadata extension for your own ZC_Order, which has @Metadata.allowExtensions: true. OrderNumber exists. This project uses CORE for its own base application metadata, not as a blanket layer choice for extending SAP applications.

```sql
@Metadata.layer: #CORE
annotate entity ZC_Order with
{
  @UI.lineItem: [ { position: 10 } ]
  @UI.identification: [ { position: 10 } ]
  OrderNumber;
}
```

**Read it step by step:**

1. **Annotate the existing entity** (lines 1, 2): The metadata extension targets ZC_Order. It adds presentation information rather than creating another BO or table.
2. **Show the field in the UI** (lines 4, 5, 6): LineItem describes list display and Identification describes an identification field. The position helps order these fields for a supporting Fiori elements consumer.

**What happens:** A supporting UI can show OrderNumber in the list and identification area using the service metadata.

**Scope:** Only annotations permitted in metadata extensions may be used there. The actual page layout also depends on facets and UI configuration; annotation layers control precedence, not authorization.

**Primary references:**

- [SAP: metadata extensions and allowed annotations](https://help.sap.com/docs/abap-cloud/abap-data-models/metadata-extensions)

## Protect the entity that the consumer actually reads

A higher CDS entity does not automatically inherit the lower entity's read restrictions.

Questions: [CDS-07](https://abap-interview-studio.pages.dev/#q-CDS-07), [MODEL-01](https://abap-interview-studio.pages.dev/#q-MODEL-01), [MODEL-14](https://abap-interview-studio.pages.dev/#q-MODEL-14)

**Where this belongs:** DCL access control for custom ZC_Order over ZI_Order. ZI_Order already has the intended DCL; ZC_Order uses #CHECK and exposes all authorization-relevant fields under compatible names. No other role grants broader access in this example.

```sql
@MappingRole: true
define role ZC_Order
{
  grant select on ZC_Order
    where inheriting conditions from entity ZI_Order;
}
```

**Read it step by step:**

1. **Protect the consumed entity** (lines 4): This rule names ZC_Order, which the consumer reads. A rule only on ZI_Order does not automatically protect reads of ZC_Order.
2. **Reuse the lower conditions explicitly** (lines 5): The inheritance condition applies the existing ZI_Order restrictions to this compatible model. Renamed or changed field paths may require explicit replacement mappings.

**What happens:** A normal DCL-protected read of ZC_Order applies the inherited row restrictions, rather than showing every order.

**Scope:** Test with restricted business users through the actual consumer. CDS read checks do not replace RAP operation authorization, and privileged reads or broader DCL grants need separate review.

**Primary references:**

- [SAP: CDS access control and nonautomatic inheritance](https://help.sap.com/docs/abap-cloud/abap-data-models/cds-authorization-concept)
- [SAP: implementing inherited read protection](https://help.sap.com/docs/btp/sap-business-technology-platform/implementing-read-protection)
