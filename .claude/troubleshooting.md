# Troubleshooting — Agent Manager Template

## Errores de Instalación

### `npm install` falla
- **Síntoma:** Error de permisos o dependencias
- **Solución:** Verificar que Node.js 20+ esté instalado (`node --version`). Si hay error de permisos en Windows, ejecutar terminal como administrador.

### TypeScript no compila
- **Síntoma:** `error TS2307: Cannot find module '@/...'`
- **Solución:** Verificar que `tsconfig.json` tenga los path aliases configurados y que `@tsconfig/node20` esté instalado.

## Errores de Configuración

### Variables de entorno faltantes
- **Síntoma:** `Error: OPENAI_API_KEY is required`
- **Solución:** Copiar `.env.example` a `.env` y completar los valores.

### MCPs no conectan
- **Síntoma:** Herramientas MCP no aparecen disponibles
- **Solución:** Verificar que los paquetes MCP estén instalados globalmente con `npx`.

## Errores en Runtime

### Puerto en uso
- **Síntoma:** `EADDRINUSE: address already in use :::3000`
- **Solución:** Cambiar PORT en `.env` o matar el proceso en ese puerto.

### Rate limit de API
- **Síntoma:** `429 Too Many Requests` de OpenAI/Anthropic
- **Solución:** Implementar retry con backoff exponencial. Verificar rate limits del plan.

## Preguntas Frecuentes

### ¿Cómo agregar un nuevo tool para el agente?
1. Crear archivo en `src/tools/` implementando la interfaz `Tool`
2. Registrar el tool en `src/tools/index.ts`
3. Agregar tests en `tests/unit/tools/`

### ¿Cómo cambiar el modelo de AI?
Modificar la variable `AI_MODEL` en `.env` o en `src/config/ai.ts`.

### ¿Cómo deployar en Vercel?
1. Conectar repo a Vercel
2. Configurar environment variables en el dashboard
3. El `vercel.json` ya está configurado para Serverless Functions
