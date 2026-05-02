import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = 'superadmin@ems.com';
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (!existingSuperAdmin) {
      const superAdmin = new User({
        name: 'Super Admin',
        email: superAdminEmail,
        password: 'SuperAdmin@123',
        role: 'superadmin',
        isApproved: true,
        isActive: true,
        emailVerified: true,
      });

      await superAdmin.save();
      console.log('SuperAdmin seeded successfully');
    } else {
      // Force reset password to fix double-hashing from previous bug
      existingSuperAdmin.password = 'SuperAdmin@123';
      await existingSuperAdmin.save();
      console.log('SuperAdmin password reset successfully');
    }

  } catch (error) {
    console.error('Error seeding SuperAdmin:', error.message);
  }
};

export default seedSuperAdmin;
