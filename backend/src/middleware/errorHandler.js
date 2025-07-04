const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MikroORM validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Database validation error',
      details: err.message
    });
  }

  // MikroORM unique constraint error
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      details: err.message
    });
  }

  // Axios timeout error
  if (err.code === 'ECONNABORTED') {
    return res.status(408).json({
      success: false,
      error: 'Request timeout',
      details: 'The request took too long to complete'
    });
  }

  // Axios network error
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Network error',
      details: 'Unable to connect to the target server'
    });
  }

  // JWT token error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      details: err.message
    });
  }

  // Express validation error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      details: 'Request body contains invalid JSON'
    });
  }

  // Request payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Payload too large',
      details: 'Request body exceeds size limit'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;