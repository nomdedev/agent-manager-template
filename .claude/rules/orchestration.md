# Orchestration Rules — Agent Pipeline

**Aplicabilidad:** Obligatoria para CADA tarea, feature, bugfix o refactor que afecte lógica de negocio, UI con estado, APIs o base de datos.
**Autoridad:** El orquestador principal es el único que puede declarar una fase como completada y autorizar el paso al siguiente equipo.
**Documentación:** Cada fase debe producir un artefacto de reporte guardado en `.claude/logs/audits/features/{feature-id}/{fase}-{fecha}.md`.
**Estado del pipeline:** Se registra en `.claude/logs/pipeline-state.json`. Ningún código se mergea ni deploya sin que este archivo refleje status: GO.

---

## Pipeline Secuencial por Equipos (Gated, NO se saltea NUNCA)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORQUESTADOR PRINCIPAL                                                      │
│  Responsabilidad: Enviar la tarea al equipo correspondiente, recibir el    │
│  reporte, verificar gate de salida, y autorizar (o no) el paso al siguiente.│
│  NUNCA implementa código directamente salvo en Fase 7 (verificación).       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EQUIPO 1 — DISEÑO (Fases 1-2)                                              │
│  Agentes: domain-expert → architect → api-expert (solo diseño API)          │
│  Entrega: Requerimientos validados + Propuesta arquitectónica + Contratos   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │ Gate: APROBADO
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EQUIPO 2 — BACKEND (Fase 3)                                                │
│  Agentes: architect (DB/API design) + api-expert (implementación)           │
│  Entrega: Schema + API routes funcionales + Zod schemas + Datos de prueba   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │ Gate: APROBADO
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EQUIPO 3 — SEGURIDAD (Fase 4)                                              │
│  Agente: security-auditor                                                   │
│  Entrega: Security Audit Report con score OWASP + plan de mitigación        │
│  NOTA: Este equipo evalúa TODAS las aristas, vectores de ataque y breaches. │
│  Si encuentra CRÍTICO o ALTO sin mitigación, el pipeline rebota a Fase 2.   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │ Gate: APROBADO (sin hallazgos críticos)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EQUIPO 4 — DEVELOP & DEPLOY (Fase 5)                                       │
│  Agentes: api-expert (implementación) + reviewer (code review)              │
│  Entrega: Código implementado, build exitoso, optimizado                    │
│  Incluye: Fase de Code Review interno antes de entregar al QA.              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │ Gate: APROBADO (build pasa, review interno OK)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EQUIPO 5 — QA / TESTING (Fase 6)                                           │
│  Agente: tester                                                             │
│  Misión: ROMPER TODO. Happy path, vacío, error, boundary, reglas de negocio.│
│  Entrega: Test Report con cobertura, tests pasando, casos negativos.        │
│  Si encuentra bloqueante → REBOTE al equipo correspondiente:                │
│    - Bug de lógica/negocio → Equipo 1 (Diseño)                              │
│    - Bug de seguridad      → Equipo 3 (Seguridad)                           │
│    - Bug de implementación → Equipo 4 (Develop)                             │
│    - Bug de API/schema     → Equipo 2 (Backend)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │ Gate: APROBADO (todos los tests pasan)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EQUIPO 6 — DEVOPS / INFRA (Fase 6.5)                                       │
│  Agente: devops-infra                                                       │
│  Entrega: Deploy readiness, CI/CD green, infra audit, rollback plan         │
│  Verifica: Build limpio, Vercel config, env vars, Docker, smoke tests       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │ Gate: APROBADO (deploy listo)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EQUIPO 7 — PRODUCCIÓN / Go-No-Go (Fase 7)                                  │
│  Responsable: Orquestador Principal (NO se delega)                          │
│  Verificación real en servidor productivo/preview con datos reales.         │
│  Entrega: Reporte de Fase 7 con VEREDICTO FINAL: GO o NO-GO.                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Regla de oro #1:** Si un equipo devuelve **BLOQUEADO**, el pipeline se detiene. Se crea tarea de corrección, se resuelve, y se **re-ingresa al equipo que la originó**. Nunca se saltea una fase.

**Regla de oro #2 (Rebote por QA):** Si el Equipo 5 (QA) encuentra un bloqueante, el feature **NO avanza a Fase 7**. Se determina la raíz del bug y se rebota al equipo correspondiente (1, 2, 3 o 4). El pipeline reinicia desde esa fase.

**Regla de oro #3 (Seguridad antes de Develop):** El Equipo 4 (Develop) **NO recibe la tarea** si el Equipo 3 (Seguridad) no emitió veredicto APROBADO. Esto previene que código inseguro llegue a QA o producción.

---

## Fase 1 — Dominio e Idea (Equipo 1: Diseño)

**Responsable:** `domain-expert` agent (experto en negocio/dominio del proyecto)
**Input:** Descripción de la funcionalidad a implementar
**Output:** Documento de requerimientos validado

### Checklist de entregables
- [ ] La funcionalidad resuelve un problema real del dominio del proyecto
- [ ] La terminología usada coincide con las reglas de dominio del proyecto
- [ ] Los estados/flujos propuestos tienen sentido en el contexto del negocio
- [ ] Los KPIs propuestos son medibles y relevantes para el proyecto
- [ ] Se identificaron datos sensibles involucrados
- [ ] Se definió el alcance explícito: qué está IN y qué está OUT

### Gate de salida
**APROBADO** cuando: Los requerimientos reflejan la realidad del negocio y no contradicen reglas de dominio.
**BLOQUEADO** cuando: Hay ambigüedad en flujos de negocio, terminología incorrecta, o alcance indefinido.

### Formato de reporte
```markdown
## FASE 1 — DOMINIO E IDEA — [feature] — [fecha]

### Requerimientos validados
- [lista numerada]

### Datos sensibles identificados
- [qué datos sensibles se tocan]

### Alcance
- IN: ...
- OUT: ...

### VEREDICTO: [APROBADO | BLOQUEADO]
**Razón:** ...
```

---

## Fase 2 — Arquitectura (Equipo 1: Diseño)

**Responsable:** `architect` agent (con apoyo de `api-expert` para diseño API si aplica)
**Input:** Requerimientos aprobados de Fase 1
**Output:** Propuesta arquitectónica con interfaces, árbol de archivos y contratos API

### Checklist de entregables
- [ ] Se leyó el código existente relacionado (Rule 8)
- [ ] Se identificaron patrones existentes y se decidió cuál seguir (Rule 7)
- [ ] Se definieron las interfaces TypeScript públicas
- [ ] Se especificó el árbol de archivos (crear/modificar/eliminar)
- [ ] Se evaluaron al menos 2 opciones de diseño con pros/cons
- [ ] Se identificó impacto en el bundle/build
- [ ] Se definieron contratos API (Zod schemas, request/response shapes)
- [ ] Se documentaron supuestos explícitos
- [ ] Se identificaron env vars nuevas necesarias

### Gate de salida
**APROBADO** cuando: El diseño es mínimo, no especulativo, y respeta constraints inmutables del proyecto.
**BLOQUEADO** cuando: Hay abstracciones prematuras, no se leyó código existente, o se propone cambiar constraints inmutables.

### Formato de reporte
```markdown
## FASE 2 — ARQUITECTURA — [feature] — [fecha]

### Opciones evaluadas
1. **[Opción A]** — [descripción breve]
   - Pros: ...
   - Cons: ...
2. **[Opción B]** — [descripción breve]
   - Pros: ...
   - Cons: ...

### Decisión: [Opción elegida]
**Razón:** ...

### Archivo de archivos
- Crear: ...
- Modificar: ...
- Eliminar: ...

### Interfaces / Contratos
[interfaces TypeScript o shapes de API]

### Supuestos
- [lista de supuestos explícitos]

### VEREDICTO: [APROBADO | BLOQUEADO]
**Razón:** ...
```

---

## Fase 3 — Backend (Equipo 2: Backend)

**Responsable:** Orquestador principal (con apoyo de `architect` si el diseño de DB/API es no-trivial)
**Input:** Diseño arquitectónico aprobado de Fase 2
**Output:** API routes funcionales, schema consistente, datos de prueba si aplica

### Checklist de entregables
- [ ] Se definieron las API routes necesarias
- [ ] Las queries a la base de datos están parametrizadas (prepared statements)
- [ ] No hay queries con cartesian product sin justificación
- [ ] Las vistas/agregaciones usan subqueries escalares cuando se combinan tablas independientes
- [ ] Las credenciales de conexión nunca aparecen en código cliente
- [ ] El schema está versionado en el repo
- [ ] Datos de prueba (seed) permiten verificar la funcionalidad sin producción
- [ ] Cada endpoint responde con el shape que el frontend espera

### Gate de salida
**APROBADO** cuando: Las APIs responden correctamente con datos de prueba, y el schema es consistente.
**BLOQUEADO** cuando: Hay SQL injection posible, queries con cartesian product, o contrato API-frontend roto.

### Formato de reporte
```markdown
## FASE 3 — BACKEND — [feature] — [fecha]

### API Routes definidas
| Método | Ruta | Descripción | Shape de respuesta |
|--------|------|-------------|-------------------|
| ... | ... | ... | ... |

### Schema changes
- [tablas/columnas/índices creados o modificados]

### Datos de prueba
- [descripción de seed data creada]

### Contrato API validado contra frontend
- [confirmación de que el shape coincide con lo que el frontend espera]

### VEREDICTO: [APROBADO | BLOQUEADO]
**Razón:** ...
```

---

## Fase 4 — Seguridad (Equipo 3: Seguridad)

**Responsable:** `security-auditor` agent
**Input:** Código backend aprobado (Fase 3), schema, API routes
**Output:** Security Audit Report con score OWASP y plan de mitigación para hallazgos

### Checklist de entregables (módulos del agente)
**Módulo 1 — Secretos:**
- [ ] Sin credenciales hardcodeadas
- [ ] Sin variables de entorno cliente con secrets
- [ ] `.env` en `.gitignore`

**Módulo 2 — Dependencias:**
- [ ] `npm audit` sin HIGH/CRITICAL sin mitigación

**Módulo 3 — Código:**
- [ ] Sin `dangerouslySetInnerHTML` sin sanitizador
- [ ] Sin datos sensibles en `localStorage`/`sessionStorage`
- [ ] Queries parametrizadas (no concatenación dinámica)
- [ ] Sin `eval`/`exec` con input externo

**Módulo 4 — Infraestructura:**
- [ ] Errores no exponen stack traces al usuario
- [ ] HTTPS en todas las conexiones

**Módulo 5 — Vectores de ataque específicos del feature:**
- [ ] Auth/AuthZ en endpoints nuevos
- [ ] Exposición de datos sensibles en responses agregadas
- [ ] Rate limiting en endpoints públicos
- [ ] Validación de inputs en todas las capas

### Gate de salida
**APROBADO** cuando: Sin hallazgos CRÍTICOS ni ALTOS sin plan de mitigación.
**BLOQUEADO** cuando: Cualquier hallazgo CRÍTICO (datos sensibles expuestos, secretos hardcodeados, SQL injection).
**REBOTE:** Si BLOQUEADO, la tarea vuelve a Fase 2 (Arquitectura) con los hallazgos de seguridad como constraints adicionales.

### Formato de reporte
```markdown
## FASE 4 — SEGURIDAD — [feature] — [fecha]

### Módulo 1: Secretos
- [findings]

### Módulo 2: Dependencias
- [findings]

### Módulo 3: Código
- [findings]

### Módulo 4: Infraestructura
- [findings]

### Módulo 5: Vectores de ataque específicos
- [findings]

### Score OWASP
| Categoría | Nivel | Detalle |
|-----------|-------|---------|
| ... | ... | ... |

### Plan de mitigación
- [acciones requeridas para cada hallazgo]

### VEREDICTO: [APROBADO | BLOQUEADO]
**Razón:** ...
```

---

## Fase 5 — Develop & Deploy (Equipo 4: Develop)

**Responsable:** `developer` agent (implementación) + `reviewer` agent (code review)
**Input:** Diseño aprobado (Fase 2) + Backend funcionando (Fase 3) + Seguridad aprobada (Fase 4)
**Output:** Código implementado, build exitoso, optimizado

### Checklist de entregables
- [ ] Código escrito siguiendo convenciones del proyecto
- [ ] No hay `any` en TypeScript (si aplica)
- [ ] Se usan las utilidades del proyecto (classnames, etc.)
- [ ] No se introdujeron dependencias nuevas sin justificación
- [ ] Build pasa sin errores
- [ ] Code Review interno realizado (el `reviewer` agent interviene si el cambio es grande)

### Gate de salida
**APROBADO** cuando: Build exitoso, código sigue convenciones, y no hay errores de tipo.
**BLOQUEADO** cuando: Build falla, hay violaciones de convención, o se rompe código existente.

### Formato de reporte
```markdown
## FASE 5 — DEVELOP — [feature] — [fecha]

### Archivos creados/modificados
- [lista con descripción]

### Build
- Resultado: ✅ / ❌
- Errores: [ninguno o lista]

### Code Review interno
- Revisor: [agent o manual]
- Hallazgos: [ninguno o lista]
- Correcciones aplicadas: [lista]

### VEREDICTO: [APROBADO | BLOQUEADO]
**Razón:** ...
```

---

## Fase 6 — QA / Testing (Equipo 5: QA)

**Responsable:** `tester` agent
**Input:** Código completo aprobado por Develop (Fase 5)
**Output:** Tests escritos y ejecutados, reporte de cobertura, veredicto de calidad

### Misión del equipo QA
> "Tu trabajo no es confirmar que funciona. Tu trabajo es demostrar que se puede romper. Si no lo rompiste, no hiciste QA."

### Checklist de entregables
- [ ] Plan de pruebas documentado (happy path, vacío, error, boundary, regla de negocio)
- [ ] Tests escritos para lógica de negocio nueva
- [ ] Tests de componente si el UI tiene comportamiento condicional
- [ ] Al menos un caso negativo por módulo
- [ ] Suite de tests pasa (sin tests skippeados)
- [ ] Cobertura documentada (no necesariamente 100%, pero intencional)
- [ ] Pruebas manuales del flujo completo en browser (si aplica)

### Gate de salida
**APROBADO** cuando: Tests pasan, cubren casos críticos, y no hay tests que no puedan fallar.
**BLOQUEADO** cuando: Tests fallan, hay tests vacíos (`it('works')`), o casos críticos sin cubrir.

### Regla de Rebote por QA
Cuando QA devuelve **BLOQUEADO**, el Orquestador Principal debe:
1. Determinar la raíz del defecto (diseño, backend, seguridad, o implementación)
2. Crear tarea de corrección asignada al equipo correspondiente
3. **Reiniciar el pipeline desde la fase de ese equipo** (NO desde QA)
4. Seguridad y QA deben re-validar después del fix

| Tipo de defecto | Equipo de rebote | Fase de reinicio |
|-----------------|------------------|------------------|
| Lógica de negocio incorrecta | Equipo 1 (Diseño) | Fase 2 (Arquitectura) |
| Schema/API roto o inconsistente | Equipo 2 (Backend) | Fase 3 (Backend) |
| Vulnerabilidad de seguridad | Equipo 3 (Seguridad) | Fase 4 (Seguridad) |
| Bug de implementación | Equipo 4 (Develop) | Fase 5 (Develop) |

### Formato de reporte
```markdown
## FASE 6 — QA / TESTING — [feature] — [fecha]

### Plan de pruebas
| # | Caso | Tipo | Resultado |
|---|------|------|-----------|
| 1 | ... | Happy path | ✅ / ❌ |
| 2 | ... | Error | ✅ / ❌ |
| ... | ... | ... | ... |

### Cobertura
- Módulos cubiertos: ...
- Casos negativos: ...
- Casos no cubiertos (justificación): ...

### Hallazgos
- [lista de bugs o issues encontrados, con severidad]

### Rebote (si aplica)
- Equipo destino: ...
- Fase de reinicio: ...
- Razón: ...

### VEREDICTO: [APROBADO | BLOQUEADO]
**Razón:** ...
```

---

### Fase 6.5 — DevOps / Infra (Equipo 6: DevOps)

**Responsable:** `devops-infra` agent
**Input:** Código aprobado por QA (Fase 6)
**Output:** Deploy readiness report, CI/CD verification, infra audit

### Checklist de entregables
- [ ] Build limpio en entorno fresco (`npm ci && npm run build`)
- [ ] CI/CD pipeline verde en `main`
- [ ] `vercel.json` validado contra build output actual
- [ ] Variables de entorno verificadas en dashboard de Vercel
- [ ] Sin secrets en repo ni artefactos de build
- [ ] Plan de rollback documentado
- [ ] Docker build pasa (si aplica)
- [ ] Checklist de infra audit completado

### Gate de salida
**APROBADO** cuando: Deploy listo, CI/CD verde, infra audit pasado.
**BLOQUEADO** cuando: Build falla en CI, config de infra rota, o secrets expuestos.

### Formato de reporte
```markdown
## FASE 6.5 — DEVOPS / INFRA — [feature] — [fecha]

### Build Status
- Limpio: ✅ / ❌
- CI/CD: ✅ / ❌

### Infra Audit
- Vercel config: ✅ / ❌
- Env vars: ✅ / ❌
- Secrets scan: ✅ / ❌
- Docker: ✅ / ❌ (si aplica)

### Rollback Plan
- Comando: ...
- Tiempo estimado: ...

### VEREDICTO: [APROBADO | BLOQUEADO]
**Razón:** ...
```

---

## Fase 7 — Producción / Go-No-Go (Equipo 7: Producción)

**Responsable:** Orquestador principal (este paso NO se delega)
**Input:** Todas las fases anteriores aprobadas
**Output:** Verificación real en servidor de producción/preview

### Checklist de entregables (obligatorio, no negociable)
- [ ] Build exitoso, cero errores
- [ ] Servidor de preview/producción levantado
- [ ] Health check endpoint responde correctamente
- [ ] API endpoints responden con datos reales (no mocks)
- [ ] Logs de servidor revisados: sin errores de runtime
- [ ] Smoke tests ejecutados y pasando
- [ ] Evidencia guardada (logs o descripción detallada)
- [ ] Checkpoint final emitido con formato Rule 10

### Gate de salida
**GO** cuando: La funcionalidad funciona con datos reales, sin errores visibles, y la API responde correctamente.
**NO-GO** cuando: Cualquier falla visible en producción (500, error de datos, crash, timeout).

### Formato de reporte
```markdown
## FASE 7 — PRODUCCIÓN — [feature] — [fecha]

### Verificación realizada
- Build: ✅ / ❌
- Servidor: ✅ / ❌
- Health check: ✅ / ❌
- API endpoints con datos reales: ✅ / ❌
- Logs sin errores: ✅ / ❌
- Smoke tests: ✅ / ❌

### Evidencia
- [rutas a logs o descripción de lo observado]

### VEREDICTO FINAL: [GO | NO-GO]
**Razón:** ...

### Próxima feature autorizada
- [nombre de la siguiente feature a implementar]
```

---

## Estado del Pipeline (pipeline-state.json)

Cada feature en desarrollo debe tener una entrada en `.claude/logs/pipeline-state.json`:

```json
{
  "version": 2,
  "description": "Pipeline state by teams. Each feature must pass all phases before GO.",
  "features": [
    {
      "id": "feature-slug",
      "name": "Feature display name",
      "currentPhase": 7,
      "currentTeam": "Equipo 6: Producción",
      "status": "GO",
      "startedAt": "2026-05-16T10:00:00Z",
      "completedAt": "2026-05-16T20:00:00Z",
      "audits": [
        {"phase": 1, "team": "domain-expert", "verdict": "APROBADO", "file": "fase1-20260516.md"},
        {"phase": 2, "team": "architect", "verdict": "APROBADO", "file": "fase2-20260516.md"},
        {"phase": 3, "team": "backend", "verdict": "APROBADO", "file": "fase3-20260516.md"},
        {"phase": 4, "team": "security-auditor", "verdict": "APROBADO", "file": "fase4-20260516.md"},
        {"phase": 5, "team": "api-expert", "verdict": "APROBADO", "file": "fase5-20260516.md"},
        {"phase": 6, "team": "tester", "verdict": "APROBADO", "file": "fase6-20260516.md"},
        {"phase": 6.5, "team": "devops-infra", "verdict": "APROBADO", "file": "fase6.5-20260516.md"},
        {"phase": 7, "team": "orchestrator", "verdict": "GO", "file": "fase7-20260516.md"}
      ]
    }
  ]
}
```

---

## Instrucciones para el Orquestador Principal

1. Antes de iniciar cualquier feature, crear una entrada en `pipeline-state.json` con `currentPhase: 0`.
2. Enviar la tarea al Equipo 1 (Diseño). No escribir código en Fases 1-2.
3. Recibir el reporte del equipo. Verificar el gate de salida. Si es APROBADO, actualizar `pipeline-state.json` y autorizar el paso al siguiente equipo.
4. Si un equipo devuelve BLOQUEADO, no borrar la tarea. Actualizar con el bloqueante y asignar al equipo de corrección.
5. **NUNCA** permitir que el Equipo 4 (Develop) reciba una tarea sin el veredicto APROBADO del Equipo 3 (Seguridad).
6. **NUNCA** permitir que una feature vaya a Producción (Fase 7) sin el veredicto APROBADO del Equipo 5 (QA) y Equipo 6 (DevOps).
7. Guardar cada reporte en `.claude/logs/audits/features/{feature-id}/{fase}-{fecha}.md`.
8. Solo cuando Fase 7 diga GO, se puede pasar a la siguiente feature.
