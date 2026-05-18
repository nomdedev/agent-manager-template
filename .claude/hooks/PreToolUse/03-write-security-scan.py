#!/usr/bin/env python3
"""
Hook: Write Security Scan (PreToolUse)
Scans file content before write/edit operations for security anti-patterns.
Rule 12: Fail loud — surface security issues before they land in the codebase.
"""

import json
import sys
import re
from pathlib import Path
from datetime import datetime, timezone

# ─── Security patterns to detect ──────────────────────────────────────────
CRITICAL_PATTERNS = [
    # Hardcoded secrets
    (r'(?i)(password|passwd|pwd)\s*=\s*["\'][^"\']{3,}["\']', "Hardcoded password"),
    (r'(?i)(api_key|apikey|api-key)\s*=\s*["\'][A-Za-z0-9+/]{10,}["\']', "Hardcoded API key"),
    (r'(?i)(secret|token)\s*=\s*["\'][A-Za-z0-9+/]{10,}["\']', "Hardcoded secret/token"),
    (r'(?i)aws_access_key_id\s*=\s*["\']?AKI[A-Z0-9]{17}', "AWS Access Key ID"),
    (r'(?i)aws_secret_access_key\s*=\s*["\'][A-Za-z0-9+/]{40}["\']', "AWS Secret Key"),
    (r'-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----', "Private key in source"),
    (r'(?i)bearer\s+[A-Za-z0-9\-._~+/]{20,}', "Bearer token in source"),
    # Connection strings con credenciales embebidas
    (r'(?i)(postgres|postgresql|mysql|mongodb|redis|amqp)://[^:]+:[^@]{3,}@', "Connection string with embedded credentials"),
    (r'(?i)Data Source=.*Password\s*=\s*[^;]{3,}', "Connection string with embedded password"),
    # VITE_ prefix en secrets (quedan embebidos en el bundle del cliente)
    (r'VITE_(SECRET|TOKEN|PASSWORD|PASSWD|KEY|AUTH|API_KEY|PRIVATE)', "Secret exposed via VITE_ prefix — use server-side only"),
    # Headers Authorization hardcodeados en cliente
    (r'["\']Authorization["\']\s*:\s*["\']Bearer\s+[A-Za-z0-9\-._~+/]{10,}', "Hardcoded Authorization header"),
    (r'["\']Authorization["\']\s*:\s*["\']Basic\s+[A-Za-z0-9+/]{8,}', "Hardcoded Basic auth header"),
    # localStorage / sessionStorage con datos sensibles (PHI)
    (r'localStorage\.setItem\(["\'][^"\'"]*(password|token|secret|auth|paciente|patient|dni|historial)[^"\']*["\']', "Storing sensitive/PHI data in localStorage"),
    (r'sessionStorage\.setItem\(["\'][^"\'"]*(password|token|secret|auth|paciente|patient|dni|historial)[^"\']*["\']', "Storing sensitive/PHI data in sessionStorage"),
    # SQL Injection risks
    (r'f".*SELECT.*{', "Potential SQL injection via f-string"),
    (r'f".*INSERT.*{', "Potential SQL injection via f-string"),
    (r'f".*UPDATE.*{', "Potential SQL injection via f-string"),
    (r'f".*DELETE.*{', "Potential SQL injection via f-string"),
    (r'\+ ".*WHERE', "Potential SQL injection via concatenation"),
    # Command injection
    (r'subprocess\.call\(.*shell=True', "Shell injection risk (shell=True)"),
    (r'os\.system\(f"', "Command injection via f-string + os.system"),
    (r'eval\(.*input\(', "Eval of user input"),
    (r'exec\(.*request\.', "Exec of request data"),
    # XSS / template injection
    (r'dangerouslySetInnerHTML', "React dangerouslySetInnerHTML — verify sanitization"),
    (r'innerHTML\s*=\s*.*\+', "innerHTML concatenation — XSS risk"),
    (r'document\.write\(', "document.write — XSS risk"),
]

WARNING_PATTERNS = [
    (r'TODO.*security', "TODO with security implication"),
    (r'FIXME.*auth', "FIXME with auth implication"),
    (r'(?i)# noqa.*security', "Security check suppressed"),
    (r'(?i)# type: ignore', "Type checking suppressed"),
    (r'verify=False', "SSL verification disabled"),
    (r'ssl_verify\s*=\s*False', "SSL verification disabled"),
    (r'check_hostname\s*=\s*False', "Hostname check disabled"),
    (r'(?i)debug\s*=\s*True', "Debug mode enabled — remove before production"),
    (r'(?i)allow_all_origins', "CORS allow-all — verify intent"),
    # console.log con datos de pacientes / PHI
    (r'console\.(log|error|warn|info)\(.*\b(paciente|patient|dni|historial|diagnostico|presupuesto|nombre|telefono)\b', "console.log with potential PHI data — remove before production"),
    # process.env usado en código cliente (no server)
    (r'process\.env\.[A-Z_]*(SECRET|TOKEN|PASSWORD|KEY|AUTH|PRIVATE)', "process.env with secret in client-side code — use server-side only"),
    # Hardcoded usernames/credentials
    (r'(?i)(username|usuario|user)\s*[:=]\s*["\']admin["\']', "Hardcoded admin username"),
    (r'(?i)(username|usuario|user)\s*[:=]\s*["\']root["\']', "Hardcoded root username"),
]

SCANNABLE_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.java', '.rb', '.php',
    '.sh', '.bash', '.env', '.yaml', '.yml', '.json', '.toml', '.tf',
    '.sql', '.graphql', '.gql'
}

SKIP_PATTERNS = [
    r'node_modules/',
    r'\.git/',
    r'dist/',
    r'build/',
    r'\.min\.js$',
    r'package-lock\.json$',
    r'yarn\.lock$',
    r'__pycache__/',
]


def should_skip(filepath: str) -> bool:
    return any(re.search(p, filepath) for p in SKIP_PATTERNS)


def get_file_extension(filepath: str) -> str:
    return Path(filepath).suffix.lower()


def scan_content(content: str, filepath: str) -> tuple:
    critical = []
    warnings = []
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        # Skip lines with explicit override comment
        if 'claude-security-ok' in line:
            continue
        for pattern, description in CRITICAL_PATTERNS:
            if re.search(pattern, line):
                critical.append({
                    'line': line_num,
                    'description': description,
                    'content': line.strip()[:120]
                })
        for pattern, description in WARNING_PATTERNS:
            if re.search(pattern, line):
                warnings.append({
                    'line': line_num,
                    'description': description,
                    'content': line.strip()[:120]
                })
    return critical, warnings


def log_audit(filepath: str, issues: list, warnings: list):
    audit_log = ".claude/logs/audit.log"
    Path(".claude/logs").mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    with open(audit_log, 'a') as f:
        if issues:
            f.write(f"[{timestamp}] SECURITY_CRITICAL file={filepath} issues={len(issues)}\n")
        if warnings:
            f.write(f"[{timestamp}] SECURITY_WARN file={filepath} warnings={len(warnings)}\n")


def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_input = data.get('tool_input', {})
    filepath = tool_input.get('path', tool_input.get('file_path', ''))
    content = tool_input.get('content', tool_input.get('new_content', ''))

    if not filepath or not content:
        sys.exit(0)

    if should_skip(filepath):
        sys.exit(0)

    ext = get_file_extension(filepath)
    if ext not in SCANNABLE_EXTENSIONS:
        sys.exit(0)

    critical, warnings = scan_content(content, filepath)
    log_audit(filepath, critical, warnings)

    if warnings:
        print(f"⚠️  SECURITY SCAN [{filepath}]: {len(warnings)} warning(s)", file=sys.stderr)
        for w in warnings[:3]:
            print(f"   Line {w['line']}: {w['description']}", file=sys.stderr)
            print(f"   → {w['content']}", file=sys.stderr)

    if critical:
        print(f"\n🚨 SECURITY SCAN BLOCKED [{filepath}]: {len(critical)} critical issue(s)", file=sys.stderr)
        for issue in critical:
            print(f"   Line {issue['line']}: {issue['description']}", file=sys.stderr)
            print(f"   → {issue['content']}", file=sys.stderr)
        print("\n   Rule 12: Fail loud — fix security issues before writing this file.", file=sys.stderr)
        print("   If this is a false positive, add an inline comment: # claude-security-ok", file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == '__main__':
    main()
