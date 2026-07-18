# VC Brain Hackathon Challenge — Q&A Session Summary

**Source:** `Neue Aufnahme 71.m4a` (~25,800 characters transcribed)
**Format:** Live Q&A / briefing call between the challenge sponsor (a VC — referred to as Carl/Kalle), the hackathon organiser (Janet), and participants.
**Topic:** Building an AI system that sources and scores early-stage startup founders for a VC fund.

---

## 1. The Core of the Challenge

The single most important message repeated throughout the session:

> **The founder score is the heart of the challenge.**

The VC was explicit that the "traditional" parts of an investment memo are no longer the hard part:

- Assessing **problem, product, market, competitors** — "nowadays quite easy actually to do with Claude or any other AI tool."
- Assessing the **founder and the team** — "that's the hard part of the challenge."

**Why the founder matters most at this stage:** at pre-seed / idea stage, the idea and the solution almost always change. The VC stated plainly that startups pivot, ideas change a lot, and solutions change a lot over the journey. The idea still matters — it should be ambitious and show that the founders are visionary and can think big — but it is not what you can reliably underwrite. The team is.

A participant (Sahil) raised a related concern early on: in a highly variable market, a recommendation engine's output can be "completely opposite or completely incorrect" by the next day, because real-world information moves so fast. This reinforces the same conclusion — anchor the assessment on the people, not on volatile market signals.

---

## 2. How This VC Actually Assesses Founders

When asked directly what criteria they use, the VC declined to give a formal rubric and instead described how they think in the room. Three questions they ask themselves while a founder pitches:

### Question 1 — "Would I like to work for them?"

Can this person actually lead other people? Can they convince not just investors, but **talent** to join?

The VC framed the bar concretely: a great founder has to convince the best talent out there — people who might currently be at a company like Databricks — to quit a secure, well-paid job and join a newly formed company, run by someone they barely know, for much less money. If it works out in ten years they may become very wealthy, but the likelihood is very, very low. Being able to recruit against those odds is the test.

### Question 2 — "Can this person sell their idea?"

The VC noted that a lot of technical people are founding startups now — which is good — but selling that tech to real customers is a different skill.

Critically: at the stage they invest, **there is no head of sales and no sales team.** The founder personally has to sell the idea to the first customers, "even though maybe there is no solution, he still has to sell it." Sales ability and **storytelling** were called out as very critical characteristics.

### Question 3 — "Can they make this company big?"

Can they lead a larger team? Can they raise a Series A, B, C? Can they genuinely scale the company, not just start it?

### Their current human process (for reference)

Asked how much time and how many people this takes, the answer was: **it depends — largely on how much pressure is on the deal.** But at the later stages they:

- Put the investment team on **several calls** with the founders
- Run **reference calls with clients and with other investors** who have worked with them — described as "very important"
- Have the **whole team** meet them, with a final pitch and questions
- Take them to **dinner or lunch** after the pitch (they come to Munich or Berlin)

On that last point the VC was emphatic: *"over dinner, you always get to know them much better than during the pitch."* They explicitly suggested participants think about how to incorporate the reference-call dimension into their build.

---

## 3. Product Requirements and Design Guidance

### Scoring architecture — do NOT over-aggregate

One of the most actionable constraints given:

> "It's very critical to not combine them at a very, very early stage... do not combine the founder score, team score, whatsoever into another score."

They want to see:
- The **individual scores** preserved and displayed separately
- **How the score was arrived at** — what went into it

In other words: transparency and decomposability beat a single elegant number. A black-box aggregate score is the wrong output.

### Handle missing information honestly

Asked about two startups with equally good ideas where one founder has a strong public footprint and the other doesn't:

- More information does enable a better assessment — that's simply true
- But you should **always flag missing information**
- **Do not make up information you don't have**
- Better approach: work around the gap, or surface a recommendation to schedule a call with that founder if they otherwise look like a strong fit

### Memory layer

All information gathered and all data points should be **stored**. The VC wants a memory layer so that founder traits and assessments can be built into a base, iterated on, and used to train the system further over time. This is not a one-shot scoring tool — it is meant to accumulate.

### Sourcing — depth beats breadth

A participant (Samuel) asked whether it's more impressive to cover many sourcing channels or to do one channel really well. The answer was unambiguous:

> **Depth.** One channel where you can genuinely get good data and produce a good assessment beats many channels done shallowly — "if you have a lot of channels and you don't have the depth into these sourcing channels, we don't think it's going to work."

Suggested approach: **map out the different channels you've considered, then go deep on the one you believe is most promising.** Showing the map plus the depth is a strong submission.

### Friction vs. open door

Josh raised a strategic question: should a VC create friction to filter applicants, or build an open door with a strong filtering system behind it? The answer:

- It should be an **open door first** for everyone
- But **filters are legitimate and necessary** — think of it as a first door and a second door, with analysis starting after a brief filter
- You can implement a configurable **investment thesis** as a pre-filter (their real one is a **B2B tech filter**)
- Colourfully put: "we are not interested in funding the next ice cream shop... it must be a viable idea that we can work with and actually really needs funding"

### The application form

Participants have **full control** over the application form — what it looks like, what questions it asks, what it collects. Two caveats:

- Don't make it too long — only source information that is genuinely required
- Think about what **requirements** you want to enforce in the form itself

---

## 4. Who the Product Is For, and What It Replaces

**The platform is for the fund manager, not for founders.** This was stated as already explicit in the problem statement.

**The investment stage it serves:** very early / first angel tickets of **€100K**. At that point, teams typically:
- Have just an idea
- Have worked on it for a few weeks or months
- Have **no real traction yet**
- Are looking for the first cheque to actually build the tech

So, as the VC put it, "there's not a lot actually to rate besides the team and the idea."

**What the platform should output:** a solid scoring of founders and teams, plus an **investment recommendation** based on founder characteristics and traits *and* everything supplied by the team — pitch deck, public profiles, and any other information gathered.

**Why they don't already have this:** they *do* have an AI solution that sources startup information from commercial databases (Crunchbase, Dealroom, etc.) and rates startups for momentum and fund fit — but that is for their **later-stage** fund. Those databases simply **do not cover early-stage founding teams**, which is the gap this challenge addresses.

### The two tracks

1. **Outbound / proactive:** track founders and potential founders, recognise when someone is starting to build something, and either suggest reaching out, actually reach out, or propose an investment
2. **Inbound:** people apply through a form and come in through that door

Asked whether the system could act on its own to find people who haven't applied yet and push them to apply, the answer was: **"Yes, exactly, exactly."**

---

## 5. Hackathon Rules and Scope Boundaries

These came out of participant questions and are worth treating as hard constraints:

| Topic | Ruling |
|---|---|
| **Submitting a previously built project** | Point deduction. The idea is to build during the hackathon / next 24 hours. |
| **Building on top of existing work** | Allowed — you may expand or adapt something you already have, but stick to the challenge description, since judging is against challenge-specific criteria. |
| **AI component** | Required. Technical depth is an evaluation criterion — a solution that is mainly a spreadsheet "would score fairly low on technical depth." |
| **Agents** | Recommended, both for producing the investment memo / diving into investment criteria and for the sourcing side. |
| **Tool choice** | Open. You do not have to use the sponsor / API challenge tools if they don't fit. Use what you know or want to try. |
| **Generating code via AI prompts** | Considered acceptable (the VC deferred on exact rules but had no objection), provided there is genuine AI/technical depth in the product itself. |
| **Investment memo checklist** | You do **not** have to fill every section. The goal is a proper investment recommendation at the end. |

### Explicitly out of scope

- A **film/production-house variant** (evaluating scripts for investment potential) — interesting, but outside the challenge scope
- **WhatsApp outreach bots** for follow-up questions — the VC liked the idea personally ("great idea, I love it") but ruled it out of scope

---

## 6. The Most Promising Direction Raised

The strongest participant contribution came from **Josh**, who is building a persona/mental-health-driven product and proposed an offshoot analysing **team synergy through psychological profiles** — whether a team's working profiles complement each other, noting that "too many people want to be the chief" and that you need a strong leader *plus* people who align with them.

The VC's response was notably positive: this is "the right direction," the "fun part, the interesting part of where this challenge goes to," and a good psychological basis for scoring would be genuinely beneficial to the challenge.

Josh had also voiced a broader scepticism worth noting: he was concerned about the viability of building the whole system in 24 hours, and about producing "a very AI put-together bunch of user interface and some prompts" with little long-term value. The VC's answer effectively endorsed his instinct — **build one part really solidly (the founder/team score) rather than a shallow version of everything.**

---

## 7. Practical Takeaways for a Submission

1. **Make the founder/team score the centrepiece.** Everything else in the investment memo can be generated relatively easily and is not where you win.
2. **Keep scores decomposed and explainable.** Show the sub-scores and the reasoning. Never collapse to a single number.
3. **Ground the scoring in the three real criteria:** can they recruit, can they sell, can they scale.
4. **Pick one sourcing channel and go deep** — but show that you mapped the alternatives first.
5. **Build in honest uncertainty handling:** flag gaps, never fabricate, and escalate to "recommend a call" when information is thin but signals are good.
6. **Persist everything** — a memory layer that supports future iteration and training is explicitly wanted.
7. **Include a configurable thesis filter** (their example: B2B tech) behind an otherwise open door.
8. **Consider psychological / team-complementarity profiling** — the sponsor flagged this as the most interesting direction available.
9. **Make sure real AI does real work** in the system. Technical depth is graded.
10. **Stay in scope** and build fresh during the event.
