# Resumen del proyecto

Agent Manager Template es un template reutilizable para inicializar proyectos con Claude Code.

## Objetivo

Proveer una base operativa con:

- CLI para instalar setup reutilizable
- configuracion .claude completa
- hooks y reglas de seguridad y calidad
- skills y comandos para un pipeline de trabajo disciplinado
- ejemplo funcional de agente con Node.js y TypeScript

## Componentes clave

- claudio evoluciona: instala el setup reutilizable en un proyecto
- claudio hermes: instala, inicializa y sincroniza Hermes Agent
- obsidian/: memoria extendida del proyecto
- .claude/: configuracion operativa de agentes

## Uso esperado de Hermes

Hermes debe usar este vault como fuente de contexto humano, convenciones y decisiones del proyecto. Las notas nuevas deben mantenerse concisas y faciles de consultar.