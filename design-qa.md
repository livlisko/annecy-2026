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

Tested in headless Chromium at:

- 1440 × 1000
- 390 × 844

Routes reviewed:

- Home
- Activities
- Ideas
- Trip
- Activity detail
- Today
- Map

## Checks

- Home has a literal trip title, purpose, primary Activities action, six
  activity category links, and three secondary paths to Ideas, Trip, and Map.
- Both generated Annecy art assets load and the four homepage tasters use
  complete photographic activity records.
- 57 activity cards render with deliberately assigned, place- or
  activity-specific media; the remaining 26 render as designed text-first cards
  instead of borrowing misleading area imagery.
- Activities category, area, effort, booking, rain-safe, and search controls
  render without horizontal page overflow.
- Rain-safe results contain only explicit `rain: good` or `rainy` data.
- Bookmark state, per-person boards, and Maybe / Booked / Done controls update.
- Trip leads with all three stays, followed by flights, van, and essentials.
- Map tiles or the offline fallback render, and all shared categories return
  places.
- Desktop header and mobile bottom navigation stay visible in their intended
  positions; all five mobile labels and icons remain visibly legible on Home.
- No page-level horizontal overflow at either viewport.
- No unexpected browser console errors or page exceptions.
- JavaScript syntax checks and `git diff --check` pass.

Result: pass.
