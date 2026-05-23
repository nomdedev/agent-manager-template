---
h-level: 1
created: 2026-05-23
modified: 2026-05-23
agent-relevant: true
tokens: 350
---

# Convenciones de Codigo

## TypeScript

- ESM nativo, strict mode
- No `any` — usar `unknown` + type guards
- Tipos explicitos en exports publicos
- Preferir named exports

## Fastify

- Routes: async functions con `FastifyInstance`
- Prefix en `src/index.ts`
- Zod schemas para todo input
- Response format consistente:
  ```json
  { "success": true, "data": {}, "meta": {} }
  ```

## Estructura

```
src/
  routes/     # Route handlers
  services/   # Business logic
  types/      # Shared types
  config/     # Env validation (Zod)
  middleware/ # Error handlers
  utils/      # Logger, helpers
```

## Testing

- Vitest + Supertest
- Colocado junto al fuente: `*.test.ts`
- Naming: `it('should <behavior> when <condition>')`

## Logging

- Pino (structured JSON)
- Nunca `console.log`
- Incluir `requestId` en todos los logs
