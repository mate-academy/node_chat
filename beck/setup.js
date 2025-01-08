/* eslint-disable no-console */
import 'dotenv/config';
import { sequelize } from './src/models/index.js';

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database & tables synced');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });
