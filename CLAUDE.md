# CLAUDE.md

Shared guidance for Claude Code in this repo.

## Product Goal

This site is the Annecy 2026 reference guide for Olivia and her brothers. It
should feel like a warm, useful, fun trip companion: a place to understand the
region, browse beautiful activity options, remember trip basics, and bookmark
things the group may want to get around to.

It is not a minute-by-minute vacation scheduler. Avoid overplanning, rigid daily
agendas, heavy comparison tables, and anything that makes the trip feel managed.

## Current Architecture

The approved primary navigation is:

- Home
- Activities
- Ideas
- Trip
- Map

Today is a contextual during-trip view, not the default front door. Cycling is
specialist content within Activities. Legacy Discover, Browse, Search, Build,
Saved, Compare, Timeline, and Events routes redirect into the current surfaces.

The visual system is a luminous Alpine field guide inspired by Portal: Fraunces
display type, restrained Avenir-style utility text, violet-blue twilight,
Annecy aquamarine, leafy alpine green, tiny geranium-pink accents, atmospheric
regional imagery, and soft white controls. Violet supplies atmosphere rather
than dominating the interface. Home should feel like one immersive landscape
with a large framed window into the guide. Avoid
beige paper themes, emoji-led controls, generic bento grids, unrelated visual
effects, or stacks of cards inside cards. Home artwork must remain recognizably
Lake Annecy, using the real basin, Roc de Chère, Semnoz, La Tournette, Annecy at
the northern end, and Château de Duingt rather than generic Alpine geography.

Major mobile map work such as clustering and a bottom sheet, weather
integrations, and shared-board synchronization remain later-phase work.

## Product Priorities

- Make logistics obvious but quiet. Flights, stays, van/transport,
  check-in/out, useful links, and emergency/basic info should be easy to find,
  likely under Trip.
- Surface only high-stakes logistics reminders on relevant days, such as
  checkout/departure or directions to tonight's stay. Do not create
  minute-by-minute instructions.
- Make Activities the main exploration surface. Browsing and discovery matter
  more than search.
- Do not hide most activities behind rigid day/leg filters before the trip.
  Everything is close enough that grouping by category, mood, region/place,
  effort, must-book, rain/rest day, or easy group option is usually better.
- Remove or absorb Build a Day. The site does not need a planning engine; useful
  activity logic/data should move into Activities or Ideas where appropriate.
- Make Saved/Ideas feel like a Pinterest-style inspiration board where each
  person can save favorite activities. Simple Maybe / Booked / Done status is
  fine only if it stays lightweight; avoid spreadsheet-like comparison or voting
  systems.
- Keep regional character, cool history, food, lake, bike, mountain, and village
  context. Exploring and engaging with the place should feel fun.

## Tone And Copy

- Preserve the current personal, warm, slightly playful voice.
- Prefer human language over robot labels. For example, use "Worth it, a bit
  more effort than you asked" instead of "Close fit - relaxed effort."
- Keep labels scannable and plain.
- Avoid adding in-app tutorial text or explaining UI mechanics unless the user
  asked for it.

## Privacy And Safety

This is a public GitHub Pages site.

Never hardcode private booking references, exact private addresses, flight
confirmations, personal document links, private Airbnb links, credentials, API
keys, or other sensitive data unless the user explicitly confirms they are
intentionally public.

Use placeholders, local-only storage, ignored private config files, or clear
warnings for sensitive trip data.

The owner explicitly confirmed on 2026-07-29 that the stay addresses currently
shown in `data.js` are intentionally public. Preserve them and do not raise them
as a review finding. Confirmation codes must remain masked.

Run the privacy-check skill before finishing any work that touches trip
logistics, data files, links, or content copied from confirmations.

## Design And Accessibility

- Fix accidental focus outlines around non-interactive headings.
- Emoji-only controls need accessible labels.
- Keep keyboard navigation reasonable.
- Avoid making mobile worse during phase 1, even though major mobile reformatting
  is later.
- Do not let update toasts, banners, or floating UI block bottom navigation or
  important content.
- Keep the Activities and Map taxonomies aligned: Lake & water, Cycling, Hikes
  & views, Food & history, Adrenaline, and Easy days.

## Development Workflow

- Treat GitHub as the source of truth for code and project context.
- Inspect the repo first and follow existing patterns.
- This is a static GitHub Pages app. There is currently no package/build step.
- Run locally with `python3 -m http.server 8000` from the repo root when checking
  rendered behavior.
- Use Claude Code `/run` to launch the app and `/verify` to check rendered
  behavior before handoff when practical.
- Also run the repo's relevant checks before finishing. If checks cannot be run,
  say why clearly.
- Keep changes small, scoped, and easy to review.
- Save durable decisions, gotchas, and next actions in `docs/ai-notes/` when
  useful.
- Bump `VERSION` in `sw.js` when changing cached app assets so the offline cache
  refreshes.
- Do not commit secrets, credentials, or local machine-specific paths.
