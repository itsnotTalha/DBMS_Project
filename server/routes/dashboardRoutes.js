import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

// Define the route (GET /api/dashboard)
router.get('/', getDashboardStats);

export default router;