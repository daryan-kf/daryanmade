import type { Locale } from "./i18n";

/** Independently written lines, composed for the same three-line sculpture. */
export function studioGreeting(locale: Locale) {
  return locale === "da"
    ? ["En skæv idé.", "Hvad nu hvis?", "Lad os prøve."]
    : ["A small spark.", "A wild idea.", "Something real."];
}
