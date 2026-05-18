#!/usr/bin/env bash
# Hook: Validate Dangerous Bash Commands (PreToolUse)
# Rule 12: Fail loud — block destructive operations before they run
# Reads tool input from stdin as JSON

set -euo pipefail

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \$HOME"
  "dd if=/dev/zero"
  "dd if=/dev/random"
  "> /dev/sda"
  "mkfs\."
  "fdisk /dev"
  "shutdown"
  "reboot"
  "halt"
  "curl .* | bash"
  "curl .* | sh"
  "wget .* | bash"
  "wget .* | sh"
  "sudo rm -rf"
  "chmod -R 777 /"
  "chown -R .* /"
  "iptables -F"
  "DROP TABLE"
  "TRUNCATE TABLE"
  "DELETE FROM .* WHERE 1"
  "cat \.env"
  "cat .env\."
  "printenv"
  "env |"
  "source \.env"
)

for PATTERN in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$PATTERN"; then
    echo "🚨 HOOK BLOCKED: Dangerous command detected." >&2
    echo "   Pattern matched: $PATTERN" >&2
    echo "   Command: $COMMAND" >&2
    echo "   Rule 12: Fail loud — this operation was blocked before execution." >&2
    exit 2
  fi
done

CAUTION_PATTERNS=(
  "rm -rf"
  "git push --force"
  "git push -f"
  "DROP DATABASE"
  "truncate"
  "pkill"
  "killall"
)

for PATTERN in "${CAUTION_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$PATTERN"; then
    echo "⚠️  HOOK WARNING: Caution-level command detected." >&2
    echo "   Pattern: $PATTERN" >&2
    echo "   Command: $COMMAND" >&2
    echo "   Proceeding — verify this is intentional (Rule 12)." >&2
    AUDIT_LOG="${CLAUDE_AUDIT_LOG:-.claude/logs/audit.log}"
    mkdir -p "$(dirname "$AUDIT_LOG")"
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] CAUTION_CMD: $COMMAND" >> "$AUDIT_LOG"
    break
  fi
done

exit 0
