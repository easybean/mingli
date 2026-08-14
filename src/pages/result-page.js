import { escapeHtml } from '../components/html.js';
import { createWorkStoryViewModel } from '../domain/work-story/work-story-view-model.js';
import { UNEMPLOYED_MONTH_FIVE } from '../content/work-stories/unemployed-month-five.js';

export const renderResultPage = (state) => {
  const model = createWorkStoryViewModel({ definition: UNEMPLOYED_MONTH_FIVE, profile: state.astrolabeData?.reading?.workStoryProfile, session: state.workStorySession });
  const ending = model.ending;
  if (!ending) return '<section class="page"><div class="empty-state">结果仍在生成。</div></section>';
  const shareText = `我在“失业后的第五个月”走成了「${ending.title}」。如果是你，会怎么选？`;
  return `
    <section class="page result-page">
      <p class="page-kicker">你的职业路线</p>
      <h1>${escapeHtml(ending.title)}</h1>
      <p class="result-summary">${escapeHtml(ending.summaryText)}</p>
      <section class="result-block"><h2>这一轮你换来了什么</h2><p>${escapeHtml(ending.summary.gain)}</p></section>
      <section class="result-block"><h2>正在承担的代价</h2><p>${escapeHtml(ending.summary.cost)}</p></section>
      ${ending.qualityText ? `<section class="result-block"><h2>这一路的走法</h2><p>${escapeHtml(ending.qualityText)}</p></section>` : ''}
      <section class="result-block"><h2>命盘底色 vs 本轮走法</h2><p>${escapeHtml(ending.chartContrast)}</p></section>
      <section class="result-block"><h2>现实中的下一步</h2><p>${escapeHtml(ending.action)}</p></section>
      ${model.delayedEchoes.length ? `<section class="result-block"><h2>一路带来的回响</h2><p>${escapeHtml(model.delayedEchoes.map((item) => item.text).join(' '))}</p></section>` : ''}
      ${renderChips(model.chips)}
      <div class="result-actions"><button class="button button-primary" type="button" data-story-restart>重走另一条路</button><button class="button button-secondary" type="button" data-copy-share data-share-text="${escapeHtml(shareText)}">复制同题挑战</button><button class="button button-ghost" type="button" data-clear-local>清除本机数据</button></div>
      <p class="choice-disclaimer">出生信息会发送至本项目服务端用于即时排盘；不做账号同步或云端存档。推演结果保存在本机浏览器，可随时一键清除。分享不会包含出生时间、地点或命盘细节。</p>
    </section>
  `;
};

const renderChips = (chips) => `<div class="story-chips">${chips.map((chip) => `<span class="story-chip story-chip--${chip.tone}">${escapeHtml(chip.label)} <b>${chip.value}</b></span>`).join('')}</div>`;
