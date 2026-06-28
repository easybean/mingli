import { firstOf } from './helpers.js';
import { pickTodayCard, dayIndexFromDate } from './today-focus.js';

export const createHomeViewModel = (state) => {
  const data = state.astrolabeData;
  if (!data) {
    return {
      mode: 'empty',
      hero: {
        kicker: 'MINGLI · 命理',
        title: '开启你的今日人生关卡',
        subtitle: '用出生信息生成命盘，把今天、近期和人生主线变成可以选择的关卡。',
      },
      disclaimer: '这是倾向与选择模拟，不是绝对预言。',
    };
  }

  const dayScope = data.reading.lifeGame?.scopes?.day || {};
  const monthScope = data.reading.lifeGame?.scopes?.month || {};
  const lifetimeScope = data.reading.lifeGame?.scopes?.lifetime || data.reading.lifeGame || {};
  const todaySelection = pickTodayCard(
    dayScope,
    state.gameSession.todayFocusTheme,
    dayIndexFromDate(data.input?.target),
  );
  const todayCard = todaySelection.card;
  const monthCards = monthScope.cards || [];
  const archetypeName = data.reading.lifeGame?.archetype?.name || '';
  const currentAge = data.horoscope?.currentAge;
  const stageLabel = lifetimeScope.stages?.[0]?.title || lifetimeScope.scopeSummary || '';

  return {
    mode: 'ready',
    identity: {
      archetype: archetypeName,
      age: Number.isFinite(currentAge) ? `${currentAge}岁` : '',
      currentTheme: todayCard?.themeLabel || '',
    },
    todayEntry: {
      themeLabel: todayCard?.themeLabel || '今日',
      kicker: todayCard?.themeLabel ? `今日主题 · ${todayCard.themeLabel}` : '今日主题',
      title: todayCard?.title || '今天先做这一题',
      scenario: firstOf(todayCard?.dramaticText, todayCard?.summary, dayScope.headline, '今天先完成一个选择。'),
    },
    quickEntries: [
      {
        id: 'month',
        label: '近一月',
        title: monthScope.focusLabel || monthScope.scopeSummary || '看眼前节奏',
        sub: monthCards.length ? `共 <strong>${monthCards.length}</strong> 关待走` : '看眼前节奏',
      },
      {
        id: 'lifetime',
        label: '一生主线',
        title: archetypeName ? `${archetypeName} · 当前走到这里` : '当前走到这里',
        sub: stageLabel ? `阶段 · ${stageLabel}` : '看长期路线',
      },
    ],
    disclaimer: data.reading.lifeGame?.disclaimer || data.reading.disclaimer,
  };
};
