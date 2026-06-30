/* =====================================================================
   Lac d'Annecy — single source of truth.
   Every screen (Home, Day, Areas, Bike, Lake, Food, Map, Trips) reads
   from this file so the cards, area pages and map all reinforce the
   same decision flow.

   Costs use simple labels: 'free' | '€' | '€€'.
   Where a real official link wasn't certain, copy uses a [CHECK: …]
   placeholder rather than an invented URL, price, route or opening time.
   ===================================================================== */
window.DATA = (function () {
  'use strict';

  /* ---------- DAY MODES ----------------------------------------------
     The taxonomy behind "What kind of day are we having?".
     Kept deliberately to the agreed set — no over-building. */
  const MODES = [
    { id: 'lake',        label: 'Lake day',         emoji: '🏊', hint: 'In and out of the water' },
    { id: 'beach',       label: 'Beach day',        emoji: '🏖️', hint: 'Towels, lawns, slow hours' },
    { id: 'easy-bike',   label: 'Easy bike path',   emoji: '🚲', hint: 'Flat Voie Verte, no traffic' },
    { id: 'big-cycling', label: 'Big cycling day',  emoji: '🚴', hint: 'Real distance, real legs' },
    { id: 'cols',        label: 'Major cols',       emoji: '⛰️', hint: 'The famous climbs' },
    { id: 'mtb',         label: 'MTB & park',       emoji: '🚵', hint: 'Trails, pump track, velodrome' },
    { id: 'food',        label: 'Food & market',    emoji: '🧀', hint: 'Markets, cheese, picnic' },
    { id: 'apero',       label: 'Apéro & evening',  emoji: '🥂', hint: 'Golden hour by the water' },
    { id: 'rainy',       label: 'Rainy day',        emoji: '🌧️', hint: 'Good even when grey' },
    { id: 'daytrip',     label: 'Big day trip',     emoji: '🧭', hint: 'Off the lake, worth the drive' },
    { id: 'views',       label: 'Views & heights',  emoji: '🏔️', hint: 'Up high, big horizon' },
    { id: 'low-effort',  label: 'Low-effort',       emoji: '🛋️', hint: 'Almost no planning' },
    { id: 'clear',       label: 'Clear-weather',    emoji: '☀️', hint: 'Save these for a blue day' },
    { id: 'no-car',      label: 'No-car day',       emoji: '🚶', hint: 'Walk, swim, ride from home' },
    { id: 'afternoon',   label: 'Perfect afternoon',emoji: '🌅', hint: 'One great half-day' }
  ];
  const MODE_BY_ID = Object.fromEntries(MODES.map(m => [m.id, m]));

  /* ---------- AREAS --------------------------------------------------
     One clear mental map of the lake and its edges, ordered roughly as
     you'd meet them: west shore down, south end, east shore up, then
     the heights and the bigger trips. Each answers: why go, what kind
     of day, and what it's best for. */
  const AREAS = [
    {
      id: 'annecy', name: 'Annecy', zone: 'Top of the lake',
      coords: [45.8992, 6.1294],
      supports: ['food', 'wander', 'lake'],
      why: 'The old town: canals, market, gelato, a town swim two minutes from the bustle.',
      day: 'Market mornings, rainy-day wandering, an easy ride in and out.',
      water: 'Plage des Marquisats — concrete steps into clean water.',
      food: 'Sun / Tue / Fri morning market in the old town.',
      photo: 'assets/ride/ride_open_lake_path.jpg',
      official: 'https://www.lac-annecy.com'
    },
    {
      id: 'sevrier', name: 'Sévrier', zone: 'West shore · home base',
      coords: [45.8584, 6.1383],
      supports: ['lake', 'bikes', 'food'],
      why: 'The useful one. Walk to the water, get on the bike path, come back wet.',
      day: 'Default swim, no-car days, easy dinners at home.',
      water: 'Public stretch — walk in, repeat.',
      food: 'Bakery, small market, lake-fish lunch on the water.',
      photo: 'assets/ride/ride_lake_tree_sevrier.jpg'
    },
    {
      id: 'st-jorioz', name: 'Saint-Jorioz', zone: 'West shore · sandy beach',
      coords: [45.8245, 6.1641],
      supports: ['beach', 'lake'],
      why: 'The big sandy beach. Bring towels and do very little.',
      day: 'A full, lazy beach day with shade and space.',
      water: 'Sand entry, lawns, diving board. [CHECK: summer lifeguard dates]',
      food: 'Buvette snack or a market picnic.',
      photo: 'assets/ride/ride_eastern_shore_dad.jpg'
    },
    {
      id: 'duingt', name: 'Duingt', zone: 'The narrows · château',
      coords: [45.8086, 6.2051],
      supports: ['lake', 'food', 'wander'],
      why: 'Where the lake pinches. Château on the point, the clearest water under the bridges.',
      day: 'Bike there, lunch, swim, ride home before the heat.',
      water: 'Small public spots — clear, cool, calm.',
      food: 'Lakeside lunch looking onto the petit lac.',
      photo: 'assets/ride/ride_clear_water_handlebar.jpg'
    },
    {
      id: 'doussard', name: 'Doussard / Bout-du-Lac', zone: 'South end · grassy & flat',
      coords: [45.7826, 6.2197],
      supports: ['beach', 'lake', 'bikes'],
      why: 'Big grassy beach, mountains on three sides, the calmest water for SUP and floating.',
      day: 'Hot, lazy days and group sprawl.',
      water: 'Walk in from the lawns; paddle out and drift.',
      food: 'Picnic. The Voie Verte ends near here.',
      photo: 'assets/ride/ride_turquoise_eastern_shore.jpg'
    },
    {
      id: 'angon', name: 'Angon', zone: 'East shore · quieter',
      coords: [45.8345, 6.2206],
      supports: ['lake', 'apero', 'wander'],
      why: 'Talloires’ quiet neighbour. A stream into the lake, the same château view, less volume.',
      day: 'A long swim, then beach apéro into the evening.',
      water: 'Public beach walk-in, cooler near the stream.',
      food: 'Beach bar with your feet near the water.',
      photo: 'assets/chavoire/chavoire_path_people.jpg'
    },
    {
      id: 'talloires', name: 'Talloires', zone: 'East shore · bay',
      coords: [45.8404, 6.2167],
      supports: ['lake', 'food', 'apero'],
      why: 'Clear water, docks, boats. The lake gets a little less subtle here, in a good way.',
      day: 'Diving boards, a lunch out, swim, repeat.',
      water: 'Plage de Talloires-Montmin — paddling pool, slide, boards.',
      food: 'Lake-edge lunch; book ahead on Saturdays.',
      photo: 'assets/chavoire/chavoire_sunset_lake.jpg'
    },
    {
      id: 'menthon', name: 'Menthon-Saint-Bernard', zone: 'East shore · pontoons',
      coords: [45.8624, 6.1978],
      supports: ['lake', 'beach', 'wander'],
      why: 'Floating pontoons below, a storybook château above. Best ratio of swim to crowd.',
      day: 'Pontoon swims and a walk after dinner.',
      water: 'Plage de Menthon — walk the pontoon, jump, repeat.',
      food: 'Beach snack bar; dinners up in the village.',
      photo: 'assets/chavoire/chavoire_sunset_ponton.jpg',
      official: 'https://www.chateau-de-menthon.com'
    },
    {
      id: 'veyrier', name: 'Veyrier-du-Lac', zone: 'East shore · quick swim',
      coords: [45.8830, 6.1717],
      supports: ['lake', 'bikes'],
      why: 'La Brune: a free Pavillon Bleu beach with a flat lawn and the view straight across.',
      day: 'A quick clean swim, easy by bike from Annecy.',
      water: 'Walk-in, supervised in summer. [CHECK: lifeguard dates]',
      food: 'Eat back in Annecy or over in Talloires.',
      photo: 'assets/chavoire/chavoire_piste_lake.jpg'
    },
    {
      id: 'roc-de-chere', name: 'Roc de Chère', zone: 'East shore · nature reserve',
      coords: [45.8533, 6.2050],
      supports: ['wander', 'views'],
      why: 'A forested headland between Talloires and Menthon — shade and quiet between swims.',
      day: 'A short woods loop to break up a beach day.',
      water: 'Pebbly entries on the south side; scout before you commit.',
      food: 'Snack now, eat in Talloires or Menthon after.',
      photo: 'assets/ride/ride_turquoise_eastern_shore_card.jpg'
    },
    {
      id: 'semnoz', name: 'Le Semnoz', zone: 'Above the west shore · ~1700 m',
      coords: [45.7970, 6.1040],
      supports: ['views', 'bikes'],
      why: 'The drive-up (or ride-up) ridge with the whole lake below and Mont-Blanc on a clear day.',
      day: 'A picnic with a view, or a real climb on the bike.',
      water: '—',
      food: 'Bring a market picnic; a few buvettes up top.',
      photo: 'assets/orientation/orientation_relief.jpg',
      official: 'https://www.semnoz.fr'
    },
    {
      id: 'forclaz', name: 'Col de la Forclaz', zone: 'Above the east shore · ~1250 m',
      coords: [45.8070, 6.2440],
      supports: ['views', 'food'],
      why: 'The classic lake-from-above. Paragliders peel off the launch while you eat on the lawn.',
      day: 'A short drive (or a climb) for lunch with the best seat on the lake.',
      water: '—',
      food: 'Farm-restaurant terrace looking down the whole lake.',
      photo: 'assets/orientation/orientation_relief_card.jpg'
    },
    {
      id: 'aravis', name: 'Aravis / La Clusaz', zone: 'East over the passes · ~40 min',
      coords: [45.9040, 6.4230],
      supports: ['daytrip', 'food', 'bikes', 'views'],
      why: 'Reblochon country: green mountain villages, lift-served trails, cheese straight from the farm.',
      day: 'A day trip — cols on the bike, MTB in the park, or a cheese-and-views drive.',
      water: '—',
      food: 'Reblochon direct from Aravis farms; markets in Thônes.',
      photo: 'assets/orientation/orientation_relief.jpg',
      official: 'https://www.laclusaz.com'
    },
    {
      id: 'chamonix', name: 'Chamonix', zone: 'Mont-Blanc valley · ~1h15',
      coords: [45.9237, 6.8694],
      supports: ['daytrip', 'views'],
      why: 'The big one. Glaciers, the Aiguilles, an alpine town that means business.',
      day: 'A clear-weather day trip — go when the peaks are out, not when it’s grey.',
      water: '—',
      food: 'Town brasseries; pack the day around the weather.',
      photo: 'assets/orientation/orientation_relief.jpg',
      official: 'https://www.chamonix.com'
    }
  ];
  const AREA_BY_ID = Object.fromEntries(AREAS.map(a => [a.id, a]));

  // Which stretch of the lake each area belongs to (for "get your bearings").
  const REGION_OF = {
    annecy: 'top',
    sevrier: 'west', 'st-jorioz': 'west', duingt: 'west',
    doussard: 'south',
    veyrier: 'east', menthon: 'east', talloires: 'east', angon: 'east', 'roc-de-chere': 'east',
    semnoz: 'heights', forclaz: 'heights',
    aravis: 'beyond', chamonix: 'beyond'
  };
  AREAS.forEach(a => { a.region = REGION_OF[a.id] || 'beyond'; });

  /* ---------- PLANS --------------------------------------------------
     The decision payload. Simple, useful cards — title, one line, where,
     rough time, rough cost, a few day-modes, and a short note only when
     it earns its place. Each plan points back to an area (for the map). */
  const PLANS = [
    {
      id: 'sevrier-swim', title: 'Walk-in swim at Sévrier', areaId: 'sevrier',
      desc: 'Towel under your arm, swim, dry on the grass, walk home.',
      time: '1–2 hr', cost: 'free',
      modes: ['lake', 'low-effort', 'no-car', 'afternoon'],
      note: 'The home-base default when nobody can decide.'
    },
    {
      id: 'st-jorioz-beach', title: 'Beach day at Saint-Jorioz', areaId: 'st-jorioz',
      desc: 'Sand entry, lawns and shade — the easy full-day beach.',
      time: 'Half–full day', cost: '€',
      modes: ['beach', 'lake', 'low-effort', 'clear'],
      note: 'Paid extras (chairs, paddling pool) on top of the free sand. [CHECK: lifeguard dates]'
    },
    {
      id: 'doussard-sprawl', title: 'Sprawl at Bout-du-Lac', areaId: 'doussard',
      desc: 'Grassy beach, mountains on three sides, the calmest water to float on.',
      time: 'Full day', cost: 'free',
      modes: ['beach', 'lake', 'low-effort', 'clear', 'views'],
      note: 'Best with a group and a SUP. Picnic — bring everything.'
    },
    {
      id: 'duingt-bike-lunch', title: 'Bike to Duingt for lunch', areaId: 'duingt',
      desc: 'Ride the lake path south, château view, lunch, swim, roll home.',
      time: 'Half day', cost: '€€',
      modes: ['easy-bike', 'food', 'lake', 'afternoon', 'no-car'],
      note: 'Arrive by bike — driving kills the point.'
    },
    {
      id: 'voie-verte-south', title: 'Voie Verte south', areaId: 'doussard',
      desc: 'Flat, separated bike path from Sévrier toward Bout-du-Lac with the lake the whole way.',
      time: 'Half day', cost: 'free',
      modes: ['easy-bike', 'no-car', 'lake', 'low-effort'],
      note: 'Clearest water under the bridges near Duingt. [CHECK: any path closures]'
    },
    {
      id: 'east-shore-swim', title: 'Bike-to-swim, east shore', areaId: 'veyrier',
      desc: 'Pick up the path in Annecy, tree shade past Chavoire, clean swim at Veyrier.',
      time: 'Half day', cost: 'free',
      modes: ['easy-bike', 'lake', 'afternoon', 'no-car'],
      note: 'Coffee back in town after.'
    },
    {
      id: 'menthon-pontoons', title: 'Pontoon day at Menthon', areaId: 'menthon',
      desc: 'Walk out on the floating pontoons, jump, sun-dry, repeat.',
      time: 'Half day', cost: '€',
      modes: ['lake', 'beach', 'afternoon', 'clear'],
      note: 'The pontoon day. Do it here.'
    },
    {
      id: 'angon-apero', title: 'Swim + apéro at Angon', areaId: 'angon',
      desc: 'Long late swim, then saucisson and a drink with your feet near the water.',
      time: 'Afternoon → evening', cost: '€€',
      modes: ['apero', 'lake', 'afternoon'],
      note: 'The “we stayed for dinner” beach.'
    },
    {
      id: 'perfect-afternoon', title: 'One perfect afternoon', areaId: 'menthon',
      desc: 'Swim at Menthon → woods loop on Roc de Chère → apéro at Angon.',
      time: 'Afternoon', cost: '€',
      modes: ['afternoon', 'lake', 'apero', 'low-effort'],
      note: 'If you only get one good half-day, this is it.'
    },
    {
      id: 'market-cook', title: 'Annecy market, then cook', areaId: 'annecy',
      desc: 'Ride in for the morning market — cheese, charcuterie, peaches — swim, ride home, cook it all.',
      time: 'Morning', cost: '€€',
      modes: ['food', 'no-car', 'low-effort'],
      note: 'Markets Sun (big), Tue, Fri — mornings.',
      official: 'https://www.lac-annecy.com'
    },
    {
      id: 'savoyard-night', title: 'One Savoyard cheese night', areaId: 'sevrier',
      desc: 'Tartiflette, raclette or fondue — once, not three times in August.',
      time: 'Evening', cost: '€€',
      modes: ['food', 'apero', 'rainy'],
      note: 'Save it for a cooler evening, ideally up the hill.'
    },
    {
      id: 'boat-half-day', title: 'Lake-bus half day', areaId: 'annecy',
      desc: 'Take the summer lake boat between towns — bike one way, float back.',
      time: 'Half day', cost: '€€',
      modes: ['lake', 'low-effort', 'no-car', 'afternoon'],
      note: 'Compagnie des Bateaux runs most towns in summer. [CHECK: timetable & fares]',
      official: 'https://www.bateaux-annecy.com'
    },
    {
      id: 'semnoz-picnic', title: 'Picnic on the Semnoz ridge', areaId: 'semnoz',
      desc: 'Drive (or ride) up to the flat ridge for the whole-lake view and a market picnic.',
      time: 'Half day', cost: 'free',
      modes: ['views', 'clear', 'low-effort', 'food'],
      note: 'Mont-Blanc on a clear day; no edge exposure on the ridge walk.',
      official: 'https://www.semnoz.fr'
    },
    {
      id: 'forclaz-lunch', title: 'Lunch above the lake', areaId: 'forclaz',
      desc: 'Up to Col de la Forclaz for lunch on the lawn while the paragliders drop in.',
      time: 'Half day', cost: '€€',
      modes: ['views', 'clear', 'food', 'afternoon'],
      note: 'Best seat on the lake. We watch from the lawn.'
    },
    {
      id: 'mont-veyrier-walk', title: 'Walk up Mont Veyrier', areaId: 'veyrier',
      desc: 'Half-day climb on the east-shore ridge for the full lake from the trail.',
      time: 'Half day', cost: 'free',
      modes: ['views', 'clear'],
      note: 'A proper walk-up. [CHECK: trailhead & timing]'
    },
    {
      id: 'roc-walk', title: 'Forest loop on Roc de Chère', areaId: 'roc-de-chere',
      desc: 'A short, shaded woods loop in the reserve between two swims.',
      time: '1–2 hr', cost: 'free',
      modes: ['low-effort', 'views', 'afternoon', 'rainy']
    },
    {
      id: 'cascade-angon', title: 'Cool-off walk to Cascade d’Angon', areaId: 'angon',
      desc: 'Short, mossy climb to a waterfall — the cool corner on a hot day.',
      time: '1–2 hr', cost: 'free',
      modes: ['low-effort', 'afternoon', 'views']
    },
    {
      id: 'semnoz-climb', title: 'Climb the Semnoz by bike', areaId: 'semnoz',
      desc: 'The local benchmark climb from the lake up to the ridge.',
      time: 'Half day', cost: 'free',
      modes: ['big-cycling', 'cols', 'views'],
      note: '[CHECK: distance, elevation gain & gradient]'
    },
    {
      id: 'aravis-cols', title: 'Big col day in the Aravis', areaId: 'aravis',
      desc: 'Link the famous passes east of the lake for a real day in the saddle.',
      time: 'Full day', cost: 'free',
      modes: ['big-cycling', 'cols', 'views', 'daytrip', 'clear'],
      note: 'Cols de la Forclaz / des Aravis / de la Croix-Fry nearby. [CHECK: route & which cols]'
    },
    {
      id: 'scenic-loop', title: 'Scenic road loop of the lake', areaId: 'talloires',
      desc: 'The road circuit of the lake — rolling, scenic, a proper outing.',
      time: 'Half day', cost: 'free',
      modes: ['big-cycling', 'views', 'clear'],
      note: 'Quieter and prettier on the east shore. [CHECK: distance & traffic notes]'
    },
    {
      id: 'laclusaz-mtb', title: 'Lift MTB & bike park', areaId: 'aravis',
      desc: 'Shuttle up, ride down — lift-served mountain biking in the Aravis in summer.',
      time: 'Full day', cost: '€€',
      modes: ['mtb', 'daytrip'],
      note: '[CHECK: La Clusaz / Grand-Bornand bike-park open dates, lift pass & trail grades]',
      official: 'https://www.laclusaz.com'
    },
    {
      id: 'pump-velodrome', title: 'Pump track & track session', areaId: 'annecy',
      desc: 'Low-commitment wheels: a pump track lap or a session on the track.',
      time: '1 hr', cost: 'free',
      modes: ['mtb', 'low-effort', 'afternoon'],
      note: '[CHECK: nearest pump track location] · [CHECK: velodrome / track availability]'
    },
    {
      id: 'rainy-gorges', title: 'Gorges du Fier + château', areaId: 'annecy',
      desc: 'A walkway pinned along a slot canyon, paired with the medieval keep next door.',
      time: 'Half day', cost: '€',
      modes: ['rainy', 'views', 'daytrip'],
      note: 'Cool and shaded — good on a hot day too. [CHECK: seasonal opening]',
      official: 'https://www.gorgesdufier.com'
    },
    {
      id: 'rainy-town', title: 'Rainy day in the old town', areaId: 'annecy',
      desc: 'Covered market arcades, the Palais de l’Île, a long lunch, cheese shopping.',
      time: 'Flexible', cost: '€€',
      modes: ['rainy', 'food', 'low-effort', 'no-car'],
      note: '[CHECK: museum / Palais de l’Île opening hours]'
    },
    {
      id: 'chamonix-day', title: 'Clear-day trip to Chamonix', areaId: 'chamonix',
      desc: 'Drive over for the town, the glacier valley and the big peaks.',
      time: 'Full day', cost: '€€',
      modes: ['daytrip', 'views', 'clear'],
      note: 'Go only when the summits are out. [CHECK: lift / Montenvers train info]',
      official: 'https://www.chamonix.com'
    },
    {
      id: 'aravis-cheese', title: 'Aravis & Reblochon run', areaId: 'aravis',
      desc: 'Mountain villages, a cheese cellar or farm, loop home through Thônes.',
      time: 'Full day', cost: '€',
      modes: ['daytrip', 'food', 'views'],
      note: 'Closer and greener than Chamonix; good on a so-so day.',
      official: 'https://www.laclusaz.com'
    },
    {
      id: 'no-car-day', title: 'No-car day from the house', areaId: 'sevrier',
      desc: 'Bakery → bike-path swim → lawn nap → second swim → dinner from the fridge.',
      time: 'Full day', cost: '€',
      modes: ['no-car', 'low-effort', 'lake', 'food'],
      note: 'Everything on foot, by bike or by lake boat.'
    },
    {
      id: 'les-gets-bikepark', title: 'Bike-park day at Les Gets',
      where: 'Les Gets · Portes du Soleil',
      media: { placeholder: true, emoji: '🚵', tint: 'pine', label: 'Les Gets bike park' },
      desc: 'Lift-served downhill and flow trails in one of the Alps’ big bike-park towns.',
      time: 'Full day', cost: '€€',
      modes: ['mtb', 'daytrip'],
      effort: 'big', carNeeded: true,
      note: '[CHECK: drive time from the lake] · [CHECK: bike-park open dates, lift pass & rental] · [CHECK: official link]'
    }
  ];
  const PLAN_BY_ID = Object.fromEntries(PLANS.map(p => [p.id, p]));

  /* Derive lightweight decision fields so "Build a day" and filters work
     without hand-tagging every plan. Explicit values on a plan win. */
  function deriveEffort(p) {
    if (p.effort) return p.effort;
    if (p.modes.some(m => ['big-cycling', 'cols', 'mtb', 'daytrip'].includes(m))) return 'big';
    if (p.modes.includes('low-effort')) return 'low';
    if (/full day/i.test(p.time)) return 'big';
    if (/1–2 hr|afternoon|morning|evening|flexible/i.test(p.time)) return 'low';
    return 'medium';
  }
  function deriveCar(p) {
    if (typeof p.carNeeded === 'boolean') return p.carNeeded;
    if (p.modes.includes('no-car')) return false;
    if (p.modes.some(m => ['daytrip', 'cols', 'mtb'].includes(m))) return true;
    const a = AREA_BY_ID[p.areaId];
    if (a && ['semnoz', 'forclaz', 'aravis', 'chamonix'].includes(a.id)) return true;
    return false;
  }
  PLANS.forEach(p => {
    p.effort = deriveEffort(p);
    p.carNeeded = deriveCar(p);
    p.weather = p.modes.includes('clear') ? 'clear' : 'any';
  });

  /* ---------- BIKE ---------------------------------------------------
     A dedicated bike brain: casual to serious. Route specifics are left
     as [CHECK: …] rather than invented. */
  const BIKE = [
    {
      group: 'Easy lake path · Voie Verte',
      items: [
        { name: 'Sévrier → Doussard (Voie Verte)', desc: 'Flat, separated, lake the whole way. The default casual ride.', meta: 'Easy · free', planId: 'voie-verte-south' },
        { name: 'Annecy → Veyrier (east shore)', desc: 'Tree shade past Chavoire, lake wall, ~15 min by bike.', meta: 'Easy · free', planId: 'east-shore-swim' }
      ]
    },
    {
      group: 'Bike-to-swim',
      items: [
        { name: 'Ride to Duingt for lunch', desc: 'Lake path south, château, lunch, swim, home.', meta: 'Easy · half day', planId: 'duingt-bike-lunch' },
        { name: 'Path-and-plunge laps', desc: 'String together Marquisats, Chavoire and Veyrier on the east shore.', meta: 'Easy · free', planId: 'east-shore-swim' }
      ]
    },
    {
      group: 'Major climbs & cols',
      items: [
        { name: 'Le Semnoz', desc: 'The local benchmark — lake to ridge. [CHECK: length & gradient]', meta: 'Hard · free', planId: 'semnoz-climb' },
        { name: 'Col de la Forclaz', desc: 'Steep climb to the paraglider launch and the lake-from-above view.', meta: 'Hard · free', areaId: 'forclaz' },
        { name: 'Aravis passes', desc: 'Forclaz / Aravis / Croix-Fry country east of the lake. [CHECK: which cols]', meta: 'Epic · free', planId: 'aravis-cols' }
      ]
    },
    {
      group: 'Scenic road rides',
      items: [
        { name: 'Full lake road loop', desc: 'Rolling circuit; prettier and quieter on the east shore. [CHECK: distance]', meta: 'Medium · free', planId: 'scenic-loop' }
      ]
    },
    {
      group: 'MTB, bike park & pump track',
      items: [
        { name: 'La Clusaz / Grand-Bornand bike park', desc: 'Lift-served descents in summer. [CHECK: open dates, pass, grades]', meta: 'Day trip · €€', planId: 'laclusaz-mtb', official: 'https://www.laclusaz.com' },
        { name: 'Pump track', desc: 'Quick wheels close to the lake. [CHECK: nearest pump track location]', meta: 'Casual · free', planId: 'pump-velodrome' },
        { name: 'Velodrome / track', desc: 'Track session option. [CHECK: velodrome availability & booking]', meta: '[CHECK]', planId: 'pump-velodrome' }
      ]
    },
    {
      group: 'Rentals & links',
      items: [
        { name: 'Bike rental — Annecy & Sévrier', desc: 'Town and lakeside shops; book ahead in August. [CHECK: rental shop & rates]', meta: '[CHECK: rental info]' },
        { name: 'Lake destination info', desc: 'Official destination site for routes and services.', meta: 'Official', official: 'https://www.lac-annecy.com' }
      ]
    }
  ];

  /* ---------- LAKE & BEACHES ----------------------------------------- */
  const LAKE = [
    {
      group: 'Beaches & swimming',
      items: [
        { name: 'Saint-Jorioz', desc: 'Big sandy west-shore beach, lawns and shade.', tag: 'Sand · €', areaId: 'st-jorioz' },
        { name: 'Bout-du-Lac (Doussard)', desc: 'Grassy south-end beach, calmest water, mountains around.', tag: 'Grass · free', areaId: 'doussard' },
        { name: 'Menthon pontoons', desc: 'Floating pontoons to jump from and dry off on.', tag: 'Pontoon · €', areaId: 'menthon' },
        { name: 'La Brune, Veyrier', desc: 'Free Pavillon Bleu beach, flat lawn, view across.', tag: 'Free swim', areaId: 'veyrier' },
        { name: 'Plage des Marquisats, Annecy', desc: 'Town swim — steps into clean water by the old town.', tag: 'Town · free', areaId: 'annecy' }
      ]
    },
    {
      group: 'Low-effort lake afternoons',
      items: [
        { name: 'Walk-in swim at Sévrier', desc: 'From the house, in the water, back on the grass.', tag: 'No plan', planId: 'sevrier-swim' },
        { name: 'Lake-bus half day', desc: 'Let the boat do the work; bike one way.', tag: 'Boat', planId: 'boat-half-day' }
      ]
    },
    {
      group: 'Bike-to-beach',
      items: [
        { name: 'East-shore bike-to-swim', desc: 'Annecy out to Veyrier on the shaded path.', tag: 'Easy', planId: 'east-shore-swim' },
        { name: 'Voie Verte to Duingt', desc: 'Ride south to the clearest water for a lunch swim.', tag: 'Easy', planId: 'duingt-bike-lunch' }
      ]
    },
    {
      group: 'Picnic & clear-weather favourites',
      items: [
        { name: 'Doussard lawns', desc: 'Best picnic + float on a hot blue day.', tag: 'Clear day', areaId: 'doussard' },
        { name: 'Duingt narrows', desc: 'Glass-clear water under the bridges; arrive by bike.', tag: 'Clear day', areaId: 'duingt' },
        { name: 'Roc de Chère shade', desc: 'Forest loop to break up a beach day.', tag: 'Shade', planId: 'roc-walk' }
      ]
    }
  ];

  /* ---------- FOOD / MARKETS / APÉRO --------------------------------- */
  const FOOD = [
    {
      group: 'Markets',
      items: [
        { name: 'Vieux Annecy market', desc: 'Sun (big), Tue, Fri mornings. Cheese, charcuterie, peaches, bread. Most meals start here.', tag: 'Free to wander', official: 'https://www.lac-annecy.com' },
        { name: 'Sévrier market', desc: 'Smaller, weekly, walkable from home base. [CHECK: market day]', tag: 'Local' }
      ]
    },
    {
      group: 'Bakeries & cheese',
      items: [
        { name: 'Daily bakery run', desc: 'Baguette, pain de campagne, croissants — the Sévrier bakery is enough.', tag: '€' },
        { name: 'Reblochon, Tomme, Beaufort', desc: 'Buy raw and direct from Aravis farms if you head up — much better.', tag: 'Cheese', areaId: 'aravis' }
      ]
    },
    {
      group: 'Picnic supplies & lake snacks',
      items: [
        { name: 'Market picnic', desc: 'Bread, tomato, saucisson, three cheeses you didn’t mean to buy.', tag: '€', planId: 'market-cook' },
        { name: 'Buvettes & beach bars', desc: 'Snacks and drinks at the bigger beaches (Saint-Jorioz, Angon, Menthon).', tag: '€' }
      ]
    },
    {
      group: 'Casual lakeside meals',
      items: [
        { name: 'Lake fish lunch', desc: 'If a menu has féra or filets de perche, order that.', tag: '€€' },
        { name: 'Duingt lake-path stop', desc: 'A bite on the ride south, feet near the water.', tag: '€', areaId: 'duingt' },
        { name: 'One Savoyard night', desc: 'Tartiflette or fondue once — save it for a cool evening.', tag: '€€', planId: 'savoyard-night' }
      ]
    },
    {
      group: 'Apéro & beautiful evenings',
      items: [
        { name: 'Angon beach apéro', desc: 'Late swim, then a drink with your feet near the water.', tag: 'Golden hour', planId: 'angon-apero' },
        { name: 'Menthon after dinner', desc: 'Pontoons and a walk under the château as the light drops.', tag: 'Evening', areaId: 'menthon' },
        { name: 'Forclaz lawn', desc: 'Highest, widest evening view over the lake.', tag: 'View', areaId: 'forclaz' }
      ]
    },
    {
      group: 'Wander before or after',
      items: [
        { name: 'Annecy canals & old town', desc: 'Drift, don’t plan — best before or after a meal.', tag: 'Stroll', areaId: 'annecy' },
        { name: 'Talloires bay', desc: 'Ports, docks and a short waterfront wander.', tag: 'Stroll', areaId: 'talloires' }
      ]
    }
  ];

  /* ---------- DAY TRIPS (grouped by usefulness / effort) ------------- */
  const TRIPS = [
    {
      group: 'Very worth it',
      items: [
        { name: 'Aravis & La Clusaz', desc: 'Closer than Chamonix. Reblochon from the farm, loop home via Thônes.', planId: 'aravis-cheese' },
        { name: 'Chamonix (clear day)', desc: 'The big peaks and the glacier valley — when the weather is with you.', planId: 'chamonix-day' }
      ]
    },
    {
      group: 'Half-day',
      items: [
        { name: 'Gorges du Fier', desc: 'Slot-canyon walkway + a château next door. Pair with lunch on the way back.', planId: 'rainy-gorges' }
      ]
    },
    {
      group: 'Clear-weather only',
      items: [
        { name: 'Semnoz ridge picnic', desc: 'Whole-lake view and Mont-Blanc — pointless in cloud.', planId: 'semnoz-picnic' },
        { name: 'Col de la Forclaz', desc: 'Lake-from-above lunch; save it for blue skies.', planId: 'forclaz-lunch' }
      ]
    },
    {
      group: 'Bigger effort',
      items: [
        { name: 'Plateau des Glières', desc: 'High pasture plateau north-east of the lake. [CHECK: access & timing]', areaId: 'aravis' },
        { name: 'Gruyères (CH)', desc: 'Swiss cheese-and-castle village. Long day — worth it once at most.', }
      ]
    },
    {
      group: 'Maybe',
      items: [
        { name: 'Yvoire (Lac Léman)', desc: 'Flowery stone village on Lake Geneva. Very busy in August.' },
        { name: 'Geneva', desc: 'Old town and lakefront ~45 min north, if someone’s curious.' },
        { name: 'Megève', desc: 'Pretty pass-through on the Chamonix run — not a day on its own.' }
      ]
    },
    {
      group: 'Probably skip',
      items: [
        { name: 'Far Swiss detours', desc: 'Two hours each way eats the day. Stay on the lake unless someone really wants it.' }
      ]
    }
  ];

  /* ---------- MAP PLACES --------------------------------------------
     Markers are the same towns, plans and spots used elsewhere — not a
     random pin dump. Each links back into the app (#/areas/… or #/plan/…). */
  const MAP_CATEGORIES = [
    { id: 'area',  label: 'Areas',  color: '#1f7fb3', glyph: '◆' },
    { id: 'swim',  label: 'Swim',   color: '#36b9cc', glyph: '~' },
    { id: 'bike',  label: 'Bike',   color: '#2f6b4f', glyph: '%' },
    { id: 'food',  label: 'Food',   color: '#b35a1f', glyph: '•' },
    { id: 'view',  label: 'Views',  color: '#6b4fa0', glyph: '▲' },
    { id: 'trip',  label: 'Trips',  color: '#114b73', glyph: '→' }
  ];

  // Areas become 'area' markers automatically; extra spots added below.
  const MAP_SPOTS = [
    { id: 'm-marquisats', cat: 'swim', name: 'Plage des Marquisats', coords: [45.8950, 6.1360], blurb: 'Annecy town swim — steps into clean water.', route: '#/areas/annecy' },
    { id: 'm-stjorioz-beach', cat: 'swim', name: 'Saint-Jorioz beach', coords: [45.8330, 6.1640], blurb: 'Long sandy west-shore beach.', route: '#/plan/st-jorioz-beach' },
    { id: 'm-doussard-beach', cat: 'swim', name: 'Bout-du-Lac swim', coords: [45.7790, 6.2210], blurb: 'Clearest water on the lake.', route: '#/plan/doussard-sprawl' },
    { id: 'm-angon-beach', cat: 'swim', name: 'Angon beach', coords: [45.8290, 6.2170], blurb: 'Swim then apéro at the water’s edge.', route: '#/plan/angon-apero' },
    { id: 'm-labrune', cat: 'swim', name: 'La Brune (Veyrier)', coords: [45.8865, 6.1782], blurb: 'Free Pavillon Bleu beach.', route: '#/areas/veyrier' },
    { id: 'm-menthon-pont', cat: 'swim', name: 'Menthon pontoons', coords: [45.8615, 6.1965], blurb: 'Floating pontoons to jump from.', route: '#/plan/menthon-pontoons' },

    { id: 'm-voieverte', cat: 'bike', name: 'Voie Verte (lake path)', coords: [45.8700, 6.1390], blurb: 'Flat separated path, Sévrier to Doussard.', route: '#/plan/voie-verte-south' },
    { id: 'm-eastshore', cat: 'bike', name: 'East-shore path', coords: [45.8900, 6.1700], blurb: 'Annecy to Veyrier in the tree shade.', route: '#/plan/east-shore-swim' },
    { id: 'm-semnoz-climb', cat: 'bike', name: 'Semnoz climb', coords: [45.7970, 6.1040], blurb: 'The local benchmark climb.', route: '#/plan/semnoz-climb' },
    { id: 'm-laclusaz', cat: 'bike', name: 'La Clusaz bike park', coords: [45.9040, 6.4230], blurb: 'Lift-served MTB in summer.', route: '#/plan/laclusaz-mtb' },

    { id: 'm-market', cat: 'food', name: 'Annecy old-town market', coords: [45.8990, 6.1260], blurb: 'Tue / Fri / Sun mornings.', route: '#/plan/market-cook' },
    { id: 'm-thones', cat: 'food', name: 'Thônes — Reblochon', coords: [45.8820, 6.3250], blurb: 'Reblochon home turf on the way to the Aravis.', route: '#/plan/aravis-cheese' },

    { id: 'm-three-crosses', cat: 'view', name: 'Circuit des 3 Croix', coords: [45.8450, 6.1260], blurb: 'Short loop above the west shore, three lake angles.', route: '#/day?mode=views' },
    { id: 'm-cascade-angon', cat: 'view', name: 'Cascade d’Angon', coords: [45.8250, 6.2210], blurb: 'Cool waterfall walk on a hot day.', route: '#/plan/cascade-angon' },
    { id: 'm-mont-veyrier', cat: 'view', name: 'Mont Veyrier / Baron', coords: [45.9010, 6.1910], blurb: 'East-shore ridge, full lake from the trail.', route: '#/plan/mont-veyrier-walk' },
    { id: 'm-gorges', cat: 'view', name: 'Gorges du Fier', coords: [45.8970, 6.0450], blurb: 'Slot-canyon walkway west of Annecy.', route: '#/plan/rainy-gorges' },

    { id: 'm-chamonix', cat: 'trip', name: 'Chamonix', coords: [45.9237, 6.8694], blurb: 'Mont-Blanc valley — a clear-day trip.', route: '#/plan/chamonix-day' },
    { id: 'm-aravis-col', cat: 'trip', name: 'Col des Aravis', coords: [45.8720, 6.4640], blurb: 'Postcard pass with the Mont-Blanc range.', route: '#/plan/aravis-cols' },
    { id: 'm-yvoire', cat: 'trip', name: 'Yvoire', coords: [46.3710, 6.3270], blurb: 'Stone village on Lac Léman.', route: '#/trips' },
    { id: 'm-geneva', cat: 'trip', name: 'Geneva', coords: [46.2040, 6.1430], blurb: 'Old town and lakefront, ~45 min north.', route: '#/trips' }
  ];

  /* ---------- DISCOVER ----------------------------------------------
     For "we don't even know what's here". Short, characterful context
     plus inspiration that routes back into a real plan. Established
     facts only; specific dates/figures are left as [CHECK: …]. */

  // The short story of the lake — history & context, kept tight.
  const STORY = [
    {
      emoji: '🧊', title: 'Carved by ice',
      text: 'The lake sits in a trough that Ice-Age glaciers scooped out, then filled as they melted. The walls of peaks around it are what the ice left behind.'
    },
    {
      emoji: '💧', title: 'The cleanest lake in Europe',
      text: 'By the 1960s it was badly polluted. The towns around the shore built one of Europe’s first lake-wide sewer systems and brought it back — that glass-clear water is the result, and it’s fiercely protected.'
    },
    {
      emoji: '🛶', title: 'The Venice of the Alps',
      text: 'Annecy’s old town is laced with canals off the river Thiou. The Palais de l’Île — the little ship-shaped building midstream — has been a house, a court and a prison since the 12th century.'
    },
    {
      emoji: '🏰', title: 'A castle on every shoulder',
      text: 'Château d’Annecy watches the old town, Château de Menthon perches on its hill, and Duingt’s tower guards the narrows. Half the skyline is medieval.'
    },
    {
      emoji: '🧀', title: 'Cheese with a backstory',
      text: 'The story goes that Reblochon was born from a sneaky second milking — farmers under-declared their cows to the landlord, then milked again once he’d gone. The Aravis farms still make it.'
    }
  ];

  // "Did you know?" — each surprises, then points at something to actually do.
  const INSPIRE = [
    {
      title: 'You can swim clean across it',
      text: 'The water’s pure enough that people swim shore to shore. You don’t have to go far — a pontoon swim off Menthon feels just as good.',
      action: { label: 'Plan a lake day', route: '#/day?mode=lake' }
    },
    {
      title: 'There’s a car-free path the length of the lake',
      text: 'The Voie Verte runs traffic-free down the whole west shore. Most visitors never leave the road and miss it entirely.',
      action: { label: 'Ride the easy path', route: '#/day?mode=easy-bike' }
    },
    {
      title: 'The best view isn’t from the lake',
      text: 'It’s from above it. Col de la Forclaz and the Semnoz ridge look straight down on the whole thing — worth a half-day on a clear one.',
      action: { label: 'Go up high', route: '#/day?mode=views' }
    },
    {
      title: 'The water is clearest where it pinches',
      text: 'Down at Duingt the lake narrows and goes glass-clear under the bridges. Arrive by bike and it’s a perfect lunch swim.',
      action: { label: 'See Duingt', route: '#/areas/duingt' }
    },
    {
      title: 'Reblochon tastes different at the source',
      text: 'Buy it raw, straight from an Aravis farm 40 minutes away, and it’s a completely different cheese to the supermarket one.',
      action: { label: 'Aravis & cheese', route: '#/areas/aravis' }
    },
    {
      title: 'Mornings belong to the market',
      text: 'The old-town market, three days a week, is where most meals here begin. Build the day around it rather than around a restaurant.',
      action: { label: 'Food & markets', route: '#/food' }
    }
  ];

  // What’s special about being here in August specifically.
  const SEASON = [
    {
      title: 'Fête du Lac',
      text: 'One of Europe’s biggest fireworks-and-light shows, fired out over the water on a Saturday in early August. Seats sell out — book ahead. [CHECK: exact date & tickets]'
    },
    {
      title: 'Long light, late swims',
      text: 'August evenings stay warm and the light lasts. Beach apéro into a sunset swim is the signature move.',
      action: { label: 'Apéro & evening', route: '#/day?mode=apero' }
    },
    {
      title: 'Some places shut for a week or two',
      text: 'Small bakeries and restaurants take their own August holidays. Worth checking the day before you count on one.'
    }
  ];

  /* ---------- ZONES (get your bearings) -----------------------------
     The simple mental map for someone who's never been. Each opens the
     areas filtered to that stretch of the lake. */
  const ZONES = [
    { region: 'top',     emoji: '🏛️', label: 'Annecy',        text: 'Old town, market, canals' },
    { region: 'west',    emoji: '🚲', label: 'West shore',    text: 'Sévrier · Saint-Jorioz · Duingt — beaches & the bike path' },
    { region: 'east',    emoji: '⛵', label: 'East shore',    text: 'Veyrier · Menthon · Talloires — clear water & pontoons' },
    { region: 'south',   emoji: '🌾', label: 'South end',     text: 'Doussard / Bout-du-Lac — grassy, calm, mountains close' },
    { region: 'heights', emoji: '🌄', label: 'Above the lake',text: 'Semnoz & Forclaz — the big views' },
    { region: 'beyond',  emoji: '🏔️', label: 'Beyond',        text: 'Aravis · La Clusaz · Les Gets · Chamonix' }
  ];

  /* ---------- CATEGORIES (the "worlds" nearby) ----------------------
     Photo-led inspiration. Each is a kind of day you might not know was
     possible, with lifelike starter ideas and links into real plans and
     the map. tint → cover colour; media → real photo or labelled
     placeholder ([CHECK: add photo …]). */
  const CATEGORIES = [
    {
      id: 'lake-life', title: 'Lake life', emoji: '🏊', tint: 'aqua',
      vibe: 'The default joy — clean, cold, turquoise water you just walk into.',
      looksLike: 'Grab a towel, walk to the nearest beach or pontoon, swim out into water so clear you can see your feet, dry on the grass, and do it all again after lunch.',
      media: { photo: 'assets/ride/ride_turquoise_eastern_shore.jpg' },
      starters: ['Walk-in swim from Sévrier', 'Pontoon jumps at Menthon', 'Hop between towns on the lake boat', 'Float on the calm water at Bout-du-Lac'],
      modes: ['lake'], mapCat: 'swim',
      planIds: ['sevrier-swim', 'menthon-pontoons', 'boat-half-day', 'doussard-sprawl']
    },
    {
      id: 'beaches', title: 'Beaches & swim spots', emoji: '🏖️', tint: 'aqua',
      vibe: 'The right beach for the mood — sand, lawns, pontoons or a quiet cove.',
      looksLike: 'Pack the cooler, claim a patch of sand or grass, alternate swims and snacks all afternoon, and stay until the light goes gold.',
      media: { photo: 'assets/ride/ride_balmettes_blue_water.jpg' },
      starters: ['Sandy full-day beach at Saint-Jorioz', 'Grassy sprawl at Bout-du-Lac', 'Free Pavillon Bleu swim at Veyrier', 'Late swim + apéro at Angon'],
      modes: ['beach'], mapCat: 'swim',
      planIds: ['st-jorioz-beach', 'doussard-sprawl', 'angon-apero']
    },
    {
      id: 'old-annecy', title: 'Old Annecy', emoji: '🛶', tint: 'alpine',
      vibe: 'The Venice of the Alps — canals, pastel houses, a castle and the best market around.',
      looksLike: 'Drift through the canal streets with a gelato, raid the morning market for cheese and peaches, swim off the Marquisats steps, then linger over a long dinner.',
      media: { placeholder: true, emoji: '🛶', label: 'Old Annecy', check: 'add photo of Annecy old town / Palais de l’Île' },
      starters: ['Morning market, then cook at home', 'Town swim at Plage des Marquisats', 'Wander the canals before dinner', 'Rainy-day arcades & the Palais de l’Île'],
      modes: ['food', 'rainy'], mapCat: 'food', areaIds: ['annecy'],
      planIds: ['market-cook', 'rainy-town']
    },
    {
      id: 'bike-paths', title: 'Bike paths & bike-to-swim', emoji: '🚲', tint: 'pine',
      vibe: 'Flat, car-free riding along the water — the easiest way to see the lake.',
      looksLike: 'Roll out of town on the separated path, stop wherever the water looks good, swim, ride to a lakeside lunch, and freewheel home in the warm evening.',
      media: { photo: 'assets/ride/ride_open_lake_path.jpg' },
      starters: ['Voie Verte south to Duingt for lunch', 'Annecy to Veyrier in the tree shade', 'Path-and-plunge swim laps'],
      modes: ['easy-bike'], mapCat: 'bike',
      planIds: ['voie-verte-south', 'duingt-bike-lunch', 'east-shore-swim']
    },
    {
      id: 'road-cycling', title: 'Big cols & road cycling', emoji: '🚴', tint: 'pine',
      vibe: 'Serious-legs country — famous climbs and a lake loop with a view at every turn.',
      looksLike: 'Set off early, grind up a legendary col, get the postcard Mont-Blanc view from the top, then descend to a swim before the day heats up.',
      media: { placeholder: true, emoji: '🚴', label: 'Cols & road rides', check: 'add photo of a col / road climb' },
      starters: ['Climb the Semnoz from the lake', 'A big Aravis col day', 'The full road loop of the lake'],
      modes: ['big-cycling', 'cols'], mapCat: 'bike',
      planIds: ['semnoz-climb', 'aravis-cols', 'scenic-loop']
    },
    {
      id: 'mtb', title: 'MTB & bike parks', emoji: '🚵', tint: 'pine',
      vibe: 'Lift-served descents, flow trails and pump tracks — gravity days near the lake.',
      looksLike: 'Shuttle to the top of an alpine resort, session berms and flow trails all afternoon, then collapse onto a terrace with a cold drink.',
      media: { placeholder: true, emoji: '🚵', label: 'MTB & bike park', check: 'add photo of a bike park (Les Gets / La Clusaz)' },
      starters: ['Bike-park day at Les Gets', 'Lift MTB at La Clusaz', 'A quick pump-track session'],
      modes: ['mtb'], mapCat: 'bike',
      planIds: ['les-gets-bikepark', 'laclusaz-mtb', 'pump-velodrome']
    },
    {
      id: 'alpine-villages', title: 'Alpine villages & mountain towns', emoji: '🏘️', tint: 'alpine',
      vibe: 'Swap the beach for green mountains, cheese cellars and cooler air for a day.',
      looksLike: 'Drive up into the Aravis, wander a wooden mountain village, buy Reblochon straight from the farm, soak up a ridiculous valley view, and be back at the lake by dinner.',
      media: { placeholder: true, emoji: '🏘️', label: 'Alpine villages', check: 'add photo of an Aravis village (La Clusaz / Le Grand-Bornand)' },
      starters: ['Aravis & Reblochon run', 'A day in La Clusaz', 'Cheese shopping in Thônes'],
      modes: ['daytrip'], mapCat: 'trip', areaIds: ['aravis'],
      planIds: ['aravis-cheese', 'laclusaz-mtb']
    },
    {
      id: 'views', title: 'Big views & clear-weather days', emoji: '🌄', tint: 'purple',
      vibe: 'When the sky is blue, get above the lake for the view that makes everyone gasp.',
      looksLike: 'Pick a clear morning, ride or drive up to a ridge, spread a market picnic with the whole lake and Mont-Blanc laid out below, and walk an easy path along the top.',
      media: { placeholder: true, emoji: '🌄', label: 'Big views', check: 'add photo from Semnoz / Col de la Forclaz' },
      starters: ['Picnic on the Semnoz ridge', 'Lunch above the lake at Col de la Forclaz', 'Walk up Mont Veyrier for the full lake'],
      modes: ['views', 'clear'], mapCat: 'view',
      planIds: ['semnoz-picnic', 'forclaz-lunch', 'mont-veyrier-walk']
    },
    {
      id: 'food', title: 'Markets & picnic food', emoji: '🧀', tint: 'sun',
      vibe: 'Cheap, joyful eating — markets, bakeries and lake-fish lunches beat fancy dinners here.',
      looksLike: 'Hit the morning market for cheese, charcuterie and peaches, build an enormous picnic, eat it by the water, and save one cosy Savoyard cheese night for later.',
      media: { placeholder: true, emoji: '🧀', label: 'Markets & food', check: 'add photo of the Annecy market / cheese' },
      starters: ['Build a market picnic', 'Lake-fish lunch on a terrace', 'One Savoyard cheese night', 'Daily bakery run'],
      modes: ['food'], mapCat: 'food',
      planIds: ['market-cook', 'savoyard-night']
    },
    {
      id: 'apero', title: 'Apéro & beautiful evenings', emoji: '🥂', tint: 'sun',
      vibe: 'The signature August move: a sunset swim and a drink with your feet near the water.',
      looksLike: 'Arrive at a west-facing beach in the late afternoon, swim as the light turns gold, lay out saucisson and a cold bottle, and watch the sun drop behind the mountains.',
      media: { photo: 'assets/chavoire/chavoire_sunset_lake.jpg' },
      starters: ['Beach apéro at Angon', 'Pontoons & a walk at Menthon', 'Sunset from the Forclaz lawn'],
      modes: ['apero'], mapCat: 'swim',
      planIds: ['angon-apero', 'perfect-afternoon']
    },
    {
      id: 'rainy', title: 'Rainy-day & culture', emoji: '🌧️', tint: 'alpine',
      vibe: 'Grey skies have a plan too — canyons, castles and covered old-town streets.',
      looksLike: 'When the cloud rolls in, walk the dramatic Gorges du Fier canyon, duck into a château, or potter the covered market arcades over a long lunch.',
      media: { placeholder: true, emoji: '🌧️', label: 'Rainy-day ideas', check: 'add photo of Gorges du Fier / a château' },
      starters: ['Gorges du Fier + a château', 'A long lunch in the old town', 'Forest loop on Roc de Chère'],
      modes: ['rainy'], mapCat: 'view',
      planIds: ['rainy-gorges', 'rainy-town', 'roc-walk']
    },
    {
      id: 'daytrips', title: 'Bigger day trips', emoji: '🧭', tint: 'alpine-deep',
      vibe: 'Worth leaving the lake for — Mont-Blanc, bike parks and storybook villages.',
      looksLike: 'Point the car at the mountains on a clear day, spend it under the glaciers in Chamonix or in a Portes-du-Soleil bike town, and come home tired and happy.',
      media: { placeholder: true, emoji: '🧭', label: 'Day trips', check: 'add photo of Chamonix / Mont-Blanc' },
      starters: ['Clear-day trip to Chamonix', 'Bike park at Les Gets', 'Aravis & Reblochon loop'],
      modes: ['daytrip'], mapCat: 'trip',
      planIds: ['chamonix-day', 'les-gets-bikepark', 'aravis-cheese']
    }
  ];
  const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

  /* ---------- DISCOVERIES ("you might not know you can do this") ----- */
  const DISCOVERIES = [
    { emoji: '🚵', title: 'Les Gets is a world-class bike park', text: 'A short drive into the Portes du Soleil gets you lift-served downhill and flow trails — most lake visitors never realise it’s there.', route: '#/plan/les-gets-bikepark' },
    { emoji: '🌄', title: 'Semnoz: the whole lake from a deckchair', text: 'You can drive (or ride) straight up to a flat ridge with Mont-Blanc and the entire lake below — barely any hiking needed.', route: '#/plan/semnoz-picnic' },
    { emoji: '🏞️', title: 'There’s a slot canyon 15 minutes away', text: 'The Gorges du Fier is a walkway bolted into a narrow river canyon — a dramatic half-day, great even when it’s grey.', route: '#/plan/rainy-gorges' },
    { emoji: '🥂', title: 'One afternoon = swim + woods + apéro', text: 'Menthon pontoons, a shaded loop on the Roc de Chère reserve, then a drink at Angon — all in a few easy hours.', route: '#/plan/perfect-afternoon' },
    { emoji: '🏔️', title: 'The Aravis are right next door', text: 'Forty minutes east is proper mountain-village country — Reblochon farms, cheese cellars and big green valleys.', route: '#/areas/aravis' },
    { emoji: '🚡', title: 'Chamonix is a day-trip, not a holiday', text: 'Mont-Blanc, glaciers and the Aiguilles make an easy clear-day outing from the lake.', route: '#/plan/chamonix-day' }
  ];

  /* ---------- FEATURED (Home) ---------------------------------------- */
  const FEATURED = ['perfect-afternoon', 'duingt-bike-lunch', 'market-cook', 'semnoz-picnic'];

  /* ---------- HOME QUICK ACCESS -------------------------------------- */
  const QUICK = [
    { label: 'Build a day', emoji: '🧩', route: '#/build' },
    { label: 'Map', emoji: '🗺️', route: '#/map' },
    { label: 'Areas', emoji: '📍', route: '#/areas' },
    { label: 'Bike', emoji: '🚴', route: '#/bike' },
    { label: 'Lake', emoji: '🏊', route: '#/lake' },
    { label: 'Food', emoji: '🧀', route: '#/food' },
    { label: 'Trips', emoji: '🧭', route: '#/trips' },
    { label: 'Rainy day', emoji: '🌧️', route: '#/day?mode=rainy' }
  ];

  /* ---------- BUILD-A-DAY options ------------------------------------ */
  const BUILD = {
    effort: [
      { id: 'low', label: 'Low', emoji: '🛋️', hint: 'Barely any planning' },
      { id: 'medium', label: 'Medium', emoji: '🚲', hint: 'A proper outing' },
      { id: 'big', label: 'Big', emoji: '🚵', hint: 'A full, tiring day' }
    ],
    car: [
      { id: 'no-car', label: 'No car', emoji: '🚶', hint: 'Walk, bike or boat' },
      { id: 'car', label: 'Car’s fine', emoji: '🚗', hint: 'Happy to drive' }
    ],
    theme: [
      { id: 'water', label: 'Water', emoji: '🏊', modes: ['lake', 'beach'] },
      { id: 'bikes', label: 'Bikes', emoji: '🚴', modes: ['easy-bike', 'big-cycling', 'cols', 'mtb'] },
      { id: 'food', label: 'Food', emoji: '🧀', modes: ['food', 'apero'] },
      { id: 'views', label: 'Views', emoji: '🌄', modes: ['views'] },
      { id: 'rainy', label: 'Rainy', emoji: '🌧️', modes: ['rainy'] }
    ]
  };

  return {
    MODES, MODE_BY_ID,
    AREAS, AREA_BY_ID,
    PLANS, PLAN_BY_ID,
    BIKE, LAKE, FOOD, TRIPS,
    MAP_CATEGORIES, MAP_SPOTS,
    STORY, INSPIRE, SEASON,
    ZONES, CATEGORIES, CATEGORY_BY_ID, DISCOVERIES,
    BUILD, FEATURED, QUICK
  };
})();
