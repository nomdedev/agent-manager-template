# Skill: Documentation

## Propósito
Generar documentación de calidad para el código: docstrings, JSDoc, README sections, comentarios técnicos y documentación de API.

## Cuándo activar este skill
- El usuario pide "documentar", "documentación", "docstrings", "JSDoc", "README"
- Cuando dice "explica este código en comentarios"
- Cuando pide generar docs para una API o endpoint
- "Agrega tipos/types" en combinación con documentación

## Cuándo NO usar este skill
- Cuando el usuario quiere que expliques el código verbalmente (responder directamente)
- Cuando está pidiendo generar documentación externa tipo wiki/guía de usuario

## Proceso paso a paso

### Paso 1: Identificar el scope
Determinar qué se va a documentar: una función, un módulo, un endpoint, o un archivo completo.

### Paso 2: Documentación de funciones (JSDoc/TSDoc)
Para cada función pública:
```typescript
/**
 * Descripción breve de qué hace la función.
 *
 * @param paramName - Descripción del parámetro
 * @returns Descripción del valor de retorno
 * @throws {ErrorType} Cuándo y por qué lanza este error
 *
 * @example
 * ```ts
 * const result = functionName(param);
 * ```
 */
```

### Paso 3: Documentación de módulos
Cada archivo/módulo debe tener un comentario header breve:
```typescript
/**
 * @module nombreModulo
 * Responsabilidad del módulo en 1-2 líneas
 */
```

### Paso 4: Documentación de API endpoints
Para cada endpoint, documentar:
- Método HTTP y ruta
- Descripción de qué hace
- Parámetros (query, body, params) con tipos
- Responses posibles con códigos de estado
- Ejemplo de request/response

### Paso 5: Actualizar README si es necesario
Si el cambio agrega features, modifica comandos o cambia configuración, actualizar README.md.

## Ejemplos

### Ejemplo de entrada:
"Documenta la función processAgentMessage en src/services/agent.ts"

### Ejemplo de salida esperada:
JSDoc completo con @param, @returns, @throws, @example agregado directamente sobre la función.

## Patrones comunes y cómo manejarlos
- **Función privada compleja**: Documentar aunque no sea pública — el futuro yo lo agradecerá
- **Tipo genérico**: Documentar con ejemplos concretos de uso
- **Endpoint con múltiples responses**: Documentar cada código de estado posible

## Errores frecuentes a evitar
- No documentar lo obvio (`// incrementa i en 1` es ruido)
- No generar JSDoc sin leer la implementación real
- No olvidar @throws cuando la función puede lanzar errores
- No copiar el nombre de la función como descripción

## Output esperado
Código con documentación JSDoc/TSDoc aplicada directamente. Para APIs, puede incluir un bloque Markdown con la referencia del endpoint.
