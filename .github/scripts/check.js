// Checks the site before it is published, so a broken page never goes live:
//   - every page has a title, a description and a canonical address
//   - every page has the same number of English and Danish sections (data-lang-section)
//   - every image has an alt text
//   - every internal link and file reference (href, src, poster) points at a file that exists
//   - no leftover placeholders ($1, TODO, FIXME)
//   - sitemap.xml lists every page (except 404.html and pages marked noindex) and lists nothing that is missing
// Prints each problem with its file and exits 1 if there are any. Dependency-free.
// Run: node site/.github/scripts/check.js   (from the project root; the publish workflow runs it too)
const fs = require('fs'), path = require('path');
const site = path.resolve(__dirname, '..', '..');
const problems = [];
const say = (file, msg) => problems.push(`${path.relative(site, file).replace(/\\/g, '/')}: ${msg}`);

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? pages(p) : /\.html$/.test(e.name) ? [p] : [];
  });
}

function exists(file, ref) {
  // "support/" -> support/index.html; "../#music" -> ../index.html
  let target = ref.split(/[?#]/)[0];
  if (target === '') return true;                                   // "#music" on the same page
  const abs = target.startsWith('/') ? path.join(site, target) : path.resolve(path.dirname(file), target);   // "/logo.svg" is from the site root
  if (!abs.startsWith(site)) return false;
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return fs.existsSync(path.join(abs, 'index.html'));
  return fs.existsSync(abs);
}

const sitemap = fs.readFileSync(path.join(site, 'sitemap.xml'), 'utf8');
const listed = [...sitemap.matchAll(/<loc>https:\/\/discodisko\.com\/([^<]*)<\/loc>/g)].map(m => m[1]);

for (const file of pages(site)) {
  const html = fs.readFileSync(file, 'utf8'), rel = path.relative(site, file).replace(/\\/g, '/');
  const is404 = rel === '404.html';

  if (!/<title[^>]*>[^<]+<\/title>/.test(html)) say(file, 'no <title>');
  if (!is404 && !/<meta name="description" content="[^"]+"/.test(html)) say(file, 'no meta description');
  if (!is404 && !/<link rel="canonical" href="https:\/\/discodisko\.com\//.test(html)) say(file, 'no canonical link');

  const en = (html.match(/data-lang-section="en"/g) || []).length, da = (html.match(/data-lang-section="da"/g) || []).length;
  if (!en || !da) say(file, `missing a language: ${en} English and ${da} Danish sections`);
  else if (en !== da) say(file, `the languages differ: ${en} English and ${da} Danish sections`);

  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) say(file, `image without alt text: ${m[0].slice(0, 80)}`);

  for (const m of html.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue;
    if (!exists(file, ref)) say(file, `broken reference: ${ref}`);
  }

  for (const m of html.matchAll(/\$[12]\b|TODO|FIXME|XXX/g)) say(file, `leftover placeholder "${m[0]}"`);

  const url = rel.replace(/index\.html$/, '');
  const noindex = /<meta name="robots" content="noindex">/.test(html);
  if (!is404 && !noindex && !listed.includes(url)) say(file, `not in sitemap.xml (as ${url || '/'})`);
}
for (const url of listed) {
  const abs = path.join(site, url.endsWith('/') || url === '' ? url + 'index.html' : url);
  if (!fs.existsSync(abs)) say(path.join(site, 'sitemap.xml'), `lists a missing page: /${url}`);
}

if (problems.length) { console.error(`check: ${problems.length} problem(s)\n  ` + problems.join('\n  ')); process.exit(1); }
console.log(`check: ${pages(site).length} pages, no problems`);
