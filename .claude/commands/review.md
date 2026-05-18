---
description: Code review of current changes
agent: reviewer
---

Review the current code changes following the Reviewer Agent protocol from `.claude/agents/reviewer.md`.

Steps:
1. Get the diff: `git diff HEAD`
2. Review by priority: Correctness → Completeness → Security → Conventions → Simplicity
3. Check for:
   - TypeScript `any` usage (forbidden)
   - Hardcoded secrets or credentials
   - Missing error handling
   - Missing tests for new logic
   - Convention violations

Report format: BLOCKING / RECOMMENDED / WELL DONE / VERDICT

Save report to `.claude/logs/audits/features/{feature-id}/review-{date}.md` if part of a pipeline.
