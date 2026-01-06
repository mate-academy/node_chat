import client from './src/db/db.js';
import './src/model/model.js';

await client.sync({ force: true });

// eslint-disable-next-line no-console
console.log('Database synced');
process.exit(0);
