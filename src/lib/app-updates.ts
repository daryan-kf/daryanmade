import { localePath, type Locale } from "./i18n";

/** Public product identities. No mailing-list configuration or credentials belong here. */
export const updateApps = ["vela", "iqra", "shield-family"] as const;
export type UpdateApp = (typeof updateApps)[number];

export const appUpdates = {
  vela: { name: "Vela", home: "/vela", base: "/vela/updates", heading: "A little more from Vela.", description: "Vela 2.0 is here. Keep up with new features and thoughtful improvements.", accent: "#24574c", paper: "#f3f6ef", ink: "#172d27" },
  iqra: { name: "Iqra", home: "/iqra", base: "/iqra/updates", heading: "A little more from Iqra.", description: "New learning tools, useful improvements, and occasional app news.", accent: "#806124", paper: "#f7f2e8", ink: "#282219" },
  "shield-family": { name: "Shield Family", home: "/projects/shield-family", base: "/projects/shield-family/updates", heading: "Stay close to what’s next.", description: "New features, launches, and useful updates from Shield Family.", accent: "#5149ad", paper: "#f4f2fb", ink: "#27233d" },
} satisfies Record<UpdateApp, { name: string; home: string; base: string; heading: string; description: string; accent: string; paper: string; ink: string }>;

export function isUpdateApp(value: string): value is UpdateApp {
  return (updateApps as readonly string[]).includes(value);
}

const danishDetails = {
  vela: { heading: "Lidt mere fra Vela.", description: "Vela 2.0 er her. Følg med i nye funktioner og gennemtænkte forbedringer." },
  iqra: { heading: "Lidt mere fra Iqra.", description: "Nye læringsværktøjer, nyttige forbedringer og lejlighedsvise appnyheder." },
  "shield-family": { heading: "Følg med i det næste.", description: "Nye funktioner, lanceringer og nyttige nyheder fra Shield Family." },
};

export function localizedAppUpdates(app: UpdateApp, locale: Locale = "en") {
  const product = appUpdates[app];
  return { ...product, ...(locale === "da" ? danishDetails[app] : {}), home: localePath(product.home, locale), base: localePath(product.base, locale) };
}

export function updateConsent(app: UpdateApp, locale: Locale = "en") {
  return locale === "da" ? `Jeg vil gerne modtage ${updateTopics(app, locale)} fra ${appUpdates[app].name} via e-mail. Jeg kan altid afmelde mig.` : `I’d like ${updateTopics(app)} from ${appUpdates[app].name} by email. I can unsubscribe at any time.`;
}

export const updateTopics = (app: UpdateApp, locale: Locale = "en") => locale === "da" ? app === "vela" ? "nyheder, nye funktioner og produktopdateringer" : "nyheder, nye funktioner og lanceringsnyheder" : app === "vela" ? "news, new features, and product updates" : "news, new features, and launch updates";
