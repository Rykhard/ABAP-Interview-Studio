"""Worked HANA review and source-to-runtime evidence plates."""

from visual_modern import (
    base, panel, table, note, make, txt, rect, arrow, lines,
    INK, TEAL, AMBER, PALE, white,
)


def _hana_review():
    d = base('Correct grain before faster execution',
             'Fictional Order 4711: two items; each accidentally joins to two language texts')
    table(d, 36, 410, 340, ['Item', 'Amount EUR'],
          [['10', '40'], ['20', '60']], [1, 1.3], 40)
    txt(d, 46, 297, 'Correct total: 100 EUR', 18, TEAL, True)
    arrow(d, 385, 373, 445, 373, AMBER)
    txt(d, 391, 396, 'join', 14, AMBER, True)
    table(d, 456, 410, 388, ['Item', 'Language', 'Amount EUR'],
          [['10', 'EN', '40'], ['10', 'DE', '40'],
           ['20', 'EN', '60'], ['20', 'DE', '60']], [.7, 1, 1.3], 31)
    txt(d, 466, 263, 'Wrong total: 200 EUR', 18, AMBER, True)
    rect(d, 36, 123, 809, 117, PALE)
    txt(d, 51, 210, 'Review gates before comparing SQL/CDS and AMDP', 18, TEAL, True)
    txt(d, 51, 183, '1  Restore result grain, client isolation and business authorization.', 14)
    txt(d, 51, 159, '2  For a CDS table function, verify read-only and target-specific client safety.', 14)
    txt(d, 51, 135, '3  Measure database work, returned rows and end-to-end time on equal results.', 14)
    txt(d, 37, 99, 'One million detail rows -> grouped results can reduce transfer; measure the actual plan.', 14)
    note(d, 'A faster wrong aggregate is still wrong. General AMDP capabilities differ from the CDS table-function contract; eligible APIs and release support still apply.')
    return make('hana-grain-review', 'HANA pushdown: result grain and table-function review',
                'SQLX-01 SQLX-02',
                'A two-language text join duplicates both item amounts. Repair the relationship before accepting a performance rewrite, then verify security, client isolation and the chosen implementation contract.',
                'Why would DISTINCT or dividing by two be an unreliable repair, and what metrics would justify pushdown?',
                'Illustrative data, not a benchmark. Read-only here refers to the cited CDS table-function scenario, not every AMDP method; check target rules and consumption-path security.', d)


def _delivery_evidence():
    d = base('A source revision is not a deployed runtime',
             'Worked release evidence: connect commit REV-42 to delivery D-17 and target system TST')
    table(d, 35, 410, 810, ['Evidence layer', 'What it establishes', 'What it does not prove'],
          [['Git commit REV-42', 'Reviewable source revision', 'Target activation or import'],
           ['abapGit source transfer', 'Supported objects transferred', 'Complete productive delivery'],
           ['Target checks for REV-42', 'Recorded syntax / ATC / tests', 'Every external integration'],
           ['Delivery D-17 into TST', 'Recorded import and revision', 'Service works until tested']],
          [1.3, 1.65, 1.65], 39)
    panel(d, 36, 131, 247, 109, 'CHOOSE THE TARGET ROUTE', '')
    lines(d, 49, 177, 'Product, software component, transport or delivery package.', 31, 13)
    panel(d, 316, 131, 247, 109, 'VERIFY PREREQUISITES', '')
    lines(d, 329, 177, 'Dependency versions, import order, service and communication setup.', 31, 13)
    panel(d, 596, 131, 247, 109, 'OBSERVE THE TARGET', '')
    lines(d, 609, 177, 'Revision readback, smoke test, denied-user check, recovery owner.', 31, 13)
    arrow(d, 290, 179, 309, 179)
    arrow(d, 570, 179, 589, 179)
    txt(d, 38, 102, 'Local lint and mock tests are useful evidence with a narrower scope.', 16, INK, True)
    note(d, 'abapGit and gCTS are different tools. BTP ABAP environment delivery choices must not be imposed on every ABAP Cloud product or landscape.')
    return make('delivery-source-runtime-evidence', 'Source transfer, delivery and verified runtime evidence',
                'DELIV-01',
                'Four evidence layers answer different questions. A release links the reviewed and tested revision to an actual imported state, then verifies the target consumer and configuration.',
                'Which artifact proves what was imported, and what can fail after a successful import?',
                'REV-42, D-17 and TST are fictional identifiers. The table is an evidence checklist, not a mandatory sequence requiring abapGit in every transport landscape.', d)


def build_delivery_hana_visuals():
    """Return two worked plates with mappings to all three supporting questions."""
    return [_hana_review(), _delivery_evidence()]
