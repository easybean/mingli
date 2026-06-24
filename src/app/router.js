import { state } from './store.js';
import { renderTodayPage } from '../pages/today-page.js';
import { renderGamePage } from '../pages/game-page.js';
import { renderProfilePage } from '../pages/profile-page.js';
import { renderChartPage } from '../pages/chart-page.js';

export const renderActivePage = () => {
  // 今日 = 主页：没有命盘时它就是出生信息表单；「home」已并入今日。
  if (!state.astrolabeData) {
    return renderTodayPage(state);
  }

  switch (state.activePage) {
    case 'game':
      return renderGamePage(state);
    case 'chart':
      return renderChartPage(state);
    case 'profile':
      return renderProfilePage(state);
    case 'today':
    case 'home':
    default:
      return renderTodayPage(state);
  }
};
