/* The lo-fi player on the front page.
   Nothing from YouTube loads until the visitor presses play (no cookies, no tracking before that).
   The newest mix is written into index.html by node store/_render/latest-mix.js (its id is in data-video
   on the box). Play shows that video and then continues with the rest of the channel's uploads.
   Without JavaScript there is no play button; the "Watch on YouTube" link does the job instead. */
(function () {
  var UPLOADS = 'UUWFw37sGpf1qx16s32rHmuQ';                     // channel id UCWF... with UC -> UU
  var players = document.querySelectorAll('[data-lofi-player]');

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
    var play = box.querySelector('[data-play]'), video = box.getAttribute('data-video');
    if (!play) return;
    play.hidden = false;
    var note = box.querySelector('.lf-note');
    if (note) note.hidden = false;

    play.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = video
        ? 'https://www.youtube-nocookie.com/embed/' + video + '?list=' + UPLOADS + '&autoplay=1&rel=0'
        : 'https://www.youtube-nocookie.com/embed/videoseries?list=' + UPLOADS + '&autoplay=1&rel=0';
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
