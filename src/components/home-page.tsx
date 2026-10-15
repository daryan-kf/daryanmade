import { portfolioCopy } from "@/lib/portfolio-copy";
import { localePath, type Locale } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { MakerJourney, MakerFallback } from "@/components/maker-journey";
import { ProjectGallery } from "@/components/project-gallery";
import { Arrow, MakerMark, LinkedInIcon } from "@/components/icons";
import { FaqAccordion } from "@/components/faq-accordion";
import { HeroBlueprint } from "@/components/hero-blueprint";
import { HomeChoreography } from "@/components/home-choreography";
import { contact, contactEmail, linkedin, siteUrl } from "@/lib/projects";
import styles from "@/app/home.module.css";

export function HomePage({ locale = "en" }: { locale?: Locale }) {
  const t = portfolioCopy(locale);
  const person = { "@context": "https://schema.org", "@type": "Person", name: "Daryan Kamalifar", url: `${siteUrl()}${localePath("/", locale)}`, image: `${siteUrl()}/images/daryan/portrait.webp`, sameAs: [linkedin], jobTitle: t("Independent developer and founder of Sarpoli"), worksFor: { "@type": "Organization", name: "Sarpoli", url: "https://sarpoli.com" } };
  return <main id="main-content" className={styles.page} data-home-experience>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
    <MakerJourney />
    <HomeChoreography />
    <section className={styles.hero} aria-labelledby="hero-title" data-home-hero>
      <div className={styles.heroKicker} data-home-note><span><i /> DARYAN KAMALIFAR</span><span>{t("Independent developer.")}<br className={styles.mobileBreak} /> {t("Intentional maker.")}</span></div>
      <div className={styles.heroComposition}>
        <div className={styles.heroCopy}>
          <h1 id="hero-title"><span className={styles.lineMask}><span data-home-line>{t("Good ideas.")}</span></span><span className={styles.lineMask}><span data-home-line>{t("Made")} <em>{t("real.")}</em></span></span></h1>
          <div className={styles.heroDescription} data-home-note><MakerMark width={27} height={27} /><p>{t("I turn a little curiosity into things people use.")}<br />{t("Apps, businesses, and whatever comes next.")}<br /><span>{t("Designed with care. Built from the ground up.")}</span></p></div>
          <div className={styles.heroActions} data-home-note><a href="#work" className={styles.heroCta}>{t("Explore the work")} <span><Arrow /></span></a><a href="#contact" className={styles.heroContact}>{t("Have an idea?")} <Arrow diagonal width={13} height={13} /></a></div>
        </div>
        <div className={styles.heroArt}>
          <HeroBlueprint locale={locale} />
          <div className={styles.heroAnchor} data-maker-anchor="hero"><MakerFallback variant="hero" /></div>
          <div className={styles.artNote} data-home-note><span /><p>{t("Follow the thread.")}<br /><em>{t("See where it goes.")}</em></p></div>
        </div>
      </div>
      <div className={styles.heroBaseline}><span><i /> {t("Founder at")} <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli <Arrow diagonal width={12} height={12} /></a></span><span>{t("IDEA → DESIGN → CODE → CARE")}</span><a href="#work">{t("THE WORK, IN MOTION")} <span>↓</span></a></div>
    </section>
    <section className={styles.work} id="work" aria-labelledby="work-title">
      <div className={styles.sectionHeading} data-home-heading><span className={styles.sectionIndex}>{t("01 / SELECTED WORK")}</span><h2 id="work-title"><span className={styles.headingMask}><span data-home-heading-line>{t("Different ideas.")}</span></span><span className={styles.headingMask}><em data-home-heading-line>{t("The same care.")}</em></span></h2><p>{t("Independent products, practical businesses,")}<br />{t("and a few things still becoming.")}</p><span className={styles.headingRule} data-home-rule aria-hidden="true" /></div>
      <ProjectGallery locale={locale} />
    </section>
    <section className={styles.about} id="about" aria-labelledby="about-title">
      <div className={styles.aboutInner}>
        <div className={styles.aboutTop}><span className={styles.sectionIndex}>{t("02 / THE PERSON")}</span><div className={styles.aboutAnchor} data-maker-anchor="about"><MakerFallback variant="about" /></div></div>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutHeading} data-home-heading><h2 id="about-title"><span className={styles.headingMask}><span data-home-heading-line>{t("There’s a person")}</span></span><span className={styles.headingMask}><span data-home-heading-line>{t("behind")} <em>{t("the pixels.")}</em></span></span></h2><p>{t("A curious mind.")}<br />{t("A decade of making.")}<br />{t("Still just getting started.")}</p></div>
          <figure className={styles.portrait}><div className={styles.portraitFrame} data-home-portrait><Image src="/images/daryan/portrait.webp" alt={t("Daryan Kamalifar wearing a black turtleneck, seated beside a warm brown wall.")} fill sizes="(max-width: 700px) 85vw, 430px" /></div><figcaption><span>Daryan Kamalifar</span><span>{t("Developer · Founder · Maker")}</span></figcaption></figure>
          <div className={styles.aboutCopy} data-reveal><p className={styles.aboutLead}>{t("Hi, I’m Daryan.")}<br />{t("I like turning “what if”")}<br />{t("into “here it is.”")}</p><p>{t("I’ve been coding for over ten years. What keeps me going is finding something worth making — then caring about every part of how it works and feels.")}</p><p>{t("Sometimes that becomes an app of my own. Sometimes it becomes a business. I founded")} <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli</a> {t("to work with professional teams on AI automations that give them time back.")}</p><p>{t("I work across the idea, the design, the code, and all the small decisions in between. And I’m always open to meeting someone with a good problem, a new perspective, or an idea they can’t leave alone.")}</p><a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkedin}><LinkedInIcon width={17} height={17} /> {t("A little more about me")} <Arrow diagonal width={15} height={15} /></a></div>
          <div className={styles.experience} data-reveal><span>10<em>+</em></span><p>{t("years of building.")}<br />{t("Plenty more to explore.")}</p></div>
        </div>
        <div className={styles.principles}><div data-reveal><span>01</span><h3>{t("Start with people.")}</h3><p>{t("Understand the person, the problem, and what would make a real difference.")}</p></div><div data-reveal><span>02</span><h3>{t("Care about the details.")}</h3><p>{t("The useful, the beautiful, the barely noticeable. Every part belongs.")}</p></div><div data-reveal><span>03</span><h3>{t("Make it. Make it better.")}</h3><p>{t("Put something considered into the world. Listen, learn, and keep going.")}</p></div></div>
      </div>
    </section>
    <section className={`${styles.faq} home-faq`} aria-labelledby="home-faq-title">
      <div className={styles.faqIntro} data-home-heading><span className={styles.sectionIndex}>{t("03 / A LITTLE CONTEXT")}</span><h2 id="home-faq-title"><span className={styles.headingMask}><span data-home-heading-line>{t("Good questions.")}</span></span><span className={styles.headingMask}><em data-home-heading-line>{t("Honest answers.")}</em></span></h2><p>{t("About the work, the person,")}<br />{t("and what we could make together.")}</p></div>
      <div className={styles.faqAnswers} data-reveal><FaqAccordion defaultOpen={null} items={[
        { question: t("Can you build an idea I have?"), answer: <p>{t("Yes. If you have an idea for an app, website, tool or business,")} <a href={`${contact}?subject=${encodeURIComponent(t("I have an idea to build"))}`}>{t("tell me about it")}</a>{t(". It can be an early thought or a well-defined brief. We can work out the useful next step together.")}</p> },
        { question: t("Are you open to collaborating?"), answer: <p>{t("Absolutely. You might want to build something together, bring a different skill to the work, or contribute to one of my existing projects.")} <a href={`${contact}?subject=${encodeURIComponent(t("Let’s build something together"))}`}>{t("Reach out")}</a> {t("and tell me what interests you.")}</p> },
        { question: t("What does Sarpoli do?"), answer: <p>{t("I founded")} <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli</a> {t("to build practical AI automations alongside law firms, accounting teams and property administrators. We focus on repetitive document work, with source references and human review built into the workflow.")}</p> },
        { question: t("Where can I try the apps?"), answer: <p><Link href={localePath("/projects/shield-family", locale)}>Shield Family</Link>, <Link href={localePath("/vela", locale)}>Vela</Link> {t("and")} <Link href={localePath("/iqra", locale)}>Iqra</Link> {t("each have a home here, with features, previews and official App Store links. Vela 2.0 is now available. Wardrobe is still in the making.")}</p> },
        { question: t("How can I get help with a project?"), answer: <p>{t("Each app page links to its own support and privacy information. You can also reach me directly at")} <a href={contact}>{contactEmail}</a>{t(". Tell me which project you’re using and what you need a hand with.")}</p> },
      ]} /></div>
    </section>
    <section className={styles.closing} aria-label={t("Let’s make something together")}>
      <div className={styles.closingAnchor} data-maker-anchor="closing"><MakerFallback variant="closing" /></div>
      <div className={styles.closingCopy} data-home-heading><span className={styles.sectionIndex}>{t("EVERYTHING STARTS SOMEWHERE.")}</span><p><span className={styles.headingMask}><span data-home-heading-line>{t("A small thought.")}</span></span><span className={styles.headingMask}><em data-home-heading-line>{t("A whole new possibility.")}</em></span></p><a href="#contact">{t("Let’s see what yours could become")} <Arrow diagonal width={18} height={18} /></a></div>
    </section>
  </main>;
}
