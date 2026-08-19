# pbl-sovi-ExponentialFunction

Sovi Growth Lab — a mobile-first PBL micro-game (Expo Flight) that teaches exponential functions through the Sovi growth story.

Serve this directory over HTTP to play (do not open with `file://`; ES Modules require HTTP).

```
python3 -m http.server 8765
```

Then visit http://127.0.0.1:8765/

## Structure

```
index.html                 Page shell
css/app.css                Styles
js/sound.js                Sound effects
js/levels.js               Level & parameter metadata
js/state.js                Global state & DOM refs
js/math.js                 Exponential function & coordinate transforms
js/ui.js                   Bubble, hint button, parameter console
js/render.js               Canvas rendering
js/game.js                 Level flow, launch & bootstrap
assets/brand/              Sovi Logo
wrangler.toml              Cloudflare Pages config
```

Live: https://pbl-sovi-exponentialfunction.pages.dev/
