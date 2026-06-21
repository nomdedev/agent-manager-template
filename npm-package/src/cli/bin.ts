#!/usr/bin/env node
/**
 * auto-audit — CLI del Auto-Audit Loop
 * 
 * Uso:
 *   auto-audit <archivo> <agentes> [prioridad]
 *   auto-audit src/index.ts "typescript-expert security-auditor"
 *   auto-audit src/ "typescript-expert" CRITICAL
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHelp(): void {
  console.log(`
╔════════════════════════════════════════════╗
║   🔍 auto-audit — Auto-Audit Loop CLI     ║
╚════════════════════════════════════════════╝

Uso:
  auto-audit <archivo> <agentes> [prioridad]

Argumentos:
  archivo     Archivo o directorio a auditar
  agentes     Lista de agentes entre comillas, separados por espacio
  prioridad   CRITICAL | HIGH | MEDIUM | LOW (default: HIGH)

Ejemplos:
  auto-audit src/index.ts "typescript-expert security-auditor"
  auto-audit src/services/ "typescript-expert" CRITICAL
  auto-audit . "typescript-expert security-auditor qa-tester" LOW

Agentes disponibles:
  typescript-expert   Errores de tipo y lint
  security-auditor    Vulnerabilidades y CORS
  qa-tester           Tests y coverage
  frontend-expert     Componentes y accesibilidad
  backend-expert      APIs y performance
  devops-expert       Infra y CI/CD

Opciones:
  --help, -h          Mostrar esta ayuda
  --version, -v       Mostrar versión

Para más info: https://github.com/matiasscalbi/auto-audit-loop
`);
}

function showVersion(): void {
  const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
  console.log(`auto-audit v${pkg.version}`);
}

function readFileSync(path: string, encoding: string): string {
  return require('fs').readFileSync(path, encoding);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }

  const [filePath, agentsStr, priority = 'HIGH'] = args;

  if (!filePath || !agentsStr) {
    console.error('❌ Error: Se requiere archivo y agentes.');
    console.error('   Uso: auto-audit <archivo> <agentes> [prioridad]');
    process.exit(1);
  }

  const targetDir = process.cwd();
  const binPath = join(targetDir, 'bin', 'auto-audit.js');

  // Si existe el bin local, usarlo
  if (existsSync(binPath)) {
    try {
      execSync(`node "${binPath}" "${filePath}" "${agentsStr}" ${priority}`, {
        stdio: 'inherit',
        cwd: targetDir,
      });
    } catch (err) {
      process.exit(1);
    }
  } else {
    // Si no existe, mostrar error con instrucciones
    console.error(`
❌ No se encontró el script de auto-audit en:
   ${binPath}

ℹ️  Probablemente necesitás inicializar el auto-audit en este proyecto:

   auto-audit-init

O manualmente:

   npx @matiasscalbi/auto-audit-loop init
`);
    process.exit(1);
  }
}

main();
