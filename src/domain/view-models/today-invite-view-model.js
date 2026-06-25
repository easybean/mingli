// 今日 → 游戏 的智能引流：根据用户最近选择攒出的 lifeState 与风格，
// 给一句"有据可依"的邀请，把人从今日的轻动作引到游戏的深度场。
// 纯前端、读 gameSession（choices 累积出的 lifeState / routeScores）。

import { LIFE_STATE_LABELS, LIFE_STATE_RISE_IS_NEGATIVE } from '../life-state.js';

// 某一维偏离基线时，用一句生活化的话描述"它怎么了"。
const CONCERN_PHRASE = {
  pressure: '压力一直在往上攒',
  opportunity: '机会这块有点闷、打不开',
  relationship: '和人的关系上有点磨',
  stability: '根基、稳定感有点晃',
  resources: '手头的资源和钱有点紧',
  wellbeing: '身心有点透支',
};

const STYLE_OBSERVE = {
  bold: '你这阵子一路往前冲',
  steady: '你这阵子稳着走',
  repair: '你这阵子总在收拾、往回收',
};

const CONCERN_THRESHOLD = 10; // 偏离基线多少才值得提（约 2 次同向选择）

export const createTodayInviteViewModel = (state) => {
  const lifeState = state.gameSession?.lifeState || {};
  const choices = state.gameSession?.choices || [];
  const routeScores = state.gameSession?.routeScores || {};

  // 找最该理的那一维：pressure 看超出基线多少，其余看低于基线多少。
  let topKey = null;
  let topSeverity = 0;
  Object.keys(LIFE_STATE_LABELS).forEach((key) => {
    const value = Number(lifeState[key] ?? 50);
    const severity = LIFE_STATE_RISE_IS_NEGATIVE.has(key) ? value - 50 : 50 - value;
    if (severity > topSeverity) {
      topSeverity = severity;
      topKey = key;
    }
  });

  // 主导风格：领先第二名 ≥2 才算"明显"。
  const sorted = Object.entries(routeScores).sort((a, b) => b[1] - a[1]);
  const dominantStyle = sorted[0] && sorted[0][1] > 0 && (sorted[0][1] - (sorted[1]?.[1] || 0)) >= 2
    ? sorted[0][0]
    : null;

  if (topKey && topSeverity >= CONCERN_THRESHOLD) {
    const observe = dominantStyle ? `${STYLE_OBSERVE[dominantStyle]}，` : '';
    return {
      lead: `${observe}最近你${CONCERN_PHRASE[topKey]}——要不要花十分钟，在「近一月」里把它理一理？`,
      scope: 'month',
    };
  }

  if (choices.length >= 3) {
    return {
      lead: '你最近走得挺稳——想往长线看看，进「一生主线」走一段？',
      scope: 'lifetime',
    };
  }

  return {
    lead: '最近有件事想认真理一理？进游戏走一关试试。',
    scope: 'month',
  };
};
