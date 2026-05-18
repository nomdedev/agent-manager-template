# /flows — Flow Visualizer Manager

Generates or updates data-flow visualization HTML files for the project's modules.

## Usage

- `/flows` — Shows status of all flows and which are stale/pending.
- `/flows all` — Regenerates ALL flows with `stale` or `pending` status.
- `/flows [name]` — Regenerates a specific flow by its ID.

## Regeneration Process

1. Read `.claude/logs/flow-state.json` to get current status.
2. For each flow to regenerate:
   a. Identify relevant DB tables/views, API routes, and components for the module.
   b. Generate an HTML visualization showing the data path from DB → API → Frontend.
   c. Save to `docs/flows/[module]-flow.html`.
   d. Update `flow-state.json` with `status: "generated"` and current timestamp.
3. Update `docs/flows/index.html` if any flow changed.

## Flow State File

`.claude/logs/flow-state.json` tracks each flow:

```json
{
  "flows": {
    "module-name": {
      "status": "generated | stale | pending",
      "path": "docs/flows/module-name-flow.html",
      "name": "Human-readable Name",
      "lastUpdated": "2026-01-01T00:00:00Z"
    }
  }
}
```

## Statuses

| Status | Meaning |
|--------|---------|
| `generated` | HTML exists and is up to date |
| `stale` | Source files changed since last generation |
| `pending` | Flow defined but never generated |

## Adding a New Flow

1. Add an entry to `flow-state.json` with `status: "pending"`.
2. Add the mapping to `.claude/hooks/PostToolUse/04-flow-stale-detector.py` so changes to source files mark it stale.
3. Run `/flows [name]` to generate it.
