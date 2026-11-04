/* Language switch (English / Danish) for every page.
   Both languages are always in the page. With JavaScript we show one at a time, keep the
   choice in the address (#en / #da) and carry it along on links to the other pages.
   Without JavaScript both languages are shown, one after the other. */
(function () {
  var sections = document.querySelectorAll('[data-lang-section]');
  if (!sections.length) return;
  var links = document.querySelectorAll('.lang a[data-lang]');
  var titleEl = document.querySelector('title');

  function show(lang) {
    for (var i = 0; i < sections.length; i++) {
      sections[i].hidden = sections[i].getAttribute('data-lang-section') !== lang;
    }
    for (var j = 0; j < links.length; j++) {
      var on = links[j].getAttribute('data-lang') === lang;
      if (on) links[j].setAttribute('aria-current', 'true'); else links[j].removeAttribute('aria-current');
    }
    document.documentElement.lang = lang;
    if (titleEl && titleEl.getAttribute('data-' + lang)) document.title = titleEl.getAttribute('data-' + lang);
    // carry the language to the site's own pages
    var all = document.querySelectorAll('a[href]');
    for (var k = 0; k < all.length; k++) {
      var href = all[k].getAttribute('href');
      if (!href || /^(https?:|mailto:|#)/.test(href) || /#(?!en$|da$)/.test(href) || all[k].hasAttribute('data-lang')) continue;
      all[k].setAttribute('href', href.replace(/#(en|da)$/, '') + '#' + lang);
    }
  }

  function fromHash() {
    var h = location.hash.replace('#', '');
    return (h === 'da' || h === 'en') ? h : null;
  }

  // English unless the address says #da; the visitor's browser language is not used
  var start = fromHash() || 'en';
  show(start);
  if (location.hash) window.scrollTo(0, 0);

  for (var m = 0; m < links.length; m++) {
    links[m].addEventListener('click', function (e) {
      e.preventDefault();
      var lang = this.getAttribute('data-lang');
      show(lang);
      history.replaceState(null, '', '#' + lang);
    });
  }
  window.addEventListener('hashchange', function () { var h = fromHash(); if (h) show(h); });

  // The gameplay clip only moves if the visitor hasn't asked for less motion.
  var clips = document.querySelectorAll('video[autoplay]');
  if (clips.length && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (var v = 0; v < clips.length; v++) { clips[v].removeAttribute('autoplay'); clips[v].pause(); clips[v].setAttribute('controls', ''); }
  }
})();

/* Lamp hits: each frame, measure where the two stage lamps' beams point and light the mirror ball
   (its lit side and the little light squares it throws) exactly when a beam hits it. */
(function () {
  var ball = document.querySelector('.ballsvg'), lamps = document.querySelectorAll('.lamp');
  if (!ball || lamps.length < 2) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var parts = { l: ['hitL', 'dotsL'], r: ['hitR', 'dotsR'] }, els = {};
  for (var k in parts) els[k] = parts[k].map(function (c) { return ball.querySelector('.' + c); });
  // The lamps are aimed at the ball from the script, swinging around it, so each beam crosses the ball
  // twice per swing on every screen size. (The CSS sweep is only the fallback without JavaScript.)
  var AXIS = Math.atan2(35, 840) * 180 / Math.PI, swing = [{ amp: 15, period: 11000, phase: 0 }, { amp: 16, period: 13000, phase: 2.2 }];
  function aim(lamp, i, now) {
    var sw = lamp.querySelector('.swivel'), m = lamp.getScreenCTM(); if (!m) return;
    var bb = ball.getBoundingClientRect(), cx = bb.left + bb.width * 160 / 320, cy = bb.top + bb.height * 190 / 340;
    var inv = m.inverse(), bx = cx * inv.a + cy * inv.c + inv.e, by = cx * inv.b + cy * inv.d + inv.f;   // ball centre in the lamp's own units
    var target = Math.atan2(by - 60, bx - 60) * 180 / Math.PI - AXIS;
    var w = swing[i], a = target + w.amp * Math.sin(now / w.period * 2 * Math.PI + w.phase);
    sw.style.animation = 'none';
    sw.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
  }
  function strength(lamp) {
    var sw = lamp.querySelector('.swivel'), m = sw.getScreenCTM(); if (!m) return { s: 0 };
    // beam axis in page pixels: from the pivot (60,60) towards (900,95) in the lamp's own units
    var x0 = 60 * m.a + 60 * m.c + m.e, y0 = 60 * m.b + 60 * m.d + m.f;
    var x1 = 900 * m.a + 95 * m.c + m.e, y1 = 900 * m.b + 95 * m.d + m.f;
    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); dx /= len; dy /= len;
    var bb = ball.getBoundingClientRect(), cx = bb.left + bb.width * 160 / 320, cy = bb.top + bb.height * 190 / 340, r = bb.width * 100 / 320;
    var vx = cx - x0, vy = cy - y0, t = vx * dx + vy * dy; if (t <= 0) return { s: 0 };
    var perp = Math.abs(vx * dy - vy * dx), half = t * Math.tan(13.5 * Math.PI / 180);
    var s = (half * .9 - perp) / (half * .9); s = Math.max(0, Math.min(1, s));
    // where on the ball the beam lands: the point of the axis nearest the centre, pulled towards the lamp
    var qx = x0 + dx * t - cx, qy = y0 + dy * t - cy, ql = Math.hypot(qx, qy);
    if (ql > r * .7) { qx *= r * .7 / ql; qy *= r * .7 / ql; }
    var lx = x0 - cx, ly = y0 - cy, ll = Math.hypot(lx, ly) || 1;
    var hx = cx + qx + lx / ll * r * .45, hy = cy + qy + ly / ll * r * .45;
    var ang = Math.atan2(-(y0 - cy), x0 - cx) * 180 / Math.PI;           // direction to the lamp, y up
    return { s: s * s * (3 - 2 * s), hx: (hx - bb.left) * 320 / bb.width, hy: (hy - bb.top) * 340 / bb.height, ang: ang };
  }
  var centre = { l: 177, r: 2 };   // which way each dot ring was drawn facing
  function apply(key, h) {
    var e = els[key], s = h.s;
    e[0].style.opacity = s; e[1].style.opacity = s;
    if (s <= 0) return;
    e[0].setAttribute('cx', h.hx.toFixed(1)); e[0].setAttribute('cy', h.hy.toFixed(1));
    e[1].setAttribute('transform', 'rotate(' + (-(h.ang - centre[key])).toFixed(1) + ' 160 190)');
  }
  (function frame(now) {
    aim(lamps[0], 0, now || 0); aim(lamps[1], 1, now || 0);
    apply('l', strength(lamps[0])); apply('r', strength(lamps[1]));
    requestAnimationFrame(frame);
  })(0);
})();
