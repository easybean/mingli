const { chromium } = require('playwright');
const { server } = require('../server');
const assert = require('node:assert/strict');
(async () => {
 await new Promise(r => server.listen(0, '127.0.0.1', r));
 const browser = await chromium.launch({headless:true});
 try {
 const page = await browser.newPage({viewport:{width:320,height:568}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.locator('[data-daily-outfit]').first().click();
 await page.locator('.outfit-preview').waitFor({state:'visible'});
 await page.locator('[data-mode="personal"]').click();
 assert.equal(await page.locator('[data-chart]').isVisible(),true);
 assert.equal(await page.locator('[data-save]').isDisabled(),true);
 await page.locator('[data-mode="public"]').click();
 await page.locator('.outfit-preview').waitFor({state:'visible'});
 await page.locator('[data-close]').click();
 await page.waitForSelector('.outfit-dialog',{state:'detached'});
 await page.evaluate(async()=>{
  const {openDailyOutfit}=await import('/src/components/daily-outfit.js');
  openDailyOutfit({astrolabeData:{bazi:{dayMaster:{stem:'甲'},pillars:[{label:'月柱',zhi:'辰'}]},reading:{fiveElement:{dayElement:'火',favored:['土']}}}},true);
 });
 await page.locator('.outfit-preview').waitFor({state:'visible'});
 assert.match(await page.locator('.outfit-explanation').innerText(),/庚壬/);
 await page.locator('[data-element="水"]').click();
 await page.locator('.outfit-preview').waitFor({state:'visible'});
 assert.match(await page.locator('.outfit-preview').getAttribute('alt'),/墨黑/);
 await page.locator('[data-scene="work"]').click();
 await page.locator('.outfit-preview').waitFor({state:'visible'});
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));
 await page.locator('[data-copy]').click();
 await page.locator('.outfit-copy').waitFor({state:'visible'});
 assert.match(await page.locator('.outfit-copy').inputValue(),/通勤/);
 assert.equal(await page.locator('[data-retention]').isChecked(),false);
 await page.locator('[data-retention]').check();
 assert.ok(await page.evaluate(()=>localStorage.getItem('mingli.analytics.outfit-retention.v1')));
 await page.locator('[data-retention]').uncheck();
 assert.equal(await page.evaluate(()=>localStorage.getItem('mingli.analytics.outfit-retention.v1')),null);
 assert.match(await page.locator('.outfit-status').innerText(),/长按下方文字复制/);
 const bounds=await page.locator('.outfit-dialog').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
 assert.ok(bounds.scroll<=bounds.width);
 await page.locator('.outfit-preview').screenshot({path:'/tmp/mingli-personal-preview.png'});
 await page.locator('.outfit-dialog').evaluate(el=>{el.scrollTop=0;});
 await page.screenshot({path:'/tmp/mingli-outfit-v082.png'});
 const validations=await page.evaluate(async()=>{
  const {buildPersonalOutfit,drawOutfitPoster}=await import('/src/components/daily-outfit.js');
  const data=await(await fetch('/api/daily-outfit?date=2026-09-28')).json();
  const issues=[];
  for(const el of ['金','木','水','火','土']) for(const scene of ['everyday','work','accent']) {
   const personal=buildPersonalOutfit(data,[el,el],el,scene);
   if(personal.referenceColors.length!==1)issues.push('dedup');
   const canvas=document.createElement('canvas'), ctx=canvas.getContext('2d');
   const original=ctx.fillText.bind(ctx);
   ctx.fillText=(text,x,y)=>{const width=ctx.measureText(text).width;const left=ctx.textAlign==='center'?x-width/2:ctx.textAlign==='right'?x-width:x;if(left<0||left+width>canvas.width||y>canvas.height)issues.push(text);original(text,x,y);};
   drawOutfitPoster(canvas,personal);
  }
  return issues;
 });
 assert.deepEqual(validations,[]);
 await page.locator('[data-close]').click();
 await page.waitForSelector('.outfit-dialog',{state:'detached'});
 await page.evaluate(async()=>{
  const {openDailyOutfit}=await import('/src/components/daily-outfit.js');
  openDailyOutfit({astrolabeData:{bazi:{dayMaster:{stem:'乙'},pillars:[{label:'月柱',zhi:'酉'}]},reading:{fiveElement:{dayElement:'木',favored:['水','火']}}}},true);
 });
 await page.waitForFunction(()=>document.querySelector('.outfit-status').textContent.includes('不硬下结论'));
 assert.equal(await page.locator('.outfit-preview').isVisible(),false);
 assert.equal(await page.locator('[data-save]').isDisabled(),true);
 let failures=0;
 await page.route('**/api/daily-outfit?*',route=>{ if(!failures++) return route.fulfill({status:503,body:'{}'}); return route.continue(); });
 await page.locator('[data-mode="public"]').click();
 await page.locator('[data-retry]').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-save]').isDisabled(),true);
 await page.locator('[data-retry]').click();
 await page.locator('.outfit-preview').waitFor({state:'visible'});
 await page.unroute('**/api/daily-outfit?*');
 await page.locator('[data-close]').click();
 await page.waitForSelector('.outfit-dialog',{state:'detached'});
 // Returning from birth input must not contaminate later story generation.
 const navigation=await page.evaluate(async()=>{
  const store=await import('/src/app/store.js');
  store.state.ui.outfitAfterChart=true;store.setActivePage('home');
  return store.state.ui.outfitAfterChart;
 });
 assert.equal(navigation,false);
 // A slow personal request must never overwrite a later public selection.
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/api/outfit-guide?*',async route=>{await gate;await route.continue().catch(()=>{});});
 await page.evaluate(async()=>{
  const {openDailyOutfit}=await import('/src/components/daily-outfit.js');
  openDailyOutfit({astrolabeData:{bazi:{dayMaster:{stem:'甲'},pillars:[{label:'月柱',zhi:'辰'}]}}},true);
 });
 await page.locator('[data-mode="public"]').click();
 await page.locator('.outfit-preview').waitFor({state:'visible'});
 release();
 assert.match(await page.locator('.outfit-status').innerText(),/通用配色/);
 assert.equal(await page.locator('.outfit-personal-controls').isVisible(),false);
 await page.locator('[data-close]').click();
 await page.waitForSelector('.outfit-dialog',{state:'detached'});
 await page.unroute('**/api/outfit-guide?*');
 for(const width of [320,375,768,1280]) {
  await page.setViewportSize({width,height:800});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.setViewportSize({width:375,height:812});
 await page.screenshot({path:'/tmp/mingli-home-v080.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS browser: empty/personal/public modes, five palettes, text bounds, 320px dialog, 4 homepage widths, no JS errors');
 } finally { await browser.close();server.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
