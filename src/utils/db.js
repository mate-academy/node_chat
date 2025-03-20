/* eslint-disable no-console */

import { Sequelize } from 'sequelize';
import chalk from 'chalk';

import 'dotenv/config';

export const client = new Sequelize({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: (msg) => console.log(chalk.cyan('Sequelize:'), chalk.yellow(msg)),
});
