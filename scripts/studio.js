'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modules=JSON.parse($('study-data').textContent),visuals=JSON.parse($('visual-data').textContent),tracks=JSON.parse($('track-data').textContent);
const topics=JSON.parse($('topic-data').textContent),topicById=new Map(topics.map(t=>[t.id,t]));
const placement=new Map(topics.flatMap(t=>t.sections.flatMap(section=>section.questionIds.map(id=>[id,{topic:t.id,section:section.id,topicTitle:t.title,sectionTitle:section.title}]))));
const quizzes=JSON.parse($('quiz-data').textContent),quizByQuestion=new Map(quizzes.map(q=>[q.questionId,q]));
const all=modules.flatMap(m=>m.questions.map(q=>({...q,module:m.id,...placement.get(q.id),moduleTitle:placement.get(q.id).topicTitle+' / '+placement.get(q.id).sectionTitle}))),byId=new Map(all.map(q=>[q.id,q]));
const topicQuestions=t=>t.sections.flatMap(section=>section.questionIds.map(id=>byId.get(id)));
let state={},ratings={},mode='learn',libraryList=false,restoringRoute=false,savedOnly=false,lessonLibrary=false;
let answerDefault='answers';const answerOverrides=new Map();
try{const saved=localStorage.getItem('abap-studio-answer-view-v1');if(saved==='questions')answerDefault=saved;}catch{/* View selection also works without storage. */}
const prefs={learn:{search:'',topic:'',section:'',scope:'all',selection:'all'},train:{search:'',topic:'',section:'',scope:'all',selection:'all'}};
try{state=JSON.parse(localStorage.getItem('abap-study-progress-v1')||'{}');ratings=JSON.parse(localStorage.getItem('abap-study-ratings-v2')||'{}');if(!state||typeof state!=='object'||Array.isArray(state))state={};if(!ratings||typeof ratings!=='object'||Array.isArray(ratings))ratings={};}catch{state={};ratings={};$('notice').textContent='Storage is unavailable. Study normally and export progress before closing.';}
function save(){try{localStorage.setItem('abap-study-progress-v1',JSON.stringify(state));localStorage.setItem('abap-study-ratings-v2',JSON.stringify(ratings));}catch{$('notice').textContent='Progress is in memory only and will be lost when this page closes.';}}
function storeFilters(){if(prefs[mode])for(const key of ['search','topic','section','scope','selection'])prefs[mode][key]=$(key).value;}
function sectionOptions(selected=''){const topic=topicById.get($('topic').value);$('section').innerHTML='<option value="">All subtopics</option>'+(topic?topic.sections.map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join(''):'');$('section').disabled=!topic;$('section').value=selected;}
function restoreFilters(){for(const key of ['search','topic','scope','selection'])$(key).value=prefs[mode][key];sectionOptions(prefs[mode].section);}
function questionStatus(q,kind=practiceKind){
 if(kind==='quiz'){const item=quizByQuestion.get(q.id),attempt=item&&quizProgress.attempts[item.id];if(attempt?.tries>0)return attempt.lastCorrect?'complete':'retry';return item&&quizProgress.mastered.includes(item.id)?'complete':'new';}
 if(Number.isInteger(ratings[q.id]))return ratings[q.id]>=2?'complete':'retry';
 return state[q.id]?'complete':'new';
}
function filtered(includeSelection=true){
 const term=$('search').value.trim().toLowerCase(),topic=$('topic').value,section=$('section').value,scope=$('scope').value,selection=$('selection').value,exactId=byId.has(term.toUpperCase());
 return topics.flatMap(topicQuestions).filter(q=>(mode!=='learn'||!savedOnly||savedQuestions.has(q.id))&&(!topic||topic===q.topic)&&(!section||section===q.section)&&(!term||(exactId?q.id.toLowerCase()===term:[q.id,q.question,q.answer,q.detail,q.pitfall,q.moduleTitle,...q.followups||[],...q.signals||[],q.evidence||''].join(' ').toLowerCase().includes(term)))&&(mode==='learn'||((scope==='all'||scope===q.level)&&(!includeSelection||selection==='all'||questionStatus(q)===selection))));
}
function focusDestination(id){const target=id?document.querySelector('#q-'+id+' h3'):$('heading');if(!target)return;target.tabIndex=-1;target.focus({preventScroll:true});if(id)document.querySelector('#q-'+id).scrollIntoView({block:'start'});else window.scrollTo(0,0);animateDestination();}
function setMode(next){storeFilters();mode=next;if(next==='train'){savedOnly=false;lessonLibrary=false;}restoreFilters();render();routeSelection();focusDestination();}
function route(hash,replace=false){if(restoringRoute)return;const next=hash||location.pathname+location.search;if((hash&&location.hash===hash)||(!hash&&!location.hash))return;try{history[replace?'replaceState':'pushState'](null,'',next);}catch{/* Local file contexts may restrict history updates. */}}
function routeSelection(replace=false){const params=new URLSearchParams();if(mode==='train'){params.set('mode','train');params.set('kind',practiceKind);params.set('size',$('sessionLength').value);}else if(lessonLibrary)params.set('view','lessons');else if(savedOnly)params.set('view','saved');else if(libraryList&&!$('topic').value)params.set('view','list');for(const key of (mode==='train'?['topic','section','scope','selection','search']:['topic','section','search'])){const value=$(key).value;if(value&&value!=='all')params.set(key,value);}route(params.size?'#'+params:'',replace);}
function openTopic(id,section=''){lessonLibrary=false;savedOnly=false;if(!topicById.has(id))id='';storeFilters();questionFromSearch=false;mode='learn';prefs.learn={search:'',topic:id,section,scope:'all',selection:'all'};restoreFilters();libraryList=!!id;render();routeSelection();focusDestination();}
function selectTopic(id,section=''){if(mode==='learn'){openTopic(id,section);return;}storeFilters();prefs.train={...prefs.train,search:'',topic:id,section};activeSession=null;restoreFilters();render();routeSelection();focusDestination();}
function openQuestion(id,fromSearch=false){if(!byId.has(id))return;lessonLibrary=false;savedOnly=false;rememberQuestion(id);const q=byId.get(id);storeFilters();questionFromSearch=fromSearch;mode='learn';prefs.learn={search:id,topic:q.topic,section:q.section,scope:'all',selection:'all'};answerOverrides.set(id,true);restoreFilters();libraryList=true;render();route('#q-'+id);focusDestination(id);}
for(const t of topics){const option=document.createElement('option');option.value=t.id;option.textContent=t.title;$('topic').append(option);}
// Original topic glyphs: one 24px grid, consistent strokes and recognizable SAP/ABAP concepts.
const iconPaths={
 cloud:'M6 18H5.5a3.5 3.5 0 0 1 0-7H6a6 6 0 0 1 12 0a3.5 3.5 0 0 1 .5 7H18 M10 12l-3 3 3 3 M14 12l3 3-3 3',
 rap:'M8 3h8v7H8Z M12 10v4 M5.5 17v-3h13v3 M3 17h5v4H3Z M16 17h5v4h-5Z',
 core:'M8.5 7 2 10.5v7L8.5 21l6.5-3.5v-7Z M2 10.5 8.5 14l6.5-3.5 M8.5 14v7 M18 1.5l1 2.5 2.5 1-2.5 1L18 8.5 17 6l-2.5-1L17 4Z',
 cds:'M3 3h8v8H3Z M13 13h8v8h-8Z M3 6.5h8 M13 16.5h8 M7 11v6h6',
 abap:'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z M3 8h18 M9 11l-3 3 3 3 M15 11l3 3-3 3',
 performance:'M21 5.5c0 1.7-4 3-9 3s-9-1.3-9-3 4-3 9-3 9 1.3 9 3Z M3 5.5v12c0 1.7 4 3 9 3s9-1.3 9-3v-12 M13.5 10.5l-4 4h5l-4 4',
 integration:'M2.5 6h5v12h-5Z M16.5 6h5v12h-5Z M8 9h8 M13.5 6.5 16 9l-2.5 2.5 M16 15H8 M10.5 12.5 8 15l2.5 2.5',
 quality:'M8 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3 M8 2h8v4H8Z M8 13l3 3 6-7',
 extension:'M9 7V5a3 3 0 0 1 6 0v2h6v6h-2a3 3 0 0 0 0 6h2v2H3V7Z',
 interview:'M4 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8l-5 4V4a1 1 0 0 1 1-1Z M8 17h8l5 4V9 M7 7h6 M7 10h3'
};
function icon(key){return `<span class="topic-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="${iconPaths[key]||iconPaths.abap}"/></svg></span>`;}
__CODE_APP__
__LESSON_APP__
__READING_APP__
function references(m){return `<details class="references"><summary>Official references for this topic</summary><ul class="small">${m.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')||'<li>Rehearsal prompts: use your own truthful experience.</li>'}</ul></details>`;}
function nav(){const selected=$('topic').value,section=$('section').value;let output=`<button class="nav-home ${!selected&&!savedOnly&&!lessonLibrary?'active':''}" data-topic="" ${!selected&&!savedOnly&&!lessonLibrary?'aria-current="page"':''}>All topics</button><button id="savedQuestionsNav" class="nav-saved ${savedOnly?'active':''}" ${savedOnly?'aria-current="page"':''}>Saved questions <span>${savedQuestions.size}</span></button><button id="guidedLessonsNav" class="nav-saved ${lessonLibrary?'active':''}" ${lessonLibrary?'aria-current="page"':''}>Guided lessons <span>${lessons.length}</span></button>`;for(const t of topics){output+=`<button data-topic="${t.id}" class="nav-topic ${selected===t.id&&!section?'active':''}" ${selected===t.id&&!section?'aria-current="page"':''}>${icon(t.icon)}<span class="nav-title">${esc(t.title)}</span><span class="nav-count">${topicQuestions(t).length}</span></button>`;if(selected===t.id)output+=t.sections.map(x=>`<button data-topic="${t.id}" data-section="${x.id}" class="nav-section ${section===x.id?'active':''}" ${section===x.id?'aria-current="page"':''}>${esc(x.title)} <span class="nav-count">${x.questionIds.length}</span></button>`).join('');}$('segments').innerHTML=output;document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{selectTopic(b.dataset.topic,b.dataset.section||'');document.querySelector('aside').classList.remove('nav-open');$('menuToggle').setAttribute('aria-expanded','false');});}
function breadcrumbs(){const topic=topicById.get($('topic').value),section=topic?.sections.find(x=>x.id===$('section').value);$('breadcrumbs').innerHTML='<button id="homeCrumb">Topics</button>'+(topic?`<span>/</span><button id="topicCrumb">${esc(topic.title)}</button>`:'')+(section?`<span>/</span><span>${esc(section.title)}</span>`:'');$('homeCrumb').onclick=()=>openTopic('');if(topic)$('topicCrumb').onclick=()=>openTopic(topic.id);}
function answerIsOpen(id){return answerOverrides.has(id)?answerOverrides.get(id):answerDefault==='answers';}
function syncAnswerDisplay(){
 const answers=[...document.querySelectorAll('.learning-answer')],opened=answers.filter(d=>d.open).length;
 if(!$('expandAll'))return;const allOpen=answers.length?opened===answers.length:answerDefault==='answers',allClosed=answers.length?opened===0:answerDefault==='questions';
 $('expandAll').setAttribute('aria-pressed',String(allOpen));$('collapseAll').setAttribute('aria-pressed',String(allClosed));
 $('answerState').textContent=allOpen?'All answers shown':allClosed?'Questions only - Select a question to reveal its answer':`Custom view - ${opened} of ${answers.length} answers open`;
}
function setAnswerDisplay(value){answerDefault=value;answerOverrides.clear();try{localStorage.setItem('abap-studio-answer-view-v1',value);}catch{/* Keep the view in memory. */}document.querySelectorAll('.learning-answer').forEach(d=>d.open=value==='answers');syncAnswerDisplay();}
function learn(){
 if(lessonLibrary){renderLessonLibrary();return;}
 const qs=filtered(),topic=topicById.get($('topic').value),showList=savedOnly||libraryList||topic||$('search').value.trim();
 if(!showList){
  const ids=new Set(qs.map(q=>q.id));$('view').innerHTML=`${byId.has(lastQuestion)?`<div class="catalog-continue"><div><span class="small">Continue reading &middot; ${lastQuestion}</span><p>${esc(byId.get(lastQuestion).question)}</p></div><button id="continueReading" class="primary">Continue &rarr;</button></div>`:''}<div class="controls"><p class="subtle">${all.length} questions &middot; ${topics.length} topics</p><span class="spacer"></span><button id="allQuestions">Browse all questions</button></div><div class="grid">${topics.map(t=>{const matched=topicQuestions(t).filter(q=>ids.has(q.id));if(!matched.length)return '';return `<button class="topic-card" data-open="${t.id}">${icon(t.icon)}<strong>${esc(t.title)}</strong><p>${esc(t.description)}</p><span class="section-preview">${t.sections.map(x=>esc(x.title)).join(' &middot; ')}</span><span class="card-count">${matched.length} questions &rarr;</span></button>`;}).join('')}</div>`;
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openTopic(b.dataset.open));$('allQuestions').onclick=()=>{libraryList=true;render();routeSelection();focusDestination();};return;
 }
 const groups=[];for(const t of topics)for(const section of t.sections){const members=qs.filter(q=>q.topic===t.id&&q.section===section.id);if(members.length)groups.push({topic:t,section,questions:members});}
 const exact=qs.length===1&&byId.has($('search').value.trim().toUpperCase())?qs[0]:null;
 if(exact){$('view').innerHTML=focusedQuestion(exact);bindFocusedQuestion(exact);return;}
 $('view').innerHTML=`${exact?`<div class="question-links">${questionFromSearch?'<button id="backSearch">&larr; Back to search results</button>':''}<button id="questionTopic">View this question in its topic</button></div>`:''}<div class="answer-toolbar"><button id="backCatalog">All topics</button><div class="answer-toggle" role="group" aria-label="Answer display"><button id="expandAll" aria-pressed="false">Show all answers</button><button id="collapseAll" aria-pressed="false">Questions only</button></div><button id="practiceSelection" class="primary">Practice these questions</button></div><p id="answerState" class="answer-state" role="status" aria-live="polite"></p>${topic&&!exact?`<div class="topic-sections" role="group" aria-label="Subtopics"><button data-subtopic="" class="${!$('section').value?'active':''}" aria-pressed="${!$('section').value}">All ${topicQuestions(topic).length}</button>${topic.sections.map(x=>`<button data-subtopic="${x.id}" class="${$('section').value===x.id?'active':''}" aria-pressed="${$('section').value===x.id}">${esc(x.title)} &middot; ${x.questionIds.length}</button>`).join('')}</div>`:''}<p class="subtle">${qs.length} ${qs.length===1?'question':'questions'}${topic?' in '+esc(topic.title):' across all topics'}. ${$('search').value?'Filtered by &quot;'+esc($('search').value)+'&quot;. ':''}Answers include diagrams and sources.</p>${qs.length>1?`<details class="question-index-panel"><summary>Jump to a question <span class="small subtle">&middot; sorted by ID</span></summary><div class="question-index">${[...qs].sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true})).map(q=>`<a href="#q-${q.id}" data-jump="${q.id}">${q.id} &mdash; ${esc(q.question)}</a>`).join('')}</div></details>`:''}`+(qs.length?groups.map(g=>`<section class="question-group">${exact?'':`<div class="section-heading"><h3>${topic?'':esc(g.topic.title)+' / '}${esc(g.section.title)}</h3><p class="small subtle">${g.questions.length} questions</p></div>`}${g.questions.map(q=>`<article class="card" id="q-${q.id}"><div class="meta"><a class="question-id" href="#q-${q.id}" data-open-question="${q.id}">${q.id} &nearr;</a>${questionActions(q)}</div><h3 tabindex="-1">${esc(q.question)}</h3>${questionReferences(q)}<details class="learning-answer" data-answer-id="${q.id}" ${answerIsOpen(q.id)?'open':''}><summary>Answer &amp; visual explanation</summary>${answer(q)}</details></article>`).join('')}</section>`).join(''):'<div class="card empty"><h3>No questions in this view</h3><p>Clear the text filter, choose another topic, or use the global search above to search every topic.</p></div>');
 $('backCatalog').onclick=()=>openTopic('');$('expandAll').onclick=()=>setAnswerDisplay('answers');$('collapseAll').onclick=()=>setAnswerDisplay('questions');
 document.querySelectorAll('.learning-answer').forEach(d=>d.addEventListener('toggle',()=>{if(!d.isConnected)return;answerOverrides.set(d.dataset.answerId,d.open);syncAnswerDisplay();}));syncAnswerDisplay();
 document.querySelectorAll('[data-subtopic]').forEach(b=>b.onclick=()=>openTopic(topic.id,b.dataset.subtopic));
 document.querySelectorAll('[data-jump]').forEach(a=>a.onclick=e=>{e.preventDefault();openQuestion(a.dataset.jump);});
 if($('backSearch'))$('backSearch').onclick=()=>openGlobalSearch($('backSearch'));
 if($('questionTopic'))$('questionTopic').onclick=()=>{openTopic(exact.topic);focusDestination(exact.id);};
 $('practiceSelection').onclick=()=>{storeFilters();const ids=filtered().map(q=>q.id);prefs.train={...prefs.learn};activeSession=null;practiceKind='recall';if(savedOnly){savedOnly=false;mode='train';restoreFilters();beginPractice(ids,'recall');}else setMode('train');};
}
function shuffled(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function render(){document.querySelector('main').classList.toggle('in-session',mode==='train'&&!!activeSession);const ready=all.filter(q=>state[q.id]).length;$('readyCount').textContent=ready+' / '+all.length;$('progress').value=ready/all.length*100;const topic=topicById.get($('topic').value),section=topic?.sections.find(x=>x.id===$('section').value);$('heading').textContent=mode==='learn'?(section?section.title:topic?topic.title:'Explore topics'):'Practice';$('intro').textContent=mode==='learn'?(topic?topic.description:'Choose a subject. Explore its questions, examples and visual explanations at any level.'):'Choose a format, practice a short session, then review what needs another attempt.';practiceSetup();for(const x of ['learn','train']){$(x+'Tab').classList.toggle('active',x===mode);$(x+'Tab').setAttribute('aria-pressed',String(x===mode));}$('resumePractice').hidden=mode!=='learn'||!activeSession||activeSession.done;nav();breadcrumbs();if(mode==='learn')learn();else practice();syncCalmView();}
for(const key of ['search','topic','section','scope','selection'])$(key).addEventListener(key==='search'?'input':'change',()=>{if(key==='topic'){sectionOptions();libraryList=!!$('topic').value;}if(mode==='train')activeSession=null;questionFromSearch=false;storeFilters();render();routeSelection(key==='search');});for(const x of ['learn','train'])$(x+'Tab').onclick=()=>setMode(x);
$('clearFilters').onclick=()=>{prefs[mode]={search:'',topic:'',section:'',scope:'all',selection:'all'};restoreFilters();if(mode==='train')activeSession=null;questionFromSearch=false;libraryList=false;savedOnly=false;lessonLibrary=false;$('advancedSettings').open=false;render();routeSelection();};
document.querySelector('.skip-link').onclick=e=>{e.preventDefault();$('mainContent').focus({preventScroll:true});window.scrollTo(0,0);};
$('menuToggle').onclick=()=>{const open=document.querySelector('aside').classList.toggle('nav-open');$('menuToggle').setAttribute('aria-expanded',String(open));};
document.addEventListener('keydown',e=>{if($('visualDialog').open||$('searchDialog').open||$('readingDialog').open||$('codeDialog').open||/INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY|A/.test(e.target.tagName)||mode!=='train'||!activeSession||activeSession.done)return;if(e.key===' '&&activeSession.kind==='recall'&&!activeSession.revealed){e.preventDefault();$('revealPractice')?.click();}});
__SEARCH_APP__
__QUIZ_APP__
__MOTION_APP__
__CALM_APP__
restoreFilters();render();
function loadRoute(focus=false){
 restoringRoute=true;
 try{
  if($('searchDialog').open){searchRouteClosing=true;$('searchDialog').close();}
  const hash=location.hash;if(hash.startsWith('#q-')){try{openQuestion(decodeURIComponent(hash.slice(3)));}catch{/* Ignore malformed external fragments. */}return;}
  const params=new URLSearchParams(hash.slice(1));if(!hash||['topic','mode','search','scope','view'].some(key=>params.has(key))){
   const topic=topicById.get(params.get('topic')),section=topic?.sections.some(x=>x.id===params.get('section'))?params.get('section'):'';
   const nextMode=params.get('mode')==='train'?'train':'learn',nextPrefs={topic:topic?.id||'',section,search:params.get('search')||'',scope:['Core','Advanced','Senior'].includes(params.get('scope'))?params.get('scope'):'all',selection:['new','retry'].includes(params.get('selection'))?params.get('selection'):'all'},nextKind=params.get('kind')==='quiz'?'quiz':'recall';
   if(nextMode==='train'&&activeSession&&(activeSession.kind!==nextKind||['topic','section','search','scope','selection'].some(key=>prefs.train[key]!==nextPrefs[key])))activeSession=null;
   mode=nextMode;savedOnly=mode==='learn'&&params.get('view')==='saved';lessonLibrary=mode==='learn'&&params.get('view')==='lessons';prefs[mode]=nextPrefs;questionFromSearch=false;
   if(mode==='learn'){prefs.learn.scope='all';prefs.learn.selection='all';}else practiceKind=nextKind;
   restoreFilters();$('sessionLength').value=['5','10','20','all'].includes(params.get('size'))?params.get('size'):'10';$('advancedSettings').open=mode==='train'&&(prefs.train.scope!=='all'||!!prefs.train.search);libraryList=!!topic||params.get('view')==='list';render();if(focus)focusDestination();
  }
 }finally{restoringRoute=false;}
}
loadRoute();let routeFrame=0;function locationChanged(){cancelAnimationFrame(routeFrame);routeFrame=requestAnimationFrame(()=>loadRoute(true));}
window.addEventListener('hashchange',locationChanged);window.addEventListener('popstate',locationChanged);
