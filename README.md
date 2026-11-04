# discodisko.com – studio website

Static site for Disco Disko: studio front page, the Gravel Gas page, its privacy policy and support page (English and Danish), and `app-ads.txt`.

| Page | Address once live | Used for |
|---|---|---|
| `index.html` | discodisko.com | Developer website in both stores |
| `gravelgas/privacy.html` | discodisko.com/gravelgas/privacy.html | Privacy policy URL (App Store + Google Play), and `PRIVACY_URL` in `grusgas.html` |
| `gravelgas/support.html` | discodisko.com/gravelgas/support.html | Support URL (App Store) |
| `app-ads.txt` | discodisko.com/app-ads.txt | AdMob seller verification (must be at the root) |

## Before it goes live
1. ~~Fill in the owner name in the privacy policy~~ (done).
2. Set up the address `support@discodisko.com`, e.g. with free email forwarding at the domain registrar or Cloudflare Email Routing, so mail reaches your own inbox.
3. Once the AdMob account exists, activate the line in `app-ads.txt`.

## Online with GitHub Pages
GitHub Pages is free only for public repositories, and the game repo is private. So the site lives in its own public repo that only contains these files:

- Organization **Disco-Disko**, repo **Disco-Disko/disco-disko.github.io**, live at https://disco-disko.github.io
- Pages serves branch `main`, folder `/ (root)`.

To publish changes after editing files in `site/`, commit them here and run from the project root:

```bash
git subtree push --prefix site site main
```

The remote `site` points to the public repo. If it's missing: `git remote add site https://github.com/Disco-Disko/disco-disko.github.io.git`.

When discodisko.com is bought: add a file `site/CNAME` containing `discodisko.com` and publish, point the domain's DNS to GitHub Pages (A records 185.199.108.153, .109.153, .110.153, .111.153 and a CNAME `www` → `disco-disko.github.io`), set the custom domain under the repo's Settings › Pages, and tick "Enforce HTTPS". Then change `PRIVACY_URL` in `grusgas.html` to `https://discodisko.com/gravelgas/privacy.html`.

Check GitHub's current DNS values in their docs ("Managing a custom domain for your GitHub Pages site") before setting them.
