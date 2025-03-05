/* eslint-disable no-unused-vars */
import dotenv from 'dotenv';
import { client } from './src/utils/db.js';

dotenv.config();

client.sync({ force: true });
