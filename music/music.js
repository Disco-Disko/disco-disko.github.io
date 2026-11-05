/* The lo-fi player on the front page.
   Nothing from YouTube loads until the visitor presses play (no cookies, no tracking before that).
   Before the first mix is out (Tuesday 10 November 2026, 17:00 Danish time) the box says when it comes.
   After that the button plays the channel's uploads playlist, which always starts with the newest video,
   so the page never needs updating when a new mix is published.
   Without JavaScript the box just links to the channel. */
(function () {
  var FIRST_MIX = Date.parse('2026-11-10T16:00:00Z');           // 17:00 in Denmark (CET)
  var UPLOADS = 'UUWFw37sGpf1qx16s32rHmuQ';                     // channel id UCWF... with UC -> UU
  var players = document.querySelectorAll('[data-lofi-player]');

  // whole calendar days (Danish time) from now until release day
  function daysLeft(now) {
    function day(t) {
      try { var s = new Date(t).toLocaleDateString('en-CA', { timeZone: 'Europe/Copenhagen' }); return Date.parse(s.slice(0, 10) + 'T00:00:00Z'); }
      catch (e) { return Math.floor((t + 3600000) / 86400000) * 86400000; }
    }
    return Math.round((day(FIRST_MIX) - day(now)) / 86400000);
  }

  // In Danish the sections have "-da" ids (#music-da, #games-da): send menu links like #music there.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || document.documentElement.lang !== 'da') return;
    var id = a.getAttribute('href').slice(1), el = document.getElementById(id + '-da');
    if (!el || id === 'da' || id === 'en') return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
  });

  for (var i = 0; i < players.length; i++) (function (box) {
    var da = box.getAttribute('data-lofi-player') === 'da';
    var status = box.querySelector('.lf-status');
    var play = box.querySelector('[data-play]');
    var now = Date.now();

    if (now < FIRST_MIX) {
      var d = daysLeft(now);
      var when = d <= 0 ? (da ? 'i dag kl. 17' : 'today at 17:00 CET') :
                 d === 1 ? (da ? 'i morgen kl. 17' : 'tomorrow at 17:00 CET') :
                 (da ? 'om ' + d + ' dage' : 'in ' + d + ' days');
      status.innerHTML = da
        ? '<strong>Første mix: tirsdag 10. november kl. 17</strong>Premiere ' + when + '. Abonnér, så du får besked.'
        : '<strong>First mix: Tuesday 10 November, 17:00 CET</strong>Premieres ' + when + '. Subscribe to get notified.';
      return;                                                    // keep the subscribe button
    }

    status.innerHTML = da
      ? '<strong>Seneste mix</strong>Tryk play for at lytte her. Nye lange mix hver uge.'
      : '<strong>Latest mix</strong>Press play to listen here. New long mixes every week.';
    play.hidden = false;
    var note = box.querySelector('.lf-note');
    if (note) note.hidden = false;
    var sub = box.querySelector('[data-subscribe]');
    if (sub) sub.classList.add('ghost');

    play.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + UPLOADS + '&autoplay=1&rel=0&modestbranding=1';
      f.title = da ? 'Disco Disko Lo-Fi: seneste mix' : 'Disco Disko Lo-Fi: latest mix';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.setAttribute('allowfullscreen', '');
      var screen = box.querySelector('.lf-player');
      screen.innerHTML = '';
      screen.appendChild(f);
      f.focus();
    });
  })(players[i]);
})();
