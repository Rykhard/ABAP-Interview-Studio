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
 const nav=$('segments'),active=nav.querySelector('[aria-current=page]'),marker=nav.querySelector('.nav-motion-indicator');
 const snapshot=active?{key:active.id||active.dataset.topic+':'+(active.dataset.section||''),rect:(marker||active).getBoundingClientRect(),moving:!!marker}:null;
 // Retarget from the visible position, not the previous animation's destination.
 marker?.getAnimations().forEach(animation=>animation.cancel());
 return snapshot;
}
function animateNavSelection(before){
 if(!before||reducedMotion.matches)return;
 const nav=$('segments'),active=nav.querySelector('[aria-current=page]');
 if(!active)return;
 const key=active.id||active.dataset.topic+':'+(active.dataset.section||'');
 if(key===before.key&&!before.moving)return;
 if(key!==before.key)animateTopicIcon(active.querySelector('[data-topic-icon]'));
 const rect=active.getBoundingClientRect(),container=active.closest('.nav-subtopics')||nav,base=container.getBoundingClientRect();
 if(!rect.height||!before.rect.height)return;
 const marker=document.createElement('span');marker.className='nav-motion-indicator';marker.setAttribute('aria-hidden','true');
 const position=r=>({left:r.left-base.left+container.scrollLeft+'px',top:r.top-base.top+container.scrollTop+'px',width:r.width+'px',height:r.height+'px'});
 Object.assign(marker.style,position(rect));
 container.append(marker);active.classList.add('nav-motion-current');
 // Animate bounds without scaling the border or stretching the highlight.
 playMotion(marker,[position(before.rect),position(rect)],360,()=>{marker.remove();active.classList.remove('nav-motion-current');});
}
function replaceStudyContent(current,next){
 const height=current.getBoundingClientRect().height;
 current.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
 current.replaceWith(next);
 if(reducedMotion.matches)return;
 const targetHeight=next.getBoundingClientRect().height;
 next.classList.add('study-content-transition');
 playMotion(next,[
  {height:height+'px',opacity:0,transform:'translateY(5px)'},
  {opacity:1,offset:.7},
  {height:targetHeight+'px',opacity:1,transform:'none'}
 ],300,()=>next.classList.remove('study-content-transition'));
}
function animateStudySelection(region,before){
 const picker=region.querySelector('.study-view-picker'),active=picker?.querySelector('[aria-pressed=true]');
 if(!active||!before||reducedMotion.matches)return;
 const rect=active.getBoundingClientRect(),base=picker.getBoundingClientRect(),line=document.createElement('span');
 line.className='study-motion-indicator';line.setAttribute('aria-hidden','true');
 Object.assign(line.style,{left:rect.left-base.left+'px',width:rect.width+'px'});
 picker.append(line);active.classList.add('study-motion-current');
 playMotion(line,[{transform:`translateX(${before.left-rect.left}px) scaleX(${before.width/rect.width})`},{transform:'none'}],300,()=>{line.remove();active.classList.remove('study-motion-current');});
}
function animateLessonStep(player){
 animateSaveFlow(player);
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
function animateDestination(){
 const view=$('view');view.getAnimations().forEach(animation=>animation.cancel());
 playMotion(view,[{opacity:.72},{opacity:1}],280);
}
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

// Keep the silhouette still. Each accent describes the topic instead of shaking it.
const topicMotionTimes=new WeakMap(),topicHoverTimers=new WeakMap();
function animateTopicIcon(icon){
 if(!icon||reducedMotion.matches)return;
 const now=performance.now();
 if(now-(topicMotionTimes.get(icon)??-Infinity)<900)return;
 topicMotionTimes.set(icon,now);
 const paths=[...icon.querySelectorAll('path')],key=icon.dataset.topicIcon;
 const duration=icon.closest('#segments')?500:640;
 const draw=(path,start=0,end=1)=>{
  if(!path)return;
  const length=path.getTotalLength(),dash={strokeDasharray:`${length} ${length}`};
  const frames=[{...dash,strokeDashoffset:length,offset:0}];
  if(start)frames.push({...dash,strokeDashoffset:length,offset:start});
  frames.push({...dash,strokeDashoffset:0,offset:end});
  if(end<1)frames.push({...dash,strokeDashoffset:0,offset:1});
  playMotion(path,frames,duration);
 };
 const arrive=path=>playMotion(path,[{fill:'transparent'},{fill:'var(--soft)',offset:.65},{fill:'transparent'}],duration);
 if(key==='rap'){
  draw(paths[1],0,.4);draw(paths[2],.3,.8);paths.slice(3).forEach(arrive);
 }else if(key==='cds'){
  draw(paths[4],0,.8);arrive(paths[1]);
 }else if(key==='integration'){
  draw(paths[2],0,.45);draw(paths[3],.15,.5);draw(paths[4],.5,.9);draw(paths[5],.65,1);
 }else if(key==='cloud'||key==='abap'){
  paths.slice(-2).forEach(path=>draw(path,0,.85));
 }else if(key==='interview'){
  draw(paths[2],0,.5);draw(paths[3],.4,1);
 }else draw(paths.at(-1));
}
document.addEventListener('pointerover',event=>{
 if(event.pointerType!=='mouse')return;
 const target=event.target.closest('.topic-card');
 if(!target||target.contains(event.relatedTarget))return;
 // Ignore a pointer crossing cards on its way to another control.
 topicHoverTimers.set(target,setTimeout(()=>{
  topicHoverTimers.delete(target);
  if(target.isConnected&&target.matches(':hover'))animateTopicIcon(target.querySelector('[data-topic-icon]'));
 },120));
});
document.addEventListener('pointerout',event=>{
 const target=event.target.closest('.topic-card');
 if(target&&!target.contains(event.relatedTarget)){clearTimeout(topicHoverTimers.get(target));topicHoverTimers.delete(target);}
});
document.addEventListener('focusin',event=>{
 const target=event.target.closest('.topic-card');
 if(target&&!target.contains(event.relatedTarget)&&event.target.matches(':focus-visible'))animateTopicIcon(target.querySelector('[data-topic-icon]'));
});
function animateSaveFlow(player){
 const current=player.querySelector('.save-flow [aria-current=step]');
 if(!current)return;
 playMotion(current.querySelector('.save-flow-dot'),[{transform:'scale(.75)'},{transform:'scale(1.12)',offset:.5},{transform:'scale(1)'}],420);
 const connector=current.closest('li').querySelector('.save-flow-connector');
 playMotion(connector,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],400);
}
