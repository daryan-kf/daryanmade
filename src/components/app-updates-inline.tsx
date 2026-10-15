import type { CSSProperties } from "react";
import { localizedAppUpdates, type UpdateApp } from "@/lib/app-updates";
import { AppUpdatesForm } from "./app-updates-form";
import styles from "./app-updates.module.css";

import type { Locale } from "@/lib/i18n";

export function AppUpdatesInline({ app, locale = "en" }: { app: UpdateApp; locale?: Locale }) {
  const product = localizedAppUpdates(app, locale);

  return <details className={styles.inline} data-updates-inline={app} style={{ "--updates-default-accent": product.accent, "--updates-default-paper": product.paper, "--updates-default-ink": product.ink } as CSSProperties}>
    <summary className={styles.inlineSummary}>
      <span>{locale === "da" ? `Få nyheder fra ${product.name}` : `Get ${product.name} updates`}</span>
      <span className={styles.inlineMark} aria-hidden="true">+</span>
    </summary>
    <div className={styles.inlineContent}>
      <AppUpdatesForm app={app} id="story-updates" variant="compact" />
    </div>
  </details>;
}
