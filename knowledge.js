const ZIWEI_RULES = require('./data/knowledge-rules/ziwei-handbook-stage1.json');
const BAZI_RULES = require('./data/knowledge-rules/bazi-basics-stage1.json');
const ZIWEI_STAGE2_RULES = require('./data/knowledge-rules/ziwei-faweilu-stage2.json');
const BAZI_STAGE2_RULES = require('./data/knowledge-rules/bazi-zipingzhenquan-stage2.json');
const { getActiveKnowledgeCatalog, getCatalogSummary } = require('./knowledge-catalog');

const ACTIVE_BOOKS = getActiveKnowledgeCatalog();
const CATALOG_SUMMARY = getCatalogSummary(ACTIVE_BOOKS);

const ZIWEI_REFERENCE_RULES = [
  {
    source: '斗数发微论',
    topic: '命宫见紫微',
    palace: '命宫',
    stars: ['紫微'],
    summary: '古诀把紫微入命视为带荣显之象，强调主星落命时要先看格局是否得位。 ',
  },
  {
    source: '斗数发微论',
    topic: '官禄遇紫府',
    palace: '官禄宫',
    stars: ['紫微', '天府'],
    summary: '古诀把紫微、天府落官禄视作事业位较稳、较有成就感的组合。',
  },
  {
    source: '斗数发微论',
    topic: '田宅遇破军',
    palace: '田宅宫',
    stars: ['破军'],
    summary: '古诀认为破军在田宅往往先破后成，适合用重组而不是守成的视角去看资产变化。',
  },
  {
    source: '斗数发微论',
    topic: '财帛受凶',
    palace: '财帛宫',
    stars: ['七杀', '巨门', '破军', '贪狼'],
    summary: '古诀提醒财帛位若受凶曜牵动，容易表现为聚散快、波动大，理财节奏要更克制。',
  },
  {
    source: '斗数发微论',
    topic: '福德遇空劫',
    palace: '福德宫',
    stars: [],
    summary: '古诀强调福德位受耗时，精神能量和恢复力容易先被拖慢，先调状态再谈推进。',
  },
  {
    source: '斗数发微论',
    topic: '迁移遇火铃',
    palace: '迁移宫',
    stars: [],
    summary: '古诀把迁移位的凶曜放大成外部环境风险，出行与跨城选择要更看时机和成本。',
  },
];

const ZIWEI_CONTEXTUAL_REFERENCE_RULES = [
  {
    source: '斗数玄微论',
    topic: '主宾强弱',
    palace: '命宫',
    starsAny: ['擎羊', '陀罗', '火星', '铃星', '七杀'],
    summary: '《玄微论》强调主强宾弱可保无虞，主弱宾强则凶危立见，命宫见煞更要回到整体承载力判断。',
    themes: ['mindset']
  },
  {
    source: '斗数玄微论',
    topic: '官禄合看迁移',
    palace: '官禄宫',
    summary: '《玄微论》断男命先看财福，再审迁移如何，说明事业与外部场域不能拆开判断。',
    themes: ['career']
  },
  {
    source: '斗数玄微论',
    topic: '财福并参',
    palace: '财帛宫',
    summary: '《玄微论》看财不只看财帛一宫，还要连同福德与迁移看钱如何来、如何留、如何耗。',
    themes: ['wealth']
  },
  {
    source: '重补斗数彀率',
    topic: '财印夹命',
    palace: '命宫',
    starsAny: ['紫微', '天府', '太阴'],
    summary: '《重补斗数彀率》强调身命为祸福之柄，命宫得财印夹辅时，更容易把资源转成现实稳定度。',
    themes: ['wealth', 'mindset']
  },
  {
    source: '重补斗数彀率',
    topic: '禄合守田',
    palace: '田宅宫',
    summary: '《重补斗数彀率》认为田宅与财帛要合看，守成与留存能力往往比一时进账更关键。',
    themes: ['wealth']
  },
  {
    source: '重补斗数彀率',
    topic: '财荫居迁移',
    palace: '迁移宫',
    starsAny: ['天梁', '天相', '天府'],
    summary: '《重补斗数彀率》把迁移位的资源与庇护看得很重，说明事业扩张常依赖外部平台与人脉承接。',
    themes: ['career', 'wealth']
  },
  {
    source: '斗数玄微论',
    topic: '夫子二宫',
    palace: '夫妻宫',
    summary: '《玄微论》看女命先观夫子二宫，看婚恋不能只抓夫妻宫一处，要兼看福德与整体稳定性。',
    themes: ['marriage']
  },
  {
    source: '斗数玄微论',
    topic: '福德主恢复',
    palace: '福德宫',
    summary: '《玄微论》强调命身与运限要互见，福德位往往直接反映一个人的恢复力与内在缓冲空间。',
    themes: ['health', 'mindset']
  },
  {
    source: '重补斗数彀率',
    topic: '巨暗同垣',
    palace: '疾厄宫',
    starsAny: ['巨门', '太阴'],
    summary: '《重补斗数彀率》提醒身命疾厄受暗曜牵动时，体能与恢复力容易先被拖慢，适合做长期管理。',
    themes: ['health']
  },
  {
    source: '斗数玄微论',
    topic: '命限看疾厄',
    palace: '疾厄宫',
    summary: '《玄微论》强调命身与运限要互见，疾厄位更适合看长期消耗、恢复节律与阶段性波动的承接能力。',
    themes: ['health']
  },
  {
    source: '斗数玄微论',
    topic: '限命互见',
    palace: '迁移宫',
    summary: '《玄微论》强调命临吉地、限逢吉曜与外部机会能否承接有关，迁移位常是阶段性突破的重要接口。',
    themes: ['career']
  }
];

const BAZI_REFERENCE_RULES = [
  {
    source: '子平真诠',
    topic: '月令为纲',
    summary: '《子平真诠》把月令与日主关系视为格局分析起点，先定主矛盾，再看其余干支如何成败用神。',
  },
  {
    source: '子平真诠',
    topic: '格局先后',
    summary: '书里强调原局先定结构，再看大运流年引发，不宜脱离原局单独谈年份吉凶。',
  },
  {
    source: '子平真诠',
    topic: '干支配合',
    summary: '书里反复强调通根、合化、制化与顺逆取用，说明八字不是单点判断，而是结构判断。',
  },
  {
    source: '滴天髓阐微',
    topic: '衰旺先辨',
    summary: '《滴天髓阐微》强调先辨日主衰旺与气势，再谈扶抑与从化，避免只看单个十神下结论。',
  },
  {
    source: '穷通宝鉴',
    topic: '调候先行',
    summary: '《穷通宝鉴》把月令寒暖燥湿视为重要前提，提醒判断不能脱离季节之气。',
  },
  {
    source: '三命通会',
    topic: '格局成败',
    summary: '《三命通会》重视格局成败与用神去留，适合用来补充结构层面的判断依据。',
  },
  {
    source: '渊海子平',
    topic: '十神成象',
    summary: '《渊海子平》常从十神成象入手，适合为财官印食伤的生活化表达提供旁证。',
  },
  {
    source: '千里命稿',
    topic: '案例归纳',
    summary: '《千里命稿》整理度较高，适合作为现代语境下的案例型补充依据。',
  },
  {
    source: '神峰通考',
    topic: '取用细辨',
    summary: '《神峰通考》强调取用细辨，提醒相近命局也可能因为通根与配合不同而走向不同结果。',
  },
];

const BAZI_MONTH_REFERENCE_RULES = {
  寅: {
    source: '穷通宝鉴',
    topic: '寅月调候',
    summary: '《穷通宝鉴》认为初春余寒未尽，木气虽动，仍要先顾寒暖与滋润，不宜只按旺木直断。',
    themes: ['health', 'mindset']
  },
  卯: {
    source: '穷通宝鉴',
    topic: '卯月木旺',
    summary: '《穷通宝鉴》强调卯月木旺更要看泄秀与扶抑是否得中，过旺未必就是好事。',
    themes: ['career', 'mindset']
  },
  辰: {
    source: '穷通宝鉴',
    topic: '辰月进退',
    summary: '《穷通宝鉴》把辰月视作季节交脱之际，气机进退比单点旺衰更重要。',
    themes: ['mindset']
  },
  巳: {
    source: '穷通宝鉴',
    topic: '巳月燥热',
    summary: '《穷通宝鉴》认为巳月火土渐燥，调候与润泽的重要性会明显上升。',
    themes: ['health']
  },
  午: {
    source: '穷通宝鉴',
    topic: '午月炎热',
    summary: '《穷通宝鉴》强调午月火势最盛，宜先看是否燥烈太过，再谈财官用舍。',
    themes: ['health', 'career']
  },
  未: {
    source: '穷通宝鉴',
    topic: '未月杂气',
    summary: '《穷通宝鉴》认为未月杂气相杂，调候、通根与十神结构需要并看，不能只取一端。',
    themes: ['mindset', 'health']
  },
  申: {
    source: '穷通宝鉴',
    topic: '申月金气',
    summary: '《穷通宝鉴》强调申月金气渐起，木火类命局更要看制化是否得当。',
    themes: ['career']
  },
  酉: {
    source: '穷通宝鉴',
    topic: '酉月收敛',
    summary: '《穷通宝鉴》认为酉月气机收敛，格局成败常在于资源是否还能流通而不板结。',
    themes: ['wealth', 'mindset']
  },
  戌: {
    source: '穷通宝鉴',
    topic: '戌月燥土',
    summary: '《穷通宝鉴》认为戌月燥土易使水木受困，适合优先观察润泽与疏通问题。',
    themes: ['health']
  },
  亥: {
    source: '穷通宝鉴',
    topic: '亥月寒水',
    summary: '《穷通宝鉴》强调亥月寒水渐重，火土是否得用会直接影响整局执行感。',
    themes: ['health', 'career']
  },
  子: {
    source: '穷通宝鉴',
    topic: '子月阴寒',
    summary: '《穷通宝鉴》把子月视作阴寒极点，调候与扶抑的先后顺序尤其关键。',
    themes: ['health', 'mindset']
  },
  丑: {
    source: '穷通宝鉴',
    topic: '丑月寒湿',
    summary: '《穷通宝鉴》认为丑月寒湿夹杂，常要同时处理停滞与承载不足两个问题。',
    themes: ['health', 'wealth']
  }
};

const BAZI_DAYMASTER_REFERENCE_RULES = {
  甲: {
    source: '滴天髓阐微',
    topic: '甲木参天',
    summary: '《滴天髓阐微》把甲木看作参天之木，强时宜泄其菁英，弱时先顾根气与火暖，不宜粗暴克伐。',
    themes: ['career', 'mindset']
  },
  乙: {
    source: '滴天髓阐微',
    topic: '乙木柔和',
    summary: '《滴天髓阐微》认为乙木最怕失去承接，喜见火暖与依附之根，顺势而生比强行拔高更有效。',
    themes: ['mindset', 'marriage']
  },
  丙: {
    source: '滴天髓阐微',
    topic: '丙火猛烈',
    summary: '《滴天髓阐微》强调丙火贵在有节，不怕明透，就怕燥烈太过而失去承载对象。',
    themes: ['career', 'health']
  },
  丁: {
    source: '滴天髓阐微',
    topic: '丁火柔明',
    summary: '《滴天髓阐微》认为丁火喜有木引、有土护，最忌孤火无依或被湿寒长期压制。',
    themes: ['health', 'mindset']
  },
  戊: {
    source: '滴天髓阐微',
    topic: '戊土高厚',
    summary: '《滴天髓阐微》强调戊土要辨燥湿与承载对象，厚重不等于稳，过塞反而难成事。',
    themes: ['career', 'wealth']
  },
  己: {
    source: '滴天髓阐微',
    topic: '己土包容',
    summary: '《滴天髓阐微》认为己土喜有火暖与水润，不宜长期受寒湿拖累，否则容易变成停滞型负担。',
    themes: ['health', 'wealth']
  },
  庚: {
    source: '滴天髓阐微',
    topic: '庚金刚决',
    summary: '《滴天髓阐微》强调庚金贵在火炼与裁成，过刚无制容易变成冲折，而非执行力。',
    themes: ['career', 'mindset']
  },
  辛: {
    source: '滴天髓阐微',
    topic: '辛金精细',
    summary: '《滴天髓阐微》认为辛金的价值在于精与清，环境太浊或压力太硬时反而不易发挥长处。',
    themes: ['career', 'marriage']
  },
  壬: {
    source: '滴天髓阐微',
    topic: '壬水奔流',
    summary: '《滴天髓阐微》把壬水视作大流之象，宜顺其势疏导，不宜逆堵成患。',
    themes: ['career', 'mindset']
  },
  癸: {
    source: '滴天髓阐微',
    topic: '癸水润泽',
    summary: '《滴天髓阐微》强调癸水的价值在润与通，太弱则干，太滞则阴湿难化。',
    themes: ['health', 'marriage']
  }
};

const TOPIC_DEFINITIONS = [
  { id: 'career', title: '事业主线', palaceNames: ['官禄', '迁移'], tenGods: ['正官', '七杀', '偏官', '正印'], focus: '把职责、节奏和外部机会放在同一条线上看。' },
  { id: 'wealth', title: '财运主线', palaceNames: ['财帛', '田宅'], tenGods: ['正财', '偏财', '食神', '伤官'], focus: '先看收入结构与资产处理方式，再看扩张空间。' },
  { id: 'marriage', title: '婚恋主线', palaceNames: ['夫妻'], tenGods: ['正官', '七杀', '正财', '偏财'], focus: '看亲密关系中的稳定性、边界和投入方式。' },
  { id: 'health', title: '健康主线', palaceNames: ['疾厄', '福德'], tenGods: ['偏印', '正印'], focus: '先看恢复力与长期消耗，再看阶段性波动。' },
  { id: 'mindset', title: '心性主线', palaceNames: ['命宫', '福德'], tenGods: ['比肩', '劫财', '偏印', '伤官'], focus: '把自我驱动、情绪惯性和思维模式放在一起理解。' },
];

const TOPIC_REFERENCE_RULES = [
  { id: 'career', source: '斗数玄微论', summary: '紫微体系看事业，不只看官禄宫本身，还要连同命宫、迁移与三方四正一起看承载力。', domain: 'ziwei' },
  { id: 'career', source: '子平真诠', summary: '八字体系看事业，先看原局结构是否允许承担职责，再看运限是否把机会真正推到台前。', domain: 'bazi' },
  { id: 'wealth', source: '重补斗数彀率', summary: '财帛与田宅不能分看，钱财节奏与资产留存经常是两套不同问题。', domain: 'ziwei' },
  { id: 'wealth', source: '渊海子平', summary: '财星不只代表钱，还代表资源调度与现实关系，宜结合身强身弱一起看。', domain: 'bazi' },
  { id: 'marriage', source: '女命骨髓赋', summary: '婚恋判断不宜只看一宫一星，要把命身、夫妻与福德的互动放在一起。', domain: 'ziwei' },
  { id: 'marriage', source: '千里命稿', summary: '关系稳定度往往来自原局结构和阶段运势共同作用，不能拿单一年份直接下结论。', domain: 'bazi' },
  { id: 'health', source: '斗数十喻歌', summary: '疾厄与福德并看时，更容易看出长期消耗是在身体先出现，还是在精神先出现。', domain: 'ziwei' },
  { id: 'health', source: '穷通宝鉴', summary: '寒暖燥湿不调时，健康问题经常先表现为节律和恢复能力失衡。', domain: 'bazi' },
  { id: 'mindset', source: '斗数观音经验谈', summary: '心性判断更适合看长期模式，不适合拿单一吉凶标签概括一个人。', domain: 'ziwei' },
  { id: 'mindset', source: '滴天髓阐微', summary: '心性与命局气势强相关，顺势与逆势的感受差异，往往先体现在人的精神负担上。', domain: 'bazi' },
];

const BAZI_TEN_GOD_REFERENCE_RULES = {
  正财: {
    source: '渊海子平',
    topic: '正财主务实',
    summary: '《渊海子平》看正财，更重持续经营、现实供给与可复制的资源管理。',
    themes: ['wealth', 'marriage'],
  },
  偏财: {
    source: '渊海子平',
    topic: '偏财主流动',
    summary: '《渊海子平》看偏财，更重机会捕捉、资源流动和对外部关系的调动能力。',
    themes: ['wealth', 'marriage'],
  },
  正官: {
    source: '神峰通考',
    topic: '正官主秩序',
    summary: '《神峰通考》看正官，更强调规则、职责与长期秩序是否能落到现实履约上。',
    themes: ['career', 'marriage'],
  },
  七杀: {
    source: '神峰通考',
    topic: '七杀主压力',
    summary: '《神峰通考》看七杀，不把压力直接当凶，而更看是否能驾驭约束、化压为权。',
    themes: ['career', 'marriage'],
  },
  偏官: {
    source: '神峰通考',
    topic: '偏官主竞争',
    summary: '《神峰通考》看偏官，更强调竞争、硬碰硬和对变化节奏的适应能力。',
    themes: ['career'],
  },
  食神: {
    source: '千里命稿',
    topic: '食神主产出',
    summary: '《千里命稿》看食神，更适合解释长期输出、稳定产能与养成型价值积累。',
    themes: ['career', 'wealth'],
  },
  伤官: {
    source: '千里命稿',
    topic: '伤官主开路',
    summary: '《千里命稿》看伤官，更强调表达、突破与自我开路，但也提醒其代价常是与秩序摩擦。',
    themes: ['career', 'wealth', 'mindset'],
  },
  正印: {
    source: '神峰通考',
    topic: '正印主护持',
    summary: '《神峰通考》看正印，更重学习、庇护与恢复系统是否成形。',
    themes: ['career', 'health'],
  },
  偏印: {
    source: '神峰通考',
    topic: '偏印主敏感',
    summary: '《神峰通考》看偏印，更重精神耗损、抽离感与非常规思路并存的结构。',
    themes: ['health', 'mindset'],
  },
  比肩: {
    source: '千里命稿',
    topic: '比肩主自持',
    summary: '《千里命稿》看比肩，更强调自我边界、平行竞争与不轻易让渡主导权。',
    themes: ['mindset'],
  },
  劫财: {
    source: '千里命稿',
    topic: '劫财主分流',
    summary: '《千里命稿》看劫财，更强调资源分流、合作博弈和行动上的直接冲劲。',
    themes: ['wealth', 'mindset'],
  },
};

const TEN_GOD_TOPIC_NOTES = {
  正官: {
    career: '正官偏重时，事业更容易围绕规则、职责和长期秩序展开。',
    marriage: '正官进入婚恋主题时，关系里更看重稳定、责任和可持续兑现。',
  },
  七杀: {
    career: '七杀偏重时，事业推进更依赖压力管理、决断力和对风险的驯化。',
    marriage: '七杀落入婚恋主题时，关系中的强度、边界和控制感会更突出。',
  },
  偏官: {
    career: '偏官偏重时，事业主题往往带有竞争性、变化快和硬碰硬的成分。',
  },
  正财: {
    wealth: '正财偏重时，更适合稳定现金流、持续经营和可复用资源积累。',
    marriage: '正财进入婚恋主题时，关系中的现实投入与长期供给感更重要。',
  },
  偏财: {
    wealth: '偏财偏重时，更适合看机会捕捉、人脉资源和外部流动性，而不是只看工资型收入。',
    marriage: '偏财进入婚恋主题时，关系判断更要防止节奏快、边界松和投入不均。',
  },
  食神: {
    wealth: '食神偏重时，财富更容易从长期输出、内容、产品和稳定复利里长出来。',
    career: '食神偏重时，事业更依赖持续产出而不是短期压强。',
  },
  伤官: {
    wealth: '伤官偏重时，财富主题更像靠突破、表达和自我开路获得空间。',
    mindset: '伤官偏重时，心性上常伴随强表达、强判断和不愿盲从的倾向。',
  },
  正印: {
    health: '正印偏重时，健康主题更强调恢复、滋养和稳定支持系统。',
    career: '正印偏重时，事业更依赖学习、体系和背后支撑，而不是前台冲锋。',
  },
  偏印: {
    health: '偏印偏重时，更要警惕精神消耗、过度抽离和节律打乱。',
    mindset: '偏印偏重时，心性常体现为敏感、内耗与强观察力并存。',
  },
  比肩: {
    mindset: '比肩偏重时，心性上更强调自持、自我边界和不愿轻易让渡主导权。',
  },
  劫财: {
    mindset: '劫财偏重时，心性上常伴随行动冲劲、资源竞争与对关系分配的敏感。',
    wealth: '劫财进入财运主题时，资源分流与合作博弈会更突出。',
  },
};

const RETRIEVAL_SNIPPETS = [
  { source: '斗数玄微论', domain: 'ziwei', keywords: ['官禄', '事业主线'], summary: '事业判断要连看命宫、官禄、迁移与三方四正，不能把职位感与承压能力拆开。', themes: ['career'] },
  { source: '重补斗数彀率', domain: 'ziwei', keywords: ['财帛', '财运主线'], summary: '财帛宫的聚散节奏与田宅宫的留存能力要分开判断，动财与守财是两种问题。', themes: ['wealth'] },
  { source: '女命骨髓赋', domain: 'ziwei', keywords: ['夫妻', '婚恋主线'], summary: '婚恋不只看一宫一星，更看命身与夫妻、福德之间是否形成长期稳定结构。', themes: ['marriage'] },
  { source: '斗数十喻歌', domain: 'ziwei', keywords: ['疾厄', '健康主线'], summary: '疾厄宫与福德宫同看时，往往能更早看出长期消耗是从身体还是从精神先起。', themes: ['health'] },
  { source: '斗数观音经验谈', domain: 'ziwei', keywords: ['命宫', '心性主线'], summary: '心性解读更适合看长期倾向与应对方式，不适合落成绝对吉凶标签。', themes: ['mindset'] },
  { source: '穷通宝鉴', domain: 'bazi', keywords: ['月令', '健康主线'], summary: '判断不能脱离季节寒暖燥湿，调候是否得宜会直接影响人的节律、恢复与执行手感。', themes: ['health', 'mindset'] },
  { source: '渊海子平', domain: 'bazi', keywords: ['偏财', '正财', '财运主线'], summary: '财星既是钱财，也代表资源与现实关系，必须连同日主承载力一并判断。', themes: ['wealth'] },
  { source: '千里命稿', domain: 'bazi', keywords: ['婚恋主线', '正官', '正财'], summary: '关系成败常由原局与运限共同推动，宜看长期结构，不宜只看某一年份的起落。', themes: ['marriage'] },
  { source: '滴天髓阐微', domain: 'bazi', keywords: ['甲日主', '心性主线'], summary: '强弱与气势决定了人的应对方式，同样的外部事件，顺势与逆势的体感差异很大。', themes: ['mindset'] },
  { source: '三命通会', domain: 'bazi', keywords: ['事业主线', '月令'], summary: '格局成败要先定原局，再看大运流年是否把机会真正引发，不宜只看单点年份。', themes: ['career'] },
];

const buildBaziTopicFocus = ({ topTenGods, climateAdvice, useSpiritAdvice, patternAdvice }) => {
  const topNames = topTenGods.map((item) => item.name);
  const focus = {
    marriage: [],
    health: [],
  };

  if (topNames.includes('正官')) {
    focus.marriage.push('官星进入婚恋主题时，更看长期责任、兑现能力与关系秩序。');
  }
  if (topNames.includes('七杀') || topNames.includes('偏官')) {
    focus.marriage.push('杀星进入婚恋主题时，要特别看强度、边界和控制感是否失衡。');
  }
  if (topNames.includes('正财') || topNames.includes('偏财')) {
    focus.marriage.push('财星进入婚恋主题时，现实投入、资源分配和节奏不均会成为关系里的关键变量。');
  }
  if (useSpiritAdvice.themes.includes('health')) {
    focus.health.push(`用神角度看，${useSpiritAdvice.summary}`);
  }
  if (climateAdvice.themes.includes('health')) {
    focus.health.push(`调候角度看，${climateAdvice.summary}`);
  }
  if (topNames.includes('正印') || topNames.includes('偏印')) {
    focus.health.push('印星进入健康主题时，更要看恢复、滋养、作息与精神负荷能否形成稳定支持。');
  }
  if (patternAdvice.themes.includes('marriage') && focus.marriage.length === 0) {
    focus.marriage.push(`结构角度看，${patternAdvice.summary}`);
  }
  if (patternAdvice.themes.includes('health') && focus.health.length === 0) {
    focus.health.push(`结构角度看，${patternAdvice.summary}`);
  }

  if (!focus.marriage.length) {
    focus.marriage.push('婚恋更适合回到长期结构看边界、投入和节奏是否稳定，不宜只按单一年份判断。');
  }
  if (!focus.health.length) {
    focus.health.push('健康更适合从恢复节律、精神耗损和长期消耗三条线并看。');
  }

  return focus;
};

const normalizeText = (text) => String(text || '')
  .replace(/<br\s*\/?>/gi, '；')
  .replace(/\s+/g, ' ')
  .trim();

const uniqueBy = (items, getKey) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const countTenGods = (pillars) => {
  const counts = {};

  pillars.forEach((pillar) => {
    [pillar.ganShiShen]
      .concat(pillar.hiddenShiShen || [])
      .filter(Boolean)
      .forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });
  });

  return counts;
};

const YANG_STEMS = new Set(['甲', '丙', '戊', '庚', '壬']);
const ROOT_BRANCHES = {
  木: ['寅', '卯', '亥', '辰', '未'],
  火: ['巳', '午', '寅', '未', '戌'],
  土: ['辰', '戌', '丑', '未', '巳', '午'],
  金: ['申', '酉', '丑', '戌', '巳'],
  水: ['亥', '子', '申', '辰', '丑'],
};
const STEM_COMBINATIONS = [
  ['甲', '己'],
  ['乙', '庚'],
  ['丙', '辛'],
  ['丁', '壬'],
  ['戊', '癸'],
];

const buildKnowledgeHit = ({ domain, sourceId, source, topic, summary, themes = [] }) => ({
  domain,
  sourceId,
  source,
  topic,
  summary: normalizeText(summary),
  themes,
});

const normalizePalaceName = (name) => String(name || '').replace(/宫$/, '');
const palaceMatches = (left, right) => normalizePalaceName(left) === normalizePalaceName(right);

const collectZiweiStage2Matches = (chapter) => {
  const stars = (chapter.majorStars || []).concat(chapter.supportStars || []);

  return ZIWEI_STAGE2_RULES.rules
    .filter((rule) => {
      if (!palaceMatches(rule.palace, chapter.sourcePalace)) {
        return false;
      }

      if (rule.starsAll && !rule.starsAll.every((star) => stars.includes(star))) {
        return false;
      }

      if (rule.starsAny && !rule.starsAny.some((star) => stars.includes(star))) {
        return false;
      }

      return true;
    })
    .map((rule) => buildKnowledgeHit({
      domain: 'ziwei',
      sourceId: ZIWEI_STAGE2_RULES.sourceId,
      source: ZIWEI_STAGE2_RULES.sourceTitle,
      topic: rule.topic,
      summary: rule.summary,
      themes: rule.themes,
    }));
};

const rootCountForDayMaster = (bazi) => {
  const branches = bazi.pillars.map((pillar) => pillar.zhi);
  const roots = ROOT_BRANCHES[bazi.dayMaster.element] || [];
  return branches.filter((branch) => roots.includes(branch)).length;
};

const stemCombinationHits = (bazi) => {
  const stems = bazi.pillars.map((pillar) => pillar.gan);

  return STEM_COMBINATIONS
    .filter(([left, right]) => stems.includes(left) && stems.includes(right))
    .map(([left, right]) => {
      const key = `${left}${right}`;
      return buildKnowledgeHit({
        domain: 'bazi',
        sourceId: BAZI_STAGE2_RULES.sourceId,
        source: BAZI_STAGE2_RULES.sourceTitle,
        topic: `${key}相合`,
        summary: BAZI_STAGE2_RULES.stemCombinations[key] || BAZI_STAGE2_RULES.principles.stemCombination,
        themes: ['mindset'],
      });
    });
};

const SEASON_BUCKETS = {
  spring: ['寅', '卯', '辰'],
  summer: ['巳', '午', '未'],
  autumn: ['申', '酉', '戌'],
  winter: ['亥', '子', '丑'],
};

const getSeasonBucket = (branch) => Object.entries(SEASON_BUCKETS)
  .find(([, branches]) => branches.includes(branch))?.[0] || '';

const inferClimateAdvice = (dayElement, monthBranch) => {
  const season = getSeasonBucket(monthBranch);

  if (season === 'winter' && ['木', '火'].includes(dayElement)) {
    return {
      topic: '调候偏向火土',
      summary: '冬令寒水偏重，当前更要先顾温暖与承载，让气机动起来，再谈财官发挥。',
      themes: ['health', 'career'],
      source: '穷通宝鉴',
    };
  }

  if (season === 'summer' && ['金', '水'].includes(dayElement)) {
    return {
      topic: '调候偏向水金',
      summary: '夏令火土偏燥，当前更要先顾润泽与降燥，让结构不至于因过热而失衡。',
      themes: ['health', 'mindset'],
      source: '穷通宝鉴',
    };
  }

  if (season === 'spring' && dayElement === '木') {
    return {
      topic: '调候兼看火水',
      summary: '春木已动，不宜只论木旺，通常要同时看火暖与水润是否并行，才能避免偏枯。',
      themes: ['career', 'health'],
      source: '穷通宝鉴',
    };
  }

  if (season === 'autumn' && dayElement === '金') {
    return {
      topic: '调候兼看火土',
      summary: '秋金当令，过于收敛时更要看火炼与土承是否得中，避免只剩硬而无用。',
      themes: ['career', 'wealth'],
      source: '穷通宝鉴',
    };
  }

  return {
    topic: '调候先看中和',
    summary: '当前更适合先看寒暖燥湿是否偏离，再判断扶抑与取用，不宜跳过气候层直接下结论。',
    themes: ['health', 'mindset'],
    source: '穷通宝鉴',
  };
};

const inferUseSpiritAdvice = ({ rootCount, topTenGods }) => {
  const topNames = topTenGods.map((item) => item.name);

  if (rootCount <= 1 && topNames.some((name) => ['正财', '偏财', '正官', '七杀', '偏官'].includes(name))) {
    return {
      topic: '用神倾向先扶身',
      summary: '当前更像“先稳住承载，再谈财官发挥”的结构，若过早追逐结果，反而容易透支本盘承压面。',
      themes: ['career', 'wealth', 'health'],
      source: '子平真诠',
    };
  }

  if (rootCount >= 2 && topNames.some((name) => ['食神', '伤官'].includes(name))) {
    return {
      topic: '用神倾向宜泄秀',
      summary: '当前结构更适合把已有能量导向表达、产出与项目落地，重点不是再补，而是把势能用出去。',
      themes: ['career', 'wealth'],
      source: '子平真诠',
    };
  }

  if (topNames.some((name) => ['正印', '偏印'].includes(name))) {
    return {
      topic: '用神倾向重印比',
      summary: '当前更适合先补足稳定、学习与恢复，再谈外部扩张，印比常是维持结构完整的关键接口。',
      themes: ['health', 'mindset'],
      source: '子平真诠',
    };
  }

  return {
    topic: '用神倾向重平衡',
    summary: '当前不宜把某一个十神当成唯一答案，更适合先看结构如何归于中和，再决定发力方向。',
    themes: ['mindset'],
    source: '子平真诠',
  };
};

const inferPatternAdvice = ({ rootCount, topTenGods }) => {
  const topNames = topTenGods.map((item) => item.name);

  if (topNames.includes('食神') && topNames.includes('伤官')) {
    return {
      topic: '格局倾向在食伤',
      summary: '本盘的表达、输出与自我驱动色彩较重，结构更容易从“做出来什么”而不是“先占住什么”体现价值。',
      themes: ['career', 'mindset'],
      source: '三命通会',
    };
  }

  if (topNames.some((name) => ['正财', '偏财'].includes(name)) && rootCount >= 2) {
    return {
      topic: '格局倾向在财用',
      summary: '本盘较容易把资源、关系与执行转成现实成果，但前提仍是结构不失衡，不能只看财多。',
      themes: ['wealth', 'career'],
      source: '渊海子平',
    };
  }

  if (topNames.some((name) => ['正官', '七杀', '偏官'].includes(name))) {
    return {
      topic: '格局倾向在官杀',
      summary: '本盘对职责、规范和外部压力较敏感，适合看“如何驾驭约束”，而不是简单把压力视作坏事。',
      themes: ['career', 'marriage'],
      source: '三命通会',
    };
  }

  return {
    topic: '格局倾向重结构',
    summary: '当前更适合把命局理解成多股力量之间的配合，而不是直接套一个单一格局名目。',
    themes: ['mindset'],
    source: '神峰通考',
  };
};

const makeReference = ({ domain, source, topic, summary, chapter, themes = [] }) => ({
  domain,
  source,
  topic,
  summary: normalizeText(summary),
  chapter: chapter || '',
  themes,
});

const collectZiweiContextualReferences = (chapter) => {
  const stars = (chapter.majorStars || []).concat(chapter.supportStars || []);

  return ZIWEI_CONTEXTUAL_REFERENCE_RULES
    .filter((rule) => {
      if (!palaceMatches(rule.palace, chapter.sourcePalace)) {
        return false;
      }
      if (rule.starsAny && !rule.starsAny.some((star) => stars.includes(star))) {
        return false;
      }
      return true;
    })
    .map((rule) => makeReference({
      domain: 'ziwei',
      source: rule.source,
      topic: rule.topic,
      summary: rule.summary,
      chapter: chapter.sourcePalace,
      themes: rule.themes || ['mindset'],
    }));
};

const buildZiweiKnowledge = (chapters) => {
  const hits = [];
  const references = [];
  const promptLines = [];

  const nextChapters = chapters.map((chapter) => {
    const palaceName = chapter.sourcePalace;
    const stage1Matches = chapter.majorStars
      .map((star) => {
        const summary = ZIWEI_RULES.entries[star]?.[palaceName];

        if (!summary) {
          return null;
        }

        return {
          domain: 'ziwei',
          sourceId: ZIWEI_RULES.sourceId,
          source: ZIWEI_RULES.sourceTitle,
          topic: `${star}在${palaceName}`,
          summary: normalizeText(summary),
        };
      })
      .filter(Boolean)
      .slice(0, 2);
    const stage2Matches = collectZiweiStage2Matches(chapter).slice(0, 2);
    const starMatches = stage1Matches.concat(stage2Matches).slice(0, 3);

    hits.push(...starMatches);
    promptLines.push(...starMatches.map((item) => `${item.source}：${item.topic} -> ${item.summary}`));

    ZIWEI_REFERENCE_RULES.forEach((rule) => {
      if (!palaceMatches(rule.palace, palaceName)) {
        return;
      }

      if (rule.stars.length && !chapter.majorStars.some((star) => rule.stars.includes(star))) {
        return;
      }

      references.push(makeReference({
        domain: 'ziwei',
        source: rule.source,
        topic: rule.topic,
        summary: rule.summary,
        chapter: palaceName,
        themes: stage2Matches.flatMap((item) => item.themes || []).length
          ? uniqueBy(stage2Matches.flatMap((item) => item.themes || []).map((theme) => ({ theme })), (item) => item.theme).map((item) => item.theme)
          : ['mindset'],
      }));
    });
    references.push(...collectZiweiContextualReferences(chapter));

    if (!starMatches.length) {
      const chapterReferences = uniqueBy(
        references.filter((item) => item.chapter === palaceName),
        (item) => `${item.source}:${item.topic}`,
      ).slice(-3);
      return {
        ...chapter,
        references: chapterReferences,
      };
    }

    const mergedBody = `${chapter.summary} 书中对应：${starMatches.map((item) => `${item.topic}，${item.summary}`).join('；')}`;
    const chapterReferences = uniqueBy(
      references.filter((item) => item.chapter === palaceName),
      (item) => `${item.source}:${item.topic}`,
    ).slice(-3);

    return {
      ...chapter,
      summary: mergedBody,
      knowledgeHits: starMatches,
      references: chapterReferences,
    };
  });

  return {
    chapters: nextChapters,
    hits,
    references,
    promptLines,
  };
};

const buildBaziKnowledge = (bazi) => {
  const hits = [];
  const references = BAZI_REFERENCE_RULES.map((item) => makeReference({
    domain: 'bazi',
    source: item.source,
    topic: item.topic,
    summary: item.summary,
    chapter: '八字基础',
    themes: ['mindset'],
  }));
  const promptLines = [];
  const counts = countTenGods(bazi.pillars);
  const topTenGods = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      count,
      summary: BAZI_RULES.tenGods[name],
    }))
    .filter((item) => item.summary);

  const dayMasterSummary = BAZI_RULES.dayMasters[bazi.dayMaster.stem] || '';
  const elementSummary = BAZI_RULES.elements[bazi.dayMaster.element] || '';
  const monthPillar = bazi.pillars.find((pillar) => pillar.label === '月柱');
  const isYangDayMaster = YANG_STEMS.has(bazi.dayMaster.stem);
  const rootCount = rootCountForDayMaster(bazi);
  const monthReferenceRule = BAZI_MONTH_REFERENCE_RULES[monthPillar?.zhi];
  const dayMasterReferenceRule = BAZI_DAYMASTER_REFERENCE_RULES[bazi.dayMaster.stem];
  const climateAdvice = inferClimateAdvice(bazi.dayMaster.element, monthPillar?.zhi);
  const useSpiritAdvice = inferUseSpiritAdvice({ rootCount, topTenGods });
  const patternAdvice = inferPatternAdvice({ rootCount, topTenGods });
  const topicFocus = buildBaziTopicFocus({ topTenGods, climateAdvice, useSpiritAdvice, patternAdvice });

  if (dayMasterSummary) {
    hits.push(buildKnowledgeHit({
      domain: 'bazi',
      sourceId: BAZI_RULES.sourceId,
      source: BAZI_RULES.sourceTitle,
      topic: `${bazi.dayMaster.stem}日主`,
      summary: dayMasterSummary,
    }));
    promptLines.push(`${BAZI_RULES.sourceTitle}：${bazi.dayMaster.stem}日主 -> ${dayMasterSummary}`);
  }

  if (elementSummary) {
    hits.push(buildKnowledgeHit({
      domain: 'bazi',
      sourceId: BAZI_RULES.sourceId,
      source: BAZI_RULES.sourceTitle,
      topic: `${bazi.dayMaster.element}五行`,
      summary: elementSummary,
    }));
    promptLines.push(`${BAZI_RULES.sourceTitle}：${bazi.dayMaster.element}五行 -> ${elementSummary}`);
  }

  topTenGods.forEach((item) => {
    hits.push(buildKnowledgeHit({
      domain: 'bazi',
      sourceId: BAZI_RULES.sourceId,
      source: BAZI_RULES.sourceTitle,
      topic: `${item.name}偏重`,
      summary: `${item.summary} 本盘出现 ${item.count} 次。`,
    }));
    promptLines.push(`${BAZI_RULES.sourceTitle}：${item.name}偏重 -> ${item.summary} 出现${item.count}次。`);

    const extraRule = BAZI_TEN_GOD_REFERENCE_RULES[item.name];
    if (extraRule) {
      references.push(makeReference({
        domain: 'bazi',
        source: extraRule.source,
        topic: extraRule.topic,
        summary: `${extraRule.summary} 当前本盘 ${item.name} 出现 ${item.count} 次。`,
        chapter: '八字基础',
        themes: extraRule.themes,
      }));
      promptLines.push(`${extraRule.source}：${extraRule.topic} -> ${extraRule.summary} 当前${item.name}${item.count}次。`);
    }
  });

  const monthOrderHit = buildKnowledgeHit({
    domain: 'bazi',
    sourceId: BAZI_STAGE2_RULES.sourceId,
    source: BAZI_STAGE2_RULES.sourceTitle,
    topic: `${monthPillar?.zhi || ''}月令为纲`,
    summary: BAZI_STAGE2_RULES.principles.monthOrder,
    themes: ['mindset'],
  });
  hits.push(monthOrderHit);
  promptLines.push(`${monthOrderHit.source}：${monthOrderHit.topic} -> ${monthOrderHit.summary}`);

  const polarityHit = buildKnowledgeHit({
    domain: 'bazi',
    sourceId: BAZI_STAGE2_RULES.sourceId,
    source: BAZI_STAGE2_RULES.sourceTitle,
    topic: isYangDayMaster ? `${bazi.dayMaster.stem}属阳干` : `${bazi.dayMaster.stem}属阴干`,
    summary: isYangDayMaster
      ? BAZI_STAGE2_RULES.principles.yangStem
      : BAZI_STAGE2_RULES.principles.yinStem,
    themes: ['mindset'],
  });
  hits.push(polarityHit);
  promptLines.push(`${polarityHit.source}：${polarityHit.topic} -> ${polarityHit.summary}`);

  if (rootCount >= 2) {
    const rootHit = buildKnowledgeHit({
      domain: 'bazi',
      sourceId: BAZI_STAGE2_RULES.sourceId,
      source: BAZI_STAGE2_RULES.sourceTitle,
      topic: `${bazi.dayMaster.stem}日主通根`,
      summary: `${BAZI_STAGE2_RULES.principles.rootedDayMaster} 本盘可见 ${rootCount} 处根气落点。`,
      themes: ['mindset', 'career'],
    });
    hits.push(rootHit);
    promptLines.push(`${rootHit.source}：${rootHit.topic} -> ${rootHit.summary}`);
  }

  stemCombinationHits(bazi).forEach((item) => {
    hits.push(item);
    promptLines.push(`${item.source}：${item.topic} -> ${item.summary}`);
  });

  [climateAdvice, useSpiritAdvice, patternAdvice].forEach((advice) => {
    const hit = buildKnowledgeHit({
      domain: 'bazi',
      sourceId: advice.source === '穷通宝鉴'
        ? 'bazi-qiongtong'
        : advice.source === '子平真诠'
          ? 'bazi-zipingzhenquan'
          : advice.source === '三命通会'
            ? 'bazi-sanmingtonghui'
            : advice.source === '渊海子平'
              ? 'bazi-yuanhaiziping'
              : 'bazi-shenfengtongkao',
      source: advice.source,
      topic: advice.topic,
      summary: advice.summary,
      themes: advice.themes,
    });
    hits.push(hit);
    promptLines.push(`${hit.source}：${hit.topic} -> ${hit.summary}`);
    references.push(makeReference({
      domain: 'bazi',
      source: advice.source,
      topic: advice.topic,
      summary: advice.summary,
      chapter: '八字基础',
      themes: advice.themes,
    }));
  });

  if (monthReferenceRule) {
    references.push(makeReference({
      domain: 'bazi',
      source: monthReferenceRule.source,
      topic: monthReferenceRule.topic,
      summary: monthReferenceRule.summary,
      chapter: '八字基础',
      themes: monthReferenceRule.themes,
    }));
  }

  if (dayMasterReferenceRule) {
    references.push(makeReference({
      domain: 'bazi',
      source: dayMasterReferenceRule.source,
      topic: dayMasterReferenceRule.topic,
      summary: dayMasterReferenceRule.summary,
      chapter: '八字基础',
      themes: dayMasterReferenceRule.themes,
    }));
  }

  const bodyParts = [
    `${bazi.dayMaster.stem}${bazi.dayMaster.element}日主：${dayMasterSummary || '暂未命中日主规则。'}`,
    `${bazi.dayMaster.element}五行：${elementSummary || '暂未命中五行规则。'}`,
    `月令主线：${monthPillar?.ganzhi || '-'}，${BAZI_STAGE2_RULES.principles.monthOrder}`,
    isYangDayMaster
      ? `阴阳干法：${BAZI_STAGE2_RULES.principles.yangStem}`
      : `阴阳干法：${BAZI_STAGE2_RULES.principles.yinStem}`,
    `调候判断：${climateAdvice.summary}`,
    `用神倾向：${useSpiritAdvice.summary}`,
    `格局倾向：${patternAdvice.summary}`,
    rootCount >= 2
      ? `通根判断：${BAZI_STAGE2_RULES.principles.rootedDayMaster} 当前可见 ${rootCount} 处根气。`
      : '通根判断：当前根气仍需结合月令与全局再看。',
    topTenGods.length
      ? `十神重点：${topTenGods.map((item) => `${item.name}(${item.count})，${item.summary}`).join('；')}`
      : '十神重点：暂未形成清晰偏向。',
  ];

  return {
    chapter: {
      palace: '八字基础',
      sourcePalace: '八字基础',
      branch: '',
      decadalRange: [],
      themes: ['日主定位', '五行取向', '十神偏重'],
      majorStars: [],
      supportStars: [],
      mutagens: [],
      summary: bodyParts.join(' '),
      promptContext: [
        `日主：${bazi.dayMaster.stem}${bazi.dayMaster.element}`,
        `四柱：${bazi.eightChar}`,
        `调候：${climateAdvice.topic}`,
        `用神：${useSpiritAdvice.topic}`,
        `格局：${patternAdvice.topic}`,
        ...topTenGods.map((item) => `${item.name}出现${item.count}次`),
      ],
      knowledgeHits: hits,
      references: uniqueBy(references, (item) => `${item.source}:${item.topic}`).slice(0, 10),
      topicFocus,
    },
    hits,
    references: uniqueBy(references, (item) => `${item.source}:${item.topic}`),
    promptLines,
  };
};

const buildTopicSections = ({ chapters, baziChapter, references, knowledgeHits }) => {
  const chapterPool = [baziChapter].concat(chapters);
  const tenGodHits = (baziChapter.knowledgeHits || [])
    .filter((item) => item.topic.endsWith('偏重'))
    .map((item) => item.topic.replace(/偏重$/, ''));

  return TOPIC_DEFINITIONS.map((topic) => {
    const relatedChapters = chapterPool.filter((chapter) => topic.palaceNames.includes(chapter.sourcePalace));
    const relatedHits = knowledgeHits.filter((item) => (item.themes || []).includes(topic.id));
    const relatedRefs = uniqueBy(references
      .concat(TOPIC_REFERENCE_RULES
        .filter((item) => item.id === topic.id)
        .map((item) => makeReference({
          domain: item.domain,
          source: item.source,
          topic: topic.title,
          summary: item.summary,
          chapter: topic.title,
          themes: [topic.id],
        })))
      .filter((item) => (item.themes || []).includes(topic.id) || item.chapter === topic.title)
      , (item) => item.source).slice(0, 4);

    const tenGodNotes = tenGodHits
      .map((name) => TEN_GOD_TOPIC_NOTES[name]?.[topic.id])
      .filter(Boolean)
      .slice(0, 2);
    const baziFocusNotes = (baziChapter.topicFocus?.[topic.id] || []).slice(0, 2);

    const chapterSummary = relatedChapters.length
      ? relatedChapters.map((chapter) => `${chapter.palace}：${chapter.summary}`).slice(0, 2).join(' ')
      : `${topic.focus} 当前主要从八字结构和运限节奏侧面判断。`;

    const cues = [];
    const topicTenGods = topic.tenGods.filter((name) => tenGodHits.includes(name));
    if (topicTenGods.length) {
      cues.push(`十神侧重点落在${topicTenGods.join('、')}`);
    }
    if (relatedHits.length) {
      cues.push(`知识命中：${relatedHits.slice(0, 2).map((item) => item.topic).join('、')}`);
    }
    cues.push(...tenGodNotes);
    cues.push(...baziFocusNotes);

    return {
      id: topic.id,
      title: topic.title,
      focus: topic.focus,
      summary: tenGodNotes.length
        ? `${chapterSummary} ${tenGodNotes.concat(baziFocusNotes).join(' ')}`
        : baziFocusNotes.length
          ? `${chapterSummary} ${baziFocusNotes.join(' ')}`
        : chapterSummary,
      cues: cues.length ? cues : ['当前以原局结构与运限节奏做综合判断。'],
      references: relatedRefs,
    };
  });
};

const buildRetrievalContext = ({ knowledgeHits, topics, chapters }) => {
  const keywordPool = new Set(
    knowledgeHits.map((item) => item.topic)
      .concat(topics.map((item) => item.title))
      .concat(chapters.map((item) => item.sourcePalace))
  );

  return RETRIEVAL_SNIPPETS
    .filter((snippet) => snippet.keywords.some((keyword) => keywordPool.has(keyword)))
    .map((snippet) => ({
      source: snippet.source,
      domain: snippet.domain,
      summary: snippet.summary,
      themes: snippet.themes,
    }))
    .filter((item, index, list) => list.findIndex((other) => other.source === item.source) === index)
    .slice(0, 6);
};

const buildKnowledgeProfile = ({ chapters, bazi }) => {
  const ziwei = buildZiweiKnowledge(chapters);
  const baziKnowledge = buildBaziKnowledge(bazi);
  const allReferences = uniqueBy(
    ziwei.references.concat(baziKnowledge.references),
    (item) => `${item.source}:${item.topic}`,
  );
  const knowledgeHits = uniqueBy(
    baziKnowledge.hits.concat(ziwei.hits),
    (item) => `${item.source}:${item.topic}:${item.summary}`,
  ).slice(0, 12);
  const topics = buildTopicSections({
    chapters: ziwei.chapters,
    baziChapter: baziKnowledge.chapter,
    references: allReferences,
    knowledgeHits,
  });
  const references = allReferences.slice(0, 12);
  const retrieval = buildRetrievalContext({
    knowledgeHits,
    topics,
    chapters: [baziKnowledge.chapter].concat(ziwei.chapters),
  });

  return {
    meta: {
      version: CATALOG_SUMMARY.version,
      updatedAt: CATALOG_SUMMARY.updatedAt,
      activeDomains: CATALOG_SUMMARY.activeDomains,
      stageOneSources: CATALOG_SUMMARY.stageOneSources,
      catalog: CATALOG_SUMMARY,
      activeBooks: ACTIVE_BOOKS,
    },
    chapters: [baziKnowledge.chapter].concat(ziwei.chapters),
    references,
    knowledgeHits,
    topics,
    retrieval,
    promptLines: baziKnowledge.promptLines
      .concat(ziwei.promptLines)
      .concat(retrieval.map((item) => `${item.source}：${item.summary}`))
      .slice(0, 24),
  };
};

module.exports = {
  buildKnowledgeProfile,
};
