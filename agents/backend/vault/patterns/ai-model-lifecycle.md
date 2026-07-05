# AI Model Lifecycle

Used by the **prompt-engineer** sub-agent whenever a feature ships an AI model or
LLM-backed capability. The lifecycle is: plan → data → develop → evaluate → deploy →
monitor → retire. Build covers the first five; monitoring and retirement are owned by
the [[sre]] agent (see its drift-monitoring runbook).

## 1. Plan
Define the use case, the users, and the conversations/outputs expected BEFORE choosing
anything. "What must this model never do" is part of the plan (no glue-instead-of-cheese
recommendations).

## 2. Data — good AI starts with good data
- Tailored to the use case and from reputable, traceable sources — every datum traceable
  back to its origin.
- Diverse backgrounds and perspectives represented.
- Cleanse: remove PII, deduplicate, fill/replace missing values, standardize format.
- Run bias checks; if unbalanced, synthetic data generation is an accepted way to
  rebalance — record that it was used.

## 3. Develop
- Prefer small specialized models (mixture-of-experts style composition) over one giant
  generalist when it cuts computational and environmental cost at equal quality.
- Micro-agents with one responsibility, per `patterns/ai-agent-prompt-template.md`.

## 4. Evaluate & govern
- Measure accuracy, fairness, and bias across demographic groups; check output diversity.
- Brainstorm edge cases and test them explicitly.
- Disparities found → adjust the algorithm or augment with synthetic data, then re-test.
- Compliance is a design input (e.g. EU AI Act) — record the governance decision in the
  decisions table.

## 5. Deploy
Repeatable, automated, secure — containerized, config from env, no credentials in code
(gitdevops enforces this).

## 6+ Monitor / retire (handoff)
Declare in `aiAgents[]` what the SRE agent should watch: drift signals, throughput,
latency, error rates, and the retraining trigger. Retired models are archived, not deleted.
