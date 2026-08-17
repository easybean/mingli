export const WORK_STORY_ENTRIES = [
  { id: 'job_lost', title: '刚失业或空窗较久', conflict: '现金流与方向', status: 'available' },
  { id: 'job_exit', title: '在职，但越来越想离开', conflict: '稳定与成长', status: 'upcoming' },
  { id: 'offer_choice', title: '手里有 Offer，拿不定主意', conflict: '确定性与潜力', status: 'upcoming' },
  { id: 'career_switch', title: '想转行，但担心从头开始', conflict: '旧积累与新起点', status: 'upcoming' },
  { id: 'career_stuck', title: '工作稳定但长期停滞', conflict: '安全感与机会成本', status: 'upcoming' },
  { id: 'promotion_load', title: '被提拔或被加担子', conflict: '权责、回报与消耗', status: 'upcoming' },
  { id: 'side_business', title: '想做副业或创业', conflict: '试水、承诺与风险', status: 'upcoming' },
  { id: 'health_boundary', title: '工作正在影响身心或家庭', conflict: '责任与止损', status: 'upcoming' },
];

export const WORK_STORY_CATALOG_SUMMARY = {
  total: WORK_STORY_ENTRIES.length,
  available: WORK_STORY_ENTRIES.filter((entry) => entry.status === 'available').length,
  upcoming: WORK_STORY_ENTRIES.filter((entry) => entry.status === 'upcoming').length,
};
