import { escapeHtml } from '../components/html.js';
import { createReadingViewModel } from '../domain/view-models/reading-view-model.js';

export const renderReadingPage = (state) => {
  const model = createReadingViewModel(state);
  if (!model.ready) {
    return `
      <section class="page">
        <h1 class="page-title">深度解读</h1>
        <div class="empty-state">
          <p>先生成命盘，再查看解读依据。</p>
          <button class="button button-primary" type="button" data-page="home">去生成关卡</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="page">
      <header class="page-header">
        <p class="page-kicker">解释层</p>
        <h1 class="page-title">深度解读</h1>
        <p class="page-subtitle">${escapeHtml(model.intro)}</p>
      </header>
      ${model.sections.map((section, index) => `
        <details class="card card-plain stack" ${index < 2 ? 'open' : ''}>
          <summary class="choice-title">${escapeHtml(section.title)}</summary>
          <p class="page-subtitle">${escapeHtml(section.summary)}</p>
        </details>
      `).join('')}
    </section>
  `;
};
