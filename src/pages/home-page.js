import { escapeHtml } from '../components/html.js';
import { WORK_STORY_CATALOG_SUMMARY, WORK_STORY_ENTRIES } from '../domain/work-story/story-catalog.js';

const renderEntry = (entry) => `
  <button class="work-entry ${entry.status === 'available' ? 'is-available' : 'is-locked'}" type="button" ${entry.status === 'available' ? `data-work-entry="${entry.id}"` : 'disabled'}>
    <span class="work-entry-status">${entry.status === 'available' ? '可体验' : '筹备中'}</span>
    <strong>${escapeHtml(entry.title)}</strong>
    <span>${escapeHtml(entry.conflict)}</span>
  </button>
`;

export const renderHomePage = () => `
  <section class="page choice-landing">
    <header class="choice-hero">
      <p class="page-kicker">MINGLI · 工作岔路</p>
      <h1>命盘决定局，<br>选择决定走法。</h1>
      <p>带着你正在经历的工作难题，走一段由命盘、运限和选择共同推动的职业推演。</p>
    </header>
    <section class="choice-section">
      <p class="section-eyebrow">先选你正在面对的处境</p>
      <p class="choice-availability">目前 ${WORK_STORY_CATALOG_SUMMARY.available} 套可体验，其余 ${WORK_STORY_CATALOG_SUMMARY.upcoming} 套筹备中。</p>
      <div class="work-entry-grid">${WORK_STORY_ENTRIES.slice(0, 3).map(renderEntry).join('')}</div>
      <details class="more-entries">
        <summary>再看另外 5 种工作处境</summary>
        <div class="work-entry-grid">${WORK_STORY_ENTRIES.slice(3).map(renderEntry).join('')}</div>
      </details>
    </section>
    <aside class="sample-route-card">
      <span>这一局不是测验</span>
      <strong>同一张命盘，不同选择，会走向不同路线。</strong>
      <p>每条可体验路线约有 7 个关键选择；同一张命盘，也会因处境而进入不同故事。</p>
    </aside>
    <p class="choice-disclaimer">仅供互动娱乐与选择预演参考；不替代职业、医疗、法律或财务建议。</p>
  </section>
`;
