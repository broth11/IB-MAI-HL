const assert=require('node:assert/strict'),path=require('node:path'),HOME=require('node:os').homedir();
const {pathToFileURL}=require('node:url');
const puppeteer=require(path.join(HOME,'Documents/Courses/MAI HL/_tools/pdf_export/node_modules/puppeteer'));
const lessons=require('./chapters');
const target=pathToFileURL(path.join(__dirname,'../outputs/Voronoi Diagrams.html')).href;
(async()=>{
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,
  userDataDir:path.join(__dirname,'chrome-test'),args:['--no-first-run','--no-default-browser-check']});
 try {
  const page=await browser.newPage(), errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.setViewport({width:1440,height:1000});
  await page.goto(target);
  await page.waitForSelector('[data-stage] svg');
  assert.equal(await page.$$eval('.lesson',els=>els.length),7);
  const first='#anim-'+lessons[0].id;
  await page.click(first+' [data-play]');
  assert.equal(await page.$eval(first+' [data-play]',e=>e.textContent),'Play');
  const t=await page.$eval(first+' [data-stage]',e=>e.anim.time());
  await new Promise(r=>setTimeout(r,300));
  assert.equal(await page.$eval(first+' [data-stage]',e=>e.anim.time()),t);
  await page.select(first+' select','0.5');
  await page.click(first+' [data-restart]');
  await page.click(first+' .anim-steps li:nth-child(3) button');
  await page.waitForFunction(sel=>document.querySelector(sel+' .anim-steps li:nth-child(3) button').getAttribute('aria-current')==='step',{},first);
  for(const [i,cfg] of lessons.entries()) {
    const root='#anim-'+cfg.id;
    await page.$eval(root,e=>e.scrollIntoView({block:'start'}));
    await page.waitForSelector(root+' [data-stage] svg');
    await page.click(root+' [data-tab=see]');
    assert.equal(await page.$eval(root+' .anim-see[role=tabpanel]',e=>e.hidden),false);
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.$eval(root+' [data-tab=watch]',e=>e.getAttribute('aria-selected')),'true');
    await page.click(root+' [data-mode=stills]');
    await page.click(root+' .anim-steps li:first-child button');
    assert.equal(await page.$eval(root+' .anim-count',e=>e.textContent),'Step 1 of '+cfg.chapters.length);
    for(const [j,chapter] of cfg.chapters.entries()){
      if(j>0) await page.click(root+' [data-next]');
      assert.equal(await page.$eval(root+' .anim-still',el=>el.getAttribute('aria-label')),chapter.alt);
      const bad=await page.$eval(root+' .anim-still svg',el=>Array.from(el.querySelectorAll('text')).filter(t=>{
        const box=t.getBBox(),matrix=t.getCTM();
        const owner=el.getCTM(),m=owner.inverse().multiply(matrix);
        const a=new DOMPoint(box.x,box.y).matrixTransform(m),b=new DOMPoint(box.x+box.width,box.y+box.height).matrixTransform(m);
        return a.x<0||a.y<0||b.x>600.05||b.y>600.05;
      }).map(t=>t.textContent));
      assert.deepEqual(bad,[],cfg.id+' '+chapter.id+' overflow');
      if(i===1) {
        const img=await page.$eval(root+' .anim-still svg image',e=>e.getAttribute('href'));
        assert.ok(img.startsWith('data:image/webp;'));
      }
    }
    assert.equal(await page.$eval(root+' [data-next]',e=>e.disabled),true);
    if(i===2||i===4||i===5) await page.$eval(root+' .anim-frame', (e)=>e.scrollIntoView({block:'center'}));
    if(i===2||i===4||i===5) await (await page.$(root+' .anim-frame')).screenshot({path:path.join(__dirname,'scene-'+(i+1)+'.png')});
    console.log(cfg.id,cfg.chapters.length+' steps');
  }
  await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
  await page.goto(target+'#graph-intersection');
  await page.waitForSelector('#anim-graph-intersection [data-stage] svg');
  assert.equal(await page.$eval('body',e=>e.scrollWidth),375);
  await page.click('#anim-graph-intersection [data-mode=stills]');
  await page.click('#anim-graph-intersection .anim-steps li:last-child button');
  await (await page.$('#anim-graph-intersection .anim-frame')).screenshot({path:path.join(__dirname,'mobile-casio.png')});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.reload();
  const reduced=await page.$$eval('.anim-mode-row',els=>els.every(el=>el.hidden));
  assert.ok(reduced);
  assert.equal(await page.$$eval('div[data-stage] svg',els=>els.length),0);
  assert.equal(await page.$$eval('.anim-still svg',els=>els.length),7);
  assert.deepEqual(errors,[]);
  console.log('Local file, playback, tabs, step images, mobile and reduced motion passed.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
