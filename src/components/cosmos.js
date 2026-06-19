// 星象主题的氛围背景层：程序生成的星空 + 缓旋八卦/太极 + 北斗指紫微。
// 纯字符串输出，由 main.js 注入到 #cosmos；非星象主题时整层用 CSS 隐藏。
// 生成逻辑移植自设计稿（确定性 RNG，保证每次排布一致）。

const rng = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const starfield = (n, w, h, seed) => {
  const r = rng(seed);
  let els = '';
  for (let i = 0; i < n; i += 1) {
    const cx = (r() * w).toFixed(1);
    const cy = (r() * h).toFixed(1);
    const rad = (0.4 + r() * 1.5).toFixed(2);
    const o = (0.18 + r() * 0.7).toFixed(2);
    const big = Number(rad) > 1.4;
    els += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${big ? 'var(--cosmos-star-bright,#F0DCA0)' : 'var(--cosmos-star,#E8DFC9)'}" opacity="${o}"`
      + `${big ? ' style="filter:drop-shadow(0 0 3px rgba(240,220,160,0.9))"' : ''}/>`;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${els}</svg>`;
};

// 北斗七星：按实际图样连成一条不闭合的折线
// 摇光→开阳→玉衡→天权→天玑→天璇→天枢，勺口（天枢↔天权）不连。
// 天璇→天枢 连线延长（虚线）遥指北极星 / 紫微。
const dipper = () => {
  const yaoguang = [17, 54]; // 摇光（斗柄末端）
  const kaiyang = [96, 83]; // 开阳
  const yuheng = [129, 129]; // 玉衡
  const tianquan = [176, 168]; // 天权（斗柄接斗口）
  const tianji = [163, 231]; // 天玑（斗口内）
  const tianxuan = [255, 258]; // 天璇（斗口外 · 指极星）
  const tianshu = [293, 194]; // 天枢（斗口外 · 指极星）
  const polaris = [354, 92]; // 北极星 / 紫微（天璇-天枢延长线上）
  // 连线顺序即折线，勺口开口不闭合
  const chain = [yaoguang, kaiyang, yuheng, tianquan, tianji, tianxuan, tianshu];

  const line = `<polyline points="${chain.map((p) => p.join(',')).join(' ')}" fill="none" stroke="var(--cosmos-line,#D6B25E)" stroke-width="1.2" stroke-opacity="0.55" stroke-linejoin="round" stroke-linecap="round"/>`;
  const guide = `<line x1="${tianshu[0]}" y1="${tianshu[1]}" x2="${polaris[0]}" y2="${polaris[1]}" stroke="var(--cosmos-violet,#B498DC)" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="3 5"/>`;
  const ziwei = `<circle cx="${polaris[0]}" cy="${polaris[1]}" r="4.5" fill="var(--cosmos-violet,#B498DC)" opacity="0.9" style="filter:drop-shadow(0 0 7px rgba(180,152,220,0.9))"/>`
    + `<circle cx="${polaris[0]}" cy="${polaris[1]}" r="9" fill="none" stroke="var(--cosmos-violet,#B498DC)" stroke-width="0.8" stroke-opacity="0.4"/>`;
  const stars = chain.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--cosmos-star-bright,#F0DCA0)" style="filter:drop-shadow(0 0 5px rgba(240,220,160,0.95))"/>`
    + `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="none" stroke="var(--cosmos-line,#D6B25E)" stroke-width="0.6" stroke-opacity="0.35"/>`).join('');
  return `<svg width="100%" height="100%" viewBox="0 30 380 250" style="overflow:visible">${line}${guide}${ziwei}${stars}</svg>`;
};

// 八卦环 + 太极心
const baguaRing = (size, withTaichi) => {
  const c = size / 2;
  const R = size * 0.40;
  const trigs = [[1, 1, 1], [1, 1, 0], [1, 0, 1], [1, 0, 0], [0, 1, 1], [0, 1, 0], [0, 0, 1], [0, 0, 0]];
  const barW = size * 0.10;
  const lh = size * 0.013;
  const gap = size * 0.022;
  const step = size * 0.026;
  let groups = '';
  trigs.forEach((t, i) => {
    const ang = i * 45;
    let bars = '';
    t.forEach((yang, j) => {
      const y = (j - 1) * step;
      if (yang) {
        bars += `<rect x="${-barW / 2}" y="${y - lh / 2}" width="${barW}" height="${lh}" rx="${lh / 2}" fill="var(--cosmos-line,#D6B25E)"/>`;
      } else {
        const seg = (barW - gap) / 2;
        bars += `<rect x="${-barW / 2}" y="${y - lh / 2}" width="${seg}" height="${lh}" rx="${lh / 2}" fill="var(--cosmos-line,#D6B25E)"/>`
          + `<rect x="${gap / 2}" y="${y - lh / 2}" width="${seg}" height="${lh}" rx="${lh / 2}" fill="var(--cosmos-line,#D6B25E)"/>`;
      }
    });
    groups += `<g transform="rotate(${ang} ${c} ${c}) translate(${c} ${c - R})">${bars}</g>`;
  });
  const rings = `<circle cx="${c}" cy="${c}" r="${R + size * 0.075}" fill="none" stroke="var(--cosmos-line,#D6B25E)" stroke-width="0.8" stroke-opacity="0.5"/>`
    + `<circle cx="${c}" cy="${c}" r="${R - size * 0.075}" fill="none" stroke="var(--cosmos-line,#D6B25E)" stroke-width="0.8" stroke-opacity="0.5"/>`;
  let taichi = '';
  if (withTaichi) {
    const tr = size * 0.13;
    taichi = `<circle cx="${c}" cy="${c}" r="${tr}" fill="none" stroke="var(--cosmos-line,#D6B25E)" stroke-width="1" stroke-opacity="0.7"/>`
      + `<path d="M ${c} ${c - tr} A ${tr / 2} ${tr / 2} 0 0 1 ${c} ${c} A ${tr / 2} ${tr / 2} 0 0 0 ${c} ${c + tr}" fill="none" stroke="var(--cosmos-line,#D6B25E)" stroke-width="1" stroke-opacity="0.7"/>`
      + `<circle cx="${c}" cy="${c - tr / 2}" r="${tr * 0.13}" fill="var(--cosmos-line,#D6B25E)" opacity="0.85"/>`
      + `<circle cx="${c}" cy="${c + tr / 2}" r="${tr * 0.13}" fill="none" stroke="var(--cosmos-line,#D6B25E)" stroke-width="1" stroke-opacity="0.7"/>`;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">${rings}${groups}${taichi}</svg>`;
};

export const renderCosmos = () => `
  <div class="cosmos-starfield">${starfield(150, 1100, 1700, 3)}</div>
  <div class="cosmos-bagua cosmos-bagua--outer">${baguaRing(560, true)}</div>
  <div class="cosmos-bagua cosmos-bagua--inner">${baguaRing(380, false)}</div>
  <div class="cosmos-dipper">${dipper()}</div>
`;
