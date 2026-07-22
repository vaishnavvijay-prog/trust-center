/**
 * Per-deployment branding.
 *
 * One codebase serves every brand's trust center. Colours and the typeface come
 * from env vars so a new brand is a new deploy — not a new fork. Page CONTENT is
 * unrelated to this: it lives as YAML in each deployment's own Supabase project.
 *
 * Every value has a neutral fallback, so an unconfigured deploy still renders.
 */

export type Brand = {
  /** Company name, used for the admin/login page titles. */
  name: string
  /** Brand colour as an OKLCH string, e.g. "oklch(0.5407 0.2561 276.7)". */
  primary: string
  /** Text/icon colour placed on top of `primary`. */
  primaryForeground: string
  /** Google Fonts family name, e.g. "Figtree". Empty disables the webfont. */
  font: string
  /** Weights requested from Google Fonts. */
  fontWeights: string
  /** Footer credit line. */
  footer: string
}

const DEFAULTS: Brand = {
  name: 'Trust Center',
  primary: 'oklch(0.55 0.258 284)',
  primaryForeground: 'oklch(0.985 0 0)',
  font: 'Figtree',
  fontWeights: '300;400;500;600;700;800',
  footer: `© ${new Date().getFullYear()} Zuro`,
}

function env(name: string, fallback: string): string {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : fallback
}

export function getBrand(): Brand {
  return {
    name: env('BRAND_NAME', DEFAULTS.name),
    primary: env('BRAND_PRIMARY', DEFAULTS.primary),
    primaryForeground: env('BRAND_PRIMARY_FOREGROUND', DEFAULTS.primaryForeground),
    font: env('BRAND_FONT', DEFAULTS.font),
    fontWeights: env('BRAND_FONT_WEIGHTS', DEFAULTS.fontWeights),
    footer: env('BRAND_FOOTER', DEFAULTS.footer),
  }
}

/** Google Fonts href for the brand typeface, or null when none is configured. */
export function brandFontHref(brand: Brand): string | null {
  if (!brand.font) return null
  const family = brand.font.trim().replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${brand.fontWeights}&display=swap`
}

/**
 * The brand's shadcn token overrides. Emitted for both the light root and the
 * `.dark` scope so the YAML `theme:` switch keeps the brand colour either way.
 */
export function brandCss(brand: Brand): string {
  const tokens = [
    `--primary:${brand.primary}`,
    `--primary-foreground:${brand.primaryForeground}`,
    `--ring:${brand.primary}`,
    `--sidebar-primary:${brand.primary}`,
  ].join(';')

  const font = brand.font
    ? `body{font-family:'${brand.font}',ui-sans-serif,system-ui,sans-serif}`
    : ''

  return `:root{${tokens}}.dark{${tokens}}${font}`
}
