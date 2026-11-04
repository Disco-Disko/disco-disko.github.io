# discodisko.com – studio website

Static site for Disco Disko: studio front page, the Gravel Gas page, its privacy policy and support page (English and Danish), and `app-ads.txt`.

| Page | Address once live | Used for |
|---|---|---|
| `index.html` | discodisko.com | Developer website in both stores |
| `gravelgas/privacy.html` | discodisko.com/gravelgas/privacy.html | Privacy policy URL (App Store + Google Play), and `PRIVACY_URL` in `grusgas.html` |
| `gravelgas/support.html` | discodisko.com/gravelgas/support.html | Support URL (App Store) |
| `app-ads.txt` | discodisko.com/app-ads.txt | AdMob seller verification (must be at the root) |

## Before it goes live
1. Fill in `[OWNER NAME]` / `[EJERENS NAVN]` in `gravelgas/privacy.html` with your full name (or company name and CVR). The GDPR requires the controller to be identifiable.
2. Set up the address `support@discodisko.com`, e.g. with free email forwarding at the domain registrar or Cloudflare Email Routing, so mail reaches your own inbox.
3. Once the AdMob account exists, activate the line in `app-ads.txt`.

## Putting it online with GitHub Pages
GitHub Pages is free only for public repositories, and the game repo is private. So the site gets its own public repo that only contains these files:

1. Create the GitHub organization **discodisko** (github.com › your profile › Your organizations › New organization › Free).
2. Create a public repo in it called **discodisko.github.io** and copy the contents of this `site/` folder into it.
3. In that repo: Settings › Pages › Deploy from branch `main`, folder `/ (root)`. The site is then at https://discodisko.github.io.
4. When discodisko.com is bought: add a file `CNAME` containing `discodisko.com`, point the domain's DNS to GitHub Pages (A records 185.199.108.153, .109.153, .110.153, .111.153 and a CNAME `www` → `discodisko.github.io`), and tick "Enforce HTTPS".

Check GitHub's current DNS values in their docs ("Managing a custom domain for your GitHub Pages site") before setting them.
