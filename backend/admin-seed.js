import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ override: true });


const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@eventify.com';
    const adminPassword = 'admin123'; // 8 characters, satisfies minlength

    // Delete existing admin to start fresh
    await User.deleteMany({ email: adminEmail });

    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin',
      isApproved: true,
      emailVerified: true,
      isActive: true,
    });

    console.log('Admin account (RE)created successfully!');
    console.log('-----------------------------------');
    console.log('Admin Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-----------------------------------');

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
