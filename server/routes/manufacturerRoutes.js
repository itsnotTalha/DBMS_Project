import express from 'express';
import {
    getDashboardStats,
    getProducts,
    addProduct,
    getProduction,
    createProduction,
    getOrders,
    acceptOrder,
    rejectOrder,
    getShipments,
    getAlerts,
    getLedger
} from '../controllers/manufacturerController.js';
import { verifyToken, verifyManufacturer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(verifyToken);
router.use(verifyManufacturer);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products (Blueprints)
router.get('/products', getProducts);
router.post('/products', addProduct);

// Production (Batches with QR hash generation)
router.get('/production', getProduction);
router.post('/production', createProduction);

// B2B Orders
router.get('/orders', getOrders);
router.post('/orders/:id/accept', acceptOrder);
router.post('/orders/:id/reject', rejectOrder);

// Shipments
router.get('/shipments', getShipments);

// IoT Alerts
router.get('/alerts', getAlerts);

// Ledger Audit
router.get('/ledger', getLedger);

export default router;