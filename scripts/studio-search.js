// Global search has its own state and never narrows or resets a practice session.
let searchShowBroader=false;
let searchQuery='',searchLimit=20,searchOpener=null,searchDestination=null,questionFromSearch=false,searchRouteClosing=false;
const normalized=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const alternateSearchQuestions=new Map((studioLocale==='ru'?englishStudyModules:otherLocalePayloads['study-data']).flatMap(module=>module.questions.map(q=>[q.id,q])));
const searchIndex=all.map(q=>{
 const alternate=alternateSearchQuestions.get(q.id)||{};
 const fields=[
  ['Question',q.question,150],['Answer',q.answer,120],['Example',q.detail,95],['Common mistake',q.pitfall,65],
  ...['question','answer','detail','pitfall'].map((key,i)=>['EN / RU',alternate[key]||'',[140,110,85,55][i]]),
  ['Topic',q.moduleTitle,20,false],['Follow-up',[...q.followups||[],...q.signals||[],q.evidence||''].join(' '),45],
  ['Reference',(q.references||[]).map(r=>r.title+' '+r.note).join(' '),10,false],
  ['Guided lesson',(lessonsByQuestion.get(q.id)||[]).map(lesson=>[lesson.title,lesson.scenario,lesson.goal,...lesson.steps.map(step=>step.title+' '+step.explanation)].join(' ')).join(' '),80],
  ['Diagram',visuals.filter(v=>v.questions.includes(q.id)).map(v=>v.title+' '+v.caption).join(' '),60]
 ].map(([label,text,weight,substantive=true])=>{const value=normalized(text);return {label,text,weight,substantive,normalized:value,words:value.split(' ')};});
 return {q,fields,words:[...new Set([normalized(q.id),...fields.flatMap(field=>field.words)])]};
});
function globalMatches(query){
 const term=normalized(query),terms=[...new Set(term.split(' ').filter(Boolean))];if(!terms.length)return [];
 const exact=searchIndex.find(item=>normalized(item.q.id).replace(/ /g,'')===term.replace(/ /g,''));
 // Short technical terms such as API must not match a substring of BAPI.
 const covers=(words,word)=>words.some(token=>token===word||(word.length>=4&&token.startsWith(word)));
 return searchIndex.map(entry=>{
  if(exact)return entry===exact?{q:entry.q,match:entry.fields[1],score:1000,tier:0,terms}:null;
  if(!terms.every(word=>covers(entry.words,word)))return null;
  const candidates=entry.fields.map(field=>{
   const phrase=(' '+field.normalized+' ').includes(' '+term+' '),together=terms.every(word=>covers(field.words,word));
   const substantive=field.substantive;
   return {field,tier:substantive&&phrase?0:substantive&&together?1:2,score:(phrase?500:together?300:0)+field.weight};
  }).sort((a,b)=>a.tier-b.tier||b.score-a.score);
  const best=candidates[0];
  return {q:entry.q,match:best.field===entry.fields[0]?entry.fields[1]:best.field,score:best.score,tier:best.tier,terms};
 }).filter(Boolean).sort((a,b)=>a.tier-b.tier||b.score-a.score||a.q.id.localeCompare(b.q.id,'en',{numeric:true}));
}
function searchExcerpt(text,terms){
 const lower=text.toLowerCase(),positions=terms.map(t=>lower.indexOf(t)).filter(i=>i>=0),at=positions.length?Math.min(...positions):0;
 const phrase=lower.indexOf(terms.join(' ')),start=Math.max(0,(phrase>=0?phrase:at)-65),end=Math.min(text.length,start+230);return (start?'...':'')+text.slice(start,end)+(end<text.length?'...':'');
}
function searchHighlight(text,terms){
 const needles=terms.filter(t=>t.length>1).sort((a,b)=>b.length-a.length);if(!needles.length)return esc(text);
 const pattern=new RegExp('('+needles.join('|')+')','ig');return text.split(pattern).map((part,i)=>i%2?'<mark>'+esc(part)+'</mark>':esc(part)).join('');
}
function renderGlobalSearch(){
 const matches=globalMatches(searchQuery),strong=matches.filter(item=>item.tier<2),broader=matches.filter(item=>item.tier===2);
 const pool=strong.length&&!searchShowBroader?strong:matches,shown=pool.slice(0,searchLimit);
 const resultList=items=>`<ol class="search-results">${items.map(({q,match,terms})=>`<li><button class="search-result" data-search-result="${q.id}"><span class="search-result-meta">${q.id} &middot; ${esc(q.topicTitle)} / ${esc(q.sectionTitle)}</span><strong>${searchHighlight(q.question,terms)}</strong><span class="search-snippet"><span class="match-label">${esc(match.label)}</span> ${searchHighlight(searchExcerpt(match.text,terms),terms)}</span></button></li>`).join('')}</ol>`;
 $('clearGlobalSearch').hidden=!searchQuery;
 $('globalSearchCount').textContent=searchQuery.trim()?`${matches.length} ${matches.length===1?'question':'questions'} found across all ${topics.length} topics`:`Search all ${all.length} questions, answers, guided lessons, examples and references.`;
 $('globalResults').innerHTML=!searchQuery.trim()?`<div class="search-empty"><h3>Find a concept, not just a topic</h3><p>Try a question ID, an acronym or a few words.</p><div class="search-examples">${['RAP save','Clean Core','BAPI commit','SQL-12'].map(term=>`<button data-search-example="${esc(term)}">${esc(term)}</button>`).join('')}</div><p class="small subtle">Topic, difficulty and practice filters do not limit this search.</p></div>`:!matches.length?'<div class="search-empty"><h3>No matching questions</h3><p>Try fewer words, an acronym such as EML or RFC, or a question ID. You are already searching every topic.</p></div>':`${[0,1,2].map(tier=>{const items=shown.filter(item=>item.tier===tier);return items.length?`<section class="search-match-group" data-match-tier="${tier}"><h3>${['Closest matches','All search words','Broader matches'][tier]}</h3>${resultList(items)}</section>`:'';}).join('')}${strong.length&&broader.length&&(searchShowBroader||shown.length>=strong.length)?`<button class="search-broader" data-search-broader aria-expanded="${searchShowBroader}">${searchShowBroader?'Hide broader matches':'Show broader matches'} (${broader.length})</button>`:''}`;
 $('moreSearchResults').hidden=pool.length<=shown.length;$('moreSearchResults').textContent=`Show more results (${shown.length} of ${pool.length})`;
 document.querySelector('[data-search-broader]')?.addEventListener('click',()=>{searchShowBroader=!searchShowBroader;searchLimit=searchShowBroader?Math.max(searchLimit,strong.length+20):20;renderGlobalSearch();document.querySelector('[data-search-broader]')?.focus();});
 document.querySelectorAll('[data-search-example]').forEach(b=>b.onclick=()=>{$('globalSearchInput').value=b.dataset.searchExample;updateGlobalSearch();$('globalSearchInput').focus();});
 document.querySelectorAll('[data-search-result]').forEach(b=>b.onclick=()=>{searchDestination=b.dataset.searchResult;$('searchDialog').close();});
}
function updateGlobalSearch(){searchQuery=$('globalSearchInput').value;searchLimit=20;searchShowBroader=false;renderGlobalSearch();}
function openGlobalSearch(opener=document.activeElement){
 if($('visualDialog').open||$('codeDialog').open||$('readingDialog').open)return;
 searchOpener=opener;searchDestination=null;$('globalSearchInput').value=searchQuery;renderGlobalSearch();
 if(!$('searchDialog').open)$('searchDialog').showModal();$('globalSearchInput').focus();
}
$('openSearch').onclick=()=>openGlobalSearch($('openSearch'));
$('closeSearch').onclick=()=>$('searchDialog').close();
$('searchDialog').addEventListener('close',()=>{if(searchRouteClosing){searchRouteClosing=false;return;}if(searchDestination){const id=searchDestination;searchDestination=null;openQuestion(id,true);}else if(searchOpener?.isConnected)searchOpener.focus();else $('openSearch').focus();});
$('globalSearchForm').onsubmit=e=>{e.preventDefault();updateGlobalSearch();document.querySelector('[data-search-result]')?.focus();};
$('globalSearchInput').addEventListener('input',updateGlobalSearch);
$('clearGlobalSearch').onclick=()=>{$('globalSearchInput').value='';updateGlobalSearch();$('globalSearchInput').focus();};
$('moreSearchResults').onclick=()=>{const firstNew=searchLimit;searchLimit+=20;renderGlobalSearch();document.querySelectorAll('[data-search-result]')[firstNew]?.focus();};
$('searchDialog').addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();$('searchDialog').close();return;}
 if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;const buttons=[...document.querySelectorAll('[data-search-result]')];if(!buttons.length)return;
 if(e.target===$('globalSearchInput')&&e.key==='ArrowDown'){e.preventDefault();buttons[0].focus();return;}
 const index=buttons.indexOf(e.target);if(index<0)return;e.preventDefault();const next=index+(e.key==='ArrowDown'?1:-1);if(next<0)$('globalSearchInput').focus();else buttons[Math.min(next,buttons.length-1)].focus();
});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!e.altKey){e.preventDefault();openGlobalSearch();}});
$('resumePractice').onclick=()=>setMode('train',true);
