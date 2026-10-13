import { socialImage } from "@/lib/social-image";
import { getProject } from "@/lib/projects";
export const alt = "A project designed and developed by Daryan Kamalifar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return socialImage(getProject(slug));
}
