import express from 'express';
import cors from 'cors';
import { initializeDatabase } from '../src/database.js';
import customerRoutes from '../src/routes/customers.js';
import vehicleRoutes from '../src/routes/vehicles.js';
import planRoutes from '../src/routes/plans.js';
import routeRoutes from '../src/routes/routes.js';
import reportRoutes from '../src/routes/reports.js';

const app = express();

// Initialize database (async for Postgres)
let dbInitialized = false;
const initDb = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB before handling requests
app.use(async (req, res, next) => {
  await initDb();
  next();
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  await initDb();
  res.json({ 
    status: 'ok', 
    message: 'Transportation Management API is running',
    database: process.env.POSTGRES_URL ? 'Postgres' : 'SQLite'
  });
});

// Export for Vercel serverless
export default app;

