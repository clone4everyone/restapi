const Joi = require('joi');

// Request validation schema
const requestSchema = Joi.object({
  method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS').required(),
  url: Joi.string().uri().required(),
  headers: Joi.object().default({}),
  body: Joi.any().allow(null, ''),
  name: Joi.string().max(255).optional(),
  description: Joi.string().max(1000).optional(),
  collection: Joi.string().max(100).default('Default'),
  tags: Joi.array().items(Joi.string()).default([])
});

// Pagination validation schema
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('id', 'timestamp', 'method', 'url', 'status', 'responseTime', 'collection').default('timestamp'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Validate request middleware
const validateRequest = (req, res, next) => {
  const { error, value } = requestSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.body = value;
  next();
};

// Validate pagination middleware
const validatePagination = (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.query = { ...req.query, ...value };
  next();
};

module.exports = {
  validateRequest,
  validatePagination
};