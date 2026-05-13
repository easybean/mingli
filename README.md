# Mingli

紫微斗数排盘 API 与可视化页面 Demo。底层排盘使用 [`iztro`](https://github.com/SylarLong/iztro)，后端只做确定性排盘和 JSON 标准化，前端负责展示十二宫、主星、辅星、大限和流年快照。

## 本地运行

```bash
npm install
npm start
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
- `timeIndex`: 时辰序号，`0` 到 `12`
- `gender`: `男` 或 `女`
- `target`: 运限目标时间，例如 `2023-8-19 3:12`
- `algorithm`: `default` 或 `zhongzhou`

示例：

```text
http://127.0.0.1:3000/api/astrolabe?date=2000-8-16&timeIndex=2&gender=女&target=2023-8-19%203:12
```

## 当前范围

- 已实现：阳历/农历排盘、十二宫展示、大限、流年、流月、流日、流时快照。
- 未实现：AI 解读、漫画人生手册、剧本杀关卡、用户系统、持久化。
