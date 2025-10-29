function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal Server Error',
  };

  if (req.app.get('env') !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
