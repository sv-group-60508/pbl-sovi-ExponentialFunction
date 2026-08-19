import { LEVELS } from './levels.js';
import { state, stage, canvas, ctx } from './state.js';

export function fmt(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

export function f(x, p = state.params) {
  return p.b > 0 ? p.a * Math.pow(p.b, x - p.h) + p.k : NaN;
}

export function df(x, p = state.params) {
  return p.b > 0 ? p.a * Math.pow(p.b, x - p.h) * Math.log(p.b) : 0;
}

export function resizeCanvas() {
  const r = stage.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function m2s(mx, my) {
  const r = stage.getBoundingClientRect();
  return {
    x: r.width / 2 + (mx - state.view.cx) * state.view.unit,
    y: r.height / 2 - (my - state.view.cy) * state.view.unit
  };
}

export function s2m(sx, sy) {
  const r = stage.getBoundingClientRect();
  return {
    x: state.view.cx + (sx - r.width / 2) / state.view.unit,
    y: state.view.cy - (sy - r.height / 2) / state.view.unit
  };
}

export function visibleRange(W, H) {
  const tl = s2m(0, H);
  const br = s2m(W, 0);
  return { minX: tl.x, maxX: br.x, minY: tl.y, maxY: br.y };
}

export function fitView() {
  const L = LEVELS[state.levelIdx];
  const xs = [];
  const ys = [];
  L.targets.forEach((t) => {
    xs.push(t.x);
    ys.push(t.y);
  });
  L.obstacles.forEach((o) => {
    if (o.type === 'asteroid') {
      xs.push(o.x - o.r, o.x + o.r);
      ys.push(o.y - o.r, o.y + o.r);
    }
    if (o.type === 'dangerZone') {
      ys.push(o.yMax);
      xs.push(0);
    }
  });
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  if (maxX - minX < 3) {
    const m = (3 - (maxX - minX)) / 2;
    minX -= m;
    maxX += m;
  }
  if (maxY - minY < 3) {
    const m = (3 - (maxY - minY)) / 2;
    minY -= m;
    maxY += m;
  }
  const pad = 1.4;
  const r = stage.getBoundingClientRect();
  const ux = r.width / (maxX - minX + pad * 2);
  const uy = r.height / (maxY - minY + pad * 2);
  state.view.unit = Math.max(18, Math.min(ux, uy, 90));
  state.view.cx = (minX + maxX) / 2;
  state.view.cy = (minY + maxY) / 2;
}
