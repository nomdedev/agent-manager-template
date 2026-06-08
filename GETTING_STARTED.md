# Empezar en 5 minutos

Guía mínima para quien adquiere este repositorio. La documentación completa está en [README.md](README.md) y [docs/REFERENCE.md](docs/REFERENCE.md).

## Prerrequisitos

- Node.js 20+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) instalado
- pnpm (recomendado) o npm

## Opción A: Usar este repo como base

```bash
git clone https://github.com/nomdedev/agent-manager-template
cd agent-manager-template
pnpm setup          # o: pnpm run claudio init
claudio doctor
pnpm dev            # http://localhost:3000
```

1. Completá `OPENAI_API_KEY` en `.env` si vas a probar el agente de ejemplo.
2. Abrí el proyecto en **Claude Code**.
3. Probá `/plan` con una feature pequeña.

## Opción B: Instalar en tu proyecto existente

```bash
# Desde este repo (desarrollo) o con el CLI global:
npm install -g agent-manager-template

claudio init ./mi-proyecto --yes
cd mi-proyecto
claudio doctor
# Lifecycle audit: /audit-pipeline · docs/AUDIT_PIPELINE.md
```

El wizard genera automáticamente:

- `.claude/` (agentes, comandos, hooks, skills)
- `.agents/skills/` (29 skills mattpocock — `pnpm run skills:install`)
- `docs/agents/` + `CONTEXT.md` (config para el ciclo de tareas)
- `.claude/context.md`, `architecture.md`, `memory.md`
- `.claude/rules/domain.md` personalizado para tu dominio

Flags útiles:

| Flag | Efecto |
|------|--------|
| `--yes` | Defaults: stack Node, sin Obsidian ni Hermes |
| `--minimal` | Igual que `--yes` para extras opcionales |

## Menú interactivo

Sin argumentos, `claudio` abre un menú que explica cada opción:

```bash
claudio          # menú guiado (terminal interactiva)
claudio guia     # qué hace pipeline, agentes, hooks, etc.
claudio init     # sub-menú según tu situación
```

En CI o pipes: `CLAUDIO_NO_MENU=1 claudio` muestra la ayuda en texto.

## Verificar el setup

```bash
claudio doctor
```

Deberías ver checks en verde (✓) para Node, `.claude/`, MCP paths y hooks.

## Primeros pasos en Claude Code

1. Abrí el proyecto en Claude Code.
2. Leé `.claude/context.md` (ya generado con tu stack).
3. Ejecutá `/plan` para planificar una feature.
4. Seguí el pipeline en `.claude/rules/orchestration.md` cuando quieras rigor de equipo.

## Opcional (avanzado)

gstack (review, QA, ship), Obsidian, Hermes Agent → [docs/ADVANCED.md](docs/ADVANCED.md)

## Problemas frecuentes

Ver [.claude/troubleshooting.md](.claude/troubleshooting.md) o ejecutá `claudio doctor`.
