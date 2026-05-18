# Skill: Agent Design

## Propósito
Disenar e implementar agentes AI con capacidades de tool use, memoria persistente y manejo de contexto.

## Cuándo activar este skill
- El usuario pide crear/modificar un agente AI
- "Agregar tools", "tool use", "function calling"
- "Memoria del agente", "context window", "system prompt"
- "Agente que pueda..."

## Cuándo NO usar este skill
- Cuando el usuario trabaja en infraestructura sin relacion con AI
- Cuando solo consume una API de AI sin comportamiento de agente

## Proceso paso a paso

### Paso 1: Definir el agente
Antes de codificar, responder:
- **Proposito**: Que hace este agente?
- **Tools**: Que acciones puede ejecutar?
- **Contexto**: Que informacion necesita para operar?
- **Limites**: Que NO debe hacer nunca?

### Paso 2: System Prompt
Disenar el system prompt con estructura clara:
```
Eres un agente especializado en [dominio].

## Capacidades
- [lista de capacidades con descripcion]

## Herramientas disponibles
- [tool_name]: [que hace y cuando usarla]

## Reglas
1. [regla de seguridad]
2. [regla de comportamiento]
3. [regla de formato de respuesta]

## Formato de respuesta
[especificar como debe responder el agente]
```

### Paso 3: Implementar Tools
Cada tool debe implementar:
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: z.ZodSchema;  // JSON Schema via Zod
  execute: (params: unknown) => Promise<ToolResult>;
}

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
```

### Paso 4: Loop de agente
```typescript
async function runAgentLoop(params: {
  messages: Message[];
  tools: Tool[];
  maxIterations: number;
}): Promise<Message[]> {
  const { messages, tools, maxIterations = 10 } = params;

  for (let i = 0; i < maxIterations; i++) {
    const response = await callLLM({ messages, tools });

    if (response.content.type === 'text') {
      return [...messages, response];
    }

    if (response.content.type === 'tool_use') {
      const toolResult = await executeTool(response.content);
      messages.push(response, toolResult);
      continue;
    }
  }

  throw new Error('Agent exceeded max iterations');
}
```

### Paso 5: Memoria
Implementar gestion de contexto:
- **Short-term**: Mensajes de la conversacion actual
- **Summary**: Resumen de conversaciones anteriores cuando el contexto crece
- **Long-term**: Hechos/key-value store para informacion persistente

### Paso 6: Guardrails
- Validar todos los inputs antes de enviar al LLM
- Validar todos los outputs del LLM antes de usar
- Rate limiting por conversacion
- Timeout en ejecucion de tools
- Max iterations para prevenir loops infinitos

## Ejemplos

### Ejemplo de entrada:
"Crea un agente que pueda buscar en la web y generar resumenes"

### Ejemplo de salida esperada:
Definicion del agente con system prompt, tools de busqueda y generacion, manejo de memoria, tests unitarios para cada tool y para el loop del agente.

## Patrones comunes y como manejarlos
- **Context window overflow**: Implementar truncado inteligente o resumen automatico
- **Tool execution lenta**: Agregar timeout y retry con backoff
- **Alucinacion de tools**: Validar que la tool que el LLM quiere usar realmente existe
- **Multi-agente**: Cada agente con su propio system prompt y tools, orquestados por un router

## Errores frecuentes a evitar
- No enviar el system prompt completo en cada llamada
- No ejecutar tools sin validar parametros primero
- No confiar ciegamente en la salida del LLM — siempre sanitizar
- No olvidar limites de iteracion para prevenir loops infinitos
- No hardcodear el modelo — hacerlo configurable

## Output esperado
Archivos de definicion del agente, implementacion de tools con validacion Zod, loop de agente con guardrails, y tests que verifican el comportamiento esperado con respuestas mock del LLM.
