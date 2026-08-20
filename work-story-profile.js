// 工作岔路的命盘画像。
// 这是“命盘决定局”的服务端边界：前端只消费已归一化的标签、权重与可展开依据，
// 不需要也不应该自己解释原始八字/紫微字段。

const CAREER_PALACES = ['命宫', '身宫', '官禄', '财帛', '迁移', '福德'];
const POSITIVE_STARS = new Set(['紫微', '天府', '天相', '天梁', '武曲', '太阳', '太阴', '天魁', '天钺', '左辅', '右弼', '文昌', '文曲']);
const CHANGE_STARS = new Set(['七杀', '破军', '贪狼', '天机', '天马']);
const PRESSURE_STARS = new Set(['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '巨门']);
const clamp = (value) => Math.max(30, Math.min(70, Math.round(value)));

const starsOf = (palace) => [
  ...(palace?.majorStars || []),
  ...(palace?.minorStars || []),
  ...(palace?.adjectiveStars || []),
].map((star) => star.name).filter(Boolean);

const palaceAtFlow = (palaces, flow, flowingPalaceName) => {
  const index = (flow?.palaceNames || []).indexOf(flowingPalaceName);
  return index >= 0 ? palaces[index] : null;
};

const formatStars = (palace) => starsOf(palace).slice(0, 3).join('、') || '无主星信息';

const countGods = (bazi = {}) => {
  const counts = {};
  (bazi.pillars || []).forEach((pillar) => {
    [pillar.ganShiShen, ...(pillar.hiddenShiShen || [])].filter(Boolean).forEach((god) => {
      counts[god] = (counts[god] || 0) + 1;
    });
  });
  return counts;
};

const activeFlowEvidence = ({ palaces, horoscope, level, flowingPalaceName }) => {
  const flow = horoscope?.[level];
  const natalPalace = palaceAtFlow(palaces, flow, flowingPalaceName);
  if (!flow || !natalPalace) return null;
  return {
    level,
    flowingPalaceName,
    natalPalace: natalPalace.name,
    stars: starsOf(natalPalace),
    mutagen: flow.mutagen || [],
    label: `${level === 'decadal' ? '当前大运' : level === 'yearly' ? '当前流年' : '当前流月'}的${flowingPalaceName}落在本命${natalPalace.name}，触发${formatStars(natalPalace)}。`,
  };
};

const compactEvidence = (items) => items.filter(Boolean).slice(0, 3);

const deriveCurrentLuckGod = (bazi, horoscope) => {
  const targetYear = Number(String(horoscope?.target || '').slice(0, 4));
  const current = (bazi?.luck?.daYun || []).flatMap((item) => item.liuNian || [])
    .find((item) => item.year === targetYear);
  return current?.ganShiShen || '';
};

const deriveCurrentDaYunGod = (bazi, horoscope) => {
  const targetYear = Number(String(horoscope?.target || '').slice(0, 4));
  const period = (bazi?.luck?.daYun || []).find((item) => {
    const start = Number(item.startYear || item.year || 0);
    const end = Number(item.endYear || start + 9);
    return targetYear >= start && targetYear <= end;
  });
  return period?.ganShiShen || period?.zhiShiShen || '';
};

const buildWorkStoryProfile = ({ summary = {}, bazi = {}, palaces = [], horoscope = {}, patterns = [] }) => {
  const gods = countGods(bazi);
  const palaceMap = new Map(palaces.map((palace) => [palace.name, palace]));
  const bodyPalace = palaces.find((palace) => palace.isBodyPalace);
  const career = palaceMap.get('官禄');
  const wealth = palaceMap.get('财帛');
  const migration = palaceMap.get('迁移');
  const wellbeing = palaceMap.get('福德');
  const careerStars = [...starsOf(career), ...starsOf(bodyPalace), ...starsOf(palaceMap.get('命宫'))];
  const wealthStars = starsOf(wealth);
  const migrationStars = starsOf(migration);
  const wellbeingStars = starsOf(wellbeing);
  const tags = new Set(['work-story']);
  const weights = { safety: 0, opportunity: 0, recovery: 0, transition: 0, negotiation: 0 };
  const baziEvidence = [];
  const ziweiEvidence = [];
  const transitEvidence = [];

  const outputCount = (gods.食神 || 0) + (gods.伤官 || 0);
  const authorityCount = (gods.正官 || 0) + (gods.七杀 || 0);
  const resourceCount = (gods.正财 || 0) + (gods.偏财 || 0);
  const supportCount = (gods.正印 || 0) + (gods.偏印 || 0);
  const peerCount = (gods.比肩 || 0) + (gods.劫财 || 0);
  const luckGod = deriveCurrentLuckGod(bazi, horoscope);
  const daYunGod = deriveCurrentDaYunGod(bazi, horoscope);

  if (outputCount >= 2) {
    tags.add('bazi-output'); weights.opportunity += 2;
    baziEvidence.push({ key: 'bazi-output', label: `八字里食伤信号较集中，职业局更重“把能力做成可见产出”。` });
  }
  if (authorityCount >= 2) {
    tags.add('bazi-authority'); weights.negotiation += 2; weights.safety += 1;
    baziEvidence.push({ key: 'bazi-authority', label: '官杀信号较集中，职责、规则和权责匹配会成为这局的重点。' });
  }
  if (resourceCount >= 2) {
    tags.add('bazi-resource'); weights.safety += 2;
    baziEvidence.push({ key: 'bazi-resource', label: '财星信号较明显，这一轮会更在意现金余量和回报兑现。' });
  }
  if (supportCount >= 2) {
    tags.add('bazi-support'); weights.recovery += 2;
    baziEvidence.push({ key: 'bazi-support', label: '印星信号较明显，先补知识、支持和恢复条件也是有效走法。' });
  }
  if (peerCount >= 2) {
    tags.add('bazi-peer'); weights.transition += 1;
    baziEvidence.push({ key: 'bazi-peer', label: '比劫信号较明显，同侪、旧同事与合作关系会放大这局的影响。' });
  }
  if (luckGod) {
    tags.add(`luck-${luckGod}`);
    if (/正财|偏财/.test(luckGod)) weights.safety += 2;
    if (/食神|伤官/.test(luckGod)) weights.opportunity += 2;
    if (/正官|七杀/.test(luckGod)) weights.negotiation += 2;
    if (/正印|偏印/.test(luckGod)) weights.recovery += 2;
    if (/比肩|劫财/.test(luckGod)) weights.transition += 1;
    baziEvidence.push({ key: 'bazi-luck', label: `当前流年十神见${luckGod}，阶段性议题会比平时更浮到前台。` });
  }
  if (daYunGod) {
    tags.add(`dayun-${daYunGod}`);
    if (/正财|偏财/.test(daYunGod)) weights.safety += 1;
    if (/食神|伤官/.test(daYunGod)) weights.opportunity += 1;
    if (/正官|七杀/.test(daYunGod)) weights.negotiation += 1;
    if (/正印|偏印/.test(daYunGod)) weights.recovery += 1;
    if (/比肩|劫财/.test(daYunGod)) weights.transition += 1;
    baziEvidence.push({ key: 'bazi-dayun', label: `大运十神见${daYunGod}，为本段工作选择提供更长期的倾向。` });
  }

  if (careerStars.some((star) => POSITIVE_STARS.has(star))) {
    tags.add('ziwei-career-structure'); weights.negotiation += 2; weights.opportunity += 1;
    ziweiEvidence.push({ key: 'ziwei-career', label: `官禄/命身相关宫位见${careerStars.filter((star) => POSITIVE_STARS.has(star)).slice(0, 2).join('、')}，更适合看清平台、职责和可承接的资源。` });
  }
  if (migrationStars.some((star) => CHANGE_STARS.has(star))) {
    tags.add('ziwei-external-change'); weights.transition += 3; weights.opportunity += 1;
    ziweiEvidence.push({ key: 'ziwei-migration', label: `迁移宫见${migrationStars.filter((star) => CHANGE_STARS.has(star)).slice(0, 2).join('、')}，外部机会与环境变化会更容易推着职业选择发生。` });
  }
  if (wealthStars.some((star) => POSITIVE_STARS.has(star))) {
    tags.add('ziwei-resource-base'); weights.safety += 2;
    ziweiEvidence.push({ key: 'ziwei-wealth', label: `财帛宫见${wealthStars.filter((star) => POSITIVE_STARS.has(star)).slice(0, 2).join('、')}，这局可以把资源安排和长期承接一起纳入判断。` });
  }
  if (wellbeingStars.some((star) => PRESSURE_STARS.has(star))) {
    tags.add('ziwei-load-sensitive'); weights.recovery += 3;
    ziweiEvidence.push({ key: 'ziwei-wellbeing', label: `福德宫见${wellbeingStars.filter((star) => PRESSURE_STARS.has(star)).slice(0, 2).join('、')}，高压选择的恢复成本需要被单独算进去。` });
  }
  if ((patterns || []).some((item) => /杀破狼|禄马|火贪铃贪|廉贞贪杀/.test(item.name))) {
    tags.add('ziwei-change-pattern'); weights.transition += 2;
    ziweiEvidence.push({ key: 'ziwei-pattern', label: '命盘格局带有变化与突破信号，因此本局会保留外部转向和试探性机会。' });
  }

  [['yearly', '官禄'], ['yearly', '财帛'], ['monthly', '官禄'], ['monthly', '迁移'], ['monthly', '福德']]
    .map(([level, palace]) => activeFlowEvidence({ palaces, horoscope, level, flowingPalaceName: palace }))
    .filter(Boolean)
    .forEach((item) => {
      const tag = item.flowingPalaceName === '官禄' ? 'transit-career'
        : item.flowingPalaceName === '财帛' ? 'transit-cashflow'
          : item.flowingPalaceName === '迁移' ? 'transit-external'
            : 'transit-recovery';
      tags.add(tag);
      const mutagenStars = item.stars.filter((star) => item.mutagen.includes(star));
      const supportive = item.stars.filter((star) => POSITIVE_STARS.has(star)).length;
      const changing = item.stars.filter((star) => CHANGE_STARS.has(star)).length;
      const pressure = item.stars.filter((star) => PRESSURE_STARS.has(star)).length;
      // 流年/流月四化必须与本命落宫星曜相接才加重，不能只是把流宫名称写进标签。
      const activation = mutagenStars.length * 2;
      if (tag === 'transit-career') {
        weights.opportunity += supportive + activation;
        weights.negotiation += pressure + (item.level === 'yearly' ? 1 : 0);
      }
      if (tag === 'transit-cashflow') weights.safety += supportive + activation - Math.min(pressure, 1);
      if (tag === 'transit-external') weights.transition += changing + activation + (item.level === 'monthly' ? 1 : 0);
      if (tag === 'transit-recovery') weights.recovery += supportive + pressure + activation;
      transitEvidence.push({ key: tag, label: `${item.label}${mutagenStars.length ? ` 四化会照${mutagenStars.join('、')}。` : ' 本月未与该宫星曜形成四化会照。'}`, detail: item });
    });

  // 完整命盘即使没有命中特定星群，也应提供可读的基础三层依据，而不是拒绝进入推演。
  if (!baziEvidence.length) {
    baziEvidence.push({ key: 'bazi-base', label: `日主为${bazi.dayMaster?.stem || '未知'}，以月令${bazi.pillars?.[1]?.branch || '信息'}作为本轮职业节奏的基础参照。` });
  }
  if (!ziweiEvidence.length) {
    ziweiEvidence.push({ key: 'ziwei-base', label: `官禄、财帛、迁移与福德宫分别见${formatStars(career)}、${formatStars(wealth)}、${formatStars(migration)}、${formatStars(wellbeing)}，作为职业局的基础结构。` });
  }

  const initialState = {
    pressure: clamp(50 + weights.transition - weights.recovery),
    opportunity: clamp(50 + weights.opportunity + weights.transition),
    relationship: clamp(50 + (tags.has('bazi-peer') ? 3 : 0)),
    stability: clamp(50 + weights.safety - weights.transition),
    resources: clamp(50 + weights.safety + (tags.has('bazi-resource') ? 2 : 0)),
    wellbeing: clamp(50 + weights.recovery - (tags.has('ziwei-load-sensitive') ? 2 : 0)),
  };
  // M01–M12 每条都明确要求八字、紫微、运限各至少一个归一化信号；不能把单层或双层信号伪装成 fusion。
  const fusionMatrix = {
    M01: { bazi: ['bazi-resource'], ziwei: ['ziwei-resource-base'], transit: ['transit-cashflow'] },
    M02: { bazi: ['bazi-authority'], ziwei: ['ziwei-career-structure'], transit: ['transit-career'] },
    M03: { bazi: ['bazi-output'], ziwei: ['ziwei-career-structure'], transit: ['transit-career'] },
    M04: { bazi: ['bazi-peer'], ziwei: ['ziwei-career-structure', 'ziwei-external-change'], transit: ['transit-career', 'transit-external'] },
    M05: { bazi: ['bazi-peer', 'bazi-output'], ziwei: ['ziwei-external-change'], transit: ['transit-external'] },
    M06: { bazi: ['bazi-support', 'bazi-output'], ziwei: ['ziwei-career-structure', 'ziwei-resource-base'], transit: ['transit-career', 'transit-cashflow'] },
    M07: { bazi: ['bazi-support'], ziwei: ['ziwei-load-sensitive'], transit: ['transit-recovery'] },
    M08: { bazi: ['bazi-resource'], ziwei: ['ziwei-resource-base'], transit: ['transit-cashflow'] },
    M09: { bazi: ['bazi-output', 'bazi-authority'], ziwei: ['ziwei-career-structure'], transit: ['transit-career'] },
    M10: { bazi: ['bazi-resource', 'bazi-output'], ziwei: ['ziwei-career-structure', 'ziwei-resource-base'], transit: ['transit-career', 'transit-cashflow'] },
    M11: { bazi: ['bazi-support', 'bazi-peer'], ziwei: ['ziwei-external-change', 'ziwei-load-sensitive'], transit: ['transit-external', 'transit-recovery'] },
    M12: { bazi: ['bazi-support'], ziwei: ['ziwei-career-structure'], transit: ['transit-career'] },
  };
  const hasLayerSignal = (signals) => signals.some((tag) => tags.has(tag));
  Object.entries(fusionMatrix).forEach(([id, signals]) => {
    if (hasLayerSignal(signals.bazi) && hasLayerSignal(signals.ziwei) && hasLayerSignal(signals.transit)) tags.add(`astro:fusion:${id}`);
  });
  const rankedFocuses = Object.entries(weights).sort((a, b) => b[1] - a[1]).map(([key]) => key);
  const fullEvidenceLayers = {
    bazi: baziEvidence.filter(Boolean),
    ziwei: ziweiEvidence.filter(Boolean),
    transit: transitEvidence.filter(Boolean),
  };
  const evidenceLayers = {
    bazi: compactEvidence(baziEvidence),
    ziwei: compactEvidence(ziweiEvidence),
    transit: compactEvidence(transitEvidence),
  };
  const toSlotEvidence = (items, title) => items.slice(0, 1).map((item) => ({ title, body: item.label }));
  const fusionRules = {
    M01_cash_anchor: 'M01', M02_role_contract: 'M02', M03_proof_before_title: 'M03', M04_peer_project: 'M04',
    M05_external_move: 'M05', M06_learn_to_switch: 'M06', M07_rest_then_decide: 'M07', M08_home_runway: 'M08',
    M09_output_vs_rules: 'M09', M10_income_dual_track: 'M10', M11_change_under_load: 'M11', M12_support_and_reference: 'M12',
  };
  const evidenceByRuleId = Object.fromEntries(Object.entries(fusionRules).map(([ruleId, fusion]) => {
    const signals = fusionMatrix[fusion];
    const evidenceKeys = {
      'ziwei-career-structure': 'ziwei-career',
      'ziwei-external-change': 'ziwei-migration',
      'ziwei-resource-base': 'ziwei-wealth',
      'ziwei-load-sensitive': 'ziwei-wellbeing',
    };
    const pickEvidence = (items, keys, title) => toSlotEvidence(items.filter((item) => keys.some((key) => item.key === (evidenceKeys[key] || key))), title);
    // 先在完整证据账本中按规则筛选，最后才每层取一条展示；不能因首页摘要只保留前三条而丢失真证据。
    const baziItems = pickEvidence(fullEvidenceLayers.bazi, signals.bazi, '八字底色');
    const ziweiItems = pickEvidence(fullEvidenceLayers.ziwei, signals.ziwei, '紫微结构');
    const transitItems = pickEvidence(fullEvidenceLayers.transit, signals.transit, '当前运限');
    return [ruleId, tags.has(`astro:fusion:${fusion}`) && baziItems.length && ziweiItems.length && transitItems.length
      ? [...baziItems, ...ziweiItems, ...transitItems] : []];
  }));

  return {
    version: '0.1.0',
    available: Boolean(bazi.dayMaster?.stem && bazi.pillars?.[1]?.zhi && career && wealth && migration && wellbeing && horoscope?.yearly && horoscope?.monthly),
    tags: Array.from(tags),
    weights,
    rankedFocuses,
    initialState,
    contextLine: `这段时间，工作议题更容易同时牵动${rankedFocuses.slice(0, 2).map((key) => ({ safety: '安全余量', opportunity: '机会窗口', recovery: '身心负荷', transition: '外部变化', negotiation: '权责边界' }[key])).join('和')}。`,
    evidence: evidenceLayers,
    evidenceByRuleId,
    source: { dayMaster: bazi.dayMaster?.stem || '', gender: summary.gender || '', careerPalaces: CAREER_PALACES },
  };
};

// Relationship profile deliberately has its own three-layer matrix. A fusion
// tag exists only when one concrete 八字 signal、one named 紫微宫位星群、and
// one current 大限/流年/流月落宫星群 or 四化 activation are all present.
const RELATIONSHIP_RULES = [
  { id: 'R01', ruleId: 'R01_clarity_first', focus: 'clarity', weight: 4, bazi: 'authorityOrWealth', palace: '夫妻', stars: ['紫微', '天府', '天相', '天梁', '武曲', '天机', '巨门', '文昌', '文曲'], flows: ['decadal', 'yearly', 'monthly'], baziCopy: '官杀或财星在这一段更显眼，你会更在意关系里有没有说清规则和投入。', ziweiCopy: '夫妻宫的沟通与结构星群被点亮，适合把期待落到能确认的话和安排上。' },
  { id: 'R02', ruleId: 'R02_emotional_wait', focus: 'waiting', weight: 4, bazi: 'support', palace: '福德', stars: ['太阴', '天同', '天梁', '天府', '巨门', '文昌', '文曲', '地空', '地劫', '火星', '铃星'], flows: ['decadal', 'yearly', 'monthly'], baziCopy: '印星在这一段更显眼，容易先在心里反复想；把感受和事实分开看会更稳。', ziweiCopy: '福德宫的情绪与内耗星群被点亮，等待带来的消耗值得单独看见。' },
  { id: 'R03', ruleId: 'R03_peer_grounding', focus: 'peer', weight: 4, bazi: 'peer', palace: '交友', stars: ['左辅', '右弼', '天魁', '天钺', '文昌', '文曲', '巨门', '天机', '贪狼'], flows: ['decadal', 'yearly', 'monthly'], baziCopy: '比劫信号在这一段更显眼，同侪意见会影响判断；更适合请朋友只帮你看事实。', ziweiCopy: '交友宫的同侪与沟通星群被点亮，外部视角可以帮你分清记录和猜测。' },
  { id: 'R04', ruleId: 'R04_time_boundary', focus: 'time', weight: 4, bazi: 'outputOrPeer', palace: '迁移', stars: ['天马', '七杀', '破军', '贪狼', '天机', '太阳', '武曲', '火星', '铃星'], flows: ['decadal', 'yearly', 'monthly'], baziCopy: '食伤或比劫信号更显眼，生活节奏、邀约和外部安排更容易成为关系里的现实问题。', ziweiCopy: '迁移宫的变化与行程星群被点亮，提前确认时间比靠感觉等更重要。' },
  { id: 'R05', ruleId: 'R05_over_give_risk', focus: 'boundary', weight: 4, bazi: 'wealthOrSupport', palace: '夫妻', stars: ['巨门', '擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '破军'], flows: ['decadal', 'yearly', 'monthly'], baziCopy: '财星或印星更显眼，投入、照顾和安全感会被放大；别用更多付出换一个答案。', ziweiCopy: '夫妻宫的压力星群被点亮，边界要靠说清和行动，不靠不断加码。' },
  { id: 'R06', ruleId: 'R06_slow_but_real', focus: 'slow', weight: 4, bazi: 'supportOrAuthority', palace: '夫妻', stars: ['天相', '天府', '天梁', '太阴', '天同', '右弼', '左辅'], flows: ['decadal', 'yearly', 'monthly'], baziCopy: '印星或官杀更显眼，慢一点未必是坏事，但需要有能复盘的行动和时间点。', ziweiCopy: '夫妻宫的稳定与辅助星群被点亮，适合把“慢慢来”改成一段可观察的周期。' },
];

const buildRelationshipStoryProfile = ({ summary = {}, bazi = {}, palaces = [], horoscope = {} }) => {
  const gods = countGods(bazi);
  const palaceMap = new Map(palaces.map((palace) => [palace.name, palace]));
  const requiredPalaces = ['夫妻', '福德', '交友', '迁移'];
  // iztro's twelve-palace label is “仆役”; product copy uses the more familiar
  // “交友宫”. They are the same input slot here, never a missing-data fallback.
  const actualPalaceName = (name) => (palaceMap.has(name) ? name : (name === '交友' && palaceMap.has('仆役') ? '仆役' : name));
  const currentGods = [deriveCurrentLuckGod(bazi, horoscope), deriveCurrentDaYunGod(bazi, horoscope)].filter(Boolean);
  const hasGod = (names) => names.some((name) => (gods[name] || 0) > 0 || currentGods.includes(name));
  const baziMatches = {
    authorityOrWealth: () => hasGod(['正官', '七杀', '正财', '偏财']),
    support: () => hasGod(['正印', '偏印']),
    peer: () => hasGod(['比肩', '劫财']),
    outputOrPeer: () => hasGod(['食神', '伤官', '比肩', '劫财']),
    wealthOrSupport: () => hasGod(['正财', '偏财', '正印', '偏印']),
    supportOrAuthority: () => hasGod(['正印', '偏印', '正官', '七杀']),
  };
  const flowFor = (rule) => rule.flows.map((level) => activeFlowEvidence({ palaces, horoscope, level, flowingPalaceName: actualPalaceName(rule.palace) }))
    .filter(Boolean)
    // 四化本身不是“万能激活器”：只有它落到这个规则自己的星群上，
    // 才能作为该 R 规则的第三层命中。
    .map((flow) => ({
      ...flow,
      matchedStars: flow.stars.filter((star) => rule.stars.includes(star)),
      activated: flow.mutagen.filter((star) => rule.stars.includes(star)),
    }))
    .find((flow) => flow.matchedStars.length || flow.activated.length);
  const tags = new Set(['relationship-story']);
  const weights = { clarity: 0, waiting: 0, peer: 0, time: 0, boundary: 0, slow: 0 };
  // The natal structure decides which R rules are possible; the active
  // 流年/大运十神 changes their emphasis across dates, so the same person is
  // not shown an effectively frozen relationship profile every year.
  [...new Set(currentGods)].forEach((god) => {
    if (/正官|七杀|正财|偏财/.test(god)) weights.clarity += 2;
    if (/正印|偏印/.test(god)) { weights.waiting += 2; weights.slow += 1; }
    if (/比肩|劫财/.test(god)) weights.peer += 2;
    if (/食神|伤官/.test(god)) { weights.time += 2; weights.boundary += 1; }
  });
  const evidenceByRuleId = {};
  const fusionMatrix = {};
  RELATIONSHIP_RULES.forEach((rule) => {
    const palace = palaceMap.get(actualPalaceName(rule.palace));
    const ziweiStars = starsOf(palace).filter((star) => rule.stars.includes(star));
    const period = flowFor(rule);
    const baziHit = Boolean(baziMatches[rule.bazi]?.());
    const ziweiHit = ziweiStars.length > 0;
    const periodHit = Boolean(period);
    const complete = baziHit && ziweiHit && periodHit;
    fusionMatrix[rule.id] = {
      bazi: { hit: baziHit, signal: rule.bazi },
      ziwei: { hit: ziweiHit, palace: rule.palace, stars: ziweiStars },
      period: period ? { hit: true, level: period.level, flowingPalace: rule.palace, natalPalace: period.natalPalace, stars: period.matchedStars, mutagenActivation: period.activated } : { hit: false },
      complete,
    };
    if (!complete) return;
    tags.add(`astro:fusion:${rule.id}`);
    weights[rule.focus] += rule.weight;
    const activated = period.activated.length ? `；四化会照${period.activated.join('、')}` : '';
    evidenceByRuleId[rule.ruleId] = [
      { title: '八字底色', body: rule.baziCopy },
      { title: '紫微结构', body: `${rule.ziweiCopy}（${rule.palace}宫见${ziweiStars.slice(0, 3).join('、')}）` },
      { title: '当前运限', body: `${period.label}${activated}。` },
    ];
  });
  const fallback = { title: '命理依据（部分匹配）', body: '这张命盘在这一条上只出现了部分信号，所以这里只把它当作排序参考，不把它写成确定结论。' };
  RELATIONSHIP_RULES.forEach((rule) => { if (!evidenceByRuleId[rule.ruleId]) evidenceByRuleId[rule.ruleId] = [fallback]; });
  const rankedFocuses = Object.entries(weights).sort((a, b) => b[1] - a[1]).map(([key]) => key);
  const initialWorkState = {
    // Reuse the generic storage shape, but these are the relationship page's
    // three visible chips: clear enough / reciprocal enough / tiring enough.
    runway: clamp(38 + weights.clarity + weights.boundary - weights.waiting),
    optionality: clamp(42 + weights.peer + weights.slow - weights.boundary),
    load: clamp(48 + weights.waiting + weights.boundary - weights.slow),
  };
  return {
    version: '0.5.0',
    available: Boolean(bazi.dayMaster?.stem && requiredPalaces.every((name) => palaceMap.get(actualPalaceName(name))) && horoscope?.yearly && horoscope?.monthly),
    tags: [...tags], weights, rankedFocuses,
    initialState: {}, initialWorkState,
    contextLine: `这段时间，关系里更容易被推到台前的是${({ clarity: '把期待说清', waiting: '别让等待占满生活', peer: '把猜测交回事实', time: '把时间边界讲明白', boundary: '别用付出换答案', slow: '给慢一点一个观察期' }[rankedFocuses[0]] || '把期待和边界说清')}。`,
    evidenceByRuleId, fusionMatrix,
    relationshipSignals: Object.fromEntries(requiredPalaces.map((name) => [name, formatStars(palaceMap.get(actualPalaceName(name)))])),
    source: { gender: summary.gender || '' },
  };
};

module.exports = { buildWorkStoryProfile, buildRelationshipStoryProfile };
