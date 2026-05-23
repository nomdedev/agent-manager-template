## HANDOFF: Architecture → Backend — [feature-id]
**From:** architect
**To:** api-expert / architect
**Date:** [ISO-8601]

### Design Approved
- [ ] Architecture option selected: [Option X]
- [ ] Directory structure defined
- [ ] Public interfaces documented
- [ ] Design assumptions made explicit

### Files to Create/Modify
- Create:
  - `src/routes/[name]-routes.ts`
  - `src/services/[name]-service.ts`
  - `src/types/[name].ts`
- Modify:
  - `src/index.ts` (register routes)
  - `src/config/index.ts` (add env vars if needed)
- Delete: [none / list]

### API Contracts
```typescript
// Request schema (Zod)
const RequestSchema = z.object({
  // ...
});

// Response shape
type Response = {
  success: true;
  data: { ... };
};
```

### Assumptions Made
- [Assumption 1]
- [Assumption 2]

### Risks
- [Risk 1 and mitigation]
- [Risk 2 and mitigation]

### Attachments
- Architecture report: [link to Fase 2 report]
- API rules: `.claude/rules/api.md`
