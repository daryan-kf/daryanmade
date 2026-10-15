import type { SVGProps } from "react";

// Three strands of the same continuous curve, with space at each undercrossing.
// Keep app/icon.svg in sync; social previews import this path directly.
export const MAKER_MARK_PATH = "M17.40 26.47C15.96 25.04 14.73 23.37 13.80 21.58C12.87 19.79 12.24 17.89 11.95 16.04C11.65 14.19 11.70 12.38 12.05 10.78C12.41 9.18 13.07 7.79 13.95 6.72C14.82 5.66 15.92 4.92 17.10 4.58C18.28 4.25 19.55 4.31 20.75 4.77C21.95 5.23 23.09 6.09 24.03 7.27C24.97 8.46 25.71 9.97 26.16 11.69M26.04 20.52C25.52 22.48 24.69 24.38 23.60 26.08C22.52 27.78 21.19 29.28 19.73 30.46C18.27 31.64 16.69 32.50 15.12 32.99C13.56 33.49 12.02 33.61 10.66 33.38C9.30 33.15 8.12 32.57 7.23 31.72C6.35 30.86 5.77 29.74 5.57 28.46C5.37 27.19 5.54 25.78 6.10 24.37C6.65 22.96 7.59 21.57 8.85 20.32M16.57 16.01C18.52 15.48 20.58 15.25 22.60 15.34C24.61 15.43 26.57 15.83 28.32 16.50C30.07 17.18 31.61 18.12 32.82 19.23C34.03 20.33 34.91 21.60 35.39 22.90C35.88 24.19 35.96 25.51 35.66 26.70C35.37 27.89 34.68 28.95 33.68 29.76C32.68 30.58 31.37 31.13 29.87 31.35C28.37 31.58 26.69 31.46 24.98 30.99";

export function Arrow({ diagonal = false, ...props }: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" data-link-arrow={diagonal ? "diagonal" : "right"} {...props}>{diagonal ? <path d="M5 19 19 5M5 5h14v14" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}</svg>;
}

export function MakerMark(props: SVGProps<SVGSVGElement>) {
  return <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}><path d={MAKER_MARK_PATH} stroke="currentColor" strokeWidth="4.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}><path d="m5 12 4 4L19 6" /></svg>;
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.224 24 24 23.227 24 22.271V1.729C24 .774 23.224 0 22.225 0Z" /></svg>;
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M16.9 2.2c.1 1.2-.4 2.4-1.1 3.2-.8.9-1.9 1.4-3 1.3-.1-1.2.4-2.3 1.1-3.1.8-.8 1.9-1.3 3-1.4ZM20.4 17.3c-.5 1.1-.8 1.6-1.5 2.6-.9 1.4-2.1 3.1-3.6 3.1-1.3 0-1.7-.9-3.4-.9s-2.2.9-3.5.9c-1.5 0-2.6-1.5-3.5-2.9C2.4 16.1 2.2 11 3.8 8.5c1.2-1.8 3-2.8 4.7-2.8 1.5 0 2.4.9 3.6.9 1.1 0 1.8-.9 3.6-.9 1.4 0 2.9.8 4 2.1-3.5 1.9-2.9 6.9.7 8.5Z" /></svg>;
}
