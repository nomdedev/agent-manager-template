# Rule: HTML-First for Agent Outputs

**Applies to:** plans, specs, audits, reports, code reviews, architecture docs, dashboards, data flows, prototypes, phase gates.

> Markdown is for source code. HTML is for everything agents produce that a human will *read*.

---

## When to use HTML instead of Markdown

| Output type | Format |
|---|---|
| Architecture / data flow diagram | HTML (SVG + JS layers) |
| Phase gate report (Phases 1-7) | HTML |
| Security audit report | HTML (color-coded severity) |
| Sprint / feature spec | HTML (collapsible sections, copy-to-prompt buttons) |
| Code review report | HTML (annotated diff, severity badges) |
| Dashboard / metrics summary | HTML (charts, live filters) |
| Prototype / wireframe | HTML (interactive, no build step) |
| Simple inline answers, commit messages | Markdown / plain text |
| Source code documentation (docstrings, JSDoc) | Markdown (in-code) |

---

## Why HTML over Markdown for agent outputs

1. **Information density** — tables with color, SVG diagrams, collapsible sections, syntax highlighting, badges — none of this is possible in Markdown.
2. **Readability at scale** — nobody reads a 200-line `.md`. A well-structured HTML is scanned in seconds.
3. **Shareability** — drop it in a public bucket, paste the link. Zero tooling needed.
4. **Two-way interaction** — sliders, toggles, "copy as JSON/prompt" buttons let the reader feed structured edits back to the agent.
5. **Context ingestion** — Claude Code can read the filesystem, git history, MCPs and embed all of it into one navigable HTML artifact.

---

## Mandatory structure for HTML artifacts

Every HTML artifact produced by an agent MUST be:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Artifact type] — [Feature/Module name] — [YYYY-MM-DD]</title>
  <!-- All styles inline; no external CDN dependencies -->
  <style>/* ... */</style>
</head>
<body>
  <!-- Header: title, date, status badge -->
  <!-- Content: sections, diagrams, tables -->
  <!-- Footer: legend, generated-by, links to related artifacts -->
  <script>/* Interaction JS inline if needed */</script>
</body>
</html>
```

**Rules:**
- Fully self-contained (no external CDN, no `<link>` to external stylesheets).
- Dark-mode preferred for technical artifacts (easier on the eyes during review).
- Status badge in the header: `APPROVED` (green) | `BLOCKED` (red) | `IN-PROGRESS` (amber) | `GO` (green) | `NO-GO` (red).
- Footer with timestamp and, if applicable, a "copy as prompt" `<textarea>` for structured feedback.

---

## Where to save artifacts

```
docs/
  flows/       ← data flow diagrams per module
  specs/       ← feature specs, architecture decisions
  audits/      ← phase gate reports (security, QA, prod)
  reviews/     ← code review reports
```

---

## Copy-to-prompt pattern (optional but encouraged)

Add at the bottom of interactive specs and review reports:

```html
<section class="feedback">
  <h3>Send corrections back to agent</h3>
  <textarea id="feedback" placeholder="Describe what to change..."></textarea>
  <button onclick="navigator.clipboard.writeText(
    'Context: ' + document.title + '\n\nFeedback:\n' + document.getElementById('feedback').value
  )">Copy as prompt</button>
</section>
```

---

## Anti-patterns (never do these)

- ❌ Writing a 300-line `.md` audit report when an HTML with color-coded severity exists
- ❌ Linking to external CDNs (artifact must work offline)
- ❌ Generating HTML that embeds secrets, patient data, or internal IDs without auth
- ❌ Creating HTML artifacts with inline `onclick="eval(..."` or `innerHTML = userInput` (XSS)
- ❌ Saving artifacts outside the `docs/` tree (clutters root)
