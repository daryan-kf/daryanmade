"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const collections: Record<string, { count: number; labels: string[]; caption: string }> = {
  "shield-family": { count: 4, labels: ["Family overview", "Child profile", "Learning activities", "Screen-time plan"], caption: "Development preview · Real device captures using a demo family. The App Store version may differ." },
  kaizencv: { count: 3, labels: ["Nova résumé template", "Flux résumé template", "Résumé template"], caption: "Real résumé designs from KaizenCV · Demonstration content." },
  iqra: { count: 3, labels: ["Quran reader", "Prayer learning", "Memorisation"], caption: "Product interface preview · Features and design may vary by app version." },
  vela: { count: 3, labels: ["Daily overview", "Focus experience", "Voice tools"], caption: "Product interface preview · Features and design may vary by app version." },
  wardrobe: { count: 2, labels: ["Personal style concept", "Wardrobe inspiration"], caption: "Concept imagery · These visuals illustrate the creative direction, rather than the finished app." }
};

export function ScreenshotGallery({ slug, name }: { slug: string; name: string }) {
  const collection = collections[slug];
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(0);
  if (!collection) return null;
  const source = (index: number) => `/images/${slug}/screen-${index + 1}.webp`;
  return <section className="screenshot-section" aria-labelledby="screens-title"><div className="detail-section-label"><span className="eyebrow">A CLOSER LOOK</span><h2 id="screens-title">In the <em>details.</em></h2><span>Click a preview to explore</span></div><div className={`screenshot-track ${slug === "kaizencv" || slug === "wardrobe" ? "paper-track" : ""}`}>{Array.from({ length: collection.count }, (_, index) => <button className="screenshot-button" key={index} onClick={() => { setSelected(index); dialog.current?.showModal(); }} aria-label={`Enlarge ${name}: ${collection.labels[index]}`}><Image src={source(index)} width={1000} height={slug === "kaizencv" ? 1415 : slug === "wardrobe" ? 1500 : 2167} sizes="(max-width: 600px) 60vw, 260px" alt={`${name}: ${collection.labels[index]}`} /><span>{String(index + 1).padStart(2, "0")} / {collection.labels[index]} <span aria-hidden="true">↗</span></span></button>)}</div><p className="image-disclosure">{collection.caption}</p><dialog className="image-dialog" ref={dialog} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-label={`${name} enlarged preview`}><div className="image-dialog-toolbar"><span>{collection.labels[selected]}</span><button onClick={() => dialog.current?.close()} aria-label="Close enlarged preview">Close ×</button></div><Image className="enlarged-preview" src={source(selected)} width={1000} height={slug === "kaizencv" ? 1415 : slug === "wardrobe" ? 1500 : 2167} sizes="90vw" alt={`${name}: ${collection.labels[selected]}`} /><div className="image-dialog-controls"><button disabled={selected === 0} onClick={() => setSelected(selected - 1)}>← Previous</button><span>{selected + 1} / {collection.count}</span><button disabled={selected === collection.count - 1} onClick={() => setSelected(selected + 1)}>Next →</button></div></dialog></section>;
}
