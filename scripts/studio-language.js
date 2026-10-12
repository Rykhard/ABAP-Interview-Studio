// A language change keeps the same stable content IDs and ongoing session.
const languagePicker=document.createElement('div');
languagePicker.className='language-picker';languagePicker.setAttribute('role','group');languagePicker.setAttribute('aria-label','Language');
if(studioLocale==='ru'){
 const diagramNote=document.createElement('p');diagramNote.className='diagram-language-note';
 diagramNote.textContent='Diagram artwork keeps English labels; the explanation below is in Russian.';
 $('visualStage').after(diagramNote);
}
languagePicker.innerHTML='<button type="button" data-language="en" lang="en" title="English">EN</button><button type="button" data-language="ru" lang="ru" title="Русский">RU</button>';
appBar.insertBefore(languagePicker,$('backToTop'));
languagePicker.querySelectorAll('button').forEach(button=>{
 button.setAttribute('aria-pressed',String(button.dataset.language===studioLocale));
 button.onclick=()=>{
  const next=button.dataset.language;if(next===studioLocale)return;
  storeFilters();
  const snapshot={version:1,path:location.pathname,hash:location.hash,mode,prefs,libraryList,savedOnly,lessonLibrary,practiceKind,activeSession,questionReturn,questionFromSearch,searchQuery,searchLimit,sessionLength:$('sessionLength').value,scrollY:window.scrollY,
   state,ratings,quizProgress,bookmarks:[...savedQuestions],answerDefault,answerOverrides:[...answerOverrides],
   maps:{lessonPositions:[...lessonPositions],lessonChoices:[...lessonChoices],studyViewChoices:[...studyViewChoices],exampleChoices:[...exampleChoices],codeSteps:[...codeSteps],guidedPositions:[...guidedPositions],visualChoices:[...visualChoices]}};
  const url=new URL(location.href);url.searchParams.set('lang',next);
  try{localStorage.setItem('abap-studio-language-v1',next);}catch{/* The explicit URL also retains the chosen language. */}
  try{history.replaceState({...history.state,languageSnapshot:snapshot},'',url);location.reload();}
  catch{$('notice').textContent='Language switching is unavailable in this browser context. Open the hosted app or enable local file navigation.';}
 };
});
const languageSnapshot=history.state?.languageSnapshot;
if(languageSnapshot?.version===1&&languageSnapshot.path===location.pathname&&languageSnapshot.hash===location.hash){
 try{
  const s=languageSnapshot;
  if(['learn','train'].includes(s.mode)&&s.prefs?.learn&&s.prefs?.train){
   mode=s.mode;Object.assign(prefs,s.prefs);libraryList=!!s.libraryList;savedOnly=!!s.savedOnly;lessonLibrary=!!s.lessonLibrary;
   practiceKind=s.practiceKind==='quiz'?'quiz':'recall';
   if(s.activeSession&&s.activeSession.ids.every(id=>byId.has(id)&&(s.activeSession.kind!=='quiz'||quizByQuestion.has(id)))&&s.activeSession.index>=0&&s.activeSession.index<s.activeSession.ids.length)activeSession=s.activeSession;
   state=s.state||state;ratings=s.ratings||ratings;quizProgress=validatedQuizProgress(s.quizProgress);
   savedQuestions.clear();s.bookmarks.filter(id=>byId.has(id)).forEach(id=>savedQuestions.add(id));
   questionReturn=s.questionReturn;questionFromSearch=!!s.questionFromSearch;searchQuery=s.searchQuery||'';searchLimit=s.searchLimit||20;
   answerDefault=s.answerDefault==='answers'?'answers':'questions';answerOverrides.clear();s.answerOverrides.forEach(([key,value])=>answerOverrides.set(key,value));
   for(const [name,map] of Object.entries({lessonPositions,lessonChoices,studyViewChoices,exampleChoices,codeSteps,guidedPositions,visualChoices})){map.clear();(s.maps[name]||[]).forEach(([key,value])=>map.set(key,value));}
   restoreFilters();$('sessionLength').value=s.sessionLength;
   if(activeSession)activeSession.title=practiceContext();render();
   requestAnimationFrame(()=>window.scrollTo({top:s.scrollY||0,behavior:'instant'}));
  }
 }catch{/* A stale snapshot must not prevent normal study. */}
 const clean={...history.state};delete clean.languageSnapshot;history.replaceState(clean,'');
}
