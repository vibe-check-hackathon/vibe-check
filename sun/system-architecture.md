# System architecture

## Conceptual pipeline

1. Sourcing: gather information about each funding opportunity: founders, ideas
   - Input: Emails, intake forms, CVs, LinkedIn profiles, social media, GitHub repos
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
