import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { Play, RotateCcw, Sparkles, TrendingUp, Gavel } from "lucide-react";

export const Route = createFileRoute("/interviews")({
  head: () => ({ meta: [{ title: "Live Interview · VibeCheck" }] }),
  component: InterviewsPage,
});

/* ------------------------------------------------------------------ */
/*  Live interview studio (Acme demo) — transcript + vibe + negotiation */
/* ------------------------------------------------------------------ */

type Vibe = {
  adaSent: number; adaTone: number; adaConf: number;
  minhSent: number; minhTone: number; minhConf: number;
};
const ZERO_VIBE: Vibe = { adaSent: 0, adaTone: 0, adaConf: 0, minhSent: 0, minhTone: 0, minhConf: 0 };

type Step = {
  who: string;
  tile?: "ada" | "minh" | "agent";
  text: string;
  evt?: boolean;
  vibe?: Partial<Vibe>;
  readAda?: string;
  readMinh?: string;
  update?: { t: string; text: string };
  lever?: string; // toggles a negotiation lever on
  status?: string;
};

const SCRIPT: Step[] = [
  { who: "System", evt: true, status: "Research", text: "Intake: application, deck and CVs imported as SRC-001…SRC-005. Opportunity card OPP-2026-0001 created." },
  { who: "System", evt: true, text: "Research agent enriched the card: 14 claims, contradiction CON-001 ($120K vs $80K ARR), gaps GAP-002/003/004, hypotheses HYP-001/002." },
  { who: "System", evt: true, status: "Interviewing", text: "Human investor approved the interview plan and negotiation bounds (reservation $12M, target $9M). Call starting." },
  { who: "Agent", tile: "agent", text: "Ada, Minh — thanks for joining. Let's start with the two pilot deployments. What changed between the first and the second?" },
  { who: "Ada", tile: "ada", text: "The first took nine days on site. We rebuilt the demonstration-capture flow, and the second was live in under two days.",
    vibe: { adaSent: 78, adaTone: 72, adaConf: 80 }, readAda: "Engaged" },
  { who: "Agent", tile: "agent", evt: true, text: "HYP-001 (learning velocity) → supported. Card updated [INT-001 00:41].",
    update: { t: "00:41", text: "HYP-001 supported — deployment time cut 9d → 2d, evidence logged." } },
  { who: "Agent", tile: "agent", text: "Your deck states $120K ARR, but the application says $80K. Help me reconcile those." },
  { who: "Minh", tile: "minh", text: "The $120K includes the second pilot that's signed but starts billing next quarter. Contracted today is $80K.",
    vibe: { minhSent: 62, minhTone: 55, minhConf: 68 }, readMinh: "Composed" },
  { who: "Agent", tile: "agent", evt: true, text: "CON-001 → resolving. Verified ARR $80K; $120K is contracted-forward. Valuation target held at $9M.",
    update: { t: "01:22", text: "CON-001 resolving — ARR clarified; request revenue export to verify." } },
  { who: "Agent", tile: "agent", text: "What matters more to you in this round — valuation, or speed to close?" },
  { who: "Ada", tile: "ada", text: "Honestly? Speed. We have two warehouses waiting and want to be deploying by September.",
    vibe: { adaSent: 84, adaTone: 86, adaConf: 85 }, readAda: "Animated", lever: "speed",
    update: { t: "02:04", text: "Speed > price signal — founder range re-estimated $9M–$13M; ZOPA widens to $9M–$12M." } },
  { who: "Agent", tile: "agent", text: "If we closed in ten days at a $9M cap with full pro-rata, is that a conversation you'd want to have?" },
  { who: "Minh", tile: "minh", text: "Ten days is… fast. We'd need our counsel to confirm the IP-assignment timeline first.",
    vibe: { minhSent: 48, minhTone: 42, minhConf: 55 }, readMinh: "Hesitant",
    update: { t: "02:47", text: "Hesitation on speed from CTO — IP assignment (GAP-002) confirmed as a real blocker, not a bluff." } },
  { who: "Ada", tile: "ada", text: "At nine million with full pro-rata — yes, that's a conversation we want to have.",
    vibe: { adaSent: 88, adaTone: 82, adaConf: 88 }, readAda: "Engaged", lever: "prorata" },
  { who: "Agent", tile: "agent", evt: true, status: "Decision ready", text: "Recommendation → proceed to term sheet at $9M cap, conditional on GAP-002. Escalating to the human investor.",
    update: { t: "03:15", text: "Recommendation: $100K SAFE at $9M cap, full pro-rata — pending human approval and IP diligence." } },
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
  const [vibe, setVibe] = useState<Vibe>(ZERO_VIBE);
  const [readAda, setReadAda] = useState("Neutral");
  const [readMinh, setReadMinh] = useState("Neutral");
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
    setShown(0); setVibe(ZERO_VIBE); setReadAda("Neutral"); setReadMinh("Neutral");
    setUpdates([]); setLevers(new Set()); setStatus("Interviewing"); setSpeaking(null); setPlaying(false);
  }, []);

  const play = useCallback(() => {
    reset();
    setPlaying(true);
    SCRIPT.forEach((step, i) => {
      const id = setTimeout(() => {
        setShown(i + 1);
        setSpeaking(step.tile ?? null);
        if (step.vibe) setVibe((v) => ({ ...v, ...step.vibe }));
        if (step.readAda) setReadAda(step.readAda);
        if (step.readMinh) setReadMinh(step.readMinh);
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
        crumbs={["Interviews", "Acme Robotics · Founder call INT-001"]}
        eyebrow="Live AI interview · Match stage"
        title="Live interview — Ada Keller & Minh Tran"
        description="The interview is the diligence. Every answer runs the vibe check and moves the negotiation model — BATNA, reservation points and the ZOPA — in real time. The human investor keeps the final call."
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
              <Tile name="Ada Keller" role="CEO" initials="AK" readout={readAda} speaking={speaking === "ada"} />
              <Tile name="Minh Tran" role="CTO" initials="MT" readout={readMinh} speaking={speaking === "minh"} />
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
              {shown === 0 && <div className="text-[12.5px] text-muted-foreground">Press “Play demo” to run the scripted Acme interview.</div>}
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
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary" /><span className="text-[13px] font-medium">Vibe check — live signals</span></div>
              <Link to={"/founder" as never} className="text-[11px] font-medium text-primary hover:underline">See details →</Link>
            </div>
            <div className="p-5 space-y-4">
              <VibeBlock name="Ada Keller" role="CEO · FND-0007" rows={[["Sentiment", vibe.adaSent], ["Energy / tone", vibe.adaTone], ["Confidence", vibe.adaConf]]} />
              <div className="border-t border-border" />
              <VibeBlock name="Minh Tran" role="CTO · FND-0008" rows={[["Sentiment", vibe.minhSent], ["Energy / tone", vibe.minhTone], ["Confidence", vibe.minhConf]]} />
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
                <Band top={8} lo={model.inv[0]} hi={model.inv[1]} className="bg-[#0B3D2E]" label="Investor" side="left" />
                {model.zopa && <Band top={34} lo={model.zopa[0]} hi={model.zopa[1]} className="bg-[#A7F3D0]" label="ZOPA" side="mid" />}
                <Band top={60} lo={model.fnd[0]} hi={model.fnd[1]} className="bg-[#10B981]" label="Founders" side="left" />
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

function Tile({ name, role, initials, readout, speaking, agent }: { name: string; role: string; initials: string; readout?: string; speaking?: boolean; agent?: boolean }) {
  return (
    <div className={"relative rounded-lg border overflow-hidden bg-surface-2 " + (agent ? "aspect-[32/7]" : "aspect-[16/10]") + " " + (speaking ? "ring-2 ring-primary" : "border-border")}>
      <div className="absolute inset-0 grid place-items-center">
        <div className={"rounded-full grid place-items-center font-medium text-primary-foreground bg-primary/80 " + (agent ? "h-10 w-10 text-[13px]" : "h-14 w-14 text-[17px]")}>{initials}</div>
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
