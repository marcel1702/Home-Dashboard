#!/usr/bin/env node
const path = require('node:path');
const bcrypt = require(path.resolve(__dirname, '../backend/node_modules/bcrypt'));
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: true });
  const password = await rl.question('Admin-Passwort: ', { hideEchoBack: true });
  rl.close();
  if (!password) {
    console.error('Kein Passwort angegeben.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  console.log(`
ADMIN_PASSWORD_HASH=${hash}
`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
