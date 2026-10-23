# daryanmade

Daryan Kamalifar’s portfolio, built with Next.js 16, React 19, TypeScript, GSAP, Lenis, Three.js and Convex. Includes distinct marketing sites for Vela, Shield Family, Iqra and Twillby, plus optional email updates and testing invitations for all seven products.

## Local development

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run dev` updates the site as files change. For a production preview, stop the development server, then run `npm run build` followed by `npm start`; that preview shows the last build.

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
| `/projects/wardrobe` | Twillby; active preview, digital closet and AI try-on details, email signup; App Store and Google Play coming soon |
| `/projects/kaizencv` | Live; homepage links to the official website |
| `/projects/koebsklar` | Live; homepage links to the official website |
| `/projects/shield-family` | Full product site, learning/allowance story, current update previews, single-email updates and testing signup |
| `/iqra` | Live; word learning, reading, memorization, prayer, film, download and updates |
| `/projects/next-project` | A minimal surprise teaser for 2027 |

Update project copy, status, destinations, features, preview labels and themes in `src/lib/projects.ts`. The homepage follows the table order above in a compact work index. Seven native, exclusive details rows reveal a branded preview, feature overview and destination link before navigation; a small eighth row keeps the 2027 teaser. Keyboard access and expansion work before client JavaScript loads. Twillby uses its original denim-and-cloud mascot scenes, wordmark and Blue + Cloud palette; Shield Family and Iqra each have their own chapter. Product routes use their own navigation, including confirmation and privacy pages. `/projects/vela` and `/villa` permanently redirect to `/vela`; `/projects/iqra` permanently redirects to `/iqra`. Canonicals, structured data, social images and sitemap use the destination routes.

Shield Family’s public free-months promotion has been replaced by a single-email signup. Legacy offer verification, inventory and redemption records remain separate for existing requests; those recipients are never automatically subscribed to product updates. Its ten-image “A day with Shield” sequence appears in one gallery, using the supplied 21 October parent-app compositions. The complete artwork is preserved, optimized for delivery, and identified as app previews with example settings. Vela’s current campaign interface illustrations and Iqra’s live 1.2.0 captures are sourced from the app and Growth repositories. Optimized images and deliberately played videos are local; [media provenance](docs/media-provenance.json) records sources and treatments without exposing workstation paths. Sarpoli’s document sequence is explicitly illustrative. Each product showcase uses its own palette; the portfolio retains paper, ink and orange. Credentials and Apple offer codes are excluded from the repository.

## Danish and English

Every owned page is available in English at its existing URL and in Danish under `/da`. Both are statically rendered with correct document language, canonical links, language alternates, localized social images and sitemap entries. One `[lang]` root layout and the small `src/proxy.ts` rewrite preserve English URLs while allowing language changes through the Next router without reloading the document. The animated EN/DA selector respects reduced motion and preserves the visible reading section. It also hands off private confirmation fragments only to the equivalent first-party page.

Copy is maintained in `src/lib/portfolio-copy.ts`, `src/lib/app-site-copy.ts` and `src/lib/email-copy.ts`, alongside explicit localized privacy content. Native app screenshots remain faithful source captures; narrated films offer Danish and English captions. Signup consent and confirmation emails follow the selected language. See [email operations](docs/app-updates.md) for the additive backend rollout.

## Design and motion

Warm paper, deep ink, brand terracotta, self-hosted Manrope and Instrument Serif, and a dark About section. The hero's interactive “what if?” note connects three starting questions to the projects they became. The collection presents seven visual exhibits: three larger compositions followed by four paired projects, each using its own palette and actual product imagery. Descriptions and destination links are visible immediately. Native disclosures hold the thinking and features behind each project, and a compact index links directly to each exhibit. Twillby uses its own denim mascot and garment artwork.

One Three.js canvas renders the logo's original trefoil knot in brand terracotta satin lacquer inside the hero or closing artwork frame. A slow, fourteen-second idle drift keeps it alive before interaction. On first arrival, the knot flows into a GPU-driven field, forms “A small spark. A wild idea. Something real.” in the loaded brand font, holds a smooth lit lettering surface, then returns to the trefoil. Danish has its own greeting: “En skæv idé. Hvad nu hvis? Lad os prøve.” The sequence waits for most of the sculpture frame to be visible, can be interrupted with the spin action, and releases its temporary geometry and textures afterward. It uses the same canvas and loads no external font or model. Native scroll changes the material's tension and orientation; fine-pointer inspection adds a small damped response. “Give it a spin” adds an interruptible spring turn and surface pulse. The sculpture stays inside its hero and closing frames. The particle scroll journey is disabled. Rendering stops when neither frame is visible, when the document is hidden, or when motion is paused. Frame rate is capped at 45fps on desktop and 30fps on compact screens; pixel density and geometry are capped on phones. Pause preserves the current render; reduced motion and unavailable WebGL use a matching transparent still exported from the same shader. Context loss, route cleanup, image/font loading and frame resizing are handled locally.

Entrance subjects remain completely hidden, including their labels and metadata, until a substantial part of their own subject is visible, with a viewport-based cap for tall sections and short screens. Hero notes below the fold enter independently. Gallery cards enter from zero opacity with a 1.35-second perspective lift, rotation and scale; artwork adds layered translation and more pronounced scroll-driven perspective tilt. Entrance measurements use natural layout positions so the card transform cannot move its own trigger. About and closing notes unfold with three-dimensional line reveals and a drawn thread; layout reads are batched before transform writes. The gallery initializes near the work section, WebGL loads near its artwork in an idle slot, and the homepage does not import Lenis. The homepage uses native scrolling on every device. MotionProvider retains Lenis for the existing desktop product sites and owns their shared reveal behavior; HomeChoreography owns the homepage's one-time text and portrait entrances. Sculpture motion has an independent, demand-driven render loop. Pause freezes the sculpture and restores readable text immediately. Project disclosures work with the keyboard and before JavaScript loads.

Project artwork uses layered scroll parallax and damped pointer depth; reading text stays still. Story panels animate in both directions and can reverse mid-transition. FAQ answers, product-update disclosures and film descriptions also animate opening and closing, respecting reduced motion. Clicks leave a brief terracotta echo. Compact sound and motion buttons have 36px visible faces and 44px hit areas. Sound is off by default: an explicit toggle enables a quiet, synthesized seven-note palette with a three-note knot motif, filtered paper swishes, stereo language transitions and spaced section-arrival accents. A shared compressed mix keeps overlapping gestures controlled; the air texture is cached. Automatic arrival cues use only an already unlocked audio context, respect reduced motion, and play at most once every 1.15 seconds. Muting fades the shared output immediately. Language changes reuse the audio context so their short motif can finish. The preference lasts for the browser session; no audio files are fetched and no AudioContext is created before an opted-in interaction.

Phones use shorter, independently written English and Danish hero and project summaries, with full project detail still available. The work index stays within reach as a horizontally swipeable strip and follows the visible exhibit. Reading sizes, input sizes and touch targets are increased; header tracks and language-selector dimensions stay fixed when menus open or language changes. Data Saver uses the matching still instead of loading WebGL.

[Project story sources](docs/project-story-sources.md) distinguish verified features, fictional demo data and the founder-provided estimate of 80–90% less manual preparation. Købsklar’s separate 10–20 minute figure describes processing time, excluding professional review.

Native CSS scrolling stays immediate. Lenis owns intentional smooth desktop scrolling on product pages; applying `scroll-behavior:smooth` to `html` conflicts with Next route restoration and ScrollTrigger's initial layout measurements, including direct hash URLs. Keep this ownership explicit when changing navigation.

The website has no tracking pixels or analytics integrations. App update forms use one email field, clear consent wording tied to the submit button, and double opt-in, with independent audiences, signed expiring confirmation links, unsubscribe and fresh-confirmation resubscribe. Each product keeps its own consent history and audience. Testing invitations apply only to the consent version that includes them. Contact invitations open email or LinkedIn. Product privacy policies remain separate and are linked from the relevant pages. Daryan’s About portrait uses the supplied photograph without retouching.

## Verification

```sh
npm run typecheck
npm run test:backend
npm run build
npm run test:browser
```

The browser suite expects the local server at port 3000 (override with `PLAYWRIGHT_BASE_URL`) and uses installed Google Chrome. In another environment, change `channel` in `playwright.config.ts` or install a Playwright browser. It checks routes, project order and destinations, enabled Twillby, upcoming store labels, FAQ and gallery controls, keyboard/mobile navigation, image loading, overflow, accessibility, sculpture lifecycle and the removal of Shield’s public offer promotion. App audience tests cover consent, isolation, duplicates, token tampering/expiry, unsubscribe/resubscribe, idempotency and delivery retries. Backend tests use an isolated Convex test database and mocked email delivery; they never issue production codes or email real people. `node scripts/review-cinematic.mjs` captures desktop, tablet and mobile homepage evidence into ignored `artifacts/cinematic/`.

Manrope, Instrument Serif and Twillby’s Newsreader italic are distributed under the SIL Open Font License. Their license notices are included in `public/fonts/`. Shield’s Hanken Grotesk and Fraunces fonts and SIL Open Font License notices are in `public/images/shield-site/fonts/`.
