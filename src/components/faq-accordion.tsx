"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./faq-accordion.module.css";

export type FaqItem = { question: string; answer: ReactNode };
export type FaqAccordionProps = {
  items: FaqItem[];
  className?: string;
  /** The initially expanded item. Pass null to start with everything closed. */
  defaultOpen?: number | null;
};

function FaqRow({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const id = useId();
  const answerRef = useRef<HTMLDivElement>(null);
  const [answerHeight, setAnswerHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const answer = answerRef.current;
    if (!answer) return;
    const measure = () => setAnswerHeight(answer.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(answer);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.item} data-open={open}>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.trigger}
          id={`${id}-question`}
          aria-expanded={open}
          aria-controls={`${id}-answer`}
          data-faq-trigger
          onClick={onToggle}
        >
          <span>{item.question}</span>
          <span className={styles.indicator} aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
        </button>
      </h3>
      <div
        id={`${id}-answer`}
        className={styles.panel}
        role="region"
        aria-labelledby={`${id}-question`}
        aria-hidden={!open}
        inert={!open}
        style={{ height: open ? answerHeight ?? "auto" : 0 }}
      >
        <div ref={answerRef} className={styles.answer}>{item.answer}</div>
      </div>
    </div>
  );
}

export function FaqAccordion({ items, className, defaultOpen = 0 }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  function navigateQuestions(event: KeyboardEvent<HTMLDivElement>) {
    if (!(event.target instanceof HTMLButtonElement) || !event.target.hasAttribute("data-faq-trigger")) return;
    const questions = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]"));
    const current = questions.indexOf(event.target);
    const target = event.key === "Home" ? 0 : event.key === "End" ? questions.length - 1 : event.key === "ArrowDown" ? (current + 1) % questions.length : event.key === "ArrowUp" ? (current - 1 + questions.length) % questions.length : null;
    if (target === null) return;
    event.preventDefault();
    questions[target]?.focus();
  }

  return (
    <div className={[styles.accordion, className].filter(Boolean).join(" ")} onKeyDown={navigateQuestions}>
      {items.map((item, index) => <FaqRow key={item.question} item={item} open={openIndex === index} onToggle={() => {
        window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: openIndex === index ? "close" : "open" } }));
        setOpenIndex((current) => current === index ? null : index);
      }} />)}
    </div>
  );
}
