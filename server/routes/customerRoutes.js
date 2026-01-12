import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
  placeOrder, 
  getCustomerOrders, 
  getCustomerProfile 
} from '../controllers/customerController.js';

const router = express.Router();

// All routes require customer authentication
router.use(verifyToken);

// Customer routes
router.post('/orders', placeOrder);
router.get('/orders', getCustomerOrders);
router.get('/profile', getCustomerProfile);

export default router;
