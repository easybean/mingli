// 紫灵牌 · SVG 星图美术件（纯字符串，无依赖）。北斗/八卦/星空/牌背。
// reduced-motion 由 ziling-styles.js 的全局规则统一降级，这里可放心写 inline 动画。

const rng = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};
const f = (n, d = 1) => Number(n).toFixed(d);

// 星空：n 颗星，按主题决定亮度
export const starfield = (n, w, h, seed, bright = true) => {
  const r = rng(seed);
  let els = '';
  for (let i = 0; i < n; i++) {
    const cx = f(r() * w), cy = f(r() * h);
    const rad = f(0.5 + r() * 1.6, 2);
    const o = f((bright ? 0.25 : 0.16) + r() * (bright ? 0.7 : 0.45), 2);
    const big = rad > 1.5;
    const fill = big ? '#C9A646' : (bright ? '#CBB270' : '#B89A52');
    const dur = f(3 + r() * 4);
    const delay = f(r() * 4);
    els += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" opacity="${o}" style="animation:zl-twinkle ${dur}s ease-in-out ${delay}s infinite"/>`;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;display:block">${els}</svg>`;
};

// 八卦环（+可选太极心，比例移植自主程序 cosmos.js）
export const baguaRing = (size, gold = '#D6B25E', withTaichi = false) => {
  const c = size / 2, R = size * 0.40;
  const trigs = [[1, 1, 1], [1, 1, 0], [1, 0, 1], [1, 0, 0], [0, 1, 1], [0, 1, 0], [0, 0, 1], [0, 0, 0]];
  const barW = size * 0.10, lh = size * 0.013, gap = size * 0.022, step = size * 0.026;
  let groups = '';
  trigs.forEach((t, i) => {
    let bars = '';
    t.forEach((yang, j) => {
      const y = (j - 1) * step;
      if (yang) {
        bars += `<rect x="${-barW / 2}" y="${y - lh / 2}" width="${barW}" height="${lh}" rx="${lh / 2}" fill="${gold}"/>`;
      } else {
        const seg = (barW - gap) / 2;
        bars += `<rect x="${-barW / 2}" y="${y - lh / 2}" width="${seg}" height="${lh}" rx="${lh / 2}" fill="${gold}"/>`;
        bars += `<rect x="${gap / 2}" y="${y - lh / 2}" width="${seg}" height="${lh}" rx="${lh / 2}" fill="${gold}"/>`;
      }
    });
    groups += `<g transform="rotate(${i * 45} ${c} ${c}) translate(${c} ${c - R})">${bars}</g>`;
  });
  const rings =
    `<circle cx="${c}" cy="${c}" r="${R + size * 0.075}" fill="none" stroke="${gold}" stroke-width="0.8" stroke-opacity="0.5"/>` +
    `<circle cx="${c}" cy="${c}" r="${R - size * 0.075}" fill="none" stroke="${gold}" stroke-width="0.8" stroke-opacity="0.5"/>`;
  let taichi = '';
  if (withTaichi) {
    const tr = size * 0.13;
    taichi =
      `<circle cx="${c}" cy="${c}" r="${tr}" fill="none" stroke="${gold}" stroke-width="1" stroke-opacity="0.7"/>` +
      `<path d="M ${c} ${c - tr} A ${tr / 2} ${tr / 2} 0 0 1 ${c} ${c} A ${tr / 2} ${tr / 2} 0 0 0 ${c} ${c + tr}" fill="none" stroke="${gold}" stroke-width="1" stroke-opacity="0.7"/>` +
      `<circle cx="${c}" cy="${c - tr / 2}" r="${tr * 0.13}" fill="${gold}" opacity="0.85"/>` +
      `<circle cx="${c}" cy="${c + tr / 2}" r="${tr * 0.13}" fill="none" stroke="${gold}" stroke-width="1" stroke-opacity="0.7"/>`;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">${rings}${groups}${taichi}</svg>`;
};

// 北斗七星指向紫微（坐标移植自主程序 cosmos.js 已修正的真实图样）。
// 摇光→开阳→玉衡→天权→天玑→天璇→天枢，勺口（天枢↔天权）不连；天枢延长线遥指紫微。
export const dipper = (gold = '#D6B25E', violet = '#B498DC') => {
  const yaoguang = [17, 54];   // 摇光（斗柄末端）
  const kaiyang = [96, 83];    // 开阳
  const yuheng = [129, 129];   // 玉衡
  const tianquan = [176, 168]; // 天权（斗柄接斗口）
  const tianji = [163, 231];   // 天玑（斗口内）
  const tianxuan = [255, 258]; // 天璇（斗口外）
  const tianshu = [293, 194];  // 天枢（斗口外 · 指极星）
  const polaris = [354, 92];   // 北极星 / 紫微（天璇-天枢延长线上）
  const chain = [yaoguang, kaiyang, yuheng, tianquan, tianji, tianxuan, tianshu];

  const line = `<polyline points="${chain.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${gold}" stroke-width="1.2" stroke-opacity="0.55" stroke-linejoin="round" stroke-linecap="round"/>`;
  const guide = `<line x1="${tianshu[0]}" y1="${tianshu[1]}" x2="${polaris[0]}" y2="${polaris[1]}" stroke="${violet}" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="3 5"/>`;
  const ziwei =
    `<circle cx="${polaris[0]}" cy="${polaris[1]}" r="4.5" fill="${violet}" opacity="0.9" style="filter:drop-shadow(0 0 7px rgba(180,152,220,0.9))"/>` +
    `<circle cx="${polaris[0]}" cy="${polaris[1]}" r="9" fill="none" stroke="${violet}" stroke-width="0.8" stroke-opacity="0.4"/>`;
  const stars = chain.map((p) =>
    `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#F0DCA0" style="filter:drop-shadow(0 0 5px rgba(240,220,160,0.95))"/>` +
    `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="none" stroke="${gold}" stroke-width="0.6" stroke-opacity="0.35"/>`).join('');
  return `<svg width="100%" height="100%" viewBox="0 30 380 250" style="overflow:visible">${line}${guide}${ziwei}${stars}</svg>`;
};

// 牌背纹样（星空 + 真实北斗七星指紫微）。北斗坐标同 cosmos.js，按比例缩放居中进 100×140 牌面。
export const backArt = (seed = 11) => {
  const r = rng(seed);
  let els = '';
  for (let i = 0; i < 26; i++) {
    els += `<circle cx="${f(r() * 100)}" cy="${f(r() * 140)}" r="${f(0.4 + r() * 1.2, 2)}" fill="#C9A646" opacity="${f(0.16 + r() * 0.55, 2)}"/>`;
  }
  // 真实七星（含紫微）整体缩放居中：原始 bbox x17..354 / y54..258，中心(185.5,156)→牌面(50,70)
  const s = 0.237, ox = 50 - 185.5 * s, oy = 70 - 156 * s;
  const T = (p) => [+(ox + p[0] * s).toFixed(1), +(oy + p[1] * s).toFixed(1)];
  const raw = [[17, 54], [96, 83], [129, 129], [176, 168], [163, 231], [255, 258], [293, 194]];
  const chain = raw.map(T);
  const tianshu = chain[6];
  const polaris = T([354, 92]);

  els += `<polyline points="${chain.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#C9A646" stroke-width="0.8" stroke-opacity="0.55" stroke-linejoin="round" stroke-linecap="round"/>`;
  els += `<line x1="${tianshu[0]}" y1="${tianshu[1]}" x2="${polaris[0]}" y2="${polaris[1]}" stroke="#B498DC" stroke-width="0.7" stroke-opacity="0.45" stroke-dasharray="2.5 4"/>`;
  els += `<circle cx="${polaris[0]}" cy="${polaris[1]}" r="6" fill="none" stroke="#B498DC" stroke-width="0.6" stroke-opacity="0.4"/>`;
  els += `<circle cx="${polaris[0]}" cy="${polaris[1]}" r="2.6" fill="#B498DC" opacity="0.95" style="filter:drop-shadow(0 0 4px rgba(180,152,220,0.9))"/>`;
  chain.forEach((p) => {
    els += `<circle cx="${p[0]}" cy="${p[1]}" r="1.6" fill="#F0DCA0" style="filter:drop-shadow(0 0 3px rgba(240,220,160,0.95))"/>`;
    els += `<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="none" stroke="#C9A646" stroke-width="0.4" stroke-opacity="0.32"/>`;
  });
  return `<svg width="100%" height="100%" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;display:block">${els}</svg>`;
};

// 洗牌牌堆纹样
export const pileArt = (seed) => {
  const r = rng(seed);
  let els = '';
  for (let i = 0; i < 16; i++) {
    els += `<circle cx="${f(r() * 100)}" cy="${f(r() * 140)}" r="${f(0.4 + r() * 1.1, 2)}" fill="#C9A646" opacity="${f(0.2 + r() * 0.55, 2)}"/>`;
  }
  els += `<circle cx="50" cy="70" r="20" fill="none" stroke="#C9A646" stroke-width="0.7" stroke-opacity="0.4"/>`;
  els += `<circle cx="50" cy="70" r="3" fill="#B498DC" opacity="0.9"/>`;
  return `<svg width="100%" height="100%" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0">${els}</svg>`;
};
