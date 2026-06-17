import { LIFE_STATE_LABELS } from '../life-state.js';
import { effectList, firstOf, lifeStateDeltaList, outcomeTags, shareSummaryText, topDeltaPills } from './helpers.js';
import { focusFallbackHint, pickTodayCard } from './today-focus.js';

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const dateLabel = (raw) => {
  const ymd = (raw || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return '今天';
  const [y, m, d] = ymd.split('-').map(Number);
  const weekday = WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()] || '';
  return `${m}月${d}日${weekday ? ` ${weekday}` : ''}`;
};

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
  const tagsForResult = feedback ? outcomeTags({
    theme: card?.theme,
    style: selectedChoice?.style || feedback.style || 'steady',
    delta: lifeChange?.delta || {},
    scope: 'day',
  }) : [];

  return {
    ready: true,
    title: '今天先做这一题',
    helpOpen: Boolean(state.ui.todayHelpOpen),
    help: {
      title: '这一页是怎么来的',
      intro: '今天的题不是随机抽的：它由你的命盘主线、当前流日和你刚才点选的关注主题一起决定。',
      sections: [
        {
          title: '题目怎么来',
          body: '系统综合你的命盘主题权重、命中的格局、当前大运和流日，挑出今天最先浮出来的一类课题。你点选关注的主题只是告诉系统更想先看哪块；命盘当天信号更强时，仍会优先显示更强的那题。',
        },
        {
          title: '选项怎么读',
          body: '每个选项都是一个具体动作，不是态度。代价和收益写在卡片底栏，选完后还会显示这次选择带来的生活状态变化。',
        },
        {
          title: '做完之后',
          body: '今天的选择会算进你的生活状态里，影响后面"最近一月""人生主线"出现的题目语气。明天回来会按新的流日重新出一题。',
        },
      ],
    },
    dayLabel: dateLabel(data.input?.target),
    progressLabel: dayScope.focusLabel || '',
    hook: themeLabel,
    themeLabel,
    card,
    scenario: firstOf(card?.dramaticText, card?.summary, dayScope.headline, '今天会出现一个小选择，先想清楚你最想守住的那一块再动。'),
    situationLine: card?.situation || '',
    conflictLine: card?.conflict || '',
    question: '你打算怎么走？',
    triggerSummary: card?.triggerSummary || dayScope.focusLabel || '',
    focusOptions: todaySelection.options,
    focusHint: focusFallbackHint(todaySelection),
    choices: card?.choices || [],
    selectedIndex,
    feedback: feedback ? {
      headline: `你选了：${feedback.choiceLabel || selectedChoice?.label || '这一手'}`,
      resultTags: tagsForResult,
      deltaPills: lifeChange ? topDeltaPills(lifeChange.delta) : [],
      shareSummary: shareSummaryText({
        scope: 'day',
        theme: card?.theme,
        title: card?.title,
        choiceLabel: feedback.choiceLabel || selectedChoice?.label || '',
        tags: tagsForResult,
        lifeChange,
      }),
      body: feedback.body,
      effects: effectList(feedback.effects),
      lifeChange: lifeChange ? {
        title: lifeChange.title,
        body: lifeChange.body,
        deltas: lifeStateDeltaList(lifeChange.delta, LIFE_STATE_LABELS),
      } : null,
      tomorrowHint: '明天再来，会按新的流日重新出一题。',
    } : null,
    nextActions: [
      { label: '看最近一月', page: 'game', scope: 'month' },
      { label: '进入人生主线', page: 'game', scope: 'lifetime' },
    ],
  };
};
