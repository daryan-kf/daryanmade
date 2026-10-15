"use client";

import { localePath, type Locale } from "@/lib/i18n";
import { appCopy } from "@/lib/app-site-copy";
import { LanguageSwitch } from "./language-switch";
import { useLocale } from "./locale-provider";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShieldOfferForm } from "./shield-offer-form";
import { FaqAccordion } from "./faq-accordion";
import { AppUpdatesForm } from "./app-updates-form";
import { AppUpdatesInline } from "./app-updates-inline";
import { ProductFilm } from "./product-film";
import { ProductMotion } from "./product-motion";
import { ProductGallery } from "./product-gallery";
import styles from "./shield-family-site.module.css";

const APP_STORE_URL = "https://apps.apple.com/app/shield-family-parents-control/id6782042659";

/** The page is one short story: four steps, each one idea, each ending in a nudge to the next. */
const STEPS = [
  { id: "moment", label: "The moment" },
  { id: "how-it-works", label: "How it works" },
  { id: "inside", label: "Inside the app" },
  { id: "good-to-know", label: "Good to know" },
] as const;

function ClaimLink({ children = "Explore the 3-month offer" }: { placement?: string; children?: ReactNode }) {
  const locale = useLocale();
  const t = appCopy(locale);
  return <a href="#offer" className={styles.button}>{typeof children === "string" ? t(children) : children} <Icon name="arrowRight" /></a>;
}

function Brand() {
  const locale = useLocale();
  const t = appCopy(locale);
  return <a href="#top" className={styles.brand} aria-label={t("Shield Family home")}><Image src="/images/shield-site/icon.webp" width={36} height={36} alt="" /><span>{t("shield")}<span>{" "}{t("family")}</span></span></a>;
}

function StepLabel({ n }: { n: number }) {
  const locale = useLocale();
  const t = appCopy(locale);
  return <p className={styles.stepLabel}><span>{t("Step")}{" "}{n}{" "}{t("of")}{" "}{STEPS.length}</span>{t(STEPS[n - 1].label)}</p>;
}

function NextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className={styles.nextLink}><span className={styles.nextCircle}><Icon name="arrowDown" /></span>{children}</a>;
}

const TRUST: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "Built on Apple Screen Time", text: "The limits run on Apple’s own Screen Time on your child’s iPhone or iPad." },
  { icon: "lock", title: "Private by design", text: "Shield never reads messages, photos or browsing. Family data stays in your private iCloud." },
  { icon: "home", title: "One plan, the whole family", text: "Every child gets their own settings. Your co-parent joins the same family." },
  { icon: "phone", title: "iPhone & iPad", text: "A parent device and a child device, both on iOS or iPadOS 26 or later." },
];

const BUBBLES = ["Five more minutes?", "Just this level", "Pleeease", "I’m almost done", "Five more minutes?"];

export function ShieldFamilySite({ locale = "en" }: { locale?: Locale }) {
  const t = appCopy(locale);
  const availability = t("Founding Families · 3 months free");
  const faqs = [1, 2, 3, 5, 6, 7].map((i) => funnelFaqs[i]);
  return (
    <ProductMotion className={styles.site}>
      <div className={styles.announcement}><span>{availability}</span><strong>{t("3 months free for the first 500 families.")}</strong></div>
      <div className={styles.makerBar}><Link href={localePath("/", locale)} aria-label={t("Back to daryanmade")}>{t("← daryanmade")}</Link><span>{t("An independent project by Daryan Kamalifar")}</span><LanguageSwitch locale={locale} /></div>
      <header className={styles.header}>
        <Brand />
        <nav className={styles.headerNav} aria-label={t("Main")}><a href="#how-it-works">{t("How it works")}</a><a href="#inside">{t("Inside the app")}</a><a href="#updates">{t("Updates")}</a><a href="#offer">{t("The offer")}</a></nav>
        <a href="#offer" className={styles.headerCta}>{t("3 months free")}{" "}<Icon name="arrowRight" /></a>
      </header>

      <main id="main-content">
        {/* Hook */}
        <section className={styles.hero} id="shield-hero" aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow} data-hero-fade><span />{" "}{t("Screen time, without the nightly argument")}</p>
            <h1 id="hero-title"><span className={styles.titleLine}><span data-hero-line>{t("A better answer")}</span></span><span className={styles.titleLine}><span data-hero-line>{t("to “five more")}</span></span><span className={`${styles.titleLine} ${styles.titleAccent}`}><span data-hero-line>{t("minutes.”")}</span></span></h1>
            <p className={styles.heroLead} data-hero-fade>{t("You set the limit. They earn a little extra by learning.")}<br /><strong>{t("And bedtime still wins.")}</strong></p>
            <div className={styles.heroAction} data-hero-fade>
              <div className={styles.heroActions}>
                <a href="#moment" className={styles.button}>{t("See how it works")}{" "}<Icon name="arrowDown" /></a>
                <a href="#offer" className={styles.textLink}>{t("Or get 3 months free")}{" "}<Icon name="arrowRight" /></a>
              </div>
              <p className={styles.heroOffer}><span className={styles.offerGift}><Icon name="check" /></span><strong>{t("3 months free")}</strong><span>{t("Eligibility & renewal terms apply")}</span></p>
            </div>
          </div>
          <div className={styles.heroVisual} data-hero-fade><HeroProductPreview /></div>
        </section>

        <div className={styles.productPrinciples}><span><Icon name="shield" />{t("Apple Screen Time underneath")}</span><span><Icon name="book" />{t("Learning that earns a little extra")}</span><span><Icon name="heart" />{t("One shared family plan")}</span></div>

        {/* Step 1 — the problem, in one moment */}
        <section className={`${styles.step} ${styles.momentSection}`} id="moment" aria-labelledby="moment-title">
          <div className={styles.momentGrid}>
            <div data-reveal>
              <div data-reveal-item><StepLabel n={1} /></div>
              <h2 id="moment-title" className={styles.stepTitle} data-reveal-item>{t("8 pm.")}<br /><em>{t("“Five more minutes.”")}</em><br />{t("Again.")}</h2>
              <p className={styles.stepLead} data-reveal-item>{t("It isn’t really about five minutes. It’s the same negotiation every night — and ending it is always the parent’s job.")}</p>
              <p className={styles.stepLead} data-reveal-item><strong>{t("What if the plan did the ending, and the extra minutes had to be earned?")}</strong></p>
              <div data-reveal-item><NextLink href="#how-it-works">{t("Here’s how Shield does it")}</NextLink></div>
            </div>
            <div className={styles.bubbles} aria-hidden="true" data-reveal>
              <span className={styles.bubbleTime} data-reveal-item>{t("7:58 PM")}</span>
              {BUBBLES.map((text, i) => <span key={i} className={styles.bubble} data-reveal-item>{t(text)}</span>)}
            </div>
          </div>
        </section>

        {/* Step 2 — how it works, in three lines */}
        <section className={`${styles.step} ${styles.howSection}`} id="how-it-works" aria-labelledby="how-title">
          <div data-reveal className={styles.stepHead}>
            <div data-reveal-item><StepLabel n={2} /></div>
            <h2 id="how-title" className={styles.stepTitle} data-reveal-item>{t("One plan.")}<br /><em>{t("Agreed once.")}</em></h2>
          </div>
          <div className={styles.storyTrack} data-story-track aria-hidden="true"><span data-story-progress /></div>
          <div className={styles.agreement} data-reveal>
            <div data-story-step data-reveal-item><span className={styles.stepNo}>01</span><p><strong>{t("You set the limit.")}</strong><span>{t("Which apps, how much time each day, and when bedtime starts.")}</span></p><Icon name="shield" /></div>
            <div data-story-step data-reveal-item><span className={styles.stepNo}>02</span><p><strong>{t("They earn a little extra.")}</strong><span>{t("Quiz questions and brain games add minutes, at the rate you choose, up to a daily cap.")}</span></p><Icon name="book" /></div>
            <div data-story-step data-reveal-item><span className={styles.stepNo}>03</span><p><strong>{t("Bedtime still wins.")}</strong><span>{t("Earned time never overrides bedtime or a pause. Asking for more goes to your phone.")}</span></p><Icon name="moon" /></div>
          </div>
          <div className={styles.earnedProof}>
            <EarningDemo />
            <div className={styles.earnedCopy} data-product-enter><p className={styles.featureKicker}>{t("A reward, with a boundary.")}</p><h3>{t("Extra minutes.")}<br /><em>{t("Never an endless day.")}</em></h3><p>{t("You choose how much learning earns a minute, and separate daily caps for quizzes and games. Your child can see the deal. Bedtime still has the last word.")}</p><div className={styles.proofTags}><span>{t("Parent-set earning caps")}</span><span>{t("Clear time balance")}</span><span>{t("Bedtime stays put")}</span></div></div>
          </div>
          <div className={styles.stepFoot}><NextLink href="#inside">{t("See it in the app")}</NextLink></div>
        </section>

        {/* Step 3 — the real app */}
        <section className={`${styles.step} ${styles.gallerySection}`} id="inside" aria-labelledby="gallery-title">
          <div className={styles.galleryHeading} data-reveal>
            <div data-reveal-item><StepLabel n={3} /></div>
            <h2 id="gallery-title" className={styles.stepTitle} data-reveal-item>{t("What your family")}<br /><em>{t("actually sees.")}</em></h2>
            <p className={styles.stepLead} data-reveal-item>{t("Swipe through the real app — your phone, and your child’s.")}</p>
          </div>
          <AppGallery />
          <div className={styles.familyFeatures}>
            <article><span className={styles.featureGlyph}><Icon name="book" /></span><h3>{t("More curiosity.")}<br /><em>{t("A little less scrolling.")}</em></h3><p>{t("Quizzes across real subjects, adaptive difficulty and brain games. Parents can see learning progress across six skills.")}</p><div className={styles.subjectChips}><span>{t("Math")}</span><span>{t("Reading & Words")}</span><span>{t("Science")}</span><span>{t("Logic & Puzzles")}</span></div></article>
            <article><span className={styles.featureGlyph}><Icon name="handoff" /></span><h3>{t("A request.")}<br /><em>{t("Not another argument.")}</em></h3><p>{t("Children can ask for more time. Approve or decline from your phone, with the plan and its boundaries still in view.")}</p><div className={styles.requestIllustration} aria-label={t("Product illustration: a child's request needs a parent's decision")}><span><Icon name="message" />{t("Could I have a little more time?")}</span><strong>{t("Your decision.")}<Icon name="shield" /></strong></div></article>
            <article><span className={styles.featureGlyph}><Icon name="home" /></span><h3>{t("When time ends,")}<br /><em>{t("life keeps going.")}</em></h3><p>{t("Make an offline plan together. Their own choices give them somewhere to land when it’s time to put the screen down.")}</p><div className={styles.landingIllustration}><span>{t("WHAT COMES NEXT?")}</span><p>{t("Build something.")}<br />{t("Head outside.")}<br /><em>{t("Make it their choice.")}</em></p></div></article>
          </div>
          <div className={styles.familyDay}>
            <div className={styles.familyDayHeading}><p className={styles.featureKicker}>{t("For the rest of the family day.")}</p><h3>{t("Good habits.")}<br /><em>{t("A little help around them.")}</em></h3></div>
            <div className={styles.familyDayGrid}>
              <article><span className={styles.familyDayNumber}>{t("01 / SKILL LAB")}</span><h4>{t("Try it. Understand it.")}<br />{t("Take it into real life.")}</h4><p>{t("Short lessons combine something to try, a clear explanation and a real-life idea. Learning can be a moment of curiosity, too.")}</p></article>
              <article><span className={styles.familyDayNumber}>{t("02 / A FAMILIAR RHYTHM")}</span><h4>{t("School. Dinner.")}<br />{t("Time to wind down.")}</h4><p>{t("Set recurring downtime and bedtime for each child or the whole family. Add practical routine jobs, with minutes awarded after a parent approves.")}</p></article>
              <article><span className={styles.familyDayNumber}>{t("03 / WHEN YOU WANT TO KNOW")}</span><h4>{t("They’re home.")}<br />{t("You can breathe.")}</h4><p>{t("Optional family location brings a live map, arrival and departure alerts, and an activity timeline. Location sharing is opt-in and parent-controlled.")}</p></article>
            </div>
          </div>
          <ProductGallery locale={locale} name="Shield Family" title={t("One family. A whole day.")} images={[
            { src: "/images/shield-site/campaign-01.webp", label: t("A shared overview"), alt: t("Shield Family campaign artwork: family screen time at the start of the day") },
            { src: "/images/shield-site/campaign-03.webp", label: t("Homework first"), alt: t("Shield Family campaign artwork: a weekday homework downtime window") },
            { src: "/images/shield-site/campaign-04.webp", label: t("Earn by learning"), alt: t("Shield Family campaign artwork: learning earns minutes within the parent-set cap") },
            { src: "/images/shield-site/campaign-06.webp", label: t("Home, safely"), alt: t("Shield Family campaign artwork: a family map with a home arrival notification") },
          ]} disclosure={t("Update preview · Submitted-release campaign artwork with example family data. Features and interface may differ from the current App Store release.")} />
          <AppUpdatesInline locale={locale} app="shield-family" />
          <div className={styles.stepFoot}><NextLink href="#shield-film">{t("Watch the idea come to life")}</NextLink></div>
        </section>

        <section className={styles.filmSection} id="shield-film" aria-labelledby="shield-film-title">
          <div className={styles.filmHeading} data-product-enter><div><p className={styles.featureKicker}>{t("A little learning changes the conversation.")}</p><h2 id="shield-film-title">{t("“Five more minutes?”")}<br /><em>{t("Here’s a different answer.")}</em></h2></div><p>{t("Calm control for you.")}<br />{t("Clear choices for them.")}</p></div>
          <ProductFilm locale={locale} src="/videos/shield-family/earned-by-learning.mp4" captions="/videos/shield-family/earned-by-learning.en.vtt" poster="/images/shield-site/film-poster.webp" title={t("Shield Family: earned by learning")} caption={t("24 seconds · A campaign illustration of learning within parent-set limits.")} transcript={t("Five more minutes? Earn them. Every right answer adds a little time. Earned by learning. And the limit still holds. Calm control for you. Clear choices for them. Shield Family.")} />
        </section>

        {/* Step 4 — trust and the three questions that matter */}
        <section className={`${styles.step} ${styles.trustSection}`} id="good-to-know" aria-labelledby="trust-title">
          <div className={styles.stepHead} data-reveal>
            <div data-reveal-item><StepLabel n={4} /></div>
            <h2 id="trust-title" className={styles.stepTitle} data-reveal-item>{t("Made for families.")}<br /><em>{t("Kept private.")}</em></h2>
          </div>
          <ul className={styles.trustGrid} data-reveal>
            {TRUST.map((item) => <li key={item.title} data-reveal-item><span className={styles.trustIcon}><Icon name={item.icon} /></span><strong>{t(item.title)}</strong><p>{t(item.text)}</p></li>)}
          </ul>
          <FaqAccordion className={styles.faqList} items={faqs.map(({ question, answer }) => ({ question: t(question), answer: <p>{t(answer)}</p> }))} />
          <div className={styles.stepFoot}><NextLink href="#offer">{t("Your 3 free months")}</NextLink></div>
        </section>

        {/* The offer */}
        <section className={styles.offerSection} id="offer" aria-labelledby="offer-title">
          <div className={styles.offerIntro} data-reveal>
            <p className={styles.offerEyebrow} data-reveal-item>{t("Founding Families · the first 500")}</p>
            <h2 id="offer-title" data-reveal-item><span data-offer-word>{t("3 months.")}</span><span data-offer-word>{t("Free.")}</span></h2>
            <p data-reveal-item>{t("The full app for your whole family. Every child, your co-parent, and a shared plan to start with.")}</p>
          </div>
          <ol className={styles.claimSteps} aria-label={t("How to get the offer")} data-reveal><li data-reveal-item><b>1</b>{" "}{t("Choose your plan")}</li><li data-reveal-item><b>2</b>{" "}{t("Confirm your email")}</li><li data-reveal-item><b>3</b>{" "}{t("Redeem your Apple code")}</li></ol>
          <div className={styles.offerForm} data-reveal><ShieldOfferForm /></div>
          <p className={styles.offerCancel}><Icon name="lock" />{" "}{t("Cancel anytime in your Apple settings, at least 24 hours before it renews.")}</p>
          <a href={localePath("/projects/shield-family/redeem", locale)} className={styles.redeemHelp}>{t("See how redemption works")}{" "}<Icon name="arrowRight" /></a>
        </section>

        {/* Download */}
        <section className={styles.download} id="download" aria-labelledby="download-title" data-reveal>
          <h2 id="download-title" className={styles.stepTitle} data-reveal-item>{t("Get Shield")}<br /><em>{t("on iPhone & iPad.")}</em></h2>
          <p className={styles.stepLead} data-reveal-item>{t("If you use a valid offer code, redeem it before starting a subscription. Apple confirms eligibility and the exact terms.")}</p>
          <div className={styles.downloadRow} data-reveal-item>
            <div className={styles.qrCard}>
              <a href={APP_STORE_URL} className={styles.qr} aria-label={t("Open Shield Family on the App Store")}><Image src="/images/shield-site/app-store-qr.png" width={132} height={132} alt={t("QR code for Shield Family on the App Store")} /></a>
              <p><strong>{t("Scan with your iPhone")}</strong>{t("Point the camera at the code.")}</p>
            </div>
            <div className={styles.downloadActions}>
              <AppStoreLink className={styles.appStoreLink} source="download"><AppleMark /><span>{t("Download on the")}<br /><strong>{t("App Store")}</strong></span></AppStoreLink>
              <ClaimLink placement="download">{t("Get my 3 free months")}</ClaimLink>
            </div>
          </div>
          <p className={styles.downloadNote} data-reveal-item>{t("A parent device and a child device · iOS / iPadOS 26 or later")}</p>
        </section>
        <section className={styles.updatesSection}><AppUpdatesForm app="shield-family" id="updates" /></section>
      </main>
      <footer className={styles.footer} id="shield-footer"><Brand /><nav aria-label={t("Footer")}><a href={localePath("/projects/shield-family#offer", locale)}>{t("Recover your code")}</a><a href={localePath("/projects/shield-family#inside", locale)}>{t("Setup help")}</a><a href={localePath("/projects/shield-family/privacy", locale)}>{t("Website privacy")}</a><a href="https://daryan-kf.github.io/kidshield-legal/privacy.html">{t("App privacy")}</a><a href="https://daryan-kf.github.io/kidshield-legal/terms.html">{t("Terms")}</a><a href="mailto:info@sarpoli.com">{t("Contact")}</a></nav><p>© {new Date().getFullYear()}{" "}{t("Shield Family")}</p></footer>
      <MobileOffer />
    </ProductMotion>
  );
}

function HeroProductPreview() {
  const locale = useLocale();
  const t = appCopy(locale);
  return <figure className={styles.heroStage} data-product-fan aria-label={t("Shield Family native app previews for parents and children")}>
    <div className={styles.stageOrbit} aria-hidden="true" /><div className={styles.stageDisc} aria-hidden="true" />
    <div className={styles.parentDevice} data-fan-phone><span>{t("YOUR PHONE")}</span><div className={styles.phone}><Image src="/images/shield-site/parent-home.webp" width={1170} height={2532} sizes="(max-width: 700px) 42vw, 235px" loading="eager" alt={t("Shield Family parent preview: family overview and a child's device setup")} /></div></div>
    <div className={styles.childDevice} data-fan-phone><span>{t("THEIR WORLD")}</span><div className={styles.phone}><Image src="/images/shield-site/child-home.webp" width={1170} height={2532} sizes="(max-width: 700px) 43vw, 245px" loading="eager" alt={t("Shield Family child preview: time status, learning questions and brain games")} /></div></div>
    <div className={styles.stageNote}><Icon name="heart" /><div>{t("Two perspectives.")}<br /><strong>{t("One family plan.")}</strong></div></div>
    <figcaption>{t("Native development preview · Example family data")}</figcaption>
  </figure>;
}

/** An explanation of the product model, deliberately separate from native app UI. */
function EarningDemo() {
  const locale = useLocale();
  const t = appCopy(locale);
  const figure = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotion.current = preference.matches;
      if (preference.matches) setPlaying(false);
      setReady(!preference.matches);
    };
    updatePreference();
    preference.addEventListener("change", updatePreference);

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (reducedMotion.current) return;
      setPlay(1);
      setPlaying(true);
    }, { threshold: 0.4 });
    if (figure.current) observer.observe(figure.current);
    return () => {
      preference.removeEventListener("change", updatePreference);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setPlaying(false), 4500);
    return () => window.clearTimeout(timer);
  }, [play, playing]);

  return (
    <figure ref={figure} className={styles.demo} aria-label={t("How Shield works: parents set the daily allowance and earning cap. Children can earn extra screen time through learning. Bedtime still applies.")}>
      <div className={styles.topline}>
        <span>{t("A little learning. A little extra.")}</span>
        <button
          type="button"
          className={styles.replay}
          hidden={!ready}
          disabled={playing}
          aria-busy={playing}
          aria-label={t("Replay the learning and screen-time illustration")}
          onClick={() => {
            if (reducedMotion.current) return;
            setPlay((value) => value + 1);
            setPlaying(true);
          }}
        >
          <Icon name="refresh" />
          <span>{t("Replay")}</span>
        </button>
      </div>

      <div key={play} className={styles.explanation} data-playing={playing || undefined} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.boundary}>
          <svg className={styles.ring} viewBox="0 0 400 400" fill="none">
            <circle className={styles.ringField} cx="200" cy="200" r="177" />
            <path className={styles.track} d="M79.73 300.92A157 157 0 1 1 328.61 290.05" />
            <path className={styles.allowanceArc} d="M79.73 300.92A157 157 0 1 1 335.97 121.5" />
            <path className={styles.earnedArc} d="M335.97 121.5A157 157 0 0 1 328.61 290.05" />
            <path className={styles.capMarker} d="M314.68 280.3 342.53 299.8" />
          </svg>
          <div className={styles.boundaryCopy}>
            <span>{t("You set the limits")}</span>
            <strong>{t("Extra time.")}<br /><em>{t("Your terms.")}</em></strong>
            <span className={styles.bedtime}><Icon name="moon" />{t("Bedtime still applies")}</span>
          </div>
          <span className={styles.cap}><Icon name="lock" />{t("Your cap")}</span>
        </div>

        <div className={styles.learning}>
          <span className={styles.learningEyebrow}>{t("A little learning")}</span>
          <svg className={styles.bookArt} viewBox="0 0 180 126" fill="none">
            <path d="M21 38 82 28 153 46 145 106 80 90 16 100 21 38Z" fill="#332C9E" />
            <path d="M28 25C48 18 69 19 88 28L82 83C63 74 41 74 22 82L28 25Z" fill="#CECAFF" stroke="#5856D6" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M88 28C110 19 133 23 156 35L150 91C127 80 105 77 82 83L88 28Z" fill="#EEECFF" stroke="#5856D6" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m91 30-6 52" stroke="#5856D6" strokeWidth="2" />
            <path d="m38 39 32-2M36 50l31-1M35 61l22-1M107 39l31 6M105 50l31 6M104 61l20 4" stroke="#8E85D9" strokeWidth="2" strokeLinecap="round" />
            <path d="m126 25 12 4-3 27-6-6-6 2 3-27Z" fill="#F08A18" />
            <path d="m151 8 2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8Z" fill="#5856D6" />
            <circle cx="21" cy="17" r="3" fill="#F08A18" />
          </svg>
          <strong>{t("Learn. Earn.")}</strong>
          <span className={styles.learningNote}>{t("Extra minutes through learning.")}</span>
          <span className={styles.learningCheck}><Icon name="check" /></span>
        </div>

        <svg className={styles.connection} viewBox="0 0 166 91" fill="none">
          <path d="M5 30C35 2 88 7 112 25c18 13 24 31 22 53" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="m126 70 8 10 10-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={styles.token}><Icon name="clock" /><b>{t("+ time")}</b></span>
        <span className={styles.extraLabel}>{t("They earn the extra.")}</span>
      </div>

      <div className={styles.legend} aria-hidden="true">
        <span><i />{t("Daily allowance")}</span>
        <span><i />{t("Earned extra")}</span>
      </div>
      <figcaption className={styles.caption}>{t("Illustration · You choose the limits. Bedtime still applies.")}</figcaption>
    </figure>
  );
}

/** Only authentic captures of the current native build belong in this gallery. */
const appScreens: { file: string; title: string; alt: string }[] = [
  {
    file: "parent-home.webp",
    title: "Connect your family",
    alt: "Parent Today view with Mia’s profile and a prompt to connect her device. Setup is not yet complete.",
  },
  {
    file: "daily-limits.webp",
    title: "Choose the daily boundaries",
    alt: "Parent Screen Time controls for daily allowance, app access, bedtime and capped learning rewards. Example settings are saved while the device awaits connection.",
  },
  {
    file: "child-home.webp",
    title: "A clear place to begin",
    alt: "Mia’s day shows her time status, Game of the Day, and Math, Science, Reading and Logic question games. No app limit is active in this example.",
  },
  {
    file: "learning.webp",
    title: "A little learning along the way",
    alt: "A question from Shield’s Math learning activity, running in the native app with example family data.",
  },
  {
    file: "time-plan.webp",
    title: "Their time, explained",
    alt: "The child’s expanded time plan shows a saved allowance and bedtime timeline, with a reminder that bedtime and pauses still apply. No limited apps have been chosen in this example.",
  },
];

function AppGallery() {
  const locale = useLocale();
  const t = appCopy(locale);
  return <>
    <div className={styles.gallery} role="region" aria-label={t("Shield Family app screenshots")} tabIndex={0} data-reveal>
      {appScreens.map((screen) => <figure key={screen.file} data-gallery-item data-reveal-item>
        <a href={`/images/shield-site/${screen.file}`} target="_blank" rel="noopener noreferrer" aria-label={locale === "da" ? `Åbn skærmbilledet ${t(screen.title)} i fuld størrelse` : `Open full-size ${screen.title} screenshot`}>
          <div className={styles.phone}><Image src={`/images/shield-site/${screen.file}`} alt={t(screen.alt)} width={1170} height={2532} quality={85} sizes="(max-width: 600px) 215px, 205px" /></div>
        </a><figcaption>{t(screen.title)}</figcaption>
      </figure>)}
    </div>
    <p className={styles.note}>{t("Development preview · Actual native app with example family data.")}<br />{t("Screens may differ from the current App Store release.")}</p>
  </>;
}

function AppleMark({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 28" fill="currentColor" aria-hidden="true"><path d="M19.1 14.9c0-3.4 2.8-5.1 2.9-5.2-1.6-2.4-4.1-2.7-5-2.7-2.1-.2-4.1 1.3-5.1 1.3-1.1 0-2.7-1.3-4.4-1.2-2.3 0-4.5 1.4-5.7 3.4-2.4 4.2-.6 10.4 1.8 13.8 1.2 1.7 2.5 3.5 4.3 3.4 1.7-.1 2.4-1.1 4.5-1.1s2.7 1.1 4.5 1c1.9 0 3.1-1.7 4.2-3.4 1.3-1.9 1.8-3.7 1.9-3.8-.1 0-3.9-1.5-3.9-5.5ZM15.8 4.7C16.8 3.5 17.5 1.9 17.3.2c-1.5.1-3.2 1-4.3 2.2-1 1.1-1.8 2.8-1.6 4.4 1.6.1 3.3-.8 4.4-2.1Z" /></svg>;
}



function AppStoreLink({ children, className }: { children?: ReactNode; className?: string; source?: string }) {
  const locale = useLocale();
  const t = appCopy(locale);
  return <a href={APP_STORE_URL} className={className}>{children ?? <><AppleMark /><span>{t("Download on the")}<strong>{t("App Store")}</strong></span></>}</a>;
}

function MobileOffer() {
  const locale = useLocale();
  const t = appCopy(locale);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("shield-hero");
    const offer = document.getElementById("offer");
    const footer = document.getElementById("shield-footer");
    let heroVisible = true, offerVisible = false, footerVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === offer) offerVisible = entry.isIntersecting;
        if (entry.target === footer) footerVisible = entry.isIntersecting;
      }
      setVisible(!heroVisible && !offerVisible && !footerVisible);
    });
    for (const element of [hero, offer, footer]) if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <aside className={styles.sticky} hidden={!visible} aria-label={t("Shield Family offer")}><span>{t("Three months of family time")}<small>{t("For eligible new subscribers · conditions apply")}</small></span><a href="#offer" className={styles.button}>{t("See the offer")}{" "}<Icon name="arrowRight" /></a></aside>;
}

type IconName =
  | "clock"
  | "earn"
  | "wallet"
  | "home"
  | "moon"
  | "agreement"
  | "book"
  | "lock"
  | "check"
  | "x"
  | "source"
  | "arrowRight"
  | "arrowDown"
  | "arrowUp"
  | "external"
  | "message"
  | "handoff"
  | "heart"
  | "minus"
  | "plus"
  | "shield"
  | "star"
  | "hourglass"
  | "bell"
  | "printer"
  | "sheet"
  | "gift"
  | "refresh"
  | "pen"
  | "basket"
  | "phone"
  | "pause"
  | "play"
  | "calendar"
  | "pin";

const paths: Record<IconName, React.ReactNode> = {
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5l3.2 2" /></>,
  earn: <><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" /><path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" /></>,
  wallet: <><path d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" /><path d="M16 12h4v4h-4a2 2 0 1 1 0-4Z" /></>,
  home: <><path d="m3.5 11 8.5-7 8.5 7" /><path d="M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" /></>,
  moon: <path d="M19.5 15.3A8.2 8.2 0 0 1 8.7 4.5 8.3 8.3 0 1 0 19.5 15.3Z" />,
  agreement: <><path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Z" /><path d="m8.5 10 2 2 5-5" /></>,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" /></>,
  lock: <><rect x="4.5" y="10" width="15" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2" /></>,
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  x: <path d="m6.5 6.5 11 11m0-11-11 11" />,
  source: <><path d="M6 2.5h8l4 4V21.5H6V2.5Z" /><path d="M14 2.5v4h4M9 11h6M9 15h6" /></>,
  arrowRight: <><path d="M5 12h13" /><path d="m14 7 5 5-5 5" /></>,
  arrowDown: <><path d="M12 5v13" /><path d="m7 14 5 5 5-5" /></>,
  arrowUp: <><path d="M12 19V6" /><path d="m7 10 5-5 5 5" /></>,
  external: <><path d="M13 5h6v6" /><path d="m19 5-8 8" /><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" /></>,
  message: <><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="M8 9h8M8 13h5" /></>,
  handoff: <><path d="M4 12h5l2-2 3 3-2 2" /><path d="m13 7 2-2 5 5-6.5 6.5a2.1 2.1 0 0 1-3 0L7 13" /><path d="M4 8 2 10l5 5" /></>,
  heart: <path d="M20.8 5.7a5.2 5.2 0 0 0-7.4 0L12 7.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-7.9a5.2 5.2 0 0 0 0-7.4Z" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  shield: <><path d="M12 2.5 20 6v5.5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3.5Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  star: <path fill="currentColor" stroke="none" d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.1l-5.7 3 1.2-6.3-4.6-4.4 6.3-.8L12 2.8Z" />,
  hourglass: <><path d="M6.5 3h11M6.5 21h11" /><path d="M7.5 3c0 4.5 4.5 5.5 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 5.5-4.5 9s4.5 4.5 4.5 9" /></>,
  bell: <><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15l1.5-2Z" /><path d="M10 21h4" /></>,
  printer: <><path d="M7 8V3h10v5" /><rect x="3" y="8" width="18" height="9" rx="2" /><path d="M7 14h10v7H7z" /></>,
  sheet: <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M3.5 9.5h17M3.5 15h17M9.5 9.5v11" /></>,
  gift: <><rect x="3.5" y="8.5" width="17" height="4" rx="1" /><path d="M5 12.5v8h14v-8M12 8.5v12" /><path d="M12 8.5S10.5 3.5 8 4.5 9 8.5 12 8.5Zm0 0s1.5-5 4-4-1 4-4 4Z" /></>,
  refresh: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4v4h-4" /></>,
  pen: <><path d="m14.5 5.5 4 4L9 19H5v-4l9.5-9.5Z" /><path d="M3 22h18" /></>,
  basket: <><path d="M3 10h18l-2 10H5L3 10Z" /><path d="m8 10 3-6m5 6-3-6M9 14v2.5m6-2.5v2.5" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></>,
  pause: <path d="M9 5.5v13M15 5.5v13" />,
  play: <path d="M8 5.5v13l10-6.5-10-6.5Z" />,
  pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4m8-4v4" /></>,
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/** Public copy stays separate from the visual treatment. Screens show example data. */
const funnelFaqs = [
  { question: "What exactly do the three free months include?", answer: "Full access to Shield Family on the monthly, 3-month or yearly plan you choose, for eligible new subscribers who redeem a valid offer code. One family subscription covers all your children. The app helps you build a shared family plan." },
  { question: "What happens after the free period?", answer: "Your chosen subscription renews automatically. A monthly plan begins monthly billing; a 3-month plan charges the 3-month price every three months; a yearly plan charges the full annual price for the following year. Check your local price before claiming and review the exact amount and renewal date in Apple’s confirmation screen. Cancel in Apple Account settings at least 24 hours before the free period ends to avoid renewal." },
  { question: "Which devices does our family need?", answer: "A compatible parent device and child device: iPhone or iPad running iOS or iPadOS 26 or later. You connect them as a family and approve Apple Screen Time permissions during setup. Shield does not support Android or manage gaming consoles. Learning content is currently in English." },
  { question: "Can my child earn unlimited extra minutes?", answer: "No. You choose the earning rate and separate daily caps for quizzes and games. Learning can continue after a cap is reached, but stops adding time. Bedtime is a separate boundary, even when earned minutes remain. Unused earned minutes do not bank into another day." },
  { question: "How is this different from Apple’s Screen Time?", answer: "Shield uses Apple Screen Time to restrict the apps you select. It adds learning that can earn time, a visible balance for your child, parent-approved requests for more time, and a shared family view. The earning limits stay in your hands." },
  { question: "Does Shield read private messages?", answer: "Shield does not read your child’s messages, photos, or browsing content. Family information syncs through your family’s private iCloud. Location sharing is optional. The website has a separate privacy policy explaining the information needed to verify your email and send your offer code." },
  { question: "Can my co-parent and other children join?", answer: "Yes. Invite your co-parent to the same family and give each child their own settings. One family subscription includes all children. Remote changes and shared information depend on connectivity and the required permissions." },
  { question: "How do I use my code?", answer: "Confirm your email to reveal your unique code. On your iPhone or iPad, use the redemption button to open Apple’s offer screen. Review and confirm the offer, then open Shield to connect your family. There is also a step-by-step guide for entering the code manually." },
  { question: "Do I have to give feedback to keep the offer?", answer: "No. Your offer does not depend on feedback. We only use your signup email for confirmation, your requested code and help with this offer." },
];
