"use client";
import { portfolioCopy } from "@/lib/portfolio-copy";

import { localePath } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { LanguageSwitch } from "./language-switch";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Arrow, MakerMark } from "./icons";

export function Header() {
  const locale = useLocale();
  const t = portfolioCopy(locale);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (open) document.getElementById("main-navigation")?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [open]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) { setOpen(false); menuRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return <header className="header">
    <Link href={localePath("/", locale)} className="brand" aria-label={t("daryanmade home")}><MakerMark /><span>daryan<span className="brand-made">made</span><span className="brand-dot">.</span></span></Link>
    <a href="https://sarpoli.com" className="founder-link" target="_blank" rel="noopener noreferrer"><span className="small-dot" />{t("Founder at")} <strong>Sarpoli</strong><Arrow diagonal width={13} height={13} /></a>
    <nav id="main-navigation" className={`navigation ${open ? "is-open" : ""}`} aria-label={t("Main navigation")}>
      <Link href={localePath("/#work", locale)} onClick={() => setOpen(false)}>{t("The work")} <span>01</span></Link>
      <Link href={localePath("/#about", locale)} onClick={() => setOpen(false)}>{t("The person")} <span>02</span></Link>
      <Link href={localePath("/#contact", locale)} className="nav-contact" onClick={() => setOpen(false)}>{t("Let’s talk")} <Arrow diagonal width={16} height={16} /></Link>
    </nav>
    <div className="header-actions"><LanguageSwitch locale={locale} /><button className="menu-button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)} ref={menuRef}>{open ? t("Close") : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span></button></div>
  </header>;
}
