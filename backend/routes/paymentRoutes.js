import express from 'express';
import {
  createCheckoutSession,
  verifyPayment,
  stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify/:sessionId', protect, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
