const mongoose = require('mongoose');

// Exit application on error
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(1);
});

// Log when connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// Log when connection is connected
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 