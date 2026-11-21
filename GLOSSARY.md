# Agent Manager Template

Template reutilizable que convierte a Claude Code en un equipo de agentes especializados con un pipeline de entrega con gates. Este glosario fija el vocabulario del proyecto; las reglas de negocio e invariantes viven en [.claude/rules/domain.md](.claude/rules/domain.md).

> Ojo: la palabra "agente" designa tres cosas distintas y no intercambiables — un rol de `.claude/agents/` (**Agente de equipo**), el agente de ejemplo de la API (**Agente de ejemplo**) y el asistente externo opcional (**Hermes Agent**).

## Sistema y CLI

**Agent Manager Template**:
El producto de este repositorio: setup de Claude Code más un ejemplo funcional de API con agente AI.
_Dónde_: `README.md`, `.claude/`
_Avoid_: boilerplate, scaffold, starter kit

**claudio**:
El CLI del template; instala el setup, verifica el entorno y gestiona Hermes, gstack, vault y auditorías.
_Dónde_: `src/cli/claudio.ts`, `bin/claudio.cjs`, `src/cli/catalog.ts`
_Avoid_: CLI de Claude, script de setup

**Modo template**:
Ruta de `claudio init` que se ejecuta dentro de este repo clonado: instala dependencias, crea `.env` y deja listo el servidor de ejemplo.
_Dónde_: `src/cli/commands/init.ts` (`runTemplateInit`)
_Avoid_: instalación local, modo desarrollo

**Instalación externa**:
Ruta de `claudio init` que copia `.claude/` en otro proyecto y genera su contexto de dominio.
_Dónde_: `src/cli/commands/init.ts`, `src/cli/commands/evoluciona.ts`
_Avoid_: deploy, migración

**Wizard**:
El flujo interactivo de `claudio evoluciona` que pregunta nombre, stack, dominio, prioridades y extras opcionales.
_Dónde_: `src/cli/commands/evoluciona.ts`
_Avoid_: instalador, setup

**doctor**:
El chequeo de entorno: Node 20+, `.claude/`, rutas MCP, permisos de hooks y `.env` del template.
_Dónde_: `src/cli/commands/doctor.ts`
_Avoid_: diagnóstico, health check del CLI

## Pipeline de equipos

**Feature**:
La unidad de trabajo (feature, bugfix o refactor) que atraviesa el pipeline completo.
_Dónde_: `.claude/rules/orchestration.md`, `.claude/logs/pipeline-state.json`
_Avoid_: ticket, tarea, ítem, issue

**feature-id**:
El identificador único de una feature; se usa como carpeta de reportes y como clave en el estado del pipeline.
_Dónde_: `.claude/logs/audits/features/{feature-id}/`
_Avoid_: ticket-id, slug suelto

**Pipeline de equipos**:
La secuencia obligatoria de fases 1 a 7 (con la sub-fase 6.5 de DevOps) donde cada equipo entrega un reporte y un veredicto antes de habilitar al siguiente.
_Dónde_: `.claude/rules/orchestration.md`, `docs/REFERENCE.md`
_Avoid_: workflow, proceso, flujo de trabajo

**Fase**:
Uno de los puntos de control numerados del pipeline de equipos; no se saltea ninguna.
_Dónde_: `.claude/rules/orchestration.md`
_Avoid_: paso, etapa

**Equipo**:
El grupo de agentes responsable de una fase (Diseño, Backend, Seguridad, Develop, QA, DevOps, Producción).
_Dónde_: `.claude/rules/orchestration.md`
_Avoid_: squad, área

**Gate**:
El criterio de salida verificable de una fase; en los loops es además un comando objetivo (test, build, lint, type check) que puede rechazar el trabajo.
_Dónde_: `.claude/rules/orchestration.md`, `docs/LOOP-GATES.md`
_Avoid_: checkpoint, revisión, aprobación informal

**Veredicto**:
El resultado formal de un gate: `APROBADO` o `BLOQUEADO` en las fases 1–6.5, y `GO` o `NO-GO` en Producción.
_Dónde_: `.claude/rules/orchestration.md`
_Avoid_: status, resultado, PASS/FAIL, BLOCKED, GO_WITH_NOTES

**Rebote**:
El retorno de una feature a una fase anterior cuando un gate la bloquea; se reinicia desde la fase donde se originó el defecto.
_Dónde_: `.claude/rules/orchestration.md`
_Avoid_: rework, devolución, rollback

**Bloqueante**:
Un hallazgo de severidad suficiente para impedir el avance de fase (por ejemplo, un CRITICAL de seguridad sin mitigar).
_Dónde_: `.claude/rules/orchestration.md`
_Avoid_: bug grave, issue crítica

**Reporte de fase**:
El artefacto escrito que prueba que una fase se completó y con qué veredicto.
_Dónde_: `.claude/logs/audits/features/{feature-id}/fase{N}-{fecha}.md`
_Avoid_: resumen de chat, acta

**Estado del pipeline**:
El registro JSON de features, fase actual, equipo y veredictos; `status: "GO"` es la única condición para considerar una feature desplegable.
_Dónde_: `.claude/logs/pipeline-state.json`
_Avoid_: base de datos, tablero

**Orquestador principal**:
El rol que enruta la feature a cada equipo, verifica gates y autoriza transiciones; no implementa código salvo en la verificación de Producción.
_Dónde_: `.claude/agents/orchestrator.md`
_Avoid_: manager, coordinador, PM

## Agentes

**Agente de equipo**:
Un rol especializado con permisos y protocolo definidos, definido como archivo Markdown en `.claude/agents/`.
_Dónde_: `.claude/agents/*.md`
_Avoid_: bot, assistant, modelo

**Auditor lifecycle**:
Uno de los ocho roles `lifecycle-*-auditor` que evalúan el ciclo de vida del software por disciplina.
_Dónde_: `.claude/agents/lifecycle-*.md`
_Avoid_: revisor de fase, QA

**Agente experto**:
El rol que el Auto-Audit Loop activa según el tipo de archivo o cambio (por ejemplo `typescript-expert`, `qa-tester`).
_Dónde_: `.claude/skills/auto-audit-loop/SKILL.md`
_Avoid_: especialista, subagente

## Auditoría lifecycle

**Pipeline lifecycle de auditoría**:
El ciclo complementario de 8 fases (0 Intake a 7 Producción) con gates GO/NO-GO, independiente del pipeline de equipos.
_Dónde_: `docs/AUDIT_PIPELINE.md`, `docs/AUDIT_AGENTS.md`
_Avoid_: segundo pipeline de equipos, auditoría de código

**audit-pipeline**:
La skill que ejecuta el ciclo lifecycle completo con sus checklists y rúbricas.
_Dónde_: `.claude/skills/audit-pipeline/SKILL.md`
_Avoid_: /audit, auditoría genérica

**lifecycle-orchestrator**:
La skill que coordina transiciones, gates y rebotes del pipeline lifecycle.
_Dónde_: `.claude/skills/lifecycle-orchestrator/SKILL.md`
_Avoid_: orquestador principal

**auditor-agent-factory**:
La skill que genera o regenera los agentes `lifecycle-*`, los estándares y los checklists del proyecto.
_Dónde_: `.claude/skills/auditor-agent-factory/SKILL.md`
_Avoid_: generador de agentes genérico

## Skills, comandos y reglas

**Skill**:
Una carpeta con `SKILL.md` que se carga on-demand para aportar método o contexto; no es un comando ejecutable.
_Dónde_: `.agents/skills/`, `.claude/skills/`
_Avoid_: plugin, prompt, comando

**Bundle de skills**:
El conjunto versionado de skills de terceros (Vercel Agent Skills y Matt Pocock Skills) más las skills propias del template.
_Dónde_: `.agents/skills/`, `.claude/skills/`, `skills-lock.json`
_Avoid_: marketplace, librería

**Comando slash**:
Un atajo definido en Markdown que se invoca dentro de Claude Code con `/nombre`.
_Dónde_: `.claude/commands/`
_Avoid_: comando CLI, script, alias

**12-Rule Standard**:
Las doce reglas de comportamiento del agente (pensar antes de codificar, cambios quirúrgicos, presupuesto de tokens, fallar en voz alta).
_Dónde_: `.claude/CLAUDE.md`
_Avoid_: guidelines, convenciones

**Regla de dominio**:
La regla del proyecto sobre terminología, invariantes, KPIs y datos sensibles; se complementa con este glosario.
_Dónde_: `.claude/rules/domain.md`
_Avoid_: glosario (son cosas distintas)

**Ciclo de tareas**:
El orden obligatorio de skills mattpocock que se carga antes de planificar o implementar una tarea.
_Dónde_: `.claude/rules/mattpocock-task-cycle.md`, `.claude/skills/skill-mattpocock-cycle/SKILL.md`
_Avoid_: workflow de skills, pipeline

**Harness**:
El conjunto de reglas, hooks y mediciones que vigilan el trabajo del agente (cumplimiento 12-Rule, presupuesto de tokens, eficiencia por feature).
_Dónde_: `.claude/agents/harness-engineer.md`, `src/cli/commands/harness.ts`
_Avoid_: framework, runtime, herramienta

## Calidad y auditoría automática

**Hook**:
Un script que se ejecuta antes o después de una acción del agente para bloquear operaciones peligrosas o disparar verificaciones.
_Dónde_: `.claude/hooks/`
_Avoid_: middleware, trigger

**Auto-Audit Loop**:
El sistema que, tras cada edición, clasifica el cambio y activa los agentes expertos correspondientes, registrando hallazgos y gates.
_Dónde_: `.claude/skills/auto-audit-loop/SKILL.md`, `.claude/hooks/PostToolUse/03-auto-audit-trigger.sh`
_Avoid_: auditoría automática genérica, CI

**Disparador (trigger)**:
El evento que inicia un loop o una auditoría: edición de archivo, inicio de tarea, cron o PR.
_Dónde_: `.claude/skills/auto-audit-loop/SKILL.md`
_Avoid_: evento, webhook (son tipos de disparador)

**Clasificador**:
La pieza que decide qué agentes expertos activar según extensión, ruta, palabras clave del diff y tipo de tarea.
_Dónde_: `.claude/skills/auto-audit-loop/SKILL.md`
_Avoid_: router, selector

**Hallazgo**:
Un problema detectado por un agente experto, con severidad, archivo y estado (abierto o cerrado).
_Dónde_: `.claude/logs/auto-audit/STATE.md`
_Avoid_: bug, issue, warning

**Severidad**:
La escala de un hallazgo: `CRITICAL`, `HIGH`, `MEDIUM` o `LOW`; CRITICAL bloquea la continuidad.
_Dónde_: `.claude/skills/auto-audit-loop/SKILL.md`, `.claude/rules/security.md`
_Avoid_: prioridad, nivel

**Loop**:
Un sistema automatizado que encuentra trabajo, se lo da al agente, verifica el resultado con un gate y registra el estado.
_Dónde_: `docs/LOOP-ENGINEERING.md`
_Avoid_: automatización, cron

**Test de 4 condiciones**:
El filtro previo a construir un loop: tarea repetida, verificación automatizada, presupuesto de tokens y herramientas de senior.
_Dónde_: `docs/LOOP-ENGINEERING.md`
_Avoid_: checklist, criterios de aceptación

**Hard stop**:
El límite duro de un loop (tokens, iteraciones, tiempo o costo) que impide que corra indefinidamente.
_Dónde_: `docs/LOOP-GATES.md`
_Avoid_: timeout, límite

**State file**:
El archivo que persiste qué hizo el loop y qué falta, para que cada ejecución retome en vez de reiniciar.
_Dónde_: `docs/templates/STATE.md`, `.claude/logs/auto-audit/STATE.md`
_Avoid_: memoria, log

**Maker-checker**:
La separación entre quien produce el cambio (maker) y quien lo verifica (checker), para evitar que un agente apruebe su propio trabajo.
_Dónde_: `docs/LOOP-GATES.md`
_Avoid_: revisión, code review

**HTML-First**:
La regla de entregar como HTML autocontenido todo artefacto que un humano va a leer (reporte, spec, auditoría, diagrama).
_Dónde_: `.claude/rules/html-first.md`, `docs/flows/`
_Avoid_: reporte Markdown, output

**Presupuesto de tokens**:
El límite de consumo por tarea y por sesión que obliga a resumir antes de desbordar.
_Dónde_: `.claude/CLAUDE.md` (Rule 6)
_Avoid_: cuota, límite de contexto

**Checkpoint**:
El resumen de sesión con formato DONE / VERIFIED / NEXT / RISKS que permite retomar el trabajo.
_Dónde_: `.claude/logs/checkpoints/`, comando `/checkpoint`
_Avoid_: gate, commit, backup

**Handoff**:
El documento de traspaso de contexto entre fases, sesiones o agentes.
_Dónde_: `.claude/logs/handoffs/`, comando `/handoff`
_Avoid_: traspaso informal, resumen

## Hermes y Obsidian

**Hermes Agent**:
El asistente externo opcional de NousResearch que usa un vault Obsidian como base de conocimiento entre proyectos.
_Dónde_: `src/cli/commands/hermes.ts`
_Avoid_: agente de equipo, Claude

**SOUL.md**:
La identidad fija de Hermes; se inyecta como primer slot de cada system prompt y no se sobrescribe.
_Dónde_: `.claude/hermes/SOUL.md`, `~/.hermes/SOUL.md`
_Avoid_: system prompt, persona

**Memoria Tier 1**:
La memoria compacta de Hermes inyectada en cada prompt: `MEMORY.md` (proyecto) y `USER.md` (desarrollador).
_Dónde_: `~/.hermes/memories/MEMORY.md`, `~/.hermes/memories/USER.md`
_Avoid_: memoria persistente, contexto

**Perfil**:
Una identidad Hermes independiente (`main` o con nombre propio) con su propia memoria y skills.
_Dónde_: `~/.hermes/`, `~/.hermes/profiles/`
_Avoid_: usuario, cuenta

**GEPA**:
El método de auto-evolución de skills de Hermes que propone variantes mejoradas a partir de trazas, sin sobrescribir el original.
_Dónde_: `src/cli/commands/hermes.ts` (`runHermesGepa`)
_Avoid_: fine-tuning, entrenamiento

**Hermes MCP**:
La conexión opcional de Claude Code a un servidor Hermes por SSE/HTTP o por proceso local (stdio).
_Dónde_: `src/cli/utils/installer.ts`, `.claude/settings.json`
_Avoid_: integración, plugin

**Vault**:
La carpeta `obsidian/` usada como memoria extendida en notas Markdown enlazadas.
_Dónde_: `obsidian/`, `src/cli/commands/vault.ts`
_Avoid_: wiki, knowledge base

**h-level**:
El nivel jerárquico de una nota del vault declarado en su frontmatter, que fija su presupuesto de tokens.
_Dónde_: `src/cli/commands/vault.ts`
_Avoid_: prioridad, nivel

**Nota huérfana**:
Una nota sin backlinks entrantes (se exceptúan las de nivel 1), señal de que el vault está desorganizado.
_Dónde_: `src/cli/commands/vault.ts`
_Avoid_: nota suelta, sin enlaces

**Enlace roto**:
Un wikilink que apunta a una nota inexistente del vault.
_Dónde_: `src/cli/commands/vault.ts`
_Avoid_: link inválido, enlace muerto

**Vault Health Report**:
El reporte de métricas del vault (notas, tokens, huérfanas, enlaces rotos, eficiencia).
_Dónde_: `.claude/logs/vault-health-report.md`
_Avoid_: auditoría del vault, reporte de notas

**gstack**:
La suite externa de Garry Tan que complementa el template con review, QA en browser, ship y planificación estratégica.
_Dónde_: `src/cli/commands/gstack.ts`, `~/.claude/skills/gstack/`
_Avoid_: stack, toolkit

## Agente de ejemplo (API)

**Agente de ejemplo**:
El asistente `Assistant` (`gpt-4o-mini`) que demuestra el bucle de chat con tools en la API de muestra.
_Dónde_: `src/services/agent-service.ts` (`DEFAULT_AGENT`)
_Avoid_: agente de equipo, Hermes Agent

**Tool**:
Una capacidad invocable por el agente, con nombre, descripción, schema Zod y función de ejecución.
_Dónde_: `src/types/index.ts`, `src/tools/`
_Avoid_: función, helper, utility

**ToolResult**:
El resultado normalizado de una tool: `success`, `data` y `error` opcional.
_Dónde_: `src/types/index.ts`
_Avoid_: respuesta, output

**Conversation**:
El historial de mensajes asociado a un `conversationId` (por defecto el `agentId`), que se conserva en memoria.
_Dónde_: `src/services/agent-service.ts`
_Avoid_: chat, sesión, thread

**AgentService**:
El servicio que mantiene conversaciones, arma el prompt, ejecuta tools y devuelve la respuesta con las tools usadas.
_Dónde_: `src/services/agent-service.ts`
_Avoid_: controlador, repositorio

**Endpoint de chat**:
`POST /api/v1/agents/chat`, que valida `message` y `agentId` con Zod y devuelve `{ success, data }`.
_Dónde_: `src/routes/agent-routes.ts`, `src/index.ts`
_Avoid_: webhook, mensajería

**Health check**:
`GET /api/v1/health`, la sonda que confirma que el servidor responde.
_Dónde_: `src/routes/health-routes.ts`
_Avoid_: ping, heartbeat
