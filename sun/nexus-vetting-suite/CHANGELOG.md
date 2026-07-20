# Changelog — investor app

Work done in the 2026-07-19 session, newest first. Structure and conventions
live in [STRUCTURE.md](./STRUCTURE.md); this file is the record of what changed
and why.

Open items are collected at the bottom — **read those before demoing.**

---

## Real founder histories, LinkedIn links, collapsible diligence — `fff3df5`

**Team history was four fictional people.** The memo listed Amina Osei, Lukas
Berger, Marie Roche and Nikhil Rao — leftovers from the Helix Bio demo, unrelated
to anyone on the team. It now renders the actual four founders from
`ACME_FOUNDERS`, each linking to their supplied LinkedIn profile. The same links
appear on the founder profile pages.

**Founder backgrounds are sourced from this repository.** The `history` field
described robotics deployments and enzyme research. Each line is now drawn from
the repo's own commit history, which is verifiable:

| Founder       | Commits | Owns                                                                             |
| ------------- | ------- | -------------------------------------------------------------------------------- |
| Laura Spies   | 48      | sourcing/developing pipeline, screening, opportunity DB, LLM adapter, login gate |
| Sun Chuanqi   | 43      | system architecture, deck, talk track                                            |
| Martin Auer   | 23      | board, pipeline navigation, profile model, inbound flow                          |
| Mehdi Gouasmi | 5       | demo requirements and screenplay                                                 |

**LinkedIn could not be used as a source.** Three of the four URLs return HTTP
999 (LinkedIn's bot block); the fourth returned only fragments that the response
itself flagged as login-gated. Prior career history is therefore labelled
founder-supplied and uncorroborated in the memo rather than invented.

**Due diligence simplified** into six collapsible topics (People open by
default), each showing owner, progress and an "N to resolve" count. Header
badges are now derived from the checks — they previously read "2 contradictions"
while the data held 1. Lane contents and the activity log still described Helix
Bio (EPFL, thyssenkrupp, pilot tonnage) and now describe FirstCheck.

## FirstCheck rebrand, four-founder team, live personality hypotheses — `895b9c7`

- The demo company is the team's own product. Sidebar brand is **FirstCheck**,
  not Maschmeyer Group. Memo, diligence and references rewritten to describe
  what the pipeline actually does.
- **Mehdi Gouasmi** joins as the fourth co-founder. The team radar overlays all
  four founders instead of two.
- Every founder carries a **16-personalities read held as an open hypothesis**,
  shown on the psychogram and tested live in the interview, where the agent
  moves its status and confidence as evidence arrives. Never a verdict issued
  from a deck.
- The **live interview** seats four founders plus the agent, with per-founder
  vibe signals keyed by founder id rather than two hardcoded slots.
- The avatar in the top-right corner **is** the profile switcher. Applicants no
  longer see the fund in the sidebar.

Two bugs found while verifying:

- The click-away backdrop (`z-40`, at root) painted over the header (`z-30`, its
  own stacking context), making **every** header dropdown unclickable — bell and
  sector menus included. Pre-existing; merging the menus exposed it. Header
  raised to `z-50`.
- The sidebar logo pointed at an external asset URL that 404s. Replaced with an
  inline mark.

**Chart colors.** The four radar series were three near-identical greens plus
orange. Replaced with a categorical palette (`--series-1..4`) validated for
colorblind separation and contrast against both the light and dark surfaces,
with separate dark-mode steps rather than an automatic flip.

## Profile switcher becomes a dropdown — `b2d55de`

The segmented toggle became a dropdown listing each profile with the person
behind it, pinned to the header's top-right corner (`ml-auto`, so it hugs the
corner regardless of search width). The account block is identity-aware:
investor shows Carl-Philipp Beichert, startup shows Martin Auer.

The psychogram founders became the team itself. The guardrail banner was
factually wrong once real people entered the scored psychogram; it now states
the demo founders are team members using their own names with consent, and that
third-party founders stay unscored.

## Profile switcher, inbound application flow, investor rename — `7dd8b4b`, `497294e`, `ed0ae18`

- Investor identity moved to a single `INVESTOR` constant, renamed to
  **Carl-Philipp Beichert**, with his photo.
- Profile switcher toggles investor/startup; the choice persists in
  `localStorage`.
- Submitting an application fires the profiling pass: public-profile lookup per
  founder, then the personality hypotheses the agent interview must test
  (`laura/pipeline/lib/founder-profiles.js`). The record is filed in the
  pipeline inbox and served back over `GET /applications`, so the card appears
  on the board in the same shape as every other card.

**Merge with a teammate's parallel work.** A login gate (`src/lib/auth.ts`,
`/login`) landed upstream doing the same job as the switcher. Both were kept:
the gate decides _who you are_, the switcher lets an authenticated investor
_preview_ the other side. The apply flows turned out complementary — theirs
normalizes intake into the pipeline shape, mine adds hypotheses and the board
wiring — so they were combined rather than one replacing the other.

## Horizontal stage bar, three-item sidebar — `26f9aef`

The sidebar carried both top-level areas and individual deal stages, which made
the pipeline read as a flat list of pages rather than a flow.

- Sidebar reduced to **Board · Pipeline · Settings**.
- Deal stages moved into a horizontal bar pinned below the header:
  Company snapshot → Founder profiles → Agent interview → Due diligence.
- Founder profiles surfaced as their own stage instead of being buried inside
  the psychogram page.
- Pipeline lost its landing page: `/` redirects to the first stage and the old
  dashboard was removed, since Board already covers that overview.
- `laura/frontend/` (the standalone preview site) was removed;
  `laura/pipeline/` stayed as the API-only backend.

> Note: `laura/frontend/` was later restored upstream by a teammate and is alive
> again. That deletion did not stick and was not repeated.

---

## Open items

1. **Martin's profile photo is missing.** The file was never saved to disk, so
   he renders initials (MA) in the header, the psychogram and the interview.
   Save it to `public/martin-auer.jpg`, then set `STARTUP_USER.avatarUrl` and
   `ACME_FOUNDERS[0].photo` in `src/lib/data.ts`.

2. **Founder career histories are repo-sourced only.** The `history` lines
   describe contributions to this project, not prior careers, because LinkedIn
   is not machine-readable without authentication. Paste real bios to replace
   them.

3. **The five-axis scores are invented.** Sun, Laura and Mehdi inherited numeric
   axis scores from the fictional founders they replaced, now attached to real
   names. The guardrail banner asserts the team consented to being scored —
   confirm that is actually true before showing this to anyone outside the team.

4. **The demo is dev-server only.** `POST /apply`, `GET /applications`,
   `/thesis` and `/opportunity-db/*` are Vite middleware in `vite.config.ts`; a
   production build serves none of them.
