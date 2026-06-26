// 紫灵牌 · 单卡渲染（正面简版 / 翻面详情 / 牌背）。自包含、无跨 app 依赖。
import { backArt } from './ziling-art.js';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LEVEL = {
  主星: { short: '主星', en: 'MAJOR', color: '#C8452F', soft: 'rgba(200,69,47,0.18)', line: 'rgba(200,69,47,0.50)' },
  甲级辅星: { short: '甲级', en: 'AUX · I', color: '#7A56AC', soft: 'rgba(122,86,172,0.18)', line: 'rgba(122,86,172,0.50)' },
  乙级辅星: { short: '乙级', en: 'AUX · II', color: '#3F93A8', soft: 'rgba(63,147,168,0.18)', line: 'rgba(63,147,168,0.50)' },
  丙级辅星: { short: '丙级', en: 'AUX · III', color: '#4E927A', soft: 'rgba(78,146,122,0.18)', line: 'rgba(78,146,122,0.50)' },
  四化: { short: '四化', en: 'TRANSFORM', color: '#C9A646', soft: 'rgba(201,166,70,0.20)', line: 'rgba(201,166,70,0.55)', multi: true },
};

export const levelMeta = (lv) => LEVEL[lv] || LEVEL['主星'];

// 不同级别牌面字段不同，统一成 {wuxing, centerWord}
const frontMeta = (card) => {
  const lv = card['级别'];
  if (lv === '乙级辅星') return { wuxing: card['主'] ? `主${card['主']}` : '', centerWord: card['解释'] || '' };
  if (lv === '丙级辅星') return { wuxing: card['吉凶'] === '吉' ? '吉' : '凶', centerWord: card['释义'] || '' };
  if (lv === '四化') return { wuxing: card['方位五行'] || '', centerWord: card['本意'] || '' };
  return { wuxing: card['五行'] || '', centerWord: card['中心词'] || '' };
};

// 翻面详情行（按级别取不同字段集）
const detailRows = (card) => {
  const lv = card['级别'];
  const g = (k) => (card[k] && String(card[k]).trim()) || '—';
  if (card['空宫']) {
    return [{ k: '牌义', v: g('牌义'), c: 'var(--zl-gold)' }];
  }
  if (lv === '乙级辅星') {
    return [
      { k: '主', v: g('主'), c: 'var(--zl-gold)' },
      { k: '释义', v: g('解释'), c: 'var(--zl-card-ink-muted)' },
    ];
  }
  if (lv === '丙级辅星') {
    return [
      { k: '吉凶', v: g('吉凶'), c: card['吉凶'] === '吉' ? 'var(--zl-positive)' : 'var(--zl-red)' },
      { k: '释义', v: g('释义'), c: 'var(--zl-card-ink-muted)' },
    ];
  }
  if (lv === '四化') {
    const rows = [
      { k: '本意', v: g('本意'), c: 'var(--zl-gold)' },
      { k: '会意', v: g('会意'), c: 'var(--zl-gold)' },
      { k: '事物', v: g('事物'), c: 'var(--zl-gold)' },
      { k: '形体', v: g('形体'), c: 'var(--zl-gold)' },
      { k: '感性', v: g('感性'), c: 'var(--zl-gold)' },
    ];
    if (card['灾害']) rows.push({ k: '灾害', v: g('灾害'), c: 'var(--zl-red)' });
    return rows;
  }
  return [
    { k: '性格优势', v: g('性格优势'), c: 'var(--zl-positive)' },
    { k: '性格缺陷', v: g('性格缺陷'), c: 'var(--zl-red)' },
    { k: '事业', v: g('事业优势'), c: 'var(--zl-gold)' },
    { k: '情感', v: g('情感优势'), c: 'var(--zl-gold)' },
    { k: '财运', v: g('财运'), c: 'var(--zl-gold)' },
    { k: '身体', v: g('身体'), c: 'var(--zl-gold)' },
  ];
};

// renderCard({ card, sealed, idx }) → .zl-card 外层
// sealed=true 渲染牌背（仪式发牌用）；之后加 .is-revealed 之类由控制器换 class。
export const renderCard = ({ card, sealed = false, idx = 0 }) => {
  const lv = card['级别'];
  const m = levelMeta(lv);
  const fm = frontMeta(card);
  const stateClass = sealed ? 'is-sealed' : '';
  const lvVars = `--zl-lv:${m.color};--zl-lv-soft:${m.soft};--zl-lv-line:${m.line};`;

  const rows = detailRows(card).map((d) => `
    <div class="zl-drow">
      <span class="zl-dk" style="color:${d.c}">${esc(d.k)}</span>
      <span class="zl-dv">${esc(d.v)}</span>
    </div>`).join('');

  return `
    <div class="zl-card ${stateClass}" style="${lvVars}" data-zl-card="${idx}">
      <div class="zl-card-inner">
        <div class="zl-face zl-face-front">
          <div class="zl-lvbar ${m.multi ? 'multi' : ''}"></div>
          <div class="zl-face-head">
            <div class="zl-face-top">
              <span class="zl-lvtag">${esc(m.short)}</span>
              <span class="zl-lven">${esc(m.en)}</span>
            </div>
            <div class="zl-illust"><span>✦</span><span>插画位</span></div>
            <div class="zl-cardname">${esc(card['名'])}</div>
            ${fm.wuxing ? `<span class="zl-wx">${esc(fm.wuxing)}</span>` : ''}
            <div class="zl-cw">${esc(fm.centerWord)}</div>
            <div class="zl-hint">轻点翻面 ›</div>
          </div>
        </div>
        <div class="zl-face zl-face-back">
          <div class="zl-back-art">
            ${backArt(7 + idx * 4)}
            <div class="zl-back-title">紫 灵 牌</div>
          </div>
          <div class="zl-details">
            <div class="zl-details-head">
              <span class="zl-details-name">${esc(card['名'])}</span>
              <span class="zl-details-tag">${esc(m.short)}${fm.wuxing ? ` · ${esc(fm.wuxing)}` : ''}</span>
            </div>
            <div class="zl-details-body">${rows}</div>
            <div class="zl-details-foot">‹ 轻点返回</div>
          </div>
        </div>
      </div>
    </div>`;
};
