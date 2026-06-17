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
  - `GET /api/astrolabe` — 主排盘接口，返回原始命盘 + `reading`（含 `topics`、`manual`、`lifeGame`）+ `horoscope` 等。
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
  pages/      home / today / game / reading / simple
  components/ birth-form / focus-picker / bottom-nav / html
  styles/     tokens / base / layout / components / pages
  adapters/   web-storage / web-time              # 浏览器适配，跨端时替换
  platform/   wechat-mini-program.md / social-share.md
```

**渲染模型：** 字符串模板 + `innerHTML`。`main.js` 订阅 store，每次 `notify()` 触发整页重渲染（`appRoot.innerHTML = renderActivePage()`）。事件用单层委托绑定在 `appRoot` 和 `navRoot` 上（见 `src/app/events.js`），靠 `data-*` 属性派发。

**状态：** `src/app/store.js` 是手写的发布订阅，全局单例。`gameSession.choices` 是数组，`day` 和 `lifetime/month/...` 用 `scope` 字段区分。**第一版选择全在内存里**，刷新页面会丢，账号和服务端存档暂不做。

**页面 ↔ View Model：** 页面只做渲染+点击，命理规则放 view model：
- `home-view-model.js` — 已生成态用 `pickTodayCard` 在首页直接复用今日卡数据
- `today-view-model.js` — 今日一题、focus 主题选择、反馈结构
- `game-view-model.js` — 路线名、进度、当前卡、`lifeState` 排序后的下一题、终局总结
- `reading-view-model.js` — 解释层目录
- `choice-presentation.js` — 按 `theme + label 正则` 把抽象 style 翻成具体动作词

**lifeState（6 维：pressure / opportunity / relationship / stability / resources / wellbeing）：** 数值 0-100，初始 50。`deltaForChoice` 优先吃后端 `stateEffects`，没有时回退 `STYLE_DELTAS[bold/steady/repair]`。**当前缺口**：`lifeState` 已经能改、能在 `game-branching.js` 里影响排序，但选项三件套骨架感仍重，且不同命盘在题库上拉不开差异。

### 主题 ID 与展示标签的映射约定

后端和领域层用英文 id：`career / wealth / relationship / health / mindset`（家庭/迁移用 `family / migration`）。
展示层统一为中文：**事业 / 财富 / 关系 / 健康 / 心态**。
两套不要互相串改，`choice-presentation.js`、`helpers.js`、`life-state.js`、`today-focus.js` 里都按英文 id 走。

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
- 当前文案系统的**未清干净的地方**：`helpers.js` 的 `routeName / outcomeTags / shareSummaryText` 里仍在多个出口暴露"主动路线/稳健路线/修复路线"标签——这是骨架感的主要来源。

## 视觉与移动端基线

`mingli-ui-design.md` 和 `mingli-mobile-ux-design.md` 是**用户已确认的设计基准**，不是参考稿。改 UI 前先对照：

- 视觉关键词：沉静 / 纸感 / 微光 / 选择感 / 阶段感 / 个人化。不要后台风、玄学广告页、大面积渐变。
- 色 token 已经落进 `src/styles/tokens.css`（主色 `#245C63`，纸感背景 `#F8F3E8`）。
- 手机端规则：单列为主、单手可点、首屏只保留最重要路径、卡片按任务顺序排，不按数据结构排。
- 底部导航固定 5 项：**今日 / 游戏 / 解读 / 命盘 / 我的**。`chart` 和 `profile` 当前是 `simple-page.js` 占位页。

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

## 不要做的事

- 不要在页面层直接读 `astrolabeData` 原始字段——走 view model。
- 不要在 view model / domain 层引用 `document`、`localStorage`、浏览器事件，那些放 `src/adapters/`。
- 不要在 `src/api/mingli-api.js` 之外拼 `/api/*` URL。
- 不要把"主动路线/稳健路线/修复路线"作为最终用户可见文案再扩散到新出口。
- 不要新建 `*.md` 设计稿或总结文档，除非用户明确要求。
- 启动服务一律 `npm start`，不要自定义端口或裸跑 `node server.js`。
