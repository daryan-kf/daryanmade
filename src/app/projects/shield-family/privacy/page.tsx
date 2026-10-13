import type { Metadata } from "next";
import Link from "next/link";
import { ShieldFlowShell } from "@/components/shield-flow";
import styles from "@/components/shield-flow.module.css";

export const metadata: Metadata = { title: "Offer privacy | Shield Family", description: "How the Shield Family offer uses your email, verification and code-delivery records.", referrer: "no-referrer" };

export default function ShieldOfferPrivacyPage() {
  return <ShieldFlowShell article eyebrow="Shield Family · Offer privacy" title={<>Your email.<br /><em>A clear purpose.</em></>} intro="This notice covers the Shield Family offer, email confirmation and code-delivery pages within daryanmade. The app has its own separate privacy policy.">
    <article className={styles.article}>
      <section><h2>Who to contact</h2><p>Daryan Kamalifar / Sarpoli operates this offer flow. Questions about your information can be sent to <a href="mailto:info@sarpoli.com">info@sarpoli.com</a>.</p></section>
      <section><h2>Information used for the offer</h2><ul><li>Your email address, the subscription plan you select, and the time you accept the offer details.</li><li>Verification status and the offer code assigned to your confirmed request.</li><li>Delivery records for the confirmation and code emails, including information needed to process or troubleshoot delivery.</li><li>Short-lived, hashed IP information used to limit repeated requests and protect the offer flow from abuse.</li></ul></section>
      <section><h2>Why we use it</h2><p>We use these records to confirm your email, manage code allocation for the selected plan, deliver the requested emails, and help resolve problems with the offer. Confirming your email does not start an Apple subscription.</p><p>Apple separately checks eligibility and presents the subscription’s price, renewal date and terms when you redeem a code.</p></section>
      <section><h2>The services involved</h2><p><strong>Convex</strong> handles the offer’s verification, assigned-code and delivery records. <strong>Resend</strong> delivers the transactional emails. Information needed to send an email, including its recipient and message content, is processed by the email service.</p></section>
      <section><h2>Emails you request</h2><p>The flow sends an email with a confirmation link and a copy of the assigned code after confirmation. It does not automatically sign you up for a newsletter or an ongoing marketing sequence.</p></section>
      <section><h2>Your records and requests</h2><p>Verification links and request limits expire. Offer and delivery records support code allocation, email processing and troubleshooting.</p><p>Contact <a href="mailto:info@sarpoli.com">info@sarpoli.com</a> to ask what information we hold, correct your details, or request erasure. Include the email address used for your request so we can locate the relevant records.</p></section>
      <section><h2>The app is separate</h2><p>This offer notice does not replace <a href="https://daryan-kf.github.io/kidshield-legal/privacy.html">Shield Family’s app privacy policy</a>. The app policy explains the app’s own data practices; Apple’s terms apply to its account, billing and redemption services.</p><p><Link href="/projects/shield-family">Return to Shield Family</Link> or <Link href="/projects/shield-family/redeem">read the redemption guide</Link>.</p></section>
    </article>
  </ShieldFlowShell>;
}
