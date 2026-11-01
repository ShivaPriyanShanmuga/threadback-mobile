# Private Cloudflare deployment

This deployment serves the existing `dist/` app on Cloudflare Workers, protected by Cloudflare Access. It is separate from the existing owner-private Sites deployment. No Cloudflare production URL is claimed until deployment, Access policy, and remote checks succeed.

## Local checks

```sh
npm ci --prefix deployments/cloudflare
npm test --prefix deployments/cloudflare
npm run build --prefix deployments/cloudflare
```

The build is a Wrangler dry run: it bundles the Worker and reads the static assets without publishing. The original app can still be run locally without installing these deployment dependencies.

## Account setup and deployment

1. Sign into the intended Cloudflare account. Enable Zero Trust if needed; do not accept a paid plan or new terms without the owner's action-time approval.
2. Keep the initial configuration blank. Deploying it denies all app access with HTTP 503, allowing the Access application to be configured before any app assets are served.
3. Protect **this Worker**, for **all traffic**, with Cloudflare Access. Use an **Allow / Emails / exact owner email** rule, not Everyone or an email-domain rule. Protect production and previews. Configure One-time PIN as an identity provider if email codes are desired; new Zero Trust accounts do not automatically enable it.
4. Copy `wrangler.private.example.jsonc` to the ignored `wrangler.private.jsonc`. Set the Cloudflare team HTTPS origin, application AUD, and one exact allowed email. Keep local account-specific configuration and credentials out of Git.
5. Deploy with `npm run deploy --prefix deployments/cloudflare`. Verify the access boundary on the actual URL, including `/`, `/app.mjs`, `/assets/icon.svg`, and `/sw.js`. Unauthenticated requests must reach Access sign-in or be denied, never receive app assets.
6. On iPhone Safari, open the protected URL, enter the allowed email, and complete the login code. Run `docs/IPHONE-CHECKLIST.md`. Phone task data is local to that browser; other origins do not transfer it automatically.

The Cloudflare CLI may store its normal OAuth credentials outside this repository. Use its normal login flow; do not paste a token into source, command arguments, chat, or outputs. No account-wide Access policy or unrelated Worker should be changed.

## Access boundary

- `assets.run_worker_first: true` puts the Worker before **every** static asset, including JavaScript, icons, and the service worker.
- Missing configuration, missing/invalid token, failed key fetch, or the wrong email denies access before the asset binding is called.
- `jose` verifies the Access JWT signature against the configured team's JWKS, with RS256, issuer, application audience, expiration, and required identity claims. An email header alone is never trusted.
- The Worker also checks the application-token type and exact email. Authenticated HTTP responses are `private, no-store`. Camera/microphone are allowed only for the same origin.
- Cloudflare Static Assets do not pass `ctx.access` to the user Worker; this is why this deployment verifies the signed assertion instead of treating that context as available.
- Access protects network requests. Previously authorized local browser data and the app's deliberate offline cache remain on the user's device; this is not remote device locking or erasure.

The eight offline tests use real RS256 signatures to exercise the guard and asset routing. They do not establish that a Cloudflare policy, email delivery, or iPhone camera has worked in production.

Sources: [Cloudflare Access for Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), [JWT verification](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Static Assets routing](https://developers.cloudflare.com/workers/static-assets/binding/), [One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/).
