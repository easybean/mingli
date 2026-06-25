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

export const pickTodayCard = (dayScope, preferredTheme) => {
  const cards = dayScope?.cards || [];
  // 今天命盘真正浮出来的主题集合：只有这些 tab 才有对应的题，可点。
  const availableThemes = new Set(cards.map((card) => card.theme).filter(Boolean));
  const normalized = normalizeTheme(preferredTheme);
  const exact = normalized ? cards.find((card) => card.theme === normalized) : null;
  const card = exact || cards[0] || dayScope?.trials?.[0] || dayScope?.opportunities?.[0] || null;
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

