# Vision — [PROJECT_NAME]

> Este archivo se relee al inicio de cada run del loop.
> State le dice al agente dónde está. Vision le dice a dónde va.

---

## Objetivo de largo plazo
<!-- 1-2 oraciones. Qué es este proyecto y para qué existe. -->

## Norte del trimestre actual
<!-- Qué debería lograr el proyecto en los próximos 3 meses. -->

## Restricciones duras
<!-- Cosas que NUNCA debe hacer el agente, sin importar el contexto. -->

- No tocar auth/payments sin aprobación humana
- No deployar a producción sin gate de QA
- No modificar schema de DB sin migración reversible
- No instalar dependencias nuevas sin audit de seguridad

## Restricciones blandas
<!-- Preferencias que el agente debería seguir pero puede violar con justificación. -->

- Preferir TypeScript sobre JavaScript
- Tests antes que implementación (TDD)
- Commits atómicos con conventional commits
- PRs < 300 líneas de diff

## Anti-metas
<!-- Lo que explícitamente NO queremos. Evita goal drift. -->

- No queremos más frameworks — el stack actual es suficiente
- No queremos features que nadie pidió
- No queremos code que "queda lindo" pero no tiene tests

## Métricas de éxito
<!-- Cómo medimos si el loop está yendo en la dirección correcta. -->

- Costo por cambio aceptado < $X
- Accepted-change rate > 70%
- Time-to-merge < Y hours
- Test coverage > Z%

---

## Template de uso

```markdown
## Objetivo de largo plazo
Plataforma de análisis de inversiones para el mercado argentino,
con datos en tiempo real y recomendaciones personalizadas.

## Norte del trimestre Q2 2026
- Dashboard de terminal completamente funcional
- Integración con brokers locales (IOL, Balanz)
- Motor de recomendaciones con ML

## Restricciones duras
- CNV compliance obligatorio para features de inversión
- Datos de mercado no se cachean más de 5 minutos
- Sin hardcodear API keys ni secrets

## Anti-metas
- No replicar funcionalidades de TradingView desktop
- No construir chat social (no es el foco)
```
