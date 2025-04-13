const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 