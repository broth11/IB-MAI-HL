const assert=require('node:assert/strict'),path=require('node:path'),HOME=require('node:os').homedir();
const {pathToFileURL}=require('node:url');
const puppeteer=require(path.join(HOME,'Documents/Courses/MAI HL/_tools/pdf_export/node_modules/puppeteer'));
const lessons=require('./chapters');
const samples=process.argv.includes('--sample');
const target=pathToFileURL(path.join(__dirname,'Voronoi Diagrams.html')).href;
const profiles=[
 {width:1440,height:900},
 {width:1406,height:814},
 {width:1024,height:768},
 {width:820,height:1180,hasTouch:true},
 {width:390,height:844,isMobile:true,hasTouch:true},
 {width:375,height:667,isMobile:true,hasTouch:true},
 {width:360,height:640,isMobile:true,hasTouch:true},
 {width:844,height:390,isMobile:true,hasTouch:true},
 {width:667,height:375,isMobile:true,hasTouch:true}
];
(async()=>{
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,
 userDataDir:path.join(__dirname,'chrome-test'),args:['--no-first-run','--no-default-browser-check']});
 const notes=[];
 try{
  const page=await browser.newPage(),errors=[],failures=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>{if(!r.url().startsWith('data:')) failures.push(r.url());});
  for(const profile of profiles){
   await page.setViewport(profile);
   await page.goto(target);
   await page.waitForSelector('.lesson:not([hidden]) [data-stage] svg');
   await page.evaluate(()=>document.fonts.ready);
   for(const [index,lesson] of lessons.entries()){
    if(index>0) await page.select('#animation-picker',String(index));
    const root='#anim-'+lesson.id;
    await page.waitForSelector(root+' [data-stage] svg',{visible:true});
    assert.equal(await page.$$('.lesson:not([hidden])').then(a=>a.length),1);
    if(index===0&&profile.width===1440) {
      await page.click(root+' [data-play]');
      assert.equal(await page.$eval(root+' [data-play]',e=>e.getAttribute('aria-label')),'Play');
      assert.equal(await page.$eval(root+' .play-symbol',e=>getComputedStyle(e).display),'block');
      const t=await page.$eval(root+' [data-stage]',e=>e.anim.time());
      await new Promise(r=>setTimeout(r,250));
      assert.equal(await page.$eval(root+' [data-stage]',e=>e.anim.time()),t);
      await page.select(root+' .anim-speed select','0.5');
      await page.click(root+' [data-restart]');
      assert.equal(await page.$eval(root+' [data-play]',e=>e.getAttribute('aria-label')),'Pause');
    }
    const header=await page.$eval('#header-sketch',e=>e.textContent);
    assert.equal(header,lesson.title);
    const placement=await page.$eval(root,e=>{
      const box=selector=>e.querySelector(selector).getBoundingClientRect();
      return {frame:box('.anim-frame').bottom,toolbar:box('.anim-toolbar').top,
        columns:getComputedStyle(e.querySelector('.anim-steps ol')).gridTemplateColumns,
        width:box('.anim-frame').width,height:box('.anim-frame').height,
        mode:box('.anim-mode').top,play:box('[data-play]').top,
        selectLast:document.querySelector('.animation-picker').lastElementChild.id};
    });
    assert.ok(placement.toolbar>=placement.frame-0.1);
    assert.ok(Math.abs(placement.height-placement.width)<=1);
    assert.equal(placement.selectLast,'animation-picker');
    if(profile.width>=1406) {
      assert.ok(placement.width>589, JSON.stringify(placement));
      assert.match(placement.columns,/^\d+(?:\.\d+)?px$/);
      assert.ok(Math.abs(placement.mode-placement.play)<5, JSON.stringify(placement));
    }
    await page.click(root+' [data-mode=stills]');
    if(await page.$eval(root+' .anim-steps ol',e=>getComputedStyle(e).display!=='none')) await page.click(root+' .anim-steps li:first-child button');
    else await page.select(root+' .step-picker','0');
    for(const [j,chapter] of lesson.chapters.entries()){
     if(j) await page.click(root+' [data-next]');
     assert.equal(await page.$eval(root+' .anim-still',e=>e.getAttribute('aria-label')),chapter.alt);
     await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
     const size=await page.evaluate(()=>({
       w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,
       W:innerWidth,H:innerHeight,frame:document.querySelector('.lesson:not([hidden]) .anim-frame').offsetHeight
     }));
     if(size.h>size.H+1||size.w>size.W) notes.push([profile.width,profile.height,lesson.id,chapter.id,size]);
     if(profile.width===1440){
      assert.equal(await page.$$eval(root+' .anim-still [data-mjx-error]',e=>e.length),0);
      if(index!==1) assert.ok(await page.$$eval(root+' .anim-still [data-math-label]',e=>e.length)>0);
      if(chapter.id==='left-vertex'||chapter.id==='tie'||chapter.id==='largest'||chapter.id==='smaller'||lesson.id==='three-sites'&&(chapter.id==='summary'||chapter.id==='bc'))
        await page.screenshot({path:path.join(__dirname,'revision-'+lesson.id+'-'+chapter.id+'.png'),captureBeyondViewport:false});
      if(lesson.id==='three-sites'&&chapter.id==='summary')
        assert.equal(await page.$eval(root+' .anim-still svg',svg=>Array.from(svg.querySelectorAll('line')).some(l=>l.getAttribute('x1')==='318'&&l.getAttribute('y1')==='338'&&l.getAttribute('x2')==='171'&&l.getAttribute('y2')==='289')),false);
      if(chapter.id==='left-vertex') assert.ok(await page.$$eval(root+' .anim-still [data-right-angle]',e=>e.length)>=3);
     }
    }
    await page.click(root+' [data-tab=see]');
    assert.equal(await page.$eval(root+' [data-tab=see]',e=>e.getAttribute('aria-selected')),'true');
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const size=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,W:innerWidth,H:innerHeight}));
    if(size.h>size.H+1||size.w>size.W) notes.push([profile.width,profile.height,lesson.id,'what-you-see',size]);
    if(profile.height<=720) {
      await page.click(root+' [data-tab=remember]');
      assert.equal(await page.$eval(root+' .anim-remember-panel',e=>e.hidden),false);
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.$eval(root+' [data-tab=see]',e=>e.getAttribute('aria-selected')),'true');
      if(profile.width===360&&index===4)
        await page.screenshot({path:path.join(__dirname,'revision-compact.png'),captureBeyondViewport:false});
    }
    if(profile.width===1406&&index===2) await page.screenshot({path:path.join(__dirname,'toolbar-desktop.png')});
    if(profile.width===390&&index===6) await page.screenshot({path:path.join(__dirname,'revision-mobile.png'),captureBeyondViewport:false});
   }
   console.log('Checked',profile.width,profile.height);
  }
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.goto(target+'#nearest-neighbour');
  await page.reload();
  assert.equal(await page.$eval('#nearest-neighbour',e=>e.hidden),false);
  assert.equal(await page.$eval('#anim-nearest-neighbour .anim-mode-row',e=>e.hidden),true);
  assert.equal(await page.$$eval('#anim-nearest-neighbour .anim-still svg',e=>e.length),1);
  assert.deepEqual(errors,[]);
  assert.deepEqual(failures,[]);
  console.log('Viewport overflow cases:',JSON.stringify(notes));
  if(notes.length) process.exitCode=2;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
