# GrainFreak — Ivory / Gold / Teal website

**Version:** 4.0, November 19, 2026  
**Deploy target:** Cloudflare Pages static site with an Advanced-mode `_worker.js` contact endpoint.

This is the complete deployable GrainFreak website, rebuilt from the supplied GrainFreak website source and styled to match the supplied warm ivory / champagne-gold / teal design reference. It is the actual HTML/CSS/JS source, **not** a flattened mockup.

## 1. Visual system

The supplied reference establishes a premium, understated technology identity: warm cream rather than stark white, deep charcoal/navy text, champagne-gold grain symbolism, teal primary actions, delicate contour/mesh patterns, and layered, illustrative SaaS UI with grain imagery. The redesign applies these decisions across the homepage, product sections, contact form, footer, and legal pages.

| Design token | HEX | Purpose |
| --- | --- | --- |
| Ivory canvas | `#FAF9F4` | Main page background |
| Deep ink | `#192934` | Headings, wordmark, high-emphasis text |
| Teal | `#0D827A` | Primary buttons, active tabs, links |
| Champagne gold | `#C59C61` | Grain symbol, fine detail, editorial labels |
| Warm secondary surface | `#F4F2E9` | Alternate sections |
| Body text | `#5C6769` | Supporting text |
| Border | `#E7E5DC` | Subtle dividers, card outlines |

Typography: **Manrope**, self-fallback to system sans-serif. Main layout target: 1230px maximum content width. Responsive breakpoints in `assets/experience.css`.

### The homepage hero

- Original grain still-life photo with a warm ivory surface, wheat heads, kernels and teal/champagne sculptural accents.
- Layered **real HTML/CSS** dashboard, floating AI terms card, and an example GrainPort route card. It stays crisp and adaptable at different screen sizes.
- All displayed route and commercial values are **illustrative**, not live price quotes.
- Clear distinction between **GrainPort available** and **AI features in pilot**.
- Subtle lines, gold commodity dividers, restrained shadows and no gratuitous animations.

### Original imagery

The photo `assets/grain-still-life.webp` is an **original generated image** created for this redesign; `assets/grain-still-life-1200.webp` is its responsive derivative. Existing agricultural images from the supplied website are retained in the product, About and contact sections. All included images are served locally, not fetched at runtime from a stock-photo site.

Source-image prompt for the newly generated hero:

> Photorealistic, high-resolution premium agricultural still life on a warm ivory stone surface. Place detailed golden wheat ears and a pile of wheat kernels mainly on the right, with soft sunlight and diffused shadows. Subtle teal and champagne-gold sculptural arcs in the background. Leave the left half elegantly uncluttered for a modern B2B SaaS hero. Editorial photography, no text, no UI, no watermark.

Optional future prompts for a cohesive image library:

> **GrainPort:** Authentic documentary photograph of a modern grain terminal and long-haul grain freight trucks in soft late-afternoon daylight, warm neutral beige and champagne colors, natural realistic textures, no logos, no people, horizontal editorial crop.

> **About:** Close-up of golden mature wheat in a real agricultural field, sunlit details and soft out-of-focus grain storage facility in the distance, refined warm neutral tones, calm trustworthy B2B style, no text, 4:3 composition.

> **Grain and commodity editorial cards:** Premium editorial close-ups of wheat kernels, barley, soybeans and corn separated into distinct photographs, warm cream backgrounds, clean soft lighting, subtle texture, no symbols, no text or charts.

## 2. File layout

```text
index.html                 Main landing page: hero, Platform, workflow, GrainPort, AI Agents, capabilities, About, pilot, contact
privacy.html               Existing privacy content, redesigned visual style
terms.html                 Existing terms content, redesigned visual style
assets/styles.css          Preserved structural CSS / base components
assets/experience.css      New reference-inspired design and responsive system
assets/site.js             Preserved navigation, tab controls and contact form interactions
assets/grainfreak-mark.svg Recolored grain/G symbol (champagne gold)
assets/grainfreak-logo.png Logo and wordmark for external use
assets/grain-still-life.webp         New hero image
assets/grain-still-life-1200.webp    Small optimized derivative
assets/og-image.jpg        New photo-based social sharing image
assets/*.webp              Supporting agricultural photography
_worker.js                 Preserved Cloudflare contact API (Resend)
_routes.json               Worker runs for `/api/*`
_headers                   Security and caching baseline for static pages
robots.txt, sitemap.xml    Search/discovery metadata
README.md                  This document
```

## 3. Local testing

No bundler, NPM install, SPA router or paid hosting dependency is required.

```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

The visual website works locally; `/api/contact` requires the Cloudflare Worker environment and will not send email on a plain Python static server.

### Behavior checks

1. Navigation links scroll to their respective sections.
2. The hamburger menu opens and closes on mobile, and closes after selecting a link.
3. The capabilities tabstrip switches panels; keyboard arrow navigation is preserved.
4. Empty/invalid contact fields show inline validation; valid submissions POST to `/api/contact`.
5. GrainPort CTA links to `https://grainport.app` (external application).
6. `/privacy` / `privacy.html` and `/terms` / `terms.html` resolve on Cloudflare Pages (verify clean URL settings).
7. Check actual content, legal details, product maturity claims, external links, and lead-reply process before going live.

## 4. Cloudflare Pages deployment

### Option A: Git integration (recommended)

1. Commit the contents of this directory to your website's private GitHub repository.
2. Create or open the existing Cloudflare Pages project; connect its GitHub repository.
3. Use the repository root as the **output directory**, with **no build command** (or use a `public/` directory if your repository deployment is already structured that way, and move these files into it).
4. Set `www.grainfreak.com` as the custom domain. Redirect or canonicalize the apex consistently; current HTML canonical is `https://www.grainfreak.com`.
5. Configure the Worker secret and verify form delivery before promoting production.
6. Use branch previews for changes, review on mobile, then merge into the production branch.

### Option B: Direct upload

Upload the unpacked **contents** of this ZIP as a Cloudflare Pages site/project deployment, retaining the file paths at the site root. Ensure that your selected Pages deployment mode supports `_worker.js`; otherwise configure the contact endpoint separately.

### Secrets and contact form

The existing `_worker.js` uses Resend for the contact email API.

- `RESEND_API_KEY` **secret** (required): Resend API key, created/configured in Cloudflare environment secrets, never in source code.
- `DEST_EMAIL` **environment variable** (optional): destination mailbox; defaults to `info@grainfreak.com`.
- Verify `grainfreak.com` at Resend, including necessary DNS email authentication.
- Test a real submission in preview and production with authorized sender/recipient identities.

The API validates required fields and length. Its built-in in-memory rate limit is **best effort per isolate, not a global security boundary**. Configure Cloudflare WAF/rate limiting for `/api/contact`, plus abuse monitoring, separately. If needed, implement durable rate limits with KV/DO or Cloudflare's configured rate limiting service.

### Security checks

- Check Full (strict) TLS, canonical redirects, appropriate HSTS policy, and origin restrictions.
- Review CSP and `_headers` against deployed third-party scripts before changing providers. Manrope is fetched from Google Fonts; self-host if avoiding third-party font requests is a requirement.
- Verify external links, social previews, sitemap indexing, legal disclosures and privacy policy. **Visual restyling is not a legal/security audit.**
- Review the privacy policy, especially its actual processors, data-retention statements, and legal entity details, with counsel before production.

## 5. QA carried out in this handoff

- Static HTML references: **no missing local assets**.
- Internal homepage anchor links: **all targets found**.
- CSS parsing: **no syntax errors**.
- Main JS / Worker syntax: **valid**.
- Embedded Chromium rendering: desktop **1440px**, tablet **768px**, mobile **390px**, narrow mobile **320px**.
- Horizontal overflow: **none** across tested viewports.
- JavaScript runtime errors: **none** during these tests.
- Local interactions: mobile menu, capability tabs, and contact form validation **passed**.
- Legal pages: rendered without horizontal overflow.
- Local image decoding: checked by forcing lazy images to load during visual QA.

**Not tested against production:** Live Cloudflare Worker execution, Resend delivery, Cloudflare WAF policies, deployed CSP effects, production Core Web Vitals, real content approvals, or end-to-end contact submission to the inbox. Treat these as required release gates.

## 6. Change notes

- **Retained:** Static HTML architecture, Cloudflare Pages advanced-mode Worker, contact form API contract, GrainPort link, existing sections/content, accessible tab and mobile-nav behavior, legal routes.
- **Changed:** Palette, headline, navigation presentation, logo color, typography, hero artwork and layered application illustration, card design, image treatment, commodity separators, buttons, product areas, form styling, legal pages, social image.
- **Not added:** Fictional live prices, offers, market feeds, user accounts, subscriptions, product functionality that requires back-end integration.

All photos are local assets and can be replaced individually without changing any templates.
