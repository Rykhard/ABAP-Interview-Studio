// Shared reading layout for learning cards, revealed recall, and quiz feedback.
const visualById=new Map(visuals.map(v=>[v.id,v]));
const visualChoices=new Map();
function questionReferences(q){
 if(!q.references?.length)return '<p class="question-sources personal-source">Personal rehearsal: use evidence from your own projects.</p>';
 const [first,...more]=q.references;
 const link=r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} <span aria-hidden="true">&#8599;</span></a>`;
 return `<div class="question-sources"><span class="source-label">Source</span>${link(first)}${more.length?`<details class="source-more"><summary>${more.length} more sources</summary><ul>${more.map(r=>`<li>${link(r)}<br>${esc(r.note||'Verify the contract for your target release.')}</li>`).join('')}</ul></details>`:''}<details class="source-notes"><summary>Source notes</summary><p>${esc(first.note||'Verify the contract for your target release.')}</p><p>Sources support the concepts; scenario choices and examples are original study material.</p></details></div>`;
}
function seniorRubric(q){return q.level==='Senior'?`<details class="interview-depth"><summary>Go deeper: follow-up questions &amp; senior criteria</summary><div class="rubric"><div class="label">Interviewer follow-up probes</div><ul>${q.followups.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="label">A strong senior answer demonstrates</div><ul>${q.signals.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="label">Verification evidence</div><p>${esc(q.evidence)}</p></div></details>`:'';}
function diagramPanel(q,related){
 const current=related.find(v=>v.id===visualChoices.get(q.id))||related[0];
 return `<div class="visual-heading">Diagram <span>${related.indexOf(current)+1} / ${related.length}</span></div><figure class="visual-preview"><button class="visual-open" data-open-visual="${current.id}" aria-haspopup="dialog" aria-label="Enlarge ${esc(current.title)}"><img loading="lazy" decoding="async" data-visual-image="${current.id}" src="${esc(visualImageSource(current))}" alt="${esc(current.title)}"><span class="enlarge-hint">Enlarge diagram ↗</span></button><figcaption><strong>${esc(current.title)}</strong><p>${esc(current.caption)}</p></figcaption></figure>${related.length>1?`<div class="visual-switcher" role="group" aria-label="Related diagrams">${related.map((v,i)=>`<button data-visual-choice="${v.id}" data-question="${q.id}" aria-pressed="${v.id===current.id}"><span>${i+1}</span>${esc(v.title)}</button>`).join('')}</div>`:''}<details class="visual-notes"><summary>Recall prompt &amp; diagram limits</summary><p><strong>Explain it:</strong> ${esc(current.recall)}</p><p><strong>Limit:</strong> ${esc(current.limit)}</p></details>`;
}
function visualPanel(q,preferCode=false){
 const related=visuals.filter(v=>v.questions.includes(q.id)),examples=codeExamples.filter(example=>example.questions.includes(q.id));
 if(!related.length&&!examples.length)return '';
 const showCode=examples.length&&(!related.length||(explanationModes.get(q.id)||(preferCode?'code':q.defaultExplanation))!=='diagram');
 const picker=examples.length&&related.length?`<div class="explanation-picker" role="group" aria-label="Explanation format"><button data-explanation-mode="code" data-question="${q.id}" aria-pressed="${!!showCode}">Code example</button><button data-explanation-mode="diagram" data-question="${q.id}" aria-pressed="${!showCode}">Diagram</button></div>`:'';
 return `<div class="visual-panel" data-visual-panel="${q.id}">${picker}${showCode?codePanel(q,examples):diagramPanel(q,related)}</div>`;
}
$('view').addEventListener('click',event=>{const button=event.target.closest('[data-explanation-mode]');if(!button)return;const q=byId.get(button.dataset.question);explanationModes.set(q.id,button.dataset.explanationMode);button.closest('[data-visual-panel]').outerHTML=visualPanel(q);document.querySelector(`[data-visual-panel="${q.id}"] [data-explanation-mode="${button.dataset.explanationMode}"]`).focus({preventScroll:true});});
function readingParagraphs(text){
 let output='',steps=[];
 const flush=()=>{if(steps.length){output+=`<ol class="explanation-steps">${steps.map(step=>`<li value="${Number(step[1])}"><strong>${esc(step[2])}</strong><p>${esc(step[3])}</p></li>`).join('')}</ol>`;steps=[];}};
 for(const part of text.split(/\n\s*\n/).map(part=>part.trim()).filter(Boolean)){
  const step=part.match(/^(\d+)\. ([A-Z][A-Z0-9_]+) - ([\s\S]+)$/);
  if(step)steps.push(step);else{flush();output+=`<p>${esc(part)}</p>`;}
 }
 flush();return output;
}
const guidedPositions=new Map();
function questionSteps(q){return q.detail.split(/\n\s*\n/).map(part=>part.trim()).filter(Boolean).map(part=>part.match(/^(\d+)\. ([A-Z][A-Z0-9_]+) - ([\s\S]+)$/)).filter(Boolean);}
function guidedSteps(q,steps){
 const index=Math.min(guidedPositions.get(q.id)||0,steps.length-1),step=steps[index];
 return `<section class="guided-steps" data-guided-question="${q.id}" aria-label="Step-by-step explanation"><div class="guided-heading"><h4>Explore the steps</h4><span>${index+1} / ${steps.length}</span></div><div class="phase-picker" role="group" aria-label="Process steps">${steps.map((item,i)=>`<button data-phase-index="${i}" aria-pressed="${index===i}">${i+1}. ${esc(item[2])}</button>`).join('')}</div><div class="phase-body" aria-live="polite"><strong>${esc(step[2])}</strong><p>${esc(step[3])}</p></div><div class="phase-footer"><button data-phase-index="${index-1}" ${index===0?'disabled':''}>Previous step</button><button data-phase-index="${index+1}" ${index===steps.length-1?'disabled':''}>Next step</button></div><details class="phase-full"><summary>Read all steps together</summary>${readingParagraphs(steps.map(item=>item[0]).join('\n\n'))}</details></section>`;
}
$('view').addEventListener('click',event=>{const button=event.target.closest('[data-phase-index]');if(!button)return;const region=button.closest('[data-guided-question]'),q=byId.get(region.dataset.guidedQuestion),steps=questionSteps(q),index=Number(button.dataset.phaseIndex);if(index<0||index>=steps.length)return;guidedPositions.set(q.id,index);const holder=document.createElement('div');holder.innerHTML=guidedSteps(q,steps);const replacement=holder.firstElementChild;region.replaceWith(replacement);replacement.querySelector(`.phase-picker [data-phase-index="${index}"]`).focus({preventScroll:true});});
function reasoningContent(text){
 const paragraphs=text.split(/\n\s*\n/).filter(part=>part.trim());
 if(paragraphs.length<2||text.length<700)return readingParagraphs(text);
 const visible=paragraphs.length>3?2:1;
 return readingParagraphs(paragraphs.slice(0,visible).join('\n\n'))+`<details class="reasoning-more"><summary>Continue the explanation</summary>${readingParagraphs(paragraphs.slice(visible).join('\n\n'))}</details>`;
}
function readingAnswer(q,view='calm'){const panel=visualPanel(q,view==='developer'),steps=questionSteps(q),guided=steps.length>=3&&!lessonsByQuestion.has(q.id);
 const remainder=steps.length>=3?q.detail.split(/\n\s*\n/).filter(part=>!/^\d+\. [A-Z][A-Z0-9_]+ - /.test(part.trim())).join('\n\n'):q.detail;
 return `<div class="answer reading-layout ${panel?'has-visual':''} ${guided?'has-steps':''}"><div class="answer-summary"><div class="label">The short answer</div>${readingParagraphs(q.answer)}</div>${panel}${guided?guidedSteps(q,steps):''}<div class="answer-reasoning"><div class="label">Reasoning and example</div>${reasoningContent(remainder)}${steps.length>=3&&!guided?`<details class="phase-full"><summary>Read the save phases together</summary>${readingParagraphs(steps.map(item=>item[0]).join('\n\n'))}</details>`:''}<div class="trap"><strong>Avoid this mistake</strong><br>${esc(q.pitfall)}</div>${seniorRubric(q)}</div></div>`;
}
function answer(q){
 const view=selectedStudyView(q);
 const content=view==='guided'?guidedLesson(q)+`<details class="lesson-full-answer"><summary>Read the full answer, code &amp; diagrams</summary>${readingAnswer(q)}</details>`:readingAnswer(q,view)+lessonPreview(q);
 return `<section class="study-experience" data-study-question="${q.id}" data-study-view="${view}">${studyViewToolbar(q,view)}${content}</section>`;
}
let visualZoom=1,visualOpener=null;
function sizeVisual(){const img=$('visualImage'),stage=$('visualStage');if(!img.naturalWidth||!stage.clientWidth)return;const fit=Math.min(stage.clientWidth/img.naturalWidth,stage.clientHeight/img.naturalHeight,1);img.style.width=Math.round(img.naturalWidth*fit*visualZoom)+'px';img.style.height=Math.round(img.naturalHeight*fit*visualZoom)+'px';$('visualZoomLabel').textContent=visualZoom===1?'Fit':Math.round(visualZoom*100)+'% of fit';$('visualZoomOut').disabled=visualZoom===1;$('visualZoomIn').disabled=visualZoom===4;}
function openVisual(id,opener){const v=visualById.get(id);if(!v)return;visualOpener=opener;visualZoom=1;$('visualTitle').textContent=v.title;$('visualCaption').textContent=v.caption;$('visualRecall').textContent=v.recall;$('visualLimit').textContent=v.limit;$('visualOriginal').href=visualImageSource(v);$('visualDownload').href='visuals/'+v.id+'.png';$('visualImage').alt=v.title+'. '+v.caption;$('visualImage').onload=sizeVisual;$('visualImage').dataset.visualImage=v.id;$('visualImage').src=visualImageSource(v);$('visualDetails').open=false;$('visualDialog').showModal();$('visualStage').scrollTo(0,0);sizeVisual();$('closeVisual').focus();}
$('view').addEventListener('click',event=>{const opener=event.target.closest('[data-open-visual]');if(opener){openVisual(opener.dataset.openVisual,opener);return;}const choice=event.target.closest('[data-visual-choice]');if(choice){const q=byId.get(choice.dataset.question);visualChoices.set(q.id,choice.dataset.visualChoice);const panel=choice.closest('[data-visual-panel]');panel.outerHTML=visualPanel(q);document.querySelector(`[data-visual-panel="${q.id}"] [data-visual-choice="${choice.dataset.visualChoice}"]`)?.focus();}});
$('closeVisual').onclick=()=>$('visualDialog').close();
$('visualDialog').addEventListener('close',()=>{if(visualOpener?.isConnected)visualOpener.focus();});
$('visualZoomIn').onclick=()=>{visualZoom=Math.min(4,visualZoom+.5);sizeVisual();};
$('visualZoomOut').onclick=()=>{visualZoom=Math.max(1,visualZoom-.5);sizeVisual();};
$('visualFit').onclick=()=>{visualZoom=1;sizeVisual();$('visualStage').scrollTo(0,0);};
window.addEventListener('resize',()=>{if($('visualDialog').open)sizeVisual();});
