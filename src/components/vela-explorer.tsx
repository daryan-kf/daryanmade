"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { appCopy } from "@/lib/app-site-copy";
import styles from "./vela-explorer.module.css";

type Area = { id: string; name: string; screen: string; alt: string; features: [string, string][] };

/** Every current Vela area from the October 2026 product audit; wording stays inside its claim limits. */
const areas: Area[] = [
  { id: "plan", name: "Plan", screen: "plan-calendar-top", alt: "Vela 2.0 Plan interface illustration: Top 3 above the day’s schedule", features: [
    ["Today", "One screen for the next thing: Focus, Talk to Vela, your Top 3, the day’s list and Up next."],
    ["Three views of one day", "See tasks, meetings and habits as a list, a schedule with a now line or an hour grid."],
    ["Top 3, not a backlog", "Choose up to three priorities across tasks, habits, goals and meetings, in your own order."],
    ["Your calendar beside your tasks", "Connect your device calendar and choose which calendars appear in your plan."],
    ["Type it the way you’d say it", "Write “call Mum tomorrow at 6” and the day and time fill themselves in."],
    ["Repeats and saved tasks", "Repeat daily, on chosen weekdays or monthly, or keep your usual tasks ready for any day."],
  ] },
  { id: "focus", name: "Focus", screen: "focus-session", alt: "Vela 2.0 Focus interface illustration: a running session linked to a task", features: [
    ["Focus in one tap", "Start your saved timer from Today, or run an open-ended session that counts up."],
    ["Pause the apps you choose", "Select apps with Apple Screen Time and pause them while you focus."],
    ["Daily limits and blocked hours", "Give chosen apps a daily allowance and blocked hours, with a gentle or locked limit."],
    ["Focus on one task", "Attach a task to the session and finish it without leaving the timer."],
    ["Breaks when you need them", "Pause, take a break or add a little more time when a stretch ends."],
    ["On your Lock Screen", "A Live Activity keeps the session in view on the Lock Screen and Dynamic Island."],
  ] },
  { id: "build", name: "Build", screen: "ideas-revisit", alt: "Vela 2.0 Ideas interface illustration: a saved idea returns in the Revisit deck", features: [
    ["Ideas that come back", "Capture by voice, text, photo, link or share. Ideas return after two days, a week and a month."],
    ["Idea boards", "Six prompts and up to twelve of your own photos help an idea find its first step."],
    ["Goals with a six-month view", "Rate how much a goal could change the next six months, then break it into milestones and tasks."],
    ["Habits without streaks", "Daily, on chosen days or any number of days a week, with a year that fills up as you go."],
    ["Your one thing", "Keep one goal in view for three or six months and give it a next step."],
    ["Voice notes, your way", "Record a thought, then keep the recording, the words or both."],
  ] },
  { id: "grow", name: "Grow", screen: "grow", alt: "Vela 2.0 Grow interface illustration: motivation, mood, gratitude, journal and focus", features: [
    ["A journal in any form", "Write, speak or scan a handwritten page. Scanned pages are read on your phone."],
    ["Mood check-ins", "Five faces, optional feelings and notes, and trends from the days you recorded."],
    ["Gratitude", "Keep a list of your good things and appreciate a few in a short daily round."],
    ["Your own words", "Keep words of encouragement and voice recordings close, pinned to Today."],
    ["Words that come back", "Review words and phrases after 1, 3, 7, 14 and 30 days, right inside your plan."],
    ["Progress that only grows", "Week and month charts for tasks, Top 3, habits, focus and mood."],
    ["A weekly review", "Six questions about your week, then choose next week’s steps."],
    ["Lists and reading shelves", "Packing, groceries and gifts, plus books you want, are reading and have finished."],
    ["A moment to breathe", "A one-, three- or five-minute breathing reset, or a short guided sit."],
  ] },
  { id: "talk", name: "Talk to Vela", screen: "talk-to-vela", alt: "Vela 2.0 Talk to Vela interface illustration: one sentence becomes changes with Undo", features: [
    ["Say or type what you want to change", "Add, move and finish tasks, manage goals, habits and ideas, or start Focus."],
    ["Ask about your day", "Supported questions and simple commands run right on your phone."],
    ["See every change", "Action cards show what Vela did, with Undo where it’s supported. Bigger actions ask first."],
    ["Many changes, one review", "Ask for three or more changes at once and Vela groups them for you to check."],
    ["From paper to plan", "Scan a handwritten list or a screenshot and review each line before anything is added."],
    ["AI that asks first", "Cloud features ask for your permission and show what’s shared. Say no, and the manual tools still work."],
  ] },
  { id: "everywhere", name: "Everywhere", screen: "today", alt: "Vela 2.0 Today interface illustration with Focus, Talk to Vela, Top 3 and the day's plan", features: [
    ["Eight widgets", "Today, Your words, Word of the day, Capture, Habits, Ideas, Mood and Gratitude."],
    ["Siri and Quick Actions", "Ask Siri to talk to Vela or record a note, or start from the app icon."],
    ["Share into Vela", "Send a link or up to ten images from another app straight into Ideas."],
    ["Offline first", "Your plan is saved on the device and syncs when you’re back online."],
    ["Optional app lock", "Face ID or Touch ID, with private details hidden in widgets and notifications."],
    ["Nine languages", "English, Spanish, Chinese, Hindi, French, Arabic, Portuguese, Persian and Danish."],
  ] },
];

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function VelaExplorer({ locale = "en" }: { locale?: Locale }) {
  const t = appCopy(locale);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { setEnhanced(true); }, []);

  // The pill follows the selected tab; it is measured, never guessed.
  useIsomorphicLayoutEffect(() => {
    const tab = tabs.current[active], rail = list.current;
    if (!tab || !rail) return;
    const place = () => {
      rail.style.setProperty("--pill-x", `${tab.offsetLeft}px`);
      rail.style.setProperty("--pill-w", `${tab.offsetWidth}px`);
    };
    place();
    const left = tab.offsetLeft - rail.scrollLeft, right = left + tab.offsetWidth;
    if (left < 0 || right > rail.clientWidth) rail.scrollTo({ left: tab.offsetLeft - 16, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    const observer = new ResizeObserver(place);
    observer.observe(rail);
    document.fonts?.ready.then(place);
    return () => observer.disconnect();
  }, [active, enhanced, locale]);

  function select(index: number, focus = false) {
    const next = (index + areas.length) % areas.length;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  }
  function keys(event: KeyboardEvent<HTMLButtonElement>) {
    const moves: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: areas.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key], true);
  }

  return <div className={styles.explorer} data-enhanced={enhanced || undefined}>
    <div ref={list} className={styles.tabs} role="tablist" aria-label={t("Areas of Vela")}>
      <span className={styles.pill} aria-hidden="true" />
      {areas.map((area, index) => <button key={area.id} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`vela-tab-${area.id}`} aria-controls={`vela-panel-${area.id}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={keys}>{t(area.name)}<span>{String(area.features.length).padStart(2, "0")}</span></button>)}
    </div>
    <div className={styles.body}>
      <div className={styles.phone} aria-hidden={enhanced ? undefined : true}>
        {areas.map((area, index) => <Image key={area.id} src={`/images/vela-site/${area.screen}.webp`} width={900} height={1951} sizes="(max-width: 760px) 46vw, 270px" alt={t(area.alt)} data-active={active === index || undefined} aria-hidden={active !== index || undefined} />)}
      </div>
      <div className={styles.panels}>
        {areas.map((area, index) => <div key={area.id} id={`vela-panel-${area.id}`} role={enhanced ? "tabpanel" : undefined} aria-labelledby={enhanced ? `vela-tab-${area.id}` : undefined} tabIndex={enhanced ? 0 : undefined} hidden={enhanced && active !== index} className={styles.panel} data-count={area.features.length}>
          <h3 className={styles.panelTitle}>{t(area.name)}</h3>
          <ul>{area.features.map(([title, text], item) => <li key={title} style={{ "--item": item } as CSSProperties}><span aria-hidden="true">{String(item + 1).padStart(2, "0")}</span><strong>{t(title)}</strong><p>{t(text)}</p></li>)}</ul>
        </div>)}
      </div>
    </div>
  </div>;
}
