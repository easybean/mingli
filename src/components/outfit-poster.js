// A deterministic, canvas-native colour editorial. Preview and download share these pixels.
const THEMES = {
  木: { ink: '#233D30', paper: '#F3F5EE', mood: '把清新，穿在身上。' },
  火: { ink: '#682C3A', paper: '#FCF2EE', mood: '给日常，一点热烈。' },
  土: { ink: '#59402C', paper: '#FAF4E8', mood: '温柔一点，也很有力量。' },
  金: { ink: '#403C31', paper: '#F6F5EF', mood: '干净的颜色，自有光芒。' },
  水: { ink: '#253C51', paper: '#F0F4F6', mood: '安静的颜色，也很出挑。' },
};
const SANS = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
const SERIF = '"Noto Serif SC", "Songti SC", serif';
const contrastInk = hex => {
  const rgb = hex.replace('#', '').match(/../g).map(v => parseInt(v, 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .25 ? '#1B2325' : '#FFFFFF';
};

export const drawOutfitPoster = (canvas, data) => {
  const top = data.groups[0];
  const theme = THEMES[top.element] || THEMES.土;
  // Personal reference palettes include all supported alternatives, not today's luck ordering.
  const alternatives = data.personal
    ? (data.referencePalettes || []).filter(group => group.element !== top.element)
    : data.groups.slice(1);
  const c = canvas.getContext('2d');
  const text = (value, x, y, size, options = {}) => {
    c.font = `${options.weight || 500} ${size}px ${options.serif ? SERIF : SANS}`;
    c.fillStyle = options.color || theme.ink;
    c.textAlign = options.align || 'left';
    c.fillText(String(value), x, y);
  };
  const lines = (value, size, width, weight = 500) => {
    c.font = `${weight} ${size}px ${SANS}`;
    const result = []; let row = '';
    for (const char of String(value)) {
      if (row && c.measureText(row + char).width > width) { result.push(row); row = char; }
      else row += char;
    }
    if (row) result.push(row);
    return result;
  };
  const lookRows = data.looks.map(value => lines(value, 42, 884));
  const alternativeHeight = alternatives.length ? 84 + alternatives.length * 100 : 0;
  const lookTop = 842 + alternativeHeight;
  const lookHeight = 84 + lookRows.reduce((sum, rows) => sum + rows.length * 60 + 24, 0);
  const noteTop = lookTop + lookHeight;
  canvas.width = 1080;
  canvas.height = Math.max(1440, noteTop + 214);
  c.textBaseline = 'alphabetic';
  c.fillStyle = theme.paper; c.fillRect(0, 0, canvas.width, canvas.height);
  const rect = (x, y, width, height, color, radius = 0) => {
    c.fillStyle = color; c.beginPath(); c.roundRect(x, y, width, height, radius); c.fill();
  };
  const rule = y => { c.strokeStyle = theme.ink; c.globalAlpha = .18; c.lineWidth = 2; c.beginPath(); c.moveTo(48, y); c.lineTo(1032, y); c.stroke(); c.globalAlpha = 1; };

  text('MINGLI  /  色彩手帖', 48, 72, 32, { weight: 700 });
  text(data.personal ? '个人版' : '每日通用版', 1032, 72, 32, { align: 'right' });
  text(data.personal ? '我的五行搭配' : '五行穿搭', 48, 178, 86, { weight: 700, serif: true });
  const [year, month, day] = data.date.split('-');
  text(`${month}.${day}`, 1032, 165, 62, { weight: 600, align: 'right' });
  text(year, 1032, 217, 32, { align: 'right' });
  text(data.personal ? '长期参考色系 · 不随每日吉凶变化' : `农历${data.lunar} · ${data.day}日 · 日支属${data.element}`, 48, 237, 34);
  rule(269);
  text(data.personal ? `本次选择 · ${top.element}色系` : `主推配色 · ${top.label}`, 48, 318, 40, { weight: 700 });
  text(theme.mood, 1032, 318, 34, { align: 'right' });

  top.hex.forEach((hex, i) => {
    const x = 48 + i * 332, y = 346, width = 320, height = 454;
    const ink = contrastInk(hex);
    rect(x, y, width, height, hex, 12);
    c.save();
    c.beginPath(); c.roundRect(x, y, width, height, 12); c.clip();
    // Subtle folded-paper geometry, with plenty of untouched colour for easy matching.
    c.fillStyle = ink; c.globalAlpha = .055;
    c.beginPath(); c.moveTo(x + 200, y); c.lineTo(x + width, y); c.lineTo(x + width, y + 310); c.lineTo(x + 100, y + 454); c.fill();
    c.restore();
    text(`0${i + 1}`, x + 24, y + 53, 32, { color: ink, weight: 600 });
    text(top.colors[i], x + 24, y + 359, 60, { color: ink, weight: 700 });
    text(['主色灵感', '同色搭配', '配饰点缀'][i], x + 24, y + 411, 34, { color: ink });
    // Warm white / silver still have visible boundaries against the page.
    c.strokeStyle = theme.ink; c.globalAlpha = .13; c.lineWidth = 2;
    c.beginPath(); c.roundRect(x + 1, y + 1, width - 2, height - 2, 12); c.stroke(); c.globalAlpha = 1;
  });

  if (alternatives.length) {
    text(data.personal ? '你还可以选这些色系' : '其他配色，一眼看全', 48, 864, 42, { weight: 700 });
    alternatives.forEach((group, index) => {
      const y = 900 + index * 100;
      text(data.personal ? `${group.element}色系` : group.label, 48, y + 53, 40, { weight: 600 });
      group.hex.forEach((hex, i) => {
        const x = 238 + i * 268;
        rect(x, y, 256, 78, hex, 10);
        text(group.colors[i], x + 128, y + 54, 42, { color: contrastInk(hex), weight: 600, align: 'center' });
      });
    });
  }

  rule(lookTop - 16);
  text(data.personal ? `${data.sceneLabel} · 这样搭就好` : '从衣橱里，找一套喜欢的', 48, lookTop + 46, 44, { weight: 700, serif: true });
  let cursor = lookTop + 108;
  lookRows.forEach((rows, index) => {
    rect(48, cursor - 38, 54, 54, theme.ink, 27);
    text(String(index + 1), 75, cursor + 1, 32, { color: theme.paper, align: 'center', weight: 600 });
    rows.forEach((row, line) => text(row, 126, cursor + line * 60, 42));
    cursor += rows.length * 60 + 24;
  });
  text('不用换整套，一件衣服或一个配饰就够。', 48, noteTop + 34, 36);
  const footer = canvas.height - 142;
  rule(footer);
  text('穿得舒服，自己喜欢更重要。', 48, footer + 51, 36, { weight: 600 });
  text(data.personal ? '八字调候取色 · 民俗配色参考 · 不含完整出生资料' : '日支五行法 · 北京时间换日 · 民俗配色参考', 48, footer + 98, 28);
  return canvas;
};
