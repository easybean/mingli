# 人生游戏出题算法（life-game 选题机制）

> 本文记录"今日/最近一月/最近一年/最近十年/一生主线"五个尺度的关卡是**怎么从命盘生成出来的**。
> 反映的是 2026-06-18 审计 + 修复（流命宫叠本命）后的真实代码。改动出题逻辑后请同步更新本文。
> 相关原则见 `mingli-handoff.md`、记忆 `project-foundation-correctness`。

## 0. 一句话

排盘得到**本命八字 + 紫微十二宫 + 各级运限(大运/流年/流月/流日)**，把这些拆成**信号**，再让题库里的每张卡片模板按"自己的触发词命中了多少信号"打分，最后按尺度筛选出该尺度的关卡。**本命决定一个人长期会遇到哪些题，运限决定当下这个时间点先浮出来哪几道。**

## 1. 数据来源（排盘层，`server.js`）

入口 `buildAstrolabe(query)`：

- `astrolabe = astro.bySolar/byLunar(...)` → 紫微命盘，`palaces` = 十二宫（每宫含 `majorStars / minorStars / adjectiveStars`，星可带 `mutagen` 四化）。
- `horoscope = astrolabe.horoscope(target)` → 各级运限。`compactHoroscope` 只保留 `{ index, heavenlyStem, earthlyBranch, palaceNames, mutagen }`：
  - `palaceNames`：长度 12 的数组，是**该运限层的十二宫名按位置排布**（旋转的，集合恒为完整十二宫）。`palaceNames[i]` 与本命 `palaces[i]` **同一位置对齐**。
  - `mutagen`：该期天干引发的四化星名（逐期变化，是运限最有信息量的字段之一）。
- `bazi = buildBaziDetails(...)`（`bazi-utils.js` + lunar）→ 四柱十神（本气+藏干）、`dayMaster`、`luck.daYun`（9 步大运，每步嵌 `liuNian`→`liuYue`）。
- `patterns = evaluateZiweiPatterns(palaces)`（`ziwei-patterns.js`）→ 命中的格局。

`buildReading({summary, palaces, bazi, horoscope})` 组装解读，并调用：

```
buildLifeGame({ reading, bazi, palaces, patterns, horoscope })
```

`target`（当前时间）来自 `query.get('target')`，决定流年/流月/流日取哪一期。前端"当前时间"字段每次进页面取此刻（见 store）。

## 2. 五个尺度（`buildLifeGame` → `buildLifeGameScope`）

`buildLifeGame` 对 `lifetime / decade / year / month / day` 各调一次 `buildLifeGameScope`。每个尺度内部三步：**建信号索引 → 建尺度画像 → 给模板打分选卡**。

| 尺度 | 含义 | 随什么变化 | 题库池 |
|---|---|---|---|
| `lifetime` | 一生主线 | 不变（纯本命） | `MERGED_TEMPLATES` |
| `decade` | 最近十年 | 当前**大运**（`bazi.luck.daYun` 按年龄取） | `MERGED_TEMPLATES` |
| `year` | 最近一年 | 当前**流年** | `MERGED_TEMPLATES` + `SHORT_HORIZON_TEMPLATES` |
| `month` | 最近一月 | 当前**流月** | `MERGED_TEMPLATES` + `SHORT_HORIZON_TEMPLATES` |
| `day` | 今日关卡 | 当前**流日** | `GUANQIA_TEMPLATES` + `SHORT_HORIZON_TEMPLATES` |

模板先按 `templateAppliesToScope`（模板的 `scopes` 字段）过滤，只有挂了该尺度标签的才进入候选。

## 3. 信号索引（`buildSignalIndex`，**纯本命**）

入参 `{ reading, bazi, patterns, palaces }`（**不含 horoscope**——运限走第 4 步的尺度画像）。把命盘拆成可被触发词命中的信号：

- `natalGodCounts`：四柱十神（本气 `ganShiShen` + 藏干 `hiddenShiShen`）计数 → 八字本命十神。
- `palaceSignalMap / starToPalaces / mutagenSignals`：十二宫的主星/辅星/杂曜名、"星名+四化"、星↔宫归属。
- `topicTitles / topicSignalMap / manualTitles / patternNames / knowledgeTopics`：解读层的主线、章节、格局、书源等文本信号。
- `haystack`：以上所有信号拼成的大字符串，用于兜底文本匹配（大运十神也只进到这里）。

## 4. 尺度画像（`buildScopeProfile({ scope, bazi, horoscope, palaces })`）

这是**运限真正进入打分的通道**。每个非 lifetime 尺度产出：

- `focusLabel`：如"…丙午流年""…乙巳大运"（前端展示用；回归脚本校验 year/month/day 含"流年/流月/流日"字样）。
- `preferredThemes`：该期偏重的主题。= 年龄阶段主题(`stageTheme`) + **流命宫落点主题**(见下) 去重后取前 3~4。
- `extraSignals`：该期额外信号 = 当期十神 + 当期四化 `mutagen` + **流命宫激活的本命星**(见下)。

### 4.1 流命宫叠本命 `flowActivatedSignals(scope, palaces)`（关键，2026-06 修复）

> 修复前这里用 `themesFromPalaceNames(整个 palaceNames)`，但 `palaceNames` 每期都是完整十二宫集合（只旋转），成员判断结果**每期恒等**，对流年/流月/流日毫无区分——是 bug。

现在的做法（`palaceNames[i]` 与 `palaces[i]` 同位对齐）：

1. 在 `palaceNames` 里找"命宫/官禄/财帛/疾厄/夫妻/迁移"各自的下标 `i`，对应的本命宫就是 `palaces[i]`——即**该运限的这些流宫落在了本命哪个宫**。
2. `stars`：取这些落点本命宫的**主星名**，作为"当期被激活的本命星" → 进 `extraSignals`。
3. `themes`：由**流命宫落点的本命宫名**经 `themesFromPalaceNames` 反查主题 → 进 `preferredThemes`。

因为 `index`/落点逐期移动、`mutagen` 逐期不同，所以 `preferredThemes` 和 `extraSignals` 会**随流年/流月/流日真正变化**。

## 5. 模板打分（`scoreTemplate(template, context)`）

每张卡片模板有一组 `triggers`（触发词，如 `['流年','官禄','正官','七杀','破军']`）。

### 5.1 单触发词命中 `matchTrigger`（按优先级，命中即返回）

| 命中类型 | 来源 | 基础分 |
|---|---|---|
| pattern 格局 | `patternNames` | 14（吉/凶与卡片类型对味 +4，否则 +1） |
| bazi 十神 | `natalGodCounts` | 9 + min(出现次数-1, 2) |
| mutagen 四化 | `mutagenSignals` | 9 |
| star 星曜 | `starToPalaces` | 落在主题相关宫 10+2×宫数，否则 6；命中身宫且主题含身宫 +2 |
| topic 主线 | `topicTitles` | 主主题 11，其余 7 |
| knowledge | `knowledgeTopics` | 6 |
| manual 章节 | `manualTitles` | 2 / 1 |
| text 文本 | `haystack.includes` | 2 |
| 无 | — | null（不计） |

### 5.2 综合分（要点，非全部）

```
base = Σ(命中信号分)
     + 主题对齐×2 + 精确格局×3 + 机会信号×3 + 风险信号×3
     + min(12, 具体信号×3) + min(6, 宫位专属信号×2)
运限加权：
     + preferredThemes 含本卡主题            → +10
     + 本卡 scopes 含当前尺度                  → +8
     + 今日且 guanqia 题                       → +18  ；今日且非 guanqia → -12
     + min(12, extraSignals∩命中信号 数 ×4)   ← 当期四化/流命宫激活星 在这里发力
     + 流年尺度主题不在 preferred             → -4
     + 大运尺度机会卡主题不在 preferred       → -2
质量约束：
     机会卡强信号<2 → -8 ；试炼卡强信号<2 → -4 ；强信号≥3 → +4
     宽泛信号过多而具体信号不足、通用机会/试炼卡信号不足 → 各类罚分
年龄约束：
     ≤18 岁：偏关系/健康/心态/贵人，压事业财富机会
     ≤22 岁：偏心态/关系/事业，压资产类
```

> "强信号" = 命中类型不是 manual / text 的信号（即真正落到格局/八字/星曜/四化/主线）。

## 6. 选卡（`selectScored` + `buildLifeGameScope` 收尾）

- `selectScored` 按分数降序，分 `trial`(试炼) 和 `opportunity`(机会) 两类各自选取，受 `scale`（数量上下限、每主题上限）和 `minScore`（试炼 16 / 机会 18）约束，避免同主题扎堆。
- `cards = trials + opportunities`；`month` 尺度再经 `buildMonthlyQuestline` 编排成关卡线。
- `day` 尺度额外产出 `todayBrief`，并因 guanqia +18 的强偏置，今日题主要来自闯关题库。
- 同一输入完全确定性（无随机），同命盘同日期结果可复现。

## 7. 主题映射（英文 id ↔ 宫位）

`life-game.js` 顶部：

```
THEME_PRIMARY_TOPIC = { career:事业主线, wealth:财运主线, relationship:婚恋主线,
                        health:健康主线, mindset:心性主线, family:父母, migration:迁移 }
THEME_RELATED_PALACES = {
  career:[官禄,迁移,命宫,身宫,仆役], wealth:[财帛,田宅,福德,命宫],
  relationship:[夫妻,父母,子女,福德,迁移], health:[疾厄,福德,父母,田宅],
  mindset:[命宫,福德,身宫,迁移], family:[父母,田宅,兄弟,子女], migration:[迁移,身宫,官禄] }
```

> 注意：领域层/关卡用 `relationship`、解读层主线用 `marriage`，命名尚未统一（见任务 #1）。

## 8. 已知缺口 / 后续（与"底层必须正确"原则相关）

- **(已修)** 流命宫叠本命、palaceNames 失效、`daYunGodCounts` 死代码 —— 任务 #6，2026-06-18 完成。
- **流时** 不做（产品决定，精确到每日即可）。
- **(待办 E)** `bazi.luck.daYun[].liuNian/liuYue` 的**八字**十神尚未单独喂入 year/month 信号；当前 year/month 靠"四化 + 流命宫叠本命"已能区分。
- **(任务 #1)** 关卡层 `relationship` 与解读层 `marriage` 等命名/ID 未统一。
- **(任务 #2)** 兄弟/子女/奴仆/父母 四宫未纳入任何主线。
- **(任务 #3)** 命盘页未补全十二宫展示。

## 9. 怎么验证出题正确

1. 结构回归：`npm run verify`（`scripts/validate-samples.js` 校验各尺度有卡、focusLabel 含流年/月/日、机会卡多样性、年龄适配等不变量；**无逐卡冻结基线**，改评分逻辑不必重置样例，只要不变量仍成立）。
2. 运限生效：用同一命盘、不同 `target` 日期直接调 `buildAstrolabe`，对比各尺度 `scopes[x].cards` —— 应满足：day 随流日变、month 随流月变（同月内稳定）、year 随流年变（同年内稳定）、decade 随大运变、lifetime 恒定。
