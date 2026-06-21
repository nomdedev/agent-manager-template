# 🔍 Auto-Audit Loop — Guía de Portabilidad

> Sistema de auditoría automática con agentes expertos. Se activa con cada edición de código, gate de calidad, y reporte HTML.

---

## ¿Qué se instala?

| Componente | Ubicación | Función |
|-----------|-----------|---------|
| **Skill** | `.claude/skills/auto-audit-loop/SKILL.md` | Conocimiento del sistema para Claude Code |
| **Hook** | `.claude/hooks/PostToolUse/03-auto-audit-trigger.sh` | Se activa al editar archivos |
| **Script** | `bin/auto-audit.js` | Orquestador Node.js con gates y reportes |
| **Comando** | `.claude/commands/auto-audit.md` | Comando `/auto-audit` en Claude Code |
| **State** | `.claude/logs/auto-audit/STATE.md` | Seguimiento de hallazgos |
| **Reports** | `.claude/logs/auto-audit/reports/*.html` | Reportes HTML por ejecución |

---

## Instalación Rápida

### Opción 1: Desde el template (recomendado)

```bash
# Estás en el repo agent-manager-template
claudio auto-audit-install ./mi-proyecto --yes
```

### Opción 2: Manual (cualquier proyecto)

```bash
# 1. Copiar archivos
cp -r .claude/skills/auto-audit-loop ./mi-proyecto/.claude/skills/
cp -r .claude/hooks/PostToolUse/03-auto-audit-trigger.sh ./mi-proyecto/.claude/hooks/PostToolUse/
cp bin/auto-audit.js ./mi-proyecto/bin/
cp .claude/commands/auto-audit.md ./mi-proyecto/.claude/commands/

# 2. Crear STATE.md
mkdir -p ./mi-proyecto/.claude/logs/auto-audit/reports
touch ./mi-proyecto/.claude/logs/auto-audit/STATE.md

# 3. Agregar scripts a package.json
# "auto-audit": "node bin/auto-audit.js"
# "test:coverage": "vitest run --coverage"
# "typecheck": "tsc --noEmit"
# "lint": "eslint src/"

# 4. Instalar dependencias
pnpm add -D vitest @vitest/coverage-v8 eslint typescript
```

### Opción 3: npm package (futuro)

```bash
npm install -g @matiasscalbi/auto-audit-loop
auto-audit-init ./mi-proyecto
```

---

## Uso

### Manual (una vez)

```bash
# Auditar un archivo específico
node bin/auto-audit.js src/index.ts "typescript-expert security-auditor qa-tester"

# Con prioridad mínima (solo CRITICAL)
node bin/auto-audit.js src/index.ts "security-auditor" CRITICAL

# Con prioridad HIGH (incluye HIGH y CRITICAL)
node bin/auto-audit.js src/index.ts "typescript-expert security-auditor" HIGH
```

### Automático (hook)

Editás cualquier archivo → el hook detecta el cambio → clasifica → activa agentes.

```
✅ Archivo editado: src/services/api.ts
   Tipo: TypeScript
   Agente activado: typescript-expert
   Ejecutando gate: tsc --noEmit...
   ✅ Gate PASÓ
   🤖 typescript-expert analizando...
   ✅ 0 hallazgos
```

### Comando en Claude Code

```
/auto-audit src/index.ts typescript-expert security-auditor
```

### Cron job (diario)

```bash
# Crear cron job para auditoría diaria 9am
claudio cron create auto-audit-diario "0 9 * * *"
```

---

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Edit File  │────▶│ Hook Trigger│────▶│ Classifier      │
└─────────────┘     └─────────────┘     │ (ext/path/cont)  │
                                        └────────┬────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
            ┌─────────────┐            ┌─────────────┐               ┌─────────────┐
            │ TypeScript  │            │  Security   │               │    QA       │
            │   Expert    │            │  Auditor   │               │   Tester    │
            └──────┬──────┘            └──────┬──────┘               └──────┬──────┘
                   │                          │                            │
                   └──────────────────────────┼────────────────────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Reporter   │
                                       │ (HTML/MD)   │
                                       └─────────────┘
```

---

## Gates de Calidad

| Gate | Comando | Propósito |
|------|---------|-----------|
| **TypeScript** | `tsc --noEmit` | Sin errores de tipo |
| **Tests** | `vitest run` | Todos los tests pasan |
| **Security** | `npm audit` | 0 vulnerabilidades conocidas |

---

## Agentes Expertos Disponibles

| Agente | Trigger | Gate | Descripción |
|--------|---------|------|-------------|
| `typescript-expert` | `.ts`, `.tsx` | `tsc --noEmit` | Errores de tipo, lint |
| `security-auditor` | `src/`, `config/` | `npm audit` | Vulnerabilidades, CORS, secrets |
| `qa-tester` | `src/`, `tests/` | `vitest run` | Tests, coverage, edge cases |
| `frontend-expert` | `.tsx`, `.jsx`, `.css` | `vitest run` | Componentes, accesibilidad |
| `backend-expert` | `src/routes/`, `src/services/` | `tsc --noEmit` | APIs, DB, performance |
| `devops-expert` | `Dockerfile`, `.yml`, `.yaml` | `docker build` | Infra, CI/CD |

---

## Configuración

### `.env`

```bash
# CORS en producción (obligatorio)
ALLOWED_ORIGINS=https://tu-dominio.vercel.app,https://www.tu-dominio.com

# API Keys (para agentes que usan LLM)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Logs
LOG_LEVEL=info
```

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['node_modules', 'dist', 'external', '**/external/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/', 'external/'],
    },
  },
})
```

---

## Integración con gstack

Si tenés gstack instalado, los skills se complementan:

| gstack Skill | Auto-Audit Loop | Uso |
|-------------|-----------------|-----|
| `/review` | `typescript-expert` | Review de código |
| `/qa` | `qa-tester` | Testing y calidad |
| `/ship` | `security-auditor` | Pre-deploy security check |
| `/cso` | `security-auditor` | Chief Security Officer audit |

---

## Troubleshooting

### "No se encontró el hook"

En Windows, los hooks `.sh` requieren Git Bash. Verificá:
```bash
git --version  # >= 2.43
# En Git Bash:
chmod +x .claude/hooks/**/*.sh
```

### "npm audit no funciona"

Si usás pnpm:
```bash
# El script detecta automáticamente pnpm vs npm
# Si falla, editá bin/auto-audit.js:
const PACKAGE_MANAGER = 'pnpm'; // o 'npm'
```

### "El hook no se activa"

Verificá que el hook esté en la ruta correcta:
```bash
ls .claude/hooks/PostToolUse/
# Debería tener: 03-auto-audit-trigger.sh
```

---

## Métricas

El sistema trackea:

- **Hallazgos por severidad**: CRITICAL, HIGH, MEDIUM, LOW
- **Score de calidad**: 0-100 (basado en gates + hallazgos)
- **Tiempo de ejecución**: Por agente y total
- **Tendencia**: Hallazgos abiertos vs cerrados en el tiempo

---

## Roadmap

- [ ] Publicar como npm package
- [ ] Integración con GitHub Actions
- [ ] Dashboard web de métricas
- [ ] Agentes adicionales (performance, accessibility, i18n)
- [ ] ML para clasificación automática de severidad

---

*Sistema creado por Matias Scalbi para agent-manager-template*
*Fecha: 2026-06-20*
