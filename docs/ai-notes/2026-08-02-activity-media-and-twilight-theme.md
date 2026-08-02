# Activity media and twilight theme

## What changed

- Activity photos now come from one explicit registry in `data.js`.
- The old activity-to-area photo fallback was removed. An activity without a verified, relevant photo renders as a text-first card with a category stripe.
- Added 15 license-verified Wikimedia Commons photos for named activities and places.
- Added descriptive alt text and kept the complete Commons credit list in the Activities view.
- Extended the approved Home twilight palette through the shared app shell, page headings, boards, logistics surfaces, map chrome, and detail overlays.

## Visual rules

- Purple twilight is the connective shell, not the only color.
- Lake turquoise and alpine green remain functional accents.
- Do not add a photo merely to fill a card. It must represent the activity, its actual place, or both without implying a different venue.
- Home remains the visual source of truth for future route styling.

## Verification

- Passed Home, Activities, Ideas, Trip, Map (both views), Today, Bike, and
  photographed/text-only activity details at 1440 px and 390 px widths.
- All 57 rendered activity images loaded, had alt text, and resolved to existing
  files; 26 activities intentionally stayed text-only. No area fallback remains.
- Activity search/filter interaction passed, no route had page-level horizontal
  overflow, and the browser console had no errors or warnings.
- `app.js`, `data.js`, and `sw.js` passed `node --check`; all service-worker core
  asset paths exist and `git diff --check` passed.
