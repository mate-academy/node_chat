/* eslint-disable no-console */
const mongoose = require('mongoose');

require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log('✅ Connected to MongoDB via Mongoose!');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
