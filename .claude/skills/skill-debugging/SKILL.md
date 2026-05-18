# Skill: Debugging

## Propósito
Diagnosticar y resolver bugs de forma sistemática, desde la reproducción hasta la verificación del fix.

## Cuándo activar este skill
- El usuario reporta un bug, error, o comportamiento inesperado
- Cuando un test falla y no es obvio por qué
- "No funciona", "falla", "crashea", "error en..."
- "Debuggea esto", "investiga este error"

## Cuándo NO usar este skill
- Cuando el usuario pide code review (usar skill-code-review)
- Cuando el error es de sintaxis obvious (corregir directamente)

## Proceso paso a paso

### Paso 1: Reproducir el error
- Obtener el error exacto: mensaje, stack trace, código de estado
- Reproducir localmente si es posible
- Identificar las condiciones exactas que lo provocan

### Paso 2: Analizar el stack trace
- Leer el stack trace de arriba hacia abajo
- Identificar el primer frame que está en nuestro código
- Leer el archivo y la línea específica

### Paso 3: Formular hipótesis
Antes de cambiar nada, escribir hipótesis:
```
HIPÓTESIS 1: [descripción] → [cómo verificar]
HIPÓTESIS 2: [descripción] → [cómo verificar]
HIPÓTESIS 3: [descripción] → [cómo verificar]
```
Empezar por la hipótesis más probable.

### Paso 4: Verificar hipótesis
- Leer el código relevante
- Agregar logs temporales si es necesario (ELIMINAR después)
- Verificar estado de variables en el punto del error
- Si la hipótesis es correcta → proceder al fix. Si no → siguiente hipótesis.

### Paso 5: Implementar fix
- Hacer el cambio mínimo necesario para corregir el bug
- No refactorizar mientras se corrige (hacerlo por separado)
- Agregar un test que reproduzca el bug antes del fix (test debe fallar)
- Aplicar el fix (test debe pasar)

### Paso 6: Verificar
- Ejecutar tests relevantes
- Verificar que no se rompió nada existente
- Confirmar con el usuario que el fix resuelve el problema

## Ejemplos

### Ejemplo de entrada:
"El endpoint /api/agent/chat devuelve 500 cuando envío un mensaje largo"

### Ejemplo de salida esperada:
Diagnóstico del problema, fix aplicado, test de regresión agregado.

## Patrones comunes y cómo manejarlos
- **Error silencioso (sin mensaje)**: Buscar catch vacíos o errores tragados
- **Error intermitente**: Probablemente race condition o estado compartido
- **Error solo en producción**: Comparar .env con .env.example, verificar variables de entorno
- **Error después de un deploy**: Hacer `git diff` entre la versión anterior y la actual

## Errores frecuentes a evitar
- No cambiar código sin haber identificado la causa raíz
- No agregar fixes especulativos ("a ver si esto lo arregla")
- No olvidar eliminar logs de debug temporales
- No corregir el síntoma sin entender el problema

## Output esperado
1. Diagnóstico claro: qué causaba el bug y por qué
2. Fix mínimo aplicado al código
3. Test de regresión que demuestra que el bug está corregido
4. Confirmación de que los tests existentes siguen pasando
