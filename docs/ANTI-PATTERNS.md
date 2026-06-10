# Anti-Patterns de Loop Engineering

> Failure modes documentados. Conocelos para evitarlos.

---

## 1. Ralph Wiggum Loop (fallo silencioso)

**Qué es:** El agente emite un token de "completado" antes de terminar, y el loop sale con trabajo a medias.

**Causas:**
- Sin verifier real — un segundo agente "revisa" sin señal objetiva
- Condiciones de "done" blandas — definidas por el juicio del agente, no por un test
- Sin hard stops — el loop sigue hasta que algo externo lo mata

**Fix:**
```
Gate objetivo = algo que puede fallar el trabajo:
✓ Test que pasa o falla
✓ Build que compila o no
✓ Linter que retorna 0 o non-zero
✗ Verifier que tiene una opinión
```

---

## 2. Comprehension Debt

**Qué es:** Cuanto más rápido el loop shippea código que no escribiste, mayor la distancia entre lo que el repo contiene y lo que entendés.

**El día que tenés que debuggear un sistema que nadie del team leyó, eso cuesta más que los tokens.**

**Mitigaciones:**
- **Leé los diffs.** Si no leés lo que el loop shippea, estás alquilando deuda de comprensión a interés compuesto.
- **Spot-chequeá el gate.** Elegí algunos PRs que el loop abrió y verificá que el test que los aprobó realmente atrapa el failure mode que te importa. Los gates se pudren.
- **Bloqueá al loop de arquitectura.** Mantenelo en cambios chicos y machine-checkables. En el momento que lo dejás tocar juicios de diseño, la deuda se acelera.
- **Pair-design loops con un teammate.** Un segundo par de ojos cuando diseñás el loop atrapa blind spots que el loop va a explotar para siempre.

---

## 3. Cognitive Surrender

**Qué es:** La tentación de dejar de formar opinión y aceptar lo que el loop devuelve.

**Diseñar el loop es la cura cuando lo hacés con juicio, y el acelerante cuando lo hacés para evitar pensar. Misma acción, resultado opuesto.**

---

## 4. Self-Preferential Bias

**Qué es:** El agente que escribió el código es demasiado amable calificando su propia tarea.

**El maker aprueba su propio homework y siempre es "A+".**

**Fix:** Separar maker de checker. Un verifier subagent sin exposición al razonamiento del maker.

---

## 5. Goal Drift

**Qué es:** En sesiones largas, cada paso de summarización es lossy. Las restricciones de "no hagas X" desaparecen en el turno 47.

**Fix:** Un archivo VISION.md o AGENTS.md que se relee cada run. State le dice al agente dónde está. Vision le dice a dónde va.

---

## 6. Agentic Laziness

**Qué es:** El loop declara "suficientemente bueno" en completitud parcial.

**Fix:** `/goal` con una condición de parada objetiva verificada por un modelo fresco.

---

## 7. Permission Scope Creep

**Qué es:** Un loop testeado con permisos de solo lectura recibe "solo un" permiso de escritura por conveniencia, y nunca se re-audita.

**Fix:** Re-auditar permisos cada 30 días.

---

## 8. Skills como Injection Vectors

**Qué es:** Un loop que auto-instala skills hereda cada prompt injection escondido en sus descripciones.

**Dato:** 520 de 17,022 skills auditadas filtraban credenciales.

**Fix:** Auditar fuentes de skills antes de instalar.

---

## 9. Credentials en Logs

**Qué es:** Debug logging durante un loop de larga ejecución esparce secrets por logs que no monitoreás.

**Fix:** Deshabilitar verbose logging en loops de producción; sanitizar lo que se loguea.

---

## Los 10 Errores que Convierten Loops en Money Pits

1. Construir un loop sin pasar el test de 4 condiciones
2. Sin gate objetivo — un segundo agente "revisa" sin test/type/build
3. Un agente haciendo writing Y verifying — self-preferential bias
4. Sin state file — mañana el run reinicia de cero
5. Condiciones de parada vagas — "done when it looks good" nunca funciona
6. Sin token budget cap — loops ambiciosos queman 5-10x los tokens esperados
7. Loops en plan consumer con verificación pesada — token bill o rate limit
8. Auto-instalar community skills sin auditar
9. Loops en trabajo de juicio — arquitectura, auth, payments, decisiones vagas
10. No leer los diffs — comprehension debt a interés compuesto
