// Authored worked examples change the explanation, process stage and visible data together.
const lessons=JSON.parse($('lesson-data').textContent);
const lessonById=new Map(lessons.map(lesson=>[lesson.id,lesson]));
const lessonsByQuestion=new Map();
for(const lesson of lessons)for(const id of lesson.questions){if(!lessonsByQuestion.has(id))lessonsByQuestion.set(id,[]);lessonsByQuestion.get(id).push(lesson);}
const lessonPositions=new Map(),lessonChoices=new Map(),studyViewChoices=new Map();
try{const stored=JSON.parse(localStorage.getItem('abap-studio-study-views-v1')||'{}');if(stored&&typeof stored==='object'&&!Array.isArray(stored))for(const [id,value] of Object.entries(stored))if(byId.has(id)&&['calm','developer','guided'].includes(value))studyViewChoices.set(id,value);}catch{/* Optional view preferences must not block learning. */}
function availableStudyViews(q){
 const views=[['calm','Explanation']];
 if(codeExamples.some(x=>x.questions.includes(q.id)))views.push(['developer','Code']);
 if(lessonsByQuestion.has(q.id))views.push(['guided','Step by step']);
 return views;
}
function selectedStudyView(q){
 const requested=studyViewChoices.get(q.id)||readingPreference.format||'calm';
 return availableStudyViews(q).some(([key])=>key===requested)?requested:'calm';
}
function studyViewToolbar(q,selected){
 const available=availableStudyViews(q);
 if(available.length===1)return '';
 return `<div class="study-view-toolbar"><div class="study-view-picker" role="group" aria-label="Answer format for ${q.id}">${available.map(([key,label])=>`<button data-study-view="${key}" aria-pressed="${key===selected}">${label}</button>`).join('')}</div></div>`;
}

function saveSequenceFlow(lesson,index){
 const failed=lesson.id==='lesson-rap-save-rejected';
 if(!failed&&lesson.id!=='lesson-rap-save')return '';
 const phases=failed?['FINALIZE','CHECK_BEFORE_SAVE','CLEANUP_FINALIZE','Correct and retry']:['FINALIZE','CHECK_BEFORE_SAVE','Point of no return','ADJUST_NUMBERS','SAVE','CLEANUP'];
 return `<nav class="save-flow ${failed?'is-failure':''}" aria-label="Save sequence"><ol>${phases.map((phase,i)=>`<li class="${i<index?'is-done':''} ${failed&&i===1&&index>=1?'is-rejected':''}">${i?'<span class="save-flow-connector" aria-hidden="true"></span>':''}<button data-lesson-step="${i}" ${i===index?'aria-current="step"':''}><span class="save-flow-dot" aria-hidden="true">${failed&&i===1&&index>=1?'&#10005;':i<index?'&#10003;':i+1}</span><span>${esc(phase)}</span></button></li>`).join('')}</ol>${failed&&index>=1?'<p class="save-flow-stop"><strong>Save stopped before the point of no return.</strong> ADJUST_NUMBERS / SAVE: not executed.</p>':''}</nav>`;
}

function guidedLesson(q){
 const related=lessonsByQuestion.get(q.id),lesson=related.find(x=>x.id===lessonChoices.get(q.id))||related[0];
 const key=q.id+':'+lesson.id,index=Math.min(lessonPositions.get(key)||0,lesson.steps.length-1),step=lesson.steps[index];
 const previous=index?lesson.steps[index-1]:null;
 const changed=state=>!previous||previous.states.find(s=>s.label===state.label)?.value!==state.value;
 return `<section class="lesson-player ${lesson.id.startsWith('lesson-rap-save')?'has-save-flow':''}" data-lesson="${lesson.id}" data-lesson-question="${q.id}" aria-label="${esc(lesson.title)}">
 ${related.length>1?`<label class="lesson-choice-label">Worked example<select data-lesson-choice>${related.map(x=>`<option value="${x.id}" ${x.id===lesson.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select></label>`:''}
 <header class="lesson-intro"><div><h4>${esc(lesson.title)}</h4><p>${esc(lesson.scenario)}</p></div></header>

 ${saveSequenceFlow(lesson,index)}
 <div class="lesson-body"><nav class="lesson-step-list" aria-label="Lesson steps">${lesson.steps.map((item,i)=>`<button data-lesson-step="${i}" ${i===index?'aria-current="step"':''} aria-label="Step ${i+1}: ${esc(item.title)}" title="${esc(item.title)}"><span class="lesson-step-number">${i+1}</span><span class="lesson-step-name">${esc(item.title)}</span></button>`).join('')}</nav>
 <div class="lesson-stage" aria-live="polite" aria-atomic="true"><div class="lesson-step-heading"><span class="lesson-kicker">Step ${index+1} of ${lesson.steps.length}</span><h5>${esc(step.title)}</h5></div><p class="lesson-explanation">${esc(step.explanation)}</p>
 <div class="lesson-state-board"><div class="lesson-state-heading"><strong>Example state</strong><span>${step.active.map(id=>esc(lesson.nodes.find(n=>n.id===id).label)).join(' · ')}</span></div><dl class="lesson-state-values">${step.states.map(state=>`<div class="${changed(state)?'state-changed':''}"><dt>${esc(state.label)}${index&&changed(state)?'<span class="state-update">Changed</span>':''}</dt><dd>${index&&changed(state)?`<span class="state-before">${esc(previous.states.find(s=>s.label===state.label)?.value||'Not set')} <span aria-label="changes to">&rarr;</span></span>`:''}<span>${esc(state.value)}</span></dd></div>`).join('')}</dl></div>
 <div class="lesson-outcome"><span aria-hidden="true">&rarr;</span><p>${esc(step.outcome)}</p></div></div></div>
 <div class="lesson-navigation"><button data-lesson-step="${index-1}" ${index===0?'disabled':''}>&larr; Previous step</button><span>${index+1} / ${lesson.steps.length}</span>${index===lesson.steps.length-1?'<button data-lesson-step="0">Restart example</button>':`<button class="primary" data-lesson-step="${index+1}">Next step &rarr;</button>`}</div>
 ${index===lesson.steps.length-1?`<div class="lesson-takeaway"><strong>Remember</strong><p>${esc(lesson.takeaway)}</p><button data-practice-question="${q.id}">Practice this concept &rarr;</button></div>`:''}
 <details class="lesson-sources"><summary>Scope &amp; sources</summary><p>${esc(lesson.goal)}</p><p>${esc(lesson.limitation)}</p><ul>${lesson.references.map(ref=>`<li><a href="${esc(ref.url)}" target="_blank" rel="noopener">${esc(ref.title)} &#8599;</a></li>`).join('')}</ul></details></section>`;
}
function replaceStudyExperience(region,q,view){
 if(selectedStudyView(q)===view)return;
 const previousTab=region.querySelector('[data-study-view][aria-pressed=true]')?.getBoundingClientRect();
 studyViewChoices.set(q.id,view);saveOptional('abap-studio-study-views-v1',JSON.stringify(Object.fromEntries(studyViewChoices)));

 const holder=document.createElement('div');holder.innerHTML=answer(q);const replacement=holder.firstElementChild;region.replaceWith(replacement);
 replacement.querySelector(`[data-study-view="${view}"]`)?.focus({preventScroll:true});
 animateStudySelection(replacement,previousTab);
}
$('view').addEventListener('click',event=>{
 const choice=event.target.closest('button[data-study-view]');
 if(choice){const region=choice.closest('[data-study-question]'),q=byId.get(region.dataset.studyQuestion);replaceStudyExperience(region,q,choice.dataset.studyView);return;}
 const button=event.target.closest('[data-lesson-step]');if(!button)return;
 const player=button.closest('[data-lesson]'),lesson=lessonById.get(player.dataset.lesson),index=Number(button.dataset.lessonStep);
 if(!Number.isInteger(index)||index<0||index>=lesson.steps.length)return;
 const key=player.dataset.lessonQuestion+':'+lesson.id,previousIndex=lessonPositions.get(key)||0,fromFooter=!!button.closest('.lesson-navigation');
 lessonPositions.set(key,index);
 const holder=document.createElement('div');holder.innerHTML=guidedLesson(byId.get(player.dataset.lessonQuestion));const next=holder.firstElementChild;player.replaceWith(next);
 const focusTarget=fromFooter?(index<previousIndex&&index>0?next.querySelector('.lesson-navigation button:first-child'):next.querySelector('.lesson-navigation button:last-child')):next.querySelector(`.save-flow [data-lesson-step="${index}"],.lesson-step-list [data-lesson-step="${index}"]`);
 focusTarget.focus({preventScroll:true});
 animateLessonStep(next);
 const stage=next.querySelector('.save-flow,.lesson-stage');if(stage.getBoundingClientRect().top<0||stage.getBoundingClientRect().top>innerHeight*.6)stage.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
function openLessonLibrary(){
 storeFilters();mode='learn';lessonLibrary=true;savedOnly=false;libraryList=false;questionFromSearch=false;
 prefs.learn={search:'',topic:'',section:'',scope:'all',selection:'all'};restoreFilters();
 document.querySelector('aside').classList.remove('nav-open');$('menuToggle').setAttribute('aria-expanded','false');
 render();routeSelection();focusDestination();
}
function renderLessonLibrary(){
 const coverage=new Set(lessons.flatMap(lesson=>lesson.questions)).size;
 $('view').innerHTML=`<p class="guided-library-intro">${lessons.length} worked examples linked to ${coverage} questions. Each example shows one scenario, its changing state and the reason for each step. You can switch back to reading or code at any time.</p>`+topics.map(topic=>{
  const related=lessons.filter(lesson=>byId.get(lesson.questions[0]).topic===topic.id);if(!related.length)return '';
  return `<section class="lesson-topic-group"><h3>${esc(topic.title)}</h3><div class="guided-library">${related.map(lesson=>`<article class="guided-library-card"><span class="lesson-kicker">${lesson.steps.length} steps · ${lesson.questions.length} related questions</span><h3>${esc(lesson.title)}</h3><p>${esc(lesson.scenario)}</p><button data-open-lesson="${lesson.id}">Open lesson &rarr;</button></article>`).join('')}</div></section>`;
 }).join('');
}
$('view').addEventListener('click',event=>{
 const button=event.target.closest('[data-open-lesson]');if(!button)return;
 const lesson=lessonById.get(button.dataset.openLesson),id=lesson.questions[0];lessonChoices.set(id,lesson.id);studyViewChoices.set(id,'guided');
 saveOptional('abap-studio-study-views-v1',JSON.stringify(Object.fromEntries(studyViewChoices)));openQuestion(id);
});
$('view').addEventListener('change',event=>{
 const select=event.target.closest('[data-lesson-choice]');if(!select)return;
 const player=select.closest('[data-lesson]'),q=byId.get(player.dataset.lessonQuestion);lessonChoices.set(q.id,select.value);lessonPositions.set(q.id+':'+select.value,0);
 const holder=document.createElement('div');holder.innerHTML=guidedLesson(q);const next=holder.firstElementChild;player.replaceWith(next);next.querySelector('[data-lesson-choice]').focus({preventScroll:true});
});
