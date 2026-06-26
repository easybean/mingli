import { fetchAstrolabe } from '../api/mingli-api.js';
import {
  setActivePage,
  setAstrolabeData,
  setBirthInput,
  setError,
  setGameScope,
  setGameView,
  setLoading,
  setTheme,
  setChartThemeFilter,
  toggleAccessory,
  togglePortrait,
  clearAstrolabe,
  revealTap,
  acceptReveal,
  declineReveal,
  pickRevealTheme,
  setTodayHelpOpen,
  state,
  nextGameChallenge,
  selectGameChoice,
  selectTodayChoice,
} from './store.js';
import { createGameViewModel } from '../domain/view-models/game-view-model.js';
import { createTodayViewModel } from '../domain/view-models/today-view-model.js';
import { openZiling } from '../tools/ziling-pai/ziling-controller.js';

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

    const accessoryToggle = event.target.closest('[data-accessory-toggle]');
    if (accessoryToggle) {
      toggleAccessory();
      return;
    }

    const zilingOpen = event.target.closest('[data-ziling-open]');
    if (zilingOpen) {
      openZiling({ astrolabeData: state.astrolabeData, onTheme: setTheme });
      return;
    }

    const portraitToggle = event.target.closest('[data-portrait-toggle]');
    if (portraitToggle) {
      togglePortrait();
      return;
    }

    const resetChartButton = event.target.closest('[data-reset-chart]');
    if (resetChartButton) {
      clearAstrolabe();
      return;
    }

    const revealTapButton = event.target.closest('[data-reveal-tap]');
    if (revealTapButton) {
      revealTap();
      return;
    }

    const revealAcceptButton = event.target.closest('[data-reveal-accept]');
    if (revealAcceptButton) {
      acceptReveal();
      return;
    }

    const revealDeclineButton = event.target.closest('[data-reveal-decline]');
    if (revealDeclineButton) {
      declineReveal();
      return;
    }

    const revealPickButton = event.target.closest('[data-reveal-pick]');
    if (revealPickButton) {
      pickRevealTheme(revealPickButton.dataset.revealPick);
      return;
    }

    const gameViewButton = event.target.closest('[data-game-view]');
    if (gameViewButton) {
      setGameView(gameViewButton.dataset.gameView);
      return;
    }

    const copyShareButton = event.target.closest('[data-copy-share]');
    if (copyShareButton) {
      const text = copyShareButton.dataset.shareText || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => { copyShareButton.textContent = '已复制 ✓'; })
          .catch(() => { copyShareButton.textContent = '复制失败，长按上面选中'; });
      } else {
        copyShareButton.textContent = '请长按上面文字复制';
      }
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
