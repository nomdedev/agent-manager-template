# .opencode/ — Fallback for OpenCode

This directory is a **minimal fallback**. The source of truth is `.claude/`.

OpenCode reads `opencode.json` (project root) which references everything in `.claude/`:

- **Rules**: `.claude/CLAUDE.md`, `.claude/architecture.md`, `.claude/context.md` via `instructions`
- **Agents**: defined inline in `opencode.json` referencing `.claude/agents/*.md` via `{file:...}`
- **Commands**: defined inline in `opencode.json` referencing `.claude/commands/*.md` via `{file:...}`

If OpenCode cannot read `.claude/` for some reason, files here act as fallback.

Use `plugins/` for native OpenCode plugins only.
