/* Language switch for the support and privacy pages.
   Both languages are always in the page. With JavaScript we show one at a time and
   remember the choice in the address (#en / #da). Without JavaScript both are shown. */
(function () {
  var sections = document.querySelectorAll('[data-lang-section]');
  if (!sections.length) return;
  var links = document.querySelectorAll('.lang a[data-lang]');

  function show(lang) {
    for (var i = 0; i < sections.length; i++) {
      sections[i].hidden = sections[i].getAttribute('data-lang-section') !== lang;
    }
    for (var j = 0; j < links.length; j++) {
      var on = links[j].getAttribute('data-lang') === lang;
      if (on) links[j].setAttribute('aria-current', 'true'); else links[j].removeAttribute('aria-current');
    }
    document.documentElement.lang = lang;
  }

  function fromHash() {
    var h = location.hash.replace('#', '');
    return (h === 'da' || h === 'en') ? h : null;
  }

  var start = fromHash() || ((navigator.language || '').toLowerCase().indexOf('da') === 0 ? 'da' : 'en');
  show(start);
  if (location.hash) window.scrollTo(0, 0);

  for (var k = 0; k < links.length; k++) {
    links[k].addEventListener('click', function (e) {
      e.preventDefault();
      var lang = this.getAttribute('data-lang');
      show(lang);
      history.replaceState(null, '', '#' + lang);
      window.scrollTo({ top: 0 });
    });
  }
  window.addEventListener('hashchange', function () { var h = fromHash(); if (h) show(h); });
})();
