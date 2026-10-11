"""Original teaching plates: concrete examples, boundaries and visual comparisons."""
import textwrap
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon, Circle
from reportlab.lib.colors import HexColor, white

INK=HexColor('#122b3e'); MUTED=HexColor('#536b7c'); TEAL=HexColor('#126554')
AMBER=HexColor('#bf531f'); PALE=HexColor('#e5f0eb'); BG=HexColor('#f4f7f5')
def txt(d,x,y,s,size=14,color=INK,bold=False):
    d.add(String(x,y,s,fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,fillColor=color))
def rect(d,x,y,w,h,fill=white,stroke=None):
    d.add(Rect(x,y,w,h,rx=8,ry=8,fillColor=fill,strokeColor=stroke))
def lines(d,x,y,s,width=50,size=14,color=INK):
    for i,line in enumerate(textwrap.wrap(s,width=width)):
        txt(d,x,y-i*(size+5),line,size,color)
def base(title,subtitle):
    d=Drawing(880,560);rect(d,0,0,880,560,BG)
    txt(d,28,518,title,25,bold=True);txt(d,28,490,subtitle,13,MUTED)
    return d
def arrow(d,x1,y1,x2,y2,color=MUTED):
    import math
    d.add(Line(x1,y1,x2,y2,strokeColor=color,strokeWidth=2))
    a=math.atan2(y2-y1,x2-x1);c=math.cos(a);s=math.sin(a)
    d.add(Polygon([x2,y2,x2-10*c+5*s,y2-10*s-5*c,x2-10*c-5*s,y2-10*s+5*c],fillColor=color,strokeColor=None))
def panel(d,x,y,w,h,title,body,color=TEAL):
    rect(d,x,y,w,h);rect(d,x,y+h-39,w,39,color)
    txt(d,x+14,y+h-26,title,15,white,True)
    lines(d,x+14,y+h-64,body,max(18,int((w-28)/7.4)))
def note(d,s):
    rect(d,28,24,824,57,HexColor('#fff0e1'))
    lines(d,42,60,s,104,13,INK)
def table(d,x,y,width,headers,rows,colweights=None,rowh=39):
    weights=colweights or [1]*len(headers);ws=[width*w/sum(weights) for w in weights]
    for r,row in enumerate([headers]+rows):
        left=x;bottom=y-r*rowh
        for c,value in enumerate(row):
            rect(d,left,bottom,ws[c]-2,rowh-2,INK if r==0 else (white if r%2 else PALE))
            txt(d,left+10,bottom+13,value,13,white if r==0 else INK,r==0);left+=ws[c]
def make(ident,title,ids,caption,recall,limit,d):
    return dict(id=ident,title=title,questions=ids.split(),caption=caption,recall=recall,limit=limit,drawing=d)

def build_modern_visuals():
    out=[]
    d=base('A service is a stack of contracts','RAP artifacts: each layer has a different job')
    layers=[('Fiori UI / API client','Consume metadata, data and operations'),('Service binding','Choose protocol and exposure configuration'),('Service definition','Select the entities to expose'),('Projection + projected behavior','Shape the consumer contract'),('Root / child CDS + behavior definition','Model identity, composition and permitted behavior'),('Behavior implementation + persistence','Execute business rules; persist through the selected scenario')]
    for i,(a,b) in enumerate(layers):
        y=409-i*55;rect(d,42,y,796,47,INK if i%2==0 else TEAL);txt(d,55,y+28,a,14,white,True);txt(d,55,y+9,b,12,white)
        if i<5:arrow(d,820,y,820,y-8)
    note(d,'A CDS entity alone is not a complete transactional service. A binding is not a behavior implementation.')
    out.append(make('rap-contract-stack','RAP contract stack','RAP-01 RAP-14 ADV-09 CDS-05 CDS-08 ODATA-02','Read from the client down to storage, then explain what each artifact contributes.','Where would you restrict the exposed operation set?','Conceptual layers; the exact artifact set depends on the scenario and release.',d))

    d=base('Association is a link; composition is ownership','An order example separates navigation from the business object boundary')
    panel(d,40,290,235,140,'Order 4711','Root of the business object. Owns its item lifecycle.')
    panel(d,40,115,235,115,'Order items','10: keyboard / 20: mouse')
    arrow(d,150,288,150,237,TEAL);txt(d,173,255,'composition',13,TEAL,True)
    panel(d,570,290,270,140,'Business partner 900','An independently managed entity; not owned by this order.')
    arrow(d,284,360,562,360);txt(d,315,376,'association',15,bold=True)
    rect(d,315,125,520,113,PALE);lines(d,335,207,'Declaring a cardinality describes the intended relationship. It does not clean duplicate data or create a database uniqueness constraint.',62)
    note(d,'Model [0..1], [1..1] or to-many relationships from actual data and the intended join conditions.')
    out.append(make('cds-relationships','CDS links and ownership','CDS-03 CDS-04 CDS-11 SQL-07','Items belong to the order BO; a partner reference crosses to an independently managed object.','What breaks if a declared to-one relationship actually returns two partners?','Composition semantics and generated operations still require the corresponding RAP model.',d))

    d=base('The exposed entity needs its own access decision','A base-layer DCL is not automatically inherited as an access filter')
    panel(d,36,286,242,143,'Base CDS entity','A DCL restricts its direct authorized consumption.')
    panel(d,321,286,240,143,'Higher CDS entity','Selects from the base. Review access control here.')
    panel(d,602,286,242,143,'Service read','Test the actual entry point with allowed and denied users.')
    arrow(d,284,355,314,355);arrow(d,567,355,596,355)
    table(d,45,203,790,['Mechanism','Purpose'],[['DCL','Read access for the consumed CDS entity'],['RAP authorization','Permission to execute operations'],['Feature control','Availability in the current context']], [1,2.8],36)
    note(d,'@AccessControl.authorizationCheck: #CHECK is not an authorization rule by itself.')
    out.append(make('cds-security-boundaries','CDS security boundaries','CDS-07 ADV-02 TEST-06','Review security where consumers enter the model, rather than assuming that lower layers protect every upper view.','Which two tests prove that an exposed service rejects unauthorized access?','Authorization behavior depends on the access path and supported DCL inheritance mechanisms.',d))

    d=base('A buffer is a working set, not a second commit owner','The same business object can have different in-memory and saved states')
    table(d,40,381,340,['Saved database','Value'],[['Order 4711','100 EUR'],['Status','Open']], [1.5,1])
    table(d,495,381,340,['Current RAP buffer','Value'],[['Order 4711','120 EUR'],['Status','Open']], [1.7,1])
    arrow(d,385,362,488,362);txt(d,392,384,'modify',13,TEAL,True)
    panel(d,43,123,340,112,'Transactional read','Use EML for BO semantics and the current transactional view.')
    panel(d,493,123,340,112,'Completion owner','Framework or external EML consumer requests transaction completion.')
    note(d,'Behavior handlers and savers must not issue COMMIT WORK or COMMIT ENTITIES themselves.')
    out.append(make('rap-buffer-example','RAP buffer with a concrete value change','RAP-03 RAP-04 RAP-05 RAP-08 RAP-15','During modification, the transactional view can show 120 EUR while saved data still shows 100 EUR.','Why can a direct SQL read be the wrong way to read the BO during modification?','Simplified single-record example, not a promise about a particular SQL isolation level.',d))

    d=base('Four hooks answer four different questions','Choose by responsibility and supported trigger, not by an assumed method order')
    panel(d,38,282,386,166,'Precheck: accept this request?','Check incoming changes before they are applied to the transactional buffer. Example: reject an invalid requested transition.')
    panel(d,456,282,386,166,'Determination: derive what?','Derive values after relevant triggers. Example: calculate a default or dependent field. Design repeated execution to be safe.')
    panel(d,38,104,386,158,'Validation: may this be saved?','Check consistency at supported validation points. Example: a mandatory approval reason must be present.')
    panel(d,456,104,386,158,'Action: do which business operation?','An explicit operation, such as Submit. It may modify state and return a result under its declared contract.')
    note(d,'Unmanaged RAP determinations and validations have draft-specific support. Implement active-instance checks in supported handlers/save logic.')
    out.append(make('rap-hook-choices','RAP hook responsibilities','RAP-06 RAP-13 ADV-04 ADV-05','Read each card as a separate design question; this is not an execution sequence.','Where would you derive a total, reject an invalid input and implement Submit?','Check scenario and release support; do not rely on an undocumented ordering of independent hooks.',d))

    d=base('EML identities solve different problems','A parent and child created in the same request')
    panel(d,40,290,345,142,'Create parent','%cid = ORDER_NEW identifies this request entry before final keys are known.')
    panel(d,488,290,345,142,'Create child by association','%cid_ref = ORDER_NEW links the new child to that parent in the request.')
    arrow(d,480,357,393,357);txt(d,410,376,'refer to',13)
    table(d,40,218,795,['Token','Meaning'],[['%tky','Transactional identity; includes required context'],['%pid','Preliminary identity for late-numbering scenarios'],['%pre -> %key','Map preliminary identity to final keys in adjust_numbers'],['MAPPED','Return correlations and assigned identities']], [1,3.8],33)
    note(d,'%cid is not a database key. %tky must not be reconstructed by blindly copying only the business key.')
    out.append(make('eml-identity-tags','EML identity tags','RAP-07 RAP-10 RAP-11','Content IDs connect entries within a request. Transactional and preliminary identities address other lifecycle needs.','How can a new item refer to a newly created order before the final order number exists?','Generated EML types and available components are authoritative for the specific BO.',d))

    d=base('Draft lifecycle: edit now, activate when consistent','Persistent draft and active instance are distinct states')
    panel(d,40,317,228,112,'Active instance','A saved business record exists.')
    panel(d,326,317,228,112,'Edit draft','A persistent working version survives individual requests.')
    panel(d,613,317,228,112,'Activate','Validate and transfer the accepted state to active data.')
    arrow(d,275,365,318,365);arrow(d,561,365,605,365)
    panel(d,326,137,228,105,'Discard','Abandon the draft; an existing active version remains.')
    arrow(d,440,309,440,250)
    lines(d,44,234,'New-object draft: there may be no active instance yet.',29)
    lines(d,613,234,'A failed activation must not be described as successful business persistence.',29)
    note(d,'Submit is a business action, not automatically draft activation. Locks and total ETag protect different concurrency situations.')
    out.append(make('draft-lifecycle','Draft lifecycle','RAP-12 ADV-01 ADV-08 RICEFW-11','Follow edit, activate and discard for an existing active object, then explain how a new-object draft differs.','What remains after discarding an edit draft? What if activation fails?','Schematic state transitions; draft actions and supported flows depend on the BO and consumer.',d))

    d=base('Three gates: identity, permission and availability','A disabled button is not a security boundary')
    for x,n,title,body in [(38,'1','Authentication','Who is the caller? Establish a verified identity.'),(323,'2','Authorization','May this caller perform the operation? Check global and instance permissions.'),(608,'3','Feature control','Is the operation currently enabled by the business state?')]:
        panel(d,x,265,235,170,title,body);d.add(Circle(x+117,221,25,fillColor=TEAL,strokeColor=None));txt(d,x+112,214,n,20,white,True)
    table(d,55,150,770,['Order state','Submit feature','Permission'],[['Open','Enabled','Still required'],['Submitted','Disabled','Does not replace authorization']], [1,1,2],32)
    note(d,'CSRF protects against request forgery in the relevant HTTP flow; it does not grant business authorization.')
    out.append(make('security-three-gates','Identity, authorization and feature control','ADV-02 ADV-03 ADV-13 ODATA-09 TEST-06','Treat identity, business permission and contextual availability as separate checks.','If Submit is disabled in Fiori, what happens when someone calls the service directly?','Static operation characteristics differ from dynamic instance/global feature checks.',d))

    d=base('One HTTP batch can contain several transaction groups','Think in atomic groups, not in envelopes')
    rect(d,38,115,804,324,HexColor('#e5ebf1'),INK);txt(d,56,410,'HTTP BATCH ENVELOPE',16,bold=True)
    panel(d,61,182,235,181,'Atomic group A','Update order + create item. A failure inside this group prevents partial success within the group.')
    panel(d,324,182,235,181,'Atomic group B','A separate group has its own atomicity boundary. Do not assume group A can roll it back.')
    panel(d,587,182,230,181,'Other request','A read or another request may also appear in the envelope, subject to protocol rules.')
    note(d,'OData V2 changesets and OData V4 atomicity grouping are protocol-specific. Confirm service support and dependencies.')
    out.append(make('odata-batch-envelope','OData batch envelope and atomic groups','ODATA-07 BTP-07 TEST-07','The outer envelope reduces HTTP packaging overhead; it does not establish one universal database transaction.','If a later independent group fails, must an earlier successful group be rolled back?','Conceptual grouping, not an exact multipart or JSON batch payload.',d))

    d=base('Count describes the filtered set; a page is a slice','Example: 100 orders, 23 match, the current page contains 5')
    for i in range(100):
        x=42+(i%20)*20;y=428-(i//20)*23
        d.add(Circle(x,y,6,fillColor=TEAL if i<23 else HexColor('#cdd7da'),strokeColor=None))
    txt(d,480,410,'100 total orders',19,bold=True);txt(d,480,382,'23 match the filter',19,TEAL,True)
    stages=[('Filter','23 matching records'),('Order','Stable and deterministic'),('Page','Skip 10, take 5'),('Return','5 rows + count 23')]
    for i,(title,body) in enumerate(stages):
        x=34+i*212;panel(d,x,148,192,134,title,body)
        if i<3:arrow(d,x+195,215,x+207,215)
    note(d,'Respect requested fields, filters, sorting, paging and count in a custom query provider. Do not count only the returned page.')
    out.append(make('query-page-count','Filtering, paging and total count','ODATA-03 ODATA-04 ADV-10 ODATA-11','Count and paging answer different questions. Stable ordering matters when the client requests successive pages.','For this example, what count belongs beside a page of five records?','Provider-side execution order may be optimized while preserving request semantics.',d))

    d=base('A wrapper changes the contract, not its ancestry','Inspect the dependency behind the clean facade')
    panel(d,40,285,235,150,'Custom consumer','Uses a deliberate interface and depends on its contract.')
    panel(d,322,285,235,150,'Custom wrapper','Can isolate access and provide a stable custom surface.')
    panel(d,605,285,235,150,'SAP dependency','Its actual release status and Clean Core classification still matter.')
    arrow(d,282,357,314,357);arrow(d,564,357,597,357)
    table(d,60,208,760,['Claim','Reality'],[['Released custom surface','Does not retroactively release the SAP object'],['Runs side-by-side','Does not prove every consumed API is released'],['One Level A dependency','Does not classify all other dependencies']], [1.5,2.8],36)
    note(d,'A-D grades are not a one-to-one renaming of the historical three-tier model. Check permitted use in the target edition.')
    out.append(make('clean-core-wrapper','Clean Core wrapper dependency','CORE-04 CORE-05 CORE-07 CORE-08 CORE-11 CORE-14 CORE-15 OO-10','Trace dependencies across the wrapper instead of classifying the solution from its visible surface alone.','What evidence would let you accept a classic SAP dependency responsibly?','A governance review must consider technology restrictions, classifications and lifecycle risk.',d))

    d=base('BTP organization and runtime are different axes','A schematic Cloud Foundry example')
    rect(d,36,124,807,316,HexColor('#e2eaf0'),INK);txt(d,56,409,'GLOBAL ACCOUNT / commercial scope and entitlements',16,bold=True)
    rect(d,58,145,764,231,white,TEAL);txt(d,77,349,'SUBACCOUNT / region, services, trust and subscriptions',15,TEAL,True)
    rect(d,78,169,369,145,PALE);txt(d,93,286,'Cloud Foundry org / space',14,bold=True)
    rect(d,96,190,145,62,white);txt(d,108,215,'Application',15,bold=True)
    rect(d,265,190,161,62,white);txt(d,276,215,'Service instance',14,bold=True)
    arrow(d,245,220,258,220);txt(d,176,264,'binding provides access',12)
    lines(d,478,278,'A service key can support a separate client. Do not assume every service uses the same binding mechanism.',41)
    note(d,'Cloud Foundry spaces do not describe every BTP runtime. Avoid placing service credentials in source control.')
    out.append(make('btp-account-runtime','BTP account and runtime map','BTP-01 BTP-02 BTP-04 BTP-05 BTP-09 BTP-10','Read the nesting as an organizational example, then distinguish the application, service instance and credentials.','How is a service instance different from a binding or service key?','Schematic Cloud Foundry route; other BTP environments have different runtime structures.',d))

    d=base('Remote success cannot be undone by local rollback','Two systems require a recovery design')
    panel(d,43,280,342,157,'System A: local order','Start local work. Send a remote operation. Later local persistence fails.')
    panel(d,493,280,342,157,'System B: remote service','Accept the operation and commit its own change. It owns its transaction.')
    arrow(d,393,356,485,356);txt(d,408,380,'request',13)
    panel(d,43,114,342,124,'Incorrect assumption','Rolling back A also rolls back B. There is no such automatic guarantee.')
    panel(d,493,114,342,124,'Explicit recovery','Use transactional event delivery where supported, idempotency, retries and compensation when needed.')
    note(d,'Define ownership, correlation IDs, monitoring and reconciliation. Do not promise exactly-once delivery without proof.')
    out.append(make('remote-transaction-boundary','Local and remote transaction boundaries','BTP-06 BTP-07 BTP-08 RICEFW-05 RAP-15','The remote commit belongs to another system, so local failure needs an explicit recovery strategy.','What should happen if the remote side succeeds but the response is lost?','This explains distributed consistency, not a particular messaging product guarantee.',d))

    d=base('One business effect, even if the message arrives twice','Idempotency needs a key, a state check and safe persistence')
    table(d,40,386,365,['Delivery','Business event ID'],[['Attempt 1','EVT-204'],['Retry','EVT-204']], [1,1.4],43)
    panel(d,505,266,335,164,'Consumer transaction','Check event identity and current state. Apply an allowed transition and record processing safely together.')
    arrow(d,412,352,497,352)
    table(d,58,190,766,['Current state','Incoming request','Result'],[['Pending / new event','Approve','Apply once'],['Approved / same event','Approve again','Return prior outcome or no-op'],['Changed / stale version','Old approval','Reject or reconcile; do not overwrite']], [1.3,1.2,2.2],36)
    note(d,'A check-then-write race is not solved by an in-memory set. Enforce the concurrency and persistence boundary.')
    out.append(make('event-idempotency','Duplicate events and stale approvals','BTP-08 RICEFW-11 RICEFW-12 RICEFW-13 ADV-11 OO-12','The event identity and current business state decide whether to apply, ignore or reject the request.','Two consumers process the same event simultaneously: what prevents a double effect?','Exact transactional deduplication mechanisms depend on the chosen infrastructure.',d))

    d=base('Different tests produce different evidence','A passing test double does not prove a deployed service works')
    tiers=[(287,365,306,71,'UI / end-to-end','Real consumer and environment'),(197,275,486,71,'Service / integration','Protocol, authorization, persistence'),(108,185,664,71,'BO / contract tests','EML behavior, messages, rollback'),(39,95,802,71,'Focused unit tests','Business rules and useful boundary cases')]
    for i,(x,y,w,h,title,sub) in enumerate(tiers):
        rect(d,x,y,w,h,INK if i%2==0 else TEAL);txt(d,x+17,y+43,title,17,white,True);txt(d,x+17,y+18,sub,13,white)
    note(d,'Record prepared / executed / passed / pending explicitly. Add denied-user, concurrent-update and failure-path cases.')
    out.append(make('test-evidence-pyramid','Testing scope and evidence','TEST-01 TEST-02 TEST-03 TEST-04 TEST-05 TEST-07 TEST-08 TEST-09 TEST-10 OO-14','The widening base suggests many focused checks, but there is no mandatory numerical ratio.','Which risk remains after an ABAP Unit test with doubles passes?','Conceptual coverage map, not a count of tests actually run in SAP.',d))

    d=base('A strong interview answer has a visible chain of evidence','Build a truthful story that an interviewer can follow')
    blocks=[('Context','What business problem and constraints mattered?'),('Decision','What did you choose, and which alternative did you reject?'),('Mechanism','How did the code or architecture produce the behavior?'),('Evidence','What did you measure or test? State actual results.'),('Limit','What remains uncertain, release-specific or incomplete?')]
    for i,(title,body) in enumerate(blocks):
        y=376-i*61;d.add(Circle(58,y+24,20,fillColor=TEAL,strokeColor=None));txt(d,53,y+18,str(i+1),17,white,True)
        rect(d,96,y,742,50);txt(d,111,y+29,title,14,TEAL,True);txt(d,239,y+20,body,13)
    note(d,'Use your own experience. If you only prepared a test or proposed a design, say so explicitly.')
    out.append(make('interview-evidence-story','Explain decisions with evidence','STORY-01 STORY-02 STORY-03 STORY-04 STORY-05 STORY-06 TEST-10','Practice a 60-second version first, then expand the mechanism and evidence when prompted.','Can you name the decision, trade-off and evidence without inventing metrics?','A rehearsal structure, not a scripted personal history or a substitute for technical depth.',d))
    return out
