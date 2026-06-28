// 飞牌仪式 view model：决定今日是否要先走"7 张牌飞出一张"的仪式，以及各阶段要渲染什么。
// phase: sealed(摊开待翻) → revealed(飞出命盘选定那张, 接受/自选) → choosing(自己挑) → done(进入今日一题)。
// 一天一次：reveal.date 不是今天就当 sealed（新的一天自动重放）。

import { pickTodayCard, dayIndexFromDate } from './today-focus.js';
import { todayInputValue } from '../../adapters/web-time.js';

export const createTodayRevealViewModel = (state) => {
  const data = state.astrolabeData;
  const dayScope = data?.reading?.lifeGame?.scopes?.day || {};
  // focus 留空 → 命盘主卡；按当天日期轮换，和今日页主卡保持一致。
  const selection = pickTodayCard(dayScope, null, dayIndexFromDate(data?.input?.target));
  const picked = selection.card;

  const reveal = state.ui.reveal || {};
  const today = todayInputValue();
  const phase = reveal.date === today ? (reveal.phase || 'sealed') : 'sealed';

  const themes = selection.options.map((opt) => ({
    id: opt.id,
    label: opt.label,
    available: opt.available,
    isPicked: picked ? opt.id === picked.theme : false,
  }));

  return {
    // 没有今日卡（命盘今天没出题）就不走仪式，直接交给今日一题兜底。
    active: phase !== 'done' && Boolean(picked),
    phase,
    themes,
    pickedThemeLabel: picked?.themeLabel || '今日',
    pickedTitle: picked?.title || '今天的一题',
    pickedScenario: picked?.dramaticText || picked?.summary || '',
  };
};
