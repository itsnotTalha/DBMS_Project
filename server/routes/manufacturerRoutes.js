import express from 'express';
import * as manufacturerController from '../controllers/manufacturerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: Verify token and manufacturer role
const verifyManufacturer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role.toLowerCase() !== 'manufacturer') {
      return res.status(403).json({ error: 'Unauthorized: Manufacturer role required' });
    }
    next();
  });
};

// ============================================
// PRODUCTS ROUTES
// ============================================
router.get('/products', verifyManufacturer, manufacturerController.getManufacturerProducts);
router.post('/products', verifyManufacturer, manufacturerController.createProduct);
router.get('/products/:productId', verifyManufacturer, manufacturerController.getProductDetails);
router.put('/products/:productId/stock', verifyManufacturer, manufacturerController.updateProductStock);

// ============================================
// B2B ORDERS ROUTES
// ============================================
router.get('/orders', verifyManufacturer, manufacturerController.getB2BOrders);
router.post('/orders/:orderId/accept', verifyManufacturer, manufacturerController.acceptB2BOrder);
router.post('/orders/:orderId/reject', verifyManufacturer, manufacturerController.rejectB2BOrder);

// ============================================
// PRODUCTION ROUTES
// ============================================
router.get('/production', verifyManufacturer, manufacturerController.getProductionBatches);
router.post('/production', verifyManufacturer, manufacturerController.createProduction);
router.post('/production/:productionRequestId/complete', verifyManufacturer, manufacturerController.completeProduction);

// ============================================
// SHIPMENTS ROUTES
// ============================================
router.get('/shipments', verifyManufacturer, manufacturerController.getShipments);
router.put('/shipments/:shipmentId/dispatch', verifyManufacturer, manufacturerController.dispatchShipment);

// ============================================
// IoT ALERTS ROUTES
// ============================================
router.get('/iot-alerts', verifyManufacturer, manufacturerController.getIoTAlerts);

// ============================================
// LEDGER ROUTES
// ============================================
router.get('/ledger', verifyManufacturer, manufacturerController.getLedgerTransactions);

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard', verifyManufacturer, manufacturerController.getDashboardMetrics);

export default router;
