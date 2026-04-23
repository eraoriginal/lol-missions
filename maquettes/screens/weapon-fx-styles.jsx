// Shared keyframe styles for all weapon-fx-existing + weapon-fx-new components.
// Kept separate so CSS is one block — easier to tweak timings and hand off.

function WeaponFxExtraStyles() {
  return (
    <style>{`
      /* ═══════════════════════════════════════════════════
         SABRE
      ═══════════════════════════════════════════════════ */

      /* V1 · CLEAN SLASH */
      @keyframes sb1-ink {
        0%, 15%  { clip-path: polygon(100% 0, 100% 0, 100% 0); }
        35%      { clip-path: polygon(100% 0, 0 0, 100% 100%); }
        85%      { clip-path: polygon(100% 0, 0 0, 100% 100%); }
        100%     { clip-path: polygon(100% 0, 0 0, 100% 100%); opacity: 0; }
      }
      .sb1-ink { animation: sb1-ink 3s cubic-bezier(.2,.8,.3,1) infinite; }
      @keyframes sb1-stroke {
        0%, 10% { stroke-dasharray: 0 300; opacity: 0; }
        15%     { opacity: 1; }
        30%     { stroke-dasharray: 300 0; }
        80%     { stroke-dasharray: 300 0; opacity: 1; }
        100%    { opacity: 0; }
      }
      .sb1-stroke path { stroke-dasharray: 300; stroke-dashoffset: 300; }
      .sb1-stroke { animation: sb1-stroke 3s cubic-bezier(.2,.8,.3,1) infinite; }
      @keyframes sb1-splat {
        0%, 30% { transform: scale(0); opacity: 0; }
        40%     { transform: scale(1.3); opacity: 1; }
        55%     { transform: scale(1); opacity: 1; }
        85%     { opacity: 1; }
        100%    { opacity: 0; }
      }
      .sb1-splat { animation: sb1-splat 3s ease-out infinite; transform-origin: center; transform-box: view-box; }
      @keyframes sb1-tag {
        0%, 35% { opacity: 0; transform: rotate(-42deg) scale(0); }
        45%     { opacity: 1; transform: rotate(-42deg) scale(1.3); }
        55%     { opacity: 1; transform: rotate(-42deg) scale(1); }
        85%     { opacity: 1; }
        100%    { opacity: 0; }
      }
      .sb1-tag { animation: sb1-tag 3s ease-out infinite; }

      /* V2 · PAPER TEAR */
      @keyframes sb2-reveal {
        0%, 15%  { opacity: 0; }
        35%      { opacity: 1; }
        100%     { opacity: 1; }
      }
      .sb2-reveal { animation: sb2-reveal 3s ease-in infinite; }
      @keyframes sb2-flap {
        0%, 10%  { transform: rotate(0deg); transform-origin: 100% 0%; }
        28%      { transform: rotate(0deg) translate(0,0); }
        48%      { transform: rotate(72deg) translate(-20px, -10px); opacity: 0.4; }
        55%, 95% { transform: rotate(72deg) translate(-20px, -10px); opacity: 0; }
        100%     { opacity: 0; }
      }
      .sb2-flap { animation: sb2-flap 3s cubic-bezier(.3,.8,.3,1) infinite; }
      @keyframes sb2-edge {
        0%, 20%  { opacity: 0; stroke-dasharray: 0 300; stroke-dashoffset: 0; }
        35%      { opacity: 1; stroke-dasharray: 300 0; }
        100%     { opacity: 1; }
      }
      .sb2-edge path { stroke-dasharray: 300; stroke-dashoffset: 300; }
      .sb2-edge { animation: sb2-edge 3s ease-out infinite; }
      @keyframes sb2-drop {
        0%, 40%  { height: 0; opacity: 0; }
        55%      { height: 6; opacity: 1; }
        90%      { height: 18; opacity: 1; }
        100%     { opacity: 0; }
      }
      .sb2-drop   { animation: sb2-drop 3s ease-in infinite; }
      .sb2-drop-1 { animation-delay: 0.1s; }
      .sb2-drop-2 { animation-delay: 0.25s; }
      .sb2-drop-3 { animation-delay: 0.4s; }
      .sb2-drop-4 { animation-delay: 0.55s; }

      /* ═══════════════════════════════════════════════════
         GEL
      ═══════════════════════════════════════════════════ */

      @keyframes gl1-tint {
        0%   { opacity: 0; }
        30%  { opacity: 1; }
        100% { opacity: 1; }
      }
      .gl1-tint  { animation: gl1-tint 3s ease-out infinite; }
      .gl1-frost { animation: gl1-tint 3s ease-out infinite; }
      @keyframes gl1-crack {
        0%, 20%  { stroke-dasharray: 0 120; opacity: 0; }
        45%      { stroke-dasharray: 120 0; opacity: 1; }
        100%     { stroke-dasharray: 120 0; opacity: 1; }
      }
      .gl1-crack line { stroke-dasharray: 120; stroke-dashoffset: 120; }
      .gl1-c1 { animation: gl1-crack 3s ease-out infinite; }
      .gl1-c2 { animation: gl1-crack 3s ease-out 0.3s infinite; }
      @keyframes gl1-flake {
        0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
        20%  { opacity: 1; }
        100% { transform: translateY(110px) rotate(180deg); opacity: 0; }
      }
      .gl1-flake { animation: gl1-flake 3s linear infinite; transform-box: view-box; }

      /* GEL V2 */
      @keyframes gl2-frost {
        0%   { stroke-dasharray: 0 50; opacity: 0; }
        30%  { opacity: 1; }
        60%  { stroke-dasharray: 50 0; opacity: 1; }
        100% { stroke-dasharray: 50 0; opacity: 1; }
      }
      .gl2-frost line { stroke-dasharray: 50; stroke-dashoffset: 50; }
      .gl2-top   { animation: gl2-frost 3s ease-out infinite; }
      .gl2-bot   { animation: gl2-frost 3s ease-out 0.2s infinite; }
      .gl2-left  { animation: gl2-frost 3s ease-out 0.1s infinite; }
      .gl2-right { animation: gl2-frost 3s ease-out 0.3s infinite; }
      @keyframes gl2-crystal {
        0%, 50%  { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        65%      { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        75%      { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100%     { opacity: 1; }
      }
      .gl2-crystal { animation: gl2-crystal 3s ease-out infinite; }

      /* ═══════════════════════════════════════════════════
         ZOOM PARASITE
      ═══════════════════════════════════════════════════ */

      @keyframes zp1-roam {
        0%   { transform: translate(-20px, 0); }
        25%  { transform: translate(15px, -10px); }
        50%  { transform: translate(18px, 12px); }
        75%  { transform: translate(-12px, 15px); }
        100% { transform: translate(-20px, 0); }
      }
      @keyframes zp2-roam {
        0%   { transform: translate(-25px, -8px); }
        33%  { transform: translate(20px, 10px); }
        66%  { transform: translate(0, -12px); }
        100% { transform: translate(-25px, -8px); }
      }

      /* ═══════════════════════════════════════════════════
         TORNADE
      ═══════════════════════════════════════════════════ */

      @keyframes tn1-spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .tn1-spin    { animation: tn1-spin 6s linear infinite; transform-origin: center; }
      .tn1-streaks { animation: tn1-spin 3s linear infinite; transform-origin: center; transform-box: view-box; }
      .tn2-img     { animation: tn1-spin 8s linear infinite; transform-origin: center; }
      .tn2-spiral  { animation: tn1-spin 4s linear infinite; transform-origin: center; transform-box: view-box; }

      /* ═══════════════════════════════════════════════════
         PUZZLE BREAK
      ═══════════════════════════════════════════════════ */

      @keyframes pz1-tile {
        0%   { transform: translate(0, 0) rotate(0deg); }
        30%  { transform: translate(0, 0) rotate(0deg); }
        40%  { transform: translate(var(--tx, 0px), var(--ty, 0px)) rotate(var(--tr, 0deg)); }
        80%  { transform: translate(var(--tx, 0px), var(--ty, 0px)) rotate(var(--tr, 0deg)); }
        95%  { transform: translate(0, 0) rotate(0deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      .pz1-tile { animation: pz1-tile 3s cubic-bezier(.3, 1.3, .6, 1) infinite; }
      .pz1-t1 { --tx: -4px;  --ty: 3px;  --tr: -4deg; }
      .pz1-t2 { --tx: 5px;   --ty: -2px; --tr: 3deg; }
      .pz1-t3 { --tx: -3px;  --ty: -4px; --tr: -2deg; }
      .pz1-t4 { --tx: 6px;   --ty: 4px;  --tr: 5deg; }
      .pz1-t5 { --tx: -5px;  --ty: -3px; --tr: -6deg; }
      .pz1-t6 { --tx: 4px;   --ty: 5px;  --tr: 2deg; }
      .pz1-t7 { --tx: -6px;  --ty: 2px;  --tr: -3deg; }
      .pz1-t8 { --tx: 3px;   --ty: -5px; --tr: 4deg; }
      .pz1-t9 { --tx: -2px;  --ty: -2px; --tr: -5deg; }

      @keyframes pz2-flip {
        0%, 20% { transform: rotateY(0deg); }
        40%     { transform: rotateY(180deg); }
        75%     { transform: rotateY(180deg); }
        95%     { transform: rotateY(360deg); }
        100%    { transform: rotateY(360deg); }
      }
      .pz2-tile { animation: pz2-flip 3s cubic-bezier(.3,.7,.4,1) infinite; }

      /* ═══════════════════════════════════════════════════
         SPEED
      ═══════════════════════════════════════════════════ */

      @keyframes sp-scroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .sp1-scroll { animation: sp-scroll 0.6s linear infinite; }
      .sp2-scroll { animation: sp-scroll 0.5s linear infinite; }
      @keyframes sp1-chev {
        0%, 100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
        50%      { opacity: 1;   transform: translateY(-50%) scale(1.1); }
      }
      .sp1-chev { animation: sp1-chev 0.4s ease-in-out infinite; }

      /* ═══════════════════════════════════════════════════
         NEW #1 · TAG
      ═══════════════════════════════════════════════════ */

      @keyframes tg1-slam {
        0%       { opacity: 0; transform: translate(-50%, -50%) rotate(var(--r, 0deg)) scale(2); }
        6%       { opacity: 1; transform: translate(-50%, -50%) rotate(var(--r, 0deg)) scale(1.1); }
        12%      { opacity: 1; transform: translate(-50%, -50%) rotate(var(--r, 0deg)) scale(1); }
        85%      { opacity: 1; }
        100%     { opacity: 0; }
      }
      .tg1-slam { animation: tg1-slam 3s ease-out infinite; opacity: 0; }
      @keyframes tg1-d {
        0%, 55%  { height: 0; opacity: 0; }
        70%      { height: 8; opacity: 1; }
        90%      { height: 20; opacity: 1; }
        100%     { opacity: 0; }
      }
      .tg1-d  { animation: tg1-d 3s ease-in infinite; }
      .tg1-d1 { animation-delay: 0.5s; }
      .tg1-d2 { animation-delay: 0.65s; }
      .tg1-d3 { animation-delay: 0.55s; }
      .tg1-d4 { animation-delay: 0.7s; }
      .tg1-d5 { animation-delay: 0.6s; }

      @keyframes tg2-cloud {
        0%       { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
        15%      { opacity: 0.4; transform: translate(-50%, -50%) scale(0.6); }
        25%      { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
        85%      { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
        100%     { opacity: 0; }
      }
      .tg2-cloud { animation: tg2-cloud 3s ease-out infinite; opacity: 0; }
      @keyframes tg2-stamp {
        0%, 75%  { opacity: 0; transform: translate(-50%, -50%) rotate(-4deg) scale(0.5); }
        82%      { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1.2); }
        88%      { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1); }
        100%     { opacity: 1; }
      }
      .tg2-stamp { animation: tg2-stamp 3s ease-out infinite; }

      /* ═══════════════════════════════════════════════════
         NEW #2 · GLITCH
      ═══════════════════════════════════════════════════ */

      @keyframes glb-band {
        0%, 14%  { transform: translateX(0); }
        15%      { transform: translateX(calc(var(--dir, 1) * 12%)); }
        17%      { transform: translateX(0); }
        32%      { transform: translateX(0); }
        33%      { transform: translateX(calc(var(--dir, 1) * -8%)); }
        36%      { transform: translateX(0); }
        60%      { transform: translateX(0); }
        62%      { transform: translateX(calc(var(--dir, 1) * 15%)); }
        65%      { transform: translateX(0); }
        100%     { transform: translateX(0); }
      }
      .glb-band { animation: glb-band 3s steps(1, end) infinite; }
      @keyframes gl-rgb {
        0%, 100% { transform: translate(0, 0); }
        12%      { transform: translate(3px, 0); }
        32%      { transform: translate(-3px, 1px); }
        60%      { transform: translate(4px, -1px); }
        80%      { transform: translate(-2px, 0); }
      }
      .gl-r { animation: gl-rgb 3s steps(1, end) infinite; }
      .gl-g { animation: gl-rgb 3s steps(1, end) infinite reverse; }
      @keyframes glb-nosignal {
        0%, 20%  { opacity: 0; }
        22%      { opacity: 1; }
        26%      { opacity: 0; }
        30%      { opacity: 1; }
        34%      { opacity: 0; }
        52%      { opacity: 1; }
        56%      { opacity: 0; }
        80%      { opacity: 1; }
        84%, 100%{ opacity: 0; }
      }
      .glb-nosignal { animation: glb-nosignal 3s steps(1, end) infinite; }

      @keyframes gl2-pix {
        0%, 20%  { filter: blur(0); transform: scale(1); }
        25%      { filter: blur(0); transform: scale(1) translate(3px, 0); }
        40%      { filter: blur(0); transform: scale(1) translate(-2px, 1px); }
        55%      { filter: blur(0); transform: scale(1); }
        75%      { filter: blur(0); transform: scale(1) translate(4px, -2px); }
        100%     { transform: scale(1); }
      }
      .gl2-pix { animation: gl2-pix 3s steps(1, end) infinite; }
      @keyframes gl2-b {
        0%, 100% { opacity: 0; }
        5%       { opacity: 1; }
        10%      { opacity: 0; }
      }
      .gl2-b { animation: gl2-b 3s steps(1, end) infinite; }
      @keyframes gl2-err {
        0%, 40%  { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        55%      { opacity: 0; }
        60%      { opacity: 1; }
        63%      { opacity: 0; }
        68%      { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        90%      { opacity: 1; }
        100%     { opacity: 0; }
      }
      .gl2-err { animation: gl2-err 3s steps(1, end) infinite; }

      /* ═══════════════════════════════════════════════════
         NEW #3 · ACIDE
      ═══════════════════════════════════════════════════ */

      @keyframes ac1-hole {
        0%   { transform: scale(0); opacity: 0; }
        15%  { transform: scale(0.3); opacity: 1; }
        50%  { transform: scale(1); opacity: 1; }
        85%  { transform: scale(1); opacity: 1; }
        100% { opacity: 0; }
      }
      .ac1-hole { animation: ac1-hole 3s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
      @keyframes ac1-bubbles {
        0%, 100% { transform: translateY(0); opacity: 0; }
        40%      { transform: translateY(-2px); opacity: 1; }
        60%      { transform: translateY(-4px); opacity: 0.7; }
        80%      { transform: translateY(-6px); opacity: 0; }
      }
      .ac1-bubbles { animation: ac1-bubbles 2s ease-in-out infinite; transform-box: view-box; }

      @keyframes ac2-curtain {
        0%   { transform: translateY(-60%); }
        35%  { transform: translateY(0); }
        85%  { transform: translateY(0); }
        100% { transform: translateY(0); opacity: 0; }
      }
      .ac2-curtain { animation: ac2-curtain 3s cubic-bezier(.3,.7,.3,1) infinite; transform-box: view-box; }
      @keyframes ac2-drop {
        0%, 30%  { height: 0; opacity: 0; }
        45%      { height: 10; opacity: 1; }
        85%      { height: 55; opacity: 1; }
        100%     { opacity: 0; }
      }
      .ac2-drop   { animation: ac2-drop 3s ease-in infinite; }
      .ac2-drop-1 { animation-delay: 0.2s; }
      .ac2-drop-2 { animation-delay: 0.35s; }
      .ac2-drop-3 { animation-delay: 0.25s; }
      .ac2-drop-4 { animation-delay: 0.4s; }
      .ac2-drop-5 { animation-delay: 0.3s; }
      @keyframes ac2-tag {
        0%, 70%  { opacity: 0; transform: translateX(-50%) translateY(10px); }
        82%      { opacity: 1; transform: translateX(-50%) translateY(0); }
        95%      { opacity: 1; }
        100%     { opacity: 0; }
      }
      .ac2-tag { animation: ac2-tag 3s ease-out infinite; }

      /* ═══════════════════════════════════════════════════
         NEW #4 · STROBE
      ═══════════════════════════════════════════════════ */

      @keyframes st1-flash {
        0%   { background: transparent; }
        5%   { background: #FF3D8B; }
        10%  { background: transparent; }
        15%  { background: #12D6A8; }
        20%  { background: transparent; }
        25%  { background: #F5B912; }
        30%  { background: transparent; }
        35%  { background: #8A3DD4; }
        40%  { background: transparent; }
        45%  { background: #FF3D8B; }
        50%  { background: transparent; }
        55%  { background: #12D6A8; }
        60%  { background: transparent; }
        65%  { background: #F5B912; }
        70%  { background: transparent; }
        75%  { background: #5EB8FF; }
        80%  { background: transparent; }
        85%  { background: #FF3D8B; }
        90%  { background: transparent; }
        100% { background: transparent; }
      }
      .st1-flash { animation: st1-flash 3s steps(1, end) infinite; }
      @keyframes st1-pulse {
        0%   { transform: scale(0); opacity: 1; }
        100% { transform: scale(30); opacity: 0; }
      }
      .st1-pulse { animation: st1-pulse 0.4s ease-out infinite; transform-origin: center; }
      @keyframes st1-tag {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50%      { opacity: 0.3; transform: translate(-50%, -50%) scale(1.05); }
      }
      .st1-tag { animation: st1-tag 0.2s steps(2, end) infinite; }

      @keyframes st2-bars {
        0%, 100% { transform: translateX(0); }
        50%      { transform: translateX(6%); }
      }
      .st2-bars  { animation: st2-bars 0.15s steps(2, end) infinite; }
      @keyframes st2-flash {
        0%, 100% { opacity: 0; }
        50%      { opacity: 1; }
      }
      .st2-flash { animation: st2-flash 0.12s steps(2, end) infinite; }
      @keyframes st2-tag {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50%      { transform: translate(-50%, -50%) scale(1.08) rotate(-1deg); }
      }
      .st2-tag { animation: st2-tag 0.25s steps(2, end) infinite; }

      /* ═══════════════════════════════════════════════════
         V3 VARIATIONS
      ═══════════════════════════════════════════════════ */

      /* SABRE V3 · MULTI-SLASH */
      @keyframes sb3-ink-reveal {
        0%, 10% { opacity: 0; transform: scale(0.8); }
        20%     { opacity: 1; transform: scale(1); }
        90%     { opacity: 1; }
        100%    { opacity: 0; }
      }
      .sb3-ink { opacity: 0; transform-origin: center; }
      .sb3-i1 { animation: sb3-ink-reveal 3s ease-out infinite; }
      .sb3-i2 { animation: sb3-ink-reveal 3s ease-out infinite; animation-delay: 0.25s; }
      .sb3-i3 { animation: sb3-ink-reveal 3s ease-out infinite; animation-delay: 0.5s; }
      @keyframes sb3-stroke-draw {
        0%, 5%   { stroke-dashoffset: 200; opacity: 0; }
        8%       { opacity: 1; }
        22%      { stroke-dashoffset: 0; }
        85%      { stroke-dashoffset: 0; opacity: 1; }
        100%     { opacity: 0; }
      }
      .sb3-stroke { stroke-dasharray: 200; stroke-dashoffset: 200; }
      .sb3-s1 { animation: sb3-stroke-draw 3s ease-out infinite; }
      .sb3-s2 { animation: sb3-stroke-draw 3s ease-out infinite; animation-delay: 0.2s; }
      .sb3-s3 { animation: sb3-stroke-draw 3s ease-out infinite; animation-delay: 0.45s; }
      @keyframes sb3-splat { 0%, 65% {opacity:0; transform:scale(0);} 75% {opacity:1; transform:scale(1.2);} 85% {transform:scale(1);} 100% {opacity:0;} }
      .sb3-splat { transform-origin: center; transform-box: view-box; animation: sb3-splat 3s ease-out infinite; }
      @keyframes sb3-badge { 0%, 70% {opacity:0; transform:rotate(-6deg) scale(0);} 80% {opacity:1; transform:rotate(-6deg) scale(1.2);} 88% {transform:rotate(-6deg) scale(1);} 100% {opacity:0;} }
      .sb3-badge { animation: sb3-badge 3s ease-out infinite; }

      /* GEL V3 · SHATTER */
      @keyframes gl3-shard {
        0%, 25%  { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        55%      { transform: translate(var(--tx), var(--ty)) rotate(var(--r)); opacity: 1; }
        90%      { transform: translate(var(--tx), var(--ty)) rotate(var(--r)); opacity: 1; }
        100%     { transform: translate(0, 0) rotate(0deg); opacity: 1; }
      }
      .gl3-shard { animation: gl3-shard 3s cubic-bezier(.4,.1,.2,1) infinite; }
      @keyframes gl3-cracks { 0%, 22% {stroke-dashoffset:120; opacity:0;} 30% {opacity:1;} 50% {stroke-dashoffset:0;} 90% {opacity:1; stroke-dashoffset:0;} 100% {opacity:0;} }
      .gl3-cracks path { stroke-dasharray: 120; stroke-dashoffset: 120; animation: gl3-cracks 3s ease-out infinite; }
      @keyframes gl3-freeze { 0%, 15% {opacity:0;} 25% {opacity:1;} 90% {opacity:1;} 100% {opacity:0;} }
      .gl3-freeze { animation: gl3-freeze 3s ease-out infinite; }
      @keyframes gl3-tag { 0%, 60% {opacity:0; transform: translate(-50%,-50%) rotate(-3deg) scale(0);} 72% {opacity:1; transform: translate(-50%,-50%) rotate(-3deg) scale(1.15);} 82% {transform: translate(-50%,-50%) rotate(-3deg) scale(1);} 100% {opacity:0;} }
      .gl3-tag { animation: gl3-tag 3s ease-out infinite; }

      /* ZOOM PARASITE V3 · SCAN BAR */
      @keyframes zp3-slit-y {
        0%   { y: 8%; }
        50%  { y: 82%; }
        100% { y: 8%; }
      }
      .zp3-slit { animation: zp3-slit-y 4s ease-in-out infinite; }
      @keyframes zp3-frame-y {
        0%   { top: 8%; }
        50%  { top: 82%; }
        100% { top: 8%; }
      }
      .zp3-frame { animation: zp3-frame-y 4s ease-in-out infinite; }

      /* TORNADE V3 · CYCLONE PULL */
      @keyframes tn3-pull {
        0%, 100% { transform: rotate(0deg) scale(1); }
        50%      { transform: rotate(720deg) scale(0.2); }
      }
      .tn3-pull { animation: tn3-pull 3s ease-in infinite; }
      @keyframes tn3-sweep { to { transform: rotate(360deg); } }
      .tn3-sweep { transform-origin: center; animation: tn3-sweep 1.2s linear infinite; }
      .tn3-rings circle { transform-origin: center; animation: tn3-sweep 3s linear infinite; }
      @keyframes tn3-hole { 0%, 100% {transform: translate(-50%,-50%) scale(0.6);} 50% {transform: translate(-50%,-50%) scale(1.4);} }
      .tn3-hole { animation: tn3-hole 3s ease-in-out infinite; }

      /* PUZZLE BREAK V3 · POP-OUT */
      @keyframes pz3-tile {
        0%   { transform: scale(1) rotate(0deg); opacity: 1; }
        40%  { transform: scale(1.08) rotate(3deg); opacity: 1; }
        65%  { transform: scale(0) rotate(-15deg); opacity: 0; }
        88%  { transform: scale(0) rotate(-15deg); opacity: 0; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      .pz3-tile { animation: pz3-tile 3s ease-in-out infinite; transform-origin: center; }

      /* SPEED V3 · HYPERSPACE */
      @keyframes sp3-zoom {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.12); }
      }
      .sp3-zoom { animation: sp3-zoom 1.5s ease-in-out infinite; }
      @keyframes sp3-lines {
        0%   { opacity: 0.4; transform: scale(0.5); }
        50%  { opacity: 1;   transform: scale(1); }
        100% { opacity: 0.4; transform: scale(0.5); }
      }
      .sp3-lines { transform-origin: center; animation: sp3-lines 0.9s ease-in-out infinite; }
      @keyframes sp3-core {
        0%, 100% { opacity: 0.3; transform: translate(-50%,-50%) scale(0.6); }
        50%      { opacity: 1;   transform: translate(-50%,-50%) scale(1.4); }
      }
      .sp3-core { animation: sp3-core 0.9s ease-in-out infinite; }

      /* TAG V3 · STENCIL BARRAGE */
      @keyframes tg3-slam {
        0%, 10%  { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        15%      { opacity: 1; transform: translate(-50%, -50%) scale(0.92); }
        22%      { transform: translate(-50%, -50%) scale(1.04); }
        28%      { transform: translate(-50%, -50%) scale(1); }
        88%      { opacity: 1; }
        100%     { opacity: 0; }
      }
      .tg3-slam { animation: tg3-slam 3s cubic-bezier(.2,1.2,.3,1) infinite; }
      @keyframes tg3-d {
        0%, 45% { height: 0; opacity: 0; }
        55%     { height: 0; opacity: 1; }
        85%     { height: 18px; opacity: 1; }
        100%    { height: 22px; opacity: 0; }
      }
      .tg3-d  { animation: tg3-d 3s ease-in infinite; }
      .tg3-d1 { animation-delay: 0.2s; }
      .tg3-d2 { animation-delay: 0.4s; }
      .tg3-d3 { animation-delay: 0.6s; }
      .tg3-d4 { animation-delay: 0.8s; }

      /* GLITCH V3 · DATAMOSH */
      @keyframes gl3-rgb-r { 0%, 100% {transform: translate(0,0);} 15% {transform: translate(3px,0);} 30% {transform: translate(-2px,1px);} 50% {transform: translate(4px,-1px);} 75% {transform: translate(-3px,0);} }
      .gl3-r { animation: gl3-rgb-r 1.5s steps(8, end) infinite; }
      @keyframes gl3-rgb-g { 0%, 100% {transform: translate(0,0);} 15% {transform: translate(-3px,0);} 30% {transform: translate(2px,-1px);} 50% {transform: translate(-4px,1px);} 75% {transform: translate(3px,0);} }
      .gl3-g { animation: gl3-rgb-g 1.5s steps(8, end) infinite; }
      @keyframes gl3-smear {
        0%, 20%  { transform: translateX(0); filter: blur(1.5px); }
        25%      { transform: translateX(12%); filter: blur(3px); }
        30%      { transform: translateX(-8%); filter: blur(2px); }
        45%      { transform: translateX(0); filter: blur(1.5px); }
        100%     { transform: translateX(0); filter: blur(1.5px); }
      }
      .gl3-smear { animation: gl3-smear 3s steps(12, end) infinite; }
      @keyframes gl3-blocks { 0%, 100% {opacity: 0;} 25%, 45% {opacity: 1;} }
      .gl3-blocks rect { animation: gl3-blocks 3s steps(12, end) infinite; }
      .gl3-blocks rect:nth-child(2) { animation-delay: 0.3s; }
      .gl3-blocks rect:nth-child(3) { animation-delay: 0.6s; }
      .gl3-blocks rect:nth-child(4) { animation-delay: 0.9s; }
      .gl3-blocks rect:nth-child(5) { animation-delay: 1.2s; }

      /* ACIDE V3 · POOL RISE */
      @keyframes ac3-pool {
        0%   { height: 0; }
        50%  { height: 85%; }
        100% { height: 0; }
      }
      .ac3-pool { animation: ac3-pool 3s ease-in-out infinite; }
      @keyframes ac3-surface {
        0%   { bottom: 0; opacity: 0; }
        10%  { opacity: 1; }
        50%  { bottom: 85%; opacity: 1; }
        90%  { opacity: 1; }
        100% { bottom: 0; opacity: 0; }
      }
      .ac3-surface { animation: ac3-surface 3s ease-in-out infinite; }
      @keyframes ac3-b {
        0%   { transform: translateY(0) scale(1); opacity: 0; }
        20%  { opacity: 1; }
        60%  { transform: translateY(-60px) scale(1.2); opacity: 0.8; }
        100% { transform: translateY(-80px) scale(0.6); opacity: 0; }
      }
      .ac3-b { animation: ac3-b 2s ease-out infinite; }

      /* STROBE V3 · GRID FLASH */
      @keyframes st3-cell {
        0%, 40%, 100% { opacity: 0; }
        5%            { opacity: 1; }
        15%           { opacity: 0.4; }
        25%           { opacity: 1; }
      }
      .st3-cell { animation: st3-cell 1s steps(4, end) infinite; }
    `}</style>
  );
}

Object.assign(window, { WeaponFxExtraStyles });
