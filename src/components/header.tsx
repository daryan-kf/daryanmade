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
  const previousPathRef = useRef(path);
  const menuRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (previousPathRef.current !== path) setOpen(false);
    previousPathRef.current = path;
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const navigation = document.getElementById("main-navigation");
    const links = Array.from(navigation?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    links[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuRef.current?.focus(); }
      if (event.key !== "Tab") return;
      if (event.shiftKey && document.activeElement === links[0]) {
        event.preventDefault(); menuRef.current?.focus();
      } else if (!event.shiftKey && document.activeElement === menuRef.current) {
        event.preventDefault(); links[0]?.focus();
      } else if (!event.shiftKey && document.activeElement === links.at(-1)) {
        event.preventDefault(); menuRef.current?.focus();
      } else if (event.shiftKey && document.activeElement === menuRef.current) {
        event.preventDefault(); links.at(-1)?.focus();
      }
    };
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        if (navigation?.contains(document.activeElement)) menuRef.current?.focus();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1101px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  return <header className="header" ref={headerRef}>
    <Link href={localePath("/", locale)} className="brand" aria-label={t("daryanmade home")}><MakerMark /><span>daryan<span className="brand-made">made</span><span className="brand-dot">.</span></span></Link>
    <a href="https://sarpoli.com" className="founder-link" target="_blank" rel="noopener noreferrer"><span className="small-dot" />{t("Founder at")} <strong>Sarpoli</strong><Arrow diagonal width={13} height={13} /></a>
    <nav id="main-navigation" className={`navigation ${open ? "is-open" : ""}`} aria-label={t("Main navigation")}>
      <Link href={localePath("/#work", locale)} onClick={() => setOpen(false)}>{t("The work")} <span>01</span></Link>
      <Link href={localePath("/#about", locale)} onClick={() => setOpen(false)}>{t("The person")} <span>02</span></Link>
      <Link href={localePath("/#contact", locale)} className="nav-contact" onClick={() => setOpen(false)}>{t("Let’s talk")} <Arrow diagonal width={16} height={16} /></Link>
    </nav>
    <div className="header-actions"><LanguageSwitch locale={locale} /><button className="menu-button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)} ref={menuRef}>{open ? t("Close") : "Menu"}<span className="menu-glyph" aria-hidden="true" /></button></div>
  </header>;
}
