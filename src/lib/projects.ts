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
};

export const linkedin = "https://www.linkedin.com/in/daryan-kf/";
export const contact = "mailto:info@sarpoli.com";

export const projects: Project[] = [
  {
    slug: "shield-family", name: "Shield Family", category: "Family wellbeing", status: "Live", year: "Ongoing",
    summary: "A little learning. A little more play.",
    headline: "Your family's limits. A little room to learn.",
    description: "A thoughtfully built iPhone app that helps families create healthier screen habits, connect learning with play, and make a plan together.",
    story: "Screen time is part of family life. I wanted to build something that makes it feel more intentional: clear boundaries, worthwhile learning, and a shared plan that parents and children can understand.",
    color: "#dce8d4", ink: "#273c2c", tags: ["iOS app", "Product design", "Family wellbeing"],
    features: [
      { title: "Set the boundaries", text: "Choose daily screen-time limits and bedtime. Earned extra time never overrides bedtime or a parent pause." },
      { title: "Let curiosity lead", text: "Quizzes and brain games can earn extra minutes, at the rate and within the daily cap you choose." },
      { title: "Keep the family in sync", text: "Share the family plan through private iCloud. Raw per-app screen-time data stays on the device; aggregate totals sync." }
    ],
    url: "https://shieldfamily.vercel.app", action: "Visit Shield Family",
    storeUrl: "https://apps.apple.com/app/shield-family-parents-control/id6782042659",
    privacyUrl: "https://daryan-kf.github.io/kidshield-legal/privacy.html",
    termsUrl: "https://daryan-kf.github.io/kidshield-legal/terms.html", support: "mailto:info@sarpoli.com"
  },
  {
    slug: "kaizencv", name: "KaizenCV", category: "Career & AI", status: "Live", year: "Ongoing",
    summary: "Your next chapter starts with you.", headline: "Make your next career move count.",
    description: "An AI career toolkit for turning your experience into a clearer CV, preparing for interviews, and approaching the next opportunity with more confidence.",
    story: "A good career tool should help people express what they can do. KaizenCV brings practical writing and preparation tools into one place, so the work of applying feels a little less overwhelming.",
    color: "#e9e3f3", ink: "#443264", tags: ["Web platform", "AI tools", "Career development"],
    features: [
      { title: "Tell your story clearly", text: "Import your CV, answer the coach's questions, and review suggestions before applying them." },
      { title: "Prepare with purpose", text: "Explore role-specific questions and company briefings with interview preparation, currently in beta." },
      { title: "Keep moving forward", text: "Bring your CV, cover letters and application tracker into one focused workspace." }
    ],
    url: "https://www.kaizencv.com", action: "Explore KaizenCV", privacyUrl: "https://www.kaizencv.com/privacy", termsUrl: "https://www.kaizencv.com/terms", support: "mailto:support@kaizencv.com"
  },
  {
    slug: "iqra", name: "Iqra", category: "Learning & faith", status: "Live", year: "Ongoing",
    summary: "A closer connection, one verse at a time.", headline: "A quieter space to learn and connect.",
    description: "A Quran learning companion, designed with care for reading, listening, memorisation, and building a meaningful daily practice.",
    story: "Some products are deeply personal. Iqra grows from the belief that learning should feel welcoming and manageable. It brings the essentials into a calm, considered experience that people can return to every day.",
    color: "#dce3cc", ink: "#304534", tags: ["Mobile app", "Quran learning", "Daily practice"],
    features: [
      { title: "Read at your pace", text: "Follow the Quran word by word, with transliteration and meaning alongside the Arabic." },
      { title: "Listen and learn", text: "Audio-led learning and recitation support for building familiarity over time." },
      { title: "Build a daily practice", text: "Memorisation tools designed around small, repeatable steps." }
    ],
    url: "https://iqra-quran-tau.vercel.app", action: "Visit Iqra", storeUrl: "https://apps.apple.com/app/id6797948777", privacyUrl: "https://iqra-quran-tau.vercel.app/privacy", termsUrl: "https://iqra-quran-tau.vercel.app/terms", support: "https://iqra-quran-tau.vercel.app/support"
  },
  {
    slug: "vela", name: "Vela", category: "Everyday momentum", status: "Live", year: "Ongoing",
    summary: "A little direction for your every day.", headline: "Make room for the day you want.",
    description: "A calm companion for everyday planning, focus and personal growth, built around momentum over streaks.",
    story: "Good tools meet you where you are. Vela explores how a personal app can make everyday decisions feel lighter, with thoughtful design that helps you keep moving without making life another dashboard.",
    color: "#f0dfd4", ink: "#734b3d", tags: ["Mobile app", "Productivity", "Personal routines"],
    features: [
      { title: "Find your next step", text: "Bring today's tasks, plans and goals together, with a voice companion to help you work through them." },
      { title: "Build your rhythm", text: "Focus sessions, habits and personal growth tools that keep attention on manageable progress." },
      { title: "A more personal toolkit", text: "Part of an evolving family of tools for everyday life, including Wardrobe." }
    ],
    url: "https://vela-productivity.vercel.app", action: "Visit Vela", storeUrl: "https://apps.apple.com/app/id6783922107", privacyUrl: "https://vela-productivity.vercel.app/privacy", termsUrl: "https://vela-productivity.vercel.app/terms", support: "https://vela-productivity.vercel.app/support"
  },
  {
    slug: "wardrobe", name: "Wardrobe", category: "Personal style", status: "Coming soon", year: "In the making",
    summary: "Less “nothing to wear.” More you.", headline: "A fresh look at what you already own.",
    description: "A digital closet and outfit companion exploring AI try-on, outfit ideas, and a more intentional relationship with your wardrobe. Part of the Vela family.",
    story: "The best outfit might already be in your closet. Wardrobe explores how technology can help you see familiar pieces differently and make getting dressed feel more creative.",
    color: "#e9e3d8", ink: "#514c43", tags: ["Vela family", "Digital wardrobe", "AI try-on"],
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
    story: "Property work involves a lot of documents and a lot of details. Købsklar explores a practical use for automation: helping professionals find, organise, and review the information that deserves their attention.",
    color: "#dce4e8", ink: "#2e4857", tags: ["Web platform", "AI automation", "Property documents"],
    features: [
      { title: "Bring documents together", text: "A dedicated workspace for reviewing the material behind a property transaction." },
      { title: "Surface the details", text: "AI-assisted analysis draws attention to concerns across purchase agreements, reports and supporting documents." },
      { title: "Keep people in the loop", text: "A draft assessment and advice letter support the lawyer's review and professional judgment." }
    ],
    url: "https://koebsklar.vercel.app", action: "Visit Købsklar", privacyUrl: "https://koebsklar.vercel.app/privatlivspolitik", termsUrl: "https://koebsklar.vercel.app/handelsbetingelser", support: contact
  },
  {
    slug: "sarpoli", name: "Sarpoli", category: "My AI agency", status: "Live", year: "Ongoing",
    summary: "AI that makes itself useful.", headline: "Thoughtful automation. Real-world work.",
    description: "My AI agency, helping businesses turn practical problems into thoughtfully designed websites, tools, and automated workflows.",
    story: "I founded Sarpoli to bring the same care I put into my own products to the work of other businesses. The starting point is always the work itself: understand the problem, build something useful, and keep improving it.",
    color: "#252c24", ink: "#eff0e5", tags: ["Founder", "AI agency", "Web & automation"],
    features: [
      { title: "Start with the problem", text: "Look at the workflow, understand what takes time, and identify where technology can help." },
      { title: "Build the right thing", text: "Design and develop websites, digital tools, and automations around the actual need." },
      { title: "Care beyond launch", text: "Bring a product mindset to client work, with attention to the details people use every day." }
    ], url: "https://sarpoli.com", action: "Meet Sarpoli", support: contact
  },
  {
    slug: "next-project", name: "Next project", category: "A little surprise", status: "2027", year: "2027",
    summary: "Something good is taking shape.", headline: "Something good is taking shape.",
    description: "A new project from Daryan Kamalifar. More in 2027.",
    story: "More in 2027.", color: "#eae6dc", ink: "#544e42", tags: [], features: []
  },
];

export const featuredProjects = projects.slice(0, 6);
export function getProject(slug: string) { return projects.find((project) => project.slug === slug); }
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");
}
