import { renderBirthForm } from '../components/birth-form.js';
import { escapeHtml } from '../components/html.js';
import { createHomeViewModel } from '../domain/view-models/home-view-model.js';
import { createPortraitViewModel } from '../domain/view-models/portrait-view-model.js';
import { createTodayFortuneViewModel } from '../domain/view-models/today-fortune-view-model.js';

const renderPortrait = (portrait) => {
  if (!portrait.ready) return '';
  return `
    <article class="portrait-card">
      <span class="portrait-kicker">${escapeHtml(portrait.kicker)}</span>
      <h2 class="portrait-title">${escapeHtml(portrait.title)}</h2>
      <p class="portrait-hook">${escapeHtml(portrait.hook)}</p>
      ${portrait.paragraphs.map((text) => `<p class="portrait-line">${escapeHtml(text)}</p>`).join('')}
      <p class="portrait-turn">${escapeHtml(portrait.turn)}</p>
      <p class="portrait-note">${escapeHtml(portrait.note)}</p>
    </article>
  `;
};

const renderShareCard = (portrait) => {
  if (!portrait.ready || !portrait.shareCard) return '';
  const { shareCard } = portrait;
  return `
    <section class="share-block">
      <div class="share-poster" data-share-poster>
        <span class="share-brand">MINGLI · 命理</span>
        <p class="share-tagline">${escapeHtml(shareCard.tagline)}</p>
        <p class="share-tension">${escapeHtml(shareCard.tension)}</p>
        <p class="share-turn">${escapeHtml(shareCard.turn)}</p>
      </div>
      <div class="share-actions">
        <button class="button button-secondary" type="button" data-copy-share data-share-text="${escapeHtml(portrait.shareText)}">复制这段话</button>
        <span class="share-hint">截图这张卡，或复制文案，发给懂你的人。</span>
      </div>
    </section>
  `;
};

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

  const portrait = createPortraitViewModel(state);
  const fortune = createTodayFortuneViewModel(state);

  return `
    <section class="page home-ready">
      ${renderIdentityStrip(model.identity)}

      ${renderPortrait(portrait)}

      ${renderShareCard(portrait)}

      <article class="card-main today-card">
        <span class="today-card-kicker">${escapeHtml(model.todayEntry.kicker)}${fortune.ready ? ` · ${escapeHtml(fortune.ganZhi)} ${escapeHtml(fortune.label)}` : ''}</span>
        <h2>${escapeHtml(model.todayEntry.title)}</h2>
        ${fortune.ready ? `<p class="today-card-fortune">${escapeHtml(fortune.line)}</p>` : ''}
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
