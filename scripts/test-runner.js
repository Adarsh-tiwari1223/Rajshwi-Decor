#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

// Extract CLI arguments
const rawArgs = process.argv.slice(2);
const filteredArgs = [];
let targetUser = null;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '-k' || arg === '--user' || arg === '-u') {
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      targetUser = rawArgs[i + 1];
      i++; // Skip the value
    }
  } else if (arg.startsWith('-k=') || arg.startsWith('--user=') || arg.startsWith('-u=')) {
    targetUser = arg.split('=')[1];
  } else {
    filteredArgs.push(arg);
  }
}

if (targetUser) {
  process.env.TARGET_USER = targetUser;
  console.log(`\x1b[36m[Test Runner] Detected target user flag (-k): "${targetUser}". Set TARGET_USER="${targetUser}"\x1b[0m`);
}

const hasGrep = filteredArgs.some(a => a === '-g' || a === '--grep' || a.startsWith('-g=') || a.startsWith('--grep='));
if (targetUser && !hasGrep) {
  filteredArgs.push('-g', targetUser);
}

const hasSpec = filteredArgs.some(a => a.endsWith('.ts'));
if (targetUser && !hasSpec) {
  filteredArgs.push('tests/ui/dashboard/dashboardDefectsRegression.ui.spec.ts');
}

console.log(`\x1b[34m[Test Runner] Executing: npx playwright test ${filteredArgs.join(' ')}\x1b[0m\n`);

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const result = spawnSync(npxCmd, ['playwright', 'test', ...filteredArgs], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

process.exit(result.status !== null ? result.status : 1);
