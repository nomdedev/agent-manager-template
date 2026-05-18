#!/usr/bin/env bash
# Hook: Lint on Edit (PostToolUse)
# Rule 9 / Rule 12: Surface lint failures immediately after file writes

set -euo pipefail

INPUT=$(cat)
FILEPATH=$(echo "$INPUT" | jq -r '.tool_input.path // .tool_input.file_path // ""' 2>/dev/null || echo "")

if [[ -z "$FILEPATH" ]]; then
  exit 0
fi

AUDIT_LOG="${CLAUDE_AUDIT_LOG:-.claude/logs/audit.log}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
FAIL_ON_ERROR="${CLAUDE_FAIL_ON_LINT_ERROR:-false}"

# ─── Skip non-lintable files ─────────────────────────────────────────────
case "$FILEPATH" in
  *.lock|*.log|*.json|*.md|*.txt|*.env|*.yaml|*.yml)
    exit 0 ;;
esac

EXT="${FILEPATH##*.}"
LINT_FAILED=false

# ─── JavaScript / TypeScript ──────────────────────────────────────────────
if [[ "$EXT" == "js" || "$EXT" == "jsx" || "$EXT" == "ts" || "$EXT" == "tsx" ]]; then
  # Try local eslint first, then global
  ESLINT_BIN=""
  if [[ -f "node_modules/.bin/eslint" ]]; then
    ESLINT_BIN="node_modules/.bin/eslint"
  elif command -v eslint &>/dev/null; then
    ESLINT_BIN="eslint"
  fi

  if [[ -n "$ESLINT_BIN" ]]; then
    if ! "$ESLINT_BIN" --max-warnings=0 "$FILEPATH" 2>&1; then
      echo "⚠️  LINT: ESLint issues in $FILEPATH" >&2
      LINT_FAILED=true
      mkdir -p "$(dirname "$AUDIT_LOG")"
      echo "[$TIMESTAMP] LINT_FAIL: $FILEPATH (eslint)" >> "$AUDIT_LOG"
    fi
  fi

  # TypeScript check for .ts/.tsx files
  if [[ "$EXT" == "ts" || "$EXT" == "tsx" ]]; then
    TSC_BIN=""
    if [[ -f "node_modules/.bin/tsc" ]]; then
      TSC_BIN="node_modules/.bin/tsc"
    elif command -v tsc &>/dev/null; then
      TSC_BIN="tsc"
    fi
    if [[ -n "$TSC_BIN" ]]; then
      if ! "$TSC_BIN" --noEmit --skipLibCheck 2>&1 | head -20; then
        echo "⚠️  LINT: TypeScript errors in $FILEPATH" >&2
        LINT_FAILED=true
        mkdir -p "$(dirname "$AUDIT_LOG")"
        echo "[$TIMESTAMP] LINT_FAIL: $FILEPATH (tsc)" >> "$AUDIT_LOG"
      fi
    fi
  fi
fi

# ─── Python ──────────────────────────────────────────────────────────────
if [[ "$EXT" == "py" ]]; then
  if command -v ruff &>/dev/null; then
    if ! ruff check "$FILEPATH" 2>&1; then
      echo "⚠️  LINT: Ruff issues in $FILEPATH" >&2
      LINT_FAILED=true
      mkdir -p "$(dirname "$AUDIT_LOG")"
      echo "[$TIMESTAMP] LINT_FAIL: $FILEPATH (ruff)" >> "$AUDIT_LOG"
    fi
  elif command -v flake8 &>/dev/null; then
    if ! flake8 "$FILEPATH" 2>&1; then
      echo "⚠️  LINT: Flake8 issues in $FILEPATH" >&2
      LINT_FAILED=true
      echo "[$TIMESTAMP] LINT_FAIL: $FILEPATH (flake8)" >> "$AUDIT_LOG"
    fi
  fi
fi

# ─── Shell ────────────────────────────────────────────────────────────────
if [[ "$EXT" == "sh" || "$EXT" == "bash" ]]; then
  if command -v shellcheck &>/dev/null; then
    if ! shellcheck "$FILEPATH" 2>&1; then
      echo "⚠️  LINT: Shellcheck issues in $FILEPATH" >&2
      LINT_FAILED=true
      mkdir -p "$(dirname "$AUDIT_LOG")"
      echo "[$TIMESTAMP] LINT_FAIL: $FILEPATH (shellcheck)" >> "$AUDIT_LOG"
    fi
  fi
fi

if [[ "$LINT_FAILED" == "true" ]]; then
  echo "   Rule 12: Lint failures detected — review before considering this done." >&2
  if [[ "$FAIL_ON_ERROR" == "true" ]]; then
    exit 2
  fi
fi

exit 0
