const WORK_FLOW_PAGES = new Set(['home', 'birth', 'story', 'result']);
const APP_PAGES = new Set(['home', 'birth', 'story', 'result', 'chart', 'profile']);

export const workPageFor = ({ astrolabeData, workStorySession } = {}) => {
  if (!astrolabeData || !workStorySession) return 'home';
  return workStorySession.completed ? 'result' : 'story';
};

export const navItemForPage = (page) => (WORK_FLOW_PAGES.has(page) ? 'work' : page);

export const resolvedAppPage = ({ requestedPage, astrolabeData, workStorySession } = {}) => {
  if (requestedPage === 'work') return workPageFor({ astrolabeData, workStorySession });
  return APP_PAGES.has(requestedPage) ? requestedPage : workPageFor({ astrolabeData, workStorySession });
};
