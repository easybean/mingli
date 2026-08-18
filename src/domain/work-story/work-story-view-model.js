import { careerStageFor, resolveCurrentNode, resolveEnding, workChips } from './story-engine.js';

const evidenceTitle = { bazi: '八字底色', ziwei: '紫微结构', transit: '当前运限' };
const fallbackCharacters = {
  gu: { name: '顾言', identity: '招聘负责人', relationship: '负责这次正式岗位 Offer' },
  zhou: { name: '周屿', identity: '前同事', relationship: '邀请你参与企业客户试点项目' },
  cheng: { name: '程岚', identity: '行业前辈', relationship: '帮你看作品并介绍机会' },
  liang: { name: '梁澄', identity: '共同承担生活的人', relationship: '和你一起面对预算与生活安排' },
};

const characterFor = (definition, roleId) => {
  const roster = definition?.characters || {};
  const character = Array.isArray(roster)
    ? roster.find((item) => item?.id === roleId || item?.roleId === roleId)
    : roster[roleId];
  const fallback = fallbackCharacters[roleId] || {};
  return {
    id: roleId,
    name: character?.name || fallback.name || '相关人物',
    identity: character?.title || character?.identity || character?.role || fallback.identity || '剧情人物',
    relationship: character?.relationship || character?.relation || fallback.relationship || '与主角有关的人',
  };
};

const transitionFallback = (session) => (session?.sceneIndex || 0) === 0
  ? '故事从你确认眼前这段工作处境开始。'
  : '上一幕的选择已经落地；几天后，新的局面出现。';

const careerStageLabel = {
  unemployed: '工作空窗期', offer_pending: 'Offer 沟通中', preboarding: '入职准备期', probation: '试用期', employed: '已入职',
};

const careerStageTitle = {
  unemployed: '工作空窗期', offer_pending: '工作空窗期', preboarding: '入职准备期', probation: '试用期选择', employed: '入职后的选择',
};

const latestUniqueDelayedEchoes = (items, targetId) => {
  const seen = new Set();
  return (items || []).filter((item) => item.targetId === targetId).slice().reverse()
    .filter((item) => {
      const key = `${item.targetId || ''}:${item.sourceChoice || item.sourceChoiceId || item.nodeId || ''}:${item.text || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .reverse()
    .slice(-2);
};

export const createWorkStoryViewModel = ({ definition, profile, session }) => {
  const ending = session?.completed ? resolveEnding({ definition, profile, session }) : null;
  const node = session?.completed ? null : resolveCurrentNode({ definition, profile, session });
  const careerStage = careerStageFor(session);
  return {
    ready: Boolean(profile?.available && session && (node || ending)),
    title: definition?.title || '工作岔路',
    displayTitle: definition?.careerStageTitles?.[careerStage] || careerStageTitle[careerStage] || definition?.title || '工作岔路',
    careerStage,
    careerStageLabel: careerStageLabel[careerStage] || '当前职业阶段',
    progress: { current: Math.min((session?.sceneIndex || 0) + 1, definition?.stages?.length || 7), total: definition?.stages?.length || 7 },
    contextLine: profile?.contextLine || '',
    chips: workChips(session?.workState),
    node: node ? {
      ...node,
      characters: node.roles.map((role) => characterFor(definition, role)),
      transition: node.copy?.transition || transitionFallback(session),
      evidence: node.evidenceSlots.flatMap((slot) => {
        const matched = (slot.ruleIds || []).flatMap((ruleId) => profile?.evidenceByRuleId?.[ruleId] || []);
        return matched.length ? matched : [{ title: '命理依据（部分匹配）', body: '这幕由当前工作主题与阶段信号共同排序；完整三层组合依据不足，因此不把它写成确定结论。' }];
      }),
    } : null,
    feedback: session?.currentFeedback || null,
    delayedEchoes: latestUniqueDelayedEchoes(session?.delayedConsequences, node?.id || ending?.id),
    ending,
    log: session?.choices || [],
  };
};
