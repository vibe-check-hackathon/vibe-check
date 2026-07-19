# Outbound Person & Potential Team Intelligence Brief

> Reusable template for founder, executive, or operator outreach based on public and permitted data sources. Populate one brief per primary person. Keep every claim traceable to evidence and label inferred information clearly.

---

## 1. Record Metadata

| Field | Value |
|---|---|
| Brief ID | `{{brief_id}}` |
| Generated at | `{{generated_at}}` |
| Last refreshed | `{{last_refreshed_at}}` |
| Primary person ID | `{{person_id}}` |
| Primary company hypothesis ID | `{{company_hypothesis_id}}` |
| Analyst/owner | `{{owner}}` |
| Overall confidence | `{{overall_confidence_0_to_100}}` |
| Outreach status | `Not started / Drafted / Contacted / Replied / Qualified / Closed` |
| Priority | `P0 / P1 / P2 / P3` |

---

## 2. Executive Summary

**Person:** {{full_name}}  
**Current hypothesis:** {{one_sentence_company_or_startup_hypothesis}}  
**Why this person matters:** {{one_sentence_relevance_summary}}  
**Why now:** {{recent_trigger_or_timing_signal}}  
**Recommended action:** {{recommended_outbound_action}}  

### Key supporting signals

- {{signal_1}}
- {{signal_2}}
- {{signal_3}}

### Main uncertainty

{{largest_unknown_or_risk}}

---

## 3. Primary Person Profile

### Identity

| Field | Value |
|---|---|
| Full name | {{full_name}} |
| Preferred name | {{preferred_name}} |
| Current title/headline | {{current_title_or_headline}} |
| Current organization | {{current_organization_or_unknown}} |
| Location | {{location}} |
| LinkedIn/public profile | {{profile_url}} |
| Personal website | {{personal_website}} |
| GitHub | {{github_url}} |
| Other public profiles | {{other_public_profiles}} |

### Contactability

| Channel | Value | Confidence | Source |
|---|---|---:|---|
| Work email | {{work_email}} | {{confidence}} | {{source}} |
| Personal/professional email | {{other_email}} | {{confidence}} | {{source}} |
| Phone | {{phone}} | {{confidence}} | {{source}} |
| LinkedIn DM | {{available_yes_no}} | {{confidence}} | {{source}} |
| Warm introduction path | {{warm_intro_path}} | {{confidence}} | {{source}} |

> Only use contact information obtained through lawful, permitted, and policy-compliant sources. Do not include sensitive personal data that is unnecessary for business outreach.

### Professional history

| Period | Organization | Role | Notes | Source |
|---|---|---|---|---|
| {{start}}–{{end}} | {{organization}} | {{role}} | {{scope_impact_or_team}} | {{source_url}} |
| {{start}}–{{end}} | {{organization}} | {{role}} | {{scope_impact_or_team}} | {{source_url}} |

### Founder/operator indicators

| Indicator | Status | Evidence | Confidence |
|---|---|---|---:|
| Prior founder | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |
| Prior exit | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |
| Senior operating role | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |
| Recently left employer | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |
| Employment gap or stealth language | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |
| Active technical/project footprint | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |
| New legal/domain footprint | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |
| Investor/accelerator association | {{yes_no_unknown}} | {{evidence}} | {{confidence}} |

### Expertise and likely functional role

**Primary expertise:** {{primary_expertise}}  
**Secondary expertise:** {{secondary_expertise}}  
**Likely startup role:** `CEO / CTO / CPO / COO / Founding Engineer / Advisor / Unknown`  
**Relevant industries:** {{industries}}  
**Relevant technologies:** {{technologies}}  
**Notable customer or market exposure:** {{customer_market_exposure}}  

---

## 4. Company or Startup Hypothesis

### Hypothesized entity

| Field | Value |
|---|---|
| Working company name | {{working_company_name}} |
| Legal entity | {{legal_entity_name_or_unknown}} |
| Domain | {{domain_or_unknown}} |
| Product/category | {{product_category_hypothesis}} |
| Stage | `Idea / Pre-incorporation / Incorporated / Stealth / Pre-seed / Seed / Unknown` |
| Geography | {{company_geography}} |
| First observed | {{first_observed_at}} |
| Last activity observed | {{last_activity_at}} |

### Formation evidence

| Signal | Category | Observed date | Evidence | Source | Confidence |
|---|---|---|---|---|---:|
| {{signal}} | `Employment / Team / Legal / Domain / Hiring / Developer / Academic / Patent / Grant / Accelerator / University / VC / Customer / Human / First-party` | {{date}} | {{evidence_summary}} | {{source_url}} | {{confidence}} |
| {{signal}} | {{category}} | {{date}} | {{evidence_summary}} | {{source_url}} | {{confidence}} |

### Hypothesis narrative

{{concise_explanation_connecting_the_person_team_and_company_signals}}

### Confidence assessment

| Dimension | Score | Notes |
|---|---:|---|
| Identity resolution | {{0_to_100}} | {{notes}} |
| Company formation likelihood | {{0_to_100}} | {{notes}} |
| Team linkage | {{0_to_100}} | {{notes}} |
| Timing relevance | {{0_to_100}} | {{notes}} |
| Commercial fit | {{0_to_100}} | {{notes}} |

---


## 5. Startup Stage and Readiness Assessment

> Estimate stage from multiple independent signals. Do not treat employee count, financing, accelerator participation, or a single public statement as conclusive on its own.

### Stage estimate

| Field | Value |
|---|---|
| Estimated stage | `Idea / Validation / Prototype / Pre-seed / Seed / Series A+ / Growth / Unknown` |
| Stage confidence | {{stage_confidence_0_to_100}} |
| Product readiness | `Concept / Prototype / MVP / Pilot / Production / Scaling / Unknown` |
| Commercial readiness | `Research / Customer discovery / Design partners / Pilots / Revenue / Repeatable GTM / Unknown` |
| Investment readiness | `Not ready / Preparing / Actively raising / Recently funded / Unknown` |
| Expected next milestone | {{expected_next_milestone}} |
| Estimated milestone timing | {{estimated_milestone_timing}} |

### Stage evidence

| Dimension | Current evidence | Source | Confidence | Missing proof |
|---|---|---|---:|---|
| Problem validation | {{customer_interviews_waitlist_or_problem_evidence}} | {{source}} | {{confidence}} | {{missing_proof}} |
| Product/prototype | {{prototype_demo_repository_or_product_evidence}} | {{source}} | {{confidence}} | {{missing_proof}} |
| Customer traction | {{pilots_design_partners_revenue_or_usage}} | {{source}} | {{confidence}} | {{missing_proof}} |
| Team formation | {{founders_hires_advisors_or_open_roles}} | {{source}} | {{confidence}} | {{missing_proof}} |
| Legal/IP readiness | {{incorporation_licenses_patents_or_assignments}} | {{source}} | {{confidence}} | {{missing_proof}} |
| Capital readiness | {{grant_accelerator_investor_or_fundraising_signal}} | {{source}} | {{confidence}} | {{missing_proof}} |

### Stage rationale

{{explain_why_the_observed_signals_support_the_estimated_stage_and_note_any_conflicting_evidence}}

---

## 6. Accelerator, University, and Innovation-Ecosystem Intelligence

### Program participation

| Program or institution | Program type | Participation status | Cohort/date | Relevant milestone | Source | Confidence |
|---|---|---|---|---|---|---:|
| {{program_name}} | `Accelerator / Incubator / University innovation center / Tech-transfer office / Venture studio / Corporate program / Government program / Competition / Hackathon` | `Applied / Accepted / Active / Completed / Alumni / Unknown` | {{cohort_or_date}} | {{milestone}} | {{source_url}} | {{confidence}} |

### University and commercialization relationships

| Institution/unit | Relationship | Technology or project | Commercialization status | Key contact/role | Source |
|---|---|---|---|---|---|
| {{university_or_center}} | `Research lab / Innovation center / Tech transfer / Sponsored research / License / Spinout / Mentor network` | {{technology_or_project}} | {{status}} | {{public_role_or_contact_path}} | {{source_url}} |

### Ecosystem support map

| Need | Existing support | Potential program or partner | Warm path | Recommended next step |
|---|---|---|---|---|
| Technical validation | {{existing_support}} | {{program_or_center}} | {{warm_path}} | {{next_step}} |
| Commercial validation | {{existing_support}} | {{program_or_center}} | {{warm_path}} | {{next_step}} |
| Regulatory/industry access | {{existing_support}} | {{program_or_center}} | {{warm_path}} | {{next_step}} |
| Talent/recruiting | {{existing_support}} | {{program_or_center}} | {{warm_path}} | {{next_step}} |
| Capital preparation | {{existing_support}} | {{program_or_center}} | {{warm_path}} | {{next_step}} |

### Program-derived observations

- **Demonstrated progress:** {{observed_progress}}
- **Program feedback:** {{attributable_feedback_or_unknown}}
- **Mentor/adviser engagement:** {{mentor_engagement}}
- **Demo or prototype observed:** {{yes_no_details}}
- **Outstanding program obligations:** {{equity_ip_reporting_or_other_obligations}}

---

## 7. Academic, Research, and Technical-Credibility Profile

### Education and research history

| Period | Institution | Degree/role | Department/lab | Research area | Source |
|---|---|---|---|---|---|
| {{period}} | {{institution}} | {{degree_or_role}} | {{department_or_lab}} | {{research_area}} | {{source_url}} |

### Relevant publications and research outputs

| Publication/output | Year | Founder role | Topic relevance | Co-authors | Citations/impact | Source |
|---|---:|---|---|---|---|---|
| {{title}} | {{year}} | {{author_position_or_contribution}} | {{relevance_to_startup}} | {{coauthors}} | {{citation_or_impact_context}} | {{source_url}} |

### Academic-network signals

- **Frequent collaborators:** {{frequent_collaborators}}
- **Principal investigators or advisers:** {{pis_or_academic_advisers}}
- **Research-to-product continuity:** {{how_research_maps_to_product}}
- **Relevant grants:** {{grant_programs_awards_and_dates}}
- **Open-source or research software:** {{repositories_packages_or_tools}}
- **Technical credibility assessment:** {{assessment_with_evidence}}

> Academic pedigree alone must not be used as a proxy for founder quality. Emphasize demonstrated work, relevance, collaboration, and execution.

---

## 8. Patent, Trademark, and Intellectual-Property Intelligence

### IP portfolio

| Record | Type | Status | Filing/priority date | Inventors/creators | Assignee/owner | Product relevance | Source |
|---|---|---|---|---|---|---|---|
| {{record_identifier_or_title}} | `Patent / Provisional / Trademark / Copyright / Trade secret claim / License` | {{status}} | {{date}} | {{people}} | {{owner}} | {{relevance}} | {{source_url}} |

### IP relationship and risk assessment

| Question | Assessment | Evidence | Confidence | Follow-up |
|---|---|---|---:|---|
| Is a founder a named inventor? | {{assessment}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Does the startup own the relevant IP? | {{assessment}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Is university/employer assignment implicated? | {{assessment}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Is a license publicly confirmed? | {{assessment}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Does the IP materially overlap the product? | {{assessment}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Are there known ownership or freedom-to-operate uncertainties? | {{assessment}} | {{evidence}} | {{confidence}} | {{follow_up}} |

### Co-inventor and technical-team network

| Person | Shared IP/research | Relationship to founder | Potential startup role | Current availability signal | Confidence |
|---|---|---|---|---|---:|
| {{person}} | {{patent_publication_or_project}} | {{relationship}} | {{role}} | {{availability_signal}} | {{confidence}} |

> A patent filing is not proof of product quality, defensibility, ownership, enforceability, or commercial value. Record legal status and ownership separately from technical relevance.

---

## 9. Human, Social, and Real-World Validation

> Keep human observations attributable, access-controlled, and separate from independently verified facts. Record only information relevant to legitimate professional evaluation and support.

### Human intelligence ledger

| Observation | Observer role | Relationship/context | Observed at | Verification status | Visibility | Consent/use basis |
|---|---|---|---|---|---|---|
| {{observation}} | `Accelerator manager / Innovation-center staff / Mentor / Professor / Investor / Customer / Former colleague / Adviser / Event organizer / Founder-submitted` | {{context}} | {{date}} | `Verified / Corroborated / Unverified / Disputed` | `Public / Internal / Restricted` | {{basis}} |

### Real-world operating signals

| Signal | Status | Evidence/observation | Confidence | Follow-up |
|---|---|---|---:|---|
| Prototype demonstrated in person | {{status}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Customer discovery completed | {{status}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Pilot/design partner confirmed | {{status}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Founders work well together | {{status}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Founder commitment is full-time | {{status}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Key technical claim independently validated | {{status}} | {{evidence}} | {{confidence}} | {{follow_up}} |
| Material conflict or unresolved issue | {{status}} | {{evidence}} | {{confidence}} | {{follow_up}} |

### Human-support opportunities

- **Best warm introduction:** {{person_and_reason}}
- **Most useful mentor/adviser:** {{person_or_profile}}
- **Potential design partner/customer:** {{organization_or_role}}
- **Relevant founder community:** {{community_or_program}}
- **Recommended in-person next step:** {{meeting_demo_event_or_workshop}}

---

## 10. VC, Angel, and Capital Intelligence

### Existing capital and investor relationships

| Investor/funder | Type | Relationship/status | Stage/round | Amount/check size | Date | Evidence | Confidence |
|---|---|---|---|---|---|---|---:|
| {{investor_or_funder}} | `VC / Corporate VC / Angel / Syndicate / Family office / Grant / University fund / Accelerator fund / Venture debt` | `Invested / Committed / In diligence / Introduced / Portfolio relationship / Unknown` | {{stage_or_round}} | {{amount_or_range}} | {{date}} | {{source}} | {{confidence}} |

### Fundraising-readiness assessment

| Dimension | Score | Evidence | Gap/risk | Recommended action |
|---|---:|---|---|---|
| Narrative and market clarity | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |
| Founder/team credibility | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |
| Product/technical proof | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |
| Customer validation/traction | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |
| Market size and timing | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |
| Defensibility/IP/data advantage | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |
| Diligence readiness | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |
| Warm investor access | {{0_to_10}} | {{evidence}} | {{gap}} | {{action}} |

### Potential VC and capital matches

| Rank | Fund/investor | Investor category | Thesis fit | Stage fit | Geography fit | Typical check | Relevant partner | Warm path | Portfolio conflict | Match score |
|---:|---|---|---|---|---|---|---|---|---|---:|
| 1 | {{fund_name}} | `Pre-seed specialist / Seed / Series A / Deep tech / University spinout / Sector specialist / Impact / Corporate VC / Angel` | {{thesis_fit}} | {{stage_fit}} | {{geography_fit}} | {{check_range}} | {{partner}} | {{warm_path}} | {{conflict_status}} | {{0_to_100}} |
| 2 | {{fund_name}} | {{category}} | {{thesis_fit}} | {{stage_fit}} | {{geography_fit}} | {{check_range}} | {{partner}} | {{warm_path}} | {{conflict_status}} | {{0_to_100}} |
| 3 | {{fund_name}} | {{category}} | {{thesis_fit}} | {{stage_fit}} | {{geography_fit}} | {{check_range}} | {{partner}} | {{warm_path}} | {{conflict_status}} | {{0_to_100}} |

### VC-category coverage

| Category | Relevance | Candidate investors/programs | Notes |
|---|---|---|---|
| Pre-seed and founder-first funds | {{relevance}} | {{candidates}} | {{notes}} |
| Seed and institutional VC | {{relevance}} | {{candidates}} | {{notes}} |
| Deep-tech/science commercialization funds | {{relevance}} | {{candidates}} | {{notes}} |
| University spinout and proof-of-concept funds | {{relevance}} | {{candidates}} | {{notes}} |
| Sector-specific funds | {{relevance}} | {{candidates}} | {{notes}} |
| Corporate venture capital | {{relevance}} | {{candidates}} | {{notes}} |
| Government/non-dilutive capital | {{relevance}} | {{candidates}} | {{notes}} |
| Angel investors and operator angels | {{relevance}} | {{candidates}} | {{notes}} |
| Family offices and patient capital | {{relevance}} | {{candidates}} | {{notes}} |
| Impact/climate/mission-aligned capital | {{relevance}} | {{candidates}} | {{notes}} |
| Venture debt/revenue-based financing | {{relevance}} | {{candidates}} | {{notes}} |
| Strategic customers and commercial partners | {{relevance}} | {{candidates}} | {{notes}} |

### Investor-fit rationale

{{explain_why_the_top_investors_fit_the_company_stage_sector_geography_team_and_round_and_note_any_portfolio_conflicts_or_thesis_mismatches}}

### Recommended capital next step

`Prepare materials / Resolve IP / Complete customer discovery / Secure lead investor / Pursue grants / Request warm introductions / Build investor pipeline / Delay fundraising`

{{specific_next_step_and_owner}}

---

## 11. Potential Teammates

> Include people only when there is a defensible professional connection or a contemporaneous signal. Do not infer sensitive relationships.

### Team ranking

| Rank | Person | Likely role | Relationship to primary person | Recent signal | Team probability | Outreach relevance |
|---:|---|---|---|---|---:|---:|
| 1 | {{teammate_name}} | {{likely_role}} | {{shared_employer_school_project_or_investor}} | {{recent_signal}} | {{0_to_100}} | {{0_to_100}} |
| 2 | {{teammate_name}} | {{likely_role}} | {{relationship}} | {{recent_signal}} | {{0_to_100}} | {{0_to_100}} |
| 3 | {{teammate_name}} | {{likely_role}} | {{relationship}} | {{recent_signal}} | {{0_to_100}} | {{0_to_100}} |

---

### Potential Teammate 1 — {{teammate_name}}

**Profile URL:** {{profile_url}}  
**Current role:** {{current_role}}  
**Likely startup role:** {{likely_startup_role}}  
**Team probability:** {{team_probability_0_to_100}}  

#### Connection evidence

- {{shared_employer_or_project}}
- {{overlapping_dates_or_recent_departure}}
- {{shared_domain_repo_legal_entity_event_or_other_signal}}

#### Relevant background

{{short_professional_summary}}

#### Why this person may be involved

{{reasoned_inference_with_clear_uncertainty}}

#### Outreach relevance

{{why_contacting_this_person_is_or_is_not_recommended}}

#### Sources

- {{source_url_1}}
- {{source_url_2}}

---

### Potential Teammate 2 — {{teammate_name}}

**Profile URL:** {{profile_url}}  
**Current role:** {{current_role}}  
**Likely startup role:** {{likely_startup_role}}  
**Team probability:** {{team_probability_0_to_100}}  

#### Connection evidence

- {{connection_signal_1}}
- {{connection_signal_2}}
- {{connection_signal_3}}

#### Relevant background

{{short_professional_summary}}

#### Why this person may be involved

{{reasoned_inference_with_clear_uncertainty}}

#### Outreach relevance

{{why_contacting_this_person_is_or_is_not_recommended}}

#### Sources

- {{source_url_1}}
- {{source_url_2}}

---

### Potential Teammate 3 — {{teammate_name}}

**Profile URL:** {{profile_url}}  
**Current role:** {{current_role}}  
**Likely startup role:** {{likely_startup_role}}  
**Team probability:** {{team_probability_0_to_100}}  

#### Connection evidence

- {{connection_signal_1}}
- {{connection_signal_2}}
- {{connection_signal_3}}

#### Relevant background

{{short_professional_summary}}

#### Why this person may be involved

{{reasoned_inference_with_clear_uncertainty}}

#### Outreach relevance

{{why_contacting_this_person_is_or_is_not_recommended}}

#### Sources

- {{source_url_1}}
- {{source_url_2}}

---

## 12. Team Composition Assessment

| Function | Likely person | Coverage status | Evidence | Confidence |
|---|---|---|---|---:|
| Business/CEO | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |
| Engineering/CTO | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |
| Product | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |
| Go-to-market | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |
| Domain expert | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |
| Academic/research lead | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |
| Regulatory/IP | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |
| Fundraising/investor relations | {{person}} | `Covered / Gap / Unknown` | {{evidence}} | {{confidence}} |

### Likely team strengths

- {{strength_1}}
- {{strength_2}}
- {{strength_3}}

### Likely team gaps

- {{gap_1}}
- {{gap_2}}
- {{gap_3}}

### Team-quality dimensions

| Dimension | Score | Evidence | Risk/uncertainty |
|---|---:|---|---|
| Domain expertise | {{0_to_10}} | {{evidence}} | {{risk}} |
| Technical execution | {{0_to_10}} | {{evidence}} | {{risk}} |
| Commercial capability | {{0_to_10}} | {{evidence}} | {{risk}} |
| Prior collaboration | {{0_to_10}} | {{evidence}} | {{risk}} |
| Founder-market fit | {{0_to_10}} | {{evidence}} | {{risk}} |
| Product-building history | {{0_to_10}} | {{evidence}} | {{risk}} |
| Customer access | {{0_to_10}} | {{evidence}} | {{risk}} |
| Hiring ability | {{0_to_10}} | {{evidence}} | {{risk}} |
| Network/ecosystem support | {{0_to_10}} | {{evidence}} | {{risk}} |
| Role complementarity | {{0_to_10}} | {{evidence}} | {{risk}} |

### Team assessment narrative

{{explain_team_strengths_complementarity_missing_roles_and_why_the_team_may_or_may_not_be_well_suited_to_the_specific_problem}}

---

## 13. Relationship Graph

```mermaid
flowchart LR
    P[{{primary_person}}]
    T1[{{teammate_1}}]
    T2[{{teammate_2}}]
    T3[{{teammate_3}}]
    C[{{company_hypothesis}}]
    E1[{{shared_employer_or_school}}]
    D[{{domain_or_legal_entity}}]

    P -->|worked at / studied at| E1
    T1 -->|worked at / studied at| E1
    T2 -->|worked with| P
    T3 -->|contributed to| D
    P -->|linked by evidence| C
    T1 -->|possible teammate| C
    T2 -->|possible teammate| C
    D -->|associated with| C
```

---

## 14. Outbound Strategy

### Recommended recipient order

1. **{{first_recipient}}** — {{why_first}}
2. **{{second_recipient}}** — {{why_second}}
3. **{{third_recipient}}** — {{why_third}}

### Outreach objective

`Introduction / Product feedback / Customer discovery / Partnership / Recruiting / Accelerator referral / University connection / Patent or licensing discussion / Mentor match / Pilot opportunity / VC introduction / Grant support / Investment / Data validation / Other`

### Best personalization angles

- {{specific_recent_event_or_project}}
- {{shared_connection_or_relevant_background}}
- {{company_or_market_problem_relevant_to_them}}
- {{credible_value_proposition}}

### Avoid mentioning

- Private or sensitive personal information.
- Unsupported claims that the person has founded or joined a company.
- Surveillance-like details or an exhaustive list of observed activity.
- Information obtained from sources that prohibit its use for outreach.
- Potential teammates by name unless the relationship is public and relevant.

### Suggested call to action

{{low_friction_cta}}

### Outreach message draft

> Hi {{first_name}} — I noticed {{public_and_non_intrusive_trigger}}. Given your background in {{relevant_expertise}}, I thought {{specific_value_proposition}} might be relevant. We are {{one_sentence_company_context}}. Would you be open to a brief conversation about {{clear_topic}}?

### Alternate teammate message

> Hi {{teammate_first_name}} — your work on {{public_project_or_role}} stood out. I am speaking with people working around {{problem_area}}, and your experience in {{specific_domain}} seems especially relevant. Would you be open to a short exchange on {{specific_topic}}?

---

## 15. Objections and Response Notes

| Likely objection | Why it may arise | Recommended response |
|---|---|---|
| “How did you find me?” | Early-stage or stealth context | Cite only the specific public source that triggered the outreach and keep the explanation simple. |
| “We are not building a company.” | Hypothesis may be wrong | Acknowledge the error immediately; do not argue or reveal additional monitoring. |
| “Not interested.” | Timing or fit | Close politely and suppress further outreach unless the person opts back in. |
| “Contact my colleague instead.” | Better team entry point | Record consent/context and route outreach to the named person. |

---

## 16. Evidence Ledger

| Evidence ID | Claim supported | Source | Source type | Observed at | Confidence | Permitted use checked |
|---|---|---|---|---|---:|---|
| E-001 | {{claim}} | {{source_url}} | {{source_type}} | {{date}} | {{confidence}} | `Yes / No / Review` |
| E-002 | {{claim}} | {{source_url}} | {{source_type}} | {{date}} | {{confidence}} | `Yes / No / Review` |

### Inferences

| Inference | Supporting evidence IDs | Confidence | Alternative explanation |
|---|---|---:|---|
| {{inference}} | {{E_001_E_002}} | {{confidence}} | {{alternative}} |

---

## 17. Pipeline Output Schema

The generation pipeline should emit one structured record per primary person:

```json
{
  "brief_id": "brief_123",
  "person": {
    "person_id": "person_123",
    "full_name": "{{full_name}}",
    "current_title": "{{current_title}}",
    "profile_urls": [],
    "contact_channels": [],
    "expertise": [],
    "founder_indicators": [],
    "academic_profile": {
      "institutions": [],
      "research_areas": [],
      "publications": [],
      "grants": [],
      "collaborators": []
    },
    "ip_profile": {
      "patents": [],
      "trademarks": [],
      "licenses": [],
      "ownership_risks": []
    }
  },
  "company_hypothesis": {
    "company_id": "company_456",
    "name": "{{company_name}}",
    "domain": "{{domain}}",
    "category": "{{category}}",
    "stage": "{{stage}}",
    "formation_probability": 0.0,
    "stage_confidence": 0.0,
    "product_readiness": "{{product_readiness}}",
    "commercial_readiness": "{{commercial_readiness}}",
    "investment_readiness": "{{investment_readiness}}",
    "evidence_ids": []
  },
  "ecosystem": {
    "accelerators": [],
    "university_programs": [],
    "innovation_centers": [],
    "tech_transfer_relationships": [],
    "government_programs": [],
    "recommended_support_paths": []
  },
  "human_intelligence": {
    "observations": [],
    "real_world_validation": [],
    "warm_introduction_paths": [],
    "visibility": "restricted"
  },
  "capital_intelligence": {
    "existing_investors": [],
    "fundraising_readiness": 0.0,
    "target_investors": [],
    "grants_and_non_dilutive_capital": [],
    "portfolio_conflicts": [],
    "recommended_capital_next_step": "{{capital_next_step}}"
  },
  "potential_teammates": [
    {
      "person_id": "person_789",
      "full_name": "{{teammate_name}}",
      "likely_role": "{{role}}",
      "relationship_types": [],
      "team_probability": 0.0,
      "outreach_relevance": 0.0,
      "evidence_ids": []
    }
  ],
  "outbound": {
    "priority": "P1",
    "recommended_recipient_order": [],
    "personalization_angles": [],
    "recommended_cta": "{{cta}}",
    "draft_message": "{{message}}"
  },
  "quality": {
    "overall_confidence": 0.0,
    "independent_source_count": 0,
    "last_refreshed_at": "{{timestamp}}",
    "human_review_required": true,
    "verified_fact_count": 0,
    "inference_count": 0,
    "restricted_observation_count": 0
  }
}
```

---

## 18. Scoring Guidance

### Team probability

```text
+25  Publicly confirmed same new company
+20  Shared new legal entity, domain, or product
+15  Multiple contemporaneous departures from the same employer
+15  Recent joint repository, launch, event, or project activity
+10  Strong prior working relationship
+10  Complementary founder-level role
 +5  Shared investor, accelerator, or advisor
-20  Clear current full-time role elsewhere
-20  Evidence is older than 18 months with no recent confirmation
-30  Identity resolution is uncertain
```

### Outreach priority

```text
Priority score =
  0.30 × commercial_fit
+ 0.25 × timing_relevance
+ 0.20 × company_formation_probability
+ 0.15 × contactability
+ 0.10 × warm_path_strength
```

Suggested bands:

| Score | Priority | Recommended handling |
|---:|---|---|
| 80–100 | P0 | Human review and highly personalized outreach |
| 65–79 | P1 | Personalized outreach after evidence validation |
| 45–64 | P2 | Nurture, enrich, or wait for another signal |
| Below 45 | P3 | Do not contact; continue passive monitoring only |

---

## 19. Human Review Checklist

- [ ] The primary person is correctly resolved.
- [ ] Every material claim has a source.
- [ ] Inferences are labeled as inferences.
- [ ] At least two independent signal categories support the company hypothesis.
- [ ] Potential teammates have defensible public professional connections.
- [ ] Accelerator, university, and innovation-program participation is correctly represented.
- [ ] Academic achievements are relevant and are not being used as a prestige proxy.
- [ ] Patent status, ownership, licensing, and product relevance are recorded separately.
- [ ] Human observations are attributable, permissioned, access-controlled, and distinct from verified facts.
- [ ] Startup-stage and fundraising-readiness estimates identify contradictory evidence.
- [ ] VC matches reflect current thesis, stage, geography, check size, decision-maker relevance, and portfolio conflicts.
- [ ] Contact information is lawfully obtained and permitted for use.
- [ ] The draft message does not imply surveillance.
- [ ] The message uses only one or two natural personalization details.
- [ ] Suppression, opt-out, and do-not-contact rules have been checked.
- [ ] A human approved the final outbound message.

---


## 19A. Integrated Next-Best Actions

| Priority | Action | Category | Owner | Target/date | Dependency | Expected outcome |
|---:|---|---|---|---|---|---|
| 1 | {{action}} | `Founder outreach / Team introduction / Accelerator referral / University connection / Tech-transfer follow-up / Patent diligence / Customer pilot / Mentor match / Grant application / VC introduction / Hiring` | {{owner}} | {{target_or_date}} | {{dependency}} | {{outcome}} |
| 2 | {{action}} | {{category}} | {{owner}} | {{target_or_date}} | {{dependency}} | {{outcome}} |
| 3 | {{action}} | {{category}} | {{owner}} | {{target_or_date}} | {{dependency}} | {{outcome}} |

### Recommended support sequence

1. {{first_support_step}}
2. {{second_support_step}}
3. {{third_support_step}}

### Do-not-progress conditions

- {{condition_requiring_more_validation_or_consent}}
- {{material_ip_team_or_compliance_risk}}
- {{evidence_quality_threshold_not_met}}

---

## 20. Final Disposition

| Field | Value |
|---|---|
| Approved for outreach | `Yes / No / Needs review` |
| Approved recipient | {{recipient}} |
| Approved channel | {{channel}} |
| Approved message version | {{version}} |
| Next action date | {{date}} |
| Recommended ecosystem path | {{accelerator_university_program_or_partner}} |
| Recommended capital path | {{vc_grant_angel_cvc_or_other}} |
| Required diligence before introduction | {{diligence_items}} |
| Notes | {{notes}} |

