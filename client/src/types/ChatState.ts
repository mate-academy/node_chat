import { type Room } from './roomsResponce';
import { type User } from './userResponce';

export interface ChatState {
  rooms: Room[];
  users: User[];
}
