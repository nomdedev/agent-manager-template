#!/usr/bin/env node
/**
 * auto-audit-init — Inicializa Auto-Audit Loop en un proyecto
 * 
 * Uso:
 *   auto-audit-init [carpeta] [--yes]
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

// Obtener directorio del package instalado
const __dirname = dirname(new URL(import.meta.url).pathname);
const TEMPLATES_DIR = join(__dirname, '../../templates');

function showHelp(): void {
  console.log(`
╔════════════════════════════════════════════╗
║   🔍 auto-audit-init — Instalador         ║
╚════════════════════════════════════════════╝

Uso:
  auto-audit-init [carpeta] [--yes]

Argumentos:
  carpeta    Directorio del proyecto (default: actual)
  --yes      No preguntar confirmaciones

Ejemplos:
  auto-audit-init
  auto-audit-init ./mi-proyecto
  auto-audit-init ./mi-proyecto --yes

Para más info: https://github.com/matiasscalbi/auto-audit-loop
`);
}

function showVersion(): void {
  const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
  console.log(`auto-audit-init v${pkg.version}`);
}

function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

async function installAutoAudit(targetDir: string, yes: boolean): Promise<void> {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🔍 Auto-Audit Loop — Instalador          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`  Destino: ${targetDir}\n`);
  console.log('  Esto va a:\n');
  console.log('    · Copiar skill auto-audit-loop');
  console.log('    · Copiar hook PostToolUse (auto-trigger)');
  console.log('    · Copiar script bin/auto-audit.js');
  console.log('    · Copiar comando /auto-audit');
  console.log('    · Crear STATE.md inicial');
  console.log('    · Actualizar package.json (scripts + devDeps)');
  console.log('    · Crear .env.example con ALLOWED_ORIGINS\n');

  if (!yes) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    const answer = await new Promise<string>((resolve) => {
      rl.question('¿Continuar? [Y/n] ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() === 'n') {
      console.log('\n❌ Cancelado.\n');
      process.exit(0);
    }
  }

  // Crear directorios
  const dirs = [
    join(targetDir, '.claude', 'skills', 'auto-audit-loop'),
    join(targetDir, '.claude', 'hooks', 'PostToolUse'),
    join(targetDir, '.claude', 'commands'),
    join(targetDir, '.claude', 'logs', 'auto-audit', 'reports'),
    join(targetDir, 'bin'),
  ];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  // Copiar templates
  const templates = [
    { src: 'skill.md', dest: join(targetDir, '.claude', 'skills', 'auto-audit-loop', 'SKILL.md') },
    { src: 'hook.sh', dest: join(targetDir, '.claude', 'hooks', 'PostToolUse', '03-auto-audit-trigger.sh') },
    { src: 'script.js', dest: join(targetDir, 'bin', 'auto-audit.js') },
    { src: 'command.md', dest: join(targetDir, '.claude', 'commands', 'auto-audit.md') },
  ];

  for (const { src, dest } of templates) {
    const srcPath = join(TEMPLATES_DIR, src);
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, dest);
      console.log(`  ✅ ${dest.replace(targetDir, '.')}`);
    } else {
      console.warn(`  ⚠️  Template no encontrado: ${src}`);
    }
  }

  // Crear STATE.md
  const statePath = join(targetDir, '.claude', 'logs', 'auto-audit', 'STATE.md');
  if (!existsSync(statePath)) {
    writeFileSync(statePath, generateInitialStateMd(), 'utf-8');
    console.log(`  ✅ ${statePath.replace(targetDir, '.')}`);
  }

  // Actualizar package.json
  updatePackageJson(targetDir);

  // Crear .env.example
  updateEnvExample(targetDir);

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   ✅  Instalación completada!              ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log('Próximo paso:\n');
  console.log(`  cd ${targetDir}`);
  console.log('  pnpm install   (si no lo hiciste)');
  console.log('  pnpm auto-audit src/index.ts "typescript-expert security-auditor"\n');
  console.log('  El hook se activa automáticamente al editar archivos.\n');
}

function generateInitialStateMd(): string {
  return `# Auto-Audit State

> Sistema de seguimiento de auditorías automáticas.
> Este archivo se actualiza automáticamente después de cada ejecución de agentes expertos.

## Última ejecución: NUNCA
## Tarea actual: Ninguna
## Archivos afectados: Ninguno

---

### Hallazgos abiertos

| ID | Agente | Severidad | Archivo | Descripción | Estado | Fecha |
|----|--------|-----------|---------|-------------|--------|-------|
| N/A | N/A | N/A | N/A | N/A | N/A | N/A |

### Hallazgos cerrados

| ID | Agente | Severidad | Archivo | Descripción | Resolución | Fecha |
|----|--------|-----------|---------|-------------|------------|-------|
| N/A | N/A | N/A | N/A | N/A | N/A | N/A |

---

### Métricas

- Total hallazgos: 0
- Abiertos: 0
- Cerrados: 0
- Score de calidad: N/A

### Agentes ejecutados (última sesión)

| Agente | Estado | Hallazgos | Tiempo |
|--------|--------|-----------|--------|
| N/A | N/A | N/A | N/A |

---

## Instrucciones

1. Este archivo se actualiza automáticamente por el hook \`03-auto-audit-trigger.sh\`
2. No editar manualmente a menos que sea para limpiar hallazgos obsoletos
3. El orquestador lee este archivo antes de cada ejecución para contexto
4. Los hallazgos CRITICAL bloquean el pipeline hasta resolución
`;
}

function updatePackageJson(targetDir: string): void {
  const pkgPath = join(targetDir, 'package.json');
  
  if (!existsSync(pkgPath)) {
    console.warn('  ⚠️  No se encontró package.json. Creando uno básico...');
    writeFileSync(pkgPath, generateBasicPackageJson(), 'utf-8');
    console.log('  ✅ package.json creado');
    return;
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  
  // Agregar scripts
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts['auto-audit']) {
    pkg.scripts['auto-audit'] = 'node bin/auto-audit.js';
  }
  if (!pkg.scripts['test:coverage']) {
    pkg.scripts['test:coverage'] = 'vitest run --coverage';
  }
  if (!pkg.scripts['typecheck']) {
    pkg.scripts['typecheck'] = 'tsc --noEmit';
  }
  if (!pkg.scripts['lint']) {
    pkg.scripts['lint'] = 'eslint src/ tests/';
  }

  // Agregar devDependencies
  pkg.devDependencies = pkg.devDependencies || {};
  const devDeps = ['vitest', '@vitest/coverage-v8', 'eslint', 'typescript'];
  for (const dep of devDeps) {
    if (!pkg.devDependencies[dep]) {
      pkg.devDependencies[dep] = 'latest';
    }
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log('  ✅ package.json actualizado (scripts + devDependencies)');
}

function updateEnvExample(targetDir: string): void {
  const envExamplePath = join(targetDir, '.env.example');
  const envPath = join(targetDir, '.env');
  
  const envContent = `# Auto-Audit Loop Configuration
# Configurar ALLOWED_ORIGINS para CORS en producción
ALLOWED_ORIGINS=https://tu-dominio.vercel.app

# Variables de entorno existentes...
`;

  if (!existsSync(envExamplePath)) {
    writeFileSync(envExamplePath, envContent, 'utf-8');
    console.log('  ✅ .env.example creado');
  }

  if (!existsSync(envPath)) {
    writeFileSync(envPath, envContent, 'utf-8');
    console.log('  ✅ .env creado (revisar y completar)');
  }
}

function generateBasicPackageJson(): string {
  return JSON.stringify({
    name: 'mi-proyecto',
    version: '0.1.0',
    type: 'module',
    scripts: {
      'auto-audit': 'node bin/auto-audit.js',
      'test': 'vitest run',
      'test:coverage': 'vitest run --coverage',
      'typecheck': 'tsc --noEmit',
      'lint': 'eslint src/',
    },
    devDependencies: {
      'vitest': 'latest',
      '@vitest/coverage-v8': 'latest',
      'eslint': 'latest',
      'typescript': 'latest',
    },
  }, null, 2) + '\n';
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }

  const yes = args.includes('--yes') || args.includes('-y');
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const resolvedDir = resolve(targetDir);

  if (!existsSync(resolvedDir)) {
    console.log(`\n📁 Creando directorio: ${resolvedDir}`);
    mkdirSync(resolvedDir, { recursive: true });
  }

  await installAutoAudit(resolvedDir, yes);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
