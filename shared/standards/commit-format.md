# Commit Message Format

All commits in projects managed by this agent system follow Conventional Commits.

## Format

```
<type>(<scope>): <subject>

[optional body — what changed and why, 72-char wrap]

[optional footer — BREAKING CHANGE: ..., Closes #N]
```

## Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Dependencies, config, build tooling |
| `test` | Adding or fixing tests |
| `docs` | Documentation only |
| `refactor` | Code restructure with no behavior change |
| `security` | Security fix or hardening |

## Rules

- **subject**: imperative mood ("add", "fix", "remove" — not "added" or "fixes")
- **subject**: max 50 characters, no trailing period
- **scope**: the feature folder name (e.g. `auth`, `users`, `orders`)
- **body**: wrapped at 72 characters; answers "what" and "why", not "how"
- **footer**: `Closes #N` for issues, `BREAKING CHANGE:` for API breaks

## Branch naming

```
<type>/<task-slug>-<sessionId[0..7]>
```

Examples:
- `feat/user-auth-system-a7e88f3b`
- `fix/broken-login-route-b3cc12d9`
- `security/remove-leaked-key-f0e12345`

Never push directly to `main` or `master`.
