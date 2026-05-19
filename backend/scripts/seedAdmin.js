require('dotenv').config(); // loads backend/.env when run from backend/ directory
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI is not set. Make sure backend/.env exists and has MONGODB_URI defined.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB');

  const email = process.env.ADMIN_EMAIL || 'admin@abcelectronics.market';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123!';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('ℹ️   Admin user already exists. Skipping seed.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    fullName: 'Super Admin',
    businessName: 'ABCElectronics.market',
    email,
    mobileNumber: '+000000000',
    passwordHash,
    userType: 'Retailer',
    role: 'admin',
    isEmailVerified: true,
    status: 'active',
  });

  console.log(`✅  Admin user created: ${email}`);
  console.log(`🔑  Password: ${password}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
