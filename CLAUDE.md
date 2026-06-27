# Multi-Agent Software Engineering Orchestration System

This directory (`~/.agents`) is the root of a multi-agent development orchestration system. It is NOT a software project to be developed — it IS the agent infrastructure itself.

## Purpose

When given a software development task with a target project path, this system:
1. Routes the task to appropriate domain agents (database → backend → frontend → testing → bridge → git)
2. Each agent reads its Obsidian vault for context, runs sub-agents for specific sub-tasks, and writes new learnings back
3. The MCP Bridge agent validates that frontend, backend, and database outputs are consistent
4. The Git/DevOps agent commits only after all security scans pass

## How to invoke

Use the Claude Code Workflow tool with the orchestrate workflow:

```
Workflow({
  scriptPath: '~/.agents/.claude/workflows/orchestrate.js',
  args: {
    task: "describe what needs to be built or fixed",
    projectPath: "C:/absolute/path/to/your/project",
    agentsDir: "~/.agents"
  }
})
```

Or invoke individual domain workflows directly:
- `.claude/workflows/backend.js` — Express route + handler work only
- `.claude/workflows/frontend.js` — React/Vanilla component work only
- `.claude/workflows/database.js` — Schema + migration work only
- `.claude/workflows/testing.js` — Generate Postman collections from a routes array
- `.claude/workflows/gitdevops.js` — Branch, security scan, commit
- `.claude/workflows/mcpbridge.js` — Contract validation + third-party stubs

## Directory structure

```
Agents/
├── CLAUDE.md                     ← you are here
├── package.json                  ← better-sqlite3, uuid, chalk@4, ajv
├── .claude/workflows/            ← Claude Code Workflow scripts
├── agents/<name>/
│   ├── CLAUDE.md                 ← agent identity + rules
│   ├── knowledge.db              ← SQLite: decisions, patterns, session_log, contracts
│   └── vault/                    ← Obsidian-compatible Markdown knowledge base
│       └── INDEX.md              ← grep this first to find relevant notes
├── shared/
│   ├── orchestrator.db           ← cross-agent session coordination
│   ├── lib/                      ← Node.js helpers (db.js, db-cli.js, vault.js, etc.)
│   ├── contracts/*.schema.json   ← typed JSON schemas for inter-agent communication
│   └── standards/                ← commit format, security rules, code standards
└── init/                         ← one-time setup scripts
```

## Initialization

Run once to create all databases and seed all vault notes:
```
cd ~/.agents
npm install
npm run init
```

## Agent identity

This orchestrator never writes code directly. It only:
- Decomposes tasks
- Determines which domain agents are needed
- Sequences agent invocations in the correct dependency order
- Validates that inter-agent contracts are consistent before committing

## Dependency order (always respected)

```
database → backend → frontend + testing (parallel) → mcpbridge → gitdevops
```

Frontend and testing can run in parallel after backend completes because:
- Frontend needs `BackendOutput.contractExports[]` to know what API exists
- Testing needs `BackendOutput.routes[]` to generate Postman tests
- Neither depends on the other

MCP Bridge runs last among domain agents because it validates consistency across all three (database + backend + frontend).

Git/DevOps runs absolutely last — it commits only after the bridge gives a green light.

## Working directory note

When running Bash commands in agents, the working directory should be:
`~/.agents`

All `node shared/lib/db-cli.js` commands assume this working directory.
