"""Concrete RAP save phases and implementation ownership for RAP-05."""
from reportlab.graphics.shapes import Drawing, Line
from visual_modern import rect, txt, lines, arrow, make, INK, TEAL, AMBER, PALE, BG, MUTED, white


def build_save_sequence_visuals():
    d = Drawing(880, 740)
    rect(d, 0, 0, 880, 740, BG)
    txt(d, 28, 704, 'RAP save sequence: one order, step by step', 23, bold=True)
    txt(d, 28, 680, 'Prepare and check first. Then assign the final number and write.', 14, MUTED)
    steps = [
        (582, '1  FINALIZE', 'Calculate the order total.', 'Last phase for allowed buffer changes.'),
        (482, '2  CHECK_BEFORE_SAVE', 'Check that the delivery date is valid.', 'All involved BOs must pass the checks.'),
        (336, '3  ADJUST_NUMBERS  (late numbering)', 'Assign final document number 4711.', 'Skip this assignment when using early numbering.'),
        (236, '4  SAVE  (persistence phase)', 'Write the order and its items.', 'The implementation depends on the save option.'),
        (86, '5  CLEANUP', 'Clear transaction-local working data.', 'The next LUW must not inherit old buffer entries.'),
    ]
    for y, title, first, second in steps:
        rect(d, 28, y, 530, 80, white)
        txt(d, 42, y + 57, title, 16, TEAL, True)
        txt(d, 42, y + 34, first, 14)
        txt(d, 42, y + 13, second, 12, MUTED)
    arrow(d, 290, 579, 290, 565)
    arrow(d, 290, 479, 290, 419)
    arrow(d, 290, 333, 290, 319)
    arrow(d, 290, 233, 290, 169)
    rect(d, 30, 434, 526, 35, PALE)
    txt(d, 43, 446, 'POINT OF NO RETURN: after all checks pass', 14, TEAL, True)
    rect(d, 30, 187, 526, 35, PALE)
    txt(d, 43, 199, 'Transaction owner completes the database commit', 13, TEAL, True)
    rect(d, 606, 460, 246, 196, white)
    txt(d, 620, 630, 'Early failure path', 17, AMBER, True)
    lines(d, 620, 601, 'FINALIZE or CHECK_BEFORE_SAVE fails in any involved BO.', 29, 13)
    txt(d, 620, 539, 'CLEANUP_FINALIZE', 16, AMBER, True)
    lines(d, 620, 513, 'Run early-failure cleanup; do not continue to late saving.', 28, 13)
    arrow(d, 560, 623, 602, 623, AMBER)
    arrow(d, 560, 524, 602, 524, AMBER)
    rect(d, 606, 238, 246, 186, white)
    txt(d, 620, 397, 'Late save', 17, TEAL, True)
    lines(d, 620, 371, 'Ordinary business checks must already have passed. A technical failure is not impossible.', 29, 13)
    lines(d, 620, 287, 'Special BAPI failure handling needs the documented saver and release support.', 29, 12, MUTED)
    txt(d, 28, 48, 'Remember: calculate -> check -> number -> write -> clear.', 17, INK, True)
    txt(d, 28, 24, 'Runtime phases, not five methods you must implement in every BO. No commit inside a handler or saver.', 12, MUTED)
    sequence = make(
        'rap-save-sequence', 'RAP save sequence and early failure path', 'RAP-05 SRAP-03',
        'Follow one order from total calculation to buffer cleanup. The orange branch stops a rejected save before late numbering and persistence.',
        'Where is the last buffer-change phase, and when is the point of no return reached?',
        'Simplified phase flow, not a trace of every runtime call. Managed and unmanaged implementation hooks differ; special late-failure support is scenario- and release-dependent.', d)

    d = Drawing(880, 510)
    rect(d, 0, 0, 880, 510, BG)
    txt(d, 28, 473, 'SAVE is a phase; the implementation varies', 25, bold=True)
    txt(d, 28, 445, 'Do not confuse a fully unmanaged BO with managed interaction + unmanaged save.', 13, MUTED)
    rows = [
        ('Managed save', 'RAP writes the BO data.', 'No custom persistence method is needed.'),
        ('Managed + additional save', 'RAP writes the BO; your code adds work.', 'with additional save -> save_modified'),
        ('Managed + unmanaged save', 'RAP owns interaction; your code writes the data.', 'with unmanaged save -> save_modified'),
        ('Fully unmanaged BO', 'Your code owns the buffer and persistence.', 'Implement save in the local saver class.'),
    ]
    for i, (title, owner, hook) in enumerate(rows):
        y = 336 - i * 83
        rect(d, 28, y, 824, 72, white)
        txt(d, 44, y + 48, title, 17, TEAL, True)
        txt(d, 44, y + 25, owner, 14)
        txt(d, 44, y + 7, hook, 12, MUTED)
    txt(d, 28, 54, 'Example: add an audit row with additional save; do not replace managed order persistence.', 14, INK, True)
    txt(d, 28, 28, 'No independent commit. Match the generated saver signature and features to the target release.', 13, MUTED)
    ownership = make(
        'rap-save-methods', 'Save options: who writes the data and which method runs?', 'RAP-05 SRAP-02',
        'Compare four persistence choices. Both save extensions of managed BOs use save_modified; a fully unmanaged BO uses save.',
        'Why is with unmanaged save not the same implementation as a fully unmanaged BO?',
        'Conceptual ownership comparison. The complete BDEF, change-image options and saver signatures depend on the scenario and release.', d)
    return [sequence, ownership]
