# Trust center content seeds

One YAML file per brand. These are **starting points, not publishable content.**

## How to use

1. Open `https://trust.<domain>/admin` and sign in.
2. Paste the matching seed into the YAML editor.
3. **Replace every `TODO:` value with the real, verified answer.**
4. Save. The public page updates immediately — no deploy.

## ⚠️ Read before publishing

A trust center is a formal representation to procurement and security teams. Every
compliance status, audit date, certification, and infrastructure claim on it is
relied on by customers and may end up in a contract.

The `compliance:`, `documents:`, `infrastructure:`, and `monitoring:` sections in
these seeds are therefore left as `TODO:` placeholders. They are **not** filled in
with plausible-looking defaults, because a wrong "SOC 2 Type II — Certified" is far
worse than a blank section.

Only your security/GRC owner should fill those in. Delete any section that does not
apply — an omitted section simply doesn't render.

## Content is per-site

These files live in the repo only as templates. The live content for each brand is
stored in **that brand's own Supabase project** (`trust_configs`, row `id='default'`).
Editing one brand's YAML has no effect on any other brand.
