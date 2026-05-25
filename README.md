# Mingli

紫微斗数排盘 API 与可视化页面 Demo。底层排盘使用 [`iztro`](https://github.com/SylarLong/iztro)，后端只做确定性排盘和 JSON 标准化，前端负责展示十二宫、主星、辅星、大限和流年快照。

## 本地运行

```bash
npm install
npm start
```

固定样例校验：

```bash
npm run validate:samples
```

结构回归校验：

```bash
npm run verify
```

默认地址：

```text
http://127.0.0.1:3000
```

如需指定端口：

```bash
PORT=4000 npm start
```

## API

```text
GET /api/astrolabe
```

常用参数：

- `calendar`: `solar` 或 `lunar`
- `date`: 出生日期，格式 `YYYY-M-D`
- `birthTime`: 出生时间，格式 `HH:mm`
- `birthPlace`: 出生地城市名，开启真太阳时时会自动匹配经度；本地内置 339 个中国地级行政区经度
- `trueSolarTime`: 可选，`true` 或 `false`，默认 `false`；启用时按出生地经度和均时差修正排盘时辰，需要阳历输入
- `daylightSaving`: 可选，`true` 或 `false`，默认 `false`；启用时会先把钟表时间减 1 小时再排盘
- `timeIndex`: 可选，时辰序号，`0` 到 `12`；通常不用传，后端会从 `birthTime` 推导
- `gender`: `男` 或 `女`
- `target`: 可选，运限定位时间，例如 `2023-8-19 3:12`；默认使用请求当下时间
- `algorithm`: `default` 或 `zhongzhou`

示例：

```text
http://127.0.0.1:3000/api/astrolabe?date=2000-8-16&timeIndex=2&gender=女
```

## 当前范围

- 已实现：阳历/农历排盘、十二宫展示、当前时点定位、大限、流年、流月、流日、流时快照、八字详盘、一生大运流年、结构化解读草稿、人生手册章节、剧本关卡线索、AI Prompt Seed、紫微/八字知识库元数据、第一批规则命中、引用依据展示。
- 已实现：知识库目录层（书籍批次、用途、专题、后续抽取目标），可为后续规则扩展、引用扩展、专题解读和轻量检索提供统一入口。
- 已实现：固定样例盘与验证脚本，可检查章节、专题、知识命中、引用、检索层与紫微/八字专题结构是否退化。
- 约定：后续每轮规则或专题结构改动，先执行 `npm run verify` 再继续提交或发布。
- 未实现：真实大模型调用、全量古籍规则抽取、奇门/易经等其他体系接入、漫画图片生成、用户系统、持久化。
