import express from 'express';
import { getStats, getShipments, getLedger } from '../controllers/dashboardController.js';

const router = express.Router();

// Route: GET /api/dashboard/stats
router.get('/stats', getStats);

// Route: GET /api/dashboard/shipments
router.get('/shipments', getShipments);

// Route: GET /api/dashboard/ledger
router.get('/ledger', getLedger);

export default router;