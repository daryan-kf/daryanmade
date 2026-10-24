import { portfolioCopy } from "@/lib/portfolio-copy";
import { localePath, type Locale } from "@/lib/i18n";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { projects, getProject, projectDestination, projectPath, linkedin, contact, contactEmail, siteUrl } from "@/lib/projects";
import { Arrow, Check, MakerMark, AppleIcon } from "@/components/icons";
import { ProductVisual } from "@/components/product-visual";
import { ShieldFamilySite } from "@/components/shield-family-site";
import { FaqAccordion } from "@/components/faq-accordion";
import { TwillbySite } from "./twillby-site";
import { AppUpdatesForm } from "./app-updates-form";
import { isUpdateApp } from "@/lib/app-updates";
import { ScreenshotGallery } from "@/components/screenshot-gallery";

export function ProjectDetailPage({ slug, locale = "en" }: { slug: string; locale?: Locale }) {
  const t = portfolioCopy(locale);
  const p = getProject(slug, locale); if (!p) notFound();
  if (slug === "vela" || slug === "iqra") permanentRedirect(localePath(projectPath(p), locale));
  if (slug === "wardrobe") return <TwillbySite locale={locale} />;
  if (slug === "shield-family") return <ShieldFamilySite locale={locale} />;
  if (slug === "next-project") return <main id="main-content" className="next-teaser"><Link href={localePath("/#work", locale)} className="underlined-link">{t("← All projects")}</Link><div className="teaser-content"><span className="eyebrow">{t("NEXT PROJECT / MID-2027")}</span><MakerMark className="teaser-mark" width={120} height={120} /><h1>{t("Something big")}<br />{t("is")} <em>{t("coming.")}</em></h1><p>{t("A new project, quietly in the making.")}<br />{t("I’ll share it in mid-2027.")}</p><a className="round-link" href={linkedin} target="_blank" rel="noopener noreferrer">{t("Follow along on LinkedIn")}<span className="round-arrow"><Arrow diagonal /></span></a><span className="teaser-byline">{t("A little surprise by Daryan Kamalifar.")}</span></div></main>;
  const available = !!p.url;
  const next = [...projects.slice(projects.findIndex(project => project.slug === slug) + 1), ...projects.slice(0, projects.findIndex(project => project.slug === slug))].find(project => project.status !== "Coming soon")!;
  const inquiry = `${contact}?subject=${encodeURIComponent(locale === "da" ? `Jeg vil gerne høre mere om ${p.name}` : `I'd like to hear more about ${p.name}`)}`;
  const structured = { "@context": "https://schema.org", "@type": "CreativeWork", name: p.name, description: p.description, url: `${siteUrl()}/projects/${slug}`, creator: { "@type": "Person", name: "Daryan Kamalifar", sameAs: linkedin } };
  return <main id="main-content" className="project-detail" style={{ "--project-color": p.color, "--project-ink": p.ink } as CSSProperties}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <div className="project-breadcrumb"><Link href={localePath("/#work", locale)}>{t("← All projects")}</Link><span>{String(projects.findIndex(project => project.slug === slug) + 1).padStart(2, "0")} / {p.category}</span><span className={`status ${p.status === "Live" ? "live" : ""}`}><i />{t(p.status)}</span></div>
    <section className="product-hero"><div className="product-hero-copy"><div className="product-identity" data-hero-fade><Image src={`/images/${slug}/icon.png`} width={44} height={44} alt="" /><span>{p.name}</span></div><h1><span data-hero-line>{p.headline}</span></h1><p className="product-description" data-hero-fade>{p.description}</p><div className="product-actions" data-hero-fade>{p.storeUrl ? <a className="button button-dark" href={p.storeUrl} target="_blank" rel="noopener noreferrer"><AppleIcon width={20} height={22} /> {t("Download on the App Store")} <Arrow diagonal width={17} height={17} /></a> : <a className="button button-dark" href={p.url || inquiry} {...(p.url ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{p.action || (locale === "da" ? `Spørg om ${p.name}` : `Ask about ${p.name}`)}<Arrow diagonal width={17} height={17} /></a>}{p.storeUrl && <a className="product-text-action" href={p.url} target="_blank" rel="noopener noreferrer">{t("Visit product website")} <Arrow diagonal width={14} height={14} /></a>}</div><p className="availability-note" data-hero-fade>{p.status === "Coming soon" ? t("Coming soon. A project in the making.") : p.status === "In development" ? t("An active project. Public access is not available yet.") : p.status === "Client project" ? t("A website concept. Opens the deployed preview.") : p.storeUrl ? t("Available for iPhone. Opens Apple’s official App Store.") : t("Live and available. Opens the official website.")}</p></div><div className="product-hero-art" data-hero-fade><ProductVisual locale={locale} project={p} large /></div></section>
    <div className="maker-trust"><div><Check /><span>{t("Designed & developed by")} <a href={linkedin} target="_blank" rel="noopener noreferrer">Daryan Kamalifar <Arrow diagonal width={12} height={12} /></a></span></div><a href={p.support || contact}>{t("A question? Get in touch")} <Arrow diagonal width={14} height={14} /></a></div>
    <section className="project-story"><div className="project-spec" data-reveal><span className="eyebrow">{t("THE PROJECT")}</span><dl><div><dt>{t("My role")}</dt><dd>{slug === "sarpoli" ? t("Founder") : t("Design & development")}</dd></div><div><dt>{t("Focus")}</dt><dd>{p.category}</dd></div><div><dt>Status</dt><dd>{t(p.status)}</dd></div></dl><div className="project-tags">{p.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="project-story-copy" data-reveal><span className="eyebrow">{t("THE IDEA BEHIND IT")}</span><h2>{p.summary}</h2><p>{p.story}</p></div></section>
    <section className="product-features" aria-label={locale === "da" ? `${p.name}: højdepunkter` : `${p.name} highlights`}>{p.features.map((feature, index) => <div key={feature.title} data-reveal><span className="feature-number">0{index + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p></div>)}</section>
    <ScreenshotGallery locale={locale} slug={slug} name={p.name} />
    <section className="project-faq"><div data-reveal><span className="eyebrow">{t("A FEW THINGS TO KNOW")}</span><h2>{t("Clear from")}<br />{t("the")} <em>{t("start.")}</em></h2></div><div data-reveal><FaqAccordion items={[
      ...(p.faqs ?? []).map(faq => ({ question: faq.question, answer: <p>{faq.answer}</p> })),
      { question: locale === "da" ? `Er ${p.name} tilgængelig?` : `Is ${p.name} available?`, answer: <p>{available ? <>{p.name} {t("is live. You can")} <a href={p.url} target="_blank" rel="noopener noreferrer">{t("visit the website")}</a>{p.storeUrl && <> {t("or")} <a href={p.storeUrl} target="_blank" rel="noopener noreferrer">{t("download it from the App Store")}</a></>}. {p.storeUrl ? t("Screenshots show a development preview; the current App Store version may differ.") : t("The product website has the latest information on availability and features.")}</> : <>{p.name} {t("is still in the making.")} <a href={inquiry}>{t("Get in touch")}</a> {t("if you’d like to learn more.")}</>}</p> },
      { question: t("Who is behind the project?"), answer: <p>{t("I’m Daryan Kamalifar, an independent developer and the founder of")} <a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli</a>{t(". I’ve been coding for over ten years.")} <a href={linkedin} target="_blank" rel="noopener noreferrer">{t("Find me on LinkedIn.")}</a></p> },
      { question: t("How can I get help or ask a question?"), answer: <p>{t("You can")} {p.support?.startsWith("https:") ? <a href={p.support} target="_blank" rel="noopener noreferrer">{t("visit the product support page")}</a> : <a href={p.support || contact}>{t("email")} {p.support?.replace("mailto:", "") || contactEmail}</a>} {t("with questions about this project.")}{p.privacyUrl && <> {t("Read the")} <a href={p.privacyUrl} target="_blank" rel="noopener noreferrer">{t("product privacy policy")}</a>{p.termsUrl && <> {t("and")} <a href={p.termsUrl} target="_blank" rel="noopener noreferrer">{t("terms")}</a></>}.</>}</p> },
    ]} /></div></section>
    {isUpdateApp(slug) && <div className="project-updates"><AppUpdatesForm app={slug} /></div>}
    <div className="next-project"><span className="eyebrow">{t("ONE MORE THING I’VE BEEN MAKING")}</span><Link href={projectDestination(next, locale).href} {...(projectDestination(next, locale).external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span>{next.name}</span><Arrow diagonal /></Link></div>
  </main>;
}
