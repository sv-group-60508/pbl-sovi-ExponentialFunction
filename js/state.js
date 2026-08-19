export const state = {
  levelIdx: 0,
  params: { a: 1, b: 2, h: 0, k: 0 },
  view: { cx: 0, cy: 1, unit: 45 },
  flying: false,
  flightX: 0,
  tail: [],
  particles: [],
  stars: [],
  xp: parseInt(localStorage.getItem('warp_xp') || '0', 10),
  hitObstacle: false,
  showingHint: false,
  entered: false
};

export const $ = (id) => document.getElementById(id);

export const stage = $('stage');
export const canvas = $('cv');
export const ctx = canvas.getContext('2d');
