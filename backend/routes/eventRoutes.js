import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  publishEvent,
  cancelEvent,
  getPublicStats,
} from '../controllers/eventController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats/public', getPublicStats);

router
  .route('/')
  .get(getEvents)
  .post(protect, restrictTo('admin', 'superadmin', 'user'), createEvent);

router.get('/my', protect, restrictTo('admin', 'superadmin', 'user'), getMyEvents);

router
  .route('/:id')
  .get(getEventById)
  .patch(protect, restrictTo('admin', 'superadmin', 'user'), updateEvent)
  .delete(protect, restrictTo('admin', 'superadmin', 'user'), deleteEvent);

router.patch('/:id/publish', protect, restrictTo('admin', 'superadmin', 'user'), publishEvent);
router.patch('/:id/cancel', protect, restrictTo('admin', 'superadmin', 'user'), cancelEvent);


export default router;

