export const TODAY_FOCUS_OPTIONS = [
  { id: 'career', label: '事业' },
  { id: 'wealth', label: '财富' },
  { id: 'relationship', label: '关系' },
  { id: 'health', label: '健康' },
  { id: 'mindset', label: '心态' },
];

const THEME_HINT = {
  career: '今天先看事业和推进节奏。',
  wealth: '今天先看钱、资源和取舍。',
  relationship: '今天先看关系、沟通和边界。',
  health: '今天先看健康、恢复和节奏。',
  mindset: '今天先看内心反应和状态管理。',
};

const normalizeTheme = (theme) => (theme === 'health' ? 'health' : theme);

export const pickTodayCard = (dayScope, preferredTheme) => {
  const cards = dayScope?.cards || [];
  const normalized = normalizeTheme(preferredTheme);
  const exact = normalized ? cards.find((card) => card.theme === normalized) : null;
  const card = exact || cards[0] || dayScope?.trials?.[0] || dayScope?.opportunities?.[0] || null;
  return {
    card,
    preferredTheme: normalized || null,
    matchedTheme: Boolean(exact),
    options: TODAY_FOCUS_OPTIONS.map((item) => ({
      ...item,
      hint: THEME_HINT[item.id],
      selected: normalized === item.id,
    })),
  };
};

export const focusFallbackHint = ({ preferredTheme, matchedTheme, card }) => {
  if (!preferredTheme || matchedTheme || !card) return '';
  const option = TODAY_FOCUS_OPTIONS.find((item) => item.id === preferredTheme);
  return `你今天更想看${option?.label || '这一块'}，但命盘今天更先浮出来的是${card.themeLabel || '当前主线'}。`;
};
