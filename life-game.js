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
  family: ['父母', '田宅', '兄弟', '子女'],
  migration: ['迁移', '身宫'],
};

const THEME_PRIMARY_TOPIC = {
  career: '事业主线',
  wealth: '财运主线',
  relationship: '婚恋主线',
  health: '健康主线',
  mindset: '心性主线',
  family: '父母',
  migration: '迁移',
};

const THEME_RELATED_PALACES = {
  career: ['官禄', '迁移', '命宫', '身宫', '仆役'],
  wealth: ['财帛', '田宅', '福德', '命宫'],
  relationship: ['夫妻', '父母', '子女', '福德', '迁移'],
  health: ['疾厄', '福德', '父母', '田宅'],
  mindset: ['命宫', '福德', '身宫', '迁移'],
  family: ['父母', '田宅', '兄弟', '子女'],
  migration: ['迁移', '身宫', '官禄'],
};

const OPPORTUNITY_SIGNAL_THEMES = {
  career: ['紫府朝垣格', '府相朝垣格', '三奇嘉会', '天乙拱命', '左右扶命格', '天魁', '天钺', '官禄'],
  wealth: ['财荫夹印格', '昌曲拱命格', '文桂文华', '天府', '太阴', '食神', '伤官', '田宅'],
  relationship: ['月朗天门', '日月照壁', '左右扶命格', '天乙拱命', '太阴', '天同'],
  health: ['正印', '偏印', '福德', '天乙拱命'],
  mindset: ['月生沧海', '石中隐玉', '命无正曜格', '福德', '文昌', '文曲'],
  family: ['财荫夹印格', '田宅', '太阴', '天府'],
  migration: ['禄马交驰格', '迁移', '七杀', '破军'],
};

const RISK_SIGNALS = new Set([
  '空',
  '羊',
  '陀',
  '火',
  '铃',
  '忌',
  '劫',
  '偏印',
  '劫财',
  '七杀',
  '破军',
  '火贪铃贪',
  '廉贞贪杀',
  '刑忌夹印',
  '月同遇煞',
  '日月反背',
  '命无正曜格',
  '马落空亡格',
]);

const ARCHETYPES = [
  {
    id: 'breaker',
    name: '破局者',
    headline: '你的剧本重点不是守住旧地图，而是在变化里找到自己的主导权。',
    statWeights: { mobility: 0.45, agency: 0.25, resilience: 0.1, stability: -0.05 },
    signals: ['杀破狼格', '火贪铃贪', '廉贞贪杀', '破军', '七杀', '迁移'],
  },
  {
    id: 'builder',
    name: '筑城者',
    headline: '你的剧本重在把零散资源修成城墙，把阶段成果沉淀成长期底盘。',
    statWeights: { stability: 0.45, connection: 0.1, agency: 0.1, mobility: -0.05 },
    signals: ['紫府朝垣格', '府相朝垣格', '财荫夹印格', '天府', '天相', '田宅'],
  },
  {
    id: 'strategist',
    name: '策士',
    headline: '你的剧本靠判断、表达和策略开路，真正的胜负在于如何把想法落地。',
    statWeights: { agency: 0.35, mobility: 0.1, connection: 0.05 },
    signals: ['机月同梁格', '昌曲拱命格', '文桂文华', '石中隐玉', '食神', '伤官', '文昌', '文曲'],
  },
  {
    id: 'healer',
    name: '修复者',
    headline: '你的剧本会反复考验恢复力，你越懂得修复自己，越能改变后续关卡难度。',
    statWeights: { resilience: 0.45, connection: 0.1, stability: 0.05 },
    signals: ['正印', '偏印', '福德', '天乙拱命', '天同', '太阴'],
  },
];

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const uniqueBy = (items, iteratee) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = iteratee(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const plainManualTitle = (title) => String(title || '').replace(/^第\d+章：/, '');

const addCount = (map, key, increment = 1) => {
  if (!key) {
    return;
  }
  map.set(key, (map.get(key) || 0) + increment);
};

const addManyCounts = (map, values, increment = 1) => {
  values.filter(Boolean).forEach((value) => addCount(map, value, increment));
};

const addToSetMap = (map, key, values) => {
  if (!key) {
    return;
  }
  if (!map.has(key)) {
    map.set(key, new Set());
  }
  const bucket = map.get(key);
  values.filter(Boolean).forEach((value) => bucket.add(value));
};

const mapToObject = (map) => Object.fromEntries(Array.from(map.entries()).map(([key, value]) => [key, value]));

const hasPattern = (patterns, names) => patterns.some((pattern) => names.includes(pattern.name));

const buildSignalIndex = ({ reading, bazi, patterns, palaces }) => {
  const topics = reading.topics || [];
  const manual = reading.manual || [];
  const knowledgeHits = reading.knowledgeHits || [];
  const pillars = bazi.pillars || [];
  const daYun = bazi.luck?.daYun || [];

  const topicTitles = new Set();
  const topicTextMap = new Map();
  const topicPatternMap = new Map();
  const topicSignalMap = new Map();
  const themeTopicSignals = new Map();
  const manualTitles = new Set();
  const manualTextMap = new Map();
  const patternNames = new Set();
  const patternVerdicts = new Map();
  const knowledgeTopics = new Set();
  const natalGodCounts = new Map();
  const daYunGodCounts = new Map();
  const starToPalaces = new Map();
  const palaceSignalMap = new Map();
  const mutagenSignals = new Set();
  const bodyPalaces = new Set();
  const allSignals = new Set();

  topics.forEach((topic) => {
    topicTitles.add(topic.title);
    const topicSignals = unique([
      topic.title,
      topic.focus,
      topic.takeaway,
      ...(topic.cues || []),
      ...(topic.drivers || []),
      ...(topic.ziweiStructure || []),
      ...(topic.baziStructure || []),
      ...(topic.patterns || []).map((pattern) => pattern.name),
    ]);
    topicTextMap.set(topic.title, topicSignals.join(' '));
    topicPatternMap.set(topic.title, new Set((topic.patterns || []).map((pattern) => pattern.name)));
    topicSignalMap.set(topic.title, new Set(topicSignals));
    addToSetMap(themeTopicSignals, topic.title, topicSignals);
    topicSignals.forEach((signal) => allSignals.add(signal));
  });

  manual.forEach((chapter) => {
    const title = plainManualTitle(chapter.title);
    const chapterSignals = unique([
      title,
      chapter.subtitle,
      chapter.body,
      ...(chapter.hooks || []),
      ...(chapter.patterns || []).map((pattern) => pattern.name),
      ...(chapter.knowledgeHits || []).map((hit) => hit.topic),
    ]);
    manualTitles.add(title);
    manualTextMap.set(title, chapterSignals.join(' '));
    addToSetMap(themeTopicSignals, title, chapterSignals);
    chapterSignals.forEach((signal) => allSignals.add(signal));
  });

  patterns.forEach((pattern) => {
    patternNames.add(pattern.name);
    patternVerdicts.set(pattern.name, pattern.verdict);
    [pattern.name, pattern.summary, ...(pattern.conditions || []), ...(pattern.caveats || []), ...(pattern.sources || [])]
      .filter(Boolean)
      .forEach((signal) => allSignals.add(signal));
  });

  knowledgeHits.forEach((hit) => {
    [hit.topic, hit.summary, hit.source].filter(Boolean).forEach((signal) => {
      knowledgeTopics.add(signal);
      allSignals.add(signal);
    });
  });

  pillars.forEach((pillar) => {
    addCount(natalGodCounts, pillar.ganShiShen, 1);
    addManyCounts(natalGodCounts, pillar.hiddenShiShen || [], 1);
    [pillar.ganWuXing, pillar.zhiWuXing, pillar.ganShiShen, ...(pillar.hiddenShiShen || [])]
      .filter(Boolean)
      .forEach((signal) => allSignals.add(signal));
  });

  daYun.forEach((period) => {
    addCount(daYunGodCounts, period.ganShiShen, 1);
    addManyCounts(daYunGodCounts, period.hiddenShiShen || [], 1);
    [period.ganShiShen, ...(period.hiddenShiShen || []), period.ganWuXing, period.zhiWuXing]
      .filter(Boolean)
      .forEach((signal) => allSignals.add(signal));
  });

  palaces.forEach((palace) => {
    const palaceName = palace.isBodyPalace ? '身宫' : palace.name;
    const palaceSignals = unique([
      palaceName,
      ...palace.majorStars.map((star) => star.name),
      ...palace.minorStars.map((star) => star.name),
      ...palace.adjectiveStars.map((star) => star.name),
      ...palace.majorStars
        .concat(palace.minorStars, palace.adjectiveStars)
        .filter((star) => star.mutagen)
        .map((star) => `${star.name}${star.mutagen}`),
    ]);

    palaceSignalMap.set(palaceName, new Set(palaceSignals));
    if (palace.isBodyPalace) {
      bodyPalaces.add(palace.name);
      bodyPalaces.add('身宫');
    }
    palaceSignals.forEach((signal) => allSignals.add(signal));

    palace.majorStars
      .concat(palace.minorStars, palace.adjectiveStars)
      .forEach((star) => {
        addToSetMap(starToPalaces, star.name, [palaceName]);
        if (star.mutagen) {
          mutagenSignals.add(`${star.name}${star.mutagen}`);
        }
      });
  });

  const haystack = Array.from(allSignals).join(' ');

  return {
    topicTitles,
    topicTextMap,
    topicPatternMap,
    topicSignalMap,
    themeTopicSignals,
    manualTitles,
    manualTextMap,
    patternNames,
    patternVerdicts,
    knowledgeTopics,
    natalGodCounts,
    daYunGodCounts,
    starToPalaces,
    palaceSignalMap,
    mutagenSignals,
    bodyPalaces,
    allSignals,
    haystack,
  };
};

const relatedPalacesForTheme = (theme) => THEME_RELATED_PALACES[theme] || [];

const mainTopicForTheme = (theme) => THEME_PRIMARY_TOPIC[theme];

const themeSignalSet = (signalIndex, template) => {
  const values = new Set();
  const relatedTitles = unique([
    mainTopicForTheme(template.theme),
    ...(THEME_TOPIC_TITLES[template.theme] || []),
    ...relatedPalacesForTheme(template.theme),
  ]);

  relatedTitles.forEach((title) => {
    if (signalIndex.topicSignalMap.has(title)) {
      signalIndex.topicSignalMap.get(title).forEach((value) => values.add(value));
    }
    if (signalIndex.manualTextMap.has(title)) {
      values.add(signalIndex.manualTextMap.get(title));
    }
  });

  return values;
};

const matchTrigger = (trigger, template, signalIndex) => {
  const relatedPalaces = relatedPalacesForTheme(template.theme);
  const mainTopic = mainTopicForTheme(template.theme);
  const result = {
    trigger,
    type: 'text',
    score: 0,
    matchedPalaces: [],
  };

  if (signalIndex.patternNames.has(trigger)) {
    result.type = 'pattern';
    result.score = 14;
    const verdict = signalIndex.patternVerdicts.get(trigger);
    if (template.type === 'opportunity' && verdict === '吉') {
      result.score += 4;
    } else if (template.type === 'trial' && ['凶', '待辨'].includes(verdict)) {
      result.score += 4;
    } else {
      result.score += 1;
    }
    return result;
  }

  if (signalIndex.natalGodCounts.has(trigger)) {
    result.type = 'bazi';
    result.score = 9 + Math.min(signalIndex.natalGodCounts.get(trigger) - 1, 2);
    return result;
  }

  if (signalIndex.mutagenSignals.has(trigger)) {
    result.type = 'mutagen';
    result.score = 9;
    return result;
  }

  if (signalIndex.starToPalaces.has(trigger)) {
    const matchedPalaces = Array.from(signalIndex.starToPalaces.get(trigger));
    const relevantMatches = matchedPalaces.filter((palace) => relatedPalaces.includes(palace));
    result.type = 'star';
    result.matchedPalaces = matchedPalaces;
    result.score = relevantMatches.length ? 10 + (relevantMatches.length * 2) : 6;
    if (matchedPalaces.some((palace) => signalIndex.bodyPalaces.has(palace)) && relatedPalaces.includes('身宫')) {
      result.score += 2;
    }
    return result;
  }

  if (signalIndex.topicTitles.has(trigger)) {
    result.type = 'topic';
    result.score = trigger === mainTopic ? 11 : 7;
    return result;
  }

  if (signalIndex.knowledgeTopics.has(trigger)) {
    result.type = 'knowledge';
    result.score = 6;
    return result;
  }

  if (signalIndex.manualTitles.has(trigger)) {
    result.type = 'manual';
    result.score = relatedPalaces.includes(trigger) ? 2 : 1;
    return result;
  }

  if (signalIndex.haystack.includes(trigger)) {
    result.type = 'text';
    result.score = 2;
    return result;
  }

  return null;
};

const scoreTemplate = (template, context) => {
  const matchedSignals = (template.triggers || [])
    .map((trigger) => matchTrigger(trigger, template, context.signalIndex))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.trigger.localeCompare(b.trigger));

  const strongSignals = matchedSignals.filter((signal) => !['manual', 'text'].includes(signal.type));
  const exactPatterns = strongSignals.filter((signal) => signal.type === 'pattern').length;
  const relatedSignalPool = themeSignalSet(context.signalIndex, template);
  const themeAlignedSignals = matchedSignals.filter((signal) => relatedSignalPool.has(signal.trigger)).length;
  const opportunitySignals = matchedSignals.filter((signal) => (
    template.type === 'opportunity'
    && (OPPORTUNITY_SIGNAL_THEMES[template.theme] || []).includes(signal.trigger)
  )).length;
  const riskSignals = matchedSignals.filter((signal) => (
    template.type === 'trial'
    && Array.from(RISK_SIGNALS).some((risk) => signal.trigger.includes(risk))
  )).length;

  let score = matchedSignals.reduce((total, signal) => total + signal.score, 0);
  score += themeAlignedSignals * 2;
  score += exactPatterns * 3;
  score += opportunitySignals * 3;
  score += riskSignals * 3;

  if (template.type === 'opportunity' && strongSignals.length < 2) {
    score -= 8;
  }
  if (template.type === 'trial' && strongSignals.length < 2) {
    score -= 4;
  }
  if (strongSignals.length >= 3) {
    score += 4;
  }

  return {
    template,
    score,
    strongHitCount: strongSignals.length,
    hits: unique(strongSignals.concat(matchedSignals).map((signal) => signal.trigger)).slice(0, 6),
    matchedSignals,
  };
};

const selectScored = (scored, { type, min, max, target = max, perThemeLimit, minScore }) => {
  const selected = [];
  const byTheme = {};
  const candidates = scored
    .filter((item) => item.template.type === type)
    .sort((a, b) => (
      b.score - a.score
      || b.strongHitCount - a.strongHitCount
      || a.template.id.localeCompare(b.template.id)
    ));

  candidates.forEach((item) => {
    const theme = item.template.theme;
    byTheme[theme] = byTheme[theme] || 0;
    if (selected.length >= max || byTheme[theme] >= perThemeLimit) {
      return;
    }
    if (item.strongHitCount < 2 && selected.length >= min) {
      return;
    }
    if (item.score < minScore && selected.length >= min) {
      return;
    }
    selected.push(item);
    byTheme[theme] += 1;
  });

  candidates.forEach((item) => {
    const theme = item.template.theme;
    byTheme[theme] = byTheme[theme] || 0;
    if (selected.length >= min || selected.includes(item) || byTheme[theme] >= perThemeLimit) {
      return;
    }
    if (item.strongHitCount === 0) {
      return;
    }
    selected.push(item);
    byTheme[theme] += 1;
  });

  candidates.forEach((item) => {
    const theme = item.template.theme;
    byTheme[theme] = byTheme[theme] || 0;
    if (selected.length >= target || selected.includes(item)) {
      return;
    }
    if (item.strongHitCount < 2 || item.score < Math.max(10, minScore - 6)) {
      return;
    }
    if (byTheme[theme] >= (perThemeLimit + 1)) {
      return;
    }
    selected.push(item);
    byTheme[theme] += 1;
  });

  return selected.slice(0, max);
};

const refineOpportunitySelection = (selected, scored) => {
  const selectedIds = new Set(selected.map((item) => item.template.id));
  const candidateById = new Map(scored
    .filter((item) => item.template.type === 'opportunity')
    .map((item) => [item.template.id, item]));

  const replacementRules = [
    { id: 'opportunity-migration', minScore: 32, replaceIds: ['opportunity-noble-help', 'opportunity-platform-upgrade'] },
    { id: 'opportunity-relationship-growth', minScore: 34, replaceIds: ['opportunity-noble-help', 'opportunity-platform-upgrade'] },
    { id: 'opportunity-skill-output', minScore: 34, replaceIds: ['opportunity-noble-help', 'opportunity-platform-upgrade'] },
  ];

  replacementRules.forEach((rule) => {
    if (selectedIds.has(rule.id)) {
      return;
    }
    const candidate = candidateById.get(rule.id);
    if (!candidate || candidate.score < rule.minScore || candidate.strongHitCount < 3) {
      return;
    }

    const replaceIndex = selected.findIndex((item) => (
      rule.replaceIds.includes(item.template.id)
      && item.score <= candidate.score + 8
    ));

    if (replaceIndex === -1) {
      return;
    }

    selectedIds.delete(selected[replaceIndex].template.id);
    selected[replaceIndex] = candidate;
    selectedIds.add(candidate.template.id);
  });

  return selected
    .sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id));
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
    strongHitCount: item.strongHitCount,
    matchedSignals: item.hits,
    triggerSummary,
    summary: template.summary,
    dramaticText: template.dramaticText,
    choices: template.choices.map(applyChoiceDefaults),
  };
};

const scoreFromPatterns = (patterns, names, multiplier = 1) => patterns
  .filter((pattern) => names.includes(pattern.name))
  .reduce((total, pattern) => total + (pattern.verdict === '吉' ? 3 : pattern.verdict === '凶' ? 2 : 1), 0) * multiplier;

const getGodCount = (signalIndex, names) => names.reduce((total, name) => total + (signalIndex.natalGodCounts.get(name) || 0), 0);

const hasStarInPalace = (signalIndex, palace, stars) => {
  const bucket = signalIndex.palaceSignalMap.get(palace);
  if (!bucket) {
    return 0;
  }
  return stars.filter((star) => bucket.has(star)).length;
};

const buildStats = ({ signalIndex, patterns }) => {
  const stats = {
    resilience: 50,
    agency: 50,
    stability: 50,
    connection: 50,
    mobility: 50,
  };

  stats.resilience += (getGodCount(signalIndex, ['正印', '偏印']) * 3);
  stats.resilience += scoreFromPatterns(patterns, ['天乙拱命'], 2);
  stats.resilience -= scoreFromPatterns(patterns, ['火铃夹命格', '羊陀夹命格', '刑忌夹印', '月同遇煞'], 2);

  stats.agency += (getGodCount(signalIndex, ['七杀', '正官', '食神', '伤官']) * 2);
  stats.agency += scoreFromPatterns(patterns, ['杀破狼格', '紫府朝垣格', '府相朝垣格', '科名会禄'], 2);
  stats.agency += hasStarInPalace(signalIndex, '官禄', ['紫微', '武曲', '七杀', '廉贞']) * 2;

  stats.stability += scoreFromPatterns(patterns, ['紫府朝垣格', '府相朝垣格', '财荫夹印格'], 3);
  stats.stability += hasStarInPalace(signalIndex, '田宅', ['天府', '太阴', '天同']) * 3;
  stats.stability -= scoreFromPatterns(patterns, ['杀破狼格', '火贪铃贪', '命无正曜格', '马落空亡格'], 2);

  stats.connection += scoreFromPatterns(patterns, ['左右扶命格', '天乙拱命', '月朗天门', '日月照壁'], 2);
  stats.connection += getGodCount(signalIndex, ['正印']) * 1;
  stats.connection += hasStarInPalace(signalIndex, '夫妻', ['太阴', '天同', '天府']) * 2;
  stats.connection -= getGodCount(signalIndex, ['劫财']) * 1;
  stats.connection -= hasStarInPalace(signalIndex, '夫妻', ['巨门', '破军']) * 2;

  stats.mobility += scoreFromPatterns(patterns, ['杀破狼格', '火贪铃贪', '禄马交驰格', '马落空亡格'], 3);
  stats.mobility += getGodCount(signalIndex, ['七杀', '伤官']) * 1;
  stats.mobility += hasStarInPalace(signalIndex, '迁移', ['破军', '贪狼', '七杀', '天机']) * 3;
  stats.mobility -= scoreFromPatterns(patterns, ['紫府朝垣格', '府相朝垣格'], 1);

  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, Math.round(clamp(value))]),
  );
};

const chooseArchetype = ({ patterns, stats, signalIndex }) => {
  const scored = ARCHETYPES.map((item) => {
    const statScore = Object.entries(item.statWeights).reduce(
      (total, [key, weight]) => total + ((stats[key] || 0) * weight),
      0,
    );
    const signalScore = item.signals.reduce((total, signal) => {
      if (signalIndex.patternNames.has(signal)) {
        return total + 8;
      }
      if (signalIndex.natalGodCounts.has(signal)) {
        return total + (signalIndex.natalGodCounts.get(signal) * 4);
      }
      if (signalIndex.starToPalaces.has(signal)) {
        return total + 5;
      }
      if (signalIndex.topicTitles.has(signal) || signalIndex.manualTitles.has(signal)) {
        return total + 3;
      }
      if (signalIndex.haystack.includes(signal)) {
        return total + 1;
      }
      return total;
    }, 0);
    const verdictScore = patterns.reduce((total, pattern) => {
      if (!item.signals.includes(pattern.name)) {
        return total;
      }
      return total + (pattern.verdict === '吉' ? 2 : pattern.verdict === '待辨' ? 1 : 0);
    }, 0);

    return {
      ...item,
      score: statScore + signalScore + verdictScore,
    };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  return scored[0] || {
    id: 'traveler',
    name: '行路者',
    headline: '你的剧本不是单一路线，而是在多次选择里慢慢形成自己的道路。',
  };
};

const stageThemeFromPeriod = (period, index) => {
  const gods = [period.ganShiShen, ...(period.hiddenShiShen || [])].filter(Boolean);

  if (gods.some((god) => /正官|七杀/.test(god))) {
    return {
      title: '事业压力测试',
      strategy: '用规则、责任和边界承接阶段挑战',
      themes: ['career', 'mindset'],
    };
  }
  if (gods.some((god) => /正财|偏财/.test(god))) {
    return {
      title: '资源整合关',
      strategy: '先看现金流和留存，再谈扩张',
      themes: ['wealth', 'family'],
    };
  }
  if (gods.some((god) => /食神|伤官/.test(god))) {
    return {
      title: '表达变现关',
      strategy: '把想法、技能和作品推到现实场景里',
      themes: ['career', 'wealth'],
    };
  }
  if (gods.some((god) => /正印|偏印/.test(god))) {
    return {
      title: '恢复学习关',
      strategy: '适合补系统、修状态、重建支持网络',
      themes: ['health', 'mindset'],
    };
  }
  if (gods.some((god) => /比肩|劫财/.test(god))) {
    return {
      title: '同盟边界关',
      strategy: '处理竞争、合作、分账与自我位置',
      themes: ['relationship', 'wealth'],
    };
  }

  return {
    ...[
      { title: '探索开局关', strategy: '先扩大经验，再确认方向', themes: ['career', 'migration'] },
      { title: '承压升级关', strategy: '把压力转成可执行的秩序', themes: ['career', 'mindset'] },
      { title: '沉淀根基关', strategy: '把阶段成果变成稳定底盘', themes: ['wealth', 'family'] },
      { title: '重整地图关', strategy: '重新校准关系、资源和自我叙事', themes: ['relationship', 'mindset'] },
      { title: '传承收束关', strategy: '减少无效消耗，留下真正重要的结构', themes: ['family', 'health'] },
    ][index % 5],
  };
};

const pickGamePeriods = (bazi) => {
  const periods = (bazi.luck?.daYun || []).filter((period) => period && Number.isFinite(period.startAge));
  const picked = [];
  for (const period of periods) {
    picked.push(period);
    if ((period.endAge || 0) >= 87 || picked.length >= 8) {
      break;
    }
  }
  return picked.length ? picked : periods.slice(0, 8);
};

const buildStages = (periods, cards) => periods.map((period, index) => {
  const stageTheme = stageThemeFromPeriod(period, index);
  const periodSignals = new Set([period.ganShiShen, ...(period.hiddenShiShen || []), period.ganWuXing, period.zhiWuXing].filter(Boolean));
  const relatedCards = uniqueBy(cards
    .map((card) => {
      let score = 0;
      if (card.theme === stageTheme.themes[0]) {
        score += 6;
      } else if (card.theme === stageTheme.themes[1]) {
        score += 3;
      }
      if ((card.matchedSignals || []).some((signal) => periodSignals.has(signal))) {
        score += 4;
      }
      if (card.type === 'opportunity' && /正财|偏财|食神|正官/.test(period.ganShiShen || '')) {
        score += 1;
      }
      return { card, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.card.cardNo - b.card.cardNo)
    .map((item) => item.card), (card) => card.id)
    .slice(0, 2);

  return {
    id: `stage-${index + 1}`,
    level: index + 1,
    title: stageTheme.title,
    ageRange: `${period.startAge}-${period.endAge}岁`,
    yearRange: `${period.startYear}-${period.endYear}`,
    ganZhi: period.ganZhi,
    triggerSummary: `${period.ganZhi}大运，天干十神${period.ganShiShen || '-'}，当前阶段更偏向${stageTheme.themes.map((theme) => THEME_LABELS[theme]).join(' / ')}课题。`,
    possibleThemes: relatedCards.map((card) => card.title),
    strategy: stageTheme.strategy,
  };
});

const computeGameScale = ({ periods, patterns, signalIndex }) => {
  const periodCount = periods.length || 5;
  const patternRichness = patterns.length || 0;
  const natalSignalRichness = Array.from(signalIndex.natalGodCounts.values()).reduce((total, count) => total + Math.max(0, count - 1), 0);
  const positivePatternCount = patterns.filter((pattern) => pattern.verdict === '吉').length;
  const riskPatternCount = patterns.filter((pattern) => ['凶', '待辨'].includes(pattern.verdict)).length;
  const trialBonus = Math.min(4, Math.floor(patternRichness / 2)) + Math.min(2, Math.floor((riskPatternCount + natalSignalRichness) / 4));
  const opportunityBonus = Math.min(1, Math.floor(positivePatternCount / 3));

  const desiredTrials = Math.max(8, Math.min(14, periodCount + 1 + trialBonus));
  const desiredOpportunities = Math.max(3, Math.min(4, 3 + opportunityBonus));

  return {
    trialMin: Math.max(5, Math.min(desiredTrials, periodCount + 2)),
    trialTarget: desiredTrials,
    trialMax: desiredTrials,
    opportunityMin: 3,
    opportunityTarget: desiredOpportunities,
    opportunityMax: desiredOpportunities,
    trialThemeLimit: 3,
    opportunityThemeLimit: 1,
  };
};

const buildLifeGame = ({ reading, bazi, palaces, patterns }) => {
  const signalIndex = buildSignalIndex({ reading, bazi, patterns, palaces });
  const context = { reading, bazi, palaces, patterns, signalIndex };
  const periods = pickGamePeriods(bazi);
  const scale = computeGameScale({ periods, patterns, signalIndex });
  const scored = templateFile.templates.map((template) => scoreTemplate(template, context));
  const trials = selectScored(scored, {
    type: 'trial',
    min: scale.trialMin,
    max: scale.trialMax,
    target: scale.trialTarget,
    perThemeLimit: scale.trialThemeLimit,
    minScore: 16,
  }).map(buildNode);
  const opportunities = refineOpportunitySelection(selectScored(scored, {
    type: 'opportunity',
    min: scale.opportunityMin,
    max: scale.opportunityMax,
    target: scale.opportunityTarget,
    perThemeLimit: scale.opportunityThemeLimit,
    minScore: 18,
  }), scored).map(buildNode);
  const cards = trials.concat(opportunities).map((card, index) => ({ ...card, cardNo: index + 1 }));
  const stats = buildStats({ signalIndex, patterns });
  const archetype = chooseArchetype({ patterns, stats, signalIndex });
  const stages = buildStages(periods, cards);

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
    scale: {
      stages: stages.length,
      cards: cards.length,
    },
    disclaimer: '人生游戏是基于命盘结构生成的倾向与选择模拟，不是具体事件预言，也不替代现实中的医疗、法律、投资或关系决策。',
  };
};

module.exports = {
  buildLifeGame,
};
