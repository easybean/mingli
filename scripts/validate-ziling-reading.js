const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const uri=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const read=f=>fs.readFileSync(path.join(__dirname,'../src/tools/ziling-pai',f),'utf8');
(async()=>{
 const deck=await import(uri(read('ziling-data.js')));
 const vm=await import(uri(read('ziling-view-model.js').replace("'./ziling-data.js'",JSON.stringify(uri(read('ziling-data.js'))))));
 const spread=vm.DRAW_LEVELS.map(level=>vm.getDrawPool(level).find(c=>!c.空宫));
 const make=extra=>vm.assembleReading({spread,typeKey:'career',question:'留下还是离开？',...extra});
 assert.equal(make({intent:'advance'}).summary,make({intent:'leave'}).summary);
 const topics=['面试了一周还没回复，有戏吗','这笔尾款收得回来吗','分手后还会联系吗','考试能过吗'];
 assert.equal(new Set(topics.map(question=>make({question}).summary)).size,4);
 assert.equal(new Set(topics.map(question=>make({question}).observation)).size,4);
 assert.match(make({question:topics[1]}).observation,/金额.*交付/);
 assert.match(make({typeKey:'career',question:'客户一直说下周，这笔尾款能收回来吗'}).title,/这笔钱/);
 assert.ok(!/分手|复合/.test(make({question:'他还会联系我吗'}).summary));
 assert.match(make({question:'未识别的事情'}).summary,/没有匹配/);
 assert.match(make({question:''}).questionText,/未填写/);
 for(const [i,level]of vm.DRAW_LEVELS.entries())for(const card of deck.ZILING_DECK[level]){
  const cards=[...spread];cards[i]=card;
  const r=make({spread:cards});assert.ok(r.sections.find(s=>s.h==='五张牌的依据').body.includes(card.名));assert.ok(!JSON.stringify(r).includes('undefined'));
 }
 const conflict=[...spread];conflict[1]=deck.ZILING_DECK.甲级辅星.find(c=>c.名==='擎羊');
 assert.match(make({spread:conflict}).tension,/冲突/);assert.ok(!make({spread:conflict}).tension.includes('最实的助力'));
 for(const typeKey of ['health','wealth','estate'])assert.equal(make({typeKey}).sensitive,true);
 assert.equal(make({question:'彩票会中奖吗'}).sensitive,true);
 const money = names=>make({typeKey:'wealth',question:'今天买彩票能不能中',spread:names.map((n,i)=>vm.getDrawPool(vm.DRAW_LEVELS[i]).find(c=>c.名===n))});
 for(const [names,title] of [
   [['武曲','禄存','天福','喜神','化禄'],'这阵有财气'],
   [['破军','地劫','破碎','大耗','化忌'],'这阵偏耗'],
   [['武曲','禄存','天福','大耗','化忌'],'财气有起落'],
   [['武曲','禄存','天福','小耗','四化空'],'财中带小耗'],
   [['天机','文昌','三台','喜神','四化空'],'财象未明'],
 ]){
   const r=money(names);
   assert.equal(r.title,title);assert.equal(r.readingKind,'wealth-symbols');
   const body=[r.summary,r.tension,r.observation].join('');
   for(const name of names) assert(body.includes(name));
   assert(!/中奖|概率|加注|投注|号码/.test(body));
 }
 for(const [i,level] of vm.DRAW_LEVELS.entries())for(const c of vm.getDrawPool(level)){
   if(!i && c.空宫)continue;
   const cards=[...spread];cards[i]=c;
   assert(!JSON.stringify(make({question:'近期财运如何',spread:cards})).includes('undefined'));
 }
 assert.equal(make({question:'问财运，能不能停药'}).readingKind,undefined);
 const withLead=name=>[vm.getDrawPool('主星').find(c=>c.名===name),...spread.slice(1)];
 assert.match(make({question:topics[1],spread:withLead('武曲')}).tension,/金额、验收/);
 assert.match(make({question:topics[1],spread:withLead('巨门')}).tension,/经手的人/);
 const favorable=['紫微','文昌','三台','奏书','化科'].map((name,i)=>vm.getDrawPool(vm.DRAW_LEVELS[i]).find(c=>c.名===name));
 assert.notEqual(make({spread:favorable,question:topics[0]}).summary,make({spread:[favorable[0],conflict[1],...favorable.slice(2)],question:topics[0]}).summary);
 assert.throws(()=>make({spread:[]}));
 const local=new Map();globalThis.localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)};
 const history=await import(uri(read('ziling-history.js')));
 const reading=make({window:'week'});const original=JSON.stringify(reading);
 const legacy={...reading,version:'ziling-reading-2',summary:'旧版保存的原文'};
 assert.equal(history.saveReading({id:'legacy',reading:legacy,type:'career',createdAt:'2026-09-29T00:00:00Z'}).ok,true);
 assert.deepEqual(history.loadReadings()[0].reading,legacy);history.deleteReading('legacy');
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
 console.log('PASS ziling reading: question-specific answers, star combinations, all 81 cards, sensitive boundaries, v2/v3 history and immutable review');
})().catch(e=>{console.error(e);process.exit(1)});
