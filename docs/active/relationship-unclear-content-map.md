# 《关系没有说清，该不该继续等》内容地图（0.5.0）

状态：已接入并通过全路径验证
入口建议：`relationship_unclear`
前台主题：关系岔路
开局事实：双方已经有持续互动或交往，但想要什么、见面怎么约、彼此有多认真，一直没有说透。
内容目标：补齐“关系岔路”第一条完整剧情。它不是恋爱测试，也不是让朋友评价“真实的你”，而是把一段暧昧/交往里反复出现的模糊事，一步步变成看得见、说得清、也能退得开的选择。

## 1. 一句话体验

用户不是完全没开始，也不是已经决定分开。真正卡住的是：对方有时很近，有时又很含糊；你们像在一起，却没有把“我们到底怎么相处”讲明白。继续等，怕自己越陷越深；直接问，又怕把关系问散。

七幕之后，系统不替用户判断“对方爱不爱你”，也不把命盘写成“注定遇到烂桃花”。它只呈现这一轮行动会把用户带到哪里：继续但说清楚、慢一点再看、把自己的时间拿回来、暂时拉开、好好收尾，或先把自己从等待里带回来。

## 2. 与关系岔路其他剧情的去重边界

| 剧情 | 本剧情不做什么 | 本剧情专门做什么 |
| --- | --- | --- |
| `relationship_repair` | 不写已经爆发的反复冲突、信任受损或修复协议 | 写“关系定义和投入节奏没说清”的早中期模糊状态 |
| `relationship_commitment` | 不写同居、订婚、长期分工、家人介入等承诺议题 | 写确认期待、见面频率、排他性、时间安排这些最低清晰度 |
| `relationship_separation` | 不假定同居、共同物品、共同债务或已经进入分开安排 | 写在是否继续投入之前，如何停止无边界等待 |
| `relationship_new_start` | 不写刚认识的新鲜感、第一次投入和筛选对象 | 写已经持续互动一段时间，模糊已经造成成本 |

禁止开局直接生成：出轨、暴力、怀孕、同居、共同债务、秘密关系、已分手、严重精神诊断。若用户现实中存在威胁、控制、暴力或被跟踪，本剧情应提示优先寻求现实安全支持，不把它当成可玩的关系选择。

## 3. 命盘参与方式

命盘只决定“这局先撞见哪类关系风险”和“哪些选项更容易被排序到前台”，不能创造对方的行为、承诺、背叛、分手或新对象。

### 3.1 三层信号

| 层 | 使用范围 | 可影响 | 不可影响 |
| --- | --- | --- | --- |
| 紫微 | 夫妻宫、福德宫、交友宫、迁移宫 | 候选节点排序：先出现“关系定义”“情绪等待”“朋友边界”“外部时间窗口” | 不能断言某人是否真心、是否会分手 |
| 八字 | 官杀/财星、印星、比劫、合冲 | 风险提示：容易过度承担、怕失去、重安全感、被同侪比较牵动 | 不能说“你命里感情一定怎样” |
| 运限 | 大限/流年对夫妻、福德、交友、迁移的激活 | 解释为什么这段时间“关系期待”更容易浮到台前 | 不能预测对方下一步动作 |

### 3.2 建议融合规则

| 规则 ID | 触发含义 | 对应节点偏向 |
| --- | --- | --- |
| `R01_clarity_first` | 夫妻宫/官杀/财星被关系议题触发 | 优先进入“说清期待、定义最低规则”的节点 |
| `R02_emotional_wait` | 福德/印星提示反复内耗与等待 | 优先进入“停止空等、恢复生活锚点”的节点 |
| `R03_peer_grounding` | 交友/比劫提示同侪反馈影响判断 | 优先进入“朋友只看事实，不替你下结论”的节点 |
| `R04_time_boundary` | 迁移/流年窗口提示时间安排变动 | 优先进入“周末、假期、共同活动截止”的节点 |
| `R05_over_give_risk` | 财星/印星/化忌类信号提示过度付出 | 优先提醒不要用更多投入换清晰答案 |
| `R06_slow_but_real` | 夫妻/福德结构显示慢热但可观察 | 优先进入“观察期、可见动作、复盘点”的节点 |

## 4. 固定人物

关系主题固定四个角色，避免用户看不懂“我是谁、对方是谁”。

| 角色 ID | 人物 | 功能 | 禁止写法 |
| --- | --- | --- | --- |
| `xu` | 许澄，对方/正在接触或交往的人 | 只能通过回复、见面、安排和约定体现态度 | 不写成反派，不替命盘证明真心或不真心 |
| `shen` | 沈知，用户信任的同侪朋友 | 帮用户把事实从脑补里拆出来 | 不替用户判断“他/她爱不爱你”，不读取隐私 |
| `lin` | 林予，外部窗口人 | 代表共同活动、假期行程、订票/预约等现实期限，只确认客观条件 | 不成为第三者，不制造新恋情 |
| `han` | 韩照，帮你捋清楚的朋友 | 只基于你说过的话、见面安排和你自己的底线，帮你看哪里没讲明白 | 不诊断人格、依恋类型或心理疾病 |

## 5. 前台筹码与隐藏账本

### 5.1 前台筹码

| 字段 | 初始建议 | 含义 |
| --- | ---: | --- |
| `clarity` | 38 | 你们到底怎么相处、怎么约、要不要只见彼此的清楚程度 |
| `reciprocity` | 42 | 这段关系是不是只有你一个人在往前走 |
| `pressure` | 48 | 等待、猜测和过度付出带来的消耗，越高越累 |

### 5.2 隐藏累计项

| 字段 | 含义 |
| --- | --- |
| `expectation_named` | 用户是否说出自己想确认的期待，而不是让对方猜 |
| `time_boundary` | 用户是否停止把整块时间留给不确定安排 |
| `consistency_seen` | 许澄是否有可观察的连续行动 |
| `avoidance_seen` | 模糊、临时、回避关键问题是否累计出现 |
| `self_anchor` | 用户自己的生活、工作、睡眠、朋友和计划是否被保住 |
| `peer_grounding` | 沈知是否帮助用户看事实，而非替用户下结论 |
| `review_material` | 是否留下回头能看的材料：说过什么、约了什么、什么时候该确认 |
| `over_give_risk` | 是否想用更多付出去换一个清楚答案 |
| `public_step` | 公开、见朋友、过节等行为是否被说清含义 |
| `close_loop_ready` | 是否具备体面收口或拉开的事实依据 |

## 6. 七幕结构

| 幕 | 阶段 ID | 功能 | 候选节点 |
| --- | --- | --- | --- |
| 1 | `facts` | 把“说不清”落成具体事实 | `RU01–RU03` |
| 2 | `first_move` | 第一次表达期待、时间边界或事实核对 | `RU04–RU06` |
| 3 | `response` | 看许澄如何回应，而不是只听一句话 | `RU07–RU09` |
| 4 | `cost` | 等待、过度投入或说清后的代价显形 | `RU10–RU12` |
| 5 | `outside_window` | 共同活动、公开步骤、用户生活安排带来现实期限 | `RU13–RU15` |
| 6 | `collision` | 模糊与投入不能同时继续升级 | `RU16–RU18` |
| 7 | `landing` | 未来 4–8 周落点 | `RU19–RU21` |

## 7. 节点与选项

效果记法：

- `C` = 清晰度 `clarity`
- `R` = 对等感 `reciprocity`
- `P` = 消耗 `pressure`，上升代表更累
- `Rel(x)` = 对人物信任变化
- `route` = 结局路线权重
- `flag -> consumeBy` = 延迟标记及消费点

### 第一幕｜事实落地

#### RU01｜你们聊得很多，但关系没有名字

情境：许澄会分享日常，也会在某些晚上聊到很晚。可一到“我们现在算什么”“接下来怎么安排”，话题就变轻了。
冲突：继续凭感觉走，还是先把模糊变成可确认的问题。
命盘优先：`R01_clarity_first`、`R02_emotional_wait`。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 写下你最想确认的 3 件事：期待、频率、是否排他 | 模糊变成三个问题，你没有立刻逼问，但知道自己要问什么。 | `expectation_list -> RU04`，route: clarity+2 | C+5 R0 P-1 |
| 继续等许澄主动定义关系 | 你保住轻松感，也把主动权继续交给对方。 | `wait_for_definition -> RU06`，route: slow_wait+2 | C-1 R0 P+3 |
| 约一次轻松见面，只看对方会不会提前把时间定下来 | 你不急着谈定义，先看对方是不是真的愿意留出时间。 | `low_stakes_invite -> RU05`，route: slow_probe+2 | C+2 R+1 P+1 |

#### RU02｜亲近是真的，忽冷忽热也是真的

情境：许澄有时很靠近，有时又几天不主动。你能找到很多解释：忙、累、不善表达，但解释越多，你越分不清事实。
冲突：把波动算作关系常态，还是先记录可观察行为。
命盘优先：`R02_emotional_wait`、`R05_over_give_risk`。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 只记录三次具体事实：谁约、何时确认、是否兑现 | 你开始用行为看关系，不再只靠聊天温度。 | `pattern_log -> RU06`，Rel(沈知)+1，route: clarity+2 | C+4 R0 P-2 |
| 直接准备一次谈话：不问爱不爱，只问能否说清节奏 | 问题变得不那么戏剧化，也更难被一句“想太多”带走。 | `direct_talk_ready -> RU04`，route: clarity+2 | C+4 R0 P+1 |
| 停止过度补位，先把本周自己的安排排满 | 你没有冷处理对方，只是不再给不确定预留整块生活。 | `own_week_kept -> RU05`，route: self_anchor+2 | C+1 R0 P-4 |

#### RU03｜你们像在一起，却没有共同安排

情境：日常亲近已经超过普通朋友，但周末、节日、下一次见面总是临时决定。你想进一步，又怕自己先开口显得太重。
冲突：亲近是不是就代表对方真的在往前走。
命盘优先：`R04_time_boundary`、`R06_slow_but_real`。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 提出一个两周内的具体见面安排，并要求提前确认 | 关系从气氛落到日程，许澄需要给出行动回应。 | `specific_plan_asked -> RU05`，route: time_boundary+2 | C+3 R+1 P+1 |
| 先说清你不接受临时召唤式见面 | 你没有要求承诺，只给自己的时间设了底线。 | `last_minute_boundary -> RU05`，route: boundary+2 | C+4 R0 P-2 |
| 继续享受当下亲近，暂时不碰安排问题 | 气氛没被打断，但关系成本继续留在你这里。 | `arrangement_avoided -> RU06`，route: slow_wait+2 | C-1 R+1 P+3 |

### 第二幕｜第一次动作

#### RU04｜你准备第一次把期待说出口

进入条件：`expectation_list` 或 `direct_talk_ready`。
情境：你不是要许澄立刻给结论，而是想知道双方是否愿意把关系节奏说清。
冲突：清楚表达与害怕失去轻松感。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 用“我希望知道我们接下来怎么相处”开场，并约一个完整谈话时间 | 话题被放到桌面上，许澄不能只靠玩笑带过。 | `clear_talk_scheduled -> RU07`，Rel(韩照)+1，route: clarity+3 | C+6 R0 P+1 |
| 只问未来两周见面频率，不碰关系名称 | 问题更轻，也能先看行动是否稳定。 | `two_week_rhythm_asked -> RU07, RU08`，route: slow_probe+2 | C+4 R+1 P0 |
| 觉得时机不对，先把话咽回去 | 这次气氛保住了，但你会继续在心里演练。 | `talk_swallowed -> RU09`，route: slow_wait+2 | C-1 R0 P+4 |

#### RU05｜一次周末安排变成现实测试

进入条件：`low_stakes_invite`、`specific_plan_asked`、`last_minute_boundary` 或 `own_week_kept`。
情境：你提出周末见面或共同活动。许澄没有拒绝，但也没有马上定下来。
冲突：给对方空间，还是给自己一个最晚确认点。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 说清最晚确认时间，过点就改成自己的安排 | 你给关系留空间，也不给等待无限续费。 | `confirmation_deadline_set -> RU08`，route: boundary+3 | C+5 R0 P-2 |
| 接受临时决定，反正见到就好 | 你降低了眼前摩擦，也让自己的时间继续被动。 | `last_minute_accepted -> RU08`，route: slow_wait+2 | C-1 R+1 P+3 |
| 同步告诉许澄：你本周也有自己的计划，需要提前约 | 你没有否定关系，只是让对方知道你的时间也很重要。 | `advance_notice_required -> RU08`，route: self_anchor+2 | C+3 R0 P-3 |

#### RU06｜沈知问你：这些判断有事实吗

进入条件：`wait_for_definition`、`pattern_log` 或 `arrangement_avoided`。
情境：沈知没有替你判断许澄，只让你把“对方是不是认真”拆成几件看得见的事：会不会提前约、说了算不算、愿不愿意聊清楚。
冲突：朋友的支持，是帮你看事实，不是替你下结论。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 请沈知只看行为记录，不评价许澄的人品 | 你得到外部视角，又没有把隐私交给别人裁判。 | `peer_fact_check -> RU09`，Rel(沈知)+2，route: clarity+2 | C+4 R0 P-2 |
| 让沈知帮你列出“再这样我会很难受”的三件事 | 难受不再只是一团情绪，你知道自己最卡在哪里。 | `bottom_line_drafted -> RU09`，Rel(沈知)+1，route: boundary+2 | C+5 R0 P-1 |
| 不想看记录，先把这件事从脑子里关掉 | 压力暂时下降，关系事实仍然没有被处理。 | `evidence_avoided -> RU09`，route: self_anchor+1 slow_wait+1 | C-2 R0 P-3 |

### 第三幕｜即时回响

#### RU07｜许澄愿意谈，但说“不想被定义绑住”

进入条件：`clear_talk_scheduled` 或 `two_week_rhythm_asked`。
情境：许澄没有逃走，也没有给明确关系名称。对方说现在相处很好，不想因为定义让关系变沉。
冲突：不急着要名分，但也不能把自己的需要一直压回去。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 不追问关系名称，只问三件事：怎么联系、怎么见面、要不要只见彼此 | 话题没那么重了，但也不是继续含糊。 | `minimum_rules_asked -> RU10`，Rel(许澄)+1，route: clarity+3 | C+6 R+1 P+1 |
| 接受暂时不下定义，但说好两周后再看一次 | 慢下来不是放弃，你只是让“再看看”有个时间点。 | `observation_period_set -> RU10`，route: slow_probe+3 | C+4 R+1 P-1 |
| 怕把关系聊重，主动说“没事，就这样也挺好” | 气氛轻了，你的真实期待也被你自己收回去了。 | `back_to_ambiguity -> RU12`，route: slow_wait+2 | C-2 R+1 P+4 |

#### RU08｜周末快到了，许澄还是说“再看”

进入条件：`two_week_rhythm_asked`、`confirmation_deadline_set`、`last_minute_accepted` 或 `advance_notice_required`。
情境：许澄没有明确拒绝，但到了你需要安排自己生活的时候，对方仍没有确认。
冲突：等待是否继续占用整块周末。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 到约定时间还没确认，就把周末改成自己的安排 | 你不是报复，只是不再把周末一直空着。 | `deadline_enforced -> RU11`，route: boundary+3 | C+4 R0 P-4 |
| 继续空着周末，等许澄最后消息 | 你保留见面的可能，也把失望风险留给自己。 | `weekend_reserved_wait -> RU11`，route: slow_wait+2 | C-1 R0 P+5 |
| 这次可以临时见，但说好下次至少提前一天定 | 你给了这次空间，也把下次怎么约说在前面。 | `one_time_flex_rule -> RU10`，route: slow_probe+2 | C+3 R+1 P+1 |

#### RU09｜沈知看完事实说：你在替许澄补解释

进入条件：`talk_swallowed`、`peer_fact_check`、`bottom_line_drafted` 或 `evidence_avoided`。
情境：无论你是把话咽回去、请沈知看记录，还是暂时不想看事实，沈知都只提醒一件事：别急着给许澄扣帽子，也别替对方把缺口补圆。
冲突：不把对方妖魔化，也不替对方承担所有模糊。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 先别猜许澄怎么想，只看两周里有没有主动、有没有做到 | 你把判断从猜心拉回现实。 | `behavior_count_started -> RU10`，Rel(沈知)+1，route: clarity+2 | C+5 R0 P-2 |
| 发一段长消息，把这段时间的委屈一次说完 | 情绪终于有出口，但对方可能只安慰你，却还是不说接下来怎么办。 | `long_emotion_message -> RU12`，route: risky_release+2 | C+1 R0 P+3 |
| 先暂停主动三天，把注意力放回工作和休息 | 你不是惩罚许澄，而是停止让等待占满生活。 | `contact_pause_for_anchor -> RU11`，route: self_anchor+2 | C+1 R0 P-5 |

### 第四幕｜代价显形

#### RU10｜谈完以后，轻松感没有立刻回来

进入条件：`minimum_rules_asked`、`observation_period_set`、`one_time_flex_rule` 或 `behavior_count_started`。
情境：关系被说清一点后，你反而更敏感：许澄下一次行动会不会兑现，变得更重要。
冲突：谈过以后，要看行动，而不是每天反复确认。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 把刚聊过的事落成两周内能看到的动作，不每天追问 | 你给这段关系一点时间，也不给自己制造审讯感。 | `two_week_actions_written -> RU13, RU14`，Rel(韩照)+1，route: slow_probe+3 | C+5 R+1 P-1 |
| 对许澄更好一点，希望对方自然更认真 | 亲近可能增加，但答案不一定会变清楚。 | `over_give_started -> RU15`，route: over_give+2 | C-1 R+1 P+5 |
| 找韩照帮你听一遍：我是在好好说，还是像在逼答案 | 你把话说得更稳，不用靠逼问推进关系。 | `conversation_reviewed -> RU14`，Rel(韩照)+2，route: boundary+2 | C+4 R0 P-3 |

#### RU11｜你发现自己一直在给不确定留时间

进入条件：`deadline_enforced`、`weekend_reserved_wait` 或 `contact_pause_for_anchor`。
情境：工作、睡眠、朋友局都能被你挪开，只为了等许澄一个可能的安排。你没有崩溃，但生活开始围着不确定转。
冲突：继续空出自己，还是重新建立生活锚点。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 每周只留一个可以临时约的时间，其余按自己的计划走 | 你没有关门，只是不再无限待命。 | `availability_window_set -> RU15`，route: self_anchor+3 | C+3 R0 P-5 |
| 继续随叫随到，想着再等等也许就清楚了 | 你会得到偶尔的甜，也会继续被临时安排牵着走。 | `always_available -> RU15`，route: slow_wait+2 over_give+1 | C-2 R+1 P+5 |
| 这一周先不主动约，只回应说得清时间地点的邀请 | 互动会降温一点，但真实节奏也更容易被看见。 | `clear_invites_only -> RU15`，route: boundary+2 | C+2 R0 P-4 |

#### RU12｜亲近还在，但关键问题仍被绕开

进入条件：`back_to_ambiguity` 或 `long_emotion_message`。
情境：许澄仍会关心你，也会制造亲近时刻。但当你碰到安排、频率或期待，对方又转回“别想太多”。
冲突：亲近不等于清晰，清晰也不等于逼迫。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 直接说：我珍惜这些亲近，但我也需要知道我们怎么相处 | 你没有否定关系里的好，只是不让好掩盖没说清的部分。 | `intimacy_rule_split -> RU14`，route: clarity+2 boundary+1 | C+5 R0 P-1 |
| 把亲近当成关系会变好的信号，继续等 | 这条路短期舒服，长期要承担更高不确定。 | `intimacy_as_promise -> RU14`，route: slow_wait+3 | C-2 R+1 P+4 |
| 在没说清前，先不留宿、不空出整晚、不取消自己的事 | 你把自己的时间先放回手里。 | `no_escalation_before_clarity -> RU15`，route: boundary+3 | C+4 R0 P-4 |

### 第五幕｜外部窗口

#### RU13｜林予发来一个共同活动的截止时间

进入条件：`two_week_actions_written`。
情境：林予负责一个周末活动/短途预约/朋友局报名，名额或费用有截止。它不是关系考验，只是把“要不要一起安排”推到现实时间表上。
冲突：用外部截止逼清楚，还是让安排只在确认后发生。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 许澄确认了再报名，没确认就算了 | 共同安排要两个人都点头，不能总是你先兜底。 | `booking_guard_kept -> RU16`，Rel(林予)+1，route: boundary+2 | C+4 R0 P-2 |
| 先替两个人订下，免得错过机会 | 你保住可能性，也把风险和费用先揽到自己身上。 | `prepaid_to_hold -> RU17`，route: over_give+2 | C-1 R+1 P+5 |
| 不参加这次活动，把它当作观察期里的一个样本 | 你少了一个推进机会，但也少了被截止牵着走。 | `outside_option_declined -> RU18`，route: self_anchor+2 | C+1 R0 P-3 |

#### RU14｜许澄突然提出见朋友或一起过节

进入条件：`two_week_actions_written`、`conversation_reviewed`、`intimacy_rule_split` 或 `intimacy_as_promise`。
情境：许澄给出一个看起来更近的动作：见朋友、一起过节、发合照，或者进入对方的社交场。
冲突：公开动作是不是关系清晰度。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 先问一句：这只是一起玩，还是我们真的往前走一步 | 你没有扫兴，只是避免把一个动作自动当成承诺。 | `public_step_defined -> RU16`，route: clarity+3 | C+5 R+1 P0 |
| 很开心直接答应，心里默认这是关系在变近 | 你会很开心，但你们对这一步的理解可能并不一样。 | `public_step_accepted_unclear -> RU17`，route: slow_wait+2 | C+1 R+3 P+2 |
| 先不去见朋友，说明没说清前你会不自在 | 你的意思很清楚，也可能让许澄感觉被挡了一下。 | `public_step_refused -> RU18`，route: boundary+2 | C+3 R-1 P-1 |

#### RU15｜你的生活里也出现了一个重要安排

进入条件：`over_give_started`、`availability_window_set`、`always_available`、`clear_invites_only` 或 `no_escalation_before_clarity`。
情境：朋友聚会、工作节点、家人约定或自己的计划已经排上日程。许澄这时又发来一个临时邀约。
冲突：你在乎这段关系，也不能每次都把自己的生活往后挪。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 说自己今天已有安排，并给出下一个能见的时间 | 你没有冷掉关系，也没有取消自己。 | `alternative_time_offered -> RU16`，route: self_anchor+3 | C+3 R0 P-4 |
| 推掉自己的安排，先见许澄 | 亲近机会被保住，但你的生活又一次被往后挪。 | `self_plan_sacrificed -> RU17`，route: over_give+2 | C-1 R+1 P+5 |
| 不解释，直接晚回或消失 | 你躲开了当下冲突，却制造新的误解。 | `silent_withdrawal -> RU18`，route: risky_release+2 | C-2 R-2 P+1 |

### 第六幕｜不可两全

#### RU16｜过了两周，许澄做到了一部分

进入条件：`booking_guard_kept`、`public_step_defined` 或 `alternative_time_offered`。
情境：许澄不是完全没有行动：会提前约，也有主动联系。但还有一块没讲明白。
冲突：做到一半，是可以继续，还是还不能把自己全放进去。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 再给四周，但只按已经做到的部分继续 | 关系可以继续，但不靠想象加码。 | `partial_continue_with_rules -> RU19`，route: slow_probe+4 | C+4 R+2 P-1 |
| 把这一半当成关系稳定了，自己先往前冲 | 你推进很快，但可能把还没说清的部分跳过去。 | `premature_escalation -> RU21`，route: over_give+3 | C+1 R+3 P+4 |
| 说明现在还不够让你继续往前，先保持现在的距离 | 你没有否定进展，只是不想用半清楚换全部认真。 | `not_enough_to_escalate -> RU20`，route: boundary+3 | C+3 R0 P-2 |

#### RU17｜许澄不愿给清楚答案，又不想你离开

进入条件：`prepaid_to_hold`、`public_step_accepted_unclear` 或 `self_plan_sacrificed`。
情境：许澄会挽留、会亲近、会说“不想失去你”，但一谈到怎么约、怎么相处、要不要只见彼此，又绕开了。
冲突：一句不舍是否足够支撑你继续等待。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 最后问一次：怎么联系、怎么见面、要不要只见彼此 | 这不是逼承诺，而是问这段关系能不能别再一直含糊。 | `minimum_rules_final -> RU19, RU20`，route: clarity+3 boundary+2 | C+6 R0 P+1 |
| 接受“顺其自然”，暂时不再追问 | 关系保留原样，你也接受继续承担不确定。 | `vague_nature_accepted -> RU21`，route: slow_wait+3 | C-2 R+1 P+4 |
| 不再来回拉扯，只留一次好好收尾的话 | 你不再要求对方立刻给答案，而是停止被模糊牵着走。 | `close_unclear_loop -> RU20`，route: close_loop+4 | C+4 R-1 P-4 |

#### RU18｜韩照帮你看明白：你不是怕慢，是怕一直没个说法

进入条件：`outside_option_declined`、`public_step_refused` 或 `silent_withdrawal`。
情境：韩照不判断许澄是什么人，只看你带来的几件事：最让你难受的，不是关系慢，而是每次都没有准话、没有提前量、也不知道这份亲近算什么。
冲突：最后再说清一次，还是先把自己从这件事里拉出来。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 写下 3 件你不能再忍的事，和许澄最后说清一次 | 你把选择权收回来：能说清就继续，说不清就收口。 | `final_calibration_ready -> RU19, RU20`，Rel(韩照)+2，route: boundary+3 clarity+2 | C+6 R0 P-2 |
| 不再讨论，直接慢慢淡出 | 冲突少了，但未说完的话可能留下尾巴。 | `fade_out_started -> RU21`，route: self_anchor+1 close_loop+1 | C+1 R-2 P-2 |
| 先恢复生活秩序，再决定要不要谈最后一次 | 你没有急着分，也没有继续等；先让自己回到能判断的位置。 | `self_reset_before_decide -> RU20, RU21`，route: self_anchor+3 | C+2 R0 P-6 |

### 第七幕｜未来 4–8 周落点

#### RU19｜这段关系可以继续，但不能再只靠感觉

进入条件：`partial_continue_with_rules`、`minimum_rules_final` 或 `final_calibration_ready`。
情境：你不是为了赢一次谈话，而是要决定接下来 4–8 周怎么相处。
冲突：可以继续，但不能再靠猜。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 继续相处，但把怎么联系、怎么约、什么时候再看写清楚 | `ending_clear_continue`：这段关系不是靠猜变稳，而是终于有了能做到的说法。 | `ending_clear_continue -> ending_clear_continue`，route: clear_continue+6 | C+8 R+3 P-3 |
| 慢一点，只保留固定联系和一个月后的再看时间 | `ending_slow_probe`：你没有逼关系立刻定型，也不再无限等下去。 | `ending_slow_probe -> ending_slow_probe`，route: slow_probe+6 | C+5 R+1 P-4 |
| 继续亲近，但不再接受“今天突然叫你就得去” | `ending_boundary_repair`：你保留关系里的好，也把自己的时间拿回来。 | `ending_boundary_repair -> ending_boundary_repair`，route: boundary_repair+6 | C+6 R+1 P-5 |

#### RU20｜这段关系要先拉开一点，才看得清

进入条件：`not_enough_to_escalate`、`minimum_rules_final`、`close_unclear_loop`、`final_calibration_ready` 或 `self_reset_before_decide`。
情境：关系并非一定要结束，但继续原样会让你更累。现在要决定是拉开、收口，还是先恢复自己。
冲突：不把拉开当惩罚，也不把继续等当善良。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 先不再往前走，保留普通联系，四周后只看行动 | `ending_step_back`：你不是冷暴力，只是从含糊里退到能看清的位置。 | `ending_step_back -> ending_step_back`，route: step_back+6 | C+5 R-1 P-5 |
| 体面收口：说清感谢、遗憾和不再继续暧昧 | `ending_close_loop`：你没有逼出答案，而是停止把自己交给模糊。 | `ending_close_loop -> ending_close_loop`，route: close_loop+6 | C+6 R-2 P-6 |
| 先不做关系决定，睡好觉，把自己的安排找回来 | `ending_self_reset`：这轮最重要的不是选对方，而是把自己带回来。 | `ending_self_reset -> ending_self_reset`，route: self_reset+6 | C+3 R0 P-9 |

#### RU21｜如果这一轮仍然说不清，也要把等待变成决定

进入条件：`premature_escalation`、`vague_nature_accepted`、`fade_out_started` 或 `self_reset_before_decide`。
情境：你可能还舍不得，也可能还想再等等。但如果继续等，就要承认这是一个会消耗你的选择，而不是一句“还没到时候”。
冲突：延后决定与逃避决定。

| 选项 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 给自己最后 30 天观察期，只看三条行为指标 | `ending_slow_probe`：你保留可能性，但把等待变成有期限的观察。 | `ending_slow_probe -> ending_slow_probe`，route: slow_probe+5 | C+4 R0 P-4 |
| 不再像恋人一样付出，先回到普通朋友或低频联系 | `ending_step_back`：你没有制造戏剧化分开，只是把过量付出收回来。 | `ending_step_back -> ending_step_back`，route: step_back+5 | C+4 R-1 P-6 |
| 承认这轮模糊已经伤到你，先把生活秩序拿回来 | `ending_self_reset`：关系暂时不做大判断，人先回到可判断状态。 | `ending_self_reset -> ending_self_reset`，route: self_reset+6 | C+2 R0 P-9 |

## 8. 六个结局

### `ending_clear_continue`｜继续，但终于说清楚

- 核心：你们不是靠气氛继续，而是把怎么联系、怎么见面、要不要只见彼此讲清楚。
- 得到：关系还有空间，也有接下来能看见的动作。
- 代价：少了一点“顺其自然”的浪漫，但少了很多猜。
- 下一步：写下 4 周后再看一次，只看说过的话有没有做到。
- 分享钩子：我没有问“你到底爱不爱我”，我只问这段关系能不能别再靠猜。
- 分享洞见：真正让我安心的不是一句好听的话，是对方愿不愿意把话落到时间上。
- 分享问题：如果一段关系还没名字，你会先要一个答案，还是先把怎么相处说清？

### `ending_slow_probe`｜放慢观察

- 核心：你暂时不逼关系定型，但把等待限制在一个周期里。
- 得到：可能性被保留，消耗被降低。
- 代价：短期仍有不确定，而且必须看行动，不能继续靠感觉续命。
- 下一步：设定 30 天，只看三件事：会不会主动、会不会提前约、愿不愿意聊清楚。
- 分享钩子：我决定再看 30 天，但这次不是没完没了地等。
- 分享洞见：慢不是问题，一直没有期限的慢才会把人拖空。
- 分享问题：你能接受一段关系慢慢来吗？前提是它有一个明确的再看时间。

### `ending_boundary_repair`｜把自己的时间拿回来

- 核心：你承认关系里有亲近，也承认自己被临时邀约和“再看”消耗了。
- 得到：关系不必马上结束，但你的时间先回到自己手里。
- 代价：许澄可能需要适应新的相处方式，亲近节奏会短暂变慢。
- 下一步：不取消自己的安排、不替对方先付不确定的成本、不用更多体贴换答案。
- 分享钩子：我没有冷掉，只是不再把整块生活留给一句“再看”。
- 分享洞见：把时间拿回来，不是惩罚对方，是不想靠透支维持亲近。
- 分享问题：如果你很喜欢一个人，还能不随叫随到吗？

### `ending_step_back`｜暂时拉开

- 核心：你不急着分开，也不继续往前冲；先把关系退回能看清的位置。
- 得到：你能看见对方是否会在没有你补位时仍然行动。
- 代价：亲近会减少，失落感会出现。
- 下一步：保留普通联系，暂停像恋人一样付出和临时见面，四周后只看行动。
- 分享钩子：我没有逼一个答案，只是从暧昧里往后退了一步。
- 分享洞见：有时候退一步不是放弃，是终于能看清谁在往前走。
- 分享问题：如果你停止主动补位，对方还会往前走吗？

### `ending_close_loop`｜体面收口

- 核心：你不再把自己留在说不清的关系里，选择用一次好好说话结束暧昧式沟通。
- 得到：等待停止，生活重新打开。
- 代价：会有遗憾，也可能短期反复想起。
- 下一步：只说事实、感谢和自己的决定，不评价对方人品，也不追问最后答案。
- 分享钩子：我没有等到一个明确答案，所以我给了自己一个明确结尾。
- 分享洞见：有些关系不是坏到必须离开，而是模糊到不能继续认真下去。
- 分享问题：你会为了一个没说出口的可能性，继续留在原地吗？

### `ending_self_reset`｜先把自己带回来

- 核心：这一轮关系选择先暂停，因为你的睡眠、工作、朋友和自我节奏已经被等待挤压。
- 得到：判断力恢复，关系不再占据全部注意力。
- 代价：短期不会有关系结论，也要忍受“先不解决”的空档。
- 下一步：连续两周恢复固定作息和自己的安排，再决定要不要最后谈一次。
- 分享钩子：我这次没有选对方，也没有选分开，我先把自己从等待里带回来。
- 分享洞见：状态很乱的时候，大决定常常不是答案，而是焦虑在找出口。
- 分享问题：如果一段关系让你不像自己了，你会先解决关系，还是先找回自己？

## 9. Flag 生产-消费账本

| 生产阶段 | 关键 flags | 主要消费点 |
| --- | --- | --- |
| 第一幕 | `expectation_list`、`wait_for_definition`、`low_stakes_invite`、`pattern_log`、`direct_talk_ready`、`own_week_kept`、`specific_plan_asked`、`last_minute_boundary`、`arrangement_avoided` | 第二幕 `RU04–RU06` |
| 第二幕 | `clear_talk_scheduled`、`two_week_rhythm_asked`、`talk_swallowed`、`confirmation_deadline_set`、`last_minute_accepted`、`advance_notice_required`、`peer_fact_check`、`bottom_line_drafted`、`evidence_avoided` | 第三幕 `RU07–RU09` |
| 第三幕 | `minimum_rules_asked`、`observation_period_set`、`back_to_ambiguity`、`deadline_enforced`、`weekend_reserved_wait`、`one_time_flex_rule`、`behavior_count_started`、`long_emotion_message`、`contact_pause_for_anchor` | 第四幕 `RU10–RU12` |
| 第四幕 | `two_week_actions_written`、`over_give_started`、`conversation_reviewed`、`availability_window_set`、`always_available`、`clear_invites_only`、`intimacy_rule_split`、`intimacy_as_promise`、`no_escalation_before_clarity` | 第五幕 `RU13–RU15` |
| 第五幕 | `booking_guard_kept`、`prepaid_to_hold`、`outside_option_declined`、`public_step_defined`、`public_step_accepted_unclear`、`public_step_refused`、`alternative_time_offered`、`self_plan_sacrificed`、`silent_withdrawal` | 第六幕 `RU16–RU18` |
| 第六幕 | `partial_continue_with_rules`、`premature_escalation`、`not_enough_to_escalate`、`minimum_rules_final`、`vague_nature_accepted`、`close_unclear_loop`、`final_calibration_ready`、`fade_out_started`、`self_reset_before_decide` | 第七幕/结局 |

## 10. 全路径连续性思想审计

### 10.1 阶段连续性

- 第一幕 9/9：每个选择只承接第二幕 `RU04–RU06`。例如 `wait_for_definition` 进入 RU06，用户不会跳到已经沟通后的节点。
- 第二幕 9/9：每个选择只承接第三幕 `RU07–RU09`。例如 `talk_swallowed` 进入 RU09，不会直接进入内耗成本或结局。
- 第三幕 9/9：每个选择只承接第四幕 `RU10–RU12`。例如 `back_to_ambiguity` 进入 RU12，保持“退回暧昧”的事实连续。
- 第四幕 9/9：每个选择只承接第五幕 `RU13–RU15`。例如 `over_give_started` 进入 RU15，不再用同幕 RU12 或第六幕 RU17 当主承接。
- 第五幕 9/9：每个选择只承接第六幕 `RU16–RU18`。例如 `prepaid_to_hold` 进入 RU17，不直接跳到 RU21。
- 第六幕 9/9：每个选择只承接第七幕 `RU19–RU21`，进入最终 4–8 周落点。

### 10.2 事实门槛

- RU07 只吃第二幕表达类事实：`clear_talk_scheduled`、`two_week_rhythm_asked`。
- RU08 只吃第二幕安排类事实：`two_week_rhythm_asked`、`confirmation_deadline_set`、`last_minute_accepted`、`advance_notice_required`。
- RU13 只吃第四幕已经写下行动观察点的事实：`two_week_actions_written`。
- RU14 只吃第四幕亲近/公开含义需要说明的事实：`two_week_actions_written`、`conversation_reviewed`、`intimacy_rule_split`、`intimacy_as_promise`。
- RU17 只吃第五幕“你先揽成本/关系看似推进但仍不清楚”的事实：`prepaid_to_hold`、`public_step_accepted_unclear`、`self_plan_sacrificed`。
- RU20 只吃第六幕明确不足、收口、最后确认或先停下来的事实：`not_enough_to_escalate`、`minimum_rules_final`、`close_unclear_loop`、`final_calibration_ready`、`self_reset_before_decide`。

### 10.3 敏感安全审计

- 没有鼓励操控、跟踪、偷窥、逼供、冷暴力或冲动分手。文案中的“暂停主动”“拉开”均定义为恢复生活边界或普通联系，不写成惩罚对方。
- 不诊断许澄的人格、依恋类型、心理问题，也不让沈知或韩照替用户判定“真心/不真心”。
- 不把命盘当作事实来源；命盘只排序“清晰、等待、边界、外部时间窗口”等风险。
- 不假定高风险事实：没有出轨、暴力、怀孕、同居、共同债务、秘密关系或新对象。

### 10.4 当前未解决风险

- 编码时要给 `relationship_unclear` 单独验证脚本，检查 21 节点、63 选择、6 结局、stage 连续性、shareCopy 隐私和 `flag -> consumeBy` 完整性。
- 关系题材比工作题材更容易被用户带入现实高风险关系。落地页建议在入口前加一行轻提示：若存在威胁、控制、暴力或人身安全风险，请优先联系可信现实支持，本体验不处理安全危机。
- 文案要保持“你是你，许澄是对方”，不要在 UI 简写里把用户和许澄混成同一个人。

## 11. 编码落地建议

- 文件建议：`src/content/work-stories/relationship-unclear.js` 或后续改名为通用 `src/content/life-stories/relationship-unclear.js`。
- story id：`relationship_unclear`
- entry：`relationship_unclear`
- version：`0.4.x`
- theme：`relationship`
- 前台标题：《关系没有说清，该不该继续等》
- 前台副标题：不是问对方爱不爱你，而是看这段关系能不能从暧昧、临时和等待里，走到一句说得清的话。
- 分享文案优先取六个结局的 `分享钩子 / 分享洞见 / 分享问题`，不要拼接“我的 3 个关键选择”。
