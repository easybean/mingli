import { firstOf } from './helpers.js';
import { pickTodayCard } from './today-focus.js';

export const createHomeViewModel = (state) => {
  const data = state.astrolabeData;
  if (!data) {
    return {
      mode: 'empty',
      hero: {
        kicker: 'Mingli',
        title: '开启你的今日人生关卡',
        subtitle: '用出生信息生成命盘，把今天、近期和人生主线变成可以选择的关卡。',
      },
      disclaimer: '这是倾向与选择模拟，不是绝对预言。',
    };
  }

  const dayScope = data.reading.lifeGame?.scopes?.day || {};
  const monthScope = data.reading.lifeGame?.scopes?.month || {};
  const lifetimeScope = data.reading.lifeGame?.scopes?.lifetime || data.reading.lifeGame || {};
  const todaySelection = pickTodayCard(dayScope, state.gameSession.todayFocusTheme);
  const todayCard = todaySelection.card;

  return {
    mode: 'ready',
    todayEntry: {
      title: '今天的关卡',
      scenario: firstOf(todayCard?.dramaticText, todayCard?.summary, dayScope.headline, '今天先完成一个选择。'),
      tags: [
        todayCard?.themeLabel,
        todayCard?.title,
        dayScope.focusLabel,
      ].filter(Boolean).slice(0, 3),
    },
    quickEntries: [
      {
        id: 'month',
        title: '最近一月',
        subtitle: monthScope.focusLabel || monthScope.scopeSummary || '看眼前节奏',
      },
      {
        id: 'lifetime',
        title: '人生主线',
        subtitle: lifetimeScope.scopeSummary || '看长期路线',
      },
    ],
    identityTags: [
      data.reading.lifeGame?.archetype?.name,
      `当前 ${data.horoscope.currentAge} 岁`,
      data.reading.topics?.[0]?.title?.replace('主线', ''),
    ].filter(Boolean),
    todayFocusOptions: todaySelection.options,
    disclaimer: data.reading.lifeGame?.disclaimer || data.reading.disclaimer,
  };
};
