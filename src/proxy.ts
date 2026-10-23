import { NextResponse, type NextRequest } from "next/server";

/** Explicit Danish URLs; keep established English URLs without a visible prefix. */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Older preview clients probe webpack-hot-middleware's EventSource URL.
  // This Next version uses /_next/hmr (WebSocket). HTTP 204 tells the legacy
  // EventSource to stop reconnecting instead of rendering a localized 404.
  if (process.env.NODE_ENV === "development" && /^(?:\/(?:en|da))?\/__webpack_hmr\/?$/.test(path)) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  if (path === "/en" || path.startsWith("/en/")) {
    // Rewritten requests can pass this boundary again. Let the internal English
    // route render; metadata always points to the established public URL.
    return NextResponse.next();
  }
  // Existing social image URLs remain valid after the route consolidation.
  const image = /^(?:\/(da))?(?:\/(vela|iqra)|\/projects\/([^/]+))?\/opengraph-image$/.exec(path);
  if (image) {
    const url = request.nextUrl.clone(); url.pathname = `/og/${image[1] ? "da" : "en"}/${image[2] || image[3] || "home"}`;
    return NextResponse.rewrite(url);
  }
  if (path === "/da" || path.startsWith("/da/")) return NextResponse.next();
  const url = request.nextUrl.clone(); url.pathname = `/en${path === "/" ? "" : path}`;
  return NextResponse.rewrite(url);
}
export const config = { matcher: ["/((?!api(?:/|$)|_next(?:/|$)|__nextjs(?:_|/|$)|og(?:/|$)|images(?:/|$)|videos(?:/|$)|fonts(?:/|$)|.*\\.[^/]+$).*)"] };
