export type Locale = "en" | "da";

/** English keeps the existing URLs; Danish has an explicit, shareable URL. */
export function stripLocale(path: string) {
  return path.replace(/^\/(?:da|en)(?=\/|#|\?|$)/, "") || "/";
}

export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const clean = stripLocale(path);
  if (locale === "da") return `/da${clean === "/" ? "" : clean.replace(/^\/(?=[?#])/, "")}`;
  return clean.startsWith("#") || clean.startsWith("?") ? `/${clean}` : clean;
}

export function languageAlternates(path: string) {
  return { canonical: path, languages: { en: localePath(path, "en"), da: localePath(path, "da"), "x-default": localePath(path, "en") } };
}
