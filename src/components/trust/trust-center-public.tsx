"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  Check,
  Clock,
  Database,
  Download,
  FileCheck2,
  FileLock2,
  FileText,
  ListChecks,
  Lock,
  type LucideIcon,
  Mail,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { TrustCenterConfig } from "@/lib/trust-config";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RequestDocumentDialog } from "@/components/trust/request-document-dialog";
import { cn } from "@/lib/utils";

type Props = {
  config: TrustCenterConfig;
  /** Footer credit line. Resolved server-side from BRAND_FOOTER. */
  footer?: string;
};

/** Self-hosted official-style badge for a certification, matched by name. */
const CERT_LOGO: [RegExp, string][] = [
  [/soc\s?3/i, "/badges/soc3.svg"],
  [/soc\s?2/i, "/badges/soc2.png"],
  [/soc\s?1/i, "/badges/soc1.svg"],
  [/27001/i, "/badges/iso-27001.png"],
  [/27701/i, "/badges/iso-27701.svg"],
  [/42001/i, "/badges/iso-42001.svg"],
  [/9001/i, "/badges/iso-9001.svg"],
  [/gdpr/i, "/badges/gdpr.png"],
  [/ccpa/i, "/badges/ccpa.svg"],
  [/lgpd/i, "/badges/lgpd.svg"],
  [/hipaa/i, "/badges/hipaa.png"],
  [/hitrust/i, "/badges/hitrust.svg"],
  [/pci|dss/i, "/badges/pci-dss.svg"],
  [/cmmc/i, "/badges/cmmc.svg"],
  [/fedramp/i, "/badges/fedramp.svg"],
  [/csa|star/i, "/badges/csa-star.svg"],
  [/cyber\s?essentials/i, "/badges/cyber-essentials.svg"],
  [/nist/i, "/badges/nist.svg"],
];
function certLogo(name: string): string | undefined {
  return CERT_LOGO.find(([re]) => re.test(name))?.[1];
}
function certShort(name: string): string {
  const n = name.toUpperCase();
  const map: [RegExp, string][] = [
    [/SOC\s?3/, "SOC 3"],
    [/SOC\s?2/, "SOC 2"],
    [/SOC\s?1/, "SOC 1"],
    [/27001/, "ISO 27001"],
    [/27701/, "ISO 27701"],
    [/42001/, "ISO 42001"],
    [/GDPR/, "GDPR"],
    [/HIPAA/, "HIPAA"],
    [/PCI/, "PCI DSS"],
    [/CCPA/, "CCPA"],
    [/LGPD/, "LGPD"],
    [/CMMC/, "CMMC"],
    [/ISO/, "ISO"],
  ];
  return map.find(([re]) => re.test(n))?.[1] ?? name.split(/[\s/]+/)[0].slice(0, 8);
}

/** Icon for an AI-posture row, chosen by its label. */
function postureIcon(label: string): LucideIcon {
  const n = label.toLowerCase();
  if (/human|loop/.test(n)) return UserRound;
  if (/train/.test(n)) return Lock;
  if (/reten|data/.test(n)) return Database;
  if (/host|model|cost|deploy/.test(n)) return Briefcase;
  return Bot;
}

/**
 * Public trust center — Sprinto-style layout in the Auralis brand language:
 * a full-width brand banner, an overlapping intro card, a sticky question bar,
 * horizontal section tabs, and a two-column content grid. Every accent is the
 * brand token (--primary), so each brand keeps its own hue.
 */
export function TrustCenterPublic({ config, footer }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [active, setActive] = useState<string>("overview");

  const isDark = config.theme === "dark";
  const company = config.company;
  const hero = config.hero ?? { commitments: [] as string[] };
  const compliance = config.compliance ?? [];
  const aiPosture = config.aiPosture ?? [];
  const customers = config.customers ?? [];
  const controls = config.controls ?? [];
  const documents = config.documents ?? [];
  const policies = config.policies ?? [];
  const infra = config.infrastructure;
  const monitoring = config.monitoring;
  const subprocessors = config.subprocessors ?? [];
  const updates = config.updates ?? [];
  const faqs = config.faqs ?? [];
  const contacts = config.contacts;

  function requestDoc(name: string) {
    setSelectedDocument(name);
    setDialogOpen(true);
  }

  const hasInfra = Boolean(
    infra &&
      (infra.hosting || infra.encryption || infra.retention || infra.backups || infra.dataResidency?.length || infra.dataCenters?.length)
  );

  // Nav tabs — Sprinto order. Render only sections with data.
  const nav = [
    { id: "overview", label: "Overview", show: true },
    { id: "compliances", label: "Compliances", show: compliance.length > 0 },
    { id: "trusted", label: "Trusted by", show: customers.length > 0 },
    { id: "ai-posture", label: "AI Posture", show: aiPosture.length > 0 },
    { id: "controls", label: "Controls", show: controls.length > 0 || policies.length > 0 },
    { id: "resources", label: "Resources", show: documents.length > 0 },
    { id: "infrastructure", label: "Infrastructure", show: hasInfra },
    { id: "subprocessors", label: "Subprocessors", show: subprocessors.length > 0 },
    { id: "updates", label: "Updates", show: updates.length > 0 },
    { id: "faq", label: "FAQ", show: faqs.length > 0 },
  ].filter((n) => n.show);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.5, 1] }
    );
    nav.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.length]);

  const card = cn(
    "rounded-2xl",
    isDark
      ? "bg-white/[0.05] backdrop-blur ring-1 ring-white/10"
      : "bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_36px_-20px_rgba(16,24,40,0.14)]"
  );
  const heading = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-300/80" : "text-slate-500";
  const pageBg = isDark ? "bg-slate-950" : "bg-[#f6f7fb]";
  const tagline = company.tagline || "Security and privacy you can verify";

  return (
    <div className={cn("tc-root relative", isDark && "dark", pageBg)} style={brandVars()}>
      {/* ── Hero banner (layered brand aurora) ───────────────────────── */}
      <div
        className="relative overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(120% 130% at 88% -10%, color-mix(in oklch, var(--primary) 62%, white) 0%, transparent 42%)," +
            "radial-gradient(110% 120% at 8% 115%, color-mix(in oklch, var(--primary) 30%, #00c48d) 0%, transparent 48%)," +
            "linear-gradient(155deg, color-mix(in oklch, var(--primary) 90%, #0c0326) 0%, color-mix(in oklch, var(--primary) 66%, #170b3f) 55%, color-mix(in oklch, var(--primary) 84%, #0c0326) 100%)",
        }}
      >
        {/* soft top sheen + fine grid for depth (not dotty) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(120% 100% at 50% 0%, #000 30%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "color-mix(in oklch, var(--primary) 45%, white)" }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-36 pt-12 sm:px-6 sm:pb-40">
          <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <ShieldCheck className="h-5 w-5" /> {company.name}
          </div>
          <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-[1.1] sm:text-5xl">
            {company.name} Trust Center
          </h1>
          {tagline && (
            <p className="mt-3 max-w-2xl text-lg font-medium text-white/85 sm:text-xl">{tagline}</p>
          )}
        </div>
      </div>

      {/* ── Overlapping intro card ───────────────────────────────────── */}
      {/* relative+z so this positioned card paints ABOVE the positioned banner */}
      <div className="relative z-10 mx-auto -mt-24 w-full max-w-6xl px-4 sm:px-6">
        <div id="overview" className={cn(card, "scroll-mt-24 p-6 sm:p-8")}>
          {hero.lastUpdate && <p className={cn("text-right text-xs", muted)}>Updated {hero.lastUpdate}</p>}
          <div className={cn("max-w-3xl space-y-3 text-sm leading-relaxed sm:text-base", muted)}>
            <p>
              {company.description ||
                `${company.name} treats the security and privacy of customer data as foundational. This Trust Center is a single place for security and procurement teams to review our certifications, controls, infrastructure, and live status.`}
            </p>
            {hero.commitments?.length > 0 && (
              <ul className="flex flex-col gap-1.5 pt-1">
                {hero.commitments.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--tc-accent)" }} strokeWidth={3} />
                    <span className={isDark ? "text-slate-200" : "text-slate-700"}>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Button size="lg" className="rounded-lg text-white shadow-sm" style={{ background: "var(--tc-accent)" }} onClick={() => requestDoc("Security package")}>
              <Lock className="mr-2 h-4 w-4" /> Request access
            </Button>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {contacts?.email && (
                <a href={`mailto:${contacts.email}`} className="font-medium hover:underline" style={{ color: "var(--tc-accent)" }}>Contact us</a>
              )}
              {monitoring?.statusPage && (
                <a href={monitoring.statusPage} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: "var(--tc-accent)" }}>Status</a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ask bar (jump to common questions) ───────────────────────── */}
      {faqs.length > 0 && (
        <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
          <div className={cn(card, "flex flex-wrap items-center gap-3 px-4 py-3")}>
            <a href="#faq" className={cn("flex flex-1 items-center gap-2 text-sm", muted)}>
              <Search className="h-4 w-4" style={{ color: "var(--tc-accent)" }} />
              Search common questions
            </a>
            <div className="flex flex-wrap gap-2">
              {faqs.slice(0, 3).map((f, i) => (
                <a
                  key={i}
                  href="#faq"
                  className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", isDark ? "bg-white/[0.06] hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200/70", muted)}
                >
                  {f.question.length > 42 ? f.question.slice(0, 42) + "…" : f.question}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky nav tabs (pill style) ─────────────────────────────── */}
      <div className={cn("sticky top-0 z-20 mt-6 backdrop-blur", isDark ? "bg-slate-950/75" : "bg-[#f6f7fb]/80")}>
        <nav
          className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Sections"
        >
          {nav.map((n) => {
            const on = active === n.id;
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? ""
                    : cn(muted, isDark ? "hover:bg-white/[0.06] hover:text-white" : "hover:bg-slate-200/60 hover:text-slate-900")
                )}
                style={on ? { background: "var(--tc-accent-tint)", color: "var(--tc-accent)" } : undefined}
              >
                {n.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* ── Two-column content grid ──────────────────────────────────── */}
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2">
        {/* Compliances — list of badge + name + Compliant pill */}
        {compliance.length > 0 && (
          <Panel id="compliances" title="Compliances" card={card} heading={heading} muted={muted}>
            <ul className={cn("divide-y", isDark ? "divide-white/10" : "divide-slate-100")}>
              {compliance.map((item) => {
                // Real badge lockups (.png) embed the cert name — don't repeat it
                // as text. Icon-only discs (.svg) and acronym fallbacks keep the label.
                const resolved = item.badge ?? certLogo(item.name);
                const isLockup = Boolean(resolved && /\.(png|jpe?g|webp)$/i.test(resolved));
                return (
                  <li key={`${item.name}-${item.status}`} className="flex items-center gap-3 py-3">
                    <CertLogo item={item} isDark={isDark} />
                    {!isLockup && <span className={cn("text-sm font-semibold", heading)}>{item.name}</span>}
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <Check className="h-3 w-3" strokeWidth={3} /> {item.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {/* AI Security Posture — 2x2 icon cards */}
        {aiPosture.length > 0 && (
          <Panel id="ai-posture" title="AI Security Posture" card={card} heading={heading} muted={muted}>
            <div className="grid gap-3 sm:grid-cols-2">
              {aiPosture.map((row) => {
                const Icon = postureIcon(row.label);
                return (
                  <div key={row.label} className={cn("flex items-center gap-3 rounded-xl p-4", isDark ? "bg-white/[0.04]" : "bg-slate-50")}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--tc-accent-tint)" }}>
                      <Icon className="h-5 w-5" style={{ color: "var(--tc-accent)" }} />
                    </span>
                    <div className="min-w-0">
                      <div className={cn("text-xs", muted)}>{row.label}</div>
                      <div className={cn("text-sm font-semibold", heading)}>{row.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {/* Trusted by — full width */}
        {customers.length > 0 && (
          <Panel id="trusted" title="Trusted by" card={card} heading={heading} muted={muted} full>
            <div className="flex flex-wrap gap-2">
              {customers.map((c) => (
                <span key={c.name} className={cn("inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium", isDark ? "bg-white/[0.06] text-slate-200" : "bg-slate-100 text-slate-700")}>
                  {c.logo ? <LogoMark src={c.logo} name={c.name} isDark={isDark} /> : null}
                  {c.name}
                </span>
              ))}
            </div>
          </Panel>
        )}

        {/* Controls — grouped, full width */}
        {(controls.length > 0 || policies.length > 0) && (
          <Panel id="controls" title="Controls" card={card} heading={heading} muted={muted} full icon={ListChecks}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {controls.map((group) => (
                <div key={group.category}>
                  <h3 className={cn("mb-2 text-sm font-semibold", heading)}>{group.category}</h3>
                  <ul className="grid gap-1.5">
                    {group.items.map((it) => (
                      <li key={it} className={cn("flex items-center gap-2 text-sm", muted)}>
                        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--tc-accent)" }} strokeWidth={3} /> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {policies.length > 0 && (
                <div>
                  <h3 className={cn("mb-2 text-sm font-semibold", heading)}>Policies</h3>
                  <ul className="grid gap-1.5">
                    {policies.map((p) => (
                      <li key={p.name} className={cn("flex items-center gap-2 text-sm", muted)}>
                        <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--tc-accent)" }} /> {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Panel>
        )}

        {/* Resources (documents) — full width */}
        {documents.length > 0 && (
          <Panel id="resources" title="Resources" card={card} heading={heading} muted={muted} full icon={FileText}>
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.map((doc) => (
                <div key={doc.name} className={cn("flex flex-col gap-2 rounded-xl p-4", isDark ? "bg-white/[0.04]" : "bg-slate-50")}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--tc-accent-tint)" }}>
                        {doc.access === "public" ? <FileCheck2 className="h-4 w-4" style={{ color: "var(--tc-accent)" }} /> : <FileLock2 className="h-4 w-4" style={{ color: "var(--tc-accent)" }} />}
                      </span>
                      <span className={cn("text-sm font-semibold", heading)}>{doc.name}</span>
                    </span>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", doc.access === "public" ? "bg-emerald-100 text-emerald-700" : isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-600")}>
                      {doc.access === "public" ? "Public" : "On request"}
                    </span>
                  </div>
                  <p className={cn("text-xs leading-relaxed", muted)}>{doc.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn("text-[11px]", muted)}>{doc.category}</span>
                    {doc.access === "public" && doc.url ? (
                      <Button asChild size="sm" variant="outline" className="ml-auto h-7 rounded-full text-xs">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"><Download className="mr-1 h-3 w-3" /> Download</a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="ml-auto h-7 rounded-full text-xs" onClick={() => requestDoc(doc.name)}>Request</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Infrastructure */}
        {hasInfra && infra && (
          <Panel id="infrastructure" title="Infrastructure" card={card} heading={heading} muted={muted} icon={Database}>
            <dl className="grid gap-3">
              <InfoRow label="Hosting" value={infra.hosting} muted={muted} heading={heading} />
              <InfoRow label="Encryption" value={infra.encryption} muted={muted} heading={heading} />
              <InfoRow label="Data residency" value={infra.dataResidency?.join(", ")} muted={muted} heading={heading} />
              <InfoRow label="Retention" value={infra.retention} muted={muted} heading={heading} />
              <InfoRow label="Backups" value={infra.backups} muted={muted} heading={heading} />
            </dl>
          </Panel>
        )}

        {/* Subprocessors */}
        {subprocessors.length > 0 && (
          <Panel id="subprocessors" title="Subprocessors" card={card} heading={heading} muted={muted} icon={Sparkles}>
            <ul className="grid gap-3">
              {subprocessors.map((s) => (
                <li key={s.name} className="flex items-center gap-3">
                  <LogoMark src={s.logo} name={s.name} isDark={isDark} />
                  <div className="min-w-0">
                    <p className={cn("truncate text-sm font-medium", heading)}>{s.name}</p>
                    <p className={cn("truncate text-xs", muted)}>{s.category}</p>
                  </div>
                  <span className={cn("ml-auto shrink-0 text-xs", muted)}>{s.location}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {/* Updates */}
        {updates.length > 0 && (
          <Panel id="updates" title="Updates" card={card} heading={heading} muted={muted} icon={Clock}>
            <ol className="grid gap-4">
              {updates.map((u) => (
                <li key={u.title} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full" style={{ background: "var(--tc-accent)" }} />
                  <p className={cn("text-xs font-medium", muted)}>{u.date}</p>
                  <p className={cn("text-sm font-semibold", heading)}>{u.title}</p>
                  <p className={cn("text-sm", muted)}>{u.summary}</p>
                </li>
              ))}
            </ol>
          </Panel>
        )}

        {/* FAQ — full width */}
        {faqs.length > 0 && (
          <Panel id="faq" title="FAQ" card={card} heading={heading} muted={muted} full icon={FileText}>
            <Accordion type="single" collapsible>
              {faqs.map((f, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className={cn("text-sm", heading)}>{f.question}</AccordionTrigger>
                  <AccordionContent className={cn("text-sm", muted)}>{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Panel>
        )}

        {/* Contact band — full width */}
        {contacts?.email && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-6 text-white shadow-md lg:col-span-2" style={{ background: "linear-gradient(120deg, color-mix(in oklch, var(--primary) 78%, #140a2e), var(--tc-accent))" }}>
            <div>
              <p className="text-lg font-semibold">Security or procurement questions?</p>
              <p className="text-sm text-white/80">We respond within {contacts.sla}{contacts.officeHours ? ` · ${contacts.officeHours}` : ""}.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <a href={`mailto:${contacts.email}`}><Mail className="mr-2 h-4 w-4" /> {contacts.email}</a>
            </Button>
          </section>
        )}
      </div>

      <footer className={cn("mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t px-4 py-6 text-sm sm:px-6", isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500")}>
        <span>{footer}</span>
        <Link href="/login" className="transition-colors hover:text-[color:var(--tc-accent)]">Sign in to admin</Link>
      </footer>

      <RequestDocumentDialog open={dialogOpen} onOpenChange={setDialogOpen} documentName={selectedDocument} companyName={company.name} />
    </div>
  );
}

function brandVars(): React.CSSProperties {
  return {
    "--tc-accent": "var(--primary)",
    "--tc-accent-soft": "color-mix(in oklch, var(--primary) 14%, transparent)",
    "--tc-accent-tint": "color-mix(in oklch, var(--primary) 8%, transparent)",
  } as React.CSSProperties;
}

/** A titled content panel. */
function Panel({
  id,
  title,
  icon: Icon,
  card,
  heading,
  full,
  children,
}: {
  id: string;
  title: string;
  icon?: LucideIcon;
  card: string;
  heading: string;
  muted: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn(card, "scroll-mt-20 p-6", full && "lg:col-span-2")}>
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" style={{ color: "var(--tc-accent)" }} />}
        <h2 className={cn("text-lg font-semibold", heading)}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** Compliance-row badge: official-style logo with a shield/acronym fallback. */
function CertLogo({ item, isDark }: { item: { name: string; badge?: string }; isDark: boolean }) {
  const [failed, setFailed] = useState(false);
  const logo = item.badge ?? certLogo(item.name);
  if (logo && !failed) {
    // Real cert badges are landscape lockups (SOC 2 / GDPR / HIPAA) or square
    // seals (ISO) — size by height and let width follow the mark's aspect.
    return (
      <span className="flex h-11 shrink-0 items-center justify-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={`${item.name} badge`} className="h-11 w-auto max-w-[150px] object-contain object-left" loading="lazy" onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--tc-accent-tint)" }}>
      <span className="text-[9px] font-extrabold uppercase leading-none" style={{ color: "var(--tc-accent)" }}>{certShort(item.name)}</span>
    </span>
  );
}

/** Subprocessor / customer logo with an accent-tinted monogram fallback. */
function LogoMark({ src, name, isDark }: { src?: string; name: string; isDark: boolean }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const box = cn("flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg", isDark ? "bg-white/[0.08]" : "bg-slate-100");
  if (src && !failed) {
    return (
      <span className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${name} logo`} className="h-6 w-6 object-contain" loading="lazy" onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={box} style={{ background: "var(--tc-accent-tint)" }}>
      <span className="text-xs font-bold" style={{ color: "var(--tc-accent)" }}>{initials}</span>
    </span>
  );
}

function InfoRow({ label, value, muted, heading }: { label: string; value?: string; muted: string; heading: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className={cn("w-32 shrink-0 text-xs font-semibold uppercase tracking-wide", muted)}>{label}</dt>
      <dd className={cn("text-sm", heading)}>{value}</dd>
    </div>
  );
}
