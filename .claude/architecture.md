# Architecture — Agent Manager Template

## Diagrama del Sistema

```
┌─────────────────────────────────────────────────┐
│                    Cliente                       │
│            (HTTP / WebSocket / CLI)              │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│              API Layer (Fastify)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Routes   │ │Middleware│ │  Error Handler   │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
└───────┼─────────────┼───────────────┼───────────┘
        │             │               │
        ▼             ▼               ▼
┌─────────────────────────────────────────────────┐
│              Services Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Agent Svc│ │ Tool Svc │ │  Memory Svc      │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
└───────┼─────────────┼───────────────┼───────────┘
        │             │               │
        ▼             ▼               ▼
┌─────────────────────────────────────────────────┐
│              External Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │OpenAI/API│ │Tools/Exec│ │  Vector Store/DB │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Capas del Sistema

1. **API Layer**: Fastify con validación de schemas. Recibe requests, las valida y delega al service correspondiente.
2. **Services Layer**: Lógica de negocio. Agent Service maneja el ciclo de vida de agentes AI, Tool Service registra y ejecuta herramientas, Memory Service gestiona contexto persistente.
3. **External Layer**: Integraciones con APIs externas (OpenAI/Anthropic), ejecución de tools, almacenamiento.

## Flujo de Datos Principal

```
Request → Route → Validate Schema → Service → Agent → Tool Execution → Response
                                                    ↓
                                              Memory Update
```

1. Cliente envía mensaje al endpoint del agente
2. Route valida el input con Zod schema
3. Agent Service recupera contexto del agente (memoria)
4. Agent Service envía mensaje + contexto al LLM (OpenAI/Anthropic)
5. Si el LLM decide usar una tool, se ejecuta y el resultado se envía de vuelta
6. Se actualiza la memoria del agente
7. Se retorna la respuesta al cliente

## Decisiones de Diseño

| Decisión | Justificación | Alternativa descartada |
|----------|---------------|----------------------|
| Fastify sobre Express | Mejor rendimiento, schema validation nativa | Express: más lento, sin validación nativa |
| Vitest sobre Jest | Más rápido, soporte ESM/TS nativo | Jest: requiere config extra para TS |
| Zod para validación | Runtime + type inference en un solo lugar | Joi: sin inferencia de tipos |
| Services pattern | Separa lógica de negocio del transporte | Controllers directos: difícil de testear |

## Plantilla para Nuevos Proyectos

Este template está diseñado para ser adaptable. Para usarlo en otro tipo de proyecto:
- **API REST**: Mantener las capas, ajustar los services
- **Web App**: Agregar frontend layer (React/Next.js)
- **CLI Tool**: Reemplazar API Layer por CLI parser (Commander)
- **Scraper**: Reemplazar Agent por Scraper service con Puppeteer/Playwright
- **Microservicio**: Mantener estructura, agregar communication layer (message queue)
