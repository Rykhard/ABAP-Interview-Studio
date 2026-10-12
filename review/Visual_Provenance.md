# Visual provenance and reuse

Reviewed 12 October 2026. All 70 teaching visuals were created for this preparation pack. No external screenshots, stock artwork or SAP documentation figures were copied.

- 68 vector diagrams and worked examples: authored in Python with ReportLab; source files are `scripts/build.py`, `scripts/visual_classic.py` `scripts/visual_modern.py` `scripts/visual_integration.py` `scripts/visual_senior.py`, `scripts/visual_rap_recall.py`, `scripts/visual_foundations_deep.py`, `scripts/visual_patterns.py` `scripts/visual_delivery_hana.py` and `scripts/visual_save_sequence.py`. Supplied as SVG and PNG.
- 2 raster illustrations: created with the built-in image_gen tool, inspected for the required story and labels, and copied into this repository. They illustrate analogies, not literal SAP architecture. Supplied as PNG.
- Technical source references are attached to the relevant question modules and visual atlas pages. These original visuals summarize teaching concepts; they are not official SAP diagrams.
- The catalog maps every visual to existing question IDs. An image may support several questions; that does not replace the full answer.

## Draft storage illustration

File: [draft-storage-illustration.png](../visuals/draft-storage-illustration.png).

Final generation prompt:

```text
Use case: scientific-educational.
Asset type: original illustrated teaching plate for an English ABAP interview study pack.
Create a refined editorial cutaway illustration that makes three DIFFERENT storage lifetimes memorable, landscape 1536x1024. Three side-by-side scenes on warm ivory background, navy outlines, teal and amber accents, tactile paper and small human figures, generous space, high clarity. This is a conceptual analogy, NOT a screenshot or literal SAP architecture.
LEFT: small temporary scratchpad on an engineer's desk, loose sticky notes, a clock, visually transient working area. Exact title "TRANSACTION BUFFER". Exact subtitle "Current transaction".
MIDDLE: durable cabinet labeled "DRAFT", a person returns the next day to a safely stored folder with a pencil icon. Exact title "PERSISTENT DRAFT". Exact subtitle "Across requests".
RIGHT: shared library cabinet of official records with several readers and one completed document, no magical instant arrows. Exact title "ACTIVE DATA". Exact subtitle "Saved business state".
At bottom one exact line: "A draft is not the transaction buffer."
No other text, no SAP logos, no fake code, no watermark. Do not draw a sequence of three arrows implying every save must be a draft activation. The scenes are a comparison, not a mandatory pipeline. This must be a polished meaningful picture rather than flowchart boxes.
```

The accepted image contains incidental decorative English text beyond the requested labels. The required three scenes and lifetime labels are correct. The caption explicitly limits the analogy: active records may be updated, and the panels do not prescribe a mandatory pipeline.

## ETag conflict illustration

File: [etag-story-illustration.png](../visuals/etag-story-illustration.png).

Final generation prompt:

```text
Use case: scientific-educational. Asset: educational editorial comic for software interview study, landscape 1536x1024. Explain optimistic concurrency through a memorable illustrated scene, three wide vertical panels read left to right, muted ivory, navy, teal and amber, beautifully drawn humans and paper documents, not a flowchart. Panel 1 title "1. BOTH READ"; two colleagues Alice and Ben each hold identical forms marked "Version 7", next to a shared record Version 7. Panel 2 title "2. ALICE SAVES"; Alice presents her Version 7 form, a records clerk accepts and puts a new form "Version 8" into a central record folder. Ben still holds Version 7. Panel 3 title "3. BEN IS STALE"; Ben presents Version 7 to the clerk, whose shared record reads Version 8; the clerk politely stops the update, returns a card with exact words "Refresh and resolve". Clear exact footer "ETag check: update only the version you read." This is a conceptual analogy for an HTTP If-Match optimistic concurrency check; no padlocks or claims Alice locks Ben out, no automatic merging, no SAP logo, no extra invented technical text or fake interface. Make the versions large and unambiguous. Original polished instructional picture with expressive characters and concrete props.
```

The accepted image correctly shows both initial version 7 copies, Alice's resulting version 8, and rejection of Ben's stale version 7. The caption explains that real ETags are opaque and that this is optimistic concurrency. Decorative English captions are not additional protocol rules.

## Foundations and quiz revision

Twenty-eight new editable teaching plates were added: twelve foundations/OO, six pattern comparisons, eight RAP recall examples and two HANA/delivery reviews. Their purpose is to expose a specific mechanism or decision with observable inputs/outcomes. All 43 new questions have linked visual support. The complete catalog links 68 visuals to 270 unique questions; multiple relevant questions can share the same plate. Captions distinguish concrete mechanisms from simplified analogies.

## Save sequence diagrams, 12 October 2026

Two original vector teaching diagrams were added for RAP-05: the save phases with the point of no return and early-failure branch, and the four persistence ownership choices. SAP documentation supplies the technical concepts; the layout and order example were authored for this pack. The atlas contains both, and their PNGs are included in the illustrated flashcard media.
