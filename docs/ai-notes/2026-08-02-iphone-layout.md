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
- The Places map intentionally starts with no categories selected to avoid an
  overwhelming first view. `All` or an individual category populates it, while
  a direct place link automatically selects that place's category.
- Added safe-area spacing and route-consistent twilight styling without changing
  the desktop information architecture.
- Corrected Today to show the active stay's dates and to send `Must book` to the
  required-booking activity filter.

## Verification

- Reviewed Home, Activities, Ideas, Trip, both Map views, Today, Cycling, and an
  activity detail at 320 x 568, 390 x 844, and 430 x 932.
- Confirmed no page-level horizontal overflow, no visible broken images, no
  unnamed visible controls, and no browser warnings or errors.
- Exercised the mobile filter drawer, person-board switcher, map category filter,
  clustered map, and direct place focus.
- Confirmed `Must book` returns 17 required-booking ideas and a focused stay map
  link selects Stays, renders its three rows, and opens the requested popup.
- Loaded all 83 activity cards: 82 specific images succeeded and Casa Elisa
  remained intentionally photo-free.
- Native iOS Simulator testing could not run because full Xcode and `simctl` are
  not installed on this Mac.
