# Self-Betterment

A daily-plan PWA covering three tracks: Power BI skill development, home accessibility modifications, and a seated/floor core strength routine. No build step, no backend — static files, installable straight to your phone's home screen.

## What it does

- **Today** — your weekday plan: core strength (with a guided timer for the exercises), a Power BI concept + apply task + the specific book chapter to read alongside it, and a home-mods admin task. Weekends are intentionally open.
- **History** — current streak, best streak, totals per track, last 14 weekdays.
- **Settings** — program start date (anchors the 4-week Power BI reading arc), timer alert preferences, reset.

Everything is stored in your browser's local storage on your phone. Nothing leaves the device — there's no server, no account, no analytics.

## Deploy to GitHub Pages (5 minutes)

1. Create a new **public** GitHub repository (private repos need a paid plan for Pages) — e.g. `self-betterment`.
2. Upload every file in this folder to the repo root, preserving the `icons/` subfolder. Easiest way:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/self-betterment.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main, folder: / (root) → Save.**
4. Wait a minute or two, then GitHub gives you a URL like `https://YOUR-USERNAME.github.io/self-betterment/`.

## Install it on your phone

**iPhone (Safari):** open the URL → tap the Share icon → **Add to Home Screen**.
**Android (Chrome):** open the URL → tap the ⋮ menu → **Install app** (or you'll see an automatic install banner).

It'll then open full-screen like a native app, and works offline after the first load.

## Customizing

All of the actual content — exercises, the Power BI reading arc, home-mods tasks — lives in **`data.js`**. Nothing else needs to change if you want to:
- Swap an exercise, rep count, or hold time
- Extend the Power BI arc past 4 weeks (it currently cycles: week 5 repeats week 1's slot)
- Change the home-mods admin rotation

If you edit `data.js` after deploying, just commit and push — GitHub Pages updates automatically within a minute or two. You may need to close and reopen the installed app (or pull-to-refresh) once, since the service worker caches the app shell for offline use.

## A couple of notes

- The core routine's timer and safety notes reflect what we built together for MS-specific pacing (heat, fatigue, spasticity). If you haven't already, a couple of sessions with a PT familiar with MS is worth it — mainly to catch compensation patterns (arms/shoulders doing the work instead of the core) that are hard to self-spot.
- The reading arc assumes you're following the chapters roughly in the order listed. If you're further into a book already, just skip ahead mentally — the app doesn't gate anything on it.
