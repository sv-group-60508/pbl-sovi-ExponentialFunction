import { LEVELS } from './levels.js';
import { state, stage, canvas, ctx } from './state.js';
import { fmt, f, m2s, s2m, resizeCanvas, visibleRange } from './math.js';

let flightTick = null;

export function setFlightTick(fn) {
  flightTick = fn;
}

export function initStars() {
  state.stars = [];
  for (let i = 0; i < 70; i++) {
    state.stars.push({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.6 + 0.4,
      a: Math.random() * 0.6 + 0.2,
      v: Math.random() * 0.015 + 0.005
    });
  }
}

export function burst(x, y, color, n = 20) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 4 + 1;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      color,
      a: 1,
      d: Math.random() * 0.03 + 0.02,
      sz: Math.random() * 3.5 + 1.5,
      g: 0
    });
  }
}

export function confetti() {
  const r = stage.getBoundingClientRect();
  const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff', '#ff6b9d'];
  for (let i = 0; i < 90; i++) {
    state.particles.push({
      x: Math.random() * r.width,
      y: -10 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1.5,
      color: colors[i % colors.length],
      a: 1,
      d: 0.004,
      sz: Math.random() * 5 + 3,
      g: 0.05,
      rect: true,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2
    });
  }
}

function drawParticles() {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g || 0;
    p.a -= p.d;
    if (p.rot !== undefined) p.rot += p.vr;
    if (p.a <= 0 || p.y > stage.getBoundingClientRect().height + 30) {
      state.particles.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.color;
    if (p.rect) {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz * 0.6);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawStars(W, H) {
  state.stars.forEach((s) => {
    s.a += s.v;
    if (s.a > 0.85 || s.a < 0.15) s.v = -s.v;
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0.08, s.a)})`;
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDanger(W, H) {
  const L = LEVELS[state.levelIdx];
  L.obstacles.forEach((o) => {
    if (o.type !== 'dangerZone') return;
    const p = m2s(0, o.yMax);
    const h = H - p.y;
    if (h <= 0) return;
    const g = ctx.createLinearGradient(0, p.y, 0, H);
    g.addColorStop(0, 'rgba(255,75,75,.4)');
    g.addColorStop(1, 'rgba(160,20,20,.8)');
    ctx.fillStyle = g;
    ctx.fillRect(0, p.y, W, h);
    ctx.strokeStyle = '#ff4b4b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([9, 7]);
    ctx.beginPath();
    ctx.moveTo(0, p.y);
    ctx.lineTo(W, p.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffb3b3';
    ctx.font = 'bold 11px Nunito,sans-serif';
    ctx.fillText(`⚠️ Danger zone (y < ${o.yMax})`, 10, p.y + 17);
  });
}

function drawGrid(W, H) {
  const { minX, maxX, minY, maxY } = visibleRange(W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
    const sx = m2s(x, 0).x;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, H);
  }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const sy = m2s(0, y).y;
    ctx.moveTo(0, sy);
    ctx.lineTo(W, sy);
  }
  ctx.stroke();
  const o = m2s(0, 0);
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, o.y);
  ctx.lineTo(W, o.y);
  ctx.moveTo(o.x, 0);
  ctx.lineTo(o.x, H);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ctx.font = '10px Courier New,monospace';
  for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
    if (x === 0) continue;
    const p = m2s(x, 0);
    ctx.fillText(x, p.x - 3, Math.min(Math.max(o.y + 13, 12), H - 4));
  }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    if (y === 0) continue;
    const p = m2s(0, y);
    ctx.fillText(y, Math.min(Math.max(o.x + 5, 5), W - 16), p.y + 3);
  }
}

function drawAsymptoteIfNeeded(W) {
  const L = LEVELS[state.levelIdx];
  const k = state.params.k;
  if (L.locked.includes('k') && k === 0) return;
  const p = m2s(0, k);
  ctx.strokeStyle = '#58cc02';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(0, p.y);
  ctx.lineTo(W, p.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#7be42a';
  ctx.font = 'bold 11px Nunito,sans-serif';
  ctx.fillText(`Asymptote y = ${fmt(k)}`, 10, p.y - 7);
}

function drawAsteroids() {
  LEVELS[state.levelIdx].obstacles.forEach((o) => {
    if (o.type !== 'asteroid') return;
    const sp = m2s(o.x, o.y);
    const pr = o.r * state.view.unit;
    const g = ctx.createRadialGradient(sp.x, sp.y, pr * 0.4, sp.x, sp.y, pr * 1.7);
    g.addColorStop(0, 'rgba(255,75,75,.4)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, pr * 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5b6478';
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#454d61';
    ctx.beginPath();
    ctx.arc(sp.x - pr * 0.3, sp.y - pr * 0.25, pr * 0.28, 0, Math.PI * 2);
    ctx.arc(sp.x + pr * 0.35, sp.y + pr * 0.3, pr * 0.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawTargets() {
  const L = LEVELS[state.levelIdx];
  const t = Date.now() * 0.004;
  L.targets.forEach((tg, i) => {
    const sp = m2s(tg.x, tg.y);
    const base = 0.55 * state.view.unit;
    const pulse = Math.sin(t + i * 1.3) * 3;
    if (tg.collected) {
      ctx.fillStyle = 'rgba(88,204,2,.2)';
      ctx.strokeStyle = '#58cc02';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, base * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#58cc02';
      ctx.font = '900 16px Nunito,sans-serif';
      ctx.fillText('✓', sp.x - 6, sp.y + 6);
      return;
    }
    const glow = ctx.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, base * 1.7 + pulse);
    glow.addColorStop(0, 'rgba(28,176,246,.55)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, base * 1.7 + pulse, 0, Math.PI * 2);
    ctx.fill();
    const r = base * 0.9 + pulse * 0.4;
    const grad = ctx.createLinearGradient(sp.x, sp.y - r, sp.x, sp.y + r);
    grad.addColorStop(0, '#8be9ff');
    grad.addColorStop(1, '#1cb0f6');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y - r);
    ctx.lineTo(sp.x + r * 0.75, sp.y);
    ctx.lineTo(sp.x, sp.y + r);
    ctx.lineTo(sp.x - r * 0.75, sp.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath();
    ctx.arc(sp.x - r * 0.18, sp.y - r * 0.3, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 10.5px Courier New,monospace';
    const label = `(${fmt(tg.x)}, ${fmt(tg.y)})`;
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(8,12,38,.7)';
    const W = stage.getBoundingClientRect().width;
    let lx = sp.x + r + 6;
    let ly = sp.y - 14;
    if (ly < 48 && lx + tw > W - 104) {
      lx = sp.x - tw / 2 - 2;
      ly = sp.y + r + 8;
    } else if (lx + tw + 4 > W - 4) {
      lx = sp.x - r * 0.75 - tw - 10;
    }
    ctx.beginPath();
    ctx.roundRect(lx - 4, ly - 9, tw + 8, 15, 7);
    ctx.fill();
    ctx.fillStyle = '#bfe9ff';
    ctx.fillText(label, lx, ly + 2);
  });
}

function drawCurve(W, H) {
  const { minX, maxX } = visibleRange(W, H);
  ctx.save();
  ctx.strokeStyle = '#1cb0f6';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#1cb0f6';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  let started = false;
  const step = Math.max(0.01, (maxX - minX) / (W * 0.9));
  for (let mx = minX - 0.5; mx <= maxX + 0.5; mx += step) {
    const my = f(mx);
    if (isNaN(my) || !isFinite(my)) {
      started = false;
      continue;
    }
    const sp = m2s(mx, my);
    if (sp.y < -800 || sp.y > H + 800) {
      started = false;
      continue;
    }
    if (!started) {
      ctx.moveTo(sp.x, sp.y);
      started = true;
    } else ctx.lineTo(sp.x, sp.y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawAnchor() {
  const p = state.params;
  const sp = m2s(p.h, p.a + p.k);
  ctx.fillStyle = '#ff6b9d';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(sp.x, sp.y, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = 'bold 10.5px Nunito,sans-serif';
  const label = `Anchor (${fmt(p.h)}, ${fmt(p.a + p.k)})`;
  const tw = ctx.measureText(label).width;
  let lx = sp.x + 12;
  if (lx + tw > stage.getBoundingClientRect().width - 8) lx = sp.x - tw - 12;
  ctx.fillStyle = 'rgba(8,12,38,.7)';
  ctx.beginPath();
  ctx.roundRect(lx - 4, sp.y - 9, tw + 8, 15, 7);
  ctx.fill();
  ctx.fillStyle = '#ffb3cd';
  ctx.fillText(label, lx, sp.y + 3);
}

export function draw() {
  const r = stage.getBoundingClientRect();
  const W = r.width;
  const H = r.height;
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) resizeCanvas();
  ctx.clearRect(0, 0, W, H);
  drawStars(W, H);
  drawDanger(W, H);
  drawGrid(W, H);
  drawAsymptoteIfNeeded(W);
  drawAsteroids();
  drawTargets();
  drawCurve(W, H);
  drawAnchor();
  if (state.flying && flightTick) flightTick(W, H);
  drawParticles();
  requestAnimationFrame(draw);
}
