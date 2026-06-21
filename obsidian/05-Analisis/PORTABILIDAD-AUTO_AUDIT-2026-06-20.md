# 🔄 Portabilidad del Auto-Audit Loop — Guía Completa

> Fecha: 2026-06-20
> Autor: Matias Scalbi
> Repo: agent-manager-template

---

## TL;DR — Instalación en 30 segundos

```bash
# Desde el repo agent-manager-template
claudio auto-audit-install ./mi-proyecto --yes

# O desde cualquier lugar con el CLI instalado
claudio auto-audit-install /ruta/al/proyecto
```

---

## ¿Qué se instala?

| Componente | Archivo | Peso | Función |
|-----------|---------|------|---------|
| **Skill** | `.claude/skills/auto-audit-loop/SKILL.md` | ~10KB | Conocimiento del sistema |
| **Hook** | `.claude/hooks/PostToolUse/03-auto-audit-trigger.sh` | ~6KB | Trigger automático |
| **Script** | `bin/auto-audit.js` | ~20KB | Orquestador Node.js |
| **Comando** | `.claude/commands/auto-audit.md` | ~2KB | `/auto-audit` en Claude Code |
| **State** | `.claude/logs/auto-audit/STATE.md` | ~1KB | Seguimiento de hallazgos |
| **Reports** | `.claude/logs/auto-audit/reports/*.html` | Variable | Reportes HTML |

**Total: ~40KB + dependencias**

---

## Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| `vitest` | `latest` | Tests y coverage |
| `@vitest/coverage-v8` | `latest` | Cobertura de código |
| `eslint` | `latest` | Linting |
| `typescript` | `latest` | Type checking |

**Nota:** Si el proyecto ya tiene estas dependencias, no se tocan.

---

## Modos de Instalación

### 1. CLI (Recomendado)

```bash
# Instalar en proyecto actual
claudio auto-audit-install

# Instalar en otro proyecto
claudio auto-audit-install ./mi-proyecto

# Sin confirmaciones (CI/CD)
claudio auto-audit-install ./mi-proyecto --yes
```

### 2. Menú Interactivo

```bash
claudio
# Elegir: "Instalar Auto-Audit Loop"
# Seguir wizard
```

### 3. Manual (para debugging)

```bash
# Copiar archivos
cp -r .claude/skills/auto-audit-loop ./mi-proyecto/.claude/skills/
cp .claude/hooks/PostToolUse/03-auto-audit-trigger.sh ./mi-proyecto/.claude/hooks/PostToolUse/
cp bin/auto-audit.js ./mi-proyecto/bin/
cp .claude/commands/auto-audit.md ./mi-proyecto/.claude/commands/

# Crear STATE.md
mkdir -p ./mi-proyecto/.claude/logs/auto-audit/reports
cat > ./mi-proyecto/.claude/logs/auto-audit/STATE.md << 'EOF'
# Auto-Audit State
## Última ejecución: NUNCA
## Tarea actual: Ninguna
### Hallazgos abiertos: Ninguno
### Hallazgos cerrados: Ninguno
EOF

# Agregar scripts a package.json
# (ver template en docs/AUTO_AUDIT_PORTABILITY.md)
```

### 4. npm Package (Futuro)

```bash
# Cuando publiquemos el package
npm install -g @matiasscalbi/auto-audit-loop
auto-audit-init ./mi-proyecto
```

---

## Post-Instalación

### 1. Instalar dependencias

```bash
cd ./mi-proyecto
pnpm install  # o npm install
```

### 2. Configurar .env

```bash
# .env
ALLOWED_ORIGINS=https://tu-dominio.vercel.app
OPENAI_API_KEY=sk-...  # Si usás agentes con LLM
```

### 3. Verificar instalación

```bash
# Test manual
node bin/auto-audit.js src/index.ts "typescript-expert security-auditor"

# O con pnpm
pnpm auto-audit src/index.ts "typescript-expert security-auditor"
```

### 4. Activar hook (opcional)

En Claude Code, el hook se activa automáticamente al editar archivos.

---

## Arquitectura Portable

```
┌─────────────────────────────────────────┐
│           Nuevo Proyecto                 │
│  (cualquier repo con package.json)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    claudio auto-audit-install          │
│         --yes ./mi-proyecto             │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌───────┐   ┌──────────┐  ┌──────────┐
│ Skill  │   │ Hook     │  │ Script   │
│ 10KB   │   │ 6KB      │  │ 20KB     │
└───┬───┘   └────┬─────┘  └────┬─────┘
    │            │             │
    └────────────┼─────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │   package.json updated  │
    │   + vitest              │
    │   + @vitest/coverage-v8 │
    │   + eslint              │
    │   + typescript          │
    └─────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │   .env.example creado   │
    │   ALLOWED_ORIGINS=...   │
    └─────────────────────────┘
```

---

## Integración con CI/CD

### GitHub Actions

```yaml
# .github/workflows/auto-audit.yml
name: Auto-Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm auto-audit src/ "typescript-expert security-auditor qa-tester" HIGH
      - uses: actions/upload-artifact@v3
        with:
          name: audit-reports
          path: .claude/logs/auto-audit/reports/
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit (o husky)
#!/bin/bash
node bin/auto-audit.js --staged "typescript-expert security-auditor"
if [ $? -ne 0 ]; then
  echo "❌ Auto-audit falló. Corregí los errores antes de commitear."
  exit 1
fi
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "No se encontró package.json" | El instalador crea uno básico. Revisar y ajustar. |
| "Hook no se activa en Windows" | Requiere Git Bash. Ejecutar: `chmod +x .claude/hooks/**/*.sh` |
| "npm audit falla con pnpm" | El script detecta automáticamente. Si falla, editar `bin/auto-audit.js` |
| "Tests fallan en nuevo proyecto" | Asegurar que `vitest.config.ts` excluya `external/` y `node_modules/` |
| "CORS error en producción" | Configurar `ALLOWED_ORIGINS` en `.env` |

---

## Métricas de Portabilidad

| Métrica | Valor |
|---------|-------|
| **Archivos copiados** | 5 |
| **Tamaño total** | ~40KB |
| **Dependencias agregadas** | 4 (dev) |
| **Tiempo de instalación** | < 5 segundos |
| **Proyectos testeados** | 1 (test-proyecto) |
| **Build exitoso** | ✅ |
| **Tests pasando** | 126/126 |

---

## Archivos Creados/Modificados en el Template

| Archivo | Cambio |
|---------|--------|
| `src/cli/claudio.ts` | + Comando `auto-audit-install` |
| `src/cli/catalog.ts` | + Documentación del comando |
| `src/cli/commands/menu.ts` | + Opción en menú interactivo |
| `src/cli/commands/auto-audit-install.ts` | Nuevo — comando CLI |
| `src/cli/utils/auto-audit-installer.ts` | Nuevo — lógica de instalación |
| `src/cli/utils/args.ts` | + Parser de argumentos |
| `docs/AUTO_AUDIT_PORTABILITY.md` | Nuevo — guía completa |

---

## Próximos Pasos

1. **Publicar npm package** — `npm publish` para instalación global
2. **GitHub Action** — Action oficial para CI/CD
3. **Docker image** — Container con todo pre-instalado
4. **VS Code Extension** — Integración en el IDE

---

*Sistema portable creado por Matias Scalbi*
*Para agent-manager-template y cualquier proyecto*
