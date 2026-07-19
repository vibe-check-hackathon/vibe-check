import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings · VibeCheck" }],
  }),
  component: SettingsPage,
});

const THESIS = [
  { k: "Sectors", v: "Climate hard-tech · Vertical SaaS · Applied AI infra · Fintech" },
  { k: "Stages", v: "Pre-seed → Series A · check size €500K – €5M" },
  { k: "Geography", v: "DACH · Benelux · Nordics · UK · France" },
  { k: "Risk appetite", v: "Technical risk yes · regulatory risk selective · consumer risk no" },
];

const AGENTS = [
  { n: "Kestrel v3", r: "Founder interviews", status: "Active", model: "GPT-5.2 + ElevenLabs" },
  { n: "Harrier v2", r: "Reference calls (warm)", status: "Active", model: "Claude 4.5 + ElevenLabs" },
  { n: "Osprey v1", r: "Reference calls (cold outreach)", status: "Beta", model: "GPT-5.2 + Twilio" },
  { n: "Sable", r: "Deck & data-room extraction", status: "Active", model: "GPT-5.2-vision" },
  { n: "Corvus", r: "Diligence orchestrator", status: "Active", model: "In-house router" },
];

export function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Fund configuration"
        title="Settings"
        description="Thesis, screening rubric, AI agent roster, and team access. Changes propagate to every open application immediately."
      />

      <div className="px-8 py-6 grid lg:grid-cols-2 gap-4">
        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium">Fund thesis</div>
          <div className="divide-y divide-border">
            {THESIS.map((t) => (
              <div key={t.k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground pt-0.5">{t.k}</div>
                <div className="text-[12.5px]">{t.v}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4 flex justify-end">
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]">Edit thesis</button>
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
            <Badge tone="teal">5 active · 1 beta</Badge>
          </div>
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface border-b border-border text-muted-foreground">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Agent</th>
                <th className="px-3 py-2.5 font-medium">Role</th>
                <th className="px-3 py-2.5 font-medium">Model stack</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium text-right">Calls · 7d</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {AGENTS.map((a, i) => (
                <tr key={a.n}>
                  <td className="px-5 py-2.5 font-medium">{a.n}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.r}</td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-muted-foreground">{a.model}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={a.status === "Active" ? "positive" : "teal"}>{a.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{[142, 96, 34, 218, 47][i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium">Team</div>
          <div className="divide-y divide-border">
            {[
              ["Marlene Krüger", "Partner · Screening lead", "MK"],
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
