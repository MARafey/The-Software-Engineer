# AI Agent Practices

Standards for building AI/LLM features (chatbots, agents, RAG). No dedicated AI domain
agent exists — the backend agent applies these when building AI features, and the
mcpbridge agent applies them when stubbing model/provider integrations.

## 1. Guardrails & input validation
- **Relevance guardrail layer**: before any downstream task or tool call, evaluate the
  incoming query against the agent's purpose. If irrelevant/out-of-scope, intercept it and
  return a standardized, polite refusal.

## 2. Configuration & environment
- Load all model names from `.env`. Swapping a model should be a single-location change,
  not edits scattered across the codebase.

## 3. Model selection & architecture
- Use lightweight/"mini" models for basic chatbot functionality to optimize speed and cost.
- Build specialized micro-agents with a single responsibility and narrow scope — not a
  monolith.

## 4. Prompt engineering & structure
- **Few-shot**: give the agent explicit how-to examples of input flow and expected output.
- **Strict structured output**: define a rigid output format. Implement a validation loop —
  if the agent's output fails the required structure, re-invoke until it complies.

## 5. Tool calling & security
- **Database security**: SQL-based AI agents get strictly **read-only** DB access.
- **SQL optimization**: force `LIMIT` clauses and filters (especially time-based) to avoid
  pulling excessively large datasets.
- **Guaranteed tool execution**: explicitly map the tool-calling workflow in the prompt and
  test edge cases so the agent uses the tool instead of hallucinating an answer.

## 6. Knowledge management & vector DBs
- **Embedding consistency**: use a single, consistent embedding model across the project
  lifecycle. Switching later breaks similarity search and forces a full re-index.
- **Categorical chunking**: chunk large datasets by logical category before ingestion to
  narrow search scope, cut retrieval time, and reduce irrelevant results.
- See `shared/standards/database-guidelines.md` (§2) for vector-store selection/storage.

## 7. Observability
- Maintain a dedicated debug log file recording every action — from agent creation through
  tool execution — to simplify troubleshooting.
