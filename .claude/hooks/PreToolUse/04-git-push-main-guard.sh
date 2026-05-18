#!/usr/bin/env bash
# Hook: Git Push Main Guard (PreToolUse)
# Blocks push to main if commits aren't in origin/test first.

set -euo pipefail

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

if ! echo "$COMMAND" | grep -qE "git push"; then
  exit 0
fi

if ! echo "$COMMAND" | grep -qE "\bmain\b"; then
  exit 0
fi

LOCAL_SHA=$(git rev-parse HEAD 2>/dev/null || echo "")

if [[ -z "$LOCAL_SHA" ]]; then
  exit 0
fi

git fetch origin test --quiet 2>/dev/null || true

if git branch -r --contains "$LOCAL_SHA" 2>/dev/null | grep -q "origin/test"; then
  exit 0
fi

echo "" >&2
echo "  PUSH BLOCKED by Hook" >&2
echo "  Cannot push to 'main' without first pushing to 'test'." >&2
echo "" >&2
echo "  Steps:" >&2
echo "    1. git push origin test" >&2
echo "    2. git push origin main" >&2
echo "" >&2
exit 2
