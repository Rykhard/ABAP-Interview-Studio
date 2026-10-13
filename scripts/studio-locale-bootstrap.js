// Offline locale selection. Content and interface translations are authored resources.
let studioLocale='en';
const requestedLocale=new URLSearchParams(location.search).get('lang');
try{studioLocale=localStorage.getItem('abap-studio-language-v1')==='ru'?'ru':'en';}catch{/* English is the default when preference storage is unavailable. */}
if(['en','ru'].includes(requestedLocale))studioLocale=requestedLocale;
document.documentElement.lang=studioLocale;
function localeCount(count,kind){
 const forms={question:['вопрос','вопроса','вопросов'],topic:['тема','темы','тем'],step:['шаг','шага','шагов'],lesson:['учебный пример','учебных примера','учебных примеров']}[kind];
 const category=new Intl.PluralRules('ru').select(count),index=category==='one'?0:category==='few'?1:2;
 return count+' '+forms[index];
}
const englishStudyModules=readStudioData('study-data');
const englishQuestionText=new Map(englishStudyModules.flatMap(m=>m.questions.map(q=>[q.id,[q.question,q.answer,q.detail,q.pitfall].join(' ')])));
const otherLocalePayloads=readStudioData('ru-data');
const russianQuestionText=new Map(otherLocalePayloads['study-data'].flatMap(m=>m.questions.map(q=>[q.id,[q.question,q.answer,q.detail,q.pitfall].join(' ')])));
if(studioLocale==='ru'){
 selectStudioData(otherLocalePayloads);
 const dictionary=readStudioData('ui-ru-data');
 for(const [key,value] of Object.entries(dictionary)){const decoder=document.createElement('textarea');decoder.innerHTML=key;dictionary[decoder.value]=value;}
 const keys=Object.keys(dictionary).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
 const pattern=new RegExp('(?<![\\w.\\-/])(?:'+keys.join('|')+')(?![\\w.\\-/])','g');
 const translate=text=>text.replace(pattern,match=>dictionary[match]).replace(/\b(\d+) questions\b/g,(_,count)=>localeCount(Number(count),'question'));
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest('script,style,code')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{node.textContent=translate(node.textContent);});
 for(const element of document.body.querySelectorAll('[aria-label],[placeholder],[title]'))for(const name of ['aria-label','placeholder','title'])if(element.hasAttribute(name))element.setAttribute(name,translate(element.getAttribute(name)));
 for(const option of document.querySelectorAll('#scope option'))if(option.value!=='all')option.textContent=({Core:'Базовый',Advanced:'Продвинутый',Senior:'Senior'})[option.value];
}
