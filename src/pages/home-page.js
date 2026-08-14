import { escapeHtml } from '../components/html.js';

const entries = [
  { id: 'job_lost', title: '刚失业或空窗较久', conflict: '现金流与方向', available: true },
  { id: 'job_exit', title: '在职，但越来越想离开', conflict: '稳定与成长', available: false },
  { id: 'offer_choice', title: '手里有 Offer，拿不定主意', conflict: '确定性与潜力', available: false },
  { id: 'career_switch', title: '想转行，但担心从头开始', conflict: '旧积累与新起点', available: false },
  { id: 'career_stuck', title: '工作稳定但长期停滞', conflict: '安全感与机会成本', available: false },
  { id: 'promotion_load', title: '被提拔或被加担子', conflict: '权责、回报与消耗', available: false },
  { id: 'side_business', title: '想做副业或创业', conflict: '试水、承诺与风险', available: false },
  { id: 'health_boundary', title: '工作正在影响身心或家庭', conflict: '责任与止损', available: false },
];

const renderEntry = (entry) => `
  <button class="work-entry ${entry.available ? 'is-available' : 'is-locked'}" type="button" ${entry.available ? `data-work-entry="${entry.id}"` : 'disabled'}>
    <span class="work-entry-status">${entry.available ? '可体验' : '即将推出'}</span>
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
      <div class="work-entry-grid">${entries.slice(0, 3).map(renderEntry).join('')}</div>
      <details class="more-entries">
        <summary>查看全部 8 种工作处境</summary>
        <div class="work-entry-grid">${entries.slice(3).map(renderEntry).join('')}</div>
      </details>
    </section>
    <aside class="sample-route-card">
      <span>这一局不是测验</span>
      <strong>同一张命盘，不同选择，会走向不同路线。</strong>
      <p>第一条体验：《失业后的第五个月》 · 约 7 个关键选择</p>
    </aside>
    <p class="choice-disclaimer">仅供互动娱乐与选择预演参考；不替代职业、医疗、法律或财务建议。</p>
  </section>
`;
