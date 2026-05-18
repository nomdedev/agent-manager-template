# Skill: API Design

## Propósito
Diseñar e implementar APIs RESTful consistentes, bien documentadas, con validación robusta y manejo de errores estandarizado.

## Cuándo activar este skill
- El usuario pide "crear endpoint", "nueva ruta", "API", "REST"
- Cuando diseña un nuevo servicio o módulo con endpoints
- "Diseñar API para...", "definir endpoints"

## Cuándo NO usar este skill
- Cuando solo quiere agregar una ruta simple que ya está diseñada
- Cuando está trabajando en el frontend consumiendo una API existente

## Proceso paso a paso

### Paso 1: Definir recursos
Identificar los recursos principales y sus relaciones. Usar sustantivos en plural para las rutas.

### Paso 2: Diseñar endpoints
Para cada recurso:
```
GET    /api/v1/recurso        — Listar (con paginación, filtros)
GET    /api/v1/recurso/:id    — Obtener uno
POST   /api/v1/recurso        — Crear
PUT    /api/v1/recurso/:id    — Reemplazar
PATCH  /api/v1/recurso/:id    — Actualizar parcialmente
DELETE /api/v1/recurso/:id    — Eliminar
```

### Paso 3: Definir schemas con Zod
Para cada endpoint, crear schemas de validación:
```typescript
import { z } from 'zod';

export const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus']),
  systemPrompt: z.string().max(4000).optional(),
  temperature: z.number().min(0).max(2).default(0.7),
});

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
```

### Paso 4: Estructurar la ruta (Fastify)
```typescript
import { FastifyInstance } from 'fastify';
import { CreateAgentSchema } from '@/types/schemas';

export async function agentRoutes(app: FastifyInstance) {
  app.post('/api/v1/agents', {
    schema: {
      body: CreateAgentSchema,
      response: {
        201: AgentResponseSchema,
        400: ErrorSchema,
      },
    },
  }, async (request, reply) => {
    // Delegate to service
  });
}
```

### Paso 5: Respuestas estandarizadas
```typescript
// Exito
{ success: true, data: {...}, meta?: { page, limit, total } }

// Error
{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }
```

### Paso 6: Codigos de estado HTTP correctos
- `200` OK — GET, PUT, PATCH exitosos
- `201` Created — POST exitoso
- `204` No Content — DELETE exitoso
- `400` Bad Request — Validacion fallida
- `401` Unauthorized — No autenticado
- `403` Forbidden — Sin permisos
- `404` Not Found — Recurso no existe
- `409` Conflict — Recurso ya existe
- `429` Too Many Requests — Rate limit
- `500` Internal Server Error — Error inesperado

## Ejemplos

### Ejemplo de entrada:
"Crea endpoints para gestionar agentes AI"

### Ejemplo de salida esperada:
Archivos de ruta, schemas Zod, service methods, y tests para CRUD completo de agentes.

## Patrones comunes y como manejarlos
- **Paginacion**: Usar `?page=1&limit=20` con metadata en response
- **Filtros**: `?status=active&search=term` convertir a query object
- **Versionado**: Prefijo `/api/v1/` para todas las rutas
- **Relaciones**: `GET /api/v1/agents/:id/tools` para sub-recursos

## Errores frecuentes a evitar
- No usar verbos en las URLs (`/getAgent` usar `/agents/:id`)
- No retornar 200 para todo (usar el codigo correcto)
- No exponer errores internos en las respuestas (sanitizar stack traces)
- No olvidar validacion de input en NINGUN endpoint

## Output esperado
Archivos de rutas con Fastify, schemas Zod para validacion, tipos TypeScript inferidos, y manejo de errores consistente. Cada endpoint debe tener su test de integracion.
