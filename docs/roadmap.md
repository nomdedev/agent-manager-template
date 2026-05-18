# Roadmap — Agent Manager Template

## Version 0.1 — MVP (Semana 1-2)

### Objetivos
Proyecto funcional con AI Agent basico que pueda recibir mensajes, usar tools y responder.

### Features
- [x] Configuracion de .claude/ (hooks, MCPs, skills)
- [x] Estructura base del proyecto
- [ ] API basica con Fastify (health check, agent chat endpoint)
- [ ] Agente AI con OpenAI SDK (conversacion basica)
- [ ] 2-3 tools de ejemplo (calculadora, hora, busqueda web)
- [ ] Tests unitarios para services y tools
- [ ] README completo

### Criterios de aceptacion
- `npm run dev` arranca sin errores
- `npm test` pasa todos los tests
- El endpoint `/api/v1/agents/chat` responde correctamente
- El agente puede usar al menos 2 tools

---

## Version 0.2 — Core completo (Semana 3-4)

### Objetivos
Sistema robusto con memoria, multiples agentes y API completa.

### Features
- [ ] CRUD completo de agentes (crear, listar, obtener, eliminar)
- [ ] Sistema de memoria persistente (conversaciones)
- [ ] Mas tools: ejecucion de codigo, lectura de archivos
- [ ] Rate limiting y autenticacion basica
- [ ] Tests de integracion para todos los endpoints
- [ ] Logging estructurado (JSON)
- [ ] Manejo de errores centralizado

### Criterios de aceptacion
- Todos los endpoints tienen validacion y tests
- Las conversaciones persisten entre requests
- Rate limiting funcional
- Coverage > 80%

---

## Version 1.0 — Produccion

### Objetivos
Listo para produccion con deploy en Vercel.

### Features
- [ ] Multi-agente (router que despacha al agente correcto)
- [ ] Streaming de respuestas (SSE)
- [ ] Dashboard basico (monitoring de uso)
- [ ] CI/CD pipeline completo
- [ ] Documentacion de API (OpenAPI/Swagger)
- [ ] Tests E2E con Playwright
- [ ] Deploy en Vercel configurado y funcionando
- [ ] Variables de entorno seguras (Vercel env vars)

### Criterios de aceptacion
- Deploy automatico desde main
- Pipeline CI pasa 100%
- API documentada y accesible
- Monitoreo de errores funcional

---

## Backlog (post v1.0)
- [ ] Integracion con Anthropic Claude (ademas de OpenAI)
- [ ] Vector store para memoria semantica
- [ ] Webhook callbacks para tools async
- [ ] SDK cliente en npm
- [ ] Panel de administracion web
- [ ] Multi-tenancy
- [ ] Billing y usage tracking
