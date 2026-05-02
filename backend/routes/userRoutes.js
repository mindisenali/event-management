import express from 'express';
import {
  getUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getPendingAdmins,
  approveAdmin,
  rejectAdmin,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('superadmin'));

router.get('/', getUsers);
router.get('/pending', getPendingAdmins);

router
  .route('/:id')
  .get(getUserById)
  .delete(deleteUser);

router.patch('/:id/toggle', toggleUserStatus);
router.patch('/:id/approve', approveAdmin);
router.patch('/:id/reject', rejectAdmin);

export default router;
