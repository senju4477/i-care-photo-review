# I Care Group Services website

This is the separate **photo-review/testing copy**. For temporary hosting at
`test.swiftdigitals.au`, follow [HOSTINGER-TESTING.md](HOSTINGER-TESTING.md).
Preserve `REVIEW_MODE=true` and `SITE_INDEXABLE=false` for this test deployment.
Business details and website content remain unchanged.

A static-first, accessible website with a small Node.js server for Hostinger. The SEO targets **Melbourne generally**, using the real office at **384 Keilor Road, Niddrie VIC 3042** as its local reference. The site contains 23 pages, including 11 service pages and one Melbourne support page.

## Run and verify

Use Node.js **22.x**. There are no third-party runtime dependencies.

```sh
npm run build
npm start
```

The server immediately listens on `process.env.PORT` (3000 when unset), bound to `0.0.0.0`. It has no conditional `require.main` startup guard.

```sh
npm run verify
```

This builds the production site, checks all page routes/assets/metadata, and runs the form, security, compression, cache and SEO tests. The current suite has 17 tests. The implementation has been exercised on Node.js 24 in the editing environment; a Node.js 22 runtime and a real Hostinger deployment still need to be verified.

## Hostinger Node.js Web App

| Setting | Value |
| --- | --- |
| Framework | Other |
| Node.js | 22.x |
| Build command | `npm run build` |
| Output directory | `dist` |
| Entry file | `server.mjs` |
| Start command, if requested | `npm start` |
| Port | Hosting-provided `PORT` |
| Bind address | `0.0.0.0` |

Configure environment variables in Hostinger before building. `.env.example` documents the supported values; the application reads the hosting process environment and does not load a local `.env` file automatically.

- `SITE_URL=https://icgservices.com.au` sets production canonical, sharing and sitemap URLs.
- `SITE_INDEXABLE=true` enables production indexing. Use `false` for duplicate preview copies.
- `REVIEW_MODE=false` enables real contact options. `true` explicitly enables sample-only testing.
- `FORM_DELIVERY=email-app` prepares an email draft addressed to `admin@icgservices.com.au`. The visitor opens and sends the draft in their own email app. It does **not** claim a message has been sent by the website.

### Automatic enquiry delivery

Automatic delivery needs `FORM_DELIVERY=provider`, a valid `RESEND_API_KEY`, and `FROM_EMAIL` using a verified sender. `BUSINESS_EMAIL` defaults to `admin@icgservices.com.au`. Set these values in Hostinger's environment settings, rebuild and restart, then verify receipt using a dummy enquiry. Never commit credentials.

No sending credentials were available during this update, so **automatic delivery is not configured or inbox-tested**. The current contact, referral and feedback forms use the clearly labelled email-draft option. That option also works on the static ChatGPT preview. Sending feedback through an email app reveals the sender's email address; the feedback confirmation explains this and offers phone contact.

The supplied static Sites deployment has no Node API runtime. Use the Node.js deployment on Hostinger for automatic delivery. A static deployment alone cannot run `/api/forms`.

## Melbourne SEO

Each page has a unique title and description, production canonical URL, social sharing metadata and server-rendered content. Structured data includes one LocalBusiness at the Niddrie address, Melbourne as the service enquiry area, office hours, WebSite/WebPage information, service details, breadcrumbs and visible FAQs. No additional offices, invented reviews or service availability guarantees are added.

The build creates `dist/sitemap.xml`, `dist/robots.txt` and legacy URL redirects. The 404 page always requests no indexing. The Node server also normalises directory URLs and `/index.html` aliases. The ChatGPT copy is built with `SITE_INDEXABLE=false` so it does not compete with the main domain; the default Hostinger production build enables indexing.

After the main-domain deployment is verified, submit `https://icgservices.com.au/sitemap.xml` in the domain's Google Search Console property and check representative URLs. This update does not alter Google Business Profile, Search Console, domain DNS or the existing live domain.

## Performance

- Locally optimised WebP photos with responsive alternatives and real image dimensions.
- Below-the-fold photo lazy loading and high-priority hero image preloading.
- Latin-subset local Poppins fonts, preserving the font and its licence.
- Versioned CSS, scripts, fonts and image URLs.
- Brotli/gzip precompression served by the Node handler, conditional ETag responses, immutable caching for versioned assets and revalidation for HTML.
- No third-party font, analytics, map or JavaScript framework downloads.

Compared with Version 4's source files, original photo payloads fell from 832,084 to 448,754 bytes (46%); the three font files fell from 205,968 to 39,844 bytes (81%). These are file-size improvements, **not measured Core Web Vitals or a guaranteed load-time reduction**. Desktop/mobile browser QA and production Lighthouse/Core Web Vitals measurement remain outstanding.

## Project structure

- `src/`: page templates, business data, SEO graph, configuration and Node request handler.
- `public/assets/`: local images, font files/licence, CSS and browser scripts.
- `scripts/build.mjs`: production/static build and compression.
- `scripts/check.mjs`: page, link, asset and SEO validation.
- `tests/`: form/security and compression/cache/SEO regression coverage.
- `server.mjs`: Hostinger-compatible startup entry point.
- `dist/`: generated deployment output; regenerate it for the target environment.

Versions 1–4 remain preserved in the Sites version history. This source update preserves the original logos, distinct homepage layout, quality and safeguards content, NDIS cards, and Acknowledgement of Country with the Aboriginal and Torres Strait Islander flags.

## Contact and accessibility widgets

Every page includes a collapsed **Contact** button at the lower right. It expands to a telephone link, Google Maps directions and a short callback/appointment enquiry form. The form uses the same configured delivery method as the main contact form; the email-app mode still requires the visitor to send the draft. It never confirms an appointment automatically.

The owner confirmed **0435 825 566** for WhatsApp, so the WhatsApp action links to `https://wa.me/61435825566` by default. An optional `WHATSAPP_NUMBER` environment variable overrides that confirmed default; use international format including the country code and rebuild. Set that variable to an empty string to hide WhatsApp.

The separate accessibility button provides text enlargement from 100–140%, high contrast, underlined links, reduced motion and reset. Display preferences are stored locally on the visitor’s device. Native modal dialogs provide keyboard containment and Escape-to-close behaviour. These controls complement the site’s accessibility; a browser and assistive-technology audit is still required.

### Header and footer logo clarity

The header and footer use native SVG versions of the original brand artwork. The lettering is stored as vector outlines and the footer uses solid white artwork on a transparent background. The original PNG files are retained as source references. SVG assets receive content hashes and compressed variants, and the Hostinger server serves them as image/svg+xml.
