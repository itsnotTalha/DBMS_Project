import express from 'express';
import * as manufacturerController from '../controllers/manufacturerController.js'; 
import { verifyToken, verifyManufacturer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(verifyToken);
router.use(verifyManufacturer);

// Define routes
router.get('/products', manufacturerController.getProducts);
router.get('/production', manufacturerController.getProduction);
router.post('/production', manufacturerController.createProduction);

export default router;