import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { Play, RotateCcw, Sparkles, TrendingUp, Gavel, BrainCircuit } from "lucide-react";
import { ACME_FOUNDERS } from "@/lib/data";

export const Route = createFileRoute("/interviews")({
  head: () => ({ meta: [{ title: "Live Interview · VibeCheck" }] }),
  component: InterviewsPage,
});

/* ------------------------------------------------------------------ */
/*  Live interview studio (FirstCheck demo) — transcript + vibe + negotiation */
/* ------------------------------------------------------------------ */


/** Vibe is keyed by founder id so the call is not limited to two people. */
type Signals = { sent: number; tone: number; conf: number };
const ZERO_SIGNALS: Signals = { sent: 0, tone: 0, conf: 0 };
const ZERO_VIBE: Record<string, Signals> = Object.fromEntries(
  ACME_FOUNDERS.map((f) => [f.id, ZERO_SIGNALS]),
);
/** Live personality state: starts from each founder's open hypothesis. */
const initialPersonality = () =>
  Object.fromEntries(
    ACME_FOUNDERS.map((f) => [f.id, { status: f.personality.status, confidence: f.personality.confidence, note: "" }]),
  ) as Record<string, { status: string; confidence: number; note: string }>;

type Step = {
  who: string;
  /** A founder id, or "agent". */
  tile?: string;
  text: string;
  evt?: boolean;
  /** Signals for the founder who just spoke. */
  vibe?: { id: string } & Partial<Signals>;
  read?: { id: string; label: string };
  /** Personality hypothesis moving as evidence arrives. */
  personality?: { id: string; status: "open" | "supported" | "contradicted"; confidence: number; note: string };
  update?: { t: string; text: string };
  lever?: string; // toggles a negotiation lever on
  status?: string;
};

const [MARTIN, SUN, LAURA, MEHDI] = ACME_FOUNDERS;

const SCRIPT: Step[] = [
  { who: "System", evt: true, status: "Research", text: "Intake: application, deck and CVs imported as SRC-001…SRC-005. Opportunity card OPP-2026-0001 created for FirstCheck." },
  { who: "System", evt: true, text: "Research agent enriched the card: 14 claims, contradiction CON-001, gaps GAP-002/003/004, and one open personality hypothesis per founder (ENTJ / INTP / INFJ / ENFP)." },
  { who: "System", evt: true, status: "Interviewing", text: "Human investor approved the interview plan and negotiation bounds (reservation $12M, target $9M). Call starting — four founders present." },

  { who: "Agent", tile: "agent", text: "Martin, Sun, Laura, Mehdi — thanks for joining. Start with the wedge: what does FirstCheck actually replace inside a fund?" },
  { who: "Martin", tile: MARTIN.id, text: "The first-check screen. An analyst spends days turning an inbound deck into a memo; we do it in twenty-four hours with the evidence attached to every claim.",
    vibe: { id: MARTIN.id, sent: 80, tone: 76, conf: 82 }, read: { id: MARTIN.id, label: "Engaged" },
    personality: { id: MARTIN.id, status: "supported", confidence: 58, note: "Opened with the commitment, not the caveat — consistent with ENTJ framing." } },

  { who: "Agent", tile: "agent", text: "Sun — what breaks first when you scale that beyond one fund's thesis?" },
  { who: "Sun", tile: SUN.id, text: "The thesis lens. Screening is deterministic today, so a second fund means a second rule set. I would rather rebuild it as a scored model than special-case it.",
    vibe: { id: SUN.id, sent: 64, tone: 58, conf: 74 }, read: { id: SUN.id, label: "Composed" },
    personality: { id: SUN.id, status: "supported", confidence: 62, note: "Reopened a settled design under questioning — consistent with INTP." } },
  { who: "Agent", tile: "agent", evt: true, text: "HYP-001 (technical depth) → supported. Personality read for FND-0008 firming [INT-001 01:04].",
    update: { t: "01:04", text: "HYP-001 supported — CTO reopened the screening model unprompted; depth evidenced." } },

  { who: "Agent", tile: "agent", text: "Laura, the opportunity database is yours. What is in there that a fund could not assemble itself?" },
  { who: "Laura", tile: LAURA.id, text: "Provenance. Every card carries the source and a trust score, so a claim that came from the founder never gets read as verified. That is the part nobody builds until it burns them.",
    vibe: { id: LAURA.id, sent: 72, tone: 68, conf: 79 }, read: { id: LAURA.id, label: "Precise" },
    personality: { id: LAURA.id, status: "supported", confidence: 66, note: "Argued from the system rather than the instance — consistent with INFJ." } },

  { who: "Agent", tile: "agent", text: "Mehdi — who is the buyer, and what do they do in the first five minutes?" },
  { who: "Mehdi", tile: MEHDI.id, text: "The partner running screening. They open the board, see what came in overnight, and read one memo. If the first memo is wrong, we never get a second.",
    vibe: { id: MEHDI.id, sent: 83, tone: 85, conf: 74 }, read: { id: MEHDI.id, label: "Animated" },
    personality: { id: MEHDI.id, status: "supported", confidence: 55, note: "Reframed from the user's side immediately — consistent with ENFP." } },

  { who: "Agent", tile: "agent", text: "Your deck says twenty-four hours to memo. The application says forty-eight. Which is it?" },
  { who: "Martin", tile: MARTIN.id, text: "Twenty-four is the pipeline. Forty-eight is with the human approval gate, and the gate is not optional. The deck should say forty-eight.",
    vibe: { id: MARTIN.id, sent: 70, tone: 64, conf: 77 }, read: { id: MARTIN.id, label: "Direct" },
    personality: { id: MARTIN.id, status: "supported", confidence: 64, note: "Conceded the inconsistency without hedging." } },
  { who: "Agent", tile: "agent", evt: true, text: "CON-001 → resolved. Time-to-memo corrected to 48h including the approval gate.",
    update: { t: "02:11", text: "CON-001 resolved — CEO corrected his own deck against the application." } },

  { who: "Agent", tile: "agent", text: "What matters more in this round — valuation, or speed to close?" },
  { who: "Mehdi", tile: MEHDI.id, text: "Speed. We have two funds waiting on a pilot and the window closes when their quarter does.",
    vibe: { id: MEHDI.id, sent: 86, tone: 88, conf: 80 }, read: { id: MEHDI.id, label: "Animated" }, lever: "speed",
    update: { t: "02:40", text: "Speed > price signal — founder range re-estimated $9M–$13M; ZOPA widens to $9M–$12M." } },
  { who: "Sun", tile: SUN.id, text: "Speed on the raise, yes. Not on the data model — if we ship the thesis lens wrong, every memo after it inherits the error.",
    vibe: { id: SUN.id, sent: 52, tone: 46, conf: 68 }, read: { id: SUN.id, label: "Guarded" },
    personality: { id: SUN.id, status: "supported", confidence: 71, note: "Held the technical line against team momentum — INTP strongly supported." },
    update: { t: "02:58", text: "Founder disagreement surfaced in-call and resolved without deferral — co-founder fit evidence." } },

  { who: "Agent", tile: "agent", evt: true, text: "Co-founder fit: disagreement aired directly between CTO and product, no deferral to the CEO. Pressure-tested history moving off its floor.",
    update: { t: "03:06", text: "Team complementarity re-scored — 'pressure-tested history' 45 → 58 on observed conflict handling." } },

  { who: "Agent", tile: "agent", text: "If we closed in ten days at a $9M cap with full pro-rata, is that a conversation you want to have?" },
  { who: "Laura", tile: LAURA.id, text: "At nine with full pro-rata — yes. We would want the data-processing terms written before signing, not after.",
    vibe: { id: LAURA.id, sent: 81, tone: 74, conf: 84 }, read: { id: LAURA.id, label: "Engaged" }, lever: "prorata" },

  { who: "Agent", tile: "agent", evt: true, status: "Decision ready", text: "Recommendation → proceed to term sheet at $9M cap, conditional on GAP-002. Four personality hypotheses supported, none contradicted. Escalating to the human investor.",
    update: { t: "03:41", text: "Recommendation: $100K SAFE at $9M cap, full pro-rata — pending human approval and data-terms diligence." } },
];

/* ---- super negotiation model ---- */
type Lever = { id: string; label: string; note: string; dInvHi: number; dFndLo: number; fit: number };
const LEVERS: Lever[] = [
  { id: "speed", label: "Close in 10 days", note: "Founders trade valuation for speed", dInvHi: 0, dFndLo: -1, fit: 12 },
  { id: "prorata", label: "Full pro-rata rights", note: "Investor concession — keeps founders aligned", dInvHi: 0, dFndLo: 0, fit: 8 },
  { id: "board", label: "Board observer (no seat)", note: "Founder-friendly governance", dInvHi: 0, dFndLo: -0.5, fit: 7 },
  { id: "milestone", label: "Milestone tranche", note: "De-risks the round for the investor", dInvHi: 1, dFndLo: 0, fit: 9 },
  { id: "cap", label: "$12M cap headline", note: "Meets the founder anchor", dInvHi: 0.5, dFndLo: 0, fit: 6 },
];
const AXIS = { min: 6, max: 14 };
const pct = (v: number) => ((v - AXIS.min) / (AXIS.max - AXIS.min)) * 100;

function deriveModel(active: Set<string>) {
  let invHi = 12, fndLo = 10, fit = 38;
  for (const l of LEVERS) if (active.has(l.id)) { invHi += l.dInvHi; fndLo += l.dFndLo; fit += l.fit; }
  const inv: [number, number] = [8, invHi];
  const fnd: [number, number] = [fndLo, 14];
  const zLo = Math.max(inv[0], fnd[0]);
  const zHi = Math.min(inv[1], fnd[1]);
  const zopa: [number, number] | null = zHi > zLo ? [zLo, zHi] : null;
  const dealFit = Math.max(0, Math.min(100, Math.round(fit + (zopa ? (zHi - zLo) * 4 : -20))));
  return { inv, fnd, zopa, invTarget: 9, fndTarget: 12, dealFit };
}

const STEP_MS = 2200;

function InterviewsPage() {
  const [shown, setShown] = useState(0);
  const [vibe, setVibe] = useState<Record<string, Signals>>(ZERO_VIBE);
  const [reads, setReads] = useState<Record<string, string>>({});
  const [personality, setPersonality] = useState(initialPersonality);
  const [updates, setUpdates] = useState<{ t: string; text: string }[]>([]);
  const [levers, setLevers] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("Interviewing");
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const model = deriveModel(levers);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setShown(0); setVibe(ZERO_VIBE); setReads({}); setPersonality(initialPersonality());
    setUpdates([]); setLevers(new Set()); setStatus("Interviewing"); setSpeaking(null); setPlaying(false);
  }, []);

  const play = useCallback(() => {
    reset();
    setPlaying(true);
    SCRIPT.forEach((step, i) => {
      const id = setTimeout(() => {
        setShown(i + 1);
        setSpeaking(step.tile ?? null);
        if (step.vibe) {
          const { id, ...sig } = step.vibe;
          setVibe((v) => ({ ...v, [id]: { ...v[id], ...sig } }));
        }
        if (step.read) setReads((r) => ({ ...r, [step.read!.id]: step.read!.label }));
        if (step.personality) {
          const { id, ...rest } = step.personality;
          setPersonality((pr) => ({ ...pr, [id]: rest }));
        }
        if (step.update) setUpdates((u) => [...u, step.update!]);
        if (step.lever) setLevers((s) => new Set(s).add(step.lever!));
        if (step.status) setStatus(step.status);
        if (i === SCRIPT.length - 1) { setPlaying(false); setSpeaking(null); }
      }, i * STEP_MS);
      timers.current.push(id);
    });
  }, [reset]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggleLever = (id: string) =>
    setLevers((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <AppShell>
      <PageHeader
        crumbs={["Interviews", "FirstCheck · Founder call INT-001"]}
        eyebrow="Live AI interview · Match stage"
        title="Live interview — FirstCheck founding team"
        description="The interview is the diligence. Every answer runs the vibe check, tests each founder’s open personality hypothesis and moves the negotiation model — all in real time. The human investor keeps the final call."
        actions={
          <>
            <Badge tone={status === "Decision ready" ? "warning" : "teal"}>
              {status === "Decision ready" ? "Decision ready" : "● Interviewing"}
            </Badge>
            <button onClick={play} className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5" /> {playing ? "Playing…" : "Play demo"}
            </button>
            <button onClick={reset} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </>
        }
      />

      <div className="px-8 py-6 grid lg:grid-cols-3 gap-4">
        {/* Left: call + transcript */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {ACME_FOUNDERS.map((f) => (
                <Tile
                  key={f.id}
                  name={f.name}
                  role={f.role}
                  initials={f.initials}
                  photo={f.photo}
                  readout={reads[f.id] ?? "Neutral"}
                  speaking={speaking === f.id}
                />
              ))}
            </div>
            <div className="mt-3">
              <Tile name="Interview Agent" role="vibe-check@1.0" initials="VC" agent speaking={speaking === "agent"} />
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium flex items-center justify-between">
              <span>Transcript &amp; agent events</span>
              <span className="text-[11px] text-muted-foreground">{shown} / {SCRIPT.length}</span>
            </div>
            <div className="p-5 space-y-3 max-h-[360px] overflow-y-auto">
              {shown === 0 && <div className="text-[12.5px] text-muted-foreground">Press “Play demo” to run the scripted FirstCheck interview.</div>}
              {SCRIPT.slice(0, shown).map((s, i) => (
                <div key={i} className="grid grid-cols-[64px_1fr] gap-3">
                  <div className={"text-[11px] uppercase tracking-wider pt-0.5 " + (s.evt ? "text-warning" : s.who === "Agent" ? "text-primary" : "text-muted-foreground")}>
                    {s.who}
                  </div>
                  <div className={"text-[13px] leading-relaxed " + (s.evt ? "text-warning" : "text-foreground/90")}>{s.text}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: vibe + super negotiation */}
        <div className="space-y-4">
          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <BrainCircuit className="h-3.5 w-3.5 text-primary" />
              <span className="text-[13px] font-medium">Personality hypotheses — live</span>
              <Badge tone="outline">16 personalities</Badge>
            </div>
            <div className="p-5 space-y-3.5">
              {ACME_FOUNDERS.map((f) => {
                const live = personality[f.id];
                const tone =
                  live.status === "supported" ? "text-positive"
                  : live.status === "contradicted" ? "text-negative"
                  : "text-warning";
                return (
                  <div key={f.id}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12.5px] font-medium">{f.name.split(" ")[0]}</span>
                      <span className="font-mono text-[12px]">{f.personality.type}</span>
                      <span className="text-[11px] text-muted-foreground">{f.personality.label}</span>
                      <span className={"ml-auto text-[10px] uppercase tracking-wider " + tone}>
                        {live.status === "open" ? "open · to test" : live.status}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={"h-full rounded-full transition-all duration-700 " + (live.status === "supported" ? "bg-positive" : "bg-warning")}
                        style={{ width: live.confidence + "%" }}
                      />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-[10.5px] text-muted-foreground">confidence {live.confidence}/100</span>
                      {live.note && <span className="text-[11px] text-foreground/80 leading-snug">{live.note}</span>}
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                Each type entered the call as an untested hypothesis drawn from written material. The agent moves it
                only on what is said live — nothing here is a verdict.
              </p>
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary" /><span className="text-[13px] font-medium">Vibe check — live signals</span></div>
              <Link to={"/founder" as never} className="text-[11px] font-medium text-primary hover:underline">See details →</Link>
            </div>
            <div className="p-5 space-y-4">
              {ACME_FOUNDERS.map((f, i) => (
                <div key={f.id}>
                  {i > 0 && <div className="border-t border-border mb-4" />}
                  <VibeBlock
                    name={f.name}
                    role={f.role + " · " + f.id}
                    rows={[["Sentiment", vibe[f.id].sent], ["Energy / tone", vibe[f.id].tone], ["Confidence", vibe[f.id].conf]]}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2"><Gavel className="h-3.5 w-3.5 text-primary" /><span className="text-[13px] font-medium">Super negotiation — pre-money</span></div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> deal-fit <span className="font-mono tabular-nums text-foreground">{model.dealFit}</span></div>
            </div>
            <div className="p-5 space-y-4">
              {/* ZOPA chart */}
              <div className="relative h-[104px]">
                {[6, 8, 10, 12, 14].map((v) => (
                  <div key={v} className="absolute top-0 bottom-5 w-px bg-border" style={{ left: pct(v) + "%" }} />
                ))}
                <Band top={8} lo={model.inv[0]} hi={model.inv[1]} className="bg-[#4A3A63]" label="Investor" side="left" />
                {model.zopa && <Band top={34} lo={model.zopa[0]} hi={model.zopa[1]} className="bg-[#C6A968]" label="ZOPA" side="mid" />}
                <Band top={60} lo={model.fnd[0]} hi={model.fnd[1]} className="bg-[#8E7AA6]" label="Founders" side="left" />
                <Marker v={model.invTarget} top={18} />
                <Marker v={model.fndTarget} top={70} />
                <div className="absolute left-0 right-0 bottom-0 h-4">
                  {[6, 8, 10, 12, 14].map((v) => (
                    <span key={v} className="absolute -translate-x-1/2 text-[10px] font-mono text-muted-foreground" style={{ left: pct(v) + "%" }}>${v}M</span>
                  ))}
                </div>
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                {model.zopa
                  ? <>Estimated ZOPA <span className="font-medium text-foreground">${model.zopa[0]}M–${model.zopa[1]}M</span> · widens as founder-friendly levers are pulled.</>
                  : <span className="text-warning">No overlap — outside the investor's reservation point; the BATNA (OPP-2026-0008) wins.</span>}
              </div>

              {/* term table */}
              <table className="w-full text-[11.5px]">
                <thead className="text-muted-foreground"><tr className="text-left"><th className="font-medium pb-1"></th><th className="font-medium pb-1">BATNA</th><th className="font-medium pb-1">Reserv.</th><th className="font-medium pb-1">Target</th></tr></thead>
                <tbody className="font-mono tabular-nums">
                  <tr><td className="py-0.5 font-sans text-foreground">Investor</td><td>OPP-0008</td><td>$12M</td><td>${model.invTarget}M</td></tr>
                  <tr><td className="py-0.5 font-sans text-foreground">Founders</td><td>Bootstrap</td><td>{levers.has("speed") ? "≈$9M" : "unknown"}</td><td>~${model.fndTarget}M</td></tr>
                </tbody>
              </table>

              {/* levers */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Levers — toggle to re-shape the deal</div>
                <div className="space-y-1.5">
                  {LEVERS.map((l) => {
                    const on = levers.has(l.id);
                    return (
                      <button key={l.id} onClick={() => toggleLever(l.id)}
                        className={"w-full text-left rounded-md border px-2.5 py-1.5 transition-colors " + (on ? "border-primary/50 bg-primary/5" : "border-border hover:bg-surface")}>
                        <div className="flex items-center justify-between">
                          <span className={"text-[12px] " + (on ? "font-medium text-foreground" : "text-foreground/80")}>{l.label}</span>
                          <span className={"text-[10px] font-mono " + (on ? "text-primary" : "text-muted-foreground")}>{on ? "+" + l.fit : "off"}</span>
                        </div>
                        <div className="text-[10.5px] text-muted-foreground">{l.note}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {updates.length > 0 && (
            <Card className="p-0">
              <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium">Agent updates</div>
              <ul className="p-5 space-y-2.5">
                {updates.map((u, i) => (
                  <li key={i} className="text-[12px] text-foreground/90 flex gap-2">
                    <span className="font-mono text-[11px] text-primary shrink-0">{u.t}</span>
                    <span>{u.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Tile({ name, role, initials, photo, readout, speaking, agent }: { name: string; role: string; initials: string; photo?: string | null; readout?: string; speaking?: boolean; agent?: boolean }) {
  return (
    <div className={"relative rounded-lg border overflow-hidden bg-surface-2 " + (agent ? "aspect-[32/7]" : "aspect-[16/10]") + " " + (speaking ? "ring-2 ring-primary" : "border-border")}>
      <div className="absolute inset-0 grid place-items-center">
        {photo ? (
          <img src={photo} alt={name} className={"rounded-full object-cover " + (agent ? "h-10 w-10" : "h-14 w-14")} />
        ) : (
          <div className={"rounded-full grid place-items-center font-medium text-primary-foreground bg-primary/80 " + (agent ? "h-10 w-10 text-[13px]" : "h-14 w-14 text-[17px]")}>{initials}</div>
        )}
      </div>
      {readout && <div className="absolute top-2 right-2 rounded bg-background/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/80">{readout}</div>}
      <div className="absolute left-2 bottom-2 rounded bg-background/70 px-2 py-0.5 text-[11px] font-medium flex items-center gap-1.5">
        {name} <span className="text-muted-foreground">{role}</span>
        {speaking && <span className="inline-flex gap-[2px] items-end h-2.5">{[0, 1, 2].map((i) => <span key={i} className="w-[2px] bg-primary rounded animate-pulse" style={{ height: 4 + i * 3 }} />)}</span>}
      </div>
    </div>
  );
}

function VibeBlock({ name, role, rows }: { name: string; role: string; rows: [string, number][] }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2"><span className="text-[13px] font-medium">{name}</span><span className="text-[11px] text-muted-foreground">{role}</span></div>
      <div className="space-y-2">
        {rows.map(([label, v]) => (
          <div key={label} className="grid grid-cols-[92px_1fr_28px] items-center gap-2 text-[12px]">
            <span className="text-muted-foreground">{label}</span>
            <span className="h-1.5 rounded-full bg-muted overflow-hidden"><span className="block h-full rounded-full bg-primary transition-all duration-700" style={{ width: v + "%" }} /></span>
            <span className="text-right font-mono tabular-nums text-muted-foreground">{v || "–"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Band({ top, lo, hi, className, label, side }: { top: number; lo: number; hi: number; className: string; label: string; side: "left" | "mid" }) {
  const left = pct(lo);
  const width = Math.max(pct(hi) - pct(lo), 0);
  return (
    <div className={"absolute h-5 rounded transition-all duration-700 " + className} style={{ top, left: left + "%", width: width + "%" }}>
      <span className={"absolute top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-wide " + (side === "mid" ? "left-1/2 -translate-x-1/2 text-[oklch(0.2_0_0)]" : "right-full mr-2 text-muted-foreground whitespace-nowrap")}>{label}</span>
    </div>
  );
}

function Marker({ v, top }: { v: number; top: number }) {
  return <div className="absolute h-2.5 w-2.5 rounded-full bg-foreground border-2 border-card -translate-x-1/2 transition-all duration-700" style={{ left: pct(v) + "%", top }} />;
}
