'use strict';
import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const client = new Sequelize('postgres', 'postgres', '29052009', {
  host: 'localhost',
  dialect: 'postgres',
});
