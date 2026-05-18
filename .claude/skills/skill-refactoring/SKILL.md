# Skill: Refactoring

## Propósito
Refactorizar código de forma segura: mejorar estructura, legibilidad y rendimiento sin cambiar comportamiento observable.

## Cuándo activar este skill
- El usuario pide "refactorizar", "refactor", "mejorar código", "limpiar código"
- Cuando dice "este código es feo/difícil de leer/repetitivo"
- "DRY", "SOLID", "extraer método", "simplificar"
- "Reduce complejidad", "divide esta función"

## Cuándo NO usar este skill
- Cuando el usuario quiere agregar funcionalidad nueva (implementar directamente)
- Cuando está corrigiendo un bug (usar skill-debugging)
- Cuando el código funciona y no hay una razón clara para cambiarlo

## Proceso paso a paso

### Paso 1: Verificar que hay tests
Si no hay tests que cubran el código a refactorizar, PRIMERO crear tests. Los tests son la red de seguridad.

### Paso 2: Identificar smells
Clasificar los problemas encontrados:
- **Duplicación**: Código repetido → extraer función/método
- **Función larga**: > 50 líneas → dividir en funciones más pequeñas
- **Parámetros muchos**: > 3 params → agrupar en objeto/options
- **Responsabilidad múltiple**: → separar en funciones/clases distintas
- **Acoplamiento**: → inyectar dependencias
- **Nombres confusos**: → renombrar

### Paso 3: Plan de refactoring
Listar los cambios en orden, de menor a mayor riesgo:
```
1. Renombrar variables/funciones (bajo riesgo)
2. Extraer funciones (bajo riesgo)
3. Reordenar parámetros (medio riesgo)
4. Mover lógica entre módulos (alto riesgo)
```

### Paso 4: Ejecutar paso a paso
Cada cambio debe ser:
1. Pequeño y atómico
2. Verificable (tests pasan después del cambio)
3. Sin cambiar comportamiento observable

### Paso 5: Verificar después de cada cambio
- Ejecutar tests relevantes
- Si algo falla, revertir y ajustar
- No acumular múltiples refactors sin verificar

### Paso 6: Limpieza final
- Eliminar código muerto
- Actualizar imports
- Verificar que los tests siguen pasando todos

## Ejemplos

### Ejemplo de entrada:
"Refactoriza el servicio de agent, tiene una función de 200 líneas"

### Ejemplo de salida esperada:
Función dividida en 4-5 funciones más pequeñas con nombres descriptivos, tests pasando.

## Patrones comunes y cómo manejarlos
- **Código que parece duplicado pero varía sutilmente**: Extraer la estructura común con parámetros para las variaciones
- **Refactoring grande que toca muchos archivos**: Dividir en PRs más pequeños
- **Código legacy sin tests**: PRIMERO agregar tests de caracterización (tests que documentan el comportamiento actual, incluso si es "incorrecto")

## Errores frecuentes a evitar
- No refactorizar sin tests que protejan contra regresiones
- No mezclar refactoring con cambios de funcionalidad
- No hacer cambios "porque sí" — cada refactor debe tener un propósito claro
- No renombrar cosas que ya tienen nombre establecido en el dominio

## Output esperado
Código refactorizado con mejor estructura, mismas funciones públicas con mismos comportamientos. Todos los tests pasando. Cambios documentados en el commit message.
