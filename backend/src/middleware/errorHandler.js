const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  // Database error
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'Data constraint violation',
      details: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = { errorHandler };
