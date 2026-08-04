# Departure-week hardening — 2026-08-04

## Scope

Focused reliability and fact-check pass after the interactive Alpine relief map
landed. The approved information architecture and visual direction are unchanged.

## Fixes

- Empty activity results now clear both in-memory filters and the URL query.
- Search-result counts are announced after typing settles.
- Activity notes persist on input, so leaving immediately cannot lose text.
- Unknown top-level hashes resolve to the canonical Home route.
- An already-waiting service-worker update is offered again on the next load.
- Cache and asset versions advance together to `v34`.

## Departure-week fact check

- Corrected the 2026 Sibra guidance: lake and mountain lines use normal Sibra
  fares; the Semnoz MTB supplement is EUR 6.
- Reconfirmed Navibus frequency and the reduced schedule beginning 29 August.
- Reconfirmed Les Gets Bike Park and World Cup dates.
- Reconfirmed the Morillon Enduro dates; detailed race timing is still marked
  verify-first.
- Replaced the stale La Tournette closure note with the current official
  in-season, condition-dependent guidance and difficulty figures.

Official sources are recorded with `2026-08-04` check dates in `data.js`.

## Verification

- JavaScript syntax and whitespace checks.
- Data relationship, source, date, coordinate, media, and cache-asset checks.
- Mobile route audit at 320 x 568 and 390 x 844; desktop audit at 1440 x 1000.
- All 82 assigned activity images loaded; Casa Elisa remains intentionally
  photo-less.
- Activity filters/search, notes, Ideas boards/status, Today reminders, both map
  modes, malformed routes, and Alpine guide controls exercised in-browser.
- No page overflow, broken visible images, duplicate IDs, unnamed visible
  controls, or browser-console errors found.

Full iOS Simulator testing remains unavailable because `simctl` is not installed;
responsive browser evidence covers the current web-app release.
