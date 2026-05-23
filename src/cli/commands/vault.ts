import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

interface VaultMetrics {
  totalNotes: number;
  totalTokens: number;
  avgTokensPerNote: number;
  byLevel: Record<string, { count: number; tokens: number }>;
  orphanedNotes: number;
  brokenLinks: number;
  efficiency: number;
}

interface NoteInfo {
  path: string;
  tokens: number;
  hLevel: string;
  links: string[];
  backLinks: string[];
}

const VAULT_DIR = 'obsidian';
const LOGS_DIR = '.claude/logs';

/**
 * Estimate token count from text
 * Rough approximation: 1 token ≈ 0.75 words (English), 0.5 words (Spanish/technical)
 */
function estimateTokens(text: string): number {
  const words = text.split(/\s+/).length;
  // Technical markdown with code: more tokens per word
  const hasCode = text.includes('```');
  const multiplier = hasCode ? 0.6 : 0.5;
  return Math.round(words / multiplier);
}

/**
 * Parse frontmatter from markdown
 */
function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const frontmatter: Record<string, string> = {};
  match[1].split('\n').forEach((line) => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) {
      frontmatter[key.trim()] = rest.join(':').trim();
    }
  });
  return frontmatter;
}

/**
 * Extract wiki links from markdown
 */
function extractLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

/**
 * Scan vault and collect metrics
 */
function scanVault(): { notes: NoteInfo[]; metrics: VaultMetrics } {
  const notes: NoteInfo[] = [];
  const linkMap = new Map<string, string[]>(); // path -> links

  // First pass: collect all notes
  function scanDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (extname(entry.name) === '.md') {
        const content = readFileSync(fullPath, 'utf-8');
        const frontmatter = parseFrontmatter(content);
        const hLevel = frontmatter['h-level'] || 'unassigned';
        const links = extractLinks(content);
        const tokens = estimateTokens(content);

        notes.push({
          path: relative(VAULT_DIR, fullPath),
          tokens,
          hLevel,
          links,
          backLinks: [],
        });

        linkMap.set(relative(VAULT_DIR, fullPath), links);
      }
    }
  }

  scanDir(VAULT_DIR);

  // Second pass: calculate backlinks
  for (const note of notes) {
    for (const [sourcePath, links] of Array.from(linkMap.entries())) {
      if (links.some((l) => note.path.includes(l) || l.includes(note.path.replace('.md', '')))) {
        note.backLinks.push(sourcePath);
      }
    }
  }

  // Calculate metrics
  const byLevel: Record<string, { count: number; tokens: number }> = {};
  let totalTokens = 0;

  for (const note of notes) {
    if (!byLevel[note.hLevel]) {
      byLevel[note.hLevel] = { count: 0, tokens: 0 };
    }
    byLevel[note.hLevel].count++;
    byLevel[note.hLevel].tokens += note.tokens;
    totalTokens += note.tokens;
  }

  const orphanedNotes = notes.filter((n) => n.backLinks.length === 0 && n.hLevel !== '1').length;

  // Check for broken links
  const allPaths = new Set(notes.map((n) => n.path.replace('.md', '')));
  let brokenLinks = 0;
  for (const note of notes) {
    for (const link of note.links) {
      const linkBase = link.split('#')[0].split('|')[0];
      if (!allPaths.has(linkBase) && !allPaths.has(linkBase + '.md')) {
        brokenLinks++;
      }
    }
  }

  const metrics: VaultMetrics = {
    totalNotes: notes.length,
    totalTokens,
    avgTokensPerNote: Math.round(totalTokens / notes.length),
    byLevel,
    orphanedNotes,
    brokenLinks,
    efficiency: Math.round((totalTokens > 0 ? 1 - orphanedNotes / notes.length : 1) * 100) / 100,
  };

  return { notes, metrics };
}

/**
 * Generate vault health report
 */
function generateReport(notes: NoteInfo[], metrics: VaultMetrics): string {
  const lines: string[] = [];
  lines.push('# Vault Health Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Metrics');
  lines.push('| Metric | Value | Target | Status |');
  lines.push('|--------|-------|--------|--------|');
  lines.push(`| Total notes | ${metrics.totalNotes} | — | — |`);
  lines.push(`| Total tokens | ${metrics.totalTokens} | <50,000 | ${metrics.totalTokens < 50000 ? '✅' : '⚠️'} |`);
  lines.push(`| Avg tokens/note | ${metrics.avgTokensPerNote} | <500 | ${metrics.avgTokensPerNote < 500 ? '✅' : '⚠️'} |`);
  lines.push(`| Orphaned notes | ${metrics.orphanedNotes} | 0 | ${metrics.orphanedNotes === 0 ? '✅' : '⚠️'} |`);
  lines.push(`| Broken links | ${metrics.brokenLinks} | 0 | ${metrics.brokenLinks === 0 ? '✅' : '⚠️'} |`);
  lines.push(`| Efficiency | ${(metrics.efficiency * 100).toFixed(0)}% | >90% | ${metrics.efficiency > 0.9 ? '✅' : '⚠️'} |`);
  lines.push('');

  lines.push('## By H-Level');
  lines.push('| Level | Count | Tokens | Avg |');
  lines.push('|-------|-------|--------|-----|');
  for (const [level, data] of Object.entries(metrics.byLevel)) {
    lines.push(`| ${level} | ${data.count} | ${data.tokens} | ${Math.round(data.tokens / data.count)} |`);
  }
  lines.push('');

  // Find notes exceeding token budgets
  const oversized = notes.filter((n) => {
    const limit = n.hLevel === '1' ? 500 : n.hLevel === '2' ? 800 : n.hLevel === '3' ? 600 : n.hLevel === '4' ? 400 : 9999;
    return n.tokens > limit;
  });

  if (oversized.length > 0) {
    lines.push('## Oversized Notes');
    lines.push('| Note | H-Level | Tokens | Limit |');
    lines.push('|------|---------|--------|-------|');
    for (const note of oversized) {
      const limit = note.hLevel === '1' ? 500 : note.hLevel === '2' ? 800 : note.hLevel === '3' ? 600 : note.hLevel === '4' ? 400 : 9999;
      lines.push(`| ${note.path} | ${note.hLevel} | ${note.tokens} | ${limit} |`);
    }
    lines.push('');
  }

  // Find orphaned notes
  const orphaned = notes.filter((n) => n.backLinks.length === 0 && n.hLevel !== '1');
  if (orphaned.length > 0) {
    lines.push('## Orphaned Notes (no backlinks)');
    for (const note of orphaned) {
      lines.push(`- ${note.path} (${note.tokens} tokens)`);
    }
    lines.push('');
  }

  // Find notes without h-level
  const unassigned = notes.filter((n) => n.hLevel === 'unassigned');
  if (unassigned.length > 0) {
    lines.push('## Notes Without H-Level');
    for (const note of unassigned) {
      lines.push(`- ${note.path} (${note.tokens} tokens)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Optimize vault notes for token efficiency
 */
function optimizeNote(content: string): string {
  let optimized = content;

  // Remove multiple consecutive blank lines
  optimized = optimized.replace(/\n{3,}/g, '\n\n');

  // Remove trailing whitespace
  optimized = optimized.replace(/[ \t]+$/gm, '');

  // Compress tables (remove extra spaces)
  optimized = optimized.replace(/\|\s+/g, '| ');
  optimized = optimized.replace(/\s+\|/g, ' |');

  return optimized;
}

/**
 * Main vault command handler
 */
export async function vaultCommand(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'analyze':
    case 'audit': {
      console.log('🔍 Analyzing vault...');
      const { notes, metrics } = scanVault();
      const report = generateReport(notes, metrics);

      // Save report
      if (!existsSync(LOGS_DIR)) {
        mkdirSync(LOGS_DIR, { recursive: true });
      }
      const reportPath = join(LOGS_DIR, 'vault-health-report.md');
      writeFileSync(reportPath, report);

      console.log(report);
      console.log(`\n📄 Report saved to ${reportPath}`);
      break;
    }

    case 'optimize': {
      console.log('⚡ Optimizing vault notes...');
      const { notes } = scanVault();
      let optimizedCount = 0;

      for (const note of notes) {
        const fullPath = join(VAULT_DIR, note.path);
        const content = readFileSync(fullPath, 'utf-8');
        const optimized = optimizeNote(content);

        if (optimized !== content) {
          writeFileSync(fullPath, optimized);
          optimizedCount++;
        }
      }

      console.log(`✅ Optimized ${optimizedCount} notes`);
      break;
    }

    case 'tokens':
    case 'measure': {
      const filePath = args[0];
      if (!filePath) {
        console.error('Usage: claudio vault tokens <file>');
        process.exit(1);
      }
      const content = readFileSync(filePath, 'utf-8');
      const tokens = estimateTokens(content);
      console.log(`📊 ${filePath}: ~${tokens} tokens`);
      break;
    }

    default:
      console.log('Vault commands:');
      console.log('  claudio vault analyze    — Analyze vault health');
      console.log('  claudio vault optimize   — Optimize notes for tokens');
      console.log('  claudio vault tokens <f> — Measure tokens in file');
  }
}
