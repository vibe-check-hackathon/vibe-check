# Founder-trait evaluation: experts, validated measures, startup systems, law and ethics

**Version:** 1.0  
**Evidence and law checked:** 21 July 2026  
**Purpose:** A design brief for a founder interview conducted by an LLM, optionally preceded by a review of public professional information.

> **Important:** This is a research and product-design guide, not legal advice, a clinical assessment, or a validated prediction model. No published instrument currently justifies a universal “founder success score.” The lawful and scientifically defensible design is a structured, multi-method assessment whose meaning is limited to the use case and population in which it has been validated.

## Executive recommendation

Build a **founder evidence profile**, not a personality type and not a pass/fail oracle.

The strongest design has five independent evidence channels:

1. **Validated self-report measures** administered and scored exactly as their manuals require.
2. **A structured, construct-specific interview** with the same prompts and behavioral anchors for every comparable founder.
3. **Work samples or decision tasks** that show how the founder reasons under realistic uncertainty.
4. **Multi-rater evidence** from co-founders or colleagues for team-level constructs.
5. **Verified professional history**, used to generate questions and check claims—not to infer hidden psychology.

Keep the five channels separate in the report. Combine them into a decision score only after a prospective validation study shows that the combination predicts a defined outcome, adds value beyond ordinary diligence, and performs acceptably across relevant groups.

### What the system may say

- “The founder gave two specific examples of revising a decision after disconfirming evidence.”
- “Their validated scale score was in the published reference range shown here.”
- “Confidence and accuracy were well calibrated on this defined decision task.”
- “The interview evidence is mixed; follow-up is required.”

### What it should not say

- “This founder has an 82% probability of success” without a relevant, out-of-sample validation study.
- “This founder is an INTJ and therefore a better CEO.”
- “The founder is narcissistic, deceptive, depressed, autistic, or emotionally unstable” from language, face, voice, or social media.
- “Public information is fair game.” Public availability does not remove privacy, accuracy, discrimination, platform-contract, or data-protection duties.

## 1. Evidence standard

Use the following labels throughout the product.

| Evidence tier | Meaning | Permitted use |
|---|---|---|
| **A — established construct and validated measure** | Peer-reviewed scale/task with evidence for reliability and construct validity; use still requires correct administration and population fit | A component of research or developmental assessment; consequential use requires local criterion validation |
| **B — promising founder-specific evidence** | Founder/entrepreneur research exists, but outcome effects are modest, contextual, self-reported, or not independently replicated | Hypothesis generation and coaching; do not make it a hard cutoff |
| **C — proprietary vendor evidence** | Vendor supplies reliability/validity claims, often against its own criteria | Benchmark or development only until the technical manual and an independent/local validation are reviewed |
| **D — experimental inference** | LLM, speech, video, social-media, or digital-footprint inference without adequate validation for the intended decision | Research sandbox only; never a sole or decisive factor |
| **Prohibited/unsuitable** | Clinical diagnosis, protected/sensitive inference, physiognomy, emotion recognition, lie detection, or an unsupported universal success prediction | Do not implement |

Scientific validation is not a permanent badge on a questionnaire. It is an argument supported by evidence for a **particular interpretation, population, language, administration method, and use**. Converting a self-report scale into an LLM interview score creates a new instrument that must be validated again. This follows the [Standards for Educational and Psychological Testing](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf) and, for employment, [SIOP's Principles and AI-assessment recommendations](https://www.siop.org/wp-content/uploads/2024/06/Considerations-and-Recommendations-for-the-Validation-and-Use-of-AI-Based-Assessments-for-Employee-Selection-January-2023.pdf).

## 2. Construct and measurement map

The table prioritizes traits and behaviors that are plausibly relevant to founder work. It does **not** imply that each predicts venture success or that more is always better.

| Construct | Recommended validated measure | Best additional method | Example structured interview probe | Interpretation and limitation | Key experts |
|---|---|---|---|---|---|
| **Broad personality** | BFI-2 Big Five or HEXACO-PI-R/HEXACO-60 | Structured behavioral examples; knowledgeable-other report | “Describe a six-month objective that required repetitive execution. What system did you use and what was the result?” | Continuous traits are preferable to 16 categorical types. Personality is descriptive, not destiny; startup effects are modest and contextual. | Christopher Soto, Oliver John; Kibeom Lee, Michael Ashton; Brent Roberts |
| **Entrepreneurial self-efficacy (ESE)** | McGee et al. ESE scale: searching, planning, marshaling, implementing-people, implementing-financial | Domain work sample and confidence calibration | “Give an example of finding and mobilizing a resource you did not control. What did you personally do?” | Confidence can enable action but may also be miscalibrated. Score efficacy and evidence separately. | Jeffrey McGee, Mark Peterson, Stephen Mueller, Jennifer Sequeira; Albert Bandura |
| **Entrepreneurial alertness** | Tang, Kacmar & Busenitz 13-item scale: scanning/search, association/connection, evaluation/judgment | Opportunity-recognition case with novel and false-positive signals | “What weak signal changed your view of the market? How did you distinguish signal from noise?” | Measures a founder-relevant cognitive orientation; not a standalone forecast of performance. | Jintong Tang, K. Michele Kacmar, Lowell Busenitz; Masoud Karami |
| **Decision competence and calibration** | Adult Decision-Making Competence battery (A-DMC) | Forecasting task with confidence, Brier score, pre-mortem, and base-rate prompt | “State your probability, base rate, strongest disconfirming evidence, and what result would change the decision.” | Prefer scored tasks to stylistic language inference. A-DMC covers framing resistance, confidence calibration, decision rules, risk consistency and sunk costs. | Baruch Fischhoff, Wändi Bruine de Bruin, Andrew Parker |
| **Intellectual humility** | Comprehensive Intellectual Humility Scale (CIHS) | Counter-evidence work sample; observer rating | “Describe an important belief you changed. What evidence changed it, and what did the change cost you?” | Separate willingness to revise from indecisiveness. Do not reward performative modesty. | Elizabeth Krumrei-Mancuso, Steven Rouse; Mark Leary |
| **Cognitive flexibility** | Cognitive Flexibility Inventory (CFI) | Scenario switching with explicit trade-offs | “When did your first plan stop fitting reality? Show the alternatives you generated and why you chose the replacement.” | General self-report evidence is stronger than founder-outcome evidence. Use for development, not a success cutoff. | John Dennis, Jillon Vander Wal |
| **Adaptive persistence** | Goal Adjustment Scale: disengagement and re-engagement | Milestone review; stopping-rule exercise | “Tell me about a goal you stopped pursuing. What was the stopping rule, and where did you redeploy effort?” | Persistence and stopping are complements. “Grit” alone can reward escalation of commitment. | Carsten Wrosch, Michael Scheier, Gregory Miller; Dean Shepherd |
| **Personal initiative/proactivity** | Personal Initiative Scale or a suitably validated proactive-personality measure | Evidence of self-started, barrier-crossing action | “What important action did you initiate before anyone requested it, and what obstacle did you overcome?” | Distinguish purposeful initiative from impulsive activity. Founder-specific predictive evidence is not universal. | Michael Frese, Doris Fay; Thomas Bateman, J. Michael Crant |
| **Entrepreneurial passion** | Cardon et al. Entrepreneurial Passion Scale: inventing, founding, developing; intense positive feeling plus identity centrality | Preparedness check and longitudinal behavior | “Which founder activities energize you, and which do you reliably avoid? Give recent evidence.” | Passion can attract attention but is not equivalent to competence. Recent meta-analyses show measurement and context matter. | Melissa Cardon, Joakim Wincent, Jagdip Singh, Mateja Drnovsek; Hao Zhao |
| **Honesty–humility / integrity-related tendencies** | HEXACO Honesty–Humility; integrity measures only with appropriate manual and validation | Verified consistency, reference checks, ethical dilemma with reasons | “Describe a decision where telling the full truth reduced your short-term advantage.” | Never infer honesty from eye contact, vocal tone or “micro-expressions.” Verify claims and give a correction route. | Kibeom Lee, Michael Ashton; Linda Treviño |
| **Expressed humility** | Owens, Johnson & Mitchell 9-item observer-report scale | Multi-rater report from co-founders/direct reports | “What limitation have you disclosed to your team, whose strength did you rely on, and what did you learn?” | It is an observable interpersonal pattern, best rated by others—not a self-declared virtue. | Bradley Owens, Michael Johnson, Terence Mitchell |
| **Ethical leadership** | Brown, Treviño & Harrison Ethical Leadership Scale | Follower report; dilemma work sample; incident evidence | “When did you enforce a value at a financial or political cost? What alternatives did you reject?” | Team members should rate day-to-day conduct. Avoid a single self-report morality score. | Michael Brown, Linda Treviño, David Harrison |
| **Psychological safety** | Edmondson's 7-item team scale | Anonymous team survey, aggregated only with adequate group size | “What happens after someone publicly disagrees with you or reports your mistake?” | A team climate, not a founder personality trait. Founder-only inference is invalid. | Amy Edmondson |
| **Team conflict quality** | Jehn Intragroup Conflict scales; later task/relationship/process conflict variants | Confidential co-founder/team ratings and incident coding | “Describe the last serious co-founder disagreement. How was it resolved and what relationship damage remained?” | Task disagreement can differ from relationship/process conflict. The team—not the founder alone—is the unit of analysis. | Karen Jehn; Leslie DeChurch; Carsten De Dreu |
| **Emotion regulation** | Emotion Regulation Questionnaire (ERQ): cognitive reappraisal and expressive suppression | Pressure scenario; longitudinal self-monitoring | “Describe a high-stakes setback. What did you do in the first hour, the next day, and the following week?” | Style is not disorder. Cultural display norms matter. Do not infer internal emotion from face or voice. | James Gross, Oliver John |
| **Recovery and sustainable performance** | Recovery Experience Questionnaire: detachment, relaxation, mastery, control | Workload/recovery diary; optional burnout screen | “After intense periods, what reliably restores performance? Show how this appears in your calendar.” | Treat as health-support and development data, not an investment veto. A 2024 study validated the recovery measure with entrepreneurs. | Sabine Sonnentag, Charlotte Fritz |
| **Burnout state** | Copenhagen Burnout Inventory (CBI) or an occupational-health instrument selected by a qualified professional | Voluntary confidential referral pathway | Ask only in a voluntary wellbeing context; do not elicit medical history in selection | State screening is not diagnosis and is highly sensitive. Keep results out of investor/hiring decision files. | Tage Kristensen and occupational-health specialists |
| **Relevant experience and learning from it** | Structured biographical inventory; verified milestones; no “personality” label | Work sample and reference check | “What did prior industry/startup experience teach you that changed a later decision? What did not transfer?” | A 2024 meta-analysis found a positive but weak, context-sensitive relation between experience and venture performance. Experience is not a psychological trait. | Entrepreneurship and human-capital researchers; Dean Shepherd on learning from failure |

### Primary scientific sources

- Tang, Kacmar & Busenitz, [Entrepreneurial Alertness in the Pursuit of New Opportunities](https://doi.org/10.1016/j.jbusvent.2010.07.001).
- Karami et al. (2025), [Creativity, alertness, and entrepreneurship: a multilevel meta-analysis](https://doi.org/10.1080/00472778.2024.2418030).
- McGee et al., [Entrepreneurial Self-Efficacy: Refining the Measure](https://doi.org/10.1111/j.1540-6520.2009.00304.x).
- Caliendo, Kritikos et al. (2023), [Self-efficacy and entrepreneurial performance of start-ups](https://docs.iza.org/dp15848.pdf), a direct longitudinal founder study rather than a meta-analysis.
- Bruine de Bruin, Parker & Fischhoff, [Adult Decision-Making Competence](https://www.rand.org/pubs/external_publications/EP20070524.html).
- Krumrei-Mancuso & Rouse, [Comprehensive Intellectual Humility Scale](https://pubmed.ncbi.nlm.nih.gov/26542408/).
- Dennis & Vander Wal, [Cognitive Flexibility Inventory](https://doi.org/10.1007/s10608-009-9276-4).
- Wrosch et al., [Goal Adjustment Scale](https://www.cmu.edu/dietrich/psychology/pdf/scales/GAS_scale.pdf).
- Cardon et al., [Measuring entrepreneurial passion](https://doi.org/10.1016/j.jbusvent.2012.03.003), and Zhao & Liu (2023), [meta-analysis of three passion measures](https://econpapers.repec.org/article/saeentthe/v_3a47_3ay_3a2023_3ai_3a2_3ap_3a524-552.htm).
- Edmondson, [Psychological safety and learning behavior in work teams](https://www.hbs.edu/faculty/Pages/item.aspx?num=2959).
- Owens, Johnson & Mitchell, [Expressed humility in organizations](https://doi.org/10.1287/orsc.1120.0795).
- Brown, Treviño & Harrison, [Ethical Leadership Scale](https://doi.org/10.1016/j.obhdp.2005.03.002).
- Gross & John, [Emotion Regulation Questionnaire](https://spl.stanford.edu/sites/g/files/sbiybj19321/files/media/file/english_0.pdf).
- Sonnentag & Fritz, [Recovery Experience Questionnaire](https://pubmed.ncbi.nlm.nih.gov/17638488/), plus [2024 entrepreneur validation](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1466905/full).
- Grežo et al. (2024), [meta-analysis of entrepreneurial experience and venture success](https://jemi.edu.pl/vol-20-issue-1-2024/entrepreneurial-experience-and-venture-success-a-comprehensive-meta-analysis-of-performance-determinants).

## 3. Constructs to exclude or sharply constrain

| Proposed inference | Decision | Reason |
|---|---|---|
| MBTI/16-type founder classification | **Exclude from consequential scoring** | Categorical type labels discard continuous information and have no validated universal mapping to founder success. A type can be used as voluntary entertainment or coaching language only if clearly labeled. |
| Clinical disorders or neurodivergence | **Do not infer** | Requires qualified clinical assessment and may expose highly sensitive health/disability data. It is usually irrelevant and legally dangerous in selection. |
| “Narcissism,” psychopathy or Dark Triad from public posts | **Do not diagnose or score** | Measures and outcome findings vary; reputational and discrimination risks are high. A 2025 meta-analytic review describes a CEO-narcissism [measurement trap](https://www.emerald.com/jmp/article/41/3/558/1315545/The-measurement-trap-a-meta-analytic-review-of). Assess job-relevant behaviors such as retaliation, credit-taking and feedback rejection instead. |
| Facial, voice or text “emotion recognition” | **Do not use** | Internal emotion cannot be reliably read from appearance; disability, culture, language and recording quality create bias. Workplace emotion recognition is generally prohibited by the EU AI Act except narrow medical/safety uses. |
| Lie detection from language, gaze or micro-expressions | **Do not use** | No adequate validity for consequential founder evaluation. Use claim verification and documented inconsistencies. |
| Mental-health, sexuality, religion, politics, race/ethnicity or disability inference from public data | **Do not collect or infer** | Sensitive/protected data, usually unnecessary, and capable of proxy discrimination. |
| A single resilience, grit or “hustle” maximum | **Do not optimize** | Extreme persistence can become escalation of commitment, unsafe work or failure to pivot. Measure recovery and stopping rules as well. |
| A universal founder-success probability | **Do not publish before validation** | Venture outcome depends strongly on market, timing, capital, team, strategy and chance. Model calibration will decay across sectors, stages and cycles. |

The 2023 large-scale study [Founder personality and entrepreneurial outcomes](https://www.pnas.org/doi/10.1073/pnas.2215829120) is useful research, but it inferred personality from public digital footprints. It does not validate an individual selection score. Digital personality inference shows signal at group level while raising measurement and context limitations; see Hinds & Joinson's 2024 [meta-analysis](https://pubmed.ncbi.nlm.nih.gov/38753373/).

## 4. Leading experts and what each contributes

“Leading” is not an official rank. The people below are included because they authored influential constructs/measures, recent syntheses, or professional guidance directly relevant to this system. Listing does not imply endorsement of this product.

### Entrepreneurship and founder behavior

| Expert | Relevant contribution | What to ask them to review |
|---|---|---|
| **Melissa S. Cardon** | Entrepreneurial passion, identity and teams | Whether passion domains are correctly administered and not confused with preparedness or capability |
| **Dean A. Shepherd** | Entrepreneurial cognition, learning from failure, grief and decision-making | Failure-learning probes, adaptive persistence and safeguards against glorifying harm |
| **Michael Frese** | Personal initiative and action-regulation theory in entrepreneurship | Behavioral anchors for proactive action and cross-cultural measurement |
| **Jintong Tang, K. Michele Kacmar, Lowell Busenitz** | Entrepreneurial Alertness Scale | Construct fidelity and founder-specific validity design |
| **Jeffrey McGee, Mark Peterson, Stephen Mueller, Jennifer Sequeira** | Entrepreneurial Self-Efficacy scale | Domain scoring, confidence calibration and avoidance of a generic confidence halo |
| **Masoud Karami** | Recent meta-analytic work on creativity, alertness and entrepreneurship | Evidence synthesis and moderator/context analysis |
| **Robert A. Baron** | Social-cognitive entrepreneurship research | Interview scenarios involving judgment, affect and opportunity recognition |
| **Saras Sarasvathy** | Effectuation and entrepreneurial decision logic; entrepreneurship scholar rather than psychologist | Decision scenarios under uncertainty without treating one logic as universally superior |

### Decision science, psychometrics and interview design

| Expert | Relevant contribution | What to ask them to review |
|---|---|---|
| **Baruch Fischhoff, Wändi Bruine de Bruin, Andrew Parker** | Adult Decision-Making Competence | Task validity, scoring, calibration and debiasing claims |
| **Elizabeth Krumrei-Mancuso** | Comprehensive Intellectual Humility Scale | Humility construct boundaries and response-style risks |
| **Christopher Soto** | Modern Big Five measurement, including BFI-2 | Trait selection, norms, translations and scoring fidelity |
| **Kibeom Lee, Michael Ashton** | HEXACO model and Honesty–Humility | Proper use of HEXACO and avoidance of moral determinism |
| **Fred Oswald, Richard Landers, Nancy Tippins, Tara Behrend, Christopher Nye** | I-O assessment, technology and AI-based selection guidance | Criterion validity, adverse impact, accessibility, explainability and governance |
| **Louis Tay** | Psychometrics, construct validation and technology-enabled assessment | Measurement invariance, score interpretation and validation protocol |

### Teams, leadership and sustainable performance

| Expert | Relevant contribution | What to ask them to review |
|---|---|---|
| **Amy Edmondson** | Psychological safety and team learning | Team-level measurement, aggregation and leader-behavior probes |
| **Karen Jehn** | Task and relationship conflict | Co-founder conflict taxonomy and multi-rater design |
| **Bradley Owens** | Expressed humility | Observer anchors and separation from self-presentation |
| **Linda Treviño and Michael Brown** | Ethical leadership | Ethical behavior scenarios and follower-report safeguards |
| **James Gross** | Emotion regulation | State/strategy measurement without emotion-reading claims |
| **Sabine Sonnentag and Charlotte Fritz** | Recovery from work stress | Confidential recovery measurement and founder-wellbeing design |

### Digital behavior and computational assessment

| Expert | Relevant contribution | What to ask them to review |
|---|---|---|
| **Joanne Hinds and Adam Joinson** | Meta-analysis of personality prediction from digital behavior | Boundary conditions, error, consent and individual-level validity |
| **H. Andrew Schwartz** | Language and psychological measurement at scale | Model cards, linguistic confounds and cross-domain generalization |
| **Sandra Matz** | Psychological targeting and digital footprints | Privacy, manipulation and ethical limits of inference |
| **Louis Hickman and Richard Landers** | AI-based assessment and automated interviews | Reliability, fairness, criterion validation and candidate experience |

An advisory group should also include a founder from an underrepresented background, a disability/accessibility expert, a privacy engineer, an employment/credit/privacy lawyer for every operating jurisdiction, and an independent civil-rights/fairness auditor. Expertise in psychology does not replace expertise in law or lived experience.

## 5. Expert-derived psychological evaluation modules

The experts' work should change both the questions and the architecture of the evaluation. Some contributions describe psychological constructs; others describe decision processes, team conditions or venture fundamentals. Only the first category should be reported as a psychological measure.

### 5.1 Keep founder evidence and venture evidence separate

VCs report putting substantial weight on management teams: in Gompers, Gornall, Kaplan and Strebulaev's survey, 95% of VC firms identified the team as important and 47% as the most important selection factor. Their study nevertheless describes investor practice, not proof that a personality score causes success. See [How Do Venture Capitalists Make Decisions?](https://www.nber.org/system/files/working_papers/w22587/w22587.pdf).

Kaplan, Sensoy and Strömberg followed 50 VC-backed companies from early business plans through later development. Business lines were comparatively stable while management changed more, leading them to recommend that investors give substantial weight to the business—the “horse”—as well as the team. See [Should Investors Bet on the Jockey or the Horse?](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=657721).

Therefore, the report must contain two parallel panels:

| Founder behavior panel | Venture evidence panel |
|---|---|
| Decision calibration and learning | Customer problem and evidence |
| Entrepreneurial alertness | Market structure and timing |
| Execution/personal initiative | Product performance and differentiation |
| Resource marshaling and efficacy | Distribution and sales evidence |
| Adaptive persistence/stopping | Unit economics and financing requirements |
| Ethical and team leadership | Governance, cap table and incentives |
| Recovery and sustainable performance | Regulatory, technical and operational risk |

Never lower a psychological score because traction is weak. Never raise a psychological score because revenue is strong. Never claim that a favorable founder profile compensates for an unsupported market thesis. Investment committees may consider both panels, but any combination or weighting requires validation.

### 5.2 Effectual action under uncertainty — Saras Sarasvathy

Effectuation is a decision logic, not a stable personality trait. It is most relevant when goals, probabilities and markets are genuinely uncertain. Sarasvathy's [five principles](https://effectuation.org/the-five-principles-of-effectuation) suggest five observable interview dimensions:

| Dimension | Interview or work-sample prompt | Strong behavioral evidence | Scoring caution |
|---|---|---|---|
| **Means orientation — “bird in hand”** | “Using only resources already available to you, what could you test in the next two weeks?” | Accurately identifies skills, knowledge and relationships and turns them into a bounded action | Do not reward privileged network size; score resource conversion, not inherited access |
| **Affordable loss** | “What can the company afford to lose on this experiment, and what loss would be unacceptable?” | Defines downside, runway and stopping conditions before acting | Not synonymous with low ambition or generalized risk aversion |
| **Stakeholder commitments — “crazy quilt”** | “Which customer, supplier or partner commitment would reduce uncertainty most?” | Seeks concrete, reciprocal commitments rather than vague enthusiasm | Score quality and reciprocity, not social charisma |
| **Leveraging contingencies — “lemonade”** | Present an unexpected regulatory, customer or technical event and ask for a response | Reframes surprise without denying the loss; creates a testable option | Do not reward improvisation that ignores safety, law or strategy |
| **Control through action — “pilot in the plane”** | “Which part of this uncertainty can you influence directly this month?” | Separates controllable action from forecasting and external dependence | Agency must not be confused with overconfidence or blame |

Use the module as a scenario-based behavior score. Do not create an “effectuator personality type,” and do not assume effectuation is always superior to planning. In predictable, regulated or safety-critical situations, causal planning and expert forecasting may be more appropriate.

### 5.3 Failure learning and metacognition — Dean Shepherd

Shepherd's work shows that entrepreneurial failure can involve grief, identity threat and learning challenges. The system should not treat failure as either a badge of honor or evidence of incompetence. It should evaluate the quality of the learning process.

Ask the founder to reconstruct one meaningful failure in five stages:

1. What did you believe before the decision, and what evidence supported it?
2. Which early signal did you miss, discount or interpret incorrectly?
3. What was caused by your actions, the team, the venture system and the environment?
4. What changed in your decision process—not merely in your stated opinion?
5. Where was the revised lesson tested, and what happened?

Behavioral anchors:

| Rating | Anchor |
|---|---|
| **1** | Denial, total externalization or a generic lesson unsupported by changed behavior |
| **3** | Specific causal account, acknowledges personal contribution and identifies a plausible change |
| **5** | Separates controllable and external causes, considers competing explanations, documents a changed process and tests transfer to a later situation |

Grief intensity, emotional style or speed of recovery should not be scored as competence. Cultural norms and the scale of loss influence expression. If the discussion creates distress, offer a pause or withdrawal without penalty.

### 5.4 Personal initiative and execution — Michael Frese

Frese's action-regulation and personal-initiative work supports evaluating self-starting, future-oriented and barrier-crossing action. Add three structured probes:

- **Self-starting:** “What consequential action did you initiate without an external requirement?”
- **Future-oriented:** “Which problem did you anticipate early, and what preventive action followed?”
- **Barrier-crossing:** “What obstacle persisted after the first attempt, and how did you modify your approach?”

Score a complete action chain: goal → plan → action → feedback → adjustment → result. Count evidence of prioritization and completion, not the number of activities. High activity without learning, strategic relevance or completion is not high initiative.

### 5.5 Passion without the charisma halo — Melissa Cardon

Cardon's model separates passion for **inventing**, **founding** and **developing** and requires both intense positive feeling and identity centrality. The interview should identify the domain rather than producing a single “energy” score.

For each domain, collect:

- a validated Entrepreneurial Passion Scale score;
- recent time allocation and repeated voluntary behavior;
- an example of continuing through an unattractive part of the work;
- evidence of preparedness and domain knowledge;
- the cost of identity attachment, including difficulty delegating or stopping.

Report passion and preparedness separately. Fluent speech, excitement, extroversion and pitch performance are not substitutes for passion or competence. Interviewers should review content before audio/video presentation to reduce charisma and accent bias.

### 5.6 Opportunity alertness — Jintong Tang and Lowell Busenitz

Use the three validated alertness dimensions as distinct modules:

| Alertness dimension | Work sample | What earns a strong rating |
|---|---|---|
| **Scanning and search** | Provide a market dossier with obvious and non-obvious sources | Selects relevant, varied sources and explains search boundaries |
| **Association and connection** | Ask for possible connections between customer, technology and regulatory signals | Generates several plausible relationships without presenting speculation as fact |
| **Evaluation and judgment** | Include attractive false-positive opportunities | Applies evidence, economics and falsification criteria; rejects weak opportunities |

This prevents “idea fluency” from being mistaken for opportunity quality. Record false-positive and false-negative rates in the task, not just the number of opportunities identified.

### 5.7 Self-efficacy with calibration — Jeffrey McGee and Albert Bandura

Entrepreneurial self-efficacy should be assessed by domain: searching, planning, marshaling, implementing through people and implementing financially. Pair every confidence judgment with evidence or a task.

For each domain collect:

1. confidence from 0–100%;
2. a specific behavioral example;
3. a task or verified outcome when possible;
4. uncertainty and conditions under which confidence would change.

The useful output is a **calibration profile**:

- high confidence + strong evidence: supported efficacy;
- low confidence + strong evidence: possible underconfidence or response-style effect;
- high confidence + weak evidence: follow-up for overconfidence or missing evidence;
- low confidence + weak evidence: development need, not a character judgment.

Do not reward uniformly high confidence. Calibration and willingness to seek missing capability are more defensible than maximum self-belief.

### 5.8 Team learning, conflict and humility — Amy Edmondson, Karen Jehn and Bradley Owens

Combine three multi-rater constructs without collapsing them:

- **Psychological safety:** Can team members ask for help, admit mistakes and challenge the founder without interpersonal punishment?
- **Conflict quality:** Is disagreement focused on tasks, or has it become relationship/process conflict?
- **Expressed humility:** Does the founder acknowledge limits, recognize others' strengths and remain teachable?

The founder interview supplies hypotheses. Anonymous team ratings and incident examples supply the score. Useful probes include:

- “What was the last decision a team member changed your mind about?”
- “What happens to someone who brings bad news late?”
- “Who can overrule you, and under which conditions?”
- “Describe a task disagreement that improved the result and one that damaged the relationship.”

Strong evidence requires a specific incident, reciprocal accounts and a visible process such as dissent roles, retrospectives, escalation rules or decision logs. A founder's claim that the team is “like a family” is not evidence of psychological safety.

### 5.9 Founder dilemmas and governance — Noam Wasserman

Wasserman's founder-dilemma work belongs in the evaluation as a preference-and-consistency module, not a personality test. Examine:

- wealth/growth versus control/autonomy preferences;
- co-founder selection and role complementarity;
- equity-split reasoning and vesting;
- willingness to professionalize management;
- board, investor and founder decision rights;
- handling of founder departure or incapacity.

There is no universally correct preference. Score whether the founder makes trade-offs explicit, aligns governance with the stated strategy, treats co-founders fairly and can revise roles as the venture changes. Do not label a control preference as narcissism or a wealth preference as greed.

### 5.10 Startup-failure mechanisms — Tom Eisenmann

Eisenmann's failure patterns should become venture-focused counterfactual questions rather than psychological traits:

- What evidence could show that early adopters are not representative of the broader market?
- Which stakeholder is currently supplying a critical resource without a durable commitment?
- What constraint would break first if demand grew fivefold?
- What must be true for unit economics to improve at scale?
- Which “good news” metric could be masking retention, distribution or operational weakness?

Score falsifiability, causal reasoning and mitigation quality in the founder panel; place the actual market/operational risk in the venture panel.

### 5.11 Structured investor judgment — Gompers, Kaplan, Gornall and Strebulaev

Their research supports using an explicit investment memo rather than an intuitive overall impression. Before seeing any composite founder result, each evaluator should independently rate:

- team capability relevant to the current stage;
- product/technology evidence;
- market evidence;
- business model and economics;
- fund/accelerator fit;
- valuation or financing terms;
- investor's ability to add value;
- principal uncertainties and disconfirming evidence.

Record founder-presentation quality as a separate variable or omit it. Do not let it contaminate every rating. Require the committee to state whether rejection is based on the founder, venture, terms or institutional fit. This creates auditable reasons and prevents a fund-specific mismatch from becoming a negative psychological label.

### 5.12 Psychometric and AI-assessment controls — Oswald, Landers, Tippins, Tay, Hickman and colleagues

Every LLM-derived score is a new assessment procedure, even if its conceptual label comes from a validated questionnaire. For each score require:

- a construct definition and role/use-case rationale;
- a fixed question bank and behaviorally anchored rubric;
- evidence that the LLM score agrees sufficiently with trained independent human raters;
- test–retest and alternate-form evidence where appropriate;
- convergent and discriminant validity;
- incremental criterion validity beyond ordinary diligence;
- measurement-invariance, subgroup-error and accessibility analysis;
- version control, drift monitoring and revalidation after material model/prompt changes;
- understandable reasons, uncertainty and meaningful human review.

The system should never train itself on prior investor accept/reject decisions without auditing those labels. Historical decisions contain taste, network access, fund strategy and discrimination; they are not ground truth for founder potential.

### 5.13 Integrated scoring rule

Use construct scores, not expert-name scores. Each module should return:

| Field | Required output |
|---|---|
| Construct | One defined behavior or validated scale; never a blended virtue label |
| Scale/task result | Score according to the instrument or task protocol |
| Interview BARS | 1–5 with cited behavioral evidence |
| Source confidence | Low, medium or high |
| Counter-evidence | Strongest contradictory example or missing test |
| Context boundary | Stage, sector or situation in which the inference may not transfer |
| Development prompt | Specific next experiment or behavior, not a personality verdict |

Do not assign fixed weights yet. During validation, pre-register candidate weights and compare them with an unweighted model and a venture-only baseline. Retain a model only when it improves out-of-sample prediction, remains calibrated, avoids unacceptable group harm and changes decisions in a demonstrably useful way.

## 6. Existing startup and workplace systems

These systems are useful comparators, not automatic endorsements.

| System | What it measures/claims | Evidence status | Recommended role |
|---|---|---|---|
| [Founder Institute Entrepreneur DNA Assessment](https://dna.fi.co/methodology) | Proprietary founder traits and program-performance prediction | Vendor reports 85.1% accuracy against its minimum program performance criterion. That is not the same as independently replicated prediction of venture survival, growth or investor returns. | Benchmark question content; require full technical evidence and local validation before selection use |
| [Gallup Builder Profile 10](https://www.gallup.com/builder/225332/builder-profile-10.aspx) | Ten builder talents and Rainmaker/Conductor/Expert roles | Proprietary and developmental; public founder-outcome evidence is limited | Coaching and team discussion, not a funding cutoff |
| [Entrepreneurial Mindset Profile](https://www.emindsetprofile.com/) | Fourteen personality and skill scales | Developed by psychologists; some psychometric documentation, but founder-outcome generalization requires local evidence | Developmental baseline or research comparator |
| [Hogan Development Survey](https://www.hoganassessments.com/assessment/hogan-development-survey/) | Workplace derailers under strain | Mature proprietary workplace assessment, not a founder-success instrument | Qualified-practitioner leadership development; no clinical labels |
| [Predictive Index Behavioral Assessment](https://www.predictiveindex.com/learn/support/reliability-and-validity-of-the-pi-behavioral-assessment/) | Workplace behavioral drives and role fit | Proprietary workplace validation claims, not universal venture performance | Team/role discussion after manual and local evidence review |
| [SHL Occupational Personality Questionnaire](https://www.shl.com/products/assessments/personality-assessment/shl-occupational-personality-questionnaire-opq/) | Occupational personality | Established commercial occupational tool; not founder-specific | Role-based assessment with qualified use and criterion validation |
| [LenddoEFL psychometric credit scoring](https://lenddoefl.com/) | Psychometric and alternative-data credit risk | Designed for credit access/repayment, not entrepreneurial potential; an [IDB evaluation](https://publications.iadb.org/en/psychometrics-tool-improve-screening-and-access-credit) is available | Credit use only under fair-lending/FCRA/ECOA controls; never relabel as founder personality |

A 2024 [systematic review of entrepreneurial-mindset assessments](https://f1000research.com/articles/13-1020) found heterogeneous constructs and evidence. VentureWell's [Entrepreneurial Mindset Assessment Review](https://venturewell.org/wp-content/uploads/EMAR-v1-1.pdf) similarly shows that the field lacks a commonly accepted instrument linking a unified “mindset” score to actual entrepreneurial outcomes.

### Vendor due-diligence questions

Do not procure a system until the vendor supplies satisfactory answers and evidence for all of these:

1. What exact construct and intended use does each score represent?
2. What population, languages, countries and administration mode were used for validation?
3. What are reliability estimates, standard errors and test–retest results?
4. What criterion was predicted, over what period, with what base rate and effect size?
5. Was validation prospective and out-of-sample? Has it been independently replicated?
6. What incremental validity exists beyond stage, sector, experience, traction and ordinary diligence?
7. How are subgroup performance, measurement invariance and adverse impact tested?
8. What accommodations and non-AI alternatives exist?
9. What model/version changes trigger revalidation?
10. Can an assessed person see, correct, contest and obtain meaningful human review?
11. Which data are retained, shared, used for training or transferred internationally?
12. Does the vendor contractually accept audit access, deletion duties, security obligations and liability allocation?

## 7. Recommended LLM interview architecture

### Phase 0 — define the decision before collecting data

Write a one-page assessment specification:

- **Use:** coaching, investor diligence, accelerator admission, employment, credit, or research.
- **Outcome:** a precisely defined target such as 24-month survival, milestone attainment, team retention or development planning—not “success.”
- **Population:** geography, sector, stage, language and founder role.
- **Constructs:** why each is relevant and what evidence supports it.
- **Consequences:** who sees the result and how it can affect the founder.
- **Prohibited data:** protected/special categories, clinical inference and irrelevant private-life information.
- **Retention and appeal:** deletion period, correction route and human reviewer.

### Phase 1 — public professional-information review

The agent may review only approved, lawfully accessible sources such as a company website, official registry, published interviews, patent/publication databases and public professional profiles. The output is an **evidence ledger**, not a personality score.

For every item record:

- claim;
- exact source URL and publication/access date;
- first-party, official, reputable secondary or unverified source class;
- whether identity matching is certain;
- relevance to the declared purpose;
- corroboration or contradiction;
- a neutral interview question;
- expiry/deletion date.

Do not collect friend lists, family data, political/religious activity, health/disability clues, sexuality, ethnicity, genetic data, precise location, private-group material, deleted content, data obtained by pretext, or anything behind a login/access control unless counsel has approved the source and the person has validly authorized it. Respect platform terms and intellectual-property rules.

Provide the founder the factual dossier before scoring. Let them correct mistaken identity, outdated records and missing context. Never translate “no public footprint” into a negative score.

### Phase 2 — validated measures

- Obtain permission or a license where required; many scales are copyrighted even when papers display items.
- Preserve wording, response options, order, timing and scoring rules unless a validation study supports the change.
- Use authorized translations and appropriate norms.
- Do not ask the LLM to paraphrase items dynamically.
- Report raw/scale scores and uncertainty. Do not invent population percentiles.
- Keep wellbeing or medical-adjacent results confidential and outside consequential decisions.

### Phase 3 — structured interview

Each construct receives two or three predetermined probes. All comparable founders receive the same core probes in the same order. Follow-ups may clarify context but cannot introduce different difficulty.

Use a 1–5 behaviorally anchored rating scale:

| Rating | General anchor |
|---|---|
| **1 — absent/contrary** | No relevant example, or behavior clearly contradicts the construct; unsupported claims |
| **2 — weak** | Vague example, mostly intentions, little personal action or outcome evidence |
| **3 — adequate** | Specific situation, personal action and plausible result; limited reflection or verification |
| **4 — strong** | Multiple or well-verified examples, trade-offs and learning are explicit |
| **5 — exceptional evidence** | Repeated behavior across contexts, verified outcomes, calibrated limitations and counter-evidence |

Add two separate fields:

- **Evidence confidence:** low / medium / high, based on specificity and verification.
- **Counter-evidence:** required text field. A high rating without a counter-evidence search is incomplete.

Two trained human raters should independently score a validation sample. Monitor inter-rater reliability. The LLM may draft evidence summaries, but a consequential score should not be finalized by the model alone.

### Phase 4 — work samples and multi-rater data

Use short, role-relevant exercises:

- opportunity case containing both real and misleading signals;
- probabilistic forecast with confidence and later resolution;
- pivot/stop/continue case with sunk costs;
- ethical dilemma with material trade-offs;
- co-founder conflict simulation;
- resource-marshaling plan under constraints.

For team climate, collect anonymous ratings from enough team members to protect identity. Do not report “psychological safety” or “team conflict” from the founder interview alone.

### Phase 5 — report

Report each evidence stream separately:

| Construct | Validated measure | Interview BARS | Task result | Multi-rater | Public evidence | Confidence | Development question |
|---|---:|---:|---:|---:|---|---|---|
| Example: decision calibration | A-DMC/task | 3 | Brier score / framing result | — | No inference | Medium | “What base-rate source will be used next time?” |

Do not average missing data as zero. Do not mechanically resolve disagreement between sources. A discrepancy is a follow-up question, not proof of dishonesty.

## 8. Validation plan before consequential use

1. **Content study:** experts map each question and task to a documented founder-role analysis.
2. **Cognitive interviews:** founders from varied backgrounds explain how they interpret every prompt.
3. **Pilot reliability:** internal consistency where appropriate, test–retest, and human/LLM inter-rater reliability.
4. **Construct validity:** convergent, discriminant and factor-structure tests; measurement invariance across relevant languages/groups.
5. **Criterion study:** prospectively predict pre-registered outcomes; report effect sizes, confidence intervals and calibration—not only statistical significance.
6. **Incremental validity:** compare with a simple baseline using stage, sector, traction, experience and ordinary structured diligence.
7. **Fairness and accessibility:** subgroup error/calibration, selection-rate/adverse-impact analysis where relevant, differential item functioning, accommodation testing and qualitative harm review.
8. **Cross-validation:** freeze the model and test on a later, untouched cohort; then seek independent replication.
9. **Decision-utility study:** quantify false-positive and false-negative harms and test whether humans over-rely on the score.
10. **Ongoing monitoring:** drift, model changes, appeals, overrides, incidents and annual revalidation.

The minimum team is an I-O psychologist/psychometrician, entrepreneurship researcher, statistician, privacy engineer, accessibility expert, independent fairness reviewer and jurisdiction-specific counsel. Product managers or prompt engineers alone cannot validate a psychological assessment.

## 9. Legal requirements by use case

Legal classification follows **how the score is used**, not what the vendor calls it.

| Use case | Main legal triggers | Required design response |
|---|---|---|
| **Voluntary founder coaching** | Privacy/data-protection, contract, consumer-protection and professional-testing rules | Genuine opt-in; no hidden secondary use; minimal collection; confidential report; deletion and correction; do not present diagnosis or guaranteed prediction |
| **Equity-investment diligence** | Privacy/data-protection, unfair/deceptive-practice, civil-rights/contract and possibly consumer-reporting rules; securities/fund duties may also matter | Define a legitimate diligence purpose; obtain notice/authorization where required; verify facts; exclude sensitive/proxy factors; human investment committee; correction/contest; counsel must determine whether the source/vendor/purpose triggers FCRA or local analogues |
| **Accelerator/incubator admission** | May be treated as education, a service, funding, employment or another consequential domain depending on facts and jurisdiction | Classify before launch; validate against program criteria; publish notice; offer accessibility and meaningful review; do not reuse scores for investment without a new lawful basis and validation |
| **Employment or promotion** | US federal/state/local discrimination law, disability accommodation, selection-procedure validation, background-check and AI laws; EU/UK data protection and AI rules | Job analysis, criterion validity, adverse-impact testing, accommodation/alternative, notice, human review, records, bias audit where required and FCRA process for third-party reports |
| **Loan or credit decision** | ECOA/Regulation B, FCRA and fair-lending/state law in the US; GDPR/AI Act and financial law in the EU | No prohibited-basis or proxy discrimination; validated credit purpose; specific accurate adverse-action reasons; access/correction; model governance; do not use a vague personality label |

### United States

**Federal employment law.** AI does not displace Title VII, the ADA, ADEA or GINA. The EEOC states that employment selection systems remain subject to federal anti-discrimination law; see [EEOC's role in AI](https://www.eeoc.gov/sites/default/files/2024-04/20240429_What%20is%20the%20EEOCs%20role%20in%20AI.pdf) and [employment tests and selection procedures](https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures). Provide reasonable accommodations and avoid tests that unlawfully elicit or screen out disability.

**FCRA and background reports.** If a third party assembles social-media or other information for employment, credit, insurance, housing or another covered eligibility purpose, it may be a consumer report and the provider may be a consumer reporting agency. Employment use generally requires a standalone disclosure, written authorization, pre-adverse-action copy/rights notice, time to respond, and final adverse-action notice. See the FTC's guidance on [social media and the FCRA](https://www.ftc.gov/business-guidance/blog/2011/06/fair-credit-reporting-act-social-media-what-businesses-should-know) and [using consumer reports](https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-employers-need-know). Investment diligence is fact-specific; do not assume that calling a report “public research” avoids FCRA.

**Credit.** ECOA and Regulation B require specific, accurate reasons for adverse action even when a complex algorithm is used. A black box is not an excuse; see [CFPB Circular 2022-03](https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/).

**Selected state/local rules, not an exhaustive survey.**

- [New York City Local Law 144](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page) requires, for covered automated employment decision tools, a recent bias audit, public audit information and notices.
- California's employment regulations effective 1 October 2025 clarify that automated-decision systems can violate state anti-discrimination law, require at least four years of specified employment records, and treat disability-eliciting automated assessments as potential unlawful medical inquiries; see the [California Civil Rights Department summary](https://calcivilrights.ca.gov/2025/06/30/civil-rights-council-secures-approval-for-regulations-to-protect-against-employment-discrimination-related-to-artificial-intelligence/).
- Illinois Public Act 103-0804, effective 1 January 2026, prohibits discriminatory employment use of AI, prohibits zip code as a protected-class proxy and requires notice; see the [official act](https://www.ilga.gov/Legislation/publicacts/view/103-0804).
- Colorado's enacted [SB26-189](https://leg.colorado.gov/bills/sb26-189) replaces the earlier framework with duties beginning 1 January 2027 for covered automated decision-making technology materially influencing defined consequential decisions, including documentation, notice, correction, meaningful human review and records.
- If facial geometry, voiceprints or other biometric identifiers are collected, Illinois BIPA and other state biometric/privacy laws may require written notice, consent, retention/destruction rules and security. The safest product omits biometric processing entirely.

State rules change quickly. Maintain a jurisdiction register and obtain a launch review for every place where the founder resides, is assessed, works, seeks credit or receives a consequential decision.

### European Union / EEA

**GDPR.** Public professional information remains personal data. Before collection, document a lawful basis; comply with fairness, transparency, purpose limitation, minimization, accuracy, retention, security and data-subject rights; provide Article 14 information when data come from elsewhere unless a narrow exception applies; assess special-category data separately; and complete a DPIA for likely high-risk profiling. See the [GDPR text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) and the Commission's [automated-decision guidance](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/dealing-requests-individuals/are-there-restrictions-use-automated-decision-making_en). Solely automated decisions producing legal or similarly significant effects face Article 22 restrictions and safeguards. Token human approval is not meaningful review.

**EU AI Act.** AI used to recruit/select people or affect access to self-employment is an Annex III high-risk category when the statutory conditions are met. Workplace emotion recognition is a prohibited practice except narrow medical/safety cases. Prohibitions and AI-literacy duties have applied since 2 February 2025. As of this document's date, the Commission's updated [implementation timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) places Annex III high-risk rules on 2 December 2027 after Digital Omnibus amendments; other transparency and enforcement milestones apply earlier. Classification and dates should be rechecked immediately before launch.

An equity investment decision is not automatically an Annex III employment or credit use. It can still be governed by GDPR and other EU/national laws, and the same tool may become high-risk when reused for hiring, self-employment access or credit.

### United Kingdom

Apply the UK GDPR and Data Protection Act 2018 as amended by the Data (Use and Access) Act 2025. Identify a lawful basis, give privacy information for directly and indirectly collected data, minimize/verify data, conduct a DPIA for high-risk profiling, and provide safeguards for significant solely automated decisions. The amendments changed automated-decision rules, so use current ICO guidance rather than an old EU-GDPR checklist. Relevant official sources include the ICO's [recruitment and selection guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/recruitment-and-selection/), [AI and data-protection guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/), and its [AI recruitment audit outcomes](https://ico.org.uk/media2/migrated/4031620/ai-in-recruitment-outcomes-report.pdf).

## 10. Ethical requirements beyond minimum law

1. **Respect autonomy.** Explain data sources, constructs, model role, recipients, consequences and refusal options before assessment. Consent must not be bundled or coerced.
2. **Use proportionality.** Collect only what is necessary for a defined decision. A possible statistical correlation does not make an intrusive inference ethical.
3. **Protect contextual integrity.** A public post written for peers is not automatically appropriate for psychological profiling. Prefer founder-supplied professional evidence.
4. **Prevent diagnostic and moral overreach.** Describe observable behavior and uncertainty; do not label character or health.
5. **Give procedural justice.** Show the founder the evidence and meaningful reasons, allow correction and contextual response, and offer independent human appeal.
6. **Do not hide uncertainty.** Publish standard errors, evidence confidence, missingness, validation population and known failure modes.
7. **Avoid automation bias.** Human reviewers must be trained, able to disagree, and required to record reasons. Measure override patterns.
8. **Protect accessibility.** Offer non-video/non-voice and non-LLM alternatives, extra time and other reasonable accommodations without penalty.
9. **Test distributional harm.** Assess subgroup accuracy, calibration, missing-data rates, source availability and adverse impact. Intersectional and qualitative review matters even when sample sizes limit statistics.
10. **Separate care from selection.** Wellbeing and burnout data belong in a confidential support path, never a funding or employment score.
11. **Limit retention and reuse.** Do not retain raw audio/video or social data by default. Do not train models on founder data without a separate, valid authorization and lawful basis.
12. **Make security commensurate with sensitivity.** Encrypt, restrict role access, log access, vet subprocessors, create a breach plan and delete on schedule.

Use the voluntary [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) to govern, map, measure and manage AI risks. It does not replace law or psychometric validation.

## 11. Go/no-go checklist

The system is **not ready for consequential use** unless every answer below is “yes.”

- [ ] The exact use case, outcome, population and jurisdictions are documented.
- [ ] A qualified psychologist/psychometrician has approved the construct map.
- [ ] Every instrument is licensed, administered and scored as validated.
- [ ] The LLM interview has behaviorally anchored rubrics and human reliability evidence.
- [ ] Public-data collection has a lawful basis, notice, source policy, correction path and retention schedule.
- [ ] Protected/special-category, clinical, biometric, emotion and deception inferences are technically blocked.
- [ ] The model has prospective, out-of-sample criterion and incremental validity for this use.
- [ ] Relevant subgroup validity, calibration, adverse impact and accessibility have been evaluated.
- [ ] A meaningful non-AI alternative and human appeal are available.
- [ ] Specific reasons—not opaque trait labels—can be given for any adverse decision.
- [ ] Vendor contracts permit audit and control training, reuse, subprocessors, security and deletion.
- [ ] Jurisdiction-specific counsel has approved employment, credit, privacy, consumer-reporting and AI-law treatment.
- [ ] A named owner monitors drift, changes, incidents, appeals and revalidation.

If any item is “no,” restrict the product to voluntary research or coaching and ensure outputs cannot reach an investment, employment, admission or credit decision-maker.

## 12. Recommended first implementation

Start with a non-consequential developmental pilot:

1. Use six constructs: entrepreneurial self-efficacy, alertness, decision calibration, intellectual humility, adaptive persistence and expressed humility/team climate.
2. Administer the validated scales separately from the interview.
3. Use a 60-minute standardized LLM interview plus two short decision tasks.
4. Return an evidence-based development report to the founder first.
5. Let the founder correct the dossier and choose whether to share it.
6. Collect outcome data prospectively for at least two cohorts without using scores to accept/reject them.
7. Pre-register hypotheses and publish null results, subgroup results and limitations.
8. Only after independent review decide whether any score is sufficiently valid, fair and useful for a higher-stakes context.

This design is slower than assigning a “founder type,” but it produces information that is more interpretable, testable and defensible—and it can improve as genuine outcome evidence accumulates.

## Source policy

Recent meta-analyses and systematic reviews from 2023–2026 were preferred where a fitting synthesis existed. Older papers are cited only when they are the original validation or foundational source for a named measure. Commercial claims are attributed to vendors and are not presented as peer-reviewed validation. Legal links favor regulators, statutes and official government sources.
