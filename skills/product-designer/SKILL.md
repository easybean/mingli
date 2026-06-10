---
name: product-designer
description: Use when designing or restructuring any page, flow, feature, or interaction in the Mingli project. This skill must run before frontend implementation. It defines user goals, core path, page structure, content priority, and what the user should do first, next, and last.
---

# Product Designer

Use this skill before writing frontend code.

## Goal

Turn vague feature work into a clear product path:

1. user goal
2. entry action
3. main path
4. page structure
5. success state

Do not start from components. Start from user behavior.

## Required output before coding

For any non-trivial UI change, first write:

1. `用户目标`
2. `进入页面后第一步要做什么`
3. `第二步看什么`
4. `第三步去哪里`
5. `页面结构`
6. `不该出现在首屏的内容`

Keep it short and concrete.

## Working rules

- Prefer one primary path per screen.
- The first screen must answer: `我现在该做什么`.
- If a page has too many equal-weight blocks, reduce or regroup them.
- If content is dense, split by task order, not by backend data shape.
- If a feature feels like “资料展示”, ask whether it should become “任务推进”.

## For Mingli

Default product path priority:

1. today
2. near term
3. long term
4. deep reading

For this project, avoid leading with raw metaphysics data. Lead with action and relevance.

## Avoid

- backend-first page structure
- equal-sized cards for everything
- exposing all data at once
- pages without a default next action
- component decisions before user-path decisions
