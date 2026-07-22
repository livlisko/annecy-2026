# 2026-07-22 — Fact-check pass (resolve [CHECK] flags)

- **Date:** 2026-07-22
- **Tool:** Claude Code

## Summary

Researched all practical `[CHECK]` placeholders against official sources (10 parallel research agents; every fact carries the URL it was fetched from) and folded confirmed facts into `data.js`. Highlights:

- **Les Gets Bike Park**: open daily 19 Jun–13 Sep 2026 (whole stay covered); Portes du Soleil day pass ~€39; Mont Chéry runs daily to 30 Aug; DH rentals 360 Outdoor / The Hub / Intersport.
- **Navibus lake shuttle**: stops at 9 ports **including Veyrier-du-Lac**; 3 departures daily through 28 Aug 2026; from €8; bikes +€6.
- **Morette Resistance museum**: Tue–Sun 10:00–12:30 & 14:00–18:00, €3 (closed Mon — Aug 17 & 24); plateau/monument free; official page on hautesavoie.fr.
- **Beaches 2026**: La Brune free + lifeguarded 11–19h (1 Jul–31 Aug); Talloires/Angon free, 12:30–18:30; St-Jorioz paid €2.60 (9:30–17:30); Menthon paid €4.60 (10–19h).
- **Fête du Lac 2026 = Sat 1 Aug — before the trip** (arrival Aug 12); app copy updated accordingly.
- **Markets**: Annecy Tue/Fri/Sun 07–13h confirmed for 2026; Veyrier has a Friday-morning market + two bakeries; Sévrier Wednesdays.
- **La Clusaz** lifts daily to 30 Aug 2026, €23.50; Grand-Bornand Rosay gondola carries bikes.
- **No velodrome exists in Haute-Savoie** (confirmed via dept. directory) — copy now says so instead of flagging it.
- **Drive times** (OSRM, free-flow): Les Gets ~1h15, Glières ~45 min, Chamonix ~1h20, La Clusaz ~30 min.

## Decisions

- Facts published only where the source explicitly covers Aug 2026; season-pattern facts phrased without a year claim; remaining unknowns keep `[CHECK]`.
- Remaining flags are deliberate: cycling route specifics (Semnoz/Aravis/lake-loop distances & gradients), Chamonix lift/Montenvers details, Menthon château night-visit booking.

## Next actions

- Optional: research the cycling-route specifics (distances/gradients) for the Bike screen.
- Fête du Lac is missed this year — nothing to do.
- Bakery August closures in Veyrier unverifiable in advance; scout on arrival.
