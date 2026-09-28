// The preview and exported PNG are the same canvas, so saved images match the screen.
export const drawOutfitPoster = (canvas, data) => {
  canvas.width = 1080; canvas.height = 1440;
  const c = canvas.getContext('2d');
  const text = (value, x, y, size, color = '#302D28', serif = false) => {
    c.fillStyle = color; c.font = `${serif ? '600' : '400'} ${size}px ${serif ? '"Noto Serif SC", serif' : '"Noto Sans SC", sans-serif'}`;
    c.fillText(value, x, y);
  };
  const line = (y) => { c.strokeStyle = '#D9D0C1'; c.lineWidth = 1; c.beginPath(); c.moveTo(72, y); c.lineTo(1008, y); c.stroke(); };
  c.fillStyle = '#F5F0E6'; c.fillRect(0, 0, 1080, 1440);
  // Fine paper-like dots; deterministic, no external images or fonts required.
  c.fillStyle = '#D7CDBC'; for (let x = 14; x < 1080; x += 37) for (let y = 19; y < 1440; y += 41) c.fillRect(x, y, 1, 1);
  text('MINGLI   /   DAILY COLOUR', 72, 88, 24, '#766C5E');
  text(data.date.replaceAll('-', '.'), 754, 88, 27);
  line(118);
  text('把今天，穿成喜欢的颜色。', 72, 198, 45, '#302D28', true);
  text(`农历${data.lunar}  ·  ${data.day}日  ·  日支属${data.element}`, 72, 255, 27, '#766C5E');
  text('主推配色 / 大吉色', 72, 329, 27);
  const top = data.groups[0];
  top.hex.forEach((hex, i) => {
    const x = 72 + i * 316;
    c.fillStyle = hex; c.beginPath(); c.roundRect(x, 362, 304, 290, [110, 110, 10, 10]); c.fill();
    text(top.colors[i], x + 20, 700, 33, '#302D28', true);
    text(['主色灵感', '同色系搭配', '配饰点缀'][i], x + 20, 738, 20, '#766C5E');
  });
  line(776);
  data.groups.slice(1).forEach((group, i) => {
    const y = 826 + i * 64;
    text(group.label, 72, y, 26);
    group.hex.forEach((hex, j) => { c.fillStyle = hex; c.beginPath(); c.arc(240 + j * 42, y - 10, 13, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#D0C6B8'; c.stroke(); });
    text(group.colors.join(' / '), 380, y, 27, '#675E52');
  });
  line(1060);
  text('今天这样搭', 72, 1123, 31, '#302D28', true);
  text(`01   ${data.looks[0]}`, 72, 1176, 29);
  text(`02   ${data.looks[1]}`, 72, 1225, 29);
  text('不换整套，也可以用包、鞋或配饰点一点颜色。', 72, 1278, 23, '#766C5E');
  line(1310);
  text('MINGLI · 五行穿衣   /   ming.mimedtech.com', 72, 1353, 23);
  text(`${data.rule} · 民俗配色参考`, 72, 1393, 20, '#766C5E');
  return canvas;
};

export const openDailyOutfit = () => {
  if (document.querySelector('.outfit-dialog')) return;
  const origin = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'outfit-dialog';
  dialog.innerHTML = `<header><strong>五行穿衣 · 每日色卡</strong><button type="button" data-close aria-label="关闭五行穿衣">×</button></header>
    <div class="outfit-date"><button type="button" data-offset="0" aria-pressed="true">今天</button><button type="button" data-offset="1" aria-pressed="false">明天</button></div>
    <p class="outfit-status" role="status">正在准备今日配色…</p><img class="outfit-preview" alt="五行穿衣分享图片" hidden>
    <div class="outfit-actions"><button type="button" data-save disabled>保存图片</button><button type="button" data-share disabled>分享色卡</button></div>
    <p class="outfit-tip">可长按图片保存到相册 · 民俗配色灵感</p>`;
  document.body.append(dialog); dialog.showModal();
  let request = 0, file = null, objectUrl = '', date = '';
  const status = dialog.querySelector('[role="status"]');
  const img = dialog.querySelector('img');
  const buttons = [...dialog.querySelectorAll('.outfit-actions button')];
  const cleanup = () => { request += 1; if (objectUrl) URL.revokeObjectURL(objectUrl); dialog.remove(); origin?.focus(); };
  dialog.addEventListener('close', cleanup, { once: true });
  const load = async (offset) => {
    const current = ++request;
    buttons.forEach((button) => { button.disabled = true; }); img.hidden = true;
    status.textContent = '正在准备配色…';
    dialog.querySelectorAll('[data-offset]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.offset) === offset)));
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const day = new Date(`${today}T12:00:00+08:00`); day.setTime(day.getTime() + offset * 86400000);
    const requestedDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(day);
    try {
      const response = await fetch(`/api/daily-outfit?date=${requestedDate}`);
      if (!response.ok) throw new Error('暂时没能取到配色，请点今天或明天重试。');
      const data = await response.json();
      await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1800))]);
      const canvas = drawOutfitPoster(document.createElement('canvas'), data);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (current !== request || !dialog.isConnected) return;
      if (!blob) throw new Error('图片生成失败，请重试。');
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(blob); date = data.date;
      file = new File([blob], `mingli-colour-${date}.png`, { type: 'image/png' });
      img.src = objectUrl; img.alt = `${date} 五行穿衣：${data.groups[0].colors.join('、')}`; img.hidden = false;
      buttons.forEach((button) => { button.disabled = false; }); status.textContent = `${offset ? '明日' : '今日'}配色 · ${data.day}日`;
    } catch (error) { if (current === request) status.textContent = error.message || '生成失败，请重试。'; }
  };
  dialog.addEventListener('click', async (event) => {
    if (event.target.closest('[data-close]')) { dialog.close(); return; }
    const day = event.target.closest('[data-offset]'); if (day) { load(Number(day.dataset.offset)); return; }
    if (event.target.closest('[data-save]') && file) {
      const anchor = document.createElement('a'); anchor.href = objectUrl; anchor.download = file.name; anchor.click();
      status.textContent = '若未出现下载，请长按上方图片保存。';
    }
    if (event.target.closest('[data-share]') && file) {
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: `${date} 五行穿衣` });
        else status.textContent = '请长按图片保存，再发送给朋友或发布笔记。';
      } catch (error) { if (error.name !== 'AbortError') status.textContent = '可以长按图片保存后分享。'; }
    }
  });
  load(0);
};
