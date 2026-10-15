import { describe, expect, it } from "vitest";
import { appUpdateResponse } from "../../src/lib/app-updates-response";

describe("app updates public API responses", () => {
  it.each([401, 403, 404, 405, 500, 502, 503])("maps backend status %s to a truthful unavailable response", async status => {
    const result = await appUpdateResponse("signup", Response.json({ ok: false, error: "Internal deployment details" }, { status }));
    expect(result.status).toBe(503);
    expect(result.body).toEqual({ ok: false, error: "Email updates are temporarily unavailable. Please try again later." });
  });
  it.each([400, 410, 413, 415, 429])("preserves actionable visitor errors (%s)", async status => {
    expect(await appUpdateResponse("verify", Response.json({ ok: false, error: "Please use a fresh confirmation link." }, { status }))).toEqual({ status, body: { ok: false, error: "Please use a fresh confirmation link." } });
  });
  it("rejects malformed or contradictory success instead of claiming a subscription", async () => {
    for (const body of [{ ok: false }, { ok: true }, { ok: true, status: "unsubscribed" }, null]) {
      expect((await appUpdateResponse("verify", Response.json(body))).status).toBe(503);
    }
    expect((await appUpdateResponse("signup", new Response("not JSON"))).status).toBe(503);
  });
  it("returns only the expected public success shape", async () => {
    expect(await appUpdateResponse("verify", Response.json({ ok: true, status: "confirmed", internalId: "private" }))).toEqual({ status: 200, body: { ok: true, status: "confirmed" } });
    expect(await appUpdateResponse("unsubscribe", Response.json({ ok: true, status: "unsubscribed" }))).toEqual({ status: 200, body: { ok: true, status: "unsubscribed" } });
    expect((await appUpdateResponse("signup", Response.json({ ok: true, internalId: "private" }))).body).not.toHaveProperty("internalId");
  });
});
