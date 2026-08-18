export const WORK_STORY_ENTRIES = [
  { id: 'job_lost', storyId: 'unemployed_month_five', title: '刚失业或空窗较久', conflict: '现金流与方向', status: 'available' },
  { id: 'job_exit', storyId: 'employed_want_leave', title: '在职，但越来越想离开', conflict: '稳定与成长', status: 'available' },
  { id: 'offer_choice', title: '手里有两个机会，怎么选', conflict: '当下收益与长期路径', status: 'upcoming' },
  { id: 'career_switch', title: '想转行，但担心从头开始', conflict: '旧积累与新起点', status: 'upcoming' },
  { id: 'promotion_load', title: '被提拔或被加担子', conflict: '权责、回报与消耗', status: 'upcoming' },
  { id: 'side_business', title: '想做副业或创业', conflict: '试水、承诺与风险', status: 'upcoming' },
];

export const WORK_STORY_CATALOG_SUMMARY = {
  total: WORK_STORY_ENTRIES.length,
  available: WORK_STORY_ENTRIES.filter((entry) => entry.status === 'available').length,
  upcoming: WORK_STORY_ENTRIES.filter((entry) => entry.status === 'upcoming').length,
};
