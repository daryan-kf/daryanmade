import Link from "next/link";
import Image from "next/image";
import OrbitSculpture from "@/components/orbit-sculpture";
import { ProjectGallery } from "@/components/project-gallery";
import { Arrow, MakerMark, LinkedInIcon } from "@/components/icons";
import { FaqAccordion } from "@/components/faq-accordion";
import { contact, contactEmail, linkedin, siteUrl } from "@/lib/projects";
import portraitStyles from "./about-portrait.module.css";

export default function Home() {
  const person = { "@context": "https://schema.org", "@type": "Person", name: "Daryan Kamalifar", url: siteUrl(), image: `${siteUrl()}/images/daryan/portrait.webp`, sameAs: [linkedin], jobTitle: "Independent developer and founder of Sarpoli", worksFor: { "@type": "Organization", name: "Sarpoli", url: "https://sarpoli.com" } };
  return <main id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-kicker" data-hero-fade><span className="eyebrow">DARYAN KAMALIFAR</span><span className="kicker-rule" /><span>Independent developer. Intentional maker.</span></div>
      <div className="hero-composition"><div className="hero-text"><h1 id="hero-title"><span className="line-mask"><span data-hero-line>Good ideas.</span></span><span className="line-mask"><span data-hero-line>Made <em>real.</em></span></span></h1><div className="hero-description" data-hero-fade><MakerMark className="little-cross" width={28} height={28} /><p>I build digital products I care about.<br />A decade of code, a curious mind, and a little obsession with getting the details right.</p></div><a href="#work" className="round-link hero-cta" data-hero-fade>Explore the work<span className="round-arrow"><Arrow /></span></a></div>
      <div className="hero-object" data-hero-fade><div className="orbit-ring orbit-ring-one" aria-hidden="true" /><div className="orbit-ring orbit-ring-two" aria-hidden="true" /><OrbitSculpture /><div className="object-note"><span className="note-line" /><span>A continuous work<br /><em>in progress.</em></span></div><span className="object-coordinate">FIG. 01 — MADE OF CURIOSITY</span></div></div>
      <div className="hero-baseline" data-hero-fade><span><i className="small-dot" />Founder at <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli <Arrow diagonal width={12} height={12} /></a></span><span className="baseline-center">THOUGHTFUL PRODUCTS. REAL-WORLD PURPOSE.</span><a href="#work" className="scroll-cue">SCROLL TO DISCOVER <span>↓</span></a></div>
    </section>
    <section className="work-section section-shell" id="work" aria-labelledby="work-title"><div className="section-heading" data-reveal><div className="section-index"><span className="small-dot" />01 / THE WORK</div><h2 id="work-title">Made with <em>intention.</em></h2><span className="heading-note">Independent products,<br />personal obsessions & what’s next.</span></div><ProjectGallery /></section>
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-top" data-reveal><span className="section-index"><span className="small-dot" />02 / THE PERSON</span><MakerMark className="about-mark" width={72} height={72} /></div>
      <div className={`about-grid ${portraitStyles.layout}`}>
        <div className={portraitStyles.heading} data-reveal><h2 id="about-title">There’s a person<br />behind <em>the pixels.</em></h2></div>
        <figure className={portraitStyles.portrait} data-reveal>
          <div className={portraitStyles.photoFrame}><Image src="/images/daryan/portrait.webp" alt="Daryan Kamalifar wearing a black turtleneck, seated beside a warm brown wall." fill sizes="(max-width: 700px) calc(100vw - 46px), (max-width: 1100px) 40vw, 420px" /></div>
          <figcaption className={portraitStyles.caption}><span>Daryan Kamalifar</span><span>Independent developer · Founder of Sarpoli</span></figcaption>
        </figure>
        <div className={`about-copy ${portraitStyles.copy}`} data-reveal>
          <p className="about-lead">Hi, I’m Daryan.<br />I make things that matter to me.<br />Hopefully, to you too.</p>
          <p>I’ve been coding for over ten years. What keeps me going is the chance to take a problem I care about and make something useful, thoughtful, and a little unexpected.</p>
          <p>Some of that work becomes an app. Some becomes a business. At <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli</a>, the AI agency I founded, I bring that same care to websites, tools, and automations for other people.</p>
          <p>Whatever I’m building, I’m here for the whole thing. The idea, the interface, the code, and the tiny details that make it feel right.</p>
          <a className="underlined-link" href={linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon width={18} height={18} /> Find me on LinkedIn <Arrow diagonal width={16} height={16} /></a>
        </div>
        <div className={`experience-note ${portraitStyles.experience}`} data-reveal><span>10<span>+</span></span><p>years of turning<br />“what if” into “here it is.”</p></div>
      </div>
      <div className="principles"><div data-reveal><span>01</span><h3>Start with care.</h3><p>Build around a real need, and the people on the other side of the screen.</p></div><div data-reveal><span>02</span><h3>Own the details.</h3><p>The useful, the beautiful, and the barely noticeable. It all adds up.</p></div><div data-reveal><span>03</span><h3>Keep making.</h3><p>Ship something considered. Listen, learn, and make the next version better.</p></div></div>
    </section>
    <section className="home-faq section-shell" aria-labelledby="home-faq-title"><div className="home-faq-heading" data-reveal><span className="section-index"><span className="small-dot" />03 / GOOD TO KNOW</span><h2 id="home-faq-title">A little more<br /><em>context.</em></h2><p>Real projects, an independent maker,<br />and an open line of communication.</p></div><div data-reveal><FaqAccordion defaultOpen={null} items={[
      { question: "Who designs and builds these projects?", answer: <p>I’m Daryan Kamalifar, a developer with over ten years of experience and the founder of <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli</a>. I work across the idea, product design, code, and ongoing improvements. You can find my professional background on <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>.</p> },
      { question: "Where can I try the apps?", answer: <p>Each live project has a direct link to its website or official App Store listing. Shield Family has its own home here, with a closer look at the app and links to download it. Wardrobe is coming very soon.</p> },
      { question: "Can we work on something together?", answer: <p>Through Sarpoli, I build websites, tools, and AI automations for businesses. Feedback, new ideas and collaboration enquiries are always welcome. If you have something in mind, <a href={contact}>tell me about it</a>.</p> },
      { question: "How do I get help with an app?", answer: <p>Use the support link on the app’s official website or App Store page. You can also reach me at <a href={contact}>{contactEmail}</a>. Each product’s own privacy policy and terms explain how it works.</p> },
    ]} /></div></section>
    <section className="closing-note" data-reveal aria-label="Made with care"><span className="eyebrow">IDEA → DESIGN → CODE → CARE</span><p>Small details.<br /><em>Lasting impressions.</em></p><div><MakerMark width={26} height={26} /><span>Built independently.<br />Made to be used.</span><Link href="/#work" className="round-link">Back to the work <span className="round-arrow"><Arrow diagonal /></span></Link></div></section>
  </main>;
}
