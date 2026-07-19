import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Badge } from "@/components/ui-kit";
import { AlertTriangle, CheckCircle2, ExternalLink, Plus, Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/apply")({
  head: () => ({ meta: [{ title: "Apply · VibeCheck" }] }),
  component: ApplyPage,
});

/* Alternative channel: a Google Form showing the same criteria + consent
 * language, feeding the same inbox. Create it and paste the URL here. */
const GOOGLE_FORM_URL = "https://forms.gle/REPLACE-WITH-REAL-FORM";

type Verdict = { id: string; pass: boolean; hardFails: string[]; softFlags: string[] };
type ThesisDoc = {
  fund: { sectors: string[]; stages: string[]; geographies: string[]; checkSizeUsd: { min: number; max: number } };
};

type FounderInput = {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  github: string;
};

const COMPANY_FIELDS = [
  ["company", "Company name *", "FirstCheck"],
  ["deck", "Pitch deck URL *", "https://drive.example/deck.pdf"],
  ["website", "Company website", "https://acme-robotics.example"],
  ["oneLiner", "One-line pitch", "What you do, in one sentence"],
  ["sector", "Sector", "AI infrastructure"],
  ["geography", "Location", "Berlin, DE"],
  ["raiseUsd", "Target raise, USD", "1200000"],
  ["problem", "Problem", "What painful workflow are you replacing?"],
  ["market", "Market", "Who buys and why now?"],
  ["businessModel", "Business model", "SaaS, usage, marketplace, hardware margin..."],
  ["technology", "Technology / moat", "What is technically hard or differentiated?"],
  ["traction", "Traction", "Revenue, pilots, users, LOIs, waitlist, usage..."],
  ["productDemo", "Product demo URL", "https://..."],
] as const;

const emptyFounder = (role = "CEO"): FounderInput => ({
  name: "",
  role,
  email: "",
  linkedin: "",
  github: "",
});

function ApplyPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [founders, setFounders] = useState<FounderInput[]>([emptyFounder("CEO"), emptyFounder("CTO")]);
  const [round, setRound] = useState("Pre-seed");
  const [consentResearch, setConsentResearch] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [thesis, setThesis] = useState<ThesisDoc | null>(null);

  useEffect(() => {
    fetch("/thesis").then((r) => r.json()).then(setThesis).catch(() => {});
  }, []);

  async function submit() {
    const cleanFounders = founders
      .map((f) => ({ ...f, name: f.name.trim(), linkedin: f.linkedin.trim() }))
      .filter((f) => f.name || f.email || f.linkedin || f.github);
    if (!form.company?.trim() || !form.deck?.trim()) {
      setError("company and deck are required");
      return;
    }
    if (!cleanFounders.length) {
      setError("add at least one founder or co-founder");
      return;
    }
    if (cleanFounders.some((f) => !f.name || !f.linkedin)) {
      setError("each founder needs a name and LinkedIn URL/search link");
      return;
    }
    if (!consentResearch) {
      setError("research consent is required — we only enrich what you allow");
      return;
    }
    setBusy(true);
    setError(null);
    setVerdict(null);
    try {
      const res = await fetch("/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          founders: cleanFounders,
          round,
          stage: round,
          permissions: { "public research": "granted", "interview recording": "pending", "reference calls": "pending" },
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "submission failed");
      else setVerdict(data as Verdict);
    } catch {
      setError("could not reach the screening service");
    } finally {
      setBusy(false);
    }
  }

  const money = (n: number) => (n >= 1e6 ? `$${n / 1e6}M` : `$${Math.round(n / 1e3)}K`);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="text-[15px] font-semibold">
          VibeCheck <span className="text-muted-foreground font-normal">· founder application</span>
        </div>
        <Link to={"/login" as never} className="text-[12px] text-muted-foreground hover:text-foreground">
          Investor login →
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">Apply for funding</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Deck + company name is the minimum bar. You get an honest first answer immediately, and a full
              decision within 24 hours of a complete application.
            </p>
          </div>

          <Card className="p-5 space-y-3">
            {COMPANY_FIELDS.map(([key, label, placeholder]) => (
              <label key={key} className="block">
                <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
                <input
                  value={form[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-ring"
                />
              </label>
            ))}
            <label className="block">
              <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Current round</div>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-ring"
              >
                {["Pre-seed", "Seed", "Series A", "Series B", "Series C or later"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Founders and co-founders *
                </div>
                <button
                  onClick={() => setFounders([...founders, emptyFounder("Co-founder")])}
                  className="h-7 rounded-md border border-border bg-surface px-2 text-[11px] flex items-center gap-1.5"
                  type="button"
                >
                  <Plus className="h-3 w-3" /> Add co-founder
                </button>
              </div>
              {founders.map((founder, index) => (
                <div key={index} className="rounded-md border border-border bg-surface p-3">
                  <div className="grid md:grid-cols-2 gap-2">
                    <FounderField
                      label="Name *"
                      value={founder.name}
                      placeholder="Ada Keller"
                      onChange={(value) => setFounders(founders.map((f, i) => i === index ? { ...f, name: value } : f))}
                    />
                    <FounderField
                      label="Role"
                      value={founder.role}
                      placeholder="CEO / CTO / Co-founder"
                      onChange={(value) => setFounders(founders.map((f, i) => i === index ? { ...f, role: value } : f))}
                    />
                    <FounderField
                      label="Email"
                      value={founder.email}
                      placeholder="ada@company.com"
                      onChange={(value) => setFounders(founders.map((f, i) => i === index ? { ...f, email: value } : f))}
                    />
                    <FounderField
                      label="LinkedIn *"
                      value={founder.linkedin}
                      placeholder="https://www.linkedin.com/in/..."
                      onChange={(value) => setFounders(founders.map((f, i) => i === index ? { ...f, linkedin: value } : f))}
                    />
                    <div className="md:col-span-2">
                      <FounderField
                        label="GitHub / personal site"
                        value={founder.github}
                        placeholder="https://github.com/... or https://..."
                        onChange={(value) => setFounders(founders.map((f, i) => i === index ? { ...f, github: value } : f))}
                      />
                    </div>
                  </div>
                  {founders.length > 1 && (
                    <button
                      onClick={() => setFounders(founders.filter((_, i) => i !== index))}
                      className="mt-2 h-7 rounded-md border border-border bg-card px-2 text-[11px] text-muted-foreground flex items-center gap-1.5"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <label className="flex items-start gap-2 pt-1 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={consentResearch}
                onChange={(e) => setConsentResearch(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I consent to research of the <b>public links I provide</b> (website, LinkedIn, GitHub) for this
                application. Interview recording and reference calls are separate consents, asked later. *
              </span>
            </label>
            <div className="flex items-center justify-end gap-3 pt-1">
              {error && <span className="text-[12px] text-negative">{error}</span>}
              <button
                onClick={submit}
                disabled={busy}
                className="h-9 rounded-md bg-primary px-4 text-[12.5px] font-medium text-primary-foreground flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" /> {busy ? "Screening…" : "Submit application"}
              </button>
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between gap-3">
            <div className="text-[12.5px] text-muted-foreground">
              Prefer a form? The Google Form shows the same criteria and consent language and feeds the same inbox.
            </div>
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Google Form
            </a>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-medium">What we invest in</div>
              <Badge tone="teal">live criteria</Badge>
            </div>
            {thesis ? (
              <div className="mt-2 space-y-2 text-[12.5px]">
                <div><span className="text-muted-foreground">Sectors · </span>{thesis.fund.sectors.join(", ")}</div>
                <div><span className="text-muted-foreground">Stages · </span>{thesis.fund.stages.join(", ")}</div>
                <div><span className="text-muted-foreground">Geography · </span>{thesis.fund.geographies.join(", ")}</div>
                <div>
                  <span className="text-muted-foreground">First check · </span>
                  {money(thesis.fund.checkSizeUsd.min)} – {money(thesis.fund.checkSizeUsd.max)}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[12px] text-muted-foreground">loading…</div>
            )}
            <p className="mt-3 border-t border-border pt-2 text-[11.5px] leading-relaxed text-muted-foreground">
              If you're outside these criteria you'll get an immediate, honest no with reasons — we'd rather
              save you three weeks than waste them.
            </p>
          </Card>

          {verdict && (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                {verdict.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-positive" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-negative" />
                )}
                <span className="text-[13.5px] font-medium">
                  {verdict.pass ? "Passed first-pass screening" : "Screened out"}
                </span>
                <Badge tone="outline">{verdict.id}</Badge>
              </div>
              {verdict.pass ? (
                <p className="mt-2 text-[12.5px] text-muted-foreground">
                  Your application entered the research funnel. We only research the links you provided; expect a
                  decision within 24 hours.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-[12.5px] text-negative">
                  {verdict.hardFails.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              )}
              {verdict.softFlags.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-border pt-2 text-[12px] text-muted-foreground">
                  {verdict.softFlags.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function FounderField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-ring"
      />
    </label>
  );
}
