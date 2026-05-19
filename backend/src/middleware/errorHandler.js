const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 10MB.' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ message: 'Validation error', errors: messages });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
  }
  if (err.message && err.message.includes('File type')) {
    return res.status(415).json({ message: err.message });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
