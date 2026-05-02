import User from '../models/User.js';
import APIFeatures from '../utils/apiFeatures.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getUsers = async (req, res) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;
    const total = await User.countDocuments();

    res.json({
      status: 'success',
      results: users.length,
      total,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/SuperAdmin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PATCH /api/users/:id/toggle
// @access  Private/SuperAdmin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isActive = !user.isActive;
      await user.save();
      res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hard delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'superadmin') {
        return res.status(400).json({ message: 'Cannot delete superadmin' });
      }
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending admins
// @route   GET /api/admins/pending
// @access  Private/SuperAdmin
export const getPendingAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', isApproved: false });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve admin
// @route   PATCH /api/admins/:id/approve
// @access  Private/SuperAdmin
export const approveAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (admin && admin.role === 'admin') {
      admin.isApproved = true;
      await admin.save();
      res.json({ message: 'Admin approved successfully' });
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject and delete admin
// @route   PATCH /api/admins/:id/reject
// @access  Private/SuperAdmin
export const rejectAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (admin && admin.role === 'admin') {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'Admin rejected and deleted' });
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
