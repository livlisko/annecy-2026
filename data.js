/* =====================================================================
   Annecy & Les Gets — August 2026 trip companion. Single source of truth.

   Everything the app shows comes from here: the trip legs and lodging,
   the ranked activity catalogue, the dated events, transport and weather
   guidance. Screens are VIEWS over this data — the same activity is never
   hand-duplicated across Bike / Lake / Food / Discover.

   Provenance: volatile facts carry status / availability / a source id
   (into SOURCES) and verifiedOn. Anything not confirmed for our exact
   dates is marked verifyBeforeGo — there are no hidden [CHECK] guesses.
   Last verification pass: 2026-07-23 (see MAINTENANCE.md).
   ===================================================================== */
window.DATA = (function () {
  'use strict';

  const VERIFIED = '2026-07-23';

  /* ---------- SOURCES (provenance registry) -------------------------- */
  const SOURCES = {
    'lac-annecy':      { url: 'https://en.lac-annecy.com/', type: 'Tourism office', on: VERIFIED },
    'lake-loop':       { url: 'https://en.lac-annecy.com/cycle-tourism-route/cycling-route-around-lake-annecy-annecy/', type: 'Tourism office', on: VERIFIED },
    'glieres-gravel':  { url: 'https://en.lac-annecy.com/gravel-bike-route/traversee-des-glieres-parcours-gravel-annecy/', type: 'Tourism office', on: VERIFIED },
    'forclaz-thones':  { url: 'https://www.thonescoeurdesvallees.com/en/decouvrir/les-cols/col-de-la-forclaz/', type: 'Tourism office', on: VERIFIED },
    'semnoz-climb':    { url: 'https://www.cols-cyclisme.com/bauges/france/cret-de-chatillon-mont-semnoz-depuis-annecy-c1069.htm', type: 'Cols database', on: VERIFIED },
    'tour-semnoz':     { url: 'https://hautesavoiemontblanc-tourisme.com/offres/tour-du-semnoz-itineraire-cyclo-annecy-fr-5835541/', type: 'Tourism office', on: VERIFIED },
    'lesgets-bikepark':{ url: 'https://pass.lesgets.com/en/les-gets-bikepark-summer-2026-calendar-opening-hours/', type: 'Resort operator', on: VERIFIED },
    'lesgets-tarifs':  { url: 'https://www.lesgets.com/en/', type: 'Resort operator', on: VERIFIED },
    'lesgets-uci':     { url: 'https://www.lesgets.com/en/events-agenda/uci-mountain-bike-world-cup/', type: 'Organizer', on: VERIFIED },
    'semnoz-bikepark': { url: 'https://www.semnoz.fr/vtt/', type: 'Resort operator', on: VERIFIED },
    'semnoz-station':  { url: 'https://www.semnoz.fr/activites-de-la-station/', type: 'Resort operator', on: VERIFIED },
    'laclusaz-bikepark':{ url: 'https://www.laclusaz.com/en/mountain-bike/bikepark/', type: 'Tourism office', on: VERIFIED },
    'gb-mtb':          { url: 'https://www.legrandbornand.com/quoi-faire/sports-loisirs-bien-etre/domaine-ete/', type: 'Tourism office', on: VERIFIED },
    'pumptrack-duingt':{ url: 'https://en.lac-annecy.com/equipment/pumptrack-duingt/', type: 'Tourism office', on: VERIFIED },
    'la-tournette':    { url: 'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/la-tournette-depuis-montmin-talloires-montmin/', type: 'Tourism office', on: '2026-07-26' },
    'thones-vf':       { url: 'https://www.thonescoeurdesvallees.com/en/equipement/via-ferrata-de-la-roche-a-lagathe/', type: 'Tourism office', on: '2026-07-26' },
    'jallouvre-vf':    { url: 'https://en.legrandbornand.com/what-to-do/via-ferrata-la-tour-du-jallouvre-le-grand-bornand-en-5595979/', type: 'Tourism office', on: VERIFIED },
    'mont-veyrier':    { url: 'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/boucle-du-mont-veyrier-annecy/', type: 'Tourism office', on: VERIFIED },
    'parmelan':        { url: 'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/le-plateau-du-parmelan-filliere/', type: 'Tourism office', on: VERIFIED },
    'trois-lacs':      { url: 'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/le-circuit-des-trois-lacs-semnoz-viuz-la-chiesaz/', type: 'Tourism office', on: VERIFIED },
    'glieres-walk':    { url: 'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/a-la-decouverte-du-plateau-des-glieres-filliere/', type: 'Tourism office', on: VERIFIED },
    'roc-de-chere':    { url: 'https://www.cen-haute-savoie.org/reserves-naturelles/roc-de-chere/', type: 'Nature reserve (Asters)', on: VERIFIED },
    'accro-talloires': { url: 'https://en.lac-annecy.com/service/acroaventures-talloires-talloires-montmin/', type: 'Tourism office', on: VERIFIED },
    'canyon-angon':    { url: 'https://en.lac-annecy.com/activite-reservable/canyoning-angon-discovery/', type: 'Tourism office / guide', on: VERIFIED },
    'canyon-montmin':  { url: 'https://www.annecyguidesmontagne.com/aventures/canyon-montmin-sportif', type: 'Mountain guides', on: VERIFIED },
    'parapente':       { url: 'https://annecy.takamaka.fr/fr/p/parapente-annecy', type: 'Operator', on: VERIFIED },
    'ledeck':          { url: 'https://www.ledeck-veyrier.com/en/', type: 'Operator', on: VERIFIED },
    'cv-sevrier':      { url: 'https://www.cvsevrier.fr/', type: 'Sailing club', on: VERIFIED },
    'diving':          { url: 'https://en.lac-annecy.com/activite-bookable/first-dive/', type: 'Tourism office', on: VERIFIED },
    'navibus':         { url: 'https://www.bateaux-annecy.com/our-sightseeing-cruises/navibus/', type: 'Boat operator', on: VERIFIED },
    'gorges-fier':     { url: 'https://www.gorgesdufier.com/en/useful-info-2026-season.html', type: 'Operator', on: VERIFIED },
    'halles-haras':    { url: 'https://biltoki.com/halles/halles-du-haras', type: 'Operator', on: VERIFIED },
    'musee-anim':      { url: 'https://www.citeanimationannecy.com/en/programme/musee-du-cinema-danimation', type: 'Museum', on: VERIFIED },
    'musees-annecy':   { url: 'https://musees.annecy.fr/visiter/horaires-et-tarifs', type: 'Municipal', on: VERIFIED },
    'annecy-market':   { url: 'https://www.annecy.fr/annuaires/agendas/detail/marche-de-la-vieille-ville', type: 'Municipal', on: VERIFIED },
    'pierre-gay':      { url: 'https://www.haute-savoie-tourisme.org/commerces/alimentaire/fromageries/764734-fromagerie-pierre-gay', type: 'Tourism office', on: VERIFIED },
    'cave-michel':     { url: 'https://www.lac-annecy.com/alti_alliance_post/visite-de-cave-et-atelier-degustation/', type: 'Tourism office', on: VERIFIED },
    'veyrier-market':  { url: 'https://www.veyrier-du-lac.fr/index.php/marches-et-commerces/', type: 'Municipal', on: VERIFIED },
    'veyrier-crea':    { url: 'https://www.veyrier-du-lac.fr/marche-des-createurs/', type: 'Municipal', on: VERIFIED },
    'glieres-sites':   { url: 'https://hautesavoie.fr/evenement/sites-des-glieres-maquis-et-morette/', type: 'Departmental', on: VERIFIED },
    'imperial-fest':   { url: 'https://en.lac-annecy.com/event/imperial-annecy-festival-2026-annecy/', type: 'Tourism office', on: VERIFIED },
    'cine-plein-air':  { url: 'https://www.annecy.fr/activites/evenements/cine-plein-air-2026', type: 'Municipal', on: VERIFIED },
    'bouquetin':       { url: 'https://www.legrandbornand.com/quoi-faire/evenements-et-animation/agenda/27eme-grimpee-cycliste-le-bouquetin-le-grand-bornand-fr-4806997/', type: 'Tourism office', on: VERIFIED },
    'momes':           { url: 'https://en.legrandbornand.com/what-to-do/events-and-entertainment/highlights/au-bonheur-des-momes-festival/', type: 'Tourism office', on: VERIFIED },
    'morillon-uci':    { url: 'https://www.ucimtbworldseries.com/', type: 'Organizer', on: VERIFIED },
    'mobilite':        { url: 'https://mobilites.grandannecy.fr/lac', type: 'Transport authority', on: VERIFIED },
    'mobil-ete':       { url: 'https://en.lac-annecy.com/mobil-ete/', type: 'Tourism office', on: VERIFIED },
    'parking-annecy':  { url: 'https://www.annecy.fr/quotidien/deplacement-et-stationnement/travaux-2026', type: 'Municipal', on: VERIFIED },
    'meteo':           { url: 'https://meteofrance.com/previsions-meteo-france/haute-savoie/74', type: 'Météo-France', on: VERIFIED },
    'meteo-montagne':  { url: 'https://meteofrance.com/meteo-montagne/alpes-du-nord', type: 'Météo-France', on: VERIFIED },
    'vigilance':       { url: 'https://vigilance.meteofrance.fr/', type: 'Météo-France', on: VERIFIED },
    'windfinder':      { url: 'https://fr.windfinder.com/forecast/veyrier_du_lac_lake_annecy', type: 'Wind forecast (private)', on: VERIFIED },
    'blue-secret':     { url: 'https://blue-secret.com/en/annecy-english-new/', type: 'Operator', on: '2026-07-26' },
    'skiwake74':       { url: 'https://www.skiwake74.com/en/', type: 'Operator', on: '2026-07-26' },
    'ncy-sup':         { url: 'https://ncy-sup.com/', type: 'Operator', on: '2026-07-26' },
    'leshouches':      { url: 'https://leshouches.montblancnaturalresort.com/en/', type: 'Resort operator', on: '2026-07-26' },
    'coop-thones':     { url: 'https://hautesavoiemontblanc-tourisme.com/en/offers/visite-de-la-cooperative-du-reblochon-fermier-thones-en-5867525/', type: 'Tourism office', on: '2026-07-26' },
    'cheran-ban':      { url: 'https://mairie-alby-sur-cheran.fr/cheran-baignade-interdite/', type: 'Municipal', on: '2026-07-26' },
    // Activity-expansion sweep (all checked 2026-07-26)
    'traversee-lac':   { url: 'https://dauphins-annecy.auvergnerhonealpes-natation.fr/traversee-du-lac-dannecy/', type: 'Operator', on: '2026-07-26' },
    'esperance3':      { url: 'https://esperance3.org/6-sorties-grand-public/', type: 'Operator', on: '2026-07-26' },
    'vboat':           { url: 'https://v-boat.fr/tarifs', type: 'Operator', on: '2026-07-26' },
    'libellule':       { url: 'https://www.bateaux-annecy.com/restaurant-cruises/dinner-cruise/', type: 'Operator', on: '2026-07-26' },
    'essaonia':        { url: 'https://www.essaonia.net/activites/kayak-de-mer-lac-annecy-demi-journee/', type: 'Operator', on: '2026-07-26' },
    'wakearena':       { url: 'https://wakearena-annecy.com/', type: 'Operator', on: '2026-07-26' },
    'nautichill':      { url: 'https://nautichill.com/', type: 'Operator', on: '2026-07-26' },
    'semnoz-luge':     { url: 'https://www.semnoz.fr/luge-ete/', type: 'Operator', on: '2026-07-26' },
    'fantasticable':   { url: 'https://www.chatel.com/en/activities/the-fantasticable-in-summer-chatel/', type: 'Tourism office', on: '2026-07-26' },
    'pont-diable':     { url: 'https://www.lepontdudiable.com/informations-tarifs/', type: 'Operator', on: '2026-07-26' },
    'ballon-cimes':    { url: 'https://www.ballondescimes.fr', type: 'Operator', on: '2026-07-26' },
    'delta-evasion':   { url: 'https://www.deltaevasion.com/', type: 'Operator', on: '2026-07-26' },
    'terreo-diau':     { url: 'https://www.terreo-canyoning.com/activite/speleologie-la-diau-decouverte-a-annecy/', type: 'Operator', on: '2026-07-26' },
    'vf-pollet':       { url: 'https://www.laclusaz.com/en/details/yves-pollet-villard-via-ferrata/', type: 'Tourism office', on: '2026-07-26' },
    'guides-annecy':   { url: 'https://www.annecyguidesmontagne.com/escalade', type: 'Operator', on: '2026-07-26' },
    'guidon-mtb':      { url: 'https://www.guidonmtb.com/activite/sortie-vtt-electrique/', type: 'Operator', on: '2026-07-26' },
    'vitam':           { url: 'https://ucpavitam.fr/fr/infos-pratiques/tarifs/aquatique', type: 'Operator', on: '2026-07-26' },
    'karting-rumilly': { url: 'https://www.kartingrumilly.fr/tarifs-location-karting-rumilly/', type: 'Operator', on: '2026-07-26' },
    'grande-evasion':  { url: 'https://www.la-grande-evasion.com/annecy/', type: 'Operator', on: '2026-07-26' },
    'menthon-chateau': { url: 'https://www.chateau-de-menthon.com/evenements/visites-nocturnes-theatralisees/', type: 'Operator', on: '2026-07-26' },
    'tamie':           { url: 'https://www.abbaye-tamie.com/informations-pratiques', type: 'Operator', on: '2026-07-26' },
    'jardins-secrets': { url: 'https://www.jardins-secrets.com/informations-pratiques/', type: 'Operator', on: '2026-07-26' },
    'montrottier':     { url: 'https://www.chateaudemontrottier.com/visite/', type: 'Operator', on: '2026-07-26' },
    'mija':            { url: 'https://www.mija-food.fr/food-tour-annecy/', type: 'Operator', on: '2026-07-26' },
    'lesgets-luge':    { url: 'https://pass.lesgets.com/en/4-seasons-sledge/', type: 'Operator', on: '2026-07-26' },
    'avokart':         { url: 'https://www.skipass-avoriaz.com/infos/avokart', type: 'Operator', on: '2026-07-26' },
    'aquariaz':        { url: 'https://www.avoriaz.com/en/fiche/aquariaz-tropical-paradise/', type: 'Tourism office', on: '2026-07-26' },
    'an-rafting':      { url: 'https://an-rafting.com/prestation/rafting-haute-savoie/', type: 'Operator', on: '2026-07-26' },
    'music-meca':      { url: 'https://musicmecalesgets.org/horaires-tarifs/', type: 'Operator', on: '2026-07-26' },
    // Iconic-col guide (official Tour and local tourism sources, checked 30 Jul)
    'tdf-joux-plane':  { url: 'https://www.letour.fr/en/news/2023/carlos-rodriguez-the-birth-of-a-champion/1314125', type: 'Tour de France', on: '2026-07-30' },
    'tdf-ramaz':       { url: 'https://www.letour.fr/en/news/2010/andy-the-winner-while-evans-is-the-leader/1044994', type: 'Tour de France', on: '2026-07-30' },
    'tdf-semnoz-2013': { url: 'https://www.letour.fr/en/news/2013/quintana-s-coup-the-arrival-of-a-climbing-king/1045288', type: 'Tour de France', on: '2026-07-30' },
    'tdf-colombiere':  { url: 'https://www.letour.fr/en/news/2021/stage-8/teuns-doubles-up-pogacar-takes-yellow/1294702', type: 'Tour de France', on: '2026-07-30' },
    'tdf-haute-savoie':{ url: 'https://www.letour.fr/en/news/2023/stage-15/commentary-from-christian-prudhomme-26/1308898', type: 'Tour de France', on: '2026-07-30' },
    'forclaz-summit':  { url: 'https://www.haute-savoie-tourisme.org/nature/points-vue/117371-belvedere-de-montmin-col-de-la-forclaz', type: 'Tourism office', on: '2026-07-30' },
    'semnoz-summer':   { url: 'https://www.lac-annecy.com/idees-de-sejour/ete/une-journee-d-ete-au-semnoz/', type: 'Tourism office', on: '2026-07-30' },
    'aravis-summit':   { url: 'https://www.haute-savoie-tourisme.org/nature/cols-montagnes/209204-col-des-aravis', type: 'Tourism office', on: '2026-07-30' },
    'colombiere-summit': { url: 'https://en.legrandbornand.com/le-col-de-la-colombiere-colombiere-pass.html', type: 'Tourism office', on: '2026-07-30' },
    'joux-plane-summit': { url: 'https://www.haut-giffre.fr/equipements/peche-au-lac-de-joux-plane/', type: 'Tourism office', on: '2026-07-30' },
    'ramaz-summit':    { url: 'https://en.prazdelys-sommand.com/equipement/col-de-la-ramaz-tourist-route/', type: 'Tourism office', on: '2026-07-30' }
  };

  /* ---------- TRIP: legs, bases, stays (personal, kept in full) ------
     Two ACTIVITY BASES (Les Gets vs the lake) drive what's relevant;
     three STAYS drive lodging/logistics. Dates are Europe/Paris. */
  const BASES = {
    lesgets: { id: 'lesgets', label: 'Les Gets', coords: [46.1505, 6.6679] },
    lake:    { id: 'lake', label: 'Veyrier-du-Lac', coords: [45.8758, 6.1852] }
  };

  const TRIP = {
    window: { start: '2026-08-12', end: '2026-08-29' },
    datesLabel: '12–29 August 2026',
    tz: 'Europe/Paris'
  };

  // Stays double as the leg model. baseId = which activity world applies.
  const STAYS = [
    {
      id: 'stay-lesgets', baseId: 'lesgets', legLabel: 'Leg 1 · Les Gets',
      name: 'Appartement au pied des pistes', village: 'Les Gets',
      address: '627 Route de la Turche, 74260 Les Gets',
      coords: [46.15045, 6.66785],
      start: '2026-08-12', end: '2026-08-15',
      dates: 'Wed 12 Aug → Sat 15 Aug',
      checkin: 'From 16:00 · self check-in (lockbox — code arrives 48 h before)',
      checkout: 'By 11:00',
      features: ['At the foot of the slopes', 'Sleeps 4 max', 'No pets'],
      photo: 'assets/wiki/les-gets-village.jpg'
    },
    {
      id: 'stay-guerres', baseId: 'lake', legLabel: 'Leg 2 · Veyrier-du-Lac',
      name: 'House with views (Olivier’s)', village: 'Veyrier-du-Lac',
      address: '14 Chemin des Guerres, 74290 Veyrier-du-Lac',
      coords: [45.87499, 6.18190],
      start: '2026-08-15', end: '2026-08-22',
      dates: 'Sat 15 Aug → Sat 22 Aug',
      checkin: 'From 16:00 · host meets you in person — agree a time',
      checkout: 'By 9:00 — early!',
      features: ['~300 m from the lake', 'Courtyard parking for 2–3 cars', 'Level access from the courtyard', 'Quiet hours 23:00–7:00'],
      photo: 'assets/wiki/veyrier.jpg'
    },
    {
      id: 'stay-casa-elisa', baseId: 'lake', legLabel: 'Leg 3 · Veyrier-du-Lac',
      name: 'Casa Elisa', village: 'Veyrier-du-Lac',
      address: '3 Route de Morat, 74290 Veyrier-du-Lac',
      coords: [45.87580, 6.18525],
      start: '2026-08-22', end: '2026-08-29',
      dates: 'Sat 22 Aug → Sat 29 Aug',
      checkin: '16:00–21:30 · tell them your arrival time in advance',
      checkout: 'By 11:00',
      features: ['Private pool', 'Terrace + BBQ', 'Lake view', 'Air conditioning', 'Free on-site parking', 'Cash deposit on arrival, refunded at checkout', 'Upper floors by stairs only'],
      photo: 'assets/wiki/veyrier.jpg'
    }
  ];

  // Confirmed flights + van. Confirmation codes masked on this public page.
  const TRANSPORT = {
    flights: [
      { who: 'Liv', dir: 'out', date: 'Tue 11 → Wed 12 Aug', legs: 'JFK 19:25 → GVA 09:15 (next morning)', flight: 'UA 9719 · operated by SWISS (A330)', conf: 'B69•••', note: 'Lands 15 min before the van pickup — straight to the National counter.' },
      { who: 'Andrew', dir: 'out', date: 'Fri 14 → Sat 15 Aug', legs: 'EWR 17:30 → GVA 07:30 (next morning)', flight: 'United', conf: 'ESN•••', note: 'Lands the morning of the Les Gets → lake move — collect him at GVA on the drive down.' },
      { who: 'Andrew', dir: 'back', date: 'Sat 29 Aug', legs: 'GVA 09:20 → EWR 12:15', flight: 'United', conf: 'ESN•••' },
      { who: 'Liv', dir: 'back', date: 'Sat 29 Aug', legs: 'GVA 11:40 → JFK 14:20', flight: 'SWISS LX 22 (A330)', conf: 'B69•••' }
    ],
    car: {
      name: 'Full-size van — Renault Kangoo Grand or similar, automatic', conf: 'National #16948•••••',
      pickup: 'Wed 12 Aug, 09:30 · Geneva Airport (GVA)', ret: 'Sat 29 Aug, 09:30 · Geneva Airport (GVA)',
      drivers: 'Liv · Chip (Christian on the contract) · Andrew · Ian',
      includes: 'Damage waiver · unlimited mileage · ≈ CHF 1,860 total',
      find: 'Stay on the Swiss side of the airport → rental counter → shuttle to the P51 car park → finish at the kiosk. Desk open 6:30–23:30.'
    },
    privacyNote: 'Full confirmation codes are in your email — kept off this public page on purpose.',
    flightsNote: 'Chip & Ian — travel details coming (they owe us their bookings). Both are already named drivers on the van.',
    departure: 'Departure Saturday (29 Aug) is tight: Andrew flies 09:20 (at GVA by ~07:15), the van is due back 09:30, Liv flies 11:40 — one early run leaving Veyrier ~06:15. Arrange early checkout + deposit handback with Casa Elisa in advance (their normal window opens 08:30).'
  };

  // The four of us — used for the per-person Ideas boards (saved on each phone).
  const PEOPLE = ['Olivia', 'Andrew', 'Chip', 'Ian'];

  /* ---------- ICONIC TOUR COLS ----------------------------------------
     A deliberately short recognition guide, not another climb database.
     Coordinates/elevations come from the verified French Cols Tracker. */
  const TOUR_COLS = [
    {
      id: 'forclaz', name: 'Col de la Forclaz de Montmin', elevation: 1150,
      region: 'Above Lake Annecy', coords: [45.8085, 6.2448],
      iconic: 'Annecy’s balcony: the lake drops away below the road and paragliders launch almost at eye level.',
      tour: 'Crossed on Stage 15 of the 2023 Tour, from Les Gets to Saint-Gervais Mont-Blanc.',
      summit: 'The belvedere and launch deck, farm-made cheese and Savoyard food at La Ferme, snacks, terraces and short viewpoint walks.',
      tourSrc: 'tdf-haute-savoie', summitSrc: 'forclaz-summit', ideaId: 'forclaz-lunch'
    },
    {
      id: 'semnoz', name: 'Semnoz · Crêt de Châtillon', elevation: 1670,
      region: 'Above Annecy', coords: [45.7977, 6.1072],
      iconic: 'Annecy’s own summit road, with a huge horizon over the lake, Bauges, Aravis and Mont Blanc.',
      tour: 'The summit finish of Stage 20 in the 100th Tour in 2013: Nairo Quintana won the stage and mountains jersey while Chris Froome secured the Tour.',
      summit: 'Panoramic ridge walks, summer luge, mountain activities, several restaurants and alpage farms. Easy to enjoy without a bike.',
      tourSrc: 'tdf-semnoz-2013', summitSrc: 'semnoz-summer', ideaId: 'semnoz-picnic'
    },
    {
      id: 'aravis', name: 'Col des Aravis', elevation: 1487,
      region: 'La Clusaz · Aravis', coords: [45.8723, 6.4649],
      iconic: 'The postcard pass: limestone teeth behind you and Mont Blanc framed across the valley.',
      tour: 'One of the region’s true Tour fixtures, crossed 38 times in all; the race returned again on the 2023 Les Gets stage.',
      summit: 'The 1650 Sainte-Anne chapel, Mont Blanc viewpoint, restaurants, cheese and souvenir shops, plus several walks from the pass.',
      tourSrc: 'tdf-haute-savoie', summitSrc: 'aravis-summit', ideaId: 'aravis-cheese'
    },
    {
      id: 'colombiere', name: 'Col de la Colombière', elevation: 1613,
      region: 'Le Grand-Bornand · Aravis', coords: [45.9922, 6.4757],
      iconic: 'A classic Route des Grandes Alpes pass squeezed between dramatic limestone walls, often with ibex above the road.',
      tour: 'A regular Tour battleground since 1960. In 2021 the race crossed it before Le Grand-Bornand as Tadej Pogačar took yellow.',
      summit: 'A mountain restaurant directly on the col, a broad viewpoint and several hike starts; look up for ibex on the cliffs.',
      tourSrc: 'tdf-colombiere', summitSrc: 'colombiere-summit', ideaId: 'aravis-cheese'
    },
    {
      id: 'joux-plane', name: 'Col de Joux Plane', elevation: 1712,
      region: 'Morzine · Samoëns', coords: [46.1326, 6.7111],
      iconic: 'The brutal final wall before the descent to Morzine: a name cycling fans immediately recognize.',
      tour: 'In 2023 it became the Tour’s 250th hors-catégorie climb, with Vingegaard and Pogačar duelling over the summit before Carlos Rodríguez won in Morzine.',
      summit: 'Lac de Joux Plane, easy lake walks, summer trout fishing and Le Relais des Vallées restaurant facing the water.',
      tourSrc: 'tdf-joux-plane', summitSrc: 'joux-plane-summit'
    },
    {
      id: 'ramaz', name: 'Col de la Ramaz', elevation: 1619,
      region: 'Praz de Lys · Sommand', coords: [46.1593, 6.5807],
      iconic: 'The quieter Portes du Soleil classic: a wild-feeling road with an enormous Mont Blanc panorama.',
      tour: 'Used on major Tour stages in 2010 and 2023; in 2023 it came before Joux Plane on the mountain run into Morzine.',
      summit: 'The panorama is the main event, plus an easy walk to Lac de Roy for marmots; Praz de Lys and Sommand have Savoyard restaurants nearby.',
      tourSrc: 'tdf-ramaz', summitSrc: 'ramaz-summit'
    }
  ];

  /* ---------- AREAS (the mental map of the lake and its edges) -------- */
  const AREAS = [
    { id: 'annecy', name: 'Annecy', zone: 'Top of the lake', region: 'top', coords: [45.8992, 6.1294], supports: ['food','culture','lake'], photo: 'assets/wiki/annecy-old-town.jpg', official: 'https://en.lac-annecy.com/',
      why: 'The old town: canals, the Tuesday/Friday/Sunday market, the château and Palais de l’Île, and a town swim two minutes from the bustle.' },
    { id: 'veyrier', name: 'Veyrier-du-Lac', zone: 'East shore · home base', region: 'east', coords: [45.8830, 6.1717], supports: ['lake','bikes','food'], photo: 'assets/wiki/veyrier.jpg',
      why: 'Home for the two lake weeks. La Brune beach below the village, a paddle base on the beach, bus line 20 and the shaded shore path into Annecy.' },
    { id: 'menthon', name: 'Menthon-Saint-Bernard', zone: 'East shore · pontoons', region: 'east', coords: [45.8624, 6.1978], supports: ['lake','culture'], photo: 'assets/wiki/menthon-chateau.jpg',
      why: 'Floating pontoons below, a storybook château above, and the foot of the Forclaz climb.' },
    { id: 'talloires', name: 'Talloires-Montmin', zone: 'East shore · bay', region: 'east', coords: [45.8404, 6.2167], supports: ['lake','food','adrenaline'], photo: 'assets/wiki/talloires.jpg',
      why: 'A pretty bay and the launchpad for Angon canyoning, the treetop park and the Forclaz climb.' },
    { id: 'angon', name: 'Angon', zone: 'East shore · quieter', region: 'east', coords: [45.8345, 6.2206], supports: ['lake','adrenaline'], photo: 'assets/wiki/angon.jpg',
      why: 'A quiet beach, a waterfall walk and the Angon canyon — same château view as Talloires, less volume.' },
    { id: 'roc-de-chere', name: 'Roc de Chère', zone: 'East shore · nature reserve', region: 'east', coords: [45.8533, 6.2050], supports: ['walk','views'], photo: 'assets/wiki/roc-de-chere.jpg', official: 'https://www.cen-haute-savoie.org/reserves-naturelles/roc-de-chere/',
      why: 'A protected forested headland — marked woodland paths and lake viewpoints between two swims. Stay on the trails.' },
    { id: 'sevrier', name: 'Sévrier', zone: 'West shore', region: 'west', coords: [45.8584, 6.1383], supports: ['lake','bikes'], photo: 'assets/wiki/sevrier.jpg',
      why: 'The easy-going west shore where the traffic-free Voie Verte greenway runs, plus the sailing club.' },
    { id: 'st-jorioz', name: 'Saint-Jorioz', zone: 'West shore · sandy beach', region: 'west', coords: [45.8245, 6.1641], supports: ['lake'], photo: 'assets/wiki/st-jorioz.jpg',
      why: 'The big sandy beach on the greenway — towels, lawns, lifeguards in season.' },
    { id: 'duingt', name: 'Duingt', zone: 'The narrows · château', region: 'west', coords: [45.8086, 6.2051], supports: ['lake','bikes'], photo: 'assets/wiki/duingt.jpg',
      why: 'Where the lake pinches — château on the point, the clearest water, and a free lakeside pump track.' },
    { id: 'doussard', name: 'Doussard / Bout-du-Lac', zone: 'South end · grassy & flat', region: 'south', coords: [45.7826, 6.2197], supports: ['lake','bikes'], photo: 'assets/wiki/doussard.jpg',
      why: 'Grassy south-end beach and reserve, the calmest water for SUP, and the paragliding landing field.' },
    { id: 'semnoz', name: 'Le Semnoz', zone: 'Above the lake · ~1650 m', region: 'heights', coords: [45.7970, 6.1040], supports: ['views','bikes'], photo: 'assets/wiki/semnoz.jpg', official: 'https://www.semnoz.fr/',
      why: 'The nearest summit: a road climb, a summer bike park and luge, and a ridge with the whole lake and Mont-Blanc.' },
    { id: 'forclaz', name: 'Col de la Forclaz', zone: 'Above the east shore · ~1150 m', region: 'heights', coords: [45.8070, 6.2440], supports: ['views','adrenaline','food'], photo: 'assets/wiki/forclaz.jpg',
      why: 'The lake-from-above balcony: a col climb, the tandem-paragliding launch, and a lawn lunch with the best seat on the water.' },
    { id: 'glieres', name: 'Plateau des Glières', zone: 'Bornes plateau · ~1450 m', region: 'beyond', coords: [45.9630, 6.3260], supports: ['walk','culture','views'], photo: 'assets/wiki/glieres.jpg', official: 'https://hautesavoie.fr/evenement/sites-des-glieres-maquis-et-morette/',
      why: 'A high pasture with 50 km of marked trails, the Resistance monument, and the Morette museum on the Thônes road.' },
    { id: 'aravis', name: 'Aravis · La Clusaz & Le Grand-Bornand', zone: 'East over the passes · ~30–50 min', region: 'beyond', coords: [45.9040, 6.4230], supports: ['bikes','food','views','adrenaline'], photo: 'assets/wiki/aravis-village.jpg', official: 'https://www.laclusaz.com/en/',
      why: 'Reblochon country: two lift-served bike parks, the Jallouvre via ferrata, cheese from the farm and the famous cols.' },
    { id: 'chamonix', name: 'Chamonix', zone: 'Mont-Blanc valley · ~1h20', region: 'beyond', coords: [45.9237, 6.8694], supports: ['views'], photo: 'assets/wiki/chamonix.jpg', official: 'https://www.chamonix.com/',
      why: 'The big one — glaciers, the Aiguilles, an alpine town that means business. A clear-weather day trip.' },
    { id: 'les-gets', name: 'Les Gets', zone: 'Portes du Soleil · Leg 1', region: 'beyond', coords: [46.1558, 6.6697], supports: ['bikes','views','food'], photo: 'assets/wiki/les-gets-village.jpg', official: 'https://www.lesgets.com/en/',
      why: 'Where the trip starts: a 128 km bike park across two mountains, a walkable village, and the mountain air before the lake.' }
  ];
  const AREA_BY_ID = Object.fromEntries(AREAS.map(a => [a.id, a]));

  /* ---------- ACTIVITIES (the ranked catalogue) ----------------------
     base: 'lake' | 'lesgets' | 'both'  (hard: must match the active base)
     duration: 'evening' | '2h' | 'half' | 'full'
     effort: 'recovery' | 'easy' | 'moderate' | 'big'
     transport: which ways reach it from the base (hard filter)
     themes: water | bikes | views | food | culture | adrenaline | rainy | recovery
     status/availability/verifyBeforeGo + src → provenance. */
  const ACTIVITIES = [

    /* ===== WATER & SWIMMING (lake base) ===== */
    {
      id: 'home-swim', title: 'Walk down to La Brune', base: 'lake', cat: 'swim', subtype: 'Village swim',
      areaId: 'veyrier', coords: [45.8865, 6.1782],
      summary: 'A few minutes downhill from the house: free beach, flat lawn, lifeguards, back up for lunch.',
      why: 'The zero-logistics home default — the reason a car-free day works from Veyrier.',
      duration: '2h', effort: 'easy', transport: ['walk','bike'], themes: ['water','recovery'],
      scenic: 2, novelty: 1, group: 'all',
      access: 'Walk or freewheel down from the village; bus line 20 Barattes stop is close.',
      facilities: 'Free entry, flat lawn, lifeguards daily 11:00–19:00 to 31 Aug 2026; snack kiosk.',
      weather: { rain: 'poor', heat: 'exposed', storm: 'avoid', best: 'any', note: 'Best swimming is late morning before the afternoon breeze.' },
      pairWith: ['veyrier-market','sup-veyrier'], status: 'open', src: 'lac-annecy',
      travel: { lake: { min: 6, mode: 'walk' } }, featured: true, media: { photo: 'assets/wiki/lake-swim.jpg' }
    },
    {
      id: 'menthon-pontoons', title: 'Pontoon day at Menthon', base: 'lake', cat: 'swim', subtype: 'Beach & pontoons',
      areaId: 'menthon', coords: [45.8615, 6.1965],
      summary: 'Floating pontoons to jump off and sun-dry on, château on the hill above.',
      duration: 'half', effort: 'easy', transport: ['bike','busboat','car'], themes: ['water'],
      scenic: 3, novelty: 1, group: 'all',
      facilities: 'Paid beach in summer (~€4.60 adult), supervised 10:00–19:00; snack bar.',
      weather: { rain: 'poor', heat: 'exposed', best: 'clear' },
      pairWith: ['forclaz-lunch','roc-walk'], status: 'seasonal', availability: 'Supervised summer season.',
      src: 'lac-annecy', travel: { lake: { min: 12, mode: 'car/bike' } }, media: { photo: 'assets/wiki/menthon-chateau.jpg' }
    },
    {
      id: 'angon-apero', title: 'Swim + apéro at Angon', base: 'lake', cat: 'swim', subtype: 'Evening swim',
      areaId: 'angon', coords: [45.8290, 6.2170],
      summary: 'Late swim off the quiet beach, then saucisson and a cold bottle as the light goes gold.',
      duration: 'evening', effort: 'easy', transport: ['bike','busboat','car'], themes: ['water','food'],
      scenic: 3, novelty: 1, group: 'all',
      facilities: 'Free supervised beach 12:30–18:30 in summer; beach bar.',
      weather: { rain: 'poor', best: 'clear', note: 'West-facing light — the sunset move.' },
      pairWith: ['cascade-angon'], status: 'seasonal', src: 'lac-annecy',
      travel: { lake: { min: 15, mode: 'car' } }, featured: true, media: { photo: 'assets/wiki/angon.jpg' }
    },
    {
      id: 'st-jorioz-beach', title: 'Beach day at Saint-Jorioz', base: 'lake', cat: 'swim', subtype: 'Family beach',
      areaId: 'st-jorioz', coords: [45.8330, 6.1640],
      summary: 'The big sandy west-shore beach — lawns, shade, lifeguards, easy to reach by bus or boat.',
      duration: 'full', effort: 'easy', transport: ['busboat','car','bike'], themes: ['water'],
      scenic: 2, novelty: 1, group: 'all',
      facilities: 'Paid + lifeguarded 9:30–17:30 to 31 Aug 2026 (€2.60 adult, €1 after 16:30); buvette.',
      access: 'Bus line 15 (west shore) or the Navibus; on the Voie Verte greenway.',
      weather: { rain: 'poor', heat: 'exposed', best: 'clear' },
      status: 'seasonal', src: 'mobilite', travel: { lake: { min: 20, mode: 'car/bus' } }, media: { photo: 'assets/wiki/st-jorioz.jpg' }
    },
    {
      id: 'doussard-sup', title: 'SUP & sprawl at Bout-du-Lac', base: 'lake', cat: 'paddle', subtype: 'Paddle & beach',
      areaId: 'doussard', coords: [45.7790, 6.2210],
      summary: 'Grassy south-end beach and reserve with the calmest water on the lake — the paddle end.',
      duration: 'full', effort: 'easy', transport: ['car','bike'], themes: ['water'],
      scenic: 3, novelty: 2, group: 'all',
      weather: { rain: 'poor', wind: 'calm-am', best: 'clear', note: 'Paddle in the morning — the afternoon thermal breeze picks up.' },
      pairWith: ['forclaz-lunch'], status: 'open', src: 'lac-annecy',
      travel: { lake: { min: 25, mode: 'car' } }, media: { photo: 'assets/wiki/doussard.jpg' }
    },
    {
      id: 'sup-veyrier', title: 'Paddle from the home beach (Le Deck)', base: 'lake', cat: 'paddle', subtype: 'SUP / pedalo / e-boat',
      areaId: 'veyrier', coords: [45.8865, 6.1782],
      summary: 'The nautical base right at Plage de la Brune rents SUPs, pedalos and licence-free electric boats — straight from the home beach.',
      duration: '2h', effort: 'easy', transport: ['walk','bike'], themes: ['water'],
      scenic: 3, novelty: 2, group: 'all',
      booking: 'recommended', bookingUrl: 'https://www.ledeck-veyrier.com/en/',
      price: 'SUP €15/1h, €30/2h, €90/day (vest included); pedalo €25/1h; GoBoat electric from €130/1.5h',
      gear: 'Buoyancy vest mandatory, included.',
      weather: { rain: 'poor', wind: 'calm-am', best: 'morning', note: 'Glassy water is the early morning; afternoons get choppy.' },
      status: 'operator-active', availability: 'Summer lakeside base — confirm daily hours before going.', verifyBeforeGo: true,
      src: 'ledeck', travel: { lake: { min: 6, mode: 'walk' } }
    },
    {
      id: 'navibus-hop', title: 'Lake by boat: Navibus hop', base: 'lake', cat: 'boat', subtype: 'Lake shuttle',
      areaId: 'veyrier', coords: [45.8865, 6.1782],
      summary: 'The hop-on/hop-off electric boat calls at Veyrier — take a bike one way and ride back, or just do the slow scenic loop.',
      why: 'The best no-car way to reach the far shore or turn the greenway into a one-way ride.',
      duration: 'half', effort: 'recovery', transport: ['walk','busboat'], themes: ['water','recovery'],
      scenic: 3, novelty: 2, group: 'all',
      booking: 'recommended', price: 'Point-to-point ~€6–22 by route; bikes reportedly +€1 (verify)',
      access: 'Departs the Veyrier-du-Lac port. 3 departures daily every day 6 Jul–28 Aug 2026; from 29 Aug only Tue/Wed/Fri/Sun.',
      weather: { rain: 'ok', best: 'any', note: 'Runs in most weather; a good grey-sky option.' },
      status: 'seasonal', availability: 'Peak daily service through 28 Aug; reduced from 29 Aug (departure day — likely no boat).', verifyBeforeGo: true,
      src: 'navibus', travel: { lake: { min: 5, mode: 'walk' } }
    },
    {
      id: 'diving-baptism', title: 'First scuba dive on the lake', base: 'lake', cat: 'paddle', subtype: 'Discover scuba',
      areaId: 'annecy', coords: [45.8950, 6.1360],
      summary: 'A guided first dive (baptême) to a shallow seagrass shelf — one-to-one with an instructor, wetsuit provided.',
      why: 'The lake’s icon dive is the sunken 1971 steamer “France” at 42 m — certified divers only; the baptême is everyone else’s way in.',
      duration: '2h', effort: 'easy', transport: ['bike','busboat','car'], themes: ['water','adrenaline'],
      scenic: 2, novelty: 3, group: 'all', groupNote: 'From age 8; children 8–12 need water above 18°.',
      booking: 'required', bookingUrl: 'https://en.lac-annecy.com/activite-bookable/first-dive/', price: 'From €90',
      skill: 'Basic comfort in water; no certification needed for a first dive.',
      weather: { rain: 'ok', best: 'any', note: 'Underwater — weather barely matters; summer visibility up to ~20 m.' },
      status: 'seasonal', availability: 'Summer diving season; book a slot.', verifyBeforeGo: true, src: 'diving',
      travel: { lake: { min: 12, mode: 'car' } }
    },
    {
      id: 'sailing-sevrier', title: 'Sail or windsurf at Sévrier', base: 'lake', cat: 'paddle', subtype: 'Sailing club',
      areaId: 'sevrier', coords: [45.8584, 6.1383],
      summary: 'The Sévrier sailing school rents catamarans, dinghies and windsurf boards, or runs lessons — the wind end of the lake.',
      duration: 'half', effort: 'moderate', transport: ['car','busboat'], themes: ['water','adrenaline'],
      scenic: 2, novelty: 2, group: 'some', groupNote: 'Best for those keen to learn or already sail.',
      booking: 'recommended', bookingUrl: 'https://www.cvsevrier.fr/',
      weather: { rain: 'ok', wind: 'breeze-pm', best: 'afternoon', note: 'Wants the afternoon thermal breeze; light mornings suit total beginners.' },
      status: 'operator-active', availability: 'Club season ~April–October; confirm rental slots.', verifyBeforeGo: true, src: 'cv-sevrier',
      travel: { lake: { min: 20, mode: 'car' } }
    },

    /* ===== ROAD & GRAVEL CYCLING (lake base) ===== */
    {
      id: 'lake-loop-road', title: 'The lake loop (road, ~40 km)', base: 'lake', cat: 'road', subtype: 'Road loop',
      areaId: 'annecy', coords: [45.8992, 6.1294],
      summary: 'The signed circuit of the lake — but ride it clockwise, and know the two shores are not the same.',
      why: 'The classic. Half of it is a genuine traffic-free greenway; the other half is a real road you share with cars.',
      duration: 'half', effort: 'moderate', transport: ['bike'], themes: ['bikes','views','water'],
      distanceKm: 40, ascentM: 300, difficulty: 'Medium road loop; one main climb early if clockwise.',
      scenic: 3, novelty: 1, group: 'some', groupNote: 'The east-shore road section suits confident road riders; nervous riders can turn back on the west greenway.',
      safety: 'Clockwise the east shore is road riding on the RD909a. The ~3 km between Menthon and Talloires needs real care — a steep, narrow, twisting descent into Talloires. The west shore (Sévrier→Annecy) is the traffic-free Voie Verte.',
      access: 'From Veyrier you join mid-loop on the east shore; ride south first, return on the greenway.',
      facilities: 'Water/toilets at old Brédannaz station, fountains after the greenway tunnel, and at Saint-Jorioz.',
      gpx: 'https://en.lac-annecy.com/cycle-tourism-route/cycling-route-around-lake-annecy-annecy/',
      weather: { rain: 'ok', heat: 'exposed', best: 'clear', note: 'Long and open — start early on hot days.' },
      pairWith: ['home-swim'], easierAlt: 'voie-verte-recovery',
      status: 'open', availability: 'Year-round, free.', src: 'lake-loop',
      travel: { lake: { min: 2, mode: 'from the door' } }, featured: true, media: { photo: 'assets/wiki/voie-verte.jpg' }
    },
    {
      id: 'voie-verte-recovery', title: 'West-shore greenway spin', base: 'lake', cat: 'easybike', subtype: 'Traffic-free path',
      areaId: 'sevrier', coords: [45.8700, 6.1390],
      summary: 'Flat, separated, lake the whole way — the fully family-friendly half of the loop. Perfect recovery or no-car ride.',
      duration: 'half', effort: 'recovery', transport: ['bike','busboat'], themes: ['bikes','water','recovery'],
      difficulty: 'Easy, flat, traffic-free (old railway).',
      scenic: 3, novelty: 1, group: 'all',
      safety: 'The genuinely traffic-free section — the developed Voie Verte on the old Annecy–Albertville railway.',
      access: 'From Veyrier: shore path into Annecy, then pick up the greenway south. Or take a bike on the Navibus one way.',
      facilities: 'Swim stops all along; fountains and cafés at Sévrier and Saint-Jorioz. Railway relics en route: the cyclists-only Duingt tunnel, Sévrier’s Belle-Époque footbridge and the old locomotive at Brédannaz.',
      weather: { rain: 'ok', heat: 'exposed', best: 'any' },
      pairWith: ['st-jorioz-beach','navibus-hop'],
      status: 'open', src: 'lake-loop', travel: { lake: { min: 12, mode: 'bike to Annecy' } }, media: { photo: 'assets/wiki/voie-verte.jpg' }
    },
    {
      id: 'east-shore-ride', title: 'Home ride: shore path to Annecy', base: 'lake', cat: 'easybike', subtype: 'Bike-to-swim',
      areaId: 'veyrier', coords: [45.8830, 6.1717],
      summary: 'Roll from the house along the tree-shaded lake wall at Chavoire into the old town — coffee, a swim, home.',
      duration: '2h', effort: 'easy', transport: ['bike'], themes: ['bikes','water'],
      difficulty: 'Easy, mostly separated path; ~10 min each way.',
      scenic: 2, novelty: 1, group: 'all',
      weather: { rain: 'ok', best: 'any' }, pairWith: ['annecy-market','home-swim'],
      status: 'open', src: 'lac-annecy', travel: { lake: { min: 2, mode: 'from the door' } }
    },
    {
      id: 'forclaz-climb-lake', title: 'Col de la Forclaz — lake side', base: 'lake', cat: 'road', subtype: 'Road climb',
      areaId: 'menthon', coords: [45.8624, 6.1978],
      summary: 'The short, steep classic straight up from the shore to the paragliding balcony over the lake.',
      duration: 'half', effort: 'big', transport: ['bike'], themes: ['bikes','views'],
      distanceKm: 10.2, ascentM: 660, difficulty: 'Hard: avg ~6.5%, hardest last 3 km with pitches to ~12%. Summit ~1150 m.',
      scenic: 3, novelty: 2, group: 'some', groupNote: 'A proper climb — one rider can do this while others swim below.',
      safety: 'Popular col road; watch for cars and paraglider-shuttle vans near the top.',
      weather: { rain: 'ok', heat: 'exposed', storm: 'avoid-pm', best: 'clear', note: 'Start from Menthon (do not blend with the Montmin/south stats).' },
      pairWith: ['forclaz-lunch','paragliding-forclaz'], easierAlt: 'east-shore-ride',
      status: 'seasonal', availability: 'Paved col, snow-free ~Apr–Oct.', src: 'forclaz-thones',
      travel: { lake: { min: 10, mode: 'ride to the foot' } }
    },
    {
      id: 'forclaz-climb-south', title: 'Col de la Forclaz — Montmin (south) side', base: 'lake', cat: 'road', subtype: 'Road climb',
      areaId: 'doussard', coords: [45.7826, 6.2197],
      summary: 'The shorter, steeper south approach from Vésonne through Montmin — a different climb to the same col.',
      duration: 'half', effort: 'big', transport: ['bike'], themes: ['bikes','views'],
      distanceKm: 8.2, ascentM: 655, difficulty: 'Very hard: avg ~8%, max ~13%, with a dip near Montmin that hides the steepest ramps. Summit ~1150 m.',
      scenic: 3, novelty: 2, group: 'some',
      weather: { rain: 'ok', heat: 'exposed', storm: 'avoid-pm', best: 'clear', note: 'Named start = Vésonne. Kept separate from the lake-side numbers on purpose.' },
      status: 'seasonal', availability: 'Paved col, snow-free ~Apr–Oct.', src: 'forclaz-thones',
      travel: { lake: { min: 25, mode: 'drive/ride to Vésonne' } }
    },
    {
      id: 'semnoz-climb', title: 'Col du Semnoz by bike (from Annecy)', base: 'lake', cat: 'road', subtype: 'Road climb',
      areaId: 'semnoz', coords: [45.8992, 6.1294],
      summary: 'The big local benchmark: a long, steady forested climb from the lake to the Crêt de Châtillon at 1660 m.',
      duration: 'full', effort: 'big', transport: ['bike'], themes: ['bikes','views'],
      distanceKm: 17.4, ascentM: 1212, difficulty: 'Hard: avg ~7%, upper 9 km ~8.6%, max ~10%. Summit 1660 m.',
      scenic: 3, novelty: 2, group: 'some', groupNote: 'One rider’s big day out; others can drive up for the picnic view.',
      safety: 'Cooler and exposed near the summit — take a layer for the descent.',
      weather: { rain: 'ok', storm: 'avoid-pm', best: 'clear', note: 'From Annecy, direct north side. The gentler cyclo loop goes via Col de Leschaux instead.' },
      pairWith: ['semnoz-picnic'], easierAlt: 'tour-semnoz',
      status: 'seasonal', availability: 'Summit road open in summer, snow-free.', src: 'semnoz-climb',
      travel: { lake: { min: 12, mode: 'ride to Annecy first' } }
    },
    {
      id: 'tour-semnoz', title: 'Tour du Semnoz (cyclo loop, 52 km)', base: 'lake', cat: 'road', subtype: 'Road loop',
      areaId: 'annecy', coords: [45.8992, 6.1294],
      summary: 'The official signed cyclo loop up the gentler Col de Leschaux side and around — a big day without the 1660 m summit wall.',
      duration: 'full', effort: 'big', transport: ['bike'], themes: ['bikes','views'],
      distanceKm: 52, ascentM: 1100, difficulty: 'Difficile but graded gentler than the direct climb; Leschaux ~4% avg. ~3h30.',
      scenic: 3, novelty: 1, group: 'some',
      gpx: 'https://hautesavoiemontblanc-tourisme.com/offres/tour-du-semnoz-itineraire-cyclo-annecy-fr-5835541/',
      weather: { rain: 'ok', storm: 'avoid-pm', best: 'clear' },
      status: 'open', src: 'tour-semnoz', travel: { lake: { min: 12, mode: 'ride to Annecy first' } }
    },
    {
      id: 'glieres-gravel', title: 'Traversée des Glières (gravel epic)', base: 'lake', cat: 'gravel', subtype: 'Gravel loop',
      areaId: 'glieres', coords: [45.8992, 6.1294],
      summary: 'The signed gravel classic from Annecy over the Glières plateau — long, high and genuinely hard.',
      why: 'The standout gravel route: pasture tracks to 1440 m across the Resistance plateau, GPX published.',
      duration: 'full', effort: 'big', transport: ['bike'], themes: ['bikes','views'],
      distanceKm: 81, ascentM: 1750, difficulty: 'Very hard · ~4h15 riding · max alt 1440 m · gravel + paved sections.',
      scenic: 3, novelty: 3, group: 'some', groupNote: 'A serious solo/duo objective — pair it with a rest day for the others.',
      safety: 'The paved road serving the plateau carries heavy traffic daily — take care where the gravel shares it. Check snow/weather even in August.',
      gpx: 'https://en.lac-annecy.com/cache/gpx/28958809.gpx',
      weather: { rain: 'poor', storm: 'avoid-pm', ground: 'dries slow', best: 'clear', wetUnsafe: false, note: 'High and long — a settled clear day only.' },
      status: 'seasonal', availability: 'Route open ~1 May–31 Oct, snow/weather permitting.', src: 'glieres-gravel',
      travel: { lake: { min: 12, mode: 'ride to Annecy first' } }, featured: true
    },

    /* ===== MTB & BIKE PARKS ===== */
    {
      id: 'semnoz-bikepark', title: 'Semnoz bike park', base: 'lake', cat: 'mtb', subtype: 'Lift-served DH',
      areaId: 'semnoz', coords: [45.7970, 6.1040],
      summary: 'The closest lift-served descents to the lake — 4 downhill trails off the Télémix, only ~20 min above Annecy.',
      duration: 'half', effort: 'moderate', transport: ['car'], themes: ['bikes','adrenaline'],
      difficulty: '4 dedicated downhill trails (grading not stated by the resort).',
      scenic: 2, novelty: 2, group: 'some',
      booking: 'no', price: 'Lift pass at the caisse centrale: €17.50/day adult, €14.50/4h; rental via l’Appartelier du Cycle.',
      access: 'Drive up, or the summer Sibra summit shuttle (MTB on the Semnoz line +€6). Trailhead parking fills early on fine days.',
      facilities: 'Whole Semnoz summer station alongside: luge, tubing, scooters, buvettes.',
      safety: 'The much-shared “20 km descent to Annecy” is NOT an official trail — semnoz.fr lists only the four park runs. Ride it as a guided tour with a local operator, or skip it.',
      weather: { rain: 'poor', ground: 'greasy when wet', storm: 'avoid-pm', best: 'clear' },
      status: 'seasonal', availability: 'Bike park daily 10:00–18:00, 4 Jul–30 Aug 2026 — covers the whole lake stay.', src: 'semnoz-bikepark',
      travel: { lake: { min: 30, mode: 'car' } }, featured: true
    },
    {
      id: 'laclusaz-bikepark', title: 'La Clusaz bike park', base: 'lake', cat: 'mtb', subtype: 'Lift-served DH & enduro',
      areaId: 'aravis', coords: [45.9040, 6.4230],
      summary: '12 graded gravity trails across three lifts — real DH plus a strong enduro/beginner offer, ~45 min from Veyrier.',
      duration: 'full', effort: 'big', transport: ['car'], themes: ['bikes','adrenaline'],
      difficulty: '6 DH (2 green / 2 blue / 1 red / 1 black) + 6 enduro (1 blue / 4 red / 1 black), plus Wall Ride & North Shore zones.',
      scenic: 2, novelty: 2, group: 'some', groupNote: 'Beginner-friendly greens through to black — the whole group can ride at its level.',
      booking: 'no', price: '2026 day pass €23.50 adult (3h €20; 2-day €46); junior 5–14 €16.',
      weather: { rain: 'poor', ground: 'greasy when wet', best: 'clear' },
      status: 'seasonal', availability: 'Bike lifts daily 1 Jul–30 Aug 2026.', src: 'laclusaz-bikepark',
      travel: { lake: { min: 45, mode: 'car' } }, media: { photo: 'assets/wiki/aravis-village.jpg' }
    },
    {
      id: 'grandbornand-mtb', title: 'Le Grand-Bornand — enduro & e-enduro', base: 'lake', cat: 'mtb', subtype: 'Enduro / VTTAE',
      areaId: 'aravis', coords: [45.9420, 6.4270],
      summary: '178 km of marked trails and a guided E-Enduro day that pairs La Clusaz’s bike park with Grand-Bornand’s natural trails.',
      duration: 'full', effort: 'big', transport: ['car'], themes: ['bikes','adrenaline'],
      difficulty: 'Enduro/XC rather than a full DH park; 16 itineraries, 2 summer bike lifts; Lormay natural pump track.',
      scenic: 2, novelty: 2, group: 'some',
      booking: 'recommended', price: 'Summer lift pass = 10 rides; guided E-Enduro day via reservation.',
      weather: { rain: 'poor', best: 'clear' },
      status: 'seasonal', availability: 'Bike lifts daily 4 Jul–30 Aug 2026.', verifyBeforeGo: true, src: 'gb-mtb',
      travel: { lake: { min: 50, mode: 'car' } }
    },
    {
      id: 'pumptrack-duingt', title: 'Pump track at Duingt', base: 'lake', cat: 'mtb', subtype: 'Skills / pump track',
      areaId: 'duingt', coords: [45.8268, 6.1956],
      summary: 'The nearest lakeside pump track — two courses, free, year-round, on the west shore by the greenway.',
      duration: '2h', effort: 'easy', transport: ['car','bike','busboat'], themes: ['bikes'],
      difficulty: 'Two loops incl. one for young children; MTB / BMX / scooter.',
      scenic: 1, novelty: 2, group: 'all',
      booking: 'no', price: 'Free.', gear: 'Helmet + protection compulsory.',
      access: 'On-site car park; ~20–25 min drive from Veyrier around the south end. (No pump track in Veyrier itself; Argonay is the other close one, ~15 min N.)',
      weather: { rain: 'poor', best: 'any' },
      status: 'open', availability: 'Free, year-round.', src: 'pumptrack-duingt',
      travel: { lake: { min: 22, mode: 'car' } }
    },

    /* ===== HIKING & NATURE (lake base) ===== */
    {
      id: 'mont-veyrier-baron', title: 'Mont Veyrier & Mont Baron loop', base: 'lake', cat: 'hike', subtype: 'Mountain hike',
      areaId: 'veyrier', coords: [45.9010, 6.1910],
      summary: 'The ridge straight above the house — the whole lake from the top, but a real climb, not a stroll.',
      duration: 'full', effort: 'big', transport: ['car','bike'], themes: ['views','adrenaline'],
      distanceKm: 13.75, ascentM: 1120, difficulty: 'Très difficile · ~4h30 · max 1290 m. Engaged, technical ridge with exposure.',
      scenic: 3, novelty: 2, group: 'some', groupNote: 'For sure-footed hikers with a head for heights — not for nervous walkers or a casual afternoon.',
      skill: 'Sure footing and comfort with exposed/scramble passages required.',
      safety: 'Rockfall and slippery rock in the wet; exposed passages to the summit. The official loop starts from Annecy-le-Vieux (Avenue de Chavoires), not Veyrier village.',
      weather: { rain: 'poor', storm: 'avoid-pm', wetUnsafe: true, best: 'clear', note: 'Avoid in rain, fog or after heavy rain — the ridge gets dangerous.' },
      easierAlt: 'roc-walk',
      status: 'seasonal', availability: 'In season ~30 Apr–10 Nov.', verifyBeforeGo: true, src: 'mont-veyrier',
      travel: { lake: { min: 10, mode: 'car to Annecy-le-Vieux' } }
    },
    {
      id: 'roc-walk', title: 'Roc de Chère reserve walk', base: 'lake', cat: 'walk', subtype: 'Forest & viewpoint',
      areaId: 'roc-de-chere', coords: [45.8533, 6.2050],
      summary: 'An easy waymarked forest circuit in a protected reserve, with lake viewpoints — the low-effort nature option.',
      duration: '2h', effort: 'easy', transport: ['car','bike','busboat'], themes: ['views','recovery'],
      difficulty: 'Easy, low-altitude forest circuit; no technical difficulty.',
      scenic: 2, novelty: 1, group: 'all',
      safety: 'A national nature reserve — stay on marked paths. No camping, fires, picking plants or leaving the trails near the cliffs. It is protected woodland, not a swim spot.',
      weather: { rain: 'ok', shade: 'shaded', best: 'any', note: 'Good in light rain or heat — mostly under trees.' },
      pairWith: ['menthon-pontoons','angon-apero'],
      status: 'open', availability: 'Open year-round on marked paths.', src: 'roc-de-chere',
      travel: { lake: { min: 15, mode: 'car' } }, media: { photo: 'assets/wiki/roc-de-chere.jpg' }
    },
    {
      id: 'cascade-angon', title: 'Cascade d’Angon walk', base: 'lake', cat: 'walk', subtype: 'Waterfall walk',
      areaId: 'angon', coords: [45.8250, 6.2210],
      summary: 'A short, shaded climb to a waterfall gorge — the cool corner on a hot afternoon.',
      duration: '2h', effort: 'easy', transport: ['car','bike'], themes: ['views','recovery'],
      difficulty: 'Short walk-up with some steps; damp rock near the falls.',
      scenic: 2, novelty: 1, group: 'all',
      weather: { rain: 'ok', shade: 'shaded', heat: 'cool', best: 'any' }, pairWith: ['angon-apero'],
      status: 'open', src: 'lac-annecy', travel: { lake: { min: 15, mode: 'car' } }
    },
    {
      id: 'semnoz-trois-lacs', title: 'Semnoz: Circuit des Trois Lacs', base: 'lake', cat: 'walk', subtype: 'Family ridge walk',
      areaId: 'semnoz', coords: [45.7970, 6.1040],
      summary: 'A very easy 5.4 km ridge stroll with a 360° panorama — Mont-Blanc, the Tournette, the Aravis, the Bauges.',
      duration: 'half', effort: 'easy', transport: ['car'], themes: ['views','recovery'],
      distanceKm: 5.4, ascentM: 140, difficulty: 'Très facile · ~1h40 · max 1644 m. Low exposure, good for everyone.',
      scenic: 3, novelty: 1, group: 'all',
      weather: { rain: 'ok', storm: 'avoid-pm', best: 'clear', note: 'High ground — check the mountain bulletin for afternoon storms.' },
      pairWith: ['semnoz-picnic'],
      status: 'open', availability: 'Snow-free summer; fully open in August.', src: 'trois-lacs',
      travel: { lake: { min: 30, mode: 'car' } }
    },
    {
      id: 'glieres-walk', title: 'Plateau des Glières: monument & museum', base: 'lake', cat: 'walk', subtype: 'History & easy walk',
      areaId: 'glieres', coords: [45.9630, 6.3260],
      summary: 'An easy plateau walk to the Resistance monument, plus the Morette museum and necropolis on the way home.',
      why: 'Where the maquis made their 1944 stand — free open ground and 50 km of marked trails at ~1450 m.',
      duration: 'half', effort: 'easy', transport: ['car'], themes: ['views','culture','recovery'],
      distanceKm: 4, ascentM: 100, difficulty: 'Très facile · ~2h30 discovery loop; longer trails available.',
      scenic: 3, novelty: 2, group: 'all',
      booking: 'no', price: 'Plateau & monument free. Morette museum €3 — Tue–Sun 10:00–12:30 & 14:00–18:00, closed Mondays (17 & 24 Aug).',
      weather: { rain: 'ok', storm: 'avoid-pm', best: 'clear' },
      status: 'open', availability: 'Open; museum season to 1 Nov 2026.', src: 'glieres-sites',
      travel: { lake: { min: 45, mode: 'car' } }, media: { photo: 'assets/wiki/glieres.jpg' }
    },
    {
      id: 'parmelan', title: 'Plateau du Parmelan', base: 'lake', cat: 'hike', subtype: 'Karst plateau hike',
      areaId: 'annecy', coords: [45.9710, 6.2240],
      summary: 'A moderate hike onto a dramatic limestone karst plateau with a big horizon — but tricky footing and a damaged access road.',
      why: 'The Grande Glacière cave up top still holds ice in August, and the 1880s refuge does lunch.',
      duration: 'full', effort: 'moderate', transport: ['car'], themes: ['views'],
      distanceKm: 9, ascentM: 400, difficulty: 'Moderate · ~3h15 · max 1820 m, from Chalet de l’Anglettaz. Crosses lapiaz (fissured limestone).',
      scenic: 3, novelty: 2, group: 'some', groupNote: 'Not for young children or in wet/foggy weather; the karst is easy to turn an ankle on.',
      safety: 'The 4 km access road to the Anglettaz parking is badly damaged — unsuitable for low cars; an alternative start from Villaz lengthens the hike.',
      weather: { rain: 'poor', storm: 'avoid-pm', wetUnsafe: true, best: 'clear', note: 'Officially discouraged in wet or foggy weather.' },
      status: 'seasonal', availability: 'Snow-free summer.', verifyBeforeGo: true, src: 'parmelan',
      travel: { lake: { min: 40, mode: 'car' } }
    },

    /* ===== ADRENALINE: via ferrata / canyoning / paragliding ===== */
    {
      id: 'jallouvre-viaferrata', title: 'Via Ferrata de la Tour du Jallouvre', base: 'lake', cat: 'viaferrata', subtype: 'Via ferrata (AD–D+)',
      areaId: 'aravis', coords: [45.9700, 6.4600],
      summary: 'Serious mountain via ferrata above Le Grand-Bornand — graded AD to D+, free to climb with your own kit.',
      why: 'The area’s flagship via ferrata — serious, spectacular and confirmed open all season 2026. (The shorter Thônes crag route turned out to be open too — see the map.)',
      duration: 'full', effort: 'big', transport: ['car'], themes: ['adrenaline','views'],
      ascentM: 590, difficulty: 'AD up to D+ by variant · 20–30 min approach · 5–6 h round trip. Serious mountain terrain.',
      scenic: 3, novelty: 3, group: 'some', groupNote: 'Experienced parties can self-guide; a guide is recommended for a first via ferrata.',
      skill: 'Head for heights and via-ferrata experience for the harder sections.',
      gear: 'Via-ferrata lanyard set + helmet required (hire from the Bureau des Guides).',
      booking: 'no', bookingUrl: 'https://en.legrandbornand.com/what-to-do/via-ferrata-la-tour-du-jallouvre-le-grand-bornand-en-5595979/', price: 'Free access; guided sessions bookable.',
      safety: 'The exit passes a pasture guarded by patou dogs — be vigilant. Early-season snow can make the descent tricky.',
      weather: { rain: 'poor', storm: 'avoid-pm', wetUnsafe: true, best: 'clear', note: 'Never in a storm or on wet rock — exposed metalwork on a mountain.' },
      status: 'open', availability: 'Season 4 Jun–1 Nov 2026 — open during the trip.', src: 'jallouvre-vf',
      travel: { lake: { min: 55, mode: 'car' } }, featured: true
    },
    {
      id: 'canyoning-angon', title: 'Angon canyoning (discovery)', base: 'lake', cat: 'canyoning', subtype: 'Guided canyon · beginner',
      areaId: 'angon', coords: [45.8250, 6.2210],
      summary: 'A guided beginner canyon by the lake: rappels, pool swims, optional jumps — ~15 min from home.',
      duration: 'half', effort: 'moderate', transport: ['car'], themes: ['adrenaline','water'],
      difficulty: '~2h30–3h incl. approach; mandatory abseils up to ~20 m; optional jumps to ~5 m; small groups. The advanced “Grande Cascade” version rappels 60 m beside the waterfall — ask the guides.',
      scenic: 3, novelty: 3, group: 'some', groupNote: 'From age 8; min 4 to run a session. Everyone must be able to swim and put their head underwater.',
      skill: 'Must swim; rappels are compulsory so some comfort at height helps; jumps are optional.',
      gear: 'Wetsuit/helmet/harness provided by the guide.',
      booking: 'required', bookingUrl: 'https://en.lac-annecy.com/activite-reservable/canyoning-angon-discovery/', price: 'From €55–60 pp',
      weather: { rain: 'poor', wetUnsafe: true, best: 'clear', note: 'Guides cancel in heavy rain / high flow. Morning gives the clearest water.' },
      status: 'seasonal', availability: 'Runs May–September, conditions permitting.', verifyBeforeGo: true, src: 'canyon-angon',
      travel: { lake: { min: 15, mode: 'car' } }, featured: true
    },
    {
      id: 'canyoning-montmin', title: 'Montmin canyoning (sporty)', base: 'lake', cat: 'canyoning', subtype: 'Guided canyon · intermediate',
      areaId: 'talloires', coords: [45.8200, 6.2200],
      summary: 'The sportier neighbour to Angon — 12 obligatory jumps of 2–7 m plus slides and rappels. Not for beginners.',
      duration: 'half', effort: 'big', transport: ['car'], themes: ['adrenaline','water'],
      difficulty: '~3h half-day; canyon ~1.2 km; “confirmé”. 12 compulsory jumps (2–7 m).',
      scenic: 3, novelty: 3, group: 'some', groupNote: 'From age 12; you must be willing to jump — not advised with vertigo or no canyoning experience.',
      skill: 'Swim, sure footing and comfort with compulsory jumps.',
      booking: 'required', bookingUrl: 'https://www.annecyguidesmontagne.com/aventures/canyon-montmin-sportif', price: 'From €70 pp',
      weather: { rain: 'poor', wetUnsafe: true, best: 'clear', note: 'Cancelled in high water; June–September only.' },
      status: 'seasonal', availability: 'Runs ~June–September, conditions permitting.', verifyBeforeGo: true, src: 'canyon-montmin',
      travel: { lake: { min: 15, mode: 'car' } }
    },
    {
      id: 'paragliding-forclaz', title: 'Tandem paragliding from the Forclaz', base: 'lake', cat: 'paragliding', subtype: 'Tandem flight',
      areaId: 'forclaz', coords: [45.8070, 6.2440],
      summary: 'A tandem flight off the Col de la Forclaz launch, floating down to the Doussard field with the whole lake below.',
      duration: '2h', effort: 'easy', transport: ['car'], themes: ['adrenaline','views'],
      difficulty: '~12 min airtime (longer flights available); no fitness needed.',
      scenic: 3, novelty: 3, group: 'all', groupNote: 'From age 5; weight limits apply — mention over ~100 kg when booking.',
      booking: 'recommended', bookingUrl: 'https://annecy.takamaka.fr/fr/p/parapente-annecy',
      price: 'Classic ~€100; child from €85; performance flights €135–160; +€30 photos. Shuttle up ~€15.',
      weather: { rain: 'poor', wind: 'light-only', storm: 'avoid-pm', wetUnsafe: false, best: 'clear', note: 'Flies only in fair weather with light wind. Mornings are calmest/best for nervous flyers; afternoons are bumpier with bigger thermals.' },
      status: 'operator-active', availability: 'Operators fly Apr–Oct; each flight is day-by-day weather-dependent.', verifyBeforeGo: true, src: 'parapente',
      travel: { lake: { min: 25, mode: 'car' } }, featured: true, media: { photo: 'assets/wiki/forclaz.jpg' }
    },
    {
      id: 'accrobranche-talloires', title: 'Treetop adventure park (Talloires)', base: 'lake', cat: 'family', subtype: 'Accrobranche',
      areaId: 'talloires', coords: [45.8400, 6.2100],
      summary: 'Harnessed tree-top courses and zip-lines above Talloires — the low-stakes adrenaline option, ~15 min away.',
      duration: 'half', effort: 'moderate', transport: ['car'], themes: ['adrenaline'],
      difficulty: 'Courses by height 1.00–1.40 m+; 11 ziplines including one out over the lake; new 2026 “Swing Jump”; harness-free net course too.',
      scenic: 2, novelty: 2, group: 'all',
      booking: 'recommended', price: '€17–27 (courses), €5–10 (activities).',
      weather: { rain: 'ok', shade: 'shaded', best: 'any' },
      status: 'seasonal', availability: 'Open 28 Mar–15 Nov 2026.', src: 'accro-talloires',
      travel: { lake: { min: 15, mode: 'car' } }
    },

    /* ===== FOOD, MARKETS, CULTURE (lake base) ===== */
    {
      id: 'annecy-market', title: 'Annecy old-town market & picnic', base: 'lake', cat: 'food', subtype: 'Market',
      areaId: 'annecy', coords: [45.8990, 6.1260],
      summary: 'The Tue/Fri/Sun morning market along rue Sainte-Claire — the best picnic-supply run of the trip.',
      duration: '2h', effort: 'easy', transport: ['bike','busboat','car'], themes: ['food'],
      scenic: 2, novelty: 1, group: 'all',
      access: 'Tuesday is food-only; Friday & Sunday are bigger. Arrive before ~8:30 to beat the crowds. In the window: Fri 14/21/28, Sun 16/23, Tue 18/25.',
      weather: { rain: 'ok', best: 'any' }, pairWith: ['east-shore-ride','pierre-gay','halles-haras'],
      status: 'open', src: 'annecy-market', travel: { lake: { min: 12, mode: 'bike/bus' } }, featured: true, media: { photo: 'assets/wiki/annecy-market.jpg' }
    },
    {
      id: 'halles-haras', title: 'Les Halles du Haras (food hall)', base: 'lake', cat: 'food', subtype: 'Covered food hall',
      areaId: 'annecy', coords: [45.9010, 6.1250],
      summary: 'A brand-new 2026 covered food hall at Le Haras — 24 producers, Savoyard cheese and charcuterie, bars and food-court seating.',
      duration: '2h', effort: 'easy', transport: ['bike','busboat','car'], themes: ['food','rainy','recovery'],
      scenic: 1, novelty: 3, group: 'all',
      booking: 'no', price: 'Walk-in.',
      access: '13 rue de la Paix, Annecy. Tue–Thu 8:00–21:00, Fri–Sat 8:00–23:00, Sun 8:00–16:00, closed Mondays.',
      weather: { rain: 'good', best: 'any', note: 'Indoor — a strong rainy-day or recovery lunch.' },
      pairWith: ['musee-cinema','annecy-market'],
      status: 'open', availability: 'Opened June 2026.', src: 'halles-haras', travel: { lake: { min: 12, mode: 'bike/bus' } }, featured: true
    },
    {
      id: 'musee-cinema', title: 'Musée du cinéma d’animation', base: 'lake', cat: 'culture', subtype: 'Museum',
      areaId: 'annecy', coords: [45.9010, 6.1250],
      summary: 'France’s first animation-film museum, newly opened at Le Haras — a genuinely good rainy-day or rest-day plan.',
      duration: 'half', effort: 'recovery', transport: ['bike','busboat','car'], themes: ['culture','rainy','recovery'],
      scenic: 1, novelty: 3, group: 'all',
      booking: 'recommended', price: 'Adult €9, youth €5.50, under 3 free; +€5 guided tour.',
      access: 'Le Haras, next to the Halles. Tue–Sun 10:00–18:00, closed Mondays (17 & 24 Aug), last entry 45 min before.',
      weather: { rain: 'good', best: 'any' }, pairWith: ['halles-haras'],
      status: 'open', availability: 'Open all year exc. 1 Jan / 1 May / 25 Dec; temporary show to 31 Jan 2027.', src: 'musee-anim',
      travel: { lake: { min: 12, mode: 'bike/bus' } }
    },
    {
      id: 'chateau-palais', title: 'Château d’Annecy & Palais de l’Île', base: 'lake', cat: 'culture', subtype: 'Museums',
      areaId: 'annecy', coords: [45.8985, 6.1270],
      summary: 'The hilltop castle-museum and the ship-shaped island monument on the Thiou — the old town’s two set-pieces.',
      duration: 'half', effort: 'easy', transport: ['bike','busboat','car'], themes: ['culture','rainy'],
      scenic: 2, novelty: 1, group: 'all',
      booking: 'no', price: 'Summer 10:30–18:00. Château €7 (red. €4); Palais €5; combined ticket €9. Under 12 free.',
      access: 'Uphill walk to the château. Tuesday closure is disputed across sources — safest to avoid Tue 18 & 25 Aug.',
      weather: { rain: 'ok', best: 'any' }, pairWith: ['annecy-market','pierre-gay'],
      status: 'open', availability: 'Summer season 1 Jun–30 Sep.', verifyBeforeGo: true, src: 'musees-annecy',
      travel: { lake: { min: 12, mode: 'bike/bus' } }
    },
    {
      id: 'gorges-fier', title: 'Gorges du Fier', base: 'lake', cat: 'culture', subtype: 'Slot-canyon walkway',
      areaId: 'annecy', coords: [45.8970, 6.0450],
      summary: 'A walkway bolted into a narrow river canyon west of Annecy — cool, shaded and dramatic, good even when it’s grey.',
      duration: 'half', effort: 'easy', transport: ['car'], themes: ['culture','rainy','views'],
      scenic: 3, novelty: 2, group: 'all',
      booking: 'no', price: 'Adult €6, child 7–15 €3, under 7 free.',
      access: 'Daily to 15 Oct 2026; August 9:30–19:15 (last entry 18:15). Pair with the château next door.',
      facilities: 'No strollers; baby carriers for non-walking children.',
      weather: { rain: 'good', shade: 'shaded', heat: 'cool', best: 'any', note: 'A great hot-day or light-rain option.' },
      status: 'open', availability: 'Season 15 Mar–15 Oct 2026.', src: 'gorges-fier',
      travel: { lake: { min: 25, mode: 'car' } }, media: { photo: 'assets/wiki/gorges-fier.jpg' }
    },
    {
      id: 'pierre-gay', title: 'Cheese run: Fromagerie Pierre Gay', base: 'lake', cat: 'food', subtype: 'Cheese shop',
      areaId: 'annecy', coords: [45.8990, 6.1270],
      summary: 'The old-town affineur with ~100 cheeses and aging caves under a glass floor — the spontaneous picnic-cheese stop.',
      duration: '2h', effort: 'easy', transport: ['bike','busboat','car'], themes: ['food'],
      scenic: 1, novelty: 1, group: 'all',
      booking: 'no', access: 'Mon 10–12 & 14–18, Tue–Sat 8–19, closed Sunday — pair with the Tue/Fri market, not the Sunday one.',
      weather: { rain: 'good', best: 'any' }, pairWith: ['annecy-market'],
      status: 'open', verifyBeforeGo: true, src: 'pierre-gay', travel: { lake: { min: 12, mode: 'bike/bus' } }
    },
    {
      id: 'cave-tasting', title: 'Cheese-cave visit & tasting', base: 'lake', cat: 'food', subtype: 'Guided tasting · book ahead',
      areaId: 'annecy', coords: [45.8985, 6.1270],
      summary: 'A guided hour in the limestone aging cellars under the château, ending with cave-aged cheeses and Savoie wines.',
      duration: '2h', effort: 'easy', transport: ['bike','busboat','car'], themes: ['food','culture'],
      scenic: 1, novelty: 3, group: 'all', groupNote: 'Includes wine — adult-oriented. Min 2 people.',
      booking: 'required', bookingUrl: 'https://www.lac-annecy.com/alti_alliance_post/visite-de-cave-et-atelier-degustation/', price: '€45/adult, €10/child',
      weather: { rain: 'good', best: 'any' },
      status: 'operator-active', availability: 'Bookable via the tourism office; confirm August slots.', verifyBeforeGo: true, src: 'cave-michel',
      travel: { lake: { min: 12, mode: 'bike/bus' } }
    },
    {
      id: 'veyrier-market', title: 'Veyrier village market & food trucks', base: 'lake', cat: 'food', subtype: 'Local market',
      areaId: 'veyrier', coords: [45.8830, 6.1717],
      summary: 'The home-village Friday-morning market plus summer 2026 food trucks — spontaneous supplies minutes from the house.',
      duration: '2h', effort: 'easy', transport: ['walk','bike'], themes: ['food','recovery'],
      scenic: 1, novelty: 1, group: 'all',
      access: 'Friday mornings (Fri 21 & 28 Aug); food trucks at Place de la Poste and, in summer 2026, by the mairie and on the Chavoires peninsula.',
      weather: { rain: 'ok', best: 'any' }, pairWith: ['home-swim'],
      status: 'open', src: 'veyrier-market', travel: { lake: { min: 3, mode: 'walk' } }
    },
    {
      id: 'savoyard-night', title: 'One Savoyard cheese night', base: 'lake', cat: 'food', subtype: 'Evening',
      areaId: 'veyrier', coords: [45.8830, 6.1717],
      summary: 'Tartiflette, raclette or fondue — once, on a cooler evening, ideally after a big day out.',
      duration: 'evening', effort: 'recovery', transport: ['walk','car'], themes: ['food','recovery'],
      scenic: 1, novelty: 1, group: 'all',
      weather: { rain: 'good', best: 'any', note: 'Save it for a grey or post-ride evening — heavy in the heat.' },
      status: 'open', src: 'lac-annecy', travel: { lake: { min: 0, mode: 'at home / in the village' } }
    },
    {
      id: 'pool-bbq', title: 'Pool + BBQ at Casa Elisa', base: 'lake', cat: 'recovery', subtype: 'Rest day · week 3 only',
      areaId: 'veyrier', coords: [45.87580, 6.18525], stayOnly: 'stay-casa-elisa',
      summary: 'The private pool, terrace and barbecue at the second house — a proper rest day with lake views and zero logistics.',
      duration: 'full', effort: 'recovery', transport: ['walk'], themes: ['recovery','food'],
      scenic: 2, novelty: 1, group: 'all',
      weather: { rain: 'ok', best: 'clear' },
      status: 'open', availability: 'Only during the 22–29 Aug stay (Casa Elisa).', src: 'lac-annecy',
      travel: { lake: { min: 0, mode: 'at the house' } }
    },
    {
      id: 'semnoz-picnic', title: 'Semnoz ridge picnic', base: 'lake', cat: 'walk', subtype: 'Drive-up viewpoint',
      areaId: 'semnoz', coords: [45.7970, 6.1040],
      summary: 'Drive up to the ridge for the whole lake and Mont-Blanc, spread a market picnic, wander the easy paths.',
      duration: 'half', effort: 'easy', transport: ['car','busboat'], themes: ['views','food'],
      scenic: 3, novelty: 1, group: 'all',
      access: 'Drive up or take the summer summit shuttle (daily 1 Jul–31 Aug). Family bike park, luge and tubing up top.',
      weather: { rain: 'poor', storm: 'avoid-pm', best: 'clear', note: 'Pointless in cloud — save it for a blue day.' },
      pairWith: ['annecy-market','semnoz-trois-lacs'],
      status: 'seasonal', availability: 'Station daily 4 Jul–30 Aug 2026.', src: 'semnoz-station',
      travel: { lake: { min: 30, mode: 'car' } }, media: { photo: 'assets/wiki/semnoz.jpg' }
    },
    {
      id: 'forclaz-lunch', title: 'Lunch above the lake (Forclaz)', base: 'lake', cat: 'food', subtype: 'View lunch',
      areaId: 'forclaz', coords: [45.8070, 6.2440],
      summary: 'A lawn lunch at Col de la Forclaz with the best seat on the lake and paragliders dropping in.',
      duration: 'half', effort: 'easy', transport: ['car'], themes: ['food','views'],
      scenic: 3, novelty: 1, group: 'all',
      weather: { rain: 'poor', best: 'clear' }, pairWith: ['paragliding-forclaz','menthon-pontoons'],
      status: 'open', src: 'lac-annecy', travel: { lake: { min: 25, mode: 'car' } }, media: { photo: 'assets/wiki/forclaz.jpg' }
    },
    {
      id: 'aravis-cheese', title: 'Aravis & Reblochon drive', base: 'lake', cat: 'village', subtype: 'Day trip · food',
      areaId: 'aravis', coords: [45.9040, 6.4230],
      summary: 'Mountain villages, a cheese cellar or farm and the green Aravis valleys — closer and cheaper than Chamonix.',
      duration: 'full', effort: 'easy', transport: ['car'], themes: ['food','views'],
      scenic: 3, novelty: 2, group: 'all',
      access: 'Loop La Clusaz / Le Grand-Bornand / Thônes. Note: Le Grand-Bornand is very busy 23–27 Aug (children’s festival).',
      weather: { rain: 'ok', best: 'any', note: 'Good even on a so-so day.' },
      status: 'open', verifyBeforeGo: true, src: 'lac-annecy', travel: { lake: { min: 40, mode: 'car' } }, media: { photo: 'assets/wiki/aravis-village.jpg' }
    },
    {
      id: 'chamonix-day', title: 'Chamonix (clear-day trip)', base: 'lake', cat: 'village', subtype: 'Big day trip',
      areaId: 'chamonix', coords: [45.9237, 6.8694],
      summary: 'Glaciers, the Aiguilles and a serious alpine town — go only when the summits are out.',
      duration: 'full', effort: 'moderate', transport: ['car'], themes: ['views'],
      scenic: 3, novelty: 2, group: 'all',
      access: '~1h20 each way by car (A41/A40, tolls). Check lift/Montenvers info before committing.',
      weather: { rain: 'poor', best: 'clear', note: 'Only worth it on a clear day — the whole point is the peaks.' },
      status: 'open', verifyBeforeGo: true, src: 'lac-annecy', travel: { lake: { min: 80, mode: 'car' } }, media: { photo: 'assets/wiki/chamonix.jpg' }
    },

    {
      id: 'blue-secret-packraft', title: 'Packraft: hike + paddle the Roc de Chère', base: 'lake', cat: 'paddle', subtype: 'Guided packraft · book ahead',
      areaId: 'menthon', coords: [45.8610, 6.1990],
      summary: 'Hike over the Roc de Chère headland with a packraft on your back, then paddle home beneath its cliffs and coves — the shoreline you can’t see from land.',
      why: 'The legal, brilliant way to get the “secret coves” — on the water, not off the reserve’s cliffs.',
      duration: 'half', effort: 'moderate', transport: ['car','bike'], themes: ['water','adrenaline'],
      scenic: 3, novelty: 3, group: 'all',
      booking: 'required', bookingUrl: 'https://blue-secret.com/en/annecy-english-new/', price: 'Half-day €50–70; full day €130; max 8, certified guide',
      safety: 'Roc de Chère is a protected reserve: marked paths on land and no cliff jumping — there have been fatalities. The coves are for floating and swimming.',
      weather: { rain: 'poor', wind: 'calm-am', best: 'clear' },
      status: 'operator-active', availability: 'Runs through summer — book a slot.', src: 'blue-secret',
      travel: { lake: { min: 12, mode: 'car' } }, featured: true
    },
    {
      id: 'skiwake74', title: 'Wakeboard & waterski (Skiwake 74)', base: 'lake', cat: 'paddle', subtype: 'Wake sports · Doussard',
      areaId: 'doussard', coords: [45.7761, 6.2200],
      summary: 'Coached wakeboard, wakesurf and waterski runs off the Doussard shore — plus SUP and kayak rental and a snack bar.',
      duration: '2h', effort: 'moderate', transport: ['car'], themes: ['water','adrenaline'],
      scenic: 2, novelty: 3, group: 'all',
      booking: 'recommended', bookingUrl: 'https://www.skiwake74.com/en/', price: 'Wakeboard €34–49 · wakesurf €58 · waterski €34–47',
      weather: { rain: 'poor', wind: 'calm-am', best: 'morning', note: 'Calm water is the morning — same rule as SUP.' },
      status: 'operator-active', availability: 'Season Apr–Oct, open 7/7 in summer, 7:00–21:00.', src: 'skiwake74',
      travel: { lake: { min: 25, mode: 'car' } }
    },
    {
      id: 'fonds-blancs-sup', title: 'SUP to the “Fonds Blancs” sandbanks', base: 'lake', cat: 'paddle', subtype: 'Paddle mission',
      areaId: 'st-jorioz', coords: [45.8270, 6.1730],
      summary: 'Paddle out past Saint-Jorioz to white-sand shallows with absurd turquoise water — invisible from shore, so almost nobody’s there.',
      duration: 'half', effort: 'moderate', transport: ['car','busboat'], themes: ['water'],
      scenic: 3, novelty: 3, group: 'some', groupNote: 'A real paddle — rent at NCY SUP (Sévrier port) or Le Deck, and go on a calm morning.',
      weather: { rain: 'poor', wind: 'calm-am', best: 'morning' },
      status: 'open', availability: 'The exact spot is local knowledge — ask the SUP base to point you at it.', verifyBeforeGo: true, src: 'ncy-sup',
      travel: { lake: { min: 22, mode: 'car to Sévrier' } }
    },
    {
      id: 'les-houches-bikepark', title: 'Les Houches bike park (Prarion)', base: 'lake', cat: 'mtb', subtype: 'Lift-served DH · Chamonix valley',
      areaId: 'chamonix', coords: [45.8946, 6.7816],
      summary: 'The Chamonix-valley gravity option: three DH runs and four enduro itineraries off the Prarion gondola — pair it with a Chamonix day.',
      duration: 'full', effort: 'big', transport: ['car'], themes: ['bikes','adrenaline'],
      difficulty: 'Blue “Alpages”, red “Bouquetins”, black “Chamois” + 4 enduro itineraries.',
      scenic: 3, novelty: 2, group: 'some',
      booking: 'no', price: 'MTB pass €23.50–29.40 (2026).',
      weather: { rain: 'poor', best: 'clear', note: 'Many Chamonix-valley singletracks close to bikes in July–August for hiker priority — stick to the marked park.' },
      status: 'seasonal', availability: 'Prarion gondola daily 9:15–17:00, 20 Jun–30 Aug 2026.', src: 'leshouches',
      travel: { lake: { min: 80, mode: 'car' } }
    },

    /* ===== LES GETS (leg 1, Aug 12–15) ===== */
    {
      id: 'lesgets-bikepark', title: 'Les Gets Bike Park', base: 'lesgets', cat: 'mtb', subtype: 'Lift-served · all levels',
      areaId: 'les-gets', coords: [46.1558, 6.6697],
      summary: 'A 128 km bike park across two mountains from the front door — flow and progression on Chavannes, roots and tech on Mont Chéry.',
      why: 'The whole reason to start here: every lift open across the stay, beginner to expert, plus a strong e-MTB and enduro offer.',
      duration: 'full', effort: 'big', transport: ['walk','car'], themes: ['bikes','adrenaline'],
      difficulty: '18 DH trails, 6 enduro itineraries, 5 e-MTB trails (50+ km), 3 bike lifts. Chavannes = flow/progression; Mont Chéry = technical/advanced.',
      scenic: 2, novelty: 2, group: 'some', groupNote: 'Green flow to expert tech — riders split by level and regroup at the lift.',
      booking: 'recommended', price: 'Web 2026: Les Gets VTT day €35; Portes du Soleil multi-resort day €39; 6 rental/repair shops in resort.',
      access: 'Lifts from the village (walk from the apartment). High season Chavannes 09:00–17:30.',
      facilities: 'e-MTB charging points; bike hire incl. DH rigs and pads at 360 Outdoor, LoisiBike, Intersport — book ahead.',
      weather: { rain: 'poor', ground: 'greasy when wet', best: 'clear' },
      pairWith: ['lesgets-village'], easierAlt: 'lesgets-lift-walk',
      status: 'open', availability: 'Full bike-park season 19 Jun–13 Sep 2026 (Mont Chéry to 30 Aug) — every lift open 12–15 Aug.', src: 'lesgets-bikepark',
      travel: { lesgets: { min: 5, mode: 'walk to the lift' } }, featured: true, media: { photo: 'assets/wiki/les-gets-mtb.jpg' }
    },
    {
      id: 'lesgets-lift-walk', title: 'Lift up, walk the ridge (Mont Chéry)', base: 'lesgets', cat: 'walk', subtype: 'Non-bike option',
      areaId: 'les-gets', coords: [46.1500, 6.6600],
      summary: 'For anyone not riding downhill: ride the Mont Chéry cable car for the panorama and walk the quieter side.',
      duration: 'half', effort: 'easy', transport: ['walk','car'], themes: ['views','recovery'],
      scenic: 3, novelty: 1, group: 'all',
      booking: 'no', price: 'Pedestrian single lift ~€10.',
      weather: { rain: 'poor', storm: 'avoid-pm', best: 'clear' },
      status: 'open', availability: 'Mont Chéry runs daily to 30 Aug 2026.', src: 'lesgets-bikepark',
      travel: { lesgets: { min: 5, mode: 'walk to the lift' } }
    },
    {
      id: 'lesgets-village', title: 'Les Gets village evening', base: 'lesgets', cat: 'village', subtype: 'Village & food',
      areaId: 'les-gets', coords: [46.1558, 6.6697],
      summary: 'A small wooden alpine town with terraces, shops and mountain views — the low-key evening with no drive.',
      duration: 'evening', effort: 'recovery', transport: ['walk'], themes: ['food','recovery'],
      scenic: 2, novelty: 1, group: 'all',
      weather: { rain: 'ok', best: 'any' },
      status: 'open', src: 'lesgets-tarifs', travel: { lesgets: { min: 3, mode: 'walk' } }, media: { photo: 'assets/wiki/les-gets-village.jpg' }
    },
    {
      id: 'lesgets-grocery', title: 'Stock up before the lake', base: 'lesgets', cat: 'food', subtype: 'Practical',
      areaId: 'les-gets', coords: [46.1558, 6.6697],
      summary: 'Do the big grocery run in Les Gets before the Saturday drive down — arrival day is a Saturday in August.',
      duration: '2h', effort: 'recovery', transport: ['walk','car'], themes: ['food'],
      scenic: 1, novelty: 1, group: 'all',
      status: 'open', src: 'lesgets-tarifs', travel: { lesgets: { min: 3, mode: 'walk' } }
    },
    {
      id: 'lesgets-road-ride', title: 'Road ride from Les Gets', base: 'lesgets', cat: 'road', subtype: 'Road · verify route',
      areaId: 'les-gets', coords: [46.1558, 6.6697],
      summary: 'Portes-du-Soleil road country — Col de l’Encrenaz and the Joux Plane are close for a big morning on the road bike.',
      duration: 'half', effort: 'big', transport: ['bike'], themes: ['bikes','views'],
      difficulty: 'Serious cols nearby; exact stats not verified here — plan the route before riding.',
      scenic: 3, novelty: 2, group: 'some',
      weather: { rain: 'ok', storm: 'avoid-pm', best: 'clear' },
      status: 'open', availability: 'Roads open in summer; confirm the specific col/route yourself.', verifyBeforeGo: true, src: 'lesgets-tarifs',
      travel: { lesgets: { min: 2, mode: 'from the door' } }
    }
,

    /* ===== EXPANSION SWEEP (researched + verified 2026-07-26) ===== */
    {
      id: 'esperance-barge', title: 'Sail the Espérance III (1911 barge rebuild)', base: 'lake', cat: 'boat', subtype: 'Historic lateen barge · 2 h',
      areaId: 'annecy', coords: [45.8984, 6.1306],
      summary: 'Two hours under huge lateen sails on a faithful rebuild of the barque that hauled wine from Veyrier’s own vineyards.',
      why: 'Zero effort, maximum story — and the Thursday 20 Aug combo pairs the sail with a guided Bout-du-Lac reserve walk.',
      duration: '2h', effort: 'recovery', transport: ['car','busboat','bike'], themes: ['water','views','recovery'],
      booking: 'required', bookingUrl: 'https://esperance3.org/6-sorties-grand-public/', price: '€30 adult',
      scenic: 3, novelty: 3, group: 'all',
      weather: { rain: 'poor', wind: 'depends', best: 'clear', note: 'Sailings are weather-dependent — they confirm by email.' },
      status: 'open', availability: 'Public sailings all summer from the Thiou canal; Doussard combo runs Thu 20 Aug 2026.', src: 'esperance3'
    },
    {
      id: 'vboat-electric', title: 'Skipper your own electric boat (Petit Port)', base: 'lake', cat: 'boat', subtype: 'No-licence 6-seater',
      areaId: 'annecy', coords: [45.9050, 6.1489],
      summary: 'Drive yourselves: a silent 6-seater from Petit Port, 10 minutes from home — putter to Menthon or under the Roc de Chère with a cooler aboard.',
      why: 'The classic group hit. Same base rents slide-pedalos, so the fleet can mix.',
      duration: '2h', effort: 'recovery', transport: ['car','bike','busboat'], themes: ['water','views','recovery'],
      booking: 'recommended', bookingUrl: 'https://v-boat.fr/tarifs', price: '€75/1 h · €150/2 h per boat; slide pedalo from €26/30 min',
      scenic: 3, novelty: 2, group: 'all',
      weather: { rain: 'poor', best: 'clear' },
      status: 'open', availability: 'Open 7/7, 9:00–19:00, April–September 2026.', src: 'vboat'
    },
    {
      id: 'libellule-dinner', title: 'Dinner cruise on the electric MS Libellule', base: 'lake', cat: 'boat', subtype: 'Evening cruise · 2 h',
      areaId: 'annecy', coords: [45.8979, 6.1305],
      summary: 'Two hours gliding the whole lake at dusk on a fully glazed electric catamaran, three-course menu included — you sail silently past your own beach.',
      duration: 'evening', effort: 'recovery', transport: ['car','busboat'], themes: ['water','food','views'],
      booking: 'required', bookingUrl: 'https://www.bateaux-annecy.com/restaurant-cruises/dinner-cruise/', price: 'From €69.90 pp (drinks extra)',
      scenic: 3, novelty: 2, group: 'all',
      weather: { rain: 'good', best: 'any', note: 'Fully glazed — a genuinely great rainy-evening move.' },
      status: 'open', availability: 'Boards 19:30 at Quai de la Tournette; season 30 Mar – 1 Nov 2026.', src: 'libellule'
    },
    {
      id: 'essaonia-kayak', title: 'Guided sea-kayak half-day', base: 'lake', cat: 'paddle', subtype: 'Guided · 10 km',
      areaId: 'st-jorioz', coords: [45.8412, 6.1755],
      summary: 'Proper sea kayaks and a guide threading the Roc de Chère shoreline, Château de Duingt and the reed marshes — all kit included.',
      why: 'A different animal from renting a SUP — rest-day cardio with a local who knows every cove.',
      duration: 'half', effort: 'moderate', transport: ['car','bike'], themes: ['water','views'],
      booking: 'required', bookingUrl: 'https://www.essaonia.net/activites/kayak-de-mer-lac-annecy-demi-journee/', price: '€65 pp half-day',
      scenic: 3, novelty: 2, group: 'all', skill: 'Must swim; no kayak experience needed.',
      weather: { rain: 'ok', wind: 'depends', best: 'calm mornings' },
      status: 'open', availability: 'Departures 9:00 & 14:00 from La Crique, Saint-Jorioz. 2026 dates not printed — confirm when booking.', verifyBeforeGo: true, src: 'essaonia'
    },
    {
      id: 'wake-arena', title: 'Wakesurf & wakefoil at Petit Port', base: 'lake', cat: 'paddle', subtype: 'Wake boat sessions',
      areaId: 'annecy', coords: [45.9050, 6.1489],
      summary: 'Endless-wave wakesurfing or hydrofoil flying behind a dedicated wake boat, 10 minutes from home — privatise the boat and rotate riders.',
      duration: '2h', effort: 'moderate', transport: ['car','bike'], themes: ['water','adrenaline'],
      booking: 'required', bookingUrl: 'https://wakearena-annecy.com/', price: '€50/15-min session; private boat €200–740 (1–4 h)',
      scenic: 2, novelty: 3, group: 'all', skill: 'They teach from zero.',
      weather: { rain: 'poor', best: 'calm' },
      status: 'open', availability: 'No explicit 2026 dates published — message them before counting on it (Skiwake 74 at Doussard is the fallback).', verifyBeforeGo: true, src: 'wakearena'
    },
    {
      id: 'semnoz-luge', title: 'Luge d’été du Semnoz', base: 'lake', cat: 'family', subtype: 'Summer toboggan',
      areaId: 'semnoz', coords: [45.8034, 6.0975],
      summary: 'The mountain toboggan run on your local summit — €4 a run, no booking, 35 minutes up the hill. Pair with the Trois Lacs walk or a ridge picnic.',
      duration: '2h', effort: 'easy', transport: ['car','busboat'], themes: ['adrenaline','views'],
      booking: 'no', bookingUrl: 'https://www.semnoz.fr/luge-ete/', price: '€4/run · 5 runs €19 · 10 runs €32',
      scenic: 2, novelty: 2, group: 'all',
      weather: { rain: 'poor', best: 'dry' },
      status: 'open', availability: 'Daily 10:00–18:00, 4 Jul – 30 Aug 2026 — covers the whole stay.', src: 'semnoz-luge'
    },
    {
      id: 'ballon-cimes', title: 'Hot-air balloon over the lake', base: 'lake', cat: 'paragliding', subtype: 'Dawn balloon flight',
      areaId: 'doussard', coords: [45.7831, 6.2242],
      summary: 'Sunrise drift over the whole lake and the Tournette from a balloon out of Doussard — the one view even the paragliders don’t get.',
      duration: 'half', effort: 'recovery', transport: ['car'], themes: ['views','adrenaline'],
      booking: 'required', bookingUrl: 'https://www.ballondescimes.fr', price: '€310 pp (discount from 3 passengers) — the trip’s big-ticket splurge, flagged honestly',
      scenic: 3, novelty: 3, group: 'all',
      weather: { rain: 'poor', wind: 'depends', best: 'calm clear dawn', note: 'Flies at dawn, weather permitting — book early in the stay so there’s a re-fly window.' },
      status: 'open', availability: 'Year-round, every day, weather permitting.', src: 'ballon-cimes'
    },
    {
      id: 'ulm-microlight', title: 'Microlight lap of the lake', base: 'lake', cat: 'paragliding', subtype: 'ULM flight · 30 min',
      areaId: 'doussard', coords: [45.7765, 6.2114],
      summary: 'A 30-minute powered lap of the lake from the Doussard airfield — the drone shot, but you’re in it. Cheaper and more scheduleable than the balloon.',
      duration: '2h', effort: 'recovery', transport: ['car'], themes: ['views','adrenaline'],
      booking: 'required', bookingUrl: 'https://www.deltaevasion.com/', price: 'Tour du Lac ~€160 pp; shorter flights less',
      scenic: 3, novelty: 3, group: 'some', groupNote: 'One passenger per machine — rotate.',
      weather: { rain: 'poor', wind: 'depends', best: 'clear' },
      status: 'open', availability: 'Daily 9:00–20:00, April–October.', src: 'delta-evasion'
    },
    {
      id: 'vf-pollet-villard', title: 'Via Ferrata Yves Pollet-Villard (La Clusaz)', base: 'lake', cat: 'viaferrata', subtype: 'Via ferrata (AD–D)',
      areaId: 'aravis', coords: [45.8828, 6.4569],
      summary: 'The Aravis’ other big via ferrata, free to climb above the Combe de Borderan — confirmed open for 2026 after its safety inspection.',
      duration: 'half', effort: 'big', transport: ['car'], themes: ['adrenaline','views'],
      booking: 'no', bookingUrl: 'https://www.laclusaz.com/en/details/yves-pollet-villard-via-ferrata/', price: 'Free; kit hire in La Clusaz; guides via guides-des-aravis.com',
      scenic: 3, novelty: 2, group: 'some', skill: 'Head for heights; lanyard set + helmet required.',
      weather: { rain: 'poor', storm: 'avoid', wetUnsafe: true, best: 'dry' },
      status: 'open', availability: 'Open 6 May – 14 Nov 2026 (laclusaz.com).', src: 'vf-pollet'
    },
    {
      id: 'climbing-initiation', title: 'Learn to climb with the Bureau des Guides', base: 'lake', cat: 'viaferrata', subtype: 'Rock climbing · guided',
      areaId: 'annecy', coords: [45.8852, 6.1302],
      summary: 'A private guide on the crags above the lake — Grande Jeanne, Bluffy, Angon — all within 15 minutes of home. Real rock, zero faff.',
      duration: 'half', effort: 'moderate', transport: ['car','bike'], themes: ['adrenaline','views'],
      booking: 'required', bookingUrl: 'https://www.annecyguidesmontagne.com/escalade', price: 'Private guide from ~€200/half-day (~€50 a head for 4)',
      scenic: 2, novelty: 3, group: 'all', skill: 'None needed — initiation is the point.',
      weather: { rain: 'poor', wetUnsafe: true, best: 'dry' },
      status: 'open', availability: '2026 programme published; book ahead in August.', src: 'guides-annecy'
    },
    {
      id: 'caving-diau', title: 'Caving in the Grotte de la Diau', base: 'lake', cat: 'canyoning', subtype: 'Guided caving · half-day',
      areaId: 'glieres', coords: [45.9580, 6.2831],
      summary: 'Headtorches, underground rivers and proper cave passages under the Parmelan cliffs — the mountain you’ll have already walked on top of.',
      duration: 'half', effort: 'moderate', transport: ['car'], themes: ['adrenaline','rainy'],
      booking: 'required', bookingUrl: 'https://www.terreo-canyoning.com/activite/speleologie-la-diau-decouverte-a-annecy/', price: '€55 pp (€50 each from 4 — you qualify)',
      scenic: 2, novelty: 3, group: 'all', skill: 'Fitness to scramble; no experience needed.',
      weather: { rain: 'good', note: 'Underground — rain-proof by definition, though heavy storms can close it (water levels).' },
      status: 'open', availability: 'Online booking live for summer 2026 — pick a slot on their calendar.', verifyBeforeGo: true, src: 'terreo-diau'
    },
    {
      id: 'emtb-guidon', title: 'Guided e-MTB singletrack on the Semnoz', base: 'lake', cat: 'mtb', subtype: 'Guided e-MTB · half-day',
      areaId: 'semnoz', coords: [45.9157, 6.1060],
      summary: 'A guide, an e-MTB and the Semnoz’s singletrack — the way to get the non-MTBers into the woods without destroying them.',
      duration: 'half', effort: 'moderate', transport: ['car'], themes: ['bikes','views'],
      booking: 'required', bookingUrl: 'https://www.guidonmtb.com/activite/sortie-vtt-electrique/', price: '€90 pp incl. e-MTB, helmet, gloves',
      scenic: 2, novelty: 2, group: 'all',
      weather: { rain: 'ok', best: 'dry' },
      status: 'open', availability: 'Summer tours offered; 2026 dates by phone — confirm when booking.', verifyBeforeGo: true, src: 'guidon-mtb'
    },
    {
      id: 'vitam-aquapark', title: 'Vitam aqua zone (Neydens)', base: 'lake', cat: 'family', subtype: 'Indoor waterpark',
      areaId: 'annecy', where: 'Neydens', coords: [46.1228, 6.0968],
      summary: 'The region’s big indoor waterpark — slides, wave pool, outdoor lagoon — 35 minutes north. The nuclear option for a truly wet day.',
      duration: 'half', effort: 'easy', transport: ['car'], themes: ['water','rainy'],
      booking: 'no', bookingUrl: 'https://ucpavitam.fr/fr/infos-pratiques/tarifs/aquatique', price: '€25/4 h · €29/day (high season)',
      scenic: 1, novelty: 2, group: 'all',
      weather: { rain: 'good', note: 'This is what it’s for.' },
      status: 'open', availability: 'Open daily; 2026 tariffs live on ucpavitam.fr.', src: 'vitam'
    },
    {
      id: 'karting-rumilly', title: 'Outdoor karting at Rumilly', base: 'lake', cat: 'family', subtype: '1,150 m outdoor circuit',
      areaId: 'annecy', where: 'Rumilly', coords: [45.8467, 5.9686],
      summary: 'A proper 1,150 m outdoor circuit 35 minutes west — 10-minute sessions, two kart classes, four riders, one championship.',
      duration: '2h', effort: 'easy', transport: ['car'], themes: ['adrenaline'],
      booking: 'recommended', bookingUrl: 'https://www.kartingrumilly.fr/tarifs-location-karting-rumilly/', price: '€27–30 per 10-min session',
      scenic: 1, novelty: 2, group: 'all',
      weather: { rain: 'poor', best: 'dry' },
      status: 'open', availability: 'Open 7/7, 9:00–19:00.', src: 'karting-rumilly'
    },
    {
      id: 'escape-grande-evasion', title: 'Escape rooms: La Grande Évasion', base: 'lake', cat: 'family', subtype: 'Escape game · 1 h',
      areaId: 'annecy', coords: [45.8915, 6.1105],
      summary: 'Annecy’s big escape-room house in Seynod — four brains, one locked room, rain outside irrelevant.',
      duration: '2h', effort: 'recovery', transport: ['car'], themes: ['rainy'],
      booking: 'required', bookingUrl: 'https://www.la-grande-evasion.com/annecy/', price: '€124 for 4 (€31 pp)',
      scenic: 1, novelty: 2, group: 'all',
      weather: { rain: 'good' },
      status: 'open', availability: 'Book ~a week ahead in August.', src: 'grande-evasion'
    },
    {
      id: 'menthon-chateau', title: 'Château de Menthon — visit & theatrical nocturnes', base: 'lake', cat: 'culture', subtype: 'Castle · 10 min from home',
      areaId: 'menthon', coords: [45.86397, 6.20360],
      summary: 'The thousand-year fairytale castle on your own shore — still lived in by the Menthon family. Wednesday nights in August it opens after dark with costumed theatrical tours.',
      why: 'You look at it from the pontoon every day; go inside once — ideally by candlelight.',
      duration: '2h', effort: 'recovery', transport: ['car','bike','walk'], themes: ['rainy','views','food'],
      booking: 'recommended', bookingUrl: 'https://www.chateau-de-menthon.com/evenements/visites-nocturnes-theatralisees/', price: 'Day €12; nocturne €18 (limited places — presale on Billetweb)',
      scenic: 3, novelty: 2, group: 'all',
      weather: { rain: 'good' },
      status: 'open', availability: 'Daily 10:00–19:00 in Jul–Aug 2026; nocturnes Wednesdays.', src: 'menthon-chateau'
    },
    {
      id: 'tamie-abbey', title: 'Abbaye de Tamié — Trappist cheese at the source', base: 'lake', cat: 'food', subtype: 'Working abbey + farm shop',
      areaId: 'doussard', where: 'Plancherine · Col de Tamié', coords: [45.68722, 6.30363],
      summary: 'Buy Tamié from the monks who made it, in the abbey where it’s been made since 1132 — free entry, a film on the cheese, and mountain silence.',
      duration: 'half', effort: 'recovery', transport: ['car'], themes: ['food','views'],
      booking: 'no', bookingUrl: 'https://www.abbaye-tamie.com/informations-pratiques', price: 'Free entry; cheese at farm-shop prices',
      scenic: 2, novelty: 3, group: 'all',
      weather: { rain: 'good' },
      status: 'open', availability: 'Shop Mon–Sat 9:30–12:30 & 13:30–18:30, Sun from 11:45. ~40 min via Faverges — pairs with the south-lake greenway.', src: 'tamie'
    },
    {
      id: 'jardins-secrets', title: 'Jardins Secrets (Vaulx)', base: 'lake', cat: 'culture', subtype: 'Hand-built gardens',
      areaId: 'annecy', where: 'Vaulx', coords: [45.91871, 5.98653],
      summary: 'One family spent 40 years hand-building a labyrinth of Moorish courtyards, painted galleries and rose gardens in the middle of farmland. Genuinely odd, genuinely lovely.',
      duration: '2h', effort: 'recovery', transport: ['car'], themes: ['rainy','recovery'],
      booking: 'no', bookingUrl: 'https://www.jardins-secrets.com/informations-pratiques/', price: '€10 adult',
      scenic: 2, novelty: 3, group: 'all',
      weather: { rain: 'ok' },
      status: 'open', availability: 'Daily 10:30–17:00 until 23 Aug 2026, then 13:30–18:00.', src: 'jardins-secrets'
    },
    {
      id: 'montrottier', title: 'Château de Montrottier — the collector’s castle', base: 'lake', cat: 'culture', subtype: 'Castle of curiosities',
      areaId: 'annecy', coords: [45.89836, 6.03866],
      summary: 'A medieval keep stuffed with one obsessive collector’s armour, ivories and oddities — two minutes from the Gorges du Fier, so do both.',
      duration: '2h', effort: 'recovery', transport: ['car'], themes: ['rainy'],
      booking: 'no', bookingUrl: 'https://www.chateaudemontrottier.com/visite/', price: '€10 adult, short guided tours included',
      scenic: 2, novelty: 2, group: 'all', pairWith: ['gorges-fier'],
      weather: { rain: 'good' },
      status: 'open', availability: 'Daily in Jul–Aug 2026; season to 31 Oct.', src: 'montrottier'
    },
    {
      id: 'mija-food-tour', title: 'Old-town food tour (Mija)', base: 'lake', cat: 'food', subtype: 'Guided eating walk',
      areaId: 'annecy', coords: [45.8984, 6.1277],
      summary: 'A guided graze through old Annecy — cheese, charcuterie, lake fish, pastries — with the stories behind the stalls. All tastings included.',
      duration: 'half', effort: 'easy', transport: ['car','busboat','bike'], themes: ['food','rainy'],
      booking: 'required', bookingUrl: 'https://www.mija-food.fr/food-tour-annecy/', price: '€59.50–70 pp, tastings included',
      scenic: 2, novelty: 2, group: 'all',
      weather: { rain: 'ok' },
      status: 'open', availability: 'Live 2026 booking calendar — pick a slot.', src: 'mija'
    },

    /* ===== LES GETS LEG — expansion sweep ===== */
    {
      id: 'lesgets-luge', title: 'Luge 4 Saisons (alpine coaster)', base: 'lesgets', cat: 'family', subtype: 'Rail coaster',
      areaId: 'les-gets', coords: [46.1526, 6.6619],
      summary: 'The on-rails alpine coaster at Les Perrières — 15 minutes’ walk from the apartment. The mandatory silly hour between bike-park laps.',
      duration: '2h', effort: 'recovery', transport: ['walk','car'], themes: ['adrenaline'],
      booking: 'no', bookingUrl: 'https://pass.lesgets.com/en/4-seasons-sledge/', price: '€9/ride · 6 rides €45',
      scenic: 2, novelty: 2, group: 'all',
      weather: { rain: 'ok', note: 'Runs in light rain; closes in storms.' },
      status: 'open', availability: 'Daily 12:00–18:00, 27 Jun – 30 Aug 2026.', src: 'lesgets-luge', travel: { lesgets: { min: 15, mode: 'walk' } }
    },
    {
      id: 'fantasticable', title: 'Fantasticable — giant zipline (Châtel)', base: 'lesgets', cat: 'paragliding', subtype: 'Zipline · 100+ km/h',
      areaId: 'les-gets', where: 'Châtel · Plaine Dranse', coords: [46.2333, 6.7881],
      summary: 'Superman-position zipline across the Plaine Dranse — over a kilometre of cable at motorway speed, ~35 minutes from Les Gets.',
      duration: 'half', effort: 'recovery', transport: ['car'], themes: ['adrenaline','views'],
      booking: 'recommended', bookingUrl: 'https://www.chatel.com/en/activities/the-fantasticable-in-summer-chatel/', price: '€45 solo · €90 duo',
      scenic: 3, novelty: 3, group: 'all',
      weather: { rain: 'poor', wind: 'depends', best: 'dry' },
      status: 'open', availability: 'Daily 12 Jul – 23 Aug 2026, 09:30–16:45 — covers the Les Gets leg.', src: 'fantasticable', travel: { lesgets: { min: 35, mode: 'car' } }
    },
    {
      id: 'avokart', title: 'Avokart — downhill karting (Avoriaz)', base: 'lesgets', cat: 'family', subtype: 'Gravity karts',
      areaId: 'les-gets', where: 'Avoriaz · Prodains', coords: [46.1925, 6.7703],
      summary: 'Three-wheeled gravity karts down the Avoriaz slopes — cable car up, chaos down. First run includes the Prodains Express ascent.',
      duration: '2h', effort: 'easy', transport: ['car'], themes: ['adrenaline'],
      booking: 'recommended', bookingUrl: 'https://www.skipass-avoriaz.com/infos/avokart', price: '€27 first run, €12 per re-run',
      scenic: 2, novelty: 3, group: 'all', skill: 'Min height 1.40 m.',
      weather: { rain: 'poor', best: 'dry' },
      status: 'open', availability: 'Daily 4 Jul – 30 Aug 2026, sessions hourly 10:00–12:00 & 14:00–16:00.', src: 'avokart', travel: { lesgets: { min: 30, mode: 'car' } }
    },
    {
      id: 'aquariaz', title: 'Aquariaz — tropical waterpark (Avoriaz)', base: 'lesgets', cat: 'swim', subtype: 'Indoor tropical pools',
      areaId: 'les-gets', where: 'Avoriaz', coords: [46.1912, 6.7741],
      summary: '29 °C water, real tropical plants and a halfpipe slide inside a glass hall at 1,800 m — the Les Gets-leg answer to a washout day.',
      duration: '2h', effort: 'recovery', transport: ['car'], themes: ['water','rainy','recovery'],
      booking: 'no', bookingUrl: 'https://www.avoriaz.com/en/fiche/aquariaz-tropical-paradise/', price: '€12 adult',
      scenic: 2, novelty: 2, group: 'all',
      weather: { rain: 'good' },
      status: 'open', availability: 'Sessions daily 26 Jun – 28 Aug 2026.', src: 'aquariaz', travel: { lesgets: { min: 25, mode: 'car' } }
    },
    {
      id: 'rafting-dranse', title: 'Raft the Dranse gorges', base: 'lesgets', cat: 'canyoning', subtype: 'Rafting · ~1 h on water',
      areaId: 'les-gets', where: 'Dranse gorges · near Thonon', coords: [46.3244, 6.5879],
      summary: 'The Haute-Savoie’s rafting river — a classic gorge descent ~35 minutes from Les Gets, all kit provided, departures four times a day.',
      duration: 'half', effort: 'moderate', transport: ['car'], themes: ['water','adrenaline'],
      booking: 'required', bookingUrl: 'https://an-rafting.com/prestation/rafting-haute-savoie/', price: '€52 adult',
      scenic: 3, novelty: 3, group: 'all', skill: 'Must swim.',
      weather: { rain: 'ok', storm: 'avoid', best: 'any dry day' },
      status: 'open', availability: 'Season May–September; departures 9:00/11:00/13:00/15:00.', src: 'an-rafting', travel: { lesgets: { min: 35, mode: 'car' } }
    },
    {
      id: 'nautichill-montriond', title: 'Lac de Montriond — beach, SUP & canoe', base: 'lesgets', cat: 'paddle', subtype: 'Mountain lake · 1,060 m',
      areaId: 'les-gets', where: 'Lac de Montriond', coords: [46.2090, 6.7291],
      summary: 'The emerald cliff-ringed lake 20 minutes from Les Gets, with a little SUP/canoe base right off the beach and a snack terrace.',
      why: 'The best water day of the mountain leg — bring the swim stuff.',
      duration: 'half', effort: 'easy', transport: ['car'], themes: ['water','views','recovery'],
      booking: 'no', bookingUrl: 'https://nautichill.com/', price: 'Lake free; SUP €24/h · canoe €21/h',
      scenic: 3, novelty: 2, group: 'all',
      weather: { rain: 'poor', best: 'warm' },
      status: 'open', availability: 'Rentals daily 13 Jun – 6 Sep 2026, 10:00–19:00.', src: 'nautichill', travel: { lesgets: { min: 20, mode: 'car' } }
    },
    {
      id: 'pont-du-diable', title: 'Gorges du Pont du Diable', base: 'lesgets', cat: 'culture', subtype: 'Show gorge · walkways',
      areaId: 'les-gets', where: 'La Vernaz · Dranse valley', coords: [46.3068, 6.6158],
      summary: 'Walkways bolted through a marble gorge the Dranse carved 60 m deep — the classic wet-morning wonder between Morzine and Thonon.',
      duration: '2h', effort: 'easy', transport: ['car'], themes: ['views','rainy'],
      booking: 'no', bookingUrl: 'https://www.lepontdudiable.com/informations-tarifs/', price: '€19 adult',
      scenic: 3, novelty: 2, group: 'all',
      weather: { rain: 'ok', note: 'Under the forest canopy — works in drizzle; check after big storms.' },
      status: 'open', availability: 'Open daily 4 Apr – 30 Sep 2026, 09:00 in summer.', src: 'pont-diable', travel: { lesgets: { min: 30, mode: 'car' } }
    },
    {
      id: 'music-mecanique', title: 'Musée de la Musique Mécanique', base: 'lesgets', cat: 'culture', subtype: 'Village museum',
      areaId: 'les-gets', coords: [46.1609, 6.6728],
      summary: 'Les Gets’ own oddity: France’s best collection of self-playing organs, orchestrions and musical automata, demonstrated live on the guided tour.',
      duration: '2h', effort: 'recovery', transport: ['walk'], themes: ['rainy'],
      booking: 'no', bookingUrl: 'https://musicmecalesgets.org/horaires-tarifs/', price: '€10 guided tour',
      scenic: 1, novelty: 3, group: 'all',
      weather: { rain: 'good' },
      status: 'open', availability: 'Daily 14:00–19:00 through summer 2026.', src: 'music-meca', travel: { lesgets: { min: 8, mode: 'walk' } }
    }
  ];
  /* ---------- ACTIVITY MEDIA ----------------------------------------
     Every rendered photo is assigned deliberately here. Activities that
     are not listed stay text-only rather than borrowing a generic area
     image that may show the wrong place or experience. */
  const ACTIVITY_MEDIA = {
    lakeSail: { photo: 'assets/wiki/lake-swim.jpg', alt: 'Sailboats on Lake Annecy' },
    veyrier: { photo: 'assets/wiki/veyrier.jpg', alt: 'Lake Annecy at Veyrier-du-Lac' },
    menthon: { photo: 'assets/wiki/menthon-chateau.jpg', alt: 'Chateau de Menthon-Saint-Bernard above Lake Annecy' },
    angon: { photo: 'assets/wiki/angon.jpg', alt: 'Angon and the east shore of Lake Annecy' },
    stJorioz: { photo: 'assets/wiki/st-jorioz.jpg', alt: 'Saint-Jorioz on the west shore of Lake Annecy' },
    doussard: { photo: 'assets/wiki/doussard.jpg', alt: 'The south end of Lake Annecy at Doussard' },
    voieVerte: { photo: 'assets/wiki/voie-verte.jpg', alt: 'Cyclists on the Lake Annecy greenway' },
    forclaz: { photo: 'assets/wiki/forclaz.jpg', alt: 'Lake Annecy from the Col de la Forclaz' },
    semnoz: { photo: 'assets/wiki/semnoz.jpg', alt: 'Lake Annecy and the Aravis from the Semnoz' },
    glieres: { photo: 'assets/wiki/glieres.jpg', alt: 'Resistance monument on the Plateau des Glieres' },
    roc: { photo: 'assets/wiki/roc-de-chere.jpg', alt: 'Forested cliffs of the Roc de Chere above Lake Annecy' },
    annecyMarket: { photo: 'assets/wiki/annecy-market.jpg', alt: 'Market stalls beside the canals in old Annecy' },
    annecyOldTown: { photo: 'assets/wiki/annecy-old-town.jpg', alt: 'Palais de l Ile and the canals of old Annecy' },
    gorgesFier: { photo: 'assets/wiki/gorges-fier.jpg', alt: 'Walkway through the Gorges du Fier' },
    chamonix: { photo: 'assets/wiki/chamonix.jpg', alt: 'Chamonix valley beneath the Mont Blanc massif' },
    lesGetsVillage: { photo: 'assets/wiki/les-gets-village.jpg', alt: 'Les Gets village in summer' },
    lesGetsMtb: { photo: 'assets/wiki/les-gets-mtb.jpg', alt: 'Mountain-bike trails in Les Gets Bike Park' },
    lakeSunset: { photo: 'assets/wiki/lake-sunset.jpg', alt: 'Boats at sunset on Lake Annecy' },
    lakeBoats: { photo: 'assets/activities/lake-boats.jpg', alt: 'Passenger boats moored in Annecy' },
    lakeKayak: { photo: 'assets/activities/lake-kayak.jpg', alt: 'Kayakers on Lake Annecy at Saint-Jorioz' },
    cascadeAngon: { photo: 'assets/activities/cascade-angon.jpg', alt: 'Cascade d Angon waterfall' },
    montVeyrier: { photo: 'assets/activities/mont-veyrier.jpg', alt: 'Rocky trail on Mont Veyrier above Lake Annecy' },
    semnozLuge: { photo: 'assets/activities/semnoz-luge.jpg', alt: 'Summer luge track on the Semnoz' },
    haras: { photo: 'assets/activities/haras-annecy.jpg', alt: 'Historic Haras buildings in Annecy' },
    reblochon: { photo: 'assets/activities/reblochon.jpg', alt: 'Reblochon cheeses ageing on wooden racks' },
    tamie: { photo: 'assets/activities/tamie-cheese.jpg', alt: 'Cheese from the Abbaye de Tamie' },
    jardins: { photo: 'assets/activities/jardins-secrets.jpg', alt: 'Carved wooden gallery inside the Jardins Secrets at Vaulx' },
    montrottier: { photo: 'assets/activities/montrottier.jpg', alt: 'Stone towers of the Chateau de Montrottier' },
    montChery: { photo: 'assets/activities/mont-chery.jpg', alt: 'Les Gets and the Chablais mountains from Mont Chery' },
    esperance: { photo: 'assets/activities/esperance-iii.jpg', alt: 'The restored sailing barge Esperance III at Annecy' },
    pontDiable: { photo: 'assets/activities/pont-diable.jpg', alt: 'Walkways inside the Gorges du Pont du Diable' },
    vitam: { photo: 'assets/activities/vitam.jpg', alt: 'The Vitam aquatic centre at Neydens' },
    montriond: { photo: 'assets/activities/montriond.jpg', alt: 'Beach and mountain lake at Lac de Montriond' }
  };

  const ACTIVITY_MEDIA_ASSIGNMENTS = [
    [ACTIVITY_MEDIA.lakeSail, ['home-swim', 'sailing-sevrier']],
    [ACTIVITY_MEDIA.veyrier, ['sup-veyrier', 'east-shore-ride', 'veyrier-market']],
    [ACTIVITY_MEDIA.menthon, ['menthon-pontoons', 'menthon-chateau']],
    [ACTIVITY_MEDIA.angon, ['angon-apero']],
    [ACTIVITY_MEDIA.stJorioz, ['st-jorioz-beach', 'fonds-blancs-sup']],
    [ACTIVITY_MEDIA.doussard, ['doussard-sup']],
    [ACTIVITY_MEDIA.voieVerte, ['lake-loop-road', 'voie-verte-recovery']],
    [ACTIVITY_MEDIA.forclaz, ['forclaz-climb-lake', 'forclaz-climb-south', 'paragliding-forclaz', 'forclaz-lunch']],
    [ACTIVITY_MEDIA.semnoz, ['semnoz-climb', 'tour-semnoz', 'semnoz-bikepark', 'semnoz-trois-lacs', 'semnoz-picnic', 'emtb-guidon']],
    [ACTIVITY_MEDIA.glieres, ['glieres-gravel', 'glieres-walk']],
    [ACTIVITY_MEDIA.roc, ['roc-walk', 'blue-secret-packraft']],
    [ACTIVITY_MEDIA.annecyMarket, ['annecy-market', 'mija-food-tour']],
    [ACTIVITY_MEDIA.annecyOldTown, ['chateau-palais']],
    [ACTIVITY_MEDIA.gorgesFier, ['gorges-fier']],
    [ACTIVITY_MEDIA.chamonix, ['chamonix-day']],
    [ACTIVITY_MEDIA.lesGetsVillage, ['lesgets-village', 'lesgets-grocery']],
    [ACTIVITY_MEDIA.lesGetsMtb, ['lesgets-bikepark']],
    [ACTIVITY_MEDIA.lakeSunset, ['vboat-electric']],
    [ACTIVITY_MEDIA.lakeBoats, ['navibus-hop', 'libellule-dinner']],
    [ACTIVITY_MEDIA.lakeKayak, ['essaonia-kayak']],
    [ACTIVITY_MEDIA.cascadeAngon, ['cascade-angon', 'canyoning-angon']],
    [ACTIVITY_MEDIA.montVeyrier, ['mont-veyrier-baron']],
    [ACTIVITY_MEDIA.semnozLuge, ['semnoz-luge']],
    [ACTIVITY_MEDIA.haras, ['halles-haras']],
    [ACTIVITY_MEDIA.reblochon, ['pierre-gay', 'cave-tasting', 'savoyard-night', 'aravis-cheese']],
    [ACTIVITY_MEDIA.tamie, ['tamie-abbey']],
    [ACTIVITY_MEDIA.jardins, ['jardins-secrets']],
    [ACTIVITY_MEDIA.montrottier, ['montrottier']],
    [ACTIVITY_MEDIA.montChery, ['lesgets-lift-walk', 'lesgets-road-ride']],
    [ACTIVITY_MEDIA.esperance, ['esperance-barge']],
    [ACTIVITY_MEDIA.pontDiable, ['pont-du-diable']],
    [ACTIVITY_MEDIA.vitam, ['vitam-aquapark']],
    [ACTIVITY_MEDIA.montriond, ['nautichill-montriond']]
  ];

  // Remove legacy inline choices so this audited registry is authoritative.
  ACTIVITIES.forEach((activity) => { delete activity.media; });
  ACTIVITY_MEDIA_ASSIGNMENTS.forEach(([media, ids]) => {
    ids.forEach((id) => {
      const activity = ACTIVITIES.find((item) => item.id === id);
      if (activity) activity.media = media;
    });
  });

  const ACT_BY_ID = Object.fromEntries(ACTIVITIES.map(a => [a.id, a]));
  // Back-compat alias so any older #/plan/:id deep links still resolve.
  const PLAN_BY_ID = ACT_BY_ID;

  /* ---------- EVENTS (date-aware layer) ------------------------------
     Each event carries exact dates, why-you'd-care, booking, transport
     impact, a source and a verifiedOn. Conflicts with changeover days
     (15 & 22 Aug) are flagged honestly. */
  const EVENTS = [
    {
      id: 'traversee-lac', name: 'Traversée du Lac swim race — starts on our beach', kind: 'race',
      start: '2026-08-15', end: '2026-08-15', datesLabel: 'Sat 15 Aug',
      base: 'lake', where: '5 km start: Plage de la Brune, Veyrier-du-Lac (9:30) · 1 km at l’Impérial · 2.4/10 km from old Annecy',
      coords: [45.8788, 6.1752],
      why: 'The lake’s legendary open-water race, 94th edition — and the 5 km start line is literally the beach below the house, the morning we arrive at the lake.',
      booking: 'yes', price: '1 km €25 → 10 km €50 (+€15 day licence); entries close 8 Aug, +30% after 5 Aug',
      impact: 'It’s changeover morning: out of Les Gets by 10:00, Andrew lands at GVA, check-in 16:00. Racing it would take heroic logistics — watching the swimmers come into La Brune with coffee is the realistic (and great) plan.',
      conflict: true, confidence: 'confirmed', src: 'traversee-lac', travel: { lake: { min: 3, mode: 'walk' } }
    },
    {
      id: 'morillon-enduro', name: 'UCI Enduro World Cup Final — Morillon', kind: 'race',
      start: '2026-08-14', end: '2026-08-16', datesLabel: 'Fri 14 – Sun 16 Aug',
      base: 'lesgets', where: 'Morillon Enduro Bike Park (Giffre valley) · ~35 min from Les Gets',
      coords: [46.0850, 6.6900],
      why: 'The enduro World Cup final decides the overall title — and it lands during your Les Gets stay. Free to watch.',
      booking: 'no', price: 'Free spectator admission.',
      impact: 'Race-village crowds; Sat 15 overlaps your Les Gets → lake changeover if you linger. Detailed race times not yet published.',
      conflict: 'changeover-15', confidence: 'likely', verifyBeforeGo: true, src: 'morillon-uci',
      travel: { lesgets: { min: 35, mode: 'car' }, lake: { min: 75, mode: 'car' } }
    },
    {
      id: 'le-bouquetin', name: 'Le Bouquetin — timed climb of the Col de la Colombière', kind: 'race',
      start: '2026-08-15', end: '2026-08-15', datesLabel: 'Sat 15 Aug, 08:30 start',
      base: 'lake', where: 'Le Grand-Bornand Village → Col de la Colombière',
      coords: [45.9400, 6.4270],
      why: '27th edition mass-start hill-climb: 12 km / 660 m up the Colombière. Race it (licence/medical + insurance) or just watch the field go up.',
      booking: 'recommended', price: 'On-site registration 07:00–08:15; riders 15+.',
      impact: 'The Colombière road and Grand-Bornand centre are busy that morning. It falls on your Aug 15 changeover day — awkward to combine with the house move.',
      conflict: 'changeover-15', confidence: 'confirmed', src: 'bouquetin',
      travel: { lake: { min: 50, mode: 'car' } }
    },
    {
      id: 'veyrier-createurs', name: 'Marché des créateurs — Veyrier-du-Lac', kind: 'market',
      start: '2026-08-16', end: '2026-08-16', datesLabel: 'Sun 16 Aug, 10:00–19:00',
      base: 'lake', where: 'Port de Veyrier-du-Lac (Quai Général Doyen) · in your home village',
      coords: [45.8848, 6.1740],
      why: 'A lakeside artisan market at your own port — ~30 makers, free — the day after you arrive. Walk down from the house.',
      booking: 'no', price: 'Free.',
      impact: 'None — it’s in the village.', confidence: 'confirmed', src: 'veyrier-crea',
      travel: { lake: { min: 5, mode: 'walk' } }
    },
    {
      id: 'imperial-festival', name: 'Impérial Annecy Festival', kind: 'festival',
      start: '2026-08-18', end: '2026-08-28', datesLabel: '18–28 Aug',
      base: 'lake', where: 'Imperial Palace, Annecy lakefront · ~5 km from Veyrier',
      coords: [45.9050, 6.1440],
      why: 'Jazz, classical and comedy on the lakefront — around twenty events, roughly half of them free (a free early-evening terrace concert, then a ticketed main show).',
      booking: 'recommended', price: 'Some events free; main shows ticketed.',
      impact: 'Busy lakefront and parking on show nights. The free/paid split and show times are from secondary sources — confirm the programme.',
      confidence: 'confirmed', verifyBeforeGo: true, src: 'imperial-fest',
      travel: { lake: { min: 12, mode: 'car/bus' } }
    },
    {
      id: 'lesgets-worldcup', name: 'UCI MTB World Cup — Les Gets', kind: 'race',
      start: '2026-08-20', end: '2026-08-23', datesLabel: '20–23 Aug (XCC Fri 21 · DH Sat 22 · XCO Sun 23)',
      base: 'lake', where: 'Les Gets · ~1h15 drive from Veyrier',
      coords: [46.1558, 6.6697],
      why: 'World Cup downhill and cross-country back at Les Gets — free to spectate. You’ve left Les Gets by now, so it’s a day-trip from the lake.',
      booking: 'no', price: 'Free admission, 09:00–18:00.',
      impact: 'Heavy traffic, parking pressure and crowds in Les Gets, worst on DH Saturday (22 Aug — your Veyrier changeover day) and XCO Sunday. If day-tripping to watch, expect a long, busy drive.',
      conflict: 'changeover-22', confidence: 'confirmed', src: 'lesgets-uci',
      travel: { lake: { min: 75, mode: 'car' } }
    },
    {
      id: 'bonheur-momes', name: 'Au Bonheur des Mômes — Le Grand-Bornand', kind: 'festival',
      start: '2026-08-23', end: '2026-08-27', datesLabel: '23–27 Aug',
      base: 'lake', where: 'Le Grand-Bornand village · ~50 min from Veyrier',
      coords: [45.9400, 6.4270],
      why: 'Europe’s biggest young-audience performance festival. Not aimed at four adults — but it fills Le Grand-Bornand for five days.',
      booking: 'yes', price: 'Individual shows ticketed and sell out.',
      impact: 'Mainly a heads-up: busy roads and full parking in the Aravis 23–27 Aug — factor it into any La Clusaz / Grand-Bornand bike or cheese day.',
      confidence: 'confirmed', src: 'momes', travel: { lake: { min: 50, mode: 'car' } }
    },
    {
      id: 'cine-plein-air', name: 'Annecy open-air cinema', kind: 'cinema',
      start: '2026-06-26', end: '2026-08-29', datesLabel: 'Free evenings through Aug 29',
      base: 'lake', where: 'Rotating Annecy neighbourhood venues',
      coords: [45.8990, 6.1290],
      why: 'Free after-dark screenings around Annecy all summer — a lovely cheap evening. Bring a blanket.',
      booking: 'no', price: 'Free; ~21:30 start, cancelled in bad weather.',
      impact: 'The advertised “Shaun le mouton” screening is the closing night, Sat 29 Aug — your departure day, so you’ll miss that one. Other films screen on other August nights: check the schedule for one during the stay.',
      confidence: 'likely', verifyBeforeGo: true, src: 'cine-plein-air',
      travel: { lake: { min: 12, mode: 'car/bus' } }
    }
  ];

  /* ---------- TRANSPORT GUIDANCE (getting around, no-car mode) -------- */
  const TRANSPORT_GUIDE = {
    intro: 'Mobil’été runs 1 Jul–31 Aug 2026: free summer Sibra buses, park-and-ride, lake boats and Vélonecy e-bikes. In summer, driving into central Annecy is the slow option — the Courier tunnel is under works into 2027 and lakeside parking is now paid.',
    modes: [
      { id: 'bus', label: 'Free summer buses', summary: 'The whole Sibra network is free in July–August (on-demand excepted). Line 20 is the east-shore link — Annecy ↔ Veyrier (Barattes stop for La Brune) ↔ Menthon ↔ Talloires, daily, last departure from Annecy ~01:00. Line 15 (15A/15B) serves the west shore (Sévrier, Saint-Jorioz, Duingt).', src: 'mobilite' },
      { id: 'boat', label: 'Navibus lake shuttle', summary: 'Calls at Veyrier and eight other ports. 3 departures daily every day 6 Jul–28 Aug 2026; from 29 Aug only Tue/Wed/Fri/Sun (so likely none on departure Saturday). A full loop is ~2h20 — an excursion, not a fast commute. Bikes reportedly +€1 (verify). Take a bike one way, ride the greenway back.', src: 'navibus' },
      { id: 'veyrier-express', label: 'Veyrier Express fast boat', summary: 'A dedicated fast shuttle between Annecy and Veyrier — the quickest car-free hop. Reported ~4 round trips/day in late August, weather-dependent. Dates/fares unverified for 2026 — check with the operator or the mairie.', verifyBeforeGo: true, src: 'mobilite' },
      { id: 'mountain', label: 'Summer mountain lines', summary: 'Seasonal buses from Annecy to the Semnoz, Col de la Forclaz and Planfait (hiking / paragliding launches). MTB carried on the Semnoz line for €6. Trailhead car parks fill early on fine days — the bus skips the scramble. Confirm timetables.', verifyBeforeGo: true, src: 'mobil-ete' },
      { id: 'bike', label: 'Bike + greenway', summary: 'The ~40 km lakeside route rings the lake; the west/south shore is the traffic-free Voie Verte. Pair it with a one-way Navibus. Vélonecy has ~450 e-bikes across 79 stations at the Annecy end.', src: 'mobilite' }
    ],
    parking: 'Lakeside car parks are paid €1/hour 09:00–18:00, 1 Jul–31 Aug; central underground parks fill by ~11:00. Use a free seasonal park-and-ride and ride the free bus in. Expect heavy traffic on market mornings (Tue/Fri/Sun), summer weekends and the Aug 15 & 22 changeover Saturdays.',
    noCar: 'A genuine no-car day from Veyrier works: bus line 20 or the fast boat into Annecy, the greenway or Navibus around the lake, and walk-down swimming at La Brune. Save the car for the mountains (cols, bike parks, Glières, Chamonix).',
    src: 'mobil-ete'
  };

  const STORY = [
    { emoji: '🧊', title: 'Carved by ice', text: 'The lake sits in a trough that Ice-Age glaciers scooped out, then filled as they melted. The walls of peaks around it are what the ice left behind.' },
    { emoji: '💧', title: 'One of the purest lakes in Europe', text: 'By the 1960s it was badly polluted. The towns around the shore built one of Europe’s first lake-wide sewer systems and brought it back — the tourism office calls it “l’un des plus purs d’Europe”, and it’s fiercely protected.' },
    { emoji: '🛶', title: 'The Venice of the Alps', text: 'Annecy’s old town is laced with canals off the river Thiou. The Palais de l’Île — the little ship-shaped building midstream — has been a house, a court and a prison since the 12th century.' },
    { emoji: '🏰', title: 'A castle on every shoulder', text: 'Château d’Annecy watches the old town, Château de Menthon perches on its hill, and Duingt’s tower guards the narrows. Half the skyline is medieval.' },
    { emoji: '🧀', title: 'Cheese with a backstory', text: 'The story goes that Reblochon was born from a sneaky second milking — farmers under-declared their cows to the landlord, then milked again once he’d gone. The Aravis farms still make it.' }
  ];
  const HISTORY = [
    { emoji: '🏔️', title: 'Mountains made for resistance', text: 'After France fell in 1940, these valleys became maquis country. High pastures, deep forests and passes the occupier couldn’t control — and farms that fed and hid the fighters.' },
    { emoji: '✊', title: 'Glières, winter 1944', text: 'On a snowbound plateau just north-east of the lake, around 450 maquisards gathered to receive Allied weapons drops under the motto « Vivre libre ou mourir ». Attacked at the end of March 1944, well over a hundred were killed or deported — and the stand became a rallying cry for the whole Resistance.' },
    { emoji: '🪂', title: 'The answer from the sky', text: 'On 1 August 1944 the plateau got its reply: a huge daylight parachute drop of arms. Weeks later, on 19 August, Haute-Savoie did something almost unique — it freed itself, the German garrison surrendering to the Resistance in Annecy before any Allied army arrived.' },
    { emoji: '🕊️', title: 'You can stand there', text: 'The plateau is an easy drive: the national monument, open walking country, and the Resistance museum and necropolis at Morette on the Thônes road — the same road you’ll take toward the Aravis and the cheese.' }
  ];
  /* ---------- FEATURED + shortlists --------------------------------- */
  const FEATURED = ['lake-loop-road', 'canyoning-angon', 'semnoz-bikepark', 'paragliding-forclaz'];
  const LESGETS_TOP3 = ['lesgets-bikepark', 'morillon-enduro', 'lesgets-lift-walk'];
  const LAKE_EXCURSIONS = ['glieres-gravel', 'jallouvre-viaferrata', 'laclusaz-bikepark', 'chamonix-day', 'glieres-walk'];

  /* ---------- MAP POIs -----------------------------------------------
     Pins that don't need a full activity page: cyclist cafés, wild
     beaches, gyms, restaurants, viewpoints, oddities. From the group's
     starter list, geocoded via OSM/Nominatim (2026-07-26); items whose
     details weren't confirmed on an official page carry verify:true and
     show a "Verify before going" badge on the map. */
  const MAP_POIS = [
    // Cyclist cafés & bike spots
    { id: 'bon-wagon', cat: 'food', em: '🚲', name: 'Le Bon Wagon (cyclist café)', coords: [45.82652, 6.20113], blurb: 'Converted railway station on the Voie Verte at Duingt — café, workshop, rentals, lake view.', verify: true },
    { id: 'abri-cyclette', cat: 'food', em: '🚲', name: 'L’Abri Cyclette (cyclist café)', coords: [45.83335, 6.16430], blurb: 'Cycle-themed café at Saint-Jorioz — sofas, deckchairs, green fields.', note: 'Pin approximate (village centre).', verify: true },
    { id: 'matchy', cat: 'food', em: '🚲', name: 'Matchy Cycling Clubhouse', coords: [45.90578, 6.12117], blurb: 'Cycling café-clubhouse in Annecy — group rides and race screenings.', verify: true },
    { id: 'lormay-ludopark', cat: 'cycling', em: '🚵', name: 'Ludopark de Lormay', coords: [45.94523, 6.50575], blurb: 'Free MTB skills area in the Vallée du Bouchet: three graded loops plus a 150 m natural pumpline.', note: 'Open ~May–Nov, free; helmet strongly advised; under-10s supervised.', href: 'https://en.legrandbornand.com/ludopark-of-lormay.html' },
    { id: 'carroz-pump', cat: 'cycling', em: '🚵', name: 'Pumptrack Les Carroz', coords: [46.02801, 6.63398], blurb: '230 m asphalt pump track with three circuits — worth a stop if you’re in the Grand Massif anyway.', verify: true },
    { id: 'marlens-plan-eau', cat: 'water', em: '🚲', name: 'Plan d’eau de Marlens', coords: [45.76081, 6.34372], blurb: 'Swimming lake and free bike-wash on the greenway extension south of the lake.', verify: true },
    // Water & wild beaches
    { id: 'plage-chateau-duingt', cat: 'water', em: '🏖️', name: 'Plage du Château (Duingt)', coords: [45.83002, 6.20566], blurb: 'Grassy free beach with ladder entry under the Duingt château — unsupervised, quietly lovely.' },
    { id: 'clos-bertet', cat: 'water', em: '🏖️', name: 'Plage du Clos Berthet (Sévrier)', coords: [45.85649, 6.14710], blurb: 'Small wild grassy beach 500 m south of Sévrier port — deep water fast, few people.' },
    { id: 'ncy-sup', cat: 'water', em: '🛶', name: 'NCY SUP (Sévrier port)', coords: [45.85979, 6.14566], blurb: 'SUP & foil base — rentals from the port, plus the Wednesday “Paddle Burger” sunset tour.', note: 'Pin at the port; check in at the base.', href: 'https://ncy-sup.com/', verify: true },
    // Climbing & indoor
    { id: 'criqbloc', cat: 'adrenaline', em: '🧗', name: 'Criq’Bloc (Saint-Jorioz)', coords: [45.83335, 6.16430], blurb: 'Indoor bouldering right by the beach — ~€12 adult, shoes €3. Climb, then swim.', note: 'Pin approximate (La Crique leisure base).', href: 'https://annecy-lacrique.com/en/rates-and-reservation', verify: true },
    { id: 'spacebloc', cat: 'adrenaline', em: '🧗', name: 'Space Bloc (Sillingy)', coords: [45.94497, 6.04583], blurb: 'The area’s big bouldering gym, with a bar — a proper rainy-day session.', verify: true },
    // Food & treats
    { id: 'poisson-rouge', cat: 'food', em: '🐟', name: 'Le Poisson Rouge (Sévrier)', coords: [45.86766, 6.14353], blurb: 'Feet-in-the-water lakefront classic — fried perch and féra. Book ahead in August.', verify: true },
    { id: 'charbonniere', cat: 'food', em: '🧀', name: 'Ferme de la Charbonnière (Menthon)', coords: [45.86991, 6.20702], blurb: 'Ferme-auberge above the cow stable — cheese made on site, Reblochonnade, raclette. The real Savoie, five minutes from home.', verify: true },
    { id: 'le-freti', cat: 'food', em: '🫕', name: 'Le Fréti (old town)', coords: [45.89855, 6.12493], blurb: 'Fondue institution since 1974, cheese aged in its own caves. No summer reservations — go early.', verify: true },
    { id: 'chez-ma-cousine', cat: 'food', em: '🍽️', name: 'Chez ma Cousine (Doussard)', coords: [45.79520, 6.21333], blurb: 'Refined guinguette on the south shore with its own pontoon — arrive by boat if you can. Reserve.', verify: true },
    { id: 'le-denti', cat: 'food', em: '🐟', name: 'Le Denti (Annecy)', coords: [45.89642, 6.12066], blurb: 'Fifteen seats, superb fish, zero fuss — the locals’ secret. Reservations essential.', verify: true },
    { id: 'glacier-des-alpes', cat: 'food', em: '🍦', name: 'Glacier des Alpes', coords: [45.89803, 6.12740], blurb: 'Thirty-year family gelato on rue Perrière — lavender-honey, violet, salted caramel.', verify: true },
    { id: 'nazca-lines', cat: 'food', em: '🍸', name: 'Nazca Lines (cocktail bar)', coords: [45.89923, 6.12888], blurb: 'Hidden-gem cocktail bar in the old town for the one dressed-up evening.', note: 'Pin approximate.', verify: true },
    { id: 'anglettaz', cat: 'food', em: '🧀', name: 'Chalet de l’Anglettaz', coords: [45.96377, 6.24328], blurb: 'Stone alpage chalet at 1,500 m under the Parmelan — wood-fire farm dinners, menus ~€23–28. Go for sunset.', verify: true },
    { id: 'coop-reblochon', cat: 'food', em: '🧀', name: 'Coopérative du Reblochon (Thônes)', coords: [45.88781, 6.31420], blurb: 'Reblochon fermier cellars, tastings and shop. Saturday 9:30 cellar tours (€2, book via the Thônes tourist office) — though our Saturdays are all moving days.', href: 'https://hautesavoiemontblanc-tourisme.com/en/offers/visite-de-la-cooperative-du-reblochon-fermier-thones-en-5867525/' },
    // Expansion sweep quick pins (verified 2026-07-26)
    { id: 'laser-maxx', cat: 'adrenaline', em: '🔫', name: 'LaserMaxx 74 + Quiz Boxing (Épagny)', coords: [45.9427, 6.0731], blurb: 'Laser tag plus a TV-style quiz-boxing arena — a ready-made tournament night for four.', href: 'https://www.lasermaxx74.fr/horaire-et-tarif' },
    { id: 'ereel-vr', cat: 'adrenaline', em: '🎮', name: 'E.reel VR arena (Épagny)', coords: [45.9433, 6.0738], blurb: 'Free-roam VR arena next door to the laser tag — book a slot, pick games on arrival.', href: 'https://ereel.fr/espace-vr/annecy/' },
    { id: 'hachez-vous', cat: 'adrenaline', em: '🪓', name: 'L’Hachez-Vous axe-throwing bar (Seynod)', coords: [45.8620, 6.0675], blurb: 'Axe-throwing lanes with a bar. Beer after the axes, not before.', href: 'https://www.lancerdehache-annecy.fr/', verify: true },
    { id: 'minigolf-imperial', cat: 'culture', em: '⛳', name: 'Mini-golf de l’Impérial (by night)', coords: [45.9046, 6.1449], blurb: 'Old-school lakeside mini-golf open to 22:00 in August — evening grudge match, then gelato.', href: 'https://www.velo-golf-annecy.com/', verify: true },
    { id: 'cristal-spa', cat: 'water', em: '🧖', name: 'Cristal Spa (Impérial Palace)', coords: [45.9048, 6.1439], blurb: 'The grand hotel’s spa — a €130+ treatment buys pool/sauna access. The recovery-day flex.', href: 'https://www.hotel-imperial-palace.com/en/spa-access-conditions-1205' },
    { id: 'distillerie-aravis', cat: 'food', em: '🥃', name: 'Distillerie des Aravis (La Clusaz)', coords: [45.9046, 6.4223], blurb: 'Génépi distillery tour + tasting, €6, Thu–Sat slots — bolt onto any Aravis ride or the Reblochon run.', href: 'https://www.laclusaz.com/en/details/distillerie-des-aravis/' },
    { id: 'brasserie-caquot', cat: 'food', em: '🍺', name: 'Brasserie Caquot (Entrelacs)', coords: [45.7854, 5.9526], blurb: 'Craft brewery tour with a 4-beer tasting and boards, ~35 min away — designated driver required.', href: 'https://brasseriecaquot.fr/degustation-brasserie/', verify: true },
    { id: 'domaine-lupin', cat: 'food', em: '🍷', name: 'Domaine Lupin — Roussette cellar (Frangy)', coords: [46.01854, 5.92576], blurb: 'Savoie’s Roussette tasted at the family domaine, by phone appointment, bottles ~€10–16.', href: 'https://www.haute-savoie-tourisme.org/commerces/producteurs-locaux/115183-domaine-lupin', verify: true },
    { id: 'talloires-abbaye', cat: 'food', em: '🍸', name: 'Abbaye de Talloires — apéro terrace', coords: [45.84144, 6.21205], blurb: 'Drinks under the plane trees of a 17th-century lakefront abbey, 10 min south — the classy sunset move.', href: 'https://www.abbaye-talloires.com/en' },
    { id: 'lamas-salagine', cat: 'hike', em: '🦙', name: 'Les Lamas de Salagine (Bloye)', coords: [45.81714, 5.95730], blurb: 'Walk llamas to the Crosagny ponds. Yes, really. By appointment.', href: 'https://www.lamasafran.com/', verify: true },
    { id: 'canyon-terneze', cat: 'adrenaline', em: '🌊', name: 'Canyon de Ternèze (Bauges)', coords: [45.5664, 6.0090], blurb: 'A third canyoning option ~1 h south in the Bauges (€50) — pairs with a Pont de l’Abîme loop.', href: 'https://bauges-canyoning.com/canyoning/canyon-terneze-curienne/', verify: true },
    { id: 'husky-morgins', cat: 'hike', em: '🐕', name: 'Summer husky cani-rando (Morgins, CH)', coords: [46.2377, 6.8581], blurb: 'Hike harnessed to a husky in the Swiss Valais, ~45 min from Les Gets. CHF 80; booking mandatory.', href: 'https://www.regiondentsdumidi.ch/en/5494304-husky-hike-17101/', verify: true },
    { id: 'devalkart-morgins', cat: 'adrenaline', em: '🛷', name: 'Déval’kart Morgins (CH)', coords: [46.2377, 6.8581], blurb: 'Private-hire mountain karts on the Morgins slopes — CHF 150 for 5 karts/30 min. Book 24 h ahead.', href: 'https://www.regiondentsdumidi.ch/en/824907-deval-kart-9648/', verify: true },
    { id: 'mont-caly', cat: 'hike', em: '🏔️', name: 'Mont Caly alpage — Mont Blanc panorama', coords: [46.1528, 6.6310], blurb: 'Les Gets’ balcony over Mont Blanc, with the Les Chevrelles alpage table — steep warm-up climb or short drive.', href: 'https://www.lesgets.com/details/le-mont-caly-643054-Fr/', verify: true },
    // Flagged & rediscovered (researched 26 Jul 2026)
    { id: 'tournette-closed', cat: 'hike', em: '🥾', closed: true, name: 'La Tournette (2,351 m)', coords: [45.82709, 6.28615],
      blurb: 'The queen hike of the lake — officially flagged CLOSED right now: lingering snowfields above 1,700 m, after two fatal slips in 2025. Likely to reopen once the snow melts.',
      note: 'Check lac-annecy.com and the Talloires-Montmin mairie when we’re in France — mid-August could well be fine. If it opens: park at Prés Ronds; the Col de l’Aulp track isn’t public.',
      href: 'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/la-tournette-depuis-montmin-talloires-montmin/' },
    { id: 'thones-vf', cat: 'adrenaline', em: '🧗', name: 'Via Ferrata de Thônes (Roche à l’Agathe)', coords: [45.8854, 6.3215],
      blurb: 'Short, steep crag route right above Thônes town (~600 m, 235 m gain, D–ED). Widely listed “closed” — that’s a stale 2023 banner: the office’s own 2026 listing and June-2026 climber reports say it’s open.',
      note: 'Call the Thônes tourist office (+33 4 50 02 00 26) to confirm before driving over — one official page still shows the old closure line.',
      href: 'https://www.thonescoeurdesvallees.com/en/equipement/via-ferrata-de-la-roche-a-lagathe/', verify: true },
    { id: 'cascade-mysterieuse', cat: 'hike', em: '💧', name: 'Cascade Mystérieuse (Le Chinaillon)', coords: [45.96443, 6.44065],
      blurb: 'A real 30 m waterfall in a slot gorge at Le Grand-Bornand — a 20-minute walk from L’Arbelay. The cyclist guide sold it as a secret lake swim spot; it’s actually in the Aravis, and it’s a look, not a dip.',
      href: 'https://www.haute-savoie-tourisme.org/nature/itineraires-randonnees/6168701-la-cascade-mysterieuse' },
    // Culture, viewpoints & oddities
    { id: 'paccard', cat: 'culture', em: '🔔', name: 'Musée Paccard (bells)', coords: [45.84424, 6.15076], blurb: 'The Sévrier foundry that cast France’s biggest bell and 57 Liberty Bell replicas — quirky and genuinely interesting.', verify: true },
    { id: 'grotte-sevrier', cat: 'culture', em: '⛪', name: 'Grotte de Sévrier', coords: [45.86429, 6.13807], blurb: 'A tiny Lourdes-style grotto above the lake — silent, serene, known mostly to locals.' },
    { id: 'ermitage', cat: 'hike', em: '🌄', name: 'Ermitage de Saint-Germain', coords: [45.84208, 6.22305], blurb: 'The balcony over the Baie de Talloires — an old oratory, candles still lit, postcard view.' },
    { id: 'pont-abime', cat: 'hike', em: '🌉', name: 'Pont de l’Abîme', coords: [45.76451, 6.05693], blurb: '96 m suspension bridge over the Chéran gorge — pair with Alby-sur-Chéran’s arcaded old town.', note: 'Swimming in the Chéran is officially banned (low flow, cyanobacteria) — look, don’t dip.', href: 'https://mairie-alby-sur-cheran.fr/cheran-baignade-interdite/' },
    { id: 'alby', cat: 'culture', em: '🏘️', name: 'Alby-sur-Chéran', coords: [45.8154, 6.0181], blurb: 'Arcaded medieval shoemaking village 20 min away — plus a time-capsule candle workshop (€2 tours).', note: 'Pin approximate.', verify: true },
    // Chamonix satellites
    { id: 'aiguille-midi', cat: 'hike', em: '🚡', name: 'Aiguille du Midi (valley station)', coords: [45.91821, 6.87018], blurb: 'The 3,842 m cable car. Book online and take the ~8 am first bin — queues get silly. ~€81 return.', note: 'Clear days only.', verify: true },
    { id: 'montenvers', cat: 'hike', em: '🚂', name: 'Montenvers — Mer de Glace', coords: [45.92262, 6.87532], blurb: 'The red cog railway to France’s biggest glacier and its carved ice grotto (~€41 return).', verify: true },
    // Farther afield
    { id: 'yvoire', cat: 'culture', em: '🏰', name: 'Yvoire (Lac Léman)', coords: [46.3710, 6.3270], blurb: '“Most beautiful villages” medieval port on Lake Geneva, ~50 min. Go on a weekday in August.' },
    { id: 'perouges', cat: 'culture', em: '🏰', name: 'Pérouges', coords: [45.9036, 5.1764], blurb: 'Walled hilltop film-set village about an hour away — go early, eat the galette.', verify: true },
    { id: 'geneva', cat: 'culture', em: '🌆', name: 'Geneva', coords: [46.2040, 6.1430], blurb: 'Jet d’Eau, old town and chocolate ~45 min north — pairs with Yvoire.' },
    { id: 'aiguebelette', cat: 'water', em: '🚣', name: 'Lac d’Aiguebelette', coords: [45.5500, 5.8010], blurb: 'Motor-boat-free “blue pearl” ~40 min away — warm, calm, the great crowd escape.', verify: true }
  ];

  /* ---------- THE CUT LIST (#/archive) ------------------------------
     Things we researched and deliberately did NOT put on the map —
     kept here with reasons so nobody rediscovers them mid-trip and
     wonders. Groups: closed | no | cut | unverified | season.        */
  const ARCHIVE = [
    { group: 'no', em: '⛔', name: 'Cliff jumping & deep-water soloing (Roc de Chère)',
      reason: 'Illegal — the Roc de Chère is a protected national nature reserve, and people have died jumping there. Not on this trip, in any form. The legal way to see those coves is the packraft tour: hike over the top, paddle back under the cliffs.' },
    { group: 'no', em: '🧗', name: 'Le Biclop crag (Veyrier-du-Lac)',
      reason: 'The historic ~200-route crag directly above the lake road at the entrance to our own village — but climbing there is banned by municipal decree over rockfall risk. Locals reportedly still sneak on; we don’t do banned crags. Criq’Bloc and Space Bloc scratch the itch legally.',
      href: 'https://www.escalade-74.com/le-biclop/' },
    { group: 'cut', em: '⭐', name: 'Le Clos des Sens (3★) & L’Esquisse (1★)',
      reason: 'The guide PDF’s fine-dining picks. Cut by request — this trip runs on markets, guinguettes and fondue, not tasting menus.' },
    { group: 'cut', em: '🎣', name: 'Dawn fishing charter (Rando-Pêche)',
      reason: 'Real and bookable (~€250 pp/day with a pro guide, pike and lake trout at first light) — left off the main list as a pricey niche. Say the word if someone secretly fishes.',
      href: 'https://www.rando-peche.com/guidages-tarifs/guidage-bateau/' },
    { group: 'season', em: '🚴', name: 'La Résistance (gravel race, Talloires)',
      reason: 'A brilliant event — in June. It will be long over by the time we arrive in August, so it’s not on the map.' },
  ];

  /* ---------- PHOTO CREDITS (Wikimedia Commons) --------------------- */
  const CREDITS = [
    { subject: 'Lake panorama (hero)', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Lake_Annecy_@_Col_de_la_Forclaz_@_Hike_to_Pointe_de_la_Rochette_@_Annecy_(35828637062).jpg' },
    { subject: 'Old Annecy (Palais de l’Île)', author: 'Tournasol7', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Palais_de_l%27Isle_in_Annecy_04.jpg' },
    { subject: 'Annecy market', author: 'Frédérique Voisin-Demery', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Les_chalands_le_long_des_canaux_(Annecy).jpg' },
    { subject: 'Lake from the Semnoz', author: 'Florian Pépellin', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Sud_du_Lac_d%27Annecy_vu_du_Semnoz_en_fin_d%27%C3%A9t%C3%A9_(2020).JPG' },
    { subject: 'Col de la Forclaz', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Espace_spectateur_@_Aire_de_d%C3%A9collage_@_Col_de_la_Forclaz_(51221254562).jpg' },
    { subject: 'Gorges du Fier', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Gorges_du_Fier_(8900949669).jpg' },
    { subject: 'Chamonix valley', author: 'Ximonic (Simo Räsänen)', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Chamonix_valley_from_la_Fl%C3%A9g%C3%A8re,2010_07.JPG' },
    { subject: 'La Clusaz village', author: 'Rundvald', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:La-Clusaz-Eglise-Sainte-Foy-Place-de-l-Eglise-byRundvald.jpg' },
    { subject: 'Col des Aravis', author: 'chisloup', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:Vue_depuis_le_col_des_aravis_-_panoramio.jpg' },
    { subject: 'Les Gets village', author: 'Jjt.pub', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:LesGets-20140816.jpg' },
    { subject: 'Les Gets bike park', author: 'Marcus Hansson', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Les_Gets_Bike_Park_(36455114651).jpg' },
    { subject: 'Veyrier-du-Lac promenade', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Lake_Annecy_@_Veyrier-du-Lac_(15151949388).jpg' },
    { subject: 'Château de Menthon', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_Menthon_01_v2.jpg' },
    { subject: 'Baie de Talloires', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Baie_de_Talloires_@_Lac_d%27Annecy_@_Ermitage_de_Saint-Germain_(51166211883).jpg' },
    { subject: 'Glières monument', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Monument_national_%C3%A0_la_R%C3%A9sistance_@_Plateau_des_Gli%C3%A8res_(51175637332).jpg' },
    { subject: 'Sévrier', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Plage_de_Sevrier_@_Lac_d%27Annecy_@_Point_de_vue_@_Second_sommet_@_Mont_Baret_(51341230869).jpg' },
    { subject: 'Saint-Jorioz bay', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Saint-Jorioz_@_Lac_d%27Annecy_@_Taillefer_@_Duingt_(51243283172).jpg' },
    { subject: 'Château de Duingt', author: 'Rémih', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_Ch%C3%A2teauvieux_@_Plage_de_Duingt.jpg' },
    { subject: 'Bout-du-Lac reserve', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Lake_Annecy_@_R%C3%A9serve_naturelle_du_Bout-du-Lac_@_Annecy_(35990130345).jpg' },
    { subject: 'Angon', author: 'Rémih', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Angon_@_Roc_de_Ch%C3%A8re.jpg' },
    { subject: 'Roc de Chère cliffs', author: 'William Crochot', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Roc_de_Ch%C3%A8re_-_226.jpg' },
    { subject: 'Voie Verte', author: 'Nicolas Vigier', license: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:Lac_d%27Annecy_-_005.jpg' },
    { subject: 'Clear water at Angon', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Lake_Annecy_@_Angon_@_Talloires_(15336193331).jpg' },
    { subject: 'Sunset at Petit Port', author: 'Robin Férand', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:Sunset_On_Boats_(217507957).jpeg' },
    { subject: 'Annecy passenger boats', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Boat_Ride_on_Lake_Annecy_(15373121082).jpg' },
    { subject: 'Kayaks at Saint-Jorioz', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Kayak_@_Sentier_des_Roseli%C3%A8res_@_Lake_Annecy_@_Saint-Jorioz_(50478764421).jpg' },
    { subject: 'Cascade d\'Angon', author: 'Aupiano', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Cascade_d%27Angon_2.jpg' },
    { subject: 'Mont Veyrier trail', author: 'Myrabella', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Chemin_mont_Veyrier_mont_Baron.jpg' },
    { subject: 'Summer luge at Semnoz', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Summer_luge_@_Hike_to_Semnoz_(15368582992).jpg' },
    { subject: 'Haras d\'Annecy', author: 'Guilhem Vellut', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Le_Haras_@_Annecy_(51377716376).jpg' },
    { subject: 'Reblochon ageing racks', author: 'Myrabella', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Reblochons_fermiers_au_sechoir.jpg' },
    { subject: 'Tamie cheese', author: 'Nicolas Vigier', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Abbaye_de_Tami%C3%A9_et_tome_des_Bauges.jpg' },
    { subject: 'Jardins Secrets at Vaulx', author: 'Zairon', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Vaulx_Jardins_secrets_The_Galleries_1.jpg' },
    { subject: 'Chateau de Montrottier', author: 'Dmitry A. Mottl', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_Montrottier.jpg' },
    { subject: 'Les Gets from Mont Chery', author: 'Hesed', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Les_Gets_depuis_le_Mont_Chery.jpg' },
    { subject: 'Esperance III', author: 'Semnoz-II', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:20210625_Esp%C3%A9rance_III_.2.jpg' },
    { subject: 'Gorges du Pont du Diable', author: 'Krzysztof Golik', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Gorges_du_Pont_du_Diable_(3).jpg' },
    { subject: 'Vitam aquatic centre', author: 'VitamMigros', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Vitam.jpg' },
    { subject: 'Lac de Montriond', author: 'Krzysztof Golik', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Lac_de_Montriond_26.jpg' }
  ];

  return {
    VERIFIED, SOURCES, BASES, TRIP, STAYS, TRANSPORT, PEOPLE,
    TOUR_COLS,
    AREAS, AREA_BY_ID,
    ACTIVITIES, ACT_BY_ID, PLAN_BY_ID,
    EVENTS, TRANSPORT_GUIDE,
    STORY, HISTORY,
    MAP_POIS, ARCHIVE, FEATURED, LESGETS_TOP3, LAKE_EXCURSIONS, CREDITS
  };
})();
