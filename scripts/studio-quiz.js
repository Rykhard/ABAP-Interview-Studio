// One session builder and one active session; quiz and self-rated progress stay separate.
let practiceKind='recall',activeSession=null;
function emptyQuizProgress(){return {attempts:{},mastered:[]};}
function validatedQuizProgress(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||!value.attempts||typeof value.attempts!=='object'||Array.isArray(value.attempts)||!Array.isArray(value.mastered))throw Error('Invalid quiz progress');
 const known=new Set(quizzes.map(q=>q.id)),result=emptyQuizProgress();
 for(const [id,item] of Object.entries(value.attempts)){
  if(!item||!Number.isInteger(item.tries)||!Number.isInteger(item.correct)||item.tries<0||item.correct<0||item.correct>item.tries||typeof item.lastCorrect!=='boolean')throw Error('Invalid quiz attempt');
  if(known.has(id))result.attempts[id]={tries:item.tries,correct:item.correct,lastCorrect:item.lastCorrect};
 }
 if(value.mastered.some(id=>typeof id!=='string'))throw Error('Invalid mastery list');
 result.mastered=[...new Set(value.mastered.filter(id=>known.has(id)))];return result;
}
let quizProgress=emptyQuizProgress();
try{const stored=localStorage.getItem('abap-study-quiz-v1');if(stored)quizProgress=validatedQuizProgress(JSON.parse(stored));}catch{/* In-memory quiz remains usable if stored data is unavailable. */}
function saveQuiz(){try{localStorage.setItem('abap-study-quiz-v1',JSON.stringify(quizProgress));}catch{$('notice').textContent='Quiz progress is in memory only and will be lost when this page closes.';}}

function practicePool(kind=practiceKind,applySelection=true){
 return filtered(false).filter(q=>(kind!=='quiz'||quizByQuestion.has(q.id))&&(!applySelection||$('selection').value==='all'||questionStatus(q,kind)===$('selection').value));
}
function practiceContext(){const t=topicById.get($('topic').value),sub=t?.sections.find(x=>x.id===$('section').value);return sub?t.title+' / '+sub.title:t?.title||'All topics';}
function plannedCount(count){return $('sessionLength').value==='all'?count:Math.min(count,Number($('sessionLength').value));}
function setPracticeKind(kind){if(activeSession)return;practiceKind=kind;render();routeSelection();}
function practiceSetup(){
 const training=mode==='train';$('learningSortField').hidden=training;const host=training?$('practiceFiltersHost'):$('learnFiltersHost');
 if($('filters').parentElement!==host)host.append($('filters'));
 if(training){if($('search').parentElement!==$('practiceSearchHost'))$('practiceSearchHost').append($('search'));}
 else if($('search').parentElement!==$('filters'))$('filters').prepend($('search'));
 $('practiceSetup').hidden=!training||!!activeSession;
 $('filters').hidden=training&&!!activeSession;
 if(!training||activeSession)return;
 const total=filtered(false).length,mcq=practicePool('quiz',false).length,items=practicePool(),pool=practicePool(practiceKind,false),counts={new:0,retry:0,complete:0};
 pool.forEach(q=>counts[questionStatus(q)]++);
 $('practiceContext').textContent=practiceContext();

 $('recallKind').setAttribute('aria-pressed',String(practiceKind==='recall'));$('quizKind').setAttribute('aria-pressed',String(practiceKind==='quiz'));
 $('coverageText').textContent=practiceKind==='quiz'?`${mcq} of ${total} study questions have authored answer choices. ${total-mcq} more can be practiced aloud.`:`All ${total} study questions are available here. Reveal the model answer, then rate your own explanation.`;
 $('useAllQuestions').hidden=practiceKind!=='quiz'||mcq===total;$('useAllQuestions').textContent='Use all '+total+' in interview practice';
 for(const option of $('selection').options)option.textContent=option.value==='all'?`All questions (${pool.length})`:option.value==='new'?`New questions (${counts.new})`:`Retry mistakes (${counts.retry})`;

 $('advancedLabel').textContent='More settings'+($('scope').value==='all'?'':' · '+$('scope').value)+($('search').value?' · search active':'');
 const count=plannedCount(items.length);$('startPractice').disabled=!count;$('startPractice').textContent=count?`Start ${count}-question session`:'No questions to start';
 $('practiceSummary').textContent=count?`${items.length} questions available${practiceKind==='quiz'?' with answer choices':''}`:$('selection').value==='retry'?'No mistakes to retry in this selection. Choose All questions or another topic.':$('selection').value==='new'?'No new questions in this selection. Choose All questions to repeat them.':'No matching questions. Change the topic or clear the optional filters.';
 $('practiceHelpText').textContent=practiceKind==='quiz'?'New means no submitted quiz attempt. Retry uses your latest incorrect answer, even if an earlier attempt was correct. Earn 10 XP once per correctly answered concept. Quiz scores do not change spoken readiness.':'New means no spoken self-rating. Retry means your latest rating was 0 or 1. Reading alone does not count as an attempt. Your microphone is not recorded and spoken answers are not graded automatically.';
}
function beginPractice(ids,kind=practiceKind,title=practiceContext(),source='library'){
 const unique=[...new Set(ids)].filter(id=>byId.has(id)&&(kind!=='quiz'||quizByQuestion.has(id)));if(!unique.length)return;
 practiceKind=kind;activeSession={kind,ids:shuffled(unique),index:0,answers:{},orders:{},selected:null,revealed:false,done:false,title,source,earnedXp:0};
 if(kind==='quiz')for(const id of activeSession.ids)activeSession.orders[id]=shuffled(quizByQuestion.get(id).options.map(o=>o.id));
 render();routeSelection();focusPractice();
}
function focusPractice(){window.scrollTo(0,0);const target=$('sessionQuestion')||$('resultsTitle');if(target)target.focus({preventScroll:true});animateDestination();}
function nextPractice(){if(!activeSession||activeSession.done)return;if(activeSession.index===activeSession.ids.length-1)activeSession.done=true;else activeSession.index++;activeSession.selected=null;activeSession.revealed=false;render();focusPractice();}
function finishPractice(){if(!activeSession)return;activeSession.done=true;render();focusPractice();}
function checkQuiz(){
 const s=activeSession;if(!s||s.done||s.kind!=='quiz'||!s.selected)return;const id=s.ids[s.index],item=quizByQuestion.get(id);if(s.answers[id])return;
 const correct=s.selected===item.correctOption;s.answers[id]={chosen:s.selected,correct};
 const previous=quizProgress.attempts[item.id]||{tries:0,correct:0,lastCorrect:false};
 quizProgress.attempts[item.id]={tries:previous.tries+1,correct:previous.correct+(correct?1:0),lastCorrect:correct};
 if(correct&&!quizProgress.mastered.includes(item.id)){quizProgress.mastered.push(item.id);s.earnedXp+=10;}
 saveQuiz();render();$('sessionFeedback')?.focus({preventScroll:true});animateEntrance($('sessionFeedback'));
}
function rateRecall(score){
 const s=activeSession;if(!s||s.done||s.kind!=='recall'||!s.revealed||!Number.isInteger(score)||score<0||score>3)return;const id=s.ids[s.index];if(s.answers[id])return;
 s.answers[id]={score,correct:score>=2};ratings[id]=score;if(score>=2)state[id]=true;else delete state[id];save();render();$('sessionFeedback')?.focus({preventScroll:true});animateEntrance($('sessionFeedback'));
}
function sessionProgress(s){return `<div class="session-bar"><div><h3>${s.kind==='quiz'?'Multiple-choice quiz':'Interview practice'}</h3><div class="small subtle">${esc(s.title)}</div></div><button id="finishPractice">Finish session</button></div><div class="session-count">Question ${s.index+1} of ${s.ids.length} · ${Object.keys(s.answers).length} ${s.kind==='quiz'?'answered':'self-rated'}</div><progress class="session-progress" value="${s.index+(s.answers[s.ids[s.index]]?1:0)}" max="${s.ids.length}" aria-label="Session progress"></progress>`;}
function quizQuestion(s,q){
 const item=quizByQuestion.get(q.id),result=s.answers[q.id],options=s.orders[q.id].map(id=>item.options.find(o=>o.id===id));
 const best=item.options.find(o=>o.id===item.correctOption),chosen=result&&item.options.find(o=>o.id===result.chosen);
 const feedback=result?`<div class="quiz-explanation"><h4>Why this answer works</h4><p>${esc(best.explanation)}</p>${!result.correct?`<div class="quiz-correction"><strong>Why your choice falls short</strong><p>${esc(chosen.explanation)}</p></div>`:''}<details class="other-choices"><summary>Compare the other choices</summary>${options.filter(o=>o.id!==item.correctOption).map(o=>`<div><strong>${esc(o.text)}</strong><p>${esc(o.explanation)}</p></div>`).join('')}</details></div>`:'';
 return `<article class="card session-card"><div class="meta">${q.id} &middot; Choose one answer</div><h3 id="sessionQuestion" tabindex="-1">${esc(item.prompt)}</h3>${result?questionReferences(q):''}<div role="group" aria-label="Answer choices">${options.map((o,i)=>`<button class="quiz-option ${!result&&s.selected===o.id?'selected':''} ${result&&o.id===item.correctOption?'correct':''} ${result&&o.id===result.chosen&&!result.correct?'incorrect':''}" data-choice="${o.id}" aria-pressed="${s.selected===o.id}" ${result?'disabled':''}><span class="choice-letter">${'ABCD'[i]}</span>${esc(o.text)}${result&&(o.id===item.correctOption||o.id===result.chosen)?`<span class="choice-status">${o.id===item.correctOption?(o.id===result.chosen?'Your choice &middot; Correct':'Correct answer'):'Your choice &middot; Incorrect'}</span>`:''}</button>`).join('')}</div>${result?`<div id="sessionFeedback" class="session-feedback ${result.correct?'correct':'wrong'}" role="status" tabindex="-1">${result.correct?'Correct. Read why this is the best answer.':'Not quite. Review the explanation, then try again later.'}</div>${feedback}`:''}<div class="session-actions">${result?`<button id="nextPractice" class="primary">${s.index===s.ids.length-1?'See results':'Next question'}</button>`:`<button id="checkQuiz" class="primary" ${s.selected?'':'disabled'}>Check answer</button><button id="skipPractice">Skip for now</button>`}</div>${result?`<details class="review-answer"><summary>Full explanation, code &amp; diagrams</summary>${answer(q)}</details>`:''}</article>`;
}
function recallQuestion(s,q){
 const result=s.answers[q.id],labels=[['Not yet','0 · Missing the mechanism'],['Partial','1 · Needs correction'],['Ready','2 · Correct with an example'],['Strong answer','3 · Trade-off and evidence']];
 return `<article class="card session-card"><div class="meta">${q.id} · Answer aloud</div><h3 id="sessionQuestion" tabindex="-1">${esc(q.question)}</h3>${s.revealed?questionReferences(q):''}${s.revealed?answer(q):'<div class="recall-prompt">Explain your decision, the trade-off and how you would verify it. Then reveal the answer to compare.</div>'}${s.revealed?`<div class="self-rating"><p><strong>How did your explanation compare?</strong></p><div class="self-rating-buttons">${labels.map(([label,hint],i)=>`<button data-score="${i}" aria-pressed="${result?.score===i}" ${result?'disabled':''}><strong>${label}</strong><small>${hint}</small></button>`).join('')}</div></div>`:''}${result?`<div id="sessionFeedback" class="session-feedback" role="status" tabindex="-1">Self-rating saved: ${result.score}/3. ${result.correct?'Marked ready to explain.':'Added to your retry questions.'}</div>`:''}<div class="session-actions">${!s.revealed?'<button id="revealPractice" class="primary">Reveal model answer</button>':''}${result?`<button id="nextPractice" class="primary">${s.index===s.ids.length-1?'See results':'Next question'}</button>`:'<button id="skipPractice">Skip for now</button>'}</div></article>`;
}
function practiceResults(s){
 const answered=s.ids.filter(id=>s.answers[id]),good=answered.filter(id=>s.answers[id].correct),missed=answered.filter(id=>!s.answers[id].correct),unanswered=s.ids.filter(id=>!s.answers[id]);
 const score=s.kind==='quiz'?(answered.length?Math.round(good.length/answered.length*100)+'%':'—'):(answered.length?answered.reduce((n,id)=>n+s.answers[id].score,0)+' / '+answered.length*3:'—');
 $('view').innerHTML=`<section class="session-shell session-results"><h3 id="resultsTitle" tabindex="-1">${unanswered.length?'Session finished':'Session complete'}</h3><p class="subtle">${esc(s.title)} · ${answered.length} of ${s.ids.length} ${s.kind==='quiz'?'answered':'self-rated'}</p><div class="result-metrics"><div><strong>${score}</strong><span>${s.kind==='quiz'?'accuracy on answered questions':'self-rated points'}</span></div><div><strong>${good.length}</strong><span>${s.kind==='quiz'?'correct':'ready to explain'}</span></div><div><strong>${missed.length}</strong><span>to retry</span></div><div><strong>${unanswered.length}</strong><span>not attempted</span></div></div><p class="progress-quiet">${s.kind==='quiz'?`+${s.earnedXp} XP this session · ${quizProgress.mastered.length*10} XP total. Only the first correct answer per concept earns XP.`:'Scores are your own assessment against the model answer; they are not an automatic evaluation.'}</p><div class="result-actions controls"><button id="retrySession" class="primary" ${missed.length?'':'disabled'}>Retry ${missed.length} ${s.kind==='quiz'?(missed.length===1?'mistake':'mistakes'):(missed.length===1?'weak answer':'weak answers')}</button>${unanswered.length?`<button id="continueUnanswered">Practice ${unanswered.length} not attempted</button>`:''}<button id="newSession">New session</button></div><details class="result-review"><summary>Review questions and explanations (${s.ids.length})</summary><div class="result-list">${s.ids.map(id=>{const q=byId.get(id),result=s.answers[id];return `<details class="result-item"><summary><span class="status ${!result?'':result.correct?'correct':'retry'}">${!result?'Not attempted':result.correct?(s.kind==='quiz'?'Correct':'Ready'):'Retry'}</span><span>${q.id} — ${esc(q.question)}</span></summary>${questionReferences(q)}${answer(q)}</details>`;}).join('')}</div></details></section>`;
 $('retrySession').onclick=()=>beginPractice(missed,s.kind,s.title,s.source);if(unanswered.length)$('continueUnanswered').onclick=()=>beginPractice(unanswered,s.kind,s.title,s.source);$('newSession').onclick=()=>{activeSession=null;render();($('startPractice').disabled?$('selection'):$('startPractice')).focus();};
}
function practice(){
 if(!activeSession){$('view').innerHTML='';return;}const s=activeSession;if(s.done){practiceResults(s);return;}const q=byId.get(s.ids[s.index]);
 $('view').innerHTML=`<section class="session-shell">${sessionProgress(s)}${s.kind==='quiz'?quizQuestion(s,q):recallQuestion(s,q)}</section>`;
 $('finishPractice').onclick=finishPractice;if($('nextPractice'))$('nextPractice').onclick=nextPractice;if($('skipPractice'))$('skipPractice').onclick=nextPractice;
 if($('revealPractice'))$('revealPractice').onclick=()=>{s.revealed=true;render();const summary=document.querySelector('.lesson-intro h4')||document.querySelector('.answer-summary');if(summary){summary.tabIndex=-1;summary.focus({preventScroll:true});summary.scrollIntoView({block:'nearest'});}};
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(s.answers[q.id])return;s.selected=b.dataset.choice;render();document.querySelector(`[data-choice="${s.selected}"]`)?.focus({preventScroll:true});});
 if($('checkQuiz'))$('checkQuiz').onclick=checkQuiz;document.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>rateRecall(Number(b.dataset.score)));
}
$('recallKind').onclick=()=>setPracticeKind('recall');$('quizKind').onclick=()=>setPracticeKind('quiz');
$('useAllQuestions').onclick=()=>{$('selection').value='all';storeFilters();setPracticeKind('recall');};
$('sessionLength').onchange=()=>{render();routeSelection();};
$('startPractice').onclick=()=>{const pool=practicePool();beginPractice(shuffled(pool).slice(0,plannedCount(pool.length)).map(q=>q.id));};
