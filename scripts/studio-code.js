// Worked examples share the same question IDs in Learn, recall and quiz feedback.
const codeExamples=readStudioData('code-data');
const examplesByQuestion=indexByQuestion(codeExamples);
const codeById=new Map(codeExamples.map(example=>[example.id,example]));
const exampleChoices=new Map(),explanationModes=new Map(),codeSteps=new Map();
const codeKeywords=new Set('define root view entity as select from association composition of on projection provider contract transactional_query expose service extend with managed implementation in class unique strict persistent table draft lock master dependent by authorization instance global etag total create update delete field readonly mandatory numbering mapping validation determination save modify action result side effects affects use internal unmanaged additional static factory features precheck abstract privileged mode read entities local fields all failed reported mapped data final value corresponding for if else endif loop at into assigning endloop append to return commit rollback work import response type request set result check method endmethod constants'.split(' '));
function codeTokens(line,language){
 const pattern=language==='ABAP'?/(".*$|'(?:''|[^'])*'|\b[A-Za-z_][A-Za-z_0-9]*\b)/g:/(\/\/.*$|--.*$|<!--.*?-->|"(?:\\.|[^"\\])*"|'(?:''|[^'])*'|\b[A-Za-z_][A-Za-z_0-9]*\b)/g;
 return line.split(pattern).map(token=>{
  const comment=language==='ABAP'?token.startsWith('"'):/^(\/\/|--|<!--)/.test(token);
  const kind=comment?'comment':/^["']/.test(token)?'string':codeKeywords.has(token.toLowerCase())?'keyword':'';
  return kind?`<span class="code-${kind}">${esc(token)}</span>`:esc(token);
 }).join('');
}
function codeStepExplanation(focus){return `<strong>${focus.lines.length===1?'Line':'Lines'} ${focus.lines.join(', ')}:</strong> ${esc(focus.explanation)}`;}
function codePrerequisite(example){return example.context.match(/^.*?[.!?](?=\s|$)/)?.[0]||example.context;}
function workedCode(example,questionId,expanded=false){
 const key=questionId+':'+example.id,step=codeSteps.get(key)??Math.max(0,example.highlights.findIndex(h=>h.questions?.includes(questionId))),focus=example.highlights[step];
 return `<div class="code-worked" data-code-id="${example.id}" data-code-question="${questionId}" data-code-expanded="${expanded}"><p class="code-intro">${esc(example.intro)}</p><p class="code-placement">${esc(codePrerequisite(example))}</p><div class="code-filebar"><span>${esc(example.language)} · teaching excerpt</span><button class="code-copy" data-copy-code="${example.id}">Copy code</button></div><pre class="code-window" tabindex="0" aria-label="${esc(example.title)} code"><code>${example.code.split('\n').map((line,index)=>`<span class="code-line${focus.lines.includes(index+1)?' code-focus':''}"><span class="code-number" aria-hidden="true" data-line="${index+1}"></span><span>${codeTokens(line,example.language)||' '}</span></span>`).join('')}</code></pre><div class="code-copy-status" role="status" aria-live="polite"></div><div class="code-step-label">Read it step by step</div><div class="code-steps" role="group" aria-label="Highlight and explain code">${example.highlights.map((item,index)=>`<button data-code-step="${index}" aria-pressed="${step===index}"><span>${index+1}</span>${esc(item.label)}</button>`).join('')}</div><p class="code-explanation" aria-live="polite">${codeStepExplanation(focus)}</p><div class="code-outcome"><strong>What happens</strong><p>${esc(example.outcome)}</p></div><details class="code-context"><summary>Setup, limits &amp; sources</summary><p>${esc(example.context)}</p><p>${esc(example.caveat)}</p><ul>${example.references.map(ref=>`<li><a href="${esc(ref.url)}" target="_blank" rel="noopener">${esc(ref.title)} ↗</a></li>`).join('')}</ul></details>${expanded?'':`<button class="code-enlarge" data-enlarge-code="${example.id}" data-code-question="${questionId}" aria-haspopup="dialog">Open larger code view ↗</button>`}</div>`;
}
function codePanel(q,examples){
 const example=examples.find(x=>x.id===exampleChoices.get(q.id))||examples.find(x=>x.startFor?.includes(q.id))||examples[0];
 return `${examples.length>1?`<label class="code-example-label">Worked example<select data-code-choice data-code-question="${q.id}">${examples.map(x=>`<option value="${x.id}"${x.id===example.id?' selected':''}>${esc(x.title)}</option>`).join('')}</select></label>`:`<h4 class="code-example-title">${esc(example.title)}</h4>`}${workedCode(example,q.id)}`;
}
let codeOpener=null;
function openCode(exampleId,questionId,opener){
 const example=codeById.get(exampleId);if(!example)return;
 codeOpener=opener;$('codeTitle').textContent=example.title;$('codeDialogBody').innerHTML=workedCode(example,questionId,true);$('codeDialog').showModal();$('closeCode').focus();
}
async function codeClick(event){
 const enlarge=event.target.closest('[data-enlarge-code]');
 if(enlarge){openCode(enlarge.dataset.enlargeCode,enlarge.dataset.codeQuestion,enlarge);return;}
 const button=event.target.closest('[data-code-step]');
 if(button){
  const region=button.closest('.code-worked'),example=codeById.get(region.dataset.codeId),questionId=region.dataset.codeQuestion,index=Number(button.dataset.codeStep),focus=example.highlights[index];
  if(!focus)return;
  codeSteps.set(questionId+':'+example.id,index);
  region.querySelectorAll('[data-code-step]').forEach(choice=>choice.setAttribute('aria-pressed',String(Number(choice.dataset.codeStep)===index)));
  region.querySelectorAll('.code-line').forEach((line,i)=>line.classList.toggle('code-focus',focus.lines.includes(i+1)));
  region.querySelector('.code-explanation').innerHTML=codeStepExplanation(focus);
  const pre=region.querySelector('pre'),line=region.querySelector('.code-focus');
  pre.scrollTop=Math.max(0,line.offsetTop-pre.clientHeight/2);animateCodeStep(region);return;
 }
 const copy=event.target.closest('[data-copy-code]');
 if(copy){const region=copy.closest('.code-worked'),status=region.querySelector('.code-copy-status'),source=codeById.get(copy.dataset.copyCode).code;region.querySelector('.code-copy-fallback')?.remove();try{await navigator.clipboard.writeText(source);status.textContent='Code copied.';}catch{status.textContent='Automatic copy is unavailable. Press Ctrl+C / Cmd+C to copy the selected code.';const field=document.createElement('textarea');field.className='code-copy-fallback';field.value=source;field.readOnly=true;field.rows=5;field.setAttribute('aria-label','Code selected for manual copy');status.after(field);field.focus();field.select();}}
}
$('view').addEventListener('click',codeClick);
$('codeDialog').addEventListener('click',codeClick);
$('view').addEventListener('change',event=>{const select=event.target.closest('[data-code-choice]');if(!select)return;const q=byId.get(select.dataset.codeQuestion);exampleChoices.set(q.id,select.value);const panel=select.closest('[data-visual-panel]');panel.outerHTML=visualPanel(q);document.querySelector(`[data-visual-panel="${q.id}"] [data-code-choice]`).focus({preventScroll:true});});
$('closeCode').onclick=()=>$('codeDialog').close();
$('codeDialog').addEventListener('close',()=>{if(!codeOpener?.isConnected)return;const region=codeOpener.closest('.code-worked'),example=codeById.get(region.dataset.codeId),holder=document.createElement('div');holder.innerHTML=workedCode(example,region.dataset.codeQuestion);const replacement=holder.firstElementChild;region.replaceWith(replacement);replacement.querySelector('[data-enlarge-code]').focus({preventScroll:true});});
