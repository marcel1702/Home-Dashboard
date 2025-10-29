#!/usr/bin/env node

const fs = require('node:fs');
const { spawn } = require('node:child_process');
const path = require('node:path');

const backendDir = path.resolve(__dirname, '..');
const schemaPath = path.resolve(backendDir, 'prisma', 'schema.prisma');
const prismaBinary = path.resolve(
  backendDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

const env = { ...process.env };

if (!env.DATABASE_URL) {
  const defaultDbPath = `file:${path.resolve(backendDir, 'dev.db')}`;
  env.DATABASE_URL = defaultDbPath;
}

env.PRISMA_GENERATE_SKIP_AUTOINSTALL = '1';

if (!fs.existsSync(prismaBinary)) {
  console.error('Prisma CLI not found. Did you run "npm install" in the backend package?');
  process.exit(1);
}

const child = spawn(prismaBinary, ['generate', '--schema', schemaPath], {
  cwd: backendDir,
  stdio: 'inherit',
  env
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
