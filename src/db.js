import 'dotenv/config';
import { Sequelize } from 'sequelize';

export const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});
