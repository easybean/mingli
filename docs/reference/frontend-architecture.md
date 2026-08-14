# Mingli Frontend Architecture

本文件定义 Mingli 新前端的架构方案。后续实现不再基于现有 `public/index.html` 的布局和代码继续扩展，而是从新的模块化结构开始。

## 1. 结论

### 不再单文件实现

不建议继续在一个 `index.html` 里写完。

原因：

- 当前 `public/index.html` 已经超过 4000 行，页面、状态、接口、渲染、样式混在一起。
- 后续要支持手机端主路径、人生游戏、今日关卡、深度解读、命盘、时间轴，单文件会继续失控。
- 以后要迁移微信小程序和海外社交媒体分享页，必须把“核心数据模型”和“页面渲染”拆开。

### 新架构目标

```text
核心规则和展示模型可复用
Web 只是一个端
微信小程序是另一个端
分享页/落地页是另一个端
```

### 第一版实现策略

先不引入复杂框架，采用轻量模块化 Web 架构：

- 原生 ES Modules。
- 多文件 CSS。
- 独立状态管理模块。
- 独立 API 客户端。
- 独立页面模块。
- 独立跨端 View Model 层。

这样比继续单文件稳定，也比立刻引入 React/Vue 更轻。

后续如果要做大型产品，可以再迁移到 Vue/React/Taro/uni-app。

## 2. 架构原则

### 原则 1：领域模型不依赖 DOM

例如今日关卡、人生游戏、近期路线、身份摘要，都先整理成纯数据：

```js
{
  title,
  subtitle,
  tags,
  primaryAction,
  cards,
  feedback
}
```

Web 页面、微信小程序、分享卡片都消费这份数据。

### 原则 2：页面只负责展示和交互

页面模块不直接理解命理规则。

页面只做：

- 渲染。
- 点击。
- 切换。
- 输入。
- 调用状态层。

命理解释、游戏路线、今日关卡文案由领域层产出。

### 原则 3：核心路径优先

第一阶段只实现：

```text
输入 -> 生成 -> 今日 -> 游戏 -> 解读
```

命盘和时间轴可以先保留入口，后续重构。

### 原则 4：先手机端，再桌面端

CSS 和组件结构以手机端为基准。

桌面端只是扩展排版，不改变核心路径。

### 原则 5：为跨端预留适配层

不要把 Web 特有东西写进核心层：

- 不在核心层使用 `document`。
- 不在核心层读写 DOM。
- 不在核心层依赖 `localStorage`。
- 不在核心层依赖浏览器事件。

这些放到 adapter。

## 3. 推荐目录结构

```text
public/
  index.html                 # 新 Web 入口，只挂载 app，不堆业务

src/
  app/
    main.js                  # Web 启动入口
    router.js                # 页面切换
    store.js                 # 前端状态
    events.js                # 统一事件绑定

  api/
    mingli-api.js            # /api/astrolabe、/api/cities、/api/flow-days

  domain/
    view-models/
      home-view-model.js     # 首页展示模型
      today-view-model.js    # 今日关卡展示模型
      game-view-model.js     # 人生游戏展示模型
      reading-view-model.js  # 解读展示模型
      profile-view-model.js  # 我的页展示模型
    game-session.js          # 前端游戏会话状态，如当前题、选择记录
    share-model.js           # 分享卡片/社媒文案模型

  pages/
    home-page.js
    today-page.js
    game-page.js
    reading-page.js
    chart-page.js
    profile-page.js

  components/
    bottom-nav.js
    birth-form.js
    action-card.js
    choice-card.js
    feedback-card.js
    section-card.js
    tag-list.js
    collapse.js

  styles/
    tokens.css               # 色彩、字号、间距变量
    base.css                 # reset 和基础排版
    layout.css               # app shell、底部导航、页面容器
    components.css           # 卡片、按钮、标签
    pages.css                # 页面级样式

  adapters/
    web-storage.js           # localStorage/sessionStorage
    web-share.js             # navigator.share / copy link
    web-time.js              # 当前时间

  platform/
    wechat-mini-program.md   # 小程序迁移说明，不在 Web 端执行
    social-share.md          # 海外社媒分享适配说明
```

## 4. 页面层设计

### App Shell

Web 端整体结构：

```html
<body>
  <main id="app"></main>
  <nav id="bottom-nav"></nav>
</body>
```

`index.html` 只保留：

- meta。
- root 容器。
- CSS 引入。
- `main.js` 引入。

不写业务逻辑。

### 页面路由

第一版不需要浏览器复杂路由，可以用内部状态：

```text
home
today
game
reading
chart
profile
```

后续需要分享链接时，再引入 URL hash：

```text
#/today
#/game
#/reading
```

### 页面职责

| 页面 | 模块 | 责任 |
| --- | --- | --- |
| 首页 | `home-page.js` | 输入、生成、今日入口 |
| 今日 | `today-page.js` | 今日一题、选择反馈 |
| 游戏 | `game-page.js` | 人生主线逐题推进 |
| 解读 | `reading-page.js` | 解释层、折叠目录 |
| 命盘 | `chart-page.js` | 十二宫、盘面工具 |
| 我的 | `profile-page.js` | 出生信息、当前路线、设置 |

## 5. 状态层设计

### 全局状态

```js
{
  activePage,
  birthInput,
  astrolabeData,
  gameSession,
  ui
}
```

### birthInput

```js
{
  gender,
  calendar,
  date,
  birthTime,
  timeIndex,
  birthPlace,
  target
}
```

### astrolabeData

后端 `/api/astrolabe` 原始返回。

原则：

- 原始数据保留。
- 页面不直接吃原始数据。
- 页面使用 view model。

### gameSession

前端选择状态：

```js
{
  scope,
  currentIndex,
  routeScores,
  choices,
  currentFeedback,
  completedToday
}
```

### 为什么 gameSession 放前端

第一版不做账号和存档，选择过程可以先放前端内存。

后续再支持：

- localStorage。
- 登录账号。
- 服务端存档。
- 小程序云开发。

## 6. View Model 层

View Model 是跨端关键。

后端返回的是命理数据，View Model 负责把它转成页面可用结构。

### Home View Model

输入：

```js
astrolabeData
```

输出：

```js
{
  mode: 'empty' | 'ready',
  hero,
  todayEntry,
  quickEntries,
  identityTags,
  disclaimer
}
```

### Today View Model

输出：

```js
{
  title,
  progressLabel,
  scenario,
  question,
  choices,
  feedback,
  nextActions
}
```

### Game View Model

输出：

```js
{
  routeName,
  progress,
  tendency,
  currentChallenge,
  choices,
  feedback,
  logSummary,
  stageSummary
}
```

### Reading View Model

输出：

```js
{
  intro,
  sections: [
    {
      id,
      title,
      summary,
      defaultOpen,
      blocks
    }
  ]
}
```

### Share Model

输出：

```js
{
  title,
  description,
  imageText,
  hashtags,
  urlParams
}
```

这部分未来服务微信分享、X/TikTok/Instagram/Threads 等社交传播。

## 7. 样式架构

### CSS 不再写在 index.html 内

拆成：

```text
tokens.css
base.css
layout.css
components.css
pages.css
```

### tokens.css

集中定义：

- 颜色。
- 字号。
- 行高。
- 间距。
- 圆角。
- 阴影。

### 组件样式

组件样式按语义命名：

```css
.choice-card
.choice-card.is-selected
.feedback-card
.bottom-nav
.page-shell
```

避免继续出现大量一次性 class。

## 8. 跨端策略

### Web

Web 端第一版用于：

- 快速验证产品体验。
- 手机浏览器访问。
- 分享链接落地页。
- 后续海外社交平台导流。

### 微信小程序

小程序不直接复用 Web DOM 代码，但可以复用：

- View Model 设计。
- 文案生成规则。
- 游戏会话状态结构。
- API 返回结构。
- 页面职责。

未来小程序目录可以是：

```text
miniapp/
  pages/
    today/
    game/
    reading/
    chart/
    profile/
  components/
    choice-card/
    feedback-card/
  utils/
    view-models/
```

如果后面决定用 Taro/uni-app，再统一跨端。

第一版不要急着上跨端框架，因为现在最重要是把产品路径跑通。

### 海外社交媒体

海外社交平台重点不是完整产品，而是分享和回流。

需要预留：

1. 分享标题。
2. 分享描述。
3. 分享卡片图片文本。
4. 可复制结果。
5. URL 参数恢复状态。

建议先做纯 Web 分享模型：

```text
我的今日关卡：主动接旗
当前路线：稳健推进
关键词：边界 / 节奏 / 被看见
```

后续再扩：

- Open Graph meta。
- Twitter Card。
- 分享海报。
- TikTok/Instagram 图片文案。

## 9. API 边界

现有接口可以先保留：

- `/api/astrolabe`
- `/api/cities`
- `/api/flow-days`

前端只通过 `src/api/mingli-api.js` 调用。

页面不能直接拼接口 URL。

### 后续可新增接口

如果后面需要服务分享和小程序：

```text
POST /api/session
GET /api/session/:id
POST /api/share-card
```

第一版先不做。

## 10. 迁移方案

### 阶段 1：建立新前端骨架

创建：

```text
src/
public/index.html
```

新的 `index.html` 只做挂载。

保留旧版代码参考，但不复制旧布局。

### 阶段 2：首页和今日页

先实现：

- app shell。
- 底部导航。
- birth form。
- home view model。
- today view model。
- 今日选择交互。

完成标准：

- 手机端首屏清楚。
- 可以生成。
- 生成后进入今日。
- 今日可以选择并看到反馈。

### 阶段 3：人生游戏页

实现：

- game session。
- 当前关卡。
- 三选择。
- 反馈。
- 下一关。
- 折叠行动日志。

完成标准：

- 默认只显示当前关卡。
- 选择影响路线倾向。
- 下一关不会锁死第一条路线。

### 阶段 4：解读页

实现：

- reading view model。
- 目录。
- 折叠。
- 默认展开关键专题。
- 依据折叠。

完成标准：

- 首屏不是术语墙。
- 能看依据，但不打断主路径。

### 阶段 5：命盘 / 我的 / 时间

实现：

- chart page。
- profile page。
- time summary。

完成标准：

- 专业内容有地方放。
- 首页不再堆设置和资料。

## 11. 实现前确认点

进入代码前需要确认：

1. 是否接受不再单文件 `index.html`。
2. 是否接受第一版不用 React/Vue，先用原生 ES Modules。
3. 是否接受底部导航作为手机主导航。
4. 是否接受先做 Web，再为小程序复用 View Model。
5. 是否接受旧 `public/index.html` 被替换为新挂载入口。
6. 是否需要保留旧版页面为 `legacy.html` 方便对照。

## 12. 建议决策

我的建议：

1. 不继续维护旧 `index.html`。
2. 将旧版复制成 `public/legacy.html`，只作备份和对照。
3. 新建 `src/` 模块化前端。
4. `public/index.html` 改成新 app 挂载入口。
5. 第一刀只实现首页 + 今日关卡。
6. 跑通后再做人生成长游戏页。

这样既能从头设计，又不会一次重写全部页面导致不可验证。
