// 紫灵牌问事 · 浮层控制器。挂在 document.body，自管内部状态与动画，
// 不经过主 app 的 store/notify 重渲染循环（避免动效被打断）。
// 与主 app 仅两处相连：openZiling 入参（命盘 + 主题回调）。删本目录即可整体移除。
import { ensureZilingStyles } from './ziling-styles.js';
import {
  QUESTION_TYPES, DRAW_LEVELS, getDrawPool, drawSpread, buildSpread, assembleReading,
} from './ziling-view-model.js';
import { renderCard, renderZoomCard } from './ziling-card.js';
import { createChartAdapter } from './chart-adapter.js';
import { starfield, baguaRing, dipper, backArt } from './ziling-art.js';

const SCREENS = ['cover', 'types', 'shuffle', 'reading'];

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let root = null;
let model = null;
let chart = null;
let onThemeChange = null;

const currentTheme = () => document.documentElement.getAttribute('data-theme') || 'star';
const clearTimers = () => { (model?.timers || []).forEach(clearTimeout); if (model) model.timers = []; };

// ---- 牌阵发牌位（300x320 舞台内）。两排：①主星+四化并排 ②甲乙丙
// 注意：水平定位只用像素 left，不用 transform/translateX——zl-rise 入场动画会动 transform，
// 用 translateX 定位会被动画覆盖导致牌挤到正中重叠。 ----
const DEAL_LAYOUT = [
  { left: '14%', top: '24px', z: 2, w: '34%', label: '主星' },
  { left: '2%', top: '216px', z: 1, w: '31%', label: '甲级辅星' },
  { left: '34.5%', top: '216px', z: 1, w: '31%', label: '乙级辅星' },
  { left: '67%', top: '216px', z: 1, w: '31%', label: '丙级辅星' },
  { left: '52%', top: '24px', z: 2, w: '34%', label: '四化' },
];

const DRAW_STEPS = [
  { title: '第一抽 · 主星', hint: '从 16 张主星牌中凭直觉选一张，它定下这一问的核心气质。' },
  { title: '第二抽 · 甲级辅星', hint: '从 14 张甲级辅星中选一张，看此事最有力的助推。' },
  { title: '第三抽 · 乙级辅星', hint: '从 32 张乙级辅星中选一张，它带来更细的提醒。' },
  { title: '第四抽 · 丙级辅星', hint: '从 17 张丙级辅星中选一张，留意这一步的顺逆。' },
  { title: '第五抽 · 四化', hint: '从 12 张四化牌中选一张，看这件事会往哪里转。' },
];

const renderDealStage = (spread) => `
  <div class="zl-deal">
    ${spread.map((card, i) => {
      const L = DEAL_LAYOUT[i];
      return `<div class="zl-slot is-revealed"
        style="left:${L.left};top:${L.top};width:${L.w};z-index:${L.z};animation-delay:${(i * 0.12).toFixed(2)}s">
        <div class="zl-slot-label">${L.label}</div>
        <div class="zl-glow"></div>
        ${renderCard({ card, idx: i })}
      </div>`;
    }).join('')}
  </div>`;

// ---- 各屏内容 ----
const coverScreen = () => `
  <div class="zl-pad" style="text-align:center">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div class="zl-cover-art">
        <div class="zl-cover-ring">${baguaRing(170)}</div>
        <div class="zl-cover-dipper">${dipper()}</div>
      </div>
      <div class="zl-kicker">ZI LING ORACLE</div>
      <div class="zl-cover-title">紫灵牌问事</div>
      <div class="zl-cover-lede">以紫微斗数的五星成阵，<br>为你今日心中一事，落一道趋势的微光。</div>
      <div class="zl-pill">趣 味 占 卜 · 非 宿 命</div>
      <button class="zl-btn" data-zl-to-types style="margin-top:36px;width:230px;height:54px;font-size:16px">开始问事 →</button>
    </div>
    <div class="zl-disclaimer">结果仅为趋势提示，非定论 · 行动取决于你</div>
  </div>`;

const typesScreen = () => {
  const t = QUESTION_TYPES.find((x) => x.key === model.type);
  return `
  <div class="zl-pad">
    <div class="zl-kicker">STEP 01</div>
    <div class="zl-h" style="font-size:23px;margin-top:9px">你想问的，是哪一类事？</div>
    <div class="zl-sub" style="margin-top:7px">择一而问，心念越定，牌象越清</div>
    <div class="zl-types">
      ${QUESTION_TYPES.map((x) => `
        <div class="zl-type ${model.type === x.key ? 'is-sel' : ''}" data-zl-type="${x.key}">
          <div class="zl-type-glyph">${x.glyph}</div>
          <div class="zl-type-name">${x.name}</div>
          <div class="zl-type-en">${x.en}</div>
        </div>`).join('')}
    </div>
    ${model.questionPromptOpen ? questionPrompt(t) : ''}
  </div>`;
};

// 不把问题输入藏在分类按钮上方。用户先选大类，再决定要不要补一句具体情境；
// 关闭弹窗不会清掉已选分类；再次点分类即可重新打开输入框。
const questionPrompt = (type) => `
  <div class="zl-question-backdrop" data-zl-question-close>
    <section class="zl-question-modal" role="dialog" aria-modal="true" aria-labelledby="zl-question-title">
      <button class="zl-question-close" type="button" data-zl-question-close aria-label="暂不填写">✕</button>
      <div class="zl-question-kicker">${esc(type?.name || '这一类事')}</div>
      <h2 id="zl-question-title">这一次，你具体想问什么？</h2>
      <p>写一句就好，比如“该不该接这个 offer”。不写也没关系，牌会按你选的类别来解。</p>
      <textarea class="zl-qinput zl-qinput-modal" data-zl-question rows="3" maxlength="40" autofocus
        placeholder="可留空，写下此刻最想问的一句">${esc(model.question)}</textarea>
      <div class="zl-question-actions">
        <button class="zl-question-skip" type="button" data-zl-question-skip>不填，直接继续</button>
        <button class="zl-btn zl-question-continue" type="button" data-zl-question-continue>继续 →</button>
      </div>
    </section>
  </div>`;

const drawModeScreen = () => `
  <div class="zl-draw-mode">
    <button class="zl-mode-card is-full" type="button" data-zl-full-draw>
      <span class="zl-mode-badge">更有仪式感</span>
      <strong>完整抽牌</strong>
      <span>五级牌库依次铺开，亲手选择 5 次</span>
      <em>约 1–2 分钟</em>
    </button>
    <button class="zl-mode-card" type="button" data-zl-quick-draw>
      <strong>简化抽牌</strong>
      <span>一次抽齐五张，直接查看完整牌阵</span>
      <em>约 10 秒</em>
    </button>
  </div>`;

const drawGrid = () => {
  const dense = model.drawPool.length > 20 ? 'is-dense' : model.drawPool.length > 16 ? 'is-medium' : '';
  return `
    <div class="zl-deck-grid ${dense}" aria-label="${DRAW_LEVELS[model.drawLevelIndex]}牌库，共${model.drawPool.length}张">
      ${model.drawPool.map((card, i) => `
        <button class="zl-deck-choice" type="button" data-zl-pick-card="${i}" aria-label="选择第${i + 1}张牌">
          <span class="zl-mini-back" style="--zl-card-order:${i}">
            ${backArt(11 + i * 7)}
          </span>
        </button>`).join('')}
    </div>
    <button class="zl-draw-switch" type="button" data-zl-quick-draw>不想逐张选？改用简化抽牌</button>`;
};

const revealPickedCard = () => {
  const isEmptyMajor = model.drawLevelIndex === 0 && model.pendingCard?.['空宫'];
  const next = model.drawLevelIndex < DRAW_STEPS.length - 1 ? DRAW_STEPS[model.drawLevelIndex + 1].title : '查看完整牌阵';
  return `
    <div class="zl-picked-wrap">
      <div class="zl-picked-kicker">你抽到的是</div>
      <div class="zl-picked-card">${renderCard({ card: model.pendingCard, idx: model.pendingIndex })}</div>
      ${isEmptyMajor
        ? '<div class="zl-empty-note">这张是空宫牌，不替你随机补牌。回到剩余主星中，再凭直觉亲自抽一张。</div><button class="zl-btn" type="button" data-zl-redraw-major>空宫 · 我自己再抽一张 →</button>'
        : `<button class="zl-btn" type="button" data-zl-confirm-card>收下这张 · ${next} →</button>`}
    </div>`;
};

const completedDraw = () => `
  <div class="zl-stage">${renderDealStage(model.spread)}</div>
  ${model.emptyMajorCount ? `<div class="zl-draw-imprint">特殊印记 · 曾遇空宫 × ${model.emptyMajorCount}</div>` : ''}
  <div class="zl-sub zl-complete-hint">轻点任意一张牌可放大查看</div>
  <button class="zl-btn" data-zl-to-reading style="width:230px;height:52px;font-size:15px">解这一阵 →</button>`;

const quickEmptyDraw = () => `
  <div class="zl-stage">${renderDealStage(model.spread)}</div>
  <div class="zl-empty-note zl-quick-empty-note">
    ${model.emptyMajorCount > 1 ? `已经连续 ${model.emptyMajorCount} 次遇到空宫。` : '主星位置抽到空宫。'}
    此局主意尚未显现，请亲手点击，引出下一张主星。
  </div>
  <button class="zl-btn zl-quick-redraw" type="button" data-zl-quick-redraw-major>再抽一张主星 →</button>`;

const shuffleScreen = () => {
  const choosingMode = !model.drawMode;
  const done = model.phase === 'done';
  const revealing = model.phase === 'reveal';
  const quickEmpty = model.phase === 'quick-empty';
  const step = DRAW_STEPS[model.drawLevelIndex] || DRAW_STEPS[0];
  const title = choosingMode ? '选择抽牌方式' : done ? '五星已成阵' : quickEmpty ? '空宫 · 待引星' : step.title;
  const hint = choosingMode
    ? '想慢慢选，还是快速看结果？两种方式使用同一套牌。'
    : done ? `${model.drawMode === 'quick' ? '已为你一次抽齐五张牌。' : '五次选择已完成。'}牌阵就在这里。`
      : quickEmpty ? '空宫不是废牌，它意味着这一问的主轴还没有直接显现。' : step.hint;
  const body = choosingMode ? drawModeScreen() : done ? completedDraw() : quickEmpty ? quickEmptyDraw() : revealing ? revealPickedCard() : drawGrid();
  return `
  <div class="zl-pad" style="align-items:center">
    <div class="zl-kicker">STEP 02</div>
    <div class="zl-h" style="font-size:22px;margin-top:9px">${title}</div>
    <div class="zl-sub" style="margin-top:7px;min-height:17px">${hint}</div>
    ${body}
  </div>`;
};

const readingScreen = () => {
  if (!model.spread) model.spread = buildSpread({ typeKey: model.type, chart });
  const r = assembleReading({
    spread: model.spread, typeKey: model.type, chart, question: model.question,
    drawTrace: { mode: model.drawMode, emptyMajorCount: model.emptyMajorCount },
  });
  return `
  <div class="zl-pad">
    <div class="zl-kicker">STEP 03 · 解读</div>
    <div class="zl-h" style="font-size:24px;font-weight:700;margin-top:10px">${r.title}</div>
    <div class="zl-chips">${r.chips.map((c) => `<span class="zl-chip" style="background:${c.color}">${c.label}</span>`).join('')}</div>
    <div class="zl-sections">
      ${r.sections.map((s) => `
        <div class="zl-section">
          <div class="zl-section-h"><span class="zl-dot"></span><span>${s.h}</span></div>
          <div class="zl-section-body">${s.body}</div>
        </div>`).join('')}
    </div>
    <div class="zl-foot">结果仅为趋势提示，非定论，行动取决于你。<br>愿此一阵，助你看清心之所向。</div>
    <button class="zl-btn zl-btn-ghost" data-zl-restart style="margin-top:18px;width:100%;height:50px;font-size:15px">再问一事 ↺</button>
  </div>`;
};

const SCREEN_RENDER = {
  cover: coverScreen, types: typesScreen, shuffle: shuffleScreen, reading: readingScreen,
};

const ambient = () => {
  const bright = currentTheme() === 'star';
  const gold = bright ? '#D6B25E' : '#A8801F';
  return `
  <div class="zl-ambient">
    ${starfield(70, 393, 852, 3, bright)}
    <div style="position:absolute;width:460px;height:460px;right:-160px;top:-110px;opacity:${bright ? 0.16 : 0.13}">
      <div style="position:absolute;inset:0;animation:zl-spin 220s linear infinite">${baguaRing(460, gold, true)}</div>
      <div style="position:absolute;inset:80px;animation:zl-spin 160s linear infinite reverse">${baguaRing(300, gold, false)}</div>
    </div>
  </div>`;
};

const topbar = () => {
  const theme = currentTheme();
  return `
  <div class="zl-topbar">
    <button class="zl-back" data-zl-back style="visibility:${model.screen === 'cover' ? 'hidden' : 'visible'}">‹ 返回</button>
    <div style="display:flex;align-items:center;gap:10px">
      <div class="zl-themes">
        <button class="zl-theme-tab ${theme === 'star' ? 'is-active' : ''}" data-zl-theme="star">夜</button>
        <button class="zl-theme-tab ${theme === 'star-day' ? 'is-active' : ''}" data-zl-theme="star-day">昼</button>
      </div>
      <button class="zl-close" data-zl-close aria-label="关闭">✕</button>
    </div>
  </div>`;
};

const dotsBar = () => {
  const i = SCREENS.indexOf(model.screen);
  return `<div class="zl-dots">${SCREENS.map((s, idx) =>
    `<span class="${idx === i ? 'is-active' : idx < i ? 'is-done' : ''}"></span>`).join('')}</div>`;
};

const render = () => {
  if (!root) return;
  root.innerHTML = `${ambient()}${topbar()}<div class="zl-screen">${SCREEN_RENDER[model.screen]()}</div>${dotsBar()}`;
};

// ---- 动作 ----
const go = (screen) => { clearTimers(); closeZoom(); model.screen = screen; render(); };
const goBack = () => { const i = SCREENS.indexOf(model.screen); if (i > 0) go(SCREENS[i - 1]); };
const beginQuestion = () => {
  if (!model.type) return;
  model.questionPromptOpen = false;
  model.drawMode = null; model.drawLevelIndex = 0; model.drawPool = [];
  model.pendingCard = null; model.spread = []; model.emptyMajorCount = 0; model.quickMajorPool = [];
  model.phase = 'mode';
  go('shuffle');
};

// 放大大卡：点牌 → 占大半屏读释义；再点任意处复原
const openZoom = (idx) => {
  const card = model.spread && model.spread[idx];
  if (!card || !root) return;
  closeZoom();
  const el = document.createElement('div');
  el.className = 'zl-zoom-backdrop';
  el.setAttribute('data-zl-zoom', '');
  el.innerHTML = renderZoomCard(card);
  root.appendChild(el);
};
function closeZoom() {
  const e = root && root.querySelector('[data-zl-zoom]');
  if (e) e.remove();
}

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  if (onThemeChange) onThemeChange(theme);
  render();
};

const shuffled = (cards) => {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const prepareDrawLevel = (index) => {
  model.drawLevelIndex = index;
  model.drawPool = shuffled(getDrawPool(DRAW_LEVELS[index]));
  model.pendingCard = null;
  model.phase = 'choosing';
};

const startFullDraw = () => {
  model.drawMode = 'full';
  model.spread = [];
  model.emptyMajorCount = 0;
  model.quickMajorPool = [];
  prepareDrawLevel(0);
  render();
};

const startQuickDraw = () => {
  model.drawMode = 'quick';
  model.spread = drawSpread();
  model.emptyMajorCount = model.spread[0]?.['空宫'] ? 1 : 0;
  model.quickMajorPool = getDrawPool('主星');
  if (model.emptyMajorCount) {
    const emptyIndex = model.quickMajorPool.findIndex((card) => card['空宫']);
    if (emptyIndex >= 0) model.quickMajorPool.splice(emptyIndex, 1);
  }
  model.phase = model.emptyMajorCount ? 'quick-empty' : 'done';
  render();
};

const pickFullDrawCard = (index) => {
  if (model.drawMode !== 'full' || model.phase !== 'choosing') return;
  const picked = model.drawPool[index];
  if (!picked) return;
  model.pendingIndex = index;
  model.pendingCard = picked;
  if (model.drawLevelIndex === 0 && picked['空宫']) model.emptyMajorCount += 1;
  model.phase = 'reveal';
  render();
};

const redrawQuickMajor = () => {
  if (model.drawMode !== 'quick' || model.phase !== 'quick-empty' || !model.quickMajorPool.length) return;
  const index = Math.floor(Math.random() * model.quickMajorPool.length);
  const [picked] = model.quickMajorPool.splice(index, 1);
  model.spread[0] = picked;
  if (picked?.['空宫']) {
    model.emptyMajorCount += 1;
    model.phase = 'quick-empty';
  } else {
    model.phase = 'done';
  }
  render();
};

const redrawEmptyMajor = () => {
  if (model.drawMode !== 'full' || model.phase !== 'reveal' || model.drawLevelIndex !== 0 || !model.pendingCard?.['空宫']) return;
  model.drawPool = model.drawPool.filter((card, index) => index !== model.pendingIndex);
  model.pendingCard = null;
  model.phase = 'choosing';
  render();
};

const confirmFullDrawCard = () => {
  if (model.drawMode !== 'full' || model.phase !== 'reveal' || !model.pendingCard
    || (model.drawLevelIndex === 0 && model.pendingCard['空宫'])) return;
  model.spread.push(model.pendingCard);
  const nextIndex = model.drawLevelIndex + 1;
  if (nextIndex >= DRAW_LEVELS.length) {
    model.pendingCard = null;
    model.phase = 'done';
    render();
    return;
  }
  prepareDrawLevel(nextIndex);
  render();
};

const bind = () => {
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-zl-close]')) return closeZiling();
    if (event.target.closest('[data-zl-back]')) return goBack();
    const themeTab = event.target.closest('[data-zl-theme]');
    if (themeTab) return setTheme(themeTab.dataset.zlTheme);
    if (event.target.closest('[data-zl-to-types]')) return go('types');
    const typeEl = event.target.closest('[data-zl-type]');
    if (typeEl) { model.type = typeEl.dataset.zlType; model.questionPromptOpen = true; return render(); }
    if (event.target.closest('[data-zl-question-continue]') || event.target.closest('[data-zl-question-skip]')) return beginQuestion();
    const questionBackdrop = event.target.closest('[data-zl-question-close]');
    if (questionBackdrop && event.target === questionBackdrop) { model.questionPromptOpen = false; return render(); }
    if (event.target.closest('[data-zl-full-draw]')) return startFullDraw();
    if (event.target.closest('[data-zl-quick-draw]')) return startQuickDraw();
    const pickedCard = event.target.closest('[data-zl-pick-card]');
    if (pickedCard) return pickFullDrawCard(Number(pickedCard.dataset.zlPickCard));
    if (event.target.closest('[data-zl-redraw-major]')) return redrawEmptyMajor();
    if (event.target.closest('[data-zl-quick-redraw-major]')) return redrawQuickMajor();
    if (event.target.closest('[data-zl-confirm-card]')) return confirmFullDrawCard();
    if (event.target.closest('[data-zl-to-reading]')) return go('reading');
    if (event.target.closest('[data-zl-restart]')) {
      model.type = null; model.question = ''; model.questionPromptOpen = false; model.phase = 'idle';
      model.drawMode = null; model.drawLevelIndex = 0; model.drawPool = []; model.pendingCard = null; model.spread = null;
      model.emptyMajorCount = 0; model.quickMajorPool = [];
      return go('cover');
    }
    // 大卡已开：点任意处（含背景与大卡本身）关闭
    if (event.target.closest('[data-zl-zoom]')) return closeZoom();
    const card = event.target.closest('[data-zl-card]');
    if (card && model.screen === 'shuffle' && model.phase === 'done') return openZoom(Number(card.dataset.zlCard));
  });

  // 问句输入：只存值、不重渲染（避免打断输入）
  root.addEventListener('input', (event) => {
    const q = event.target.closest('[data-zl-question]');
    if (q) model.question = q.value;
  });
};

// ---- 公开 API ----
export const openZiling = ({ astrolabeData = null, onTheme = null } = {}) => {
  ensureZilingStyles();
  chart = createChartAdapter(astrolabeData);
  onThemeChange = onTheme;
  model = {
    screen: 'cover', type: null, question: '', questionPromptOpen: false, phase: 'idle', drawMode: null,
    drawLevelIndex: 0, drawPool: [], pendingCard: null, spread: null, emptyMajorCount: 0, quickMajorPool: [], timers: [],
  };
  if (!root) {
    root = document.createElement('div');
    root.className = 'zl-overlay';
    document.body.appendChild(root);
    bind();
  }
  document.body.style.overflow = 'hidden';
  render();
};

export function closeZiling() {
  clearTimers();
  if (root) { root.remove(); root = null; }
  document.body.style.overflow = '';
  model = null;
}
