"""Original worked pattern comparisons for ABAP interview preparation."""

from reportlab.graphics.shapes import Circle, Line, String
from reportlab.lib.colors import HexColor
from visual_modern import (
    base, panel, table, note, make, txt, rect, arrow, lines,
    INK, TEAL, AMBER, PALE, white,
)


WARM = HexColor('#fff0e1')


def _rows(d, x, y, values, size=14, color=INK, leading=24):
    for index, value in enumerate(values):
        txt(d, x, y - index * leading, value, size, color)


def _center(d, x, y, text, size=14, color=INK, bold=False):
    d.add(String(x, y, text, fontName='Helvetica-Bold' if bold else 'Helvetica',
                 fontSize=size, fillColor=color, textAnchor='middle'))


def _strategy_template():
    d = base('One variation: replace a rule or specialize a step?',
             'Worked choice: approval policy varies by country; process ownership must stay stable')
    rect(d, 35, 190, 393, 267, white)
    rect(d, 452, 190, 393, 267, white)
    txt(d, 52, 429, 'STRATEGY / composition', 18, TEAL, True)
    txt(d, 470, 429, 'TEMPLATE METHOD / inheritance', 17, TEAL, True)
    rect(d, 55, 354, 349, 45, INK)
    txt(d, 69, 371, 'Approval coordinator -> rule interface', 15, white)
    arrow(d, 229, 349, 229, 321, TEAL)
    for x, name, limit in [(56, 'Country A rule', 'Limit: 500 EUR'),
                           (238, 'Country B rule', 'Limit: 900 EUR')]:
        rect(d, x, 249, 166, 69, PALE)
        txt(d, x + 10, 293, name, 14, TEAL, True)
        txt(d, x + 10, 269, limit, 13)
    txt(d, 56, 216, '700 EUR: A rejects; B accepts under this fixture.', 12)
    steps = [('1', 'Read inputs', INK), ('2', 'Calculate policy', TEAL),
             ('3', 'Return decision', INK)]
    for index, (number, label, color) in enumerate(steps):
        y = 371 - index * 57
        d.add(Circle(492, y, 15, fillColor=color, strokeColor=None))
        _center(d, 492, y - 5, number, 13, white, True)
        txt(d, 518, y - 5, label, 15, color, True)
        if index < 2:
            arrow(d, 492, y - 20, 492, y - 36)
    txt(d, 471, 216, 'Stable skeleton; subclass supplies the chosen step.', 12)
    table(d, 37, 140, 806, ['Assembly decision', 'Boundary to keep'],
          [['Factory selects policy', 'Validate country and policy version'],
           ['Constructor receives rule', 'Rule returns a decision; does not commit']], [1.3, 2.7], 29)
    note(d, 'The amounts are fictional policy fixtures. Choose a real variation point; a reusable calculation alone does not require an inheritance hierarchy.')
    return make('patterns-strategy-template', 'Strategy versus Template Method in approval rules',
                'PAT-01 PAT-10 PAT-12',
                'The same 700 EUR request receives different policy decisions through the same Strategy contract. Template Method instead fixes a call skeleton and exposes deliberate subclass steps.',
                'Which part varies, who selects it, and which object keeps transaction ownership?',
                'Conceptual pattern comparison, not executable ABAP or a universal approval rule. Framework-owned construction may require a supported delegation seam.', d)


def _factories():
    d = base('Construction must protect a real invariant',
             'Worked family: provider A serializer must be paired with provider A sender')
    table(d, 35, 410, 810, ['Approach', 'Construction decision', 'Use when'],
          [['Simple factory', 'Explicit supported choice', 'Small, stable implementation set'],
           ['Factory Method', 'Creator subclass supplies object', 'Creator extension is intentional'],
           ['Abstract Factory', 'Factory supplies related family', 'Products must remain compatible']],
          [1.1, 1.7, 1.9], 43)
    for x, label, fill in [(36, 'PROVIDER A FAMILY', PALE),
                            (460, 'PROVIDER B FAMILY', white)]:
        rect(d, x, 139, 383, 104, fill)
        txt(d, x + 15, 218, label, 16, TEAL, True)
        txt(d, x + 15, 187, 'Serializer', 15)
        arrow(d, x + 111, 190, x + 243, 190, TEAL)
        txt(d, x + 260, 187, 'Sender', 15)
        txt(d, x + 15, 160, 'Validate family; reject unsupported provider.', 12)
    d.add(Line(416, 195, 460, 195, strokeColor=AMBER, strokeWidth=2,
               strokeDashArray=[4, 3]))
    txt(d, 423, 177, 'X', 22, AMBER, True)
    txt(d, 38, 108, 'A factory is useful here because an A/B mixed pair is invalid.', 17, INK, True)
    note(d, 'A static method returning an object is not automatically Factory Method. Do not create a product-family abstraction when there is only one trivial product.')
    return make('patterns-factory-families', 'Three factory choices and a concrete family constraint',
                'PAT-02 PAT-11 PAT-12',
                'The family boundary prevents an A serializer from being combined accidentally with a B sender. The table distinguishes a simple choice from subclass creation and related-product creation.',
                'What invalid combination does this factory prevent, and when would a simple factory be enough?',
                'Provider compatibility is a fictional fixture. Pattern names do not grant API release eligibility, security or transaction guarantees.', d)


def _wrappers():
    d = base('Different wrappers solve different problems',
             'Worked posting boundary: translate data, simplify steps, observe execution')
    panel(d, 36, 283, 246, 172, 'ADAPTER', '')
    _rows(d, 51, 391, ['Domain input:', 'amount = 0, currency = EUR',
                       '', 'Legacy mapping:', 'value + change indicators'], 13)
    panel(d, 316, 283, 246, 172, 'FACADE', '')
    _rows(d, 331, 391, ['One business operation:', 'post purchase request',
                        '', 'Coordinates:', 'prepare -> check -> post'], 13)
    panel(d, 596, 283, 246, 172, 'DECORATOR', '')
    _rows(d, 611, 391, ['Same service interface:', 'timing around the call',
                        '', 'Preserves:', 'result + failure contract'], 13)
    rect(d, 36, 127, 806, 127, PALE)
    txt(d, 52, 224, 'Worked ordering: one logical call, two attempts', 17, TEAL, True)
    rect(d, 56, 151, 232, 47, white)
    rect(d, 328, 151, 229, 47, white)
    rect(d, 601, 151, 220, 47, white)
    txt(d, 70, 169, 'Outer log: 1 operation', 14)
    txt(d, 342, 169, 'Retry: 2 attempts', 14)
    txt(d, 615, 169, 'Eligible read client', 14)
    arrow(d, 294, 174, 320, 174)
    arrow(d, 563, 174, 593, 174)
    txt(d, 38, 103, 'Move logging inside Retry -> observe 2 attempts instead of 1 logical call.', 15)
    note(d, 'Retry is not safe for every write. These patterns cannot remove nested commits, authorize an operation, or release an internal SAP dependency.')
    return make('patterns-adapter-facade-decorator', 'Adapter, Facade and Decorator with observable outcomes',
                'PAT-03 PAT-04',
                'Mapping, orchestration and added behavior are different responsibilities. The lower example shows why wrapper order changes whether a log records one logical call or two attempts.',
                'Where would you translate an explicit clear, stop after a failed check, and record retry attempts?',
                'The retry example is deliberately an eligible read. Write retries need the actual idempotency and uncertainty contract; no pattern automatically supplies it.', d)


def _routing_command():
    d = base('Route once; execute with a replay contract',
             'Worked request: 700 EUR. The ordered rules choose the first applicable approver.')
    steps = [(35, 'Rule 1: team lead', '<= 500 EUR', 'Not applicable', white),
             (319, 'Rule 2: manager', '<= 1,000 EUR', 'Handled: manager', PALE),
             (603, 'Rule 3: fallback', 'Other supported cases', 'Not executed', white)]
    for x, title, rule, outcome, fill in steps:
        rect(d, x, 322, 242, 122, fill)
        txt(d, x + 13, 414, title, 15, TEAL, True)
        txt(d, x + 13, 385, rule, 14)
        txt(d, x + 13, 350, outcome, 14, INK, True)
    arrow(d, 284, 381, 311, 381)
    d.add(Line(569, 381, 596, 381, strokeColor=AMBER, strokeWidth=2,
               strokeDashArray=[4, 3]))
    txt(d, 35, 292, 'A handler failure is not the same as "not applicable".', 16, AMBER, True)
    table(d, 36, 236, 807, ['Command identity', 'Delivery', 'Effective result'],
          [['SUBMIT-42', 'First execution', 'One state transition recorded'],
           ['SUBMIT-42', 'Retry after lost response', 'Defined replay result; no second transition']],
          [1.1, 1.65, 2.0], 41)
    txt(d, 37, 106, 'Command packages the operation. Durable identity makes safe replay possible.', 16)
    note(d, 'First-match routing differs from execute-all validation. The Command pattern alone supplies neither persistent queuing nor idempotency nor an undo operation.')
    return make('patterns-chain-command', 'First-match routing and idempotent command execution',
                'PAT-05 PAT-07',
                'The 700 EUR fixture passes the team-lead rule and stops at the manager rule. The selected operation then needs its own durable identity to handle duplicate delivery safely.',
                'What changes if all rules must run, and what must a repeated SUBMIT-42 return?',
                'Routing thresholds and command identity are fictional. The actual business transition, persistence and compensation contracts must be designed separately.', d)


def _events_lifetime():
    d = base('An event callback is not a durable delivery record',
             'Two notification paths, then a separate lifetime problem hidden in a singleton')
    rect(d, 35, 310, 810, 142, white)
    txt(d, 51, 422, 'IN-PROCESS OBSERVER', 16, TEAL, True)
    for x, label in [(52, 'Publisher raises event'), (329, 'Registered handler'),
                     (613, 'ALV refresh')]:
        rect(d, x, 348, 216, 43, PALE)
        txt(d, x + 10, 365, label, 13)
    arrow(d, 275, 370, 321, 370)
    arrow(d, 552, 370, 605, 370)
    rect(d, 35, 156, 810, 140, white)
    txt(d, 51, 267, 'DURABLE BUSINESS INTEGRATION', 16, TEAL, True)
    for x, label in [(52, 'Committed transition'), (329, 'Publication / delivery'),
                     (613, 'Idempotent consumer')]:
        rect(d, x, 193, 216, 43, PALE)
        txt(d, x + 10, 210, label, 13)
    arrow(d, 275, 215, 321, 215)
    arrow(d, 552, 215, 605, 215)
    txt(d, 52, 169, 'Failure recovery needs persisted correlation and a delivery owner.', 13)
    txt(d, 38, 123, 'Singleton trap: test A caches approver A; test B reuses A unexpectedly.', 15, AMBER, True)
    txt(d, 38, 101, 'Pass request context explicitly; a session singleton is not landscape-wide state.', 14)
    note(d, 'A local event does not gain durability from its name. A durable consumer must tolerate duplicate or stale events according to the actual delivery contract.')
    return make('patterns-observer-lifetime', 'Observer delivery and hidden singleton state',
                'PAT-06 PAT-09',
                'A registered local handler can update an ALV, while an external process needs transactional publication and durable processing evidence. Session-shared mutable state is a separate source of repeated-test failures.',
                'Which facts survive a process restart, and which request-specific values must not be cached implicitly?',
                'The lower path describes required responsibilities, not an automatic feature of ABAP Objects events. Verify the chosen event infrastructure and service lifetime.', d)


def _repository_scope():
    d = base('A useful seam must preserve the right state',
             'Worked RAP fixture: Order 4711 changes from 100 EUR to 120 EUR before save')
    table(d, 36, 405, 384, ['Persistence read', 'Amount'],
          [['Order 4711', '100 EUR']], [1.5, 1], 45)
    table(d, 460, 405, 384, ['Transactional BO read', 'Amount'],
          [['Order 4711', '120 EUR']], [1.7, 1], 45)
    arrow(d, 429, 381, 452, 381, TEAL)
    rect(d, 37, 215, 806, 114, PALE)
    txt(d, 53, 299, 'Repository contract: which view does this caller require?', 18, TEAL, True)
    _rows(d, 53, 270, ['Inside a rule after update: the current transactional view may be required.',
                      'Persisted reporting read: a different explicit contract may be appropriate.',
                      'A double returning 120 does not prove the real adapter reads the buffer.'], 14)
    table(d, 37, 164, 807, ['Design force', 'Smallest useful response'],
          [['External dependency blocks a test', 'Introduce a meaningful seam'],
           ['One pure, stable calculation', 'A focused method may be sufficient']],
          [1.4, 1.6], 29)
    note(d, 'Do not bypass managed RAP with repository table writes. Pattern count is not a quality metric; verify unsaved reads, rollback and production wiring.')
    return make('patterns-repository-contract', 'Repository read semantics and proportional abstraction',
                'PAT-08 PAT-10 PAT-11',
                'A direct persistence read returns 100 while the transaction already sees 120. The repository seam is valuable only if its real implementation honors the state contract required by the caller.',
                'Which integration test catches a mockable repository that reads the wrong state, and when is no new abstraction needed?',
                'Conceptual read semantics rather than an SQL isolation guarantee. The specific BO, EML operation, authorization and target release remain authoritative.', d)


def build_pattern_visuals():
    """Return six vector teaching plates covering all twelve PAT questions."""
    return [_strategy_template(), _factories(), _wrappers(),
            _routing_command(), _events_lifetime(), _repository_scope()]
