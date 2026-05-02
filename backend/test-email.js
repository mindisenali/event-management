import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ override: true });


const testEmail = async () => {
  console.log('Testing Email Settings...');
  console.log(`User: ${process.env.EMAIL_USER}`);
  console.log(`Pass: ${process.env.EMAIL_PASS ? '********' : 'NOT FOUND'}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Success! Your email settings are correct.');
    
    await transporter.sendMail({
      from: `"Eventify Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Eventify - Email Connection Test',
      text: 'If you see this, your email configuration is working perfectly!',
    });
    console.log('✅ Test email sent successfully to yourself.');
  } catch (error) {
    console.error('❌ Failed! Error details:');
    console.error(error);
  }
};

testEmail();
