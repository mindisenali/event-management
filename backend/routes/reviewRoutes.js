import express from 'express';
import {
  createReview,
  getEventReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  toggleReviewVisibility,
  getPublicReviews,
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPublicReviews);
router.get('/event/:eventId', getEventReviews);


router.use(protect);

router.post('/', createReview);
router.get('/my', getMyReviews);

router
  .route('/:id')
  .patch(updateReview)
  .delete(deleteReview);

router.patch('/:id/visibility', restrictTo('admin', 'superadmin'), toggleReviewVisibility);

export default router;
