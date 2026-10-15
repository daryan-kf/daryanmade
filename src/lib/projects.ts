import { localePath, type Locale } from "./i18n";
import { portfolioCopy } from "./portfolio-copy";
export type ProjectStatus = "Live" | "Coming soon" | "In development" | "Client project" | "2027";
export type Project = {
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  year: string;
  summary: string;
  headline: string;
  description: string;
  story: string;
  color: string;
  ink: string;
  tags: string[];
  features: { title: string; text: string }[];
  url?: string;
  action?: string;
  storeUrl?: string;
  privacyUrl?: string;
  termsUrl?: string;
  support?: string;
  marketingPath?: string;
  previewLabel?: string;
  screenshots?: string[];
};

export const linkedin = "https://www.linkedin.com/in/daryan-kf/";
export const contactEmail = "daryankamalifar@gmail.com";
export const contact = `mailto:${contactEmail}`;
const agencyContact = "mailto:info@sarpoli.com";

export function projectDestination(project: Project, locale: Locale = "en") {
  if (project.marketingPath) {
    return { href: localePath(project.marketingPath, locale), label: `${locale === "da" ? "Udforsk" : "Explore"} ${project.name}`, external: false };
  }
  if (["sarpoli", "kaizencv", "koebsklar"].includes(project.slug) && project.url) {
    return { href: project.url, label: `${locale === "da" ? "Besøg" : "Visit"} ${project.name}`, external: true };
  }
  return { href: localePath(`/projects/${project.slug}`, locale), label: locale === "da" ? "Se projektet" : project.slug === "shield-family" ? "Explore Shield Family" : "A little preview", external: false };
}

export function projectPath(project: Project) {
  return project.marketingPath || `/projects/${project.slug}`;
}

const projectCatalog: Project[] = [
  {
    slug: "shield-family", name: "Shield Family", category: "Family wellbeing", status: "Live", year: "Ongoing",
    marketingPath: "/projects/shield-family", previewLabel: "Latest update preview",
    screenshots: ["/images/shield-site/today.webp", "/images/shield-site/child.webp", "/images/shield-site/learn.webp"],
    summary: "A little learning. A little more play.",
    headline: "Your family's limits. A little room to learn.",
    description: "A shared family plan for screen time. Set the boundaries, let children earn minutes through learning, and keep requests, routines and progress in one calm place.",
    story: "Screen time is part of family life. I wanted to build something that makes it feel more intentional: clear boundaries, worthwhile learning, and a shared plan that parents and children can understand.",
    color: "#e9e8f7", ink: "#332c9e", tags: ["iOS app", "Product design", "Family wellbeing"],
    features: [
      { title: "Set the boundaries", text: "Choose daily screen-time limits and bedtime. Earned extra time never overrides bedtime or a parent pause." },
      { title: "Let curiosity lead", text: "Quizzes and brain games can earn extra minutes, at the rate and within the daily cap you choose." },
      { title: "Keep the family in sync", text: "Share the family plan through private iCloud. Raw per-app screen-time data stays on the device; aggregate totals sync." }
    ],
    url: "/projects/shield-family", action: "Visit Shield Family",
    storeUrl: "https://apps.apple.com/app/id6782042659",
    privacyUrl: "https://daryan-kf.github.io/kidshield-legal/privacy.html",
    termsUrl: "https://daryan-kf.github.io/kidshield-legal/terms.html", support: "mailto:info@sarpoli.com"
  },
  {
    slug: "kaizencv", name: "KaizenCV", category: "Career & AI", status: "Live", year: "Ongoing",
    summary: "Your next chapter starts with you.", headline: "Make your next career move count.",
    description: "An AI career workspace for expressing your experience, tailoring a CV and cover letter to the role, and keeping track of the next opportunity.",
    story: "The hard part is often finding the words for work you already know how to do. KaizenCV starts with your experience: import your CV, work through it with a coach, and review every suggestion before applying it. Choose a template, prepare an application for the role, and keep the next steps together.",
    color: "#e5e7fb", ink: "#4342b7", tags: ["Web platform", "AI tools", "Career development"],
    features: [
      { title: "Tell your story clearly", text: "Import your CV, answer the coach's questions, and review suggestions before applying them." },
      { title: "Prepare with purpose", text: "Explore role-specific questions and company briefings with interview preparation, currently in beta." },
      { title: "Make the next move", text: "Tailor your CV and cover letter to the role, export a PDF, and follow your applications in one workspace." }
    ],
    url: "https://www.kaizencv.com", action: "Explore KaizenCV", privacyUrl: "https://www.kaizencv.com/privacy", termsUrl: "https://www.kaizencv.com/terms", support: "mailto:support@kaizencv.com"
  },
  {
    slug: "iqra", name: "Iqra", category: "Learning & faith", status: "Live", year: "Ongoing",
    marketingPath: "/iqra", previewLabel: "Read · Learn · Remember",
    screenshots: ["/images/iqra-site/read.webp", "/images/iqra-site/prayer.webp", "/images/iqra-site/memorize.webp"],
    summary: "Begin with one word.", headline: "You don’t have to know Arabic to begin.",
    description: "Hear each word, understand its meaning, and find your own rhythm with the Quran. Reading, Arabic lessons, memorization and prayer tools — free, with no account required.",
    story: "Some products are deeply personal. Iqra grows from the belief that learning should feel welcoming and manageable. It brings the essentials into a calm, considered experience that people can return to every day.",
    color: "#f0e6ce", ink: "#6b501f", tags: ["Mobile app", "Quran learning", "Daily practice"],
    features: [
      { title: "Read at your pace", text: "Follow the Quran word by word, with transliteration and meaning alongside the Arabic." },
      { title: "Listen and learn", text: "Audio-led learning and recitation support for building familiarity over time." },
      { title: "Build a daily practice", text: "Memorisation tools designed around small, repeatable steps." }
    ],
    url: "https://iqra-quran-tau.vercel.app", action: "Visit Iqra", storeUrl: "https://apps.apple.com/app/id6797948777", privacyUrl: "https://iqra-quran-tau.vercel.app/privacy", termsUrl: "https://iqra-quran-tau.vercel.app/terms", support: "https://iqra-quran-tau.vercel.app/support"
  },
  {
    slug: "vela", name: "Vela", category: "Everyday momentum", status: "Live", year: "Ongoing",
    marketingPath: "/vela", previewLabel: "Vela 2.0",
    screenshots: ["/images/vela-site/today.webp", "/images/vela-site/talk-to-vela.webp", "/images/vela-site/focus-session.webp"],
    summary: "One sentence. Your day, planned.", headline: "Just say it.",
    description: "An AI planner that turns what’s on your mind into a day you can actually finish. Tasks, focus, ideas, goals and flexible habits, together in one thoughtful app. Meet Vela 2.0.",
    story: "A good day starts with a little direction. Vela connects the thought you want to capture with the next step you can take: say it, review it, give it a place in your day. Vela 2.0 brings that idea into a calmer, more connected experience.",
    color: "#d9e9df", ink: "#205e51", tags: ["AI planning", "iPhone & iPad", "Vela 2.0"],
    features: [
      { title: "Say what’s on your mind", text: "Talk or type to Vela, review the proposed actions, and keep control with Undo." },
      { title: "Give your day a shape", text: "Bring tasks and calendar together, choose your Top 3, and make room for a focused session." },
      { title: "Keep your ideas moving", text: "Turn ideas into goals and practical next steps. Build flexible habits with momentum, not streak pressure." }
    ],
    url: "https://vela-productivity.vercel.app", action: "Visit Vela", storeUrl: "https://apps.apple.com/app/id6783922107", privacyUrl: "https://vela-productivity.vercel.app/privacy", termsUrl: "https://vela-productivity.vercel.app/terms", support: "https://vela-productivity.vercel.app/support"
  },
  {
    slug: "wardrobe", name: "Wardrobe", category: "Personal style", status: "Coming soon", year: "In the making",
    summary: "Less “nothing to wear.” More you.", headline: "A fresh look at what you already own.",
    description: "A digital closet and outfit companion exploring AI try-on, outfit ideas, and a more intentional relationship with your wardrobe. Still in the making.",
    story: "The best outfit might already be in your closet. Wardrobe explores how technology can help you see familiar pieces differently and make getting dressed feel more creative.",
    color: "#e1e1dd", ink: "#555b56", tags: ["Coming soon", "Digital wardrobe", "AI try-on"],
    features: [
      { title: "Meet your digital closet", text: "Bring the pieces you own into a single place to explore and organise." },
      { title: "See a new combination", text: "Discover outfit possibilities and looks built around your personal style." },
      { title: "Explore AI try-on", text: "An experimental way to visualise a look before deciding what to wear." }
    ]
  },
  {
    slug: "koebsklar", name: "Købsklar", category: "Property & automation", status: "Live", year: "Ongoing",
    summary: "Complex property documents. A clearer picture.", headline: "More clarity before the next property decision.",
    description: "An AI-assisted document workspace for Danish property lawyers, bringing purchase agreements, condition reports and transaction documents into a structured review.",
    story: "A property case can mean repeatedly checking the same facts across a purchase agreement, condition report and supporting documents. Købsklar reads them together, connects findings to their sources, and prepares draft material for the lawyer. The intended benefit is less manual preparation and more attention for the case and the buyer; professional review remains essential.",
    color: "#e2e9fc", ink: "#1d4ed8", tags: ["Web platform", "AI automation", "Property documents"],
    features: [
      { title: "A case, connected", text: "Read purchase agreements, condition reports and supporting documents together, with discrepancies across files brought into view." },
      { title: "Findings with a source", text: "Follow key facts to their document and page, then check the analysis in context." },
      { title: "The groundwork, prepared", text: "An analysis report, draft legal assessment, advisory letter and document overview support the lawyer's review and professional judgment." }
    ],
    url: "https://koebsklar.vercel.app", action: "Visit Købsklar", privacyUrl: "https://koebsklar.vercel.app/privatlivspolitik", termsUrl: "https://koebsklar.vercel.app/handelsbetingelser", support: agencyContact
  },
  {
    slug: "sarpoli", name: "Sarpoli", category: "My AI agency", status: "Live", year: "Ongoing",
    summary: "Less repetitive work. More room for people.", headline: "AI that understands the work.",
    description: "I founded Sarpoli to build practical AI automations alongside lawyers, accountants and property teams. We turn document-heavy processes into useful workflows, with clear sources and a person in control.",
    story: "Case files, contracts, invoices. The same information read, checked and entered again. At Sarpoli, we work alongside the people doing that work, identify where time can be saved, and build around the systems they already use. AI handles the repetition; professionals keep the judgment.",
    color: "#0b0f1a", ink: "#d9e0fb", tags: ["Founder", "AI automation", "Documents & workflows"],
    features: [
      { title: "Start with the actual work", text: "Map the documents and repeated tasks with the people who know them best." },
      { title: "Make the sources clear", text: "Extract useful information from case files, contracts and invoices, with source references and uncertainty made visible." },
      { title: "Keep people in control", text: "Connect the workflow to the team’s existing systems, with a person reviewing the output before it is used." }
    ], url: "https://sarpoli.com", action: "Meet Sarpoli", support: agencyContact
  },
  {
    slug: "next-project", name: "Next project", category: "A little surprise", status: "2027", year: "2027",
    summary: "Something good is taking shape.", headline: "Something good is taking shape.",
    description: "A new project from Daryan Kamalifar. More in 2027.",
    story: "More in 2027.", color: "#eae6dc", ink: "#544e42", tags: [], features: []
  },
];

// Keep detail-page numbering and next-project navigation aligned with the home collection.
const collectionOrder = ["sarpoli", "vela", "wardrobe", "kaizencv", "koebsklar", "shield-family", "iqra", "next-project"];
export const projects: Project[] = collectionOrder.map(slug => projectCatalog.find(project => project.slug === slug)!);
export const featuredProjects = projects.slice(0, 6);
export function getProject(slug: string, locale: Locale = "en"): Project | undefined {
  const project = projects.find(project => project.slug === slug);
  if (!project || locale === "en") return project;
  const t = portfolioCopy(locale);
  return { ...project, name: t(project.name), category: t(project.category), year: t(project.year), summary: t(project.summary), headline: t(project.headline), description: t(project.description), story: t(project.story), tags: project.tags.map(t), action: project.action ? t(project.action) : undefined, previewLabel: project.previewLabel ? t(project.previewLabel) : undefined, features: project.features.map(feature => ({ title: t(feature.title), text: t(feature.text) })) };
}
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");
}
