// 《关系没有说清，该不该继续等》：命盘只排序清晰、等待与边界风险，不能制造对方行为或结局。
const flag = (id, consumeBy) => ({ id, value: true, consumeBy });
const effect = (clarity, reciprocity, pressure) => ({ runway: clarity, optionality: reciprocity, load: pressure });
const choice = (id, label, immediate, flags, route, values) => ({ id, label, immediate, delayedFlags: flags.map(([key, targets]) => flag(key, targets)), relationEffects: {}, routeSignals: route, stateEffects: { work: effect(...values), life: {} }, nextWeights: {} });
const RULE_FOR_TAG = { 'astro:fusion:R01': 'R01_clarity_first', 'astro:fusion:R02': 'R02_emotional_wait', 'astro:fusion:R03': 'R03_peer_grounding', 'astro:fusion:R04': 'R04_time_boundary', 'astro:fusion:R05': 'R05_over_give_risk', 'astro:fusion:R06': 'R06_slow_but_real' };
const FOCUS_FOR_TAG = { 'astro:fusion:R01': 'clarity', 'astro:fusion:R02': 'waiting', 'astro:fusion:R03': 'peer', 'astro:fusion:R04': 'time', 'astro:fusion:R05': 'boundary', 'astro:fusion:R06': 'slow' };
const ALL_RELATIONSHIP_FUSIONS = Object.keys(RULE_FOR_TAG);
const ALL_RELATIONSHIP_RULES = Object.values(RULE_FOR_TAG);
const TRANSITIONS = {
  RU01: '你先意识到，自己卡住的不是一句“算不算”，而是好多事一直没说。', RU02: '聊天的温度还在变，但你开始不只凭感觉给它下结论。', RU03: '你们很亲近，可每一次往前走都像临时起意。',
  RU04: '你把想问的话在心里过了一遍，终于准备开口。', RU05: '周末快到了，原本模糊的安排开始要落到具体时间。', RU06: '你找沈知聊了聊，话题从“他/她到底怎么想”回到发生过什么。',
  RU07: '话是聊上了，但答案没有一下子变得简单。', RU08: '确认时间快到了，你也得为自己的周末做安排。', RU09: '把记录摊开以后，有些替对方补上的解释开始站不住。',
  RU10: '关系稍微说清一点，接下来反而要看行动能不能跟上。', RU11: '你发现自己已经为一个不确定的邀约挪了不少生活。', RU12: '亲近感没有消失，真正没被回应的问题也没有消失。',
  RU13: '一个很普通的截止日期，让“要不要一起安排”忽然变具体。', RU14: '这个看起来更近的动作，也需要你们先说清它代表什么。', RU15: '你的生活已经排上计划，临时邀约又来了。',
  RU16: '两周过去了，好的部分看得见，没做到的部分也不能假装不存在。', RU17: '对方没有完全离开，却还是绕开了你最想知道的事。', RU18: '你先把最难受的点说给自己听，才知道下一步该怎么走。',
  RU19: '现在不是做一生的决定，只是把接下来几周过得更清楚。', RU20: '先退半步，不等于否定这段关系。', RU21: '继续等也可以，但不能再让等待没有期限。',
};
const N = (id, stage, tags, title, situation, conflict, roles, choices, requiresAnyFlags = []) => {
  // The opening is ranked by these scene-specific focuses. Later scenes must
  // first honor facts created by the user's previous choice; astrology keeps
  // ranking legal candidates but must not rewrite the consequence.
  const relationTags = tags.filter((tag) => tag.startsWith('astro:fusion:R'));
  const preferredRules = relationTags.map((tag) => RULE_FOR_TAG[tag]).filter(Boolean);
  return { id, stage, match: { anyTags: ALL_RELATIONSHIP_FUSIONS, preferredTags: relationTags, allTags: [], requiresAnyFlags, focus: relationTags.map((tag) => FOCUS_FOR_TAG[tag]).filter(Boolean) }, roles, copy: { transition: TRANSITIONS[id], title, situation, conflict }, evidenceSlots: [{ id: 'relationship_why', requiredLayers: ['bazi', 'ziwei', 'period'], ruleIds: [...preferredRules, ...ALL_RELATIONSHIP_RULES.filter((ruleId) => !preferredRules.includes(ruleId))], fallbackTemplateId: 'evidence_partial_relationship' }], choices, shareable: true, riskTags: ['relationship'] };
};
const c = choice;

const nodes = [
  N('RU01', 'facts', ['astro:fusion:R01', 'astro:fusion:R02'], '你们聊得很多，但关系没有名字', '许澄会分享日常，也会在某些晚上聊到很晚。可一到“我们现在算什么”“接下来怎么安排”，话题就变轻了。', '继续凭感觉走，还是先把模糊变成可确认的问题。', ['xu'], [c('RU01_C1', '写下你最想确认的 3 件事：期待、频率、是否排他', '模糊变成三个问题，你知道自己要问什么。', [['expectation_list', ['RU04']]], { clarity: 2 }, [5, 0, -1]), c('RU01_C2', '继续等许澄主动定义关系', '你保住轻松感，也把主动权继续交给对方。', [['wait_for_definition', ['RU06']]], { slow_wait: 2 }, [-1, 0, 3]), c('RU01_C3', '约一次轻松见面，只看对方会不会提前把时间定下来', '你先看对方是不是真的愿意留出时间。', [['low_stakes_invite', ['RU05']]], { slow_probe: 2 }, [2, 1, 1])]),
  N('RU02', 'facts', ['astro:fusion:R02', 'astro:fusion:R05'], '亲近是真的，忽冷忽热也是真的', '许澄有时很靠近，有时又几天不主动。解释越多，你越分不清事实。', '把波动算作常态，还是记录可观察行为。', ['xu'], [c('RU02_C1', '只记录三次具体事实：谁约、何时确认、是否兑现', '你开始用行为看关系。', [['pattern_log', ['RU06']]], { clarity: 2 }, [4, 0, -2]), c('RU02_C2', '直接准备一次谈话：不问爱不爱，只问能否说清节奏', '问题不那么戏剧化，也更难被一句“想太多”带走。', [['direct_talk_ready', ['RU04']]], { clarity: 2 }, [4, 0, 1]), c('RU02_C3', '停止过度补位，先把本周自己的安排排满', '你不再给不确定预留整块生活。', [['own_week_kept', ['RU05']]], { self_anchor: 2 }, [1, 0, -4])]),
  N('RU03', 'facts', ['astro:fusion:R04', 'astro:fusion:R06'], '你们像在一起，却没有共同安排', '日常亲近已经超过普通朋友，但周末、节日、下一次见面总是临时决定。', '亲近是不是就代表对方真的在往前走。', ['xu'], [c('RU03_C1', '提出一个两周内的具体见面安排，并要求提前确认', '关系从气氛落到日程。', [['specific_plan_asked', ['RU05']]], { time_boundary: 2 }, [3, 1, 1]), c('RU03_C2', '先说清你不接受临时召唤式见面', '你给自己的时间设了底线。', [['last_minute_boundary', ['RU05']]], { boundary: 2 }, [4, 0, -2]), c('RU03_C3', '继续享受当下亲近，暂时不碰安排问题', '气氛没被打断，成本继续留在你这里。', [['arrangement_avoided', ['RU06']]], { slow_wait: 2 }, [-1, 1, 3])]),
  N('RU04', 'first_move', ['astro:fusion:R01'], '你准备第一次把期待说出口', '你不是要许澄立刻给结论，而是想知道双方是否愿意把关系节奏说清。', '清楚表达与害怕失去轻松感。', ['xu'], [c('RU04_C1', '用“我希望知道我们接下来怎么相处”开场，并约完整谈话时间', '话题被放到桌面上。', [['clear_talk_scheduled', ['RU07']]], { clarity: 3 }, [6, 0, 1]), c('RU04_C2', '只问未来两周见面频率，不碰关系名称', '问题更轻，也能先看行动。', [['two_week_rhythm_asked', ['RU07', 'RU08']]], { slow_probe: 2 }, [4, 1, 0]), c('RU04_C3', '觉得时机不对，先把话咽回去', '气氛保住了，你会继续在心里演练。', [['talk_swallowed', ['RU09']]], { slow_wait: 2 }, [-1, 0, 4])], ['expectation_list', 'direct_talk_ready']),
  N('RU05', 'first_move', ['astro:fusion:R04'], '一次周末安排变成现实测试', '你提出周末见面或共同活动。许澄没有拒绝，但也没有马上定下来。', '给对方空间，还是给自己一个最晚确认点。', ['xu'], [c('RU05_C1', '说清最晚确认时间，过点就改成自己的安排', '你给关系留空间，也不给等待无限续费。', [['confirmation_deadline_set', ['RU08']]], { boundary: 3 }, [5, 0, -2]), c('RU05_C2', '接受临时决定，反正见到就好', '摩擦降低了，时间继续被动。', [['last_minute_accepted', ['RU08']]], { slow_wait: 2 }, [-1, 1, 3]), c('RU05_C3', '同步告诉许澄：你本周也有自己的计划，需要提前约', '对方知道你的时间也很重要。', [['advance_notice_required', ['RU08']]], { self_anchor: 2 }, [3, 0, -3])], ['low_stakes_invite', 'specific_plan_asked', 'last_minute_boundary', 'own_week_kept']),
  N('RU06', 'first_move', ['astro:fusion:R03'], '沈知问你：这些判断有事实吗', '沈知不替你判断许澄，只让你把“认真”拆成会不会提前约、说了算不算、愿不愿意聊清楚。', '朋友支持是看事实，不是下结论。', ['shen'], [c('RU06_C1', '请沈知只看行为记录，不评价许澄的人品', '你得到外部视角，没有把隐私交给别人裁判。', [['peer_fact_check', ['RU09']]], { clarity: 2 }, [4, 0, -2]), c('RU06_C2', '让沈知帮你列出“再这样我会很难受”的三件事', '难受不再只是一团情绪。', [['bottom_line_drafted', ['RU09']]], { boundary: 2 }, [5, 0, -1]), c('RU06_C3', '不想看记录，先把这件事从脑子里关掉', '压力暂时下降，事实仍没被处理。', [['evidence_avoided', ['RU09']]], { self_anchor: 1, slow_wait: 1 }, [-2, 0, -3])], ['wait_for_definition', 'pattern_log', 'arrangement_avoided']),
  N('RU07', 'response', ['astro:fusion:R01'], '许澄愿意谈，但说“不想被定义绑住”', '许澄没有逃走，也没有给明确名称：现在相处很好，不想因为定义让关系变沉。', '不急着要名分，也不能一直压回需要。', ['xu'], [c('RU07_C1', '不追问名称，只问怎么联系、怎么见面、要不要只见彼此', '话题没那么重，也不再继续含糊。', [['minimum_rules_asked', ['RU10']]], { clarity: 3 }, [6, 1, 1]), c('RU07_C2', '接受暂时不下定义，但说好两周后再看一次', '慢下来不是放弃，有了时间点。', [['observation_period_set', ['RU10']]], { slow_probe: 3 }, [4, 1, -1]), c('RU07_C3', '主动说“没事，就这样也挺好”', '气氛轻了，真实期待也被收回。', [['back_to_ambiguity', ['RU12']]], { slow_wait: 2 }, [-2, 1, 4])], ['clear_talk_scheduled', 'two_week_rhythm_asked']),
  N('RU08', 'response', ['astro:fusion:R04'], '周末快到了，许澄还是说“再看”', '到了你需要安排生活的时候，对方仍没有确认。', '等待是否继续占用整块周末。', ['xu'], [c('RU08_C1', '到约定时间还没确认，就把周末改成自己的安排', '你不是报复，只是不再一直空着。', [['deadline_enforced', ['RU11']]], { boundary: 3 }, [4, 0, -4]), c('RU08_C2', '继续空着周末，等许澄最后消息', '可能性被保留，失望风险也留给自己。', [['weekend_reserved_wait', ['RU11']]], { slow_wait: 2 }, [-1, 0, 5]), c('RU08_C3', '这次可以临时见，但说好下次至少提前一天定', '你给了空间，也把下次说在前面。', [['one_time_flex_rule', ['RU10']]], { slow_probe: 2 }, [3, 1, 1])], ['two_week_rhythm_asked', 'confirmation_deadline_set', 'last_minute_accepted', 'advance_notice_required']),
  N('RU09', 'response', ['astro:fusion:R03'], '沈知看完事实说：你在替许澄补解释', '沈知只提醒：别给许澄扣帽子，也别替对方把缺口补圆。', '不妖魔化对方，也不承担所有模糊。', ['shen'], [c('RU09_C1', '先别猜许澄怎么想，只看两周里有没有主动、有没有做到', '判断从猜心回到现实。', [['behavior_count_started', ['RU10']]], { clarity: 2 }, [5, 0, -2]), c('RU09_C2', '发一段长消息，把这段时间的委屈一次说完', '情绪有出口，安排仍可能没说清。', [['long_emotion_message', ['RU12']]], { risky_release: 2 }, [1, 0, 3]), c('RU09_C3', '先暂停主动三天，把注意力放回日常和休息', '不是惩罚许澄，是停止让等待占满生活。', [['contact_pause_for_anchor', ['RU11']]], { self_anchor: 2 }, [1, 0, -5])], ['talk_swallowed', 'peer_fact_check', 'bottom_line_drafted', 'evidence_avoided']),
  N('RU10', 'cost', ['astro:fusion:R06'], '谈完以后，轻松感没有立刻回来', '关系被说清一点后，许澄下一次行动会不会兑现，变得更重要。', '谈过以后看行动，不每天反复确认。', ['xu', 'han'], [c('RU10_C1', '把刚聊过的事落成两周内能看到的动作，不每天追问', '给关系一点时间，也不给自己制造审讯感。', [['two_week_actions_written', ['RU13', 'RU14']]], { slow_probe: 3 }, [5, 1, -1]), c('RU10_C2', '对许澄更好一点，希望对方自然更认真', '亲近可能增加，答案不一定清楚。', [['over_give_started', ['RU15']]], { over_give: 2 }, [-1, 1, 5]), c('RU10_C3', '找韩照帮你听一遍：我是在好好说，还是像在逼答案', '你把话说得更稳。', [['conversation_reviewed', ['RU14']]], { boundary: 2 }, [4, 0, -3])], ['minimum_rules_asked', 'observation_period_set', 'one_time_flex_rule', 'behavior_count_started']),
  N('RU11', 'cost', ['astro:fusion:R02'], '你发现自己一直在给不确定留时间', '睡眠、朋友局和自己的安排都能被你挪开，只为了等许澄一个可能的安排。', '继续空出自己，还是重新建立生活锚点。', ['xu'], [c('RU11_C1', '每周只留一个可以临时约的时间，其余按自己的计划走', '你没有关门，只是不再无限待命。', [['availability_window_set', ['RU15']]], { self_anchor: 3 }, [3, 0, -5]), c('RU11_C2', '继续随叫随到，想着再等等也许就清楚了', '偶尔会甜，也会被临时安排牵着走。', [['always_available', ['RU15']]], { slow_wait: 2, over_give: 1 }, [-2, 1, 5]), c('RU11_C3', '这一周先不主动约，只回应说得清时间地点的邀请', '互动会降温，真实节奏更容易被看见。', [['clear_invites_only', ['RU15']]], { boundary: 2 }, [2, 0, -4])], ['deadline_enforced', 'weekend_reserved_wait', 'contact_pause_for_anchor']),
  N('RU12', 'cost', ['astro:fusion:R05'], '亲近还在，但关键问题仍被绕开', '许澄仍会关心你；一碰安排、频率或期待，又转回“别想太多”。', '亲近不等于清晰，清晰也不等于逼迫。', ['xu'], [c('RU12_C1', '直接说：我珍惜这些亲近，但我也需要知道我们怎么相处', '你不让好掩盖没说清的部分。', [['intimacy_rule_split', ['RU14']]], { clarity: 2, boundary: 1 }, [5, 0, -1]), c('RU12_C2', '把亲近当成关系会变好的信号，继续等', '短期舒服，长期要承担不确定。', [['intimacy_as_promise', ['RU14']]], { slow_wait: 3 }, [-2, 1, 4]), c('RU12_C3', '在没说清前，先不留宿、不空出整晚、不取消自己的事', '你把自己的时间先放回手里。', [['no_escalation_before_clarity', ['RU15']]], { boundary: 3 }, [4, 0, -4])], ['back_to_ambiguity', 'long_emotion_message']),
];

const later = [
  ['RU13', 'outside_window', ['astro:fusion:R04'], '林予发来一个共同活动的截止时间', '共同活动有名额或费用截止；它不是关系考验，只是把安排推到时间表上。', '不拿截止逼清楚，也不替两个人兜底。', ['lin'], [['许澄确认了再报名，没确认就算了', 'booking_guard_kept', 'RU16', 'boundary', [4,0,-2]], ['先替两个人订下，免得错过机会', 'prepaid_to_hold', 'RU17', 'over_give', [-1,1,5]], ['不参加这次活动，把它当作观察期里的一个样本', 'outside_option_declined', 'RU18', 'self_anchor', [1,0,-3]]], ['two_week_actions_written']],
  ['RU14', 'outside_window', ['astro:fusion:R06'], '许澄突然提出见朋友或一起过节', '许澄给出一个看起来更近的动作：见朋友、一起过节或进入社交场。', '公开动作是不是关系清晰度。', ['xu'], [['先问一句：这只是一起玩，还是我们真的往前走一步', 'public_step_defined', 'RU16', 'clarity', [5,1,0]], ['很开心直接答应，心里默认这是关系在变近', 'public_step_accepted_unclear', 'RU17', 'slow_wait', [1,3,2]], ['先不去见朋友，说明没说清前你会不自在', 'public_step_refused', 'RU18', 'boundary', [3,-1,-1]]], ['two_week_actions_written','conversation_reviewed','intimacy_rule_split','intimacy_as_promise']],
  ['RU15', 'outside_window', ['astro:fusion:R02'], '你的生活里也出现了一个重要安排', '你的计划已经排上日程，许澄这时又发来临时邀约。', '在乎关系，也不能每次把生活往后挪。', ['xu'], [['说自己今天已有安排，并给出下一个能见的时间', 'alternative_time_offered', 'RU16', 'self_anchor', [3,0,-4]], ['推掉自己的安排，先见许澄', 'self_plan_sacrificed', 'RU17', 'over_give', [-1,1,5]], ['不解释，直接晚回或消失', 'silent_withdrawal', 'RU18', 'risky_release', [-2,-2,1]]], ['over_give_started','availability_window_set','always_available','clear_invites_only','no_escalation_before_clarity']],
  ['RU16', 'collision', ['astro:fusion:R01'], '过了两周，许澄做到了一部分', '许澄会提前约，也有主动联系，但还有一块没讲明白。', '做到一半，能不能把自己全放进去。', ['xu'], [['再给四周，但只按已经做到的部分继续', 'partial_continue_with_rules', 'RU19', 'slow_probe', [4,2,-1]], ['把这一半当成关系稳定了，自己先往前冲', 'premature_escalation', 'RU21', 'over_give', [1,3,4]], ['说明现在还不够让你继续往前，先保持现在的距离', 'not_enough_to_escalate', 'RU20', 'boundary', [3,0,-2]]], ['booking_guard_kept','public_step_defined','alternative_time_offered']],
  ['RU17', 'collision', ['astro:fusion:R05'], '许澄不愿给清楚答案，又不想你离开', '许澄会挽留、会亲近；一谈怎么相处、要不要只见彼此，又绕开了。', '一句不舍是否够支撑继续等待。', ['xu'], [['最后问一次：怎么联系、怎么见面、要不要只见彼此', 'minimum_rules_final', 'RU19', 'clarity', [6,0,1]], ['接受“顺其自然”，暂时不再追问', 'vague_nature_accepted', 'RU21', 'slow_wait', [-2,1,4]], ['不再来回拉扯，只留一次好好收尾的话', 'close_unclear_loop', 'RU20', 'close_loop', [4,-1,-4]]], ['prepaid_to_hold','public_step_accepted_unclear','self_plan_sacrificed']],
  ['RU18', 'collision', ['astro:fusion:R03'], '韩照帮你看明白：你不是怕慢，是怕一直没个说法', '最让你难受的不是关系慢，而是每次都没有准话、没有提前量。', '最后再说清一次，还是先把自己拉出来。', ['han'], [['写下 3 件你不能再忍的事，和许澄最后说清一次', 'final_calibration_ready', 'RU19', 'boundary', [6,0,-2]], ['不再讨论，直接慢慢淡出', 'fade_out_started', 'RU21', 'self_anchor', [1,-2,-2]], ['先恢复生活秩序，再决定要不要谈最后一次', 'self_reset_before_decide', 'RU20', 'self_anchor', [2,0,-6]]], ['outside_option_declined','public_step_refused','silent_withdrawal']],
];
const LATER_IMMEDIATE = {
  RU13_C1: '你没替两个人把钱和承诺先垫上。', RU13_C2: '名额留住了，但不确定也被你先扛下了。', RU13_C3: '你把这次截止当成一条记录，没有拿它逼谁表态。',
  RU14_C1: '开心归开心，你还是把这一步的意思问清了。', RU14_C2: '你答应了，也暂时把期待放在心里。', RU14_C3: '你没有扫兴，只是没让自己硬着头皮去。',
  RU15_C1: '你守住了自己的安排，也给了一个能见面的时间。', RU15_C2: '你又把自己的计划往后放了一次。', RU15_C3: '你先抽开一下，但这次没有把原因说出来。',
  RU16_C1: '你愿意再看一段，但只按已经做到的部分往前走。', RU16_C2: '你把一点进展当成了全部答案。', RU16_C3: '你说出了“还不够”，没有把自己硬塞进去。',
  RU17_C1: '你把最后的问题问得很具体，不再只问感觉。', RU17_C2: '你先接受了模糊，心里那块悬着的事也还在。', RU17_C3: '你不再拉扯，只准备把话好好收住。',
  RU18_C1: '你把底线写下来，准备再给这段关系一次说清的机会。', RU18_C2: '你开始往后退，不再反复制造新的话题。', RU18_C3: '你先把生活收回来，关系的答案可以晚一点。',
};
later.forEach(([id, stage, tags, title, situation, conflict, roles, rows, gate]) => nodes.push(N(id, stage, tags, title, situation, conflict, roles, rows.map(([label, key, target, route, values], i) => c(`${id}_C${i + 1}`, label, LATER_IMMEDIATE[`${id}_C${i + 1}`], [[key, [target]]], { [route]: route === 'slow_probe' ? 4 : 3 }, values)), gate)));

const endings = [
  ['ending_clear_continue', '继续，但终于说清楚', '你们把怎么联系、怎么见面、要不要只见彼此讲清楚。', '关系还有空间，也有接下来能看见的动作。', '少了一点“顺其自然”的浪漫，但少了很多猜。', '写下 4 周后再看一次，只看说过的话有没有做到。', '我没有问“你到底爱不爱我”，我只问这段关系能不能别再靠猜。', '真正让我安心的不是一句好听的话，是对方愿不愿意把话落到时间上。', '如果一段关系还没名字，你会先要一个答案，还是先把怎么相处说清？'],
  ['ending_slow_probe', '放慢观察', '你暂时不逼关系定型，但把等待限制在一个周期里。', '可能性被保留，消耗被降低。', '短期仍有不确定，必须看行动。', '设定 30 天，只看主动、提前约、愿不愿意聊清楚。', '我决定再看 30 天，但这次不是没完没了地等。', '慢不是问题，一直没有期限的慢才会把人拖空。', '你能接受一段关系慢慢来吗？前提是它有明确再看时间。'],
  ['ending_boundary_repair', '把自己的时间拿回来', '你承认关系有亲近，也承认自己被临时邀约和“再看”消耗了。', '关系不必马上结束，但你的时间先回到自己手里。', '许澄可能需要适应新的相处方式。', '不取消自己的安排，不替对方先付不确定成本。', '我没有冷掉，只是不再把整块生活留给一句“再看”。', '把时间拿回来，不是惩罚对方，是不想靠透支维持亲近。', '如果你很喜欢一个人，还能不随叫随到吗？'],
  ['ending_step_back', '暂时拉开', '你不急着分开，也不继续往前冲；先把关系退回能看清的位置。', '你能看见对方是否会在没有你补位时仍然行动。', '亲近会减少，失落感会出现。', '保留普通联系，四周后只看行动。', '我没有逼一个答案，只是从暧昧里往后退了一步。', '有时候退一步不是放弃，是终于能看清谁在往前走。', '如果你停止主动补位，对方还会往前走吗？'],
  ['ending_close_loop', '体面收口', '你选择用一次好好说话结束暧昧式沟通。', '等待停止，生活重新打开。', '会有遗憾，也可能短期反复想起。', '只说事实、感谢和自己的决定，不评价对方。', '我没有等到一个明确答案，所以我给了自己一个明确结尾。', '有些关系不是坏到必须离开，而是模糊到不能继续认真下去。', '你会为了一个没说出口的可能性，继续留在原地吗？'],
  ['ending_self_reset', '先把自己带回来', '这一轮关系选择先暂停，因为生活节奏已经被等待挤压。', '判断力恢复，关系不再占据全部注意力。', '短期不会有关系结论。', '连续两周恢复固定作息和自己的安排，再决定要不要最后谈一次。', '我这次没有选对方，也没有选分开，我先把自己从等待里带回来。', '状态很乱的时候，大决定常常不是答案，而是焦虑在找出口。', '如果一段关系让你不像自己了，你会先解决关系，还是先找回自己？'],
].map(([id, title, core, gain, cost, instruction, hook, insight, question]) => ({ id, match: { anyTags: [`flag:${id}`] }, routeWeights: {}, summary: { title, core, gain, cost, alternativeHint: '重走这一局，优先尝试另一种关键选择。', qualityVariants: [] }, action: { instruction }, share: { hook, insight, question } }));

['RU19', 'RU20', 'RU21'].forEach((id) => {
  const mapping = id === 'RU19' ? ['ending_clear_continue', 'ending_slow_probe', 'ending_boundary_repair'] : id === 'RU20' ? ['ending_step_back', 'ending_close_loop', 'ending_self_reset'] : ['ending_slow_probe', 'ending_step_back', 'ending_self_reset'];
  const labels = id === 'RU19' ? ['继续相处，但把怎么联系、怎么约、什么时候再看写清楚', '慢一点，只保留固定联系和一个月后的再看时间', '继续亲近，但不再接受“今天突然叫你就得去”'] : id === 'RU20' ? ['先不再往前走，保留普通联系，四周后只看行动', '体面收口：说清感谢、遗憾和不再继续暧昧', '先不做关系决定，睡好觉，把自己的安排找回来'] : ['给自己最后 30 天观察期，只看三条行为指标', '不再像恋人一样付出，先回到普通朋友或低频联系', '承认这轮模糊已经伤到你，先把生活秩序拿回来'];
  const landingImmediate = {
    RU19: [
      '你没急着给这段关系贴标签，先把相处的细节写下来了。',
      '你给了彼此一点时间，也给等待画了一条线。',
      '你还愿意靠近，但不再为临时邀约把生活全空出来。',
    ],
    RU20: [
      '你先把距离放回一个自己能承受的位置。',
      '你决定好好说完，不再反复等一句含糊的挽留。',
      '这次先照顾状态，关系不用今晚就判个结果。',
    ],
    RU21: [
      '你愿意再看三十天，但只看真正发生过的行动。',
      '你先把投入降下来，让关系回到更轻一点的位置。',
      '你承认自己已经累了，先把生活重新排起来。',
    ],
  };
  nodes.push(N(id, 'landing', ['astro:fusion:R02'], id === 'RU19' ? '这段关系可以继续，但不能再只靠感觉' : id === 'RU20' ? '这段关系要先拉开一点，才看得清' : '如果这一轮仍然说不清，也要把等待变成决定', '你要决定接下来 4–8 周怎么相处。', '不把等待写成没有代价的选择。', ['xu'], mapping.map((endingId, i) => c(`${id}_C${i + 1}`, labels[i], landingImmediate[id][i], [[endingId, [endingId]]], { [endingId]: 6 }, [i === 2 ? 3 : 6, i === 1 ? -1 : 1, -4])), id === 'RU19' ? ['partial_continue_with_rules','minimum_rules_final','final_calibration_ready'] : id === 'RU20' ? ['not_enough_to_escalate','minimum_rules_final','close_unclear_loop','final_calibration_ready','self_reset_before_decide'] : ['premature_escalation','vague_nature_accepted','fade_out_started','self_reset_before_decide']));
});

export const RELATIONSHIP_UNCLEAR = { id: 'relationship_unclear', entry: 'relationship_unclear', version: '0.5.0', title: '关系没有说清，该不该继续等', themeId: 'relationship', themeLabel: '关系岔路', resultLabel: '关系路线', shareBrand: 'MINGLI · 关系岔路', journeyLabel: '来走一遍你的关系岔路', evidenceLabel: '这一轮的命盘底色', chipLabels: { safety: '关系清晰度', opportunity: '对等感', load: '等待消耗' }, stageLabels: { unemployed: '关系未明' }, characters: { xu: { name: '许澄', identity: '正在接触或交往的人', relationship: '通过回复、见面和约定体现态度，不替命盘证明真心' }, shen: { name: '沈知', identity: '信任的同侪朋友', relationship: '帮你看事实，不替你下结论' }, lin: { name: '林予', identity: '外部窗口人', relationship: '只确认共同活动的客观期限' }, han: { name: '韩照', identity: '帮你捋清楚的朋友', relationship: '只基于已说过的话和你的底线复盘' } }, nodes, stages: [{ id: 'facts', candidates: ['RU01','RU02','RU03'] }, { id: 'first_move', candidates: ['RU04','RU05','RU06'] }, { id: 'response', candidates: ['RU07','RU08','RU09'] }, { id: 'cost', candidates: ['RU10','RU11','RU12'] }, { id: 'outside_window', candidates: ['RU13','RU14','RU15'] }, { id: 'collision', candidates: ['RU16','RU17','RU18'] }, { id: 'landing', candidates: ['RU19','RU20','RU21'] }], endings, shareCopy: Object.fromEntries(endings.map((ending) => [ending.id, ending.share])) };
