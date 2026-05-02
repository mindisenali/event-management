import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(restrictTo('admin', 'superadmin'), getAllBookings)
  .post(createBooking);

router.get('/my', getMyBookings);

router
  .route('/:id')
  .get(getBookingById)
  .patch(restrictTo('admin', 'superadmin'), updateBookingStatus);

router.delete('/:id/cancel', cancelBooking);

export default router;
