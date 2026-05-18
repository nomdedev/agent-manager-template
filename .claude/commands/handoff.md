---
description: Generate handoff document for another agent/session
---

Compact the current conversation into a handoff document for another agent to continue.

Include:
1. Current work state
2. Files modified and why
3. Decisions made and their justification
4. Pending next steps
5. Known blockers or risks
6. Reference to pipeline-state.json if applicable

Save to `.claude/logs/handoffs/handoff-{date}.md`.
