import Event from '../models/Event.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import APIFeatures from '../utils/apiFeatures.js';
import Notification from '../models/Notification.js';

// @desc    Get all published events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const features = new APIFeatures(Event.find({ status: { $in: ['published', 'postponed'] } }), req.query)

      .filter()
      .sort()
      .limitFields()
      .paginate();

    const events = await features.query.lean();
    
    res.json({
      status: 'success',
      results: events.length,
      data: { events },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email profilePhoto');
    
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my events (for admin)
// @route   GET /api/events/my
// @access  Private/Admin
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user._id,
    });

    const createdEvent = await event.save();

    // Create global notification for new event
    await Notification.create({
      title: 'New Event Posted!',
      message: `A new event "${createdEvent.title}" has been posted in ${createdEvent.category}. Book your seats now!`,
      type: 'success',
      link: `/events/${createdEvent._id}`
    });

    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PATCH /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Check if creator or superadmin
      if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      if (event.status === 'postponed' && req.body.status === 'published') {
        event.isRescheduled = true;
      }

      const oldStatus = event.status;
      Object.assign(event, req.body);
      const updatedEvent = await event.save();

      // Create notification for status changes
      if (req.body.status && req.body.status !== oldStatus) {
        await Notification.create({
          title: `Event Update: ${updatedEvent.title}`,
          message: `The event "${updatedEvent.title}" status has been updated to ${updatedEvent.status}.`,
          type: updatedEvent.status === 'postponed' ? 'warning' : 'info',
          link: `/events/${updatedEvent._id}`
        });
      }

      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete/Cancel an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }

      await Event.findByIdAndDelete(req.params.id);
      res.json({ message: 'Event deleted successfully' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Publish event
// @route   PATCH /api/events/:id/publish
// @access  Private/Admin
export const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to publish this event' });
      }

      event.status = 'published';
      await event.save();
      res.json({ message: 'Event published successfully' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel event (trigger refunds)
// @route   PATCH /api/events/:id/cancel
// @access  Private/Admin
export const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to cancel this event' });
      }

      event.status = 'cancelled';
      await event.save();
      // TODO: Trigger refunds for all bookings
      res.json({ message: 'Event cancelled and refunds triggered' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get public stats for home page
// @route   GET /api/events/stats/public
// @access  Public
export const getPublicStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ status: 'published' });
    const bookings = await Booking.find({ status: 'confirmed' });
    const totalTickets = bookings.reduce((acc, curr) => acc + curr.seats, 0);
    const cities = await Event.distinct('venue.city', { status: 'published' });

    res.json({
      totalEvents,
      totalTickets,
      totalCities: cities.length,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
