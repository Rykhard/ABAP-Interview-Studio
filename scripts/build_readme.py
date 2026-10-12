"""Generate the public repository guide from canonical curriculum counts."""
from study_catalog import is_cloud
from study_topics import topic_catalog


def write_readme(root, modules, questions, visuals, date, quizzes):
    topics = topic_catalog(modules)
    cloud = sum(len(m['questions']) for m in modules if is_cloud(m))
    text = f"""# ABAP Interview Studio

An English interview preparation app focused on ABAP Cloud, RAP and Clean Core, with classic ABAP, OO patterns, CDS, SQL/HANA, integration and operations.

**{len(questions)} study questions, {len(quizzes)} authored multiple-choice challenges, {len(visuals)} teaching visuals and {len(topics)} topics.** ABAP Cloud, RAP and Clean Core form the largest curriculum track: {cloud} questions. Content reviewed {date}.

## Open the app

Open the hosted app: **https://abap-interview-studio.pages.dev/**. Cloudflare Pages publishes successful builds from this repository's `main` branch automatically. See [Deployment](docs/Deployment.md) for build settings and verification.

For offline use, download this repository, keep its folders together and open `START_HERE.html`. GitHub's file viewer does not execute the app.

## Learn and practice

- Browse subjects and subtopics with all difficulty levels together. Read plain-English answers followed by a concrete example in two short paragraphs, common mistakes, references and compact diagrams with an enlarged viewer.
- Show all answers / Questions only has an explicit selected state and remembers your preference.
- Search the whole library with Ctrl+K / Cmd+K. The separate text filter narrows the current view.
- Interview practice covers every question: answer aloud, reveal the model and self-rate 0-3.
- Multiple-choice practice has four authored options with explanations. First-correct-concept XP stays separate from spoken readiness. RAP contains 52 study questions, of which 24 have multiple-choice challenges.
- Search during practice and use Resume practice to return to the same session within the page. Reload preserves saved progress, not an unfinished session queue.
- Downloads & progress contains PDF/Anki resources and progress export/import. Progress stays in your browser. Export from the offline app and import on the hosted site to transfer it; devices do not synchronize automatically.

## Study formats

| Resource | Purpose |
| --- | --- |
| [Handbook](pdf/ABAP_Interview_Handbook.pdf) | Complete answers and references |
| [Senior mock](pdf/ABAP_Cloud_Senior_Mock.pdf) | Six connected interview cases |
| [Quick revision](pdf/ABAP_Quick_Revision.pdf) | Essential decisions and foundations |
| [Practice workbook](pdf/ABAP_Practice_Workbook.pdf) | Supporting scenarios and study routes |
| [Visual atlas](pdf/ABAP_Visual_Atlas.pdf) | Illustrated mechanisms and failure boundaries |
| [Text Anki](flashcards/ABAP_Interview_Anki.tsv) | Full question bank |
| [Illustrated Anki](flashcards/ABAP_Interview_Illustrated_Anki.tsv) | Same questions; copy PNGs from flashcards/media |
| [Senior Anki](flashcards/ABAP_Cloud_Senior_Anki.tsv) | Focused Cloud senior subset |
| [Study plan](study/Study_Plan.md) | Daily and interview-deadline routes |
| [Topic map](study/Topic_Map.md) | Question-by-question curriculum |

Choose one full Anki edition; the senior deck is a subset rather than extra unique questions.

## Topics

| Topic | Questions |
| --- | ---: |
"""
    for topic in topics:
        text += f"| {topic['title']} | {sum(len(s['questionIds']) for s in topic['sections'])} |\n"
    text += """
## Evidence

Technical questions carry primary references and release/context notes. Personal-story prompts require your own truthful project evidence. See the [plain-language revision](review/Plain_Language_Review.md), [content review](review/Review_Findings.md), [source register](review/Sources.md), [market research](review/Market_Research.md) and [visual provenance](review/Visual_Provenance.md). Examples are study scenarios; no SAP runtime execution or production performance result is claimed.

## Build and deploy

Run `python scripts/build_site.py` to create the static `dist` directory and `dist.zip`. The hosting build needs Python's standard library only. For Cloudflare Pages use project `abap-interview-studio`, production branch `main`, build command `python scripts/build_site.py` and output directory `dist`. See the [deployment guide](docs/Deployment.md).

For content changes, edit `content/*.json` and `quiz/*.json`, install `requirements.txt`, regenerate with `python scripts/build.py`, and run `python scripts/validate.py` before building the site. Existing question IDs keep browser progress and Anki updates compatible. The app source is in `scripts/study-template.html`, `scripts/studio*.js`, `scripts/practice.css` and `scripts/usability.css`.

This public repository contains the reviewed app and publishable study materials. Personal source documents, old private Git history, credentials and learner progress exports are excluded.
"""
    (root / 'README.md').write_text(text, encoding='utf-8')
