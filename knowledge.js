const META = require('./data/knowledge-meta.json');
const ZIWEI_RULES = require('./data/knowledge-rules/ziwei-handbook-stage1.json');
const BAZI_RULES = require('./data/knowledge-rules/bazi-basics-stage1.json');

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
];

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

const buildZiweiKnowledge = (chapters) => {
  const hits = [];
  const references = [];
  const promptLines = [];

  const nextChapters = chapters.map((chapter) => {
    const palaceName = chapter.sourcePalace;
    const starMatches = chapter.majorStars
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

    hits.push(...starMatches);
    promptLines.push(...starMatches.map((item) => `${item.source}：${item.topic} -> ${item.summary}`));

    ZIWEI_REFERENCE_RULES.forEach((rule) => {
      if (rule.palace !== palaceName) {
        return;
      }

      if (rule.stars.length && !chapter.majorStars.some((star) => rule.stars.includes(star))) {
        return;
      }

      references.push({
        domain: 'ziwei',
        source: rule.source,
        topic: rule.topic,
        summary: rule.summary,
      });
    });

    if (!starMatches.length) {
      return chapter;
    }

    const mergedBody = `${chapter.summary} 书中对应：${starMatches.map((item) => `${item.topic}，${item.summary}`).join('；')}`;

    return {
      ...chapter,
      summary: mergedBody,
      knowledgeHits: starMatches,
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
  const references = [...BAZI_REFERENCE_RULES];
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

  if (dayMasterSummary) {
    hits.push({
      domain: 'bazi',
      sourceId: BAZI_RULES.sourceId,
      source: BAZI_RULES.sourceTitle,
      topic: `${bazi.dayMaster.stem}日主`,
      summary: dayMasterSummary,
    });
    promptLines.push(`${BAZI_RULES.sourceTitle}：${bazi.dayMaster.stem}日主 -> ${dayMasterSummary}`);
  }

  if (elementSummary) {
    hits.push({
      domain: 'bazi',
      sourceId: BAZI_RULES.sourceId,
      source: BAZI_RULES.sourceTitle,
      topic: `${bazi.dayMaster.element}五行`,
      summary: elementSummary,
    });
    promptLines.push(`${BAZI_RULES.sourceTitle}：${bazi.dayMaster.element}五行 -> ${elementSummary}`);
  }

  topTenGods.forEach((item) => {
    hits.push({
      domain: 'bazi',
      sourceId: BAZI_RULES.sourceId,
      source: BAZI_RULES.sourceTitle,
      topic: `${item.name}偏重`,
      summary: `${item.summary} 本盘出现 ${item.count} 次。`,
    });
    promptLines.push(`${BAZI_RULES.sourceTitle}：${item.name}偏重 -> ${item.summary} 出现${item.count}次。`);
  });

  const bodyParts = [
    `${bazi.dayMaster.stem}${bazi.dayMaster.element}日主：${dayMasterSummary || '暂未命中日主规则。'}`,
    `${bazi.dayMaster.element}五行：${elementSummary || '暂未命中五行规则。'}`,
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
        ...topTenGods.map((item) => `${item.name}出现${item.count}次`),
      ],
      knowledgeHits: hits,
    },
    hits,
    references,
    promptLines,
  };
};

const buildKnowledgeProfile = ({ chapters, bazi }) => {
  const ziwei = buildZiweiKnowledge(chapters);
  const baziKnowledge = buildBaziKnowledge(bazi);
  const references = uniqueBy(
    ziwei.references.concat(baziKnowledge.references),
    (item) => `${item.source}:${item.topic}`,
  ).slice(0, 8);
  const knowledgeHits = uniqueBy(
    baziKnowledge.hits.concat(ziwei.hits),
    (item) => `${item.source}:${item.topic}:${item.summary}`,
  ).slice(0, 12);

  return {
    meta: {
      version: META.version,
      activeDomains: META.activeDomains,
      stageOneSources: META.stageOneSources,
    },
    chapters: [baziKnowledge.chapter].concat(ziwei.chapters),
    references,
    knowledgeHits,
    promptLines: baziKnowledge.promptLines.concat(ziwei.promptLines).slice(0, 18),
  };
};

module.exports = {
  buildKnowledgeProfile,
};
