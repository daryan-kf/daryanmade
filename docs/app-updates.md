# Independent app email updates

Vela, Iqra, and Shield Family have separate optional lists for app news and new features. Vela 2.0 is already available: its list is for product news and improvements, not a launch waitlist. Iqra and Shield Family also include future launch news. Wardrobe and external projects do not collect addresses. These lists do not create app accounts or paid subscriptions.

## Separate records and consent

| App | Audience | Verification | Delivery | Request limits |
| --- | --- | --- | --- | --- |
| Vela | `velaEmails` | `velaVerifications` | `velaEmailJobs` | `velaRateLimits` |
| Iqra | `iqraEmails` | `iqraVerifications` | `iqraEmailJobs` | `iqraRateLimits` |
| Shield Family updates | `shieldFamilyUpdateEmails` | `shieldFamilyUpdateVerifications` | `shieldFamilyUpdateEmailJobs` | `shieldFamilyUpdateRateLimits` |

The existing `shieldFamilyEmails` table belongs exclusively to the transactional offer. Its consent, inventory, allocation, and delivery flow remain separate. Never copy those recipients into an updates list or infer news consent from an offer request. Each list uses its own explicit consent version: `vela-product-news-2026-10-15`, `iqra-news-and-launches-2026-10-15`, or `shield-family-news-and-launches-2026-10-15`.

## Request lifecycle

1. A visitor enters an email and checks the app-specific consent box, which starts unchecked.
2. `/api/apps/{app}/signup` accepts only the allowlisted app names `vela`, `iqra`, and `shield-family`. The Next server bounds and validates the request, hashes its IP using an app-scoped HMAC, and calls an authenticated Convex endpoint.
3. A pending record, 24-hour verification, and delivery job are created together. No mailing-list subscriber is active yet. Repeated requests are deduplicated; existing subscribers receive the same public response without another confirmation email.
4. A signed link opens the app’s `/updates/verify` page. The token is removed from the URL fragment and kept only in memory. Opening a link does not subscribe anyone; the visitor presses the confirmation button. Refreshing requires reopening the email link.
5. The record becomes `subscribed` only after signature, app, purpose, generation, and expiry checks. Repeat confirmation is harmless.
6. The cancellation/unsubscribe link opens `/updates/unsubscribe` and also requires a deliberate button press. Unsubscribing increments the consent generation, so old confirmation links cannot resubscribe someone. Joining again requires a new request and confirmation.

The Shield update paths start at `/projects/shield-family/updates`; Vela and Iqra use `/vela/updates` and `/iqra/updates`. Each has a privacy notice. Unsubscribing from one list leaves all other lists and Shield offer records unchanged.

## English and Danish

The English marketing and preference URLs remain unchanged. Danish equivalents
use `/da`, including all confirmation, unsubscribe, privacy, and Shield offer
redemption pages. Forms submit an allowlisted `locale` (`en` or `da`); omitted
locale defaults to English. The server rejects unsupported locale values, and
origin checks, consent requirements, request limits, and token scope are unchanged.

Subscriber and verification records have optional locale fields, making the schema
compatible with existing records. Each new verification captures the requested
language independently. Confirming that link preserves the language associated
with its consent; later unconfirmed requests cannot rewrite the message for an
older link. Existing subscribers are still deduplicated within an app, regardless
of language. There is no separate Danish audience and no movement between apps.

Subjects, bodies, calls to action, and first-party links in Danish confirmation
emails use Danish. Delivery retries reuse the frozen message. Shield offer jobs
also capture their language so confirmation/code messages and redemption links
stay consistent without altering offer inventory or allocation behavior.

A language switch on an opened private link passes its token directly to the same
page in the other language, only during explicit navigation. The new page removes
the fragment again and still requires the confirmation button. Tokens are never
persisted in local storage, session storage, or history state. Refreshing without
a language switch still requires reopening the original email link.

This bilingual change is prepared locally; production email readiness and rollout
remain separate. Deploy the additive Convex schema/functions before the frontend.
Do not enable production signup until the existing sender/configuration checks
have been completed. Language support requires no new secrets and sends no email
by itself. Verification uses synthetic recipients and a mocked provider only.

## Sending and retries

This implementation sends confirmation emails only. It does not send a launch campaign, import an audience, or schedule recurring marketing. Future campaigns must select only `status: subscribed` from the specific app’s table, respect current consent and suppression immediately before delivery, and include a signed unsubscribe link for that app and consent generation.

Each job has a one-minute exclusive lease, an attempt number to reject stale worker completion, and a stable Resend idempotency key. Its full message is frozen before the first provider request and reused on retries. A two-minute cron retries eligible jobs with backoff, up to eight attempts. Expired or suppressed confirmations are not sent. A message already handed to the provider may still arrive after cancellation, but its invalidated confirmation cannot activate the list.

`sent` means the provider accepted the message, not proof of inbox delivery. Investigate `failed` jobs using their safe error code; never paste recipient records, message bodies, or private links into logs or issues.

## Configuration

Vercel needs the existing `CONVEX_SITE_URL` and a new server-only `APP_UPDATES_API_SECRET`. Convex needs the matching API secret, an independent `APP_UPDATES_TOKEN_SECRET`, `APP_UPDATES_SITE_URL`, and the existing `RESEND_API_KEY`. Both new secrets must contain at least 32 characters. Do not change existing `SHIELD_*` offer settings.

Configure each app independently in Convex:

- `VELA_EMAIL_FROM`, `VELA_EMAIL_REPLY_TO`, `VELA_EMAIL_SENDER_VERIFIED`
- `IQRA_EMAIL_FROM`, `IQRA_EMAIL_REPLY_TO`, `IQRA_EMAIL_SENDER_VERIFIED`
- `SHIELD_UPDATES_EMAIL_FROM`, `SHIELD_UPDATES_EMAIL_REPLY_TO`, `SHIELD_UPDATES_EMAIL_SENDER_VERIFIED`

Example identities are `Vela <vela@daryanmade.com>`, `Iqra <iqra@daryanmade.com>`, and `Shield Family <shield-updates@daryanmade.com>`. These can use the same verified Resend domain and API key; distinct local parts do not provision incoming mailboxes. Set reply-to to the support address. Set the app’s verified flag to `true` only after checking the sender domain. Signup fails with a useful 503 while delivery is unconfigured. Confirmation and unsubscribe continue to work without the Resend key as long as the API and signing secrets remain configured.

The public `.env.example` documents names only. Never commit filled secrets. Configuration and deployment are separate operational steps; local tests do not enable production sending.

## Additive deployment order

1. Configure the new Convex secrets and canonical HTTPS origin, keeping each new app’s sender-verified flag `false`. Add the matching `APP_UPDATES_API_SECRET` to the Next/Vercel environment. Use the production Convex HTTP origin ending in `.convex.site`, not the client API origin ending in `.convex.cloud`. Do not change or copy existing Shield offer secrets, tables, or recipient records.
2. Deploy **Convex first** with the additive schema, internal functions, HTTP handlers, and retry cron. The new tables start empty; this requires no migration or audience import. Keep all six existing Shield offer tables and their functions in the deployment. Confirm the new schema and routes are present through authenticated deployment tooling without submitting a signup.
3. Deploy **Next.js second**, including the product forms, API proxy, and all confirmation, unsubscribe, and privacy pages. Keep the Vercel and Convex app-update API secrets identical. The form truthfully reports temporary unavailability until its sender is ready; missing backend routes or mismatched server credentials also map to a public 503.
4. Check each app’s independent sender identity, support reply-to address, verified Resend domain, and correct public confirmation-page origin. Enable only that app by setting its own `*_EMAIL_SENDER_VERIFIED` flag to `true`. All three may share the verified domain and provider key; readiness is still evaluated separately. Do not use an offer claim or send a production message as an automated deployment check.
5. Observe the app-specific job table for accepted or failed delivery after genuine opt-ins. A rollback can disable new signup/sending by returning that app’s verified flag to `false`; keep the confirmation/unsubscribe pages, records, and signing secret available so existing recipients can manage their choice. Do not delete tables or rotate signing secrets merely to pause new signups.

Readiness audits may inspect variable presence and boolean flags only. Never print values of signing keys, API keys, deployment credentials, or subscriber records. Presence alone does not prove a sender domain is verified or a deployment is live.

## Retention and support

Pending requests and their related records are removed after 30 days without another request. Cleanup is bounded and may complete across several cron runs. Expired rate limits are cleared after the short troubleshooting window. Active consent records remain while subscribed. Unsubscribed records retain suppression and support information until an erasure request is handled.

For access, correction, or erasure, identify the app and address in the authenticated Convex dashboard. Inspect only that app’s records. For erasure, remove the related verification and delivery records along with its email record; invalidate active links by removing their records. Do not erase or modify another app’s audience or Shield offer records unless that is also requested. Do not send production test email or consume real offer codes to validate this feature.

## Verification

Backend tests use synthetic data, an in-memory Convex database, and a mocked Resend provider. They cover independent consent, scoped signatures, expiry, unsubscribe/resubscribe, throttling, races, immutable retries, stale leases, and unchanged Shield records. Browser tests mock the new API for form validation, consent, retries, token removal, deliberate confirmation, accessible focus, and missing-link recovery.
