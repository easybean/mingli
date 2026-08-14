#!/usr/bin/env node
// 用 playwright 把 og-template.html 渲染成 PNG。
// 用法: node scripts/og/render.js [模板.html] [输出.png] [宽] [高]
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const tpl = process.argv[2] || path.join(__dirname, 'og-template.html');
  const out = process.argv[3] || path.join(__dirname, '..', '..', 'public', 'og-image.png');
  const width = Number(process.argv[4] || 1200);
  const height = Number(process.argv[5] || 630);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(tpl), { waitUntil: 'networkidle' });
  // 等字体真正就绪
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } });
  await browser.close();
  console.log('wrote', out, `${width}x${height}@2x`);
}

main().catch((e) => { console.error(e); process.exit(1); });
