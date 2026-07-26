/* =====================================================================
   Annecy & Les Gets 2026 — app shell, router and screens.
   Plain JS, no framework. Reads everything from window.DATA.

   Built around the question "what makes sense today, from where we're
   staying?" — an Europe/Paris date resolves the active stay + base,
   every screen is date/base-aware, and the day builder ranks activities
   rather than hard-filtering them.
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
  function sample(arr, n) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }
  const EFFORT_LABEL = { recovery: 'Recovery', easy: 'Easy', moderate: 'Moderate', big: 'Big' };
  const DUR_LABEL = { evening: 'Evening', '2h': '~2 h', half: 'Half day', full: 'Full day' };
  const THEME_LABEL = { water: 'Water', bikes: 'Bikes', views: 'Views', food: 'Food', adrenaline: 'Adrenaline', rainy: 'Rainy', recovery: 'Recovery' };
  const CAT_LABEL = { road: 'Road', gravel: 'Gravel', mtb: 'MTB', easybike: 'Easy ride', hike: 'Hike', walk: 'Walk', viaferrata: 'Via ferrata', canyoning: 'Canyoning', paragliding: 'Paragliding', swim: 'Swim', paddle: 'Water sport', boat: 'Boat', food: 'Food', culture: 'Culture', village: 'Day trip', family: 'Family', recovery: 'Rest' };

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

  /* ---------- saved / status / notes (localStorage) ----------------- */
  function jget(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  const Saved = {
    all() { return jget('a26.saved', {}); },
    status(id) { return this.all()[id] || null; },
    set(id, st) { const m = this.all(); if (st) m[id] = st; else delete m[id]; jset('a26.saved', m); },
    toggle(id) { const cur = this.status(id); this.set(id, cur ? null : 'maybe'); return this.status(id); },
    ids() { return Object.keys(this.all()); },
    note(id, v) { const m = jget('a26.notes', {}); if (v != null) { if (v) m[id] = v; else delete m[id]; jset('a26.notes', m); } return m[id] || ''; },
    compare() { return jget('a26.compare', []); },
    toggleCompare(id) { let c = this.compare(); if (c.includes(id)) c = c.filter((x) => x !== id); else if (c.length < 3) c.push(id); jset('a26.compare', c); return c; }
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
  function eventsOn(dt) { return D.EVENTS.filter((e) => dt >= e.start && dt <= e.end); }
  function upcomingEvents(dt, baseId) { return D.EVENTS.filter((e) => e.end >= dt && (e.base === baseId || e.base === 'both')).sort((a, b) => a.start.localeCompare(b.start)); }

  /* =========================== chrome =============================== */
  const PRIMARY = ['today', 'discover', 'plan', 'map', 'bike'];
  const NAV_FOR = { today: 'today', trip: 'today', areas: 'today', discover: 'discover', category: 'discover', plan: 'plan', build: 'plan', timeline: 'plan', events: 'plan', event: 'plan', saved: 'plan', search: 'plan', browse: 'plan', bike: 'bike', map: 'map' };
  const TITLES = { today: 'Today', discover: 'Discover', plan: 'Plan', build: 'Build a day', timeline: 'Timeline', events: 'Events', saved: 'Saved', search: 'Search', browse: 'All activities', bike: 'Cycling', map: 'Map', trip: 'Trip & logistics', areas: 'Areas', archive: 'The cut list' };

  function setChrome(route) {
    const isPrimary = PRIMARY.includes(route.name) && route.parts.length === 0;
    appbar.classList.toggle('has-back', !isPrimary);
    let title = TITLES[route.name] || 'Annecy 2026';
    if (route.name === 'areas' && route.parts[0]) { const a = D.AREA_BY_ID[route.parts[0]]; title = a ? a.name : 'Area'; }
    if (route.name === 'plan' && route.parts[0]) { const a = D.ACT_BY_ID[route.parts[0]]; title = a ? a.title : 'Plan'; }
    if (route.name === 'event' && route.parts[0]) { const e = D.EVENTS.find((x) => x.id === route.parts[0]); title = e ? e.name : 'Event'; }
    if (route.name === 'category' && route.parts[0]) { const c = D.CATEGORY_BY_ID[route.parts[0]]; title = c ? c.title : 'Discover'; }
    titleEl.textContent = title;
    const navFor = NAV_FOR[route.name] || '';
    navEl.querySelectorAll('a').forEach((a) => { if (a.dataset.nav === navFor) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (actionEl) actionEl.hidden = false;
  }

  /* ---------- cover / media ----------------------------------------- */
  function cover(media, opts) {
    opts = opts || {}; const extra = opts.cls ? ' ' + opts.cls : '';
    if (media && media.photo) return `<img class="cover-img${extra}" src="${esc(media.photo)}" alt="${esc(opts.alt || '')}" width="1200" height="800" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async" />`;
    const tint = (media && media.tint) || opts.tint || 'alpine';
    const emoji = (media && media.emoji) || opts.emoji || '📍';
    const label = (media && media.label) || opts.label || '';
    return `<div class="cover-ph${extra}" data-tint="${esc(tint)}" role="img" aria-label="${esc(label || opts.alt || 'illustration')}"><span class="cover-em" aria-hidden="true">${emoji}</span>${label ? `<span class="cover-label">${esc(label)}</span>` : ''}</div>`;
  }
  function coverOf(obj) { if (!obj) return null; if (obj.media) return obj.media; if (obj.photo) return { photo: obj.photo }; return null; }
  function actCover(a) { return coverOf(a) || coverOf(D.AREA_BY_ID[a.areaId]) || { emoji: catEmoji(a.cat), label: a.title, tint: catTint(a.cat) }; }
  function catEmoji(c) { return ({ road: '🚴', gravel: '🚵', mtb: '🚵', easybike: '🚲', hike: '🥾', walk: '🚶', viaferrata: '🧗', canyoning: '🌊', paragliding: '🪂', swim: '🏊', paddle: '🛶', boat: '⛴️', food: '🧀', culture: '🏛️', village: '🏔️', family: '🌳', recovery: '🛋️' })[c] || '📍'; }
  function catTint(c) { if (['road', 'gravel', 'mtb', 'easybike'].includes(c)) return 'pine'; if (['swim', 'paddle', 'boat'].includes(c)) return 'aqua'; if (['viaferrata', 'canyoning', 'paragliding'].includes(c)) return 'purple'; if (['food'].includes(c)) return 'sun'; return 'alpine'; }

  /* ---------- provenance ------------------------------------------- */
  function sourceLine(a) {
    const s = a.src ? D.SOURCES[a.src] : null; if (!s) return '';
    const verify = a.verifyBeforeGo ? `<span class="verify-badge" title="Not confirmed for our exact dates">Verify before going</span>` : '';
    return `<p class="source-line">${verify} Source: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.type)} ↗</a> · checked ${esc(s.on || D.VERIFIED)}</p>`;
  }

  /* ---------- save / status controls -------------------------------- */
  function saveBtn(id, cls) {
    const st = Saved.status(id);
    return `<button type="button" class="save-btn${st ? ' on' : ''} ${cls || ''}" data-save="${esc(id)}" aria-pressed="${!!st}" aria-label="${st ? 'Saved (' + STATUS_LABEL[st] + ')' : 'Save to shortlist'}">${st ? '★' : '☆'}<span class="save-txt">${st ? STATUS_LABEL[st] : 'Save'}</span></button>`;
  }
  // event delegation for save buttons (bound once)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-save]'); if (!b) return;
    e.preventDefault();
    const id = b.dataset.save; const st = Saved.toggle(id);
    b.classList.toggle('on', !!st); b.setAttribute('aria-pressed', String(!!st));
    b.innerHTML = (st ? '★' : '☆') + `<span class="save-txt">${st ? STATUS_LABEL[st] : 'Save'}</span>`;
    announce(st ? 'Saved to shortlist' : 'Removed from shortlist');
  });

  /* ---------- activity card ----------------------------------------- */
  function actTags(a) {
    const base = activeBase(); const dd = travelFromBase(a, base);
    const tags = [];
    if (a.effort) tags.push(`<span class="pc-tag">${EFFORT_LABEL[a.effort]}</span>`);
    if (a.duration) tags.push(`<span class="pc-tag">${DUR_LABEL[a.duration]}</span>`);
    if (dd) tags.push(`<span class="pc-tag">${dd.approx ? '≈' : ''}${dd.min}′ ${esc(dd.mode)}</span>`);
    if (a.booking === 'required') tags.push(`<span class="pc-tag warn">Book ahead</span>`);
    else if (a.booking === 'recommended') tags.push(`<span class="pc-tag">Booking advised</span>`);
    if (a.verifyBeforeGo) tags.push(`<span class="pc-tag verify">Verify</span>`);
    return tags.join('');
  }
  function activityCard(a, opts) {
    opts = opts || {};
    const fit = opts.fit ? `<div class="fit-row"><span class="fit-badge ${opts.fit === 'Best fit' ? 'best' : 'close'}">${esc(opts.fit)}</span>${opts.relaxed ? `<span class="fit-relaxed">relaxed ${esc(opts.relaxed)}</span>` : ''}</div>` : '';
    const reasons = opts.reasons && opts.reasons.length ? `<ul class="fit-why">${opts.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '';
    const sub = a.subtype ? `<span class="pc-sub">${esc(a.subtype)}</span>` : '';
    return `<article class="plan-card">
      ${fit}
      <a class="pc-hit" href="#/plan/${esc(a.id)}">
        <div class="pc-top"><h3>${esc(a.title)}</h3>${sub}</div>
        <p class="pc-desc">${esc(a.summary)}</p>
      </a>
      ${reasons}
      <div class="pc-meta">${actTags(a)}</div>
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
      render(); announce('Viewing ' + prettyDay(activeDate()));
    }));
  }

  /* =========================== VIEWS ================================ */
  const Views = {};

  /* ---------- TODAY (home dashboard) -------------------------------- */
  Views.today = function () {
    const dt = activeDate(); const stay = activeStay(); const base = stay.baseId; const co = changeoverOn(dt);
    const todays = eventsOn(dt).filter((e) => e.base === base || e.base === 'both');
    const upcoming = upcomingEvents(dt, base).filter((e) => e.start > dt).slice(0, 3);
    const mustBook = D.ACTIVITIES.filter((a) => availableNow(a, base, dt) && (a.booking === 'required' || a.booking === 'recommended')).slice(0, 4);
    const savedIds = Saved.ids().map((id) => D.ACT_BY_ID[id]).filter(Boolean);
    const savedBlock = savedIds.length
      ? `<div class="section-head"><h2>Your shortlist</h2><a class="see-all" href="#/saved">See all (${savedIds.length})</a></div><div class="cards">${savedIds.slice(0, 4).map((a) => activityCard(a)).join('')}</div>`
      : `<div class="section-head"><h2>Featured today</h2></div><div class="cards">${D.FEATURED.map((id) => D.ACT_BY_ID[id]).filter((a) => a && availableNow(a, base, dt)).slice(0, 4).map((a) => activityCard(a)).join('')}</div>`;

    const changeoverNote = co ? `<div class="note-box warn">🔁 <strong>Changeover day.</strong> Out of ${esc(co.out.name)} (${esc(co.out.checkout)}), into ${esc(co.inn.name)} (${esc(co.inn.checkin)}). ${dt === '2026-08-22' ? 'Also the Les Gets World-Cup Downhill day — expect crowds if you go near Les Gets.' : ''}</div>` : '';

    return `
      ${contextBar()}
      <section class="today-hero">
        <div class="th-eyebrow">${esc(stay.legLabel)} · ${esc(D.TRIP.datesLabel)}</div>
        <h2 class="th-title">${base === 'lesgets' ? 'Bike-park days at Les Gets' : 'On the lake, from Veyrier-du-Lac'}</h2>
        <details class="stay-inline">
          <summary><span class="si-name">${esc(stay.name)}</span><span class="si-vil">${esc(stay.village)}</span></summary>
          <p class="si-addr">${esc(stay.address)}</p>
          <p class="si-times"><strong>In:</strong> ${esc(stay.checkin)}<br><strong>Out:</strong> ${esc(stay.checkout)}</p>
          <div class="ac-tags">${stay.features.map((f) => `<span class="tag">${esc(f)}</span>`).join('')}</div>
          <div class="actions" style="margin-top:.6rem">
            <a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.address)}" target="_blank" rel="noopener">Directions ↗</a>
            <a class="btn ghost" href="#/map?place=${esc(stay.id)}">On map</a>
            <a class="btn ghost" href="#/trip">All logistics</a>
          </div>
        </details>
      </section>

      ${changeoverNote}

      <div class="action-row">
        <a class="action-tile" href="#/build"><span class="at-em" aria-hidden="true">🧩</span><span>Build a day</span></a>
        <a class="action-tile" href="#/map"><span class="at-em" aria-hidden="true">🗺️</span><span>Map</span></a>
        <a class="action-tile" href="#/plan?must=1"><span class="at-em" aria-hidden="true">📌</span><span>Must book</span></a>
      </div>

      <div class="section-head"><h2>Today &amp; next up</h2></div>
      ${todays.length ? `<p class="intro">On today near you:</p>` + todays.map(eventRow).join('') : `<p class="intro">Nothing fixed today — a blank canvas. ${upcoming.length ? 'Coming up:' : ''}</p>`}
      ${upcoming.map(eventRow).join('')}
      <a class="see-all block" href="#/timeline">See the whole timeline →</a>

      <div class="section-head"><h2>Weather-led</h2><a class="see-all" href="#/plan">More</a></div>
      <div class="weather-quick">${D.WEATHER.questions.slice(0, 4).map((q) => `<div class="wq"><strong>${esc(q.q)}</strong><span>${esc(q.a)}</span></div>`).join('')}</div>
      <p class="intro"><a href="${esc(D.SOURCES[D.WEATHER.links[0].src].url)}" target="_blank" rel="noopener">Open the forecast ↗</a> — this app never fakes live weather.</p>

      ${mustBook.length ? `<div class="section-head"><h2>Worth booking ahead</h2></div><div class="cards">${mustBook.map((a) => activityCard(a)).join('')}</div>` : ''}

      ${savedBlock}
    `;
  };

  function eventRow(e) {
    const base = activeBase(); const dd = travelFromBase(e, base);
    const conflict = e.conflict ? `<span class="ev-conflict">changeover clash</span>` : '';
    return `<a class="event-row" href="#/event/${esc(e.id)}">
      <div class="er-date">${esc(e.datesLabel.split(',')[0])}</div>
      <div class="er-body"><h3>${esc(e.name)} ${conflict}</h3><p>${esc(e.where)}${dd ? ` · ${dd.approx ? '≈' : ''}${dd.min}′` : ''}</p></div>
      <span class="er-go" aria-hidden="true">›</span>
    </a>`;
  }

  /* ---------- BUILD A DAY (ranked) ---------------------------------- */
  const defaultBuild = () => ({ time: 'half', effort: 'moderate', transport: 'car', theme: 'any', weather: 'any', booking: 'any' });
  let buildState = defaultBuild();

  function readBuildQuery(route) {
    const q = route.query; const s = defaultBuild();
    if (q.t) s.time = q.t; if (q.e) s.effort = q.e; if (q.x) s.transport = q.x; if (q.th) s.theme = q.th; if (q.w) s.weather = q.w; if (q.b) s.booking = q.b;
    return s;
  }
  function buildUrl(s) { return `#/build?t=${s.time}&e=${s.effort}&x=${s.transport}&th=${s.theme}&w=${s.weather}&b=${s.booking}`; }

  const DUR_RANK = { '2h': 1, half: 2, full: 3, evening: 1 };
  function durationFits(actDur, win) { if (win === 'evening') return actDur === 'evening' || actDur === '2h'; return DUR_RANK[actDur] <= DUR_RANK[win]; }

  function hardOk(a, s, base, dt, relax) {
    if (!availableNow(a, base, dt)) return false;
    if (!relax.transport && !(a.transport || []).includes(s.transport)) return false;
    if (!relax.duration && !durationFits(a.duration, s.time)) return false;
    // never surface an unsafe option for the chosen weather
    if ((s.weather === 'rain' || s.weather === 'storm-pm') && a.weather && a.weather.wetUnsafe) return false;
    return true;
  }
  function scoreAct(a, s) {
    let score = 0; const relaxed = []; const reasons = [];
    const eOrder = ['recovery', 'easy', 'moderate', 'big'];
    const de = Math.abs(eOrder.indexOf(a.effort) - eOrder.indexOf(s.effort));
    if (de === 0) { score += 4; reasons.push(`${EFFORT_LABEL[a.effort]} effort, as asked`); }
    else if (de === 1) { score += 1; relaxed.push('effort'); }
    else { score -= 1.5; relaxed.push('effort'); }
    if (s.theme === 'any') { score += 1; }
    else if ((a.themes || []).includes(s.theme)) { score += 5; reasons.push(`${THEME_LABEL[s.theme]} — your theme`); }
    else { score -= 2; relaxed.push('theme'); }
    if (s.weather === 'rain') { const r = a.weather && a.weather.rain; if (r === 'good') { score += 4; reasons.push('Good in the rain'); } else if (r === 'ok') score += 1; else { score -= 4; relaxed.push('weather'); } }
    else if (s.weather === 'storm-pm') { if (a.weather && (a.weather.storm === 'avoid-pm' || a.weather.storm === 'avoid')) { score -= 3; relaxed.push('weather'); } else { score += 1; reasons.push('Fine with afternoon storms'); } }
    else if (s.weather === 'heat') { if (a.weather && (a.weather.shade === 'shaded' || a.weather.heat === 'cool')) { score += 3; reasons.push('Shaded / cool in the heat'); } else if (a.weather && a.weather.heat === 'exposed') { score -= 2; relaxed.push('weather'); } }
    else if (s.weather === 'clear') { if (a.weather && a.weather.best === 'clear') { score += 3; reasons.push('Made for a clear day'); } }
    if (s.booking === 'spontaneous' && a.booking === 'required') { score -= 3; relaxed.push('booking'); }
    if (s.booking === 'ok-to-book' && a.booking === 'required') { score += 0.5; }
    if ((a.transport || []).includes(s.transport)) reasons.push(`Reachable ${s.transport === 'car' ? 'by car' : s.transport === 'bike' ? 'by bike' : s.transport === 'busboat' ? 'by bus/boat' : 'on foot'}`);
    score += (a.scenic || 0) * 0.6 + (a.novelty || 0) * 0.4;
    if (a.featured) score += 0.4;
    return { score, relaxed: [...new Set(relaxed)], reasons: reasons.slice(0, 3) };
  }
  function rankDay(s) {
    const base = activeBase(), dt = activeDate();
    let relax = { transport: false, duration: false };
    let pool = D.ACTIVITIES.filter((a) => hardOk(a, s, base, dt, relax));
    const relaxedGlobal = [];
    if (pool.length < 3) { relax.transport = true; relaxedGlobal.push('transport (car allowed)'); pool = D.ACTIVITIES.filter((a) => hardOk(a, s, base, dt, relax)); }
    if (pool.length < 3) { relax.duration = true; relaxedGlobal.push('time window'); pool = D.ACTIVITIES.filter((a) => hardOk(a, s, base, dt, relax)); }
    const scored = pool.map((a) => ({ a, ...scoreAct(a, s) })).sort((x, y) => y.score - x.score);
    const top = scored.slice(0, 3).map((r) => ({
      a: r.a,
      fit: r.relaxed.length === 0 ? 'Best fit' : 'Close fit',
      relaxed: r.relaxed.map((x) => x === 'effort' ? 'effort' : x === 'theme' ? 'theme' : x === 'weather' ? 'weather' : x).join(', '),
      reasons: r.reasons
    }));
    return { top, relaxedGlobal, base, count: scored.length };
  }
  function renderBuildOut(s) {
    const out = document.getElementById('build-out'); if (!out) return;
    const { top, relaxedGlobal, base } = rankDay(s);
    const stay = activeStay();
    let html = `<p class="intro">From <strong>${esc(stay.village)}</strong> on ${esc(prettyDay(activeDate()))}.</p>`;
    if (relaxedGlobal.length) html += `<div class="note-box">No exact match — widened by <strong>${esc(relaxedGlobal.join(' & '))}</strong> to show real options.</div>`;
    if (!top.length) { out.innerHTML = html + `<div class="empty">Nothing fits even loosely. Try a different theme or “Car’s fine”.</div>`; announce('No results'); return; }
    html += `<div class="cards">${top.map((r) => activityCard(r.a, { fit: r.fit, relaxed: r.relaxed, reasons: r.reasons })).join('')}</div>`;
    // pairing suggestion from the best result
    const best = top[0].a; if (best.pairWith && best.pairWith.length) { const p = D.ACT_BY_ID[best.pairWith[0]]; if (p) html += `<p class="pair-line">Pair the top pick with <a href="#/plan/${esc(p.id)}">${esc(p.title)}</a> nearby.</p>`; }
    out.innerHTML = html;
    announce(`${top.length} suggestion${top.length === 1 ? '' : 's'}: best fit ${top[0].a.title}`);
  }
  Views.build = function (route) {
    buildState = readBuildQuery(route);
    function seg(group, opts, label) {
      return `<fieldset class="build-q"><legend class="build-label">${label}</legend><div class="seg" role="group" aria-label="${label}">${opts.map((o) => `<button type="button" class="seg-btn" data-group="${group}" data-val="${esc(o.id)}" aria-pressed="${buildState[group] === o.id}">${o.emoji ? `<span class="em" aria-hidden="true">${o.emoji}</span>` : ''}<span class="seg-lb">${esc(o.label)}</span></button>`).join('')}</div></fieldset>`;
    }
    return `
      ${contextBar()}
      <div class="section-head" style="margin-top:.4rem"><h2>Build a day</h2><p>Ranked for ${esc(activeStay().village)} on the active date. Answers stay in the link.</p></div>
      ${seg('time', D.BUILD.time, 'How much time?')}
      ${seg('effort', D.BUILD.effort, 'Effort')}
      ${seg('transport', D.BUILD.transport, 'How are you getting there?')}
      ${seg('theme', D.BUILD.theme, 'In the mood for')}
      <details class="build-more"><summary>More filters (weather, booking)</summary>
        ${seg('weather', D.BUILD.weather, 'Weather')}
        ${seg('booking', D.BUILD.booking, 'Booking')}
      </details>
      <div class="section-head"><h2>Suggestions</h2></div>
      <div id="build-out" aria-live="polite"></div>
    `;
  };
  function wireBuild(route) {
    wireContextBar();
    renderBuildOut(buildState);
    screenEl.querySelectorAll('.seg-btn').forEach((btn) => btn.addEventListener('click', () => {
      const g = btn.dataset.group; buildState[g] = btn.dataset.val;
      screenEl.querySelectorAll(`.seg-btn[data-group="${g}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      history.replaceState(null, '', buildUrl(buildState));
      renderBuildOut(buildState);
    }));
  }

  /* ---------- PLAN HUB ---------------------------------------------- */
  Views.plan = function (route) {
    if (route.parts[0]) return Views.activity(route);
    if (route.query.must) return browseList((a) => a.booking === 'required' || a.booking === 'recommended', 'Worth booking ahead', 'Guided and ticketed things that can sell out.');
    const base = activeBase(); const dt = activeDate();
    const top3 = base === 'lesgets' ? D.LESGETS_TOP3 : null;
    const shortlist = base === 'lesgets'
      ? `<div class="section-head"><h2>If you only do three things in Les Gets</h2></div>` + D.LESGETS_TOP3.map((id) => { const a = D.ACT_BY_ID[id] || D.EVENTS.find((e) => e.id === id); return a && a.title ? (D.ACT_BY_ID[id] ? activityCardWrap(a) : eventRow(a)) : ''; }).join('')
      : `<div class="section-head"><h2>Full-day excursions worth leaving the lake for</h2></div><div class="cards">${D.LAKE_EXCURSIONS.map((id) => D.ACT_BY_ID[id]).filter(Boolean).map((a) => activityCard(a)).join('')}</div>`;
    return `
      ${contextBar()}
      <div class="hub-grid">
        <a class="hub-tile" href="#/build"><span class="em">🧩</span><strong>Build a day</strong><span>Ranked for right now</span></a>
        <a class="hub-tile" href="#/browse"><span class="em">📚</span><strong>All activities</strong><span>Browse &amp; filter</span></a>
        <a class="hub-tile" href="#/timeline"><span class="em">🗓️</span><strong>Timeline</strong><span>Aug 12–29</span></a>
        <a class="hub-tile" href="#/events"><span class="em">🎫</span><strong>Events</strong><span>Races &amp; festivals</span></a>
        <a class="hub-tile" href="#/saved"><span class="em">★</span><strong>Saved</strong><span>${Saved.ids().length} shortlisted</span></a>
        <a class="hub-tile" href="#/search"><span class="em">🔎</span><strong>Search</strong><span>Places, climbs, tags</span></a>
      </div>
      ${shortlist}
    `;
  };
  function activityCardWrap(a) { return `<div class="cards">${activityCard(a)}</div>`; }

  /* ---------- BROWSE (all activities, filterable) ------------------- */
  function browseList(pred, title, sub) {
    const base = activeBase(), dt = activeDate();
    const list = D.ACTIVITIES.filter((a) => availableNow(a, base, dt) && (!pred || pred(a)));
    return `${contextBar()}<div class="section-head" style="margin-top:.4rem"><h2>${esc(title || 'All activities')}</h2><p>${esc(sub || (list.length + ' available now from ' + activeStay().village))}</p></div>
      <div class="chips-row" id="browse-cats">${['all', 'cycling', 'water', 'adrenaline', 'mountains', 'food', 'rainy'].map((c) => `<button class="chip" data-cat="${c}" aria-pressed="${c === 'all'}">${c === 'all' ? 'All' : D.CATEGORY_BY_ID[c] ? D.CATEGORY_BY_ID[c].title : c}</button>`).join('')}</div>
      <div class="cards" id="browse-out">${list.map((a) => activityCard(a)).join('')}</div>`;
  }
  Views.browse = function () { return browseList(null); };
  const CAT_THEMES = { cycling: ['bikes'], water: ['water'], adrenaline: ['adrenaline'], mountains: ['views'], food: ['food'], rainy: ['rainy', 'recovery'] };
  function wireBrowse() {
    wireContextBar();
    const row = document.getElementById('browse-cats'); const out = document.getElementById('browse-out'); if (!row || !out) return;
    const base = activeBase(), dt = activeDate();
    row.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      row.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const c = b.dataset.cat; const themes = CAT_THEMES[c];
      const list = D.ACTIVITIES.filter((a) => availableNow(a, base, dt) && (c === 'all' || (a.themes || []).some((t) => themes.includes(t))));
      out.innerHTML = list.length ? list.map((a) => activityCard(a)).join('') : `<div class="empty">Nothing in that category from ${esc(activeStay().village)} right now.</div>`;
      announce(list.length + ' activities');
    });
  }

  /* ---------- ACTIVITY DETAIL --------------------------------------- */
  Views.activity = function (route) {
    const a = D.ACT_BY_ID[route.parts[0]]; if (!a) return `<div class="empty">Unknown plan. <a href="#/plan">Back to Plan</a></div>`;
    const base = activeBase(); const relevant = a.base === 'both' || a.base === base;
    const dd = travelFromBase(a, base); const ddOther = travelFromBase(a, base === 'lake' ? 'lesgets' : 'lake');
    const area = D.AREA_BY_ID[a.areaId];
    const note = Saved.note(a.id);

    const facts = [];
    if (a.subtype) facts.push(['Type', esc(a.subtype)]);
    facts.push(['Where', esc(area ? area.name : (a.where || '—'))]);
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
    const weather = a.weather ? weatherLine(a.weather) : '';

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

      ${!relevant ? `<div class="note-box warn">You’re based at <strong>${esc(D.BASES[base].label)}</strong> right now — this is a ${esc(D.BASES[a.base] ? D.BASES[a.base].label : 'different-base')} activity${ddOther ? ` (${ddOther.approx ? '≈' : ''}${ddOther.min} min from there)` : ''}.</div>` : ''}
      ${a.status === 'closed' ? `<div class="note-box warn">⚠️ Currently closed — not available for the trip.</div>` : ''}

      <p class="detail-lede">${esc(a.summary)}</p>
      ${a.why ? `<p class="detail-why">${esc(a.why)}</p>` : ''}

      <div class="detail-actions">${saveBtn(a.id, 'big')} ${statusPicker(a.id)}</div>

      <dl class="spec">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      ${weather ? `<div class="weather-strip">${weather}</div>` : ''}

      <div class="actions">${links.join('')}</div>

      ${details.length ? `<details class="logi"><summary>Logistics &amp; safety</summary><dl class="spec">${details.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details>` : ''}

      ${a.availability ? `<p class="avail-line">📅 ${esc(a.availability)}</p>` : ''}

      ${pair.length ? `<div class="section-head"><h2>Pair it with</h2></div><div class="cards">${pair.map((p) => activityCard(p)).join('')}</div>` : ''}
      ${alt ? `<div class="section-head"><h2>Easier / weather-proof alternative</h2></div><div class="cards">${activityCard(alt)}</div>` : ''}

      <div class="section-head"><h2>Your notes</h2></div>
      <textarea class="note-field" id="note-${esc(a.id)}" data-note="${esc(a.id)}" rows="2" placeholder="Add a private note (saved on this device)…">${esc(note)}</textarea>

      ${sourceLine(a)}
    `;
  };
  function weatherLine(w) {
    const bits = [];
    if (w.rain) bits.push(`Rain: ${w.rain}`);
    if (w.heat) bits.push(`Heat: ${w.heat}`);
    if (w.storm) bits.push(`Storm: ${w.storm}`);
    if (w.wind) bits.push(`Wind: ${w.wind}`);
    if (w.shade) bits.push(w.shade);
    if (w.best) bits.push(`Best: ${w.best}`);
    return `<span class="ws-label">Conditions</span> ${bits.map((b) => `<span class="ws-chip">${esc(b)}</span>`).join('')}${w.note ? `<p class="ws-note">${esc(w.note)}</p>` : ''}`;
  }
  function statusPicker(id) {
    const cur = Saved.status(id);
    return `<span class="status-picker" role="group" aria-label="Set status">${['maybe', 'booked', 'done'].map((s) => `<button type="button" class="sp-btn" data-status="${id}:${s}" aria-pressed="${cur === s}">${STATUS_LABEL[s]}</button>`).join('')}</span>`;
  }
  function wireActivity() {
    screenEl.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
      const [id, s] = b.dataset.status.split(':'); const cur = Saved.status(id);
      Saved.set(id, cur === s ? null : s);
      render(); announce(cur === s ? 'Status cleared' : 'Marked ' + STATUS_LABEL[s]);
    }));
    const ta = screenEl.querySelector('[data-note]');
    if (ta) ta.addEventListener('change', () => { Saved.note(ta.dataset.note, ta.value); announce('Note saved'); });
  }

  /* ---------- TIMELINE ---------------------------------------------- */
  Views.timeline = function () {
    const days = []; let d = D.TRIP.window.start;
    while (d <= D.TRIP.window.end) { days.push(d); d = addDays(d, 1); }
    const today = activeDate();
    const firstInWindow = (e) => (e.start < D.TRIP.window.start ? D.TRIP.window.start : e.start);
    const rows = days.map((dt) => {
      const stay = stayForDate(dt); const co = changeoverOn(dt);
      // show each event once, on its first day inside the trip window
      const evs = D.EVENTS.filter((e) => firstInWindow(e) === dt);
      const isNow = dt === today;
      const flags = [];
      if (co) flags.push(`<span class="tl-flag change">Base change → ${esc(co.inn.village)}</span>`);
      if (dt === D.TRIP.window.start) flags.push(`<span class="tl-flag">Arrive · van pickup GVA</span>`);
      if (dt === D.TRIP.window.end) flags.push(`<span class="tl-flag">Depart · flights + van back</span>`);
      return `<div class="tl-row${isNow ? ' now' : ''}${co ? ' change' : ''}">
        <button class="tl-date" data-goto="${dt}"><span class="tl-dow">${esc(prettyDay(dt).split(' ')[0])}</span><span class="tl-num">${dt.split('-')[2]}</span></button>
        <div class="tl-body">
          <div class="tl-base">${esc(stay.village)} · <span class="tl-stay">${esc(stay.name)}</span></div>
          ${flags.join(' ')}
          ${evs.map((e) => `<a class="tl-ev ${e.conflict ? 'clash' : ''}" href="#/event/${esc(e.id)}">${esc(e.name)}${e.conflict ? ' · clash' : ''}</a>`).join('')}
        </div>
      </div>`;
    }).join('');
    return `<div class="section-head" style="margin-top:.4rem"><h2>Trip timeline</h2><p>${esc(D.TRIP.datesLabel)}. <span class="lg confirmed">Confirmed</span> events &amp; base changes; the rest is open. Tap a date to plan it.</p></div>
      <div class="timeline">${rows}</div>
      <p class="intro" style="margin-top:1rem">Your shortlist isn’t pinned to days — keep it flexible. <a href="#/saved">See saved plans →</a></p>`;
  };
  function wireTimeline() {
    screenEl.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => { setDate(b.dataset.goto); location.hash = '#/build'; }));
  }

  /* ---------- EVENTS ------------------------------------------------ */
  Views.events = function () {
    const rows = D.EVENTS.slice().sort((a, b) => a.start.localeCompare(b.start)).map(eventRow).join('');
    return `<div class="section-head" style="margin-top:.4rem"><h2>Events during the trip</h2><p>Races, festivals and markets — dates and conflicts shown honestly.</p></div>${rows}`;
  };
  Views.event = function (route) {
    const e = D.EVENTS.find((x) => x.id === route.parts[0]); if (!e) return `<div class="empty">Unknown event.</div>`;
    const base = activeBase(); const dd = travelFromBase(e, base);
    const conf = e.confidence === 'confirmed' ? '<span class="lg confirmed">Confirmed</span>' : e.confidence === 'likely' ? '<span class="lg likely">Likely</span>' : '';
    const s = e.src ? D.SOURCES[e.src] : null;
    return `
      <div class="section-head" style="margin-top:.4rem"><h2>${esc(e.name)}</h2><p>${conf} ${esc(e.datesLabel)}</p></div>
      <dl class="spec">
        <dt>When</dt><dd>${esc(e.datesLabel)}</dd>
        <dt>Where</dt><dd>${esc(e.where)}</dd>
        ${dd ? `<dt>From here</dt><dd>${dd.approx ? '≈' : ''}${dd.min} min ${esc(dd.mode)} from ${esc(D.BASES[base].label)}</dd>` : ''}
        <dt>Tickets</dt><dd>${e.booking === 'no' ? 'Free / no ticket' : e.booking === 'yes' ? 'Ticketed — book' : 'Some free, some ticketed'}${e.price ? ' · ' + esc(e.price) : ''}</dd>
      </dl>
      <p class="detail-why">${esc(e.why)}</p>
      ${e.impact ? `<div class="note-box${e.conflict ? ' warn' : ''}">${e.conflict ? '⚠️ ' : 'ℹ️ '}${esc(e.impact)}</div>` : ''}
      <div class="detail-actions">${saveBtn(e.id, 'big')}</div>
      ${s ? `<p class="source-line">${e.verifyBeforeGo ? '<span class="verify-badge">Verify before going</span> ' : ''}Source: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.type)} ↗</a> · checked ${esc(s.on || D.VERIFIED)}</p>` : ''}
    `;
  };

  /* ---------- SAVED + COMPARE --------------------------------------- */
  Views.saved = function () {
    const ids = Saved.ids(); if (!ids.length) return `<div class="section-head" style="margin-top:.4rem"><h2>Saved</h2></div><div class="empty">Nothing saved yet. Tap ☆ on any activity to shortlist it, then set it to Maybe / Booked / Done.</div>`;
    const groups = { maybe: [], booked: [], done: [] };
    ids.forEach((id) => { const a = D.ACT_BY_ID[id] || D.EVENTS.find((e) => e.id === id); if (a) (groups[Saved.status(id)] || groups.maybe).push({ id, a, isEvent: !D.ACT_BY_ID[id] }); });
    const cmp = Saved.compare();
    let out = `<div class="section-head" style="margin-top:.4rem"><h2>Saved</h2><p>${ids.length} shortlisted. Tick 2–3 to compare.</p></div>`;
    if (cmp.length >= 2) out += `<a class="btn block" href="#/compare">Compare ${cmp.length} selected →</a>`;
    ['maybe', 'booked', 'done'].forEach((st) => { if (groups[st].length) { out += `<div class="group-label">${STATUS_LABEL[st]}</div>`; out += groups[st].map(({ id, a, isEvent }) => savedRow(id, a, isEvent)).join(''); } });
    return out;
  };
  function savedRow(id, a, isEvent) {
    const checked = Saved.compare().includes(id);
    return `<div class="saved-row">
      ${!isEvent ? `<label class="cmp-check"><input type="checkbox" data-cmp="${esc(id)}" ${checked ? 'checked' : ''} aria-label="Compare ${esc(a.title)}"></label>` : '<span class="cmp-check"></span>'}
      <a class="sr-link" href="#/${isEvent ? 'event' : 'plan'}/${esc(id)}"><strong>${esc(a.title || a.name)}</strong><span>${esc(a.summary || a.where || '')}</span></a>
      ${saveBtn(id)}
    </div>`;
  }
  function wireSaved() {
    screenEl.querySelectorAll('[data-cmp]').forEach((c) => c.addEventListener('change', () => { Saved.toggleCompare(c.dataset.cmp); render(); }));
  }
  Views.compare = function () {
    const ids = Saved.compare().map((id) => D.ACT_BY_ID[id]).filter(Boolean); if (ids.length < 2) return `<div class="empty">Pick 2–3 saved activities to compare. <a href="#/saved">Back to Saved</a></div>`;
    const base = activeBase();
    const rows = [
      ['', ids.map((a) => `<strong>${esc(a.title)}</strong>`)],
      ['Effort', ids.map((a) => EFFORT_LABEL[a.effort] || '—')],
      ['Time', ids.map((a) => DUR_LABEL[a.duration] || '—')],
      ['Door-to-door', ids.map((a) => { const d = travelFromBase(a, base); return d ? `${d.approx ? '≈' : ''}${d.min}′ ${esc(d.mode)}` : '—'; })],
      ['Stats', ids.map((a) => a.distanceKm ? `${a.distanceKm} km / ${a.ascentM || '?'} m` : (a.difficulty ? esc(a.difficulty.split(';')[0]) : '—'))],
      ['Booking', ids.map((a) => a.booking === 'required' ? 'Required' : a.booking === 'recommended' ? 'Advised' : 'Walk-up')],
      ['Price', ids.map((a) => esc(a.price || 'Free / n/a'))],
      ['Weather', ids.map((a) => a.weather && a.weather.best ? esc(a.weather.best) : '—')]
    ];
    return `<div class="section-head" style="margin-top:.4rem"><h2>Compare</h2><p>From ${esc(activeStay().village)}.</p></div>
      <div class="cmp-wrap"><table class="cmp-table">${rows.map(([k, cells]) => `<tr><th scope="row">${esc(k)}</th>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>
      <div class="actions">${ids.map((a) => `<a class="btn ghost" href="#/plan/${esc(a.id)}">${esc(a.title)} →</a>`).join('')}</div>`;
  };

  /* ---------- SEARCH ------------------------------------------------ */
  Views.search = function (route) {
    const q = route.query.q || '';
    return `<div class="section-head" style="margin-top:.4rem"><h2>Search</h2></div>
      <input class="search-input" id="search-input" type="search" value="${esc(q)}" placeholder="Climbs, towns, canyoning, market…" aria-label="Search activities, places and events" autocomplete="off">
      <div id="search-out" aria-live="polite"></div>`;
  };
  function searchIndex() {
    const items = [];
    D.ACTIVITIES.forEach((a) => items.push({ t: a.title, s: a.summary, tags: [a.subtype, a.cat, (a.themes || []).join(' '), (D.AREA_BY_ID[a.areaId] || {}).name].join(' '), href: '#/plan/' + a.id, kind: 'Activity' }));
    D.AREAS.forEach((a) => items.push({ t: a.name, s: a.zone, tags: a.region, href: '#/areas/' + a.id, kind: 'Area' }));
    D.EVENTS.forEach((e) => items.push({ t: e.name, s: e.where, tags: e.kind, href: '#/event/' + e.id, kind: 'Event' }));
    return items;
  }
  function runSearch(q) {
    const out = document.getElementById('search-out'); if (!out) return;
    q = q.trim().toLowerCase(); if (!q) { out.innerHTML = `<p class="intro">Type to search across activities, towns, climbs, events and tags.</p>`; return; }
    const res = searchIndex().filter((i) => (i.t + ' ' + i.s + ' ' + i.tags).toLowerCase().includes(q)).slice(0, 25);
    out.innerHTML = res.length ? res.map((r) => `<a class="list-item" href="${r.href}"><div class="li-top"><h3>${esc(r.t)}</h3><span class="li-tag">${r.kind}</span></div><p>${esc(r.s)}</p></a>`).join('') : `<div class="empty">No match for “${esc(q)}”.</div>`;
    announce(res.length + ' results');
  }
  function wireSearch() {
    const inp = document.getElementById('search-input'); if (!inp) return;
    runSearch(inp.value);
    inp.addEventListener('input', () => { history.replaceState(null, '', '#/search?q=' + encodeURIComponent(inp.value)); runSearch(inp.value); });
  }

  /* ---------- BIKE (cycling hub) ------------------------------------ */
  Views.bike = function () {
    const base = activeBase(), dt = activeDate();
    const byCat = (cats) => D.ACTIVITIES.filter((a) => availableNow(a, base, dt) && cats.includes(a.cat));
    const groups = [
      ['Road climbs & loops', byCat(['road'])],
      ['Gravel', byCat(['gravel'])],
      ['Easy & greenway', byCat(['easybike'])],
      ['MTB & bike parks', byCat(['mtb'])]
    ];
    const races = D.EVENTS.filter((e) => e.kind === 'race');
    return `${contextBar()}
      <div class="section-head" style="margin-top:.4rem"><h2>Cycling</h2><p>Road, gravel, MTB and bike parks from ${esc(activeStay().village)}. Honest labels: strong riders vs casual.</p></div>
      ${groups.filter((g) => g[1].length).map((g) => `<div class="group-label">${esc(g[0])}</div><div class="cards">${g[1].map((a) => activityCard(a)).join('')}</div>`).join('')}
      <div class="group-label">Race spectating</div>
      ${races.map(eventRow).join('')}
      <div class="group-label">Logistics</div>
      <div class="info-card"><h3>Rental &amp; repair</h3><p>Le Deck / Cayoti at Plage de la Brune (Veyrier); road bikes in Annecy (Takamaka ~€59/day carbon); DH rigs at Les Gets (360 Outdoor, LoisiBike, Intersport). Book ahead in August.</p></div>
      <div class="info-card"><h3>Bikes on transport</h3><p>Navibus carries bikes (reportedly +€1 — verify); the Semnoz mountain bus takes MTBs (+€6). No bikes on the Lachat lift at Grand-Bornand.</p></div>
      <div class="info-card"><h3>Pump tracks &amp; skills</h3><p>Free at Duingt (year-round, on the greenway) and Argonay; bigger jumplines at Faverges-Seythenex. <a href="#/plan/pumptrack-duingt">Duingt details →</a></p></div>
      <p class="source-line">Route stats tie to a named start point and are checked against official sources — see any climb’s detail page.</p>`;
  };

  /* ---------- DISCOVER + category ----------------------------------- */
  Views.discover = function () {
    const worlds = D.CATEGORIES.map((c) => `<a class="world-card" href="#/category/${esc(c.id)}"><div class="world-cover">${cover(c.media, { tint: c.tint, emoji: c.emoji, label: c.title, alt: c.title })}</div><div class="world-body"><h3>${esc(c.title)}</h3><p>${esc(c.vibe)}</p></div></a>`).join('');
    const disc = D.DISCOVERIES.map((d) => `<a class="disc-card" href="${esc(d.route)}"><span class="disc-em" aria-hidden="true">${d.emoji}</span><strong>${esc(d.title)}</strong><span class="disc-text">${esc(d.text)}</span><span class="disc-go">Show me →</span></a>`).join('');
    const story = (arr) => arr.map((s) => `<div class="story-item"><span class="story-em" aria-hidden="true">${s.emoji}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></div>`).join('');
    return `
      <div class="detail-hero" style="min-height:150px">${cover({ photo: 'assets/wiki/lake-sunset.jpg' }, { alt: 'Sunset over the lake', eager: true, cls: 'cover-fill' })}<div class="dh-inner"><div class="dh-zone">Get inspired</div><h2 class="dh-h1">What kind of trip is this?</h2></div></div>
      <button class="btn block" id="surprise" type="button">🎲 Surprise me — 3 ideas</button>
      <div id="surprise-out"></div>
      <div class="section-head"><h2>The worlds nearby</h2></div>
      <div class="world-grid">${worlds}</div>
      <div class="section-head"><h2>You might not know you can…</h2></div>
      <div class="h-scroll">${disc}</div>
      <div class="section-head"><h2>The short story of the lake</h2></div>
      <div class="story">${story(D.STORY)}</div>
      <div class="section-head"><h2>The war in these mountains</h2></div>
      <div class="story">${story(D.HISTORY)}</div>
      <div class="actions" style="margin-top:.8rem"><a class="btn" href="#/plan/glieres-walk">🕊️ Go stand where it happened</a></div>
      ${creditsBlock()}
    `;
  };
  Views.category = function (route) {
    const c = D.CATEGORY_BY_ID[route.parts[0]]; if (!c) return `<div class="empty">Unknown category.</div>`;
    const base = activeBase(), dt = activeDate();
    const list = D.ACTIVITIES.filter((a) => availableNow(a, base, dt) && (a.themes || []).some((t) => c.themes.includes(t)));
    const other = D.ACTIVITIES.filter((a) => !availableNow(a, base, dt) && (a.themes || []).some((t) => c.themes.includes(t)));
    return `
      <div class="detail-hero cat" data-tint="${esc(c.tint)}">${cover(c.media, { tint: c.tint, emoji: c.emoji, alt: c.title, cls: 'cover-fill', eager: true })}<div class="dh-inner"><div class="dh-zone">${c.emoji} A kind of day</div><h2 class="dh-h1">${esc(c.title)}</h2></div></div>
      <p class="detail-lede">${esc(c.vibe)}</p>
      <p class="intro">${esc(c.looksLike)}</p>
      <div class="section-head"><h2>Available from ${esc(activeStay().village)} now</h2></div>
      <div class="cards">${list.length ? list.map((a) => activityCard(a)).join('') : '<div class="empty">Nothing from this base right now — try the other leg.</div>'}</div>
      ${other.length ? `<div class="section-head"><h2>Elsewhere on the trip</h2></div><div class="cards">${other.slice(0, 4).map((a) => activityCard(a)).join('')}</div>` : ''}
    `;
  };
  function creditsBlock() { return `<details class="credits"><summary>Photo credits (Wikimedia Commons)</summary><p>${D.CREDITS.map((c) => `<a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.subject)}</a> — ${esc(c.author)}, ${esc(c.license)}`).join(' · ')}</p></details>`; }
  function wireSurprise() {
    const btn = document.getElementById('surprise'), out = document.getElementById('surprise-out'); if (!btn || !out) return;
    btn.addEventListener('click', () => {
      const base = activeBase(), dt = activeDate();
      const cats = sample(D.CATEGORIES, 3);
      const picks = cats.map((c) => { const pool = D.ACTIVITIES.filter((a) => availableNow(a, base, dt) && (a.themes || []).some((t) => c.themes.includes(t))); return pool.length ? sample(pool, 1)[0] : null; }).filter(Boolean);
      out.innerHTML = `<div class="cards" style="margin-top:.7rem">${picks.map((a) => activityCard(a)).join('')}</div>`;
      announce('Three ideas: ' + picks.map((p) => p.title).join(', '));
    });
  }

  /* ---------- AREAS ------------------------------------------------- */
  Views.areas = function (route) {
    if (route.parts[0]) return Views.areaDetail(route.parts[0]);
    const cards = D.AREAS.map((a) => `<a class="area-card" href="#/areas/${esc(a.id)}"><div class="ac-img-wrap">${cover(coverOf(a), { emoji: '📍', label: a.name, alt: a.name, cls: 'ac-cover' })}</div><div class="ac-body"><div class="ac-zone">${esc(a.zone)}</div><h3>${esc(a.name)}</h3><p class="ac-why">${esc(a.why)}</p></div></a>`).join('');
    return `<div class="section-head" style="margin-top:.4rem"><h2>Around the lake &amp; beyond</h2></div><div class="cards" style="grid-template-columns:1fr">${cards}</div>`;
  };
  Views.areaDetail = function (id) {
    const a = D.AREA_BY_ID[id]; if (!a) return `<div class="empty">Unknown area.</div>`;
    const here = D.ACTIVITIES.filter((x) => x.areaId === id);
    return `<div class="detail-hero">${cover(coverOf(a), { emoji: '📍', label: a.name, alt: a.name, cls: 'cover-fill', eager: true })}<div class="dh-inner"><div class="dh-zone">${esc(a.zone)}</div><h2 class="dh-h1">${esc(a.name)}</h2></div></div>
      <p class="detail-lede">${esc(a.why)}</p>
      <div class="actions"><a class="btn" href="#/map?place=area-${esc(a.id)}">On map</a><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=${a.coords.join(',')}" target="_blank" rel="noopener">Directions ↗</a>${a.official ? `<a class="btn ghost" href="${esc(a.official)}" target="_blank" rel="noopener">Official ↗</a>` : ''}</div>
      ${here.length ? `<div class="section-head"><h2>Things to do here</h2></div><div class="cards">${here.map((x) => activityCard(x)).join('')}</div>` : ''}`;
  };

  /* ---------- TRIP LOGISTICS ---------------------------------------- */
  Views.trip = function () {
    const T = D.TRANSPORT;
    const stays = D.STAYS.map((s) => `<div class="stay-card"><div class="stay-top"><div><div class="ac-zone">${esc(s.legLabel)} · ${esc(s.village)}</div><h3>${esc(s.name)}</h3></div><span class="stay-dates">${esc(s.dates)}</span></div>
      <p class="stay-addr">📍 ${esc(s.address)}</p>
      <dl class="spec" style="margin:.5rem 0 .3rem"><dt>In</dt><dd>${esc(s.checkin)}</dd><dt>Out</dt><dd>${esc(s.checkout)}</dd></dl>
      <div class="ac-tags">${s.features.map((f) => `<span class="tag">${esc(f)}</span>`).join('')}</div>
      <div class="actions" style="margin:.7rem 0 0"><a class="btn ghost" href="#/map?place=${esc(s.id)}">On map</a><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}" target="_blank" rel="noopener">Directions ↗</a></div></div>`).join('');
    const flights = T.flights.map((f) => `<div class="flight-card"><div class="fc-top"><span class="fc-who">${f.dir === 'out' ? '🛬' : '🛫'} ${esc(f.who)}</span><span class="fc-date">${esc(f.date)}</span></div><div class="fc-route">${esc(f.legs)}</div><div class="fc-meta">${esc(f.flight)} · conf ${esc(f.conf)}</div>${f.note ? `<p class="fc-note">${esc(f.note)}</p>` : ''}</div>`).join('');
    const modes = D.TRANSPORT_GUIDE.modes.map((m) => `<div class="info-card"><h3>${esc(m.label)}</h3><p>${esc(m.summary)}${m.verifyBeforeGo ? ' <span class="pc-tag verify">Verify</span>' : ''}</p></div>`).join('');
    return `
      <div class="section-head" style="margin-top:.4rem"><h2>The shape of it</h2><p>${esc(D.TRIP.datesLabel)} — mountains first, then the lake.</p></div>
      <div class="section-head"><h2>Where you’re sleeping</h2></div>
      <div class="cards" style="grid-template-columns:1fr">${stays}</div>
      <div class="note-box">⏰ ${esc(T.departure)}</div>
      <div class="section-head"><h2>Getting there &amp; back</h2><p>${esc(T.privacyNote)}</p></div>
      <div class="flights">${flights}</div>
      <div class="stay-card"><div class="stay-top"><div><div class="ac-zone">The van · ${esc(T.car.conf)}</div><h3>${esc(T.car.name)}</h3></div></div><dl class="spec" style="margin:.5rem 0 .3rem"><dt>Pick up</dt><dd>${esc(T.car.pickup)}</dd><dt>Return</dt><dd>${esc(T.car.ret)}</dd><dt>Drivers</dt><dd>${esc(T.car.drivers)}</dd><dt>Included</dt><dd>${esc(T.car.includes)}</dd></dl><p class="fc-note">📍 ${esc(T.car.find)}</p></div>
      <div class="section-head"><h2>Getting around (no-car friendly)</h2><p>${esc(D.TRANSPORT_GUIDE.intro)}</p></div>
      ${modes}
      <div class="info-card"><h3>Parking &amp; traffic</h3><p>${esc(D.TRANSPORT_GUIDE.parking)}</p></div>
      <p class="source-line">Transport: <a href="${esc(D.SOURCES['mobilite'].url)}" target="_blank" rel="noopener">Grand Annecy Mobilités ↗</a> · checked ${esc(D.VERIFIED)}. Timetables change — verify exact times before travel.</p>`;
  };

  /* ---------- MAP (rebuilt) ----------------------------------------- */
  const MAP_CATS = [
    { id: 'stay', label: 'Stays', color: '#d1495b', emoji: '🏠' },
    { id: 'cycling', label: 'Cycling', color: '#2f6b4f', emoji: '🚴' },
    { id: 'water', label: 'Water & swim', color: '#2fb5c8', emoji: '🏊' },
    { id: 'hike', label: 'Hikes & views', color: '#6b4fa0', emoji: '🥾' },
    { id: 'adrenaline', label: 'Adrenaline', color: '#b0487d', emoji: '🪂' },
    { id: 'food', label: 'Food & drink', color: '#b35a1f', emoji: '🧀' },
    { id: 'culture', label: 'Culture & villages', color: '#1f7fb3', emoji: '🏛️' },
    { id: 'event', label: 'Events', color: '#114b73', emoji: '🏁' },
    { id: 'area', label: 'Towns', color: '#51697b', emoji: '📍' }
  ];
  function mapCatOf(a) {
    if (['swim', 'paddle', 'boat'].includes(a.cat)) return 'water';
    if (['road', 'gravel', 'mtb', 'easybike'].includes(a.cat)) return 'cycling';
    if (['hike', 'walk'].includes(a.cat)) return 'hike';
    if (['viaferrata', 'canyoning', 'paragliding', 'family'].includes(a.cat)) return 'adrenaline';
    if (['food', 'recovery'].includes(a.cat)) return 'food';
    if (['culture', 'village'].includes(a.cat)) return 'culture';
    return 'area';
  }
  // Every pin shows a symbol for its own activity type (bike, food, swim…),
  // so the map reads at a glance without opening anything.
  function pinEmoji(p) { return p.em || (MAP_CATS.find((c) => c.id === p.cat) || {}).emoji || '📍'; }
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
    D.STAYS.forEach((s) => out.push({ id: s.id, cat: 'stay', em: '🏠', name: s.name, coords: s.coords.slice(), blurb: `${s.village} · ${s.dates}`, sub: s.address, route: '#/trip', dir: s.coords }));
    D.ACTIVITIES.forEach((a) => { if (a.coords) out.push({ id: 'act-' + a.id, cat: mapCatOf(a), em: catEmoji(a.cat), name: a.title, coords: a.coords.slice(), blurb: a.summary, route: '#/plan/' + a.id, dir: a.coords, verify: !!a.verifyBeforeGo }); });
    (D.MAP_POIS || []).forEach((p) => out.push({ id: 'poi-' + p.id, cat: p.cat, em: p.em, name: p.name, coords: p.coords.slice(), blurb: p.blurb, sub: p.note, route: p.route || null, href: p.href || null, dir: p.coords, verify: !!p.verify, closed: !!p.closed }));
    D.EVENTS.forEach((e) => { if (e.coords) out.push({ id: 'ev-' + e.id, cat: 'event', em: '🏁', name: e.name, coords: e.coords.slice(), blurb: e.datesLabel, route: '#/event/' + e.id, dir: e.coords }); });
    D.AREAS.forEach((a) => out.push({ id: 'area-' + a.id, cat: 'area', em: '📍', name: a.name, coords: a.coords.slice(), blurb: a.zone, route: '#/areas/' + a.id, dir: a.coords }));
    return deoverlap(out);
  }
  let mapInstance = null, mapMarkers = {}, mapState = null;

  Views.map = function (route) {
    const active = new Set(MAP_CATS.map((c) => c.id));
    if (route.query.cat && MAP_CATS.some((c) => c.id === route.query.cat)) { active.clear(); active.add(route.query.cat); }
    mapState = { active, focus: route.query.place || null };
    const places = mapPlaces();
    const counts = {}; MAP_CATS.forEach((c) => counts[c.id] = places.filter((p) => p.cat === c.id).length);
    const chips = `<button class="map-chip" data-cat="all" aria-pressed="${active.size === MAP_CATS.length}"><span class="cdot"></span>All</button>` +
      MAP_CATS.map((c) => `<button class="map-chip" data-cat="${c.id}" aria-pressed="${active.has(c.id)}" style="--cat:${c.color}"><span class="chip-em" aria-hidden="true">${c.emoji}</span>${esc(c.label)} <span class="mc-count">${counts[c.id]}</span></button>`).join('');
    return `
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
          <span class="arch-em" aria-hidden="true">${a.em || '🗄️'}</span>
          <div class="arch-body">
            <strong>${esc(a.name)}</strong>
            <p>${esc(a.reason)}</p>
            ${a.href ? `<a class="pop-link" href="${esc(a.href)}" target="_blank" rel="noopener">Source ↗</a>` : ''}
          </div>
        </div>`).join('')}` : '';
    return `
      <section class="wrap">
        <h2>The cut list 🗄️</h2>
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
  function renderMapList(places) {
    const el = document.getElementById('map-list'); if (!el) return;
    const shown = places.filter((p) => mapState.active.has(p.cat));
    if (!shown.length) { el.innerHTML = `<div class="empty">No places in the selected filters. <button class="link-btn" id="ml-reset">Reset filters</button></div>`; const r = document.getElementById('ml-reset'); if (r) r.addEventListener('click', () => { mapState.active = new Set(MAP_CATS.map((c) => c.id)); applyMap(places); }); return; }
    const cat = Object.fromEntries(MAP_CATS.map((c) => [c.id, c]));
    el.innerHTML = shown.map((p) => `<button class="ml-item${p.closed ? ' is-closed' : ''}" data-mid="${esc(p.id)}"><span class="ml-em${p.closed ? ' closed' : ''}" style="border-color:${cat[p.cat].color}" aria-hidden="true">${pinEmoji(p)}</span><span class="ml-body"><strong>${esc(p.name)}${p.closed ? ' <span class="closed-chip">Closed</span>' : ''}</strong><span>${esc(p.blurb)}</span></span></button>`).join('') +
      `<a class="ml-archive" href="#/archive">🗄️ Not on this map — the cut list & why →</a>`;
    el.querySelectorAll('[data-mid]').forEach((b) => b.addEventListener('click', () => focusMarker(b.dataset.mid)));
  }
  function focusMarker(id) {
    const mk = mapMarkers[id]; if (!mk || !mapInstance) { const p = mapPlaces().find((x) => x.id === id); if (p) location.hash = p.route; return; }
    mapInstance.setView(mk.marker.getLatLng(), 14); mk.marker.openPopup();
  }
  function applyMap(places) {
    if (mapInstance) Object.values(mapMarkers).forEach(({ marker, cat }) => { const on = mapState.active.has(cat); if (on && !mapInstance.hasLayer(marker)) marker.addTo(mapInstance); else if (!on && mapInstance.hasLayer(marker)) mapInstance.removeLayer(marker); });
    document.querySelectorAll('#map-filters .map-chip').forEach((c) => { const id = c.dataset.cat; if (id === 'all') c.setAttribute('aria-pressed', String(mapState.active.size === MAP_CATS.length)); else c.setAttribute('aria-pressed', String(mapState.active.has(id))); });
    renderMapList(places);
  }
  function initMapView(route) {
    const places = mapPlaces();
    // wire filters + tools (work even if the map lib fails)
    const filters = document.getElementById('map-filters');
    filters.addEventListener('click', (e) => { const b = e.target.closest('.map-chip'); if (!b) return; const id = b.dataset.cat; if (id === 'all') { mapState.active = new Set(MAP_CATS.map((c) => c.id)); } else { if (mapState.active.has(id)) mapState.active.delete(id); else mapState.active.add(id); } applyMap(places); });
    document.getElementById('map-reset').addEventListener('click', () => { mapState.active = new Set(MAP_CATS.map((c) => c.id)); applyMap(places); });
    document.getElementById('map-base').addEventListener('click', () => { if (mapInstance) mapInstance.setView(activeStay().coords, 13); });
    renderMapList(places);

    ensureLeaflet().then((ok) => {
      const mapEl = document.getElementById('map'); if (!mapEl) return;
      if (!ok || !window.L) { mapEl.innerHTML = `<div class="map-offline"><p><strong>Map needs a connection.</strong> The place list on the right still works offline — tap any item for directions and details.</p></div>`; return; }
      const cat = Object.fromEntries(MAP_CATS.map((c) => [c.id, c]));
      const map = L.map('map', { scrollWheelZoom: true, zoomControl: true }).setView(activeStay().coords, 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
      mapMarkers = {};
      places.forEach((p) => {
        const c = cat[p.cat];
        const icon = L.divIcon({ className: 'mk-wrap', html: `<div class="mk${p.closed ? ' closed' : ''}" style="--cat:${c.color}"><span class="g" aria-hidden="true">${pinEmoji(p)}</span>${p.closed ? '<span class="mk-no" aria-hidden="true">⛔</span>' : ''}</div>`, iconSize: [32, 38], iconAnchor: [16, 36], popupAnchor: [0, -32] });
        const dir = (p.dir && !p.closed) ? `<a class="pop-link" href="https://www.google.com/maps/dir/?api=1&origin=${activeStay().coords.join(',')}&destination=${p.dir.join(',')}" target="_blank" rel="noopener">Directions ↗</a>` : '';
        const open = p.route ? `<a class="pop-link" href="${esc(p.route)}" data-nav-link>Open</a>` : (p.href ? `<a class="pop-link" href="${esc(p.href)}" target="_blank" rel="noopener">Official ↗</a>` : '');
        const verify = p.verify && !p.closed ? `<span class="verify-badge">Verify before going</span> ` : '';
        const closedB = p.closed ? `<span class="closed-badge">⛔ Closed — don’t plan around this</span> ` : '';
        const html = `<div class="pop" style="--cat:${c.color}"><span class="pc">${pinEmoji(p)} ${esc(c.label)}</span><h3>${esc(p.name)}</h3><p>${closedB}${verify}${esc(p.blurb)}</p>${p.sub ? `<p class="pop-sub">${esc(p.sub)}</p>` : ''}${open} ${dir}</div>`;
        const m = L.marker(p.coords, { icon, title: p.name, alt: p.name, keyboard: true }).addTo(map);
        m.bindPopup(html, { closeButton: true, maxWidth: 250, minWidth: 200 });
        mapMarkers[p.id] = { marker: m, cat: p.cat };
      });
      map.on('popupopen', (e) => { const el = e.popup.getElement(); if (!el) return; el.querySelectorAll('a[data-nav-link]').forEach((a) => a.addEventListener('click', (ev) => { const h = a.getAttribute('href'); if (h && h[0] === '#') { ev.preventDefault(); location.hash = h; } })); });
      mapInstance = map;
      applyMap(places);
      setTimeout(() => map.invalidateSize(), 80);
      setTimeout(() => {
        map.invalidateSize();
        if (mapState.focus && mapMarkers[mapState.focus]) { const mk = mapMarkers[mapState.focus]; map.setView(mk.marker.getLatLng(), 14); setTimeout(() => mk.marker.openPopup(), 150); }
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
  function teardownMap() { if (mapInstance) { mapInstance.remove(); mapInstance = null; mapMarkers = {}; } }

  /* =========================== router =============================== */
  function parse() {
    let h = location.hash.replace(/^#\/?/, '');
    if (!h) return { name: 'today', parts: [], query: {} };
    const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean); const query = {};
    if (qs) qs.split('&').forEach((kv) => { const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { name: parts[0] || 'today', parts: parts.slice(1), query };
  }
  const ALIAS = { home: 'today', day: 'browse' };
  function render() {
    let route = parse();
    if (ALIAS[route.name]) route.name = ALIAS[route.name];
    teardownMap();
    const view = Views[route.name] || Views.today;
    screenEl.innerHTML = view(route);
    screenEl.className = 'screen' + (route.name === 'map' ? ' is-map' : '');
    setChrome(route);
    window.scrollTo(0, 0); screenEl.scrollTop = 0;
    // focus management for hash-route changes
    const h = screenEl.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    announce(TITLES[route.name] || 'Page');
    // wiring
    if (route.name === 'today') { wireContextBar(); }
    if (route.name === 'build') wireBuild(route);
    if (route.name === 'browse' || (route.name === 'plan' && route.query.must)) wireBrowse();
    if (route.name === 'plan' && route.parts[0]) wireActivity();
    if (route.name === 'timeline') wireTimeline();
    if (route.name === 'saved') wireSaved();
    if (route.name === 'search') wireSearch();
    if (route.name === 'discover') wireSurprise();
    if (route.name === 'bike') wireContextBar();
    if (route.name === 'map') initMapView(route);
  }

  /* ---------- appbar back ------------------------------------------- */
  document.getElementById('ab-back').addEventListener('click', () => { if (history.length > 1) history.back(); else location.hash = '#/today'; });
  window.addEventListener('hashchange', render);
  render();

  /* ---------- offline indicator ------------------------------------- */
  const offbar = document.getElementById('offline-bar');
  function setOffline() { if (offbar) offbar.hidden = navigator.onLine; }
  window.addEventListener('online', setOffline); window.addEventListener('offline', setOffline); setOffline();

  /* ---------- service worker + update toast ------------------------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing; if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              const toast = document.getElementById('sw-toast'); if (toast) { toast.hidden = false; const btn = document.getElementById('sw-reload'); if (btn) btn.onclick = () => { nw.postMessage('skip-waiting'); toast.hidden = true; }; }
            }
          });
        });
      }).catch(() => {});
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; location.reload(); });
    });
  }
})();
