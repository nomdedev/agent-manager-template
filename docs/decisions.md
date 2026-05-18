# Decisiones de Arquitectura

## ADR-001: Fastify como framework HTTP
**Fecha:** 2026-04-09
**Estado:** Aceptado
**Contexto:** Se necesita un framework HTTP para exponer la API del agente AI. Express es el mas popular pero tiene rendimiento limitado y carece de validacion nativa.
**Decision:** Usar Fastify por su mejor rendimiento (2-3x mas rapido que Express), validacion de schemas nativa (JSON Schema), soporte TypeScript de primera clase y ecosistema de plugins maduro.
**Consecuencias:** Menor latencia en endpoints, validacion automatica de requests, necesidad de aprender la API de Fastify (similar a Express pero con diferencias).
**Alternativas descartadas:**
- Express: Mas lento, sin validacion nativa, ecosistema mas fragmentado
- Koa: Middleware con generators, ecosistema mas pequeno
- Hono: Excelente para edge/runtime pero ecosistema menos maduro

---

## ADR-002: Vitest como framework de testing
**Fecha:** 2026-04-09
**Estado:** Aceptado
**Contexto:** Se necesita un framework de testing que funcione bien con TypeScript y ESM.
**Decision:** Usar Vitest por su velocidad (usa Vite como bundler), compatibilidad nativa con TypeScript/ESM, API compatible con Jest y UI de observacion integrada.
**Consecuencias:** Tests mas rapidos, configuracion mas simple, migracion facil desde Jest si es necesario.
**Alternativas descartadas:**
- Jest: Mas lento, requiere config extra para TS/ESM, mas pesado
- Mocha: Requiere mas configuracion manual, menos features integradas

---

## ADR-003: Zod para validacion de schemas
**Fecha:** 2026-04-09
**Estado:** Aceptado
**Contexto:** Se necesita validar inputs en runtime y tener tipos TypeScript derivados de esos schemas.
**Decision:** Usar Zod como unica fuente de verdad para schemas. De cada schema se derivan los tipos TypeScript automaticamente.
**Consecuencias:** Un solo schema para validacion y tipos, menos codigo duplicado, mejor DX.
**Alternativas descartadas:**
- Joi: Sin inferencia de tipos
- Yup: Menos features, inferencia de tipos mas limitada
- io-ts: Curva de aprendizaje mas alta (fp-ts)

---

## ADR-004: Estructura por capas (routes → services → tools)
**Fecha:** 2026-04-09
**Estado:** Aceptado
**Contexto:** Se necesita organizar el codigo de forma que sea facil de testear, mantener y escalar.
**Decision:** Usar arquitectura en capas: Routes (HTTP) → Services (logica de negocio) → Tools/External (integraciones). Las capas superiores no conocen la implementacion de las inferiores.
**Consecuencias:** Cada capa se puede testear independientemente, facil de reemplazar implementaciones, clara separacion de responsabilidades.
**Alternativas descartadas:**
- Controllers directos: Acoplamiento entre HTTP y logica
- Hexagonal architecture: Over-engineering para el tamano del proyecto
- Modular por feature: Buena alternativa, pero requiere mas disciplina para mantener consistencia

---

## ADR-005: Deploy en Vercel con Serverless Functions
**Fecha:** 2026-04-09
**Estado:** Aceptado
**Contexto:** Se necesita un deploy simple y economico para el MVP.
**Decision:** Usar Vercel con Serverless Functions para la API. La configuracion esta en vercel.json.
**Consecuencias:** Deploy automatico desde Git, sin gestion de servidores, cold starts en funciones serverless (aceptable para MVP), limite de duracion de requests (10s en plan gratuito, 60s en Pro).
**Alternativas descartadas:**
- Railway: Buena alternativa pero mas costoso para trafico bajo
- Fly.io: Requiere mas configuracion y gestion
- VPS: Mas control pero mas mantenimiento
