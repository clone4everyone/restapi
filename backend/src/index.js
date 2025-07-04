const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { MikroORM } = require('@mikro-orm/core');
const { SqliteDriver } = require('@mikro-orm/sqlite');
require('dotenv').config();

const requestRoutes = require('./routes/request.routes');
const errorHandler = require('./middleware/errorHandler');
const RequestHistory = require('./entities/RequestHistory');

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigin = 'https://restapi-uyh5.vercel.app'; 
// Middleware
app.use(helmet());


app.use(cors({
  origin: allowedOrigin,
  credentials: true // optional: allow cookies if needed
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Global variable to store ORM instance
let orm;

// Initialize MikroORM
async function initializeDatabase() {
  try {
    orm = await MikroORM.init({
      driver: SqliteDriver,
      dbName: './database.sqlite',
      entities: [RequestHistory],
      debug: process.env.NODE_ENV !== 'production',
      allowGlobalContext: true,
      forceEntityConstructor: true,
      validate: true,
      strict: true,
      discovery: {
        warnWhenNoEntities: false,
        requireEntitiesArray: true,
      },
    });

    // Create schema if it doesn't exist
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
    
    console.log('✅ Database initialized successfully');
    return orm;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Make ORM available globally
app.use((req, res, next) => {
  req.orm = orm;
  next();
});

// Routes
app.use('/api/requests', requestRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'REST Client Backend'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  if (orm) {
    await orm.close();
  }
  process.exit(0);
});

startServer();