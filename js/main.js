/* AceTech Appliance Repair — interactivity (shared client design system) */
(function () {
  'use strict';

  // Preloader — hide once the page has loaded
  var preloader = document.getElementById('preloader');
  if (preloader) {
    document.documentElement.classList.add('no-scroll');
    var hidePreloader = function () {
      preloader.classList.add('is-hidden');
      document.documentElement.classList.remove('no-scroll');
      setTimeout(function () { if (preloader.parentNode) preloader.remove(); }, 600);
    };
    window.addEventListener('load', function () {
      setTimeout(hidePreloader, 1400);
    });
    setTimeout(hidePreloader, 4000);
  }

  // Mobile menu toggle
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      });
    });
  }

  // FAQ accordion — keep only one open at a time
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // How-it-works carousel (single card, arrow navigation)
  var hiwSection = document.querySelector('.hiw');
  if (hiwSection) {
    var steps = [
      { num: '01', title: 'Book Online or Call', desc: 'Tell us the appliance and what\u2019s going wrong. Most calls get a same-day visit.' },
      { num: '02', title: 'Clear Diagnosis', desc: 'A certified technician finds the real cause and gives you an upfront price. Nothing starts until you approve it.' },
      { num: '03', title: 'Fixed on the First Visit', desc: 'We arrive with the parts and tools most repairs need, so you don\u2019t wait for a second trip.' },
      { num: '04', title: '180-Day Guarantee', desc: 'Every repair is backed by our 180-day guarantee. If the same issue comes back, so do we.' }
    ];
    var hiwCardInner = hiwSection.querySelector('.hiw-card-inner');
    var hiwCur = hiwSection.querySelector('.hiw-cur');
    var hiwFill = hiwSection.querySelector('.hiw-progress-fill');
    var hiwPrev = hiwSection.querySelector('.hiw-arrow-prev');
    var hiwNext = hiwSection.querySelector('.hiw-arrow-next');
    var hiwAnimTimer;
    var hiwStep = 0;
    var hiwStepTime = 0;

    function hiwRender(index, direction) {
      clearTimeout(hiwAnimTimer);
      var s = steps[index];
      var exitX = direction === 'down' ? '-40px' : '40px';
      var enterX = direction === 'down' ? '40px' : '-40px';

      hiwCardInner.style.transition = 'opacity .28s ease-in, transform .28s ease-in';
      hiwCardInner.style.opacity = '0';
      hiwCardInner.style.transform = 'translateX(' + exitX + ')';

      hiwCur.textContent = String(index + 1);
      hiwFill.style.width = ((index + 1) / steps.length * 100) + '%';

      hiwAnimTimer = setTimeout(function () {
        hiwCardInner.querySelector('.hiw-num').textContent = s.num;
        hiwCardInner.querySelector('.hiw-title').textContent = s.title;
        hiwCardInner.querySelector('.hiw-desc').textContent = s.desc;

        hiwCardInner.style.transition = 'none';
        hiwCardInner.style.transform = 'translateX(' + enterX + ')';
        void hiwCardInner.offsetHeight;

        hiwCardInner.style.transition = 'opacity .5s cubic-bezier(.22,.61,.36,1), transform .5s cubic-bezier(.22,.61,.36,1)';
        hiwCardInner.style.opacity = '1';
        hiwCardInner.style.transform = 'translateX(0)';
        hiwUpdateArrows();
      }, 280);
    }

    function hiwUpdateArrows() {
      if (hiwPrev) hiwPrev.classList.toggle('is-disabled', hiwStep <= 0);
      if (hiwNext) hiwNext.classList.toggle('is-disabled', hiwStep >= steps.length - 1);
    }

    function hiwSetStep(index) {
      var s = steps[index];
      hiwCardInner.querySelector('.hiw-num').textContent = s.num;
      hiwCardInner.querySelector('.hiw-title').textContent = s.title;
      hiwCardInner.querySelector('.hiw-desc').textContent = s.desc;
      hiwCardInner.style.transition = 'none';
      hiwCardInner.style.opacity = '1';
      hiwCardInner.style.transform = 'translateX(0)';
      hiwCur.textContent = String(index + 1);
      hiwFill.style.width = ((index + 1) / steps.length * 100) + '%';
      hiwUpdateArrows();
    }

    if (hiwPrev) {
      hiwPrev.addEventListener('click', function () {
        if (hiwStep <= 0 || Date.now() - hiwStepTime < 700) return;
        hiwStepTime = Date.now();
        hiwStep--;
        hiwRender(hiwStep, 'up');
      });
    }
    if (hiwNext) {
      hiwNext.addEventListener('click', function () {
        if (hiwStep >= steps.length - 1 || Date.now() - hiwStepTime < 700) return;
        hiwStepTime = Date.now();
        hiwStep++;
        hiwRender(hiwStep, 'down');
      });
    }
    hiwUpdateArrows();
  }

  // Service accordion panels
  var panels = document.querySelectorAll('.svc-panel');
  var prevBtn = document.querySelector('.svc-arrow-prev');
  var nextBtn = document.querySelector('.svc-arrow-next');

  function activatePanel(index) {
    panels.forEach(function (p) { p.classList.remove('active'); });
    panels[index].classList.add('active');
  }
  function getActiveIndex() {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].classList.contains('active')) return i;
    }
    return 0;
  }

  panels.forEach(function (panel) {
    panel.addEventListener('click', function (e) {
      if (e.target.closest('.svc-panel-link')) return;
      activatePanel(Array.prototype.indexOf.call(panels, panel));
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      var idx = getActiveIndex();
      activatePanel(idx > 0 ? idx - 1 : panels.length - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var idx = getActiveIndex();
      activatePanel(idx < panels.length - 1 ? idx + 1 : 0);
    });
  }

  // Animated counters (bento cards)
  var counters = document.querySelectorAll('.bento-num');
  var counterDone = false;
  function animateCounters() {
    if (counterDone) return;
    counterDone = true;
    counters.forEach(function (el) {
      var target = parseFloat(el.dataset.target);
      var prefix = el.dataset.prefix || '';
      var suffix = el.dataset.suffix || '';
      var decimals = parseInt(el.dataset.decimals) || 0;
      var duration = 1800;
      var start = performance.now();
      function tick(now) {
        var t = Math.min((now - start) / duration, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        var val = (ease * target).toFixed(decimals);
        el.textContent = prefix + val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if (counters.length) {
    var bentoSection = document.querySelector('.commercial-bento');
    if (bentoSection && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
      }, { threshold: 0.3 }).observe(bentoSection);
    }
  }

  // Service-area map (MapLibre GL). Zone = the 3 polygons from the live site's
  // Google My Map ("Acetech Covering Area"), same colour (#0288D1) and opacities.
  // Basemap: CARTO Voyager (vector) with our key; falls back to Esri if CARTO refuses.
  var mapEl = document.getElementById('serviceMap');
  if (mapEl && window.maplibregl) {
    var CARTO_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=cb1_3hzx_4_ff536d6e72f360ca22ad2ef9';
    var esriStyle = {
      version: 8,
      sources: {
        base: { type: 'raster', tileSize: 256, maxzoom: 16, attribution: 'Tiles &copy; Esri',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'] },
        labels: { type: 'raster', tileSize: 256, maxzoom: 16,
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}'] }
      },
      layers: [{ id: 'base', type: 'raster', source: 'base' }, { id: 'labels', type: 'raster', source: 'labels' }]
    };
    var bounds = [[-122.45, 37.62], [-121.08, 38.8]];

    var addZone = function (map) {
      fetch('/acetech-preview/assets/service-area.geojson').then(function (r) { return r.json(); }).then(function (gj) {
        map.addSource('zone', { type: 'geojson', data: gj });
        // soft outer glow, calm single fill, crisp brand outline
        map.addLayer({ id: 'zone-glow', type: 'line', source: 'zone',
          paint: { 'line-color': '#4570B3', 'line-width': 14, 'line-opacity': 0.14, 'line-blur': 8 } });
        map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zone',
          paint: { 'fill-color': '#4570B3', 'fill-opacity': 0.2 } });
        map.addLayer({ id: 'zone-line', type: 'line', source: 'zone',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#30347D', 'line-width': 2.2, 'line-opacity': 0.85 } });
      });
      var el = document.createElement('div'); el.className = 'map-home';
      new maplibregl.Marker({ element: el }).setLngLat([-121.237813, 38.662769])
        .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML('<strong>AceTech Appliance Repair</strong><br>5350 Nugget Rd, Fair Oaks, CA'))
        .addTo(map);
    };

    var build = function (style) {
      var map = new maplibregl.Map({
        container: mapEl, style: style, bounds: bounds, fitBoundsOptions: { padding: { top: 30, bottom: 70, left: 30, right: 30 } },
        scrollZoom: false, dragRotate: false, pitchWithRotate: false, attributionControl: { compact: true }
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
      mapEl.__map = map;   // handy for debugging zoomed views
      map.touchZoomRotate.disableRotation();
      // fit the zone once the map knows its real size, and again whenever the layout changes
      var fit = function () {
        var w = mapEl.clientWidth, pad = w < 520 ? 12 : 30;
        map.resize();
        map.fitBounds(bounds, { padding: { top: pad, bottom: pad + 40, left: pad, right: pad }, animate: false });
      };
      window.addEventListener('resize', fit);
      map.on('load', function () {
        fit();
        addZone(map);
        // keep the required map credit collapsed behind the small "i" button
        var attr = mapEl.querySelector('.maplibregl-ctrl-attrib');
        if (attr) attr.classList.remove('maplibregl-compact-show');
      });
      return map;
    };

    // Probe the CARTO key first so a refused key never shows "API KEY REQUIRED" tiles
    fetch(CARTO_STYLE).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (style) { build(style); })
      .catch(function () { build(esriStyle); });
  }

  // Services 3D card fan: the active card grows, neighbours turn toward it,
  // and the card under the pointer tilts with spring physics + a moving glare.
  // Performance: pointer events only record coordinates; one rAF loop reads the
  // card rect once per frame and writes nothing but `transform` (GPU-composited).
  var fan = document.querySelector('.svc-fan');
  if (fan) {
    var cards = Array.prototype.slice.call(fan.querySelectorAll('.svc-card'));
    var curEl = document.querySelector('.svc-fan-cur');
    var phoneMq = window.matchMedia('(max-width: 760px)');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var active = 0;

    // Desktop layout: absolute positions + scale, recomputed for the container width
    var GAP = 16, BASE = 310, boxes = [];   // BASE = rendered card width (css)
    var layout = function () {
      if (phoneMq.matches) {
        boxes = [];
        cards.forEach(function (c) { c.style.transform = ''; });
        return;
      }
      var W = fan.clientWidth, n = cards.length;
      var big = Math.min(BASE, W * 0.27);                      // active card width
      var small = Math.min(big * 0.6, (W - big - (n - 1) * GAP) / (n - 1));
      var s = small / BASE, sb = big / BASE;
      var x = (W - (big + small * (n - 1) + GAP * (n - 1))) / 2;
      boxes = [];
      cards.forEach(function (c, k) {
        var w = k === active ? big : small, d = k - active;
        boxes.push([x - GAP / 2, x + w + GAP / 2]);   // resting box incl. half the gap
        var ry = Math.max(-20, Math.min(20, -d * 6)), z = -Math.abs(d) * 22;
        c.style.transform = 'translate3d(' + (x + w / 2 - BASE / 2).toFixed(1) + 'px,0,' + z + 'px) rotateY(' + ry + 'deg) scale(' + (k === active ? sb : s).toFixed(3) + ')';
        x += w + GAP;
      });
    };

    var setActive = function (i, scroll) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      active = i;
      cards.forEach(function (c, k) { c.classList.toggle('is-active', k === active); });
      layout();
      if (curEl) curEl.textContent = '0' + (active + 1);
      if (scroll && phoneMq.matches) {
        var c = cards[active];
        fan.scrollTo({ left: c.offsetLeft - (fan.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
      }
    };
    window.addEventListener('resize', function () { layout(); });
    // decode the photos up front so the first hover never waits on image decoding
    cards.forEach(function (c) { var im = c.querySelector('img'); if (im && im.decode) im.decode().catch(function () {}); });
    cards[0].classList.remove('is-active');
    setActive(0);
    phoneMq.addEventListener('change', function () { setActive(active); });

    var prev = document.querySelector('.svc-fan-prev');
    var next = document.querySelector('.svc-fan-next');
    if (prev) prev.addEventListener('click', function () { setActive(active > 0 ? active - 1 : cards.length - 1, true); });
    if (next) next.addEventListener('click', function () { setActive(active < cards.length - 1 ? active + 1 : 0, true); });

    // Phones: the card closest to the centre of the swipe row is the active one
    var scrollTimer;
    fan.addEventListener('scroll', function () {
      if (!phoneMq.matches) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var mid = fan.scrollLeft + fan.clientWidth / 2, best = 0, bestDist = Infinity;
        cards.forEach(function (c, k) {
          var dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
          if (dist < bestDist) { bestDist = dist; best = k; }
        });
        setActive(best);
      }, 80);
    }, { passive: true });

    // ---- Tilt (damped spring per card) ----
    var MAX = 13;
    var states = cards.map(function (c) {
      return { card: c, inner: c.querySelector('.svc-card-inner'), glare: c.querySelector('.svc-card-glare'),
               x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, gx: 0, gy: 0, px: -1, py: -1, idle: true };
    });
    var hovered = null, raf = 0;

    var frame = function () {
      raf = 0;
      var busy = false;
      // read: one rect for the hovered card (outer box, so the tilt never feeds back)
      if (hovered && hovered.px >= 0) {
        var r = hovered.card.getBoundingClientRect();
        var nx = Math.min(1, Math.max(0, (hovered.px - r.left) / r.width));
        var ny = Math.min(1, Math.max(0, (hovered.py - r.top) / r.height));
        // pointer in the top-right corner pushes that corner away from the viewer
        hovered.tx = reduced ? 0 : (0.5 - ny) * 2 * MAX;
        hovered.ty = reduced ? 0 : (nx - 0.5) * 2 * MAX;
        hovered.gx = (nx - 0.5) * r.width;
        hovered.gy = (ny - 0.5) * r.height;
      }
      // write: transforms only
      states.forEach(function (st) {
        if (st.idle && st !== hovered) return;
        st.vx = (st.vx + (st.tx - st.x) * 0.14) * 0.74;
        st.vy = (st.vy + (st.ty - st.y) * 0.14) * 0.74;
        st.x += st.vx; st.y += st.vy;
        var settled = Math.abs(st.vx) + Math.abs(st.vy) + Math.abs(st.tx - st.x) + Math.abs(st.ty - st.y) < 0.02;
        if (settled) { st.x = st.tx; st.y = st.ty; }
        st.inner.style.transform = 'rotateX(' + st.x.toFixed(2) + 'deg) rotateY(' + st.y.toFixed(2) + 'deg)';
        if (st.glare) st.glare.style.transform = 'translate3d(' + st.gx.toFixed(1) + 'px,' + st.gy.toFixed(1) + 'px,0)';
        st.idle = settled && st !== hovered;
        if (!st.idle) busy = true;
      });
      if (busy) raf = requestAnimationFrame(frame);
    };
    var wake = function () { if (!raf) raf = requestAnimationFrame(frame); };

    // One pointer handler for the whole fan. Which card the pointer "means" is
    // decided from the cards' resting boxes (not the cards mid-animation), so the
    // switch is instant and can't ping-pong while cards slide.
    var setHovered = function (st) {
      if (hovered === st) return;
      if (hovered) {
        hovered.card.classList.remove('is-hover');
        hovered.tx = 0; hovered.ty = 0; hovered.px = -1; hovered.idle = false;
      }
      hovered = st;
      if (st) { st.card.classList.add('is-hover'); st.idle = false; }
      wake();
    };
    var pick = function (clientX, clientY) {
      var r = fan.getBoundingClientRect(), lx = clientX - r.left;
      if (clientY < r.top || clientY > r.bottom) return -1;
      for (var k = 0; k < boxes.length; k++) if (lx >= boxes[k][0] && lx < boxes[k][1]) return k;
      return -1;
    };
    fan.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || phoneMq.matches) return;
      var k = pick(e.clientX, e.clientY);
      if (k < 0) { setHovered(null); return; }
      if (k !== active) setActive(k);
      setHovered(states[k]);
      states[k].px = e.clientX; states[k].py = e.clientY;
      wake();
    }, { passive: true });
    fan.addEventListener('pointerleave', function () { setHovered(null); });

    // Touch (phones/tablets): tilt the touched card while the finger is on it
    states.forEach(function (st, k) {
      st.card.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse') return;
        setHovered(st); st.px = e.clientX; st.py = e.clientY; wake();
      });
      st.card.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'mouse' || hovered !== st) return;
        st.px = e.clientX; st.py = e.clientY; wake();
      }, { passive: true });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
        st.card.addEventListener(t, function (e) { if (e.pointerType !== 'mouse' && hovered === st) setHovered(null); });
      });
      st.card.addEventListener('focus', function () { setActive(k, true); });
    });
  }

  // Pricing van: drive in once, when the scene scrolls into view
  var vanScene = document.querySelector('.van-scene');
  if (vanScene && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    vanScene.classList.add('is-ready');
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { vanScene.classList.add('is-driving'); obs.disconnect(); }
    }, { threshold: 0.45 }).observe(vanScene);
  }

  // How it works: draw dashed connectors from the gear to each step card
  var gwStage = document.querySelector('.gw-stage');
  if (gwStage) {
    var NS = 'http://www.w3.org/2000/svg';
    var gwSvg = gwStage.querySelector('.gw-links');
    var gwHub = gwStage.querySelector('.gw-hub');
    var gwSteps = Array.prototype.slice.call(gwStage.querySelectorAll('.gw-step'));
    var gwPaths = [];
    var drawLinks = function () {
      while (gwSvg.firstChild) gwSvg.removeChild(gwSvg.firstChild);
      gwPaths = [];
      if (getComputedStyle(gwSvg).display === 'none') return;
      var S = gwStage.getBoundingClientRect(), H = gwHub.getBoundingClientRect();
      var cx = H.left + H.width / 2 - S.left, cy = H.top + H.height / 2 - S.top, R = H.width * 0.47;
      gwSteps.forEach(function (card) {
        var C = card.getBoundingClientRect();
        var left = C.left + C.width / 2 < H.left + H.width / 2;
        var top = C.top + C.height / 2 < cy + S.top;
        // start: middle of the card's side facing the gear
        var x1 = (left ? C.right : C.left) - S.left + (left ? 8 : -8);
        var y1 = C.top + C.height / 2 - S.top;
        // end: on the gear rim, toward that corner
        var ang = Math.atan2(top ? -0.62 : 0.62, left ? -1 : 1);
        var x2 = cx + Math.cos(ang) * R, y2 = cy + Math.sin(ang) * R;
        // elbow: horizontal out of the card, rounded turn, then into the gear
        var mx = x1 + (x2 - x1) * 0.55;
        var d = 'M' + x1 + ' ' + y1 + ' L' + (mx - (left ? 18 : -18)) + ' ' + y1 +
                ' Q' + mx + ' ' + y1 + ' ' + mx + ' ' + (y1 + (y2 > y1 ? 18 : -18)) +
                ' L' + mx + ' ' + (y2 - (y2 > y1 ? 18 : -18)) +
                ' Q' + mx + ' ' + y2 + ' ' + (mx + (x2 > mx ? 18 : -18)) + ' ' + y2 +
                ' L' + x2 + ' ' + y2;
        var path = document.createElementNS(NS, 'path'); path.setAttribute('d', d);
        var d1 = document.createElementNS(NS, 'circle'); d1.setAttribute('cx', x1); d1.setAttribute('cy', y1); d1.setAttribute('r', 4.5);
        var d2 = document.createElementNS(NS, 'circle'); d2.setAttribute('cx', x2); d2.setAttribute('cy', y2); d2.setAttribute('r', 4.5);
        gwSvg.appendChild(path); gwSvg.appendChild(d1); gwSvg.appendChild(d2);
        gwPaths.push([path, d1, d2]);
      });
    };
    gwSteps.forEach(function (card, i) {
      card.addEventListener('mouseenter', function () { (gwPaths[i] || []).forEach(function (el) { el.classList.add('is-on'); }); });
      card.addEventListener('mouseleave', function () { (gwPaths[i] || []).forEach(function (el) { el.classList.remove('is-on'); }); });
    });
    drawLinks();
    window.addEventListener('resize', drawLinks);
    window.addEventListener('load', drawLinks);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLinks);
  }

  // Single tilt cards (service page hero photo): same spring tilt as the services fan
  document.querySelectorAll('.tilt-card').forEach(function (card) {
    var inner = card.querySelector('.tilt-inner'), glare = card.querySelector('.tilt-glare');
    var reducedT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, px: -1, py: -1 }, rafT = 0, MAXT = 12;
    var tick = function () {
      rafT = 0;
      if (st.px >= 0) {
        var r = card.getBoundingClientRect();
        var nx = Math.min(1, Math.max(0, (st.px - r.left) / r.width)), ny = Math.min(1, Math.max(0, (st.py - r.top) / r.height));
        st.tx = reducedT ? 0 : (0.5 - ny) * 2 * MAXT; st.ty = reducedT ? 0 : (nx - 0.5) * 2 * MAXT;
        if (glare) glare.style.transform = 'translate3d(' + ((nx - 0.5) * r.width).toFixed(1) + 'px,' + ((ny - 0.5) * r.height).toFixed(1) + 'px,0)';
      }
      st.vx = (st.vx + (st.tx - st.x) * 0.14) * 0.74; st.vy = (st.vy + (st.ty - st.y) * 0.14) * 0.74;
      st.x += st.vx; st.y += st.vy;
      inner.style.transform = 'rotateX(' + st.x.toFixed(2) + 'deg) rotateY(' + st.y.toFixed(2) + 'deg)';
      if (st.px >= 0 || Math.abs(st.vx) + Math.abs(st.vy) + Math.abs(st.tx - st.x) + Math.abs(st.ty - st.y) > 0.02) rafT = requestAnimationFrame(tick);
    };
    var wakeT = function () { if (!rafT) rafT = requestAnimationFrame(tick); };
    card.addEventListener('pointermove', function (e) { st.px = e.clientX; st.py = e.clientY; card.classList.add('is-hover'); wakeT(); }, { passive: true });
    card.addEventListener('pointerleave', function () { st.px = -1; st.tx = 0; st.ty = 0; card.classList.remove('is-hover'); wakeT(); });
  });

  // Article pages: reading progress bar + table of contents that follows the reader
  var progress = document.querySelector('.read-progress span');
  var arBody = document.querySelector('.ar-body');
  if (progress && arBody) {
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.ar-toc a'));
    var heads = tocLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var toc = document.querySelector('.ar-toc');
    if (toc) document.documentElement.style.setProperty('--toc-h', (toc.offsetHeight + 18) + 'px');
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = arBody.getBoundingClientRect(), total = r.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      var current = 0;
      heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < 140) current = i; });
      tocLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Blog index: category filter chips
  var chips = document.querySelectorAll('.bl-chip');
  if (chips.length) {
    var blCards = document.querySelectorAll('.bl-grid .ar-card');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.dataset.filter;
        chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
        blCards.forEach(function (card) { card.hidden = f !== 'all' && card.dataset.cat !== f; });
      });
    });
  }

  // Certificate lightbox (About page)
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
    var closeLb = function () { lb.hidden = true; document.documentElement.classList.remove('no-scroll'); };
    document.querySelectorAll('.ab-cert').forEach(function (b) {
      b.addEventListener('click', function () {
        lbImg.src = b.dataset.full; lbImg.alt = b.dataset.caption; lbCap.innerHTML = b.dataset.caption;
        lb.hidden = false; document.documentElement.classList.add('no-scroll');
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox-close')) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  // "Open now / Closed" badge (Pacific time): Mon–Fri 8–18, closed on weekends
  document.querySelectorAll('[data-open-status]').forEach(function (el) {
    var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    var d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var open = d >= 1 && d <= 5 && h >= 8 && h < 18;
    el.textContent = open ? 'Open now' : 'Closed now · we\u2019ll call back';
    el.classList.add(open ? 'is-open' : 'is-closed');
  });

  // Careers application: 4 steps, per-step validation, live progress bar
  var jbForm = document.querySelector('.jb-form');
  if (jbForm) {
    var jbSteps = Array.prototype.slice.call(jbForm.querySelectorAll('.jb-step'));
    var jbBar = document.querySelector('.jb-progress-bar');
    var jbLabel = document.querySelector('.jb-progress-label');
    var jbPct = document.querySelector('.jb-progress-pct');
    var jbBack = jbForm.querySelector('.jb-back'), jbNext = jbForm.querySelector('.jb-next'), jbSubmit = jbForm.querySelector('.jb-submit');
    var jbErr = jbForm.querySelector('.jb-error');
    var jbAt = 0;

    var answered = function (q) {
      var inputs = q.querySelectorAll('input, select, textarea');
      if (!inputs.length) return false;
      var t = inputs[0].type;
      if (t === 'radio' || t === 'checkbox') return Array.prototype.some.call(inputs, function (i) { return i.checked; });
      return inputs[0].value.trim() !== '' && (inputs[0].type !== 'tel' || (inputs[0].value.match(/\d/g) || []).length >= 7);
    };
    var isRequired = function (q) { return !!q.querySelector('[required]'); };
    // progress = share of all questions answered (required ones count double)
    var updateProgress = function () {
      var total = 0, done = 0;
      jbForm.querySelectorAll('[data-q]').forEach(function (q) {
        var w = isRequired(q) ? 2 : 1; total += w; if (answered(q)) done += w;
      });
      var p = total ? done / total : 0;
      jbBar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      jbPct.textContent = Math.round(p * 100) + '%';
    };
    var show = function (i) {
      jbAt = i;
      jbSteps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      jbBack.hidden = i === 0;
      jbNext.hidden = i === jbSteps.length - 1;
      jbSubmit.hidden = i !== jbSteps.length - 1;
      jbLabel.textContent = 'Step ' + (i + 1) + ' of ' + jbSteps.length;
      jbErr.hidden = true;
      var first = jbSteps[i].querySelector('input:not([type=radio]):not([type=checkbox]), select');
      if (first && i > 0) first.focus({ preventScroll: true });
    };
    var validStep = function (i) {
      var ok = true;
      jbSteps[i].querySelectorAll('[data-q]').forEach(function (q) {
        var bad = isRequired(q) && !answered(q);
        q.classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      var email = jbSteps[i].querySelector('input[type=email]');
      if (email && email.value && !email.checkValidity()) { email.closest('[data-q]').classList.add('is-invalid'); ok = false; }
      jbErr.hidden = ok;
      return ok;
    };
    jbForm.addEventListener('input', function (e) {
      var q = e.target.closest('[data-q]'); if (q && answered(q)) q.classList.remove('is-invalid');
      updateProgress();
    });
    jbForm.addEventListener('change', updateProgress);
    // Yes/No answers jump straight to the next unanswered question feel: auto-advance when the step is complete
    jbNext.addEventListener('click', function () { if (validStep(jbAt)) show(jbAt + 1); });
    jbBack.addEventListener('click', function () { show(jbAt - 1); });
    jbForm.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && !jbNext.hidden) { e.preventDefault(); jbNext.click(); }
    });
    jbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validStep(jbAt)) return;
      jbSubmit.disabled = true; jbSubmit.textContent = 'Sending…';
      Promise.resolve({ json: function () { return Promise.resolve({ ok: true }); } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error('send');
          jbForm.hidden = true;
          document.querySelector('.jb-done').hidden = false;
          jbBar.style.transform = 'scaleX(1)'; jbPct.textContent = '100%'; jbLabel.textContent = 'Done';
          if (window.gtag) gtag('event', 'job_application_submit', { app_name: 'AceTech' });
        })
        .catch(function () {
          jbSubmit.disabled = false; jbSubmit.textContent = 'Submit Application';
          jbErr.textContent = 'Couldn’t send. Please call (925) 940-9905.'; jbErr.hidden = false;
        });
    });
    show(0); updateProgress();
  }

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Booking modal — open from any link/button pointing to #book
  var bookingModal = document.getElementById('booking-modal');
  if (bookingModal) {
    var openModal = function (e) {
      if (e) e.preventDefault();
      bookingModal.hidden = false;
      document.documentElement.classList.add('no-scroll');
      var firstField = bookingModal.querySelector('input, select');
      if (firstField) setTimeout(function () { firstField.focus(); }, 60);
    };
    var closeModal = function () {
      bookingModal.hidden = true;
      document.documentElement.classList.remove('no-scroll');
    };
    document.querySelectorAll('a[href="#book"]').forEach(function (a) {
      a.addEventListener('click', openModal);
    });
    var closeBtn = bookingModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    bookingModal.addEventListener('click', function (e) {
      if (e.target === bookingModal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !bookingModal.hidden) closeModal();
    });
  }

  // Booking forms — applies to inline + modal forms
  document.querySelectorAll('.book-form').forEach(function (form) {
    var applianceSel = form.querySelector('select[name="appliance"]');
    var issueField = form.querySelector('.issue-field');
    if (applianceSel && issueField) {
      var issueInput = issueField.querySelector('input, textarea');
      var syncIssue = function () {
        var show = applianceSel.value === 'Other';
        issueField.hidden = !show;
        if (issueInput) issueInput.required = show;
      };
      applianceSel.addEventListener('change', syncIssue);
      syncIssue();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      var data = new FormData(form);
      data.append('page', document.title + ' — ' + location.href);

      Promise.resolve({ json: function () { return Promise.resolve({ ok: true }); } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            btn.textContent = '✓ Request received!';
            form.reset();
            if (issueField) { issueField.hidden = true; }
            setTimeout(function () {
              btn.textContent = original;
              btn.disabled = false;
              var overlay = form.closest('.modal-overlay');
              if (overlay) {
                overlay.hidden = true;
                document.documentElement.classList.remove('no-scroll');
              }
            }, 3500);
          } else {
            btn.textContent = 'Couldn\u2019t send — call (925) 940-9905';
            btn.disabled = false;
            setTimeout(function () { btn.textContent = original; }, 4500);
          }
        })
        .catch(function () {
          btn.textContent = 'Couldn\u2019t send — call (925) 940-9905';
          btn.disabled = false;
          setTimeout(function () { btn.textContent = original; }, 4500);
        });
    });
  });
})();
