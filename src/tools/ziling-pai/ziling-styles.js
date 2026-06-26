// 紫灵牌问事 · 作用域样式（CSS-in-JS，挂载时注入一次）。
// 全部类名以 zl- 前缀、限定在 .zl-overlay 内，跟随 <html data-theme>。
// 整个工具自包含：删 src/tools/ziling-pai/ 即可干净移除，不动 tokens.css。

let injected = false;

export const ensureZilingStyles = () => {
  if (injected) return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'ziling-styles';
  style.textContent = CSS;
  document.head.appendChild(style);
};

const CSS = `
.zl-overlay{
  position:fixed; inset:0; z-index:1000; overflow:hidden;
  display:flex; flex-direction:column;
  font-family:'Noto Sans SC',-apple-system,'PingFang SC',sans-serif;
  color:var(--zl-ink);
  --zl-bg:#0B0913; --zl-ink:#F4ECD7; --zl-ink-muted:#C3BAD0; --zl-muted:#8E84A0;
  --zl-gold:#D6B25E; --zl-gold-bright:#F0DCA0; --zl-gold-line:rgba(214,178,94,0.5);
  --zl-violet:#7A56AC; --zl-red:#C8452F; --zl-positive:#6E9A82;
  --zl-line:rgba(244,236,215,0.12); --zl-surface:rgba(23,17,39,0.72); --zl-surface-2:rgba(34,26,51,0.55);
  --zl-card-surface:rgba(23,17,39,0.82); --zl-card-ink:#F4ECD7; --zl-card-ink-muted:#C3BAD0; --zl-card-muted:#8E84A0;
  --zl-card-line:rgba(244,236,215,0.14); --zl-card-shadow:rgba(0,0,0,0.7); --zl-blur:7px;
  --zl-glowV:rgba(122,86,172,0.20); --zl-glowG:rgba(196,150,72,0.12); --zl-scr-1:#140E22; --zl-scr-2:#08060E;
  background:
    radial-gradient(125% 60% at 80% 0%, var(--zl-glowV), transparent 52%),
    radial-gradient(110% 50% at 12% 8%, var(--zl-glowG), transparent 50%),
    linear-gradient(180deg, var(--zl-scr-1), var(--zl-scr-2));
  -webkit-font-smoothing:antialiased;
  animation:zl-fade .3s ease both;
}
[data-theme="star-day"] .zl-overlay{
  --zl-bg:#F4EFE4; --zl-ink:#2E2842; --zl-ink-muted:#5C5470; --zl-muted:#8B8398;
  --zl-gold:#A8801F; --zl-gold-bright:#C9A646; --zl-gold-line:rgba(168,128,31,0.45);
  --zl-violet:#6B4E96; --zl-red:#C8452F; --zl-positive:#4F7C63;
  --zl-line:rgba(46,40,66,0.10); --zl-surface:rgba(255,255,255,0.78); --zl-surface-2:rgba(255,255,255,0.5);
  --zl-card-surface:rgba(255,255,255,0.85); --zl-card-ink:#2E2842; --zl-card-ink-muted:#5C5470; --zl-card-muted:#8B8398;
  --zl-card-line:rgba(46,40,66,0.12); --zl-card-shadow:rgba(74,60,40,0.4); --zl-blur:5px;
  --zl-glowV:rgba(122,86,172,0.12); --zl-glowG:rgba(196,150,72,0.16); --zl-scr-1:#FBF6EC; --zl-scr-2:#EFE5D3;
}

.zl-ambient{ position:absolute; inset:0; pointer-events:none; z-index:0; animation:zl-breathe 9s ease-in-out infinite; }
.zl-topbar{ position:relative; z-index:30; flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
  padding:max(14px,env(safe-area-inset-top)) 18px 8px; }
.zl-back{ font-size:14px; color:var(--zl-muted); cursor:pointer; letter-spacing:.5px; padding:6px 8px; background:none; border:none; }
.zl-themes{ display:flex; gap:3px; padding:3px; border-radius:11px; background:var(--zl-surface-2); border:1px solid var(--zl-line); }
.zl-theme-tab{ font-size:11px; font-weight:600; color:var(--zl-muted); border:none; background:none; border-radius:8px; padding:4px 11px; cursor:pointer; }
.zl-theme-tab.is-active{ font-weight:700; color:#1A1207; background:linear-gradient(180deg,var(--zl-gold-bright),var(--zl-gold)); }
.zl-close{ font-size:20px; color:var(--zl-muted); cursor:pointer; background:none; border:none; line-height:1; padding:4px 8px; }

.zl-screen{ position:relative; z-index:20; flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch;
  animation:zl-rise .5s cubic-bezier(.2,.7,.3,1) both; }
.zl-pad{ padding:8px 26px 30px; min-height:100%; display:flex; flex-direction:column; }

.zl-kicker{ font-family:'Inter',sans-serif; font-size:10.5px; letter-spacing:5px; color:var(--zl-gold); text-align:center; }
.zl-h{ font-family:'Noto Serif SC',serif; font-weight:600; color:var(--zl-ink); text-align:center; }
.zl-sub{ font-size:12px; color:var(--zl-muted); text-align:center; }

/* ---- cover ---- */
.zl-cover-art{ width:170px; height:170px; position:relative; margin:0 auto 28px; animation:zl-float 7s ease-in-out infinite; }
.zl-cover-ring{ position:absolute; inset:0; animation:zl-spin 90s linear infinite; }
.zl-cover-dipper{ position:absolute; inset:30px; }
.zl-cover-title{ font-family:'Noto Serif SC',serif; font-size:38px; font-weight:700; color:var(--zl-ink); letter-spacing:4px; text-align:center; margin-top:14px; }
.zl-cover-lede{ font-size:13.5px; color:var(--zl-ink-muted); text-align:center; line-height:1.8; max-width:250px; margin:14px auto 0; }
.zl-pill{ display:block; width:max-content; margin:14px auto 0; font-size:11.5px; color:var(--zl-muted); letter-spacing:2px; border:1px solid var(--zl-line); border-radius:20px; padding:5px 16px; }
.zl-disclaimer{ text-align:center; font-size:11px; color:var(--zl-muted); line-height:1.7; border-top:1px solid var(--zl-line); padding-top:16px; margin-top:24px; }

.zl-btn{ border:none; border-radius:15px; background:linear-gradient(180deg,var(--zl-gold-bright),var(--zl-gold)); color:#1A1207;
  font-family:'Noto Sans SC',sans-serif; font-weight:700; letter-spacing:1.5px; cursor:pointer;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 14px 30px -14px var(--zl-card-shadow); }
.zl-btn:disabled{ background:var(--zl-surface-2); color:var(--zl-muted); cursor:default; box-shadow:none; }
.zl-btn-ghost{ background:transparent; border:1px solid var(--zl-gold-line); color:var(--zl-gold); box-shadow:none; }

/* ---- type grid ---- */
.zl-types{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:11px; margin-top:22px; }
.zl-type{ position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
  aspect-ratio:1/1; border-radius:15px; cursor:pointer; background:var(--zl-surface); border:1px solid var(--zl-line);
  backdrop-filter:blur(var(--zl-blur)); transition:all .25s ease; }
.zl-type.is-sel{ background:linear-gradient(180deg,rgba(214,178,94,.22),var(--zl-surface)); border-color:var(--zl-gold-line);
  box-shadow:0 10px 26px -14px var(--zl-card-shadow),inset 0 0 18px rgba(214,178,94,.10); transform:translateY(-2px); }
.zl-type-glyph{ font-family:'Noto Serif SC',serif; font-size:23px; line-height:1; color:var(--zl-gold); margin-bottom:8px; }
.zl-type-name{ font-size:13.5px; font-weight:600; color:var(--zl-ink); }
.zl-type-en{ font-family:'Inter',sans-serif; font-size:9px; letter-spacing:1px; color:var(--zl-muted); margin-top:4px; }
.zl-qinput{ width:100%; box-sizing:border-box; margin-top:18px; border-radius:13px; border:1px solid var(--zl-line);
  background:var(--zl-surface); color:var(--zl-ink); font-family:inherit; font-size:13px; line-height:1.6;
  padding:11px 13px; resize:none; backdrop-filter:blur(var(--zl-blur)); }
.zl-qinput::placeholder{ color:var(--zl-muted); }
.zl-qinput:focus{ outline:none; border-color:var(--zl-gold-line); }

/* ---- shuffle stage ---- */
.zl-stage{ position:relative; width:100%; height:330px; margin-top:14px; display:flex; align-items:center; justify-content:center; }
.zl-pile{ position:relative; width:120px; height:168px; }
.zl-pile-card{ position:absolute; inset:0; border-radius:12px; overflow:hidden;
  background:linear-gradient(165deg,#19132B,#0B0815); border:1px solid rgba(214,178,94,.32);
  box-shadow:0 14px 30px -16px rgba(0,0,0,.8),inset 0 0 22px rgba(122,86,172,.22); }
.zl-pile.is-shuffling .zl-pile-card:nth-child(1){ animation:zl-shuffle-l 1.05s ease-in-out infinite; }
.zl-pile.is-shuffling .zl-pile-card:nth-child(2){ animation:zl-shuffle-m 1.05s ease-in-out infinite; }
.zl-pile.is-shuffling .zl-pile-card:nth-child(3){ animation:zl-shuffle-r 1.05s ease-in-out infinite; }
.zl-deal{ position:relative; width:300px; height:320px; }
.zl-slot{ position:absolute; animation:zl-rise .6s cubic-bezier(.2,.7,.3,1) both; }

/* ---- spread ---- */
.zl-spread{ margin-top:14px; display:flex; flex-direction:column; align-items:center; }
.zl-spread-label{ font-size:10px; letter-spacing:2px; color:var(--zl-gold); margin-bottom:7px; }
.zl-spread-label.muted{ color:var(--zl-muted); }
.zl-aux-row{ display:flex; gap:11px; align-items:flex-start; width:100%; margin-top:6px; }
.zl-aux-row > div{ flex:1; }

/* ---- reading ---- */
.zl-chips{ display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:center; margin-top:11px; }
.zl-chip{ font-size:10.5px; font-weight:600; color:#fff; border-radius:7px; padding:3px 9px; letter-spacing:.5px; opacity:.92; }
.zl-sections{ display:flex; flex-direction:column; gap:13px; margin-top:18px; }
.zl-section{ background:var(--zl-surface); border:1px solid var(--zl-line); border-radius:15px; padding:16px 17px; backdrop-filter:blur(var(--zl-blur)); }
.zl-section-h{ display:flex; align-items:center; gap:9px; margin-bottom:9px; }
.zl-dot{ width:7px; height:7px; border-radius:50%; background:var(--zl-gold); box-shadow:0 0 8px var(--zl-gold); }
.zl-section-h span:last-child{ font-size:14px; font-weight:600; color:var(--zl-ink); letter-spacing:.5px; }
.zl-section-body{ font-size:13px; line-height:1.85; color:var(--zl-ink-muted); }
.zl-foot{ margin-top:20px; background:var(--zl-surface-2); border:1px dashed var(--zl-line); border-radius:13px; padding:14px 16px; text-align:center;
  font-size:11.5px; color:var(--zl-muted); line-height:1.7; }

/* ---- step dots ---- */
.zl-dots{ position:relative; z-index:30; flex-shrink:0; height:34px; display:flex; align-items:center; justify-content:center; gap:7px;
  padding-bottom:env(safe-area-inset-bottom); }
.zl-dots span{ width:6px; height:6px; border-radius:3px; background:var(--zl-line); transition:all .35s ease; }
.zl-dots span.is-active{ width:18px; background:var(--zl-gold); }
.zl-dots span.is-done{ background:var(--zl-gold-line); }

/* ================= CARD ================= */
.zl-card{ position:relative; width:100%; aspect-ratio:5/7; perspective:1100px; }
.zl-card-inner{ position:absolute; inset:0; transform-style:preserve-3d; transition:transform .7s cubic-bezier(.4,.08,.2,1); cursor:pointer; transform:rotateY(0deg); }
.zl-card.is-sealed .zl-card-inner{ transform:rotateY(-180deg); }
.zl-card.is-details .zl-card-inner{ transform:rotateY(180deg); }
.zl-face{ position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; border-radius:14px; overflow:hidden; }
.zl-face-front{ background:var(--zl-card-surface); backdrop-filter:blur(var(--zl-blur)); border:1px solid var(--zl-card-line);
  box-shadow:0 16px 38px -22px var(--zl-card-shadow); display:flex; flex-direction:column; }
.zl-face-back{ transform:rotateY(180deg); }
.zl-card.is-sealed .zl-details{ display:none; }
.zl-card:not(.is-sealed) .zl-back-art{ display:none; }
.zl-lvbar{ height:4px; background:var(--zl-lv); opacity:.92; flex-shrink:0; }
.zl-lvbar.multi{ background:linear-gradient(90deg,#4E927A,#C8452F,#C9A646,#7A56AC); }
.zl-face-head{ position:relative; padding:10px 11px; display:flex; flex-direction:column; align-items:center; flex:1; }
.zl-face-top{ width:100%; display:flex; align-items:center; justify-content:space-between; }
.zl-lvtag{ font-size:9.5px; font-weight:700; letter-spacing:1px; color:var(--zl-lv); background:var(--zl-lv-soft); border:1px solid var(--zl-lv-line); border-radius:7px; padding:2px 8px; }
.zl-lven{ font-family:'Inter',sans-serif; font-size:7.5px; font-weight:600; letter-spacing:1.2px; color:var(--zl-card-muted); }
.zl-illust{ position:relative; margin-top:10px; width:58px; height:58px; border-radius:50%; overflow:hidden;
  border:1px solid var(--zl-lv-line); background:radial-gradient(circle at 50% 38%, var(--zl-lv-soft), transparent 72%); flex-shrink:0; }
.zl-illust-img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.zl-illust-glyph{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.zl-illust-glyph span:first-child{ font-size:18px; color:var(--zl-lv); opacity:.72; line-height:1; }
.zl-illust-glyph span:last-child{ font-family:'Inter',sans-serif; font-size:6.5px; letter-spacing:.5px; color:var(--zl-card-muted); margin-top:3px; }
.zl-cardname{ font-family:'Noto Serif SC',serif; font-weight:700; color:var(--zl-card-ink); margin-top:9px; letter-spacing:1px; line-height:1.05; font-size:clamp(16px,5.5cqw,24px); }
.zl-wx{ font-size:9.5px; color:var(--zl-card-muted); border:1px solid var(--zl-card-line); border-radius:6px; padding:1px 8px; margin-top:6px; }
.zl-cw{ font-size:10.5px; line-height:1.5; color:var(--zl-card-ink-muted); text-align:center; margin-top:8px;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.zl-hint{ margin-top:auto; font-size:8.5px; letter-spacing:.5px; color:var(--zl-card-muted); opacity:.85; padding-top:6px; }

.zl-back-art{ position:absolute; inset:0; background:linear-gradient(165deg,#19132B,#0B0815); border:1px solid rgba(214,178,94,.32);
  border-radius:14px; overflow:hidden; box-shadow:inset 0 0 30px rgba(122,86,172,.20); }
.zl-back-title{ position:absolute; left:0; right:0; bottom:11px; text-align:center; font-family:'Noto Serif SC',serif;
  font-size:11px; letter-spacing:5px; color:#E8C77A; text-shadow:0 0 12px rgba(214,178,94,.5); }

.zl-details{ position:absolute; inset:0; background:var(--zl-card-surface); backdrop-filter:blur(var(--zl-blur));
  border:1px solid var(--zl-lv-line); border-radius:14px; overflow:hidden; box-shadow:0 16px 38px -22px var(--zl-card-shadow);
  display:flex; flex-direction:column; }
.zl-details-head{ padding:8px 11px 7px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--zl-card-line); }
.zl-details-name{ font-family:'Noto Serif SC',serif; font-size:15px; font-weight:700; color:var(--zl-card-ink); letter-spacing:.5px; }
.zl-details-tag{ font-size:9px; font-weight:700; color:var(--zl-lv); background:var(--zl-lv-soft); border-radius:6px; padding:1px 7px; }
.zl-details-body{ flex:1; overflow-y:auto; padding:8px 11px 9px; display:flex; flex-direction:column; gap:6px; }
.zl-drow{ display:flex; gap:8px; align-items:baseline; }
.zl-dk{ flex-shrink:0; width:36px; font-size:9px; font-weight:700; letter-spacing:.5px; line-height:1.4; }
.zl-dv{ flex:1; font-size:9.5px; line-height:1.5; color:var(--zl-card-ink-muted); }
.zl-details-foot{ text-align:center; font-size:8.5px; color:var(--zl-card-muted); padding-bottom:7px; }

/* level palette (set on .zl-card via inline --zl-lv*) */

/* glow on reveal */
.zl-glow{ position:absolute; inset:-8px; border-radius:16px; pointer-events:none; opacity:0;
  background:radial-gradient(circle, rgba(214,178,94,.5), transparent 70%); }
.zl-slot.is-revealed .zl-glow{ animation:zl-halo .9s ease-out; }

@keyframes zl-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes zl-spin{ to{ transform:rotate(360deg);} }
@keyframes zl-breathe{ 0%,100%{ opacity:.55;} 50%{ opacity:.95;} }
@keyframes zl-twinkle{ 0%,100%{ opacity:.25;} 50%{ opacity:1;} }
@keyframes zl-float{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-7px);} }
@keyframes zl-rise{ from{ opacity:0; transform:translateY(14px);} to{ opacity:1; transform:translateY(0);} }
@keyframes zl-halo{ 0%{ opacity:0; transform:scale(.6);} 40%{ opacity:.85;} 100%{ opacity:0; transform:scale(1.7);} }
@keyframes zl-shuffle-l{ 0%,100%{ transform:translateX(-6px) rotate(-7deg);} 25%{ transform:translateX(3px) rotate(2deg);} 50%{ transform:translateX(-2px) rotate(-4deg);} 75%{ transform:translateX(5px) rotate(5deg);} }
@keyframes zl-shuffle-r{ 0%,100%{ transform:translateX(6px) rotate(7deg);} 25%{ transform:translateX(-3px) rotate(-2deg);} 50%{ transform:translateX(2px) rotate(4deg);} 75%{ transform:translateX(-5px) rotate(-5deg);} }
@keyframes zl-shuffle-m{ 0%,100%{ transform:translateY(0) rotate(0deg);} 50%{ transform:translateY(-5px) rotate(1deg);} }

@media (prefers-reduced-motion: reduce){
  .zl-overlay *, .zl-overlay *::before, .zl-overlay *::after{ animation:none !important; transition:none !important; }
}
`;
