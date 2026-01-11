// Load environment variables FIRST
import './loadEnv.js';

import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import manufacturerRoutes from './routes/manufacturerRoutes.js';
import retailerRoutes from './routes/retailerRoutes.js';
import { verifyProduct } from './controllers/verifyController.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/retailer', retailerRoutes);

// Global verify product route (no auth required)
app.get('/api/verify/:serial_code', verifyProduct);

app.get('/', async (req, res) => {
  res.json({ message: "API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});