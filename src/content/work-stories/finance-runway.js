// 《收入不稳，先守住还是再投入》：讨论现金安全线与可验证投入，不提供投资收益承诺。
const RULE_FOR_TAG = {
  'astro:fusion:F01': 'F01_cash_floor', 'astro:fusion:F02': 'F02_income_repair',
  'astro:fusion:F03': 'F03_bounded_invest', 'astro:fusion:F04': 'F04_external_cash',
  'astro:fusion:F05': 'F05_pressure_cost', 'astro:fusion:F06': 'F06_stop_loss',
};
const FOCUS_FOR_TAG = {
  'astro:fusion:F01': 'runway', 'astro:fusion:F02': 'income', 'astro:fusion:F03': 'invest',
  'astro:fusion:F04': 'external', 'astro:fusion:F05': 'pressure', 'astro:fusion:F06': 'reset',
};
const ALL_TAGS = Object.keys(RULE_FOR_TAG);
const ALL_RULES = Object.values(RULE_FOR_TAG);
const flag = (id, target) => ({ id, value: true, consumeBy: [target] });
const effect = (runway, optionality, load) => ({ runway, optionality, load });
const C = (id, label, immediate, fact, target, route, values) => ({
  id, label, immediate, delayedFlags: [flag(fact, target)], relationEffects: {},
  routeSignals: { [route]: 3 }, stateEffects: { work: effect(...values), life: {} },
  nextWeights: target.startsWith('ending_') ? {} : { [target]: 100 },
});
const N = (id, stage, preferredTags, transition, title, situation, conflict, roles, choices) => {
  const preferredRules = preferredTags.map((tag) => RULE_FOR_TAG[tag]);
  return {
    id, stage,
    match: { anyTags: ALL_TAGS, allTags: [], preferredTags, focus: preferredTags.map((tag) => FOCUS_FOR_TAG[tag]) },
    roles, copy: { transition, title, situation, conflict },
    evidenceSlots: [{ id: 'finance_why', requiredLayers: ['bazi', 'ziwei', 'period'], ruleIds: [...preferredRules, ...ALL_RULES.filter((rule) => !preferredRules.includes(rule))], fallbackTemplateId: 'evidence_partial_finance' }],
    choices, shareable: true, riskTags: ['finance'],
  };
};

const nodes = [
  N('FR01', 'facts', ['astro:fusion:F01'], '你终于没有再用“下个月应该会好一点”安慰自己，而是打开了账户。', '账上还有钱，但你不知道究竟能撑多久', '收入一阵有、一阵没有；固定开支却每个月准时来。眼前还有一个要花钱才能推进的机会。', '先把安全线算清，还是趁还有余量继续冲。', [], [
    C('FR01_C1', '把房租、吃饭、保险这些最低开支列出来，先算还能撑几个月', '数字可能不好看，但你终于知道自己的底线在哪里。', 'cash_floor_written', 'FR04', 'guard', [6, -1, -3]),
    C('FR01_C2', '先去确认未来 30 天最可能到账的三笔收入', '你没有把“可能有钱”当成“钱已经到了”。', 'receivables_checked', 'FR05', 'collect', [3, 2, -1]),
    C('FR01_C3', '给想做的事留一笔小预算，但先不一次花完', '机会还在，最坏情况也没有被你一把押上。', 'test_budget_reserved', 'FR06', 'test', [1, 5, 1]),
  ]),
  N('FR02', 'facts', ['astro:fusion:F02', 'astro:fusion:F04'], '最近确实有活，但“做完”和“到账”不是一回事。', '看起来不缺机会，账户却一直等钱', '林乔确认项目会结算，但验收、开票和付款日分得很开；另外两笔意向还没签。', '继续按乐观收入安排花费，还是先把回款节奏问明白。', ['lin'], [
    C('FR02_C1', '按已经到账的钱重做预算，不把口头意向算进去', '账面立刻变紧，却更接近真实情况。', 'booked_cash_only', 'FR04', 'guard', [6, -2, -2]),
    C('FR02_C2', '请林乔把验收、开票、付款日期一次说清', '你把“会付”追问成了哪天、满足什么条件才付。', 'payment_dates_written', 'FR05', 'collect', [4, 2, 0]),
    C('FR02_C3', '保留现有项目，同时找一件两周内能结算的小活', '它未必漂亮，但能减少只等一笔钱的被动。', 'quick_income_search', 'FR06', 'income', [2, 5, 2]),
  ]),
  N('FR03', 'facts', ['astro:fusion:F03', 'astro:fusion:F05'], '你不是没想法，只是每个想法都要先花一点钱。', '一个看起来不错的机会，正好撞上收入波动', '周澈提议一起做一轮小项目，需要先付工具、样品或推广成本；结果最快也要几周后才知道。', '不投入可能错过，投入太多又会伤到生活底盘。', ['zhou'], [
    C('FR03_C1', '先把这笔钱换算成“会少撑几个月”，再决定', '机会没变，代价从一个金额变成了生活时间。', 'cost_in_months', 'FR04', 'guard', [5, 0, -2]),
    C('FR03_C2', '先问清回款节点、失败上限和谁承担追加成本', '合作从一句“试试看”变成了能核对的条件。', 'terms_before_spend', 'FR05', 'collect', [3, 3, 0]),
    C('FR03_C3', '只拿原计划三分之一做第一轮验证', '你给机会一张入场券，没有把整张底牌交出去。', 'one_third_test', 'FR06', 'test', [1, 6, 1]),
  ]),

  N('FR04', 'first_move', ['astro:fusion:F01'], '安全线被你写出来后，很多“舍不得停”的开支终于能比较了。', '先守住，不等于什么都不做', '最低生活线算完后，你发现真正能动的不是所有开支，而是三四项可以暂停、降档或晚一点发生的支出。', '把预算砍得太狠会撑不久；不动又会继续漏水。', ['chen'], [
    C('FR04_C1', '只暂停三项非必要开支，保留吃饭、睡眠和工作工具', '你守住的是底盘，不是把日子过成惩罚。', 'three_costs_paused', 'FR07', 'guard', [6, 0, -3]),
    C('FR04_C2', '把每周可花金额单独转出来，超出就等下周', '预算开始有边界，不再靠每天纠结。', 'weekly_budget_set', 'FR08', 'guard', [5, 0, -2]),
    C('FR04_C3', '先不砍开支，给自己 14 天去补一笔短收入', '你选择先补水，但也给自己设了截止日。', 'income_deadline_set', 'FR09', 'income', [0, 5, 2]),
  ]),
  N('FR05', 'first_move', ['astro:fusion:F04'], '你把“什么时候有钱”问具体后，答案比想象中复杂。', '先把该收的钱收回来', '林乔愿意配合，但公司只能先付一部分；剩余款要等验收。另一笔意向仍然只有口头回复。', '接受分段回款，还是继续等一次结清。', ['lin'], [
    C('FR05_C1', '接受先付一部分，同时把尾款验收标准写进确认里', '钱能先回来一些，尾款也不再只靠一句承诺。', 'milestone_payment_set', 'FR07', 'collect', [5, 2, -1]),
    C('FR05_C2', '给所有未付款项目发一份简短的日期确认', '你不催情绪，只确认金额、条件和日期。', 'receivable_calendar_sent', 'FR08', 'collect', [4, 1, 0]),
    C('FR05_C3', '不再等口头意向，把时间拿去找能快速签约的活', '你放下了一个可能，换回可支配的时间。', 'verbal_lead_released', 'FR09', 'income', [2, 5, 1]),
  ]),
  N('FR06', 'first_move', ['astro:fusion:F03'], '你决定给机会一点空间，但这次先把试错范围画出来。', '小额投入，先验证最关键的一件事', '周澈列出了一串要买的东西。你们真正需要验证的，其实只是客户愿不愿意付费、样品能不能交付。', '先做最小验证，还是为了“看起来完整”把钱都花上。', ['zhou'], [
    C('FR06_C1', '只花能验证客户是否愿意付费的那一笔', '你买的是答案，不是完整配置。', 'payment_test_started', 'FR07', 'test', [0, 6, 1]),
    C('FR06_C2', '和周澈各出一半，并写明不追加投入', '合作继续，但追加成本没有默认落到你头上。', 'shared_cap_written', 'FR08', 'test', [1, 5, 0]),
    C('FR06_C3', '先用现有工具做一版，拿到真实反馈再买', '进度慢一点，现金没有先替假设买单。', 'no_cost_prototype', 'FR09', 'reset', [3, 3, -2]),
  ]),

  N('FR07', 'response', ['astro:fusion:F04'], '第一步落地后，现金没有立刻变多，但局面开始能看懂。', '一笔钱能提前回来，条件是你先交一小段成果', '林乔可以推动预付款，不过需要你在五天内交一个明确版本；这会占掉你找其他收入的时间。', '先换回现金确定性，还是保留时间弹性。', ['lin'], [
    C('FR07_C1', '接下这段交付，先把预付款拿回来', '短期会忙一点，账户先得到一次喘息。', 'advance_work_accepted', 'FR10', 'collect', [6, 1, 4]),
    C('FR07_C2', '只接自己能在两天内完成的部分，其余重新排期', '你要现金，也没有把整周一次卖掉。', 'advance_work_bounded', 'FR11', 'guard', [4, 2, 1]),
    C('FR07_C3', '放弃预付款，把时间留给更快结算的新活', '确定的钱暂时没拿到，你保留了另找出口的时间。', 'advance_declined', 'FR12', 'income', [-1, 5, 0]),
  ]),
  N('FR08', 'response', ['astro:fusion:F01', 'astro:fusion:F05'], '预算和回款日历摆在一起后，你第一次看见真正危险的那一周。', '下个月中间会有十天空档', '账单先到，回款后到。陈穗提醒你：总金额够不代表中间不会断。', '借短钱顶过去、继续压支出，还是提前补一笔收入。', ['chen'], [
    C('FR08_C1', '把一项可延后的支出挪到回款后，不新增借款', '空档被缩短，代价是有件事要晚一点。', 'expense_rescheduled', 'FR10', 'guard', [5, 0, -2]),
    C('FR08_C2', '和付款方确认能否提前一部分，给出明确交付交换', '你先尝试用条件换时间，不急着借钱。', 'early_payment_requested', 'FR11', 'collect', [4, 2, 1]),
    C('FR08_C3', '接一件周结的小活，专门填这十天空档', '这份活不代表方向，只负责把缺口补上。', 'bridge_gig_taken', 'FR12', 'income', [3, 4, 3]),
  ]),
  N('FR09', 'response', ['astro:fusion:F02', 'astro:fusion:F06'], '你把注意力从“还能省什么”挪到“最快能卖出什么”。', '短收入有机会，但价格和时间都不理想', '一个老客户愿意马上开工、两周结算，只是报价偏低；同时，小额验证也收到了第一批反馈。', '先换现金，还是继续等更好的价格和结果。', ['lin'], [
    C('FR09_C1', '接下老客户的活，但只承诺两周，不自动续', '你先买到两周确定性，没有把低价变成长期标准。', 'short_contract_taken', 'FR10', 'income', [5, 2, 3]),
    C('FR09_C2', '提一个略高报价，并把交付缩成最核心部分', '你没有硬扛原价，也没有把自己便宜打包。', 'compact_offer_sent', 'FR11', 'collect', [2, 4, 1]),
    C('FR09_C3', '不接低价活，给验证项目再留七天看付费反馈', '机会被保留，现金压力也会跟着多留七天。', 'seven_day_test_kept', 'FR12', 'test', [-2, 6, 2]),
  ]),

  N('FR10', 'shock', ['astro:fusion:F05'], '刚有一点秩序，一笔不能不付的钱又来了。', '突发支出撞上回款前的空档', '设备维修、家里必要支出或保险费用突然出现。它不是冲动消费，也不能一直拖。', '动用安全垫、分期，还是暂停原来的投入。', [], [
    C('FR10_C1', '先用安全垫处理，但把最低余额线往上调', '钱花出去了，新的警戒线也立刻生效。', 'emergency_paid_floor_raised', 'FR13', 'guard', [-4, 0, 2]),
    C('FR10_C2', '询问无额外费用的分段付款，把现金空档错开', '总成本没增加，最紧的那几天松开了。', 'cost_split_no_fee', 'FR14', 'collect', [2, 1, 0]),
    C('FR10_C3', '先暂停机会投入，用这笔预算处理必要支出', '机会慢下来，生活底盘没有被两头挤。', 'investment_paused_for_need', 'FR15', 'reset', [3, -3, -3]),
  ]),
  N('FR11', 'shock', ['astro:fusion:F03'], '外部条件稍微变好，投入机会却给了一个很短的截止时间。', '现在加一点钱，可能把试验推到真实客户面前', '周澈拿到一个展示窗口，需要追加一小笔制作成本；错过就要再等一个月。', '为窗口加码，还是坚持原来的金额上限。', ['zhou'], [
    C('FR11_C1', '只在已有付费意向能覆盖成本时追加', '你没有拒绝机会，只要求它先拿出一点证据。', 'evidence_before_add', 'FR13', 'test', [0, 5, 1]),
    C('FR11_C2', '从原预算里挪，不突破总上限', '投入方向变了，总风险没有跟着变大。', 'budget_reallocated', 'FR14', 'test', [1, 4, 1]),
    C('FR11_C3', '这次不追窗口，等现有验证结果再说', '你错过一个时间点，也保住了再选择的资格。', 'deadline_not_chased', 'FR15', 'reset', [4, -2, -2]),
  ]),
  N('FR12', 'shock', ['astro:fusion:F06'], '收入出口还在试，身体和注意力先发出了账单。', '小活、催款和试验一起挤进一周', '事情单看都能做，叠在一起却开始影响睡眠和交付。', '继续全接，还是砍掉一条暂时不重要的线。', [], [
    C('FR12_C1', '保留最快结算的活，暂停没有付费信号的试验', '你先保现金，也承认精力有上限。', 'unpaid_test_paused', 'FR13', 'reset', [4, -3, -5]),
    C('FR12_C2', '保留试验，只接不超过两天的短活', '方向没丢，短收入也被限制在可承受范围。', 'gig_time_capped', 'FR14', 'test', [1, 4, -2]),
    C('FR12_C3', '给自己一天不接新事，把现有交付收完', '少赚一天的可能性，换来不把已有收入做砸。', 'one_day_reset', 'FR15', 'reset', [2, 0, -6]),
  ]),

  N('FR13', 'window', ['astro:fusion:F02', 'astro:fusion:F04'], '前面的取舍开始回到现实里：有一条收入线愿意往前走。', '一个客户愿意试单，但先只做小额', '对方愿意付一笔不大的试做费，做好后再谈后续。金额不够解决全部压力，却能验证需求。', '把它当收入、当验证，还是嫌小不接。', ['lin'], [
    C('FR13_C1', '接试单，交付范围写到一页纸里', '钱不算多，但这是一笔有边界的真实收入。', 'paid_pilot_scoped', 'FR16', 'income', [4, 4, 2]),
    C('FR13_C2', '接试单，同时约好交付后哪天谈后续', '你不拿小单幻想长期，也不给它做完就散。', 'pilot_review_booked', 'FR17', 'test', [3, 5, 2]),
    C('FR13_C3', '不接这笔小单，把时间留给更高价值的项目', '你保留上行空间，也接受短期现金不会增加。', 'small_pilot_declined', 'FR18', 'invest', [-2, 5, 0]),
  ]),
  N('FR14', 'window', ['astro:fusion:F03'], '原来的小额投入已经给出一点结果，现在要决定要不要走第二步。', '反馈不错，但还没有稳定付费', '有人愿意继续聊，也有人只是说“挺好”。周澈想把下一版做得更完整。', '把好评当信号，还是只认付费和复购。', ['zhou'], [
    C('FR14_C1', '只有出现第二个付费用户才追加下一笔', '你把“大家觉得不错”换成了一个能验证的门槛。', 'second_payment_gate', 'FR16', 'test', [1, 5, 0]),
    C('FR14_C2', '追加一小笔，但写明七天后没有付费就停', '机会继续，截止日也一起写进去了。', 'seven_day_spend_cap', 'FR17', 'invest', [-1, 6, 2]),
    C('FR14_C3', '不再花钱，先用现有版本主动找十个客户', '你先增加行动，不增加成本。', 'ten_customer_outreach', 'FR18', 'income', [2, 4, 1]),
  ]),
  N('FR15', 'window', ['astro:fusion:F01', 'astro:fusion:F06'], '暂停一部分投入后，你发现选择没有消失，只是没那么急了。', '一份稳定的小合同出现，但会占掉部分时间', '它能覆盖基本开支的一部分，内容不算理想；好处是按月结算、边界明确。', '先补底盘，还是继续把时间押在更大的可能上。', [], [
    C('FR15_C1', '先签三个月，每周限定天数，不默认续约', '底盘多了一块，也没有把未来一次锁死。', 'three_month_base', 'FR16', 'guard', [7, -1, 2]),
    C('FR15_C2', '谈成按交付计费，给机会项目留固定时间', '稳定收入和试验都留下，但日程要更精细。', 'delivery_based_base', 'FR17', 'balance', [4, 3, 3]),
    C('FR15_C3', '不接，把未来四周集中给高潜项目', '你放弃稳定垫，也给机会一个明确验证周期。', 'four_week_bet', 'FR18', 'invest', [-4, 7, 2]),
  ]),

  N('FR16', 'collision', ['astro:fusion:F01'], '到了月底，安全感没有完全回来，但账已经不像一开始那么乱。', '现金线稳了一点，机会线也在敲门', '你手上已有一笔确定收入或回款，同时还有一个能继续验证的机会。两边都做满会很累。', '先把底盘补厚，还是拿一小部分继续试。', [], [
    C('FR16_C1', '先把安全垫补到三个月，再考虑新增投入', '你没有否定机会，只把顺序改成先站稳。', 'three_month_floor_first', 'FR19', 'guard', [7, -2, -3]),
    C('FR16_C2', '把新增收入的 10% 留给验证，其余补安全垫', '守和投不再二选一，各自有了上限。', 'ten_percent_test', 'FR20', 'balance', [4, 4, 0]),
    C('FR16_C3', '趁窗口在，把一半新增收入继续投进去', '机会被放大，现金缓冲也明显变薄。', 'half_new_income_invested', 'FR21', 'invest', [-4, 7, 3]),
  ]),
  N('FR17', 'collision', ['astro:fusion:F03', 'astro:fusion:F05'], '一边有小收入，一边有反馈，最难的反而是决定什么算“够好”。', '项目有进展，但还没好到能让你放心加码', '试单完成、反馈不错，却没有稳定复购；基础收入能托住一部分生活，也占了不少时间。', '继续两条线并行，还是主动砍掉一条。', [], [
    C('FR17_C1', '保留基础收入，项目每周只做一个验证动作', '进展会慢，但你不用每天拿生活费赌答案。', 'one_test_per_week', 'FR19', 'guard', [5, 2, -2]),
    C('FR17_C2', '再并行四周，写下到期必须看的三个数字', '你允许复杂存在，也不给并行状态无限续期。', 'four_week_scorecard', 'FR20', 'balance', [2, 5, 1]),
    C('FR17_C3', '暂停基础收入，把时间集中给已经付费的方向', '上行空间变大，短期波动也会更明显。', 'paid_direction_focus', 'FR21', 'invest', [-3, 7, 2]),
  ]),
  N('FR18', 'collision', ['astro:fusion:F06'], '四周快到了，投入过时间或钱，却还没有一个漂亮答案。', '继续不甘心，停下又像前面白做了', '已有零星反馈或收入，但离稳定还远。真正的问题是：下一笔投入能验证什么，还是只为证明前面没错。', '按沉没成本继续，还是重新设门槛。', [], [
    C('FR18_C1', '停止新增投入，先把已有成果变成能卖的最小版本', '你没有把前面的积累扔掉，只是不再继续加钱。', 'minimum_sellable_version', 'FR19', 'reset', [5, 1, -3]),
    C('FR18_C2', '再给一次小额预算，但必须换回明确付费验证', '这是最后一次有条件的试验，不是情绪加码。', 'last_paid_validation', 'FR20', 'test', [0, 6, 1]),
    C('FR18_C3', '承认这轮验证没过，关掉项目，重建收入线', '会不甘心，但现金和注意力终于停止继续流失。', 'project_closed', 'FR21', 'reset', [4, -4, -5]),
  ]),
];

const endingRows = [
  ['ending_guard_test', '守住底盘，小步继续', '你没有把机会关掉，而是先设现金安全线，再用小预算换真实答案。', '生活底盘更稳，机会仍有入口。', '进展不会很快，也可能错过一部分窗口。', '把下一次投入写成金额、验证指标和停止日期。', '我没有选择彻底躺平，也没有一把押上。我先把能撑多久算清，再拿一小笔钱买答案。'],
  ['ending_stable_base', '先补稳定收入', '你先用一份边界清楚的收入覆盖基本开支，再给更大的可能留固定时间。', '每个月少一点恐慌，判断不再被账户余额追着跑。', '短期可支配时间变少，增长速度会慢。', '给稳定收入设三个月复盘点，别让过渡方案自动变成永久安排。', '收入不稳的时候，我先补了一块底盘。不是认输，是不想每天拿生活费做决定。'],
  ['ending_collect_first', '先把该回来的钱收回来', '你没有急着找下一笔投入，而是把验收、开票和回款日期逐项落了下来。', '现金流更接近真实，旧账不再一直占用注意力。', '一些新机会会被你暂时放慢。', '每周只跟进一次回款表：金额、条件、负责人、日期。', '有时候不是赚得不够，而是“会到账”被当成了“已经到账”。我先把这件事说清了。'],
  ['ending_bounded_invest', '有限加码，拿结果说话', '你保留了投入，但每一笔都对应一个能看见的付费或交付验证。', '机会获得了真正的测试，不再只停留在想象。', '安全垫会变薄，验证失败就必须按约定停止。', '任何追加投入前，先回答：这笔钱要验证什么，几天后看什么。', '我还是投了，但只投到能看见答案的那一步。后面的钱，等真实付费再说。'],
  ['ending_pause_reset', '暂停加码，重新排现金线', '你承认这一轮验证还不够，先停止新增支出，把时间转回收入恢复。', '现金和注意力不再继续漏，选择权慢慢回来。', '会有沉没成本感，也要接受项目可能就此结束。', '保留成果和复盘记录，连续四周不新增项目支出。', '我没有等到一个漂亮结果，所以先停了。停下不是白做，是不再为了证明过去正确继续花钱。'],
  ['ending_dual_track', '两条线并行，但都有期限', '你保留基础收入和小额试验，用固定时间、固定预算和复盘点防止两边失控。', '安全和上行空间都没有完全放弃。', '安排会更复杂，最怕的是复盘日到了还不肯取舍。', '四周后只看三件事：实际到账、有效客户、身心负荷。', '我暂时没有二选一：一条线管生活，一条线试未来。但两条都写了截止日。'],
];
const endings = endingRows.map(([id, title, core, gain, cost, instruction, hook]) => ({
  id, match: { anyTags: [`flag:${id}`] }, routeWeights: {},
  summary: { title, core, gain, cost, alternativeHint: '如果重走一次，可以试试与这次相反的关键选择，看看安全线和机会会怎样变化。', qualityVariants: [] },
  action: { instruction }, share: { hook, insight: core, question: '收入不稳的时候，你会先守住底盘，还是拿一小部分继续试？' },
}));

const landingData = {
  FR19: { title: '你决定先把底盘放在第一位', transition: '走到这里，你需要的不是一个永远正确的答案，而是未来四周能执行的财务顺序。', rows: [
    ['先补到三个月安全垫，再用小预算试一次', '现金先有底，机会随后排队。', 'ending_guard_test'],
    ['先接边界清楚的稳定收入，三个月后再评估', '你先把每个月最让人慌的那块补上。', 'ending_stable_base'],
    ['暂停新投入，先把所有应收款和可结算工作收回来', '你先处理已经发生的价值，不急着再开新口子。', 'ending_collect_first'],
  ] },
  FR20: { title: '你决定让安全和机会同时存在，但都不能无限长', transition: '两条线都还有理由继续，真正需要被限制的是金额、时间和复盘日期。', rows: [
    ['只为一个明确付费验证追加最后一笔小预算', '这笔钱有任务，也有停止日期。', 'ending_bounded_invest'],
    ['一条线管生活，一条线试未来，四周后必须取舍', '并行不是拖延，因为复盘点已经写下。', 'ending_dual_track'],
    ['先停两周，把账、回款和精力重新排一遍', '你暂停的是混乱，不是未来所有可能。', 'ending_pause_reset'],
  ] },
  FR21: { title: '你决定不再让“已经投入了”替你做下一次决定', transition: '机会或许还在，但现金余量和精力已经要求你给出更明确的边界。', rows: [
    ['承认这轮没验证过，停止新增投入，先恢复收入', '你把继续流失关掉，重新拿回选择权。', 'ending_pause_reset'],
    ['保留已经付费的方向，其余全部暂停', '你不是全盘放弃，只留下真实发生过的收入。', 'ending_bounded_invest'],
    ['先接一份能覆盖基本开支的过渡工作，再慢慢整理项目', '你给生活补上底盘，也给项目留了以后再看的可能。', 'ending_stable_base'],
  ] },
};
Object.entries(landingData).forEach(([id, data]) => nodes.push(N(id, 'landing', ['astro:fusion:F01', 'astro:fusion:F06'], data.transition, data.title, '你要决定接下来四到八周，钱和时间先往哪里去。', '不追求一次选对，只让下一步可承受、可复盘。', [], data.rows.map(([label, immediate, endingId], index) => C(`${id}_C${index + 1}`, label, immediate, endingId, endingId, endingId, [index === 2 ? 5 : 3, index === 1 ? 4 : 1, -3])))));

export const FINANCE_RUNWAY = {
  id: 'finance_runway', entry: 'finance_runway', version: '0.6.0', title: '收入不稳，先守住还是再投入',
  themeId: 'finance', themeLabel: '财务岔路', resultLabel: '财务路线', shareBrand: 'MINGLI · 财务岔路', journeyLabel: '来走一遍你的财务岔路', evidenceLabel: '这一轮的命盘底色',
  chipLabels: { safety: '现金安全线', opportunity: '可验证机会', load: '资金与精力压力' }, stageLabels: { unemployed: '收入波动期' },
  characters: {
    lin: { name: '林乔', identity: '客户项目联系人', relationship: '只确认交付、验收和回款条件' },
    zhou: { name: '周澈', identity: '合作伙伴', relationship: '和你一起验证小项目，不替你承担全部风险' },
    chen: { name: '陈穗', identity: '信任的朋友', relationship: '帮你把现金事实列清，不提供投资建议' },
  },
  nodes,
  stages: [
    { id: 'facts', candidates: ['FR01', 'FR02', 'FR03'] }, { id: 'first_move', candidates: ['FR04', 'FR05', 'FR06'] },
    { id: 'response', candidates: ['FR07', 'FR08', 'FR09'] }, { id: 'shock', candidates: ['FR10', 'FR11', 'FR12'] },
    { id: 'window', candidates: ['FR13', 'FR14', 'FR15'] }, { id: 'collision', candidates: ['FR16', 'FR17', 'FR18'] },
    { id: 'landing', candidates: ['FR19', 'FR20', 'FR21'] },
  ],
  endings, shareCopy: Object.fromEntries(endings.map((ending) => [ending.id, ending.share])),
};
