import Link from "next/link";
import { contact, contactEmail, linkedin } from "@/lib/projects";
import { Arrow, MakerMark } from "./icons";
import styles from "./footer.module.css";

export function Footer() {
  return <footer className="footer" id="contact">
    <div className="footer-intro" data-reveal>
      <span className="eyebrow" data-reveal-item><span className="small-dot" />GOOD THINGS START WITH A CONVERSATION</span>
      <h2 className={styles.heading} data-reveal-item><a href={contact} className={styles.invitation}><span>Something<br /><em>on your mind?</em></span><span className={styles.arrow}><Arrow diagonal /></span></a></h2>
      <div className={styles.details} data-reveal-item><p>Feedback on an app, an idea worth exploring, or a project we could build together. I’d love to hear it.</p><a href={contact} className="underlined-link">{contactEmail} <Arrow diagonal width={15} height={15} /></a></div>
    </div>
    <div className="footer-meta"><Link className="footer-brand" href="/" aria-label="daryanmade home"><MakerMark width={22} height={22} />daryanmade.</Link><span>© {new Date().getFullYear()} Daryan Kamalifar</span><div><a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow diagonal width={12} height={12} /></a><a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli <Arrow diagonal width={12} height={12} /></a><Link href="/privacy">Privacy</Link><a href="#top">Back to top ↑</a></div></div>
  </footer>;
}
