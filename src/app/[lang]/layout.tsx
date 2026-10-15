import { notFound } from "next/navigation";
import { SiteLayout, siteMetadata, viewport } from "@/components/site-layout";
export const metadata = siteMetadata;
export { viewport };
export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang !== "en" && lang !== "da") notFound();
  return <SiteLayout locale={lang}>{children}</SiteLayout>;
}
