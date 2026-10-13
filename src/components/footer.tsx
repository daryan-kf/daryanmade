import Link from "next/link";
import { contact, linkedin } from "@/lib/projects";
import { Arrow, MakerMark } from "./icons";

export function Footer() {
  return <footer className="footer" id="contact">
    <div className="footer-intro"><span className="eyebrow"><span className="small-dot" />GOOD THINGS START WITH A CONVERSATION</span><a href={contact} className="contact-title">Got a good <em>idea?</em><span className="contact-arrow"><Arrow diagonal /></span></a>
      <div className="contact-bottom"><p>Let’s make something that matters.</p><a href={contact} className="underlined-link">info@sarpoli.com <Arrow diagonal width={15} height={15} /></a></div>
    </div>
    <div className="footer-meta"><Link className="footer-brand" href="/" aria-label="daryanmade home"><MakerMark width={22} height={22} />daryanmade.</Link><span>© {new Date().getFullYear()} Daryan Kamalifar</span><div><a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow diagonal width={12} height={12} /></a><a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli <Arrow diagonal width={12} height={12} /></a><Link href="/privacy">Privacy</Link><a href="#top">Back to top ↑</a></div></div>
  </footer>;
}
