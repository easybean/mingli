// The catalog is intentionally independent from story definitions: a theme can
// advertise a forthcoming situation without making it enterable. Only an
// `available` entry with a registered definition may create a session.
export const STORY_THEMES = [
  {
    id: 'work', label: '工作岔路', description: '工作、机会与去留之间的选择。',
    entries: [
      { id: 'job_lost', storyId: 'unemployed_month_five', title: '刚失业或空窗较久', conflict: '现金流与方向', status: 'available' },
      { id: 'job_exit', storyId: 'employed_want_leave', title: '在职，但越来越想离开', conflict: '稳定与成长', status: 'available' },
      { id: 'offer_choice', storyId: 'offer_choice', title: '手里有两个机会，怎么选', conflict: '当下收益与长期路径', status: 'available' },
      { id: 'career_switch', title: '想转行，但担心从头开始', conflict: '旧积累与新起点', status: 'upcoming' },
      { id: 'promotion_load', title: '被提拔或被加担子', conflict: '权责、回报与消耗', status: 'upcoming' },
      { id: 'side_business', title: '想做副业或创业', conflict: '试水、承诺与风险', status: 'upcoming' },
    ],
  },
  {
    id: 'relationship', label: '关系岔路', description: '亲密关系中的靠近、确认与退出。',
    entries: [
      { id: 'relationship_unclear', title: '关系没有说清，该不该继续等', conflict: '期待与边界', status: 'upcoming' },
      { id: 'relationship_repair', title: '一段关系反复消耗，要不要修复', conflict: '投入与止损', status: 'upcoming' },
      { id: 'relationship_commitment', title: '走向承诺前，现实条件不一致', conflict: '感情与现实', status: 'upcoming' },
      { id: 'relationship_separation', title: '已经在考虑分开，生活怎么安排', conflict: '情感止损与共同责任', status: 'upcoming' },
      { id: 'relationship_new_start', title: '认识了新的人，要不要投入', conflict: '好感与现实兼容', status: 'upcoming' },
    ],
  },
  {
    id: 'family', label: '家庭边界', description: '照顾、责任和个人空间如何共处。',
    entries: [
      { id: 'family_care', title: '家人需要照顾，生活节奏被打乱', conflict: '责任与承受力', status: 'upcoming' },
      { id: 'family_expectations', title: '家人的期待和自己的计划冲突', conflict: '认同与自主', status: 'upcoming' },
      { id: 'family_distance', title: '想拉开距离，又怕伤害关系', conflict: '边界与愧疚', status: 'upcoming' },
      { id: 'family_living_arrangement', title: '要不要继续同住、搬回家或搬出去', conflict: '亲近支持与独立空间', status: 'upcoming' },
      { id: 'family_money_boundary', title: '家庭开支或借款该怎么说清', conflict: '情分与账目边界', status: 'upcoming' },
    ],
  },
  {
    id: 'finance', label: '财务岔路', description: '收入、储备和风险承担的取舍。',
    entries: [
      { id: 'finance_runway', title: '收入不稳，先守住还是再投入', conflict: '安全垫与机会', status: 'upcoming' },
      { id: 'finance_commitment', title: '一笔长期支出要不要承担', conflict: '当下压力与未来安排', status: 'upcoming' },
      { id: 'finance_risk', title: '面对高回报选择，风险该怎么定', conflict: '增长与可承受损失', status: 'upcoming' },
      { id: 'finance_income_volatility', title: '收入不稳定，固定安排与弹性机会怎么选', conflict: '稳定现金与上行空间', status: 'upcoming' },
      { id: 'finance_debt_order', title: '有几笔债务，先还债还是留现金', conflict: '减轻负担与现金余量', status: 'upcoming' },
    ],
  },
  {
    id: 'migration', label: '迁移与安定', description: '城市、居所和生活根基的选择。',
    entries: [
      { id: 'migration_city', title: '要不要去另一座城市重新开始', conflict: '机会与归属', status: 'upcoming' },
      { id: 'migration_home', title: '居住安排要变，如何安定下来', conflict: '成本与稳定感', status: 'upcoming' },
      { id: 'migration_return', title: '回到熟悉的地方，还是继续留下', conflict: '支持系统与发展', status: 'upcoming' },
      { id: 'migration_long_distance_relationship', title: '两地关系要不要为团聚调整城市', conflict: '亲密承诺与个人发展', status: 'upcoming' },
      { id: 'migration_settle_decision', title: '该继续流动，还是定下生活基地', conflict: '选择弹性与长期投入', status: 'upcoming' },
    ],
  },
];

export const WORK_STORY_ENTRIES = STORY_THEMES.flatMap((theme) => theme.entries.map((entry) => ({ ...entry, themeId: theme.id })));

export const getStoryTheme = (themeId) => STORY_THEMES.find((theme) => theme.id === themeId) || STORY_THEMES[0];
export const getStoryThemeEntries = (themeId) => getStoryTheme(themeId).entries;

const summaryFor = (entries) => ({
  total: entries.length,
  available: entries.filter((entry) => entry.status === 'available').length,
  upcoming: entries.filter((entry) => entry.status === 'upcoming').length,
});

export const WORK_STORY_CATALOG_SUMMARY = summaryFor(WORK_STORY_ENTRIES);
export const storyThemeSummary = (themeId) => summaryFor(getStoryThemeEntries(themeId));
