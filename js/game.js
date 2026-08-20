import { LEVELS } from './levels.js';
import { sound, vibrate } from './sound.js';
import { state, $, stage, canvas, ctx } from './state.js';
import { f, df, m2s, s2m, resizeCanvas, fitView } from './math.js';
import {
  setMascot,
  setBubble,
  toggleHint,
  updateFormula,
  updateCollectPill,
  buildParams
} from './ui.js';
import { burst, confetti, draw, initStars, setFlightTick } from './render.js';

function updateFlight(W, H) {
  state.flightX += 0.11;
  const mx = state.flightX;
  const my = f(mx);
  const sp = m2s(mx, my);
  const L = LEVELS[state.levelIdx];
  state.tail.push({ x: sp.x, y: sp.y, a: 1 });
  if (state.tail.length > 22) state.tail.shift();
  for (let i = 0; i < state.tail.length - 1; i++) {
    const p1 = state.tail[i];
    const p2 = state.tail[i + 1];
    p1.a -= 0.04;
    ctx.strokeStyle = `rgba(49,214,231,${Math.max(0, p1.a)})`;
    ctx.lineWidth = (i / state.tail.length) * 6 + 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  ctx.save();
  const ang = Math.atan2(-df(mx) * state.view.unit, state.view.unit);
  ctx.translate(sp.x, sp.y);
  ctx.rotate(ang);
  ctx.shadowColor = 'rgba(141,97,239,.5)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#8D61EF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-9, -8);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-9, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFB283';
  ctx.beginPath();
  ctx.moveTo(-6, -3.5);
  ctx.lineTo(-15 - Math.random() * 7, 0);
  ctx.lineTo(-6, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  L.targets.forEach((tg) => {
    if (!tg.collected && Math.hypot(mx - tg.x, my - tg.y) < 0.66) {
      tg.collected = true;
      sound.collect();
      vibrate(20);
      burst(sp.x, sp.y, '#31D6E7', 22);
      updateCollectPill();
    }
  });
  let hit = false;
  L.obstacles.forEach((o) => {
    if (o.type === 'asteroid' && Math.hypot(mx - o.x, my - o.y) < o.r) hit = true;
    if (o.type === 'dangerZone' && my <= o.yMax) hit = true;
  });
  if (hit) {
    state.flying = false;
    state.hitObstacle = true;
    sound.hit();
    vibrate(90);
    burst(sp.x, sp.y, '#FF6B6B', 32);
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
    endFlight();
    return;
  }
  if (!state.entered && sp.y > -60 && sp.y < H + 60) state.entered = true;
  const maxX = s2m(W + 60, 0).x;
  if (mx > maxX || (state.entered && (sp.y < -120 || sp.y > H + 120))) {
    state.flying = false;
    endFlight();
  }
}

function loadLevel(idx) {
  state.levelIdx = idx;
  const L = LEVELS[idx];
  state.params = { ...L.init };
  L.targets.forEach((t) => {
    t.collected = false;
  });
  state.flying = false;
  state.tail = [];
  state.hitObstacle = false;
  state.showingHint = false;
  setMascot();
  $('lvlPill').textContent = `Lesson ${idx + 1}/${LEVELS.length}`;
  $('progFill').style.width = `${(idx / LEVELS.length) * 100}%`;
  $('winOverlay').classList.remove('show');
  document.getElementById('app').classList.remove('flying');
  $('fireBtn').disabled = false;
  $('fireBtn').innerHTML = '🚀 LAUNCH';
  setBubble(`<b>${L.name}</b>: ${L.tip}`);
  fitView();
  buildParams();
  updateFormula();
  updateCollectPill();
}

function endFlight() {
  document.getElementById('app').classList.remove('flying');
  $('fireBtn').disabled = false;
  $('fireBtn').innerHTML = '🚀 RELAUNCH';
  const L = LEVELS[state.levelIdx];
  const missed = L.targets.filter((t) => !t.collected).length;
  if (missed === 0 && L.targets.length > 0) {
    sound.win();
    confetti();
    vibrate([40, 60, 40]);
    setMascot('🥳');
    state.xp += 20;
    localStorage.setItem('warp_xp', state.xp);
    $('xpVal').textContent = state.xp;
    $('winHint').textContent = L.win;
    $('progFill').style.width = `${((state.levelIdx + 1) / LEVELS.length) * 100}%`;
    $('nextBtn').textContent = state.levelIdx < LEVELS.length - 1 ? 'Continue →' : 'Play again ↺';
    setTimeout(() => $('winOverlay').classList.add('show'), 450);
  } else {
    setMascot(state.hitObstacle ? '😵' : '🥺');
    const got = L.targets.length - missed;
    let msg;
    if (state.hitObstacle) msg = L.fail;
    else if (got > 0) msg = `Collected ${got}, just ${missed} to go! ${L.fail}`;
    else msg = L.fail;
    setBubble(msg);
    L.targets.forEach((t) => {
      t.collected = false;
    });
    updateCollectPill();
  }
  state.hitObstacle = false;
}

function bindEvents() {
  $('fireBtn').addEventListener('click', () => {
    if (state.flying) return;
    sound.launch();
    vibrate(15);
    state.flightX = s2m(-40, 0).x;
    state.tail = [];
    state.flying = true;
    state.entered = false;
    document.getElementById('app').classList.add('flying');
    $('fireBtn').disabled = true;
    $('fireBtn').innerHTML = '✨ Flying…';
  });
  $('nextBtn').addEventListener('click', () => {
    sound.click();
    const next = state.levelIdx < LEVELS.length - 1 ? state.levelIdx + 1 : 0;
    loadLevel(next);
  });
  $('resetBtn').addEventListener('click', () => {
    sound.click();
    const L = LEVELS[state.levelIdx];
    state.params = { ...L.init };
    buildParams();
    updateFormula();
    setBubble(`Params reset! ${L.tip}`, '🦉');
  });
  $('soundBtn').addEventListener('click', () => {
    const on = sound.toggle();
    $('soundBtn').textContent = on ? '🔊' : '🔇';
    if (on) sound.click();
  });
  $('askBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHint();
  });
  $('bubble').addEventListener('click', toggleHint);
  canvas.addEventListener('click', (e) => {
    if (state.levelIdx !== LEVELS.length - 1 || state.flying) return;
    const rect = canvas.getBoundingClientRect();
    const m = s2m(e.clientX - rect.left, e.clientY - rect.top);
    LEVELS[state.levelIdx].targets.push({
      x: Math.round(m.x * 2) / 2,
      y: Math.round(m.y * 2) / 2,
      collected: false
    });
    sound.collect();
    updateCollectPill();
    setBubble('New gem dropped! Try stringing them all together with one curve 💎', '🤩');
  });
  new ResizeObserver(() => {
    resizeCanvas();
    fitView();
  }).observe(stage);
}

function boot() {
  setFlightTick(updateFlight);
  window.addEventListener('pointerdown', () => sound.init(), { once: true });
  $('xpVal').textContent = state.xp;
  bindEvents();
  resizeCanvas();
  initStars();
  fitView();
  loadLevel(0);
  draw();
}

boot();
