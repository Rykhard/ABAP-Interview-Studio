// Appearance and reading preferences are independent of study/practice progress.
const themeMedia=matchMedia('(prefers-color-scheme: dark)');
const savedQuestions=new Set();
let lastQuestion='',readingPreference={size:'17',focus:false,layout:'balanced',format:'calm'};
try{
 const saved=JSON.parse(localStorage.getItem('abap-studio-bookmarks-v1')||'[]');
 if(Array.isArray(saved))saved.filter(id=>byId.has(id)).forEach(id=>savedQuestions.add(id));
 lastQuestion=localStorage.getItem('abap-studio-last-question-v1')||'';
 const options=JSON.parse(localStorage.getItem('abap-studio-reading-v1')||'{}');
 if(options&&typeof options==='object'){if(['17','19','21'].includes(options.size))readingPreference.size=options.size;readingPreference.focus=options.focus===true;if(options.layout==='workspace')readingPreference.layout='workspace';if(options.format==='developer')readingPreference.format='developer';}
}catch{/* Use defaults when optional local preferences are unavailable. */}
function saveOptional(key,value){try{localStorage.setItem(key,value);}catch{$('notice').textContent='This preference is active for this visit. Browser storage is unavailable.';}}
function saveBookmarks(){saveOptional('abap-studio-bookmarks-v1',JSON.stringify([...savedQuestions]));}
function visualImageSource(visual){return document.documentElement.dataset.theme==='dark'&&visual.darkImage?visual.darkImage:visual.image;}
function syncDiagramTheme(){
 document.querySelectorAll('img[data-visual-image]').forEach(img=>{const v=visualById.get(img.dataset.visualImage);if(v)img.src=visualImageSource(v);});
 const current=visualById.get($('visualDialog').dataset.visualId);if(current){$('visualOriginal').href=diagramDownload(current);$('visualDownload').href=diagramDownload(current);}
}
let themeTransitionTimer=0;
function applyTheme(choice,saveChoice=false,animate=false){
 if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('theme-changing');clearTimeout(themeTransitionTimer);themeTransitionTimer=setTimeout(()=>document.documentElement.classList.remove('theme-changing'),240);}
 const root=document.documentElement;root.dataset.themeChoice=choice;
 root.dataset.theme=choice==='system'?(themeMedia.matches?'dark':'light'):choice;
 const dark=root.dataset.theme==='dark';$('themeSwitch').setAttribute('aria-checked',String(dark));$('themeSwitch').title=dark?'Switch to light theme':'Switch to dark theme';$('systemTheme').checked=choice==='system';syncDiagramTheme();
 if(saveChoice)saveOptional('abap-studio-theme-v1',choice);
}
themeMedia.addEventListener('change',()=>{if(document.documentElement.dataset.themeChoice==='system')applyTheme('system',false,true);});
function applyReading(saveChoice=false){
 document.documentElement.style.setProperty('--reading-size',readingPreference.size+'px');
 document.body.classList.toggle('focus-reading',readingPreference.focus);
 // The format belongs to a question; reading settings only control readability.
 $('readingSize').value=readingPreference.size;$('focusReading').checked=readingPreference.focus;
 document.querySelectorAll('[data-default-format]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.defaultFormat===readingPreference.format)));
 document.querySelectorAll('[data-reading-layout]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.readingLayout===readingPreference.layout)));
 if(saveChoice)saveOptional('abap-studio-reading-v1',JSON.stringify(readingPreference));
}
function rememberQuestion(id){lastQuestion=id;saveOptional('abap-studio-last-question-v1',id);}
function questionActions(q){return `<div class="question-toolbar"><button data-save-question="${q.id}" aria-pressed="${savedQuestions.has(q.id)}" aria-label="${savedQuestions.has(q.id)?'Unsave':'Save'} question ${q.id}">${savedQuestions.has(q.id)?'Saved':'Save'}</button></div>`;}
let questionReturn=null;
function captureQuestionReturn(){
 if(restoringRoute||mode!=='learn'||document.querySelector('main.single-question'))return;
 const ids=[...listedQuestionIds];
 storeFilters();questionReturn={prefs:{...prefs.learn},libraryList,savedOnly,lessonLibrary,ids,scrollY:window.scrollY};
}
function returnToQuestions(q){
 activeLearningPath='';
 if(!questionReturn){openTopic(q.topic,q.section);focusDestination(q.id);return;}
 const origin=questionReturn;mode='learn';prefs.learn={...origin.prefs};libraryList=origin.libraryList;savedOnly=origin.savedOnly;lessonLibrary=origin.lessonLibrary;questionFromSearch=false;
 const index=origin.ids.indexOf(q.id),windowKey=origin.ids.join(',');
 if(answerDefault==='answers'&&index>=0)answerWindows.set(windowKey,Math.max(answerWindows.get(windowKey)||20,Math.ceil((index+1)/20)*20));
 restoreFilters();render();routeSelection();
 const target=document.querySelector(`#q-${q.id} .question-row-link, #q-${q.id} h3`)||$('heading');target.focus({preventScroll:true});window.scrollTo({top:origin.scrollY,behavior:'instant'});
}
function openSavedQuestions(){activeLearningPath='';lessonLibrary=false;storeFilters();mode='learn';savedOnly=true;libraryList=true;questionFromSearch=false;prefs.learn={search:'',topic:'',section:'',scope:'all',selection:'all'};document.querySelector('aside').classList.remove('nav-open');$('menuToggle').setAttribute('aria-expanded','false');restoreFilters();render();routeSelection();focusDestination();}
function focusedQuestion(q){
 const sequence=questionSequence(q),position=sequence.indexOf(q.id),next=byId.get(sequence[position+1]);
 return `<div class="question-routebar"><button id="questionTopic">&larr; Back to questions</button>${questionFromSearch?'<button id="backSearch">Search results</button>':''}</div><section class="question-group"><article class="card focused-card" id="q-${q.id}"><div class="meta"><span>${q.id} &middot; ${esc(q.topicTitle)} ${learningBadge(q)}</span>${questionActions(q)}</div><h3 tabindex="-1">${esc(q.question)}</h3>${questionReferences(q)}${learningContext(q)}${answer(q)}${learningCheckpoint(q)}<footer class="question-next-actions"><button data-practice-question="${q.id}">Practice this question</button><div class="route-controls"><button id="previousQuestion" ${position===0?'disabled':''} aria-label="Previous question">&larr;</button><span class="route-position">${position+1} / ${sequence.length}</span><button id="nextQuestion" class="primary" ${position===sequence.length-1?'disabled':''}>${next?'Next question: '+esc(next.question):'End of this sequence'} &rarr;</button></div></footer></article></section>`;
}
function bindFocusedQuestion(q){
 const sequence=questionSequence(q),position=sequence.indexOf(q.id),next=byId.get(sequence[position+1]);
 $('previousQuestion').onclick=()=>openQuestion(sequence[position-1]);
 $('nextQuestion').onclick=()=>openQuestion(sequence[position+1]);
 $('questionTopic').onclick=()=>returnToQuestions(q);
 if($('backSearch'))$('backSearch').onclick=()=>openGlobalSearch($('backSearch'));
}
function syncCalmView(){
 const main=$('mainContent'),qs=mode==='learn'?filtered():[],exact=mode==='learn'&&qs.length===1&&byId.has($('search').value.trim().toUpperCase());
 main.classList.toggle('single-question',!!exact);
 document.body.classList.toggle('practice-focus',mode==='train'&&!!activeSession&&!activeSession.done);
 main.classList.toggle('is-catalog',mode==='learn'&&!lessonLibrary&&!savedOnly&&!libraryList&&!$('topic').value&&!$('search').value.trim());
 $('learnFilters').hidden=mode!=='learn'||lessonLibrary;
 $('filterSummary').textContent=[$('search').value&&!exact?$('search').value:'',$('scope').value!=='all'?learningText(learningLevels.get($('scope').value),'title'):''].filter(Boolean).join(' · ');
 if(lessonLibrary&&mode==='learn'){$('heading').textContent='Guided lessons';$('intro').textContent='Follow a concrete example. See the process stage and data change at each step.';}
 if(savedOnly&&mode==='learn'){$('heading').textContent='Saved questions';$('intro').textContent='Your personal collection. Open a question to read, or practice the collection aloud.';}
 document.querySelectorAll('[data-open-question]').forEach(a=>a.onclick=e=>{if(!isPlainLinkClick(e))return;e.preventDefault();activeLearningPath='';openQuestion(a.dataset.openQuestion);});
 if($('continueReading'))$('continueReading').onclick=()=>openQuestion(lastQuestion);
 bindLearningControls();
}
const appBar=document.querySelector('.app-bar');
const optionsButton=document.createElement('button');optionsButton.id='readingOptions';optionsButton.setAttribute('aria-haspopup','dialog');optionsButton.innerHTML='Reading <span id="focusIndicator">· Focus</span>';
appBar.insertBefore(optionsButton,$('backToTop'));
const themeSwitch=document.createElement('button');themeSwitch.id='themeSwitch';themeSwitch.className='theme-switch';themeSwitch.type='button';themeSwitch.setAttribute('role','switch');themeSwitch.setAttribute('aria-label','Dark theme');themeSwitch.setAttribute('aria-checked','false');
themeSwitch.innerHTML='<span class="theme-thumb" aria-hidden="true"></span><svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 13A8.6 8.6 0 0 1 11 3.5 8.7 8.7 0 1 0 20.5 13Z"/></svg>';
appBar.insertBefore(themeSwitch,$('backToTop'));themeSwitch.onclick=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark',true,true);
const home=document.createElement('button');home.className='focus-home';home.textContent='← Topics';home.onclick=()=>openTopic('');appBar.append(home);
$('readingOptions').onclick=()=>$('readingDialog').showModal();$('closeReading').onclick=()=>$('readingDialog').close();
$('readingDialog').addEventListener('close',()=>$('readingOptions').focus({preventScroll:true}));
$('readingSize').onchange=()=>{readingPreference.size=$('readingSize').value;applyReading(true);};
document.querySelectorAll('[data-default-format]').forEach(button=>button.onclick=()=>{readingPreference.format=button.dataset.defaultFormat;for(const [id,view] of studyViewChoices)if(view!=='guided')studyViewChoices.delete(id);saveOptional('abap-studio-study-views-v1',JSON.stringify(Object.fromEntries(studyViewChoices)));applyReading(true);render();});
$('focusReading').onchange=()=>{readingPreference.focus=$('focusReading').checked;applyReading(true);};
$('systemTheme').onchange=()=>applyTheme($('systemTheme').checked?'system':document.documentElement.dataset.theme,true,true);
document.querySelectorAll('[data-reading-layout]').forEach(button=>button.onclick=()=>{readingPreference.layout=button.dataset.readingLayout;studyViewChoices.clear();saveOptional('abap-studio-study-views-v1','{}');applyReading(true);render();});
$('view').addEventListener('click',event=>{
 const saveButton=event.target.closest('[data-save-question]');
 if(saveButton){const id=saveButton.dataset.saveQuestion;if(savedQuestions.has(id))savedQuestions.delete(id);else savedQuestions.add(id);saveBookmarks();saveButton.setAttribute('aria-pressed',String(savedQuestions.has(id)));saveButton.setAttribute('aria-label',(savedQuestions.has(id)?'Unsave':'Save')+' question '+id);saveButton.textContent=savedQuestions.has(id)?'Saved':'Save';playMotion(saveButton,[{transform:'scale(.96)'},{transform:'scale(1)'}],160);nav();$('savedQuestionsNav').onclick=openSavedQuestions;$('guidedLessonsNav').onclick=openLessonLibrary;if(savedOnly){render();$('savedQuestionsNav').focus();}return;}
 const practiceButton=event.target.closest('[data-practice-question]');
 if(practiceButton){const q=byId.get(practiceButton.dataset.practiceQuestion);storeFilters();prefs.train={search:q.id,topic:q.topic,section:q.section,scope:'all',selection:'all'};mode='train';savedOnly=false;activeSession=null;restoreFilters();beginPractice([q.id],'recall');}
});
applyReading();applyTheme(document.documentElement.dataset.themeChoice||'system');
