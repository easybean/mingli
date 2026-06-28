export const TODAY_FOCUS_OPTIONS = [
  { id: 'career', label: '事业' },
  { id: 'wealth', label: '财富' },
  { id: 'relationship', label: '关系' },
  { id: 'health', label: '健康' },
  { id: 'mindset', label: '心态' },
  { id: 'family', label: '家庭' },
  { id: 'network', label: '人际' },
];

const THEME_HINT = {
  career: '今天先看事业和推进节奏。',
  wealth: '今天先看钱、资源和取舍。',
  relationship: '今天先看关系、沟通和边界。',
  health: '今天先看健康、恢复和节奏。',
  mindset: '今天先看内心反应和状态管理。',
  family: '今天先看长辈、子女和家里的事。',
  network: '今天先看朋友、合作和人脉往来。',
};

const normalizeTheme = (theme) => (theme === 'health' ? 'health' : theme);

// 把一个日期(YYYY-MM-DD)换成"自纪元起的天数"，用作按天轮换的索引：
// 同一天稳定不变（已答状态不丢），跨天 +1（卡片轮到下一张）。非法日期回退 0。
export const dayIndexFromDate = (raw) => {
  const ymd = String(raw || '').slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return 0;
  return Math.floor(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86400000);
};

const rotatePick = (arr, dayIndex) => {
  if (!arr.length) return null;
  const i = ((dayIndex % arr.length) + arr.length) % arr.length;
  return arr[i];
};

export const pickTodayCard = (dayScope, preferredTheme, dayIndex = 0) => {
  const cards = dayScope?.cards || [];
  // 今天命盘真正浮出来的主题集合：只有这些 tab 才有对应的题，可点。
  const availableThemes = new Set(cards.map((card) => card.theme).filter(Boolean));
  const normalized = normalizeTheme(preferredTheme);
  // 选定主题：在该主题的卡池里按天轮换，而不是永远取最高分那一张。
  const themePool = normalized ? cards.filter((card) => card.theme === normalized) : [];
  const exact = rotatePick(themePool, dayIndex);
  // 未选主题（默认主卡）：在"每个主题的代表卡"里按天轮换，既保持高相关又每天不同。
  const leadByTheme = [];
  const seenThemes = new Set();
  cards.forEach((card) => {
    if (card.theme && !seenThemes.has(card.theme)) {
      seenThemes.add(card.theme);
      leadByTheme.push(card);
    }
  });
  const fallback = rotatePick(leadByTheme, dayIndex)
    || cards[0] || dayScope?.trials?.[0] || dayScope?.opportunities?.[0] || null;
  const card = exact || fallback;
  // 高亮的 tab 始终跟随"当前显示的这道题"的主题：
  // 用户点选并命中 → 用户的主题；未点选或 fallback → 实际显示卡片的主题。
  const activeTheme = (exact ? normalized : card?.theme) || normalized || null;
  return {
    card,
    preferredTheme: normalized || null,
    matchedTheme: Boolean(exact),
    activeTheme,
    options: TODAY_FOCUS_OPTIONS.map((item) => ({
      ...item,
      hint: THEME_HINT[item.id],
      available: availableThemes.has(item.id),
      selected: activeTheme === item.id,
    })),
  };
};

