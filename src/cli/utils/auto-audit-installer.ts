import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Instala el sistema Auto-Audit Loop en un proyecto existente.
 * Copia: skill, hook, script, comando, STATE.md template
 */
export function installAutoAudit(targetDir: string, templateRoot: string): void {
  const sourceDir = templateRoot;
  
  // 1. Crear directorios necesarios
  const dirs = [
    join(targetDir, '.claude', 'skills', 'auto-audit-loop'),
    join(targetDir, '.claude', 'hooks', 'PostToolUse'),
    join(targetDir, '.claude', 'hooks', 'PreToolUse'),
    join(targetDir, '.claude', 'commands'),
    join(targetDir, '.claude', 'logs', 'auto-audit', 'reports'),
    join(targetDir, 'bin'),
  ];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  // 2. Copiar archivos del sistema auto-audit
  const filesToCopy = [
    {
      src: join(sourceDir, '.claude', 'skills', 'auto-audit-loop', 'SKILL.md'),
      dest: join(targetDir, '.claude', 'skills', 'auto-audit-loop', 'SKILL.md'),
    },
    {
      src: join(sourceDir, '.claude', 'hooks', 'PostToolUse', '03-auto-audit-trigger.sh'),
      dest: join(targetDir, '.claude', 'hooks', 'PostToolUse', '03-auto-audit-trigger.sh'),
    },
    {
      src: join(sourceDir, 'bin', 'auto-audit.js'),
      dest: join(targetDir, 'bin', 'auto-audit.js'),
    },
    {
      src: join(sourceDir, '.claude', 'commands', 'auto-audit.md'),
      dest: join(targetDir, '.claude', 'commands', 'auto-audit.md'),
    },
  ];

  for (const { src, dest } of filesToCopy) {
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`  ✅ ${dest.replace(targetDir, '.')}`);
    } else {
      console.warn(`  ⚠️  No encontrado: ${src}`);
    }
  }

  // 3. Crear STATE.md inicial
  const statePath = join(targetDir, '.claude', 'logs', 'auto-audit', 'STATE.md');
  if (!existsSync(statePath)) {
    writeFileSync(statePath, generateInitialStateMd(), 'utf-8');
    console.log(`  ✅ ${statePath.replace(targetDir, '.')}`);
  }

  // 4. Actualizar package.json scripts
  updatePackageJson(targetDir);

  // 5. Crear .env.example si no existe
  updateEnvExample(targetDir);

  console.log('\n  🎉 Auto-Audit Loop instalado!');
  console.log('  Ejecutá: node bin/auto-audit.js <archivo> <agentes> [prioridad]');
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
    return;
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  
  // Agregar scripts si no existen
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

  // Agregar dependencias si no existen
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

// Helper para leer archivos
function readFileSync(path: string, encoding: BufferEncoding): string {
  return require('fs').readFileSync(path, encoding);
}
