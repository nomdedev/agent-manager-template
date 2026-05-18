# Context — Agent Manager Template

## Qué hace
Template reutilizable para inicializar proyectos con Claude Code. Incluye configuración completa (.claude/), hooks, MCPs, skills y un ejemplo funcional de AI Agent con Node.js + TypeScript.

## Punto de entrada
- Desarrollo: `src/index.ts`
- Build: `dist/index.js`

## Comandos principales
- `npm install` — instalar dependencias
- `npm run dev` — iniciar en modo desarrollo
- `npm test` — ejecutar tests
- `npm run build` — compilar para producción

## Advertencias
- NUNCA commitear `.env` — usar `.env.example` como template
- Los archivos en `src/config/` son sensibles — no modificar sin confirmación
- El proyecto usa path aliases (`@/`) — verificar tsconfig.json antes de mover imports
