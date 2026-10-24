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
  mobileDescription?: string;
  story: string;
  color: string;
  ink: string;
  tags: string[];
  features: { title: string; text: string }[];
  faqs?: { question: string; answer: string }[];
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
    summary: "Screen-time rules. A shared family plan.",
    headline: "Clear limits, learning rewards and room for family life.",
    description: "An iPhone and iPad app for managing family screen time. Set app limits and routines, let children earn capped extra minutes through learning, answer requests remotely, and share an overview with a co-parent. Location sharing is optional.",
    mobileDescription: "Daily limits, learning rewards and parent-approved requests. One shared family plan, with optional location sharing.",
    story: "Shield Family makes the plan visible to both sides. Parents choose the limits, school and bedtime routines, learning rewards and pauses. Children see their balance, practise with quizzes and brain games, and ask for extra time. Parents can respond from their own phone, follow learning progress and optionally use family places and arrival notifications.",
    color: "#e9e8f7", ink: "#332c9e", tags: ["iOS app", "Product design", "Family wellbeing"],
    features: [
      { title: "Boundaries that follow the day", text: "Choose daily allowances, selected apps and school, homework or bedtime routines. Pause apps when the family needs a break; earned time does not override bedtime or a parent pause." },
      { title: "Learning with a clear reward", text: "Quizzes and brain games can earn minutes at parent-chosen rates and daily caps. Children can keep learning after the reward cap, with progress visible to the family." },
      { title: "A connected family overview", text: "Approve or decline requests from your phone, invite a co-parent and give each child their own settings. Optional location sharing adds family places and arrival notifications." }
    ],
    url: "/projects/shield-family", action: "Visit Shield Family",
    storeUrl: "https://apps.apple.com/app/id6782042659",
    privacyUrl: "https://daryan-kf.github.io/kidshield-legal/privacy.html",
    termsUrl: "https://daryan-kf.github.io/kidshield-legal/terms.html", support: "mailto:info@sarpoli.com"
  },
  {
    slug: "kaizencv", name: "KaizenCV", category: "Career & AI", status: "Live", year: "Ongoing",
    summary: "Your experience, made clear.", headline: "Turn the work you’ve done into a CV worth sending.",
    description: "An AI career coach and CV workspace. Import a PDF or Word CV, review suggested edits, tailor applications to a role and track where you’ve applied. Your first selected CV is free to export as a PDF.",
    mobileDescription: "Sharpen your CV with an AI coach and tailor it to the role. Your first selected CV exports free as a PDF.",
    story: "KaizenCV helps you explain the work you have actually done. The coach asks for missing details and offers edits you can approve or skip. Your confirmed experience carries into tailored CVs and cover letters, while templates and an application tracker keep the practical work together. Interview preparation is in beta; voice interview practice is still coming.",
    faqs: [
      { question: "What can I do for free?", answer: "Import, edit and download one selected CV as a PDF using a free template. You can keep editing and downloading that CV. The free plan also includes the application tracker and a limited AI allowance; Pro expands downloads, formats and AI use." },
      { question: "Is interview practice available?", answer: "Interview preparation with role-specific questions and company briefings is available in beta. Voice interview practice is planned for a later release." }
    ],
    color: "#e5e7fb", ink: "#4342b7", tags: ["Web platform", "AI tools", "Career development"],
    features: [
      { title: "Start with your real experience", text: "Import a PDF or Word CV and check the extracted details. The coach asks questions, then gives you suggestions to approve or skip." },
      { title: "Build an application around the role", text: "Tailor your CV and draft a cover letter from your experience. Track applications in one board; explore interview questions and company briefings in the beta preparation tools." },
      { title: "Choose the layout. Keep your words.", text: "Customise templates, fonts and colours without rewriting your CV. Keep editing and downloading one selected CV as a PDF free; Pro adds further exports and tailoring capacity." }
    ],
    url: "https://www.kaizencv.com", action: "Explore KaizenCV", privacyUrl: "https://www.kaizencv.com/privacy", termsUrl: "https://www.kaizencv.com/terms", support: "mailto:support@kaizencv.com"
  },
  {
    slug: "iqra", name: "Iqra", category: "Learning & faith", status: "Live", year: "Ongoing",
    marketingPath: "/iqra", previewLabel: "Read · Learn · Remember",
    screenshots: ["/images/iqra-site/read.webp", "/images/iqra-site/prayer.webp", "/images/iqra-site/memorize.webp"],
    summary: "Read, understand and return to the Quran.", headline: "A way into the Quran, wherever you begin.",
    description: "A Quran reader and learning companion with word audio, transliteration, meaning and commentary. Learn Arabic, organise memorisation and revision, find prayer times and explore sourced stories and duas. Every feature is free; no account is needed.",
    mobileDescription: "Read and hear each word. Learn Arabic, practise memorisation and find prayer tools. Every feature is free.",
    story: "Iqra offers several ways to begin: hear a word, read its meaning, learn a letter or return to a passage you are memorising. Prayer tools and sourced libraries bring that practice into everyday life. Personal records stay on the device, and downloaded recitation can travel with you. An optional subscription removes ads; it does not unlock features.",
    color: "#f0e6ce", ink: "#6b501f", tags: ["Mobile app", "Quran learning", "Daily practice"],
    features: [
      { title: "Hear it. Read it. Understand it.", text: "Tap words for recorded audio and meaning. Follow recitation with highlighting, switch reading layouts, explore tafsir and download audio for offline listening." },
      { title: "Learn, memorise and revisit", text: "Work through 16 Arabic lessons and a word bank. Keep new memorisation, recent revision and longer-term review in a manageable practice plan." },
      { title: "Bring practice into the everyday", text: "Use prayer times, qibla and guided salah. Explore duas, the 99 Names, sourced stories and hadith. All features are free; optional support removes ads." }
    ],
    url: "https://iqra-quran-tau.vercel.app", action: "Visit Iqra", storeUrl: "https://apps.apple.com/app/id6797948777", privacyUrl: "https://iqra-quran-tau.vercel.app/privacy", termsUrl: "https://iqra-quran-tau.vercel.app/terms", support: "https://iqra-quran-tau.vercel.app/support"
  },
  {
    slug: "vela", name: "Vela", category: "Everyday momentum", status: "Live", year: "Ongoing",
    marketingPath: "/vela", previewLabel: "Vela 2.0",
    screenshots: ["/images/vela-site/today.webp", "/images/vela-site/talk-to-vela.webp", "/images/vela-site/focus-session.webp"],
    summary: "A day planned. Space to grow.", headline: "Plan the day. Build what matters.",
    description: "A life planner for iPhone and iPad that connects tasks, calendar, focus, goals and habits. Capture thoughts by voice or text, choose your Top 3, and make room for reflection with a journal, mood check-ins and gratitude.",
    mobileDescription: "Tasks, calendar, focus and ideas in one app. Plan your day, build better habits and make room to reflect.",
    story: "Vela connects a thought to something you can do today. Talk to Vela helps capture and change plans; Top 3 and Focus make the next step clear. Ideas can become goals, habits can follow a flexible rhythm, and a weekly review brings reflection back into planning. Progress grows without streak pressure. Vela Pro is a subscription.",
    color: "#d9e9df", ink: "#205e51", tags: ["AI planning", "iPhone & iPad", "Vela 2.0"],
    features: [
      { title: "Capture it your way", text: "Speak, type or scan a handwritten list. Talk to Vela can add, move and complete items, with visible changes and Undo." },
      { title: "Choose, then focus", text: "See tasks beside your calendar, choose a Top 3 and start a focus timer. Optional app blocking helps protect the session." },
      { title: "Build a life beyond the list", text: "Develop ideas, goals and flexible habits. Journal, track mood, practise gratitude and review vocabulary; use your weekly review to plan what comes next." }
    ],
    url: "https://daryanmade.com/vela", action: "Visit Vela", storeUrl: "https://apps.apple.com/app/id6783922107", privacyUrl: "https://vela-productivity.vercel.app/privacy", termsUrl: "https://vela-productivity.vercel.app/terms", support: "https://vela-productivity.vercel.app/support"
  },
  {
    slug: "wardrobe", name: "Twillby", category: "Personal style", status: "Coming soon", year: "In the making",
    summary: "Your clothes. More ways to wear them.", headline: "See the possibilities in your own closet.",
    description: "A personal closet, outfit planner and optional AI try-on app. Photograph or import clothes, organise pieces, save outfit combinations and plan looks on a calendar. Coming soon to the App Store and Google Play.",
    mobileDescription: "Your own clothes, saved outfits and a plan for tomorrow. Optional AI try-on, with the price shown before you generate.",
    story: "Twillby starts with the clothes you already own. Keep pieces and saved sets together, plan an outfit for a date, and revisit combinations you might have forgotten. Optional AI tools explore try-on pictures, outfit ideas, hair inspiration and styling advice. You choose which photos to share and see the credit price before confirming a generation.",
    color: "#E8E4DB", ink: "#355C9A", tags: ["Coming soon", "Digital wardrobe", "AI try-on"],
    marketingPath: "/projects/wardrobe", action: "Explore Twillby",
    features: [
      { title: "A closet you can actually find things in", text: "Add photos, organise clothes by category and tags, and keep favourite pieces and saved outfit sets easy to find." },
      { title: "An outfit with a date", text: "Plan looks on the calendar using your own pieces and saved combinations. Revisit favourites without rebuilding an outfit from scratch." },
      { title: "Try a new direction", text: "Explore optional AI try-on and styling ideas with selected photos and a confirmed credit price. Generated pictures suggest a look; they do not guarantee fit." }
    ]
  },
  {
    slug: "koebsklar", name: "Købsklar", category: "Property & automation", status: "Live", year: "Ongoing",
    summary: "Every property finding, back to its source.", headline: "The property case, prepared for your review.",
    description: "A document workspace for Danish property lawyers. Read purchase agreements, land-registry records, BBR and inspection reports together, surface discrepancies, and prepare source-linked findings and draft advice for professional review.",
    mobileDescription: "Read the whole property case together. Source-linked findings and draft advice, ready for the lawyer’s review.",
    story: "A property case only makes sense when its documents are read together. Købsklar connects extracted facts to the original document and page, flags differences between files, and shows missing or unreadable material. It prepares an analysis report, draft legal assessment, advisory letter and document overview. The lawyer checks, edits and owns the advice.",
    faqs: [
      { question: "What does Købsklar prepare?", answer: "An analysis report, draft legal assessment, buyer advisory letter and document overview. Findings point to document pages, discrepancies are flagged, and the lawyer reviews and edits the material before using it." },
      { question: "Can colleagues work on the same cases?", answer: "Create a firm and invite colleagues to share cases within it. A source-linked finding can be opened in the original document or re-checked with the assistant; the professional assessment remains with the lawyer." }
    ],
    color: "#e2e9fc", ink: "#1d4ed8", tags: ["Web platform", "AI automation", "Property documents"],
    features: [
      { title: "Read the whole case together", text: "Bring purchase agreements, BBR, land-registry records and inspection reports into one case. Scanned documents use text recognition; unreadable files are identified." },
      { title: "Check a finding in context", text: "Follow a fact to its document and page, inspect cross-document discrepancies, or ask the assistant to re-check a field against the sources." },
      { title: "Four deliverables, ready to review", text: "Review the analysis report, draft legal assessment, advisory letter and document overview. Download as PDF or Word, edit the advice and share cases within your firm." }
    ],
    url: "https://koebsklar.vercel.app", action: "Visit Købsklar", privacyUrl: "https://koebsklar.vercel.app/privatlivspolitik", termsUrl: "https://koebsklar.vercel.app/handelsbetingelser", support: agencyContact
  },
  {
    slug: "sarpoli", name: "Sarpoli", category: "AI agency", status: "Live", year: "Ongoing",
    summary: "Less document work. More professional judgment.", headline: "Your documents, read. Your team, in control.",
    description: "An AI automation studio for law firms, accountants and property teams. We build workflows that read case files, contracts and invoices, extract information with sources, and leave approval with the people doing the work.",
    mobileDescription: "Custom AI workflows for law firms, accountants and property teams. Documents read, sources linked, people in control.",
    story: "I founded Sarpoli around the work that keeps returning to a professional’s desk. We start with the team’s own documents, map the repetition, and recommend a practical place to begin. The result is a custom workflow built around existing systems, with source references, visible uncertainty and human approval.",
    faqs: [
      { question: "Is Sarpoli an app we subscribe to?", answer: "Sarpoli builds custom AI workflows for professional teams. We begin with an audit of your documents and repeated tasks, then agree the scope and fixed price before implementation." },
      { question: "Does the AI make the professional decision?", answer: "The workflow finds and structures information, points to its sources and flags uncertainty. Your team reviews and approves the output; professional judgment stays with you." }
    ],
    color: "#0b0f1a", ink: "#d9e0fb", tags: ["Founder", "AI automation", "Documents & workflows"],
    features: [
      { title: "Map before we build", text: "A free AI audit identifies repeated document tasks and estimates the hours involved. The written recommendations are yours to keep." },
      { title: "Every field has a source", text: "Extract facts from contracts, invoices and case files with document references. Missing or uncertain information is flagged for review." },
      { title: "Built around your team", text: "Custom automations fit existing systems and approval steps. Implementation is agreed at a fixed price, with the first month of operation included." }
    ], url: "https://sarpoli.com", action: "Meet Sarpoli", support: agencyContact
  },
  {
    slug: "next-project", name: "Next project", category: "A little surprise", status: "2027", year: "2027",
    summary: "Something big is coming.", headline: "Something big is coming.",
    description: "A new project from Daryan Kamalifar, arriving mid-2027.",
    story: "Arriving mid-2027.", color: "#eae6dc", ink: "#544e42", tags: [], features: []
  },
];

// Keep detail-page numbering and next-project navigation aligned with the home collection.
const collectionOrder = ["sarpoli", "vela", "wardrobe", "kaizencv", "koebsklar", "shield-family", "iqra", "next-project"];
export const projects: Project[] = collectionOrder.map(slug => projectCatalog.find(project => project.slug === slug)!);
export function getProject(slug: string, locale: Locale = "en"): Project | undefined {
  const project = projects.find(project => project.slug === slug);
  if (!project || locale === "en") return project;
  const t = portfolioCopy(locale);
  return { ...project, name: t(project.name), category: t(project.category), year: t(project.year), summary: t(project.summary), headline: t(project.headline), description: t(project.description), mobileDescription: project.mobileDescription ? t(project.mobileDescription) : undefined, story: t(project.story), tags: project.tags.map(t), action: project.action ? t(project.action) : undefined, previewLabel: project.previewLabel ? t(project.previewLabel) : undefined, features: project.features.map(feature => ({ title: t(feature.title), text: t(feature.text) })), faqs: project.faqs?.map(faq => ({ question: t(faq.question), answer: t(faq.answer) })) };
}
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");
}
