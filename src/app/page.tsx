import type { Metadata } from "next";
import { TrustCenterPublic } from "@/components/trust/trust-center-public";
import { getBrand } from "@/lib/brand";
import { DEFAULT_TRUST_YAML, safeParseTrustCenter } from "@/lib/trust-config";
import { getStoredTrustConfig } from "@/lib/trust-config-store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadTrustConfig() {
  let yaml = DEFAULT_TRUST_YAML;

  try {
    const stored = await getStoredTrustConfig();
    if (stored?.yaml) {
      yaml = stored.yaml;
    }
  } catch (error) {
    console.error("Falling back to default trust center config:", error);
  }

  const parsed = safeParseTrustCenter(yaml);
  if (parsed.ok) {
    return parsed.data;
  }

  const fallbackParsed = safeParseTrustCenter(DEFAULT_TRUST_YAML);
  if (!fallbackParsed.ok) {
    throw new Error(
      `Failed to load trust center configuration: ${parsed.error}`
    );
  }

  return fallbackParsed.data;
}

/** Per-brand favicon at /favicons/<slug>.<ext>, matching the hero logo slug. */
function faviconFor(name: string): { url: string; type: string } {
  const slug = name.toLowerCase().trim().split(/\s+/)[0].replace(/[^a-z0-9]/g, "");
  const ext = slug === "auralis" ? "png" : "svg";
  return { url: `/favicons/${slug}.${ext}`, type: ext === "svg" ? "image/svg+xml" : "image/png" };
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await loadTrustConfig();
  return {
    title: `${config.company.name} | Trust Center`,
    description: config.company.description,
    icons: { icon: [faviconFor(config.company.name)] },
  };
}

export default async function Home() {
  const config = await loadTrustConfig();
  const isDark = config.theme === "dark";

  return (
    <div className={cn(isDark && "dark")}>
      {/* Full-bleed: the trust center owns its own background and edge-to-edge
          banner, so the wrapper adds no padding, margin, or background. */}
      <main className={cn("min-h-screen", isDark ? "text-slate-50" : "text-slate-900")}>
        <TrustCenterPublic config={config} footer={getBrand().footer} />
      </main>
    </div>
  );
}
