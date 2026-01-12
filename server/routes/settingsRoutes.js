import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
  getUserProfile, 
  updateUserName, 
  changePassword, 
  resetUserData 
} from '../controllers/settingsController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/settings/profile - Get user profile
router.get('/profile', getUserProfile);

// PUT /api/settings/name - Update user name
router.put('/name', updateUserName);

// PUT /api/settings/password - Change password
router.put('/password', changePassword);

// DELETE /api/settings/reset - Reset all user data
router.delete('/reset', resetUserData);

export default router;
