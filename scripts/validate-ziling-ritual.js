// 真正运行手势绑定与控制器状态机；不以“源码含关键词”代替交互回归。
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { setMaxListeners } = require('node:events');
setMaxListeners(0);
const source = name => fs.readFileSync(`${__dirname}/../src/tools/ziling-pai/${name}.js`, 'utf8');
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;

class Element extends EventTarget {
  constructor() { super(); this.style = { setProperty() {} }; this.classList = { add() {}, remove() {}, toggle() {} }; this.clientWidth = 375; this.attributes = {}; }
  setAttribute(k, v) { this.attributes[k] = v; }
  setPointerCapture() {}
  focus() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 190, height: 280 }; }
  remove() {}
  appendChild() {}
}
const send = (el, type, props = {}) => { const e = new Event(type, { cancelable: true }); Object.assign(e, props); el.dispatchEvent(e); };

(async () => {
  const { bindRitual, fanPosition } = await import(moduleUrl(source('ziling-ritual')));
  let time = 0, id = 0; const frames = new Map();
  global.document = new Element(); global.window = new Element();
  const savedPerformance = global.performance;
  global.performance = { now: () => time };
  global.requestAnimationFrame = fn => { frames.set(++id, fn); return id; };
  global.cancelAnimationFrame = key => frames.delete(key);
  const advance = count => { for (let i = 0; i < count; i++) { time += 50; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); } };
  const makeRoot = nodes => { const root = new Element(); root.querySelector = selector => nodes[selector] || null; return root; };
  const pointer = { isPrimary: true, button: 0, pointerId: 1, clientX: 200, clientY: 200 };

  let charged = 0; const chargeModel = { charge: 0 }, hold = new Element();
  let dispose = bindRitual(makeRoot({ '[data-zl-charge]': hold, '[data-zl-charge-status]': new Element() }), chargeModel, { charged: () => charged++ });
  send(hold, 'pointerdown', pointer); advance(10); send(hold, 'pointerup', pointer);
  const partial = chargeModel.charge; assert(partial > 0 && partial < 1); advance(40); assert.equal(chargeModel.charge, partial);
  send(hold, 'pointerdown', pointer); advance(2); send(hold, 'pointercancel', pointer); const cancelled = chargeModel.charge;
  advance(40); assert.equal(chargeModel.charge, cancelled);
  send(hold, 'pointerdown', pointer); advance(3); document.hidden = true; send(document, 'visibilitychange');
  const backgrounded = chargeModel.charge; advance(40); assert.equal(chargeModel.charge, backgrounded); document.hidden = false;
  send(hold, 'keydown', { key: 'Enter' }); advance(40); assert.equal(chargeModel.charge, 1); assert.equal(charged, 1);
  dispose(); assert.equal(frames.size, 0);

  const mix = new Element(), done = new Element(), tap = new Element();
  mix.querySelectorAll = () => Array.from({ length: 16 }, () => new Element());
  const mixing = { mixDistance: 0 }; let mixed = 0;
  dispose = bindRitual(makeRoot({ '[data-zl-mix]': mix, '[data-zl-mix-done]': done, '[data-zl-mix-tap]': tap, '[data-zl-mix-status]': new Element() }), mixing, { mix: () => mixed++ });
  assert.equal(done.disabled, true); send(mix, 'pointerdown', pointer);
  for (const x of [250, 200, 150, 200]) send(mix, 'pointermove', { ...pointer, clientX: x });
  advance(1); assert.equal(done.disabled, false); assert.equal(mixed, 4);
  send(mix, 'pointercancel', pointer); const distance = mixing.mixDistance;
  send(mix, 'pointermove', { ...pointer, clientX: 300 }); assert.equal(mixing.mixDistance, distance);
  dispose();

  for (const count of [16, 14, 32, 17, 12]) {
    const fan = new Element(), cards = Array.from({ length: count }, () => new Element()); fan.querySelectorAll = () => cards;
    const range = new Element(), prev = new Element(), next = new Element(); const state = {};
    dispose = bindRitual(makeRoot({ '[data-zl-fan]': fan, '[data-zl-fan-range]': range, '[data-zl-fan-counter]': new Element(), '[data-zl-fan-prev]': prev, '[data-zl-fan-next]': next }), state, {});
    const initialCenter = state.fanCenter;
    send(fan, 'pointerdown', pointer); send(fan, 'pointermove', { ...pointer, clientX: 190 });
    // 触屏会先隐式捕获到牌按钮；转交给扇形容器时，按钮的 lostpointercapture 向上冒泡。
    const childLost = new Event('lostpointercapture');
    Object.defineProperties(childLost, { target: { value: cards[0] }, pointerId: { value: 1 } });
    fan.dispatchEvent(childLost);
    send(fan, 'pointermove', { ...pointer, clientX: 100 });
    assert(state.fanCenter > initialCenter + 2, '子牌交出触摸捕获后，整副牌必须继续跟手');
    send(fan, 'pointerup', pointer);
    assert(state.suppressPickUntil > time, '拖动之后不能误触选牌');
    send(fan, 'pointerdown', pointer);
    send(fan, 'pointermove', { ...pointer, clientX: 240 });
    send(fan, 'lostpointercapture', { pointerId: 1 });
    const releasedCenter = state.fanCenter;
    send(fan, 'pointermove', { ...pointer, clientX: 320 });
    assert.equal(state.fanCenter, releasedCenter, '容器真正丢失捕获时必须停止');
    state.suppressPickUntil = 0;
    send(fan, 'pointerdown', pointer); send(fan, 'pointermove', { ...pointer, clientY: 250 }); send(fan, 'pointerup', pointer);
    assert(state.suppressPickUntil > time, '斜滑/竖滑不能误判为轻点');
    state.suppressPickUntil = 0;
    send(fan, 'pointerdown', pointer); send(fan, 'pointerup', pointer);
    assert.equal(state.suppressPickUntil, 0, '未拖动的轻点仍可选牌');
    for (let i = 0; i < count; i++) { range.value = i; send(range, 'input'); assert.equal(state.fanCenter, i); assert.equal(cards[i].tabIndex, 0); }
    send(fan, 'keydown', { key: 'Home' }); assert.equal(state.fanCenter, 0); assert.equal(prev.disabled, true);
    send(fan, 'keydown', { key: 'End' }); assert.equal(state.fanCenter, count - 1); assert.equal(next.disabled, true);
    dispose(); assert.equal(frames.size, 0);
    for (const width of [320, 375, 768]) assert.equal(fanPosition(0, 0, width).x, 0);
  }
  global.performance = savedPerformance;

  const { ZILING_DECK } = await import(moduleUrl(source('ziling-data')));
  const view = await import(moduleUrl(source('ziling-view-model').replace("import { ZILING_DECK } from './ziling-data.js';", `const ZILING_DECK=${JSON.stringify(ZILING_DECK)};`)));
  const element = new Element(); element.querySelector = () => element;
  const timers = new Map(); let timerId = 0;
  const context = vm.createContext({
    ...view, console, Math, performance: savedPerformance,
    ensureZilingStyles() {}, bindRitual: () => () => {}, createChartAdapter: () => null,
    renderCard: ({ card }) => `<div>${card['名']}</div>`, renderZoomCard: () => '',
    starfield: () => '', baguaRing: () => '', dipper: () => '', backArt: () => '<svg></svg>',
    loadReadings: () => [],
    document: { documentElement: { getAttribute: () => 'star' }, body: element, createElement: () => element },
    window: { matchMedia: () => ({ matches: false }) },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: key => timers.delete(key),
  });
  element.style = { setProperty() {} }; element.addEventListener = () => {};
  const controller = source('ziling-controller').replace(/^import[\s\S]*?from '[^']+';\n/gm, '').replace(/export /g, '');
  vm.runInContext(`${controller}\nglobalThis.test = {openZiling, closeZiling, beginQuestion, startFullDraw, finishCharge, mixDeck, finishMix, pickFullDrawCard, flipPickedCard, redrawEmptyMajor, confirmFullDrawCard, startQuickDraw, redrawQuickMajor, go, get model(){return model}}`, context);
  const a = context.test;
  const flush = () => { const queue = [...timers.values()]; timers.clear(); queue.forEach(fn => fn()); };
  a.openZiling(); a.model.type = 'career'; a.beginQuestion(); a.startFullDraw();
  assert.equal(a.model.phase, 'charge'); a.finishCharge(); a.finishCharge(); assert.equal(timers.size, 1); flush();
  assert.equal(a.model.phase, 'mixing'); a.finishMix(); assert.equal(a.model.phase, 'mixing');
  a.model.mixDistance = 200; a.mixDeck(); a.finishMix(); assert.equal(a.model.drawPool.length, 16);
  for (const count of [16, 15]) {
    const index = a.model.drawPool.findIndex(card => card.空宫); a.pickFullDrawCard(index);
    assert.equal(a.model.phase, 'selected'); assert(!element.innerHTML.includes('zl-selection-front'), '确认翻牌前不渲染牌面');
    a.flipPickedCard(); a.flipPickedCard(); flush();
    assert.equal(a.model.emptyMajorCount, 17 - count); a.confirmFullDrawCard(); assert.equal(a.model.spread.length, 0);
    a.redrawEmptyMajor(); assert.equal(a.model.drawPool.length, count - 1);
  }
  for (const [level, count] of [14, 14, 32, 17, 12].entries()) {
    assert.equal(a.model.drawPool.length, count);
    a.pickFullDrawCard(0); const locked = a.model.pendingCard;
    a.flipPickedCard(); a.confirmFullDrawCard(); assert.equal(a.model.spread.length, level, '翻面未完成时不能入阵'); flush();
    a.confirmFullDrawCard(); a.confirmFullDrawCard(); assert.equal(a.model.spread.length, level + 1); assert.equal(a.model.spread[level], locked); flush();
  }
  assert.equal(a.model.phase, 'done'); assert.equal(a.model.emptyMajorCount, 2);
  a.startFullDraw(); a.finishCharge(); a.closeZiling(); flush(); assert.equal(a.model, null); assert.equal(timers.size, 0);
  a.openZiling(); a.model.type = 'career'; a.beginQuestion(); a.startQuickDraw();
  assert(['quick-empty', 'done'].includes(a.model.phase));
  for (let i = 0; a.model.phase === 'quick-empty' && i < 3; i++) a.redrawQuickMajor();
  assert.equal(a.model.phase, 'done'); a.closeZiling();
  console.log('PASS ritual: hold/pause/cancel/background, gesture shuffle, all 5 fan pools reachable, drag suppression, sealed selection, double-click guards, 2 empty redraws, landing, cleanup and quick mode');
})().catch(error => { console.error(error); process.exit(1); });
