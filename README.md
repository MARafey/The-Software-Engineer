# Software Engineer

A multi-agent Claude Code skill that automates the full software development lifecycle.

One command. Every agent runs in sequence — database schema, backend routes, frontend components, Postman tests, inbound/outbound call systems, security scan, git commit. Each agent has its own SQLite knowledge base and Obsidian vault that grows smarter with every session.

---

## Install

In Claude Code, register this repo as a plugin marketplace, then install the plugin:

```
/plugin marketplace add MARafey/The-Software-Engineer
/plugin install software-engineer@software-engineer
```

That's it. Run `/software-engineer` — on first use it clones this repo to `~/.agents`, installs dependencies, and seeds the knowledge bases automatically.

> Why a plugin and not a loose file? Claude Code only loads skills that live in a folder as `skills/<name>/SKILL.md`. Dropping a single `software-engineer.md` into `~/.claude/skills/` will **not** register the slash command — the plugin packaging is what makes `/software-engineer` appear.

---

## Usage

```
/software-engineer <task>
```

```
/software-engineer add user authentication with JWT and refresh tokens
/software-engineer fix the broken /api/orders route returning 500
/software-engineer create a products table with categories and inventory
/software-engineer add a dashboard page showing sales statistics
/software-engineer generate Postman tests for all existing routes
/software-engineer add CSP and security headers to the backend
```

Other commands:
```
/software-engineer test         — run 35 health checks, verify install is working (no files modified)
/software-engineer onboard      — force re-scan of current project (auto-runs on first use)
/software-engineer status       — show recent sessions
/software-engineer update       — pull latest version
/software-engineer help         — show all commands
```

---

## Before building anything, it asks you

Before writing code, the system asks plain-language questions to remove all guesswork:

- **Frontend tasks:** What colors? Top bar or side menu? Mobile-friendly?
- **Backend tasks:** JWT auth or sessions? Rate limiting? API versioning?
- **Database tasks:** Soft delete or hard delete? UUIDs or integers? Expected data size?

For each decision, it shows you its recommendation first and asks if you agree. You can answer all questions at once or just say "use your recommendations" to accept all defaults.

If you share a mockup image or screenshot, it reads it and only asks about the parts that are unclear — not generic "what do you want?" questions.

---

## What happens when you run a task

**First use on any project:** the system automatically scans your entire codebase before doing anything — routes, components, schema, conventions, security posture. This runs once per project and is stored in the agent knowledge bases. Every future session starts with that context already loaded.

Six agents then run in dependency order:

```
[onboard — first use only] → database → backend → frontend + testing + calls (parallel) → bridge → git
```

| Agent | Does |
|-------|------|
| **Database** | Writes migration SQL, validates foreign keys, adds indexes |
| **Backend** | Creates Express routes, controllers, services with JSDoc |
| **Frontend** | Builds components, wires API calls, enforces token/storage rules. 3D tasks invoke Opus for scene/physics/shader design |
| **Testing** | Generates Postman collection (positive + negative + auth tests per route) |
| **Calls** | Inbound IVR flows, outbound dialing campaigns, Twilio/Vonage webhooks, TTS scripts, TCPA/GDPR/DNC compliance |
| **Bridge** | Validates that frontend bindings and telephony webhooks match backend contracts |
| **Git** | Runs 10-point security scan, creates feature branch, writes Conventional Commit |

---

## Security rules (enforced before every commit)

The git agent blocks commits that contain:

- `.env` files
- Hardcoded API keys, passwords, or secrets
- Raw JWT/bearer tokens in source
- `localhost` URLs in non-test files
- Auth tokens read from `localStorage`
- Database credentials in `.js` or `.json`

---

## Knowledge bases

Each agent builds up its own Obsidian-compatible knowledge vault at `~/.agents/agents/<name>/vault/`. Open any vault folder in Obsidian as a new vault to browse decisions, patterns, and session history.

```
~/.agents/agents/backend/vault/     Express patterns, security rules, route decisions
~/.agents/agents/frontend/vault/    Design tokens, storage rules, 3D scene patterns, component library
~/.agents/agents/database/vault/    Schemas, migrations, query optimization notes
~/.agents/agents/testing/vault/     Postman collections, test reports
~/.agents/agents/calls/vault/       IVR flows, campaign patterns, TTS scripts, TCPA/GDPR compliance
~/.agents/agents/gitdevops/vault/   Branch strategy, security scan results
~/.agents/agents/mcpbridge/vault/   Contract validation history
```

---

## Requirements

- [Claude Code](https://claude.ai/code) — CLI or IDE extension
- [Node.js](https://nodejs.org) 18 or later
- [Git](https://git-scm.com)
- [Obsidian](https://obsidian.md) *(optional — for browsing agent knowledge bases)*

---

## How it works internally

You install the plugin once (see above). Everything else is handled automatically:

1. First `/software-engineer` invocation → skill clones this repo to `~/.agents/`
2. `npm install` fetches `better-sqlite3`, `uuid`, `chalk`, `ajv`
3. `node init/bootstrap.js` creates all SQLite databases and contract schemas
4. `node init/seed-vaults.js` writes the initial Obsidian vault notes
5. All future runs go straight to the orchestration workflow

The agents communicate through typed JSON contracts validated against JSON Schema. The bridge agent blocks the git commit if any frontend↔backend or backend↔database contracts are inconsistent.

---

## Updating

```
/software-engineer update
```

Or manually:
```bash
cd ~/.agents && git pull origin main && npm install && node init/bootstrap.js && node init/verify.js
```
