const assert = require('node:assert/strict');
const { buildDailyOutfit, beijingDate } = require('../daily-outfit');
const sample = buildDailyOutfit('2026-09-28');
assert.equal(sample.day, '乙巳');
assert.deepEqual(sample.groups.map((g) => g.element), ['土', '火', '水', '木', '金']);
assert.equal(beijingDate(new Date('2026-09-28T15:59:59Z')), '2026-09-28');
assert.equal(beijingDate(new Date('2026-09-28T16:00:00Z')), '2026-09-29');
for (const date of ['2026-02-30', '2026-13-01', '0000-01-01', '<script>']) assert.throws(() => buildDailyOutfit(date));
for (let i = 0; i < 366; i++) {
  const date = new Date(Date.UTC(2024, 0, 1 + i)).toISOString().slice(0, 10);
  const data = buildDailyOutfit(date);
  assert.equal(new Set(data.groups.map((g) => g.element)).size, 5);
  assert.ok(data.groups.every((g) => g.hex.length === 3 && g.colors.length === 3));
  assert.equal(data.looks.length, 2);
}
console.log('PASS daily outfit: reference date, Beijing midnight, leap year, five-element coverage and invalid dates');
