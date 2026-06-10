---
name: mobile-ux
description: Use when building or revising Mingli on phone-sized screens. This skill enforces mobile-first layout, thumb-friendly interaction, readable hierarchy, single-column content flow, and tighter spacing than the desktop layout.
---

# Mobile UX

Use this skill whenever a page must work on phones.

## Goal

Do not shrink the desktop page. Recompose it for mobile.

## Mandatory rules

- Mobile first.
- One-handed use.
- Single-column by default.
- One primary action visible without hunting.
- Strong visual order from top to bottom.

## Layout rules

- Put the most actionable block first.
- Keep first-screen height focused; avoid decorative tall heroes.
- Collapse side-by-side desktop groups into vertical task order.
- Use sticky navigation only when it helps repeated switching.
- Prefer 2-column micro-cards only for tiny facts; otherwise 1 column.

## Spacing rules

- Reduce empty space that does not improve clarity.
- Keep card padding compact but breathable.
- Compress line-height for dense tools and game flows.
- Avoid long text walls before the first action.

## Interaction rules

- Buttons must be easy to tap.
- Tabs must fit without guessing horizontal scroll.
- Long labels should have mobile-specific short labels if needed.
- Do not rely on hover.

## Review checklist

Before finishing, check:

1. Can the user tell what to do in 3 seconds?
2. Is the first tap obvious?
3. Does anything look like a squeezed desktop row?
4. Do cards feel stacked by task importance?
5. Are there any two-line nav labels that should become shorter?

## For Mingli

Mobile priority:

1. generate chart
2. see today
3. see near term
4. continue game
5. dive into reading if wanted
