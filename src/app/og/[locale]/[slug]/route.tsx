import { socialImage } from "@/lib/social-image";
import { getProject, projects } from "@/lib/projects";
export const dynamic = "force-static";
export function generateStaticParams() { return ["en", "da"].flatMap(locale => ["home", ...projects.map(p => p.slug)].map(slug => ({ locale, slug }))); }
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (locale !== "en" && locale !== "da") return new Response("Not found", { status: 404 });
  const project = getProject(slug, locale);
  if (slug !== "home" && !project) return new Response("Not found", { status: 404 });
  return socialImage(project, locale);
}
