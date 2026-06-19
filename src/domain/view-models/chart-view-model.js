// 命盘页 view model：把 astrolabeData 的原始排盘字段翻成手机端可渲染结构。
// 面向"懂行用户"的工具页：基础信息 / 重点宫位 / 十二宫列表（可按主题筛选）/ 格局标签。

const PALACE_THEME = {
  命宫: 'mindset',
  兄弟: 'network',
  夫妻: 'relationship',
  子女: 'family',
  财帛: 'wealth',
  疾厄: 'health',
  迁移: 'career',
  仆役: 'network',
  官禄: 'career',
  田宅: 'wealth',
  福德: 'health',
  父母: 'family',
};

const THEME_LABELS = {
  career: '事业',
  wealth: '财富',
  relationship: '关系',
  health: '健康',
  mindset: '心态',
  family: '家庭',
  network: '人际',
};

const THEME_ORDER = ['career', 'wealth', 'relationship', 'health', 'mindset', 'family', 'network'];

const PALACE_ORDER = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

const starName = (star) => star?.name || '';

const collectMutagens = (palace) => [palace.majorStars, palace.minorStars, palace.adjectiveStars]
  .flat()
  .filter((star) => star && star.mutagen)
  .map((star) => `${star.name}化${star.mutagen}`);

const orderPalaces = (palaces) => [...palaces].sort(
  (a, b) => PALACE_ORDER.indexOf(a.name) - PALACE_ORDER.indexOf(b.name),
);

export const createChartViewModel = (state) => {
  const data = state.astrolabeData;
  if (!data) {
    return { ready: false, title: '命盘', emptyText: '先生成命盘，这里会列出十二宫与格局。' };
  }

  const summary = data.summary || {};
  const palaces = data.palaces || [];
  const horoscope = data.horoscope || {};
  const currentAge = Number(horoscope.currentAge);
  const filter = state.ui.chartThemeFilter || 'all';

  const basics = [
    { label: '性别', value: summary.gender },
    { label: '阳历', value: summary.solarDate },
    { label: '农历', value: summary.lunarDate },
    { label: '四柱', value: summary.chineseDate },
    { label: '时辰', value: `${summary.time || ''}${summary.timeRange ? ` (${summary.timeRange})` : ''}` },
    { label: '生肖 / 星座', value: [summary.zodiac, summary.sign].filter(Boolean).join(' · ') },
    { label: '五行局', value: summary.fiveElementsClass },
    { label: '命主 / 身主', value: [summary.soul, summary.body].filter(Boolean).join(' / ') },
    { label: '当前年龄', value: Number.isFinite(currentAge) ? `${currentAge} 岁` : '' },
  ].filter((item) => item.value);

  const decadalPalace = palaces.find((palace) => {
    const range = palace.decadal?.range || [];
    return range.length === 2 && Number.isFinite(currentAge)
      && currentAge >= range[0] && currentAge <= range[1];
  });

  const cards = orderPalaces(palaces).map((palace) => {
    const themeId = PALACE_THEME[palace.name] || null;
    const isDecadal = decadalPalace && palace.index === decadalPalace.index;
    return {
      index: palace.index,
      name: palace.name,
      ganzhi: `${palace.stem || ''}${palace.branch || ''}`,
      themeId,
      themeLabel: themeId ? THEME_LABELS[themeId] : '',
      isSoul: palace.name === '命宫',
      isBody: Boolean(palace.isBodyPalace),
      isDecadal: Boolean(isDecadal),
      majorStars: (palace.majorStars || []).map((star) => ({
        name: star.name,
        brightness: star.brightness || '',
        mutagen: star.mutagen || '',
      })),
      minorStars: (palace.minorStars || []).map(starName).filter(Boolean),
      adjectiveStars: (palace.adjectiveStars || []).map(starName).filter(Boolean),
      mutagens: collectMutagens(palace),
      decadalRange: palace.decadal?.range || [],
      empty: !(palace.majorStars || []).length,
    };
  });

  const counts = cards.reduce((acc, card) => {
    if (card.themeId) acc[card.themeId] = (acc[card.themeId] || 0) + 1;
    return acc;
  }, {});

  const filters = [{ id: 'all', label: '全部', count: cards.length }]
    .concat(THEME_ORDER
      .filter((id) => counts[id])
      .map((id) => ({ id, label: THEME_LABELS[id], count: counts[id] })));

  const visibleCards = filter === 'all' ? cards : cards.filter((card) => card.themeId === filter);

  const highlights = [
    { label: '命宫', palace: cards.find((card) => card.isSoul) },
    { label: '身宫', palace: cards.find((card) => card.isBody) },
    { label: '当前大运', palace: cards.find((card) => card.isDecadal), extra: decadalPalace?.decadal?.range?.join('–') },
  ].filter((item) => item.palace);

  const patterns = (data.reading?.patterns || []).map((item) => ({
    name: item.name,
    verdict: item.verdict || '',
  }));

  return {
    ready: true,
    title: '命盘',
    subtitle: '紫微十二宫与八字四柱的结构盘面，供查阅依据。',
    basics,
    highlights,
    filters,
    activeFilter: filter,
    cards: visibleCards,
    patterns,
  };
};
