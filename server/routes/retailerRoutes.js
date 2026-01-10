import express from 'express';
import * as retailerController from '../controllers/retailerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: Verify token and retailer role
const verifyRetailer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role.toLowerCase() !== 'retailer') {
      return res.status(403).json({ error: 'Unauthorized: Retailer role required' });
    }
    next();
  });
};

// ============================================
// MANUFACTURERS ROUTES
// ============================================
router.get('/manufacturers', verifyRetailer, retailerController.getManufacturers);
router.get('/manufacturers/:manufacturerId/products', verifyRetailer, retailerController.getProductsByManufacturer);

// ============================================
// ORDERS ROUTES
// ============================================
router.post('/orders', verifyRetailer, retailerController.createOrder);
router.get('/orders', verifyRetailer, retailerController.getRetailerOrders);
router.get('/orders/:orderId', verifyRetailer, retailerController.getOrderDetails);

// ============================================
// INVENTORY ROUTES
// ============================================
router.get('/inventory', verifyRetailer, retailerController.getRetailerInventory);

// ============================================
// SHIPMENTS/DELIVERIES ROUTES
// ============================================
router.get('/shipments', verifyRetailer, retailerController.getIncomingShipments);
router.post('/shipments/:deliveryId/confirm', verifyRetailer, retailerController.confirmShipmentDelivery);

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard', verifyRetailer, retailerController.getDashboardMetrics);

// ============================================
// SEARCH ROUTES
// ============================================
router.get('/search/products', verifyRetailer, retailerController.searchProducts);

export default router;
