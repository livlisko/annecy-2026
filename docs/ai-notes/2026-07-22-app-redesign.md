# 2026-07-22 — PWA redesign, real trip integration, history

- **Date:** 2026-07-22
- **Tool:** Claude Code

## Summary

Rebuilt the site as a mobile-first PWA trip companion on branch `annecy-app-redesign` (3 commits): app shell with hash routing + bottom nav, single data layer (`data.js`) feeding all screens, onboarding Home flow (bearings → nearby worlds → discoveries → day chooser), photo-led Discover with category pages, Build-a-day chooser, interactive Leaflet map, PWA basics (manifest, service worker, generated icons).

Then centered it on the finalized trip: Les Gets Aug 12–15 → Veyrier-du-Lac Aug 15–29 (`#/trip` screen with legs, three stays incl. addresses, changeover note; home base flipped from Sévrier to Veyrier). Added Resistance history (Glières section on Discover + pilgrimage plan + Morette museum map spot).

## Decisions

- Stack stays plain HTML/CSS/JS, no build tools; Leaflet via CDN.
- Full stay addresses shown in the app (owner's explicit choice, public repo).
- Photos: user's own ride shots where authentic; otherwise Wikimedia Commons only (CC0/CC BY/CC BY-SA, license-verified), resized into `assets/wiki/`, credited in a Discover panel. No invented imagery.
- Unverified facts (hours, prices, routes, lift dates) are flagged inline as `[CHECK: …]`, never guessed.
- Stay/Morette coordinates geocoded via Nominatim (house-number exact).
- Service worker cache version bumps on every content change (`a26-vN`).

## Next actions

- Resolve the in-app `[CHECK]` flags: Les Gets bike-park dates/pass/rentals, summer lifts, Morette museum hours, lifeguard dates, lake-boat timetable, Fête du Lac date.
- Merge PR from `annecy-app-redesign` into `main` to deploy via GitHub Pages (owner reviews first).
- Consider replacing remaining GoPro-overlay ride photos used on a few area cards.
