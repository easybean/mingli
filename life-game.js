const templateFile = require('./data/life-game-templates.json');
const { tenGod } = require('./bazi-utils');

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

const SCOPE_META = {
  lifetime: {
    label: '一生',
    summary: '看长期课题、整个人生地图和会反复出现的试炼。',
  },
  decade: {
    label: '最近十年',
    summary: '看当前大运这十年的主战场，更适合判断近十年的主线和阶段打法。',
  },
  year: {
    label: '最近一年',
    summary: '看当前流年的主任务，适合判断今年该先处理什么。',
  },
  month: {
    label: '最近一月',
    summary: '看当前流月的小关卡，适合判断这个月先推进、观望还是修复。',
  },
  day: {
    label: '今日关卡',
    summary: '看当前流日的主线、阻力和行动建议，适合做每天复访入口。',
  },
};

const SHORT_HORIZON_TEMPLATES = [
  {
    id: 'year-career-window',
    type: 'opportunity',
    theme: 'career',
    title: '年度窗口推进',
    tone: 'focused',
    scopes: ['year'],
    triggers: ['事业主线', '官禄', '流年', '正官', '七杀', '科名会禄'],
    summary: '这一年更像把重要窗口推到眼前，重点不是改命，而是把握可执行的机会。',
    dramaticText: '门没有永远敞开。真正的问题是，你这一年是否愿意把重要动作往前排。',
    choices: [
      { label: '先推关键节点', style: 'bold', description: '把今年最关键的一步优先完成。', cost: '短期压力上升。', reward: '更容易形成年度突破。', statEffects: { agency: 6, stability: -2 }, feedback: '你把年度窗口顶到了前面，重点是别让执行散掉。' },
      { label: '按节奏推进', style: 'steady', description: '保留主线推进，但不把全部筹码压在一件事上。', cost: '年度声量增长较慢。', reward: '更容易把成果稳稳落袋。', statEffects: { stability: 5, agency: 3 }, feedback: '你让这一年维持可持续节奏，适合需要长期承接的结构。' },
      { label: '先修旧问题', style: 'repair', description: '优先处理拖延已久的卡点和结构性漏洞。', cost: '新动作会放慢。', reward: '减少后续复发。', statEffects: { resilience: 5, stability: 2 }, feedback: '你把年度任务先对准旧漏洞，这会让后半段轻很多。' },
    ],
  },
  {
    id: 'year-relationship-rebalance',
    type: 'trial',
    theme: 'relationship',
    title: '年度关系重排',
    tone: 'focused',
    scopes: ['year'],
    triggers: ['婚恋主线', '夫妻', '父母', '流年', '劫财', '巨门'],
    summary: '这一年更容易遇到关系秩序重排，重点在边界、投入和协作方式。',
    dramaticText: '关系不是突然变难，而是旧模式已经走到需要重写的时候。',
    choices: [
      { label: '直接谈清楚', style: 'bold', description: '把关键期待和边界一次说透。', cost: '短期摩擦会升温。', reward: '模糊关系会迅速变清晰。', statEffects: { connection: 4, agency: 4, resilience: -1 }, feedback: '你选择正面拆解关系结构，适合长期不想再拖。' },
      { label: '慢慢调位置', style: 'steady', description: '不硬碰，但逐步修正互动规则。', cost: '见效没有那么快。', reward: '更容易减少反复。', statEffects: { stability: 4, connection: 3 }, feedback: '你让关系慢慢回到更稳的位置，这条路更耐用。' },
      { label: '先减少消耗', style: 'repair', description: '先停掉最伤的互动模式。', cost: '可能会显得冷下来。', reward: '先把损耗降住。', statEffects: { resilience: 6, connection: 1 }, feedback: '你先处理关系漏损，这比继续硬撑更有效。' },
    ],
  },
  {
    id: 'month-urgent-priority',
    type: 'trial',
    theme: 'career',
    title: '月度优先级取舍',
    tone: 'tight',
    scopes: ['month'],
    triggers: ['流月', '官禄', '迁移', '食神', '伤官'],
    summary: '这个月最容易出问题的不是机会少，而是优先级乱。',
    dramaticText: '这一个月的难点不是做不做，而是先做哪一件，晚做哪一件。',
    choices: [
      { label: '先抢最关键的', style: 'bold', description: '优先处理影响最大的事项。', cost: '其他事情会被压后。', reward: '主线推进更明显。', statEffects: { agency: 5, stability: -2 }, feedback: '你把这个月的火力集中到最重要的节点。' },
      { label: '排出稳定节奏', style: 'steady', description: '按轻重缓急把月度动作铺开。', cost: '爆发感没那么强。', reward: '整体完成度更高。', statEffects: { stability: 5, agency: 2 }, feedback: '你把这个月做成了有秩序的推进局。' },
      { label: '砍掉干扰项', style: 'repair', description: '先清掉最耗神的杂事。', cost: '有些机会会顺延。', reward: '注意力回到主线。', statEffects: { resilience: 5, stability: 2 }, feedback: '你先腾出注意力，这会让月度主线更干净。' },
    ],
  },
  {
    id: 'month-recovery-window',
    type: 'opportunity',
    theme: 'health',
    title: '月度回补窗口',
    tone: 'tight',
    scopes: ['month'],
    triggers: ['流月', '健康主线', '福德', '正印', '偏印'],
    summary: '这个月更像一个可用的恢复窗口，重点是能不能真正回补，而不是继续透支。',
    dramaticText: '不是每个月都适合冲刺。有些月份的高价值动作，是把自己的节律救回来。',
    choices: [
      { label: '主动回补', style: 'bold', description: '直接抽时间做恢复动作。', cost: '当月推进速度会降一点。', reward: '后续耐力更足。', statEffects: { resilience: 7, agency: 1 }, feedback: '你把恢复本身当成当月主任务，这个判断通常不亏。' },
      { label: '边走边修', style: 'steady', description: '在不打乱主线的前提下修正节律。', cost: '恢复速度一般。', reward: '更容易长期坚持。', statEffects: { stability: 4, resilience: 4 }, feedback: '你选择小步修复，适合主线不能完全停下的月份。' },
      { label: '先止损', style: 'repair', description: '先暂停最消耗的安排。', cost: '短期看起来像退一步。', reward: '快速降低复发概率。', statEffects: { resilience: 6, connection: 1 }, feedback: '你先止住漏损，这会让接下来的月份轻很多。' },
    ],
  },
  {
    id: 'day-priority-push',
    type: 'trial',
    theme: 'career',
    title: '先做最重要的',
    tone: 'tight',
    scopes: ['day'],
    triggers: ['流日', '官禄', '迁移', '正官', '七杀'],
    summary: '今天更适合先把最重要的一件事推进，不要让杂事吃掉最清醒的时段。',
    dramaticText: '今天最怕的不是没事做，而是最关键的一步被杂音拖散。',
    choices: [
      { label: '先做主任务', style: 'bold', description: '先把最重要的一件做掉。', cost: '其他小事会往后放。', reward: '推进感最强。', statEffects: { agency: 5, stability: -1 }, feedback: '你把今天最该动的一步顶到了最前面。' },
      { label: '按顺序推进', style: 'steady', description: '按节奏一件件过。', cost: '爆发感一般。', reward: '整体更稳。', statEffects: { stability: 4, agency: 2 }, feedback: '你把今天做成了有秩序的一天。' },
      { label: '先清障碍', style: 'repair', description: '先把最卡的点拆掉。', cost: '主任务启动更慢。', reward: '后半段更顺。', statEffects: { resilience: 4, stability: 2 }, feedback: '你先把卡点拆掉，今天后半段会更顺。' },
    ],
  },
  {
    id: 'day-conversation-window',
    type: 'opportunity',
    theme: 'relationship',
    title: '有话今天讲清楚',
    tone: 'tight',
    scopes: ['day'],
    triggers: ['流日', '婚恋主线', '夫妻', '父母', '天同', '太阴'],
    summary: '今天适合做一次关键沟通，重点不是讲赢，而是把话讲清楚。',
    dramaticText: '有些话拖到明天就会变形。今天更适合把误解挡在形成之前。',
    choices: [
      { label: '直接说清楚', style: 'bold', description: '把关键点一次讲明。', cost: '短时情绪会上来。', reward: '问题更快变清楚。', statEffects: { connection: 5, agency: 2, resilience: -1 }, feedback: '你没有再绕着问题走，这会换来更快的清晰感。' },
      { label: '慢一点讲', style: 'steady', description: '先讲事实，再讲感受。', cost: '见效没那么快。', reward: '更少误解。', statEffects: { stability: 3, connection: 4 }, feedback: '你让今天的沟通留在可承接的范围里。' },
      { label: '先别急着回', style: 'repair', description: '先降温，再决定怎么说。', cost: '今天不一定立刻解决。', reward: '避免把小事说大。', statEffects: { resilience: 5, connection: 1 }, feedback: '你先保护了沟通质量，这通常比急着回应更划算。' },
    ],
  },
  {
    id: 'day-recovery-check',
    type: 'opportunity',
    theme: 'health',
    title: '今天先把状态拉回来',
    tone: 'tight',
    scopes: ['day'],
    triggers: ['流日', '健康主线', '福德', '正印', '偏印'],
    summary: '今天适合做一个小回补，把状态拉回到可持续的位置。',
    dramaticText: '不是所有恢复都要等长假。有些日子赢在先把自己拉回正轨。',
    choices: [
      { label: '现在就回补', style: 'bold', description: '立刻安排一个恢复动作。', cost: '手头推进会暂停一下。', reward: '后半程更稳。', statEffects: { resilience: 6, agency: 1 }, feedback: '你把恢复本身当成今天的正事。' },
      { label: '边走边调', style: 'steady', description: '不打断主线，慢慢调回来。', cost: '恢复速度普通。', reward: '更容易坚持。', statEffects: { stability: 3, resilience: 4 }, feedback: '你用可持续的方式把今天拉回正轨。' },
      { label: '先停最耗神的', style: 'repair', description: '先停掉最伤神的一件事。', cost: '短期像退一步。', reward: '损耗会明显下降。', statEffects: { resilience: 5, stability: 2 }, feedback: '你先止住了今天最明显的漏损。' },
    ],
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
const itemIncludesSignal = (matchedSignals, target) => matchedSignals.some((signal) => signal.trigger === target || signal.trigger.includes(target));
const templateAppliesToScope = (template, scope) => !template.scopes || template.scopes.includes(scope);

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
  if ((context.scopeProfile?.preferredThemes || []).includes(template.theme)) {
    score += 10;
  }
  if ((template.scopes || []).includes(context.scopeProfile?.id)) {
    score += 8;
  }
  const scopeSignalHits = (context.scopeProfile?.extraSignals || []).filter((signal) => itemIncludesSignal(matchedSignals, signal)).length;
  score += Math.min(12, scopeSignalHits * 4);
  if (context.scopeProfile?.id === 'year' && !(context.scopeProfile?.preferredThemes || []).includes(template.theme)) {
    score -= 4;
  }
  if (context.scopeProfile?.id === 'decade' && template.type === 'opportunity' && !(context.scopeProfile?.preferredThemes || []).includes(template.theme)) {
    score -= 2;
  }

  if (template.type === 'opportunity' && strongSignals.length < 2) {
    score -= 8;
  }
  if (template.type === 'trial' && strongSignals.length < 2) {
    score -= 4;
  }
  if (strongSignals.length >= 3) {
    score += 4;
  }

  const currentAge = Number(context.scopeProfile?.currentAge);
  if (Number.isFinite(currentAge) && currentAge <= 18) {
    if (['family', 'relationship', 'health', 'mindset'].includes(template.theme)) {
      score += 8;
    }
    if (template.id === 'opportunity-relationship-growth' || template.id === 'opportunity-noble-help' || template.id === 'opportunity-migration') {
      score += 8;
    }
    if (template.type === 'opportunity' && ['career', 'wealth'].includes(template.theme)) {
      score -= 10;
    }
    if (template.id === 'opportunity-platform-upgrade' || template.id === 'opportunity-asset-foundation' || template.id === 'opportunity-skill-output') {
      score -= 16;
    }
  } else if (Number.isFinite(currentAge) && currentAge <= 22) {
    if (['mindset', 'relationship', 'career'].includes(template.theme)) {
      score += 4;
    }
    if (template.type === 'opportunity' && template.id === 'opportunity-asset-foundation') {
      score -= 6;
    }
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

const buildTodayBrief = ({ cards, scopeProfile }) => {
  const main = cards[0];
  const risk = cards.find((card) => card.type === 'trial') || cards[0];
  const chance = cards.find((card) => card.type === 'opportunity') || cards[1] || cards[0];
  return {
    mainline: main ? main.title : '先把今天的主线看清楚',
    friction: risk ? risk.summary : '今天最大的阻力通常来自分心和节奏被打乱。',
    advice: chance ? `今天更适合：${chance.title}` : '今天更适合先做一件最重要的事。',
    focusLabel: scopeProfile.focusLabel,
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

const ageBandForPeriod = (period) => {
  const endAge = Number(period?.endAge || 0);
  if (endAge <= 13) {
    return 'child';
  }
  if (endAge <= 22) {
    return 'youth';
  }
  return 'adult';
};

const stageThemeFromPeriod = (period, index) => {
  const gods = [period.ganShiShen, ...(period.hiddenShiShen || [])].filter(Boolean);
  const ageBand = ageBandForPeriod(period);

  if (gods.some((god) => /正官|七杀/.test(god))) {
    if (ageBand === 'child') {
      return {
        title: '规则适应关',
        strategy: '先学会和规则、要求、长辈期待相处，不急着把压力解释成成败。',
        themes: ['mindset', 'family'],
      };
    }
    if (ageBand === 'youth') {
      return {
        title: '学业与规范关',
        strategy: '重点是适应标准、压力和节奏，学会把外部要求转成自己的执行力。',
        themes: ['career', 'mindset'],
      };
    }
    return {
      title: '事业压力测试',
      strategy: '用规则、责任和边界承接阶段挑战',
      themes: ['career', 'mindset'],
    };
  }
  if (gods.some((god) => /正财|偏财/.test(god))) {
    if (ageBand === 'child') {
      return {
        title: '家庭资源关',
        strategy: '更多是在家庭资源、照顾方式和安全感里学习现实感，而不是自己直接扛财务。',
        themes: ['family', 'wealth'],
      };
    }
    if (ageBand === 'youth') {
      return {
        title: '资源意识关',
        strategy: '开始建立对时间、金钱、选择成本的概念，重点是资源意识而不是收益最大化。',
        themes: ['wealth', 'family'],
      };
    }
    return {
      title: '资源整合关',
      strategy: '先看现金流和留存，再谈扩张',
      themes: ['wealth', 'family'],
    };
  }
  if (gods.some((god) => /食神|伤官/.test(god))) {
    if (ageBand === 'child') {
      return {
        title: '表达成形关',
        strategy: '重点是表达欲、兴趣和自我展示方式开始成形，不急着要求结果。',
        themes: ['mindset', 'career'],
      };
    }
    if (ageBand === 'youth') {
      return {
        title: '表达试探关',
        strategy: '适合探索表达、作品、兴趣和被看见的方式，重点是试错和找到手感。',
        themes: ['career', 'mindset'],
      };
    }
    return {
      title: '表达变现关',
      strategy: '把想法、技能和作品推到现实场景里',
      themes: ['career', 'wealth'],
    };
  }
  if (gods.some((god) => /正印|偏印/.test(god))) {
    if (ageBand === 'child') {
      return {
        title: '学习依附关',
        strategy: '重点在学习环境、支持系统和安全感来源，先看能不能被稳稳托住。',
        themes: ['health', 'mindset'],
      };
    }
    if (ageBand === 'youth') {
      return {
        title: '学习体系关',
        strategy: '适合建立方法、补基础、找老师和形成自己的学习节律。',
        themes: ['health', 'mindset'],
      };
    }
    return {
      title: '恢复学习关',
      strategy: '适合补系统、修状态、重建支持网络',
      themes: ['health', 'mindset'],
    };
  }
  if (gods.some((god) => /比肩|劫财/.test(god))) {
    if (ageBand === 'child') {
      return {
        title: '同伴边界关',
        strategy: '重点是学习跟同伴相处、分享、争执和自我位置，不必过早用竞争语言解释一切。',
        themes: ['relationship', 'mindset'],
      };
    }
    if (ageBand === 'youth') {
      return {
        title: '同伴定位关',
        strategy: '更像在同学、朋友、社群里确认自己的位置与边界，重点不是输赢，而是角色感。',
        themes: ['relationship', 'wealth'],
      };
    }
    return {
      title: '同盟边界关',
      strategy: '处理竞争、合作、分账与自我位置',
      themes: ['relationship', 'wealth'],
    };
  }

  return {
    ...[
      ageBand === 'child'
        ? { title: '成长开局关', strategy: '先积累体验、建立安全感和基本节律，不急着过早定义自己。', themes: ['mindset', 'family'] }
        : ageBand === 'youth'
          ? { title: '探索试路关', strategy: '先扩大经验，再慢慢确认自己的方向和边界。', themes: ['career', 'migration'] }
          : { title: '探索开局关', strategy: '先扩大经验，再确认方向', themes: ['career', 'migration'] },
      ageBand === 'child'
        ? { title: '环境适配关', strategy: '先适应环境和要求，重点是找到自己的节奏感。', themes: ['mindset', 'family'] }
        : ageBand === 'youth'
          ? { title: '承压成形关', strategy: '把外部要求转成自己的执行感，重点是形成基本能力框架。', themes: ['career', 'mindset'] }
          : { title: '承压升级关', strategy: '把压力转成可执行的秩序', themes: ['career', 'mindset'] },
      ageBand === 'child'
        ? { title: '根基培育关', strategy: '先在家庭、学习和日常节律里培养底盘。', themes: ['family', 'health'] }
        : ageBand === 'youth'
          ? { title: '底盘搭建关', strategy: '把早期能力、关系和资源慢慢搭成基本盘。', themes: ['wealth', 'family'] }
          : { title: '沉淀根基关', strategy: '把阶段成果变成稳定底盘', themes: ['wealth', 'family'] },
      ageBand === 'child'
        ? { title: '关系学习关', strategy: '先学会相处、分寸和表达，再慢慢形成自己的关系方式。', themes: ['relationship', 'mindset'] }
        : ageBand === 'youth'
          ? { title: '自我校准关', strategy: '重新校准关系、资源和自我叙事，慢慢把自己站稳。', themes: ['relationship', 'mindset'] }
          : { title: '重整地图关', strategy: '重新校准关系、资源和自我叙事', themes: ['relationship', 'mindset'] },
      ageBand === 'child'
        ? { title: '节律收束关', strategy: '减少无效消耗，把成长节律和安全感留住。', themes: ['health', 'family'] }
        : ageBand === 'youth'
          ? { title: '选择定型关', strategy: '开始让重要选择沉淀成更长期的方向感。', themes: ['family', 'health'] }
          : { title: '传承收束关', strategy: '减少无效消耗，留下真正重要的结构', themes: ['family', 'health'] },
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

const horoscopeGanZhi = (item) => `${item?.heavenlyStem || ''}${item?.earthlyBranch || ''}`;

const themesFromPalaceNames = (palaceNames = []) => {
  const themes = new Set();
  palaceNames.forEach((palace) => {
    Object.entries(THEME_RELATED_PALACES).forEach(([theme, palaces]) => {
      if (palaces.includes(palace)) {
        themes.add(theme);
      }
    });
  });
  return Array.from(themes);
};

const findCurrentDaYunPeriod = (bazi, horoscope) => {
  const currentAge = Number(horoscope?.currentAge);
  const periods = bazi.luck?.daYun || [];
  if (Number.isFinite(currentAge)) {
    const byAge = periods.find((period) => currentAge >= Number(period.startAge) && currentAge <= Number(period.endAge));
    if (byAge) {
      return byAge;
    }
  }

  const targetGanZhi = horoscopeGanZhi(horoscope?.decadal);
  return periods.find((period) => period.ganZhi === targetGanZhi)
    || periods[0]
    || null;
};

const buildDecadePeriods = (period, stageTheme) => {
  if (!period) {
    return [];
  }
  const span = Math.max(1, Number(period.endAge) - Number(period.startAge) + 1);
  const third = Math.max(2, Math.floor(span / 3));
  const startAge = Number(period.startAge);
  const endAge = Number(period.endAge);
  const startYear = Number(period.startYear);
  const endYear = Number(period.endYear);
  const buckets = [
    ['开局期', startAge, Math.min(endAge, startAge + third - 1)],
    ['承压期', Math.min(endAge, startAge + third), Math.min(endAge, startAge + (third * 2) - 1)],
    ['收束期', Math.min(endAge, startAge + (third * 2)), endAge],
  ].filter(([, left, right]) => left <= right);

  return buckets.map(([phase, leftAge, rightAge], index) => ({
    startAge: leftAge,
    endAge: rightAge,
    startYear: Math.min(endYear, startYear + (leftAge - startAge)),
    endYear: Math.min(endYear, startYear + (rightAge - startAge)),
    ganZhi: period.ganZhi,
    ganShiShen: period.ganShiShen,
    hiddenShiShen: period.hiddenShiShen || [],
    stageLabel: '大运',
    stagePhase: phase,
    stageTitleOverride: `${phase}${stageTheme ? ` · ${stageTheme.title}` : ''}`,
  }));
};

const buildYearPeriods = (yearly, dayStem) => {
  const yearGod = tenGod(dayStem, yearly?.heavenlyStem);
  const ganZhi = horoscopeGanZhi(yearly);
  const mutagen = yearly?.mutagen || [];
  const phases = [
    ['起势期', 1, 4],
    ['推进期', 5, 8],
    ['收束期', 9, 12],
  ];

  return phases.map(([phase, leftMonth, rightMonth]) => ({
    startAge: 23,
    endAge: 23,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    ganZhi,
    ganShiShen: yearGod,
    hiddenShiShen: mutagen,
    stageLabel: '流年',
    stagePhase: phase,
    stageTitleOverride: `${phase} · 年度小关卡`,
    monthRange: `${leftMonth}-${rightMonth}月`,
  }));
};

const buildMonthPeriods = (monthly, dayStem) => {
  const monthGod = tenGod(dayStem, monthly?.heavenlyStem);
  const ganZhi = horoscopeGanZhi(monthly);
  const mutagen = monthly?.mutagen || [];
  const phases = [
    ['上旬', '第1周'],
    ['中段', '第2-3周'],
    ['收束', '第4周'],
  ];

  return phases.map(([phase, range]) => ({
    startAge: 23,
    endAge: 23,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    ganZhi,
    ganShiShen: monthGod,
    hiddenShiShen: mutagen,
    stageLabel: '流月',
    stagePhase: phase,
    stageTitleOverride: `${phase} · 月度小关卡`,
    monthRange: range,
  }));
};

const buildDayPeriods = (daily, dayStem) => {
  const dayGod = tenGod(dayStem, daily?.heavenlyStem);
  const ganZhi = horoscopeGanZhi(daily);
  const mutagen = daily?.mutagen || [];
  const phases = [
    ['开场', '上午'],
    ['推进', '下午'],
    ['收束', '晚间'],
  ];

  return phases.map(([phase, range]) => ({
    startAge: 23,
    endAge: 23,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    ganZhi,
    ganShiShen: dayGod,
    hiddenShiShen: mutagen,
    stageLabel: '流日',
    stagePhase: phase,
    stageTitleOverride: `${phase} · 今日关卡`,
    monthRange: range,
  }));
};

const buildScopeProfile = ({ scope, bazi, horoscope }) => {
  if (scope === 'decade') {
    const period = findCurrentDaYunPeriod(bazi, horoscope);
    const stageTheme = period ? stageThemeFromPeriod(period, 0) : { themes: ['career', 'wealth'], title: '当前十年关卡' };
    const palaceThemes = themesFromPalaceNames(horoscope?.decadal?.palaceNames || []);
    return {
      id: 'decade',
      ...SCOPE_META.decade,
      currentAge: Number(horoscope?.currentAge),
      focusLabel: period ? `当前年龄 ${horoscope?.currentAge ?? '-'} 岁 · ${period.startAge}-${period.endAge}岁 · ${period.ganZhi}大运` : '当前大运',
      periods: buildDecadePeriods(period, stageTheme),
      preferredThemes: unique([...(stageTheme.themes || []), ...palaceThemes]).slice(0, 4),
      extraSignals: unique([
        period?.ganShiShen,
        ...(period?.hiddenShiShen || []),
        ...(horoscope?.decadal?.mutagen || []),
        ...(horoscope?.decadal?.palaceNames || []),
      ]),
    };
  }

  if (scope === 'year') {
    const yearGod = tenGod(bazi?.dayMaster?.stem, horoscope?.yearly?.heavenlyStem);
    const stageTheme = stageThemeFromPeriod({
      ganShiShen: yearGod,
      hiddenShiShen: horoscope?.yearly?.mutagen || [],
      endAge: Number(horoscope?.currentAge || 28),
    }, 0);
    const palaceThemes = themesFromPalaceNames(horoscope?.yearly?.palaceNames || []);
    return {
      id: 'year',
      ...SCOPE_META.year,
      currentAge: Number(horoscope?.currentAge),
      focusLabel: horoscope?.yearly ? `当前年龄 ${horoscope?.currentAge ?? '-'} 岁 · ${horoscope.yearly.heavenlyStem}${horoscope.yearly.earthlyBranch}流年` : '当前流年',
      periods: buildYearPeriods(horoscope?.yearly, bazi?.dayMaster?.stem),
      preferredThemes: unique([...(stageTheme.themes || []), ...palaceThemes]).slice(0, 4),
      extraSignals: unique([
        yearGod,
        ...(horoscope?.yearly?.mutagen || []),
        ...(horoscope?.yearly?.palaceNames || []),
      ]),
    };
  }

  if (scope === 'month') {
    const monthGod = tenGod(bazi?.dayMaster?.stem, horoscope?.monthly?.heavenlyStem);
    const stageTheme = stageThemeFromPeriod({
      ganShiShen: monthGod,
      hiddenShiShen: horoscope?.monthly?.mutagen || [],
      endAge: Number(horoscope?.currentAge || 28),
    }, 0);
    const palaceThemes = themesFromPalaceNames(horoscope?.monthly?.palaceNames || []);
    return {
      id: 'month',
      ...SCOPE_META.month,
      currentAge: Number(horoscope?.currentAge),
      focusLabel: horoscope?.monthly ? `当前年龄 ${horoscope?.currentAge ?? '-'} 岁 · ${horoscope.monthly.heavenlyStem}${horoscope.monthly.earthlyBranch}流月` : '当前流月',
      periods: buildMonthPeriods(horoscope?.monthly, bazi?.dayMaster?.stem),
      preferredThemes: unique([...(stageTheme.themes || []), ...palaceThemes]).slice(0, 3),
      extraSignals: unique([
        monthGod,
        ...(horoscope?.monthly?.mutagen || []),
        ...(horoscope?.monthly?.palaceNames || []),
      ]),
    };
  }

  if (scope === 'day') {
    const dayGod = tenGod(bazi?.dayMaster?.stem, horoscope?.daily?.heavenlyStem);
    const stageTheme = stageThemeFromPeriod({
      ganShiShen: dayGod,
      hiddenShiShen: horoscope?.daily?.mutagen || [],
      endAge: Number(horoscope?.currentAge || 28),
    }, 0);
    const palaceThemes = themesFromPalaceNames(horoscope?.daily?.palaceNames || []);
    return {
      id: 'day',
      ...SCOPE_META.day,
      currentAge: Number(horoscope?.currentAge),
      focusLabel: horoscope?.daily ? `当前年龄 ${horoscope?.currentAge ?? '-'} 岁 · ${horoscope.daily.heavenlyStem}${horoscope.daily.earthlyBranch}流日` : '今日流日',
      periods: buildDayPeriods(horoscope?.daily, bazi?.dayMaster?.stem),
      preferredThemes: unique([...(stageTheme.themes || []), ...palaceThemes]).slice(0, 3),
      extraSignals: unique([
        dayGod,
        ...(horoscope?.daily?.mutagen || []),
        ...(horoscope?.daily?.palaceNames || []),
      ]),
    };
  }

  return {
    id: 'lifetime',
    ...SCOPE_META.lifetime,
    currentAge: Number(horoscope?.currentAge),
    focusLabel: '整个人生时间轴',
    periods: pickGamePeriods(bazi),
    preferredThemes: [],
    extraSignals: [],
  };
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
    title: period.stageTitleOverride || stageTheme.title,
    ageRange: period.monthRange || `${period.startAge}-${period.endAge}岁`,
    yearRange: `${period.startYear}-${period.endYear}`,
    ganZhi: period.ganZhi,
    triggerSummary: `${period.ganZhi}${period.stageLabel || '大运'}，天干十神${period.ganShiShen || '-'}，当前阶段更偏向${stageTheme.themes.map((theme) => THEME_LABELS[theme]).join(' / ')}课题。`,
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

const scopeScaleOverrides = (scope, scale) => {
  if (scope === 'decade') {
    return {
      ...scale,
      trialMin: 4,
      trialTarget: 5,
      trialMax: 6,
      opportunityMin: 2,
      opportunityTarget: 3,
      opportunityMax: 3,
      trialThemeLimit: 2,
      opportunityThemeLimit: 1,
    };
  }
  if (scope === 'year') {
    return {
      ...scale,
      trialMin: 3,
      trialTarget: 4,
      trialMax: 4,
      opportunityMin: 2,
      opportunityTarget: 2,
      opportunityMax: 2,
      trialThemeLimit: 2,
      opportunityThemeLimit: 1,
    };
  }
  if (scope === 'month') {
    return {
      ...scale,
      trialMin: 2,
      trialTarget: 3,
      trialMax: 3,
      opportunityMin: 1,
      opportunityTarget: 2,
      opportunityMax: 2,
      trialThemeLimit: 1,
      opportunityThemeLimit: 1,
    };
  }
  if (scope === 'day') {
    return {
      ...scale,
      trialMin: 1,
      trialTarget: 1,
      trialMax: 1,
      opportunityMin: 1,
      opportunityTarget: 2,
      opportunityMax: 2,
      trialThemeLimit: 1,
      opportunityThemeLimit: 1,
    };
  }
  return scale;
};

const buildLifeGameScope = ({ scope = 'lifetime', reading, bazi, palaces, patterns, horoscope }) => {
  const signalIndex = buildSignalIndex({ reading, bazi, patterns, palaces });
  const scopeProfile = buildScopeProfile({ scope, bazi, horoscope });
  const context = { reading, bazi, palaces, patterns, signalIndex, scopeProfile };
  const periods = scopeProfile.periods;
  const scale = scopeScaleOverrides(scope, computeGameScale({ periods, patterns, signalIndex }));
  const templates = scope === 'day'
    ? SHORT_HORIZON_TEMPLATES.filter((template) => templateAppliesToScope(template, scope))
    : templateFile.templates
      .concat(scope === 'year' || scope === 'month' ? SHORT_HORIZON_TEMPLATES : [])
      .filter((template) => templateAppliesToScope(template, scope));
  const scored = templates.map((template) => scoreTemplate(template, context));
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
  const todayBrief = scope === 'day' ? buildTodayBrief({ cards, scopeProfile }) : null;

  return {
    scope,
    scopeLabel: scopeProfile.label,
    scopeSummary: scopeProfile.summary,
    focusLabel: scopeProfile.focusLabel,
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
    todayBrief,
    scale: {
      stages: stages.length,
      cards: cards.length,
    },
    disclaimer: '人生游戏是基于命盘结构生成的倾向与选择模拟，不是具体事件预言，也不替代现实中的医疗、法律、投资或关系决策。',
  };
};

const buildLifeGame = ({ reading, bazi, palaces, patterns, horoscope }) => {
  const lifetime = buildLifeGameScope({
    scope: 'lifetime',
    reading,
    bazi,
    palaces,
    patterns,
    horoscope,
  });
  const decade = buildLifeGameScope({
    scope: 'decade',
    reading,
    bazi,
    palaces,
    patterns,
    horoscope,
  });
  const year = buildLifeGameScope({
    scope: 'year',
    reading,
    bazi,
    palaces,
    patterns,
    horoscope,
  });
  const month = buildLifeGameScope({
    scope: 'month',
    reading,
    bazi,
    palaces,
    patterns,
    horoscope,
  });
  const day = buildLifeGameScope({
    scope: 'day',
    reading,
    bazi,
    palaces,
    patterns,
    horoscope,
  });

  return {
    ...lifetime,
    currentScope: 'lifetime',
    scopes: {
      lifetime,
      decade,
      year,
      month,
      day,
    },
  };
};

module.exports = {
  buildLifeGame,
};
