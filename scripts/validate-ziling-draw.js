#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const asDataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;

const main = async () => {
  const errors = [];
  const dataSource = fs.readFileSync(path.join(__dirname, '../src/tools/ziling-pai/ziling-data.js'), 'utf8');
  const { ZILING_DECK } = await import(asDataUrl(dataSource));
  globalThis.__ZILING_TEST_DECK__ = ZILING_DECK;

  const viewModelPath = path.join(__dirname, '../src/tools/ziling-pai/ziling-view-model.js');
  const viewModelSource = fs.readFileSync(viewModelPath, 'utf8')
    .replace("import { ZILING_DECK } from './ziling-data.js';", 'const ZILING_DECK = globalThis.__ZILING_TEST_DECK__;');
  const viewModel = await import(asDataUrl(viewModelSource));

  const expectedCounts = { 主星: 16, 甲级辅星: 14, 乙级辅星: 32, 丙级辅星: 17, 四化: 12 };
  if (JSON.stringify(viewModel.DRAW_LEVELS) !== JSON.stringify(Object.keys(expectedCounts))) {
    errors.push('完整抽牌顺序必须是主星、甲级、乙级、丙级、四化');
  }
  Object.entries(expectedCounts).forEach(([level, count]) => {
    if (viewModel.getDrawPool(level).length !== count) errors.push(`${level}牌库必须有${count}张实体牌`);
  });

  const majorPool = viewModel.getDrawPool('主星');
  const emptyMajor = majorPool.find((card) => card.空宫);
  const chart = { ready: true, getOpposite: () => ({ 空宫: false, 主星: [{ 名: '紫微' }] }) };
  const resolved = viewModel.resolveMajorCard({ card: emptyMajor, typeKey: 'career', chart });
  if (resolved?.名 !== '紫微' || !resolved?._fromEmpty || resolved?._via !== '对宫') {
    errors.push('简化抽牌抽中主星空宫时，必须继续按既有规则补实牌阵');
  }

  const controller = fs.readFileSync(path.join(__dirname, '../src/tools/ziling-pai/ziling-controller.js'), 'utf8');
  if (!/data-zl-full-draw/.test(controller) || !/data-zl-quick-draw/.test(controller)) errors.push('STEP 02 必须同时提供完整与简化抽牌');
  if (!/data-zl-pick-card/.test(controller) || !/data-zl-confirm-card/.test(controller)) errors.push('完整模式必须先选牌、揭面，再确认进入下一级');
  if (!/data-zl-redraw-major/.test(controller) || !/model\.drawPool = model\.drawPool\.filter/.test(controller)
    || /resolveMajorCard\(\{ card: picked/.test(controller)) errors.push('完整模式抽中主星空宫时必须由用户从剩余牌中主动重抽');
  if (!/backArt\(11 \+ i \* 7\)/.test(controller) || /zl-mini-name/.test(controller)) errors.push('铺开的实体牌必须保留原版北斗七星牌背');
  if (!/model\.spread\.push\(model\.pendingCard\)/.test(controller)) errors.push('用户确认的每级牌面必须依次进入最终牌阵');

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL ${error}`));
    process.exit(1);
  }
  console.log('PASS ziling draw: full 16/14/32/17/12 pools, manual empty-major redraw, reveal confirmation and quick mode');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
