import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const bookingSchema = mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    tier: {
      type: String,
      default: 'Normal',
    },

    totalAmount: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    stripePaymentIntentId: String,
    stripeSessionId: String,
    bookingCode: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'pending',
    },
    qrCode: String,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
