import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Card, Badge } from "@/components/ui-kit";
import { FirstCheckLogo } from "@/components/FirstCheckLogo";
import { ACME_FOUNDERS } from "@/lib/data";
import {
  BookOpen, GraduationCap, Globe2, Headphones, ChevronDown, ExternalLink, Lock,
  Target, FlaskConical, TrendingUp, Wallet, Users2, PlayCircle, MapPin, CalendarDays,
} from "lucide-react";

export const Route = createFileRoute("/founder-world")({
  head: () => ({ meta: [{ title: "Founder World · FirstCheck" }] }),
  component: FounderWorldPage,
});

/* Public, standalone page, no login required, same as /apply. Shows the
 * research grounding behind the evaluation (real, named, mostly public
 * instruments and researchers) without revealing the exact interview
 * scripts, rubrics or scoring weights we actually run, those stay
 * gitignored, not published, per the team's own IP decision. Glossary
 * content transcribed in full (term + meaning + common mistake) from
 * laura/Founder_World_Adaptive_Jargon_Learning_and_Assessment.md section 3,
 * not condensed to term names only. Network/program links and podcast
 * search links are real, verifiable URLs, not fabricated ones. Per-founder
 * axis plot reuses ACME_FOUNDERS (the team's own consented demo data,
 * already shown on the investor side in founder.tsx) rather than inventing
 * new data or exposing any real applicant's private record on a public page.
 *
 * Ported from Martin/nexus-vetting-suite (2026-07-22): that app is TanStack
 * Start with SSR, this one is a frontend-only static SPA (see
 * FRONTEND_ONLY_MIGRATION.md / STRUCTURE.md), so unlike the original this
 * page needs no backend endpoint at all, it only reads ACME_FOUNDERS and its
 * own local data, which is why the port is a straight copy rather than a
 * re-architecture. */

const ILLUSTRATIVE = { label: "Illustrative example", axes: [
  { key: "Resilience", v: 78 },
  { key: "Autonomy", v: 72 },
  { key: "Curiosity", v: 81 },
  { key: "Perseverance", v: 69 },
  { key: "Co-founder fit", v: 75 },
]};

const RESEARCH_GROUNDING = [
  {
    construct: "Resilience / emotional stability",
    measure: "Big Five (BFI-2) / HEXACO",
    experts: "Christopher Soto, Oliver John; Kibeom Lee, Michael Ashton; Brent Roberts",
    note: "Shows up independently across every framework we reviewed as the strongest convergent signal for founder outcomes.",
    tease: {
      probes: [
        "We ask a founder to reconstruct one meaningful failure in five steps: what you believed before the decision, which early signal you missed or discounted, what was caused by you versus the team versus the environment, what actually changed in your process (not just your stated opinion), and where the revised approach was tested afterward.",
      ],
      scoring:
        "A low rating is denial, total externalization, or a generic lesson with no changed behavior behind it. A mid rating gives a specific, causal account that acknowledges personal contribution. A high rating separates controllable from external causes, weighs competing explanations, and shows the revised process being tested in a later situation. Grief, emotional style, or how fast someone recovers is never scored as competence.",
    },
  },
  {
    construct: "Entrepreneurial self-efficacy",
    measure: "ESE scale (searching, planning, marshaling, implementing)",
    experts: "Jeffrey McGee, Mark Peterson, Stephen Mueller, Jennifer Sequeira; Albert Bandura",
    note: "Confidence that's tied to a concrete domain, not a generic personality trait.",
    tease: {
      probes: [
        "For each domain (searching, planning, marshaling, implementing through people, implementing financially) we ask for a confidence rating from 0 to 100%, plus one concrete behavioral example.",
      ],
      scoring:
        "Confidence is never scored alone, it's paired with evidence into a calibration profile. High confidence with strong evidence is supported efficacy. High confidence with weak evidence is flagged for follow-up, not rewarded. Low confidence with strong evidence can just mean underconfidence, a development note, not a red flag. Uniformly high confidence across every domain is treated as a warning sign, not a strength.",
    },
  },
  {
    construct: "Decision calibration under uncertainty",
    measure: "Adult Decision-Making Competence (A-DMC)",
    experts: "Baruch Fischhoff, Wändi Bruine de Bruin, Andrew Parker",
    note: "Scored tasks (stated probability, base rate, disconfirming evidence) beat inferring judgment from how someone talks.",
    tease: {
      probes: [
        "“Using only resources already available to you, what could you test in the next two weeks?” (tests resource conversion, not network size or privilege.)",
        "“What can the company afford to lose on this experiment, and what loss would be unacceptable?” (tests whether downside and stopping conditions are defined before acting.)",
      ],
      scoring:
        "We score resource conversion, not inherited access, and we score defined downside, not general risk aversion. A founder who names a fixed loss they can afford scores higher than one who simply sounds confident. Improvisation that ignores safety, law or strategy is never rewarded as agility.",
    },
  },
  {
    construct: "Coachability and feedback use",
    measure: "Feedback-seeking behavior research",
    experts: "Susan Ashford",
    note: "Whether someone actively seeks disconfirming evidence and changes behavior, not whether they agree with the interviewer.",
    tease: {
      probes: [
        "“What difficult feedback did you actively seek in the last six months?” (one of several core questions in this module, chosen here because it best separates real feedback-seeking from a founder simply agreeing they value feedback.)",
      ],
      scoring:
        "One worked example of the outcome: a founder who names a specific piece of criticism they went looking for, restates it accurately, and can point to a concrete test they ran because of it lands near the top of the scale. A founder who cannot recall seeking out any difficult feedback, or who reflexively defends the original decision without engaging the criticism, lands near the bottom. Agreement with the interviewer in the room is never itself evidence, only a verified change in behavior counts.",
    },
  },
  {
    construct: "Entrepreneurial alertness",
    measure: "13-item alertness scale (scanning, association, evaluation)",
    experts: "Jintong Tang, K. Michele Kacmar, Lowell Busenitz; Masoud Karami",
    note: "Distinguishing a real weak signal from noise, a founder-relevant cognitive orientation, not a fixed trait.",
    tease: {
      probes: [
        "A market dossier with both obvious and non-obvious sources, scored on whether the founder selects relevant, varied sources and explains the boundaries of their search (scanning).",
        "A prompt for possible connections between a customer signal, a technology shift, and a regulatory change, scored on plausible relationships generated without presenting speculation as fact (association).",
        "A set of opportunities that includes attractive false positives, scored on whether evidence, unit economics, and falsification criteria are actually applied to reject the weak ones (evaluation).",
      ],
      scoring:
        "We record false-positive and false-negative rates on the task itself, not the raw number of opportunities named. Fluent idea generation on its own is not scored as alertness.",
    },
  },
  {
    construct: "Team psychological safety",
    measure: "7-item team climate scale",
    experts: "Amy Edmondson",
    tease: {
      probes: [
        "“What happens to someone who brings bad news late?” (tests whether the team punishes honesty about being behind or wrong.)",
        "“Describe a task disagreement that improved the result, and one that damaged the relationship.” (tests whether conflict stays focused on the work or turns personal.)",
      ],
      scoring:
        "This is scored as a property of the team, never averaged from one person's self-report. Strong evidence needs a visible process behind it, a retrospective, a dissent role, an escalation rule, a decision log, not just an assertion that the team communicates well.",
    },
    note: "A property of the team, not an individual score. Matches our own rule that co-founder fit is never averaged from two solo scores.",
  },
];

/* Standard, public psychological science, the OCEAN dimensions themselves,
 * not our interview questions or scoring weights (those stay unpublished). */
const BIG_FIVE = [
  { name: "Openness", meaning: "Curiosity, imagination and willingness to consider new ideas and methods." },
  { name: "Conscientiousness", meaning: "Organization, follow-through and attention to detail. Effects on founders are context-dependent, not simply positive." },
  { name: "Extraversion", meaning: "Sociability and assertiveness. Research shows this has little to no reliable link to founder outcomes." },
  { name: "Agreeableness", meaning: "Cooperativeness and trust in dealing with other people." },
  { name: "Neuroticism (inverse of resilience)", meaning: "Tendency toward negative emotion under stress. Lower scores track with the resilience signal above." },
];

type Term = { term: string; meaning: string; mistake: string };
type Category = { key: string; label: string; icon: typeof Target; terms: Term[] };

const GLOSSARY: Category[] = [
  {
    key: "problem",
    label: "Problem, customer and market",
    icon: Target,
    terms: [
      { term: "Customer segment", meaning: "A group with meaningfully similar needs or buying behavior", mistake: "Defining it only by broad demographics" },
      { term: "ICP", meaning: "Ideal Customer Profile: the type of customer most likely to receive and create value", mistake: "Treating every possible user as ideal" },
      { term: "User / buyer / economic buyer", meaning: "User operates the product; buyer runs the purchase; economic buyer controls the budget", mistake: "Assuming they are always the same person" },
      { term: "Pain point", meaning: "A costly, frequent or consequential customer problem", mistake: "Calling a minor preference a pain point" },
      { term: "Job-to-be-done", meaning: "The progress a customer is trying to make in a situation", mistake: "Describing product features instead of the customer's job" },
      { term: "Early adopter", meaning: "A customer willing to accept early limitations because the problem is urgent", mistake: "Anyone who says an idea sounds interesting" },
      { term: "TAM", meaning: "Total theoretical market demand under stated assumptions", mistake: "Presenting a huge top-down industry number as reachable revenue" },
      { term: "SAM", meaning: "Portion of TAM served by the current product and business model", mistake: "Ignoring geography, regulation or channel constraints" },
      { term: "SOM", meaning: "Realistically obtainable portion of SAM in a defined period", mistake: "Selecting an arbitrary percentage" },
      { term: "Beachhead market", meaning: "Narrow initial market chosen to establish strong adoption and references", mistake: "Launching broadly to avoid making a choice" },
      { term: "Substitute", meaning: "Any alternative way the customer solves or tolerates the problem", mistake: "Counting only products that look technically similar" },
      { term: "Moat", meaning: "A defensible advantage that becomes difficult to copy or displace", mistake: "Treating a feature or first-mover claim as automatically durable" },
    ],
  },
  {
    key: "product",
    label: "Product and evidence",
    icon: FlaskConical,
    terms: [
      { term: "Assumption", meaning: "Something that must be true for the venture to work", mistake: "Leaving it implicit and therefore untestable" },
      { term: "Hypothesis", meaning: "A falsifiable prediction connecting an action or condition to an observable result", mistake: "Writing a hope with no failure threshold" },
      { term: "Prototype", meaning: "Representation used to learn about design, function or interaction", mistake: "Building production infrastructure before learning" },
      { term: "MVP", meaning: "Minimum viable product or test that generates decision-relevant learning", mistake: "A bad first version with no explicit learning goal" },
      { term: "Proof of principle", meaning: "Evidence that the underlying scientific/technical mechanism can work", mistake: "Claiming product readiness" },
      { term: "Proof of concept", meaning: "Evidence that a defined implementation can work in a relevant context", mistake: "Claiming scalable production or market demand" },
      { term: "Pilot", meaning: "Limited real-world implementation with defined parties, scope and outcomes", mistake: "Free, indefinite usage with no success criteria" },
      { term: "Product-market fit", meaning: "Strong, repeatable evidence that a defined market values and retains the product", mistake: "One famous customer, press attention or revenue bought through unsustainable effort" },
      { term: "Vanity metric", meaning: "A number that looks positive but does not reliably guide a decision", mistake: "Reporting registrations without activation or retention" },
      { term: "Cohort", meaning: "A group sharing a start period or meaningful characteristic, tracked over time", mistake: "Mixing old and new customers into one average" },
    ],
  },
  {
    key: "business",
    label: "Business model, sales and growth",
    icon: TrendingUp,
    terms: [
      { term: "Revenue model", meaning: "How the company earns money", mistake: "Confusing it with the full business model" },
      { term: "Business model", meaning: "How the venture creates, delivers and captures value", mistake: "Describing only pricing" },
      { term: "GTM", meaning: "Go-to-market: how a specific market is reached, sold, onboarded and retained", mistake: "“We will use social media”" },
      { term: "Channel", meaning: "Route through which a customer is reached or served", mistake: "Assuming a partner will sell without incentives and enablement" },
      { term: "Funnel", meaning: "Stages through which prospects become and remain customers", mistake: "Optimizing top-of-funnel volume while ignoring retention" },
      { term: "Pipeline", meaning: "Qualified potential deals and their stages, value and probability", mistake: "Counting every contact as a qualified opportunity" },
      { term: "Champion", meaning: "Person inside an organization who actively helps the purchase succeed", mistake: "Confusing friendliness with influence" },
      { term: "Sales cycle", meaning: "Time from qualified opportunity to purchase/close", mistake: "Ignoring procurement, security, legal and budget timing" },
      { term: "Activation", meaning: "First behavior showing the user has reached meaningful value", mistake: "Using account creation as activation by default" },
      { term: "Retention", meaning: "Continued use or purchasing by the same cohort", mistake: "Measuring only new acquisition" },
      { term: "Churn", meaning: "Customers or recurring revenue lost during a period", mistake: "Mixing logo churn and revenue churn" },
    ],
  },
  {
    key: "metrics",
    label: "Metrics, finance and ownership",
    icon: Wallet,
    terms: [
      { term: "Gross margin", meaning: "Revenue minus direct cost of delivering it, divided by revenue", mistake: "Excluding material direct delivery costs to look more attractive" },
      { term: "CAC", meaning: "Customer-acquisition cost under a stated method and period", mistake: "Dividing only ad spend by new customers while excluding sales cost" },
      { term: "LTV", meaning: "Expected gross-profit contribution over the customer relationship", mistake: "Using revenue, infinite retention or optimistic cohorts" },
      { term: "CAC payback", meaning: "Time required for customer gross profit to recover acquisition cost", mistake: "Using bookings instead of realized contribution" },
      { term: "MRR / ARR", meaning: "Monthly/annual recurring revenue normalized from recurring contracts", mistake: "Including one-off services or non-recurring commitments" },
      { term: "Burn", meaning: "Net cash consumed over a period", mistake: "Using accounting loss without reconciling cash" },
      { term: "Runway", meaning: "Time until cash is exhausted under explicit burn assumptions", mistake: "Treating current burn as fixed despite planned hires or revenue risk" },
      { term: "Break-even", meaning: "Point where the defined revenue/contribution covers the defined costs", mistake: "Failing to say whether this means cash, operating or accounting break-even" },
      { term: "Cap table", meaning: "Record/model of ownership and rights across securities", mistake: "Showing percentages without options, convertibles or scenario assumptions" },
      { term: "Pre-money valuation", meaning: "Agreed company value immediately before new investment", mistake: "Adding the new cash twice" },
      { term: "Post-money valuation", meaning: "Pre-money valuation plus new primary investment, subject to deal mechanics", mistake: "Ignoring option-pool or convertible treatment" },
      { term: "Dilution", meaning: "Reduction in an existing holder's percentage when new securities are issued", mistake: "Assuming lower percentage always means lower economic value" },
      { term: "SAFE", meaning: "Contract giving future equity rights under specified conversion terms, not ordinary equity at signing", mistake: "Treating every SAFE as identical or as debt" },
      { term: "Convertible note/loan", meaning: "Debt intended or permitted to convert into equity under stated triggers", mistake: "Ignoring maturity, interest, cap, discount and priority" },
      { term: "Priced round", meaning: "Equity financing in which share price and company valuation are set", mistake: "Assuming the headline valuation describes every economic term" },
      { term: "Liquidation preference", meaning: "Contractual rule allocating proceeds before or alongside common shareholders in specified exits", mistake: "Looking only at ownership percentages" },
      { term: "Pro rata right", meaning: "Right to invest in a later round to preserve an ownership percentage", mistake: "Calling it guaranteed allocation regardless of documents" },
      { term: "Term sheet", meaning: "Usually non-binding summary of principal transaction terms, with specified binding exceptions", mistake: "Treating it as closed financing" },
      { term: "Due diligence", meaning: "Investigation of company, team, market, technology, legal and financial claims", mistake: "Treating it as a formality after verbal interest" },
    ],
  },
  {
    key: "team",
    label: "Team, legal and ecosystem",
    icon: Users2,
    terms: [
      { term: "Vesting", meaning: "Earning equity over time or milestones", mistake: "Issuing permanent founder ownership without departure provisions" },
      { term: "Cliff", meaning: "Initial period before the first portion vests", mistake: "Assuming it removes all negotiation or legal complexity" },
      { term: "Option pool", meaning: "Shares reserved for employee/advisor equity awards", mistake: "Ignoring whether it is created before or after an investment" },
      { term: "Board", meaning: "Formal governing body with legal duties and defined powers", mistake: "Treating it as an informal mentor group" },
      { term: "Advisor", meaning: "External person providing defined expertise or access", mistake: "Granting equity for reputation without deliverables or vesting" },
      { term: "IP assignment", meaning: "Transfer of specified intellectual-property rights to another owner", mistake: "Assuming payment for work automatically transfers every right" },
      { term: "License", meaning: "Permission to use defined rights under conditions without necessarily changing ownership", mistake: "Saying “we own it” when the company has only limited rights" },
      { term: "Freedom to operate (FTO)", meaning: "Legal analysis of potential infringement risk for commercial activity", mistake: "Equating a patent search with an FTO opinion" },
      { term: "Accelerator", meaning: "Usually fixed-term, selective venture-development program, economics vary", mistake: "Assuming all accelerators invest or take equity" },
      { term: "Incubator", meaning: "Longer or flexible venture support, often tied to region or institution", mistake: "Assuming admission is investment validation" },
      { term: "Angel", meaning: "Individual investing personal capital, often at early stage", mistake: "Treating a mentor or introduction as an investor commitment" },
      { term: "VC", meaning: "Fund manager investing pooled capital under a strategy and return model", mistake: "Assuming every VC fits every stage, sector or geography" },
      { term: "Strategic investor", meaning: "Corporate investor seeking financial and/or strategic benefit", mistake: "Ignoring exclusivity, information and commercial conflicts" },
      { term: "Technology transfer office", meaning: "Institution function managing commercialization, IP and agreements", mistake: "Assuming the founder controls institution-owned IP" },
    ],
  },
];

/* Every URL below is copied from laura/Germany_US_Founder_Networks_Training_
 * and_Access_Overview(1).md, not guessed, that document already verified
 * each program's own official page. */
const NETWORKS = [
  {
    row: "Public first stop",
    germany: [{ name: "Grunderplattform", url: "https://gruenderplattform.de/" }, { name: "de:hub", url: "https://www.de-hub.de/" }],
    us: [{ name: "SBA Resource Partners", url: "https://www.sba.gov/local-assistance/resource-partners" }, { name: "SBA Learning", url: "https://www.sba.gov/sba-learning-platform" }],
  },
  {
    row: "Accelerator route",
    germany: [{ name: "German Accelerator", url: "https://www.germanaccelerator.com/" }, { name: "HTGF", url: "https://www.htgf.de/en/venture-capital-investor-2/" }],
    us: [{ name: "Y Combinator", url: "https://www.ycombinator.com/apply" }, { name: "Techstars", url: "https://www.techstars.com/accelerators" }, { name: "MassChallenge", url: "https://masschallenge.org/programs-all/" }],
  },
  {
    row: "Angel route",
    germany: [{ name: "BAND", url: "https://www.business-angels.de/" }, { name: "BayStartUP", url: "https://www.baystartup.de/en/startups/access-to-the-investors-network" }],
    us: [{ name: "Angel Capital Association", url: "https://angelcapitalassociation.org/directory/" }],
  },
  {
    row: "Open training",
    germany: [{ name: "Grunderplattform events", url: "https://gruenderplattform.de/events" }],
    us: [{ name: "YC Startup School", url: "https://www.startupschool.org/" }, { name: "Startup Grind", url: "https://www.startupgrind.com/" }],
  },
  {
    row: "Cross-border bridge",
    germany: [{ name: "German Accelerator U.S. programs", url: "https://www.germanaccelerator.com/our-markets/us" }],
    us: [{ name: "SelectUSA Tech", url: "https://www.trade.gov/selectusa-tech" }],
  },
  {
    row: "Global hackathon",
    germany: [{ name: "Hack-Nation (Munich hub)", url: "https://hack-nation.ai/" }],
    us: [{ name: "Hack-Nation (Stanford / MIT hubs)", url: "https://hack-nation.ai/" }],
  },
];

function LinkList({ items }: { items: { name: string; url: string }[] }) {
  return (
    <span className="space-x-2">
      {items.map((it) => (
        <a
          key={it.url}
          href={it.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          {it.name} <ExternalLink className="h-3 w-3" />
        </a>
      ))}
    </span>
  );
}

/* Real, dated opportunities, checked live (July 2026) against each program's
 * own site rather than guessed. Dates, cities and prices are the organizer's
 * own published figures at the time of checking. Precise about tense on
 * purpose: Hack-Nation's global round already happened this cycle (hubs
 * including Cambridge and London), so it is labeled past, not upcoming, the
 * only genuinely upcoming date for it is each team's local evaluation. */
type Opportunity = {
  name: string;
  dateLabel: string;
  sortDate: string;
  city: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  free: boolean;
  cost: string;
  url: string;
  note: string;
};

const OPPORTUNITIES: Opportunity[] = [
  {
    name: "Hack-Nation awards ceremony",
    dateLabel: "Next weekend, Jul 25 to 26, 2026",
    sortDate: "2026-07-25",
    city: "Cambridge (MIT hub)",
    country: "Global",
    region: "Follow-up to the hackathon itself, which already ran last week across hubs including Cambridge and London.",
    lat: 42.36,
    lon: -71.09,
    free: true,
    cost: "Free",
    url: "https://hack-nation.ai/",
    note: "We already participated in the hackathon itself last week. This is the follow-up awards ceremony, check hack-nation.ai for your own hub's exact time and venue.",
  },
  {
    name: "Y Combinator, Fall 2026 batch",
    dateLabel: "Apply by Jul 27, 2026",
    sortDate: "2026-07-27",
    city: "San Francisco",
    country: "USA",
    region: "USA",
    lat: 37.77,
    lon: -122.42,
    free: true,
    cost: "Free to apply",
    url: "https://www.ycombinator.com/apply",
    note: "On-time deadline for the batch running October to December. YC invests $500k for 7% if accepted, there is no cost to apply.",
  },
  {
    name: "HackMIT 2026",
    dateLabel: "Sep 19 to 20, 2026",
    sortDate: "2026-09-19",
    city: "Cambridge",
    country: "USA",
    region: "USA",
    lat: 42.36,
    lon: -71.09,
    free: true,
    cost: "Free for accepted hackers",
    url: "https://hackmit.org/",
    note: "MIT's own student hackathon, 1,000+ undergraduate developers and designers on campus for a 24 to 36 hour build.",
  },
  {
    name: "Bits & Pretzels 2026",
    dateLabel: "Sep 28 to 30, 2026",
    sortDate: "2026-09-28",
    city: "Munich",
    country: "Germany",
    region: "Germany",
    lat: 48.14,
    lon: 11.58,
    free: false,
    cost: "From EUR 399 early bird",
    url: "https://www.bitsandpretzels.com/",
    note: "Europe's largest founders festival, three days of sessions and investor networking that close at Oktoberfest.",
  },
  {
    name: "TechCrunch Disrupt 2026",
    dateLabel: "Oct 13 to 15, 2026",
    sortDate: "2026-10-13",
    city: "San Francisco",
    country: "USA",
    region: "USA",
    lat: 37.77,
    lon: -122.42,
    free: false,
    cost: "From about $1,295",
    url: "https://techcrunch.com/events/techcrunch-disrupt/",
    note: "10,000+ founders, operators and investors at Moscone West.",
  },
  {
    name: "The Dartmouth Conference, Revisited (AI@70)",
    dateLabel: "Oct 29 to 30, 2026",
    sortDate: "2026-10-29",
    city: "Hanover, NH",
    country: "USA",
    region: "USA",
    lat: 43.70,
    lon: -72.29,
    free: false,
    cost: "Check organizer page",
    url: "https://ai.dartmouth.edu/70th-anniversary",
    note: "The flagship event of Dartmouth's 70th-anniversary-of-AI year, marking the 1956 workshop that coined the term. Keynotes, panels, a student hackathon and a ceremony at Dartmouth Hall.",
  },
  {
    name: "Web Summit 2026",
    dateLabel: "Nov 9 to 12, 2026",
    sortDate: "2026-11-09",
    city: "Lisbon",
    country: "Portugal",
    region: "Portugal",
    lat: 38.72,
    lon: -9.14,
    free: false,
    cost: "Paid, tiered pricing",
    url: "https://websummit.com/",
    note: "One of the largest tech conferences in the world, tens of thousands of attendees.",
  },
  {
    name: "HPI Digital Health Innovation Forum",
    dateLabel: "Mar 17 to 18, 2027",
    sortDate: "2027-03-17",
    city: "Potsdam",
    country: "Germany",
    region: "Germany",
    lat: 52.40,
    lon: 13.07,
    free: false,
    cost: "Check organizer page",
    url: "https://hpi.de/en/hpi-digital-health-innovation-forum/",
    note: "Hasso Plattner Institute's own health-tech forum, researchers, industry and policy on data-driven care, telemedicine and AI diagnostics. The 2026 edition already ran in March, this is the confirmed next one.",
  },
];

/* Already happened this cycle, included because they were asked for, but kept
 * out of the upcoming timeline so "next" stays honest. Each recurs annually;
 * no confirmed next-year date exists yet, stated as such rather than guessed. */
type PastEvent = { name: string; whenLabel: string; city: string; url: string };
const RECENTLY_HAPPENED: PastEvent[] = [
  { name: "Hack-Nation, Global AI Hackathon", whenLabel: "participated, last week", city: "Cambridge, London and other hubs", url: "https://hack-nation.ai/" },
  { name: "HackDartmouth XI", whenLabel: "already happened, Apr 11 to 12, 2026", city: "Hanover, NH, USA", url: "https://hack-dartmouth.org/" },
  { name: "DALI TechniGala", whenLabel: "already happened, Jun 3, 2026", city: "Hanover, NH, USA", url: "https://dali.dartmouth.edu/technigala" },
  { name: "HackHPI 2026", whenLabel: "already happened, Apr 10 to 11, 2026", city: "Potsdam, Germany", url: "https://hackhpi.org/" },
];

/* Real hub cities where Hack-Nation's global round already ran this cycle,
 * shown on the map for spread, not as individually clickable timeline cards
 * since the concrete next date for the team is the local evaluation above. */
const HACKNATION_HUBS = [
  { city: "Cambridge (MIT)", lat: 42.36, lon: -71.09 },
  { city: "London", lat: 51.51, lon: -0.13 },
  { city: "Paris", lat: 48.85, lon: 2.35 },
  { city: "Munich", lat: 48.14, lon: 11.58 },
  { city: "Zurich", lat: 47.37, lon: 8.54 },
  { city: "Delhi", lat: 28.61, lon: 77.21 },
];

/* This app has no SSR (see FRONTEND_ONLY_MIGRATION.md), so a static ESM
 * import of leaflet/react-leaflet would work here, but the script-tag loader
 * is kept anyway: it is already vendored, already verified, and avoids
 * adding a new npm dependency to a codebase this port doesn't otherwise
 * touch. */
declare global {
  interface Window {
    L?: any;
  }
}

let leafletLoading: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("client-only"));
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoading) return leafletLoading;
  leafletLoading = new Promise((resolve, reject) => {
    // This app builds under a GitHub Pages subpath (base: "/vibe-check/" in
    // vite.config.ts), so an absolute "/vendor/..." path 404s once deployed.
    // import.meta.env.BASE_URL is Vite's own resolved base, correct in dev,
    // preview and the deployed subpath alike.
    const base = import.meta.env.BASE_URL;
    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${base}vendor/leaflet/leaflet.css`;
      link.setAttribute("data-leaflet-css", "1");
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = `${base}vendor/leaflet/leaflet.js`;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("failed to load leaflet.js"));
    document.body.appendChild(script);
  });
  return leafletLoading;
}

function OpportunityMap({
  opportunities,
  hubs,
}: {
  opportunities: Opportunity[];
  hubs: { city: string; lat: number; lon: number }[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const byCity = new Map<string, Opportunity[]>();
  for (const o of opportunities) {
    const k = `${o.city}|${o.lat}|${o.lon}`;
    byCity.set(k, [...(byCity.get(k) ?? []), o]);
  }
  const opportunityCoords = new Set(opportunities.map((o) => `${o.lat.toFixed(1)},${o.lon.toFixed(1)}`));
  const groups = [...byCity.entries()];

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([40, -30], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !window.L || !mapRef.current || !layerRef.current) return;
    const L = window.L;
    layerRef.current.clearLayers();

    const brightIcon = L.divIcon({
      className: "",
      html: `<span style="position:relative;display:flex;height:14px;width:14px">
        <span style="position:absolute;inline-size:100%;block-size:100%;border-radius:9999px;background:var(--primary);opacity:0.5"></span>
        <span style="position:relative;inline-size:14px;block-size:14px;border-radius:9999px;background:var(--primary);border:2px solid var(--background)"></span>
      </span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    const hubIcon = L.divIcon({
      className: "",
      html: `<span style="display:block;inline-size:8px;block-size:8px;border-radius:9999px;background:var(--muted-foreground);opacity:0.6;border:1px solid var(--background)"></span>`,
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });

    for (const h of hubs) {
      if (opportunityCoords.has(`${h.lat.toFixed(1)},${h.lon.toFixed(1)}`)) continue;
      L.marker([h.lat, h.lon], { icon: hubIcon })
        .bindPopup(`${h.city}, Hack-Nation hub, global round already ran here`)
        .addTo(layerRef.current);
    }
    for (const [, group] of groups) {
      const popupHtml = `<div style="font-size:12px"><div style="font-weight:600">${group[0].city.replace(/\s*\(.*\)/, "")}</div>${group
        .map((o) => `<div style="margin-top:4px">${o.name}<br/>${o.dateLabel}, ${o.cost}</div>`)
        .join("")}</div>`;
      L.marker([group[0].lat, group[0].lon], { icon: brightIcon }).bindPopup(popupHtml).addTo(layerRef.current);
    }

    const points: [number, number][] = groups.map(([, g]) => [g[0].lat, g[0].lon]);
    if (points.length === 1) mapRef.current.setView(points[0], 5);
    else if (points.length > 1) mapRef.current.fitBounds(points, { padding: [30, 30] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, opportunities]);

  return (
    <Card className="p-3">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-md border border-border bg-surface"
        style={{ height: 380 }}
      />
      {!ready && (
        <p className="mt-2 text-[10.5px] text-muted-foreground">Loading map…</p>
      )}
      <p className="mt-2 text-[10.5px] text-muted-foreground">
        Bright pins are the opportunities below, filtered to match, click one for details. Small grey dots
        are Hack-Nation's other hub cities where the global round already ran this cycle. Real OpenStreetMap
        tiles, no API key or account involved.
      </p>
    </Card>
  );
}

function OpportunityTimeline({ opportunities }: { opportunities: Opportunity[] }) {
  const sorted = [...opportunities].sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1">
      {sorted.map((o) => (
        <a
          key={o.name}
          href={o.url}
          target="_blank"
          rel="noreferrer"
          className="group shrink-0 basis-[220px] snap-start rounded-md border border-border p-3 hover:border-primary/50 hover:bg-surface/60 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-primary">
            <CalendarDays className="h-3 w-3" /> {o.dateLabel}
          </div>
          <div className="mt-1 text-[12.5px] font-medium leading-snug">{o.name}</div>
          <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {o.city}, {o.country}
          </div>
          <div className="mt-1.5">
            <Badge tone={o.free ? "positive" : "outline"}>{o.cost}</Badge>
          </div>
          <p className="mt-1.5 text-[10.5px] text-muted-foreground">{o.note}</p>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary group-hover:underline">
            Details <ExternalLink className="h-3 w-3" />
          </div>
        </a>
      ))}
    </div>
  );
}

/* Organized by trait, not one fixed list. Each founder's own weakest axis
 * determines which section opens by default, personalized to what that
 * person actually needs, not the same recommendations for everyone. The
 * "practice" line is general, widely known startup coaching advice, not our
 * unpublished interview methodology.
 *
 * Resources below are real videos/episodes, checked live (July 2026) against
 * YouTube and Spotify search rather than guessed, favoring well-known shows
 * and channels with real view counts over generic or spammy hits. Each links
 * straight to that video/episode, not a canned search page. */
type Resource = { name: string; by: string; about: string; type: "video" | "podcast"; url: string };
type LearningTrait = {
  key: string;
  why: string;
  practice: string;
  resources: Resource[];
};

const LEARNING_BY_TRAIT: LearningTrait[] = [
  {
    key: "Resilience",
    why: "The strongest convergent signal across every framework we reviewed. Composure and recovery under pressure.",
    practice: "Keep a short written log of setbacks and what actually changed afterward. It becomes real evidence instead of a story you tell yourself later.",
    resources: [
      { name: "Lessons from 1,000+ YC startups: resilience, tar-pit ideas, pivoting", by: "Dalton Caldwell, on Lenny's Podcast", about: "What separates founders who recover from a bad quarter from those who don't, from someone who has watched over a thousand tries", type: "video", url: "https://www.youtube.com/watch?v=m7LvNTbaqSI" },
      { name: "Mark Pincus on why most startups fail, and founder control", by: "a16z Speedrun", about: "A repeat founder on what actually breaks companies and what recovering from it looks like", type: "video", url: "https://www.youtube.com/watch?v=t7iv3N-hG-4" },
      { name: "Inside the minds of the most successful founders", by: "David Senra, Founders podcast", about: "Patterns of recovery and composure drawn from founder biographies, not motivational talk", type: "podcast", url: "https://open.spotify.com/episode/4FGbK3JPx54D3MuFGm2cmA" },
    ],
  },
  {
    key: "Autonomy",
    why: "A ceiling trait. Score low here and nothing else compensates, since investors are betting on someone who performs when they are not in the room.",
    practice: "Practice making one consequential decision a week without waiting for consensus, then review the outcome honestly.",
    resources: [
      { name: "Solo founder, $80M exit in 6 months: the Base44 story", by: "Maor Shlomo, on Lenny's Podcast", about: "What it actually looks like to own every consequential call with no one else in the room", type: "video", url: "https://www.youtube.com/watch?v=L9KvV_UOs3A" },
      { name: "The future of decision-making: 3 startup opportunities", by: "a16z", about: "How founders structure fast, self-owned decisions instead of waiting on consensus", type: "video", url: "https://www.youtube.com/watch?v=GmR408KQ0Ko" },
      { name: "The quest for the one-person, one-billion-dollar company", by: "a16z Podcast", about: "How far genuinely solo ownership of every decision can scale, and where it breaks", type: "podcast", url: "https://open.spotify.com/episode/7cyZutrah62oKWp40JDdDO" },
    ],
  },
  {
    key: "Curiosity",
    why: "Updating on evidence rather than defending the original plan. Tied to openness, one of the two Big Five traits that actually predicted raising a first round.",
    practice: "Schedule customer conversations on a fixed cadence even when things are going well, not only when something breaks.",
    resources: [
      { name: "The single biggest reason why startups succeed", by: "Bill Gross, TED", about: "A study of hundreds of startups built on genuine curiosity about what actually determined the outcome, not a hunch", type: "video", url: "https://www.youtube.com/watch?v=bNpx7gpSqbY" },
      { name: "5 life learnings from 5 years of the Curiosity Chronicle", by: "The Curiosity Chronicle", about: "What sustained curiosity looks like as a practice, not a personality trait you either have or don't", type: "podcast", url: "https://open.spotify.com/episode/6b5GtRtkP8PU4jdwk3KhPc" },
      { name: "Jim Collins on curiosity, generosity and the hedgehog concept", by: "Brené Brown, on Dare to Lead", about: "The author of Good to Great on staying genuinely curious about being wrong", type: "podcast", url: "https://open.spotify.com/episode/6fjipwsohxCpKUD8r2vIIL" },
    ],
  },
  {
    key: "Perseverance",
    why: "Distinct from resilience. Low perseverance does not cause dramatic failure, it causes premature pivoting, the company stops rather than fails.",
    practice: "Set a fixed review interval, for example ninety days, before a pivot decision is even allowed on the table, to separate a real signal from a reactive one.",
    resources: [
      { name: "Pivot or persevere? A Slack founder on knowing when to quit", by: "Forbes", about: "Stewart Butterfield on the actual decision process behind staying the course versus stopping", type: "video", url: "https://www.youtube.com/watch?v=YbbYf7OPCcs" },
      { name: "Startup experts reveal their favorite pivot stories", by: "Y Combinator", about: "Real accounts of when sticking with it paid off, and when it didn't", type: "video", url: "https://www.youtube.com/watch?v=DmehFuCMtvc" },
      { name: "How to Start a Startup, lecture 1", by: "Sam Altman and Dustin Moskovitz, Stanford", about: "The original, still-referenced Stanford course on what building for the long haul actually requires", type: "podcast", url: "https://open.spotify.com/episode/0nOo7dUvMyjRM5hcPTwbqh" },
    ],
  },
  {
    key: "Co-founder fit",
    why: "A team-level property, not an individual score. Roughly two-thirds of startup failures trace back to people problems, not the market.",
    practice: "Run a recurring, structured check-in with your co-founder specifically about how decisions get made, not just which decisions were made.",
    resources: [
      { name: "How much equity to give your co-founder", by: "Michael Seibel, Y Combinator", about: "A concrete framework for the conversation most co-founder pairs avoid having explicitly", type: "video", url: "https://www.youtube.com/watch?v=9NhEBVPlJs4" },
      { name: "Co-founder mistakes that kill companies, and how to avoid them", by: "Y Combinator", about: "Recurring, avoidable failure patterns between co-founders, not market failure", type: "video", url: "https://www.youtube.com/watch?v=dlfjs_eEEzs" },
      { name: "How to find a co-founder", by: "Harj Taggar, Y Combinator Startup School", about: "What complementary fit actually looks like before the equity conversation even starts", type: "podcast", url: "https://open.spotify.com/episode/5KN77mGWY7eL0Q5JYAAsQp" },
    ],
  },
];

function ResearchCard({ item }: { item: (typeof RESEARCH_GROUNDING)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-l-2 border-l-primary/50 p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] font-medium">{item.construct}</span>
        <Badge tone="outline">{item.measure}</Badge>
      </div>
      <p className="mt-1 text-[11.5px] text-muted-foreground">{item.note}</p>
      <p className="mt-1 text-[10.5px] text-muted-foreground/80">{item.experts}</p>
      {item.tease && (
        <div className="mt-2 border-t border-border pt-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            <ChevronDown className={"h-3 w-3 transition-transform " + (open ? "rotate-180" : "")} />
            See how we actually probe for this
          </button>
          {open && (
            <div className="mt-2 space-y-2 rounded-md bg-surface/60 p-2.5">
              {item.tease.probes.map((p) => (
                <p key={p} className="text-[11px] text-foreground/90">{p}</p>
              ))}
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium">How it's scored:</span> {item.tease.scoring}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                One module out of many, shown to make the process legible, not to reveal the full scorecard.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function GlossaryAccordion({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const Icon = category.icon;
  return (
    <Card className="p-0 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface/60 transition-colors"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-teal-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">{category.label}</div>
          <div className="text-[11px] text-muted-foreground">{category.terms.length} terms</div>
        </span>
        <ChevronDown className={"h-4 w-4 text-muted-foreground shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="divide-y divide-border border-t border-border">
          {category.terms.map((t) => (
            <div key={t.term} className="px-4 py-3">
              <div className="text-[12.5px] font-medium">{t.term}</div>
              <div className="mt-0.5 text-[12px] text-foreground/90">{t.meaning}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                <span className="font-medium">Common mistake:</span> {t.mistake}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TraitAccordion({ trait, defaultOpen, highlighted }: { trait: LearningTrait; defaultOpen: boolean; highlighted: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className={"p-0 overflow-hidden " + (highlighted ? "border-primary/60" : "")}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface/60 transition-colors"
      >
        <span className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium">{trait.key}</span>
            {highlighted && <Badge tone="positive">Focus area</Badge>}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{trait.why}</div>
        </span>
        <ChevronDown className={"h-4 w-4 text-muted-foreground shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          <div className="rounded-md bg-surface border border-border p-2.5 text-[11.5px] text-foreground/90">
            <span className="font-medium">Try this: </span>{trait.practice}
          </div>
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1">
            {trait.resources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="group shrink-0 basis-[240px] snap-start rounded-md border border-border p-2.5 hover:border-primary/50 hover:bg-surface/60 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  {r.type === "podcast" ? <Headphones className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
                  {r.type === "podcast" ? "Podcast" : "Video"}
                </div>
                <div className="mt-1 text-[12px] font-medium leading-snug">{r.name}</div>
                <div className="text-[10.5px] text-muted-foreground">{r.by}</div>
                <div className="mt-1 text-[11px] text-foreground/80">{r.about}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary group-hover:underline">
                  Watch or listen <ExternalLink className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

const OPPORTUNITY_COUNTRIES = ["All", ...Array.from(new Set(OPPORTUNITIES.map((o) => o.country)))];
const TIMEFRAMES: { key: string; label: string; upTo: string | null }[] = [
  { key: "all", label: "All", upTo: null },
  { key: "30d", label: "Next 30 days", upTo: "2026-08-21" },
  { key: "3m", label: "Next 3 months", upTo: "2026-10-21" },
  { key: "later", label: "Later", upTo: null },
];

export function FounderWorldPage() {
  const [selected, setSelected] = useState<string>("illustrative");
  const [bigFiveOpen, setBigFiveOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState("All");
  const [timeframeFilter, setTimeframeFilter] = useState("all");

  const founder = selected === "illustrative" ? null : ACME_FOUNDERS.find((f) => f.id === selected);
  const radarData = founder ? founder.axes.map((a) => ({ key: a.key, v: a.v })) : ILLUSTRATIVE.axes;
  const weakestKeys = founder
    ? founder.axes.filter((a) => a.v === Math.min(...founder.axes.map((x) => x.v))).map((a) => a.key)
    : [];

  const filteredOpportunities = OPPORTUNITIES.filter((o) => {
    if (countryFilter !== "All" && o.country !== countryFilter) return false;
    if (timeframeFilter === "30d") return o.sortDate <= "2026-08-21";
    if (timeframeFilter === "3m") return o.sortDate <= "2026-10-21";
    if (timeframeFilter === "later") return o.sortDate > "2026-10-21";
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <FirstCheckLogo className="h-4 w-auto text-foreground" />
          <span className="text-[13px] text-muted-foreground">· founder world</span>
        </div>
        <Link to={"/apply" as never} className="text-[12px] text-muted-foreground hover:text-foreground">
          Back to apply
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Founder World</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            What our evaluation is grounded in, the vocabulary of this world in plain language, every term with its
            meaning and the mistake people usually make with it, and where to keep learning. This page shows the
            research we build on, not the exact interview script or scoring weights we actually run, which stay
            unpublished.
          </p>
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-medium">Grounded in real research, not vibes</h2>
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Plot:</span>
              <button
                onClick={() => setSelected("illustrative")}
                className={"h-7 rounded-md border px-2.5 text-[11.5px] " + (selected === "illustrative" ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface")}
              >
                Illustrative example
              </button>
              {ACME_FOUNDERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelected(f.id)}
                  className={"h-7 rounded-md border px-2.5 text-[11.5px] " + (selected === f.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface")}
                >
                  {f.name.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="h-[280px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="68%" margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="key" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.18} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {founder ? (
              <div className="rounded-md border border-warning/40 bg-warning/5 px-3 py-2.5 flex items-start gap-2 text-[11.5px] text-foreground/90">
                <Lock className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                <span>
                  <span className="font-medium">{founder.name}</span>, {founder.role}. This is the FirstCheck team's
                  own consented demo scoring, the same one shown on the investor board, not a real applicant's
                  private evaluation. <span className="font-medium">Background:</span> {founder.history}{" "}
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-primary hover:underline"
                  >
                    View {founder.name.split(" ")[0]}'s LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </div>
            ) : (
              <p className="text-center text-[10.5px] text-muted-foreground">
                Illustrative axis shape, never averaged into one number. Pick a name above to see the team's own
                real, consented scores.
              </p>
            )}
          </Card>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {RESEARCH_GROUNDING.map((r) => (
              <ResearchCard key={r.construct} item={r} />
            ))}
          </div>

          <Card className="mt-2.5 p-0 overflow-hidden">
            <button
              onClick={() => setBigFiveOpen((o) => !o)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-surface/60 transition-colors"
            >
              <span className="text-[12.5px] font-medium flex-1">How Big Five is actually evaluated</span>
              <ChevronDown className={"h-4 w-4 text-muted-foreground shrink-0 transition-transform " + (bigFiveOpen ? "rotate-180" : "")} />
            </button>
            {bigFiveOpen && (
              <div className="divide-y divide-border border-t border-border">
                {BIG_FIVE.map((d) => (
                  <div key={d.name} className="px-4 py-2.5">
                    <div className="text-[12px] font-medium">{d.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">{d.meaning}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <p className="mt-2 text-[11px] text-muted-foreground">
            None of these instruments are used naively, see{" "}
            <a
              href="https://github.com/vibe-check-hackathon/vibe-check/blob/main/laura/founder-axis-scoring.md"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              our own axis-scoring notes
            </a>{" "}
            for the caveats (weak or reversed effects, sign-flips at exit, why extraversion is excluded).
          </p>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-medium">The founder world, in plain language</h2>
            <span className="text-[11px] text-muted-foreground">click a category for every term</span>
          </div>
          <div className="space-y-2.5">
            {GLOSSARY.map((c) => (
              <GlossaryAccordion key={c.key} category={c} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-medium">Startup networks & programs (Germany / US)</h2>
          </div>
          <Card className="p-0 overflow-hidden overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-surface border-b border-border text-muted-foreground">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium"> </th>
                  <th className="px-4 py-2 font-medium">Germany</th>
                  <th className="px-4 py-2 font-medium">United States</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {NETWORKS.map((n) => (
                  <tr key={n.row}>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap align-top">{n.row}</td>
                    <td className="px-4 py-2.5 align-top"><LinkList items={n.germany} /></td>
                    <td className="px-4 py-2.5 align-top"><LinkList items={n.us} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-medium">Next opportunities, where and when</h2>
            <span className="text-[11px] text-muted-foreground">checked live, dates as of Jul 21, 2026</span>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10.5px] text-muted-foreground">Country</span>
              {OPPORTUNITY_COUNTRIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCountryFilter(c)}
                  className={
                    "rounded-full px-2.5 py-1 text-[11px] border transition-colors " +
                    (countryFilter === c
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40")
                  }
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10.5px] text-muted-foreground">When</span>
              {TIMEFRAMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTimeframeFilter(t.key)}
                  className={
                    "rounded-full px-2.5 py-1 text-[11px] border transition-colors " +
                    (timeframeFilter === t.key
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <OpportunityMap opportunities={filteredOpportunities} hubs={HACKNATION_HUBS} />
            <div>
              {filteredOpportunities.length > 0 ? (
                <OpportunityTimeline opportunities={filteredOpportunities} />
              ) : (
                <Card className="p-4 text-[11.5px] text-muted-foreground">
                  Nothing matches that filter combination, try a different country or time frame.
                </Card>
              )}
              <p className="mt-2 text-[10.5px] text-muted-foreground">
                Green badge means free to attend or apply. Outline badge means paid, with the price the
                organizer publishes today, not a guess, check the organizer's own page before booking anything.
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border p-3">
            <div className="text-[10.5px] font-medium text-muted-foreground">
              Already happened this cycle, kept here since they were asked about, not shown as upcoming
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {RECENTLY_HAPPENED.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-muted-foreground hover:text-primary"
                >
                  {p.name} ({p.whenLabel}, {p.city})
                </a>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-medium">Learn more</h2>
            <span className="text-[11px] text-muted-foreground">by trait, not a fixed list</span>
          </div>
          {founder && (
            <p className="mb-2.5 text-[11.5px] text-muted-foreground">
              <span className="font-medium text-foreground">{founder.name.split(" ")[0]}'s</span> lowest score is{" "}
              <span className="font-medium text-foreground">{weakestKeys.join(" and ")}</span>, so that opens first
              below. Everyone gets a different starting point here, it depends on their own scores, not a rule that
              applies to everyone the same way.
            </p>
          )}
          <div className="space-y-2.5">
            {LEARNING_BY_TRAIT.map((t) => (
              <TraitAccordion
                key={`${t.key}-${selected}`}
                trait={t}
                defaultOpen={weakestKeys.includes(t.key)}
                highlighted={weakestKeys.includes(t.key)}
              />
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-muted-foreground">
            Independent public resources, not sponsored or affiliated with FirstCheck. Each link goes straight to
            that video or episode, checked live rather than guessed.
          </p>
        </section>
      </div>
    </div>
  );
}
