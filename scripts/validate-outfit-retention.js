const assert = require('node:assert/strict');
const { summarizeOutfit } = require('../outfit-analytics');
const { validateAnalyticsEvent } = require('../analytics');
const id = '0f30be15-a940-4fc8-b07d-7c6767e31c62';
assert.ok(validateAnalyticsEvent({ event: 'outfit_visit', sessionId: id, visitorId: id }));
for (const body of [
  { event: 'outfit_visit', sessionId: id },
  { event: 'outfit_open', sessionId: id, visitorId: id },
  { event: 'outfit_visit', sessionId: id, visitorId: id, birthDate: '2000-01-01' },
  { event: 'outfit_visit', sessionId: id, visitorId: id, storyId: 'offer_choice', entryId: 'offer_choice' },
]) assert.equal(validateAnalyticsEvent(body), null);
const visit = (visitorId, at) => ({ event: 'outfit_visit', sessionId: id, visitorId, at });
const events = [
  visit('a','2026-09-27T15:59:00Z'), visit('a','2026-09-27T15:59:30Z'),
  visit('a','2026-09-27T16:01:00Z'), visit('b','2026-09-27T10:00:00Z'),
  visit('c','2026-09-28T10:00:00Z'), visit('future','2028-01-01T00:00:00Z'), visit('bad','invalid'),
];
let rows = summarizeOutfit(events,new Date('2026-09-29T00:00:00Z')).cohorts;
assert.deepEqual(rows[0], { day:'2026-09-27', observedBrowsers:2, returned:1, mature:true });
assert.equal(rows[1].mature,false);
assert.equal(rows.length,2);
rows = summarizeOutfit(events,new Date('2026-09-28T15:59:00Z')).cohorts;
assert.equal(rows[0].mature,false);
assert.equal(summarizeOutfit([]).cohorts.length,0);
console.log('PASS outfit retention: opt-in visitor schema, birth rejection, Beijing midnight, duplicates, incomplete cohorts, invalid/future dates');
