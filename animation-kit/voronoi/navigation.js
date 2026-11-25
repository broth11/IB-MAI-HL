const panels=Array.from(document.querySelectorAll('.lesson'));
const picker=document.querySelector('#animation-picker');
const previousAnimation=document.querySelector('#previous-animation');
const nextAnimation=document.querySelector('#next-animation');
const layout=document.querySelector('.wrap');
const sketchTitle=document.querySelector('#header-sketch');
const shortSketchTitle=document.querySelector('#header-sketch-short');
const compactLayout=matchMedia('(max-width:760px) and (max-height:720px), (orientation:landscape) and (max-height:520px)');
const shortLandscape=matchMedia('(orientation:landscape) and (max-height:520px)');
let selected=-1, scheduled=false;
function fitActivePanel(){
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    const frame=panels[selected]?.querySelector('.anim-frame');
    if(!frame || !frame.offsetHeight) return;
    const available=Math.floor(window.visualViewport?.height||innerHeight);
    // Space the player must leave free: the header above it and its own controls below it. The step list and the "Remember" line
    // sit beside or under the step list, and scroll with the page; counting them shrank the player to the minimum on long lists.
    const fr=frame.getBoundingClientRect(), lr=layout.getBoundingClientRect();
    const toolbar=frame.closest('.anim-grid')?.querySelector('.anim-toolbar');
    const bottom=toolbar&&toolbar.offsetHeight?Math.max(fr.bottom,toolbar.getBoundingClientRect().bottom):fr.bottom;
    const nonFrame=(fr.top-lr.top)+(bottom-fr.bottom);
    const mobile=innerWidth<=760;
    const compact=compactLayout.matches;
    const target=Math.max(shortLandscape.matches?145:compact?163:mobile?190:238, Math.min(780,available-nonFrame-4));
    document.documentElement.style.setProperty('--frame-budget',target+'px');
  });
}
function selectAnimation(index,updateAddress){
  const next=Math.min(panels.length-1,Math.max(0,index));
  if(next===selected) return;
  for(const [i,panel] of panels.entries()) panel.hidden=i!==next;
  selected=next;
  sketchTitle.textContent=lessons[next].title;
  shortSketchTitle.textContent=lessons[next].stage;
  picker.value=String(next);
  previousAnimation.disabled=next===0;
  nextAnimation.disabled=next===panels.length-1;
  if(updateAddress) {
    try { history.replaceState(null,'','#'+panels[next].id); }
    catch(error) { location.hash=panels[next].id; }
  }
  scrollTo(0,0);
  fitActivePanel();
}
picker.addEventListener('change',()=>selectAnimation(Number(picker.value),true));
previousAnimation.addEventListener('click',()=>selectAnimation(selected-1,true));
nextAnimation.addEventListener('click',()=>selectAnimation(selected+1,true));
const selectHash=()=>selectAnimation(panels.findIndex(panel=>'#'+panel.id===location.hash),false);
window.addEventListener('hashchange',selectHash);
window.addEventListener('resize',()=>{
  if(!compactLayout.matches) {
    const panel=panels[selected];
    if(panel?.querySelector('[data-tab=remember][aria-selected=true]')) panel.querySelector('[data-tab=see]').click();
  }
  fitActivePanel();
});
window.visualViewport?.addEventListener('resize',fitActivePanel);
document.fonts?.ready.then(fitActivePanel);
new ResizeObserver(fitActivePanel).observe(layout);
document.documentElement.classList.add('enhanced');
document.querySelector('.current-title').hidden=false;
document.querySelector('.animation-picker').hidden=false;
selectHash();
