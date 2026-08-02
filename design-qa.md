# Design QA

Date: 2026-08-02

## Visual Reference

- Reference: Portal (`siteinspire.com/website/13484-portal`).
- Preserved qualities: immersive atmospheric field, centered editorial serif
  headline, restrained utility type, white pill action, and a large framed
  window that reveals the product.
- Annecy adaptation: violet-blue twilight over the real lake basin, a bright
  aquamarine waterfront window, alpine-green and lilac interface depth,
  geranium-pink saved states, and activity categories inside the window instead
  of a product mockup.
- Geographic check: the final art follows the real Lake Annecy basin and uses
  Roc de Chère, Semnoz, La Tournette, the northern Annecy lights, and Château de
  Duingt as place-specific anchors instead of invented Alpine architecture.
- Internal pages carry the same type, color, rounded white reading surface, and
  quiet control styling without turning every section into a decorative card.
- Mobile constraint: preserve a five-item bottom navigation and avoid clipping
  or horizontal page overflow.

## Browser Coverage

Tested in the in-app Chromium browser at:

- 1440 x 1000
- 320 x 568
- 390 x 844
- 430 x 932

Routes reviewed:

- Home
- Activities
- Ideas
- Trip
- Activity detail
- Today
- Map
- Alpine map
- Cycling

## iPhone Fidelity Ledger

- Atmosphere: the violet-blue Annecy twilight field and aquamarine lake imagery
  from the concepts carry through every primary mobile route.
- Hierarchy: compact `Annecy 2026` chrome, large Fraunces route titles, and quiet
  utility copy match the intended editorial rhythm.
- Activities: categories stay directly beneath the image header, filters collapse
  to one clear control, and a real activity appears in the opening viewport.
- Ideas: the four-person selector and two-column visual board preserve the
  Pinterest-like concept without adding voting or scheduling.
- Trip: stays lead with dates, check-in/out, directions, and map actions in a
  dense reference layout rather than a daily agenda.
- Map: the place view uses clustered markers and a readable list/sheet; the
  Alpine view keeps the illustrated regional map and selected-col detail.
- Navigation: the same five destinations remain fixed and legible at all tested
  iPhone widths, including the safe-area allowance.

## Checks

- Home has a literal trip title, purpose, primary Activities action, six
  activity category links, and three secondary paths to Ideas, Trip, and Map.
- Both generated Annecy art assets load and the four homepage tasters use
  complete photographic activity records.
- 82 activity cards render with deliberately assigned, place- or
  activity-specific media; Casa Elisa remains an intentional text-first card
  instead of borrowing a misleading private-property image.
- Activities category, area, effort, booking, rain-safe, and search controls
  render without horizontal page overflow; mobile filters expand and collapse
  with accurate `aria-expanded` state.
- Rain-safe results contain only explicit `rain: good` or `rainy` data.
- Bookmark state, per-person boards, and Maybe / Booked / Done controls update.
- Trip leads with all three stays, followed by flights, van, and essentials.
- Map tiles or the offline fallback render, all shared categories return places,
  clustered markers reduce density, and direct place links reveal their popup.
- Desktop header and mobile bottom navigation stay visible in their intended
  positions; all five mobile labels and icons remain visibly legible on Home.
- No page-level horizontal overflow at any tested viewport.
- Visible controls have accessible names and visible images have `alt` text.
- No unexpected browser console errors or page exceptions.
- JavaScript syntax checks and `git diff --check` pass.

Full iOS Simulator verification was unavailable on this machine because only
the Xcode command-line tools are installed and `simctl` is absent. The three
responsive iPhone browser sizes above are the current device-layout evidence.

Result: pass.
