const templateFile = require('./data/life-game-templates.json');

const THEME_LABELS = {
  career: '事业',
  wealth: '财运',
  relationship: '关系',
  health: '健康',
  mindset: '心性',
  family: '家庭',
  migration: '迁移',
};

const THEME_TOPIC_TITLES = {
  career: ['事业主线', '官禄', '迁移', '身宫'],
  wealth: ['财运主线', '财帛', '田宅'],
  relationship: ['婚恋主线', '夫妻', '父母'],
  health: ['健康主线', '疾厄', '福德'],
  mindset: ['心性主线', '命宫', '福德', '身宫'],
  family: ['父母', '田宅', '兄弟'],
  migration: ['迁移', '身宫'],
};

const ARCHETYPES = [
  {
    id: 'breaker',
    name: '破局者',
    test: ({ patterns, stats }) => stats.mobility >= 62 || hasPattern(patterns, ['杀破狼格', '火贪铃贪', '廉贞贪杀']),
    headline: '你的剧本重点不是守住旧地图，而是在变化里找到自己的主导权。',
  },
  {
    id: 'builder',
    name: '筑城者',
    test: ({ patterns, stats }) => stats.stability >= 62 || hasPattern(patterns, ['紫府朝垣格', '府相朝垣格', '财荫夹印格']),
    headline: '你的剧本重在把零散资源修成城墙，把阶段成果沉淀成长期底盘。',
  },
  {
    id: 'strategist',
    name: '策士',
    test: ({ patterns, stats }) => stats.agency >= 60 || hasPattern(patterns, ['机月同梁格', '昌曲拱命格', '文桂文华', '石中隐玉']),
    headline: '你的剧本靠判断、表达和策略开路，真正的胜负在于如何把想法落地。',
  },
  {
    id: 'healer',
    name: '修复者',
    test: ({ stats }) => stats.resilience >= 60,
    headline: '你的剧本会反复考验恢复力，你越懂得修复自己，越能改变后续关卡难度。',
  },
];

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const hasPattern = (patterns, names) => patterns.some((pattern) => names.includes(pattern.name));

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const textParts = (items) => items
  .flatMap((item) => Array.isArray(item) ? item : [item])
  .map((item) => String(item || '').trim())
  .filter(Boolean);

const buildSignalIndex = ({ reading, bazi, patterns, palaces }) => {
  const topics = reading.topics || [];
  const manual = reading.manual || [];
  const knowledgeHits = reading.knowledgeHits || [];
  const pillars = bazi.pillars || [];
  const daYun = bazi.luck?.daYun || [];

  const tokens = textParts([
    topics.flatMap((topic) => [
      topic.title,
      topic.focus,
      topic.takeaway,
      topic.summary,
      topic.cues,
      topic.drivers,
      topic.ziweiStructure,
      topic.baziStructure,
      (topic.patterns || []).map((pattern) => pattern.name),
    ]),
    manual.flatMap((chapter) => [
      chapter.title,
      chapter.subtitle,
      chapter.body,
      chapter.hooks,
      (chapter.patterns || []).map((pattern) => pattern.name),
      (chapter.knowledgeHits || []).map((hit) => hit.topic),
    ]),
    patterns.flatMap((pattern) => [
      pattern.name,
      pattern.verdict,
      pattern.summary,
      pattern.conditions,
      pattern.caveats,
      pattern.sources,
    ]),
    knowledgeHits.flatMap((hit) => [hit.topic, hit.summary, hit.source]),
    pillars.flatMap((pillar) => [
      pillar.ganShiShen,
      pillar.hiddenShiShen,
      pillar.ganWuXing,
      pillar.zhiWuXing,
    ]),
    daYun.flatMap((period) => [
      period.ganShiShen,
      period.hiddenShiShen,
      period.ganWuXing,
      period.zhiWuXing,
    ]),
    palaces.flatMap((palace) => [
      palace.name,
      palace.isBodyPalace ? '身宫' : '',
      palace.majorStars.map((star) => star.name),
      palace.minorStars.map((star) => star.name),
      palace.adjectiveStars.map((star) => star.name),
      palace.majorStars.concat(palace.minorStars, palace.adjectiveStars).map((star) => star.mutagen ? `${star.name}${star.mutagen}` : ''),
    ]),
  ]);

  const haystack = tokens.join(' ');
  return { tokens, haystack };
};

const triggerHits = (template, signalIndex) => (template.triggers || [])
  .filter((trigger) => signalIndex.haystack.includes(trigger));

const scoreTemplate = (template, context) => {
  const hits = triggerHits(template, context.signalIndex);
  const themeTopics = THEME_TOPIC_TITLES[template.theme] || [];
  const themeHits = themeTopics.filter((topic) => context.signalIndex.haystack.includes(topic));
  const patternHits = context.patterns.filter((pattern) => (template.triggers || []).includes(pattern.name));
  const verdictScore = patternHits.reduce((total, pattern) => {
    if (template.type === 'opportunity' && pattern.verdict === '吉') {
      return total + 4;
    }
    if (template.type === 'trial' && ['凶', '待辨'].includes(pattern.verdict)) {
      return total + 4;
    }
    return total + 1;
  }, 0);
  const riskBonus = template.type === 'trial' && /空|羊|陀|火|铃|忌|劫|偏印|劫财|七杀/.test(context.signalIndex.haystack) ? 2 : 0;
  const opportunityBonus = template.type === 'opportunity' && /禄|科|权|左辅|右弼|天魁|天钺|文昌|文曲|天府|太阴/.test(context.signalIndex.haystack) ? 2 : 0;

  return {
    template,
    score: (hits.length * 6) + (themeHits.length * 2) + verdictScore + riskBonus + opportunityBonus,
    hits: unique(hits.concat(themeHits, patternHits.map((pattern) => pattern.name))).slice(0, 6),
  };
};

const selectScored = (scored, { type, min, max, perThemeLimit }) => {
  const selected = [];
  const byTheme = {};
  const candidates = scored
    .filter((item) => item.template.type === type)
    .sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id));

  candidates.forEach((item) => {
    const theme = item.template.theme;
    byTheme[theme] = byTheme[theme] || 0;
    if (selected.length >= max || byTheme[theme] >= perThemeLimit) {
      return;
    }
    if (item.score <= 0 && selected.length >= min) {
      return;
    }
    selected.push(item);
    byTheme[theme] += 1;
  });

  candidates.forEach((item) => {
    if (selected.length >= min || selected.includes(item)) {
      return;
    }
    selected.push(item);
  });

  return selected.slice(0, max);
};

const applyChoiceDefaults = (choice) => ({
  label: choice.label,
  style: choice.style,
  description: choice.description,
  cost: choice.cost,
  reward: choice.reward,
  statEffects: choice.statEffects || {},
  feedback: choice.feedback,
});

const buildNode = (item, index) => {
  const template = item.template;
  const triggerSummary = item.hits.length
    ? `命中线索：${item.hits.join('、')}。`
    : `来自${THEME_LABELS[template.theme] || template.theme}主题的基础人生课题。`;

  return {
    id: template.id,
    type: template.type,
    theme: template.theme,
    themeLabel: THEME_LABELS[template.theme] || template.theme,
    title: template.title,
    tone: template.tone,
    rank: index + 1,
    score: item.score,
    triggerSummary,
    summary: template.summary,
    dramaticText: template.dramaticText,
    choices: template.choices.map(applyChoiceDefaults),
  };
};

const buildStats = ({ trials, opportunities, patterns }) => {
  const base = {
    resilience: 50,
    agency: 50,
    stability: 50,
    connection: 50,
    mobility: 50,
  };

  patterns.forEach((pattern) => {
    if (pattern.verdict === '吉') {
      base.agency += 2;
      base.stability += 2;
    }
    if (pattern.verdict === '凶') {
      base.resilience += 4;
      base.stability -= 2;
    }
    if (pattern.verdict === '待辨') {
      base.mobility += 3;
      base.resilience += 1;
    }
  });

  trials.concat(opportunities).forEach((node) => {
    node.choices.forEach((choice) => {
      Object.entries(choice.statEffects || {}).forEach(([key, value]) => {
        if (base[key] !== undefined && value > 0) {
          base[key] += 0.4;
        }
      });
    });
  });

  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, Math.round(clamp(value))]));
};

const chooseArchetype = ({ patterns, stats }) => (
  ARCHETYPES.find((item) => item.test({ patterns, stats })) || {
    id: 'traveler',
    name: '行路者',
    headline: '你的剧本不是单一路线，而是在多次选择里慢慢形成自己的道路。',
  }
);

const stageThemeFromPeriod = (period, index) => {
  const god = `${period.ganShiShen || ''}${(period.hiddenShiShen || []).join('')}`;
  if (/正官|七杀/.test(god)) {
    return ['事业压力测试', '用规则、责任和边界承接阶段挑战'];
  }
  if (/正财|偏财/.test(god)) {
    return ['资源整合关', '先看现金流和留存，再谈扩张'];
  }
  if (/食神|伤官/.test(god)) {
    return ['表达变现关', '把想法、技能和作品推到现实场景里'];
  }
  if (/正印|偏印/.test(god)) {
    return ['恢复学习关', '适合补系统、修状态、重建支持网络'];
  }
  if (/比肩|劫财/.test(god)) {
    return ['同盟边界关', '处理竞争、合作、分账与自我位置'];
  }
  return [
    ['探索开局关', '先扩大经验，再确认方向'],
    ['承压升级关', '把压力转成可执行的秩序'],
    ['沉淀根基关', '把阶段成果变成稳定底盘'],
    ['重整地图关', '重新校准关系、资源和自我叙事'],
    ['传承收束关', '减少无效消耗，留下真正重要的结构'],
  ][index % 5];
};

const buildStages = (bazi, cards) => (bazi.luck?.daYun || []).slice(0, 5).map((period, index) => {
  const [title, strategy] = stageThemeFromPeriod(period, index);
  const relatedCards = cards
    .filter((card) => {
      if (index % 2 === 0) {
        return ['career', 'wealth', 'mindset'].includes(card.theme);
      }
      return ['relationship', 'health', 'migration'].includes(card.theme);
    })
    .slice(0, 2);

  return {
    id: `stage-${index + 1}`,
    level: index + 1,
    title,
    ageRange: `${period.startAge}-${period.endAge}岁`,
    yearRange: `${period.startYear}-${period.endYear}`,
    ganZhi: period.ganZhi,
    triggerSummary: `${period.ganZhi}大运，天干十神${period.ganShiShen || '-'}，阶段只提示课题倾向，不对应具体事件。`,
    possibleThemes: relatedCards.map((card) => card.title),
    strategy,
  };
});

const buildLifeGame = ({ reading, bazi, palaces, patterns }) => {
  const signalIndex = buildSignalIndex({ reading, bazi, patterns, palaces });
  const context = { reading, bazi, palaces, patterns, signalIndex };
  const scored = templateFile.templates.map((template) => scoreTemplate(template, context));
  const trials = selectScored(scored, { type: 'trial', min: 3, max: 7, perThemeLimit: 2 }).map(buildNode);
  const opportunities = selectScored(scored, { type: 'opportunity', min: 2, max: 5, perThemeLimit: 2 }).map(buildNode);
  const cards = trials.concat(opportunities).map((card, index) => ({ ...card, cardNo: index + 1 }));
  const stats = buildStats({ trials, opportunities, patterns });
  const archetype = chooseArchetype({ patterns, stats });
  const stages = buildStages(bazi, cards);

  return {
    headline: archetype.headline,
    archetype: {
      id: archetype.id,
      name: archetype.name,
    },
    stats,
    trials,
    opportunities,
    stages,
    cards,
    disclaimer: '人生游戏是基于命盘结构生成的倾向与选择模拟，不是具体事件预言，也不替代现实中的医疗、法律、投资或关系决策。',
  };
};

module.exports = {
  buildLifeGame,
};
