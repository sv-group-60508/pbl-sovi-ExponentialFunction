export const LEVELS = [
  {
    name: 'Sovi Goes Viral',
    tip: "You're Sovi's Growth Officer! Every user invites 0.5 classmates a day (viral coefficient K=0.5). The Y-axis shows users as a multiple of day 0. Tune the base b to predict the growth curve! 🚀",
    fail: "'0.5 invites per user per day' means total users ×1.5 daily — set the base b = 1.5!",
    win: 'b = 1.5: users ×1.5 every day — 11.4× by day 6! That\'s the compound power of viral coefficient K = 0.5.',
    init: { a: 1, b: 1.2, h: 0, k: 0 },
    locked: ['a', 'h', 'k'],
    targets: [{ x: 2, y: 2.25 }, { x: 4, y: 5.06 }, { x: 6, y: 11.39 }],
    obstacles: []
  },
  {
    name: 'Silent Churn Alert',
    tip: 'If Sovi stops operating, half the active users leave every day… Tune b and watch how the curve quietly dies 📉',
    fail: 'Losing half daily = total ×0.5 per day! A base below 1 (but above 0) means decay. Try b = 0.5',
    win: "b = 0.5: users halve every day — that's 'half-life'. Neglected products die exactly like this!",
    init: { a: 1, b: 2, h: 0, k: 0 },
    locked: ['a', 'h', 'k'],
    targets: [{ x: -2, y: 4 }, { x: 0, y: 1 }, { x: 2, y: 0.25 }],
    obstacles: []
  },
  {
    name: 'Subsidy Red Line',
    tip: 'Acquisition costs subsidies! Net daily growth = viral growth − subsidy cost. Adjust k so the curve skims safely above the bankruptcy line 🛡️',
    fail: 'You hit the bankruptcy line! Subsidy cost is 2: set k = −2 so asymptote y = −2 hugs the red line — net growth just safe',
    win: "y = 1.5^t − 2: growth minus cost is the net gain! The asymptote y = k is your 'profit floor'.",
    init: { a: 1, b: 1.5, h: 0, k: 0 },
    locked: ['a', 'b', 'h'],
    targets: [{ x: 0, y: -1 }, { x: 2, y: 0.25 }, { x: 4, y: 3.06 }],
    obstacles: [{ type: 'dangerZone', yMax: -2 }]
  },
  {
    name: 'Review Storm',
    tip: "Crisis! Sovi is getting roasted online and bad reviews are spreading exponentially. Make coefficient a negative to model this 'reverse explosion' 🤸",
    fail: 'The bad-review curve lives below the x-axis — set a = −1 to flip the curve downward!',
    win: 'a < 0 flips the curve: y = −2^t is an exponential outbreak of bad reviews — a Growth Officer must learn to put it out!',
    init: { a: 1, b: 2, h: 0, k: 0 },
    locked: ['b', 'h', 'k'],
    targets: [{ x: 0, y: -1 }, { x: 1, y: -2 }, { x: 2, y: -4 }],
    obstacles: []
  },
  {
    name: 'Launch Day',
    tip: "Sovi starts ads on day 2! h sets 'which day', k sets the 'starting base'. Align the pink anchor to the growth track, then dial in curvature b 🎯",
    fail: "Anchor (h, a+k) is the curve's launch point: set h = 2, k = 2 to move it to (2, 4); b = 2 dodges the asteroids",
    win: "y = 2^(t−2) + 2: h picks the launch day, k picks the base — 'asymptote + anchor' positioning unlocked. Graduated!",
    init: { a: 1, b: 2, h: 0, k: 0 },
    locked: ['a'],
    targets: [{ x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 6 }],
    obstacles: [
      { type: 'asteroid', x: 2, y: 6, r: 0.8 },
      { type: 'asteroid', x: 4, y: 2, r: 0.9 }
    ]
  },
  {
    name: 'Free Growth Lab',
    tip: "All params unlocked! Tap empty canvas to drop 'target user points' and design your own Sovi growth curve 🌌",
    fail: 'Free play! Tap empty space to add targets — can one curve hit them all?',
    win: "All hit! You're now Sovi's Chief Growth Officer 🎖️",
    init: { a: 1, b: 2, h: 0, k: 0 },
    locked: [],
    targets: [{ x: -1, y: 0.5 }, { x: 1, y: 2 }, { x: 2, y: 4 }],
    obstacles: [{ type: 'asteroid', x: 0, y: 4, r: 0.7 }]
  }
];

export const PARAM_META = {
  b: { name: 'base · growth or decay', color: '#1cb0f6', dark: '#1899d6', min: 0.1, max: 5, step: 0.05, nudge: 0.1 },
  a: { name: 'coeff · stretch or flip', color: '#ce82ff', dark: '#b86ae0', min: -4, max: 4, step: 0.1, nudge: 0.5 },
  h: { name: 'shift h (left/right)', color: '#ffc800', dark: '#dea900', min: -6, max: 6, step: 0.25, nudge: 0.5 },
  k: { name: 'shift k (asymptote)', color: '#58cc02', dark: '#46a302', min: -6, max: 6, step: 0.25, nudge: 0.5 }
};

export const PARAM_ORDER = ['b', 'a', 'h', 'k'];
