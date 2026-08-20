import { LEVELS, PARAM_META, PARAM_ORDER } from './levels.js';
import { sound } from './sound.js';
import { state, $ } from './state.js';
import { fmt } from './math.js';

export function setMascot(emoji) {
  const m = $('mascot');
  let b = m.querySelector('.mood-badge');
  if (!emoji || emoji === '🦉') {
    if (b) b.remove();
    return;
  }
  if (!b) {
    b = document.createElement('span');
    b.className = 'mood-badge';
    m.appendChild(b);
  }
  b.textContent = emoji;
  b.style.animation = 'none';
  void b.offsetWidth;
  b.style.animation = '';
}

export function syncAskBtn() {
  const btn = $('askBtn');
  if (!btn) return;
  btn.textContent = state.showingHint ? 'Hide' : 'Hint';
}

export function setBubble(html, mood) {
  const b = $('bubble');
  b.innerHTML = html;
  b.style.animation = 'none';
  void b.offsetWidth;
  b.style.animation = '';
  if (mood) setMascot(mood);
  syncAskBtn();
}

export function toggleHint() {
  sound.click();
  const L = LEVELS[state.levelIdx];
  state.showingHint = !state.showingHint;
  if (state.showingHint) setBubble(`💡 Secret: ${L.fail}`, '🤓');
  else setBubble(`<b>${L.name}</b>: ${L.tip}`, '🦉');
}

export function updateFormula() {
  const p = state.params;
  let s = `f(x) = ${fmt(p.a)}·${fmt(p.b)}`;
  s += p.h === 0 ? '^x' : p.h > 0 ? `^(x−${fmt(p.h)})` : `^(x+${fmt(-p.h)})`;
  if (p.k !== 0) s += p.k > 0 ? ` + ${fmt(p.k)}` : ` − ${fmt(-p.k)}`;
  $('formulaPill').textContent = s;
}

export function updateCollectPill() {
  const L = LEVELS[state.levelIdx];
  const got = L.targets.filter((t) => t.collected).length;
  $('collectPill').textContent = `💎 ${got}/${L.targets.length}`;
}

function paintSlider(sl, color) {
  const pct = ((sl.value - sl.min) / (sl.max - sl.min)) * 100;
  sl.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #EAE4FD ${pct}%, #EAE4FD 100%)`;
}

export function buildParams() {
  const L = LEVELS[state.levelIdx];
  const scroll = $('paramScroll');
  scroll.innerHTML = '';
  const lockedRow = $('lockedRow');
  lockedRow.innerHTML = '';
  PARAM_ORDER.forEach((p) => {
    const meta = PARAM_META[p];
    if (L.locked.includes(p)) {
      const chip = document.createElement('div');
      chip.className = 'lock-chip';
      chip.textContent = `${p} = ${fmt(state.params[p])} 🔒`;
      lockedRow.appendChild(chip);
      return;
    }
    const el = document.createElement('div');
    el.className = 'param';
    el.style.setProperty('--c', meta.color);
    el.style.setProperty('--cd', meta.dark);
    el.style.setProperty('--ct', meta.ink);
    el.style.setProperty('--bc', meta.badge);
    el.innerHTML = `
      <div class="p-top">
        <span class="p-badge">${p}</span>
        <span class="p-name">${meta.name}</span>
        <span class="p-val" id="val-${p}">${fmt(state.params[p])}</span>
      </div>
      <div class="p-row">
        <button class="p-step" data-p="${p}" data-d="-${meta.nudge}">−</button>
        <input type="range" class="slider" id="sl-${p}"
               min="${meta.min}" max="${meta.max}" step="${meta.step}" value="${state.params[p]}">
        <button class="p-step" data-p="${p}" data-d="${meta.nudge}">+</button>
      </div>`;
    scroll.appendChild(el);
    const sl = el.querySelector(`#sl-${p}`);
    paintSlider(sl, meta.color);
    sl.addEventListener('input', () => {
      state.params[p] = parseFloat(sl.value);
      $(`val-${p}`).textContent = fmt(state.params[p]);
      paintSlider(sl, meta.color);
      updateFormula();
    });
    el.querySelectorAll('.p-step').forEach((btn) => {
      const delta = parseFloat(btn.dataset.d);
      const bump = () => {
        const v = Math.min(meta.max, Math.max(meta.min, state.params[p] + delta));
        state.params[p] = Math.round(v * 100) / 100;
        sl.value = state.params[p];
        $(`val-${p}`).textContent = fmt(state.params[p]);
        paintSlider(sl, meta.color);
        updateFormula();
      };
      let timer = null;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        sound.click();
        bump();
        timer = setInterval(bump, 160);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) =>
        btn.addEventListener(ev, () => {
          clearInterval(timer);
        })
      );
    });
  });
}
