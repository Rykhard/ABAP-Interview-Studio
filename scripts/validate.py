"""Validate public content, portable artifacts and local links."""
import csv,hashlib,json,re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote
import pymupdf as fitz
from study_topics import topic_catalog
from study_catalog import ordered_modules, is_cloud, catalog, track_key

root=Path(__file__).resolve().parents[1]
errors=[]
modules=[json.loads(p.read_text(encoding='utf-8')) for p in sorted((root/'content').glob('*.json'))]
modules=ordered_modules(modules)
questions=[q for m in modules for q in m['questions']]
ids=[q['id'] for q in questions]
if len(ids)!=len(set(ids)):errors.append('Duplicate question IDs')
for q in questions:
    for field in ['id','question','answer','detail','pitfall','level']:
        if not q.get(field):errors.append(f'Missing {field}: {q}')
    if q['level'] not in ['Core','Advanced','Senior']:errors.append('Invalid level '+q['id'])
    if '\x00' in json.dumps(q):errors.append('Invalid text '+q['id'])
    if q['level']=='Senior':
        if len(q.get('followups',[]))!=2 or len(q.get('signals',[]))!=3 or not q.get('evidence'):errors.append('Incomplete senior rubric '+q['id'])
track_counts={key:sum(len(m['questions']) for m in modules if track_key(m)==key) for key in ['cloud','foundation','integration']}
if track_counts['cloud']<=max(track_counts['foundation'],track_counts['integration']):errors.append('Cloud is not the largest curriculum track')
senior_rows=list(csv.reader((root/'flashcards'/'ABAP_Cloud_Senior_Anki.tsv').open(encoding='utf-8'),delimiter='\t'))
if len(senior_rows)!=sum(q['level']=='Senior' for m in modules if is_cloud(m) for q in m['questions']):errors.append('Senior flashcard count mismatch')
quiz_items=[item for path in sorted((root/'quiz').glob('*.json')) for item in json.loads(path.read_text(encoding='utf-8-sig'))]
if len({q['id'] for q in quiz_items})!=len(quiz_items):errors.append('Duplicate quiz IDs')
for item in quiz_items:
    opts=item.get('options',[])
    if item.get('questionId') not in ids:errors.append('Unknown quiz question '+item['id'])
    if len(opts)!=4 or len({x['id'] for x in opts})!=4 or len({x['text'] for x in opts})!=4:errors.append('Quiz options not distinct '+item['id'])
    if sum(x['id']==item.get('correctOption') for x in opts)!=1:errors.append('Quiz answer key invalid '+item['id'])
    if any(not x.get('explanation') for x in opts):errors.append('Quiz explanation absent '+item['id'])
for m in modules:
    for q in m['questions']:
        if not q['id'].startswith('STORY-') and not q.get('references'):errors.append('No question reference '+q['id'])
        for ref in q.get('references',[]):
            if not ref.get('title') or not ref.get('url','').startswith('https://') or not ref.get('note'):errors.append('Invalid reference '+q['id'])
if len({item['questionId'] for item in quiz_items})!=len(quiz_items):errors.append('Duplicate quiz question mapping')
if (root/'originals').exists():errors.append('Personal original documents must stay outside the public repository')
rows=list(csv.reader((root/'flashcards'/'ABAP_Interview_Anki.tsv').open(encoding='utf-8'),delimiter='\t'))
if len(rows)!=len(questions) or any(len(r)!=3 for r in rows):errors.append('Flashcard shape/count mismatch')
html=(root/'START_HERE.html').read_text(encoding='utf-8')
match=re.search(r'<script id="study-data" type="application/json">(.*?)</script>',html,re.S)
if not match or json.loads(match.group(1))!=modules:errors.append('HTML data does not match content')
track_match=re.search(r'<script id="track-data" type="application/json">(.*?)</script>',html,re.S)
if not track_match or json.loads(track_match.group(1))!=catalog(modules):errors.append('Track configuration mismatch')
topic_match=re.search(r'<script id="topic-data" type="application/json">(.*?)</script>',html,re.S)
topics=topic_catalog(modules)
if not topic_match or json.loads(topic_match.group(1))!=topics:errors.append('Topic tree payload mismatch')
placements=[qid for t in topics for section in t['sections'] for qid in section['questionIds']]
if sorted(placements)!=sorted(ids):errors.append('Topic tree must place every question exactly once')
if len({t['id'] for t in topics})!=len(topics):errors.append('Duplicate root topics')
sections=[section['id'] for t in topics for section in t['sections']]
if len(set(sections))!=len(sections):errors.append('Duplicate subtopic IDs')
if any(token in html for token in ['__TOPICS__','id="visualsTab"','id="resourcesTab"','id="track"']):errors.append('Obsolete navigation or unresolved topic template')
filters=re.search(r'<div id="filters".*?</div>',html,re.S)
setup=re.search(r'<section id="practiceSetup".*?</section>',html,re.S)
if not filters or 'id="scope"' in filters.group(0) or 'id="selection"' in filters.group(0):errors.append('Learning toolbar must not include difficulty/progress filters')
if not setup or any(token not in setup.group(0) for token in ['id="selection"','value="new"','value="retry"','id="advancedSettings"','id="scope"','id="sessionLength"','id="startPractice"','id="recallCoverage"','id="quizCoverage"']):errors.append('Practice selection or optional difficulty settings missing')
quiz_match=re.search(r'<script id="quiz-data" type="application/json">(.*?)</script>',html,re.S)
if not quiz_match or json.loads(quiz_match.group(1))!=quiz_items:errors.append('Quiz payload mismatch')
if any(token in html for token in ['__QUIZ__','__APP__','__QUIZ_APP__','__READING_APP__','__PRACTICE_CSS__','__SEARCH_APP__','__USABILITY_CSS__']):errors.append('Unresolved app placeholder')
if '__DATA__' in html:errors.append('HTML template placeholder remains')
catalog=json.loads((root/'visuals'/'catalog.json').read_text(encoding='utf-8'))
visual_match=re.search(r'<script id="visual-data" type="application/json">(.*?)</script>',html,re.S)
if not visual_match or json.loads(visual_match.group(1))!=catalog:errors.append('HTML visual catalog mismatch')
if '__VISUALS__' in html:errors.append('Visual template placeholder remains')
if len({v['id'] for v in catalog})!=len(catalog):errors.append('Duplicate visual IDs')
visual_questions=set()
for v in catalog:
    for field in ['title','caption','recall','limit','questions']:
        if not v.get(field):errors.append('Missing visual metadata '+v['id']+': '+field)
    for ident in v['questions']:
        if ident not in ids:errors.append('Unknown visual question '+ident)
        visual_questions.add(ident)
    for path in [root/v['image'],root/'visuals'/(v['id']+'.png'),root/'flashcards'/'media'/(v['id']+'.png')]:
        if not path.exists():errors.append('Missing visual file '+str(path))
    original=root/'visuals'/(v['id']+'.png');media=root/'flashcards'/'media'/(v['id']+'.png')
    if original.exists() and media.exists() and original.read_bytes()!=media.read_bytes():errors.append('Anki media mismatch '+v['id'])
new_ids={q['id'] for m in modules if int(m['id'][:2])>=21 for q in m['questions']}
if new_ids-visual_questions:errors.append('New questions missing meaningful visuals: '+str(sorted(new_ids-visual_questions)))
if new_ids-{item['questionId'] for item in quiz_items}:errors.append('New questions missing curated quizzes')
illustrated=list(csv.reader((root/'flashcards'/'ABAP_Interview_Illustrated_Anki.tsv').open(encoding='utf-8'),delimiter='\t'))
if len(illustrated)!=len(questions) or any(len(r)!=3 for r in illustrated):errors.append('Illustrated flashcard shape/count mismatch')
if [r[0] for r in illustrated]!=[r[0] for r in rows]:errors.append('Anki front fields differ between deck options')
for row in illustrated:
    for img in re.findall(r'<img src="([^"]+)"',row[1]):
        if not (root/'flashcards'/'media'/img).exists():errors.append('Missing Anki image '+img)
def check_link(base,target):
    if target.startswith(('http:','https:','mailto:','#','data:')):return
    target=unquote(target.split('#')[0].split('?')[0])
    if target and not (base/target).exists():errors.append(f'Broken local link {base}: {target}')
for path in root.rglob('*.md'):
    if 'originals' in path.parts:continue
    for target in re.findall(r'\]\(([^)]+)\)',path.read_text(encoding='utf-8')):check_link(path.parent,target)
for target in re.findall(r'(?:href|src)="([^"{}]+)"',html):
    if '${' not in target:check_link(root,target)
pdf_results=[]
for path in sorted((root/'pdf').glob('*.pdf')):
    doc=fitz.open(path)
    text=''.join(page.get_text() for page in doc)
    if not len(doc) or len(text)<100:errors.append('Empty PDF '+path.name)
    if '\ufffd' in text:errors.append('Replacement glyph in '+path.name)
    outside=[]
    for i,page in enumerate(doc):
        for word in page.get_text('words'):
            if word[0]<20 or word[1]<10 or word[2]>page.rect.width-18 or word[3]>page.rect.height-8:outside.append(i+1)
    if outside:errors.append(f'Out-of-bounds PDF text: {path.name} pages {sorted(set(outside))}')
    if 'Handbook' in path.name:
        missing=[ident for ident in ids if ident not in text]
        if missing:errors.append('Missing handbook question IDs '+str(missing))
    pdf_results.append(dict(file=path.name,pages=len(doc),bytes=path.stat().st_size,characters=len(text)))
summary=dict(study_topics=len(topics),study_subtopics=len(sections),quiz_questions=len(quiz_items),questions_with_references=sum(bool(q.get('references')) for q in questions),track_counts=track_counts,senior_questions=sum(q['level']=='Senior' for q in questions),cloud_questions=sum(len(m['questions']) for m in modules if is_cloud(m)),senior_flashcards=len(senior_rows),modules=len(modules),questions=len(questions),flashcards=len(rows),illustrated_flashcards=len(illustrated),visuals=len(catalog),questions_with_visuals=len(visual_questions),pdfs=pdf_results,errors=errors)
print(json.dumps(summary,indent=2))
raise SystemExit(bool(errors))
