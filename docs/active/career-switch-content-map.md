# 《想转行，但担心从头开始》内容地图（0.4.2 草案）

状态：内容交付稿，待编码
入口建议：`career_switch`
主角阶段：`employed` 或 `stable_income_with_switch_intent`，前台统一显示“仍有收入，想换赛道”
内容目标：补齐“工作岔路”第四条完整剧情，避免与《工作空窗期》《在职，但越来越想离开》《手里有两个机会，怎么选》重叠。

## 1. 一句话体验

用户并不是马上要辞职，也不是已经拿到两份 Offer，而是已经有一个想去的新方向：看过课程、收藏过岗位、也有一部分旧能力可能迁移。但真正卡住的是：如果转行，过去几年是不是白干；如果不转，自己会不会继续困在熟悉但消耗的轨道里。

七幕之后，系统不替用户判断“该不该转行”，只呈现这一轮选择把用户带向哪种路径：低风险试转、留在原轨内迁移、先补作品证据、延后转行、把转行缩成副线验证，或主动重整节奏。

## 2. 与已有三条剧情的去重边界

| 剧情 | 本剧情不做什么 | 本剧情专门做什么 |
| --- | --- | --- |
| 《工作空窗期》 | 不写用户已经失业、现金只剩三个月、不写求职求生局 | 写“仍有收入/原岗位还在”，所以试错成本和身份成本并存 |
| 《在职，但越来越想离开》 | 不把主冲突写成领导加责、裸辞、猎头跳槽 | 写“换赛道”本身，重点是旧能力迁移、作品证据、学习投入 |
| 《手里有两个机会，怎么选》 | 不制造两份书面 Offer，不做 A/B Offer 对比 | 写目标行业尚未验证完整，窗口来自作品、短项目、内转或课程 |

## 3. 命盘参与方式

命盘只决定“这一局更先撞见哪类问题”和“哪些风险更容易被放大”，不决定事实。系统不能因为命盘而生成转行机会、贵人、收入、辞退、疾病或家庭冲突。

### 3.1 三层信号

| 层 | 使用范围 | 可影响 | 不可影响 |
| --- | --- | --- | --- |
| 八字 | 印、食伤、财官、比劫、冲合变化 | 用户更关注学习成本、表达作品、现金安全、同侪比较 | 不能说“你天生适合某行业” |
| 紫微 | 命宫、官禄、迁移、财帛、福德、交友 | 节点候选排序：先出现作品反馈、现金账本、关系反馈或环境窗口 | 不能创造客户、Offer、分手、搬家 |
| 运限 | 大限/流年/流月对官禄、迁移、财帛、福德的激活 | 解释为什么“现在这类议题更容易浮到前台” | 不能作绝对预测 |

### 3.2 建议融合规则

| 规则 ID | 触发含义 | 对应节点偏向 |
| --- | --- | --- |
| `M03_proof_before_title` | 食伤/化科/官禄与作品证明相关 | 优先进入作品、试做、可迁移成果节点 |
| `M06_learn_to_switch` | 印星/命宫/官禄提示学习与资格转换 | 优先进入课程、证书、学习边界节点 |
| `M01_cash_anchor` | 财星/财帛/化禄化忌提示现金安全 | 优先进入预算、保底、收入连续性节点 |
| `M05_external_move` | 迁移/驿马/外部环境变化被激活 | 优先进入外部行业、异地/远程窗口节点 |
| `M07_rest_then_decide` | 福德/身心负荷提示恢复与判断力 | 优先进入减负、节奏、延后决定节点 |
| `M10_income_dual_track` | 食伤生财/财帛交友提示副线验证 | 优先进入小单、付费试做、副业合规节点 |

## 4. 固定人物

沿用工作主题固定人物，减少用户认知负担。

| 角色 ID | 人物 | 功能 | 禁止写法 |
| --- | --- | --- | --- |
| `liang` | 梁澄，同住伴侣/家人 | 共同核对时间、预算和生活影响 | 不替用户选方向，不成为反对梦想的人 |
| `tang` | 唐微，前同事/同侪 | 提供对旧能力的真实反馈和行业入口信息 | 不做万能内推人，不承诺职位 |
| `gu` | 顾言，外部窗口人 | 代表课程顾问、招聘方或项目窗口，只能确认书面条件 | 不许口头许诺转行成功 |
| `cheng` | 程岚，行业前辈/复盘人 | 基于材料指出盲点、校准路径 | 不讲鸡汤，不替用户算命定职业 |

## 5. 前台筹码与隐藏账本

### 5.1 前台筹码

| 字段 | 初始建议 | 含义 |
| --- | ---: | --- |
| `runway` | 62 | 收入连续性、安全垫、能否承担试错 |
| `optionality` | 42 | 新方向证据、外部反馈、可选择路径 |
| `load` | 46 | 双线学习/工作/生活带来的负荷，越高越累 |

### 5.2 隐藏累计项

| 字段 | 含义 |
| --- | --- |
| `transferable_proof` | 旧能力能否被新行业理解 |
| `learning_commitment` | 学习不是收藏课程，而是有周期、有产出 |
| `market_feedback` | 来自行业真实人的反馈，不等于鼓励 |
| `income_guardrail` | 转行期间的收入底线 |
| `identity_cost` | 职级、薪资、面子与“从头开始”的心理成本 |
| `current_role_boundary` | 原岗位能否减少消耗、腾出验证空间 |
| `trust_liang` | 梁澄对时间与预算安排的信任 |
| `trust_tang` | 唐微是否愿意继续提供真实信息 |
| `trust_gu` | 外部窗口是否认为用户认真且边界清楚 |
| `trust_cheng` | 程岚是否愿意继续基于材料复盘 |

## 6. 七幕结构

| 幕 | 阶段 ID | 功能 | 候选节点 |
| --- | --- | --- | --- |
| 1 | `facts` | 把“想转行”落成具体事实 | `CS01–CS03` |
| 2 | `verify` | 验证旧能力、学习成本或现金边界 | `CS04–CS06` |
| 3 | `proof` | 做一次最小证明，而不是继续想象 | `CS07–CS09` |
| 4 | `cost` | 代价显形：时间、身份、收入或关系 | `CS10–CS12` |
| 5 | `window` | 外部窗口出现，但不保证成功 | `CS13–CS15` |
| 6 | `collision` | 原轨与新轨不能同时满配 | `CS16–CS18` |
| 7 | `landing` | 确定未来 4–8 周走法 | `CS19–CS21` |

## 7. 节点与选项

效果记法：

- `R` = 安全余量 `runway`
- `O` = 机会窗口 `optionality`
- `L` = 身心负荷 `load`，上升代表更累
- `Rel(x)` = 对人物信任变化
- `route` = 结局路线权重
- `flag -> consumeBy` = 延迟标记及消费点

### 第一幕｜事实落地

#### CS01｜你不是不想干了，是想换一条赛道

情境：原岗位收入还在，但你已经连续三个月关注一个新方向：收藏岗位、看课程、关注从业者，却还没做出一个能被别人评价的东西。
冲突：继续研究，还是把转行从想法变成验证动作。
命盘优先：`M03_proof_before_title`、`M06_learn_to_switch`。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 列出旧工作中能迁移的 3 个能力，并配一个真实案例 | 你发现并非一切归零，但也有一块证据明显缺失。 | `transfer_list -> CS04, CS07, CS13`，Rel(程岚)+1，route: proof+2 | R0 O+4 L+1 |
| 报一个四周入门课，把转行理解为先学习 | 你获得结构化入口，但课程并不会自动变成行业认可。 | `course_started -> CS05, CS10, CS19`，Rel(顾言)+1，route: learning+2 | R-2 O+2 L+3 |
| 暂时不告诉任何人，继续看岗位和经验帖 | 你保留安全感，也让焦虑继续停在脑内循环。 | `silent_research -> CS06, CS12, CS21`，route: delay+2 | R0 O+1 L+2 |

#### CS02｜新行业看起来很近，门槛却说不清

情境：你发现新行业的岗位描述里有很多熟悉词：项目、沟通、数据、运营、产品、咨询。但真正要求的作品、工具或行业知识不完全一样。
冲突：相似感是否等于可迁移。
命盘优先：`M03_proof_before_title`、`M05_external_move`。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 拿 3 个目标岗位反推必须补的作品和工具 | 岗位不再只是诱惑，变成一张缺口清单。 | `jd_gap_map -> CS04, CS08, CS14`，route: proof+2 | R0 O+5 L+2 |
| 找唐微问：你过去哪段经历最像新方向 | 唐微指出一个你低估的旧项目，也提醒别夸大。 | `peer_transfer_feedback -> CS07, CS13`，Rel(唐微)+2，route: market+2 | R0 O+4 L+1 |
| 先把目标范围缩小到一个细分岗位 | 选择空间变窄，但验证成本也下降。 | `niche_chosen -> CS08, CS15, CS19`，route: focused+2 | R0 O+3 L-1 |

#### CS03｜梁澄问：你准备花多少时间试

情境：梁澄看到你下班后连续刷课和看岗位，问你这件事会占用多少晚上、多少钱，以及什么时候知道“不适合”。
冲突：转行不是个人幻想，它会挤占现实生活。
命盘优先：`M01_cash_anchor`、`M07_rest_then_decide`。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 一起定四周试验预算：钱、晚上数、停止条件 | 支持变成边界，不再只是“你自己看着办”。 | `trial_guardrail -> CS06, CS10, CS18`，Rel(梁澄)+2，route: safe_probe+2 | R+2 O+2 L-2 |
| 说明你不想被泼冷水，先自己试一个月 | 自主感保住了，但生活安排还没有被同步。 | `life_sync_deferred -> CS12, CS18`，Rel(梁澄)-1，route: delay+1 | R0 O+2 L+2 |
| 先暂停一周，把当前工作和睡眠恢复到可判断状态 | 你没有否定转行，只是先把判断力救回来。 | `recovery_first -> CS11, CS21`，Rel(梁澄)+1，route: recovery+2 | R0 O-1 L-5 |

### 第二幕｜第一次验证

#### CS04｜程岚看完你的“可迁移能力表”

进入条件：`transfer_list` 或 `jd_gap_map`。
情境：程岚只看材料，不看你的热情。她圈出两类能力：一种新行业听得懂，另一种只是原公司语境里的贡献。
冲突：旧成绩如何翻译成新行业证据。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 把一个旧项目改写成新行业能理解的案例页 | 旧积累被翻译出来，但还缺外部反馈。 | `case_rewritten -> CS07, CS13, CS19`，Rel(程岚)+2，route: proof+3 | R0 O+6 L+2 |
| 承认有一块硬技能缺口，安排两周补齐 | 路径更诚实，短期速度变慢。 | `skill_gap_named -> CS05, CS10, CS20`，Rel(程岚)+1，route: learning+2 | R-1 O+3 L+2 |
| 觉得被否定，先放下材料，继续看机会 | 情绪缓了一点，但证据缺口没有消失。 | `feedback_avoided -> CS12, CS21`，Rel(程岚)-1，route: delay+2 | R0 O-1 L-1 |

#### CS05｜课程顾问说“很多人零基础转成功”

进入条件：`course_started` 或 `skill_gap_named`。
情境：顾言作为课程/训练营窗口人，给出课程表和费用。她能确认作业、退款和就业服务条款，不能保证转行成功。
冲突：学习投入与营销承诺。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 只问作业产出、退款条件和就业服务边界 | 你把热情从广告里拿回来，落到合同条款。 | `course_terms_checked -> CS10, CS14, CS20`，Rel(顾言)+1，route: safe_probe+2 | R0 O+3 L0 |
| 先买低价入门课，不承诺长期班 | 成本可控，但学习深度有限。 | `starter_course -> CS10, CS19`，route: learning+1 | R-1 O+2 L+2 |
| 直接报名高价班，逼自己认真转 | 决心很强，现金和时间压力也立刻上来。 | `expensive_course -> CS10, CS18, CS21`，Rel(梁澄)-1，route: risky_push+2 | R-8 O+5 L+6 |

#### CS06｜你把四周试验写进日历

进入条件：`trial_guardrail`、`silent_research` 或 `life_sync_deferred`。
情境：如果只是“有空就学”，转行会继续变成深夜焦虑。你需要给四周试验排出固定时段。
冲突：保留原工作表现，同时给新方向一点真实空间。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 每周两晚做作品，一晚复盘，不碰工作时间 | 节奏清楚，速度不快，但更可持续。 | `fixed_trial_calendar -> CS08, CS11, CS18`，Rel(梁澄)+1，route: safe_probe+3 | R0 O+4 L+1 |
| 把所有下班时间都压上，四周后必须见结果 | 进展会更快，生活和恢复空间被压缩。 | `overloaded_trial -> CS10, CS12, CS18`，route: risky_push+2 | R0 O+5 L+7 |
| 暂时只做信息访谈，不做作品 | 你获得现实信息，但仍没有可展示证据。 | `interview_only -> CS13, CS15, CS21`，route: market+1 | R0 O+3 L0 |

### 第三幕｜最小证明

#### CS07｜唐微看了你的旧案例改写

进入条件：`case_rewritten`、`peer_transfer_feedback` 或 `transfer_list`。
情境：唐微愿意从同侪角度说真话：这份材料能看出你会做事，但还不像新行业的人会写的案例。
冲突：保住旧成绩的自尊，还是接受重写。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 请她直接指出最不像新行业表达的三处 | 材料被改得更痛，但方向清楚了。 | `peer_redline -> CS13, CS16, CS19`，Rel(唐微)+2，route: proof+3 | R0 O+5 L+2 |
| 只保留她认可的部分，先投一次试试看 | 你获得一次投递动作，但反馈可能混杂。 | `early_application -> CS14, CS16`，Rel(唐微)+1，route: market+2 | R0 O+4 L+3 |
| 觉得材料还没准备好，继续私下打磨 | 风险暂时降低，也容易拖成无限修改。 | `private_polish -> CS12, CS21`，route: delay+2 | R0 O+1 L+1 |

#### CS08｜第一个最小作品做到一半

进入条件：`jd_gap_map`、`niche_chosen` 或 `fixed_trial_calendar`。
情境：你选了一个细分方向，做一个能在两周内完成的小作品。做到一半时，发现工具、表达和行业常识都比想象更细。
冲突：完成一版粗糙作品，还是继续补课。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 完成粗糙但可展示的 v1，并标出自己不确定的地方 | 作品不完美，却终于能被别人评价。 | `mvp_done -> CS13, CS15, CS19`，route: proof+4 | R0 O+7 L+3 |
| 停下补关键工具，再延后一周提交 | 质量可能更好，试验周期被拉长。 | `tool_gap_study -> CS10, CS20`，route: learning+2 | R-1 O+3 L+2 |
| 放弃这个方向，换一个看起来更简单的细分 | 焦虑短暂下降，但验证重启。 | `niche_switched -> CS12, CS21`，route: delay+2 | R0 O0 L-1 |

#### CS09｜一个朋友问你能不能帮忙做小项目

进入条件：任意；优先 `M10_income_dual_track`。
情境：朋友有个很小的需求，愿意给一点费用，但需求边界模糊。它不是转行成功，只是一次付费验证。
冲突：付费试水与范围失控。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 只接一个两周内能验收的小模块，先收 30% | 小项目可控，第一次收入也有了边界。 | `paid_micro_project -> CS15, CS17, CS20`，route: income_probe+3 | R+3 O+5 L+4 |
| 免费帮一次，换取完整案例和推荐语 | 没有收入，但可换一份公开证明。 | `free_case_for_testimonial -> CS13, CS17, CS19`，route: proof+2 | R-1 O+4 L+3 |
| 拒绝项目，避免当前工作和学习失控 | 你保住节奏，也少了一次市场反馈。 | `micro_project_declined -> CS11, CS21`，route: recovery+1 | R0 O-1 L-2 |

### 第四幕｜代价显形

#### CS10｜四周还没结束，你已经开始累

进入条件：`course_started`、`skill_gap_named`、`course_terms_checked`、`overloaded_trial`、`tool_gap_study` 或 `expensive_course`。
情境：白天原工作，晚上学新东西。进度不是没有，但你开始靠熬夜补时间。
冲突：速度与可持续。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 缩小学习范围，只保留会直接进入作品的一项 | 压力下降，学习更贴近验证。 | `learning_scope_cut -> CS14, CS19, CS20`，route: safe_probe+2 | R0 O+3 L-4 |
| 继续按原计划冲完，不提前调整 | 进度推进，判断力开始变钝。 | `fatigue_accumulated -> CS18, CS21`；`tired_output_sent -> CS13`，route: risky_push+2 | R0 O+4 L+5 |
| 暂停一周恢复，再重新排四周计划 | 速度下降，但你没有把疲惫误当成失败。 | `replan_after_rest -> CS11, CS13, CS21`，Rel(梁澄)+1，route: recovery+3 | R0 O-1 L-6 |

#### CS11｜当前工作开始被影响

进入条件：`fixed_trial_calendar`、`recovery_first`、`micro_project_declined`、`replan_after_rest`、`peer_redline`、`early_application`、`mvp_done`、`paid_micro_project` 或 `free_case_for_testimonial`。
情境：你在原岗位还有职责。最近一次交付虽然没出大问题，但注意力被新方向分走。
冲突：旧信用是否要为新尝试让路。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 把原岗位本月关键交付列出来，只保最低质量线 | 你没有失守旧信用，也释放一点时间。 | `current_role_guarded -> CS13, CS16, CS18, CS19`，route: internal_bridge+2 | R+1 O+2 L-2 |
| 主动和领导谈减少低价值事务，保留转行验证时间 | 边界变清楚，但公司未必完全配合。 | `current_scope_talk -> CS13, CS16, CS18`，route: internal_bridge+3 | R0 O+3 L0 |
| 不调整，靠周末补两边 | 短期看起来都没掉，负荷继续上升。 | `weekend_compensate -> CS15, CS18, CS21`，route: risky_push+1 | R0 O+2 L+5 |

#### CS12｜你开始怀疑：是不是我根本不适合

进入条件：`silent_research`、`feedback_avoided`、`private_polish`、`niche_switched`、`life_sync_deferred` 或 `overloaded_trial`。
情境：没有外部反馈时，转行很容易变成自我怀疑：一会儿觉得新方向太难，一会儿又觉得原工作不能再待。
冲突：自我怀疑与真实证据。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 把怀疑拆成 3 个可验证问题，而不是人格判断 | 情绪没有立刻消失，但问题变得可处理。 | `doubt_to_questions -> CS13, CS21`，route: recovery+2 | R0 O+3 L-3 |
| 找程岚复盘一次，只带材料不求安慰 | 她指出你缺的是反馈，不是“适不适合”的结论。 | `mentor_reframe -> CS13, CS19`，Rel(程岚)+2，route: proof+2 | R0 O+4 L-2 |
| 关掉所有信息源一周，暂时不想转行 | 噪音下降，路径也暂停。 | `switch_pause -> CS21`，route: recovery+3 | R0 O-2 L-5 |

### 第五幕｜外部窗口

#### CS13｜第一次外部反馈来了

进入条件：`case_rewritten`、`peer_redline`、`mvp_done`、`free_case_for_testimonial`、`doubt_to_questions`、`mentor_reframe`、`interview_only`、`tired_output_sent`、`replan_after_rest`、`current_role_guarded`、`current_scope_talk` 或 `switch_pause`。
情境：一个从业者或潜在用户看完你的材料，反馈很具体：有一部分能用，有一部分仍像外行。
冲突：把反馈当成否定，还是当成下一版方向。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 只改最影响可信度的一项，并约二次反馈 | 下一版目标清楚，外部关系也更愿意继续看。 | `second_feedback_booked -> CS16, CS19`，Rel(程岚)+1，route: proof+3 | R0 O+5 L+1 |
| 用这份反馈投 3 个入门岗位/项目，不海投 | 行动变真实，拒绝也会变真实。 | `targeted_switch_apply -> CS16, CS20`，route: market+3 | R0 O+6 L+3 |
| 先把反馈收藏起来，等作品更完整再说 | 材料没有冒险，也暂时没有新增证据。 | `feedback_parked -> CS21`，route: delay+2 | R0 O0 L0 |

#### CS14｜一个外部窗口问：你愿不愿意从低一级开始

进入条件：`early_application`、`course_terms_checked`、`learning_scope_cut`、`jd_gap_map`。
情境：顾言代表外部招聘/项目窗口，说明新方向可以给试岗、实习式项目或低一级岗位，但薪资和头衔都不如现在。
冲突：身份成本与转行入口。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 接受低一级入口，但要求职责和转正/复盘条件写清 | 入口变成可评估的试转，不是盲目降级。 | `junior_entry_terms -> CS17, CS20`，Rel(顾言)+2，route: focused+3 | R-2 O+6 L+2 |
| 暂不接受降级，只保持信息联系并继续补作品 | 你守住身份和收入，也延后进入新轨。 | `junior_entry_delayed -> CS19, CS21`，Rel(顾言)+1，route: delay+2 | R0 O+2 L-1 |
| 因为降级感太强，停止看这个方向 | 面子压力下降，但这次验证也提前结束。 | `identity_block -> CS21`，route: recovery+1 | R0 O-3 L-2 |

#### CS15｜小项目开始变大

进入条件：`paid_micro_project`、`mvp_done`、`niche_chosen`、`interview_only` 或 `weekend_compensate`。
情境：对方看见你能做，开始追加需求。钱可能多一点，但范围、交付和原工作时间都开始挤压。
冲突：市场机会与边界失控。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 把追加需求拆成新合同，不混进原模块 | 机会保住，边界也保住。 | `scope_split_contract -> CS17, CS20`，route: income_probe+3 | R+3 O+5 L+2 |
| 接下追加需求，先把案例做漂亮 | 作品可能更完整，负荷明显上升。 | `scope_creep_accepted -> CS18, CS20`，route: risky_push+2 | R+2 O+6 L+6 |
| 不追加，只完成原约定并要反馈 | 收益变少，但可控交付形成证据。 | `micro_project_closed_clean -> CS17, CS19`，route: proof+2 | R+1 O+3 L-1 |

### 第六幕｜不可两全

#### CS16｜新方向面试/交流撞上原岗位关键节点

进入条件：`peer_redline`、`early_application`、`current_role_guarded`、`current_scope_talk`、`targeted_switch_apply`、`second_feedback_booked` 或 `junior_entry_delayed`。
情境：新方向的交流机会排在本周，而原岗位也有一个不能缺席的交付节点。
冲突：不牺牲旧信用，也不放弃新窗口。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 提前交原岗位材料，换出一段干净时间参加交流 | 两边都付出成本，但没有靠隐瞒推进。 | `clean_switch_window -> CS19, CS20`，Rel(唐微)+1，route: focused+3 | R0 O+5 L+3 |
| 请外部窗口改期，说明你仍需履行现职责 | 对方认可边界，但机会节奏变慢。 | `window_rescheduled_clean -> CS19, CS21`，Rel(顾言)+1，route: safe_probe+2 | R0 O+3 L0 |
| 放弃本次交流，保住原岗位节点 | 旧信用稳住，新方向窗口减少。 | `switch_window_missed -> CS21`，route: delay+2 | R+1 O-2 L-2 |

#### CS17｜第一笔验证完成，但还不能替代工资

进入条件：`paid_micro_project`、`scope_split_contract`、`micro_project_closed_clean`、`free_case_for_testimonial` 或 `junior_entry_terms`。
情境：小项目、试岗或推荐语有了结果。它证明新方向不是纯幻想，但离稳定收入还有距离。
冲突：把一笔反馈当成功，还是当作下一步证据。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 把结果整理成案例页，并标注数据和限制 | 证据可复用，也不会被夸大成成功学。 | `validated_case_page -> CS19, CS20`，route: proof+4 | R0 O+7 L+2 |
| 继续接第二个同类小单，验证可复制性 | 市场反馈增强，时间压力也增加。 | `second_paid_probe -> CS20, CS21`，route: income_probe+3 | R+3 O+5 L+4 |
| 停止接单，先把原工作与学习节奏稳住 | 你承认验证有效，但不急着扩大。 | `probe_hold_for_stability -> CS19, CS21`，route: safe_probe+2 | R0 O+2 L-3 |

#### CS18｜梁澄提醒你：家里感受到你的双线压力

进入条件：`trial_guardrail`、`life_sync_deferred`、`expensive_course`、`overloaded_trial`、`fatigue_accumulated`、`weekend_compensate`、`scope_creep_accepted`、`feedback_parked` 或 `identity_block`。
情境：你没有失控，但家里的作息和沟通已经被影响。梁澄不是要你放弃，而是要求你重新说清上限。
冲突：坚持转行与共同生活秩序。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 重新确认每周投入上限，并保留一个完整休息日 | 支持回到可持续状态。 | `life_boundary_repaired -> CS19, CS21`，Rel(梁澄)+2，route: recovery+3 | R0 O+1 L-5 |
| 坚持四周冲刺不变，到期再调整 | 决心保住，关系与身体继续承压。 | `sprint_until_deadline -> CS20, CS21`，Rel(梁澄)-1，route: risky_push+2 | R0 O+4 L+4 |
| 承认当前节奏不行，转为每周一次低频验证 | 速度下降，但局面没有崩。 | `low_frequency_probe -> CS19, CS21`，Rel(梁澄)+1，route: safe_probe+2 | R0 O+1 L-4 |

### 第七幕｜未来 4–8 周落点

#### CS19｜这次转行先落成一个低风险试验

进入条件：`case_rewritten`、`mvp_done`、`starter_course`、`junior_entry_delayed`、`micro_project_closed_clean`、`clean_switch_window`、`window_rescheduled_clean`、`probe_hold_for_stability`、`life_boundary_repaired` 或 `low_frequency_probe`。
情境：你已经有一些证据，但还不足以押上全部。现在要决定下一轮是继续试转、回到原轨内部迁移，还是先完成一份作品。
冲突：不放弃，也不神化转行。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 设定 8 周试转：一份作品、三次反馈、一次收入验证 | 转行变成可执行项目。 | `ending_controlled_switch_trial -> ending_controlled_switch_trial`，route: safe_probe+6 | R0 O+8 L+1 |
| 留在原轨，但争取把职责转向目标能力 | 不离开，也不原地重复。 | `ending_internal_bridge -> ending_internal_bridge`，route: internal_bridge+6 | R+3 O+5 L-1 |
| 先完成一份能公开展示的作品，再谈转行 | 下一步收束为证据建设。 | `ending_proof_sprint -> ending_proof_sprint`，route: proof+6 | R0 O+6 L+2 |

#### CS20｜新方向可以继续，但要付出更明确的代价

进入条件：`skill_gap_named`、`course_terms_checked`、`tool_gap_study`、`learning_scope_cut`、`junior_entry_terms`、`scope_split_contract`、`second_paid_probe`、`validated_case_page` 或 `sprint_until_deadline`。
情境：外部窗口、学习投入或小项目已经证明“不是没可能”，但要继续就必须付出薪资、职级、时间或安全垫中的一部分。
冲突：有代价的继续。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 接受低一级/试岗入口，但只承诺一个复盘周期 | 你真正踏入新轨，同时留住检查点。 | `ending_junior_entry -> ending_junior_entry`，route: focused+6 | R-4 O+9 L+3 |
| 保留主工作，继续做可收费的低频验证 | 现金底盘保住，新方向继续有反馈。 | `ending_dual_track_probe -> ending_dual_track_probe`，route: income_probe+6 | R+2 O+7 L+2 |
| 暂停扩大投入，先补最硬的一块技能缺口 | 速度慢一点，但下一轮更扎实。 | `ending_skill_gap_sprint -> ending_skill_gap_sprint`，route: learning+6 | R-1 O+5 L0 |

#### CS21｜如果暂时不转，也要把它变成一个决定

进入条件：`silent_research`、`feedback_avoided`、`private_polish`、`niche_switched`、`feedback_parked`、`identity_block`、`switch_pause`、`switch_window_missed`、`fatigue_accumulated`、`sprint_until_deadline` 或 `recovery_first`。
情境：这轮转行推进并不顺利，或你发现当前不适合继续加码。暂不转行不等于失败，但需要一个下次重新打开的条件。
冲突：延后决定与逃避决定。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 延后 3 个月，只保留一个低频观察窗口 | 你没有硬撑，也没有彻底关门。 | `ending_delayed_switch -> ending_delayed_switch`，route: delay+6 | R+2 O+1 L-4 |
| 停止转行叙事，先修复工作、睡眠和现金秩序 | 人先回到可判断状态。 | `ending_recovery_reset -> ending_recovery_reset`，route: recovery+6 | R+2 O-1 L-8 |
| 承认目标方向不成立，重新定义下一轮探索标准 | 这条路暂时关闭，但经验被留下。 | `ending_direction_reframed -> ending_direction_reframed`，route: focused+4 recovery+2 | R0 O+2 L-5 |

## 8. 六个结局

### `ending_controlled_switch_trial`｜低风险试转

- 核心：你没有把转行变成一次豪赌，而是把它拆成 8 周可验证的试验。
- 得到：作品、反馈、一次收入或入口验证。
- 代价：速度不会很快，也需要忍受“不确定但继续做”的阶段。
- 下一步：写下 8 周内唯一主作品、三位反馈对象和一次收入验证方式。
- 分享钩子：我没有裸辞转行，只给自己开了一个 8 周试验。
- 分享洞见：真正让我动起来的不是“我要重开人生”，而是这条路终于有了停止条件。
- 分享问题：如果你想转行，会先辞职，还是先给自己做一次低风险试验？

### `ending_internal_bridge`｜留在原轨内迁移

- 核心：你暂时不离开，但开始把现岗位职责往目标能力靠。
- 得到：收入连续性和更低风险的能力迁移。
- 代价：环境没有彻底变化，仍要防止原工作吞掉所有时间。
- 下一步：和当前岗位确认一个能积累目标能力的职责或项目。
- 分享钩子：我以为转行只能重开，结果发现可以先在原轨里换方向。
- 分享洞见：有些转行不是换公司，而是先把自己每天做的事换掉一部分。
- 分享问题：如果原工作还能长出新能力，你会先留下试试吗？

### `ending_proof_sprint`｜先补作品证据

- 核心：这一轮最缺的不是勇气，而是一份能被新行业看懂的证据。
- 得到：更清楚的作品方向和下一次沟通材料。
- 代价：短期没有身份变化，也可能继续面对原岗位消耗。
- 下一步：两周内完成 v1，并找一个真实从业者反馈。
- 分享钩子：我暂时没转行，因为我先欠新行业一份能看的作品。
- 分享洞见：焦虑最喜欢问“我适不适合”，但市场只会回答“你这份东西够不够用”。
- 分享问题：换成你，会先补作品，还是先去投简历试水？

### `ending_junior_entry`｜接受低一级入口

- 核心：你愿意为换赛道承担身份成本，但把试岗/复盘条件先写清。
- 得到：真正进入新轨的机会。
- 代价：薪资、头衔或熟练感会短期下降。
- 下一步：只承诺一个复盘周期，写清职责、评价标准和退出条件。
- 分享钩子：我接受从低一级开始，但没有把自己交给一句“以后会好”。
- 分享洞见：从头开始最可怕的不是降级，而是降级以后仍然没有评估标准。
- 分享问题：如果能换到想去的方向，你能接受短期低一级吗？

### `ending_dual_track_probe`｜主业保底，副线验证

- 核心：你保留原工作的底盘，让新方向先通过小项目或低频服务证明自己。
- 得到：现金安全和市场反馈并存。
- 代价：必须严守工时、合规和恢复边界。
- 下一步：固定每周投入上限，并定义第二笔验证的最低条件。
- 分享钩子：我没有急着转行，只让新方向先赚到一次真实反馈。
- 分享洞见：副线不是退路，它更像一次现实测谎：有人愿不愿意为这件事付费。
- 分享问题：如果一个新方向还不能养活你，你会不会先让它低频跑起来？

### `ending_delayed_or_recovery`｜延后转行 / 恢复重整

- 核心：这轮暂时不适合继续加码，你把延后变成有条件的决定。
- 得到：睡眠、现金和判断力先回到可用状态。
- 代价：窗口会变少，下一次重新打开必须有触发条件。
- 下一步：写下三个月后重新评估的条件：作品、预算、时间或反馈。
- 分享钩子：我这次没有转行，不是认输，是先把自己从混乱里捞回来。
- 分享洞见：状态很差的时候做大决定，常常是在让疲惫替自己选路。
- 分享问题：你会在很累的时候硬转方向，还是先把判断力养回来？

## 9. Flag 生产-消费账本

| 生产阶段 | 关键 flags | 主要消费点 |
| --- | --- | --- |
| 第一幕 | `transfer_list`、`course_started`、`silent_research`、`jd_gap_map`、`peer_transfer_feedback`、`niche_chosen`、`trial_guardrail`、`life_sync_deferred`、`recovery_first` | 第二幕、第四幕、第七幕 |
| 第二幕 | `case_rewritten`、`skill_gap_named`、`feedback_avoided`、`course_terms_checked`、`starter_course`、`expensive_course`、`fixed_trial_calendar`、`overloaded_trial`、`interview_only` | 第三幕至第七幕 |
| 第三幕 | `peer_redline`、`early_application`、`private_polish`、`mvp_done`、`tool_gap_study`、`niche_switched`、`paid_micro_project`、`free_case_for_testimonial`、`micro_project_declined` | 第四幕至第七幕 |
| 第四幕 | `learning_scope_cut`、`fatigue_accumulated`、`replan_after_rest`、`current_role_guarded`、`current_scope_talk`、`weekend_compensate`、`doubt_to_questions`、`mentor_reframe`、`switch_pause` | 第五幕至第七幕 |
| 第五幕 | `second_feedback_booked`、`targeted_switch_apply`、`feedback_parked`、`junior_entry_terms`、`junior_entry_delayed`、`identity_block`、`scope_split_contract`、`scope_creep_accepted`、`micro_project_closed_clean` | 第六幕、第七幕 |
| 第六幕 | `clean_switch_window`、`window_rescheduled_clean`、`switch_window_missed`、`validated_case_page`、`second_paid_probe`、`probe_hold_for_stability`、`life_boundary_repaired`、`sprint_until_deadline`、`low_frequency_probe` | 第七幕/结局 |

## 10. 连续性与质量自检

- 开局必须是“仍有原工作或收入底盘”，不得在中途写成空窗期。
- 不得说用户“命里适合转行”或“今年必有转机”；只能说某类议题更容易浮到前台。
- 每个选项必须是动作，不是人格标签。
- 每个节点至少有一个前面 flag 可改写上下文或进入条件。
- 唐微提供反馈，顾言确认条款，程岚基于材料复盘，梁澄核对生活边界；四人功能不得混用。
- 结果分享必须像用户会愿意发出去的一句话，不要列“我的 3 个关键选择”，避免报告腔。

## 11. 编码落地建议

- 文件建议：`src/content/work-stories/career-switch.js`
- story id：`career_switch`
- entry：`career_switch`
- version：`0.4.2`
- initialCareerStage：`employed`
- careerStageTitles：`{ employed: '仍有收入，想换赛道' }`
- 分享文案优先取 `shareCopy` 的 hook / insight / question，不直接拼接最后三次选择。
- 接入目录时，将“想转行，但担心从头开始”作为工作岔路第四个可玩处境。

## 12. 全路径连续性审计结果

已把“每个阶段选择后，下一阶段必须至少有一个候选节点能凭事实 flag 进入”写入 `scripts/validate-career-switch.js`。审计结论：

- CS09 小项目三条选择已修复：`paid_micro_project`、`free_case_for_testimonial`、`micro_project_declined` 在第 4 幕都会进入 CS11“当前工作开始被影响”，不会再靠兜底跳到不相关节点。
- CS10 的 `fatigue_accumulated` 与 `replan_after_rest` 已补第 5 幕承接：前者通过 `tired_output_sent` 进入 CS13，后者可进入 CS13。
- CS11 的原岗位边界选择已补第 5 幕承接：`current_role_guarded`、`current_scope_talk` 可进入 CS13；`weekend_compensate` 可进入 CS15。
- CS12 的暂停路径已补第 5 幕承接：`switch_pause` 可进入 CS13 的“暂停后只带一个问题拿反馈”变体。
- 第 6 幕补齐 `junior_entry_delayed`、`feedback_parked`、`identity_block` 等承接，避免“反馈搁置/身份受挫”后突然进入无关碰撞。

当前待修条件：无。`npm run validate:career-switch` 已通过连续性、合同、目录、分享隐私与 6 结局可达性校验。
