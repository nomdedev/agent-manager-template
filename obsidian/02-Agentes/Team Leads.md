# Team Leads

Agentes expertos que reportan al Hunter Orchestrator. Cada uno lidera un equipo especializado.

## TypeScript/Node.js Lead

**Skill**: `team-lead-typescript`
**Responsabilidades**:
- Fixes de tipo y errores de compilacion
- Refactors de codigo backend
- Implementacion de APIs y logica de negocio
- Verificaciones: typecheck, lint, tests, build

**Cuando delegar**:
- Errores de TypeScript
- Nuevos endpoints o servicios
- Refactors de backend
- Cambios en configuracion

## Frontend Lead

**Skill**: `team-lead-frontend`
**Responsabilidades**:
- Implementacion de interfaces
- Componentes reutilizables
- Accesibilidad y responsive
- Optimizacion de performance

**Cuando delegar**:
- Nuevas pantallas o componentes
- Cambios de UI/UX
- Fixes de CSS o layout
- Optimizacion de bundle

## Security Lead

**Skill**: `team-lead-security`
**Responsabilidades**:
- Auditoria de 5 modulos (secretos, deps, codigo, infra, vectores)
- Reporte OWASP
- Plan de mitigacion
- Re-auditoria post-fix

**Cuando delegar**:
- Antes de fase Develop (gate obligatorio)
- Cuando hay cambios en auth o datos sensibles
- Cuando se agregan dependencias nuevas
- Auditorias periodicas

## QA Lead

**Skill**: `team-lead-qa`
**Responsabilidades**:
- Disenar planes de prueba
- Escribir tests (unit, integration, e2e)
- Medir cobertura
- Encontrar bugs antes de produccion

**Cuando delegar**:
- Despues de fase Develop (gate obligatorio)
- Cuando se necesitan tests nuevos
- Cuando hay regresiones
- Verificacion pre-deploy

## Domain Expert

**Skill**: (built-in)
**Responsabilidades**:
- Validar requerimientos contra negocio
- Identificar edge cases
- Definir criterios de aceptacion
- Resolver ambiguedades

**Cuando delegar**:
- Fase 1 del pipeline (obligatorio)
- Cuando hay dudas de negocio
- Cuando cambian reglas de dominio

## Formato de delegacion

Cuando Hunter delega a un Team Lead, incluye:

```
CONTEXT:
- Proyecto: [ruta]
- Archivos: [lista]
- Errores: [si aplica]
- Convenciones: [de vault]
- Stack: [de vault]

GOAL:
[Tarea especifica y medible]

RESTRICCIONES:
- Cambio minimo
- No modificar archivos no relacionados
- Ejecutar verificaciones post-cambio
- Reportar estado final
```

## Reporte esperado

Cada Team Lead debe reportar:

```
## REPORTE — [tarea]
**Estado**: COMPLETADO / BLOCKED
**Team Lead**: [nombre]

### Cambios
| Archivo | Linea | Cambio |
|---------|-------|--------|
| ... | ... | ... |

### Verificaciones
| Check | Estado |
|-------|--------|
| typecheck | ✅/❌ |
| lint | ✅/❌ |
| tests | ✅/❌ |
| build | ✅/❌ |

### Notas
- [observaciones]
```
