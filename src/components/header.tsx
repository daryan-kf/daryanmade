"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Arrow, MakerMark } from "./icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) { setOpen(false); menuRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return <header className="header">
    <Link href="/" className="brand" aria-label="daryanmade home"><MakerMark /><span>daryan<span className="brand-made">made</span><span className="brand-dot">.</span></span></Link>
    <a href="https://sarpoli.com" className="founder-link" target="_blank" rel="noopener noreferrer"><span className="small-dot" />Founder at <strong>Sarpoli</strong><Arrow diagonal width={13} height={13} /></a>
    <button className="menu-button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)} ref={menuRef}>{open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <nav id="main-navigation" className={`navigation ${open ? "is-open" : ""}`} aria-label="Main navigation">
      <Link href="/#work" onClick={() => setOpen(false)}>The work <span>01</span></Link>
      <Link href="/#about" onClick={() => setOpen(false)}>The person <span>02</span></Link>
      <Link href="/#contact" className="nav-contact" onClick={() => setOpen(false)}>Let’s talk <Arrow diagonal width={16} height={16} /></Link>
    </nav>
  </header>;
}
