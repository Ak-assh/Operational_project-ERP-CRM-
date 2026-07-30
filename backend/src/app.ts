import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/routes.js';
import customerRoutes from './modules/customers/routes.js';
import productRoutes from './modules/products/routes.js';
import challanRoutes from './modules/challans/routes.js';

const app: Express = express();

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Root Info Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mini ERP + CRM Operations Portal API Server is active.',
    healthCheck: '/api/health',
    frontendUrl: env.CORS_ORIGIN,
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Operational Portal API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);

// Global Error Handler
app.use(errorHandler);

export { app };
export default app;
