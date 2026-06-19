# AI Agent Prompt Template

Used by the **prompt-engineer** sub-agent when a backend task involves an AI/LLM feature
(chatbot, classifier, RAG, tool-using agent). Follows `shared/standards/ai-agent-practices.md`.

Build **micro-agents**: one responsibility, narrow scope. Every AI agent MUST define all
nine sections below **before** any code is written. The point is that strict rules and
success criteria are explicit, so downstream workflows don't break on free-form output.

## Required structure
1. **Role & scope** — a single responsibility, stated narrowly.
2. **Relevance guardrail** — check the query is in-scope; if not, return a fixed refusal.
3. **Strict rules** — numbered MUST/NEVER directives.
4. **Few-shot examples** — at least 2 pairs of input → exact expected output.
5. **Output schema** — a strict JSON schema; the only allowed response shape.
6. **Validation loop** — parse output against the schema; on mismatch re-invoke (max N) with the error appended; after N failures return a structured error.
7. **Success criteria** — measurable definition of "the agent worked".
8. **Tool-calling workflow** — if tools are used, force tool use; SQL tools are read-only with `LIMIT` + time filters.
9. **Model & observability** — model name from an env var (never hardcode); log every action to a debug log.

## Prompt skeleton (fill every placeholder)
```text
ROLE
You are <single-responsibility role>. You only <the one job>.

RELEVANCE GUARDRAIL
Before doing anything, decide if the user input is about <domain>.
If it is NOT, respond exactly with: <fixed polite refusal> and stop.

RULES
1. MUST <...>
2. MUST <...>
3. NEVER <...>

OUTPUT FORMAT
Respond with JSON ONLY, matching the schema below. No prose, no markdown, no code fences.

EXAMPLES
Input: <example input 1>
Output: <exact JSON output 1>

Input: <example input 2>
Output: <exact JSON output 2>
```

## Output schema (strict — example)
```json
{
  "type": "object",
  "required": ["intent", "confidence"],
  "additionalProperties": false,
  "properties": {
    "intent": { "type": "string", "enum": ["billing", "technical", "account", "other"] },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  }
}
```

## Validation loop (reference implementation)
```python
import json, jsonschema

def run_agent(client, prompt, user_input, schema, max_retries=3):
    messages = [{"role": "user", "content": user_input}]
    for attempt in range(max_retries):
        raw = client.complete(system=prompt, messages=messages)  # model name comes from env
        try:
            data = json.loads(raw)
            jsonschema.validate(data, schema)
            return data
        except (json.JSONDecodeError, jsonschema.ValidationError) as e:
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": f"Invalid output: {e}. Reply with valid JSON only."})
    return {"status": "error", "code": "AGENT_OUTPUT_INVALID", "message": "Agent failed schema after retries"}
```

## Success criteria (define per agent)
- 100% of returned outputs parse and validate against the schema.
- Out-of-scope inputs hit the guardrail refusal, not the main logic.
- When a tool is required, the tool is actually called (no hallucinated answers).
- Latency/cost within budget (use a lightweight/"mini" model for basic tasks).

## Worked example — support-ticket classifier
```text
ROLE
You are a support-ticket classifier. You only assign one intent label and a confidence score.

RELEVANCE GUARDRAIL
If the input is not a customer support message, respond exactly:
{"intent": "other", "confidence": 0.0}

RULES
1. MUST choose exactly one intent from: billing, technical, account, other.
2. MUST return confidence in [0, 1].
3. NEVER add commentary, apologies, or fields outside the schema.

OUTPUT FORMAT
JSON only, matching the schema.

EXAMPLES
Input: "I was charged twice this month"
Output: {"intent": "billing", "confidence": 0.96}

Input: "The app crashes when I upload a file"
Output: {"intent": "technical", "confidence": 0.93}
```

Artifacts produced per AI agent (written into the target project):
- `src/ai/<agent-name>/prompt.md` — the full prompt + few-shot examples.
- `src/ai/<agent-name>/schema.json` — the strict output schema used by the validation loop.
