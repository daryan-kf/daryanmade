import type { SVGProps } from "react";

export function Arrow({ diagonal = false, ...props }: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>{diagonal ? <path d="M5 19 19 5M5 5h14v14" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}</svg>;
}

export function MakerMark(props: SVGProps<SVGSVGElement>) {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}><path d="M20 3v34M3 20h34M8 8l24 24M8 32 32 8" stroke="currentColor" strokeWidth="5" /><circle cx="20" cy="20" r="6" fill="currentColor" /></svg>;
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}><path d="m5 12 4 4L19 6" /></svg>;
}
