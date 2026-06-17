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
      <strong class="choice-title">${escapeHtml(choice.label)}</strong>
      ${choice.description ? `<span class="choice-text">${escapeHtml(choice.description)}</span>` : ''}
      <span class="choice-meta">
        <span class="cost"><em>代价</em><span>${escapeHtml(choice.cost || '—')}</span></span>
        <span class="reward"><em>收益</em><span>${escapeHtml(choice.reward || '—')}</span></span>
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
    <p class="choice-collapse-note">这一题已经定了，其余走法先收起来。</p>
  `;
};

const renderDeltaPills = (pills) => pills.map((pill) => `
  <span class="delta-pill delta-pill--${pill.tone}">${escapeHtml(pill.label)}</span>
`).join('');

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
        <div class="daily-header-row">
          <div>
            <p class="daily-header-meta">${escapeHtml(model.dayLabel)} · 当前主题 <span class="daily-theme-accent">${escapeHtml(model.themeLabel)}</span></p>
            <h1 class="daily-header-title">${escapeHtml(model.card?.title || '今天先做这一题')}</h1>
          </div>
          <button class="help-icon-button" type="button" data-today-help-open aria-label="查看今日关卡说明">?</button>
        </div>
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

      <article class="scenario-card">
        <p class="scenario-text">${escapeHtml(model.scenario)}</p>
        ${model.conflictLine ? `
          <div class="scenario-conflict">
            <span class="scenario-conflict-label">冲突</span>
            <span class="scenario-conflict-body">${escapeHtml(model.conflictLine)}</span>
          </div>
        ` : ''}
      </article>

      <section class="daily-focus-strip">
        ${renderFocusPicker(model.focusOptions)}
        ${model.focusHint ? `<p class="focus-hint">${escapeHtml(model.focusHint)}</p>` : ''}
      </section>

      <section class="stack daily-choice-section">
        <h2 class="daily-question">${escapeHtml(model.question)}</h2>
        ${renderChoiceSection(model)}
      </section>

      ${model.feedback ? `
        <section class="feedback-card daily-result">
          <p class="feedback-eyebrow">这一手定下了</p>
          <h3>${escapeHtml(model.feedback.headline)}</h3>
          <p class="feedback-body">${escapeHtml(model.feedback.body)}</p>
          ${model.feedback.deltaPills.length ? `
            <div class="feedback-deltas">${renderDeltaPills(model.feedback.deltaPills)}</div>
          ` : ''}
          ${model.feedback.resultTags.length ? `
            <div class="feedback-tags">
              ${model.feedback.resultTags.map((item) => `<span class="tag tag-result">${escapeHtml(item)}</span>`).join('')}
            </div>
          ` : ''}
        </section>
        ${model.feedback.lifeChange ? `
          <details class="feedback-detail">
            <summary>这一手为后面铺了什么</summary>
            <p>${escapeHtml(model.feedback.lifeChange.body)}</p>
          </details>
        ` : ''}
        <details class="feedback-detail">
          <summary>分享文案</summary>
          <p>${escapeHtml(model.feedback.shareSummary)}</p>
        </details>
        <small class="feedback-tomorrow">${escapeHtml(model.feedback.tomorrowHint)}</small>
        <section class="next-actions">
          ${model.nextActions.map((action, index) => `
            <button class="button ${index === 0 ? 'button-secondary' : 'button-primary'}" type="button" data-page="${escapeHtml(action.page)}" data-scope="${escapeHtml(action.scope)}">
              ${escapeHtml(action.label)}${index === 1 ? ' →' : ''}
            </button>
          `).join('')}
        </section>
      ` : ''}
    </section>
  `;
};
