# Context: The Vibe Check and Negotiator Thesis

This project combines two challenge areas into one thesis about high-stakes decisions. The VC Brain asks how an investor can discover, assess, and fund exceptional founders within 24 hours. The Negotiator asks how an agent can gather comparable offers by phone and negotiate better terms. The brainstorming sessions connect them: first build an evidence-backed view of an opportunity and its people, then turn that view into an annotated decision artifact and, eventually, a live negotiation.

The initial vertical is venture capital, but the deeper system is a reusable decision and negotiation engine for markets where evidence is fragmented, judgment is subjective, and the final terms are not posted publicly.

# Problem Hypothesis

## Core problem

High-stakes opportunities are not evaluated or priced on a level playing field. The evidence needed to make a good decision exists, but it is scattered across documents, conversations, public activity, references, databases, and prior interactions. Collecting and reconciling it takes too long, so decision-makers fall back on warm networks, shallow proxies, inconsistent interviews, and intuition.

This creates two related failures:

1. **Allocation failure:** strong founders and opportunities remain invisible because they lack the right network, conventional credentials, or an established track record. Investors see applications too late, diligence takes weeks, and promising teams receive no timely answer.
2. **Negotiation failure:** once an opportunity is selected, neither side has a clear, evidence-backed explanation for the proposed terms. Important numbers are negotiated through opaque conventions and asymmetric information rather than a transparent model of risk, evidence, and leverage.

The problem is therefore not simply insufficient data or slow document processing. It is the absence of a persistent, auditable mechanism that can turn incomplete and contradictory evidence into a decision, identify what remains unknown, gather the missing evidence through interaction, and explain how that evidence affects the proposed terms.

## Jobs to be done

### For the investor

- Continuously discover promising founders before they formally begin fundraising, including people outside established networks.
- Accept a minimal inbound application and enrich it without forcing the founder through a long form.
- Understand the founder, market, and idea-versus-market fit as separate dimensions rather than collapsing them into one average score.
- Distinguish a missing fact from a disproven claim, and resolve important uncertainty within a 24-hour decision window.
- Test founder qualities that static profiles cannot show: judgment, adaptability, resilience, honesty, team dynamics, and response to challenge.
- Verify material claims against traceable evidence and expose contradictions before making an investment decision.
- Produce a concise recommendation and proposed terms that a human can inspect, challenge, approve, or veto.
- Preserve what was learned about a founder across applications so future decisions start with accumulated evidence rather than zero.

### For the founder

- Receive a fair assessment based on demonstrated capability and evidence, not access to an investor network.
- Submit a deck and company name, then provide additional information only when it materially reduces uncertainty.
- Understand which claims, risks, and assumptions drove the decision and proposed terms.
- Correct missing or contradictory evidence during the process instead of being silently rejected by an automated screen.
- Receive a useful decision within 24 hours and, when approved, negotiate from explicit reasons rather than an unexplained valuation.

### For either party in a negotiated market

- Convert a complex need or opportunity into one confirmed, structured specification.
- Gather comparable offers through real conversations rather than web scraping or form filling.
- Survive friction such as evasive answers, interruptions, refusals, and hard-sell tactics.
- Use only verified facts and real competing offers as leverage; never invent evidence or bluff.
- End every interaction with a structured outcome and preserve the transcript or recording as evidence.

## Why existing approaches fail

- **Networks optimize for visibility, not merit.** Founders with warm introductions are reviewed first while cold-start founders remain difficult to assess.
- **Static databases describe known companies.** They are weak at detecting early signals, modeling a person over time, or evaluating founders with unconventional footprints.
- **Application forms over-collect self-reported facts.** They do not actively resolve contradictions or reveal behavior under pressure.
- **Generic scoring hides disagreement.** A single score can conceal a strong founder in a weak market or a promising market with an unconvincing team.
- **One-shot AI analysis is not trustworthy enough.** It can confuse absence of evidence with evidence of absence, fabricate missing facts, and produce conclusions without provenance.
- **Traditional diligence is serial and expensive.** Domain checks, references, interviews, and market research require many human hours and rarely fit a 24-hour cycle.
- **Term sheets expose numbers but not reasoning.** The investor cannot quickly inspect why each material term changed, and the founder cannot see which assumptions are negotiable.
- **Quote collection and negotiation are manual.** In phone-priced markets, comparable offers and concessions remain locked inside conversations that few people have time to conduct.

## Key risks and open questions

- Public footprints may encode privilege and visibility as strongly as capability; a sourcing system can reproduce the exclusion it claims to solve.
- Personality inference from interviews or social data can be noisy, culturally biased, and easy to overstate.
- A Founder Score can become a permanent penalty unless evidence decays, uncertainty is visible, and founders can contest errors.
- Some claims cannot be verified from public data. The system must preserve an `unknown` state instead of treating failed retrieval as falsehood.
- Reference calls and public-data enrichment require explicit privacy, consent, retention, and access policies.
- Automated term generation must remain decision support. Legal review, fiduciary responsibility, and final authority stay with the human investor.
- Negotiation agents must disclose their role, obey recording and calling laws, and never fabricate bids, facts, inventory, or authority.

# Solution Hypothesis

## Product hypothesis

Build a persistent **Opportunity Intelligence and Negotiation System** that assembles evidence about a founder, team, idea, and market; generates explicit hypotheses; actively tests those hypotheses through research and live interviews; and converts the resulting evidence into an annotated term sheet for human approval.

The annotated term sheet is not merely the last PDF in the workflow. It is the compact decision interface for the whole system. Every material term should link back to the claims, evidence, uncertainty, and model assumptions that influenced it. A reviewer can inspect an annotation, see its provenance, ask follow-up questions, change an assumption, and understand the resulting effect on terms.

The same architecture can support later founder-investor negotiation and other phone-priced markets. In each case, a structured specification and verified evidence become the shared ground truth; voice agents gather missing information or competing offers; and a negotiation agent uses only documented leverage.

## End-to-end workflow

1. **Configure the fund thesis.** The investor defines sectors, stage, geography, check size, ownership targets, and risk appetite. These constraints shape sourcing and recommendations without becoming universal claims about founder quality.
2. **Source inbound and outbound opportunities.** Inbound begins with a deck and company name. Outbound monitors GitHub, launches, hackathons, papers, patents, accelerators, and public signals to find people before they fundraise.
3. **Build persistent memory.** The system deduplicates people and companies, timestamps every observation, records provenance, and maintains a longitudinal founder profile. The persistent Founder Score is one input into an opportunity assessment, not the final decision.
4. **Generate testable hypotheses.** Agents identify claims, contradictions, missing evidence, and questions that would most change the decision. They preserve `verified`, `contradicted`, and `unknown` as distinct states.
5. **Run the vibe check.** A voice or video interview asks adaptive, non-obvious questions designed to test specific hypotheses rather than administer a generic personality quiz. It can request documents, clarify patent or traction claims, and observe how a team reasons, disagrees, and responds to feedback.
6. **Perform parallel diligence.** Domain agents evaluate technical feasibility, market structure, competition, legal concerns, references, and observable traction. Sensitive technical claims may be decomposed into narrowly scoped checks so external experts can validate components without receiving the complete confidential idea.
7. **Assess without flattening.** The system reports Founder, Market, and Idea-versus-Market axes independently, each with direction of change, confidence, evidence, and unresolved gaps. Claim-level Trust Scores express evidential support rather than pretending certainty.
8. **Generate the opportunity report.** A concise executive recommendation sits above the evidence, contradictions, scenario analysis, and open diligence items. Historical comparable opportunities inform the analysis without silently determining it.
9. **Produce an annotated term sheet.** A standard legal template supplies known clauses and slots. A transparent financial model proposes variable terms from the fund thesis, market evidence, risk assumptions, and diligence results. Each populated term carries an annotation that explains its inputs and confidence.
10. **Keep the human in control.** The investor reviews, challenges, edits, approves, or vetoes the recommendation and terms. Their changes and eventual outcomes feed back into memory so the system can be evaluated and improved.
11. **Negotiate from verified leverage.** In the extended loop, a disclosed voice agent can discuss terms, compare real offers, ask for concessions, and record structured outcomes. It must use the approved term sheet and evidence as immutable constraints and escalate authority-sensitive changes to a human.

## Deep-tech hypotheses

### 1. Temporal evidence graph as institutional memory

Represent founders, teams, companies, claims, sources, interviews, opportunities, and decisions as a temporal knowledge graph rather than a flat applicant record. Each assertion stores source, timestamp, confidence, permissions, contradictions, and superseding evidence. Entity resolution connects the same person across projects while preserving the distinction between person-level history and opportunity-level assessment.

**Hypothesis:** longitudinal, provenance-aware memory will surface meaningful trajectories and reduce repeated diligence without turning stale observations into permanent truth.

### 2. Active evidence acquisition under a time budget

Treat diligence as a value-of-information problem. Instead of gathering everything, estimate which missing fact or contradiction is most likely to change the decision, then choose the cheapest reliable action: web lookup, document request, founder question, reference call, simulation, or expert review.

**Hypothesis:** uncertainty-directed investigation can produce a more defensible decision in 24 hours than exhaustive but shallow enrichment.

### 3. Adaptive multimodal interviews for hypothesis testing

Ground an ElevenLabs voice agent in the current evidence graph and give it explicit hypotheses to test. The agent adapts questions based on answers, handles interruption and latency, requests concrete examples, and logs evidence spans back to claims. Team exercises or cross-founder simulations can expose behavior that resumes and pitch decks cannot.

**Hypothesis:** a live, hypothesis-driven interview can verify decision-relevant traits and contradictions more effectively than static questionnaires, provided behavioral conclusions remain probabilistic and auditable.

### 4. Multi-agent, privacy-preserving diligence

Route technical, market, legal, and people checks to specialized agents with scoped access. For sensitive ideas, decompose a claim into independent validation tasks and reveal only the minimum context each agent or external expert needs. Aggregate the results while recording dependencies and limitations.

**Hypothesis:** task decomposition and least-privilege context can increase diligence depth without broadly exposing confidential founder information.

### 5. Calibrated claim-level trust

Attach confidence to individual claims, not to the company as a whole. Combine source reliability, corroboration, recency, extraction confidence, and contradiction status. Calibrate scores against later verified outcomes and show uncertainty intervals where the evidence is sparse.

**Hypothesis:** claim-level calibration and explicit unknowns will make AI recommendations useful to investors without requiring them to trust an opaque global score.

### 6. Causal term-sheet modeling

Use a deterministic, inspectable financial model for valuation, ownership, dilution, check size, runway, and other calculable terms. Agents may extract inputs, propose scenarios, and explain assumptions, but they should not invent numbers directly in prose. Each term annotation links the equation inputs to supporting evidence and shows counterfactuals such as how the term changes if a risk is resolved.

**Hypothesis:** combining symbolic calculation with evidence-grounded language generation will make proposed terms reproducible, challengeable, and safer than end-to-end document generation.

### 7. Evidence-constrained voice negotiation

Use voice agents as the interaction layer for gathering missing facts and negotiating terms. The negotiation policy draws leverage only from verified competing offers, approved ranges, and the structured opportunity record. Calls end with a machine-readable state: agreement, counteroffer, callback, unresolved issue, or decline, with transcript evidence attached.

**Hypothesis:** constrained voice agents can compress multi-party negotiation time while preserving honesty, consistency, and a complete audit trail.

### 8. Outcome-driven learning without score collapse

Track which sourcing channels, evidence patterns, interview hypotheses, and diligence checks correlate with later outcomes. Use this feedback to improve ranking and information gathering, while keeping the three opportunity axes separate and testing for disparate error rates across founder groups.

**Hypothesis:** learning from decisions and outcomes can improve sourcing quality over time without reducing nuanced investment judgment to one self-reinforcing score.

## Core data model

The central object is an **Opportunity Card** with three connected layers:

- **People:** persistent founder identities, team relationships, track record, references, behavior evidence, permissions, and Founder Score history.
- **Idea and market:** product claims, technical approach, market thesis, competitors, traction, feasibility evidence, and comparable opportunities.
- **Decision:** independent Founder, Market, and Idea-versus-Market assessments; claim-level Trust Scores; contradictions; missing data; recommendation; and annotated term-sheet terms.

Every generated statement must be traceable to a source span, calculation, or clearly labeled inference. Nothing missing should be silently fabricated.

## MVP hypothesis

A credible hackathon MVP should prove one narrow closed loop rather than simulate an autonomous fund:

- Ingest one pitch deck and company identity into an Opportunity Card.
- Enrich it with a small number of real public signals and preserve source provenance.
- Generate several explicit hypotheses and unresolved contradictions.
- Conduct a live ElevenLabs interview that tests those hypotheses and writes structured evidence back to the card.
- Run focused founder, market, and technical diligence with claim-level Trust Scores.
- Produce an opportunity report and annotated term sheet whose material numbers come from a visible model.
- Let an investor inspect the evidence behind a term, alter an assumption, and see the term recalculate.
- Optionally demonstrate one honest voice negotiation in which a term changes because of verified evidence or a real competing offer.

## Success criteria

- A sourced or inbound opportunity reaches a reviewable decision within 24 hours.
- The system finds at least one material fact, contradiction, or unknown that was not explicit in the initial deck.
- Interview questions are visibly derived from opportunity-specific hypotheses.
- Founder, Market, and Idea-versus-Market assessments remain independent and include trend and uncertainty.
- Every material recommendation and generated term cites evidence or a deterministic calculation.
- The reviewer can distinguish fact, inference, contradiction, and unknown at a glance.
- No missing financial, legal, or founder information is guessed.
- Any voice negotiation discloses agency when asked, uses no fabricated leverage, and ends with a structured outcome.
- The human investor retains final authority over investment and legal terms.

## Falsification tests

The product hypothesis weakens if any of the following are true:

- Investors cannot identify a decision-changing insight that the system found faster or more reliably than a conventional review.
- Different reviewers cannot reproduce why a proposed term was generated from its annotations and model inputs.
- The interview produces generic personality labels but does not resolve opportunity-specific uncertainty.
- Confidence scores remain uncalibrated or hide contradictions behind a polished recommendation.
- Cold-start founders consistently rank below well-documented founders because evidence volume is mistaken for quality.
- The system requires so much founder input or human diligence that a 24-hour decision is not operationally plausible.
- Negotiated changes cannot be traced to verified leverage or exceed the authority granted to the agent.

## Strategic wedge

The strongest initial wedge is not a fully autonomous fund. It is **evidence-backed founder assessment culminating in an annotated term sheet**. This concentrates the demo on the system's most distinctive interaction: a live vibe check that resolves uncertainty, a durable Opportunity Card that shows the evidence, and a term sheet whose numbers can be interrogated rather than merely accepted.

Once that loop works, the same memory, active-investigation, and evidence-constrained negotiation infrastructure can extend to outbound sourcing, founder-investor term negotiation, and other opaque phone-priced markets such as contractors, freight, medical billing, or equipment rental.
