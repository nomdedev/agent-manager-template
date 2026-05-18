# Skill: Git Workflow

## Propósito
Gestionar el flujo de trabajo con Git: commits, branches, merge, resolución de conflictos y PRs siguiendo buenas prácticas.

## Cuándo activar este skill
- El usuario pide "commit", "branch", "merge", "PR", "pull request"
- "Sube esto", "pushea", "committea estos cambios"
- "Resolve conflictos", "resuelve conflictos"
- "Qué cambió desde...", "dame un diff", "historial de..."

## Cuándo NO usar este skill
- Cuando el usuario solo quiere ver el estado actual (usar git status directamente)
- Cuando está pidiendo revertir cambios destructivos sin entender las consecuencias (preguntar primero)

## Proceso paso a paso

### Para COMMITS:

#### Paso 1: Verificar estado
Ejecutar `git status` y `git diff` para entender qué cambió.

#### Paso 2: Staging selectivo
Preferir `git add <archivo>` sobre `git add .` para evitar commitear archivos no deseados.

#### Paso 3: Mensaje de commit
Formato Conventional Commits:
```
tipo(scope): descripción breve

Cuerpo opcional con contexto del por qué.

Co-Authored-By: Claude <noreply@anthropic.com>
```

Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`

#### Paso 4: Verificar
`git log -1` para confirmar que el commit es correcto.

### Para BRANCHES:

#### Crear branch
```bash
git checkout main
git pull origin main
git checkout -b feat/nombre-descriptivo
# o fix/ para bugs, chore/ para mantenimiento
```

#### Naming convention
- `feat/descripcion` — nuevas features
- `fix/descripcion` — bug fixes
- `refactor/descripcion` — refactoring
- `chore/descripcion` — mantenimiento (deps, config)
- `docs/descripcion` — documentación

### Para PRs:

#### Paso 1: Verificar readiness
- Todos los tests pasan
- No hay linting errors
- Branch actualizada con main

#### Paso 2: Crear PR
```bash
git push -u origin feat/branch-name
gh pr create --title "tipo: descripción" --body "..."
```

Body del PR:
```markdown
## Summary
- Qué cambios se hicieron y por qué

## Test plan
- [ ] Cómo verificar los cambios manualmente
- [ ] Tests automatizados que cubren el cambio
```

### Para CONFLICTOS:

#### Paso 1: No panique
Los conflictos son normales. Leer cada conflicto cuidadosamente.

#### Paso 2: Resolver manualmente
Preferir resolución manual sobre herramientas automáticas. Entender qué cambió en cada lado antes de elegir.

#### Paso 3: Verificar
Después de resolver, ejecutar tests para verificar que nada se rompió.

## Ejemplos

### Ejemplo de entrada:
"Committea los cambios del servicio de agent"

### Ejemplo de salida esperada:
Commit creado con mensaje descriptivo tipo `feat(agent): add message streaming support`.

## Patrones comunes y cómo manejarlos
- **Commit que toca demasiadas cosas**: Sugerir dividir en commits más pequeños y atómicos
- **Merge conflict en lock files**: Generalmente aceptar ambas versiones y regenerar
- **Force push necesario**: Siempre preguntar antes. Preferir `--force-with-lease`

## Errores frecuentes a evitar
- No commitear sin revisar `git diff` primero
- No usar `git add .` cuando hay archivos que no pertenecen al commit
- No hacer push --force sin confirmación explícita del usuario
- No hacer amend en commits que ya fueron pusheados (reescribe historia)
- No usar --no-verify para saltear hooks

## Output esperado
Operación git ejecutada correctamente con mensajes descriptivos, siguiendo conventional commits. Si hay conflictos, resueltos de forma segura.
