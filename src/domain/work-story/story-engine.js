import { applyLifeStateDelta, createInitialLifeState } from '../life-state.js';

const REQUIRED_CHOICE_KEYS = ['id', 'label', 'immediate', 'delayedFlags', 'routeSignals', 'stateEffects', 'relationEffects', 'nextWeights'];
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);
const clone = (value) => JSON.parse(JSON.stringify(value));
const characterForRole = (characters, roleId) => (Array.isArray(characters)
  ? characters.find((item) => item?.id === roleId || item?.roleId === roleId)
  : characters?.[roleId]);
const workStateFromProfile = (initialState = {}) => ({
  runway: Math.round(((initialState.resources || 50) + (initialState.stability || 50) + (100 - (initialState.pressure || 50))) / 3),
  optionality: Math.round(((initialState.opportunity || 50) + (initialState.resources || 50) + (initialState.relationship || 50)) / 3),
  load: Math.round(((initialState.pressure || 50) + (100 - (initialState.wellbeing || 50))) / 2),
});

export const validateStoryDefinition = (definition) => {
  const errors = [];
  if (!definition || definition.version !== '0.1.0') errors.push('version must be 0.1.0');
  if (!definition?.id || !definition?.entry || !Array.isArray(definition?.stages) || !Array.isArray(definition?.nodes)) errors.push('story requires id, entry, stages and nodes');
  if (definition?.title !== '工作空窗期') errors.push('public story title must be 工作空窗期');
  if (definition?.stages?.length !== 7) errors.push('0.1.0 requires exactly 7 stages');
  if (definition?.nodes?.length !== 21) errors.push('0.1.0 requires exactly 21 nodes');
  const ids = new Set();
  const roleIds = new Set((definition?.nodes || []).flatMap((node) => node.roles || []));
  if (!definition?.characters || (Array.isArray(definition.characters) && !definition.characters.length)) errors.push('story requires character metadata');
  roleIds.forEach((roleId) => {
    const character = characterForRole(definition?.characters, roleId);
    if (!character?.name || !character?.identity && !character?.title && !character?.role || !character?.relationship && !character?.relation) {
      errors.push(`role ${roleId || '?'} requires name, identity and relationship metadata`);
    }
    if (character?.name === roleId) errors.push(`role ${roleId || '?'} cannot use a bare ID as its visible label`);
  });
  (definition?.nodes || []).forEach((node) => {
      if (!node.id || ids.has(node.id)) errors.push(`node id missing or duplicated: ${node.id || '?'}`);
      ids.add(node.id);
      if (!node.copy?.title || !node.copy?.situation || !node.copy?.conflict || !node.copy?.transition || !Array.isArray(node.roles) || !Array.isArray(node.evidenceSlots)) errors.push(`node ${node.id} missing visible fields or transition`);
      if ((node.roles || []).some((roleId) => !characterForRole(definition?.characters, roleId))) errors.push(`node ${node.id} references a role without metadata`);
      const flagGroups = node.match?.requiresFlagGroups;
      if (!node.match || !Array.isArray(node.match.anyTags) || !Array.isArray(node.match.allTags)
        || (node.match.requiresAnyFlags !== undefined && !Array.isArray(node.match.requiresAnyFlags))
        || (node.match.requiresAllFlags !== undefined && !Array.isArray(node.match.requiresAllFlags))
        || (flagGroups !== undefined && (!Array.isArray(flagGroups) || flagGroups.some((group) => !Array.isArray(group) || !group.length)))
        || [...(node.match.requiresAnyFlags || []), ...(node.match.requiresAllFlags || []), ...(flagGroups || []).flat()].some((flag) => typeof flag !== 'string' || !flag.trim())) errors.push(`node ${node.id} has no valid contract match`);
      if (!Array.isArray(node.choices) || node.choices.length !== 3) errors.push(`node ${node.id} must have 3 choices`);
      (node.choices || []).forEach((item) => {
        REQUIRED_CHOICE_KEYS.forEach((key) => { if (!hasOwn(item, key)) errors.push(`choice ${node.id}/${item?.id || '?'} lacks ${key}`); });
          if (!item?.id || !item?.label || !Array.isArray(item?.delayedFlags) || item.delayedFlags.some((flag) => !flag.id || !Array.isArray(flag.consumeBy) || !flag.consumeBy.length) || typeof item?.routeSignals !== 'object' || typeof item?.stateEffects?.work !== 'object') errors.push(`choice ${node.id}/${item?.id || '?'} invalid`);
      });
  });
  (definition?.stages || []).forEach((stage, stageIndex) => {
    if (!stage.id || !Array.isArray(stage.candidates) || stage.candidates.length !== 3 || stage.candidates.some((id) => !ids.has(id))) errors.push(`stage ${stage.id || stageIndex} must reference 3 valid nodes`);
  });
  if (!Array.isArray(definition?.endings) || definition.endings.length !== 6) errors.push('0.1.0 requires 6 endings');
  (definition?.endings || []).forEach((ending) => {
    if (!ending.id || !ending.summary?.title || !ending.summary?.core || !ending.action?.instruction || typeof ending.routeWeights !== 'object') errors.push(`invalid ending ${ending.id || '?'}`);
  });
  const zhouInvite = (definition?.nodes || []).find((node) => node.id === 'JL07');
  if (!zhouInvite || !zhouInvite.roles?.includes('zhou') || !/前同事/.test(zhouInvite.copy?.situation || '') || !/邀请你/.test(zhouInvite.copy?.situation || '') || !/(项目|试点|交付)/.test(zhouInvite.copy?.situation || '')) {
    errors.push('JL07 must state that former colleague 周屿 invites the protagonist to join the project');
  }
  return errors;
};

const candidateTags = (profile, session) => {
  const tags = new Set(profile?.tags || []);
  tags.add(`entry:${session?.entry || 'job_lost'}`);
  Object.keys(session?.flags || {}).forEach((key) => tags.add(`flag:${key}`));
  const workState = session?.workState || {};
  if ((workState.load || 0) >= 60) tags.add('state:load:high');
  if ((workState.runway || 0) <= 30) tags.add('state:runway:low');
  return tags;
};

const isExcludedCandidate = (node, profile, session) => (node?.match?.excludeTags || [])
  .some((tag) => candidateTags(profile, session).has(tag));

const factFlagId = (flag) => String(flag || '').replace(/^flag:/, '');

// 事实门槛不参与命理加权：它决定一个节点在当前历史里能否发生。
const meetsFactRequirements = (node, session) => {
  const flags = session?.flags || {};
  const match = node?.match || {};
  const all = (match.requiresAllFlags || []).map(factFlagId);
  const any = (match.requiresAnyFlags || []).map(factFlagId);
  const groups = (match.requiresFlagGroups || []).map((group) => group.map(factFlagId));
  return all.every((flag) => flags[flag])
    && (!any.length || any.some((flag) => flags[flag]))
    && groups.every((group) => group.some((flag) => flags[flag]));
};

const isEligibleCandidate = (node, profile, session) => !isExcludedCandidate(node, profile, session)
  && meetsFactRequirements(node, session);

const profileScore = (node, profile, session) => {
  const match = node.match || {};
  const tags = candidateTags(profile, session);
  if (!isEligibleCandidate(node, profile, session)) return Number.NEGATIVE_INFINITY;
  if ((match.allTags || []).some((tag) => !tags.has(tag))) return Number.NEGATIVE_INFINITY;
  if ((match.excludeTags || []).some((tag) => tags.has(tag))) return Number.NEGATIVE_INFINITY;
  if (match.anyTags?.length && !match.anyTags.some((tag) => tags.has(tag))) return Number.NEGATIVE_INFINITY;
  const tagScore = (match.anyTags || []).filter((tag) => tags.has(tag)).length * 10;
  const focusScore = (match.focus || []).reduce((total, focus) => total + Math.max(0, 4 - (profile?.rankedFocuses || []).indexOf(focus)), 0);
  return tagScore + focusScore + Number(session?.nextWeights?.[node.id] || 0) + 2;
};

const focusRankBonus = (profile, focus) => {
  const rank = (profile?.rankedFocuses || []).indexOf(focus);
  return rank < 0 ? 0 : Math.max(0, 5 - rank);
};

const chooseCandidate = (definition, stage, profile, session) => (stage.candidates || [])
  .map((id) => definition.nodes.find((node) => node.id === id))
  .filter(Boolean)
  .map((node, index) => ({ node, index, score: profileScore(node, profile, session) }))
  .filter((item) => Number.isFinite(item.score) && item.score >= Number(item.node.match?.minScore || 0))
  .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.node
  // 没有满分三层组合时，按可验证的降级分择优，不能固定回退到第一节点。
  || (stage.candidates || []).map((id, index) => ({ node: definition.nodes.find((node) => node.id === id), index }))
    // excludeTags 是硬约束；即使走降级排序也不能把被排除的节点重新选回来。
    .filter((item) => item.node && isEligibleCandidate(item.node, profile, session))
    .map((item) => ({ ...item, score: Number(session?.nextWeights?.[item.node.id] || 0)
      + (/JL03|JL15/.test(item.node.id) ? focusRankBonus(profile, 'transition') : 0)
      + (/JL12|JL18|JL21/.test(item.node.id) ? focusRankBonus(profile, 'recovery') : 0)
      + (/JL01|JL08|JL14/.test(item.node.id) ? focusRankBonus(profile, 'safety') : 0)
      + (/JL02|JL05|JL11|JL17/.test(item.node.id) ? focusRankBonus(profile, 'opportunity') : 0) }))
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.node
  || null;

export const createWorkStorySession = ({ definition, profile }) => {
  const errors = validateStoryDefinition(definition);
  if (errors.length) throw new Error(`工作剧本 contract 无效：${errors.join('；')}`);
  if (!profile?.available) throw new Error('命盘信息不足，无法生成这次工作推演。请核对出生日期、时间和地点。');
  return {
    storyId: definition.id, entry: definition.entry, sceneIndex: 0, resolvedNodes: [], choices: [], flags: {}, relations: {}, routeSignals: {}, nextWeights: {},
    workState: workStateFromProfile(profile.initialState),
    lifeState: { ...createInitialLifeState(), ...(profile.initialState || {}) }, currentFeedback: null, completed: false,
    delayedConsequences: [], consumedDelayed: [],
  };
};

export const resolveCurrentNode = ({ definition, profile, session }) => {
  if (!session || session.completed) return null;
  const stage = definition.stages?.[session.sceneIndex];
  if (!stage) return null;
  const prior = session.resolvedNodes.find((item) => item.sceneIndex === session.sceneIndex);
  const node = prior ? definition.nodes.find((item) => item.id === prior.nodeId) : chooseCandidate(definition, stage, profile, session);
  if (!node) return null;
  const tags = new Set([...(profile?.tags || []), ...Object.keys(session?.flags || {}).map((key) => `flag:${key}`)]);
  const variant = (node.variants || []).filter((item) => {
    const when = item.when || {};
    return (when.tags || []).every((tag) => tags.has(tag)) && (when.flags || []).every((flag) => session?.flags?.[flag]);
  }).sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0))[0];
  const copy = { ...node.copy, ...(variant?.copyPatch || {}) };
  return { ...clone(node), copy, activeVariantId: variant?.id || null, stageId: stage.id, sceneIndex: session.sceneIndex, title: copy.title, scene: copy.situation, conflict: copy.conflict };
};

const addScores = (base, delta = {}) => Object.entries(delta).reduce((next, [key, value]) => ({ ...next, [key]: (next[key] || 0) + Number(value || 0) }), { ...base });

export const chooseStoryOption = ({ definition, profile, session, choiceId }) => {
  const node = resolveCurrentNode({ definition, profile, session });
  if (!node) throw new Error('当前没有可选择的剧情节点。');
  if (session.currentFeedback) throw new Error('请先进入下一幕。');
  const choice = node.choices.find((item) => item.id === choiceId);
  if (!choice) throw new Error('未找到该选项。');
  const before = { ...session.lifeState };
  const after = applyLifeStateDelta(before, choice.stateEffects.life || {});
  const nextWorkState = Object.entries(choice.stateEffects.work || {}).reduce((next, [key, value]) => ({ ...next, [key]: Math.max(0, Math.min(100, (next[key] || 0) + Number(value || 0))) }), { ...session.workState });
  const setFlags = choice.delayedFlags.reduce((next, item) => ({ ...next, [item.id]: item.value }), { ...session.flags });
  const choiceRecord = { sceneIndex: session.sceneIndex, stageId: node.stageId, nodeId: node.id, choiceId: choice.id, choiceLabel: choice.label, immediate: choice.immediate, delayedFlags: choice.delayedFlags, stateEffects: choice.stateEffects };
  return {
    ...session,
    resolvedNodes: session.resolvedNodes.concat({ sceneIndex: session.sceneIndex, nodeId: node.id }), choices: session.choices.concat(choiceRecord),
    flags: setFlags, relations: addScores(session.relations, choice.relationEffects), workState: nextWorkState,
    routeSignals: addScores(session.routeSignals, choice.routeSignals), nextWeights: addScores(session.nextWeights, choice.nextWeights), lifeState: after,
    currentFeedback: { nodeId: node.id, choiceId: choice.id, immediate: choice.immediate, delayedHint: choice.delayedFlags.length ? '这件事的后续影响，会在之后的局面里慢慢显出来。' : '', before, after, delta: choice.stateEffects.work },
  };
};

const endingScore = (ending, session) => {
  const routeScore = Object.entries(ending.routeWeights || {}).reduce((total, [key, weight]) => total + Math.min(session.routeSignals?.[key] || 0, Number(weight || 0)) * 10, 0);
  const stateBonus = (ending.id === 'ending_stabilize' ? (session.lifeState.stability + session.lifeState.resources) / 25 : 0)
    + (ending.id === 'ending_reset' ? (session.lifeState.wellbeing + 100 - session.lifeState.pressure) / 25 : 0)
    + (ending.id === 'ending_independent' ? session.lifeState.opportunity / 12 : 0);
  return routeScore + stateBonus;
};

export const resolveEnding = ({ definition, profile, session }) => {
  const flags = Object.keys(session.flags || {}).map((key) => `flag:${key}`);
  const eligible = definition.endings.filter((item) => !item.match?.anyTags?.length || item.match.anyTags.some((tag) => flags.includes(tag)));
  const ending = [...(eligible.length ? eligible : definition.endings)].map((item, index) => ({ item, index, score: endingScore(item, session) }))
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.item;
  if (!ending) return null;
  const highestFocus = profile.rankedFocuses?.[0] || 'safety';
  const focusLabel = { safety: '安全余量', opportunity: '机会窗口', recovery: '身心负荷', transition: '外部变化', negotiation: '权责边界' }[highestFocus] || '当前局面';
  const qualityVariant = (ending.summary.qualityVariants || []).find((item) => (item.when?.flags || []).every((flag) => session.flags?.[flag]));
  return { ...clone(ending), title: ending.summary.title, summaryText: ending.summary.core, qualityText: qualityVariant?.text || '', action: ending.action.instruction, choicesSummary: session.choices.slice(-3).map((item) => item.choiceLabel), chartContrast: `命盘底色这一轮更容易牵动${focusLabel}；而你实际连续选择的是${session.choices.slice(-3).map((item) => item.choiceLabel).join('、')}。` };
};

export const advanceStory = ({ definition, profile, session }) => {
  if (!session.currentFeedback) throw new Error('请先作出当前选择。');
  const nextIndex = session.sceneIndex + 1;
  const next = nextIndex >= definition.stages.length
    ? { ...session, sceneIndex: nextIndex, currentFeedback: null, completed: true }
    : { ...session, sceneIndex: nextIndex, currentFeedback: null };
  const targetId = next.completed
    ? resolveEnding({ definition, profile, session: next })?.id
    : resolveCurrentNode({ definition, profile, session: next })?.id;
  if (!targetId) return next;
  const consumed = new Set(next.consumedDelayed || []);
  const newConsequences = next.choices.flatMap((record) => (record.delayedFlags || [])
    .filter((flag) => flag.consumeBy.includes(targetId))
    .map((flag) => ({ key: `${record.nodeId}:${flag.id}:${targetId}`, flagId: flag.id, targetId, sourceChoice: record.choiceLabel, text: `此前你选择“${record.choiceLabel}”后留下的影响回来了：${record.immediate}` }))
  ).filter((item) => !consumed.has(item.key));
  return {
    ...next,
    consumedDelayed: [...consumed, ...newConsequences.map((item) => item.key)],
    delayedConsequences: [...(next.delayedConsequences || []), ...newConsequences],
  };
};

export const workChips = (workState = {}) => [
  { id: 'safety', label: '安全余量', value: Math.round(workState.runway || 50), tone: 'steady' },
  { id: 'opportunity', label: '机会窗口', value: Math.round(workState.optionality || 50), tone: 'opportunity' },
  { id: 'load', label: '身心负荷', value: Math.round(workState.load || 50), tone: 'load' },
];
