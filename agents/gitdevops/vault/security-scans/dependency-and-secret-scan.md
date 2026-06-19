# Pre-Deployment Security Checks

(Extends `security-scans/checklist.md`.)

- **Dependency scanning**: run vulnerability checks on third-party packages (`npm audit`, Dependabot).
- **Secret detection**: scan the codebase for hardcoded credentials, API keys, or certificates before pushing to remote.
- **AI review**: use AI agents to review the commit for security and performance bugs before merge.
