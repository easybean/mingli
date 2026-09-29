const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const uri=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const read=f=>fs.readFileSync(path.join(__dirname,'../src/tools/ziling-pai',f),'utf8');
(async()=>{
 const deck=await import(uri(read('ziling-data.js')));
 const vm=await import(uri(read('ziling-view-model.js').replace("'./ziling-data.js'",JSON.stringify(uri(read('ziling-data.js'))))));
 const spread=vm.DRAW_LEVELS.map(level=>vm.getDrawPool(level).find(c=>!c.空宫));
 const make=extra=>vm.assembleReading({spread,typeKey:'career',question:'留下还是离开？',...extra});
 assert.notEqual(make({intent:'advance'}).summary,make({intent:'leave'}).summary);
 assert.notEqual(make({focus:'cost'}).observation,make({focus:'connection'}).observation);
 for(const [i,level]of vm.DRAW_LEVELS.entries())for(const card of deck.ZILING_DECK[level]){
  const cards=[...spread];cards[i]=card;
  const r=make({spread:cards});assert.ok(r.sections[1].body.includes(card.名));assert.ok(!JSON.stringify(r).includes('undefined'));
 }
 const conflict=[...spread];conflict[1]=deck.ZILING_DECK.甲级辅星.find(c=>c.名==='擎羊');
 assert.match(make({spread:conflict}).tension,/冲突/);assert.ok(!make({spread:conflict}).tension.includes('最实的助力'));
 for(const typeKey of ['health','wealth','estate'])assert.equal(make({typeKey}).sensitive,true);
 assert.equal(make({question:'彩票会中奖吗'}).sensitive,true);
 assert.throws(()=>make({spread:[]}));
 const local=new Map();globalThis.localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)};
 const history=await import(uri(read('ziling-history.js')));
 const reading=make({window:'week'});const original=JSON.stringify(reading);
 assert.equal(history.saveReading({id:'one',reading,type:'career',createdAt:'2026-09-29T00:00:00Z'}).ok,true);
 assert.equal(history.updateReview('one','miss','没有发生 <img src=x>'),true);
 assert.equal(JSON.stringify(history.loadReadings()[0].reading),original);
 assert.equal(history.loadReadings()[0].dueAt,'2026-10-06T00:00:00.000Z');
 assert.equal(history.saveReading({id:'one',reading:make({intent:'leave'}),createdAt:'2026-09-29T00:00:00Z'}).ok,true);
 assert.equal(JSON.stringify(history.loadReadings()[0].reading),original);
 for(let i=2;i<=20;i++)assert.equal(history.saveReading({id:String(i),reading,createdAt:'2026-09-29T00:00:00Z'}).ok,true);
 assert.equal(history.saveReading({id:'21',reading,createdAt:'2026-09-29T00:00:00Z'}).ok,false);
 assert.equal(history.deleteReading('one'),true);assert.equal(history.loadReadings().length,19);
 localStorage.setItem=()=>{throw Error('quota')};assert.equal(history.saveReading({id:'fail',reading,createdAt:'2026-09-29T00:00:00Z'}).ok,false);
 console.log('PASS ziling reading: all 81 cards, intent/focus, sensitive boundaries, immutable original, review, cap and quota failure');
})().catch(e=>{console.error(e);process.exit(1)});
