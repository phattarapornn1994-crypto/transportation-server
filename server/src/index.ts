import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database.js';
import customerRoutes from './routes/customers.js';
import vehicleRoutes from './routes/vehicles.js';
import planRoutes from './routes/plans.js';
import routeRoutes from './routes/routes.js';
import reportRoutes from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Transportation Management API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

