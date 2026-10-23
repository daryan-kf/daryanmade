import { localePath, type Locale } from "@/lib/i18n";
import { appCopy } from "@/lib/app-site-copy";
import { LanguageSwitch } from "./language-switch";
import Image from "next/image";
import Link from "next/link";
import { AppUpdatesForm } from "@/components/app-updates-form";
import { AppUpdatesInline } from "@/components/app-updates-inline";
import { AppleIcon, Arrow } from "./icons";
import { FaqAccordion } from "./faq-accordion";
import { ProductFilm } from "./product-film";
import { ProductMotion } from "./product-motion";
import { ProductGallery } from "./product-gallery";
import styles from "./iqra-site.module.css";

const STORE = "https://apps.apple.com/app/id6797948777";
const IMAGE = "/images/iqra-site/";

function Download({ small = false, locale = "en" }: { small?: boolean; locale?: Locale }) {
  const t = appCopy(locale);
  return <a href={STORE} className={small ? styles.smallButton : styles.button}><AppleIcon /><span>{small ? t("Get Iqra") : t("Download Iqra")}</span><Arrow diagonal /></a>;
}

function Screen({ file, alt, eager = false }: { file: string; alt: string; eager?: boolean }) {
  return <div className={styles.phone}><Image src={`${IMAGE}${file}.webp`} width={900} height={1951} alt={alt} sizes="(max-width: 700px) 65vw, 310px" loading={eager ? "eager" : "lazy"} /></div>;
}



export function IqraSite({ locale = "en" }: { locale?: Locale }) {
  const t = appCopy(locale);
  const questions = [
  { question: t("What else can I explore in Iqra?"), answer: <p>{t("Alongside reading and memorisation, Iqra includes prayer times, qibla, guided salah, duas, the 99 Names, sourced stories and hadith with grading and attribution. Personal bookmarks, notes and a word bank keep your learning together.")}</p> },
  { question: t("Can I begin if I don’t read Arabic?"), answer: <p>{t("Yes. Word-by-word reading brings together recorded word audio, pronunciation support and meaning. You can also begin with the Arabic course and its 16 lessons. These are tools to support learning, not a replacement for a qualified teacher.")}</p> },
  { question: t("Is every feature really free?"), answer: <p>{t("Yes. Reading, learning, memorization and the full collection of tools are free. An optional subscription supports Iqra and removes ads. It does not unlock any features or content. No account is needed.")}</p> },
  { question: t("Does Iqra work offline?"), answer: <p>{t("The Quran, bundled English translation and learning libraries are available on your device. Recitation, word audio, extra translations, commentary and Mushaf fonts may need an initial download. Download your chosen recitation before you travel.")}</p> },
  { question: t("How does memorization work?"), answer: <p>{t("Iqra separates new learning, recent revision and longer-term review. Listen, read, cover and recall a passage, with help when you need it. Your practice history stays intact when a day does not go to plan.")}</p> },
  { question: t("Who recites the Quran?"), answer: <p>{t("Quranic recitation always comes from human reciters. Iqra offers 12 recitation options, including different styles. Word recognition can help check which words were heard; it does not judge tajweed or pronunciation quality.")}</p> },
  { question: t("What happens to my personal notes and progress?"), answer: <p>{t("Your personal records are stored on your device, without an Iqra account or public leaderboard. Downloads, optional system speech services, adverts and purchases have their own processing. The app privacy policy explains these services.")}</p> },
];
  return <ProductMotion className={styles.site}>
    <div className={styles.maker}><Link href={localePath("/", locale)}>{t("← daryanmade")}</Link><span>{t("An independent app. A considered beginning.")}</span><LanguageSwitch locale={locale} /></div>
    <header className={styles.header}><a href="#top" className={styles.brand}><Image src={`${IMAGE}icon.webp`} width={38} height={38} alt="" /><span>{t("Iqra")}</span></a><nav aria-label={t("Iqra navigation")}><a href="#begin">{t("Begin")}</a><a href="#learn">{t("Learn & remember")}</a><a href="#daily">{t("Every day")}</a><a href="#updates">{t("Updates")}</a></nav><Download locale={locale} small /></header>
    <main id="main-content">
      <section className={styles.hero} aria-labelledby="iqra-title">
        <div className={styles.heroCopy}><p className={styles.eyebrow}><span />{" "}{t("One word at a time.")}</p><h1 id="iqra-title" data-product-enter>{t("You don’t have")}<br />{t("to know Arabic")}<br /><em>{t("to begin.")}</em></h1><p className={styles.lead}>{t("Read the Quran word by word, with recorded audio, transliteration, meaning and tafsir. Learn Arabic, practise memorisation and find prayer tools for the rest of your day.")}</p><div className={styles.heroActions}><Download locale={locale} /><a href="#begin" className={styles.textLink}>{t("Find your beginning")}{" "}<Arrow /></a></div><p className={styles.freeNote}>{t("Every feature is free. No account needed.")}</p></div>
        <div className={styles.heroArt}>
          <div className={styles.arch} aria-hidden="true"><span /><span /><span /></div>
          <div className={styles.heroPhone}><Screen file="read" alt={t("Iqra's real word-by-word Quran reader showing Al-Fatihah with Arabic, pronunciation support and English meaning")} eager /></div>
          <div className={styles.readingLabel}><span aria-hidden="true">01</span><div>{t("A familiar voice.")}<br /><strong>{t("A clearer understanding.")}</strong></div></div>
          <span className={styles.artFootnote}>{t("THE QURAN, WITH A WAY IN FOR EVERY LEVEL.")}</span>
        </div>
      </section>

      <div className={styles.principles}><span>{t("All 114 surahs")}</span><b aria-hidden="true">·</b><span>{t("Word-by-word audio")}</span><b aria-hidden="true">·</b><span>{t("Your own pace")}</span><b aria-hidden="true">·</b><span>{t("Free to begin. Free to continue.")}</span></div>

      <section className={styles.readingSection} id="begin" aria-labelledby="begin-title">
        <div className={styles.sectionTitle} data-product-enter><p className={styles.eyebrow}>{t("01 / A smaller, simpler beginning")}</p><h2 id="begin-title">{t("A whole page becomes")}<br /><em>{t("one manageable word.")}</em></h2></div>
        <div className={styles.readingStory} data-reading-scene>
          <figure className={styles.readingFigure}><div className={styles.readingPaper}><Screen file="read" alt={t("The Iqra Quran reader keeps Arabic words and their English meaning together")} /></div><figcaption>{t("Real Iqra interface · Al-Fatihah")}</figcaption></figure>
          <div className={styles.readingSteps}>
            <article data-reading-marker><span>{t("01 — HEAR IT")}</span><h3>{t("A word has")}<br /><em>{t("a voice.")}</em></h3><p>{t("Tap a word to hear its recorded sound. Follow the words as the human reciter reaches them, so there is a clear place to look and listen.")}</p><div className={styles.soundLine} aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <i key={i} style={{ height: `${5 + ((i * 13) % 23)}px` }} />)}</div></article>
            <article data-reading-marker><span>{t("02 — FIND YOUR WAY")}</span><h3>{t("A little help")}<br /><em>{t("with the unfamiliar.")}</em></h3><p>{t("Keep pronunciation support close while you learn. Choose word-by-word reading, Arabic with meaning, meaning on its own, or the familiar Mushaf page.")}</p><div className={styles.pageTabs} aria-hidden="true"><span>{t("Words")}</span><span>{t("Meaning")}</span><span>{t("Mushaf")}</span></div></article>
            <article data-reading-marker><span>{t("03 — UNDERSTAND IT")}</span><h3>{t("Leave with more")}<br /><em>{t("than the sound.")}</em></h3><p>{t("Read a verse’s meaning, explore its commentary, and save a word you want to return to. Your reading becomes the starting point for your learning.")}</p><span className={styles.bookmarkNote}>{t("↳ Keep this word for another day.")}</span></article>
          </div>
        </div>
      </section>

      <section className={styles.learningSection} id="learn" aria-labelledby="learn-title">
        <div className={styles.learningHeading} data-product-enter><p className={styles.eyebrow}>{t("02 / Begin where you are")}</p><h2 id="learn-title">{t("Learn the next thing.")}<br /><em>{t("Keep what you know.")}</em></h2><p>{t("There is room for a first lesson.")}<br />{t("And for the practice of coming back.")}</p></div>
        <div className={styles.learningGrid}>
          <article className={styles.beginnerCard}><span className={styles.cardIndex}>{t("THE FIRST STEPS")}</span><h3>{t("Start with")}<br /><em>{t("the foundations.")}</em></h3><p>{t("Letters, vowels, joining sounds and introductory tajweed. Sixteen lessons, with time to learn, practise and check your understanding.")}</p><div className={styles.lessonSteps} aria-label={t("Learning steps")}><span><b>01</b>{" "}{t("Learn")}</span><i aria-hidden="true" /><span><b>02</b>{" "}{t("Practise")}</span><i aria-hidden="true" /><span><b>03</b>{" "}{t("Try again")}</span></div><a href={STORE}>{t("Begin with Iqra")}{" "}<Arrow /></a><div className={styles.lessonDecoration} aria-hidden="true">{t("a beginning")}<br /><em>{t("is enough.")}</em></div></article>
          <article className={styles.memorizeCard}><div><span className={styles.cardIndex}>{t("THE WORDS YOU KEEP")}</span><h3>{t("A little new.")}<br /><em>{t("A little remembered.")}</em></h3><p>{t("New learning, recent revision and longer-term review, each with its own place. Listen, read, cover and recall at your pace.")}</p></div><div className={styles.memorizePhone}><Screen file="memorize" alt={t("Iqra Memorize screen showing a daily plan for new verses, recent revision and longer-term review")} /></div></article>
        </div>
        <p className={styles.gentleNote}>{t("No public rankings. No comparison.")}<br /><strong>{t("A private place for your practice.")}</strong></p>
      </section>

      <section className={styles.dailySection} id="daily" aria-labelledby="daily-title">
        <div className={styles.dailyCopy} data-product-enter><p className={styles.eyebrow}>{t("03 / A place in the everyday")}</p><h2 id="daily-title">{t("A moment to pause.")}<br /><em>{t("A way to return.")}</em></h2><p>{t("Know the next prayer. Learn the steps of salah. Find a dua for the moment you’re in.")}</p><div className={styles.dailyFeatures}><article><span>01</span><div><h3>{t("Your prayer day, at a glance.")}</h3><p>{t("Prayer times calculated on your phone, a countdown to the next prayer and a qibla compass. Enable only the reminders you want.")}</p></div></article><article><span>02</span><div><h3>{t("One step, then the next.")}</h3><p>{t("Wudu, posture, words and meaning, with a guided prayer experience for learning.")}</p></div></article><article><span>03</span><div><h3>{t("Words for this moment.")}</h3><p>{t("Explore sourced duas and adhkar for everyday needs, with meaning close by.")}</p></div></article></div></div>
        <div className={styles.prayerScene}><div className={styles.dayArc} aria-hidden="true"><i /><b /></div><div className={styles.prayerPhone}><Screen file="prayer" alt={t("Iqra prayer overview with the next-prayer countdown and daily prayer times")} /></div><div className={styles.prayerNote}>{t("A rhythm for your day.")}<br /><em>{t("Room for your life.")}</em></div></div>
      </section>

      <section className={styles.librarySection} aria-labelledby="library-title"><div className={styles.sectionTitle} data-product-enter><p className={styles.eyebrow}>{t("04 / Follow your curiosity")}</p><h2 id="library-title">{t("More to understand.")}<br /><em>{t("Always with context.")}</em></h2></div><div className={styles.libraryGrid}>
        <article><span className={styles.libraryNumber}>86</span><h3>{t("Stories, thoughtfully told.")}</h3><p>{t("Original English reading, with references alongside the story. Explore prophets, seerah, history and more.")}</p><Image src={`${IMAGE}stories.webp`} width={900} height={1951} alt={t("Iqra's sourced story library")} sizes="(max-width: 700px) 60vw, 260px" /></article>
        <article><span className={styles.libraryNumber}>99</span><h3>{t("Names to know and reflect on.")}</h3><p>{t("Meaning, reflection and source notes, with practice to help you remember what you’ve learned.")}</p><Image src={`${IMAGE}names.webp`} width={900} height={1951} alt={t("The 99 Names library in Iqra with Arabic and meaning")} sizes="(max-width: 700px) 60vw, 260px" /></article>
        <article><span className={styles.librarySymbol} aria-hidden="true">↳</span><h3>{t("Keep the words you need.")}</h3><p>{t("Find duas and adhkar by occasion, save favourites and keep personal duas. A word bank, verse bookmarks and notes help you return to what you’re learning.")}</p><Image src={`${IMAGE}duas.webp`} width={900} height={1951} alt={t("Iqra's collection of duas organised around everyday needs")} sizes="(max-width: 700px) 60vw, 260px" /></article>
      </div><ProductGallery locale={locale} name="Iqra" title={t("A way in, wherever you begin.")} images={[
        { src: `${IMAGE}campaign-01.webp`, label: t("Word by word"), alt: t("Iqra App Store artwork showing the word-by-word Quran reader") },
        { src: `${IMAGE}campaign-03.webp`, label: t("Memorize"), alt: t("Iqra App Store artwork showing a daily memorization and revision plan") },
        { src: `${IMAGE}campaign-05.webp`, label: t("Learn to pray"), alt: t("Iqra App Store artwork showing the prayer guide with posture, Arabic and meaning") },
        { src: `${IMAGE}campaign-09.webp`, label: t("Sourced stories"), alt: t("Iqra App Store artwork showing stories with source references") },
      ]} disclosure={t("The Iqra 1.2.0 App Store collection · Recitation choices include different styles from human reciters.")} /><AppUpdatesInline locale={locale} app="iqra" /></section>

      <section className={styles.filmSection} aria-labelledby="iqra-film-title"><div className={styles.filmCopy} data-product-enter><p className={styles.eyebrow}>{t("See the small things clearly")}</p><h2 id="iqra-film-title">{t("One word can be")}<br /><em>{t("a beginning.")}</em></h2><p>{t("See how sound, pronunciation support and meaning come together in Iqra.")}</p><span>{t("Watch when you’re ready. Audio starts with you.")}</span></div><div className={styles.filmFrame}><ProductFilm locale={locale} src="/videos/iqra/one-word.mp4" captions="/videos/iqra/one-word.en.vtt" poster={`${IMAGE}film-poster.webp`} ratio="9 / 16" title={t("Iqra: one word at a time")} caption={t("A closer look at word-by-word learning in Iqra.")} transcript={t("The film shows a word from Al-Fatihah, its pronunciation support and meaning. Hear the recorded word, save it to your word bank, and return to practise. Iqra: every feature is free, with no account needed.")} /></div></section>

      <section className={styles.accessSection}><p className={styles.eyebrow}>{t("Open to your next beginning")}</p><h2>{t("Free to begin.")}<br /><em>{t("Free to keep going.")}</em></h2><p>{t("The complete app, without a paywall. An optional subscription supports Iqra and removes the ads.")}</p><Download locale={locale} /><span>{t("No account · Personal records on your device · Download recitation for offline listening")}</span></section>
      <section className={styles.faqSection} aria-labelledby="iqra-faq-title"><div><p className={styles.eyebrow}>{t("Before you begin")}</p><h2 id="iqra-faq-title">{t("A few")}<br /><em>{t("answers.")}</em></h2></div><FaqAccordion className={styles.faq} items={questions} /></section>
      <section className={styles.updates}><AppUpdatesForm app="iqra" id="updates" /></section>
    </main>
    <footer className={styles.footer}><a href="#top" className={styles.brand}><Image src={`${IMAGE}icon.webp`} width={30} height={30} alt="" /><span>{t("Iqra")}</span></a><p>{t("Read. Understand. Begin again.")}</p><nav aria-label={t("Iqra footer")}><a href="https://iqra-quran-tau.vercel.app/privacy">{t("App privacy")}</a><a href="https://iqra-quran-tau.vercel.app/terms">{t("Terms")}</a><a href="https://iqra-quran-tau.vercel.app/support">{t("Support")}</a><Link href={localePath("/", locale)}>{t("Made by Daryan ↗").replace(" ↗", "")} <span data-link-arrow="diagonal" aria-hidden="true">↗</span></Link></nav><span>© {new Date().getFullYear()}{" "}{t("Iqra")}</span></footer>
  </ProductMotion>;
}
