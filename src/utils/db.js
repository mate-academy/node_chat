import 'dotenv/config';
import { Sequelize } from 'sequelize';

export const client = new Sequelize({
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASSWORD,
  dialect: 'postgres',
});
