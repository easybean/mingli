// 《想转行，但担心从头开始》：用户仍有收入/原岗位底盘，命理只排序
// “作品、学习、现金、外部窗口、恢复”这些焦点，不制造转行成功事实。
const flag = (id, consumeBy) => ({ id, value: true, consumeBy });
const life = (work) => ({
  pressure: Math.round((work.load || 0) * 0.75),
  opportunity: Math.round((work.optionality || 0) * 0.85),
  relationship: Math.round((work.load || 0) * -0.12),
  stability: Math.round((work.runway || 0) * 0.7),
  resources: Math.round((work.runway || 0) * 0.75),
  wellbeing: Math.round((work.load || 0) * -0.75),
});
const choice = (id, label, immediate, flags, relations, routes, work, nextWeights = {}) => ({
  id, label, immediate,
  delayedFlags: flags.map(([key, consumeBy]) => flag(key, consumeBy)),
  relationEffects: relations,
  routeSignals: routes,
  stateEffects: { work, life: life(work) },
  nextWeights,
});
const RULE = {
  M01: 'M01_cash_anchor',
  M03: 'M03_proof_before_title',
  M05: 'M05_external_move',
  M06: 'M06_learn_to_switch',
  M07: 'M07_rest_then_decide',
  M10: 'M10_income_dual_track',
};
const TRANSITIONS = {
  CS01: '你又一次在下班后打开新行业岗位，熟悉感和陌生感同时出现。',
  CS02: '几个岗位描述看起来很近，真正的门槛却藏在作品和工具里。',
  CS03: '梁澄看到你连续几晚刷课，问这件事准备试多久。',
  CS04: '程岚看完你的可迁移能力表，只圈出能被新行业听懂的部分。',
  CS05: '课程顾问顾言发来课程表，也发来一串“转行成功案例”。',
  CS06: '你终于把四周试验排进日历，时间成本变得具体。',
  CS07: '唐微看了你的旧案例改写，说它还不像新行业的人会写的材料。',
  CS08: '第一个最小作品做到一半，真正缺的东西开始露出来。',
  CS09: '朋友带来一个很小的付费需求，边界却还没说清。',
  CS10: '白天上班、晚上学习，四周还没结束，你已经开始累。',
  CS11: '原岗位的一次交付提醒你：旧信用也在参与这次转行。',
  CS12: '没有清晰反馈时，问题很快从“作品够不够”变成“我行不行”。',
  CS13: '第一次外部反馈来了，它具体到让人不舒服，也终于可用。',
  CS14: '外部窗口问你：如果从低一级开始，你愿不愿意。',
  CS15: '小项目有了追加需求，机会和失控只隔着一张边界表。',
  CS16: '新方向交流撞上原岗位关键节点，两边都不能随便消失。',
  CS17: '第一笔验证完成了，但它还不能替代一份稳定工资。',
  CS18: '梁澄提醒你，家里已经感受到这段双线压力。',
  CS19: '到这一步，转行不再只是念头，可以落成下一轮低风险试验。',
  CS20: '新方向确实能继续，但代价需要摆到桌面上。',
  CS21: '如果暂时不转，也要让它成为一个有条件的决定。',
};
const VARIANTS = {
  CS04: [{ id: 'cs04-gap-echo', priority: 4, when: { flags: ['jd_gap_map'] }, copyPatch: { transition: '你带着岗位缺口表来找程岚，她只圈出能被新行业听懂的部分。' } }],
  CS07: [{ id: 'cs07-peer-echo', priority: 4, when: { flags: ['peer_transfer_feedback'] }, copyPatch: { transition: '唐微指出过一段可迁移经历后，又看了你的旧案例改写。' } }],
  CS10: [{ id: 'cs10-overload-echo', priority: 5, when: { flags: ['overloaded_trial'] }, copyPatch: { situation: '你把所有下班时间都压上后，进度确实更快，疲惫也更早出现。' } }],
  CS11: [
    { id: 'cs11-project-echo', priority: 5, when: { flags: ['paid_micro_project'] }, copyPatch: { transition: '接下小项目后，原岗位的一次交付提醒你：旧信用也在参与这次转行。', situation: '你白天还有原岗位职责，晚上又要推进小项目。最近一次交付虽然没出大问题，但注意力已经被新方向分走。' } },
    { id: 'cs11-mvp-echo', priority: 4, when: { flags: ['mvp_done'] }, copyPatch: { transition: '完成最小作品后，原岗位的一次交付提醒你：旧信用也在参与这次转行。' } },
  ],
  CS12: [{ id: 'cs12-private-echo', priority: 4, when: { flags: ['private_polish'] }, copyPatch: { transition: '连续私下打磨后，问题开始从材料质量滑向自我怀疑。' } }],
  CS08: [
    { id: 'cs08-course-echo', priority: 4, when: { flags: ['course_terms_checked'] }, copyPatch: { transition: '你问清课程条款后，把学习内容落到第一个最小作品上。' } },
    { id: 'cs08-skill-echo', priority: 4, when: { flags: ['skill_gap_named'] }, copyPatch: { transition: '你承认硬技能缺口后，第一个最小作品做到一半，缺口变得更具体。' } },
  ],
  CS09: [
    { id: 'cs09-interview-echo', priority: 4, when: { flags: ['interview_only'] }, copyPatch: { transition: '只做信息访谈一段时间后，一个朋友带来很小的付费需求。' } },
    { id: 'cs09-feedback-avoided-echo', priority: 3, when: { flags: ['feedback_avoided'] }, copyPatch: { transition: '你暂时放下材料时，一个小项目把问题从“想不想”推回“能不能做”。' } },
  ],
  CS13: [
    { id: 'cs13-mvp-echo', priority: 4, when: { flags: ['mvp_done'] }, copyPatch: { transition: '粗糙但完整的 v1 被看见后，第一次外部反馈来了。' } },
    { id: 'cs13-replan-echo', priority: 4, when: { flags: ['replan_after_rest'] }, copyPatch: { transition: '暂停一周重新排计划后，你把手里已有材料交给一个从业者看。' } },
    { id: 'cs13-doubt-echo', priority: 4, when: { flags: ['doubt_to_questions'] }, copyPatch: { transition: '你把怀疑拆成问题后，终于拿到第一次外部反馈。' } },
    { id: 'cs13-pause-echo', priority: 4, when: { flags: ['switch_pause'] }, copyPatch: { transition: '关掉信息源一周后，你只带着一个问题去问真实从业者。', situation: '暂停没有让方向自动清楚，但噪音少了。你把一个最小问题交给从业者或潜在用户看，只要求对方判断“这一版哪里不像行内人”。' } },
  ],
  CS16: [{ id: 'cs16-role-echo', priority: 4, when: { flags: ['current_role_guarded'] }, copyPatch: { situation: '你已经列过原岗位最低质量线，但新方向交流仍和关键交付挤在同一周。' } }],
  CS18: [{ id: 'cs18-course-echo', priority: 4, when: { flags: ['expensive_course'] }, copyPatch: { transition: '高价课程和原工作并行几周后，梁澄提醒你重新说清上限。' } }],
  CS21: [{ id: 'cs21-recovery-echo', priority: 4, when: { flags: ['recovery_first'] }, copyPatch: { situation: '你曾先暂停一周恢复，现在更容易把“暂时不转”写成清楚决定，而不是逃避。' } }],
};
const FOCUS = {
  CS01: ['opportunity'], CS02: ['transition', 'opportunity'], CS03: ['safety', 'recovery'],
  CS10: ['recovery'], CS11: ['negotiation', 'safety'], CS12: ['recovery'],
  CS16: ['transition', 'negotiation'], CS17: ['safety', 'opportunity'], CS18: ['recovery', 'safety'],
};
const node = (id, stage, anyTags, title, situation, conflict, roles, choices, requirements = {}) => ({
  id, stage,
  match: { anyTags, allTags: ['entry:career_switch'], minScore: 0, careerStages: ['employed'], focus: FOCUS[id] || [], ...requirements },
  roles,
  copy: { transition: TRANSITIONS[id], title, situation, conflict },
  variants: VARIANTS[id] || [],
  evidenceSlots: [{
    id: 'why_this',
    requiredLayers: ['bazi', 'ziwei', 'period'],
    ruleIds: [...new Set(anyTags.filter((tag) => tag.startsWith('astro:fusion:')).map((tag) => RULE[tag.slice(-3)]).filter(Boolean))],
    fallbackTemplateId: 'evidence_partial_work',
  }],
  choices,
  shareable: true,
  riskTags: ['career'],
});

const N = [
  node('CS01', 'facts', ['astro:fusion:M03', 'astro:fusion:M06'], '你不是不想干了，是想换一条赛道', '原岗位收入还在，但你已经连续三个月关注一个新方向：收藏岗位、看课程、关注从业者，却还没做出一个能被别人评价的东西。', '继续研究，还是把转行从想法变成验证动作。', ['cheng'], [
    choice('CS01_C1', '列出旧工作中能迁移的 3 个能力，并配一个真实案例', '你发现并非一切归零，但也有一块证据明显缺失。', [['transfer_list', ['CS04', 'CS07', 'CS13']]], { cheng: 1 }, { proof: 2 }, { runway: 0, optionality: 4, load: 1 }, { CS04: 6, CS07: 3 }),
    choice('CS01_C2', '报一个四周入门课，把转行理解为先学习', '你获得结构化入口，但课程并不会自动变成行业认可。', [['course_started', ['CS05', 'CS10', 'CS19']]], { gu: 1 }, { learning: 2 }, { runway: -2, optionality: 2, load: 3 }, { CS05: 6, CS10: 2 }),
    choice('CS01_C3', '暂时不告诉任何人，继续看岗位和经验帖', '你保留安全感，也让焦虑继续停在脑内循环。', [['silent_research', ['CS06', 'CS12', 'CS21']]], {}, { delay: 2 }, { runway: 0, optionality: 1, load: 2 }, { CS06: 5, CS12: 3 }),
  ]),
  node('CS02', 'facts', ['astro:fusion:M03', 'astro:fusion:M05'], '新行业看起来很近，门槛却说不清', '新行业的岗位描述里有很多熟悉词：项目、沟通、数据、运营、产品、咨询。但真正要求的作品、工具或行业知识不完全一样。', '相似感是否等于可迁移。', ['tang'], [
    choice('CS02_C1', '拿 3 个目标岗位反推必须补的作品和工具', '岗位不再只是诱惑，变成一张缺口清单。', [['jd_gap_map', ['CS04', 'CS08', 'CS14']]], {}, { proof: 2 }, { runway: 0, optionality: 5, load: 2 }, { CS04: 4, CS08: 5 }),
    choice('CS02_C2', '找唐微问：你过去哪段经历最像新方向', '唐微指出一个你低估的旧项目，也提醒别夸大。', [['peer_transfer_feedback', ['CS07', 'CS13']]], { tang: 2 }, { market: 2 }, { runway: 0, optionality: 4, load: 1 }, { CS07: 6 }),
    choice('CS02_C3', '先把目标范围缩小到一个细分岗位', '选择空间变窄，但验证成本也下降。', [['niche_chosen', ['CS08', 'CS15', 'CS19']]], {}, { focused: 2 }, { runway: 0, optionality: 3, load: -1 }, { CS08: 5 }),
  ]),
  node('CS03', 'facts', ['astro:fusion:M01', 'astro:fusion:M07'], '梁澄问：你准备花多少时间试', '梁澄看到你下班后连续刷课和看岗位，问你这件事会占用多少晚上、多少钱，以及什么时候知道“不适合”。', '转行不是个人幻想，它会挤占现实生活。', ['liang'], [
    choice('CS03_C1', '一起定四周试验预算：钱、晚上数、停止条件', '支持变成边界，不再只是“你自己看着办”。', [['trial_guardrail', ['CS06', 'CS10', 'CS18']]], { liang: 2 }, { safe_probe: 2 }, { runway: 2, optionality: 2, load: -2 }, { CS06: 6 }),
    choice('CS03_C2', '说明你不想被泼冷水，先自己试一个月', '自主感保住了，但生活安排还没有被同步。', [['life_sync_deferred', ['CS12', 'CS18']]], { liang: -1 }, { delay: 1 }, { runway: 0, optionality: 2, load: 2 }, { CS12: 4, CS18: 2 }),
    choice('CS03_C3', '先暂停一周，把当前工作和睡眠恢复到可判断状态', '你没有否定转行，只是先把判断力救回来。', [['recovery_first', ['CS11', 'CS21']]], { liang: 1 }, { recovery: 2 }, { runway: 0, optionality: -1, load: -5 }, { CS11: 5, CS21: 2 }),
  ]),
  node('CS04', 'verify', ['flag:transfer_list', 'flag:jd_gap_map', 'astro:fusion:M03'], '程岚看完你的“可迁移能力表”', '程岚只看材料，不看你的热情。她圈出两类能力：一种新行业听得懂，另一种只是原公司语境里的贡献。', '旧成绩如何翻译成新行业证据。', ['cheng'], [
    choice('CS04_C1', '把一个旧项目改写成新行业能理解的案例页', '旧积累被翻译出来，但还缺外部反馈。', [['case_rewritten', ['CS07', 'CS13', 'CS19']]], { cheng: 2 }, { proof: 3 }, { runway: 0, optionality: 6, load: 2 }, { CS07: 5, CS13: 2 }),
    choice('CS04_C2', '承认有一块硬技能缺口，安排两周补齐', '路径更诚实，短期速度变慢。', [['skill_gap_named', ['CS05', 'CS10', 'CS20']]], { cheng: 1 }, { learning: 2 }, { runway: -1, optionality: 3, load: 2 }, { CS05: 4, CS10: 3 }),
    choice('CS04_C3', '觉得被否定，先放下材料，继续看机会', '情绪缓了一点，但证据缺口没有消失。', [['feedback_avoided', ['CS12', 'CS21']]], { cheng: -1 }, { delay: 2 }, { runway: 0, optionality: -1, load: -1 }, { CS12: 5 }),
  ]),
  node('CS05', 'verify', ['flag:course_started', 'flag:skill_gap_named', 'astro:fusion:M06'], '课程顾问说“很多人零基础转成功”', '顾言作为课程/训练营窗口人，给出课程表和费用。她能确认作业、退款和就业服务条款，不能保证转行成功。', '学习投入与营销承诺。', ['gu'], [
    choice('CS05_C1', '只问作业产出、退款条件和就业服务边界', '你把热情从广告里拿回来，落到合同条款。', [['course_terms_checked', ['CS10', 'CS14', 'CS20']]], { gu: 1 }, { safe_probe: 2 }, { runway: 0, optionality: 3, load: 0 }, { CS10: 4, CS14: 3 }),
    choice('CS05_C2', '先买低价入门课，不承诺长期班', '成本可控，但学习深度有限。', [['starter_course', ['CS10', 'CS19']]], {}, { learning: 1 }, { runway: -1, optionality: 2, load: 2 }, { CS10: 3 }),
    choice('CS05_C3', '直接报名高价班，逼自己认真转', '决心很强，现金和时间压力也立刻上来。', [['expensive_course', ['CS10', 'CS18', 'CS21']]], { liang: -1 }, { risky_push: 2 }, { runway: -8, optionality: 5, load: 6 }, { CS10: 5, CS18: 4 }),
  ]),
  node('CS06', 'verify', ['flag:trial_guardrail', 'flag:silent_research', 'flag:life_sync_deferred', 'astro:fusion:M01'], '你把四周试验写进日历', '如果只是“有空就学”，转行会继续变成深夜焦虑。你需要给四周试验排出固定时段。', '保留原工作表现，同时给新方向一点真实空间。', ['liang'], [
    choice('CS06_C1', '每周两晚做作品，一晚复盘，不碰工作时间', '节奏清楚，速度不快，但更可持续。', [['fixed_trial_calendar', ['CS08', 'CS11', 'CS18']]], { liang: 1 }, { safe_probe: 3 }, { runway: 0, optionality: 4, load: 1 }, { CS08: 5, CS11: 3 }),
    choice('CS06_C2', '把所有下班时间都压上，四周后必须见结果', '进展会更快，生活和恢复空间被压缩。', [['overloaded_trial', ['CS10', 'CS12', 'CS18']]], {}, { risky_push: 2 }, { runway: 0, optionality: 5, load: 7 }, { CS10: 5, CS18: 4 }),
    choice('CS06_C3', '暂时只做信息访谈，不做作品', '你获得现实信息，但仍没有可展示证据。', [['interview_only', ['CS13', 'CS15', 'CS21']]], {}, { market: 1 }, { runway: 0, optionality: 3, load: 0 }, { CS13: 3, CS15: 3 }),
  ]),
  node('CS07', 'proof', ['flag:case_rewritten', 'flag:peer_transfer_feedback', 'flag:transfer_list', 'astro:fusion:M03'], '唐微看了你的旧案例改写', '唐微愿意从同侪角度说真话：这份材料能看出你会做事，但还不像新行业的人会写的案例。', '保住旧成绩的自尊，还是接受重写。', ['tang'], [
    choice('CS07_C1', '请她直接指出最不像新行业表达的三处', '材料被改得更痛，但方向清楚了。', [['peer_redline', ['CS13', 'CS16', 'CS19']]], { tang: 2 }, { proof: 3 }, { runway: 0, optionality: 5, load: 2 }, { CS13: 4, CS16: 2 }),
    choice('CS07_C2', '只保留她认可的部分，先投一次试试看', '你获得一次投递动作，但反馈可能混杂。', [['early_application', ['CS14', 'CS16']]], { tang: 1 }, { market: 2 }, { runway: 0, optionality: 4, load: 3 }, { CS14: 4, CS16: 2 }),
    choice('CS07_C3', '觉得材料还没准备好，继续私下打磨', '风险暂时降低，也容易拖成无限修改。', [['private_polish', ['CS12', 'CS21']]], {}, { delay: 2 }, { runway: 0, optionality: 1, load: 1 }, { CS12: 5 }),
  ]),
  node('CS08', 'proof', ['flag:jd_gap_map', 'flag:niche_chosen', 'flag:fixed_trial_calendar', 'flag:skill_gap_named', 'flag:course_terms_checked', 'flag:starter_course', 'flag:expensive_course', 'flag:overloaded_trial', 'astro:fusion:M06'], '第一个最小作品做到一半', '你选了一个细分方向，做一个能在两周内完成的小作品。做到一半时，发现工具、表达和行业常识都比想象更细。', '完成一版粗糙作品，还是继续补课。', [], [
    choice('CS08_C1', '完成粗糙但可展示的 v1，并标出自己不确定的地方', '作品不完美，却终于能被别人评价。', [['mvp_done', ['CS13', 'CS15', 'CS19']]], {}, { proof: 4 }, { runway: 0, optionality: 7, load: 3 }, { CS13: 5, CS15: 2 }),
    choice('CS08_C2', '停下补关键工具，再延后一周提交', '质量可能更好，试验周期被拉长。', [['tool_gap_study', ['CS10', 'CS20']]], {}, { learning: 2 }, { runway: -1, optionality: 3, load: 2 }, { CS10: 4 }),
    choice('CS08_C3', '放弃这个方向，换一个看起来更简单的细分', '焦虑短暂下降，但验证重启。', [['niche_switched', ['CS12', 'CS21']]], {}, { delay: 2 }, { runway: 0, optionality: 0, load: -1 }, { CS12: 4 }),
  ]),
  node('CS09', 'proof', ['flag:feedback_avoided', 'flag:interview_only', 'astro:fusion:M10', 'astro:fusion:M03'], '一个朋友问你能不能帮忙做小项目', '朋友有个很小的需求，愿意给一点费用，但需求边界模糊。它不是转行成功，只是一次付费验证。', '付费试水与范围失控。', [], [
    choice('CS09_C1', '只接一个两周内能验收的小模块，先收 30%', '小项目可控，第一次收入也有了边界。', [['paid_micro_project', ['CS15', 'CS17', 'CS20']]], {}, { income_probe: 3 }, { runway: 3, optionality: 5, load: 4 }, { CS15: 5, CS17: 3 }),
    choice('CS09_C2', '免费帮一次，换取完整案例和推荐语', '没有收入，但可换一份公开证明。', [['free_case_for_testimonial', ['CS13', 'CS17', 'CS19']]], {}, { proof: 2 }, { runway: -1, optionality: 4, load: 3 }, { CS13: 3, CS17: 4 }),
    choice('CS09_C3', '拒绝项目，避免当前工作和学习失控', '你保住节奏，也少了一次市场反馈。', [['micro_project_declined', ['CS11', 'CS21']]], {}, { recovery: 1 }, { runway: 0, optionality: -1, load: -2 }, { CS11: 4 }),
  ]),
  node('CS10', 'cost', ['flag:course_started', 'flag:skill_gap_named', 'flag:course_terms_checked', 'flag:overloaded_trial', 'flag:tool_gap_study', 'flag:expensive_course', 'astro:fusion:M07'], '四周还没结束，你已经开始累', '白天原工作，晚上学新东西。进度不是没有，但你开始靠熬夜补时间。', '速度与可持续。', ['liang'], [
    choice('CS10_C1', '缩小学习范围，只保留会直接进入作品的一项', '压力下降，学习更贴近验证。', [['learning_scope_cut', ['CS14', 'CS19', 'CS20']]], {}, { safe_probe: 2 }, { runway: 0, optionality: 3, load: -4 }, { CS14: 3, CS19: 3 }),
    choice('CS10_C2', '继续按原计划冲完，不提前调整', '进度推进，判断力开始变钝。', [['fatigue_accumulated', ['CS18', 'CS21']], ['tired_output_sent', ['CS13']]], {}, { risky_push: 2 }, { runway: 0, optionality: 4, load: 5 }, { CS13: 3, CS18: 5 }),
    choice('CS10_C3', '暂停一周恢复，再重新排四周计划', '速度下降，但你没有把疲惫误当成失败。', [['replan_after_rest', ['CS11', 'CS13', 'CS21']]], { liang: 1 }, { recovery: 3 }, { runway: 0, optionality: -1, load: -6 }, { CS13: 3, CS11: 4, CS21: 3 }),
  ]),
  node('CS11', 'cost', ['flag:fixed_trial_calendar', 'flag:recovery_first', 'flag:micro_project_declined', 'flag:replan_after_rest', 'flag:peer_redline', 'flag:early_application', 'flag:mvp_done', 'flag:paid_micro_project', 'flag:free_case_for_testimonial', 'astro:fusion:M01'], '当前工作开始被影响', '你在原岗位还有职责。最近一次交付虽然没出大问题，但注意力被新方向分走。', '旧信用是否要为新尝试让路。', [], [
    choice('CS11_C1', '把原岗位本月关键交付列出来，只保最低质量线', '你没有失守旧信用，也释放一点时间。', [['current_role_guarded', ['CS13', 'CS16', 'CS18', 'CS19']]], {}, { internal_bridge: 2 }, { runway: 1, optionality: 2, load: -2 }, { CS13: 2, CS16: 4, CS19: 2 }),
    choice('CS11_C2', '主动谈减少低价值事务，保留转行验证时间', '边界变清楚，但公司未必完全配合。', [['current_scope_talk', ['CS13', 'CS16', 'CS18']]], {}, { internal_bridge: 3 }, { runway: 0, optionality: 3, load: 0 }, { CS13: 2, CS16: 5 }),
    choice('CS11_C3', '不调整，靠周末补两边', '短期看起来都没掉，负荷继续上升。', [['weekend_compensate', ['CS15', 'CS18', 'CS21']]], {}, { risky_push: 1 }, { runway: 0, optionality: 2, load: 5 }, { CS15: 2, CS18: 4 }),
  ]),
  node('CS12', 'cost', ['flag:silent_research', 'flag:feedback_avoided', 'flag:private_polish', 'flag:niche_switched', 'flag:life_sync_deferred', 'flag:overloaded_trial', 'astro:fusion:M07'], '你开始怀疑：是不是我根本不适合', '没有外部反馈时，转行很容易变成自我怀疑：一会儿觉得新方向太难，一会儿又觉得原工作不能再待。', '自我怀疑与真实证据。', ['cheng'], [
    choice('CS12_C1', '把怀疑拆成 3 个可验证问题，而不是人格判断', '情绪没有立刻消失，但问题变得可处理。', [['doubt_to_questions', ['CS13', 'CS21']]], {}, { recovery: 2 }, { runway: 0, optionality: 3, load: -3 }, { CS13: 4 }),
    choice('CS12_C2', '找程岚复盘一次，只带材料不求安慰', '她指出你缺的是反馈，不是“适不适合”的结论。', [['mentor_reframe', ['CS13', 'CS19']]], { cheng: 2 }, { proof: 2 }, { runway: 0, optionality: 4, load: -2 }, { CS13: 5 }),
    choice('CS12_C3', '关掉所有信息源一周，暂时不想转行', '噪音下降，路径也暂停。', [['switch_pause', ['CS21']]], {}, { recovery: 3 }, { runway: 0, optionality: -2, load: -5 }, { CS21: 5 }),
  ]),
  node('CS13', 'window', ['flag:case_rewritten', 'flag:peer_redline', 'flag:mvp_done', 'flag:free_case_for_testimonial', 'flag:doubt_to_questions', 'flag:mentor_reframe', 'flag:interview_only', 'flag:tired_output_sent', 'flag:replan_after_rest', 'flag:current_role_guarded', 'flag:current_scope_talk', 'flag:switch_pause', 'astro:fusion:M03'], '第一次外部反馈来了', '一个从业者或潜在用户看完你的材料，反馈很具体：有一部分能用，有一部分仍像外行。', '把反馈当成否定，还是当成下一版方向。', ['cheng'], [
    choice('CS13_C1', '只改最影响可信度的一项，并约二次反馈', '下一版目标清楚，外部关系也更愿意继续看。', [['second_feedback_booked', ['CS16', 'CS19']]], { cheng: 1 }, { proof: 3 }, { runway: 0, optionality: 5, load: 1 }, { CS16: 4, CS19: 3 }),
    choice('CS13_C2', '用这份反馈投 3 个入门岗位/项目，不海投', '行动变真实，拒绝也会变真实。', [['targeted_switch_apply', ['CS16', 'CS20']]], {}, { market: 3 }, { runway: 0, optionality: 6, load: 3 }, { CS16: 5, CS20: 2 }),
    choice('CS13_C3', '先把反馈收藏起来，等作品更完整再说', '材料没有冒险，也暂时没有新增证据。', [['feedback_parked', ['CS21']]], {}, { delay: 2 }, { runway: 0, optionality: 0, load: 0 }, { CS21: 4 }),
  ]),
  node('CS14', 'window', ['flag:early_application', 'flag:course_terms_checked', 'flag:learning_scope_cut', 'flag:jd_gap_map', 'astro:fusion:M05'], '一个外部窗口问：你愿不愿意从低一级开始', '顾言代表外部招聘/项目窗口，说明新方向可以给试岗、实习式项目或低一级岗位，但薪资和头衔都不如现在。', '身份成本与转行入口。', ['gu'], [
    choice('CS14_C1', '接受低一级入口，但要求职责和转正/复盘条件写清', '入口变成可评估的试转，不是盲目降级。', [['junior_entry_terms', ['CS17', 'CS20']]], { gu: 2 }, { focused: 3 }, { runway: -2, optionality: 6, load: 2 }, { CS17: 4, CS20: 4 }),
    choice('CS14_C2', '暂不接受降级，只保持信息联系并继续补作品', '你守住身份和收入，也延后进入新轨。', [['junior_entry_delayed', ['CS19', 'CS21']]], { gu: 1 }, { delay: 2 }, { runway: 0, optionality: 2, load: -1 }, { CS19: 3, CS21: 3 }),
    choice('CS14_C3', '因为降级感太强，停止看这个方向', '面子压力下降，但这次验证也提前结束。', [['identity_block', ['CS21']]], {}, { recovery: 1 }, { runway: 0, optionality: -3, load: -2 }, { CS21: 5 }),
  ]),
  node('CS15', 'window', ['flag:paid_micro_project', 'flag:mvp_done', 'flag:niche_chosen', 'flag:interview_only', 'flag:weekend_compensate', 'astro:fusion:M10'], '小项目开始变大', '对方看见你能做，开始追加需求。钱可能多一点，但范围、交付和原工作时间都开始挤压。', '市场机会与边界失控。', [], [
    choice('CS15_C1', '把追加需求拆成新合同，不混进原模块', '机会保住，边界也保住。', [['scope_split_contract', ['CS17', 'CS20']]], {}, { income_probe: 3 }, { runway: 3, optionality: 5, load: 2 }, { CS17: 4, CS20: 4 }),
    choice('CS15_C2', '接下追加需求，先把案例做漂亮', '作品可能更完整，负荷明显上升。', [['scope_creep_accepted', ['CS18', 'CS20']]], {}, { risky_push: 2 }, { runway: 2, optionality: 6, load: 6 }, { CS18: 5, CS20: 2 }),
    choice('CS15_C3', '不追加，只完成原约定并要反馈', '收益变少，但可控交付形成证据。', [['micro_project_closed_clean', ['CS17', 'CS19']]], {}, { proof: 2 }, { runway: 1, optionality: 3, load: -1 }, { CS17: 3, CS19: 3 }),
  ]),
  node('CS16', 'collision', ['flag:peer_redline', 'flag:early_application', 'flag:current_role_guarded', 'flag:current_scope_talk', 'flag:targeted_switch_apply', 'flag:second_feedback_booked', 'flag:junior_entry_delayed', 'astro:fusion:M05'], '新方向面试/交流撞上原岗位关键节点', '新方向的交流机会排在本周，而原岗位也有一个不能缺席的交付节点。', '不牺牲旧信用，也不放弃新窗口。', ['gu', 'tang'], [
    choice('CS16_C1', '提前交原岗位材料，换出一段干净时间参加交流', '两边都付出成本，但没有靠隐瞒推进。', [['clean_switch_window', ['CS19', 'CS20']]], { tang: 1 }, { focused: 3 }, { runway: 0, optionality: 5, load: 3 }, { CS19: 4, CS20: 3 }),
    choice('CS16_C2', '请外部窗口改期，说明你仍需履行现职责', '对方认可边界，但机会节奏变慢。', [['window_rescheduled_clean', ['CS19', 'CS21']]], { gu: 1 }, { safe_probe: 2 }, { runway: 0, optionality: 3, load: 0 }, { CS19: 3, CS21: 3 }),
    choice('CS16_C3', '放弃本次交流，保住原岗位节点', '旧信用稳住，新方向窗口减少。', [['switch_window_missed', ['CS21']]], {}, { delay: 2 }, { runway: 1, optionality: -2, load: -2 }, { CS21: 5 }),
  ]),
  node('CS17', 'collision', ['flag:paid_micro_project', 'flag:scope_split_contract', 'flag:micro_project_closed_clean', 'flag:free_case_for_testimonial', 'flag:junior_entry_terms', 'astro:fusion:M10'], '第一笔验证完成，但还不能替代工资', '小项目、试岗或推荐语有了结果。它证明新方向不是纯幻想，但离稳定收入还有距离。', '把一笔反馈当成功，还是当作下一步证据。', [], [
    choice('CS17_C1', '把结果整理成案例页，并标注数据和限制', '证据可复用，也不会被夸大成成功学。', [['validated_case_page', ['CS19', 'CS20']]], {}, { proof: 4 }, { runway: 0, optionality: 7, load: 2 }, { CS19: 4, CS20: 3 }),
    choice('CS17_C2', '继续接第二个同类小单，验证可复制性', '市场反馈增强，时间压力也增加。', [['second_paid_probe', ['CS20', 'CS21']]], {}, { income_probe: 3 }, { runway: 3, optionality: 5, load: 4 }, { CS20: 5 }),
    choice('CS17_C3', '停止接单，先把原工作与学习节奏稳住', '你承认验证有效，但不急着扩大。', [['probe_hold_for_stability', ['CS19', 'CS21']]], {}, { safe_probe: 2 }, { runway: 0, optionality: 2, load: -3 }, { CS19: 3, CS21: 2 }),
  ]),
  node('CS18', 'collision', ['flag:trial_guardrail', 'flag:life_sync_deferred', 'flag:expensive_course', 'flag:overloaded_trial', 'flag:fatigue_accumulated', 'flag:weekend_compensate', 'flag:scope_creep_accepted', 'flag:feedback_parked', 'flag:identity_block', 'astro:fusion:M07'], '梁澄提醒你：家里感受到你的双线压力', '你没有失控，但家里的作息和沟通已经被影响。梁澄不是要你放弃，而是要求你重新说清上限。', '坚持转行与共同生活秩序。', ['liang'], [
    choice('CS18_C1', '重新确认每周投入上限，并保留一个完整休息日', '支持回到可持续状态。', [['life_boundary_repaired', ['CS19', 'CS21']]], { liang: 2 }, { recovery: 3 }, { runway: 0, optionality: 1, load: -5 }, { CS19: 3, CS21: 3 }),
    choice('CS18_C2', '坚持四周冲刺不变，到期再调整', '决心保住，关系与身体继续承压。', [['sprint_until_deadline', ['CS20', 'CS21']]], { liang: -1 }, { risky_push: 2 }, { runway: 0, optionality: 4, load: 4 }, { CS20: 4, CS21: 3 }),
    choice('CS18_C3', '承认当前节奏不行，转为每周一次低频验证', '速度下降，但局面没有崩。', [['low_frequency_probe', ['CS19', 'CS21']]], { liang: 1 }, { safe_probe: 2 }, { runway: 0, optionality: 1, load: -4 }, { CS19: 3, CS21: 4 }),
  ]),
  node('CS19', 'landing', ['flag:case_rewritten', 'flag:mvp_done', 'flag:starter_course', 'flag:junior_entry_delayed', 'flag:micro_project_closed_clean', 'flag:clean_switch_window', 'flag:window_rescheduled_clean', 'flag:probe_hold_for_stability', 'flag:life_boundary_repaired', 'flag:low_frequency_probe', 'astro:fusion:M03'], '这次转行先落成一个低风险试验', '你已经有一些证据，但还不足以押上全部。现在要决定下一轮是继续试转、回到原轨内部迁移，还是先完成一份作品。', '不放弃，也不神化转行。', ['cheng'], [
    choice('CS19_C1', '设定 8 周试转：一份作品、三次反馈、一次收入验证', '转行变成可执行项目。', [['ending_controlled_switch_trial', ['ending_controlled_switch_trial']]], {}, { safe_probe: 6 }, { runway: 0, optionality: 8, load: 1 }),
    choice('CS19_C2', '留在原轨，但争取把职责转向目标能力', '不离开，也不原地重复。', [['ending_internal_bridge', ['ending_internal_bridge']]], {}, { internal_bridge: 6 }, { runway: 3, optionality: 5, load: -1 }),
    choice('CS19_C3', '先完成一份能公开展示的作品，再谈转行', '下一步收束为证据建设。', [['ending_proof_sprint', ['ending_proof_sprint']]], { cheng: 1 }, { proof: 6 }, { runway: 0, optionality: 6, load: 2 }),
  ]),
  node('CS20', 'landing', ['flag:skill_gap_named', 'flag:course_terms_checked', 'flag:tool_gap_study', 'flag:learning_scope_cut', 'flag:junior_entry_terms', 'flag:scope_split_contract', 'flag:second_paid_probe', 'flag:validated_case_page', 'flag:sprint_until_deadline', 'astro:fusion:M10'], '新方向可以继续，但要付出更明确的代价', '外部窗口、学习投入或小项目已经证明“不是没可能”，但要继续就必须付出薪资、职级、时间或安全垫中的一部分。', '有代价的继续。', ['gu'], [
    choice('CS20_C1', '接受低一级/试岗入口，但只承诺一个复盘周期', '你真正踏入新轨，同时留住检查点。', [['ending_junior_entry', ['ending_junior_entry']]], { gu: 1 }, { focused: 6 }, { runway: -4, optionality: 9, load: 3 }),
    choice('CS20_C2', '保留主工作，继续做可收费的低频验证', '现金底盘保住，新方向继续有反馈。', [['ending_dual_track_probe', ['ending_dual_track_probe']]], {}, { income_probe: 6 }, { runway: 2, optionality: 7, load: 2 }),
    choice('CS20_C3', '暂停扩大投入，先补最硬的一块技能缺口', '速度慢一点，但下一轮更扎实。', [['ending_skill_gap_sprint', ['ending_dual_track_probe']]], {}, { learning: 6 }, { runway: -1, optionality: 5, load: 0 }),
  ]),
  node('CS21', 'landing', ['flag:silent_research', 'flag:feedback_avoided', 'flag:private_polish', 'flag:niche_switched', 'flag:feedback_parked', 'flag:identity_block', 'flag:switch_pause', 'flag:switch_window_missed', 'flag:fatigue_accumulated', 'flag:sprint_until_deadline', 'flag:recovery_first', 'astro:fusion:M07'], '如果暂时不转，也要把它变成一个决定', '这轮转行推进并不顺利，或你发现当前不适合继续加码。暂不转行不等于失败，但需要一个下次重新打开的条件。', '延后决定与逃避决定。', ['liang'], [
    choice('CS21_C1', '延后 3 个月，只保留一个低频观察窗口', '你没有硬撑，也没有彻底关门。', [['ending_delayed_switch', ['ending_delayed_or_recovery']]], {}, { delay: 6 }, { runway: 2, optionality: 1, load: -4 }),
    choice('CS21_C2', '停止转行叙事，先修复工作、睡眠和现金秩序', '人先回到可判断状态。', [['ending_recovery_reset', ['ending_delayed_or_recovery']]], { liang: 1 }, { recovery: 6 }, { runway: 2, optionality: -1, load: -8 }),
    choice('CS21_C3', '承认目标方向不成立，重新定义下一轮探索标准', '这条路暂时关闭，但经验被留下。', [['ending_direction_reframed', ['ending_delayed_or_recovery']]], {}, { focused: 4, recovery: 2 }, { runway: 0, optionality: 2, load: -5 }),
  ]),
];

export const CAREER_SWITCH = {
  id: 'career_switch',
  title: '想转行，但担心从头开始',
  entry: 'career_switch',
  version: '0.4.2',
  initialCareerStage: 'employed',
  careerStageTitles: { employed: '仍有收入，想换赛道' },
  characters: {
    liang: { id: 'liang', name: '梁澄', identity: '同住伴侣', relationship: '现实关系人：共同核对时间、预算和生活影响' },
    tang: { id: 'tang', name: '唐微', identity: '前同事', relationship: '同侪：提供旧能力迁移和行业信息反馈' },
    gu: { id: 'gu', name: '顾言', identity: '外部窗口人', relationship: '确认课程、试岗、项目或招聘流程的书面条件' },
    cheng: { id: 'cheng', name: '程岚', identity: '行业前辈', relationship: '复盘人：基于材料指出盲点，不替你做决定' },
  },
  shareCopy: {
    ending_controlled_switch_trial: { hook: '我没有裸辞转行，只给自己开了一个 8 周试验。', insight: '真正让我动起来的不是“我要重开人生”，而是这条路终于有了停止条件。', question: '如果你想转行，会先辞职，还是先给自己做一次低风险试验？' },
    ending_internal_bridge: { hook: '我以为转行只能重开，结果发现可以先在原轨里换方向。', insight: '有些转行不是换公司，而是先把自己每天做的事换掉一部分。', question: '如果原工作还能长出新能力，你会先留下试试吗？' },
    ending_proof_sprint: { hook: '我暂时没转行，因为我先欠新行业一份能看的作品。', insight: '焦虑最喜欢问“我适不适合”，但市场只会回答“你这份东西够不够用”。', question: '换成你，会先补作品，还是先去投简历试水？' },
    ending_junior_entry: { hook: '我接受从低一级开始，但没有把自己交给一句“以后会好”。', insight: '从头开始最可怕的不是降级，而是降级以后仍然没有评估标准。', question: '如果能换到想去的方向，你能接受短期低一级吗？' },
    ending_dual_track_probe: { hook: '我没有急着转行，只让新方向先赚到一次真实反馈。', insight: '副线不是退路，它更像一次现实测谎：有人愿不愿意为这件事付费。', question: '如果一个新方向还不能养活你，你会不会先让它低频跑起来？' },
    ending_delayed_or_recovery: { hook: '我这次没有转行，不是认输，是先把自己从混乱里捞回来。', insight: '状态很差的时候做大决定，常常是在让疲惫替自己选路。', question: '你会在很累的时候硬转方向，还是先把判断力养回来？' },
  },
  nodes: N,
  stages: [
    { id: 'facts', order: 1, candidates: ['CS01', 'CS02', 'CS03'], profileDriven: true },
    { id: 'verify', order: 2, candidates: ['CS04', 'CS05', 'CS06'], profileDriven: false },
    { id: 'proof', order: 3, candidates: ['CS07', 'CS08', 'CS09'], profileDriven: false },
    { id: 'cost', order: 4, candidates: ['CS10', 'CS11', 'CS12'], profileDriven: true },
    { id: 'window', order: 5, candidates: ['CS13', 'CS14', 'CS15'], profileDriven: false },
    { id: 'collision', order: 6, candidates: ['CS16', 'CS17', 'CS18'], profileDriven: true },
    { id: 'landing', order: 7, candidates: ['CS19', 'CS20', 'CS21'], profileDriven: false },
  ],
  endings: [
    { id: 'ending_controlled_switch_trial', match: { anyTags: ['flag:ending_controlled_switch_trial'] }, routeWeights: { safe_probe: 6 }, summary: { title: '低风险试转', core: '你没有把转行变成一次豪赌，而是把它拆成 8 周可验证的试验。', gain: '作品、反馈、一次收入或入口验证。', cost: '速度不会很快，也需要忍受“不确定但继续做”的阶段。', alternativeHint: '如果试验期没有真实反馈，先回到作品证据，而不是继续加码。', qualityVariants: [{ when: { flags: ['life_boundary_repaired'] }, text: '你还把生活上限重新说清，试验更容易持续。' }] }, action: { instruction: '写下 8 周内唯一主作品、三位反馈对象和一次收入验证方式。' } },
    { id: 'ending_internal_bridge', match: { anyTags: ['flag:ending_internal_bridge'] }, routeWeights: { internal_bridge: 6 }, summary: { title: '留在原轨内迁移', core: '你暂时不离开，但开始把现岗位职责往目标能力靠。', gain: '收入连续性和更低风险的能力迁移。', cost: '环境没有彻底变化，仍要防止原工作吞掉所有时间。', alternativeHint: '如果原岗位无法给出新能力空间，再打开外部试转会更有依据。', qualityVariants: [{ when: { flags: ['current_role_guarded'] }, text: '你先守住旧信用，再争取能力迁移。' }] }, action: { instruction: '和当前岗位确认一个能积累目标能力的职责或项目。' } },
    { id: 'ending_proof_sprint', match: { anyTags: ['flag:ending_proof_sprint'] }, routeWeights: { proof: 6 }, summary: { title: '先补作品证据', core: '这一轮最缺的不是勇气，而是一份能被新行业看懂的证据。', gain: '更清楚的作品方向和下一次沟通材料。', cost: '短期没有身份变化，也可能继续面对原岗位消耗。', alternativeHint: '如果作品已经能换来真实反馈，下一轮可以转向低风险试转。', qualityVariants: [{ when: { flags: ['peer_redline'] }, text: '你让唐微指出最痛的地方，作品方向更清楚。' }] }, action: { instruction: '两周内完成 v1，并找一个真实从业者反馈。' } },
    { id: 'ending_junior_entry', match: { anyTags: ['flag:ending_junior_entry'] }, routeWeights: { focused: 6 }, summary: { title: '接受低一级入口', core: '你愿意为换赛道承担身份成本，但把试岗或复盘条件先写清。', gain: '真正进入新轨的机会。', cost: '薪资、头衔或熟练感会短期下降。', alternativeHint: '如果低一级入口没有评价标准，先补作品证据比盲目进入更稳。', qualityVariants: [{ when: { flags: ['junior_entry_terms'] }, text: '你没有只听“以后会好”，而是先问清复盘条件。' }] }, action: { instruction: '只承诺一个复盘周期，写清职责、评价标准和退出条件。' } },
    { id: 'ending_dual_track_probe', match: { anyTags: ['flag:ending_dual_track_probe', 'flag:ending_skill_gap_sprint'] }, routeWeights: { income_probe: 6, learning: 4 }, summary: { title: '主业保底，副线验证', core: '你保留原工作的底盘，让新方向先通过小项目、低频服务或技能补齐证明自己。', gain: '现金安全和市场反馈并存。', cost: '必须严守工时、合规和恢复边界。', alternativeHint: '如果副线连续两次无法复制，先缩回作品或技能缺口。', qualityVariants: [{ when: { flags: ['scope_split_contract'] }, text: '你把追加需求拆成新合同，没有让边界失控。' }] }, action: { instruction: '固定每周投入上限，并定义第二笔验证的最低条件。' } },
    { id: 'ending_delayed_or_recovery', match: { anyTags: ['flag:ending_delayed_switch', 'flag:ending_recovery_reset', 'flag:ending_direction_reframed'] }, routeWeights: { delay: 6, recovery: 6 }, summary: { title: '延后转行 / 恢复重整', core: '这轮暂时不适合继续加码，你把延后变成有条件的决定。', gain: '睡眠、现金和判断力先回到可用状态。', cost: '窗口会变少，下一次重新打开必须有触发条件。', alternativeHint: '三个月后按作品、预算、时间或反馈重开，不靠情绪重开。', qualityVariants: [{ when: { flags: ['switch_pause'] }, text: '你暂停的不是可能性，而是把噪音先关掉。' }] }, action: { instruction: '写下三个月后重新评估的条件：作品、预算、时间或反馈。' } },
  ],
};
