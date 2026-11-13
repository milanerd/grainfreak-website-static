# GrainFreak — Cloudflare Pages deployment

This ZIP is ready for Pages hosting, but contact-form email needs Resend configuration.

## Changes from original
- `_worker.js`: serves static assets for non-API routes, sends contact email with Resend instead of discontinued MailChannels endpoint, and reports delivery API failures.
- `_routes.json`: invokes the Pages Function only for `/api/*` routes; other requests remain free static asset requests.
- Corrected CSS background image path and removed references to two absent icon files.
- Existing HTML, content, styling, logo and email recipient preserved.

## Deployment
1. Create a Cloudflare Pages project `grainfreak-website` (Direct Upload or Git integration).
2. Dashboard Direct Upload: drag this ZIP into the new Pages project. This archive contains `_worker.js`, supported in dashboard direct upload. Alternatively unzip and run `npx wrangler pages deploy . --project-name grainfreak-website` after login and project creation.
3. Verify the generated `*.pages.dev` site and `/api/contact` behavior (POST only).
4. In Resend, verify sending domain `grainfreak.com` by adding its proposed DKIM/SPF DNS records. Do NOT overwrite any existing mailbox MX or Google Workspace SPF records. The receiving address is `info@grainfreak.com`.
5. Create a Resend API key and add it as a secret `RESEND_API_KEY` to Cloudflare Pages project settings > Variables and Secrets (Production). Set optional `DEST_EMAIL=info@grainfreak.com`.
6. Redeploy after setting the secret. Test a real form submission and verify email received.
7. In Pages > Custom domains, add `www.grainfreak.com` (the primary hostname). Update/remove the old conflicting www DNS record if Cloudflare requests it, and confirm CNAME targets your `*.pages.dev` project (proxied).
8. To redirect `grainfreak.com` to www, point the apex to Pages too (via Pages Custom domains) and use a Cloudflare Rules > Redirect Rules 301 rule from the apex to `https://www.grainfreak.com`, preserving path and query string.
9. Keep existing MX, DKIM, SPF, and DMARC records unless your email provider explicitly requires changes. Do not enable Cloudflare Email Routing if you use an existing email provider.

## Security limitations
- In-memory rate limit is per worker isolate, not persistent; add Turnstile verification and optionally Cloudflare Rate Limiting Rules for production anti-spam protection.
- Before production, test both `https://www.grainfreak.com` and `https://grainfreak.com`, sitemap, HTTPS and email form.

## Update method
Direct Upload projects cannot be switched to Git integration after creation; if you want automatic deploys from GitHub, choose Git integration when creating the project.
