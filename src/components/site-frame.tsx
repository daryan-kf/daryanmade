"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

export function SiteFrame({ children }: { children: ReactNode }) {
  const isProductWebsite = usePathname().startsWith("/projects/shield-family");
  if (isProductWebsite) return <>{children}</>;
  return <><Header />{children}<Footer /></>;
}
