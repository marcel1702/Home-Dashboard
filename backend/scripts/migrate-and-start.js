#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

const backendDir = path.resolve(__dirname, '..');
const prismaBinary = path.resolve(
  backendDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

async function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        const error = new Error(`Process exited due to signal: ${signal}`);
        error.signal = signal;
        reject(error);
        return;
      }

      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }

      resolve();
    });

    child.on('error', reject);
  });
}

function toFilesystemPath(maybeFileUrl) {
  if (!maybeFileUrl.startsWith('file:')) {
    return maybeFileUrl;
  }

  const prefix = maybeFileUrl.startsWith('file://') ? 'file://' : 'file:';
  let withoutProtocol = decodeURIComponent(maybeFileUrl.slice(prefix.length));

  if (process.platform === 'win32' && withoutProtocol.startsWith('/') && /^[A-Za-z]:/.test(withoutProtocol.slice(1))) {
    return withoutProtocol.slice(1);
  }

  return withoutProtocol;
}

async function ensureDatabaseDirectory(dbPathOrUrl) {
  const filePath = toFilesystemPath(dbPathOrUrl);
  const directory = path.dirname(path.resolve(backendDir, filePath));
  await fs.mkdir(directory, { recursive: true });
}

async function main() {
  if (!(await fs.stat(prismaBinary).then(() => true).catch(() => false))) {
    throw new Error('Prisma CLI binary not found. Ensure dependencies are installed before starting.');
  }

  const { config } = require('../src/config');

  const databaseUrl = process.env.DATABASE_URL || `file:${config.dbPath}`;

  await ensureDatabaseDirectory(databaseUrl);

  process.env.DATABASE_URL = databaseUrl;
  process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL = '1';

  const env = { ...process.env };

  console.log('Running database migrations...');
  await run(prismaBinary, ['migrate', 'deploy', '--schema', path.resolve(backendDir, 'prisma', 'schema.prisma')], {
    cwd: backendDir,
    env,
  });
  console.log('Database migrations completed.');

  const { start } = require('../src/index');
  await start();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
