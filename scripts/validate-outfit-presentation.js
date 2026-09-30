const assert = require('node:assert/strict');
const fs = require('node:fs');
const { buildDailyOutfit } = require('../daily-outfit');
(async () => {
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/domain/outfit-presentation.js'), 'utf8');
  const { buildPersonalOutfit, outfitShareText, OUTFIT_SCENES } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const data = buildDailyOutfit('2026-09-28');
  assert.equal(buildPersonalOutfit(data, ['invalid']), null);
  for (const element of ['木','火','土','金','水']) for (const scene of Object.keys(OUTFIT_SCENES)) {
    const personal = buildPersonalOutfit(data, ['水',element,element], element, scene);
    assert.equal(personal.groups[0].element, element);
    assert.equal(personal.scene, scene);
    assert.equal(personal.looks.length, 2);
    assert.deepEqual(personal.referencePalettes.map(group => group.element), [...new Set(['水', element])]);
    assert.ok(personal.referencePalettes.every(group => group.colors.length === 3 && group.hex.length === 3));
    const text = outfitShareText({ ...personal, birthDate: 'SECRET_BIRTH', birthPlace: 'SECRET_PLACE' });
    assert.ok(!text.includes('SECRET_'));
    assert.ok(text.includes(personal.groups[0].colors[0]));
    assert.ok(text.includes('民俗配色参考'));
  }
  const fallback = buildPersonalOutfit(data, ['金','水'], '火', '__proto__');
  assert.equal(fallback.groups[0].element,'金');
  assert.equal(fallback.scene,'everyday');
  assert.equal(buildPersonalOutfit(data,['金','水'],'水').overlap,false);
  assert.equal(buildPersonalOutfit(data,['金','土'],'金').overlap,true);
  assert.ok(outfitShareText(data).includes('今日五行色卡'));
  console.log('PASS outfit presentation: five palettes × three scenes, supported selection, fallback, dedup and share privacy');
})().catch(error => { console.error(error); process.exit(1); });
