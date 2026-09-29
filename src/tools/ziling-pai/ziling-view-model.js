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


// 机制牌：主星空宫（借对宫）、四化空宫（惯性）
const EMPTY_MAJOR = { 级别: '主星', 名: '空宫', 空宫: true, 五行: '', 中心词: '主星待引，由你主动再抽', 牌义: '这张是抽牌机制中的空宫牌。确认后从剩余主星中主动再抽；不代表现实中的事情没有希望。' };
const EMPTY_HUA = { 级别: '四化', 名: '四化空', 空宫: true, 方位五行: '', 本意: '本阵无额外四化提示', 牌义: '本次没有抽到禄、权、科、忌提示；这是牌阵记录，不证明现实平稳或不会变化。' };

// 抽牌池：主星 14+2空宫=16；四化 4+8空宫=12（忠实实体牌库概率）
const POOLS = {
  主星: [...ZILING_DECK.主星, EMPTY_MAJOR, { ...EMPTY_MAJOR }],
  甲级辅星: ZILING_DECK.甲级辅星,
  乙级辅星: ZILING_DECK.乙级辅星,
  丙级辅星: ZILING_DECK.丙级辅星,
  四化: [...ZILING_DECK.四化, ...Array.from({ length: 8 }, () => ({ ...EMPTY_HUA }))],
};

export const DRAW_LEVELS = ['主星', '甲级辅星', '乙级辅星', '丙级辅星', '四化'];

// 完整抽牌界面只拿到一份浅拷贝，避免洗牌改变领域牌库本身。
export const getDrawPool = (level) => (POOLS[level] || []).map((card) => ({ ...card }));

const findMajor = (name) => ZILING_DECK.主星.find((c) => c['名'] === name) || null;

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)] || arr[0];

// 实体主星牌含两张空宫。用户抽中空宫时，牌面仍展示空宫；确认后按命盘借对宫主星成阵。
export const resolveMajorCard = ({ card, typeKey, chart = null, rng = Math.random } = {}) => {
  if (!card || !card['空宫']) return card;
  const q = QUESTION_TYPES.find((t) => t.key === typeKey) || QUESTION_TYPES[QUESTION_TYPES.length - 1];
  let borrowed = null;
  let via = '重抽';
  if (chart && chart.ready) {
    const opp = chart.getOpposite(q.palace);
    const name = opp && !opp.空宫 ? (opp.主星[0] || {})['名'] : null;
    if (name) { borrowed = findMajor(name); via = '对宫'; }
  }
  if (!borrowed) borrowed = pick(ZILING_DECK.主星, rng);
  return { ...borrowed, _fromEmpty: true, _via: via };
};

// drawSpread(rng=Math.random) → [主星, 甲, 乙, 丙, 四化]（主星可能是空宫，待 buildSpread 补实）
export const drawSpread = (rng = Math.random) => [
  pick(POOLS.主星, rng),
  pick(POOLS.甲级辅星, rng),
  pick(POOLS.乙级辅星, rng),
  pick(POOLS.丙级辅星, rng),
  pick(POOLS.四化, rng),
];

// Legacy compatibility helper. The interactive controller never calls this:
// both current modes require the user to handle empty-major redraw explicitly.
export const buildSpread = ({ typeKey, chart = null, rng = Math.random } = {}) => {
  const spread = drawSpread(rng);
  spread[0] = resolveMajorCard({ card: spread[0], typeKey, chart, rng });
  return spread;
};

// Reading uses curated symbolic cues, never raw medical/financial card claims.
export const QUESTION_INTENTS = { explore: '看清走向', advance: '想推进', leave: '想退出', compare: '两个选择之间' };
export const QUESTION_FOCUS = { progress: '进展', stability: '稳定', cost: '时间与成本', connection: '沟通与关系' };
export const QUESTION_WINDOWS = { open: '不限定', week: '未来7天', month: '未来30天' };
const MAIN_CUES = {
  贪狼: '机会多，也容易分散注意力', 太阴: '先整理感受，再核对细节', 天相: '双方的分工和承诺需要对齐', 廉贞: '愿望与边界需要一起说清',
  天同: '舒服的节奏与必要的改变之间需要取舍', 七杀: '有行动的冲劲，也要留出回旋空间', 破军: '旧办法可能需要调整，但改变也有代价', 巨门: '话有没有说清楚，比猜测更重要',
  天府: '先盘点已有资源，再考虑下一步', 紫微: '谁来作主、谁来承担需要明确', 太阳: '主动付出前，也看看自己能承受多少', 天机: '备选方案很多，先核实关键条件',
  武曲: '把投入、回报与执行条件摆到桌面上', 天梁: '经验和原则能提供参照，也别忽略实际情境',
};
const AUX_CUES = {
  文曲: '表达能打开局面，也要核对彼此是否理解一致', 左辅: '可以寻找明确分工的协作', 擎羊: '直接推进可能碰到冲突，需要先讲边界', 铃星: '反复的小摩擦值得单独处理',
  右弼: '有人支持时，也要确认支持到哪一步', 地空: '想象和落地之间可能有距离，先做验证', 禄存: '可用资源需要盘点，不等于一定有收益', 天钺: '可以向有经验的人核实一个关键问题',
  陀罗: '阻滞或反复的意象，适合拆小步骤', 文昌: '文字、记录和清楚的说明能减少误会', 地劫: '额外消耗的意象，先明确能承受的边界', 天马: '变化与移动的意象，先核对安排是否可行',
  天魁: '可以主动寻求具体帮助，不把等待贵人当计划', 火星: '节奏过急的意象，先停一下再回应',
};
const YI_CUES = {
  月德:'寻求善意的协调', 天虚:'区分期待与已经确认的事实', 孤辰:'给独立思考留空间', 天空:'把设想变成一个小验证', 天官:'核对正式流程', 三台:'把阶段目标写清', 龙池:'让成果能够被看见', 解神:'找一个可以缓解僵局的切口',
  寡宿:'别用沉默代替表达', 华盖:'留出专注做事的空间', 天贵:'向熟悉情况的人求证', 红鸾:'把好感和实际承诺分开看', 封诰:'核对口头认可是否有明确记录', 破碎:'留意零碎的额外开销', 天德:'给协商留余地', 天寿:'考虑长期可持续的节奏',
  蜚廉:'先核实传来的消息', 天福:'看见已有的支持', 天才:'尝试用已有技能解决问题', 凤阁:'把表达整理得更清楚', 八座:'确认合作中的位置', 阴煞:'不把猜测当作对方的真实意图', 天厨:'留出照顾日常生活的空间', 台辅:'把需要的支持说具体',
  天巫:'核实角色变化的条件', 恩光:'辨认具体而非想象中的帮助', 天姚:'吸引力之外也看相处方式', 咸池:'一时情绪不必立刻变成决定', 天月:'留意自己的负荷，不作疾病判断', 天刑:'先确认规则与边界', 天哭:'给失落情绪一点表达空间', 天喜:'把积极互动变成具体沟通',
};
const BING_CUES = {
  伏兵:'留意尚未确认的安排', 青龙:'抓住一次明确的沟通机会', 大耗:'盘点累计投入', 力士:'有行动力也要量力', 奏书:'重要内容留文字确认', 博士:'先补足相关知识', 天伤:'不要勉强自己承担过量事务', 官府:'核对手续与规则',
  小耗:'留意小额反复消耗', 空亡:'未落实的事项先保留判断', 病符:'照顾自己的日常节奏，不由牌判断病情', 旬中:'给不确定事项留缓冲', 飞廉:'核实消息来源', 将军:'明确执行者和责任', 截路:'准备一个替代方案', 天使:'优先处理实际需要', 喜神:'留意双方愿意合作的时刻',
};
const HUA_CUES = { 化禄:'资源与吸引力：看机会具体提供什么，不等同获利保证', 化权:'推动与掌控：明确谁决定，也留意压力是否集中', 化科:'说明与认可：让信息、成果和依据可被核实', 化忌:'牵制与执着：找出最难放下或最易卡住的一点', 四化空:'本阵没有额外四化提示，不能据此预测现实平稳或没有变化' };
const TENSION = new Set(['擎羊','铃星','地空','陀罗','地劫','火星']);
const VARIABLES = new Set(['天虚','天空','破碎','阴煞','蜚廉','天刑','天哭']);
const FRICTION = new Set(['伏兵','大耗','小耗','空亡','旬中','截路']);
const FOCUS_ACTION = {
  progress:'观察是否出现了一个有负责人、有时间点的下一步，而不只是“再看看”。',
  stability:'观察已经谈好的安排是否持续兑现；一次积极表态不等于稳定。',
  cost:'记下实际花去的时间与成本，看看是否开始超出自己原先设定的界限。',
  connection:'观察对方是否回应具体问题、尊重已表达的边界，而不只看语气好不好。',
};

export const assembleReading = ({ spread, typeKey, chart, question = '', drawTrace = null, intent = 'explore', focus = 'progress', window = 'open' }) => {
  if (!Array.isArray(spread) || spread.length !== 5 || spread.some(card => !card?.名) || spread[0].空宫) throw new Error('请先完成五张牌，空宫须由你主动补抽。');
  const q = QUESTION_TYPES.find(type => type.key === typeKey) || QUESTION_TYPES.at(-1);
  const [lead,jia,yi,bing,hua] = spread;
  const ask = String(question).trim().slice(0,160);
  const safeIntent = Object.hasOwn(QUESTION_INTENTS,intent) ? intent : 'explore';
  const safeFocus = Object.hasOwn(QUESTION_FOCUS,focus) ? focus : 'progress';
  const safeWindow = Object.hasOwn(QUESTION_WINDOWS,window) ? window : 'open';
  const sensitive = ['health','wealth','estate'].includes(q.key) || /彩票|中奖|博彩|赌博|下注|股票|基金|投资|借贷|贷款|停药|疾病|病情|诊断|癌|怀孕|手术|自杀|自残|暴力|跟踪/.test(ask);
  const tense = TENSION.has(jia.名), variable = VARIABLES.has(yi.名), friction = FRICTION.has(bing.名);
  const mixed = tense || variable || friction || hua.名 === '化忌';
  const starts = { explore:'先看清这件事的条件', advance:'想推进，可以先找一个可撤回的小步骤', leave:'想退出，先分清要离开的是什么', compare:'两个选择，先用同一套条件比较' };
  const summary = sensitive ? '这一阵只作象征性自我整理，不对健康、安全、中奖或收益作预测。'
    : `${starts[safeIntent]}：${mixed ? '牌组中有牵制或消耗的意象，先处理卡点。' : '牌组可用来整理资源与分工，但不代表事情一定顺利。'}`;
  const tension = `${lead.名}提示「${MAIN_CUES[lead.名] || '先整理事情的主线'}」；${jia.名}则提醒「${AUX_CUES[jia.名] || '核对具体支持与限制'}」。${tense ? '两张合看，重点不是一味加速，而是辨认行动会碰到的边界。' : '两张合看，先把想法与可用的支持对应起来。'}${variable || friction ? `同时，${variable ? yi.名 : bing.名}提示还有细节需要核实。` : ''}`;
  const sections = [
    {h:'你提供的情况',body:`${ask || `未填写具体事情，按${q.name}通用主题阅读。`}\n你选择：${QUESTION_INTENTS[safeIntent]}；更在意${QUESTION_FOCUS[safeFocus]}；观察范围：${QUESTION_WINDOWS[safeWindow]}。这是你设定的复盘范围，不是预言应验日期。`},
    {h:'五张牌，分别提醒什么',body:[`核心 · ${lead.名}：${MAIN_CUES[lead.名] || '主线待梳理'}`,`推动或牵制 · ${jia.名}：${AUX_CUES[jia.名] || '支持与限制需要核实'}`,`容易忽略的变量 · ${yi.名}：${YI_CUES[yi.名] || '核实具体情况'}`,`过程提醒 · ${bing.名}：${BING_CUES[bing.名] || '给过程留余地'}`,`表达方式 · ${hua.名}：${HUA_CUES[hua.名] || HUA_CUES.四化空}`].join('\n')},
  ];
  const palace = chart?.ready ? chart.getPalace(q.palace) : null;
  sections.push({h:'命盘中的信息',body:palace ? `相关本命宫：${q.palace}。${palace.空宫 ? '此宫没有本命主星，不能据此推断性格软弱或事情无望。' : `主星：${palace.主星.map(star=>star.名).join('、')}。`}${palace.四化?.length ? `本命四化：${palace.四化.join('、')}。` : ''}${palace.主星?.some(star=>star.名===lead.名) ? `本次抽到的${lead.名}也在此宫，这是同星对应，不代表预测更准确。` : ''}这里只展示本命对应，尚未纳入流年流月；抽牌不会改变命盘。` : '本轮没有可用的相关本命宫资料，以下是随机牌象的象征性阅读，不冒充命盘推断。'});
  const emptyCount = Math.min(2, Math.max(0, Number(drawTrace?.emptyMajorCount)||0));
  if(emptyCount) sections.push({h:'抽牌轨迹',body:`${emptyCount>1 ? `连续 ${emptyCount} 次遇到空宫` : '先遇到一次空宫'}，之后由你主动引出${lead.名}。这是抽牌过程的记录，可以作为“先停一下再看”的仪式提醒，不证明现实信息不足或结果注定延迟。`});
  sections.push({h:'解读依据与边界',body:'牌位分工和组合解释是本产品的阅读框架，采用整理后的星曜象征，不是传统紫微唯一牌法。问题原句用于保留上下文，方向来自你明确选择的意图与关注点；本版不是自由语义理解，也没有经过预测准确率验证。'});
  if(sensitive) sections.push({h:'这类问题的边界',body:'不能用牌判断疾病、是否停药、出行安全、是否中奖或投资收益，也不推断他人的隐藏事实。相关决定请依据现实信息和适当的专业支持。'});
  return { version:'ziling-reading-2', title:'这一阵，先看清什么', questionText:ask || QUESTION_TEXT[q.key], summary, tension,
    observation:sensitive ? '把能够核实的事实与担心的猜测分开记录；不要把本阵当作现实结论。' : FOCUS_ACTION[safeFocus],
    intent:safeIntent,focus:safeFocus,window:safeWindow,sensitive,
    chips:spread.map(card=>({label:card.名,color:'#C9A646'})).concat(emptyCount?[{label:`曾遇空宫 × ${emptyCount}`,color:'#6B4E96'}]:[]),
    sections,drawTrace:{mode:drawTrace?.mode === 'full' ? 'full' : 'quick',emptyMajorCount:emptyCount} };
};
