# Alpine map and iconic cols

## Decision

Keep the practical Leaflet map and add a second `Alpine view` inside the same
Map tab. The Alpine view uses the existing Annecy-to-Mont-Blanc orientation
relief with accessible HTML hotspots and a text alternative.

Cycling gets a deliberately short recognition guide rather than another climb
database. The six included summits are:

- Col de la Forclaz de Montmin
- Semnoz / Cret de Chatillon
- Col des Aravis
- Col de la Colombiere
- Col de Joux Plane
- Col de la Ramaz

Each entry answers only:

1. Why the place is iconic.
2. Its useful Tour de France history.
3. What a non-cyclist can see, eat, or do at the top.

Coordinates and elevations match the verified French Cols Tracker. Tour facts
use official Tour de France sources; summit activities use local tourism
offices. The full 113-col tracker remains a separate linked reference.

## Architecture

- `data.js` owns the shared `TOUR_COLS` editorial data.
- `app.js` renders that data in both Cycling and the Alpine map detail panel.
- Map mode remains in the existing `#/map` route:
  - `#/map` is the practical Leaflet map.
  - `#/map?view=alpine` is the relief orientation view.
- Existing activity records remain the saveable objects. Col entries link to a
  related trip idea when one already exists rather than duplicating Ideas data.
