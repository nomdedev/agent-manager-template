# Flujo de trabajo

## Principio fundamental

**Planear con agente fuerte → Ejecutar con agentes expertos livianos**

Esto minimiza el uso de tokens costosos en tareas repetitivas y maximiza la calidad en la planificacion.

## Ciclo de vida de una tarea

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: PLANIFICACION (Agente fuerte — razonamiento)       │
│  Modelo: Claude Sonnet / GPT-4 / Kimi K2.6                  │
│  Tarea: Entender, planificar, descomponer, definir success  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 2: EJECUCION (Agentes expertos — implementacion)      │
│  Modelos: GPT-4o-mini / Claude Haiku / modelos rapidos      │
│  Tarea: Implementar, testear, validar segun el plan         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 3: VERIFICACION (Agente fuerte — validacion)          │
│  Modelo: Claude Sonnet / GPT-4                              │
│  Tarea: Revisar, aprobar, o solicitar correcciones          │
└─────────────────────────────────────────────────────────────┘
```

## Reglas del flujo

1. **Nunca saltear la planificacion**: Incluso para fixes pequenos, al menos un parrafo de plan
2. **El plan es la fuente de verdad**: Los agentes de ejecucion siguen el plan, no improvisan
3. **Un solo agente fuerte por ciclo**: No usar multiples modelos costosos en paralelo
4. **Agentes livianos en paralelo**: Si hay subtareas independientes, ejecutar en paralelo
5. **Verificacion obligatoria**: Todo pasa por validacion antes de considerarse listo

## Pipeline de 7 fases aplicado

| Fase | Agente | Modelo sugerido | Tokens estimados |
|------|--------|----------------|------------------|
| 1. Domain | domain-expert | Fuerte | ~2,000 |
| 2. Architecture | architect | Fuerte | ~3,000 |
| 3. Backend | architect | Fuerte | ~2,500 |
| 4. Security | security-auditor | Fuerte | ~2,000 |
| 5. Develop | developer | Liviano | ~1,500 |
| 5. Review | reviewer | Liviano | ~1,000 |
| 6. QA | tester | Liviano | ~1,500 |
| 7. Production | orchestrator | Fuerte | ~1,000 |

**Total estimado**: ~14,500 tokens por feature completa
**Sin optimizacion**: ~30,000+ tokens

## Como implementar en Hermes

### Opcion A: Skills + delegate_task

1. Crear skill `plan-mode` para fase de planificacion
2. Crear skill `execute-mode` para fase de ejecucion
3. Usar `delegate_task` con modelos diferentes segun la fase

### Opcion B: Cron jobs + orquestador

1. Cron job diario que ejecuta analisis con modelo fuerte
2. Genera plan y lo guarda en vault
3. Agentes livianos ejecutan durante el dia
4. Al final del dia, modelo fuerte verifica

### Opcion C: Hybrid (recomendado)

1. **Inicio de dia**: Modelo fuerte analiza estado, genera plan, guarda en vault
2. **Durante el dia**: Modelos livianos ejecutan tareas del plan
3. **Fin de dia**: Modelo fuerte verifica, actualiza vault, planifica siguiente dia

## Vault como orquestador

El vault de Obsidian funciona como el "cerebro" que coordina:

- [[04-Contexto/Pipeline activo]] — Estado de features
- [[04-Contexto/Ultimo analisis diario]] — Decisiones y hallazgos
- [[04-Contexto/Roadmap]] — Proximas tareas
- [[05-Analisis/ADRs]] — Decisiones arquitectonicas

## Ejemplo de sesion

```
Usuario: "Quiero agregar autenticacion JWT"

Hermes (fuerte):
  1. Lee vault: contexto, estandares, stack
  2. Planifica: Fase 1-2 del pipeline
  3. Genera plan detallado con archivos, interfaces, tests
  4. Guarda plan en vault como feature

Hermes (liviano — developer):
  1. Lee plan del vault
  2. Implementa codigo segun especificacion
  3. Ejecuta tests
  4. Marca tarea como completada

Hermes (fuerte — orchestrator):
  1. Verifica implementacion vs plan
  2. Revisa calidad y convenciones
  3. Aprueba o solicita correcciones
  4. Actualiza vault con resultado
```
