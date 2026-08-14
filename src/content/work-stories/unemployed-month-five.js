// 《失业后的第五个月》正式内容数据。字段与内容圣经 §11.1 contract 对齐。
const flag = (id, consumeBy) => ({ id, value: true, consumeBy });
const life = (work) => ({
  pressure: Math.round((work.load || 0) * 0.8), opportunity: Math.round((work.optionality || 0) * 0.8),
  relationship: Math.round((work.optionality || 0) * 0.1), stability: Math.round((work.runway || 0) * 0.6),
  resources: Math.round((work.runway || 0) * 0.7 + (work.optionality || 0) * 0.2), wellbeing: Math.round((work.load || 0) * -0.8),
});
const choice = (id, label, immediate, flags, relations, routeSignals, work, nextWeights = {}) => ({
  id, label, immediate, delayedFlags: flags.map(([key, consumeBy]) => flag(key, consumeBy)), relationEffects: relations,
  routeSignals, stateEffects: { work, life: life(work) }, nextWeights,
});
const CRITICAL_VARIANTS = {
  JL01: [{ id: 'jl01-cash-anchor', priority: 2, when: { tags: ['astro:fusion:M01'] }, copyPatch: { conflict: '现金余量已经成为这次 Offer 最具体的锚点；继续等待也必须有明确期限。' } }],
  JL04: [{ id: 'jl04-terms-echo', priority: 2, when: { flags: ['asked_terms'] }, copyPatch: { situation: '你先前追问过职责和试用期规则；现在顾言等你把“愿意接受”落实成书面边界。' } }],
  JL16: [{ id: 'jl16-load-variant', priority: 2, when: { tags: ['astro:fusion:M07'] }, copyPatch: { conflict: '在高压信号下，并行不是单纯效率问题；恢复成本也会进入这次承诺的账。' } }],
};
const FUSION_RULES = {
  M01: 'M01_cash_anchor', M02: 'M02_role_contract', M03: 'M03_proof_before_title', M04: 'M04_peer_project',
  M05: 'M05_external_move', M06: 'M06_learn_to_switch', M07: 'M07_rest_then_decide', M08: 'M08_home_runway',
  M09: 'M09_output_vs_rules', M10: 'M10_income_dual_track', M11: 'M11_change_under_load', M12: 'M12_support_and_reference',
};
const evidenceRulesFor = (anyTags, preferredRule) => Array.from(new Set([
  preferredRule,
  ...anyTags.filter((tag) => tag.startsWith('astro:fusion:')).map((tag) => FUSION_RULES[tag.slice('astro:fusion:'.length)]).filter(Boolean),
]));
const node = (id, stage, anyTags, title, situation, conflict, roles, choices, evidenceRule = 'M01_cash_anchor') => ({
  id, stage, match: { anyTags, allTags: ['entry:job_lost'], minScore: 0 }, roles,
  copy: { title, situation, conflict }, variants: CRITICAL_VARIANTS[id] || [],
  evidenceSlots: [{ id: 'node_why_this', requiredLayers: ['bazi', 'ziwei', 'period'], ruleIds: evidenceRulesFor(anyTags, evidenceRule), fallbackTemplateId: 'evidence_partial_work' }],
  choices, shareable: true, riskTags: ['career'],
});
const NODES = [];
NODES.push(
  node('JL01', 'setup', ['astro:fusion:M01', 'astro:fusion:M02'], '只够再等三个月', '顾言发来书面 Offer：薪资是上一份工作的 82%，48 小时内答复，岗位内容基本熟悉。', '现金确定性，还是继续等待更匹配的机会。', ['gu'], [
    choice('JL01_C1', '回复原则上接受，但先看完整职责和试用期规则', '顾言把岗位说明和绩效口径发来，Offer 暂时保住，但你还没有签字。', [['offer_alive', ['JL04', 'JL05', 'JL19']], ['asked_terms', ['JL04', 'ending_conditional_entry']]], { gu: 1 }, { employment: 2, conditional_entry: 1 }, { runway: 5, optionality: 1, load: 1 }, { JL04: 8, JL05: 2, JL06: -5 }),
    choice('JL01_C2', '拿现有 Offer 去争取一次薪资或签字费调整', '顾言没有当场拒绝，要求你用职责差异说明期望。', [['negotiation_open', ['JL05', 'ending_conditional_entry']]], {}, { conditional_entry: 3 }, { runway: 0, optionality: 4, load: 2 }, { JL05: 8 }),
    choice('JL01_C3', '明确谢绝，把两周留给更匹配的岗位', '回复发出后短暂松了一口气；三个月安全余量正式开始倒数。', [['offer_declined', ['JL06', 'JL11', 'JL21']], ['search_deadline_14d', ['JL06', 'JL18']]], { gu: -1 }, { reskill_pilot: 1 }, { runway: -6, optionality: 3, load: 1 }, { JL06: 8 }),
  ]),
  node('JL02', 'setup', ['astro:fusion:M03', 'astro:fusion:M09'], '职位比上一份低一级', '薪资下降之外，职位名称也低一级。顾言说入职后有机会重新定级，却没有书面时间表。', '职业叙事，还是短期落脚。', ['gu'], [
    choice('JL02_C1', '要求把三个月后的定级评估写进补充邮件', '顾言确认评估时间，但只肯写“根据表现讨论”。', [['review_in_writing', ['JL19', 'ending_conditional_entry']], ['offer_alive', ['JL04', 'JL05']]], { gu: 1 }, { conditional_entry: 2 }, { runway: 3, optionality: 4, load: 1 }, { JL05: 4 }),
    choice('JL02_C2', '接受职级，换取负责一个能写进作品集的核心模块', '部门把核心模块列进职责，你得到可见作品，也承担更多责任。', [['portfolio_role', ['JL13', 'JL19']], ['offer_alive', ['JL04']]], {}, { employment: 1, independent: 1 }, { runway: 4, optionality: 5, load: 3 }, { JL04: 6, JL13: 5 }),
    choice('JL02_C3', '暂不答应，先问三位在职者真实晋升情况', '你得到两条互相矛盾的信息，也看见了判断盲区。', [['company_diligence', ['JL04', 'JL19']], ['decision_delay', ['JL06', 'JL11', 'JL18']]], {}, { conditional_entry: 1 }, { runway: -1, optionality: 3, load: 1 }, { JL06: 3 }),
  ], 'M03_proof_before_title'),
  node('JL03', 'setup', ['astro:fusion:M05', 'astro:fusion:M11'], '工作在另一座城', 'Offer 六周后需要迁往另一座城，试用期不能远程；搬家会消耗半个月必要支出。', '环境窗口，还是迁移成本。', ['gu'], [
    choice('JL03_C1', '接受异地安排，同时要求临时住宿支持', '顾言愿意申请临时住宿，但要你先给明确入职意向。', [['relocation_open', ['JL04', 'JL05', 'JL15']], ['benefit_request', ['JL05', 'ending_conditional_entry']]], {}, { employment: 2, conditional_entry: 1 }, { runway: 1, optionality: 6, load: 3 }, { JL04: 4, JL15: 7 }),
    choice('JL03_C2', '提议先远程试做四周，再决定是否搬迁', '用人经理觉得可行，HR 要求你完成一次额外业务面试。', [['remote_trial_requested', ['JL15']], ['extra_interview', ['JL15']]], {}, { reskill_pilot: 2 }, { runway: -1, optionality: 5, load: 2 }, { JL15: 10 }),
    choice('JL03_C3', '不为这份 Offer 搬家，转向本地与远程岗位', '路线更清楚了，但可投岗位池缩小。', [['location_boundary', ['JL06', 'JL15', 'JL21']], ['offer_declined', ['JL06']]], {}, { reset: 1 }, { runway: -5, optionality: 1, load: -1 }, { JL06: 5 }),
  ], 'M05_external_move'),
);
NODES.push(
  node('JL16', 'collision', ['flag:signed_offer', 'flag:pilot_lead', 'astro:fusion:M10'], '入职日撞上项目验收', '固定工作培训和周屿项目验收在同一周。两边都需要你在线。', '承诺、信用与时间不能两全。', ['gu', 'zhou'], [
    choice('JL16_C1', '提前向周屿交接，按原范围完成后退出项目', '周屿有时间补位；你失去后续分成，但没有临时甩手。', [['project_exited_cleanly', ['ending_stabilize', 'ending_dual_track']]], { zhou: 1 }, { employment: 3, reset: 1 }, { runway: 4, optionality: -2, load: -4 }),
    choice('JL16_C2', '向新公司报备非竞业项目，争取把培训错开半天', '有报备边界时更易获批；否则顾言会追问排他问题。', [['dual_disclosed', ['JL20', 'ending_dual_track']]], { gu: 1, zhou: 1 }, { dual_track: 4, employment: 1 }, { runway: 2, optionality: 5, load: 4 }, { JL20: 8 }),
    choice('JL16_C3', '两边都不说明，靠晚上和周末做完', '第一周勉强顶住，一次延误让双方都开始追问。', [['hidden_dual_track', ['JL20', 'ending_dual_track']], ['overextended', ['JL20', 'JL21']]], { gu: -2, zhou: -2 }, { dual_track: 1 }, { runway: 1, optionality: 1, load: 10 }, { JL20: 6 }),
  ], 'M10_income_dual_track'),
  node('JL17', 'collision', ['flag:pilot_lead', 'flag:short_gig', 'astro:fusion:M01'], '客户要验收后 45 天付款', '项目接近交付，客户把付款改成验收后 45 天。作品能上线，现金却不会马上改善。', '案例署名，还是付款边界。', ['zhou'], [
    choice('JL17_C1', '要求先付无争议部分，剩余款按 45 天结算', '客户同意先付一小部分，现金风险被拆开。', [['partial_payment', ['JL20', 'ending_independent']], ['invoice_protected', ['JL20', 'ending_independent']]], {}, { independent: 4 }, { runway: 4, optionality: 4, load: 2 }, { JL20: 6 }),
    choice('JL17_C2', '接受 45 天账期，换案例署名和客户推荐', '眼前仍紧，但作品与背书变强。', [['client_reference', ['JL20', 'JL21']], ['payment_delayed', ['JL20', 'JL21']]], {}, { independent: 3, reskill_pilot: 1 }, { runway: -4, optionality: 7, load: 4 }, { JL20: 5 }),
    choice('JL17_C3', '暂停交付，等付款条款确认后再上线', '你守住合同边界，项目时间表延后。', [['delivery_paused', ['JL20', 'ending_independent']]], { zhou: -1 }, { reset: 1 }, { runway: -1, optionality: -2, load: 1 }),
  ]),
  node('JL18', 'collision', ['flag:support_used', 'flag:hard_deadline', 'astro:fusion:M08'], '梁澄问：这次要等到哪一天？', '梁澄愿意继续支持，但希望共同定一个具体日期，到那天若收入仍未稳定就启用备用方案。', '共同期限，还是独自承担。', ['liang'], [
    choice('JL18_C1', '共同定下四周止损线，并列出过渡工作', '支持有了边界，不用每天重新争论还要不要等。', [['family_deadline', ['JL19', 'JL21']], ['fallback_ready', ['JL19', 'ending_reset']]], { liang: 3 }, { reset: 3, employment: 1 }, { runway: 5, optionality: 1, load: -4 }, { JL19: 4, JL21: 6 }),
    choice('JL18_C2', '请求再给八周，只押两个明确机会', '梁澄同意，但要求每两周一起看进展。', [['extended_runway', ['JL20', 'JL21']], ['biweekly_review', ['JL20', 'JL21']]], { liang: 1 }, { reskill_pilot: 2 }, { runway: 6, optionality: 4, load: 1 }, { JL20: 3 }),
    choice('JL18_C3', '不接受共同期限，决定自己承担后续支出', '你保留决定权，也失去部分生活支持。', [['support_withdrawn', ['JL21', 'ending_reset']]], { liang: -3 }, { independent: 1 }, { runway: -8, optionality: 1, load: 3 }, { JL21: 6 }),
  ], 'M08_home_runway'),
  node('JL19', 'landing', ['flag:signed_offer', 'flag:bounded_offer', 'astro:fusion:M02'], '固定岗位的最后确认', '顾言需要你最后确认入职。现在你已知道岗位边界和自己手里的其他筹码。', '确定性、边界与仍在发展的机会。', ['gu'], [
    choice('JL19_C1', '按现有条件入职，暂停其他项目至少八周', '收入和作息重新有锚点，副线暂时关掉。', [['ending_stabilize', ['ending_stabilize']]], {}, { employment: 6 }, { runway: 12, optionality: -4, load: -1 }),
    choice('JL19_C2', '只在书面职责或报备边界确认后入职', '你没有拿到全部理想条件，但把最易失控的一项写清了。', [['ending_conditional_entry', ['ending_conditional_entry']]], { gu: 1 }, { conditional_entry: 6, employment: 2 }, { runway: 9, optionality: 3, load: 1 }),
    choice('JL19_C3', '在签约前退出，集中完成已验证的另一条路', '固定收入窗口关闭，接下来的路必须由作品、项目或期限支撑。', [['ending_reskill_pilot', ['ending_reskill_pilot', 'ending_independent']]], {}, { reskill_pilot: 3, independent: 2 }, { runway: -7, optionality: 5, load: 2 }),
  ], 'M02_role_contract'),
  node('JL20', 'landing', ['flag:pilot_lead', 'flag:warm_interview', 'astro:fusion:M10'], '两条路都还活着，但时间只够一条半', '固定岗位或面试线有明确下一步，独立项目也出现真实客户。未来八周只能给其中一条完整精力。', '主副排序，不是全都要。', ['gu', 'zhou'], [
    choice('JL20_C1', '固定工作作主线，只保留每周半天维护非竞业项目', '两条路都活着，但副线增长会慢。', [['ending_dual_track', ['ending_dual_track']]], {}, { dual_track: 6, employment: 2 }, { runway: 8, optionality: 5, load: 3 }),
    choice('JL20_C2', '项目作主线，只保留少量求职面试作为止损线', '作品与收入验证加速，现金仍会波动。', [['ending_independent', ['ending_independent']]], {}, { independent: 6, reskill_pilot: 1 }, { runway: -2, optionality: 9, load: 5 }),
    choice('JL20_C3', '放弃并行，选择证据最强的一条并明确结束另一条', '心里少了一条也许，执行成本显著下降。', [['ending_stabilize', ['ending_stabilize', 'ending_conditional_entry']]], {}, { employment: 2, reset: 2 }, { runway: 4, optionality: 2, load: -5 }),
  ], 'M10_income_dual_track'),
  node('JL21', 'landing', ['state:load:high', 'flag:offer_declined', 'astro:fusion:M07'], '先把下一步缩到四周', '此刻没有一条路足以承诺一年，但可以承诺未来四周。', '用小周期获得证据，还是继续靠模糊希望拖延。', ['liang'], [
    choice('JL21_C1', '四周完成新方向作品，并访谈 5 位从业者', '转行不再是一句愿望，但一个月内没有稳定收入。', [['ending_reskill_pilot', ['ending_reskill_pilot']]], {}, { reskill_pilot: 6 }, { runway: -5, optionality: 8, load: 3 }),
    choice('JL21_C2', '四周只做已有人愿意付钱的服务，验证两位客户', '自主路线开始用付款而不是兴奋感证明自己。', [['ending_independent', ['ending_independent']]], {}, { independent: 6 }, { runway: 1, optionality: 7, load: 5 }),
    choice('JL21_C3', '暂停求职与项目 7–14 天，处理账单后按止损线重启', '窗口暂时变少，判断力和节奏开始回来。', [['ending_reset', ['ending_reset']]], {}, { reset: 6 }, { runway: -3, optionality: -3, load: -10 }),
  ], 'M07_rest_then_decide'),
);
NODES.push(
  node('JL10', 'cost_returns', ['flag:targeted_search', 'flag:portfolio_proof_1', 'astro:fusion:M09'], '背调问到了那段空白', '面试方问起空窗期，你需要解释这段时间做了什么，也要决定是否交出联系人。', '坦诚与证据，还是把空白藏过去。', ['cheng'], [
    choice('JL10_C1', '说明空窗期做过的具体项目，并给出可核实联系人', '对方没有追问情绪，而是要求补一份项目材料。', [['gap_explained', ['JL13', 'JL19']], ['credible_gap', ['JL13', 'JL19']]], { cheng: 1 }, { employment: 2, conditional_entry: 1 }, { runway: 0, optionality: 6, load: 2 }, { JL13: 5, JL19: 4 }),
    choice('JL10_C2', '只强调个人调整，不提供项目细节', '对方礼貌接受，但背景信息没有变强。', [['gap_private', ['JL19']], ['reference_doubt', ['JL19']]], {}, { reset: 1 }, { runway: 0, optionality: -1, load: -1 }, { JL19: 2 }),
    choice('JL10_C3', '先请程岚确认能否作为参考人，再回复对方', '程岚愿意支持，但要你先把材料发全。', [['reference_prepared', ['JL13', 'JL19']]], { cheng: 1 }, { conditional_entry: 1 }, { runway: -1, optionality: 4, load: 1 }, { JL13: 3 }),
  ], 'M09_output_vs_rules'),
  node('JL11', 'cost_returns', ['flag:support_used', 'flag:short_gig', 'astro:fusion:M01'], '一笔没计划的必要支出', '电脑维修或家中支出约等于半个月必要开支，它把等待窗口明显缩短。', '提前止损、使用支持，还是加短单。', ['liang'], [
    choice('JL11_C1', '用存款支付，并把求职止损线提前两周', '支出处理完，接下来每个机会都更受期限影响。', [['runway_shortened', ['JL18', 'JL19', 'JL21']], ['hard_deadline', ['JL18', 'JL21']]], {}, { reset: 1 }, { runway: -9, optionality: 0, load: 3 }, { JL18: 7 }),
    choice('JL11_C2', '向梁澄说明金额，借短期周转并约定归还节点', '现金线没断，支持债增加；共同预算会降低关系成本。', [['support_debt_1', ['JL18', 'JL21']]], { liang: 1 }, { reset: 1 }, { runway: -3, optionality: 1, load: 1 }, { JL18: 5 }),
    choice('JL11_C3', '临时增加短单工时覆盖这笔支出', '钱补回一部分，作品和面试准备被压缩。', [['gig_overload', ['JL12', 'JL16', 'JL20']], ['independent_income_1', ['JL17', 'JL20']]], {}, { independent: 2 }, { runway: 2, optionality: -2, load: 7 }, { JL12: 8 }),
  ]),
  node('JL12', 'cost_returns', ['state:load:high', 'flag:gig_overload', 'astro:fusion:M07'], '凌晨两点还在改同一页简历', '连续几晚在 Offer、项目和投递之间切换，重要沟通里漏看了关键条件。', '继续硬顶，还是让判断力先回来。', ['liang'], [
    choice('JL12_C1', '砍掉一条低优先级任务，给自己两晚完整睡眠', '进度慢了一点，第三天你重新分清了重点。', [['recovery_2', ['JL16', 'JL18', 'JL20']], ['task_dropped', ['JL16', 'JL21']]], {}, { reset: 3 }, { runway: -1, optionality: -1, load: -8 }, { JL18: 5 }),
    choice('JL12_C2', '保留所有任务，但每天只在两个固定时段工作', '第一周仍拥挤，不过切换次数下降了。', [['recovery_1', ['JL16', 'JL20']], ['timeboxed', ['JL16', 'JL20']]], {}, { dual_track: 1, reset: 1 }, { runway: 0, optionality: 1, load: -4 }, { JL16: 4 }),
    choice('JL12_C3', '继续顶一周，等结果出来再休息', '事情没有立刻崩掉，但高压选项的成本更高。', [['overextended', ['JL16', 'JL18', 'JL20', 'JL21']]], {}, { independent: 1 }, { runway: 0, optionality: 2, load: 8 }, { JL16: 5 }),
  ], 'M07_rest_then_decide'),
  node('JL13', 'external_window', ['flag:portfolio_feedback', 'flag:portfolio_role', 'astro:fusion:M03'], '三年前的项目突然被问起', '程岚把一页案例转给招聘经理，对方邀请你用 30 分钟讲清当年的关键决策。', '补证据、包装成果，还是放弃这个窗口。', ['cheng'], [
    choice('JL13_C1', '补齐数据来源，按问题—动作—结果—局限准备讲述', '招聘经理认可你的判断过程，并约正式面试。', [['warm_interview', ['JL19', 'JL20', 'JL21']], ['portfolio_proof_2', ['JL19', 'JL20']]], { cheng: 2 }, { conditional_entry: 2, reskill_pilot: 1 }, { runway: -1, optionality: 9, load: 3 }, { JL19: 7, JL20: 4 }),
    choice('JL13_C2', '重点包装最终成果，略去失败尝试', '讲述更漂亮，追问失败原因时却出现空白。', [['polished_story', ['JL19', 'JL20']], ['credibility_risk', ['JL19', 'JL20']]], {}, { employment: 1 }, { runway: 0, optionality: 4, load: 2 }, { JL19: 2 }),
    choice('JL13_C3', '把机会让给当前 Offer 或项目，不再额外准备', '时间压力下降，程岚尊重取舍，但不会继续推窗口。', [['intro_declined', ['JL19', 'JL21']]], {}, { employment: 1 }, { runway: 1, optionality: -4, load: -3 }, { JL19: 3 }),
  ], 'M03_proof_before_title'),
  node('JL14', 'external_window', ['flag:pilot_lead', 'flag:pilot_module', 'astro:fusion:M04'], '试点项目突然加了一整块需求', '客户在中期验收前增加原方案没有的需求。周屿说先做再谈钱。', '客户关系，还是范围与付款边界。', ['zhou'], [
    choice('JL14_C1', '先做最小版本，把新增范围、报价和验收写进邮件', '客户同意先看最小版本，尾款不再完全绑定新增需求。', [['scope_controlled', ['JL17', 'JL20']], ['invoice_protected', ['JL17', 'JL20']]], { zhou: 1 }, { independent: 3 }, { runway: 2, optionality: 5, load: 3 }, { JL17: 6 }),
    choice('JL14_C2', '为了关系全部接下，价格以后再谈', '周屿松了一口气，客户把新增内容当成原本包含。', [['scope_creep', ['JL17', 'JL20']], ['payment_risk', ['JL17', 'JL20']]], { zhou: 1 }, { independent: 1 }, { runway: -1, optionality: 2, load: 8 }, { JL17: 5 }),
    choice('JL14_C3', '拒绝新增需求，只交合同原范围', '你的时间守住了，合作气氛变硬。', [['scope_refused', ['JL17', 'ending_independent']]], { zhou: -2 }, { reset: 1 }, { runway: 1, optionality: -1, load: -2 }, { JL17: 2 }),
  ], 'M04_peer_project'),
  node('JL15', 'external_window', ['flag:extra_interview', 'flag:targeted_search', 'astro:fusion:M05'], '另一座城给了四周远程试用', '一个四周远程试用能覆盖必要支出，但同期不能接全量项目。', '真实体验，还是不免费证明自己。', ['gu'], [
    choice('JL15_C1', '接受四周试用，把搬迁决定推迟到证据齐全后', '收入暂时恢复，也得到真实体验；其他路线会变窄。', [['remote_trial', ['JL20', 'JL21']], ['migration_option', ['JL20', 'JL21']]], {}, { reskill_pilot: 3 }, { runway: 7, optionality: 7, load: 5 }, { JL20: 5 }),
    choice('JL15_C2', '提议改成两周、明确交付物的付费项目', '对方同意缩短，转全职时仍需再评估。', [['remote_project', ['JL16', 'JL17', 'JL20']], ['portfolio_proof_1', ['JL16', 'JL20']]], {}, { independent: 2, reskill_pilot: 1 }, { runway: 3, optionality: 5, load: 2 }, { JL17: 4 }),
    choice('JL15_C3', '拒绝试用，只接受正式 Offer 后再搬迁', '你守住不免费证明自己的边界，也可能失去窗口。', [['formal_only', ['JL19']]], {}, { employment: 1 }, { runway: 0, optionality: -4, load: -1 }, { JL19: 3 }),
  ], 'M05_external_move'),
);
NODES.push(
  node('JL04', 'terms', ['flag:offer_alive', 'astro:fusion:M02'], '试用期考核只有一句话', '合同只有“达到岗位要求即可转正”，却要你接前任留下的项目。', '尽快签约，还是把模糊责任写成边界。', ['gu'], [
    choice('JL04_C1', '直接签约，把遗留项目当作重新证明自己的机会', '入职日期确定，遗留项目也正式算在你头上。', [['signed_offer', ['JL12', 'JL16', 'JL19']], ['legacy_project_risk', ['JL12', 'ending_stabilize']]], { gu: 1 }, { employment: 4 }, { runway: 9, optionality: 2, load: 5 }, { JL16: 7 }),
    choice('JL04_C2', '发前 60 天交付清单，请书面确认资源和验收人', '对方删掉一项不现实目标，也明确了一位协作人。', [['bounded_offer', ['JL16', 'JL19', 'ending_conditional_entry']], ['signed_offer', ['JL16', 'JL19']]], { gu: 2 }, { employment: 3, conditional_entry: 3 }, { runway: 7, optionality: 4, load: 2 }, { JL16: 6 }),
    choice('JL04_C3', '先与未来同事聊 20 分钟，再决定是否签', '同事透露前任离开与跨部门扯皮有关。', [['team_truth', ['JL19']], ['decision_delay', ['JL06', 'JL11']]], {}, { conditional_entry: 1 }, { runway: -1, optionality: 4, load: 1 }, { JL06: 3 }),
  ], 'M02_role_contract'),
  node('JL05', 'terms', ['flag:negotiation_open', 'flag:review_in_writing', 'astro:fusion:M01'], '顾言回了一个折中数字', '公司可提高固定薪资，但要求半年排他；或保留原薪资，给一次性签字费。', '长期现金、短期安全与副线空间。', ['gu'], [
    choice('JL05_C1', '选择更高固定薪资，接受半年排他', '每月压力下降，但周屿之后的付费项目将无法接。', [['signed_offer', ['JL16', 'JL19']], ['exclusive_6m', ['JL07', 'JL16']]], { gu: 2 }, { employment: 4 }, { runway: 10, optionality: -3, load: 1 }, { JL16: 4 }),
    choice('JL05_C2', '保留原薪资，拿签字费并要求排他只限竞业', '顾言接受非竞业项目可报备，你保留一条副线。', [['signed_offer', ['JL16', 'JL19']], ['signing_bonus', ['JL11', 'JL16']], ['sidework_reportable', ['JL16', 'JL20']]], { gu: 1 }, { employment: 3, dual_track: 2 }, { runway: 8, optionality: 4, load: 2 }, { JL16: 8 }),
    choice('JL05_C3', '不接受折中，礼貌结束谈判并保留未来联系', '顾言保留资料，但眼前收入窗口关闭。', [['offer_declined', ['JL06', 'JL11']], ['future_contact', ['JL13', 'JL19']]], { gu: 1 }, { reskill_pilot: 1 }, { runway: -6, optionality: 2, load: 0 }, { JL06: 6 }),
  ]),
  node('JL06', 'terms', ['flag:offer_declined', 'flag:location_boundary', 'astro:fusion:M06'], '继续等，不等于什么都不做', '招聘软件没有新消息。接下来 14 天只能定一个主要任务。', '扩大投递、补专业证据，还是先补现金。', ['cheng'], [
    choice('JL06_C1', '每天定向投 4 个岗位，并联系旧同事核实机会', '三天内得到两条真实岗位信息，也收到几次沉默。', [['targeted_search', ['JL10', 'JL13', 'JL15']], ['network_reached', ['JL10', 'JL15']]], {}, { employment: 1, reskill_pilot: 1 }, { runway: -2, optionality: 7, load: 3 }, { JL15: 5 }),
    choice('JL06_C2', '用一周整理完整案例，再带材料找人反馈', '投递量减少，程岚答应看第一版材料。', [['portfolio_sprint', ['JL08', 'JL13']], ['cheng_meeting', ['JL08']]], {}, { reskill_pilot: 3 }, { runway: -3, optionality: 6, load: 2 }, { JL08: 9 }),
    choice('JL06_C3', '先接一笔两周内能结算的短单，再安排求职时段', '安全余量略回升，但白天求职时间被切碎。', [['short_gig', ['JL10', 'JL11', 'JL17']], ['independent_income_1', ['JL17', 'JL20', 'JL21']]], {}, { independent: 3 }, { runway: 4, optionality: 2, load: 4 }, { JL17: 6 }),
  ], 'M06_learn_to_switch'),
  node('JL07', 'second_path', ['astro:fusion:M04', 'astro:fusion:M10'], '周屿的六周试做', '周屿拿到企业客户试点，预算只够付费试做，尾款看验收。', '可信机会与不完整保障。', ['zhou'], [
    choice('JL07_C1', '接下全部交付，但要求预付款和两次验收节点', '客户同意部分预付和中期验收。', [['pilot_lead', ['JL14', 'JL16', 'JL17']], ['independent_income_1', ['JL17', 'JL20']]], { zhou: 2 }, { independent: 3 }, { runway: 3, optionality: 7, load: 5 }, { JL14: 8, JL17: 4 }),
    choice('JL07_C2', '只负责一个两周可完成的模块', '项目没有被你押满，周屿也能先测试合作。', [['pilot_module', ['JL14', 'JL16', 'JL17']], ['portfolio_proof_1', ['JL10', 'JL13', 'JL20']]], { zhou: 1 }, { independent: 2, dual_track: 1 }, { runway: 1, optionality: 5, load: 2 }, { JL14: 5 }),
    choice('JL07_C3', '不接交付，帮他审一次方案并介绍合适的人', '你保住时间，也维护了关系。', [['zhou_goodwill', ['JL14', 'ending_dual_track']]], { zhou: 2 }, { reset: 1 }, { runway: 0, optionality: 1, load: -1 }, { JL14: 2 }),
  ], 'M04_peer_project'),
  node('JL08', 'second_path', ['flag:cheng_meeting', 'astro:fusion:M03', 'astro:fusion:M12'], '程岚只肯看一页材料', '程岚答应给你 25 分钟，但要求会前只发一页：问题、证据与下一份工作方向。', '快速聚焦、暴露不完整作品，还是继续准备。', ['cheng'], [
    choice('JL08_C1', '用过去项目数据做一页案例，请她指出最不可信处', '程岚指出一处数据缺证，也愿意补齐后转给招聘经理。', [['portfolio_feedback', ['JL13']], ['proof_gap', ['JL13', 'ending_reskill_pilot']]], { cheng: 2 }, { reskill_pilot: 3 }, { runway: -1, optionality: 7, load: 2 }, { JL13: 9 }),
    choice('JL08_C2', '带三个方向去聊，请她帮你排除一个不匹配行业', '她给了行业信息，但没有替你筛选。', [['market_info', ['JL15', 'JL21']]], { cheng: 1 }, { reskill_pilot: 2 }, { runway: -1, optionality: 4, load: 1 }, { JL15: 3 }),
    choice('JL08_C3', '推迟一周再约，先把材料补到满意', '你多了一周准备，也失去本周的引荐窗口。', [['portfolio_delay', ['JL13', 'JL21']], ['missed_intro', ['JL13', 'JL21']]], { cheng: -1 }, { reset: 1 }, { runway: -2, optionality: -2, load: 1 }, { JL13: -3 }),
  ], 'M03_proof_before_title'),
  node('JL09', 'second_path', ['astro:fusion:M08', 'astro:fusion:M01'], '梁澄把三个月账单摊开', '梁澄只问一个具体问题：下个月还没有固定收入时，共同支出怎么调？', '公开现实、使用支持，还是独自扛住。', ['liang'], [
    choice('JL09_C1', '一起做 8 周预算，明确暂停开支与复盘日', '梁澄知道如何配合，你也看清真实安全线。', [['shared_budget', ['JL11', 'JL18', 'ending_reset']]], { liang: 3 }, { reset: 2 }, { runway: 4, optionality: 0, load: -3 }, { JL18: 6 }),
    choice('JL09_C2', '接受一个月支持，同时写清归还或分担方式', '时间被买回来，但支持有明确期限。', [['support_used', ['JL11', 'JL18', 'JL21']], ['support_debt_1', ['JL11', 'JL18', 'ending_reset']]], { liang: 1 }, { reset: 1 }, { runway: 5, optionality: 1, load: -1 }, { JL18: 7 }),
    choice('JL09_C3', '说自己能处理，不展开预算细节', '谈话很快结束，但梁澄没有得到答案。', [['concealed_pressure', ['JL12', 'JL18']]], { liang: -2 }, { independent: 1 }, { runway: -2, optionality: 0, load: 3 }, { JL18: 5 }),
  ], 'M08_home_runway'),
);

export const UNEMPLOYED_MONTH_FIVE = {
  id: 'unemployed_month_five', entry: 'job_lost', version: '0.1.0',
  stages: [
    { id: 'setup', order: 1, candidates: ['JL01', 'JL02', 'JL03'], profileDriven: true },
    { id: 'terms', order: 2, candidates: ['JL04', 'JL05', 'JL06'], profileDriven: false },
    { id: 'second_path', order: 3, candidates: ['JL07', 'JL08', 'JL09'], profileDriven: false },
    { id: 'cost_returns', order: 4, candidates: ['JL10', 'JL11', 'JL12'], profileDriven: true },
    { id: 'external_window', order: 5, candidates: ['JL13', 'JL14', 'JL15'], profileDriven: false },
    { id: 'collision', order: 6, candidates: ['JL16', 'JL17', 'JL18'], profileDriven: true },
    { id: 'landing', order: 7, candidates: ['JL19', 'JL20', 'JL21'], profileDriven: false },
  ],
  nodes: NODES,
  endings: [
    { id: 'ending_stabilize', match: { anyTags: ['flag:ending_stabilize'], minScore: 0 }, routeWeights: { employment: 4 }, summary: { title: '稳住阵地', core: '你先把确定性接住，换来了重新组织选择的空间。', gain: '固定收入、作息锚点与履历连续性。', cost: '短期关闭一部分项目或迁移窗口。', qualityVariants: [{ when: { flags: ['project_exited_cleanly'] }, text: '你提前交接了项目，稳定不是靠失联换来的。' }], astrologyCompareTemplateId: 'ending_compare_structure' }, action: { label: '确认前 60 天边界', instruction: '把前 60 天交付、资源和复盘日期写成一页并发给未来经理。', horizonDays: 3 } },
    { id: 'ending_conditional_entry', match: { anyTags: ['flag:ending_conditional_entry'], minScore: 0 }, routeWeights: { conditional_entry: 4 }, summary: { title: '带条件入场', core: '你恢复收入，同时保留了一项可复盘的边界。', gain: '现金回流与可确认的职责或报备条件。', cost: '条件仍需要后续沟通和证据兑现。', qualityVariants: [{ when: { flags: ['asked_terms'] }, text: '你从一开始就要求看清规则，这份边界不是临时补上的。' }], astrologyCompareTemplateId: 'ending_compare_contract' }, action: { label: '发确认邮件', instruction: '把口头条件改写成日期、负责人和验收口径。', horizonDays: 2 } },
    { id: 'ending_dual_track', match: { anyTags: ['flag:ending_dual_track'], minScore: 0 }, routeWeights: { dual_track: 4 }, summary: { title: '双线过渡', core: '你同时保住了底盘和变化入口。', gain: '安全余量与未来选择同时存在。', cost: '注意力被切开，隐瞒或过载会放大信用成本。', qualityVariants: [{ when: { flags: ['dual_disclosed'] }, text: '你把副线提前说明，保住了两边的信用余量。' }], astrologyCompareTemplateId: 'ending_compare_dual' }, action: { label: '给副线设上限', instruction: '写下每周最高工时、停止条件和是否需要报备。', horizonDays: 2 } },
    { id: 'ending_reskill_pilot', match: { anyTags: ['flag:ending_reskill_pilot'], minScore: 0 }, routeWeights: { reskill_pilot: 4 }, summary: { title: '转行试航', core: '你用作品、访谈或短周期试用验证新方向。', gain: '方向开始由外部证据而不是想象支撑。', cost: '短期收入仍会波动。', qualityVariants: [{ when: { flags: ['portfolio_proof_1'] }, text: '你没有只靠热情转向，而是留下了可被验证的作品。' }], astrologyCompareTemplateId: 'ending_compare_proof' }, action: { label: '约好四周复盘', instruction: '交付一个能被从业者评价的作品，并提前约好复盘对象。', horizonDays: 28 } },
    { id: 'ending_independent', match: { anyTags: ['flag:ending_independent'], minScore: 0 }, routeWeights: { independent: 4 }, summary: { title: '独立接单', core: '你开始用真实客户验证自主路线。', gain: '可迁移作品与自主安排。', cost: '账期、获客和范围控制由自己承担。', qualityVariants: [{ when: { flags: ['invoice_protected'] }, text: '你把付款保护写进了过程，独立不是把所有风险独自吞下。' }], astrologyCompareTemplateId: 'ending_compare_independent' }, action: { label: '写下付款保护', instruction: '下一单先写清预付款比例、范围外报价和验收日。', horizonDays: 3 } },
    { id: 'ending_reset', match: { anyTags: ['flag:ending_reset'], minScore: 0 }, routeWeights: { reset: 4 }, summary: { title: '低谷复位', core: '你先让睡眠、账目和判断力重新可用。', gain: '停止用忙乱伪装推进。', cost: '短期机会减少，也要给暂停设期限。', qualityVariants: [{ when: { flags: ['family_deadline'] }, text: '你把暂停和共同期限说清楚，恢复不再是没有尽头的等待。' }], astrologyCompareTemplateId: 'ending_compare_recovery' }, action: { label: '确定重启日', instruction: '确定 7–14 天恢复期、最低支出和唯一联系人入口。', horizonDays: 1 } },
  ],
};
