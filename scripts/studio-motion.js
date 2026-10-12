// Motion follows the system preference, including changes made while the app is open.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const entranceAnimations=new Set();
function animateEntrance(element){
 if(!element||reducedMotion.matches||!element.animate)return;
 element.getAnimations().forEach(animation=>animation.cancel());
 const animation=element.animate([{opacity:.45},{opacity:1}],{duration:160,easing:'cubic-bezier(.2,0,.2,1)'});
 entranceAnimations.add(animation);
 const release=()=>entranceAnimations.delete(animation);
 animation.onfinish=release;animation.oncancel=release;
}
function animateDestination(){animateEntrance($('view'));}
reducedMotion.addEventListener('change',()=>{
 if(reducedMotion.matches)for(const animation of entranceAnimations)animation.cancel();
});

let topButtonFrame=0;
function updateTopButton(){
 topButtonFrame=0;
 const visible=window.scrollY>320;
 $('backToTop').dataset.visible=String(visible);
 $('backToTop').disabled=!visible;
}
window.addEventListener('scroll',()=>{
 if(!topButtonFrame)topButtonFrame=requestAnimationFrame(updateTopButton);
},{passive:true});
window.addEventListener('resize',updateTopButton);
updateTopButton();
$('backToTop').onclick=()=>{
 const heading=document.querySelector('main.single-question .focused-card>h3')||$('sessionQuestion')||$('heading');
 heading.focus({preventScroll:true});
 window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});
};
$('brandHome').onclick=event=>{
 // Preserve normal link behavior for a new tab or window.
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 document.querySelector('aside').classList.remove('nav-open');
 $('menuToggle').setAttribute('aria-expanded','false');
 openTopic('');
};

// Animate only an explicitly opened answer, never every card in a long topic.
$('view').addEventListener('click',event=>{
 const summary=event.target.closest('summary');
 if(!summary)return;
 const details=summary.parentElement;
 if(details.tagName!=='DETAILS'||details.open)return;
 requestAnimationFrame(()=>{
  if(details.isConnected&&details.open)animateEntrance(details.querySelector(':scope > .answer, :scope > .rubric'));
 });
});
