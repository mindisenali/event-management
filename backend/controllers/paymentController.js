import stripeLib from 'stripe';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import Notification from '../models/Notification.js';

let stripeInstance;
const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = new stripeLib(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};


// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  const { eventId, seats, tier } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event find error' });
    }

    const selectedTier = event.ticketTiers?.find(t => t.name === (tier || 'Normal')) || { price: event.price || 0 };
    const pricePerSeat = Number(selectedTier.price) || 0;

    if (event.availableSeats < seats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const booking = await Booking.create({
      event: eventId,
      user: req.user._id,
      seats,
      tier: tier || 'Normal',
      totalAmount: pricePerSeat * seats,
      status: 'pending',
    });

    const totalAmountCents = Math.round(pricePerSeat * seats * 100);

    // Handle Free Bookings
    if (totalAmountCents === 0) {
       booking.status = 'pending';
       booking.paymentStatus = 'paid'; // Free is essentially paid
       await booking.save();

       // Notify Admins
       const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
       const populatedBooking = await Booking.findById(booking._id).populate('event user');
       const adminNotifications = admins.map(admin => ({
         recipient: admin._id,
         title: 'New Free Booking! 🎁',
         message: `${populatedBooking.user.name} has just reserved ${populatedBooking.seats} free seats for "${populatedBooking.event.title}". Review required.`,
         type: 'info',
         link: '/admin'
       }));
       await Notification.insertMany(adminNotifications);

       return res.json({ 
         sessionId: 'free', 
         url: `${process.env.CLIENT_URL}/booking-success?free=true&bookingId=${booking._id}` 
       });
    }

    // Stripe has a minimum amount (approx $0.50). For LKR this is around 160 LKR.
    if (totalAmountCents > 0 && totalAmountCents < 16000) { // Using 160 LKR as safe minimum
      return res.status(400).json({ 
        message: `The total amount (LKR ${pricePerSeat * seats}) is below Stripe's minimum transaction limit. Please book more seats or contact the organizer.` 
      });
    }

    const session = await getStripe().checkout.sessions.create({

      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
              product_data: {
                name: `${event.title} - ${tier || 'Normal'} Ticket`,
                images: event.coverImage && event.coverImage.startsWith('http') ? [event.coverImage] : [],
              },
            unit_amount: pricePerSeat * 100, // In cents
          },
          quantity: seats,
        },
      ],

      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/booking-cancelled`,
      customer_email: req.user.email,
      client_reference_id: booking._id.toString(),
      metadata: {
        bookingId: booking._id.toString(),
        eventId: eventId,
        seats: seats,
      },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[Stripe Session Error]:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment
// @route   GET /api/payments/verify/:sessionId
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const session = await getStripe().checkout.sessions.retrieve(req.params.sessionId);


    if (session.payment_status === 'paid') {
      const booking = await Booking.findOne({ stripeSessionId: req.params.sessionId }).populate('event user');
      
      if (booking && booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid';
        // booking.status remains 'pending' until admin approves
        await booking.save();

        // Reduce available seats (even if pending, seats should be reserved)
        const event = await Event.findById(booking.event);
        event.availableSeats -= booking.seats;
        await event.save();

        // Notify Admins
        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
        const adminNotifications = admins.map(admin => ({
          recipient: admin._id,
          title: 'New Booking Alert! 🎟️',
          message: `${booking.user.name} has just booked ${booking.seats} seats for "${booking.event.title}". Please review and approve.`,
          type: 'info',
          link: '/admin'
        }));
        await Notification.insertMany(adminNotifications);
      }
      
      res.json({ status: 'paid', booking });
    } else {
      res.json({ status: 'unpaid' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.client_reference_id;

    const booking = await Booking.findById(bookingId).populate('event user');
    if (booking && booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid';
      // booking.status remains 'pending' until admin approves
      await booking.save();

      const eventObj = await Event.findById(booking.event._id);
      eventObj.availableSeats -= booking.seats;
      await eventObj.save();

      // Notify Admins
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      const adminNotifications = admins.map(admin => ({
        recipient: admin._id,
        title: 'New Booking Alert! 🎟️',
        message: `${booking.user.name} has just booked ${booking.seats} seats for "${booking.event.title}". Please review and approve.`,
        type: 'info',
        link: '/admin'
      }));
      await Notification.insertMany(adminNotifications);
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    // Handle refund logic...
  }

  res.json({ received: true });
};
