import { client } from './src/utils/db.js';
import './src/models/index.js';

client.sync({ alter: true }).then(() => {
  // eslint-disable-next-line no-console
  console.log('Database synced');
});
