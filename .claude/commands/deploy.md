---
description: Deploy the project to production
---

Execute the deployment pipeline for this project.

Steps:
1. Verify all tests pass: `npm test`
2. Build for production: `npm run build`
3. Check for security issues: `npm audit --audit-level=moderate`
4. Verify no hardcoded secrets in the build output
5. Deploy using the project's deploy command

IMPORTANT:
- Check `.claude/logs/pipeline-state.json` — deploy is BLOCKED if any feature is not at GO status
- Verify `git status` is clean before deploying
- If the pipeline guard blocks the deploy, do NOT override — fix the issue first

$ARGUMENTS
