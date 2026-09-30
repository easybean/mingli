import { createAccessoryViewModel } from '../domain/view-models/accessory-view-model.js';
import { track, trackOutfitVisit, outfitRetentionEnabled, setOutfitRetention } from '../app/analytics.js';

import { buildPersonalOutfit, outfitShareText, OUTFIT_SCENES } from '../domain/outfit-presentation.js';
export { buildPersonalOutfit } from '../domain/outfit-presentation.js';

import { drawOutfitPoster } from "./outfit-poster.js";
export { drawOutfitPoster } from "./outfit-poster.js";

export const openDailyOutfit = (state = {}, initialPersonal = false, onChart = () => {}) => {
  if (document.querySelector('.outfit-dialog')) return;
  track('outfit_open');
  trackOutfitVisit();
  if (initialPersonal) track('outfit_personal');
  const origin = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'outfit-dialog';
  dialog.innerHTML = `<header><strong>五行穿搭</strong><button type="button" data-close aria-label="关闭五行穿衣">×</button></header>
    <div class="outfit-date"><button type="button" data-mode="public">今日色卡</button><button type="button" data-mode="personal">我的搭配</button></div>
    <div class="outfit-date"><button type="button" data-offset="0" aria-pressed="true">今天</button><button type="button" data-offset="1" aria-pressed="false">明天</button></div>
    <p class="outfit-summary"></p><button type="button" data-chart hidden>去生成命盘</button>
    <p class="outfit-status" role="status">正在准备今日配色…</p><img class="outfit-preview" alt="五行穿衣分享图片" hidden>
    <section class="outfit-personal-controls" hidden><p>选个喜欢的色系</p><div class="outfit-palette outfit-date"></div><p>怎么搭更适合你？</p><div class="outfit-scenes outfit-date">${Object.entries(OUTFIT_SCENES).map(([id,label]) => `<button type="button" data-scene="${id}">${label}</button>`).join('')}</div><small>只调整搭配方式，不改变命盘依据。</small></section>
    <button type="button" data-retry hidden>重新试一次</button>
    <div class="outfit-actions"><button type="button" data-save disabled>保存图片</button><button type="button" data-share disabled>分享色卡</button></div>
    <button type="button" data-copy disabled>复制配色文案</button><textarea class="outfit-copy" aria-label="配色分享文案，可长按复制" readonly hidden></textarea>
    <p class="outfit-tip">可长按图片保存到相册 · 民俗配色灵感</p>
    <section class="outfit-basis"><h3>配色依据与说明</h3><p class="outfit-explanation"></p><p class="outfit-source" hidden><a target="_blank" rel="noopener noreferrer">查看原文</a><span></span></p></section>
    <label class="outfit-tip outfit-consent"><input type="checkbox" data-retention>允许匿名统计穿搭回访（可选，关闭不影响使用）</label>
    <p class="outfit-tip">开启后，仅为此浏览器保存一个随机标识，有效期30天，不关联出生资料。服务端统计日志保留90天。关闭后停止发送并清除本机标识，既有日志按期清理。</p>`;
  document.body.append(dialog); dialog.showModal();
  let request = 0, file = null, objectUrl = '', date = '', personal = initialPersonal, offsetValue = 0;
  let selectedElement = '', scene = 'everyday', renderedData = null, controller;
  let model = createAccessoryViewModel(state);
  const dayStem = state.astrolabeData?.bazi?.dayMaster?.stem;
  const monthBranch = state.astrolabeData?.bazi?.pillars?.find(pillar => pillar.label === '月柱')?.zhi;
  const hasBirthKeys = Boolean(dayStem && monthBranch);
  let cachedGuide;
  dialog.querySelector('[data-retention]').checked = outfitRetentionEnabled();
  dialog.addEventListener('change', (event) => {
    if (!event.target.matches('[data-retention]')) return;
    event.target.checked = setOutfitRetention(event.target.checked);
    if (event.target.checked) trackOutfitVisit();
  });
  const explanation = dialog.querySelector('.outfit-explanation');
  const summary = dialog.querySelector('.outfit-summary');
  const controls = dialog.querySelector('.outfit-personal-controls');
  const status = dialog.querySelector('[role="status"]');
  const img = dialog.querySelector('img');
  const buttons = [...dialog.querySelectorAll('.outfit-actions button, [data-copy]')];
  const cleanup = () => { request += 1; controller?.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); dialog.remove(); origin?.focus(); };
  dialog.addEventListener('close', cleanup, { once: true });
  const load = async (offset) => {
    offsetValue = offset;
    const current = ++request;
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const isPersonal = personal;
    const getJson = async url => {
      const activeController = controller;
      const timeout = setTimeout(() => activeController.abort(), 12000);
      try { const response = await fetch(url, { signal }); if (!response.ok) throw new Error('暂时没能取得配色，请重试。'); return await response.json(); }
      finally { clearTimeout(timeout); }
    };
    file = null; renderedData = null;
    dialog.querySelector('[data-retry]').hidden = true;
    dialog.querySelector('.outfit-copy').hidden = true;
    controls.hidden = true;
    buttons.forEach((button) => { button.disabled = true; }); img.hidden = true;
    dialog.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', String((button.dataset.mode === 'personal') === personal)));
    dialog.querySelector('.outfit-source').hidden = true;
    dialog.querySelector('[data-chart]').hidden = !personal || hasBirthKeys;
    explanation.textContent = personal ? '正在获取当前版本的取色依据，不沿用缓存中的旧结论。' : '通用版：同一天大家看到的配色相同，按日支五行法提供民俗灵感。不是穿衣禁忌，也不预测收益。';
    summary.textContent = personal ? '你的长期参考色系，按自己的场景来搭。' : '不用填生日，看看这一天的配色灵感。';
    if (personal && !hasBirthKeys) { summary.textContent = '先生成命盘，再查看个人搭配。'; explanation.textContent = '旧资料缺少日干月支时需要重新生成；不填写也能查看通用色卡。'; status.textContent = '无需填写资料，也可以切回今日色卡。'; return; }
    status.textContent = '正在准备配色…';
    dialog.querySelectorAll('[data-offset]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.offset) === offset)));
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const day = new Date(`${today}T12:00:00+08:00`); day.setTime(day.getTime() + offset * 86400000);
    const requestedDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(day);
    try {
      if (isPersonal) {
        const guide = cachedGuide || await getJson(`/api/outfit-guide?dayStem=${encodeURIComponent(dayStem)}&monthBranch=${encodeURIComponent(monthBranch)}`);
        if (current !== request || !dialog.isConnected) return;
        cachedGuide = guide;
        model = createAccessoryViewModel({ astrolabeData: { reading: { fiveElement: guide } } });
        explanation.textContent = model.ready ? `${model.intro} ${model.principle}` : model.emptyText;
        const source = dialog.querySelector('.outfit-source');
        source.hidden = false;
        source.querySelector('a').href = /^https:\/\/(zh\.wikisource\.org|upload\.wikimedia\.org)\//.test(guide.sourceUrl || '') ? guide.sourceUrl : 'https://zh.wikisource.org/wiki/穷通宝鉴';
        source.querySelector('a').textContent = guide.source;
        source.querySelector('span').textContent = ` · 定位「${guide.locator}」。${guide.verification}。`;
        if (!model.ready) { summary.textContent = model.emptyText; status.textContent = '这一项先不硬下结论，今日通用色卡仍可用。'; return; }
        controls.hidden = false;
        const palette = dialog.querySelector('.outfit-palette'); palette.replaceChildren();
        if (!model.items.some(item => item.element === selectedElement)) selectedElement = model.items[0].element;
        model.items.forEach(item => { const button = document.createElement('button'); button.type = 'button'; button.dataset.element = item.element; button.textContent = `${item.element}色系`; button.title = item.color; button.setAttribute('aria-label', `${item.element}色系：${item.color}`); button.setAttribute('aria-pressed', String(selectedElement === item.element)); palette.append(button); });
        dialog.querySelectorAll('[data-scene]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.scene === scene)));
      }
      const publicData = await getJson(`/api/daily-outfit?date=${requestedDate}`);
      if (current !== request || !dialog.isConnected) return;
      const data = isPersonal ? buildPersonalOutfit(publicData, model.items.map((item) => item.element), selectedElement, scene) : publicData;
      if (!data) throw new Error('暂无个人配色数据，请查看通用版。');
      await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1800))]);
      const canvas = drawOutfitPoster(document.createElement('canvas'), data);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (current !== request || !dialog.isConnected) return;
      if (!blob) throw new Error('图片生成失败，请重试。');
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(blob); date = data.date;
      file = new File([blob], `mingli-${data.personal ? 'personal' : 'colour'}-${date}.png`, { type: 'image/png' });
      renderedData = data;
      img.src = objectUrl; img.alt = `${date} 五行穿衣：${data.groups[0].colors.join('、')}`; img.hidden = false;
      buttons.forEach((button) => { button.disabled = false; });
      status.textContent = data.personal ? (data.overlap ? '今天的通用主推色，也在你的参考色系里。' : '个人参考与今日通用色不同，是两种取色角度，不代表冲突或禁忌。') : `${offset ? '明日' : '今日'}通用配色 · ${data.day}日`;
    } catch (error) { if (current === request && dialog.isConnected) { status.textContent = error.name === 'AbortError' ? '连接超时了，请重试；已有出生资料不会丢失。' : error.message || '生成失败，请重试。'; dialog.querySelector('[data-retry]').hidden = false; } }
  };
  dialog.addEventListener('click', async (event) => {
    if (event.target.closest('[data-close]')) { dialog.close(); return; }
    if (event.target.closest('[data-chart]')) { dialog.close(); onChart(); return; }
    if (event.target.closest('[data-retry]')) { load(offsetValue); return; }
    const element = event.target.closest('[data-element]'); if (element) { selectedElement = element.dataset.element; load(offsetValue); return; }
    const style = event.target.closest('[data-scene]'); if (style) { scene = style.dataset.scene; load(offsetValue); return; }
    if (event.target.closest('[data-copy]') && renderedData) {
      const value = outfitShareText(renderedData);
      try { await navigator.clipboard.writeText(value); status.textContent = '配色文案已复制，可粘贴到聊天或笔记里。'; }
      catch { const box = dialog.querySelector('.outfit-copy'); box.value = value; box.hidden = false; box.focus(); box.select(); status.textContent = '请长按下方文字复制。'; }
      return;
    }
    const mode = event.target.closest('[data-mode]'); if (mode) { personal = mode.dataset.mode === 'personal'; if (personal) track('outfit_personal'); load(offsetValue); return; }
    const day = event.target.closest('[data-offset]'); if (day) { load(Number(day.dataset.offset)); return; }
    if (event.target.closest('[data-save]') && file) {
      track('outfit_save_click');
      const anchor = document.createElement('a'); anchor.href = objectUrl; anchor.download = file.name; anchor.click();
      status.textContent = '若未出现下载，请长按上方图片保存。';
    }
    if (event.target.closest('[data-share]') && file) {
      try {
        if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: `${date} 五行穿衣` }); track('outfit_share_complete'); }
        else status.textContent = '请长按图片保存，再发送给朋友或发布笔记。';
      } catch (error) { if (error.name !== 'AbortError') status.textContent = '可以长按图片保存后分享。'; }
    }
  });
  load(0);
};
