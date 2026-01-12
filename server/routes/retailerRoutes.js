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
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard', verifyRetailer, retailerController.getDashboardMetrics);
router.get('/dashboard/stats', verifyRetailer, retailerController.getDashboardStats);

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
router.get('/shipments', verifyRetailer, retailerController.getShipments);
router.get('/shipments/incoming', verifyRetailer, retailerController.getIncomingShipments);
router.post('/shipments/:deliveryId/confirm', verifyRetailer, retailerController.confirmShipmentDelivery);

// ============================================
// CUSTOMERS ROUTES
// ============================================
router.get('/customers', verifyRetailer, retailerController.getCustomers);

// ============================================
// ANALYTICS ROUTES
// ============================================
router.get('/analytics', verifyRetailer, retailerController.getAnalytics);

// ============================================
// ALERTS ROUTES
// ============================================
router.get('/alerts', verifyRetailer, retailerController.getAlerts);

// ============================================
// CUSTOMER ORDERS MANAGEMENT ROUTES
// ============================================
router.get('/customer-orders', verifyRetailer, retailerController.getCustomerOrdersForRetailer);
router.put('/customer-orders/:orderId/accept', verifyRetailer, retailerController.acceptCustomerOrder);
router.put('/customer-orders/:orderId/ship', verifyRetailer, retailerController.shipCustomerOrder);

// ============================================
// SEARCH ROUTES
// ============================================
router.get('/search/products', verifyRetailer, retailerController.searchProducts);

export default router;