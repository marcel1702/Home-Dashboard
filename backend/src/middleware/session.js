const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { config } = require('../config');
const path = require('node:path');
const fs = require('node:fs');

const sessionDir = path.dirname(config.dbPath);
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

const store = new SQLiteStore({
  dir: sessionDir,
  db: path.basename(config.dbPath).replace('.db', '-sessions.db'),
});

const sessionMiddleware = session({
  store,
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 12,
  },
});

module.exports = { sessionMiddleware };
