# mainportfolio

Framer export of the portfolio site (morrislam.me), packaged to run either in
Docker (minimal Node static server) or on Vercel (plain static hosting).

```
public/        the exported site, served as-is (index.html untouched)
server.js      zero-dependency Node static server (Docker / local)
Dockerfile     node:22-alpine, non-root, port 3000, healthcheck
vercel.json    static output dir + clean URLs
content.md     text dump that came with the export (not served)
```

## Docker

```bash
docker build -t mainportfolio .
docker run --rm -p 3000:3000 mainportfolio
# http://localhost:3000
```

The server listens on `$PORT` (default `3000`) on `0.0.0.0`.

## Local without Docker

```bash
npm start
```

## Vercel

Import the repo in Vercel (Framework Preset: **Other**) or run `vercel`.
`vercel.json` sets `outputDirectory: "public"`, no build/install step,
`cleanUrls` and no trailing slashes. `.vercelignore` keeps the Docker-only
files out of the deployment.

## Page routes

Both hosts resolve clean URLs the same way, so `/about` serves
`public/about.html` or `public/about/index.html`. `/about.html`, `/about/` and
`/index.html` redirect (308) to `/about` and `/`. A `public/404.html`, if you
add one, is used for unknown routes.

**Only the home page was in the original ZIP.** The FindMyLab case study is now
implemented locally at `/findmylab2026`. Other Framer case-study pages
(`/ampparking2026`, `/inaturalist-case-study`, `/ampcasestudy`) still need to be
exported and dropped into `public/` to exist here. The exported footer links to
some case studies by absolute `https://morrislam.me/...` URLs, so those links go
to the live domain until they are changed.

## Assets

The export references fonts, images and scripts by absolute Framer / Google
Fonts CDN URLs, so there are no local asset paths to preserve; nothing needs
to be served from this repo besides the HTML.
# portfolio2026
