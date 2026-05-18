# Agent Manager Template

> Template reutilizable para inicializar proyectos con Claude Code, con un ejemplo funcional de AI Agent.

## Que hace?

Provee una configuracion completa de Agent Manager que puedes copiar a cualquier proyecto nuevo:
- Configuracion de `.claude/` (hooks, MCPs, skills, documentacion)
- Estructura de proyecto Node.js + TypeScript lista para usar
- Ejemplo funcional de AI Agent con tools, memoria y API REST
- Tests unitarios, de integracion y E2E configurados
- CI/CD pipeline con GitHub Actions

## Requisitos

- Node.js 20+
- npm 10+
- Una API key de OpenAI (para el ejemplo de AI Agent)

## Instalacion rapida

```bash
# Clonar o copiar el template
git clone <repo-url> mi-proyecto
cd mi-proyecto

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu OPENAI_API_KEY

# Verificar que funciona
npm run dev
```

## Configuracion

### Variables de entorno

Copia `.env.example` a `.env` y configura:

| Variable | Descripcion | Requerida |
|----------|-------------|-----------|
| `NODE_ENV` | development / production / test | Si |
| `PORT` | Puerto del servidor (default: 3000) | No |
| `OPENAI_API_KEY` | API key de OpenAI | Si (para AI) |
| `LOG_LEVEL` | debug / info / warn / error | No |
| `RATE_LIMIT_MAX` | Max requests por ventana | No |
| `RATE_LIMIT_WINDOW` | Ventana de rate limit (ms) | No |

### Estructura del proyecto

```
agent-manager-template/
├── .claude/          # Configuracion de Claude Code
├── src/
│   ├── config/       # Configuracion de la app
│   ├── agents/       # (Futuro) Definicion de agentes
│   ├── tools/        # Tools disponibles para el agente
│   ├── middleware/    # Middleware de Fastify
│   ├── routes/       # Rutas de la API
│   ├── services/     # Logica de negocio
│   ├── utils/        # Utilidades compartidas
│   └── types/        # Tipos TypeScript
├── tests/
│   ├── unit/         # Tests unitarios
│   ├── integration/  # Tests de integracion
│   └── e2e/          # Tests end-to-end
└── docs/             # Documentacion
```

## Uso

### Desarrollo

```bash
npm run dev          # Inicia con hot-reload en http://localhost:3000
```

### API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/agents/chat` | Enviar mensaje al agente |
| GET | `/api/v1/agents` | Listar agentes disponibles |

#### Ejemplo: Chat con el agente

```bash
curl -X POST http://localhost:3000/api/v1/agents/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 25 * 37?"}'
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "response": "25 * 37 = 925",
    "toolsUsed": ["calculator"]
  }
}
```

### Testing

```bash
npm test             # Todos los tests
npm run test:unit    # Solo unitarios
npm run test:int     # Solo integracion
npm run test:watch   # Mode watch
npm run test:coverage # Con coverage
```

### Build

```bash
npm run build        # Compilar TypeScript
npm start            # Ejecutar en produccion
```

## Arquitectura

```
Cliente → API (Fastify) → Services → Agent (OpenAI) → Tools
                                    → Memory
```

Ver [`.claude/architecture.md`](.claude/architecture.md) para detalles completos.

## Deploy (Vercel)

1. Conectar repo a Vercel
2. Configurar environment variables en el dashboard
3. Push a `main` deploya automaticamente

## Usar el template para un nuevo proyecto

1. Copiar el directorio `.claude/` completo a tu nuevo proyecto
2. Adaptar `CLAUDE.md`, `context.md` y `architecture.md` al nuevo stack
3. Ajustar `settings.json` (hooks, MCPs) segun necesidades
4. Los skills son generales y sirven para cualquier proyecto

## Licencia

MIT
