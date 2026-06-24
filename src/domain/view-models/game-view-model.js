import { effectList, firstOf, outcomeTags, shareSummaryText, topDeltaPills } from './helpers.js';
import { orderCardsForLifeState } from '../game-branching.js';
import {
  LIFE_STATE_LABELS,
  stateAlerts,
  summarizeFinalRoute,
} from '../life-state.js';

const tendencyDescription = (style) => ({
  bold: '更想往前抢，能担风险换机会',
  steady: '更想稳着推进，攒下可持续的盘面',
  repair: '更想先收口，把卡点和损耗处理掉',
}[style] || '还没明显倾向，多走两手再看');

// 「今日」已彻底归入底部导航的今日主页，游戏只承载需要坐下来想的长尺度关卡，
// 不再有 day 档（去重，见今日/游戏定位拆分）。
const SCOPE_TAB_LIST = [
  { id: 'month', label: '最近一月' },
  { id: 'year', label: '最近一年' },
  { id: 'decade', label: '最近十年' },
  { id: 'lifetime', label: '一生主线' },
];

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
  const awaitingAdvance = Number.isInteger(selectedIndex);
  const lockedCard = cards.find((item) => item.id === state.gameSession.gameCurrentCardId);
  const isMonthScope = scope === 'month';
  // 所有尺度（含月度）都按"已答卡"排除后续作，不再用会被切 tab 重置的线性 currentIndex，
  // 避免完成后从头重做、以及重复记录导致解读出现两遍。
  const pendingCards = isMonthScope
    ? cards.filter((item) => !completedIds.includes(item.id))
    : orderCardsForLifeState({
      cards,
      lifeState: state.gameSession.lifeState,
      routeStyle,
      completedIds,
    });
  const currentCard = (awaitingAdvance && lockedCard)
    ? lockedCard
    : (pendingCards[0] || cards[cards.length - 1] || null);
  const selectedChoice = Number.isInteger(selectedIndex) ? currentCard?.choices?.[selectedIndex] : null;
  const feedback = state.gameSession.gameFeedback;
  const lifeChange = state.gameSession.gameLifeChange;
  const logItems = state.gameSession.choices
    .filter((item) => item.scope !== 'day')
    .slice(-4)
    .reverse();
  const answeredCount = completedChoices.length;
  const finished = totalCards > 0 && answeredCount >= totalCards;
  // 完成且不在"刚答完"态（即重新进入已完成的尺度）：显示完成态，不再给可答选项。
  const completed = finished && !awaitingAdvance;
  const progressIndex = totalCards
    ? (finished ? totalCards : (awaitingAdvance ? answeredCount : Math.min(answeredCount + 1, totalCards)))
    : 0;
  const feedbackTags = outcomeTags({
    theme: currentCard?.theme,
    style: selectedChoice?.style || feedback?.style || 'steady',
    delta: lifeChange?.delta || {},
    scope,
  });
  const finalBaseSummary = finished
    ? summarizeFinalRoute(state.gameSession.lifeState)
    : null;
  const finalTags = finalBaseSummary ? outcomeTags({
    theme: currentCard?.theme,
    style: routeStyle,
    delta: state.gameSession.gameLifeChange?.delta || {},
    scope,
  }) : [];

  const archetypeName = lifeGame?.archetype?.name;
  const tendencyChoiceLabel = feedback?.choiceLabel || selectedChoice?.label || '';
  const progressTotal = Math.max(totalCards, 1);
  const progressDone = Number.isFinite(progressIndex)
    ? Math.max(progressIndex - 1, 0)
    : 0;
  const progressPercent = Math.min(100, Math.round((progressDone / progressTotal) * 100));
  const nextStepIndex = Math.min(progressIndex + 1, totalCards);
  const lifeStateEntries = Object.entries(state.gameSession.lifeState || {})
    .map(([key, value]) => ({ key, label: LIFE_STATE_LABELS[key] || key, value }));
  const glanceLine = lifeStateEntries.slice(0, 3)
    .map((item) => `${item.label} ${item.value}`)
    .join(' · ');
  const feedbackDeltaPills = lifeChange ? topDeltaPills(lifeChange.delta) : [];

  return {
    ready: Boolean(activeScope && currentCard),
    routeName: archetypeName || '人生主线',
    archetypeName: archetypeName || '',
    scope,
    scopeTitle: scopeLabel(scope),
    scopeTabs: SCOPE_TAB_LIST.map((item) => ({ ...item, active: item.id === scope })),
    headline: activeScope?.headline || lifeGame?.headline || '先完成当前关卡，再继续下一步。',
    tendency: tendencyDescription(routeStyle),
    progressLabel: `${Math.max(progressIndex, 1)} / ${progressTotal} 关`,
    progressPercent,
    nextStepLabel: `进入第 ${nextStepIndex} 关`,
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
    choices: currentCard?.choices || [],
    selectedIndex,
    lifeState: lifeStateEntries,
    glanceLine,
    stateAlerts: stateAlerts(state.gameSession.lifeState).slice(0, 2),
    feedback: feedback ? {
      headline: `你选了：${tendencyChoiceLabel || '这一手'}`,
      resultTags: feedbackTags,
      body: feedback.body,
      effects: effectList(feedback.effects),
      deltaPills: feedbackDeltaPills,
    } : null,
    canGoNext: awaitingAdvance && !finished,
    completed,
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
