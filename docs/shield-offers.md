# Shield Family offer operations

The portfolio owns this flow. No request goes to the former Shield website or its database.

## Request and delivery

1. The parent chooses a plan, enters an email and accepts the offer details.
2. Next.js validates the request and calls the authenticated Convex HTTP endpoint. Only a server-held shared secret can access that endpoint.
3. Convex stores a pending record in `shieldFamilyEmails` and schedules a Resend confirmation email. No code is allocated yet.
4. A signed, 24-hour link opens `/projects/shield-family/verify`. The token is in the URL fragment, removed from browser history and retained only in memory. The page requires a deliberate confirmation button press. Refreshing that page requires reopening the email link.
5. One transaction verifies the email, assigns an unexpired code, increments the campaign allocation and queues the code email. Repeated clicks return the same code. All plans share the campaign capacity.
6. Resend receives a stable idempotency key for each email job. Failed jobs retry with backoff, up to eight attempts. Delivery records mean the provider accepted the email, not proof it reached an inbox.

The page also displays the code and Apple's redemption link. Apple handles eligibility, subscription confirmation and billing.

## Environments

Vercel needs `NEXT_PUBLIC_SITE_URL`, `CONVEX_SITE_URL` (production `.convex.site` HTTP origin) and `SHIELD_API_SECRET`. Convex needs the same `SHIELD_API_SECRET`, an independent `SHIELD_TOKEN_SECRET`, `RESEND_API_KEY`, `SHIELD_EMAIL_FROM`, `SHIELD_EMAIL_REPLY_TO`, `SHIELD_EMAIL_SENDER_VERIFIED=true` and `SHIELD_SITE_URL`. Use random secrets of at least 32 characters. Never use a `NEXT_PUBLIC_` prefix for secrets.

The sender is `Shield Family <kidshield@daryanmade.com>`. Resend must show the domain as verified. This configures outbound sending; replies go to the existing support address, `info@sarpoli.com`. Creating a sender does not provision an incoming mailbox.

While domain DNS is being connected, use the working production Vercel origin for both site URL settings so confirmation links open correctly. Switch both to `https://daryanmade.com` after HTTPS works, then redeploy Next.js. Old signed links remain valid because signatures are independent of the hostname.

Environment files, filled credentials and offer-code inventories must remain outside Git. The public `.env.example` contains names and empty placeholders only. Keep development and production inventories separate.

## Initial inventory and activation

Keep the old campaign paused when migrating unissued codes. Never operate two allocators against the same code batch.

Import only unused, unexpired Apple codes through `shieldOffers:importUnusedCodes`, using authenticated Convex admin tooling. The internal function accepts a plan (`annual`, `quarterly`, `monthly`), a batch label and at most 500 entries with `code`, `redeemUrl` and millisecond `expiresAt`. It validates the Apple URL and matching code and makes identical repeated imports harmless. Conflicting metadata is rejected. Do not paste inventories into issues, pull requests or terminal logs.

Use `shieldOffers:configureCampaign` to set `active`, `maxClaims` (maximum 500 total) and `endsAt` in milliseconds. Configure an inactive campaign first. Activate only after the sender, working public URL and unissued inventory are ready. The initial campaign closes on 24 December 2026 at 23:59:59 UTC; imported codes expire at the timestamps supplied by Apple. No test should consume a production code.

```sh
npx convex deploy --yes
npx convex run --prod shieldOffers:inventory
```

`inventory` exposes counts through admin tooling, never a public query. All data functions are internal. New confirmation requests stop when the campaign closes, the selected plan is exhausted or total capacity is reached. Already issued codes remain accessible through their unexpired confirmation links. Support can help when a new link is unavailable.

## Operations and privacy

Inspect `shieldFamilyEmailJobs` for failed deliveries and `shieldFamilyCampaigns` for capacity in the authenticated Convex dashboard. Never publish dashboard exports containing emails or codes. Requests are rate-limited by email and a server-keyed IP hash; stale limiter rows are removed by the scheduled cleanup. Verification links expire after 24 hours. Signup and allocation records are retained for offer support; handle correction and erasure requests through the published support address, including related verification and job records.

No newsletter consent is inferred from requesting a code. A separate explicit opt-in is required before adding marketing. Do not claim a successful Apple redemption based on email confirmation or code assignment.

## Adding another project

Reuse this Convex project and the verified `daryanmade.com` sender domain. Add separate project tables, for example `velaEmails`, plus any project-specific verification and delivery tables. Give each project its own sender local part, consent text, API route and policy. Keep email lists and code inventories separate. The shared domain does not authorize cross-project marketing or a combined mailing list.

## Verification

`npm run test:backend` uses in-memory Convex and a mocked Resend provider. It checks allocation, concurrency, capacity, signed-link authentication, expiry, retries and delivery idempotency. Browser tests mock API responses for form and confirmation interactions. These checks do not redeem an Apple subscription or guarantee inbox delivery.
