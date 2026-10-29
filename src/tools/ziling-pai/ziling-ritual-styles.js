// 轻量 transform / opacity 动画，无视频或大型动画库。
export const RITUAL_CSS = `
.zl-draw-pad{box-sizing:border-box;max-width:600px;margin:auto;width:100%;}
.zl-draw-pad .zl-h{line-height:1.45;}
.zl-draw-pad .zl-sub{line-height:1.7;}
.zl-ritual-stage{position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;width:100%;height:330px;margin:12px 0 0;isolation:isolate;}
.zl-orbit{position:absolute;width:270px;height:270px;border:1px solid var(--zl-gold-line);border-radius:50%;opacity:.35;pointer-events:none;}
.zl-orbit:before,.zl-orbit:after{content:'';position:absolute;inset:17px;border:1px solid var(--zl-gold-line);border-radius:50%;transform:rotateX(55deg) rotate(-30deg);}
.zl-orbit:after{transform:rotateY(55deg) rotate(35deg);}
.zl-ritual-caption{font-size:13px;color:var(--zl-ink-muted);text-align:center;line-height:1.7;margin:12px 0;min-height:22px;}
.zl-ritual-footnote{font-size:11px;color:var(--zl-muted);text-align:center;max-width:290px;line-height:1.7;margin:8px 0;}
.zl-ritual-primary{width:min(100%,300px);min-height:48px;padding:12px 16px;font-size:14px;}
.zl-charge-card{width:180px;height:252px;position:relative;padding:0;border:0;border-radius:14px;background:none;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:pointer;color:#F0DCA0;transform:scale(calc(1 + var(--charge)*.035));box-shadow:0 0 calc(10px + var(--charge)*55px) rgba(214,178,94,.22);}
.zl-charge-card>.zl-mini-back{border-radius:14px;}
.zl-energy-core{position:absolute;pointer-events:none;inset:20%;border-radius:50%;background:radial-gradient(ellipse,#fff6c7 0%,rgba(230,185,89,.7) 10%,rgba(171,116,213,.32) 35%,transparent 70%);opacity:calc(.12 + var(--charge)*.85);transform:scale(calc(.5 + var(--charge)*1.5));}
.zl-charge-ring{position:absolute;inset:-12px;width:calc(100% + 24px);height:calc(100% + 24px);overflow:visible;pointer-events:none;}
.zl-charge-ring rect{fill:none;stroke:#F0DCA0;stroke-width:1.7;stroke-dasharray:100;stroke-dashoffset:calc(100 - var(--charge)*100);filter:drop-shadow(0 0 4px #D6B25E);}
.zl-charge-label{position:absolute;bottom:21px;left:0;right:0;font-size:13px;letter-spacing:2px;text-shadow:0 2px 8px #000;}
.zl-charge-card.is-holding:after{content:'';position:absolute;inset:12%;border-radius:50%;border:1px solid #F0DCA0;box-shadow:0 0 12px rgba(240,220,160,.5);animation:zl-energy-pulse 1s ease-out infinite;pointer-events:none;}
.zl-charge-stage.is-charged .zl-charge-card{animation:zl-energy-release .65s ease-out both;}
.zl-mix-stage{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab;height:300px;overflow:hidden;}
.zl-mix-stage.is-mixing{cursor:grabbing;}
.zl-mix-card{position:absolute;width:83px;height:116px;pointer-events:none;transition:transform .15s linear;}
.zl-mix-card .zl-mini-back{box-shadow:0 5px 12px rgba(0,0,0,.45);}
.zl-mix-gesture{position:absolute;bottom:12px;font-size:12px;color:var(--zl-gold);letter-spacing:3px;pointer-events:none;}
.zl-ritual-rail{list-style:none;margin:20px 0 0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;width:100%;max-width:420px;}
.zl-ritual-rail li{display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;min-height:62px;border:1px solid var(--zl-line);border-radius:10px;background:var(--zl-surface);color:var(--zl-muted);}
.zl-ritual-rail span{font-size:10px;letter-spacing:1px;}
.zl-ritual-rail strong{font-size:12px;font-weight:500;}
.zl-ritual-rail .is-current{border-color:var(--zl-gold-line);box-shadow:inset 0 0 15px rgba(214,178,94,.07);}
.zl-ritual-rail .is-current span,.zl-ritual-rail .is-filled strong{color:var(--zl-gold);}
.zl-fan{position:relative;width:calc(100% + 52px);height:265px;flex-shrink:0;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab;isolation:isolate;}
.zl-fan.is-dragging{cursor:grabbing;}
.zl-fan-guide{position:absolute;left:50%;top:65px;width:500px;height:500px;border:1px solid var(--zl-gold-line);border-radius:50%;transform:translateX(-50%);opacity:.18;pointer-events:none;}
.zl-fan-card{position:absolute;left:calc(50% - 49px);top:46px;width:98px;height:137px;border:0;padding:0;border-radius:10px;background:none;cursor:pointer;transition:transform .22s cubic-bezier(.22,.75,.25,1);touch-action:none;}
.zl-fan-card .zl-mini-back{pointer-events:none;transition:transform .22s ease,box-shadow .22s ease;}
.zl-fan-card.is-current .zl-mini-back{transform:translateY(-9px);border-color:#F0DCA0;box-shadow:0 0 22px rgba(214,178,94,.18),0 12px 22px rgba(0,0,0,.4);}
.zl-fan.is-dragging .zl-fan-card{transition:none;}
.zl-fan-card:focus-visible{outline:2px solid var(--zl-gold);outline-offset:4px;}
.zl-fan-nav{display:flex;align-items:center;justify-content:center;gap:24px;margin-top:-26px;z-index:2;}
.zl-fan-nav button{width:44px;height:44px;border:1px solid var(--zl-line);border-radius:50%;background:var(--zl-surface);color:var(--zl-gold);font-size:26px;cursor:pointer;}
.zl-fan-nav button:disabled{opacity:.3;cursor:default;}
.zl-fan-nav span{font-size:12px;color:var(--zl-ink-muted);min-width:86px;text-align:center;font-variant-numeric:tabular-nums;}
.zl-fan-range{display:block;width:min(100%,230px);height:28px;accent-color:var(--zl-gold);margin:4px 0 0;cursor:ew-resize;}
.zl-ritual-picked{margin-top:22px;}
.zl-selection-card{position:relative;width:190px;height:280px;perspective:1100px;flex-shrink:0;}
.zl-selection-flipper{position:absolute;inset:0;transform-style:preserve-3d;}
.zl-selection-back,.zl-selection-front{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:14px;}
.zl-selection-front{transform:rotateY(180deg);}
.zl-selection-back .zl-mini-back{border-radius:14px;box-shadow:0 0 35px rgba(214,178,94,.16);}
.zl-selection-front .zl-card{height:100%;aspect-ratio:auto;}
.zl-selection-front .zl-face-front{background:var(--zl-bg);backdrop-filter:none;}
.zl-selection-front .zl-face-back{display:none;}
.zl-selection-front .zl-card-inner{cursor:default;}
.zl-selection-front .zl-illust{width:78px;height:78px;margin-top:16px;}
.zl-selection-front .zl-cardname{font-size:29px;margin-top:13px;}
.zl-selection-front .zl-wx{font-size:12px;}
.zl-selection-front .zl-cw{font-size:12px;-webkit-line-clamp:3;margin-top:10px;}
.zl-selection-front .zl-hint{display:none;}
.zl-phase-selected .zl-selection-card{animation:zl-card-lift .55s cubic-bezier(.2,.75,.25,1) both;}
.zl-phase-flipping .zl-selection-flipper{animation:zl-card-flip .8s cubic-bezier(.35,.05,.2,1) both;}
.zl-phase-reveal .zl-selection-flipper,.zl-phase-landing .zl-selection-flipper{transform:rotateY(180deg);}
.zl-phase-landing .zl-selection-card{animation:zl-card-land .6s cubic-bezier(.4,0,.25,1) both;}
.zl-reveal-actions{display:flex;flex-direction:column;align-items:center;width:100%;min-height:115px;}
.zl-reveal-actions>.zl-btn{width:min(100%,330px);min-height:50px;padding:12px;font-size:13px;margin-top:8px;line-height:1.6;}
.zl-selection-front .zl-mini-back{display:none;}
[data-theme="star-day"] .zl-ritual-caption{color:var(--zl-ink-muted);}
@keyframes zl-card-lift{from{transform:translate(var(--lift-x,0px),var(--lift-y,100px)) scale(var(--lift-scale,.55));}to{transform:translate(0,0) scale(1);}}
@keyframes zl-card-flip{0%{transform:rotateY(0);}100%{transform:rotateY(180deg);}}
@keyframes zl-card-land{to{transform:translate(var(--land-x,0px),var(--land-y,-180px)) scale(.18);opacity:0;}}
@keyframes zl-energy-pulse{from{transform:scale(.45);opacity:.9;}to{transform:scale(1.8);opacity:0;}}
@keyframes zl-energy-release{50%{filter:brightness(1.5);transform:scale(1.06);}100%{opacity:0;transform:scale(.93);}}
@media(max-height:680px){.zl-ritual-stage{height:275px;margin-top:6px;}.zl-charge-card{width:155px;height:217px;}.zl-ritual-rail{margin-top:12px;}.zl-ritual-rail li{min-height:52px;gap:5px;}.zl-fan{height:225px;}.zl-fan-card{top:30px;}.zl-fan-nav{margin-top:-16px;}.zl-ritual-picked{margin-top:14px;}.zl-selection-card{width:170px;height:250px;}.zl-selection-front .zl-illust{width:60px;height:60px;margin-top:10px;}.zl-ritual-caption{margin:8px 0;}}
@media(max-width:350px){.zl-draw-pad{padding-left:18px;padding-right:18px;}.zl-fan{width:calc(100% + 36px);}.zl-ritual-rail{gap:4px;}.zl-ritual-rail span{letter-spacing:0;}.zl-selection-front .zl-cw{font-size:11px;}}
@media(prefers-reduced-motion:reduce){.zl-phase-flipping .zl-selection-flipper{transform:rotateY(180deg);}.zl-phase-landing .zl-selection-card{opacity:0;}.zl-charge-card{transform:none;}.zl-energy-core{transform:none;}.zl-orbit{display:none;}}
`;
