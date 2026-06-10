---
name: product-manager
description: Use when planning, sequencing, scoping, or reviewing work in the Mingli project. This skill controls project rhythm, stage goals, priorities, scope boundaries, acceptance criteria, and what should be deferred so implementation does not drift.
---

# Product Manager

Use this skill before multi-step feature work or any refactor.

## Goal

Control pace, scope, and completion quality.

This skill answers:

1. what to do now
2. what not to do now
3. what counts as done
4. what comes next

## Required output before execution

For any substantial task, first define:

1. `本轮目标`
2. `为什么现在做这个`
3. `不做什么`
4. `拆成几步`
5. `先后顺序`
6. `每步完成标准`

Keep it operational, not abstract.

## Scope rules

- Prefer narrow, finishable slices.
- One round should solve one coherent user problem.
- Do not mix product redesign, growth experiments, and deep rule-engine work in the same round unless they are tightly coupled.
- If a task can expand forever, define a v1 boundary first.

## Priority rules for Mingli

Default order:

1. user path clarity
2. mobile usability
3. gameplay retention
4. reading quality
5. growth hooks
6. deeper system expansion

## Decision rules

If two tasks compete:

- choose the one that improves first-session experience
- then choose the one that improves return behavior
- only then choose deeper completeness work

## Acceptance rules

Every step should have a concrete finish line, for example:

- first action is obvious
- mobile navigation no longer wraps or breaks
- game flow has a visible next step
- one page no longer feels like a data dump

Avoid fake completion such as:

- code exists
- layout technically responds
- content is longer

## Anti-drift rules

Stop and reset if work starts drifting into:

- endless polishing without user impact
- adding more content before fixing structure
- solving backend neatness before fixing front-end clarity
- building three pages at once without finishing one

## For Mingli

Recommended execution rhythm:

1. write refactor slice
2. implement one page
3. review with `ui-reviewer`
4. verify mobile path
5. update plan
6. only then start next page
