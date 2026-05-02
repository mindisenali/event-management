import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshToken);

router
  .route('/me')
  .get(protect, getUserProfile)
  .patch(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-verification', protect, resendVerificationCode);

router.patch('/change-password', protect, changePassword);


export default router;

