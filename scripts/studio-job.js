// Optional, memory-only job matching. Ordinary practice never depends on this service.
(() => {
 const ru=studioLocale==='ru';
 const t=ru?{
  entry:'Подготовиться к вакансии',close:'Закрыть',intro:'Подберите вопросы из нашей библиотеки под конкретную вакансию.',
  privacy:'После нажатия «Подобрать вопросы» текст будет отправлен Cloudflare Workers AI. Удалите персональные и конфиденциальные данные. Текст не сохраняется в приложении.',
  description:'Описание вакансии',count:'Максимум вопросов',find:'Подобрать вопросы',checking:'Проверяем доступность…',loading:'Подбираем вопросы… Это может занять до 30 секунд.',
  preview:'Проверьте подборку',review:'AI может ошибаться. Сопоставьте объяснение с цитатой из вакансии и оставьте подходящие вопросы.',required:'Обязательное требование',preferred:'Желательно',evidence:'Цитата из вакансии',reason:'Почему этот вопрос',
  apply:'Начать практику',replace:'Начало новой практики заменит текущую сессию. Сохранённые оценки останутся.',session:'Подготовка к вакансии',selected:n=>`Выбрано вопросов: ${n}`,empty:'Подходящих вопросов не найдено. Попробуйте описание с конкретными обязанностями и технологиями.',
  invalid_input:'Описание вакансии должно содержать от 30 до 6 000 символов и не более 10 000 байт. Выберите от 1 до 60 вопросов или отключите ограничение количества.',
  context_limit:'Описание слишком велико для модели. Сократите его до ключевых обязанностей и требований.',
  disabled:'Подбор по вакансии пока отключён. Учебные материалы и обычная практика доступны.',
  daily_limit:'Общий дневной лимит AI-подбора на сайте исчерпан. Учебные материалы и обычная практика доступны.',
  rate_limited:'Слишком много запросов за короткое время. Подождите перед следующей попыткой.',busy:'Предыдущий запрос ещё обрабатывается. Подождите перед следующей попыткой.',
  timeout:'Подбор занял слишком много времени. Можно повторить попытку позже; обычная практика доступна.',
  invalid_output:'Не удалось получить надёжную подборку. Вопросы не добавлены. Попробуйте позже или выберите их в библиотеке.',
  unavailable:'Сервис AI-подбора сейчас недоступен. Учебные материалы и обычная практика доступны.',retry:date=>`Повторите после ${date}.`,tomorrow:'Попробуйте снова после обновления дневного лимита.',
 }:{
  entry:'Prepare for a job',close:'Close',intro:'Find questions from our library that fit a particular job.',
  privacy:'Selecting “Find relevant questions” sends this text to Cloudflare Workers AI. Remove personal and confidential information. The description is not saved in the app.',
  description:'Job description',count:'Maximum questions',find:'Find relevant questions',checking:'Checking availability…',loading:'Finding questions… This can take up to 30 seconds.',
  preview:'Review your selection',review:'AI can make mistakes. Compare each reason with the quoted job requirement and keep the questions that fit.',required:'Required',preferred:'Preferred',evidence:'Job requirement',
  apply:'Start interview practice',replace:'Starting new practice replaces your current session. Saved ratings remain.',session:'Job preparation',selected:n=>`${n} questions selected`,empty:'No relevant questions found. Try a description with specific responsibilities and technologies.',
  invalid_input:'Enter a job description of 30 to 6,000 characters and at most 10,000 bytes. Choose between 1 and 60 questions or turn off the question limit.',
  context_limit:'This description exceeds the model’s context allowance. Shorten it to the key responsibilities and requirements.',
  disabled:'Job matching is currently disabled. Learning and ordinary practice remain available.',
  daily_limit:'The site’s shared daily AI allowance has been used. Learning and ordinary practice remain available.',
  rate_limited:'Too many requests in a short time. Wait before trying again.',busy:'A previous request is still being processed. Wait before trying again.',
  timeout:'Matching took too long. You can try again later; ordinary practice remains available.',
  invalid_output:'A reliable selection could not be produced. No questions were added. Try later or choose questions from the library.',
  unavailable:'AI matching is currently unavailable. Learning and ordinary practice remain available.',retry:date=>`Try again after ${date}.`,tomorrow:'Try again when the daily allowance resets.',
 };
 const extra=ru?{entry:'ИИ-подбор вопросов',hint:'Вопросы под вашу вакансию',name:'Название подборки',save:'Сохранить подборку',saved:'Сохранено в «Мои подборки».',open:'Мои подборки',local:'Сохраняются только название и выбранные вопросы — в этом браузере.',details:'Расход запроса',unknown:'Провайдер не вернул данные о токенах.',tokens:'Токены: вход / выход / всего',shared:'Общий лимит сайта на сегодня',remaining:'Осталось',reset:'Обновление',quotaNote:'Лимит попыток общий для посетителей. Неудачные вызовы тоже учитываются. Бесплатная квота AI может закончиться раньше: расход зависит от размера запроса и ответа.'}:{entry:'AI question assistant',hint:'Questions matched to your job',name:'Collection name',save:'Save collection',saved:'Saved to My collections.',open:'My collections',local:'Only the title and selected questions are saved, in this browser.',details:'Request usage',unknown:'The provider did not return token usage.',tokens:'Tokens: input / output / total',shared:'Shared site allowance today',remaining:'Remaining',reset:'Resets',quotaNote:'Attempt limit shared by all visitors. Failed calls also count. The free AI quota may run out sooner: usage depends on request and response size.'};
 const entry=document.createElement('button');
 entry.id='prepareJob';entry.type='button';entry.className='job-entry';entry.innerHTML=`<svg class="assistant-icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8H4v16h15v-2M8 5h12v15H8zM11 11h6m-6 4h4"/><path class="assistant-spark" d="m22 2 1.3 3.7L27 7l-3.7 1.3L22 12l-1.3-3.7L17 7l3.7-1.3z"/></svg><span>${esc(extra.entry)}<small>${esc(extra.hint)}</small></span>`;entry.setAttribute('aria-haspopup','dialog');
 document.querySelector('.app-bar').append(entry);
 const sessionEntry=entry.cloneNode(true);sessionEntry.id='prepareJobSession';sessionEntry.className='job-session-entry';
 document.querySelector('.app-bar').append(sessionEntry);
 let dialog,form,description,count,status,find,preview,list,apply,selection,replace;
 let controller=null,requestVersion=0,pending=false,pendingMethod='',available=false,matches=[];
 function notify(message,error=false){status.textContent=message;status.dataset.error=String(error);}
 function discardPreview(){matches=[];if(preview){preview.hidden=true;list.replaceChildren();$('jobSaveStatus').textContent='';$('jobUsage').hidden=true;}}
 function updateSelection(){const total=list.querySelectorAll('input:checked').length;selection.textContent=t.selected(total);apply.disabled=total===0;$('saveJobCollection').disabled=total===0||!$('jobCollectionName').value.trim();$('jobSaveStatus').textContent='';}
 function busy(value){if(dialog){dialog.setAttribute('aria-busy',String(value));$('jobProgress').hidden=!value;}entry.dataset.busy=sessionEntry.dataset.busy=String(value);}
 function cancel(){requestVersion++;controller?.abort();controller=null;pending=false;pendingMethod='';busy(false);}
 function showQuota(quota){
  if(!quota||!Number.isSafeInteger(quota.remaining)||!Number.isSafeInteger(quota.limit)||quota.remaining<0||quota.remaining>quota.limit)return;
  const date=new Date(quota.resetAt);$('jobQuota').textContent=`${extra.shared}: ${extra.remaining.toLowerCase()} ${quota.remaining} / ${quota.limit}.`+(!Number.isNaN(date.getTime())?` ${extra.reset}: ${new Intl.DateTimeFormat(ru?'ru-RU':'en',{dateStyle:'short',timeStyle:'short'}).format(date)}.`:'');
  $('jobQuotaInfo').hidden=false;
 }
 function showUsage(usage){const keys=['prompt_tokens','completion_tokens','total_tokens'];$('jobUsageText').textContent=keys.some(key=>Number.isSafeInteger(usage?.[key])&&usage[key]>=0)?`${extra.tokens}: `+keys.map(key=>Number.isSafeInteger(usage?.[key])&&usage[key]>=0?usage[key].toLocaleString(ru?'ru':'en'):'—').join(' / '):extra.unknown;$('jobUsage').hidden=false;}
 function errorMessage(error){
  const code=Object.hasOwn(t,error?.code)&&typeof t[error.code]==='string'?error.code:'unavailable';
  let message=t[code];
  const reset=error?.retryAt&&new Date(error.retryAt);
  if(reset&&!Number.isNaN(reset.getTime()))message+=' '+t.retry(new Intl.DateTimeFormat(ru?'ru-RU':'en',{dateStyle:'medium',timeStyle:'short'}).format(reset));
  else if(code==='daily_limit')message+=' '+t.tomorrow;
  return message;
 }
 async function request(method,body){
  cancel();const version=requestVersion;controller=new AbortController();const current=controller;pending=true;pendingMethod=method;find.disabled=true;busy(method==='POST');
  let timedOut=false;const timer=setTimeout(()=>{timedOut=true;current.abort();},method==='POST'?30000:8000);
  try{
   if(!/^https?:$/.test(location.protocol))throw {code:'unavailable'};
   const response=await fetch('/api/prepare-job',{method,signal:current.signal,credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
   const result=await response.json().catch(()=>{throw {code:'unavailable'};});
   if(version!==requestVersion||!dialog.open)return null;
   showQuota(result?.quota);
   if(!response.ok||result?.error)throw result?.error||{code:'unavailable'};
   return result;
  }catch(error){
   if(version!==requestVersion||!dialog.open)return null;
   if(['disabled','daily_limit'].includes(error?.code))available=false;
   notify(errorMessage(timedOut?{code:'timeout'}:error),true);return null;
  }finally{
   clearTimeout(timer);
   if(version===requestVersion){pending=false;pendingMethod='';controller=null;find.disabled=!available;busy(false);}
  }
 }
 function showMatches(result,source,maximum){
  const rows=result?.matches;
  if(!Array.isArray(rows)||rows.length>(maximum??60)||new Set(rows.map(row=>row?.id)).size!==rows.length||rows.some(row=>!row||!byId.has(row.id)||!['required','preferred'].includes(row.requirement_type)||typeof row.relevance_reason!=='string'||!row.relevance_reason.trim()||typeof row.requirement_evidence!=='string'||!row.requirement_evidence.trim()||!source.includes(row.requirement_evidence))){notify(t.invalid_output,true);return;}
  rows.sort((a,b)=>topics.findIndex(t=>t.id===byId.get(a.id).topic)-topics.findIndex(t=>t.id===byId.get(b.id).topic)||Number(a.requirement_type==='preferred')-Number(b.requirement_type==='preferred'));
  matches=rows;
  if(!rows.length){notify(t.empty);return;}
  list.replaceChildren();
  let previousTopic='';
  rows.forEach((row,index)=>{
   const topic=byId.get(row.id).topic;if(topic!==previousTopic){const heading=document.createElement('li');heading.className='job-topic-heading';const title=document.createElement('h4');title.textContent=byId.get(row.id).topicTitle;heading.append(title);list.append(heading);previousTopic=topic;}
   const card=document.createElement('li');card.className='job-match';
   const label=document.createElement('label'),checkbox=document.createElement('input'),content=document.createElement('span');
   checkbox.type='checkbox';checkbox.checked=true;checkbox.value=row.id;checkbox.id=`job-match-${index}`;checkbox.addEventListener('change',updateSelection);
   const meta=document.createElement('span');meta.className='job-match-meta';meta.textContent=`${row.id} · ${t[row.requirement_type]}`;
   const title=document.createElement('strong');title.textContent=byId.get(row.id).question;
   content.append(meta,title);label.append(checkbox,content);
   const reason=document.createElement('p');reason.className='job-match-reason';reason.textContent=row.relevance_reason;
   const quote=document.createElement('blockquote');quote.textContent=row.requirement_evidence;quote.setAttribute('aria-label',t.evidence);
   card.append(label,reason,quote);list.append(card);
  });
  $('jobCollectionName').value=t.session+' · '+new Intl.DateTimeFormat(ru?'ru':'en',{dateStyle:'short'}).format(new Date());
  replace.hidden=!activeSession;preview.hidden=false;notify('');updateSelection();$('jobPreviewTitle').focus();
 }
 function buildDialog(){
  dialog=document.createElement('dialog');dialog.id='jobDialog';dialog.setAttribute('aria-labelledby','jobTitle');
  dialog.innerHTML=`<div class="dialog-heading"><h2 id="jobTitle">${esc(t.entry)}</h2><button type="button" id="closeJob">${esc(t.close)}</button></div><p class="job-intro">${esc(t.intro)}</p><form id="jobForm"><label for="jobDescription">${esc(t.description)}</label><textarea id="jobDescription" rows="7" maxlength="6000" required aria-describedby="jobPrivacy" autocomplete="off" spellcheck="false"></textarea><p id="jobPrivacy" class="subtle">${esc(t.privacy)}</p><div class="job-form-actions"><div class="job-count-settings"><label class="job-limit-toggle"><input id="jobLimitEnabled" type="checkbox" role="switch" checked><span>${ru?'Ограничить количество':'Limit question count'}</span></label><label for="jobCount" id="jobCountLabel">${esc(t.count)}<input id="jobCount" type="number" min="1" max="60" value="5" required inputmode="numeric"></label><p id="jobLimitHint" class="subtle" hidden>${ru?'Без заданного количества: AI выбирает релевантные вопросы. За один запрос анализируется до 60 кандидатов; подборка не гарантирует полного покрытия.':'No chosen count: AI selects relevant questions. Each request reviews up to 60 candidates; the selection is not a guarantee of complete coverage.'}</p></div><button id="findJobQuestions" class="primary" type="submit">${esc(t.find)}</button></div></form><p id="jobStatus" role="status" aria-live="polite" aria-atomic="true"></p><section id="jobPreview" hidden aria-labelledby="jobPreviewTitle"><h3 id="jobPreviewTitle" tabindex="-1">${esc(t.preview)}</h3><p class="subtle">${esc(t.review)}</p><ul id="jobMatches"></ul><div class="job-apply"><p id="jobSelection" role="status"></p><p id="jobReplace" class="subtle" hidden>${esc(t.replace)}</p><button id="applyJob" type="button" class="primary">${esc(t.apply)}</button></div></section>`;
  document.body.append(dialog);
  $('jobTitle').textContent=extra.entry;
  const feedback=document.createElement('div');feedback.innerHTML=`<div id="jobProgress" role="progressbar" aria-label="${esc(t.loading)}" hidden><span></span></div><details id="jobQuotaInfo" hidden><summary id="jobQuota"></summary><p>${esc(extra.quotaNote)}</p></details><details id="jobUsage" hidden><summary>${esc(extra.details)}</summary><p id="jobUsageText"></p></details>`;
  $('jobStatus').after(feedback);
  const saveArea=document.createElement('div');saveArea.className='job-save';saveArea.innerHTML=`<label for="jobCollectionName">${esc(extra.name)}</label><input id="jobCollectionName" maxlength="80" autocomplete="off"><p class="subtle">${esc(extra.local)}</p><div class="collection-actions"><button type="button" id="saveJobCollection">${esc(extra.save)}</button><button type="button" id="openJobCollections">${esc(extra.open)}</button></div><p id="jobSaveStatus" role="status"></p>`;
  $('jobMatches').before(saveArea);
  form=$('jobForm');description=$('jobDescription');count=$('jobCount');status=$('jobStatus');find=$('findJobQuestions');preview=$('jobPreview');list=$('jobMatches');apply=$('applyJob');selection=$('jobSelection');replace=$('jobReplace');
  $('closeJob').onclick=()=>dialog.close();
  $('jobLimitEnabled').onchange=()=>{const limited=$('jobLimitEnabled').checked;count.disabled=!limited;$('jobCountLabel').hidden=!limited;$('jobLimitHint').hidden=limited;discardPreview();};
  $('jobCollectionName').oninput=updateSelection;
  $('saveJobCollection').onclick=()=>{const result=jobCollections.save($('jobCollectionName').value,[...list.querySelectorAll('input:checked')].map(input=>input.value));$('jobSaveStatus').textContent=result.ok?extra.saved:result.error;if(result.ok)$('saveJobCollection').disabled=true;};
  $('openJobCollections').onclick=()=>{dialog.close();jobCollections.open();};
  dialog.addEventListener('close',()=>{cancel();description.value='';count.value='5';count.disabled=false;$('jobLimitEnabled').checked=true;$('jobCountLabel').hidden=false;$('jobLimitHint').hidden=true;discardPreview();notify('');});
  form.addEventListener('input',()=>{discardPreview();if(pending&&pendingMethod==='POST'){cancel();find.disabled=!available;notify('');}});
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(pending||!available)return;
   const source=description.value.trim(),maximum=$('jobLimitEnabled').checked?Number(count.value):null;
   if(source.length<30||source.length>6000||new TextEncoder().encode(source).length>10000||(maximum!==null&&(!Number.isInteger(maximum)||maximum<1||maximum>60))){notify(t.invalid_input,true);return;}
   discardPreview();notify(t.loading);
   const result=await request('POST',{description:source,count:maximum,language:ru?'ru':'en'});
   if(result){showMatches(result,source,maximum);showUsage(result.usage);}
  });
  apply.onclick=()=>{
   const selected=[...list.querySelectorAll('input:checked')].map(input=>input.value).filter(id=>matches.some(match=>match.id===id));
   if(!selected.length)return;
   dialog.close();storeFilters();mode='train';savedOnly=false;lessonLibrary=false;restoreFilters();beginPractice(selected,'recall',t.session,'job');
  };
 }
 entry.onclick=sessionEntry.onclick=async()=>{
  if(!dialog)buildDialog();available=false;find.disabled=true;discardPreview();$('jobQuotaInfo').hidden=true;dialog.showModal();description.focus();notify(t.checking);
  const result=await request('GET');
  if(result){available=result.available===true||result.enabled===true;find.disabled=!available;notify(available?'':t.disabled,!available);}
 };
})();
