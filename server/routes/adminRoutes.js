import express from 'express';
// 1. Update this import to include getUserDetails
import { 
  getAllUsers, 
  getNetworkConnections, 
  getSystemAlerts,
  getUserDetails 
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', getAllUsers);
// 2. Add this new route for fetching specific user details
router.get('/users/:id', getUserDetails); 

router.get('/connections', getNetworkConnections);
router.get('/alerts', getSystemAlerts);

export default router;