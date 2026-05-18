#!/usr/bin/env bash
# Hook: Task Notifier (Notification)
# Notifies when Claude has completed a long-running task
# Rule 10: Surface state changes — don't let completions go unnoticed

set -euo pipefail

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude task update"' 2>/dev/null || echo "Claude task update")
TITLE=$(echo "$INPUT" | jq -r '.title // "AgentManager"' 2>/dev/null || echo "AgentManager")

AUDIT_LOG="${CLAUDE_AUDIT_LOG:-.claude/logs/audit.log}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log to audit trail
mkdir -p "$(dirname "$AUDIT_LOG")"
echo "[$TIMESTAMP] NOTIFICATION: $TITLE — $MESSAGE" >> "$AUDIT_LOG"

# ─── Platform-specific notification ──────────────────────────────────────
if command -v osascript &>/dev/null; then
  # macOS
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\"" 2>/dev/null || true
elif command -v notify-send &>/dev/null; then
  # Linux (libnotify)
  notify-send "$TITLE" "$MESSAGE" --icon=dialog-information 2>/dev/null || true
else
  # Terminal fallback: bell + echo
  printf '\a' 2>/dev/null || true
  echo "" >&2
  echo "🔔 [$TITLE] $MESSAGE" >&2
  echo "" >&2
fi

exit 0
