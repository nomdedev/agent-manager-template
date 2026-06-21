#!/usr/bin/env node
/**
 * Auto-Audit Orchestrator
 * 
 * Cerebro del sistema de loops de análisis automático.
 * Recibe: archivo modificado, lista de agentes, prioridad
 * Hace: ejecuta agentes en paralelo, recolecta hallazgos, actualiza STATE.md
 * 
 * Uso: node bin/auto-audit.js <filepath> <agents> <priority>
 * Ejemplo: node bin/auto-audit.js src/services/agent.ts "typescript-expert qa-tester" HIGH
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AUDIT_DIR = '.claude/logs/auto-audit';
const STATE_FILE = path.join(AUDIT_DIR, 'STATE.md');
const REPORTS_DIR = path.join(AUDIT_DIR, 'reports');

// ─── Agente definitions ────────────────────────────────────────────────

const AGENT_DEFINITIONS = {
  'typescript-expert': {
    name: 'TypeScript Expert',
    gate: 'tsc --noEmit',
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    description: 'Audita tipos, arquitectura, y code smells en TypeScript'
  },
  'security-auditor': {
    name: 'Security Auditor',
    gate: 'npm audit',
    files: ['src/**/*', '.env*', 'package.json'],
    description: 'Busca vulnerabilidades, secretos expuestos, y problemas de seguridad'
  },
  'qa-tester': {
    name: 'QA Tester',
    gate: 'vitest run',
    files: ['tests/**/*', 'src/**/*.ts'],
    description: 'Verifica cobertura de tests, calidad, y casos edge'
  },
  'frontend-expert': {
    name: 'Frontend Expert',
    gate: 'pnpm build',
    files: ['src/**/*.{css,html,tsx}', 'public/**/*'],
    description: 'Audita UI/UX, accesibilidad, y rendimiento frontend'
  },
  'devops-infra': {
    name: 'DevOps Infra',
    gate: 'vercel --preview',
    files: ['vercel.json', '.github/**/*', 'Dockerfile*'],
    description: 'Verifica configuración de deploy, CI/CD, e infraestructura'
  },
  'performance': {
    name: 'Performance Expert',
    gate: 'vitest bench',
    files: ['src/services/*', 'src/tools/*'],
    description: 'Analiza rendimiento, benchmarks, y optimizaciones'
  },
  'reviewer': {
    name: 'Code Reviewer',
    gate: 'review checklist',
    files: ['**/*'],
    description: 'Revisión general de calidad, convenciones, y mejores prácticas'
  }
};

// ─── Utilidades ───────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getTimestamp() {
  return new Date().toISOString();
}

function generateId() {
  return `A${Date.now().toString(36).toUpperCase()}`;
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { findings: [], lastRun: null, metrics: {} };
  }
  // Parse simple desde markdown (versión básica)
  const content = fs.readFileSync(STATE_FILE, 'utf-8');
  return parseState(content);
}

function parseState(content) {
  // Versión simplificada - en producción usar parser más robusto
  const findings = [];
  const lines = content.split('\n');
  let inOpen = false;
  let inClosed = false;
  
  for (const line of lines) {
    if (line.includes('### Hallazgos abiertos')) inOpen = true;
    if (line.includes('### Hallazgos cerrados')) { inOpen = false; inClosed = true; }
    if (line.startsWith('|') && !line.includes('---') && !line.includes('N/A')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 6) {
        findings.push({
          id: parts[0],
          agent: parts[1],
          severity: parts[2],
          file: parts[3],
          description: parts[4],
          status: parts[5],
          type: inOpen ? 'open' : 'closed'
        });
      }
    }
  }
  
  return { findings, lastRun: null, metrics: {} };
}

function writeState(state, filepath, agents, priority) {
  const openFindings = state.findings.filter(f => f.type === 'open');
  const closedFindings = state.findings.filter(f => f.type === 'closed');
  
  const openTable = openFindings.length > 0 
    ? openFindings.map(f => `| ${f.id} | ${f.agent} | ${f.severity} | ${f.file} | ${f.description} | ${f.status} | ${getTimestamp().split('T')[0]} |`).join('\n')
    : '| N/A | N/A | N/A | N/A | N/A | N/A | N/A |';
    
  const closedTable = closedFindings.length > 0
    ? closedFindings.map(f => `| ${f.id} | ${f.agent} | ${f.severity} | ${f.file} | ${f.description} | ${f.status} | ${getTimestamp().split('T')[0]} |`).join('\n')
    : '| N/A | N/A | N/A | N/A | N/A | N/A | N/A |';

  const content = `# Auto-Audit State

> Sistema de seguimiento de auditorías automáticas del Agent Manager Template.
> Este archivo se actualiza automáticamente después de cada ejecución de agentes expertos.

## Última ejecución: ${getTimestamp()}
## Tarea actual: ${filepath}
## Archivos afectados: ${filepath}
## Agentes activados: ${agents}
## Prioridad: ${priority}

---

### Hallazgos abiertos

| ID | Agente | Severidad | Archivo | Descripción | Estado | Fecha |
|----|--------|-----------|---------|-------------|--------|-------|
${openTable}

### Hallazgos cerrados

| ID | Agente | Severidad | Archivo | Descripción | Resolución | Fecha |
|----|--------|-----------|---------|-------------|------------|-------|
${closedTable}

---

### Métricas

- Total hallazgos: ${state.findings.length}
- Abiertos: ${openFindings.length}
- Cerrados: ${closedFindings.length}
- Score de calidad: ${calculateScore(state.findings)}/100

### Agentes ejecutados (última sesión)

| Agente | Estado | Hallazgos | Tiempo |
|--------|--------|-----------|--------|
${agents.split(' ').map(a => `| ${a} | COMPLETED | - | - |`).join('\n')}

---

## Instrucciones

1. Este archivo se actualiza automáticamente por el hook \`03-auto-audit-trigger.sh\`
2. No editar manualmente a menos que sea para limpiar hallazgos obsoletos
3. El orquestador lee este archivo antes de cada ejecución para contexto
4. Los hallazgos CRITICAL bloquean el pipeline hasta resolución
`;

  fs.writeFileSync(STATE_FILE, content, 'utf-8');
}

function calculateScore(findings) {
  if (findings.length === 0) return 100;
  const openCritical = findings.filter(f => f.type === 'open' && f.severity === 'CRITICAL').length;
  const openHigh = findings.filter(f => f.type === 'open' && f.severity === 'HIGH').length;
  const openMedium = findings.filter(f => f.type === 'open' && f.severity === 'MEDIUM').length;
  const openLow = findings.filter(f => f.type === 'open' && f.severity === 'LOW').length;
  
  let score = 100;
  score -= openCritical * 25;
  score -= openHigh * 10;
  score -= openMedium * 5;
  score -= openLow * 2;
  
  return Math.max(0, score);
}

// ─── Ejecución de agentes ─────────────────────────────────────────────────

function runAgentGate(agentKey, agentDef) {
  console.log(`\n🔍 [${agentDef.name}] Ejecutando gate: ${agentDef.gate}`);
  
  try {
    // Buscar binario local primero, luego global
    let cmd = agentDef.gate;
    if (cmd === 'tsc --noEmit') {
      cmd = 'npx tsc --noEmit';
    } else if (cmd === 'vitest run') {
      cmd = 'npx vitest run';
    } else if (cmd === 'vitest bench') {
      cmd = 'npx vitest bench';
    } else if (cmd === 'pnpm build') {
      cmd = 'pnpm build';
    } else if (cmd === 'npm audit') {
      cmd = 'npm audit';
    }
      
    const result = execSync(cmd, { 
      encoding: 'utf-8', 
      timeout: 120000,
      cwd: process.cwd()
    });
    console.log(`✅ [${agentDef.name}] Gate PASÓ`);
    return { passed: true, output: result };
  } catch (error) {
    console.log(`❌ [${agentDef.name}] Gate FALLÓ`);
    return { passed: false, output: error.stdout || error.message };
  }
}

function runAgentAnalysis(agentKey, agentDef, filepath) {
  console.log(`\n🤖 [${agentDef.name}] Analizando: ${filepath}`);
  
  // Aquí es donde en el futuro se conectaría con delegate_task
  // Por ahora, ejecutamos análisis básico basado en el tipo de agente
  
  const findings = [];
  
  switch (agentKey) {
    case 'typescript-expert':
      findings.push(...analyzeTypeScript(filepath));
      break;
    case 'security-auditor':
      findings.push(...analyzeSecurity(filepath));
      break;
    case 'qa-tester':
      findings.push(...analyzeQA(filepath));
      break;
    case 'reviewer':
      findings.push(...analyzeReview(filepath));
      break;
    default:
      findings.push({
        id: generateId(),
        agent: agentDef.name,
        severity: 'INFO',
        file: filepath,
        description: `Análisis pendiente para ${agentDef.name}`,
        status: 'PENDING'
      });
  }
  
  return findings;
}

function analyzeTypeScript(filepath) {
  const findings = [];
  
  // Verificar si el archivo tiene extensión .ts
  if (!filepath.endsWith('.ts') && !filepath.endsWith('.tsx')) {
    return findings;
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    
    // Detectar 'any' implícito
    if (content.includes(': any')) {
      findings.push({
        id: generateId(),
        agent: 'TypeScript Expert',
        severity: 'MEDIUM',
        file: filepath,
        description: 'Uso explícito de tipo `any` detectado',
        status: 'OPEN'
      });
    }
    
    // Detectar console.log
    if (content.includes('console.log')) {
      findings.push({
        id: generateId(),
        agent: 'TypeScript Expert',
        severity: 'LOW',
        file: filepath,
        description: 'console.log encontrado - usar logger estructurado',
        status: 'OPEN'
      });
    }
    
    // Detectar TODO sin issue
    if (content.includes('TODO') || content.includes('FIXME')) {
      findings.push({
        id: generateId(),
        agent: 'TypeScript Expert',
        severity: 'LOW',
        file: filepath,
        description: 'TODO/FIXME encontrado - considerar crear issue',
        status: 'OPEN'
      });
    }
    
  } catch (e) {
    // Archivo no existe o no es legible
  }
  
  return findings;
}

function analyzeSecurity(filepath) {
  const findings = [];
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    
    // Detectar eval/exec
    if (content.includes('eval(') || content.match(/exec\s*\(/)) {
      findings.push({
        id: generateId(),
        agent: 'Security Auditor',
        severity: 'CRITICAL',
        file: filepath,
        description: 'Uso de eval/exec detectado - riesgo de code injection',
        status: 'OPEN'
      });
    }
    
    // Detectar secretos hardcodeados
    if (content.match(/(api[_-]?key|secret|token|password)\s*[:=]\s*["\'][^"\']{8,}/i)) {
      findings.push({
        id: generateId(),
        agent: 'Security Auditor',
        severity: 'CRITICAL',
        file: filepath,
        description: 'Posible secreto hardcodeado detectado',
        status: 'OPEN'
      });
    }
    
    // Detectar CORS abierto
    if (content.includes('origin: true') || content.includes("'*'")) {
      findings.push({
        id: generateId(),
        agent: 'Security Auditor',
        severity: 'HIGH',
        file: filepath,
        description: 'CORS configurado de forma permisiva',
        status: 'OPEN'
      });
    }
    
  } catch (e) {
    // Archivo no existe o no es legible
  }
  
  return findings;
}

function analyzeQA(filepath) {
  const findings = [];
  
  // Verificar si existe test correspondiente
  const testPath = filepath.replace('src/', 'tests/unit/').replace('.ts', '.test.ts');
  if (!fs.existsSync(testPath) && filepath.startsWith('src/')) {
    findings.push({
      id: generateId(),
      agent: 'QA Tester',
      severity: 'MEDIUM',
      file: filepath,
      description: `No se encontró test unitario: ${testPath}`,
      status: 'OPEN'
    });
  }
  
  return findings;
}

function analyzeReview(filepath) {
  const findings = [];
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split('\n');
    
    // Detectar archivos muy largos
    if (lines.length > 300) {
      findings.push({
        id: generateId(),
        agent: 'Code Reviewer',
        severity: 'LOW',
        file: filepath,
        description: `Archivo muy largo (${lines.length} líneas) - considerar dividir`,
        status: 'OPEN'
      });
    }
    
    // Detectar funciones muy largas
    let inFunction = false;
    let functionLines = 0;
    for (const line of lines) {
      if (line.match(/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/)) {
        inFunction = true;
        functionLines = 0;
      }
      if (inFunction) {
        functionLines++;
        if (functionLines > 50) {
          findings.push({
            id: generateId(),
            agent: 'Code Reviewer',
            severity: 'LOW',
            file: filepath,
            description: 'Función muy larga detectada (>50 líneas)',
            status: 'OPEN'
          });
          inFunction = false;
        }
      }
      if (line.includes('}') && inFunction) {
        inFunction = false;
      }
    }
    
  } catch (e) {
    // Archivo no existe o no es legible
  }
  
  return findings;
}

// ─── Generar reporte HTML ─────────────────────────────────────────────────

function generateHTMLReport(state, filepath, agents, priority) {
  ensureDir(REPORTS_DIR);
  
  const reportFile = path.join(REPORTS_DIR, `audit-${Date.now()}.html`);
  const openFindings = state.findings.filter(f => f.type === 'open');
  const closedFindings = state.findings.filter(f => f.type === 'closed');
  
  const severityColors = {
    'CRITICAL': '#dc3545',
    'HIGH': '#fd7e14',
    'MEDIUM': '#ffc107',
    'LOW': '#17a2b8',
    'INFO': '#6c757d'
  };
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auto-Audit Report - ${filepath}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    .meta { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .meta p { margin: 5px 0; }
    .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
    .score-good { color: #28a745; }
    .score-warning { color: #ffc107; }
    .score-bad { color: #dc3545; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    .severity { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; font-size: 12px; }
    .status-open { color: #dc3545; font-weight: bold; }
    .status-closed { color: #28a745; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .card-number { font-size: 36px; font-weight: bold; color: #007bff; }
    .card-label { color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Auto-Audit Report</h1>
    
    <div class="meta">
      <p><strong>Archivo:</strong> ${filepath}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
      <p><strong>Agentes:</strong> ${agents}</p>
      <p><strong>Prioridad:</strong> ${priority}</p>
    </div>
    
    <div class="score ${calculateScore(state.findings) >= 80 ? 'score-good' : calculateScore(state.findings) >= 50 ? 'score-warning' : 'score-bad'}">
      ${calculateScore(state.findings)}/100
    </div>
    
    <div class="summary">
      <div class="card">
        <div class="card-number">${state.findings.length}</div>
        <div class="card-label">Total Hallazgos</div>
      </div>
      <div class="card">
        <div class="card-number" style="color: #dc3545;">${openFindings.length}</div>
        <div class="card-label">Abiertos</div>
      </div>
      <div class="card">
        <div class="card-number" style="color: #28a745;">${closedFindings.length}</div>
        <div class="card-label">Cerrados</div>
      </div>
      <div class="card">
        <div class="card-number" style="color: #fd7e14;">${agents.split(' ').length}</div>
        <div class="card-label">Agentes Ejecutados</div>
      </div>
    </div>
    
    <h2>🚨 Hallazgos Abiertos</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Agente</th>
          <th>Severidad</th>
          <th>Archivo</th>
          <th>Descripción</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${openFindings.length > 0 ? openFindings.map(f => `
          <tr>
            <td>${f.id}</td>
            <td>${f.agent}</td>
            <td><span class="severity" style="background: ${severityColors[f.severity] || '#6c757d'}">${f.severity}</span></td>
            <td>${f.file}</td>
            <td>${f.description}</td>
            <td class="status-open">${f.status}</td>
          </tr>
        `).join('') : '<tr><td colspan="6" style="text-align: center; color: #28a745;">🎉 No hay hallazgos abiertos</td></tr>'}
      </tbody>
    </table>
    
    <h2>✅ Hallazgos Cerrados</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Agente</th>
          <th>Severidad</th>
          <th>Archivo</th>
          <th>Descripción</th>
          <th>Resolución</th>
        </tr>
      </thead>
      <tbody>
        ${closedFindings.length > 0 ? closedFindings.map(f => `
          <tr>
            <td>${f.id}</td>
            <td>${f.agent}</td>
            <td><span class="severity" style="background: ${severityColors[f.severity] || '#6c757d'}">${f.severity}</span></td>
            <td>${f.file}</td>
            <td>${f.description}</td>
            <td class="status-closed">${f.status}</td>
          </tr>
        `).join('') : '<tr><td colspan="6" style="text-align: center; color: #666;">No hay hallazgos cerrados registrados</td></tr>'}
      </tbody>
    </table>
    
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
      <p>Generado automáticamente por Auto-Audit Loop | Agent Manager Template</p>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync(reportFile, html, 'utf-8');
  console.log(`\n📊 Reporte HTML generado: ${reportFile}`);
  return reportFile;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const [filepath, agentsStr, priority] = process.argv.slice(2);
  
  if (!filepath || !agentsStr) {
    console.error('Uso: node bin/auto-audit.js <filepath> <agents> [priority]');
    console.error('Ejemplo: node bin/auto-audit.js src/services/agent.ts "typescript-expert qa-tester" HIGH');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 AUTO-AUDIT ORCHESTRATOR');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Archivo: ${filepath}`);
  console.log(`Agentes: ${agentsStr}`);
  console.log(`Prioridad: ${priority || 'MEDIUM'}`);
  console.log('');
  
  ensureDir(AUDIT_DIR);
  
  // Leer estado previo
  const state = readState();
  console.log(`📋 Estado previo: ${state.findings.length} hallazgos registrados`);
  
  // Ejecutar agentes
  const agents = agentsStr.split(' ').filter(a => a);
  const allFindings = [];
  
  for (const agentKey of agents) {
    const agentDef = AGENT_DEFINITIONS[agentKey];
    if (!agentDef) {
      console.log(`⚠️ Agente desconocido: ${agentKey}`);
      continue;
    }
    
    console.log(`\n───────────────────────────────────────────────────────`);
    console.log(`🤖 Ejecutando: ${agentDef.name}`);
    console.log(`───────────────────────────────────────────────────────`);
    
    // 1. Ejecutar gate
    const gateResult = runAgentGate(agentKey, agentDef);
    
    // 2. Ejecutar análisis
    const findings = runAgentAnalysis(agentKey, agentDef, filepath);
    
    // 3. Agregar hallazgos
    allFindings.push(...findings);
    
    console.log(`✅ ${agentDef.name} completado. Hallazgos: ${findings.length}`);
  }
  
  // Actualizar estado
  state.findings.push(...allFindings);
  writeState(state, filepath, agentsStr, priority || 'MEDIUM');
  
  // Generar reporte HTML
  const reportFile = generateHTMLReport(state, filepath, agentsStr, priority || 'MEDIUM');
  
  // Resumen final
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN FINAL');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total hallazgos: ${allFindings.length}`);
  console.log(`CRITICAL: ${allFindings.filter(f => f.severity === 'CRITICAL').length}`);
  console.log(`HIGH: ${allFindings.filter(f => f.severity === 'HIGH').length}`);
  console.log(`MEDIUM: ${allFindings.filter(f => f.severity === 'MEDIUM').length}`);
  console.log(`LOW: ${allFindings.filter(f => f.severity === 'LOW').length}`);
  console.log(`Score de calidad: ${calculateScore(state.findings)}/100`);
  console.log(`Reporte: ${reportFile}`);
  console.log('═══════════════════════════════════════════════════════');
  
  // Si hay CRITICAL, salir con error
  const criticalCount = allFindings.filter(f => f.severity === 'CRITICAL').length;
  if (criticalCount > 0) {
    console.log('\n🚨 HAY HALLAZGOS CRITICAL - REVISAR ANTES DE CONTINUAR');
    process.exit(2);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
