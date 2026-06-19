import { state } from './store.js';
import { renderHomePage } from '../pages/home-page.js';
import { renderTodayPage } from '../pages/today-page.js';
import { renderGamePage } from '../pages/game-page.js';
import { renderReadingPage } from '../pages/reading-page.js';
import { renderProfilePage } from '../pages/profile-page.js';
import { renderChartPage } from '../pages/chart-page.js';

export const renderActivePage = () => {
  if (!state.astrolabeData && state.activePage !== 'home') {
    return renderHomePage(state);
  }

  switch (state.activePage) {
    case 'today':
      return renderTodayPage(state);
    case 'game':
      return renderGamePage(state);
    case 'reading':
      return renderReadingPage(state);
    case 'chart':
      return renderChartPage(state);
    case 'profile':
      return renderProfilePage(state);
    case 'home':
    default:
      return renderHomePage(state);
  }
};
