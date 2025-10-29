const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');

const envPathCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env')
];

for (const candidate of envPathCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: false });
  }
}

const required = ['SESSION_SECRET', 'DB_PATH'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
  port: Number(process.env.PORT || 8080),
  sessionSecret: process.env.SESSION_SECRET || 'insecure-development-secret',
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), '..', 'data', 'app.db'),
  maxUploadKb: Number(process.env.MAX_UPLOAD_KB || 512),
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = { config };
