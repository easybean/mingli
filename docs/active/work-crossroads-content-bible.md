# 第一季「工作岔路」内容圣经（0.1.0）

最后更新：2026-08-14
状态：0.1.0 纵向切片内容基线
适用范围：《工作空窗期》内容、命理触发、数据建模与 H5 编码

> 本文是 `product-roadmap-choice-sandbox.md` 的第一份内容落地稿。0.1.2 对外主题名统一为《工作空窗期》，内部仍保留 `unemployed_month_five` ID 兼容已有存档；其他七个入口暂不扩写。

## 1. 内容总纲

### 1.1 一句话体验

用户处在工作空窗期，只剩约三个月安全余量，同时遇到一份降薪 Offer、一个前同事带来的付费试做机会，以及生活里必须面对的支出。七次决定之后，系统不判输赢，而是呈现：用户保住了什么、押上了什么，以及这轮走法是在顺着还是偏离自己的命盘惯性。

### 1.2 不可退让的创作原则

1. **命盘决定局，选择决定走法。** 至少有一项八字结构、一项紫微领域信号和一项当前运限信号参与节点排序或变体，不能只在结局贴命理解释。
2. **先写现实约束，再写命理依据。** 用户先看见钱、时间、职责和关系；命理依据放在“为什么出现这个局”中。
3. **选项必须是可执行动作。** 允许接受、拒绝、议价、求证、拆小试验、求助、暂停；不出现“主动 / 稳健 / 修复”三分法。
4. **每个选择都要换东西。** 没有同时增加现金、机会、关系、稳定和身心的完美答案。
5. **后果要回来。** 每个节点至少有一个选择生成的标记，在后两幕改变人物态度、可用选项、反馈或结局质量。
6. **不做绝对预测。** 命理表达使用“更容易把注意力放在……”“这段时间……更容易浮到前台”“如果继续这样选，代价可能是……”。
7. **不羞辱低谷。** 接受降薪、求助、休整、暂时回家或做短单都不是失败。
8. **不替现实作决定。** 结果页给一个低风险验证动作，不给“你必须入职 / 创业 / 转行”的结论。

### 1.3 0.1.0 内容边界

- 1 个入口：`job_lost`；
- 1 个剧本：`unemployed_month_five`；
- 7 个叙事阶段，单局每阶段进入 1 个节点；
- 21 个可玩事件节点，每个节点 3 个动作选项；
- 4 个主要人物；
- 6 个路线结局，每个结局有质量变体；
- 首轮不采集工资、公司、债务等真实敏感数据；
- 剧中金额采用“月必要支出 / 安全余量月数”的相对表达；
- 不接大模型实时生成，不允许运行时自由续写。

## 2. 剧本世界与共同事实

### 2.1 用户开局

以下事实对所有玩家一致，便于分支汇流：

- 用户正处在工作空窗期，具体时长不由命盘或系统替用户推断；
- 空窗期间投过简历，也做过零散准备，并非什么都没做；
- 当前可支配资金约等于三个月必要开支；
- 一家公司给出书面 Offer，固定薪资约为上一份工作的 82%，答复期限 48 小时；
- Offer 没有明显违法或骗局信息，但岗位、城市或权责至少有一项不理想；
- 旧同事周屿正在验证一个小项目，尚不能提供长期保障；
- 用户仍保留一份过去项目的可展示成果，但没有完整整理；
- 七幕发生在约六周内，避免“今天一个 Offer，明天就创业成功”的失真节奏。

### 2.2 前台三项筹码

| 前台筹码 | 初始值 | 含义 | 对底层 `lifeState` 的主要映射 |
| --- | ---: | --- | --- |
| 安全余量 `runway` | 55 | 现金、稳定收入和可承受的等待时间 | `stability`、`resources`，反向参考 `pressure` |
| 机会窗口 `optionality` | 45 | 可选择的岗位、项目、作品曝光和谈判空间 | `opportunity`、`resources`、`relationship` |
| 身心负荷 `load` | 42 | 当前消耗；数值越高越吃力 | `pressure`，反向参考 `wellbeing` |

前台不显示精密财务预测。筹码只表达相对变化，并在每幕反馈中用“多撑出一点时间”“多了一个可验证的机会”“睡眠开始受影响”等生活语言说明。

### 2.3 隐藏累计项

| ID | 含义 | 典型来源 |
| --- | --- | --- |
| `employment_commitment` | 对固定工作的实际承诺 | 签约、入职准备、接受排他要求 |
| `negotiation_leverage` | 有证据支撑的议价筹码 | 拆职责、补作品、拿到另一选择 |
| `portfolio_proof` | 可被外部验证的专业证明 | 整理案例、完成试做、获得推荐 |
| `independent_income` | 非固定工作的已验证收入 | 短单、付费试做、客户预付款 |
| `learning_commitment` | 对新方向的有效投入 | 有期限课程、作品验证、同行访谈 |
| `support_debt` | 使用亲友支持产生的现实与心理负担 | 借住、借款、长期代付 |
| `trust_zhou` | 周屿对用户可靠性的判断 | 明确边界、兑现交付、临时退出 |
| `trust_gu` | 顾言对用户职业判断与沟通的判断 | 议价方式、准时答复、反复变更 |
| `trust_cheng` | 程岚愿意背书的程度 | 提交具体材料、兑现承诺 |
| `trust_liang` | 梁澄对共同生活安排的信任 | 公开预算、共同定期限、隐瞒压力 |
| `recovery` | 睡眠、节奏和判断力恢复程度 | 休整、减少并行任务、求助 |

累计项不直接作为人格标签。结局只说“这一轮你连续做了……”，不说“你就是……型的人”。

## 3. 主要人物

### 3.1 顾言｜招聘负责人

- 身份：中型企业招聘负责人，负责那份 82% 薪资 Offer；
- 目标：尽快补齐岗位，又不愿超出部门预算；
- 能给的：书面岗位、薪资结构、试用期信息、部分议价空间；
- 不能给的：公司未来绝对稳定、口头承诺必然兑现；
- 连续性：用户的沟通方式改变她后续愿不愿意解释、争取或延长期限；
- 禁止写法：不能写成冷酷 HR 或隐藏贵人。

### 3.2 周屿｜前同事

- 身份：与用户合作过两年的前同事，正在做一个为期六周的企业服务试点；
- 目标：需要可信的人一起交付，但预算只够付费试做，不能承诺全职；
- 能给的：真实客户、作品、协作机会和一笔小额收入；
- 风险：范围可能膨胀、尾款依赖客户验收、友情与合作边界混在一起；
- 连续性：是否写清范围、按时交付和遇事沟通决定后期信任；
- 禁止写法：不能把创业项目写成一夜翻身机会。

### 3.3 程岚｜行业前辈 / 前客户

- 身份：用户上一份工作接触过的前客户，知道用户做过什么，但不了解其完整能力；
- 目标：只愿意为具体、可信的成果背书；
- 能给的：一次作品反馈、一封推荐、一位潜在客户的引荐；
- 不能给的：替用户决定方向、直接安排高薪职位；
- 连续性：空泛求助只得到礼貌回复；带具体材料来会得到更强帮助；
- 禁止写法：不做万能导师，不讲人生大道理。

### 3.4 梁澄｜共同承担生活的人

- 身份变体：根据用户设置可呈现为伴侣、成年手足或共同生活的家人；如果没有适配关系，统一显示“家里最常和你商量现实问题的人”；
- 目标：关心用户，也需要知道未来三个月如何安排共同开支；
- 能给的：有限时间、短期周转、生活协作和情绪承接；
- 风险：长期模糊会把支持变成误解与人情债；
- 连续性：用户是否公开预算和期限，决定后期是协助还是催促；
- 禁止写法：不把家人写成阻碍梦想的反派。

## 4. 七幕结构与节点图

### 4.1 七幕功能

| 幕 | 功能 | 可进入节点 | 必须产出 |
| --- | --- | --- | --- |
| 1 | 局面落地 | `JL01–JL03` | 对 Offer 的第一步动作 |
| 2 | 条件具体化 | `JL04–JL06` | 一项承诺或一项新筹码 |
| 3 | 第二条路出现 | `JL07–JL09` | 对人脉、项目或支持的用法 |
| 4 | 代价显形 | `JL10–JL12` | 消费前两幕至少一个延迟标记 |
| 5 | 外部变量 | `JL13–JL15` | 出现盘面偏好的机会 / 变化 |
| 6 | 两线相撞 | `JL16–JL18` | 不可两全的资源分配 |
| 7 | 最终落点 | `JL19–JL21` | 确定未来 4–8 周的路线 |

### 4.2 路由概览

```text
第1幕：现金 / 专业价值 / 环境变化三种开局之一
   ↓ 记录 accept_interest / negotiated / declined 等标记
第2幕：固定岗位的真实条件、议价回信或继续等待的成本之一
   ↓
第3幕：周屿的付费试做 / 程岚的作品反馈 / 梁澄的家庭预算之一
   ↓
第4幕：背调与旧经历 / 突发支出 / 睡眠与判断力之一
   ↓
第5幕：旧成果被看见 / 项目范围膨胀 / 外地或远程窗口之一
   ↓
第6幕：入职与项目撞期 / 客户付款条件 / 家庭支持期限之一
   ↓
第7幕：固定工作落点 / 双线落点 / 试航或休整落点之一
   ↓
六类路线结局 + 质量变体
```

路由不是把早期选择永久锁成一条线。第 1、4、7 幕分别是三次主要汇流点；历史标记通过正文变体、选项开放条件和后果质量继续生效。

## 5. 节点写作与效果记法

下面 21 个节点均为可选择的事件节点。效果记法：

- `R` = 安全余量 `runway`；
- `O` = 机会窗口 `optionality`；
- `L` = 身心负荷 `load`，上升代表更累；
- `Rel(人物)` = 对应信任变化；
- `+flag` = 添加延迟标记；
- 数值用于相对排序和反馈，不应原样展示给用户。

每个节点的“命盘优先”只决定更容易出现什么，不意味着该信号的人必然遭遇该事件。

## 6. 《工作空窗期》完整节点

### 第一幕｜局面落地

#### JL01｜只够再等三个月

- 情境：银行卡余额、下月房租和必要支出摊在桌上。顾言发来书面 Offer：薪资是上一份工作的 82%，48 小时内答复，岗位内容基本熟悉。
- 隐藏冲突：现金确定性 vs 等待更匹配机会。
- 命盘优先：财星 / 官杀被强调；财帛或官禄宫受流年、流月激活；当前运限化禄、化权或化忌落相关宫。
- 可见依据：这段时间工作与现金议题更容易一起浮到前台，所以开局先落在“先恢复收入，还是保留选择空间”。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 回复“原则上接受”，但要求先看完整职责和试用期规则 | 顾言把岗位说明和绩效口径发来，Offer 暂时保住，但你还没有签字 | `+offer_alive` `+asked_terms`，Rel(顾言)+1 | R+5 O+1 L+1 |
| 拿现有 Offer 去争取一次薪资或签字费调整 | 顾言没有当场拒绝，要求你用职责差异说明期望，而不是只报一个数字 | `+negotiation_open`，Rel(顾言)0 | R0 O+4 L+2 |
| 明确谢绝，把接下来两周留给更匹配的岗位 | 回复发出后，短暂松了一口气；同时，三个月安全余量正式开始倒数 | `+offer_declined` `+search_deadline_14d`，Rel(顾言)-1 | R-6 O+3 L+1 |

#### JL02｜职位比上一份低一级

- 情境：薪资虽然下降，但更刺眼的是职位名称低一级。顾言说“入职后有机会重新定级”，却没有给书面时间表。
- 隐藏冲突：职业叙事与短期落脚。
- 命盘优先：食伤、官杀或印星结构突出；官禄宫见化科 / 化权 / 化忌、昌曲、天相、巨门等；流官禄叠本命命宫或福德。
- 可见依据：盘面当前更强调“别人如何确认你的专业价值”，因此同一份 Offer 的矛盾重点从钱转到定级与职责。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 要求把三个月后的定级评估和标准写进补充邮件 | 顾言愿意确认评估时间，但只肯写“根据表现讨论”，没有保证结果 | `+review_in_writing` `+offer_alive`，Rel(顾言)+1 | R+3 O+4 L+1 |
| 接受职级，换取负责一个能写进作品集的核心模块 | 部门同意把核心模块列进职责，你得到一块可被看见的工作，但责任也更重 | `+portfolio_role` `+offer_alive` | R+4 O+5 L+3 |
| 暂不答应，先用两天问三位在职者真实晋升情况 | 你得到两条互相矛盾的信息：有人半年升过，也有人两年没动 | `+company_diligence` `+decision_delay`，Rel(顾言)0 | R-1 O+3 L+1 |

#### JL03｜工作在另一座城

- 情境：Offer 需要六周后迁往另一座城，试用期不能远程。工资下降，但行业机会更多；搬家会消耗约半个月必要支出。
- 隐藏冲突：环境窗口与迁移成本。
- 命盘优先：迁移宫、天马、禄马交驰、七杀 / 破军 / 伤官等变化信号；流命宫或流官禄落本命迁移，流年四化激活迁移主星。
- 可见依据：当前阶段外部环境变化的权重更高，所以开局不是单纯“接不接”，而是“要不要为新环境支付搬迁成本”。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 接受异地安排，同时要求公司承担搬迁或一个月临时住宿 | 顾言愿意申请临时住宿，但要你先给明确入职意向 | `+relocation_open` `+benefit_request` | R+1 O+6 L+3 |
| 提议先远程试做四周，再决定是否搬迁 | 用人经理觉得可行，HR 担心流程，要求你完成一次额外业务面试 | `+remote_trial_requested` `+extra_interview` | R-1 O+5 L+2 |
| 不为这份 Offer 搬家，转向本地与远程岗位 | 路线更清楚了，但可投岗位池缩小，你主动关闭了一部分窗口 | `+location_boundary` `+offer_declined` | R-5 O+1 L-1 |

### 第二幕｜条件具体化

#### JL04｜试用期考核只有一句话

- 进入条件：`offer_alive` 或 `relocation_open`；官杀 / 官禄权责信号优先。
- 情境：顾言发来的合同写着“达到岗位要求即可转正”，用人经理口头补充：前 60 天要接下前任留下的项目，但没有项目资源清单。
- 隐藏冲突：尽快签约 vs 把模糊责任变成可验证边界。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 直接签约，把项目当作重新证明自己的机会 | 入职日期确定，现金流的焦虑下降；遗留项目也正式算在你头上 | `+signed_offer` `+legacy_project_risk`，Rel(顾言)+1 | R+9 O+2 L+5 |
| 发一页“前 60 天交付清单”，请经理书面确认资源和验收人 | 对方删掉一项不现实目标，也明确了一位协作人，签约慢了一天 | `+bounded_offer` `+signed_offer`，Rel(顾言)+2 | R+7 O+4 L+2 |
| 要求先与未来同事聊 20 分钟，再决定是否签 | 同事透露前任离开与跨部门扯皮有关；你获得重要信息，也让公司察觉你的谨慎 | `+team_truth` `+decision_delay` | R-1 O+4 L+1 |

#### JL05｜顾言回了一个折中数字

- 进入条件：`negotiation_open`、`review_in_writing` 或 `benefit_request`；财星 / 财帛、化禄化忌优先。
- 情境：公司把固定薪资从 82% 调到 88%，但要求半年内不参加外部付费项目；或保留 82%，给一次性签字费。只能选一种方案，也可以离开谈判桌。
- 隐藏冲突：长期现金、短期安全与未来副线空间。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 选择 88% 固定薪资，接受半年排他 | 每月压力明显下降，但周屿之后的付费项目将无法接 | `+signed_offer` `+exclusive_6m`，Rel(顾言)+2 | R+10 O-3 L+1 |
| 保留 82%，拿签字费并要求排他只限同业竞业 | 顾言接受“非竞业项目可报备”，你多保留了一条副线 | `+signed_offer` `+signing_bonus` `+sidework_reportable` | R+8 O+4 L+2 |
| 不接受折中，礼貌结束谈判并索要未来岗位联系许可 | 顾言保留了你的资料，但眼前的收入窗口关闭 | `+offer_declined` `+future_contact`，Rel(顾言)+1 | R-6 O+2 L0 |

#### JL06｜继续等，不等于什么都不做

- 进入条件：`offer_declined`、`location_boundary` 或长时间 `decision_delay`；食伤 / 印 / 化科信号优先。
- 情境：拒绝或暂缓 Offer 后的第一个周一，招聘软件没有新消息。你只能给接下来 14 天定一个主要任务，否则等待会继续散掉。
- 隐藏冲突：扩大投递、补专业证据或先补现金。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 每天定向投 4 个岗位，并联系 5 位旧同事核实机会 | 三天内得到两条真实岗位信息，也收到几次沉默 | `+targeted_search` `+network_reached` | R-2 O+7 L+3 |
| 用一周整理一个完整案例，再带着案例找人反馈 | 投递量减少，但程岚答应看你的第一版材料 | `+portfolio_sprint` `+cheng_meeting` | R-3 O+6 L+2 |
| 先接一笔两周内能结算的短单，再安排求职时段 | 安全余量略有回升，但白天求职时间被切碎 | `+short_gig` `+independent_income_1` | R+4 O+2 L+4 |

### 第三幕｜第二条路出现

#### JL07｜周屿的六周试做

- 情境：周屿拿到一个企业客户试点，预算能支付约半个月必要支出。他需要你六周内负责关键交付，但只肯先付 30%，尾款看验收。
- 隐藏冲突：可信机会与不完整保障。
- 命盘优先：比劫 / 食伤，仆役、兄弟、官禄宫被激活，左右魁钺或劫财、巨门、化忌等协作信号。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 接下全部交付，但要求 50% 预付款和两次验收节点 | 周屿觉得条件严，但客户最终同意 40% 预付和中期验收 | `+pilot_lead` `+independent_income_1`，Rel(周屿)+2 | R+3 O+7 L+5 |
| 只负责一个两周可完成的模块，不承诺后续 | 项目没有被你押满，周屿也能先测试合作是否顺畅 | `+pilot_module` `+portfolio_proof_1`，Rel(周屿)+1 | R+1 O+5 L+2 |
| 不接交付，帮他审一次方案并介绍合适的人 | 你保住时间，也维护了关系，但这次不会成为你的作品 | `+zhou_goodwill`，Rel(周屿)+2 | R0 O+1 L-1 |

#### JL08｜程岚只肯看一页材料

- 情境：程岚答应给你 25 分钟，但要求会前只发一页：你解决了什么问题、证据是什么、下一份工作想做什么。
- 隐藏冲突：快速聚焦、暴露不完整作品或继续准备。
- 命盘优先：印 / 食伤，文昌文曲、化科、天机、巨门在命宫或官禄；流科或流命叠相关宫。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 用过去项目数据做一页案例，并明确请她指出最不可信的地方 | 程岚指出一处数据缺证，也愿意在你补齐后转给招聘经理 | `+portfolio_feedback` `+proof_gap`，Rel(程岚)+2 | R-1 O+7 L+2 |
| 带三个方向去聊，请她帮你判断哪个行业更值得去 | 她给了行业信息，但没有替你筛选，只让你先排除一个不匹配方向 | `+market_info`，Rel(程岚)+1 | R-1 O+4 L+1 |
| 觉得材料还不够好，推迟一周再约 | 你多了一周准备，也失去她本周能引荐的一个岗位窗口 | `+portfolio_delay` `+missed_intro`，Rel(程岚)-1 | R-2 O-2 L+1 |

#### JL09｜梁澄把三个月账单摊开

- 情境：梁澄没有催你立刻上班，只问一个具体问题：如果下个月还没有固定收入，共同支出怎么调？
- 隐藏冲突：公开现实、使用支持或独自扛住。
- 命盘优先：财星 / 印 / 比劫，田宅、福德、兄弟或夫妻宫被激活，化忌触及财福关系线。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 一起做 8 周预算，明确哪些开支暂停、何时复盘 | 梁澄知道如何配合，你也第一次看清真实安全线 | `+shared_budget`，Rel(梁澄)+3 | R+4 O0 L-3 |
| 接受对方承担一个月固定支出，同时写清归还或分担方式 | 时间被买回来，但这份支持有明确期限和责任 | `+support_used` `+support_debt_1`，Rel(梁澄)+1 | R+7 O+2 L-1 |
| 只说“我会处理”，不透露余额和计划 | 当晚没有争执，但梁澄开始自己做最坏打算 | `+concealed_pressure`，Rel(梁澄)-3 | R-1 O0 L+4 |

### 第四幕｜代价显形

#### JL10｜背调问到了那段空白

- 情境：顾言或另一家公司的背调联系人问：为什么离开上一份工作后四个月没有固定职位？对方还想联系前直属领导。
- 消费标记：`signed_offer`、`targeted_search`、`portfolio_sprint`、`short_gig`。
- 命盘优先：官杀、印、食伤；官禄化忌 / 化科、父母宫（制度与上级）或命宫被激活。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 如实说明空窗，并给出这四个月完成的作品、短单或学习记录 | 解释没有回避空窗，重点落在可验证行动；若已有证据，背调继续推进 | `+gap_explained`；有 `portfolio_* / short_gig` 则 `+credible_gap` | R+2 O+5 L+1 |
| 只说“个人原因休息”，拒绝提供更多细节 | 对方接受隐私边界，但对工作连续性保留疑问 | `+gap_private` `+reference_doubt` | R0 O-2 L0 |
| 先联系前领导说明情况，再授权对方背调 | 前领导同意确认事实，但提醒不会替你美化离职分歧 | `+reference_prepared`，Rel(顾言)+1 | R+1 O+3 L+2 |

#### JL11｜一笔没计划的必要支出

- 情境：电脑需要维修或家中出现一笔必须承担的支出，约等于半个月必要开支。它不致命，却把等待窗口明显缩短。
- 消费标记：`support_used`、`signing_bonus`、`short_gig`、`offer_declined`。
- 命盘优先：财星 / 劫财，财帛化忌、地空地劫、田宅或福德被流运激活。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 用现有存款支付，并把求职止损线提前两周 | 支出处理完，接下来每个机会都会更受现金期限影响 | `+runway_shortened` `+hard_deadline` | R-9 O0 L+3 |
| 向梁澄说明金额，借用短期周转并约定归还节点 | 现金线没断，但支持债增加；有共享预算时，关系成本较低 | `+support_debt_1`；Rel(梁澄)±0/−2 | R-3 O+1 L+1 |
| 临时增加短单工时覆盖这笔支出 | 钱补回来一部分，但作品和面试准备被压缩 | `+gig_overload` `+independent_income_1` | R+2 O-2 L+7 |

#### JL12｜凌晨两点还在改同一页简历

- 情境：连续几晚，你在 Offer、项目和投递之间切换，凌晨两点还在改同一页简历。第二天一次重要沟通里，你漏看了对方问的关键条件。
- 消费标记：高 `load`、`gig_overload`、`pilot_lead`、`legacy_project_risk`、`concealed_pressure`。
- 命盘优先：印 / 伤官，福德、疾厄、命宫受煞或化忌，流福德 / 流疾厄叠本命官禄。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 砍掉一条低优先级任务，给自己两晚完整睡眠 | 进度慢了一点，第三天你能重新分清哪些事真正重要 | `+recovery_2` `+task_dropped` | R-1 O-1 L-8 |
| 保留所有任务，但把每天工作限定在两个固定时段 | 第一周仍拥挤，不过切换次数下降，没有继续漏消息 | `+recovery_1` `+timeboxed` | R0 O+1 L-4 |
| 继续顶一周，等眼前几个结果出来再休息 | 事情没有立刻崩掉，但下一幕所有高压选项的负荷成本增加 | `+overextended` | R0 O+2 L+8 |

### 第五幕｜外部变量

#### JL13｜三年前的项目突然被问起

- 情境：程岚把你的一页案例转给一位招聘经理。对方不承诺职位，只邀请你用 30 分钟讲清当年的关键决策；三天后进行。
- 进入优先：`portfolio_feedback`、`portfolio_role`、`credible_gap`；食伤 / 印、化科、昌曲等证明信号。
- 变体：有 `proof_gap` 时必须先补证据；有 `portfolio_delay` 时机会改为录制 5 分钟说明，权重降低。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 补齐数据来源，按“问题—动作—结果—局限”准备讲述 | 招聘经理认可你的判断过程，并约一次正式面试 | `+warm_interview` `+portfolio_proof_2`，Rel(程岚)+2 | R-1 O+9 L+3 |
| 重点包装最终成果，略去当时失败的一次尝试 | 讲述更漂亮，但追问失败原因时出现一段说不清的空白 | `+polished_story` `+credibility_risk` | R0 O+4 L+2 |
| 把机会让给当前 Offer / 项目，不再额外准备 | 时间压力下降，程岚仍尊重你的取舍，但不会继续推这个窗口 | `+intro_declined`，Rel(程岚)0 | R+1 O-4 L-3 |

#### JL14｜试点项目突然加了一整块需求

- 情境：客户在中期验收前增加一块原方案没有的需求。周屿说“先做了再谈钱，关系更重要”，但这会多占三到五天。
- 进入优先：`pilot_lead`、`pilot_module`、`zhou_goodwill`；比劫 / 食伤、仆役化忌、巨门或左右信号。
- 变体：有书面验收点时可直接引用；只做模块时可拒绝范围外工作。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 先做最小版本，但把新增范围、报价和验收写进邮件 | 客户同意先看最小版本，尾款不再完全绑定新增需求 | `+scope_controlled` `+invoice_protected`，Rel(周屿)+1 | R+2 O+5 L+3 |
| 为了交付关系全部接下，价格以后再谈 | 周屿松了一口气，客户却把新增内容当成原本就包含 | `+scope_creep` `+payment_risk`，Rel(周屿)+1 | R-1 O+2 L+8 |
| 拒绝新增需求，只交合同原范围 | 你的时间守住了，周屿担心客户体验，合作气氛变硬 | `+scope_refused`，Rel(周屿)-2 | R+1 O-1 L-2 |

#### JL15｜另一座城给了四周远程试用

- 情境：额外面试或定向投递带来一个四周远程试用。结束后再决定是否迁移，试用薪资能覆盖必要支出，但同期不能接全量项目。
- 进入优先：`extra_interview`、`targeted_search`、`location_boundary`；迁移宫、天马、破军、流迁移 / 流官禄激活。
- 变体：若用户已有签约 Offer，本节点改为“另一家公司希望你在入职前完成两次付费顾问访谈”，不能要求违约试用。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 接受四周试用，把搬迁决定推迟到拿到双方证据后 | 收入暂时恢复，也得到真实体验；四周内其他路线会变窄 | `+remote_trial` `+migration_option` | R+7 O+7 L+5 |
| 提议改成两周、明确交付物的付费项目 | 对方同意缩短，但表示转全职时还需再评估一次 | `+remote_project` `+portfolio_proof_1` | R+3 O+5 L+2 |
| 拒绝试用，只接受正式 Offer 后再搬迁 | 你守住不免费证明自己的边界，也可能失去这个环境窗口 | `+formal_only` | R0 O-4 L-1 |

### 第六幕｜两线相撞

#### JL16｜入职日撞上项目验收

- 情境：固定工作的入职培训与周屿项目的客户验收在同一周。两边都需要你在线，任何一边临时失约都会消耗信任。
- 进入条件：同时存在 `signed_offer` 与 `pilot_* / short_gig / remote_project`。
- 命盘优先：官杀 × 食伤 / 比劫；官禄与仆役同时激活，化权与化忌形成拉扯。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 提前向周屿交接，按原范围完成后退出项目 | 周屿有时间补位；你失去后续分成，但没有临时甩手 | `+project_exited_cleanly`，Rel(周屿)+1 | R+4 O-2 L-4 |
| 向新公司报备非竞业项目，争取把培训错开半天 | 若有 `sidework_reportable / bounded_offer` 更易获批；否则顾言会追问排他问题 | `+dual_disclosed` 或 `+employer_doubt` | R+2 O+5 L+4 |
| 两边都不说明，靠晚上和周末把项目做完 | 第一周勉强顶住，但一次交付延误让双方都开始追问 | `+hidden_dual_track` `+overextended`，Rel(顾言)-2 Rel(周屿)-2 | R+1 O+1 L+10 |

#### JL17｜客户要验收后 45 天付款

- 情境：项目已接近交付，客户把付款条件改成验收后 45 天。你如果接受，作品能上线，但眼前现金不会马上改善。
- 进入条件：`pilot_lead`、`pilot_module`、`remote_project` 或 `short_gig`。
- 命盘优先：财星 × 食伤，财帛与仆役宫、化禄化忌、空劫信号。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 要求先付无争议部分，剩余款按 45 天结算 | 客户同意先付一小部分，项目继续，现金风险被拆开 | `+partial_payment` `+invoice_protected` | R+4 O+4 L+2 |
| 接受 45 天账期，换取案例署名和客户推荐 | 眼前仍紧，但作品与背书变强；若安全余量过低，负荷额外增加 | `+client_reference` `+payment_delayed` | R-4 O+7 L+4 |
| 暂停交付，等付款条款确认后再上线 | 你守住合同边界，项目时间表延后，周屿要去承担客户压力 | `+delivery_paused`，Rel(周屿)-1 | R-1 O-2 L+1 |

#### JL18｜梁澄问：这次要等到哪一天？

- 情境：六周过去，梁澄愿意继续支持，但希望共同决定一个具体日期：到那天如果收入仍未稳定，就启用备用方案。
- 进入优先：`support_used`、`support_debt_*`、`concealed_pressure`、低 `runway`；财 / 印，田宅、福德或关系宫位激活。
- 变体：有 `shared_budget` 时语气是共同复盘；有 `concealed_pressure` 时先出现一次不愉快对话。

| 选择动作 | 即时反馈 | 延迟与关系 | 效果 |
| --- | --- | --- | --- |
| 共同定下四周止损线，并提前列出届时会接受的过渡工作 | 支持有了边界，你也不用每天重新争论“还要不要等” | `+family_deadline` `+fallback_ready`，Rel(梁澄)+3 | R+5 O+1 L-4 |
| 请求再给八周，只押正在推进的两个明确机会 | 梁澄同意，但要求每两周一起看进展；机会必须有名字和下一步 | `+extended_runway` `+biweekly_review`，Rel(梁澄)+1 | R+6 O+4 L+1 |
| 不接受共同期限，决定自己承担后续支出 | 你保留了决定权，也失去了部分生活支持，现金线立即变短 | `+support_withdrawn`，Rel(梁澄)-3 | R-8 O+1 L+3 |

### 第七幕｜最终落点

#### JL19｜固定岗位的最后确认

- 进入优先：`signed_offer`、`bounded_offer`、`review_in_writing`、`fallback_ready`，或 `runway` 低且固定工作仍可恢复。
- 情境：顾言需要你最后确认入职。现在你已知道岗位边界、团队风险和自己手里的其他筹码，不能再把决定归咎于信息不足。
- 隐藏冲突：确定性、边界与仍在发展的机会。

| 选择动作 | 即时反馈 | 结局指向 | 效果 |
| --- | --- | --- | --- |
| 按现有条件入职，暂停其他项目至少八周 | 收入和作息重新有锚点，未完成的副线暂时关掉 | `ending_stabilize`；有风险标记则质量下降 | R+12 O-4 L-1 |
| 只在书面职责 / 报备边界确认后入职 | 你没有拿到全部理想条件，但把最容易失控的一项写清了 | `ending_conditional_entry` | R+9 O+3 L+1 |
| 在签约前退出，集中完成眼前已验证的另一条路 | 固定收入窗口关闭，接下来的路必须由作品、项目或明确期限支撑 | 按证据进入 `ending_dual / independent / rest` | R-7 O+5 L+2 |

#### JL20｜两条路都还活着，但时间只够一条半

- 进入优先：同时拥有 `signed_offer / warm_interview / remote_trial` 与 `pilot_* / client_reference / portfolio_proof_2`。
- 情境：固定岗位或面试线已经有明确下一步，独立项目也出现真实客户。未来八周只能给其中一条完整精力，另一条必须缩成可持续的小份额。
- 隐藏冲突：主副排序，不是“全都要”。

| 选择动作 | 即时反馈 | 结局指向 | 效果 |
| --- | --- | --- | --- |
| 固定工作作主线，只保留每周半天维护一个非竞业项目 | 两条路都活着，但副线增长会慢；有报备边界时质量更高 | `ending_dual_track` | R+8 O+5 L+3 |
| 项目作主线，只保留少量求职面试作为止损线 | 作品与收入验证加速，现金仍会波动 | `ending_independent`；无付款保护则质量下降 | R-2 O+9 L+5 |
| 放弃并行，选择证据最强的一条，另一条明确结束 | 心里少了一条“也许”，执行成本显著下降 | 依证据进入 `stabilize / conditional / independent` | R+4 O+2 L-5 |

#### JL21｜先把下一步缩到四周

- 进入优先：未签固定 Offer，或 `load` 高、`recovery` 低；也适合印星 / 福德恢复信号与食伤 / 迁移试航信号。
- 情境：此刻没有一条路足以承诺一年，但可以承诺未来四周。你需要在转向试航、独立接单和真正休整中选一个，并写清结束条件。
- 隐藏冲突：用小周期获得证据，还是继续靠模糊希望拖延。

| 选择动作 | 即时反馈 | 结局指向 | 效果 |
| --- | --- | --- | --- |
| 用四周完成一个新方向作品，并访谈 5 位从业者，月底复盘 | 转行不再是一句愿望，但一个月内不会带来稳定收入 | `ending_reskill_pilot` | R-5 O+8 L+3 |
| 用四周只做已有人愿意付钱的服务，目标是验证两位客户 | 自主路线开始用付款而不是兴奋感证明自己 | `ending_independent` | R+1 O+7 L+5 |
| 暂停求职与项目 7–14 天，先恢复睡眠、处理账单，再按止损线重启 | 窗口暂时变少，但判断力和节奏开始回来 | `ending_reset` | R-3 O-3 L-10 |

## 7. 六个结局

结局由第七幕选择确定“路线族”，再由历史证据、信任、负荷与安全余量决定质量。路线名不带胜负等级。

### E01｜稳住阵地

- 触发：`ending_stabilize`，或最终选择固定工作且 `employment_commitment` 最高。
- 得到：固定收入、作息锚点、履历连续性。
- 代价：短期关闭一部分项目或迁移窗口；若带 `legacy_project_risk / exclusive_6m`，边界压力会继续存在。
- 高质量条件：`bounded_offer / team_truth / gap_explained / recovery_1+` 任两项。
- 风险变体：未核实职责、隐藏副业或负荷过高时，写“你稳住了现金，但旧的消耗模式可能跟着入职”。
- 现实验证动作：入职前写下一页“前 60 天交付、资源、复盘日期”，发给未来经理确认。

### E02｜带条件入场

- 触发：`ending_conditional_entry`，且有 `review_in_writing / bounded_offer / sidework_reportable / benefit_request` 至少一项。
- 得到：恢复收入，同时保留一项可复盘边界。
- 代价：条件不是胜利，兑现仍依赖后续证据与沟通；争取边界也会降低“随叫随到”的印象分。
- 高质量条件：`negotiation_leverage >= 2` 且 Rel(顾言)不低于 0。
- 风险变体：只有口头承诺时写“你争取到了讨论空间，还没有拿到结果”。
- 现实验证动作：把口头条件改写成包含日期、负责人和验收口径的确认邮件。

### E03｜双线过渡

- 触发：`ending_dual_track`，或固定工作与已验证副线同时保留。
- 得到：安全余量和未来选择同时存在。
- 代价：注意力被切开；若没有报备或时间盒，关系与身心成本会快速放大。
- 高质量条件：`dual_disclosed / timeboxed / project_exited_cleanly / sidework_reportable` 任两项。
- 风险变体：`hidden_dual_track / overextended` 任一存在时写“你保留了两条路，也把两边的信用放在同一个时间表上”。
- 现实验证动作：给副线设置每周最高工时、停止条件和是否需要向主业报备。

### E04｜转行试航

- 触发：`ending_reskill_pilot`，并有 `portfolio_sprint / market_info / remote_trial / migration_option` 等方向证据。
- 得到：用作品、访谈或短周期试用判断新方向，而非一次清零。
- 代价：短期收入继续波动；学习若不连接真实岗位，会变成延迟决定。
- 高质量条件：明确四周期限 + 至少一个外部反馈或付费验证。
- 风险变体：只有课程没有作品 / 访谈时写“你买到了准备时间，还没有买到市场证据”。
- 现实验证动作：四周内交付一个能被从业者评价的作品，并提前约好复盘对象。

### E05｜独立接单

- 触发：`ending_independent`，且 `independent_income` 或 `portfolio_proof` 达到阈值。
- 得到：自主安排与可迁移作品，收入开始由真实客户验证。
- 代价：账期、获客和范围控制由自己承担。
- 高质量条件：`invoice_protected / partial_payment / scope_controlled / client_reference` 任两项。
- 风险变体：`payment_risk / scope_creep` 存在时写“你验证了有人需要这项能力，还没有验证它能稳定回款”。
- 现实验证动作：下一单先写清预付款比例、范围外报价和验收日。

### E06｜低谷复位

- 触发：`ending_reset`；或安全余量极低且负荷极高时，从其他路线降级为带止损线的复位变体。
- 得到：睡眠、账目和判断力重新可用；停止用忙乱伪装推进。
- 代价：短期机会减少，也需要面对“暂停是否有期限”的现实问题。
- 高质量条件：`family_deadline / shared_budget / recovery_2 / fallback_ready` 任两项。
- 风险变体：无截止日期时不能美化为休整，写“你停了下来，但还需要给重新启动一个日期”。
- 现实验证动作：确定 7–14 天恢复期、最低支出和重启日，并只保留一个联系人入口。

## 8. 路由与结局规则

### 8.1 每幕节点选择

```text
候选 = 当前幕全部节点
  → 过滤硬前置与互斥事实
  → 保证能消费至少一个既有延迟标记（第4幕以后）
  → 计算命理组合分
  → 加连续性分（人物、承诺、未解决风险）
  → 加状态紧迫度（低安全余量 / 高负荷）
  → 扣重复冲突与重复人物
  → 确定性排序，取最高分
```

建议权重：命理组合 40%，剧情连续性 30%，当前选择后果 20%，内容多样性 10%。硬约束始终高于分数。

### 8.2 选项开放与替换

- 不用灰掉“不够资源”的选项再嘲讽用户；应替换成现实可做的低成本动作。
- 例：安全余量低于 20 时，`JL21` 的“完全停 14 天”替换为“停掉投递 3 天，保留已确认的短单时段”。
- 有 `exclusive_6m` 时，所有付费副线必须呈现为“先书面确认是否允许”或不可进入，不允许系统鼓励违约。
- 有 `concealed_pressure` 时，梁澄后续事件先消费隐瞒后果，不能像关系从未受损。
- 有 `overextended` 时，高负荷选择额外 `L+2`，直到 `recovery_2` 或明确砍掉任务。
- 有 `proof_gap` 时，作品机会先要求补证，不直接送面试。

### 8.3 重玩差异要求

同一出生信息、同一时间、改变第一幕选择后：

- 第 2 幕正文或节点必须改变；
- 第 4 幕至少消费一个不同标记；
- 第 6 幕冲突双方至少一方改变；
- 结局即使同路线，质量变体和关键证据也应不同。

同一困境、不同命盘：前 3 幕至少 1 个节点不同，第 5 幕优先机会不同，结局命盘对照不同。

## 9. 八字 × 紫微 × 运限触发矩阵

### 9.1 命理输入的职责边界

| 层 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| 八字结构 | 矛盾如何被体验：权责、现金、产出、支持、合作；初始敏感点 | 不直接判定“适合某职业” |
| 紫微宫星 | 工作议题落在哪个生活领域、由哪类人物推动、通过何种场景出现 | 不单凭一颗星给好坏结论 |
| 当前运限 | 哪个议题现在更靠前、是扩张还是收口、外部变量何时进入 | 不宣称具体事件必然发生 |
| 玩家历史 | 后续真正发生什么、人物信任、资源与结局 | 不被命盘覆盖或改写 |

### 9.2 标准化八字信号

0.1.0 使用十神族群与季节 / 强弱上下文，不把“某十神多”直接当吉凶：

| 信号 ID | 来源 | 内容用途 |
| --- | --- | --- |
| `bazi_authority` | 正官、七杀及其当前运限出现 | 规则、岗位、上级、责任、背调、转正标准 |
| `bazi_resource_money` | 正财、偏财及当前运限出现 | 现金线、报价、回款、固定收入与波动收入 |
| `bazi_output` | 食神、伤官及当前运限出现 | 作品、表达、独立服务、专业证明、与制度摩擦 |
| `bazi_support_learning` | 正印、偏印及当前运限出现 | 学习、资质、体系、前辈、恢复与过度准备 |
| `bazi_peer` | 比肩、劫财及当前运限出现 | 同行、合作、竞争、分钱、共同承担 |
| `bazi_climate_need` | 调候喜用映射到火 / 水 / 木 / 金 / 土 | 只调整行动节奏和资源偏好，不生成饰品或转运建议 |

强弱只影响权重和代价变体。例如 `bazi_output` 高且为当前有利信号，可提高作品 / 试做节点；同类信号过载或当前忌向时，不删掉机会，而是提高“范围失控、表达冲突、持续输出消耗”的后果权重。

### 9.3 标准化紫微信号

| 信号 ID | 宫位 / 星曜来源 | 内容用途 |
| --- | --- | --- |
| `ziwei_career_structure` | 官禄、命 / 身；紫微、天府、天相、武曲、正向化权 | 平台、岗位、职责、管理、固定工作 |
| `ziwei_career_change` | 官禄 / 迁移；七杀、破军、廉贞、天马、杀破狼 | 变化岗位、重组、试用、迁移、从零验证 |
| `ziwei_proof_voice` | 官禄 / 命；天机、巨门、昌曲、化科 | 作品、面试、表达、案例、专业声誉 |
| `ziwei_money_flow` | 财帛 / 福德 / 田宅；武曲、天府、太阴、禄存、化禄 | 固定收入、储备、定价、现金安全线 |
| `ziwei_external_window` | 迁移；太阳、天马、魁钺、化禄 / 科 | 异地、远程、外部招聘方、前辈引荐 |
| `ziwei_collaboration` | 仆役 / 兄弟；左右、魁钺、巨门、化忌 | 前同事、客户协作、信用、范围争议 |
| `ziwei_recovery_load` | 福德 / 疾厄；天同、天梁、太阴、空劫、羊陀火铃、化忌 | 睡眠、恢复、过载、暂停与支持 |
| `ziwei_home_support` | 田宅 / 夫妻 / 兄弟 / 父母；太阴、天梁、化忌 | 共同预算、家庭支持、生活安排 |

星曜必须结合落宫、四化与组合使用。煞曜 / 化忌只提高问题复杂度，不能写成灾祸断言。

### 9.4 运限信号

| 信号 ID | 计算来源 | 内容用途 |
| --- | --- | --- |
| `period_bazi_god:*` | 当前大运、流年、流月干支对日主的十神 | 对应十神议题的时间加权 |
| `flow_life_to:*` | 流命宫叠本命宫 | 当前注意力中心与人物领域 |
| `flow_career_to:*` | 流官禄叠本命宫 | 工作议题通过哪个领域发生 |
| `flow_wealth_to:*` | 流财帛叠本命宫 | 收入 / 支出问题的来源 |
| `flow_migration_to:*` | 流迁移叠本命宫 | 外部岗位、城市、远程与变化窗口 |
| `flow_fortune_to:*` | 流福德叠本命宫 | 心理负荷、恢复与判断节奏 |
| `period_mutagen:<star>:<type>` | 当前层四化与其落宫 | 放大该星所在领域；禄权科忌不是简单好坏分 |

时间尺度建议：开局主要用大运 + 流年定主冲突，第 2–6 幕用流年 + 流月决定当期外部变量，结局依据用大运 / 流年，不用流日做重大人生解释。

### 9.5 三层组合矩阵

以下是组合规则，不是逐字命断。每行至少命中“八字 1 + 紫微 1 + 运限 1”才获得强个性化加分；只命中一层时仍可作为过渡节点，但不得展示“三层共同指向”。

| 组合 ID | 八字结构 | 紫微领域 | 当前运限 | 优先节点 / 变体 | 主要代价 |
| --- | --- | --- | --- | --- | --- |
| `M01_cash_anchor` | `bazi_resource_money` | `ziwei_money_flow` | 流财帛 / 化禄忌激活财福 | JL01、JL05、JL11、JL17 | 容易让现金期限压过方向判断 |
| `M02_role_contract` | `bazi_authority` | `ziwei_career_structure` | 流官禄叠命 / 官，化权或化忌 | JL02、JL04、JL10、JL19 | 责任先于授权、口头承诺 |
| `M03_proof_before_title` | `bazi_output` | `ziwei_proof_voice` | 流科激活官禄 / 命宫 | JL02、JL08、JL13、JL21 | 为证明价值投入过量准备 |
| `M04_peer_project` | `bazi_peer` | `ziwei_collaboration` | 流仆役 / 兄弟或相关化忌 | JL07、JL14、JL16、JL17 | 人情与合同边界混在一起 |
| `M05_external_move` | `bazi_output` 或 `bazi_authority` | `ziwei_external_window` + `ziwei_career_change` | 流迁移叠官禄 / 命，天马或流权科 | JL03、JL15、JL20 | 搬迁、试用与环境适应成本 |
| `M06_learn_to_switch` | `bazi_support_learning` + `bazi_output` | `ziwei_proof_voice` | 流科 / 流官禄激活福德或命宫 | JL06、JL08、JL13、JL21 | 学习可能替代市场验证 |
| `M07_rest_then_decide` | `bazi_support_learning` | `ziwei_recovery_load` | 流福德 / 疾厄受忌煞激活 | JL12、JL18、JL21 | 暂停若无期限会延长空窗 |
| `M08_home_runway` | `bazi_resource_money` 或 `bazi_support_learning` | `ziwei_home_support` | 流财帛 / 福德叠田宅关系宫 | JL09、JL11、JL18 | 支持债、隐私与共同责任 |
| `M09_output_vs_rules` | `bazi_output` + `bazi_authority` | `ziwei_proof_voice` + `ziwei_career_structure` | 化科与化权 / 忌同时激活 | JL04、JL10、JL13、JL16 | 专业表达与组织规则相撞 |
| `M10_income_dual_track` | `bazi_resource_money` + `bazi_output` | `ziwei_money_flow` + `ziwei_collaboration` | 流财帛与流官禄同时活跃 | JL05、JL07、JL16、JL20 | 排他、时间切片、隐瞒风险 |
| `M11_change_under_load` | `bazi_peer` 或 `bazi_output` | `ziwei_career_change` + `ziwei_recovery_load` | 流迁移活跃且福德受忌 | JL03、JL12、JL15、JL21 | 把疲惫误认成必须换环境 |
| `M12_support_and_reference` | `bazi_support_learning` | `ziwei_external_window` 或 `ziwei_collaboration` | 魁钺 / 昌曲 / 化科被流运激活 | JL08、JL10、JL13、JL19 | 求助空泛则只得到礼貌支持 |

### 9.6 组合打分建议

```text
nodeAstrologyScore =
  max(baziRuleScores)       // 0..12
  + max(ziweiRuleScores)    // 0..14
  + max(periodRuleScores)   // 0..14
  + fusionBonus             // 三层命中 +8；两层命中 +3
  + dominantConflictBonus   // 与本局主冲突一致 +4
```

- 八字、紫微、运限每层设置封顶，防止同类信号堆数量碾压其他层；
- 一颗星或单一宫名不能单独获得最高分；
- 若节点无足够命理依据，只可标记为 `bridge`，每局最多两个，且不得作为第 1、5、7 幕节点；
- 同分采用稳定 hash（出生数据摘要 + target 月 + episode id + act）选择，保证可复现又不会所有人同序；
- 用户的已选路径属于硬事实，不能被高命理分覆盖。

### 9.7 六组差异对照（验收样例）

| 样例 | 组合重点 | 首幕 | 第三幕 | 第五幕 | 结局解释重点 |
| --- | --- | --- | --- | --- | --- |
| A 现金与制度同时强 | M01 + M02 | JL01 | JL09 | JL13 或 JL14 | 命盘惯性更重确定性；若走项目线，说明是在用证据突破惯性 |
| B 作品与声誉窗口强 | M03 + M12 | JL02 | JL08 | JL13 | 不是“适合自由职业”，而是此阶段专业证据更能打开门 |
| C 同行合作被激活 | M04 + M10 | JL01 / JL02 | JL07 | JL14 | 选择的关键是有没有把人情变成范围与付款条件 |
| D 迁移变化窗口强 | M05 | JL03 | JL08 / JL07 | JL15 | 外部环境机会靠前，但搬迁和试用成本仍由选择承担 |
| E 福德负荷更突出 | M07 + M08 | JL01 | JL09 | JL13（弱）或 JL15（弱） | 盘面先提示恢复与支持议题；不把休整写成唯一答案 |
| F 输出与规则相撞 | M09 | JL02 | JL08 | JL13 | 同样入职，结果重点在是否把专业判断转成组织能确认的边界 |

验收时每组至少跑两条不同选择路径。不能只对比开场标题，必须核对人物、第五幕机会和结局解释均有变化。

## 10. 用户可见的命理依据模板

### 10.1 开局一句

结构：阶段信号 + 现实议题 + 非确定性边界。

> 你的工作与资源领域在当前阶段同时被带到前台。比起单纯追求更高职位，这一局更容易先碰到“收入要不要尽快恢复、条件能不能写清”的问题。它不是现实预测，而是本轮沙盘优先让你预演的矛盾。

### 10.2 关键节点展开

默认只显示生活语言：

> 为什么此刻出现这一幕：你的盘面在这段时间更强调外部机会与环境变化，所以系统把“另一座城的试用”排在普通投递之前。

展开后列证据，不下吉凶：

- 八字：当前阶段的官杀 / 食伤信号提高了岗位责任与能力证明的权重；
- 紫微：迁移宫与官禄宫的组合让外部平台成为更相关的情境；
- 运限：本期流迁移叠入本命官禄，且相关星曜被四化激活。

### 10.3 结局对照

> 你的盘面底色更容易先寻找一套可确认的结构，而这一轮你连续选择了“先拿真实项目证据，再决定是否回到固定岗位”。这不是逆命或改命；它说明你这次没有只沿用最熟悉的办法。你得到的是更强的选择筹码，承担的是更短的现金期限。

## 11. 可供编码消费的数据 Schema 建议

0.1.0 建议新增独立的剧本定义，不直接塞回旧 `guanqia.json`。旧题库是一张卡独立打分，新剧本需要幕、连续人物、延迟标记和结局质量，二者职责不同。

### 11.1 0.1.0 唯一序列化 Contract

编码端以这一层的字段名为准；后面的 TypeScript 形状用于解释运行态对象，不应另造一套生产 JSON 字段。

```ts
type StoryDefinition = {
  id: 'unemployed_month_five';
  title: '工作空窗期';
  entry: 'job_lost';
  version: '0.1.0';
  characters: Record<'gu' | 'zhou' | 'cheng' | 'liang', {
    name: string;
    title: string;
    identity: string;
    relationship: string;
    introduction: string;
  }>;
  stages: Array<{
    id: 'setup' | 'terms' | 'second_path' | 'cost_returns' |
      'external_window' | 'collision' | 'landing';
    order: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    candidates: string[];       // 每幕 2–4 个，0.1.0 每幕 3 个
    profileDriven: boolean;     // 第 1 / 4 / 6 幕必须为 true
  }>;
  nodes: StoryNodeContract[];
  endings: EndingContract[];
};

type StoryNodeContract = {
  id: string;
  stage: StoryDefinition['stages'][number]['id'];
  match: {
    anyTags: string[];          // 命中任一可加分：astro:* / flag:* / state:*
    allTags: string[];          // 全部满足才合法，常放入口和硬连续性
    excludeTags?: string[];     // 事实互斥，例如已签排他时排除未报备付费线
    requiresAnyFlags?: string[]; // 事实硬门槛：至少已有其中一个历史 flag
    requiresAllFlags?: string[]; // 事实硬门槛：必须已有全部历史 flag
    requiresFlagGroups?: string[][]; // 每组命中任一 flag，且所有组都必须命中
    minScore: number;
  };
  roles: Array<'gu' | 'zhou' | 'cheng' | 'liang'>;
  copy: {
    transition: string;        // 时间或前序选择的因果承接，不能为空
    title: string;
    situation: string;
    conflict: string;
  };
  variants: Array<{
    id: string;
    when: PredicateGroup;
    copyPatch: Partial<StoryNodeContract['copy']>;
    priority: number;
  }>;
  evidenceSlots: Array<{
    id: 'opening_why_now' | 'node_why_this' | 'ending_compare';
    requiredLayers: Array<'bazi' | 'ziwei' | 'period'>;
    ruleIds: string[];          // M01–M12
    fallbackTemplateId: string; // partial 时明确降级，不伪装三层依据
  }>;
  choices: ChoiceContract[];
  shareable: boolean;
  riskTags: string[];
};

type ChoiceContract = {
  id: string;
  label: string;
  immediate: string;           // 选后立即显示，必须是已发生的事实
  delayedFlags: Array<{
    id: string;
    value: boolean | number | string;
    consumeBy: string[];       // 后续 node id 或 ending id，不能为空
    expiresAfterStage?: string;
  }>;
  relationEffects: Partial<Record<'gu' | 'zhou' | 'cheng' | 'liang', number>>;
  routeSignals: Partial<Record<
    'employment' | 'conditional_entry' | 'dual_track' |
    'reskill_pilot' | 'independent' | 'reset', number
  >>;
  stateEffects: {
    work: Partial<{ runway: number; optionality: number; load: number }>;
    life?: Partial<LifeState>;
  };
  nextWeights: Record<string, number>; // 后续 node id → 加减权；不是硬跳转
};

type EndingContract = {
  id: 'ending_stabilize' | 'ending_conditional_entry' |
    'ending_dual_track' | 'ending_reskill_pilot' |
    'ending_independent' | 'ending_reset';
  match: {
    anyTags: string[];
    allTags?: string[];
    excludeTags?: string[];
    minScore: number;
  };
  routeWeights: Record<string, number>;
  summary: {
    title: string;
    core: string;
    gain: string;
    cost: string;
    qualityVariants: Array<{ when: PredicateGroup; text: string }>;
    astrologyCompareTemplateId: string;
  };
  action: {
    label: string;
    instruction: string;
    horizonDays: number;
  };
};
```

七幕 candidates 固定为：

```json
[
  { "id": "setup", "order": 1, "candidates": ["JL01", "JL02", "JL03"], "profileDriven": true },
  { "id": "terms", "order": 2, "candidates": ["JL04", "JL05", "JL06"], "profileDriven": false },
  { "id": "second_path", "order": 3, "candidates": ["JL07", "JL08", "JL09"], "profileDriven": false },
  { "id": "cost_returns", "order": 4, "candidates": ["JL10", "JL11", "JL12"], "profileDriven": true },
  { "id": "external_window", "order": 5, "candidates": ["JL13", "JL14", "JL15"], "profileDriven": false },
  { "id": "collision", "order": 6, "candidates": ["JL16", "JL17", "JL18"], "profileDriven": true },
  { "id": "landing", "order": 7, "candidates": ["JL19", "JL20", "JL21"], "profileDriven": false }
]
```

“`profileDriven: false`”不表示脱离命盘，只表示该幕可由历史后果优先决定。所有节点仍可吃命理加权；第 1 / 4 / 6 幕则强制要求命盘 profile 进入最终排序，三幕分别负责初始矛盾、代价类型和最终压力测试。

字段使用规则：

- `match.anyTags / allTags` 只接标准化标签，不放中文星曜描述；例如 `astro:fusion:M03`、`flag:portfolio_feedback`、`state:load:high`；
- `minScore` 是进入候选的最低分，不是概率；所有分数相同输入必须可复现；
- `variants` 只替换正文事实，不悄悄改变数值效果；要改变效果必须写在 choice 的条件化效果中；
- `evidenceSlots` 只引用已计算的证据，不在前端重新推命；
- `delayedFlags[].consumeBy` 是内容 lint 的强制字段。若不知道后面谁消费，这个 flag 不允许进入数据；
- `nextWeights` 只影响下一幕及后续幕候选分，不可跳过幕；
- `routeSignals` 是内部累计值，不能作为用户可见的性格类型；
- `ending.match` 先过滤不可能结局，再用 `routeWeights`、状态和质量规则排序。

一个对齐后的节点骨架：

```json
{
  "id": "JL01",
  "stage": "setup",
  "match": {
    "anyTags": ["astro:fusion:M01", "astro:fusion:M02"],
    "allTags": ["entry:job_lost"],
    "minScore": 16
  },
  "roles": ["gu"],
  "copy": {
    "title": "只够再等三个月",
    "situation": "书面 Offer 的固定薪资约为上一份工作的 82%，48 小时内答复。",
    "conflict": "现金确定性，还是继续等待更匹配的机会。"
  },
  "variants": [],
  "evidenceSlots": [{
    "id": "opening_why_now",
    "requiredLayers": ["bazi", "ziwei", "period"],
    "ruleIds": ["M01_cash_anchor", "M02_role_contract"],
    "fallbackTemplateId": "evidence_partial_work_and_money"
  }],
  "choices": [{
    "id": "JL01_C1",
    "label": "回复原则上接受，但先看完整职责和试用期规则",
    "immediate": "顾言把岗位说明和绩效口径发来，Offer 暂时保住，但你还没有签字。",
    "delayedFlags": [
      { "id": "offer_alive", "value": true, "consumeBy": ["JL04", "JL05", "JL19"] },
      { "id": "asked_terms", "value": true, "consumeBy": ["JL04", "ending_conditional_entry"] }
    ],
    "relationEffects": { "gu": 1 },
    "routeSignals": { "employment": 2, "conditional_entry": 1 },
    "stateEffects": { "work": { "runway": 5, "optionality": 1, "load": 1 } },
    "nextWeights": { "JL04": 8, "JL05": 2, "JL06": -5 }
  }],
  "shareable": true,
  "riskTags": ["career", "financial_pressure"]
}
```

### 11.2 运行态 TypeScript 形状（JavaScript 可用 JSDoc 对齐）

```ts
type EpisodeId = 'unemployed_month_five';
type ActId = 'setup' | 'terms' | 'second_path' | 'cost_returns' |
  'external_window' | 'collision' | 'landing';

type WorkState = {
  runway: number;       // 0..100，越高越安全
  optionality: number;  // 0..100，越高可选空间越多
  load: number;         // 0..100，越高越吃力
};

type RelationId = 'gu' | 'zhou' | 'cheng' | 'liang';

type StoryState = {
  actIndex: number;
  workState: WorkState;
  lifeState: LifeState; // 保留现有六维兼容层
  flags: Record<string, boolean | number | string>;
  relations: Record<RelationId, number>; // -5..5
  choiceHistory: ChoiceRecord[];
  seenNodeIds: string[];
  astrologySnapshotId: string;
};

type AstrologySnapshot = {
  natal: {
    baziSignals: NormalizedSignal[];
    ziweiSignals: NormalizedSignal[];
  };
  period: {
    target: string;
    decadeSignals: NormalizedSignal[];
    yearSignals: NormalizedSignal[];
    monthSignals: NormalizedSignal[];
  };
  dominantConflictIds: string[];
  evidenceByRuleId: Record<string, AstrologyEvidence>;
  quality: 'full' | 'partial' | 'sample';
};

type NormalizedSignal = {
  id: string;                 // bazi_output / ziwei_money_flow / flow_career_to:migration
  strength: number;           // 0..1，已封顶归一化
  polarity?: 'supportive' | 'challenging' | 'mixed';
  sourceRefs: string[];       // 原始十神、宫位、星曜、四化 id
};

type AstrologyRule = {
  id: string;                 // M01_cash_anchor
  require: {
    baziAny: SignalMatcher[];
    ziweiAny: SignalMatcher[];
    periodAny: SignalMatcher[];
  };
  weights: { bazi: number; ziwei: number; period: number; fusion: number };
  consequenceBias?: string[]; // payment_risk / role_ambiguity 等，只改变变体权重
};

type StoryNode = {
  id: string;                 // JL01
  episodeId: EpisodeId;
  act: ActId;
  kind: 'choice' | 'bridge';
  title: string;
  cast: RelationId[];
  situation: TextVariant[];
  hiddenConflict: string;
  eligibility: PredicateGroup;
  astrologyRuleIds: string[];
  continuityConsumes: string[];
  visibleEvidenceTemplateId?: string;
  choices: StoryChoice[];     // 0.1.0 正好 3 个
  shareable: boolean;
  riskTags: string[];
};

type StoryChoice = {
  id: string;                 // JL01_C1
  label: string;
  description?: string;
  intentTags: string[];       // negotiate / verify / accept / decline 等，内部分析用
  eligibility?: PredicateGroup;
  fallbackChoiceId?: string;  // 资源不足或合规冲突时替换
  immediate: FeedbackVariant[];
  effects: {
    workState?: Partial<WorkState>;
    lifeState?: Partial<LifeState>;
    relations?: Partial<Record<RelationId, number>>;
    setFlags?: Record<string, boolean | number | string>;
    incrementFlags?: Record<string, number>;
    removeFlags?: string[];
  };
  delayedEffects: DelayedEffect[];
  routeSignals: Record<string, number>; // employment / negotiate / dual / reskill / independent / reset
};

type DelayedEffect = {
  id: string;
  trigger: PredicateGroup;
  earliestAct: ActId;
  latestAct?: ActId;
  consumeOnce: boolean;
  nodeBias?: Record<string, number>;
  textVariantId?: string;
  effects?: StoryChoice['effects'];
};

type EndingDefinition = {
  id: string;
  routeName: string;
  eligibility: PredicateGroup;
  baseScore: number;
  qualityRules: EndingQualityRule[];
  gainsTemplate: string;
  costsTemplate: string;
  realityCheckTemplate: string;
  astrologyCompareTemplateId: string;
};
```

运行态可以预计算 `eligibility`、`astrologyRuleIds` 和 `continuityConsumes`，但落盘时必须仍由 Contract 中的 `match`、`evidenceSlots` 与 `delayedFlags.consumeBy` 推导，不能维护两份人工真相。

### 11.3 谓词结构

不要把条件写成可执行 JS 字符串。建议使用可校验的声明式谓词：

```ts
type Predicate =
  | { fact: 'flag'; key: string; op: 'exists' | 'eq' | 'gte' | 'lte'; value?: unknown }
  | { fact: 'state'; key: keyof WorkState; op: 'gte' | 'lte'; value: number }
  | { fact: 'relation'; key: RelationId; op: 'gte' | 'lte'; value: number }
  | { fact: 'seen'; nodeId: string; op: 'yes' | 'no' }
  | { fact: 'astrology'; signalId: string; op: 'gte'; value: number };

type PredicateGroup = {
  all?: Predicate[];
  any?: Predicate[];
  none?: Predicate[];
};
```

### 11.4 前后端接口建议

后端继续负责确定性排盘和标准化，增加（或先在现有 `/api/astrolabe` 的 `reading` 下增加）只含命理事实的 `storyAstrology`：

```json
{
  "quality": "full",
  "target": "2026-08-14",
  "baziSignals": [],
  "ziweiSignals": [],
  "periodSignals": [],
  "matchedFusionRules": ["M03_proof_before_title"],
  "evidence": {}
}
```

前端 domain 层负责：

1. 根据命理快照和故事状态选择下一节点；
2. 记录即时与延迟后果；
3. 生成节点 view model；
4. 结局评分与“命盘底色 vs 本轮走法”模板填充；
5. 页面层只渲染，不直接读取原始命盘。

建议文件边界（名称可由编码阶段调整）：

```text
data/story-episodes/unemployed-month-five.json
data/story-rules/work-crossroads-astrology.json
src/domain/story/story-engine.js
src/domain/story/story-effects.js
src/domain/story/story-routing.js
src/domain/story/story-ending.js
src/domain/view-models/work-story-view-model.js
```

### 11.5 旧六维状态映射

新内容写 `workState` 为主，同时落旧六维用于兼容：

```text
runway Δ       → stability 同向 0.6 + resources 同向 0.7 + pressure 反向 0.2
optionality Δ  → opportunity 同向 0.8 + resources 同向 0.2 + relationship 同向 0.1
load Δ         → pressure 同向 0.8 + wellbeing 反向 0.8
```

不可从旧六维反推所有剧情事实；例如“是否签约”“是否有排他”必须是显式 flag。

### 11.6 延迟 Flag 生产—消费账本

下表是结构化时的最低消费关系。`consumeBy` 不等于一定跳到该节点，而是这些节点 / 结局必须读取该 flag 来改变资格、权重、正文或质量；不能读取后完全无变化。

| 生产节点 | delayed flags | 必须由以下位置之一消费 |
| --- | --- | --- |
| JL01 | `offer_alive`、`asked_terms` | JL04 / JL05 / JL19；E02 |
| JL01 | `negotiation_open` | JL05；E02 质量 |
| JL01 | `offer_declined`、`search_deadline_14d` | JL06 / JL11 / JL18 / JL21；E04 / E06 质量 |
| JL02 | `review_in_writing` | JL19；E02 |
| JL02 | `portfolio_role` | JL13 / JL19；E01 / E02 质量 |
| JL02 | `company_diligence`、`decision_delay` | JL04 / JL06 / JL11 / JL18；E01 质量 |
| JL03 | `relocation_open`、`benefit_request` | JL04 / JL05 / JL15；E02 |
| JL03 | `remote_trial_requested`、`extra_interview` | JL15 |
| JL03 | `location_boundary` | JL06 / JL15 / JL21；E04 质量 |
| JL04 | `signed_offer`、`legacy_project_risk` | JL12 / JL16 / JL19 / JL20；E01 / E03 质量 |
| JL04 | `bounded_offer` | JL16 / JL19；E01 / E02 / E03 质量 |
| JL04 | `team_truth` | JL19；E01 质量 |
| JL05 | `exclusive_6m` | JL07 选项替换 / JL16；E01 / E03 质量 |
| JL05 | `signing_bonus`、`sidework_reportable` | JL11 / JL16；E02 / E03 质量 |
| JL05 | `future_contact` | JL13 / JL19；E02 低权重变体 |
| JL06 | `targeted_search`、`network_reached` | JL10 / JL13 / JL15 / JL20 |
| JL06 | `portfolio_sprint`、`cheng_meeting` | JL08 / JL10 / JL13；E04 质量 |
| JL06 | `short_gig`、`independent_income_1` | JL10 / JL11 / JL17 / JL20 / JL21；E05 |
| JL07 | `pilot_lead`、`pilot_module` | JL14 / JL16 / JL17 / JL20；E03 / E05 |
| JL07 | `portfolio_proof_1` | JL10 / JL13 / JL20；E04 / E05 质量 |
| JL07 | `zhou_goodwill` | JL14 正文变体；E03 质量 |
| JL08 | `portfolio_feedback`、`proof_gap` | JL13 正文与资格；E04 质量 |
| JL08 | `market_info` | JL15 / JL21；E04 质量 |
| JL08 | `portfolio_delay`、`missed_intro` | JL13 弱机会变体 / JL21；E04 风险变体 |
| JL09 | `shared_budget` | JL11 / JL18；E06 质量 |
| JL09 | `support_used`、`support_debt_1` | JL11 / JL18 / JL21；E06 质量 |
| JL09 | `concealed_pressure` | JL12 / JL18 正文变体；E06 风险变体 |
| JL10 | `gap_explained`、`credible_gap` | JL13 / JL19；E01 / E02 质量 |
| JL10 | `gap_private`、`reference_doubt` | JL19 正文；E01 / E02 风险变体 |
| JL10 | `reference_prepared` | JL13 / JL19；E01 / E02 质量 |
| JL11 | `runway_shortened`、`hard_deadline` | JL18 / JL19 / JL20 / JL21；全部结局成本变体 |
| JL11 | `gig_overload` | JL12 / JL16 / JL20；E03 / E05 风险变体 |
| JL12 | `recovery_2`、`task_dropped` | JL16 / JL18 / JL20 / JL21；E03 / E06 质量 |
| JL12 | `recovery_1`、`timeboxed` | JL16 / JL20；E01 / E03 / E06 质量 |
| JL12 | `overextended` | JL16 / JL18 / JL20 / JL21；E01 / E03 / E05 风险变体 |
| JL13 | `warm_interview`、`portfolio_proof_2` | JL19 / JL20 / JL21；E02 / E04 / E05 |
| JL13 | `polished_story`、`credibility_risk` | JL19 / JL20；E01 / E02 / E04 风险变体 |
| JL13 | `intro_declined` | JL19 / JL21；结局机会成本文案 |
| JL14 | `scope_controlled`、`invoice_protected` | JL17 / JL20；E05 质量 |
| JL14 | `scope_creep`、`payment_risk` | JL17 / JL20；E05 风险变体 |
| JL14 | `scope_refused` | JL17 正文 / 周屿关系；E05 成本变体 |
| JL15 | `remote_trial`、`migration_option` | JL20 / JL21；E04 |
| JL15 | `remote_project`、`portfolio_proof_1` | JL16 / JL17 / JL20；E04 / E05 |
| JL15 | `formal_only` | JL19；E01 / E02 质量 |
| JL16 | `project_exited_cleanly` | E01 / E03 质量 |
| JL16 | `dual_disclosed` | JL20；E03 质量 |
| JL16 | `employer_doubt` | JL19 / JL20；E01 / E03 风险变体 |
| JL16 | `hidden_dual_track`、`overextended` | JL20；E03 风险变体 |
| JL17 | `partial_payment`、`invoice_protected` | JL20；E05 质量 |
| JL17 | `client_reference`、`payment_delayed` | JL20 / JL21；E05 的得失变体 |
| JL17 | `delivery_paused` | JL20；E05 成本变体 |
| JL18 | `family_deadline`、`fallback_ready` | JL19 / JL21；E01 / E06 质量 |
| JL18 | `extended_runway`、`biweekly_review` | JL20 / JL21；E04 / E06 质量 |
| JL18 | `support_withdrawn` | JL21；全部结局安全余量成本变体 |
| JL19 | `ending_stabilize`、`ending_conditional_entry` | E01 / E02 匹配 |
| JL20 | `ending_dual_track`、`ending_independent` | E03 / E05 匹配 |
| JL21 | `ending_reskill_pilot`、`ending_independent`、`ending_reset` | E04 / E05 / E06 匹配 |

实现 lint 规则：每个 `delayedFlags[].consumeBy` 至少含一个更晚节点或结局；反向扫描确认目标的 `match`、`variants.when`、choice 条件、`nextWeights` 或 ending 质量规则中实际引用该 flag。只有写在账本里但代码没读取，仍判定为死标记。

## 12. 内容 QA 与纸面走查

### 12.1 自动校验

- 每局恰好 7 个选择节点；
- 每幕始终至少有一个合法节点；
- 每节点恰好 3 个可见动作或合法 fallback；
- 每个选择至少一项收益和一项成本（含延迟成本）；
- 第 4–6 幕每个节点至少消费一个历史标记或提供有意义变体；
- 所有 `setFlags` 均被路由、变体或结局消费，禁止死标记；
- 所有结局从至少两条不同路径可达；
- `bridge` 每局不超过 2 个，且不出现在 1 / 5 / 7 幕；
- 命理质量为 `partial` 时不显示三层共同依据；
- 分享数据不含出生时间、地点、原始命盘、余额或关系身份。

### 12.2 首批 10 条纸面路径

1. 接受 Offer → 划清职责 → 拒绝项目 → 背调 → 放弃引荐 → 固定岗位 → 稳住阵地；
2. 议价 → 保留副线 → 接项目模块 → 突发支出 → 控范围 → 报备双线 → 双线过渡；
3. 拒 Offer → 整理作品 → 找程岚 → 解释空窗 → 获正式面试 → 选固定岗位 → 带条件入场；
4. 拒 Offer → 接短单 → 做全量试点 → 过载 → 客户加需求 → 保护付款 → 独立接单；
5. 异地 Offer → 远程试做 → 家庭预算 → 突发支出 → 四周远程试用 → 选择证据最强线 → 转行试航或稳住阵地；
6. 职级降一级 → 核心模块换作品 → 程岚反馈 → 背调 → 旧项目被看见 → 两线相撞 → 双线过渡；
7. 接受排他高固定薪资 → 拒绝付费项目 → 睡眠恢复 → 放弃外部窗口 → 固定岗位 → 稳住阵地；
8. 隐瞒家庭压力 → 继续等待 → 突发支出 → 加短单 → 支持关系爆点 → 定止损线 → 低谷复位；
9. 项目全接 → 范围膨胀 → 45 天账期 → 无付款保护 → 仍选独立 → 独立接单风险变体；
10. 多线并行 → 连续过载 → 主动砍任务 → 共同定四周 → 暂停 10 天 → 低谷复位高质量变体。

### 12.3 人工审校问题

- 去掉命理依据后，这个事件是否仍是可信的现实事件？
- 换一张盘后，节点顺序、人物或矛盾重点是否真的改变？
- 用户有没有被某个选项暗中道德评判？
- 接受降薪和暂停是否也能形成有尊严的路线？
- 是否把伴侣 / 家人、HR、创业者写成单一反派？
- 延迟后果是否来自用户实际选择，而不是作者强行惩罚？
- 结局是否明确区分“已经验证”与“仍只是可能”？
- 命理解释是否可追溯到真实结构，又没有越界成确定预言？

## 13. 0.1.0 编码交接清单

编码开始前，以本文为内容源完成：

1. 将 21 个节点结构化为剧本 JSON；
2. 建立标准化命理信号适配器，不让故事引擎读取原始 `astrolabeData`；
3. 实现七幕路由、延迟标记、人物信任和三项工作筹码；
4. 实现六结局及质量变体；
5. 实现开局、关键节点、结局三处可见命理依据；
6. 加入确定性回放与至少六组命盘 / 时间对照测试；
7. 加入上述 10 条纸面路径对应的自动或半自动走查；
8. 页面编码前先确认单幕 view model，避免页面直接拼命理逻辑。

本文内容在 0.1.0 上线前仍属于 `active/`。当 21 节点、六结局和触发矩阵全部进入生产数据并通过走查后，再将其作为实现基线移动到 `reference/`，而不是提前标记完成。
