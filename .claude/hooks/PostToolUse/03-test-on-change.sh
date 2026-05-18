#!/usr/bin/env bash
# Hook: Run Tests on Change (PostToolUse)
# Rule 9: Tests verify intent — run related tests after file edits

set -euo pipefail

INPUT=$(cat)
FILEPATH=$(echo "$INPUT" | jq -r '.tool_input.path // .tool_input.file_path // ""' 2>/dev/null || echo "")

if [[ -z "$FILEPATH" ]]; then
  exit 0
fi

FAIL_ON_ERROR="${CLAUDE_FAIL_ON_TEST_ERROR:-false}"
AUDIT_LOG="${CLAUDE_AUDIT_LOG:-.claude/logs/audit.log}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ─── Skip test files themselves and config files ──────────────────────────
case "$FILEPATH" in
  *.test.*|*.spec.*|*__tests__*|*vite.config*|*tsconfig*|*package.json)
    exit 0 ;;
esac

EXT="${FILEPATH##*.}"
BASENAME=$(basename "$FILEPATH" ".$EXT")
DIRNAME=$(dirname "$FILEPATH")
TEST_FILE=""
TEST_RUNNER=""

# ─── Find related test file (JS/TS) ──────────────────────────────────────
if [[ "$EXT" == "js" || "$EXT" == "jsx" || "$EXT" == "ts" || "$EXT" == "tsx" ]]; then
  CANDIDATES=(
    "$DIRNAME/$BASENAME.test.$EXT"
    "$DIRNAME/$BASENAME.spec.$EXT"
    "$DIRNAME/__tests__/$BASENAME.test.$EXT"
    "$DIRNAME/__tests__/$BASENAME.spec.$EXT"
    "src/__tests__/$BASENAME.test.$EXT"
  )
  for CANDIDATE in "${CANDIDATES[@]}"; do
    if [[ -f "$CANDIDATE" ]]; then
      TEST_FILE="$CANDIDATE"
      break
    fi
  done

  if [[ -n "$TEST_FILE" ]]; then
    if [[ -f "node_modules/.bin/vitest" ]]; then
      TEST_RUNNER="npx vitest run"
    elif [[ -f "node_modules/.bin/jest" ]]; then
      TEST_RUNNER="npx jest --no-coverage"
    fi
  fi
fi

# ─── Python ──────────────────────────────────────────────────────────────
if [[ "$EXT" == "py" ]]; then
  MODULE="${BASENAME#*_}"
  CANDIDATES=(
    "$DIRNAME/test_$BASENAME.py"
    "tests/test_$BASENAME.py"
    "tests/test_$MODULE.py"
  )
  for CANDIDATE in "${CANDIDATES[@]}"; do
    if [[ -f "$CANDIDATE" ]]; then
      TEST_FILE="$CANDIDATE"
      TEST_RUNNER="pytest -v --tb=short"
      break
    fi
  done
fi

# ─── Go ──────────────────────────────────────────────────────────────────
if [[ "$EXT" == "go" && "$FILEPATH" != *_test.go ]]; then
  TEST_FILE="${FILEPATH%.go}_test.go"
  if [[ -f "$TEST_FILE" ]]; then
    TEST_RUNNER="go test"
  fi
fi

# ─── Run tests if found ────────────────────────────────────────────────────
if [[ -n "$TEST_FILE" && -n "$TEST_RUNNER" ]]; then
  echo "🧪 Running related tests: $TEST_FILE" >&2
  if $TEST_RUNNER "$TEST_FILE" 2>&1; then
    echo "✅ Tests passed for $FILEPATH" >&2
    mkdir -p "$(dirname "$AUDIT_LOG")"
    echo "[$TIMESTAMP] TESTS_PASS: $FILEPATH" >> "$AUDIT_LOG"
  else
    echo "❌ Tests FAILED for $FILEPATH" >&2
    mkdir -p "$(dirname "$AUDIT_LOG")"
    echo "[$TIMESTAMP] TESTS_FAIL: $FILEPATH" >> "$AUDIT_LOG"
    echo "   Rule 12: Test failures mean this is NOT done. Fix before continuing." >&2
    if [[ "$FAIL_ON_ERROR" == "true" ]]; then
      exit 2
    fi
  fi
fi

exit 0
