import { renderBirthForm } from '../components/birth-form.js';

export const renderBirthPage = (state) => `
  <section class="page birth-page">
    <header class="page-header">
      <p class="page-kicker">《失业后的第五个月》</p>
      <h1 class="page-title">先生成你的局</h1>
      <p class="page-subtitle">出生日期、时间和地点会用于八字、紫微斗数与当前运限计算；它们决定这局为什么出现、矛盾偏向哪里。</p>
    </header>
    ${renderBirthForm({ input: state.birthInput, loading: state.ui.loading, error: state.ui.error })}
  </section>
`;
