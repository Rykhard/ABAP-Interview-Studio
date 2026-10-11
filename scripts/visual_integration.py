"""Original HTTP, payload, RFC and operational integration teaching examples."""
from visual_modern import base, panel, table, note, make, txt, rect, arrow, lines, INK, TEAL, AMBER, PALE, white

def build_integration_visuals():
    out=[]
    d=base('Read an HTTP exchange as a contract','Illustrative HTTP/1.1 layout; HTTPS protects the transport')
    panel(d,37,156,389,285,'REQUEST: client to service','')
    panel(d,454,156,389,285,'RESPONSE: service to client','')
    req=['GET /orders/4711 HTTP/1.1','Host: api.example.test','Accept: application/json','','Method + target identify the request.','Accept asks for a representation.','Credentials are intentionally omitted.']
    res=['HTTP/1.1 200 OK','Content-Type: application/json','ETag: "v7"','','{"id":"4711","status":"Open"}','','ETag is an opaque version validator.']
    for x,data in [(53,req),(469,res)]:
        for i,s in enumerate(data):txt(d,x,375-i*26,s,13)
    arrow(d,360,120,525,120);txt(d,60,115,'Transport / HTTP',15,TEAL,True);txt(d,544,115,'Representation / JSON',15,TEAL,True)
    note(d,'REST is an architectural style; JSON and XML are payload formats. OData adds service conventions on top of HTTP.')
    out.append(make('http-message-anatomy','HTTP request and response anatomy','HTTP-01 HTTP-02 HTTP-05 HTTP-06 HTTP-10 ODATA-02','Read the method, target, status and headers before interpreting the body. The sample domain is deliberately non-production.','Which header describes the returned body, and which requests a response format?','A teaching example, not a runnable endpoint. HTTP/2 and HTTP/3 use different wire framing.',d))
    d=base('Same business values, two representation contracts','Do not confuse an identifier with a number or an absent value with null')
    panel(d,35,233,395,211,'JSON example','')
    panel(d,455,233,390,211,'XML example','')
    a=['{','  "id": "0004711",','  "currency": "EUR",','  "amount": "120.50"','}']
    b=['<order id="0004711">','  <currency>EUR</currency>','  <amount>120.50</amount>','</order>']
    for x,data in [(54,a),(474,b)]:
        for i,s in enumerate(data):txt(d,x,376-i*28,s,16)
    table(d,48,168,787,['Case','Required decision'],[['"0004711"','Keep the leading zeros: this is an identifier'],['Missing / null / empty','Specify their meanings, especially for partial updates']], [1.3,3],34)
    note(d,'The amount is a string in this example by contract. Neither JSON nor XML automatically defines business precision or validation.')
    out.append(make('json-xml-values','JSON and XML: values and mapping','HTTP-03 HTTP-07 HTTP-08 HTTP-09 HTTP-12 ABAP-12','These are two explicitly designed representations of the same sample values, not a universal automatic JSON/XML conversion.','What could go wrong if an ABAP mapper converts the identifier to an integer?','XML namespace/schema rules and JSON API types must be defined by the actual interface contract.',d))
    d=base('RFC modes change execution and delivery semantics','Choose the required boundary before choosing the syntax')
    table(d,36,401,808,['Mode','Key idea','Interview distinction'],[
        ['sRFC','Caller waits for the result','Remote call is not local atomicity'],
        ['aRFC','Caller can continue','Collect results; no durable retry by itself'],
        ['tRFC','Transactional delivery unit','Runtime/TID scope; not global ordering'],
        ['qRFC','Queue orders units','Ordering is scoped to configured queues'],
        ['bgRFC','Background units / queues','Check type, configuration and monitoring']], [0.65,1.45,2.3],48)
    lines(d,51,118,'A BAPI is a business interface contract. RFC is a call mechanism. A background job is a scheduling concept.',99,14)
    note(d,'Transport-level guarantees do not prove exactly-once business effects across arbitrary external systems or manually repeated submissions.')
    out.append(make('rfc-mode-comparison','RFC modes and guarantee boundaries','RFC-01 RFC-02 RFC-03 RFC-04 RFC-05 RFC-08 RFC-12','Compare the caller behavior and delivery unit, then name the monitoring and retry owner.','Why does an asynchronous call not automatically become a durable queued transaction?','Classic terminology; API release, runtime availability and transaction rules must be checked for the target.',d))
    d=base('A job can coordinate parallel workers','Scheduled execution and concurrent work are independent design choices')
    panel(d,33,291,221,148,'Scheduled coordinator','Read a stable worklist, partition it and limit the number of active tasks.')
    panel(d,327,350,225,91,'Worker A','Partition 1 / own outcome')
    panel(d,327,239,225,91,'Worker B','Partition 2 / own outcome')
    panel(d,327,128,225,91,'Worker C','Partition 3 / own outcome')
    panel(d,624,251,224,170,'Collect + checkpoint','Handle callbacks and errors. Record completed units. Retry only safe unfinished work.')
    for y in [393,282,171]:arrow(d,261,355,320,y);arrow(d,559,y,618,330)
    lines(d,39,208,'Keep shared locks and hot database rows out of competing partitions.',27,13)
    note(d,'Bound concurrency by available resources. A finished job status does not prove every business item succeeded. WAIT can affect the DB LUW.')
    out.append(make('parallel-job-workers','Parallel processing inside a job','RFC-06 RFC-07 RFC-08 RFC-09 RFC-10 RFC-11 RFC-12','A coordinator schedules bounded independent work and collects explicit outcomes; a scheduler does not create parallelism automatically.','If worker B fails after A commits, what is safe to retry?','Conceptual fan-out/fan-in. Worker session and transaction boundaries require explicit design.',d))
    d=base('IDoc transports a business message; AIF helps operate it','AIF support depends on the configured interface and deployment')
    panel(d,35,282,250,155,'IDoc message','Control record: routing. Data records: segments. Status records: processing history.')
    panel(d,321,282,241,155,'Application processing','Resolve partners and process configuration; map, check and execute business logic.')
    panel(d,600,282,242,155,'Business document','Confirm the actual posting result and preserve correlation to the interface message.')
    arrow(d,291,355,315,355);arrow(d,569,355,594,355)
    rect(d,35,120,807,124,PALE);txt(d,54,216,'AIF: configured monitoring and error-handling layer',18,TEAL,True)
    lines(d,54,186,'Show business keys and errors to authorized recipients. Diagnose and correct the cause, then reprocess through the owning mechanism. Prevent a second business effect.',99,14)
    note(d,'OData is a service protocol, IDoc is a message/interface technology, and AIF is a framework. They are not three interchangeable transports.')
    out.append(make('idoc-aif-lifecycle','IDoc processing and AIF operations','INTF-01 INTF-02 INTF-03 INTF-04 INTF-05 INTF-06 INTF-07 INTF-08 INTF-09 INTF-10 INTF-11 INTF-12 RICEFW-06','Follow the message to the business outcome. The AIF band represents supported configured capabilities, not an obligatory stage for every IDoc.','Before restarting an error, how would you check whether a document already exists?','Do not infer end-to-end business success from a transport hand-off status or assume all interfaces use AIF.',d))
    return out
