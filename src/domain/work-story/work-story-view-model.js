import { resolveCurrentNode, resolveEnding, workChips } from './story-engine.js';

const evidenceTitle = { bazi: '八字底色', ziwei: '紫微结构', transit: '当前运限' };
const roleLabel = { gu: '顾言 · 招聘负责人', zhou: '周屿 · 前同事', cheng: '程岚 · 行业前辈', liang: '梁澄 · 共同承担生活的人' };

export const createWorkStoryViewModel = ({ definition, profile, session }) => {
  const ending = session?.completed ? resolveEnding({ definition, profile, session }) : null;
  const node = session?.completed ? null : resolveCurrentNode({ definition, profile, session });
  return {
    ready: Boolean(profile?.available && session && (node || ending)),
    title: definition?.title || '工作岔路',
    progress: { current: Math.min((session?.sceneIndex || 0) + 1, definition?.stages?.length || 7), total: definition?.stages?.length || 7 },
    contextLine: profile?.contextLine || '',
    chips: workChips(session?.workState),
    node: node ? {
      ...node,
      rolesLabel: node.roles.map((role) => roleLabel[role] || role).join(' · '),
      evidence: node.evidenceSlots.flatMap((slot) => {
        const matched = (slot.ruleIds || []).flatMap((ruleId) => profile?.evidenceByRuleId?.[ruleId] || []);
        return matched.length ? matched : [{ title: '命理依据（部分匹配）', body: '这幕由当前工作主题与阶段信号共同排序；完整三层组合依据不足，因此不把它写成确定结论。' }];
      }),
    } : null,
    feedback: session?.currentFeedback || null,
    delayedEchoes: (session?.delayedConsequences || []).filter((item) => item.targetId === node?.id || item.targetId === ending?.id).slice(-2),
    ending,
    log: session?.choices || [],
  };
};
