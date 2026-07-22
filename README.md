# Trust Center — shared, multi-brand

One Next.js app that serves the trust center for every brand we run. Colours and
typeface come from env vars; page content is a YAML document in each brand's own
Supabase project. Adding a brand is a new deploy, not a new fork.

Based on [`kodustech/trust-center`](https://github.com/kodustech/trust-center) (MIT).

## Deployments

| Brand | URL | Theme | Brand colour | Font |
| --- | --- | --- | --- | --- |
| Auralis | https://trust.auralis.ai | light | `#5B3DF5` violet | Figtree |
| Zuro | https://trust.getzuro.com | dark | `#5548FE` violet | Figtree |
| Dashverge | https://trust.dashverge.com | light | `#2d6cdf` azure | Open Sans |
| Astridex | https://trust.astridex.com | light | `#006241` green | Open Sans |

All four run the same `main`. **A code change ships to all of them; a content
change ships to exactly one.**

## How the split works

| Concern | Where it lives | Blast radius |
| --- | --- | --- |
| Page content (copy, compliance, documents, FAQs, subprocessors) | YAML in that brand's Supabase `trust_configs` row | One brand |
| Brand colour, font, name, footer | Env vars on that brand's deploy — [`src/lib/brand.ts`](src/lib/brand.ts) | One brand |
| Light/dark theme | `theme:` in the YAML | One brand |
| Layout, components, auth, schema | This repo | All brands |

Content never rides a deploy. Editing YAML in `/admin` is live immediately.

## Setup

See [`docs/SETUP.md`](docs/SETUP.md) for standing up a new brand end to end, and
[`seeds/`](seeds) for the per-brand content starting points.

> ⚠️ Before publishing any brand's content, read [`seeds/README.md`](seeds/README.md).
> Compliance and certification claims are deliberately left blank in the seeds.

## Local development

```bash
npm install
cp .env.example .env    # fill in at least the BRAND_* vars
npm run dev
```

Without Supabase credentials the app renders the built-in demo config, so you can
check branding without touching real content.

## Admin

`/admin` — YAML editor with live preview, plus the document-request queue.
Sign-in is GitHub OAuth, gated twice: [`src/middleware.ts`](src/middleware.ts)
requires a session, and [`src/lib/require-admin.ts`](src/lib/require-admin.ts)
requires the email to be in `ADMIN_EMAILS`. An empty `ADMIN_EMAILS` locks
everyone out by design.

## YAML schema

Full field reference in [`docs/trust-center-schema.md`](docs/trust-center-schema.md);
the authoritative definition is the Zod schema in
[`src/lib/trust-config.ts`](src/lib/trust-config.ts). Deleting a section hides it.

## Upstream

```bash
git remote add upstream https://github.com/kodustech/trust-center.git
git fetch upstream && git merge upstream/main
```

Merge security fixes once; every brand picks them up on its next deploy.

## License

MIT, inherited from upstream. See [LICENSE](LICENSE).
