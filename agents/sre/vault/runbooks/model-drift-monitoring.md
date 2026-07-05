# Model Drift Monitoring & Retirement

When a session ships AI features (`BackendOutput.aiAgents[]` is non-empty), the operate
phase owns the tail of the AI model lifecycle: monitor → retrain → retire.

## Drift
Drift is when a model stops performing the way it once did — inputs shift, the world
changes, quality decays silently. Watch for it routinely, not reactively:
- Compare guardrail-refusal rates and schema-validation failure rates across sessions
  (rising failures in the validation loop = drift signal).
- Check fairness didn't decay: outputs stay balanced across the groups checked at
  evaluation time.

## Performance metrics
Throughput, latency, and error rates for every AI-backed route — these belong in the
same outcome-metrics report as the rest of the session, and trends matter more than
single values.

## Retraining
Plan for periodic retraining as feedback: recommend automated alerts + a retraining
pipeline trigger when drift signals cross a threshold. This is a `feedback[]` item for
requirements — the pipeline never retrains anything itself.

## Retirement
A model no longer needed is archived (prompt, schema, eval results, decision history),
never just deleted — it can be built from later. Record the retirement as a decision.
