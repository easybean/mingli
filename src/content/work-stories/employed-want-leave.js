// 《在职，但越来越想离开》：命理标签只排序事件；事实标记和职业阶段决定能否发生。
const flag = (id, consumeBy) => ({ id, value: true, consumeBy });
const life = (work) => ({ pressure: Math.round((work.load || 0) * 0.8), opportunity: Math.round((work.optionality || 0) * 0.8), relationship: Math.round((work.optionality || 0) * 0.1), stability: Math.round((work.runway || 0) * 0.6), resources: Math.round((work.runway || 0) * 0.7), wellbeing: Math.round((work.load || 0) * -0.8) });
const choice = (id, label, immediate, flags, relationEffects, routeSignals, work, nextWeights = {}) => ({ id, label, immediate, delayedFlags: flags.map(([key, consumeBy]) => flag(key, consumeBy)), relationEffects, routeSignals, stateEffects: { work, life: life(work) }, nextWeights });
const RULE = { M01: 'M01_cash_anchor', M02: 'M02_role_contract', M03: 'M03_proof_before_title', M04: 'M04_peer_project', M05: 'M05_external_move', M06: 'M06_learn_to_switch', M07: 'M07_rest_then_decide', M08: 'M08_home_runway', M09: 'M09_output_vs_rules', M10: 'M10_income_dual_track', M11: 'M11_change_under_load', M12: 'M12_support_and_reference' };
const TRANSITIONS = {
  EL01: '周一早会上，许衡把离职同事留下的项目排到了你名下。', EL02: '那天晚上项目消息刚安静下来，猎头的电话打了进来。', EL03: '同一周，唐微约你在午休时单独聊十分钟。',
  EL04: '你把加责范围问清后的第二天，许衡给了晋升安排的答复。', EL05: '和沈放初步沟通后，职位的真实限制开始浮出来。', EL06: '唐微开始交接前，主动问你是否需要她留下职业信息。',
  EL07: '外部和内部的选项都还未落定时，一位旧客户提出了周末咨询。', EL08: '连续几晚在加班后看岗位，梁澄决定把担心说出来。', EL09: '几条线同时推进一周后，你发现日历已经没有完整的晚上。',
  EL10: '在职求职和救火并行到第三周，疲惫先在一次沟通里露了出来。', EL11: '你提出内部探索后，另一团队给出了可以面谈的时间。', EL12: '唐微离开后的第一个完整迭代，空出的责任开始落到具体人身上。',
  EL13: '这一阶段告一段落，许衡再次确认你接下来要承担什么。', EL14: '外部流程推进到关键一轮时，现岗位也排进了不能缺席的会议。', EL15: '引荐人转发材料后，对方把离开原因直接问到了台面上。',
  EL16: '临时新增的工作安排，撞上了你原本留给判断或恢复的时间。', EL17: '外部沟通临近落笔时，现公司的奖金通知仍停在“下月结算”。', EL18: '内部机会和原团队的挽留在同一周要求你确认。',
  EL19: '几轮沟通后，留下的条件终于从口头说法变成了可对照的文本。', EL20: '一次有限的市场验证结束后，收入和投入都可以被实际计算。', EL21: '到这一轮末尾，Offer、预算或恢复计划至少有一项需要落到日期上。',
};
const VARIANTS = {
  EL04: [{ id: 'el04-scope-echo', priority: 4, when: { flags: ['scope_written'] }, copyPatch: { transition: '你要求写清项目范围后的第二天，许衡给了晋升安排的答复。' } }],
  EL05: [{ id: 'el05-brief-echo', priority: 4, when: { flags: ['headhunter_briefed'] }, copyPatch: { transition: '和沈放核实职责后，职位的真实限制开始浮出来。' } }],
  EL06: [{ id: 'el06-reference-echo', priority: 4, when: { flags: ['peer_reference'] }, copyPatch: { transition: '唐微答应做推荐人后，又问你是否需要正式引荐。' } }],
  EL10: [{ id: 'el10-rest-echo', priority: 4, when: { flags: ['rest_protected'] }, copyPatch: { transition: '你上一轮选择保住了休息时间，但项目压力仍在下一次沟通里显形。' } }],
  EL11: [{ id: 'el11-transfer-echo', priority: 4, when: { flags: ['internal_transfer_open'] }, copyPatch: { transition: 'HR 同意内部探索后的几天，另一团队给出了面谈时间。' } }],
  EL12: [{ id: 'el12-vacancy-echo', priority: 4, when: { flags: ['vacancy_escalated'] }, copyPatch: { transition: '你已提前上报补位风险；唐微离开后的第一个迭代，答案还是落到了分工上。' } }],
  EL13: [
    { id: 'el13-review-echo', priority: 5, when: { flags: ['review_date_set'] }, copyPatch: { transition: '你写进邮件的复盘日期到了，许衡需要给出具体答复。', title: '复盘到了，许衡给的仍是“再观察”', situation: '项目结果可见，但晋升名额仍未开放。现在留下要有新条件，而不是再接受一次模糊等待。' } },
    { id: 'el13-load-echo', priority: 4, when: { flags: ['workload_reduced', 'sprint_committed'] }, copyPatch: { transition: '工作量调整或冲刺结束后，许衡再次确认你接下来要承担什么。', situation: '这一轮任务完成后，许衡要和你对齐下一阶段分工。你可以把负荷、资源和去留条件摆到桌面上。' } },
    { id: 'el13-rest-echo', priority: 3, when: { flags: ['recovery_week'] }, copyPatch: { transition: '恢复周结束后，许衡再次确认你接下来要承担什么。', situation: '你带着更清楚的精力边界回到工作，下一阶段安排需要重新谈。' } },
    { id: 'el13-paused-echo', priority: 3, when: { flags: ['external_paused'] }, copyPatch: { transition: '你暂停外部流程后，许衡再次确认你接下来要承担什么。', situation: '既然暂时留下，现岗位需要给出比“再看看”更具体的安排。' } },
  ],
  EL14: [{ id: 'el14-interview-echo', priority: 4, when: { flags: ['external_interview'] }, copyPatch: { transition: '终面排进日历后，现岗位也排进了不能缺席的会议。' } }],
  EL15: [{ id: 'el15-referral-echo', priority: 4, when: { flags: ['warm_referral'] }, copyPatch: { transition: '唐微完成正式引荐后，对方把离开原因直接问到了台面上。' } }],
  EL16: [
    { id: 'el16-side-echo', priority: 5, when: { flags: ['sidework_disclosed'] }, copyPatch: { transition: '已报备的咨询日期和本周上线日恰好撞在同一个周末。', title: '现岗位加码与副线验证撞在同一个周末', situation: '关键版本要上线，已报备的咨询也到了约定时间。两边都是真实承诺，不能靠隐瞒解决。' } },
    { id: 'el16-exit-echo', priority: 4, when: { flags: ['exit_budgeted', 'family_threshold', 'exit_intent_clear'] }, copyPatch: { transition: '你留给预算核对或离职准备的时间，被临时加码挤到了周末。', situation: '现岗位临时增加交付，而你原本要完成预算、家庭沟通或退出准备；两件事都需要明确处理。' } },
    { id: 'el16-recovery-echo', priority: 3, when: { flags: ['recovery_week', 'overextended'] }, copyPatch: { transition: '你刚为恢复留出时间，临时加码又排进了日历。', situation: '新增任务与已经预留的恢复时间冲突；继续硬顶会让下一步判断更差。' } },
  ],
  EL17: [{ id: 'el17-offer-echo', priority: 4, when: { flags: ['motivation_credible'] }, copyPatch: { transition: '离开动机说清后，外部沟通临近落笔，奖金通知仍停在“下月结算”。' } }],
  EL18: [{ id: 'el18-internal-echo', priority: 4, when: { flags: ['internal_interview'] }, copyPatch: { transition: '内部面谈结束后，原团队的挽留也在同一周要求你确认。' } }],
  EL19: [{ id: 'el19-package-echo', priority: 4, when: { flags: ['stay_package'] }, copyPatch: { transition: '奖金与职责方案发来后，留下的条件终于可以逐项对照。' } }],
  EL20: [{ id: 'el20-side-echo', priority: 4, when: { flags: ['dual_boundaries_kept'] }, copyPatch: { transition: '你按边界完成副线验证后，收入和投入都可以被实际计算。' } }],
  EL21: [{ id: 'el21-offer-echo', priority: 4, when: { flags: ['new_offer_accepted'] }, copyPatch: { transition: '书面 Offer 已确认；原公司的交接日期也需要在这一轮末尾落到日历上。' } }],
};
const node = (id, stage, anyTags, title, situation, conflict, roles, choices, requirements = {}) => ({
  id, stage, match: { anyTags, allTags: ['entry:job_exit'], minScore: 0, ...requirements }, roles,
  copy: { transition: TRANSITIONS[id], title, situation, conflict }, variants: VARIANTS[id] || [],
  evidenceSlots: [{ id: 'node_why_this', requiredLayers: ['bazi', 'ziwei', 'period'], ruleIds: [...new Set(anyTags.filter((x) => x.startsWith('astro:fusion:')).map((x) => RULE[x.slice(-3)]).filter(Boolean))], fallbackTemplateId: 'evidence_partial_work' }], choices, shareable: true, riskTags: ['career'],
});
const N = [];
N.push(
  node('EL01', 'pressure', ['astro:fusion:M02', 'astro:fusion:M09'], '领导把新项目交给你，却没有晋升安排', '直属领导许衡说明团队有人离开，要求你接下跨部门项目和带人协调；他说“做好了肯定看得见”，但本轮晋升名单已经锁定。你仍在职，工作量会立刻增加。', '把加码当筹码，还是先把承诺问清。', ['xu'], [
    choice('EL01_C1', '接下项目，但要求写明目标、资源和晋升复盘日', '许衡同意把三个月复盘写进邮件，项目照常启动。', [['scope_written', ['EL04', 'EL13', 'ending_conditional_stay']]], { xu: 1 }, { stay: 2 }, { runway: 1, optionality: 3, load: 4 }, { EL04: 6 }),
    choice('EL01_C2', '只接原职责范围，说明新增工作需要调配人手', '你守住边界，许衡开始重新排资源。', [['boundary_stated', ['EL04', 'EL18', 'ending_internal_move']]], { xu: -1 }, { internal_move: 2 }, { runway: 0, optionality: 2, load: -2 }, { EL18: 5 }),
    choice('EL01_C3', '先接下两周救火，同时记录实际投入和结果', '短期没人替你接手，但你开始积累可谈判的证据。', [['overload_evidence', ['EL12', 'EL13', 'ending_delay_leave']]], {}, { leave_prep: 2 }, { runway: 0, optionality: 3, load: 6 }, { EL12: 5 }),
  ], { careerStages: ['employed'] }),
  node('EL02', 'pressure', ['astro:fusion:M01', 'astro:fusion:M07'], '下班后，猎头发来一份职位描述', '猎头沈放联系你：一家同行公司在找相近岗位，薪资区间更高，但职责写得宽泛，最快下周初就要第一轮沟通。你还没有辞职，也不能把一次电话当成 Offer。', '先验证机会，还是保住下班后的恢复。', ['shen'], [
    choice('EL02_C1', '约 20 分钟电话，只核实职责、汇报线和招聘原因', '沈放补充了离职原因与用人节奏，机会进入可比较状态。', [['headhunter_briefed', ['EL05', 'EL14', 'ending_safe_switch']]], { shen: 1 }, { switch: 3 }, { runway: 0, optionality: 5, load: 2 }, { EL05: 8 }),
    choice('EL02_C2', '请他先发完整 JD 和薪资结构，周末再决定', '你没有立刻投入，但窗口可能被其他候选人占去。', [['jd_requested', ['EL05', 'EL14']]], {}, { leave_prep: 1 }, { runway: 0, optionality: 2, load: -1 }),
    choice('EL02_C3', '婉拒本次联系，把晚上留给睡眠和现项目', '当晚少了一件待办，也失去了一次外部校准。', [['rest_protected', ['EL12', 'ending_delay_leave']]], {}, { recovery: 2 }, { runway: 0, optionality: -1, load: -5 }),
  ], { careerStages: ['employed'] }),
  node('EL03', 'pressure', ['astro:fusion:M04', 'astro:fusion:M11'], '最能搭档的同事递了辞呈', '核心同事唐微私下告诉你，她已决定离职。她愿意交接真实团队情况，也提醒她走后部分工作可能落到你身上。', '维护合作，还是提前为自己留出口。', ['tang'], [
    choice('EL03_C1', '约她梳理交接风险，并请她以后做职业推荐人', '唐微答应留下具体交接清单，也愿意在合适时核实你的协作成果。', [['peer_reference', ['EL06', 'EL15', 'ending_safe_switch']]], { tang: 2 }, { switch: 2 }, { runway: 0, optionality: 4, load: 1 }, { EL06: 5 }),
    choice('EL03_C2', '提醒许衡尽快补位，要求明确你不承担全部空缺', '风险被摆上台面，领导承诺下周给分工方案。', [['vacancy_escalated', ['EL12', 'EL18', 'ending_internal_move']]], { xu: 1 }, { internal_move: 2 }, { runway: 0, optionality: 2, load: 1 }),
    choice('EL03_C3', '暂不表态，先观察她离开后公司的实际安排', '你保留信息，但两周内的不确定性更高。', [['vacancy_waited', ['EL12', 'EL18']]], {}, { leave_prep: 1 }, { runway: 0, optionality: 1, load: 3 }),
  ], { careerStages: ['employed'] }),
  node('EL04', 'terms', ['flag:scope_written', 'astro:fusion:M02'], '许衡说晋升要等预算窗口', '你追问加责后的回报，许衡确认当前不能晋升，但可给项目负责人头衔和季度复盘。口头认可不会自动改变岗位。', '接受阶段性安排，还是换取可验证条件。', ['xu'], [
    choice('EL04_C1', '接受负责人头衔，但要求写清复盘日期和晋升标准', '邮件列出指标与日期，仍没有保证名额。', [['review_date_set', ['EL13', 'EL19', 'ending_conditional_stay']]], { xu: 1 }, { stay: 3 }, { runway: 1, optionality: 3, load: 2 }),
    choice('EL04_C2', '提出内部转岗，去职责更清晰的团队面谈', 'HR 同意安排探索性沟通，原项目仍需完成交接。', [['internal_transfer_open', ['EL11', 'EL18', 'ending_internal_move']]], {}, { internal_move: 4 }, { runway: 0, optionality: 5, load: 2 }, { EL11: 7 }),
    choice('EL04_C3', '不再等待本轮晋升，把新增成果整理为外部材料', '你停止用承诺解释加班，开始准备可迁移证据。', [['promotion_declined_wait', ['EL14', 'EL15', 'ending_safe_switch']]], { xu: -1 }, { switch: 2 }, { runway: 0, optionality: 4, load: 1 }, { EL14: 5 }),
  ], { requiresAnyFlags: ['scope_written', 'boundary_stated', 'overload_evidence'], careerStages: ['employed'] }),
  node('EL05', 'terms', ['flag:headhunter_briefed', 'astro:fusion:M05'], '猎头要你给出期望，但公司信息仍不完整', '沈放说用人经理想尽快聊，职位可能涉及异地团队和更长的出差周期。你可以推进核实，也可以先不交出全部底牌。', '外部窗口与信息不对称。', ['shen'], [
    choice('EL05_C1', '提交简历并要求首轮先与未来直属经理沟通', '面试排进日历，你拿到一个核实职责的入口。', [['external_interview', ['EL14', 'EL17', 'ending_safe_switch']]], { shen: 1 }, { switch: 4 }, { runway: 0, optionality: 6, load: 3 }, { EL14: 7 }),
    choice('EL05_C2', '先问清出差、试用期与团队流失，再决定投递', '沈放承诺补资料，窗口稍微变慢。', [['external_diligence', ['EL14', 'EL17']]], {}, { leave_prep: 2 }, { runway: 0, optionality: 3, load: 1 }),
    choice('EL05_C3', '明确不考虑异地与高频出差，请他保留本地机会', '范围缩小了，边界也变得可执行。', [['location_boundary', ['EL14', 'EL20', 'ending_side_probe']]], {}, { side_probe: 2 }, { runway: 0, optionality: 1, load: -1 }),
  ], { requiresAnyFlags: ['headhunter_briefed', 'jd_requested'], careerStages: ['employed'] }),
  node('EL06', 'terms', ['flag:peer_reference', 'astro:fusion:M12'], '唐微问你：要不要一起看看外面的机会', '唐微离职前说她的新团队近期也可能招人，愿意介绍，但她不想替你绕开正式流程。', '借关系打开窗口，还是把关系留在边界内。', ['tang'], [
    choice('EL06_C1', '请她做正式引荐，并先给她一页可核实的成果', '她转发材料并提醒你准备面试，而不是承诺职位。', [['warm_referral', ['EL15', 'EL17', 'ending_safe_switch']]], { tang: 2 }, { switch: 4 }, { runway: 0, optionality: 6, load: 2 }, { EL15: 8 }),
    choice('EL06_C2', '只请她做一次行业信息访谈，不立刻投递', '你获得真实比较维度，也保留了决定节奏。', [['market_calibrated', ['EL15', 'EL20', 'ending_side_probe']]], { tang: 1 }, { side_probe: 2 }, { runway: 0, optionality: 3, load: 1 }),
    choice('EL06_C3', '谢绝引荐，先把她的交接做完整', '关系没有被交易化，你也少了一个短期出口。', [['handover_clean', ['EL12', 'ending_conditional_stay']]], { tang: 2 }, { stay: 1 }, { runway: 0, optionality: -1, load: 2 }),
  ], { requiresAnyFlags: ['peer_reference'], careerStages: ['employed'] }),
  node('EL07', 'second_path', ['astro:fusion:M03', 'astro:fusion:M10'], '你能否给自己留一条低风险副线', '一位旧客户问你能否周末做一次付费诊断。公司制度禁止竞业和占用工时，但不禁止非竞业、经报备的短咨询。', '保留试探空间，也要守住职业信用。', [], [
    choice('EL07_C1', '确认非竞业后向公司报备，再接一次限定咨询', '边界被留下记录，副线只占一个周末。', [['sidework_disclosed', ['EL16', 'EL20', 'ending_side_probe']]], {}, { side_probe: 4 }, { runway: 2, optionality: 4, load: 3 }, { EL16: 7 }),
    choice('EL07_C2', '不接单，改做一份公开案例以测试市场反馈', '没有收入，但材料可以反复使用。', [['public_case', ['EL15', 'EL20', 'ending_side_probe']]], {}, { leave_prep: 3 }, { runway: 0, optionality: 4, load: 2 }),
    choice('EL07_C3', '先不做副线，把离职可能性和预算写进计划', '你没有新增承诺，现实账本变得更清楚。', [['exit_budgeted', ['EL16', 'EL21', 'ending_exit_reset']]], {}, { exit: 2 }, { runway: -1, optionality: 2, load: -1 }),
  ], { careerStages: ['employed'] }),
  node('EL08', 'second_path', ['astro:fusion:M08', 'astro:fusion:M01'], '家人说：别裸辞，等拿到 Offer 再谈', '共同生活的家人梁澄担心你最近长期加班又频繁看机会，明确反对在没有储备和 Offer 时裸辞。关心并没有消除分歧。', '自主决定与共同风险。', ['liang'], [
    choice('EL08_C1', '一起算六个月预算，约定触发裸辞的最低条件', '讨论从劝阻变成条件清单，分歧仍在。', [['family_threshold', ['EL16', 'EL21', 'ending_exit_reset']]], { liang: 2 }, { exit: 2 }, { runway: 2, optionality: 2, load: -2 }),
    choice('EL08_C2', '承诺先在职找工作，每两周同步一次进展', '梁澄放心一些，但你要承担双线消耗。', [['family_informed_search', ['EL12', 'EL17', 'ending_safe_switch']]], { liang: 2 }, { switch: 2 }, { runway: 0, optionality: 2, load: 2 }),
    choice('EL08_C3', '说明你需要自主空间，但不接受无限期拖延', '边界说出口，支持的温度下降了一点。', [['family_tension', ['EL21', 'ending_exit_reset']]], { liang: -1 }, { exit: 2 }, { runway: 0, optionality: 1, load: 2 }),
  ], { careerStages: ['employed'] }),
  node('EL09', 'second_path', ['astro:fusion:M06', 'astro:fusion:M03'], '你把“想走”拆成一份可比较清单', '连续几周后，你发现自己同时在看外部岗位、内部转岗和副线。若不选一个验证重点，所有计划都会停在信息层。', '多留选项与完成一次验证。', [], [
    choice('EL09_C1', '只推进两家最匹配公司，并准备针对性案例', '投递量变少，面试质量变高。', [['targeted_search', ['EL14', 'EL17', 'ending_safe_switch']]], {}, { switch: 3 }, { runway: 0, optionality: 4, load: 2 }),
    choice('EL09_C2', '优先约内部转岗和现团队资源复盘', '你把留下的条件拿到桌面上。', [['internal_case_ready', ['EL11', 'EL18', 'ending_internal_move']]], {}, { internal_move: 3 }, { runway: 0, optionality: 3, load: 1 }),
    choice('EL09_C3', '做四周副线试验，每周只投入固定时段', '副线不再靠想象，也不会吞掉全部晚上。', [['side_trial_plan', ['EL16', 'EL20', 'ending_side_probe']]], {}, { side_probe: 3 }, { runway: 1, optionality: 4, load: 2 }),
  ], { careerStages: ['employed'] }),
);
N.push(
  node('EL10', 'cost', ['state:load:high', 'astro:fusion:M07'], '连续加班后，你在面试电话里漏了一句关键问题', '工作加码和在职求职开始互相挤压。你需要决定是继续硬撑，还是先恢复判断力。', '多留窗口与不把自己耗空。', ['liang'], [
    choice('EL10_C1', '暂停一周外部投递，补睡眠并完成现项目交接', '日程腾出空间，外部窗口会慢下来。', [['recovery_week', ['EL16', 'EL21', 'ending_delay_leave']]], {}, { recovery: 4 }, { runway: 0, optionality: -2, load: -7 }),
    choice('EL10_C2', '保留已约面试，取消所有非必要社交与副线', '重点被收窄，但生活节奏更紧。', [['focus_protected', ['EL14', 'EL17', 'ending_safe_switch']]], {}, { switch: 3 }, { runway: 0, optionality: 3, load: 1 }),
    choice('EL10_C3', '继续全部并行，靠晚上补齐材料', '短期没有放弃任何线，错误率开始上升。', [['overextended', ['EL16', 'EL21', 'ending_exit_reset']]], {}, { exit: 1 }, { runway: 0, optionality: 1, load: 7 }),
  ], { careerStages: ['employed'] }),
  node('EL11', 'cost', ['flag:internal_transfer_open', 'astro:fusion:M02'], '内部团队愿意聊，但要你先完成当前救火', '另一团队负责人愿意考虑你，条件是现项目有可交接的负责人。内部换位不是逃离，也需要把责任交清。', '内部机会与眼前承诺。', ['xu'], [
    choice('EL11_C1', '给出两周交接表，并约定转岗面谈日期', '两边有了可执行安排，时间表仍可能变化。', [['internal_interview', ['EL18', 'EL19', 'ending_internal_move']]], { xu: 1 }, { internal_move: 4 }, { runway: 1, optionality: 4, load: 3 }),
    choice('EL11_C2', '要求先确认新岗位职责，再承诺交接范围', '你避免盲目换位，也让流程慢了一步。', [['internal_terms_checked', ['EL18', 'EL19']]], {}, { internal_move: 3 }, { runway: 0, optionality: 3, load: 1 }),
    choice('EL11_C3', '放弃内部机会，把精力转回外部验证', '一条熟悉的路关掉，外部材料更集中。', [['internal_route_closed', ['EL14', 'EL17', 'ending_safe_switch']]], {}, { switch: 3 }, { runway: 0, optionality: 2, load: 1 }),
  ], { requiresAnyFlags: ['internal_transfer_open', 'internal_case_ready'], careerStages: ['employed'] }),
  node('EL12', 'cost', ['flag:overload_evidence', 'flag:family_informed_search', 'astro:fusion:M11'], '唐微离开后的缺口真的落到你身上', '补位迟迟未到，许衡要求你再扛一轮。你可以把超载变成谈判事实，也可以接受短期安排。', '职业信用与可持续边界。', ['xu'], [
    choice('EL12_C1', '提交工时和风险清单，要求删减一项交付', '许衡同意延期一个低优先级事项。', [['workload_reduced', ['EL13', 'EL19', 'ending_conditional_stay']]], { xu: 1 }, { stay: 2 }, { runway: 0, optionality: 2, load: -3 }),
    choice('EL12_C2', '接受两周冲刺，但约定结束后立即复盘', '项目往前走，你的恢复被押后。', [['sprint_committed', ['EL13', 'EL16', 'ending_delay_leave']]], {}, { stay: 1 }, { runway: 1, optionality: 1, load: 5 }),
    choice('EL12_C3', '明确拒绝继续补位，启动内部或外部退出计划', '关系变紧，但你不再把无限加码当常态。', [['exit_intent_clear', ['EL16', 'EL21', 'ending_exit_reset']]], { xu: -2 }, { exit: 3 }, { runway: 0, optionality: 3, load: -1 }),
  ], { requiresAnyFlags: ['overload_evidence', 'vacancy_escalated', 'vacancy_waited', 'family_informed_search'], careerStages: ['employed'] }),
  node('EL13', 'window', ['astro:fusion:M09', 'astro:fusion:M02'], '这一阶段结束后，许衡再次确认安排', '这一阶段的任务告一段落，许衡要和你确认接下来三个月的职责、资源和优先级。无论你此前走哪条线，继续承担什么都需要一次明确答复。', '把下一阶段说清，还是继续让安排悬着。', ['xu'], [
    choice('EL13_C1', '只接受写明职责、资源和复盘日的下一阶段安排', '许衡同意把条件补进邮件，留下有了可检查的边界。', [['stay_package', ['EL19', 'ending_conditional_stay']]], { xu: 1 }, { stay: 4 }, { runway: 2, optionality: 2, load: 1 }),
    choice('EL13_C2', '要求同步开放内部岗位或明确调配方案', '许衡需要和 HR 确认，你获得一个不只靠原岗位的出口。', [['stay_conditioned', ['EL18', 'EL19', 'ending_internal_move']], ['internal_transfer_open', ['EL18', 'ending_internal_move']]], { xu: 0 }, { internal_move: 3 }, { runway: 0, optionality: 4, load: 1 }),
    choice('EL13_C3', '不承诺额外长期职责，把下班后的时间留给外部或退出准备', '你没有马上离开，但下一步不再只由现岗位定义。', [['external_ready', ['EL14', 'EL17', 'ending_safe_switch']], ['exit_intent_clear', ['EL16', 'EL21', 'ending_exit_reset']]], {}, { switch: 3, exit: 1 }, { runway: 0, optionality: 4, load: 0 }),
  ], { careerStages: ['employed'] }),
  node('EL14', 'window', ['flag:external_interview', 'flag:targeted_search', 'astro:fusion:M05'], '新机会的面试撞上现岗位关键会议', '外部公司给出终面时间，恰好是你负责的关键会议。你还在职，不能凭空消失，也不必放弃已验证的机会。', '职业信用与外部窗口。', ['shen'], [
    choice('EL14_C1', '提前完成会议材料，请可信同事代为主持一段', '现岗位没有失联，终面也按时进行。', [['interview_kept_clean', ['EL17', 'ending_safe_switch']]], {}, { switch: 4 }, { runway: 0, optionality: 5, load: 4 }),
    choice('EL14_C2', '请猎头协调终面时段，并说明你仍需履行现职责', '对方愿意调整，节奏变慢但边界清楚。', [['interview_rescheduled', ['EL17', 'ending_safe_switch']]], { shen: 1 }, { switch: 3 }, { runway: 0, optionality: 3, load: 1 }),
    choice('EL14_C3', '放弃本次终面，先完成当前项目里程碑', '你保住现岗位信用，也少了一个外部比较。', [['external_paused', ['EL19', 'ending_delay_leave']]], {}, { stay: 2 }, { runway: 0, optionality: -2, load: -2 }),
  ], { requiresAnyFlags: ['external_interview', 'targeted_search', 'external_ready', 'promotion_declined_wait'], careerStages: ['employed'] }),
  node('EL15', 'window', ['flag:warm_referral', 'flag:public_case', 'astro:fusion:M12'], '引荐方要你说明：为什么现在想走', '唐微或旧关系帮你获得交流机会，对方直接问离开原因。说清现实边界比把现公司贬低更能保住信用。', '诚实、克制与职业叙事。', ['tang'], [
    choice('EL15_C1', '用职责、成长和边界说明动机，并给出项目证据', '对方认可你的判断方式，进入下一轮比较。', [['motivation_credible', ['EL17', 'ending_safe_switch']]], { tang: 1 }, { switch: 4 }, { runway: 0, optionality: 5, load: 2 }),
    choice('EL15_C2', '承认尚在观察，只把这次当信息交流', '没有承诺，双方都保留空间。', [['market_probe', ['EL20', 'ending_side_probe']]], {}, { side_probe: 3 }, { runway: 0, optionality: 3, load: 1 }),
    choice('EL15_C3', '夸大现岗位困境来换同情', '对方继续礼貌沟通，但推荐人需要替你收尾。', [['narrative_risk', ['EL17', 'EL21', 'ending_delay_leave']]], { tang: -1 }, { recovery: 1 }, { runway: 0, optionality: -2, load: 2 }),
  ], { requiresAnyFlags: ['warm_referral', 'peer_reference', 'public_case', 'market_calibrated'], careerStages: ['employed'] }),
  node('EL16', 'collision', ['astro:fusion:M10', 'astro:fusion:M07'], '临时加码撞上你预留的判断时间', '现岗位临时增加了一项本周必须处理的工作，恰好占用了你原本留给恢复、比较机会或整理预算的时间。你仍在职，但不必把所有预留时间都默认交出去。', '眼前交付与可持续的判断空间。', ['xu'], [
    choice('EL16_C1', '完成必要交付，但要求删减一项低优先级任务', '本周能落地的范围被收窄，留下的条件也更清楚。', [['stay_package', ['EL19', 'ending_conditional_stay']], ['workload_reduced', ['EL19', 'ending_conditional_stay']]], { xu: 1 }, { stay: 3 }, { runway: 0, optionality: 2, load: 0 }),
    choice('EL16_C2', '守住预留时段，只完成已明确的核心工作', '你没有新增任何隐瞒承诺，预留时间得以用于有限验证或恢复。', [['dual_boundaries_kept', ['EL20', 'ending_side_probe']], ['side_trial_plan', ['EL20', 'ending_side_probe']]], {}, { side_probe: 4 }, { runway: 0, optionality: 4, load: 1 }),
    choice('EL16_C3', '拒绝新增长期责任，按预算和恢复计划重新安排离开时点', '短期关系变紧，但你把退出判断放回可执行的条件。', [['exit_reconsidered', ['EL21', 'ending_exit_reset']], ['exit_intent_clear', ['EL21', 'ending_exit_reset']]], { xu: -1 }, { exit: 3 }, { runway: 0, optionality: 2, load: -2 }),
  ], { careerStages: ['employed'] }),
  node('EL17', 'collision', ['flag:motivation_credible', 'flag:external_interview', 'astro:fusion:M01'], '新公司口头说可以给 Offer，奖金却还没到账', '外部机会进入最后确认，现公司的年度奖金要到下月才落袋。口头意向不是签字 Offer，奖金也不是已经到账的现金。', '确定性、现金与离开节奏。', ['shen'], [
    choice('EL17_C1', '等书面 Offer 和奖金条件都明确后再提离职', '你多等几天，换来更完整的比较。', [['offer_and_bonus_checked', ['EL21', 'ending_safe_switch']]], {}, { switch: 5 }, { runway: 3, optionality: 3, load: 2 }),
    choice('EL17_C2', '先接受书面 Offer，再按合同日期交接离职', '新机会确定，原岗位进入可交接阶段。', [['new_offer_accepted', ['EL21', 'ending_safe_switch']]], {}, { switch: 6 }, { runway: 5, optionality: 2, load: 3 }),
    choice('EL17_C3', '因奖金未定而暂缓，继续在职观察一个周期', '现金风险下降，离开节奏也被推后。', [['bonus_waiting', ['EL19', 'EL21', 'ending_delay_leave']]], {}, { stay: 2 }, { runway: 2, optionality: 1, load: 1 }),
  ], { requiresAnyFlags: ['external_interview', 'warm_referral', 'motivation_credible', 'interview_kept_clean', 'interview_rescheduled'], careerStages: ['employed'] }),
  node('EL18', 'collision', ['flag:internal_interview', 'flag:stay_conditioned', 'astro:fusion:M04'], '内部岗位和现团队都要你马上表态', '内部负责人给出岗位方向，许衡也希望你留下完成下一阶段。你不能同时承诺两份不同的核心职责。', '留在公司，但不再留在原位置。', ['xu'], [
    choice('EL18_C1', '选择内部换位，并设定完整交接日期', '你保住收入连续性，也要重新建立新团队信用。', [['internal_move_chosen', ['EL19', 'ending_internal_move']]], { xu: 1 }, { internal_move: 6 }, { runway: 4, optionality: 3, load: 2 }),
    choice('EL18_C2', '在原团队留下，但只接受写明的职责与复盘', '留下不再等于无限加码。', [['stay_chosen_with_terms', ['EL19', 'ending_conditional_stay']]], { xu: 1 }, { stay: 5 }, { runway: 3, optionality: 2, load: 1 }),
    choice('EL18_C3', '两边都不立刻承诺，给自己两周完成外部比较', '信息更完整，内部耐心会下降。', [['internal_decision_delayed', ['EL21', 'ending_delay_leave']]], {}, { switch: 2 }, { runway: 0, optionality: 3, load: 2 }),
  ], { requiresAnyFlags: ['internal_interview', 'internal_terms_checked', 'stay_conditioned', 'boundary_stated', 'vacancy_escalated'], careerStages: ['employed'] }),
  node('EL19', 'landing', ['flag:stay_package', 'flag:internal_move_chosen', 'astro:fusion:M02'], '留下的条件终于摆在纸面上', '奖金、职责或内部岗位已有具体方案。最后一问不是“该不该感恩”，而是条件是否足以改变你每天的工作。', '有条件留下与继续离开的准备。', ['xu'], [
    choice('EL19_C1', '签下明确职责、资源和复盘日，留下一个周期', '你选择有条件留下，并保留复盘出口。', [['ending_conditional_stay', ['ending_conditional_stay']]], {}, { stay: 6 }, { runway: 5, optionality: 2, load: 1 }),
    choice('EL19_C2', '完成内部换位，停止原团队的额外职责', '变化发生在公司内部，生活节奏有机会重建。', [['ending_internal_move', ['ending_internal_move']]], {}, { internal_move: 6 }, { runway: 4, optionality: 4, load: -1 }),
    choice('EL19_C3', '只拿已确定奖金，不再接受新的长期承诺', '现金入账后，你给外部验证留出空间。', [['bonus_collected', ['EL21', 'ending_delay_leave']]], {}, { switch: 2 }, { runway: 5, optionality: 4, load: -1 }),
  ], { requiresAnyFlags: ['stay_package', 'internal_move_chosen', 'stay_chosen_with_terms', 'bonus_waiting', 'external_paused'], careerStages: ['employed'] }),
  node('EL20', 'landing', ['flag:sidework_disclosed', 'flag:market_probe', 'astro:fusion:M10'], '副线有了第一笔验证，但还不够替代工资', '咨询、案例或市场访谈给了你证据，却不足以证明可以立刻离职。下一步是扩大试验还是把它留在安全边界内。', '试探副线与不制造虚假安全感。', ['liang'], [
    choice('EL20_C1', '保留每周固定半天副线，三个月后按收入和负荷复盘', '副线成为受控试验，不吞掉主工作。', [['ending_side_probe', ['ending_side_probe']]], { liang: 1 }, { side_probe: 6 }, { runway: 2, optionality: 5, load: 2 }),
    choice('EL20_C2', '停止副线，把积累的案例用于稳妥跳槽', '验证没有浪费，只是服务于更稳的出口。', [['safe_switch_prepared', ['EL21', 'ending_safe_switch']]], {}, { switch: 4 }, { runway: 0, optionality: 4, load: -1 }),
    choice('EL20_C3', '扩大接单前先补足六个月储备和合同边界', '你没有把一次好反馈误当成稳定收入。', [['exit_runway_building', ['EL21', 'ending_exit_reset']]], {}, { exit: 3 }, { runway: 2, optionality: 3, load: 1 }),
  ], { requiresAnyFlags: ['sidework_disclosed', 'side_trial_plan', 'market_probe', 'public_case', 'sidework_rescheduled', 'dual_boundaries_kept'], careerStages: ['employed'] }),
  node('EL21', 'landing', ['flag:new_offer_accepted', 'flag:family_threshold', 'astro:fusion:M08'], '最后落点：你不再只用“忍”或“走”描述自己', '书面 Offer、家庭阈值、奖金和恢复状态都已更清楚。此刻可以离开、延后，或先把生活与判断重整。', '主动选择与可承受的后果。', ['liang'], [
    choice('EL21_C1', '拿到书面 Offer 后按交接计划离职', '你带着下一份工作的确定性离开。', [['ending_safe_switch', ['ending_safe_switch']]], { liang: 1 }, { switch: 6 }, { runway: 5, optionality: 4, load: 1 }),
    choice('EL21_C2', '延后离开三个月，只完成储备、恢复和外部验证', '不是放弃离开，而是把时间表写成可复盘计划。', [['ending_delay_leave', ['ending_delay_leave']]], { liang: 1 }, { recovery: 4 }, { runway: 3, optionality: 3, load: -3 }),
    choice('EL21_C3', '在满足预算底线后主动离职，用四周重整方向', '你不把裸辞浪漫化，而是给恢复和验证设了期限。', [['ending_exit_reset', ['ending_exit_reset']]], {}, { exit: 6 }, { runway: -4, optionality: 4, load: -5 }),
  ], { requiresAnyFlags: ['new_offer_accepted', 'offer_and_bonus_checked', 'family_threshold', 'exit_budgeted', 'bonus_collected', 'exit_runway_building', 'internal_decision_delayed', 'exit_reconsidered', 'exit_intent_clear'], careerStages: ['employed'] }),
);

export const EMPLOYED_WANT_LEAVE = {
  id: 'employed_want_leave', title: '在职，但越来越想离开', entry: 'job_exit', version: '0.1.0', initialCareerStage: 'employed',
  careerStageTitles: { employed: '在职，但越来越想离开' },
  characters: {
    xu: { name: '许衡', title: '直属领导', identity: '直属领导 / 现岗位决策线', relationship: '负责分配你当前项目、资源与发展反馈的人' },
    shen: { name: '沈放', title: '猎头', identity: '猎头 / 外部机会线', relationship: '向你提供外部岗位信息并协调招聘流程的人' },
    tang: { name: '唐微', title: '核心同事', identity: '核心同事 / 交接与推荐线', relationship: '即将离职、了解你工作成果并可能提供职业推荐的同事' },
    liang: { name: '梁澄', title: '共同生活的家人', identity: '家人 / 生活支持线', relationship: '和你共同承担现实开支、关心离职风险的家人' },
  },
  stages: [
    { id: 'pressure', order: 1, candidates: ['EL01', 'EL02', 'EL03'], profileDriven: true },
    { id: 'terms', order: 2, candidates: ['EL04', 'EL05', 'EL06'], profileDriven: false },
    { id: 'second_path', order: 3, candidates: ['EL07', 'EL08', 'EL09'], profileDriven: false },
    { id: 'cost', order: 4, candidates: ['EL10', 'EL11', 'EL12'], profileDriven: true },
    { id: 'window', order: 5, candidates: ['EL13', 'EL14', 'EL15'], profileDriven: false },
    { id: 'collision', order: 6, candidates: ['EL16', 'EL17', 'EL18'], profileDriven: true },
    { id: 'landing', order: 7, candidates: ['EL19', 'EL20', 'EL21'], profileDriven: false },
  ], nodes: N,
  endings: [
    { id: 'ending_conditional_stay', match: { anyTags: ['flag:ending_conditional_stay'], minScore: 0 }, routeWeights: { stay: 4 }, summary: { title: '有条件留下', core: '你没有把留下等同于忍耐，而是换到了能复盘的条件。', gain: '收入连续性与更清楚的职责边界。', cost: '条件仍要靠下一次复盘兑现。', alternativeHint: '如果书面条件仍无法兑现，内部换位或外部比较仍是可以保留的出口。', qualityVariants: [{ when: { flags: ['scope_written'] }, text: '你先把加责写成事实，再谈回报。' }], shareKey: 'conditional_stay' }, action: { label: '锁定复盘日', instruction: '把职责、资源、复盘日期和退出条件写进一页确认邮件。', horizonDays: 2 } },
    { id: 'ending_internal_move', match: { anyTags: ['flag:ending_internal_move'], minScore: 0 }, routeWeights: { internal_move: 4 }, summary: { title: '内部换位', core: '你离开的是失衡的位置，不必立刻离开整家公司。', gain: '收入连续与新的职责环境。', cost: '需要重新建立团队信用。', alternativeHint: '如果新岗位边界同样模糊，先完成一次外部比较也合理。', qualityVariants: [{ when: { flags: ['handover_clean'] }, text: '你把旧责任交清后再转身。' }], shareKey: 'internal_move' }, action: { label: '完成交接表', instruction: '列出交接负责人、未决风险和新岗位前 30 天目标。', horizonDays: 3 } },
    { id: 'ending_safe_switch', match: { anyTags: ['flag:ending_safe_switch'], minScore: 0 }, routeWeights: { switch: 4 }, summary: { title: '稳妥跳槽', core: '你用书面条件和交接安排离开，而不是靠一时忍耐或冲动。', gain: '新的工作入口与可控的离开节奏。', cost: '适应新环境仍要付出精力。', alternativeHint: '如果书面条件未齐，延后离开并补足储备比仓促交接更稳。', qualityVariants: [{ when: { flags: ['interview_kept_clean'] }, text: '你没有牺牲现岗位信用来换面试。' }], shareKey: 'safe_switch' }, action: { label: '确认书面条件', instruction: '核对 Offer、入职日期、试用期和离职交接安排。', horizonDays: 2 } },
    { id: 'ending_delay_leave', match: { anyTags: ['flag:ending_delay_leave'], minScore: 0 }, routeWeights: { recovery: 4 }, summary: { title: '延后离开', core: '你把离开从情绪反应改成有期限的准备。', gain: '储备、恢复与更完整的比较证据。', cost: '需要防止期限再次被无限延长。', alternativeHint: '如果外部 Offer 已书面确认，按交接计划跳槽也不必再等完美时机。', qualityVariants: [{ when: { flags: ['recovery_week'] }, text: '你先恢复判断力，再安排下一步。' }], shareKey: 'delay_leave' }, action: { label: '写下三个月节点', instruction: '设定储备、投递和复盘三个可验证日期。', horizonDays: 1 } },
    { id: 'ending_side_probe', match: { anyTags: ['flag:ending_side_probe'], minScore: 0 }, routeWeights: { side_probe: 4 }, summary: { title: '试探副线', core: '你保留主工作的底盘，用有限试验验证另一种可能。', gain: '真实市场反馈与可迁移材料。', cost: '必须守住工时、报备和恢复边界。', alternativeHint: '如果副线已能稳定覆盖预算，再评估主动离职而不是无限并行。', qualityVariants: [{ when: { flags: ['dual_boundaries_kept'] }, text: '你没有靠隐瞒维持副线。' }], shareKey: 'side_probe' }, action: { label: '设定试验上限', instruction: '写下每周工时、非竞业边界和停止条件。', horizonDays: 2 } },
    { id: 'ending_exit_reset', match: { anyTags: ['flag:ending_exit_reset'], minScore: 0 }, routeWeights: { exit: 4 }, summary: { title: '主动离职重整', core: '你在明确预算底线后离开，为恢复和方向验证腾出空间。', gain: '时间主权与重整节奏。', cost: '收入中断与家庭沟通都需要持续面对。', alternativeHint: '如果预算底线尚未满足，先延后三个月并做有限试探也不是退缩。', qualityVariants: [{ when: { flags: ['family_threshold'] }, text: '你把离开的现实条件先和家人说清。' }], shareKey: 'exit_reset' }, action: { label: '启动四周计划', instruction: '确定最低支出、恢复日程和唯一验证目标。', horizonDays: 1 } },
  ],
};
