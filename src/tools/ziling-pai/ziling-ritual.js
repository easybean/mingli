// 手势只影响仪式与牌的位置，不把按压时间/滑动方向当成预测变量。
// 每次换屏销毁事件和 RAF，避免返回、关窗或切后台后继续抽牌。
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const fanPosition = (index, center, width) => {
  const offset = index - center;
  const angle = clamp(offset * 9, -85, 85);
  const radius = Math.min(width, 480) * .65 + 70;
  return { x: Math.sin(angle * Math.PI / 180) * radius,
    y: (1 - Math.cos(angle * Math.PI / 180)) * radius,
    angle, visible: Math.abs(offset) < 6, z: 30 - Math.round(Math.abs(offset) * 2) };
};

export function bindRitual(root, model, actions) {
  const abort = new AbortController();
  const on = (el, type, fn) => el?.addEventListener(type, fn, { signal: abort.signal });
  let frame = 0, alive = true;
  const cancelFrame = () => { cancelAnimationFrame(frame); frame = 0; };
  const hold = root.querySelector('[data-zl-charge]');
  if (hold) {
    let started = 0, holding = false, pointer = null;
    const paint = () => {
      hold.style.setProperty('--charge', model.charge || 0);
      hold.setAttribute('aria-label', `长按注入能量，已完成${Math.round((model.charge || 0) * 100)}%`);
      root.querySelector('[data-zl-charge-status]').textContent = model.charge >= 1
        ? '星光已聚拢' : holding ? `保持按住 · ${Math.round(model.charge * 100)}%` : model.charge ? '松开已暂停，再按住继续' : '按住牌背，让星光慢慢聚拢';
    };
    const stop = () => { holding = false; pointer = null; cancelFrame(); hold.classList.remove('is-holding'); paint(); };
    const tick = now => {
      if (!alive || !holding) return;
      model.charge = clamp((model.charge || 0) + Math.min(now - started, 50) / 1800, 0, 1);
      started = now; paint();
      if (model.charge >= 1) { stop(); actions.charged(); return; }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (holding || model.charge >= 1) return;
      holding = true; started = performance.now(); hold.classList.add('is-holding');
      frame = requestAnimationFrame(tick);
    };
    on(hold, 'pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
      event.preventDefault(); pointer = event.pointerId; hold.setPointerCapture(pointer); start();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) on(hold, type, event => { if (event.pointerId === pointer) stop(); });
    on(hold, 'contextmenu', event => event.preventDefault());
    on(hold, 'keydown', event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); start(); } });
    on(hold, 'keyup', event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); stop(); } });
    on(hold, 'blur', stop);
    on(document, 'visibilitychange', () => { if (document.hidden) stop(); });
    on(window, 'blur', stop);
    paint();
  }

  const mix = root.querySelector('[data-zl-mix]');
  if (mix) {
    const cards = [...mix.querySelectorAll('.zl-mix-card')];
    let pointer = null, lastX = 0, lastY = 0;
    const paint = () => {
      const turn = (model.mixDistance || 0) / 150;
      const radius = Math.min(mix.clientWidth * .26, 105);
      cards.forEach((card, i) => {
        const theta = i * 2.399 + turn * (i % 2 ? 1 : -1);
        const r = radius * (.28 + (i % 5) / 6);
        const x = Math.cos(theta) * r, y = Math.sin(theta) * r * .65;
        card.style.transform = `translate(${x}px,${y}px) rotate(${Math.sin(theta * 1.3) * 55}deg)`;
        card.style.zIndex = 10 + Math.round(Math.sin(theta) * 8);
      });
      const ready = model.mixDistance >= 180;
      root.querySelector('[data-zl-mix-done]').disabled = !ready;
      root.querySelector('[data-zl-mix-status]').textContent = ready ? '牌已洗开。还可以继续洗，准备好就铺牌。' : '手指在牌上来回划动，牌会跟着你洗开';
    };
    const move = distance => { model.mixDistance = (model.mixDistance || 0) + distance; actions.mix(); if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (alive) paint(); }); };
    on(mix, 'pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
      event.preventDefault(); pointer = event.pointerId; lastX = event.clientX; lastY = event.clientY;
      mix.setPointerCapture(pointer); mix.classList.add('is-mixing');
    });
    on(mix, 'pointermove', event => {
      if (event.pointerId !== pointer) return;
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      lastX = event.clientX; lastY = event.clientY;
      if (distance > 0) move(Math.min(distance, 80));
    });
    const stop = () => { pointer = null; mix.classList.remove('is-mixing'); };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) on(mix, type, event => { if (event.pointerId === pointer) stop(); });
    on(window, 'blur', stop);
    on(document, 'visibilitychange', () => { if (document.hidden) stop(); });
    on(root.querySelector('[data-zl-mix-tap]'), 'click', () => move(200));
    paint();
  }

  const fan = root.querySelector('[data-zl-fan]');
  if (fan) {
    const cards = [...fan.querySelectorAll('[data-zl-pick-card]')];
    const range = root.querySelector('[data-zl-fan-range]');
    const counter = root.querySelector('[data-zl-fan-counter]');
    let pointer = null, startX = 0, startY = 0, startCenter = 0, moved = false;
    const max = cards.length - 1;
    model.fanCenter = clamp(model.fanCenter ?? Math.floor(max / 2), 0, max);
    const paint = () => {
      const current = Math.round(model.fanCenter);
      cards.forEach((card, index) => {
        const p = fanPosition(index, model.fanCenter, fan.clientWidth);
        card.style.transform = `translate(${p.x}px,${p.y}px) rotate(${p.angle}deg)`;
        card.style.zIndex = p.z;
        card.style.visibility = p.visible ? 'visible' : 'hidden';
        card.classList.toggle('is-current', index === current);
        card.tabIndex = index === current ? 0 : -1;
        card.setAttribute('aria-pressed', String(index === current));
      });
      range.value = current;
      range.setAttribute('aria-valuetext', `第 ${current + 1} 张，共 ${cards.length} 张`);
      counter.textContent = `第 ${current + 1} / ${cards.length} 张`;
      root.querySelector('[data-zl-fan-prev]').disabled = current === 0;
      root.querySelector('[data-zl-fan-next]').disabled = current === max;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (alive) paint(); }); };
    const setCenter = value => { model.fanCenter = clamp(value, 0, max); paint(); };
    on(fan, 'pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
      pointer = event.pointerId; startX = event.clientX; startY = event.clientY; startCenter = model.fanCenter; moved = false;
      // 不在 down 时 capture，否则手机上的轻点目标会变成容器。
    });
    on(fan, 'pointermove', event => {
      if (event.pointerId !== pointer) return;
      const dx = event.clientX - startX;
      if (!moved && Math.hypot(dx, event.clientY - startY) > 7) {
        moved = true; fan.setPointerCapture(pointer); fan.classList.add('is-dragging');
      }
      if (moved) { model.fanCenter = clamp(startCenter - dx / 33, 0, max); schedule(); }
    });
    const stop = event => {
      if (event.pointerId !== pointer) return;
      pointer = null; fan.classList.remove('is-dragging');
      if (moved || event.type === 'pointercancel') model.suppressPickUntil = performance.now() + 350;
      setCenter(Math.round(model.fanCenter));
    };
    for (const type of ['pointerup', 'pointercancel']) on(fan, type, stop);
    // 触屏从子牌的隐式捕获转为容器捕获时，子牌会冒泡此事件；那不是手指结束。
    on(fan, 'lostpointercapture', event => { if (event.target === fan) stop(event); });
    on(window, 'pointerup', stop);
    const cancelDrag = () => { pointer = null; fan.classList.remove('is-dragging'); setCenter(Math.round(model.fanCenter)); };
    on(window, 'blur', cancelDrag);
    on(document, 'visibilitychange', () => { if (document.hidden) cancelDrag(); });
    on(range, 'input', () => setCenter(Number(range.value)));
    on(root.querySelector('[data-zl-fan-prev]'), 'click', () => setCenter(Math.round(model.fanCenter) - 1));
    on(root.querySelector('[data-zl-fan-next]'), 'click', () => setCenter(Math.round(model.fanCenter) + 1));
    on(fan, 'keydown', event => {
      const value = { ArrowLeft: model.fanCenter - 1, ArrowRight: model.fanCenter + 1, Home: 0, End: max }[event.key];
      if (value == null) return;
      event.preventDefault(); setCenter(value); cards[Math.round(model.fanCenter)].focus({ preventScroll: true });
    });
    on(window, 'resize', schedule);
    paint();
  }
  return () => { alive = false; cancelFrame(); abort.abort(); };
}
