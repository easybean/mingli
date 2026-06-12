import { bindEvents, bindNavEvents } from './events.js';
import { renderActivePage } from './router.js';
import { state, subscribe } from './store.js';
import { renderBottomNav } from '../components/bottom-nav.js';

const appRoot = document.querySelector('#app');
const navRoot = document.querySelector('#bottom-nav');

const render = () => {
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
