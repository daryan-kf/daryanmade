# daryanmade

Daryan Kamalifar’s portfolio, built with Next.js 16, React 19, TypeScript, GSAP, Lenis, and Three.js. A portfolio with a branded Shield Family website under the same domain, and direct links to live web and mobile apps.

## Local development

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For a production preview, run `npm run build` followed by `npm start`.

## Deploy to Vercel

1. Import [daryan-kf/daryanmade](https://github.com/daryan-kf/daryanmade) in Vercel.
2. Use the **Next.js** framework preset and leave the Root Directory at the repository root (`.`), with the default build settings.
3. Set `NEXT_PUBLIC_SITE_URL` to the full final domain, including `https://` and its actual extension, for example `https://daryanmade.com` if that is the domain you own. This is a public setting, not a secret.
4. Deploy, then add your domain in Vercel’s project settings and follow the DNS instructions. Redeploy after changing `NEXT_PUBLIC_SITE_URL` so canonical URLs, sitemap, and social cards use the right origin.

If the setting is omitted, production metadata uses `VERCEL_PROJECT_PRODUCTION_URL` when Vercel provides it, and local development falls back to localhost. Set the server-only `CONVEX_SITE_URL` and `SHIELD_API_SECRET` in Vercel for Shield's email offer. See the [offer operations guide](docs/shield-offers.md) and `.env.example` for the separate Convex email configuration.

## The collection

| Address | Status |
| --- | --- |
| `/projects/shield-family` | Full Shield Family website; download, walkthrough, email offer, FAQ |
| `/projects/kaizencv` | Live; official product website link |
| `/projects/iqra` | Live; official App Store and product website links |
| `/projects/vela` | Live; official App Store and product website links |
| `/projects/wardrobe` | Coming very soon; part of the Vela family |
| `/projects/koebsklar` | Live; official website link |
| `/projects/sarpoli` | Live; Daryan’s AI agency |
| `/projects/next-project` | A minimal surprise teaser for 2027 |

Update copy, status, links, features, and themes in `src/lib/projects.ts`. The homepage, project pages, sitemap, and social previews use this shared data. The homepage groups every project into Agency, Web apps, Mobile apps, and Next chapter. Sarpoli, KaizenCV, and Købsklar open their official sites. Iqra and Vela open their App Store listings. Shield Family opens its branded site at `/projects/shield-family`; existing overview routes for the other apps remain available. Discontinued work is excluded; the next project intentionally reveals no product details. Add a matching `public/images/<slug>/icon.png` for each new project. The main product images live in that same directory.

Shield Family uses the current product website’s native app previews and its Paper & Signal brand. Its offer form, email confirmation, privacy notice and redemption guide live under `/projects/shield-family`. A new Convex backend verifies email before assigning an Apple offer code and queues transactional delivery through Resend. It does not call the former Shield offer backend. Wardrobe combines a current development UI capture with styling imagery. Sarpoli, KaizenCV, and Købsklar use captures of their live homepages. Each project’s scene uses its current brand palette. Internal research, source inventories, credentials and Apple offer codes are excluded from this public repository.

## Design and motion

Warm paper, deep ink, vermilion, self-hosted Manrope and Instrument Serif, a custom maker mark, and individually composed product scenes. The hero’s continuous form is generated locally with Three.js, with a server-rendered SVG fallback. It pauses offscreen and in background tabs, and has an explicit pause button. System reduced-motion preferences disable continuous motion and scroll smoothing. All text and navigation render before optional motion loads.

The website has no tracking pixels or analytics integrations. Shield's optional offer form processes email, consent, verification and code-delivery records; it does not enrol people in marketing. Contact actions open email or LinkedIn. Product privacy policies remain separate and are linked from the relevant product pages. Daryan's About portrait uses the supplied photograph without retouching.

## Verification

```sh
npm run typecheck
npm run test:backend
npm run build
npm run test:browser
```

The browser suite expects the local server at port 3000 (override with `PLAYWRIGHT_BASE_URL`) and uses installed Google Chrome. In another environment, change `channel` in `playwright.config.ts` or install a Playwright browser. It checks routes, category navigation, destination links, animated FAQ controls, keyboard navigation, mobile menus, image dialogs, reduced motion, image loading, horizontal overflow, accessibility, and Shield's offer flow. Backend tests use an isolated Convex test database and mocked email delivery; they never issue production codes or email real people. `scripts/capture.mjs` captures visual review images into ignored `artifacts/`.

Manrope and Instrument Serif are distributed under the SIL Open Font License. Their license notices are included in `public/fonts/`. Shield’s Hanken Grotesk and Fraunces fonts and SIL Open Font License notices are in `public/images/shield-site/fonts/`.
