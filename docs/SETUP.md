# Standing up a trust center for a new brand

One repo, one deploy per brand. Nothing here is shared between brands except the
code — colours come from env vars, content comes from that brand's own Supabase
project.

Budget ~20 minutes per brand. Steps 1–3 need a human (they create accounts,
OAuth apps, and billable infrastructure).

---

## 1. Supabase project (per brand)

Create a new project, then run this in the SQL editor:

```sql
create table public.document_requests (
  id text primary key,
  email text not null,
  document text not null,
  company text not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.trust_configs (
  id text primary key,
  yaml text not null,
  updated_at timestamptz not null default now()
);
```

Copy the **Project URL** and the **service_role** key (Settings → API).

> The service_role key bypasses row-level security. It is server-only — it is
> never sent to the browser. Never put it in a `NEXT_PUBLIC_*` var.

## 2. GitHub OAuth app (per brand)

The callback URL is origin-specific, so each brand needs its own app.

- Homepage URL: `https://trust.<domain>`
- Authorization callback URL: `https://trust.<domain>/api/auth/callback/github`

Copy the Client ID and generate a Client Secret.

## 3. DigitalOcean app (per brand)

Create an App from this repo. Use the matching spec in [`.do/`](../.do) as a
reference, or configure by hand:

- Build command `npm run build`, run command `npm start`, HTTP port `3000`
- Set every env var from [`.env.example`](../.env.example)
- Mark `NEXTAUTH_SECRET`, `GITHUB_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` as
  **encrypted** secrets

Then point DNS at it: a `CNAME` from `trust.<domain>` to the app's
`*.ondigitalocean.app` hostname. Proxy it through Cloudflare (orange cloud).

## 4. Fill in the content

Open `https://trust.<domain>/admin`, sign in, paste the brand's seed from
[`seeds/`](../seeds), replace every `TODO:`, and save.

**Read [`seeds/README.md`](../seeds/README.md) first.** The compliance,
document, and infrastructure sections are deliberately left blank — they are
formal representations to procurement teams and must be filled in by whoever
owns security/GRC, not guessed.

## 5. Link it from the marketing site

Add to the site footer's legal row:

```ts
{ label: 'Trust Center', href: 'https://trust.<domain>/', external: true },
```

---

## Adding a brand later

1. New Supabase project (step 1) + GitHub OAuth app (step 2).
2. New DO app off this same repo with that brand's env vars.
3. Convert the brand colour to OKLCH and set `BRAND_PRIMARY`.

No fork, no branch, no code change.

### Converting a brand hex to OKLCH

```bash
node -e '
const hex=process.argv[1];
const n=parseInt(hex.slice(1),16),r8=(n>>16)&255,g8=(n>>8)&255,b8=n&255;
const f=v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
const r=f(r8),g=f(g8),b=f(b8);
const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b);
const m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b);
const s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
const L=0.2104542553*l+0.7936177850*m-0.0040720468*s;
const A=1.9779984951*l-2.4285922050*m+0.4505937099*s;
const B=0.0259040371*l+0.7827717662*m-0.8086757660*s;
let H=Math.atan2(B,A)*180/Math.PI; if(H<0)H+=360;
console.log(`oklch(${L.toFixed(4)} ${Math.hypot(A,B).toFixed(4)} ${H.toFixed(1)})`);
' "#5548FE"
```

## Keeping up with upstream

This repo tracks [`kodustech/trust-center`](https://github.com/kodustech/trust-center).
Security fixes land there (four Next.js CVEs already have). Merge them **once**
and every brand's next deploy picks them up:

```bash
git remote add upstream https://github.com/kodustech/trust-center.git
git fetch upstream
git merge upstream/main
```

## Local development

```bash
npm install
cp .env.example .env    # fill in at least the BRAND_* vars
npm run dev
```

Without Supabase credentials the app logs a warning and renders the built-in
demo config — useful for checking branding without touching real content.
