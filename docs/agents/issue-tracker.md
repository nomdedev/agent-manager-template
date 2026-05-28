# Issue tracker: GitHub

Issues y PRDs de este repo viven como **GitHub Issues**. Usá `gh` para todas las operaciones.

## Convenciones

- **Crear issue**: `gh issue create --title "..." --body "..."` (heredoc para cuerpos largos).
- **Leer issue**: `gh issue view <número> --comments`.
- **Listar**: `gh issue list --state open --json number,title,body,labels`.
- **Comentar**: `gh issue comment <número> --body "..."`.
- **Labels**: `gh issue edit <número> --add-label "..."` / `--remove-label "..."`.
- **Cerrar**: `gh issue close <número> --comment "..."`.

`gh` infiere el repo desde `git remote` dentro del clone.

## Features del pipeline (agent-manager)

Además de GitHub Issues, el pipeline de 7 fases registra estado en:

- `.claude/logs/pipeline-state.json`
- Reportes por feature en `.claude/logs/audits/features/{feature-id}/`

Al publicar un PRD con `to-prd`, creá el issue en GitHub **y** registrá la feature en `pipeline-state.json` si el orquestador está activo.

## Cuando una skill dice "publish to the issue tracker"

Creá un GitHub issue con el cuerpo indicado.
