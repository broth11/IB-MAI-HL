const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),HOME=require('node:os').homedir();
const src=__dirname;
const root=path.join(src,'..');
const katexDir=path.join(HOME,'ap-stats-site/assets/vendor/katex');
const texTool=path.join(HOME,'Documents/Courses/AP Statistics/AP Statistics Splitter/_animation_eval/tools/tex/tex2glyph.js');
const katex=require(path.join(katexDir,'katex.min.js'));
const mathjax=require(texTool);
const blockDir=path.join(HOME,'.claude/skills/unit-page/scripts/anim_block');
const read=(base,name)=>fs.readFileSync(path.join(base,name),'utf8');
const lessons=require('./chapters.js');
const names=['equations','graph','gsolv','intersection'];
const captures=names.map(name=>{
  const f=path.join(src,'casio','gdc_intersection_'+name+'.webp');
  if(!fs.existsSync(f)){
    if(!process.argv.includes('--draft')) throw new Error('Missing calculator capture: '+f);
    return '';
  }
  return 'data:image/webp;base64,'+fs.readFileSync(f).toString('base64');
});
const sceneSource=read(src,'scenes.js');
const theme=read(blockDir,'anim_theme.js');
const glyphCache={};
function getGlyph(tex) {
  if(glyphCache[tex]) return glyphCache[tex];
  const {vb,inner}=mathjax.render(tex);
  if(inner.includes('data-mjx-error')) throw new Error('Invalid MathJax formula: '+tex);
  return glyphCache[tex]={vb,inner};
}
const vmScope={getGlyph};
vm.runInNewContext(sceneSource+'\n'+theme+'\nthis.render=render; this.colors=animTheme(null);',vmScope);
for(const [i,lesson] of lessons.entries()){
  for(const step of lesson.chapters) {
    for(let j=0;j<=12;j++) vmScope.render(i,lesson,step.t+step.reveal*j/12,captures);
  }
}
function substitute(source,from,to) {
  if(!source.includes(from)) throw new Error('Reference player no longer has expected code: '+from);
  return source.replace(from,to);
}
let player=read(blockDir,'anim_block.js');
player=substitute(player,'frame = q("iframe")','frame = q("[data-stage]")');
player=player.replace(/function A\(\) \{[^\n]+\}/,'function A() { return frame.anim || null; }');
if(!player.includes('return frame.anim')) throw new Error('Unable to attach the inline player.');
player=substitute(player,'svgText(s.tok, function (svg) {','(function(cb) { cb(s.svg); })(function (svg) {');
player=substitute(player,'if (steps[i + 1]) svgText(steps[i + 1].tok, function () { });','');
player=substitute(player,'function load() { if (reduce || frame.getAttribute("src")) return; frame.src = cfg.anim; }',
  'function load() { if (reduce || frame.anim) return; frame.anim = createPlayer(cfg.index, frame, root); chapters = frame.anim.chapters; frame.anim.setSpeed(speed); }');
player=player.replace(/  frame.addEventListener\("load",[\s\S]*?\n  \}\);\n/,'');
player=player.replace(/  function svgText\(url, cb\) \{[\s\S]*?\n  \}\n/,'');
player=substitute(player,'var a = A();\n          if (visible) { load(); if (a',
  'if (visible) load(); var a = A();\n          if (visible) { if (a');
player=substitute(player,'else { visible = true; load(); }','else { visible = true; load(); if (A()) A().play(); }');
player=substitute(player,'if (mode === "stills" || !a) { if (mode !== "stills") setMode("stills"); showStill(i); return; }',
  'if (mode === "stills") { showStill(i); return; }\n      if (!a) { load(); a = A(); if (!a) return; }');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
player=substitute(player,'b.querySelector("b").textContent = s.label;', 'b.querySelector("b").innerHTML = mt(s.label);');
player=substitute(player,'if (i >= 0) textBox.innerHTML = mt(steps[i].text);', `if (i >= 0) {
      selector.value = String(i);
      textBox.innerHTML = '<strong class="step-heading">'+mt(steps[i].label)+'</strong>'+mt(steps[i].text);
    }`);
player=substitute(player,'var chapters = steps.map', `var selector = q(".step-picker");
  steps.forEach(function(s,i){ selector.add(new Option((i+1)+". "+s.short, i)); });
  selector.addEventListener("change",function(){ buttons[Number(selector.value)].click(); });
  var chapters = steps.map`);
player=substitute(player,'var k = e.key === "ArrowRight"', `var reachable = tabBtns.filter(function(tab){return tab.offsetWidth > 0;});
      i = reachable.indexOf(b);
      var k = e.key === "ArrowRight"`);
player=substitute(player,'tabBtns.length - 1 - i','reachable.length - 1 - i');
player=substitute(player,'tabBtns[(i + k + tabBtns.length) % tabBtns.length]','reachable[(i + k + reachable.length) % reachable.length]');
player=player.replaceAll('playBtn.textContent = "Pause"','showPlayControl(true)')
  .replaceAll('playBtn.textContent = "Play"','showPlayControl(false)');
player=substitute(player,'function setActive(i) {',`function showPlayControl(isPlaying) {
    const action = isPlaying ? "Pause" : "Play";
    playBtn.dataset.operation = action.toLowerCase();
    playBtn.setAttribute("aria-label",action);
    playBtn.title = action;
  }
  function setActive(i) {`);
const icons={
  play:'<svg class="play-symbol" aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14l12-7Z"/></svg>',
  pause:'<svg class="pause-symbol" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>',
  restart:'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 10a7 7 0 1 1 1 7M5 5v5h5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  previous:'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next:'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
player=substitute(player,'count.textContent = "Step " + (i + 1) + " of " + N;',`count.innerHTML =
      '<span class="count-full">Step '+(i+1)+' of '+N+'</span>'+
      '<span class="count-short" aria-hidden="true">'+(i+1)+' / '+N+'</span>';`);
const withMath=s=>s.split('$').map((part,i)=>i%2?katex.renderToString(part,{throwOnError:true}):esc(part)).join('');
const shortLabels={
  segment:'Join the two sites',move:'Slide along the bisector',off:'Move off the bisector',
  ab:'First bisector',ac:'Second bisector',bc:'Third bisector',candidate:'Draw the candidate bisector',
  'against-a':'Draw the first new bisector','against-b':'Compare with the second site',
  'against-c':'Compare with the third site','left-vertex':'End both edges at the first vertex',
  first:'Radius at the first vertex',second:'Radius at the second vertex',estimate:'Estimate rainfall at the point',
  rotate:'Rotate B into quadrant 4',tilted:'The tilted bisector','edge-ac':'Edge on PB(A,C)','edge-ad':'Edge on PB(D,A)',
  'edge-bd':'Edge on PB(B,D)','edge-bc':'Edge on PB(B,C)',connect:'Join V1 to V2'
};
const json=x=>JSON.stringify(x).replaceAll('</','<\\/');
function markup(cfg,index){
  const bid='anim-'+cfg.id;
  const steps=cfg.chapters.map(({id,label,text,alt,rest})=>({
    id,label,short:shortLabels[id]||label,text,alt,svg:vmScope.render(index,cfg,rest,captures)
  }));
  const data=json({index,steps});
  const see='<p>'+withMath(cfg.read.see)+'</p><ul>'+cfg.read.notice.map(s=>'<li>'+withMath(s)+'</li>').join('')+'</ul>';
  const final=steps.at(-1);
  const fallback=vmScope.colors.resolve(final.svg.replace('<svg ','<svg role="img" aria-label="'+esc(final.alt)+'" '));
  return `<section class="lesson" id="${cfg.id}"><h2 class="fallback-title">${esc(cfg.title)}</h2>
<figure class="ced-fig ced-anim" id="${bid}">
  <noscript><div class="anim-fallback">${fallback}</div><div class="anim-see anim-see-static">${see}</div></noscript>
  <div class="anim-grid" hidden>
    <div class="anim-player">
      <div class="anim-frame"><div data-stage role="img" aria-label="${esc(cfg.stage)}"></div><div class="anim-still" role="img" aria-label="" hidden></div></div>
      <div class="anim-toolbar">
        <div class="anim-mode-row"><div class="anim-mode" role="group" aria-label="View">
          <button type="button" data-mode="anim" aria-pressed="true">Animation</button>
          <button type="button" data-mode="stills" aria-pressed="false">Step images</button>
        </div></div>
        <div class="anim-bar ctl-anim">
          <button type="button" class="icon-button play-button" data-play data-operation="pause" aria-label="Pause" title="Pause">${icons.play}${icons.pause}</button>
          <button type="button" class="icon-button" data-restart aria-label="Restart" title="Restart">${icons.restart}</button>
          <label class="anim-speed"><select aria-label="Playback speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option></select></label>
          <div class="anim-prog" aria-hidden="true"><i></i></div>
        </div>
        <div class="anim-bar ctl-still" hidden>
          <button type="button" class="icon-button" data-prev aria-label="Previous step" title="Previous step">${icons.previous}</button>
          <button type="button" class="icon-button" data-next aria-label="Next step" title="Next step">${icons.next}</button>
          <span class="anim-count" aria-live="polite"></span>
        </div>
      </div>
    </div>
    <div class="anim-head anim-tabs" role="tablist" aria-label="Explanation">
      <button type="button" role="tab" id="${bid}-t-watch" aria-controls="${bid}-p-watch" aria-selected="true" data-tab="watch">What to watch</button>
      <button type="button" role="tab" id="${bid}-t-see" aria-controls="${bid}-p-see" aria-selected="false" tabindex="-1" data-tab="see">What you see</button>
      <button class="anim-remember-tab" type="button" role="tab" id="${bid}-t-remember" aria-controls="${bid}-p-remember" aria-selected="false" tabindex="-1" data-tab="remember">Remember</button>
    </div>
    <div class="anim-steps" role="tabpanel" id="${bid}-p-watch" aria-labelledby="${bid}-t-watch"><ol></ol><select class="step-picker" aria-label="Animation step"></select><p class="anim-text" aria-live="polite"></p></div>
    <div class="anim-see" role="tabpanel" id="${bid}-p-see" aria-labelledby="${bid}-t-see" hidden>${see}</div>
    <div class="anim-see anim-remember-panel" role="tabpanel" id="${bid}-p-remember" aria-labelledby="${bid}-t-remember" hidden><p>${withMath(cfg.read.remember)}</p></div>
  </div>
  <div class="anim-read"><p class="rem"><strong>Remember:</strong> ${withMath(cfg.read.remember)}</p></div>
  <script type="application/json" class="anim-data">${data}</script>
</figure></section>`;
}
const out=process.argv.includes('--draft')?path.join(src,'Voronoi Diagrams.html'):path.join(root,'outputs','Voronoi Diagrams.html');
const optionTitles=['Perpendicular bisectors','Casio graph intersection','Three-site Voronoi diagram',
  'Trim Voronoi edges','Add a fourth site','Compare empty circles','Nearest neighbour'];
const options=optionTitles.map((title,i)=>`<option value="${i}">${i+1}. ${esc(title)}</option>`).join('');
const katexCss=read(katexDir,'katex.min.css').replace(/url\((fonts\/[^)]+\.woff2)\) format\("woff2"\)(?:,url\([^)]+\) format\("[^"]+"\))*/g,(_,file)=>{
  return 'url(data:font/woff2;base64,'+fs.readFileSync(path.join(katexDir,file)).toString('base64')+') format("woff2")';
});
const katexJs=read(katexDir,'katex.min.js').replace(/<\/script/gi,'<\\/script');
const document=`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Voronoi diagrams | MAI HL Unit 4B</title>
<style>${katexCss}
${read(blockDir,'anim_block.css')}
${read(src,'collection.css')}</style></head>
<body><main class="wrap"><header class="hero"><div class="hero-heading"><p class="eyebrow">MAI HL · Unit 4B</p><h1>Voronoi Diagrams<span class="current-title" hidden>: <span id="header-sketch">${esc(lessons[0].title)}</span><span id="header-sketch-short">${esc(lessons[0].stage)}</span></span></h1></div>
<nav class="animation-picker" aria-label="Animations" hidden><button type="button" id="previous-animation" aria-label="Previous animation">←</button>
<button type="button" id="next-animation" aria-label="Next animation">→</button>
<select id="animation-picker" aria-label="Choose an animation">${options}</select></nav></header>
${lessons.map(markup).join('\n')}
</main>
<script>${katexJs}</script>
<script>
const lessons=${json(lessons)};
const captures=${json(captures)};
const glyphCache=${json(glyphCache)};
function getGlyph(tex) {
  if(!glyphCache[tex]) throw new Error('Missing MathJax glyph: '+tex);
  return glyphCache[tex];
}
${sceneSource}
${theme}
${read(src,'player.js')}
${read(src,'navigation.js')}
${player}
</script></body></html>`;
fs.writeFileSync(out,document);
console.log(out,fs.statSync(out).size+' bytes, '+Object.keys(glyphCache).length+' MathJax labels');
