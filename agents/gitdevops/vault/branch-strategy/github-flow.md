# GitHub Flow (human PR conventions)

> Note: this is the **human-facing** GitHub branching convention. The orchestrator's
> internal agent branches use `<type>/<slug>-<sessionId>` (see `branch-strategy/naming-rules.md`).
> Use this note when collaborating via GitHub PRs; use `naming-rules.md` for automated agent commits.

## Branch naming
- Features: `feature/<feature-title>` (e.g. `feature/user-authentication`)
- Bug fixes: `bug/<bug-title>` or `fix/<bug-title>` (e.g. `bug/login-jwt-expired`)

## Pull requests
- **Protected branches**: no direct pushes to `main` (production).
- **PR required**: all code changes go through a Pull Request.
- **Merge**: use **Squash and merge** to keep a clean history on target branches.
