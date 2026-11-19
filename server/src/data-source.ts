import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Message } from './entities/Message';
import { Room } from './entities/Room';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  entities: [User, Room, Message],
});
