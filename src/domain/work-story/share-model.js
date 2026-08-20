const SITE_URL = 'https://ming.mimedtech.com/';

const focusPrompts = {
  safety: '越想赶快安定，越要分清“安全感”和真实保障。',
  opportunity: '机会越诱人，越要先确认它能不能真正兑现。',
  recovery: '能不能长期扛住，比一时能不能拼下来更重要。',
  transition: '变化越大，越要先看代价是否真的承受得起。',
  negotiation: '真正决定体验的，往往不是头衔，而是权责有没有说清。',
};

const safeChoiceLabels = (session) => (session?.choices || [])
  .slice(-3)
  .map((choice) => String(choice.choiceLabel || '').trim())
  .filter(Boolean);

// This is deliberately a projection, not a serialized result/session. Keeping
// the allow-list here prevents birthday, place, birth time and raw pillars from
// reaching either copy/share or the canvas renderer.
export const createWorkStoryShareModel = ({ definition, profile, session, ending, siteUrl = SITE_URL } = {}) => {
  if (!definition?.title || !ending?.title) return null;
  const focus = profile?.rankedFocuses?.[0] || 'safety';
  const choices = safeChoiceLabels(session);
  const alternative = String(ending?.summary?.alternativeHint || ending?.summary?.alternative || ending?.alternative || '重走这一局，优先尝试另一种关键选择。').trim();
  const shareCopy = definition.shareCopy?.[ending.id] || {};
  const routeEnding = String(ending.title);
  const routeSummary = String(ending.summaryText || ending.summary?.core || '');
  return {
    themeLabel: String(definition.themeLabel || '人生岔路'),
    resultLabel: String(definition.resultLabel || '路线结果'),
    shareBrand: String(definition.shareBrand || 'MINGLI · 人生岔路'),
    journeyLabel: String(definition.journeyLabel || '来走一遍你的选择岔路'),
    storyTitle: String(definition.title),
    hook: String(shareCopy.hook || `这道选择题，我最后走到了「${routeEnding}」。`),
    insight: String(shareCopy.insight || routeSummary),
    question: String(shareCopy.question || '同样的处境，你会走出同一个结局吗？'),
    chartPrompt: String(focusPrompts[focus] || focusPrompts.safety),
    gain: String(ending.summary?.gain || ''),
    cost: String(ending.summary?.cost || ''),
    keyChoices: choices,
    routeEnding,
    routeSummary,
    alternative,
    siteUrl: String(siteUrl),
  };
};

export const shareTextForWorkStory = (model) => {
  if (!model) return '';
  const tradeoff = [model.gain && `我得到：${model.gain}`, model.cost && `我也放弃：${model.cost}`].filter(Boolean).join('\n');
  return `${model.hook}\n\n我的${model.resultLabel}：${model.routeEnding}\n${model.insight}\n\n命盘提醒：${model.chartPrompt}${tradeoff ? `\n\n${tradeoff}` : ''}\n\n${model.question}\n${model.journeyLabel}：${model.siteUrl}`;
};
