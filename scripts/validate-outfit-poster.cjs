// Repeatable offline visual/content QA. Run with:
// NODE_PATH=/Users/douw/node_modules node scripts/validate-outfit-poster.cjs
// Optional: OUTFIT_POSTER_ARTIFACT_DIR=/absolute/path/to/new-output-directory
// Only a loopback server is started; analytics and remote resources are blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { buildDailyOutfit } = require('../daily-outfit');
const { server } = require('../server');

const ELEMENTS = ['木', '火', '土', '金', '水'];
const SCENES = ['everyday', 'work', 'accent'];
const SLUGS = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };
const PRIVATE = ['PRIVATE_NAME_POSTER_QA', '1988-08-18', 'PRIVATE_PLACE_POSTER_QA'];
const artifactDir = process.env.OUTFIT_POSTER_ARTIFACT_DIR
  ? path.resolve(process.env.OUTFIT_POSTER_ARTIFACT_DIR)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'mingli-outfit-poster-'));
fs.mkdirSync(artifactDir, { recursive: true });

// Fixed dates make screenshots independent of the day on which QA is run.
const dailyByElement = new Map();
for (let day = 1; day <= 31 && dailyByElement.size < ELEMENTS.length; day += 1) {
  const data = buildDailyOutfit(`2026-10-${String(day).padStart(2, '0')}`);
  dailyByElement.set(data.element, data);
}
assert.equal(dailyByElement.size, ELEMENTS.length, 'Fixtures cover all five day elements');
const daily = [...dailyByElement.values()];
for (const data of daily) {
  assert.equal(data.groups.length, 5);
  assert.deepEqual([...new Set(data.groups.map(group => group.element))].sort(), [...ELEMENTS].sort());
  assert.ok(data.groups.every(group => group.colors.length === 3 && group.hex.length === 3));
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

(async () => {
  let browser;
  const browserErrors = [];
  const requests = [];
  const issues = [];
  const report = { artifacts: artifactDir, offline: true, cases: [], viewports: [] };
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin && !['blob:', 'data:'].includes(url.protocol)) return route.abort();
      if (url.pathname.startsWith('/api/analytics')) return route.fulfill({ status: 204, body: '' });
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', error => browserErrors.push(error.message));
    page.on('request', request => requests.push(`${request.url()} ${request.postData() || ''}`));
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const results = await page.evaluate(async ({ daily, elements, scenes, slugs, privateValues }) => {
      const { drawOutfitPoster, buildPersonalOutfit } = await import('/src/components/daily-outfit.js');
      const { outfitShareText } = await import('/src/domain/outfit-presentation.js');
      const withPrivateFields = data => ({ ...data,
        name: privateValues[0], birthDate: privateValues[1], birthPlace: privateValues[2],
        profile: { name: privateValues[0], birthDate: privateValues[1], birthPlace: privateValues[2] },
      });
      const cases = daily.map(data => ({
        id: `public-${slugs[data.element]}`, title: `通用 / 日支${data.element}`, data: withPrivateFields(data),
        expectedPalettes: data.groups,
      }));
      for (const element of elements) for (const scene of scenes) {
        const data = buildPersonalOutfit(withPrivateFields(daily[0]), [...elements, element], element, scene);
        cases.push({ id: `personal-${slugs[element]}-${scene}`, title: `个人 / ${element} / ${data.sceneLabel}`,
          data, expectedPalettes: daily[0].groups });
      }
      const longNames = {
        木: ['青苔浅绿', '鼠尾草绿', '松针深绿'], 火: ['复古胭红', '浅雾柔粉', '暖调莓紫'],
        土: ['柔光奶黄', '沙漠卡其', '浓郁咖棕'], 金: ['珍珠暖白', '月光银色', '浅香槟金'],
        水: ['曜石墨黑', '烟雨雾蓝', '静谧海蓝'],
      };
      const longData = { ...daily[0], groups: daily[0].groups.map(group => ({ ...group, colors: longNames[group.element] })) };
      cases.push({ id: 'public-four-character-colors', title: '通用 / 全部四字色名',
        data: withPrivateFields(longData), expectedPalettes: longData.groups });
      cases.push({ id: 'personal-five-palettes-four-character-colors', title: '个人 / 五参考色 / 四字色名',
        data: buildPersonalOutfit(withPrivateFields(longData), elements, '木', 'work'), expectedPalettes: longData.groups });

      const normalize = value => String(value).replace(/\s+/g, '');
      return cases.map(test => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const drawnText = [];
        const errors = [];
        const originalFillText = context.fillText.bind(context);
        context.fillText = (value, x, y, maxWidth) => {
          const metrics = context.measureText(value);
          const transform = context.getTransform();
          const scale = maxWidth && metrics.width > maxWidth ? maxWidth / metrics.width : 1;
          const left = x - metrics.actualBoundingBoxLeft * scale;
          const right = x + metrics.actualBoundingBoxRight * scale;
          const top = y - metrics.actualBoundingBoxAscent;
          const bottom = y + metrics.actualBoundingBoxDescent;
          const corners = [new DOMPoint(left, top), new DOMPoint(right, top), new DOMPoint(left, bottom), new DOMPoint(right, bottom)]
            .map(point => point.matrixTransform(transform));
          const bounds = { left: Math.min(...corners.map(point => point.x)), right: Math.max(...corners.map(point => point.x)),
            top: Math.min(...corners.map(point => point.y)), bottom: Math.max(...corners.map(point => point.y)) };
          drawnText.push({ text: String(value), font: context.font,
            size: Number(context.font.match(/([\d.]+)px/)?.[1] || 0), bounds });
          if (maxWidth === undefined) originalFillText(value, x, y);
          else originalFillText(value, x, y, maxWidth);
        };
        try { drawOutfitPoster(canvas, test.data); }
        finally { context.fillText = originalFillText; }
        if (canvas.width < 720 || canvas.height <= canvas.width) errors.push('Expected a high-resolution portrait canvas');
        for (const record of drawnText) {
          const box = record.bounds;
          if (box.left < -1 || box.top < -1 || box.right > canvas.width + 1 || box.bottom > canvas.height + 1) {
            errors.push(`Text outside canvas: ${record.text} (${JSON.stringify(box)})`);
          }
        }
        const content = drawnText.map(record => record.text).join('\n');
        const allText = normalize(content);
        const shared = outfitShareText(test.data);
        for (const privateValue of privateValues) {
          if (content.includes(privateValue) || shared.includes(privateValue)) errors.push(`Private field was rendered or shared: ${privateValue}`);
        }
        if (!content.includes('民俗')) errors.push('Missing folk-reference disclaimer');
        if (!content.includes('MINGLI')) errors.push('Missing MINGLI attribution');
        for (const look of test.data.looks) {
          if (!allText.includes(normalize(look))) errors.push(`Missing outfit suggestion: ${look}`);
        }
        if (test.data.personal) {
          if (test.data.groups.length !== 1) errors.push('Personal selected palette must remain one group');
          if (test.data.referenceColors.length !== 5) errors.push('Five reference palettes were not deduplicated correctly');
          if (!content.includes(test.data.sceneLabel)) errors.push(`Missing scene: ${test.data.sceneLabel}`);
        } else {
          for (const group of test.data.groups) if (!content.includes(group.label)) errors.push(`Missing group label: ${group.label}`);
        }
        const colorNameMetrics = [];
        for (const palette of test.expectedPalettes) for (const colorName of palette.colors) {
          const occurrences = drawnText.filter(record => normalize(record.text).includes(normalize(colorName)));
          if (!occurrences.length) { errors.push(`Missing color: ${colorName}`); continue; }
          const size = Math.max(...occurrences.map(record => record.size));
          const primary = test.data.groups[0].element === palette.element;
          // Relative to the poster width, so changing export dimensions is safe.
          const minimum = canvas.width * (primary ? 54 : 40) / 1080;
          if (size + 0.01 < minimum) errors.push(`Small ${primary ? 'primary' : 'secondary'} color label: ${colorName} (${size}px < ${minimum}px)`);
          colorNameMetrics.push({ name: colorName, primary, size });
        }
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorCount = new Map();
        let samples = 0;
        for (let y = 0; y < canvas.height; y += 2) for (let x = 0; x < canvas.width; x += 2) {
          const at = (y * canvas.width + x) * 4;
          const key = (pixels[at] << 16) | (pixels[at + 1] << 8) | pixels[at + 2];
          colorCount.set(key, (colorCount.get(key) || 0) + 1);
          samples += 1;
        }
        const colorCoverage = test.expectedPalettes.flatMap(palette => palette.hex.map(hex => ({
          element: palette.element, hex, ratio: (colorCount.get(parseInt(hex.slice(1), 16)) || 0) / samples,
        })));
        for (const color of colorCoverage) {
          if (color.ratio < 0.002) errors.push(`Color is not visibly represented: ${color.hex} (${(100 * color.ratio).toFixed(3)}%)`);
        }
        const primaryCoverage = colorCoverage.filter(color => color.element === test.data.groups[0].element)
          .reduce((sum, color) => sum + color.ratio, 0);
        // Count untouched palette pixels, excluding decorative folds and glyphs.
        if (primaryCoverage < 0.10) errors.push(`Untouched primary colors occupy only ${(100 * primaryCoverage).toFixed(1)}% of the poster`);
        return { id: test.id, title: test.title, width: canvas.width, height: canvas.height, errors,
          primaryCoverage, colorCoverage, colorNameMetrics, drawnText, dataUrl: canvas.toDataURL('image/png') };
      });
    }, { daily, elements: ELEMENTS, scenes: SCENES, slugs: SLUGS, privateValues: PRIVATE });

    for (const result of results) {
      fs.writeFileSync(path.join(artifactDir, `${result.id}.png`), Buffer.from(result.dataUrl.split(',')[1], 'base64'));
      const { dataUrl, ...metrics } = result;
      report.cases.push(metrics);
      issues.push(...result.errors.map(error => `${result.id}: ${error}`));
    }
    const sheet = await context.newPage();
    await sheet.setViewportSize({ width: 1500, height: 900 });
    await sheet.setContent(`<style>body{margin:0;padding:20px;background:#e8e6e1;font:16px sans-serif}main{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}figure{margin:0}figcaption{height:28px;font-weight:600}img{display:block;width:100%;height:auto}</style><main>${results.map(result => `<figure><figcaption>${escapeHtml(result.title)}</figcaption><img src="${result.dataUrl}" alt="${escapeHtml(result.title)}"></figure>`).join('')}</main>`);
    await sheet.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await sheet.screenshot({ path: path.join(artifactDir, 'contact-sheet.png'), fullPage: true });
    await sheet.close();

    // Use deterministic fixtures to exercise all five palette controls without
    // requiring a birth form, a production API, or any external account.
    await page.route('**/api/daily-outfit?*', route => route.fulfill({ json: daily[0] }));
    await page.route('**/api/outfit-guide?*', route => route.fulfill({ json: {
      status: 'ready', dayElement: '木', favored: ELEMENTS,
      basis: '海报回归测试的固定五色候选。', source: '本地回归样本',
      sourceUrl: 'https://zh.wikisource.org/wiki/穷通宝鉴', locator: '固定样本', verification: '测试数据',
    } }));
    const waitForPreview = () => page.waitForFunction(() => {
      const image = document.querySelector('.outfit-preview');
      return image && !image.hidden && image.complete && image.naturalWidth > 0
        && !document.querySelector('[data-save]').disabled;
    });
    const closeDialog = async () => {
      await page.locator('[data-close]').click();
      await page.locator('.outfit-dialog').waitFor({ state: 'detached' });
    };
    const openPersonal = () => page.evaluate(async privateValues => {
      const { openDailyOutfit } = await import('/src/components/daily-outfit.js');
      openDailyOutfit({ name: privateValues[0], birthDate: privateValues[1], birthPlace: privateValues[2],
        astrolabeData: { name: privateValues[0], birthDate: privateValues[1],
          bazi: { dayMaster: { stem: '甲' }, pillars: [{ label: '月柱', zhi: '辰' }] } } }, true);
    }, PRIVATE);
    const checkViewport = async (width, mode) => {
      const dimensions = await page.locator('.outfit-dialog').evaluate(dialog => {
        const image = dialog.querySelector('.outfit-preview');
        const rect = image.getBoundingClientRect();
        return { width: window.innerWidth, dialogWidth: dialog.clientWidth, dialogScrollWidth: dialog.scrollWidth,
          documentWidth: document.documentElement.scrollWidth, imageLeft: rect.left, imageRight: rect.right,
          imageWidth: rect.width, imageHeight: rect.height, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
      });
      if (dimensions.dialogScrollWidth > dimensions.dialogWidth + 1) issues.push(`${mode}-${width}: horizontal dialog overflow`);
      if (dimensions.documentWidth > width + 1) issues.push(`${mode}-${width}: horizontal document overflow`);
      if (dimensions.imageLeft < -1 || dimensions.imageRight > width + 1) issues.push(`${mode}-${width}: preview leaves viewport`);
      if (dimensions.imageWidth < width * 0.75) issues.push(`${mode}-${width}: preview is too small for the viewport`);
      if (Math.abs(dimensions.imageWidth / dimensions.imageHeight - dimensions.naturalWidth / dimensions.naturalHeight) > 0.005) issues.push(`${mode}-${width}: preview is distorted`);
      const text = await page.locator('.outfit-dialog').innerText();
      if (PRIVATE.some(value => text.includes(value))) issues.push(`${mode}-${width}: private field leaked into dialog`);
      await page.locator('.outfit-dialog').evaluate(dialog => { dialog.scrollTop = 0; });
      await page.screenshot({ path: path.join(artifactDir, `viewport-${width}-${mode}.png`) });
      await page.locator('.outfit-preview').screenshot({ path: path.join(artifactDir, `preview-${width}-${mode}.png`) });
      report.viewports.push({ mode, ...dimensions });
    };
    for (const width of [320, 360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator('[data-daily-outfit]').first().click();
      await waitForPreview();
      await checkViewport(width, 'public');
      await closeDialog();
      await openPersonal();
      await waitForPreview();
      assert.equal(await page.locator('[data-element]').count(), 5, 'Personal dialog offers every fixture palette');
      await checkViewport(width, 'personal');
      if (width === 320) {
        await page.locator('[data-element="水"]').click();
        await waitForPreview();
        assert.match(await page.locator('.outfit-preview').getAttribute('alt'), /墨黑/);
        await page.locator('[data-scene="work"]').click();
        await waitForPreview();
        await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
          configurable: true, value: { writeText: async () => { throw new Error('QA clipboard fallback'); } },
        }));
        await page.locator('[data-copy]').click();
        const copy = await page.locator('.outfit-copy').inputValue();
        assert.match(copy, /通勤/);
        assert.match(copy, /墨黑/);
        assert.ok(PRIVATE.every(value => !copy.includes(value)), 'Share copy must not contain birth/profile data');
        await checkViewport(width, 'personal-work-water');
      }
      await closeDialog();
    }
    assert.ok(PRIVATE.every(value => requests.every(request => !request.includes(value))), 'Birth/profile sentinel must not leave the browser');
    issues.push(...browserErrors.map(error => `Browser error: ${error}`));
    report.issues = issues;
    fs.writeFileSync(path.join(artifactDir, 'report.json'), JSON.stringify(report, null, 2));
    assert.deepEqual(issues, [], `Poster regression failures. Inspect ${path.join(artifactDir, 'report.json')}`);
    console.log(`PASS outfit poster: ${results.length} canvases; five public day elements; five personal palettes × three scenes; four-character labels; five reference palettes; text bounds and sizes; visible color area; privacy; four narrow viewports; no JS errors.`);
    console.log(`Visual QA artifacts: ${artifactDir}`);
  } finally {
    if (browser) await browser.close();
    if (server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections?.(); });
  }
})().catch(error => {
  console.error(error);
  console.error(`Visual QA artifacts: ${artifactDir}`);
  process.exitCode = 1;
});
