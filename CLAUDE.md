# CLAUDE.md

Shared guidance for Claude Code in this repo.

## Product Goal

This site is the Annecy 2026 reference guide for Olivia and her brothers. It
should feel like a warm, useful, fun trip companion: a place to understand the
region, browse beautiful activity options, remember trip basics, and bookmark
things the group may want to get around to.

It is not a minute-by-minute vacation scheduler. Avoid overplanning, rigid daily
agendas, heavy comparison tables, and anything that makes the trip feel managed.

## Current Phase

Phase 1 is about getting the bones right:

- Information architecture and navigation
- Content clarity and completeness
- Trip logistics structure
- Activity discovery and bookmarking
- Maintainable data/setup patterns

Major mobile polish, map clustering, bottom sheets, weather integrations, and
large visual redesigns are later-phase work unless explicitly requested.

## Navigation Direction

Before deleting, merging, or renaming major sections, propose the information
architecture and wait for approval.

The likely direction is a simpler bottom nav:

- Today
- Activities
- Trip
- Map
- Bike

Treat Plan, Discover, Browse, Search, Saved, Events, and logistics as surfaces
that may need to be merged or clarified, not blindly preserved as separate pages.

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
