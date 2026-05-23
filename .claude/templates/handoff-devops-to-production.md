## HANDOFF: DevOps → Production — [feature-id]
**From:** devops-infra
**To:** orchestrator
**Date:** [ISO-8601]

### DevOps Verdict: [GO / GO_WITH_NOTES]

### Deploy Status
- [ ] CI/CD green
- [ ] `vercel.json` validated
- [ ] Docker build passes (if applicable)
- [ ] Env vars configured in Vercel dashboard
- [ ] Secrets scan clean

### Smoke Test Plan
1. [Step 1: health check `GET /api/v1/health`]
2. [Step 2: API call `POST /api/v1/...`]
3. [Step 3: verify response shape]
4. [Step 4: check logs for errors]

### Rollback Plan
- Rollback command: [e.g., `vercel --rollback` or git revert]
- Expected recovery time: [e.g., 2 minutes]
- Last known good version: [commit hash / Vercel deployment URL]

### Attachments
- DevOps report: [link to Fase 6.5 report]
- Production checklist: `.claude/rules/orchestration.md`
