import { escapeHtml } from '../components/html.js';
import { createWorkStoryViewModel } from '../domain/work-story/work-story-view-model.js';
import { getWorkStoryDefinitionForSession } from '../domain/work-story/story-registry.js';

const renderChips = (chips) => `<div class="story-chips">${chips.map((chip) => `<span class="story-chip story-chip--${chip.tone}">${escapeHtml(chip.label)} <b>${chip.value}</b></span>`).join('')}</div>`;
const renderCharacters = (characters) => `
  <div class="story-characters" aria-label="本幕人物">
    ${characters.map((character) => `<p class="story-character"><b>${escapeHtml(character.name)}｜${escapeHtml(character.identity)}</b><span>${escapeHtml(character.relationship)}</span></p>`).join('')}
  </div>
`;

export const renderStoryPage = (state) => {
  const definition = getWorkStoryDefinitionForSession(state.workStorySession);
  const model = createWorkStoryViewModel({ definition, profile: state.astrolabeData?.reading?.workStoryProfile, session: state.workStorySession });
  if (!model.ready || !model.node) return `<section class="page"><div class="empty-state"><p>${escapeHtml(state.ui.error || '正在生成这一次工作推演。')}</p><button class="button button-primary" data-page="birth">重新填写出生信息</button></div></section>`;
  const { node, feedback } = model;
  return `
    <section class="page story-page">
      <header class="story-header">
        <div><p class="page-kicker">工作岔路 · ${escapeHtml(model.careerStageLabel)} · ${model.progress.current} / ${model.progress.total}</p><h1>${escapeHtml(model.displayTitle)}</h1></div>
        <button class="button button-ghost" type="button" data-page="home">换一种处境</button>
      </header>
      <div class="story-progress"><span style="width:${Math.round(((model.progress.current - 1) / model.progress.total) * 100)}%"></span></div>
      <p class="story-context">${escapeHtml(model.contextLine)}</p>
      ${renderChips(model.chips)}
      <article class="story-scene">
        <p class="story-transition">${escapeHtml(node.transition)}</p>
        ${renderCharacters(node.characters)}
        <h2>${escapeHtml(node.title)}</h2>
        <p>${escapeHtml(node.scene)}</p>
        <p class="story-conflict"><b>这一幕的冲突</b>${escapeHtml(node.conflict)}</p>
      </article>
      ${model.delayedEchoes.length ? `<section class="story-echo"><p class="feedback-eyebrow">前面的选择回来了</p>${model.delayedEchoes.map((item) => `<p>${escapeHtml(item.text)}</p>`).join('')}</section>` : ''}
      <section class="story-choices">
        <p class="section-eyebrow">你准备怎么做？</p>
        ${node.choices.map((choice) => `<button class="story-choice ${feedback?.choiceId === choice.id ? 'is-selected' : ''}" type="button" data-story-choice="${escapeHtml(choice.id)}" ${feedback ? 'disabled' : ''}><strong>${escapeHtml(choice.label)}</strong></button>`).join('')}
      </section>
      ${feedback ? `<section class="story-feedback"><p class="feedback-eyebrow">这一手的回响</p><p>${escapeHtml(feedback.immediate)}</p>${feedback.delayedHint ? `<small>${escapeHtml(feedback.delayedHint)}</small>` : ''}<button class="button button-primary" type="button" data-story-advance>进入下一幕 →</button></section>` : ''}
      <details class="story-evidence"><summary>为什么会出现这个局</summary>${node.evidence.map((item) => `<p><b>${escapeHtml(item.title)}</b>${escapeHtml(item.body)}</p>`).join('')}</details>
    </section>
  `;
};
