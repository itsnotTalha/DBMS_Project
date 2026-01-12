import express from 'express';
import { 
  getPublicProducts, 
  getProductDetails, 
  getCategories, 
  getFeaturedManufacturers,
  getRetailerOutlets
} from '../controllers/publicController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/products', getPublicProducts);
router.get('/products/:id', getProductDetails);
router.get('/categories', getCategories);
router.get('/manufacturers', getFeaturedManufacturers);
router.get('/outlets', getRetailerOutlets);

export default router;
