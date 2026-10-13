import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject, projectDestination, linkedin, contact, siteUrl } from "@/lib/projects";
import { Arrow, Check, MakerMark, AppleIcon } from "@/components/icons";
import { ProductVisual } from "@/components/product-visual";
import { ShieldFamilySite } from "@/components/shield-family-site";
import { FaqAccordion } from "@/components/faq-accordion";
import { ScreenshotGallery } from "@/components/screenshot-gallery";

export function generateStaticParams() { return projects.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return { title: `${project.name} — ${project.category}`, description: project.description, alternates: { canonical: `/projects/${slug}` }, openGraph: { title: `${project.name} — A project by Daryan Kamalifar`, description: project.description, url: `/projects/${slug}`, images: [{ url: `/projects/${slug}/opengraph-image`, width: 1200, height: 630 }] } };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = getProject(slug); if (!p) notFound();
  if (slug === "shield-family") return <ShieldFamilySite />;
  if (slug === "next-project") return <main id="main-content" className="next-teaser"><Link href="/#work" className="underlined-link">← All projects</Link><div className="teaser-content"><span className="eyebrow">NEXT PROJECT / 2027</span><MakerMark className="teaser-mark" width={120} height={120} /><h1>Something good<br />is taking <em>shape.</em></h1><p>A new project, quietly in the making.<br />I’ll share more in 2027.</p><a className="round-link" href={linkedin} target="_blank" rel="noopener noreferrer">Follow along on LinkedIn<span className="round-arrow"><Arrow diagonal /></span></a><span className="teaser-byline">A little surprise by Daryan Kamalifar.</span></div></main>;
  const available = !!p.url;
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  const inquiry = `${contact}?subject=${encodeURIComponent(`I'd like to hear more about ${p.name}`)}`;
  const structured = { "@context": "https://schema.org", "@type": "CreativeWork", name: p.name, description: p.description, url: `${siteUrl()}/projects/${slug}`, creator: { "@type": "Person", name: "Daryan Kamalifar", sameAs: linkedin } };
  return <main id="main-content" className="project-detail" style={{ "--project-color": p.color, "--project-ink": p.ink } as CSSProperties}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <div className="project-breadcrumb"><Link href="/#work">← All projects</Link><span>{String(projects.indexOf(p) + 1).padStart(2, "0")} / {p.category}</span><span className={`status ${p.status === "Live" ? "live" : ""}`}><i />{p.status}</span></div>
    <section className="product-hero"><div className="product-hero-copy"><div className="product-identity" data-hero-fade><Image src={`/images/${slug}/icon.png`} width={44} height={44} alt="" /><span>{p.name}</span></div><h1><span data-hero-line>{p.headline}</span></h1><p className="product-description" data-hero-fade>{p.description}</p><div className="product-actions" data-hero-fade>{p.storeUrl ? <a className="button button-dark" href={p.storeUrl} target="_blank" rel="noopener noreferrer"><AppleIcon width={20} height={22} /> Download on the App Store <Arrow diagonal width={17} height={17} /></a> : <a className="button button-dark" href={p.url || inquiry} {...(p.url ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{p.action || `Ask about ${p.name}`}<Arrow diagonal width={17} height={17} /></a>}{p.storeUrl && <a className="product-text-action" href={p.url} target="_blank" rel="noopener noreferrer">Visit product website <Arrow diagonal width={14} height={14} /></a>}</div><p className="availability-note" data-hero-fade>{p.status === "Coming soon" ? "Coming very soon. Part of the Vela family." : p.status === "In development" ? "An active project. Public access is not available yet." : p.status === "Client project" ? "A website concept. Opens the deployed preview." : p.storeUrl ? "Available for iPhone. Opens Apple’s official App Store." : "Live and available. Opens the official website."}</p></div><div className="product-hero-art" data-hero-fade><ProductVisual project={p} large /></div></section>
    <div className="maker-trust"><div><Check /><span>Designed & developed by <a href={linkedin} target="_blank" rel="noopener noreferrer">Daryan Kamalifar <Arrow diagonal width={12} height={12} /></a></span></div><a href={p.support || contact}>A question? Get in touch <Arrow diagonal width={14} height={14} /></a></div>
    <section className="project-story"><div className="project-spec" data-reveal><span className="eyebrow">THE PROJECT</span><dl><div><dt>My role</dt><dd>{slug === "sarpoli" ? "Founder" : "Design & development"}</dd></div><div><dt>Focus</dt><dd>{p.category}</dd></div><div><dt>Status</dt><dd>{p.status}</dd></div></dl><div className="project-tags">{p.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="project-story-copy" data-reveal><span className="eyebrow">THE IDEA BEHIND IT</span><h2>{p.summary}</h2><p>{p.story}</p></div></section>
    <section className="product-features" aria-label={`${p.name} highlights`}>{p.features.map((feature, index) => <div key={feature.title} data-reveal><span className="feature-number">0{index + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p></div>)}</section>
    <ScreenshotGallery slug={slug} name={p.name} />
    <section className="project-faq"><div data-reveal><span className="eyebrow">A FEW THINGS TO KNOW</span><h2>Clear from<br />the <em>start.</em></h2></div><div data-reveal><FaqAccordion items={[
      { question: `Is ${p.name} available?`, answer: <p>{available ? <>{p.name} is live. You can <a href={p.url} target="_blank" rel="noopener noreferrer">visit the website</a>{p.storeUrl && <> or <a href={p.storeUrl} target="_blank" rel="noopener noreferrer">download it from the App Store</a></>}. {p.storeUrl ? "Screenshots show a development preview; the current App Store version may differ." : "The product website has the latest information on availability and features."}</> : <>{p.name} is coming very soon. <a href={inquiry}>Get in touch</a> if you’d like to learn more.</>}</p> },
      { question: "Who is behind the project?", answer: <p>I’m Daryan Kamalifar, an independent developer and the founder of <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli</a>. I’ve been coding for over ten years. <a href={linkedin} target="_blank" rel="noopener noreferrer">Find me on LinkedIn.</a></p> },
      { question: "How can I get help or ask a question?", answer: <p>You can {p.support?.startsWith("https:") ? <a href={p.support} target="_blank" rel="noopener noreferrer">visit the product support page</a> : <a href={p.support || contact}>email {p.support?.replace("mailto:", "") || "info@sarpoli.com"}</a>} with questions about this project.{p.privacyUrl && <> Read the <a href={p.privacyUrl} target="_blank" rel="noopener noreferrer">product privacy policy</a>{p.termsUrl && <> and <a href={p.termsUrl} target="_blank" rel="noopener noreferrer">terms</a></>}.</>}</p> },
    ]} /></div></section>
    <div className="next-project"><span className="eyebrow">ONE MORE THING I’VE BEEN MAKING</span><Link href={projectDestination(next).href} {...(projectDestination(next).external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span>{next.name}</span><Arrow diagonal /></Link></div>
  </main>;
}
