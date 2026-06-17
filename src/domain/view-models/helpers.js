import { LIFE_STATE_LABELS, lifeStateDeltaTone } from '../life-state.js';

export const compactText = (value, fallback = '') => String(value || fallback || '').trim();

export const topDeltaPills = (delta = {}, count = 3) => Object.entries(delta)
  .filter(([, value]) => Number(value) !== 0)
  .sort((a, b) => Math.abs(Number(b[1])) - Math.abs(Number(a[1])))
  .slice(0, count)
  .map(([key, value]) => {
    const numeric = Number(value);
    const sign = numeric > 0 ? '+' : '−';
    const label = `${LIFE_STATE_LABELS[key] || key} ${sign}${Math.abs(numeric)}`;
    return { key, label, tone: lifeStateDeltaTone(key, numeric) };
  });

export const firstOf = (...values) => values.find((value) => compactText(value));

export const statLabel = (key) => ({
  resilience: '恢复力',
  agency: '主导力',
  stability: '稳定性',
  connection: '关系协作',
  mobility: '变化适应',
}[key] || key);

export const effectList = (effects = {}) => Object.entries(effects)
  .filter(([, value]) => Number(value) !== 0)
  .map(([key, value]) => `${statLabel(key)} ${Number(value) > 0 ? '+' : ''}${value}`);

export const lifeStateDeltaList = (delta = {}, labels = {}) => Object.entries(delta)
  .filter(([, value]) => Number(value) !== 0)
  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  .map(([key, value]) => `${labels[key] || key} ${Number(value) > 0 ? '+' : ''}${value}`);

const THEME_RESULT_LABELS = {
  career: {
    bold: '本局抢位',
    steady: '本局稳岗',
    repair: '本局保位',
  },
  wealth: {
    bold: '本局加仓',
    steady: '本局控仓',
    repair: '本局护本',
  },
  relationship: {
    bold: '本局摊牌',
    steady: '本局调频',
    repair: '本局止耗',
  },
  health: {
    bold: '本局硬顶',
    steady: '本局回补',
    repair: '本局修复',
  },
  mindset: {
    bold: '本局破心关',
    steady: '本局稳心态',
    repair: '本局降内耗',
  },
  family: {
    bold: '本局扛事',
    steady: '本局承接',
    repair: '本局留界',
  },
  migration: {
    bold: '本局换地图',
    steady: '本局双线试水',
    repair: '本局原地稳盘',
  },
};

const stateDrivenTag = (delta = {}) => {
  const entries = Object.entries(delta).sort((a, b) => Math.abs(Number(b[1] || 0)) - Math.abs(Number(a[1] || 0)));
  const [key, value] = entries[0] || [];
  if (!key || !Number(value)) return '';
  if (key === 'pressure' && value > 0) return '压力上行';
  if (key === 'pressure' && value < 0) return '压力回落';
  if (key === 'opportunity' && value > 0) return '机会抬头';
  if (key === 'relationship' && value > 0) return '关系回暖';
  if (key === 'relationship' && value < 0) return '边界摩擦';
  if (key === 'stability' && value > 0) return '稳定加固';
  if (key === 'stability' && value < 0) return '节奏波动';
  if (key === 'resources' && value > 0) return '资源增厚';
  if (key === 'resources' && value < 0) return '资源承压';
  if (key === 'wellbeing' && value > 0) return '状态回升';
  if (key === 'wellbeing' && value < 0) return '身心消耗';
  return '';
};

export const outcomeTags = ({ theme, style, delta = {}, scope = 'lifetime' }) => {
  const tags = [];
  const themeLabel = THEME_RESULT_LABELS[theme]?.[style];
  if (themeLabel) tags.push(themeLabel);
  const stateTag = stateDrivenTag(delta);
  if (stateTag && !tags.includes(stateTag)) {
    tags.push(stateTag);
  }
  if (scope === 'day') {
    tags.push(style === 'bold' ? '今日破局' : style === 'repair' ? '今日修复' : '今日稳盘');
  } else if (scope === 'month') {
    tags.push(style === 'bold' ? '本月起势' : style === 'repair' ? '本月收口' : '本月稳步推进');
  } else if (scope === 'year') {
    tags.push('年度节点');
  } else if (scope === 'decade') {
    tags.push('十年主线');
  } else {
    tags.push('人生主线');
  }
  return tags.filter(Boolean).slice(0, 3);
};

const THEME_NAME = {
  career: '事业',
  wealth: '财富',
  relationship: '关系',
  health: '健康',
  mindset: '心态',
  family: '家庭',
  migration: '迁移',
};

const scopeText = (scope) => ({
  day: '今天',
  month: '这个月',
  year: '这一年',
  decade: '这十年',
  lifetime: '这段人生主线',
}[scope] || '这段时间');

export const shareSummaryText = ({
  scope = 'lifetime',
  theme,
  title,
  tags = [],
  choiceLabel = '',
  lifeChange,
  finalSummary,
}) => {
  const lead = scopeText(scope);
  const themeLabel = THEME_NAME[theme] || '当前课题';
  const tagLine = tags.slice(0, 2).join(' / ');
  const nextHint = lifeChange?.positive?.[0]?.label || lifeChange?.cost?.[0]?.label || '';

  if (finalSummary) {
    return `${lead}我走出来的标签：${tagLine || '当前主线'}。${finalSummary.body}`;
  }

  const action = choiceLabel ? `我选了「${choiceLabel}」` : '我做了一个选择';
  const tagPart = tagLine ? `，结果偏向「${tagLine}」` : '';
  const tailPart = nextHint ? `，接下来先顾好${nextHint}` : '';
  return `${lead}面对「${themeLabel}·${title || '当前关卡'}」，${action}${tagPart}${tailPart}。`;
};
