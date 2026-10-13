import type { Metadata } from "next";
import { ShieldFlowShell } from "@/components/shield-flow";
import { ShieldVerification } from "@/components/shield-verification";

export const metadata: Metadata = {
  title: "Confirm your email | Shield Family",
  description: "Confirm your email to request your unique Shield Family offer code.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function ShieldVerifyPage() {
  return <ShieldFlowShell eyebrow="Shield Family · Email confirmation" title={<>Confirm your <em>email.</em></>} intro="One intentional step before your family’s offer code is ready."><ShieldVerification /></ShieldFlowShell>;
}
