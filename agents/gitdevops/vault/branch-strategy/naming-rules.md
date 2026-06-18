# Branch Naming Rules

## Pattern
`<type>/<task-slug>-<sessionId[0..7]>`

## Types
| Type | When |
|------|------|
| feat | New feature |
| fix | Bug fix |
| chore | Tooling, dependencies, config |
| test | Adding or fixing tests |
| docs | Documentation only |
| refactor | Code restructure, no behavior change |
| security | Security fix or hardening |

## Examples
- `feat/user-auth-system-a7e88f3b`
- `fix/broken-login-route-b3cc12d9`
- `security/remove-leaked-key-f0e12345`

## Rules
- Lowercase only
- Hyphens only (no underscores, no slashes except type separator)
- Slug max 30 characters
- NEVER push directly to main or master — always branch + PR
