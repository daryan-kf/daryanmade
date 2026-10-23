import type { MetadataRoute } from "next";
import { projects, projectPath, siteUrl } from "@/lib/projects";
import { appUpdates, updateApps } from "@/lib/app-updates";
import { localePath } from "@/lib/i18n";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...projects.map(projectPath), "/privacy", ...updateApps.map(app => `${appUpdates[app].base}/privacy`), "/projects/shield-family/privacy", "/projects/shield-family/redeem"];
  return [...new Set(paths)].flatMap(path => (["en", "da"] as const).map(locale => ({ url: `${siteUrl()}${localePath(path, locale)}`, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : path.includes("privacy") ? .2 : .8, alternates: { languages: { en: `${siteUrl()}${localePath(path, "en")}`, da: `${siteUrl()}${localePath(path, "da")}` } } })));
}
