# Resumen del proyecto

Agent Manager Template — template reutilizable para inicializar proyectos con Claude Code.

## Objetivo

Proveer base operativa con:
- CLI para instalar setup reutilizable (`claudio`)
- Configuracion .claude completa (agentes, comandos, hooks, skills)
- Hooks y reglas de seguridad y calidad
- Pipeline de trabajo disciplinado (7 fases)
- Ejemplo funcional de agente AI (Node.js + TypeScript)

## Componentes clave

| Componente | Descripcion | Estado |
|------------|-------------|--------|
| `claudio` | CLI que instala setup en proyectos nuevos | Funcional |
| `claudio hermes` | Instala/inicializa/sincroniza Hermes Agent | Funcional |
| `obsidian/` | Memoria extendida del proyecto | En evolucion |
| `.claude/` | Configuracion operativa de agentes | Completo |

## Metricas actuales

| Metrica | Valor |
|---------|-------|
| Cobertura de tests | Pendiente de medicion |
| Dependencias con vulnerabilidades | Pendiente de auditoria |
| Documentacion de agentes | 7 agentes definidos |
| Pipeline implementado | 7 fases definidas, en uso |

## Uso esperado de Hermes

Hermes consume este vault como fuente de contexto humano, convenciones y decisiones. Las notas nuevas deben mantenerse concisas y faciles de consultar.

## Estado del dia

Ver [[Ultimo analisis diario]] para el analisis mas reciente.
