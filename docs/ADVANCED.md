# Configuración avanzada (opcional)

## gstack (Garry Tan)

Equipo virtual de ingeniería: `/review`, `/ship`, `/qa`, `/office-hours`, `/browse`, etc.

```bash
pnpm run gstack:install
# o: claudio gstack install
```

Qué hace:

1. Clona o actualiza `https://github.com/garrytan/gstack` en `~/.claude/skills/gstack`.
2. Ejecuta `./setup --team` (requiere **bash** y **bun**).
3. No vendorea archivos en el repo — modo team recomendado por gstack.

Verificación:

```bash
claudio gstack status
claudio doctor
```

Documentación del repo: sección **gstack** en `.claude/CLAUDE.md`.

## Hermes Agent

```bash
claudio hermes install
```

Solo hace esto:

1. Comprueba que **git** esté instalado.
2. Consulta el **último release** en GitHub (`NousResearch/hermes-agent`).
3. **Clona o actualiza** el repo en:
   - Windows: `%LOCALAPPDATA%\hermes\hermes-agent`
   - Linux/macOS: `~/.hermes/hermes-agent`

No instala Python, npm, ni ejecuta scripts del sistema. Para usar Hermes como aplicación, seguí el README del repo clonado.

Integración con este template:

```bash
claudio hermes init programmer
claudio hermes optimize .
```

## Vault de Obsidian

```bash
claudio evoluciona ./mi-proyecto
```

## Referencia

- [REFERENCE.md](REFERENCE.md)
- [README.md](../README.md)
