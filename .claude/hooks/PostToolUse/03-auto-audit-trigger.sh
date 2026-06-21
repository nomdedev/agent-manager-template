#!/usr/bin/env bash
# Hook: Auto-Audit Trigger (PostToolUse)
# Activa automáticamente los agentes expertos según el archivo modificado
# Basado en el skill auto-audit-loop
#
# Este hook se ejecuta DESPUÉS de cada Write/Edit/MultiEdit y decide
# qué agentes expertos activar según las reglas de clasificación.

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null || echo "")
FILEPATH=$(echo "$INPUT" | jq -r '.tool_input.path // .tool_input.file_path // ""' 2>/dev/null || echo "")

# Solo procesar herramientas de escritura/edición
if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "MultiEdit" ]]; then
  exit 0
fi

if [[ -z "$FILEPATH" ]]; then
  exit 0
fi

# ─── Skip archivos no-relevantes ──────────────────────────────────────────
case "$FILEPATH" in
  *.lock|*.log|*.tmp|*.temp|node_modules/*|dist/*|.git/*)
    exit 0 ;;
esac

# ─── Configuración ────────────────────────────────────────────────────────
AUDIT_DIR="${CLAUDE_AUDIT_DIR:-.claude/logs/auto-audit}"
STATE_FILE="$AUDIT_DIR/STATE.md"
mkdir -p "$AUDIT_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
AGENTS_TO_ACTIVATE=""
PRIORITY="LOW"

# ─── Regla 1: Clasificar por extensión ────────────────────────────────────
EXT="${FILEPATH##*.}"
case "$EXT" in
  ts|tsx)
    AGENTS_TO_ACTIVATE="typescript-expert qa-tester"
    PRIORITY="MEDIUM"
    ;;
  js|jsx)
    AGENTS_TO_ACTIVATE="typescript-expert qa-tester"
    PRIORITY="MEDIUM"
    ;;
  css|html|tsx)
    AGENTS_TO_ACTIVATE="frontend-expert qa-tester"
    PRIORITY="MEDIUM"
    ;;
  json)
    if [[ "$FILEPATH" == *"package.json"* ]]; then
      AGENTS_TO_ACTIVATE="security-auditor typescript-expert"
      PRIORITY="HIGH"
    else
      AGENTS_TO_ACTIVATE="typescript-expert"
      PRIORITY="LOW"
    fi
    ;;
  sh|bash)
    AGENTS_TO_ACTIVATE="security-auditor devops-infra"
    PRIORITY="HIGH"
    ;;
  env|env.*)
    AGENTS_TO_ACTIVATE="security-auditor"
    PRIORITY="CRITICAL"
    ;;
  yml|yaml)
    AGENTS_TO_ACTIVATE="devops-infra security-auditor"
    PRIORITY="HIGH"
    ;;
  md)
    AGENTS_TO_ACTIVATE="documentation-expert"
    PRIORITY="LOW"
    ;;
  *)
    AGENTS_TO_ACTIVATE="reviewer"
    PRIORITY="LOW"
    ;;
esac

# ─── Regla 2: Clasificar por path ─────────────────────────────────────────
case "$FILEPATH" in
  src/routes/*|src/middleware/*)
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor"
    PRIORITY="HIGH"
    ;;
  src/services/*|src/tools/*)
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE performance"
    ;;
  src/cli/*)
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor"
    PRIORITY="HIGH"
    ;;
  src/config/*)
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor"
    PRIORITY="HIGH"
    ;;
  .claude/hooks/*)
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor devops-infra"
    PRIORITY="HIGH"
    ;;
  external/*)
    AGENTS_TO_ACTIVATE="security-auditor"
    PRIORITY="CRITICAL"
    ;;
esac

# ─── Regla 3: Detectar patrones críticos en el archivo ────────────────────
if [[ -f "$FILEPATH" && -r "$FILEPATH" ]]; then
  # Leer solo las primeras 100 líneas para performance
  FILE_CONTENT=$(head -n 100 "$FILEPATH" 2>/dev/null || echo "")
  
  # Patrones críticos de seguridad
  if echo "$FILE_CONTENT" | grep -qiE "(exec|spawn|eval)\s*\("; then
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor"
    PRIORITY="CRITICAL"
  fi
  
  if echo "$FILE_CONTENT" | grep -qiE "(password|token|secret|api_key|private_key)"; then
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor"
    PRIORITY="CRITICAL"
  fi
  
  if echo "$FILE_CONTENT" | grep -qiE "(DROP\s+TABLE|DELETE\s+FROM|TRUNCATE\s+TABLE)"; then
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor"
    PRIORITY="CRITICAL"
  fi
  
  if echo "$FILE_CONTENT" | grep -qiE "(chmod|chown|sudo)"; then
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor devops-infra"
    PRIORITY="HIGH"
  fi
  
  if echo "$FILE_CONTENT" | grep -qiE "(fetch|axios|http\.request)"; then
    AGENTS_TO_ACTIVATE="$AGENTS_TO_ACTIVATE security-auditor"
    PRIORITY="MEDIUM"
  fi
fi

# ─── Deduplicar agentes ────────────────────────────────────────────────────
AGENTS_TO_ACTIVATE=$(echo "$AGENTS_TO_ACTIVATE" | tr ' ' '\n' | sort -u | tr '\n' ' ' | sed 's/ $//')

# ─── Log y notificación ──────────────────────────────────────────────────
if [[ -n "$AGENTS_TO_ACTIVATE" ]]; then
  echo "🔍 AUTO-AUDIT: Archivo modificado → $FILEPATH" >&2
  echo "   Agentes activados: $AGENTS_TO_ACTIVATE" >&2
  echo "   Prioridad: $PRIORITY" >&2
  
  # Escribir al state file
  echo "[$TIMESTAMP] FILE=$FILEPATH AGENTS=[$AGENTS_TO_ACTIVATE] PRIORITY=$PRIORITY" >> "$AUDIT_DIR/trigger.log"
  
  # Si es CRITICAL, notificar inmediatamente
  if [[ "$PRIORITY" == "CRITICAL" ]]; then
    echo "🚨 AUTO-AUDIT CRITICAL: Se detectaron patrones de seguridad en $FILEPATH" >&2
    echo "   Se requiere revisión de security-auditor antes de continuar." >&2
  fi
  
  # Intentar ejecutar el auto-audit si existe el script
  if command -v node &>/dev/null && [[ -f "bin/auto-audit.js" ]]; then
    node bin/auto-audit.js "$FILEPATH" "$AGENTS_TO_ACTIVATE" "$PRIORITY" &
    disown 2>/dev/null || true
  fi
fi

exit 0
