const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅  MongoDB connected');
      return;
    } catch (err) {
      attempt++;
      console.error(`❌  MongoDB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxRetries) {
        console.error('💀  Max retries reached. Exiting.');
        process.exit(1);
      }
      // Exponential backoff
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
};

module.exports = connectDB;