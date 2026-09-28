// 「我适合戴什么」延伸解读：把后端 reading.fiveElement（喜用五行）翻译成
// 适合的材质 / 颜色方向，并把「为什么这么选」的推理链讲清楚。
// 这里只做命盘的生活化延伸，不接电商、不放购买链接、
// 不写"必转运 / 必招财 / 挡灾"一类承诺（见 mingli-product-design-detail §11 文案约束）。

// 每个五行的性情、对应色，以及按「颜色 + 质地」归到该五行的几类材质。
// 分类覆盖玉石 / 水晶矿石 / 木质 / 金属 / 树脂有机，挑顺手的一类即可。
const ELEMENT_PROFILE = {
  木: {
    color: '青绿色系',
    nature: '生发、条达',
    vibe: '舒展、向上，适合想让节奏松一点、心气往前走的时候。',
    categories: [
      { type: '玉石', items: ['翡翠（绿）', '和田碧玉', '东陵玉'], why: '青绿色玉质温润，色属东方木，贴身能呼应草木生发之气。' },
      { type: '水晶矿石', items: ['绿幽灵', '绿松石', '孔雀石'], why: '绿色晶体色应木，纹理像枝叶舒展，木气直观。' },
      { type: '木质', items: ['绿檀', '黄杨木', '崖柏'], why: '木珠本身即是木，是最直接的木气载体，菩提、橄榄核同理。' },
    ],
  },
  火: {
    color: '红 / 紫红色系',
    nature: '温热、升腾',
    vibe: '温度与行动力，适合想提一提劲头、把事推起来的时候。',
    categories: [
      { type: '水晶矿石', items: ['南红玛瑙', '石榴石', '草莓晶'], why: '赤红色矿石色应南方火，是温度感最足的一类。' },
      { type: '玉石', items: ['红翡', '鸡血石'], why: '红色玉料同属火，质地温润，红得不张扬。' },
      { type: '木质', items: ['小叶紫檀', '血龙木', '红酸枝'], why: '红木色赤而木生火，兼有木火相生之意。' },
    ],
  },
  土: {
    color: '土黄 / 暖棕色系',
    nature: '承载、聚拢',
    vibe: '踏实、攒得住，适合想稳住摊子、把资源聚起来的时候。',
    categories: [
      { type: '水晶矿石', items: ['黄水晶', '虎眼石', '黄玉'], why: '土黄色晶石色应中央土，沉稳、聚气。' },
      { type: '树脂有机', items: ['蜜蜡', '琥珀'], why: '蜜蜡琥珀色暖近土，质地温厚，戴着安稳。' },
      { type: '玉石', items: ['黄龙玉', '黄口和田玉'], why: '黄色玉质归土，温润而不轻浮。' },
    ],
  },
  金: {
    color: '白 / 银色系',
    nature: '收敛、清利',
    vibe: '清透、利落，适合想理清头绪、让判断更干脆的时候。',
    categories: [
      { type: '金属', items: ['银', '钛钢', '足金'], why: '金属本身即是金，是最直接的金气载体。' },
      { type: '玉石', items: ['和田白玉', '羊脂玉'], why: '白色玉料色应西方金，清透、收敛。' },
      { type: '水晶矿石', items: ['白水晶', '月光石', '银曜石'], why: '白银色晶体色应金，质地清明利落。' },
    ],
  },
  水: {
    color: '黑 / 深蓝色系',
    nature: '润下、流动',
    vibe: '沉静、能缓住，适合想缓一缓、把心定下来的时候。',
    categories: [
      { type: '水晶矿石', items: ['黑曜石', '海蓝宝', '青金石'], why: '黑、深蓝色应北方水，沉静而内敛。' },
      { type: '玉石', items: ['墨玉', '蓝田玉'], why: '墨色玉质归水，质重而润。' },
      { type: '金属', items: ['乌银', '黑钢'], why: '深色金属色近玄水，且金能生水，作点缀相宜。' },
    ],
  },
};

const ROLE_LABEL = ['首选方向', '搭配方向'];
const ROLE_NOTE = [
  '可以作为日常主色灵感，并不是必须补足的五行。',
  '是另一种可选配色，可单独使用或少量点缀，不代表与首选必然相生。',
];

const PRINCIPLE = '这里按可见颜色提供五行搭配灵感：青绿属木、红紫属火、黄棕属土、白银属金、黑蓝属水。材质不用于判定效果；已有的衣服、包或表带都可以，不必购买贵重饰品。';

export const createAccessoryViewModel = (state) => {
  const data = state.astrolabeData;
  if (!data) {
    return {
      ready: false,
      emptyText: '先生成命盘，就能查看八字调候配色参考。暂时不填也可以看今日通用色卡。',
    };
  }

  const guide = data.reading?.fiveElement;
  if (!guide || !guide.favored?.length) {
    return {
      ready: false,
      emptyText: '当前命盘缺少配色参考数据，请重新生成命盘；也可以先看通用色卡。',
    };
  }

  const favored = guide.favored.filter((element) => ELEMENT_PROFILE[element]);
  if (!favored.length) return { ready: false, emptyText: '配色参考数据暂不可用，请重新生成命盘或查看通用色卡。' };
  const items = favored.map((element, index) => {
    const profile = ELEMENT_PROFILE[element];
    return {
      element,
      role: ROLE_LABEL[index] || '可选方向',
      color: profile.color,
      reason: `「${element}」在五行里主${profile.nature}，对应${profile.color}。${ROLE_NOTE[index] || ''}`,
      categories: profile.categories,
      vibe: profile.vibe,
    };
  });

  // 推理链：日主 → 当月调候缺什么 → 该补哪几气（basis 已含书目依据）。
  const intro = `你是「${guide.dayElement}」日主。参考色系为${favored.join('、')}。依据出生的日干与月支作简化调候取色，不等同完整喜用判断，也不表示你缺这些五行。喜欢、舒适和实际场合更重要。`;

  return {
    ready: true,
    dayElement: guide.dayElement,
    basis: '按出生的日干与月支查询项目整理的调候表；不作为完整八字喜用结论。',
    source: guide.source || '',
    intro,
    principle: PRINCIPLE,
    items,
    howto: '贴身常戴就行，颜色、材质对上即可，不必追求贵重——戴着顺眼、心里安定，比什么都重要。',
    disclaimer: '八字调候配色仅供民俗与审美参考，不承诺转运或改善收益。',
  };
};
