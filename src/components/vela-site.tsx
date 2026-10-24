import { localePath, type Locale } from "@/lib/i18n";
import { appCopy } from "@/lib/app-site-copy";
import { LanguageSwitch } from "./language-switch";
import Image from "next/image";
import type { CSSProperties } from "react";
import Link from "next/link";
import { AppUpdatesForm } from "@/components/app-updates-form";
import { AppUpdatesInline } from "@/components/app-updates-inline";
import { AppleIcon, Arrow } from "./icons";
import { FaqAccordion } from "./faq-accordion";
import { ProductFilm } from "./product-film";
import { ProductMotion } from "./product-motion";
import { ProductGallery } from "./product-gallery";
import { VelaExplorer } from "./vela-explorer";
import styles from "./vela-site.module.css";

const STORE = "https://apps.apple.com/app/id6783922107";
const IMAGE = "/images/vela-site/";

function StoreLink({ quiet = false, locale = "en" }: { quiet?: boolean; locale?: Locale }) {
  const t = appCopy(locale);
  return <a href={STORE} className={quiet ? styles.headerButton : styles.button}><AppleIcon />{t("Download Vela")}<Arrow diagonal /></a>;
}

function Phone({ file, alt, className = "", eager = false }: { file: string; alt: string; className?: string; eager?: boolean }) {
  return <div className={`${styles.phone} ${className}`}><Image src={`${IMAGE}${file}.webp`} width={900} height={1951} alt={alt} sizes="(max-width: 700px) 48vw, 280px" loading={eager ? "eager" : "lazy"} /></div>;
}

const loopSteps: [string, string, string][] = [
  ["Capture", "Type, speak, share or scan a task, an idea or a reflection.", "Talk to Vela · Ideas · Paper to plan"],
  ["Choose", "Pick the day, a goal or up to three priorities.", "Plan · Top 3 · Goals"],
  ["Do", "Take the next step. Start Focus and pause the apps you choose.", "Focus · App pausing"],
  ["Reflect", "Tick a habit, check in with your mood, write a line or give thanks.", "Habits · Mood · Journal"],
  ["Review", "Look back on the week and choose next week’s steps.", "Weekly review · Progress"],
];

// Audience hypotheses from the product research, written as the wish each person brings.
const people: [string, string, string, string][] = [
  ["✦", "The overwhelmed planner", "A day you can actually finish, not a longer list.", "Top 3 · Plan · Today"],
  ["◐", "The distracted scroller", "Make scrolling a choice, without deleting everything.", "Focus · App pausing · Daily limits"],
  ["✳", "The idea person", "Ideas that come back instead of getting lost in a notes app.", "Ideas · Boards · Goals"],
  ["↗", "The self-improver", "See that you’re moving, without the streak guilt.", "Habits · Mood · Progress"],
  ["Aa", "The language learner", "Words that come back, a few minutes a day.", "Language review · Word sets"],
];

const trust: [string, string, string][] = [
  ["✓", "AI asks first", "Cloud AI asks for your permission and shows what is shared before anything is sent. Decline, and the manual tools still work."],
  ["◎", "Simple commands stay on your phone", "Supported commands and questions about your day run on the device. Bigger requests need a connection, your consent and remaining AI allowance."],
  ["↯", "Planning that works offline", "Your plan is saved on the device first and syncs when you reconnect. AI, book search and sync need the internet."],
  ["⌘", "An optional app lock", "Lock Vela with Face ID or Touch ID and keep private details out of widgets, notifications and the Lock Screen."],
  ["✦", "Momentum over streaks", "Progress counts what you did. A missed day never erases it, and nobody is compared with anyone else."],
  ["文", "Nine languages", "English, Spanish, Chinese, Hindi, French, Arabic, Portuguese, Persian and Danish, with right-to-left support."],
];

export function VelaSite({ locale = "en" }: { locale?: Locale }) {
  const t = appCopy(locale);
  const questions = [
  { question: t("Is Vela 2.0 available now?"), answer: <p>{t("Yes. Vela 2.0 is available on the App Store for iPhone and iPad. Join the Vela updates below for new features and occasional news from the app.")}</p> },
  { question: t("Is Vela free?"), answer: <p>{t("No. Vela requires a Vela Pro subscription, with weekly, monthly and annual plans. Eligible annual subscribers can start with a seven-day trial. Your local price, renewal terms and eligibility are shown in the App Store before you subscribe.")}</p> },
  { question: t("What does Talk to Vela actually do?"), answer: <p>{t("Speak or type to add, move and finish tasks, manage goals, habits and ideas, start Focus or ask about your day. Vela shows each change, with Undo where it’s supported. A handwritten list is reviewed before anything is added. Cloud AI asks for your permission first; supported simple commands run on your phone.")}</p> },
  { question: t("What can Vela’s AI see?"), answer: <p>{t("Context that’s relevant to your request, and only after you agree. That can include what you type or say, related items from your plan, recent mood check-in times and, if you’ve connected a calendar, today’s event titles and start times. Scanned pages are read on your phone; only the recognised text is sent.")}</p> },
  { question: t("How does Focus handle distracting apps?"), answer: <p>{t("With your permission, Focus uses Apple Screen Time to pause the apps you choose during a session. You can also set daily limits, gentle or locked, and blocked hours. You stay in charge: a session can always be ended.")}</p> },
  { question: t("Does Vela use streaks?"), answer: <p>{t("No. Habits can be daily, on chosen days or any number of days a week, and progress only counts what you’ve recorded. A missed day doesn’t reset anything.")}</p> },
  { question: t("Can I use Vela without an internet connection?"), answer: <p>{t("Your plan and personal records are saved on your device first. You can begin without an account and connect one when you want to sync. AI requests and some connected services need internet access.")}</p> },
  { question: t("Which devices is Vela made for?"), answer: <p>{t("Vela 2.0 is designed for iPhone and iPad, with native widgets, light and dark themes, and nine interface languages. Check the App Store for the requirements of the currently available release.")}</p> },
];
  return <ProductMotion className={styles.site}>
    <div className={styles.maker}><Link href={localePath("/", locale)}>{t("← daryanmade")}</Link><span>{t("Thoughtfully made. Independently built.")}</span><LanguageSwitch locale={locale} /></div>
    <header className={styles.header}>
      <a href="#top" className={styles.brand} aria-label={t("Vela home")}><Image src={`${IMAGE}icon.webp`} width={38} height={38} alt="" />{t("vela")}</a>
      <nav aria-label={t("Vela navigation")}><a href="#your-day">{t("Your day")}</a><a href="#focus">{t("Find your focus")}</a><a href="#loop">{t("How it works")}</a><a href="#inside">{t("Explore")}</a><a href="#updates">{t("Updates")}</a></nav>
      <StoreLink locale={locale} quiet />
    </header>
    <main id="main-content">
      <section className={styles.hero} aria-labelledby="vela-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t("A little more clarity. A little more you.")}</p>
          <h1 id="vela-title" data-product-enter>{t("Just")}<br /><em>{t("say it.")}</em><span className={styles.spark} aria-hidden="true">✦</span></h1>
          <p className={styles.heroPromise}>{t("One sentence. Your day, planned.")}</p>
          <p className={styles.lead}>{t("Plan your day, protect a little focus and keep your ideas moving. Tasks, calendar, goals and habits meet a journal, mood check-ins and a weekly review, in one app for iPhone and iPad.")}</p>
          <div className={styles.actions}><StoreLink locale={locale} /><a href="#updates" className={styles.textLink}>{t("Keep up with Vela")}{" "}<Arrow /></a></div>
          <p className={styles.previewNote}><span />{t("Vela 2.0 is here · Made for iPhone and iPad.")}</p>
        </div>
        <div className={styles.heroArt} data-product-fan>
          <div className={styles.sun} aria-hidden="true" /><div className={styles.orbit} aria-hidden="true" />
          <div className={styles.backPhone} data-fan-phone><Phone file="plan-calendar-top" alt={t("Vela 2.0 interface illustration: calendar events and tasks together in a day view")} eager /></div>
          <div className={styles.frontPhone} data-fan-phone><Phone file="today" alt={t("Vela 2.0 Today interface illustration with Focus, Talk to Vela, Top 3 and the day's plan")} eager /></div>
          <div className={styles.heroNote}><span aria-hidden="true">✳</span><div>{t("A little less scattered.")}<br /><strong>{t("A little more started.")}</strong></div></div>
          <span className={styles.heroArtCaption}>{t("YOUR DAY. WITH A LITTLE BREATHING ROOM.")}</span>
        </div>
      </section>

      <div className={styles.promiseStrip}><span>{t("Plan with your voice")}</span><i aria-hidden="true">✦</i><span>{t("Protect your focus")}</span><i aria-hidden="true">✦</i><span>{t("Keep ideas moving")}</span><i aria-hidden="true">✦</i><span>{t("Momentum over streaks")}</span></div>

      <section className={styles.planSection} id="your-day" aria-labelledby="plan-title">
        <div className={styles.sectionHead}><p className={styles.eyebrow}>{t("01 / From a busy mind to a clear next step")}</p><h2 id="plan-title">{t("One thought.")}<br /><em>{t("A whole plan.")}</em></h2><p>{t("Less time organising your life.")}<br />{t("More time actually living it.")}</p></div>
        <figure className={styles.planScene} data-plan-scene aria-label={t("Illustration of Talk to Vela turning a spoken request into tasks for review")}>
          <div className={styles.voiceBubble}><span className={styles.voiceLabel}>{t("TALK TO VELA")}</span><p>{t("“Dentist Friday at three.")}<br />{t("Finish the report by noon.")}<br /><em>{t("And call Mum tonight.”")}</em></p><div className={styles.wave} aria-hidden="true">{Array.from({ length: 29 }, (_, i) => <i key={i} style={{ height: `${8 + ((i * 17) % 27)}px` }} />)}</div></div>
          <div className={styles.planConnector} aria-hidden="true"><span data-plan-line /><b>→</b></div>
          <div className={styles.taskStack}>
            {[{ name: t("Dentist"), when: t("Friday · 3:00 PM"), icon: "↗" }, { name: t("Finish the report"), when: t("Today · 12:00 PM · Top 3"), icon: "✓" }, { name: t("Call Mum"), when: t("Tonight · 8:00 PM"), icon: "♡" }].map((task, i) => <div className={styles.taskCard} data-task-card key={task.name}><span>{task.icon}</span><div><strong>{task.name}</strong><small>{task.when}</small></div><span className={styles.taskNumber}>0{i + 1}</span></div>)}
            <p className={styles.reviewLabel}>{t("Review the changes. Keep the final say.")}</p>
          </div>
          <figcaption>{t("Product illustration · Talk to Vela by voice or text. Supported changes have Undo.")}</figcaption>
        </figure>
        <div className={styles.threePoints}>
          <article><span>01</span><h3>{t("Say it your way.")}</h3><p>{t("Talk, type, or bring a handwritten list. Vela helps turn the things on your mind into something you can act on.")}</p></article>
          <article><span>02</span><h3>{t("Give the day a shape.")}</h3><p>{t("Choose your Top 3. See tasks and calendar events together as a list, schedule or hour grid.")}</p></article>
          <article><span>03</span><h3>{t("Keep the final say.")}</h3><p>{t("See what Vela changed, undo a step, or move something to tomorrow. Your plan can change with you.")}</p></article>
        </div>
        <div className={styles.voiceFilm}><ProductFilm locale={locale} src="/videos/vela/just-say-it.mp4" poster={`${IMAGE}film-poster.webp`} title={t("Vela: just say it")} caption={t("10 seconds · One sentence becomes four changes to review.")} transcript={t("A voice request fills the listening panel. Vela turns it into four suggested changes, ready to review and add. The film uses Vela 2.0 interface illustrations.")} /></div>
      </section>

      <section className={styles.focusSection} id="focus" aria-labelledby="focus-title">
        <div className={styles.focusCopy}><p className={styles.eyebrow}>{t("02 / Make a little room")}</p><h2 id="focus-title">{t("The world can")}<br /><em>{t("wait a minute.")}</em></h2><p>{t("Start a focus session in one tap. Pause the apps that pull you away, and let the next small thing have your attention.")}</p><ul><li>{t("A timer with a clear beginning and end")}</li><li>{t("Selected-app pausing with Apple Screen Time")}</li><li>{t("Your session, right on the Lock Screen")}</li></ul><a href="#inside" className={styles.lightLink}>{t("There’s more room to grow")}{" "}<Arrow /></a></div>
        <figure className={styles.focusScene} data-focus-scene aria-label={t("Illustration of a focus timer pausing selected distractions")}>
          <div className={`${styles.distraction} ${styles.distractionOne}`} data-distraction>{t("One more scroll?")}</div><div className={`${styles.distraction} ${styles.distractionTwo}`} data-distraction>{t("Another notification.")}</div>
          <svg viewBox="0 0 280 280" className={styles.focusRing} aria-hidden="true"><circle cx="140" cy="140" r="112" /><circle cx="140" cy="140" r="112" data-focus-arc /></svg>
          <div className={styles.timer}><span>{t("JUST THIS ONE THING")}</span><strong>24:59</strong><span>{t("Time to make a start.")}</span></div><figcaption data-focus-label><span aria-hidden="true">✓</span>{" "}{t("Distracting apps, paused.")}</figcaption>
        </figure>
      </section>


      <section className={styles.loopSection} id="loop" aria-labelledby="loop-title">
        <div className={styles.sectionHead}><p className={styles.eyebrow}>{t("03 / How it fits together")}</p><h2 id="loop-title">{t("Catch the thought.")}<br /><em>{t("Keep it moving.")}</em></h2><p>{t("Vela connects a passing thought to a next step, a focused start and a moment to look back. Each week shapes the next.")}</p></div>
        <ol className={styles.loop} aria-label={t("The Vela loop")}>
          {loopSteps.map(([title, text, tools], index) => <li key={title} style={{ "--step": index } as CSSProperties}><span className={styles.loopNode} aria-hidden="true">0{index + 1}</span><strong>{t(title)}</strong><p>{t(text)}</p><small>{t(tools)}</small></li>)}
        </ol>
        <p className={styles.loopReturn}><svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path d="M1000 0C1000 70 985 88 910 88H90C15 88 0 70 0 8" /><path d="M-9 22 0 4 9 22" /></svg><span>↺ {t("Each week shapes the next.")}</span></p>
      </section>
      <section className={styles.insideSection} id="inside" aria-labelledby="inside-title">
        <div className={styles.sectionHead}><p className={styles.eyebrow}>{t("04 / Big ideas. Small beginnings.")}</p><h2 id="inside-title">{t("For the life")}<br /><em>{t("you’re building.")}</em></h2><p>{t("A good idea deserves a next step.")}<br />{t("And progress deserves a little perspective.")}</p></div>
        <div className={styles.featureGallery}>
          <article className={styles.ideaFeature}><div><span>{t("CAPTURE → REVISIT")}</span><h3>{t("Let good ideas")}<br /><em>{t("find you again.")}</em></h3><p>{t("Save ideas by voice, photo or link, add notes and a board, and revisit them over time. Turn one into a goal when you’re ready to act.")}</p></div><Phone file="ideas-revisit" alt={t("Vela 2.0 Ideas interface illustration: a saved weekend idea resurfaced for another look")} /></article>
          <article className={styles.goalFeature}><div><span>{t("GOALS → NEXT STEPS")}</span><h3>{t("Give your someday")}<br /><em>{t("a starting point.")}</em></h3><p>{t("Break a goal into milestones and tasks. Consider its six-month impact, choose a useful next step and give it a place in today’s plan.")}</p></div><Phone file="goal-impact" alt={t("Vela 2.0 goal interface illustration showing impact choices and the next steps")} /></article>
          <article className={styles.habitFeature}><div><span>{t("RHYTHM → MOMENTUM")}</span><h3>{t("A little counts.")}<br /><em>{t("Keep it going.")}</em></h3><p>{t("Habits that fit your rhythm. A year that fills with what you did, without a streak to protect.")}</p></div><Phone file="habit-year" alt={t("Vela 2.0 habit interface illustration with a year of recorded activity")} /></article>
        </div>
        <p className={styles.disclosure}>{t("Vela 2.0 interface illustrations, based on the app’s current design.")}</p>
        <div className={styles.growNote}><span aria-hidden="true">✦</span><p>{t("And a little space for yourself.")}<strong>{t("Journal. Check in. Give thanks. Learn a language.")}</strong></p><a href="#vela-film" aria-label={t("Explore Vela in the film")}><Arrow /></a></div>
        <div className={styles.explorerHead} id="everything"><p className={styles.eyebrow}>{t("05 / Everything inside")}</p><h2>{t("Small tools.")}<br /><em>{t("One calm place.")}</em></h2><p>{t("Six areas, one app.")}<br />{t("Choose one to see what’s inside.")}</p></div>
        <VelaExplorer locale={locale} />
        <ProductGallery locale={locale} name="Vela" title={t("A little more of your every day.")} images={[
          { src: `${IMAGE}campaign-01.webp`, label: t("Just say it"), alt: t("Vela campaign artwork: one spoken sentence becomes four changes to review") },
          { src: `${IMAGE}campaign-03.webp`, label: t("Tasks + calendar"), alt: t("Vela campaign artwork: tasks and calendar events shown together") },
          { src: `${IMAGE}campaign-05.webp`, label: t("Ideas return"), alt: t("Vela campaign artwork: an idea returns in the Revisit deck") },
          { src: `${IMAGE}campaign-07.webp`, label: t("Your rhythm"), alt: t("Vela campaign artwork: habits and a year of activity") },
          { src: `${IMAGE}campaign-09.webp`, label: t("At a glance"), alt: t("Vela campaign artwork: a focus session on the iPhone Lock Screen") },
        ]} disclosure={t("Vela 2.0 campaign artwork · Interface illustrations based on the current app design.")} />
        <AppUpdatesInline locale={locale} app="vela" />
      </section>

      <section className={styles.peopleSection} aria-labelledby="people-title">
        <div className={styles.peopleHead}><p className={styles.eyebrow}>{t("Made for real days")}</p><h2 id="people-title">{t("Which one")}<br /><em>{t("sounds like you?")}</em></h2></div>
        <ul className={styles.people}>{people.map(([glyph, name, wish, tools]) => <li key={name}><span aria-hidden="true">{glyph}</span><h3>{t(name)}</h3><p>{t(wish)}</p><small>{t(tools)}</small></li>)}</ul>
      </section>

      <section className={styles.trustSection} aria-labelledby="trust-title">
        <div className={styles.trustHead}><p className={styles.eyebrow}>{t("06 / Your day, your call")}</p><h2 id="trust-title">{t("Helpful.")}<br /><em>{t("On your terms.")}</em></h2></div>
        <ul className={styles.trust}>{trust.map(([glyph, title, text]) => <li key={title}><span aria-hidden="true">{glyph}</span><h3>{t(title)}</h3><p>{t(text)}</p></li>)}</ul>
        <p className={styles.finePrint}>{t("Saved recordings and photos can sync to your account, and Apple’s speech recognition may process audio on Apple’s servers. AI requests can include relevant text and, if you connect a calendar, today’s event titles and start times.")} <a href="https://vela-productivity.vercel.app/privacy">{t("Read the app privacy policy")}</a></p>
      </section>

      <section className={styles.filmSection} id="vela-film" aria-labelledby="film-title">
        <div className={styles.filmCopy}><p className={styles.eyebrow}>{t("A closer look")}</p><h2 id="film-title">{t("Meet your")}<br /><em>{t("everyday companion.")}</em></h2><p>{t("One sentence becomes a plan. A small step becomes a little momentum. See Vela 2.0 in motion.")}</p><span>{t("30 seconds · Meet Vela 2.0")}</span></div>
        <div className={styles.portraitFilm}><ProductFilm locale={locale} src="/videos/vela/meet-vela.mp4" captions="/videos/vela/meet-vela.en.vtt" poster={`${IMAGE}preview-poster.webp`} title={t("Meet Vela 2.0")} ratio="886 / 1920" caption={t("Vela 2.0 · A film built from the app’s interface.")} transcript={t("A busy mind becomes a spoken request, then four changes to review and add. Your Top 3 makes the next step clear. One tap starts Focus, and Vela pauses distracting apps. The closing line is: Plan, focus, and grow with Vela. Vela requires a Vela Pro subscription.")} /></div>
      </section>

      <section className={styles.proSection} id="pro" aria-labelledby="pro-title">
        <div className={styles.pro}>
          <div><p className={styles.eyebrow}>Vela Pro</p><h2 id="pro-title">{t("One membership.")}<br /><em>{t("All of Vela.")}</em></h2><p>{t("Vela Pro opens the whole app, with weekly, monthly and annual plans. Eligible annual subscribers can start with a seven-day trial.")}</p><StoreLink locale={locale} /></div>
          <div><ul className={styles.plans} aria-label={t("Vela Pro plans")}><li>{t("Weekly")}</li><li>{t("Monthly")}</li><li>{t("Annual")}<span>{t("7-day trial if eligible")}</span></li></ul><p className={styles.proNote}>{t("Your local price, renewal terms and trial eligibility are shown in the App Store before you subscribe. Manage or cancel in your App Store account.")}</p></div>
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="vela-faq-title"><div><p className={styles.eyebrow}>{t("A few useful things")}</p><h2 id="vela-faq-title">{t("Good to")}<br /><em>{t("know.")}</em></h2></div><FaqAccordion items={questions} className={styles.faq} /></section>
      <section className={styles.updates}><AppUpdatesForm app="vela" id="updates" /></section>
    </main>
    <footer className={styles.footer}><a href="#top" className={styles.brand}><Image src={`${IMAGE}icon.webp`} width={30} height={30} alt="" />{t("vela")}</a><p>{t("A little more intention in your every day.")}</p><nav aria-label={t("Vela footer")}><a href="https://vela-productivity.vercel.app/privacy">{t("App privacy")}</a><a href="https://vela-productivity.vercel.app/terms">{t("Terms")}</a><a href="https://vela-productivity.vercel.app/support">{t("Support")}</a><Link href={localePath("/", locale)}>{t("Made by Daryan ↗").replace(" ↗", "")} <span data-link-arrow="diagonal" aria-hidden="true">↗</span></Link></nav><span>© {new Date().getFullYear()}{" "}{t("Vela")}</span></footer>
  </ProductMotion>;
}
