# Skill: Testing

## Propósito
Crear tests completos y bien estructurados usando Vitest (unit), Supertest (integration) o Playwright (e2e), según corresponda.

## Cuándo activar este skill
- El usuario pide "tests", "testing", "testear", "casos de prueba"
- Cuando dice "escribe tests para..." o "agrega tests a..."
- Cuando implementa una feature y faltan tests
- "Coverage" o "cobertura de tests"

## Cuándo NO usar este skill
- Cuando el usuario pide ejecutar tests existentes (usar Bash directamente)
- Cuando pide debuggear un test que falla (usar skill-debugging)

## Proceso paso a paso

### Paso 1: Identificar qué testear
Leer el código a testear completamente. Identificar:
- Funciones/métodos públicos
- Casos happy path
- Casos edge y error
- Dependencias que necesiten mock

### Paso 2: Determinar nivel de test
- **Unit**: Para funciones puras, servicios con dependencias mockeadas
- **Integration**: Para flujos que cruzan capas (route → service → external)
- **E2E**: Para flujos completos de usuario

### Paso 3: Estructurar el test
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('NombreDelModulo', () => {
  describe('nombreDeFuncion', () => {
    // Arrange
    beforeEach(() => { /* setup */ });

    it('should do X when Y', async () => {
      // Arrange
      const input = ...;
      // Act
      const result = await funcion(input);
      // Assert
      expect(result).toBe(expected);
    });

    it('should throw when invalid input', async () => {
      await expect(funcion(invalidInput)).rejects.toThrow('Error message');
    });
  });
});
```

### Paso 4: Casos mínimos a cubrir
1. Happy path (input válido → output esperado)
2. Input inválido (validación funciona)
3. Error de dependencia externa (manejo de errores)
4. Casos edge (valores límite, null, undefined, arrays vacíos)

### Paso 5: Mocks y stubs
- Solo mockear dependencias externas (DB, APIs, filesystem)
- Nunca mockear el módulo bajo test
- Usar `vi.fn()` para spies y `vi.mock()` para módulos
- Restaurar mocks en `afterEach` si es necesario

### Paso 6: Verificar
Ejecutar los tests y verificar que pasan: `npm run test:unit`

## Ejemplos

### Ejemplo de entrada:
"Escribe tests para el servicio de agent en src/services/agent.ts"

### Ejemplo de salida esperada:
Archivo en `tests/unit/services/agent.test.ts` con tests para todos los métodos públicos, con mocks de OpenAI y de la base de datos.

## Patrones comunes y cómo manejarlos
- **Función async**: Siempre usar async/await en tests, no .then()
- **Múltiples casos similares**: Usar `it.each()` para parametrizar
- **Setup complejo**: Extraer a helpers en `tests/helpers/`
- **Tests lentos**: Si un test tarda >100ms, probablemente debería ser integration, no unit

## Errores frecuentes a evitar
- No testear implementación interna (private methods) — testear comportamiento público
- No hacer asserts redundantes (testear lo mismo 3 veces de formas distintas)
- No olvidar limpiar estado entre tests (beforeEach/afterEach)
- No escribir tests frágiles que dependen de implementación específica

## Output esperado
Archivos de test en la ubicación correcta (tests/unit/, tests/integration/ o tests/e2e/), con nombre descriptivo, usando el patrón AAA (Arrange-Act-Assert), cubriendo happy path + errores + edge cases.
