# Commit Message Examples

## Format
```
<type>(<scope>): <subject>    ← max 50 chars, imperative mood, no trailing period

[optional body: what changed and why, 72-char wrap]

[optional footer: BREAKING CHANGE: ..., Closes #N]
```

## Good examples
```
feat(auth): add JWT refresh token endpoint

Implements POST /api/auth/refresh which validates a refresh token
stored in an httpOnly cookie and issues a new access token.

Closes #42
```

```
fix(orders): correct total calculation on discounted items

Discount was applied before tax instead of after, causing incorrect
totals when both discount and tax rates were non-zero.
```

## Bad examples (rejected by git agent)
```
updated stuff          ← no type, vague
Added the new feature. ← trailing period, no scope
WIP                    ← not descriptive
```
