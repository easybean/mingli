const SITE_URL = 'https://ming.mimedtech.com/';

const focusLabels = {
  safety: '安全余量',
  opportunity: '机会窗口',
  recovery: '身心负荷',
  transition: '外部变化',
  negotiation: '权责边界',
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
  const chartTone = `这一轮更容易牵动${focusLabels[focus] || '当前局面'}。`;
  return {
    storyTitle: String(definition.title),
    chartTone,
    keyChoices: choices,
    routeEnding: String(ending.title),
    routeSummary: String(ending.summaryText || ending.summary?.core || ''),
    alternative,
    siteUrl: String(siteUrl),
  };
};

export const shareTextForWorkStory = (model) => {
  if (!model) return '';
  const choices = model.keyChoices.length ? `关键选择：${model.keyChoices.join(' / ')}。` : '';
  return `我在《${model.storyTitle}》走成了「${model.routeEnding}」。${model.chartTone}${choices}另一种可能：${model.alternative}\n${model.siteUrl}`;
};
