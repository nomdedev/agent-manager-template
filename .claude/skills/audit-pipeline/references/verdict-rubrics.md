# Rúbricas de veredicto

Cómo saber si el análisis es **correcto** y si el veredicto es **coherente**.

## Severidades

| Nivel | Definición | Ejemplos |
|-------|------------|----------|
| **crítico** | Exploit viable, pérdida de datos, secret expuesto, build roto | API key en dashboard, SQL injection, `test:unit` falla |
| **alto** | Riesgo probable sin mitigación | CVE alto sin fix, auth ausente en endpoint nuevo |
| **medio** | Deuda o convención violada, no bloquea deploy inmediato | Duplicación, `any` en TS, doc desactualizada |
| **bajo** | Mejora sugerida | Naming subóptimo, comentario faltante |

## Matriz veredicto ↔ severidades (Fases 0-6)

| Hallazgos | Veredicto correcto | Veredicto incorrecto |
|-----------|-------------------|---------------------|
| 0 críticos, 0 altos sin mitigación | **APROBADO** | BLOQUEADO |
| ≥1 crítico sin mitigación | **BLOQUEADO** | APROBADO |
| ≥1 alto sin mitigación (security) | **BLOQUEADO** | APROBADO |
| Solo medios/bajos | **APROBADO** (con follow-ups listados) | BLOQUEADO |
| Checklist incompleto sin justificar N/A | **BLOQUEADO** | APROBADO |

## Fase 7 — GO / NO-GO

| Condición | Veredicto |
|-----------|-----------|
| Fases 0-6 APROBADO + build OK + tests OK + QA OK (si UI) | **GO** |
| Cualquier fase BLOQUEADO pendiente | **NO-GO** |
| Build o test:unit falla | **NO-GO** |
| UI tocada sin QA browser | **NO-GO** |
| Hallazgo crítico en smoke test | **NO-GO** |

## Señales de auditoría CORRECTA

- [ ] Disciplina respetada (no audita fuera de su fase — ver coverage-by-phase.md)
- [ ] Checklist de la fase marcado o cada N/A justificado
- [ ] ≥1 comando de verificación ejecutado (o N/A con razón)
- [ ] Cada hallazgo tiene: severidad + ubicación + recomendación
- [ ] Veredicto alineado con matriz de severidades
- [ ] Reporte guardado en `docs/audits/`
- [ ] Formato según report-validation.md

## Señales de auditoría INCORRECTA

| Problema | Por qué es incorrecto |
|----------|----------------------|
| APROBADO sin ejecutar comandos | Sin evidencia verificable |
| BLOQUEADO por hallazgos "bajos" solos | Sobre-auditoría |
| Hallazgos fuera de disciplina | Ej. security-auditor critica naming |
| Sin ubicación en hallazgos | No accionable |
| Veredicto ausente | Gate inválido |
| Mezcla dominio + auditoría | Roles confundidos |
| E2E requerido pero marcado N/A sin TV documentado | Evidencia faltante |

## Falsos positivos comunes

| Situación | Tratamiento correcto |
|-----------|---------------------|
| `npm audit` con vuln en devDependency no explotable | Documentar como medio + mitigación, no BLOQUEAR |
| E2E no corrido porque TV no disponible | APROBADO con condición: "E2E pendiente antes de GO" |
| Refactor sin cambio de comportamiento | test-auditor verifica regresión unitaria, no exige tests nuevos si cobertura existente |
| Estilo distinto pero convención del módulo respetada | code-auditor: bajo, no bloqueante |

## Validación cruzada (Modo C)

Para validar un reporte existente, responder:

1. ¿El veredicto coincide con la matriz de severidades? → sí/no
2. ¿El checklist está completo? → sí/no
3. ¿Los comandos declarados coinciden con la evidencia? → sí/no
4. ¿La disciplina fue respetada? → sí/no

**4/4 sí** → AUDITORÍA VÁLIDA  
**cualquier no** → AUDITORÍA INVÁLIDA — listar correcciones
