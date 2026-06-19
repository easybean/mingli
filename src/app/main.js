import { bindEvents, bindNavEvents } from './events.js';
import { renderActivePage } from './router.js';
import { state, subscribe } from './store.js';
import { renderBottomNav } from '../components/bottom-nav.js';
import { renderCosmos } from '../components/cosmos.js';

const appRoot = document.querySelector('#app');
const navRoot = document.querySelector('#bottom-nav');
const cosmosRoot = document.querySelector('#cosmos');
let cosmosMounted = false;

const render = () => {
  document.documentElement.setAttribute('data-theme', state.ui.theme);
  if (state.ui.theme.startsWith('star') && cosmosRoot && !cosmosMounted) {
    cosmosRoot.innerHTML = renderCosmos();
    cosmosMounted = true;
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
subscribe(render);
render();
