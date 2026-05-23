# Stack tecnologico

## Core
| Componente | Tecnologia | Version |
|------------|-----------|---------|
| Runtime | Node.js | 20+ |
| Lenguaje | TypeScript | 5.x |
| Modulos | ESM nativo | — |

## Backend
| Componente | Tecnologia | Uso |
|------------|-----------|-----|
| Framework | Fastify | API HTTP |
| Validacion | Zod | Schemas runtime + types |
| Config | dotenv | Variables locales |

## Tooling
| Componente | Tecnologia | Uso |
|------------|-----------|-----|
| Runner dev | tsx | Ejecutar TS sin build |
| Lint | ESLint | Calidad de codigo |
| Format | Prettier | Formato consistente |
| Log | pino + pino-pretty | Logging estructurado |

## Testing
| Nivel | Herramienta | Uso |
|-------|-------------|-----|
| Unit | Vitest | Logica aislada |
| Integration | Vitest + Supertest | Endpoints HTTP |
| E2E | (estructura lista) | Flujos completos |

## Deploy
| Plataforma | Config |
|------------|--------|
| Vercel | Serverless Functions |

## Agentes / Memoria
| Componente | Ubicacion |
|------------|-----------|
| Config agentes | .claude/ |
| Memoria extendida | obsidian/ |
| CLI setup | claudio |

## Comandos esenciales
```bash
npm install          # deps
npm run dev          # hot-reload
npm run build        # compilar
npm run lint         # eslint
npm run lint:fix     # eslint --fix
npm run format       # prettier
npm test             # todos los tests
npm run test:unit    # solo unit
npm run test:int     # solo integration
npm run test:e2e     # solo e2e
npm run test:watch   # modo watch
npm run typecheck    # tsc --noEmit
```
