/* =====================================================================
   Annecy & Les Gets 2026 — app shell, router and screens.
   Plain JS, no framework. Reads everything from window.DATA.

   A photographic field guide first, with quiet trip logistics and an
   optional date-aware Today view while the group is travelling.
   ===================================================================== */
(function () {
  'use strict';
  const D = window.DATA;
  const screenEl = document.getElementById('screen');
  const appbar = document.getElementById('appbar');
  const titleEl = document.getElementById('ab-title');
  const navEl = document.getElementById('bottomnav');
  const liveEl = document.getElementById('live');
  const actionEl = document.getElementById('ab-action');

  /* =========================== helpers =============================== */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const announce = (m) => { if (liveEl) { liveEl.textContent = ''; setTimeout(() => { liveEl.textContent = m; }, 30); } };
  const EFFORT_LABEL = { recovery: 'Recovery', easy: 'Easy', moderate: 'Moderate', big: 'Big' };
  const DUR_LABEL = { evening: 'Evening', '2h': '~2 h', half: 'Half day', full: 'Full day' };
  const CAT_LABEL = { road: 'Road', gravel: 'Gravel', mtb: 'MTB', easybike: 'Easy ride', hike: 'Hike', walk: 'Walk', sport: 'Outdoor sport', whitewater: 'Whitewater', caving: 'Caving', viaferrata: 'Via ferrata', canyoning: 'Canyoning', paragliding: 'Paragliding', swim: 'Swim', paddle: 'Water sport', boat: 'Boat', food: 'Food', culture: 'Culture', village: 'Day trip', family: 'Easy day', recovery: 'Rest' };
  const GUIDE_CATS = [
    { id: 'water', label: 'Lake & water', test: (a) => ['swim', 'paddle', 'boat', 'whitewater'].includes(a.cat) || (a.themes || []).includes('water') },
    { id: 'cycling', label: 'Cycling', test: (a) => ['road', 'gravel', 'mtb', 'easybike'].includes(a.cat) || (a.themes || []).includes('bikes') },
    { id: 'mountains', label: 'Hikes & views', test: (a) => ['hike', 'walk'].includes(a.cat) || (a.themes || []).includes('views') },
    { id: 'food', label: 'Food & history', test: (a) => ['food', 'culture', 'village'].includes(a.cat) || (a.themes || []).some((t) => t === 'food' || t === 'culture') },
    { id: 'adrenaline', label: 'Adrenaline', test: (a) => ['sport', 'whitewater', 'caving', 'viaferrata', 'canyoning', 'paragliding'].includes(a.cat) || (a.themes || []).includes('adrenaline') },
    { id: 'easy', label: 'Easy days', test: (a) => ['family', 'recovery'].includes(a.cat) || ['recovery', 'easy'].includes(a.effort) || a.group === 'all' }
  ];
  const GUIDE_BY_ID = Object.fromEntries(GUIDE_CATS.map((c) => [c.id, c]));
  const bookmarkIcon = (saved) => `<svg class="bookmark-icon" aria-hidden="true" viewBox="0 0 24 24"><path${saved ? ' fill="currentColor"' : ''} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

  /* ---------- Europe/Paris date engine ------------------------------ */
  const parisFmt = new Intl.DateTimeFormat('en-CA', { timeZone: D.TRIP.tz || 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
  function parisToday() { return parisFmt.format(new Date()); } // 'YYYY-MM-DD'
  function iso(d) { return d; } // dates are already ISO strings
  function addDays(isoStr, n) { const [y, m, d] = isoStr.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, d + n)); return dt.toISOString().slice(0, 10); }
  function prettyDay(isoStr) {
    const [y, m, d] = isoStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
  // The date we're planning for: an explicit override, else Paris "today"
  // clamped into the trip window (pre-trip → day 1).
  function activeDate() {
    const ov = localStorage.getItem('a26.date');
    if (ov) return ov;
    const t = parisToday();
    if (t < D.TRIP.window.start) return D.TRIP.window.start;
    if (t > D.TRIP.window.end) return D.TRIP.window.end;
    return t;
  }
  function isPreTrip() { return parisToday() < D.TRIP.window.start && !localStorage.getItem('a26.date'); }
  function isPostTrip() { return parisToday() > D.TRIP.window.end; }
  function setDate(d) { if (d) localStorage.setItem('a26.date', d); else localStorage.removeItem('a26.date'); }
  // The stay covering a date: start <= date < end (checkout day belongs to next).
  function stayForDate(dt) {
    return D.STAYS.find((s) => dt >= s.start && dt < s.end) || (dt >= D.TRIP.window.end ? D.STAYS[D.STAYS.length - 1] : D.STAYS[0]);
  }
  function activeStay() { return stayForDate(activeDate()); }
  function activeBase() { return activeStay().baseId; }
  function changeoverOn(dt) {
    // a date that is one stay's checkout AND the next stay's check-in
    const out = D.STAYS.find((s) => s.end === dt);
    const inn = D.STAYS.find((s) => s.start === dt);
    return out && inn ? { out, inn } : null;
  }
  function dayNumber(dt) { const diff = Math.round((Date.UTC(...dt.split('-').map((x, i) => i === 1 ? x - 1 : +x)) - Date.UTC(...D.TRIP.window.start.split('-').map((x, i) => i === 1 ? x - 1 : +x))) / 86400000); return diff + 1; }

  /* ---------- ideas boards / notes (this-phone-only localStorage) ---- */
  function jget(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  const PEOPLE = D.PEOPLE || ['Olivia', 'Andrew', 'Chip', 'Ian'];
  function activePerson() { const p = localStorage.getItem('a26.person'); return PEOPLE.includes(p) ? p : PEOPLE[0]; }
  function setPerson(p) { if (PEOPLE.includes(p)) localStorage.setItem('a26.person', p); }
  const Ideas = {
    boards() {
      // one-time migration from the old single shortlist → first person's board
      if (localStorage.getItem('a26.person') === 'Christian') localStorage.setItem('a26.person', 'Chip');
      const all0 = jget('a26.ideas', null);
      if (all0 && all0.Christian && !all0.Chip) { all0.Chip = all0.Christian; delete all0.Christian; jset('a26.ideas', all0); }
      const old = jget('a26.saved', null);
      if (old && !localStorage.getItem('a26.ideas')) { jset('a26.ideas', { [PEOPLE[0]]: old }); localStorage.removeItem('a26.saved'); localStorage.removeItem('a26.compare'); }
      return jget('a26.ideas', {});
    },
    board(p) { return this.boards()[p || activePerson()] || {}; },
    status(id, p) { return this.board(p)[id] || null; },
    set(id, st, p) { const all = this.boards(); const k = p || activePerson(); const m = all[k] || {}; if (st) m[id] = st; else delete m[id]; all[k] = m; jset('a26.ideas', all); },
    toggle(id) { const cur = this.status(id); this.set(id, cur ? null : 'maybe'); return this.status(id); },
    ids(p) { return Object.keys(this.board(p)); },
    note(id, v) { const m = jget('a26.notes', {}); if (v != null) { if (v) m[id] = v; else delete m[id]; jset('a26.notes', m); } return m[id] || ''; }
  };
  const STATUS_LABEL = { maybe: 'Maybe', booked: 'Booked', done: 'Done' };

  /* ---------- geo / door-to-door ------------------------------------ */
  function haversine(a, b) { const R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180, dLon = (b[1] - a[1]) * Math.PI / 180, la1 = a[0] * Math.PI / 180, la2 = b[0] * Math.PI / 180; const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
  function travelFromBase(a, baseId) {
    if (a.travel && a.travel[baseId]) { const t = a.travel[baseId]; return { min: t.min, mode: t.mode, approx: false }; }
    const base = D.BASES[baseId]; if (!base || !a.coords) return null;
    const km = haversine(base.coords, a.coords); const modes = a.transport || ['car'];
    let mode = 'drive', kmh = 50;
    if (modes.includes('walk') && km < 2.5) { mode = 'walk'; kmh = 4.5; }
    else if (modes.includes('bike') && km < 22) { mode = 'bike'; kmh = 16; }
    else if (modes.includes('busboat') && !modes.includes('walk')) { mode = 'bus/boat'; kmh = 28; }
    const min = Math.max(3, Math.round(km / kmh * 60 / 5) * 5);
    return { min, mode, approx: true };
  }
  function ddLabel(dd) { return dd ? `${dd.approx ? '≈' : ''}${dd.min} min ${esc(dd.mode)}` : ''; }

  /* ---------- availability on the active date ----------------------- */
  function availableNow(a, baseId, dt) {
    if (a.base !== 'both' && a.base !== baseId) return false;
    if (a.status === 'closed') return false;
    if (a.stayOnly) { const st = stayForDate(dt); if (!st || st.id !== a.stayOnly) return false; }
    return true;
  }
  function eventOccursOn(e, dt) { return e.occurrences ? e.occurrences.includes(dt) : dt >= e.start && dt <= e.end; }
  function eventLastDate(e) { return e.occurrences ? e.occurrences[e.occurrences.length - 1] : e.end; }
  function nextEventDate(e, dt) {
    if (e.occurrences) return e.occurrences.find((date) => date >= dt) || e.occurrences[e.occurrences.length - 1];
    return e.start < dt && e.end >= dt ? dt : e.start;
  }
  function eventSortKey(e, dt) { return `${nextEventDate(e, dt)}|${e.datesLabel || ''}|${e.name}`; }
  function eventsOn(dt) { return D.EVENTS.filter((e) => !e.seriesOverview && eventOccursOn(e, dt)).sort((a, b) => eventSortKey(a, dt).localeCompare(eventSortKey(b, dt))); }
  function upcomingEvents(dt) {
    return D.EVENTS
      .filter((e) => !e.seriesOverview && eventLastDate(e) >= dt && !eventOccursOn(e, dt))
      .sort((a, b) => eventSortKey(a, dt).localeCompare(eventSortKey(b, dt)));
  }

  /* =========================== chrome =============================== */
  const PRIMARY = ['home', 'activities', 'ideas', 'trip', 'map'];
  const NAV_FOR = { home: 'home', today: 'home', activities: 'activities', plan: 'activities', bike: 'activities', ideas: 'ideas', trip: 'trip', event: 'trip', map: 'map', areas: 'map', archive: 'map' };
  const TITLES = { home: 'Annecy & Les Gets', today: 'Today', activities: 'Activities', ideas: 'Ideas', bike: 'Cycling', map: 'Map', trip: 'Trip', areas: 'Areas', archive: 'The cut list' };

  function setChrome(route) {
    const isPrimary = PRIMARY.includes(route.name) && route.parts.length === 0;
    appbar.classList.toggle('has-back', !isPrimary);
    document.body.dataset.route = route.name;
    document.body.classList.toggle('route-home', route.name === 'home');
    document.body.classList.toggle('route-map', route.name === 'map');
    let title = TITLES[route.name] || 'Annecy 2026';
    if (route.name === 'map' && route.query.view === 'alpine') title = 'Alpine Relief Map';
    if (route.name === 'areas' && route.parts[0]) { const a = D.AREA_BY_ID[route.parts[0]]; title = a ? a.name : 'Area'; }
    if (route.name === 'plan' && route.parts[0]) { const a = D.ACT_BY_ID[route.parts[0]]; title = a ? a.title : 'Plan'; }
    if (route.name === 'event' && route.parts[0]) { const e = D.EVENTS.find((x) => x.id === route.parts[0]); title = e ? e.name : 'Event'; }
    titleEl.textContent = title;
    const navFor = route.name === 'map' && route.query.view === 'alpine' ? 'alpine' : (NAV_FOR[route.name] || '');
    navEl.querySelectorAll('a').forEach((a) => { if (a.dataset.nav === navFor) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (actionEl) actionEl.hidden = true; // hearts on cards are the one way to save
  }

  /* ---------- cover / media ----------------------------------------- */
  function mediaImageAttrs(media, tint, label) {
    const remote = media && /^https?:\/\//i.test(media.photo || '');
    return ` data-media-img="1" data-media-tint="${esc(tint || 'alpine')}" data-media-label="${esc(label || (media && media.alt) || '')}"${remote ? ' referrerpolicy="no-referrer"' : ''}`;
  }
  function cover(media, opts) {
    opts = opts || {}; const extra = opts.cls ? ' ' + opts.cls : '';
    if (media && media.photo) return `<img class="cover-img${extra}" src="${esc(media.photo)}" alt="${esc(media.alt || opts.alt || '')}" width="1200" height="800" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async"${mediaImageAttrs(media, media.tint || opts.tint, media.label || opts.label)} />`;
    const tint = (media && media.tint) || opts.tint || 'alpine';
    const label = (media && media.label) || opts.label || '';
    return `<div class="cover-ph${extra}" data-tint="${esc(tint)}" role="img" aria-label="${esc(label || opts.alt || 'illustration')}">${label ? `<span class="cover-label">${esc(label)}</span>` : ''}</div>`;
  }
  function coverOf(obj) { if (!obj) return null; if (obj.media) return obj.media; if (obj.photo) return { photo: obj.photo }; return null; }
  function actCover(a) {
    const own = coverOf(a);
    if (own && own.photo) return own;
    return own || { label: a.title, tint: catTint(a.cat) };
  }
  function catTint(c) { if (['road', 'gravel', 'mtb', 'easybike'].includes(c)) return 'pine'; if (['swim', 'paddle', 'boat', 'whitewater'].includes(c)) return 'aqua'; if (['sport', 'caving', 'viaferrata', 'canyoning', 'paragliding'].includes(c)) return 'purple'; if (['food'].includes(c)) return 'sun'; return 'alpine'; }

  // Official preview URLs can change. A failed image becomes the same
  // intentional text-first card/placeholder used for activities with no photo.
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.matches('[data-media-img]')) return;
    const card = img.closest('.pin-card, .idea-card');
    if (card) {
      const wrap = img.closest('.pin-img');
      if (wrap) wrap.remove(); else img.remove();
      card.classList.add('no-photo');
      return;
    }
    const placeholder = document.createElement('div');
    placeholder.className = img.className.replace(/\bcover-img\b/, 'cover-ph');
    placeholder.dataset.tint = img.dataset.mediaTint || 'alpine';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', img.alt || img.dataset.mediaLabel || 'Photo unavailable');
    if (img.dataset.mediaLabel) {
      const label = document.createElement('span');
      label.className = 'cover-label';
      label.textContent = img.dataset.mediaLabel;
      placeholder.appendChild(label);
    }
    img.replaceWith(placeholder);
  }, true);

  /* ---------- provenance ------------------------------------------- */
  function sourceLine(a) {
    const s = a.src ? D.SOURCES[a.src] : null;
    const photo = a.media && a.media.source
      ? `Photo: <a href="${esc(a.media.source)}" target="_blank" rel="noopener">${esc(a.media.credit || 'official activity page')} ↗</a>`
      : '';
    if (!s && !photo) return '';
    const verify = a.verifyBeforeGo ? `<span class="verify-badge" title="Not confirmed for our exact dates">Verify before going</span>` : '';
    const source = s ? `Source: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.type)} ↗</a> · checked ${esc(s.on || D.VERIFIED)}` : '';
    return `<p class="source-line">${verify} ${source}${source && photo ? ' · ' : ''}${photo}</p>`;
  }

  /* ---------- save / status controls (Save = idea for the active person) */
  function saveBtn(id, cls) {
    const st = Ideas.status(id); const p = activePerson();
    const label = st ? `Remove from ${esc(p)}’s ideas (${STATUS_LABEL[st]})` : `Save to ${esc(p)}’s ideas`;
    return `<button type="button" class="save-btn${st ? ' on' : ''} ${cls || ''}" data-save="${esc(id)}" aria-pressed="${!!st}" aria-label="${label}" title="${label}">${bookmarkIcon(!!st)}</button>`;
  }
  // event delegation for save buttons (bound once)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-save]'); if (!b) return;
    e.preventDefault();
    const id = b.dataset.save; const st = Ideas.toggle(id); const p = activePerson();
    b.classList.toggle('on', !!st); b.setAttribute('aria-pressed', String(!!st));
    const label = st ? `Remove from ${p}’s ideas (${STATUS_LABEL[st]})` : `Save to ${p}’s ideas`;
    b.setAttribute('aria-label', label); b.setAttribute('title', label);
    b.innerHTML = bookmarkIcon(!!st);
    announce(st ? `Added to ${p}’s ideas` : `Removed from ${p}’s ideas`);
    // screens that show saved state beyond the heart itself must repaint
    if (screenEl.querySelector('.status-picker, .person-row')) render();
  });

  /* ---------- activity card ----------------------------------------- */
  function activityCard(a) {
    const sub = a.subtype ? `<span class="pc-sub">${esc(a.subtype)}</span>` : '';
    return `<article class="plan-card">
      <a class="pc-hit" href="#/plan/${esc(a.id)}">
        <div class="pc-top"><h3>${esc(a.title)}</h3>${sub}</div>
        <p class="pc-desc">${esc(a.summary)}</p>
      </a>
      <p class="pin-meta">${esc(pinMeta(a))}</p>
      <div class="pc-actions">${saveBtn(a.id)}<a class="pc-open" href="#/plan/${esc(a.id)}">Details →</a></div>
    </article>`;
  }

  /* ---------- context bar (active date + base) ---------------------- */
  function contextBar() {
    const dt = activeDate(); const stay = activeStay(); const co = changeoverOn(dt);
    const pre = isPreTrip() ? `<span class="ctx-flag">Previewing day 1</span>` : '';
    return `<div class="context-bar">
      <button type="button" class="ctx-nav" data-date="prev" aria-label="Previous day">‹</button>
      <div class="ctx-mid">
        <strong>${esc(prettyDay(dt))}</strong>
        <span class="ctx-sub">Day ${dayNumber(dt)} · ${esc(stay.village)}${co ? ' · changeover' : ''}</span>
        ${pre}
      </div>
      <button type="button" class="ctx-nav" data-date="next" aria-label="Next day">›</button>
      <button type="button" class="ctx-today" data-date="today">Today</button>
    </div>`;
  }
  function wireContextBar() {
    screenEl.querySelectorAll('[data-date]').forEach((b) => b.addEventListener('click', () => {
      const cmd = b.dataset.date; const dt = activeDate();
      if (cmd === 'today') setDate('');
      else if (cmd === 'prev') setDate(dt <= D.TRIP.window.start ? D.TRIP.window.start : addDays(dt, -1));
      else if (cmd === 'next') setDate(dt >= D.TRIP.window.end ? D.TRIP.window.end : addDays(dt, 1));
      render(); const again = screenEl.querySelector(`[data-date="${cmd}"]`); if (again) again.focus({ preventScroll: true }); announce('Viewing ' + prettyDay(activeDate()));
    }));
  }

  /* =========================== VIEWS ================================ */
  const Views = {};

  /* ---------- HOME (the front cover + table of contents) ------------ */
  Views.home = function () {
    const real = parisToday();
    const inTrip = real >= D.TRIP.window.start && real <= D.TRIP.window.end;
    const post = isPostTrip();
    const live = inTrip
      ? `<a class="hm-live" href="#/today"><span>Day ${dayNumber(real)} · ${esc(stayForDate(real).village)}</span><span class="hm-go">Open Today →</span></a>`
      : '';
    const coverTail = inTrip ? `Day ${dayNumber(real)} of 18` : (post ? 'Well, that happened' : `${daysUntilTrip()} days away`);
    const taster = [...new Map(
      ['lake-loop-road', 'angon-apero', 'semnoz-picnic', 'annecy-market', ...D.FEATURED]
        .map((id) => [id, D.ACT_BY_ID[id]])
    ).values()].filter((a) => a && actCover(a)?.photo).slice(0, 4);
    const tasterCards = taster.map((a) => pinCard(a, { eager: true })).join('');
    const regionCopy = {
      water: 'Beaches, paddling, boats & swims',
      cycling: 'Road cols, greenways & bike parks',
      mountains: 'Trails, panoramas & mountain walks',
      food: 'Cheese, markets & local stories',
      adrenaline: 'Paragliding, canyoning & big days',
      easy: 'Villages, lakeside towns & slow mornings'
    };
    const regionLinks = GUIDE_CATS.map((cat) => `
      <a class="hm-region-link" href="#/activities?cat=${esc(cat.id)}">
        <span><strong>${esc(cat.label)}</strong><small>${esc(regionCopy[cat.id])}</small></span>
        <span class="hm-region-go" aria-hidden="true">→</span>
      </a>`).join('');
    const homeEvents = D.EVENTS.filter((event) => event.homepageRide || event.homepageEvent)
      .sort((a, b) => a.start.localeCompare(b.start));
    const homeEventRows = homeEvents.map((event) => {
      const [dow, day, month] = prettyDay(event.start).split(' ');
      return `<a class="hm-event-row" href="#/event/${esc(event.id)}">
        <time class="hm-event-date" datetime="${esc(event.start)}"><span>${esc(dow)}</span><strong>${esc(day)}</strong><small>${esc(month)}</small></time>
        <span class="hm-event-media">${cover(coverOf(event), { cls: 'hm-event-image', alt: event.name })}</span>
        <span class="hm-event-copy"><strong>${esc(event.name)}</strong><span>${esc(event.homeSummary || event.why)}</span></span>
        <span class="hm-event-meta">${esc(event.homeMeta || event.datesLabel)}</span>
        <span class="hm-event-go" aria-hidden="true">→</span>
      </a>`;
    }).join('');
    return `
      <section class="hm-world">
        ${live}
        <header class="hm-cover">
          <div class="hm-cover-txt">
            <h2 class="hm-title">Annecy &amp; Les Gets</h2>
            <p class="hm-dek">The lake, the cols, the cheese, and everything we need in one place.</p>
            <p class="hm-meta">${esc(D.TRIP.datesLabel)} · Haute-Savoie · ${esc(coverTail)}</p>
            <a class="hm-cta" href="#/activities">Explore activities</a>
          </div>

          <div class="hm-portal">
            <div class="hm-portal-view">
              <img src="assets/art/annecy-waterfront-v3.jpg" alt="An illustrated Annecy waterfront with turquoise water, small boats, limestone mountains, and flowered ironwork" width="2135" height="736" fetchpriority="high" />
              <span class="hm-portal-caption">Annecy waterfront · turquoise shallows &amp; La Tournette</span>
            </div>
            <div class="hm-portal-body">
              <div class="hm-portal-head">
                <div>
                  <h3>Explore the region</h3>
                  <p>All ${D.ACTIVITIES.length} ideas, loosely organized for browsing.</p>
                </div>
                <a href="#/activities">See everything →</a>
              </div>
              <nav class="hm-region-index" aria-label="Explore activity categories">
                ${regionLinks}
              </nav>
            </div>
          </div>
        </header>
      </section>

      <section class="hm-intro">
        <p class="hm-lead">Our field guide to the rides, swims, villages, food, and history around the lake — plus the trip details we’ll actually need.</p>
        <p class="hm-sub">Browse everything, save what looks good, and decide as we go.</p>
      </section>

      <nav class="hm-index" aria-label="Site contents">
        <a class="hm-ix" href="#/ideas"><img src="assets/wiki/col-aravis.jpg" alt="" loading="lazy" /><span class="hm-ix-b"><strong>Our ideas</strong><span>What each of us wants to remember</span></span><span class="hm-arr" aria-hidden="true">→</span></a>
        <a class="hm-ix" href="#/trip"><img src="assets/wiki/veyrier.jpg" alt="" loading="lazy" /><span class="hm-ix-b"><strong>Trip details</strong><span>Stays, flights, the van, and essentials</span></span><span class="hm-arr" aria-hidden="true">→</span></a>
        <a class="hm-ix" href="#/map"><img src="assets/wiki/duingt.jpg" alt="" loading="lazy" /><span class="hm-ix-b"><strong>Open the map</strong><span>See how the lake and mountains fit together</span></span><span class="hm-arr" aria-hidden="true">→</span></a>
      </nav>

      <section class="hm-events" aria-labelledby="hm-events-title">
        <div class="hm-events-head">
          <div><p class="hm-events-kicker">While we’re there</p><h3 id="hm-events-title">Nearby events coming up</h3></div>
        <p>The races, festivals, lake oddities and one very local tractor competition that land during the trip.</p>
        </div>
        <div class="hm-event-list">${homeEventRows}</div>
      </section>

      <section class="hm-place">
        <div class="hm-lab"><h3>Get a feel for the place</h3></div>
        <div class="hm-scroll">
          <a class="hm-pc" href="#/activities?cat=water"><img src="assets/wiki/lake-beach.jpg" alt="" loading="lazy" /><strong>The lake</strong><span>Turquoise water, village beaches, paddling, and the flat greenway.</span></a>
          <a class="hm-pc" href="#/activities?cat=mountains"><img src="assets/wiki/les-gets-mtb.jpg" alt="" loading="lazy" /><strong>The mountains</strong><span>Les Gets bike park, famous cols, and the Aravis behind them.</span></a>
          <a class="hm-pc" href="#/activities?cat=food"><img src="assets/wiki/glieres.jpg" alt="" loading="lazy" /><strong>Food &amp; history</strong><span>Reblochon country, old-town markets, and the Resistance story in these hills.</span></a>
        </div>
      </section>

      <section class="hm-context">
        <div class="hm-lab"><h3>A little context</h3><a class="hm-eyebrow" href="#/plan/glieres-walk">Visit the Glières →</a></div>
        <div class="hm-context-grid">
          ${[D.STORY[0], D.STORY[4], D.HISTORY[1]].map((item) => `<article><h4>${esc(item.title)}</h4><p>${esc(item.text)}</p></article>`).join('')}
        </div>
      </section>

      <section class="hm-taster">
        <div class="hm-lab"><h3>A few highlights</h3><a class="hm-eyebrow" href="#/activities">Browse all ${D.ACTIVITIES.length} →</a></div>
        <div class="pin-grid hm-pad">${tasterCards}</div>
      </section>

      ${!inTrip ? `<a class="hm-today" href="#/today"><strong>During the trip: Today</strong><span>The current stay, useful reminders, and directions home.</span></a>` : ''}
    `;
  };

  /* ---------- TODAY (the during-trip page) -------------------------- */
  function daysUntilTrip() { const t = parisToday(); return Math.max(0, Math.round((Date.UTC(...D.TRIP.window.start.split('-').map((x, i) => i === 1 ? x - 1 : +x)) - Date.UTC(...t.split('-').map((x, i) => i === 1 ? x - 1 : +x))) / 86400000)); }
  Views.today = function () {
    const dt = activeDate(); const stay = activeStay(); const base = stay.baseId; const co = changeoverOn(dt);
    const T = D.TRANSPORT;
    const todays = eventsOn(dt);
    const upcoming = upcomingEvents(dt).slice(0, 8);
    const p = activePerson();
    const ideaActs = Ideas.ids().map((id) => D.ACT_BY_ID[id]).filter(Boolean);
    const ideasBlock = ideaActs.length
      ? `<div class="section-head"><h2>${esc(p)}’s ideas</h2><a class="see-all" href="#/ideas">All boards (${ideaActs.length})</a></div><div class="cards">${ideaActs.slice(0, 4).map((a) => activityCard(a)).join('')}</div>`
      : '';
    const fitCards = D.GREAT_FIT_PICKS.map(greatFitCard).filter(Boolean);
    const calendarEvents = D.EVENTS
      .filter((e) => !e.seriesOverview && eventLastDate(e) >= D.TRIP.window.start && e.start <= D.TRIP.window.end)
      .sort((a, b) => eventSortKey(a, D.TRIP.window.start).localeCompare(eventSortKey(b, D.TRIP.window.start)));

    // Gentle nudges, only on the days that genuinely need them.
    const notes = [];
    if (isPreTrip()) notes.push(`<div class="note-box pre"><strong>Trip starts ${esc(prettyDay(D.TRIP.window.start))}</strong> — ${daysUntilTrip()} days away. You’re previewing Day 1; flip through days with ‹ › above, or <a href="#/trip">see the whole trip →</a></div>`);
    if (dt === D.TRIP.window.start && !isPreTrip()) notes.push(`<div class="note-box"><strong>Arrival day.</strong> Van pickup: ${esc(T.car.pickup)}. ${esc(T.car.find)} <a href="#/trip">Trip details →</a></div>`);
    if (co) notes.push(`<div class="note-box warn"><strong>Changeover day.</strong> Out of ${esc(co.out.name)} (${esc(co.out.checkout)}), into ${esc(co.inn.name)} (${esc(co.inn.checkin)}). ${dt === '2026-08-22' ? 'Also the Les Gets World-Cup Downhill day — expect crowds if you go near Les Gets.' : ''}</div>`);
    const coTomorrow = changeoverOn(addDays(dt, 1));
    if (coTomorrow && !co) notes.push(`<div class="note-box"><strong>Heads-up:</strong> tomorrow is changeover — out of ${esc(coTomorrow.out.name)} (${esc(coTomorrow.out.checkout)}). Worth packing tonight.</div>`);
    if (dt === D.TRIP.window.end) notes.push(`<div class="note-box warn"><strong>Departure day.</strong> ${esc(T.departure)} <a href="#/trip">Full plan →</a></div>`);
    else if (addDays(dt, 1) === D.TRIP.window.end) notes.push(`<div class="note-box"><strong>Heads-up:</strong> tomorrow is the early departure (leave ~06:15). Sort packing + the Casa Elisa deposit today.</div>`);

    return `
      ${contextBar()}
      <section class="today-hero">
        <div class="th-eyebrow">${esc(stay.legLabel)} · ${esc(stay.dates)}</div>
        <h2 class="th-title">${base === 'lesgets' ? 'Bike-park days at Les Gets' : 'On the lake, from Veyrier-du-Lac'}</h2>
        <details class="stay-inline">
          <summary><span class="si-name">${esc(stay.name)}</span><span class="si-vil">${esc(stay.village)}</span></summary>
          <p class="si-addr">${esc(stay.address)}</p>
          <p class="si-times"><strong>In:</strong> ${esc(stay.checkin)}<br><strong>Out:</strong> ${esc(stay.checkout)}</p>
          <div class="ac-tags">${stay.features.map((f) => `<span class="tag">${esc(f)}</span>`).join('')}</div>
        </details>
        <div class="actions hero-actions">
          <a class="btn" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stay.address)}" target="_blank" rel="noopener">Directions home ↗</a>
          <a class="btn ghost" href="#/trip">Trip &amp; logistics</a>
        </div>
      </section>

      ${notes.join('')}

      <div class="action-row">
        <a class="action-tile" href="#/activities">Activities</a>
        <a class="action-tile" href="#/bike">Cycling</a>
        <a class="action-tile" href="#/activities?booking=required">Must book</a>
      </div>

      <section class="today-agenda" aria-labelledby="today-agenda-title">
        <header class="today-section-head">
          <p class="page-kicker">Dated things nearby</p>
          <h2 id="today-agenda-title">Today &amp; next up</h2>
          <p>Specific events worth knowing about, not a schedule we have to obey.</p>
        </header>
        <div class="today-event-block">
          <div class="today-event-label"><span>On this day</span><strong>${esc(prettyDay(dt))}</strong></div>
          <div class="today-event-list">
            ${todays.length ? todays.map(eventRow).join('') : `<p class="today-empty">No fixed event on this date. The day is still ours.</p>`}
          </div>
        </div>
        ${upcoming.length ? `<div class="today-event-block next">
          <div class="today-event-label"><span>Coming up</span><strong>Next nearby</strong></div>
          <div class="today-event-list">${upcoming.map(eventRow).join('')}</div>
        </div>` : ''}
        <details class="today-library">
          <summary><span>Full August calendar</span><strong>${calendarEvents.length} events &amp; individual race sessions</strong></summary>
          <div class="today-calendar">${eventCalendar(calendarEvents)}</div>
        </details>
      </section>

      <section class="today-fits" aria-labelledby="today-fits-title">
        <header class="today-section-head">
          <p class="page-kicker">The researched shortlist</p>
          <h2 id="today-fits-title">Thirty things we’d actually love</h2>
          <p>An anytime menu for the four of us. Save whatever sounds good; nobody is assigning it to a day.</p>
        </header>
        <div class="fit-grid">${fitCards.slice(0, 6).join('')}</div>
        <details class="today-library fit-library">
          <summary><span>See the complete shortlist</span><strong>All 30 recommendations</strong></summary>
          <div class="fit-grid">${fitCards.slice(6).join('')}</div>
        </details>
      </section>

      ${ideasBlock}
    `;
  };

  function shortEventDate(e) {
    return (e.datesLabel || prettyDay(e.start)).split('·')[0].split(',')[0].trim();
  }

  function eventSeriesName(e) {
    if (!e.series) return '';
    const parent = D.EVENTS.find((item) => item.id === e.series);
    return parent ? parent.name : '';
  }

  function eventRow(e) {
    const base = activeBase(); const dd = travelFromBase(e, base);
    const conflict = e.conflict ? `<span class="ev-conflict">changeover clash</span>` : '';
    const series = eventSeriesName(e);
    return `<a class="event-row" href="#/event/${esc(e.id)}">
      <time class="er-date" datetime="${esc(e.start)}">${esc(shortEventDate(e))}</time>
      <div class="er-body">${series ? `<span class="er-series">${esc(series)}</span>` : ''}<h3>${esc(e.name)} ${conflict}</h3><p>${esc(e.datesLabel)} · ${esc(e.where)}${dd ? ` · ${dd.approx ? '≈' : ''}${dd.min}′` : ''}</p></div>
      <span class="er-go" aria-hidden="true">›</span>
    </a>`;
  }

  function eventCalendar(events) {
    const groups = new Map();
    events.forEach((event) => {
      const date = event.start < D.TRIP.window.start ? D.TRIP.window.start : event.start;
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date).push(event);
    });
    return Array.from(groups.entries()).map(([date, rows]) => `<section class="calendar-day" aria-labelledby="calendar-${esc(date)}">
      <h3 id="calendar-${esc(date)}">${esc(prettyDay(date))}</h3>
      <div>${rows.map(eventRow).join('')}</div>
    </section>`).join('');
  }

  function greatFitCard(pick, index) {
    const item = pick.type === 'event' ? D.EVENTS.find((event) => event.id === pick.id) : D.ACT_BY_ID[pick.id];
    if (!item) return '';
    const isEvent = pick.type === 'event';
    const href = isEvent ? `#/event/${item.id}` : `#/plan/${item.id}`;
    const title = pick.title || (isEvent ? item.name : item.title);
    const summary = pick.summary || item.why || item.summary || '';
    const media = isEvent ? coverOf(item) : actCover(item);
    const place = isEvent ? item.where : ((D.AREA_BY_ID[item.areaId] || {}).name || item.where || 'Haute-Savoie');
    const meta = isEvent ? item.datesLabel : pinMeta(item);
    const pair = pick.pairId ? D.ACT_BY_ID[pick.pairId] : null;
    return `<article class="fit-card">
      <a class="fit-hit" href="${esc(href)}">
        <div class="fit-media">${cover(media, { cls: 'fit-image', alt: title, tint: isEvent ? 'purple' : catTint(item.cat) })}<span class="fit-rank">${String(index + 1).padStart(2, '0')}</span></div>
        <div class="fit-copy"><span class="fit-place">${esc(place)}</span><h3>${esc(title)}</h3><p>${esc(summary)}</p><small>${esc(meta)}</small></div>
      </a>
      <div class="fit-actions">${saveBtn(item.id)}${pair ? `<a href="#/plan/${esc(pair.id)}">Also open ${esc(pair.title)} →</a>` : `<a href="${esc(href)}">Details →</a>`}</div>
    </article>`;
  }

  /* ---------- ACTIVITIES (the guidebook: browse everything) ---------
     One screen replaces Discover / Browse / Search / Build-a-day.
     Everything is always visible — no day/leg gating; filters are
     light moods, not machinery. -------------------------------------- */
  let actState = { cat: 'all', area: 'all', effort: 'all', booking: 'all', rain: false, q: '' };
  function readActQuery(route) {
    actState = {
      cat: route.query.cat && GUIDE_BY_ID[route.query.cat] ? route.query.cat : 'all',
      area: route.query.area && D.AREA_BY_ID[route.query.area] ? route.query.area : 'all',
      effort: ['recovery', 'easy', 'moderate', 'big'].includes(route.query.effort) ? route.query.effort : 'all',
      booking: ['required', 'recommended', 'no'].includes(route.query.booking) ? route.query.booking : 'all',
      rain: route.query.rain === '1',
      q: route.query.q || ''
    };
  }
  function buildActQS() {
    const p = [];
    if (actState.cat !== 'all') p.push('cat=' + actState.cat);
    if (actState.area !== 'all') p.push('area=' + actState.area);
    if (actState.effort !== 'all') p.push('effort=' + actState.effort);
    if (actState.booking !== 'all') p.push('booking=' + actState.booking);
    if (actState.rain) p.push('rain=1');
    if (actState.q) p.push('q=' + encodeURIComponent(actState.q));
    return p.length ? '?' + p.join('&') : '';
  }
  function actMatches(a) {
    if (a.status === 'closed') return false;
    if (actState.cat !== 'all') { const c = GUIDE_BY_ID[actState.cat]; if (!c || !c.test(a)) return false; }
    if (actState.area !== 'all' && a.areaId !== actState.area) return false;
    if (actState.effort !== 'all' && a.effort !== actState.effort) return false;
    if (actState.booking !== 'all' && (a.booking || 'no') !== actState.booking) return false;
    if (actState.rain && !((a.weather && a.weather.rain === 'good') || (a.themes || []).includes('rainy'))) return false;
    if (actState.q) { const q = actState.q.trim().toLowerCase(); if (q) { const hay = [a.title, a.summary, a.subtype, a.cat, (a.themes || []).join(' '), (D.AREA_BY_ID[a.areaId] || {}).name].join(' ').toLowerCase(); if (!hay.includes(q)) return false; } }
    return true;
  }
  function pinMeta(a) {
    const bits = [CAT_LABEL[a.cat], EFFORT_LABEL[a.effort], DUR_LABEL[a.duration]].filter(Boolean);
    if (a.booking === 'required') bits.push('Must book');
    else if (a.booking === 'recommended') bits.push('Book ahead');
    if (a.verifyBeforeGo) bits.push('Verify');
    return bits.join(' · ');
  }
  function pinCard(a, opts) {
    opts = opts || {};
    const img = actCover(a); const hasPhoto = !!(img && img.photo);
    const area = D.AREA_BY_ID[a.areaId];
    const leg = a.base === 'lesgets' ? `<span class="pin-leg">Les Gets</span>` : '';
    return `<article class="pin-card${hasPhoto ? '' : ' no-photo'}" data-tint="${esc(catTint(a.cat))}">
      <a class="pin-hit" href="#/plan/${esc(a.id)}">
        ${hasPhoto ? `<div class="pin-img"><img src="${esc(img.photo)}" alt="${esc(img.alt || '')}" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async"${mediaImageAttrs(img, catTint(a.cat), a.title)} />${leg}</div>` : ''}
        <h3>${esc(a.title)}</h3>
        ${area ? `<p class="pin-place">${esc(area.name)}</p>` : ''}
        <p class="pin-meta">${esc(pinMeta(a))}${!hasPhoto && a.base === 'lesgets' ? ' · Les Gets leg' : ''}</p>
        <p class="pin-sum">${esc(a.summary)}</p>
      </a>
      <div class="pin-foot">${saveBtn(a.id)}</div>
    </article>`;
  }
  Views.activities = function (route) {
    readActQuery(route);
    const categories = `<button type="button" class="category-tab" data-actcat="all" aria-pressed="${actState.cat === 'all'}">All</button>` +
      GUIDE_CATS.map((c) => `<button type="button" class="category-tab" data-actcat="${esc(c.id)}" aria-pressed="${actState.cat === c.id}">${esc(c.label)}</button>`).join('');
    const areas = D.AREAS.map((a) => `<option value="${esc(a.id)}"${actState.area === a.id ? ' selected' : ''}>${esc(a.name)}</option>`).join('');
    return `
      <header class="page-head activities-head">
        <p class="page-kicker">Explore</p>
        <h2>What could we do?</h2>
        <p>${D.ACTIVITIES.length} ideas around the lake and mountains.</p>
      </header>
      <div class="category-tabs" role="group" aria-label="Activity category">${categories}</div>
      <button type="button" class="activity-filter-toggle" id="act-filter-toggle" aria-expanded="false" aria-controls="activity-tools">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M8 4v6M16 14v6"/></svg>
        <strong>Filters</strong>
        <span class="activity-mobile-count" id="act-mobile-count"></span>
        <svg class="filter-chevron" aria-hidden="true" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg>
      </button>
      <div class="activity-tools" id="activity-tools">
        <label class="filter-field"><span>Area</span><select id="act-area"><option value="all">Everywhere</option>${areas}</select></label>
        <label class="filter-field"><span>Effort</span><select id="act-effort">
          <option value="all">Any effort</option>
          ${Object.entries(EFFORT_LABEL).map(([id, label]) => `<option value="${id}"${actState.effort === id ? ' selected' : ''}>${esc(label)}</option>`).join('')}
        </select></label>
        <label class="filter-field"><span>Booking</span><select id="act-booking">
          <option value="all">Any booking</option>
          <option value="required"${actState.booking === 'required' ? ' selected' : ''}>Must book</option>
          <option value="recommended"${actState.booking === 'recommended' ? ' selected' : ''}>Book ahead</option>
          <option value="no"${actState.booking === 'no' ? ' selected' : ''}>No booking</option>
        </select></label>
        <button type="button" class="rain-toggle" id="act-rain" aria-pressed="${actState.rain}">Rain-safe</button>
        <label class="activity-search"><span class="sr-only">Find an activity</span><input class="search-input" id="act-q" type="search" value="${esc(actState.q)}" placeholder="Find an activity" autocomplete="off"></label>
        <span class="activity-count" id="act-count"></span>
      </div>
      <a class="bike-banner" href="#/bike"><span><strong>Cycling guide</strong><small>Cols, gravel, bike parks, rentals, and races</small></span><span class="bb-go" aria-hidden="true">→</span></a>
      <div class="pin-grid" id="act-grid"></div>
      ${creditsBlock()}
    `;
  };
  function wireActivities() {
    const grid = document.getElementById('act-grid'); if (!grid) return;
    let searchAnnounceTimer = null;
    const redraw = () => {
      const list = D.ACTIVITIES.filter(actMatches);
      grid.innerHTML = list.length ? list.map(pinCard).join('') : `<div class="empty">Nothing matches those filters. <button class="link-btn" id="act-clear">Clear filters</button></div>`;
      const clr = document.getElementById('act-clear'); if (clr) clr.addEventListener('click', () => {
        actState = { cat: 'all', area: 'all', effort: 'all', booking: 'all', rain: false, q: '' };
        history.replaceState(null, '', '#/activities');
        render();
      });
      const cnt = document.getElementById('act-count'); if (cnt) cnt.textContent = list.length + ' of ' + D.ACTIVITIES.length;
      const mobileCnt = document.getElementById('act-mobile-count'); if (mobileCnt) mobileCnt.textContent = list.length + ' ideas';
      const toggle = document.getElementById('act-filter-toggle');
      if (toggle) toggle.classList.toggle('has-active', actState.area !== 'all' || actState.effort !== 'all' || actState.booking !== 'all' || actState.rain || !!actState.q.trim());
    };
    const sync = () => {
      history.replaceState(null, '', '#/activities' + buildActQS());
      screenEl.querySelectorAll('[data-actcat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.actcat === actState.cat)));
      const rain = document.getElementById('act-rain'); if (rain) rain.setAttribute('aria-pressed', String(actState.rain));
      redraw();
      announce(D.ACTIVITIES.filter(actMatches).length + ' activities shown');
    };
    screenEl.querySelectorAll('[data-actcat]').forEach((b) => b.addEventListener('click', () => { actState.cat = b.dataset.actcat; sync(); }));
    [['act-area', 'area'], ['act-effort', 'effort'], ['act-booking', 'booking']].forEach(([id, key]) => {
      const el = document.getElementById(id); if (el) el.addEventListener('change', () => { actState[key] = el.value; sync(); });
    });
    const rain = document.getElementById('act-rain'); if (rain) rain.addEventListener('click', () => { actState.rain = !actState.rain; sync(); });
    const inp = document.getElementById('act-q');
    if (inp) inp.addEventListener('input', () => {
      actState.q = inp.value;
      history.replaceState(null, '', '#/activities' + buildActQS());
      redraw();
      clearTimeout(searchAnnounceTimer);
      searchAnnounceTimer = setTimeout(() => {
        if (document.getElementById('act-q') === inp) announce(D.ACTIVITIES.filter(actMatches).length + ' activities shown');
      }, 250);
    });
    const filterToggle = document.getElementById('act-filter-toggle');
    const tools = document.getElementById('activity-tools');
    if (filterToggle && tools) filterToggle.addEventListener('click', () => {
      const open = tools.classList.toggle('is-open');
      filterToggle.setAttribute('aria-expanded', String(open));
    });
    redraw();
  }

  /* ---------- ACTIVITY DETAIL --------------------------------------- */
  Views.activity = function (route) {
    const a = D.ACT_BY_ID[route.parts[0]]; if (!a) return `<div class="empty">Unknown activity. <a href="#/activities">Back to Activities</a></div>`;
    const base = activeBase(); const relevant = a.base === 'both' || a.base === base;
    const dd = travelFromBase(a, base); const ddOther = travelFromBase(a, base === 'lake' ? 'lesgets' : 'lake');
    const area = D.AREA_BY_ID[a.areaId];
    const note = Ideas.note(a.id);

    const facts = [];
    if (a.subtype) facts.push(['Type', esc(a.subtype)]);
    facts.push(['Where', esc(a.where || (area ? area.name : '—'))]);
    if (dd) facts.push(['Door-to-door', `${dd.approx ? '≈' : ''}${dd.min} min ${esc(dd.mode)} from ${esc(D.BASES[base].label)}`]);
    if (a.activityTime) facts.push(['Time out there', esc(a.activityTime)]);
    facts.push(['Effort', EFFORT_LABEL[a.effort] || '—']);
    if (a.distanceKm) facts.push(['Distance', `${a.distanceKm} km${a.ascentM ? ` · ${a.ascentM} m climb` : ''}`]);
    else if (a.ascentM) facts.push(['Ascent', `${a.ascentM} m`]);
    if (a.difficulty) facts.push(['Difficulty', esc(a.difficulty)]);
    if (a.booking && a.booking !== 'no') facts.push(['Booking', a.booking === 'required' ? 'Required' : 'Recommended']);
    if (a.price) facts.push(['Price', esc(a.price)]);

    const details = [];
    if (a.skill) details.push(['Skill / fitness', a.skill]);
    if (a.gear) details.push(['Gear', a.gear]);
    if (a.safety) details.push(['Safety', a.safety]);
    if (a.access) details.push(['Getting there', a.access]);
    if (a.facilities) details.push(['On site', a.facilities]);
    if (a.weather && a.weather.note) details.push(['Conditions', a.weather.note]);

    const pair = (a.pairWith || []).map((id) => D.ACT_BY_ID[id]).filter(Boolean);
    const alt = a.easierAlt ? D.ACT_BY_ID[a.easierAlt] : null;

    const links = [];
    if (a.bookingUrl) links.push(`<a class="btn" href="${esc(a.bookingUrl)}" target="_blank" rel="noopener">Book / official ↗</a>`);
    if (a.coords) links.push(`<a class="btn ghost" href="https://www.google.com/maps/dir/?api=1&origin=${activeStay().coords.join(',')}&destination=${a.coords.join(',')}" target="_blank" rel="noopener">Directions ↗</a>`);
    if (a.coords) links.push(`<a class="btn ghost" href="#/map?place=act-${esc(a.id)}">On map</a>`);
    if (a.gpx) links.push(`<a class="btn ghost" href="${esc(a.gpx)}" target="_blank" rel="noopener">Route / GPX ↗</a>`);

    return `
      <div class="detail-hero">${cover(actCover(a), { alt: a.title, cls: 'cover-fill', eager: true })}
        <div class="dh-inner"><div class="dh-zone">${esc(CAT_LABEL[a.cat] || '')}${area ? ' · ' + esc(area.name) : ''}</div><h2 class="dh-h1">${esc(a.title)}</h2></div>
      </div>

      ${!relevant && !isPreTrip() ? `<div class="note-box warn">You’re based at <strong>${esc(D.BASES[base].label)}</strong> right now — this is a ${esc(D.BASES[a.base] ? D.BASES[a.base].label : 'different-base')} activity${ddOther ? ` (${ddOther.approx ? '≈' : ''}${ddOther.min} min from there)` : ''}.</div>` : `${!relevant ? `<p class="intro">${a.base === 'lesgets' ? 'A Les Gets-leg option (12–15 Aug).' : 'A lake-leg option (15–29 Aug).'}</p>` : ''}`}
      ${a.status === 'closed' ? `<div class="note-box warn"><strong>Currently closed</strong> — not available for the trip.</div>` : ''}

      <p class="detail-lede">${esc(a.summary)}</p>
      ${a.why ? `<p class="detail-why">${esc(a.why)}</p>` : ''}

      <div class="detail-actions">${saveBtn(a.id, 'big')} ${statusPicker(a.id)}</div>

      <dl class="spec">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>

      <div class="actions">${links.join('')}</div>

      ${details.length ? `<details class="logi"><summary>Logistics &amp; safety</summary><dl class="spec">${details.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details>` : ''}

      ${a.availability ? `<p class="avail-line"><strong>When:</strong> ${esc(a.availability)}</p>` : ''}

      ${pair.length ? `<div class="section-head"><h2>Pair it with</h2></div><div class="cards">${pair.map((p) => activityCard(p)).join('')}</div>` : ''}
      ${alt ? `<div class="section-head"><h2>Easier / weather-proof alternative</h2></div><div class="cards">${activityCard(alt)}</div>` : ''}

      <div class="section-head"><h2>Your notes</h2></div>
      <textarea class="note-field" id="note-${esc(a.id)}" data-note="${esc(a.id)}" rows="2" placeholder="Add a private note (saved on this device)…">${esc(note)}</textarea>

      ${sourceLine(a)}
    `;
  };
  function statusPicker(id) {
    const cur = Ideas.status(id);
    return `<span class="status-picker" role="group" aria-label="Set status">${['maybe', 'booked', 'done'].map((s) => `<button type="button" class="sp-btn" data-status="${id}:${s}" aria-pressed="${cur === s}">${STATUS_LABEL[s]}</button>`).join('')}</span>`;
  }
  function wireStatusButtons() {
    screenEl.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
      const [id, s] = b.dataset.status.split(':'); const cur = Ideas.status(id);
      Ideas.set(id, cur === s ? null : s);
      render(); const again = screenEl.querySelector(`[data-status="${b.dataset.status}"]`); if (again) again.focus({ preventScroll: true }); announce(cur === s ? 'Status cleared' : 'Marked ' + STATUS_LABEL[s]);
    }));
  }
  function wireActivity() {
    wireStatusButtons();
    const ta = screenEl.querySelector('[data-note]');
    if (ta) {
      let noteAnnounceTimer = null;
      const saveNote = (announceNow) => {
        Ideas.note(ta.dataset.note, ta.value);
        clearTimeout(noteAnnounceTimer);
        if (announceNow) announce('Note saved');
        else noteAnnounceTimer = setTimeout(() => {
          if (document.contains(ta)) announce('Note saved');
        }, 500);
      };
      ta.addEventListener('input', () => saveNote(false));
      ta.addEventListener('change', () => saveNote(true));
    }
  }

  /* ---------- #/plan/:id detail links keep working ------------------ */
  Views.plan = function (route) { return route.parts[0] ? Views.activity(route) : Views.activities(route); };

  /* ---------- 18-days-at-a-glance strip (lives on Trip) ------------- */
  function timelineRows() {
    const days = []; let d = D.TRIP.window.start;
    while (d <= D.TRIP.window.end) { days.push(d); d = addDays(d, 1); }
    const today = activeDate();
    const firstInWindow = (e) => (e.start < D.TRIP.window.start ? D.TRIP.window.start : e.start);
    return days.map((dt) => {
      const stay = stayForDate(dt); const co = changeoverOn(dt);
      // show each event once, on its first day inside the trip window
      const evs = D.EVENTS.filter((e) => !e.seriesOverview && (e.occurrences ? e.occurrences.includes(dt) : firstInWindow(e) === dt));
      const isNow = dt === today;
      const flags = [];
      if (co) flags.push(`<span class="tl-flag change">Base change → ${esc(co.inn.village)}</span>`);
      if (dt === D.TRIP.window.start) flags.push(`<span class="tl-flag">Arrive · van pickup GVA</span>`);
      if (dt === D.TRIP.window.end) flags.push(`<span class="tl-flag">Depart · flights + van back</span>`);
      return `<div class="tl-row${isNow ? ' now' : ''}${co ? ' change' : ''}">
        <button class="tl-date" data-goto="${dt}" aria-label="Preview ${esc(prettyDay(dt))} on Today"><span class="tl-dow">${esc(prettyDay(dt).split(' ')[0])}</span><span class="tl-num">${dt.split('-')[2]}</span></button>
        <div class="tl-body">
          <div class="tl-base">${esc(stay.village)} · <span class="tl-stay">${esc(stay.name)}</span></div>
          ${flags.join(' ')}
          ${evs.map((e) => `<a class="tl-ev ${e.conflict ? 'clash' : ''}" href="#/event/${esc(e.id)}">${esc(e.name)}${e.conflict ? ' · clash' : ''}</a>`).join('')}
        </div>
      </div>`;
    }).join('');
  }

  /* ---------- EVENT DETAIL ------------------------------------------ */
  Views.event = function (route) {
    const e = D.EVENTS.find((x) => x.id === route.parts[0]); if (!e) return `<div class="empty">Unknown event.</div>`;
    const base = activeBase(); const dd = travelFromBase(e, base);
    const conf = e.confidence === 'confirmed' ? '<span class="lg confirmed">Confirmed</span>' : e.confidence === 'likely' ? '<span class="lg likely">Likely</span>' : '';
    const s = e.src ? D.SOURCES[e.src] : null;
    const eventMedia = coverOf(e);
    return `
      ${eventMedia && eventMedia.photo ? `<figure class="event-hero">${cover(eventMedia, { eager: true, alt: e.name })}</figure>` : ''}
      <div class="section-head" style="margin-top:.4rem"><h2>${esc(e.name)}</h2><p>${conf} ${esc(e.datesLabel)}</p></div>
      <dl class="spec">
        <dt>When</dt><dd>${esc(e.datesLabel)}</dd>
        <dt>Where</dt><dd>${esc(e.where)}</dd>
        ${dd ? `<dt>From here</dt><dd>${dd.approx ? '≈' : ''}${dd.min} min ${esc(dd.mode)} from ${esc(D.BASES[base].label)}</dd>` : ''}
        <dt>Tickets</dt><dd>${e.booking === 'no' ? 'Free / no ticket' : e.booking === 'yes' ? 'Ticketed — book' : e.booking === 'sold-out' ? 'Currently sold out' : 'Some free, some ticketed'}${e.price ? ' · ' + esc(e.price) : ''}</dd>
      </dl>
      <p class="detail-why">${esc(e.why)}</p>
      ${e.impact ? `<div class="note-box${e.conflict ? ' warn' : ''}">${esc(e.impact)}</div>` : ''}
      <div class="detail-actions">${saveBtn(e.id, 'big')}</div>
      ${s ? `<p class="source-line">${e.verifyBeforeGo ? '<span class="verify-badge">Verify before going</span> ' : ''}Source: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.type)} ↗</a> · checked ${esc(s.on || D.VERIFIED)}</p>` : ''}
    `;
  };

  /* ---------- IDEAS (per-person boards, this phone only) ------------ */
  Views.ideas = function () {
    const p = activePerson();
    const chips = PEOPLE.map((name) => { const n = Ideas.ids(name).length; return `<button type="button" class="person-tab" data-person="${esc(name)}" aria-pressed="${name === p}"><span>${esc(name)}</span><span class="mc-count">${n}</span></button>`; }).join('');
    const ids = Ideas.ids(p);
    let board;
    if (!ids.length) {
      board = `<div class="empty">Nothing on ${esc(p)}’s board yet. Browse <a href="#/activities">Activities</a> and bookmark anything that looks good.</div>`;
    } else {
      const items = ids.map((id) => {
        const a = D.ACT_BY_ID[id] || D.EVENTS.find((e) => e.id === id);
        return a ? { id, a, isEvent: !D.ACT_BY_ID[id] } : null;
      }).filter(Boolean);
      board = `<div class="ideas-grid">${items.map(({ id, a, isEvent }) => isEvent ? ideaEventCard(id, a) : ideaCard(a)).join('')}</div>`;
    }
    return `
      <header class="page-head ideas-head">
        <div><p class="page-kicker">Saved boards</p><h2>Our ideas</h2><p>Things each of us wants to remember.</p></div>
        <a class="text-link" href="#/activities">Browse all activities →</a>
      </header>
      <div class="person-row" role="group" aria-label="Whose board">${chips}</div>
      <p class="board-meta">${ids.length} saved for ${esc(p)}</p>
      ${board}
      <p class="local-note"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg> Saved on this device.</p>
    `;
  };
  function ideaCard(a) {
    const img = actCover(a); const area = D.AREA_BY_ID[a.areaId];
    const hasPhoto = !!(img && img.photo);
    const status = Ideas.status(a.id);
    return `<article class="idea-card${hasPhoto ? '' : ' no-photo'}" data-tint="${esc(catTint(a.cat))}">
      <a class="idea-hit" href="#/plan/${esc(a.id)}">
        ${hasPhoto ? `<img src="${esc(img.photo)}" alt="${esc(img.alt || '')}" loading="lazy" decoding="async"${mediaImageAttrs(img, catTint(a.cat), a.title)} />` : ''}
        <span class="idea-copy"><strong>${esc(a.title)}</strong>${area ? `<span>${esc(area.name)}</span>` : ''}${status ? `<span class="idea-status">${esc(STATUS_LABEL[status])}</span>` : ''}</span>
      </a>
      <div class="idea-save">${saveBtn(a.id)}</div>
      ${statusPicker(a.id)}
    </article>`;
  }
  function ideaEventCard(id, e) {
    const img = coverOf(e);
    return `<article class="idea-card idea-event${img && img.photo ? '' : ' no-photo'}"><a class="idea-hit" href="#/event/${esc(id)}">${img && img.photo ? `<img src="${esc(img.photo)}" alt="${esc(img.alt || '')}" loading="lazy" decoding="async"${mediaImageAttrs(img, 'purple', e.name)} />` : ''}<span class="idea-event-date">${esc(e.datesLabel || '')}</span><span class="idea-copy"><strong>${esc(e.name)}</strong><span>${esc(e.where || '')}</span></span></a><div class="idea-save">${saveBtn(id)}</div>${statusPicker(id)}</article>`;
  }
  function wireIdeas() {
    screenEl.querySelectorAll('[data-person]').forEach((b) => b.addEventListener('click', () => { const who = b.dataset.person; setPerson(who); render(); const again = screenEl.querySelector(`[data-person="${who}"]`); if (again) again.focus({ preventScroll: true }); announce('Showing ' + who + '’s ideas'); }));
    wireStatusButtons();
  }

  /* ---------- ICONIC COLS ------------------------------------------- */
  function sourceAnchor(id, label) {
    const s = D.SOURCES[id];
    return s ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>` : '';
  }
  function tourColLinks(c, includeIdea) {
    const links = [
      `<a href="https://www.google.com/maps/dir/?api=1&destination=${c.coords.join(',')}" target="_blank" rel="noopener">Directions ↗</a>`,
      includeIdea && c.ideaId && D.ACT_BY_ID[c.ideaId] ? `<a href="#/plan/${esc(c.ideaId)}">Related trip idea →</a>` : '',
      sourceAnchor(c.tourSrc, 'Tour history'),
      sourceAnchor(c.summitSrc, 'Summit guide')
    ].filter(Boolean);
    return `<div class="tour-col-links">${links.join('')}</div>`;
  }
  function tourColFacts(c) {
    return `
      <dl class="tour-col-facts">
        <div><dt>Why it matters</dt><dd>${esc(c.iconic)}</dd></div>
        <div><dt>Tour de France</dt><dd>${esc(c.tour)}</dd></div>
        <div><dt>At the top</dt><dd>${esc(c.summit)}</dd></div>
      </dl>`;
  }
  function tourColCard(c, index) {
    return `<article class="tour-col-row" id="tour-col-${esc(c.id)}">
      <div class="tour-col-name">
        <span class="tour-col-number">${String(index + 1).padStart(2, '0')}</span>
        <div><p>${esc(c.region)} · ${c.elevation} m</p><h4>${esc(c.name)}</h4></div>
      </div>
      <div class="tour-col-copy">${tourColFacts(c)}${tourColLinks(c, true)}</div>
    </article>`;
  }
  function tourColPanel(c) {
    if (!c) return '';
    return `
      <div class="alpine-detail-head">
        <p>${esc(c.region)} · ${c.elevation} m</p>
        <h3>${esc(c.name)}</h3>
      </div>
      ${tourColFacts(c)}
      ${tourColLinks(c, true)}`;
  }

  /* ---------- BIKE (cycling hub) ------------------------------------ */
  Views.bike = function () {
    const byCat = (cats) => D.ACTIVITIES.filter((a) => a.status !== 'closed' && cats.includes(a.cat));
    const groups = [
      ['Road climbs & loops', byCat(['road'])],
      ['Gravel', byCat(['gravel'])],
      ['Easy & greenway', byCat(['easybike'])],
      ['MTB & bike parks', byCat(['mtb'])]
    ];
    const races = D.EVENTS.filter((e) => e.kind === 'race');
    const cols = D.TOUR_COLS || [];
    return `
      <header class="page-head bike-head">
        <p class="page-kicker">Cycling</p>
        <h2>Rides, cols and bike parks</h2>
        <p>Everything useful for the riders, plus six famous summits the rest of us might actually want to visit.</p>
      </header>

      <section class="tour-country" aria-labelledby="tour-country-title">
        <div class="tour-country-head">
          <div><p class="page-kicker">Tour country</p><h3 id="tour-country-title">The cols worth recognizing</h3><p>No climb spreadsheet: just why each one is famous, its Tour story, and what is waiting at the top.</p></div>
          <div class="tour-country-actions"><a href="#/map?view=alpine&amp;spot=forclaz">Open Alpine map →</a><a href="https://livlisko.github.io/french-cols-tracker/" target="_blank" rel="noopener">All 113 cols ↗</a></div>
        </div>
        <div class="tour-col-list">${cols.map(tourColCard).join('')}</div>
      </section>

      <div class="section-head bike-rides-head"><h2>Actual rides</h2><p>Both legs, no day filters. Strong-rider and casual options stay clearly labelled.</p></div>
      ${groups.filter((g) => g[1].length).map((g) => `<div class="group-label">${esc(g[0])}</div><div class="cards">${g[1].map((a) => activityCard(a)).join('')}</div>`).join('')}
      <div class="group-label">Race spectating</div>
      ${races.map(eventRow).join('')}
      <div class="group-label">Logistics</div>
      <div class="info-card"><h3>Rental &amp; repair</h3><p>Le Deck / Cayoti at Plage de la Brune (Veyrier); road bikes in Annecy (Takamaka ~€59/day carbon); DH rigs at Les Gets (360 Outdoor, LoisiBike, Intersport). Book ahead in August.</p></div>
      <div class="info-card"><h3>Bikes on transport</h3><p>Navibus carries bikes (reportedly +€1 — verify); the Semnoz mountain bus takes MTBs (+€6). No bikes on the Lachat lift at Grand-Bornand.</p></div>
      <div class="info-card"><h3>Pump tracks &amp; skills</h3><p>Free at Duingt (year-round, on the greenway) and Argonay; bigger jumplines at Faverges-Seythenex. <a href="#/plan/pumptrack-duingt">Duingt details →</a></p></div>
      <p class="source-line">Route stats tie to a named start point and are checked against official sources — see any climb’s detail page.</p>`;
  };

  /* ---------- credits ----------------------------------------------- */
  function creditsBlock() { return `<details class="credits"><summary>Photo sources &amp; credits</summary><p>Official activity previews link back to their provider or tourism page on each activity. Local images: ${D.CREDITS.map((c) => `<a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.subject)}</a> — ${esc(c.author)}, ${esc(c.license)}`).join(' · ')}</p></details>`; }

  /* ---------- AREAS ------------------------------------------------- */
  Views.areas = function (route) {
    if (route.parts[0]) return Views.areaDetail(route.parts[0]);
    const cards = D.AREAS.map((a) => `<a class="area-card" href="#/areas/${esc(a.id)}"><div class="ac-img-wrap">${cover(coverOf(a), { label: a.name, alt: a.name, cls: 'ac-cover' })}</div><div class="ac-body"><div class="ac-zone">${esc(a.zone)}</div><h3>${esc(a.name)}</h3><p class="ac-why">${esc(a.why)}</p></div></a>`).join('');
    return `<div class="section-head" style="margin-top:.4rem"><h2>Around the lake &amp; beyond</h2></div><div class="cards" style="grid-template-columns:1fr">${cards}</div>`;
  };
  Views.areaDetail = function (id) {
    const a = D.AREA_BY_ID[id]; if (!a) return `<div class="empty">Unknown area.</div>`;
    const here = D.ACTIVITIES.filter((x) => x.areaId === id);
    return `<div class="detail-hero">${cover(coverOf(a), { label: a.name, alt: a.name, cls: 'cover-fill', eager: true })}<div class="dh-inner"><div class="dh-zone">${esc(a.zone)}</div><h2 class="dh-h1">${esc(a.name)}</h2></div></div>
      <p class="detail-lede">${esc(a.why)}</p>
      <div class="actions"><a class="btn" href="#/map?place=area-${esc(a.id)}">On map</a><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=${a.coords.join(',')}" target="_blank" rel="noopener">Directions ↗</a>${a.official ? `<a class="btn ghost" href="${esc(a.official)}" target="_blank" rel="noopener">Official ↗</a>` : ''}</div>
      ${here.length ? `<div class="section-head"><h2>Things to do here</h2></div><div class="cards">${here.map((x) => activityCard(x)).join('')}</div>` : ''}`;
  };

  /* ---------- TRIP (logistics + the 18 days at a glance) ------------ */
  Views.trip = function () {
    const T = D.TRANSPORT;
    const stays = D.STAYS.map((s) => `<article class="stay-row">
      <img src="${esc(s.photo)}" alt="" loading="lazy" decoding="async" />
      <div class="stay-main">
        <p class="row-kicker">${esc(s.legLabel)} · ${esc(s.dates)}</p>
        <h3>${esc(s.name)}</h3>
        <p class="stay-addr">${esc(s.address)}</p>
        <dl class="stay-times"><div><dt>Check-in</dt><dd>${esc(s.checkin)}</dd></div><div><dt>Check-out</dt><dd>${esc(s.checkout)}</dd></div></dl>
      </div>
      <div class="stay-actions"><a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address)}" target="_blank" rel="noopener">Directions ↗</a><a href="#/map?place=${esc(s.id)}">Open map</a></div>
    </article>`).join('');
    const flights = T.flights.map((f) => `<article class="flight-row">
      <div class="flight-direction">${f.dir === 'out' ? 'Outbound' : 'Return'}</div>
      <div class="flight-main"><strong>${esc(f.legs)}</strong><span>${esc(f.who)} · ${esc(f.date)}</span></div>
      <div class="flight-number"><span>${esc(f.flight)}</span><small>Ref ${esc(f.conf)}</small></div>
      ${f.note ? `<p class="fc-note">${esc(f.note)}</p>` : ''}
    </article>`).join('') + (T.flightsNote ? `<article class="flight-row placeholder"><div class="flight-direction">Travel TBC</div><div class="flight-main"><strong>Chip &amp; Ian</strong><span>${esc(T.flightsNote)}</span></div></article>` : '');
    const modes = D.TRANSPORT_GUIDE.modes.map((m) => `<div class="info-card"><h3>${esc(m.label)}</h3><p>${esc(m.summary)}${m.verifyBeforeGo ? ' <span class="pc-tag verify">Verify</span>' : ''}</p></div>`).join('');
    const jump = [['trip-stays', 'Stays'], ['trip-travel', 'Flights'], ['trip-van', 'Van'], ['trip-around', 'Essentials']]
      .map(([id, label]) => `<button type="button" class="chip" data-jump="${id}">${label}</button>`).join('');
    return `
      <header class="page-head">
        <p class="page-kicker">Reference</p>
        <h2>Trip details</h2>
        <p>${esc(D.TRIP.datesLabel)} · Les Gets, then Lake Annecy</p>
      </header>
      <div class="chips-row jump-row" role="group" aria-label="Trip sections">${jump}</div>

      <section class="trip-section" id="trip-stays"><div class="section-head"><h2>Where we’re staying</h2></div><div class="stay-list">${stays}</div></section>

      <section class="trip-section" id="trip-travel">
        <div class="section-head"><h2>Flights</h2><p>${esc(T.privacyNote)}</p></div>
        <div class="flights">${flights}</div>
        <div class="note-box warn"><strong>Departure day.</strong> ${esc(T.departure)}</div>
      </section>

      <section class="trip-section" id="trip-van">
        <div class="section-head"><h2>Van</h2></div>
        <article class="van-card">
          <div><p class="row-kicker">${esc(T.car.conf)}</p><h3>${esc(T.car.name)}</h3></div>
          <dl class="spec"><dt>Pick up</dt><dd>${esc(T.car.pickup)}</dd><dt>Return</dt><dd>${esc(T.car.ret)}</dd><dt>Drivers</dt><dd>${esc(T.car.drivers)}</dd><dt>Included</dt><dd>${esc(T.car.includes)}</dd></dl>
          <p class="fc-note">${esc(T.car.find)}</p>
        </article>
      </section>

      <section class="trip-section" id="trip-around">
        <div class="section-head"><h2>Getting around</h2><p>${esc(D.TRANSPORT_GUIDE.intro)}</p></div>
        <div class="info-grid">${modes}<div class="info-card"><h3>Parking &amp; traffic</h3><p>${esc(D.TRANSPORT_GUIDE.parking)}</p></div></div>
      </section>

      <details class="trip-calendar">
        <summary>Fixed dates and base changes</summary>
        <p>Only the dates that are actually fixed. Everything else stays open.</p>
        <div class="timeline">${timelineRows()}</div>
      </details>
      <p class="source-line">Transport: <a href="${esc(D.SOURCES['mobilite'].url)}" target="_blank" rel="noopener">Grand Annecy Mobilités ↗</a> · checked ${esc(D.VERIFIED)}. Timetables change — verify exact times before travel.</p>`;
  };
  function wireTrip() {
    screenEl.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => { const el = document.getElementById(b.dataset.jump); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    screenEl.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => { setDate(b.dataset.goto); location.hash = '#/today'; }));
  }

  /* ---------- MAP (rebuilt) ----------------------------------------- */
  const MAP_COLORS = { water: '#0B6FB8', cycling: '#2C6A4F', mountains: '#596F62', food: '#8A613A', adrenaline: '#8C4E6D', easy: '#6D7F8A' };
  const MAP_CATS = [
    { id: 'stay', label: 'Stays', color: '#B4533C' },
    ...GUIDE_CATS.map((c) => ({ id: c.id, label: c.label, color: MAP_COLORS[c.id] })),
    { id: 'event', label: 'Events', color: '#173F5F' },
    { id: 'place', label: 'Places', color: '#60717C' }
  ];
  function mapCatOf(a) {
    if (['road', 'gravel', 'mtb', 'easybike'].includes(a.cat)) return 'cycling';
    if (['swim', 'paddle', 'boat', 'whitewater'].includes(a.cat)) return 'water';
    if (['hike', 'walk'].includes(a.cat)) return 'mountains';
    if (['sport', 'caving', 'viaferrata', 'canyoning', 'paragliding'].includes(a.cat)) return 'adrenaline';
    if (['food', 'culture', 'village'].includes(a.cat)) return 'food';
    if (['family', 'recovery'].includes(a.cat)) return 'easy';
    return 'place';
  }
  function mapPoiCat(p) {
    return ({ cycling: 'cycling', water: 'water', hike: 'mountains', adrenaline: 'adrenaline', food: 'food', culture: 'food' })[p.cat] || 'place';
  }
  // Activities and POIs can share a spot (a village square, a lift base) —
  // fan overlapping pins out in a tiny circle so all stay visible/tappable.
  function deoverlap(places) {
    const seen = {};
    places.forEach((p) => {
      const k = p.coords[0].toFixed(4) + ',' + p.coords[1].toFixed(4);
      const n = seen[k] || 0;
      if (n > 0) {
        const ang = n * 2.4; // golden-angle spiral
        const r = 0.0011 + 0.0003 * n;
        p.coords = [p.coords[0] + r * Math.cos(ang), p.coords[1] + r * Math.sin(ang) * 1.4];
      }
      seen[k] = n + 1;
    });
    return places;
  }
  function mapPlaces() {
    const out = [];
    D.STAYS.forEach((s) => out.push({ id: s.id, cat: 'stay', name: s.name, coords: s.coords.slice(), blurb: `${s.village} · ${s.dates}`, sub: s.address, route: '#/trip', dir: s.coords }));
    D.ACTIVITIES.forEach((a) => { if (a.coords) out.push({ id: 'act-' + a.id, cat: mapCatOf(a), name: a.title, coords: a.coords.slice(), blurb: a.summary, route: '#/plan/' + a.id, dir: a.coords, verify: !!a.verifyBeforeGo }); });
    (D.MAP_POIS || []).forEach((p) => out.push({ id: 'poi-' + p.id, cat: mapPoiCat(p), name: p.name, coords: p.coords.slice(), blurb: p.blurb, sub: p.note, route: p.route || null, href: p.href || null, dir: p.coords, verify: !!p.verify, closed: !!p.closed }));
    D.EVENTS.forEach((e) => { if (e.coords && e.map !== false) out.push({ id: 'ev-' + e.id, cat: 'event', name: e.name, coords: e.coords.slice(), blurb: e.datesLabel, route: '#/event/' + e.id, dir: e.coords }); });
    D.AREAS.forEach((a) => out.push({ id: 'area-' + a.id, cat: 'place', name: a.name, coords: a.coords.slice(), blurb: a.zone, route: '#/areas/' + a.id, dir: a.coords }));
    return deoverlap(out);
  }
  let mapInstance = null, mapMarkers = {}, mapState = null, mapGeneration = 0, markerCluster = null;
  let alpineMapInstance = null, alpineMapMarkers = {}, alpineReadyTimer = null;

  const ALPINE_SPOTS = [
    {
      id: 'annecy', label: 'Annecy', x: 47, y: 76, kind: 'place',
      eyebrow: 'At the head of the lake', title: 'Annecy',
      text: 'The old town and north shore sit at the near end of the basin. Veyrier is just around the east-shore corner.',
      coords: [45.8992, 6.1294], route: '#/areas/annecy'
    },
    {
      id: 'lake', label: 'Lake Annecy', x: 66, y: 54, kind: 'water', elevation: 447,
      eyebrow: 'The heart of the trip', title: 'Lake Annecy',
      text: 'The turquoise basin between the Semnoz and La Tournette, with our east-shore base tucked just above the water.',
      coords: [45.8504, 6.1696], route: '#/activities?cat=water'
    },
    { id: 'semnoz', label: 'Semnoz', x: 35, y: 55, kind: 'col', colId: 'semnoz' },
    { id: 'forclaz', label: 'Forclaz', x: 89.5, y: 49, kind: 'col', colId: 'forclaz', edge: true },
    { id: 'aravis', label: 'Col des Aravis', x: 59, y: 23, kind: 'col', colId: 'aravis' },
    { id: 'colombiere', label: 'Colombière', x: 18, y: 22, kind: 'col', colId: 'colombiere' },
    {
      id: 'glieres', label: 'Glières', x: 21, y: 33, kind: 'place', elevation: 1440,
      eyebrow: 'Bornes plateau', title: 'Plateau des Glières',
      text: 'The high Resistance plateau between Annecy and the Aravis: monument, open walking country and the Tour’s famous gravel crossing.',
      coords: [45.9630, 6.3260], route: '#/plan/glieres-walk'
    },
    {
      id: 'mont-blanc', label: 'Mont Blanc', x: 61, y: 7, kind: 'peak', elevation: 4807,
      eyebrow: 'Beyond the Aravis', title: 'Mont Blanc & Chamonix',
      text: 'The white massif on the horizon is real orientation, not scenery: Chamonix sits in the valley directly beneath it.',
      coords: [45.9237, 6.8694], mapCoords: [45.8326, 6.8652], route: '#/plan/chamonix-day'
    }
  ];
  function alpineMapPoints() {
    const cols = D.TOUR_COLS || [];
    const seen = new Set();
    const points = ALPINE_SPOTS.map((spot) => {
      const col = spot.colId ? cols.find((c) => c.id === spot.colId) : null;
      const trackedCol = spot.colId ? (D.CENT_COLS || []).find((c) => c.tourId === spot.colId) : null;
      const id = spot.colId || spot.id;
      seen.add(id);
      return {
        id,
        label: spot.label,
        kind: spot.kind,
        coords: spot.mapCoords || spot.coords || (col && col.coords),
        elevation: spot.elevation || (col && col.elevation),
        featured: true,
        tourFeatured: !!(trackedCol && trackedCol.tourFeatured),
        tourPassages: trackedCol ? trackedCol.tourPassages : 0
      };
    }).filter((point) => point.coords);
    cols.forEach((col) => {
      if (seen.has(col.id)) return;
      points.push({
        id: col.id,
        label: col.name.replace('Col de la ', '').replace('Col des ', ''),
        kind: 'col',
        coords: col.coords,
        elevation: col.elevation,
        featured: false,
        tourFeatured: !!((D.CENT_COLS || []).find((tracked) => tracked.tourId === col.id) || {}).tourFeatured
      });
    });
    return points;
  }
  function centColById(id) {
    return (D.CENT_COLS || []).find((col) => col.id === id) || null;
  }
  function alpinePointById(id) {
    const point = alpineMapPoints().find((item) => item.id === id);
    if (point) return point;
    const col = centColById(id);
    return col ? { id: col.id, label: col.name, kind: 'col', coords: col.coords, elevation: col.elevation, tourFeatured: col.tourFeatured, tourPassages: col.tourPassages } : null;
  }
  function alpineColMode(route) {
    return route.query.cols === 'all' ? 'all' : 'highlights';
  }
  function centColsGeoJSON() {
    return {
      type: 'FeatureCollection',
      features: (D.CENT_COLS || []).map((col) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [col.coords[1], col.coords[0]] },
        properties: {
          id: col.id,
          name: col.name,
          region: col.region,
          elevation: col.elevation,
          tourId: col.tourId || '',
          tourFeatured: col.tourFeatured ? 1 : 0,
          tourPassages: col.tourPassages || 0
        }
      }))
    };
  }
  function alpineSelected(route) {
    if (alpineColMode(route) === 'all') {
      const valid = new Set((D.CENT_COLS || []).map((col) => col.id));
      return valid.has(route.query.spot) ? route.query.spot : null;
    }
    const valid = new Set(alpineMapPoints().map((point) => point.id));
    return valid.has(route.query.spot) ? route.query.spot : 'forclaz';
  }
  function alpineHref(id, mode) {
    let href = '#/map?view=alpine';
    if ((mode || (mapState && mapState.colMode)) === 'all') href += '&cols=all';
    if (id) href += '&spot=' + encodeURIComponent(id);
    return href;
  }
  function mapViewTabs(view) {
    return `<nav class="map-view-tabs" role="tablist" aria-label="Map view">
      <a role="tab" aria-selected="${view === 'places'}" class="map-view-tab" href="#/map">Places</a>
      <a role="tab" aria-selected="${view === 'alpine'}" class="map-view-tab" href="#/map?view=alpine">Alpine relief</a>
    </nav>`;
  }
  function alpinePlacePanel(spot) {
    const links = [
      spot.route ? `<a href="${esc(spot.route)}">Open guide →</a>` : '',
      spot.coords ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${spot.coords.join(',')}" target="_blank" rel="noopener">Directions ↗</a>` : ''
    ].filter(Boolean);
    return `
      <div class="alpine-detail-head"><p>${esc(spot.eyebrow)}</p><h3>${esc(spot.title)}</h3></div>
      <p class="alpine-place-copy">${esc(spot.text)}</p>
      <div class="tour-col-links">${links.join('')}</div>`;
  }
  function alpineDetail(id) {
    const col = (D.TOUR_COLS || []).find((c) => c.id === id);
    if (col) return tourColPanel(col);
    const tracked = centColById(id);
    if (tracked && tracked.tourId) {
      const rich = (D.TOUR_COLS || []).find((c) => c.id === tracked.tourId);
      if (rich) return tourColPanel(rich);
    }
    const spot = ALPINE_SPOTS.find((s) => s.id === id);
    return spot ? alpinePlacePanel(spot) : alpinePlacePanel(ALPINE_SPOTS[0]);
  }
  function alpineInspectorDetail(id) {
    const tracked = centColById(id);
    const directCol = (D.TOUR_COLS || []).find((c) => c.id === id);
    const col = directCol || (tracked && tracked.tourId
      ? (D.TOUR_COLS || []).find((c) => c.id === tracked.tourId)
      : null);
    const spot = ALPINE_SPOTS.find((s) => s.id === id);
    const point = alpinePointById(id);
    const trackerSource = D.SOURCES['french-cols-tracker'];
    const challengeSource = D.SOURCES['cent-cols-route'];
    const chevron = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';
    if (!id) {
      const regionCount = new Set((D.CENT_COLS || []).map((item) => item.region)).size;
      return `
        <div class="alpine-inspector-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m3 19 6-10 3 5 2-3 7 8z"/><path d="m8 11 2 1 2-3"/></svg>
        </div>
        <div class="alpine-detail-head"><p>Savoie &amp; Haute-Savoie</p><h3>All ${D.CENT_COLS.length} tracked cols</h3></div>
        <p class="alpine-inspector-summary">The full field from our French Cols Tracker, spread across ${regionCount} Alpine regions. Zoom into a cluster, search by name, or choose a col from the list.</p>
        <div class="alpine-primary-actions">
          ${trackerSource ? `<a class="is-primary" href="${esc(trackerSource.url)}" target="_blank" rel="noopener">Full tracker${chevron}</a>` : ''}
          ${challengeSource ? `<a href="${esc(challengeSource.url)}" target="_blank" rel="noopener">Cent Cols route${chevron}</a>` : ''}
        </div>
        <p class="alpine-data-source">The map uses the tracker’s verified coordinates and elevations. The official challenge page describes 103 main and 18 optional passes; this layer is the tracker’s curated 113-col set.</p>`;
    }
    const coords = tracked ? tracked.coords : col ? col.coords : spot ? spot.coords : point ? point.coords : null;
    const title = tracked ? tracked.name : col ? col.name : spot ? spot.title : point ? point.label : 'The Alps';
    const elevation = tracked ? tracked.elevation : col ? col.elevation : point ? point.elevation : null;
    const eyebrow = tracked ? tracked.region : col ? col.region : spot ? spot.eyebrow : 'Haute-Savoie';
    const summary = col ? col.iconic : tracked
      ? `A ${tracked.elevation.toLocaleString('en-US')} m pass in ${tracked.region}, mapped as part of the 113-col Savoie collection.`
      : spot ? spot.text : '';
    const guideHref = col && col.ideaId && D.ACT_BY_ID[col.ideaId]
      ? `#/plan/${esc(col.ideaId)}`
      : spot && spot.route ? spot.route
        : col && D.SOURCES[col.summitSrc] ? D.SOURCES[col.summitSrc].url
          : tracked && trackerSource ? trackerSource.url : '';
    const guideExternal = guideHref && guideHref[0] !== '#';
    const directions = coords ? `https://www.google.com/maps/dir/?api=1&destination=${coords.join(',')}` : '';
    const guideLabel = tracked && !col ? 'Full tracker' : 'Details';
    return `
      <div class="alpine-inspector-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m3 19 6-10 3 5 2-3 7 8z"/><path d="m8 11 2 1 2-3"/></svg>
      </div>
      <div class="alpine-detail-head"><p>${esc(eyebrow)}${elevation ? ` · ${elevation.toLocaleString('en-US')} m` : ''}</p><h3>${esc(title)}</h3></div>
      ${tracked && tracked.tourFeatured ? `<p class="tour-map-badge"><span aria-hidden="true"></span>Tour de France · ${tracked.tourPassages} ${tracked.tourPassages === 1 ? 'passage' : 'passages'}</p>` : ''}
      <p class="alpine-inspector-summary">${esc(summary)}</p>
      <div class="alpine-primary-actions">
        ${guideHref ? `<a href="${esc(guideHref)}"${guideExternal ? ' target="_blank" rel="noopener"' : ''}>${guideLabel}${chevron}</a>` : ''}
        ${directions ? `<a class="is-primary" href="${directions}" target="_blank" rel="noopener">Directions${chevron}</a>` : ''}
      </div>
      ${col ? `<div class="alpine-inspector-more">${tourColFacts(col)}${tourColLinks(col, true)}</div>` : tracked ? `<p class="alpine-data-source">Coordinates and elevation from our verified French Cols Tracker.</p>` : ''}`;
  }
  function alpineView(route) {
    const mode = alpineColMode(route);
    const selected = alpineSelected(route);
    const pins = ALPINE_SPOTS.map((s) => `
      <button type="button" class="alpine-pin is-${esc(s.kind)}${s.edge ? ' edge' : ''}" style="--x:${s.x}%;--y:${s.y}%" data-alpine="${esc(s.colId || s.id)}" aria-pressed="${selected === (s.colId || s.id)}" aria-label="Open ${esc(s.label)}">
        <span class="alpine-pin-dot" aria-hidden="true"></span><span class="alpine-pin-label">${esc(s.label)}</span>
      </button>`).join('');
    const highlightIndex = (D.TOUR_COLS || []).map((c) => {
      const inView = ALPINE_SPOTS.some((s) => s.colId === c.id);
      return `<button type="button" class="alpine-col-button" data-alpine="${esc(c.id)}" aria-pressed="${selected === c.id}">
        <span><strong>${esc(c.name)}</strong><small>${esc(c.region)} · ${c.elevation} m</small></span>
        ${inView ? '' : '<small class="beyond-view">Les Gets side</small>'}
      </button>`;
    }).join('');
    const trackedIndex = (D.CENT_COLS || []).map((col) => `
      <button type="button" class="alpine-col-button alpine-tracked-row" data-alpine="${esc(col.id)}" data-col-filter="${esc(`${col.name} ${col.region} ${col.elevation}`.toLowerCase())}" aria-pressed="${selected === col.id}">
        <span><strong>${esc(col.name)}</strong><small>${esc(col.region)} · ${col.elevation.toLocaleString('en-US')} m</small></span>
        ${col.tourFeatured ? `<small class="tour-list-badge">Tour ×${col.tourPassages}</small>` : ''}
      </button>`).join('');
    const index = mode === 'all' ? `
      <div class="alpine-index-head"><h3>All ${D.CENT_COLS.length} tracked cols</h3><a href="${esc(D.SOURCES['french-cols-tracker'].url)}" target="_blank" rel="noopener">Full tracker ↗</a></div>
      <label class="alpine-col-search">
        <span class="sr-only">Search tracked cols</span>
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
        <input id="alpine-col-search" type="search" autocomplete="off" placeholder="Find a col or region" />
      </label>
      <p class="alpine-result-count" id="alpine-result-count">${D.CENT_COLS.length} cols across ${new Set(D.CENT_COLS.map((col) => col.region)).size} regions</p>
      <div class="alpine-col-buttons" id="alpine-col-buttons">${trackedIndex}</div>
      <p class="alpine-index-source">Challenge context: <a href="${esc(D.SOURCES['cent-cols-route'].url)}" target="_blank" rel="noopener">Club des Cent Cols ↗</a></p>` : `
      <div class="alpine-index-head"><h3>Tour cols worth knowing</h3><a href="${alpineHref(null, 'all')}">Map all ${D.CENT_COLS.length} →</a></div>
      <div class="alpine-col-buttons">${highlightIndex}</div>`;
    return `
      <div class="alpine-layout" id="alpine-layout">
        <section class="alpine-map-wrap" aria-label="Interactive Alpine relief map">
          <div class="alpine-relief-stage" id="alpine-relief-stage">
            <div id="alpine-relief-map" role="application" aria-label="Interactive 3D relief map ${mode === 'all' ? `of ${D.CENT_COLS.length} Savoie and Haute-Savoie cols` : 'from Lake Annecy to Mont Blanc'}"></div>
            <div class="alpine-map-loading" id="alpine-map-loading" role="status"><span aria-hidden="true"></span>Loading relief</div>
            <nav class="alpine-mode-tabs" aria-label="Alpine map layer">
              <a href="${alpineHref(null, 'highlights')}" aria-current="${mode === 'highlights' ? 'page' : 'false'}">Highlights</a>
              <a href="${alpineHref(null, 'all')}" aria-current="${mode === 'all' ? 'page' : 'false'}">All ${D.CENT_COLS.length} cols</a>
            </nav>
            ${mode === 'all' ? '<div class="alpine-map-legend" aria-label="Map legend"><span><i class="is-tour" aria-hidden="true"></i>Tour de France</span><span><i aria-hidden="true"></i>Other tracked col</span></div>' : ''}
            <button class="alpine-reset-view" id="alpine-reset-view" type="button" aria-label="Reset Alpine map view" title="Reset view">
              <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            </button>
            <button class="alpine-guide-open" id="alpine-guide-open" type="button" hidden>Open selected guide</button>
            <div class="alpine-fallback" id="alpine-fallback" hidden>
              <figure class="alpine-fallback-figure">
                <div class="alpine-map-canvas">
                  <img src="assets/orientation/orientation_relief.jpg" alt="Oblique relief map from Annecy across the Aravis to Mont Blanc" width="900" height="900" />
                  ${pins}
                </div>
                <figcaption>${mode === 'all' ? `The searchable list still contains all ${D.CENT_COLS.length} cols; the live relief map needs a connection.` : 'Lake Annecy in the foreground, the Aravis across the middle, Mont Blanc on the horizon.'}</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <aside class="alpine-side" id="alpine-side" aria-label="Alpine map guide">
          <button class="alpine-side-close" id="alpine-side-close" type="button" aria-label="Hide Alpine guide" title="Hide guide">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
          <div class="alpine-detail" id="alpine-detail" aria-live="polite">${alpineInspectorDetail(selected)}</div>
          <div class="alpine-index">
            ${index}
          </div>
        </aside>
      </div>`;
  }

  Views.map = function (route) {
    const view = route.query.view === 'alpine' ? 'alpine' : 'places';
    const mapCopy = view === 'alpine'
      ? (alpineColMode(route) === 'all' ? `Interactive relief for all ${D.CENT_COLS.length} cols in our Savoie tracker.` : 'Interactive topography from Lake Annecy to Mont Blanc.')
      : 'Activities, stays, and useful places around the lake and mountains.';
    const intro = `
      <div class="map-intro">
        <div><h2>Map</h2><p>${mapCopy}</p></div>
        ${mapViewTabs(view)}
      </div>`;
    if (view === 'alpine') {
      mapState = { view: 'alpine', colMode: alpineColMode(route), focus: alpineSelected(route) };
      return intro + alpineView(route);
    }
    const places = mapPlaces();
    const active = new Set();
    if (route.query.cat && MAP_CATS.some((c) => c.id === route.query.cat)) active.add(route.query.cat);
    const focus = route.query.place || null;
    const focusedPlace = focus ? places.find((p) => p.id === focus) : null;
    if (focusedPlace) active.add(focusedPlace.cat);
    mapState = { view: 'places', active, focus };
    const counts = {}; MAP_CATS.forEach((c) => counts[c.id] = places.filter((p) => p.cat === c.id).length);
    const chips = `<button class="map-chip" data-cat="all" aria-pressed="${active.size === MAP_CATS.length}"><span class="cdot"></span>All</button>` +
      MAP_CATS.map((c) => `<button class="map-chip" data-cat="${c.id}" aria-pressed="${active.has(c.id)}" style="--cat:${c.color}"><span class="cdot" aria-hidden="true"></span>${esc(c.label)} <span class="mc-count">${counts[c.id]}</span></button>`).join('');
    return `
      ${intro}
      <div class="map-toolbar">
        <div class="map-filters" id="map-filters" role="group" aria-label="Filter map">${chips}</div>
        <div class="map-tools"><button class="mini-btn" id="map-reset" type="button">Reset</button><button class="mini-btn" id="map-base" type="button">Near ${esc(activeStay().village)}</button></div>
      </div>
      <div class="map-split">
        <div id="map" role="application" aria-label="Interactive map"></div>
        <div class="map-list" id="map-list" aria-label="Places list"></div>
      </div>`;
  };

  /* --------------------- archive: the cut list ---------------------- */
  Views.archive = function () {
    const groups = {};
    (D.ARCHIVE || []).forEach((a) => { (groups[a.group] = groups[a.group] || []).push(a); });
    const section = (title, items) => items && items.length ? `
      <h3 class="arch-h">${esc(title)}</h3>
      ${items.map((a) => `
        <div class="arch-item">
                    <div class="arch-body">
            <strong>${esc(a.name)}</strong>
            <p>${esc(a.reason)}</p>
            ${a.href ? `<a class="pop-link" href="${esc(a.href)}" target="_blank" rel="noopener">Source ↗</a>` : ''}
          </div>
        </div>`).join('')}` : '';
    return `
      <section class="wrap">
        <h2>The cut list</h2>
        <p class="lede">Everything from our research and the guide PDFs that is deliberately <em>not</em> a plan — so nobody spots it on Instagram in August and wonders why it isn’t on the map. Closed-but-worth-knowing spots like La Tournette <em>are</em> on the <a href="#/map">map</a>, greyed out with a ⛔ — and the Thônes via ferrata turned out to be open after all, so it’s on the map in full colour.</p>
        ${section('Closed in 2026 — re-check when we’re in France', groups.closed)}
        ${section('Not happening — hard no', groups.no)}
        ${section('Cut by request', groups.cut)}
        ${section('Wrong season', groups.season)}
        <p class="arch-foot">If any of these matter to you, say the word and it gets researched properly.</p>
      </section>`;
  };

  function ensureLeaflet() {
    if (window.L) return Promise.resolve(true);
    if (ensureLeaflet._p) return ensureLeaflet._p;
    ensureLeaflet._p = new Promise((resolve) => {
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='; css.crossOrigin = ''; document.head.appendChild(css);
      const js = document.createElement('script'); js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; js.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='; js.crossOrigin = '';
      const to = setTimeout(() => resolve(false), 8000);
      js.onload = () => { clearTimeout(to); resolve(true); };
      js.onerror = () => { clearTimeout(to); resolve(false); };
      document.head.appendChild(js);
    });
    return ensureLeaflet._p;
  }
  function ensureMapLibre() {
    if (window.maplibregl) return Promise.resolve(true);
    if (ensureMapLibre._p) return ensureMapLibre._p;
    ensureMapLibre._p = new Promise((resolve) => {
      let css = document.getElementById('maplibre-css');
      if (!css) {
        css = document.createElement('link');
        css.id = 'maplibre-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css';
        document.head.appendChild(css);
      }
      const js = document.createElement('script');
      js.src = 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js';
      const to = setTimeout(() => resolve(false), 12000);
      js.onload = () => { clearTimeout(to); resolve(!!window.maplibregl); };
      js.onerror = () => { clearTimeout(to); resolve(false); };
      document.head.appendChild(js);
    });
    return ensureMapLibre._p;
  }
  function ensureMarkerCluster() {
    if (window.L && window.L.markerClusterGroup) return Promise.resolve(true);
    if (ensureMarkerCluster._p) return ensureMarkerCluster._p;
    ensureMarkerCluster._p = new Promise((resolve) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
      const to = setTimeout(() => resolve(false), 8000);
      js.onload = () => { clearTimeout(to); resolve(!!(window.L && window.L.markerClusterGroup)); };
      js.onerror = () => { clearTimeout(to); resolve(false); };
      document.head.appendChild(js);
    });
    return ensureMarkerCluster._p;
  }
  function renderMapList(places) {
    const el = document.getElementById('map-list'); if (!el) return;
    const shown = places.filter((p) => mapState.active.has(p.cat));
    if (!shown.length) {
      el.innerHTML = `<div class="empty">${mapState.active.size ? 'No places in the selected categories.' : 'Choose a category above to see places.'}</div>`;
      return;
    }
    const cat = Object.fromEntries(MAP_CATS.map((c) => [c.id, c]));
    el.innerHTML = shown.map((p) => `<button class="ml-item${p.closed ? ' is-closed' : ''}" data-mid="${esc(p.id)}"><span class="ml-mark" style="--cat:${cat[p.cat].color}" aria-hidden="true"></span><span class="ml-body"><strong>${esc(p.name)}${p.closed ? ' <span class="closed-chip">Closed</span>' : ''}</strong><span>${esc(p.blurb)}</span></span></button>`).join('') +
      `<a class="ml-archive" href="#/archive">Not on this map — the cut list &amp; why →</a>`;
    el.querySelectorAll('[data-mid]').forEach((b) => b.addEventListener('click', () => focusMarker(b.dataset.mid)));
  }
  function focusMarker(id) {
    const mk = mapMarkers[id]; if (!mk || !mapInstance) { const p = mapPlaces().find((x) => x.id === id); if (p && p.route) location.hash = p.route; else if (p && p.href) window.open(p.href, '_blank', 'noopener'); return; }
    if (markerCluster && markerCluster.hasLayer(mk.marker)) {
      markerCluster.zoomToShowLayer(mk.marker, () => mk.marker.openPopup());
      return;
    }
    mapInstance.setView(mk.marker.getLatLng(), 14); mk.marker.openPopup();
  }
  function applyMap(places) {
    if (mapInstance) Object.values(mapMarkers).forEach(({ marker, cat }) => {
      const on = mapState.active.has(cat);
      if (markerCluster) {
        if (on && !markerCluster.hasLayer(marker)) markerCluster.addLayer(marker);
        else if (!on && markerCluster.hasLayer(marker)) markerCluster.removeLayer(marker);
      } else if (on && !mapInstance.hasLayer(marker)) marker.addTo(mapInstance);
      else if (!on && mapInstance.hasLayer(marker)) mapInstance.removeLayer(marker);
    });
    document.querySelectorAll('#map-filters .map-chip').forEach((c) => { const id = c.dataset.cat; if (id === 'all') c.setAttribute('aria-pressed', String(mapState.active.size === MAP_CATS.length)); else c.setAttribute('aria-pressed', String(mapState.active.has(id))); });
    renderMapList(places);
  }
  function alpineHomeCamera() {
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    return mobile
      ? { center: [6.20, 45.84], zoom: 10.2, pitch: 40, bearing: 48 }
      : { center: [6.31, 45.84], zoom: 10.35, pitch: 70, bearing: 70 };
  }
  function alpineCameraPadding() {
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const compact = window.matchMedia('(max-width: 560px)').matches;
    const side = document.getElementById('alpine-side');
    if (!mobile || compact || !side || side.hidden) return { top: 0, right: 0, bottom: 0, left: 0 };
    return { top: 0, right: 0, bottom: Math.round(Math.min(390, window.innerHeight * 0.43)), left: 0 };
  }
  function fitCentColsBounds(duration) {
    if (!alpineMapInstance || !(D.CENT_COLS || []).length) return;
    const lngs = D.CENT_COLS.map((col) => col.coords[1]);
    const lats = D.CENT_COLS.map((col) => col.coords[0]);
    alpineMapInstance.fitBounds([
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ], {
      padding: alpineCameraPadding(),
      maxZoom: 8.35,
      pitch: window.matchMedia('(max-width: 700px)').matches ? 30 : 46,
      bearing: 16,
      duration: duration == null ? 1100 : duration
    });
  }
  function resetAlpineCamera() {
    if (!alpineMapInstance) return;
    if (mapState && mapState.colMode === 'all') {
      fitCentColsBounds(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100);
      return;
    }
    const camera = alpineHomeCamera();
    alpineMapInstance.easeTo({
      ...camera,
      padding: alpineCameraPadding(),
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100
    });
  }
  function flyToAlpinePoint(id) {
    if (!alpineMapInstance) return;
    const point = alpinePointById(id);
    if (!point) return;
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const tracked = !!centColById(id);
    const far = ['joux-plane', 'ramaz', 'mont-blanc'].includes(id);
    alpineMapInstance.flyTo({
      center: [point.coords[1], point.coords[0]],
      zoom: tracked ? (mobile ? 10.8 : 11.45) : far ? (mobile ? 9.7 : 10.3) : (mobile ? 10.3 : 11.1),
      pitch: mobile ? 52 : 64,
      bearing: id === 'mont-blanc' ? 78 : tracked ? 34 : 58,
      offset: mobile ? [0, 0] : [-120, 0],
      padding: alpineCameraPadding(),
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1400,
      essential: true
    });
  }
  function showAlpineFallback() {
    const stage = document.getElementById('alpine-relief-stage');
    const fallback = document.getElementById('alpine-fallback');
    const loading = document.getElementById('alpine-map-loading');
    const reset = document.getElementById('alpine-reset-view');
    if (!stage || !fallback) return;
    stage.classList.add('is-fallback');
    fallback.hidden = false;
    if (loading) loading.hidden = true;
    if (reset) reset.hidden = true;
  }
  function restyleAlpineBase(map) {
    const layers = (map.getStyle() && map.getStyle().layers) || [];
    layers.forEach((layer) => {
      const sourceLayer = layer['source-layer'];
      try {
        if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-color', '#dce9e7');
        if (layer.type === 'fill' && sourceLayer === 'water') {
          map.setPaintProperty(layer.id, 'fill-color', '#078ea6');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.92);
        }
        if (layer.type === 'line' && (sourceLayer === 'waterway' || sourceLayer === 'water_name')) {
          map.setPaintProperty(layer.id, 'line-color', '#3ec9c2');
        }
        if (layer.type === 'fill' && sourceLayer === 'park') {
          map.setPaintProperty(layer.id, 'fill-color', '#4c8b68');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.38);
        }
        if (layer.type === 'fill' && sourceLayer === 'landcover' && /wood|forest/i.test(layer.id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#2c7658');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.48);
        }
      } catch (_) {}
    });
  }
  function updateCentColSelection(map, id) {
    if (!map || !map.getLayer('cent-cols-selected')) return;
    map.setFilter('cent-cols-selected', ['==', ['get', 'id'], id || '']);
  }
  function addCentColsLayer(map, choose) {
    map.addSource('cent-cols', {
      type: 'geojson',
      data: centColsGeoJSON(),
      cluster: true,
      clusterMaxZoom: 10,
      clusterRadius: 46,
      clusterProperties: { tour_count: ['+', ['get', 'tourFeatured']] },
      attribution: 'Cols: <a href="https://livlisko.github.io/french-cols-tracker/" target="_blank" rel="noopener">French Cols Tracker</a>'
    });
    map.addLayer({
      id: 'cent-cols-clusters',
      type: 'circle',
      source: 'cent-cols',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#6170c9', 10, '#4e65b5', 25, '#354986'],
        'circle-radius': ['step', ['get', 'point_count'], 18, 10, 23, 25, 29],
        'circle-stroke-width': 2.5,
        'circle-stroke-color': ['case', ['>', ['get', 'tour_count'], 0], '#f4c84a', 'rgba(255,255,255,0.92)'],
        'circle-opacity': 0.92
      }
    });
    map.addLayer({
      id: 'cent-cols-cluster-count',
      type: 'symbol',
      source: 'cent-cols',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 11,
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#ffffff'
      }
    });
    map.addLayer({
      id: 'cent-cols-selected',
      type: 'circle',
      source: 'cent-cols',
      filter: ['==', ['get', 'id'], mapState.focus || ''],
      paint: {
        'circle-radius': 13,
        'circle-color': ['case', ['==', ['get', 'tourFeatured'], 1], 'rgba(244,200,74,0.34)', 'rgba(31,145,160,0.24)'],
        'circle-stroke-width': 3,
        'circle-stroke-color': ['case', ['==', ['get', 'tourFeatured'], 1], '#f4c84a', '#ffffff']
      }
    });
    map.addLayer({
      id: 'cent-cols-points',
      type: 'circle',
      source: 'cent-cols',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 4.5, 12, 7],
        'circle-color': ['case', ['==', ['get', 'tourFeatured'], 1], '#f4c84a', '#1f91a0'],
        'circle-stroke-width': 2,
        'circle-stroke-color': ['case', ['==', ['get', 'tourFeatured'], 1], '#5b4500', '#ffffff'],
        'circle-opacity': 0.96
      }
    });
    map.addLayer({
      id: 'cent-cols-labels',
      type: 'symbol',
      source: 'cent-cols',
      minzoom: 10.8,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10.5,
        'text-offset': [0, 1.25],
        'text-anchor': 'top',
        'text-padding': 4,
        'text-optional': true
      },
      paint: {
        'text-color': '#103941',
        'text-halo-color': 'rgba(255,255,255,0.96)',
        'text-halo-width': 1.5
      }
    });
    map.on('click', 'cent-cols-clusters', async (event) => {
      const feature = event.features && event.features[0];
      if (!feature) return;
      const source = map.getSource('cent-cols');
      try {
        const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id);
        map.easeTo({ center: feature.geometry.coordinates, zoom, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650 });
      } catch (_) {}
    });
    map.on('click', 'cent-cols-points', (event) => {
      const feature = event.features && event.features[0];
      if (feature && feature.properties && feature.properties.id) choose(feature.properties.id, true);
    });
    ['cent-cols-clusters', 'cent-cols-points'].forEach((layer) => {
      map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
    });
  }
  function addAlpineMarker(map, point, choose) {
    const shell = document.createElement('button');
    shell.type = 'button';
    shell.className = `relief-marker-shell relief-marker is-${point.kind}${point.featured ? ' is-featured' : ''}${point.tourFeatured ? ' is-tour' : ''}${mapState.focus === point.id ? ' is-selected' : ''}`;
    shell.dataset.alpine = point.id;
    shell.setAttribute('aria-pressed', String(mapState.focus === point.id));
    shell.setAttribute('aria-label', `Open ${point.label}${point.elevation ? `, ${point.elevation.toLocaleString('en-US')} metres` : ''}${point.tourFeatured ? ', featured in the Tour de France' : ''}`);
    shell.title = point.label;
    const card = document.createElement('span');
    card.className = 'relief-marker-card';
    const swatch = document.createElement('span');
    swatch.className = 'relief-marker-swatch';
    swatch.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    copy.className = 'relief-marker-copy';
    const strong = document.createElement('strong');
    strong.textContent = point.label;
    copy.appendChild(strong);
    if (point.elevation) {
      const small = document.createElement('small');
      small.textContent = `${point.elevation.toLocaleString('en-US')} m`;
      copy.appendChild(small);
    }
    card.append(swatch, copy);
    const stem = document.createElement('span');
    stem.className = 'relief-marker-stem';
    stem.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('span');
    dot.className = 'relief-marker-anchor';
    dot.setAttribute('aria-hidden', 'true');
    shell.append(card, stem, dot);
    shell.addEventListener('click', () => choose(point.id, true));
    const marker = new maplibregl.Marker({ element: shell, anchor: 'bottom', opacityWhenCovered: '0.18' })
      .setLngLat([point.coords[1], point.coords[0]])
      .addTo(map);
    alpineMapMarkers[point.id] = { marker, button: shell };
  }
  function initAlpineRelief(choose) {
    const generation = ++mapGeneration;
    const mapEl = document.getElementById('alpine-relief-map');
    if (!mapEl) return;
    ensureMapLibre().then((ok) => {
      if (generation !== mapGeneration) return;
      if (!ok || !window.maplibregl || (maplibregl.supported && !maplibregl.supported())) {
        showAlpineFallback();
        return;
      }
      const mobile = window.matchMedia('(max-width: 700px)').matches;
      let map;
      try {
        map = new maplibregl.Map({
          container: mapEl,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          ...alpineHomeCamera(),
          padding: alpineCameraPadding(),
          minZoom: 6.8,
          maxZoom: 15.5,
          maxPitch: 80,
          maxBounds: [[5.52, 44.82], [7.22, 46.48]],
          attributionControl: false,
          cooperativeGestures: mobile,
          antialias: true,
          fadeDuration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300
        });
      } catch (_) {
        showAlpineFallback();
        return;
      }
      alpineMapInstance = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), mobile ? 'top-right' : 'bottom-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
      if (!mobile) map.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: 'metric' }), 'bottom-right');
      alpineReadyTimer = setTimeout(() => {
        if (generation === mapGeneration && !map.loaded()) showAlpineFallback();
      }, 18000);
      map.on('load', () => {
        if (generation !== mapGeneration) return;
        clearTimeout(alpineReadyTimer);
        alpineReadyTimer = null;
        restyleAlpineBase(map);
        try {
          map.addSource('annecy-terrain', {
            type: 'raster-dem',
            url: 'https://tiles.mapterhorn.com/tilejson.json',
            tileSize: 512,
            attribution: '<a href="https://mapterhorn.com/attribution" target="_blank" rel="noopener">© Mapterhorn</a>'
          });
          map.addSource('annecy-hillshade', {
            type: 'raster-dem',
            tiles: ['https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'],
            encoding: 'terrarium',
            tileSize: 512,
            maxzoom: 17
          });
          const firstLabel = (map.getStyle().layers || []).find((layer) => layer.type === 'symbol');
          map.addLayer({
            id: 'annecy-relief-shade',
            type: 'hillshade',
            source: 'annecy-hillshade',
            paint: {
              'hillshade-shadow-color': '#173f46',
              'hillshade-highlight-color': '#e6fff8',
              'hillshade-accent-color': '#6f73ca',
              'hillshade-exaggeration': 0.48
            }
          }, firstLabel && firstLabel.id);
          map.setTerrain({ source: 'annecy-terrain', exaggeration: 1.14 });
          map.setSky({
            'sky-color': '#5664bd',
            'sky-horizon-blend': 0.48,
            'horizon-color': '#e9c7dd',
            'horizon-fog-blend': 0.56,
            'fog-color': '#d9dcf5',
            'fog-ground-blend': 0.16
          });
        } catch (_) {}
        alpineMapMarkers = {};
        if (mapState.colMode === 'all') {
          try { addCentColsLayer(map, choose); } catch (_) {}
        } else {
          alpineMapPoints().forEach((point) => addAlpineMarker(map, point, choose));
        }
        const loading = document.getElementById('alpine-map-loading');
        if (loading) loading.hidden = true;
        const reset = document.getElementById('alpine-reset-view');
        if (reset) reset.hidden = false;
        if (mapState.colMode === 'all') {
          setTimeout(() => {
            if (generation !== mapGeneration) return;
            if (mapState.focus) flyToAlpinePoint(mapState.focus);
            else fitCentColsBounds(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800);
          }, 260);
        } else if (mapState.focus && mapState.focus !== 'forclaz') {
          setTimeout(() => {
            if (generation === mapGeneration) flyToAlpinePoint(mapState.focus);
          }, 350);
        }
      });
    });
  }
  function wireAlpineView(route) {
    const layout = document.getElementById('alpine-layout');
    const side = document.getElementById('alpine-side');
    const open = document.getElementById('alpine-guide-open');
    const detail = document.getElementById('alpine-detail');
    const showGuide = () => {
      if (!layout || !side || !open) return false;
      const revealed = side.hidden;
      side.hidden = false;
      open.hidden = true;
      layout.classList.remove('is-guide-hidden');
      if (revealed) {
        setTimeout(() => {
          if (!alpineMapInstance) return;
          alpineMapInstance.resize();
          alpineMapInstance.setPadding(alpineCameraPadding());
        }, 40);
      }
      return revealed;
    };
    const choose = (id, moveCamera) => {
      if (!detail) return;
      mapState.focus = id;
      detail.innerHTML = alpineInspectorDetail(id);
      screenEl.querySelectorAll('[data-alpine]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.alpine === id)));
      screenEl.querySelectorAll('.relief-marker-shell').forEach((marker) => marker.classList.toggle('is-selected', marker.dataset.alpine === id));
      updateCentColSelection(alpineMapInstance, id);
      const revealed = showGuide();
      if (side) side.scrollTop = 0;
      history.replaceState(null, '', alpineHref(id, mapState.colMode));
      if (moveCamera) {
        if (revealed) setTimeout(() => flyToAlpinePoint(id), 80);
        else flyToAlpinePoint(id);
      }
      const point = alpinePointById(id);
      announce('Showing ' + (point ? point.label : 'Alpine place'));
    };
    screenEl.querySelectorAll('[data-alpine]').forEach((b) => b.addEventListener('click', () => choose(b.dataset.alpine, true)));
    const search = document.getElementById('alpine-col-search');
    const resultCount = document.getElementById('alpine-result-count');
    if (search) {
      const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const filterRows = () => {
        const query = normalize(search.value);
        let shown = 0;
        screenEl.querySelectorAll('.alpine-tracked-row').forEach((row) => {
          const matches = !query || normalize(row.dataset.colFilter || '').includes(query);
          row.hidden = !matches;
          if (matches) shown += 1;
        });
        if (resultCount) resultCount.textContent = query ? `${shown} ${shown === 1 ? 'match' : 'matches'}` : `${D.CENT_COLS.length} cols across ${new Set(D.CENT_COLS.map((col) => col.region)).size} regions`;
      };
      search.addEventListener('input', filterRows);
      search.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && search.value) {
          search.value = '';
          filterRows();
        }
      });
    }
    const close = document.getElementById('alpine-side-close');
    if (close && side && layout && open) close.addEventListener('click', () => {
      side.hidden = true;
      open.hidden = false;
      layout.classList.add('is-guide-hidden');
      setTimeout(() => {
        if (!alpineMapInstance) return;
        alpineMapInstance.resize();
        alpineMapInstance.setPadding(alpineCameraPadding());
      }, 40);
      open.focus({ preventScroll: true });
    });
    if (open) open.addEventListener('click', () => {
      showGuide();
      const again = document.getElementById('alpine-side-close');
      if (again) again.focus({ preventScroll: true });
    });
    const reset = document.getElementById('alpine-reset-view');
    if (reset) reset.addEventListener('click', resetAlpineCamera);
    initAlpineRelief(choose);
  }
  function initMapView(route) {
    if (route.query.view === 'alpine') { wireAlpineView(route); return; }
    const generation = ++mapGeneration;
    const places = mapPlaces();
    // wire filters + tools (work even if the map lib fails)
    const filters = document.getElementById('map-filters');
    filters.addEventListener('click', (e) => { const b = e.target.closest('.map-chip'); if (!b) return; const id = b.dataset.cat; if (id === 'all') { mapState.active = mapState.active.size === MAP_CATS.length ? new Set() : new Set(MAP_CATS.map((c) => c.id)); } else { if (mapState.active.has(id)) mapState.active.delete(id); else mapState.active.add(id); } applyMap(places); });
    document.getElementById('map-reset').addEventListener('click', () => { mapState.active = new Set(); applyMap(places); });
    document.getElementById('map-base').addEventListener('click', () => { if (mapInstance) mapInstance.setView(activeStay().coords, 13); });
    renderMapList(places);

    ensureLeaflet().then(async (ok) => {
      if (generation !== mapGeneration) return;
      const mapEl = document.getElementById('map'); if (!mapEl) return;
      if (!ok || !window.L) { mapEl.innerHTML = `<div class="map-offline"><p><strong>Map needs a connection.</strong> The place list on the right still works offline — tap any item for directions and details.</p></div>`; return; }
      const clusterReady = await ensureMarkerCluster();
      if (generation !== mapGeneration) return;
      const cat = Object.fromEntries(MAP_CATS.map((c) => [c.id, c]));
      const map = L.map('map', { scrollWheelZoom: true, zoomControl: true }).setView(activeStay().coords, 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
      const cluster = clusterReady ? L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 15,
        maxClusterRadius: window.matchMedia('(max-width: 560px)').matches ? 52 : 44,
        iconCreateFunction: (group) => L.divIcon({
          className: 'annecy-cluster',
          html: `<span>${group.getChildCount()}</span>`,
          iconSize: [42, 42]
        })
      }) : null;
      if (cluster) cluster.addTo(map);
      mapMarkers = {};
      places.forEach((p) => {
        const c = cat[p.cat];
        const icon = L.divIcon({ className: 'mk-wrap', html: `<div class="mk${p.closed ? ' closed' : ''}" style="--cat:${c.color}"><span class="mk-core" aria-hidden="true"></span>${p.closed ? '<span class="mk-no" aria-hidden="true">×</span>' : ''}</div>`, iconSize: [28, 34], iconAnchor: [14, 32], popupAnchor: [0, -28] });
        const dir = (p.dir && !p.closed) ? `<a class="pop-link" href="https://www.google.com/maps/dir/?api=1&origin=${activeStay().coords.join(',')}&destination=${p.dir.join(',')}" target="_blank" rel="noopener">Directions ↗</a>` : '';
        const open = p.route ? `<a class="pop-link" href="${esc(p.route)}" data-nav-link>Open</a>` : (p.href ? `<a class="pop-link" href="${esc(p.href)}" target="_blank" rel="noopener">Official ↗</a>` : '');
        const verify = p.verify && !p.closed ? `<span class="verify-badge">Verify before going</span> ` : '';
        const closedB = p.closed ? `<span class="closed-badge">Closed — don’t plan around this</span> ` : '';
        const html = `<div class="pop" style="--cat:${c.color}"><span class="pc">${esc(c.label)}</span><h3>${esc(p.name)}</h3><p>${closedB}${verify}${esc(p.blurb)}</p>${p.sub ? `<p class="pop-sub">${esc(p.sub)}</p>` : ''}${open} ${dir}</div>`;
        const m = L.marker(p.coords, { icon, title: p.name, alt: p.name, keyboard: true });
        if (mapState.active.has(p.cat)) {
          if (cluster) cluster.addLayer(m); else m.addTo(map);
        }
        m.bindPopup(html, { closeButton: true, maxWidth: 250, minWidth: 200 });
        mapMarkers[p.id] = { marker: m, cat: p.cat };
      });
      map.on('popupopen', (e) => { const el = e.popup.getElement(); if (!el) return; el.querySelectorAll('a[data-nav-link]').forEach((a) => a.addEventListener('click', (ev) => { const h = a.getAttribute('href'); if (h && h[0] === '#') { ev.preventDefault(); location.hash = h; } })); });
      mapInstance = map;
      markerCluster = cluster;
      applyMap(places);
      setTimeout(() => {
        if (generation === mapGeneration && mapInstance === map) map.invalidateSize();
      }, 80);
      setTimeout(() => {
        if (generation !== mapGeneration || mapInstance !== map) return;
        map.invalidateSize();
        if (mapState.focus && mapMarkers[mapState.focus]) {
          focusMarker(mapState.focus);
        }
        else fitLake(map, places);
      }, 320);
    });
  }
  function fitLake(map, places) {
    // Default view = the Annecy basin only; far-flung pins (Chamonix,
    // Les Gets, Pérouges, Aiguebelette…) stay findable by pan/list.
    const near = places.filter((p) =>
      p.coords[0] > 45.75 && p.coords[0] < 45.96 &&
      p.coords[1] > 6.05 && p.coords[1] < 6.33);
    const pts = (near.length ? near : places).map((p) => p.coords);
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 13 });
  }
  function teardownMap() {
    mapGeneration += 1;
    if (alpineReadyTimer) {
      clearTimeout(alpineReadyTimer);
      alpineReadyTimer = null;
    }
    if (alpineMapInstance) {
      alpineMapInstance.remove();
      alpineMapInstance = null;
      alpineMapMarkers = {};
    }
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      mapMarkers = {};
      markerCluster = null;
    }
  }

  /* =========================== router =============================== */
  function parse() {
    let h = location.hash.replace(/^#\/?/, '');
    if (!h) return { name: 'home', parts: [], query: {} };
    const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean); const query = {};
    if (qs) qs.split('&').forEach((kv) => { const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { name: parts[0] || 'today', parts: parts.slice(1), query };
  }
  // Old routes keep working: every retired screen forwards to its new home.
  const ALIAS = { day: 'activities', discover: 'activities', browse: 'activities', search: 'activities', build: 'activities', saved: 'ideas', compare: 'ideas', timeline: 'trip', events: 'trip' };
  const ROUTES = new Set(['home', 'today', 'activities', 'ideas', 'trip', 'map', 'plan', 'bike', 'event', 'areas', 'archive']);
  function render() {
    let route = parse();
    if (ALIAS[route.name]) route.name = ALIAS[route.name];
    if (route.name === 'category' && route.parts[0]) {
      const legacy = { rainy: 'easy' };
      route = { name: 'activities', parts: [], query: { cat: legacy[route.parts[0]] || route.parts[0] } };
    }
    if (route.name === 'plan' && !route.parts[0]) route = { name: 'activities', parts: [], query: route.query.must ? { booking: 'required' } : route.query };
    if (!ROUTES.has(route.name)) {
      route = { name: 'home', parts: [], query: {} };
      history.replaceState(null, '', '#/');
    }
    teardownMap();
    const view = Views[route.name];
    screenEl.innerHTML = view(route);
    screenEl.className = 'screen view-' + route.name + (route.name === 'map' ? ' is-map' : '') + (route.name === 'map' && route.query.view === 'alpine' ? ' is-alpine-map' : '') + (route.name === 'home' ? ' is-home' : '');
    setChrome(route);
    window.scrollTo(0, 0); screenEl.scrollTop = 0;
    // focus management for hash-route changes
    const h = screenEl.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    announce(titleEl.textContent || 'Page');
    // wiring
    if (route.name === 'today') wireContextBar();
    if (route.name === 'activities') wireActivities();
    if (route.name === 'plan' && route.parts[0]) wireActivity();
    if (route.name === 'ideas') wireIdeas();
    if (route.name === 'trip') wireTrip();
    if (route.name === 'map') initMapView(route);
  }

  /* ---------- appbar back ------------------------------------------- */
  document.getElementById('ab-back').addEventListener('click', () => { if (history.length > 1) history.back(); else location.hash = '#/'; });
  window.addEventListener('hashchange', render);
  render();

  /* ---------- offline indicator ------------------------------------- */
  const offbar = document.getElementById('offline-bar');
  function setOffline() { if (offbar) offbar.hidden = navigator.onLine; }
  window.addEventListener('online', setOffline); window.addEventListener('offline', setOffline); setOffline();

  /* ---------- service worker + update toast ------------------------- */
  const localPreview = ['127.0.0.1', 'localhost'].includes(location.hostname);
  if ('serviceWorker' in navigator && !localPreview) {
    window.addEventListener('load', () => {
      const offerUpdate = (worker) => {
        const toast = document.getElementById('sw-toast'); if (!toast || !worker) return;
        const hideUpdate = () => {
          toast.hidden = true;
          document.body.classList.remove('has-sw-update');
        };
        toast.hidden = false;
        document.body.classList.add('has-sw-update');
        const btn = document.getElementById('sw-reload'); if (btn) btn.onclick = () => { worker.postMessage('skip-waiting'); hideUpdate(); };
        const x = document.getElementById('sw-dismiss'); if (x) x.onclick = hideUpdate;
        setTimeout(hideUpdate, 12000);
      };
      navigator.serviceWorker.register('sw.js').then((reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing; if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(nw);
          });
        });
      }).catch(() => {});
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; location.reload(); });
    });
  }
})();
