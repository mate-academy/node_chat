import { Sequelize } from 'sequelize';
import 'dotenv/config.js';

export const client = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PSW,
  {
    host: process.env.HOST,
    dialect: 'postgres',
  }
);
