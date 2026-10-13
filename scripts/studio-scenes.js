// Each scene is a deterministic teaching model. It never sends a business request.
const sceneCopy=JSON.parse($('interactive-data').textContent)[studioLocale];
const interactiveSceneStates=new Map();
const interactiveSceneKinds={
 'lesson-rap-etag':'etag','lesson-internal-tables':'tables',
 'lesson-cds-join-fanout':'join','lesson-http-timeout-retry':'http',
 'lesson-action-grouping':'grouping','lesson-cds-security-stack':'dcl'
};
const sceneDefaults={etag:{first:'ana'},tables:{type:'standard',task:'find'},join:{language:'all'},http:{protection:'protected'},grouping:{grouping:'isolated',validity:'invalid'},dcl:{identity:'A',entry:'base',security:'protected'}};
function resetInteractiveScene(questionId,lessonId){interactiveSceneStates.delete(questionId+':'+lessonId);}
function interactiveSceneState(questionId,lessonId){
 const key=questionId+':'+lessonId;
 if(!interactiveSceneStates.has(key))interactiveSceneStates.set(key,{index:0,...sceneDefaults[interactiveSceneKinds[lessonId]]});
 return interactiveSceneStates.get(key);
}
function sceneText(template,values={}){return String(template).replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??'{'+key+'}'));}
function sceneChoice(name,label,values,selected){
 return `<label class="scene-choice"><span>${esc(label)}</span><select data-scene-option="${name}">${values.map(([value,text])=>`<option value="${value}" ${value===selected?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`;
}
function sceneCard(id,title,body,classes=''){
 return `<section class="scene-card ${classes}" data-scene-node="${id}"><h6>${esc(title)}</h6>${body}</section>`;
}
function sceneValue(label,value){return `<div class="scene-value"><span>${esc(label)}</span><strong data-scene-value="${esc(label)}">${esc(String(value))}</strong></div>`;}
function sceneRoute(from,to,label,reverse=false){return `<div class="scene-route" data-scene-from="${from}" data-scene-to="${to}"><span aria-hidden="true">${reverse?'←':'→'}</span><span>${esc(label)}</span></div>`;}
function sceneStatus(label,type=''){return `<span class="scene-status ${type}">${esc(label)}</span>`;}
function etagScene(state,c){
 const i=state.index,first=state.first,second=first==='ana'?'ben':'ana';
 const quantity={ana:3,ben:4},values={first:c[first],second:c[second],firstQuantity:quantity[first],secondQuantity:quantity[second]};
 const serverQuantity=i===0?2:i===4?quantity[second]:quantity[first],serverVersion=i===0?'V1':i===4?'V3':'V2';
 function client(id){
  const isFirst=id===first,version=isFirst?(i?'V2':'V1'):(i===4?'V3':i===3?'V2':'V1');
  const amount=isFirst?(i?quantity[first]:2):(i===4?quantity[second]:i===3?quantity[first]:2);
  const status=isFirst?(i===4?c.stale:i?c.firstSaved:c.copy):(i===2?c.rejected:i===3?c.refreshed:i===4?c.retrySaved:c.copy);
  return sceneCard(id,c[id],sceneValue(c.quantity,amount)+sceneValue(c.version,version)+sceneStatus(status,i===2&&!isFirst?'is-warning':''));
 }
 let route='';
 if(i===1)route=sceneRoute(first,'server',sceneText(c.firstRequest,values));
 if(i===2)route=sceneRoute(second,'server',sceneText(c.staleRequest,values));
 if(i===3)route=sceneRoute('server',second,sceneText(c.refreshRequest,values));
 if(i===4)route=sceneRoute(second,'server',sceneText(c.retryRequest,values));
 return {controls:sceneChoice('first',c.firstWriter,[['ana',c.ana],['ben',c.ben]],first),
  board:`<div class="scene-participants">${client('ana')}${sceneCard('server',c.server,sceneValue(c.quantity,serverQuantity)+sceneValue(c.version,serverVersion),'is-server')}${client('ben')}</div>${route}`,
  explanation:sceneText(c.explanations[i],values),outcome:i===0?c.initial:i===2?c.rejected:i===3?c.refreshed:i===4?c.retrySaved:c.firstSaved};
}
function tableOperationCode(state,c){
 const key={standard:'STANDARD TABLE OF ty_order WITH EMPTY KEY',sorted:'SORTED TABLE OF ty_order WITH NON-UNIQUE KEY customer id',hashed:'HASHED TABLE OF ty_order WITH UNIQUE KEY id'}[state.type];
 const operations={
  find:['READ TABLE lt_orders INTO DATA(ls_order)',state.type==='hashed'?'  WITH TABLE KEY id = 9.':'  WITH KEY id = 9.','DATA(found) = xsdbool( sy-subrc = 0 ).'],
  customer:["DATA(matches) = 0.","LOOP AT lt_orders INTO DATA(ls_order)","  WHERE customer = 'A'.","  matches += 1.","ENDLOOP."],
  insert:["INSERT VALUE #( id = 7 customer = 'A' amount = 70 )","  INTO TABLE lt_orders.",'DATA(inserted) = xsdbool( sy-subrc = 0 ).']
 };
 const lines=['DATA lt_orders TYPE',`  ${key}.`,...operations[state.task]];
 const active=state.index===0?[0,1]:state.index===1?[2,3]:state.index===2?lines.map((_,index)=>index).filter(index=>index>=2):[lines.length-1];
 return `<div class="scene-code" aria-label="${esc(c.code)}"><span class="scene-code-label">ABAP · ${esc(c.code)}</span><pre><code>${lines.map((line,index)=>`<span data-scene-code-line="${index}" class="${active.includes(index)?'is-current':''}"><span aria-hidden="true">${index+1}</span>${esc(line)}</span>`).join('')}</code></pre><p class="scene-note">${esc(c.fixture)}</p></div>`;
}
function tablesScene(state,c){
 const i=state.index,type=state.type,task=state.task;
 let rows=[{id:9,customer:'B',amount:90},{id:3,customer:'A',amount:30},{id:5,customer:'A',amount:50}];
 if(i>=2&&task==='insert')rows.push({id:7,customer:'A',amount:70});
 if(type==='sorted')rows.sort((a,b)=>a.customer.localeCompare(b.customer)||a.id-b.id);
 const match=row=>i>=2&&(task==='find'?row.id===9:task==='customer'?row.customer==='A':row.id===7);
 const rowMarkup=row=>`<tr data-scene-row="table-${row.id}" class="${match(row)?'is-match':''}"><td>${row.id}</td><td>${row.customer}</td><td>${row.amount}</td></tr>`;
 const key=c[type+'Key'];
 const table=type==='hashed'?`<div class="scene-hash-members">${rows.map(row=>`<div class="scene-member ${match(row)?'is-match':''}" data-scene-row="table-${row.id}"><strong>ID ${row.id}</strong><span>${esc(c.customerLabel)} ${row.customer}</span><span>${esc(c.amount)} ${row.amount}</span></div>`).join('')}</div><p class="scene-note">${esc(c.unordered)}</p>`:`<table class="scene-table"><caption>${esc(key)}</caption><thead><tr><th>${esc(c.id)}</th><th>${esc(c.customerLabel)}</th><th>${esc(c.amount)}</th></tr></thead><tbody>${rows.map(rowMarkup).join('')}</tbody></table>`;
 let access=task==='insert'?c[type+'Insert']:type==='standard'?c.standardAccess:type==='sorted'?(task==='find'?c.sortedFind:c.sortedCustomer):(task==='find'?c.hashedFind:c.hashedCustomer);
 const result=task==='find'?c.found:task==='customer'?c.customerResult:c.insertResult;
 return {controls:sceneChoice('type',c.type,[['standard','STANDARD'],['sorted','SORTED'],['hashed','HASHED']],type)+sceneChoice('task',c.operation,[['find',c.find],['customer',c.customer],['insert',c.insert]],task),
  board:`<div class="scene-table-layout">${sceneCard('task',c[task],tableOperationCode(state,c))}${sceneCard('storage',c.storage,table+`<div class="scene-code-result">${sceneValue(c.result,i<2?c.notRun:task==='customer'?'matches = 2':task==='find'?'found = abap_true':'inserted = abap_true')}${sceneValue(c.rowCount,rows.length)}</div>`,'scene-storage')}</div><div class="scene-route-slot">${i>=1?sceneRoute('task','storage',c[task]):''}</div>`,
  explanation:i===0?c.initial:i===1?access:i===2?result:access,outcome:i>=2?result:key};
}
function joinScene(state,c){
 const i=state.index,language=state.language,languages=language==='all'?['EN','DE']:[language.toUpperCase()];
 const textRows=['EN','DE'].map(lang=>`<div class="scene-record ${i>=1&&languages.includes(lang)?'is-match':''}" data-scene-node="text-${lang}"><strong>4704 · ${lang}</strong><span>${lang==='EN'?'Order':'Auftrag'}</span></div>`).join('');
 const result=i>=2?languages.map(lang=>`<div class="scene-record is-match" data-scene-row="join-${lang}" data-scene-node="result-${lang}"><strong>4704 · ${lang}</strong><span>100</span></div>`).join(''):`<p class="scene-note">${esc(c.empty)}</p>`;
 const explanations=[c.initial,language==='all'?c.matchingAll:sceneText(c.matchingOne,{language:language.toUpperCase()}),language==='all'?c.duplicated:c.single,language==='all'?c.sumAll:c.sumOne];
 return {controls:sceneChoice('language',c.language,[['all',c.unfiltered],['en','EN'],['de','DE']],language),
  board:`<div class="scene-participants">${sceneCard('order',c.order,'<div class="scene-record"><strong>4704</strong><span>100</span></div>')}${sceneCard('texts',c.texts,textRows)}${sceneCard('joined',c.joined,result)}</div>${i===1?sceneRoute('order','texts','JOIN · 4704'):i>=2?languages.map(lang=>sceneRoute('text-'+lang,'result-'+lang,'4704 · '+lang)).join(''):''}<div class="scene-metrics">${sceneValue(c.rows,i>=2?languages.length:'—')}${sceneValue(c.sum,i===3?languages.length*100:'—')}</div>`,explanation:explanations[i],outcome:i===3?explanations[i]:c.steps[i]};
}
function httpScene(state,c){
 const i=state.index,protectedRequest=state.protection==='protected',count=i===0?0:i===3&&!protectedRequest?2:1;
 const status=i===0?c.ready:i===3?c.received:c.unknown;
 const server=sceneValue(c.records,count)+(count?`<div class="scene-record" data-scene-row="R1"><strong>R1</strong><span>4704</span></div>`:'')+(count===2?'<div class="scene-record is-match" data-scene-row="R2"><strong>R2</strong><span>4704</span></div>':'');
 const route=i===1?sceneRoute('client','server',c.post):i===2?sceneRoute('server','lost',c.lost):i===3?sceneRoute('client','server',c.repeat):'';
 return {controls:sceneChoice('protection',c.protection,[['protected',c.protected],['unprotected',c.unprotected]],state.protection),board:`<div class="scene-participants">${sceneCard('client',c.client,sceneStatus(status)+`<p class="scene-note">${esc(c.key)}<br>${esc(c.payload)}</p>`)}<div class="scene-network" data-scene-node="lost"><span aria-hidden="true">${i===2?'×':'↔'}</span><span>${i===2?esc(c.lost):'HTTP'}</span></div>${sceneCard('server',c.server,server,'is-server')}</div>${route}`,
  explanation:i<3?c.explanations[i]:protectedRequest?c.protectedRetry:c.unprotectedRetry,outcome:i===2?c.unknown:i===3?(protectedRequest?c.sameResult:c.duplicate):c.steps[i]};
}
function groupingScene(state,c){
 const i=state.index,shared=state.grouping==='shared',invalid=state.validity==='invalid',common=sceneCopy.common;
 function item(id){
  const bad=invalid&&id==='B',failed=i===3&&invalid&&(shared||bad),requested=bad?-1:11;
  const status=i<2?common.pending:i===2?(bad?c.invalid:c.valid):failed?(bad?common.rejected:c.rolledBack):common.saved;
  const saved=i===3&&!failed?11:10;
  return `<div class="scene-record scene-order ${i===3?(failed?'is-rejected':'is-match'):''}" data-scene-node="order-${id}"><strong>${esc(c.order)} ${id}</strong><div class="scene-order-values">${sceneValue(c.savedQuantity,saved)}${sceneValue(c.tentative,i===0?c.notProposed:i===3?c.cleared:requested)}</div>${sceneStatus(status,bad&&i>=2?'is-warning':'')}</div>`;
 }
 const group=ids=>`<section class="scene-changeset ${i===3&&invalid&&(shared||ids.includes('B'))?'is-rejected':''}" data-scene-group="${ids.join('')}"><h6>${esc(c.group)} ${shared?'':ids[0]}</h6>${ids.map(item).join('')}</section>`;
 const final=invalid?(shared?c.sharedFailure:c.isolatedFailure):c.success;
 const compare=(valid,label)=>`<section class="scene-comparison ${invalid!==valid?'is-current':''}" data-scene-comparison="${valid?'valid':'invalid'}"><h6>${esc(label)}</h6><p>${esc(i<2?c.sameStart:valid?c.branchValid:c.branchInvalid)}</p><strong data-scene-value="comparison">${esc(i<3?c.awaitOutcome:valid?'A 11 · B 11 · C 11':shared?'A 10 · B 10 · C 10':'A 11 · B 10 · C 11')}</strong></section>`;
 const board=`<div class="scene-batch"><span>${esc(c.batch)}</span><div class="scene-groups ${shared?'is-shared':''}">${shared?group(['A','B','C']):['A','B','C'].map(id=>group([id])).join('')}</div></div><div class="scene-outcome-comparison" aria-label="${esc(c.compare)}">${compare(true,c.validBranch)}${compare(false,c.invalidBranch)}</div><p class="scene-note scene-rollback-note">${esc(i===3&&invalid?c.rollbackNote:c.bufferNote)}</p>`;
 return {controls:sceneChoice('grouping',c.grouping,[['isolated','Isolated'],['shared','ChangeSet']],state.grouping)+sceneChoice('validity',c.validity,[['invalid',c.invalid],['valid',c.valid]],state.validity),board,explanation:[c.initial,shared?c.shared:c.isolated,invalid?c.validationInvalid:c.validationValid,final][i],outcome:i===3?final:c.steps[i]};
}
function dclScene(state,c){
 const i=state.index,isBase=state.entry==='base',protectedEntry=isBase||state.security==='protected';
 const path=isBase?c.basePath:protectedEntry?c.exposedPathProtected:c.exposedPathOpen;
 const result=protectedEntry?sceneText(c.filtered,{identity:state.identity}):c.leaked;
 const data=['A','B'].filter(org=>!protectedEntry||org===state.identity).map(org=>`<div class="scene-record is-match" data-scene-row="dcl-${org}"><strong>${org==='A'?'4704':'4705'}</strong><span>${esc(c.salesOrg)} ${org}</span></div>`).join('');
 const rule=isBase?c.baseRule:protectedEntry?c.exposedRule:c.noRule;
 const target=isBase?'base':'exposed';
 return {controls:sceneChoice('identity',c.identity,[['A','A'],['B','B']],state.identity)+sceneChoice('entry',c.entry,[['base',c.base],['exposed',c.exposed]],state.entry)+(!isBase?sceneChoice('security',c.protection,[['protected',c.protected],['unprotected',c.unprotected]],state.security):''),
  board:`<div class="scene-access-path">${sceneCard('consumer',c.consumer,sceneValue(c.identity,state.identity))}${sceneCard('exposed',c.exposed,`<p>${esc(state.security==='protected'?c.exposedRule:c.noRule)}</p>`,!isBase&&i>=1?'is-active':'')}${sceneCard('base',c.base,`<p>${esc(c.baseRule)}</p>`,isBase&&i>=1?'is-active':'')}</div>${i>=1?sceneRoute('consumer',target,isBase?c.base:c.exposed):''}<div class="scene-access-result">${sceneCard('rule',i>=2?rule:c.steps[i],`<p class="scene-note">${esc(!isBase?c.baseIgnored:c.basePath)}</p>`)}${sceneCard('rows',c.rows,i>=3?data:`<p class="scene-note">${esc(sceneText(c.initial,{identity:state.identity}))}</p>`)}</div>${i>=3?sceneRoute(target,'rows',c.rows):''}`,
  explanation:i===0?sceneText(c.initial,{identity:state.identity}):i===1?path:result,outcome:i>=2?result:c.steps[i]};
}
const interactiveSceneRenderers={etag:etagScene,tables:tablesScene,join:joinScene,http:httpScene,grouping:groupingScene,dcl:dclScene};
function interactiveLesson(q,lesson){
 const kind=interactiveSceneKinds[lesson.id];if(!kind)return '';
 const c=sceneCopy[kind],common=sceneCopy.common,state=interactiveSceneState(q.id,lesson.id),i=state.index;
 const scene=interactiveSceneRenderers[kind](state,c),related=lessonsByQuestion.get(q.id)||[];
 return `<section class="lesson-player interactive-scene" data-lesson="${lesson.id}" data-lesson-question="${q.id}" data-scene-kind="${kind}" data-scene-index="${i}" aria-label="${esc(c.title)}">
 ${related.length>1?`<label class="lesson-choice-label">${esc(common.example)}<select data-lesson-choice>${related.map(item=>`<option value="${item.id}" ${item.id===lesson.id?'selected':''}>${esc(item.title)}</option>`).join('')}</select></label>`:''}
 <header class="lesson-intro"><div><span class="lesson-kicker">${esc(common.simulation)}</span><h4>${esc(c.title)}</h4><p>${esc(c.intro)}</p></div></header>
 <div class="scene-controls">${scene.controls}</div>
 <nav class="scene-step-nav" aria-label="${esc(common.steps)}">${c.steps.map((title,index)=>`<button data-scene-step="${index}" ${i===index?'aria-current="step"':''}><span>${index+1}</span>${esc(title)}</button>`).join('')}</nav>
 <div class="scene-stage"><div class="scene-board">${scene.board}</div><div class="scene-commentary" aria-live="polite" aria-atomic="true"><span class="lesson-kicker">${esc(sceneText(common.step,{current:i+1,total:c.steps.length}))}</span><p>${esc(scene.explanation)}</p></div></div>
 <div class="scene-navigation"><button data-scene-action="previous" ${i===0?'disabled':''}>← ${esc(common.previous)}</button><button data-scene-action="replay" ${i===0?'disabled':''}>${esc(common.replay)}</button><button data-scene-action="${i===c.steps.length-1?'restart':'next'}" class="primary">${esc(i===c.steps.length-1?common.restart:common.next)} ${i===c.steps.length-1?'↺':'→'}</button></div>
 ${i===c.steps.length-1?`<p class="scene-takeaway">${esc(c.takeaway)}</p>`:''}
 <details class="lesson-sources"><summary>${esc(common.sources)}</summary><p>${esc(common.scope)} ${esc(c.limits)}</p><ul>${lesson.references.map(ref=>`<li><a href="${esc(ref.url)}" target="_blank" rel="noopener">${esc(ref.title)} ↗</a></li>`).join('')}</ul></details>
 </section>`;
}
function sceneValueKey(value){
 const owner=value.closest('[data-scene-node],[data-scene-comparison]');
 return (owner?.dataset.sceneNode||owner?.dataset.sceneComparison||'scene')+':'+value.dataset.sceneValue;
}
function interactiveSceneSnapshot(player){
 const snapshot=new Map([...player.querySelectorAll('[data-scene-row]')].map(row=>[row.dataset.sceneRow,row.getBoundingClientRect()]));
 snapshot.valuesBefore=new Map([...player.querySelectorAll('[data-scene-value]')].map(value=>[sceneValueKey(value),value.textContent]));
 return snapshot;
}
function animateInteractiveScene(player,previous){
 if(reducedMotion.matches)return;
 const board=player.querySelector('.scene-board'),bounds=board.getBoundingClientRect();
 for(const token of board.querySelectorAll('.scene-moving-token')){for(const animation of token.getAnimations())animation.cancel();token.remove();}
 // A packet or match travels between the named participants; final text is always present.
 for(const route of player.querySelectorAll('[data-scene-from]')){
  const from=player.querySelector(`[data-scene-node="${route.dataset.sceneFrom}"]`),to=player.querySelector(`[data-scene-node="${route.dataset.sceneTo}"]`);if(!from||!to)continue;
  const start=from.getBoundingClientRect(),end=to.getBoundingClientRect();
  const token=document.createElement('span');token.className='scene-moving-token';token.setAttribute('aria-hidden','true');
  token.style.left=(start.left+start.width/2-bounds.left)+'px';token.style.top=(start.top+start.height/2-bounds.top)+'px';board.append(token);
  playMotion(token,[{transform:'translate(-50%,-50%) scale(.8)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.12},{transform:`translate(calc(-50% + ${end.left+end.width/2-start.left-start.width/2}px),calc(-50% + ${end.top+end.height/2-start.top-start.height/2}px)) scale(1)`,opacity:1,offset:.85},{transform:`translate(calc(-50% + ${end.left+end.width/2-start.left-start.width/2}px),calc(-50% + ${end.top+end.height/2-start.top-start.height/2}px)) scale(.6)`,opacity:0}],640,()=>token.remove());
 }
 for(const row of player.querySelectorAll('[data-scene-row]')){
  for(const animation of row.getAnimations())animation.cancel();
  const old=previous?.get(row.dataset.sceneRow),rect=row.getBoundingClientRect();
  const dx=old?old.left-rect.left:0,dy=old?old.top-rect.top:12;
  if(dx||dy||row.matches('.is-match'))playMotion(row,[{transform:`translate(${dx}px,${dy}px)`,backgroundColor:'var(--soft-blue)'},{transform:'translate(0,0)',backgroundColor:row.matches('.is-match')?'var(--soft)':'var(--surface)'}],420);
 }
 for(const value of player.querySelectorAll('[data-scene-value]')){
  if(previous?.valuesBefore?.get(sceneValueKey(value))===value.textContent)continue;
  for(const animation of value.getAnimations())animation.cancel();
  playMotion(value,[{backgroundColor:'var(--soft-blue)',outline:'3px solid var(--soft-blue)'},{backgroundColor:'transparent',outline:'0 solid transparent'}],500);
 }
 for(const line of player.querySelectorAll('.scene-code .is-current')){
  for(const animation of line.getAnimations())animation.cancel();
  playMotion(line,[{backgroundColor:'var(--soft-blue)'},{backgroundColor:'var(--soft)'}],500);
 }
 for(const group of player.querySelectorAll('.scene-changeset')){
  if(!['1','3'].includes(player.dataset.sceneIndex))continue;
  for(const animation of group.getAnimations())animation.cancel();
  playMotion(group,[{outline:'2px solid var(--green)',outlineOffset:'5px'},{outline:'0px solid transparent',outlineOffset:'0px'}],450);
 }
}
// Reconcile the teaching state in place: stable participants keep their identity and focus.
function sceneNodeKey(node){
 if(node.nodeType!==1)return '';
 for(const name of ['data-scene-node','data-scene-row','data-scene-group','data-scene-comparison','data-scene-code-line','data-scene-step','data-scene-option','data-scene-action']){
  if(node.hasAttribute(name))return name+':'+node.getAttribute(name);
 }
 return '';
}
function reconcileSceneNode(current,next){
 if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){current.replaceWith(next.cloneNode(true));return;}
 if(current.nodeType!==1){if(current.textContent!==next.textContent)current.textContent=next.textContent;return;}
 for(const attr of [...current.attributes])if(!next.hasAttribute(attr.name)&&!(attr.name==='open'&&current.tagName==='DETAILS'))current.removeAttribute(attr.name);
 for(const attr of [...next.attributes])if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
 const original=[...current.childNodes],used=new Set();
 [...next.childNodes].forEach((child,index)=>{
  const key=sceneNodeKey(child);
  let match=key?original.find(candidate=>!used.has(candidate)&&sceneNodeKey(candidate)===key):original.find(candidate=>!used.has(candidate)&&!sceneNodeKey(candidate)&&candidate.nodeName===child.nodeName);
  if(match){used.add(match);reconcileSceneNode(match,child);}else{match=child.cloneNode(true);}
  const position=current.childNodes[index];if(position!==match)current.insertBefore(match,position||null);
 });
 for(const child of original)if(!used.has(child)&&child.parentNode===current)child.remove();
 if(current.tagName==='SELECT')current.value=next.value;
}
function replaceInteractiveScene(player,focusSelector,previous){
 const q=byId.get(player.dataset.lessonQuestion),lesson=lessonById.get(player.dataset.lesson),holder=document.createElement('div');
 holder.innerHTML=interactiveLesson(q,lesson);
 for(const token of player.querySelectorAll('.scene-moving-token')){for(const animation of token.getAnimations())animation.cancel();token.remove();}
 const focused=document.activeElement;
 reconcileSceneNode(player,holder.firstElementChild);
 if(!focused?.isConnected||focused.disabled)(player.querySelector(focusSelector)||player.querySelector('[data-scene-action=next],[data-scene-action=restart]'))?.focus({preventScroll:true});
 animateInteractiveScene(player,previous);
}
$('view').addEventListener('click',event=>{
 const button=event.target.closest('[data-scene-step],[data-scene-action]');if(!button||button.disabled)return;
 const player=button.closest('.interactive-scene');if(!player)return;
 const state=interactiveSceneState(player.dataset.lessonQuestion,player.dataset.lesson),kind=interactiveSceneKinds[player.dataset.lesson],last=sceneCopy[kind].steps.length-1;
 const action=button.dataset.sceneAction;
 if(action==='replay'){animateInteractiveScene(player);return;}
 const previous=interactiveSceneSnapshot(player);
 const index=button.hasAttribute('data-scene-step')?Number(button.dataset.sceneStep):action==='next'?state.index+1:action==='previous'?state.index-1:0;
 if(!Number.isInteger(index)||index<0||index>last)return;
 state.index=index;
 const selector=button.hasAttribute('data-scene-step')?`[data-scene-step="${index}"]`:action==='previous'&&index>0?'[data-scene-action=previous]':index===last?'[data-scene-action=restart]':'[data-scene-action=next]';
 replaceInteractiveScene(player,selector,previous);
});
$('view').addEventListener('change',event=>{
 const select=event.target.closest('[data-scene-option]');if(!select)return;
 const player=select.closest('.interactive-scene'),state=interactiveSceneState(player.dataset.lessonQuestion,player.dataset.lesson);
 const previous=interactiveSceneSnapshot(player);
 state[select.dataset.sceneOption]=select.value;state.index=0;
 // A changed option starts an independent run, including a fresh fixture.
 replaceInteractiveScene(player,`[data-scene-option="${select.dataset.sceneOption}"]`,previous);
});

// Library cards describe the on-screen scene rather than its portable companion.
function interactiveLessonOverview(lesson){
 const copy=sceneCopy[interactiveSceneKinds[lesson.id]];
 return copy?{...lesson,title:copy.title,scenario:copy.intro,steps:copy.steps}:lesson;
}
