import dotenv from 'dotenv';
import * as mongoose from 'mongoose';

dotenv.config();

async function connectDb() {
  try {
    await mongoose.connect(
      process.env.DB_URL,
    );
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error connecting to MongoDB', error);
  }
}

export default connectDb;
