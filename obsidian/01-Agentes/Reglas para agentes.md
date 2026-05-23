# Reglas para agentes

## Principios

1. Leer codigo antes de escribir codigo.
2. Hacer el cambio minimo que resuelva el problema.
3. No inventar contexto si el vault o el repo no lo contienen.
4. Verificar con tests, lint o typecheck antes de declarar terminado.
5. Registrar en el vault las decisiones nuevas que vayan a repetirse.

## Flujo recomendado

1. Entender el objetivo y el archivo o modulo ancla.
2. Revisar reglas y contexto antes de tocar implementacion.
3. Ejecutar el cambio minimo.
4. Validar el comportamiento afectado.
5. Actualizar memoria o documentacion si cambia una decision operativa.

## Pipeline

Para features, bugfixes o refactors que afecten logica, UI con estado, APIs o datos, usar el pipeline de 7 fases del proyecto:

Domain -> Architecture -> Backend -> Security -> Dev -> QA -> Production

Security debe aprobar antes de Dev.
QA debe aprobar antes de Production.

## Estilo de trabajo

- Conversacion en espanol.
- Codigo, nombres tecnicos y comandos en ingles cuando corresponda.
- Sin abstracciones innecesarias.
- Sin dependencias nuevas salvo justificacion clara.
- Sin any en TypeScript salvo ultima instancia y con justificacion.