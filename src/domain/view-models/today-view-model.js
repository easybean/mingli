import { LIFE_STATE_LABELS } from '../life-state.js';
import { choicePresentation } from './choice-presentation.js';
import { effectList, firstOf, lifeStateDeltaList, outcomeTags, routeHint, shareSummaryText } from './helpers.js';
import { focusFallbackHint, pickTodayCard } from './today-focus.js';

const themeScene = (themeLabel) => ({
  事业: '今天的关键不是做很多事，而是先判断哪一步最值得你投入。',
  财富: '今天容易出现一个“想要立刻处理”的资源选择，先看清代价再行动。',
  关系: '今天适合把话说清楚，但不必急着把所有情绪一次倒出来。',
  健康: '今天身体和节奏会提醒你：不是所有事情都值得硬撑。',
  心态: '今天会出现一个让你重新选择反应方式的瞬间。',
}[themeLabel] || '今天会出现一个小选择，它会影响你接下来一整天的节奏。');

export const createTodayViewModel = (state) => {
  const data = state.astrolabeData;
  if (!data) {
    return {
      ready: false,
      title: '今日关卡',
      emptyText: '先生成命盘，再开始今天的选择。',
    };
  }

  const dayScope = data.reading.lifeGame?.scopes?.day || {};
  const todaySelection = pickTodayCard(dayScope, state.gameSession.todayFocusTheme);
  const card = todaySelection.card;
  const selectedIndex = state.gameSession.todayChoiceIndex;
  const selectedChoice = Number.isInteger(selectedIndex) ? card?.choices?.[selectedIndex] : null;
  const feedback = state.gameSession.todayFeedback;
  const lifeChange = state.gameSession.todayLifeChange;
  const themeLabel = card?.themeLabel || '今日';
  const choiceModels = (card?.choices || []).map((choice, index) => ({
    ...choice,
    index,
    presentation: choicePresentation(choice, { theme: card?.theme }),
  }));

  return {
    ready: true,
    title: '今天只做一个选择',
    helpOpen: Boolean(state.ui.todayHelpOpen),
    help: {
      title: '今日关卡说明',
      intro: '今日关卡不是随机测试题，而是把你的命盘主线、当前目标时间和近期节奏压缩成“今天最值得先处理的一题”。',
      sections: [
        {
          title: '为什么会有今日关卡',
          body: '很多人先关心的不是一生怎么走，而是今天这一步先顾哪边。今日关卡就是把长期命理结构收束成一个当天可执行的小决策入口。',
        },
        {
          title: '题目怎么来的',
          body: '系统会综合你的命盘主题权重、已命中的格局与专题、大运阶段、当前目标时间，再从今日题库里挑出今天最先浮出来的一类课题。你手动点选事业、财富、关系、健康、心态，是在告诉系统你今天更想先看哪块；但最终显示的题目，仍会优先服从命盘当天更强的信号。',
        },
        {
          title: '这一页能帮你做什么',
          body: '它不会替你预言具体事件，而是把今天更适合的走法拆成几种选择，让你看到每条路线的大致代价、收益和生活状态变化。',
        },
        {
          title: '你能得到什么',
          body: '做完这一题后，你会得到一条更清楚的今日建议：现在更适合主动推进、稳住节奏，还是先修复卡点；同时这些选择也会继续影响后面的月度和人生主线关卡。',
        },
      ],
    },
    progressLabel: dayScope.focusLabel || '今日关卡',
    dayLabel: data.input?.target?.slice(0, 10) || '今天',
    hook: `${themeLabel} · 今日关卡`,
    themeLabel,
    card,
    scenario: firstOf(card?.dramaticText, themeScene(themeLabel), card?.summary, dayScope.headline),
    sceneNote: themeScene(themeLabel),
    question: '这一题，你选哪条走法？',
    triggerSummary: card?.triggerSummary || dayScope.focusLabel || '',
    focusOptions: todaySelection.options,
    focusHint: focusFallbackHint(todaySelection),
    choices: choiceModels,
    selectedIndex,
    feedback: feedback ? {
      title: '今日路线已确定',
      routeLabel: selectedChoice ? choicePresentation(selectedChoice, { theme: card?.theme }).actionLabel : feedback.title,
      resultTags: outcomeTags({
        theme: card?.theme,
        style: selectedChoice?.style || 'steady',
        delta: lifeChange?.delta || {},
        scope: 'day',
      }),
      shareSummary: shareSummaryText({
        scope: 'day',
        theme: card?.theme,
        title: card?.title,
        routeLabel: selectedChoice ? choicePresentation(selectedChoice, { theme: card?.theme }).actionLabel : feedback.title,
        tags: outcomeTags({
          theme: card?.theme,
          style: selectedChoice?.style || 'steady',
          delta: lifeChange?.delta || {},
          scope: 'day',
        }),
        lifeChange,
      }),
      body: [
        feedback.body,
        routeHint(selectedChoice?.style),
      ].filter(Boolean).join(' '),
      effects: effectList(feedback.effects),
      lifeChange: lifeChange ? {
        title: lifeChange.title,
        body: lifeChange.body,
        deltas: lifeStateDeltaList(lifeChange.delta, LIFE_STATE_LABELS),
      } : null,
      tomorrowHint: '明天再来，会根据新的流日重新生成一题。',
    } : null,
    nextActions: [
      { label: '看最近一月', page: 'game', scope: 'month' },
      { label: '进入人生主线', page: 'game', scope: 'lifetime' },
    ],
  };
};
