const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('node:path');
const fs = require('node:fs');
const { config } = require('./config');
const { sessionMiddleware } = require('./middleware/session');
const { requestLogger } = require('./utils/logger');
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminServices');
const healthRoutes = require('./routes/health');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { ensureAdminSeed } = require('./services/authService');

async function createApp() {
  await ensureAdminSeed();

  const app = express();

  const helmetOptions = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
    crossOriginEmbedderPolicy: false,
  };

  app.set('trust proxy', 1);

  app.use(helmet(helmetOptions));
  app.use(cookieParser());
  if (config.corsOrigins.length > 0) {
    app.use(
      cors({
        origin: config.corsOrigins,
        credentials: true,
      })
    );
  }

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(sessionMiddleware);

  app.use('/api', publicRoutes);
  app.use('/api', authRoutes);
  app.use('/api', adminRoutes);
  app.use('/api', healthRoutes);

  const staticDir = path.resolve(__dirname, '../public');
  if (fs.existsSync(staticDir)) {
    app.use(
      express.static(staticDir, {
        index: false,
        setHeaders(res, servedFilePath) {
          if (servedFilePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-store, must-revalidate');
          }
        },
      })
    );
    app.get(/^(?!\/api)(?!.*\.[^/]+$).*$/, (req, res, next) => {
      if (req.method !== 'GET' || !req.accepts('html')) {
        return next();
      }

      res.set('Cache-Control', 'no-store, must-revalidate');
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

async function start() {
  const app = await createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(config.port, () => {
      console.log(`API server listening on port ${config.port}`);
      resolve(server);
    });

    server.on('error', reject);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { createApp, start };
