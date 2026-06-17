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
    els += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${big ? '#F0DCA0' : '#E8DFC9'}" opacity="${o}"`
      + `${big ? ' style="filter:drop-shadow(0 0 3px rgba(240,220,160,0.9))"' : ''}/>`;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${els}</svg>`;
};

// 北斗七星，柄端虚线遥指紫微星
const dipper = () => {
  const pts = [[18, 120], [60, 104], [104, 100], [150, 86], [150, 46], [206, 40], [244, 16]];
  const polyline = `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#D6B25E" stroke-width="1.2" stroke-opacity="0.55" stroke-linejoin="round" stroke-linecap="round"/>`;
  const guide = '<line x1="244" y1="16" x2="300" y2="-10" stroke="#B498DC" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="3 5"/>';
  const ziwei = '<circle cx="300" cy="-10" r="4.5" fill="#B498DC" opacity="0.9" style="filter:drop-shadow(0 0 7px rgba(180,152,220,0.9))"/>'
    + '<circle cx="300" cy="-10" r="9" fill="none" stroke="#B498DC" stroke-width="0.8" stroke-opacity="0.4"/>';
  const stars = pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#F0DCA0" style="filter:drop-shadow(0 0 5px rgba(240,220,160,0.95))"/>`
    + `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="none" stroke="#D6B25E" stroke-width="0.6" stroke-opacity="0.35"/>`).join('');
  return `<svg width="100%" height="100%" viewBox="0 -30 320 170" style="overflow:visible">${polyline}${guide}${ziwei}${stars}</svg>`;
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
        bars += `<rect x="${-barW / 2}" y="${y - lh / 2}" width="${barW}" height="${lh}" rx="${lh / 2}" fill="#D6B25E"/>`;
      } else {
        const seg = (barW - gap) / 2;
        bars += `<rect x="${-barW / 2}" y="${y - lh / 2}" width="${seg}" height="${lh}" rx="${lh / 2}" fill="#D6B25E"/>`
          + `<rect x="${gap / 2}" y="${y - lh / 2}" width="${seg}" height="${lh}" rx="${lh / 2}" fill="#D6B25E"/>`;
      }
    });
    groups += `<g transform="rotate(${ang} ${c} ${c}) translate(${c} ${c - R})">${bars}</g>`;
  });
  const rings = `<circle cx="${c}" cy="${c}" r="${R + size * 0.075}" fill="none" stroke="#D6B25E" stroke-width="0.8" stroke-opacity="0.5"/>`
    + `<circle cx="${c}" cy="${c}" r="${R - size * 0.075}" fill="none" stroke="#D6B25E" stroke-width="0.8" stroke-opacity="0.5"/>`;
  let taichi = '';
  if (withTaichi) {
    const tr = size * 0.13;
    taichi = `<circle cx="${c}" cy="${c}" r="${tr}" fill="none" stroke="#D6B25E" stroke-width="1" stroke-opacity="0.7"/>`
      + `<path d="M ${c} ${c - tr} A ${tr / 2} ${tr / 2} 0 0 1 ${c} ${c} A ${tr / 2} ${tr / 2} 0 0 0 ${c} ${c + tr}" fill="none" stroke="#D6B25E" stroke-width="1" stroke-opacity="0.7"/>`
      + `<circle cx="${c}" cy="${c - tr / 2}" r="${tr * 0.13}" fill="#D6B25E" opacity="0.85"/>`
      + `<circle cx="${c}" cy="${c + tr / 2}" r="${tr * 0.13}" fill="none" stroke="#D6B25E" stroke-width="1" stroke-opacity="0.7"/>`;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">${rings}${groups}${taichi}</svg>`;
};

export const renderCosmos = () => `
  <div class="cosmos-starfield">${starfield(150, 1100, 1700, 3)}</div>
  <div class="cosmos-bagua cosmos-bagua--outer">${baguaRing(560, true)}</div>
  <div class="cosmos-bagua cosmos-bagua--inner">${baguaRing(380, false)}</div>
  <div class="cosmos-dipper">${dipper()}</div>
`;
