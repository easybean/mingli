#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const importSource = async (file) => {
  const source = fs.readFileSync(file, 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};

const main = async () => {
  const errors = [];
  const navigation = await importSource(path.join(__dirname, '../src/app/work-navigation.js'));
  const activeSession = { completed: false };
  const completedSession = { completed: true };
  if (navigation.workPageFor({ astrolabeData: {}, workStorySession: activeSession }) !== 'story') errors.push('active work session must resume story');
  if (navigation.workPageFor({ astrolabeData: {}, workStorySession: completedSession }) !== 'result') errors.push('completed work session must resume result');
  if (navigation.workPageFor({ astrolabeData: null, workStorySession: activeSession }) !== 'home') errors.push('work tab without a session must return home');
  if (navigation.resolvedAppPage({ requestedPage: 'today', astrolabeData: {}, workStorySession: activeSession }) !== 'story'
    || navigation.resolvedAppPage({ requestedPage: 'game', astrolabeData: {}, workStorySession: completedSession }) !== 'result') errors.push('legacy today/game routes must not be reachable');
  if (navigation.navItemForPage('birth') !== 'work' || navigation.navItemForPage('story') !== 'work' || navigation.navItemForPage('result') !== 'work') errors.push('all work flow pages must activate the work tab');

  const bottomNav = await importSource(path.join(__dirname, '../src/components/bottom-nav.js'));
  const root = { hidden: true, innerHTML: '' };
  bottomNav.renderBottomNav({ root, activeItem: 'work', visible: true });
  if (root.hidden || (root.innerHTML.match(/data-page=/g) || []).length !== 3 || !/data-page="work"/.test(root.innerHTML)
    || !/data-page="chart"/.test(root.innerHTML) || !/data-page="profile"/.test(root.innerHTML)
    || /data-page="(?:today|game|reading)"/.test(root.innerHTML) || !/aria-current="page"/.test(root.innerHTML)) errors.push('bottom nav must expose exactly work, chart, and profile');

  const router = fs.readFileSync(path.join(__dirname, '../src/app/router.js'), 'utf8');
  if (!/renderChartPage/.test(router) || !/renderProfilePage/.test(router) || /today-page|game-page/.test(router)) errors.push('router must expose chart/profile without legacy today/game routes');
  const profile = fs.readFileSync(path.join(__dirname, '../src/pages/profile-page.js'), 'utf8');
  if (/data-auth-|data-logout|account-form|type="password"/.test(profile) || !/本机数据/.test(profile)) errors.push('profile must retain only local-data controls, not auth or sync entry points');
  const chart = fs.readFileSync(path.join(__dirname, '../src/pages/chart-page.js'), 'utf8');
  if (!/data-page="birth">去生成命盘/.test(chart)) errors.push('empty chart must lead to birth input, not a legacy route');

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL ${error}`));
    process.exit(1);
  }
  console.log('PASS navigation: work/story resume, chart/profile routes, local-only profile, no legacy nav');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
