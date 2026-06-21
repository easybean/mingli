import { renderBirthForm } from '../components/birth-form.js';
import { escapeHtml } from '../components/html.js';
import { createHomeViewModel } from '../domain/view-models/home-view-model.js';

const renderIdentityStrip = (identity) => {
  const meta = [identity.age, identity.currentTheme ? `当前主题 ${identity.currentTheme}` : '']
    .filter(Boolean).join(' · ');
  return `
    <div class="identity-strip">
      ${identity.archetype ? `<span class="archetype-pill">${escapeHtml(identity.archetype)}</span>` : ''}
      ${meta ? `<span class="identity-meta">${escapeHtml(meta)}</span>` : ''}
    </div>
  `;
};

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
      ${renderIdentityStrip(model.identity)}

      <article class="card-main today-card">
        <span class="today-card-kicker">${escapeHtml(model.todayEntry.kicker)}</span>
        <h2>${escapeHtml(model.todayEntry.title)}</h2>
        <p class="today-card-scenario">${escapeHtml(model.todayEntry.scenario)}</p>
        <button class="button button-primary" type="button" data-page="today">开始今日选择 →</button>
      </article>

      <section class="quick-entry-grid">
        ${model.quickEntries.map((entry) => `
          <button class="quick-entry" type="button" data-page="game" data-scope="${escapeHtml(entry.id)}">
            <span class="quick-entry-label">${escapeHtml(entry.label)}</span>
            <span class="quick-entry-title">${escapeHtml(entry.title)}</span>
            <span class="quick-entry-sub">${entry.sub}</span>
          </button>
        `).join('')}
      </section>

      <button class="deep-reading-link" type="button" data-page="chart">想看为什么是这些题？去命盘看命盘依据 →</button>
    </section>
  `;
};
