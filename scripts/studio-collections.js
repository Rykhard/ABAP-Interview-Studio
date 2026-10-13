// Local collections contain only user titles and canonical question IDs, never job text.
const jobCollections=(()=>{
 const ru=studioLocale==='ru',key='studio.jobCollections.v1';
 const t=ru?{title:'Мои подборки',close:'Закрыть',empty:'Сохраните вопросы после ИИ-подбора — они появятся здесь.',privacy:'Подборки хранятся только в этом браузере. Текст вакансии не сохраняется.',practice:'Практика',remove:'Удалить',rename:'Переименовать',save:'Сохранить',undo:'Отменить удаление',error:'Не удалось сохранить. Проверьте доступ к хранилищу браузера.',limit:'Можно сохранить до 50 подборок. Удалите ненужную.',name:'Название подборки',replace:'Новая практика заменит текущую сессию.',questions:'Вопросы'}:{title:'My collections',close:'Close',empty:'Save questions after AI matching to find them here.',privacy:'Collections stay in this browser only. The job description is not saved.',practice:'Practice',remove:'Delete',rename:'Rename',save:'Save',undo:'Undo deletion',error:'Could not save. Check browser storage access.',limit:'You can save up to 50 collections. Delete one you no longer need.',name:'Collection name',replace:'New practice replaces your current session.',questions:'Questions'};
 let dialog,items=[],deleted=null;
 function read(){try{const value=JSON.parse(localStorage.getItem(key));return value?.version===1&&Array.isArray(value.collections)?value.collections.slice(0,50).filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&Array.isArray(x.questionIds)).map(x=>({id:x.id.slice(0,80),title:x.title.slice(0,80),questionIds:[...new Set(x.questionIds)].filter(id=>byId.has(id)).slice(0,60),createdAt:typeof x.createdAt==='string'?x.createdAt:''})).filter(x=>x.questionIds.length):[];}catch{return [];}}
 function write(next){try{localStorage.setItem(key,JSON.stringify({version:1,collections:next}));}catch{return false;}items=next;if(learningCollection){const updated=next.find(x=>x.id===learningCollection.id);if(updated){learningCollection=updated;render();}else openTopic('');}return true;}
 function save(title,ids){
  title=title.trim().slice(0,80);ids=[...new Set(ids)].filter(id=>byId.has(id)).slice(0,60);if(!title||!ids.length)return {error:t.name};
  const current=read();if(current.some(x=>x.title===title&&x.questionIds.length===ids.length&&ids.every(id=>x.questionIds.includes(id))))return {ok:true};
  if(current.length>=50)return {error:t.limit};
  return write([{id:crypto.randomUUID(),title,questionIds:ids,createdAt:new Date().toISOString()},...current])?{ok:true}:{error:t.error};
 }
 function message(text){$('collectionsStatus').textContent=text;}
 function groups(ids){return topics.map(topic=>({topic,ids:topicQuestions(topic).map(q=>q.id).filter(id=>ids.includes(id))})).filter(group=>group.ids.length);}
 function renderLibrary(){
  $('collectionsList').innerHTML=items.length?items.map(x=>`<article class="collection-card" data-id="${esc(x.id)}"><h3>${esc(x.title)}</h3><div class="collection-actions"><button type="button" class="primary" data-action="learn">${ru?'Изучать подборку':'Study collection'}</button><button type="button" data-action="practice">${ru?'Практика всей подборки':'Practice collection'}</button><button type="button" data-action="rename">${t.rename}</button><button type="button" data-action="delete">${t.remove}</button></div><p class="subtle">${t.questions}: ${x.questionIds.length}</p>${groups(x.questionIds).map(group=>`<details class="collection-topic"><summary>${esc(group.topic.title)} (${group.ids.length})</summary><ul>${group.ids.map(id=>`<li><button type="button" data-question="${esc(id)}">${esc(id)} · ${esc(byId.get(id).question)}</button></li>`).join('')}</ul><button type="button" data-action="practice-topic" data-topic="${esc(group.topic.id)}">${ru?'Практика по теме':'Practice this topic'}</button></details>`).join('')}</article>`).join(''):`<p>${t.empty}</p>`;
  $('collectionsUndo').hidden=!deleted;$('collectionsReplace').hidden=!activeSession;
 }
 function open(){
  if(!dialog){
   dialog=document.createElement('dialog');dialog.id='collectionsDialog';dialog.setAttribute('aria-labelledby','collectionsTitle');
   dialog.innerHTML=`<div class="dialog-heading"><h2 id="collectionsTitle">${t.title}</h2><button id="collectionsClose" type="button">${t.close}</button></div><p class="subtle">${t.privacy}</p><p id="collectionsReplace" class="subtle">${t.replace}</p><div id="collectionsList"></div><p id="collectionsStatus" role="status"></p><button id="collectionsUndo" type="button" hidden>${t.undo}</button>`;
   document.body.append(dialog);$('collectionsClose').onclick=()=>dialog.close();
   $('collectionsUndo').onclick=()=>{const current=read();if(!deleted||current.some(x=>x.id===deleted.id))return;if(current.length>=50){message(t.limit);return;}if(write([deleted,...current])){deleted=null;renderLibrary();message('');}else message(t.error);};
   $('collectionsList').onclick=event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.question){const id=button.closest('.collection-card').dataset.id;dialog.close();study(id);openQuestion(button.dataset.question);return;}
    const card=button.closest('.collection-card'),id=card?.dataset.id;items=read();const item=items.find(x=>x.id===id);if(!item){renderLibrary();return;}
    if(button.dataset.action==='learn'){dialog.close();study(id);return;}
    if(['practice','practice-topic'].includes(button.dataset.action)){const ids=button.dataset.action==='practice-topic'?item.questionIds.filter(id=>byId.get(id).topic===button.dataset.topic):item.questionIds;dialog.close();learningCollection=null;storeFilters();mode='train';savedOnly=false;lessonLibrary=false;restoreFilters();beginPractice(ids,'recall',item.title,'collection',item.id);}
    if(button.dataset.action==='delete'){if(write(items.filter(x=>x.id!==id))){deleted=item;renderLibrary();$('collectionsUndo').focus();}else message(t.error);}
    if(button.dataset.action==='rename'){
     const form=document.createElement('form');form.className='collection-rename';form.innerHTML=`<label>${t.name}<input required maxlength="80" value="${esc(item.title)}"></label><button type="submit">${t.save}</button>`;
     button.disabled=true;card.append(form);form.querySelector('input').focus();
     form.onsubmit=e=>{e.preventDefault();const title=form.querySelector('input').value.trim();if(!title)return;const current=read();if(write(current.map(x=>x.id===id?{...x,title}:x))){renderLibrary();message('');$('collectionsTitle').setAttribute('tabindex','-1');$('collectionsTitle').focus();}else message(t.error);};
    }
   };
  }
  items=read();deleted=null;renderLibrary();message('');dialog.showModal();$('collectionsClose').focus();
 }
 document.addEventListener('click',event=>{if(event.target.closest('#jobCollectionsNav'))open();const back=event.target.closest('[data-study-collection]');if(back)study(back.dataset.studyCollection);});
 function find(id){return read().find(x=>x.id===id)||null;}
 function sequence(item){return topics.flatMap(topic=>topic.sections.flatMap(section=>orderedLearningQuestions(section.questionIds.filter(id=>item.questionIds.includes(id)).map(id=>byId.get(id))).map(q=>q.id)));}
 function study(id,reset=true){const item=find(id);if(!item)return;learningCollection=item;activeLearningPath='';questionReturn=null;questionFromSearch=false;storeFilters();mode='learn';savedOnly=false;lessonLibrary=false;libraryList=true;prefs.learn={search:'',topic:'',section:'',scope:'all',selection:'all'};if(reset){answerDefault='questions';answerOverrides.clear();}document.querySelector('aside').classList.remove('nav-open');$('menuToggle').setAttribute('aria-expanded','false');restoreFilters();render();routeSelection();focusDestination();}
 return {save,open,find,sequence,study};
})();
