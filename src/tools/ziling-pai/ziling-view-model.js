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
// 每个场景都有两种读法、一条可以推翻解读的现实信号，以及主星的三个落点：
// 人与沟通、资源与条件、节奏与改变。不是给问题打吉凶分。
const scene = (pattern, category, title, open, caught, signal, people, means, change) =>
  ({pattern, category, title, open, caught, signal, lenses:[people, means, change]});
const SCENES = [
  scene(/收入.{0,10}(瓶颈|不稳|突破|提高|增长)|增收|赚不到钱|赚得少|收入来源/,'wealth','收入上不去，先找少在哪一段',
    '这阵值得先看已经做出了什么，却没有算进报酬。瓶颈若在谈薪或报价，多做同样的活，未必比讲清它的价值更有用。','先分清是单价低、活不够，还是做了活却迟迟收不到钱。这三种情况看起来都叫收入少，办法却不一样。',
    '翻一下最近三个月的收入。领工资的话，找出职责增加而报酬没变的那一项；按单结算的话，算算哪一单看着金额大、摊到每小时反而少。','谁能决定你的报酬，你的成果有没有被看见','花出去的时间和实际拿到的钱是否相称','从哪一段时间开始，工作量和收入不再一起涨'),
  scene(/结婚|婚姻|订婚|谈婚论嫁|领证/,'love','能不能走到婚姻，要看两个人怎么谈日子',
    '比起一句“以后会结婚”，更有分量的是两个人已经能一起安排具体生活。你可以把最在意的一件事拿出来谈，不必一次问完所有问题。','如果一谈住哪、钱怎么用、家务谁做就转移话题，口头上的愿意还不足以说明两个人已准备好。牌不能替对方承诺婚期。',
    '挑一个会影响你们两人的安排，比如婚后住哪里。留意对方是一起想办法，还是只让你去适应。','谁的想法还没被认真听过','共同生活的承担是否对等','口头计划有没有变成两个人都参与的安排'),
  scene(/出轨|第三者|骗我|瞒着我|有别人|背叛我/,'love','疑心不能当作证据',
    '这组牌不能告诉你对方有没有隐瞒。它能帮你分清：哪一件事确实发生过，又是哪一部分是你在替对方解释。','就算翻到牵制的牌，也不能据此指认背叛。此刻要弄清的，是哪一次言行不一致让信任出了裂缝。',
    '用你亲历的一件事开口，而不是用牌质问对方。看对方能否就那件事给出前后一致的说明。','你具体想向对方确认什么','你手上是直接经历还是转述','从什么时候起，你开始觉得不对劲'),
  scene(/回款|尾款|货款|讨债|要账|欠款|还我钱|催款/, 'wealth','这笔钱，卡在哪一步',
    '这阵更适合把账往实处问：款项若已确认，值得直接问付款日期，不必反复解释自己为什么急。','这阵先看对方认不认这笔账，再谈哪天能到账。验收都没说定，一句“快了”就算不上回款进度。',
    '把金额和对应的交付发给对方，请对方回一句：金额是否确认、还缺哪项手续、预计哪天付。能回答哪一项，就说明走到了哪一步。','经手的人能不能确认付款','金额、验收和付款条件对不对得上','上次答应的日期过后，究竟多了哪道手续'),
  scene(/面试|复试|终面|投.{0,3}简历|招聘.{0,6}回复/i, 'career','面试后，还值不值得等',
    '牌意偏向还有跟进的余地，但聊得投机不是录用。值得等的是下一轮安排，不是一句客气的夸奖。','别把沉默直接当成落选，也别为一个没落定的岗位停掉其他面试。这阵更值得追问的是：流程卡在哪里？',
    '如果约好的反馈时间已过，可以问：“这个岗位还在走流程吗？如果需要我补材料，最迟哪天发合适？”具体到下一轮或材料，比“有消息通知你”更有分量。','面试官的肯定有没有变成招聘方的下一次联系','岗位名额和入职条件是否已经确认','还有没有下一轮、何时反馈'),
  scene(/offer|录用|接.{0,4}工作机会|入职|两.{0,2}(岗位|工作机会)/i,'career','这份工作，值得接吗',
    '可以认真谈这份机会。真正让它值得接的，是入职后有人给你资源、也说得清怎么算做得好。','先别因为头衔好听就答应。若岗位要求很具体，能给的支持却始终含糊，这个落差会落到你身上。',
    '问未来主管：“我进来头一个月先接哪件事，谁和我一起做，您看什么结果？”拿这个回答跟录用条件放在一起看。','谁带你、谁评你的表现','书面条件是否和口头承诺一致','头一个月的任务是不是你真正想做的'),
  scene(/离职|辞职|跳槽|裸辞|换工作|转行|辞掉|工作.{0,6}(去留|留下|离开)/,'career','是想离开这家公司，还是这份工作',
    '先试一条能比较的路。跟一个新团队谈过实际职责，你才知道自己是在躲开眼下的问题，还是确实想换一种工作。','这阵不宜把一次委屈直接读成“非走不可”。但若换过项目、谈过分工，吃亏的地方还一再重复，那就不只是这几天太累。',
    '写下你最想摆脱的一件具体事，再问新岗位会不会同样发生。若答案还是会，换公司未必能解决它。','你想离开的是谁的管理方式','留下与换工作各自要承担的成本','困扰是最近才有，还是换过环境也一直如此'),
  scene(/升职|升迁|晋升|提拔|转正|加薪/,'career','认可会不会变成正式安排',
    '这阵值得把话问明：上级欣赏你是一层，愿不愿意提名、给名额是另一层。','小心先接了更重的活，却一直等不到相应的职级、待遇或转正答复。多做事本身不是承诺。',
    '在下次沟通时问清谁评定、看哪项成果、何时决定。能说清评定节点，才有下一次可以跟进的事。','谁愿意正式替你提名','新增职责是否对应待遇','评定有没有排进日程'),
  scene(/复合|前任|分手后|复不复合/,'love','再联系，和重新在一起是两件事',
    '这组牌给重新开口留了空间，但还不能读成复合。能不能往回走，要看两个人是否愿意谈上次为什么走散。','就算收到一句“最近好吗”，也先别把它当成想复合。真正的分水岭，是聊到旧问题时，对方还愿不愿意坐下来听。',
    '若对方联系，留意一次问候之后有没有持续的回应。若对方已表示不想联系，就尊重这个边界，不必用反复试探来验证牌。','两个人能不能谈上次没谈完的话','双方愿不愿意拿出时间见面、沟通','这次联系跟以前反复断掉的模式有何不同'),
  scene(/暧昧|表白|喜欢我|暗恋|对我.{0,3}(意思|感觉)|脱单|桃花|爱不爱/,'love','好感，要看见怎样的回应',
    '可以给关系一个自然相处的机会。比起猜一句话是不是暗示，一次具体邀请更能看出彼此有没有靠近的意愿。','这阵容易把一时热络读得太重。别急着替对方定义心意，先看热情过后，联系是不是还靠你一个人维持。',
    '如果你愿意，可以提一次有时间、有地点的小邀约。对方没空但主动另约，和每次只回“以后吧”，是两种不同的回应。','谁会主动接住对方的话','对方是否愿意为相处留时间','热络是一阵子还是能延续'),
  scene(/吵架|冷战|道歉|误会|和好|闹翻/,'social','这次不愉快，还有没有话可说',
    '有机会把一件具体的误会说开。先谈那句话或那件事，不必一开口就给整段关系下结论。','若一开口就变成翻旧账，越解释可能越僵。与其争谁一向如此，不如先讲清这一次哪一步伤到了你。',
    '把“你总是这样”换成“那天发生这件事时，我以为……你当时怎么理解？”看对方是否愿意回答这件具体的事。','对方听到的是解释还是指责','双方愿意怎样补救','争执每次是否卡在同一句话上'),
  scene(/考试|考上|考研|考公|上岸|成绩|及格/,'study','能不能过，先看分丢在哪里',
    '这阵更像在提醒你：已有的知识，未必都能在考场上换成分数。把会做的题稳定做对，比再换一套资料更实在。','不宜凭这组牌估分。若复习很久却总错同一类题，卡住你的可能是做题方式，而不是用功不够。',
    '做一套限时题，把错题分成“不会、误读、来不及”。最多的那一类，就是下一轮最值得花时间的地方。','题意有没有读准','哪类题的分最拿不稳','平时会做的题是否一限时就乱'),
  scene(/行程|出差|旅行|旅游|出行|改签|订票/,'travel','这趟行程哪里最容易变',
    '可以继续安排，先把必须有人配合的那一段定下来。最值得确认的通常不是目的地，而是中间那次衔接。','这阵点的是衔接：若一段晚了就牵动后面所有安排，留一个能改的节点，比把时间排满更合适。',
    '找出最不能迟到的一站，倒着检查前一程的到达时间和备用走法。牌不能判断交通安全或天气。','接应的人是否确认','已经订下的安排能否变更','哪一次衔接最怕延误'),
  scene(/买房|租房|看房|置业|房子|搬家/,'estate','这处住处，合不合日常',
    '第一眼喜欢，可以作为再看一次的理由，还不能替你决定要不要签。','这阵更该看住进去以后才会遇到的麻烦，别只凭看房那半小时的印象做决定。',
    '换到你平时回家的时段再走一遍，看通勤、噪声和实际使用的不便。价格涨跌不靠抽牌判断。','同住的人最在意什么','长期负担与居住条件是否相称','换个时段看，第一印象是否还成立'),
  scene(/合作|接单|签约|谈生意|项目.{0,8}(启动|开工|能成|谈成|落地)/,'career','这次合作，能不能真正开工',
    '可以约一次小交付试配合。谈得来是起点，双方都愿意为第一步投入时间，才算真的开始。','如果目标越谈越大，谁验收、谁承担返工却没人提，这阵就不适合先把活全揽下来。',
    '挑最小的一项交付，让双方各说清交什么、何时交、谁验收。两边的答案对不上，就先别扩大范围。','真正能拍板的是谁','交付边界和可用资源','需求变动时谁来决定要不要重做'),
  scene(/断联|复联|还会.{0,4}联系|会不会.{0,4}(联系|找我)|不回.{0,3}消息/,'social','对方还会联系吗',
    '这阵可以读成话还没说死，但不能据此断言对方一定会来找你。更有意义的是：上次聊完，还有没有一件双方都愿意接着谈的事？','别把暂时的沉默当成答案，也别把一次回信当成关系已经回暖。要看对方是否愿意接着谈，而不只是礼貌地回一句。',
    '回看最后一次联系：有具体约定，就按约定跟进一次；没有约定，不必反复追问。如果对方已经明确拒绝联系，就停在这里。','上一次对话停在了谁的问题上','对方是否真的为下一次交流留了时间','最近的安静是偶尔一次，还是一贯如此'),
];
const GENERAL_LENS = {career:'事业',wealth:'收支',love:'感情',health:'健康',social:'人际',travel:'出行',estate:'居住',study:'学习',all:'这一问'};
const PEOPLE = new Set(['紫微','巨门','太阳','天相','廉贞']);
const MEANS = new Set(['天府','武曲','太阴','天梁']);
const LIMITS = [
  [/彩票|中奖|博彩|赌博|投注|下注|双色球|大乐透|刮刮乐/,'中奖','牌不能给出中奖号码、判断哪期容易中，也不能改变开奖概率。','如果是为了决定要不要再买一注，这次抽牌不能作为加注的理由。'],
  [/疾病|病情|诊断|吃药|停药|怀孕|手术|癌症|身体不适|能治好|看病/,'健康','这五张牌不能判断病情、是否怀孕或治疗结果。','把症状和出现的时间记下来，交给专业医护人员判断；不要凭牌调整用药。'],
  [/股票|基金|投资|收益率|借贷|贷款|涨跌|加仓|回本|翻倍/,'资金风险','这组牌不能预测涨跌、能否回本或借款结果。','先把决定所依赖的金额、期限和可能损失列清楚；牌面不是交易或借贷依据。'],
  [/自杀|自残|家暴|暴力|跟踪|人身安全|出行安全|车祸/,'安全','是否安全不能由牌面判断；出现现实风险时，不要等抽牌给答案。','如果你或他人正处于危险中，请先到安全的地方，联系当地紧急服务或可信任的人。'],
];

export const assembleReading = ({ spread, typeKey, chart, question = '', drawTrace = null, intent = 'explore', focus = 'progress', window = 'open' }) => {
  if (!Array.isArray(spread) || spread.length !== 5 || spread.some(card => !card?.名) || spread[0].空宫) throw new Error('请先完成五张牌，空宫须由你主动补抽。');
  const q = QUESTION_TYPES.find(type => type.key === typeKey) || QUESTION_TYPES.at(-1);
  const [lead,jia,yi,bing,hua] = spread;
  const ask = String(question).trim().slice(0,160);
  const safeIntent = Object.hasOwn(QUESTION_INTENTS,intent) ? intent : 'explore';
  const safeFocus = Object.hasOwn(QUESTION_FOCUS,focus) ? focus : 'progress';
  const safeWindow = Object.hasOwn(QUESTION_WINDOWS,window) ? window : 'open';
  const limit = LIMITS.find(([rx]) => rx.test(ask)) || (q.key === 'health' ? LIMITS[1] : null);
  const sensitive = Boolean(limit) || ['wealth','estate'].includes(q.key);
  // 具体问句优先，不能让“事业”分类或句中的“客户”盖过“尾款”。
  const s = SCENES.find(item => item.pattern.test(ask));
  const lens = PEOPLE.has(lead.名) ? 0 : MEANS.has(lead.名) ? 1 : 2;
  const snag = hua.名 === '化忌' || TENSION.has(jia.名) || VARIABLES.has(yi.名) || FRICTION.has(bing.名);
  const main = MAIN_CUES[lead.名], aux = AUX_CUES[jia.名];
  const secondary = hua.名 === '化忌' ? [hua, '容易卡在一个放不下的点上']
    : TENSION.has(jia.名) ? [jia,aux] : VARIABLES.has(yi.名) ? [yi,YI_CUES[yi.名]]
    : FRICTION.has(bing.名) ? [bing,BING_CUES[bing.名]] : hua.名 !== '四化空' ? [hua,HUA_CUES[hua.名]] : [jia,aux];
  const broad = {
    career:['谁能决定工作怎么分','手上的资源够不够做成这件事','岗位要求有没有反复变'],
    wealth:['谁和你约定了这笔钱的用途','已到账的和预计会有的钱差多少','收入和支出是否赶在同一个时间'],
    love:['你表达的意思，对方有没有听懂','双方愿意给彼此多少时间','最近的相处和以前有什么不同'],
    social:['哪句话双方理解得不一样','这段关系的付出是否总落在同一个人身上','同样的矛盾是不是反复发生'],
    study:['能不能向别人讲明白学过的东西','哪些内容离开答案就做不出','换一种题型还能不能独立解出来'],
    travel:['同行者是否都确认了安排','预订与实际需要有没有出入','中间哪一程需要预留时间'],
    estate:['谁会长期住在这里','居住成本是否算全','白天和晚上看到的是不是同一种环境'],
    all:['谁的回应会真正改变你的判断','你手里有哪些拿得出来的凭据','最近发生了什么，让你重新问起这件事'],
  };
  const landing = (s?.lenses || broad[q.key] || broad.all)[lens];
  const topic = s?.title || (GENERAL_LENS[q.key] + ' · 这一阵怎么看');
  const summary = limit ? limit[2] : s ? (snag ? s.caught : s.open)
    : `${ask ? '这句问话没有匹配到具体情境，只按' + GENERAL_LENS[q.key] + '主题读。' : '没有填写具体事情，这里只读' + GENERAL_LENS[q.key] + '的大方向。'}${lead.名}在主位，先看${landing}。`;
  const tension = limit ? `即使抽到${lead.名}和${hua.名}，它们也不是判断${limit[1]}的现实证据。`
    : `${lead.名}在主位，取的是“${main}”这一层意思。${s ? '放在你问的事上，关键是' + landing + '。' : ''}${secondary[0].名}落在${secondary[0].级别}位，读作“${secondary[1]}”。`;
  const observation = limit ? limit[3] : s ? s.signal
    : `回想最近一次与这件事有关的经历：${landing}？找一个实际发生的例子。如果没有线索，这一点就先留白。`;
  const sections = [
    {h:'五张牌的依据',body:[`主星 · ${lead.名}：${main}`,`甲辅 · ${jia.名}：${aux}`,`乙辅 · ${yi.名}：${YI_CUES[yi.名]}`,`丙辅 · ${bing.名}：${BING_CUES[bing.名]}`,`四化 · ${hua.名}：${HUA_CUES[hua.名]}`].join('\n')},
  ];
  const palace = chart?.ready ? chart.getPalace(q.palace) : null;
  sections.push({h:'命盘中的信息',body:palace ? `相关本命宫：${q.palace}。${palace.空宫 ? '此宫没有本命主星，不能据此推断性格软弱或事情无望。' : `主星：${palace.主星.map(star=>star.名).join('、')}。`}${palace.四化?.length ? `本命四化：${palace.四化.join('、')}。` : ''}${palace.主星?.some(star=>star.名===lead.名) ? `本次抽到的${lead.名}也在此宫，这是同星对应，不代表预测更准确。` : ''}这里只展示本命对应，尚未纳入流年流月；抽牌不会改变命盘。` : '本轮没有可用的相关本命宫资料，以下是随机牌象的象征性阅读，不冒充命盘推断。'});
  const emptyCount = Math.min(2, Math.max(0, Number(drawTrace?.emptyMajorCount)||0));
  if(emptyCount) sections.push({h:'抽牌轨迹',body:`${emptyCount>1 ? `连续 ${emptyCount} 次遇到空宫` : '先遇到一次空宫'}，之后由你主动引出${lead.名}。这是抽牌过程的记录，可以作为“先停一下再看”的仪式提醒，不证明现实信息不足或结果注定延迟。`});
  return { version:'ziling-reading-3', title:limit ? `关于${limit[1]}，牌能说到哪里` : topic, questionText:ask || `未填写问句 · ${q.name}`, summary, tension, observation,
    intent:safeIntent,focus:safeFocus,window:safeWindow,sensitive,
    chips:spread.map(card=>({label:card.名,color:'#C9A646'})).concat(emptyCount?[{label:`曾遇空宫 × ${emptyCount}`,color:'#6B4E96'}]:[]),
    sections,drawTrace:{mode:drawTrace?.mode === 'full' ? 'full' : 'quick',emptyMajorCount:emptyCount} };
};
