# Tasks

## Critico (bloquea todo lo demas)
- [ ] Inicializar package.json con dependencias base — Estimacion: 0.5h — Dependencias: ninguna
- [ ] Configurar TypeScript (tsconfig.json) — Estimacion: 0.5h — Dependencias: package.json
- [ ] Crear punto de entrada src/index.ts con Fastify — Estimacion: 1h — Dependencias: tsconfig.json
- [ ] Configurar Vitest — Estimacion: 0.5h — Dependencias: package.json
- [ ] Crear .env.example con variables necesarias — Estimacion: 0.25h — Dependencias: ninguna

## Alta prioridad
- [ ] Implementar Agent Service (loop basico con OpenAI SDK) — Estimacion: 3h — Dependencias: punto de entrada
- [ ] Implementar Tool interface y tool registry — Estimacion: 2h — Dependencias: Agent Service
- [ ] Crear tools de ejemplo (calculator, datetime) — Estimacion: 1h — Dependencias: Tool interface
- [ ] Crear endpoint POST /api/v1/agents/chat — Estimacion: 2h — Dependencias: Agent Service
- [ ] Crear endpoint GET /api/v1/health — Estimacion: 0.5h — Dependencias: punto de entrada
- [ ] Configurar ESLint + Prettier — Estimacion: 0.5h — Dependencias: package.json

## Normal
- [ ] Implementar schemas Zod para validacion — Estimacion: 1.5h — Dependencias: endpoints
- [ ] Crear error handler centralizado — Estimacion: 1h — Dependencias: punto de entrada
- [ ] Agregar logging estructurado — Estimacion: 1h — Dependencias: error handler
- [ ] Tests unitarios para Agent Service — Estimacion: 2h — Dependencias: Agent Service
- [ ] Tests unitarios para Tools — Estimacion: 1h — Dependencias: tools de ejemplo
- [ ] Tests de integracion para endpoints — Estimacion: 2h — Dependencias: endpoints
- [ ] README.md completo — Estimacion: 1h — Dependencias: todos los anteriores
- [ ] Crear .gitignore apropiado — Estimacion: 0.25h — Dependencias: ninguna

## Deuda tecnica / Nice to have
- [ ] Configurar CI/CD con GitHub Actions — Estimacion: 2h — Dependencias: tests
- [ ] Agregar tool de busqueda web — Estimacion: 1.5h — Dependencias: Tool interface
- [ ] Implementar memoria persistente — Estimacion: 3h — Dependencias: Agent Service
- [ ] Configurar Vercel deploy — Estimacion: 1h — Dependencias: CI/CD
- [ ] Agregar Dockerfile para desarrollo local — Estimacion: 1h — Dependencias: infraestructura base
- [ ] Documentacion OpenAPI/Swagger — Estimacion: 2h — Dependencias: todos los endpoints
