import { fetchAstrolabe } from '../api/mingli-api.js';
import {
  setActivePage,
  setAstrolabeData,
  setBirthInput,
  setError,
  setGameScope,
  setLoading,
  setTheme,
  setChartThemeFilter,
  setTodayHelpOpen,
  setTodayFocusTheme,
  state,
  nextGameChallenge,
  selectGameChoice,
  selectTodayChoice,
} from './store.js';
import { createGameViewModel } from '../domain/view-models/game-view-model.js';
import { createTodayViewModel } from '../domain/view-models/today-view-model.js';

const formDataToInput = (form) => {
  const formData = new FormData(form);
  return {
    gender: formData.get('gender'),
    calendar: formData.get('calendar'),
    date: formData.get('date'),
    birthTime: formData.get('birthTime'),
    birthPlace: formData.get('birthPlace'),
    target: formData.get('target'),
    trueSolarTime: formData.get('trueSolarTime') === 'true',
    daylightSaving: false,
  };
};

export const bindEvents = (root) => {
  root.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-birth-form]');
    if (!form) return;
    event.preventDefault();
    const input = formDataToInput(form);
    setBirthInput(input);
    setError('');
    setLoading(true);
    try {
      const data = await fetchAstrolabe(input);
      setAstrolabeData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  });

  root.addEventListener('click', (event) => {
    const themeButton = event.target.closest('[data-theme-set]');
    if (themeButton) {
      setTheme(themeButton.dataset.themeSet);
      return;
    }

    const chartFilterButton = event.target.closest('[data-chart-filter]');
    if (chartFilterButton) {
      setChartThemeFilter(chartFilterButton.dataset.chartFilter);
      return;
    }

    const todayHelpOpenButton = event.target.closest('[data-today-help-open]');
    if (todayHelpOpenButton) {
      setTodayHelpOpen(true);
      return;
    }

    const todayHelpCloseButton = event.target.closest('[data-today-help-close]');
    if (todayHelpCloseButton) {
      setTodayHelpOpen(false);
      return;
    }

    const todayHelpBackdrop = event.target.closest('[data-today-help-backdrop]');
    if (todayHelpBackdrop && event.target === todayHelpBackdrop) {
      setTodayHelpOpen(false);
      return;
    }

    const pageButton = event.target.closest('[data-page]');
    if (pageButton) {
      if (pageButton.dataset.page === 'game' && pageButton.dataset.scope) {
        setGameScope(pageButton.dataset.scope);
        return;
      }
      setActivePage(pageButton.dataset.page);
      return;
    }

    const focusButton = event.target.closest('[data-today-focus]');
    if (focusButton) {
      setTodayFocusTheme(focusButton.dataset.todayFocus);
      return;
    }

    const gameChoiceButton = event.target.closest('[data-game-choice-index]');
    if (gameChoiceButton) {
      const model = createGameViewModel(state);
      const index = Number(gameChoiceButton.dataset.gameChoiceIndex);
      const choice = model.choices[index];
      if (!model.currentCard || !choice) return;
      selectGameChoice({ card: model.currentCard, choice, index });
      return;
    }

    const nextButton = event.target.closest('[data-next-game-challenge]');
    if (nextButton) {
      const model = createGameViewModel(state);
      nextGameChallenge(model.totalCards);
      return;
    }

    const choiceButton = event.target.closest('[data-choice-index]');
    if (choiceButton) {
      const model = createTodayViewModel(state);
      const index = Number(choiceButton.dataset.choiceIndex);
      const choice = model.choices[index];
      if (!model.card || !choice) return;
      selectTodayChoice({ card: model.card, choice, index });
    }
  });
};

export const bindNavEvents = (root) => {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    setActivePage(button.dataset.page);
  });
};
