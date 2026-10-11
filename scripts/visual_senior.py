"""Original worked teaching plates for senior ABAP Cloud scenarios."""

from reportlab.graphics.shapes import Circle, Line, Polygon, String
from reportlab.lib.colors import HexColor
from visual_modern import (
    base, panel, table, note, make, txt, rect, arrow, lines,
    INK, TEAL, AMBER, PALE, white,
)


WARM = HexColor('#fff0e1')
MUTED = HexColor('#536b7c')


def _center(d, x, y, text, size=14, color=INK, bold=False):
    d.add(String(x, y, text, fontName='Helvetica-Bold' if bold else 'Helvetica',
                 fontSize=size, fillColor=color, textAnchor='middle'))


def _text_lines(d, x, y, content, size=14, color=INK, leading=23):
    for index, text in enumerate(content):
        txt(d, x, y - index * leading, text, size, color)


def _control():
    d = base('An initial value is not the same as an omitted update',
             'Worked EML mapping: saved Comment = "Urgent"; saved Amount = 120 EUR')
    table(d, 34, 414, 812,
          ['Update intent', 'Comment value', '%control-Comment', 'Resulting Comment'],
          [['Leave unchanged', 'Initial / blank', 'off', 'Urgent'],
           ['Explicitly clear', 'Initial / blank', 'on', '(empty)'],
           ['Replace text', 'Follow up', 'on', 'Follow up']],
          [1.25, 1.25, 1.35, 1.5], 48)
    rect(d, 38, 139, 382, 96, PALE)
    txt(d, 55, 207, 'Same value, different intent', 17, TEAL, True)
    _text_lines(d, 55, 180, ['Blank + off preserves the old text.',
                            'Blank + on requests a clear.'], 15)
    rect(d, 458, 139, 383, 96, white)
    txt(d, 475, 207, 'Untouched fields stay untouched', 17, TEAL, True)
    _text_lines(d, 475, 180, ['Amount remains 120 EUR in all three cases.',
                             'Do not turn every control flag on.'], 14)
    note(d, 'Use the generated field control or UPDATE FIELDS contract. Trace payload mapping and determinations; do not use IS INITIAL as a universal presence test.')
    return make('senior-control-presence', 'EML update intent: absent versus clear',
                'SRAP-06 SRAP-12 HTTP-07 HTTP-09',
                'The first two requests carry the same initial ABAP value but differ in update intent. The field control decides whether the old comment is preserved or explicitly cleared.',
                'How would you preserve Amount while clearing Comment, and how could an adapter lose that distinction?',
                'This is a worked mapping example. Actual generated EML types, UPDATE FIELDS syntax, protocol nullability, and business validation remain authoritative.', d)


def _responses():
    d = base('Three response channels; three different meanings',
             'Illustrative create interaction: C1 and C3 accepted into the buffer; C2 rejected')
    table(d, 39, 414, 803, ['Input %cid', 'Amount', 'Interaction outcome'],
          [['C1', '100 EUR', 'Accepted; assigned key 4711'],
           ['C2', '-5 EUR', 'Rejected: amount must be positive'],
           ['C3', '80 EUR', 'Accepted; key 4712; informational message']],
          [1, 1, 3.2], 37)
    for x, title, color in [(38, 'FAILED', AMBER), (322, 'REPORTED', INK),
                             (606, 'MAPPED', TEAL)]:
        rect(d, x, 135, 236, 145, white)
        rect(d, x, 238, 236, 42, color)
        txt(d, x + 14, 252, title, 18, white, True)
    _text_lines(d, 52, 212, ['C2: rejected create', '', 'Identity + failure cause'], 14)
    _text_lines(d, 336, 212, ['C2: amount error', 'C3: information', 'Message + instance context'], 14)
    _text_lines(d, 620, 212, ['C1 -> 4711', 'C3 -> 4712', 'Creation / key correlation'], 14)
    txt(d, 40, 105, 'Interaction responses are not a commit receipt. Inspect the subsequent save outcome.', 16, INK, True)
    note(d, 'A REPORTED message is not always a failure; MAPPED is not a universal success list. The consumer and request boundary determine the atomicity policy.')
    return make('senior-response-channels', 'FAILED, REPORTED, and MAPPED in a worked create',
                'SRAP-05 SRAP-07 SRAP-20 OPS-03',
                'Three input identities produce separate rejection, message, and key-correlation information. A message on C3 does not itself reject that input, and assigned keys do not prove durable persistence.',
                'What must the consumer inspect after this interaction, and what happens if the later save fails?',
                'Conceptual response contents, not executable EML. Available fields and correlation depend on the operation and BO; save and atomicity semantics must be tested separately.', d)


def _uncertain():
    d = base('A lost response leaves an unknown outcome',
             'Worked recovery: stable request key REQ-42; remote payment receipt PAY-900')
    rect(d, 38, 160, 347, 292, white)
    rect(d, 492, 160, 347, 292, white)
    txt(d, 55, 424, 'LOCAL REQUEST', 18, TEAL, True)
    txt(d, 509, 424, 'REMOTE PAYMENT', 18, TEAL, True)
    _text_lines(d, 55, 389, ['REQ-42', 'Commit durable Pending state.',
                            'Delivery has an explicit retry owner.'], 14)
    _text_lines(d, 509, 389, ['REQ-42 received', 'Remote transaction commits payment.',
                             'Receipt: PAY-900'], 14)
    arrow(d, 389, 350, 486, 350, TEAL)
    _center(d, 439, 367, 'send', 13, TEAL)
    d.add(Line(489, 294, 389, 294, strokeColor=AMBER,
               strokeWidth=2, strokeDashArray=[5, 4]))
    d.add(Line(431, 285, 447, 303, strokeColor=AMBER, strokeWidth=3))
    d.add(Line(431, 303, 447, 285, strokeColor=AMBER, strokeWidth=3))
    _center(d, 439, 269, 'response lost', 12, AMBER)
    rect(d, 55, 201, 313, 69, WARM)
    txt(d, 69, 245, 'Timed out does not mean unpaid', 16, AMBER, True)
    txt(d, 69, 222, 'Record Unknown; reconcile REQ-42.', 14)
    # Receipt with a perforated lower edge is an original visual metaphor.
    points = [540, 179, 540, 297, 792, 297, 792, 179]
    for x in range(792, 539, -14):
        points.extend([x - 7, 187, max(540, x - 14), 179])
    d.add(Polygon(points, fillColor=PALE, strokeColor=TEAL))
    _text_lines(d, 558, 270, ['PAYMENT RECEIPT', 'REQ-42  /  PAY-900',
                             'Status: paid', 'One effect already exists.'], 15)
    txt(d, 40, 115, 'Recover by correlation: query status or use the supported idempotency contract.', 16, INK, True)
    note(d, 'A local rollback cannot erase PAY-900. Blindly resending a non-idempotent operation can create another payment; compensation is a separate business operation.')
    return make('senior-remote-uncertainty', 'Remote commit and uncertain local outcome',
                'SRAP-04 SRAP-18 SRAP-23 OPS-11 CLOUD-01',
                'The local application durably records intent before separately owned delivery. The remote payment commits, but its reply is lost; recovery must identify the existing effect through REQ-42.',
                'How do you distinguish an unprocessed request from a committed payment whose response never arrived?',
                'The delivery and idempotency mechanisms are design requirements, not automatic guarantees from HTTP or RAP. This example does not claim distributed atomicity.', d)


def _authorization():
    d = base('Permission for the old state does not approve the new state',
             'Policy fixture: user may edit organization A, but may not transfer an order to B')
    table(d, 36, 410, 807, ['Order', 'Existing organization', 'Proposed organization', 'Decision'],
          [['4711', 'A', 'A', 'Allowed if other rules pass'],
           ['4712', 'A', 'B', 'Reject target change'],
           ['4713', 'A', '(omitted)', 'Keep A; check actual intent']],
          [.65, 1.3, 1.4, 1.8], 47)
    # A permit stamp and a rejected destination make the two policies distinct.
    d.add(Circle(143, 191, 58, fillColor=PALE, strokeColor=TEAL, strokeWidth=3))
    _center(d, 143, 210, 'EXISTING A', 16, TEAL, True)
    _center(d, 143, 184, 'may edit', 17, TEAL, True)
    _center(d, 143, 163, 'current instance', 12, TEAL)
    arrow(d, 212, 190, 310, 190)
    rect(d, 323, 140, 255, 107, white)
    txt(d, 337, 220, 'Merge partial request', 17, TEAL, True)
    _text_lines(d, 337, 195, ['Existing state + supplied fields',
                             'Determine actual target state.'], 13)
    arrow(d, 586, 190, 639, 190)
    d.add(Circle(741, 191, 59, fillColor=WARM, strokeColor=AMBER, strokeWidth=3))
    _center(d, 741, 210, 'TARGET B', 16, AMBER, True)
    _center(d, 741, 184, 'not permitted', 15, AMBER, True)
    _center(d, 741, 163, 'reject the change', 12, AMBER)
    note(d, 'Use the supported authorization and incoming-change checks for the scenario. A hidden or disabled UI field is not the backend security boundary.')
    return make('senior-proposed-state-authorization', 'Existing and proposed state authorization',
                'MODEL-02 MODEL-13 MODEL-16 SRAP-12',
                'Editing the current A instance and moving it into B are different authorization decisions. Partial input must be interpreted with existing state without treating omitted fields as explicit clears.',
                'Which state does each check inspect, and what happens if a determination changes the target scope?',
                'A policy example, not a universal company-code rule. Implement through the target RAP scenario\'s supported hooks; prechecks do not replace the complete authorization model.', d)


def _query():
    d = base('One authorized predicate must feed both data and count',
             'Request: user may see A; amount > 100; order by ID; skip 1; take 2')
    table(d, 35, 407, 323, ['ID', 'Org', 'Amount'],
          [['1', 'A', '80'], ['2', 'A', '120'], ['3', 'B', '200'],
           ['4', 'A', '150'], ['5', 'B', '300'], ['6', 'A', '180']],
          [.65, .8, 1.2], 35)
    txt(d, 35, 452, 'SOURCE: 6 rows', 17, TEAL, True)
    txt(d, 411, 452, 'LOGICAL RESULT CONTRACT', 17, TEAL, True)
    stages = [(402, 'Authorization + request filter', 'Keep IDs 2, 4, 6'),
              (325, 'Count the same filtered set', 'count = 3'),
              (248, 'Deterministic order, then page', 'skip 1, take 2 -> IDs 4, 6')]
    for y, title, body in stages:
        rect(d, 403, y - 34, 437, 66, PALE if y == 325 else white)
        txt(d, 418, y + 8, title, 16, TEAL, True)
        txt(d, 418, y - 15, body, 15)
    arrow(d, 622, 363, 622, 361)
    arrow(d, 622, 286, 622, 284)
    rect(d, 404, 112, 436, 84, INK)
    txt(d, 421, 166, 'RETURN 2 rows: ID 4 and ID 6', 18, white, True)
    txt(d, 421, 137, 'RETURN total count 3, not 2 and not 6', 16, white)
    _text_lines(d, 38, 136, ['Do not flatten an unsupported Boolean filter.',
                           'Translate it correctly or reject it.'], 13)
    note(d, 'Unauthorized rows must not leak through count or aggregation. Stable ordering needs a tie-breaker; concurrent changes require an explicit paging consistency contract.')
    return make('senior-query-secure-pipeline', 'Secure custom-query filtering, count, and page',
                'MODEL-03 MODEL-04 MODEL-05 OPS-07',
                'The same authorized logical set contains IDs 2, 4, and 6. Counting it returns three; skipping one and taking two returns IDs 4 and 6 without revealing hidden B rows.',
                'What should a count-only request return, and what should happen if the filter cannot be represented safely?',
                'The drawing specifies semantics, not a mandatory physical execution plan. A remote/custom provider must preserve equivalent authorization, filtering, count, and ordering behavior.', d)


def _doubles():
    d = base('Keep Submit real; double only its true dependencies',
             'CUT = code under test. A configured mock response cannot prove the behavior it replaces.')
    panel(d, 36, 276, 252, 176, 'TEST INPUT', '')
    _text_lines(d, 51, 383, ['Request R1: assignment present',
                           'Request R2: assignment missing',
                           '', 'Drive the real operation via EML.'], 13)
    rect(d, 339, 276, 234, 176, TEAL)
    txt(d, 358, 415, 'REAL CUT', 21, white, True)
    _text_lines(d, 358, 382, ['Submit behavior', 'Account-assignment rule',
                            'State transition', 'FAILED / REPORTED'], 15, white, 26)
    arrow(d, 295, 361, 331, 361, TEAL)
    panel(d, 622, 276, 223, 176, 'DOUBLED DEPENDENCY', '')
    _text_lines(d, 638, 382, ['External limit provider', 'Controlled return: 500 EUR',
                            'Or a defined failure', '', 'Do not double Submit.'], 13)
    arrow(d, 580, 361, 614, 361)
    table(d, 39, 220, 803, ['Case', 'Required assertions'],
          [['R1: valid', 'Expected state transition and correlated response'],
           ['R2: invalid', 'Rejected identity, useful message, no forbidden state'],
           ['Rule deliberately broken', 'The negative test must fail']],
          [1.3, 3.2], 34)
    note(d, 'Persistence using doubles is isolated evidence. Real database, service authorization, locking, and external integration still need targeted tests on the actual runtime.')
    return make('senior-real-cut-evidence', 'Real behavior under test and dependency doubles',
                'OPS-01 OPS-02 OPS-03 OPS-15 MODEL-14',
                'Two deliberately different inputs exercise the real Submit rule while a separate limit-provider dependency is controlled. Assertions inspect state and response identity, not only execution coverage.',
                'If the account-assignment rejection is removed, which test fails? What evidence remains missing after these tests pass?',
                'The fixture is conceptual and not an executed ABAP Unit result. Framework double support and persistence setup depend on the target release and test boundary.', d)


def _contracts():
    d = base('Release contract and Clean Core level answer different questions',
             'C0 / C1 / C2 describe permitted purpose. A / B / C / D classify extension exposure.')
    txt(d, 35, 452, 'WHAT USE IS RELEASED?', 18, TEAL, True)
    table(d, 35, 402, 387, ['Contract', 'Purpose'],
          [['C0', 'Extend'], ['C1', 'Use system-internally'],
           ['C2', 'Use as remote API']], [.8, 2.1], 45)
    txt(d, 464, 452, 'WHICH DEPENDENCIES / TECHNIQUES?', 17, TEAL, True)
    table(d, 464, 402, 381, ['Level', 'Assessment focus'],
          [['A', 'Released APIs / supported approach'],
           ['B', 'Classified classic APIs'],
           ['C', 'Internal objects'],
           ['D', 'Non-recommended use']], [.5, 2.5], 37)
    rect(d, 36, 110, 808, 105, white)
    txt(d, 53, 184, 'Worked check: a C1-released API is not a Level C API.', 18, TEAL, True)
    _text_lines(d, 53, 157, ['Confirm purpose, consumer visibility, language version, and the full dependency path.',
                            'A C1 local contract does not automatically release the same object for remote use.'], 14)
    note(d, 'ATC priorities belong to specific checks and configuration. Do not map every priority 1/2/3 finding universally to Clean Core D/C/B.')
    return make('senior-contracts-versus-levels', 'Release contracts versus Clean Core levels',
                'GOV-01 GOV-02 GOV-03 GOV-05 GOV-18 CLOUD-05',
                'The two tables are separate classification axes. C1 identifies a local-use contract, while Level C identifies internal-object exposure in the Clean Core assessment context.',
                'What else must you verify after finding a C1 release flag, and why does a wrapper not erase the underlying exposure?',
                'These are the three contracts requested for this comparison, not the complete release-contract catalogue. Exact object classification, extension technology, target edition, and ATC scope remain decisive.', d)


def _exception():
    d = base('An exception is a bounded decision, not a new API contract',
             'Illustrative governance record: EX-017 permits one reviewed internal read dependency')
    # A review record is shown as a filled form, rather than a generic flow box.
    rect(d, 35, 183, 406, 275, white)
    rect(d, 35, 413, 406, 45, INK)
    txt(d, 53, 430, 'EX-017 / reviewable exception record', 17, white, True)
    _text_lines(d, 54, 388, [
        'Scope: adapter ZCL_LEGACY_READ, one read path',
        'Reason: required field absent from released query',
        'Owner: application team + named risk approver',
        'Evidence: denied-user and result-total tests',
        'Review: next platform upgrade or API successor',
        'Exit: replace dependency; remove exemption',
        'Status: approved scope, not unrestricted access',
    ], 13, leading=27)
    steps = [(440, '1', 'ASSESS', 'Verify gap, scope, alternatives.'),
             (361, '2', 'DECIDE', 'Approve risk and required controls.'),
             (282, '3', 'RECHECK', 'Trigger: code, API, or release change.'),
             (203, '4', 'CLOSE OR RENEW', 'Show replacement or fresh evidence.')]
    for y, number, title, body in steps:
        d.add(Circle(504, y - 8, 19, fillColor=TEAL, strokeColor=None))
        _center(d, 504, y - 14, number, 16, white, True)
        txt(d, 539, y, title, 16, TEAL, True)
        txt(d, 539, y - 25, body, 13)
    for y in [406, 327, 248]:
        arrow(d, 504, y, 504, y - 18, TEAL)
    rect(d, 36, 105, 807, 53, WARM)
    txt(d, 52, 126, 'A new write call is outside EX-017. It needs a new decision, not silent inheritance.', 15, AMBER, True)
    note(d, 'An exemption can change finding handling; it cannot legalize unsupported ABAP Cloud syntax, release a SAP object, or prove transaction correctness.')
    return make('senior-exception-lifecycle', 'Exception governance and review lifecycle',
                'GOV-04 GOV-07 GOV-11 GOV-12 GOV-15 GOV-18',
                'A concrete exception record limits one dependency, states its evidence and owner, and defines review and exit triggers. A changed implementation must be assessed against that scope.',
                'Which change invalidates this decision, and what proves that an exception is resolved rather than merely hidden?',
                'EX-017 and the class name are fictional teaching identifiers. Actual approvals, gate behavior, and allowed development techniques follow the target environment and organization policy.', d)


def build_senior_visuals():
    """Return eight vector teaching examples with canonical question mappings."""
    return [_control(), _responses(), _uncertain(), _authorization(),
            _query(), _doubles(), _contracts(), _exception()]
