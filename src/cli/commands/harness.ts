import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

interface HarnessMetrics {
  featureId: string;
  totalTokensUsed: number;
  tokensPerFileChanged: number;
  contextReloads: number;
  checkpoints: number;
  filesRead: number;
  filesModified: number;
  codeGenerated: number;
  codeRewritten: number;
  efficiency: number;
  ruleCompliance: Record<string, boolean>;
}

const LOGS_DIR = '.claude/logs';
const AUDITS_DIR = '.claude/logs/audits';

/**
 * Estimate token count from text
 */
function estimateTokens(text: string): number {
  const words = text.split(/\s+/).length;
  const hasCode = text.includes('```');
  const multiplier = hasCode ? 0.6 : 0.5;
  return Math.round(words / multiplier);
}

/**
 * Parse checkpoint format from text
 */
function countCheckpoints(content: string): number {
  const matches = content.match(/✅ DONE:/g);
  return matches ? matches.length : 0;
}

/**
 * Check rule compliance from session log
 */
function auditRuleCompliance(content: string): Record<string, boolean> {
  return {
    rule1: /GOAL:/i.test(content) && /FILES:/i.test(content),
    rule2: !/interface.*extends.*class|abstract class.*implements/i.test(content) || content.split('\n').length < 200,
    rule3: content.includes('git diff --stat') || content.includes('Only planned files'),
    rule4: /CRITERIA:/i.test(content) || /success criteria/i.test(content),
    rule5: /grep |sed |awk |wc -l/i.test(content) || content.includes('Use code for deterministic'),
    rule6: estimateTokens(content) < 4000,
    rule7: /conflict|deprecated|TODO.*pattern/i.test(content),
    rule8: /read.*before|cat .*\.ts/i.test(content),
    rule9: /should .*when/i.test(content) || /it\('should/i.test(content),
    rule10: /✅ DONE:/i.test(content) && /⏳ NEXT:/i.test(content),
    rule11: /convention|follow.*pattern|match.*style/i.test(content),
    rule12: /verified|test output|proof/i.test(content),
  };
}

/**
 * Audit a feature directory
 */
function auditFeature(featureId: string): HarnessMetrics {
  const featureDir = join(AUDITS_DIR, 'features', featureId);
  
  if (!existsSync(featureDir)) {
    console.warn(`Feature directory not found: ${featureDir}`);
    return createEmptyMetrics(featureId);
  }

  let totalTokens = 0;
  let filesRead = 0;
  let filesModified = 0;
  let checkpoints = 0;
  let codeGenerated = 0;
  let codeRewritten = 0;
  let contextReloads = 0;

  const entries = readdirSync(featureDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isFile() || extname(entry.name) !== '.md') continue;
    
    const content = readFileSync(join(featureDir, entry.name), 'utf-8');
    const tokens = estimateTokens(content);
    totalTokens += tokens;
    
    checkpoints += countCheckpoints(content);
    
    // Count file reads
    const reads = content.match(/cat |readFile|read_file/g);
    if (reads) filesRead += reads.length;
    
    // Count modifications
    const mods = content.match(/writeFile|patch|edit|modified/g);
    if (mods) filesModified += mods.length;
    
    // Count code blocks
    const codeBlocks = content.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      codeBlocks.forEach((block) => {
        codeGenerated += block.split('\n').length;
      });
    }
    
    // Detect rewrites
    if (content.includes('rewrite') || content.includes('regenerate') || content.includes('fix')) {
      codeRewritten += 1;
    }
    
    // Detect context reloads
    if (content.includes('re-read') || content.includes('reload context') || content.includes('refresh')) {
      contextReloads += 1;
    }
  }

  const ruleCompliance = auditRuleCompliance(entries.map((e) => 
    readFileSync(join(featureDir, e.name), 'utf-8')
  ).join('\n'));

  const usefulTokens = codeGenerated * 10; // Approximate
  const efficiency = totalTokens > 0 ? Math.min(1, usefulTokens / totalTokens) : 0;

  return {
    featureId,
    totalTokensUsed: totalTokens,
    tokensPerFileChanged: filesModified > 0 ? Math.round(totalTokens / filesModified) : 0,
    contextReloads,
    checkpoints,
    filesRead,
    filesModified,
    codeGenerated,
    codeRewritten,
    efficiency: Math.round(efficiency * 100) / 100,
    ruleCompliance,
  };
}

function createEmptyMetrics(featureId: string): HarnessMetrics {
  return {
    featureId,
    totalTokensUsed: 0,
    tokensPerFileChanged: 0,
    contextReloads: 0,
    checkpoints: 0,
    filesRead: 0,
    filesModified: 0,
    codeGenerated: 0,
    codeRewritten: 0,
    efficiency: 0,
    ruleCompliance: {},
  };
}

/**
 * Generate harness audit report
 */
function generateHarnessReport(metrics: HarnessMetrics): string {
  const lines: string[] = [];
  lines.push(`# Harness Audit — ${metrics.featureId}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Token Metrics');
  lines.push('| Metric | Value | Target | Status |');
  lines.push('|--------|-------|--------|--------|');
  lines.push(`| Total tokens | ${metrics.totalTokensUsed} | <4,000 | ${metrics.totalTokensUsed < 4000 ? '✅' : '⚠️'} |`);
  lines.push(`| Tokens/file | ${metrics.tokensPerFileChanged} | <500 | ${metrics.tokensPerFileChanged < 500 ? '✅' : '⚠️'} |`);
  lines.push(`| Context reloads | ${metrics.contextReloads} | <3 | ${metrics.contextReloads < 3 ? '✅' : '⚠️'} |`);
  lines.push(`| Checkpoints | ${metrics.checkpoints} | >=2 | ${metrics.checkpoints >= 2 ? '✅' : '⚠️'} |`);
  lines.push(`| Files read | ${metrics.filesRead} | <10 | ${metrics.filesRead < 10 ? '✅' : '⚠️'} |`);
  lines.push(`| Files modified | ${metrics.filesModified} | <5 | ${metrics.filesModified < 5 ? '✅' : '⚠️'} |`);
  lines.push(`| Efficiency | ${(metrics.efficiency * 100).toFixed(0)}% | >70% | ${metrics.efficiency >= 0.7 ? '✅' : '⚠️'} |`);
  lines.push('');

  lines.push('## Rule Compliance');
  lines.push('| Rule | Compliant |');
  lines.push('|------|-----------|');
  const ruleNames: Record<string, string> = {
    rule1: 'R1 — Think Before Coding',
    rule2: 'R2 — Simplicity First',
    rule3: 'R3 — Surgical Changes',
    rule4: 'R4 — Goal-Driven',
    rule5: 'R5 — Code Over Model',
    rule6: 'R6 — Token Budgets',
    rule7: 'R7 — Surface Conflicts',
    rule8: 'R8 — Read Before Write',
    rule9: 'R9 — Test Intent',
    rule10: 'R10 — Checkpoint',
    rule11: 'R11 — Match Conventions',
    rule12: 'R12 — Fail Loud',
  };
  
  for (const [key, name] of Object.entries(ruleNames)) {
    const compliant = metrics.ruleCompliance[key];
    lines.push(`| ${name} | ${compliant ? '✅' : '❌'} |`);
  }
  lines.push('');

  const violations = Object.entries(metrics.ruleCompliance)
    .filter(([, v]) => !v)
    .map(([k]) => ruleNames[k]);

  if (violations.length > 0) {
    lines.push('## Violations');
    for (const v of violations) {
      lines.push(`- ❌ ${v}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Main harness command handler
 */
export async function harnessCommand(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'audit': {
      const featureId = args[0] || 'current';
      console.log(`🔍 Auditing feature: ${featureId}`);
      
      const metrics = auditFeature(featureId);
      const report = generateHarnessReport(metrics);

      if (!existsSync(LOGS_DIR)) {
        mkdirSync(LOGS_DIR, { recursive: true });
      }
      const reportPath = join(LOGS_DIR, `harness-audit-${featureId}.md`);
      writeFileSync(reportPath, report);

      console.log(report);
      console.log(`\n📄 Report saved to ${reportPath}`);
      break;
    }

    case 'report': {
      const featureId = args[0] || 'current';
      const metrics = auditFeature(featureId);
      console.log(generateHarnessReport(metrics));
      break;
    }

    case 'measure-file': {
      const filePath = args[0];
      if (!filePath) {
        console.error('Usage: claudio harness measure-file <file>');
        process.exit(1);
      }
      const content = readFileSync(filePath, 'utf-8');
      const tokens = estimateTokens(content);
      console.log(`📊 ${filePath}: ~${tokens} tokens`);
      break;
    }

    default:
      console.log('Harness commands:');
      console.log('  claudio harness audit [feature]     — Audit feature compliance');
      console.log('  claudio harness report [feature]    — Generate report');
      console.log('  claudio harness measure-file <f>    — Measure file tokens');
  }
}
