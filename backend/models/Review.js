import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['event', 'platform'],
      default: 'platform',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraints: 
// 1. One user can only review a specific event once
// 2. One user can only review the platform once
reviewSchema.index({ event: 1, user: 1, type: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;

