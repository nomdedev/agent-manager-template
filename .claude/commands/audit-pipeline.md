---
description: Run lifecycle audit pipeline for a feature (8 phases, GO/NO-GO)
---

Execute the **lifecycle audit pipeline** using skill `audit-pipeline`.

## Before starting

1. Read `.claude/skills/audit-pipeline/SKILL.md`
2. Read `docs/AUDIT_STANDARDS.md` and `docs/AUDIT_AGENTS.md`
3. Use input template: `audit-pipeline/references/input-template.md`

## Feature context

$ARGUMENTS

If no feature-id provided, ask the user for:
- feature-id (kebab-case)
- files/modules touched
- which phase to audit (0-7) or "full pipeline"

## Execution

- **Single phase:** Modo B — invoke matching `lifecycle-*-auditor`
- **Full feature:** Modo A — `lifecycle-orchestrator` coordinates all phases
- **Validate existing report:** Modo C — verdict-rubrics + report-validation

## Output

Save report to `docs/audits/[feature-id]-[phase]-[date].md`

Update `docs/audits/[feature-id]-state.json` if orchestrating full pipeline.

## Note

This is the **lifecycle** pipeline (8 phases). The **team** pipeline remains `/plan` + `orchestration.md` (7 phases). Both are complementary.
