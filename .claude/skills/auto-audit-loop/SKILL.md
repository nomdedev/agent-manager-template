---
name: auto-audit-loop
description: >
  Sistema de loops de análisis automático para el Agent Manager Template.
  Cada tarea que se inicia activa automáticamente los agentes expertos
  correspondientes según el tipo de cambio detectado.
trigger:
  - "iniciar tarea"
  - "nueva feature"
  - "editar código"
  - "audit"
  - "loop automático"
  - "agentes expertos"
---

# Skill: Auto-Audit Loop

## Propósito

Diseñar e implementar un sistema donde **cada tarea que iniciamos active automáticamente los loops de análisis** con los agentes expertos que corresponden, sin intervención manual.

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TRIGGER (Disparador)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ File Edit   │  │ Task Start  │  │ Cron Schedule│  │ PR Opened   │  │
│  │ (PostToolUse)│  │ (PreTask)   │  │ (Daily 9am)  │  │ (Webhook)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
└─────────┼────────────────┼────────────────┼────────────────┼──────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CLASSIFIER (Clasificador de Cambios)                    │
│                                                                     │
│  Analiza: • Archivos modificados (extensión, path)                  │
│           • Tipo de tarea (feature, bug, refactor, docs)            │
│           • Stack afectado (backend, frontend, infra, security)       │
│                                                                     │
│  Output: Lista de agentes expertos a activar + prioridad              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR (Distribuidor)                             │
│                                                                     │
│  Para cada agente activado:                                         │
│  1. Carga contexto desde STATE.md                                   │
│  2. Ejecuta agente experto vía delegate_task                        │
│  3. Recolecta resultados                                            │
│  4. Actualiza STATE.md con hallazgos                                │
│  5. Verifica gates (tests, lint, typecheck pasan?)                  │
│  6. Si falla → bounce al agente origen con contexto                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│              REPORTER (Consolidador)                                 │
│                                                                     │
│  • Genera HTML report con todos los hallazgos                       │
│  • Actualiza Obsidian vault con análisis                              │
│  • Notifica al usuario con resumen ejecutivo                        │
│  • Si CRITICAL → bloquea continuar hasta fix                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Agentes Expertos Disponibles

| Agente | Trigger | Archivos | Gate |
|--------|---------|----------|------|
| **typescript-expert** | `.ts`, `.tsx` editados | `src/**/*.ts` | `tsc --noEmit` pasa |
| **security-auditor** | Auth, API, routes, env | `src/routes/*`, `src/middleware/*`, `.env*` | `npm audit` limpio |
| **qa-tester** | Tests nuevos/modificados | `tests/**/*`, `src/**/*.ts` | `vitest run` pasa |
| **frontend-expert** | `.css`, `.html`, `.tsx` | `src/**/*.{css,html,tsx}` | Build pasa |
| **devops-infra** | `vercel.json`, `Dockerfile`, CI | `vercel.json`, `.github/` | Deploy preview OK |
| **performance** | Cambios en algoritmos, queries | `src/services/*`, `src/tools/*` | Benchmarks < threshold |
| **reviewer** | Cualquier PR, cualquier cambio | Todo | Review checklist completo |

## Reglas de Activación Automática

### Regla 1: Por extensión de archivo
```
*.ts, *.tsx     → typescript-expert + qa-tester
*.js, *.jsx     → typescript-expert (si es JS puro) + qa-tester
*.css, *.html   → frontend-expert
*.md            → documentation-expert (si es docs/)
*.json          → security-auditor (si es package.json) + typescript-expert
*.sh            → security-auditor + devops-infra
*.env*          → security-auditor (CRITICAL)
*.yml, *.yaml   → devops-infra + security-auditor
```

### Regla 2: Por path del archivo
```
src/routes/*      → security-auditor + typescript-expert
src/middleware/*  → security-auditor + typescript-expert
src/services/*    → typescript-expert + qa-tester + performance
src/cli/*         → typescript-expert + security-auditor + qa-tester
src/config/*      → security-auditor + typescript-expert
src/tools/*       → typescript-expert + qa-tester
src/utils/*       → typescript-expert + qa-tester
.claude/hooks/*   → security-auditor + devops-infra
external/*        → security-auditor (supply chain)
```

### Regla 3: Por tipo de tarea (detectado en mensaje del usuario)
```
"feature", "implementar", "nuevo"     → todos los agentes del stack afectado
"bug", "fix", "arreglar"              → typescript-expert + qa-tester + security-auditor
"refactor"                            → typescript-expert + reviewer + qa-tester
"security", "auth", "login"           → security-auditor (CRITICAL) + typescript-expert
"deploy", "vercel", "infra"           → devops-infra + security-auditor + qa-tester
"test", "cobertura"                   → qa-tester + typescript-expert
"docs", "documentación"               → documentation-expert
```

### Regla 4: Por palabras clave en diff
```
"exec", "spawn", "eval"               → security-auditor (CRITICAL)
"fetch", "axios", "http"              → security-auditor
"password", "token", "secret", "key"  → security-auditor (CRITICAL)
"chmod", "chown", "sudo"              → security-auditor + devops-infra
"DROP", "DELETE", "TRUNCATE"          → security-auditor (CRITICAL)
"require(", "import("                 → security-auditor (supply chain)
```

## Flujo de Ejecución del Loop

### Paso 1: Detectar cambios (Trigger)
```bash
# Hook PostToolUse detecta que se editó un archivo
# Lee el path del archivo modificado
# Clasifica según Reglas 1-4
```

### Paso 2: Determinar agentes a activar (Classifier)
```bash
# Input: archivo_modificado, tipo_tarea, diff
# Output: lista_agentes = [typescript-expert, security-auditor, qa-tester]
# Prioridad: CRITICAL > HIGH > MEDIUM > LOW
```

### Paso 3: Ejecutar agentes en paralelo (Orchestrator)
```bash
# Para cada agente en lista_agentes:
#   1. Cargar STATE.md para contexto previo
#   2. Ejecutar delegate_task con:
#      - goal: Prompt específico del agente
#      - context: Archivos afectados + convenciones del proyecto
#      - toolsets: ['terminal', 'file']
#   3. Recolectar resultado
#   4. Guardar hallazgos en STATE.md
```

### Paso 4: Consolidar y reportar (Reporter)
```bash
# 1. Agrupar hallazgos por severidad
# 2. Si hay CRITICAL → bloquear, notificar usuario
# 3. Generar HTML report con todos los hallazgos
# 4. Actualizar Obsidian vault
# 5. Notificar al usuario con resumen
```

## State File: STATE.md

Ubicación: `.claude/logs/auto-audit/STATE.md`

Formato:
```markdown
# Auto-Audit State

## Última ejecución: 2026-06-20T18:00:00Z
## Tarea: Implementar feature X
## Archivos afectados: src/services/x.ts, tests/unit/x.test.ts

### Hallazgos abiertos
| ID | Agente | Severidad | Archivo | Descripción | Estado |
|----|--------|-----------|---------|-------------|--------|
| A1 | security | HIGH | src/routes/x.ts | Falta rate limiting | OPEN |
| A2 | typescript | MEDIUM | src/services/x.ts | any implícito | OPEN |

### Hallazgos cerrados
| ID | Agente | Severidad | Archivo | Descripción | Resolución |
|----|--------|-----------|---------|-------------|------------|
| B1 | qa | LOW | tests/unit/x.test.ts | Falta test edge case | Fixed in commit abc123 |

### Métricas
- Total hallazgos: 15
- Abiertos: 2
- Cerrados: 13
- Score de calidad: 87/100
```

## Gates de Calidad

Cada agente debe verificar su gate antes de reportar "OK":

| Agente | Gate | Comando |
|--------|------|---------|
| typescript-expert | Type check pasa | `tsc --noEmit` |
| security-auditor | No secretos expuestos + npm audit limpio | `npm audit` + grep secrets |
| qa-tester | Tests pasan + cobertura OK | `vitest run --coverage` |
| frontend-expert | Build pasa + no errores visuales | `pnpm build` |
| devops-infra | Deploy preview OK | `vercel --preview` |
| performance | Benchmarks < threshold | `vitest bench` |
| reviewer | Checklist completo | Manual + automated |

## Anti-Patterns a Evitar

1. **No activar TODOS los agentes para TODOS los cambios** → es costoso y lento
2. **No dejar que un agente verifique su propio trabajo** → maker ≠ checker
3. **No ignorar hallazgos MEDIUM/LOW** → se acumulan como deuda técnica
4. **No ejecutar sin STATE.md** → el agente pierde contexto de auditorías previas
5. **No bloquear indefinidamente por un gate** → timeout de 10 min por agente

## Integración con gstack

Usar skills de gstack como agentes expertos adicionales:
- `/review` → reviewer
- `/cso` → security-auditor (OWASP + STRIDE)
- `/qa` → qa-tester (browser automation)
- `/health` → typescript-expert + qa-tester (code quality dashboard)
- `/benchmark` → performance
- `/ship` → devops-infra (deploy)

## Integración con Hermes Agent

Para que Hermes ejecute estos loops automáticamente:

1. **Cron job diario** (9am):
   ```yaml
   schedule: "0 9 * * *"
   prompt: "Ejecutar auto-audit-loop completo: revisar STATE.md, ejecutar todos los agentes expertos según archivos modificados en las últimas 24h, generar reporte HTML, actualizar Obsidian vault."
   ```

2. **Hook PostToolUse** (en tiempo real):
   ```bash
   # Después de cada Write/Edit/MultiEdit
   # Detectar archivos modificados
   # Clasificar y activar agentes correspondientes
   # No bloquear el flujo del usuario (async)
   ```

3. **Pre-task hook** (antes de empezar):
   ```bash
   # Leer STATE.md para contexto de auditorías previas
   # Si hay hallazgos CRITICAL abiertos → bloquear tarea
   # Notificar al usuario de deuda técnica pendiente
   ```

## Métricas de Éxito

- **Costo por cambio aceptado**: < 50% de tokens vs. auditoría manual
- **Tiempo de detección**: < 5 min desde edición de archivo
- **Falsos positivos**: < 20% de hallazgos reportados
- **Cobertura de agentes**: 100% de archivos modificados auditados
- **Score de calidad del proyecto**: objetivo > 85/100

## Próximos Pasos para Implementar

1. [ ] Crear directorio `.claude/logs/auto-audit/`
2. [ ] Crear `STATE.md` template
3. [ ] Implementar hook `03-auto-audit-trigger.sh`
4. [ ] Implementar script `bin/auto-audit.js` (clasificador + orquestador)
5. [ ] Configurar cron job en Hermes
6. [ ] Testear con cambio de ejemplo
7. [ ] Documentar en Obsidian vault
