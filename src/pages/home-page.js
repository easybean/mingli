import { renderBirthForm } from '../components/birth-form.js';
import { renderFocusPicker } from '../components/focus-picker.js';
import { escapeHtml, tags } from '../components/html.js';
import { createHomeViewModel } from '../domain/view-models/home-view-model.js';

export const renderHomePage = (state) => {
  const model = createHomeViewModel(state);

  if (model.mode === 'empty') {
    return `
      <section class="page">
        <header class="page-header">
          <p class="page-kicker">${escapeHtml(model.hero.kicker)}</p>
          <h1 class="page-title">${escapeHtml(model.hero.title)}</h1>
          <p class="page-subtitle">${escapeHtml(model.hero.subtitle)}</p>
        </header>
        ${renderBirthForm({ input: state.birthInput, loading: state.ui.loading, error: state.ui.error })}
      </section>
    `;
  }

  return `
    <section class="page home-ready">
      <article class="card card-main today-card">
        <div class="stack">
          <p class="page-kicker">今日入口</p>
          <h2>${escapeHtml(model.todayEntry.title)}</h2>
          <p>${escapeHtml(model.todayEntry.scenario)}</p>
          <div class="stack">
            <p class="page-subtitle">今天你最想先看哪一块？</p>
            ${renderFocusPicker(model.todayFocusOptions)}
          </div>
          <div class="row">${tags(model.todayEntry.tags)}</div>
        </div>
        <button class="button button-primary" type="button" data-page="today">开始今日选择</button>
      </article>

      <section class="stack">
        <div class="daily-section-title">
          <p class="page-kicker">继续往下看</p>
          <h2>按时间往前走</h2>
        </div>
        <div class="quick-entry-grid">
          ${model.quickEntries.map((entry, index) => `
            <button class="quick-entry ${index === 0 ? 'is-featured' : ''}" type="button" data-page="game" data-scope="${escapeHtml(entry.id)}">
              <p class="page-kicker">${escapeHtml(index === 0 ? '近期推进' : '长期路线')}</p>
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${escapeHtml(entry.subtitle)}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="card card-plain stack">
        <p class="page-kicker">身份摘要</p>
        <div class="identity-strip">${tags(model.identityTags)}</div>
      </section>

      <button class="button button-ghost" type="button" data-page="reading">想看为什么？进入深度解读</button>
    </section>
  `;
};
