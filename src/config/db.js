'use strict';

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    process.stdout.write('✅ MongoDB Connected successfully!\n');
  } catch (err) {
    process.stderr.write(`❌ MongoDB connection error: ${err.message}\n`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
