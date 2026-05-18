# Memory — Agent Manager Template

## Decisiones de Arquitectura
- **Fastify** elegido sobre Express por rendimiento y schema validation nativa
- **Vitest** elegido sobre Jest por velocidad y compatibilidad nativa con ESM/TS
- **Zod** para validación de schemas compartido entre runtime y types
- **Deploy en Vercel** usando Serverless Functions

## Problemas Conocidos
- (Se documentarán según se encuentren)

## Deuda Técnica
- (Se documentará según se identifique)

## Log de Decisiones
- 2026-04-09: Inicio del proyecto — template reutilizable + ejemplo AI Agent
- 2026-04-09: Stack definido: Node.js + TypeScript + Fastify + Vitest

## Variables de Entorno Necesarias
| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NODE_ENV` | Entorno: development/production/test | Si |
| `PORT` | Puerto del servidor (default: 3000) | No |
| `OPENAI_API_KEY` | API key de OpenAI | Si (para AI features) |
| `ANTHROPIC_API_KEY` | API key de Anthropic | Si (para AI features) |
| `LOG_LEVEL` | Nivel de logging: debug/info/warn/error | No |

## Próximos Pasos
1. Completar implementación del AI Agent de ejemplo
2. Agregar más tools para el agente
3. Implementar sistema de memoria persistente
4. Agregar dashboard de monitoreo
