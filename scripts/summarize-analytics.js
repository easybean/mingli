#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const analyticsDir = path.resolve(process.argv[2] || process.env.ANALYTICS_DIR || path.join(__dirname, '..', 'data', 'analytics'));
const events = [];
const files = fs.existsSync(analyticsDir) ? fs.readdirSync(analyticsDir).filter((name) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(name)).sort() : [];
files.forEach((name) => fs.readFileSync(path.join(analyticsDir, name), 'utf8').split('\n').filter(Boolean).forEach((line) => {
  try { const item = JSON.parse(line); if (item?.sessionId && item?.event) events.push(item); } catch { /* Ignore a partial final append. */ }
}));
if (!events.length) { console.log('No analytics events.'); process.exit(0); }
const sessionsFor = (predicate) => new Set(events.filter(predicate).map((item) => item.sessionId));
const percent = (numerator, denominator) => (denominator ? `${((numerator / denominator) * 100).toFixed(1)}%` : '—');
const funnelDefinitions = [
  ['theme_view', (item) => item.event === 'theme_view'], ['entry_select', (item) => item.event === 'entry_select'],
  ['birth_submit', (item) => item.event === 'birth_submit'], ['chart_success', (item) => item.event === 'chart_success'],
  ['stage_1', (item) => item.event === 'story_stage' && item.stage === 1], ['stage_3', (item) => item.event === 'story_stage' && item.stage === 3],
  ['stage_7', (item) => item.event === 'story_stage' && item.stage === 7], ['complete', (item) => item.event === 'story_complete'],
  ['restart', (item) => item.event === 'story_restart'], ['share_or_save', (item) => item.event === 'share' || item.event === 'save'],
];
// Each step is measured inside the preceding cohort. This is a sequential
// funnel, so percentages cannot exceed 100% merely because a visitor did the
// later action in a different visit/session sequence.
let cohort = sessionsFor(funnelDefinitions[0][1]);
const funnel = funnelDefinitions.map(([step, predicate], index) => {
  const raw = sessionsFor(predicate);
  const sessions = index ? new Set([...cohort].filter((id) => raw.has(id))) : raw;
  cohort = sessions;
  return { step, sessions };
});
console.log('FUNNEL (unique anonymous sessions)\nstep\tsessions\tfrom_previous\tfrom_theme_view');
funnel.forEach((item, index) => console.log(`${item.step}\t${item.sessions.size}\t${index ? percent(item.sessions.size, funnel[index - 1].sessions.size) : '—'}\t${percent(item.sessions.size, funnel[0].sessions.size)}`));
const group = new Map();
events.filter((item) => item.storyId).forEach((item) => {
  const key = `${item.entryId || 'unknown_entry'}\t${item.storyId || 'unknown_story'}`;
  if (!group.has(key)) group.set(key, { entry: item.entryId || 'unknown_entry', story: item.storyId || 'unknown_story', started: new Set(), complete: new Set(), restart: new Set(), shared: new Set() });
  const stats = group.get(key);
  if (item.event === 'story_start') stats.started.add(item.sessionId);
  if (item.event === 'story_complete') stats.complete.add(item.sessionId);
  if (item.event === 'story_restart') stats.restart.add(item.sessionId);
  if (item.event === 'share' || item.event === 'save') stats.shared.add(item.sessionId);
});
console.log('\nBY ENTRY / STORY (unique anonymous sessions)\nentry\tstory\tstarted\tcompleted\tcompletion_rate\trestarted\tshared_or_saved');
[...group.values()].sort((a, b) => `${a.entry}/${a.story}`.localeCompare(`${b.entry}/${b.story}`)).forEach((stats) => console.log(`${stats.entry}\t${stats.story}\t${stats.started.size}\t${stats.complete.size}\t${percent(stats.complete.size, stats.started.size)}\t${stats.restart.size}\t${stats.shared.size}`));
