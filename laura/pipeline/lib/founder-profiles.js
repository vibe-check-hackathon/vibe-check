// Founder profiling for inbound applications: turns a submitted application
// into per-founder profiles plus the personality hypotheses the AI interview
// then has to test (developing.js does the same for the canned Acme research —
// this is the generic path for whoever applies through the form).
//
// Guardrail: nothing here *scores* a founder. It produces open questions with a
// stated basis, all marked unverified, because the applicant is a real person
// who has not been assessed yet. Scoring happens only after the interview
// supplies evidence.

/** The five axes the psychogram reports on (see laura/founder-axis-scoring.md). */
export const AXES = ["Resilience", "Autonomy", "Curiosity", "Perseverance", "Co-founder fit"];

/**
 * AGENT HOOK — the real implementation enriches from LinkedIn and public
 * sources before drafting hypotheses. This deterministic stand-in derives them
 * from what the application itself claims, so the demo runs without network.
 */
export function fetchFounderPublicProfile(founder) {
  // The apply form now requires a LinkedIn URL per founder — prefer what was
  // actually supplied over a guessed handle.
  if (founder.linkedin) {
    return { linkedin: founder.linkedin, status: "supplied", fetchedAt: new Date().toISOString() };
  }
  const handle = String(founder.name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return {
    linkedin: handle ? `https://www.linkedin.com/in/${handle}` : null,
    // Nothing is corroborated until the research pass runs.
    status: "pending",
    fetchedAt: new Date().toISOString(),
  };
}

function initials(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Personality hypotheses for one founder, phrased as claims the interview can
 * confirm or contradict. Each carries the basis it was drawn from so the
 * investor can see why it was asked.
 */
export function buildHypotheses(founder, application) {
  const company = application.company ?? "the company";
  const sector = application.sector || "their sector";
  const round = application.round || application.stage || "this round";
  const role = founder.role ? `${founder.role} ` : "";

  return [
    {
      axis: "Resilience",
      text: `${founder.name} can name a concrete setback at ${company} and what changed afterwards, rather than a rehearsed narrative.`,
      basis: "No adversity evidence in the application; unfalsifiable until asked.",
    },
    {
      axis: "Autonomy",
      text: `The ${role}decisions at ${company} are actually theirs — scope, hiring and roadmap — not deferred to an advisor or the other founder.`,
      basis: `Self-reported founder record for a ${round} team.`,
    },
    {
      axis: "Curiosity",
      text: `Their read on ${sector} extends past their own product to why incumbents have not solved it.`,
      basis: `Sector claimed as ${sector}; depth not yet evidenced.`,
    },
    {
      axis: "Perseverance",
      text: `The stated timeline for ${company} survives contact with a specific, dated commitment.`,
      basis: application.ask
        ? `Raise stated as ${application.ask} without a milestone attached.`
        : "No raise or milestone stated in the application.",
    },
    {
      axis: "Co-founder fit",
      text:
        (application.founders?.length ?? 1) > 1
          ? `The split of authority between the founders is settled, and both describe it the same way.`
          : `A solo founder at ${company} has a deliberate plan for the gaps a co-founder would cover.`,
      basis: `${application.founders?.length ?? 1} founder(s) on the application.`,
    },
  ];
}

/**
 * Build the full founder profile set for an application. Called on submit, so
 * the investor sees profiles and hypotheses the moment a card appears.
 */
export function buildFounderProfiles(application, opportunityId) {
  const founders = (application.founders?.length ? application.founders : [
    { name: application.founderName, email: application.founderEmail },
  ]).filter((f) => f && f.name);

  return founders.map((founder, i) => ({
    id: `${opportunityId}-FND-${String(i + 1).padStart(3, "0")}`,
    name: founder.name,
    role: founder.role ?? (i === 0 ? "Founder" : null),
    email: founder.email ?? null,
    avatar: { type: "initials", value: initials(founder.name) },
    public: fetchFounderPublicProfile(founder),
    hypotheses: buildHypotheses(founder, application).map((h, j) => ({
      id: `${opportunityId}-HYP-${String(i + 1).padStart(2, "0")}${String(j + 1).padStart(2, "0")}`,
      ...h,
      status: "untested",
    })),
    // Explicit: no axis has evidence behind it yet.
    assessed: false,
    scores: null,
  }));
}
