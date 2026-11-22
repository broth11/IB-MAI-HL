function createPlayer(index, stage, root) {
  const cfg=lessons[index], theme=animTheme(root);
  let clock=0, previous=null, speed=1, running=false, request=0, frameKey='';
  function paint() {
    const changed=theme.poll(), step=cfg.chapters.findLastIndex(c=>clock>=c.t);
    const current=cfg.chapters[Math.max(0,step)];
    const key=clock>=current.t+current.reveal ? 'held-'+step : clock;
    if(key!==frameKey||changed) {
      frameKey=key;
      stage.innerHTML=theme.resolve(render(index,cfg,clock,captures));
    }
  }
  function tick(now) {
    if(!running) return;
    if(previous!==null) clock=(clock+Math.min(.1,(now-previous)/1000)*speed)%cfg.duration;
    previous=now;
    paint();
    request=requestAnimationFrame(tick);
  }
  theme.watch();
  paint();
  return {
    duration:cfg.duration,
    chapters:cfg.chapters,
    time:()=>clock,
    setSpeed:value=>{speed=value;},
    pause:()=>{running=false;previous=null;cancelAnimationFrame(request);},
    play:()=>{if(!running){running=true;request=requestAnimationFrame(tick);}},
    seek:value=>{clock=Math.max(0,Math.min(value,cfg.duration-.001));previous=null;paint();}
  };
}
function mt(s) {
  const e=document.createElement('span');
  return s.split('$').map((part,i)=>{
    if(i%2) return katex.renderToString(part,{throwOnError:true});
    e.textContent=part;
    return e.innerHTML;
  }).join('');
}
