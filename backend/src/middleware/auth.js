function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

module.exports = { requireAdmin };
