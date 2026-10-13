import type { Metadata } from "next";
import Link from "next/link";
import { AppleIcon } from "@/components/icons";
import { ShieldFlowShell, SHIELD_APP_STORE } from "@/components/shield-flow";
import styles from "@/components/shield-flow.module.css";

export const metadata: Metadata = { title: "Redeem your offer | Shield Family", description: "Use your Shield Family code with Apple, review the renewal terms and manage your subscription.", referrer: "no-referrer" };

export default function ShieldRedemptionPage() {
  return <ShieldFlowShell article eyebrow="Shield Family · Redemption guide" title={<>Your code.<br /><em>Apple takes it from here.</em></>} intro="Use the parent’s Apple Account to redeem your unique code. Apple checks eligibility and shows the full offer before you confirm.">
    <article className={styles.article}>
      <aside className={styles.notice}><p><strong>A code is an invitation, not an activated subscription.</strong> Confirming your email and receiving a code do not start a subscription or charge you. The offer starts only after successful redemption with Apple.</p></aside>
      <section><ol className={styles.steps}>
        <li><h2>Confirm your email and open your code</h2><p>Open the private link in your confirmation email, then press <strong>Confirm my email</strong>. When your code appears, choose <strong>Redeem with Apple</strong> on the parent’s iPhone or iPad.</p><p>On a computer? Open the confirmation or code email on the device you want to use. Keep your private link and code to yourself.</p></li>
        <li><h2>Check the account and the complete offer</h2><p>Use the parent’s Apple Account. Before confirming, check Shield Family’s name, the free period, the selected plan, the exact local renewal price and the renewal date.</p><p>Redeem before the code expires. Eligibility, availability and Apple’s displayed terms apply. The offer cannot be combined with the app’s introductory trial. If something differs from what you expected, stop before confirming and <a href="mailto:info@sarpoli.com">ask us for help</a>.</p></li>
        <li><h2>Confirm with Apple, then open Shield</h2><p>Follow Apple’s instructions to finish redemption. Open Shield Family and connect your family. If the app does not recognize the plan, use <strong>Restore purchases</strong> with the same Apple Account.</p></li>
      </ol></section>
      <section><h2>What renews after the free period?</h2><p>Check Apple’s confirmation screen for the exact local amount and date before you agree. After three calendar months free:</p><dl className={styles.planList}><div><dt>Yearly</dt><dd>The full annual price is charged for the following year, then each year unless cancelled. It is not a prorated nine-month charge.</dd></div><div><dt>Every three months</dt><dd>The full three-month price is charged, then every three months unless cancelled.</dd></div><div><dt>Monthly</dt><dd>The monthly price is charged, then each month unless cancelled.</dd></div></dl></section>
      <section><h2>Enter a code manually</h2><p>If the direct redemption link does not open, use the App Store on your iPhone or iPad:</p><ol><li>Tap your account picture or initials in the App Store.</li><li>Choose <strong>Redeem Code</strong>. Older versions may say <strong>Redeem Gift Card or Code</strong>.</li><li>Choose <strong>Enter Code Manually</strong>, paste your unique Shield code, and follow Apple’s instructions.</li><li>Review the free period, selected plan and renewal price before confirming.</li></ol><p><a href="https://support.apple.com/en-us/118242">Apple’s instructions for finding the code-redemption menu</a>. A Shield subscription offer code does not add gift-card credit to your Apple Account.</p></section>
      <section id="cancel"><h2>Your choice to keep it.</h2><p>To cancel, open <strong>Settings → your name → Subscriptions → Shield Family → Cancel Subscription</strong>. For a free period you do not want to renew, cancel at least <strong>24 hours before it ends</strong>.</p><p>Deleting the app or deleting our emails does not cancel an Apple subscription. Check the cancellation and access details Apple shows.</p><p><a href="https://support.apple.com/en-us/118428">Read Apple’s cancellation instructions</a>.</p></section>
      <section><h2>If the code does not work</h2><p>Apple may reject an expired, already used or ineligible code. Check the Apple Account and the message on the screen. Do not start an unintended purchase to work around a code problem.</p><p><a href="mailto:info@sarpoli.com">Contact info@sarpoli.com</a> for offer help. For a fresh confirmation link, return to <Link href="/projects/shield-family#offer">the Shield Family offer</Link>.</p></section>
      <div className={styles.actionLinks}><a href={SHIELD_APP_STORE} className={styles.button}><AppleIcon />Open Shield on the App Store</a><Link href="/projects/shield-family" className={styles.quietLink}>Back to Shield Family</Link></div>
    </article>
  </ShieldFlowShell>;
}
