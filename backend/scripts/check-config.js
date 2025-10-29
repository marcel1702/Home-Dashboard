#!/usr/bin/env node
const { config } = require('../src/config');

if (!config.sessionSecret || config.sessionSecret === 'insecure-development-secret') {
  console.warn('SESSION_SECRET is not configured. Do not use the default in production.');
}

if (!process.env.ADMIN_PASSWORD_HASH) {
  console.warn('ADMIN_PASSWORD_HASH is not set. The admin account will not be seeded.');
}
