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
