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
      if (!href || /^(https?:|mailto:|#)/.test(href) || all[k].hasAttribute('data-lang')) continue;
      if (/#(?!en$|da$)/.test(href)) {   // a link to a section on another page: carry the language as ?lang=
        all[k].setAttribute('href', href.replace(/\?lang=(en|da)/, '').replace('#', '?lang=' + lang + '#'));
      } else {
        all[k].setAttribute('href', href.replace(/#(en|da)$/, '') + '#' + lang);
      }
    }
  }

  function fromHash() {
    var h = location.hash.replace('#', '');
    if (h === 'da' || h === 'en') return h;
    var q = /[?&]lang=(en|da)/.exec(location.search);
    return q ? q[1] : null;
  }

  // English unless the address says #da; the visitor's browser language is not used
  var start = fromHash() || 'en';
  show(start);
  if (/^#(en|da)$/.test(location.hash)) window.scrollTo(0, 0);   // a language hash is not a place on the page

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
  var saveData = navigator.connection && navigator.connection.saveData;
  if (clips.length && (saveData || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches))) {
    for (var v = 0; v < clips.length; v++) { clips[v].removeAttribute('autoplay'); clips[v].pause(); clips[v].setAttribute('controls', ''); }
  }
})();

/* Lamp hits: aim the two stage lamps at the mirror ball (the swing itself is a CSS animation around that aim, so the
   browser moves the lamps on its own), and each frame fade the ball's two light overlays (its lit side and the little
   light squares it throws) in and out exactly when a beam hits it. Only the overlays' opacity changes per frame, which
   the browser composites without redrawing the ball. */
(function () {
  var ball = document.querySelector('.ballsvg'), lamps = document.querySelectorAll('.lamp');
  if (!ball || lamps.length < 2) return;
  var lights = [ball.parentNode.querySelector('.light-l'), ball.parentNode.querySelector('.light-r')];
  if (!lights[0] || !lights[1]) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // The lamps' drawn axis points from the pivot (60,60) towards (900,95); each beam crosses the ball twice per swing on every screen size.
  var AXIS = Math.atan2(35, 840) * 180 / Math.PI, AMP = [15, 16], CENTRE = [177, 2], shown = [-1, -1];   // CENTRE: which way each dot ring was drawn facing
  // Where a point of a lamp's drawing (viewBox 900 × 420, scaled to the lamp's width) sits on the page. The right lamp is
  // mirrored with CSS (scaleX(-1)); Safari leaves that out of getScreenCTM, which made the lamp aim off the page, so the
  // place is worked out from the lamp's box and the mirror here instead of asking the browser for a matrix.
  function place(lamp) {
    var r = lamp.getBoundingClientRect(), s = r.width / 900, flip = lamp.classList.contains('lamp-r');
    return { s: s, flip: flip, x: function (lx) { return flip ? r.right - lx * s : r.left + lx * s; }, y: function (ly) { return r.top + ly * s; } };
  }
  function ballAt() {
    var bb = ball.getBoundingClientRect();
    return { bb: bb, cx: bb.left + bb.width * 160 / 320, cy: bb.top + bb.height * 190 / 340, r: bb.width * 100 / 320 };
  }
  // once per layout: point each lamp's swing at the ball, and put its light on the side of the ball that faces it
  function aim() {
    var b = ballAt();
    for (var i = 0; i < 2; i++) {
      var p = place(lamps[i]); if (!p.s || !b.bb.width) continue;
      var bx = (p.flip ? p.x(0) - b.cx : b.cx - p.x(0)) / p.s, by = (b.cy - p.y(0)) / p.s;   // ball centre in the lamp's own units
      var target = Math.atan2(by - 60, bx - 60) * 180 / Math.PI - AXIS;
      lamps[i].style.setProperty('--aim', target.toFixed(2) + 'deg');
      lamps[i].style.setProperty('--amp', AMP[i] + 'deg');
      var x0 = p.x(60), y0 = p.y(60), lx = x0 - b.cx, ly = y0 - b.cy, ll = Math.hypot(lx, ly) || 1;
      var hx = b.cx + lx / ll * b.r * .45, hy = b.cy + ly / ll * b.r * .45, ang = Math.atan2(-ly, lx) * 180 / Math.PI;   // y up
      var hit = lights[i].querySelector('.hit'), dots = lights[i].querySelector('.dots');
      if (hit) { hit.setAttribute('cx', ((hx - b.bb.left) * 320 / b.bb.width).toFixed(1)); hit.setAttribute('cy', ((hy - b.bb.top) * 340 / b.bb.height).toFixed(1)); }
      if (dots) dots.setAttribute('transform', 'rotate(' + (-(ang - CENTRE[i])).toFixed(1) + ' 160 190)');
    }
  }
  function angleOf(lamp) {   // the swivel's current rotation, read from the running CSS animation
    var m = /matrix\(([^,]+),([^,]+),/.exec(getComputedStyle(lamp.querySelector('.swivel')).transform);
    return m ? Math.atan2(+m[2], +m[1]) * 180 / Math.PI : 0;
  }
  // how squarely the lamp's beam hits the ball right now, 0 to 1
  function strength(lamp) {
    var p = place(lamp), b = ballAt();
    if (!p.s) return 0;
    var th = (AXIS + angleOf(lamp)) * Math.PI / 180, dx = Math.cos(th), dy = Math.sin(th);
    if (p.flip) dx = -dx;
    var x0 = p.x(60), y0 = p.y(60), vx = b.cx - x0, vy = b.cy - y0, t = vx * dx + vy * dy;
    if (t <= 0) return 0;
    var perp = Math.abs(vx * dy - vy * dx), half = t * Math.tan(13.5 * Math.PI / 180);
    var s = Math.max(0, Math.min(1, (half * .9 - perp) / (half * .9)));
    return s * s * (3 - 2 * s);
  }
  aim();
  window.addEventListener('resize', aim);
  window.addEventListener('load', aim);
  (function frame() {
    for (var i = 0; i < 2; i++) {
      var s = strength(lamps[i]);
      if (Math.abs(s - shown[i]) > .004) { lights[i].style.opacity = s.toFixed(3); shown[i] = s; }
    }
    requestAnimationFrame(frame);
  })();
})();
