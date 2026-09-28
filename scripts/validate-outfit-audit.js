const assert = require('node:assert/strict');
const fs = require('node:fs');
const { buildAuditedGuide } = require('../tiaohou-guide');
const audit = require('../data/knowledge-rules/bazi-tiaohou-audit.json');
const original = require('../data/knowledge-rules/bazi-tiaohou-qiongtong.json');
let paused = 0, changed = 0;
assert.equal(Object.keys(audit.rows).length, 10);
for (const stem of '甲乙丙丁戊己庚辛壬癸') {
  assert.equal(audit.rows[stem].length, 12);
  audit.rows[stem].forEach(([stems, locator, note], i) => {
    assert.match(stems, /^[甲乙丙丁戊己庚辛壬癸]*$/);
    assert.ok(locator.length >= 4 && note.length >= 10);
    const guide = buildAuditedGuide(stem, audit.months[i]);
    assert.equal(guide.auditVersion, audit.version);
    assert.equal(guide.locator, audit.sourceOverrides?.[`${stem}${audit.months[i]}`]?.locator || locator);
    assert.ok(guide.favored.length <= 2);
    assert.ok(guide.favored.every(element => '金木水火土'.includes(element)));
    if (!stems) { paused++; assert.equal(guide.status, 'conditional-paused'); assert.deepEqual(guide.favored, []); }
    else assert.equal(guide.status, 'baseline-only');
    if (stems !== original.table[stem][audit.months[i]].join('')) changed++;
  });
}
assert.equal(paused, 9);
assert.deepEqual(buildAuditedGuide('甲', '辰').stems, ['庚', '壬']);
assert.deepEqual(buildAuditedGuide('己', '辰').stems, ['丙', '癸', '甲']);
assert.deepEqual(buildAuditedGuide('辛', '酉').favored, ['水']);
assert.deepEqual(buildAuditedGuide('乙', '丑').favored, ['火']);
assert.match(buildAuditedGuide('乙', '丑').sourceUrl, /#page=69$/);
for (const [stem, branch] of [['__proto__','子'],['甲','坏'],[null,null]]) assert.equal(buildAuditedGuide(stem,branch).status,'unavailable');
// Optional local source audit: exact locators, not a claim of textual authenticity.
if (process.argv[2]) {
  const text = fs.readFileSync(process.argv[2], 'utf8').replace(/<[^>]+>/g, '');
  for (const [stem, rows] of Object.entries(audit.rows)) rows.forEach(([, locator], index) => {
    if (!audit.sourceOverrides?.[`${stem}${audit.months[index]}`]) assert.ok(text.includes(locator), `Missing source locator: ${locator}`);
  });
}
console.log(`PASS audit: 120 documented entries, ${paused} paused, ${changed} stem-list/status differences from legacy table; correction regressions and invalid input`);
