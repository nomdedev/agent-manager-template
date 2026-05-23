# PLAN-001: Fix errores TypeScript y Lint

**Fecha**: 2026-05-23
**Tipo**: bugfix
**Estado**: PLANIFICADO

---

## GOAL
Corregir todos los errores de TypeScript (7) y ESLint (3) para que el proyecto compile limpio y pase todas las validaciones.

## CRITERIA
- `npm run typecheck` pasa sin errores
- `npm run lint` pasa sin errores
- `npm test` sigue pasando (112/112)
- No se introducen nuevos errores

## APPROACH

### Fase A: TypeScript fixes (7 errores)

#### A1 — Fix `src/index.ts` (5 errores)
**Problema**: Usa propiedades camelCase que no existen en el objeto config. El schema Zod define las variables en MAYÚSCULAS.

**Cambios**:
| Línea | Antes | Después |
|-------|-------|---------|
| 12 | `config.logLevel` | `config.LOG_LEVEL` |
| 14 | `config.nodeEnv` | `config.NODE_ENV` |
| 32 | `config.port` (x2) | `config.PORT` |
| 34 | `config.nodeEnv` | `config.NODE_ENV` |

#### A2 — Fix `src/services/agent-service.ts` (2 errores)
**Problema**: El tipo `ChatMessage` custom no es compatible con `ChatCompletionMessageParam` de OpenAI SDK. Falta el campo `name` requerido para mensajes tipo `tool`.

**Cambios**:
- Extender `ChatMessage` para incluir `name?: string` (requerido por OpenAI para tool messages)
- O usar `ChatCompletionMessageParam` directamente de OpenAI
- Ajustar el push de `choice.message` al history para que los tipos coincidan

#### A3 — Fix `src/cli/commands/hermes.ts` (1 error)
**Problema**: `execSync` con `shell: true` — el parámetro `shell` espera `string | undefined`, no `boolean`.

**Cambios**:
- Revisar la llamada en línea 383
- Cambiar `shell: true` por el valor correcto según la API de Node.js

### Fase B: ESLint fixes (3 errores)

#### B1 — Fix `src/cli/commands/hermes.ts:20`
**Problema**: `dirname` importado de `node:path` pero no usado.
**Fix**: Eliminar `dirname` del import.

#### B2 — Fix `src/middleware/error-handler.ts:4`
**Problema**: Interface `AppError` definida pero nunca usada.
**Fix**: Eliminar la interface `AppError` (o usarla si es necesaria).

#### B3 — Fix `src/tools/datetime.ts:38`
**Problema**: Variable `err` capturada en catch pero no usada.
**Fix**: Renombrar a `_err` o eliminar el binding.

### Fase C: Verificación

1. Ejecutar `npm run typecheck` → debe pasar limpio
2. Ejecutar `npm run lint` → debe pasar limpio
3. Ejecutar `npm test` → 112/112 pasando
4. Ejecutar `npm run build` → debe compilar sin errores

## RISKS
- Los cambios de tipo en `agent-service.ts` podrían afectar el comportamiento runtime si no se hacen correctamente
- Eliminar `AppError` podría romper algo si se usa indirectamente (verificar imports)

## SUBAGENTES ASIGNADOS

| Subagente | Tarea | Archivos |
|-----------|-------|----------|
| fix-config | Fix props config en index.ts | `src/index.ts` |
| fix-agent-service | Fix tipos OpenAI en agent-service.ts | `src/services/agent-service.ts` |
| fix-hermes-cmd | Fix execSync + lint import | `src/cli/commands/hermes.ts` |
| fix-lint-errs | Fix lint en error-handler + datetime | `src/middleware/error-handler.ts`, `src/tools/datetime.ts` |
| verify-all | Verificar todo pasa limpio | Todo el proyecto |
