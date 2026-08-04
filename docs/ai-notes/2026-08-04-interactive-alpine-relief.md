# Interactive Alpine Relief Map

## Purpose

The Map route now has two deliberately different tools:

- **Places** remains the practical Leaflet map for activities, stays, and useful
  stops. Its filters still begin empty.
- **Alpine relief** is an orientation view from Lake Annecy across the Aravis to
  Mont Blanc. It is for understanding the landscape and the handful of Tour de
  France climbs worth knowing, not for turn-by-turn navigation.

## Implementation

- MapLibre GL JS 5.24 is loaded only when the Alpine relief tab is opened.
- OpenFreeMap's Liberty vector style supplies roads, water, labels, and required
  OpenStreetMap attribution without an API key.
- Mapterhorn supplies Terrarium elevation tiles for 3D terrain and hillshade.
- The opening camera keeps Annecy and the lake in the foreground, the Aravis in
  the middle distance, and Mont Blanc on the horizon.
- Screen-stable HTML markers identify Annecy, Lake Annecy, the four featured
  nearby cols, Plateau des Glières, and Mont Blanc. Joux Plane and Ramaz remain
  available from the guide without crowding the opening map.
- Selecting a marker or guide row updates `spot` in the hash route, moves the
  camera, and updates the details panel without reloading the app.
- The inspector can be hidden to give the terrain the full canvas, then reopened
  with the selected place preserved.

## Responsive Behavior

- Desktop uses a full-height terrain canvas with a narrow, independently
  scrollable field guide on the right.
- Phones use a 42/58 split: terrain above, scrollable field guide below. Most
  unselected marker labels collapse to touch-sized dots so they do not obscure
  the lake.
- Reduced-motion preferences remove camera transition duration.

## Failure And Offline Behavior

The live relief map requires a connection for MapLibre, vector tiles, and
elevation tiles. If MapLibre cannot load or WebGL is unavailable, the existing
illustrated Annecy-to-Mont-Blanc orientation map appears with the same selectable
places. The rest of the trip guide remains covered by the service worker.

## Verification

- Confirmed nonblank WebGL rendering at 1440 x 1024, 430 x 932, and 320 x 568.
- Confirmed marker selection, URL state, guide close/reopen, camera reset, and
  the Places/Alpine relief tab switch.
- Confirmed no page-level horizontal overflow and no browser console warnings or
  errors at the tested desktop and phone sizes.
- Confirmed the existing Places map still loads tiles and starts with no active
  category filters.
