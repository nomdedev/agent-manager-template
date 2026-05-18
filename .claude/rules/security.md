# Security Rules — Generic Project

## Sensitive Data
This system may handle sensitive user data. Treat all user data as potentially sensitive.

### Prohibited
- Logging user data in console.log in production
- Storing sensitive data in localStorage or sessionStorage
- Exposing internal IDs in public URLs without authentication
- Sending user data to third-party analytics without consent

## Environment Variables
- Never use client-side env prefixes (e.g., `VITE_`) for secrets — they get embedded in the bundle
- API keys, tokens and secrets: server-side only, never in client code
- Never hardcode `.env` values directly in source code

## No Hardcoding — Absolute Rule
Every value that changes between environments or is sensitive MUST go in environment variables:
- Database credentials (user, password, host, database name)
- Connection strings (`postgresql://user:pass@host/db` → use `process.env.DATABASE_URL`)
- API keys and third-party tokens
- External service URLs
- Usernames and passwords of any kind
- Authorization headers in client HTTP calls

## User Inputs
- Sanitize all input before rendering as HTML
- No `dangerouslySetInnerHTML` without DOMPurify or equivalent sanitizer
- Validate data format on the client (real validation is backend's responsibility)

## Dependencies
- Review vulnerabilities with `npm audit` before every release
- Don't install dependencies without reviewing maintenance and reputation
- Keep dependencies updated (especially security-related ones)

## Hooks — What They Block Automatically
Project hooks detect and block (exit 2 = total block, warning = notice):

| Pattern | Level | Hook |
|---------|-------|------|
| `password = "..."` hardcoded | CRITICAL | 03-write-security-scan.py |
| `postgresql://user:pass@host` | CRITICAL | 03-write-security-scan.py |
| Secret exposed via client env prefix | CRITICAL | 03-write-security-scan.py |
| `localStorage.setItem` with sensitive data | CRITICAL | 03-write-security-scan.py |
| `Authorization: Bearer xyz` hardcoded | CRITICAL | 03-write-security-scan.py |
| `console.log` with sensitive data | WARNING | 03-write-security-scan.py |
| `process.env.SECRET` in client code | WARNING | 03-write-security-scan.py |
| `username: "admin"` hardcoded | WARNING | 03-write-security-scan.py |
| `cat .env`, `printenv`, `source .env` | BLOCKED | 01-validate-dangerous-bash.sh |
| `git push origin main` without test | BLOCKED | 04-git-push-main-guard.sh |

To suppress a justified false positive, add `# claude-security-ok` at the end of the line.

## Hooks (Important Note)
Hooks MUST NOT:
- Read variables from the `.env` file
- Execute `cat .env`, `printenv`, `env |`, or `echo $VARIABLE`
- Use `source .env` or `. .env`
- Hooks are self-contained system commands without access to project secrets
