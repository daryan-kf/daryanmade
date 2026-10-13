import type { MetadataRoute } from "next";
import { projects, siteUrl } from "@/lib/projects";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: siteUrl(), changeFrequency: "monthly", priority: 1 }, ...projects.map((p) => ({ url: `${siteUrl()}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })), { url: `${siteUrl()}/privacy`, changeFrequency: "yearly", priority: 0.2 }]; }
