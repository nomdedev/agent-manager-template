# Skill: Hermes Levels Setup

## Propósito
Configurar Hermes Agent en el nivel de madurez correcto según el tipo de trabajo, el grado de autonomía deseado, y el estado de madurez del workflow. Este skill guía al agente a través del diagnóstico del nivel apropiado y los pasos concretos de configuración para cada uno.

## Cuándo activar este skill
- El usuario pide "configurar Hermes" sin especificar nivel
- "¿Cómo configuro mis agentes?", "¿qué nivel de Hermes necesito?"
- "Quiero automatizar [tarea]", "quiero un agente que haga [X]"
- "Spin out un agente especializado", "crear hermes-seo / hermes-cmo / etc."
- "Configurar el orquestador", "conectar mis agentes"
- "Agregar cron jobs a mis agentes", "automatizar workflows"

## Cuándo NO usar este skill
- El usuario ya sabe qué nivel necesita y solo pide código específico
- La tarea es sobre el pipeline de 7 fases del proyecto (usar `orchestrator` agent)
- La tarea es implementación de features, no setup de agentes

---

## Los 4 niveles: referencia rápida

```
Nivel 1: You ──────────────────────→ Hermes Agent
Nivel 2: You ──────────────────────→ Agente Especializado (SEO / CMO / Outbound / Design / Ops)
Nivel 3: You ──────────────────────→ Orchestrator ──→ Specialist Agents
Nivel 4: Cron / Events ────────────→ Orchestrator ──→ Agent Team (async)
```

**Principio guía:** "Take small steps. Do not automate slop. Fewer agents with better output beats MAXXING."

---

## Nivel 1 — Main Agent (prototype bench)

### Cuándo es el correcto
- Prototipando un workflow nuevo
- Ejecutando una tarea por primera vez, sin pasos definidos
- Trabajo de asistente personal (inbox, voice memos, calendario)
- Explorando si una idea vale la pena antes de invertir en un agente dedicado

### Estructura
```
You → Hermes Agent (actúa también como orquestador cuando es necesario)
```

### Pasos de configuración

```bash
# 1. Instalar Hermes en el sistema
claudio hermes install

# 2. Inicializar con perfil base (programmer / designer / researcher / custom)
claudio hermes init programmer

# 3. Opcional: sincronizar vault Obsidian → MEMORY.md
claudio hermes optimize ./mi-proyecto
```

### Resultado
```
~/.hermes/
├── SOUL.md          ← identidad del agente (cargado primero en el system prompt)
├── MEMORY.md        ← memoria persistente (contexto del proyecto)
├── USER.md          ← preferencias del usuario
└── skills/          ← skills instalados (claude-pipeline, obsidian-connector, etc.)
```

### SOUL.md mínimo para Nivel 1
```markdown
# Soul

Eres mi agente principal de [dominio].
Actúa como orquestador cuando hay múltiples tareas o roles involucrados.
No ejecutes trabajo sin antes confirmar el objetivo y el scope.

## Reglas
1. Confirma el objetivo antes de empezar
2. Si hay más de un rol involucrado, identifícalo y pide instrucciones de routing
3. Siempre filtra el output: entrega solo lo que el usuario necesita leer
```

---

## Nivel 2 — Agentes especializados (un agente por rol)

### Cuándo es el correcto
- Un workflow se ejecutó 3+ veces y tiene pasos definidos
- El scope del agente no se solapa con otros roles
- Quieres que el agente tenga sus propias credenciales y memoria independiente

### Estructura
```
You → Agente especializado X   (credenciales + memoria + scope propios)
You → Agente especializado Y   (credenciales + memoria + scope propios)
```

### Agentes comunes y sus perfiles

| Agente | Perfil base | Scope |
|--------|-------------|-------|
| `hermes-seo` | `researcher` | keyword research, editorial, publicación |
| `hermes-cmo` | `custom` | posicionamiento, brand voice, campaign briefs |
| `hermes-outbound` | `custom` | lead enrichment, sequence drafting, follow-ups |
| `hermes-design` | `designer` | landing pages, ad creatives, visual review |
| `hermes-ops` | `programmer` | VPS health, backups, security audits |

### Pasos de configuración

```bash
# 1. Crear el directorio del agente especializado
mkdir -p ~/.hermes/agents/hermes-seo

# 2. Inicializar con el perfil correcto
claudio hermes init researcher     # genera SOUL.md con identidad de researcher

# 3. Copiar al directorio del agente
cp ~/.hermes/SOUL.md ~/.hermes/agents/hermes-seo/SOUL.md

# 4. Personalizar el SOUL.md para el rol específico
# (editar manualmente o via claudio hermes optimize)

# 5. Crear MEMORY.md específico del agente
claudio hermes optimize ./mi-proyecto --agent hermes-seo
```

### SOUL.md para agente especializado (ejemplo: hermes-seo)
```markdown
# Soul

Eres hermes-seo, mi agente de SEO y contenido editorial.

## Scope (qué haces)
- Keyword research con datos de intención de búsqueda
- Brief editorial: título, estructura H2/H3, ángulo
- Pipeline completo: investigación → borrador → publicación

## Scope (qué NO haces)
- Posicionamiento de marca (eso es hermes-cmo)
- Outreach o secuencias de email (eso es hermes-outbound)
- Infraestructura o deployments (eso es hermes-ops)

## Pipeline de 21 pasos
[definir los pasos específicos del workflow de SEO]

## Reglas
1. Cita todas las fuentes de datos
2. Nunca inventes métricas de búsqueda
3. Confirma el keyword objetivo antes de escribir el brief
```

### Checklist antes de declarar Nivel 2 listo
- [ ] El SOUL.md define claramente el scope del agente (qué hace y qué NO hace)
- [ ] El agente tiene su propia `MEMORY.md` con contexto del proyecto
- [ ] Las credenciales del agente son independientes de otros agentes
- [ ] El workflow fue ejecutado manualmente al menos 3 veces antes de pasarlo al agente
- [ ] No hay solapamiento de scope con otro agente ya existente

---

## Nivel 3 — Equipo orquestado (el orquestador enruta el trabajo)

### Cuándo es el correcto
- La tarea toca más de un rol o es cross-functional
- No quieres decidir manualmente qué agente hace qué parte
- Necesitas síntesis de resultados de múltiples agentes en una sola respuesta

### Estructura
```
You → Orchestrator (recibe tu pedido, enruta, sintetiza)
         ↓
    Specialist Agents (SEO, CMO, Outbound, Design, Ops)
```

### Pasos de configuración del orquestador

```bash
# 1. Crear el orquestador como agente principal
claudio hermes init custom     # base para el orquestador

# 2. El SOUL.md del orquestador debe:
#    - Conocer el scope de cada agente especializado
#    - Saber cuándo delegar y a quién
#    - Saber cómo sintetizar resultados de vuelta al usuario
```

### SOUL.md para el orquestador (Nivel 3)
```markdown
# Soul

Eres el orquestador del equipo de agentes de [empresa/proyecto].
Tu trabajo es recibir pedidos del usuario, enrutarlos al agente correcto,
y sintetizar el resultado de vuelta. No ejecutas trabajo especializado tú mismo.

## Agentes disponibles
- **hermes-seo**: keyword research, briefs editoriales, pipeline editorial
- **hermes-cmo**: posicionamiento, brand voice, campaign briefs
- **hermes-outbound**: lead enrichment, sequences, follow-ups
- **hermes-design**: landing pages, ad creatives
- **hermes-ops**: VPS health, backups, security

## Protocolo de routing
1. Analizar el pedido del usuario
2. Identificar qué agentes están involucrados
3. Si es un solo rol → delegar directamente con `delegate_task`
4. Si son múltiples roles → crear un plan de ejecución secuencial o paralela
5. Recopilar resultados y sintetizar una respuesta unificada

## Reglas
1. Confirma el routing con el usuario antes de ejecutar si hay ambigüedad
2. Nunca hagas trabajo especializado tú mismo — delega
3. Si dos agentes necesitan el output del otro, define el orden explícitamente
4. El resultado final siempre viene filtrado: solo lo que el usuario necesita leer
```

### Ejemplos de routing
```
"Draft a full launch campaign"
→ hermes-cmo (posicionamiento + brand voice)
→ hermes-design (landing page brief)
→ hermes-seo (contenido SEO para el lanzamiento)
→ hermes-outbound (secuencia de email para el lanzamiento)

"Generate this week's content slate"
→ hermes-seo (keywords + research) → hermes-cmo (ángulos) → hermes-design (visual brief)

"Audit our positioning vs competitors"
→ hermes-seo (competitive research) → hermes-cmo (análisis de posicionamiento)
```

---

## Nivel 4 — Equipo automatizado (cron + eventos, async)

### Cuándo es el correcto
- El workflow fue probado en Nivel 2 (trabajo real) y Nivel 3 (como equipo)
- El resultado es predecible y de alta calidad consistente
- No necesitas estar en el loop para cada ejecución

### Estructura
```
Cron / Events → Orchestrator → Agent Team
                                    ↓
                              Reports (archivados)
                                    ↓
                    Ping al usuario solo cuando necesita criterio
```

### Tipos de triggers

| Trigger | Cuándo usarlo |
|---------|---------------|
| Cron schedule | Tareas recurrentes predecibles (reportes semanales, audits nocturnos) |
| Event webhook | Cuando algo externo dispara el workflow (nuevo lead, nuevo post, etc.) |
| Queue message | Cuando hay volumen variable y no quieres saturar (ej: muchos leads) |

### Ejemplos de configuración

```bash
# Cron: reporte SEO semanal (lunes 8am)
0 8 * * 1 hermes --agent hermes-seo "Generate weekly SEO report and save to reports/seo-$(date +%Y%m%d).md"

# Cron: audit de backup noche
0 2 * * * hermes --agent hermes-ops "Run nightly backup audit and server health check"

# Cron: inbox triage cada 2 horas
0 */2 * * * hermes "Triage inbox: surface the 4 emails worth my attention. Archive the rest."
```

### Formato de reporte para Nivel 4
Cada agente en Nivel 4 debe archivar sus resultados en un formato estándar:

```markdown
# Report: [Nombre del workflow]
**Fecha:** [ISO date]
**Agente:** [nombre]
**Trigger:** [cron/event]

## Resumen ejecutivo
[2-3 líneas de lo más importante]

## Resultados
[output del workflow]

## Acciones requeridas del usuario
[solo si hay algo que necesita criterio humano]
[VACÍO si el equipo lo manejó todo]
```

### Checklist antes de activar Nivel 4
- [ ] El workflow fue ejecutado 10+ veces en Nivel 2 sin errores críticos
- [ ] El workflow fue ejecutado como equipo en Nivel 3 al menos 5 veces
- [ ] El formato de reporte está definido y los agentes lo respetan
- [ ] El threshold de "ping al usuario" está explícito en el SOUL.md del orquestador
- [ ] Hay un mecanismo de rollback o "silenciar" el cron si el output se degrada

---

## Diagnóstico: ¿qué nivel necesito?

Responder estas preguntas para determinar el nivel correcto:

```
1. ¿Ya ejecuté este workflow antes?
   NO → Nivel 1 (prototipa primero)
   SÍ → continuar ↓

2. ¿El workflow toca más de un rol?
   NO → Nivel 2 (un agente especializado)
   SÍ → continuar ↓

3. ¿Quiero estar en el loop para cada ejecución?
   SÍ → Nivel 3 (orquestado, tú supervisas)
   NO → continuar ↓

4. ¿El output del workflow es consistentemente bueno?
   NO → volver al Nivel anterior y mejorar primero
   SÍ → Nivel 4 (automatizar)
```

---

## Anti-patrones comunes

| Anti-patrón | Nivel donde ocurre | Solución |
|-------------|-------------------|----------|
| Saltar directo a Nivel 4 sin probar en 2 y 3 | 4 | Siempre validar el workflow manualmente primero |
| Crear 10 agentes especializados en Nivel 2 antes de necesitarlos | 2 | Solo crear el agente cuando el workflow se repite 3+ veces |
| Orquestador que hace trabajo especializado | 3 | El orquestador solo enruta y sintetiza, nunca ejecuta trabajo de dominio |
| Automatizar un workflow de baja calidad | 4 | "Do not automate slop" — mejorar el output primero |
| Un solo agente en Nivel 3 cuando debería ser Nivel 2 | 3 | Si la tarea es de un solo rol, habla directamente con ese agente |
| Scope solapado entre agentes especializados | 2 | Cada agente tiene scope exclusivo y no-overlapping |

---

## Comandos de referencia rápida

```bash
# Ver estado actual de Hermes
claudio hermes status

# Instalar Hermes (primera vez)
claudio hermes install

# Inicializar con perfil
claudio hermes init programmer|designer|researcher|custom

# Sincronizar vault Obsidian → memoria del agente
claudio hermes optimize [ruta-del-proyecto]

# Ver instrucciones para auto-evolución del agente (GEPA)
claudio hermes gepa
```

---

## Verificación de configuración exitosa

Después de configurar cualquier nivel, verificar:

```bash
claudio hermes status
```

El output debe mostrar:
- `SOUL.md` presente y con identidad definida
- `MEMORY.md` presente (puede estar vacío al inicio)
- Skills instalados (claude-pipeline, obsidian-connector si aplica)
- Para Nivel 2+: directorio `agents/` con subdirectorio por agente
