# Cobertura de auditoría por fase

Qué **sí** y qué **no** abarca cada área. Usar para delimitar el análisis y detectar auditorías incompletas o fuera de alcance.

---

## Fase 0 — lifecycle-scope-auditor (Intake)

### Abarca

- Definición del problema y usuario afectado
- Alcance IN (qué se incluye) y OUT (qué se excluye explícitamente)
- Criterios de aceptación verificables (sí/no)
- Premisas y dependencias externas (servicios, hardware, APIs)
- Riesgos de scope creep ("también podríamos...")
- Alineación con objetivos del proyecto (README, roadmap)

### No abarca

- Calidad de código, arquitectura técnica, vulnerabilidades
- Diseño visual, tests, deploy

### Evidencia esperada

- Lista IN/OUT documentada
- ≥3 criterios de aceptación medibles
- Dependencias externas nombradas

---

## Fase 1 — lifecycle-architecture-auditor

### Abarca

- Separación de capas (dominio / infra / UI / API)
- Contratos entre módulos (inputs, outputs, errores)
- Acoplamiento y cohesión
- Patrones del proyecto respetados
- Impacto en subsistemas existentes
- Decisiones arquitectónicas documentadas

### No abarca

- Paleta de colores, a11y
- CVEs y secretos (→ security-auditor)
- Si los tests pasan (→ test-auditor)

### Evidencia esperada

- Diagrama o lista de módulos afectados
- Verificación de capas correctas
- Alternativa descartada con razón (si decisión nueva)

---

## Fase 2 — lifecycle-design-auditor

### Abarca

- Consistencia visual con el design system del proyecto
- Estados: loading, empty, error, success
- Accesibilidad básica (labels, contraste, foco)
- Responsive en viewports clave
- Validación de datos en UI (no mocks en prod)
- Build frontend (typecheck, vite build)

### No abarca

- Schema de base de datos
- Políticas de seguridad MCP
- Cobertura de tests unitarios

### Evidencia esperada

- `dashboard:check` o equivalente ejecutado
- Screenshots o descripción de estados UI
- Checklist a11y en flujos tocados

---

## Fase 3 — lifecycle-security-auditor

### Abarca

- Secretos hardcodeados o en cliente
- OWASP: injection, auth, exposición de datos, misconfig
- Dependencias (`npm audit`, supply chain)
- Perfiles de seguridad del proyecto (ej. TV_MCP_PROFILE)
- Manejo de errores sin filtración interna
- `.gitignore`, `.vercelignore`, archivos sensibles
- Tests de política de seguridad

### No abarca

- Naming de variables
- UX de formularios (salvo implicación de seguridad)
- Performance

### Evidencia esperada

- Resultado de `npm audit`
- Grep de patrones de secretos (negativo o mitigado)
- Tests safety/remote_policy/ui_policy pasando

---

## Fase 4 — lifecycle-code-auditor

### Abarca

- Convenciones del repo (imports, naming, estructura)
- Legibilidad y complejidad razonable
- Duplicación evitable
- Deuda técnica bloqueante
- Tipos TypeScript (sin `any` evitable)
- Syntax check de archivos tocados

### No abarca

- Estrategia de producto
- Vulnerabilidades (→ security)
- Plan de tests (→ test-auditor)

### Evidencia esperada

- Archivos revisados listados
- `node --check` o lint pasando
- Hallazgos con path:línea

---

## Fase 5 — lifecycle-test-auditor

### Abarca

- Tests para lógica nueva
- Casos negativos y edge cases
- Split unit / integración / E2E apropiado
- Suite pasando (`test:unit` mínimo)
- CI alineado con tests locales
- Tests no skippeados sin justificación
- Prerequisitos documentados (ej. TV+CDP para E2E)

### No abarca

- Diseño visual
- Documentación de onboarding (→ devex)
- Secretos (→ security)

### Evidencia esperada

- Output de `npm run test:unit` (o equivalente)
- Lista de tests nuevos/modificados
- Plan de regresión si E2E no ejecutado

---

## Fase 6 — lifecycle-devex-auditor

### Abarca

- README y AGENTS.md actualizados
- Scripts npm documentados
- CI workflow cubre cambios
- Onboarding reproducible (pasos verificables)
- Mensajes de error útiles en CLI/scripts

### No abarca

- Funcionalidad de negocio
- Tests de lógica (→ test-auditor)
- UI (→ design-auditor)

### Evidencia esperada

- Diff en README/AGENTS.md si aplica
- CI config revisado
- Tiempo/pasos de setup documentados

---

## Fase 7 — lifecycle-production-auditor

### Abarca

- Build de producción exitoso
- Deploy readiness (Vercel u otro)
- QA browser / smoke tests
- Console sin errores de runtime
- Datos reales en UI (no ceros falsos, no mocks)
- Evidencia visual (screenshots)
- **Veredicto GO / NO-GO** (único agente con este veredicto)

### No abarca

- Refactors internos no desplegados
- Auditoría de planes (→ gstack)

### Evidencia esperada

- `dashboard:check` + `test:unit` pasando
- QA scripts ejecutados si UI tocada
- Screenshots en `qa/screenshots/` o equivalente
- GO/NO-GO con razón explícita
