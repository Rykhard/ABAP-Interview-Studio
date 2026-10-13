// Editorial learning metadata is separate from the historical interview rubrics.
const curriculum=readStudioData('learning-data');
const learningPaths=new Map(curriculum.paths.map(path=>[path.topic,path]));
const learningLevels=new Map(curriculum.levels.map(level=>[level.id,level]));
const learningLevelOrder=[...learningLevels.keys()];
const learningPathRanks=new Map(curriculum.paths.flatMap(path=>path.questionIds.map((id,index)=>[id,index])));
const learningSettings={level:'all',sort:'recommended'};
const visitedQuestions=new Set();
let activeLearningPath='';
try{
 const saved=JSON.parse(localStorage.getItem('abap-studio-learning-v1')||'{}');
 if(saved.level==='all'||learningLevels.has(saved.level))learningSettings.level=saved.level;
 if(saved.sort==='id')learningSettings.sort='id';
 const visited=JSON.parse(localStorage.getItem('abap-studio-visited-v1')||'[]');
 if(Array.isArray(visited))visited.filter(id=>byId.has(id)).forEach(id=>visitedQuestions.add(id));
}catch{/* Learning remains available without browser storage. */}
function learningText(record,key){return record[studioLocale==='ru'?key+'Ru':key];}
function learningLevel(q){return curriculum.questions[q.id].level;}
function learningBadge(q){const level=learningLevels.get(learningLevel(q));return `<span class="learning-badge" title="${esc(learningText(level,'description'))}">${esc(learningText(level,'title'))}</span>`;}
function saveLearningSettings(){saveOptional('abap-studio-learning-v1',JSON.stringify(learningSettings));}
function markQuestionVisited(id){visitedQuestions.add(id);saveOptional('abap-studio-visited-v1',JSON.stringify([...visitedQuestions]));}
function orderedLearningQuestions(questions){
 return [...questions].sort((a,b)=>learningSettings.sort==='id'?a.id.localeCompare(b.id,undefined,{numeric:true}):
  (learningPathRanks.get(a.id)??999)-(learningPathRanks.get(b.id)??999)||learningLevelOrder.indexOf(learningLevel(a))-learningLevelOrder.indexOf(learningLevel(b))||a.id.localeCompare(b.id,undefined,{numeric:true}));
}
function pathQuestionLink(id,path){return `<a href="#q-${id}&path=${path.topic}" data-open-question="${id}" data-learning-path="${path.topic}">${esc(byId.get(id).question)}</a>`;}
function topicStartingPath(topic){
 const path=learningPaths.get(topic.id),seen=path.questionIds.filter(id=>visitedQuestions.has(id)).length;
 const next=path.questionIds.find(id=>!visitedQuestions.has(id))||path.questionIds[0];
 return `<section class="topic-start learning-path" aria-label="Suggested learning path"><div class="topic-start-heading"><h3>${esc(learningText(path,'title'))}</h3><p>${esc(learningText(path,'goal'))}</p></div><div class="learning-path-actions"><button class="primary" data-start-path="${path.topic}" data-path-question="${next}">${seen&&seen<path.questionIds.length?'Continue path':'Explore path'} &rarr;</button><span class="small subtle">${seen} / ${path.questionIds.length} opened &middot; Reading is not a mastery score.</span></div><details><summary>View learning path <span class="small">(${path.questionIds.length})</span></summary><ol>${path.questionIds.map((id,index)=>`<li><span class="topic-start-number">${index+1}</span><div>${pathQuestionLink(id,path)}${learningBadge(byId.get(id))}</div></li>`).join('')}</ol><p class="small subtle">This path includes several levels. Filters apply to the question library below.</p></details></section>`;
}
function learningEntry(){return `<div class="learning-entry" role="group" aria-label="Choose a study goal"><span>What would you like to do?</span><button data-learning-entry="basics">Learn the basics</button><button data-learning-entry="interview">Prepare for an interview</button></div>`;}
function activePathFor(q){const path=learningPaths.get(activeLearningPath);return path?.questionIds.includes(q.id)?path:null;}
function questionSequence(q){
 const path=activePathFor(q);if(path)return path.questionIds;
 const section=topicById.get(q.topic).sections.find(item=>item.id===q.section);
 // Preserve the return selection, including level, when browsing a filtered list.
 const scope=questionReturn?.prefs?.scope||'all';
 const questions=section.questionIds.map(id=>byId.get(id)).filter(item=>scope==='all'||learningLevel(item)===scope||item.id===q.id);
 return orderedLearningQuestions(questions).map(item=>item.id);
}
function learningContext(q){
 const path=activePathFor(q),home=learningPaths.get(q.topic);
 const prerequisiteIds=(home.prerequisites?.[q.id]||[]);
 return `${path?`<p class="learning-context">${esc(learningText(path,'title'))} &middot; ${path.questionIds.indexOf(q.id)+1} / ${path.questionIds.length} <button data-exit-path>Leave path</button></p>`:''}${prerequisiteIds.length?`<details class="learning-prerequisites"><summary>Helpful first</summary><ul>${prerequisiteIds.map(id=>`<li><a href="#q-${id}" data-open-question="${id}" data-prerequisite>${esc(byId.get(id).question)}</a></li>`).join('')}</ul>${path?'<p class="small subtle">Use browser Back to return to this path.</p>':''}</details>`:''}`;
}
function learningCheckpoint(q){
 const path=activePathFor(q);if(!path||path.questionIds.at(-1)!==q.id)return '';
 const check=path.checkpoint;
 return `<section class="learning-checkpoint"><h4>Check your understanding</h4><p>${esc(learningText(check,'prompt'))}</p><details><summary>Compare your explanation</summary><p>${esc(learningText(check,'answer'))}</p></details><p class="small subtle">Explain your reasoning before revealing the answer. Opening a question does not mean you have mastered it.</p><button data-practice-path="${path.topic}">Practice this path</button></section>`;
}
function bindLearningControls(){
 document.querySelectorAll('[data-start-path]').forEach(button=>button.onclick=()=>{activeLearningPath=button.dataset.startPath;openQuestion(button.dataset.pathQuestion);});
 document.querySelectorAll('[data-learning-path]').forEach(link=>link.onclick=event=>{event.preventDefault();activeLearningPath=link.dataset.learningPath;openQuestion(link.dataset.openQuestion);});
 document.querySelectorAll('[data-prerequisite]').forEach(link=>link.onclick=event=>{event.preventDefault();activeLearningPath='';openQuestion(link.dataset.openQuestion);});
 document.querySelector('[data-exit-path]')?.addEventListener('click',()=>{activeLearningPath='';openTopic($('topic').value);});
 document.querySelectorAll('[data-learning-entry]').forEach(button=>button.onclick=()=>{
  if(button.dataset.learningEntry==='basics'){learningSettings.level='Core';learningSettings.sort='recommended';$('learningSort').value='recommended';saveLearningSettings();openTopic('abap');}
  else{openTopic('');prefs.learn.scope='all';restoreFilters();setMode('train');}
 });
 document.querySelector('[data-practice-path]')?.addEventListener('click',event=>{
  const path=learningPaths.get(event.currentTarget.dataset.practicePath);
  setMode('train');prefs.train={search:'',topic:path.topic,section:'',scope:'all',selection:'all'};restoreFilters();
  beginPractice(path.questionIds,'recall');routeSelection();
 });
}
