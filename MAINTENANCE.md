# Data maintenance — how to re-check before you go

Everything volatile in this app (opening dates, prices, timetables, event
details, closures) is verified against an **official source** and carries a
`src` + `verifiedOn` in `data.js`. The last full verification pass was
**2026-07-23**. Re-check the items below in the **days before departure** —
seasons, prices and schedules move.

## Where the facts live

- **`data.js` → `SOURCES`** — the registry of official URLs, keyed by id.
- **`data.js` → `ACTIVITIES[]`** — each activity has `status`,
  `availability`, `src`, and `verifyBeforeGo: true` when it wasn't confirmed
  for our exact dates. Those render an amber **“Verify before going”** badge.
- **`data.js` → `EVENTS[]`** — each event has `confidence`
  (`confirmed` / `likely`), `src` and a `conflict` flag for changeover days.
- **`data.js` → `TRANSPORT_GUIDE` / `WEATHER`** — transport and forecast links.

## Priority re-checks (highest churn first)

| What | Source id | Why re-check |
|---|---|---|
| Navibus schedule & fares | `navibus` | 3/day ends **28 Aug**; verify times per port + the bike supplement |
| Free summer buses (lines 15/20) | `mobilite` | Confirm the **July–Aug free-fare** policy is renewed for 2026 |
| Semnoz / La Clusaz / Grand-Bornand bike-park dates & passes | `semnoz-bikepark`, `laclusaz-bikepark`, `gb-mtb` | Lift calendars and prices |
| Les Gets bike-park passes | `lesgets-bikepark` | Web vs desk pricing |
| Canyoning / paragliding / diving / SUP | `canyon-angon`, `canyon-montmin`, `parapente`, `diving`, `ledeck` | Operator season + day-by-day weather; **book ahead** |
| Château / Palais de l’Île Tuesday closure | `musees-annecy` | Sources disagree — confirm before a Tue visit (18 & 25 Aug) |
| Impérial Festival free/paid split & times | `imperial-fest` | Programme detail is from secondary sources |
| Open-air cinema schedule | `cine-plein-air` | “Shaun le mouton” is the **29 Aug** closing night = our departure day; find an earlier film |
| Morillon Enduro World Cup | `morillon-uci` | `ucimtbworldseries.com` didn’t resolve during research — confirm 14–16 Aug + race times |
| Veyrier Express fast boat | `mobilite` | Dates/fares unverified — check operator or the mairie |
| Parmelan access road | `parmelan` | **Closures** — re-check the official trail/status page |
| La Tournette snow flag | `la-tournette` | Flagged **closed 26 Jul 2026** (névés above 1,700 m, after two 2025 deaths) — likely reopens post-snowmelt; check lac-annecy.com + talloires-montmin.fr in early Aug. RD909 Balmettes–Glière road closure + park at Prés Ronds |
| Via Ferrata de Thônes | `thones-vf` | **Open in 2026** — the landing-page “closed” line is a stale 2023 banner. Phone the Thônes tourist office (+33 4 50 02 00 26) to confirm before going |

## Known corrections already applied (do not re-introduce)

- **La Tournette from Montmin** is temporarily closed → omitted (not recommended).
- **Thônes via ferrata** is closed until further notice → removed; **Tour du
  Jallouvre** (AD–D+, open 2026) is the researched alternative.
- **Lake loop** = ~40 km / 300 m, ride **clockwise**; the west shore is the
  traffic-free greenway, the east shore is **road riding** (care Menthon→Talloires).
- **Traversée des Glières gravel** = 81 km / 1 750 m / very hard.
- **Roc de Chère** is a protected reserve — marked paths only, no cliff jumping.
- Route stats are tied to a **named start point + variant** (e.g. Forclaz has
  separate lake-side and Montmin-side numbers).
- Dropped the unsourced superlative — the lake is “**one of** the purest in Europe”.

## How to update a fact

1. Open the official page (`SOURCES[id].url`).
2. Edit the value in `data.js` and bump that source’s `on:` date (or the
   activity/event field). Set `verifyBeforeGo` back to `false` once confirmed.
3. Bump `VERSION` in `sw.js` (e.g. `a26-v10`) so the offline cache refreshes.
4. No build step — commit and it deploys via GitHub Pages.

## Weather

The app never fabricates live conditions. During the trip, open the links on
the Today screen each morning: **Météo-France** (towns + hourly), **Météo-France
Montagne — Alpes du Nord** (afternoon-storm timing for cols/ridges), the
**Vigilance** map (storm/heat alerts) and **Windfinder Veyrier** (lake wind).
