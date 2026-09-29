const {chromium}=require('playwright');
const {server}=require('../server');
const assert=require('node:assert/strict');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:320,height:568}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Math.random=()=>0.05;});
  const url=`http://127.0.0.1:${server.address().port}`;
  await page.goto(url);await page.locator('[data-ziling-open]').first().click();
  await page.locator('[data-zl-to-types]').click();await page.locator('[data-zl-type="career"]').click();
  const question='要离开吗 <img src=x onerror="window.INJECTED=1">';
  await page.locator('[data-zl-question]').fill(question);
  await page.locator('[data-zl-intent]').selectOption('leave');
  await page.locator('[data-zl-focus]').selectOption('cost');
  await page.locator('[data-zl-window]').selectOption('week');
  await page.screenshot({path:'/tmp/mingli-ziling-question-v090.png'});
  await page.locator('[data-zl-question-continue]').click();
  await page.locator('[data-zl-quick-draw]').click();await page.locator('[data-zl-to-reading]').click();
  await page.locator('[data-zl-save]').waitFor();
  assert.equal(await page.evaluate(()=>window.INJECTED),undefined);
  assert.match(await page.locator('.zl-result-lead').innerText(),/想退出/);
  assert.equal(await page.locator('.zl-overlay img[src="x"]').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('mingli.ziling.history.v1')),null);
  await page.locator('.zl-screen').evaluate(el=>{el.scrollTop=0;});
  await page.screenshot({path:'/tmp/mingli-ziling-reading-v090.png'});
  await page.locator('[data-zl-save]').click();
  const initial=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('mingli.ziling.history.v1'))[0].reading));
  await page.locator('[data-zl-review]').selectOption('miss');
  await page.locator('[data-zl-review-note]').fill('后来没有发生 <svg onload="window.INJECTED=2">');
  await page.locator('[data-zl-review-save]').click();
  assert.equal(await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('mingli.ziling.history.v1'))[0].reading)),initial);
  await page.locator('[data-zl-close]').click();await page.reload();
  await page.locator('[data-ziling-open]').first().click();await page.locator('[data-zl-history]').click();
  await page.locator('[data-zl-record]').click();
  assert.equal(await page.locator('[data-zl-review]').inputValue(),'miss');
  assert.equal(await page.evaluate(()=>window.INJECTED),undefined);
  for(const width of [320,375,768]){await page.setViewportSize({width,height:700});assert.ok(await page.locator('.zl-screen').evaluate(el=>el.scrollWidth<=el.clientWidth));}
  await page.locator('[data-zl-history]').click();
  page.once('dialog',d=>d.accept());await page.locator('[data-zl-delete]').click();
  assert.equal(await page.locator('[data-zl-record]').count(),0);
  await page.locator('[data-zl-new]').click();
  await page.locator('[data-zl-to-types]').click();
  await page.locator('[data-zl-type="career"]').click();
  await page.locator('[data-zl-question-skip]').click();
  await page.evaluate(()=>{Math.random=()=>0.999;});
  await page.locator('[data-zl-full-draw]').click();
  assert.equal(await page.locator('[data-zl-pick-card]').count(),16);
  for(const count of [16,15]){
   await page.locator('[data-zl-pick-card]').last().click();
   assert.equal(await page.locator('[data-zl-to-reading]').count(),0);
   await page.locator('[data-zl-redraw-major]').click();
   assert.equal(await page.locator('[data-zl-pick-card]').count(),count-1);
  }
  for(const count of [14,14,32,17,12]){
   assert.equal(await page.locator('[data-zl-pick-card]').count(),count);
   await page.locator('[data-zl-pick-card]').first().click();
   await page.locator('[data-zl-confirm-card]').click();
  }
  await page.locator('[data-zl-to-reading]').click();
  assert.match(await page.locator('.zl-screen').innerText(),/连续 2 次遇到空宫/);
  assert.deepEqual(errors,[]);
  console.log('PASS browser: question selection, quick draw, escaped payloads, explicit save, immutable replay, review, reload, delete, mobile widths');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
