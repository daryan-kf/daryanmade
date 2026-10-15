export function updatesUnavailable() {
  return { status: 503, body: { ok: false, error: "Email updates are temporarily unavailable. Please try again later." } };
}

/** A deployment or server-auth failure is a service problem, not a visitor error. */
export async function appUpdateResponse(action: string, response: Response) {
  if ([401, 403, 404, 405].includes(response.status) || response.status >= 500) return updatesUnavailable();
  let value: unknown;
  try { value = await response.json(); } catch { return updatesUnavailable(); }
  if (!value || typeof value !== "object") return updatesUnavailable();
  const data = value as Record<string, unknown>;
  if (!response.ok) {
    if (![400, 410, 413, 415, 429].includes(response.status) || data.ok !== false || typeof data.error !== "string" || !data.error.trim() || data.error.length > 500) return updatesUnavailable();
    return { status: response.status, body: { ok: false, error: data.error } };
  }
  if (data.ok !== true) return updatesUnavailable();
  if (action === "signup") return { status: 200, body: { ok: true, message: "If confirmation is needed, a link has been requested. Check your inbox and spam folder." } };
  const expected = action === "verify" ? "confirmed" : action === "unsubscribe" ? "unsubscribed" : null;
  if (!expected || data.status !== expected) return updatesUnavailable();
  return { status: 200, body: { ok: true, status: expected } };
}
