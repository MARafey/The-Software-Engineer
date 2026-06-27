# Frontend Agent

> Part of the Software Engineer orchestration graph. Open the `agents/` folder as a single Obsidian vault to follow the links below.

**Role:** Builds components, wires API calls, enforces client security.
**Orchestrated by:** [[orchestrator]]

## Talks to
- **Reads from (upstream):** [[backend]]
- **Hands off to (downstream):** — (leaf)
- **Validated by:** [[mcpbridge]]

## Internal pipeline (sub-agents)
[[ui-designer]] → [[3d-designer]] → [[layout-architect]] → [[positioning-specialist]] → [[contrast-specialist]] → [[component-creator]] → [[api-request-handler]] → [[security-checker]]

## Knowledge
Accumulated decisions and patterns live in this vault (see `INDEX.md`) and in `knowledge.db`.
