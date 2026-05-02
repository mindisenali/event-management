import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import APIFeatures from '../utils/apiFeatures.js';


// @desc    Submit review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  const { eventId, rating, comment, type = 'event' } = req.body;
  console.log(`[Review] Creating ${type} review by user: ${req.user._id}`);

  try {
    const reviewData = {
      user: req.user._id,
      rating,
      comment,
      type,
    };

    if (type === 'event') {
      if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: 'Invalid or missing event ID' });
      }
      reviewData.event = eventId;
    }

    const review = await Review.create(reviewData);

    // Recalculate average rating for the event only if it's an event review
    if (type === 'event') {
      const Event = mongoose.model('Event');
      const reviews = await Review.find({ event: eventId });
      const numReviews = reviews.length;
      const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

      await Event.findByIdAndUpdate(eventId, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        numReviews,
      });
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('[Review Error]', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted a review for this' });
    }
    res.status(400).json({ message: error.message });
  }
};



// @desc    Get reviews for an event
// @route   GET /api/reviews/event/:eventId
// @access  Public
export const getEventReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId, isVisible: true }).populate('user', 'name profilePhoto');
    
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    res.json({
      reviews,
      avgRating: avgRating || 0,
      total: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my reviews
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).populate('event', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PATCH /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Within 48h check
      const createdAt = new Date(review.createdAt);
      const now = new Date();
      const diffHours = (now - createdAt) / (1000 * 60 * 60);

      if (diffHours > 48) {
        return res.status(400).json({ message: 'Cannot edit review after 48 hours' });
      }

      review.rating = req.body.rating || review.rating;
      review.comment = req.body.comment || review.comment;
      await review.save();

      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      if (review.user.toString() !== req.user._id.toString() && req.user.role === 'user') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await Review.findByIdAndDelete(req.params.id);
      res.json({ message: 'Review deleted successfully' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all public reviews for home page
// @route   GET /api/reviews
// @access  Public
export const getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isVisible: true })
      .populate('user', 'name profilePhoto')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle review visibility (Admin)

// @route   PATCH /api/reviews/:id/visibility
// @access  Private/Admin
export const toggleReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      review.isVisible = !review.isVisible;
      await review.save();
      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
