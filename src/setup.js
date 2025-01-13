/* eslint-disable no-console */
import 'dotenv/config';
import db from './models/index.js';

const isDevelopment = process.env.NODE_ENV === 'development';

db.sequelize
  .sync({ force: isDevelopment })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });
