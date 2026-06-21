# /auto-audit — Auto-Audit Loop

> Activa el sistema de loops de análisis automático con agentes expertos.

## Uso

```bash
/auto-audit [archivo] [agentes]
/auto-audit src/services/agent.ts
/auto-audit src/services/agent.ts "typescript-expert security-auditor"
```

## Descripción

Este comando activa el **sistema de loops de análisis automático** que ejecuta agentes expertos según el tipo de archivo modificado.

### Sin argumentos
Analiza todos los archivos modificados en el último commit.

### Con archivo
Analiza el archivo específico y activa los agentes correspondientes según las reglas de clasificación.

### Con archivo + agentes
Fuerza la ejecución de agentes específicos sobre el archivo.

## Agentes disponibles

| Agente | Cuándo se activa | Gate |
|--------|------------------|------|
| `typescript-expert` | Archivos `.ts`, `.tsx` | `tsc --noEmit` |
| `security-auditor` | Routes, middleware, env, secrets | `npm audit` |
| `qa-tester` | Tests, services, tools | `vitest run` |
| `frontend-expert` | CSS, HTML, TSX | `pnpm build` |
| `devops-infra` | Vercel, CI/CD, Docker | Deploy preview |
| `performance` | Services, algoritmos | `vitest bench` |
| `reviewer` | Cualquier cambio | Checklist |

## Reglas de activación automática

El sistema clasifica automáticamente según:
1. **Extensión del archivo** (`.ts` → typescript, `.css` → frontend, etc.)
2. **Path del archivo** (`src/routes/` → security, `src/services/` → performance)
3. **Palabras clave en el código** (`exec`, `token`, `password` → security CRITICAL)
4. **Tipo de tarea** (feature, bug, refactor → diferentes agentes)

## Ejemplos

```bash
# Analizar archivo específico (agentes automáticos)
/auto-audit src/routes/api.ts

# Forzar agentes específicos
/auto-audit src/config/index.ts "security-auditor typescript-expert"

# Analizar todo el proyecto
/auto-audit --all

# Ver estado actual
/auto-audit --status
```

## Output

- Reporte HTML en `.claude/logs/auto-audit/reports/`
- Estado actualizado en `.claude/logs/auto-audit/STATE.md`
- Log de triggers en `.claude/logs/auto-audit/trigger.log`
- Notificación en consola con score de calidad

## Integración con hooks

Este comando se activa automáticamente por el hook `03-auto-audit-trigger.sh` después de cada edición de archivo. No requiere intervención manual.

## Estado del sistema

```bash
# Ver estado actual
/auto-audit --status

# Ver último reporte
/auto-audit --report

# Limpiar hallazgos obsoletos
/auto-audit --clean
```
