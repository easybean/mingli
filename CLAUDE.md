# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 当前阶段与改动优先级

Mingli 是紫微+八字结合的命理产品原型。当前阶段是**纯前端打磨**：用户对前一版（Codex 写的）的 UI、UX、用户体验、文案均不满意，目标是把前端体验做到满意之后，才进入后台改造和小程序迁移。

改动优先级：**UI / UX / 文案 > 任何"加功能"**。下列事项在本阶段明确不做（见 `mingli-refactor-plan.md` 第一轮排除项）：

- 不接真实大模型调用
- 不做账号系统、进度存档、真实付费
- 不新增书源、不扩展新命理体系
- 不大规模重写后端规则
- 不做复杂数值 RPG / 复杂存档

## 命令

```bash
npm install
npm start                  # 启动本地服务，默认 http://127.0.0.1:3000
npm run validate:samples   # 固定样例命盘回归校验
npm run verify             # node --check server.js + validate:samples，每轮改动后跑
```

约定：每轮规则、专题结构或后端改动落地前先跑一次 `npm run verify` 再提交。前端样式/文案改动不强求跑 verify，但跑一遍只要几秒。

## 顶层架构

后端是一个**单文件 Node HTTP 服务**，前端是**原生 ES Modules 多文件**结构。两者之间只通过 `/api/*` JSON 通信，前端不直接消费后端 HTML。

### 后端（`server.js`，约 35KB 单文件）

- 用 `iztro` 排紫微，`lunar-typescript` 算农历/八字，配合本地 `bazi-utils.js`、`knowledge.js`、`life-game.js`、`ziwei-patterns.js`。
- 真太阳时修正：基于 `data/city-longitudes.json`（339 个中国地级行政区经度）+ 均时差（`equationOfTimeMinutes`）。
- 中国夏令时（1986–1991）在 `CHINA_DAYLIGHT_SAVING_RANGES` 里硬编码，启用时会在排盘前减 1 小时。
- 路由：
  - `GET /api/health`
  - `GET /api/cities`
  - `GET /api/astrolabe` — 主排盘接口，返回原始命盘 + `reading`（含 `topics`、`manual`、`lifeGame`、`fiveElement`）+ `horoscope` 等。`reading.fiveElement`（`{dayElement, favored, basis, source, useSpiritTopic}`）由 `knowledge.js` 的 `buildFiveElementGuide` 推出喜用五行：**调候查表优先**（`data/knowledge-rules/bazi-tiaohou-qiongtong.json`，《穷通宝鉴》日干×月支调候用神表），查不到才回退结构取用（用神倾向）；供前端「我适合戴什么」「人物画像」等做生活化延伸（不接电商）。
  - `GET /api/flow-days`
  - 静态：`/` → `public/index.html`；`/src/*` → 源码模块。
- 后端只做**确定性排盘和 JSON 标准化**，所有"展示文案"的生成都集中在前端 view model 层（见下）。

### 前端架构（`src/` 模块化，无框架）

设计原则在 `docs/frontend-architecture.md`，关键是 **View Model 跨端**：领域逻辑不依赖 DOM，未来迁移小程序复用 view model。

```
src/
  app/        main / router / store / events     # 状态、事件绑定、页面切换
  api/        mingli-api.js                       # 唯一可以拼接 URL 的地方
  domain/
    life-state.js                                 # 6 维 lifeState 系统（v1）
    game-branching.js                             # 按 lifeState 重排卡牌
    view-models/                                  # 把后端 reading 翻译成页面可消费结构
  pages/      home / today / game / chart / profile  (reading / simple 已弃用)
  components/ birth-form / focus-picker / bottom-nav / cosmos / html
  styles/     tokens / base / layout / components / pages
  adapters/   web-storage / web-time              # 浏览器适配（含主题持久化），跨端时替换
  platform/   wechat-mini-program.md / social-share.md
```

**渲染模型：** 字符串模板 + `innerHTML`。`main.js` 订阅 store，每次 `notify()` 触发整页重渲染（`appRoot.innerHTML = renderActivePage()`）。事件用单层委托绑定在 `appRoot` 和 `navRoot` 上（见 `src/app/events.js`），靠 `data-*` 属性派发。

**状态：** `src/app/store.js` 是手写的发布订阅，全局单例。`gameSession.choices` 是数组，`day` 和 `lifetime/month/...` 用 `scope` 字段区分。**第一版选择全在内存里**，刷新页面会丢，账号和服务端存档暂不做。

**页面 ↔ View Model：** 页面只做渲染+点击，命理规则放 view model：
- `home-view-model.js` — 已生成态用 `pickTodayCard` 在首页直接复用今日卡数据
- `today-view-model.js` — 今日一题、focus 主题选择（7 项，按当天有题的主题点亮/置灰）、反馈结构
- `game-view-model.js` — 路线名、进度、当前卡、`lifeState` 排序后的下一题、完成态、终局总结（按"已答卡"续作，不重做）
- `reading-view-model.js` — 现仅产出「你的选择」（`choiceReading`：按尺度分组 + 综合解读，读 `gameSession.choices`），供游戏页「回顾」tab 用；原「命盘依据」已拆给 chart-view-model
- `chart-view-model.js` — 命盘页：基础信息 / 八字基础（`baziBasis`，接基础信息下方）/ 重点宫位 / 十二宫列表（可按主题筛选）/ 各主题 tab 下的紫微主线（`activeTopic`，按 theme id 一一对应 `reading.topics`）/ 格局
- `today-focus.js` — 今日 focus 选项 + 流命宫叠本命的主题判断
- `accessory-view-model.js` — 「我适合戴什么」：把 `reading.fiveElement.favored`（喜用五行）映射成材质/颜色方向（手串、水晶等），供「我的」页展开卡用；只做命盘延伸，不放购买链接、不写"转运/招财/挡灾"承诺

**lifeState（6 维：pressure / opportunity / relationship / stability / resources / wellbeing）：** 数值 0-100，初始 50；pressure 升=坏，其余升=好。`deltaForChoice` 优先吃题库 `stateEffects`，没有才回退 `STYLE_DELTAS`。两个题库池现在都用 6 维 stateEffects（旧 2 维 statEffects 已统一）。`game-branching.js` 按 lifeState 影响非月度尺度的排序；选择去重见 `store.recordChoice`（同 scope+cardId 只留一条）。

### 主题 ID 与展示标签的映射约定

后端/领域层用英文 id：`career / wealth / relationship / health / mindset / family / network`（迁移 `migration`）。
展示层中文：**事业 / 财富 / 关系 / 健康 / 心态 / 家庭 / 人际**（迁移）。
解读层主线标题另用书面语（事业主线 / 财运主线 / 婚恋主线 / 健康主线 / 心性主线 / 家庭主线 / 人际主线），但 id 已全栈统一为 `relationship`（原 `marriage` 已废）。`helpers.js`、`life-state.js`、`today-focus.js`、`knowledge.js`、`life-game.js` 都按英文 id 走。

## 文案约束（重要）

详细规则见 `mingli-product-design-detail.md §11` 和 `mingli-ui-design.md`。要点：

- **禁止绝对预言**：不写"一定会发生 / 必有大灾 / 注定失败 / 投资必赚 / 身体必有疾病"。
- **推荐表达**："更容易遇到 / 可能反复出现 / 适合提前处理 / 如果选择主动推进，代价是……"
- **抽象主题 → 生活化情境**。
  - ❌ "事业压力测试" / "关系边界课题"
  - ✅ "今天有人临时把任务推给你，你要不要接？"
- **选项必须是动作，不是态度**。
  - ❌ "主动突破" / "稳健推进" / "修复关系"
  - ✅ "直接接下任务，并争取把成果展示出来" / "先确认边界，只接自己能负责的部分"
- 当前文案系统**未清干净的地方**：`game-view-model.js` 的 `tendencyDescription`、`helpers.js` 的 `routeName / outcomeTags / shareSummaryText` 仍在个别出口暴露"主动/稳健/修复"倾向词（解读页「综合解读 / 你的选择」已改用具体描述、避开了这些标签）。

## 视觉与移动端基线

`mingli-ui-design.md` 和 `mingli-mobile-ux-design.md` 是**用户已确认的设计基准**，不是参考稿。改 UI 前先对照：

- 视觉关键词：沉静 / 微光 / 选择感 / 阶段感 / 个人化。不要后台风、玄学广告页、大面积渐变。
- **主题系统**：`src/styles/tokens.css` 是色彩单一真相源；`:root` 为基底，主题用 `:root[data-theme="..."]` 覆盖 CSS 变量。当前两套外观（旧的「深暖墨金」「水墨禅意」已按用户要求删除）：**星象·夜**（默认，深空近黑 `#0B0913`）/ **星象·昼**（晨纸浅底 `#F4EFE4`），共用 `#cosmos` 星图/北斗/八卦氛围层（`src/components/cosmos.js`，配色用 `--cosmos-*` 变量按主题切换；北斗为已按真实图样修正的版本）。切换在「我的」页、localStorage 持久化（`web-storage.js` + `store.ui.theme`，`main.js` 在 `<html>` 上切 `data-theme`）。
- 手机端规则：单列为主、单手可点、首屏只保留最重要路径、卡片按任务顺序排，不按数据结构排。
- 底部导航固定 4 项：**今日 / 游戏 / 命盘 / 我的**。原「解读」页已拆解下线：「你的选择」进游戏页「闯关 / 回顾」切换的回顾 tab（`store.ui.gameView`），「命盘依据」拆成八字基础 + 紫微主线归入命盘页。命盘 = 十二宫页（`chart-page.js`），我的 = 外观/设置页（`profile-page.js`，含主题切换 + 「我适合戴什么」展开卡，`store.ui.accessoryOpen`）；`reading-page.js`、`simple-page.js` 已弃用。

## 验证样例

`data/samples/` 下是固定样例命盘，`scripts/validate-samples.js` 比对结构。后端排盘逻辑、`reading` 输出结构、knowledge profile 改动必跑 `npm run verify`。

## 关键参考文档（按重要性）

1. `mingli-handoff.md` — 项目交接说明，先读这个
2. `mingli-refactor-plan.md` / `work-plan.md` — 当前 roadmap，含每阶段完成状态
3. `mingli-product-design-detail.md` — 产品路径、页面职责、文案语气
4. `mingli-mobile-ux-design.md` — 手机端布局基准
5. `mingli-ui-design.md` — 视觉/色彩/字号/卡片样式基准
6. `docs/frontend-architecture.md` — 前端架构决策
7. `docs/life-state-system.md` — lifeState v1 设计
8. `docs/life-game-algorithm.md` — 人生游戏出题算法（信号/打分/选卡、流命宫叠本命、五尺度怎么随运限变）
9. `docs/backend-scope-cadence.md` — 后端阶段：多尺度关卡的持久化/刷新机制（周期键+自定节奏+跨期解锁，长尺度做总结而非 grind）
10. `docs/card-authoring-guide.md` — 关卡命题设计指南（可整篇交给大模型出题）：卡片 schema、触发词词表、主题↔信号、分类矩阵、示范题、现成 prompt

## 不要做的事

- 不要在页面层直接读 `astrolabeData` 原始字段——走 view model。
- 不要在 view model / domain 层引用 `document`、`localStorage`、浏览器事件，那些放 `src/adapters/`。
- 不要在 `src/api/mingli-api.js` 之外拼 `/api/*` URL。
- 不要把"主动路线/稳健路线/修复路线"作为最终用户可见文案再扩散到新出口。
- 不要新建 `*.md` 设计稿或总结文档，除非用户明确要求。
- 启动服务一律 `npm start`，不要自定义端口或裸跑 `node server.js`。
