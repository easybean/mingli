import {
  saveBirthInput, clearBirthInput, loadTheme, saveTheme,
  loadChart, saveChart, loadProgress, saveProgress, clearSavedChart,
} from '../adapters/web-storage.js';
import { targetDateTimeValue, todayInputValue } from '../adapters/web-time.js';
import {
  applyLifeStateDelta,
  createInitialLifeState,
  deltaForChoice,
  summarizeLifeStateChange,
} from '../domain/life-state.js';
import {
  advanceStory,
  chooseStoryOption,
  createWorkStorySession,
} from '../domain/work-story/story-engine.js';
import { getWorkStoryDefinitionForEntry, getWorkStoryDefinitionForSession, normalizeWorkStorySession } from '../domain/work-story/story-registry.js';
import { getStoryTheme, WORK_STORY_ENTRIES } from '../domain/work-story/story-catalog.js';
import { resolvedAppPage } from './work-navigation.js';

const defaultBirthInput = () => ({
  gender: '女',
  calendar: 'solar',
  date: '',
  birthTime: '',
  birthPlace: '',
  trueSolarTime: true,
  daylightSaving: false,
  target: targetDateTimeValue(),
});

export const THEMES = ['star', 'star-day'];
const DEFAULT_THEME = 'star';
const savedTheme = loadTheme();

// 从 localStorage 恢复命盘与进度：刷新不丢，落到今日主页。
const savedChart = loadChart();
const savedProgress = loadProgress();
const restoredData = null;

export const state = {
  // 0.1.0 总是从“选择困境”开始；旧本地命盘不再自动进入旧今日页。
  activePage: 'home',
  birthInput: {
    ...defaultBirthInput(),
    // 0.1.0 每次从处境进入都要求确认出生信息；不自动回填旧的敏感数据。
    target: targetDateTimeValue(),
  },
  astrolabeData: restoredData,
  selectedWorkEntry: null,
  workStorySession: null,
  user: null,
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
    storyCatalogTheme: 'work',
    gameView: 'play',
    accessoryOpen: false,
    portraitOpen: restoredData ? (savedProgress?.portraitOpen ?? true) : true,
    // 飞牌仪式：{ date, phase: sealed|revealed|choosing|done }，按日期一天一次。
    reveal: (restoredData && savedProgress?.reveal) || { date: '', phase: 'sealed' },
    authError: '',
    authPending: false,
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
    // Deliberately only narrative state: the chart and birth input keep their
    // existing local-storage policy. This permits a compatible in-memory
    // resume once a chart is generated without widening the privacy surface.
    workStorySession: state.workStorySession,
    selectedWorkEntry: state.selectedWorkEntry,
  });
};

export const notify = () => {
  persistProgress();
  listeners.forEach((listener) => listener(state));
};

export const setActivePage = (page) => {
  state.activePage = resolvedAppPage({ requestedPage: page, astrolabeData: state.astrolabeData, workStorySession: state.workStorySession });
  state.ui.todayHelpOpen = false;
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
  state.activePage = 'story';
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
  try {
    const definition = getWorkStoryDefinitionForEntry(state.selectedWorkEntry || 'job_lost');
    if (!definition) throw new Error('这个工作处境还在准备中。');
    state.workStorySession = createWorkStorySession({
      definition,
      profile: data.reading?.workStoryProfile,
    });
  } catch (error) {
    state.workStorySession = null;
    state.ui.error = error.message || '命盘信息不足，暂时无法生成这次工作推演。';
    state.activePage = 'birth';
  }
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
  state.selectedWorkEntry = null;
  state.workStorySession = null;
  state.gameSession.choices = [];
  state.gameSession.lifeState = createInitialLifeState();
  state.gameSession.routeScores = { bold: 0, steady: 0, repair: 0 };
  state.gameSession.todayChoiceIndex = null;
  state.gameSession.todayFeedback = null;
  state.gameSession.todayLifeChange = null;
  state.birthInput = defaultBirthInput();
  clearBirthInput();
  clearSavedChart();
  notify();
};

export const selectWorkEntry = (entry) => {
  const catalogEntry = WORK_STORY_ENTRIES.find((item) => item.id === entry);
  const definition = getWorkStoryDefinitionForEntry(entry);
  if (!catalogEntry || catalogEntry.status !== 'available' || !definition) return;
  state.selectedWorkEntry = entry;
  // A chart already exists when the user changes entry from another tab. Do
  // not request their birth data again; construct an isolated session instead.
  if (state.astrolabeData) {
    try {
      state.workStorySession = createWorkStorySession({
        definition,
        profile: state.astrolabeData.reading?.workStoryProfile,
      });
      state.activePage = 'story';
      state.ui.error = '';
    } catch (error) {
      state.ui.error = error.message || '命盘信息不足，暂时无法生成这次工作推演。';
    }
  } else {
    state.activePage = 'birth';
  }
  notify();
};

export const setStoryCatalogTheme = (themeId) => {
  state.ui.storyCatalogTheme = getStoryTheme(themeId).id;
  notify();
};

export const chooseWorkStoryChoice = (choiceId) => {
  if (!state.workStorySession || !state.astrolabeData) return;
  try {
    state.workStorySession = normalizeWorkStorySession(state.workStorySession);
    const definition = getWorkStoryDefinitionForSession(state.workStorySession);
    if (!definition) throw new Error('这段推演和当前剧本不一致，请重新开始。');
    state.workStorySession = chooseStoryOption({
      definition,
      profile: state.astrolabeData.reading?.workStoryProfile,
      session: state.workStorySession,
      choiceId,
    });
  } catch (error) {
    state.ui.error = error.message || '这一步暂时无法完成。';
  }
  notify();
};

export const advanceWorkStory = () => {
  if (!state.workStorySession || !state.astrolabeData) return;
  try {
    state.workStorySession = normalizeWorkStorySession(state.workStorySession);
    const definition = getWorkStoryDefinitionForSession(state.workStorySession);
    if (!definition) throw new Error('这段推演和当前剧本不一致，请重新开始。');
    state.workStorySession = advanceStory({
      definition,
      profile: state.astrolabeData.reading?.workStoryProfile,
      session: state.workStorySession,
    });
    if (state.workStorySession.completed) state.activePage = 'result';
  } catch (error) {
    state.ui.error = error.message || '请先完成当前选择。';
  }
  notify();
};

export const restartWorkStory = () => {
  if (!state.astrolabeData) return;
  try {
    const definition = getWorkStoryDefinitionForSession(state.workStorySession)
      || getWorkStoryDefinitionForEntry(state.selectedWorkEntry || 'job_lost');
    if (!definition) throw new Error('这个工作处境还在准备中。');
    state.workStorySession = createWorkStorySession({
      definition,
      profile: state.astrolabeData.reading?.workStoryProfile,
    });
    state.activePage = 'story';
    state.ui.error = '';
  } catch (error) {
    state.ui.error = error.message || '暂时无法重走。';
  }
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
