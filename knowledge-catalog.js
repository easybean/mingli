const META = require('./data/knowledge-meta.json');

const TOPICS = [
  { id: 'career', title: '事业' },
  { id: 'wealth', title: '财运' },
  { id: 'marriage', title: '婚恋' },
  { id: 'health', title: '健康' },
  { id: 'mindset', title: '心性' },
];

const STAGES = {
  1: { id: 'stage1', title: 'Foundation', goal: '建立基础规则映射与第一批引用依据。' },
  2: { id: 'stage2', title: 'Rules Expansion', goal: '补强格局、月令、主星落宫与宫位组合。' },
  3: { id: 'stage3', title: 'Reference Expansion', goal: '扩展古籍与现代资料的引用层。' },
  4: { id: 'stage4', title: 'Topic Expansion', goal: '按事业、婚恋、财运等专题组织知识。' },
};

const hasId = (list, id) => list.includes(id);

const getBookPlan = (book) => {
  const base = {
    batch: `stage${book.stage}`,
    plannedLayers: [book.useFor === 'rules' ? 'rules' : 'references'],
    topics: ['mindset'],
    extractionTargets: [],
    retrievalKeywords: [book.title],
  };

  if (book.domain === 'ziwei') {
    base.topics = ['career', 'wealth', 'marriage', 'mindset'];
    base.extractionTargets = ['主星落宫', '宫位主题'];
    base.retrievalKeywords = ['命宫', '官禄宫', '财帛宫', '夫妻宫', book.title];
  }

  if (book.domain === 'bazi') {
    base.topics = ['career', 'wealth', 'health', 'mindset'];
    base.extractionTargets = ['日主', '十神', '五行'];
    base.retrievalKeywords = ['日主', '月令', '十神', '用神', book.title];
  }

  if (hasId(['ziwei-handbook'], book.id)) {
    return {
      ...base,
      plannedLayers: ['rules', 'references', 'topics', 'retrieval'],
      extractionTargets: ['主星落宫', '十二宫主题', '基础宫位断法'],
    };
  }

  if (hasId(['ziwei-faweilu', 'ziwei-yibentong', 'ziwei-gusui', 'ziwei-taiweifu'], book.id)) {
    return {
      ...base,
      plannedLayers: ['rules', 'references', 'topics', 'retrieval'],
      topics: ['career', 'wealth', 'marriage', 'mindset'],
      extractionTargets: ['主星落宫', '宫位组合', '四化落宫'],
    };
  }

  if (hasId(['ziwei-nvming'], book.id)) {
    return {
      ...base,
      plannedLayers: ['references', 'topics', 'retrieval'],
      topics: ['marriage', 'mindset', 'health'],
      extractionTargets: ['女命专题', '婚恋专题'],
      retrievalKeywords: ['女命', '夫妻宫', '福德宫', book.title],
    };
  }

  if (hasId(['ziwei-shiyuge', 'ziwei-xuanweilun', 'ziwei-goulv', 'ziwei-guanyin'], book.id)) {
    return {
      ...base,
      plannedLayers: ['references', 'topics', 'retrieval'],
      extractionTargets: ['短篇断语', '专题旁证'],
    };
  }

  if (hasId(['bazi-basics'], book.id)) {
    return {
      ...base,
      plannedLayers: ['rules', 'references', 'topics', 'retrieval'],
      extractionTargets: ['天干五行', '地支五行', '十神基础'],
    };
  }

  if (hasId(['bazi-zipingzhenquan', 'bazi-ditiansui-annotated', 'bazi-qiongtong', 'bazi-sanmingtonghui'], book.id)) {
    return {
      ...base,
      plannedLayers: ['rules', 'references', 'topics', 'retrieval'],
      topics: ['career', 'wealth', 'marriage', 'health', 'mindset'],
      extractionTargets: ['月令', '格局', '用神', '旺衰', '调候'],
    };
  }

  if (hasId(['bazi-qianliminggao', 'bazi-shenfengtongkao', 'bazi-minglitanyuan'], book.id)) {
    return {
      ...base,
      plannedLayers: ['references', 'topics', 'retrieval'],
      topics: ['career', 'wealth', 'marriage', 'health', 'mindset'],
      extractionTargets: ['案例归纳', '专题旁证'],
    };
  }

  if (hasId(['bazi-wenzhenshensha', 'bazi-guiguyiwen'], book.id)) {
    return {
      ...base,
      plannedLayers: ['references', 'topics', 'retrieval'],
      topics: ['career', 'wealth', 'health'],
      extractionTargets: ['神煞专题'],
      retrievalKeywords: ['神煞', '命局组合', book.title],
    };
  }

  return {
    ...base,
    plannedLayers: ['references', 'retrieval'],
  };
};

const getActiveKnowledgeCatalog = (domains = META.activeDomains) => META.books
  .filter((book) => book.enabled && domains.includes(book.domain))
  .map((book) => {
    const plan = getBookPlan(book);
    return {
      ...book,
      stageInfo: STAGES[book.stage] || null,
      ...plan,
    };
  });

const countBy = (items, getKey) => items.reduce((acc, item) => {
  const key = getKey(item);
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const getCatalogSummary = (books = getActiveKnowledgeCatalog()) => {
  const byDomain = countBy(books, (book) => book.domain);
  const byUseFor = countBy(books, (book) => book.useFor);
  const byStage = countBy(books, (book) => `stage${book.stage}`);
  const topicCoverage = TOPICS.map((topic) => ({
    id: topic.id,
    title: topic.title,
    bookCount: books.filter((book) => book.topics.includes(topic.id)).length,
  }));

  return {
    version: META.version,
    updatedAt: META.updatedAt,
    activeDomains: META.activeDomains,
    totalBooks: books.length,
    stageOneSources: META.stageOneSources,
    byDomain,
    byUseFor,
    byStage,
    topics: topicCoverage,
  };
};

module.exports = {
  TOPICS,
  STAGES,
  getActiveKnowledgeCatalog,
  getCatalogSummary,
};
