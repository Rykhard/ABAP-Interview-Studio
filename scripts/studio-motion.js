// Motion follows the system preference, including changes made while the app is open.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const entranceAnimations=new Set();
function playMotion(element,frames,duration=180,cleanup=()=>{}){
 if(!element||reducedMotion.matches||!element.animate){cleanup();return;}
 const animation=element.animate(frames,{duration,easing:'cubic-bezier(.2,0,.2,1)'});
 entranceAnimations.add(animation);
 const release=()=>{entranceAnimations.delete(animation);cleanup();};
 animation.onfinish=release;animation.oncancel=release;
 return animation;
}
function navMotionSnapshot(){
 const active=$('segments').querySelector('[aria-current=page]');
 return active?{key:active.id||active.dataset.topic+':'+(active.dataset.section||''),rect:active.getBoundingClientRect(),sections:new Set([...$('segments').querySelectorAll('[data-section]')].map(b=>b.dataset.section))}:null;
}
function animateNavSelection(before){
 if(!before||reducedMotion.matches)return;
 const nav=$('segments'),active=nav.querySelector('[aria-current=page]');
 if(!active)return;
 const key=active.id||active.dataset.topic+':'+(active.dataset.section||'');
 if(key===before.key)return;
 const rect=active.getBoundingClientRect(),base=nav.getBoundingClientRect();
 if(!rect.height||!before.rect.height)return;
 const marker=document.createElement('span');marker.className='nav-motion-indicator';marker.setAttribute('aria-hidden','true');
 Object.assign(marker.style,{left:rect.left-base.left+'px',top:rect.top-base.top+'px',width:rect.width+'px',height:rect.height+'px'});
 nav.append(marker);active.classList.add('nav-motion-current');
 playMotion(marker,[{transform:`translate(${before.rect.left-rect.left}px,${before.rect.top-rect.top}px) scale(${before.rect.width/rect.width},${before.rect.height/rect.height})`},{transform:'none'}],200,()=>{marker.remove();active.classList.remove('nav-motion-current');});
 const fresh=[...nav.querySelectorAll('[data-section]')].filter(b=>!before.sections.has(b.dataset.section));
 fresh.forEach(button=>playMotion(button,[{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],180));
}
function animateStudySelection(region,before){
 const picker=region.querySelector('.study-view-picker'),active=picker?.querySelector('[aria-pressed=true]');
 if(!active)return;
 if(before&&!reducedMotion.matches){
  const rect=active.getBoundingClientRect(),base=picker.getBoundingClientRect(),line=document.createElement('span');
  line.className='study-motion-indicator';line.setAttribute('aria-hidden','true');
  Object.assign(line.style,{left:rect.left-base.left+'px',width:rect.width+'px'});
  picker.append(line);active.classList.add('study-motion-current');
  playMotion(line,[{transform:`translateX(${before.left-rect.left}px) scaleX(${before.width/rect.width})`},{transform:'none'}],180,()=>{line.remove();active.classList.remove('study-motion-current');});
 }
 animateEntrance(region.querySelector('.reading-flow,.lesson-player'));
}
function animateLessonStep(player){
 const number=player.querySelector('[aria-current=step] .lesson-step-number');
 playMotion(number,[{transform:'scale(.9)'},{transform:'scale(1)'}],180);
 const color=getComputedStyle(document.documentElement).getPropertyValue('--soft-blue').trim();
 player.querySelectorAll('.state-changed').forEach(state=>playMotion(state,[{backgroundColor:color},{backgroundColor:'transparent'}],420));
}
function animateCodeStep(region){
 const color=getComputedStyle(document.documentElement).getPropertyValue('--soft-blue').trim();
 region.querySelectorAll('.code-focus').forEach(line=>playMotion(line,[{backgroundColor:color},{backgroundColor:getComputedStyle(line).backgroundColor}],320));
 animateEntrance(region.querySelector('.code-explanation'));
}
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
