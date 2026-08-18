# Mingli 文档目录

最后整理：2026-08-14

本目录按文档状态分类。判断项目下一步时，只查看 `active/`；不要从已完成文档或旧规划中捡未勾选事项继续做。

## 目录规则

| 目录 | 含义 | 能否作为当前待办 |
| --- | --- | --- |
| `active/` | 正在执行或已经确认的下一阶段规划 | 可以 |
| `completed/` | 已经交付完成的计划或设计稿 | 不可以 |
| `reference/` | 当前实现、算法、架构和写作规范 | 不可以，除非 active 文档引用 |
| `archive/superseded/` | 已被新版方向替代的旧计划 | 绝对不可以 |

根目录只保留：

- `README.md`：项目运行和功能说明；
- `CLAUDE.md`：仓库工作约束与文档路由。

`data/knowledge-*.md` 属于命理知识库元数据，不是产品任务板，因此继续留在 `data/`。`skills/*/SKILL.md` 属于项目技能定义，也不参与计划分类。

## 当前执行中

- [`active/product-roadmap-choice-sandbox.md`](active/product-roadmap-choice-sandbox.md)：当前唯一产品总规划。下一交付是「工作岔路」内容圣经、八字 × 紫微 × 运限触发矩阵，以及《失业后的第五个月》纵向切片。
- [`active/work-crossroads-content-bible.md`](active/work-crossroads-content-bible.md)：0.1.0「工作岔路」内容基线，包含《失业后的第五个月》21 个事件节点、六结局、命理触发矩阵和编码数据 contract；随纵向切片实现继续校验。
- [`active/employed-want-leave-content-map.md`](active/employed-want-leave-content-map.md)：0.2.0《在职，但越来越想离开》内容地图，说明第二套职业剧情的七幕、人物、结局与事实边界。

## 已完成

- [`completed/ziwei-pattern-plan.md`](completed/ziwei-pattern-plan.md)：紫微格局两批规则计划，已完成。
- [`completed/design/mingli-product-design-detail.md`](completed/design/mingli-product-design-detail.md)：上一版产品设计交付。
- [`completed/design/mingli-mobile-ux-design.md`](completed/design/mingli-mobile-ux-design.md)：上一版移动端 UX 交付。
- [`completed/design/mingli-ui-design.md`](completed/design/mingli-ui-design.md)：上一版 UI 交付。
- [`completed/design/mingli-design-brief.md`](completed/design/mingli-design-brief.md)：上一版视觉设计 brief。

“已完成”表示文档所代表的交付已经结束，不表示其中描述的旧产品方向仍然有效。

## 长期参考

- [`reference/mingli-handoff.md`](reference/mingli-handoff.md)：2026-06 技术实现快照。
- [`reference/frontend-architecture.md`](reference/frontend-architecture.md)：前端模块和 View Model 架构。
- [`reference/life-game-algorithm.md`](reference/life-game-algorithm.md)：现有命盘信号、运限和选题算法。
- [`reference/life-state-system.md`](reference/life-state-system.md)：现有六维状态系统。
- [`reference/card-authoring-guide.md`](reference/card-authoring-guide.md)：现有两套题库的写卡规范。

## 已废止归档

- `archive/superseded/life-game-plan.md`
- `archive/superseded/mingli-product-ux-plan.md`
- `archive/superseded/mingli-refactor-plan.md`
- `archive/superseded/work-plan.md`
- `archive/superseded/backend-scope-cadence.md`

这些文件保留历史决策和实现过程。里面即使存在 `[ ]` 或 `[~]`，也不属于当前待办。

## 新文档放置规则

- 当前要执行的产品/内容计划：放 `active/`；
- 完成后：移动到 `completed/`，并删除或说明遗留待办；
- 只解释系统现状：放 `reference/`；
- 被新方向替代：移动到 `archive/superseded/`，保留废止说明；
- 每次移动后同步更新本索引和仓库内引用。
