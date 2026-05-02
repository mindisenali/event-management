import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

router.get('/stats', getAdminStats);

export default router;
