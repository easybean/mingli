import { state } from './store.js';
import { renderHomePage } from '../pages/home-page.js';
import { renderTodayPage } from '../pages/today-page.js';
import { renderGamePage } from '../pages/game-page.js';
import { renderReadingPage } from '../pages/reading-page.js';
import { renderSimplePage } from '../pages/simple-page.js';
import { renderProfilePage } from '../pages/profile-page.js';

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
      return renderSimplePage({
        title: '命盘',
        body: '命盘页会在后续阶段重构为手机端列表和盘面工具。当前先把主路径跑通。',
      });
    case 'profile':
      return renderProfilePage(state);
    case 'home':
    default:
      return renderHomePage(state);
  }
};
