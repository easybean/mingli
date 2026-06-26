// 紫灵牌 · 领域逻辑（纯函数，无 DOM / 无 store / 无 astrolabeData 直读）。
// 抽牌、问题→用神宫、空宫借对宫、四化翻面、五张全配齐解读组装。
// chart 适配器从外部传入（见 chart-adapter.js），不传则降级为纯随机问事。
import { ZILING_DECK } from './ziling-data.js';

export const QUESTION_TYPES = [
  { key: 'career', name: '事业', en: 'CAREER', glyph: '峰', palace: '官禄', axis: '事业' },
  { key: 'wealth', name: '财运', en: 'WEALTH', glyph: '丰', palace: '财帛', axis: '事业', extra: '财运' },
  { key: 'love', name: '婚恋', en: 'LOVE', glyph: '缘', palace: '夫妻', axis: '情感' },
  { key: 'health', name: '健康', en: 'HEALTH', glyph: '安', palace: '疾厄', axis: '性格', extra: '身体' },
  { key: 'social', name: '人际', en: 'SOCIAL', glyph: '和', palace: '仆役', axis: '性格' },
  { key: 'travel', name: '出行', en: 'TRAVEL', glyph: '行', palace: '迁移', axis: '事业' },
  { key: 'estate', name: '置业', en: 'ESTATE', glyph: '宅', palace: '田宅', axis: '事业', extra: '财运' },
  { key: 'study', name: '学业', en: 'STUDY', glyph: '文', palace: '官禄', axis: '事业' },
  { key: 'all', name: '综合', en: 'GENERAL', glyph: '元', palace: '命宫', axis: '性格' },
];

const QUESTION_TEXT = {
  career: '该不该接下这个机会？', wealth: '近期财气走向如何？', love: '这段感情该如何走？',
  health: '近来身心要留意什么？', social: '这段关系该如何拿捏？', travel: '此行宜动还是宜守？',
  estate: '此时置业时机如何？', study: '这个方向值得深耕吗？', all: '我眼下整体如何？',
};

// 直断结论表：问题类型 × 四化倾向(favor顺 / caution阻 / neutral惯性) → 直接给方向
const VERDICT = {
  career: { favor: '偏宜接、可顺势推进', caution: '先别急着接，有变数要理清再说', neutral: '接不接都不强求，看你准备够不够' },
  wealth: { favor: '财气偏旺，可顺势进取，但别贪快钱', caution: '财气偏紧，不宜贪进，先守住为上', neutral: '财气平平，多靠日常积累、少指望横财' },
  love: { favor: '这段偏宜继续、推进，气候是顺的', caution: '眼下宜缓，有心结要先解、别硬推', neutral: '顺其自然，别强求也别急着断' },
  health: { favor: '状态偏稳，按部就班养着即可', caution: '有要留意处，别硬扛、早处理早安心', neutral: '无大起伏，规律作息是关键' },
  social: { favor: '关系偏顺，可主动靠近、借力', caution: '先拿捏好边界，别交浅言深', neutral: '不冷不热，看你想投入多少' },
  travel: { favor: '宜动，此行偏顺、可放心走', caution: '宜守或缓行，有变数先备好退路', neutral: '动守皆可，按实际需要定' },
  estate: { favor: '时机偏成熟，可认真看、择优下手', caution: '先别急着下手，再等等、多比比', neutral: '不催不拖，按自己节奏来' },
  study: { favor: '这方向偏值得深耕，投入有回响', caution: '先确认是否真合适，别盲目投入', neutral: '可学，但回报偏慢，要有耐心' },
  all: { favor: '整体偏顺，是可以往前走的时候', caution: '整体偏滞，宜稳守、先把根基理清', neutral: '平稳无大波，靠日常选择慢慢累积' },
};

// 机制牌：主星空宫（借对宫）、四化空宫（惯性）
const EMPTY_MAJOR = { 级别: '主星', 名: '空宫', 空宫: true, 五行: '', 中心词: '此事暂无明确主轴，须借对宫之星而论', 牌义: '主星落空宫：这件事本身没有定数、主轴不明，借你命盘对宫的本命主星来看。' };
const EMPTY_HUA = { 级别: '四化', 名: '四化空', 空宫: true, 方位五行: '', 本意: '惯性而行', 牌义: '四化落空：当下没有明显的禄、权、科、忌力量介入，事情大概率按自身惯性发展。' };

// 抽牌池：主星 14+2空宫=16；四化 4+8空宫=12（忠实实体牌库概率）
const POOLS = {
  主星: [...ZILING_DECK.主星, EMPTY_MAJOR, { ...EMPTY_MAJOR }],
  甲级辅星: ZILING_DECK.甲级辅星,
  乙级辅星: ZILING_DECK.乙级辅星,
  丙级辅星: ZILING_DECK.丙级辅星,
  四化: [...ZILING_DECK.四化, ...Array.from({ length: 8 }, () => ({ ...EMPTY_HUA }))],
};

const findMajor = (name) => ZILING_DECK.主星.find((c) => c['名'] === name) || null;

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)] || arr[0];

// drawSpread(rng=Math.random) → [主星, 甲, 乙, 丙, 四化]（主星可能是空宫，待 buildSpread 补实）
export const drawSpread = (rng = Math.random) => [
  pick(POOLS.主星, rng),
  pick(POOLS.甲级辅星, rng),
  pick(POOLS.乙级辅星, rng),
  pick(POOLS.丙级辅星, rng),
  pick(POOLS.四化, rng),
];

// buildSpread：抽一阵并按官方规则补实主星空宫——主星位永远是实星，四化空宫保留。
// 主星空宫补星：有命盘借真命盘对宫之星（命盘加持），对宫亦空/无命盘则随机重抽。
export const buildSpread = ({ typeKey, chart = null, rng = Math.random } = {}) => {
  const q = QUESTION_TYPES.find((t) => t.key === typeKey) || QUESTION_TYPES[QUESTION_TYPES.length - 1];
  const spread = drawSpread(rng);
  if (spread[0] && spread[0]['空宫']) {
    let borrowed = null;
    let via = '重抽';
    if (chart && chart.ready) {
      const opp = chart.getOpposite(q.palace);
      const name = opp && !opp.空宫 ? (opp.主星[0] || {})['名'] : null;
      if (name) { borrowed = findMajor(name); via = '对宫'; }
    }
    if (!borrowed) borrowed = pick(ZILING_DECK.主星, rng);
    spread[0] = { ...borrowed, _fromEmpty: true, _via: via };
  }
  return spread;
};

// ---- 文本小工具 ----
const parts = (str, n) => String(str || '').split(/[、，,；;]/).map((s) => s.trim()).filter(Boolean).slice(0, n).join('、');
const firstSentence = (str) => String(str || '').split(/[。；;]/).map((s) => s.trim()).filter(Boolean)[0] || '';
// 宫名规范：命宫自带「宫」字，其余两字宫名补上「宫」
const palaceLabel = (name) => (String(name).endsWith('宫') ? name : `${name}宫`);

const LEVEL_COLOR = { 主星: '#C8452F', 甲级辅星: '#7A56AC', 乙级辅星: '#3F93A8', 丙级辅星: '#4E927A', 四化: '#C9A646' };

// 四化倾向：favor=偏顺读优势 / caution=偏阻读缺陷 / neutral=空宫按惯性
const huaLean = (hua) => {
  if (hua['空宫']) return 'neutral';
  return hua['名'] === '化忌' ? 'caution' : 'favor';
};

// 主星某轴的优势/缺陷字段
const axisText = (card, axis, side) => parts(card[`${axis}${side}`] || card[`性格${side}`], 3);

// 本阵主调（主星 / 空宫补星 / 四化翻面）。主星已由 buildSpread 补实，恒为实星。
const sectionLead = (lead, hua, q) => {
  const lean = huaLean(hua);
  const huaName = hua['名'];
  const star = lead;
  let prefix;

  if (lead['_fromEmpty']) {
    prefix = lead['_via'] === '对宫'
      ? `主星本落空宫、此事主轴本虚——便借你命盘里${palaceLabel(q.palace)}的对宫之星「${star['名']}」立轴：${parts(star['中心词'], 2)}。`
      : `主星本落空宫、此事主轴本虚——重抽一星「${star['名']}」为此事立轴：${parts(star['中心词'], 2)}。`;
  } else {
    prefix = `命主以「${star['名']}」领此一阵，定下这件事的底色——${parts(star['中心词'], 2)}。`;
  }

  let body;
  if (lean === 'favor') {
    body = `${prefix}叠上${huaName}，这股力量偏顺，更容易走向它好的一面：${axisText(star, q.axis, '优势')}。`;
  } else if (lean === 'caution') {
    body = `${prefix}但叠了化忌，眼下偏阻，要留意它的另一面：${axisText(star, q.axis, '缺陷')}。`;
  } else {
    body = `${prefix}这次没有明显的四化介入，事情多半按它本来的性子走——顺则${axisText(star, q.axis, '优势')}，滞则${axisText(star, q.axis, '缺陷')}，全看你怎么用。`;
  }
  // 按问题领域补一句（财运 / 健康）
  if (q.extra && star[q.extra]) {
    const label = q.extra === '财运' ? '财上' : '身体上';
    body += `${label}，这颗星偏「${parts(star[q.extra], 2)}」，可一并参看。`;
  }
  return body;
};

// 命盘底子（命盘加持：本命此宫底子 + 与今日抽到主星的呼应；仅在有命盘时出）
const sectionChart = (q, chart, leadName) => {
  if (!chart || !chart.ready) return null;
  const p = chart.getPalace(q.palace);
  if (!p) return null;
  if (p.空宫) {
    return `回到你的命盘，这件事看${palaceLabel(q.palace)}——本命此宫无主星、力量须借对宫，所以这类事你本就容易"看人脸色而动"，更需要自己先拿定主意。`;
  }
  const stars = p.主星.map((s) => s['名']).join('、');
  const bits = [];
  if (p.庙旺) bits.push(`星势${p.庙旺}`);
  if (p.四化 && p.四化.length) bits.push(`带${p.四化.join('、')}`);
  const tail = bits.length ? `（${bits.join('，')}）` : '';
  const hit = p.主星.some((s) => s['名'] === leadName);
  const echo = hit
    ? `巧的是，今日抽到的「${leadName}」正应你本命此宫——象与命相合，这一卦的信号格外清晰、格外贴你。`
    : `这是你面对此事长期自带的底子；今日抽到的牌象是"此刻之象"，把两层叠起来看，才既贴你、又贴当下。`;
  return `回到你的命盘，这件事看${palaceLabel(q.palace)}，本命坐「${stars}」${tail}。${echo}`;
};

// 助力与变量（甲=主力助援 / 乙=次要变量 / 丙=时机底噪，三角色分述）
const sectionAux = (jia, yi, bing, q) => {
  const jiaText = parts(jia[`${q.axis}优势`] || jia['事业优势'] || jia['中心词'], 3);
  const yiText = firstSentence(yi['解释']);
  const bingGood = bing['吉凶'] === '吉';
  const bingText = firstSentence(bing['释义']);
  return `甲级「${jia['名']}」是这一阵最实的助力——它给的是${jiaText}这类正面支援，遇事多往这处借力。`
    + `乙级「${yi['名']}」点出一重次要变量：主${yi['主'] || '—'}，${yiText}，推进时顺手用上、或留个心。`
    + `丙级「${bing['名']}」是背景里的时机与底噪，${bingGood ? '偏吉' : '偏扰'}——${bingText}。`;
};

// 吉凶走向（四化，点名主星）
const sectionHua = (hua, leadName) => {
  if (hua['空宫']) {
    return '四化落空——当下没有明显的禄、权、科、忌介入，这件事大概率按它自身的惯性发展。既没有外力推、也没有外力拦，结果更多取决于你日常选择的累积。';
  }
  const name = hua['名'];
  const body = parts(hua['会意'] || hua['本意'], 3);
  if (name === '化忌') {
    return `四化「化忌」落在主星之上，给「${leadName}」添一重变数：${body}。不必慌——留三分余地、把没看清的先看清，反而更稳。`;
  }
  return `四化「${name}」落在主星之上，把「${leadName}」往好的方向推：${body}。整体偏吉，但行动的火候仍由你自己拿捏。`;
};

// 直断：开头直接回答问题（围绕用户问句 + 结论表 + 主轴/四化一句）
const sectionVerdict = (q, lead, hua, question) => {
  const lean = huaLean(hua);
  const verdict = (VERDICT[q.key] || VERDICT.all)[lean];
  const ask = question ? `你问「${question}」` : `你问的这件「${q.name}」事`;
  const huaTail = lean === 'favor'
    ? `主轴落在「${lead['名']}」，又得${hua['名']}之助`
    : lean === 'caution'
      ? `主轴落在「${lead['名']}」，却遇化忌生变`
      : `主轴落在「${lead['名']}」，四化落空、全凭它本身的惯性`;
  return `${ask}——本阵给的方向是：${verdict}。（${huaTail}）下面把这一卦拆开来看。`;
};

// assembleReading({ spread, typeKey, chart, question }) → { title, questionText, chips, sections }
export const assembleReading = ({ spread, typeKey, chart, question }) => {
  const q = QUESTION_TYPES.find((t) => t.key === typeKey) || QUESTION_TYPES[QUESTION_TYPES.length - 1];
  const [lead, jia, yi, bing, hua] = spread;
  const ask = (question || '').trim();

  const sections = [
    { h: '直断', body: sectionVerdict(q, lead, hua, ask) },
    { h: '本阵主调', body: sectionLead(lead, hua, q) },
    { h: '命盘底子', body: sectionChart(q, chart, lead['名']) },
    { h: '助力与变量', body: sectionAux(jia, yi, bing, q) },
    { h: '吉凶走向', body: sectionHua(hua, lead['名']) },
    { h: '给你的一句', body: '牌象只照见趋势的轮廓，真正落子的是你。若心已有所向，此阵不过添一分笃定；若仍迟疑，便把它当作一次与自己对话的契机。' },
  ].filter((s) => s.body);

  const chips = spread.map((c) => ({ label: c['名'], color: LEVEL_COLOR[c['级别']] || '#C9A646' }));

  return {
    title: ask ? '此阵的解读' : `「${q.name}」· 此阵的解读`,
    questionText: ask || QUESTION_TEXT[q.key] || '',
    chips,
    sections,
  };
};
