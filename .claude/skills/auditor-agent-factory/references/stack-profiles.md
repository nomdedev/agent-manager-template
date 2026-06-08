# Perfiles de stack

Un proyecto puede tener **múltiples perfiles** (compuesto). Ej: tradingview-mcp = `mcp-server` + `react-dashboard` + `vercel-api` + `cli-tool`.

## mcp-server

**Señales:** `@modelcontextprotocol/sdk`, `src/mcp-server.js`, `src/tools/`, perfiles safe/full.

**Auditores reforzados:** security-auditor, test-auditor, architecture-auditor.

**Checks específicos:**
- Capas: `src/core/` → `src/tools/` → `src/mcp-server.js`
- Perfiles de seguridad y políticas remote/UI eval
- Context management (summary, study_filter, caps)
- E2E requiere servicio externo (documentar prerequisitos)

**Omitir:** design-auditor (si no hay UI).

## react-dashboard

**Señales:** `dashboard/`, Vite, React, TypeScript, Tailwind.

**Auditores reforzados:** design-auditor, production-auditor, test-auditor.

**Checks específicos:**
- `npm run dashboard:check` (typecheck + build)
- Componentes en `dashboard/src/components/`
- Accesibilidad, estados vacío/error
- QA browser: Playwright specs en `qa/`

## vercel-api

**Señales:** `api/*.js`, `@vercel/node`, `vercel.json`.

**Auditores reforzados:** security-auditor, architecture-auditor.

**Checks específicos:**
- Rutas serverless sin secretos en cliente
- Caché y fallbacks (`api/lib/cache.js`, persistent-store)
- `.vercelignore` excluye archivos sensibles
- Cold start y límites de payload

## cli-tool

**Señales:** `src/cli/`, `bin` en package.json, `npm link`.

**Auditores reforzados:** devex-auditor, test-auditor.

**Checks específicos:**
- `npm run test:cli`
- Router y comandos documentados
- Exit codes y mensajes de error
- README con ejemplos de uso

## nextjs

**Señales:** `next.config`, `app/` o `pages/`, `next` dependency.

**Auditores reforzados:** design-auditor, security-auditor, architecture-auditor.

**Checks específicos:**
- Server vs Client Components
- Middleware auth
- Env vars (`NEXT_PUBLIC_` vs server-only)
- Build y lint

## generic-node

**Fallback** cuando no coincide ningún perfil específico.

**Auditores:** todos los base (scope, architecture, security, code, test, production).

**Checks:** package.json scripts, tests/, README, .gitignore.

## Matriz de inclusión condicional

| Condición | Auditor a incluir |
|-----------|-------------------|
| Carpeta UI (`dashboard/`, `src/components/`, `app/`) | design-auditor |
| `.github/workflows/` o CI config | devex-auditor |
| `api/` serverless | security-auditor (reforzado) |
| `src/cli/` | devex-auditor (reforzado) |
| `qa/*.js` o Playwright | production-auditor (reforzado) |
| Perfil safe/full o auth middleware | security-auditor (reforzado) |

## tradingview-mcp (referencia)

Perfil compuesto detectado automáticamente:

| Perfil | Evidencia |
|--------|-----------|
| mcp-server | `src/mcp-server.js`, MCP SDK |
| react-dashboard | `dashboard/`, Vite + React 19 |
| vercel-api | `api/*.js` |
| cli-tool | `src/cli/`, `npm run tv` |

**Comandos clave:**
- `npm run test:unit` — sin TV
- `npm test` — E2E con TV
- `npm run dashboard:check`
- `node qa/final-audit.js`
- `TV_MCP_PROFILE=safe|full`
