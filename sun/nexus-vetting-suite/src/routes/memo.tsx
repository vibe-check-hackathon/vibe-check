import { AppShell } from "@/components/AppShell";
import { Badge, Card, PageHeader, ScoreBar } from "@/components/ui-kit";
import { applicationToStartup, useSubmittedApplications } from "@/lib/applications";
import { ACME_FOUNDERS, STARTUPS, outcomeOf, type Startup } from "@/lib/data";
import { loadSyntheticStartups } from "@/lib/synthetic-opportunities";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink, FileText, Lock, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export const Route = createFileRoute("/memo")({
  validateSearch: (s: Record<string, unknown>) => ({
    deal: typeof s.deal === "string" ? s.deal : undefined,
  }),
  head: () => ({
    meta: [{ title: "Decision Memo · VibeCheck" }],
  }),
  component: MemoPage,
});

function Source({ id, hint }: { id: string; hint: string }) {
  return (
    <sup className="ml-0.5">
      <a
        href="#evidence"
        className="text-primary hover:underline text-[10px] font-mono"
        title={hint}
      >
        [{id}]
      </a>
    </sup>
  );
}

export function MemoPage() {
  const { deal } = Route.useSearch();
  const navigate = useNavigate();
  const [synthetic, setSynthetic] = useState<Startup[]>([]);
  const submitted = useSubmittedApplications();
  useEffect(() => {
    loadSyntheticStartups()
      .then(setSynthetic)
      .catch(() => {});
  }, []);

  // Every deal the board knows gets a memo filled from its actual data;
  // the polished FirstCheck walkthrough stays as the default showcase.
  const all = [...STARTUPS, ...synthetic, ...submitted.map(applicationToStartup)];
  const selected = deal ? all.find((s) => s.id === deal) : undefined;

  const picker = (
    <select
      value={selected?.id ?? "firstcheck-demo"}
      onChange={(e) =>
        navigate({
          to: "/memo" as never,
          search: (e.target.value === "firstcheck-demo" ? {} : { deal: e.target.value }) as never,
        })
      }
      className="h-8 max-w-[220px] rounded-md border border-border bg-card px-2 text-[12px] outline-none"
      title="Generate the memo for any deal on the board"
    >
      <option value="firstcheck-demo">FirstCheck (demo memo)</option>
      {all.map((s) => (
        <option key={s.id} value={s.id}>
          {s.company}
        </option>
      ))}
    </select>
  );

  if (selected) {
    return <DealMemo s={selected} picker={picker} />;
  }

  return (
    <AppShell>
      <PageHeader
        crumbs={["Decision Memo", "FirstCheck", "v3 · draft"]}
        eyebrow="Investment memorandum"
        title="FirstCheck · Pre-seed · $1.2M"
        description="Generated from 14 evidence sources, 4 references, and 1 four-founder interview. Every claim links to its evidence."
        actions={
          <>
            {picker}
            <Badge tone="teal">Confidence 84</Badge>
            <button
              onClick={() => window.print()}
              className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">
              Send to IC
            </button>
          </>
        }
      />

      <div className="px-8 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <article className="max-w-3xl space-y-8">
          {/* Snapshot */}
          <section>
            <SectionTitle n="01" title="Company snapshot" />
            <Card className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                <Snap label="Sector" value="AI / Venture infrastructure" />
                <Snap label="Stage · Ask" value="Pre-seed · $1.2M" />
                <Snap label="Geo · Founded" value="Berlin · 2026" />
                <Snap label="Round lead" value="MIG Ventures III" />
              </div>
              <div className="border-t border-border p-5 text-[13.5px] leading-relaxed text-foreground/90">
                FirstCheck replaces the analyst hours a fund spends turning an inbound application
                into a first-check decision. An application enters, the pipeline sources and
                corroborates every claim with a trust score, an agent interview tests the open
                hypotheses live, and a human investor approves at the gate — memo out in 48 hours
                with the evidence attached to each line
                <Source id="1" hint="Deck v3.2 · slide 8" />.
              </div>
            </Card>
          </section>

          {/* Hypotheses */}
          <section>
            <SectionTitle n="02" title="Investment hypotheses" />
            <ol className="space-y-3">
              <Hypothesis
                n="H1"
                text="Funds will accept an agent-run first interview when every claim stays traceable to its source and the human keeps the approval gate."
                conf={74}
              />
              <Hypothesis
                n="H2"
                text="The thesis lens generalises: a second fund is a config change, not a second rule set."
                conf={58}
              />
              <Hypothesis
                n="H3"
                text="Evidence provenance — founder-claimed vs corroborated — is the durable moat, because it is what a fund cannot safely skip."
                conf={81}
              />
            </ol>
          </section>

          {/* SWOT */}
          <section>
            <SectionTitle n="03" title="SWOT" />
            <div className="grid md:grid-cols-2 gap-3">
              <SwotCard
                title="Strengths"
                tone="positive"
                items={[
                  "Working end-to-end pipeline, not a mock",
                  "Four complementary founders, conflict aired in-call",
                  "Every claim carries a source and trust score",
                ]}
              />
              <SwotCard
                title="Weaknesses"
                tone="warning"
                items={[
                  "Deck overstated time-to-memo (24h vs 48h)",
                  "Screening still deterministic, not scored",
                  "No paying fund yet — two pilots pending",
                ]}
              />
              <SwotCard
                title="Opportunities"
                tone="teal"
                items={[
                  "Seed-stage deal volume rising faster than analyst headcount",
                  "Opportunity DB reusable across funds",
                  "Interview transcript becomes proprietary training data",
                ]}
              />
              <SwotCard
                title="Threats"
                tone="negative"
                items={[
                  "Incumbent CRMs adding AI screening",
                  "Founder resistance to being interviewed by an agent",
                  "Data-protection terms around interview recordings",
                ]}
              />
            </div>
          </section>

          {/* Problem / product */}
          <section>
            <SectionTitle n="04" title="Problem & product" />
            <div className="space-y-3 text-[13.5px] leading-relaxed text-foreground/90">
              <p>
                A partner running screening reads one memo before deciding whether a deal survives.
                Producing that memo today means an analyst manually reconciling a deck, a website
                and a call — days of work in which nothing is traceable afterwards
                <Source id="2" hint="Fund workflow interviews" />. FirstCheck runs sourcing and
                developing as an explicit pipeline: claims enter as <em>claimed</em> with
                self-reported trust, corroboration moves them, contradictions are recorded rather
                than smoothed over, and gaps stay visible as gaps
                <Source id="3" hint="Interview 12:12" />.
              </p>
              <p>
                The product is the board, the four-stage pipeline (company snapshot → founder
                profiles → agent interview → due diligence) and the negotiation model that moves
                BATNA and ZOPA live during the call. Founder profiles carry five scored axes plus an
                open 16-personalities hypothesis that only the interview can confirm — never a
                psychometric verdict issued from a deck
                <Source id="1" hint="Deck v3.2 · slide 12" />.
              </p>
            </div>
          </section>

          {/* Traction */}
          <section>
            <SectionTitle n="05" title="Traction · KPIs" />
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-surface border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Metric</th>
                    <th className="text-right px-4 py-2.5 font-medium">Founder claim</th>
                    <th className="text-right px-4 py-2.5 font-medium">Verified</th>
                    <th className="text-right px-4 py-2.5 font-medium">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <KPI m="Signed LoIs" a="3" v="2" d="-1" />
                  <KPI m="Paid pilots" a="0" v="0" d="0" />
                  <KPI m="Pilot capacity claimed" a="40 t/day" v="12 t/day" d="-70%" bad />
                  <KPI m="B4 variant stability" a="40h @ 65°C" v="40h @ 65°C" d="✓" good />
                  <KPI m="Team size (FTE)" a="7" v="6.5" d="-0.5" />
                  <KPI m="Runway (months)" a="14" v="13" d="-1" />
                </tbody>
              </table>
            </Card>
          </section>

          {/* Team */}
          <section>
            <SectionTitle n="06" title="Team history" />
            <ul className="space-y-2.5 text-[13px] text-foreground/90">
              {ACME_FOUNDERS.map((f) => (
                <li key={f.id}>
                  · <b>{f.name}</b> — {f.role}.{" "}
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                  <div className="pl-3 text-[12.5px] text-muted-foreground leading-relaxed">
                    {f.history}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11.5px] text-muted-foreground">
              Contribution split sourced from the repository history. Prior career history is
              founder-supplied and not yet corroborated — LinkedIn is not machine-readable without
              authentication.
            </p>
          </section>

          {/* Diligence log */}
          <section>
            <SectionTitle n="07" title="Diligence log" />
            <Card className="p-4 text-[12.5px] text-muted-foreground leading-relaxed">
              48 evidence items · 14 sources · 4 references · 1 founder interview · 6 lanes · 82%
              People, 68% Product, 74% Market, 55% Traction, 40% Legal, 48% Financials. Full log
              available at{" "}
              <a href="#/diligence" className="text-primary hover:underline">
                /diligence
              </a>
              .
            </Card>
          </section>

          {/* Open issues */}
          <section>
            <SectionTitle n="08" title="Open issues" />
            <ul className="space-y-2">
              <Issue
                tag="Contradiction"
                text="Pilot-scale claim overstated (40 → 12 t/day). Founder acknowledged in interview 02:47."
              />
              <Issue tag="Missing" text="Cap table not disclosed in data room." />
              <Issue tag="Missing" text="Capex scale-up model for pilot deployment." />
              <Issue tag="Open" text="EPFL IP license terms — exclusivity and field of use." />
            </ul>
          </section>

          {/* Recommendation */}
          <section>
            <SectionTitle n="09" title="Recommendation" />
            <div className="grid md:grid-cols-3 gap-3">
              <Rec
                title="Pass"
                tone="muted"
                body="Deprioritize until third-party benchmark and clean cap table."
              />
              <Rec
                title="Partner review"
                tone="teal"
                body="Advance to IC with two conditions: (1) close pilot-scale contradiction, (2) resolve IP license."
                recommended
              />
              <Rec
                title="Term sheet"
                tone="primary"
                body="Move directly to term sheet at €3.5M seed · 18% dilution · pro-rata."
              />
            </div>
            <div className="mt-4 rounded-md border border-border bg-surface p-4 text-[13px] leading-relaxed">
              <span className="font-medium">Screening lead recommendation · Partner review.</span>{" "}
              Founder score of 88 and trust score of 92 justify partner time. Two open
              contradictions must be closed before IC. Confidence in recommendation: 84 / 100.
            </div>
          </section>
        </article>

        {/* Right rail */}
        <aside className="space-y-4 h-fit lg:sticky lg:top-[72px]">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <div className="text-[13px] font-medium">Composite view</div>
            </div>
            <div className="space-y-2.5">
              <ScoreBar label="Founder" value={88} />
              <ScoreBar label="Market" value={74} />
              <ScoreBar label="Idea ↔ Market" value={81} />
              <ScoreBar label="Trust" value={92} />
              <ScoreBar label="Thesis fit" value={87} />
              <ScoreBar label="Memo confidence" value={84} />
            </div>
          </Card>

          <Card className="p-0">
            <div id="evidence" />
            <div className="px-4 py-3 border-b border-border text-[13px] font-medium">
              Sources · 14
            </div>
            <ol className="p-4 space-y-2 text-[11.5px]">
              {[
                "Deck v3.2 · slide 8, 12",
                "IEA CCUS 2025 report",
                "Founder interview 12:12",
                "Reference · M. Vlček (Holcim)",
                "Google Scholar · Osei, A.",
                "Reference · J. Patel (ex-Ginkgo)",
                "GitHub · helix-bio (30d)",
                "Data room · P&L 12mo",
                "Reference · Prof. E. Weber",
                "helix.bio (crawl)",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-primary shrink-0">[{i + 1}]</span>
                  <span className="text-foreground/85 leading-snug">{s}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground shrink-0 mt-0.5" />
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

/** Memo for any deal on the board, filled ONLY from the data we actually hold —
 *  screening verdict, evidence, scores where they exist, honest "not assessed"
 *  where they don't. Same layout as the FirstCheck showcase. */
function DealMemo({ s, picker }: { s: Startup; picker: ReactNode }) {
  const outcome = outcomeOf(s);
  const screenedOut = s.screening ? !s.screening.pass : false;
  const flags = s.screening?.softFlags ?? [];
  const hasScores = s.founderScore != null || s.marketScore != null || s.trustScore != null;
  const confidence =
    s.trustScore ?? s.founders.find((f) => f.scoreConfidence != null)?.scoreConfidence ?? null;
  /* A company the fund actually invested in has internal IC materials — real
   * and confidential, so they render as locked tabs, never as invented data. */
  const invested = s.stage === "Portfolio" || s.portfolioYear != null;
  let sectionNo = 0;
  const num = () => String(++sectionNo).padStart(2, "0");
  const evidenceBits = [
    s.sources?.length ? `${s.sources.length} public sources` : null,
    s.sourceCardUrl ? "opportunity card" : null,
    s.screening ? "canonical screen" : null,
    s.founders.length
      ? `${s.founders.length} founder record${s.founders.length === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  const rec = screenedOut
    ? {
        title: "Pass",
        body: `Screened out: ${s.screening!.hardFails.join("; ")}`,
        alt1: "Re-screen after the round/stage changes",
        alt2: "Keep on watchlist",
      }
    : outcome
      ? {
          title: "Retrospective",
          body: `${outcome.label}. Historical record — use for evaluation calibration, not a new check.`,
          alt1: "Compare scored-then vs outcome",
          alt2: "Mine for portfolio alignment",
        }
      : s.outboundSelected
        ? {
            title: "Verify & outreach",
            body: `${s.activitySignal ?? "Outbound signal"}. Verify sources, then personalized outreach — cold outreach, not cold investment.`,
            alt1: "Monitor until a stronger trigger",
            alt2: "Pass — off focus",
          }
        : s.currentApplication || s.sourceChannel === "Inbound application"
          ? {
              title: "Advance to interview",
              body: "Screening passed; hypotheses are open until the agent interview tests them.",
              alt1: "Request missing materials first",
              alt2: "Pass with reasons",
            }
          : {
              title: "Screen",
              body: "Run the canonical first-pass screen and corroboration before partner time.",
              alt1: "Watchlist",
              alt2: "Pass",
            };

  return (
    <AppShell>
      <PageHeader
        crumbs={["Decision Memo", s.company, "generated from evidence base"]}
        eyebrow="Investment memorandum"
        title={`${s.company} · ${s.round} · ${s.ask}`}
        description={
          evidenceBits.length
            ? `Generated from ${evidenceBits.join(", ")}. Every claim below traces to the evidence base — gaps stay visible as gaps.`
            : "Minimal record — this memo shows exactly how little we know, which is the point."
        }
        actions={
          <>
            {picker}
            <Badge tone={confidence != null ? "teal" : "outline"}>
              {confidence != null ? `Confidence ${confidence}` : "Confidence —"}
            </Badge>
            <button
              onClick={() => window.print()}
              className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
          </>
        }
      />

      <div className="px-8 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <article className="max-w-3xl space-y-8">
          <section>
            <SectionTitle n={num()} title="Company snapshot" />
            <Card className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                <Snap label="Sector" value={s.sector} />
                <Snap label="Stage · Ask" value={`${s.round} · ${s.ask}`} />
                <Snap label="Geo · Submitted" value={`${s.geography} · ${s.submitted}`} />
                <Snap label="Source" value={s.vehicle ?? s.sourceChannel ?? "—"} />
              </div>
              <div className="border-t border-border p-5 text-[13.5px] leading-relaxed text-foreground/90">
                {s.oneLiner}
                {s.companyStatus ? ` Status: ${s.companyStatus}.` : ""}
                {s.realEvent ? ` Public record: ${s.realEvent}.` : ""}
              </div>
            </Card>
          </section>

          {(s.outboundRationale || s.activitySignal) && (
            <section>
              <SectionTitle n={num()} title="Why this deal, why now" />
              <Card className="p-5 text-[13px] leading-relaxed text-foreground/90 space-y-2">
                {s.activitySignal && (
                  <p>
                    <b>Trigger:</b> {s.activitySignal}
                  </p>
                )}
                {s.outboundRationale && <p>{s.outboundRationale}</p>}
              </Card>
            </section>
          )}

          {invested && (
            <section>
              <SectionTitle n={num()} title="Market validation — public record" />
              <Card className="p-5 space-y-2 text-[13px] leading-relaxed text-foreground/90">
                {outcome && (
                  <p>
                    <Badge tone={outcome.tone as never}>
                      {outcome.tone === "positive"
                        ? "Validated"
                        : outcome.tone === "negative"
                          ? "Did not validate"
                          : "Mixed"}
                    </Badge>{" "}
                    <span className="ml-1">{outcome.label}</span>
                  </p>
                )}
                {s.realEvent && (
                  <p>
                    <b>Since investment:</b> {s.realEvent}
                  </p>
                )}
                {s.companyStatus && (
                  <p>
                    <b>Current status:</b> {s.companyStatus}
                  </p>
                )}
                {s.portfolioYear != null && (
                  <p>
                    <b>Entered portfolio:</b> {s.portfolioYear}
                    {s.vehicle ? ` · ${s.vehicle}` : ""}
                  </p>
                )}
                <p className="text-[12px] text-muted-foreground">
                  The market's answer to the entry evaluation: follow-on rounds, acquisitions, or
                  inactivity are the real-world scoreboard the locked internal scores below were
                  betting on.
                </p>
              </Card>
            </section>
          )}

          {invested && (
            <section>
              <SectionTitle n={num()} title="Internal IC materials — confidential" />
              <div className="space-y-2">
                {[
                  ["Entry memo & thesis at investment", "The memo this company was approved on."],
                  [
                    "Founder evaluation at entry (five axes)",
                    "Scored during original diligence and interviews.",
                  ],
                  [
                    "Entry valuation & round terms",
                    "Pre-money, check size, ownership, side letters.",
                  ],
                  [
                    "Reference calls & diligence log",
                    "Customer, co-investor and personal references.",
                  ],
                ].map(([title, hint]) => (
                  <details key={title} className="group rounded-md border border-border bg-surface">
                    <summary className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-[12.5px] font-medium list-none">
                      <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {title}
                      <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                        confidential
                      </span>
                    </summary>
                    <div className="border-t border-border px-3 py-2.5 text-[12px] text-muted-foreground leading-relaxed">
                      {hint} These records exist in the fund's internal data room but are
                      confidential and are excluded from this repository by policy — nothing here is
                      reconstructed or invented. Request access through the fund's document
                      controls.
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionTitle n={num()} title="Screening verdict" />
            {s.screening ? (
              <ul className="space-y-2">
                <Issue
                  tag={s.screening.pass ? "Open" : "Contradiction"}
                  text={
                    s.screening.pass
                      ? "Passed the canonical first-pass screen (thesis-parameterized)."
                      : `Hard fail: ${s.screening.hardFails.join("; ")}`
                  }
                />
                {flags.map((f) => (
                  <Issue key={f} tag="Open" text={f} />
                ))}
              </ul>
            ) : (
              <Card className="p-4 text-[12.5px] text-muted-foreground">
                No stored screening verdict on this record — it predates the canonical screen or
                entered as a curated card.
              </Card>
            )}
          </section>

          <section>
            <SectionTitle n={num()} title="Founders" />
            {s.founders.length ? (
              <ul className="space-y-3 text-[13px] text-foreground/90">
                {s.founders.map((f) => {
                  const rationale =
                    f.scoreRationale && f.scores
                      ? Object.entries(f.scores).sort((a, b) => b[1] - a[1])
                      : null;
                  return (
                    <li key={f.id ?? f.name} className="rounded-md border border-border p-3">
                      <b>{f.name}</b>
                      {f.role && <span className="text-muted-foreground"> — {f.role}</span>}
                      {f.linkedin && (
                        <>
                          {" · "}
                          <a
                            href={f.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            LinkedIn
                          </a>
                        </>
                      )}
                      {rationale ? (
                        <div className="mt-1.5 space-y-1 text-[12px] text-muted-foreground">
                          <div>
                            <span className="text-positive">▲</span> {rationale[0][0]}{" "}
                            {rationale[0][1]} — {f.scoreRationale![rationale[0][0]]}
                          </div>
                          <div>
                            <span className="text-negative">▼</span>{" "}
                            {rationale[rationale.length - 1][0]}{" "}
                            {rationale[rationale.length - 1][1]} —{" "}
                            {f.scoreRationale![rationale[rationale.length - 1][0]]}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-[12px] text-muted-foreground">
                          Public facts only — not assessed. Axis scores require interview evidence;
                          nothing is fabricated for real people.
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Card className="p-4 text-[12.5px] text-muted-foreground">
                No founder records on file — a gap, recorded as such.
              </Card>
            )}
          </section>

          <section>
            <SectionTitle n={num()} title="Recommendation" />
            <div className="grid md:grid-cols-3 gap-3">
              <Rec title={rec.alt1} tone="muted" body="" />
              <Rec title={rec.title} tone="teal" body={rec.body} recommended />
              <Rec title={rec.alt2} tone="muted" body="" />
            </div>
          </section>
        </article>

        <aside className="space-y-4 h-fit lg:sticky lg:top-[72px]">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <div className="text-[13px] font-medium">Composite view</div>
            </div>
            {hasScores ? (
              <div className="space-y-2.5">
                {s.founderScore != null && <ScoreBar label="Founder" value={s.founderScore} />}
                {s.marketScore != null && <ScoreBar label="Market" value={s.marketScore} />}
                {s.ideaMarketScore != null && (
                  <ScoreBar label="Idea ↔ Market" value={s.ideaMarketScore} />
                )}
                {s.trustScore != null && <ScoreBar label="Trust" value={s.trustScore} />}
                {s.thesisFit != null && (
                  <ScoreBar label="Thesis fit" value={Math.round(s.thesisFit * 100)} />
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Not assessed. Axes are scored from interview and corroboration evidence only —
                unknown ≠ false.
              </div>
            )}
          </Card>

          <Card className="p-0">
            <div className="px-4 py-3 border-b border-border text-[13px] font-medium">
              Sources · {s.sources?.length ?? 0}
            </div>
            <ol className="p-4 space-y-2 text-[11.5px]">
              {(s.sources ?? []).map((src, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-primary shrink-0">[{i + 1}]</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground/85 leading-snug hover:underline"
                  >
                    {src.label}
                  </a>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground shrink-0 mt-0.5" />
                </li>
              ))}
              {s.sourceCardUrl && (
                <li className="flex items-start gap-2">
                  <span className="font-mono text-primary shrink-0">[C]</span>
                  <a
                    href={s.sourceCardUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary leading-snug hover:underline"
                  >
                    Full opportunity card (evidence ledger)
                  </a>
                </li>
              )}
              {!s.sources?.length && !s.sourceCardUrl && (
                <li className="text-muted-foreground">
                  No sources on file — treat every statement as claimed.
                </li>
              )}
            </ol>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-mono text-[11px] text-muted-foreground">{n}</span>
      <h2 className="font-serif text-[22px] leading-none tracking-tight">{title}</h2>
    </div>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-[13.5px] font-medium">{value}</div>
    </div>
  );
}

function Hypothesis({ n, text, conf }: { n: string; text: string; conf: number }) {
  return (
    <li className="rounded-md border border-border p-4 flex items-start gap-3 bg-card">
      <span className="font-mono text-[11px] text-primary mt-0.5">{n}</span>
      <div className="flex-1 text-[13px] leading-relaxed">{text}</div>
      <div className="w-28 shrink-0">
        <ScoreBar label="Confidence" value={conf} />
      </div>
    </li>
  );
}

function SwotCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "positive" | "warning" | "negative" | "teal";
  items: string[];
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge tone={tone}>{title}</Badge>
      </div>
      <ul className="space-y-1.5 text-[12.5px] text-foreground/90">
        {items.map((it, i) => (
          <li key={i}>· {it}</li>
        ))}
      </ul>
    </Card>
  );
}

function KPI({
  m,
  a,
  v,
  d,
  good,
  bad,
}: {
  m: string;
  a: string;
  v: string;
  d: string;
  good?: boolean;
  bad?: boolean;
}) {
  return (
    <tr>
      <td className="px-4 py-2.5">{m}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{a}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{v}</td>
      <td
        className={
          "px-4 py-2.5 text-right font-mono tabular-nums " +
          (good ? "text-positive" : bad ? "text-negative" : "text-muted-foreground")
        }
      >
        {d}
      </td>
    </tr>
  );
}

function Issue({ tag, text }: { tag: string; text: string }) {
  const tone = tag === "Contradiction" ? "warning" : tag === "Missing" ? "negative" : "outline";
  return (
    <li className="flex items-start gap-3 rounded-md border border-border p-3">
      <Badge tone={tone as never}>{tag}</Badge>
      <span className="text-[12.5px] text-foreground/90">{text}</span>
    </li>
  );
}

function Rec({
  title,
  body,
  tone,
  recommended,
}: {
  title: string;
  body: string;
  tone: "muted" | "teal" | "primary";
  recommended?: boolean;
}) {
  const style: Record<string, string> = {
    muted: "border-border bg-card",
    teal: "border-primary/40 bg-teal-soft/40 ring-1 ring-primary/30",
    primary: "border-border bg-card",
  };
  return (
    <div className={"rounded-md border p-4 relative " + style[tone]}>
      {recommended && (
        <div className="absolute -top-2 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
          <ShieldCheck className="h-2.5 w-2.5" /> Recommended
        </div>
      )}
      <div className="text-[13.5px] font-medium">{title}</div>
      <p className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
