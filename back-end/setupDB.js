import { sequelize } from './src/utils/db.js';
import './src/models/index.js';

sequelize.sync({ alter: true }).then(() => {
  // eslint-disable-next-line no-console
  console.log('Database synced');
});
