#!/usr/bin/env bash
# Hook: Auto Checkpoint Logger (PostToolUse)
# Rule 10: Checkpoint after every significant step

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null || echo "")
EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_response.exit_code // 0' 2>/dev/null || echo 0)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // .tool_input.path // ""' 2>/dev/null | head -c 200 || echo "")

CHECKPOINT_DIR="${CLAUDE_CHECKPOINT_DIR:-.claude/logs/checkpoints}"
mkdir -p "$CHECKPOINT_DIR"

LOG_FILE="$CHECKPOINT_DIR/session_$(date +%Y%m%d).log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

SIGNIFICANT_TOOLS=("Bash" "Write" "Edit" "MultiEdit")
IS_SIGNIFICANT=false
for T in "${SIGNIFICANT_TOOLS[@]}"; do
  if [[ "$TOOL_NAME" == "$T" ]]; then
    IS_SIGNIFICANT=true
    break
  fi
done

if $IS_SIGNIFICANT; then
  STATUS="SUCCESS"
  if [[ "$EXIT_CODE" != "0" && "$EXIT_CODE" != "null" && -n "$EXIT_CODE" ]]; then
    STATUS="FAILED"
  fi
  echo "[$TIMESTAMP] TOOL=$TOOL_NAME STATUS=$STATUS CMD=$CMD" >> "$LOG_FILE"
  if [[ "$STATUS" == "FAILED" ]]; then
    echo "⚠️  HOOK CHECKPOINT: $TOOL_NAME failed (exit code: $EXIT_CODE)" >&2
    echo "   Rule 10: Checkpoint after every step — review before continuing." >&2
    echo "   Use /checkpoint command to capture current state." >&2
  fi
fi

exit 0
