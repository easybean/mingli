import { escapeHtml } from '../components/html.js';
import { renderFocusPicker } from '../components/focus-picker.js';
import { createTodayViewModel } from '../domain/view-models/today-view-model.js';

const renderChoice = (choice, index, selectedIndex) => {
  const selected = selectedIndex === index;
  const locked = Number.isInteger(selectedIndex);
  const muted = locked && !selected;
  return `
    <button
      class="choice-card daily-choice ${selected ? 'is-selected' : ''} ${muted ? 'is-muted' : ''}"
      type="button"
      data-choice-index="${index}"
      ${locked ? 'disabled' : ''}
    >
      <span class="choice-route">
        <span>${escapeHtml(choice.presentation.actionLabel)}</span>
        <small>${escapeHtml(choice.presentation.actionHint)}</small>
      </span>
      <strong class="choice-title">${escapeHtml(choice.label)}</strong>
      <span class="choice-text">${escapeHtml(choice.description)}</span>
      <span class="choice-meta">
        <span>代价：${escapeHtml(choice.cost)}</span>
        <span>收益：${escapeHtml(choice.reward)}</span>
      </span>
    </button>
  `;
};

const renderChoiceSection = (model) => {
  if (!Number.isInteger(model.selectedIndex)) {
    return model.choices.map((choice, index) => renderChoice(choice, index, model.selectedIndex)).join('');
  }

  const selected = model.choices[model.selectedIndex];
  return `
    ${selected ? renderChoice(selected, model.selectedIndex, model.selectedIndex) : ''}
    <div class="choice-collapse-note">其余走法已收起，今天先按这一手往下走。</div>
  `;
};

export const renderTodayPage = (state) => {
  const model = createTodayViewModel(state);
  if (!model.ready) {
    return `
      <section class="page">
        <header class="page-header">
          <h1 class="page-title">${escapeHtml(model.title)}</h1>
        </header>
        <div class="empty-state">
          <p>${escapeHtml(model.emptyText)}</p>
          <button class="button button-primary" type="button" data-page="home">去生成关卡</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="page today-page">
      <header class="daily-header">
        <div>
          <p class="page-kicker">${escapeHtml(model.dayLabel)}</p>
          <div class="title-with-help">
            <h1 class="page-title">${escapeHtml(model.title)}</h1>
            <button class="help-icon-button" type="button" data-today-help-open aria-label="查看今日关卡说明">?</button>
          </div>
        </div>
        <span class="daily-pill">${escapeHtml(model.themeLabel)}</span>
      </header>

      ${model.helpOpen ? `
        <div class="modal-backdrop" data-today-help-backdrop>
          <section class="modal-sheet modal-sheet-help" aria-label="${escapeHtml(model.help.title)}">
            <div class="modal-header">
              <div class="stack">
                <p class="page-kicker">为什么会有这一页</p>
                <h2>${escapeHtml(model.help.title)}</h2>
              </div>
              <button class="modal-close" type="button" data-today-help-close aria-label="关闭说明">关闭</button>
            </div>
            <p class="modal-intro">${escapeHtml(model.help.intro)}</p>
            <div class="stack">
              ${model.help.sections.map((section) => `
                <article class="modal-help-block">
                  <h3>${escapeHtml(section.title)}</h3>
                  <p>${escapeHtml(section.body)}</p>
                </article>
              `).join('')}
            </div>
          </section>
        </div>
      ` : ''}

      <article class="card card-main daily-oracle">
        <p class="page-kicker">${escapeHtml(model.hook)}</p>
        <h2>${escapeHtml(model.card?.title || '今天的选择')}</h2>
        <p>${escapeHtml(model.scenario)}</p>
        <div class="daily-note">
          <span>今日提醒</span>
          <p>${escapeHtml(model.sceneNote)}</p>
        </div>
        <div class="stack">
          <p class="page-subtitle">今天你想先看哪一块？</p>
          ${renderFocusPicker(model.focusOptions)}
          ${model.focusHint ? `<p class="challenge-meta">${escapeHtml(model.focusHint)}</p>` : ''}
        </div>
      </article>

      <section class="stack daily-choice-section">
        <div class="daily-section-title">
          <p class="page-kicker">${escapeHtml(model.progressLabel)}</p>
          <h2>${escapeHtml(model.question)}</h2>
        </div>
        ${renderChoiceSection(model)}
      </section>

      ${model.feedback ? `
        <section class="feedback-card daily-result">
          <h3>${escapeHtml(model.feedback.title)}</h3>
          <strong>${escapeHtml(model.feedback.routeLabel)}</strong>
          <div class="row">
            ${model.feedback.resultTags.map((item) => `<span class="tag tag-result">${escapeHtml(item)}</span>`).join('')}
          </div>
          <p>${escapeHtml(model.feedback.body)}</p>
          <div class="row">
            ${model.feedback.effects.map((item) => `<span class="tag tag-primary">${escapeHtml(item)}</span>`).join('')}
          </div>
          ${model.feedback.lifeChange ? `
            <details class="life-change life-change-detail">
              <summary>${escapeHtml(model.feedback.lifeChange.title)}</summary>
              <p>${escapeHtml(model.feedback.lifeChange.body)}</p>
              <div class="row">
                ${model.feedback.lifeChange.deltas.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}
              </div>
            </details>
          ` : ''}
          <details class="share-summary share-summary-detail">
            <summary>分享文案</summary>
            <p>${escapeHtml(model.feedback.shareSummary)}</p>
          </details>
          <small>${escapeHtml(model.feedback.tomorrowHint)}</small>
        </section>
        <section class="next-actions">
          ${model.nextActions.map((action, index) => `
            <button class="button ${index === 0 ? 'button-primary' : 'button-secondary'}" type="button" data-page="${escapeHtml(action.page)}" data-scope="${escapeHtml(action.scope)}">
              ${escapeHtml(action.label)}
            </button>
          `).join('')}
        </section>
      ` : ''}
    </section>
  `;
};
