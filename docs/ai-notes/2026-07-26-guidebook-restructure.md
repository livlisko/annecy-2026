# 2026-07-26 — Guidebook restructure + activity expansion

## Decisions (owner-approved)
- Nav is now **Today · Activities · Ideas · Trip · Map**. Bike keeps its page (`#/bike`) but enters via the banner on Activities + a Today tile.
- **Build-a-day, Plan hub, Browse, Search, Discover, Events list, Saved, Compare are gone** as screens. Every old hash forwards via `ALIAS`/remaps in `render()` — never break `#/plan/:id` deep links.
- **Activities** (`Views.activities`) is the single browse surface: pin-grid of ALL activities (no day/leg gating — deliberate; the owner's brothers hate over-planning), facet chips (chill/big/book/rain/group), worlds strip as filter buttons, type-to-filter box, stories/history at the bottom.
- **Ideas** = per-person boards (Olivia/Andrew/Christian/Ian) in `localStorage a26.ideas`, **this-phone-only by design** — no backend, and don't add one without explicit approval. One-time migration folds old `a26.saved` into Olivia's board.
- Today shows gentle notes **only** on high-stakes days (arrival, changeover ±1 day, departure). No itinerary features — the owner explicitly rejected scheduling ("not a managed daily itinerary").
- ~28 activities, 14 POIs, 1 event added from a 5-domain research sweep (all operator/tourism-office verified 2026-07-26; medium-confidence ones carry `verifyBeforeGo`).

## Gotchas
- **Bump `?v=N` in index.html AND the `sw.js` VERSION together for ANY asset change** — the SW runtime cache serves stale same-version assets otherwise (bit us mid-review: fixes invisible until v14/a26-v13).
- `styles.css` now has a global `[hidden]{display:none!important}` — the update toast relied on the `hidden` attribute but its own `display:flex` overrode it, so it was permanently visible for weeks. Don't remove that rule.
- The heart-save delegation re-renders when `.status-picker` or `.person-row` is on screen (keeps detail-page status pickers and Ideas boards in sync). Screens that display saved state must have one of those hooks or update themselves.
- Flights: Christian & Ian are a placeholder (`TRANSPORT.flightsNote`) — owner is collecting their details.
- Privacy line agreed: stay addresses, traveler first names, flight numbers = intentionally public; confirmation codes always masked. Open question flagged to owner (not changed): the Leg-2 stay title pairs the host's first name with his address.

## Next phase (parked)
Mobile map polish (clustering/bottom sheet), any visual redesign, weather integration — all explicitly out of scope this round.
