import type { Locale } from "./i18n";

/** The knot untangles into these words: what ideas are like, and what I do with them. */
export function studioGreeting(locale: Locale) {
  return locale === "da"
    ? ["Idéer starter i knude.", "Jeg løser dem op."]
    : ["Ideas start tangled.", "I untangle them."];
}
