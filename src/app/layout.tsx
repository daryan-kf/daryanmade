import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteFrame } from "@/components/site-frame";
import { MotionProvider } from "@/components/motion-provider";
import { siteUrl } from "@/lib/projects";
import "./globals.css";

const manrope = localFont({ src: "../../public/fonts/manrope-variable.ttf", variable: "--font-sans", display: "swap" });
const instrument = localFont({ src: "../../public/fonts/instrument-serif-italic.ttf", variable: "--font-serif", weight: "400", style: "italic", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "daryanmade — Good ideas. Made real.", template: "%s — daryanmade" },
  description: "Daryan Kamalifar. Independent developer, founder of Sarpoli, and maker of thoughtfully built digital products. Explore Shield Family, KaizenCV, Iqra, and more.",
  authors: [{ name: "Daryan Kamalifar", url: "https://www.linkedin.com/in/daryan-kf/" }],
  openGraph: { type: "website", siteName: "daryanmade", locale: "en_US", title: "daryanmade — Good ideas. Made real.", description: "A decade of code. A portfolio of things I care about." },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" }
};
export const viewport: Viewport = { themeColor: "#f4f2eb", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${manrope.variable} ${instrument.variable}`}><body id="top"><a className="skip-link" href="#main-content">Skip to content</a><MotionProvider /><SiteFrame>{children}</SiteFrame></body></html>;
}
