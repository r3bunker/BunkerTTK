# BunkerTTK

An open-source Destiny 2 weapon foundry — a replacement for [d2foundry.gg](https://d2foundry.gg):
browse every weapon in the game, inspect rolls perk-by-perk with live stat recalculation, and
check Crucible time-to-kill against every resilience tier.

Everything runs in your browser. There is no backend: the app talks directly to the Bungie API,
trims the ~80 MB manifest down to a few MB of weapon data, and caches it in IndexedDB (re-downloaded
only when Bungie ships a new manifest version).

## Features

- **Weapon database** — search and filter by name, weapon type, slot, element, ammo, rarity, and
  craftability, across the full live Bungie manifest.
- **Roll inspector** — every perk column (barrels, magazines, traits, origin traits) from the
  weapon's randomized/curated plug sets. Select perks and watch the stat bars update using
  Bungie's real investment-stat → display-stat interpolation curves, including deltas.
- **Masterworks & conditional perks** — apply a tier-10 masterwork to any eligible stat, and
  toggle conditionally-active perk bonuses (Keep Away, Perpetual Motion, …) on and off.
- **TTK calculator** — optimal and body-shot time-to-kill, shots-to-kill, and crit forgiveness
  against all 11 resilience tiers. Damage values aren't exposed by the Bungie API, so they come
  from an editable community table of per-archetype damage numbers.
- **Offline sample data** — the app ships with a bundled demo dataset so it works immediately,
  with no API key and no network.

## Getting started

```bash
npm install
npm run dev
```

The app opens with bundled sample weapons. To load the **live manifest**:

1. Get a free API key at [bungie.net/en/Application](https://www.bungie.net/en/Application)
   (create any application; only the API key is needed — no OAuth).
2. Click **Data source** in the top-right of the app, paste the key, and hit
   **Load live manifest**.

The key is stored only in your browser's localStorage. The manifest download happens once per
game update and is cached in IndexedDB.

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server             |
| `npm run build`   | Type-check and build to `dist/`       |
| `npm run preview` | Serve the production build            |
| `npm test`        | Run the unit tests (stat & TTK math)  |

The build is a fully static site (`dist/`) with relative asset paths, so it deploys anywhere —
GitHub Pages, Netlify, Cloudflare Pages, or a plain file server.

## Accuracy notes

- **Stats** are computed exactly the way the game does it: base investment stats + perk
  investment stats (+10 for a tier-10 masterwork), pushed through the weapon's stat-group
  interpolation table with banker's rounding.
- **Damage/TTK values are approximations.** Bungie does not expose per-shot damage in the API;
  the bundled table covers the common PvP archetypes and every number is editable in the UI.
  Resilience HP values are likewise editable defaults.
- Bundled sample weapons are fictional (real archetypes, real perk behavior) so the app can be
  demoed offline without implying live accuracy.

BunkerTTK is a fan project and is not affiliated with or endorsed by Bungie.
