#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { validateAnalyticsEvent, pruneAnalyticsFiles } = require('../analytics');
const id = '0f30be15-a940-4fc8-b07d-7c6767e31c62';
const valid = validateAnalyticsEvent({ event: 'story_stage', sessionId: id, entryId: 'offer_choice', storyId: 'offer_choice', stage: 3 });
const rejected = [
  { event: 'story_stage', sessionId: id, storyId: 'offer_choice', stage: 8 },
  { event: 'story_complete', sessionId: id, entryId: 'job_lost', storyId: 'offer_choice' },
  { event: 'story_stage', sessionId: id, storyId: 'offer_choice', stage: 3, birthDate: '1995-03-12' },
  { event: 'entry_select', sessionId: id, entryId: 'freeform_user_copy' },
  { event: 'unknown', sessionId: id },
  { event: 'birth_submit', sessionId: 'not-a-uuid' },
].every((item) => !validateAnalyticsEvent(item));
const checkRetention = async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mingli-analytics-'));
  try {
    fs.writeFileSync(path.join(directory, '2025-01-01.jsonl'), '{}\n');
    fs.writeFileSync(path.join(directory, '2026-08-17.jsonl'), '{}\n');
    fs.writeFileSync(path.join(directory, 'operator-notes.txt'), 'keep');
    fs.writeFileSync(path.join(directory, 'not-a-date.jsonl'), 'keep');
    await pruneAnalyticsFiles(directory, 90, new Date('2026-08-18T12:00:00Z'));
    return !fs.existsSync(path.join(directory, '2025-01-01.jsonl'))
      && fs.existsSync(path.join(directory, '2026-08-17.jsonl'))
      && fs.existsSync(path.join(directory, 'operator-notes.txt'))
      && fs.existsSync(path.join(directory, 'not-a-date.jsonl'));
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
};
const checkInvalidRetentionFallback = () => {
  const output = execFileSync(process.execPath, ['-e', "process.env.ANALYTICS_RETENTION_DAYS='abc'; process.stdout.write(String(require('./analytics').retentionDays))"], {
    cwd: path.join(__dirname, '..'), encoding: 'utf8',
  });
  return output === '90';
};
checkRetention().then((retentionSafe) => {
  if (!valid || Object.keys(valid).some((key) => !['event', 'sessionId', 'entryId', 'storyId', 'stage', 'at'].includes(key)) || !rejected || !retentionSafe || !checkInvalidRetentionFallback()) {
    console.error('FAIL analytics allowlist/schema or retention'); process.exit(1);
  }
  console.log('PASS analytics allowlist/schema and safe 90-day retention');
}).catch((error) => { console.error(error); process.exit(1); });
