import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { INVESTOR } from "@/lib/data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings · VibeCheck" }],
  }),
  component: SettingsPage,
});

/* The fund thesis is live data (laura/pipeline/thesis.json) served and
 * updated via GET/POST /thesis — the Thesis Engine, not decoration. */
type ThesisDoc = {
  fund: {
    sectors: string[];
    stages: string[];
    geographies: string[];
    checkSizeUsd: { min: number; max: number };
    targetOwnership: number;
    riskAppetite: string;
    maxOpenGaps: number;
  };
} & Record<string, unknown>;

const money = (n: number) => (n >= 1e6 ? `$${n / 1e6}M` : `$${Math.round(n / 1e3)}K`);

/* Honest status only — AGENTS.md §26/§34 prohibit claiming a capability
 * that isn't actually implemented. "Built" means real code runs today;
 * "Planned" means it's discussed (e.g. sun/system-architecture.md) but no
 * code exists yet. Verified against the repo 2026-07-20 — update this list
 * in the same change as the code, not after. */
const AGENTS = [
  { n: "Kestrel", r: "Founder interviews", status: "Built", note: "laura/pipeline/lib/interview-agent.js — ElevenLabs, gated by /integrations" },
  { n: "Checky", r: "Evidence-grounded Q&A", status: "Built", note: "laura/pipeline/lib/assistant.js — retrieval over the opportunity DB" },
  { n: "Screening + diligence checks", r: "Thesis screen, corroboration, floors", status: "Built", note: "deterministic — laura/pipeline/lib/screening.js, corroborate.js (not an LLM \"agent\")" },
  { n: "Reference calls (warm or cold)", r: "Reference & background checks", status: "Planned", note: "no code yet — see sun/system-architecture.md §7" },
  { n: "Deck & data-room extraction", r: "OCR / document parsing", status: "Planned", note: "no code yet — see sun/tech-video-staging/tech-spec.md §3.5" },
];

export function SettingsPage() {
  const [thesis, setThesis] = useState<ThesisDoc | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/thesis").then((r) => r.json()).then(setThesis).catch(() => {});
  }, []);

  function startEdit() {
    if (!thesis) return;
    setDraft({
      sectors: thesis.fund.sectors.join(", "),
      stages: thesis.fund.stages.join(", "),
      geographies: thesis.fund.geographies.join(", "),
      checkMin: String(thesis.fund.checkSizeUsd.min),
      checkMax: String(thesis.fund.checkSizeUsd.max),
      ownership: String(thesis.fund.targetOwnership),
      risk: thesis.fund.riskAppetite,
      maxGaps: String(thesis.fund.maxOpenGaps),
    });
    setEditing(true);
  }

  async function save() {
    if (!thesis) return;
    const next: ThesisDoc = {
      ...thesis,
      fund: {
        ...thesis.fund,
        sectors: draft.sectors.split(",").map((s) => s.trim()).filter(Boolean),
        stages: draft.stages.split(",").map((s) => s.trim()).filter(Boolean),
        geographies: draft.geographies.split(",").map((s) => s.trim()).filter(Boolean),
        checkSizeUsd: { min: Number(draft.checkMin) || 0, max: Number(draft.checkMax) || 0 },
        targetOwnership: Number(draft.ownership) || 0,
        riskAppetite: draft.risk,
        maxOpenGaps: Number(draft.maxGaps) || 0,
      },
    };
    const res = await fetch("/thesis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next, null, 2),
    });
    if (res.ok) {
      setThesis(next);
      setEditing(false);
      setSaved("Saved — screening and scoring now use the updated lens.");
      setTimeout(() => setSaved(null), 4000);
    } else {
      setSaved("Save failed — is the dev server running?");
    }
  }

  const thesisRows = thesis
    ? [
        { k: "Sectors", v: thesis.fund.sectors.join(" · ") },
        { k: "Stages", v: `${thesis.fund.stages.join(" · ")} · check ${money(thesis.fund.checkSizeUsd.min)} – ${money(thesis.fund.checkSizeUsd.max)}` },
        { k: "Geography", v: thesis.fund.geographies.join(" · ") },
        { k: "Ownership", v: `${Math.round(thesis.fund.targetOwnership * 100)}% target` },
        { k: "Risk appetite", v: `${thesis.fund.riskAppetite} · max ${thesis.fund.maxOpenGaps} open gaps at decision` },
      ]
    : [{ k: "Loading", v: "reading thesis.json via /thesis…" }];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Fund configuration"
        title="Settings"
        description="Thesis, screening rubric, AI agent roster, and team access. Changes propagate to every open application immediately."
      />

      <div className="px-8 py-6 grid lg:grid-cols-2 gap-4">
        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <span className="text-[13px] font-medium">Fund thesis</span>
            <Badge tone="teal">live · THESIS-001</Badge>
          </div>
          {!editing ? (
            <div className="divide-y divide-border">
              {thesisRows.map((t) => (
                <div key={t.k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground pt-0.5">{t.k}</div>
                  <div className="text-[12.5px]">{t.v}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {(
                [
                  ["sectors", "Sectors (comma-separated)"],
                  ["stages", "Stages (comma-separated)"],
                  ["geographies", "Geographies (comma-separated)"],
                  ["checkMin", "Check size min (USD)"],
                  ["checkMax", "Check size max (USD)"],
                  ["ownership", "Ownership target (0–1)"],
                  ["risk", "Risk appetite"],
                  ["maxGaps", "Max open gaps at decision"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
                  <input
                    value={draft[key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] outline-none focus:border-ring"
                  />
                </label>
              ))}
            </div>
          )}
          <div className="border-t border-border p-4 flex items-center justify-end gap-3">
            {saved && <span className="text-[11.5px] text-positive">{saved}</span>}
            {!editing ? (
              <button onClick={startEdit} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]">
                Edit thesis
              </button>
            ) : (
              <>
                <button onClick={() => setEditing(false)} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]">
                  Cancel
                </button>
                <button onClick={save} className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">
                  Save thesis
                </button>
              </>
            )}
          </div>
        </Card>

        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium">Screening rubric weights</div>
          <div className="p-5 space-y-4">
            {[
              ["Founder score", 35],
              ["Market score", 25],
              ["Idea ↔ Market fit", 25],
              ["Trust score (evidence density)", 15],
            ].map(([label, w]) => (
              <div key={label as string} className="flex items-center gap-4">
                <div className="w-56 text-[12.5px]">{label}</div>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${w as number}%` }} />
                </div>
                <div className="w-10 text-right text-[12px] font-mono tabular-nums">{w}%</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 lg:col-span-2">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="text-[13px] font-medium">AI agent roster</div>
            <Badge tone="teal">{AGENTS.filter((a) => a.status === "Built").length} built · {AGENTS.filter((a) => a.status === "Planned").length} planned</Badge>
          </div>
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface border-b border-border text-muted-foreground">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Agent / capability</th>
                <th className="px-3 py-2.5 font-medium">Role</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Backed by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {AGENTS.map((a) => (
                <tr key={a.n}>
                  <td className="px-5 py-2.5 font-medium">{a.n}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.r}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={a.status === "Built" ? "positive" : "teal"}>{a.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium">Team</div>
          <div className="divide-y divide-border">
            {[
              [INVESTOR.name, INVESTOR.role, INVESTOR.initials],
              ["Henrik Aalto", "Partner · Diligence", "HA"],
              ["Sofia Marín", "Principal", "SM"],
              ["David Kim", "Analyst", "DK"],
            ].map(([n, r, i]) => (
              <div key={n} className="flex items-center gap-3 px-5 py-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-medium">{i}</div>
                <div className="flex-1">
                  <div className="text-[12.5px] font-medium">{n}</div>
                  <div className="text-[11px] text-muted-foreground">{r}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium">Integrations</div>
          <div className="divide-y divide-border">
            {[
              ["Affinity CRM", "Connected", "positive"],
              ["Docsend / DealRoom", "Connected", "positive"],
              ["Google Workspace", "Connected", "positive"],
              ["Slack (deal-flow channel)", "Connected", "positive"],
              ["Bloomberg Terminal API", "Not connected", "outline"],
            ].map(([n, s, tone]) => (
              <div key={n} className="flex items-center justify-between px-5 py-3">
                <div className="text-[12.5px]">{n}</div>
                <Badge tone={tone as never}>{s}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
