import { escapeHtml } from '../components/html.js';
import { createChartViewModel } from '../domain/view-models/chart-view-model.js';

const VERDICT_TONE = { 吉: 'positive', 凶: 'negative', 待辨: 'neutral' };

const renderHighlight = (item) => `
  <div class="chart-highlight">
    <span class="chart-highlight-label">${escapeHtml(item.label)}</span>
    <span class="chart-highlight-palace">${escapeHtml(item.palace.name)}</span>
    <span class="chart-highlight-sub">${escapeHtml(item.palace.ganzhi)}${item.extra ? ` · ${escapeHtml(item.extra)}岁` : ''}</span>
  </div>
`;

const renderMajorStar = (star) => `
  <span class="chart-star chart-star--major">
    ${escapeHtml(star.name)}${star.brightness ? `<i>${escapeHtml(star.brightness)}</i>` : ''}
    ${star.mutagen ? `<b class="chart-mutagen chart-mutagen--${escapeHtml(star.mutagen)}">化${escapeHtml(star.mutagen)}</b>` : ''}
  </span>
`;

const renderPalaceCard = (card) => {
  const flags = [
    card.isSoul ? '命宫' : '',
    card.isBody ? '身宫' : '',
    card.isDecadal ? '当前大运' : '',
  ].filter(Boolean);
  return `
    <article class="chart-palace ${card.isSoul || card.isBody || card.isDecadal ? 'is-key' : ''}">
      <header class="chart-palace-head">
        <div class="chart-palace-title">
          <span class="chart-palace-name">${escapeHtml(card.name)}</span>
          <span class="chart-palace-ganzhi">${escapeHtml(card.ganzhi)}</span>
        </div>
        <div class="chart-palace-tags">
          ${card.themeLabel ? `<span class="chart-theme-tag">${escapeHtml(card.themeLabel)}</span>` : ''}
          ${flags.map((flag) => `<span class="chart-flag">${escapeHtml(flag)}</span>`).join('')}
        </div>
      </header>
      <div class="chart-stars">
        ${card.majorStars.length
          ? card.majorStars.map(renderMajorStar).join('')
          : '<span class="chart-empty-star">空宫</span>'}
      </div>
      ${card.minorStars.length ? `<p class="chart-minor">辅曜 · ${escapeHtml(card.minorStars.join(' '))}</p>` : ''}
      ${card.adjectiveStars.length ? `<p class="chart-adjective">杂曜 · ${escapeHtml(card.adjectiveStars.slice(0, 8).join(' '))}</p>` : ''}
      <footer class="chart-palace-foot">
        ${card.mutagens.length ? `<span class="chart-foot-mutagen">四化 ${escapeHtml(card.mutagens.join('、'))}</span>` : ''}
        ${card.decadalRange.length === 2 ? `<span class="chart-foot-decadal">大限 ${card.decadalRange.join('–')}岁</span>` : ''}
      </footer>
    </article>
  `;
};

export const renderChartPage = (state) => {
  const model = createChartViewModel(state);
  if (!model.ready) {
    return `
      <section class="page">
        <header class="page-header">
          <h1 class="page-title">${escapeHtml(model.title)}</h1>
        </header>
        <div class="empty-state">
          <p>${escapeHtml(model.emptyText)}</p>
          <button class="button button-primary" type="button" data-page="home">去生成命盘</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="page chart-page">
      <header class="page-header">
        <h1 class="page-title">${escapeHtml(model.title)}</h1>
        <p class="page-subtitle">${escapeHtml(model.subtitle)}</p>
      </header>

      <section class="card card-soft chart-basics">
        ${model.basics.map((item) => `
          <div class="chart-basic-item">
            <span class="chart-basic-label">${escapeHtml(item.label)}</span>
            <span class="chart-basic-value">${escapeHtml(item.value)}</span>
          </div>
        `).join('')}
      </section>

      ${model.highlights.length ? `
        <section class="chart-highlights">
          ${model.highlights.map(renderHighlight).join('')}
        </section>
      ` : ''}

      ${model.patterns.length ? `
        <section class="chart-patterns">
          <span class="chart-section-label">格局</span>
          <div class="chart-pattern-tags">
            ${model.patterns.map((item) => `
              <span class="chart-pattern-tag chart-pattern-tag--${VERDICT_TONE[item.verdict] || 'neutral'}">
                ${escapeHtml(item.name)}${item.verdict ? `<i>${escapeHtml(item.verdict)}</i>` : ''}
              </span>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <section class="chart-filter">
        ${model.filters.map((item) => `
          <button
            class="scope-tab ${model.activeFilter === item.id ? 'is-active' : ''}"
            type="button"
            data-chart-filter="${escapeHtml(item.id)}"
          >${escapeHtml(item.label)}<i>${item.count}</i></button>
        `).join('')}
      </section>

      <section class="chart-palace-list">
        ${model.cards.map(renderPalaceCard).join('')}
      </section>
    </section>
  `;
};
