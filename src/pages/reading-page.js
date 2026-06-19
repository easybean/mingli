import { escapeHtml } from '../components/html.js';
import { createReadingViewModel } from '../domain/view-models/reading-view-model.js';

const renderChoiceScope = (scope) => `
  <details class="card card-plain stack chart-choice-scope" open>
    <summary class="choice-title">
      <span>${escapeHtml(scope.label)}</span>
      <span class="choice-scope-count">${scope.count} 个选择</span>
    </summary>
    <p class="page-subtitle choice-scope-tendency">${escapeHtml(scope.tendency)}</p>
    ${scope.pills.length ? `
      <div class="feedback-deltas">
        ${scope.pills.map((pill) => `<span class="delta-pill delta-pill--${pill.tone}">${escapeHtml(pill.label)} ${pill.value > 0 ? '+' : ''}${pill.value}</span>`).join('')}
      </div>
    ` : ''}
    <ul class="choice-recap">
      ${scope.items.map((item) => `
        <li><span class="choice-recap-q">${escapeHtml(item.title)}</span><span class="choice-recap-a">你选了：${escapeHtml(item.choice)}</span></li>
      `).join('')}
    </ul>
  </details>
`;

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

  const choice = model.choiceReading;
  return `
    <section class="page">
      <header class="page-header">
        <p class="page-kicker">解释层</p>
        <h1 class="page-title">深度解读</h1>
        <p class="page-subtitle">${escapeHtml(model.intro)}</p>
      </header>

      <section class="reading-block">
        <h2 class="reading-block-title">你的选择</h2>
        ${choice.hasAny
          ? choice.scopes.map(renderChoiceScope).join('')
          : `<p class="page-subtitle reading-empty">${escapeHtml(choice.emptyText)}</p>`}
      </section>

      <section class="reading-block">
        <h2 class="reading-block-title">命盘依据</h2>
        <p class="page-subtitle reading-block-sub">下面是八字 / 紫微本身的结构，解释为什么会给出这些题——它只跟你的命盘有关，不随你的选择变化。</p>
        ${model.sections.map((section, index) => `
          <details class="card card-plain stack" ${index < 2 ? 'open' : ''}>
            <summary class="choice-title">${escapeHtml(section.title)}</summary>
            <p class="page-subtitle">${escapeHtml(section.summary)}</p>
          </details>
        `).join('')}
      </section>
    </section>
  `;
};
