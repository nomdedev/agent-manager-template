# 🔍 Auto-Audit Loop

> Sistema de auditoría automática con agentes expertos. Se activa con cada edición de código, ejecuta gates de calidad y genera reportes HTML.

[![npm version](https://badge.fury.io/js/@matiasscalbi%2Fauto-audit-loop.svg)](https://www.npmjs.com/package/@matiasscalbi/auto-audit-loop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Instalación Rápida

```bash
# Global (recomendado)
npm install -g @matiasscalbi/auto-audit-loop

# O con pnpm
pnpm add -g @matiasscalbi/auto-audit-loop
```

## 📋 Uso

### Inicializar en un proyecto

```bash
cd ./mi-proyecto
auto-audit-init

# O con opciones
auto-audit-init --yes
auto-audit-init ./otro-proyecto --yes
```

### Ejecutar auditoría

```bash
# Auditar un archivo
auto-audit src/index.ts "typescript-expert security-auditor"

# Con prioridad mínima
auto-audit src/index.ts "security-auditor" CRITICAL

# Auditar todo el proyecto
auto-audit src/ "typescript-expert security-auditor qa-tester" HIGH
```

### En Claude Code

```
/auto-audit src/index.ts typescript-expert security-auditor
```

---

## 🏗️ Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Edit File  │────▶│ Hook Trigger│────▶│  Classifier     │
└─────────────┘     └─────────────┘     │ (ext/path/cont) │
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

## 🎯 Gates de Calidad

| Gate | Comando | Propósito |
|------|---------|-----------|
| **TypeScript** | `tsc --noEmit` | Sin errores de tipo |
| **Tests** | `vitest run` | Todos los tests pasan |
| **Security** | `npm audit` | 0 vulnerabilidades conocidas |

---

## 🤖 Agentes Expertos

| Agente | Trigger | Descripción |
|--------|---------|-------------|
| `typescript-expert` | `.ts`, `.tsx` | Errores de tipo, lint |
| `security-auditor` | `src/`, `config/` | Vulnerabilidades, CORS, secrets |
| `qa-tester` | `src/`, `tests/` | Tests, coverage, edge cases |
| `frontend-expert` | `.tsx`, `.jsx`, `.css` | Componentes, accesibilidad |
| `backend-expert` | `src/routes/`, `src/services/` | APIs, DB, performance |
| `devops-expert` | `Dockerfile`, `.yml`, `.yaml` | Infra, CI/CD |

---

## 📦 Qué se instala

| Componente | Ubicación | Función |
|-----------|-----------|---------|
| **Skill** | `.claude/skills/auto-audit-loop/SKILL.md` | Conocimiento del sistema |
| **Hook** | `.claude/hooks/PostToolUse/03-auto-audit-trigger.sh` | Trigger automático |
| **Script** | `bin/auto-audit.js` | Orquestador Node.js |
| **Comando** | `.claude/commands/auto-audit.md` | `/auto-audit` en Claude Code |
| **State** | `.claude/logs/auto-audit/STATE.md` | Seguimiento de hallazgos |
| **Reports** | `.claude/logs/auto-audit/reports/*.html` | Reportes HTML |

---

## ⚙️ Configuración

### `.env`

```bash
# CORS en producción (obligatorio)
ALLOWED_ORIGINS=https://tu-dominio.vercel.app

# API Keys (para agentes que usan LLM)
OPENAI_API_KEY=sk-...
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

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/auto-audit.yml
name: Auto-Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm auto-audit src/ "typescript-expert security-auditor qa-tester" HIGH
      - uses: actions/upload-artifact@v3
        with:
          name: audit-reports
          path: .claude/logs/auto-audit/reports/
```

---

## 📊 Métricas

El sistema trackea:

- **Hallazgos por severidad**: CRITICAL, HIGH, MEDIUM, LOW
- **Score de calidad**: 0-100 (basado en gates + hallazgos)
- **Tiempo de ejecución**: Por agente y total
- **Tendencia**: Hallazgos abiertos vs cerrados en el tiempo

---

## 🛠️ Troubleshooting

| Problema | Solución |
|----------|----------|
| "Hook no se activa en Windows" | Requiere Git Bash. Ejecutar: `chmod +x .claude/hooks/**/*.sh` |
| "npm audit falla con pnpm" | El script detecta automáticamente. Si falla, editar `bin/auto-audit.js` |
| "Tests fallan en nuevo proyecto" | Asegurar que `vitest.config.ts` excluya `external/` y `node_modules/` |
| "CORS error en producción" | Configurar `ALLOWED_ORIGINS` en `.env` |

---

## 📚 Documentación

- [Guía de Portabilidad](https://github.com/matiasscalbi/auto-audit-loop/blob/main/docs/PORTABILITY.md)
- [Arquitectura](https://github.com/matiasscalbi/auto-audit-loop/blob/main/docs/ARCHITECTURE.md)
- [API Reference](https://github.com/matiasscalbi/auto-audit-loop/blob/main/docs/API.md)

---

## 📝 License

MIT © [Matias Scalbi](https://github.com/matiasscalbi)

---

## 🙏 Créditos

- Creado para [agent-manager-template](https://github.com/matiasscalbi/agent-manager-template)
- Inspirado en gstack de [Garry Tan](https://github.com/garrytan/gstack)
- Integración con [Claude Code](https://claude.ai/code)
