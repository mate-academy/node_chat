'use strict';

import { Sequelize } from 'sequelize';
import utils from 'util';

import 'dotenv/config';
global.TextEncoder = utils.TextEncoder;

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

const client = new Sequelize({
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: Number(POSTGRES_PORT) || 5432,
  password: POSTGRES_PASSWORD || '123',
});

export default client;
