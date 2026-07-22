import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Postgres schema holding this deployment's tables.
 *
 * Several brands can share one Supabase project by giving each its own schema.
 * Scoping the client here means every query is isolated by construction — no
 * caller has to remember a per-brand `.eq()` filter, so a missed one can't leak
 * another brand's document requests.
 *
 * Defaults to `public`, which is where a single-brand project already lives.
 */
const schema = process.env.TRUST_DB_SCHEMA?.trim() || "public";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase credentials are not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
    db: {
      schema,
    },
  });
}

/** The schema this deployment reads and writes. Exposed for diagnostics. */
export function getSchema(): string {
  return schema;
}
