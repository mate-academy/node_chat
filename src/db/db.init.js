import { client } from './db.js';
import '../data/associations.js';

export const dbInit = async () => {
  await client.authenticate();
  // eslint-disable-next-line no-console
  console.log('✅ Database connected');

  await client.sync({ alter: true });
  // eslint-disable-next-line no-console
  console.log('✅ Tables synced');

  const tables = await client.getQueryInterface().showAllTables();

  // eslint-disable-next-line no-console
  console.log(tables);
};
