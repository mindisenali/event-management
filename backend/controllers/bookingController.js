import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import APIFeatures from '../utils/apiFeatures.js';
import sendEmail from '../utils/sendEmail.js';
import Notification from '../models/Notification.js';

// @desc    Initiate booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  const { eventId, seats } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats < seats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const totalAmount = event.price * seats;

    const booking = await Booking.create({
      event: eventId,
      user: req.user._id,
      seats,
      totalAmount,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('event');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event user');

    if (booking) {
      if (booking.user._id.toString() !== req.user._id.toString() && req.user.role === 'user') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (booking) {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Check if event is > 24h away
      const eventDate = new Date(booking.event.date);
      const now = new Date();
      const diffHours = (eventDate - now) / (1000 * 60 * 60);

      if (diffHours < 24) {
        return res.status(400).json({ message: 'Cannot cancel booking within 24h of event' });
      }

      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      await booking.save();

      // Restore seats
      const event = await Event.findById(booking.event._id);
      event.availableSeats += booking.seats;
      await event.save();

      // TODO: Auto-refund via Stripe if paid

      res.json({ message: 'Booking cancelled successfully' });
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const features = new APIFeatures(Booking.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const bookings = await features.query.populate('event user');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin)
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user event');

    if (booking) {
      const oldStatus = booking.status;
      booking.status = req.body.status || booking.status;
      await booking.save();

      // Send email and notification if booking is confirmed
      if (req.body.status === 'confirmed' && oldStatus !== 'confirmed') {
        // Create in-app notification
        await Notification.create({
          recipient: booking.user._id,
          title: 'Booking Approved! 🎉',
          message: `Your booking for "${booking.event.title}" has been approved. View your ticket now!`,
          type: 'success',
          link: '/dashboard'
        });

        try {
          const html = `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
              <div style="background-color: #6d28d9; padding: 40px; color: #ffffff; text-align: center;">
                <h1 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase;">EVENTIFY</h1>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.2em;">Official Entry Pass</p>
              </div>

              <div style="padding: 40px;">
                <div style="margin-bottom: 30px;">
                  <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 800; text-transform: uppercase;">${booking.event.title}</h2>
                  <p style="margin: 5px 0 0 0; color: #64748b; font-size: 16px;">${new Date(booking.event.date).toLocaleDateString()} | ${booking.event.startTime}</p>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between;">
                  <div style="flex: 1;">
                    <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Attendee</p>
                    <p style="margin: 2px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 700;">${booking.user.name}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Pass Type</p>
                    <p style="margin: 2px 0 0 0; color: #6d28d9; font-size: 18px; font-weight: 700;">${booking.seats} x ${booking.tier}</p>
                  </div>
                </div>

                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qrco.de/bgmJmb" alt="QR Code" style="width: 150px; height: 150px; border: 10px solid #f8fafc; border-radius: 15px;" />
                  <p style="margin: 15px 0 0 0; font-family: monospace; font-size: 14px; font-weight: 700; color: #64748b; letter-spacing: 0.2em;">#${booking.bookingCode.toUpperCase()}</p>
                </div>

                <div style="border-top: 1px solid #e2e8f0; pt: 30px; margin-top: 30px; text-align: center;">
                  <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${booking.user.name}, your booking has been approved! Present this digital ticket at the entrance for entry.</p>
                  <p style="color: #ef4444; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 20px;">Non-refundable Policy Applies</p>
                </div>
              </div>

              <div style="background-color: #f1f5f9; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em;">Powered by Eventify Infrastructure</p>
              </div>
            </div>
          `;

          await sendEmail({
            email: booking.user.email,
            subject: `Confirmed: Your Ticket for ${booking.event.title}`,
            html: html,
          });
        } catch (emailError) {
          console.error('Email send failed:', emailError);
        }
      }

      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

