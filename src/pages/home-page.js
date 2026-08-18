import { escapeHtml } from '../components/html.js';
import { getStoryTheme, STORY_THEMES, storyThemeSummary } from '../domain/work-story/story-catalog.js';

const renderEntry = (entry) => `
  <button class="work-entry ${entry.status === 'available' ? 'is-available' : 'is-locked'}" type="button" ${entry.status === 'available' ? `data-work-entry="${escapeHtml(entry.id)}"` : 'disabled aria-disabled="true"'}>
    <span class="work-entry-status">${entry.status === 'available' ? '可体验' : '筹备中'}</span>
    <strong>${escapeHtml(entry.title)}</strong>
    <span>${escapeHtml(entry.conflict)}</span>
  </button>
`;

const renderThemeTabs = (activeThemeId) => `<div class="story-theme-tabs" role="tablist" aria-label="人生处境主题">
  ${STORY_THEMES.map((theme) => `<button id="story-theme-tab-${escapeHtml(theme.id)}" class="story-theme-tab ${theme.id === activeThemeId ? 'is-active' : ''}" type="button" role="tab" aria-selected="${theme.id === activeThemeId}" aria-controls="story-theme-panel" data-story-theme="${escapeHtml(theme.id)}">${escapeHtml(theme.label)}</button>`).join('')}
</div>`;

export const renderHomePage = (state) => {
  const activeTheme = getStoryTheme(state?.ui?.storyCatalogTheme);
  const summary = storyThemeSummary(activeTheme.id);
  return `
    <section class="page choice-landing">
      <header class="choice-hero">
        <p class="page-kicker">MINGLI · 人生岔路</p>
        <h1>命盘决定局，<br>选择决定走法。</h1>
        <p>从你眼前真实的处境出发，走一段由命盘、运限和选择共同推动的互动推演。</p>
      </header>
      <section class="choice-section">
        <p class="section-eyebrow">先选你正在面对的主题</p>
        ${renderThemeTabs(activeTheme.id)}
        <section id="story-theme-panel" class="story-theme-panel" role="tabpanel" aria-labelledby="story-theme-tab-${escapeHtml(activeTheme.id)}" tabindex="0">
          <div class="story-theme-panel__head"><div><h2>${escapeHtml(activeTheme.label)}</h2><p>${escapeHtml(activeTheme.description)}</p></div><span>${summary.available ? `${summary.available} 套可体验` : '筹备中'}</span></div>
          <p class="choice-availability">本主题共 ${summary.total} 种处境；${summary.available ? `当前 ${summary.available} 套可体验，其余 ${summary.upcoming} 套筹备中。` : `当前 ${summary.upcoming} 套正在筹备。`}</p>
          <div class="work-entry-grid">${activeTheme.entries.map(renderEntry).join('')}</div>
        </section>
      </section>
      <aside class="sample-route-card">
        <span>这一局不是测验</span>
        <strong>同一张命盘，不同选择，会走向不同路线。</strong>
        <p>可体验路线约有 7 个关键选择；其余主题会在完成后逐步开放。</p>
      </aside>
      <p class="choice-disclaimer">仅供互动娱乐与选择预演参考；不替代职业、医疗、法律或财务建议。</p>
    </section>
  `;
};
