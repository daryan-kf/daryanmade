import type { Metadata } from "next";
import { getProject, projectPath } from "./projects";
import { languageAlternates, localePath, type Locale } from "./i18n";

export function projectMetadata(slug: string, locale: Locale): Metadata {
  const p = getProject(slug, locale);
  if (!p) return { title: locale === "da" ? "Projektet findes ikke" : "Project not found" };
  const path = localePath(projectPath(p), locale);
  return { title: { absolute: `${p.name} — ${p.headline}` }, description: p.description, alternates: languageAlternates(path), openGraph: { type: "website", siteName: p.name, locale: locale === "da" ? "da_DK" : "en_US", title: `${p.name} — ${p.headline}`, description: p.description, url: path, images: [{ url: `/og/${locale}/${slug}`, width: 1200, height: 630 }] }, twitter: { card: "summary_large_image" } };
}
