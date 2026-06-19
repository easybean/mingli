import { LIFE_STATE_KEYS, LIFE_STATE_LABELS, lifeStateDeltaTone } from '../life-state.js';

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

// 把一组选择的 lifeState 变化累加，翻成"这组选择把你往哪带"的具体描述（不贴"主动/稳健路线"标签）。
const describeTendency = (choices) => {
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

  // 行动倾向：按 style 多数派给一句具体话，不用路线标签。
  const styleCounts = choices.reduce((acc, item) => {
    const style = item.style || 'steady';
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {});
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];
  const leanText = topStyle && topStyle[1] >= Math.ceil(choices.length / 2)
    ? `这几次你更偏向${STYLE_LEAN[topStyle[0]] || '稳着来'}`
    : '你在推进和稳住之间来回权衡';

  const gainText = gains.length
    ? `整体把你往${gains.slice(0, 2).map((g) => g.label).join('、')}上推`
    : '整体节奏保持平稳';
  const costText = costs.length
    ? `，代价主要落在${costs.slice(0, 2).map((c) => c.label).join('、')}`
    : '，暂时没有明显代价';

  return {
    sentence: `${leanText}：${gainText}${costText}。`,
    pills: gains.slice(0, 2).concat(costs.slice(0, 2)).map((item) => ({
      label: item.label,
      value: item.value,
      tone: lifeStateDeltaTone(item.key, item.value),
    })),
  };
};

const buildChoiceReading = (state) => {
  const choices = state.gameSession?.choices || [];
  if (!choices.length) {
    return {
      hasAny: false,
      emptyText: '你还没在关卡里做选择。去「今日」或「游戏」里走几关，这里会按你的选择解读你的倾向——和下面的命盘依据分开看。',
      scopes: [],
    };
  }
  const byScope = SCOPE_ORDER
    .map((id) => ({ id, label: SCOPE_LABELS[id], items: choices.filter((item) => item.scope === id) }))
    .filter((group) => group.items.length)
    .map((group) => {
      const tendency = describeTendency(group.items);
      return {
        id: group.id,
        label: group.label,
        count: group.items.length,
        tendency: tendency.sentence,
        pills: tendency.pills,
        items: group.items.map((item) => ({ title: item.cardTitle, choice: item.choiceLabel })),
      };
    });
  return { hasAny: true, scopes: byScope };
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
    intro: '这里把两件事分开看：上半是你在关卡里的选择说明了什么，下半是命盘本身（八字 / 紫微）为什么给出这些题。',
    choiceReading: buildChoiceReading(state),
    sections,
  };
};
