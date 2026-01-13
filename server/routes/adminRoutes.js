import express from 'express';
import { 
  getAllUsers, 
  getUserDetails,
  getNetworkConnections, 
  getSystemAlerts,
  getDashboardStats,  // <-- Added
  getRecentActivity   // <-- Added
} from '../controllers/adminController.js';

const router = express.Router();

// Dashboard Overview Data
router.get('/dashboard-stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails); 

// Network & Alerts
router.get('/connections', getNetworkConnections);
router.get('/alerts', getSystemAlerts);

export default router;