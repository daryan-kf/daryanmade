# daryanmade

Daryan Kamalifar’s portfolio, built with Next.js 16, React 19, TypeScript, GSAP, Lenis, Three.js and Convex. Includes distinct marketing sites for Vela, Shield Family and Iqra, each with its own optional product-update audience.

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

If the setting is omitted, production metadata uses `VERCEL_PROJECT_PRODUCTION_URL` when Vercel provides it, and local development falls back to localhost. Email processing uses server-only configuration. Follow the [app update operations guide](docs/app-updates.md) and [Shield offer operations guide](docs/shield-offers.md), plus `.env.example`. Deploy the additive Convex schema/functions before rolling out the frontend; configure and verify each app sender before enabling its signups. Missing configuration produces a truthful unavailable response. No deployment or real email delivery is part of local validation.

## The collection

| Address | Status |
| --- | --- |
| `/projects/sarpoli` | Founder’s story; homepage links directly to the official Sarpoli website |
| `/vela` | Vela 2.0 is available now; voice-to-plan story, features, film, download and updates |
| `/projects/wardrobe` | Coming soon; inactive homepage teaser |
| `/projects/kaizencv` | Live; homepage links to the official website |
| `/projects/koebsklar` | Live; homepage links to the official website |
| `/projects/shield-family` | Full product site, learning/allowance story, current update previews, separate offer and updates forms |
| `/iqra` | Live; word learning, reading, memorization, prayer, film, download and updates |
| `/projects/next-project` | A minimal surprise teaser for 2027 |

Update project copy, status, destinations, features, preview labels and themes in `src/lib/projects.ts`. The homepage follows the table order above, with individual Sarpoli, Vela, KaizenCV and Købsklar showcases. Product routes use their own navigation, including confirmation and privacy pages. `/projects/vela` and `/villa` permanently redirect to `/vela`; `/projects/iqra` permanently redirects to `/iqra`. Canonicals, structured data, social images and sitemap use the destination routes.

Shield Family’s existing offer form, email verification, inventory and redemption behavior remain separate from its news audience. Submitted-release visuals are marked as update previews. Vela’s current campaign interface illustrations and Iqra’s live 1.2.0 captures are sourced from the app and Master Ads repositories. Optimized images and deliberately played videos are local; [media provenance](docs/media-provenance.json) records sources and treatments without exposing workstation paths. Sarpoli’s document sequence is explicitly illustrative. Each product showcase uses its own palette; the portfolio retains paper, ink and orange. Credentials and Apple offer codes are excluded from the repository.

## Danish and English

Every owned page is available in English at its existing URL and in Danish under `/da`. Both are statically rendered with correct document language, canonical links, language alternates, localized social images and sitemap entries. One `[lang]` root layout and the small `src/proxy.ts` rewrite preserve English URLs while allowing language changes through the Next router without reloading the document. The animated EN/DA selector respects reduced motion and preserves the visible reading section. It also hands off private confirmation fragments only to the equivalent first-party page.

Copy is maintained in `src/lib/portfolio-copy.ts`, `src/lib/app-site-copy.ts` and `src/lib/email-copy.ts`, alongside explicit localized privacy content. Native app screenshots remain faithful source captures; narrated films offer Danish and English captions. Signup consent and confirmation emails follow the selected language. See [email operations](docs/app-updates.md) for the additive backend rollout.

## Design and motion

Warm paper, deep ink, orange, self-hosted Manrope and Instrument Serif, a dark About section, and individually composed product scenes. One page-level Three.js canvas carries the maker sculpture through nine measured layout anchors. Geometry morphs are precomputed; scrolling changes weights and pose rather than rebuilding geometry. Pixel density is capped and settled scenes stop rendering. MotionProvider alone owns Lenis, with native touch scrolling on mobile. Pause, system reduced motion and unavailable WebGL use composed server-rendered SVG artwork. Text, navigation and product sequences remain readable before animation initializes.

The sculpture uses the logo pigment `#bd4327` with neutral, bounded shading. Section holds, visible margin travel and time-based speed limits prevent rapid folds when scroll speed changes. Transfers between left and right happen in measured empty bands; each project keeps its form until arrival, then slowly folds into the next. Fast scrolling shortens or completes skipped entrances while retaining free scrolling. The hero combines a restrained construction drawing with a single headline entrance; later headings and the portrait reveal once, leaving reading copy stationary. Sarpoli, KaizenCV and Købsklar use replayable, illustrated product workflows that run on their own timeline and pause offscreen. Global pause and reduced motion leave complete static scenes.

[Project story sources](docs/project-story-sources.md) distinguish verified features, fictional demo data and the founder-provided estimate of 80–90% less manual preparation. Købsklar’s separate 10–20 minute figure describes processing time, excluding professional review.

Native CSS scrolling stays immediate. Lenis owns intentional smooth desktop scrolling; applying `scroll-behavior:smooth` to `html` conflicts with Next route restoration and ScrollTrigger's initial layout measurements, including direct hash URLs. Keep this single-owner arrangement when changing navigation.

The website has no tracking pixels or analytics integrations. App update forms require an unchecked app-specific consent checkbox and double opt-in, with independent audiences, signed expiring confirmation links, unsubscribe and fresh-confirmation resubscribe. Shield’s offer form only handles its transactional offer. Contact invitations open email or LinkedIn. Product privacy policies remain separate and are linked from the relevant pages. Daryan’s About portrait uses the supplied photograph without retouching.

## Verification

```sh
npm run typecheck
npm run test:backend
npm run build
npm run test:browser
```

The browser suite expects the local server at port 3000 (override with `PLAYWRIGHT_BASE_URL`) and uses installed Google Chrome. In another environment, change `channel` in `playwright.config.ts` or install a Playwright browser. It checks routes, project order and destinations, inactive Wardrobe, FAQ and gallery controls, keyboard/mobile navigation, image loading, overflow, accessibility, sculpture lifecycle and Shield offer regressions. App audience tests cover consent, isolation, duplicates, token tampering/expiry, unsubscribe/resubscribe, idempotency and delivery retries. Backend tests use an isolated Convex test database and mocked email delivery; they never issue production codes or email real people. `node scripts/review-cinematic.mjs` captures desktop, tablet and mobile homepage evidence into ignored `artifacts/cinematic/`.

Manrope and Instrument Serif are distributed under the SIL Open Font License. Their license notices are included in `public/fonts/`. Shield’s Hanken Grotesk and Fraunces fonts and SIL Open Font License notices are in `public/images/shield-site/fonts/`.
