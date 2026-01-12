import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
  placeOrder, 
  getCustomerOrders, 
  getCustomerProfile,
  getDashboardStats,
  getCurrentOrders,
  getVerificationHistory,
  verifyProductAuthenticated,
  submitReport,
  getCustomerReports
} from '../controllers/customerController.js';

const router = express.Router();

// All routes require customer authentication
router.use(verifyToken);

// Dashboard & Stats
router.get('/dashboard/stats', getDashboardStats);
router.get('/orders/current', getCurrentOrders);

// Orders
router.post('/orders', placeOrder);
router.get('/orders', getCustomerOrders);

// Verification
router.get('/verifications', getVerificationHistory);
router.get('/verify/:serial_code', verifyProductAuthenticated);

// Reports
router.post('/reports', submitReport);
router.get('/reports', getCustomerReports);

// Profile
router.get('/profile', getCustomerProfile);

export default router;
