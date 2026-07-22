/* =====================================================================
   Lac d'Annecy — app shell, hash router and screen renderers.
   Plain JS, no framework. Reads everything from window.DATA (data.js).

   Flow the app is built around:
     orient me → show me nearby worlds → inspire me → choose a day → a plan
   ===================================================================== */
(function () {
  'use strict';
  const D = window.DATA;
  const screenEl = document.getElementById('screen');
  const appbar = document.getElementById('appbar');
  const titleEl = document.getElementById('ab-title');
  const navEl = document.getElementById('bottomnav');

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Highlight [CHECK: …] placeholders so unverified items read clearly.
  function copy(s) {
    return esc(s).replace(/\[CHECK:[^\]]*\]/g, (m) => `<span class="check">${m}</span>`);
  }

  function sample(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  // Cover image OR a designed, labelled placeholder (honest, not broken).
  function cover(media, opts) {
    opts = opts || {};
    const extra = opts.cls ? ' ' + opts.cls : '';
    if (media && media.photo) {
      return `<img class="cover-img${extra}" src="${esc(media.photo)}" alt="${esc(opts.alt || '')}" loading="${opts.eager ? 'eager' : 'lazy'}" />`;
    }
    const tint = (media && media.tint) || opts.tint || 'alpine';
    const emoji = (media && media.emoji) || opts.emoji || '📍';
    const label = (media && media.label) || opts.label || '';
    const chk = media && media.check
      ? `<span class="cover-check">[CHECK: ${esc(media.check)}]</span>` : '';
    return `<div class="cover-ph${extra}" data-tint="${esc(tint)}" role="img" aria-label="${esc(label || opts.alt || 'photo to come')}">
      <span class="cover-em" aria-hidden="true">${emoji}</span>
      ${label ? `<span class="cover-label">${esc(label)}</span>` : ''}
      ${chk}
    </div>`;
  }

  // Resolve the best cover for an area/plan (real photo where accurate).
  function coverOf(obj) {
    if (!obj) return null;
    if (obj.media) return obj.media;
    if (obj.photo) return { photo: obj.photo };
    return null;
  }

  const PRIMARY = ['home', 'discover', 'day', 'map', 'bike'];

  const TITLES = {
    home: 'Lac d’Annecy', discover: 'Discover', day: 'Choose your day',
    build: 'Build a day', category: 'Discover', areas: 'Lake & areas',
    bike: 'Bike', lake: 'Lake & beaches', food: 'Food & markets',
    map: 'Map', trips: 'Day trips', trip: 'Your trip'
  };

  // Which leg (if any) we're currently inside — powers the "Now" badge.
  function legNow() {
    const today = new Date().toISOString().slice(0, 10);
    return D.TRIP.legs.find((l) => today >= l.start && today < l.end) || null;
  }

  /* ---------- route parsing ---------- */
  function parse() {
    let h = location.hash.replace(/^#\/?/, '');
    if (!h) return { name: 'home', parts: [], query: {} };
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = {};
    if (qs) qs.split('&').forEach((kv) => {
      const [k, v] = kv.split('=');
      query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return { name: parts[0] || 'home', parts: parts.slice(1), query };
  }

  /* ---------- chrome (appbar + nav) ---------- */
  function setChrome(route) {
    const isPrimary = PRIMARY.includes(route.name) && route.parts.length === 0;
    appbar.classList.toggle('has-back', !isPrimary);

    let title = TITLES[route.name] || 'Lac d’Annecy';
    if (route.name === 'areas' && route.parts[0]) {
      const a = D.AREA_BY_ID[route.parts[0]];
      title = a ? a.name : 'Area';
    }
    if (route.name === 'category' && route.parts[0]) {
      const c = D.CATEGORY_BY_ID[route.parts[0]];
      title = c ? c.title : 'Discover';
    }
    if (route.name === 'plan') title = 'Plan';
    titleEl.textContent = title;

    const navFor = {
      home: 'home', trip: 'home', discover: 'discover', category: 'discover',
      day: 'day', plan: 'day', build: 'day',
      bike: 'bike', map: 'map'
    }[route.name] || '';
    navEl.querySelectorAll('a').forEach((a) => {
      if (a.dataset.nav === navFor) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------- reusable fragments ---------- */
  function costBadge(c) { return `<span class="cost" data-c="${esc(c)}">${esc(c)}</span>`; }

  function planArea(p) {
    const a = D.AREA_BY_ID[p.areaId];
    return a ? a.name : (p.where || '');
  }

  function planCard(p) {
    const modeEms = p.modes.slice(0, 5).map((m) => {
      const md = D.MODE_BY_ID[m]; return md ? `<span class="em" title="${esc(md.label)}">${md.emoji}</span>` : '';
    }).join('');
    return `<a class="plan-card" href="#/plan/${esc(p.id)}">
      <div class="pc-top">
        <h3>${esc(p.title)}</h3>
        ${costBadge(p.cost)}
      </div>
      <p class="pc-desc">${esc(p.desc)}</p>
      <div class="pc-meta">
        <span class="where">${esc(planArea(p))}</span>
        <span class="dot">·</span><span>${esc(p.time)}</span>
        <span class="pc-modes" aria-hidden="true">${modeEms}</span>
      </div>
    </a>`;
  }

  function worldCard(c, opts) {
    opts = opts || {};
    return `<a class="world-card${opts.cls ? ' ' + opts.cls : ''}" href="#/category/${esc(c.id)}">
      <div class="world-cover">${cover(c.media, { tint: c.tint, emoji: c.emoji, label: c.title, alt: c.title })}</div>
      <div class="world-body">
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.vibe)}</p>
      </div>
    </a>`;
  }

  function footNote() {
    return `<p class="foot-note">Drive times, opening dates, prices, lift schedules and links shown as
      <span class="check">[CHECK: …]</span> still need confirming. A relaxed August companion — not a timetable.</p>`;
  }

  function tripStrip() {
    const now = legNow();
    const legs = D.TRIP.legs.map((l, i) => `
      ${i > 0 ? '<span class="ts-arrow" aria-hidden="true">→</span>' : ''}
      <span class="ts-leg${now && now.id === l.id ? ' is-now' : ''}">
        <span class="ts-em" aria-hidden="true">${l.emoji}</span>
        <span class="ts-txt"><strong>${esc(l.label)}</strong>${esc(l.dates)}</span>
        ${now && now.id === l.id ? '<span class="now-badge">Now</span>' : ''}
      </span>`).join('');
    return `<a class="trip-strip" href="#/trip" aria-label="Your trip">
      ${legs}
      <span class="ts-go" aria-hidden="true">›</span>
    </a>`;
  }

  /* ===================================================================
     SCREENS
     =================================================================== */
  const Views = {};

  /* ---------- Home: an onboarding flow ---------- */
  Views.home = function () {
    const zones = D.ZONES.map((z) => `
      <a class="zone" href="#/areas?region=${esc(z.region)}">
        <span class="zone-em" aria-hidden="true">${z.emoji}</span>
        <span class="zone-text"><strong>${esc(z.label)}</strong>${esc(z.text)}</span>
        <span class="zone-go" aria-hidden="true">›</span>
      </a>`).join('');

    const worlds = D.CATEGORIES.map((c) => worldCard(c, { cls: 'snap' })).join('');

    const discoveries = D.DISCOVERIES.slice(0, 6).map((d) => `
      <a class="disc-card snap" href="${esc(d.route)}">
        <span class="disc-em" aria-hidden="true">${d.emoji}</span>
        <strong>${esc(d.title)}</strong>
        <span class="disc-text">${esc(d.text)}</span>
        <span class="disc-go">Show me →</span>
      </a>`).join('');

    const modeChips = D.MODES.map((m) =>
      `<a class="chip" href="#/day?mode=${esc(m.id)}"><span class="em" aria-hidden="true">${m.emoji}</span>${esc(m.label)}</a>`).join('');

    const featured = D.FEATURED.map((id) => D.PLAN_BY_ID[id]).filter(Boolean).map(planCard).join('');

    const quick = D.QUICK.map((q) => `
      <a class="mode-tile" href="${esc(q.route)}" style="min-height:72px">
        <span class="em" aria-hidden="true">${q.emoji}</span>
        <span class="lb">${esc(q.label)}</span>
      </a>`).join('');

    return `
      <section class="hero" aria-label="Lac d’Annecy">
        <img class="hero-bg" src="assets/wiki/hero-lake.jpg"
             alt="Lac d’Annecy from Col de la Forclaz, paragliders overhead" fetchpriority="high" />
        <div class="hero-inner">
          <span class="eyebrow">${esc(D.TRIP.dates)} · Haute-Savoie</span>
          <h1>Lac d’Annecy</h1>
          <p>Swim, ride, eat outside, explore. Let’s find your kind of day.</p>
        </div>
      </section>

      ${tripStrip()}

      <div class="step"><span class="step-n">1</span><h2>First, get your bearings</h2></div>
      <a class="orient" href="#/map">
        <img src="assets/orientation/orientation_relief_card.jpg"
             alt="Relief view of the lake with the Aravis and Mont-Blanc behind" loading="lazy" />
        <div>
          <h3>One lake, many worlds.</h3>
          <p>A 14 km lake ringed by villages — plus beaches, cols, alpine towns and big day trips just beyond.</p>
          <div class="go">Open the map →</div>
        </div>
      </a>
      <div class="zones">${zones}</div>

      <div class="step"><span class="step-n">2</span><h2>What’s nearby?</h2></div>
      <p class="intro">Tap a world to see what that kind of day actually looks like.</p>
      <div class="h-scroll">${worlds}</div>

      <div class="step"><span class="step-n">3</span><h2>You might not know you can do this here</h2></div>
      <div class="h-scroll">${discoveries}</div>

      <div class="step"><span class="step-n">4</span><h2>Now choose your day</h2></div>
      <p class="intro">Know the mood already? Jump straight in — or let the app build one for you.</p>
      <div class="actions">
        <a class="btn" href="#/build">🧩 Build a day</a>
        <a class="btn ghost" href="#/day">Browse all plans</a>
      </div>
      <div class="mode-filter flush" style="position:static;margin:.6rem -1rem .2rem">${modeChips}</div>

      <div class="section-head"><h2>Featured plans</h2></div>
      <div class="cards">${featured}</div>

      <div class="section-head"><h2>Jump to</h2></div>
      <div class="h-scroll tiles">${quick}</div>

      <div class="install-hint" id="install-hint">
        <span>📲</span><span id="install-text"></span>
        <button class="x" id="install-x" aria-label="Dismiss">×</button>
      </div>

      ${footNote()}
    `;
  };

  /* ---------- Your trip: legs, stays, changeover ---------- */
  Views.trip = function () {
    const now = legNow();
    const legs = D.TRIP.legs.map((l) => `
      <div class="leg-card${now && now.id === l.id ? ' is-now' : ''}">
        <div class="leg-head">
          <span class="leg-em" aria-hidden="true">${l.emoji}</span>
          <div><h3>${esc(l.label)}</h3><span class="leg-dates">${esc(l.dates)}</span></div>
          ${now && now.id === l.id ? '<span class="now-badge">Now</span>' : ''}
        </div>
        <p>${esc(l.blurb)}</p>
      </div>`).join('');

    const stays = D.STAYS.map((s) => `
      <div class="stay-card">
        <div class="stay-top">
          <div>
            <div class="ac-zone">${esc(s.village)}</div>
            <h3>${esc(s.name)}</h3>
          </div>
          <span class="stay-dates">${esc(s.dates)}</span>
        </div>
        <p class="stay-addr">📍 ${esc(s.address)}</p>
        <dl class="spec" style="margin:.55rem 0 .3rem">
          <dt>In</dt><dd>${esc(s.checkin)}</dd>
          <dt>Out</dt><dd>${esc(s.checkout)}</dd>
        </dl>
        <div class="ac-tags">${s.features.map((f) => `<span class="tag">${esc(f)}</span>`).join('')}</div>
        <div class="actions" style="margin:.85rem 0 0">
          ${s.coords ? `<a class="btn ghost" href="#/map?place=${esc(s.id)}">Show on map</a>` : ''}
          <a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}" target="_blank" rel="noopener">Directions ↗</a>
        </div>
      </div>`).join('');

    const lesgets = D.LESGETS.map((it) => {
      const href = it.planId ? `#/plan/${it.planId}` : null;
      const inner = `<div class="li-top"><h3>${esc(it.name)}</h3>${it.tag ? `<span class="li-tag">${esc(it.tag)}</span>` : ''}</div>
        <p>${copy(it.desc)}</p>${href ? '<span class="li-link">Open</span>' : ''}`;
      return href ? `<a class="list-item" href="${href}">${inner}</a>` : `<div class="list-item">${inner}</div>`;
    }).join('');

    const T = D.TRANSPORT;
    const flights = T.flights.map((f) => `
      <div class="flight-card">
        <div class="fc-top">
          <span class="fc-who" data-dir="${esc(f.dir)}">${f.dir === 'out' ? '🛬' : '🛫'} ${esc(f.who)}</span>
          <span class="fc-date">${esc(f.date)}</span>
        </div>
        <div class="fc-route">${esc(f.legs)}</div>
        <div class="fc-meta">${esc(f.flight)} · conf ${esc(f.conf)}</div>
        ${f.note ? `<p class="fc-note">${esc(f.note)}</p>` : ''}
      </div>`).join('');

    const car = `
      <div class="stay-card">
        <div class="stay-top">
          <div><div class="ac-zone">The van · ${esc(T.car.conf)}</div><h3>${esc(T.car.name)}</h3></div>
        </div>
        <dl class="spec" style="margin:.55rem 0 .3rem">
          <dt>Pick up</dt><dd>${esc(T.car.pickup)}</dd>
          <dt>Return</dt><dd>${esc(T.car.ret)}</dd>
          <dt>Drivers</dt><dd>${esc(T.car.drivers)}</dd>
          <dt>Included</dt><dd>${esc(T.car.includes)}</dd>
        </dl>
        <p class="fc-note">📍 ${esc(T.car.find)}</p>
      </div>`;

    return `
      <div class="section-head" style="margin-top:.4rem"><h2>The shape of it</h2>
        <p>${esc(D.TRIP.dates)} — mountains first, then the lake.</p></div>
      <div class="leg-row">${legs}</div>

      <div class="section-head"><h2>Getting there &amp; back</h2>
        <p>Confirmed flights. ${esc(T.privacyNote)}</p></div>
      <div class="flights">${flights}</div>

      <div class="section-head"><h2>The van</h2></div>
      ${car}

      <div class="note-box">⏰ ${esc(T.departure)}</div>

      <div class="section-head"><h2>Leg one: Les Gets</h2>
        <p>Three bike-park days before the water starts.</p></div>
      ${lesgets}

      <div class="section-head"><h2>Where you’re sleeping</h2></div>
      <div class="cards" style="grid-template-columns:1fr">${stays}</div>

      <div class="note-box">🔁 ${esc(D.TRIP.changeover)}</div>

      <div class="actions">
        <a class="btn" href="#/areas/veyrier">About Veyrier-du-Lac</a>
        <a class="btn ghost" href="#/areas/les-gets">About Les Gets</a>
      </div>
      ${footNote()}
    `;
  };

  /* ---------- Discover: photo-led categories ---------- */
  Views.discover = function () {
    const worlds = D.CATEGORIES.map((c) => worldCard(c)).join('');

    const story = D.STORY.map((s) => `
      <div class="story-item">
        <span class="story-em" aria-hidden="true">${s.emoji}</span>
        <div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>
      </div>`).join('');

    const season = D.SEASON.map((s) => `
      <div class="inspire-card season">
        <h3>${esc(s.title)}</h3>
        <p>${copy(s.text)}</p>
        ${s.action ? `<a class="inspire-go" href="${esc(s.action.route)}">${esc(s.action.label)}</a>` : ''}
      </div>`).join('');

    return `
      <div class="detail-hero" style="min-height:160px">
        <img src="assets/wiki/lake-sunset.jpg" alt="Sunset over Lac d’Annecy" />
        <div class="dh-inner">
          <div class="dh-zone">Get inspired</div>
          <h1>What kind of trip is this?</h1>
        </div>
      </div>
      <p class="intro">Most people arrive and just sit by the water — lovely, but there’s far more here. Browse the worlds nearby, each with real things to go and do.</p>

      <button class="btn block" id="surprise" type="button">🎲 Surprise me — 3 ideas</button>
      <div id="surprise-out"></div>

      <div class="section-head"><h2>Worlds nearby</h2></div>
      <div class="world-grid">${worlds}</div>

      <div class="section-head"><h2>The short story of the lake</h2></div>
      <div class="story">${story}</div>

      <div class="section-head"><h2>The war in these mountains</h2>
        <p>Haute-Savoie was maquis country — and in the end it freed itself.</p></div>
      <div class="story">${D.HISTORY.map((s) => `
        <div class="story-item">
          <span class="story-em" aria-hidden="true">${s.emoji}</span>
          <div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>
        </div>`).join('')}</div>
      <div class="actions" style="margin-top:.9rem">
        <a class="btn" href="#/plan/glieres-day">🕊️ Go stand where it happened</a>
      </div>

      <div class="section-head"><h2>Here in August</h2></div>
      <div class="inspire-grid">${season}</div>

      ${creditsBlock()}
      ${footNote()}
    `;
  };

  function creditsBlock() {
    if (!D.CREDITS.length) return '';
    const items = D.CREDITS.map((c) =>
      `<a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.subject)}</a> — ${esc(c.author)}, ${esc(c.license)}`
    ).join(' · ');
    return `<details class="credits"><summary>Photo credits (Wikimedia Commons)</summary><p>${items}</p></details>`;
  }

  /* ---------- Category detail ---------- */
  Views.category = function (route) {
    const c = D.CATEGORY_BY_ID[route.parts[0]];
    if (!c) return `<div class="empty">Unknown category.</div>`;

    const starters = `<ul class="starters">${c.starters.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
    const plans = (c.planIds || []).map((id) => D.PLAN_BY_ID[id]).filter(Boolean);
    const planBlock = plans.length
      ? `<div class="section-head"><h2>Plans for this</h2></div><div class="cards">${plans.map(planCard).join('')}</div>`
      : '';
    const primaryMode = c.modes && c.modes[0];

    return `
      <div class="detail-hero cat" data-tint="${esc(c.tint)}">
        ${cover(c.media, { tint: c.tint, emoji: c.emoji, label: c.title, alt: c.title, cls: 'cover-fill', eager: true })}
        <div class="dh-inner">
          <div class="dh-zone">${c.emoji} A kind of day</div>
          <h1>${esc(c.title)}</h1>
        </div>
      </div>

      <p class="detail-lede">${esc(c.vibe)}</p>

      <div class="section-head"><h2>What it looks like</h2></div>
      <p class="intro" style="font-size:1rem;color:var(--ink-2)">${esc(c.looksLike)}</p>

      <div class="section-head"><h2>Good starter ideas</h2></div>
      ${starters}

      <div class="actions">
        ${primaryMode ? `<a class="btn" href="#/day?mode=${esc(primaryMode)}">See matching plans</a>` : ''}
        ${c.mapCat ? `<a class="btn ghost" href="#/map?cat=${esc(c.mapCat)}">Show on map</a>` : ''}
      </div>

      ${planBlock}
      ${footNote()}
    `;
  };

  /* ---------- Build a day ---------- */
  const buildState = { effort: 'medium', car: 'car', theme: 'water' };

  Views.build = function () {
    function seg(group, opts) {
      return `<div class="seg" data-group="${group}" role="group" aria-label="${group}">` +
        opts.map((o) => `
          <button class="seg-btn" type="button" data-group="${group}" data-val="${esc(o.id)}"
            aria-pressed="${buildState[group] === o.id}">
            <span class="em" aria-hidden="true">${o.emoji}</span>
            <span class="seg-lb">${esc(o.label)}</span>
            ${o.hint ? `<span class="seg-hint">${esc(o.hint)}</span>` : ''}
          </button>`).join('') + `</div>`;
    }
    return `
      <div class="section-head" style="margin-top:.4rem"><h2>Build a day</h2>
        <p>Three taps and we’ll suggest a few plans that fit.</p></div>

      <div class="build-q"><span class="build-label">How much effort?</span>${seg('effort', D.BUILD.effort)}</div>
      <div class="build-q"><span class="build-label">Car or no car?</span>${seg('car', D.BUILD.car)}</div>
      <div class="build-q"><span class="build-label">What are you in the mood for?</span>${seg('theme', D.BUILD.theme)}</div>

      <button class="btn block" id="build-shuffle" type="button" style="margin-top:.4rem">🎲 Shuffle suggestions</button>

      <div class="section-head"><h2>Your day, three ways</h2></div>
      <div id="build-out" class="cards"></div>
      ${footNote()}
    `;
  };

  function buildMatches(state) {
    const theme = D.BUILD.theme.find((t) => t.id === state.theme);
    const themeModes = theme ? theme.modes : [];
    return D.PLANS.filter((p) => {
      if (state.effort && p.effort !== state.effort) return false;
      if (state.car === 'no-car' && p.carNeeded) return false;
      if (themeModes.length && !p.modes.some((m) => themeModes.includes(m))) return false;
      return true;
    });
  }

  function renderBuildOut() {
    const out = document.getElementById('build-out');
    if (!out) return;
    let list = buildMatches(buildState);
    let note = '';
    if (!list.length) {
      // relax the effort constraint rather than show nothing
      const relaxed = buildMatches({ ...buildState, effort: null });
      if (relaxed.length) { list = relaxed; note = `<p class="intro">Nothing matched that exactly — here are close options at a different effort level.</p>`; }
    }
    if (!list.length) { out.innerHTML = `<div class="empty">No match — try “Car’s fine” or a different mood.</div>`; return; }
    out.innerHTML = note + sample(list, 3).map(planCard).join('');
  }

  function wireBuild() {
    const screen = screenEl;
    screen.querySelectorAll('.seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const g = btn.dataset.group;
        buildState[g] = btn.dataset.val;
        screen.querySelectorAll(`.seg-btn[data-group="${g}"]`).forEach((b) =>
          b.setAttribute('aria-pressed', String(b === btn)));
        renderBuildOut();
      });
    });
    const sh = document.getElementById('build-shuffle');
    if (sh) sh.addEventListener('click', renderBuildOut);
    renderBuildOut();
  }

  /* ---------- Choose your day ---------- */
  Views.day = function (route) {
    const active = route.query.mode && D.MODE_BY_ID[route.query.mode] ? route.query.mode : 'all';

    const chips = [`<button class="chip" data-mode="all" aria-pressed="${active === 'all'}">
        <span class="em">✨</span>All</button>`]
      .concat(D.MODES.map((m) => `
        <button class="chip" data-mode="${esc(m.id)}" aria-pressed="${active === m.id}">
          <span class="em" aria-hidden="true">${m.emoji}</span>${esc(m.label)}</button>`))
      .join('');

    const list = active === 'all' ? D.PLANS : D.PLANS.filter((p) => p.modes.includes(active));
    const md = D.MODE_BY_ID[active];

    const head = active === 'all'
      ? `<div class="section-head"><h2>All plans</h2><p>${D.PLANS.length} ideas — filter by the mood up top, or <a href="#/build">build a day</a>.</p></div>`
      : `<div class="section-head"><h2>${md.emoji} ${esc(md.label)}</h2><p>${esc(md.hint)} · ${list.length} plan${list.length === 1 ? '' : 's'}.</p></div>`;

    const cards = list.length
      ? `<div class="cards">${list.map(planCard).join('')}</div>`
      : `<div class="empty">No plans tagged here yet.</div>`;

    return `
      <div class="mode-filter" id="mode-filter" role="tablist" aria-label="Day modes">${chips}</div>
      ${head}
      ${cards}
      ${footNote()}
    `;
  };

  /* ---------- Areas (list, optionally by region) ---------- */
  Views.areas = function (route) {
    if (route.parts[0]) return Views.areaDetail(route.parts[0]);
    const SUP = { lake: '🏊 Lake', beach: '🏖️ Beach', food: '🧀 Food', views: '🏔️ Views',
      bikes: '🚴 Bikes', wander: '🚶 Wander', apero: '🥂 Apéro', daytrip: '🧭 Day trip' };
    const REGION_LABEL = { top: 'Annecy', west: 'West shore', east: 'East shore',
      south: 'South end', heights: 'Above the lake', beyond: 'Beyond the lake' };
    const region = route.query.region;
    const list = region ? D.AREAS.filter((a) => a.region === region) : D.AREAS;

    const cards = list.map((a) => `
      <a class="area-card" href="#/areas/${esc(a.id)}">
        <div class="ac-img-wrap">${cover(coverOf(a), { tint: 'alpine', emoji: '📍', label: a.name, alt: a.name, cls: 'ac-cover' })}</div>
        <div class="ac-body">
          <div class="ac-zone">${esc(a.zone)}</div>
          <h3>${esc(a.name)}</h3>
          <p class="ac-why">${esc(a.why)}</p>
          <div class="ac-tags">${a.supports.map((s) => `<span class="tag">${SUP[s] || s}</span>`).join('')}</div>
        </div>
      </a>`).join('');

    const head = region
      ? `<div class="section-head" style="margin-top:.4rem"><h2>${esc(REGION_LABEL[region] || 'Areas')}</h2>
           <p>${list.length} spot${list.length === 1 ? '' : 's'} · <a href="#/areas">see the whole lake</a></p></div>`
      : `<div class="section-head" style="margin-top:.4rem"><h2>One map of the lake</h2></div>
         <p class="intro">From the busy top end down the quiet west shore, around the grassy south end and up the dramatic east shore — then the heights above and the bigger trips beyond.</p>`;

    return `${head}<div class="cards" style="grid-template-columns:1fr">${cards}</div>${footNote()}`;
  };

  Views.areaDetail = function (id) {
    const a = D.AREA_BY_ID[id];
    if (!a) return `<div class="empty">Unknown area.</div>`;
    const plans = D.PLANS.filter((p) => p.areaId === id);
    const rows = [['Why go', a.why], ['Best day', a.day]];
    if (a.water && a.water !== '—') rows.push(['Water', a.water]);
    if (a.food && a.food !== '—') rows.push(['Food', a.food]);
    const dl = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${copy(v)}</dd>`).join('');

    const planList = plans.length
      ? `<div class="section-head"><h2>Plans here</h2></div><div class="cards">${plans.map(planCard).join('')}</div>` : '';
    const official = a.official
      ? `<a class="btn ghost" href="${esc(a.official)}" target="_blank" rel="noopener">Official site ↗</a>` : '';

    return `
      <div class="detail-hero">
        ${cover(coverOf(a), { tint: 'alpine', emoji: '📍', label: a.name, alt: a.name, cls: 'cover-fill', eager: true })}
        <div class="dh-inner"><div class="dh-zone">${esc(a.zone)}</div><h1>${esc(a.name)}</h1></div>
      </div>
      <dl class="spec">${dl}</dl>
      <div class="actions">
        <a class="btn" href="#/map?place=${esc(a.id)}">Show on map</a>
        ${official}
      </div>
      ${planList}
      ${footNote()}
    `;
  };

  /* ---------- Plan detail ---------- */
  Views.plan = function (route) {
    const p = D.PLAN_BY_ID[route.parts[0]];
    if (!p) return `<div class="empty">Unknown plan.</div>`;
    const area = D.AREA_BY_ID[p.areaId];
    const media = p.media || coverOf(area) || { placeholder: true, emoji: '📍', label: p.title };
    const where = area ? area.name : (p.where || '—');

    const modeChips = p.modes.map((m) => {
      const md = D.MODE_BY_ID[m];
      return md ? `<a class="chip" href="#/day?mode=${esc(m)}"><span class="em" aria-hidden="true">${md.emoji}</span>${esc(md.label)}</a>` : '';
    }).join('');

    const official = p.official
      ? `<a class="btn ghost" href="${esc(p.official)}" target="_blank" rel="noopener">Official site ↗</a>` : '';

    return `
      <div class="detail-hero">
        ${cover(media, { tint: 'alpine', emoji: '📍', label: where, alt: where, cls: 'cover-fill', eager: true })}
        <div class="dh-inner"><div class="dh-zone">${esc(area ? area.zone : (p.where || ''))}</div><h1>${esc(p.title)}</h1></div>
      </div>

      <p class="detail-lede">${esc(p.desc)}</p>

      <dl class="spec">
        <dt>Where</dt><dd>${esc(where)}</dd>
        <dt>Time</dt><dd>${esc(p.time)}</dd>
        <dt>Effort</dt><dd>${esc(p.effort)}${p.carNeeded ? ' · car needed' : ' · car-free possible'}</dd>
        <dt>Cost</dt><dd>${costBadge(p.cost)}</dd>
      </dl>

      ${p.note ? `<div class="note-box">${copy(p.note)}</div>` : ''}

      <div class="mode-row">${modeChips}</div>

      <div class="actions">
        ${area ? `<a class="btn" href="#/map?place=${esc(area.id)}">Show on map</a>` :
          p.mapPlace ? `<a class="btn" href="#/map?place=${esc(p.mapPlace)}">Show on map</a>` : ''}
        ${area ? `<a class="btn ghost" href="#/areas/${esc(area.id)}">About ${esc(area.name)}</a>` : ''}
        ${official}
      </div>
      ${footNote()}
    `;
  };

  /* ---------- grouped list (bike / lake / food / trips) ---------- */
  function groupedList(groups, intro) {
    const blocks = groups.map((g) => {
      const items = g.items.map((it) => {
        const href = it.planId ? `#/plan/${it.planId}` :
          it.areaId ? `#/areas/${it.areaId}` :
          it.official ? it.official : null;
        const ext = href && /^https?:/.test(href);
        const top = `<div class="li-top"><h3>${esc(it.name)}</h3>${
          it.meta ? `<span class="li-meta">${copy(it.meta)}</span>` :
          it.tag ? `<span class="li-tag">${esc(it.tag)}</span>` : ''}</div>`;
        const body = `<p>${copy(it.desc)}</p>`;
        const link = href ? (ext ? `<span class="li-link">Official ↗</span>` : `<span class="li-link">Open</span>`) : '';
        if (!href) return `<div class="list-item">${top}${body}</div>`;
        const attrs = ext ? ` target="_blank" rel="noopener"` : '';
        return `<a class="list-item" href="${esc(href)}"${attrs}>${top}${body}${link}</a>`;
      }).join('');
      return `<div class="group-label">${esc(g.group)}</div>${items}`;
    }).join('');
    return `${intro ? `<p class="intro">${esc(intro)}</p>` : ''}${blocks}${footNote()}`;
  }

  Views.bike = function () {
    return `<div class="section-head" style="margin-top:.4rem"><h2>From a lake-path spin to a col day</h2></div>` +
      groupedList(D.BIKE, 'Casual and serious in one place. Where a route or rental wasn’t verified, it’s flagged rather than guessed.');
  };
  Views.lake = function () {
    return `<div class="section-head" style="margin-top:.4rem"><h2>Beaches, swims & easy afternoons</h2></div>` +
      groupedList(D.LAKE, 'Practical and quick to scan — where to get in the water and how to get there.');
  };
  Views.food = function () {
    return `<div class="section-head" style="margin-top:.4rem"><h2>Markets, picnics & apéro</h2></div>` +
      groupedList(D.FOOD, 'Low-cost and casual. Markets, cheese and lake snacks before fancy dinners.');
  };
  Views.trips = function () {
    return `<div class="section-head" style="margin-top:.4rem"><h2>Off the lake, by effort</h2></div>` +
      groupedList(D.TRIPS, 'Sorted by whether it’s worth the drive — not everything is.');
  };

  /* ---------- Map ---------- */
  let mapInstance = null;
  let mapMarkers = {};
  let mapState = { active: new Set(D.MAP_CATEGORIES.map((c) => c.id)) };

  Views.map = function (route) {
    const cat = route.query.cat;
    const single = cat && D.MAP_CATEGORIES.some((c) => c.id === cat);
    mapState.active = single ? new Set([cat]) : new Set(D.MAP_CATEGORIES.map((c) => c.id));
    const chips = [`<button class="map-chip" data-cat="all" aria-pressed="${!single}"><span class="cdot"></span>All</button>`]
      .concat(D.MAP_CATEGORIES.map((c) =>
        `<button class="map-chip" data-cat="${c.id}" aria-pressed="${mapState.active.has(c.id)}" style="--cat:${c.color}"><span class="cdot"></span>${esc(c.label)}</button>`))
      .join('');
    return `
      <div class="map-filters" id="map-filters" role="group" aria-label="Filter map">${chips}</div>
      <div id="map" role="application" aria-label="Map of Lac d’Annecy"></div>
    `;
  };

  function mapPlaces() {
    const fromAreas = D.AREAS.map((a) => ({
      id: 'area-' + a.id, cat: 'area', name: a.name, coords: a.coords, blurb: a.why, route: '#/areas/' + a.id
    }));
    const fromStays = D.STAYS.filter((s) => s.coords).map((s) => ({
      id: s.id, cat: 'stay', name: s.name, coords: s.coords,
      blurb: s.village + ' · ' + s.dates + ' · ' + s.address, route: '#/trip'
    }));
    return fromStays.concat(fromAreas, D.MAP_SPOTS);
  }

  function initMap(route) {
    const catById = Object.fromEntries(D.MAP_CATEGORIES.map((c) => [c.id, c]));
    const map = L.map('map', { scrollWheelZoom: true, zoomControl: true, tap: true }).setView([45.86, 6.18], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    const places = mapPlaces();
    mapMarkers = {};

    places.forEach((p) => {
      const cat = catById[p.cat] || { color: '#1f7fb3', glyph: '•', label: p.cat };
      const icon = L.divIcon({
        className: 'mk-wrap',
        html: `<div class="mk" style="--cat:${cat.color}"><span class="g">${cat.glyph}</span></div>`,
        iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -26]
      });
      const link = p.route ? `<a class="pop-link" href="${esc(p.route)}" data-nav-link>${
        /^https?:/.test(p.route) ? 'Open ↗' : 'Open'}</a>` : '';
      const html = `<div class="pop" style="--cat:${cat.color}">
        <span class="pc">${esc(cat.label)}</span>
        <h3>${esc(p.name)}</h3>
        <p>${copy(p.blurb)}</p>${link}</div>`;
      const m = L.marker(p.coords, { icon, title: p.name }).addTo(map);
      m.bindPopup(html, { closeButton: true, maxWidth: 250, minWidth: 220 });
      mapMarkers[p.id] = { marker: m, cat: p.cat };
    });

    map.on('popupopen', (e) => {
      const el = e.popup.getElement();
      if (!el) return;
      el.querySelectorAll('a[data-nav-link]').forEach((a) => {
        a.addEventListener('click', (ev) => {
          const href = a.getAttribute('href');
          if (href && href.charAt(0) === '#') { ev.preventDefault(); location.hash = href; }
        });
      });
    });

    mapInstance = map;
    applyMapFilters();

    function position() {
      map.invalidateSize();
      const focus = route.query.place;
      const key = focus
        ? (mapMarkers['area-' + focus] ? 'area-' + focus : (mapMarkers[focus] ? focus : null))
        : null;
      if (key) {
        const mk = mapMarkers[key];
        map.setView(mk.marker.getLatLng(), 14);
        setTimeout(() => mk.marker.openPopup(), 200);
      } else {
        fitLake(map);
      }
    }

    const filters = document.getElementById('map-filters');
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.map-chip');
      if (!btn) return;
      const id = btn.dataset.cat;
      if (id === 'all') {
        if (mapState.active.size === D.MAP_CATEGORIES.length) mapState.active.clear();
        else D.MAP_CATEGORIES.forEach((c) => mapState.active.add(c.id));
      } else {
        if (mapState.active.has(id)) mapState.active.delete(id); else mapState.active.add(id);
      }
      filters.querySelectorAll('.map-chip').forEach((c) => {
        const cid = c.dataset.cat;
        if (cid === 'all') c.setAttribute('aria-pressed', String(mapState.active.size === D.MAP_CATEGORIES.length));
        else c.setAttribute('aria-pressed', String(mapState.active.has(cid)));
      });
      applyMapFilters();
    });

    setTimeout(position, 80);
    setTimeout(position, 350);
  }

  function fitLake(map) {
    const FAR = { aravis: 1, chamonix: 1, 'les-gets': 1 };
    const pts = D.AREAS.filter((a) => !FAR[a.id]).map((a) => a.coords);
    map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 13.5 });
  }

  function applyMapFilters() {
    if (!mapInstance) return;
    Object.values(mapMarkers).forEach(({ marker, cat }) => {
      const on = mapState.active.has(cat);
      if (on && !mapInstance.hasLayer(marker)) marker.addTo(mapInstance);
      else if (!on && mapInstance.hasLayer(marker)) mapInstance.removeLayer(marker);
    });
  }

  function teardownMap() {
    if (mapInstance) { mapInstance.remove(); mapInstance = null; mapMarkers = {}; }
  }

  /* ===================================================================
     Router
     =================================================================== */
  function render() {
    const route = parse();
    teardownMap();

    const view = Views[route.name] || Views.home;
    screenEl.innerHTML = view(route);
    screenEl.className = 'screen' + (route.name === 'map' ? ' is-map' : '');
    setChrome(route);

    screenEl.scrollTop = 0;
    window.scrollTo(0, 0);

    if (route.name === 'map') {
      if (typeof L === 'undefined') {
        document.getElementById('map').innerHTML =
          '<div class="empty" style="margin:1rem">Map needs a connection to load.</div>';
      } else { initMap(route); }
    }
    if (route.name === 'day' || route.name === 'home') wireDayFilter();
    if (route.name === 'home') wireInstallHint();
    if (route.name === 'discover') wireSurprise();
    if (route.name === 'build') wireBuild();
  }

  function wireDayFilter() {
    const bar = document.getElementById('mode-filter');
    if (!bar) return;
    if (bar.dataset.kind !== 'links') {
      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('button.chip');
        if (!btn) return;
        const mode = btn.dataset.mode;
        location.hash = mode === 'all' ? '#/day' : '#/day?mode=' + mode;
      });
    }
    const on = bar.querySelector('.chip[aria-pressed="true"]');
    if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function wireSurprise() {
    const btn = document.getElementById('surprise');
    const out = document.getElementById('surprise-out');
    if (!btn || !out) return;
    function go() {
      const cats = sample(D.CATEGORIES, 3);
      const picks = cats.map((c) => {
        const ids = c.planIds || [];
        const id = ids[Math.floor(Math.random() * ids.length)];
        return D.PLAN_BY_ID[id];
      }).filter(Boolean);
      out.innerHTML = `<div class="cards" style="margin-top:.7rem">${picks.map(planCard).join('')}</div>`;
    }
    btn.addEventListener('click', go);
  }

  /* ---------- Add-to-home-screen hint ---------- */
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

  function wireInstallHint() {
    const box = document.getElementById('install-hint');
    if (!box) return;
    if (localStorage.getItem('a26-install-dismissed') === '1') return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;
    const txt = document.getElementById('install-text');
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (deferredPrompt) {
      txt.textContent = 'Install this as an app';
      box.classList.add('show');
      box.addEventListener('click', async (e) => {
        if (e.target.id === 'install-x') return;
        if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; box.classList.remove('show'); }
      });
    } else if (isiOS) {
      txt.innerHTML = 'Add to Home Screen: tap Share, then “Add to Home Screen”.';
      box.classList.add('show');
    }
    document.getElementById('install-x').addEventListener('click', () => {
      box.classList.remove('show');
      localStorage.setItem('a26-install-dismissed', '1');
    });
  }

  /* ---------- appbar back ---------- */
  document.getElementById('ab-back').addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.hash = '#/home';
  });

  window.addEventListener('hashchange', render);
  render();

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
