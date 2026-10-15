"use client";
import Link from "next/link";
import { useLocale } from "./locale-provider";
import { localePath } from "@/lib/i18n";
export function MissingPage() {
  const locale = useLocale(), da = locale === "da";
  return <main id="main-content" className="not-found"><span className="eyebrow">{da ? "404 / LIDT UDEN FOR STIEN" : "404 / A LITTLE OFF THE BEATEN PATH"}</span><h1>{da ? <>Denne side er<br />stadig en <em>idé.</em></> : <>This one’s<br />still an <em>idea.</em></>}</h1><p>{da ? "Siden findes ikke. Der er masser af færdige projekter at udforske." : "That page doesn’t exist. There’s plenty of real work to explore."}</p><Link className="button button-dark" href={localePath("/#work", locale)}>{da ? "Tilbage til projekterne →" : "Back to the projects →"}</Link></main>;
}
