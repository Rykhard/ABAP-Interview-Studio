// Shared reading layout for learning cards, revealed recall, and quiz feedback.
const visualById=new Map(visuals.map(v=>[v.id,v]));
const visualChoices=new Map();
function questionReferences(q){
 if(!q.references?.length)return '<p class="question-sources personal-source">Use evidence from your own projects.</p>';
 const first=q.references[0],link=r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} &#8599;</a>`;
 return `<div class="question-sources">${link(first)}<details class="source-more"><summary>${q.references.length>1?'All sources & notes':'Source notes'}</summary><ul>${q.references.map(r=>`<li>${link(r)}<p>${esc(r.note||'Verify the contract for your target release.')}</p></li>`).join('')}</ul><p>Sources explain the contracts; worked examples are original study material.</p></details></div>`;
}
function seniorRubric(q){return q.level==='Senior'?`<div class="rubric"><div class="label">Interview follow-up questions</div><ul>${q.followups.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="label">What a strong answer covers</div><ul>${q.signals.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="label">How to verify it</div><p>${esc(q.evidence)}</p></div>`:'';}
function diagramPanel(q,related){
 const visual=related.find(v=>v.id===visualChoices.get(q.id))||related[0];
 return `<figure class="diagram-preview"><div class="label">Visual explanation</div>${related.length>1?`<label class="diagram-picker">Choose a diagram<select data-diagram-select data-question="${q.id}">${related.map(v=>`<option value="${v.id}" ${v.id===visual.id?'selected':''}>${esc(v.title)}</option>`).join('')}</select></label>`:''}<button class="diagram-preview-open" data-open-visual="${visual.id}" aria-haspopup="dialog" aria-label="Open readable diagram: ${esc(visual.title)}"><img loading="lazy" data-visual-image="${visual.id}" src="${esc(visualImageSource(visual))}" alt="${esc(visual.title)}"><span>Open readable diagram &nearr;</span></button><figcaption><strong>${esc(visual.title)}</strong><p>${esc(visual.caption)}</p></figcaption></figure>`;
}
function visualPanel(q,preferCode=false){
 const related=visuals.filter(v=>v.questions.includes(q.id)),examples=codeExamples.filter(example=>example.questions.includes(q.id));
 const code=preferCode||selectedStudyView(q)==='developer';
 if(code&&!examples.length||!code&&!related.length)return '';
 return `<div class="visual-panel ${code?'code-panel':'diagram-panel'}" data-visual-panel="${q.id}">${code?codePanel(q,examples):diagramPanel(q,related)}</div>`;
}
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
function readingAnswer(q,view='calm'){
 const panel=visualPanel(q,view==='developer'),parts=q.detail.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean),plain=parts.filter(x=>!/^\d+\. [A-Z][A-Z0-9_]+ - /.test(x)),steps=questionSteps(q);
 const short=plain.length>1&&plain.join(' ').length>700?1:plain.length;
 const more=plain.slice(short).join('\n\n');
 const detail=more||steps.length||q.level==='Senior'?`<details class="answer-details"><summary>More detail &amp; interview follow-ups</summary>${readingParagraphs(more)}${steps.length?readingParagraphs(steps.map(x=>x[0]).join('\n\n')):''}${seniorRubric(q)}</details>`:'';
 return `<div class="answer reading-layout ${panel?'has-visual':''}"><div class="answer-summary"><div class="label">The short answer</div>${readingParagraphs(q.answer)}</div><div class="answer-reasoning"><div class="label">A concrete example</div>${readingParagraphs(plain.slice(0,short).join('\n\n'))}<div class="trap"><strong>Keep in mind</strong><p>${esc(q.pitfall)}</p></div>${detail}</div>${panel}</div>`;
}
function answer(q){
 const view=selectedStudyView(q);
 return `<section class="study-experience" data-study-question="${q.id}" data-study-view="${view}">${studyViewToolbar(q,view)}${view==='guided'?guidedLesson(q):readingAnswer(q,view)}</section>`;
}
let visualZoom=1,visualOpener=null;
function sizeVisual(){const img=$('visualImage'),stage=$('visualStage');if(!img.naturalWidth||!stage.clientWidth)return;const fit=Math.min(stage.clientWidth/img.naturalWidth,stage.clientHeight/img.naturalHeight,1);img.style.width=Math.round(img.naturalWidth*fit*visualZoom)+'px';img.style.height=Math.round(img.naturalHeight*fit*visualZoom)+'px';$('visualZoomLabel').textContent=visualZoom===1?'Fit':Math.round(visualZoom*100)+'% of fit';$('visualZoomOut').disabled=visualZoom===1;$('visualZoomIn').disabled=visualZoom===4;}
function openVisual(id,opener){const v=visualById.get(id);if(!v)return;visualOpener=opener;visualZoom=1;$('visualTitle').textContent=v.title;$('visualCaption').textContent=v.caption;$('visualRecall').textContent=v.recall;$('visualLimit').textContent=v.limit;$('visualOriginal').href=visualImageSource(v);$('visualDownload').href='visuals/'+v.id+'.png';$('visualImage').alt=v.title+'. '+v.caption;$('visualImage').onload=sizeVisual;$('visualImage').dataset.visualImage=v.id;$('visualImage').src=visualImageSource(v);$('visualDetails').open=false;$('visualDialog').showModal();$('visualStage').scrollTo(0,0);sizeVisual();$('closeVisual').focus();}
$('view').addEventListener('click',event=>{const opener=event.target.closest('[data-open-visual]');if(opener){openVisual(opener.dataset.openVisual,opener);return;}const choice=event.target.closest('[data-visual-choice]');if(choice){const q=byId.get(choice.dataset.question);visualChoices.set(q.id,choice.dataset.visualChoice);const panel=choice.closest('[data-visual-panel]');panel.outerHTML=visualPanel(q);document.querySelector(`[data-visual-panel="${q.id}"] [data-visual-choice="${choice.dataset.visualChoice}"]`)?.focus();}});
$('closeVisual').onclick=()=>$('visualDialog').close();
$('view').addEventListener('change',event=>{const select=event.target.closest('[data-diagram-select]');if(!select)return;const q=byId.get(select.dataset.question);visualChoices.set(q.id,select.value);const panel=select.closest('[data-visual-panel]');panel.outerHTML=visualPanel(q);document.querySelector(`[data-visual-panel="${q.id}"] [data-diagram-select]`)?.focus({preventScroll:true});});
$('visualDialog').addEventListener('close',()=>{if(visualOpener?.isConnected)visualOpener.focus();});
$('visualZoomIn').onclick=()=>{visualZoom=Math.min(4,visualZoom+.5);sizeVisual();};
$('visualZoomOut').onclick=()=>{visualZoom=Math.max(1,visualZoom-.5);sizeVisual();};
$('visualFit').onclick=()=>{visualZoom=1;sizeVisual();$('visualStage').scrollTo(0,0);};
window.addEventListener('resize',()=>{if($('visualDialog').open)sizeVisual();});
