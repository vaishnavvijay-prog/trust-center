/**
 * Cloudflare D1 over the HTTP query API.
 *
 * The app runs on DigitalOcean (not a Worker), so it reaches D1 through the
 * REST query endpoint with an API token. That token MUST be scoped to only the
 * trust-center databases — an account-wide token would let a compromised deploy
 * reach production D1s. See docs/SETUP.md.
 *
 * Config comes from env:
 *   CF_ACCOUNT_ID   Cloudflare account id
 *   CF_D1_ID        this deployment's D1 database uuid (one per brand)
 *   CF_API_TOKEN    token scoped to D1:Edit on the trust databases only
 */
const accountId = process.env.CF_ACCOUNT_ID;
const databaseId = process.env.CF_D1_ID;
const apiToken = process.env.CF_API_TOKEN;

export function d1Configured(): boolean {
  return Boolean(accountId && databaseId && apiToken);
}

type D1Result<T> = { results: T[]; success: boolean };

/**
 * Run one SQL statement with bound params against this deployment's D1.
 * Returns the rows. Throws if D1 is not configured or the query fails.
 */
export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  if (!accountId || !databaseId || !apiToken) {
    throw new Error("Cloudflare D1 is not configured.");
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      // The config read happens per request; never cache credentials-bearing calls.
      cache: "no-store",
    }
  );

  const body = (await res.json()) as {
    success: boolean;
    errors?: { message: string }[];
    result?: D1Result<T>[];
  };

  if (!res.ok || !body.success) {
    const msg = body.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`;
    throw new Error(`D1 query failed: ${msg}`);
  }

  return body.result?.[0]?.results ?? [];
}
