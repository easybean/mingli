// 紫灵牌问事 · 浮层控制器。挂在 document.body，自管内部状态与动画，
// 不经过主 app 的 store/notify 重渲染循环（避免动效被打断）。
// 与主 app 仅两处相连：openZiling 入参（命盘 + 主题回调）。删本目录即可整体移除。
import { ensureZilingStyles } from './ziling-styles.js';
import { QUESTION_TYPES, buildSpread, assembleReading } from './ziling-view-model.js';
import { renderCard } from './ziling-card.js';
import { createChartAdapter } from './chart-adapter.js';
import { starfield, baguaRing, dipper, backArt } from './ziling-art.js';

const SCREENS = ['cover', 'types', 'shuffle', 'spread', 'reading'];

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let root = null;
let model = null;
let chart = null;
let onThemeChange = null;

const reduced = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};
const currentTheme = () => document.documentElement.getAttribute('data-theme') || 'star';
const clearTimers = () => { (model?.timers || []).forEach(clearTimeout); if (model) model.timers = []; };

// ---- 牌阵发牌位（300x320 舞台内）。两排：①主星+四化并排 ②甲乙丙
// 注意：水平定位只用像素 left，不用 transform/translateX——zl-rise 入场动画会动 transform，
// 用 translateX 定位会被动画覆盖导致牌挤到正中重叠。 ----
const DEAL_LAYOUT = [
  { left: '58px', top: '8px', z: 2, w: '84px' },     // 主星（一排左）
  { left: '8px', top: '162px', z: 1, w: '84px' },    // 甲（二排）
  { left: '108px', top: '162px', z: 1, w: '84px' },  // 乙
  { left: '208px', top: '162px', z: 1, w: '84px' },  // 丙
  { left: '158px', top: '8px', z: 2, w: '84px' },    // 四化（一排右）
];

// 牌堆背面 = 正式牌背（与落盘后的牌背一致：北斗 + 紫灵牌字样）
const pileBack = (seed) => `${backArt(seed)}<div class="zl-back-title">紫 灵 牌</div>`;
const renderPile = () => `
  <div class="zl-pile">
    <div class="zl-pile-card">${pileBack(5)}</div>
    <div class="zl-pile-card">${pileBack(9)}</div>
    <div class="zl-pile-card">${pileBack(13)}</div>
  </div>`;

const renderDealStage = (spread, revealedCount) => `
  <div class="zl-deal">
    ${spread.map((card, i) => {
      const L = DEAL_LAYOUT[i];
      return `<div class="zl-slot ${i < revealedCount ? 'is-revealed' : ''}"
        style="left:${L.left};top:${L.top};width:${L.w};z-index:${L.z};animation-delay:${(i * 0.12).toFixed(2)}s">
        <div class="zl-glow"></div>
        ${renderCard({ card, sealed: i >= revealedCount, idx: i })}
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
    <textarea class="zl-qinput" data-zl-question rows="2" maxlength="40"
      placeholder="想问的具体一句（可留空，如：该不该接这个 offer）">${esc(model.question)}</textarea>
    <button class="zl-btn" data-zl-to-shuffle ${model.type ? '' : 'disabled'}
      style="margin-top:14px;width:100%;height:52px;font-size:15px">
      ${model.type ? `就问「${t.name}」 →` : '请先择一类'}
    </button>
  </div>`;
};

const shuffleScreen = () => {
  const done = model.phase === 'done' && model.spread;
  const title = done ? '五星已定' : '洗牌 · 静心';
  const hint = done ? '牌阵已成，可入阵中细看' : '心念你要问的事，准备好了就洗牌';
  const stage = done ? renderDealStage(model.spread, 5) : renderPile();
  const btn = done
    ? `<button class="zl-btn" data-zl-to-spread style="width:230px;height:52px;font-size:15px">查看牌阵 →</button>`
    : `<button class="zl-btn" id="zl-shuffle-btn" data-zl-shuffle style="width:230px;height:52px;font-size:15px">开始洗牌</button>`;
  return `
  <div class="zl-pad" style="align-items:center">
    <div class="zl-kicker">STEP 02</div>
    <div class="zl-h" id="zl-shuffle-title" style="font-size:22px;margin-top:9px">${title}</div>
    <div class="zl-sub" id="zl-shuffle-hint" style="margin-top:7px;min-height:17px">${hint}</div>
    <div class="zl-stage" id="zl-stage">${stage}</div>
    ${btn}
  </div>`;
};

const spreadScreen = () => {
  if (!model.spread) model.spread = buildSpread({ typeKey: model.type, chart });
  const sp = model.spread;
  const t = QUESTION_TYPES.find((x) => x.key === model.type);
  return `
  <div class="zl-pad">
    <div class="zl-kicker">STEP 03 · ${t ? t.name : ''}</div>
    <div class="zl-h" style="font-size:20px;margin-top:8px">${spreadQuestion()}</div>
    <div class="zl-sub" style="margin-top:6px">五星已落阵 · 轻点任意一张看其释义</div>
    <div class="zl-spread">
      <div class="zl-spread-label">命主 · 主星</div>
      <div style="width:150px;z-index:2;position:relative">${renderCard({ card: sp[0], idx: 0 })}</div>
      <div style="width:128px;z-index:1;position:relative;margin-top:10px">${renderCard({ card: sp[4], idx: 4 })}</div>
      <div class="zl-spread-label muted" style="margin-top:8px">化曜 · 四化（修饰主星）</div>
      <div style="width:100%;margin-top:18px">
        <div class="zl-spread-label muted" style="text-align:center">辅曜 · 甲 / 乙 / 丙</div>
        <div class="zl-aux-row">
          <div>${renderCard({ card: sp[1], idx: 1 })}</div>
          <div>${renderCard({ card: sp[2], idx: 2 })}</div>
          <div>${renderCard({ card: sp[3], idx: 3 })}</div>
        </div>
      </div>
    </div>
    <button class="zl-btn" data-zl-to-reading style="margin-top:24px;width:100%;height:50px;font-size:15px">解此一阵 →</button>
  </div>`;
};

const spreadQuestion = () => {
  const r = assembleReading({ spread: model.spread, typeKey: model.type, chart, question: model.question });
  return r.questionText || '此一事';
};

const readingScreen = () => {
  if (!model.spread) model.spread = buildSpread({ typeKey: model.type, chart });
  const r = assembleReading({ spread: model.spread, typeKey: model.type, chart, question: model.question });
  return `
  <div class="zl-pad">
    <div class="zl-kicker">STEP 04 · 解读</div>
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
  cover: coverScreen, types: typesScreen, shuffle: shuffleScreen, spread: spreadScreen, reading: readingScreen,
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
const go = (screen) => { clearTimers(); model.screen = screen; render(); };
const goBack = () => { const i = SCREENS.indexOf(model.screen); if (i > 0) go(SCREENS[i - 1]); };

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  if (onThemeChange) onThemeChange(theme);
  render();
};

const startRitual = () => {
  model.spread = buildSpread({ typeKey: model.type, chart });
  const stage = root.querySelector('#zl-stage');
  const titleEl = root.querySelector('#zl-shuffle-title');
  const hintEl = root.querySelector('#zl-shuffle-hint');
  const btn = root.querySelector('#zl-shuffle-btn');

  if (reduced()) {
    model.phase = 'done'; model.revealCount = 5; render(); return;
  }

  model.phase = 'shuffling';
  const pile = stage.querySelector('.zl-pile');
  if (pile) pile.classList.add('is-shuffling');
  if (btn) { btn.disabled = true; btn.textContent = '洗牌中…'; }
  if (titleEl) titleEl.textContent = '洗牌中…';
  if (hintEl) hintEl.textContent = '星屑流转，牌序重定';

  model.timers.push(setTimeout(() => {
    model.phase = 'dealing';
    stage.innerHTML = renderDealStage(model.spread, 0);
    if (titleEl) titleEl.textContent = '落牌成阵';
    if (hintEl) hintEl.textContent = '五星依次归位，静待揭示';
    const slots = stage.querySelectorAll('.zl-slot');
    [0, 1, 2, 3, 4].forEach((i) => {
      model.timers.push(setTimeout(() => {
        const slot = slots[i];
        if (!slot) return;
        slot.classList.add('is-revealed');
        const card = slot.querySelector('.zl-card');
        if (card) card.classList.remove('is-sealed');
        model.revealCount = i + 1;
      }, 700 + i * 620));
    });
    model.timers.push(setTimeout(() => {
      model.phase = 'done';
      if (titleEl) titleEl.textContent = '五星已定';
      if (hintEl) hintEl.textContent = '牌阵已成，可入阵中细看';
      if (btn) {
        btn.disabled = false; btn.textContent = '查看牌阵 →';
        btn.id = ''; btn.removeAttribute('data-zl-shuffle'); btn.setAttribute('data-zl-to-spread', '');
      }
    }, 700 + 5 * 620 + 400));
  }, 1500));
};

const bind = () => {
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-zl-close]')) return closeZiling();
    if (event.target.closest('[data-zl-back]')) return goBack();
    const themeTab = event.target.closest('[data-zl-theme]');
    if (themeTab) return setTheme(themeTab.dataset.zlTheme);
    if (event.target.closest('[data-zl-to-types]')) return go('types');
    const typeEl = event.target.closest('[data-zl-type]');
    if (typeEl) { model.type = typeEl.dataset.zlType; return render(); }
    if (event.target.closest('[data-zl-to-shuffle]')) {
      if (model.type) { model.phase = 'idle'; model.revealCount = 0; model.spread = null; go('shuffle'); }
      return;
    }
    if (event.target.closest('[data-zl-shuffle]')) return startRitual();
    if (event.target.closest('[data-zl-to-spread]')) return go('spread');
    if (event.target.closest('[data-zl-to-reading]')) return go('reading');
    if (event.target.closest('[data-zl-restart]')) {
      model.type = null; model.question = ''; model.phase = 'idle'; model.revealCount = 0; model.spread = null;
      return go('cover');
    }
    const card = event.target.closest('[data-zl-card]');
    if (card && model.screen === 'spread') { card.classList.toggle('is-details'); }
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
  model = { screen: 'cover', type: null, question: '', phase: 'idle', revealCount: 0, spread: null, timers: [] };
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
