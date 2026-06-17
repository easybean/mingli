export const LIFE_STATE_KEYS = [
  'pressure',
  'opportunity',
  'relationship',
  'stability',
  'resources',
  'wellbeing',
];

export const LIFE_STATE_LABELS = {
  pressure: '压力',
  opportunity: '机会',
  relationship: '关系',
  stability: '稳定',
  resources: '资源',
  wellbeing: '身心',
};

// 上升=对你不利的维度。只有压力是"升=坏"，其余 5 维都是"升=好"。
export const LIFE_STATE_RISE_IS_NEGATIVE = new Set(['pressure']);

export const lifeStateDeltaTone = (key, value) => {
  const numeric = Number(value);
  if (!numeric) return 'neutral';
  const riseIsNegative = LIFE_STATE_RISE_IS_NEGATIVE.has(key);
  const beneficial = riseIsNegative ? numeric < 0 : numeric > 0;
  return beneficial ? 'positive' : 'negative';
};

const BASE_STATE = {
  pressure: 50,
  opportunity: 50,
  relationship: 50,
  stability: 50,
  resources: 50,
  wellbeing: 50,
};

const STYLE_DELTAS = {
  bold: {
    pressure: 8,
    opportunity: 9,
    relationship: -2,
    stability: -3,
    resources: 2,
    wellbeing: -5,
  },
  steady: {
    pressure: -2,
    opportunity: 3,
    relationship: 3,
    stability: 8,
    resources: 3,
    wellbeing: 1,
  },
  repair: {
    pressure: -7,
    opportunity: -2,
    relationship: 6,
    stability: 4,
    resources: -1,
    wellbeing: 8,
  },
};

const THEME_NOTES = {
  career: '这类事业选择会更明显地影响机会和压力。',
  wealth: '这类财富选择会更明显地影响资源和稳定。',
  relationship: '这类关系选择会更明显地影响关系和压力。',
  health: '这类健康选择会更明显地影响身心和稳定。',
  mindset: '这类心态选择会更明显地影响压力和身心余量。',
  family: '这类家庭选择会更明显地影响关系和资源。',
  migration: '这类变化选择会更明显地影响机会和稳定。',
};

export const createInitialLifeState = () => ({ ...BASE_STATE });

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

const cleanDelta = (delta = {}) => LIFE_STATE_KEYS.reduce((next, key) => {
  next[key] = Number(delta[key] || 0);
  return next;
}, {});

export const deltaForChoice = (choice = {}) => {
  if (choice.stateEffects && Object.keys(choice.stateEffects).length) {
    return cleanDelta(choice.stateEffects);
  }
  return cleanDelta(STYLE_DELTAS[choice.style] || STYLE_DELTAS.steady);
};

export const applyLifeStateDelta = (lifeState, delta) => LIFE_STATE_KEYS.reduce((next, key) => {
  next[key] = clamp((lifeState?.[key] ?? BASE_STATE[key]) + (delta?.[key] || 0));
  return next;
}, {});

const topChanges = (delta, direction) => Object.entries(delta)
  .filter(([, value]) => (direction === 'up' ? value > 0 : value < 0))
  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  .slice(0, 2)
  .map(([key, value]) => ({
    key,
    label: LIFE_STATE_LABELS[key],
    value,
  }));

export const summarizeLifeStateChange = ({ before, after, delta, card, choice }) => {
  const ups = topChanges(delta, 'up');
  const downs = topChanges(delta, 'down');
  const upText = ups.length
    ? ups.map((item) => `${item.label}+${item.value}`).join('、')
    : '节奏保持稳定';
  const downText = downs.length
    ? downs.map((item) => `${item.label}${item.value}`).join('、')
    : '没有明显代价';

  return {
    title: '这次选择带来的生活变化',
    body: `你选择了“${choice?.label || '这一走法'}”，短期变化是 ${upText}；需要留意的是 ${downText}。${THEME_NOTES[card?.theme] || ''}`,
    positive: ups,
    cost: downs,
    before,
    after,
    delta,
  };
};

export const stateAlerts = (lifeState = {}) => {
  const alerts = [];
  if (lifeState.pressure >= 70) alerts.push('压力偏高，后续更容易出现恢复、边界或节奏问题。');
  if (lifeState.opportunity >= 70) alerts.push('机会正在升高，后续更容易出现曝光、承担或选择窗口。');
  if (lifeState.relationship <= 35) alerts.push('关系余量偏低，后续更容易出现沟通、信任或边界摩擦。');
  if (lifeState.stability <= 35) alerts.push('稳定性偏低，后续更容易出现计划打乱或反复调整。');
  if (lifeState.resources <= 35) alerts.push('资源偏紧，后续更容易出现取舍、预算或求助问题。');
  if (lifeState.wellbeing <= 35) alerts.push('身心余量偏低，后续更容易出现休息、恢复和体力分配问题。');
  return alerts;
};

export const strongestState = (lifeState = {}) => Object.entries(lifeState)
  .sort((a, b) => b[1] - a[1])[0];

export const weakestState = (lifeState = {}) => Object.entries(lifeState)
  .sort((a, b) => a[1] - b[1])[0];

export const summarizeFinalRoute = (lifeState = {}) => {
  const [strongKey, strongValue] = strongestState(lifeState) || ['stability', 50];
  const [weakKey, weakValue] = weakestState(lifeState) || ['pressure', 50];
  return {
    title: '当前生活路线总结',
    body: `这一路下来，${LIFE_STATE_LABELS[strongKey]}最强（${strongValue}），可以成为你的支点；${LIFE_STATE_LABELS[weakKey]}最低（${weakValue}），后续需要优先照看。`,
    strong: { key: strongKey, label: LIFE_STATE_LABELS[strongKey], value: strongValue },
    weak: { key: weakKey, label: LIFE_STATE_LABELS[weakKey], value: weakValue },
  };
};
