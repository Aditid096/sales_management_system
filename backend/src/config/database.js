const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set. Please check your .env file.');
    }

    // Log connection attempt (hide credentials)
    const uriForLogging = process.env.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
    console.log(`🔄 Attempting to connect to: ${uriForLogging}`);

    // Connect with modern options (removed deprecated ones)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔧 Ready State: ${conn.connection.readyState}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Common solutions:');
    console.error('   1. Check your .env file exists and has valid MONGODB_URI');
    console.error('   2. Verify your MongoDB Atlas cluster is running');
    console.error('   3. Check your network access settings in MongoDB Atlas');
    console.error('   4. Ensure your IP address is whitelisted');
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;