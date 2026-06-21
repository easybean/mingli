import { escapeHtml } from '../components/html.js';
import { createGameViewModel } from '../domain/view-models/game-view-model.js';
import { createReadingViewModel } from '../domain/view-models/reading-view-model.js';

const renderChoice = (choice, index, selectedIndex) => {
  const selected = selectedIndex === index;
  const locked = Number.isInteger(selectedIndex);
  const muted = locked && !selected;
  return `
    <button
      class="choice-card ${selected ? 'is-selected' : ''} ${muted ? 'is-muted' : ''}"
      type="button"
      data-game-choice-index="${index}"
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
    <p class="choice-collapse-note">这一关已经定了，其余走法先收起来。</p>
  `;
};

const renderLog = (items) => {
  if (!items.length) {
    return '<p class="page-subtitle">完成一关后，这里会记下你的走法。</p>';
  }
  return `
    <ul class="action-log">
      ${items.map((item) => `
        <li>
          <strong>${escapeHtml(item.cardTitle)}</strong>
          <span>${escapeHtml(item.choiceLabel)}</span>
        </li>
      `).join('')}
    </ul>
  `;
};

const renderDeltaPills = (pills) => pills.map((pill) => `
  <span class="delta-pill delta-pill--${pill.tone}">${escapeHtml(pill.label)}</span>
`).join('');

const renderCompletion = (model) => `
  <section class="feedback-card">
    <p class="feedback-eyebrow">这一段走完了</p>
    <h3>这一段已经走完</h3>
    <p class="feedback-body">你已经走完${escapeHtml(model.scopeTitle)}的主要关卡。可以回到今日，也可以切到别的时间范围继续。</p>
    ${model.finalSummary ? `
      <div class="final-summary">
        <strong>${escapeHtml(model.finalSummary.title)}</strong>
        ${model.finalSummary.resultTags.length ? `
          <div class="row">
            ${model.finalSummary.resultTags.map((item) => `<span class="tag tag-result">${escapeHtml(item)}</span>`).join('')}
          </div>
        ` : ''}
        <p>${escapeHtml(model.finalSummary.body)}</p>
      </div>
    ` : ''}
  </section>
  <section class="next-actions">
    <button class="button button-secondary" type="button" data-page="today">回到今日</button>
    <button class="button button-primary" type="button" data-game-view="recap">看你的选择回顾 →</button>
  </section>
`;

// 回顾 tab：把「你的选择」综合解读 + 分尺度搬到游戏页（原解读页上半），命盘依据归命盘页。
const renderRecapScope = (scope) => `
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

const renderRecap = (state) => {
  const choice = createReadingViewModel(state).choiceReading;
  return `
    <header class="page-header">
      <p class="page-kicker">你的选择</p>
      <h1 class="page-title">回顾</h1>
      <p class="page-subtitle">这里把你在关卡里的选择综合起来说明了什么。命盘本身为什么给出这些题，去「命盘」页看命盘依据。</p>
    </header>
    ${choice.hasAny ? `
      <article class="choice-overall card-main">
        <p class="choice-overall-kicker">综合解读 · ${choice.overall.count} 个选择</p>
        <p class="choice-overall-body">${escapeHtml(choice.overall.body)}</p>
        ${choice.overall.pills.length ? `
          <div class="feedback-deltas">
            ${choice.overall.pills.map((pill) => `<span class="delta-pill delta-pill--${pill.tone}">${escapeHtml(pill.label)} ${pill.value > 0 ? '+' : ''}${pill.value}</span>`).join('')}
          </div>
        ` : ''}
        ${choice.overall.alerts.length ? `
          <ul class="choice-overall-alerts">
            ${choice.overall.alerts.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}
          </ul>
        ` : ''}
      </article>
      <p class="choice-scope-lead">分尺度看：</p>
      ${choice.scopes.map(renderRecapScope).join('')}
    ` : `<p class="page-subtitle reading-empty">${escapeHtml(choice.emptyText)}</p>`}
  `;
};

const renderPlay = (model) => `
      <nav class="scope-tabs" aria-label="时间范围">
        ${model.scopeTabs.map((tab) => `
          <button class="scope-tab ${tab.active ? 'is-active' : ''}" type="button" data-page="game" data-scope="${escapeHtml(tab.id)}">${escapeHtml(tab.label)}</button>
        `).join('')}
      </nav>

      <header class="game-header">
        <div class="game-header-row">
          <h1 class="game-route-name">${escapeHtml(model.archetypeName ? `${model.archetypeName} · 当前走到这里` : '当前走到这里')}</h1>
          <span class="game-progress-text">${escapeHtml(model.progressLabel)}</span>
        </div>
        <div class="game-progress-bar"><div class="game-progress-fill" style="width:${model.progressPercent}%"></div></div>
        <p class="game-tendency">${escapeHtml(model.tendency)}</p>
      </header>

      <article class="card-main challenge-card">
        ${model.currentStageLabel ? `<p class="challenge-stage">${escapeHtml(model.currentStageLabel)}</p>` : ''}
        <h2>${escapeHtml(model.currentCard.title)}</h2>
        <p class="challenge-scenario">${escapeHtml(model.scenario)}</p>
        ${model.currentStageStrategy ? `<p class="challenge-stage-strategy">${escapeHtml(model.currentStageStrategy)}</p>` : ''}
        ${model.triggerSummary ? `<p class="challenge-meta">${escapeHtml(model.triggerSummary)}</p>` : ''}
      </article>

      <details class="life-state-panel">
        <summary>
          <span class="life-state-glance">${escapeHtml(model.glanceLine)}</span>
          <span class="life-state-toggle">展开</span>
        </summary>
        <div class="life-state-row">
          ${model.lifeState.map((item) => `
            <span>${escapeHtml(item.label)} <strong>${escapeHtml(String(item.value))}</strong></span>
          `).join('')}
        </div>
        ${model.stateAlerts.length ? `<p class="life-state-alert">${escapeHtml(model.stateAlerts[0])}</p>` : ''}
      </details>

      ${model.completed ? renderCompletion(model) : `
        <section class="stack daily-choice-section">
          <h2 class="daily-question">你打算怎么走？</h2>
          ${renderChoiceSection(model)}
        </section>

        ${model.feedback ? `
          <section class="feedback-card">
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
          ${model.canGoNext ? `
            <button class="button button-primary" type="button" data-next-game-challenge>${escapeHtml(model.nextStepLabel)} →</button>
          ` : renderCompletion(model)}
        ` : ''}
      `}

      <details class="collapsible-section">
        <summary>行动日志 · 已走 ${model.choicesCount} 关</summary>
        ${renderLog(model.logItems)}
      </details>

      <details class="collapsible-section">
        <summary>阶段地图 · ${model.stages.length} 段路线</summary>
        <div class="stage-list">
          ${model.stages.map((stage) => `
            <article class="stage-item">
              <p class="page-kicker page-kicker--muted">${escapeHtml(stage.ageRange || stage.yearRange || '')}</p>
              <strong>${escapeHtml(stage.title)}</strong>
              <p class="page-subtitle">${escapeHtml(stage.strategy || stage.triggerSummary || '')}</p>
            </article>
          `).join('')}
        </div>
      </details>
  `;

export const renderGamePage = (state) => {
  const model = createGameViewModel(state);
  if (!model.ready) {
    return `
      <section class="page">
        <h1 class="page-title">人生游戏</h1>
        <div class="empty-state">
          <p>先生成命盘，再进入人生主线。</p>
          <button class="button button-primary" type="button" data-page="home">去生成关卡</button>
        </div>
      </section>
    `;
  }

  const view = state.ui.gameView === 'recap' ? 'recap' : 'play';
  return `
    <section class="page game-page">
      <nav class="scope-tabs game-view-tabs" aria-label="游戏视图">
        <button class="scope-tab ${view === 'play' ? 'is-active' : ''}" type="button" data-game-view="play">闯关</button>
        <button class="scope-tab ${view === 'recap' ? 'is-active' : ''}" type="button" data-game-view="recap">回顾</button>
      </nav>
      ${view === 'recap' ? renderRecap(state) : renderPlay(model)}
    </section>
  `;
};
