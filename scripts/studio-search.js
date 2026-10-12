// Global search has its own state and never narrows or resets a practice session.
let searchQuery='',searchLimit=20,searchOpener=null,searchDestination=null,questionFromSearch=false,searchRouteClosing=false;
const normalized=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const searchIndex=all.map(q=>({q,fields:[
 ['Question',q.question],['Answer',q.answer],['Example',q.detail],['Common mistake',q.pitfall],
 ['Topic',q.moduleTitle],['Follow-up',[...q.followups||[],...q.signals||[],q.evidence||''].join(' ')],
 ['Reference',(q.references||[]).map(r=>r.title+' '+r.note).join(' ')],
 ['Diagram',visuals.filter(v=>v.questions.includes(q.id)).map(v=>v.title+' '+v.caption).join(' ')]
].map(([label,text])=>({label,text,normalized:normalized(text)}))}));
function globalMatches(query){
 const term=normalized(query),terms=[...new Set(term.split(' ').filter(Boolean))];if(!terms.length)return [];
 const exact=searchIndex.find(item=>normalized(item.q.id).replace(/ /g,'')===term.replace(/ /g,''));
 return searchIndex.map(entry=>{
  const id=normalized(entry.q.id),full=id+' '+entry.fields.map(f=>f.normalized).join(' ');
  if(exact)return entry===exact?{q:entry.q,match:entry.fields[1],score:1000,terms}:null;
  if(!terms.every(word=>full.includes(word)))return null;
  const title=entry.fields[0].normalized,match=entry.fields.find(f=>terms.every(word=>f.normalized.includes(word)))||entry.fields.find(f=>terms.some(word=>f.normalized.includes(word)))||entry.fields[0];
  const score=id===term?1000:title===term?500:title.includes(term)?250:terms.every(word=>title.includes(word))?180:id.startsWith(term)?150:match.label==='Answer'?80:30;
  return {q:entry.q,match,score,terms};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.q.id.localeCompare(b.q.id,'en',{numeric:true}));
}
function searchExcerpt(text,terms){
 const lower=text.toLowerCase(),positions=terms.map(t=>lower.indexOf(t)).filter(i=>i>=0),at=positions.length?Math.min(...positions):0;
 const start=Math.max(0,at-65),end=Math.min(text.length,start+230);return (start?'...':'')+text.slice(start,end)+(end<text.length?'...':'');
}
function searchHighlight(text,terms){
 const needles=terms.filter(t=>t.length>1).sort((a,b)=>b.length-a.length);if(!needles.length)return esc(text);
 const pattern=new RegExp('('+needles.join('|')+')','ig');return text.split(pattern).map((part,i)=>i%2?'<mark>'+esc(part)+'</mark>':esc(part)).join('');
}
function renderGlobalSearch(){
 const matches=globalMatches(searchQuery),shown=matches.slice(0,searchLimit);
 $('clearGlobalSearch').hidden=!searchQuery;
 $('globalSearchCount').textContent=searchQuery.trim()?`${matches.length} ${matches.length===1?'question':'questions'} found across all ${topics.length} topics`:`Search all ${all.length} questions, answers, examples and references.`;
 $('globalResults').innerHTML=!searchQuery.trim()?`<div class="search-empty"><h3>Find a concept, not just a topic</h3><p>Try a question ID, an acronym or a few words.</p><div class="search-examples">${['RAP save','Clean Core','BAPI commit','SQL-12'].map(term=>`<button data-search-example="${esc(term)}">${esc(term)}</button>`).join('')}</div><p class="small subtle">Topic, difficulty and practice filters do not limit this search.</p></div>`:!matches.length?'<div class="search-empty"><h3>No matching questions</h3><p>Try fewer words, an acronym such as EML or RFC, or a question ID. You are already searching every topic.</p></div>':`<ol class="search-results">${shown.map(({q,match,terms})=>`<li><button class="search-result" data-search-result="${q.id}"><span class="search-result-meta">${q.id} &middot; ${esc(q.topicTitle)} / ${esc(q.sectionTitle)}</span><strong>${searchHighlight(q.question,terms)}</strong><span class="search-snippet"><span class="match-label">${esc(match.label)}</span> ${searchHighlight(searchExcerpt(match.text,terms),terms)}</span></button></li>`).join('')}</ol>`;
 $('moreSearchResults').hidden=matches.length<=shown.length;$('moreSearchResults').textContent=`Show more results (${shown.length} of ${matches.length})`;
 document.querySelectorAll('[data-search-example]').forEach(b=>b.onclick=()=>{$('globalSearchInput').value=b.dataset.searchExample;updateGlobalSearch();$('globalSearchInput').focus();});
 document.querySelectorAll('[data-search-result]').forEach(b=>b.onclick=()=>{searchDestination=b.dataset.searchResult;$('searchDialog').close();});
}
function updateGlobalSearch(){searchQuery=$('globalSearchInput').value;searchLimit=20;renderGlobalSearch();}
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
$('resumePractice').onclick=()=>setMode('train');
