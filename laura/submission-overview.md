# FirstCheck — Submission Overview

## 1. Problem & Challenge

Investors need a way to screen far more of the founder market than their
available diligence hours allow, because signal-to-noise is too low: the truly
strong founders are often the hardest to see, while many of the most visible
ones are simply the best at presenting themselves. That means equally strong
founders can be pushed out of the fundable pool entirely, especially when they
do not have the right network, pedigree, or visibility to be noticed early.
This is exactly why great founders stay invisible until they know the right
person, and why capital still flows through networks rather than merit. By the
time a fund sees a founder clearly, dozens of equally strong ones may already
have given up waiting.

**How might we** build an autonomous agent that creates a cheap, verified
signal of true founder quality, so investors can identify and back the
founders closest to the real investment optimum instead of only the ones who
are easiest to find?

## 2. Audience

Our primary user is the individual investor or lean fund partner — someone
without a team of analysts behind them, who needs "the reach and analytical
power of an entire organisation" compressed into one tool they can actually
run themselves, setting their own sector, stage, and risk appetite, and
trusting it enough to act on what it tells them without needing technical
support to use it. The founders that same investor is trying to find are our
second audience: especially the ones with no GitHub history, no funding, and
no warm intro, who stay invisible today no matter how strong the underlying
work actually is. On the consumer side, our second proof point is someone like
Daniel — one of roughly 28 million Americans who move every year, negotiating
alone against an industry of 16,851 small operators who all quote differently
depending on who's asking, where "the price on the truck is not the price on
the phone." Different markets, same person underneath: someone who knows a
fair outcome exists somewhere out there, but doesn't have the time, the
network, or the leverage to go get it themselves.

## 3. Solution & Core Features

FirstCheck is a working, end-to-end deal platform in which every judgment is
traceable to evidence. An investor writes their thesis once — sectors, stages,
check size, founder criteria with hard floors — and everything downstream is
filtered through it. **Inbound**, any founder can apply with nothing but a
company name and a deck: the canonical screen answers honestly within seconds,
research runs only on links the founder consented to, and unknown is never
treated as false. **Outbound**, a live scan finds newly fundable teams by
region, structures each find with an intelligence-brief template whose rules
travel inside the prompt (public facts only, every statement sourced or marked
claimed), and screens them before they ever reach the board — so the founder
with no warm intro enters the same funnel as everyone else. **In the meeting**,
an agent interview scores the thesis sub-axes in real time with a written
reason for every movement, re-anchors the BATNA/ZOPA model on what is actually
said, and retains contradictions instead of smoothing them over. The output is
not a gut call but a decision memo where every claim links to its source, a
founder score with a *separate* confidence (self-report is credit-capped at
65%), and a term sheet whose clauses adapt to the analysis — tranches when
proof is thin, an observer seat when a floor breaks, a condition precedent for
every open contradiction — with the full "what changed, why, and on what
information" schedule disclosed to the founders themselves. A retrieval
assistant (Checky) answers any diligence question grounded only in this
evidence base, citing what it read. Humans hold every gate: nothing goes
founder-facing without explicit approval.

## 4. Unique Selling Proposition (USP)

**The autonomous agent for funding: it finds, verifies, scores, interviews,
and prices founders on evidence — and shows its work at every step.**

## 5. Implementation & Technology

A deliberately thin, inspectable stack: a zero-dependency Node ESM pipeline
(screening, interview ingestion with SRT/VTT/audio support, corroboration,
founder scoring, term-sheet generation — 18 automated tests including a
golden-file render) exposes its logic to a TanStack Start/React frontend
through vite middleware endpoints, with one markdown/JSON opportunity database
as the single source of truth for both. The LLM layer is provider-agnostic —
Claude (with live web search for the outbound scan), OpenAI, or a local
model, detected from a key pasted in the terminal or in the UI and cached for
24 hours — and every AI output passes through validation: extraction rejects
claims without transcript-segment evidence, scores are computed by
deterministic arithmetic the model can never touch, and the final Founder
Score always ships with its own confidence figure. Evidence-state credit caps,
axis weights and floors, and negotiation parameters all live in one editable
thesis config, so a second fund is a config change, not a rewrite.

## 6. Results & Impact

In 24 hours the platform went from brief to demonstrably working: 22 real
companies with sourced evidence ledgers, 12 screened outbound targets with
portfolio-adjacency reasoning, a live-scored four-founder interview, and a
lawyer-form term sheet whose every clause traces to a recorded input — run on
our own team as founders, including the staged stress test of one founder
checking out mid-meeting (the system priced the preparation failure, kept his
design work credited, and explained itself). The market this addresses is
large on both sides: roughly $300B+ flows into venture annually across
~40,000+ deals, while pre-seed screening still consumes analyst-days per deal —
at ~$100K first checks, a fund that can honestly evaluate 10× more founders at
near-zero marginal cost expands its effective TAM from the visible network to
the whole founder population; and the same evaluate-negotiate-explain loop
generalizes to any market where individuals negotiate blind against
professionals (moving alone: ~28M annual U.S. moves across 16,851 operators).
The deeper impact is distributional: when screening is cheap, sourced, and
consent-based, the founder with no network gets read by the same rules as the
founder with the warm intro — capital allocated on evidence rather than
visibility.

## 7. What was the most fun moment during founding?

*(told by Martin — kept for the submitted materials)*

Somewhere around 4 a.m. I found myself cloning Sun's face. Not a metaphor: we
needed the demo videos of every founder presenting, Sun was busy actually
finishing the architecture deck, and the avatar pipeline needed a face and a
voice to autogenerate his segment — so there I sat, bleary-eyed, feeding
photos of my co-founder into a generator and adjusting lip-sync while he stood
behind me saying "make me look less tired than you." The absurd part is that
it worked on the first render and my own video took four attempts — apparently
I'm harder to clone than Sun, which the team has agreed to interpret
scientifically. It was the perfect 4 a.m. summary of the whole hackathon: we
were building a system that verifies what's real about founders, while
literally synthesizing ourselves to present it — and being scrupulously honest
about which was which.

> **Autogeneration note:** the founder presentation videos in the demo
> (`sun-chuanqi.mp4`, `martin-auer.mp4`) are AI-generated avatar clips created
> at ~4 a.m. from photos and voice samples the teammates provided themselves,
> with their consent, for demonstration purposes — the same disclosure
> standard the platform applies to everything else: synthetic content is
> always labeled as synthetic.

## 8. Technologies / Tags

**Core:** `autonomous-agents` · `rag` · `llm` · `evidence-grounded-ai` ·
`multi-agent` · `voice-ai` · `structured-outputs`

**What makes it ours:** `ethical-crawler` (robots.txt-respecting,
consent-based, no hosted-media scraping) · `next-investment` (thesis-driven
deal sourcing) · `founder-score` · `batna-negotiation-engine` ·
`adaptive-term-sheets` · `explainable-by-default` (every score ships its
reasons) · `unknown≠false` (confidence separated from score) ·
`human-in-the-loop` (approval gates on everything founder-facing) ·
`provider-agnostic-llm` (Claude / OpenAI / local, one key store) ·
`synthetic-data-consent-tier` · `interview-intelligence` (SRT/VTT/audio →
traceable claims)

**Stack:** `typescript` · `react` · `tanstack-start` · `node-esm-zero-deps` ·
`vite` · `claude-api` · `web-search-tool` · `elevenlabs` · `whisper` ·
`markdown-as-database` · `golden-file-testing`

**Categories:** FinTech / VC-Tech · Agentic AI · Responsible AI ·
Future of Work
