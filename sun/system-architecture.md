# System architecture

## Conceptual pipeline

1. Sourcing: gather information about each funding opportunity: founders, ideas
   - Input: Pitch deck, emails, intake forms, CVs, LinkedIn profiles, social media, GitHub repos
   - Output: 1000s of Opportunity Card with basic info about founders and their ideas
   - How: AI agents will handle input, do web browsing, and collectiing facts
2. Developing: assess opportunities with agentic research
   - Input: Investment thesis, Historic data set, Reference/background checks
   - Output: All the opportunity Cards augmented with negotiation notes, with draft term sheet for human VC to sign off
   - How: AI research agents running in a loop, applying investment thesis to assess how good the opportunity is, and based on that prioritize which opportunities to pursue
3. Matching: Finalizing term sheet with live interviews
   - Input: Founder responses, negotitation notes,
   - Output: Decision to issue final term sheet, or decline
   - How: AI interview agents conduct live interview with founders, updating term sheet on the fly

## Key technology

- Multi-founder and investor vibe check. Model personality and assess founder-founder and founder-investor fit. Techniques are based on social science (personality evaluation), computer vision (facial expression analysis), and NLP (tone and sentiment analysis).
- Investment thesis modeling. Distill investment thesis based on past funding decisions and outcomes.
- Negotiation agent. Effectively negotiate optimal terms with founders based on Batna model. Can be deployed to both founder and investor to facilitate fast convergence on mutually agreeable terms.

## System components

- Opportunity OS. Uses the Opportunity Card as the central, living record for each company, connecting founder profiles, idea research, evidence, confidence, interview findings, negotiation notes, and decisions.
- Intake and sourcing agents. Create and enrich Opportunity Cards from inbound applications and outbound signals such as pitch decks, GitHub, social media, hackathons, papers, and referrals.
- Memory and evidence store. Preserves founder history across opportunities, deduplicates sources, tracks the Founder Score over time, and links every material claim to evidence and a trust level.
- Research and assessment agents. Apply the investment thesis, compare companies and markets, run reference and background checks, and assess founder, market, and idea-versus-market independently.
- Vibe-check and interview agents. Conduct live founder and team interviews, observe how founders reason and interact, resolve information gaps, and write structured findings back to the Opportunity Card.
- Negotiation and term-sheet agent. Converts approved recommendations into an annotated draft term sheet, explains the evidence behind proposed terms, and supports honest negotiation between founders and investors.
- Investor workspace. Prioritizes opportunities, presents recommendations and unresolved risks, exposes the evidence behind each conclusion, and gives the human investor final approval or veto authority.

# Technical spec

## 1. Overview

The system supports venture capital firms in discovering, evaluating, and negotiating with startup founders. It combines:

- Inbound and outbound opportunity sourcing
- Semi-structured opportunity records
- Automated research and due diligence
- Founder and co-founder “vibe checks”
- Reference and background checks
- VC preference modeling
- Negotiation assistance based on BATNA
- Human approval before founder-facing calls
- Continuous learning from investment outcomes

## 2. High-Level Workflow

1. Collect inbound and outbound opportunity data.
2. Create or update an opportunity card.
3. Perform research and preliminary diligence.
4. Infer the VC’s preferences from historical decisions.
5. Generate evaluation and negotiation parameters.
6. Obtain human approval from the VC.
7. Conduct founder interviews, vibe checks, diligence, and negotiation calls.
8. Add findings, scores, confidence levels, and recommendations to the opportunity card.
9. Record whether the opportunity results in a signed term sheet or rejection.
10. Use outcomes to improve future sourcing, research, and evaluation.

## 3. Opportunity Intake

### 3.1 Inbound Sources

Founders may submit:

- CVs
- LinkedIn profiles
- Social links
- Short written descriptions
- Other supporting documents

Potential intake channels include:

- Automated email inbox
- Google Forms
- A custom submission website

### 3.2 Outbound Sources

The system may proactively identify opportunities through:

- LinkedIn activity, including transitions into stealth mode
- Harmonic API
- Academic archives and published papers
- Y Combinator’s website
- Social forums and Reddit, including comments
- Patent databases

### 3.3 Intake Processing

Intake agents:

- Crawl configured sources
- Parse and index uploaded documents
- Extract founders, ideas, dates, and source information
- Preserve relevant raw data
- Create or update the corresponding opportunity card

## 4. Opportunity Card

The opportunity card is the system’s central data object and evolving memory record.

### 4.1 Format

Cards use semi-structured Markdown because they must be:

- Easy for agents to generate and edit
- Readable by humans
- Flexible enough to represent incomplete hypotheses
- Structured enough to support workflows and tracking

### 4.2 Core Fields

An opportunity card may contain:

- Opportunity identifier
- Founder identifiers
- Idea or company description
- Source links
- Uploaded-document references
- Discovery and update timestamps
- Current workflow status
- Extracted facts
- Unverified hypotheses
- Research and diligence findings
- Vibe-check findings
- Reference and background-check results
- Quantitative scores
- Confidence values
- Recommendation and TL;DR
- Negotiation parameters and annotations
- Final outcome

Example statuses include:

- Discovered
- Interview stage
- Term sheet sent
- Declined
- Term sheet signed

## 5. Evaluation and Due Diligence

Each opportunity begins as a hypothesis to be tested.

Evaluation may cover:

- Technical feasibility
- Legal considerations
- Founder suitability
- Idea quality
- Supporting evidence from external sources
- Reference and background checks

Reference sources may include:

- Former colleagues
- Professors
- Customers

The system should distinguish founder-provided claims from independently obtained evidence.

## 6. Founder Vibe Check

The vibe check is a key technical differentiator.

### 6.1 Goals

The system evaluates:

- Founder personality traits
- Individual characteristics
- Co-founder compatibility
- Founder–investor fit
- Whether configured thresholds are met

The purpose is not simply to label founders as strong or weak. It is to characterize who they are and how well they may fit with co-founders and the investor.

### 6.2 Evaluation Method

The evaluation suite should be informed by academic personality and social-science research.

It should:

- Avoid relying only on obvious, easily gamed questions
- Use indirect or unobvious questions
- Evaluate multiple personality dimensions
- Produce structured findings, scores, and confidence levels

### 6.3 Multi-Founder Simulation

Multiple co-founders may be placed in a shared simulated environment and prompted with psychology evidence-based scenarios or questions.

The system evaluates:

- Team interaction
- Likely ability to function together
- Co-founder compatibility
- Fit with the investor

## 7. Automated Interviews and Calls

The proposed call stack includes ElevenLabs and automated phone-survey tooling such as Twilio.

Agents may:

- Conduct human-like interviews
- Run founder questionnaires
- Perform reference calls
- Identify additional people to contact
- Take structured notes
- Add evidence to opportunity cards
- Support diligence and negotiation calls

Calls and resulting notes should be recorded in the opportunity record.

## 8. VC Preference Model

The system builds an internal representation of the VC’s investment preferences and beliefs.

### 8.1 Inputs

- Previously issued term sheets
- Declined opportunities
- Historical opportunity cards
- Recorded decisions and outcomes

### 8.2 Outputs

The model should infer the VC’s implicit preferences and apply them to future opportunities.

It supports:

- Opportunity scoring
- Recommendation generation
- Research prioritization
- Founder and investor fit assessment
- Negotiation preparation

## 9. Reporting

After evaluation, the opportunity card is augmented with a decision-oriented report containing:

- TL;DR recommendation
- Supporting reasoning
- Due-diligence findings
- Vibe-check findings
- Quantitative scores
- Confidence values
- Important risks and supporting evidence
- Negotiation guidance

The reasoning should be visible to the human reviewer.

## 10. Negotiation Model

Negotiation assistance is another core differentiator.

### 10.1 BATNA-Based Modeling

The system uses BATNA—**Best Alternative to a Negotiated Agreement**—and related negotiation bounds to construct a negotiation playbook.

The model captures:

- The VC’s bottom line
- The maximum or upper bound the VC is comfortable offering
- User-defined constraints
- The estimated acceptable range of the other party
- The current estimated position within the negotiation range

### 10.2 Negotiation Agent

The agent:

- Advocates for the party it represents
- Operates within approved parameters
- Updates its beliefs during the conversation
- Adjusts estimated upper and lower bounds in real time
- Attempts to find mutually acceptable terms

The same approach could be deployed for either side, with each agent representing its own principal.

## 11. Human-in-the-Loop Approval

A human VC reviewer must approve the system’s outputs before founder-facing vibe-check, diligence, or negotiation calls occur.

The reviewer:

1. Examines the opportunity card.
2. Reviews the recommendation and reasoning.
3. Reviews proposed BATNA and negotiation bounds.
4. Adjusts or annotates the parameters where necessary.
5. Approves or rejects proceeding with the call.

Agents must remain within the approved parameters during negotiation.

## 12. Continuous Learning Flywheel

Every evaluated opportunity contributes additional evidence, regardless of outcome.

### 12.1 Feedback Data

- Interview results
- Research findings
- Vibe-check results
- Reference-call findings
- Negotiation behavior
- Declined opportunities
- Issued term sheets
- Signed term sheets

### 12.2 Improvement Targets

The accumulated evidence is used to improve:

- Investment strategy alignment
- Opportunity discovery
- Research accuracy
- Founder evaluation
- VC preference modeling
- Future recommendations

The intended result is an increasingly accurate and VC-aligned agentic sourcing and evaluation system.
