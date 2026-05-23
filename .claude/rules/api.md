# API Rules — Agent Manager Template

Rules for designing and implementing REST APIs in this Fastify project.
Referenced by `.claude/agents/api-expert.md`.

---

## Response Format

All API responses MUST follow this envelope:

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "message", "issue": "Required" }
    ]
  }
}
```

### Error Codes
| Code | HTTP Status | When |
|------|-------------|------|
| `VALIDATION_ERROR` | 400 | Zod schema validation fails |
| `NOT_FOUND` | 404 | Resource does not exist |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `RATE_LIMITED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Missing or invalid auth |

---

## Route Structure

```typescript
// src/routes/example-routes.ts
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ExampleService } from '../services/example-service.js';
import { logger } from '../utils/logger.js';

const CreateRequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function exampleRoutes(app: FastifyInstance) {
  const service = new ExampleService();

  app.post<{
    Body: z.infer<typeof CreateRequestSchema>;
  }>(
    '/examples',
    {
      schema: {
        body: CreateRequestSchema,
        // OpenAPI docs
        description: 'Create a new example',
        tags: ['examples'],
      },
    },
    async (request, reply) => {
      const result = await service.create(request.body);
      return reply.status(201).send({
        success: true,
        data: result,
      });
    },
  );
}
```

---

## Zod Schema Conventions

1. **Always export the schema** — `export const SchemaName = z.object({...})`
2. **Infer types from schemas** — `type TypeName = z.infer<typeof SchemaName>`
3. **Coerce for numbers** — `z.coerce.number()` for env vars and query params
4. **Default values** — `.default(value)` for optional fields with sensible defaults
5. **Custom error messages** — `.min(1, 'Name is required')` for user-friendly validation

---

## Service Layer

- Services live in `src/services/`
- Each service is a class with clear methods
- Services handle business logic, not HTTP concerns
- Services log their actions with context
- Services throw domain errors, not HTTP errors

---

## Error Handling

- Use the global error handler in `src/middleware/error-handler.ts`
- Domain errors are mapped to HTTP responses there
- Always include `requestId` in error responses
- Log errors with full context before sending response

---

## OpenAPI Documentation

- Use `@fastify/swagger` for auto-generated docs
- Add `description`, `tags`, `summary` to route schemas
- Keep docs in sync with implementation
