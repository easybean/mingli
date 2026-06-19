import { LIFE_STATE_KEYS, LIFE_STATE_LABELS, lifeStateDeltaTone, stateAlerts } from '../life-state.js';

const SCOPE_LABELS = {
  day: '今日',
  month: '最近一月',
  year: '最近一年',
  decade: '最近十年',
  lifetime: '一生主线',
};
const SCOPE_ORDER = ['day', 'month', 'year', 'decade', 'lifetime'];

const STYLE_LEAN = {
  bold: '直接推进',
  steady: '稳着来',
  repair: '先修边界与关系',
};

// 把一组选择的 lifeState 变化累加，拆出"往哪推 / 代价在哪 / 行动倾向"三段，供逐尺度与综合复用。
const analyzeChoices = (choices) => {
  const agg = LIFE_STATE_KEYS.reduce((acc, key) => {
    acc[key] = choices.reduce((sum, item) => sum + (item.lifeChange?.delta?.[key] || 0), 0);
    return acc;
  }, {});
  const gains = [];
  const costs = [];
  LIFE_STATE_KEYS.forEach((key) => {
    const value = agg[key];
    if (!value) return;
    const entry = { key, label: LIFE_STATE_LABELS[key], value };
    if (lifeStateDeltaTone(key, value) === 'positive') gains.push(entry);
    else costs.push(entry);
  });
  gains.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  costs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const styleCounts = choices.reduce((acc, item) => {
    const style = item.style || 'steady';
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {});
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];
  const lean = topStyle && topStyle[1] >= Math.ceil(choices.length / 2)
    ? `更偏向${STYLE_LEAN[topStyle[0]] || '稳着来'}`
    : '在推进和稳住之间来回权衡';

  const gainText = gains.length ? `往${gains.slice(0, 2).map((g) => g.label).join('、')}上推` : '节奏保持平稳';
  const costText = costs.length ? `代价主要落在${costs.slice(0, 2).map((c) => c.label).join('、')}` : '暂时没有明显代价';
  const pills = gains.slice(0, 2).concat(costs.slice(0, 2)).map((item) => ({
    label: item.label,
    value: item.value,
    tone: lifeStateDeltaTone(item.key, item.value),
  }));
  return { lean, gainText, costText, pills };
};

const scopeTendencySentence = (choices) => {
  const a = analyzeChoices(choices);
  return `这几次你${a.lean}：整体把你${a.gainText}，${a.costText}。`;
};

// 综合解读：把所有尺度的选择合起来 + 当前 lifeState 现状（压力按"升=坏"单独处理）。
const buildOverall = (choices, lifeState = {}) => {
  const a = analyzeChoices(choices);
  const positive = LIFE_STATE_KEYS
    .filter((key) => key !== 'pressure')
    .map((key) => ({ key, label: LIFE_STATE_LABELS[key], value: Number(lifeState[key] ?? 50) }))
    .sort((x, y) => y.value - x.value);
  const strong = positive[0];
  const weak = positive[positive.length - 1];
  const pressure = Number(lifeState.pressure ?? 50);
  const pressureClause = pressure >= 65
    ? `；同时压力已经偏高（${pressure}），别再硬叠`
    : (pressure <= 40 ? `；压力还算宽松（${pressure}），有余地推进` : '');

  const body = `综合这 ${choices.length} 个选择，你整体${a.lean}，把生活${a.gainText}，${a.costText}。`
    + `走到现在，${strong.label}最足（${strong.value}），可以当支点；${weak.label}偏紧（${weak.value}），需要优先照看${pressureClause}。`;

  return {
    count: choices.length,
    body,
    pills: a.pills,
    alerts: stateAlerts(lifeState),
  };
};

const buildChoiceReading = (state) => {
  const choices = state.gameSession?.choices || [];
  if (!choices.length) {
    return {
      hasAny: false,
      emptyText: '你还没在关卡里做选择。去「今日」或「游戏」里走几关，这里会按你的选择给出综合解读和分尺度解读——和下面的命盘依据分开看。',
      overall: null,
      scopes: [],
    };
  }
  const overall = buildOverall(choices, state.gameSession?.lifeState || {});
  const byScope = SCOPE_ORDER
    .map((id) => ({ id, label: SCOPE_LABELS[id], items: choices.filter((item) => item.scope === id) }))
    .filter((group) => group.items.length)
    .map((group) => ({
      id: group.id,
      label: group.label,
      count: group.items.length,
      tendency: scopeTendencySentence(group.items),
      pills: analyzeChoices(group.items).pills,
      items: group.items.map((item) => ({ title: item.cardTitle, choice: item.choiceLabel })),
    }));
  return { hasAny: true, overall, scopes: byScope };
};

export const createReadingViewModel = (state) => {
  const data = state.astrolabeData;
  if (!data) {
    return { ready: false, sections: [] };
  }

  const sections = [
    {
      id: 'bazi',
      title: '八字基础',
      summary: data.reading.manual?.[0]?.body || data.reading.headline,
    },
    ...data.reading.topics.slice(0, 7).map((topic, index) => ({
      id: `topic-${index}`,
      title: topic.title,
      summary: topic.takeaway || topic.summary,
    })),
  ];

  return {
    ready: true,
    intro: '这里把两件事分开看：上半是你在关卡里的选择综合说明了什么，下半是命盘本身（八字 / 紫微）为什么给出这些题。',
    choiceReading: buildChoiceReading(state),
    sections,
  };
};
