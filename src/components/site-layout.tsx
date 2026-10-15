import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteFrame } from "@/components/site-frame";
import { MotionProvider } from "@/components/motion-provider";
import { siteUrl } from "@/lib/projects";
import "@/app/globals.css";
import { LocaleProvider } from "./locale-provider";
import { languageAlternates, type Locale } from "@/lib/i18n";

const manrope = localFont({ src: "../../public/fonts/manrope-variable.ttf", variable: "--font-sans", display: "swap" });
const instrument = localFont({ src: "../../public/fonts/instrument-serif-italic.ttf", variable: "--font-serif", weight: "400", style: "italic", display: "swap" });

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "daryanmade — Good ideas. Made real.", template: "%s — daryanmade" },
  description: "Daryan Kamalifar. Independent developer, founder of Sarpoli, and maker of Vela, Shield Family, Iqra and useful digital products. Bring an idea, build together, or explore the work.",
  authors: [{ name: "Daryan Kamalifar", url: "https://www.linkedin.com/in/daryan-kf/" }],
  openGraph: { type: "website", siteName: "daryanmade", locale: "en_US", title: "daryanmade — Good ideas. Made real.", description: "A decade of code. A portfolio of things I care about." },
  twitter: { card: "summary_large_image" },
  alternates: languageAlternates("/")
};
export const viewport: Viewport = { themeColor: "#f4f2eb", width: "device-width", initialScale: 1 };

export function SiteLayout({ children, locale }: Readonly<{ children: React.ReactNode; locale: Locale }>) {
  return <html lang={locale} className={`${manrope.variable} ${instrument.variable}`}><body id="top"><a className="skip-link" href="#main-content">{locale === "da" ? "Gå til indhold" : "Skip to content"}</a><LocaleProvider locale={locale}><MotionProvider /><SiteFrame>{children}</SiteFrame></LocaleProvider></body></html>;
}
