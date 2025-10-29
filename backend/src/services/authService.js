const bcrypt = require('bcrypt');
const { prisma } = require('../utils/prisma');
const { v4: uuidv4 } = require('uuid');

async function ensureAdminSeed() {
  if (!process.env.ADMIN_PASSWORD_HASH) {
    return;
  }

  const existing = await prisma.admin.findFirst();
  if (!existing) {
    await prisma.admin.create({
      data: {
        id: uuidv4(),
        password_hash: process.env.ADMIN_PASSWORD_HASH,
      },
    });
  }
}

async function authenticate(password) {
  const admin = await prisma.admin.findFirst();
  if (!admin) {
    throw new Error('Admin account is not configured');
  }

  const isValid = await bcrypt.compare(password, admin.password_hash);
  if (!isValid) {
    return null;
  }

  return { id: admin.id };
}

module.exports = {
  ensureAdminSeed,
  authenticate,
};
