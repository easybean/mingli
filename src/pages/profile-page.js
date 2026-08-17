import { escapeHtml } from '../components/html.js';
import { createAccessoryViewModel } from '../domain/view-models/accessory-view-model.js';

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
  const accessoryOpen = state.ui.accessoryOpen;
  const accessoryModel = createAccessoryViewModel(state);
  return `
    <section class="page placeholder-page">
      <header class="page-header">
        <h1 class="page-title">我的</h1>
        <p class="page-subtitle">你的出生信息、推演进度和主题设置只保存在这台设备的浏览器中。</p>
      </header>

      <section class="account-card">
        <div class="page-kicker page-kicker--muted">本机数据</div>
        <p class="focus-hint">这里不提供登录、注册或云端同步入口；你可以随时清除本机保存的命盘与推演进度。</p>
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

      <section class="accessory-card">
        <button class="accessory-toggle" type="button" data-ziling-open>
          <span class="accessory-toggle-text">
            <span class="accessory-toggle-title">紫灵牌问事 ✦</span>
            <span class="accessory-toggle-sub">紫微五星成阵，为心中一事抽牌问趋势 · 趣味占卜</span>
          </span>
          <span class="accessory-toggle-icon" aria-hidden="true">›</span>
        </button>
      </section>

      ${state.astrolabeData ? `
        <section class="birth-reset">
          <div class="page-kicker page-kicker--muted">出生信息</div>
          <p class="birth-reset-summary">${escapeHtml(state.astrolabeData.summary?.solarDate || '')}${state.astrolabeData.summary?.time ? ` · ${escapeHtml(state.astrolabeData.summary.time)}` : ''}${state.astrolabeData.input?.birthPlace ? ` · ${escapeHtml(state.astrolabeData.input.birthPlace)}` : ''}</p>
          <button class="button button-secondary" type="button" data-reset-chart>重新填写出生信息</button>
          <p class="focus-hint">会清掉当前命盘和闯关进度，回到出生表单重新生成。</p>
        </section>
      ` : ''}

      <button class="button button-primary" type="button" data-page="work">返回工作岔路</button>
    </section>
  `;
};
