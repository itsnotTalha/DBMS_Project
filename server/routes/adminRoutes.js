import express from 'express';
import { getAllUsers, getNetworkConnections, getSystemAlerts } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/connections', getNetworkConnections);
router.get('/alerts', getSystemAlerts);

export default router;