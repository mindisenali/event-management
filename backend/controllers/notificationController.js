import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipient: null }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create manual notification (Admin)
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = async (req, res) => {
  try {
    console.log('[Notification] Request Body:', req.body);
    const { title, message, type, recipient, link } = req.body;
    
    // Ensure recipient is a valid ObjectId or null/undefined
    const notificationData = {
      title,
      message,
      type: type || 'info',
      link
    };

    if (recipient && recipient.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(recipient)) {
        notificationData.recipient = recipient;
      } else {
        return res.status(400).json({ message: 'Invalid Recipient ID format' });
      }
    }

    const notification = await Notification.create(notificationData);
    console.log('[Notification] Created:', notification._id);
    res.status(201).json(notification);
  } catch (error) {
    console.error('[Notification Error]:', error.message);
    res.status(400).json({ message: error.message });
  }
};
