import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { installAutoAudit } from '../utils/auto-audit-installer.js';
import { getTemplateRoot } from '../utils/project.js';

export interface AutoAuditInstallFlags {
  targetDir?: string;
  yes?: boolean;
}

export async function runAutoAuditInstall(flags: AutoAuditInstallFlags): Promise<void> {
  const templateRoot = getTemplateRoot(import.meta.url);
  
  let targetDir: string;
  
  if (flags.targetDir) {
    targetDir = resolve(flags.targetDir);
  } else {
    targetDir = process.cwd();
  }

  if (!existsSync(targetDir)) {
    console.log(`\n📁 Creando directorio: ${targetDir}`);
    require('fs').mkdirSync(targetDir, { recursive: true });
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🔍 Auto-Audit Loop — Instalador          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`  Origen:  ${templateRoot}`);
  console.log(`  Destino: ${targetDir}\n`);
  console.log('  Esto va a:\n');
  console.log('    · Copiar skill auto-audit-loop');
  console.log('    · Copiar hook PostToolUse (auto-trigger)');
  console.log('    · Copiar script bin/auto-audit.js');
  console.log('    · Copiar comando /auto-audit');
  console.log('    · Crear STATE.md inicial');
  console.log('    · Actualizar package.json (scripts + devDeps)');
  console.log('    · Crear .env.example con ALLOWED_ORIGINS\n');

  if (!flags.yes) {
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

  try {
    installAutoAudit(targetDir, templateRoot);
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅  Instalación completada!              ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('Próximo paso:\n');
    console.log(`  cd ${targetDir}`);
    console.log('  pnpm install   (si no lo hiciste)');
    console.log('  pnpm auto-audit src/index.ts "typescript-expert security-auditor"\n');
    console.log('  O ejecutá manualmente:');
    console.log('  node bin/auto-audit.js <archivo> <agentes> [prioridad]\n');
    console.log('  El hook se activa automáticamente al editar archivos.\n');
    console.log('  Para cron job diario:');
    console.log('  claudio cron create auto-audit-diario "0 9 * * *"\n');
    
  } catch (err) {
    console.error('\n❌ Error durante la instalación:', err);
    process.exit(1);
  }
}
