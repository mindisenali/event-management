import mongoose from 'mongoose';

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['concert', 'festival', 'tech', 'theatre', 'family', 'other'],
      required: true,
    },
    coverImage: {
      type: String,
    },
    venue: {
      name: String,
      address: String,
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: String,
    endTime: String,
    totalSeats: {
      type: Number,
      required: [true, 'Total seats are required'],
    },
    availableSeats: {
      type: Number,
    },
    organizedBy: {
      type: String,
      default: 'Eventify Management',
    },
    ticketTiers: [
      {
        name: { type: String, enum: ['Normal', 'VIP'], default: 'Normal' },
        price: { type: Number, required: true },
      }
    ],
    price: {
      type: Number,
      required: [true, 'Base ticket price is required'],
    },
    status: {

      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
      default: 'draft',
    },
    isRescheduled: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set availableSeats equal to totalSeats for new events
eventSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;

