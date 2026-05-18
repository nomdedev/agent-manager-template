---
description: Security audit focused (OWASP Top 10)
---

Run a focused security audit.

Scope: $ARGUMENTS (options: deps, code, secrets, auth, api, all — default: all)

OWASP Top 10 Checklist:
- A01 Broken Access Control
- A02 Cryptographic Failures
- A03 Injection (XSS, SQL injection, template injection)
- A04 Insecure Design
- A05 Security Misconfiguration
- A06 Vulnerable Components (npm audit)
- A07 Authentication Failures
- A08 Software Integrity
- A09 Security Logging & Monitoring
- A10 SSRF

Report format:
- CRITICAL 🔴 (blocks deploy)
- HIGH 🟠 (48h)
- MEDIUM 🟡 (high priority backlog)
- LOW 🟢 (document)
- INFO 🔵 (informational)

OWASP Score: X/10 controls implemented.
Immediate recommendations ordered by priority.

Save report to `.claude/logs/audits/security/owasp-{date}.md` and update `.claude/logs/audits/registry.json`.
