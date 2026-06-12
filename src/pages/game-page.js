import { escapeHtml } from '../components/html.js';
import { createGameViewModel } from '../domain/view-models/game-view-model.js';

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
    <div class="choice-collapse-note">这一关已定，剩余走法已收起。</div>
  `;
};

const renderLog = (items) => {
  if (!items.length) {
    return '<p class="page-subtitle">还没有人生主线选择。完成一关后，这里会记录你的路线。</p>';
  }
  return `
    <div class="stack">
      ${items.map((item) => `
        <article class="card card-plain stack">
          <p class="page-kicker">${escapeHtml(item.cardTitle)}</p>
          <p class="page-subtitle">${escapeHtml(item.choiceLabel)}</p>
        </article>
      `).join('')}
    </div>
  `;
};

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

  return `
    <section class="page">
      <header class="page-header">
        <p class="page-kicker">${escapeHtml(model.scopeTitle)} · ${escapeHtml(model.progressLabel)}</p>
        <h1 class="page-title">${escapeHtml(model.routeName)}</h1>
        <p class="page-subtitle">当前倾向：${escapeHtml(model.tendency)}</p>
      </header>

      <article class="card card-main challenge-card">
        <p class="page-kicker">${escapeHtml(model.currentStageLabel || model.currentCard.themeLabel || '主线')}</p>
        <h2>${escapeHtml(model.currentCard.title)}</h2>
        <p>${escapeHtml(model.scenario)}</p>
        ${model.currentStageStrategy ? `<p class="page-subtitle">${escapeHtml(model.currentStageStrategy)}</p>` : ''}
        <p class="challenge-meta">${escapeHtml(model.triggerSummary)}</p>
      </article>

      <section class="card card-plain stack">
        <p class="page-kicker">当前生活状态</p>
        <div class="life-state-row">
          ${model.lifeState.slice(0, 6).map((item) => `
            <span>${escapeHtml(item.label)} <strong>${escapeHtml(item.value)}</strong></span>
          `).join('')}
        </div>
        ${model.stateAlerts.length ? `
          <p class="page-subtitle">${escapeHtml(model.stateAlerts[0])}</p>
        ` : ''}
      </section>

      <section class="stack">
        <h2 class="page-title" style="font-size:20px">你怎么走？</h2>
        ${renderChoiceSection(model)}
      </section>

      ${model.feedback ? `
        <section class="feedback-card">
          <h3>${escapeHtml(model.feedback.title)}</h3>
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
            </details>
          ` : ''}
          <details class="share-summary share-summary-detail">
            <summary>分享文案</summary>
            <p>${escapeHtml(model.feedback.shareSummary)}</p>
          </details>
        </section>
        ${model.canGoNext ? `
          <button class="button button-primary" type="button" data-next-game-challenge>继续下一关</button>
        ` : `
          <section class="feedback-card">
            <h3>这一段已经完成</h3>
            <p>你已经走完当前范围的主要关卡。可以回到今日关卡，或切换到其他时间范围继续看。</p>
            ${model.finalSummary ? `
              <div class="life-change">
                <strong>${escapeHtml(model.finalSummary.title)}</strong>
                <div class="row">
                  ${model.finalSummary.resultTags.map((item) => `<span class="tag tag-result">${escapeHtml(item)}</span>`).join('')}
                </div>
                <p>${escapeHtml(model.finalSummary.body)}</p>
                <details class="share-summary share-summary-detail">
                  <summary>分享文案</summary>
                  <p>${escapeHtml(model.finalSummary.shareSummary)}</p>
                </details>
              </div>
            ` : ''}
          </section>
          <section class="next-actions">
            <button class="button button-primary" type="button" data-page="today">回到今日关卡</button>
            <button class="button button-secondary" type="button" data-page="reading">查看深度解读</button>
          </section>
        `}
      ` : ''}

      <details class="card card-plain stack">
        <summary class="choice-title">行动日志</summary>
        ${renderLog(model.logItems)}
      </details>

      <details class="card card-plain stack">
        <summary class="choice-title">阶段地图</summary>
        <div class="stack">
          ${model.stages.map((stage) => `
            <article class="card card-plain stack">
              <p class="page-kicker">${escapeHtml(stage.ageRange || stage.yearRange || '')}</p>
              <h2 class="page-title" style="font-size:17px">${escapeHtml(stage.title)}</h2>
              <p class="page-subtitle">${escapeHtml(stage.strategy || stage.triggerSummary || '')}</p>
            </article>
          `).join('')}
        </div>
      </details>
    </section>
  `;
};
