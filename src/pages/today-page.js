import { escapeHtml } from '../components/html.js';
import { renderBirthForm } from '../components/birth-form.js';
import { createTodayViewModel } from '../domain/view-models/today-view-model.js';
import { createTodayFortuneViewModel } from '../domain/view-models/today-fortune-view-model.js';
import { createHomeViewModel } from '../domain/view-models/home-view-model.js';
import { createPortraitViewModel } from '../domain/view-models/portrait-view-model.js';
import { createTodayRevealViewModel } from '../domain/view-models/today-reveal-view-model.js';
import { createTodayInviteViewModel } from '../domain/view-models/today-invite-view-model.js';

// 飞牌仪式：摊开 7 张牌 → 翻开飞出命盘选定那张 → 接受答它 / 自己选。
const renderReveal = (reveal) => {
  if (reveal.phase === 'choosing') {
    return `
      <section class="reveal reveal-choosing">
        <p class="reveal-lead">那今天你想先看哪一块？</p>
        <div class="reveal-grid">
          ${reveal.themes.map((t) => `
            <button class="reveal-theme ${t.available ? '' : 'is-dim'}" type="button"
              ${t.available ? `data-reveal-pick="${t.id}"` : 'disabled'}>${t.label}</button>
          `).join('')}
        </div>
        <p class="focus-hint">灰掉的是命盘今天没有出题的维度。</p>
      </section>
    `;
  }
  if (reveal.phase === 'revealed') {
    return `
      <section class="reveal reveal-revealed">
        <p class="reveal-lead">命盘替你挑了今天这一件：</p>
        <article class="reveal-card reveal-card-fly">
          <span class="reveal-card-theme">${reveal.pickedThemeLabel}</span>
          <h3 class="reveal-card-title">${reveal.pickedTitle}</h3>
          ${reveal.pickedScenario ? `<p class="reveal-card-scenario">${reveal.pickedScenario}</p>` : ''}
        </article>
        <div class="reveal-actions">
          <button class="button button-primary" type="button" data-reveal-accept>就答这一题</button>
          <button class="button button-secondary" type="button" data-reveal-decline>我想自己选</button>
        </div>
      </section>
    `;
  }
  // sealed
  return `
    <section class="reveal reveal-sealed">
      <p class="reveal-lead">命盘正为你挑今天该看的那一件事…</p>
      <div class="reveal-fan">
        ${reveal.themes.map((t, i) => `<span class="reveal-back ${t.available ? '' : 'is-dim'}" style="--i:${i - 3}"></span>`).join('')}
      </div>
      <button class="button button-primary" type="button" data-reveal-tap>翻开今天 →</button>
    </section>
  `;
};

// 今日 = 主页：身份条 / 今日运势 / 今日一题（就地作答）/ 画像（可折叠）+ 分享卡 /
// 进游戏邀请 / 小工具入口。没有命盘时这张页就是出生信息表单。

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

const renderTodayFortune = (fortune) => {
  if (!fortune.ready) return '';
  return `
    <article class="fortune-card">
      <div class="fortune-head">
        <span class="fortune-kicker">${escapeHtml(fortune.kicker)}</span>
        <span class="fortune-tag">${escapeHtml(fortune.ganZhi)} · ${escapeHtml(fortune.label)}</span>
      </div>
      <p class="fortune-line">${escapeHtml(fortune.line)}</p>
      ${fortune.favoredHint ? `<p class="fortune-favored">${escapeHtml(fortune.favoredHint)}</p>` : ''}
    </article>
  `;
};

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

const renderHelpModal = (model) => model.helpOpen ? `
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
` : '';

// 今日一题：情境 + 焦点 + 选项 + 反馈，就地作答。
const renderDailyQuestion = (model) => `
  <section class="daily-block">
    <header class="daily-block-head">
      <p class="daily-block-kicker">今日一题 · 当前主题 <span class="daily-theme-accent">${escapeHtml(model.themeLabel)}</span></p>
      <button class="help-icon-button" type="button" data-today-help-open aria-label="查看今日关卡说明">?</button>
    </header>

    <article class="scenario-card">
      <h2 class="scenario-title">${escapeHtml(model.card?.title || '今天先做这一题')}</h2>
      <p class="scenario-text">${escapeHtml(model.scenario)}</p>
      ${model.conflictLine ? `
        <div class="scenario-conflict">
          <span class="scenario-conflict-label">冲突</span>
          <span class="scenario-conflict-body">${escapeHtml(model.conflictLine)}</span>
        </div>
      ` : ''}
    </article>

    <div class="stack daily-choice-section">
      <h3 class="daily-question">${escapeHtml(model.question)}</h3>
      ${renderChoiceSection(model)}
    </div>

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
      <small class="feedback-tomorrow">${escapeHtml(model.feedback.tomorrowHint)}</small>
    ` : ''}
  </section>
`;

// 画像可折叠：新生成默认展开（第一击），点头部可收起。展开时带分享卡。
const renderPortraitSection = (portrait, open) => {
  if (!portrait.ready) return '';
  return `
    <section class="portrait-section ${open ? 'is-open' : ''}">
      <button class="portrait-toggle" type="button" data-portrait-toggle aria-expanded="${open}">
        <span class="portrait-toggle-text">
          <span class="portrait-toggle-title">你是谁</span>
          <span class="portrait-toggle-sub">${escapeHtml(portrait.shareCard?.tagline || '你的命格画像')}</span>
        </span>
        <span class="portrait-toggle-icon" aria-hidden="true">${open ? '−' : '+'}</span>
      </button>
      ${open ? `
        <div class="portrait-body">
          <article class="portrait-card">
            <span class="portrait-kicker">${escapeHtml(portrait.kicker)}</span>
            <h2 class="portrait-title">${escapeHtml(portrait.title)}</h2>
            <p class="portrait-hook">${escapeHtml(portrait.hook)}</p>
            ${portrait.paragraphs.map((text) => `<p class="portrait-line">${escapeHtml(text)}</p>`).join('')}
            <p class="portrait-turn">${escapeHtml(portrait.turn)}</p>
            <p class="portrait-note">${escapeHtml(portrait.note)}</p>
          </article>
          ${portrait.shareCard ? `
            <div class="share-poster" data-share-poster>
              <span class="share-brand">MINGLI · 命理</span>
              <p class="share-tagline">${escapeHtml(portrait.shareCard.tagline)}</p>
              <p class="share-tension">${escapeHtml(portrait.shareCard.tension)}</p>
              <p class="share-turn">${escapeHtml(portrait.shareCard.turn)}</p>
            </div>
            <div class="share-actions">
              <button class="button button-secondary" type="button" data-copy-share data-share-text="${escapeHtml(portrait.shareText)}">复制这段话</button>
              <span class="share-hint">截图这张卡，或复制文案，发给懂你的人。</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </section>
  `;
};

// 想认真理一理 → 进游戏：今日主页通往深度场的智能引流入口（lead 按最近选择个人化）。
const renderGameInvite = (quickEntries, invite) => `
  <section class="game-invite">
    <p class="game-invite-lead">${escapeHtml(invite.lead)}</p>
    <div class="quick-entry-grid">
      ${quickEntries.map((entry) => `
        <button class="quick-entry ${entry.id === invite.scope ? 'is-recommended' : ''}" type="button" data-page="game" data-scope="${escapeHtml(entry.id)}">
          <span class="quick-entry-label">${escapeHtml(entry.label)}${entry.id === invite.scope ? ' · 推荐' : ''}</span>
          <span class="quick-entry-title">${escapeHtml(entry.title)}</span>
          <span class="quick-entry-sub">${entry.sub}</span>
        </button>
      `).join('')}
    </div>
  </section>
`;

export const renderTodayPage = (state) => {
  // 没有命盘：今日主页即出生信息表单。
  if (!state.astrolabeData) {
    return `
      <section class="page">
        <header class="page-header">
          <p class="page-kicker">MINGLI · 命理</p>
          <h1 class="page-title">开启你的今日</h1>
          <p class="page-subtitle">用出生信息生成命盘，把今天、近期和人生主线变成可以选择的关卡。</p>
        </header>
        ${renderBirthForm({ input: state.birthInput, loading: state.ui.loading, error: state.ui.error })}
      </section>
    `;
  }

  const model = createTodayViewModel(state);
  const fortune = createTodayFortuneViewModel(state);
  const portrait = createPortraitViewModel(state);
  const home = createHomeViewModel(state);
  const reveal = createTodayRevealViewModel(state);
  const portraitOpen = state.ui.portraitOpen !== false;

  return `
    <section class="page today-home">
      ${renderIdentityStrip(home.identity || {})}
      ${renderHelpModal(model)}
      ${renderTodayFortune(fortune)}
      ${reveal.active ? renderReveal(reveal) : (model.ready ? renderDailyQuestion(model) : '')}
      ${renderPortraitSection(portrait, portraitOpen)}
      ${home.quickEntries ? renderGameInvite(home.quickEntries, createTodayInviteViewModel(state)) : ''}
      <button class="deep-reading-link" type="button" data-page="profile">想知道自己适合戴什么？去「我的」看看 →</button>
    </section>
  `;
};
