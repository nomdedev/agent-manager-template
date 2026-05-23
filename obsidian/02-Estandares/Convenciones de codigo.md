# Convenciones de codigo

## TypeScript

- Preferir tipos explicitos cuando aclaren contratos.
- Evitar any; usar unknown y type guards cuando sea necesario.
- Mantener APIs pequenas y cambios acotados.

## Estructura

- src/ contiene runtime, servicios, rutas, tools y CLI.
- tests/unit cubre logica aislada.
- tests/integration cubre wiring del CLI y endpoints.
- docs/ guarda artefactos para humanos.

## Calidad

- Ejecutar tests del area tocada antes de cerrar la tarea.
- Mantener compatibilidad con el comportamiento actual salvo que el cambio la requiera.
- No mezclar refactors amplios con fixes pequenos.

## Logging y errores

- Usar logger estructurado en lugar de console.log para runtime.
- No exponer secretos ni stack traces sensibles.
- Manejar errores de forma explicita.

## Dependencias

- Preferir libreria estandar y soluciones simples.
- Agregar dependencias solo cuando reduzcan complejidad real.