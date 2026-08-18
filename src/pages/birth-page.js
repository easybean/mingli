import { renderBirthForm } from '../components/birth-form.js';
import { getWorkStoryDefinitionForEntry } from '../domain/work-story/story-registry.js';

export const renderBirthPage = (state) => {
  const definition = getWorkStoryDefinitionForEntry(state.selectedWorkEntry || 'job_lost');
  return `
  <section class="page birth-page">
    <header class="page-header">
      <p class="page-kicker">《${definition?.title || '工作岔路'}》</p>
      <h1 class="page-title">先生成你的局</h1>
      <p class="page-subtitle">出生日期、时间和地点会用于八字、紫微斗数与当前运限计算；它们决定这局为什么出现、矛盾偏向哪里。</p>
    </header>
    ${renderBirthForm({ input: state.birthInput, loading: state.ui.loading, error: state.ui.error })}
  </section>
`;
};
