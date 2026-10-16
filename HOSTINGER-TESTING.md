# Temporary I Care website test

This repository contains the second, separate photo-review website from:
https://i-care-homepage-photo-review.walkersaint402.chatgpt.site

The source matches Sites commit `67a7c314286e93f986d6e23d228df9411be48a9d`.
The original business details, email addresses, phone numbers, logos, text,
approved park-path photo and higher-resolution replacement photos are preserved.
No application code or website content has been changed for this export.

## Hostinger settings

Add this as an independent website/application under `test.swiftdigitals.au`.
Connect this repository and the `main` branch.

| Setting | Value |
| --- | --- |
| Framework | Other |
| Node.js | 22.x |
| Build command | `npm run build` |
| Output directory | `dist` |
| Entry file | `server.mjs` |
| Start command, if requested | `npm start` |

Set these environment variables in hPanel before building:

```text
SITE_URL=https://test.swiftdigitals.au
SITE_INDEXABLE=false
REVIEW_MODE=true
BUSINESS_EMAIL=admin@icgservices.com.au
```

These settings change the technical website origin only. They keep the existing
business contact details and the review site's test-mode forms. Test forms do not
send email; the visible phone and email links continue to use the existing I Care
contact details. No email mailbox or mail DNS change is required for this copy.

The server binds to `0.0.0.0` and uses Hostinger's supplied `PORT`. Do not set
`HOSTNAME` or hard-code a port.

Connect only the `test` subdomain using Hostinger's domain connection flow and
the DNS values it supplies. If DNS is managed externally, make the required
record changes there. Keep the root domain's existing website and mail records.

The generated `dist/` and `build-info.json` are omitted from GitHub because
`npm run build` regenerates them for the selected domain. All source, local
assets and original high-resolution photo files are included. Sites-specific
hosting identity is omitted so this repository can be managed independently.

## Verify

Use Node.js 22.x and the same environment variables, then run:

```sh
npm run verify
npm start
```

Check representative pages, image framing, contact links and test forms after
Hostinger deployment. No deployment to `test.swiftdigitals.au` or DNS change
has been performed as part of the GitHub export.
