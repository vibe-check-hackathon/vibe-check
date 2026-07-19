# Opportunity DB Background Check — Maschmeyer Group Ventures

Checked on 2026-07-19 against public web sources. Scope: the Maschmeyer Group /
ALSTIN / seed + speed context and all opportunity DB markdown cards.

## Summary

The original DB was directionally correct but had stale placeholder data for
Timefold, Climatiq, and Pliant. Those cards now contain verified round details,
founder names, dates, and source ledgers. I also corrected deskbird's later
Series B from partially verified to verified, and added Sebastian Pinkas as
VoiceLine co-founder / CTO.

Founder evaluations remain intentionally `not assessed`; I did not invent
Founder Scores or private diligence judgments.

## Website / Source Checks

### Maschmeyer Group / Funds

- Maschmeyer Group website: confirms ALSTIN Capital as active, Late Seed /
  Series A, initial investment 1-5m, Europe; seed + speed as active Pre-Seed &
  Seed, B2B software, DACH; and MGV as North America focused.
  - https://www.maschmeyer-group.de/
- ALSTIN III: public coverage confirms the €175M Fund III close in late 2024.
  - https://www.startbase.de/news/carsten-maschmeyer-sammelt-175-millionen-euro-fuer-alstin-iii-ein/
- seed + speed Fund III: public coverage confirms €90M close in January 2026
  and pre-seed/seed European B2B/enterprise software focus.
  - https://tech.eu/2026/01/28/seedspeed-ventures-closes-eur90m-fund-iii-tripling-its-original-target/

### Card Corrections

#### OPP-MGV-0001 — Secfix

- Kept the $12M Series A led by ALSTIN Capital on 2026-02-25.
- Cross-check source confirms amount, lead investor, participating Bayern
  Kapital and neosfer, and no public valuation.
  - https://www.startup.eu/investments/secfix-12m-series-a-02-2026

#### OPP-MGV-0002 — deskbird

- Corrected later Series B from `partially_verified` to `verified`.
- Added the company press release source for $23M Series B announced
  2025-09-24, led by Octopus Ventures with participation from Alstin Capital,
  Neva SGR, AVP, session.vc, and PortfoLion.
- Kept the 2023 $13M Series A co-led by ALSTIN Capital and AVP.
  - https://www.deskbird.com/press-releases/series-a-funding
  - https://www.deskbird.com/press-releases/23-million-series-b

#### OPP-MGV-0003 — VoiceLine

- Added Sebastian Pinkas as CTO and co-founder.
- Added VoiceLine about page and Munich Startup Series A coverage as sources.
- Kept the €10M Series A led by ALSTIN Capital and Peak.
  - https://voiceline.ai/about
  - https://www.munich-startup.de/en/117517/voiceline-series-a/

#### OPP-MGV-0004 — Timefold

- Replaced placeholder "portfolio company; round details not verified" with a
  verified $13M Series A led by Alstin Capital, announced 2026-06-23.
- Added founders Maarten Vandenbroucke and Geoffrey De Smet.
- Added company-claimed 4x ARR growth in 2025 and enterprise customer/user
  references as claimed evidence, not independently verified.
  - https://timefold.ai/blog/timefold-raises-series-a

#### OPP-MGV-0005 — Climatiq

- Replaced placeholder "portfolio company; round details not verified" with a
  verified €10M Series A led by ALSTIN Capital, first published 2025-06-25 and
  updated 2025-07-02.
- Added founders Hessam Lavi, Philipp von Bieberstein, and Isis T. Baulig.
- Added customer/calculation scale claims as company-claimed evidence.
  - https://www.climatiq.io/blog/series-a-investment
  - https://www.climatiq.io/about
  - https://invest-in.berlin/news/climatiq-raises-eur10m-series-a-for-carbon-intelligence/

#### OPP-MGV-0006 — Pliant

- Replaced placeholder "portfolio company; round details not verified" with
  verified financing history:
  - 2021 seed participation by Alstin / seed + speed sources from Pliant press
    index.
  - 2023-02-17 $28M Series A with ALSTIN Capital participating.
  - 2024 Series A extension to €33M plus €100M debt facility.
  - 2025 $40M Series B led by Illuminate Financial and Speedinvest; ALSTIN was
    not listed as a Series B lead in the company release.
- Added founders Malte Rau and Fabian Terner.
  - https://www.getpliant.com/en/press
  - https://www.getpliant.com/en-us/about-pliant
  - https://www.getpliant.com/it/stampa/pliant-raises-28-million-in-series-a-funding-round/
  - https://www.getpliant.com/en-us/press/pliant-6-5-million-in-seed-funding-from-alstin
  - https://www.getpliant.com/en-gb/press/pliant-concludes-a-successful-2023
  - https://www.getpliant.com/en-us/press/series-b

## Files Changed

- `README.md`: updated card table and source inventory.
- `index.json`: synchronized machine-readable events/founders with card facts.
- `OPP-MGV-0002-deskbird.md`: verified Series B milestone.
- `OPP-MGV-0003-voiceline.md`: added Sebastian Pinkas and sources.
- `OPP-MGV-0004-timefold.md`: replaced placeholder with verified Series A.
- `OPP-MGV-0005-climatiq.md`: replaced placeholder with verified Series A.
- `OPP-MGV-0006-pliant.md`: replaced placeholder with verified financing
  history.

## Remaining Open Items

- Private diligence data remains unavailable: exact ALSTIN check sizes,
  ownership, cap tables, ARR, and investor memo details.
- Company-claimed operating metrics, such as ARR growth, customer counts, and
  calculation volumes, are marked as claimed unless independently corroborated.
- No public founder interview was found for VoiceLine, Timefold, Climatiq, or
  Pliant during this pass.
