import { UNEMPLOYED_MONTH_FIVE } from '../../content/work-stories/unemployed-month-five.js';
import { EMPLOYED_WANT_LEAVE } from '../../content/work-stories/employed-want-leave.js';
import { OFFER_CHOICE } from '../../content/work-stories/offer-choice.js';
import { CAREER_SWITCH } from '../../content/work-stories/career-switch.js';
import { RELATIONSHIP_UNCLEAR } from '../../content/work-stories/relationship-unclear.js';

// A story is resolved once at the boundary. Pages and the engine must never
// guess from the entry again: doing so is how two stories can leak into one
// saved session.
export const LEGACY_WORK_STORY_ID = 'unemployed_month_five';
export const LEGACY_WORK_ENTRY = 'job_lost';

const definitions = new Map();

const WORK_DEFAULTS = {
  themeId: 'work', themeLabel: '工作岔路', resultLabel: '职业路线',
  chipLabels: { safety: '安全余量', opportunity: '机会窗口', load: '身心负荷' },
  shareBrand: 'MINGLI · 工作岔路', journeyLabel: '来走一遍你的工作岔路',
  stageLabels: { unemployed: '工作空窗期', offer_pending: 'Offer 沟通中', preboarding: '入职准备期', probation: '试用期', employed: '已入职' },
};

const normalizeStoryMetadata = (definition) => {
  // Shipped work stories predate cross-theme metadata. Keep their source files
  // untouched while returning a complete, immutable public definition.
  if (definition?.themeId && definition.themeId !== 'work') return definition;
  return { ...WORK_DEFAULTS, ...definition, chipLabels: { ...WORK_DEFAULTS.chipLabels, ...(definition?.chipLabels || {}) }, stageLabels: { ...WORK_DEFAULTS.stageLabels, ...(definition?.stageLabels || {}) } };
};

export const registerWorkStoryDefinition = (definition) => {
  if (!definition?.id || !definition?.entry) throw new Error('人生剧本需要 id 和 entry。');
  const normalized = normalizeStoryMetadata(definition);
  definitions.set(normalized.id, normalized);
  return normalized;
};

registerWorkStoryDefinition(UNEMPLOYED_MONTH_FIVE);
registerWorkStoryDefinition(EMPLOYED_WANT_LEAVE);
registerWorkStoryDefinition(OFFER_CHOICE);
registerWorkStoryDefinition(CAREER_SWITCH);
registerWorkStoryDefinition(RELATIONSHIP_UNCLEAR);

export const getWorkStoryDefinition = (storyId) => definitions.get(storyId) || null;

export const getWorkStoryDefinitionForEntry = (entryId) => [...definitions.values()]
  .find((definition) => definition.entry === entryId) || null;

export const normalizeWorkStorySession = (session) => {
  if (!session) return null;
  // 0.1.x sessions predate storyId/entry persistence. They are unambiguously
  // the first public story and retain their in-progress choices.
  const storyId = session.storyId || LEGACY_WORK_STORY_ID;
  const definition = getWorkStoryDefinition(storyId);
  if (!definition) return null;
  return {
    ...session,
    storyId: definition.id,
    entry: session.entry || definition.entry || LEGACY_WORK_ENTRY,
  };
};

export const getWorkStoryDefinitionForSession = (session) => {
  const normalized = normalizeWorkStorySession(session);
  if (!normalized) return null;
  const definition = getWorkStoryDefinition(normalized.storyId);
  // An entry mismatch means the record was assembled from a different story;
  // never play it with a guessed definition.
  return definition?.entry === normalized.entry ? definition : null;
};

export const listRegisteredWorkStories = () => [...definitions.values()];
