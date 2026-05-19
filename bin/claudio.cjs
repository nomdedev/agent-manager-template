#!/usr/bin/env node
/**
 * claudio binary entry point
 * Executes the TypeScript CLI via tsx (Node.js TypeScript executor).
 * Requires tsx in node_modules/.bin (installed as devDependency).
 */
'use strict'

const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const root = path.join(__dirname, '..')
const cliFile = path.join(root, 'src', 'cli', 'claudio.ts')

// Prefer local tsx, fall back to tsx in PATH (e.g. globally installed)
const localTsx = path.join(root, 'node_modules', '.bin', 'tsx')
const tsxBin = fs.existsSync(localTsx) ? localTsx : 'tsx'

const result = spawnSync(tsxBin, [cliFile, ...process.argv.slice(2)], {
  stdio: 'inherit',
  // On Windows, .bin scripts are .cmd files — use shell to resolve them
  shell: process.platform === 'win32',
})

process.exit(result.status ?? 0)
