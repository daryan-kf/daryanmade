import { localePath, type Locale } from "./i18n";

/** Public product identities. No mailing-list configuration or credentials belong here. */
export const updateApps = ["vela", "iqra", "shield-family", "wardrobe", "kaizencv", "koebsklar", "sarpoli"] as const;
export type UpdateApp = (typeof updateApps)[number];

export const appUpdates = {
  vela: { name: "Vela", home: "/vela", base: "/vela/updates", heading: "A little more from Vela.", description: "New features, thoughtful improvements, and invitations to try what’s next.", accent: "#24574c", paper: "#f3f6ef", ink: "#172d27" },
  iqra: { name: "Iqra", home: "/iqra", base: "/iqra/updates", heading: "A little more from Iqra.", description: "New learning tools, useful updates, and invitations to try future versions.", accent: "#806124", paper: "#f7f2e8", ink: "#282219" },
  "shield-family": { name: "Shield Family", home: "/projects/shield-family", base: "/projects/shield-family/updates", heading: "Stay close to what’s next.", description: "Leave your email for new features, app updates, and invitations to test future versions of Shield Family.", accent: "#5149ad", paper: "#f4f2fb", ink: "#27233d" },
  wardrobe: { name: "Twillby", home: "/projects/wardrobe", base: "/projects/wardrobe/updates", heading: "Your next look starts here.", description: "Be first to hear when Twillby launches, see what’s taking shape, and get invitations to test early versions.", accent: "#355C9A", paper: "#EDF2F9", ink: "#202A3B" },
  kaizencv: { name: "KaizenCV", home: "/projects/kaizencv", base: "/projects/kaizencv/updates", heading: "Keep your next move in view.", description: "New career tools, product updates, and invitations to try future versions of KaizenCV.", accent: "#5142a1", paper: "#f0eef8", ink: "#29243b" },
  koebsklar: { name: "Købsklar", home: "/projects/koebsklar", base: "/projects/koebsklar/updates", heading: "Follow what’s next for Købsklar.", description: "Product news, new document tools, and invitations to test upcoming improvements.", accent: "#2857b0", paper: "#edf1f9", ink: "#202d45" },
  sarpoli: { name: "Sarpoli", home: "/projects/sarpoli", base: "/projects/sarpoli/updates", heading: "Good ideas keep moving.", description: "New projects, practical AI tools, and invitations to try what we’re building at Sarpoli.", accent: "#344e8a", paper: "#eef0f6", ink: "#202938" },
} satisfies Record<UpdateApp, { name: string; home: string; base: string; heading: string; description: string; accent: string; paper: string; ink: string }>;

export function isUpdateApp(value: string): value is UpdateApp {
  return (updateApps as readonly string[]).includes(value);
}

const danishDetails = {
  vela: { heading: "Lidt mere fra Vela.", description: "Nye funktioner, gennemtænkte forbedringer og invitationer til at prøve det næste." },
  iqra: { heading: "Lidt mere fra Iqra.", description: "Nye læringsværktøjer, nyttige opdateringer og invitationer til at prøve kommende versioner." },
  "shield-family": { heading: "Følg med i det næste.", description: "Skriv din e-mail, og få nye funktioner, appnyheder og invitationer til at teste kommende versioner af Shield Family." },
  wardrobe: { heading: "Dit næste look begynder her.", description: "Hør først, når Twillby lanceres, følg udviklingen, og få invitationer til at teste tidlige versioner." },
  kaizencv: { heading: "Hold øje med dit næste skridt.", description: "Nye karriereværktøjer, produktopdateringer og invitationer til at prøve kommende versioner af KaizenCV." },
  koebsklar: { heading: "Følg det næste fra Købsklar.", description: "Produktnyheder, nye dokumentværktøjer og invitationer til at teste kommende forbedringer." },
  sarpoli: { heading: "Gode idéer bevæger sig videre.", description: "Nye projekter, praktiske AI-værktøjer og invitationer til at prøve det, vi bygger hos Sarpoli." },
};

export function localizedAppUpdates(app: UpdateApp, locale: Locale = "en") {
  const product = appUpdates[app];
  return { ...product, ...(locale === "da" ? danishDetails[app] : {}), home: localePath(product.home, locale), base: localePath(product.base, locale) };
}

export function updateConsent(app: UpdateApp, locale: Locale = "en") {
  return locale === "da" ? `Ved at vælge “Hold mig opdateret” beder du om ${updateTopics(app, locale)} fra ${appUpdates[app].name} via e-mail. Du kan altid afmelde dig.` : `By choosing “Keep me in the loop”, you’re asking for ${updateTopics(app)} from ${appUpdates[app].name} by email. Unsubscribe anytime.`;
}

export const updateTopics = (_app: UpdateApp, locale: Locale = "en") => locale === "da" ? "appnyheder, lanceringsnyheder og invitationer til at teste kommende versioner" : "app updates, launch news, and invitations to test future versions";
