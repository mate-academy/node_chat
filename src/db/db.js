import { Sequelize } from 'sequelize';

export const client = new Sequelize({
  database: 'postgres',
  username: 'postgres',
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  password: 'Rerlol100',
});
