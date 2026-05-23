## HANDOFF: QA → DevOps — [feature-id]
**From:** tester
**To:** devops-infra
**Date:** [ISO-8601]

### QA Verdict: [GO / GO_WITH_NOTES]

### Test Results
| Metric | Value |
|--------|-------|
| Tests planned | X |
| Tests written | X |
| Tests passing | X |
| Tests failing | X |
| Coverage | X% |

### Edge Cases Covered
- [list]

### Build Artifacts
- [ ] `npm run build` produces valid output
- [ ] No `console.log` with sensitive data
- [ ] `dist/` contents verified
- [ ] No new secrets introduced

### Deploy Readiness
- [ ] Env vars documented
- [ ] Rollback plan understood
- [ ] No breaking changes to API

### Attachments
- QA report: [link to Fase 6 report]
- DevOps rules: `.claude/agents/devops-infra.md`
