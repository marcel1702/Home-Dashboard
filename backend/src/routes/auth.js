const express = require('express');
const { authenticate } = require('../services/authService');
const { loginSchema } = require('../utils/validators');
const { authRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/auth/login', authRateLimiter, async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const admin = await authenticate(value.password);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.adminId = admin.id;
    res.json({ message: 'Logged in' });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
