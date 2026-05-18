---
description: Run tests with coverage for specified module
---

Run project tests$ARGUMENTS.

With module specified: run tests for that module with coverage
Without arguments: run full test suite with coverage

Report:
- Tests passing/failing
- Coverage per file
- Tests without assertions (empty tests)
- Source files without corresponding tests

Format: table with metrics + list of issues found.

Save summary to `.claude/logs/checkpoints/test-results-{date}.md`.
