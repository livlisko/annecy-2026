# Annecy 2026 Visual + IA Redesign

Status: approved for local implementation on 2026-07-29.

## Product Direction

Build a personal Alpine field guide and shared inspiration board, not a managed
itinerary. The site should make the region easy and exciting to understand,
while keeping stays, flights, and transport close at hand.

## Navigation

- Home: clear orientation and four obvious entry points.
- Activities: the single place to browse all activity options.
- Ideas: Pinterest-like per-person saved boards.
- Trip: stays, flights, van, and essentials first.
- Map: the same activity taxonomy used by Activities.
- Today: a contextual during-trip link, not the default home page.
- Cycling: retained as specialist content within Activities.

Legacy routes continue to resolve, but Discover, Browse, Search, Build, Saved,
Compare, Timeline, and Events do not remain competing primary surfaces.

## Visual System

- A luminous, cinematic Alpine field guide inspired by Portal.
- Fraunces gives headlines an editorial, old-world French character; restrained
  Avenir-style utility text keeps controls and trip details easy to scan.
- Portal-like violet-blue twilight supplies atmosphere; Annecy aquamarine,
  clear cyan water, leafy alpine green, limestone gray, cloud white, and tiny
  geranium-pink accents make the palette place-specific.
- Atmospheric Annecy imagery carries place and mood. The Home artwork follows
  the real lake basin and waterfront character: Roc de Chère, Semnoz, La
  Tournette, transparent turquoise shallows, little boats, grassy lake edges,
  and flowered Pont des Amours-style ironwork. Avoid generic Alpine fantasy
  geography.
- Home uses one immersive landscape and one large framed portal into the guide;
  internal pages use calm white reading surfaces.
- Rounded forms are reserved for the portal frame, controls, and true cards.
- No emoji-led UI, beige wash, generic bento grids, or stacks of cards.
- Desktop uses a top navigation bar; mobile retains an ergonomic bottom bar.

## Screen Decisions

### Home

Use an immersive blue-hour Lake Annecy landscape, a literal trip title, dates,
and one-line purpose. A large white framed window reveals a brighter summer
landscape and the six primary activity categories. Ideas, Trip, and Map follow
as quiet secondary paths rather than a competing dashboard grid. During the
trip, Today appears as a contextual link.

### Activities

Use one category system:

- All
- Lake & water
- Cycling
- Hikes & views
- Food & history
- Adrenaline
- Easy days

Keep lightweight Area, Effort, Booking, and Rain-safe filters plus secondary
search. Do not hide activities by trip leg or date. Remove the duplicate
"Worlds", surprise generator, discovery cards, and repeated history sections
from this screen. Preserve cycling detail through the Cycling category and hub.

### Ideas

Use visual saved boards with person tabs and consistent bookmark controls.
Maybe, Booked, and Done remain lightweight card-level states. Storage remains
local to each device in this phase.

### Trip

Lead with stays, then flights and van, then useful transport/essentials. Demote
the day-by-day timeline below the confirmed logistics. Today may surface only
gentle high-stakes reminders on relevant days.

### Map

Use the same category names and semantics as Activities. Keep the current map
interaction model; mobile clustering and bottom-sheet work remain later.

## Engineering Fixes

- Remove `ignoreSearch` service-worker matching and bump the cache version.
- Restrict Rain-safe to explicitly safe activity data.
- Correct Map category mappings for family/recovery items.
- Add location metadata to the ten activities currently missing it.
- Replace the blocking update toast with a quiet dismissible notice.
- Keep keyboard focus visible only for interactive navigation/focus management.
- Give icon-only controls accessible names.

## Out Of Scope

- Weather integration.
- Build-a-Day or itinerary generation.
- Minute-by-minute schedules.
- Collaborative backend, voting, or synchronization.
- Major mobile map redesign.
- Publishing before local visual and behavior review.

## Verification

Before handoff:

- Run JavaScript syntax checks.
- Validate activity IDs, media/source references, and location metadata.
- Exercise Home, Activities, Ideas, Trip, Map fallback, Today, and detail routes.
- Test bookmarking, person switching, statuses, filters, and legacy redirects.
- Check desktop and mobile screenshots for overlap, clipping, and visual drift.
- Verify no unexpected console errors.
