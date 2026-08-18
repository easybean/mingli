import { UNEMPLOYED_MONTH_FIVE } from '../../content/work-stories/unemployed-month-five.js';
import { EMPLOYED_WANT_LEAVE } from '../../content/work-stories/employed-want-leave.js';

// A story is resolved once at the boundary. Pages and the engine must never
// guess from the entry again: doing so is how two stories can leak into one
// saved session.
export const LEGACY_WORK_STORY_ID = 'unemployed_month_five';
export const LEGACY_WORK_ENTRY = 'job_lost';

const definitions = new Map();

export const registerWorkStoryDefinition = (definition) => {
  if (!definition?.id || !definition?.entry) throw new Error('工作剧本需要 id 和 entry。');
  definitions.set(definition.id, definition);
  return definition;
};

registerWorkStoryDefinition(UNEMPLOYED_MONTH_FIVE);
registerWorkStoryDefinition(EMPLOYED_WANT_LEAVE);

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
