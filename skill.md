---
name: software-engineer
description: Pointer — the installable skill now lives at skills/software-engineer/SKILL.md and ships as a Claude Code plugin.
---

# Software Engineer — packaged as a plugin

The canonical, installable skill now lives at
[`skills/software-engineer/SKILL.md`](skills/software-engineer/SKILL.md) and is shipped as a
Claude Code plugin.

**Install it via the plugin marketplace (this is what makes `/software-engineer` appear):**

```
/plugin marketplace add MARafey/The-Software-Engineer
/plugin install software-engineer@software-engineer
```

> Dropping a loose `software-engineer.md` into `~/.claude/skills/` does **not** register a
> slash command. Claude Code only loads skills packaged as `skills/<name>/SKILL.md` — which is
> exactly how this plugin ships it. See the [README](README.md) for full usage.
