# Indice del Vault

Mapa de navegacion para IA y humanos.

## Contexto inmediato (leer primero)

| Que necesitas | Donde esta |
|---------------|-----------|
| Reglas del proyecto | [[01-META/Reglas para agentes]] |
| Stack tecnologico | [[03-Estandares/Stack tecnologico]] |
| Convenciones de codigo | [[03-Estandares/Convenciones de codigo]] |
| Estado actual del proyecto | [[04-Contexto/Resumen del proyecto]] |
| Pipeline activo | [[04-Contexto/Pipeline activo]] |
| Ultimo analisis | [[04-Contexto/Ultimo analisis diario]] |
| Roadmap | [[04-Contexto/Roadmap]] |

## Agentes y equipos

| Rol | Descripcion | Prompt system |
|-----|-------------|---------------|
| Hunter Orchestrator | Orquestador principal | [[02-Agentes/Hunter Orchestrator]] |
| Team Leads | Agentes expertos por especialidad | [[02-Agentes/Team Leads]] |
| Domain Expert | Validar requerimientos | [[02-Agentes/Domain Expert]] |
| Architect | Disenar arquitectura | [[02-Agentes/Architect]] |
| Security Auditor | Auditar seguridad | [[02-Agentes/Security Auditor]] |
| Developer | Implementar codigo | [[02-Agentes/Developer]] |
| Reviewer | Code review | [[02-Agentes/Reviewer]] |
| Tester | QA y testing | [[02-Agentes/Tester]] |

## Flujo de trabajo

| Documento | Proposito |
|-----------|-----------|
| [[01-META/Flujo de trabajo]] | Plan fuerte → Ejecutar liviano → Verificar fuerte |
| [[01-META/Mapa de contexto]] | Sistema L0-L4 para optimizar tokens |

## Como usar este vault (para IA)

1. **Inicio de sesion**: Leer este indice + 01-META/Reglas para agentes
2. **Antes de una tarea**: Leer 04-Contexto/Resumen del proyecto + Pipeline activo
3. **Durante implementacion**: Consultar 03-Estandares para convenciones
4. **Al finalizar**: Actualizar 04-Contexto y crear entrada en 05-Analisis si hay decisiones nuevas
