import { d1Query, d1Configured } from "@/lib/d1";
import { DEFAULT_TRUST_YAML } from "@/lib/trust-config";

const CONFIG_ID = "default";

export type StoredTrustConfig = {
  yaml: string;
  updatedAt: string | null;
};

export async function getStoredTrustConfig(): Promise<StoredTrustConfig> {
  const rows = await d1Query<{ yaml: string; updated_at: string | null }>(
    "SELECT yaml, updated_at FROM trust_configs WHERE id = ? LIMIT 1",
    [CONFIG_ID]
  );
  const row = rows[0];
  return {
    yaml: row?.yaml ?? DEFAULT_TRUST_YAML,
    updatedAt: row?.updated_at ?? null,
  };
}

export async function saveTrustConfig(yaml: string): Promise<StoredTrustConfig> {
  const updatedAt = new Date().toISOString();
  // SQLite UPSERT — one config row per deployment, keyed by CONFIG_ID.
  await d1Query(
    `INSERT INTO trust_configs (id, yaml, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET yaml = excluded.yaml, updated_at = excluded.updated_at`,
    [CONFIG_ID, yaml, updatedAt]
  );
  return { yaml, updatedAt };
}

/** Re-exported so callers can branch on configuration without importing d1 directly. */
export { d1Configured };
