import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { localePath, type Locale } from "@/lib/i18n";
import { AppleIcon, Arrow } from "./icons";
import { LanguageSwitch } from "./language-switch";
import { AppUpdatesForm } from "./app-updates-form";
import { FaqAccordion } from "./faq-accordion";
import styles from "./twillby-site.module.css";

const newsreader = localFont({ src: "../../public/fonts/newsreader-italic.ttf", variable: "--font-twillby-serif", weight: "400", style: "italic", display: "swap" });
const ASSETS = "/images/twillby-site/";

export function TwillbySite({ locale = "en" }: { locale?: Locale }) {
  const t = (en: string, da: string) => locale === "da" ? da : en;
  const chapters = [
    { number: "01", image: "mascot-sets", label: t("PUT IT TOGETHER", "SÆT DET SAMMEN"), title: t("Good pieces. Better together.", "Godt tøj. Endnu bedre sammen."), text: t("Build outfits from the clothes in your closet. Save the combinations you love, favourite the ones that feel most like you, and find them again when you need a little inspiration.", "Lav outfits med tøjet i dit skab. Gem de kombinationer, du holder af, markér dine favoritter, og find dem igen, når du mangler lidt inspiration."), alt: t("Twillby’s denim mascot holding an outfit card", "Twillbys denim-maskot med et outfitkort") },
    { number: "02", image: "mascot-plan", label: t("MAKE ROOM FOR TOMORROW", "GØR PLADS TIL I MORGEN"), title: t("A little less morning guesswork.", "Lidt mindre tvivl om morgenen."), text: t("Give a look a day of its own. Plan what to wear for the week ahead, a day at work, or something worth dressing up for. Your saved outfits, ready when you are.", "Giv et look sin egen dag. Planlæg tøjet til den kommende uge, en arbejdsdag eller noget, der er værd at gøre lidt ud af. Dine gemte outfits, klar når du er."), alt: t("Twillby’s denim mascot planning outfits with a calendar", "Twillbys denim-maskot planlægger outfits med en kalender") },
    { number: "03", image: "mascot-ideas", label: t("FOLLOW YOUR CURIOSITY", "FØLG DIN NYSGERRIGHED"), title: t("What if you tried it this way?", "Hvad hvis du prøvede sådan her?"), text: t("Explore optional AI try-on, outfit ideas, hair inspiration and styling advice. See the credit price before you generate, and choose what to share. Try-on offers a visual idea, rather than a fit guarantee.", "Udforsk valgfri virtuel prøvning, outfitidéer, hårinspiration og stilråd med AI. Se kreditprisen, før du genererer, og vælg selv, hvad du deler. Virtuel prøvning giver en visuel idé, men garanterer ikke pasformen."), alt: t("Twillby’s denim mascot exploring clothing ideas and a light bulb", "Twillbys denim-maskot udforsker tøjidéer med en lyspære") },
  ];

  return <div className={`${styles.site} ${newsreader.variable}`}>
    <div className={styles.makerBar}>
      <Link href={localePath("/", locale)}>← daryanmade</Link>
      <span>{t("A little company for your closet.", "Lidt selskab til din garderobe.")}</span>
      <LanguageSwitch locale={locale} />
    </div>
    <header className={styles.header}>
      <a className={styles.brand} href="#top" aria-label={t("Twillby home", "Twillby forside")}><Image src={`${ASSETS}wordmark.png`} width={2172} height={724} alt="Twillby" sizes="145px" loading="eager" /></a>
      <nav aria-label={t("Twillby navigation", "Twillby-navigation")}>
        <a href="#your-closet">{t("Your closet", "Din garderobe")}</a>
        <a href="#the-possibilities">{t("The possibilities", "Mulighederne")}</a>
        <a href="#updates">{t("Keep me updated", "Hold mig opdateret")} <Arrow diagonal width={14} height={14} /></a>
      </nav>
    </header>

    <main id="main-content">
      <section className={styles.hero} aria-labelledby="twillby-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><i />{t("YOUR CLOSET HAS GOOD COMPANY", "DIN GARDEROBE ER I GODT SELSKAB")}</span>
          <h1 id="twillby-title">{t("A little more", "Lidt mere")}<br /><em>{t("you.", "dig.")}</em></h1>
          <p>{t("Your clothes, saved outfits and next week’s looks, together in one personal closet. Photograph a piece, find a new combination and explore optional AI try-on before you get dressed.", "Dit tøj, gemte outfits og næste uges looks samlet i din egen garderobe. Fotografér et stykke tøj, find en ny kombination, og udforsk valgfri virtuel prøvning, før du tager tøjet på.")}</p>
          <a className={styles.button} href="#updates">{t("Come along for the first look", "Vær med fra første look")}<Arrow diagonal width={17} height={17} /></a>
          <div className={styles.stores} aria-label={t("App availability", "Appens tilgængelighed")}>
            <span><AppleIcon width={17} height={19} /><span>App Store<small>{t("Coming soon", "Kommer snart")}</small></span></span>
            <span><svg width="15" height="17" viewBox="0 0 15 17" aria-hidden="true"><path d="m1 1 13 7.5L1 16Z" fill="none" stroke="currentColor" strokeLinejoin="round" /></svg><span>Google Play<small>{t("Coming soon", "Kommer snart")}</small></span></span>
          </div>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.cloud} aria-hidden="true" />
          <svg className={styles.thread} viewBox="0 0 600 580" fill="none" aria-hidden="true"><path d="M50 420C-10 220 180 95 360 65S620 180 530 310 260 450 340 545" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 8" /></svg>
          <span className={styles.fabricLabel}>{t("A LITTLE DENIM. A LOT OF POSSIBILITY.", "LIDT DENIM. MASSER AF MULIGHEDER.")}</span>
          <Image className={styles.heroMascot} src={`${ASSETS}mascot.png`} width={1373} height={1145} sizes="(max-width: 700px) 90vw, 48vw" loading="eager" fetchPriority="high" alt={t("Twillby’s friendly denim and cloud mascot waving hello", "Twillbys venlige maskot i denim og skyfarver vinker hej")} />
          <span className={styles.hello}>{t("Hello, you.", "Hej med dig.")}<span>✳</span></span>
          <span className={styles.artCaption}>{t("Made for the clothes. Here for the person.", "Skabt til tøjet. Her for mennesket.")}</span>
        </div>
      </section>

      <div className={styles.manifesto}><span>{t("Keep what you love.", "Behold det, du holder af.")}</span><span aria-hidden="true">✳</span><span>{t("See it differently.", "Se det på en ny måde.")}</span><span aria-hidden="true">✳</span><span>{t("Make it yours.", "Gør det til dit.")}</span></div>

      <section className={styles.closet} id="your-closet" aria-labelledby="closet-title">
        <div className={styles.closetArt}>
          <span className={styles.cornerLabel}>01 / {t("START WITH WHAT’S YOURS", "BEGYND MED DET, DU EJER")}</span>
          <div className={styles.garments} aria-hidden="true"><Image src={`${ASSETS}shirt.webp`} width={539} height={720} alt="" sizes="(max-width: 700px) 19vw, 120px" /><Image src={`${ASSETS}cardigan.webp`} width={611} height={720} alt="" sizes="(max-width: 700px) 19vw, 120px" /><Image src={`${ASSETS}coat.webp`} width={383} height={720} alt="" sizes="(max-width: 700px) 19vw, 120px" /></div>
          <Image className={styles.closetMascot} src={`${ASSETS}mascot-closet.png`} width={1254} height={1254} alt={t("Twillby’s mascot organising folded jeans and an ivory shirt", "Twillbys maskot organiserer foldede jeans og en elfenbensfarvet skjorte")} sizes="(max-width: 700px) 85vw, 42vw" />
        </div>
        <div className={styles.closetCopy}>
          <span className={styles.eyebrow}>{t("SAME CLOSET. FRESH EYES.", "SAMME GARDEROBE. NYE ØJNE.")}</span>
          <h2>{t("Your next favourite", "Dit næste yndlingsoutfit")}<br /><em>{t("might already be yours.", "er måske allerede dit.")}</em></h2>
          <p>{t("Photograph or import your clothes and bring them into one personal closet. Use categories, colours and tags to find everyday favourites and almost-forgotten pieces.", "Fotografér eller importér dit tøj, og saml det i din egen garderobe. Brug kategorier, farver og mærkater til at finde hverdagens favoritter og de næsten glemte fund.")}</p>
          <p>{t("From there, make outfits, save your favourites and plan a look for another day. A clearer view of what you own, and a little more freedom in how you wear it.", "Sammensæt outfits, gem dine favoritter, og planlæg et look til en anden dag. Et klarere blik på det, du ejer, og lidt mere frihed til at bruge det.")}</p>
          <div className={styles.smallPromise}><span aria-hidden="true">↳</span>{t("Your clothes stay on your phone. You choose what reaches AI.", "Dit tøj bliver på din telefon. Du vælger, hvad AI får adgang til.")}</div>
        </div>
      </section>

      <section className={styles.possibilities} id="the-possibilities" aria-labelledby="possibilities-title">
        <div className={styles.sectionHead}><div><span className={styles.eyebrow}>{t("A LITTLE HELP, EVERY STEP", "LIDT HJÆLP, HELE VEJEN")}</span><h2 id="possibilities-title">{t("Getting dressed.", "At vælge tøj.")}<br /><em>{t("With a little more play.", "Med lidt mere leg.")}</em></h2></div><p>{t("From the pieces you know to the possibilities you haven’t met yet.", "Fra det tøj, du kender, til de muligheder, du ikke har mødt endnu.")}</p></div>
        <div className={styles.chapters}>{chapters.map(chapter => <article key={chapter.number} className={styles.chapter}>
          <div className={styles.chapterArt}><span className={styles.chapterNumber}>{chapter.number}</span><Image src={`${ASSETS}${chapter.image}.png`} width={1254} height={1254} alt={chapter.alt} sizes="(max-width: 700px) 85vw, 29vw" /></div>
          <span className={styles.eyebrow}>{chapter.label}</span><h3>{chapter.title}</h3><p>{chapter.text}</p>
        </article>)}</div>
      </section>

      <section className={styles.preview} aria-labelledby="preview-title"><div className={styles.previewCopy}><span className={styles.eyebrow}>{t("STILL TAKING SHAPE", "STADIG VED AT TAGE FORM")}</span><h2 id="preview-title">{t("A little glimpse", "Et lille glimt")}<br /><em>{t("of what’s coming.", "af det, der kommer.")}</em></h2><p>{t("A space to bring pieces together and explore a look before getting dressed. We’re building Twillby with the same care as its little denim companion.", "Et sted at samle tøjet og udforske et look, før du tager det på. Vi bygger Twillby med samme omtanke som den lille denim-makker.")}</p><a className={styles.textLink} href="#updates">{t("Help shape the next version", "Vær med til at forme næste version")}<Arrow diagonal width={16} height={16} /></a><p className={styles.previewDisclosure}>{t("Early development capture. The current interface, features and design may change before launch.", "Tidligt skærmbillede under udvikling. Brugerfladen, funktionerne og designet kan ændre sig før lancering.")}</p></div><figure className={styles.previewArt}><span>{t("EARLY DEVELOPMENT PREVIEW", "TIDLIG FORHÅNDSVISNING")}</span><Image src="/images/wardrobe/current-ui.webp" width={1000} height={2167} sizes="(max-width: 700px) 65vw, 290px" alt={t("Early Twillby development preview with try-on, clothing categories, a closet and saved looks", "Tidlig forhåndsvisning af Twillby med virtuel prøvning, tøjkategorier, garderobe og gemte looks")} /></figure></section>

      <section className={styles.faq}><div><span className={styles.eyebrow}>{t("BEFORE YOU COME ALONG", "FØR DU ER MED")}</span><h2>{t("A few little", "Et par små")}<br /><em>{t("things to know.", "ting at vide.")}</em></h2></div><FaqAccordion items={[
        { question: t("Can I download Twillby yet?", "Kan jeg hente Twillby nu?"), answer: <p>{t("Not yet. The App Store and Google Play releases are coming soon. Leave your email below and we’ll let you know when there’s a version to try.", "Ikke endnu. Twillby kommer snart til App Store og Google Play. Skriv din e-mail nedenfor, så giver vi besked, når der er en version at prøve.")}</p> },
        { question: t("What does AI try-on show?", "Hvad viser virtuel prøvning?"), answer: <p>{t("It generates a visual outfit idea using your selected clothes and an approved adult model or photo. It does not measure your body or guarantee size, fit or an exact likeness. You review the credit price before generating.", "Det skaber en visuel outfitidé med dit valgte tøj og en godkendt voksenmodel eller et billede. Det måler ikke din krop og garanterer ikke størrelse, pasform eller en præcis gengivelse af dig. Du ser kreditprisen, før du genererer.")}</p> },
        { question: t("Can I help test an early version?", "Kan jeg hjælpe med at teste en tidlig version?"), answer: <p>{t("Join the Twillby email list to hear when testing opens. We’ll share updates and invitations as opportunities become available. You can unsubscribe whenever you like.", "Tilmeld dig Twillbys e-mailliste for at høre, når der åbnes for test. Vi deler nyheder og invitationer, når det bliver muligt. Du kan altid afmelde dig.")}</p> },
        { question: t("Do I need AI to use my closet?", "Skal jeg bruge AI til min garderobe?"), answer: <p>{t("Your closet and saved outfit combinations work without AI generation. AI try-on and other AI ideas are optional, with the credit price shown before you choose to generate.", "Din garderobe og dine gemte outfitkombinationer fungerer uden AI-generering. Virtuel prøvning og andre AI-idéer er valgfrie, og kreditprisen vises, før du vælger at generere.")}</p> },
        { question: t("What happens to my photos?", "Hvad sker der med mine billeder?"), answer: <p>{t("Your wardrobe photos live on your device, within your signed-in account. Only the selected pictures and text you approve are shared for an AI request.", "Dine garderobebilleder ligger på din enhed og hører til din indloggede konto. Kun de billeder og den tekst, du godkender, deles til en AI-anmodning.")}</p> },
      ]} /></section>
      <div className={styles.updates}><AppUpdatesForm app="wardrobe" /></div>
    </main>
    <footer className={styles.footer}><a className={styles.brand} href="#top"><Image src={`${ASSETS}wordmark.png`} width={2172} height={724} alt="Twillby" sizes="120px" /></a><span>{t("Made with care by Daryan Kamalifar", "Skabt med omtanke af Daryan Kamalifar")}</span><Link href={localePath("/projects/wardrobe/updates/privacy", locale)}>{t("Email privacy", "Privatliv for e-mail")}</Link><a href="mailto:info@sarpoli.com">{t("Get in touch", "Kontakt")}</a></footer>
  </div>;
}
