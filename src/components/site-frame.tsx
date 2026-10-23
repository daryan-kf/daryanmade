"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { stripLocale } from "@/lib/i18n";
import { Footer } from "./footer";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = stripLocale(usePathname());
  const isProductWebsite = ["/projects/shield-family", "/projects/wardrobe", "/vela", "/iqra"].some(base => pathname === base || pathname.startsWith(`${base}/`));
  if (isProductWebsite || /\/updates\/(verify|unsubscribe|privacy)$/.test(pathname)) return <>{children}</>;
  return <><Header />{children}<Footer /></>;
}
