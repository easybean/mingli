import { loadBirthInput, saveBirthInput, loadTheme, saveTheme } from '../adapters/web-storage.js';
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

export const THEMES = ['star', 'dark', 'ink'];
const DEFAULT_THEME = 'star';
const savedTheme = loadTheme();

export const state = {
  activePage: 'home',
  birthInput: {
    ...defaultBirthInput(),
    ...(savedInput || {}),
    target: savedInput?.target || targetDateTimeValue(),
  },
  astrolabeData: null,
  gameSession: {
    lifeState: createInitialLifeState(),
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
    routeScores: {
      bold: 0,
      steady: 0,
      repair: 0,
    },
    choices: [],
  },
  ui: {
    loading: false,
    error: '',
    generatedAt: '',
    todayHelpOpen: false,
    theme: THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME,
  },
};

const listeners = new Set();

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const notify = () => {
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
  state.activePage = 'today';
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
  saveBirthInput(state.birthInput);
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
  notify();
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
  state.gameSession.routeScores = {
    ...state.gameSession.routeScores,
    [style]: (state.gameSession.routeScores[style] || 0) + 1,
  };
  state.gameSession.choices.push({
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
  state.gameSession.routeScores = {
    ...state.gameSession.routeScores,
    [style]: (state.gameSession.routeScores[style] || 0) + 1,
  };
  state.gameSession.choices.push({
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

