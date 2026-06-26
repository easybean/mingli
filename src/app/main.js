import { bindEvents, bindNavEvents, bindThemeToggle } from './events.js';
import { renderActivePage } from './router.js';
import { state, subscribe, refreshAstrolabeData } from './store.js';
import { fetchAstrolabe } from '../api/mingli-api.js';
import { todayInputValue } from '../adapters/web-time.js';
import { renderBottomNav } from '../components/bottom-nav.js';
import { renderCosmos } from '../components/cosmos.js';
import { renderThemeToggle } from '../components/theme-toggle.js';

const appRoot = document.querySelector('#app');
const navRoot = document.querySelector('#bottom-nav');
const cosmosRoot = document.querySelector('#cosmos');
const themeToggleRoot = document.querySelector('#theme-toggle');
let cosmosMounted = false;

const render = () => {
  document.documentElement.setAttribute('data-theme', state.ui.theme);
  if (state.ui.theme.startsWith('star') && cosmosRoot && !cosmosMounted) {
    cosmosRoot.innerHTML = renderCosmos();
    cosmosMounted = true;
  }
  if (themeToggleRoot) {
    themeToggleRoot.innerHTML = renderThemeToggle(state.ui.theme);
  }
  appRoot.innerHTML = renderActivePage();
  renderBottomNav({
    root: navRoot,
    activePage: state.activePage,
    hasData: Boolean(state.astrolabeData),
  });
};

bindEvents(appRoot);
bindNavEvents(navRoot);
if (themeToggleRoot) bindThemeToggle(themeToggleRoot);
subscribe(render);
render();

// 跨天刷新：恢复的命盘若是别的日子生成的，悄悄重新拉一次（流日变了），
// 保留闯关进度。失败就沿用已有命盘，不打断使用。
const ensureFreshToday = async () => {
  if (!state.astrolabeData) return;
  const generatedDate = (state.ui.generatedAt || '').slice(0, 10);
  if (!generatedDate || generatedDate === todayInputValue()) return;
  try {
    const data = await fetchAstrolabe(state.birthInput);
    refreshAstrolabeData(data);
  } catch {
    // 离线或服务不可用：保留已恢复的命盘。
  }
};
ensureFreshToday();
