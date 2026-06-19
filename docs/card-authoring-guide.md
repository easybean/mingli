# 关卡命题设计指南（可直接交给大模型出题）

> 用途：让人或大模型（豆包等）按本指南批量编写 Mingli 的关卡题，产出能被引擎正确匹配、
> 文案合规、且"因人而异"的卡片 JSON。把本文整篇贴给大模型即可，末尾附有现成 prompt。

---

## 0. 一张题是什么 & 为什么"因人而异"

每张题 = **一个命理触发条件 + 一个生活情境 + 三个动作选项**。

引擎拿用户的命盘（八字十神、紫微星曜/宫位、格局）+ 当前运限，去和每张题的 `triggers`
**逐条打分**，命中得分高的题才浮给该用户。所以**同一个生活领域，不同命盘的人会看到不同的题**
——这正是"有些题对一些人是问题、对别人不是"的实现方式。设计题目时要主动利用这一点。

---

## 1. 题分两类（决定放哪个文件、写多具体）

| 类型 | level | 喂哪些尺度 | 放哪个文件 | 情境写法 |
|---|---|---|---|---|
| **事件级 event** | 今日 / 最近一月 | `data/guanqia.json`（数组，引擎自动按 day 处理） | **必须**具体到某天某事的场景（situation/conflict 必填） |
| **命题级 arc** | 一年 / 十年 / 一生 | `data/life-game-templates.json` 的 `templates[]` | 命题级、有画面但更概括（dramaticText 为主，situation/conflict 可选） |

> 注意：两个文件目前各自独立（后端阶段会合并，见 `docs/backend-scope-cadence.md`）。现在加题：
> 今日/月的题加进 `guanqia.json`；年/十年/一生的题加进 `life-game-templates.json` 的 `templates`。

---

## 2. 卡片 JSON 结构（严格按此）

```json
{
  "id": "career-seven-kills-pressure",
  "type": "trial",
  "theme": "career",
  "title": "被塞了一个谁都不想接的硬任务",
  "tone": "heavy",
  "summary": "一句话概述（列表/兜底用）",
  "dramaticText": "2-4 句具体情境叙述（游戏页/今日页主要显示这条）",
  "situation": "一句客观处境（今日页情境卡用；event 必填，arc 可省）",
  "conflict": "一句两难（今日页冲突行用；event 必填，arc 可省）",
  "triggers": ["七杀", "官禄", "杀破狼格"],
  "choices": [
    {
      "label": "动作标题（是动作，不是态度）",
      "style": "bold",
      "description": "具体怎么做（一句）",
      "cost": "代价（一句，具体）",
      "reward": "收益（一句，具体）",
      "stateEffects": { "pressure": 7, "opportunity": 6, "relationship": 0, "stability": -3, "resources": 1, "wellbeing": -5 },
      "feedback": "选后反馈（一句，讲这步改变了什么，不贴'主动路线'标签）"
    }
    // 共 3 个 choice，style 必须是 bold / steady / repair 各一个
  ]
}
```

**字段规则：**
- `id`：英文短横线，建议 `主题-命理条件-关键词`（如 `wealth-fu-yin-foundation`）；guanqia 也可 `theme_序号`。全库唯一。
- `type`：`trial`(试炼/难题) 或 `opportunity`(机会/契机)。
- `theme`：八选一 → `career 事业 / wealth 财富 / relationship 关系 / health 健康 / mindset 心态 / family 家庭 / network 人际 / migration 迁移`。
- `tone`：`heavy / medium / light / dramatic`（仅影响语气标注）。
- `choices`：**正好 3 个**，`style` 必须 `bold`(直接推进) / `steady`(稳着来) / `repair`(先修边界关系) 各一。

---

## 3. stateEffects：6 维数值（每个 choice 必填）

六维（绝对值建议 0–8，可正可负）：

| 键 | 含义 | 方向 |
|---|---|---|
| `pressure` | 压力 | **升 = 坏**（唯一一个） |
| `opportunity` | 机会 | 升 = 好 |
| `relationship` | 关系 | 升 = 好 |
| `stability` | 稳定 | 升 = 好 |
| `resources` | 资源 | 升 = 好 |
| `wellbeing` | 身心 | 升 = 好 |

**经验取向**（不是硬规则，按题意调）：
- `bold`：pressure↑、opportunity↑、stability↓ 或 wellbeing↓（搏一把）
- `steady`：stability↑、pressure 略↓、opportunity 小↑（稳健）
- `repair`：relationship↑、wellbeing↑、pressure↓、opportunity 略↓（先收口）

三个选项的数值要**有区分、各有取舍**，不要雷同。

---

## 4. 触发词词表（triggers 只能从这里选）

**黄金法则：要"因人而异"，就用具体且稀有的信号当主触发——优先格局，其次特定十神/星曜落宫；
不要用"人人都有"的（主线标题、单个宫名）当主条件。** 每张题建议 2–4 个 trigger，至少 1 个是格局或十神/星曜。

### 4.1 格局（命中分最高=14，区分度最高，首选）
紫府朝垣格、府相朝垣格、机月同梁格、杀破狼格、财荫夹印格、日月并明格、昌曲拱命格、左右扶命格、禄马交驰格、羊陀夹命格、火铃夹命格、命里逢空格、马落空亡格、命无正曜格、日照雷门、月朗天门、极居卯酉、天乙拱命、科名会禄、三奇嘉会、文桂文华、文星暗拱、明珠出海、月生沧海、日月照壁、石中隐玉、巨机化酉、火贪铃贪、日月反背、月同遇煞、巨逢四煞、刑忌夹印、廉贞贪杀、擎羊入庙

### 4.2 八字十神（命中分 9–11，随盘强弱变）
比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印

### 4.3 紫微星曜（命中分 6–12，看落在哪宫）
- 主星（14）：紫微、天机、太阳、武曲、天同、廉贞、天府、太阴、贪狼、巨门、天相、天梁、七杀、破军
- 辅曜：左辅、右弼、文昌、文曲、天魁、天钺、禄存、天马
- 煞曜（常用于试炼）：擎羊、陀罗、火星、铃星、地空、地劫
- 四化：写成「星+化X」，如 `武曲化禄`、`太阴化忌`（化禄/权/科/忌）

### 4.4 宫位（命中分仅 1–2，**只能当辅助、不当主条件**）
命宫、兄弟、夫妻、子女、财帛、疾厄、迁移、仆役、官禄、田宅、福德、父母、身宫

### 4.5 主线标题（命中分 7–11，但**每张盘都有=不区分人，别当主条件**）
事业主线、财运主线、婚恋主线、健康主线、心性主线、家庭主线、人际主线

---

## 5. 主题 → 该挂哪些触发词（对味才得分高）

| 主题 | 相关宫位 | 顺向/机会信号（opportunity 多用） | 逆向/难题信号（trial 多用） | 常见十神 |
|---|---|---|---|---|
| career 事业 | 官禄/迁移/命宫/身宫/仆役 | 紫府朝垣格、府相朝垣格、三奇嘉会、天乙拱命、左右扶命格、天魁、天钺 | 杀破狼格、廉贞贪杀、七杀、破军、擎羊、陀罗 | 正官、七杀、正印 |
| wealth 财富 | 财帛/田宅/福德/命宫 | 财荫夹印格、昌曲拱命格、文桂文华、天府、太阴 | 火贪铃贪、地空、地劫、马落空亡格、劫财 | 正财、偏财、食神、伤官 |
| relationship 关系 | 夫妻/父母/子女/福德/迁移 | 月朗天门、日月照壁、天乙拱命、太阴、天同 | 日月反背、刑忌夹印、巨门、贪狼、擎羊 | 正官、七杀、正财、偏财 |
| health 健康 | 疾厄/福德/父母/田宅 | 正印、偏印、福德、天乙拱命 | 羊陀夹命格、火铃夹命格、巨逢四煞、太阴化忌 | 偏印、正印 |
| mindset 心态 | 命宫/福德/身宫/迁移 | 月生沧海、石中隐玉、命无正曜格、文昌、文曲 | 命里逢空格、地空、地劫、伤官、巨门 | 比肩、劫财、偏印、伤官 |
| family 家庭 | 父母/田宅/兄弟/子女 | 财荫夹印格、田宅、太阴、天府 | 刑忌夹印、父母化忌、偏印 | 正印、偏印、食神、伤官 |
| network 人际 | 仆役/兄弟/迁移 | 左右扶命格、天魁、天钺、左辅、右弼 | 巨逢四煞、劫财、巨门 | 比肩、劫财、食神、伤官 |
| migration 迁移 | 迁移/身宫/官禄 | 禄马交驰格、天马、太阳 | 马落空亡格、七杀、破军 | （随事业/财富） |

> 机会题(opportunity)的 trigger 用「顺向/吉」信号，试炼题(trial)用「逆向/凶」信号——类型对味会额外加分。

---

## 6. 文案约束（硬性，违反则不合格）

1. **禁绝对化预言**：不写"一定会发生/必有大灾/注定失败/投资必赚/必生病"。用"更容易/可能反复/适合提前处理/如果…代价是…"。
2. **抽象主题 → 生活化情境**：
   - ❌ "事业压力测试"　✅ "上司把别人做砸的项目转交给你全权收尾"
   - arc 级可命题化但仍要有画面：✅ "被推上位的那一程"
3. **选项是动作，不是态度**：
   - ❌ "主动突破/稳健推进/修复关系"　✅ "直接接下任务，并争取把成果当众展示"
4. **不要在用户可见文案里出现"主动路线/稳健路线/修复路线"这类标签**。

---

## 7. 分类体系（按这个矩阵组织，避免"一题打天下"）

每张题归入一个三维坐标：**主题(8) × 命理条件 × 粒度(event/arc)**。

- 同一主题下，**按不同命理条件**各写题：例如「事业」可分
  - 事业 × 七杀/杀破狼格 → 硬碰硬、破局换轨类
  - 事业 × 正印/机月同梁格 → 靠体系/学习/背后支撑类
  - 事业 × 紫府/府相朝垣格 → 平台承接、坐稳位置类
- 这样不同命盘的人在"事业"里看到的是不同的题。
- 建议每个「主题 × 命理条件」格子至少 2–3 张（event 和 arc 各覆盖），题库越满越不重复、越因人而异。

---

## 8. 示范题（已分类，作为大模型的样例）

### 示例 A — 事业 × 七杀/杀破狼格 × event(今日) × trial
```json
{
  "id": "career-seven-kills-pressure",
  "type": "trial",
  "theme": "career",
  "title": "上司把一个别人做砸的项目全权丢给你收尾",
  "tone": "heavy",
  "summary": "烫手项目落到你头上，接是替人背锅，不接怕错过被看见的机会",
  "dramaticText": "项目已经延期两周、原负责人被调走。上司在群里点名让你兜底，下周三就要给客户交付。所有人都在等你表态。",
  "situation": "别人的烂摊子被指派给你全权收尾，时间紧、风险高",
  "conflict": "接，是替别人的失误买单；不接，是把一次能被高层看见的机会让出去",
  "triggers": ["七杀", "杀破狼格", "官禄"],
  "choices": [
    { "label": "直接接下，并争取把交付成果当众展示", "style": "bold", "description": "主动认领，把时间线和风险当场讲清，要资源也要署名。", "cost": "交付不及格，锅就落到你头上。", "reward": "高层第一次记住你的名字。", "stateEffects": { "pressure": 7, "opportunity": 7, "relationship": -1, "stability": -3, "resources": 1, "wellbeing": -5 }, "feedback": "你把'替人擦屁股'改写成一次自我证明，短期更累更暴露，但站到了被看见的位置。" },
    { "label": "先确认边界，只接自己能负责的核心模块", "style": "steady", "description": "把任务拆开，认领能扛的部分，烂尾留给原团队收口。", "cost": "可能被说不够担当。", "reward": "守住质量，不背别人的雷。", "stateEffects": { "pressure": 2, "opportunity": 2, "relationship": 1, "stability": 5, "resources": 1, "wellbeing": 0 }, "feedback": "你没逞强，划清了能负责的范围，稳住质量也稳住了自己。" },
    { "label": "不正面接，推动上司补人一起扛", "style": "repair", "description": "不拒绝，但把'需要再加一个人'摆上台面，让决策回到上司。", "cost": "可能被视为推活。", "reward": "保住精力，避免单点过载。", "stateEffects": { "pressure": -3, "opportunity": -1, "relationship": 2, "stability": 3, "resources": 0, "wellbeing": 3 }, "feedback": "你把皮球合理地踢回决策层，护住了自己的节奏，但也让出了一点风头。" }
  ]
}
```

### 示例 B — 财富 × 财荫夹印格 × arc(一生/十年) × opportunity
```json
{
  "id": "wealth-fu-yin-foundation",
  "type": "opportunity",
  "theme": "wealth",
  "title": "一次把家底扎稳的窗口",
  "tone": "dramatic",
  "summary": "出现一个能把流动财富沉淀成长期资产的机会",
  "dramaticText": "手里攒下的钱和资源到了一个节点：可以把它从'漂着'变成'落地'——一处根基、一份长期资产。它不会天天发光，但能在往后稳稳托住你。",
  "triggers": ["财荫夹印格", "田宅", "正财"],
  "choices": [
    { "label": "集中下注，一次把核心资产锁定", "style": "bold", "description": "把大部分资源压到一处真正看好的根基上。", "cost": "灵活性下降，短期手头变紧。", "reward": "一步到位地立起长期城墙。", "stateEffects": { "pressure": 3, "opportunity": 4, "relationship": 0, "stability": 6, "resources": -4, "wellbeing": 1 }, "feedback": "你把漂浮的钱钉成了地基，短期紧一些，但后方从此更稳。" },
    { "label": "分批沉淀，边积累边落地", "style": "steady", "description": "制定节奏，逐步把流动资源转成稳态资产。", "cost": "见效慢，需要长期惦记。", "reward": "稳扎稳打，留有余地。", "stateEffects": { "pressure": -1, "opportunity": 2, "relationship": 0, "stability": 5, "resources": 1, "wellbeing": 1 }, "feedback": "你不急于一次到位，让资产一点点落地，盘面越来越稳。" },
    { "label": "先修补漏洞，再谈沉淀", "style": "repair", "description": "先把现有的资源漏洞和负债理清，再考虑扎根。", "cost": "错过当下这个窗口的部分红利。", "reward": "根基不带病上路。", "stateEffects": { "pressure": -2, "opportunity": -2, "relationship": 1, "stability": 4, "resources": 2, "wellbeing": 2 }, "feedback": "你先堵住了出血点，扎根这件事往后放，但放得踏实。" }
  ]
}
```

### 示例 C — 心态 × 命无正曜格/偏印 × arc × trial
```json
{
  "id": "mindset-empty-chart-doubt",
  "type": "trial",
  "theme": "mindset",
  "title": "总觉得自己'没有底牌'",
  "tone": "medium",
  "summary": "看不清自己的核心优势，容易随环境飘、自我怀疑",
  "dramaticText": "你常觉得自己什么都会一点、又什么都不算顶尖，像一张'没有正主'的牌。别人问你最强的是什么，你答不上来——这种悬空感时不时冒出来。",
  "triggers": ["命无正曜格", "偏印", "命宫"],
  "choices": [
    { "label": "先动起来，用做出来的事反推优势", "style": "bold", "description": "不等想清楚，先接几件具体的事，在结果里找自己的强项。", "cost": "前期会更乱、更累。", "reward": "用行动把'悬空'踩实。", "stateEffects": { "pressure": 4, "opportunity": 5, "relationship": 0, "stability": -1, "resources": 1, "wellbeing": -2 }, "feedback": "你不再空想定位，让做出来的事告诉你擅长什么，路在脚下慢慢清晰。" },
    { "label": "刻意积累证据，给自己建一份'底牌清单'", "style": "steady", "description": "把每次被认可、被需要的事记下来，定期回看。", "cost": "见效慢，需要耐心。", "reward": "自我评价从情绪转向证据。", "stateEffects": { "pressure": -1, "opportunity": 2, "relationship": 1, "stability": 4, "resources": 0, "wellbeing": 3 }, "feedback": "你开始用证据代替情绪给自己打分，悬空感被一条条事实压住。" },
    { "label": "先处理'怕被看穿'的内耗", "style": "repair", "description": "承认这种不安，找人聊或写下来，先把情绪卸下。", "cost": "短期没有'变强'的实感。", "reward": "把内耗降下来，腾出心力。", "stateEffects": { "pressure": -4, "opportunity": -1, "relationship": 2, "stability": 2, "resources": 0, "wellbeing": 5 }, "feedback": "你先和那份不安和解，没急着证明什么，心里反而松了、稳了。" }
  ]
}
```

---

## 9. 直接交给大模型的 prompt（按需替换【】）

```
你是 Mingli 命理关卡的出题作者。请严格按我给的《关卡命题设计指南》产出关卡题 JSON。

本次任务：为【主题=人际 network】写【6】张题，分布为【event 4 张 + arc 2 张】，
每张挂不同的命理触发条件（覆盖：左右扶命格 / 比肩劫财偏重 / 巨门 / 仆役坐煞 等），
让不同命盘的人看到不同的题。

硬性要求：
1. 严格用指南第 2 节的 JSON 结构；choices 正好 3 个，style 为 bold/steady/repair 各一。
2. stateEffects 用第 3 节的 6 维（pressure 升=坏，其余升=好），三个选项数值有区分。
3. triggers 只能从第 4 节词表里选，至少 1 个是格局或十神/星曜，别用主线标题/单个宫名当主条件。
4. event 题必填 situation/conflict 且情境具体到某件事；arc 题命题级但有画面。
5. 严守第 6 节文案约束：不绝对化、情境生活化、选项是动作、不出现"主动/稳健/修复路线"字样。
6. 直接输出 JSON 数组，不要解释。

参考样例见指南第 8 节。
```

> 拿到大模型产出后：event 题并入 `data/guanqia.json`，arc 题并入 `data/life-game-templates.json` 的
> `templates[]`；然后 `npm run verify` 跑回归（题库结构/多样性校验）。注意新机会题若触发词太通用会
> universally 命中、压垮多样性校验——优先把机会题挂在格局上（见指南黄金法则）。
