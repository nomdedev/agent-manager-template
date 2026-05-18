# Skill: HTML Artifacts

## Propósito
Generar artefactos HTML autocontenidos para outputs de agentes: specs de feature, reportes de auditoría, reportes de code review, diagramas de flujo de datos, resúmenes de sesión y dashboards de métricas.

**Por qué HTML en lugar de Markdown:**
- Densidad de información: tablas con color, SVG, secciones colapsables, badges de severidad
- Compartible: un archivo, un link, sin tooling
- Interacción bidireccional: sliders, filtros, botón "copy as prompt" para feedback estructurado
- Legibilidad a escala: un `.md` de 200 líneas no se lee; un HTML bien estructurado se escanea en segundos

## Cuándo activar este skill
- El usuario pide generar un reporte, spec, auditoría, plan o revisión de código
- Cuando se completa una fase del pipeline y hay que documentar el veredicto
- Cuando se pide "diagrama de flujo", "arquitectura de [módulo]", "visualizar datos"
- Cualquier output que un humano va a *leer* (no solo el agente)
- Cuando el output tiene estructura compleja: tablas, severidades, múltiples secciones, KPIs

## Cuándo NO usar este skill
- Respuestas inline cortas (1-3 oraciones)
- Commit messages y changelogs
- Docstrings y JSDoc dentro del código fuente
- Mensajes de chat conversacionales
- Cuando el usuario pide explícitamente Markdown

## Proceso paso a paso

### Paso 1: Identificar el tipo de artefacto
Determinar qué se va a generar:

| Tipo | Badge de estado | Dónde guardar |
|------|----------------|---------------|
| Spec de feature / decisión de arquitectura | EN_PROGRESO / APROBADO / BLOQUEADO | `docs/specs/` |
| Reporte de auditoría (seguridad, QA) | APROBADO / BLOQUEADO | `docs/audits/` |
| Reporte de code review | APROBADO / CON_OBSERVACIONES / BLOQUEADO | `docs/reviews/` |
| Diagrama de flujo de datos | GO / EN_QA / EN_DESARROLLO | `docs/flows/` |
| Resumen de sesión / handoff | EN_PROGRESO | `docs/` |

### Paso 2: Recolectar contexto
Leer los archivos relevantes antes de generar:
- Para specs: leer el código existente relacionado, interfaces públicas, patrones del directorio
- Para auditorías: leer los hallazgos del agente correspondiente (security-auditor, tester)
- Para flows: leer schema DB, API routes, componentes frontend, store
- Para code review: leer el diff completo o los archivos modificados

### Paso 3: Generar el HTML con la estructura base

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TIPO] — [Nombre del módulo/feature] — [YYYY-MM-DD]</title>
  <style>
    /* Dark mode base */
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --text-muted: #8b949e;
      --green: #3fb950;
      --amber: #d29922;
      --red: #f85149;
      --blue: #58a6ff;
      --purple: #bc8cff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: -apple-system, 'Segoe UI', sans-serif; line-height: 1.6; }
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1rem; }
    header h1 { font-size: 1.25rem; font-weight: 600; }
    .badge { padding: .25rem .75rem; border-radius: 9999px; font-size: .75rem; font-weight: 700; letter-spacing: .05em; }
    .badge-go, .badge-aprobado { background: #1a3a1a; color: var(--green); border: 1px solid var(--green); }
    .badge-bloqueado, .badge-nogo { background: #3a1a1a; color: var(--red); border: 1px solid var(--red); }
    .badge-progreso { background: #3a2a1a; color: var(--amber); border: 1px solid var(--amber); }
    main { max-width: 960px; margin: 2rem auto; padding: 0 2rem; }
    section { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1rem; font-weight: 600; color: var(--blue); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: .05em; }
    h3 { font-size: .9rem; font-weight: 600; margin-bottom: .5rem; }
    table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    th { text-align: left; padding: .5rem; border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 600; }
    td { padding: .5rem; border-bottom: 1px solid var(--border); }
    .severity-critical { color: var(--red); font-weight: 700; }
    .severity-high { color: #ff7b72; font-weight: 600; }
    .severity-medium { color: var(--amber); }
    .severity-low { color: var(--text-muted); }
    .checklist { list-style: none; }
    .checklist li { padding: .25rem 0; display: flex; align-items: flex-start; gap: .5rem; font-size: .875rem; }
    .checklist li::before { content: "✅"; flex-shrink: 0; }
    .checklist li.fail::before { content: "❌"; }
    .checklist li.warn::before { content: "⚠️"; }
    code { background: #0d1117; padding: .1rem .4rem; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: .8rem; }
    footer { text-align: center; padding: 2rem; color: var(--text-muted); font-size: .75rem; border-top: 1px solid var(--border); margin-top: 3rem; }
    .feedback { margin-top: 1rem; }
    .feedback textarea { width: 100%; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: .75rem; font-size: .875rem; resize: vertical; min-height: 80px; }
    .feedback button { margin-top: .5rem; background: var(--blue); color: #000; border: none; padding: .5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: .875rem; }
  </style>
</head>
<body>
  <header>
    <h1>[TIPO DE ARTEFACTO] — [Nombre]</h1>
    <span class="badge badge-progreso">EN_PROGRESO</span>
    <span style="margin-left:auto;color:var(--text-muted);font-size:.8rem;">[YYYY-MM-DD]</span>
  </header>
  <main>
    <!-- Secciones según el tipo de artefacto -->
  </main>
  <footer>
    Generado por Claude Code · [timestamp] · <a href="../" style="color:var(--blue)">← Índice</a>
    <div class="feedback">
      <textarea id="fb" placeholder="Describí qué cambiar..."></textarea>
      <button onclick="navigator.clipboard.writeText('Contexto: '+document.title+'\n\nFeedback:\n'+document.getElementById('fb').value)">Copiar como prompt</button>
    </div>
  </footer>
</body>
</html>
```

### Paso 4: Adaptar según el tipo

**Para reportes de auditoría / seguridad:**
- Tabla de hallazgos con columnas: Categoría | Severidad | Descripción | Estado | Mitigación
- Clasificar por severidad: CRITICAL → HIGH → MEDIUM → LOW
- Checklist OWASP Top 10

**Para specs de feature:**
- Sección de requerimientos (IN / OUT del scope)
- Interfaces TypeScript públicas en bloque `<code>`
- Árbol de archivos a crear/modificar/eliminar
- Supuestos explícitos
- Decisiones de diseño con pros/cons

**Para code review:**
- Resumen ejecutivo con badge de veredicto
- Tabla de hallazgos: Archivo | Línea | Tipo | Descripción | Sugerencia
- Tipos: BUG | SECURITY | PERF | CONVENTION | STYLE

**Para flujos de datos:**
- Diagrama SVG con capas: DB → SQL Views → API → Frontend
- Nodos por capa con colores diferenciados
- Conectores animados entre capas

### Paso 5: Guardar en la ruta correcta

```
docs/
  flows/[modulo]-flow-[YYYYMMDD].html
  specs/[feature]-spec-[YYYYMMDD].html
  audits/[feature]-[fase]-[YYYYMMDD].html
  reviews/[feature]-review-[YYYYMMDD].html
```

## Reglas de seguridad

- Sin datos de pacientes, DNI, credenciales, o secrets en artefactos HTML
- Sin `innerHTML = userInput` (XSS)
- Sin CDN externos — completamente autocontenido
- Sin `<link>` a hojas de estilo externas

## Notas

- Dark mode siempre para artefactos técnicos
- Badge de estado visible en el header
- Footer siempre con timestamp + botón "copiar como prompt"
- El HTML debe poder abrirse offline sin errores
