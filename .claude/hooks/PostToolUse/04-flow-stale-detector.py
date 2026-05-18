#!/usr/bin/env python3
"""
Hook: Flow Stale Detector (PostToolUse)
Detects changes in files that affect visualized data flows
and marks the corresponding flows as 'stale' for regeneration.

Customize FLOW_MAP for your project's module structure.
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime, timezone

# ─── Map file patterns to affected flows ──────────────────────────────────
# Format: (file_path_pattern, flow_id, flow_display_name)
# flow_id "__all__" marks ALL flows as stale
#
# Customize this for your project's structure:
FLOW_MAP = [
    # Example mappings — replace with your project's files and modules
    ("src/app/api/",          "__all__",  "All flows"),
    ("src/pages/",            "__all__",  "All flows"),
    ("src/views/",            "__all__",  "All flows"),
    ("db/schema",             "__all__",  "All flows"),
    ("src/store/useStore.ts", "__all__",  "All flows"),
    ("src/lib/db.ts",         "__all__",  "All flows"),
    # Add specific module mappings here:
    # ("src/pages/Dashboard.tsx", "dashboard", "Dashboard"),
    # ("src/app/api/users/",      "users",     "Users"),
]

FLOW_STATE_PATH = Path(".claude/logs/flow-state.json")
AUDIT_LOG = Path(os.environ.get("CLAUDE_AUDIT_LOG", ".claude/logs/audit.log"))


def detect_affected_flows(filepath: str) -> list[dict]:
    """Returns list of flows affected by the modified file."""
    affected = []
    normalized = filepath.replace("\\", "/")
    for pattern, flow_id, flow_name in FLOW_MAP:
        if pattern in normalized:
            affected.append({"id": flow_id, "name": flow_name, "pattern": pattern})
    return affected


def load_flow_state() -> dict:
    """Loads flow-state.json or returns an empty default state."""
    if FLOW_STATE_PATH.exists():
        try:
            return json.loads(FLOW_STATE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    # Default empty state — flows will be added as they are defined
    return {"flows": {}}


def save_flow_state(state: dict) -> None:
    FLOW_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    FLOW_STATE_PATH.write_text(
        json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def append_audit(message: str) -> None:
    AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with AUDIT_LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")


def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            sys.exit(0)

        data = json.loads(raw)
        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        # Only act on write/edit operations
        if tool_name not in ("Write", "Edit", "MultiEdit"):
            sys.exit(0)

        # Extract the modified file path
        filepath = tool_input.get("file_path") or tool_input.get("path", "")
        if not filepath:
            sys.exit(0)

        affected = detect_affected_flows(filepath)
        if not affected:
            sys.exit(0)

        state = load_flow_state()
        marked = []

        for flow in affected:
            flow_id = flow["id"]

            if flow_id == "__all__":
                # Mark all known flows as stale
                for fid, fdata in state.get("flows", {}).items():
                    if fdata.get("status") == "generated":
                        state["flows"][fid]["status"] = "stale"
                        marked.append(fid)
            else:
                # Mark specific flow as stale
                if flow_id in state.get("flows", {}):
                    if state["flows"][flow_id].get("status") == "generated":
                        state["flows"][flow_id]["status"] = "stale"
                        marked.append(flow_id)

        if marked:
            save_flow_state(state)
            unique_marked = list(dict.fromkeys(marked))
            msg = f"[flow-stale-detector] Marked stale: {', '.join(unique_marked)} (changed: {filepath})"
            append_audit(msg)
            # Notify Claude Code without blocking
            print(f"\n⚠️  Flow visualizations outdated: {', '.join(unique_marked)}\nRun /flows to regenerate.", file=sys.stderr)

    except json.JSONDecodeError:
        sys.exit(0)
    except Exception:
        # Fail silently — this hook is non-blocking
        sys.exit(0)


if __name__ == "__main__":
    main()
