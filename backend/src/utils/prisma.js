const { PrismaClient } = require('@prisma/client');
const { config } = require('../config');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${config.dbPath}`
    }
  }
});

module.exports = { prisma };
