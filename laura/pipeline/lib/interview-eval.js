// Real-time interview evaluation (challenge brief MVP #6 live + #8 depth):
// consumes transcript lines as they stream and derives founder sub-scores,
// behavioral flags, and negotiation-model updates — each with an explicit
// REASON, so the investor always sees WHY a score moved, not just that it did.
//
// Deterministic rule layer (zero-dep, works offline). An LLM can refine each
// verdict through the same event shape — AGENT HOOK below plugs into
// lib/llm.js when a key is set (node laura/pipeline/set-key.js).
//
// Emits (additive to the §3.3 event schema, see stitch-ai-prompt.md):
//   evaluation.update  { who, axis, score, delta, reason, founderAxis, signalConfidence }
//   model.update       { party, range, zopa, confidence, note, lever }  (existing type)
// Sub-scores, weights, and floor rules come from thesis.json founderCriteria.

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

/** Detector lexicons — each hit maps to a sub-score delta and a human reason. */
const DETECTORS = [
  {
    axis: "resilience",
    test: (t, ctx) => ctx.challenged && /\$?\d|contracted|signed|includes|because|the number/i.test(t),
    delta: +6,
    reason: (ctx) => `answered the challenge ("${ctx.challenge}") with specifics instead of deflecting`,
  },
  {
    axis: "resilience",
    test: (t) => /honestly|the risk is|we haven't|not yet|open question|real blocker/i.test(t),
    delta: +4,
    reason: () => "named a weakness unprompted — candor under pressure (no-bluff symmetry)",
  },
  {
    axis: "autonomy",
    test: (t) => /\bwe (rebuilt|built|shipped|closed|signed|decided|cut|rewrote|negotiated)|\bi (built|led|wrote|negotiated|rebuilt)/i.test(t),
    delta: +5,
    reason: () => "first-person ownership of the work — did it, didn't delegate the story",
  },
  {
    axis: "curiosity",
    test: (t) => /rebuilt|redesign|iterat|learned|changed the|feedback|what we found/i.test(t),
    delta: +5,
    reason: () => "describes learning loops between attempts, not a static pitch",
  },
  {
    axis: "perseverance",
    test: (t) => /\b(nine|ten|\d+)\s*(days?|weeks?|months?)\b.*(on site|live|until|shipping)|kept|didn't stop|stayed/i.test(t),
    delta: +4,
    reason: () => "sustained effort with concrete duration — grit is dated, not claimed",
  },
  {
    axis: "stageClarity", // behavioral signal (thesis.behavioralSignals) — tracked, lower weight in axis
    test: (t) => /contracted|billing|next quarter|pipeline|cap table|runway|pre-money/i.test(t),
    delta: +4,
    reason: () => "distinguishes contracted vs. promised revenue — knows what stage they are at",
  },
  {
    axis: "stageClarity",
    test: (t) => /maybe|probably|hard to say|not sure|i guess|hopefully|i'd have to check/i.test(t),
    delta: -5,
    reason: () => "hedging on a question the stage demands an answer to",
  },
  {
    axis: "teamComplementarity",
    test: (t, ctx) => ctx.otherFounderSpoke && ctx.domainShift,
    delta: +4,
    reason: (ctx) => `covers ${ctx.domain} while the co-founder covered ${ctx.otherDomain} — no overlap, no gaps`,
  },
];

/** Thesis combination rule: aggression is a flag, never a score. */
const AGGRESSION = /obviously|clearly you|that's (just )?wrong|ridiculous|waste of time/i;
const CHALLENGE = /reconcile|discrepan|but the|help me|why (did|is|should)|convince|push back|what changed|walk me through/i;
const DOMAINS = [
  ["finance", /\$|arr|revenue|billing|contracted|cap table|runway|margin/i],
  ["product", /pilot|deploy|capture|flow|robot|hardware|ship|integration|on site/i],
  ["legal", /ip|assignment|university|patent|agreement/i],
];
const domainOf = (t) => DOMAINS.find(([, rx]) => rx.test(t))?.[0] ?? null;

export function createInterviewEvaluator({ thesis, card }) {
  const criteria = thesis.raw?.founderCriteria ?? thesis.founderCriteria;
  const weights = criteria?.subScores ?? {};
  const founders = {}; // who → { sub: {axis: score}, evidence: n, lastDomain }
  let lastAgent = null;
  let lastFounderWho = null;
  const model = card?.model ? JSON.parse(JSON.stringify(card.model)) : null;

  const founderState = (who) => (founders[who] ??= {
    sub: { resilience: 50, autonomy: 50, curiosity: 50, perseverance: 50, teamComplementarity: 50, stageClarity: 50 },
    evidence: 0,
  });

  /** Weighted founder axis with the thesis floor rule (ceiling traits). */
  function founderAxis(state) {
    let axis = 0;
    let capped = null;
    for (const [name, cfg] of Object.entries(weights)) {
      const s = state.sub[name] ?? 50;
      axis += (cfg.weight ?? 0) * s;
      if (s < (cfg.floor ?? 0)) capped = name;
    }
    axis = Math.round(axis);
    return capped ? { value: Math.min(axis, 45), cappedBy: capped } : { value: axis, cappedBy: null };
  }

  /** Negotiation extraction: valuation acceptance, pro-rata, ask changes. */
  function negotiationEvents(text) {
    if (!model) return [];
    const events = [];
    const val = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*(m\b|million)/i) ?? text.match(/\b(nine|eight|ten|eleven|twelve)\s+million/i);
    const WORDS = { eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
    const accepts = /yes|works for us|we want to have|can live with|deal|agree/i.test(text);
    if (val && accepts) {
      const v = WORDS[String(val[1]).toLowerCase()] ?? Number(val[1]);
      if (Number.isFinite(v) && v > 0 && v < 100) {
        model.founder.target = v;
        model.founder.range = [v - 1, v + 1];
        const lo = Math.max(model.investor.range[0], model.founder.range[0]);
        const hi = Math.min(model.investor.range[1], model.founder.range[1]);
        model.zopa = hi > lo ? [lo, hi] : null;
        model.confidence = clamp(model.confidence + 15); // spoken acceptance beats estimates
        events.push({
          type: "model.update",
          party: "founder",
          range: model.founder.range,
          zopa: model.zopa,
          confidence: model.confidence,
          note: `founder accepted $${v}M in the interview — range re-anchored from ask-multiple estimate to spoken word; ${model.zopa ? `ZOPA $${model.zopa[0]}–${model.zopa[1]}M` : "no ZOPA"}`,
        });
      }
    }
    if (/pro[- ]?rata/i.test(text)) {
      events.push({ type: "model.update", lever: "pro-rata", note: "pro-rata raised by the founder — lever now in play" });
    }
    return events;
  }

  return {
    /** Feed one transcript line; returns derived §3.3 events (possibly []). */
    ingestLine({ who, text }) {
      if (who === "Agent") {
        lastAgent = { text, challenge: CHALLENGE.test(text) };
        return [];
      }
      const state = founderState(who);
      const events = [];
      const domain = domainOf(text);
      const ctx = {
        challenged: lastAgent?.challenge ?? false,
        challenge: lastAgent ? lastAgent.text.slice(0, 60) + (lastAgent.text.length > 60 ? "…" : "") : "",
        otherFounderSpoke: lastFounderWho !== null && lastFounderWho !== who,
        domainShift: domain && lastFounderWho && founders[lastFounderWho]?.lastDomain && founders[lastFounderWho].lastDomain !== domain,
        domain,
        otherDomain: lastFounderWho ? founders[lastFounderWho]?.lastDomain : null,
      };

      if (AGGRESSION.test(text)) {
        events.push({
          type: "evaluation.update", who, axis: "flag", score: null, delta: 0,
          reason: "high assertiveness + low emotional control — flagged, not scored (thesis combination rule)",
          founderAxis: founderAxis(state).value, signalConfidence: clamp(30 + state.evidence * 6),
        });
      }

      for (const d of DETECTORS) {
        if (!d.test(text, ctx)) continue;
        state.sub[d.axis] = clamp((state.sub[d.axis] ?? 50) + d.delta);
        state.evidence += 1;
        const fa = founderAxis(state);
        events.push({
          type: "evaluation.update",
          who,
          axis: d.axis,
          score: state.sub[d.axis],
          delta: d.delta,
          reason: d.reason(ctx) + (fa.cappedBy ? ` · axis capped at ${fa.value}: ${fa.cappedBy} below thesis floor` : ""),
          founderAxis: fa.value,
          signalConfidence: clamp(30 + state.evidence * 6), // grows with corroborating moments
        });
      }

      events.push(...negotiationEvents(text));

      // AGENT HOOK: when an LLM key is set (lib/llm.js loadConfig()), a second
      // pass can re-judge this line and emit refined evaluation.update events
      // through the same bus — the deterministic layer above stays the floor.

      state.lastDomain = domain ?? state.lastDomain;
      lastFounderWho = who;
      lastAgent = null; // a challenge is only credited to the next answer
      return events;
    },

    /** Final state, for a summary card or the psychogram. */
    snapshot() {
      return Object.fromEntries(
        Object.entries(founders).map(([who, s]) => [who, { sub: { ...s.sub }, founderAxis: founderAxis(s).value, evidence: s.evidence }]),
      );
    },
    model: () => model,
  };
}
