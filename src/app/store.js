import {
  loadBirthInput, saveBirthInput, loadTheme, saveTheme,
  loadChart, saveChart, loadProgress, saveProgress, clearSavedChart,
} from '../adapters/web-storage.js';
import { targetDateTimeValue, todayInputValue } from '../adapters/web-time.js';
import {
  applyLifeStateDelta,
  createInitialLifeState,
  deltaForChoice,
  summarizeLifeStateChange,
} from '../domain/life-state.js';

const defaultBirthInput = () => ({
  gender: '女',
  calendar: 'solar',
  date: '1992-08-18',
  birthTime: '08:30',
  birthPlace: '徐州',
  trueSolarTime: true,
  daylightSaving: false,
  target: targetDateTimeValue(),
});

const savedInput = loadBirthInput();

export const THEMES = ['star', 'star-day'];
const DEFAULT_THEME = 'star';
const savedTheme = loadTheme();

// 从 localStorage 恢复命盘与进度：刷新不丢，落到今日主页。
const savedChart = loadChart();
const savedProgress = loadProgress();
const restoredData = savedChart?.astrolabeData || null;

export const state = {
  activePage: restoredData ? 'today' : 'home',
  birthInput: {
    ...defaultBirthInput(),
    ...(savedInput || {}),
    // "当前时间"永远取本次进入页面的此刻，其余出生信息仍从缓存恢复。
    target: targetDateTimeValue(),
  },
  astrolabeData: restoredData,
  gameSession: {
    lifeState: (restoredData && savedProgress?.lifeState) || createInitialLifeState(),
    todayFocusTheme: null,
    activeScope: 'lifetime',
    currentIndex: 0,
    gameCurrentCardId: null,
    gameChoiceIndex: null,
    gameFeedback: null,
    todayChoiceIndex: null,
    todayFeedback: null,
    todayLifeChange: null,
    gameLifeChange: null,
    routeScores: (restoredData && savedProgress?.routeScores) || {
      bold: 0,
      steady: 0,
      repair: 0,
    },
    choices: (restoredData && savedProgress?.choices) || [],
  },
  ui: {
    loading: false,
    error: '',
    generatedAt: (restoredData && savedChart?.generatedAt) || '',
    todayHelpOpen: false,
    theme: THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME,
    chartThemeFilter: 'all',
    gameView: 'play',
    accessoryOpen: false,
    portraitOpen: restoredData ? (savedProgress?.portraitOpen ?? true) : true,
    // 飞牌仪式：{ date, phase: sealed|revealed|choosing|done }，按日期一天一次。
    reveal: (restoredData && savedProgress?.reveal) || { date: '', phase: 'sealed' },
  },
};

const listeners = new Set();

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// 把轻量进度写回 localStorage（只在有命盘时；命盘本身只在 setAstrolabeData 时单独写）。
const persistProgress = () => {
  if (!state.astrolabeData) return;
  saveProgress({
    choices: state.gameSession.choices,
    lifeState: state.gameSession.lifeState,
    routeScores: state.gameSession.routeScores,
    portraitOpen: state.ui.portraitOpen,
    reveal: state.ui.reveal,
  });
};

export const notify = () => {
  persistProgress();
  listeners.forEach((listener) => listener(state));
};

export const setActivePage = (page) => {
  state.activePage = page;
  if (page !== 'today') {
    state.ui.todayHelpOpen = false;
  }
  notify();
};

export const setBirthInput = (patch) => {
  state.birthInput = {
    ...state.birthInput,
    ...patch,
  };
  saveBirthInput(state.birthInput);
  notify();
};

export const setLoading = (loading) => {
  state.ui.loading = loading;
  notify();
};

export const setError = (error) => {
  state.ui.error = error || '';
  notify();
};

export const setAstrolabeData = (data) => {
  state.astrolabeData = data;
  // 今日 = 主页：生成后落到今日主页（画像/运势/今日一题都在这屏），画像默认展开。
  state.activePage = 'today';
  state.ui.portraitOpen = true;
  state.ui.generatedAt = todayInputValue();
  state.gameSession.todayChoiceIndex = null;
  state.gameSession.todayFeedback = null;
  state.gameSession.todayLifeChange = null;
  state.gameSession.todayFocusTheme = null;
  state.gameSession.activeScope = 'lifetime';
  state.gameSession.currentIndex = 0;
  state.gameSession.gameCurrentCardId = null;
  state.gameSession.gameChoiceIndex = null;
  state.gameSession.gameFeedback = null;
  state.gameSession.gameLifeChange = null;
  state.gameSession.lifeState = createInitialLifeState();
  state.gameSession.choices = [];
  state.gameSession.routeScores = { bold: 0, steady: 0, repair: 0 };
  state.ui.todayHelpOpen = false;
  state.ui.chartThemeFilter = 'all';
  state.ui.gameView = 'play';
  state.ui.reveal = { date: '', phase: 'sealed' };
  saveBirthInput(state.birthInput);
  saveChart({ astrolabeData: data, generatedAt: state.ui.generatedAt });
  notify();
};

// 跨天刷新：新的一天重新拉命盘（流日变了），重置今日临时态与仪式，
// 但保留闯关进度(choices/lifeState/routeScores)。
export const refreshAstrolabeData = (data) => {
  state.astrolabeData = data;
  state.ui.generatedAt = todayInputValue();
  state.gameSession.todayChoiceIndex = null;
  state.gameSession.todayFeedback = null;
  state.gameSession.todayLifeChange = null;
  state.gameSession.todayFocusTheme = null;
  state.ui.reveal = { date: '', phase: 'sealed' };
  saveChart({ astrolabeData: data, generatedAt: state.ui.generatedAt });
  notify();
};

// —— 飞牌仪式动作 ——
export const revealTap = () => {
  state.ui.reveal = { date: todayInputValue(), phase: 'revealed' };
  notify();
};

export const acceptReveal = () => {
  // 接受命盘选定那张：focus 留空 → pickTodayCard 取主卡(cards[0])。
  state.gameSession.todayFocusTheme = null;
  state.ui.reveal = { date: todayInputValue(), phase: 'done' };
  notify();
};

export const declineReveal = () => {
  state.ui.reveal = { date: todayInputValue(), phase: 'choosing' };
  notify();
};

export const pickRevealTheme = (theme) => {
  state.gameSession.todayFocusTheme = theme || null;
  state.ui.reveal = { date: todayInputValue(), phase: 'done' };
  notify();
};

// 重新填写出生信息：清掉命盘与进度，回到出生表单。
export const clearAstrolabe = () => {
  state.astrolabeData = null;
  state.activePage = 'home';
  state.gameSession.choices = [];
  state.gameSession.lifeState = createInitialLifeState();
  state.gameSession.routeScores = { bold: 0, steady: 0, repair: 0 };
  state.gameSession.todayChoiceIndex = null;
  state.gameSession.todayFeedback = null;
  state.gameSession.todayLifeChange = null;
  clearSavedChart();
  notify();
};

export const setGameView = (view = 'play') => {
  state.ui.gameView = view === 'recap' ? 'recap' : 'play';
  state.activePage = 'game';
  notify();
};

export const toggleAccessory = (open) => {
  state.ui.accessoryOpen = open === undefined ? !state.ui.accessoryOpen : Boolean(open);
  state.activePage = 'profile';
  notify();
};

export const togglePortrait = (open) => {
  state.ui.portraitOpen = open === undefined ? !state.ui.portraitOpen : Boolean(open);
  notify();
};

export const setChartThemeFilter = (filter = 'all') => {
  state.ui.chartThemeFilter = filter || 'all';
  notify();
};

export const setTodayFocusTheme = (theme) => {
  state.gameSession.todayFocusTheme = theme || null;
  state.gameSession.todayChoiceIndex = null;
  state.gameSession.todayFeedback = null;
  state.gameSession.todayLifeChange = null;
  state.activePage = 'today';
  notify();
};

export const setTheme = (theme) => {
  if (!THEMES.includes(theme) || state.ui.theme === theme) return;
  state.ui.theme = theme;
  saveTheme(theme);
  notify();
};

export const setTodayHelpOpen = (open) => {
  state.ui.todayHelpOpen = Boolean(open);
  notify();
};

export const setGameScope = (scope = 'lifetime') => {
  state.gameSession.activeScope = scope;
  state.gameSession.currentIndex = 0;
  state.gameSession.gameCurrentCardId = null;
  state.gameSession.gameChoiceIndex = null;
  state.gameSession.gameFeedback = null;
  state.gameSession.gameLifeChange = null;
  state.activePage = 'game';
  state.ui.gameView = 'play';
  notify();
};

// 记录一次选择：同一 scope 下同一张卡只保留最新一条（重答即替换），
// 倾向计分(routeScores)也随之撤旧记新，避免重复入库导致解读出现两遍。
const recordChoice = (entry) => {
  const existing = state.gameSession.choices.find(
    (item) => item.scope === entry.scope && item.cardId === entry.cardId,
  );
  if (existing) {
    if (state.gameSession.routeScores[existing.style] > 0) {
      state.gameSession.routeScores[existing.style] -= 1;
    }
    state.gameSession.choices = state.gameSession.choices.filter((item) => item !== existing);
  }
  state.gameSession.routeScores[entry.style] = (state.gameSession.routeScores[entry.style] || 0) + 1;
  state.gameSession.choices.push(entry);
};

export const selectTodayChoice = ({ card, choice, index }) => {
  const style = choice.style || 'steady';
  const before = { ...state.gameSession.lifeState };
  const delta = deltaForChoice(choice);
  const after = applyLifeStateDelta(before, delta);
  state.gameSession.lifeState = after;
  state.gameSession.todayChoiceIndex = index;
  state.gameSession.todayFeedback = {
    body: choice.feedback || '这个选择会影响今天的推进方式。',
    effects: choice.statEffects || {},
    style,
    choiceLabel: choice.label,
  };
  state.gameSession.todayLifeChange = summarizeLifeStateChange({ before, after, delta, card, choice });
  recordChoice({
    scope: 'day',
    cardId: card.id,
    cardTitle: card.title,
    choiceLabel: choice.label,
    style,
    lifeChange: state.gameSession.todayLifeChange,
  });
  notify();
};

export const selectGameChoice = ({ card, choice, index }) => {
  const style = choice.style || 'steady';
  const before = { ...state.gameSession.lifeState };
  const delta = deltaForChoice(choice);
  const after = applyLifeStateDelta(before, delta);
  state.gameSession.lifeState = after;
  state.gameSession.gameCurrentCardId = card.id;
  state.gameSession.gameChoiceIndex = index;
  state.gameSession.gameFeedback = {
    body: choice.feedback || '这个选择会影响后续关卡的语气。',
    effects: choice.statEffects || {},
    style,
    choiceLabel: choice.label,
  };
  state.gameSession.gameLifeChange = summarizeLifeStateChange({ before, after, delta, card, choice });
  recordChoice({
    scope: state.gameSession.activeScope,
    cardId: card.id,
    cardTitle: card.title,
    choiceLabel: choice.label,
    style,
    lifeChange: state.gameSession.gameLifeChange,
  });
  notify();
};

export const nextGameChallenge = (total) => {
  if (!Number.isFinite(total) || total <= 0) return;
  state.gameSession.currentIndex = Math.min(state.gameSession.currentIndex + 1, total - 1);
  state.gameSession.gameCurrentCardId = null;
  state.gameSession.gameChoiceIndex = null;
  state.gameSession.gameFeedback = null;
  state.gameSession.gameLifeChange = null;
  notify();
};

