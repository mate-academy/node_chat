import { Sequelize } from 'sequelize';
import 'dotenv/config';

const {
  POSTGRES_DB = 'postgres',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = '',
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = 5432,
  POSTGRES_DIALECT = 'postgres',
} = process.env;

export const sequelize = new Sequelize(
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  {
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT),
    dialect: POSTGRES_DIALECT,
    logging: false,
  },
);
