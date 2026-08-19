// 《手里有两个机会，怎么选》：两份书面机会在开局已经存在；命理只决定
// 这一幕优先看安全、边界或成长，绝不制造任何 Offer。
const flag = (id, consumeBy) => ({ id, value: true, consumeBy });
const life = (work) => ({ pressure: Math.round((work.load || 0) * 0.7), opportunity: Math.round((work.optionality || 0) * 0.8), relationship: Math.round((work.load || 0) * -0.15), stability: Math.round((work.runway || 0) * 0.65), resources: Math.round((work.runway || 0) * 0.7), wellbeing: Math.round((work.load || 0) * -0.7) });
const choice = (id, label, immediate, flags, relations, routes, work, nextWeights = {}, careerStageEffect = null) => ({ id, label, immediate, delayedFlags: flags.map(([key, consumeBy]) => flag(key, consumeBy)), relationEffects: relations, routeSignals: routes, stateEffects: { work, life: life(work) }, nextWeights, careerStageEffect });
const RULE = { M01: 'M01_cash_anchor', M02: 'M02_role_contract', M03: 'M03_proof_before_title', M05: 'M05_external_move', M07: 'M07_rest_then_decide', M10: 'M10_income_dual_track', M12: 'M12_support_and_reference' };
const TRANSITIONS = {
  OC01: '两份书面 Offer 同时摆在桌上，答复日只相差四天。', OC02: '你把两份职位描述逐项摊开，发现“成长”写得都很像。', OC03: '梁澄问起接下来三个月的作息和城市安排。',
  OC04: '顾言补来了 A 岗位的书面职责与汇报线。', OC05: '唐微从 B 团队带回了她能核实的工作节奏。', OC06: '程岚看完你的对照表，只圈出了两项还没证据的假设。',
  OC07: '两边都知道你在答复期内，先后问起你的决定节奏。', OC08: '你开始把入职后的前九十天写进日历，成本也变得具体。', OC09: '一条关于发展空间的信息需要再核实，不能只靠想象。',
  OC10: 'A 的负责人愿意用二十分钟把首季目标说清楚。', OC11: 'B 的合同附件里出现了一条此前没被解释的条款。', OC12: '答复期过半，梁澄提醒你不要把生活安排留到最后一天。',
  OC13: '程岚把你的比较从“哪个更好”改成“哪个风险可承受”。', OC14: '唐微确认了 B 团队的一项真实变化，也说明它尚未写进合同。', OC15: '顾言回复：A 可以讨论边界，但不能无限延长答复。',
  OC16: '两个窗口都进入最后两天，剩下的是不能同时保留的条件。', OC17: '其中一方给出最终书面回复，另一方仍在等待。', OC18: '你需要把决定告诉梁澄，并把第一周安排落实。',
  OC19: '接受 A 前，最后一次核对落在职责、支持和日期上。', OC20: '接受 B 前，最后一次核对落在合同、协作和日期上。', OC21: '如果两份都不接，四周内的下一步也必须落到计划。',
};
const VARIANTS = {
  OC04: [{ id: 'oc04-terms-echo', priority: 4, when: { flags: ['terms_table'] }, copyPatch: { transition: '你已经把条款列成表，顾言补来了 A 岗位能写进邮件的职责与汇报线。' } }],
  OC05: [{ id: 'oc05-question-echo', priority: 4, when: { flags: ['first_90_questions'] }, copyPatch: { situation: '你带着同一份首 90 天问题向唐微核实 B 的节奏。她只能讲亲历的协作方式，不能代表公司承诺岗位条件。' } }],
  OC06: [{ id: 'oc06-path-echo', priority: 4, when: { flags: ['path_criteria'] }, copyPatch: { transition: '你先写下想积累的能力后，程岚圈出了仍缺证据的那一项。' } }],
  OC08: [{ id: 'oc08-life-echo', priority: 4, when: { flags: ['life_constraints'] }, copyPatch: { transition: '你和梁澄已经列出生活最低条件，首 90 天的代价也比想象具体。' } }],
  OC10: [{ id: 'oc10-a-echo', priority: 4, when: { flags: ['a_terms_written'] }, copyPatch: { situation: 'A 已把部分职责写进邮件；现在仍要确认首季目标是否有可执行的验收标准。' } }],
  OC11: [{ id: 'oc11-b-echo', priority: 4, when: { flags: ['b_team_evidence'] }, copyPatch: { transition: '唐微提供过真实团队样本后，B 的附件里有一项需要解释。' } }],
  OC12: [{ id: 'oc12-plan-echo', priority: 4, when: { flags: ['life_constraints'] }, copyPatch: { situation: '生活最低条件已经说清；梁澄现在需要知道它们会怎样进入最终安排，而不是替你选 Offer。' } }],
  OC13: [{ id: 'oc13-counter-echo', priority: 4, when: { flags: ['counter_evidence'] }, copyPatch: { transition: '你主动找过反证后，程岚把比较从“哪个更好”改成“哪个风险可承受”。' } }],
  OC14: [{ id: 'oc14-clause-echo', priority: 4, when: { flags: ['b_clause_asked'] }, copyPatch: { situation: '你已经请 B 方解释附件条款；唐微确认的团队变化仍需区分“真实信息”和“可写进合同的条件”。' } }],
  OC15: [{ id: 'oc15-a-boundary-echo', priority: 4, when: { flags: ['a_success_metric'] }, copyPatch: { transition: 'A 已回应你写下的验收标准，顾言说明最后还能确认哪些边界。' } }],
  OC16: [{ id: 'oc16-criteria-echo', priority: 5, when: { flags: ['nonnegotiables_set'] }, copyPatch: { situation: '你已写下不可妥协条件。最后两天不是继续找完美答案，而是按这些条件做一次可解释的取舍。' } }],
  OC17: [{ id: 'oc17-final-echo', priority: 4, when: { flags: ['a_final_ask'] }, copyPatch: { transition: 'A 对最后协商条件给出书面回复，另一份 Offer 的答复期也在结束。' } }],
  OC18: [{ id: 'oc18-life-echo', priority: 4, when: { flags: ['life_constraints'] }, copyPatch: { situation: '你已写下生活最低条件。梁澄帮你核对 A、B 或暂不接受各自的落地成本，但不会替你做职业决定。' } }],
  OC19: [{ id: 'oc19-buffer-echo', priority: 4, when: { flags: ['landing_buffered'] }, copyPatch: { transition: '接受 A 前，你已为第一周留出缓冲；最后核对落在职责、支持和日期上。' } }],
  OC20: [{ id: 'oc20-b-boundary-echo', priority: 4, when: { flags: ['b_change_written'] }, copyPatch: { transition: 'B 的关键变化已经得到书面确认，最后核对落在合同、协作和日期上。' } }],
  OC21: [{ id: 'oc21-reset-echo', priority: 4, when: { flags: ['reset_plan'] }, copyPatch: { situation: '你已和梁澄确认四周现金与求职安排；拒绝不是等待奇迹，下一步需要按范围和日期执行。' } }],
};
// 只在第 1 / 4 / 6 幕把命盘排序映射为候选焦点；事实门槛仍由 flags 决定。
const FOCUS = {
  OC01: ['safety', 'negotiation'], OC02: ['opportunity', 'transition'], OC03: ['recovery'],
  OC10: ['negotiation'], OC11: ['safety', 'opportunity'], OC12: ['recovery'],
  OC16: ['negotiation', 'recovery'], OC17: ['safety', 'opportunity'], OC18: ['transition'],
};
const node = (id, stage, anyTags, title, situation, conflict, roles, choices, requirements = {}) => ({
  // 后续事实会影响权重、回响与结局；每一幕保留三个可发生的候选，避免某个
  // 合理的早期选择把下一幕锁死。
  id, stage, match: { anyTags, allTags: ['entry:offer_choice'], minScore: 0, careerStages: ['offer_pending'], focus: FOCUS[id] || [], ...requirements }, roles,
  copy: { transition: TRANSITIONS[id], title, situation, conflict }, variants: VARIANTS[id] || [],
  evidenceSlots: [{ id: 'why_this', requiredLayers: ['bazi', 'ziwei', 'period'], ruleIds: [...new Set(anyTags.filter((tag) => tag.startsWith('astro:fusion:')).map((tag) => RULE[tag.slice(-3)]).filter(Boolean))], fallbackTemplateId: 'evidence_partial_work' }], choices, shareable: true, riskTags: ['career'],
});

const N = [
  node('OC01', 'facts', ['astro:fusion:M01', 'astro:fusion:M02'], '两份有效 Offer，答复期只差四天', 'A 是职责更清晰、固定报酬较稳的岗位；B 的总报酬或发展方向更吸引你，但有一项关键条件仍待确认。两份均为真实书面 Offer，答复期相近。', '先按安全和条款比较，还是先按长期路径比较。', ['gu'], [
    choice('OC01_C1', '先列出固定收入、试用期、入职日和退出成本', '比较从感觉变成可核实的条款表。', [['terms_table', ['OC04', 'OC08', 'OC13']]], {}, { safety: 3 }, { runway: 3, optionality: 1, load: 1 }, { OC04: 5, OC08: 4 }),
    choice('OC01_C2', '先写下未来两年想积累的能力与平台', '你有了判断方向，也暂时搁置了细节。', [['path_criteria', ['OC06', 'OC09', 'OC13']]], {}, { growth: 3 }, { runway: 0, optionality: 4, load: 1 }, { OC06: 5 }),
    choice('OC01_C3', '先分别回复两边：会在明确日期前给答复', '两边都知道节奏，等待压力没有消失。', [['reply_timeline', ['OC07', 'OC16']]], { gu: 1 }, { boundary: 2 }, { runway: 0, optionality: 2, load: -1 }, { OC07: 5 }),
  ]),
  node('OC02', 'facts', ['astro:fusion:M03', 'astro:fusion:M05'], '“成长空间”要翻译成具体工作', 'A 强调规范流程和稳定负责人；B 强调更大范围和新方向。两边都没有承诺未来晋升，你只能比较当下可承担的职责与可获得的证据。', '先问职责证据，还是先看环境与路径。', ['cheng'], [
    choice('OC02_C1', '分别写出首 90 天要交付什么、由谁验收', '模糊的成长被拆成了可问的问题。', [['first_90_questions', ['OC04', 'OC05', 'OC10']]], {}, { boundary: 3 }, { runway: 0, optionality: 3, load: 1 }, { OC04: 4, OC05: 4 }),
    choice('OC02_C2', '请程岚用你已有经历校准两条路径的可迁移性', '程岚指出：平台名称不能替代实际作品与责任。', [['transferable_review', ['OC06', 'OC13']]], { cheng: 2 }, { growth: 2 }, { runway: 0, optionality: 4, load: 1 }, { OC06: 5 }),
    choice('OC02_C3', '先按直觉把其中一份排在前面，再找反证', '你有了暂定优先级，也更需要防止确认偏误。', [['provisional_preference', ['OC09', 'OC13']]], {}, { growth: 1 }, { runway: 0, optionality: 2, load: 0 }, { OC09: 5 }),
  ]),
  node('OC03', 'facts', ['astro:fusion:M07', 'astro:fusion:M12'], '生活安排也在参与这次选择', '梁澄不会替你选工作，但两份 Offer 的通勤、出差或作息差异会改变共同生活安排。你们需要说清可接受的压力和支持方式。', '把生活条件纳入比较，还是把它留到决定以后。', ['liang'], [
    choice('OC03_C1', '一起列出通勤、照顾和恢复时间的最低条件', '支持变成清单，而不是一句“你自己决定”。', [['life_constraints', ['OC08', 'OC12', 'OC18']]], { liang: 2 }, { safety: 2 }, { runway: 0, optionality: 1, load: -2 }, { OC08: 5 }),
    choice('OC03_C2', '说明你会自行决定，但约定决定后立刻同步安排', '自主边界被尊重，细节仍要自己补齐。', [['autonomy_stated', ['OC12', 'OC18']]], { liang: 1 }, { boundary: 2 }, { runway: 0, optionality: 1, load: 0 }, { OC12: 4 }),
    choice('OC03_C3', '暂时不谈生活变化，先把工作条件问清', '讨论被推后，答复日仍在靠近。', [['life_deferred', ['OC12', 'OC16']]], { liang: -1 }, { growth: 1 }, { runway: 0, optionality: 2, load: 2 }, { OC16: 3 }),
  ]),
  node('OC04', 'verify', ['flag:terms_table', 'flag:first_90_questions', 'astro:fusion:M02'], 'A 的职责可以写清到什么程度', '顾言代表 A 方说明汇报线、首季目标和试用期安排。她能确认写进邮件的内容，不能替未来团队许诺未批准的资源。', '拿到书面边界，还是用速度换确定感。', ['gu'], [
    choice('OC04_C1', '请顾言确认首季目标、协作人和复盘日期', 'A 的关键责任有了可对照的文字。', [['a_terms_written', ['OC10', 'OC15', 'OC19']]], { gu: 2 }, { option_a: 3, boundary: 2 }, { runway: 2, optionality: 3, load: -1 }, { OC10: 5 }),
    choice('OC04_C2', '只确认入职日和报酬，其他入职后再谈', '流程更快，但一项职责仍留在口头层面。', [['a_fast_accept', ['OC16', 'OC19']]], { gu: 1 }, { option_a: 2 }, { runway: 4, optionality: 1, load: 1 }, { OC19: 3 }),
    choice('OC04_C3', '请一天时间核对材料，再给具体问题', '顾言同意等待，但答复期没有变长。', [['a_review_day', ['OC15', 'OC16']]], {}, { boundary: 2 }, { runway: 0, optionality: 2, load: 0 }, { OC15: 4 }),
  ]),
  node('OC05', 'verify', ['flag:terms_table', 'flag:first_90_questions', 'astro:fusion:M10'], 'B 的实际节奏从同侪口中浮出来', '唐微在 B 团队工作过，能讲清最近的协作方式和项目节奏，却不能代表公司承诺岗位或替你谈条件。', '把内部信息当作一份证据，还是只听职位描述。', ['tang'], [
    choice('OC05_C1', '请唐微按“职责、资源、最忙时段”讲具体例子', '你得到可比较的工作样本，也知道它可能随团队变化。', [['b_team_evidence', ['OC11', 'OC14', 'OC20']]], { tang: 2 }, { option_b: 3, growth: 1 }, { runway: 0, optionality: 4, load: 1 }, { OC11: 5 }),
    choice('OC05_C2', '只问她会不会推荐加入，保留自己的判断', '她给出谨慎肯定，但细节仍不够。', [['b_soft_reference', ['OC14', 'OC20']]], { tang: 1 }, { option_b: 2 }, { runway: 0, optionality: 2, load: 0 }, { OC14: 3 }),
    choice('OC05_C3', '不再追问内部信息，等公司书面回复', '边界更干净，比较材料也少了一层。', [['b_info_limited', ['OC11', 'OC16']]], {}, { boundary: 1 }, { runway: 0, optionality: -1, load: -1 }, { OC11: 3 }),
  ]),
  node('OC06', 'verify', ['flag:path_criteria', 'flag:transferable_review', 'astro:fusion:M03'], '程岚指出：路径判断还缺一块证据', '程岚只依据你的经历和现有材料复盘：你需要知道哪份岗位能让你形成可迁移的成果，而不是被头衔或想象中的未来说服。', '补实证，还是接受不可完全确定。', ['cheng'], [
    choice('OC06_C1', '选一个关键假设，分别向两边提出同一问题', '两份机会终于可以在同一尺度上比较。', [['same_question_sent', ['OC10', 'OC11', 'OC13']]], { cheng: 2 }, { growth: 3 }, { runway: 0, optionality: 4, load: 1 }, { OC10: 3, OC11: 3 }),
    choice('OC06_C2', '把路径拆成一年内可见成果与不可控想象', '你看见了哪部分是自己能主动积累的。', [['path_split', ['OC13', 'OC21']]], { cheng: 1 }, { growth: 2, reset: 1 }, { runway: 0, optionality: 3, load: -1 }, { OC13: 5 }),
    choice('OC06_C3', '不再加问题，优先选择此刻更有吸引力的一份', '决策速度提高，盲点也由自己承担。', [['intuition_priority', ['OC16', 'OC20']]], {}, { option_b: 1 }, { runway: 0, optionality: 1, load: 0 }, { OC16: 3 }),
  ]),
  node('OC07', 'compare', ['flag:reply_timeline', 'astro:fusion:M01'], '答复期内，两边都在等', 'A 和 B 都要求在本周内得到明确答复；你可以提一个有限的问题或协商短暂延后，但不能暗示已经接受任何一方。', '争取必要时间，还是先锁定一边。', ['gu'], [
    choice('OC07_C1', '向两边说明需要到同一日期完成核对', '节奏更公平，但其中一方只给了有限等待。', [['aligned_deadline', ['OC16', 'OC17']]], { gu: 1 }, { boundary: 3 }, { runway: 0, optionality: 2, load: 1 }, { OC16: 5 }),
    choice('OC07_C2', '先口头倾向 A，同时保留 B 的问题清单', 'A 感到被重视，B 仍在等待正式答复。', [['a_preferred', ['OC15', 'OC19']]], { gu: 1 }, { option_a: 3 }, { runway: 1, optionality: 1, load: 1 }, { OC19: 4 }),
    choice('OC07_C3', '先口头倾向 B，同时约 A 的最后沟通', 'B 得到积极信号，但你尚未作出承诺。', [['b_preferred', ['OC14', 'OC20']]], {}, { option_b: 3 }, { runway: 0, optionality: 2, load: 1 }, { OC20: 4 }),
  ]),
  node('OC08', 'compare', ['flag:life_constraints', 'flag:terms_table', 'astro:fusion:M07'], '首 90 天的代价比想象具体', '把作息、通勤和试用期放进日历后，你发现两份 Offer 都有代价：一份更稳定但空间较窄，另一份更有延展但高峰期更密。', '选可恢复的压力，还是承受更高的不确定性。', ['liang'], [
    choice('OC08_C1', '把恢复时间写成接受 A 的前提之一', 'A 的稳定性有了明确的生活边界。', [['a_life_boundary', ['OC15', 'OC19']]], { liang: 2 }, { option_a: 2, safety: 2 }, { runway: 2, optionality: 1, load: -3 }, { OC19: 5 }),
    choice('OC08_C2', '接受 B 的高峰期，但约定四周后复盘安排', '你选择了增长压力，也给自己留了检查点。', [['b_load_plan', ['OC14', 'OC20']]], { liang: 1 }, { option_b: 2, growth: 2 }, { runway: 0, optionality: 4, load: 4 }, { OC20: 5 }),
    choice('OC08_C3', '发现两边都不合适，先保留拒绝的可能', '不急着把不匹配说成自己的问题。', [['decline_open', ['OC16', 'OC21']]], { liang: 1 }, { reset: 2 }, { runway: -1, optionality: 1, load: -1 }, { OC21: 4 }),
  ]),
  node('OC09', 'compare', ['flag:provisional_preference', 'flag:path_criteria', 'astro:fusion:M05'], '一条关键信息需要反证', '你偏向的一方看起来更贴近长期路径，但一项关于团队变化或工作地点的消息尚未核实。不能把不确定信息当成承诺。', '补反证，还是按当前证据决定。', ['tang'], [
    choice('OC09_C1', '列出会推翻你偏好的条件，并逐项核实', '偏好没有被否定，但变得更经得起比较。', [['counter_evidence', ['OC13', 'OC14', 'OC16']]], { tang: 1 }, { boundary: 2, growth: 1 }, { runway: 0, optionality: 3, load: 1 }, { OC13: 4 }),
    choice('OC09_C2', '只核实工作地点和到岗方式这一个硬条件', '迁移成本得到答案，其余仍需自行判断。', [['location_checked', ['OC16', 'OC20']]], {}, { option_b: 1, safety: 1 }, { runway: 1, optionality: 1, load: 0 }, { OC20: 3 }),
    choice('OC09_C3', '不再继续收集，按现有优先级推进', '信息输入停止，决定压力转为执行压力。', [['research_closed', ['OC16', 'OC19']]], {}, { option_a: 1 }, { runway: 0, optionality: -1, load: -1 }, { OC19: 3 }),
  ]),
  node('OC10', 'cost', ['flag:a_terms_written', 'flag:same_question_sent', 'astro:fusion:M02'], 'A 的首季目标可以被谈清', 'A 的负责人愿意说明第一季的目标、支持和复盘方式。你可以把最重要的一项边界写下来，也可以接受当前说法换取更快落定。', '书面边界与决策速度。', ['gu'], [
    choice('OC10_C1', '要求把最关键的验收标准写进邮件', 'A 的风险下降，但负责人需要内部确认。', [['a_success_metric', ['OC15', 'OC19']]], { gu: 2 }, { option_a: 3, boundary: 2 }, { runway: 1, optionality: 3, load: -1 }, { OC19: 6 }),
    choice('OC10_C2', '接受口头说明，保留入职后复盘', '关系顺畅，关键标准仍会在执行中解释。', [['a_verbal_terms', ['OC16', 'OC19']]], { gu: 1 }, { option_a: 2 }, { runway: 2, optionality: 1, load: 1 }, { OC19: 3 }),
    choice('OC10_C3', '说明这项不清楚就无法接受', 'A 尊重你的边界，也可能转向其他候选人。', [['a_boundary_firm', ['OC17', 'OC21']]], { gu: -1 }, { boundary: 3, reset: 1 }, { runway: -1, optionality: 0, load: 0 }, { OC21: 3 }),
  ]),
  node('OC11', 'cost', ['flag:b_team_evidence', 'flag:same_question_sent', 'astro:fusion:M10'], 'B 的附件里有一项需要解释', 'B 的合同或岗位附件出现了高峰期安排、竞业限制或职责范围中的一项模糊表述。它不自动意味着不好，但必须在接受前被解释。', '核对边界，还是把风险留给以后。', ['tang'], [
    choice('OC11_C1', '请 B 方书面解释该条款的实际执行方式', '对方愿意回复，答复日也更紧。', [['b_clause_asked', ['OC14', 'OC17', 'OC20']]], {}, { option_b: 2, boundary: 2 }, { runway: 0, optionality: 3, load: 1 }, { OC20: 5 }),
    choice('OC11_C2', '接受条款，但把它纳入自己的负荷预案', '你保住窗口，也要承担高峰期的真实成本。', [['b_clause_accepted', ['OC16', 'OC20']]], {}, { option_b: 2 }, { runway: 1, optionality: 2, load: 4 }, { OC20: 4 }),
    choice('OC11_C3', '说明条款无法接受，保留礼貌退出', 'B 的可能性变窄，判断更干净。', [['b_clause_boundary', ['OC17', 'OC21']]], {}, { reset: 2, boundary: 2 }, { runway: 0, optionality: -1, load: -1 }, { OC21: 4 }),
  ]),
  node('OC12', 'cost', ['flag:life_constraints', 'flag:autonomy_stated', 'flag:life_deferred', 'astro:fusion:M12'], '决定不只是回一封邮件', '答复期过半，梁澄希望知道接下来几周的共同安排。支持可以减少落地摩擦，但不应变成替你决定哪份工作。', '共同准备，还是独自消化变化。', ['liang'], [
    choice('OC12_C1', '约定接受后第一周的分工和恢复时间', '无论选哪边，生活切换不再完全临时发生。', [['transition_plan', ['OC18', 'OC19', 'OC20']]], { liang: 2 }, { safety: 2 }, { runway: 0, optionality: 1, load: -3 }, { OC18: 5 }),
    choice('OC12_C2', '只同步已确定的信息，其他等签约后再说', '你保留空间，梁澄也需要自己安排。', [['limited_sync', ['OC18', 'OC16']]], { liang: 0 }, { boundary: 1 }, { runway: 0, optionality: 1, load: 0 }, { OC18: 3 }),
    choice('OC12_C3', '把决定压力先扛住，暂时不讨论安排', '谈话停住了，疲惫却没有消失。', [['support_delayed', ['OC16', 'OC21']]], { liang: -1 }, { reset: 1 }, { runway: 0, optionality: 0, load: 3 }, { OC21: 3 }),
  ]),
  node('OC13', 'window', ['flag:terms_table', 'flag:path_split', 'flag:counter_evidence', 'astro:fusion:M03'], '“更好”要改成“更适合此刻”', '程岚根据已有条款、能力路径和你的现实约束复盘：没有无代价的最优解，只有哪种风险在当前阶段更可承受。', '用准则收束，还是继续追求完美信息。', ['cheng'], [
    choice('OC13_C1', '明确三项不可妥协条件，条件满足的一方优先', '判断标准收紧，结果不一定迎合最初偏好。', [['nonnegotiables_set', ['OC16', 'OC17', 'OC19']]], { cheng: 2 }, { boundary: 3, safety: 1 }, { runway: 1, optionality: 2, load: -2 }, { OC16: 5 }),
    choice('OC13_C2', '按一年内可迁移成果排序两份机会', '成长判断更具体，但短期收入差异仍要自己承担。', [['growth_ranked', ['OC16', 'OC20']]], { cheng: 1 }, { growth: 3, option_b: 1 }, { runway: 0, optionality: 4, load: 1 }, { OC20: 4 }),
    choice('OC13_C3', '承认信息不全，设定停止研究的具体时间', '你给比较划了止损线，剩余不确定要由行动承担。', [['research_deadline', ['OC16', 'OC21']]], {}, { boundary: 2, reset: 1 }, { runway: 0, optionality: 1, load: -1 }, { OC16: 3 }),
  ]),
  node('OC14', 'window', ['flag:b_team_evidence', 'flag:b_soft_reference', 'flag:b_clause_asked', 'astro:fusion:M05'], 'B 的窗口给出一份新信息', '唐微确认 B 团队的真实变化，并提醒其中部分尚未写进合同。你可以要求公司确认、接受不确定性，或把这条信息当作退出依据。', '用可写下的条件决定，还是接受环境变量。', ['tang'], [
    choice('OC14_C1', '请 B 方确认会影响职责的那一项变化', 'B 的书面回复让判断更扎实。', [['b_change_written', ['OC17', 'OC20']]], { tang: 1 }, { option_b: 3, boundary: 2 }, { runway: 1, optionality: 3, load: 0 }, { OC20: 6 }),
    choice('OC14_C2', '接受变化，把四周复盘作为自己的检查点', '你获得窗口，也保留一次主动校准。', [['b_change_accepted', ['OC18', 'OC20']]], {}, { option_b: 2, growth: 2 }, { runway: 0, optionality: 3, load: 2 }, { OC20: 4 }),
    choice('OC14_C3', '因信息无法确认而降低 B 的优先级', '比较更简单，但你放弃了一部分上行可能。', [['b_deprioritized', ['OC16', 'OC19']]], { tang: 0 }, { option_a: 2, safety: 1 }, { runway: 0, optionality: -1, load: -1 }, { OC19: 4 }),
  ]),
  node('OC15', 'window', ['flag:a_terms_written', 'flag:a_review_day', 'flag:a_preferred', 'astro:fusion:M02'], 'A 能给的边界到了最后一轮', '顾言说明 A 可以确认哪些职责、支持或入职安排；未获批准的承诺仍不能写进 Offer。答复期限也不能无限延长。', '接受可核实条件，还是继续守住底线。', ['gu'], [
    choice('OC15_C1', '在关键条件写清后，准备接受 A', 'A 的路径变得可执行，B 将收到明确答复。', [['a_ready', ['OC16', 'OC19']]], { gu: 2 }, { option_a: 4, safety: 2 }, { runway: 4, optionality: 2, load: -1 }, { OC19: 7 }),
    choice('OC15_C2', '提出一个最后的可协商条件，再决定', '顾言愿意回复，但不会替你保留不确定的名额。', [['a_final_ask', ['OC17', 'OC19']]], { gu: 1 }, { option_a: 2, boundary: 2 }, { runway: 1, optionality: 2, load: 1 }, { OC19: 5 }),
    choice('OC15_C3', '关键条件未满足，准备放弃 A', '你失去一条稳定线，也不再需要自我说服。', [['a_declined_ready', ['OC17', 'OC20', 'OC21']]], { gu: -1 }, { option_b: 1, reset: 1 }, { runway: -2, optionality: 0, load: -1 }, { OC20: 3 }),
  ]),
  node('OC16', 'collision', ['flag:aligned_deadline', 'flag:decline_open', 'flag:counter_evidence', 'flag:nonnegotiables_set', 'flag:research_deadline', 'astro:fusion:M07'], '最后两天：不能同时保留的条件', '两个答复窗口进入最后两天。此刻不选也会形成结果；你要在真实条款、生活约束和未来路径间做一次可解释的取舍。', '明确接受、有限协商，或两边都不接。', ['liang', 'cheng'], [
    choice('OC16_C1', '按已写下的不可妥协条件选择 A', '你停止比较，把注意力转向入职前的落实。', [['choose_a', ['OC18', 'OC19']]], { liang: 1 }, { option_a: 5, safety: 2 }, { runway: 4, optionality: 1, load: -1 }, { OC19: 8 }),
    choice('OC16_C2', '按成长与可承受风险选择 B', '你停止比较，把注意力转向合同和切换安排。', [['choose_b', ['OC18', 'OC20']]], { liang: 1 }, { option_b: 5, growth: 2 }, { runway: 1, optionality: 5, load: 2 }, { OC20: 8 }),
    choice('OC16_C3', '两份都不接受，保留四周重新校准', '窗口关闭，但你没有用不匹配换短暂安心。', [['choose_neither', ['OC18', 'OC21']]], { liang: 1 }, { reset: 5 }, { runway: -4, optionality: 1, load: -2 }, { OC21: 8 }),
  ]),
  node('OC17', 'collision', ['flag:aligned_deadline', 'flag:a_final_ask', 'flag:b_clause_asked', 'flag:b_change_written', 'astro:fusion:M01'], '一方给出最终书面回复', '最后一项条件有了书面回复，另一份 Offer 的答复期也在结束。你可以据此确认一方、婉拒一方，或承认两边都不满足底线。', '让书面条件落地，而不是继续悬着。', ['gu'], [
    choice('OC17_C1', '确认满足底线的 A，并当日婉拒 B', 'A 的决定落定，B 得到清楚回复。', [['a_confirmed', ['OC18', 'OC19']]], { gu: 2 }, { option_a: 5, boundary: 2 }, { runway: 5, optionality: 1, load: -1 }, { OC19: 8 }, 'preboarding'),
    choice('OC17_C2', '确认满足底线的 B，并当日婉拒 A', 'B 的决定落定，A 得到清楚回复。', [['b_confirmed', ['OC18', 'OC20']]], { gu: 0 }, { option_b: 5, growth: 2 }, { runway: 2, optionality: 5, load: 1 }, { OC20: 8 }, 'preboarding'),
    choice('OC17_C3', '因关键条件仍不清楚，礼貌拒绝两边', '短期确定性变少，长期边界没有被牺牲。', [['both_declined', ['OC18', 'OC21']]], { gu: -1 }, { reset: 5, boundary: 2 }, { runway: -4, optionality: 0, load: -1 }, { OC21: 8 }),
  ], { requiresAnyFlags: ['a_final_ask', 'b_clause_asked', 'b_change_written'] }),
  node('OC18', 'collision', ['flag:life_constraints', 'flag:transition_plan', 'astro:fusion:M12'], '生活约束下的最终决定', '答复最后两天，梁澄帮你核对 A、B 或暂不接受各自会怎样影响第一周、通勤与现金安排。支持是共同安排，不是对选择的评判；决定仍由你作出。', '在真实生活成本下选择 A、B，或两份都不接。', ['liang'], [
    choice('OC18_C1', '选择 A，并为第一周留出缓冲与固定恢复时段', '你确认 A，新开始有了节奏，其他承诺被主动缩减。', [['choose_a', ['OC19']], ['landing_buffered', ['ending_a_clear', 'ending_a_conditional']]], { liang: 2 }, { option_a: 5, safety: 2 }, { runway: 4, optionality: 1, load: -3 }, { OC19: 8 }, 'preboarding'),
    choice('OC18_C2', '选择 B，把第一月只保留必要事项并约四周复盘', '你确认 B，并把高峰期以外的事项主动缩减。', [['choose_b', ['OC20']], ['first_month_bound', ['ending_b_growth', 'ending_b_conditional']]], { liang: 2 }, { option_b: 5, growth: 2 }, { runway: 1, optionality: 5, load: -1 }, { OC20: 8 }, 'preboarding'),
    choice('OC18_C3', '两份都不接，和梁澄确认四周现金与求职安排', '你关闭两个窗口，重整不再只是空档，而有了范围和日期。', [['choose_neither', ['OC21']], ['reset_plan', ['ending_research_reset', 'ending_safe_reset']]], { liang: 2 }, { reset: 5, safety: 1 }, { runway: -2, optionality: 2, load: -2 }, { OC21: 8 }),
  ]),
  node('OC19', 'landing', ['flag:choose_a', 'flag:a_ready', 'flag:a_confirmed', 'astro:fusion:M02'], '接受 A 前的最后核对', 'A 的职责、支持和入职日期已可对照。接受意味着停止继续比较；仍可选择在一项关键条件写清后再确认，或因不匹配退出。', '把稳定路径落实为具体边界。', ['gu'], [
    choice('OC19_C1', '确认接受 A，并写下首季复盘日期', '你选择了更可预期的开局，也给自己留了复盘点。', [['ending_a_clear', ['ending_a_clear']]], { gu: 2 }, { option_a: 7, safety: 3 }, { runway: 10, optionality: 2, load: -1 }, {}, 'preboarding'),
    choice('OC19_C2', '在关键验收或生活条件写清后接受 A', '你没有拿到所有理想条件，但把最重要的一项落到文字。', [['ending_a_conditional', ['ending_a_conditional']]], { gu: 2 }, { option_a: 5, boundary: 4 }, { runway: 8, optionality: 3, load: 0 }, {}, 'preboarding'),
    choice('OC19_C3', '最后确认仍不匹配，退出并启用四周计划', '稳定窗口关闭，下一步由已有计划而不是慌乱承接。', [['ending_reset', ['ending_safe_reset']]], { gu: -1 }, { reset: 5 }, { runway: -5, optionality: 1, load: -2 }),
  ], { requiresAnyFlags: ['choose_a', 'a_confirmed'], careerStages: ['offer_pending', 'preboarding'] }),
  node('OC20', 'landing', ['flag:choose_b', 'flag:b_change_written', 'flag:b_confirmed', 'astro:fusion:M10'], '接受 B 前的最后核对', 'B 的合同、协作条件或团队变化已有可核实版本。接受意味着承受更高变化；你可以用边界接住它，或因关键条件退出。', '把成长路径落实为可承受的承诺。', ['tang'], [
    choice('OC20_C1', '确认接受 B，并写下四周检查点', '你选择了更有延展的路径，也把首次复盘放进日历。', [['ending_b_growth', ['ending_b_growth']]], { tang: 2 }, { option_b: 7, growth: 4 }, { runway: 5, optionality: 9, load: 2 }, {}, 'preboarding'),
    choice('OC20_C2', '在条款或高峰期边界确认后接受 B', '你接受变化，但没有把全部风险留给自己。', [['ending_b_conditional', ['ending_b_conditional']]], { tang: 1 }, { option_b: 5, boundary: 4 }, { runway: 4, optionality: 7, load: 1 }, {}, 'preboarding'),
    choice('OC20_C3', '关键条件仍不成立，退出并保留未来联系', '上行窗口关闭，判断边界仍然清楚。', [['ending_reset', ['ending_safe_reset']]], { tang: 0 }, { reset: 5 }, { runway: -4, optionality: 0, load: -1 }),
  ], { requiresAnyFlags: ['choose_b', 'b_confirmed'], careerStages: ['offer_pending', 'preboarding'] }),
  node('OC21', 'landing', ['flag:choose_neither', 'flag:both_declined', 'flag:decline_open', 'astro:fusion:M07'], '不接任何一份，也要有下一步', '两份 Offer 都不满足你的关键条件，或你在最后核对后选择退出。拒绝不是等待奇迹，需要把四周现金、联系和复盘安排写出来。', '重整要有范围，也要尊重现实安全线。', ['liang', 'cheng'], [
    choice('OC21_C1', '用四周补齐目标岗位材料，并约三次真实访谈', '你把方向验证留在可控周期内，不把它当成保证。', [['ending_research_reset', ['ending_research_reset']]], { cheng: 2 }, { reset: 5, growth: 2 }, { runway: -4, optionality: 5, load: 1 }),
    choice('OC21_C2', '先接住现金与生活安排，只保留一条求职主线', '安全余量回到优先级，选择空间暂时变窄。', [['ending_safe_reset', ['ending_safe_reset']]], { liang: 2 }, { reset: 4, safety: 4 }, { runway: 2, optionality: 1, load: -3 }),
    choice('OC21_C3', '暂停两周，按既定预算和日期重新打开搜索', '你没有用疲惫替代决定，也承认窗口会减少。', [['ending_rest_reset', ['ending_safe_reset']]], { liang: 1 }, { reset: 5 }, { runway: -3, optionality: -1, load: -7 }),
  ], { requiresAnyFlags: ['choose_neither', 'both_declined'], careerStages: ['offer_pending'] }),
];

export const OFFER_CHOICE = {
  id: 'offer_choice', title: '手里有两个机会，怎么选', entry: 'offer_choice', version: '0.4.0', initialCareerStage: 'offer_pending', initialFlags: { two_written_offers: true, reply_deadlines_near: true },
  careerStageTitles: { offer_pending: '两个 Offer，等待决定', preboarding: '已确认，准备入职' },
  characters: {
    liang: { id: 'liang', name: '梁澄', identity: '同住伴侣', relationship: '现实关系人：共同安排生活，不替你决定职业选择' },
    tang: { id: 'tang', name: '唐微', identity: '前同事', relationship: '同侪：提供可核实的团队信息，不代表公司承诺' },
    gu: { id: 'gu', name: '顾言', identity: '招聘负责人', relationship: '外部窗口人：确认书面条件与流程' },
    cheng: { id: 'cheng', name: '程岚', identity: '行业前辈', relationship: '复盘人：依据材料指出判断盲点' },
  },
  shareCopy: {
    ending_a_clear: { hook: '两份 Offer 都能接，我最后选了那个把话说清楚的。', insight: '我选的不是“最稳”，而是能看见前三个月会发生什么。', question: '如果是你，会选条件更清楚的 A，还是空间更大的 B？' },
    ending_a_conditional: { hook: '我没有等到完美 Offer，但把最怕失控的条件谈清了。', insight: '真正让我敢选 A 的，不是承诺，而是一条可以复盘的书面边界。', question: '如果只能谈下一项条件，你最想先写清什么？' },
    ending_b_growth: { hook: '我放弃了更稳的 A，选择了变化更大的 B。', insight: '我想要的不是冒险本身，而是一段能够留下新能力的增长。', question: '稳定和成长不能兼得时，你会把哪一个放在前面？' },
    ending_b_conditional: { hook: '我选了更有变化的 B，但没有把风险一起照单全收。', insight: '机会可以大胆接，边界必须在开始之前说清楚。', question: '换成你，会先谈合同、工作强度，还是团队变化？' },
    ending_research_reset: { hook: '手里有两份 Offer，我最后一份都没接。', insight: '拒绝不是因为不敢选，而是现有证据还不足以交换未来几年。', question: '两份都不合适时，你敢不敢暂时一个都不选？' },
    ending_safe_reset: { hook: '两份 Offer 摆在面前，我却决定先停下来。', insight: '这次我没有拿一份不匹配的工作，去换短暂的安心。', question: '机会和自己的状态冲突时，你会先保住哪一边？' },
  },
  nodes: N,
  stages: [
    { id: 'facts', order: 1, candidates: ['OC01', 'OC02', 'OC03'], profileDriven: true },
    { id: 'verify', order: 2, candidates: ['OC04', 'OC05', 'OC06'], profileDriven: false },
    { id: 'compare', order: 3, candidates: ['OC07', 'OC08', 'OC09'], profileDriven: false },
    { id: 'cost', order: 4, candidates: ['OC10', 'OC11', 'OC12'], profileDriven: true },
    { id: 'window', order: 5, candidates: ['OC13', 'OC14', 'OC15'], profileDriven: false },
    { id: 'collision', order: 6, candidates: ['OC16', 'OC17', 'OC18'], profileDriven: true },
    { id: 'landing', order: 7, candidates: ['OC19', 'OC20', 'OC21'], profileDriven: false },
  ],
  endings: [
    { id: 'ending_a_clear', match: { anyTags: ['flag:ending_a_clear'] }, routeWeights: { option_a: 7, safety: 3 }, summary: { title: '选择 A：用更清楚的条件开始', core: '你接受了 A，不是因为它保证未来，而是当前职责、支持与节奏已足够可核实。', gain: '更稳定的开局与可复盘的首季目标。', cost: '你停止继续比较，也放下了 B 的一部分上行可能。', alternativeHint: '若首月发现关键条件未被执行，可按书面复盘点重新校准。', qualityVariants: [{ when: { flags: ['landing_buffered'] }, text: '你还提前留出了第一周缓冲，生活切换不会完全靠硬撑。' }] }, action: { instruction: '把首季复盘日期和一项关键边界写进日历。' } },
    { id: 'ending_a_conditional', match: { anyTags: ['flag:ending_a_conditional'] }, routeWeights: { option_a: 5, boundary: 4 }, summary: { title: '选择 A：把关键边界带进新岗位', core: '你接受 A，同时把最容易失控的一项条件落到文字。', gain: '用书面条件减少了职责失控的风险。', cost: '其余条件仍会在实际协作中被检验。', alternativeHint: '首月按约定核对一次，不必等问题积累后才提出。', qualityVariants: [{ when: { flags: ['a_success_metric'] }, text: '验收标准也已被确认，首季复盘会更有依据。' }] }, action: { instruction: '入职前保存书面约定，并在首月核对一次执行情况。' } },
    { id: 'ending_b_growth', match: { anyTags: ['flag:ending_b_growth'] }, routeWeights: { option_b: 7, growth: 4 }, summary: { title: '选择 B：以增长换取可承受的变化', core: '你接受 B，并没有把高峰与变化想象成免费成长。', gain: '更大的职责延展与可迁移的成长机会。', cost: '高峰期和团队变化会占用恢复与生活空间。', alternativeHint: '四周检查点用于校验事实，不是对自己的承诺考试。', qualityVariants: [{ when: { flags: ['b_change_written'] }, text: '关键团队变化已有书面确认，判断不只建立在传闻上。' }] }, action: { instruction: '保留四周检查点，届时按实际职责和负荷复盘。' } },
    { id: 'ending_b_conditional', match: { anyTags: ['flag:ending_b_conditional'] }, routeWeights: { option_b: 5, boundary: 4 }, summary: { title: '选择 B：在变化里先守住边界', core: '你选择 B 的机会窗口，也在签约前确认了最关键的条款。', gain: '保留增长空间，同时避免把核心风险完全留给自己。', cost: '变化没有消失，仍需用实际负荷检验边界。', alternativeHint: '若约定未执行，先回到书面条款和检查点沟通。', qualityVariants: [{ when: { flags: ['transition_plan'] }, text: '生活切换也已有安排，第一周的缓冲更完整。' }] }, action: { instruction: '把合同边界和恢复安排同步到第一周计划。' } },
    { id: 'ending_research_reset', match: { anyTags: ['flag:ending_research_reset'] }, routeWeights: { reset: 5, growth: 2 }, summary: { title: '暂不接受：用四周补齐证据', core: '你拒绝不匹配的机会，并为下一次判断建立材料和真实反馈。', gain: '下一轮选择会有更具体的作品与信息。', cost: '四周内没有新的固定 Offer，现金与时间必须受控。', alternativeHint: '只验证一个重点，避免再次把比较扩成无止境研究。', qualityVariants: [{ when: { flags: ['reset_plan'] }, text: '现金与生活安排已先定下范围，重整不必完全靠意志力。' }] }, action: { instruction: '只执行四周计划中的一个重点，按日期复盘现金与进展。' } },
    { id: 'ending_safe_reset', match: { anyTags: ['flag:ending_safe_reset', 'flag:ending_rest_reset', 'flag:ending_reset'] }, routeWeights: { reset: 4, safety: 4 }, summary: { title: '暂不接受：先恢复安全余量', core: '你没有用一份不匹配的 Offer 换短暂安心，而是把现实安全线放回首位。', gain: '预算、支持与恢复先有了可执行的优先级。', cost: '机会窗口会缩小，也需要接受重新搜索的节奏。', alternativeHint: '在既定日期再打开搜索，而不是每天靠焦虑反复比较。', qualityVariants: [{ when: { flags: ['first_month_bound'] }, text: '你还主动缩减了第一月事项，恢复与判断会更有空间。' }] }, action: { instruction: '确认预算、支持边界和下一次重新打开机会的日期。' } },
  ],
};
