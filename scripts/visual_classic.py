"""Original vector teaching plates for classic ABAP interview preparation.

Illustrations are conceptual teaching examples, not measured SAP traces.
No build or rendering work is performed at import time.
"""

from reportlab.graphics.shapes import (
    Circle, Drawing, Ellipse, Line, Polygon, PolyLine, Rect, String,
)
from reportlab.lib.colors import HexColor, white


NAVY = HexColor("#122b3e")
TEAL = HexColor("#126554")
ORANGE = HexColor("#bf531f")
BG = HexColor("#f4f7f5")
PALE = HexColor("#e1eee8")
WARM = HexColor("#f8e5d7")
MUTED = HexColor("#526776")
LINE = HexColor("#bccdc5")


def _text(d, x, y, text, size=14, color=NAVY, bold=False, anchor="start"):
    d.add(String(x, y, text, fontName="Helvetica-Bold" if bold else "Helvetica",
                 fontSize=size, fillColor=color, textAnchor=anchor))


def _lines(d, x, y, lines, size=14, color=NAVY, leading=21, bold=False):
    for index, line in enumerate(lines):
        _text(d, x, y - index * leading, line, size, color, bold)


def _rect(d, x, y, w, h, fill=white, stroke=LINE, radius=10, width=1):
    d.add(Rect(x, y, w, h, rx=radius, ry=radius,
               fillColor=fill, strokeColor=stroke, strokeWidth=width))


def _line(d, x1, y1, x2, y2, color=LINE, width=2):
    d.add(Line(x1, y1, x2, y2, strokeColor=color, strokeWidth=width))


def _arrow(d, x1, y1, x2, y2, color=TEAL, width=2):
    import math
    _line(d, x1, y1, x2, y2, color, width)
    angle = math.atan2(y2 - y1, x2 - x1)
    points = [x2, y2,
              x2 - 9 * math.cos(angle - .45), y2 - 9 * math.sin(angle - .45),
              x2 - 9 * math.cos(angle + .45), y2 - 9 * math.sin(angle + .45)]
    d.add(Polygon(points, fillColor=color, strokeColor=color))


def _base(title, subtitle):
    d = Drawing(880, 560)
    _rect(d, 1, 1, 878, 558, BG, BG, 0)
    _rect(d, 26, 512, 7, 24, TEAL, TEAL, 2)
    _text(d, 46, 514, title, 26, bold=True)
    _text(d, 28, 483, subtitle, 14, MUTED)
    return d


def _footer(d, text):
    _line(d, 28, 51, 850, 51)
    _text(d, 28, 27, text, 13, MUTED)


def _table(d, x, top, widths, headers, rows, highlights=(), row_height=29):
    width = sum(widths)
    _rect(d, x, top - row_height, width, row_height, NAVY, NAVY, 0)
    offset = 0
    for label, cell_width in zip(headers, widths):
        _text(d, x + offset + 10, top - 20, label, 13, white, True)
        offset += cell_width
    for index, row in enumerate(rows):
        bottom = top - (index + 2) * row_height
        fill = WARM if index in highlights else (white if index % 2 == 0 else PALE)
        _rect(d, x, bottom, width, row_height, fill, LINE, 0, .6)
        offset = 0
        for value, cell_width in zip(row, widths):
            _text(d, x + offset + 10, bottom + 9, str(value), 13,
                  ORANGE if index in highlights else NAVY,
                  index in highlights)
            offset += cell_width


def _plate(plate_id, title, questions, caption, recall, limit, drawing):
    return dict(id=plate_id, title=title, questions=questions, caption=caption,
                recall=recall, limit=limit, drawing=drawing)


def _internal_tables():
    d = _base("Find key 50: three internal-table access paths",
              "The same seven records; choose the table and key for the actual access pattern.")
    for x, title, tag in [(28, "STANDARD", "Linear free-key example"),
                          (310, "SORTED", "Ordered key lookup"),
                          (592, "HASHED", "Complete unique key")]:
        _rect(d, x, 111, 260, 348)
        _text(d, x + 17, 432, title, 19, TEAL, True)
        _text(d, x + 17, 409, tag, 13, MUTED)
    linear = [(str(i + 1), str(key), "match" if key == 50 else "")
              for i, key in enumerate([30, 70, 10, 20, 50, 40, 60])]
    _table(d, 46, 392, [48, 67, 106], ["Row", "Key", "Check"], linear, [4])
    for i in range(4):
        _text(d, 182, 343 - i * 29, str(i + 1), 13, MUTED)
    _text(d, 46, 135, "Inspect rows until the match.", 13)
    sorted_rows = [(str(i + 1), str(key), {4: "1st", 6: "2nd", 5: "3rd"}.get(i + 1, ""))
                   for i, key in enumerate([10, 20, 30, 40, 50, 60, 70])]
    _table(d, 328, 392, [48, 67, 106], ["Row", "Key", "Probe"], sorted_rows, [4])
    _text(d, 328, 135, "Illustrative probes: 40, 60, 50.", 13)
    _rect(d, 619, 352, 82, 38, WARM, ORANGE, 5)
    _text(d, 660, 365, "key 50", 15, ORANGE, True, "middle")
    _arrow(d, 701, 371, 737, 371)
    d.add(Circle(774, 371, 30, fillColor=PALE, strokeColor=TEAL, strokeWidth=2))
    _text(d, 774, 366, "hash", 14, TEAL, True, "middle")
    d.add(PolyLine([774, 339, 774, 316, 652, 316, 652, 287],
                   strokeColor=TEAL, strokeWidth=2))
    _arrow(d, 652, 294, 652, 281)
    _table(d, 610, 280, [78, 143], ["Bucket", "Record key"],
           [("...", "..."), ("h(50)", "50  [match]"), ("...", "...")], [1], 32)
    _lines(d, 610, 138, ["Bucket route is conceptual.", "No primary index access."], 13, leading=19)
    _text(d, 28, 80, "Also consider secondary keys, inserts, memory, and range access.", 16, bold=True)
    _footer(d, "Not a timing benchmark: sorted probes and hash buckets illustrate the lookup idea.")
    return _plate("classic-internal-table-lookup", "Internal table lookup", ["ABAP-01", "ABAP-02", "ABAP-03"],
                  "A free-key linear search, an ordered lookup, and a complete hashed-key lookup find the same record through different access paths.",
                  "What changes if I need all rows in a key range, or preserve input order?",
                  "A standard table can use secondary keys; a hash lookup requires a suitable complete key. Hash storage and probe order are schematic, not SAP implementation guarantees.", d)


def _ddic():
    d = _base("DDIC: technical shape, business meaning, stored value",
              "One domain can support different data elements; a table column chooses its business meaning.")
    _rect(d, 28, 251, 244, 206, PALE, TEAL)
    _text(d, 47, 425, "DOMAIN", 19, TEAL, True)
    _text(d, 47, 397, "ZDOC_ID", 18, bold=True)
    _text(d, 47, 371, "Technical shape: CHAR(10)", 14)
    # Ten ruler slots make the domain's length a visible physical constraint.
    for i, char in enumerate("0000001234"):
        x = 47 + 20 * i
        _rect(d, x, 320, 20, 32, white, TEAL, 0)
        _text(d, x + 10, 330, char, 12, TEAL, False, "middle")
    _text(d, 47, 284, "10 character positions", 14, TEAL)
    # Two label tags share a shape but attach different semantics.
    for y, name, label in [(355, "ZSALES_ORDER_ID", "Label: Sales order"),
                            (249, "ZDELIVERY_ID", "Label: Delivery")]:
        points = [341, y, 555, y, 575, y + 39, 555, y + 78, 341, y + 78]
        d.add(Polygon(points, fillColor=white, strokeColor=TEAL, strokeWidth=1.5))
        d.add(Circle(555, y + 39, 5, fillColor=PALE, strokeColor=TEAL))
        _text(d, 356, y + 50, name, 15, bold=True)
        _text(d, 356, y + 26, label, 14, TEAL)
    _text(d, 341, 451, "DATA ELEMENTS", 16, TEAL, True)
    _arrow(d, 274, 382, 331, 394)
    _arrow(d, 274, 329, 331, 288)
    _text(d, 623, 451, "TABLE COLUMNS", 16, TEAL, True)
    _table(d, 621, 425, [108, 120], ["ORDER_ID", "DELIVERY_ID"],
           [("0000001234", "0080000456"), ("0000001235", "0080000457"),
            ("0000001236", "0080000458")], row_height=35)
    _arrow(d, 580, 394, 612, 393)
    d.add(PolyLine([576, 288, 608, 288, 608, 270, 790, 270],
                   strokeColor=TEAL, strokeWidth=2))
    _arrow(d, 790, 270, 790, 282)
    _rect(d, 28, 90, 821, 119, white, LINE)
    _text(d, 47, 179, "Keep the concepts separate", 18, bold=True)
    _lines(d, 47, 150, ["Domain: technical properties.  Data element: semantic type, labels, documentation.",
                         "Table field: a component of a persistent table.  Structure: no persistence by itself.",
                         "A value table proposal alone does not create a complete foreign-key check."], 14)
    _footer(d, "Illustrative custom names and values; this is not a proposed production data model.")
    return _plate("classic-ddic-layers", "DDIC technical and semantic layers", ["ABAP-05", "ABAP-06"],
                  "A ten-character domain acts like a technical mold; data elements give two fields different business meanings, and table columns hold values.",
                  "Which layer supplies field labels, and which object actually persists records?",
                  "The picture simplifies DDIC typing and does not imply that domain values or a value table enforce every database write.", d)


def _luw():
    d = _base("One business change can span several database LUWs",
              "Classic dialog example: intermediate reads, user interaction, then a coordinated final save.")
    _rect(d, 78, 390, 727, 53, TEAL, TEAL, 10)
    _text(d, 442, 410, "SAP LUW: edit one business document", 20, white, True, "middle")
    for x, width, title, subtitle in [(78, 171, "DB LUW 1", "Read current state"),
                                      (358, 183, "DB LUW 2", "Read / validate"),
                                      (650, 155, "DB LUW 3", "Final writes")]:
        _rect(d, x, 258, width, 88, white, TEAL, 7)
        _text(d, x + width / 2, 316, title, 18, TEAL, True, "middle")
        _text(d, x + width / 2, 288, subtitle, 14, anchor="middle")
        _line(d, x + width, 247, x + width, 356, ORANGE, 3)
        _text(d, x + width, 232, "DB commit", 12, ORANGE, False, "middle")
    for cx in [303, 595]:
        d.add(Circle(cx, 307, 22, fillColor=BG, strokeColor=MUTED, strokeWidth=2))
        _line(d, cx, 307, cx, 321, MUTED)
        _line(d, cx, 307, cx + 10, 301, MUTED)
        _text(d, cx, 267, "User input", 12, MUTED, False, "middle")
    _arrow(d, 78, 210, 807, 210, MUTED)
    _text(d, 80, 189, "Time", 12, MUTED)
    # A padlock plus a long bracket depicts cooperative business ownership.
    _rect(d, 83, 141, 23, 22, WARM, ORANGE, 3)
    d.add(PolyLine([88, 163, 88, 174, 101, 174, 101, 163],
                   strokeColor=ORANGE, strokeWidth=3))
    _line(d, 122, 153, 803, 153, ORANGE, 3)
    _line(d, 122, 146, 122, 160, ORANGE, 3)
    _line(d, 803, 146, 803, 160, ORANGE, 3)
    _text(d, 442, 127, "Logical enqueue ownership follows the business transaction protocol", 15,
          ORANGE, True, "middle")
    _text(d, 442, 89, "Do not commit partial business updates just because a dialog step ends.", 16,
          NAVY, True, "middle")
    _footer(d, "Simplified classic pattern. Update-task ownership and RAP's framework-controlled save need separate rules.")
    return _plate("classic-sap-database-luw", "SAP LUW and database LUW", ["ABAP-07", "ABAP-08", "ABAP-09"],
                  "Several database transactions can serve a single classic SAP business transaction. The illustrated early database transactions only read; coordinated persistence happens at the end.",
                  "Who owns the commit, and why does a database lock not protect a long user interaction?",
                  "The final save may use update processing in another context. Lock scope and transfer rules vary; the line is conceptual ownership, not a universal enqueue lifetime. Do not apply classic COMMIT WORK patterns inside RAP handlers.", d)


def _plug(d, x, y, color, label):
    # Cable enters the plug from the right, while two pins face the socket.
    _rect(d, x, y, 57, 42, color, color, 8)
    _rect(d, x - 18, y + 9, 19, 7, color, color, 1)
    _rect(d, x - 18, y + 27, 19, 7, color, color, 1)
    _line(d, x + 57, y + 21, x + 84, y + 21, color, 6)
    _text(d, x + 6, y + 16, label, 12, white, True)


def _oo():
    d = _base("One contract; production and test can plug in",
              "Constructor injection supplies a collaborator. Polymorphism selects its implementation at runtime.")
    # Stylized service machine with one dependency socket.
    _rect(d, 40, 215, 266, 215, NAVY, NAVY, 20)
    _rect(d, 61, 315, 224, 87, BG, BG, 8)
    _text(d, 173, 374, "Approval service", 19, NAVY, True, "middle")
    _text(d, 173, 347, "uses a repository", 15, NAVY, False, "middle")
    for i in range(3):
        _line(d, 63, 275 - i * 12, 145, 275 - i * 12, PALE, 4)
    d.add(Circle(261, 259, 13, fillColor=PALE, strokeColor=PALE))
    _text(d, 174, 183, "Business rules", 16, bold=True, anchor="middle")
    _rect(d, 306, 280, 118, 75, PALE, TEAL, 8)
    _rect(d, 401, 296, 8, 13, NAVY, NAVY, 1)
    _rect(d, 401, 326, 8, 13, NAVY, NAVY, 1)
    _text(d, 365, 370, "INTERFACE", 14, TEAL, True, "middle")
    _text(d, 365, 317, "read( )", 16, TEAL, True, "middle")
    _text(d, 364, 257, "Same contract", 14, TEAL, True, "middle")
    # Only one dependency is selected for each service instance.
    d.add(PolyLine([427, 318, 468, 318, 468, 396, 522, 396],
                   strokeColor=TEAL, strokeWidth=3))
    d.add(PolyLine([468, 318, 468, 218, 522, 218],
                   strokeColor=ORANGE, strokeWidth=3))
    _text(d, 468, 286, "OR", 14, MUTED, True, "middle")
    _plug(d, 540, 375, TEAL, "DB")
    _plug(d, 540, 197, ORANGE, "TEST")
    # A database cylinder and a fixture tray show tangible different back ends.
    _rect(d, 650, 339, 145, 76, PALE, TEAL, 0)
    d.add(Ellipse(722.5, 415, 72.5, 17, fillColor=PALE, strokeColor=TEAL, strokeWidth=2))
    d.add(Ellipse(722.5, 339, 72.5, 17, fillColor=PALE, strokeColor=TEAL, strokeWidth=2))
    _text(d, 722, 375, "Database", 18, TEAL, True, "middle")
    _text(d, 722, 303, "Production adapter", 16, TEAL, True, "middle")
    _rect(d, 650, 171, 145, 89, WARM, ORANGE, 5)
    for i in range(3):
        _rect(d, 666, 229 - i * 21, 112, 14, white, ORANGE, 2)
    _text(d, 722, 146, "Controlled test double", 15, ORANGE, True, "middle")
    _text(d, 40, 91, "A test checks service behavior; a real integration check still verifies database behavior.", 15, bold=True)
    _footer(d, "Inject one suitable implementation per instance. An adapter does not make an unreleased API released.")
    return _plate("classic-oo-plug-contract", "OO interfaces and dependency injection", ["OO-01", "OO-02", "OO-07", "OO-10", "OO-14"],
                  "The service depends on a repository contract. Production and test implementations fit the same socket; the composition boundary supplies the appropriate collaborator.",
                  "Which object chooses the implementation, and what does a double-based test fail to prove?",
                  "The plug is a design metaphor, not a SAP connector or code signature. Injection does not itself guarantee a good abstraction or production integration.", d)


def _joins():
    d = _base("A join repeats the header once for every matching item",
              "Example: sum the order totals before and after a one-to-many join. All amounts are EUR.")
    _text(d, 28, 448, "ORDERS: 2 rows", 18, TEAL, True)
    _table(d, 28, 432, [110, 156, 108], ["Order", "Header total", "Currency"],
           [(10, 100, "EUR"), (20, 80, "EUR")], row_height=30)
    _text(d, 486, 448, "ITEMS: 3 rows", 18, TEAL, True)
    _table(d, 486, 432, [117, 118, 113], ["Order", "Item", "Product"],
           [(10, 1, "A"), (10, 2, "B"), (20, 1, "C")], row_height=30)
    _text(d, 28, 316, "JOIN ON order ID", 15, MUTED, True)
    _arrow(d, 211, 310, 211, 282)
    _text(d, 28, 280, "RESULT: 3 rows", 18, TEAL, True)
    _table(d, 28, 263, [110, 110, 156, 108], ["Order", "Item", "Header total", "Currency"],
           [(10, 1, 100, "EUR"), (10, 2, 100, "EUR"), (20, 1, 80, "EUR")], [0, 1], 31)
    # The duplicate is visible as two orange coins with the same label.
    for cx, value in [(584, "100"), (654, "100"), (724, "80")]:
        d.add(Circle(cx, 220, 28, fillColor=WARM if value == "100" else PALE,
                     strokeColor=ORANGE if value == "100" else TEAL, strokeWidth=2))
        _text(d, cx, 215, value, 16, ORANGE if value == "100" else TEAL, True, "middle")
    _text(d, 655, 169, "Joined sum = 280", 20, ORANGE, True, "middle")
    _text(d, 655, 141, "Actual order total = 180", 16, TEAL, True, "middle")
    _rect(d, 28, 64, 806, 56, white, LINE, 6)
    _text(d, 42, 99, "Fix the grain: aggregate at the intended business level before combining results.", 14, bold=True)
    _text(d, 42, 78, "SUM(DISTINCT amount) is not a general fix: different orders can have equal totals.", 13, ORANGE)
    _footer(d, "Outer join caveat: a WHERE predicate on the missing right side can remove unmatched left rows.")
    return _plate("classic-sql-join-grain", "SQL join multiplication", ["SQL-04", "SQL-06", "SQL-07"],
                  "Joining two order headers to three items repeats order 10's total, inflating a naive sum from EUR 180 to EUR 280. For outer joins, matching conditions in ON can preserve unmatched left rows, while right-side conditions in WHERE can remove them.",
                  "What is one row of this result supposed to represent? Where should a language filter go for optional text?",
                  "This is an inner-join example. WHERE and ON placement must follow intended semantics; neither DISTINCT nor SUM(DISTINCT amount) repairs every incorrect join or aggregation.", d)


def _stopwatch(d, cx, cy, color):
    d.add(Circle(cx, cy, 32, fillColor=white, strokeColor=color, strokeWidth=3))
    _rect(d, cx - 9, cy + 37, 18, 8, color, color, 2)
    _line(d, cx, cy + 32, cx, cy + 38, color, 3)
    _line(d, cx, cy, cx, cy + 22, color, 3)
    _line(d, cx, cy, cx + 16, cy - 9, color, 3)


def _performance():
    d = _base("Diagnose the cost before choosing the optimization",
              "Collect evidence at the expensive boundary; the instruments below show no measured speed claims.")
    xs = [28, 239, 450, 661]
    titles = ["DATABASE", "ABAP CPU", "ROWS / MEMORY", "ROUND TRIPS"]
    for x, title in zip(xs, titles):
        _rect(d, x, 178, 190, 274, white, LINE, 12)
        _text(d, x + 95, 427, title, 15, TEAL, True, "middle")
    # SQL cylinder with magnifying lens.
    _rect(d, 65, 335, 88, 57, PALE, TEAL, 0)
    d.add(Ellipse(109, 392, 44, 12, fillColor=PALE, strokeColor=TEAL, strokeWidth=2))
    d.add(Ellipse(109, 335, 44, 12, fillColor=PALE, strokeColor=TEAL, strokeWidth=2))
    d.add(Circle(147, 350, 23, fillColor=white, strokeColor=ORANGE, strokeWidth=3))
    _line(d, 163, 333, 177, 319, ORANGE, 5)
    _text(d, 147, 346, "SQL", 12, ORANGE, True, "middle")
    _lines(d, 43, 293, ["Trace + execution plan", "Calls, rows, total cost", "ST05 / SQL Monitor", "Inspect filters / joins"], 13, leading=25)
    # A chip plus stopwatch depicts computation rather than SQL speed.
    _rect(d, 262, 342, 47, 48, PALE, TEAL, 4)
    for y in [349, 361, 373, 385]:
        _line(d, 255, y, 262, y, TEAL)
        _line(d, 309, y, 316, y, TEAL)
    _text(d, 285, 361, "CPU", 12, TEAL, True, "middle")
    _stopwatch(d, 364, 362, ORANGE)
    _lines(d, 254, 293, ["Runtime + call tree", "SAT / supported profiler", "Loops, copies, calls", "Find repeated work"], 13, leading=25)
    # A stack of rows visually emphasizes volume and projection.
    for i in range(5):
        _rect(d, 475 + i * 5, 331 + i * 12, 123, 28, PALE if i < 4 else WARM,
              TEAL if i < 4 else ORANGE, 3)
    _lines(d, 465, 293, ["Inspect result volume", "Needed rows / columns?", "Bounded payload?", "Check memory growth"], 13, leading=25)
    # Small endpoints and repeated packets illustrate chatty access.
    _rect(d, 678, 341, 38, 54, PALE, TEAL, 4)
    _rect(d, 810, 341, 25, 54, PALE, TEAL, 4)
    for y in [349, 367, 385]:
        _arrow(d, 720, y, 803, y, ORANGE, 1.4)
    _text(d, 697, 320, "Caller", 12, MUTED, False, "middle")
    _text(d, 817, 320, "Target", 12, MUTED, False, "middle")
    _lines(d, 676, 293, ["Trace request count", "Latency and payload", "Repeated small calls?", "Check safe batching"], 13, leading=25)
    _rect(d, 28, 75, 823, 74, TEAL, TEAL, 8)
    _text(d, 440, 119, "Baseline  >  Locate the cost  >  Change one cause  >  Re-measure", 18,
          white, True, "middle")
    _text(d, 440, 92, "Use representative data and verify identical business results after the change.", 14,
          white, False, "middle")
    _footer(d, "Tools depend on edition and permissions. HANA, a join, or a new index is not a universal speed guarantee.")
    return _plate("classic-performance-instruments", "Performance diagnosis", ["SQL-09", "SQL-10", "SQL-11", "SQL-12"],
                  "Inspect database work, ABAP computation, transferred volume, and repeated calls as different possible causes. Choose the trace and change based on evidence.",
                  "Is the largest cost one slow statement, many cheap statements, ABAP processing, or transfer volume?",
                  "No percentages or speedups are measured here. These cost categories can overlap; do not sum overlapping trace durations. Available tools differ between classic and cloud editions.", d)


def build_classic_visuals():
    """Return six independent 880 by 560 vector drawings with study metadata."""
    return [_internal_tables(), _ddic(), _luw(), _oo(), _joins(), _performance()]
