import { effectList, firstOf, outcomeTags, routeHint, routeName, shareSummaryText } from './helpers.js';
import { choicePresentation } from './choice-presentation.js';
import { orderCardsForLifeState } from '../game-branching.js';
import {
  LIFE_STATE_LABELS,
  stateAlerts,
  summarizeFinalRoute,
} from '../life-state.js';

const scopeLabel = (scope) => ({
  day: '今日关卡',
  month: '最近一月',
  year: '最近一年',
  decade: '最近十年',
  lifetime: '人生主线',
}[scope] || '人生主线');

const scopeData = (lifeGame, scope) => {
  if (!lifeGame) return null;
  if (scope === 'lifetime') return lifeGame.scopes?.lifetime || lifeGame;
  return lifeGame.scopes?.[scope] || lifeGame;
};

const topRoute = (scores) => {
  const entries = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[1] > 0 ? entries[0][0] : 'steady';
};

export const createGameViewModel = (state) => {
  const data = state.astrolabeData;
  const lifeGame = data?.reading?.lifeGame;
  const scope = state.gameSession.activeScope || 'lifetime';
  const activeScope = scopeData(lifeGame, scope);
  const cards = activeScope?.cards || [];
  const totalCards = cards.length;
  const routeStyle = topRoute(state.gameSession.routeScores);
  const completedChoices = state.gameSession.choices.filter((item) => item.scope === scope);
  const completedIds = completedChoices.map((item) => item.cardId);
  const selectedIndex = state.gameSession.gameChoiceIndex;
  const lockedCard = cards.find((item) => item.id === state.gameSession.gameCurrentCardId);
  const isMonthScope = scope === 'month';
  const pendingCards = isMonthScope
    ? cards.slice(Math.min(state.gameSession.currentIndex || 0, Math.max(cards.length - 1, 0)))
    : orderCardsForLifeState({
      cards,
      lifeState: state.gameSession.lifeState,
      routeStyle,
      completedIds,
    });
  const monthIndex = Math.min(state.gameSession.currentIndex || 0, Math.max(totalCards - 1, 0));
  const currentCard = Number.isInteger(selectedIndex) && lockedCard
    ? lockedCard
    : (isMonthScope ? cards[monthIndex] : pendingCards[0]);
  const selectedChoice = Number.isInteger(selectedIndex) ? currentCard?.choices?.[selectedIndex] : null;
  const feedback = state.gameSession.gameFeedback;
  const lifeChange = state.gameSession.gameLifeChange;
  const logItems = state.gameSession.choices
    .filter((item) => item.scope !== 'day')
    .slice(-4)
    .reverse();
  const completedCount = isMonthScope ? monthIndex : completedChoices.length;
  const awaitingAdvance = Number.isInteger(selectedIndex);
  const resolvedCompletedCount = isMonthScope && awaitingAdvance
    ? Math.min(totalCards, monthIndex + 1)
    : completedCount;
  const progressIndex = totalCards
    ? Math.min(awaitingAdvance ? resolvedCompletedCount : (completedCount + 1), totalCards)
    : 0;
  const feedbackTags = outcomeTags({
    theme: currentCard?.theme,
    style: selectedChoice?.style || feedback?.style || 'steady',
    delta: lifeChange?.delta || {},
    scope,
  });
  const finalBaseSummary = awaitingAdvance && resolvedCompletedCount >= totalCards
    ? summarizeFinalRoute(state.gameSession.lifeState)
    : null;
  const finalTags = finalBaseSummary ? outcomeTags({
    theme: currentCard?.theme,
    style: routeStyle,
    delta: state.gameSession.gameLifeChange?.delta || {},
    scope,
  }) : [];

  return {
    ready: Boolean(activeScope && currentCard),
    routeName: lifeGame?.archetype?.name ? `${lifeGame.archetype.name}路线` : '人生主线',
    scope,
    scopeTitle: scopeLabel(scope),
    headline: activeScope?.headline || lifeGame?.headline || '先完成当前关卡，再继续下一步。',
    tendency: routeName(routeStyle),
    progressLabel: `${Math.max(progressIndex, 1)} / ${Math.max(totalCards, 1)} 关`,
    currentIndex: Math.max(progressIndex - 1, 0),
    totalCards,
    currentCard,
    currentStageLabel: currentCard?.stageTitle || '',
    currentStageRange: currentCard?.stageRange || '',
    currentStageStrategy: currentCard?.stageStrategy || '',
    scenario: firstOf(currentCard?.dramaticText, currentCard?.summary, activeScope?.headline),
    triggerSummary: [
      currentCard?.stageRange ? `${currentCard.stageRange}` : '',
      currentCard?.triggerSummary || activeScope?.focusLabel || '',
    ].filter(Boolean).join(' · '),
    choices: (currentCard?.choices || []).map((choice) => ({
      ...choice,
      presentation: choicePresentation(choice, { theme: currentCard?.theme }),
    })),
    selectedIndex,
    lifeState: Object.entries(state.gameSession.lifeState || {})
      .map(([key, value]) => ({
        key,
        label: LIFE_STATE_LABELS[key] || key,
        value,
      })),
    stateAlerts: stateAlerts(state.gameSession.lifeState).slice(0, 2),
    feedback: feedback ? {
      title: feedback.title,
      resultTags: feedbackTags,
      shareSummary: shareSummaryText({
        scope,
        theme: currentCard?.theme,
        title: currentCard?.title,
        routeLabel: routeName(selectedChoice?.style || feedback.style || 'steady'),
        tags: feedbackTags,
        lifeChange,
      }),
      body: [
        feedback.body,
        routeHint(selectedChoice?.style || feedback.style),
      ].filter(Boolean).join(' '),
      effects: effectList(feedback.effects),
      lifeChange: lifeChange ? {
        title: lifeChange.title,
        body: lifeChange.body,
      } : null,
    } : null,
    canGoNext: awaitingAdvance && resolvedCompletedCount < totalCards,
    finalSummary: finalBaseSummary
      ? {
        ...finalBaseSummary,
        resultTags: finalTags,
        shareSummary: shareSummaryText({
          scope,
          theme: currentCard?.theme,
          tags: finalTags,
          finalSummary: finalBaseSummary,
        }),
      }
      : null,
    stages: activeScope?.stages?.slice(0, 3) || [],
    choicesCount: state.gameSession.choices.filter((item) => item.scope !== 'day').length,
    logItems,
  };
};
