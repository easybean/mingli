import { escapeHtml } from '../components/html.js';
import { createAccessoryViewModel } from '../domain/view-models/accessory-view-model.js';

const THEME_OPTIONS = [
  { id: 'star', name: '星象 · 夜', desc: '深空近黑 · 金色星图 · 北斗指紫微 · 玻璃卡片' },
  { id: 'star-day', name: '星象 · 昼', desc: '晨纸暖底 · 同一星图氛围 · 白玉玻璃卡片' },
];

const renderAccessoryCategory = (category) => `
  <div class="accessory-category">
    <div class="accessory-category-head">
      <span class="accessory-category-type">${escapeHtml(category.type)}</span>
      <div class="accessory-materials">
        ${category.items.map((name) => `<span class="accessory-chip">${escapeHtml(name)}</span>`).join('')}
      </div>
    </div>
    <p class="accessory-category-why">${escapeHtml(category.why)}</p>
  </div>
`;

const renderAccessoryItem = (item) => `
  <article class="accessory-item">
    <header class="accessory-item-head">
      <span class="accessory-element">${escapeHtml(item.element)}</span>
      <span class="accessory-role">${escapeHtml(item.role)}</span>
      <span class="accessory-color">${escapeHtml(item.color)}</span>
    </header>
    <p class="accessory-reason">${escapeHtml(item.reason)}</p>
    <div class="accessory-categories">
      ${item.categories.map(renderAccessoryCategory).join('')}
    </div>
    <p class="accessory-vibe">${escapeHtml(item.vibe)}</p>
  </article>
`;

const renderAccessoryBody = (model) => {
  if (!model.ready) {
    return `<p class="page-subtitle accessory-empty">${escapeHtml(model.emptyText)}</p>`;
  }
  return `
    <p class="page-subtitle accessory-intro">${escapeHtml(model.intro)}</p>
    <p class="accessory-principle">${escapeHtml(model.principle)}</p>
    <div class="accessory-list">
      ${model.items.map(renderAccessoryItem).join('')}
    </div>
    <p class="accessory-howto">${escapeHtml(model.howto)}</p>
    <p class="accessory-disclaimer">${escapeHtml(model.disclaimer)}</p>
  `;
};

export const renderProfilePage = (state) => {
  const current = state.ui.theme;
  const accessoryOpen = state.ui.accessoryOpen;
  const accessoryModel = createAccessoryViewModel(state);
  return `
    <section class="page placeholder-page">
      <header class="page-header">
        <h1 class="page-title">我的</h1>
        <p class="page-subtitle">这里后续承载出生信息、当前路线、设置和说明，避免首页堆太多内容。</p>
      </header>

      <section class="theme-switch">
        <div class="page-kicker page-kicker--muted">外观风格</div>
        <div class="theme-option-list">
          ${THEME_OPTIONS.map((opt) => `
            <button
              class="theme-option ${current === opt.id ? 'is-active' : ''}"
              type="button"
              data-theme-set="${opt.id}"
              aria-pressed="${current === opt.id}"
            >
              <span class="theme-swatch theme-swatch--${opt.id}" aria-hidden="true"></span>
              <span class="theme-option-text">
                <span class="theme-option-name">${opt.name}</span>
                <span class="theme-option-desc">${opt.desc}</span>
              </span>
              <span class="theme-option-check" aria-hidden="true"></span>
            </button>
          `).join('')}
        </div>
        <p class="focus-hint">切换会立即生效，并记住你的选择。</p>
      </section>

      <section class="accessory-card ${accessoryOpen ? 'is-open' : ''}">
        <button
          class="accessory-toggle"
          type="button"
          data-accessory-toggle
          aria-expanded="${accessoryOpen}"
        >
          <span class="accessory-toggle-text">
            <span class="accessory-toggle-title">我适合戴什么？</span>
            <span class="accessory-toggle-sub">按你的八字五行喜用，看看适合的手串材质和颜色</span>
          </span>
          <span class="accessory-toggle-icon" aria-hidden="true">${accessoryOpen ? '−' : '+'}</span>
        </button>
        ${accessoryOpen ? `<div class="accessory-body">${renderAccessoryBody(accessoryModel)}</div>` : ''}
      </section>

      <button class="button button-primary" type="button" data-page="today">返回今日</button>
    </section>
  `;
};
