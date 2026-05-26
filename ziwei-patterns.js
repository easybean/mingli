const BRANCH_SEQUENCE = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const RULE_LEVELS = {
  strict: '严格口径',
  broad: '宽口径',
  heuristic: '近似提示',
};

const withPatternMeta = (pattern, sourceTitles, ruleLevel) => ({
  ...pattern,
  sources: sourceTitles,
  ruleLevel,
  ruleLevelLabel: RULE_LEVELS[ruleLevel] || ruleLevel,
});

const PATTERN_GROUP_STAGE1 = [
  withPatternMeta({
    id: 'ziwei-tianfu-chaoyuan',
    name: '紫府朝垣格',
    verdict: '吉',
    summary: '紫微、天府落入命宫三方四正，偏向组织、统筹与承载能力较强的结构。',
    detail: '常见解释偏向格局端正、掌控力与资源承接力较好，但仍要结合煞忌与落宫强弱。',
    conditions: ['命宫三方四正见紫微、天府', '先按命宫/财帛/官禄/迁移这一组宽口径判断'],
    caveats: ['若空劫、羊陀、火铃与化忌过重，格局会被明显削弱', '不宜把“有统筹力”直接等同现实地位'],
    match: ({ destinySet }) => hasAll(destinySet.stars, ['紫微', '天府']),
  }, ['斗数发微论', '斗数玄微论', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'fuxiang-chaoyuan',
    name: '府相朝垣格',
    verdict: '吉',
    summary: '天府、天相同入命宫三方四正，偏向规则感、协调能力和稳定承接较强。',
    detail: '这类组合通常比爆发型更重稳态、秩序与资源管理。',
    conditions: ['命宫三方四正见天府、天相', '以稳定承接、规则协作作为核心判断线'],
    caveats: ['若主体主星过弱，容易只剩维持秩序而缺主动突破', '仍要结合宫位主题区分是事业、资源还是关系层面的承接'],
    match: ({ destinySet }) => hasAll(destinySet.stars, ['天府', '天相']),
  }, ['斗数发微论', '斗数玄微论', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'ji-yue-tong-liang',
    name: '机月同梁格',
    verdict: '吉',
    summary: '天机、太阴、天同、天梁在命宫三方四正形成组合，偏向策划、服务、教辅和顾问型路线。',
    detail: '常见解释重思辨、照料、流程与支持系统，但也容易更在意环境与情绪承接。',
    conditions: ['天机、太阴、天同、天梁四星中至少三颗进入命宫三方四正', '优先解释为策划、支持、教辅、顾问一类结构'],
    caveats: ['更依赖环境质量和协作氛围', '若煞忌重，容易变成反复犹疑和情绪内耗'],
    match: ({ destinySet }) => countMatches(destinySet.stars, ['天机', '太阴', '天同', '天梁']) >= 3,
  }, ['斗数骨髓赋', '斗数玄微论', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'sha-po-lang',
    name: '杀破狼格',
    verdict: '待辨',
    summary: '七杀、破军、贪狼在命宫三方四正聚集，偏向变化、突破、重组和高波动路径。',
    detail: '这类结构不直接等于吉或凶，关键要看能否承压、能否驾驭变化，以及煞忌是否过重。',
    conditions: ['七杀、破军、贪狼三者中至少两颗进入命宫三方四正', '先按变化型、突破型、重组型路线处理'],
    caveats: ['不适合直接贴“凶格”标签', '若缺少承压能力或节律管理，波动成本会明显放大'],
    match: ({ destinySet }) => countMatches(destinySet.stars, ['七杀', '破军', '贪狼']) >= 2,
  }, ['斗数发微论', '斗数观音经验谈', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'rich-seal-flank',
    name: '财荫夹印格',
    verdict: '吉',
    summary: '命宫左右邻宫形成财与荫的夹辅，偏向资源承接、助力来源与稳态支持较好。',
    detail: '这里先按较宽口径收：左右邻宫见禄或禄存，且另一侧见天梁或天相，作为第一批辅助判断。',
    conditions: ['命宫左右邻宫一侧见禄存或化禄', '另一侧见天梁或天相形成夹辅'],
    caveats: ['当前仍是宽口径判断，后续要继续细分“财”“荫”“印”的严格搭配', '更适合作为资源承接提示，不单独代替全盘财富判断'],
    match: ({ lifeAdjacent }) => {
      if (lifeAdjacent.length !== 2) {
        return false;
      }
      const hasShade = lifeAdjacent.some((palace) => hasAny(palace.stars, ['天梁', '天相']));
      const hasFortune = lifeAdjacent.some((palace) => palace.hasLu);
      return hasShade && hasFortune;
    },
  }, ['斗数发微论', '重补斗数彀率', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'riyue-bingming',
    name: '日月并明格',
    verdict: '吉',
    summary: '太阳与太阴同入命宫三方四正，且不以失陷为主，偏向明暗两端都较有承接。',
    detail: '第一批只按太阳、太阴同时出现且不见明显失陷来做宽口径判断。',
    conditions: ['命宫三方四正同时见太阳、太阴', '太阳、太阴不以明显陷地作为主导状态'],
    caveats: ['这里只做宽口径判断，后续还要细分庙旺失陷与宫位背景', '更适合看整合力，不直接等同一路顺遂'],
    match: ({ destinySet }) => {
      if (!hasAll(destinySet.stars, ['太阳', '太阴'])) {
        return false;
      }
      return !destinySet.details
        .filter((item) => ['太阳', '太阴'].includes(item.name))
        .some((item) => item.brightness === '陷');
    },
  }, ['增补太微赋', '斗数玄微论', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'changqu-gongming',
    name: '昌曲拱命格',
    verdict: '吉',
    summary: '文昌、文曲进入命宫三方四正，偏向文书、表达、学习与思维组织能力较强。',
    detail: '更适合看成表达与学习资源的加分，不单独等同现实成就。',
    conditions: ['命宫三方四正见文昌、文曲', '先从表达、书写、学习与思维组织力切入'],
    caveats: ['不宜把“会读会写”直接推成学业或名望结论', '若主体执行弱，容易只停在想法和表达层'],
    match: ({ destinySet }) => hasAll(destinySet.stars, ['文昌', '文曲']),
  }, ['斗数骨髓赋', '增补太微赋', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'zuoyou-fubi',
    name: '左右扶命格',
    verdict: '吉',
    summary: '左辅、右弼进入命宫三方四正，偏向协作、辅助、人脉与支持系统较完整。',
    detail: '常见解释是贵人和协同更明显，但仍要看命宫主体能否承接。',
    conditions: ['命宫三方四正见左辅、右弼', '优先理解为支持系统和协作承接增强'],
    caveats: ['“贵人”不等于自动兑现结果', '若主体宫位过弱，容易变成依赖协作而非真正主导'],
    match: ({ destinySet }) => hasAll(destinySet.stars, ['左辅', '右弼']),
  }, ['斗数发微论', '斗数玄微论', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'lu-ma-jiaochi',
    name: '禄马交驰格',
    verdict: '吉',
    summary: '天马与禄星同入命宫三方四正，偏向因流动、迁移、项目推进而得财得势。',
    detail: '第一批按天马与化禄或禄存同入命宫三方四正来判断。',
    conditions: ['命宫三方四正同时见天马与禄存/化禄', '先看流动、迁移、项目推进对资源的推动作用'],
    caveats: ['若空劫同会，容易形成“忙而未稳”', '要区分主动扩张和被动奔波两种表现'],
    match: ({ destinySet }) => destinySet.stars.includes('天马') && destinySet.hasLu,
  }, ['斗数发微论', '重补斗数彀率', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'yang-tuo-jia-ming',
    name: '羊陀夹命格',
    verdict: '凶',
    summary: '命宫左右邻宫见擎羊与陀罗，偏向压力、摩擦、硬碰硬和结构牵制更明显。',
    detail: '这类判断更适合视作风险提示，而不是单句断凶。',
    conditions: ['命宫左右邻宫同时出现擎羊、陀罗', '优先解释为摩擦成本和硬碰硬结构增加'],
    caveats: ['不应直接作为定凶结论', '重点要落在决策方式、冲突管理和节奏成本'],
    match: ({ lifeAdjacent }) => hasAll(flattenStars(lifeAdjacent), ['擎羊', '陀罗']),
  }, ['斗数十喻歌', '斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'huo-ling-jia-ming',
    name: '火铃夹命格',
    verdict: '凶',
    summary: '命宫左右邻宫见火星与铃星，偏向阶段波动、急躁决策和外部扰动更强。',
    detail: '这类结构常要把情绪节律、事故成本和节奏管理一起看。',
    conditions: ['命宫左右邻宫同时出现火星、铃星', '优先解释为波动、急促、扰动成本增加'],
    caveats: ['更适合当作风险提醒而不是宿命判断', '若命宫主体稳、节律强，风险可明显缓冲'],
    match: ({ lifeAdjacent }) => hasAll(flattenStars(lifeAdjacent), ['火星', '铃星']),
  }, ['斗数十喻歌', '斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'ming-li-feng-kong',
    name: '命里逢空格',
    verdict: '凶',
    summary: '命宫见地空或地劫，偏向计划落空、预期偏差和心理落差感更明显。',
    detail: '适合当作“结构易落空”的提醒，而不是单独决定吉凶。',
    conditions: ['命宫见地空或地劫', '先按计划落空感、预期偏差和心理落差来理解'],
    caveats: ['重点不是“必败”，而是要降低理想化预期', '仍要看三方四正是否有稳定承接力量'],
    match: ({ lifePalace }) => hasAny(lifePalace.stars, ['地空', '地劫']),
  }, ['斗数发微论', '斗数十喻歌', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'ma-luo-kong-wang',
    name: '马落空亡格',
    verdict: '凶',
    summary: '天马与空曜同宫，偏向奔波、落空、行动成本偏高或迁动收效不稳。',
    detail: '第一批按天马与地空/地劫同宫处理，后续再补更细的空亡口径。',
    conditions: ['任一宫位天马与地空/地劫同宫', '优先解释为奔波成本上升、迁动收效不稳'],
    caveats: ['当前先按空曜宽口径处理，后续要补真正空亡口径', '需要区分是主动跑动还是被动折返'],
    match: ({ palaces }) => palaces.some((palace) => palace.stars.includes('天马') && hasAny(palace.stars, ['地空', '地劫'])),
  }, ['斗数发微论', '斗数十喻歌', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'ming-wu-zheng-yao',
    name: '命无正曜格',
    verdict: '待辨',
    summary: '命宫无主星，主题更依赖对宫、三方四正与运限触发，不宜只抓单宫断语。',
    detail: '这类结构更考验整体联动与后天承接，不直接等同好坏。',
    conditions: ['命宫主星为空', '解释时必须联动对宫、三方四正与运限'],
    caveats: ['不能把空宫直接当弱宫', '越是命无正曜，越不能只看单一句子下结论'],
    match: ({ lifePalace }) => lifePalace.majorStars.length === 0,
  }, ['斗数发微论', '紫微斗数实用手册'], 'strict'),
];

const PATTERN_GROUP_STAGE2 = [
  withPatternMeta({
    id: 'ri-zhao-lei-men',
    name: '日照雷门',
    verdict: '吉',
    summary: '太阳坐卯，偏向公开表达、担当意愿与外放推进力较强。',
    detail: '先按“太阳在卯位而不陷”做第二批宽口径判断，适合作为公开表现和主导能见度的加分项。',
    conditions: ['任一宫位太阳落卯宫', '太阳不以陷地作为主导状态'],
    caveats: ['更适合作为公开表现和能见度提示', '仍要结合命宫三方四正与四化判断是否真正成事'],
    match: ({ palaces }) => palaces.some((palace) => palace.branch === '卯' && palace.stars.includes('太阳')
      && !palace.details.some((item) => item.name === '太阳' && item.brightness === '陷')),
  }, ['增补太微赋', '斗数骨髓赋', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'yue-lang-tian-men',
    name: '月朗天门',
    verdict: '吉',
    summary: '太阴坐亥，偏向内在稳定、细节经营和长期陪伴力较强。',
    detail: '先按“太阴在亥位而不陷”做第二批宽口径判断，适合作为审美、感受和长期经营力的加分。',
    conditions: ['任一宫位太阴落亥宫', '太阴不以陷地作为主导状态'],
    caveats: ['更偏长期稳定和细水长流，不等同强势外放', '仍要看煞忌和主题宫位，避免把细腻直接当成现实兑现'],
    match: ({ palaces }) => palaces.some((palace) => palace.branch === '亥' && palace.stars.includes('太阴')
      && !palace.details.some((item) => item.name === '太阴' && item.brightness === '陷')),
  }, ['增补太微赋', '斗数骨髓赋', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'ji-ju-mao-you',
    name: '极居卯酉',
    verdict: '待辨',
    summary: '紫微落卯或酉，偏向强烈的秩序感、自我中心和角色承担意识。',
    detail: '这一版先只按紫微落卯酉做结构提示，不提前下定论。',
    conditions: ['任一宫位紫微落卯或酉宫', '先从秩序感、主导欲和角色承接来理解'],
    caveats: ['只是结构提示，不直接等同吉格', '还要看同宫搭配、三方四正和煞忌轻重'],
    match: ({ palaces }) => palaces.some((palace) => ['卯', '酉'].includes(palace.branch) && palace.stars.includes('紫微')),
  }, ['斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'tian-yi-gong-ming',
    name: '天乙拱命',
    verdict: '吉',
    summary: '天魁、天钺进入命宫三方四正，偏向助力、提携和关键节点的资源扶持更明显。',
    detail: '先按天魁、天钺进入命宫三方四正做宽口径判断。',
    conditions: ['命宫三方四正见天魁、天钺', '优先理解为关键节点的支持和提携增强'],
    caveats: ['不宜把贵人提示直接写成现实保送', '若命宫主体承接差，助力未必能变成果'],
    match: ({ destinySet }) => hasAll(destinySet.stars, ['天魁', '天钺']),
  }, ['斗数发微论', '斗数玄微论', '紫微斗数实用手册'], 'broad'),
  withPatternMeta({
    id: 'ke-ming-hui-lu',
    name: '科名会禄',
    verdict: '吉',
    summary: '命宫三方四正同时见化科与禄星，偏向名声、资历、表达与资源兑现相互支撑。',
    detail: '第二批先按化科和禄存/化禄同入命宫三方四正来判断。',
    conditions: ['命宫三方四正见化科', '同组再见禄存或化禄'],
    caveats: ['更适合作为资历与资源联动的提示', '若主体宫位空转，可能只有名头和机会感而难沉淀'],
    match: ({ destinySet }) => destinySet.details.some((item) => item.mutagen === '科')
      && (destinySet.details.some((item) => item.mutagen === '禄') || destinySet.stars.includes('禄存')),
  }, ['斗数骨髓赋', '增补太微赋', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'san-qi-jia-hui',
    name: '三奇嘉会',
    verdict: '吉',
    summary: '命宫三方四正会齐禄、权、科，偏向资源、执行和名望三线联动更顺。',
    detail: '这一版先按命宫三方四正见化禄、化权、化科三者齐全做判断。',
    conditions: ['命宫三方四正同时见化禄、化权、化科', '优先理解为资源、执行、名望一起被点亮'],
    caveats: ['更强调联动性，不保证每条线都同样强', '若煞忌夹杂过重，容易出现有机会但执行成本高'],
    match: ({ destinySet }) => hasAll(destinySet.details.map((item) => item.mutagen).filter(Boolean), ['禄', '权', '科']),
  }, ['斗数发微论', '增补太微赋', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'wengui-wenhua',
    name: '文桂文华',
    verdict: '吉',
    summary: '文昌、文曲与化科同会，偏向学习、写作、表达、专业声誉与制度型输出较强。',
    detail: '这类结构更适合解释为文书、知识、表达资源的叠加。',
    conditions: ['命宫三方四正见文昌、文曲', '同组再见化科'],
    caveats: ['更像知识和表达资源叠加，不等同现实头衔', '若执行和承压差，容易停在会说会写而难落地'],
    match: ({ destinySet }) => hasAll(destinySet.stars, ['文昌', '文曲'])
      && destinySet.details.some((item) => item.mutagen === '科'),
  }, ['斗数骨髓赋', '增补太微赋', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'wen-xing-an-gong',
    name: '文星暗拱',
    verdict: '吉',
    summary: '文昌或文曲在命宫左右邻宫形成夹辅，偏向暗中加持的学习力、表达力和思维整理能力。',
    detail: '第二批先按命宫左右邻宫见文昌、文曲做宽口径夹辅判断。',
    conditions: ['命宫左右邻宫同时见文昌、文曲', '优先理解为表达与学习资源的暗助'],
    caveats: ['当前按邻宫夹辅宽口径处理，后续还要细分对拱和三方口径', '更适合作为支持项，不宜单独下成就结论'],
    match: ({ lifeAdjacent }) => hasAll(flattenStars(lifeAdjacent), ['文昌', '文曲']),
  }, ['斗数骨髓赋', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'ming-zhu-chu-hai',
    name: '明珠出海',
    verdict: '吉',
    summary: '太阴与文昌、文曲在命宫三方四正形成配合，偏向审美、表达、内容与细节经营能力较强。',
    detail: '这一版先按太阴加昌曲的组合来处理，作为文气、审美和内容输出资源的叠加。',
    conditions: ['命宫三方四正见太阴', '同组再见文昌、文曲'],
    caveats: ['当前是宽口径近似判断，后续还要补更严格的古籍位置条件', '更像表达与审美资源叠加，不直接代替现实名望'],
    match: ({ destinySet }) => destinySet.stars.includes('太阴') && hasAll(destinySet.stars, ['文昌', '文曲']),
  }, ['增补太微赋', '斗数骨髓赋', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'yue-sheng-cang-hai',
    name: '月生沧海',
    verdict: '吉',
    summary: '太阴与水系星曜形成相生配合，偏向感受力、包容度与长期经营力较强。',
    detail: '这一版先按太阴与天同或天机同入命宫三方四正做宽口径判断。',
    conditions: ['命宫三方四正见太阴', '同组再见天同或天机'],
    caveats: ['更适合作为感受力和长期经营力提示', '后续还要继续细分位置、庙旺与煞忌口径'],
    match: ({ destinySet }) => destinySet.stars.includes('太阴') && hasAny(destinySet.stars, ['天同', '天机']),
  }, ['增补太微赋', '斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'ri-yue-zhao-bi',
    name: '日月照壁',
    verdict: '吉',
    summary: '太阳、太阴共同照拱命宫三方四正，偏向外部表现与内部承接相对均衡。',
    detail: '第二批先按太阳、太阴同入命宫三方四正且至少一星不陷来判断。',
    conditions: ['命宫三方四正同时见太阳、太阴', '太阳或太阴至少有一星不以陷地为主导'],
    caveats: ['和日月并明有接近处，后续要再细分位置口径', '更适合作为均衡度提示，不直接等同无短板'],
    match: ({ destinySet }) => {
      if (!hasAll(destinySet.stars, ['太阳', '太阴'])) {
        return false;
      }
      return destinySet.details
        .filter((item) => ['太阳', '太阴'].includes(item.name))
        .some((item) => item.brightness !== '陷');
    },
  }, ['增补太微赋', '斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'shi-zhong-yin-yu',
    name: '石中隐玉',
    verdict: '待辨',
    summary: '巨门与文星或化科配合，偏向先难后显、内藏表达力和打磨后见价值。',
    detail: '这一版先按巨门配昌曲或化科做近似判断，先作为“潜藏表达力”来解释。',
    conditions: ['命宫三方四正见巨门', '同组再见文昌、文曲或化科'],
    caveats: ['当前仍是近似规则，不宜直接当成传统定格', '更适合解释为需要打磨后显露的表达与辨析能力'],
    match: ({ destinySet }) => destinySet.stars.includes('巨门')
      && (hasAny(destinySet.stars, ['文昌', '文曲']) || destinySet.details.some((item) => item.mutagen === '科')),
  }, ['斗数玄微论', '斗数骨髓赋', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'ju-ji-hua-you',
    name: '巨机化酉',
    verdict: '待辨',
    summary: '巨门、天机与化曜在酉位相关结构中出现，偏向机辨、策划、表达与反复推演并存。',
    detail: '这一版先按酉宫见巨门或天机，同时命宫三方四正有化曜参与来做结构提示。',
    conditions: ['酉宫见巨门或天机', '命宫三方四正至少见一颗化禄/化权/化科/化忌'],
    caveats: ['当前是结构提示，不是成熟定格', '后续还要补更严格的宫位组合和古籍口径'],
    match: ({ palaces, destinySet }) => palaces.some((palace) => palace.branch === '酉' && hasAny(palace.stars, ['巨门', '天机']))
      && destinySet.details.some((item) => ['禄', '权', '科', '忌'].includes(item.mutagen)),
  }, ['斗数玄微论', '斗数观音经验谈', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'huo-tan-ling-tan',
    name: '火贪铃贪',
    verdict: '待辨',
    summary: '贪狼与火星或铃星形成激发，偏向爆发、表现、欲望驱动和高波动并存。',
    detail: '先按贪狼与火星/铃星同宫或同入命宫三方四正做宽口径判断。',
    conditions: ['贪狼与火星或铃星同宫，或共同进入命宫三方四正', '优先解释为爆发型表达和波动型机会并存'],
    caveats: ['不宜直接贴吉凶标签，关键看节律管理', '若煞忌过重，容易从爆发变成失控'],
    match: ({ palaces, destinySet }) => palaces.some((palace) => palace.stars.includes('贪狼') && hasAny(palace.stars, ['火星', '铃星']))
      || (destinySet.stars.includes('贪狼') && hasAny(destinySet.stars, ['火星', '铃星'])),
  }, ['斗数观音经验谈', '斗数十喻歌', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'ri-yue-fan-bei',
    name: '日月反背',
    verdict: '凶',
    summary: '太阳、太阴同时失陷或明显背离命宫三方四正，偏向内外承接失衡、表达与感受脱节。',
    detail: '这一版先按太阳、太阴都出现且都以陷地为主导来做风险提示。',
    conditions: ['命宫三方四正同时见太阳、太阴', '太阳、太阴都以陷地作为主导状态'],
    caveats: ['当前先按失陷近似处理，后续还要补更细的古籍位置口径', '更适合作为结构失衡提醒，不单独决定现实结局'],
    match: ({ destinySet }) => {
      if (!hasAll(destinySet.stars, ['太阳', '太阴'])) {
        return false;
      }
      const luminaries = destinySet.details.filter((item) => ['太阳', '太阴'].includes(item.name));
      return luminaries.length >= 2 && luminaries.every((item) => item.brightness === '陷');
    },
  }, ['增补太微赋', '斗数十喻歌', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'yue-tong-yu-sha',
    name: '月同遇煞',
    verdict: '待辨',
    summary: '太阴、天同与煞曜同会，偏向感受细腻但更容易受环境、关系和情绪扰动。',
    detail: '这一版先按太阴或天同与羊陀火铃空劫同宫或同入命宫三方四正做提示。',
    conditions: ['命宫三方四正见太阴或天同', '同组再见羊陀、火铃、地空、地劫之一'],
    caveats: ['不宜把敏感结构直接断成凶格', '重点要落在情绪节律、边界管理和环境筛选'],
    match: ({ destinySet }) => hasAny(destinySet.stars, ['太阴', '天同'])
      && hasAny(destinySet.stars, ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫']),
  }, ['女命骨髓赋', '斗数十喻歌', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'ju-feng-si-sha',
    name: '巨逢四煞',
    verdict: '凶',
    summary: '巨门与煞曜重叠，偏向口舌、误解、反复辨析和外部摩擦成本更高。',
    detail: '这一版先按巨门与羊陀火铃中至少两颗同宫或同入命宫三方四正处理。',
    conditions: ['命宫三方四正见巨门', '同组再见羊陀火铃中至少两颗'],
    caveats: ['重点是沟通与冲突成本，不是单句定凶', '若表达被制度、流程和节律承接，风险可被压低'],
    match: ({ destinySet }) => destinySet.stars.includes('巨门')
      && countMatches(destinySet.stars, ['擎羊', '陀罗', '火星', '铃星']) >= 2,
  }, ['斗数十喻歌', '斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'xing-ji-jia-yin',
    name: '刑忌夹印',
    verdict: '凶',
    summary: '印曜承接位受刑煞与化忌牵制，偏向支持系统被消耗、学习恢复力受压。',
    detail: '这一版先按命宫左右邻宫见煞曜，同时命宫三方四正出现化忌并见天梁/天相/天魁/天钺来做近似判断。',
    conditions: ['命宫左右邻宫见羊陀火铃之一', '命宫三方四正见化忌', '同组再见天梁、天相、天魁、天钺之一作为“印”类承接'],
    caveats: ['当前是近似规则，不是严格古籍口径', '适合解释为支持系统承压，不宜机械套成学业或贵人失效'],
    match: ({ lifeAdjacent, destinySet }) => hasAny(flattenStars(lifeAdjacent), ['擎羊', '陀罗', '火星', '铃星'])
      && destinySet.details.some((item) => item.mutagen === '忌')
      && hasAny(destinySet.stars, ['天梁', '天相', '天魁', '天钺']),
  }, ['斗数十喻歌', '斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'lian-zhen-tan-sha',
    name: '廉贞贪杀',
    verdict: '待辨',
    summary: '廉贞、贪狼与七杀形成攻防并存结构，偏向欲望、边界、突破与风险并行。',
    detail: '这一版先按廉贞、贪狼、七杀三者中至少两颗进入命宫三方四正处理。',
    conditions: ['廉贞、贪狼、七杀三者中至少两颗进入命宫三方四正', '优先解释为边界、欲望、突破与风险并存'],
    caveats: ['不直接定吉凶，关键看节律和承压能力', '若再叠加煞忌，波动成本会明显抬升'],
    match: ({ destinySet }) => countMatches(destinySet.stars, ['廉贞', '贪狼', '七杀']) >= 2,
  }, ['斗数观音经验谈', '斗数玄微论', '紫微斗数实用手册'], 'heuristic'),
  withPatternMeta({
    id: 'qing-yang-ru-miao',
    name: '擎羊入庙',
    verdict: '待辨',
    summary: '擎羊在强势位置出现，偏向执行锋利、切割决断力强，但也容易硬碰硬。',
    detail: '这一版先按擎羊落辰、戌、丑、未四库位做宽口径判断。',
    conditions: ['任一宫位擎羊落辰、戌、丑、未之一', '先从切割、执行、决断和硬碰硬来理解'],
    caveats: ['这是“锋利”不是“自动成事”', '若缺少缓冲与协作，容易把执行力用成冲突成本'],
    match: ({ palaces }) => palaces.some((palace) => ['辰', '戌', '丑', '未'].includes(palace.branch) && palace.stars.includes('擎羊')),
  }, ['斗数观音经验谈', '斗数十喻歌', '紫微斗数实用手册'], 'heuristic'),
];

const STAGE2_BACKLOG = [];

const hasAll = (haystack, needles) => needles.every((item) => haystack.includes(item));
const hasAny = (haystack, needles) => needles.some((item) => haystack.includes(item));
const countMatches = (haystack, needles) => needles.filter((item) => haystack.includes(item)).length;
const flattenStars = (palaces) => palaces.flatMap((palace) => palace.stars);

const normalizePalace = (palace) => ({
  name: palace.name,
  index: palace.index,
  branch: palace.branch,
  stars: palace.majorStars
    .concat(palace.minorStars, palace.adjectiveStars)
    .map((star) => star.name),
  details: palace.majorStars
    .concat(palace.minorStars, palace.adjectiveStars)
    .map((star) => ({
      name: star.name,
      brightness: star.brightness || '',
      mutagen: star.mutagen || '',
    })),
  majorStars: palace.majorStars,
  hasLu: palace.majorStars
    .concat(palace.minorStars, palace.adjectiveStars)
    .some((star) => star.name === '禄存' || star.mutagen === '禄'),
});

const getAdjacentPalaces = (palaces, targetIndex) => {
  const current = palaces.find((item) => item.index === targetIndex);
  if (!current) {
    return [];
  }
  const currentBranch = current.branch;
  const branchIndex = BRANCH_SEQUENCE.indexOf(currentBranch);
  if (branchIndex === -1) {
    return [];
  }
  const prevBranch = BRANCH_SEQUENCE[(branchIndex + 11) % 12];
  const nextBranch = BRANCH_SEQUENCE[(branchIndex + 1) % 12];
  return [prevBranch, nextBranch]
    .map((branch) => palaces.find((item) => item.branch === branch))
    .filter(Boolean);
};

const buildDestinySet = (palaces) => {
  const names = ['命宫', '财帛', '官禄', '迁移'];
  const group = palaces.filter((palace) => names.includes(palace.name));
  return {
    palaces: group,
    stars: flattenStars(group),
    details: group.flatMap((item) => item.details),
    hasLu: group.some((item) => item.hasLu),
  };
};

const evaluateZiweiPatterns = (palaces) => {
  const normalized = palaces.map(normalizePalace);
  const lifePalace = normalized.find((item) => item.name === '命宫');
  const destinySet = buildDestinySet(normalized);
  const lifeAdjacent = lifePalace ? getAdjacentPalaces(normalized, lifePalace.index) : [];

  const context = {
    palaces: normalized,
    lifePalace,
    destinySet,
    lifeAdjacent,
  };

  return PATTERN_GROUP_STAGE1
    .concat(PATTERN_GROUP_STAGE2)
    .filter((pattern) => context.lifePalace && pattern.match(context))
    .map((pattern) => ({
      id: pattern.id,
      name: pattern.name,
      verdict: pattern.verdict,
      summary: pattern.summary,
      detail: pattern.detail,
      conditions: pattern.conditions || [],
      caveats: pattern.caveats || [],
      sources: pattern.sources || [],
      ruleLevel: pattern.ruleLevel || 'heuristic',
      ruleLevelLabel: pattern.ruleLevelLabel || RULE_LEVELS.heuristic,
      category: PATTERN_GROUP_STAGE1.includes(pattern) ? 'stage1' : 'stage2',
    }));
};

module.exports = {
  evaluateZiweiPatterns,
  PATTERN_GROUP_STAGE1,
  PATTERN_GROUP_STAGE2,
  STAGE2_BACKLOG,
};
