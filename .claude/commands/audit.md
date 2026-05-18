---
description: Full project audit (code, tests, security, conventions)
---

Run a full audit of the project. Report each section with ✅/❌/⚠️.

## Section 1 — Code Audit
- Largest files (refactor candidates): file sizes in `src/`
- Pending TODOs and FIXMEs
- TypeScript `any` usage (forbidden)
- `dangerouslySetInnerHTML` (security rule)
- `console.log` in production code
- Conditional classes without proper utility

## Section 2 — Test Audit
- Coverage: `npm test -- --coverage`
- Source files without corresponding tests
- Tests without assertions

## Section 3 — Security Audit
- `npm audit --audit-level=moderate`
- Hardcoded secrets
- Exposed env variables
- Sensitive data in localStorage/sessionStorage

## Section 4 — Convention Audit
- Naming consistency (camelCase, PascalCase, kebab-case)
- Import style consistency
- Export style consistency
- Error handling patterns

## Section 5 — Final Report
Format:
- Code: no TODOs, no `any`, no console.log, no files > 300 lines
- Tests: coverage > 60% on business logic
- Security: no HIGH/CRITICAL vulnerabilities, no secrets
- Conventions: consistent patterns throughout

Result: ✅ APPROVED | ❌ NEEDS FIXES

Save report to `.claude/logs/audits/features/{current-feature}/` and update `.claude/logs/audits/registry.json`.

$ARGUMENTS
