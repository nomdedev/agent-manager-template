# Convenciones de codigo

## TypeScript
- Tipos explicitos cuando aclaran contratos
- Evitar `any`; usar `unknown` + type guards
- APIs pequenas, cambios acotados
- Named exports sobre default exports

## Estructura
```
src/
  index.ts          # entry point
  config/           # configuracion
  agents/           # definicion agentes AI
  tools/            # herramientas para agentes
  middleware/       # middleware app
  routes/           # endpoints
  services/         # logica de negocio
  utils/            # utilidades compartidas
  types/            # tipos TypeScript
tests/
  unit/             # logica aislada
  integration/      # wiring CLI y endpoints
  e2e/              # (estructura lista)
docs/               # artefactos para humanos
```

## Calidad
- Ejecutar tests del area tocada antes de cerrar tarea
- Mantener compatibilidad salvo que el cambio la requiera
- No mezclar refactors amplios con fixes pequenos

## Logging y errores
- Usar logger estructurado (pino), no console.log
- No exponer secrets ni stack traces sensibles
- Manejar errores de forma explicita

## Dependencias
- Preferir libreria estandar y soluciones simples
- Agregar deps solo cuando reduzcan complejidad real

## Nomenclatura
| Tipo | Convencion | Ejemplo |
|------|-----------|---------|
| Variables/funciones | camelCase | `getUserById` |
| Clases/interfaces | PascalCase | `UserService` |
| Archivos | kebab-case | `user-service.ts` |
| Path aliases | `@/` | `@/services/user` |

## Async
- Preferir async/await sobre .then().catch()
- Manejar errores con try/catch explicito
