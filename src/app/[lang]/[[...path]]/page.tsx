import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/home-page";
import { ProjectDetailPage } from "@/components/project-detail-page";
import { PortfolioPrivacy } from "@/components/portfolio-privacy";
import { VelaSite } from "@/components/vela-site";
import { IqraSite } from "@/components/iqra-site";
import { AppUpdatesPage, appUpdateMetadata } from "@/components/app-updates-page";
import { ShieldOfferPage, shieldOfferMetadata } from "@/components/shield-offer-pages";
import { getProject, projects, siteUrl } from "@/lib/projects";
import { projectMetadata } from "@/lib/route-metadata";
import { languageAlternates, localePath, type Locale } from "@/lib/i18n";
import { appUpdates, updateApps } from "@/lib/app-updates";

const paths = ["", "privacy", "vela", "iqra", ...projects.filter(p => !["vela", "iqra"].includes(p.slug)).map(p => `projects/${p.slug}`), ...updateApps.flatMap(app => ["verify", "unsubscribe", "privacy"].map(action => `${appUpdates[app].base.slice(1)}/${action}`)), ...["verify", "redeem", "privacy"].map(action => `projects/shield-family/${action}`)];
export function generateStaticParams() { return (["en", "da"] as const).flatMap(lang => paths.map(path => ({ lang, path: path ? path.split("/") : [] }))); }
export const dynamicParams = false;
type Props = { params: Promise<{ lang: string; path?: string[] }> };
function updateRoute(path: string) {
  for (const app of updateApps) {
    const base = appUpdates[app].base.slice(1);
    if (["verify", "unsubscribe", "privacy"].some(action => path === `${base}/${action}`)) return { app, page: path.slice(base.length + 1) as "verify" | "unsubscribe" | "privacy" };
  }
  return null;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  if (values.lang !== "en" && values.lang !== "da") notFound();
  const locale: Locale = values.lang, path = values.path?.join("/") || "", update = updateRoute(path);
  if (update) return appUpdateMetadata(update.app, update.page, locale);
  if (["vela", "iqra"].includes(path) || /^projects\/[^/]+$/.test(path)) return projectMetadata(path.replace("projects/", ""), locale);
  if (path.startsWith("projects/shield-family/")) return shieldOfferMetadata(path.split("/")[2] as "privacy" | "verify" | "redeem", locale);
  const da = locale === "da", url = localePath(path ? `/${path}` : "/", locale);
  return { title: { absolute: path === "privacy" ? (da ? "Privatliv — daryanmade" : "Portfolio privacy — daryanmade") : da ? "daryanmade — Gode idéer. Får liv." : "daryanmade — Good ideas. Made real." }, description: path === "privacy" ? (da ? "Sådan behandler Daryan Kamalifars portfolio dine oplysninger." : "How the daryanmade portfolio handles personal information.") : da ? "Selvstændig udvikler, grundlægger af Sarpoli og skaberen bag Vela, Shield Family og Iqra. Udforsk projekterne, eller fortæl mig om din idé." : "Daryan Kamalifar. Independent developer, founder of Sarpoli, and maker of Vela, Shield Family and Iqra. Bring an idea, build together, or explore the work.", alternates: languageAlternates(url), openGraph: { locale: da ? "da_DK" : "en_US", url, images: [{ url: `/og/${locale}/home`, width: 1200, height: 630 }] } };
}
export default async function LocalizedPage({ params }: Props) {
  const values = await params;
  if (values.lang !== "en" && values.lang !== "da") notFound();
  const locale: Locale = values.lang, path = values.path?.join("/") || "";
  if (!paths.includes(path)) notFound();
  if (!path) return <HomePage locale={locale} />;
  if (path === "privacy") return <PortfolioPrivacy locale={locale} />;
  const update = updateRoute(path);
  if (update) return <AppUpdatesPage {...update} locale={locale} />;
  if (path === "vela" || path === "iqra") {
    const p = getProject(path, locale)!;
    const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: p.name, description: p.description, inLanguage: locale, url: `${siteUrl()}${localePath(`/${path}`, locale)}`, operatingSystem: "iOS, iPadOS", softwareVersion: path === "vela" ? "2.0" : "1.2.0", applicationCategory: path === "vela" ? "ProductivityApplication" : "EducationalApplication", downloadUrl: p.storeUrl, ...(path === "iqra" ? { isAccessibleForFree: true } : {}), author: { "@type": "Person", name: "Daryan Kamalifar" } };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />{path === "vela" ? <VelaSite locale={locale} /> : <IqraSite locale={locale} />}</>;
  }
  if (/^projects\/shield-family\/(privacy|verify|redeem)$/.test(path)) return <ShieldOfferPage page={path.split("/")[2] as "privacy" | "verify" | "redeem"} locale={locale} />;
  return <ProjectDetailPage slug={path.replace("projects/", "")} locale={locale} />;
}
