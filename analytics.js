const fs = require('fs');
const path = require('path');

// This is deliberately a tiny, first-party event pipe.  It accepts identifiers
// from a closed vocabulary only: never birth inputs, chart fields, or copy.
const EVENT_NAMES = new Set([
  'theme_view', 'theme_select', 'entry_select', 'birth_submit', 'chart_success',
  'story_start', 'story_stage', 'story_complete', 'story_restart', 'share', 'save', 'copy',
]);
const ID = /^[a-z][a-z0-9_]{0,63}$/;
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[4-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const THEME_IDS = new Set(['work', 'relationship', 'family', 'finance', 'migration']);
const ENTRY_IDS = new Set([
  'job_lost', 'job_exit', 'offer_choice', 'career_switch', 'promotion_load', 'side_business',
  'relationship_unclear', 'relationship_repair', 'relationship_commitment', 'relationship_separation', 'relationship_new_start',
  'family_care', 'family_expectations', 'family_distance', 'family_living_arrangement', 'family_money_boundary',
  'finance_runway', 'finance_commitment', 'finance_risk', 'finance_income_volatility', 'finance_debt_order',
  'migration_city', 'migration_home', 'migration_return', 'migration_long_distance_relationship', 'migration_settle_decision',
]);
const STORY_IDS = new Set(['unemployed_month_five', 'employed_want_leave', 'offer_choice']);
const ENTRY_FOR_STORY = { unemployed_month_five: 'job_lost', employed_want_leave: 'job_exit', offer_choice: 'offer_choice' };
const configuredMaxBytes = Number(process.env.ANALYTICS_MAX_FILE_BYTES);
const MAX_FILE_BYTES = Number.isFinite(configuredMaxBytes) && configuredMaxBytes >= 1024 ? Math.min(configuredMaxBytes, 100 * 1024 * 1024) : 10 * 1024 * 1024;
const configuredRetentionDays = Number(process.env.ANALYTICS_RETENTION_DAYS);
const RETENTION_DAYS = Number.isFinite(configuredRetentionDays) && configuredRetentionDays >= 1 ? Math.min(3650, configuredRetentionDays) : 90;
const analyticsDir = path.resolve(process.env.ANALYTICS_DIR || path.join(__dirname, 'data', 'analytics'));
let appendQueue = Promise.resolve();
let retentionPrunedOn = '';

const optionalId = (value) => value === undefined || (typeof value === 'string' && ID.test(value));

const validateAnalyticsEvent = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (Object.keys(body).some((key) => !['event', 'sessionId', 'themeId', 'entryId', 'storyId', 'stage'].includes(key))) return null;
  const { event, sessionId, themeId, entryId, storyId, stage } = body;
  if (!EVENT_NAMES.has(event) || typeof sessionId !== 'string' || !SESSION_ID.test(sessionId)) return null;
  if (![themeId, entryId, storyId].every(optionalId)
    || (themeId && !THEME_IDS.has(themeId)) || (entryId && !ENTRY_IDS.has(entryId)) || (storyId && !STORY_IDS.has(storyId))) return null;
  if (storyId && ENTRY_FOR_STORY[storyId] !== entryId) return null;
  if (stage !== undefined && (!Number.isInteger(stage) || stage < 1 || stage > 7)) return null;
  const required = {
    theme_view: ['themeId'], theme_select: ['themeId'], entry_select: ['entryId'],
    birth_submit: ['entryId', 'storyId'], chart_success: ['entryId', 'storyId'],
    story_start: ['entryId', 'storyId'], story_stage: ['entryId', 'storyId', 'stage'],
    story_complete: ['entryId', 'storyId'], story_restart: ['entryId', 'storyId'],
    share: ['entryId', 'storyId'], save: ['entryId', 'storyId'], copy: ['entryId', 'storyId'],
  };
  if ((required[event] || []).some((key) => body[key] === undefined)) return null;
  // Rebuild, rather than spreading input, so unknown fields cannot be stored.
  return {
    event, sessionId, ...(themeId ? { themeId } : {}), ...(entryId ? { entryId } : {}),
    ...(storyId ? { storyId } : {}), ...(stage ? { stage } : {}), at: new Date().toISOString(),
  };
};

const dateForFile = (name) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})\.jsonl$/.exec(name);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]) ? date : null;
};

// Only files named YYYY-MM-DD.jsonl in the configured analytics directory can
// be removed. Other files (including operator notes) are deliberately ignored.
const pruneAnalyticsFiles = async (dir = analyticsDir, retentionDays = RETENTION_DAYS, now = new Date()) => {
  const keepDays = Math.max(1, Math.min(3650, Number(retentionDays) || RETENTION_DAYS));
  const cutoff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - keepDays);
  let names = [];
  try { names = await fs.promises.readdir(dir); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const removed = [];
  for (const name of names) {
    const date = dateForFile(name);
    if (date && date.getTime() < cutoff) {
      await fs.promises.unlink(path.join(dir, name));
      removed.push(name);
    }
  }
  return removed;
};

const appendAnalyticsEvent = (event) => {
  // Recover after a full/unavailable write so a later day or freed volume can
  // accept events. This serializes writes in one Node process; appendFile is
  // atomic enough for normal local multi-process append, though the size cap
  // can exceed by one line if two processes race (run one app process here).
  appendQueue = appendQueue.catch(() => {}).then(async () => {
    await fs.promises.mkdir(analyticsDir, { recursive: true, mode: 0o700 });
    const today = event.at.slice(0, 10);
    if (retentionPrunedOn !== today) {
      await pruneAnalyticsFiles();
      retentionPrunedOn = today;
    }
    const file = path.join(analyticsDir, `${event.at.slice(0, 10)}.jsonl`);
    let size = 0;
    try { size = (await fs.promises.stat(file)).size; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const line = `${JSON.stringify(event)}\n`;
    if (size + Buffer.byteLength(line) > MAX_FILE_BYTES) {
      const error = new Error('analytics storage limit reached');
      error.code = 'ANALYTICS_FULL';
      throw error;
    }
    // Queueing serializes this process; appendFile is append-only (no event rewrite).
    await fs.promises.appendFile(file, line, { encoding: 'utf8', mode: 0o600 });
  });
  return appendQueue;
};

module.exports = { analyticsDir, appendAnalyticsEvent, pruneAnalyticsFiles, retentionDays: RETENTION_DAYS, validateAnalyticsEvent };
