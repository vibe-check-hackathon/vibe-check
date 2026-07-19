import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";

export const Route = createFileRoute("/apply")({
  head: () => ({ meta: [{ title: "Apply · VibeCheck" }] }),
  component: ApplyPage,
});

type Verdict = { id: string; pass: boolean; hardFails: string[]; softFlags: string[] };

const FIELDS = [
  ["company", "Company name *", "Acme Robotics"],
  ["deck", "Pitch deck URL *", "https://drive.example/deck.pdf"],
  ["oneLiner", "One-line pitch", "What you do, in one sentence"],
  ["sector", "Sector", "AI infrastructure"],
  ["geography", "Location", "Berlin, DE"],
  ["ask", "Raise", "$1.2M pre-seed"],
  ["founderName", "Founder name", "Ada Example"],
  ["founderEmail", "Founder email", "ada@company.example"],
] as const;

function ApplyPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [round, setRound] = useState("Pre-seed");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    setVerdict(null);
    try {
      const res = await fetch("/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, round, stage: round }),
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

  return (
    <AppShell>
      <PageHeader
        eyebrow="Inbound"
        title="Apply for funding"
        description="Deck + company name is the minimum bar. Your application is screened against the fund thesis immediately — a clear answer beats a slow one."
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 space-y-3">
          {FIELDS.map(([key, label, placeholder]) => (
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

        <div className="space-y-4">
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
                  Your application entered the research funnel. Evidence gathering starts now; expect a decision
                  within 24 hours.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-[12.5px] text-negative">
                  {verdict.hardFails.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              )}
              {verdict.softFlags.length > 0 && (
                <div className="mt-3 border-t border-border pt-2">
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-1">
                    Flags for the research pass
                  </div>
                  <ul className="space-y-1 text-[12px] text-muted-foreground">
                    {verdict.softFlags.map((f) => (
                      <li key={f}>· {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
          <Card className="p-5">
            <div className="text-[13px] font-medium">How screening works</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              The first pass applies the fund thesis (THESIS-001): entry stage, check-size fit, and sector focus.
              Hard mismatches get an immediate, honest no with reasons. Everything else moves to evidence-backed
              research — claims sourced and trust-scored, never guessed.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
