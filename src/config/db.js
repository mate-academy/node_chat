const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    process.stdout.write('MongoDB connected\n');
  } catch (error) {
    process.stderr.write(`MongoDB connection error: ${error.stack || error}\n`);
    process.exit(1);
  }
}

module.exports = connectDB;
