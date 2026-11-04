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
      all[k].setAttribute('href', href.replace(/#(en|da)$/, '') + '#' + lang);
    }
  }

  function fromHash() {
    var h = location.hash.replace('#', '');
    return (h === 'da' || h === 'en') ? h : null;
  }

  var start = fromHash() || ((navigator.language || '').toLowerCase().indexOf('da') === 0 ? 'da' : 'en');
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
