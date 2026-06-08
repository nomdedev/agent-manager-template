# Protocolo de descubrimiento (Phase 0)

Ejecutar en el **proyecto destino** (cwd = root del repo). Documentar todo en `docs/AUDIT_AGENTS.md` → `## Project Profile`.

## Checklist de lectura

### Archivos raíz (obligatorios)

- [ ] `package.json` — name, scripts, dependencies, type (module/commonjs)
- [ ] `README.md` — propósito, setup, comandos
- [ ] `AGENTS.md` o `CLAUDE.md` — convenciones, arquitectura
- [ ] `.gitignore` — qué se excluye (secrets, build, node_modules)
- [ ] `vercel.json` / `netlify.toml` / `Dockerfile` — deploy target

### Estructura de carpetas

| Señal | Perfil probable |
|-------|-----------------|
| `src/mcp-server.js` o `@modelcontextprotocol/sdk` | mcp-server |
| `src/cli/` + `bin` en package.json | cli-tool |
| `api/*.js` + `@vercel/node` | vercel-api |
| `dashboard/` o `apps/web/` + Vite/Next | react-dashboard / nextjs |
| `tests/` o `__tests__/` | test infrastructure |
| `qa/` o `e2e/` | QA scripts adicionales |
| `.github/workflows/` | CI presente → devex-auditor |
| `.claude/agents/` | agentes existentes (dominio o auditoría) |
| `.claude/skills/` | skills existentes |

### Seguridad

- [ ] Variables de entorno documentadas (`.env.example`)
- [ ] Perfiles de seguridad (ej. `TV_MCP_PROFILE`, auth middleware)
- [ ] `.vercelignore` / exclusiones de deploy
- [ ] Dependencias con `npm audit` (anotar si hay vulnerabilidades conocidas)

### Testing

- [ ] Test runner (node:test, jest, vitest, playwright)
- [ ] Scripts: `test`, `test:unit`, `test:e2e`, `lint`, `typecheck`, `build`
- [ ] Requisitos externos (TradingView, DB, Docker)

### Agentes y skills existentes

Listar sin modificar:

```
.claude/agents/
  market-analyst.md    → dominio
  security-auditor.md  → auditoría (ya existe, versionar si regeneras)
```

Clasificar cada agente como **dominio** o **auditoría**.

## Comandos de verificación a extraer

Documentar en Project Profile los comandos que los auditores ejecutarán:

```markdown
### Comandos de verificación
- Build: `npm run dashboard:check`
- Unit tests: `npm run test:unit`
- E2E: `npm test` (requiere TV + CDP)
- Security: `npm audit`
- QA browser: `node qa/final-audit.js`
```

## Plantilla Project Profile

```markdown
## Project Profile

**Nombre:** {{PROJECT_NAME}}
**Stack:** {{STACK_PROFILES}} (ej. mcp-server + react-dashboard + vercel-api)
**Deploy:** {{DEPLOY_TARGET}}

### Estructura clave
- ...

### Comandos de verificación
- ...

### Estándares detectados
- ...

### Agentes existentes
| Agente | Tipo | Acción |
|--------|------|--------|
| market-analyst | dominio | conservar |

### Fases activas
| Fase | Agente | Incluir |
|------|--------|---------|
| 0 Intake | scope-auditor | ✅ |
| 2 Design | design-auditor | ✅ (dashboard/) |
| 6 DevEx | devex-auditor | ✅ (.github/workflows/) |

### Fases omitidas
- (ninguna / listar con razón)
```

## Subagent explore (repos grandes)

Si el repo tiene múltiples paquetes o >50 archivos fuente, lanzar:

```
subagent_type: explore
thoroughness: medium
prompt: Mapear stack, tests, CI, agentes .claude/, api routes, security profiles
```

Integrar hallazgos en Project Profile antes de Phase 2.
