#!/usr/bin/env bash
# Hook: Token Budget Guard (PreToolUse)
# Rule 6: Token budgets are not advisory — surface breaches, don't hide them

set -euo pipefail

BUDGET_FILE="${CLAUDE_CHECKPOINT_DIR:-.claude/logs/checkpoints}/token_usage.json"
TASK_LIMIT="${CLAUDE_TOKEN_BUDGET_TASK:-4000}"
SESSION_LIMIT="${CLAUDE_TOKEN_BUDGET_SESSION:-30000}"

if [[ ! -f "$BUDGET_FILE" ]]; then
  mkdir -p "$(dirname "$BUDGET_FILE")"
  echo '{"session_tokens": 0, "task_tokens": 0, "session_start": "", "task_start": ""}' > "$BUDGET_FILE"
fi

SESSION_TOKENS=$(jq '.session_tokens // 0' "$BUDGET_FILE" 2>/dev/null || echo 0)
TASK_TOKENS=$(jq '.task_tokens // 0' "$BUDGET_FILE" 2>/dev/null || echo 0)

TASK_THRESHOLD=$(( TASK_LIMIT * 80 / 100 ))
if [[ "$TASK_TOKENS" -gt "$TASK_THRESHOLD" ]]; then
  echo "⚠️  TOKEN BUDGET [TASK]: ${TASK_TOKENS}/${TASK_LIMIT} used ($(( TASK_TOKENS * 100 / TASK_LIMIT ))%)" >&2
  echo "   Rule 6: Consider summarizing and starting fresh if > 100%." >&2
fi

if [[ "$TASK_TOKENS" -gt "$TASK_LIMIT" ]]; then
  echo "🚨 TOKEN BUDGET BREACH [TASK]: ${TASK_TOKENS}/${TASK_LIMIT}" >&2
  echo "   Rule 6: Task budget exceeded. Summarize current state and continue in a new task." >&2
fi

SESSION_THRESHOLD=$(( SESSION_LIMIT * 80 / 100 ))
if [[ "$SESSION_TOKENS" -gt "$SESSION_THRESHOLD" ]]; then
  echo "⚠️  TOKEN BUDGET [SESSION]: ${SESSION_TOKENS}/${SESSION_LIMIT} used ($(( SESSION_TOKENS * 100 / SESSION_LIMIT ))%)" >&2
  echo "   Rule 6: Approaching session limit. Prepare a /handoff summary." >&2
fi

if [[ "$SESSION_TOKENS" -gt "$SESSION_LIMIT" ]]; then
  echo "🚨 TOKEN BUDGET BREACH [SESSION]: ${SESSION_TOKENS}/${SESSION_LIMIT}" >&2
  echo "   Rule 6: STOP. Use /handoff command to hand off context before proceeding." >&2
fi

exit 0
