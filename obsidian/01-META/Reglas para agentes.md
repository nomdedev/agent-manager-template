# Reglas para agentes

## Principios fundamentales

1. Leer codigo antes de escribir codigo
2. Cambio minimo que resuelva el problema
3. No inventar contexto — vault y repo son fuente de verdad
4. Verificar con tests/lint/typecheck antes de declarar terminado
5. Registrar decisiones nuevas que vayan a repetirse

## Flujo de trabajo

1. Entender objetivo y modulo ancla
2. Revisar reglas y contexto antes de implementar
3. Ejecutar cambio minimo
4. Validar comportamiento afectado
5. Actualizar memoria si cambia una decision operativa

## Pipeline de 7 fases (obligatorio)

```
Domain -> Architecture -> Backend -> Security -> Develop -> QA -> Production
```

- Security aprueba antes de Develop
- QA aprueba antes de Production
- Cada fase produce artefacto en docs/audits/features/{id}/

## Estilo

- Conversacion en espanol
- Codigo, nombres tecnicos y comandos en ingles
- Sin abstracciones innecesarias
- Sin dependencias nuevas sin justificacion
- Sin `any` en TypeScript salvo ultima instancia

## Token efficiency

- Preferir links [[Nota]] sobre repeticion
- Usar tablas para datos estructurados
- Listas numeradas solo para secuencias ordenadas
- Ejemplos de codigo: solo el fragmento relevante, no archivos completos
