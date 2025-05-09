import { Sequelize } from 'sequelize';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

export const client = new Sequelize({
  host: DB_HOST || 'localhost',
  username: DB_USER || 'postgres',
  password: DB_PASSWORD || '12345qwert',
  database: DB_DATABASE || 'postgres',
  dialect: 'postgres',
});
