#!/usr/bin/env python3
"""
Hook: Pipeline Phase Guard (PreToolUse)
Regla: Ninguna feature se deploya, mergea o pushea a produccion sin que
pipeline-state.json refleje Fase 7: GO para esa feature.
Tambien bloquea edicion de archivos criticos en produccion si hay features
en pipeline sin completar las fases previas.
"""

import json
import sys
import re
from pathlib import Path
from datetime import datetime, timezone

PIPELINE_STATE = Path(".claude/logs/pipeline-state.json")
AUDIT_LOG = Path(".claude/logs/audit.log")

# ─── Helper: log to audit ──────────────────────────────────────────────
def log_audit(message):
    AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).isoformat()
    with open(AUDIT_LOG, "a") as f:
        f.write(f"[{ts}] PIPELINE_GUARD: {message}\n")

# ─── Helper: load pipeline state ───────────────────────────────────────
def load_pipeline_state():
    if not PIPELINE_STATE.exists():
        return None
    try:
        with open(PIPELINE_STATE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None

# ─── Helper: find active features (not GO and phase > 0) ──────────────
def get_active_features(data):
    if not data or "features" not in data:
        return []
    active = []
    for feat in data["features"]:
        status = feat.get("status", "")
        phase = feat.get("currentPhase", 0)
        if status != "GO" and phase > 0:
            active.append(feat)
    return active

# ─── Detectar operaciones de deploy/produccion ─────────────────────────
def is_deploy_operation(cmd):
    if not cmd:
        return False
    patterns = [
        r"git push.*origin.*main",
        r"git push.*main\b",
        r"npm run deploy",
        r"vercel --prod",
        r"vercel deploy",
        r"npx vercel --prod",
    ]
    for p in patterns:
        if re.search(p, cmd, re.IGNORECASE):
            return True
    return False

# ─── Detectar edicion de archivos criticos ─────────────────────────────
def is_critical_production_file(filepath):
    if not filepath:
        return False
    critical_patterns = [
        "src/api/",
        "src/lib/db",
        "src/store/",
        "schema.sql",
        "seed.js",
        ".env",
    ]
    for p in critical_patterns:
        if p in filepath:
            return True
    return False

# ─── Main ──────────────────────────────────────────────────────────────
def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})
    command = tool_input.get("command", "")
    filepath = tool_input.get("path", tool_input.get("file_path", ""))

    # Verificar override manual
    content = tool_input.get("content", "")
    if isinstance(content, str) and "# pipeline-override" in content:
        log_audit(f"OVERRIDE used for {tool_name} path={filepath} cmd={command}")
        sys.exit(0)

    state = load_pipeline_state()
    if not state:
        sys.exit(0)

    active = get_active_features(state)
    if not active:
        sys.exit(0)

    feat = active[0]
    feature_name = feat.get("name", "feature desconocida")
    phase = feat.get("currentPhase", 0)
    team = feat.get("currentTeam", "Equipo desconocido")

    # ─── BLOQUEO 1: Deploy/Produccion sin GO ───────────────────────────
    if tool_name == "Bash" and is_deploy_operation(command):
        print("", file=sys.stderr)
        print("  DEPLOY BLOQUEADO por Pipeline Phase Guard", file=sys.stderr)
        print("  Hay feature(s) activas que no han alcanzado Fase 7 (GO).", file=sys.stderr)
        print("", file=sys.stderr)
        print(f"  Feature activa: {feature_name}", file=sys.stderr)
        print(f"  Fase actual: {phase}", file=sys.stderr)
        print(f"  Equipo actual: {team}", file=sys.stderr)
        print("", file=sys.stderr)
        print("  Regla de orquestacion: Ningun deploy a produccion sin veredicto GO.", file=sys.stderr)
        print("  Completar el pipeline: Diseno → Backend → Seguridad → Develop → QA → Produccion.", file=sys.stderr)
        print("", file=sys.stderr)
        log_audit(f"BLOCKED_DEPLOY feature='{feature_name}' phase='{phase}' command='{command}'")
        sys.exit(2)

    # ─── BLOQUEO 2: Edicion de archivos criticos con feature en fase temprana
    if tool_name in ("Write", "Edit", "MultiEdit") and is_critical_production_file(filepath):
        if phase < 4:
            print("", file=sys.stderr)
            print("  EDICION BLOQUEADA por Pipeline Phase Guard", file=sys.stderr)
            print("  Se intenta modificar un archivo critico de produccion mientras", file=sys.stderr)
            print("  una feature esta en fase temprana del pipeline (antes de Seguridad).", file=sys.stderr)
            print("", file=sys.stderr)
            print(f"  Archivo: {filepath}", file=sys.stderr)
            print(f"  Feature activa: {feature_name}", file=sys.stderr)
            print(f"  Fase actual: {phase} ({team})", file=sys.stderr)
            print("", file=sys.stderr)
            print("  Regla: El Equipo 3 (Seguridad) debe aprobar antes de tocar archivos de produccion.", file=sys.stderr)
            print("  Para forzar (solo si es fix urgente de produccion): agregar # pipeline-override al final de la operacion.", file=sys.stderr)
            print("", file=sys.stderr)
            log_audit(f"BLOCKED_EDIT feature='{feature_name}' phase='{phase}' file='{filepath}'")
            sys.exit(2)

    # ─── WARNING: Build/test con pipeline activo ────────────────────────
    if tool_name == "Bash" and command:
        build_patterns = [r"npm run build", r"next build", r"tsc --noEmit", r"vitest run"]
        for p in build_patterns:
            if re.search(p, command, re.IGNORECASE):
                print("", file=sys.stderr)
                print("  PIPELINE WARNING: Comando de build/test con feature activa en pipeline.", file=sys.stderr)
                print(f"  Feature: {feature_name} | Fase: {phase}", file=sys.stderr)
                print("  Verificar que el build no incluya codigo de la feature en progreso.", file=sys.stderr)
                print("", file=sys.stderr)
                log_audit(f"WARN_BUILD feature='{feature_name}' phase='{phase}' command='{command}'")
                break

    sys.exit(0)


if __name__ == "__main__":
    main()
