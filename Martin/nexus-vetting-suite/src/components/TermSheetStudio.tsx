import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui-kit";
import { FileText, Sparkles, RefreshCw } from "lucide-react";

/*
 * Annotated term sheet (Due Diligence stage): the thesis base terms adapted
 * live by the team analysis via POST /term-sheet. Left: an editable markdown
 * editor (annotate freely, stable TS-§n anchors). Right: real-time suggestions
 * — why each term changed during the discussion and what information the
 * system used. Export PDF prints the BEFORE (base thesis terms) or AFTER
 * (negotiated/adapted) version via the browser's print-to-PDF.
 */

type Adjustment = { term: string; from: unknown; to: unknown; because: string; evidence: string };
type TermSheetResult = {
  status: string;
  summary?: string;
  markdown: string;
  legalText?: string;
  adjustments: Adjustment[];
  base: Record<string, unknown>;
  terms: Record<string, unknown> | null;
};

/** The FirstCheck founders the lawyer-form sheet addresses. Post-meeting
 *  scores are STAGED for the demo (see TS-001-firstcheck-meeting-adjustments):
 *  Mehdi deliberately played the disengaged founder. */
const FOUNDERS = [
  { name: "Martin Auer", role: "Co-founder" },
  { name: "Sun Chuanqi", role: "Co-founder" },
  { name: "Laura Spies", role: "Co-founder" },
  { name: "Mehdi", role: "Co-founder" },
];

const fmt = (v: unknown) => (v == null ? "—" : typeof v === "object" ? "structured" : String(v));

function printMarkdown(title: string, markdown: string) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  w.document.write(
    `<title>${title}</title><style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;color:#111827}pre{white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.55}</style><pre>${markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`,
  );
  w.document.close();
  w.focus();
  w.print();
}

export function TermSheetStudio({ company = "FirstCheck", askUsd = 1200000 }: { company?: string; askUsd?: number }) {
  const [founderScore, setFounderScore] = useState(76);
  const [confidence, setConfidence] = useState(55);
  const [trust, setTrust] = useState(92);
  const [withContradiction, setWithContradiction] = useState(true);
  const [result, setResult] = useState<TermSheetResult | null>(null);
  const [md, setMd] = useState("");
  const [busy, setBusy] = useState(false);

  async function regenerate() {
    setBusy(true);
    try {
      const res = await fetch("/term-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          askUsd,
          founderScore,
          founderScoreConfidence: confidence,
          trustScore: trust,
          contradictions: withContradiction ? ["ARR stated as both $120K and $80K (CON-001)"] : [],
          gaps: ["model-IP assignment (GAP-002)", "customer data rights (GAP-003)"],
          founders: FOUNDERS,
        }),
      });
      const data = (await res.json()) as TermSheetResult;
      setResult(data);
      setMd(data.markdown);
    } catch {
      setMd("Could not reach /term-sheet — is the dev server running?");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [founderScore, confidence, trust, withContradiction]);

  const beforeMd = result
    ? `# Term sheet — ${company} (BEFORE negotiation: thesis base terms)\n\n` +
      Object.entries(result.base)
        .map(([k, v]) => `- **${k}**: ${fmt(v)}`)
        .join("\n") +
      "\n\n_Base terms before any team-analysis adaptation. Human approval required._\n"
    : "";

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-primary" />
        <div className="text-[13px] font-medium">Annotated term sheet — adapts live to the team analysis</div>
        <Badge tone="teal">{result?.status ?? "…"}</Badge>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => beforeMd && printMarkdown(`${company} term sheet — before negotiation`, beforeMd)}
            className="h-7 rounded-md border border-border bg-surface px-2.5 text-[11.5px]"
          >
            Export PDF · before
          </button>
          <button
            onClick={() => md && printMarkdown(`${company} term sheet — after negotiation`, md)}
            className="h-7 rounded-md bg-primary px-2.5 text-[11.5px] font-medium text-primary-foreground"
          >
            Export PDF · after
          </button>
          <button
            onClick={() => result?.legalText && printMarkdown(`${company} — memorandum of terms (long form)`, result.legalText)}
            className="h-7 rounded-md border border-border bg-surface px-2.5 text-[11.5px]"
            title="Lawyer-form memorandum of terms addressed to the founders, with the analytical basis disclosed"
          >
            Export PDF · legal
          </button>
        </div>
      </div>

      {/* Analysis controls: move them mid-discussion, terms follow instantly. */}
      <div className="grid gap-3 border-b border-border bg-surface px-5 py-3 md:grid-cols-4">
        {(
          [
            ["Founder score", founderScore, setFounderScore],
            ["Score confidence", confidence, setConfidence],
            ["Trust score", trust, setTrust],
          ] as const
        ).map(([label, value, set]) => (
          <label key={label} className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label} · <span className="font-mono text-foreground">{value}</span>
            <input type="range" min={0} max={100} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
          </label>
        ))}
        <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <input type="checkbox" checked={withContradiction} onChange={(e) => setWithContradiction(e.target.checked)} />
          ARR contradiction open (CON-001)
        </label>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px]">
        {/* Markdown editor — annotate freely; TS-§n anchors stay stable. */}
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          spellCheck={false}
          className="min-h-[420px] w-full resize-y border-r border-border bg-card p-4 font-mono text-[12px] leading-relaxed outline-none"
        />
        {/* Real-time suggestions: why each term moved, and on what information. */}
        <div className="max-h-[420px] space-y-2.5 overflow-y-auto p-4">
          <div className="flex items-center gap-1.5 text-[12.5px] font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Why the terms changed {busy && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          {(result?.adjustments ?? []).map((a, i) => (
            <div key={i} className="rounded-md border border-border p-2.5 text-[11.5px] leading-relaxed">
              <div className="font-medium">
                {a.term}: <span className="font-mono">{fmt(a.from)}</span> → <span className="font-mono text-primary">{fmt(a.to)}</span>
              </div>
              <div className="mt-1 text-muted-foreground">{a.because}</div>
              <div className="mt-1 text-[10.5px] text-muted-foreground">
                <b>Information used:</b> {a.evidence}
              </div>
            </div>
          ))}
          {result && !result.adjustments.length && (
            <div className="text-[12px] text-muted-foreground">No adjustments — the base thesis terms stand.</div>
          )}
          <p className="border-t border-border pt-2 text-[10.5px] text-muted-foreground">
            Deterministic: same analysis, same terms. Human investor + counsel approval is mandatory before anything
            goes founder-facing.
          </p>
        </div>
      </div>
    </Card>
  );
}
