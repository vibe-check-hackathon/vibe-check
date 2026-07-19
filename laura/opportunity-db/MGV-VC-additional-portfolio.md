---
schema_version: 1
id: "MGV-VC-PORTFOLIO-ENRICHMENT-20260719"
document_type: "multi_opportunity_card_bundle"
vehicle: "MGV.VC"
vehicle_scope: "United States early-stage enterprise technology fund"
compiled_at: "2026-07-19"
data_basis: "public sources only; no founder evaluations"
record_count: 16
confirmed_inactive_count: 1
confirmed_acquired_count: 3
status_taxonomy: "active | active_rebrand | acquired | inactive | unclear"
funding_policy: "equity, debt/lending commitments, and acquisition consideration stored separately"
---

# MGV.VC — Additional and Historical Portfolio Research

> Supplemental multi-card bundle for the existing Maschmeyer opportunity database. This file covers **MGV.VC**, the U.S. early-stage fund, and does not silently merge it with the German **ALSTIN Capital** or **seed + speed Ventures** portfolios.

## Import and integrity notes

- Each company is represented by a stable `OPP-MGV-US-*` identifier and a fenced YAML payload, followed by the familiar **Summary**, **Evidence and Gaps**, **Sources**, and **Decision** sections.
- `status: closed` means the retrospective opportunity card is closed; `company_status` is the public operating/outcome status.
- A company is marked `inactive` only when an authoritative source explicitly says so. Missing websites, old news, and ambiguous portfolio-page UI labels are not treated as failure proof.
- Funding totals include only amounts that could be traced to public sources. Debt or lending facilities and acquisition consideration are never added to venture-equity totals.
- No Founder Score, interview assessment, or personal evaluation is fabricated.

## Coverage summary

| Company status | Records |
|---|---:|
| `active` | 9 |
| `active_rebrand` | 1 |
| `acquired` | 3 |
| `inactive` | 1 |
| `unclear` | 2 |

## Parse index

| ID | Company | MGV year | Company status | Funding / outcome | Website |
|---|---|---:|---|---|---|
| `OPP-MGV-US-0101` | Observe.AI | 2018 | `active` | $213M total disclosed | https://observe.ai/ |
| `OPP-MGV-US-0102` | Modern Health | 2018 | `active` | $172M total disclosed | https://www.modernhealth.com/ |
| `OPP-MGV-US-0103` | Origin | 2019 | `active` | $68M total disclosed | https://useorigin.com/ |
| `OPP-MGV-US-0104` | Prodigal | 2018 | `active` | ≥$12M disclosed | https://www.prodigaltech.com/ |
| `OPP-MGV-US-0105` | Ascend | 2021 | `active` | $39M equity | https://www.useascend.com/ |
| `OPP-MGV-US-0106` | Authentic Insurance | 2022 | `active` | $16.5M total disclosed | https://www.authenticinsurance.com/ |
| `OPP-MGV-US-0107` | Attention | 2022 | `active` | $30M latest verified round | https://www.attention.com/ |
| `OPP-MGV-US-0108` | District Cover | 2022 | `active` | ≥$7M disclosed | https://districtcover.com/ |
| `OPP-MGV-US-0109` | Buildstock | 2022 | `active` | ≥$1.6M disclosed | https://buildstock.com/ |
| `OPP-MGV-US-0110` | Salut | 2020 | `unclear` | ≥$1.25M disclosed | https://joinsalut.com/ |
| `OPP-MGV-US-0111` | OfficeTogether | 2020 | `acquired` | Acquired by Envoy; terms undisclosed | https://envoy.com/workplace-management/together-is-better-with-officetogether |
| `OPP-MGV-US-0112` | Downstream | 2019 | `acquired` | Acquired by Jungle Scout; terms undisclosed | https://www.junglescout.com/press/press-releases/walmart-connect-now-available-on-downstream-by-jungle-scout/ |
| `OPP-MGV-US-0113` | HeyDoctor | 2018 | `acquired` | Acquired by GoodRx for $14.3M | https://www.goodrx.com/care |
| `OPP-MGV-US-0114` | Buzzle.ai | 2021 | `inactive` | Confirmed inactive; funding unknown | https://www.ycombinator.com/companies/buzzle |
| `OPP-MGV-US-0115` | Aviary Health (formerly Recora care services) | 2020 | `active_rebrand` | Funding unknown | https://www.aviaryhealth.com/ |
| `OPP-MGV-US-0116` | Globe (formerly Recharge) | 2019 | `unclear` | ~$10M predecessor funding | https://globeliving.com/ |

## OPP-MGV-US-0101 — Observe.AI

```yaml
schema_version: 1
id: "OPP-MGV-US-0101"
company: "Observe.AI"
slug: "observe-ai"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2018
fund: 1
sector: "sales and marketing"
website: "https://observe.ai/"
real_event: "$125M Series C; $213M total disclosed funding as of 2022-04-12"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: 213000000
  latest_round_type: "series_c"
  latest_round_amount_usd: 125000000
  latest_round_announced: "2022-04-12"
  total_basis: "company announcement"
```

### Summary

**One-line pitch:** AI-powered contact-center intelligence and agent-performance platform.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2018. | verified | 90/100 | SRC-001 |
| CLM-002 | $125M Series C brought total disclosed funding to $213M. | verified | 95/100 | SRC-002 |
| CLM-003 | Company website remains operational. | verified | 85/100 | SRC-003 |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Observe.AI Series C announcement, 2022-04-12 — https://observe.ai/press-releases/observe-ai-raises-125m-series-c-to-usher-in-ai-empowered-era-for-contact-centers
- **SRC-003:** Company website — https://observe.ai/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; no exit or shutdown identified in this research pass.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0102 — Modern Health

```yaml
schema_version: 1
id: "OPP-MGV-US-0102"
company: "Modern Health"
slug: "modern-health"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2018
fund: 1
sector: "healthcare"
website: "https://www.modernhealth.com/"
real_event: "$74M Series D; $172M total investment and $1.17B valuation reported in 2021"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: 172000000
  latest_round_type: "series_d"
  latest_round_amount_usd: 74000000
  latest_round_announced: "2021-02-11"
  valuation_usd: 1170000000
  total_basis: "company press release"
```

### Summary

**One-line pitch:** Employee mental-health platform combining therapy, coaching, and digital care.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2018. | verified | 90/100 | SRC-001 |
| CLM-002 | $74M Series D; company later stated total investment of $172M and a $1.17B valuation. | verified | 95/100 | SRC-002 |
| CLM-003 | Company newsroom and website remain operational. | verified | 90/100 | SRC-003 |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Modern Health funding announcement — https://www.modernhealth.com/press-media-news/modern-health-continues-to-innovate-grow-as-demand-for-mental-health-in-the-workplace-skyrockets
- **SRC-003:** Company website — https://www.modernhealth.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; reached unicorn valuation in the disclosed 2021 round.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0103 — Origin

```yaml
schema_version: 1
id: "OPP-MGV-US-0103"
company: "Origin"
slug: "origin"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2019
fund: 1
sector: "finance and insurance"
website: "https://useorigin.com/"
real_event: "$56M Series B at a $400M valuation; secondary database reports $68M total funding"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: 68000000
  latest_round_type: "series_b"
  latest_round_amount_usd: 56000000
  latest_round_announced: "2021-08-30"
  valuation_usd: 400000000
  total_basis: "round amount primary; total from secondary database"
```

### Summary

**One-line pitch:** Financial-wellness and money-management platform for employees and consumers.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2019. | verified | 90/100 | SRC-001 |
| CLM-002 | $56M Series B at a $400M valuation. | verified | 90/100 | SRC-002 |
| CLM-003 | $68M total funding is reported by CB Insights and should be treated as secondary-source data. | partially_verified | 70/100 | SRC-003 |
| CLM-004 | Company website remains operational. | verified | 85/100 | SRC-004 |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Business Wire Series B announcement — https://www.businesswire.com/news/home/20210830005105/en/Origin-Secures-%2456M-in-Series-B-Funding-at-%24400M-Valuation-to-Support-Employee-Financial-Health-on-a-Global-Scale
- **SRC-003:** CB Insights funding profile — https://www.cbinsights.com/company/origin-2/financials
- **SRC-004:** Company website — https://useorigin.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; no public exit identified.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0104 — Prodigal

```yaml
schema_version: 1
id: "OPP-MGV-US-0104"
company: "Prodigal"
slug: "prodigal"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2018
fund: 1
sector: "finance and insurance"
website: "https://www.prodigaltech.com/"
real_event: "$12M Series A announced 2021-07-22; MGV participated"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd_min: 12000000
  latest_round_type: "series_a"
  latest_round_amount_usd: 12000000
  latest_round_announced: "2021-07-22"
  total_basis: "minimum based on publicly verified round; prior YC backing not added without an amount"
```

### Summary

**One-line pitch:** Vertical AI and workflow software for consumer-finance servicing and collections.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio company; Fund I. | verified | 90/100 | SRC-001 |
| CLM-002 | $12M Series A led by Menlo Ventures, with MGV participating. | verified | 90/100 | SRC-002 |
| CLM-003 | Current company timeline shows continued product launches through 2025. | verified | 85/100 | SRC-003 |
| GAP-001 | Complete cumulative funding was not established from a primary source. | open | unknown | Search regulatory filings or company disclosures |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Prodigal Series A announcement — https://www.prnewswire.com/news-releases/prodigal-raises-12m-to-give-lenders-actionable-insights-streamline-their-operations-using-ai-301339412.html
- **SRC-003:** Company timeline — https://www.prodigaltech.com/our-story

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; disclosed funding recorded as a minimum, not a complete total.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0105 — Ascend

```yaml
schema_version: 1
id: "OPP-MGV-US-0105"
company: "Ascend"
slug: "ascend"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2021
fund: 1
sector: "finance and insurance"
website: "https://www.useascend.com/"
real_event: "$30M Series A; $39M total equity plus a separate $250M lending commitment"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_equity_disclosed_usd: 39000000
  latest_round_type: "series_a"
  latest_round_amount_usd: 30000000
  latest_round_announced: "2022-01-27"
  debt_or_lending_commitment_usd: 250000000
  total_basis: "company announcement; lending commitment excluded from equity total"
```

### Summary

**One-line pitch:** Insurance-finance automation and premium-payment infrastructure.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2021. | verified | 90/100 | SRC-001 |
| CLM-002 | $30M Series A brought total equity funding to $39M. | verified | 95/100 | SRC-002 |
| CLM-003 | $250M was a lending commitment, not venture equity. | verified | 95/100 | SRC-002 |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Ascend financing announcement — https://www.prnewswire.com/news-releases/ascend-raises-30m-series-a-and-secures-250m-lending-commitment-to-boost-modern-insurance-payment-offerings-301466892.html
- **SRC-003:** Company website — https://www.useascend.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company. Equity and lending capacity are deliberately stored separately.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0106 — Authentic Insurance

```yaml
schema_version: 1
id: "OPP-MGV-US-0106"
company: "Authentic Insurance"
slug: "authentic-insurance"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2022
fund: 1
sector: "finance and insurance"
website: "https://www.authenticinsurance.com/"
real_event: "$11M Series A in 2024; $16.5M total reported by a secondary database"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: 16500000
  latest_round_type: "series_a"
  latest_round_amount_usd: 11000000
  latest_round_announced: "2024-03-26"
  total_basis: "latest round primary; cumulative total from secondary database"
```

### Summary

**One-line pitch:** Infrastructure for software platforms and affinity groups to launch embedded insurance programs.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2022. | verified | 90/100 | SRC-001 |
| CLM-002 | $11M Series A led by FirstMark; MGV participated. | verified | 90/100 | SRC-002 |
| CLM-003 | $16.5M cumulative funding is a secondary-database figure. | partially_verified | 70/100 | SRC-003 |
| CLM-004 | Company website remains operational. | verified | 85/100 | SRC-004 |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Authentic company funding post — https://blog.authenticinsurance.com/p/weve-raised-11m-to-change-where-businesses
- **SRC-003:** CB Insights funding profile — https://www.cbinsights.com/company/authentic-insurance/financials
- **SRC-004:** Company website — https://www.authenticinsurance.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; cumulative funding carries lower confidence than the verified Series A.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0107 — Attention

```yaml
schema_version: 1
id: "OPP-MGV-US-0107"
company: "Attention"
slug: "attention"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2022
fund: 1
sector: "sales and marketing"
website: "https://www.attention.com/"
real_event: "$30M Series B announced 2026-06-23"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  latest_round_type: "series_b"
  latest_round_amount_usd: 30000000
  latest_round_announced: "2026-06-23"
  total_disclosed_usd: null
  total_basis: "latest round verified; cumulative total intentionally left null"
```

### Summary

**One-line pitch:** AI platform that automates follow-up and revenue-team workflows from sales conversations.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2022. | verified | 90/100 | SRC-001 |
| CLM-002 | $30M Series B led by RTP Global. | verified | 95/100 | SRC-002 |
| GAP-001 | A complete cumulative funding total was not stated in the company announcement. | open | unknown | Do not infer a total without reconciling every prior round |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Attention Series B announcement — https://www.attention.com/blog-posts/attention-series-b-press-release
- **SRC-003:** Company website — https://www.attention.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; only the latest verified round is stored.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0108 — District Cover

```yaml
schema_version: 1
id: "OPP-MGV-US-0108"
company: "District Cover"
slug: "district-cover"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2022
fund: 1
sector: "finance and insurance"
website: "https://districtcover.com/"
real_event: "More than $7M raised in a 2024 funding round"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd_min: 7000000
  latest_round_type: "venture"
  latest_round_amount_usd_min: 7000000
  latest_round_announced: "2024-07-23"
  total_basis: "coverage states 'over $7M'; stored as a minimum"
```

### Summary

**One-line pitch:** Commercial-insurance broker and product developer focused on urban small businesses.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2022. | verified | 90/100 | SRC-001 |
| CLM-002 | Funding coverage reports more than $7M raised. | verified | 80/100 | SRC-002 |
| CLM-003 | Company website remains operational. | verified | 85/100 | SRC-003 |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Coverager funding report — https://coverager.com/district-cover-raises-7-million/
- **SRC-003:** Company website — https://districtcover.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; funding is represented as a lower bound.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0109 — Buildstock

```yaml
schema_version: 1
id: "OPP-MGV-US-0109"
company: "Buildstock"
slug: "buildstock"
status: "closed"
company_status: "active"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2022
fund: 1
sector: "property and real estate"
website: "https://buildstock.com/"
real_event: "$1.6M pre-seed announced 2024-02-22; MGV participated"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd_min: 1600000
  latest_round_type: "pre_seed"
  latest_round_amount_usd: 1600000
  latest_round_announced: "2024-02-22"
  total_basis: "verified disclosed round; earlier undisclosed financing may exist"
```

### Summary

**One-line pitch:** B2B marketplace and fintech platform for construction-material procurement.

**Public company status:** `active`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2022. | verified | 90/100 | SRC-001 |
| CLM-002 | $1.6M pre-seed from Precursor, MGV, and other investors. | verified | 90/100 | SRC-002 |
| CLM-003 | Company website remains operational. | verified | 80/100 | SRC-003 |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Buildstock funding announcement — https://www.prnewswire.com/news-releases/buildstock-secures-1-6m-in-pre-seed-funding-to-expand-construction-material-marketplace--fintech-platform-302068986.html
- **SRC-003:** Company website — https://buildstock.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: operating company; cumulative funding stored as at least $1.6M.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0110 — Salut

```yaml
schema_version: 1
id: "OPP-MGV-US-0110"
company: "Salut"
slug: "salut"
status: "closed"
company_status: "unclear"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2020
fund: 1
sector: "healthcare"
website: "https://joinsalut.com/"
real_event: "$1.25M financing announced 2020-11-30"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd_min: 1250000
  latest_round_type: "seed"
  latest_round_amount_usd: 1250000
  latest_round_announced: "2020-11-30"
  total_basis: "verified financing announcement"
```

### Summary

**One-line pitch:** Virtual-fitness platform for trainers to schedule, stream, and monetize classes.

**Public company status:** `unclear`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2020. | verified | 90/100 | SRC-001 |
| CLM-002 | $1.25M financing led by Precursor Ventures. | verified | 90/100 | SRC-002 |
| GAP-001 | Current operating status was not established from a sufficiently authoritative recent source. | open | unknown | Check corporate registry, product access, and recent company communications |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** TechCrunch funding report — https://techcrunch.com/2020/11/30/salut-raises-1-25m-for-its-virtual-fitness-service/
- **SRC-003:** Historical company launch post — https://medium.com/salut-the-official-blog/launching-salut-8bf9684e29a2
- **SRC-004:** Listed company website — https://joinsalut.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: status unclear. The financing is verified, but the company is not labeled failed without authoritative closure evidence.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0111 — OfficeTogether

```yaml
schema_version: 1
id: "OPP-MGV-US-0111"
company: "OfficeTogether"
slug: "officetogether"
status: "closed"
company_status: "acquired"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2020
fund: 1
sector: "human resources"
website: "https://envoy.com/workplace-management/together-is-better-with-officetogether"
real_event: "$2.2M seed; acquired by Envoy on 2022-08-02"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd_min: 2200000
  latest_round_type: "seed"
  latest_round_amount_usd: 2200000
  latest_round_announced: "2020-12-08"
  total_basis: "verified institutional seed round"
outcome:
  type: "acquisition"
  acquirer: "Envoy"
  announced: "2022-08-02"
  consideration_usd: null
  consideration_disclosed: false
```

### Summary

**One-line pitch:** Hybrid-work desk reservation and employee scheduling software.

**Public company status:** `acquired`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2020. | verified | 90/100 | SRC-001 |
| CLM-002 | $2.2M seed led by Defy; MGV participated. | verified | 85/100 | SRC-002 |
| CLM-003 | Envoy acquired OfficeTogether; the team joined Envoy and customers were slated to migrate. | verified | 95/100 | SRC-003 |
| GAP-001 | Acquisition consideration was not publicly disclosed. | open | unknown | Terms undisclosed |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** TechCrunch seed report — https://techcrunch.com/2020/12/08/newly-funded-officetogether-looks-to-help-other-startups-reopen-their-offices-safely/
- **SRC-003:** Envoy acquisition announcement — https://envoy.com/press-release/envoy-bets-big-on-hybrid-work-with-acquisition-of-officetogether

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: acquired by Envoy; purchase price undisclosed.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0112 — Downstream

```yaml
schema_version: 1
id: "OPP-MGV-US-0112"
company: "Downstream"
slug: "downstream"
status: "closed"
company_status: "acquired"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2019
fund: 1
sector: "sales and marketing"
website: "https://www.junglescout.com/press/press-releases/walmart-connect-now-available-on-downstream-by-jungle-scout/"
real_event: "Acquired by Jungle Scout in March 2021; terms undisclosed"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: null
  total_basis: "no reliable cumulative funding total established"
outcome:
  type: "acquisition"
  acquirer: "Jungle Scout"
  announced: "2021-03-04"
  consideration_usd: null
  consideration_disclosed: false
```

### Summary

**One-line pitch:** Advertising automation and analytics for brands selling on Amazon and other marketplaces.

**Public company status:** `acquired`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2019. | verified | 90/100 | SRC-001 |
| CLM-002 | Jungle Scout acquired Downstream in March 2021. | verified | 95/100 | SRC-002 |
| GAP-001 | Funding total and acquisition price were not publicly established. | open | unknown | Terms undisclosed |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Jungle Scout confirmation — https://www.junglescout.com/press/press-releases/walmart-connect-now-available-on-downstream-by-jungle-scout/
- **SRC-003:** Jungle Scout transaction announcement — https://www.prnewswire.com/news-releases/jungle-scout-announces-110-million-in-growth-capital-to-empower-ecommerce-brands-301240437.html

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: acquired by Jungle Scout; funding and deal consideration remain unknown.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0113 — HeyDoctor

```yaml
schema_version: 1
id: "OPP-MGV-US-0113"
company: "HeyDoctor"
slug: "heydoctor"
status: "closed"
company_status: "acquired"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2018
fund: 1
sector: "healthcare"
website: "https://www.goodrx.com/care"
real_event: "Acquired by GoodRx on 2019-04-18 for $14.3M cash; later rebranded GoodRx Care"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: null
  total_basis: "pre-acquisition venture funding not established"
outcome:
  type: "acquisition"
  acquirer: "GoodRx"
  announced: "2019-04-18"
  consideration_usd: 14300000
  consideration_type: "cash"
  consideration_disclosed: true
  successor_brand: "GoodRx Care"
```

### Summary

**One-line pitch:** Online physician consultations and treatment for routine medical conditions.

**Public company status:** `acquired`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2018. | verified | 90/100 | SRC-001 |
| CLM-002 | GoodRx acquired 100% of HeyDoctor on 2019-04-18 for $14.3M cash. | verified | 100/100 | SRC-002 |
| CLM-003 | The service was subsequently rebranded GoodRx Care. | verified | 95/100 | SRC-002 |
| GAP-001 | Pre-acquisition funding total was not established. | open | unknown | Do not confuse acquisition consideration with funding |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** GoodRx SEC filing — https://www.sec.gov/Archives/edgar/data/1809519/000156459021012614/gdrx-10k_20201231.htm
- **SRC-003:** GoodRx product announcement — https://investors.goodrx.com/news-releases/news-release-details/goodrx-expands-healthcare-services-introduction-heydoctor-goodrx?mobile=1

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: acquired for $14.3M cash. Acquisition consideration is not recorded as venture funding.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0114 — Buzzle.ai

```yaml
schema_version: 1
id: "OPP-MGV-US-0114"
company: "Buzzle.ai"
slug: "buzzle-ai"
status: "closed"
company_status: "inactive"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2021
fund: 1
sector: "sales and marketing"
website: "https://www.ycombinator.com/companies/buzzle"
real_event: "Y Combinator currently marks the company Inactive"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: null
  total_basis: "no reliable public funding amount established"
outcome:
  type: "inactive"
  verified: true
  verified_by: "Y Combinator company profile"
```

### Summary

**One-line pitch:** Voice-of-customer analytics derived from recorded sales and customer conversations.

**Public company status:** `inactive`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2021. | verified | 90/100 | SRC-001 |
| CLM-002 | Y Combinator marks Buzzle as Inactive and identifies it as a Summer 2021 company. | verified | 95/100 | SRC-002 |
| GAP-001 | Funding amount and shutdown date were not publicly established. | open | unknown | Check corporate records or founder announcements |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Y Combinator company profile — https://www.ycombinator.com/companies/buzzle
- **SRC-003:** Historical company domain — https://buzzle.ai/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: confirmed inactive. This is the clearest publicly verified non-active company found in the research set.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0115 — Aviary Health (formerly Recora care services)

```yaml
schema_version: 1
id: "OPP-MGV-US-0115"
company: "Aviary Health (formerly Recora care services)"
slug: "aviary-health"
status: "closed"
company_status: "active_rebrand"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2020
fund: 1
sector: "healthcare"
website: "https://www.aviaryhealth.com/"
real_event: "Recora launched the Aviary Health brand on 2026-04-07"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  total_disclosed_usd: null
  total_basis: "funding not researched to a reliable total in this pass"
outcome:
  type: "rebrand"
  former_name: "Recora"
  announced: "2026-04-07"
  verified: true
```

### Summary

**One-line pitch:** Technology-enabled cardiac, pulmonary, and care-management programs for health systems.

**Public company status:** `active_rebrand`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC lists both Recora/Aviary lineage in its portfolio data. | verified | 85/100 | SRC-001 |
| CLM-002 | Recora announced its care-services business would operate as Aviary Health. | verified | 95/100 | SRC-002 |
| CLM-003 | Aviary Health has current 2026 terms and privacy materials. | verified | 90/100 | SRC-003 |
| GAP-001 | Cumulative funding was not established in this pass. | open | unknown | Research Recora financing rounds separately |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** Aviary Health rebrand announcement — https://www.aviaryhealth.com/resources/recora-launches-aviary-health-as-it-expands-beyond-cardiac-recovery
- **SRC-003:** Current company terms — https://www.aviaryhealth.com/terms-of-service

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: active rebrand, not a failure. Funding remains an open field.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## OPP-MGV-US-0116 — Globe (formerly Recharge)

```yaml
schema_version: 1
id: "OPP-MGV-US-0116"
company: "Globe (formerly Recharge)"
slug: "globe"
status: "closed"
company_status: "unclear"
source_channel: "retrospective_public_research"
created_at: "2026-07-19T00:00:00Z"
updated_at: "2026-07-19T00:00:00Z"
decision_deadline: "unknown"
founder_ids: []
thesis_id: "THESIS-US-ENTERPRISE"
investment_vehicle: "MGV.VC"
portfolio_year: 2019
fund: 1
sector: "property and real estate"
website: "https://globeliving.com/"
real_event: "Predecessor Recharge reportedly raised about $10M; Globe faced regulatory pressure in 2020"
data_basis: "public sources, compiled 2026-07-19 — retrospective research card"
funding:
  predecessor_funding_usd_approx: 10000000
  predecessor_name: "Recharge"
  total_disclosed_usd: null
  total_basis: "press report says predecessor had raised around $10M; not treated as a precise Globe total"
```

### Summary

**One-line pitch:** Short-duration room and workspace rental marketplace that evolved from hotel-by-the-hour startup Recharge.

**Public company status:** `unclear`

### Founders and Team

- **Founder Score snapshot:** not assessed — this research bundle does not fabricate evaluations of real people.
- Founder-level research was outside this enrichment pass; `founder_ids` remains an empty array for deterministic parsing.

### Assessment

| Axis | Rating | Trend | Confidence | Rationale |
|---|---|---|---|---|
| Founder | not assessed | — | unknown | No fabricated judgments of real founders |
| Market | not assessed | — | unknown | Portfolio-history research only |
| Idea vs. market | not assessed | — | unknown | Portfolio-history research only |

### Evidence and Gaps

| ID | Claim or gap | State | Trust | Evidence / next action |
|---|---|---|---|---|
| CLM-001 | MGV.VC portfolio listing; Fund I; investment year 2019. | verified | 90/100 | SRC-001 |
| CLM-002 | Globe evolved from Recharge, which reportedly raised around $10M. | claimed | 70/100 | SRC-002 |
| CLM-003 | The company faced potentially existential regulatory pressure in San Francisco in 2020. | verified | 80/100 | SRC-002 |
| GAP-001 | Current company status and exact cumulative funding are not authoritatively established. | open | unknown | Do not classify as failed solely from old reporting or domain behavior |

### Sources

- **SRC-001:** MGV.VC portfolio — https://www.mgv.vc/portfolio
- **SRC-002:** TechCrunch company and regulatory report — https://techcrunch.com/2020/05/27/globe-fight/
- **SRC-003:** Listed historical company domain — https://globeliving.com/

### Interview

🔒 **Confidential — no public founder interview assessment performed for this supplemental card.**

### Decision

- **Real-world public outcome:** Public outcome: unclear. The record preserves the predecessor funding estimate but does not claim a shutdown.
- Internal diligence, negotiation, ownership, return multiple, and write-off data: **unknown / not public**.

## Bundle-level sources and caveats

- Official MGV.VC portfolio and company metadata: https://www.mgv.vc/portfolio
- Official MGV.VC website: https://www.mgv.vc/
- Related German vehicles, kept outside this MGV.VC bundle: https://www.alstin.capital/ and https://www.seedandspeed.com/
- The MGV portfolio page currently renders repeated `Exited` / `Non active` text around many cards. Those interface strings were **not** accepted as company-specific status evidence because they are not reliably associated with individual records in the rendered page.
- Private write-offs, returned capital, ownership percentages, internal IC decisions, and loss ratios generally are not public. `inactive` therefore means publicly confirmed inactive, not necessarily a disclosed write-off.

## Suggested import logic

1. Split records on headings matching `^## OPP-MGV-US-\d{4}`.
2. Parse the first fenced `yaml` block beneath each heading.
3. Use `status` for opportunity workflow state and `company_status` for the real-world company outcome.
4. Treat null funding values and `GAP-*` rows as unresolved fields rather than zero.
