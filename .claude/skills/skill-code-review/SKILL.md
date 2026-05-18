# Skill: Code Review

## Propósito
Realizar revisiones de código sistemáticas según los estándares del proyecto, detectando bugs, vulnerabilidades de seguridad, problemas de rendimiento y violaciones de convenciones.

## Cuándo activar este skill
- El usuario pide "review", "revisar", "code review", "auditar código"
- Antes de un commit o PR
- Después de implementar una feature o fix
- Cuando se dice "check this code" o "checkeo de calidad"

## Cuándo NO usar este skill
- Cuando el usuario solo quiere una explicación del código
- Cuando está pidiendo debuggear un error específico (usar skill-debugging)
- Cuando está pidiendo refactorizar (usar skill-refactoring)

## Proceso paso a paso

### Paso 1: Lectura completa
Leer todos los archivos relevantes al cambio. No revisar sin haber leído el código completo del contexto.

### Paso 2: Checklist de seguridad
- [ ] No hay credenciales hardcodeadas
- [ ] Inputs validados con schemas (Zod)
- [ ] No hay SQL injection / command injection
- [ ] No hay XSS (sanitización de output)
- [ ] Manejo correcto de errores sin exponer internals
- [ ] Rate limiting en endpoints públicos

### Paso 3: Checklist de calidad
- [ ] Nombres descriptivos y consistentes con convenciones
- [ ] Funciones con responsabilidad única (< 50 líneas idealmente)
- [ ] Tipos correctos (sin `any`, usar `unknown` + type guards)
- [ ] Manejo de errores en operaciones async
- [ ] No hay código duplicado
- [ ] Imports organizados (node builtins → externos → internos)

### Paso 4: Checklist de rendimiento
- [ ] No hay N+1 queries
- [ ] No hay loops innecesarios sobre datos grandes
- [ ] Async operations no bloquean el event loop
- [ ] Memoria: no hay leaks evidentes (listeners sin remover, caches sin límite)

### Paso 5: Checklist de testing
- [ ] Hay tests para la nueva funcionalidad
- [ ] Los tests cubren casos edge y errores
- [ ] Los tests son determinísticos (no dependen de timing/orden)

### Paso 6: Generar reporte
Emitir reporte con formato:
```
## Code Review — [archivos revisados]

### Crítico (debe corregirse antes de merge)
- 🔴 [archivo:line] Descripción del problema

### Importante (debería corregirse)
- 🟡 [archivo:line] Descripción

### Sugerencias (nice to have)
- 🟢 [archivo:line] Sugerencia

### Lo que está bien
- ✅ [aspectos positivos del código]
```

## Ejemplos

### Ejemplo de entrada:
"Revisa el código que acabo de cambiar en src/services/agent.ts"

### Ejemplo de salida esperada:
Reporte completo con issues categorizados por severidad, con línea específica y sugerencia de fix.

## Patrones comunes y cómo manejarlos
- **Código nuevo sin tests**: Reportar como crítico, sugerir tests específicos
- `any` type: Reportar como importante, sugerir el tipo correcto
- **Error catch vacío**: Reportar como importante, sugerir logging o manejo explícito
- **Console.log en producción**: Reportar como sugerencia, sugerir logger estructurado

## Errores frecuentes a evitar
- No revisar solo el código nuevo sin entender el contexto existente
- No reportar problemas sin sugerir una solución
- No ignorar tests faltantes como si fueran opcionales
- No aprobar código que no has leído completamente

## Output esperado
Reporte estructurado con severidad (🔴🟡🟢), ubicación exacta (archivo:línea), descripción clara del problema y sugerencia concreta de fix. Incluir sección de "lo que está bien" para balance.
