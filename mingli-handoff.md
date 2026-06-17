# Mingli 项目交接说明

最后更新：2026-06-16

## 1. 项目是什么

Mingli 是一个紫微斗数与八字结合的命理产品原型，核心不是单纯“看盘”，而是把命盘转成可交互的用户路径：

`排盘 -> 今日关卡 -> 最近一月 / 最近十年 / 一生主线 -> 深度解读`

当前产品已经从单页 Demo 重构成模块化前端，重点在手机端体验、今日关卡、人生游戏和结构化解读。

## 2. 现在做到哪里了

- 已有排盘 API，支持阳历、农历、真太阳时、流年流月流日流时。
- 已有八字和紫微的专题知识层。
- 已有 `今日关卡`，按天生成单题选择。
- 已有人生游戏，按时间范围生成逐题推进的关卡。
- 已有 `lifeState`，用户选择会影响压力、机会、关系、稳定、资源、身心。
- 已完成新版前端架构，旧的单文件页面已拆成 `src/` 模块。
- 已完成基础验证脚本，`npm run verify` 可跑样例回归。

## 3. 怎么启动

```bash
npm install
npm start
```

默认地址：

```text
http://127.0.0.1:3000
```

验证：

```bash
npm run verify
```

## 4. 核心入口

- 后端入口：[`server.js`](/Users/douw/codex/mingli/server.js)
- 前端入口：[`public/index.html`](/Users/douw/codex/mingli/public/index.html)
- 新前端主代码：[`src/app/main.js`](/Users/douw/codex/mingli/src/app/main.js)
- 状态管理：[`src/app/store.js`](/Users/douw/codex/mingli/src/app/store.js)
- 路由：[`src/app/router.js`](/Users/douw/codex/mingli/src/app/router.js)
- 今日关卡：[`src/pages/today-page.js`](/Users/douw/codex/mingli/src/pages/today-page.js)
- 人生游戏：[`src/pages/game-page.js`](/Users/douw/codex/mingli/src/pages/game-page.js)
- 深度解读：[`src/pages/reading-page.js`](/Users/douw/codex/mingli/src/pages/reading-page.js)
- 命理游戏规则：[`life-game.js`](/Users/douw/codex/mingli/life-game.js)

## 5. 前端结构

当前前端是原生 ES Modules，没有再用单文件拼接。

目录大致分为：

- `src/app`：启动、路由、状态、事件绑定
- `src/api`：接口调用
- `src/domain`：命理和游戏的纯逻辑、View Model
- `src/pages`：页面渲染
- `src/components`：组件
- `src/styles`：样式
- `src/adapters`：本地存储、时间等浏览器适配

这是为了后续能继续迁移到小程序或其他前端容器。

## 6. 当前产品逻辑

### 首页

首页只做入口分发，不再堆所有资料。重点是让用户快速进入：

- 今日关卡
- 最近一月
- 人生主线

### 今日关卡

今日关卡是日常进入点，逻辑是“每天只做一个选择”。  
它会根据命盘和当前时间生成当天题目，并支持用户先选关注主题：

- 事业
- 财富
- 关系
- 健康
- 心态

用户在今日关卡的选择会改变 `lifeState`，并在反馈中显示短期变化。

### 人生游戏

人生游戏是主体验，不是静态解读页。  
它按时间范围生成试炼、机会、阶段关卡和选择分支，当前支持：

- 今日
- 最近一月
- 最近一年
- 最近十年
- 一生主线

### 深度解读

深度解读页保留命理依据、专题分析、知识命中和章节结构，用于解释“为什么是这些题”。

## 7. 数据和规则

### 命理底盘

后端排盘依赖 [`iztro`](https://github.com/SylarLong/iztro) 和 `lunar-typescript`。

### 知识层

已有八字和紫微的书籍知识库，当前策略是：

- 不再盲目加书
- 先消化现有书源
- 重点提升专题命中和可读性

### 人生游戏

人生游戏使用公共模板库加命盘触发规则生成，不是固定剧本。  
当前的模板库和规则都在 `life-game.js` 和相关数据文件里。

### 人生状态系统

用户选择不会改命盘，但会改生活状态。  
状态字段目前是：

- 压力
- 机会
- 关系
- 稳定
- 资源
- 身心

这部分的设计说明在 [`docs/life-state-system.md`](/Users/douw/codex/mingli/docs/life-state-system.md)。

## 8. 已知约定

- 主题展示层已经统一为：
  - 事业
  - 财富
  - 关系
  - 健康
  - 心态
- 命理内部主题 id 仍然保留 `career / wealth / relationship / health / mindset`，不要轻易改掉。
- 当前产品是“倾向与选择模拟”，不是事件预言。
- 不做账号系统，不做进度存档，不做复杂数值 RPG。
- 目前没有接真实大模型调用。

## 9. 交接时先看什么

如果接手人要继续做，建议先看这几个文件：

1. [`mingli-refactor-plan.md`](/Users/douw/codex/mingli/mingli-refactor-plan.md)
2. [`work-plan.md`](/Users/douw/codex/mingli/work-plan.md)
3. [`docs/frontend-architecture.md`](/Users/douw/codex/mingli/docs/frontend-architecture.md)
4. [`docs/life-state-system.md`](/Users/douw/codex/mingli/docs/life-state-system.md)
5. [`README.md`](/Users/douw/codex/mingli/README.md)

## 10. 当前主要未完成项

- 继续拉开不同命盘在今日 / 月度 / 长线题库上的差异。
- 继续丰富选项类型，减少固定三分法的重复感。
- 继续打磨今日关卡和人生游戏的文案，让它更像产品，不像资料页。
- 继续优化手机端密度、按钮层级和说明浮层。

## 11. 一句话总结

Mingli 现在不是一个“排盘展示站”，而是一个以命盘为底盘、以今日关卡和人生游戏为主路径的选择型命理产品原型。
