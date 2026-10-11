"""Original worked illustrations for ABAP value semantics and OO contracts."""

from reportlab.graphics.shapes import Circle, Line, Polygon, String
from reportlab.lib.colors import HexColor
from visual_modern import (
    base, table, note, make, txt, rect, arrow, lines,
    INK, TEAL, AMBER, PALE, MUTED, white,
)


WARM = HexColor('#fff0e1')
GRAY = HexColor('#d4dfe2')


def center(d, x, y, value, size=14, color=INK, bold=False):
    d.add(String(x, y, value, fontName='Helvetica-Bold' if bold else 'Helvetica',
                 fontSize=size, fillColor=color, textAnchor='middle'))


def rows(d, x, y, values, size=14, gap=24, color=INK):
    for index, value in enumerate(values):
        txt(d, x, y-index*gap, value, size, color)


def label(d, x, y, w, title, value, color=TEAL):
    rect(d, x, y, w, 82, white)
    txt(d, x+13, y+55, title, 14, color, True)
    txt(d, x+13, y+23, value, 21, INK, True)


def plate(ident, title, ids, caption, recall, limit, drawing):
    return make('deep-'+ident, title, ids, caption, recall, limit, drawing)


def _parameter_paths():
    d = base('An exception separates reference and value-result paths',
             'A plain CHANGING integer starts at 10; the method sets 20, then raises an exception')
    for y, mode, color, final in [(369, 'By reference', AMBER, 'Caller: 20'),
                                 (221, 'CHANGING VALUE', TEAL, 'Caller: 10')]:
        txt(d, 39, y+65, mode, 18, color, True)
        label(d, 40, y-33, 192, 'CALLER BEFORE', '10', color)
        label(d, 308, y-33, 245, 'METHOD WRITES', '20', color)
        label(d, 644, y-33, 195, 'CALLER AFTER', final, color)
        arrow(d, 241, y+9, 298, y+9, color)
        d.add(Line(563, y+9, 632, y+9, strokeColor=color, strokeWidth=2))
        d.add(Line(584, y-1, 603, y+19, strokeColor=AMBER, strokeWidth=3))
        d.add(Line(584, y+19, 603, y-1, strokeColor=AMBER, strokeWidth=3))
        center(d, 597, y+39, 'exception', 12, AMBER)
    txt(d, 44, 136, 'Reference: caller data was already changed.', 16, AMBER, True)
    txt(d, 44, 108, 'Value-result: no normal copy-back occurred.', 16, TEAL, True)
    note(d, 'The caller catches the exception. This is a scalar parameter example: database writes and mutations through object references are separate side effects.')
    return plate('parameter-paths', 'Parameter values after exceptional exit', 'BASE-01',
                 'Compare the same assignment under two transfer modes. The final caller value is visible evidence of the difference.',
                 'Which result changes if the method returns normally? What changes if the parameter holds an object reference?',
                 'This assumes a plain integer, value-result passing, and no additional side effects.', d)


def _alias_snapshot():
    d = base('Copying a structure does not clone its referenced object',
             'Before: both structures contain note = Draft and a reference to the same pricing object')
    for x, name, value in [(38, 'ls_original', 'Draft'), (465, 'ls_copy', 'Revised')]:
        rect(d, x, 290, 377, 159, white)
        txt(d, x+18, 420, name, 19, TEAL, True)
        txt(d, x+18, 384, 'note (string)', 14)
        txt(d, x+215, 384, value, 18, INK, True)
        txt(d, x+18, 338, 'price_ref', 14)
        d.add(Circle(x+235, 342, 10, fillColor=TEAL, strokeColor=None))
    rect(d, 264, 126, 356, 117, PALE)
    txt(d, 288, 211, 'ONE PRICING OBJECT', 18, TEAL, True)
    txt(d, 288, 175, 'amount: 100 -> 120 EUR', 20, INK, True)
    txt(d, 288, 147, 'Mutation is visible through either reference.', 13)
    arrow(d, 273, 330, 355, 251, TEAL)
    arrow(d, 700, 330, 530, 251, TEAL)
    note(d, 'The copied string changes independently. Clearing one reference leaves the other usable. A snapshot must define how mutable referenced objects are handled.')
    return plate('alias-snapshot', 'Value components versus a shared referent',
                 'BASE-02 OODEEP-06 OODEEP-10',
                 'Two structure values own independent string values but lead to the same pricing object. The arrow targets explain why a getter can expose mutable state.',
                 'Which change affects only ls_copy, and which change affects an object visible through both?',
                 'Conceptual object identity, not physical memory addresses or a particular sharing optimization.', d)


def _memory_lifetime():
    d = base('Row contents, allocation, and class state are different',
             'Conceptual memory ledger: bars are not measured sizes')
    labels = [('Populated table', True, True), ('After CLEAR', False, True),
              ('After FREE', False, False)]
    for index, (name, populated, allocated) in enumerate(labels):
        y = 391-index*92
        txt(d, 40, y+19, name, 17, INK, True)
        rect(d, 257, y, 120, 54, PALE if allocated else white, GRAY)
        center(d, 317, y+30, 'initial', 14, TEAL if allocated else MUTED)
        center(d, 317, y+11, 'allocation' if allocated else 'released', 12)
        for n in range(7):
            rect(d, 390+n*57, y, 47, 54, TEAL if populated else white, GRAY)
            center(d, 413+n*57, y+20, str(n+1) if populated else '-', 16,
                   white if populated else MUTED)
    txt(d, 41, 165, 'NEW service( ) resets neither a class cache nor another reference.', 17, TEAL, True)
    txt(d, 41, 133, 'Instance lifetime != static lifetime != resource ownership.', 17, INK, True)
    note(d, 'CLEAR retains the table initial allocation; FREE releases it too. Neither guarantees immediate operating-system memory shrinkage or resets CLASS-DATA.')
    return plate('memory-lifetime', 'Three distinct state and memory lifetimes', 'BASE-03 OODEEP-08',
                 'Empty row slots and the initial allocation are deliberately drawn separately. A new object does not imply a new internal session or empty class cache.',
                 'Why can recreating a service leave a test-order failure unchanged?',
                 'Allocation diagram is qualitative; measure actual ABAP memory and cache lifetime in the target context.', d)


def _stale_results():
    d = base('A result belongs to the operation that produced it',
             'Two sequential defects: stale field-symbol target and overwritten return code')
    table(d, 36, 407, 807, ['Step', 'Operation', 'Result after this step'],
          [['1', 'ASSIGN component PRICE', '<field> -> PRICE; sy-subrc = 0'],
           ['2', 'ASSIGN component PRCIE fails', 'Old assignment may remain; result = 4'],
           ['3', 'Write through old alias', 'PRICE can be changed accidentally']],
          [0.45, 1.7, 2.5], 45)
    txt(d, 46, 234, 'Separate return-code trap', 19, TEAL, True)
    for x, heading, value, color in [(40, 'READ misses', 'sy-subrc = 4', AMBER),
                                    (323, 'FIND succeeds', 'sy-subrc = 0', TEAL),
                                    (605, 'Later IF = 0', 'Tests FIND', INK)]:
        label(d, x, 120, 235, heading, value, color)
    arrow(d, 280, 160, 312, 160); arrow(d, 564, 160, 596, 160)
    note(d, 'Consume or preserve the latest result immediately. Use ELSE UNASSIGN where supported, or unassign before the dynamic assignment and handle failure.')
    return plate('stale-results', 'Stale aliases and overwritten return codes', 'BASE-04 BASE-05',
                 'The first sequence can write to the previous target. The second takes a success branch for a different operation than the programmer intended.',
                 'Which test requires a successful operation before the failure to expose the defect?',
                 'Only statements documented to set sy-subrc replace it. Assignment failure behavior depends on the exact form and additions.', d)


def _numeric_boundaries():
    d = base('Small numeric examples expose three different contracts',
             'Representability, business rounding, and accumulator initialization are separate decisions')
    txt(d, 37, 442, 'LOSSLESS CONVERSION', 16, TEAL, True)
    for i, letter in enumerate('ABCD'):
        rect(d, 39+i*48, 368, 40, 44, AMBER if i==3 else TEAL)
        center(d, 59+i*48, 383, letter, 21, white, True)
    arrow(d, 251, 390, 321, 390)
    txt(d, 347, 395, 'Target: 3 characters', 18, INK, True)
    txt(d, 347, 368, 'EXACT rejects the lost D.', 16, AMBER)
    table(d, 36, 291, 806, ['Half-up to 2 decimals', 'Calculation', 'Total'],
          [['Round each line, then sum', '0.01 + 0.01', '0.02'],
           ['Sum 0.005 + 0.005, then round', 'round(0.010)', '0.01']], [2.3,1.3,0.8], 40)
    rect(d, 38, 106, 804, 76, PALE)
    txt(d, 56, 155, 'MAX of {-8, -3}: correct result = -3', 19, TEAL, True)
    txt(d, 56, 126, 'Starting the accumulator at 0 invents a larger candidate that is not in the input.', 15)
    note(d, 'Formatting is not validation. Specify rounding stage and mode, and define empty-input semantics before choosing an expression.')
    return plate('numeric-boundaries', 'Conversion, rounding, and reduction counterexamples',
                 'BASE-06 BASE-07 BASE-11',
                 'A lost character, a one-cent difference, and a false maximum reveal three unrelated errors that concise syntax can hide.',
                 'Which expected results change with a different rounding mode, and which are independent of rounding?',
                 'Half-up and two decimals are explicit exercise assumptions, not a universal currency rule. MAX notation is explanatory.', d)


def _presence_merge():
    d = base('Preserving a base is not the same as preserving omission',
             'Saved structure: status = Approved; note = Old')
    table(d, 34, 413, 812, ['Source shape / value', 'Plain CORRESPONDING', 'With BASE(existing)'],
          [['note = New; no status field', 'status becomes initial', 'status stays Approved'],
           ['note = New; status is initial', 'status becomes initial', 'status becomes initial'],
           ['note = New; status = Draft', 'status becomes Draft', 'status becomes Draft']],
          [1.55,1.45,1.5], 49)
    txt(d, 40, 230, 'Optional parameter presence is another explicit signal', 18, TEAL, True)
    table(d, 39, 172, 801, ['Call', 'Value', 'IS INITIAL', 'IS SUPPLIED'],
          [['Argument omitted', '0', 'true', 'false'],
           ['Argument explicitly zero', '0', 'true', 'true']], [2,0.7,1,1.2], 30)
    note(d, 'A wrapper that always forwards an optional argument makes it supplied downstream. BASE only preserves components not overwritten by matching source components.')
    return plate('presence-merge', 'Three mapping cases and two presence cases', 'BASE-08 BASE-14',
                 'The matching initial status overwrites BASE just as a populated status does. A separate parameter table shows why zero cannot encode omission.',
                 'Which source needs a presence flag when the source type always contains status?',
                 'Structure mapping example; internal-table BASE preserves rows under different construction semantics.', d)


def _group_filter():
    d = base('Grouping collects members; FILTER chooses a key path',
             'Arrival order: A/10, B/20, A/30. No pre-sort is required for GROUP BY customer.')
    for i, (customer, amount) in enumerate([('A','10'),('B','20'),('A','30')]):
        y=379-i*77
        rect(d, 40, y, 170, 55, TEAL if customer=='A' else INK)
        txt(d, 58, y+18, customer+' / '+amount, 22, white, True)
        arrow(d, 219, y+27, 354 if customer=='A' else 627,
              388 if customer=='A' else 253, TEAL if customer=='A' else INK)
    rect(d, 365, 347, 470, 92, PALE)
    txt(d, 386, 408, 'Group A: two members', 19, TEAL, True)
    txt(d, 386, 376, '10 + 30 = 40', 22, INK, True)
    rect(d, 628, 213, 207, 84, white)
    txt(d, 645, 266, 'Group B', 18, INK, True)
    txt(d, 645, 237, '20', 22, INK, True)
    rect(d, 40, 104, 796, 83, white)
    txt(d, 55, 159, 'Standard table + empty primary key: basic FILTER needs more.', 17, TEAL, True)
    txt(d, 55, 130, 'A suitable sorted secondary key by customer can be selected with USING KEY.', 15)
    note(d, 'Group body: once per group; member loop: once per member. FILTER predicates must satisfy the selected sorted/hash key rules.')
    return plate('group-filter', 'Unsorted group membership and explicit filter keys', 'BASE-09 BASE-10',
                 'Arrows bring nonadjacent A rows into one group. The grouping total is computed from members, not read from the representative row.',
                 'What changes with WITHOUT MEMBERS, and why is an arbitrary OR predicate not automatically a basic FILTER condition?',
                 'Source rows and totals are illustrative; no measured performance advantage is asserted.', d)


def _duplicates_ranges():
    d = base('An empty set and an empty selection range are not alike',
             'Two boundary cases that need an explicit business policy')
    txt(d, 39, 441, 'UNIQUE INTERNAL-TABLE INSERT', 17, TEAL, True)
    table(d, 39, 385, 354, ['Key', 'Saved amount'], [['7','10']], [1,2], 42)
    txt(d, 446, 407, 'Try key 7 / amount 20', 19, INK, True)
    arrow(d, 439, 362, 403, 362, AMBER)
    txt(d, 446, 351, 'Duplicate: not an update.', 17, AMBER, True)
    txt(d, 446, 320, 'Existing amount remains 10.', 16)
    txt(d, 39, 261, 'NO PERMITTED PLANTS', 17, TEAL, True)
    rect(d, 40, 148, 180, 76, white, GRAY)
    center(d, 130, 181, 'range = [ ]', 21, INK, True)
    arrow(d, 232, 188, 310, 188, AMBER)
    rect(d, 323, 139, 513, 91, WARM)
    txt(d, 342, 202, 'IN initial_range means no restriction.', 18, AMBER, True)
    txt(d, 342, 173, 'No authorization must return no rows or reject', 15)
    txt(d, 342, 151, 'before the otherwise unrestricted query.', 15)
    note(d, 'Duplicate rejection does not define a merge policy. Empty authorization is not an optional empty filter; keep the permission decision explicit.')
    return plate('duplicates-ranges', 'Duplicate insertion and empty authorization boundaries',
                 'BASE-15 BASE-16',
                 'A duplicate unique key preserves the original row for the specified insertion form. An initial selection range has a very different meaning from an empty list of permissions.',
                 'How would you distinguish identical duplicates from conflicting ones, and prove a user with no plants sees nothing?',
                 'Single-line INSERT INTO TABLE with a unique primary key; other insertion and key-conflict forms need their own documented handling.', d)


def _sql_inputs():
    d = base('Bind values; select identifiers from a controlled vocabulary',
             "Input: customer name = O'Brien; sort option = customer")
    label(d, 40, 337, 320, 'DATA VALUE', "O'Brien")
    label(d, 519, 337, 320, 'USER SORT OPTION', 'customer')
    arrow(d, 199, 329, 199, 268, TEAL)
    arrow(d, 679, 329, 679, 268, TEAL)
    rect(d, 40, 172, 320, 86, PALE)
    rows(d, 58, 225, ['Bind through @customer_name.', 'An apostrophe remains data.'], 16)
    rect(d, 519, 172, 320, 86, PALE)
    rows(d, 537, 227, ['Map allowed customer option', 'to a server-chosen column.'], 15)
    rect(d, 374, 290, 133, 53, WARM)
    center(d, 440, 321, 'not SQL', 17, AMBER, True)
    center(d, 440, 301, 'from the client', 12, AMBER)
    txt(d, 42, 119, 'Authorization conditions remain mandatory and independent of user filters.', 17, INK, True)
    note(d, 'Quoting a string cannot authorize a column, table, operator, or whole clause. Keep the SQL shape static wherever possible; reject unsupported sort options.')
    return plate('sql-inputs', 'Two input kinds and two safe handling paths', 'BASE-12',
                 'The apostrophe is intentionally harmless data on the left. The sort request on the right selects a predefined identifier rather than supplying executable SQL.',
                 'Why would quoting the sort option as a literal fail to solve identifier validation?',
                 'Conceptual SQL boundary; available dynamic-programming helpers and API release status depend on the target environment.', d)


def _cleanup_cause():
    d = base('CLEANUP is unwinding work, not a universal finally',
             'An application-owned resource has an explicit release obligation')
    table(d, 36, 407, 806, ['Exit path', 'CLEANUP in this TRY?', 'Required design'],
          [['Normal completion', 'No', 'Explicit normal release'],
           ['Handled by same TRY', 'Not merely for this catch', 'Cover this handled path'],
           ['Propagates to outer handler', 'Relevant unwinding path', 'Restore local consistency']],
          [1.3,1.6,1.7], 44)
    txt(d, 39, 231, 'Translate meaning; retain the diagnostic cause', 18, TEAL, True)
    label(d, 39, 115, 360, 'TECHNICAL EXCEPTION', 'Connection unavailable', AMBER)
    label(d, 483, 115, 357, 'SERVICE EXCEPTION', 'Price service unavailable', TEAL)
    arrow(d, 409, 159, 474, 159, TEAL)
    center(d, 444, 213, 'previous', 14, TEAL, True)
    note(d, 'An empty price is not a safe default for a failed lookup. Release the resource you own, preserve the cause, and do not hide technical failure as business absence.')
    return plate('cleanup-cause', 'Exceptional exits and preserved causes', 'BASE-13 OODEEP-09',
                 'The table names three exit paths that require separate reasoning. The exception chain carries the lower-level diagnosis through a meaningful service-level failure.',
                 'Which path would a test of only propagated exceptions miss?',
                 'Simplified non-resumable scenarios; exact nesting and handlers determine CLEANUP execution. Resource ownership remains application-specific.', d)


def _substitution_dispatch():
    d = base('Same call shape does not prove the same behavior',
             'Shared quote contract: accept every positive quantity; return the requested currency')
    rect(d, 42, 356, 250, 84, INK)
    rows(d, 61, 411, ['quote(quantity = 1,', 'currency = EUR)'], 19, 27, white)
    arrow(d, 303, 397, 391, 397, TEAL)
    arrow(d, 303, 390, 391, 285, AMBER)
    rect(d, 404, 353, 436, 91, PALE)
    rows(d, 423, 412, ['Provider A: 12 EUR', 'Accepts the promised input.'], 18)
    rect(d, 404, 245, 436, 87, WARM)
    rows(d, 423, 301, ['Provider B: minimum quantity 10', 'Breaks the shared precondition.'], 17)
    table(d, 40, 177, 800, ['Change request', 'Contract-preserving direction'],
          [['Different inherited implementation', 'REDEFINITION keeps the signature'],
           ['Optional simulation capability', 'Separate capability; honest unsupported result']],
          [1.4,2], 34)
    note(d, 'The interface supports common dispatch across unrelated classes. It does not enforce business substitutability. Shared code alone does not justify a superclass.')
    return plate('substitution-dispatch', 'A concrete counterexample to substitutability',
                 'OODEEP-01 OODEEP-02 OODEEP-03 OODEEP-04 OODEEP-11',
                 'A valid quantity-one call exposes a behavioral violation invisible in matching parameter types. The lower table separates redefinition from a genuinely new capability.',
                 'Would downcasting every caller to Provider B repair the contract? What else besides accepted inputs must agree?',
                 'Hypothetical contract; a narrower published domain would lead to a different assessment. No executable interface is implied.', d)


def _construction_test():
    d = base('Build a valid object, then test the real decision',
             'Approval service: a repository is mandatory; the discount threshold remains real code')
    for x, title, value, color in [(39,'CREATION INPUT','Repository: initial',AMBER),
                                   (474,'CREATION INPUT','Repository: bound',TEAL)]:
        label(d, x, 352, 366, title, value, color)
    arrow(d, 219, 342, 219, 287, AMBER)
    arrow(d, 653, 342, 653, 287, TEAL)
    center(d, 220, 260, 'Reject before business use', 18, AMBER, True)
    center(d, 655, 260, 'Construct a usable instance', 18, TEAL, True)
    rect(d, 37, 116, 239, 103, white)
    rows(d, 54, 188, ['CONTROLLED DEPENDENCY', 'Price source double', 'Returns 100 EUR'], 14)
    rect(d, 318, 116, 248, 103, TEAL)
    rows(d, 336, 188, ['REAL CALCULATION', 'Threshold and discount', 'Actual result: 90 EUR'], 14,24,white)
    rect(d, 609, 116, 230, 103, white)
    rows(d, 625, 188, ['ASSERTION', 'Expected: 90 EUR', 'Broken rule must fail'], 14)
    arrow(d, 281, 164, 311, 164); arrow(d, 573, 164, 601, 164)
    note(d, 'A narrow test friendship may expose a necessary seam; it is unilateral and broader than public access. Prefer observable behavior over private representation checks.')
    return plate('construction-test', 'Construction invariants and meaningful test boundaries',
                 'OODEEP-05 OODEEP-07 OODEEP-12',
                 'Invalid dependencies are rejected before use. In the successful test, the input price is controlled but the discount rule itself executes.',
                 'What defect should make the assertion fail, and which private access is actually necessary?',
                 'The 10-percent discount is an illustrative fixture, not an application rule. Friendship details and real integration require separate checks.', d)


def build_foundations_deep_visuals():
    return [factory() for factory in (
        _parameter_paths, _alias_snapshot, _memory_lifetime, _stale_results,
        _numeric_boundaries, _presence_merge, _group_filter, _duplicates_ranges,
        _sql_inputs, _cleanup_cause, _substitution_dispatch, _construction_test,
    )]
