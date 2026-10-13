"""Build portable study artifacts from the reviewed English question bank.

Run from any directory with the dependencies in requirements.txt installed.
The content JSON files and study Markdown files are the editable sources.
"""
import csv
import html
import json
import re
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Table, TableStyle, Image, Preformatted
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon
from reportlab.graphics import renderSVG, renderPDF
import pymupdf as fitz
from visual_classic import build_classic_visuals
from visual_modern import build_modern_visuals
from visual_integration import build_integration_visuals
from visual_senior import build_senior_visuals
from visual_rap_recall import build_rap_recall_visuals
from visual_foundations_deep import build_foundations_deep_visuals
from visual_patterns import build_pattern_visuals
from visual_delivery_hana import build_delivery_hana_visuals
from visual_save_sequence import build_save_sequence_visuals
from study_catalog import ordered_modules, is_cloud, catalog

ROOT = Path(__file__).resolve().parents[1]
DATE = '13 October 2026'
INK = colors.HexColor('#122b3e')
MUTED = colors.HexColor('#536b7c')
TEAL = colors.HexColor('#126554')
ORANGE = colors.HexColor('#bf531f')
LINE = colors.HexColor('#d9e0df')
for folder in ['topics','pdf','flashcards','visuals','review','study']:
    (ROOT/folder).mkdir(exist_ok=True)
modules = [json.loads(p.read_text(encoding='utf-8')) for p in sorted((ROOT/'content').glob('*.json'))]
modules = ordered_modules(modules)
questions = [dict(q, module=m['id'], moduleTitle=m['title']) for m in modules for q in m['questions']]
lookup = {q['id']:q for q in questions}
assert len(lookup)==len(questions), 'Question IDs must be unique'
assert len(modules)>=23
assert sum(q["level"] == "Senior" for q in questions) >= 96

visual_items = build_save_sequence_visuals() + [
    dict(id='clean-core-levels',title='Clean Core levels A-D',questions=['CORE-01','CORE-02','CORE-03','CORE-04','CORE-05','CORE-06','CORE-09','CORE-13','CORE-16','CORE-18'],caption='Read each level as a classification of the actual SAP dependency or extension technology.',recall='Which configured Clean Core finding priority corresponds to levels B, C and D?',limit='This mapping is specific to Clean Core usage checks; it does not classify every ATC finding.'),
    dict(id='rap-transaction',title='RAP transaction and workflow boundary',questions=['RAP-04','RAP-15','RICEFW-11','RICEFW-12','RICEFW-14'],caption='Separate the local transaction from event delivery and the later workflow callback.',recall='What is lost if a handler calls a committing legacy API?',limit='Exact RAP save methods and supported event infrastructure depend on scenario and release.'),
    dict(id='extensibility-decision',title='Extension placement decision',questions=['CORE-10','CORE-11','CORE-15','CORE-18','BTP-01'],caption='Start from the business need and transaction boundary before choosing an extension location.',recall='When would local transactional consistency favor an on-stack extension?',limit='Placement does not establish Clean Core level or availability in a specific edition.'),
] + build_classic_visuals() + build_modern_visuals() + build_integration_visuals() + build_senior_visuals() + build_rap_recall_visuals() + build_foundations_deep_visuals() + build_pattern_visuals() + build_delivery_hana_visuals() + [
    dict(id='draft-storage-illustration',title='Three storage lifetimes: an illustrated analogy',questions=['RAP-03','RAP-12'],caption='The desk represents the current transactional buffer; the draft cabinet represents persistent work across requests; the shared archive represents saved active data.',recall='Which of the three can survive several HTTP requests without becoming active business data?',limit='An analogy, not literal SAP storage architecture or a mandatory three-stage pipeline. A new draft may have no active instance. Active business records may still be updated.',raster=True),
    dict(id='etag-story-illustration',title='Two editors and one version: an illustrated story',questions=['ADV-01','ODATA-06','TEST-07'],caption='Alice and Ben read version 7. Alice updates successfully, producing version 8. Ben must not overwrite that newer state using the stale version 7 precondition.',recall='Why should the client refresh and resolve the conflict instead of blindly retrying its old payload?',limit='Version numbers are illustrative. Real ETags are opaque validators; a failed If-Match precondition commonly returns HTTP 412. This is optimistic concurrency, not a pessimistic lock.',raster=True),
]
senior_visual_links={'clean-core-levels': 'GOV-01 GOV-05 GOV-06 GOV-14 GOV-15 GOV-16 GOV-18', 'extensibility-decision': 'CLOUD-01 CLOUD-09 CLOUD-14 GOV-07 GOV-08', 'rap-transaction': 'SRAP-02 SRAP-03 SRAP-15 SRAP-18', 'classic-oo-plug-contract': 'CLOUD-15', 'classic-sql-join-grain': 'MODEL-06 MODEL-10 MODEL-18', 'rap-contract-stack': 'CLOUD-10 MODEL-08 MODEL-16 SRAP-16 SRAP-22', 'cds-relationships': 'CLOUD-07 MODEL-06 MODEL-10', 'cds-security-boundaries': 'MODEL-01 MODEL-11 MODEL-14 MODEL-16', 'rap-buffer-example': 'SRAP-01 SRAP-17 SRAP-19', 'rap-hook-choices': 'SRAP-02 SRAP-03 SRAP-11 SRAP-12 SRAP-19', 'eml-identity-tags': 'SRAP-07 SRAP-08 SRAP-13', 'draft-lifecycle': 'SRAP-09 SRAP-10 OPS-04', 'security-three-gates': 'MODEL-02 MODEL-11 MODEL-12 MODEL-13 MODEL-16', 'odata-batch-envelope': 'SRAP-20', 'query-page-count': 'MODEL-03 MODEL-04 MODEL-05 OPS-07', 'clean-core-wrapper': 'CLOUD-03 GOV-03 GOV-07 GOV-14 GOV-15', 'btp-account-runtime': 'CLOUD-02 CLOUD-08', 'remote-transaction-boundary': 'CLOUD-01 CLOUD-05 SRAP-04 SRAP-15 OPS-11', 'event-idempotency': 'SRAP-18 SRAP-23 OPS-11', 'test-evidence-pyramid': 'CLOUD-18 OPS-01 OPS-02 OPS-09 OPS-14 OPS-15 OPS-16 OPS-18', 'interview-evidence-story': 'OPS-18', 'parallel-job-workers': 'OPS-17', 'draft-storage-illustration': 'SRAP-09 OPS-04', 'etag-story-illustration': 'OPS-05 SRAP-10'}
for v in visual_items:
    v["questions"] = list(dict.fromkeys(v["questions"] + senior_visual_links.get(v["id"], "").split()))

for v in visual_items:
    v['image']='visuals/'+v['id']+('.png' if v.get('raster') else '.svg')
    assert all(ident in lookup for ident in v['questions']), v['id']
visual_metadata=[{k:value for k,value in v.items() if k!='drawing'} for v in visual_items]
(ROOT/'visuals'/'catalog.json').write_text(json.dumps(visual_metadata,indent=2),encoding='utf-8')
def related_visuals(q):
    return [v for v in visual_items if q['id'] in v['questions']]

def md_question(q):
    result=f"## {q['id']} {q['question']}\n\n**Level:** {q['level']}\n\n**Short answer:** {q['answer']}\n\n**Reasoning and example:** {q['detail']}\n\n**Avoid this mistake:** {q['pitfall']}\n\n"
    if q['level']=='Senior':
        result+='**Interviewer follow-ups:**\n\n'+''.join('- '+x+'\n' for x in q['followups'])+'\n'
        result+='**Strong answer criteria:**\n\n'+''.join('- '+x+'\n' for x in q['signals'])+'\n'
        result+='**Verification evidence:** '+q['evidence']+'\n\n'
    if q.get('references'):
        result+='**Read and verify this answer:**\n\n'+''.join(f"- [{ref['title']}]({ref['url']}) - {ref.get('note','')}\n" for ref in q['references'])+'\n'
    for v in related_visuals(q):
        result+=f"<details>\n<summary>Visual: {v['title']}</summary>\n\n![{v['title']}](../{v['image']})\n\n{v['caption']}\n\n**Explain it:** {v['recall']}\n\n**Limit:** {v['limit']}\n\n</details>\n\n"
    return result

for m in modules:
    text=f"# {m['title']}\n\n{m['intro']}\n\n[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)\n\n"
    text+=''.join(md_question(q) for q in m['questions'])
    text+='## Official references\n\n'+''.join(f"- [{s['title']}]({s['url']})\n" for s in m['sources'])
    if not m['sources']: text+='These are rehearsal structures. Populate them with your own truthful experience.\n'
    (ROOT/'topics'/(m['id']+'.md')).write_text(text,encoding='utf-8')

def reference_back(q):
    return '<br><br><b>Read and verify</b><ul>'+''.join('<li><a href="'+html.escape(ref['url'],quote=True)+'">'+html.escape(ref['title'])+'</a><br>'+html.escape(ref.get('note',''))+'</li>' for ref in q.get('references',[]))+'</ul>' if q.get('references') else ''

def anki_paragraphs(text):
    return '<br><br>'.join(html.escape(part.strip()) for part in re.split(r'\n\s*\n',text) if part.strip())

def senior_back(q):
    if q['level']!='Senior':return ''
    return '<br><br><b>Interviewer follow-ups</b><ul>'+''.join('<li>'+html.escape(x)+'</li>' for x in q['followups'])+'</ul><b>Strong answer criteria</b><ul>'+''.join('<li>'+html.escape(x)+'</li>' for x in q['signals'])+'</ul><b>Verification evidence</b><br>'+html.escape(q['evidence'])

with (ROOT/'flashcards'/'ABAP_Interview_Anki.tsv').open('w',encoding='utf-8',newline='') as f:
    writer=csv.writer(f,delimiter='\t',lineterminator='\n')
    for q in questions:
        front=html.escape(q['id']+' | '+q['question'])
        back='<b>Short answer</b><br>'+anki_paragraphs(q['answer'])+'<br><br><b>Reasoning and example</b><br>'+anki_paragraphs(q['detail'])+'<br><br><b>Avoid this mistake</b><br>'+html.escape(q['pitfall'])
        writer.writerow([front,back+senior_back(q)+reference_back(q),'ABAP_Interview '+q['module'].replace('-','_')+' '+q['level']])

with (ROOT/'flashcards'/'ABAP_Interview_Anki.tsv').open(encoding='utf-8',newline='') as source, (ROOT/'flashcards'/'ABAP_Cloud_Senior_Anki.tsv').open('w',encoding='utf-8',newline='') as target:
    writer=csv.writer(target,delimiter='\t',lineterminator='\n')
    writer.writerows(row for row in csv.reader(source,delimiter='\t') if row[2].endswith(' Senior') and any(m['id'].replace('-','_') in row[2] for m in modules if is_cloud(m)))

from build_web import write_studio
quiz_items=[item for path in sorted((ROOT/'quiz').glob('*.json')) for item in json.loads(path.read_text(encoding='utf-8-sig'))]
write_studio(ROOT,modules,visual_metadata,quiz_items)

styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='CoverTitle',fontName='Helvetica-Bold',fontSize=31,leading=36,textColor=INK,spaceAfter=20))
styles.add(ParagraphStyle(name='SubTitle',fontName='Helvetica',fontSize=13,leading=19,textColor=MUTED,spaceAfter=15))
styles.add(ParagraphStyle(name='SectionTitle',fontName='Helvetica-Bold',fontSize=21,leading=26,textColor=INK,spaceBefore=8,spaceAfter=14,keepWithNext=True))
styles.add(ParagraphStyle(name='Question',fontName='Helvetica-Bold',fontSize=12,leading=16,textColor=INK,spaceBefore=15,spaceAfter=7,keepWithNext=True))
styles.add(ParagraphStyle(name='BodyStudy',fontName='Helvetica',fontSize=10,leading=14.5,textColor=INK,spaceAfter=8))
styles.add(ParagraphStyle(name='SmallStudy',fontName='Helvetica',fontSize=8.5,leading=12,textColor=MUTED,spaceAfter=7))
styles.add(ParagraphStyle(name='Trap',fontName='Helvetica',fontSize=9,leading=13,textColor=INK,backColor=colors.HexColor('#fff4e9'),borderPadding=8,spaceBefore=4,spaceAfter=12))
styles.add(ParagraphStyle(name='LabelStudy',fontName='Helvetica-Bold',fontSize=9,leading=12,textColor=ORANGE,spaceBefore=12,spaceAfter=6,keepWithNext=True))
styles.add(ParagraphStyle(name='TableCellStudy',fontName='Helvetica',fontSize=8.4,leading=11.8,textColor=INK))

def clean(s):
    return s.replace('\u2011','-').replace('\u2013','-').replace('\u2014','-').replace('\u2019',"'").replace('\u2018',"'").replace('\u201c','"').replace('\u201d','"')
def p(text,style='BodyStudy'):
    return Paragraph(escape(clean(text)),styles[style])
def rich(text,style='BodyStudy'):
    return Paragraph(text,styles[style])
class StudyDoc(SimpleDocTemplate):
    def afterFlowable(self,flowable):
        if hasattr(flowable,'bookmark'):
            self.canv.bookmarkPage(flowable.bookmark)
            self.canv.addOutlineEntry(flowable.getPlainText(),flowable.bookmark,0,False)
def page_chrome(canvas,doc):
    canvas.saveState()
    w,h=A4
    canvas.setFont('Helvetica',8)
    canvas.setFillColor(MUTED)
    canvas.drawString(46,h-29,'ABAP INTERVIEW PREPARATION')
    canvas.drawRightString(w-46,h-29,DATE)
    canvas.setStrokeColor(LINE)
    canvas.line(46,37,w-46,37)
    canvas.drawString(46,24,'Explain the concept. Give an example. State the limit.')
    canvas.drawRightString(w-46,24,str(doc.page))
    canvas.restoreState()
def build_pdf(name,story):
    doc=StudyDoc(str(ROOT/'pdf'/name),pagesize=A4,rightMargin=46,leftMargin=46,topMargin=54,bottomMargin=50,title=name.replace('_',' ').replace('.pdf',''),author='ABAP Interview Preparation',pageCompression=1)
    doc.build(story,onFirstPage=page_chrome,onLaterPages=page_chrome)
def heading(text,bookmark):
    obj=p(text,'SectionTitle');obj.bookmark=bookmark;return obj
def cover(title,subtitle):
    return [Spacer(1,65),p('ABAP INTERVIEW PREPARATION','LabelStudy'),p(title,'CoverTitle'),p(subtitle,'SubTitle'),Spacer(1,18),p(f'{len(questions)} questions across {len(modules)} study segments. Reviewed {DATE}.'),p('Use the short answers for oral rehearsal. The examples and pitfalls prepare you for follow-up questions. Choose the target SAP edition and release before applying an implementation detail.'),Spacer(1,20),p('Open abap-interview-studio.pages.dev online, or download the repository and open START_HERE.html for offline study. The PDF is a portable reading and printing edition.','SmallStudy'),PageBreak()]

def text(d,x,y,s,size=12,color=INK,bold=False):
    d.add(String(x,y,clean(s),fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,fillColor=color))
def box(d,x,y,w,h,fill): d.add(Rect(x,y,w,h,rx=9,ry=9,fillColor=fill,strokeColor=None))
def arrow(d,x1,y1,x2,y2):
    d.add(Line(x1,y1,x2,y2,strokeColor=MUTED,strokeWidth=2))
    if x1==x2:d.add(Polygon([x2-5,y2+8,x2+5,y2+8,x2,y2],fillColor=MUTED,strokeColor=None))
    else:d.add(Polygon([x2-8,y2+5,x2-8,y2-5,x2,y2],fillColor=MUTED,strokeColor=None))

def diagrams():
    output={}
    d=Drawing(880,460)
    box(d,0,0,880,460,colors.HexColor('#f4f7f5'))
    text(d,30,421,'Clean Core levels',26,bold=True)
    text(d,30,395,'Classify actual SAP dependencies and extension technologies',12,MUTED)
    data=[('A','Released SAP APIs and extension points','No corresponding finding','#123349'),('B','SAP-designated classic APIs and options','Priority 3 / information','#196479'),('C','Internal SAP objects with upgrade risk','Priority 2 / warning','#a76719'),('D','Non-recommended objects or techniques','Priority 1 / error','#a63f32')]
    for i,(level,desc,atc,color) in enumerate(data):
        y=305-i*69;box(d,30,y,820,58,colors.white);box(d,30,y,58,58,colors.HexColor(color));text(d,47,y+17,level,27,colors.white,True);text(d,108,y+31,desc,13,INK,True);text(d,108,y+11,atc,11,MUTED)
    text(d,30,51,'A-D describes Clean Core usage checks, not every ATC finding.',11,INK,True)
    text(d,30,30,'Verify the target edition, release, classification data and configured checks.',11,MUTED)
    output['clean-core-levels']=d
    d=Drawing(880,550);box(d,0,0,880,550,colors.HexColor('#f4f7f5'))
    text(d,30,509,'RAP transaction and approval flow',25,bold=True)
    text(d,30,482,'Transaction completion belongs to the framework or the external EML consumer',12,MUTED)
    steps=[(30,365,'1  Consumer request',['Action or EML modification','Check the public contract']),(320,365,'2  Interaction',['Read and change the buffer','Derive data and reject failures']),(610,365,'3  Save sequence',['Finalize and validate','Number and persist as configured'])]
    for x,y,title,lines in steps:
        box(d,x,y,240,91,colors.white);text(d,x+15,y+63,title,15,INK,True)
        for j,s in enumerate(lines):text(d,x+15,y+39-j*18,s,10.5,MUTED)
    arrow(d,275,410,314,410);arrow(d,565,410,604,410)
    box(d,30,298,820,44,colors.HexColor('#fff1e3'));text(d,48,315,'No COMMIT WORK or COMMIT ENTITIES inside behavior handlers or savers.',13,ORANGE,True)
    arrow(d,730,362,730,266)
    box(d,610,172,240,89,colors.white);text(d,625,235,'4  Commit and publish',15,INK,True);text(d,625,212,'Use supported transactional',11,MUTED);text(d,625,194,'event delivery mechanisms',11,MUTED)
    box(d,320,172,240,89,colors.white);text(d,335,235,'5  Workflow consumer',15,INK,True);text(d,335,212,'Correlate and deduplicate',11,MUTED);text(d,335,194,'Monitor retries and failures',11,MUTED)
    d.add(Line(604,218,566,218,strokeColor=MUTED,strokeWidth=2));d.add(Polygon([566,218,574,223,574,213],fillColor=MUTED,strokeColor=None))
    box(d,30,172,240,89,colors.white);text(d,45,235,'6  Approval callback',15,INK,True);text(d,45,212,'Check actor and current state',11,MUTED);text(d,45,194,'Apply an idempotent decision',11,MUTED)
    d.add(Line(314,218,275,218,strokeColor=MUTED,strokeWidth=2));d.add(Polygon([275,218,283,223,283,213],fillColor=MUTED,strokeColor=None))
    text(d,30,120,'The callback is a new transaction. Remote actions do not share the local database rollback.',12,INK,True)
    text(d,30,91,'Draft persistence spans requests; the in-memory transactional buffer does not.',11,MUTED)
    text(d,30,63,'Conceptual flow: exact RAP save methods and event infrastructure depend on the scenario and release.',10,MUTED)
    output['rap-transaction']=d
    d=Drawing(880,470);box(d,0,0,880,470,colors.HexColor('#f4f7f5'))
    text(d,30,430,'Choose an extension approach',25,bold=True);text(d,30,403,'Start with the business requirement, supported contracts and transaction boundary',12,MUTED)
    rows=[('First','Can standard functionality or configuration meet the need?','Use the standard capability and avoid unnecessary custom code.'),('Key user','Does a delivered business context cover the adaptation?','Use supported custom fields, logic or UI adaptation tools.'),('On-stack','Does the logic need local transactional consistency?','Use released local contracts and suitable ABAP Cloud extensibility.'),('Side-by-side','Does the process need an independent or cross-system app?','Use supported remote APIs and events; design retries and consistency.')]
    for i,(label,question,answer) in enumerate(rows):
        y=304-i*77;box(d,30,y,820,66,colors.white);text(d,46,y+41,label,13,TEAL,True);text(d,170,y+41,question,12,INK,True);text(d,170,y+18,answer,10.5,MUTED)
    text(d,30,37,'Placement does not determine the Clean Core level. Check dependencies separately.',12,INK,True)
    output['extensibility-decision']=d
    for name,d in output.items():
        renderSVG.drawToFile(d,str(ROOT/'visuals'/(name+'.svg')))
        doc=fitz.open(stream=renderPDF.drawToString(d),filetype='pdf');doc[0].get_pixmap(matrix=fitz.Matrix(1.8,1.8),alpha=False).save(ROOT/'visuals'/(name+'.png'));doc.close()
    return output

figures=diagrams()
for v in visual_items:
    if 'drawing' in v:
        d=v['drawing'];figures[v['id']]=d
        renderSVG.drawToFile(d,str(ROOT/'visuals'/(v['id']+'.svg')))
        doc=fitz.open(stream=renderPDF.drawToString(d),filetype='pdf')
        doc[0].get_pixmap(matrix=fitz.Matrix(1.8,1.8),alpha=False).save(ROOT/'visuals'/(v['id']+'.png'))
        doc.close()
def scaled(d):
    # A fresh drawing avoids shared scale transforms between PDF builds.
    import copy
    clone=copy.deepcopy(d);ratio=503/d.width;clone.scale(ratio,ratio);clone.width=d.width*ratio;clone.height=d.height*ratio;return clone

def visual_flow(v):
    if v.get('raster'):
        img=Image(str(ROOT/v['image']));ratio=503/img.imageWidth
        img.drawWidth=503;img.drawHeight=img.imageHeight*ratio
        return img
    return scaled(figures[v['id']])

atlas=cover('Visual interview atlas','Original illustrations, data examples, comparison plates and concept maps')
gallery='# Visual interview atlas\n\nUse these original teaching visuals alongside the full answers. Cover the explanation and answer the recall prompt aloud. Illustrations are analogies; diagrams are simplified models with explicit limits. [Download the printable atlas](../pdf/ABAP_Visual_Atlas.pdf).\n\n'
for v in visual_items:
    atlas.extend([heading(v['title'],v['id']),visual_flow(v),Spacer(1,12),p(v['caption']),p('Explain it: '+v['recall'],'Question'),p('Limit: '+v['limit'],'SmallStudy'),p('Related questions: '+', '.join(v['questions']),'SmallStudy')])
    refs=[]
    for m in modules:
        if any(q['id'] in v['questions'] for q in m['questions']):
            for s in m['sources'][:1]:
                if s not in refs:refs.append(s)
    for s in refs[:3]:atlas.append(rich('<link href="'+escape(s['url'],{'"':'&quot;'})+'" color="#12618a">'+escape(s['title'])+'</link>','SmallStudy'))
    atlas.append(PageBreak())
    gallery+=f"## {v['title']}\n\n![{v['title']}]({v['id']+'.png'})\n\n{v['caption']}\n\n**Explain it:** {v['recall']}\n\n**Limit:** {v['limit']}\n\n**Questions:** "+', '.join(v['questions'])+'\n\n'
    gallery+=f"[Full-size PNG]({v['id']}.png)"+(f" | [Editable SVG]({v['id']}.svg)" if not v.get('raster') else '')+'\n\n'
atlas.pop();build_pdf('ABAP_Visual_Atlas.pdf',atlas)
(ROOT/'visuals'/'README.md').write_text(gallery.rstrip()+'\n',encoding='utf-8')

# The illustrated Anki option deliberately uses flat media names, as Anki expects.
import shutil
media_dir=ROOT/'flashcards'/'media';media_dir.mkdir(exist_ok=True)
for v in visual_items:shutil.copy2(ROOT/'visuals'/(v['id']+'.png'),media_dir/(v['id']+'.png'))
with (ROOT/'flashcards'/'ABAP_Interview_Illustrated_Anki.tsv').open('w',encoding='utf-8',newline='') as f:
    writer=csv.writer(f,delimiter='\t',lineterminator='\n')
    for q in questions:
        front=html.escape(q['id']+' | '+q['question'])
        back='<b>Short answer</b><br>'+anki_paragraphs(q['answer'])+'<br><br><b>Reasoning and example</b><br>'+anki_paragraphs(q['detail'])+'<br><br><b>Avoid</b><br>'+html.escape(q['pitfall'])
        for v in related_visuals(q):
            back+='<hr><b>'+html.escape(v['title'])+'</b><br><img src="'+v['id']+'.png"><br>'+html.escape(v['caption'])+'<br><b>Explain it:</b> '+html.escape(v['recall'])+'<br><b>Limit:</b> '+html.escape(v['limit'])
        writer.writerow([front,back+senior_back(q)+reference_back(q),'ABAP_Interview '+q['module'].replace('-','_')+' '+q['level']])

story=cover('ABAP interview handbook','Senior ABAP Cloud, RAP and Clean Core first; supporting ABAP and integration knowledge')
story.append(heading('Study segments','contents'))
for m in modules:story.append(rich(f'<link href="#{m["id"]}" color="#12618a">{escape(m["title"])}</link> <font color="#536b7c">/ {len(m["questions"])} questions</font>'))
story.extend([Spacer(1,15),p('Answer structure','Question'),p('Start with a definition and one useful example. Add the main trade-off or failure mode. If syntax or support depends on the SAP release, name that dependency and explain how you would verify it.'),p('Use the practice workbook for scenarios and mock interviews. Use the quick revision PDF for the final review. References at the end of each segment link to official primary documentation. They support the concepts; examples and rehearsal advice are original instructional material.','SmallStudy'),PageBreak()])
for m in modules:
    story.extend([heading(m['title'],m['id']),p(m['intro'])])
    featured={'01':'classic-internal-table-lookup','02':'classic-oo-plug-contract','03':'classic-sql-join-grain','04':'cds-relationships','05':'draft-storage-illustration','06':'etag-story-illustration','07':'query-page-count','08':'clean-core-levels','09':'btp-account-runtime','10':'event-idempotency','11':'test-evidence-pyramid','12':'interview-evidence-story','13':'http-message-anatomy','14':'parallel-job-workers','15':'idoc-aif-lifecycle','16':'extensibility-decision','17':'rap-buffer-example','18':'cds-security-boundaries','19':'test-evidence-pyramid','20':'clean-core-levels','21':'deep-parameter-paths','22':'deep-substitution-dispatch','23':'patterns-strategy-template','24':'hana-grain-review'}
    chosen=next((v for v in visual_items if v['id']==featured.get(m['id'][:2])),None)
    if chosen:story.extend([visual_flow(chosen),p(chosen['caption'],'SmallStudy'),p('See the visual atlas for the recall prompt, limits and related questions.','SmallStudy'),Spacer(1,12)])
    for number,q in enumerate(m['questions']):
        group=[p(q['id']+'  '+q['question'],'Question'),p(q['answer']),p('Reasoning and example','LabelStudy')]
        group.extend(p(part.strip()) for part in re.split(r'\n\s*\n',q['detail']) if part.strip())
        group.append(rich('<b>Avoid this mistake</b> '+escape(clean(q['pitfall'])),'Trap'))
        if q['level']=='Senior':
            group.extend([rich('<b>Interviewer probes</b> '+escape(clean(' / '.join(q['followups']))),'SmallStudy'),rich('<b>Strong answer criteria</b> '+escape(clean('; '.join(q['signals']))),'SmallStudy'),rich('<b>Verification evidence</b> '+escape(clean(q['evidence'])),'SmallStudy')])
        if q.get('references'):
            group.append(p('Read and verify this answer','LabelStudy'))
            for ref in q['references']:
                group.append(rich('<link href="'+escape(ref['url'],{'"':'&quot;'})+'" color="#12618a">'+escape(ref['title'])+'</link>','SmallStudy'))
        if number==len(m['questions'])-1 and m['sources']:
            group.append(p('Official references','Question'))
            for source in m['sources']:group.append(rich('<link href="'+escape(source['url'],{'"':'&quot;'})+'" color="#12618a">'+escape(source['title'])+'</link>','SmallStudy'))
        story.append(KeepTogether(group))
    story.append(PageBreak())
story.pop()
build_pdf('ABAP_Interview_Handbook.pdf',story)

quick_ids=['CLOUD-01','CLOUD-02','CLOUD-04','CLOUD-18','SRAP-01','SRAP-03','SRAP-04','SRAP-08','SRAP-12','SRAP-16','MODEL-01','MODEL-02','MODEL-03','MODEL-04','MODEL-14','OPS-01','OPS-05','OPS-11','OPS-14','GOV-01','GOV-02','GOV-04','GOV-10','GOV-18','ABAP-01','ABAP-07','ABAP-08','OO-02','OO-03','OO-07','SQL-02','SQL-04','SQL-10','CDS-03','CDS-07','CDS-11','RAP-02','RAP-04','RAP-07','RAP-10','RAP-11','RAP-12','ADV-01','ADV-02','ADV-06','ADV-13','ODATA-01','ODATA-04','ODATA-07','CORE-02','CORE-03','CORE-08','CORE-10','CORE-15','BTP-04','BTP-07','RICEFW-11','RICEFW-15','TEST-03','TEST-06','HTTP-01','HTTP-04','HTTP-07','HTTP-08','RFC-02','RFC-04','RFC-07','RFC-10','INTF-01','INTF-07','INTF-11']
quick_ids += ['BASE-01','BASE-04','BASE-06','BASE-12','BASE-16','OODEEP-01','OODEEP-09','PAT-01','PAT-03','PAT-08','PAT-09','SQLX-01','DELIV-01']
assert all(x in lookup for x in quick_ids)
quick='# ABAP quick revision\n\nUse these questions for the final review. For deeper context, follow the question ID in the complete topic guide.\n\n'
quick+=''.join(md_question(lookup[x]) for x in quick_ids)
(ROOT/'study'/'Quick_Revision.md').write_text(quick.rstrip()+'\n',encoding='utf-8')
story=cover('ABAP quick revision','Senior Cloud decisions first, followed by essential concepts and common traps')
story.extend([heading('Clean Core at a glance','quick-levels'),scaled(figures['clean-core-levels']),Spacer(1,16),p('Use the correct scope','Question'),p('These levels describe extension dependency choices. The ATC mapping is for the configured Clean Core usage checks. Public edition and ABAP for Cloud Development do not become unrestricted simply because a classic option exists in another edition.'),PageBreak()])
current=None
for ident in quick_ids:
    q=lookup[ident]
    group=[]
    if current!=q['module']:
        group.append(heading(q['moduleTitle'],'quick-'+q['module']));current=q['module']
    group.extend([p(q['id']+'  '+q['question'],'Question'),p(q['answer']),rich('<b>Remember</b> '+escape(clean(q['pitfall'])),'Trap')])
    story.append(KeepTogether(group))
build_pdf('ABAP_Quick_Revision.pdf',story)

def md_inline(s):
    s=escape(clean(s))
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m: '<link href="'+m.group(2)+'" color="#12618a">'+m.group(1)+'</link>' if m.group(2).startswith('https://') else m.group(1),s)
    s=re.sub(r'`([^`]+)`',r'<font name="Courier">\1</font>',s)
    s=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',s)
    return s
def markdown_story(content,compact=False):
    flow=[];lines=content.splitlines();i=0;seen_exercise=False
    while i<len(lines):
        line=lines[i].strip();i+=1
        if not line:continue
        if line.startswith('```'):
            code=[]
            while i<len(lines) and not lines[i].strip().startswith('```'):
                code.append(clean(lines[i]));i+=1
            i+=1
            flow.append(Preformatted('\n'.join(code),ParagraphStyle(name='CodeStudy',fontName='Courier',fontSize=7.3,leading=10,spaceBefore=8,spaceAfter=12,backColor=colors.HexColor('#edf1f0'),borderPadding=8),maxLineLength=105))
            continue
        if line.startswith('# '):continue
        if line.startswith('## '):
            if line.startswith('## Exercise'):
                if seen_exercise or compact:flow.append(PageBreak())
                seen_exercise=True
            if line.startswith('## A 60 minute'):flow.append(PageBreak())
            flow.append(p(line[3:],'SectionTitle'));continue
        if line.startswith('### '):
            if line=='### Model answer':
                flow.append(p('Your answer before reading the solution','LabelStudy'))
                notes=Drawing(503,48 if compact else 87)
                for y in ([9,26,43] if compact else [13,36,59,82]):notes.add(Line(0,y,503,y,strokeColor=LINE,strokeWidth=.5))
                flow.extend([notes,Spacer(1,10)])
            flow.append(p(line[4:],'Question'));continue
        if line.startswith('|'):
            rows=[line]
            while i<len(lines) and lines[i].strip().startswith('|'):rows.append(lines[i].strip());i+=1
            cells=[]
            for row in rows:
                if re.match(r'^\|[\s:|\-]+$',row):continue
                cells.append([rich(md_inline(c.strip()),'TableCellStudy') for c in row.strip('|').split('|')])
            count=len(cells[0]); widths=[503/count]*count
            if count==3:widths=[82,190,231]
            if 'Cumulative' in rows[0]:widths=[333,70,100]
            if count==5 and 'Boundary' in rows[0]:widths=[47,114,114,114,114]
            t=Table(cells,colWidths=widths,repeatRows=1,hAlign='LEFT')
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8efec')),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),.4,LINE),('INNERGRID',(0,0),(-1,-1),.35,LINE),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5 if compact else 8),('BOTTOMPADDING',(0,0),(-1,-1),5 if compact else 8)]));flow.extend([t,Spacer(1,12)]);continue
        paragraph=line
        while i<len(lines) and lines[i].strip() and not lines[i].startswith(('#','|','```')):
            paragraph+=' '+lines[i].strip();i+=1
        flow.append(rich(md_inline(paragraph)))
    return flow
story=cover('ABAP practice workbook','Thirteen interview scenarios with model answers, a mock interview and a study plan')
story+=markdown_story((ROOT/'study'/'Practice_Workbook.md').read_text(encoding='utf-8'))
story.extend([PageBreak(),heading('Extension placement reference','placement'),scaled(figures['extensibility-decision']),PageBreak(),heading('Study plan','study-plan')])
story+=markdown_story((ROOT/'study'/'Study_Plan.md').read_text(encoding='utf-8'))
build_pdf('ABAP_Practice_Workbook.pdf',story)

story=cover('Senior ABAP Cloud mock interview','Six connected cases, code diagnosis, model reasoning and a 75-minute self-check')
styles['BodyStudy'].fontSize=9.5;styles['BodyStudy'].leading=13.2;styles['BodyStudy'].spaceAfter=6
styles['Question'].spaceBefore=9;styles['Question'].spaceAfter=5
styles['SectionTitle'].fontSize=19;styles['SectionTitle'].leading=23
story+=markdown_story((ROOT/'study'/'Senior_Mock_Interview.md').read_text(encoding='utf-8'),compact=True)
build_pdf('ABAP_Cloud_Senior_Mock.pdf',story)

sources=[];seen=set()
for m in modules:
    for s in m['sources']+[ref for q in m['questions'] for ref in q.get('references',[])]:
        if s['url'] not in seen:sources.append(s);seen.add(s['url'])
register='# Official source register\n\nMaintained on 13 October 2026. See the dated review reports for the scope of each content pass. Use the target product and version in SAP Help before applying exact syntax or API classifications. References include primary SAP, SAP samples, standards documentation and publisher engineering guidance such as AWS, OWASP and OpenTelemetry. Older SAP library pages are retained only for stable classic concepts; they do not establish cloud availability. SAP Notes mentioned in the material may require a customer login and were not treated as publicly inspected full text.\n\n'
register+=''.join(f'- [{s["title"]}]({s["url"]})\n' for s in sources)
(ROOT/'review'/'Sources.md').write_text(register,encoding='utf-8')

from build_readme import write_readme
write_readme(ROOT, modules, questions, visual_items, DATE, quiz_items)
print(json.dumps({'modules':len(modules),'questions':len(questions),'sources':len(sources),'pdfs':[{'name':p.name,'pages':len(fitz.open(p))} for p in sorted((ROOT/'pdf').glob('*.pdf'))]},indent=2))
