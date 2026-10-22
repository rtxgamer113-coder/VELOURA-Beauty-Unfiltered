# VELOURA-Beauty-Unfiltered
Sample Project
# VELOURA Cosmetics Homepage

A responsive, original cosmetics storefront concept using HTML, CSS, vanilla JavaScript, and Three.js.

## Run locally
Three.js uses ES modules, so serve the folder over HTTP rather than opening `index.html` directly.

Option A — Node:
```bash
npx serve .
```

Option B — Python:
```bash
python -m http.server 8000
```
Then open the local URL printed by the server (or `http://localhost:8000` for Python).

## Files
- `index.html` — page structure and content
- `style.css` — responsive visual system and animations
- `script.js` — interactions and the Three.js lipstick scene

## Notes
- The 3D lipstick is built from Three.js geometry, so no external 3D model is required.
- Photography is loaded from Unsplash and Google Fonts from Google Fonts; an internet connection is needed for those assets.
- Cart, wishlist, search, and newsletter interactions are front-end demos. Connect them to a real backend/payment provider before production.
