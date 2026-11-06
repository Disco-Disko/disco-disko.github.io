// Puts the newest long video from the Disco Disko Lo-Fi channel on the front page's music section:
// the title, length and date in both languages, the id the play button uses, the "Watch on YouTube"
// link and the VideoObject structured data in <head>. Reads the channel's public RSS feed (no API key,
// no login) and each candidate's watch page for its length; Shorts (under 10 minutes) are skipped.
//
// The GitHub workflow next to it (../workflows/publish.yml) runs this twice a day and on every push,
// then publishes the result to GitHub Pages, so the live site shows the newest mix without anyone
// editing anything. The committed index.html keeps whatever mix it had; run the script locally
// (node site/.github/scripts/latest-mix.js from the project root) only if you want the source updated too.
//
// If YouTube cannot be read, the script warns and leaves the page as it is (exit 0), so a hiccup at
// YouTube never blocks publishing the site. A missing placeholder in index.html is a real error (exit 1).
const fs = require('fs'), path = require('path');
const site = path.resolve(__dirname, '..', '..');
const CHANNEL = 'UCWFw37sGpf1qx16s32rHmuQ', MIN_SECONDS = 600;

const get = async (url) => { const r = await fetch(url, { headers: { 'accept-language': 'en' } }); if (!r.ok) throw new Error(url + ' ' + r.status); return r.text(); };
const unxml = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MONTHS = { en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                 da: ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'] };

async function newestMix() {
  const feed = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`);
  const entries = [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
  if (!entries.length) throw new Error('no videos in the feed');
  for (const e of entries) {
    const id = e.match(/<yt:videoId>([^<]+)/)[1];
    const page = await get(`https://www.youtube.com/watch?v=${id}`);
    const secs = +((page.match(/"lengthSeconds":"(\d+)"/) || [])[1] || 0);
    const live = /"isLiveNow":true/.test(page) || /"isUpcoming":true/.test(page);
    if (secs < MIN_SECONDS || live) continue;
    const desc = unxml((e.match(/<media:description>([\s\S]*?)<\/media:description>/) || [, ''])[1]).split('\n')[0].trim();
    return { id, secs, desc,
      title: unxml(e.match(/<title>([^<]*)/)[1]),
      published: e.match(/<published>([^<]+)/)[1],
      thumb: (e.match(/<media:thumbnail url="([^"]+)"/) || [, `https://i.ytimg.com/vi/${id}/hqdefault.jpg`])[1] };
  }
  throw new Error('no video of 10 minutes or more in the feed');
}

(async () => {
  let mix;
  try { mix = await newestMix(); }
  catch (e) { console.warn(`latest-mix: YouTube could not be read (${e.message}); the page keeps the mix it has`); return; }

  // "Rainy Night in Old Town 🌧️ 2 Hours of Lofi Hip Hop & Rain Sounds | Study · Sleep · Relax" -> the part before " | "
  const short = mix.title.split(' | ')[0].trim();
  const d = new Date(mix.published);
  const h = Math.floor(mix.secs / 3600), m = Math.round((mix.secs % 3600) / 60);
  const len = { en: h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`, da: h ? `${h} t${m ? ` ${m} min` : ''}` : `${m} min` };
  const date = { en: `${d.getUTCDate()} ${MONTHS.en[d.getUTCMonth()]} ${d.getUTCFullYear()}`, da: `${d.getUTCDate()}. ${MONTHS.da[d.getUTCMonth()]} ${d.getUTCFullYear()}` };
  const iso = `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}` || 'PT0M';

  const p = path.join(site, 'index.html');
  let html = fs.readFileSync(p, 'utf8'), n = 0;
  const before = (html.match(/data-video="([^"]*)"/) || [])[1];
  // every replacement is a function, so nothing in a title or description is read as a "$1" group reference
  const sub = (re, fn) => { html = html.replace(re, (...a) => { n++; return fn(...a); }); };
  sub(/data-video="[^"]*"/g, () => `data-video="${mix.id}"`);
  sub(/(<a class="lf-title" href=")[^"]*("[^>]*>)[^<]*(<\/a>)/g, (_, a, b, c) => `${a}https://www.youtube.com/watch?v=${mix.id}${b}${esc(short)}${c}`);
  sub(/(<span class="lf-meta" lang="en">)[^<]*(<\/span>)/g, (_, a, b) => `${a}${len.en} · ${date.en}${b}`);
  sub(/(<span class="lf-meta" lang="da">)[^<]*(<\/span>)/g, (_, a, b) => `${a}${len.da} · ${date.da}${b}`);
  sub(/(<a class="lf-btn" data-watch href=")[^"]*(")/g, (_, a, b) => `${a}https://www.youtube.com/watch?v=${mix.id}${b}`);
  const ld = { '@context': 'https://schema.org', '@type': 'VideoObject', name: mix.title, description: mix.desc || short,
    thumbnailUrl: [mix.thumb, `https://i.ytimg.com/vi/${mix.id}/maxresdefault.jpg`], uploadDate: mix.published, duration: iso,
    url: `https://www.youtube.com/watch?v=${mix.id}`, embedUrl: `https://www.youtube-nocookie.com/embed/${mix.id}`,
    publisher: { '@type': 'Organization', name: 'Disco Disko', url: 'https://discodisko.com/' },
    isPartOf: { '@type': 'CreativeWorkSeries', name: 'Disco Disko Lo-Fi', url: 'https://www.youtube.com/@DiscoDiskoLoFi' } };
  sub(/(<script type="application\/ld\+json" id="ld-video">)[\s\S]*?(<\/script>)/, (_, a, b) => a + JSON.stringify(ld).replace(/<\//g, '<\\/') + b);
  if (n !== 9) { console.error(`latest-mix: expected 9 placeholders in index.html, found ${n}`); process.exit(1); }
  fs.writeFileSync(p, html);

  if (before !== mix.id) {   // a new mix: the front page changed, say so in the sitemap
    const sm = path.join(site, 'sitemap.xml'), today = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(sm, fs.readFileSync(sm, 'utf8').replace(/(<loc>https:\/\/discodisko\.com\/<\/loc><lastmod>)[^<]+/, `$1${today}`));
  }
  console.log(`latest mix: ${mix.id} "${short}" (${len.en}, ${date.en})${before === mix.id ? ', unchanged' : ' (new, was ' + before + ')'}`);
})().catch(e => { console.error(e.message); process.exit(1); });
