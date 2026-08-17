import { state } from './store.js';
import { renderHomePage } from '../pages/home-page.js';
import { renderBirthPage } from '../pages/birth-page.js';
import { renderStoryPage } from '../pages/story-page.js';
import { renderResultPage } from '../pages/result-page.js';
import { renderChartPage } from '../pages/chart-page.js';
import { renderProfilePage } from '../pages/profile-page.js';

export const renderActivePage = () => {
  switch (state.activePage) {
    case 'home':
      return renderHomePage(state);
    case 'birth':
      return renderBirthPage(state);
    case 'story':
      return renderStoryPage(state);
    case 'result':
      return renderResultPage(state);
    case 'chart':
      return renderChartPage(state);
    case 'profile':
      return renderProfilePage(state);
    default:
      return renderHomePage(state);
  }
};
