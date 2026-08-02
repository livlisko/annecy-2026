# iPhone Layout Pass

Date: 2026-08-02

## Product Decision

The iPhone version remains the same responsive PWA, data source, routes, and
local Ideas storage as the desktop guide. It is not a separate native app and
does not introduce scheduling.

## Implementation

- Added route-aware mobile surfaces while preserving the five-tab navigation.
- Reframed Activities around a compact regional header, horizontal category
  rail, collapsible filters, and image-first cards.
- Reworked Ideas into a two-column visual board with four person tabs and quiet
  status labels.
- Tightened Trip into a scan-friendly reference view with stays and key actions
  visible early.
- Added place-marker clustering and kept direct links able to reveal a selected
  marker and popup.
- Added safe-area spacing and route-consistent twilight styling without changing
  the desktop information architecture.

## Verification

- Reviewed Home, Activities, Ideas, Trip, both Map views, Today, Cycling, and an
  activity detail at 320 x 568, 390 x 844, and 430 x 932.
- Confirmed no page-level horizontal overflow, no visible broken images, no
  unnamed visible controls, and no browser warnings or errors.
- Exercised the mobile filter drawer, person-board switcher, map category filter,
  clustered map, and direct place focus.
- Loaded all 83 activity cards: 82 specific images succeeded and Casa Elisa
  remained intentionally photo-free.
- Native iOS Simulator testing could not run because full Xcode and `simctl` are
  not installed on this Mac.
